# Enhanced Permission System Guide

This guide explains the new card-based permission system implemented in the Staff Management module, including sub-permission controls and dynamic UI rendering.

## Overview

The enhanced permission system provides:

1. **Card-based Permission Interface**: Visual cards for each module with toggle switches
2. **Sub-permission System**: Granular control over sub-modules and sections
3. **Dynamic UI Rendering**: Staff interfaces show only accessible sections
4. **Permission Utilities**: Helper functions and hooks for permission checking

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Staff Management UI                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Dashboard │  │  Residents  │  │  Documents  │   ...   │
│  │   [Card]    │  │   [Card]    │  │   [Card]    │         │
│  │   Toggle    │  │   Toggle    │  │   Toggle    │         │
│  │             │  │   ┌─────┐   │  │   ┌─────┐   │         │
│  │             │  │   │Main │   │  │   │Req. │   │         │
│  │             │  │   │Ver. │   │  │   │Rec. │   │         │
│  │             │  │   │Dis. │   │  │   └─────┘   │         │
│  └─────────────┘  │   └─────┘   │  └─────────────┘         │
│                   └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Permission Utilities                       │
├─────────────────────────────────────────────────────────────┤
│  • hasModuleAccess()                                        │
│  • hasSubModuleAccess()                                     │
│  • PermissionGuard Component                                │
│  • usePermissions Hook                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Staff Dashboard                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Module    │  │   Module    │  │   Module    │         │
│  │   Cards     │  │   Cards     │  │   Cards     │         │
│  │             │  │   ┌─────┐   │  │   ┌─────┐   │         │
│  │             │  │   │Sub1 │   │  │   │Sub1 │   │         │
│  │             │  │   │Sub2 │   │  │   │Sub2 │   │         │
│  │             │  │   └─────┘   │  │   └─────┘   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Sidebar                                │
├─────────────────────────────────────────────────────────────┤
│  • Filtered Menu Items                                      │
│  • Expandable Sub-menus                                     │
│  • Permission-based Visibility                              │
└─────────────────────────────────────────────────────────────┘
```

## Module Structure

### Modules with Sub-permissions

The following modules have been enhanced with sub-permission support:

#### 1. Residents Module
- **Main Records**: Access to main resident records
- **Verification**: Access to resident verification process
- **Disabled Residents**: Access to disabled resident management

#### 2. Documents Module
- **Document Requests**: Access to pending document requests
- **Document Records**: Access to completed document records

#### 3. Social Services Module
- **Programs**: Access to social assistance programs
- **Beneficiaries**: Access to beneficiary management

#### 4. Command Center Module
- **Disaster Records**: Access to disaster incident records
- **Emergency Hotlines**: Access to emergency hotline management

#### 5. Inventory Module
- **Asset Management**: Access to asset inventory management
- **Asset Requests**: Access to asset request processing

## Permission Structure

### New Permission Format

```javascript
{
  "moduleKey": {
    "access": boolean,
    "sub_permissions": {
      "subModuleKey": boolean
    }
  }
}
```

### Example Permission Object

```javascript
{
  "documents": {
    "access": true,
    "sub_permissions": {
      "document_requests": true,
      "document_records": false
    }
  },
  "residents": {
    "access": true,
    "sub_permissions": {
      "main_records": true,
      "verification": true,
      "disabled_residents": false
    }
  },
  "dashboard": {
    "access": true
  }
}
```

## Usage Examples

### 1. Using PermissionGuard Component

```jsx
import PermissionGuard from '../components/PermissionGuard';
import { PERMISSION_MODULES, PERMISSION_SUB_MODULES } from '../utils/permissionUtils';

// Simple module access
<PermissionGuard moduleKey={PERMISSION_MODULES.DOCUMENTS}>
  <DocumentManagementPanel />
</PermissionGuard>

// Sub-module access
<PermissionGuard 
  moduleKey={PERMISSION_MODULES.DOCUMENTS} 
  subModuleKey={PERMISSION_SUB_MODULES.DOCUMENTS_REQUESTS}
>
  <DocumentRequestsTable />
</PermissionGuard>

// With fallback
<PermissionGuard 
  moduleKey={PERMISSION_MODULES.DOCUMENTS}
  fallback={<div>Access denied</div>}
>
  <DocumentPanel />
</PermissionGuard>
```

### 2. Using usePermissions Hook

```jsx
import { usePermissions } from '../hooks/usePermissions';

const MyComponent = () => {
  const { 
    hasModuleAccess, 
    hasSubModuleAccess, 
    canPerformAction,
    isAdmin,
    getPermissionSummary 
  } = usePermissions();

  // Check module access
  if (hasModuleAccess('documents')) {
    // Show document-related content
  }

  // Check sub-module access
  if (hasSubModuleAccess('documents', 'document_requests')) {
    // Show document requests section
  }

  // Check action permissions
  if (canPerformAction('edit', 'documents', 'document_requests')) {
    // Allow editing document requests
  }

  // Get permission summary
  const summary = getPermissionSummary();
  console.log(`Access to ${summary.modules} modules, ${summary.subModules} sub-modules`);

  return (
    <div>
      {hasModuleAccess('documents') && <DocumentsSection />}
      {hasSubModuleAccess('documents', 'document_requests') && <RequestsTab />}
      {hasSubModuleAccess('documents', 'document_records') && <RecordsTab />}
    </div>
  );
};
```

### 3. Using Permission Utilities

```jsx
import { 
  hasModuleAccess, 
  hasSubModuleAccess,
  getFilteredNavigationItems 
} from '../utils/permissionUtils';

// Direct permission checking
const canAccessDocuments = hasModuleAccess(staffPermissions, 'documents');
const canAccessRequests = hasSubModuleAccess(staffPermissions, 'documents', 'document_requests');

// Filter navigation items
const navigationItems = [
  { title: 'Documents', module: 'documents', subItems: [
    { title: 'Requests', module: 'documents', subModule: 'document_requests' },
    { title: 'Records', module: 'documents', subModule: 'document_records' }
  ]}
];

const filteredItems = getFilteredNavigationItems(navigationItems, staffPermissions);
```

## Staff Management Interface

### Creating Staff with Permissions

1. **Access Staff Management**: Navigate to Admin → Staff Management
2. **Create New Staff**: Click "Create Staff Account"
3. **Set Position**: Choose from predefined positions (Treasurer, Command Center, Social Service)
4. **Configure Permissions**: Use the card-based interface to set module and sub-module permissions
5. **Save**: Click "Create Account" to save with assigned permissions

### Editing Staff Permissions

1. **Find Staff Member**: Locate the staff member in the staff list
2. **Edit Permissions**: Click "Edit Permissions" button
3. **Configure Access**: Use the enhanced card interface to modify permissions
4. **Sub-module Control**: Toggle individual sub-modules within each main module
5. **Save Changes**: Click "Save Changes" to update permissions

### Position-Based Defaults

The system provides automatic permission defaults based on staff positions:

#### Treasurer
- Dashboard: ✅
- Treasurer: ✅
- Other modules: ❌

#### Command Center
- Dashboard: ✅
- Command Center: ✅ (all sub-modules)
- Communication: ✅
- Other modules: ❌

#### Social Service
- Dashboard: ✅
- Social Services: ✅ (all sub-modules)
- Residents: ✅ (main records)
- Documents: ✅ (all sub-modules)
- Other modules: ❌

#### Basic Staff
- Dashboard: ✅
- Residents: ✅ (main records)
- Documents: ✅ (requests only)
- Household: ✅
- Other modules: ❌

## Implementation Details

### Permission Mapping

The system maps UI permission keys to backend API keys:

```javascript
const uiToApiMap = {
  dashboard: 'dashboard',
  documents: 'documentsRecords',
  residents: 'residentsRecords',
  // ... other mappings
};
```

### Backend Integration

Permissions are stored in the database with the following structure:

```sql
-- Example: staff table with module_permissions column
module_permissions JSON
```

The backend receives permissions in this format:
```json
{
  "documentsRecords": true,
  "documentsRecords_document_requests": true,
  "documentsRecords_document_records": false,
  "residentsRecords": true,
  "residentsRecords_main_records": true,
  "residentsRecords_verification": false
}
```

### Sidebar Integration

The sidebar automatically filters menu items based on permissions:

- Main modules appear only if the staff has module access
- Sub-menu items appear only if the staff has sub-module access
- Expandable menus show only accessible sub-sections

## Security Considerations

1. **Permission Validation**: All permission checks are performed on both frontend and backend
2. **Default Deny**: New permissions default to `false` unless explicitly granted
3. **Granular Control**: Sub-permissions allow fine-grained access control
4. **Role Hierarchy**: Admin users have access to all modules regardless of permissions

## Troubleshooting

### Common Issues

1. **Permissions Not Saving**: Check backend API endpoint and database schema
2. **UI Not Updating**: Verify permission normalization functions
3. **Sub-modules Not Showing**: Ensure parent module access is granted
4. **Navigation Issues**: Check sidebar filtering logic and route permissions

### Debug Permissions

```javascript
// Debug current permissions
const { getPermissions } = usePermissions();
console.log('Current permissions:', getPermissions());

// Debug permission summary
const { getPermissionSummary } = usePermissions();
console.log('Permission summary:', getPermissionSummary());
```

## Future Enhancements

1. **Action-Level Permissions**: Granular control over create, read, update, delete operations
2. **Time-Based Permissions**: Temporary access grants with expiration
3. **Permission Templates**: Predefined permission sets for common roles
4. **Audit Logging**: Track permission changes and access attempts
5. **Bulk Permission Management**: Update permissions for multiple staff members

## Files Modified/Created

### New Files
- `frontend/src/utils/permissionUtils.js` - Permission utility functions
- `frontend/src/hooks/usePermissions.js` - React hook for permission checking
- `frontend/src/components/PermissionGuard.jsx` - Conditional rendering component
- `frontend/src/pages/staff/StaffDashboard.jsx` - Example staff dashboard

### Modified Files
- `frontend/src/pages/admin/modules/Staff/StaffManagement.jsx` - Enhanced with card-based interface
- `frontend/src/components/Sidebar.jsx` - Updated with sub-module support

This enhanced permission system provides a robust, user-friendly way to manage staff access to different modules and sub-sections of the Barangay Management System.
