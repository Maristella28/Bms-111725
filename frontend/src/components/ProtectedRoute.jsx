import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { routeConfig } from '../config/routes';
import axiosInstance from '../utils/axiosConfig';

// Cache for profile status to avoid repeated API calls
const profileStatusCache = new Map();
const CACHE_DURATION = 30000; // 30 seconds cache

// Helper to check if a profile is truly complete
function isProfileComplete(profile) {
  if (!profile) return false;
  
  // Primary check: If backend says profile_completed is true, treat as complete
  if (profile.profile_completed === true || profile.profile_completed === 1 || profile.profile_completed === '1') {
    return true;
  }
  
  // Secondary check: If verification is approved and has essential fields
  const verificationApproved = profile.verification_status === 'approved';
  if (verificationApproved) {
    const hasEssentialFields = profile.first_name && profile.last_name && profile.current_address;
    const hasPhoto = profile.current_photo || profile.avatar;
    const hasResidencyImage = profile.residency_verification_image;
    
    return hasEssentialFields && hasPhoto && hasResidencyImage;
  }
  
  return false;
}

// Helper to check if residency verification is complete
function isResidencyVerificationComplete(profile) {
  if (!profile) return false;
  return profile.verification_status === 'approved';
}

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  // Memoize path parsing to avoid recalculation
  const pathInfo = useMemo(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    return {
      currentPath: pathParts[0],
      modulePath: pathParts.slice(1).join('/'),
      fullPath: location.pathname
    };
  }, [location.pathname]);
  
  const { currentPath, modulePath, fullPath } = pathInfo;
  
  // Use the same profile completion check as Sidebares for consistency
  const [profileComplete, setProfileComplete] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  
  // Optimized profile status check with caching
  const checkProfileStatus = useCallback(async () => {
    if (!user) {
      setProfileComplete(false);
      setProfileLoading(false);
      return;
    }
    
    const now = Date.now();
    const cacheKey = user.id;
    const cached = profileStatusCache.get(cacheKey);
    
    // Use cache if available and not expired
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      setProfileComplete(cached.isComplete);
      setProfileLoading(false);
      return;
    }
    
    try {
      const response = await axiosInstance.get('/profile-status');
      const data = response.data;
      
      setProfileComplete(data.isComplete);
      
      // Cache the result
      profileStatusCache.set(cacheKey, {
        isComplete: data.isComplete,
        timestamp: now
      });
    } catch (error) {
      // Suppress timeout errors (they're already handled by retry logic and fallback)
      const isTimeoutError = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
      if (!isTimeoutError) {
        console.error('ProtectedRoute: Error checking profile status:', error);
      }
      // Fallback to local check if API fails (including timeouts)
      setProfileComplete(isProfileComplete(user.profile));
    } finally {
      setProfileLoading(false);
    }
  }, [user]);
  
  // Optimized function to check if user has permission for a module
  const hasModulePermission = useCallback((module) => {
    if (!user) return false;
    
    // Admin has access to all modules
    if (user.role === 'admin') return true;

    // Staff permissions check
    if (user.role === 'staff') {
      const permissions = user.permissions || user.module_permissions || {};
      return Boolean(permissions[module]);
    }
    
    // For other roles
    return Boolean(user.permissions?.[module]);
  }, [user]);

  // Check profile status when user changes
  useEffect(() => {
    if (user && !isLoading) {
      checkProfileStatus();
    } else if (!user) {
      setProfileComplete(false);
      setProfileLoading(false);
    }
  }, [user, isLoading, checkProfileStatus]);

  // Don't check profile completion while still loading user data or profile status
  if (isLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access for all routes
  if (currentPath) {
    // Check if user is trying to access a role-specific path they don't have access to
    if (!['admin', 'staff', 'treasurer', 'resident', 'residents'].includes(currentPath)) {
      // If it's not a role path, redirect to user's dashboard
      const userRole = user.role === 'residents' ? 'residents' : user.role;
      return <Navigate to={`/${userRole}/dashboard`} replace />;
    }
    
    // If user is trying to access a non-assigned role's path
    // Handle both 'resident' and 'residents' for backward compatibility
    const userRole = user.role === 'residents' ? 'residents' : user.role;
    
    // Admin can access all role paths, but others should be restricted
    if (user.role !== 'admin') {
      if (currentPath !== userRole) {
        console.log(`ProtectedRoute: Redirecting ${user.role} from /${currentPath} to /${userRole}/dashboard`);
        return <Navigate to={`/${userRole}/dashboard`} replace />;
      }
    }
  }

  // Special handling for admin module routes (like /admin/modules/Blotter/NewComplaint)
  if (fullPath && fullPath.startsWith('/admin/modules/')) {
    // Admin and staff have access to all module routes
    if (user.role === 'admin' || user.role === 'staff') {
      return children;
    } else {
      return <Navigate to={`/${user.role}/dashboard`} replace />;
    }
  }

  // Check module permissions for non-dashboard paths
  if (modulePath && modulePath !== 'dashboard' && !routeConfig.unrestricted.includes(modulePath)) {
    // Handle resident routes differently
    if (user.role === 'residents' || user.role === 'resident') {
      // For residents, check in resident-specific routes
      const residentRoute = routeConfig.residents?.find(route => route.path === modulePath);
      
      if (!residentRoute) {
        return <Navigate to={`/${user.role}/dashboard`} replace />;
      }
      // Residents have access to all their routes by default
    } else {
      // For admin/staff, check in common routes with permissions
      // First try exact match
      let moduleRoute = routeConfig.common.find(route => route.path === modulePath);
      
      // If no exact match, try to match parameterized routes
      if (!moduleRoute) {
        moduleRoute = routeConfig.common.find(route => {
          if (route.path.includes(':')) {
            // Convert route pattern to regex (e.g., "social-services/program/:id" -> "social-services/program/[^/]+")
            const pattern = route.path.replace(/:[^/]+/g, '[^/]+');
            const regex = new RegExp(`^${pattern}$`);
            return regex.test(modulePath);
          }
          return false;
        });
      }
      
      if (moduleRoute) {
        const modulePermission = moduleRoute.module || moduleRoute.path;
        const hasPermission = hasModulePermission(modulePermission);
        
        if (!hasPermission) {
          return <Navigate to={`/${user.role}/dashboard`} replace />;
        }
      } else if (!routeConfig.unrestricted.includes(modulePath)) {
        return <Navigate to={`/${user.role}/dashboard`} replace />;
      }
    }
  }

  // Mandatory profile completion and residency verification for residents
  if (user.role === 'residents' || user.role === 'resident') {
    // If residency verification is denied, show an error page or redirect to a specific page
    if (user.profile && user.profile.verification_status === 'denied') {
      // Redirect to a page that shows the denial message
      return <Navigate to="/residency-denied" replace />;
    }
    
    // If profile is complete and verified, allow access to all resident routes
    if (profileComplete && isResidencyVerificationComplete(user.profile)) {
      // Profile is complete - allow access to all resident routes
      return children;
    }
    
    // If profile is incomplete, allow access to certain essential pages
    const allowedPathsForIncompleteProfile = [
      '/residents/profile',
      '/residents/modules/Programs/ProgramAnnouncements'
    ];
    
    if (!allowedPathsForIncompleteProfile.includes(location.pathname)) {
      if (!profileComplete) {
        return <Navigate to="/residents/profile" replace />;
      }
      if (!isResidencyVerificationComplete(user.profile)) {
        return <Navigate to="/residents/profile" replace />;
      }
    }
  }

  return children;
};

export default ProtectedRoute;
