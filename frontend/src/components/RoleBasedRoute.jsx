import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RoleBasedRoute = ({ children, allowedRoles = [], fallbackPath = null }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Loading...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If no specific roles are required, allow access
  if (allowedRoles.length === 0) {
    return children;
  }

  // Check if user's role is in the allowed roles
  const userRole = user.role === 'residents' ? 'residents' : user.role;
  const isAllowed = allowedRoles.includes(userRole) || allowedRoles.includes(user.role);

  if (!isAllowed) {
    // Determine fallback path
    let redirectPath = fallbackPath;
    
    if (!redirectPath) {
      // Default fallback based on user role
      switch (userRole) {
        case 'admin':
          redirectPath = '/admin/dashboard';
          break;
        case 'staff':
          redirectPath = '/staff/dashboard';
          break;
        case 'resident':
        case 'residents':
          redirectPath = '/residents/dashboard';
          break;
        default:
          redirectPath = '/login';
      }
    }

    console.log(`RoleBasedRoute: Access denied for ${user.role} to ${location.pathname}. Redirecting to ${redirectPath}`);
    
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default RoleBasedRoute;
