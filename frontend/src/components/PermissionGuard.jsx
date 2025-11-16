import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { PERMISSION_ACTIONS } from '../utils/permissionUtils';

/**
 * Permission Guard Component
 * Conditionally renders children based on user permissions
 */
const PermissionGuard = ({ 
  children, 
  moduleKey, 
  subModuleKey, 
  action = PERMISSION_ACTIONS.VIEW,
  fallback = null,
  requireAdmin = false,
  requireStaff = false,
  requireResident = false
}) => {
  const { 
    hasModuleAccess, 
    hasSubModuleAccess, 
    canPerformAction, 
    isAdmin, 
    isStaff, 
    isResident 
  } = usePermissions();

  // Check role requirements
  if (requireAdmin && !isAdmin()) {
    return fallback;
  }
  
  if (requireStaff && !isStaff()) {
    return fallback;
  }
  
  if (requireResident && !isResident()) {
    return fallback;
  }

  // Check module permissions
  if (moduleKey) {
    if (subModuleKey) {
      // Check sub-module access
      if (!hasSubModuleAccess(moduleKey, subModuleKey)) {
        return fallback;
      }
    } else {
      // Check main module access
      if (!hasModuleAccess(moduleKey)) {
        return fallback;
      }
    }
  }

  // Check action permissions
  if (action && moduleKey) {
    if (!canPerformAction(action, moduleKey, subModuleKey)) {
      return fallback;
    }
  }

  // If all checks pass, render children
  return children;
};

/**
 * Hook for conditional permission checking
 * Returns a function that can be used to check permissions inline
 */
export const usePermissionCheck = () => {
  const { 
    hasModuleAccess, 
    hasSubModuleAccess, 
    canPerformAction, 
    isAdmin, 
    isStaff, 
    isResident 
  } = usePermissions();

  return {
    hasModuleAccess,
    hasSubModuleAccess,
    canPerformAction,
    isAdmin,
    isStaff,
    isResident,
    
    /**
     * Check if user can access a specific section
     * @param {string} moduleKey - Module key
     * @param {string} subModuleKey - Optional sub-module key
     * @param {string} action - Optional action
     * @returns {boolean} - Whether access is granted
     */
    canAccess: (moduleKey, subModuleKey = null, action = PERMISSION_ACTIONS.VIEW) => {
      if (subModuleKey) {
        return hasSubModuleAccess(moduleKey, subModuleKey);
      }
      return hasModuleAccess(moduleKey);
    }
  };
};

export default PermissionGuard;
