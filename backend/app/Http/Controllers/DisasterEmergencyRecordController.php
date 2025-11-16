<?php

namespace App\Http\Controllers;

use App\Models\DisasterEmergencyRecord;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DisasterEmergencyRecordController extends Controller
{
    // List all records
    public function index()
    {
        return response()->json(DisasterEmergencyRecord::orderBy('date', 'desc')->get());
    }

    // Show a single record
    public function show($id)
    {
        $record = DisasterEmergencyRecord::findOrFail($id);
        return response()->json($record);
    }

    // Store a new record
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string|max:255',
            'date' => 'required|date',
            'location' => 'required|string|max:255',
            'description' => 'required|string',
            'actions_taken' => 'nullable|string',
            'casualties' => 'nullable|string',
            'reported_by' => 'nullable|string|max:255',
        ]);
        $record = DisasterEmergencyRecord::create($validated);
        
        // Log disaster/emergency record creation
        $user = Auth::user();
        if ($user) {
            ActivityLogService::logCreated($record, $request);
        }
        
        return response()->json($record, 201);
    }

    // Update a record
    public function update(Request $request, $id)
    {
        $record = DisasterEmergencyRecord::findOrFail($id);
        $validated = $request->validate([
            'type' => 'sometimes|required|string|max:255',
            'date' => 'sometimes|required|date',
            'location' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'actions_taken' => 'nullable|string',
            'casualties' => 'nullable|string',
            'reported_by' => 'nullable|string|max:255',
        ]);
        $oldValues = $record->getOriginal();
        $record->update($validated);
        
        // Log disaster/emergency record update
        $user = Auth::user();
        if ($user) {
            ActivityLogService::logUpdated($record, $oldValues, $request);
        }
        
        return response()->json($record);
    }

    // Delete a record
    public function destroy($id)
    {
        $record = DisasterEmergencyRecord::findOrFail($id);
        
        // Log disaster/emergency record deletion
        $user = Auth::user();
        if ($user) {
            ActivityLogService::logDeleted($record, request());
        }
        
        $record->delete();
        return response()->json(['message' => 'Record deleted successfully.']);
    }
} 