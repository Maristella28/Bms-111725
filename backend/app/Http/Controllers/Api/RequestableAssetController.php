<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RequestableAsset;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class RequestableAssetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = RequestableAsset::active();

        // Filter by category
        if ($request->has('category') && $request->category !== 'All') {
            $query->byCategory($request->category);
        }

        // Filter by condition
        if ($request->has('condition')) {
            $query->byCondition($request->condition);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search by name or description
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Sort options
        $sortBy = $request->get('sort_by', 'name');
        switch ($sortBy) {
            case 'price-low':
                $query->orderBy('price', 'asc');
                break;
            case 'price-high':
                $query->orderBy('price', 'desc');
                break;
            case 'rating':
                $query->orderBy('rating', 'desc');
                break;
            case 'name':
            default:
                $query->orderBy('name', 'asc');
                break;
        }

        $assets = $query->get();

        return response()->json([
            'success' => true,
            'data' => $assets,
            'message' => 'Assets retrieved successfully'
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'condition' => 'required|in:excellent,good,fair,poor',
            'status' => 'required|in:available,rented,maintenance,unavailable',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'notes' => 'nullable|string',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'existing_images' => 'nullable',
            'created_by' => 'nullable|string|max:255'
        ]);

        // Handle image uploads
        $imagePaths = [];
        
        // Process uploaded files with enhanced error handling
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                try {
                    $path = $image->store('requestable-assets', 'public');
                    $imagePaths[] = '/storage/' . $path;
                } catch (\Exception $e) {
                    \Log::error('Failed to store image', [
                        'filename' => $image->getClientOriginalName(),
                        'error' => $e->getMessage()
                    ]);
                    // Continue with other images even if one fails
                }
            }
        }
        
        // Process existing images (from asset selection)
        if ($request->has('existing_images')) {
            $existingImages = $request->existing_images;
            
            // Handle both string (JSON) and array formats
            if (is_string($existingImages)) {
                $decoded = json_decode($existingImages, true);
                if (is_array($decoded)) {
                    $imagePaths = array_merge($imagePaths, $decoded);
                }
            } elseif (is_array($existingImages)) {
                $imagePaths = array_merge($imagePaths, $existingImages);
            }
        }

        // Create asset data
        $assetData = $validated;
        $assetData['image'] = !empty($imagePaths) ? $imagePaths : null; // Store as array, not JSON string
        unset($assetData['images']);
        unset($assetData['existing_images']);

        $asset = RequestableAsset::create($assetData);
        
        // Log requestable asset creation
        $user = Auth::user();
        if ($user) {
            ActivityLogService::logCreated($asset, $request);
        }

        return response()->json([
            'success' => true,
            'data' => $asset,
            'message' => 'Asset created successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $asset = RequestableAsset::active()->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $asset,
            'message' => 'Asset retrieved successfully'
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $asset = RequestableAsset::findOrFail($id);
        
        // Use EXACTLY the same validation as store method
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'condition' => 'required|in:excellent,good,fair,poor',
            'status' => 'required|in:available,rented,maintenance,unavailable',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'notes' => 'nullable|string',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'existing_images' => 'nullable',
            'created_by' => 'nullable|string|max:255'
        ]);

        // Handle image uploads - EXACTLY like store method
        $imagePaths = [];
        
        // Process uploaded files with enhanced error handling
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                try {
                    $path = $image->store('requestable-assets', 'public');
                    $imagePaths[] = '/storage/' . $path;
                } catch (\Exception $e) {
                    \Log::error('Failed to store image', [
                        'filename' => $image->getClientOriginalName(),
                        'error' => $e->getMessage()
                    ]);
                    // Continue with other images even if one fails
                }
            }
        }
        
        // Process existing images (from asset selection or editing)
        if ($request->has('existing_images')) {
            $existingImages = $request->existing_images;
            
            // Handle both string (JSON) and array formats
            if (is_string($existingImages)) {
                $decoded = json_decode($existingImages, true);
                if (is_array($decoded)) {
                    $imagePaths = array_merge($imagePaths, $decoded);
                }
            } elseif (is_array($existingImages)) {
                $imagePaths = array_merge($imagePaths, $existingImages);
            }
        }

        // Create asset data - EXACTLY like store method
        $assetData = $validated;
        $assetData['image'] = !empty($imagePaths) ? $imagePaths : $asset->image; // Store as array, not JSON string
        unset($assetData['images']);
        unset($assetData['existing_images']);

        $oldValues = $asset->getOriginal();
        $asset->update($assetData);
        
        // Log requestable asset update
        $user = Auth::user();
        if ($user) {
            ActivityLogService::logUpdated($asset, $oldValues, $request);
        }

        return response()->json([
            'success' => true,
            'data' => $asset->fresh(),
            'message' => 'Asset updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $asset = RequestableAsset::findOrFail($id);
        
        // Log requestable asset deletion
        $user = Auth::user();
        if ($user) {
            ActivityLogService::logDeleted($asset, request());
        }
        
        $asset->delete();

        return response()->json([
            'success' => true,
            'message' => 'Asset deleted successfully'
        ]);
    }

    /**
     * Get available assets only
     */
    public function available(): JsonResponse
    {
        $assets = RequestableAsset::available()->get();

        return response()->json([
            'success' => true,
            'data' => $assets,
            'message' => 'Available assets retrieved successfully'
        ]);
    }

    /**
     * Get categories
     */
    public function categories(): JsonResponse
    {
        $categories = RequestableAsset::active()
            ->distinct()
            ->pluck('category')
            ->filter()
            ->values();

        return response()->json([
            'success' => true,
            'data' => $categories,
            'message' => 'Categories retrieved successfully'
        ]);
    }
}
