import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AdminSidebarContext = createContext();

export const AdminSidebarProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Effect to handle initial load and window resize for desktop collapse
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) { // Tailwind's 'lg' breakpoint
        setIsCollapsed(false); // Ensure sidebar is not collapsed on mobile
        setIsMobileOpen(false); // Ensure mobile sidebar is closed initially
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once on mount

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = useCallback(() => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen(prev => !prev);
    } else {
      setIsCollapsed(prev => !prev);
    }
  }, []);

  const closeMobileSidebar = useCallback(() => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen(false);
    }
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  return (
    <AdminSidebarContext.Provider value={{ 
      isCollapsed, 
      isMobileOpen, 
      toggleSidebar, 
      closeMobileSidebar, 
      toggleCollapse 
    }}>
      {children}
    </AdminSidebarContext.Provider>
  );
};

export const useAdminSidebar = () => {
  const context = useContext(AdminSidebarContext);
  if (!context) {
    throw new Error('useAdminSidebar must be used within an AdminSidebarProvider');
  }
  return context;
};
