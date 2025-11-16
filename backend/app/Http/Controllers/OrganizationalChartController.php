<?php

namespace App\Http\Controllers;

use App\Models\BarangayMember;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrganizationalChartController extends Controller
{
    // GET /api/organizational-chart/officials
    public function getOfficials()
    {
        $officials = BarangayMember::where('role', 'official')->get();
        return response()->json($officials);
    }

    // GET /api/organizational-chart/staff
    public function getStaff()
    {
        $staff = BarangayMember::where('role', 'staff')->get();
        return response()->json($staff);
    }

    // POST /api/admin/officials
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'description' => 'nullable|string',
            'role' => 'required|string|in:official,staff',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('officials', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $official = BarangayMember::create($validated);
        
        // Log barangay official creation
        $user = Auth::user();
        if ($user) {
            ActivityLogService::logCreated($official, $request);
        }
        
        return response()->json($official, 201);
    }

    // PUT /api/admin/officials/{id}
    public function update(Request $request, $id)
    {
        $official = BarangayMember::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'description' => 'nullable|string',
            'role' => 'required|string|in:official,staff',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('officials', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $oldValues = $official->getOriginal();
        $official->update($validated);
        
        // Log barangay official update
        $user = Auth::user();
        if ($user) {
            ActivityLogService::logUpdated($official, $oldValues, $request);
        }
        
        return response()->json($official);
    }

    public function destroy($id)
    {
        $official = BarangayMember::findOrFail($id);
        
        // Log barangay official deletion
        $user = Auth::user();
        if ($user) {
            ActivityLogService::logDeleted($official, request());
        }
        
        $official->delete();
        return response()->json(['message' => 'Official deleted successfully.']);
    }
} 