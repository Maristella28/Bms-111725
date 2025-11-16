import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BellIcon,
  CheckIcon,
  ClockIcon,
  CogIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentCheckIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import axiosInstance from '../utils/axiosConfig';

const Notification = ({ user, authToken }) => {
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user || !authToken) return;
    try {
      const res = await axiosInstance.get('/notifications', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      // Updated to handle unified API structure
      const notifList = res.data?.data?.notifications || res.data?.notifications || [];
      setNotifications(notifList);
      setUnreadCount(notifList.filter(n => !n.is_read).length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  // Fetch only when user ID or authToken changes
  useEffect(() => {
    if (user?.id && authToken) {
      fetchNotifications();
      // Optional: enable polling every 60s if needed
      // const interval = setInterval(fetchNotifications, 60000);
      // return () => clearInterval(interval);
    }
  }, [user?.id, authToken]);

  // Handle notification click - redirect and mark as read with smooth transition
  const handleNotificationClick = async (notification) => {
    try {
      // Optimistically remove notification from list immediately
      if (!notification.is_read) {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        // Mark as read in background
        axiosInstance.post(`/notifications/${notification.id}/read`, {}, {
          headers: { Authorization: `Bearer ${authToken}` }
        }).catch(err => {
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
          setNotifOpen(false);
          
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
        setNotifOpen(false);
      }
    } catch (err) {
      console.error("Error handling notification click:", err);
      // Still try to navigate even if marking as read fails
      const redirectPath = notification.redirect_path || notification.data?.action_url || notification.data?.redirect_path;
      if (redirectPath) {
        setNotifOpen(false);
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
  const markAsRead = async (id) => {
    try {
      // Optimistically remove notification from list immediately
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Mark as read in background
      await axiosInstance.post(`/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
    } catch (err) {
      console.error("Error marking as read:", err);
      // Revert optimistic update on error
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      // Optimistically clear all notifications immediately
      setNotifications([]);
      setUnreadCount(0);
      
      // Mark all as read in background
      await axiosInstance.post('/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
    } catch (err) {
      console.error("Error marking all as read:", err);
      // Revert optimistic update on error
      fetchNotifications();
    }
  };

  // Show only unread notifications by default
  const unreadNotifications = notifications.filter(n => !n.is_read);

  // Handle "See all notifications" click
  const handleSeeAll = () => {
    setNotifOpen(false);
    // Navigate to notifications page - adjust route based on user role
    const role = user?.role || 'resident';
    navigate(`/${role}/notifications`);
  };

  const getNotificationIcon = (notification) => {
    const iconClass = "w-4 h-4 text-white";
    const data = notification.data || {};
    
    // Document request notifications - Check FIRST before other types
    // This covers: Barangay Clearance, Barangay Business Permit, Certificate of Indigency, 
    // Certificate of Residency, Barangay Certification
    if (data.document_request_id || 
        data.type === 'document_request_status' ||
        data.document_type ||
        data.certification_type) {
      return <DocumentTextIcon className={iconClass} />;
    }
    
    // Handle Laravel notifications
    if (notification.type === 'laravel_notification') {
      if (data.type === 'asset_payment') {
        return <CheckCircleIcon className={iconClass} />;
      }
      if (data.status === 'approved') {
        return <CheckCircleIcon className={iconClass} />;
      }
      if (data.status === 'denied') {
        return <XCircleIcon className={iconClass} />;
      }
      if (data.status === 'pending') {
        return <ClockIcon className={iconClass} />;
      }
    }
    
    // Handle custom notifications
    if (notification.type === 'custom_notification') {
      return <DocumentTextIcon className={iconClass} />;
    }
    
    // Default icon based on iconType for backward compatibility
    const iconType = notification.data?.icon || 'bell';
    switch (iconType) {
      case 'clock': return <ClockIcon className={iconClass} />;
      case 'cog': return <CogIcon className={iconClass} />;
      case 'check-circle': return <CheckCircleIcon className={iconClass} />;
      case 'x-circle': return <XCircleIcon className={iconClass} />;
      case 'document-check': return <DocumentCheckIcon className={iconClass} />;
      case 'document': return <DocumentTextIcon className={iconClass} />;
      case 'warning': return <ExclamationTriangleIcon className={iconClass} />;
      default: return <BellIcon className={iconClass} />;
    }
  };

  const getNotificationIconBg = (notification) => {
    const data = notification.data || {};
    
    // Document request notifications - Check FIRST before other types
    // This covers: Barangay Clearance, Barangay Business Permit, Certificate of Indigency, 
    // Certificate of Residency, Barangay Certification
    if (data.document_request_id || 
        data.type === 'document_request_status' ||
        data.document_type ||
        data.certification_type) {
      return 'bg-blue-500';
    }
    
    // Handle Laravel notifications
    if (notification.type === 'laravel_notification') {
      if (data.type === 'asset_payment') {
        return 'bg-emerald-500';
      }
      if (data.status === 'approved') {
        return 'bg-green-500';
      }
      if (data.status === 'denied') {
        return 'bg-red-500';
      }
      if (data.status === 'pending') {
        return 'bg-blue-500';
      }
    }
    
    // Handle custom notifications
    if (notification.type === 'custom_notification') {
      return 'bg-purple-500';
    }
    
    // Default color based on color field for backward compatibility
    const color = notification.data?.color || 'green';
    switch (color) {
      case 'yellow': return 'bg-yellow-500';
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      case 'red': return 'bg-red-500';
      case 'emerald': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  const getNotificationBgColor = (notification) => {
    const data = notification.data || {};
    
    // Document request notifications - Check FIRST before other types
    // This covers: Barangay Clearance, Barangay Business Permit, Certificate of Indigency, 
    // Certificate of Residency, Barangay Certification
    if (data.document_request_id || 
        data.type === 'document_request_status' ||
        data.document_type ||
        data.certification_type) {
      return 'bg-blue-50 border-l-4 border-blue-400';
    }
    
    // Handle Laravel notifications
    if (notification.type === 'laravel_notification') {
      if (data.type === 'asset_payment') {
        return 'bg-emerald-50 border-l-4 border-emerald-400';
      }
      if (data.status === 'approved') {
        return 'bg-green-50 border-l-4 border-green-400 font-semibold';
      }
      if (data.status === 'denied') {
        return 'bg-red-50 border-l-4 border-red-400';
      }
      if (data.status === 'pending') {
        return 'bg-blue-50 border-l-4 border-blue-400';
      }
    }
    
    // Handle custom notifications
    if (notification.type === 'custom_notification') {
      return 'bg-purple-50 border-l-4 border-purple-400';
    }
    
    // Default color based on color field for backward compatibility
    const color = notification.data?.color || 'green';
    switch (color) {
      case 'yellow': return 'bg-yellow-50 border-l-4 border-yellow-400';
      case 'blue': return 'bg-blue-50 border-l-4 border-blue-400';
      case 'green': return 'bg-green-50 border-l-4 border-green-400 font-semibold';
      case 'red': return 'bg-red-50 border-l-4 border-red-400';
      case 'emerald': return 'bg-emerald-50 border-l-4 border-emerald-400';
      default: return 'bg-green-50 font-semibold';
    }
  };

  const getDocumentTypeBadge = (docType) => {
    switch (docType) {
      case 'Brgy Clearance': return 'bg-blue-100 text-blue-800';
      case 'Brgy Business Permit': return 'bg-purple-100 text-purple-800';
      case 'Brgy Indigency': return 'bg-orange-100 text-orange-800';
      case 'Brgy Residency': return 'bg-teal-100 text-teal-800';
      case 'Brgy Certification': return 'bg-rose-100 text-rose-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setNotifOpen(!notifOpen)}
        className="relative p-2 rounded-full hover:bg-green-100 transition"
        aria-label="Notifications"
      >
        <BellIcon className="w-7 h-7 text-white" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1.5">
            {unreadCount}
          </span>
        )}
      </button>
      {notifOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl z-50 border border-gray-200 overflow-hidden">
          <div className="px-4 py-2 border-b font-bold text-green-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <button 
              onClick={handleSeeAll}
              className="px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors text-xs"
            >
              See all notifications
            </button>
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {unreadNotifications.length === 0 ? (
              <li className="px-4 py-4 text-gray-500 text-center">No unread notifications</li>
            ) : (
              unreadNotifications.map(n => (
                <li 
                  key={n.id} 
                  className={`px-4 py-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${n.is_read ? 'bg-white' : getNotificationBgColor(n)}`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getNotificationIconBg(n)}`}>
                          {getNotificationIcon(n)}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-sm mb-1">
                            {n.title || n.data?.title || 'Notification'}
                          </div>
                          <div className="text-gray-700 text-sm leading-relaxed">
                            {n.message || n.data?.message}
                          </div>
                          {n.data?.document_type && (
                            <div className="mt-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDocumentTypeBadge(n.data.document_type)}`}>
                                {n.data.certification_type || n.data.document_type}
                              </span>
                            </div>
                          )}
                          {n.data?.status && (
                            <div className="mt-1">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(n.data.status)}`}>
                                Status: {n.data.status}
                              </span>
                            </div>
                          )}
                          {Array.isArray(n.data?.items) && n.data.items.length > 0 && (
                            <div className="mt-2">
                              <div className="text-xs font-medium text-gray-600 mb-1">
                                Requested Items ({n.data.items.length}):
                              </div>
                              <ul className="ml-2 text-xs text-gray-600 list-disc">
                                {n.data.items.map((item, idx) => (
                                  <li key={idx}>
                                    {item.asset_name} (Qty: {item.quantity})
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div className="text-xs text-gray-400 mt-2 flex items-center gap-2">
                            <span>{new Date(n.created_at).toLocaleString()}</span>
                            {n.data?.custom_request_id && (
                              <span className="text-gray-500">• Request #{n.data.custom_request_id}</span>
                            )}
                            {n.data?.document_request_id && (
                              <span className="text-gray-500">• Request #{n.data.document_request_id}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {!n.is_read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the parent click handler
                          markAsRead(n.id);
                        }}
                        className="flex-shrink-0 p-1.5 rounded-full hover:bg-gray-200 transition-colors duration-200"
                        title="Mark as read"
                      >
                        <CheckIcon className="w-4 h-4 text-gray-500 hover:text-green-600" />
                      </button>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Notification;
