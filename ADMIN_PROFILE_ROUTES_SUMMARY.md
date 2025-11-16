# Admin Profile API Routes - Implementation Summary

## Overview
Added complete API routes for admin profile management to enable admins to view and update their profiles.

## Routes Added

### Admin Profile Routes (Protected by `auth:sanctum` and `admin` middleware)

All routes are prefixed with `/api/admin/` and require:
- ✅ Authentication via Sanctum (`auth:sanctum`)
- ✅ Admin role (`AdminMiddleware`)

#### 1. Get Admin Profile
- **Endpoint**: `GET /api/admin/profile`
- **Controller**: `AdminProfileController@show`
- **Purpose**: Retrieve the authenticated admin's profile information
- **Response**: Returns staff record and profile data

#### 2. Update Admin Profile (Multiple HTTP Methods)
- **Endpoints**:
  - `POST /api/admin/profile`
  - `PUT /api/admin/profile`
  - `PATCH /api/admin/profile`
  - `POST /api/admin/profile/update`
  - `PUT /api/admin/profile/update`
  - `PATCH /api/admin/profile/update`
- **Controller**: `AdminProfileController@update`
- **Purpose**: Create or update admin profile information
- **Accepts**: 
  - `name` (required, string, max:255)
  - `email` (required, email, max:255)
  - `avatar` (nullable, image, jpg/jpeg/png, max:2048KB)
  - `phone` (nullable, string, max:50)
  - `address` (nullable, string)
  - `position` (nullable, string, max:100)
  - `department` (nullable, string, max:255)
  - `birthdate` (nullable, date)
  - `gender` (nullable, enum: Male/Female)
  - `civil_status` (nullable, enum: Single/Married/Widowed/Divorced/Separated)

## Controller Details

### AdminProfileController
Located at: `backend/app/Http/Controllers/AdminProfileController.php`

**Methods**:
1. `show()` - Get admin profile
2. `update(Request $request)` - Create or update admin profile

**Features**:
- ✅ Uses Staff and StaffProfile models
- ✅ Handles avatar/photo uploads to `staff-photos` directory
- ✅ Creates profile if it doesn't exist
- ✅ Updates both Staff and StaffProfile records
- ✅ Full validation with detailed error messages
- ✅ Comprehensive logging for debugging
- ✅ Proper error handling with try-catch

## Middleware Stack

Each route passes through:
1. **api** - API middleware group
2. **auth:sanctum** - Sanctum authentication
3. **AdminMiddleware** - Admin role verification

## Testing

To verify the routes are working:

```bash
# List all admin profile routes
php artisan route:list --path=admin/profile

# Show routes with middleware details
php artisan route:list --path=admin/profile -v
```

## Usage Example

### Get Admin Profile
```javascript
const response = await fetch('/api/admin/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

### Update Admin Profile
```javascript
const formData = new FormData();
formData.append('name', 'John Doe');
formData.append('email', 'john@example.com');
formData.append('phone', '09123456789');
formData.append('address', 'Barangay Address');
formData.append('avatar', fileInput.files[0]);

const response = await fetch('/api/admin/profile/update', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData,
});
```

## Files Modified

1. **backend/routes/api.php**
   - Added `AdminProfileController` import
   - Added 7 profile routes in the admin middleware group

2. **backend/app/Http/Controllers/AdminProfileController.php**
   - Already existed with complete implementation
   - No modifications needed

## Related Routes

### Staff Profile Routes (For comparison)
Staff members have similar routes at:
- `GET /api/staff/my-profile`
- `POST/PUT/PATCH /api/staff/profile/update`

These are protected by `auth:sanctum` only (no admin middleware).

## Notes

- Admin profiles use the Staff and StaffProfile models (admins are treated as special staff members)
- Both admins and staff share the same profile structure
- The difference is in permissions and access levels, not data structure
- Avatar uploads are stored in `public/staff-photos/`
- Profile completion is tracked via `profile_completed` flag

## Next Steps

The frontend can now use these endpoints to:
1. Display admin profile information
2. Allow admins to edit their profiles
3. Upload and update profile photos
4. Manage personal information

All routes are properly authenticated and authorized, ensuring only admins can access their own profile endpoints.

