import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../../../utils/axiosConfig'; // Adjust path if needed
import Navbares from "../../../../components/Navbares";
import Sidebares from "../../../../components/Sidebares";
import ImageCarousel from '../../../../components/ImageCarousel';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import assetsCache from '../../../../utils/assetsCache';
import { useResponsiveLayout } from '../../../../hooks/useResponsiveLayout';
import { useAuth } from '../../../../contexts/AuthContext';
import { isProfileComplete } from '../../../../utils/profileValidation';
import {
  ShoppingBagIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  TagIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Bars3Icon,
  Squares2X2Icon,
  StarIcon,
  BuildingLibraryIcon,
  HomeModernIcon,
  ShieldCheckIcon as ShieldIcon,
  CubeIcon,
  BoltIcon,
  SparklesIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  UserIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  StarIcon as StarSolidIcon,
} from '@heroicons/react/24/solid';

const RequestAssets = () => {
  const { mainClasses } = useResponsiveLayout();
  const { user, isLoading: authLoading } = useAuth();
  const [assets, setAssets] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);
  const [isUsingCache, setIsUsingCache] = useState(false);
  const [detailModal, setDetailModal] = useState({ open: false, asset: null });
  const [requestModal, setRequestModal] = useState({ open: false, asset: null });
  const [requestDate, setRequestDate] = useState(null);
  const [untilWhen, setUntilWhen] = useState(null);
  const [requestQty, setRequestQty] = useState(1);
  
  // Initialize cart from localStorage
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('assetCart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // E-commerce specific states
  const [wishlist, setWishlist] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [quickViewModal, setQuickViewModal] = useState({ open: false, asset: null });
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
  
  // OPTIMIZATION: Using global cache for persistence across navigation
  
  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('assetCart', JSON.stringify(cart));
      console.log('💾 Cart saved to localStorage:', cart.length, 'items');
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  // OPTIMIZATION: Enhanced error handling with global cache
  const fetchAssets = async (forceRefresh = false, retryCount = 0) => {
    const maxRetries = 2;
    const cacheKey = 'requestable-assets';
    
    // Check global cache first
    if (!forceRefresh) {
      const cachedData = assetsCache.get(cacheKey);
      if (cachedData) {
        console.log('🚀 Using cached assets data');
        setAssets(cachedData);
        setLoading(false);
        setIsUsingCache(true);
        
        // OPTIMIZATION: Fetch fresh data in background for next time
        setTimeout(() => {
          fetchAssets(true, 0);
        }, 100);
        return;
      }
    }
    
    setLoading(true);
    setIsUsingCache(false);
    setError(''); // Clear previous errors
    
    try {
      const res = await axios.get('/api/requestable-assets');
      if (res.data && res.data.success) {
        // Get base URL dynamically
        const baseURL = axios.defaults.baseURL || window.location.origin;
        
        // Process images to ensure full URLs with fallback handling
        const processedAssets = res.data.data.map(asset => ({
          ...asset,
          image: asset.image ? asset.image.map(img => {
            if (typeof img === 'string') {
              // If it's already a full URL, use it as is
              if (img.startsWith('http')) {
                return img;
              }
              // If it starts with /storage/, add the base URL
              if (img.startsWith('/storage/')) {
                return `${baseURL}${img}`;
              }
              // If it's just a filename, assume it's in the requestable-assets folder
              return `${baseURL}/storage/requestable-assets/${img}`;
            }
            return img;
          }).filter(Boolean) : [] // Remove any null/undefined images
        }));
        
        setAssets(processedAssets);
        // Store in global cache for persistence across navigation
        assetsCache.set(cacheKey, processedAssets);
        console.log('💾 Assets data cached globally');
      } else {
        setAssets([]);
        assetsCache.set(cacheKey, []);
      }
    } catch (error) {
      console.error('Failed to load assets:', error);
      
      // OPTIMIZATION: Retry mechanism for transient errors
      if (retryCount < maxRetries && (error.response?.status === 500 || error.code === 'NETWORK_ERROR')) {
        console.log(`Retrying fetchAssets (attempt ${retryCount + 1}/${maxRetries + 1})...`);
        setTimeout(() => {
          fetchAssets(forceRefresh, retryCount + 1);
        }, 1000 * (retryCount + 1)); // Exponential backoff: 1s, 2s
        return;
      }
      
      // OPTIMIZATION: Provide specific error messages based on error type
      if (error.response?.status === 500) {
        setError('Asset service is temporarily unavailable. Please try again later.');
      } else if (error.response?.status === 404) {
        setError('Asset service not found. Please contact support.');
      } else if (error.code === 'NETWORK_ERROR') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Failed to load assets. Please try again.');
      }
      
      // OPTIMIZATION: Set empty array instead of undefined
      setAssets([]);
      assetsCache.set(cacheKey, []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // Listen for payment status changes to refresh assets
  useEffect(() => {
    const handlePaymentUpdate = () => {
      // Clear global cache and refresh assets when payment is processed
      assetsCache.clear();
      fetchAssets(true);
    };

    // Listen for custom events (can be triggered from other components)
    window.addEventListener('paymentProcessed', handlePaymentUpdate);
    window.addEventListener('assetStockUpdated', handlePaymentUpdate);

    return () => {
      window.removeEventListener('paymentProcessed', handlePaymentUpdate);
      window.removeEventListener('assetStockUpdated', handlePaymentUpdate);
    };
  }, []);

  // Cleanup effect to prevent DOM manipulation errors
  useEffect(() => {
    return () => {
      // Clean up any lingering DatePicker poppers
      const poppers = document.querySelectorAll('.react-datepicker-popper');
      poppers.forEach(popper => {
        if (popper && popper.parentNode) {
          try {
            popper.parentNode.removeChild(popper);
          } catch (e) {
            console.warn('DatePicker cleanup warning on unmount:', e);
          }
        }
      });
    };
  }, []);

  // Fetch asset details for modal
  const openDetailModal = async (assetId) => {
    setDetailModal({ open: true, asset: null });
    try {
      const res = await axios.get(`/api/requestable-assets/${assetId}`);
      if (res.data && res.data.success) {
        // Process images to ensure full URLs
        const processedAsset = {
          ...res.data.data,
          image: res.data.data.image ? res.data.data.image.map(img => {
            if (typeof img === 'string') {
              // If it's already a full URL, use it as is
              if (img.startsWith('http')) {
                return img;
              }
              // If it starts with /storage/, add the base URL
              if (img.startsWith('/storage/')) {
                return `http://localhost:8000${img}`;
              }
              // If it's just a filename, assume it's in the requestable-assets folder
              return `http://localhost:8000/storage/requestable-assets/${img}`;
            }
            return img;
          }) : []
        };
        setDetailModal({ open: true, asset: processedAsset });
      } else {
        setDetailModal({ open: false, asset: null });
        alert('Failed to load asset details');
      }
    } catch {
      setDetailModal({ open: false, asset: null });
      alert('Failed to load asset details');
    }
  };

  // Open request modal for asset
  const openRequestModal = (asset) => {
    setRequestModal({ open: true, asset });
    setRequestDate(null);
    setUntilWhen(null);
    setRequestQty(1);
    setError('');
  };

  // Calculate duration in days between request date and return date
  // Duration includes both the start and end days (e.g., Nov 15 to Nov 15 = 1 day, Nov 15 to Nov 17 = 3 days)
  const calculateDuration = (requestDate, untilWhen) => {
    if (!requestDate || !untilWhen) return null;
    const start = new Date(requestDate);
    const end = new Date(untilWhen);
    // Normalize to midnight for accurate day calculation
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    // Calculate difference in milliseconds
    const diffTime = end.getTime() - start.getTime();
    // Convert to days (milliseconds to days)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    // Add 1 to include both start and end days
    return diffDays + 1;
  };

  // Get maximum allowed date for "Until When" (7 days from request date)
  // If requestDate is Nov 15, maxDate is Nov 22 (7 days after = Nov 15 + 7 days)
  // Duration from Nov 15 to Nov 22 = 8 days (including both start and end days)
  const getMaxAllowedDate = (requestDate) => {
    if (!requestDate) return new Date();
    const maxDate = new Date(requestDate);
    maxDate.setDate(maxDate.getDate() + 7); // +7 days from request date
    return maxDate;
  };

  // Add item to cart
  const addToCart = () => {
    if (!requestDate) {
      setError('Please select a request date');
      return;
    }
    if (!untilWhen) {
      setError('Please select an end date (Until When)');
      return;
    }
    // Validate that "Until When" is greater than or equal to Request Date
    const requestDateOnly = new Date(requestDate.getFullYear(), requestDate.getMonth(), requestDate.getDate());
    const untilWhenOnly = new Date(untilWhen.getFullYear(), untilWhen.getMonth(), untilWhen.getDate());
    if (untilWhenOnly < requestDateOnly) {
      setError('The return date cannot be earlier than the request date.');
      return;
    }
    // Validate that end date is within 7 days from Request Date
    const maxAllowedDate = getMaxAllowedDate(requestDate);
    maxAllowedDate.setHours(23, 59, 59, 999); // Set to end of day for comparison
    if (untilWhenOnly > maxAllowedDate) {
      setError('The maximum allowed duration for asset usage is 7 days from the request date.');
      return;
    }
    // Additional validation: Check if duration exceeds 8 days (7 days from request date = 8 days total)
    // Nov 15 to Nov 22 = 8 days total, which is the maximum allowed
    const duration = calculateDuration(requestDate, untilWhen);
    if (duration > 8) {
      setError('The maximum allowed duration for asset usage is 7 days from the request date.');
      return;
    }
    if (requestQty < 1 || requestQty > (requestModal.asset?.stock || 1)) {
      setError('Invalid quantity');
      return;
    }
    // Prevent duplicate asset+date in cart
    const cartKey = `${requestModal.asset.id}-${requestDate.toISOString().slice(0,10)}`;
    if (cart.some(item => item.cartKey === cartKey)) {
      setError('You already added this asset for this date');
      return;
    }
    
    const newCartItem = {
      asset: requestModal.asset,
      requestDate: requestDate.toISOString().slice(0,10),
      untilWhen: untilWhen.toISOString().slice(0,10),
      quantity: requestQty,
      cartKey: cartKey
    };
    
    setCart([...cart, newCartItem]);
    setRequestModal({ open: false, asset: null });
    setRequestDate(null);
    setUntilWhen(null);
    setRequestQty(1);
    setError('');
    
    // Show success message
    setSuccess(`✅ ${requestModal.asset.name} added to cart!`);
    setTimeout(() => setSuccess(''), 3000);
    
    console.log('🛒 Item added to cart:', newCartItem);
  };

  // Remove item from cart
  const removeFromCart = (idx) => {
    const removedItem = cart[idx];
    setCart(cart.filter((_, i) => i !== idx));
    console.log('🗑️ Item removed from cart:', removedItem?.asset?.name);
    
    // Show success message
    setSuccess(`🗑️ ${removedItem?.asset?.name || 'Item'} removed from cart`);
    setTimeout(() => setSuccess(''), 3000);
  };

  // Show checkout confirmation modal
  const handleCheckoutClick = () => {
    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }
    setShowCheckoutConfirm(true);
  };

  // Submit all requests in cart (after confirmation)
  const handleSubmitCart = async () => {
    setShowCheckoutConfirm(false);
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const items = cart.map(item => ({
        asset_id: item.asset.id,
        request_date: item.requestDate,
        until_when: item.untilWhen || item.requestDate, // Fallback to requestDate if untilWhen is not set
        quantity: item.quantity
      }));
      await axios.post('/api/resident/assets/request', { items });
      setSuccess('✅ Request(s) submitted successfully!');
      setCart([]);
      localStorage.removeItem('assetCart'); // Clear cart from localStorage
      console.log('🎉 Checkout successful! Cart cleared.');
    } catch (err) {
      console.error('Asset request error:', err);
      
      // Handle specific error cases
      if (err.response?.status === 401) {
        setError('You need to be logged in to request assets. Please log in and try again.');
      } else if (err.response?.status === 403) {
        const errorData = err.response?.data;
        if (errorData?.redirect) {
          setError(`${errorData.message} Please complete your profile first.`);
        } else {
          setError('You need to complete your profile to request assets. Please complete your profile first.');
        }
      } else if (err.response?.status === 422) {
        setError('Please check your request details and try again.');
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Request timed out. Please check your internet connection and try again.');
      } else {
        setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Request failed. Please try again.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ['All', ...new Set(assets.map(item => item.category))];

  // Enhanced filtering
  const filteredAssets = assets.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(item.category);
    
    return matchesCategory && matchesSearch && matchesPrice && matchesBrand;
  });

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });


  // Get available dates for date picker (limited to 5 days ahead)
  const getAvailableDates = (asset) => {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 5); // 5 days ahead
    
    const availableDates = [];
    for (let d = new Date(today); d <= maxDate; d.setDate(d.getDate() + 1)) {
      availableDates.push(new Date(d));
    }
    
    return availableDates;
  };

  // Helper function to process images for carousel
  const processImages = (asset) => {
    if (!asset) return [];
    
    // Since we now process images in fetch functions, just return the image array
    if (asset.image && Array.isArray(asset.image)) {
      return asset.image;
    }
    
    // Fallback for single image strings
    if (asset.image && typeof asset.image === 'string') {
      return [asset.image];
    }
    
    return [];
  };

  // Wishlist functionality
  const toggleWishlist = (asset) => {
    setWishlist(prev => {
      const isInWishlist = prev.some(item => item.id === asset.id);
      if (isInWishlist) {
        return prev.filter(item => item.id !== asset.id);
      } else {
        return [...prev, asset];
      }
    });
  };

  const isInWishlist = (asset) => {
    return wishlist.some(item => item.id === asset.id);
  };

  // Quick view functionality
  const openQuickView = (asset) => {
    setQuickViewModal({ open: true, asset });
  };

  // Check if user profile is complete
  const isProfileCompleteForUser = user?.profile ? isProfileComplete(user.profile) : false;
  const needsProfileCompletion = user && !isProfileCompleteForUser;

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show profile completion message if needed
  if (needsProfileCompletion) {
    return (
      <>
        <Navbares />
        <Sidebares />
        <main className={mainClasses}>
          <div className="w-full max-w-4xl mx-auto p-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-yellow-800 mb-4">Profile Completion Required</h2>
              <p className="text-yellow-700 mb-6">
                You need to complete your profile before you can request assets. Please complete your profile information including:
              </p>
              <ul className="text-left text-yellow-700 mb-6 max-w-md mx-auto">
                <li>• Personal information (name, birth date, address)</li>
                <li>• Profile photo</li>
                <li>• Residency verification</li>
              </ul>
              <Link 
                to="/user/profile"
                className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <UserIcon className="w-5 h-5" />
                Complete Profile
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbares />
      <Sidebares />
      <main className={mainClasses}>
        {/* Simplified background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-green-200 to-teal-200 rounded-full opacity-15 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full opacity-10 animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="w-full max-w-[98%] mx-auto space-y-10 relative z-10 px-2 lg:px-4">
          
          {/* Header Section */}
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full shadow-xl mb-4">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9Z"/>
              </svg>
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <h1 className="text-5xl font-bold text-emerald-700 tracking-tight">
                Asset Requests
              </h1>
              <button
                onClick={() => fetchAssets(true)}
                className="p-2 bg-green-100 hover:bg-green-200 rounded-full transition-colors duration-200"
                title="Refresh Assets"
              >
                <svg 
                  className="w-5 h-5 text-green-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Browse and request barangay assets for your community needs
            </p>
          </div>
          {/* Enhanced Search and Controls */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border-2 border-gray-100 p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Enhanced Search Bar */}
              <div className="relative flex-1 group">
                <input
                  type="text"
                  placeholder="Search for assets by name, category, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white shadow-sm hover:shadow-md transition-all duration-300"
                />
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-3.5 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
              
              {/* Category Dropdown */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white min-w-[170px] font-medium shadow-sm hover:shadow-md transition-all duration-300"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white min-w-[170px] font-medium shadow-sm hover:shadow-md transition-all duration-300"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Sort by Rating</option>
              </select>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3.5 rounded-xl font-medium transition-all duration-300 shadow-sm hover:shadow-md ${
                  showFilters 
                    ? 'bg-emerald-600 text-white border-2 border-emerald-600' 
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-emerald-300'
                }`}
              >
                <FunnelIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 transition-all duration-300 ${viewMode === 'grid' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  title="Grid View"
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 transition-all duration-300 ${viewMode === 'list' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  title="List View"
                >
                  <Bars3Icon className="w-5 h-5" />
                </button>
              </div>

              {/* View Status Button */}
              <Link to="/residents/statusassetrequests">
                <button className="flex items-center gap-2 px-4 py-3.5 text-sm font-bold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 shadow-sm hover:shadow-md">
                  <EyeIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">View Status</span>
                </button>
              </Link>

              {/* Cart Button */}
              <button 
                onClick={() => setShowCartDrawer(true)}
                className="relative flex items-center gap-2 px-5 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl hover:from-emerald-700 hover:to-green-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <ShoppingBagIcon className="w-5 h-5" />
                <span>Cart ({cart.length})</span>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>


          {/* Enhanced Category Tabs with Icons */}
          <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(category => {
              // Get category icon component
              const getCategoryIcon = (cat) => {
                const iconClass = "w-5 h-5";
                switch(cat) {
                  case 'All': return <BuildingLibraryIcon className={iconClass} />;
                  case 'Furniture': return <HomeModernIcon className={iconClass} />;
                  case 'Health &amp; Safety': return <ShieldIcon className={iconClass} />;
                  case 'tent': return <CubeIcon className={iconClass} />;
                  case 'Electronics': return <BoltIcon className={iconClass} />;
                  case 'Event Equipment': return <SparklesIcon className={iconClass} />;
                  default: return <CubeIcon className={iconClass} />;
                }
              };
              
              const categoryCount = category === 'All' ? sortedAssets.length : sortedAssets.filter(a => a.category === category).length;
              
              return (
                <button 
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`group relative flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/30 scale-105'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-emerald-300 hover:shadow-md hover:scale-102'
                  }`}
                >
                  {getCategoryIcon(category)}
                  <span>{category}</span>
                  {categoryCount > 0 && (
                    <span className={`ml-1 px-2 py-0.5 text-xs font-bold rounded-full ${
                      selectedCategory === category
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {categoryCount}
                    </span>
                  )}
                  {selectedCategory === category && (
                    <div className="absolute -bottom-1 left-0 right-0 h-1 bg-white rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Main Content Area */}
          <div className="flex gap-8">
            {/* Sidebar Filters */}
            {showFilters && (
              <div className="w-64 bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit">
                <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
                
                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Price Range</h4>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="100"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>₱{priceRange[0]}</span>
                      <span>₱{priceRange[1]}</span>
                  </div>
              </div>
                  </div>

                {/* Categories */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Categories</h4>
                  <div className="space-y-2">
                    {categories.slice(1).map(category => (
                      <label key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBrands([...selectedBrands, category]);
                            } else {
                              setSelectedBrands(selectedBrands.filter(b => b !== category));
                            }
                          }}
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() => {
                    setPriceRange([0, 10000]);
                    setSelectedBrands([]);
                    setSelectedCategory('All');
                  }}
                  className="w-full text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Clear All Filters
                </button>
                  </div>
                )}

            {/* Products Grid */}
            <div className="flex-1">


              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {sortedAssets.length} Products
                    </h2>
                    {isUsingCache && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Cached
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Showing results for {selectedCategory === 'All' ? 'all categories' : selectedCategory}
                  </p>
                  </div>
                <div className="text-sm text-gray-500">
                  Page 1 of 1
              </div>
            </div>

              {/* Enhanced Product Grid */}
              <div className={`grid gap-8 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
            {loading ? (
              // Modern Loading Skeleton
              [...Array(8)].map((_, i) => (
                    <div key={i} className={`bg-white rounded-2xl shadow-md border-2 border-gray-100 overflow-hidden ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}>
                      <div className={`bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse ${viewMode === 'list' ? 'w-48 h-32' : 'h-56'}`}>
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-white/50"></div>
                        </div>
                      </div>
                      <div className="p-5 space-y-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-2/3 animate-pulse"></div>
                          <div className="h-6 w-12 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg animate-pulse"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-full animate-pulse"></div>
                          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-4/5 animate-pulse"></div>
                        </div>
                        <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                          <div className="h-7 w-24 bg-gradient-to-r from-green-100 to-green-200 rounded-lg animate-pulse"></div>
                          <div className="h-7 w-20 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg animate-pulse"></div>
                        </div>
                    <div className="flex items-center justify-between pt-3">
                          <div className="h-8 bg-gradient-to-r from-emerald-200 to-green-200 rounded-lg w-24 animate-pulse"></div>
                          <div className="h-10 bg-gradient-to-r from-emerald-400 to-green-400 rounded-xl w-32 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : sortedAssets.length === 0 ? (
              // Enhanced Empty State
              <div className="col-span-full text-center py-20">
                <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
                  <div className="relative">
                    <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                      <ShoppingBagIcon className="w-16 h-16 text-gray-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <MagnifyingGlassIcon className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-900 font-bold text-2xl">No Assets Found</p>
                    <p className="text-gray-600 text-base">We couldn't find any assets matching your criteria</p>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-100 rounded-xl p-6 space-y-3">
                    <p className="text-sm font-semibold text-emerald-900">Try these suggestions:</p>
                    <ul className="text-sm text-gray-700 space-y-2 text-left">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-0.5">•</span>
                        <span>Check your spelling or try different keywords</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-0.5">•</span>
                        <span>Remove some filters to see more results</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-0.5">•</span>
                        <span>Browse all categories for available assets</span>
                      </li>
                    </ul>
                  </div>
                  {(searchTerm || selectedCategory !== 'All') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('All');
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-green-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                    >
                      <ArrowPathIcon className="w-5 h-5" />
                      Clear All Filters
                    </button>
                  )}
                </div>
              </div>
            ) : (
              sortedAssets.map((item) => (
                <div
                  key={item.id}
                      className={`group relative bg-white rounded-2xl shadow-md border-2 border-gray-100 overflow-hidden hover:shadow-2xl hover:border-emerald-200 hover:-translate-y-2 transition-all duration-500 cursor-pointer ${
                        viewMode === 'list' ? 'flex' : ''
                      }`}
                  onClick={() => openDetailModal(item.id)}
                >
                      {/* Gradient Overlay on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-green-500/0 group-hover:from-emerald-500/5 group-hover:to-green-500/5 transition-all duration-500 pointer-events-none z-10"></div>
                      
                      {/* Product Image */}
                      <div className={`relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden ${
                        viewMode === 'list' ? 'w-48 h-32' : 'h-56'
                      }`}>
                        {processImages(item).length > 0 ? (
                          <ImageCarousel
                            images={processImages(item)}
                            alt={item.name}
                            className="w-full h-full group-hover:scale-110 transition-transform duration-700"
                            showDots={false}
                            showArrows={false}
                            autoPlay={true}
                            autoPlayInterval={3000}
                            onImageClick={() => openDetailModal(item.id)}
                          />
                        ) : (
                          // Enhanced No Image Placeholder
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 group-hover:from-emerald-50 group-hover:to-green-50 transition-all duration-500">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-500">
                              <svg className="w-10 h-10 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                              </svg>
                            </div>
                            <p className="text-sm font-semibold text-gray-500 mb-1">No Image Available</p>
                            <p className="text-xs text-gray-400">Preview Coming Soon</p>
                          </div>
                        )}
                        
                        {/* Product Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
                          <span className={`px-3 py-1.5 text-xs font-bold rounded-full backdrop-blur-sm shadow-lg ${
                            item.status === 'available' ? 'bg-emerald-500 text-white' :
                            item.status === 'rented' ? 'bg-red-500 text-white' :
                            'bg-gray-500 text-white'
                          }`}>
                            {item.status || 'Available'}
                          </span>
                          {item.stock < 5 && item.stock > 0 && (
                            <span className="px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full backdrop-blur-sm shadow-lg animate-pulse">
                              Only {item.stock} Left
                            </span>
                          )}
                          {item.stock === 0 && (
                            <span className="px-3 py-1.5 text-xs font-bold bg-gray-900 text-white rounded-full backdrop-blur-sm shadow-lg">
                              Out of Stock
                            </span>
                          )}
                    </div>
                        
                        {/* Quick Actions */}
                        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300 z-20">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(item);
                            }}
                            className="p-2.5 bg-white rounded-full shadow-lg hover:bg-red-50 hover:scale-110 transition-all duration-300"
                            title="Add to Wishlist"
                          >
                            {isInWishlist(item) ? (
                              <HeartSolidIcon className="w-5 h-5 text-red-500" />
                            ) : (
                              <HeartIcon className="w-5 h-5 text-gray-600" />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openQuickView(item);
                            }}
                            className="p-2.5 bg-white rounded-full shadow-lg hover:bg-emerald-50 hover:scale-110 transition-all duration-300"
                            title="Quick View"
                          >
                            <EyeIcon className="w-5 h-5 text-emerald-600" />
                          </button>
                    </div>
                        
                        {/* Category Badge */}
                        <div className="absolute bottom-3 left-3 z-20">
                          <span className="px-3 py-1.5 text-xs font-bold bg-white/90 backdrop-blur-sm text-emerald-700 rounded-full shadow-md border border-emerald-200">
                            {item.category}
                          </span>
                    </div>
                  </div>

                      {/* Product Info */}
                      <div className={`p-5 ${viewMode === 'list' ? 'flex-1' : ''} relative z-10`}>
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-gray-900 text-base line-clamp-2 group-hover:text-emerald-600 transition-colors flex-1 leading-tight">
                        {item.name}
                      </h3>
                          <div className="flex items-center gap-1 ml-2 bg-yellow-50 px-2 py-1 rounded-lg">
                            <StarSolidIcon className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-bold text-gray-700">{item.rating || 4.5}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                        
                        {/* Features */}
                        <div className="flex items-center gap-4 text-xs text-gray-600 mb-4 pb-4 border-b border-gray-100">
                          <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-lg">
                            <TruckIcon className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-green-700">Free Delivery</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg">
                            <ShieldCheckIcon className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold text-blue-700">Verified</span>
                          </div>
                    </div>

                        {/* Price and Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-2xl font-extrabold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                              ₱{item.price && !isNaN(Number(item.price)) ? Number(item.price).toFixed(2) : '0.00'}
                            </span>
                            {item.stock > 0 && (
                              <div className="flex items-center gap-1 mt-1">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-xs text-green-700 font-bold">
                                  {item.stock} Available
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={e => { e.stopPropagation(); openRequestModal(item); }}
                              className={`font-bold text-sm px-5 py-3 rounded-xl transition-all duration-300 shadow-lg ${
                                item.stock < 1 
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                  : 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 hover:shadow-xl hover:scale-105 active:scale-95'
                              }`}
                              disabled={item.stock < 1}
                            >
                              {item.stock < 1 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Cart Drawer */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowCartDrawer(false)}></div>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Shopping Cart</h2>
                <button
                  onClick={() => setShowCartDrawer(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                            <ImageCarousel
                              images={processImages(item.asset)}
                              alt={item.asset.name}
                              className="w-full h-full"
                              showDots={false}
                              showArrows={false}
                              autoPlay={false}
                            />
                          </div>
                          <div className="absolute -top-2 -right-2 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 text-sm">{item.asset.name}</h3>
                          <div className="text-xs text-gray-500 flex items-center gap-4 mt-1 flex-wrap">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              Start: {item.requestDate}
                            </span>
                            {item.untilWhen && (
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="w-3 h-3" />
                                End: {item.untilWhen}
                              </span>
                            )}
                            {item.requestDate && item.untilWhen && (
                              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                ({calculateDuration(new Date(item.requestDate), new Date(item.untilWhen))} day{calculateDuration(new Date(item.requestDate), new Date(item.untilWhen)) !== 1 ? 's' : ''})
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-semibold text-gray-900 mt-1">
                            ₱{(item.asset.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                        <button 
                          onClick={() => removeFromCart(idx)} 
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {cart.length > 0 && (
                <div className="border-t border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-emerald-600">
                      ₱{cart.reduce((sum, item) => sum + (item.asset.price * item.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={handleCheckoutClick}
                    disabled={submitting || cart.length === 0}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingBagIcon className="w-4 h-4" />
                        Checkout Now
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Confirmation Modal */}
      {showCheckoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Confirm Checkout</h3>
                  <p className="text-emerald-100 text-sm mt-1">Review your order before proceeding</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Order Summary */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Order Summary
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Items:</span>
                    <span className="font-semibold text-gray-900">{cart.reduce((sum, item) => sum + item.quantity, 0)} items</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Requests:</span>
                    <span className="font-semibold text-gray-900">{cart.length} request(s)</span>
                  </div>
                  {/* Request Details */}
                  {cart.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-emerald-200">
                      <p className="text-xs font-semibold text-emerald-900 mb-2">Request Details:</p>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {cart.map((item, idx) => (
                          <div key={idx} className="text-xs bg-white/50 rounded-lg p-2">
                            <div className="font-medium text-gray-900">{item.asset.name}</div>
                            <div className="text-gray-600 mt-1">
                              <div>Start: {item.requestDate}</div>
                              {item.untilWhen && (
                                <>
                                  <div>End: {item.untilWhen}</div>
                                  <div className="text-emerald-600 font-medium">
                                    Duration: {calculateDuration(new Date(item.requestDate), new Date(item.untilWhen))} day{calculateDuration(new Date(item.requestDate), new Date(item.untilWhen)) !== 1 ? 's' : ''}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="pt-2 mt-2 border-t border-emerald-200 flex justify-between">
                    <span className="font-semibold text-emerald-900">Total Amount:</span>
                    <span className="text-xl font-bold text-emerald-600">
                      ₱{cart.reduce((sum, item) => sum + (item.asset.price * item.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Confirmation Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 mb-1">Are you sure you want to proceed?</p>
                  <p className="text-sm text-blue-700">
                    Your asset request(s) will be submitted to the barangay staff for processing. You will receive a notification once approved.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-50 px-6 py-4 flex gap-3">
              <button
                onClick={() => setShowCheckoutConfirm(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCart}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewModal.open && quickViewModal.asset && (
        <Modal onClose={() => setQuickViewModal({ open: false, asset: null })}>
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <ImageCarousel
                    images={processImages(quickViewModal.asset)}
                    alt={quickViewModal.asset.name}
                    className="w-full h-full"
                    showDots={true}
                    showArrows={true}
                    autoPlay={false}
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{quickViewModal.asset.name}</h2>
                    <p className="text-sm text-gray-500">{quickViewModal.asset.category}</p>
                  </div>
                  
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                        <StarSolidIcon
                            key={i}
                          className={`w-4 h-4 ${(i < Math.floor(quickViewModal.asset.rating || 0)) ? 'text-yellow-400' : 'text-gray-300'}`}
                        />
                        ))}
                      </div>
                    <span className="text-sm text-gray-600">({quickViewModal.asset.reviews || 0} reviews)</span>
                    </div>

                  <div className="text-2xl font-bold text-gray-900">
                    ₱{quickViewModal.asset.price && !isNaN(Number(quickViewModal.asset.price)) ? Number(quickViewModal.asset.price).toFixed(2) : '0.00'}
                      </div>
                  
                  <p className="text-sm text-gray-600">{quickViewModal.asset.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <TruckIcon className="w-4 h-4" />
                      <span>Free Delivery</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ShieldCheckIcon className="w-4 h-4" />
                      <span>Secure Booking</span>
                      </div>
                    </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setQuickViewModal({ open: false, asset: null });
                        openRequestModal(quickViewModal.asset);
                      }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => {
                        toggleWishlist(quickViewModal.asset);
                      }}
                      className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {isInWishlist(quickViewModal.asset) ? (
                        <HeartSolidIcon className="w-5 h-5 text-red-500" />
                      ) : (
                        <HeartIcon className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
          </div>
        </div>
          </div>
        </Modal>
      )}

      {/* CSS Utilities */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      {/* Product Detail Modal */}
      {detailModal.open && detailModal.asset && (
        <Modal onClose={() => setDetailModal({ open: false, asset: null })}>
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-white rounded-lg">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                {/* Product Images */}
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <ImageCarousel
                      images={processImages(detailModal.asset)}
                      alt={detailModal.asset.name}
                      className="w-full h-full"
                      showDots={true}
                      showArrows={true}
                      autoPlay={false}
                    />
            </div>
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                  <div>
            <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        detailModal.asset.status === 'available' ? 'bg-green-100 text-green-800' :
                        detailModal.asset.status === 'rented' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {detailModal.asset.status || 'Available'}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {detailModal.asset.category}
                      </span>
            </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{detailModal.asset.name}</h1>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${(i < Math.floor(detailModal.asset.rating || 0)) ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({detailModal.asset.reviews || 0} reviews)</span>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-gray-900">
                        ₱{detailModal.asset.price && !isNaN(Number(detailModal.asset.price)) ? Number(detailModal.asset.price).toFixed(2) : '0.00'}
                      </span>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-600 leading-relaxed">{detailModal.asset.description}</p>
                    </div>

                    {/* Product Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-500">Stock Available</span>
                        <span className="text-sm text-gray-900">{detailModal.asset.stock} units</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-500">Condition</span>
                        <span className="text-sm text-gray-900 capitalize">{detailModal.asset.condition || 'Good'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-500">Available Dates</span>
                        <span className="text-sm text-gray-900">{detailModal.asset.available_dates?.join(', ') || 'Flexible'}</span>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
            <button
              onClick={() => { setDetailModal({ open: false, asset: null }); openRequestModal(detailModal.asset); }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={detailModal.asset.stock < 1}
            >
              <ShoppingBagIcon className="w-5 h-5" />
                      {detailModal.asset.stock < 1 ? 'Out of Stock' : 'Add to Cart'}
            </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Enhanced Add to Cart Modal */}
      {requestModal.open && requestModal.asset && (
        <Modal onClose={() => setRequestModal({ open: false, asset: null })}>
          <div className="max-w-lg w-full">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Enhanced Product Summary with Gradient Header */}
              <div className="relative bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 p-6">
                {/* Close Button */}
                <button
                  onClick={() => setRequestModal({ open: false, asset: null })}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm shadow-lg ring-2 ring-white/20">
                    <ImageCarousel
                      images={processImages(requestModal.asset)}
                      alt={requestModal.asset.name}
                      className="w-full h-full"
                      showDots={false}
                      showArrows={false}
                      autoPlay={false}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg mb-1">{requestModal.asset.name}</h3>
                    <p className="text-sm text-white/80 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {requestModal.asset.category}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-white font-bold text-lg">
                        ₱{requestModal.asset.price && !isNaN(Number(requestModal.asset.price)) ? Number(requestModal.asset.price).toFixed(2) : '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Request Form */}
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Request Details</h2>
                </div>
                
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
                  <label className="flex items-center gap-2 text-sm font-semibold text-emerald-800 mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Select Date
                  </label>
              <DatePicker
                selected={requestDate}
                onChange={date => {
                  const previousRequestDate = requestDate;
                  setRequestDate(date);
                  // Automatically set "Until When" to the same date when Request Date is selected
                  if (date) {
                    // If this is the first time selecting a request date, or if request date changed, set untilWhen to the new request date
                    if (!previousRequestDate || previousRequestDate.getTime() !== date.getTime()) {
                      setUntilWhen(date);
                    }
                  } else {
                    setUntilWhen(null);
                  }
                  // Clear error when user selects a date
                  if (error && (error.includes('request date') || error.includes('return date') || error.includes('maximum allowed'))) {
                    setError('');
                  }
                }}
                minDate={new Date()}
                    maxDate={new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)} // 5 days from now
                    placeholderText="Choose a date (next 5 days only)"
                    className="w-full border-2 border-emerald-300 bg-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-gray-900 shadow-sm"
                    dateFormat="MMM dd, yyyy"
                popperContainer={({ children }) => (
                  <div className="datepicker-popper-container">
                    {children}
                  </div>
                )}
                onCalendarOpen={() => {
                  const popper = document.querySelector('.react-datepicker-popper');
                  if (popper) {
                    popper.style.zIndex = '9999';
                  }
                }}
                onCalendarClose={() => {
                  const poppers = document.querySelectorAll('.react-datepicker-popper');
                  poppers.forEach(popper => {
                    if (popper && popper.parentNode) {
                      try {
                        popper.parentNode.removeChild(popper);
                      } catch (e) {
                        console.warn('DatePicker cleanup warning:', e);
                      }
                    }
                  });
                }}
              />
                  <div className="flex items-center gap-2 mt-3 text-xs text-emerald-700 bg-white/50 rounded-lg px-3 py-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>You can only select dates within the next 5 days from today</span>
                  </div>
                </div>

                {/* Until When Date Field */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <label className="flex items-center gap-2 text-sm font-semibold text-purple-800 mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Until When (Date of Return or End of Use) <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    selected={untilWhen}
                    onChange={date => {
                      setUntilWhen(date);
                      // Validate in real-time based on Request Date
                      if (date && requestDate) {
                        const requestDateOnly = new Date(requestDate.getFullYear(), requestDate.getMonth(), requestDate.getDate());
                        const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                        const maxAllowedDate = getMaxAllowedDate(requestDate);
                        maxAllowedDate.setHours(23, 59, 59, 999);
                        
                        if (selectedDate < requestDateOnly) {
                          setError('The return date cannot be earlier than the request date.');
                        } else if (selectedDate > maxAllowedDate) {
                          setError('The maximum allowed duration for asset usage is 7 days from the request date.');
                        } else {
                          // Check duration to ensure it doesn't exceed 8 days (7 days from request date = 8 days total)
                          const duration = calculateDuration(requestDate, date);
                          if (duration > 8) {
                            setError('The maximum allowed duration for asset usage is 7 days from the request date.');
                          } else if (error && (error.includes('return date') || error.includes('end date') || error.includes('End date') || error.includes('maximum allowed'))) {
                            setError('');
                          }
                        }
                      }
                    }}
                    minDate={requestDate || new Date()}
                    maxDate={requestDate ? getMaxAllowedDate(requestDate) : new Date()}
                    placeholderText={requestDate ? "Select the final day you will use the asset (up to 7 days from request date)" : "Select request date first"}
                    className="w-full border-2 border-purple-300 bg-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm font-medium text-gray-900 shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
                    dateFormat="MMM dd, yyyy"
                    required
                    disabled={!requestDate}
                    popperContainer={({ children }) => (
                      <div className="datepicker-popper-container">
                        {children}
                      </div>
                    )}
                    onCalendarOpen={() => {
                      const popper = document.querySelector('.react-datepicker-popper');
                      if (popper) {
                        popper.style.zIndex = '9999';
                      }
                    }}
                    onCalendarClose={() => {
                      const poppers = document.querySelectorAll('.react-datepicker-popper');
                      poppers.forEach(popper => {
                        if (popper && popper.parentNode) {
                          try {
                            popper.parentNode.removeChild(popper);
                          } catch (e) {
                            console.warn('DatePicker cleanup warning:', e);
                          }
                        }
                      });
                    }}
                  />
                  <div className="flex items-center gap-2 mt-3 text-xs text-purple-700 bg-white/50 rounded-lg px-3 py-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      {requestDate 
                        ? `Select the final day you will use the asset. Must be on or after the request date (${requestDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}), up to 7 days from the request date.`
                        : 'Select the final day you will use the asset. Please select a request date first.'}
                    </span>
                  </div>
                  {/* Duration Display */}
                  {requestDate && untilWhen && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-purple-800">Request Duration:</span>
                        <span className="text-lg font-bold text-purple-900">
                          {calculateDuration(requestDate, untilWhen)} day{calculateDuration(requestDate, untilWhen) !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-purple-700">
                        <div className="flex justify-between">
                          <span>Request Date: {requestDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span>Return Date: {untilWhen.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <label className="flex items-center gap-2 text-sm font-semibold text-blue-800 mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    Quantity
                  </label>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => setRequestQty(Math.max(1, requestQty - 1))}
                      className="w-10 h-10 rounded-xl border-2 border-blue-300 bg-white flex items-center justify-center hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 shadow-sm"
                    >
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
              <input
                type="number"
                min={1}
                max={requestModal.asset.stock}
                value={requestQty}
                onChange={e => setRequestQty(Number(e.target.value))}
                      className="w-20 text-center border-2 border-blue-300 bg-white rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold text-lg text-gray-900 shadow-sm"
                    />
                    <button
                      onClick={() => setRequestQty(Math.min(requestModal.asset.stock, requestQty + 1))}
                      className="w-10 h-10 rounded-xl border-2 border-blue-300 bg-white flex items-center justify-center hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 shadow-sm"
                    >
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
            </div>
                  <div className="flex items-center justify-center gap-2 mt-3 text-xs text-blue-700 bg-white/50 rounded-lg px-3 py-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="font-medium">{requestModal.asset.stock} items available</span>
                  </div>
                </div>

                {error && (
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-800 mb-1">Request Error</p>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setRequestModal({ open: false, asset: null })}
                    className="flex-1 px-6 py-3.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                  >
                    Cancel
                  </button>
            <button
              onClick={addToCart}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl px-6 py-3.5 flex items-center justify-center gap-2"
            >
                    <PlusIcon className="w-5 h-5" />
                    Add to Cart
            </button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};


const badge = (text, color, icon = null) => (
  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${color}`}>
    {icon && icon}
    {text}
  </span>
);

const getAvailabilityColor = (availability) => {
  switch (availability) {
    case 'In Stock':
      return 'bg-green-100 text-green-800';
    case 'Limited':
      return 'bg-yellow-100 text-yellow-800';
    case 'Available':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getAvailabilityIcon = (availability) => {
  switch (availability) {
    case 'In Stock':
      return <CheckCircleIcon className="w-3 h-3" />;
    case 'Limited':
      return <ExclamationTriangleIcon className="w-3 h-3" />;
    case 'Available':
      return <ClockIcon className="w-3 h-3" />;
    default:
      return <ClockIcon className="w-3 h-3" />;
  }
};

// Modal component
const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white rounded-2xl shadow-2xl relative animate-fade-in-up">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100"
        aria-label="Close"
      >
        <XMarkIcon className="w-6 h-6 text-gray-500" />
      </button>
      {children}
    </div>
  </div>
);

export default RequestAssets;
