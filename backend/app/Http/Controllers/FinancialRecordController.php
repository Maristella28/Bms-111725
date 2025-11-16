<?php

namespace App\Http\Controllers;

use App\Models\FinancialRecord;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class FinancialRecordController extends Controller
{
    // List all records with optional filters
    public function index(Request $request)
    {
        $query = FinancialRecord::query();
        if ($request->has('type')) $query->where('type', $request->type);
        if ($request->has('category')) $query->where('category', $request->category);
        if ($request->has('status')) $query->where('status', $request->status);
        if ($request->has('date_from')) $query->where('date', '>=', $request->date_from);
        if ($request->has('date_to')) $query->where('date', '<=', $request->date_to);
        return response()->json($query->orderBy('date', 'desc')->get());
    }

    // Show a single record
    public function show($id)
    {
        $record = FinancialRecord::findOrFail($id);
        return response()->json($record);
    }

    // Store a new record
    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'type' => 'required|in:Income,Expense',
            'category' => 'required|string|max:255',
            'amount' => 'required|numeric',
            'description' => 'required|string',
            'reference' => 'nullable|string|max:255',
            'approved_by' => 'nullable|string|max:255',
            'status' => 'nullable|in:Pending,Completed,Rejected',
            'attachment' => 'nullable|file|max:2048',
        ]);
        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('financial_attachments', 'public');
            $validated['attachment'] = '/storage/' . $path;
        }
        $record = FinancialRecord::create($validated);
        
        // Log financial record creation
        $user = Auth::user();
        if ($user) {
            $userRole = $user->role;
            $type = $record->type === 'Income' ? 'income' : 'expense';
            $amount = '₱' . number_format($record->amount, 2);
            $description = $userRole === 'admin'
                ? "Admin {$user->name} created {$type} record: {$record->category} ({$amount})"
                : ($userRole === 'staff'
                    ? "Staff {$user->name} created {$type} record: {$record->category} ({$amount})"
                    : "{$type} record created: {$record->category} ({$amount})");
            
            ActivityLogService::log(
                "financial_{$type}_created",
                $record,
                null,
                $record->toArray(),
                $description,
                $request
            );
        }
        
        return response()->json($record, 201);
    }

    // Update a record
    public function update(Request $request, $id)
    {
        $record = FinancialRecord::findOrFail($id);
        $validated = $request->validate([
            'date' => 'sometimes|required|date',
            'type' => 'sometimes|required|in:Income,Expense',
            'category' => 'sometimes|required|string|max:255',
            'amount' => 'sometimes|required|numeric',
            'description' => 'sometimes|required|string',
            'reference' => 'nullable|string|max:255',
            'approved_by' => 'nullable|string|max:255',
            'status' => 'nullable|in:Pending,Completed,Rejected',
            'attachment' => 'nullable|file|max:2048',
        ]);
        if ($request->hasFile('attachment')) {
            // Delete old file if exists
            if ($record->attachment && Storage::disk('public')->exists(str_replace('/storage/', '', $record->attachment))) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $record->attachment));
            }
            $path = $request->file('attachment')->store('financial_attachments', 'public');
            $validated['attachment'] = '/storage/' . $path;
        }
        $oldValues = $record->getOriginal();
        $record->update($validated);
        
        // Log financial record update
        $user = Auth::user();
        if ($user) {
            $userRole = $user->role;
            $type = $record->type === 'Income' ? 'income' : 'expense';
            $description = $userRole === 'admin'
                ? "Admin {$user->name} updated {$type} record: {$record->category}"
                : ($userRole === 'staff'
                    ? "Staff {$user->name} updated {$type} record: {$record->category}"
                    : "{$type} record updated: {$record->category}");
            
            ActivityLogService::logUpdated($record, $oldValues, $request);
        }
        
        return response()->json($record);
    }

    // Delete a record
    public function destroy($id)
    {
        $record = FinancialRecord::findOrFail($id);
        if ($record->attachment && Storage::disk('public')->exists(str_replace('/storage/', '', $record->attachment))) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $record->attachment));
        }
        
        // Log financial record deletion
        $user = Auth::user();
        if ($user) {
            ActivityLogService::logDeleted($record, request());
        }
        
        $record->delete();
        return response()->json(['message' => 'Record deleted successfully.']);
    }

    // Get all receipts from documents and assets
    public function getAllReceipts(Request $request)
    {
        try {
            $receipts = [];
            
            // Get document receipts
            $documentRequests = \App\Models\DocumentRequest::where('payment_status', 'paid')
                ->with(['user', 'resident.profile', 'paidDocument'])
                ->whereHas('paidDocument')
                ->get();
            
            foreach ($documentRequests as $docRequest) {
                $residentName = 'Unknown';
                $residentId = 'N/A';
                
                if ($docRequest->resident) {
                    // Check if resident has profile relationship loaded
                    if (isset($docRequest->resident->profile) && $docRequest->resident->profile) {
                        $residentName = trim(($docRequest->resident->profile->first_name ?? '') . ' ' . ($docRequest->resident->profile->last_name ?? ''));
                    } elseif (isset($docRequest->resident->first_name)) {
                        // Fallback to direct resident fields
                        $residentName = trim(($docRequest->resident->first_name ?? '') . ' ' . ($docRequest->resident->last_name ?? ''));
                    }
                    $residentId = $docRequest->resident->resident_id ?? ($docRequest->resident->user_id ?? 'N/A');
                } elseif ($docRequest->user) {
                    $residentName = $docRequest->user->name ?? 'Unknown';
                    $residentId = $docRequest->user->email ?? 'N/A';
                }
                
                if (empty($residentName) || $residentName === ' ') {
                    $residentName = 'Unknown';
                }
                
                $receipts[] = [
                    'id' => $docRequest->id,
                    'type' => 'document',
                    'receipt_number' => $docRequest->paidDocument->receipt_number ?? null,
                    'amount' => floatval($docRequest->payment_amount ?? 0),
                    'date' => $docRequest->paidDocument->payment_date ?? $docRequest->payment_date ?? $docRequest->created_at,
                    'resident_name' => $residentName,
                    'resident_id' => $residentId,
                    'description' => $docRequest->document_type ?? 'Document Request',
                    'request_id' => $docRequest->id,
                    'created_at' => $docRequest->created_at,
                ];
            }
            
            // Get asset receipts
            $assetRequests = \App\Models\AssetRequest::where('payment_status', 'paid')
                ->with(['user', 'resident.profile', 'items.asset'])
                ->whereNotNull('receipt_number')
                ->get();
            
            foreach ($assetRequests as $assetRequest) {
                $residentName = 'Unknown';
                $residentId = 'N/A';
                
                if ($assetRequest->resident) {
                    // Check if resident has profile relationship loaded
                    if (isset($assetRequest->resident->profile) && $assetRequest->resident->profile) {
                        $residentName = trim(($assetRequest->resident->profile->first_name ?? '') . ' ' . ($assetRequest->resident->profile->last_name ?? ''));
                    } elseif (isset($assetRequest->resident->first_name)) {
                        // Fallback to direct resident fields
                        $residentName = trim(($assetRequest->resident->first_name ?? '') . ' ' . ($assetRequest->resident->last_name ?? ''));
                    }
                    $residentId = $assetRequest->resident->resident_id ?? ($assetRequest->resident->user_id ?? 'N/A');
                } elseif ($assetRequest->user) {
                    $residentName = $assetRequest->user->name ?? 'Unknown';
                    $residentId = $assetRequest->user->email ?? 'N/A';
                }
                
                if (empty($residentName) || $residentName === ' ') {
                    $residentName = 'Unknown';
                }
                
                $assetNames = 'Unknown Asset';
                if ($assetRequest->items && $assetRequest->items->count() > 0) {
                    $assetNames = $assetRequest->items->map(function($item) {
                        return $item->asset ? $item->asset->name : 'Unknown';
                    })->filter()->join(', ');
                    if (empty($assetNames)) {
                        $assetNames = 'Unknown Asset';
                    }
                }
                
                $receipts[] = [
                    'id' => $assetRequest->id,
                    'type' => 'asset',
                    'receipt_number' => $assetRequest->receipt_number ?? 'N/A',
                    'amount' => floatval($assetRequest->amount_paid ?? $assetRequest->total_amount ?? 0),
                    'date' => $assetRequest->paid_at ?? $assetRequest->created_at,
                    'resident_name' => $residentName,
                    'resident_id' => $residentId,
                    'description' => 'Asset Rental: ' . $assetNames,
                    'request_id' => $assetRequest->id,
                    'created_at' => $assetRequest->created_at,
                ];
            }
            
            // Sort by date descending
            usort($receipts, function($a, $b) {
                return strtotime($b['date']) - strtotime($a['date']);
            });
            
            return response()->json($receipts);
            
        } catch (\Exception $e) {
            \Log::error('Error fetching all receipts: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch receipts'], 500);
        }
    }
} 