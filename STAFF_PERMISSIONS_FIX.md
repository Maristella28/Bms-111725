# Staff Permissions System - Fix Summary

## Problem
When admin users granted permissions to staff members via the Staff Management interface, those permissions were not being properly enforced. Staff members were getting 403 Forbidden errors even though they had the correct permissions enabled.

Specific error:
```
GET http://localhost:8000/api/admin/residents-users 403 (Forbidden)
Error data: {message: 'Forbidden: Admins only'}
```

## Root Cause
The `/api/admin/residents-users` endpoint was protected by the `AdminMiddleware` which only allows users with `role === 'admin'`. Staff users with the `residents` permission enabled were blocked at the middleware level before any permission checking could occur.

## Solution

### 1. Routes Configuration (`backend/routes/api.php`)
**Changed:** Moved the `/residents-users` endpoint from the strict admin-only route group to a new shared route group.

```php
// Admin/Staff shared routes (with permission checking in controller)
Route::prefix('admin')->middleware(['auth:sanctum'])->group(function () {
    // 🧑‍🤝‍🧑 Get all users with 'residents' role (accessible by admin and staff with residents permission)
    Route::get('/residents-users', [AdminController::class, 'residents']);
});
```

This allows authenticated users to reach the endpoint, with permission checking handled in the controller.

### 2. Controller Permission Checking (`backend/app/Http/Controllers/AdminController.php`)
**Changed:** Updated the `residents()` method to check permissions for both admin and staff users.

```php
public function residents(Request $request)
{
    $user = $request->user();
    
    // Check if user is admin
    if ($user->role === 'admin') {
        // Admin has full access
    } 
    // Check if user is staff with residents permission
    elseif ($user->role === 'staff') {
        $staff = \App\Models\Staff::where('user_id', $user->id)->first();
        
        if (!$staff) {
            return response()->json(['message' => 'Staff record not found'], 404);
        }
        
        $permissions = $staff->module_permissions ?? [];
        
        // Check if staff has residents permission (backend uses 'residentsRecords' key)
        if (!isset($permissions['residentsRecords']) || !$permissions['residentsRecords']) {
            return response()->json([
                'message' => 'You do not have permission to access residents data'
            ], 403);
        }
    } 
    // Other roles are not allowed
    else {
        return response()->json(['message' => 'Unauthorized'], 403);
    }
    
    // Fetch and return residents users
    // ...
}
```

## Permission System Architecture

### Frontend → Backend Permission Key Mapping

The system uses different permission keys in the frontend vs backend:

**Frontend Keys (UI):**
```javascript
{
  dashboard: true,
  residents: true,
  documents: false,
  household: false,
  blotter: false,
  treasurer: false,
  officials: false,
  staff: false,
  communication: false,
  social_services: true,
  command_center: false,
  projects: false,
  inventory: false,
  logs: false
}
```

**Backend Keys (Database):**
```php
[
  'dashboard' => true,
  'residentsRecords' => true,
  'documentsRecords' => false,
  'householdRecords' => false,
  'blotterRecords' => false,
  'financialTracking' => false,
  'barangayOfficials' => false,
  'staffManagement' => false,
  'communicationAnnouncement' => false,
  'socialServices' => true,
  'disasterEmergency' => false,
  'projectManagement' => false,
  'inventoryAssets' => false,
  'activityLogs' => false
]
```

### Mapping Details

**StaffManagement.jsx** (`mapUiToApiPermissions` function):
```javascript
const uiToApiMap = {
  dashboard: 'dashboard',
  documents: 'documentsRecords',
  residents: 'residentsRecords',
  household: 'householdRecords',
  blotter: 'blotterRecords',
  treasurer: 'financialTracking',
  officials: 'barangayOfficials',
  staff: 'staffManagement',
  communication: 'communicationAnnouncement',
  projects: 'projectManagement',
  social_services: 'socialServices',
  command_center: 'disasterEmergency',
  inventory: 'inventoryAssets',
  logs: 'activityLogs'
};
```

**AuthContext.jsx** (`permissionMapping` object):
```javascript
const permissionMapping = {
  'dashboard': 'dashboard',
  'residentsRecords': 'residents',
  'documentsRecords': 'documents',
  'householdRecords': 'household',
  'blotterRecords': 'blotter',
  'financialTracking': 'treasurer',
  'barangayOfficials': 'officials',
  'staffManagement': 'staff',
  'communicationAnnouncement': 'communication',
  'projectManagement': 'projects',
  'socialServices': 'social_services',
  'disasterEmergency': 'command_center',
  'inventoryAssets': 'inventory',
  'activityLogs': 'logs'
};
```

### Permission Flow

1. **Admin Sets Permissions (Frontend)**
   - Admin uses StaffManagement.jsx to set permissions
   - UI uses frontend keys like `residents`, `documents`

2. **Permission Saving (Frontend → Backend)**
   - `mapUiToApiPermissions()` converts frontend keys to backend keys
   - `residents` → `residentsRecords`
   - Sent to backend via POST `/api/admin/staff`

3. **Permission Storage (Backend)**
   - Stored in `staff.module_permissions` column as JSON
   - Uses backend keys like `residentsRecords`

4. **Permission Loading (Backend → Frontend)**
   - Frontend fetches permissions via GET `/api/user/permissions`
   - Backend returns permissions with backend keys
   - AuthContext maps backend keys back to frontend keys
   - `residentsRecords` → `residents`

5. **Permission Checking (Frontend)**
   - `usePermissions` hook checks using frontend keys
   - Example: `hasModuleAccess('residents')`

6. **Permission Checking (Backend)**
   - Controllers check using backend keys
   - Example: `$permissions['residentsRecords']`

## Sub-Permissions Support

The system also supports sub-permissions for granular access control:

```javascript
residents: { 
  access: false, 
  sub_permissions: {
    main_records: false,
    verification: false,
    disabled_residents: false
  }
}
```

These are flattened when sent to the backend:
```javascript
{
  residentsRecords: true,
  residentsRecords_main_records: false,
  residentsRecords_verification: false,
  residentsRecords_disabled_residents: false
}
```

## Testing the Fix

1. **As Admin:**
   - Go to Staff Management
   - Edit a staff member's permissions
   - Enable "Residents" module
   - Save changes

2. **As Staff User:**
   - Log out and log in as the staff user
   - Navigate to Resident Records → Verification
   - Should see the residents list without 403 error

3. **Expected Behavior:**
   - ✅ Admin: Full access to all modules
   - ✅ Staff with residents permission: Can access resident-related features
   - ❌ Staff without residents permission: Gets 403 error with clear message
   - ❌ Unauthorized users: Gets 403 error

## Related Files Modified

1. `backend/routes/api.php` - Added shared admin/staff route group
2. `backend/app/Http/Controllers/AdminController.php` - Added permission checking logic
3. ~~`frontend/src/pages/admin/modules/Staff/StaffManagement.jsx`~~ - No changes needed
4. ~~`frontend/src/contexts/AuthContext.jsx`~~ - No changes needed
5. ~~`frontend/src/hooks/usePermissions.js`~~ - No changes needed

## Important Notes

⚠️ **When adding new admin routes that should be accessible to staff:**
1. Don't put them in the `Route::middleware(['auth:sanctum', 'admin'])` group
2. Create them in a shared route group with only `auth:sanctum` middleware
3. Add permission checking logic in the controller
4. Use **backend permission keys** (e.g., `residentsRecords`) in controller checks
5. Use **frontend permission keys** (e.g., `residents`) in frontend components

⚠️ **Permission Key Reference:**
Always check the mapping when working with permissions:
- Frontend code (components, hooks): Use `residents`, `documents`, etc.
- Backend code (controllers): Use `residentsRecords`, `documentsRecords`, etc.

## Future Enhancements

Consider implementing:
1. Middleware for staff permission checking to avoid code duplication
2. Permission constants/enums to prevent typos
3. Automated tests for permission checking
4. API endpoint documentation showing required permissions

