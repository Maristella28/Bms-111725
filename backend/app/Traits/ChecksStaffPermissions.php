<?php

namespace App\Traits;

use Illuminate\Http\Request;
use App\Models\Staff;

/**
 * Trait for checking staff permissions across controllers
 * 
 * This trait provides a reusable method for checking if a user (admin or staff)
 * has permission to access a specific module.
 */
trait ChecksStaffPermissions
{
    /**
     * Check if the current user has permission to access a specific module
     *
     * @param Request $request The current request
     * @param string $permissionKey The backend permission key (e.g., 'residentsRecords', 'documentsRecords')
     * @param string $moduleName Human-readable module name for error messages (e.g., 'residents', 'documents')
     * @return \Illuminate\Http\JsonResponse|null Returns null if authorized, JsonResponse with error if not
     */
    protected function checkModulePermission(Request $request, string $permissionKey, string $moduleName = null)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        
        // Use permission key as module name if not provided
        if ($moduleName === null) {
            $moduleName = $permissionKey;
        }
        
        // Admin users have full access
        if ($user->role === 'admin') {
            \Log::info("Admin user accessing {$moduleName} endpoint", ['user_id' => $user->id]);
            return null; // No error, access granted
        }
        
        // Check if user is staff
        if ($user->role === 'staff') {
            $staff = Staff::where('user_id', $user->id)->first();
            
            if (!$staff) {
                \Log::warning('Staff record not found for user', ['user_id' => $user->id]);
                return response()->json([
                    'message' => 'Staff record not found'
                ], 404);
            }
            
            $permissions = $staff->module_permissions ?? [];
            
            \Log::info("Staff permission check for {$moduleName}", [
                'user_id' => $user->id,
                'staff_id' => $staff->id,
                'permission_key' => $permissionKey,
                'has_permission' => isset($permissions[$permissionKey]) && $permissions[$permissionKey],
                'all_permissions' => $permissions
            ]);
            
            // Check if staff has the required permission
            if (!isset($permissions[$permissionKey]) || !$permissions[$permissionKey]) {
                \Log::warning("Staff does not have {$permissionKey} permission", [
                    'user_id' => $user->id,
                    'staff_id' => $staff->id,
                    'permission_key' => $permissionKey,
                    'permissions' => $permissions
                ]);
                
                return response()->json([
                    'message' => "You do not have permission to access {$moduleName} data"
                ], 403);
            }
            
            \Log::info("Staff user with {$permissionKey} permission accessing {$moduleName} endpoint", [
                'user_id' => $user->id,
                'staff_id' => $staff->id
            ]);
            
            return null; // No error, access granted
        }
        
        // Other roles are not allowed
        \Log::warning("Unauthorized role attempting to access {$moduleName}", [
            'user_id' => $user->id,
            'role' => $user->role
        ]);
        
        return response()->json([
            'message' => 'Unauthorized'
        ], 403);
    }
    
    /**
     * Check multiple permissions (user must have at least one)
     *
     * @param Request $request The current request
     * @param array $permissionKeys Array of backend permission keys
     * @param string $moduleName Human-readable module name for error messages
     * @return \Illuminate\Http\JsonResponse|null Returns null if authorized, JsonResponse with error if not
     */
    protected function checkAnyPermission(Request $request, array $permissionKeys, string $moduleName = null)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        
        // Admin users have full access
        if ($user->role === 'admin') {
            return null;
        }
        
        // Check if user is staff
        if ($user->role === 'staff') {
            $staff = Staff::where('user_id', $user->id)->first();
            
            if (!$staff) {
                return response()->json(['message' => 'Staff record not found'], 404);
            }
            
            $permissions = $staff->module_permissions ?? [];
            
            // Check if staff has any of the required permissions
            foreach ($permissionKeys as $permissionKey) {
                if (isset($permissions[$permissionKey]) && $permissions[$permissionKey]) {
                    return null; // Access granted
                }
            }
            
            // No matching permissions found
            return response()->json([
                'message' => "You do not have permission to access {$moduleName} data"
            ], 403);
        }
        
        // Other roles are not allowed
        return response()->json(['message' => 'Unauthorized'], 403);
    }
}

