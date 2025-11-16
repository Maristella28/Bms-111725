<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use App\Models\StaffProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class AdminProfileController extends Controller
{
    // Get the authenticated admin's profile (now using staff profile)
    public function show()
    {
        $user = Auth::user();
        
        // Find staff record for this user
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff) {
            return response()->json(['message' => 'Staff record not found'], 404);
        }
        
        $profile = $staff->profile;
        
        return response()->json([
            'staff' => $staff,
            'profile' => $profile,
            'profile_completed' => $profile ? $profile->profile_completed : false
        ]);
    }

    // Create or update the authenticated admin's profile (now using staff profile)
    public function update(Request $request)
    {
        $user = Auth::user();
        
        // Debug: Log the incoming request data
        Log::info('AdminProfile update request', [
            'user_id' => $user->id,
            'request_data' => $request->all(),
            'content_type' => $request->header('Content-Type'),
        ]);
        
        try {
            // Find staff record for this user
            $staff = Staff::where('user_id', $user->id)->first();
            
            if (!$staff) {
                return response()->json(['message' => 'Staff record not found'], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'avatar' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
                'phone' => 'nullable|string|max:50',
                'address' => 'nullable|string',
                'position' => 'nullable|string|max:100',
                'department' => 'nullable|string|max:255',
                'birthdate' => 'nullable|date',
                'gender' => 'nullable|string|in:Male,Female',
                'civil_status' => 'nullable|string|in:Single,Married,Widowed,Divorced,Separated',
            ]);
            
            if ($validator->fails()) {
                Log::error('AdminProfile validation failed', [
                    'errors' => $validator->errors(),
                    'request_data' => $request->all(),
                ]);
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $data = $validator->validated();
            
            Log::info('AdminProfile validation passed', ['validated_data' => $data]);
            
            // Handle avatar upload
            if ($request->hasFile('avatar')) {
                $avatar = $request->file('avatar');
                $avatarName = time() . '_' . $avatar->getClientOriginalName();
                $avatarPath = $avatar->storeAs('staff-photos', $avatarName, 'public');
                $data['current_photo'] = $avatarPath;
            }
            
            // Check if profile exists
            $profile = $staff->profile;
            
            if ($profile) {
                // Update existing profile
                $profile->update([
                    'first_name' => explode(' ', $data['name'])[0] ?? '',
                    'last_name' => implode(' ', array_slice(explode(' ', $data['name']), 1)) ?? '',
                    'email' => $data['email'],
                    'mobile_number' => $data['phone'],
                    'current_address' => $data['address'],
                    'department' => $data['department'] ?? $staff->department,
                    'position' => $data['position'] ?? $staff->position,
                    'current_photo' => $data['current_photo'] ?? $profile->current_photo,
                    'birth_date' => $data['birthdate'] ?? $profile->birth_date,
                    'sex' => $data['gender'] ?? $profile->sex,
                    'civil_status' => $data['civil_status'] ?? $profile->civil_status,
                ]);
                $profile->profile_completed = true;
                $profile->save();
            } else {
                // Create new profile
                $profileData = [
                    'user_id' => $user->id,
                    'staff_id' => $staff->id,
                    'first_name' => explode(' ', $data['name'])[0] ?? '',
                    'last_name' => implode(' ', array_slice(explode(' ', $data['name']), 1)) ?? '',
                    'email' => $data['email'],
                    'mobile_number' => $data['phone'],
                    'current_address' => $data['address'],
                    'department' => $data['department'] ?? $staff->department,
                    'position' => $data['position'] ?? $staff->position,
                    'current_photo' => $data['current_photo'] ?? null,
                    'birth_date' => $data['birthdate'] ?? null,
                    'sex' => $data['gender'] ?? null,
                    'civil_status' => $data['civil_status'] ?? null,
                    'profile_completed' => true,
                ];
                
                $profile = StaffProfile::create($profileData);
            }
            
            // Update staff record with basic info
            $staff->update([
                'name' => $data['name'],
                'email' => $data['email'],
                'contact_number' => $data['phone'],
                'address' => $data['address'],
                'position' => $data['position'] ?? $staff->position,
                'department' => $data['department'] ?? $staff->department,
                'birthdate' => $data['birthdate'] ?? $staff->birthdate,
                'gender' => $data['gender'] ?? $staff->gender,
                'civil_status' => $data['civil_status'] ?? $staff->civil_status,
            ]);
            
            Log::info('AdminProfile updated successfully', [
                'profile_id' => $profile->id,
                'staff_id' => $staff->id
            ]);
            
            return response()->json([
                'message' => 'Profile updated successfully',
                'staff' => $staff->fresh(),
                'profile' => $profile->fresh()
            ]);
            
        } catch (\Exception $e) {
            Log::error('AdminProfile update failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'An error occurred while updating profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
