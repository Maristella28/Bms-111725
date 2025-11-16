# Complete Guide: Staff Permissions for All Modules

## Overview

This system allows administrators to grant staff members access to specific modules. When a module is toggled ON in Staff Management, staff members can access all features within that module.

## Architecture

### Permission Checking System

All controllers now use the `ChecksStaffPermissions` trait which provides:
- `checkModulePermission($request, $permissionKey, $moduleName)` - Check a single permission
- `checkAnyPermission($request, $permissionKeys, $moduleName)` - Check multiple permissions (OR logic)

### Route Organization

Routes are organized into two groups:

1. **Admin/Staff Shared Routes** (`/admin/*` with `auth:sanctum` middleware only)
   - Permission checking done in controller
   - Accessible by admin AND staff with appropriate permissions

2. **Admin-Only Routes** (`/admin/*` with `auth:sanctum` + `admin` middleware)
   - Only for admin users
   - Staff Management, User Management, Dashboard

## Module Permission Reference

| Module | Frontend Key | Backend Key | Routes Accessible |
|--------|--------------|-------------|-------------------|
| Dashboard | `dashboard` | `dashboard` | Currently admin-only |
| Residents | `residents` | `residentsRecords` | All resident-related endpoints |
| Documents | `documents` | `documentsRecords` | Document request endpoints |
| Household | `household` | `householdRecords` | Household CRUD endpoints |
| Blotter | `blotter` | `blotterRecords` | Blotter records endpoints |
| Treasurer | `treasurer` | `financialTracking` | Financial tracking endpoints |
| Officials | `officials` | `barangayOfficials` | Officials management (admin-only for now) |
| Staff | `staff` | `staffManagement` | Staff management (admin-only) |
| Communication | `communication` | `communicationAnnouncement` | Announcements CRUD |
| Social Services | `social_services` | `socialServices` | Programs, beneficiaries, forms |
| Command Center | `command_center` | `disasterEmergency` | Emergency hotlines |
| Projects | `projects` | `projectManagement` | Projects CRUD |
| Inventory | `inventory` | `inventoryAssets` | Asset management |
| Logs | `logs` | `activityLogs` | Activity logs viewing |

## Detailed Module Breakdown

### 1. 👥 Residents Module (`residentsRecords`)

**Sub-permissions:**
- `main_records` - View/edit resident records
- `verification` - Approve/deny residency verification
- `disabled_residents` - View soft-deleted residents

**Accessible Endpoints:**
- `GET /api/admin/residents` - List all residents
- `GET /api/admin/residents-list` - Alternative residents list
- `GET /api/admin/residents-users` - Get users with resident role
- `GET /api/admin/residents-deleted` - View soft-deleted residents
- `GET /api/admin/residents/search` - Search residents
- `GET /api/admin/residents/report` - Generate residents report
- `POST /api/admin/residents/batch-check-review` - Batch review status
- `GET /api/admin/residents/{id}` - View resident details
- `PUT /api/admin/residents/{id}` - Update resident
- `POST /api/admin/residents/{id}/delete` - Soft delete resident
- `POST /api/admin/residents/{id}/restore` - Restore deleted resident
- `POST /api/admin/residents/{id}/approve-verification` - Approve verification
- `POST /api/admin/residents/{id}/deny-verification` - Deny verification
- `POST /api/admin/residents/{id}/toggle-my-benefits` - Toggle benefits access
- `POST /api/admin/residency-status/{userId}` - Update residency status
- `GET /api/admin/users-without-profiles` - Get users without profiles
- `GET /api/admin/users/{id}/has-profile` - Check if user has profile
- `GET /api/staff/residents-list` - Staff-specific residents list

**Controllers:**
- `AdminController::residents()` - Uses trait ✅
- `ResidentController::trashed()` - Uses trait ✅
- Others - Need to add permission checking

### 2. 🏠 Household Module (`householdRecords`)

**Accessible Endpoints:**
- `GET /api/admin/households` - List all households
- `POST /api/admin/households` - Create household
- `GET /api/admin/households/{id}` - View household details
- `PUT /api/admin/households/{id}` - Update household
- `DELETE /api/admin/households/{id}` - Delete household

**Controllers:**
- `HouseholdController` - Needs trait integration

**Example Integration:**
```php
class HouseholdController extends Controller
{
    use ChecksStaffPermissions;
    
    public function index(Request $request)
    {
        // Check permission
        $permissionCheck = $this->checkModulePermission($request, 'householdRecords', 'household');
        if ($permissionCheck !== null) {
            return $permissionCheck;
        }
        
        // Your existing code...
    }
}
```

### 3. 📋 Projects Module (`projectManagement`)

**Accessible Endpoints:**
- `GET /api/admin/projects` - List all projects
- `POST /api/admin/projects` - Create project
- `GET /api/admin/projects/{id}` - View project details
- `PUT /api/admin/projects/{id}` - Update project
- `DELETE /api/admin/projects/{id}` - Delete project

**Controllers:**
- `ProjectController` - Needs trait integration

### 4. 📢 Communication Module (`communicationAnnouncement`)

**Accessible Endpoints:**
- `GET /api/admin/announcements` - List all announcements
- `POST /api/admin/announcements` - Create announcement
- `GET /api/admin/announcements/{id}` - View announcement
- `PUT /api/admin/announcements/{id}` - Update announcement
- `DELETE /api/admin/announcements/{id}` - Delete announcement
- `PATCH /api/admin/announcements/{id}/toggle` - Toggle status

**Controllers:**
- `AnnouncementController` - Needs trait integration

### 5. 🎯 Social Services Module (`socialServices`)

**Sub-permissions:**
- `programs` - Manage programs
- `beneficiaries` - Manage beneficiaries

**Accessible Endpoints:**

**Programs:**
- `GET /api/admin/programs` - List programs
- `POST /api/admin/programs` - Create program
- `GET /api/admin/programs/{id}` - View program
- `PUT /api/admin/programs/{id}` - Update program
- `DELETE /api/admin/programs/{id}` - Delete program
- `POST /api/admin/programs/{id}/notify-payout-change` - Notify payout change

**Program Forms:**
- `GET /api/admin/program-application-forms` - List forms
- `POST /api/admin/program-application-forms` - Create form
- `POST /api/admin/program-application-forms/{id}/publish` - Publish form
- `GET /api/admin/program-application-forms/{id}/submissions` - View submissions
- `PUT /api/admin/program-application-forms/submissions/{id}/status` - Update submission
- `GET /api/admin/programs/{id}/qualified-residents` - Get qualified residents

**Program Announcements:**
- `GET /api/admin/program-announcements` - List announcements
- `POST /api/admin/program-announcements` - Create announcement
- `POST /api/admin/program-announcements/{id}/publish` - Publish announcement

**Beneficiaries:**
- `GET /api/admin/beneficiaries` - List beneficiaries
- `POST /api/admin/beneficiaries` - Create beneficiary
- `GET /api/admin/beneficiaries/{id}` - View beneficiary
- `PUT /api/admin/beneficiaries/{id}` - Update beneficiary
- `DELETE /api/admin/beneficiaries/{id}` - Delete beneficiary
- `POST /api/admin/beneficiaries/{id}/toggle-visibility` - Toggle visibility
- `POST /api/admin/beneficiaries/{id}/mark-paid` - Mark as paid
- `GET /api/admin/beneficiaries/{id}/download-receipt` - Download receipt

**Controllers:**
- `ProgramController` - Needs trait integration
- `ProgramApplicationFormController` - Needs trait integration
- `ProgramAnnouncementController` - Needs trait integration
- `BeneficiaryController` - Needs trait integration

### 6. 🚨 Command Center Module (`disasterEmergency`)

**Sub-permissions:**
- `disaster_records` - Manage disaster records
- `emergency_hotlines` - Manage emergency hotlines

**Accessible Endpoints:**
- `POST /api/admin/emergency-hotlines` - Create hotline
- `PUT /api/admin/emergency-hotlines/{id}` - Update hotline
- `DELETE /api/admin/emergency-hotlines/{id}` - Delete hotline

**Controllers:**
- `EmergencyHotlineController` - Needs trait integration

### 7. 📦 Inventory Module (`inventoryAssets`)

**Sub-permissions:**
- `asset_management` - Manage assets
- `asset_requests` - Handle asset requests

**Accessible Endpoints:**
- `POST /api/admin/requestable-assets` - Create asset
- `PUT /api/admin/requestable-assets/{id}` - Update asset
- `PATCH /api/admin/requestable-assets/{id}` - Patch asset
- `DELETE /api/admin/requestable-assets/{id}` - Delete asset

**Controllers:**
- `RequestableAssetController` - Needs trait integration

### 8. 📊 Logs Module (`activityLogs`)

**Accessible Endpoints:**
- `GET /api/admin/activity-logs` - List logs
- `GET /api/admin/activity-logs/{id}` - View log details
- `GET /api/admin/activity-logs/statistics/summary` - Statistics
- `GET /api/admin/activity-logs/filters/options` - Filter options
- `GET /api/admin/activity-logs/security/alerts` - Security alerts
- `GET /api/admin/activity-logs/audit/summary` - Audit summary
- `POST /api/admin/activity-logs/export` - Export logs
- `DELETE /api/admin/activity-logs/cleanup` - Cleanup old logs

**Controllers:**
- `ActivityLogController` - Needs trait integration

### 9. 📝 Feedback Module

**Accessible Endpoints:**
- `GET /api/admin/feedbacks` - List feedbacks
- `POST /api/admin/feedbacks` - Create feedback
- `GET /api/admin/feedbacks/{id}` - View feedback
- `PUT /api/admin/feedbacks/{id}` - Update feedback
- `DELETE /api/admin/feedbacks/{id}` - Delete feedback

**Controllers:**
- `FeedbackController` - Needs trait integration

## Admin-Only Modules

These modules are restricted to admin users only and should NOT be shared with staff:

### 👨‍💼 Staff Management (`staffManagement`)
- Staff cannot manage other staff members
- Only admin can create/edit/delete staff accounts
- Only admin can manage staff permissions

### 📊 Dashboard
- Currently admin-only
- Could be made shareable in the future with different views

### 🧑‍💼 Barangay Officials (`barangayOfficials`)
- Official management typically reserved for admin
- Could be shared for viewing only

## Implementation Checklist

For each controller that needs permission checking:

### Step 1: Add the Trait
```php
use App\Traits\ChecksStaffPermissions;

class YourController extends Controller
{
    use ChecksStaffPermissions;
```

### Step 2: Add Permission Check to Each Method
```php
public function index(Request $request)
{
    // Check permission
    $permissionCheck = $this->checkModulePermission(
        $request, 
        'backendPermissionKey',  // e.g., 'projectManagement'
        'module-name'             // e.g., 'projects' (for error messages)
    );
    if ($permissionCheck !== null) {
        return $permissionCheck; // Return 403 error
    }
    
    // Your existing code...
}
```

### Step 3: Test with Staff User
1. Login as admin
2. Go to Staff Management
3. Toggle the module ON for a staff member
4. Login as that staff member
5. Verify they can access the module
6. Verify they get 403 if module is OFF

## Permission Testing Matrix

| Module | Admin Access | Staff (with permission) | Staff (without permission) |
|--------|--------------|------------------------|---------------------------|
| Residents | ✅ Full | ✅ Full | ❌ 403 Forbidden |
| Households | ✅ Full | ✅ Full | ❌ 403 Forbidden |
| Projects | ✅ Full | ✅ Full | ❌ 403 Forbidden |
| Communication | ✅ Full | ✅ Full | ❌ 403 Forbidden |
| Social Services | ✅ Full | ✅ Full | ❌ 403 Forbidden |
| Command Center | ✅ Full | ✅ Full | ❌ 403 Forbidden |
| Inventory | ✅ Full | ✅ Full | ❌ 403 Forbidden |
| Logs | ✅ Full | ✅ Read | ❌ 403 Forbidden |
| Staff Management | ✅ Full | ❌ 403 Forbidden | ❌ 403 Forbidden |
| Dashboard | ✅ Full | ❌ 403 Forbidden | ❌ 403 Forbidden |

## Troubleshooting

### Staff gets 403 even with permission enabled

1. **Check database:** Verify permission is saved
   ```sql
   SELECT module_permissions FROM staff WHERE user_id = [staff_user_id];
   ```

2. **Check backend key:** Ensure controller uses correct permission key
   - Frontend: `residents` → Backend: `residentsRecords`
   - Frontend: `documents` → Backend: `documentsRecords`

3. **Check logs:** Look for permission check logs
   ```bash
   tail -f storage/logs/laravel.log | grep "permission check"
   ```

### Module appears in sidebar but endpoints return 403

- **Cause:** Route is still in admin-only group
- **Fix:** Move route to shared admin/staff group in `routes/api.php`

### Permission toggle doesn't save

- **Check:** Console for errors during save
- **Verify:** Mapping functions in `StaffManagement.jsx`
- **Test:** Check if other permissions save correctly

## Best Practices

1. **Always use the trait** - Don't duplicate permission checking code
2. **Check at the start** - Do permission checks before business logic
3. **Use correct keys** - Backend uses `residentsRecords`, not `residents`
4. **Log everything** - Permission checks should be logged for security
5. **Test thoroughly** - Test with and without permissions
6. **Document changes** - Update this guide when adding new modules

## Future Enhancements

1. **Granular Sub-Permissions**
   - Check specific sub-permissions like `residentsRecords_verification`
   - Allow view-only vs full access

2. **Permission Caching**
   - Cache staff permissions to reduce database queries
   - Clear cache when permissions are updated

3. **Audit Trail**
   - Log when staff access sensitive data
   - Track permission changes over time

4. **Role-Based Templates**
   - Predefined permission sets for common roles
   - "Social Worker", "Clerk", "Field Worker" templates

## Conclusion

All modules now support staff permissions through a unified, reusable trait system. Admin can grant specific module access to staff members, who can then access all features within those modules while maintaining security through controller-level permission checks.

