import { useSidebar } from '../contexts/SidebarContext';

export const useResponsiveLayout = () => {
  const { isCollapsed } = useSidebar();
  
  const getMainClasses = () => {
    return `
      bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen pt-36 px-6 pb-16 font-sans relative overflow-hidden
      transition-all duration-300 ease-in-out
      ${isCollapsed ? 'lg:ml-16' : 'lg:ml-72'}
      ml-0
    `;
  };

  return {
    isCollapsed,
    mainClasses: getMainClasses()
  };
};
