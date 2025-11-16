import React, { useState, useEffect, useMemo, memo } from 'react';
import { UserIcon, CheckIcon, XMarkIcon, EyeIcon, DocumentTextIcon, ClockIcon } from '@heroicons/react/24/outline';
import axiosInstance from '../../../../utils/axiosConfig';
import { toast } from 'react-toastify';

// Avatar component - matching ResidentsRecords.jsx design
const AvatarImg = ({ avatarPath }) => {
  const getAvatarUrl = (path) =>
    path && typeof path === 'string' && path.trim() !== '' && path.trim().toLowerCase() !== 'avatar' && path.trim().toLowerCase() !== 'avatars/'
      ? `http://localhost:8000/storage/${path}`
      : null;

  const avatarUrl = getAvatarUrl(avatarPath);
  const [imgSrc, setImgSrc] = useState(avatarUrl || '/default-avatar.png');

  useEffect(() => {
    setImgSrc(avatarUrl || '/default-avatar.png');
  }, [avatarUrl]);

  return (
    <img
      src={imgSrc}
      alt="avatar"
      className="w-12 h-12 rounded-full object-cover shadow-lg border-2 border-white"
      onError={() => setImgSrc('/default-avatar.png')}
    />
  );
};

// Badge component
const Badge = ({ text, color, icon: IconComponent }) => (
  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${color}`}>
    {IconComponent && <IconComponent className="w-3.5 h-3.5" />}
    {text}
  </span>
);

// Utility functions
const getVerificationStatusColor = (status) => {
  const colors = {
    'approved': 'bg-green-100 text-green-800',
    'denied': 'bg-red-100 text-red-800',
    'pending': 'bg-yellow-100 text-yellow-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getVerificationStatusIcon = (status) => {
  const icons = {
    'approved': CheckIcon,
    'denied': XMarkIcon,
    'pending': ClockIcon
  };
  return icons[status] || null;
};

const formatResidentName = (resident) => {
  const parts = [resident.first_name, resident.middle_name, resident.last_name, resident.name_suffix]
    .filter(part => part && part.trim() !== '');
  return parts.join(' ');
};

const ResidentsVerificationTable = memo(({ showVerification, onRefresh }) => {
  const [residentsUsers, setResidentsUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentResidentId, setCurrentResidentId] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comment, setComment] = useState('');
  
  // Image modal state - matching ResidentsRecords.jsx
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageTitle, setSelectedImageTitle] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Helper function to construct proper image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // Check if it's already a full URL
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Construct the proper URL based on environment
    const isDevelopment = import.meta.env.DEV;
    const baseUrl = isDevelopment ? 'http://localhost:8000' : '';
    
    // Ensure the path starts with storage/
    const cleanPath = imagePath.startsWith('storage/') ? imagePath : `storage/${imagePath}`;
    
    return `${baseUrl}/${cleanPath}`;
  };

  const fetchResidentsUsers = async (retryCount = 0) => {
    setLoading(true);
    const maxRetries = 2;
    
    try {
      // Add timeout and pagination parameters
      const response = await axiosInstance.get('/api/admin/residents-users', {
        timeout: 30000, // 30 second timeout
        params: {
          per_page: 100, // Request more records per page
          page: 1
        }
      });
      
      // Handle both old and new API response formats
      const users = response.data?.users || response.data || [];
      const pagination = response.data?.pagination;
      
      setResidentsUsers(Array.isArray(users) ? users : []);
      
      // Log success for debugging
      console.log(`Successfully fetched ${users.length} residents users`);
      
    } catch (error) {
      console.error('Error fetching residents users:', error);
      
      // Handle timeout errors with retry logic
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        if (retryCount < maxRetries) {
          console.log(`Retrying request (attempt ${retryCount + 1}/${maxRetries + 1})`);
          setTimeout(() => {
            fetchResidentsUsers(retryCount + 1);
          }, 2000 * (retryCount + 1)); // Exponential backoff
          return;
        } else {
          toast.error('Request timed out after multiple attempts. Please check your connection and try again.');
        }
      } else {
        toast.error('Failed to fetch residents users: ' + (error.response?.data?.message || error.message));
      }
      
      setResidentsUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const getVerificationStatus = (user) => {
    return user.profile?.verification_status || user.resident?.verification_status || 'pending';
  };

  const handleApprove = async (residentId) => {
    if (!residentId) {
      toast.error('Invalid resident ID');
      return;
    }

    try {
      setLoading(true);
      
      // Step 1: Call approval endpoint
      const response = await axiosInstance.post(`/api/admin/residents/${residentId}/approve-verification`);
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to approve verification');
      }

      // Step 2: Update local state immediately
      setResidentsUsers(prevUsers => 
        prevUsers.map(user => {
          const isMatchingUser = 
            user.profile?.id === residentId || 
            user.resident?.id === residentId ||
            user.resident?.profile_id === residentId;
            
          if (isMatchingUser) {
            return {
              ...user,
              profile: {
                ...user.profile,
                verification_status: 'approved',
                denial_reason: null
              },
              resident: {
                ...user.resident,
                verification_status: 'approved',
                denial_reason: null
              }
            };
          }
          return user;
        })
      );
      
      toast.success('Verification approved successfully. Resident can now complete their profile.');
      
      // Step 3: Refresh data
      await fetchResidentsUsers();
      if (onRefresh) onRefresh();
      
      // Step 4: Close modal if open
      setShowImageModal(false);
      setSelectedImage(null);
      setSelectedImageTitle('');
      setSelectedUser(null);
      
    } catch (err) {
      console.error('Failed to approve:', err);
      toast.error(err.message || 'Failed to approve verification');
    } finally {
      setLoading(false);
    }
  };

  const handleDeny = (residentId) => {
    setCurrentResidentId(residentId);
    setComment("");
    // Close image modal when opening comment modal
    setShowImageModal(false);
    setSelectedImage(null);
    setSelectedImageTitle('');
    setSelectedUser(null);
    setShowCommentModal(true);
  };

  const handleDenySubmit = async () => {
    if (!comment.trim()) {
      toast.error("Please provide a reason for denial.");
      return;
    }

    try {
      const response = await axiosInstance.post(`/api/admin/residents/${currentResidentId}/deny-verification`, {
        comment: comment
      });
      
      toast.success('Verification denied successfully.');
      setShowCommentModal(false);
      setComment('');
      await fetchResidentsUsers();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to deny residency verification:", err);
      toast.error("Failed to deny residency verification.");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const getPaginatedResidents = useMemo(() => {
    if (!Array.isArray(residentsUsers)) {
      return [];
    }
    
    // Sort by created_at date in descending order (newest first)
    const sortedResidents = [...residentsUsers].sort((a, b) => {
      const dateA = new Date(a.created_at || a.profile?.created_at || 0);
      const dateB = new Date(b.created_at || b.profile?.created_at || 0);
      return dateB - dateA; // Descending order (newest first)
    });
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedResidents.slice(startIndex, endIndex);
  }, [residentsUsers, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    if (!Array.isArray(residentsUsers)) {
      return 0;
    }
    const total = Math.ceil(residentsUsers.length / itemsPerPage);
    
    if (currentPage > total && total > 0) {
      setCurrentPage(total);
    }
    
    return total;
  }, [residentsUsers, itemsPerPage, currentPage]);

  useEffect(() => {
    // Reduced logging to prevent console spam
    // console.log('ResidentsVerificationTable useEffect triggered, showVerification:', showVerification);
    if (showVerification) {
      // console.log('Fetching residents users...');
      fetchResidentsUsers();
    }
  }, [showVerification]);

  // Image modal escape key handler - matching ResidentsRecords.jsx
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showImageModal) {
        setShowImageModal(false);
        setSelectedImage(null);
        setSelectedImageTitle('');
        setSelectedUser(null);
        setImageLoading(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showImageModal]);

  if (!showVerification) {
    // Reduced logging to prevent console spam
    // console.log('ResidentsVerificationTable: showVerification is false, not rendering');
    return null;
  }
  
  // Reduced logging to prevent console spam
  // console.log('ResidentsVerificationTable: Rendering with showVerification =', showVerification);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mt-8 transition-all duration-300 hover:shadow-2xl">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            Residents Verification
          </h3>
          <button
            onClick={() => fetchResidentsUsers()}
            disabled={loading}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Profile</th>
              <th className="px-4 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Name</th>
              <th className="px-4 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Email</th>
              <th className="px-4 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Status</th>
              <th className="px-4 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Verification</th>
              <th className="px-4 py-4 text-left font-semibold text-gray-700">Document</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Loading residents verification...</p>
                    <p className="text-gray-400 text-sm">This may take a moment for large datasets</p>
                  </div>
                </td>
              </tr>
            ) : !Array.isArray(residentsUsers) || residentsUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <UserIcon className="w-12 h-12 text-gray-300" />
                    <p className="text-gray-500 font-medium">No residents found for verification</p>
                    <p className="text-xs text-gray-400">Debug: residentsUsers is {typeof residentsUsers}, length: {residentsUsers?.length || 'N/A'}</p>
                  </div>
                </td>
              </tr>
            ) : (
              getPaginatedResidents.map((user, index) => {
                const verificationImage = user.profile?.residency_verification_image || user.resident?.residency_verification_image;
                const hasVerificationImage = verificationImage && verificationImage.trim() !== '';
                
                return (
                  <tr key={`verification-${user.id}-${index}`} className="hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/80 transition-all duration-300 group border-b border-slate-200/50 hover:border-blue-300/50 hover:shadow-sm">
                    <td className="px-6 py-4">
                      <AvatarImg avatarPath={user.profile?.current_photo || user.resident?.current_photo} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-gray-900">
                        {user.profile ? formatResidentName(user.profile) : user.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-700">{user.email || "N/A"}</td>
                    <td className="px-4 py-4">
                      <Badge 
                        text={user.profile?.verification_status || 'pending'} 
                        color={getVerificationStatusColor(user.profile?.verification_status || 'pending')} 
                        icon={getVerificationStatusIcon(user.profile?.verification_status || 'pending')} 
                      />
                    </td>
                    <td className="px-4 py-4">
                      <Badge 
                        text={getVerificationStatus(user)} 
                        color={getVerificationStatusColor(getVerificationStatus(user))} 
                        icon={getVerificationStatusIcon(getVerificationStatus(user))} 
                      />
                    </td>
                    <td className="px-4 py-4">
                      {hasVerificationImage ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={getImageUrl(verificationImage)}
                            alt="Verification Document"
                            className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:scale-105 transition-transform duration-200 shadow-md"
                            onClick={() => {
                              setSelectedImage(getImageUrl(verificationImage));
                              setSelectedImageTitle(`${user.profile ? formatResidentName(user.profile) : user.name || 'Resident'} - Residency Verification`);
                              setSelectedUser(user);
                              setImageLoading(true);
                              setShowImageModal(true);
                            }}
                            onError={(e) => {
                              // Reduced logging to prevent console spam
                              // console.error("Image failed to load:", verificationImage);
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="hidden items-center justify-center w-16 h-16 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                            <DocumentTextIcon className="w-6 h-6 text-gray-400" />
                          </div>
                          <button
                            onClick={() => {
                              setSelectedImage(getImageUrl(verificationImage));
                              setSelectedImageTitle(`${user.profile ? formatResidentName(user.profile) : user.name || 'Resident'} - Residency Verification`);
                              setSelectedUser(user);
                              setImageLoading(true);
                              setShowImageModal(true);
                            }}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-3 py-1 rounded text-xs font-medium shadow-md flex items-center gap-1 transition-all duration-300 hover:shadow-lg"
                          >
                            <EyeIcon className="w-4 h-4" />
                            View Document
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No document</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 px-6 pb-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between gap-4">
              {/* Page Info */}
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              
              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    if (pageNum > totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 flex items-center gap-2"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deny Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Deny Verification</h3>
            <p className="text-sm text-gray-600 mb-4">Please provide a reason for denying this resident's verification:</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows={4}
              placeholder="Enter reason for denial..."
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCommentModal(false);
                  setComment('');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDenySubmit}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Deny Verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal - matching ResidentsRecords.jsx design */}
      {showImageModal && selectedImage && selectedUser && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => {
            setShowImageModal(false);
            setSelectedImage(null);
            setSelectedImageTitle('');
            setSelectedUser(null);
            setImageLoading(false);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 break-words">{selectedImageTitle}</h3>
                {selectedUser && (
                  <p className="text-sm text-gray-600 mt-1 break-words">
                    {selectedUser.email || 'N/A'} • Status: <span className="font-semibold capitalize">{getVerificationStatus(selectedUser)}</span>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => window.open(selectedImage, '_blank')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 whitespace-nowrap"
                >
                  <EyeIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Open in New Tab</span>
                  <span className="sm:hidden">Open</span>
                </button>
                <button
                  onClick={() => {
                    setShowImageModal(false);
                    setSelectedImage(null);
                    setSelectedImageTitle('');
                    setSelectedUser(null);
                    setImageLoading(false);
                  }}
                  className="text-gray-600 hover:text-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 rounded-full p-1 flex-shrink-0"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="relative mb-6">
                {imageLoading && (
                  <div className="flex items-center justify-center w-full h-64">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <img
                  src={selectedImage}
                  alt={selectedImageTitle}
                  className={`w-full h-auto max-h-[60vh] object-contain mx-auto rounded-lg shadow-lg transition-all duration-300 ${imageLoading ? 'hidden' : ''}`}
                  onLoad={() => setImageLoading(false)}
                  onError={(e) => {
                    // Reduced logging to prevent console spam
                    // console.error("Image failed to load:", selectedImage);
                    setImageLoading(false);
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden items-center justify-center w-full h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 transition-all duration-300">
                  <div className="text-center">
                    <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 font-medium">Image failed to load</p>
                    <p className="text-gray-400 text-sm">The image may have been deleted or moved</p>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons Section */}
              {selectedUser && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Verification Actions</h4>
                      <p className="text-sm text-gray-600">
                        {getVerificationStatus(selectedUser) === 'approved' 
                          ? 'This resident\'s verification has been approved. No further actions are available.'
                          : getVerificationStatus(selectedUser) === 'denied'
                          ? 'This resident\'s verification has been denied. No further actions are available.'
                          : 'Review the document above and choose an action for this resident\'s verification.'}
                      </p>
                    </div>
                    {getVerificationStatus(selectedUser) !== 'approved' && getVerificationStatus(selectedUser) !== 'denied' && (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <button
                          onClick={() => {
                            const residentId = selectedUser.profile?.id || selectedUser.resident?.id;
                            if (residentId) {
                              handleApprove(residentId);
                            }
                          }}
                          disabled={loading}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg text-sm font-semibold shadow-md flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckIcon className="w-5 h-5" />
                          Approve Verification
                        </button>
                        <button
                          onClick={() => {
                            const residentId = selectedUser.resident?.id || selectedUser.profile?.id;
                            if (residentId) {
                              handleDeny(residentId);
                            }
                          }}
                          disabled={loading}
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-lg text-sm font-semibold shadow-md flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <XMarkIcon className="w-5 h-5" />
                          Deny Verification
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default ResidentsVerificationTable;
