import { useAdminSidebar } from '../contexts/AdminSidebarContext';

export const useAdminResponsiveLayout = () => {
  const { isCollapsed } = useAdminSidebar();

  const mainClasses = `
    bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen pt-36 pb-16 font-sans relative overflow-x-hidden
    transition-all duration-300 ease-in-out
    ${isCollapsed ? 'lg:ml-16' : 'lg:ml-72'}
    ml-0
  `;

  return { mainClasses };
};
