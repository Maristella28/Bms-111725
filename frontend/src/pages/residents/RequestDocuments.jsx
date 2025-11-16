import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import Navbares from "../../components/Navbares";
import Sidebares from "../../components/Sidebares";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import { useSidebar } from '../../contexts/SidebarContext';
import { validateBusinessInfo, isBusinessInfoIncomplete } from '../../utils/businessInfoValidation';
import { FaFileAlt, FaBusinessTime, FaIdBadge, FaHome, FaPaperPlane, FaUser, FaCalendarAlt, FaIdCard, FaStar, FaMagic, FaCheckCircle, FaCertificate, FaExclamationTriangle, FaInfoCircle, FaTimes, FaSpinner, FaCamera, FaUpload, FaImage, FaTrash, FaList, FaEye, FaClock, FaCheck } from 'react-icons/fa';
import './RequestDocuments.css';

const RequestDocuments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isCollapsed } = useSidebar();
  const isMountedRef = useRef(true);
  const isFetchingRef = useRef(false);
  const [activeTab, setActiveTab] = useState('request'); // 'request' or 'status'
  const [showModal, setShowModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [purpose, setPurpose] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [residentData, setResidentData] = useState(null);
  const [loadingResident, setLoadingResident] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false); // Disabled by default for this page
  const [lastDataCheck, setLastDataCheck] = useState(new Date());
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  // Document status states
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loadingRequests, setLoadingRequests] = useState(false);
  // Business info validation states
  const [showBusinessInfoWarning, setShowBusinessInfoWarning] = useState(false);
  const [businessInfoValidation, setBusinessInfoValidation] = useState(null);

  // Cache for resident data to avoid repeated API calls
  const [cachedResidentData, setCachedResidentData] = useState(null);

  // Enhanced profile data normalization helper
  const normalizeProfileData = useCallback((rawData) => {
    if (!rawData) return null;
    
    // Handle different backend response structures
    let profile = null;
    
    // Priority order for extracting profile data:
    // 1. rawData.user.profile (most common structure)
    // 2. rawData.profile (direct profile object)
    // 3. rawData itself (direct data)
    if (rawData.user && rawData.user.profile) {
      profile = rawData.user.profile;
    } else if (rawData.profile) {
      profile = rawData.profile;
    } else if (rawData.first_name || rawData.last_name) {
      // Direct profile data
      profile = rawData;
    }
    
    if (!profile) return null;
    
    // Normalize field names for consistency
    const normalized = {
      ...profile,
      // Ensure avatar field exists (prefer current_photo)
      avatar: profile.avatar || profile.current_photo || null,
      // Ensure address fields are properly mapped
      current_address: profile.current_address || profile.full_address || profile.address || '',
      full_address: profile.full_address || profile.current_address || profile.address || '',
      // Ensure contact fields are mapped
      contact_number: profile.contact_number || profile.mobile_number || '',
      mobile_number: profile.mobile_number || profile.contact_number || '',
      // Ensure date fields are consistent
      birth_date: profile.birth_date || profile.date_of_birth || '',
      date_of_birth: profile.date_of_birth || profile.birth_date || '',
      // Ensure gender/sex consistency
      sex: profile.sex || profile.gender || '',
      gender: profile.gender || profile.sex || '',
      // Ensure civil status consistency
      civil_status: profile.civil_status || profile.civilStatus || '',
      civilStatus: profile.civilStatus || profile.civil_status || '',
    };
    
    console.log('Profile data normalized:', {
      original_keys: Object.keys(profile),
      normalized_keys: Object.keys(normalized),
      has_required_fields: !!(normalized.first_name && normalized.last_name)
    });
    
    return normalized;
  }, []); // Remove all dependencies to prevent infinite loops

  // Optimized fetch function with caching
  const fetchResidentData = useCallback(async () => {
    if (isFetchingRef.current) return;
    
    try {
      // Check cache first
      const cached = sessionStorage.getItem('residentData');
      const cacheTime = sessionStorage.getItem('residentDataTime');
      const isRecent = cacheTime && (Date.now() - parseInt(cacheTime)) < 300000; // 5 minutes
      
      if (cached && isRecent) {
        const cachedData = JSON.parse(cached);
        const normalized = normalizeProfileData(cachedData);
        if (normalized) {
          setResidentData(normalized);
          setCachedResidentData(normalized);
          setLoadingResident(false);
          return;
        }
      }

      isFetchingRef.current = true;
      setLoadingResident(true);
      
      // Try primary endpoint first
      let response;
      try {
        response = await axiosInstance.get('/profile');
      } catch (profileErr) {
        // Try fallback endpoint
        response = await axiosInstance.get('/residents/my-profile');
      }
      
      const normalized = normalizeProfileData(response.data);
      if (!normalized) {
        throw new Error('No valid profile data found');
      }
      
      // Cache the data
      sessionStorage.setItem('residentData', JSON.stringify(normalized));
      sessionStorage.setItem('residentDataTime', Date.now().toString());
      
      if (isMountedRef.current) {
        setResidentData(normalized);
        setCachedResidentData(normalized);
        setFeedback(null);
      }
    } catch (err) {
      console.error('Error fetching resident data:', err);
      if (isMountedRef.current) {
        setFeedback({ 
          type: 'error', 
          message: 'Failed to load profile data. Please complete your resident profile first.',
          actions: [
            { label: 'Complete Profile', action: () => navigate('/residents/profile') },
            { label: 'Retry', action: () => fetchResidentData() }
          ]
        });
      }
    } finally {
      isFetchingRef.current = false;
      if (isMountedRef.current) {
        setLoadingResident(false);
      }
    }
  }, [navigate, normalizeProfileData]);

  const fetchMyRequests = useCallback(async () => {
    try {
      setLoadingRequests(true);
      const response = await axiosInstance.get('/document-requests/my');
      setRequests(response.data.requests || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setFeedback({ type: 'error', message: 'Failed to load your document requests.' });
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  // Handle URL parameters for notification redirects
  useEffect(() => {
    const statusParam = searchParams.get('status');
    const idParam = searchParams.get('id');
    
    // If status parameter exists, switch to status tab
    if (statusParam !== null) {
      setActiveTab('status');
    }
    
    // If id parameter exists and we're on status tab, scroll to that request
    if (idParam && activeTab === 'status') {
      setTimeout(() => {
        const element = document.getElementById(`request-${idParam}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('notification-highlight');
          setTimeout(() => {
            element.classList.remove('notification-highlight');
          }, 2000);
        }
      }, 500);
    }
  }, [searchParams, activeTab]);

  // Simplified mount effect
  useEffect(() => {
    isMountedRef.current = true;
    fetchResidentData();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchResidentData]);

  // Auto-fill form when resident data becomes available
  useEffect(() => {
    if (residentData && showModal && selectedDoc && Object.keys(formValues).length === 0) {
      const autoFilledData = getAutoFilledFormData(selectedDoc.value, residentData);
      if (autoFilledData && Object.keys(autoFilledData).length > 0) {
        setFormValues(autoFilledData);
        setFeedback({
          type: 'success',
          message: 'Form auto-filled from your profile',
          duration: 3000
        });
      }
    }
  }, [residentData, showModal, selectedDoc, formValues]);

  // Fetch document requests when status tab is active
  useEffect(() => {
    if (activeTab === 'status' && residentData && isMountedRef.current) {
      // Inline function to avoid dependency issues
      const loadRequests = async () => {
        try {
          setLoadingRequests(true);
          const response = await axiosInstance.get('/document-requests/my');
          setRequests(response.data || []);
        } catch (err) {
          console.error('Error fetching requests:', err);
          setFeedback({ type: 'error', message: 'Failed to load your document requests.' });
        } finally {
          setLoadingRequests(false);
        }
      };
      
      loadRequests();
    }
  }, [activeTab, residentData]); // Stable dependencies

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      // Add class to body to prevent scrolling
      document.body.classList.add('modal-open');
      // Store current scroll position
      const scrollY = window.scrollY;
      document.body.style.top = `-${scrollY}px`;
    } else {
      // Remove class and restore scroll position
      document.body.classList.remove('modal-open');
      const scrollY = document.body.style.top;
      document.body.style.top = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    
    // Cleanup function
    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.top = '';
    };
  }, [showModal]);

  // Auto-refresh resident data periodically (optional)
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Inline refresh logic to avoid function dependency
      fetchResidentData(false);
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [autoRefresh]); // Only autoRefresh dependency

  // Enhanced auto-fill form when resident data becomes available and modal is open
  useEffect(() => {
    if (showModal && selectedDoc && Object.keys(formValues).length === 0) {
      // Try to get available data from any source with normalization
      const getAvailableData = () => {
        // Try current state data first
        if (residentData && Object.keys(residentData).length > 0) {
          return normalizeProfileData(residentData);
        }
        
        if (cachedResidentData && Object.keys(cachedResidentData).length > 0) {
          return normalizeProfileData(cachedResidentData);
        }
        
        // Try session storage as last resort
        const cachedDataString = sessionStorage.getItem('residentData');
        if (cachedDataString) {
          try {
            const parsedData = JSON.parse(cachedDataString);
            if (parsedData && Object.keys(parsedData).length > 0) {
              return normalizeProfileData(parsedData);
            }
          } catch (e) {
            console.error('Failed to parse session data in useEffect:', e);
            // Clear corrupted cache
            sessionStorage.removeItem('residentData');
            sessionStorage.removeItem('residentDataTime');
          }
        }
        return null;
      };

      const availableData = getAvailableData();
      
      if (availableData && (availableData.first_name || availableData.last_name)) {
        console.log('🔄 ResidentData became available via useEffect, auto-filling form...');
        console.log('📋 Available resident data:', {
          first_name: availableData.first_name,
          last_name: availableData.last_name,
          current_address: availableData.current_address,
          full_address: availableData.full_address,
          age: availableData.age,
          sex: availableData.sex,
          civil_status: availableData.civil_status,
          birth_date: availableData.birth_date
        });
        
        const autoFilledData = getAutoFilledFormData(selectedDoc.value, availableData);
        console.log('✅ Auto-filled data from useEffect:', autoFilledData);
        
        // Only set form values if we got valid autofill data
        if (autoFilledData && Object.keys(autoFilledData).length > 0) {
          setFormValues(autoFilledData);
          
          setFeedback({
            type: 'success',
            message: '✅ Form auto-filled from your profile',
            duration: 3000
          });
          
          // Auto-fill photo for Barangay Clearance from resident profile
          if (selectedDoc.value === 'Brgy Clearance' && (availableData?.current_photo || availableData?.avatar) && !photoPreview) {
            const photoUrl = (availableData.current_photo || availableData.avatar);
            const finalPhotoUrl = photoUrl && photoUrl.startsWith('http') 
              ? photoUrl 
              : `http://localhost:8000/storage/${photoUrl}`;
            setPhotoPreview(finalPhotoUrl);
            setSelectedPhoto(null);
          }
        } else {
          console.warn('⚠️ Auto-fill failed: No valid form data generated');
          setFeedback({
            type: 'validation',
            message: 'Profile data found but some fields may be missing. Please verify your information.',
            duration: 4000
          });
        }
      } else {
        console.warn('⚠️ No usable resident data available for auto-fill');
        setFeedback({
          type: 'validation',
          message: 'No resident data available. Please complete your profile first.',
          actions: [
            { label: 'Complete Profile', action: () => navigate('/residents/profile') }
          ]
        });
      }
    }
  }, [showModal, selectedDoc, residentData, cachedResidentData, formValues, navigate, photoPreview]); // Add photoPreview dependency


  // Manual refresh function
  const handleRefreshData = useCallback(() => {
    fetchResidentData(true);
    setFeedback({
      type: 'loading',
      message: 'Refreshing your profile data...'
    });
    
    setTimeout(() => {
      setFeedback({
        type: 'success',
        message: '✅ Profile data refreshed successfully!',
        duration: 2000
      });
    }, 1000);
  }, []); // Empty dependency array since fetchResidentData is stable


  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentTypeColor = (type) => {
    switch (type) {
      case 'Brgy Clearance':
        return 'bg-blue-100 text-blue-800';
      case 'Brgy Indigency':
        return 'bg-purple-100 text-purple-800';
      case 'Brgy Residency':
        return 'bg-orange-100 text-orange-800';
      case 'Brgy Business Permit':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleShowDetails = (request) => {
    if (selectedRequest?.id === request.id) {
      setSelectedRequest(null);
    } else {
      setSelectedRequest(request);
    }
  };


  const documentOptions = [
    {
      label: "Barangay Clearance",
      icon: <FaFileAlt className="text-emerald-600 text-5xl mb-4 mx-auto transition-all duration-300 group-hover:scale-110 group-hover:text-emerald-500" />,
      value: "Brgy Clearance",
      description: "Official clearance for various purposes",
      gradient: "from-emerald-400 to-teal-500",
      bgPattern: "bg-gradient-to-br from-emerald-50 to-teal-50",
    },
    {
      label: "Barangay Business Permit",
      icon: <FaBusinessTime className="text-blue-600 text-5xl mb-4 mx-auto transition-all duration-300 group-hover:scale-110 group-hover:text-blue-500" />,
      value: "Brgy Business Permit",
      description: "Permit for business operations",
      gradient: "from-blue-400 to-indigo-500",
      bgPattern: "bg-gradient-to-br from-blue-50 to-indigo-50",
    },
    {
      label: "Certificate of Indigency",
      icon: <FaIdBadge className="text-purple-600 text-5xl mb-4 mx-auto transition-all duration-300 group-hover:scale-110 group-hover:text-purple-500" />,
      value: "Brgy Indigency",
      description: "Certificate for financial assistance",
      gradient: "from-purple-400 to-pink-500",
      bgPattern: "bg-gradient-to-br from-purple-50 to-pink-50",
    },
    {
      label: "Certificate of Residency",
      icon: <FaHome className="text-orange-600 text-5xl mb-4 mx-auto transition-all duration-300 group-hover:scale-110 group-hover:text-orange-500" />,
      value: "Brgy Residency",
      description: "Proof of residence certificate",
      gradient: "from-orange-400 to-red-500",
      bgPattern: "bg-gradient-to-br from-orange-50 to-red-50",
    },
    {
      label: "Barangay Certification",
      icon: <FaCertificate className="text-rose-600 text-5xl mb-4 mx-auto transition-all duration-300 group-hover:scale-110 group-hover:text-rose-500" />,
      value: "Brgy Certification",
      description: "Official certification for various needs",
      gradient: "from-rose-400 to-pink-500",
      bgPattern: "bg-gradient-to-br from-rose-50 to-pink-50",
    },
  ];

  // Helper function to format date for HTML date input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    // Convert ISO date to yyyy-MM-dd format
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const getAutoFilledFormData = (documentType, sourceData = null) => {
    const dataSource = sourceData || residentData;
    
    if (!dataSource) {
      console.warn('❌ No resident data available for auto-fill');
      return {};
    }

    console.log('🔍 Auto-filling data for document type:', documentType);
    console.log('📋 Raw resident data:', dataSource);
    console.log('🔍 Key fields check:', {
      first_name: dataSource.first_name,
      last_name: dataSource.last_name,
      current_address: dataSource.current_address,
      full_address: dataSource.full_address,
      address: dataSource.address,
      contact_number: dataSource.contact_number,
      mobile_number: dataSource.mobile_number,
      birth_date: dataSource.birth_date,
      date_of_birth: dataSource.date_of_birth,
      age: dataSource.age,
      sex: dataSource.sex,
      gender: dataSource.gender,
      civil_status: dataSource.civil_status,
      civilStatus: dataSource.civilStatus,
      years_in_barangay: dataSource.years_in_barangay,
      period_of_stay: dataSource.period_of_stay,
      business_info: dataSource.business_info,
      avatar: dataSource.avatar,
      current_photo: dataSource.current_photo
    });

    const baseData = {
      purpose: '', // This will be manually filled
      remarks: '', // This will be manually filled
    };

    // Helper function to get full name
    const getFullName = (data) => {
      return `${data.first_name || ''} ${data.middle_name ? data.middle_name + ' ' : ''}${data.last_name || ''}${data.name_suffix ? ' ' + data.name_suffix : ''}`.trim();
    };

    // Helper function to get address - prioritize current_address from profile, then full_address from resident
    const getAddress = (data) => {
      return data.current_address || data.full_address || data.address || '';
    };

    // Helper function to get phone number - prioritize mobile_number from profile, then contact_number from resident
    const getPhoneNumber = (data) => {
      return data.mobile_number || data.contact_number || '';
    };

    switch (documentType) {
      case 'Brgy Clearance':
        const clearanceData = {
          ...baseData,
          name: getFullName(dataSource), // Field name is 'name' for Brgy Clearance
          address: getAddress(dataSource), // Field name is 'address' for Brgy Clearance
          periodOfStay: dataSource.years_in_barangay ? `${dataSource.years_in_barangay} years` : (dataSource.period_of_stay || ''),
          dateOfBirth: formatDateForInput(dataSource.birth_date || dataSource.date_of_birth) || '',
          gender: dataSource.sex || dataSource.gender || '',
          civilStatus: dataSource.civil_status || dataSource.civilStatus || '',
          birthplace: dataSource.birth_place || dataSource.birthplace || '',
          age: dataSource.age ? String(dataSource.age) : '',
        };
        console.log('✅ Generated Brgy Clearance data:', clearanceData);
        return clearanceData;
      
      case 'Brgy Business Permit':
        const businessData = {
          ...baseData,
          businessName: dataSource.business_info || dataSource.business_name || '',
          businessOwner: getFullName(dataSource),
          businessAddress: getAddress(dataSource), // Add business address
          contact_number: getPhoneNumber(dataSource), // Add phone number
        };
        console.log('✅ Generated Business Permit data:', businessData);
        return businessData;
      
      case 'Brgy Indigency':
        const indigencyData = {
          ...baseData,
          fullName: getFullName(dataSource), // Field name is 'fullName' for Indigency
          full_address: getAddress(dataSource), // Field name is 'full_address' for Indigency
          contact_number: getPhoneNumber(dataSource), // Add phone number
        };
        console.log('✅ Generated Indigency data:', indigencyData);
        return indigencyData;
      
      case 'Brgy Residency':
        const residencyData = {
          ...baseData,
          fullName: getFullName(dataSource), // Field name is 'fullName' for Residency
          address: getAddress(dataSource), // Field name is 'address' for Residency
          contact_number: getPhoneNumber(dataSource), // Add phone number
        };
        console.log('✅ Generated Residency data:', residencyData);
        return residencyData;
      
      case 'Brgy Certification':
        const certificationData = {
          ...baseData,
          fullName: getFullName(dataSource), // Field name is 'fullName' for Certification
          address: getAddress(dataSource), // Field name is 'address' for Certification
          dateOfBirth: formatDateForInput(dataSource.birth_date || dataSource.date_of_birth) || '',
          civilStatus: dataSource.civil_status || dataSource.civilStatus || '',
          age: dataSource.age ? String(dataSource.age) : '',
          // Additional fields for specific certifications
          childName: '', // For solo parent certification
          childBirthDate: '', // For solo parent certification
          motherName: '', // For delayed registration
          fatherName: '', // For delayed registration
          requestorName: '', // For delayed registration
        };
        console.log('✅ Generated Certification data:', certificationData);
        return certificationData;
      
      default:
        console.warn('⚠️ Unknown document type:', documentType);
        return baseData;
    }
  };

  const documentForms = {
    'Brgy Clearance': [
      { name: 'name', label: 'Full Name', type: 'text', required: true, autoFill: true },
      { name: 'address', label: 'Address', type: 'text', required: true, autoFill: true },
      { name: 'periodOfStay', label: 'Period of Stay', type: 'text', required: true, autoFill: true },
      { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true, autoFill: true },
      { name: 'gender', label: 'Gender', type: 'select', required: true, autoFill: true, options: ['Male', 'Female', 'Prefer not to say'] },
      { name: 'civilStatus', label: 'Civil Status', type: 'select', required: true, autoFill: true, options: ['Single', 'Married', 'Widowed', 'Divorced'] },
      { name: 'birthplace', label: 'Birthplace', type: 'text', required: true, autoFill: true },
      { name: 'age', label: 'Age', type: 'number', required: true, autoFill: true },
      { name: 'purpose', label: 'Purpose of Clearance', type: 'textarea', required: true, autoFill: false },
    ],
    'Brgy Business Permit': [
      { name: 'businessName', label: 'Business Name', type: 'text', required: true, autoFill: true },
      { name: 'businessOwner', label: 'Business Owner', type: 'text', required: true, autoFill: true },
      { name: 'businessAddress', label: 'Business Address', type: 'text', required: true, autoFill: true },
      { name: 'contact_number', label: 'Contact Number', type: 'tel', required: true, autoFill: true },
      { name: 'purpose', label: 'Purpose', type: 'textarea', required: true, autoFill: false },
    ],
    'Brgy Indigency': [
      { name: 'fullName', label: 'Full Name', type: 'text', required: true, autoFill: true },
      { name: 'full_address', label: 'Complete Address', type: 'text', required: true, autoFill: true },
      { name: 'contact_number', label: 'Contact Number', type: 'tel', required: true, autoFill: true },
      { name: 'purpose', label: 'Purpose', type: 'textarea', required: true, autoFill: false },
    ],
    'Brgy Residency': [
      { name: 'fullName', label: 'Full Name', type: 'text', required: true, autoFill: true },
      { name: 'address', label: 'Complete Address', type: 'text', required: true, autoFill: true },
      { name: 'contact_number', label: 'Contact Number', type: 'tel', required: true, autoFill: true },
      { name: 'purpose', label: 'Purpose', type: 'textarea', required: true, autoFill: false },
    ],
    'Brgy Certification': [
      { name: 'fullName', label: 'Full Name', type: 'text', required: true, autoFill: true },
      { name: 'address', label: 'Complete Address', type: 'text', required: true, autoFill: true },
      { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true, autoFill: true },
      { name: 'civilStatus', label: 'Civil Status', type: 'select', required: true, autoFill: true, options: ['Single', 'Married', 'Widowed', 'Divorced'] },
      { name: 'age', label: 'Age', type: 'number', required: true, autoFill: true },
      { name: 'purpose', label: 'Type of Certification', type: 'select', required: true, autoFill: false, options: [
        'Solo Parent Certification',
        'Delayed Registration of Birth Certificate',
        'First Time Job Seeker',
        'PWD Certification'
      ]},
      // Conditional fields for Solo Parent Certification
      { name: 'childName', label: 'Child\'s Full Name', type: 'text', required: false, autoFill: false, conditional: 'Solo Parent Certification' },
      { name: 'childBirthDate', label: 'Child\'s Birth Date', type: 'date', required: false, autoFill: false, conditional: 'Solo Parent Certification' },
      // Conditional fields for Delayed Registration
      { name: 'motherName', label: 'Mother\'s Full Name', type: 'text', required: true, autoFill: false, conditional: 'Delayed Registration of Birth Certificate' },
      { name: 'fatherName', label: 'Father\'s Full Name', type: 'text', required: true, autoFill: false, conditional: 'Delayed Registration of Birth Certificate' },
      { name: 'requestorName', label: 'Requestor\'s Full Name', type: 'text', required: true, autoFill: false, conditional: 'Delayed Registration of Birth Certificate' },
      { name: 'remarks', label: 'Additional Information/Remarks', type: 'textarea', required: false, autoFill: false }
    ],
  };

  // Add purpose options for each document type
  const purposeOptions = {
    'Brgy Clearance': [
      'local employment',
      'loan',
      'identification',
      'ojt',
      'water/electric connection',
      'bank',
      'senior',
      'e-bike',
      'postal',
      'other specific',
    ],
    'Brgy Residency': [
      'verification and identification (School Requirement)',
      'verification and identification PWD',
      'other',
    ],
    'Brgy Indigency': [
      'verification and identification (philhealth Requirement)',
      'BOTICAB Requirement',
      'Medical/Financial Assistance',
      'Financial Assistance',
      'Animal Bite Vaccination',
      'Public Attorney\'s Office Assistance',
      'Burial/Financial Assistance',
      'other',
    ],
  };

  // Helper function to get available resident data (moved before openModal)
  const getAvailableResidentData = useCallback(() => {
      // 1. Try current residentData state
      if (residentData && Object.keys(residentData).length > 0) {
        console.log('✅ Using current residentData state');
        return normalizeProfileData(residentData);
      }
      
      // 2. Try cachedResidentData state
      if (cachedResidentData && Object.keys(cachedResidentData).length > 0) {
        console.log('✅ Using cachedResidentData state');
        return normalizeProfileData(cachedResidentData);
      }
      
      // 3. Try session storage directly
      const cachedDataString = sessionStorage.getItem('residentData');
      if (cachedDataString) {
        try {
          const parsedData = JSON.parse(cachedDataString);
          if (parsedData && Object.keys(parsedData).length > 0) {
            console.log('✅ Using session storage data directly');
            return normalizeProfileData(parsedData);
          }
        } catch (parseError) {
          console.error('Failed to parse cached data:', parseError);
          // Clear corrupted cache
          sessionStorage.removeItem('residentData');
          sessionStorage.removeItem('residentDataTime');
        }
      }
      
      return null;
  }, [residentData, cachedResidentData, normalizeProfileData]);

  const openModal = async (doc) => {
    console.log('🔍 RequestDocuments: openModal clicked', { 
      doc: doc?.value, 
      hasResidentData: !!residentData,
      loadingResident,
      residentDataKeys: residentData ? Object.keys(residentData) : []
    });

    // Get available resident data first
    let currentResidentData = getAvailableResidentData();

    // Check if Business Permit is being requested and validate business info
    if (doc?.value === 'Brgy Business Permit') {
      const validation = validateBusinessInfo(currentResidentData || residentData);
      
      if (!validation.isValid) {
        setBusinessInfoValidation(validation);
        setShowBusinessInfoWarning(true);
        setSelectedDoc(doc); // Still set selected doc for context
        return; // Don't open the modal yet
      }
    }

    setSelectedDoc(doc);
    
    // Clear previous states
    setFeedback(null);
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setBusinessInfoValidation(null);
    setShowBusinessInfoWarning(false);

    // Open modal first
    setShowModal(true);
    
    console.log('🔍 DEBUG - Checking available data:', {
      residentData: !!residentData,
      cachedResidentData: !!cachedResidentData,
      sessionStorageData: !!sessionStorage.getItem('residentData'),
      currentResidentData: !!currentResidentData,
      currentDataKeys: currentResidentData ? Object.keys(currentResidentData) : [],
      hasRequiredFields: currentResidentData ? !!(currentResidentData.first_name && currentResidentData.last_name) : false
    });

    // If no data available, try to fetch it
    if (!currentResidentData && !loadingResident) {
      console.log('🔄 No resident data available, attempting to fetch...');
      setFeedback({ 
        type: 'loading', 
        message: 'Loading your profile data...' 
      });
      
      try {
        await fetchResidentData(true); // Force refresh
        // After fetch, try to get data again
        currentResidentData = getAvailableResidentData();
      } catch (error) {
        console.error('Failed to fetch resident data:', error);
        setFeedback({ 
          type: 'error', 
          message: 'Failed to load profile data. Please refresh the page and try again.',
          actions: [
            { label: 'Complete Profile', action: () => navigate('/residents/profile') },
            { label: 'Retry', action: () => fetchResidentData(true) }
          ]
        });
        return;
      }
    }

    // Auto-fill immediately if we have data, otherwise wait a bit
    const performAutoFill = () => {
      // Try to get data again
      if (!currentResidentData) {
        currentResidentData = getAvailableResidentData();
      }
      
      if (currentResidentData && (currentResidentData.first_name || currentResidentData.last_name)) {
        console.log('🔄 Auto-filling form data with normalized data:', {
          first_name: currentResidentData.first_name,
          last_name: currentResidentData.last_name,
          current_address: currentResidentData.current_address,
          full_address: currentResidentData.full_address,
          age: currentResidentData.age,
          sex: currentResidentData.sex,
          civil_status: currentResidentData.civil_status,
          birth_date: currentResidentData.birth_date
        });
        
        const autoFilledData = getAutoFilledFormData(doc.value, currentResidentData);
        console.log('✅ Auto-filled data generated:', autoFilledData);
        
        // Only set form values if we got valid data
        if (autoFilledData && Object.keys(autoFilledData).length > 0) {
          setFormValues(autoFilledData);
          
          // Update cached data states if they weren't set
          if (!residentData) {
            setResidentData(currentResidentData);
          }
          if (!cachedResidentData) {
            setCachedResidentData(currentResidentData);
          }
          
          setFeedback({
            type: 'success',
            message: '✅ Form auto-filled from your profile',
            duration: 3000
          });
      
          // Auto-fill photo for Barangay Clearance from resident profile
          if (doc.value === 'Brgy Clearance' && (currentResidentData?.current_photo || currentResidentData?.avatar)) {
            const photoUrl = (currentResidentData.current_photo || currentResidentData.avatar);
            const finalPhotoUrl = photoUrl && photoUrl.startsWith('http') 
              ? photoUrl 
              : `http://localhost:8000/storage/${photoUrl}`;
            setPhotoPreview(finalPhotoUrl);
            setSelectedPhoto(null);
            
            setTimeout(() => {
              setFeedback({
                type: 'success',
                message: '📸 Profile photo and form auto-filled!',
                duration: 2000
              });
            }, 1000);
          }
        } else {
          console.warn('⚠️ Auto-fill failed: No valid form data generated');
          setFeedback({
            type: 'validation',
            message: 'Profile data found but some fields may be missing. Please verify your information.',
            duration: 4000
          });
        }
      } else {
        console.warn('❌ Still no usable resident data available for auto-fill after all attempts');
        setFormValues({}); // Clear form values
        setFeedback({ 
          type: 'validation', 
          message: 'Profile data could not be loaded. Please complete your resident profile first.',
          actions: [
            { label: 'Complete Profile', action: () => navigate('/residents/profile') },
            { label: 'Retry', action: () => fetchResidentData(true) }
          ]
        });
      }
    };

    // If we have data immediately, use it
    if (currentResidentData) {
      performAutoFill();
    } else {
      // Otherwise, wait a bit for potential state updates
      setTimeout(performAutoFill, 300);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDoc(null);
    setPurpose('');
    setRemarks('');
    setFeedback(null);
    
    // Clean up photo states
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setShowCamera(false);
    
    // Stop camera stream if active
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  // Photo handling functions
  const handlePhotoSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setFeedback({
          type: 'error',
          message: 'Please select a valid image file (JPEG, PNG, etc.)'
        });
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setFeedback({
          type: 'error',
          message: 'Photo size must be less than 5MB'
        });
        return;
      }
      
      setSelectedPhoto(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setFeedback({
        type: 'success',
        message: '📸 Photo selected successfully!'
      });
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user' // Front camera
        }
      });
      setCameraStream(stream);
      setShowCamera(true);
      setFeedback({
        type: 'success',
        message: '📷 Camera started! Position yourself and click capture.'
      });
    } catch (error) {
      console.error('Error accessing camera:', error);
      setFeedback({
        type: 'error',
        message: 'Unable to access camera. Please check permissions or use file upload instead.'
      });
    }
  };

  const capturePhoto = () => {
    if (!cameraStream) return;
    
    const video = document.getElementById('camera-video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
      setSelectedPhoto(file);
      setPhotoPreview(canvas.toDataURL());
      
      // Stop camera
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      setShowCamera(false);
      
      setFeedback({
        type: 'success',
        message: '📸 Photo captured successfully!'
      });
    }, 'image/jpeg', 0.8);
  };

  const removePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setFeedback({
      type: 'success',
      message: 'Photo removed'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 Form submission started');
    console.log('📋 Current form values:', formValues);
    console.log('📄 Selected document:', selectedDoc);
    
    setLoading(true);
    setFeedback({ type: 'loading', message: 'Processing your request...' });
    
    try {
      // Validate business info for Business Permit requests
      if (selectedDoc.value === 'Brgy Business Permit') {
        const currentResidentData = getAvailableResidentData();
        const validation = validateBusinessInfo(currentResidentData || residentData);
        
        if (!validation.isValid) {
          setBusinessInfoValidation(validation);
          setShowBusinessInfoWarning(true);
          setLoading(false);
          setFeedback({
            type: 'error',
            message: 'Business information is incomplete. Please update your profile first.',
            duration: 5000
          });
          return;
        }
      }
      
      // Validate required fields based on document type and purpose
      const allFields = documentForms[selectedDoc.value] || [];
      const missingFields = [];
      
      // Get fields that should be validated based on current purpose
      const fieldsToValidate = allFields.filter(field => {
        // Always validate non-conditional required fields
        if (!field.conditional && field.required) {
          return true;
        }
        // Only validate conditional fields if they match the current purpose
        if (field.conditional && field.required && formValues.purpose === field.conditional) {
          return true;
        }
        return false;
      });
      
      console.log('✅ Fields to validate for', selectedDoc.value, 'with purpose', formValues.purpose, ':', fieldsToValidate.map(f => f.name));
      
      for (const field of fieldsToValidate) {
        const fieldValue = formValues[field.name];
        console.log(`🔍 Checking field ${field.name}:`, fieldValue);
        
        if (!fieldValue || fieldValue.toString().trim() === '') {
          missingFields.push(field.label);
          console.log(`❌ Missing required field: ${field.name} (${field.label})`);
        }
      }
      
      // Validate photo for Barangay Clearance (allow profile photo)
      if (selectedDoc.value === 'Brgy Clearance' && !selectedPhoto && !photoPreview) {
        missingFields.push('Photo');
      }
      
      if (missingFields.length > 0) {
        console.log('❌ Form validation failed. Missing fields:', missingFields);
        setFeedback({
          type: 'validation',
          message: `Please fill in all required fields: ${missingFields.join(', ')}`,
          duration: 5000
        });
        setLoading(false);
        return;
      }
      
      console.log('✅ Form validation passed. Proceeding with submission...');
      
      // Prepare submission data
      let purposeValue = formValues.purpose;
      if ((purposeValue === 'other' || purposeValue === 'other specific') && formValues.otherPurpose) {
        purposeValue = formValues.otherPurpose;
      }
      const submitFields = { ...formValues, purpose: purposeValue };
      delete submitFields.otherPurpose;
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('document_type', selectedDoc.value);
      formData.append('fields', JSON.stringify(submitFields));
      
      // Add photo if selected (only for Barangay Clearance)
      if (selectedDoc.value === 'Brgy Clearance' && selectedPhoto) {
        formData.append('photo', selectedPhoto);
      }
      
      // Debug logging
      console.log('Document request validation passed. Submitting:', {
        document_type: selectedDoc.value,
        fields: submitFields,
        hasPhoto: selectedDoc.value === 'Brgy Clearance' && (selectedPhoto || photoPreview) ? true : false,
        photoName: selectedPhoto?.name,
        requiredFieldsCount: fieldsToValidate.length,
        formDataEntries: Array.from(formData.entries()).map(([key, value]) => [
          key,
          value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value
        ])
      });
      
      // Additional debug for delayed registration fields
      if (selectedDoc.value === 'Brgy Certification' && submitFields.purpose === 'Delayed Registration of Birth Certificate') {
        console.log('🔍 DELAYED REGISTRATION DEBUG:', {
          motherName: submitFields.motherName,
          fatherName: submitFields.fatherName,
          requestorName: submitFields.requestorName,
          allFields: submitFields,
          formValues: formValues,
          purposeValue: purposeValue
        });
        
        // Check if the fields exist in formValues
        console.log('🔍 FORM VALUES CHECK:', {
          'formValues.motherName': formValues.motherName,
          'formValues.fatherName': formValues.fatherName,
          'formValues.requestorName': formValues.requestorName,
          'formValues.purpose': formValues.purpose
        });
      }
      
      const response = await axiosInstance.post('/document-requests', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout
      });
      
      console.log('✅ Document request submitted successfully:', response.data);
      
      setFeedback({
        type: 'success',
        message: `🎉 ${selectedDoc.label} request submitted successfully!`,
        details: 'Your request has been received and is now being processed. You will receive notifications about status updates.',
        actions: [
          { label: 'Track Status', action: () => { closeModal(); setActiveTab('status'); } },
          { label: 'Request Another', action: () => { closeModal(); } },
          { label: 'Close', action: () => closeModal() }
        ]
      });
      
      // Reset form and close modal after success
      setTimeout(() => {
        setFormValues({});
        setSelectedPhoto(null);
        setPhotoPreview(null);
        setFeedback(null);
        closeModal();
      }, 3000);
    } catch (err) {
      console.error('🚨 SUBMISSION ERROR:', {
        error: err,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
        stack: err.stack
      });
      
      const errorMessage = err.response?.data?.message || 'Submission failed. Please try again.';
      const errorCode = err.response?.status;
      const errorData = err.response?.data;
      
      let enhancedMessage = errorMessage;
      let errorType = 'error';
      let actions = [];
      
      if (errorCode === 422) {
        if (errorData?.error_code === 'NO_RESIDENT_PROFILE') {
          enhancedMessage = 'You need to complete your resident profile first before requesting documents.';
          errorType = 'validation';
          actions = [
            { label: 'Complete Profile', action: () => navigate('/residents/profile') },
            { label: 'Try Again Later', action: () => setFeedback(null) }
          ];
        } else if (errorData?.error_code === 'INCOMPLETE_PROFILE') {
          enhancedMessage = 'Your resident profile is missing required information. Please update your profile.';
          errorType = 'validation';
          actions = [
            { label: 'Update Profile', action: () => navigate('/residents/profile') },
            { label: 'Try Again Later', action: () => setFeedback(null) }
          ];
        } else {
          enhancedMessage = 'Please check all required fields and try again.';
          errorType = 'validation';
          actions = [
            { label: 'Try Again', action: () => setFeedback(null) },
            { label: 'Complete Profile', action: () => navigate('/residents/profile') }
          ];
        }
      } else if (errorCode === 401) {
        enhancedMessage = 'Your session has expired. Please log in again.';
        errorType = 'auth';
        actions = [{ label: 'Login Again', action: () => navigate('/login') }];
      } else if (errorCode === 500) {
        enhancedMessage = 'Server error occurred. Please try again later or contact support.';
        errorType = 'server';
        actions = [
          { label: 'Try Again', action: () => setFeedback(null) },
          { label: 'Contact Support', action: () => window.open('mailto:support@barangay.gov.ph') }
        ];
      } else if (!navigator.onLine) {
        enhancedMessage = 'No internet connection. Please check your connection and try again.';
        errorType = 'network';
        actions = [{ label: 'Try Again', action: () => setFeedback(null) }];
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        enhancedMessage = 'Request timed out. Please check your internet connection and try again.';
        errorType = 'network';
        actions = [{ label: 'Try Again', action: () => setFeedback(null) }];
      } else {
        actions = [
          { label: 'Try Again', action: () => setFeedback(null) },
          { label: 'Complete Profile', action: () => navigate('/residents/profile') }
        ];
      }
      
      setFeedback({
        type: errorType,
        message: enhancedMessage,
        details: errorCode ? `Error Code: ${errorCode}` : 'Please ensure your profile is complete before requesting documents.',
        actions: actions
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingResident) {
    return (
      <>
        <Navbares />
        <Sidebares />
        <main className={`
          bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen pt-36 px-6 pb-16 font-sans relative overflow-hidden
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
          ml-0
        `}>
          <LoadingSkeleton />
        </main>
      </>
    );
  }

  return (
    <>
      <Navbares />
      <Sidebares />
      
      <main className={`
        bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen pt-36 px-6 pb-16 font-sans relative overflow-hidden
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
        ml-0
      `}>
        {/* Animated background elements */}
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
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
                      Request Documents
                    </h1>
                    <button
                      onClick={handleRefreshData}
                  className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 hover:rotate-180"
                      title="Refresh Profile Data"
                    >
                      <svg 
                    className="w-5 h-5 text-white" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                    Choose the document you need and we'll auto-fill your information from your profile
                  </p>
                </div>

            {/* Enhanced Tab Navigation */}
            <div className="flex bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-2xl shadow-lg overflow-hidden mb-8">
              <button
                className={`flex-1 py-5 px-8 text-center font-bold text-lg relative transition-all duration-300 ${
                  activeTab === 'request'
                    ? 'text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg'
                    : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
                onClick={() => setActiveTab('request')}
              >
                <div className="flex items-center justify-center gap-3">
                  <div className={`p-2 rounded-lg transition-all duration-300 ${
                    activeTab === 'request' 
                      ? 'bg-white/20' 
                      : 'bg-emerald-100'
                  }`}>
                    <FaFileAlt className={`w-5 h-5 ${activeTab === 'request' ? 'text-white' : 'text-emerald-600'}`} />
                  </div>
                  <span>Request Documents</span>
                </div>
                {activeTab === 'request' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/50"></div>
                )}
              </button>
              <button
                className={`flex-1 py-5 px-8 text-center font-bold text-lg relative transition-all duration-300 ${
                  activeTab === 'status'
                    ? 'text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg'
                    : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
                onClick={() => setActiveTab('status')}
              >
                <div className="flex items-center justify-center gap-3">
                  <div className={`p-2 rounded-lg transition-all duration-300 ${
                    activeTab === 'status' 
                      ? 'bg-white/20' 
                      : 'bg-emerald-100'
                  }`}>
                    <FaList className={`w-5 h-5 ${activeTab === 'status' ? 'text-white' : 'text-emerald-600'}`} />
                  </div>
                  <span>Document Status</span>
                </div>
                {activeTab === 'status' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/50"></div>
                )}
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'request' ? (
              /* Request Documents Tab */
              <div>

            {/* Document Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
              {documentOptions.map((doc, index) => {
                // Check if Business Permit and business info is incomplete
                const isBusinessPermit = doc.value === 'Brgy Business Permit';
                const currentResidentData = getAvailableResidentData();
                const isBusinessInfoIncomplete = isBusinessPermit && validateBusinessInfo(currentResidentData || residentData || {}).isValid === false;
                
                return (
                <div
                  key={index}
                    onClick={() => {
                      if (isBusinessInfoIncomplete) {
                        // Show warning modal for incomplete business info
                        const validation = validateBusinessInfo(currentResidentData || residentData || {});
                        setBusinessInfoValidation(validation);
                        setShowBusinessInfoWarning(true);
                        setSelectedDoc(doc);
                      } else {
                        openModal(doc);
                      }
                    }}
                    className={`relative rounded-3xl p-8 text-center transition-all duration-500 w-full max-w-[240px] mx-auto animate-fadeInUp ${
                      isBusinessInfoIncomplete
                        ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 cursor-pointer opacity-80 hover:opacity-100 shadow-md hover:shadow-lg'
                        : 'bg-white border-2 border-gray-100 hover:border-emerald-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-3 cursor-pointer group overflow-hidden'
                    }`}
                    style={{
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    {/* Gradient Background Overlay on Hover */}
                    {!isBusinessInfoIncomplete && (
                      <div className={`absolute inset-0 bg-gradient-to-br ${doc.bgPattern} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-0`}></div>
                    )}
                    
                    {/* Content Container */}
                    <div className="relative z-10">
                      {/* Icon Container */}
                      <div className="mb-6 relative flex justify-center">
                        <div className={`relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${doc.gradient} shadow-lg group-hover:shadow-xl transform group-hover:scale-110 transition-all duration-500`}>
                          <div className="text-white text-4xl transform group-hover:rotate-6 transition-transform duration-500">
                            {doc.value === 'Brgy Clearance' && <FaFileAlt className="text-white text-4xl" />}
                            {doc.value === 'Brgy Business Permit' && <FaBusinessTime className="text-white text-4xl" />}
                            {doc.value === 'Brgy Indigency' && <FaIdBadge className="text-white text-4xl" />}
                            {doc.value === 'Brgy Residency' && <FaHome className="text-white text-4xl" />}
                            {doc.value === 'Brgy Certification' && <FaCertificate className="text-white text-4xl" />}
                  </div>
                          {/* Shine Effect */}
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                        {isBusinessInfoIncomplete && (
                          <div className="absolute -top-2 -right-2 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-full p-2 shadow-xl animate-pulse z-20">
                            <FaExclamationTriangle className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      
                      {/* Title */}
                      <h3 className={`font-bold text-xl mb-3 transition-colors duration-300 ${
                        isBusinessInfoIncomplete 
                          ? 'text-gray-500' 
                          : 'text-gray-800 group-hover:text-gray-900'
                      }`}>
                    {doc.label}
                  </h3>
                      
                      {/* Description */}
                      <p className={`text-sm leading-relaxed mb-4 transition-colors duration-300 ${
                        isBusinessInfoIncomplete 
                          ? 'text-gray-400' 
                          : 'text-gray-600 group-hover:text-gray-700'
                      }`}>
                    {doc.description}
                  </p>
                  
                      {/* Action Indicator or Warning */}
                      {isBusinessInfoIncomplete ? (
                        <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl transform group-hover:scale-105 transition-transform duration-300">
                          <p className="text-xs text-orange-700 font-semibold flex items-center justify-center gap-2">
                            <FaExclamationTriangle className="w-3 h-3" />
                            Complete Business Info in Profile
                          </p>
                  </div>
                      ) : (
                        <div className="mt-4 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                          <span className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            Click to request
                          </span>
                          <FaPaperPlane className="w-4 h-4 text-emerald-600 transform group-hover:translate-x-1 transition-transform duration-300" />
                </div>
                      )}
            </div>
            
                    {/* Decorative Corner Accent */}
                    {!isBusinessInfoIncomplete && (
                      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${doc.gradient} opacity-5 rounded-bl-full transform scale-0 group-hover:scale-100 transition-transform duration-500`}></div>
                    )}
              </div>
                );
              })}
            </div>
            
            {/* Enhanced Process Information Section */}
            <div className="relative bg-gradient-to-br from-white via-emerald-50 to-teal-50 rounded-3xl p-10 border-2 border-emerald-100 shadow-2xl overflow-hidden">
              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl -ml-24 -mb-24"></div>
              
              <div className="relative z-10">
                {/* Header with Icons */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full shadow-lg transform rotate-0 hover:rotate-12 transition-transform duration-300">
                    <FaCheckCircle className="text-white text-xl" />
                  </div>
                  <h3 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Quick & Easy Process
                  </h3>
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full shadow-lg transform rotate-0 hover:-rotate-12 transition-transform duration-300">
                    <FaCheckCircle className="text-white text-xl" />
                  </div>
                </div>
                
                {/* Description */}
                <p className="text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed text-lg font-medium">
                All documents are processed efficiently with your pre-filled information.
                Track your request status and receive notifications when ready for pickup.
              </p>
              
                {/* Process Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-emerald-100 transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4 mx-auto">
                      <FaFileAlt className="text-white text-xl" />
              </div>
                    <h4 className="font-bold text-gray-800 mb-2">1. Select Document</h4>
                    <p className="text-sm text-gray-600">Choose the document you need from the options above</p>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-emerald-100 transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4 mx-auto">
                      <FaMagic className="text-white text-xl" />
                    </div>
                    <h4 className="font-bold text-gray-800 mb-2">2. Auto-Fill Info</h4>
                    <p className="text-sm text-gray-600">Your information is automatically filled from your profile</p>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-emerald-100 transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mb-4 mx-auto">
                      <FaCheckCircle className="text-white text-xl" />
                    </div>
                    <h4 className="font-bold text-gray-800 mb-2">3. Track Status</h4>
                    <p className="text-sm text-gray-600">Monitor your request and get notified when ready</p>
                  </div>
                </div>
                
                {/* Data Freshness Indicator */}
                <div className="flex items-center justify-center gap-3 text-sm bg-white/90 backdrop-blur-sm rounded-xl py-3 px-6 shadow-md border border-emerald-200 inline-flex transform hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full">
                    <FaInfoCircle className="text-white text-xs" />
                  </div>
                  <span className="text-gray-700 font-medium">
                    Data last updated: <span className="font-bold text-emerald-600">{lastDataCheck.toLocaleTimeString()}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Document Status Tab */
          <div>
            {loadingRequests ? (
              <div className="flex flex-col justify-center items-center h-96 bg-gradient-to-br from-gray-50 to-white rounded-3xl border-2 border-gray-100">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600"></div>
                  <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-green-400" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
                <p className="mt-6 text-gray-600 font-medium text-lg">Loading your document requests...</p>
                <p className="mt-2 text-gray-400 text-sm">Please wait a moment</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 overflow-hidden w-full overflow-x-auto">
                <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-8 py-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl backdrop-blur-sm">
                      <FaList className="text-white text-2xl" />
                    </div>
                    <h2 className="text-white font-bold text-2xl">My Document Requests</h2>
                  </div>
                </div>
                
                {requests.length === 0 ? (
                  <div className="p-16 text-center bg-gradient-to-br from-gray-50 to-white">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mb-6">
                      <FaFileAlt className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No document requests found</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">You haven't submitted any document requests yet. Start by requesting a document above!</p>
                    <button
                      onClick={() => setActiveTab('request')}
                      className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 mx-auto"
                    >
                      <FaFileAlt className="w-5 h-5" />
                      Request a Document
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Enhanced Table Header */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200 px-8 py-5 min-w-[800px]">
                      <div className="flex items-center gap-4">
                        <div className="w-32 flex-shrink-0">
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                            <FaFileAlt className="w-3 h-3" />
                            Type
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                            <FaInfoCircle className="w-3 h-3" />
                            Document Details
                          </span>
                        </div>
                        <div className="w-36 flex-shrink-0">
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                            <FaCheckCircle className="w-3 h-3" />
                            Status
                          </span>
                        </div>
                        <div className="w-24 flex-shrink-0 text-right">
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2 justify-end">
                            <FaEye className="w-3 h-3" />
                            Actions
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Table Body */}
                    <div className="divide-y divide-gray-100 min-w-[800px]">
                    {requests.map((request, index) => (
                      <div 
                        key={request.id} 
                        id={`request-${request.id}`}
                        className="px-8 py-5 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-300 group"
                      >
                        <div className="flex items-center gap-4">
                          {/* Type Column */}
                          <div className="w-32 flex-shrink-0">
                            <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold shadow-md border-2 ${getDocumentTypeColor(request.document_type)} transform group-hover:scale-105 transition-transform duration-300`}>
                              {request.document_type.replace('Brgy ', '')}
                            </span>
                          </div>
                          
                          {/* Document Details Column */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-gray-900 truncate mb-2 group-hover:text-emerald-700 transition-colors duration-300">
                              {request.document_type}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                              <span className="flex items-center gap-2 text-gray-600 bg-gray-100 px-3 py-1 rounded-lg whitespace-nowrap">
                                <FaCalendarAlt className="w-4 h-4 text-emerald-600" />
                                {formatDate(request.created_at)}
                              </span>
                              {request.status.toLowerCase() === 'approved' && (
                                <span className="flex items-center gap-2 text-green-700 bg-green-100 px-3 py-1 rounded-lg whitespace-nowrap font-medium">
                                  <FaCheck className="w-4 h-4" />
                                  Approved: {formatDate(request.updated_at)}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Status Column */}
                          <div className="w-36 flex-shrink-0">
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-md border-2 ${getStatusColor(request.status)} transform group-hover:scale-105 transition-transform duration-300`}>
                              {request.status === 'approved' ? <FaCheck className="w-4 h-4" /> :
                               request.status === 'pending' ? <FaClock className="w-4 h-4" /> :
                               request.status === 'rejected' ? <FaTimes className="w-4 h-4" /> :
                               <FaSpinner className="w-4 h-4 animate-spin" />}
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </div>
                          
                          {/* Actions Column */}
                          <div className="w-24 flex-shrink-0 flex justify-end">
                            <button
                              onClick={() => handleShowDetails(request)}
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                              title="View Details"
                            >
                              <FaEye className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Enhanced Expanded Details */}
                        {selectedRequest?.id === request.id && (
                          <div className="mt-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border-2 border-emerald-100 shadow-lg animate-slideDown">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Request Details */}
                              <div className="space-y-4 bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-emerald-100">
                                <h4 className="font-bold text-gray-900 flex items-center gap-3 text-base border-b-2 border-emerald-200 pb-3">
                                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                                    <FaFileAlt className="w-4 h-4 text-white" />
                                  </div>
                                  Request Details
                                </h4>
                                <div className="space-y-3 text-sm">
                                  <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                                    <span className="font-bold text-gray-700 w-36 flex-shrink-0">Document Type:</span>
                                    <span className="text-gray-900 font-medium">{request.document_type}</span>
                                  </div>
                                  <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                                    <span className="font-bold text-gray-700 w-36 flex-shrink-0">Status:</span>
                                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold shadow-md border-2 ${getStatusColor(request.status)}`}>
                                      {request.status === 'approved' ? <FaCheck className="w-4 h-4" /> :
                                       request.status === 'pending' ? <FaClock className="w-4 h-4" /> :
                                       request.status === 'rejected' ? <FaTimes className="w-4 h-4" /> :
                                       <FaSpinner className="w-4 h-4 animate-spin" />}
                                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                    </span>
                                  </div>
                                  <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                                    <span className="font-bold text-gray-700 w-36 flex-shrink-0">Request Date:</span>
                                    <span className="text-gray-900 font-medium flex items-center gap-2">
                                      <FaCalendarAlt className="w-4 h-4 text-emerald-600" />
                                      {formatDate(request.created_at)}
                                    </span>
                                  </div>
                                  {request.status.toLowerCase() === 'approved' && (
                                    <div className="flex items-start gap-3 p-2 bg-green-50 rounded-lg border border-green-200">
                                      <span className="font-bold text-gray-700 w-36 flex-shrink-0">Approved Date:</span>
                                      <span className="text-green-700 font-medium flex items-center gap-2">
                                        <FaCheck className="w-4 h-4 text-green-600" />
                                        {formatDate(request.updated_at)}
                                      </span>
                                    </div>
                                  )}
                                  {request.fields?.purpose && (
                                    <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                                      <span className="font-bold text-gray-700 w-36 flex-shrink-0">Purpose:</span>
                                      <span className="text-gray-900 font-medium">{request.fields.purpose}</span>
                                    </div>
                                  )}
                                  {request.fields?.remarks && (
                                    <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                                      <span className="font-bold text-gray-700 w-36 flex-shrink-0">Remarks:</span>
                                      <span className="text-gray-900 font-medium">{request.fields.remarks}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Personal Information */}
                              <div className="space-y-4 bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-emerald-100">
                                <h4 className="font-bold text-gray-900 flex items-center gap-3 text-base border-b-2 border-emerald-200 pb-3">
                                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                                    <FaUser className="w-4 h-4 text-white" />
                                  </div>
                                  Personal Information
                                </h4>
                                <div className="space-y-3 text-sm">
                                  {request.resident && (
                                    <>
                                      <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                                        <span className="font-bold text-gray-700 w-36 flex-shrink-0">Full Name:</span>
                                        <span className="text-gray-900 font-medium">{`${request.resident.first_name} ${request.resident.middle_name ? request.resident.middle_name + ' ' : ''}${request.resident.last_name}${request.resident.name_suffix ? ' ' + request.resident.name_suffix : ''}`}</span>
                                      </div>
                                      <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                                        <span className="font-bold text-gray-700 w-36 flex-shrink-0">Age:</span>
                                        <span className="text-gray-900 font-medium">{request.resident.age}</span>
                                      </div>
                                      <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                                        <span className="font-bold text-gray-700 w-36 flex-shrink-0">Civil Status:</span>
                                        <span className="text-gray-900 font-medium">{request.resident.civil_status}</span>
                                      </div>
                                      <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                                        <span className="font-bold text-gray-700 w-36 flex-shrink-0">Gender:</span>
                                        <span className="text-gray-900 font-medium">{request.resident.sex}</span>
                                      </div>
                                      <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                                        <span className="font-bold text-gray-700 w-36 flex-shrink-0">Contact:</span>
                                        <span className="text-gray-900 font-medium">{request.resident.contact_number}</span>
                                      </div>
                                      <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                                        <span className="font-bold text-gray-700 w-36 flex-shrink-0">Email:</span>
                                        <span className="text-gray-900 font-medium">{request.resident.email}</span>
                                      </div>
                                      <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                                        <span className="font-bold text-gray-700 w-36 flex-shrink-0">Address:</span>
                                        <span className="text-gray-900 font-medium flex-1">{request.resident.full_address}</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
        </div>
      </main>

      {/* Business Information Warning Modal */}
      {showBusinessInfoWarning && businessInfoValidation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-t-2xl p-6 flex items-center gap-4">
              <div className="bg-white/20 rounded-full p-3 shadow-lg flex-shrink-0">
                <FaExclamationTriangle className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-white mb-1">
                  ⚠️ Incomplete Business Information
                </h2>
                <p className="text-white/90 text-sm">
                  Business information required for Barangay Business Permit
                </p>
              </div>
              <button
                onClick={() => {
                  setShowBusinessInfoWarning(false);
                  setBusinessInfoValidation(null);
                  setSelectedDoc(null);
                }}
                className="p-2 rounded-full hover:bg-white/20 text-white text-xl transition-colors duration-200"
                aria-label="Close"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FaInfoCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-orange-800 font-semibold mb-2">
                      {businessInfoValidation.isEmploymentNotApplicable 
                        ? 'Employment status is set to "Not Applicable"'
                        : 'Please update your Business Information in your profile before requesting a Barangay Business Permit.'}
                    </p>
                    {businessInfoValidation.isEmploymentNotApplicable ? (
                      <p className="text-orange-700 text-sm">
                        You cannot request a Barangay Business Permit when your employment status is set to "Not Applicable". 
                        Please update your employment information in your profile and provide valid business details.
                      </p>
                    ) : (
                      <>
                        <p className="text-orange-700 text-sm mb-3">
                          The following business information fields are incomplete or set to "N/A":
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-orange-700 text-sm">
                          {businessInfoValidation.missingFields.map((field, index) => (
                            <li key={index} className="font-medium">{field}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {!businessInfoValidation.isEmploymentNotApplicable && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FaInfoCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-blue-800 font-semibold mb-1">
                        📋 Required Business Information Fields:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
                        <li><strong>Business Name</strong> - The name of your business</li>
                        <li><strong>Business Type</strong> - The type of business (e.g., Retail, Freelance)</li>
                        <li><strong>Business Location</strong> - The location of your business</li>
                      </ul>
                      <p className="text-blue-700 text-sm mt-2">
                        These fields cannot be empty or set to "N/A" to request a Business Permit.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {businessInfoValidation.isEmploymentNotApplicable && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FaInfoCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-blue-800 font-semibold mb-1">
                        📋 How to Update:
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-blue-700 text-sm">
                        <li>Go to your Profile page</li>
                        <li>Uncheck the "Not Applicable" option in the Employment section</li>
                        <li>Fill in your <strong>Occupation Type</strong> and <strong>Salary/Income</strong></li>
                        <li>Complete the <strong>Business Name</strong>, <strong>Business Type</strong>, and <strong>Business Location</strong> fields</li>
                        <li>Save your profile changes</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 border-t border-gray-200 rounded-b-2xl p-6 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => {
                  setShowBusinessInfoWarning(false);
                  setBusinessInfoValidation(null);
                  setSelectedDoc(null);
                }}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowBusinessInfoWarning(false);
                  setBusinessInfoValidation(null);
                  navigate('/residents/profile');
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                <FaUser className="w-4 h-4" />
                {businessInfoValidation.isEmploymentNotApplicable 
                  ? 'Go to Profile to Update Employment & Business Info'
                  : 'Go to Profile to Update Business Info'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for document request */}
      {showModal && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col">
            {/* Modal Card */}
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col h-full overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-2xl p-6 flex items-center gap-4 flex-shrink-0">
                <div className="bg-white/20 rounded-full p-3 shadow-lg flex-shrink-0">
                  {React.cloneElement(selectedDoc.icon, {
                    className: "w-8 h-8 text-white"
                  })}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-white mb-1">
                    Request {selectedDoc.label}
                  </h2>
                  <p className="text-white/90 text-sm">
                    Fill out the form to request your document
                  </p>
                </div>
                
                <button
                  onClick={closeModal}
                  className="p-2 rounded-full hover:bg-white/20 text-white text-xl transition-colors duration-200"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              
              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <form id="document-request-form" onSubmit={handleSubmit} className="space-y-6">
                {documentForms[selectedDoc.value]?.map(field => {
                  // Skip conditional fields if they don't match the selected purpose
                  if (field.conditional && formValues.purpose !== field.conditional) {
                    return null;
                  }
                  
                  // Debug logging for delayed registration fields
                  if (field.name === 'motherName' || field.name === 'fatherName' || field.name === 'requestorName') {
                    console.log('🔍 RENDERING FIELD:', {
                      fieldName: field.name,
                      fieldLabel: field.label,
                      fieldValue: formValues[field.name],
                      purpose: formValues.purpose,
                      conditional: field.conditional,
                      shouldShow: !field.conditional || formValues.purpose === field.conditional
                    });
                  }

                  // Choose icon based on field
                  let Icon = FaUser;
                  if (field.name.toLowerCase().includes('date')) Icon = FaCalendarAlt;
                  if (field.name.toLowerCase().includes('address')) Icon = FaHome;
                  if (field.name.toLowerCase().includes('purpose')) Icon = FaIdCard;
                  if (field.name.toLowerCase().includes('business')) Icon = FaBusinessTime;
                  if (field.name.toLowerCase().includes('id')) Icon = FaIdBadge;
                  if (field.name.toLowerCase().includes('child')) Icon = FaUser;
                  if (field.name.toLowerCase().includes('registration')) Icon = FaFileAlt;

                  // Determine if field is required based on conditional logic
                  const isRequired = field.required || (field.conditional && formValues.purpose === field.conditional);

                  return (
                    <div key={field.name} className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        {field.label}
                        {field.autoFill && <span className="text-green-600 text-xs ml-1 font-normal">(Auto-filled)</span>}
                        {isRequired && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {/* Purpose dropdown logic for non-certification documents */}
                      {field.name === 'purpose' && purposeOptions[selectedDoc.value] ? (
                        <>
                          <div className="relative">
                            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 text-base z-10" />
                            <select
                              name="purpose"
                              value={formValues.purpose || ''}
                              onChange={e => {
                                const newPurpose = e.target.value;
                                console.log('🔍 PURPOSE CHANGED:', {
                                  oldPurpose: formValues.purpose,
                                  newPurpose: newPurpose,
                                  isDelayedRegistration: newPurpose === 'Delayed Registration of Birth Certificate'
                                });
                                setFormValues(v => ({ ...v, purpose: newPurpose, otherPurpose: '' }));
                              }}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                              required
                            >
                              <option value="">Select purpose</option>
                              {purposeOptions[selectedDoc.value].map(opt => (
                                <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                              ))}
                            </select>
                          </div>
                          {(formValues.purpose === 'other' || formValues.purpose === 'other specific') && (
                            <input
                              type="text"
                              name="otherPurpose"
                              value={formValues.otherPurpose || ''}
                              onChange={e => setFormValues(v => ({ ...v, otherPurpose: e.target.value }))}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                              placeholder="Please specify other purpose"
                              required
                            />
                          )}
                        </>
                      ) : field.type === 'select' ? (
                        <select
                          name={field.name}
                          value={formValues[field.name] || ''}
                          onChange={e => setFormValues(v => ({ ...v, [field.name]: e.target.value }))}
                          className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 ${field.autoFill ? 'bg-green-50' : 'bg-white'}`}
                          required={isRequired}
                          readOnly={field.autoFill}
                        >
                          <option value="">Select {field.label}</option>
                          {field.options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          name={field.name}
                          value={formValues[field.name] || ''}
                          onChange={e => setFormValues(v => ({ ...v, [field.name]: e.target.value }))}
                          className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 ${field.autoFill ? 'bg-green-50' : 'bg-white'}`}
                          required={isRequired}
                          rows={4}
                          readOnly={field.autoFill}
                          placeholder={field.autoFill ? 'Auto-filled from your profile' : `Enter ${field.label.toLowerCase()}`}
                        />
                      ) : (
                        <input
                          type={field.type}
                          name={field.name}
                          value={formValues[field.name] || ''}
                          onChange={e => {
                            const newValue = e.target.value;
                            console.log('🔍 FIELD CHANGED:', {
                              fieldName: field.name,
                              fieldLabel: field.label,
                              oldValue: formValues[field.name],
                              newValue: newValue,
                              isDelayedRegistrationField: ['motherName', 'fatherName', 'requestorName'].includes(field.name)
                            });
                            setFormValues(v => ({ ...v, [field.name]: newValue }));
                          }}
                          className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 ${field.autoFill ? 'bg-green-50' : 'bg-white'}`}
                          required={isRequired}
                          readOnly={field.autoFill}
                          placeholder={field.autoFill ? 'Auto-filled from your profile' : `Enter ${field.label.toLowerCase()}`}
                        />
                      )}
                </div>
                  );
                })}
                
                {/* Photo Upload Section - Only for Barangay Clearance */}
                {selectedDoc.value === 'Brgy Clearance' && (
                  <div className="space-y-4 border-t border-gray-200 pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FaImage className="text-emerald-500 text-lg" />
                      <h3 className="text-lg font-semibold text-gray-800">Your Photo</h3>
                      {(residentData?.current_photo || residentData?.avatar) ? (
                        <span className="text-sm text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">(Auto-filled from profile)</span>
                      ) : (
                        <span className="text-sm text-gray-500">(Upload required)</span>
                      )}
                    </div>
                    
                    {!photoPreview ? (
                      <div className="space-y-4">
                        {/* Camera Section */}
                        {showCamera && cameraStream ? (
                          <div className="bg-gray-100 rounded-xl p-4 text-center">
                            <video
                              id="camera-video"
                              autoPlay
                              playsInline
                              muted
                              className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                              ref={(video) => {
                                if (video && cameraStream) {
                                  video.srcObject = cameraStream;
                                }
                              }}
                            />
                            <div className="flex gap-3 justify-center mt-4">
                              <button
                                type="button"
                                onClick={capturePhoto}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                              >
                                <FaCamera className="w-4 h-4" />
                                Capture Photo
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (cameraStream) {
                                    cameraStream.getTracks().forEach(track => track.stop());
                                    setCameraStream(null);
                                  }
                                  setShowCamera(false);
                                }}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* File Upload */}
                            <div className="relative">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoSelect}
                                className="hidden"
                                id="photo-upload"
                              />
                              <label
                                htmlFor="photo-upload"
                                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-emerald-300 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-200"
                              >
                                <FaUpload className="w-8 h-8 text-emerald-500 mb-2" />
                                <span className="text-sm font-medium text-gray-700">Upload Photo</span>
                                <span className="text-xs text-gray-500 mt-1">JPEG, PNG (Max 5MB)</span>
                              </label>
                            </div>
                            
                            {/* Camera Capture */}
                            <button
                              type="button"
                              onClick={startCamera}
                              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                            >
                              <FaCamera className="w-8 h-8 text-blue-500 mb-2" />
                              <span className="text-sm font-medium text-gray-700">Take Photo</span>
                              <span className="text-xs text-gray-500 mt-1">Use Camera</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-start gap-4">
                          <img
                            src={photoPreview}
                            alt="Selected photo"
                            className="w-24 h-24 object-cover rounded-lg shadow-md"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800 mb-1">
                              {selectedPhoto ? 'Photo Selected' : 'Profile Photo'}
                            </h4>
                            <p className="text-sm text-gray-600 mb-3">
                              {selectedPhoto ? (
                                <>
                                  {selectedPhoto.name}
                                  {selectedPhoto.size && ` (${(selectedPhoto.size / 1024 / 1024).toFixed(2)} MB)`}
                                </>
                              ) : (
                                'Using photo from your resident profile'
                              )}
                            </p>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={removePhoto}
                                className="flex items-center gap-2 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm transition-colors"
                              >
                                <FaTrash className="w-3 h-3" />
                                {selectedPhoto ? 'Remove Photo' : 'Remove Profile Photo'}
                              </button>
                              {!selectedPhoto && (
                                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1.5 rounded-lg">
                                  ✓ Auto-filled
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <FaInfoCircle className="text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-1">Photo Information:</p>
                          <ul className="text-xs space-y-1 text-blue-700">
                            {(residentData?.current_photo || residentData?.avatar) ? (
                              <>
                                <li>• Your profile photo will be automatically used</li>
                                <li>• You can upload a different photo if needed</li>
                                <li>• Photo will be used for document verification</li>
                                <li>• Maximum file size: 5MB for new uploads</li>
                              </>
                            ) : (
                              <>
                                <li>• Use a clear, recent photo (passport-style preferred)</li>
                                <li>• Ensure good lighting and face is clearly visible</li>
                                <li>• Photo will be used for document verification</li>
                                <li>• Maximum file size: 5MB</li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {feedback && (
                  <div className={`rounded-xl p-4 border-2 transition-all duration-300 ${
                    feedback.type === 'success'
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800'
                      : feedback.type === 'loading'
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-800'
                      : feedback.type === 'validation'
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 text-yellow-800'
                      : feedback.type === 'auth'
                      ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-800'
                      : feedback.type === 'network'
                      ? 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 text-gray-800'
                      : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {feedback.type === 'success' && <FaCheckCircle className="w-5 h-5 text-green-600" />}
                        {feedback.type === 'loading' && <FaSpinner className="w-5 h-5 text-blue-600 animate-spin" />}
                        {feedback.type === 'validation' && <FaExclamationTriangle className="w-5 h-5 text-yellow-600" />}
                        {feedback.type === 'auth' && <FaInfoCircle className="w-5 h-5 text-purple-600" />}
                        {feedback.type === 'network' && <FaExclamationTriangle className="w-5 h-5 text-gray-600" />}
                        {(feedback.type === 'error' || feedback.type === 'server') && <FaTimes className="w-5 h-5 text-red-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-base mb-1">{feedback.message}</div>
                        {feedback.details && (
                          <div className="text-sm opacity-80 mb-2">{feedback.details}</div>
                        )}
                        {feedback.actions && feedback.actions.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {feedback.actions.map((action, index) => (
                              <button
                                key={index}
                                onClick={action.action}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                  feedback.type === 'success'
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : feedback.type === 'auth'
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                                }`}
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Enhanced success animation - only show for actual submission */}
                {feedback?.type === 'success' && feedback?.message?.includes('submitted successfully') && (
                  <div className="flex flex-col items-center mt-4 space-y-2">
                    <div className="relative">
                      <div className="animate-bounce">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                          <FaCheckCircle className="text-white text-2xl" />
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-ping opacity-30"></div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-700 font-semibold">Request Submitted!</div>
                      <div className="text-green-600 text-sm">Processing will begin shortly</div>
                    </div>
                  </div>
                )}
                </form>
              </div>
              
              {/* Footer */}
              <div className="bg-gray-50 border-t border-gray-200 p-6 flex-shrink-0">
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="document-request-form"
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaPaperPlane className="w-4 h-4" />
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RequestDocuments;
