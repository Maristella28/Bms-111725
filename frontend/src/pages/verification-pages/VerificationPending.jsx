import React, { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle, Camera, XCircle } from 'lucide-react';
import axiosInstance from '../../utils/axiosConfig';

// Fallback UI Component for missing/broken images
const ImageFallback = ({ status, isDenied = false }) => {
  if (isDenied || status === 'denied') {
    return (
      <div className="w-80 h-80 bg-gradient-to-br from-red-50 to-rose-100 rounded-2xl border-4 border-red-200 shadow-2xl mx-auto flex flex-col items-center justify-center">
        <XCircle className="w-16 h-16 text-red-400 mb-4" />
        <p className="text-red-600 font-semibold text-lg text-center px-4">
          Document Denied
        </p>
        <p className="text-red-500 text-sm text-center px-4 mt-2">
          Please upload a new document
        </p>
      </div>
    );
  }
  
  return (
    <div className="w-80 h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-4 border-gray-200 shadow-2xl mx-auto flex flex-col items-center justify-center">
      <Camera className="w-16 h-16 text-gray-400 mb-4" />
      <p className="text-gray-600 font-semibold text-lg text-center px-4">
        No Image Uploaded
      </p>
      <p className="text-gray-500 text-sm text-center px-4 mt-2">
        Upload your residency document to continue
      </p>
    </div>
  );
};

const VerificationPending = ({ 
  imagePath, 
  status = 'pending',
  onStatusChange,
  onRefresh,
  denialReason = null 
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Resolve absolute/relative string paths and File objects into a usable img src
  const getImageSrc = (ip) => {
    if (!ip) {
      return '';
    }
    
    if (typeof ip !== 'string') {
      return URL.createObjectURL(ip);
    }
    
    if (ip.startsWith('http://') || ip.startsWith('https://')) {
      const url = `${ip}?t=${Date.now()}`;
      return url;
    }
    
    // Fix: Use the correct backend URL for image serving
    // In development, use localhost:8000, in production use relative path
    const isDevelopment = import.meta.env.DEV;
    let baseUrl;
    
    if (isDevelopment) {
      baseUrl = 'http://localhost:8000';
    } else {
      baseUrl = ''; // Use relative path in production
    }
    
    const url = `${baseUrl}/storage/${ip}?t=${Date.now()}`;
    return url;
  };

  // Manual refresh function
  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Try multiple endpoints to get the most up-to-date data
      const [profileResponse, statusResponse] = await Promise.allSettled([
        axiosInstance.get('/profile'),
        axiosInstance.get('/profile-status')
      ]);
      
      console.log('VerificationPending: Manual refresh - profile response:', profileResponse);
      console.log('VerificationPending: Manual refresh - status response:', statusResponse);
      
      let profile = null;
      let verificationStatus = null;
      
      // Get profile data
      if (profileResponse.status === 'fulfilled') {
        const profileData = profileResponse.value.data;
        profile = profileData?.user?.profile || profileData?.profile || profileData;
        console.log('VerificationPending: Manual refresh - profile data:', profile);
      }
      
      // Get status data
      if (statusResponse.status === 'fulfilled') {
        const statusData = statusResponse.value.data;
        verificationStatus = statusData?.verification_status;
        console.log('VerificationPending: Manual refresh - status data:', statusData);
      }
      
      // Use status from status endpoint if available, otherwise use profile data
      const finalStatus = verificationStatus || profile?.verification_status;
      console.log('VerificationPending: Manual refresh - final verification_status:', finalStatus);
      
      if (finalStatus && onStatusChange) {
        console.log('VerificationPending: Manual refresh - updating status to:', finalStatus);
        onStatusChange({
          status: finalStatus,
          imagePath: profile?.residency_verification_image || imagePath,
          profile: profile
        });
      }
      
      if (onRefresh) {
        onRefresh(profile || { verification_status: finalStatus });
      }
    } catch (error) {
      console.error('Error during manual refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [imagePath, onStatusChange, onRefresh]);

  // Reset image load error when image path changes
  useEffect(() => {
    setImageLoadError(false);
  }, [imagePath]);

  return (
    <div className="space-y-8">
      <div className="w-full bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 rounded-3xl flex flex-col items-center py-12 px-6 shadow-2xl border-2 border-blue-200 relative overflow-hidden">
        {/* Enhanced Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-indigo-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-sky-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>
        
        {/* Header Section */}
        <div className="relative z-10 flex flex-col items-center text-center mb-10">
          <div className="relative mb-6">
            {/* Main clock circle with enhanced animation */}
            <div className="relative">
              <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl relative animate-pulse">
                <Clock className="w-14 h-14 text-white" />
              </div>
              
              {/* Spinning ring around clock */}
              {status === 'pending' && (
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-spin"></div>
              )}
            </div>
            
          </div>
          
          <div className="max-w-2xl px-4">
            <h3 className="text-5xl font-extrabold text-blue-800 mb-3 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm">
              {status === 'pending' ? 'Verification Pending' : 'Document Under Review'}
            </h3>
            <p className="text-blue-600 text-xl font-semibold mb-4">
              {status === 'pending' ? 'Your document is under review' : 'Please wait for staff review'}
            </p>
            <p className="text-base text-blue-700 leading-relaxed mb-6">
              {status === 'pending' ? (
                <>
                  Your residency verification is being reviewed by barangay staff. 
                  <span className="block mt-3 text-sm text-blue-600 font-medium bg-blue-100 inline-block px-3 py-1.5 rounded-full">
                    🔄 Real-time checking (every 3 seconds)
                  </span>
                </>
              ) : (
                <>
                  Your document has been uploaded and is waiting for review by barangay staff.
                  <span className="block mt-3 text-sm text-blue-600 font-medium bg-blue-100 inline-block px-3 py-1.5 rounded-full">
                    🔄 Real-time checking enabled
                  </span>
                </>
              )}
            </p>
            
            {/* Manual Refresh Button */}
            <div className="mt-8">
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-blue-500/50 disabled:scale-100 disabled:cursor-not-allowed inline-flex items-center gap-3 mx-auto"
              >
                {isRefreshing ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Refreshing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Check Status Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Document Status Card */}
        <div className="relative z-10 w-full max-w-3xl space-y-6 px-4">
          <div className="bg-gradient-to-br from-blue-50 to-sky-50 border-2 border-blue-300 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
            {/* Enhanced Card background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-300/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-sky-300/20 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl flex-shrink-0 animate-pulse">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-blue-900 mb-2 flex items-center gap-2">
                  Document Uploaded
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">✓ Success</span>
                </h4>
                <p className="text-blue-700 text-sm leading-relaxed">
                  {status === 'pending' ? (
                    <>
                      Please wait for <span className="font-bold text-blue-800 underline decoration-blue-400 decoration-2 underline-offset-2">staff review</span>. The status will update automatically when approved.
                    </>
                  ) : (
                    'Your document is in the review queue. We\'ll notify you when the review is complete.'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Document Preview Section */}
          <div className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
            <h4 className="text-2xl font-bold text-blue-900 mb-6 flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Camera className="w-6 h-6 text-white" />
              </div>
              Uploaded Document
            </h4>
            
            <div className="relative inline-block group">
              {imagePath && !imageLoadError && status !== 'denied' ? (
                <>
                  <img 
                    src={getImageSrc(imagePath)} 
                    alt="Residency Verification" 
                    className="w-full max-w-md h-auto object-contain rounded-2xl border-4 border-blue-300 shadow-2xl mx-auto hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-[1.02] bg-white" 
                    onError={(e) => {
                      setImageLoadError(true);
                      
                      // Try alternative URL construction if the first one fails
                      const alternativeUrl = `http://localhost:8000/storage/${imagePath}`;
                      if (e.target.src !== alternativeUrl) {
                        e.target.src = alternativeUrl;
                      }
                    }}
                    onLoad={() => {
                      setImageLoadError(false);
                    }}
                  />
                  {status === 'pending' && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-2xl flex items-center gap-2 border-2 border-white backdrop-blur-sm">
                      <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                      </div>
                      <span className="drop-shadow-sm">Under Review</span>
                    </div>
                  )}
                </>
              ) : (
                <ImageFallback status={status} isDenied={status === 'denied'} />
              )}
              
              {/* Enhanced overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPending;
