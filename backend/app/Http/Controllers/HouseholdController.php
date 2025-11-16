<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Household;
use App\Models\Resident;
use App\Services\ActivityLogService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class HouseholdController extends Controller
{
    public function index(Request $request)
    {
        $query = Household::with(['head.profile', 'residents.profile']);

        if ($request->has('search')) {
            $q = $request->get('search');
            $query->where('household_no', 'like', "%{$q}%")->orWhere('address', 'like', "%{$q}%");
        }

        $households = $query->orderBy('id', 'desc')->paginate(20);

        // Recalculate members_count from actual database members to ensure accuracy
        foreach ($households->items() as $household) {
            if ($household->household_no) {
                // Count actual residents with this household_no
                $actualCount = Resident::where('household_no', $household->household_no)->count();
                
                // Update members_count if it doesn't match
                if ($household->members_count != $actualCount) {
                    $household->members_count = $actualCount;
                    $household->save();
                }
            }
        }

        return response()->json($households);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'household_no' => 'required|string|unique:households,household_no',
            'address' => 'nullable|string',
            'head_resident_id' => 'nullable|exists:residents,id',
            'members_count' => 'nullable|integer|min:0',
            'members' => 'nullable|array',
            'members.*' => 'exists:residents,id',
        ]);

        // Validate that head is not already a head or member of another household
        if (!empty($data['head_resident_id'])) {
            $headResident = Resident::find($data['head_resident_id']);
            if ($headResident) {
                // Check if resident is already a head of another household
                $existingHead = Household::where('head_resident_id', $data['head_resident_id'])->first();
                if ($existingHead) {
                    return response()->json([
                        'message' => 'This resident is already a Head of Household in another household.',
                        'error' => 'duplicate_head'
                    ], 422);
                }
                
                // Check if resident is already a member of another household
                if (!empty($headResident->household_no)) {
                    $existingHousehold = Household::where('household_no', $headResident->household_no)->first();
                    if ($existingHousehold && $existingHousehold->id) {
                        return response()->json([
                            'message' => 'This resident is already a member of another household.',
                            'error' => 'duplicate_member'
                        ], 422);
                    }
                }
            }
        }

        // Validate that members are not already heads or members of other households
        if (!empty($request->input('members')) && is_array($request->input('members'))) {
            $memberIds = $request->input('members');
            foreach ($memberIds as $memberId) {
                $member = Resident::find($memberId);
                if ($member) {
                    // Check if member is already a head of another household
                    $existingHead = Household::where('head_resident_id', $memberId)->first();
                    if ($existingHead) {
                        return response()->json([
                            'message' => "Resident ID {$memberId} is already a Head of Household in another household.",
                            'error' => 'duplicate_head',
                            'resident_id' => $memberId
                        ], 422);
                    }
                    
                    // Check if member is already a member of another household
                    if (!empty($member->household_no)) {
                        $existingHousehold = Household::where('household_no', $member->household_no)->first();
                        if ($existingHousehold && $existingHousehold->id) {
                            return response()->json([
                                'message' => "Resident ID {$memberId} is already a member of another household.",
                                'error' => 'duplicate_member',
                                'resident_id' => $memberId
                            ], 422);
                        }
                    }
                }
            }
        }

        $data['created_by'] = $request->user() ? $request->user()->id : null;

        $household = Household::create($data);

        // Update household_no for head and all members
        $memberIds = [];
        if (!empty($data['head_resident_id'])) {
            $memberIds[] = $data['head_resident_id'];
        }
        if (!empty($request->input('members')) && is_array($request->input('members'))) {
            $memberIds = array_merge($memberIds, $request->input('members'));
        }
        
        // Remove duplicates
        $memberIds = array_unique($memberIds);
        
        // Update all members' household_no
        if (!empty($memberIds)) {
            Resident::whereIn('id', $memberIds)
                ->update(['household_no' => $household->household_no]);
        }

        // Log household creation
        $user = Auth::user();
        if ($user) {
            ActivityLogService::logCreated($household, $request);
        }

        Log::info('Household created', [
            'household' => $household->toArray(),
            'by' => $data['created_by'],
            'members_updated' => count($memberIds),
        ]);

        return response()->json(['household' => $household], 201);
    }

    public function show($id)
    {
        $household = Household::where('id', $id)
            ->with(['head.profile', 'residents.profile'])
            ->first();
        if (!$household) {
            return response()->json(['message' => 'Household not found'], 404);
        }
        
        // Fetch all residents with the same household_no
        $allResidents = \App\Models\Resident::where('household_no', $household->household_no)
            ->with('profile')
            ->get();
        
        // If we have fewer residents than expected members_count, try to find members by other means
        // This handles cases where members weren't properly linked during household creation
        if ($allResidents->count() < $household->members_count && $household->head_resident_id) {
            // Try to find members by relation_to_head or other indicators
            // For now, we'll just log this discrepancy
            \Log::warning('Household member count mismatch', [
                'household_id' => $id,
                'household_no' => $household->household_no,
                'expected_members' => $household->members_count,
                'found_members' => $allResidents->count(),
                'head_id' => $household->head_resident_id,
            ]);
        }
        
        // Convert to array to ensure it's included in JSON response
        $householdArray = $household->toArray();
        $householdArray['all_members'] = $allResidents->toArray();
        
        \Log::info('Household show', [
            'household_id' => $id,
            'household_no' => $household->household_no,
            'relationship_residents_count' => $household->residents->count(),
            'direct_query_residents_count' => $allResidents->count(),
            'head_id' => $household->head_resident_id,
            'all_members_count' => count($householdArray['all_members']),
            'expected_members_count' => $household->members_count,
        ]);
        
        return response()->json(['household' => $householdArray]);
    }

    public function update(Request $request, $id)
    {
        $household = Household::find($id);
        if (!$household) {
            return response()->json(['message' => 'Household not found'], 404);
        }

        $data = $request->validate([
            'address' => 'nullable|string',
            'head_resident_id' => 'nullable|exists:residents,id',
            'members_count' => 'nullable|integer|min:0',
            'members' => 'nullable|array',
            'members.*' => 'exists:residents,id',
        ]);

        // Validate that head is not already a head or member of another household (if changed)
        if (!empty($data['head_resident_id']) && $data['head_resident_id'] != $household->head_resident_id) {
            $headResident = Resident::find($data['head_resident_id']);
            if ($headResident) {
                // Check if resident is already a head of another household
                $existingHead = Household::where('head_resident_id', $data['head_resident_id'])
                    ->where('id', '!=', $id)
                    ->first();
                if ($existingHead) {
                    return response()->json([
                        'message' => 'This resident is already a Head of Household in another household.',
                        'error' => 'duplicate_head'
                    ], 422);
                }
                
                // Check if resident is already a member of another household
                if (!empty($headResident->household_no)) {
                    $existingHousehold = Household::where('household_no', $headResident->household_no)
                        ->where('id', '!=', $id)
                        ->first();
                    if ($existingHousehold) {
                        return response()->json([
                            'message' => 'This resident is already a member of another household.',
                            'error' => 'duplicate_member'
                        ], 422);
                    }
                }
            }
        }

        // Validate that new members are not already heads or members of other households
        if (!empty($request->input('members')) && is_array($request->input('members'))) {
            $memberIds = $request->input('members');
            $currentMemberIds = Resident::where('household_no', $household->household_no)
                ->pluck('id')
                ->toArray();
            
            foreach ($memberIds as $memberId) {
                // Skip if member is already in this household
                if (in_array($memberId, $currentMemberIds)) {
                    continue;
                }
                
                $member = Resident::find($memberId);
                if ($member) {
                    // Check if member is already a head of another household
                    $existingHead = Household::where('head_resident_id', $memberId)
                        ->where('id', '!=', $id)
                        ->first();
                    if ($existingHead) {
                        return response()->json([
                            'message' => "Resident ID {$memberId} is already a Head of Household in another household.",
                            'error' => 'duplicate_head',
                            'resident_id' => $memberId
                        ], 422);
                    }
                    
                    // Check if member is already a member of another household
                    if (!empty($member->household_no) && $member->household_no != $household->household_no) {
                        $existingHousehold = Household::where('household_no', $member->household_no)
                            ->where('id', '!=', $id)
                            ->first();
                        if ($existingHousehold) {
                            return response()->json([
                                'message' => "Resident ID {$memberId} is already a member of another household.",
                                'error' => 'duplicate_member',
                                'resident_id' => $memberId
                            ], 422);
                        }
                    }
                }
            }
        }

        $oldValues = $household->getOriginal();
        $household->update($data);

        // Get current members of this household (before update)
        $currentMemberIds = Resident::where('household_no', $household->household_no)
            ->pluck('id')
            ->toArray();

        // Update household_no for head and all members
        $memberIds = [];
        // Include head_resident_id from request or existing household
        $headId = !empty($data['head_resident_id']) ? $data['head_resident_id'] : $household->head_resident_id;
        if (!empty($headId)) {
            $memberIds[] = $headId;
        }
        // Include members from request
        if (!empty($request->input('members')) && is_array($request->input('members'))) {
            $memberIds = array_merge($memberIds, $request->input('members'));
        }
        
        // Remove duplicates
        $memberIds = array_unique($memberIds);
        
        // Find members that should be removed (in current list but not in new list)
        $removedMemberIds = array_diff($currentMemberIds, $memberIds);
        
        // Clear household_no for removed members
        if (!empty($removedMemberIds)) {
            Resident::whereIn('id', $removedMemberIds)
                ->update(['household_no' => null]);
        }
        
        // Update all members' household_no
        if (!empty($memberIds)) {
            Resident::whereIn('id', $memberIds)
                ->update(['household_no' => $household->household_no]);
        }

        // Update members_count to match the actual number of members
        // This ensures the count is always accurate after member changes
        $actualMembersCount = count($memberIds);
        if ($household->members_count != $actualMembersCount) {
            $household->members_count = $actualMembersCount;
            $household->save();
        }

        // Refresh the household model to get the latest data
        $household->refresh();

        // Log household update
        $user = Auth::user();
        if ($user) {
            ActivityLogService::logUpdated($household, $oldValues, $request);
        }

        Log::info('Household updated', [
            'household' => $household->toArray(),
            'by' => $request->user() ? $request->user()->id : null,
            'members_updated' => count($memberIds),
            'actual_members_count' => $actualMembersCount,
        ]);

        return response()->json(['household' => $household]);
    }

    public function syncMembers($id)
    {
        $household = Household::find($id);
        if (!$household) {
            return response()->json(['message' => 'Household not found'], 404);
        }

        // Get all residents that should be members of this household
        // First, get residents with matching household_no
        $members = \App\Models\Resident::where('household_no', $household->household_no)
            ->pluck('id')
            ->toArray();

        // If we have a head, ensure they're included
        if ($household->head_resident_id && !in_array($household->head_resident_id, $members)) {
            $members[] = $household->head_resident_id;
        }

        // Update all members' household_no
        if (!empty($members)) {
            \App\Models\Resident::whereIn('id', $members)
                ->update(['household_no' => $household->household_no]);
        }

        \Log::info('Household members synced', [
            'household_id' => $id,
            'household_no' => $household->household_no,
            'members_synced' => count($members),
        ]);

        return response()->json([
            'message' => 'Household members synced successfully',
            'members_count' => count($members)
        ]);
    }

    public function destroy($id)
    {
        $household = Household::find($id);
        if (!$household) {
            return response()->json(['message' => 'Household not found'], 404);
        }

        // Log household deletion
        $user = Auth::user();
        if ($user) {
            ActivityLogService::logDeleted($household, request());
        }

        $household->delete();

        return response()->json(['message' => 'Household deleted']);
    }
}
