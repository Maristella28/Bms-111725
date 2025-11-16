import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import {
  BellIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  EyeIcon,
  DocumentTextIcon,
  MegaphoneIcon,
  GiftIcon,
  FolderIcon,
  CalendarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const NotificationBell = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/notifications');
      
      // Handle both response structures: response.data.data.notifications or response.data.notifications
      const notifications = response.data?.data?.notifications || response.data?.notifications || [];
      setNotifications(notifications);
      setUnreadCount(notifications.filter(n => !n.read_at && !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle notification click - redirect and mark as read with smooth transition
  const handleNotificationClick = async (notification) => {
    try {
      // Optimistically remove notification from list immediately
      if (!notification.read_at && !notification.is_read) {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        // Mark as read in background
        axios.post(`/notifications/${notification.id}/read`).catch(err => {
          console.error("Error marking notification as read:", err);
          // Revert optimistic update on error
          fetchNotifications();
        });
      }

      // Get redirect path
      const redirectPath = notification.redirect_path || notification.data?.action_url || notification.data?.redirect_path;
      
      if (redirectPath) {
        // Add smooth fade-out transition
        const dropdown = document.querySelector('.notification-dropdown');
        if (dropdown) {
          dropdown.style.opacity = '0';
          dropdown.style.transform = 'translateY(-10px)';
        }

        // Close dropdown after animation
        setTimeout(() => {
          setIsOpen(false);
          
          // Navigate with smooth transition
          navigate(redirectPath);
          
          // Auto-scroll to element if hash fragment is present
          setTimeout(() => {
            const hash = redirectPath.split('#')[1];
            if (hash) {
              const element = document.getElementById(hash);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Add highlight effect
                element.classList.add('notification-highlight');
                setTimeout(() => {
                  element.classList.remove('notification-highlight');
                }, 2000);
              }
            }
          }, 300);
        }, 200);
      } else {
        // No redirect path, just close dropdown
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
      // Still try to navigate even if marking as read fails
      const redirectPath = notification.redirect_path || notification.data?.action_url || notification.data?.redirect_path;
      if (redirectPath) {
        setIsOpen(false);
        navigate(redirectPath);
        setTimeout(() => {
          const hash = redirectPath.split('#')[1];
          if (hash) {
            const element = document.getElementById(hash);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        }, 300);
      }
    }
  };

  // Mark notification as read (without redirect)
  const markAsRead = async (notificationId) => {
    try {
      // Optimistically remove notification from list immediately
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Mark as read in background
      await axios.post(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert optimistic update on error
      fetchNotifications();
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      // Optimistically clear all notifications immediately
      setNotifications([]);
      setUnreadCount(0);
      
      // Mark all as read in background
      await axios.post('/notifications/read-all');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Revert optimistic update on error
      fetchNotifications();
    }
  };

  // Get notification icon and color based on notification data
  const getNotificationIcon = (notification) => {
    const data = notification.data || {};
    const type = data.type || notification.type || '';
    
    // Document request notifications
    // Check for: document_request_id, document_request_status type, or document_type/certification_type fields
    // This covers: Barangay Clearance, Barangay Business Permit, Certificate of Indigency, 
    // Certificate of Residency, Barangay Certification
    if (data.document_request_id || 
        type === 'document_request_status' ||
        data.document_type ||
        data.certification_type) {
      return <DocumentTextIcon className="w-5 h-5 text-blue-500" />;
    }
    
    // Asset request notifications
    if (data.asset_request_id || type === 'asset_request') {
      const status = data.status?.toLowerCase();
      if (status === 'approved') {
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      } else if (status === 'denied' || status === 'rejected') {
        return <XMarkIcon className="w-5 h-5 text-red-500" />;
      }
      return <FolderIcon className="w-5 h-5 text-blue-500" />;
    }
    
    // Asset payment notifications
    if (type === 'asset_payment') {
      return <CurrencyDollarIcon className="w-5 h-5 text-emerald-500" />;
    }
    
    // Blotter request/appointment notifications
    if (data.blotter_request_id || data.appointment_id || type === 'blotter_request' || type === 'blotter_appointment') {
      return <CalendarIcon className="w-5 h-5 text-purple-500" />;
    }
    
    // Announcement notifications
    if (data.announcement_id || type === 'announcement') {
      return <MegaphoneIcon className="w-5 h-5 text-orange-500" />;
    }
    
    // Program/benefit notifications
    if (data.program_id || data.program_announcement_id || data.submission_id || data.benefit_id || 
        type === 'program_announcement' || type === 'benefit_update' || type === 'application_status') {
      return <GiftIcon className="w-5 h-5 text-pink-500" />;
    }
    
    // Project notifications
    if (data.project_id || type === 'project') {
      return <FolderIcon className="w-5 h-5 text-indigo-500" />;
    }
    
    // Status-based icons
    const status = data.status?.toLowerCase();
    if (status === 'approved' || status === 'completed') {
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    } else if (status === 'denied' || status === 'rejected') {
      return <XMarkIcon className="w-5 h-5 text-red-500" />;
    } else if (status === 'processing' || status === 'pending') {
      return <ClockIcon className="w-5 h-5 text-yellow-500" />;
    }
    
    // Default icon
    return <BellIcon className="w-5 h-5 text-gray-500" />;
  };

  // Get notification color based on type
  const getNotificationColor = (notification) => {
    const data = notification.data || {};
    const type = data.type || notification.type || '';
    
    // Document request notifications
    // Check for: document_request_id, document_request_status type, or document_type/certification_type fields
    // This covers: Barangay Clearance, Barangay Business Permit, Certificate of Indigency, 
    // Certificate of Residency, Barangay Certification
    if (data.document_request_id || 
        type === 'document_request_status' ||
        data.document_type ||
        data.certification_type) {
      return 'bg-blue-50 border-blue-200';
    }
    
    // Asset request notifications
    if (data.asset_request_id || type === 'asset_request') {
      const status = data.status?.toLowerCase();
      if (status === 'approved') {
        return 'bg-green-50 border-green-200';
      } else if (status === 'denied' || status === 'rejected') {
        return 'bg-red-50 border-red-200';
      }
      return 'bg-blue-50 border-blue-200';
    }
    
    // Asset payment notifications
    if (type === 'asset_payment') {
      return 'bg-emerald-50 border-emerald-200';
    }
    
    // Blotter notifications
    if (data.blotter_request_id || data.appointment_id || type === 'blotter_request' || type === 'blotter_appointment') {
      return 'bg-purple-50 border-purple-200';
    }
    
    // Announcement notifications
    if (data.announcement_id || type === 'announcement') {
      return 'bg-orange-50 border-orange-200';
    }
    
    // Program/benefit notifications
    if (data.program_id || data.program_announcement_id || data.submission_id || data.benefit_id || 
        type === 'program_announcement' || type === 'benefit_update' || type === 'application_status') {
      return 'bg-pink-50 border-pink-200';
    }
    
    // Project notifications
    if (data.project_id || type === 'project') {
      return 'bg-indigo-50 border-indigo-200';
    }
    
    // Status-based colors
    const status = data.status?.toLowerCase();
    if (status === 'approved' || status === 'completed') {
      return 'bg-green-50 border-green-200';
    } else if (status === 'denied' || status === 'rejected') {
      return 'bg-red-50 border-red-200';
    } else if (status === 'processing' || status === 'pending') {
      return 'bg-yellow-50 border-yellow-200';
    }
    
    // Default color
    return 'bg-gray-50 border-gray-200';
  };

  // Format notification time
  const formatTime = (createdAt) => {
    const now = new Date();
    const notificationTime = new Date(createdAt);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Show only unread notifications
  const unreadNotifications = notifications.filter(n => !n.read_at && !n.is_read);

  useEffect(() => {
    fetchNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="notification-dropdown absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 transition-all duration-200 ease-in-out">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="mt-2 text-sm">Loading notifications...</p>
              </div>
            ) : unreadNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <BellIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No unread notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {unreadNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors bg-blue-50"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 mt-0.5 p-2 rounded-full ${getNotificationColor(notification).split(' ')[0]}`}>
                        {getNotificationIcon(notification)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title || 'New Notification'}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message || notification.data?.message}
                        </p>
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                setIsOpen(false);
                // Navigate to notifications page - adjust route based on user role
                const role = localStorage.getItem('role') || 'resident';
                navigate(`/${role}/notifications`);
              }}
              className="w-full flex items-center justify-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors py-2 rounded-lg hover:bg-emerald-50"
            >
              <span>See all notifications</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default NotificationBell;
