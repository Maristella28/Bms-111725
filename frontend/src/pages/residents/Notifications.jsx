import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbares from '../../components/Navbares';
import Sidebares from '../../components/Sidebares';
import { useSidebar } from '../../contexts/SidebarContext';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../utils/axiosConfig';
import {
  BellIcon,
  CheckIcon,
  ClockIcon,
  CogIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentCheckIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  CubeIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isCollapsed } = useSidebar();
  const authToken = localStorage.getItem('authToken');
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'document', 'asset', 'blotter', 'announcement', 'project', 'benefits'
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user || !authToken) return;
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && authToken) {
      fetchNotifications();
      // Refresh every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id, authToken]);

  // Handle notification click - redirect and mark as read
  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read if not already read
      if (!notification.is_read) {
        await axiosInstance.post(`/notifications/${notification.id}/read`, {}, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        // Update local state
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Get redirect path
      const redirectPath = notification.redirect_path || notification.data?.action_url || notification.data?.redirect_path;
      
      if (redirectPath) {
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
      }
    } catch (err) {
      console.error("Error handling notification click:", err);
      // Still try to navigate even if marking as read fails
      const redirectPath = notification.redirect_path || notification.data?.action_url || notification.data?.redirect_path;
      if (redirectPath) {
        navigate(redirectPath);
      }
    }
  };

  // Mark notification as read (without redirect)
  const markAsRead = async (id) => {
    try {
      await axiosInstance.post(`/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === id ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.post('/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  // Get notification type/category
  const getNotificationType = (notification) => {
    const data = notification.data || {};
    const notificationType = data.type || notification.type || null;

    // Document Request notifications
    if (data.document_request_id || 
        notificationType === 'document_request_status' ||
        data.document_type ||
        data.certification_type) {
      return 'document';
    }

    // Asset Request notifications
    if (data.asset_request_id || notificationType === 'asset_request' || notificationType === 'asset_payment') {
      return 'asset';
    }

    // Blotter Request notifications
    if (data.blotter_request_id || 
        data.appointment_id || 
        notificationType === 'blotter_request' || 
        notificationType === 'blotter_appointment') {
      return 'blotter';
    }

    // Announcement notifications
    if (notificationType === 'announcement' || data.announcement_id) {
      return 'announcement';
    }

    // Program Announcement notifications
    if (notificationType === 'program_announcement' || data.program_announcement_id) {
      return 'announcement';
    }

    // Project notifications
    if (notificationType === 'project' || data.project_id) {
      return 'project';
    }

    // Benefits/Application Status notifications
    if (notificationType === 'benefit_update' || 
        notificationType === 'application_status' || 
        data.submission_id || 
        data.benefit_id ||
        notification.type === 'custom_notification' ||
        data.program_id) {
      return 'benefits';
    }

    return 'other';
  };

  // Count notifications by type
  const getTypeCounts = () => {
    const counts = {
      all: notifications.length,
      document: 0,
      asset: 0,
      blotter: 0,
      announcement: 0,
      project: 0,
      benefits: 0,
      other: 0
    };

    notifications.forEach(n => {
      const type = getNotificationType(n);
      if (type in counts) {
        counts[type]++;
      }
    });

    return counts;
  };

  const typeCounts = getTypeCounts();

  // Filter notifications based on selected filter and type
  const filteredNotifications = notifications.filter(n => {
    // Filter by read status
    if (filter === 'unread' && n.is_read) return false;
    if (filter === 'read' && !n.is_read) return false;

    // Filter by type
    if (typeFilter !== 'all') {
      const notificationType = getNotificationType(n);
      if (notificationType !== typeFilter) return false;
    }

    return true;
  });

  // Get notification icon
  const getNotificationIcon = (notification) => {
    const iconClass = "w-7 h-7 text-white";
    const data = notification.data || {};
    
    // Document request notifications
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
    
    // Default icon based on iconType
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

  // Get notification icon background color
  const getNotificationIconBg = (notification) => {
    const data = notification.data || {};
    
    // Document request notifications
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
    
    // Default color
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

  // Get notification background color
  const getNotificationBgColor = (notification) => {
    const data = notification.data || {};
    
    // Document request notifications
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
    
    // Default color
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

  // Get document type badge
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

  // Get status badge
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbares />
      <Sidebares />
      
      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-72'} pt-16`}>
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Enhanced Header with Gradient */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-3 px-4 py-2.5 mb-6 rounded-xl bg-white hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 border-2 border-gray-200 hover:border-green-300 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-green-500 transition-all duration-300 group-hover:scale-110">
                <ArrowLeftIcon className="w-5 h-5 text-gray-600 group-hover:text-white group-hover:-translate-x-0.5 transition-all duration-300" />
              </div>
              <span className="font-semibold text-gray-700 group-hover:text-green-700 transition-colors duration-300">Back</span>
            </button>
            
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl shadow-xl p-8 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                    <BellIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
                      Notifications
                    </h1>
                    <p className="text-green-50 text-lg font-medium">
                      {unreadCount > 0 
                        ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''} waiting for you`
                        : '✨ All caught up! You\'re all set.'
                      }
                    </p>
                  </div>
                </div>
                
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="px-6 py-3 bg-white text-emerald-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 hover:scale-105 hover:bg-emerald-50"
                  >
                    <CheckIcon className="w-5 h-5" />
                    Mark all as read
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Read Status Dropdown */}
          <div className="mb-4 flex items-center gap-4">
            <label className="text-sm font-semibold text-gray-700">Filter by status:</label>
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-white border-2 border-gray-200 rounded-xl px-6 py-3 pr-10 font-semibold text-gray-700 hover:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
          </div>

          {/* Notification Type Tabs */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2 mb-6">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-5 py-2.5 rounded-xl transition-all duration-200 font-semibold text-sm ${
                  typeFilter === 'all'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md transform scale-105'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Types
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  typeFilter === 'all' ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  {typeCounts.all}
                </span>
              </button>
              <button
                onClick={() => setTypeFilter('document')}
                className={`px-5 py-2.5 rounded-xl transition-all duration-200 font-semibold text-sm ${
                  typeFilter === 'document'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md transform scale-105'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <DocumentTextIcon className="w-4 h-4 inline mr-1.5" />
                Documents
                {typeCounts.document > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    typeFilter === 'document' ? 'bg-white/20' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {typeCounts.document}
                  </span>
                )}
              </button>
              <button
                onClick={() => setTypeFilter('asset')}
                className={`px-5 py-2.5 rounded-xl transition-all duration-200 font-semibold text-sm ${
                  typeFilter === 'asset'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md transform scale-105'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <CubeIcon className="w-4 h-4 inline mr-1.5" />
                Assets
                {typeCounts.asset > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    typeFilter === 'asset' ? 'bg-white/20' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {typeCounts.asset}
                  </span>
                )}
              </button>
              <button
                onClick={() => setTypeFilter('blotter')}
                className={`px-5 py-2.5 rounded-xl transition-all duration-200 font-semibold text-sm ${
                  typeFilter === 'blotter'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md transform scale-105'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ClockIcon className="w-4 h-4 inline mr-1.5" />
                Blotter
                {typeCounts.blotter > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    typeFilter === 'blotter' ? 'bg-white/20' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {typeCounts.blotter}
                  </span>
                )}
              </button>
              <button
                onClick={() => setTypeFilter('announcement')}
                className={`px-5 py-2.5 rounded-xl transition-all duration-200 font-semibold text-sm ${
                  typeFilter === 'announcement'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md transform scale-105'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BellIcon className="w-4 h-4 inline mr-1.5" />
                Announcements
                {typeCounts.announcement > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    typeFilter === 'announcement' ? 'bg-white/20' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {typeCounts.announcement}
                  </span>
                )}
              </button>
              <button
                onClick={() => setTypeFilter('project')}
                className={`px-5 py-2.5 rounded-xl transition-all duration-200 font-semibold text-sm ${
                  typeFilter === 'project'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md transform scale-105'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <DocumentTextIcon className="w-4 h-4 inline mr-1.5" />
                Projects
                {typeCounts.project > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    typeFilter === 'project' ? 'bg-white/20' : 'bg-teal-100 text-teal-700'
                  }`}>
                    {typeCounts.project}
                  </span>
                )}
              </button>
              <button
                onClick={() => setTypeFilter('benefits')}
                className={`px-5 py-2.5 rounded-xl transition-all duration-200 font-semibold text-sm ${
                  typeFilter === 'benefits'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md transform scale-105'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <CheckCircleIcon className="w-4 h-4 inline mr-1.5" />
                Benefits
                {typeCounts.benefits > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    typeFilter === 'benefits' ? 'bg-white/20' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {typeCounts.benefits}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Enhanced Notifications List */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-16 text-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-green-600 mx-auto"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BellIcon className="w-6 h-6 text-green-600 animate-pulse" />
                  </div>
                </div>
                <p className="mt-6 text-gray-600 text-lg font-medium">Loading your notifications...</p>
                <p className="mt-2 text-gray-400 text-sm">Please wait a moment</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center shadow-inner">
                  <BellIcon className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  {filter === 'unread' 
                    ? 'No Unread Notifications'
                    : filter === 'read'
                    ? 'No Read Notifications'
                    : 'No Notifications Yet'
                  }
                </h3>
                <p className="text-gray-500 text-base max-w-md mx-auto">
                  {filter === 'unread' 
                    ? 'You\'re all caught up! All your notifications have been read.'
                    : filter === 'read'
                    ? 'You haven\'t read any notifications yet.'
                    : 'When you receive notifications, they\'ll appear here.'
                  }
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {filteredNotifications.map((notification, index) => (
                  <li
                    key={notification.id}
                    className={`group relative p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      notification.is_read 
                        ? 'bg-white hover:bg-gray-50' 
                        : `${getNotificationBgColor(notification)} hover:shadow-lg`
                    } ${index === 0 ? 'rounded-t-2xl' : ''} ${index === filteredNotifications.length - 1 ? 'rounded-b-2xl' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {/* Unread indicator dot */}
                    {!notification.is_read && (
                      <div className="absolute top-6 left-6 w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg z-10"></div>
                    )}
                    
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 flex items-start gap-4">
                        <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110 ${getNotificationIconBg(notification)}`}>
                          {getNotificationIcon(notification)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1">
                              <div className="font-bold text-gray-900 text-xl mb-2 leading-tight">
                                {notification.title || notification.data?.title || 'Notification'}
                              </div>
                              <div className="text-gray-700 text-base leading-relaxed mb-4 whitespace-pre-line">
                                {notification.message || notification.data?.message}
                              </div>
                              
                              {/* Badges Container */}
                              <div className="flex flex-wrap gap-2 mb-4">
                                {/* Document Type Badge */}
                                {notification.data?.document_type && (
                                  <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-sm font-semibold shadow-sm ${getDocumentTypeBadge(notification.data.document_type)}`}>
                                    {notification.data.certification_type || notification.data.document_type}
                                  </span>
                                )}
                                
                                {/* Status Badge */}
                                {notification.data?.status && (
                                  <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-sm font-semibold shadow-sm ${getStatusBadge(notification.data.status)}`}>
                                    <span className="w-2 h-2 rounded-full mr-2 bg-current opacity-75"></span>
                                    {notification.data.status}
                                  </span>
                                )}
                              </div>
                              
                              {/* Requested Items */}
                              {Array.isArray(notification.data?.items) && notification.data.items.length > 0 && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                  <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <DocumentTextIcon className="w-4 h-4" />
                                    Requested Items ({notification.data.items.length})
                                  </div>
                                  <ul className="space-y-2">
                                    {notification.data.items.map((item, idx) => (
                                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                        <span className="font-medium">{item.asset_name}</span>
                                        <span className="text-gray-400">•</span>
                                        <span>Qty: {item.quantity}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {/* Footer with timestamp and request ID */}
                              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2 text-gray-500">
                                  <ClockIcon className="w-4 h-4" />
                                  <span className="font-medium">{new Date(notification.created_at).toLocaleString()}</span>
                                </div>
                                {notification.data?.custom_request_id && (
                                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg font-medium text-xs">
                                    Request #{notification.data.custom_request_id}
                                  </span>
                                )}
                                {notification.data?.document_request_id && (
                                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg font-medium text-xs">
                                    Request #{notification.data.document_request_id}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {!notification.is_read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="flex-shrink-0 p-3 rounded-xl bg-white hover:bg-green-50 border-2 border-gray-200 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md group"
                          title="Mark as read"
                        >
                          <CheckIcon className="w-5 h-5 text-gray-500 group-hover:text-green-600 transition-colors" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;

