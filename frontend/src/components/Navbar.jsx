import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAdminSidebar } from '../contexts/AdminSidebarContext';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toggleSidebar, isMobileOpen, isCollapsed } = useAdminSidebar();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to sign out?");
    if (confirmLogout) {
      await logout();
      navigate("/login");
    }
  };

  return (
    <nav className="fixed top-0 left-0 z-50 w-full bg-gradient-to-r from-green-900 via-green-800 to-green-700 shadow-xl border-b border-green-900">
      <div className="px-4 py-3 lg:px-6 flex items-center justify-between">
        {/* Left: Sidebar Toggle + Logo and Title */}
        <div className="flex items-center space-x-4">
          {/* Sidebar Toggle Button - Only visible on mobile */}
          <button
            onClick={toggleSidebar}
            className="p-2 text-white hover:bg-green-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 lg:hidden"
            aria-label="Toggle sidebar"
          >
            {isMobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          <a href="/" className="flex items-center">
            <img
              src="/assets/images/logo.jpg"
              alt="Barangay Logo"
              className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full border-2 border-white shadow-lg hover:scale-105 transition duration-300"
            />
            <span className="ml-4 text-lg sm:text-xl md:text-2xl font-extrabold text-white drop-shadow-sm hidden sm:block">
              E-Governance Barangay Management System
            </span>
          </a>
        </div>

        {/* Right: Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center bg-white p-1 rounded-full shadow-md focus:ring-2 focus:ring-green-500 hover:scale-105 transition"
          >
            <img
              src={user?.avatar || "https://flowbite.com/docs/images/people/profile-picture-5.jpg"}
              alt="User"
              className="w-11 h-11 rounded-full object-cover"
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl z-[60] border border-gray-200 overflow-hidden animate-fade-in-up">
              <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
                <p className="text-base font-semibold text-gray-900">
                  {user?.name || "Loading..."}
                </p>
                <p className="text-sm text-gray-500 truncate">{user?.email || ""}</p>
              </div>
              <ul className="py-1 text-sm text-gray-700">
                <DropdownItem icon="fa-tachometer-alt" label="Dashboard" />
                <li>
                  <a
                    href={
                      user?.role === 'staff' 
                        ? "/staff/edit-profile" 
                        : user?.role === 'resident' || user?.role === 'residents'
                        ? "/residents/profile"
                        : "/admin/edit-profile"
                    }
                    className="flex items-center px-4 py-2 hover:bg-green-100 transition duration-200 text-green-700"
                  >
                    <i className="fas fa-user-edit w-5 mr-2 text-green-600" /> 
                    {user?.role === 'resident' || user?.role === 'residents' ? 'Profile' : 'Edit Profile'}
                  </a>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 hover:bg-red-50 text-red-600 hover:text-red-700 transition duration-200"
                  >
                    <i className="fas fa-sign-out-alt w-5 mr-2" /> Sign out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const DropdownItem = ({ icon, label }) => (
  <li>
    <a
      href="#"
      className="flex items-center px-4 py-2 hover:bg-green-100 transition duration-200"
    >
      <i className={`fas ${icon} w-5 mr-2 text-green-600`} />
      {label}
    </a>
  </li>
);

export default Navbar;
