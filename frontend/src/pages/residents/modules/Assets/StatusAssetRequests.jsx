import React, { useEffect, useState } from 'react';
import axios from '../../../../utils/axiosConfig'; // Adjust path if needed
import { Link } from 'react-router-dom';
import Navbares from "../../../../components/Navbares";
import Sidebares from "../../../../components/Sidebares";
import {
  EyeIcon,
  TrashIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  MinusIcon,
  XMarkIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const StatusAssetRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDeleted, setLastDeleted] = useState(null);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [activeTab, setActiveTab] = useState('history'); // 'history' or 'assets'
  const [assets, setAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/resident/asset-requests');
      
      // Handle the response data properly
      let data = response.data;
      
      // If data is an array, use it directly
      if (Array.isArray(data)) {
        setRequests(data);
      }
      // If data has a data property (common Laravel API structure)
      else if (data && Array.isArray(data.data)) {
        setRequests(data.data);
      }
      else {
        // If we can't parse the response, show empty array
        setRequests([]);
      }
    } catch (err) {
      console.error('Error fetching asset requests:', err);
      setError('Failed to load requests');
      // Show empty array on error
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchAssets = async () => {
    try {
      setAssetsLoading(true);
      // Fetch paid request assets instead of available assets
      const response = await axios.get('/api/resident/asset-requests');
      
      // Handle the response data properly
      let data = response.data;
      
      // If data is an array, use it directly
      if (Array.isArray(data)) {
        // Filter only paid requests
        const paidRequests = data.filter(item => getPaymentStatus(item) === 'paid');
        setAssets(paidRequests);
      }
      // If data has a data property (common Laravel API structure)
      else if (data && Array.isArray(data.data)) {
        // Filter only paid requests
        const paidRequests = data.data.filter(item => getPaymentStatus(item) === 'paid');
        setAssets(paidRequests);
      }
      else {
        // If we can't parse the response, show empty array
        setAssets([]);
      }
    } catch (err) {
      console.error('Error fetching paid assets:', err);
      setAssets([]);
    } finally {
      setAssetsLoading(false);
    }
  };

  // Fetch assets when switching to assets tab
  useEffect(() => {
    if (activeTab === 'assets' && assets.length === 0) {
      fetchAssets();
    }
  }, [activeTab]);

  // No longer using localStorage
  const updateLocalStorage = (newRequests) => {
    // Not implemented - we're using the API instead
  };

  const handleDelete = async (indexToRemove) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        const itemToDelete = requests[indexToRemove];
        // Call API to delete the request
        await axios.delete(`/api/resident/asset-requests/${itemToDelete.id}`);
        
        // Update local state
        const updated = requests.filter((_, i) => i !== indexToRemove);
        setRequests(updated);
        setLastDeleted({ item: itemToDelete, index: indexToRemove });
      } catch (err) {
        console.error('Error deleting request:', err);
        alert('Failed to delete request. Please try again.');
      }
    }
  };

  const handleUndo = async () => {
    if (lastDeleted) {
      // We can't actually undo a delete operation, so we'll just remove the undo state
      setLastDeleted(null);
      // Refresh the list to show current state
      await fetchRequests();
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to refresh the request list? This will clear any local changes.')) {
      // Refresh the list from the API
      await fetchRequests();
      setLastDeleted(null);
    }
  };

  // Helper function to safely render text content
  const renderText = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string' || typeof value === 'number') return value;
    if (typeof value === 'object') {
      // If it's an object, try to find a name or title property
      if (value.name) return value.name;
      if (value.title) return value.title;
      if (value.asset_name) return value.asset_name;
      // If none found, return a string representation
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Helper function to get asset name
  const getAssetName = (item) => {
    // Handle the API structure from admin controller
    if (item.asset && typeof item.asset === 'object' && item.asset.name) {
      return item.asset.name;
    }
    // Fallback for other structures
    if (typeof item.asset === 'string') return item.asset;
    if (item.asset_name) return item.asset_name;
    if (item.name) return item.name;
    return 'Unknown Asset';
  };

  // Helper function to get all assets in a request
  const getAllAssets = (item) => {
    // If the new API structure with items is available, use it
    if (item.items && Array.isArray(item.items) && item.items.length > 0) {
      return item.items.map(itemData => ({
        name: itemData.asset ? itemData.asset.name : 'Unknown Asset',
        price: parseFloat(itemData.asset ? itemData.asset.price : 0) || 0,
        quantity: itemData.quantity || 1,
        category: itemData.asset ? itemData.asset.category : '',
        condition: itemData.asset ? itemData.asset.condition : '',
        request_date: itemData.request_date,
        start_time: itemData.start_time,
        end_time: itemData.end_time,
        notes: itemData.notes,
        rental_duration_days: itemData.rental_duration_days || 1,
        return_date: itemData.return_date,
        is_returned: itemData.is_returned || false,
        returned_at: itemData.returned_at,
        remaining_rental_time: itemData.remaining_rental_time,
        needs_return: itemData.needs_return || false,
        // Add tracking information
        tracking_number: itemData.tracking_number || null,
        tracking_generated_at: itemData.tracking_generated_at || null,
        tracking_generated_by: itemData.tracking_generated_by || null,
        tracking_info: itemData.tracking_info || null,
        rating: itemData.rating || 0
      }));
    }
    
    // Fallback to single asset for backward compatibility
    return [{
      name: getAssetName(item),
      price: getAmount(item),
      quantity: 1,
      category: '',
      condition: '',
      request_date: getDate(item),
      start_time: null,
      end_time: null,
      notes: null,
      rental_duration_days: 1,
      return_date: null,
      is_returned: false,
      returned_at: null,
      remaining_rental_time: null,
      needs_return: false,
      // Add tracking information (fallback)
      tracking_number: null,
      tracking_generated_at: null,
      tracking_generated_by: null,
      tracking_info: null
    }];
  };

  // Helper function to get date
  const getDate = (item) => {
    // Handle the API structure from admin controller
    if (item.request_date) return item.request_date;
    if (item.date) return item.date;
    if (item.created_at) return new Date(item.created_at).toLocaleDateString();
    return 'N/A';
  };

  // Helper function to get formatted date and time
  const getFormattedDateTime = (item) => {
    let dateString = '';
    
    // Handle the API structure from admin controller
    if (item.request_date) {
      dateString = item.request_date;
    } else if (item.date) {
      dateString = item.date;
    } else if (item.created_at) {
      dateString = item.created_at;
    } else {
      return { date: 'N/A', time: 'N/A' };
    }

    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        time: date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      };
    } catch (error) {
      return { date: 'N/A', time: 'N/A' };
    }
  };

  // Helper function to get status
  const getStatus = (item) => {
    // Handle the API structure from admin controller
    if (item.status) return item.status;
    if (item.request_status) return item.request_status;
    return 'Pending';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'denied': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-orange-600 bg-orange-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Helper function to get tracking steps for Request History (requesting process)
  const getRequestTrackingSteps = (item) => {
    const status = getStatus(item);
    const paymentStatus = getPaymentStatus(item);
    
    const steps = [
      {
        id: 1,
        title: 'Request Submitted',
        description: 'Your request has been submitted',
        status: 'completed',
        icon: <DocumentArrowDownIcon className="w-5 h-5" />
      },
      {
        id: 2,
        title: 'Under Review',
        description: 'Staff is reviewing your request',
        status: status === 'pending' ? 'current' : status === 'approved' || status === 'denied' ? 'completed' : 'pending',
        icon: <EyeIcon className="w-5 h-5" />
      },
      {
        id: 3,
        title: 'Approved',
        description: 'Your request has been approved',
        status: status === 'approved' ? 'completed' : status === 'denied' ? 'error' : 'pending',
        icon: <CheckCircleIcon className="w-5 h-5" />
      },
      {
        id: 4,
        title: 'Payment',
        description: 'Complete your payment',
        status: status === 'approved' && paymentStatus === 'paid' ? 'completed' : 
                status === 'approved' && paymentStatus === 'unpaid' ? 'current' : 'pending',
        icon: <CurrencyDollarIcon className="w-5 h-5" />
      },
      {
        id: 5,
        title: 'Ready for Pickup',
        description: 'Asset is ready for collection',
        status: status === 'approved' && paymentStatus === 'paid' ? 'completed' : 'pending',
        icon: <CheckCircleIcon className="w-5 h-5" />
      }
    ];

    return steps;
  };

  // Helper function to check return process status
  const checkReturnProcessStatus = (item, adminReturnDateTime) => {
    const rentalInfo = getRentalInfo(item);
    const now = new Date();
    
    // Step 1: Check if Picked Up (always true for paid requests)
    const isPickedUp = getPaymentStatus(item) === 'paid';
    
    // Step 2: Rental Period Status - Check if admin-set date/time has passed
    let isRentalPeriodOverdue = false;
    let isRentalPeriodActive = false;
    let isRentalPeriodCompleted = false;
    let remainingTime = null;
    
    if (adminReturnDateTime) {
      const returnDateTime = new Date(adminReturnDateTime.isoString);
      
      // Debug logging
      console.log('Rental Period Check:', {
        adminReturnDateTime: adminReturnDateTime.isoString,
        returnDateTime: returnDateTime.toISOString(),
        now: now.toISOString(),
        isOverdue: now >= returnDateTime,
        isActive: now < returnDateTime
      });
      
      if (now >= returnDateTime) {
        isRentalPeriodOverdue = true;
        isRentalPeriodCompleted = true; // Time has run out, mark as completed
      } else {
        // If admin-set date exists and hasn't been reached, it's active
        isRentalPeriodActive = true;
        // Calculate remaining time
        const diffMs = returnDateTime.getTime() - now.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        remainingTime = { days: diffDays, hours: diffHours, minutes: diffMinutes };
      }
    } else {
      // Fallback to rentalInfo if no admin-set date
      if (rentalInfo.isOverdue) {
        isRentalPeriodOverdue = true;
        isRentalPeriodCompleted = true;
      } else if (rentalInfo.daysRemaining > 0) {
        isRentalPeriodActive = true;
        remainingTime = { days: rentalInfo.daysRemaining, hours: 0, minutes: 0 };
      }
    }
    
    // Step 3: Check if Return Process is completed (uploaded image approved by admin/staff)
    const isReturnProcessCompleted = rentalInfo.isReturned || false;
    
    // Step 4: Check if Rate Product is completed (resident has rated the item)
    const isRated = item.rating && item.rating > 0;
    
    // Step 5: Check if Complete Return (all steps are checked)
    const isCompleteReturn = isPickedUp && isRentalPeriodCompleted && isReturnProcessCompleted && isRated;
    
    return {
      isPickedUp,
      isRentalPeriodOverdue,
      isRentalPeriodActive,
      isRentalPeriodCompleted,
      isReturnProcessCompleted,
      isRated,
      isCompleteReturn,
      remainingTime
    };
  };

  // Helper function to get tracking steps for Your Requested Assets (return process)
  const getReturnTrackingSteps = (item) => {
    const rentalInfo = getRentalInfo(item);
    const adminReturnDateTime = formatAdminSetReturnDateTime(item);
    const status = checkReturnProcessStatus(item, adminReturnDateTime);
    
    const steps = [
      {
        id: 1,
        title: 'Picked Up',
        description: status.isPickedUp ? 'Asset has been picked up and is in your possession' : 'Asset not yet picked up',
        status: status.isPickedUp ? 'completed' : 'pending',
        icon: <CheckCircleIcon className="w-5 h-5" />
      },
      {
        id: 2,
        title: 'Rental Period',
        description: status.isRentalPeriodOverdue ? 'Time limit reached - Return required immediately!' : 
                   status.isRentalPeriodActive ? 'Rental period active' :
                   adminReturnDateTime ? `Return by ${adminReturnDateTime.fullDateTime}` :
                   rentalInfo.isOverdue ? 'Time limit reached - Return required immediately!' :
                   rentalInfo.daysRemaining > 0 ? `${rentalInfo.daysRemaining} day${rentalInfo.daysRemaining !== 1 ? 's' : ''} remaining` :
                   'Rental period active',
        status: status.isRentalPeriodCompleted ? 'completed' : 
               status.isRentalPeriodActive ? 'current' : 'pending',
        icon: <ClockIcon className="w-5 h-5" />,
        showReturnButton: false, // Don't show return button here anymore
        isOverdue: status.isRentalPeriodOverdue || rentalInfo.isOverdue,
        remainingTime: status.remainingTime
      },
      {
        id: 3,
        title: 'Return Process',
        description: status.isReturnProcessCompleted ? 'Return proof uploaded and approved by admin/staff' : 
                   status.isRentalPeriodCompleted ? 'Time limit reached! Click return button and upload proof of return' :
                   'Upload proof of return after rental period expires',
        status: status.isReturnProcessCompleted ? 'completed' : 
               status.isRentalPeriodCompleted ? 'current' : 'pending',
        icon: <ArrowPathIcon className="w-5 h-5" />,
        showReturnButton: !status.isReturnProcessCompleted && status.isRentalPeriodCompleted,
        isOverdue: status.isRentalPeriodOverdue || rentalInfo.isOverdue
      },
      {
        id: 4,
        title: 'Rate Product',
        description: status.isRated ? 'Thank you for rating this asset!' : 
                   status.isReturnProcessCompleted ? 'Please rate your experience with this asset' : 
                   'Rate the product after return',
        status: status.isRated ? 'completed' : 
               status.isReturnProcessCompleted ? 'current' : 'pending',
        icon: <CurrencyDollarIcon className="w-5 h-5" />,
        showRating: status.isReturnProcessCompleted && !status.isRated
      },
      {
        id: 5,
        title: 'Complete Return',
        description: status.isCompleteReturn ? 'Return process completed successfully' : 'Complete all previous steps',
        status: status.isCompleteReturn ? 'completed' : 'pending',
        icon: <CheckCircleIcon className="w-5 h-5" />
      }
    ];

    return steps;
  };

  // Helper function to get payment status
  const getPaymentStatus = (item) => {
    // Handle the API structure from admin controller
    if (item.payment_status) return item.payment_status;
    return 'unpaid';
  };

  // Helper function to get receipt number
  const getReceiptNumber = (item) => {
    // Handle the API structure from admin controller
    if (item.receipt_number) return item.receipt_number;
    return null;
  };

  // Helper function to get custom request ID from backend
  const getCustomRequestId = (item) => {
    // Use the custom_request_id from backend if available, otherwise generate a fallback
    if (item.custom_request_id) {
      return item.custom_request_id;
    }
    
    // Fallback generation if backend doesn't have custom_request_id yet
    try {
      const requestDate = item.created_at || item.request_date || new Date();
      const date = new Date(requestDate);
      
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      const randomNum = Math.floor(Math.random() * 900) + 100;
      
      let residentId = '000';
      if (item.resident_id) {
        residentId = item.resident_id.toString().slice(-3).padStart(3, '0');
      } else if (item.user_id) {
        residentId = item.user_id.toString().slice(-3).padStart(3, '0');
      } else if (item.id) {
        residentId = item.id.toString().slice(-3).padStart(3, '0');
      }
      
      return `RAST${randomNum}${minutes}${year}${day}${month}${residentId}`;
    } catch (error) {
      console.error('Error generating fallback request ID:', error);
      return `RAST${Math.floor(Math.random() * 900) + 100}${Date.now().toString().slice(-6)}`;
    }
  };

  // Helper function to get amount
  const getAmount = (item) => {
    let amount = 0;
    
    // Handle the API structure from admin controller
    if (item.amount_paid !== null && item.amount_paid !== undefined) {
      amount = parseFloat(item.amount_paid) || 0;
    } else if (item.total_amount !== null && item.total_amount !== undefined) {
      amount = parseFloat(item.total_amount) || 0;
    } else if (item.amount !== null && item.amount !== undefined) {
      amount = parseFloat(item.amount) || 0;
    }
    
    return amount;
  };

  // Helper function to calculate total amount for all assets in a request
  const getTotalAmount = (item) => {
    // If we have the new API structure with items, calculate from individual assets
    if (item.items && Array.isArray(item.items) && item.items.length > 0) {
      return item.items.reduce((total, itemData) => {
        const price = parseFloat(itemData.asset ? itemData.asset.price : 0) || 0;
        const quantity = itemData.quantity || 1;
        return total + (price * quantity);
      }, 0);
    }
    
    // Fallback to the existing amount calculation
    return getAmount(item);
  };

  // Helper function to get rental period information
  const getRentalInfo = (item) => {
    if (item.remaining_rental_time) {
      return {
        daysRemaining: item.remaining_rental_time.days_remaining || 0,
        isOverdue: item.remaining_rental_time.is_overdue || false,
        returnDate: item.remaining_rental_time.return_date,
        isReturned: item.remaining_rental_time.is_returned || false,
        needsReturn: item.needs_return || false
      };
    }
    return {
      daysRemaining: 0,
      isOverdue: false,
      returnDate: null,
      isReturned: false,
      needsReturn: false
    };
  };

  // Helper function to format rental period display
  const formatRentalPeriod = (item) => {
    const rentalInfo = getRentalInfo(item);
    
    if (rentalInfo.isReturned) {
      return {
        text: 'Returned',
        color: 'text-green-600 bg-green-100',
        icon: <CheckCircleIcon className="w-4 h-4" />
      };
    }
    
    if (rentalInfo.needsReturn || rentalInfo.isOverdue) {
      return {
        text: rentalInfo.isOverdue ? 'Overdue - Return Required' : 'Return Required',
        color: 'text-red-600 bg-red-100',
        icon: <ExclamationTriangleIcon className="w-4 h-4" />
      };
    }
    
    if (rentalInfo.daysRemaining > 0) {
      return {
        text: `${rentalInfo.daysRemaining} day${rentalInfo.daysRemaining !== 1 ? 's' : ''} remaining`,
        color: 'text-blue-600 bg-blue-100',
        icon: <ClockIcon className="w-4 h-4" />
      };
    }
    
    return {
      text: 'Unknown',
      color: 'text-gray-600 bg-gray-100',
      icon: <ClockIcon className="w-4 h-4" />
    };
  };

  // Helper function to format tracking information
  const formatTrackingInfo = (asset) => {
    if (!asset.tracking_number) {
      return null;
    }

    return {
      trackingNumber: asset.tracking_number,
      generatedAt: asset.tracking_generated_at ? new Date(asset.tracking_generated_at) : null,
      generatedBy: asset.tracking_generated_by || 'Admin/Staff',
      hasTracking: asset.tracking_info?.has_tracking || false
    };
  };

  // Helper function to format admin-set return date/time
  const formatAdminSetReturnDateTime = (item) => {
    // Debug logging to see what we're working with
    console.log('formatAdminSetReturnDateTime - item:', item);
    
    // Get return_date from items array if available
    let returnDateValue = null;
    
    if (item.items && Array.isArray(item.items) && item.items.length > 0) {
      // Get return_date from first item in items array
      returnDateValue = item.items[0].return_date;
      console.log('formatAdminSetReturnDateTime - return_date from items[0]:', returnDateValue);
    } else if (item.return_date) {
      // Fallback to direct return_date property
      returnDateValue = item.return_date;
      console.log('formatAdminSetReturnDateTime - return_date from item:', returnDateValue);
    }
    
    if (!returnDateValue) {
      console.log('No return_date found, returning null');
      return null;
    }

    const returnDate = new Date(returnDateValue);
    
    // Ensure the date is valid
    if (isNaN(returnDate.getTime())) {
      console.error('Invalid return date:', returnDateValue);
      return null;
    }

    const formatted = {
      date: returnDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: returnDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      fullDateTime: returnDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      isoString: returnDateValue // Keep the original ISO string for date calculations
    };
    
    console.log('formatAdminSetReturnDateTime - formatted result:', formatted);
    return formatted;
  };

  // Handle request click
  const handleRequestClick = (item) => {
    setSelectedRequest(item);
    setShowRequestModal(true);
  };

  // Close request modal
  const closeRequestModal = () => {
    setShowRequestModal(false);
    setSelectedRequest(null);
  };

  // Process payment for an asset request
  const processPayment = async (item) => {
    try {
      const response = await axios.post(`/api/resident/asset-requests/${item.id}/pay`);
      
      if (response.data && response.data.message) {
        // Show success message
        alert(`Payment processed successfully! Receipt: ${response.data.receipt_number}`);
        
        // Refresh the requests list
        await fetchRequests();
        
        // Trigger event to refresh assets in RequestAssets component
        window.dispatchEvent(new CustomEvent('paymentProcessed', {
          detail: {
            assetRequestId: item.id,
            receiptNumber: response.data.receipt_number,
            amountPaid: response.data.amount_paid
          }
        }));
        
        // Also trigger asset stock update event
        window.dispatchEvent(new CustomEvent('assetStockUpdated'));
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to process payment. Please try again.';
      alert(errorMessage);
    }
  };

  // Check if request can be cancelled (within 24 hours and pending or approved)
  const canCancelRequest = (item) => {
    const status = getStatus(item);
    
    // Allow cancellation for pending or approved requests
    if (status !== 'pending' && status !== 'approved') {
      return false;
    }
    
    const createdAt = new Date(item.created_at);
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    
    return createdAt > twentyFourHoursAgo;
  };

  // Cancel Request
  const cancelRequest = async (item) => {
    if (!canCancelRequest(item)) {
      alert('This request cannot be cancelled. Only pending or approved requests within 24 hours can be cancelled.');
      return;
    }

    const isApproved = getStatus(item) === 'approved';
    const confirmMessage = isApproved 
      ? `Are you sure you want to cancel this APPROVED request?\n\n` +
        `Request ID: ${getCustomRequestId(item)}\n` +
        `Asset: ${getAssetName(item)}\n\n` +
        `⚠️ This will restore the stock and cannot be undone.`
      : `Are you sure you want to cancel this request?\n\n` +
        `Request ID: ${getCustomRequestId(item)}\n` +
        `Asset: ${getAssetName(item)}\n\n` +
        `This action cannot be undone.`;

    const confirmCancel = window.confirm(confirmMessage);

    if (!confirmCancel) {
      return;
    }

    try {
      const response = await axios.post(`/api/resident/asset-requests/${item.id}/cancel`);
      
      if (response.data.message) {
        const successMessage = isApproved 
          ? 'Approved request cancelled successfully! Stock has been restored.'
          : 'Request cancelled successfully!';
        alert(successMessage);
        // Refresh the requests list
        fetchRequests();
        // Close modal if open
        closeRequestModal();
      }
    } catch (err) {
      console.error('Error cancelling request:', err);
      const errorMessage = err.response?.data?.error || 'Failed to cancel request. Please try again.';
      alert(errorMessage);
    }
  };

  // Generate Receipt
  const generateReceipt = async (item) => {
    try {
      // Get the receipt number and amount from the item
      const receiptNumber = getReceiptNumber(item);
      const amount = getAmount(item) || 0;
      const assetName = getAssetName(item);
      const date = getDate(item);
      
      // Call backend to generate PDF receipt
      const response = await axios.post('/api/resident/asset-requests/generate-receipt', {
        asset_request_id: item.id,
        receipt_number: receiptNumber,
        amount_paid: amount
      });

      if (response.data.success) {
        // Convert base64 to blob
        const byteCharacters = atob(response.data.pdf_data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });

        // Create download link for PDF
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.data.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error(response.data.error || 'Failed to generate receipt');
      }
    } catch (err) {
      console.error('Error generating receipt:', err);
      alert('Failed to generate receipt. Please try again.');
    }
  };

  // Mark asset as returned
  const markAsReturned = async (item) => {
    const rentalInfo = getRentalInfo(item);
    
    if (rentalInfo.isReturned) {
      alert('This asset has already been returned.');
      return;
    }

    const confirmMessage = `Are you sure you want to mark this asset as returned?\n\n` +
      `Request ID: ${getCustomRequestId(item)}\n` +
      `Asset: ${getAssetName(item)}\n\n` +
      `This action will restore the asset to available stock and cannot be undone.`;

    const confirmReturn = window.confirm(confirmMessage);

    if (!confirmReturn) {
      return;
    }

    try {
      const response = await axios.post(`/api/resident/asset-requests/${item.id}/return`);
      
      if (response.data.message) {
        alert('Asset marked as returned successfully! Stock has been restored.');
        // Refresh the requests list
        await fetchRequests();
        // Close modal if open
        closeRequestModal();
      }
    } catch (err) {
      console.error('Error marking asset as returned:', err);
      const errorMessage = err.response?.data?.error || 'Failed to mark asset as returned. Please try again.';
      alert(errorMessage);
    }
  };

  // Handle asset rating
  const handleRateAsset = async (item, rating) => {
    try {
      // Get the first asset item ID for the rating API
      const itemId = item.items && item.items[0] ? item.items[0].id : item.id;
      
      const response = await axios.post(`/api/resident/asset-request-items/${itemId}/rate`, {
        rating: rating
      });
      
      if (response.data.message) {
        alert(`Thank you for rating this asset! Your ${rating}-star rating has been recorded.`);
        // Refresh the requests list
        await fetchRequests();
      }
    } catch (err) {
      console.error('Error rating asset:', err);
      const errorMessage = err.response?.data?.error || 'Failed to submit rating. Please try again.';
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <>
        <Navbares />
        <Sidebares />
        <main className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 min-h-screen ml-64 pt-36 px-6 pb-16 font-sans relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/40 to-green-200/40 rounded-full blur-3xl animate-float"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-200/40 to-emerald-200/40 rounded-full blur-3xl animate-float-delayed"></div>
          </div>

          <div className="w-full max-w-[98%] mx-auto space-y-8 relative z-10 px-2 lg:px-4">
            {/* Header Skeleton */}
            <div className="text-center space-y-6">
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full animate-pulse"></div>
              </div>
              <div className="h-12 bg-gray-300 rounded-xl w-1/3 mx-auto animate-pulse"></div>
              <div className="h-6 bg-gray-300 rounded-lg w-1/2 mx-auto animate-pulse"></div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50 animate-pulse">
                  <div className="flex justify-between items-center">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-300 rounded w-24"></div>
                      <div className="h-8 bg-gray-300 rounded w-16"></div>
                    </div>
                    <div className="w-16 h-16 bg-gray-300 rounded-2xl"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Table Skeleton */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8">
              <div className="space-y-6">
                {/* Table header skeleton */}
                <div className="grid grid-cols-6 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-6 bg-gray-300 rounded-lg animate-pulse"></div>
                  ))}
                </div>
                
                {/* Table rows skeleton */}
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="grid grid-cols-6 gap-4 py-4 border-t border-gray-200">
                    {[...Array(6)].map((_, j) => (
                      <div key={j} className="h-4 bg-gray-300 rounded animate-pulse"></div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Calculate statistics
  const totalRequests = requests.length;
  const approvedRequests = requests.filter(item => getStatus(item)?.toLowerCase() === 'approved').length;
  const pendingRequests = requests.filter(item => getStatus(item)?.toLowerCase() === 'pending').length;
  const paidRequests = requests.filter(item => getPaymentStatus(item) === 'paid').length;
  const totalAmount = requests.reduce((sum, item) => sum + getTotalAmount(item), 0);

  return (
    <>
      <Navbares />
      <Sidebares />
      <main className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen ml-64 pt-36 px-6 pb-16 font-sans relative overflow-hidden">
        {/* Simplified background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-green-200 to-teal-200 rounded-full opacity-15 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full opacity-10 animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="w-full max-w-[98%] mx-auto space-y-10 relative z-10 px-2 lg:px-4">
          
          {/* Enhanced Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl mb-4">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9Z"/>
              </svg>
            </div>
            <div className="flex items-center justify-center gap-4">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
                Asset Request Status
              </h1>
              <button
                onClick={fetchRequests}
                className="p-2 bg-green-100 hover:bg-green-200 rounded-full transition-colors duration-200"
                title="Refresh Requests"
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
              Track and manage your barangay asset requests
            </p>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <StatCard
              label="Total Requests"
              value={totalRequests}
              icon={<EyeIcon className="w-6 h-6 text-white" />}
              iconBg="bg-gradient-to-br from-emerald-500 to-green-600"
              gradient="from-emerald-500 to-green-600"
            />
            <StatCard
              label="Approved"
              value={approvedRequests}
              icon={<CheckCircleIcon className="w-6 h-6 text-white" />}
              iconBg="bg-gradient-to-br from-green-500 to-emerald-600"
              gradient="from-green-500 to-emerald-600"
            />
            <StatCard
              label="Pending"
              value={pendingRequests}
              icon={<ClockIcon className="w-6 h-6 text-white" />}
              iconBg="bg-gradient-to-br from-amber-500 to-orange-500"
              gradient="from-amber-500 to-orange-500"
            />
            <StatCard
              label="Paid"
              value={paidRequests}
              icon={<CurrencyDollarIcon className="w-6 h-6 text-white" />}
              iconBg="bg-gradient-to-br from-teal-500 to-emerald-600"
              gradient="from-teal-500 to-emerald-600"
            />
            <StatCard
              label="Total Amount"
              value={`₱${totalAmount.toFixed(2)}`}
              icon={<CurrencyDollarIcon className="w-6 h-6 text-white" />}
              iconBg="bg-gradient-to-br from-emerald-600 to-green-600"
              gradient="from-emerald-600 to-green-600"
            />
          </div>

          {/* Enhanced Controls */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={fetchRequests}
                  className="group flex items-center gap-3 px-6 py-3 font-bold rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 text-white border-2 border-emerald-400 hover:border-emerald-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <ArrowPathIcon className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Refresh</span>
                </button>
                <Link to="/residents/requestAssets">
                  <button className="group flex items-center gap-3 px-6 py-3 font-bold rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white border-2 border-gray-400 hover:border-gray-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <EyeIcon className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">← Back to Request Assets</span>
                  </button>
                </Link>
              </div>
              
              {/* Quick Status Filters */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Filter by:</span>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200 transition-colors">
                    All ({totalRequests})
                  </button>
                  <button className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors">
                    Approved ({approvedRequests})
                  </button>
                  <button className="px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200 transition-colors">
                    Pending ({pendingRequests})
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 mb-12">
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setActiveTab('history')}
                className={`px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 flex items-center gap-3 transform hover:scale-105 ${
                  activeTab === 'history'
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-xl'
                    : 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-600 hover:from-slate-200 hover:to-gray-200 shadow-lg hover:shadow-xl'
                }`}
              >
                <EyeIcon className="w-6 h-6" />
                Request History
              </button>
              <button
                onClick={() => setActiveTab('assets')}
                className={`px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 flex items-center gap-3 transform hover:scale-105 ${
                  activeTab === 'assets'
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-xl'
                    : 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-600 hover:from-slate-200 hover:to-gray-200 shadow-lg hover:shadow-xl'
                }`}
              >
                <CurrencyDollarIcon className="w-6 h-6" />
                Requested Assets
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl font-medium flex items-center gap-3 mb-6">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center mb-6">
            {lastDeleted && (
              <button
                onClick={handleUndo}
                className="group flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Undo Delete
              </button>
            )}
            <button
              onClick={handleClearAll}
              className="group flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 ml-auto"
            >
              <TrashIcon className="w-4 h-4" />
              Clear All User Requests
            </button>
          </div>

          {/* Enhanced Table */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <EyeIcon className="w-6 h-6 text-emerald-600" />
                {activeTab === 'history' ? 'Request History' : 'Your Requested Assets'}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {activeTab === 'history' 
                  ? 'View and manage all your asset requests' 
                  : 'View all your paid asset requests and download receipts'
                }
              </p>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="min-w-full w-full">
                <thead className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 text-white">
                  <tr>
                    {activeTab === 'history' ? (
                      <>
                        <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider min-w-[150px]">Request ID</th>
                        <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider min-w-[200px]">Asset</th>
                        <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider min-w-[180px]">Date Requested</th>
                        <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider min-w-[120px]">Status</th>
                        <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider min-w-[150px]">Payment Status</th>
                        <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider min-w-[120px]">Amount</th>
                        <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider min-w-[120px]">Actions</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider min-w-[150px]">Request ID</th>
                        <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider min-w-[200px]">Asset Name</th>
                        <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider min-w-[180px]">Rental Period</th>
                        <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider min-w-[150px]">Return Status</th>
                        <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider min-w-[150px]">Receipt Number</th>
                        <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider min-w-[120px]">Amount Paid</th>
                        <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider min-w-[120px]">Actions</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {activeTab === 'history' ? (
                    requests.map((item, index) => (
                    <tr 
                      key={index} 
                      className="group hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 transition-all duration-300 cursor-pointer"
                      onClick={() => handleRequestClick(item)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-mono text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                          {getCustomRequestId(item)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center">
                            <EyeIcon className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{getAssetName(item)}</div>
                            {item.items_count > 1 && (
                              <div className="text-xs text-emerald-600 font-medium">
                                +{item.items_count - 1} more assets
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-gray-600">
                            <CalendarIcon className="w-4 h-4" />
                            {getFormattedDateTime(item).date}
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            {getFormattedDateTime(item).time}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={getStatus(item)} />
                          {canCancelRequest(item) && (
                            <div className="flex items-center gap-1 text-orange-600 text-xs">
                              <XMarkIcon className="w-3 h-3" />
                              <span className="font-medium">Can Cancel</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <PaymentBadge status={getPaymentStatus(item)} />
                          {getReceiptNumber(item) && (
                            <div className="text-xs text-gray-500 font-medium">
                              Receipt: {getReceiptNumber(item)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-lg font-bold text-emerald-600">
                            <CurrencyDollarIcon className="w-5 h-5" />
                            ₱{(getTotalAmount(item) || 0).toFixed(2)}
                          </div>
                          {item.items_count > 1 && (
                            <div className="text-xs text-gray-500 font-medium">
                              Total for {item.items_count} assets
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleDelete(index)}
                            className="group/btn flex items-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
                          >
                            <TrashIcon className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    ))
                  ) : activeTab === 'history' && requests.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-20">
                        <div className="flex flex-col items-center gap-6">
                          <div className="relative">
                            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center shadow-lg">
                              <EyeIcon className="w-10 h-10 text-emerald-500" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">0</span>
                            </div>
                          </div>
                          <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">No Asset Requests Yet</h3>
                            <p className="text-gray-500 text-sm mb-4 max-w-md">
                              You haven't submitted any asset requests yet. Start by browsing available assets and making your first request.
                            </p>
                            <Link to="/residents/requestAssets">
                              <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105">
                                <PlusIcon className="w-5 h-5" />
                                Browse Assets
                              </button>
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    // Assets tab content
                    assetsLoading ? (
                      // Loading skeleton for assets
                      [...Array(3)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-6 py-4">
                            <div className="h-4 bg-gray-300 rounded w-32"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 bg-gray-300 rounded w-24"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-6 bg-gray-300 rounded w-16"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 bg-gray-300 rounded w-20"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 bg-gray-300 rounded w-16"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-8 bg-gray-300 rounded w-32"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-8 bg-gray-300 rounded w-20"></div>
                          </td>
                        </tr>
                      ))
                    ) : assets.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-20">
                          <div className="flex flex-col items-center gap-6">
                            <div className="relative">
                              <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center shadow-lg">
                                <CurrencyDollarIcon className="w-10 h-10 text-emerald-500" />
                              </div>
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">0</span>
                              </div>
                            </div>
                            <div className="text-center">
                              <h3 className="text-xl font-bold text-gray-800 mb-2">No Paid Request Assets</h3>
                              <p className="text-gray-500 text-sm mb-4 max-w-md">
                                You don't have any paid asset requests yet. Complete payment for your approved requests to see them here.
                              </p>
                              <Link to="/residents/requestAssets">
                                <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105">
                                  <PlusIcon className="w-5 h-5" />
                                  Request Assets
                                </button>
                              </Link>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : Array.isArray(assets) ? (
                      assets.map((asset, index) => (
                        <tr 
                          key={asset.id} 
                          className="group hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 transition-all duration-300 cursor-pointer"
                          onClick={() => handleRequestClick(asset)}
                        >
                          <td className="px-6 py-4">
                            <div className="font-mono text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                              {getCustomRequestId(asset)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center">
                                <EyeIcon className="w-5 h-5 text-emerald-600" />
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900">{getAssetName(asset)}</div>
                                {asset.items_count > 1 && (
                                  <div className="text-xs text-emerald-600 font-medium">
                                    +{asset.items_count - 1} more assets
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-gray-600">
                                <CalendarIcon className="w-4 h-4" />
                                {getFormattedDateTime(asset).date}
                              </div>
                              <div className="text-xs text-gray-500 font-medium">
                                {getFormattedDateTime(asset).time}
                              </div>
                              {getAllAssets(asset)[0]?.rental_duration_days && (
                                <div className="text-xs text-emerald-600 font-medium">
                                  {getAllAssets(asset)[0].rental_duration_days} day rental
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <RentalStatusBadge item={asset} />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="font-mono text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                                {getReceiptNumber(asset) || 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-lg font-bold text-emerald-600">
                                <CurrencyDollarIcon className="w-5 h-5" />
                                ₱{(getTotalAmount(asset) || 0).toFixed(2)}
                              </div>
                              {asset.items_count > 1 && (
                                <div className="text-xs text-gray-500 font-medium">
                                  Total for {asset.items_count} assets
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleRequestClick(asset)}
                                className="group/btn flex items-center gap-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
                              >
                                <EyeIcon className="w-4 h-4" />
                                View Details
                              </button>
                              {getReceiptNumber(asset) && (
                                <button
                                  onClick={() => {
                                    generateReceipt(asset);
                                  }}
                                  className="group/btn flex items-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
                                >
                                  <DocumentArrowDownIcon className="w-4 h-4" />
                                  Receipt
                                </button>
                              )}
                              {!getRentalInfo(asset).isReturned && (
                                <button
                                  onClick={() => {
                                    markAsReturned(asset);
                                  }}
                                  className="group/btn flex items-center gap-1 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
                                >
                                  <ArrowPathIcon className="w-4 h-4" />
                                  Return
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-20">
                          <div className="flex flex-col items-center gap-6">
                            <div className="relative">
                              <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center shadow-lg">
                                <CurrencyDollarIcon className="w-10 h-10 text-emerald-500" />
                              </div>
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">0</span>
                              </div>
                            </div>
                            <div className="text-center">
                              <h3 className="text-xl font-bold text-gray-800 mb-2">No Paid Request Assets</h3>
                              <p className="text-gray-500 text-sm mb-4 max-w-md">
                                You don't have any paid asset requests yet. Complete payment for your approved requests to see them here.
                              </p>
                              <Link to="/residents/requestAssets">
                                <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105">
                                  <PlusIcon className="w-5 h-5" />
                                  Request Assets
                                </button>
                              </Link>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Request Details Modal */}
      {showRequestModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <EyeIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Request Details</h2>
                    <p className="text-emerald-100 text-sm">Asset Request Information</p>
                    {canCancelRequest(selectedRequest) && (
                      <div className="mt-1 flex items-center gap-2 text-orange-200 text-xs">
                        <XMarkIcon className="w-3 h-3" />
                        <span>Can be cancelled within 24 hours</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={closeRequestModal}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                >
                  <XCircleIcon className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Asset Information */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <EyeIcon className="w-5 h-5 text-emerald-600" />
                  Asset Information
                </h3>
                
                {/* Request ID and Date */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Request ID</label>
                    <p className="text-gray-900 font-mono text-sm font-bold bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                      {getCustomRequestId(selectedRequest)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Request Date & Time</label>
                    <div className="space-y-1">
                      <p className="text-gray-900 font-semibold flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-emerald-600" />
                        {getFormattedDateTime(selectedRequest).date}
                      </p>
                      <p className="text-sm text-gray-600 font-medium">
                        {getFormattedDateTime(selectedRequest).time}
                      </p>
                    </div>
                  </div>
                </div>

                {/* All Assets in Request */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-700 flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    Requested Assets ({getAllAssets(selectedRequest).length})
                  </h4>
                  
                  {getAllAssets(selectedRequest).map((asset, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 border border-emerald-200 shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Asset Name</label>
                          <p className="text-gray-900 font-semibold">{asset.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Quantity</label>
                          <p className="text-gray-900 font-semibold">{asset.quantity}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Price</label>
                          <p className="text-gray-900 font-semibold flex items-center gap-1">
                            <CurrencyDollarIcon className="w-4 h-4 text-emerald-600" />
                            ₱{(parseFloat(asset.price) || 0).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Request Date & Time</label>
                          <div className="space-y-1">
                            <p className="text-gray-900 font-semibold flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4 text-emerald-600" />
                              {getFormattedDateTime({ request_date: asset.request_date }).date}
                            </p>
                            <p className="text-sm text-gray-600 font-medium">
                              {getFormattedDateTime({ request_date: asset.request_date }).time}
                            </p>
                          </div>
                        </div>
                        {asset.category && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Category</label>
                            <p className="text-gray-900 font-semibold">{asset.category}</p>
                          </div>
                        )}
                        {asset.condition && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Condition</label>
                            <p className="text-gray-900 font-semibold">{asset.condition}</p>
                          </div>
                        )}
                        {asset.start_time && asset.end_time && (
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-600">Time Range</label>
                            <p className="text-gray-900 font-semibold">
                              {asset.start_time} - {asset.end_time}
                            </p>
                          </div>
                        )}
                        {asset.rental_duration_days && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Rental Duration</label>
                            <p className="text-gray-900 font-semibold">
                              {asset.rental_duration_days} day{asset.rental_duration_days !== 1 ? 's' : ''}
                            </p>
                          </div>
                        )}
                        {asset.return_date && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Return Date</label>
                            <p className="text-gray-900 font-semibold">
                              {new Date(asset.return_date).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {asset.notes && (
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-600">Notes</label>
                            <p className="text-gray-900 font-semibold">{asset.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Request Tracking / Return Process */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <ArrowPathIcon className="w-5 h-5 text-blue-600" />
                  {activeTab === 'history' ? 'Request Progress' : 'Return Process'}
                </h3>
                <RequestTracking 
                  steps={activeTab === 'history' ? getRequestTrackingSteps(selectedRequest) : getReturnTrackingSteps(selectedRequest)} 
                  selectedRequest={selectedRequest}
                  onReturnAsset={markAsReturned}
                  onRateAsset={handleRateAsset}
                  activeTab={activeTab}
                />
              </div>

              {/* Status Information */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-purple-600" />
                    Status Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Request Status</label>
                    <div className="mt-1">
                      <StatusBadge status={getStatus(selectedRequest)} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Payment Status</label>
                    <div className="mt-1">
                      <PaymentBadge status={getPaymentStatus(selectedRequest)} />
                    </div>
                  </div>
                </div>
                {getReceiptNumber(selectedRequest) && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-600">Receipt Number</label>
                    <p className="text-gray-900 font-semibold">{getReceiptNumber(selectedRequest)}</p>
                  </div>
                )}
              </div>

              {/* Rental Period Information - Only show for Your Requested Assets tab */}
              {activeTab === 'assets' && (
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-indigo-600" />
                    Rental Period Information
                  </h3>
                  
                  {getAllAssets(selectedRequest).map((asset, index) => {
                    const rentalInfo = asset.remaining_rental_time || {};
                    const trackingInfo = formatTrackingInfo(asset);
                    const adminReturnDateTime = formatAdminSetReturnDateTime(asset);
                    
                    // Debug logging
                    console.log('Asset data:', asset);
                    console.log('Return date from asset:', asset.return_date);
                    console.log('Formatted admin return date/time:', adminReturnDateTime);
                    
                    return (
                      <div key={index} className="bg-white rounded-xl p-4 border border-indigo-200 shadow-sm mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-600">Asset Name</label>
                            <p className="text-gray-900 font-semibold">{asset.name}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Rental Duration</label>
                            <p className="text-gray-900 font-semibold">
                              {asset.rental_duration_days} day{asset.rental_duration_days !== 1 ? 's' : ''}
                            </p>
                          </div>
                          
                          {/* Tracking Number */}
                          {trackingInfo && (
                            <div className="md:col-span-2">
                              <label className="text-sm font-medium text-gray-600">Tracking Number</label>
                              <div className="mt-1">
                                <div className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg border border-purple-200">
                                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span className="font-mono text-sm font-bold text-purple-800">
                                    {trackingInfo.trackingNumber}
                                  </span>
                                </div>
                                {trackingInfo.generatedAt && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Generated on {trackingInfo.generatedAt.toLocaleDateString()} by {trackingInfo.generatedBy}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Admin-Set Return Date/Time - Prominent Display */}
                          {adminReturnDateTime && (
                            <div className="md:col-span-2">
                              <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <CalendarIcon className="w-5 h-5 text-white" />
                                  <h4 className="font-bold text-sm uppercase tracking-wide">Return Date & Time</h4>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <CalendarIcon className="w-4 h-4 text-emerald-100" />
                                    <span className="text-lg font-bold">{adminReturnDateTime.date}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <ClockIcon className="w-4 h-4 text-emerald-100" />
                                    <span className="text-lg font-bold">{adminReturnDateTime.time}</span>
                                  </div>
                                  <div className="mt-2 pt-2 border-t border-emerald-400">
                                    <span className="text-sm text-emerald-100">Set by Admin/Staff</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div>
                            <label className="text-sm font-medium text-gray-600">Return Date</label>
                            <p className="text-gray-900 font-semibold">
                              {asset.return_date ? new Date(asset.return_date).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Status</label>
                            <div className="mt-1">
                              {(() => {
                                // Calculate status based on admin-set return date if available
                                if (adminReturnDateTime) {
                                  const returnDate = new Date(adminReturnDateTime.isoString);
                                  const now = new Date();
                                  const isOverdue = now >= returnDate;
                                  const isReturned = rentalInfo.isReturned;
                                  
                                  if (isReturned) {
                                    return (
                                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-sm bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                                        <CheckCircleIcon className="w-4 h-4" />
                                        Returned
                                      </span>
                                    );
                                  }
                                  
                                  if (isOverdue) {
                                    return (
                                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-sm bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200 animate-pulse">
                                        <ExclamationTriangleIcon className="w-4 h-4" />
                                        Overdue
                                      </span>
                                    );
                                  }
                                  
                                  const diffMs = returnDate.getTime() - now.getTime();
                                  const daysLeft = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                                  
                                  return (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-sm bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                                      <ClockIcon className="w-4 h-4" />
                                      {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                                    </span>
                                  );
                                }
                                
                                // Fallback to old rentalInfo
                                return <RentalStatusBadge item={{ remaining_rental_time: rentalInfo }} />;
                              })()}
                            </div>
                          </div>
                          {adminReturnDateTime && (() => {
                            const returnDate = new Date(adminReturnDateTime.isoString);
                            const now = new Date();
                            const diffMs = returnDate.getTime() - now.getTime();
                            const daysLeft = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
                            const isOverdue = now >= returnDate;
                            
                            return (
                              <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-600">Days Remaining</label>
                                <div className="mt-2">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                      <div 
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                          isOverdue ? 'bg-red-500' : 
                                          daysLeft <= 1 ? 'bg-yellow-500' : 'bg-green-500'
                                        }`}
                                        style={{ 
                                          width: `${Math.min(100, Math.max(0, (daysLeft / (asset.rental_duration_days || 1)) * 100))}%` 
                                        }}
                                      ></div>
                                    </div>
                                    <span className={`text-sm font-semibold ${
                                      isOverdue ? 'text-red-600' : 
                                      daysLeft <= 1 ? 'text-yellow-600' : 'text-green-600'
                                    }`}>
                                      {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                          {rentalInfo.needs_return && (
                            <div className="md:col-span-2">
                              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                                  <span className="text-red-700 font-semibold">
                                    {rentalInfo.is_overdue ? 'Asset is overdue and needs to be returned immediately!' : 'Asset needs to be returned!'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Financial Information */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CurrencyDollarIcon className="w-5 h-5 text-purple-600" />
                  Financial Information
                </h3>
                
                {/* Individual Asset Costs */}
                {getAllAssets(selectedRequest).length > 1 && (
                  <div className="mb-6">
                    <h4 className="text-md font-semibold text-gray-700 mb-3">Cost Breakdown</h4>
                    <div className="space-y-2">
                      {getAllAssets(selectedRequest).map((asset, index) => (
                        <div key={index} className="flex justify-between items-center bg-white rounded-lg p-3 border border-purple-200">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{asset.name}</div>
                            <div className="text-sm text-gray-500">Qty: {asset.quantity} × ₱{(parseFloat(asset.price) || 0).toFixed(2)}</div>
                          </div>
                          <div className="font-bold text-emerald-600">
                            ₱{((parseFloat(asset.price) || 0) * asset.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Total Amount */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">
                    ₱{(getTotalAmount(selectedRequest) || 0).toFixed(2)}
                  </div>
                  <p className="text-gray-600 text-sm">
                    {getAllAssets(selectedRequest).length > 1 
                      ? `Total for ${getAllAssets(selectedRequest).length} assets` 
                      : 'Total Amount'
                    }
                  </p>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-3xl flex justify-between items-center">
              <div className="flex gap-3">
                {/* Request History Tab Actions */}
                {activeTab === 'history' && (
                  <>
                    {canCancelRequest(selectedRequest) && (
                      <button
                        onClick={() => {
                          const confirmCancel = window.confirm(
                            `Are you sure you want to cancel this request?\n\n` +
                            `Request ID: ${getCustomRequestId(selectedRequest)}\n` +
                            `Asset: ${getAssetName(selectedRequest)}\n\n` +
                            `This action cannot be undone.`
                          );
                          
                          if (confirmCancel) {
                            cancelRequest(selectedRequest);
                            closeRequestModal();
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
                      >
                        <XMarkIcon className="w-4 h-4" />
                        Cancel Request
                      </button>
                    )}
                    {getStatus(selectedRequest) === 'approved' && getPaymentStatus(selectedRequest) === 'unpaid' && (
                      <button
                        onClick={() => {
                          processPayment(selectedRequest);
                          closeRequestModal();
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
                      >
                        <CurrencyDollarIcon className="w-4 h-4" />
                        Pay Now
                      </button>
                    )}
                    {getPaymentStatus(selectedRequest) === 'paid' && getReceiptNumber(selectedRequest) && (
                      <button
                        onClick={() => {
                          generateReceipt(selectedRequest);
                          closeRequestModal();
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
                      >
                        <DocumentArrowDownIcon className="w-4 h-4" />
                        Download Receipt
                      </button>
                    )}
                  </>
                )}

                {/* Your Requested Assets Tab Actions */}
                {activeTab === 'assets' && (
                  <>
                    {getPaymentStatus(selectedRequest) === 'paid' && getReceiptNumber(selectedRequest) && (
                      <button
                        onClick={() => {
                          generateReceipt(selectedRequest);
                          closeRequestModal();
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
                      >
                        <DocumentArrowDownIcon className="w-4 h-4" />
                        Download Receipt
                      </button>
                    )}
                  </>
                )}
              </div>
              <button
                onClick={closeRequestModal}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-3deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.05); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
      `}</style>
    </>
  );
};

// StatCard Component
const StatCard = ({ label, value, icon, iconBg, gradient }) => (
  <div className="group bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500 flex justify-between items-center transform hover:-translate-y-2 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="relative z-10">
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-2xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300`}>{value}</p>
    </div>
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBg} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
      {icon}
    </div>
  </div>
);

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return {
          bg: 'bg-gradient-to-r from-green-100 to-emerald-100',
          text: 'text-green-800',
          icon: <CheckCircleIcon className="w-4 h-4" />,
          border: 'border border-green-200'
        };
      case 'pending':
        return {
          bg: 'bg-gradient-to-r from-amber-100 to-yellow-100',
          text: 'text-amber-800',
          icon: <ClockIcon className="w-4 h-4" />,
          border: 'border border-amber-200'
        };
      case 'denied':
        return {
          bg: 'bg-gradient-to-r from-red-100 to-pink-100',
          text: 'text-red-800',
          icon: <XCircleIcon className="w-4 h-4" />,
          border: 'border border-red-200'
        };
      case 'cancelled':
        return {
          bg: 'bg-gradient-to-r from-orange-100 to-amber-100',
          text: 'text-orange-800',
          icon: <XMarkIcon className="w-4 h-4" />,
          border: 'border border-orange-200'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-100 to-slate-100',
          text: 'text-gray-800',
          icon: <ClockIcon className="w-4 h-4" />,
          border: 'border border-gray-200'
        };
    }
  };

  const config = getStatusConfig(status);
  
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${config.bg} ${config.text} ${config.border}`}>
      {config.icon}
      {status}
    </span>
  );
};

// Payment Badge Component
const PaymentBadge = ({ status }) => {
  const isPaid = status === 'paid';
  
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-sm border ${
      isPaid 
        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200' 
        : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200'
    }`}>
      <CurrencyDollarIcon className="w-4 h-4" />
      {isPaid ? 'Paid' : 'Unpaid'}
    </span>
  );
};

// Request Tracking Component
const RequestTracking = ({ steps, selectedRequest, onReturnAsset, onRateAsset, activeTab }) => {
  const [rating, setRating] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second for live countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(timer); // Cleanup on unmount
  }, []);

  // Calculate live remaining time for Rental Period step
  const calculateLiveRemainingTime = (step) => {
    if (step.id !== 2 || !step.remainingTime || step.status !== 'current') {
      return null;
    }

    // Get the original remaining time and recalculate based on current time
    const rentalPeriodStep = steps.find(s => s.id === 2);
    if (!rentalPeriodStep || !rentalPeriodStep.remainingTime) {
      return null;
    }

    // Find the asset with return_date
    const assets = selectedRequest?.items || [];
    const assetWithReturnDate = assets.find(asset => asset.return_date);
    
    if (!assetWithReturnDate || !assetWithReturnDate.return_date) {
      return rentalPeriodStep.remainingTime;
    }

    const returnDateTime = new Date(assetWithReturnDate.return_date);
    const diffMs = returnDateTime.getTime() - currentTime.getTime();

    if (diffMs <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    return { days: diffDays, hours: diffHours, minutes: diffMinutes, seconds: diffSeconds };
  };

  const handleRateClick = () => {
    setShowRatingModal(true);
  };

  const handleRatingSubmit = () => {
    if (rating > 0) {
      onRateAsset(selectedRequest, rating);
      setShowRatingModal(false);
      setRating(0);
    }
  };

  return (
    <div className="relative">
      {steps.map((step, index) => (
        <div key={step.id} className="relative flex items-start gap-4 pb-6">
          {/* Step Icon */}
          <div className={`relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 ${
            step.status === 'completed' 
              ? 'bg-emerald-500 border-emerald-500 text-white' 
              : step.status === 'current' 
                ? 'bg-emerald-100 border-emerald-500 text-emerald-600 animate-pulse' 
                : step.status === 'error'
                  ? 'bg-red-500 border-red-500 text-white'
                  : 'bg-gray-100 border-gray-300 text-gray-400'
          }`}>
            {step.status === 'completed' ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : step.status === 'error' ? (
              <XCircleIcon className="w-5 h-5" />
            ) : (
              step.icon
            )}
          </div>

          {/* Step Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`text-sm font-semibold ${
                step.status === 'completed' 
                  ? 'text-emerald-700' 
                  : step.status === 'current' 
                    ? 'text-emerald-600' 
                    : step.status === 'error'
                      ? 'text-red-700'
                      : 'text-gray-500'
              }`}>
                {step.title}
              </h4>
              {step.status === 'current' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                  Current
                </span>
              )}
              {step.isOverdue && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 animate-pulse">
                  Overdue!
                </span>
              )}
            </div>
            <p className={`text-xs ${
              step.status === 'completed' 
                ? 'text-emerald-600' 
                : step.status === 'current' 
                  ? 'text-emerald-500' 
                  : step.status === 'error'
                    ? 'text-red-600'
                    : 'text-gray-400'
            }`}>
              {step.description}
            </p>
            
            {/* Remaining Time Display - Only for Rental Period step with live countdown */}
            {step.id === 2 && step.remainingTime && step.status === 'current' && (() => {
              const liveTime = calculateLiveRemainingTime(step);
              const timeToShow = liveTime || step.remainingTime;
              
              return (
                <div className="mt-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <ClockIcon className="w-4 h-4 text-blue-600 animate-pulse" />
                    <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">Live Countdown</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {timeToShow.days > 0 && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-lg font-bold text-sm">
                        <span className="text-lg">{timeToShow.days}</span>
                        <span className="text-xs">day{timeToShow.days !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {(timeToShow.hours > 0 || timeToShow.days > 0) && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded-lg font-bold text-sm">
                        <span className="text-lg">{timeToShow.hours}</span>
                        <span className="text-xs">hr{timeToShow.hours !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-400 text-white rounded-lg font-bold text-sm">
                      <span className="text-lg">{timeToShow.minutes}</span>
                      <span className="text-xs">min{timeToShow.minutes !== 1 ? 's' : ''}</span>
                    </div>
                    {timeToShow.seconds !== undefined && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-300 text-blue-900 rounded-lg font-bold text-sm animate-pulse">
                        <span className="text-lg">{timeToShow.seconds}</span>
                        <span className="text-xs">sec{timeToShow.seconds !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {timeToShow.days === 0 && timeToShow.hours === 0 && timeToShow.minutes === 0 && timeToShow.seconds === 0 && (
                      <div className="inline-flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-lg font-bold text-sm animate-pulse">
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        <span>Time's Up!</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Action Buttons - Only show for Your Requested Assets tab */}
            {activeTab === 'assets' && step.showReturnButton && (
              <div className="mt-3">
                <button
                  onClick={() => onReturnAsset(selectedRequest)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                    step.isOverdue
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg'
                  }`}
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  {step.isOverdue ? 'Return Now (Overdue)' : 'Return Asset'}
                </button>
              </div>
            )}

            {activeTab === 'assets' && step.showRating && (
              <div className="mt-3">
                <button
                  onClick={handleRateClick}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <CurrencyDollarIcon className="w-4 h-4" />
                  Rate Product
                </button>
              </div>
            )}
          </div>

          {/* Connecting Line */}
          {index < steps.length - 1 && (
            <div className={`absolute left-5 top-10 w-0.5 h-6 ${
              step.status === 'completed' 
                ? 'bg-emerald-300' 
                : 'bg-gray-200'
            }`}></div>
          )}
        </div>
      ))}

      {/* Rating Modal - Only show for Your Requested Assets tab */}
      {activeTab === 'assets' && showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Rate Your Experience</h3>
            <p className="text-gray-600 text-sm mb-4">How would you rate this asset?</p>
            
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${
                    star <= rating
                      ? 'text-yellow-400 bg-yellow-100'
                      : 'text-gray-300 hover:text-yellow-400 hover:bg-yellow-50'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRatingSubmit}
                disabled={rating === 0}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  rating > 0
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Submit Rating
              </button>
              <button
                onClick={() => setShowRatingModal(false)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Rental Status Badge Component
const RentalStatusBadge = ({ item }) => {
  const rentalInfo = item.remaining_rental_time || {};
  
  // Check for admin-set return date from items array
  let returnDateValue = null;
  if (item.items && Array.isArray(item.items) && item.items.length > 0) {
    returnDateValue = item.items[0].return_date;
  }
  
  // If we have admin-set return date, use it for accurate status
  if (returnDateValue) {
    const returnDate = new Date(returnDateValue);
    const now = new Date();
    const isOverdue = now >= returnDate;
    const isReturned = rentalInfo.is_returned || item.items[0].is_returned;
    
    if (isReturned) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-sm bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
          <CheckCircleIcon className="w-4 h-4" />
          Returned
        </span>
      );
    }
    
    if (isOverdue) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-sm bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200 animate-pulse">
          <ExclamationTriangleIcon className="w-4 h-4" />
          Overdue
        </span>
      );
    }
    
    const diffMs = returnDate.getTime() - now.getTime();
    const daysLeft = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-sm bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
        <ClockIcon className="w-4 h-4" />
        {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
      </span>
    );
  }
  
  // Fallback to old rentalInfo logic
  if (rentalInfo.is_returned) {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-sm bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
        <CheckCircleIcon className="w-4 h-4" />
        Returned
      </span>
    );
  }
  
  if (rentalInfo.needs_return || rentalInfo.is_overdue) {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-sm bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200 animate-pulse">
        <ExclamationTriangleIcon className="w-4 h-4" />
        {rentalInfo.is_overdue ? 'Overdue' : 'Return Required'}
      </span>
    );
  }
  
  if (rentalInfo.days_remaining > 0) {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-sm bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
        <ClockIcon className="w-4 h-4" />
        {rentalInfo.days_remaining} day{rentalInfo.days_remaining !== 1 ? 's' : ''} left
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-sm bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200">
      <ClockIcon className="w-4 h-4" />
      Unknown
    </span>
  );
};

export default StatusAssetRequests;