import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Lightbulb, FileText, Package, CalendarDays,
  Network, UserSquare, ClipboardList, AlertCircle, User, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useOptimizedNavigation } from '../hooks/useNavigation';
import { useSidebar } from '../contexts/SidebarContext';
import axiosInstance from '../utils/axiosConfig';

// Cache for profile status to avoid repeated API calls
const profileStatusCache = new Map();
const CACHE_DURATION = 30000; // 30 seconds cache

const Sidebares = memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const { preloadModule } = useOptimizedNavigation();
  const { user, isLoading } = useAuth();
  const { isCollapsed, isMobileOpen, closeMobileSidebar } = useSidebar();
  const [showWarning, setShowWarning] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const lastCheckRef = useRef(0);
  
  // OPTIMIZATION: Use user data from AuthContext instead of API calls
  const checkProfileStatus = useCallback(async () => {
    if (!user) {
      setProfileComplete(false);
      setProfileLoading(false);
      return;
    }
    
    // OPTIMIZATION: Use profile data from AuthContext if available
    if (user?.profile) {
      const isComplete = user.profile.profile_completed === true && 
                        user.profile.verification_status === 'approved';
      setProfileComplete(isComplete);
      setProfileLoading(false);
      return;
    }
    
    const now = Date.now();
    const cacheKey = user.id;
    const cached = profileStatusCache.get(cacheKey);
    
    // Use cache if available and not expired
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log('Sidebares: Using cached profile status');
      setProfileComplete(cached.isComplete);
      setProfileLoading(false);
      return;
    }
    
    // Prevent multiple simultaneous requests
    if (now - lastCheckRef.current < 1000) {
      return;
    }
    lastCheckRef.current = now;
    
    try {
      console.log('Sidebares: Checking profile status via API...');
      const response = await axiosInstance.get('/profile-status');
      const data = response.data;
      
      console.log('Sidebares: Profile status response:', data);
      setProfileComplete(data.isComplete);
      
      // Cache the result
      profileStatusCache.set(cacheKey, {
        isComplete: data.isComplete,
        timestamp: now
      });
    } catch (error) {
      console.error('Sidebares: Error checking profile status:', error);
      setProfileComplete(false);
    } finally {
      setProfileLoading(false);
    }
  }, [user]);
  
  // Single optimized effect for profile status checking
  useEffect(() => {
    if (user && !isLoading) {
      checkProfileStatus();
    } else if (!user) {
      setProfileComplete(false);
      setProfileLoading(false);
    }
  }, [user, isLoading, checkProfileStatus]);


  // Simplified navigation handler
  const handleNavigation = useCallback((e, path) => {
    if (!profileComplete) {
      e.preventDefault();
      setShowWarning(true);
      
      const profile = user?.profile;
      let redirectPath = '/residents/profile';
      
      if (profile?.verification_status === 'denied') {
        redirectPath = '/residency-denied';
      } else if (profile && !profile.residency_verification_image) {
        redirectPath = '/residents/profile';
      }
      
      setTimeout(() => navigate(redirectPath), 300); // Reduced delay
    }
  }, [profileComplete, user?.profile, navigate]);

  // Simplified route guard
  useEffect(() => {
    if (!user || isLoading || profileLoading) return;

    const isProtected = location.pathname.startsWith('/residents');
    
    if (!profileComplete && isProtected) {
      setShowWarning(true);
      const profile = user?.profile;
      
      if (profile?.verification_status === 'denied') {
        navigate('/residency-denied');
      } else if (profile && !profile.residency_verification_image) {
        navigate('/residents/profile');
      } else {
        navigate('/residents/profile');
      }
    }
  }, [user, isLoading, profileLoading, profileComplete, location.pathname, navigate]);

  // Optimized menu items with static icons to prevent re-creation
  const menuItems = useMemo(() => {
    const items = [
      { title: "Dashboard", icon: LayoutDashboard, path: "/residents/dashboard" },
      { title: "Projects", icon: Lightbulb, path: "/residents/projects" },
      { title: "Request Documents", icon: FileText, path: "/residents/requestDocuments" },
      { title: "Request Assets", icon: Package, path: "/residents/requestAssets" },
      { title: "Blotter Appointment", icon: CalendarDays, path: "/residents/blotterAppointment" },
      { title: "Organizational Chart", icon: Network, path: "/residents/organizationalChart" },
    ];
    
    // Add My Benefits for non-admin users
    if (user?.role !== 'admin') {
      items.splice(2, 0, { title: 'My Benefits', icon: ClipboardList, path: '/residents/myBenefits' });
    }
    
    return items;
  }, [user?.role]);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-screen bg-gradient-to-b from-green-900 to-green-800 shadow-2xl border-r border-green-700
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-72'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full px-4 py-6 overflow-y-auto text-white space-y-6 scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-green-800">
        
        {/* Header */}
        <div className="flex items-center justify-center gap-3">
          <UserSquare className="text-lime-300 w-7 h-7 flex-shrink-0" />
          {!isCollapsed && (
            <h2 className="text-2xl font-extrabold tracking-wide text-lime-100 whitespace-nowrap">
              RESIDENT PANEL
            </h2>
          )}
        </div>

        <hr className="border-green-700" />

        {/* Navigation */}
        <nav className="flex-1">
          {showWarning && !isCollapsed && (
            <div className="mb-4 p-4 bg-red-500 text-white rounded-lg shadow-lg animate-fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">Please complete your profile first!</p>
              </div>
            </div>
          )}

          {!user || isLoading || profileLoading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {!isCollapsed && (
                <p className="text-sm text-green-200">Loading sidebar...</p>
              )}
            </div>
          ) : (
            <ul className="space-y-1">
              {menuItems.map((item, idx) => {
                const isActive = location.pathname === item.path;
                const isDisabled = !profileComplete;
                const IconComponent = item.icon;
                
                return (
                  <li key={idx}>
                    {isDisabled ? (
                      <div
                        role="button"
                        aria-disabled="true"
                        onClick={(e) => handleNavigation(e, item.path)}
                        className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group opacity-50 cursor-not-allowed bg-gray-700 text-gray-300
                          ${isCollapsed ? 'justify-center' : ''}
                        `}
                        title={isCollapsed ? item.title : ''}
                      >
                        <IconComponent className="w-4 h-4 text-white flex-shrink-0" />
                        {!isCollapsed && (
                          <>
                            <span className="truncate text-sm tracking-wide">{item.title}</span>
                            <AlertCircle className="w-4 h-4 text-red-400 ml-auto" />
                          </>
                        )}
                      </div>
                    ) : (
                      <Link
                        to={item.path}
                        onClick={(e) => {
                          handleNavigation(e, item.path);
                          if (window.innerWidth < 1024) {
                            closeMobileSidebar();
                          }
                        }}
                        onMouseEnter={() => preloadModule(item.path)}
                        onFocus={() => preloadModule(item.path)}
                        className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group
                          ${isCollapsed ? 'justify-center' : ''}
                          ${isActive
                            ? "bg-green-700 text-white font-semibold border-l-4 border-lime-300"
                            : "hover:bg-green-700 hover:text-white text-green-100"
                          }`}
                        title={isCollapsed ? item.title : ''}
                      >
                        <span className="group-hover:scale-110 transition-transform flex-shrink-0">
                          <IconComponent className="w-4 h-4 text-white" />
                        </span>
                        {!isCollapsed && (
                          <span className="truncate text-sm tracking-wide">{item.title}</span>
                        )}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          
        </nav>


        {/* Footer */}
        <div className={`text-sm text-green-300 text-center pt-6 border-t border-green-700 ${isCollapsed ? 'hidden' : ''}`}>
          <p>&copy; 2025 Barangay System</p>
        </div>
      </div>
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      </aside>
    </>
  );
});

// Add display name for debugging
Sidebares.displayName = 'Sidebares';

export default Sidebares;