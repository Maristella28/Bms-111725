import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const ImageCarousel = ({ 
  images = [], 
  alt = 'Product image', 
  className = '', 
  showDots = true, 
  showArrows = true,
  autoPlay = false,
  autoPlayInterval = 3000,
  onImageClick = null
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [failedImageUrls, setFailedImageUrls] = useState(new Set()); // Track failed images by URL
  const [imageErrors, setImageErrors] = useState(new Map()); // Track which image URLs have been logged

  // Get API base URL (same logic as axiosConfig)
  const getApiBaseURL = useCallback(() => {
    // In development, use the backend server directly
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
      return 'http://127.0.0.1:8000';
    }
    // In production, use relative URLs (backend serves static files)
    return '';
  }, []);

  // Optimized image URL resolution with fallback handling
  const getImageUrl = useCallback((image) => {
    if (!image) return '';
    
    if (typeof image === 'string') {
      // If it's already a full URL, use it as is
      if (image.startsWith('http://') || image.startsWith('https://')) {
        return image;
      }
      
      // Get base URL - prefer API base URL for /storage/ paths
      const apiBaseURL = getApiBaseURL();
      
      // If it starts with /storage/, use API base URL (backend serves these)
      if (image.startsWith('/storage/')) {
        return apiBaseURL ? `${apiBaseURL}${image}` : image;
      }
      
      // If it doesn't start with /, assume it's a storage path
      if (!image.startsWith('/')) {
        const storagePath = `/storage/${image}`;
        return apiBaseURL ? `${apiBaseURL}${storagePath}` : storagePath;
      }
      
      // For other absolute paths, use API base URL if available
      return apiBaseURL ? `${apiBaseURL}${image}` : image;
    }
    
    return image;
  }, [getApiBaseURL]);

  // Filter out failed images by processed URL
  const validImages = images.filter((image) => {
    const processedUrl = getImageUrl(image);
    return processedUrl && !failedImageUrls.has(processedUrl);
  });

  // Handle image load errors - only log once per image and only in development
  const handleImageError = useCallback((imageUrl) => {
    // Skip if already marked as failed
    if (failedImageUrls.has(imageUrl)) {
      return;
    }
    
    // Only log in development and only once per image URL
    const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;
    if (isDev && !imageErrors.has(imageUrl)) {
    console.warn('Image failed to load:', imageUrl);
      setImageErrors(prev => new Map(prev).set(imageUrl, true));
    }
    
    // Mark image URL as failed
    setFailedImageUrls(prev => new Set([...prev, imageUrl]));
  }, [failedImageUrls, imageErrors]);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && validImages.length > 1 && !isHovered) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % validImages.length);
      }, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [autoPlay, validImages.length, isHovered, autoPlayInterval]);

  // Don't render if no valid images
  if (!validImages || validImages.length === 0) {
    return (
      <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm font-medium">No Images Available</p>
          <p className="text-gray-400 text-xs">Images may be temporarily unavailable</p>
        </div>
      </div>
    );
  }

  // If only one valid image, render it without carousel controls
  if (validImages.length === 1) {
    const imageUrl = getImageUrl(validImages[0]);
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
          onClick={onImageClick}
          onError={() => handleImageError(imageUrl)}
        />
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + validImages.length) % validImages.length);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % validImages.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div 
      className={`relative overflow-hidden group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Image Container */}
      <div className="relative w-full h-full">
        <img
          src={getImageUrl(validImages[currentIndex])}
          alt={`${alt} ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
          loading="lazy"
          onClick={onImageClick}
          onError={() => handleImageError(getImageUrl(validImages[currentIndex]))}
        />
        
        {/* Image Counter */}
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {currentIndex + 1} / {validImages.length}
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && validImages.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
            aria-label="Previous image"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
            aria-label="Next image"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && validImages.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {validImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Thumbnail Strip (for larger carousels) */}
      {validImages.length > 4 && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {validImages.slice(0, 6).map((image, index) => {
              const imageUrl = getImageUrl(image);
              return (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`flex-shrink-0 w-8 h-8 rounded overflow-hidden border-2 transition-all duration-300 ${
                  index === currentIndex 
                    ? 'border-white scale-110' 
                    : 'border-white/50 hover:border-white/75'
                }`}
              >
                <img
                    src={imageUrl}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                    onError={() => handleImageError(imageUrl)}
                />
              </button>
              );
            })}
            {validImages.length > 6 && (
              <div className="flex-shrink-0 w-8 h-8 rounded bg-black/50 flex items-center justify-center text-white text-xs">
                +{validImages.length - 6}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
