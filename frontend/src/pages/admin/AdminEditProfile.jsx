import React, { useState, useEffect, useRef } from 'react';
import axios from '../../utils/axiosConfig';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCamera, FaSave, 
  FaSpinner, FaCheckCircle, FaExclamationTriangle, FaShieldAlt,
  FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

const AdminEditProfile = () => {
  const { user, fetchUser } = useAuth();
  const [form, setForm] = useState({ 
    name: '', email: '', avatar: '', phone: '', address: '',
    emergencyContact: '', emergencyPhone: '', emergencyRelationship: '',
    birthDate: '', birthPlace: '', age: '', nationality: '', sex: '', civilStatus: '',
    religion: '', department: '', position: '', employeeId: '', hireDate: '',
    educationalAttainment: '', workExperience: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [activeTab, setActiveTab] = useState('personal');
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const fileInputRef = useRef();

  useEffect(() => {
    if (user) {
      console.log('AdminEditProfile user data:', user);
      const initialForm = {
        name: user.name || user.staff?.name || user.profile?.first_name + ' ' + user.profile?.last_name || '',
        email: user.email || user.staff?.email || user.profile?.email || '',
        avatar: user.avatar || user.staff?.current_photo || user.profile?.current_photo || '',
        phone: user.phone || user.staff?.contact_number || user.profile?.mobile_number || '',
        address: user.address || user.staff?.address || user.profile?.current_address || '',
        emergencyContact: user.emergencyContact || user.profile?.emergency_contact_name || '',
        emergencyPhone: user.emergencyPhone || user.profile?.emergency_contact_number || '',
        emergencyRelationship: user.profile?.emergency_contact_relationship || '',
        birthDate: user.profile?.birth_date || '',
        birthPlace: user.profile?.birth_place || '',
        age: user.profile?.age || '',
        nationality: user.profile?.nationality || '',
        sex: user.profile?.sex || '',
        civilStatus: user.profile?.civil_status || '',
        religion: user.profile?.religion || '',
        department: user.staff?.department || user.profile?.department || '',
        position: user.staff?.position || user.profile?.position || '',
        employeeId: user.profile?.employee_id || '',
        hireDate: user.profile?.hire_date || '',
        educationalAttainment: user.profile?.educational_attainment || '',
        workExperience: user.profile?.work_experience || ''
      };
      setForm(initialForm);
      setAvatarPreview(user.avatar || user.staff?.current_photo || user.profile?.current_photo || 'https://flowbite.com/docs/images/people/profile-picture-5.jpg');
      setHasChanges(false);
      calculateProfileCompletion(initialForm);
    }
  }, [user]);

  const calculateProfileCompletion = (formData) => {
    // Define all fields that contribute to profile completion
    // Core required fields (weighted higher)
    const coreFields = ['name', 'email', 'phone'];
    
    // Important optional fields (medium weight)
    const importantFields = ['address', 'emergencyContact', 'emergencyPhone', 'birthDate', 'age', 'sex', 'civilStatus', 'department', 'position'];
    
    // Additional fields (lower weight)
    const additionalFields = ['emergencyRelationship', 'birthPlace', 'nationality', 'religion', 'employeeId', 'hireDate', 'educationalAttainment', 'workExperience'];
    
    // Count completed fields
    const coreCompleted = coreFields.filter(field => {
      const value = formData[field];
      return value && value.toString().trim() !== '';
    }).length;
    
    const importantCompleted = importantFields.filter(field => {
      const value = formData[field];
      return value && value.toString().trim() !== '';
    }).length;
    
    const additionalCompleted = additionalFields.filter(field => {
      const value = formData[field];
      return value && value.toString().trim() !== '';
    }).length;
    
    // Calculate weighted completion (core: 50%, important: 35%, additional: 15%)
    const coreScore = (coreCompleted / coreFields.length) * 50;
    const importantScore = (importantCompleted / importantFields.length) * 35;
    const additionalScore = (additionalCompleted / additionalFields.length) * 15;
    
    const completion = Math.round(coreScore + importantScore + additionalScore);
    setProfileCompletion(completion);
  };

  const validatePhoneNumber = (phone) => {
    // Philippine phone number validation
    const phoneRegex = /^(09|\+639)[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters except +
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // If it starts with 639, add + prefix
    if (cleaned.startsWith('639') && !cleaned.startsWith('+639')) {
      cleaned = '+' + cleaned;
    }
    
    // Limit to 13 characters (+639XXXXXXXXX)
    if (cleaned.length > 13) {
      cleaned = cleaned.substring(0, 13);
    }
    
    return cleaned;
  };

  const validateField = (name, value) => {
    const errors = { ...fieldErrors };
    
    switch (name) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;
      case 'phone':
        if (value && !validatePhoneNumber(value)) {
          errors.phone = 'Please enter a valid Philippine phone number';
        } else {
          delete errors.phone;
        }
        break;
      default:
        break;
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Format phone number if it's the phone field
    if (name === 'phone') {
      const formattedValue = formatPhoneNumber(value);
      setForm((prev) => ({ ...prev, [name]: formattedValue }));
      setHasChanges(true);
      validateField(name, formattedValue);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
      setHasChanges(true);
      validateField(name, value);
    }
    
    // Recalculate profile completion
    const updatedForm = { ...form, [name]: value };
    calculateProfileCompletion(updatedForm);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setHasChanges(true);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsUpdating(true);
    setError('');
    setSuccess('');
    
    // Validate all fields before submission
    const hasErrors = Object.keys(fieldErrors).length > 0;
    if (hasErrors) {
      setError('Please fix all validation errors before submitting');
      setLoading(false);
      setIsUpdating(false);
      return;
    }
    
    // Validate phone number before submission
    if (form.phone && !validatePhoneNumber(form.phone)) {
      setPhoneError('Please enter a valid Philippine phone number (09XXXXXXXXX or +639XXXXXXXXX)');
      setLoading(false);
      setIsUpdating(false);
      return;
    }
    
    try {
      // Use different endpoints and data formats based on user role
      const profileEndpoint = user?.role === 'staff' ? '/staff/profile/update' : '/admin/profile';
      const sessionStorageKey = user?.role === 'staff' ? 'staffProfileSuccess' : 'adminProfileSuccess';
      
      let dataToSend;
      
      if (user?.role === 'staff') {
        // Staff endpoint expects detailed fields
        const nameParts = form.name.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Only send fields that have values to avoid validation errors
        dataToSend = {
          email: form.email, // Always required
        };
        
        // Add optional fields only if they have values
        if (firstName) dataToSend.first_name = firstName;
        if (lastName) dataToSend.last_name = lastName;
        if (form.phone) dataToSend.mobile_number = form.phone;
        if (form.address) dataToSend.current_address = form.address;
        if (form.emergencyContact) dataToSend.emergency_contact_name = form.emergencyContact;
        if (form.emergencyPhone) dataToSend.emergency_contact_number = form.emergencyPhone;
        if (form.emergencyRelationship) dataToSend.emergency_contact_relationship = form.emergencyRelationship;
        if (form.birthDate) dataToSend.birth_date = form.birthDate;
        if (form.birthPlace) dataToSend.birth_place = form.birthPlace;
        if (form.age) dataToSend.age = parseInt(form.age);
        if (form.nationality) dataToSend.nationality = form.nationality;
        if (form.sex) dataToSend.sex = form.sex;
        if (form.civilStatus) dataToSend.civil_status = form.civilStatus;
        if (form.religion) dataToSend.religion = form.religion;
        if (form.department) dataToSend.department = form.department;
        if (form.position) dataToSend.position = form.position;
        if (form.employeeId) dataToSend.employee_id = form.employeeId;
        if (form.hireDate) dataToSend.hire_date = form.hireDate;
        if (form.educationalAttainment) dataToSend.educational_attainment = form.educationalAttainment;
        if (form.workExperience) dataToSend.work_experience = form.workExperience;
      } else {
        // Admin endpoint expects simpler fields
        dataToSend = { ...form };
      }
      
      // Debug: Log what's being sent
      console.log('AdminEditProfile data being sent:', dataToSend);
      
      await axios.put(profileEndpoint, dataToSend, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      // Refresh user data to show updated information
      await fetchUser();
      setSuccess('Profile successfully updated!');
      setHasChanges(false);
      
      // Store success message in sessionStorage to show on dashboard
      sessionStorage.setItem(sessionStorageKey, 'Profile successfully updated!');
      
      // Show success state for 2 seconds before navigating
      setTimeout(() => {
        const dashboardPath = user?.role === 'staff' ? '/staff/dashboard' : '/admin/dashboard';
        navigate(dashboardPath);
      }, 2000);
    } catch (err) {
      console.error('AdminEditProfile error:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
      setIsUpdating(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(-180deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-4 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/30 to-blue-200/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-float-delayed"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <button onClick={() => navigate(user?.role === 'staff' ? '/staff/dashboard' : '/admin/dashboard')} className="hover:text-emerald-600 transition-colors">
            Dashboard
          </button>
          <FaChevronRight className="w-3 h-3" />
          <span className="text-gray-700 font-medium">Edit Profile</span>
        </nav>

        {/* Enhanced Header */}
        <div className="text-center mb-4">
          <div className="relative inline-flex items-center justify-center mb-3">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse-slow"></div>
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-300">
              <FaUser className="w-4 h-4 sm:w-6 sm:h-6 text-white drop-shadow-lg" />
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight leading-tight mb-2">
            Edit Profile
          </h1>
          <p className="text-gray-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-medium mb-3">
            Update your account information and professional details.
            <span className="text-emerald-600 font-semibold"> Keep your profile current and accurate.</span>
          </p>

          {/* Profile Completion Progress */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-lg border border-white/50 max-w-sm mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-semibold text-gray-700">Profile Completion</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-600">{profileCompletion}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${profileCompletion}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {profileCompletion < 50 ? 'Complete more fields to improve your profile' : 
               profileCompletion < 80 ? 'Good progress! Add a few more details' : 
               profileCompletion < 100 ? 'Almost complete! Just a few more fields' :
               'Profile is complete!'}
            </p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <FaUser className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-base sm:text-lg">Profile Information</h2>
                <p className="text-white/80 text-xs">Manage your personal and professional details</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex space-x-2 sm:space-x-6 px-3 sm:px-6 overflow-x-auto">
              {[
                { id: 'personal', label: 'Personal', icon: FaUser },
                { id: 'contact', label: 'Contact', icon: FaPhone },
                { id: 'emergency', label: 'Emergency', icon: FaShieldAlt },
                { id: 'professional', label: 'Professional', icon: FaShieldAlt }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 sm:py-3 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-emerald-500 text-emerald-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.charAt(0)}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-4 sm:p-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-4 sm:mb-6">
              <div className="relative group">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-3 border-white shadow-xl overflow-hidden bg-gradient-to-br from-emerald-100 to-blue-100">
                  <img
                    className="w-full h-full object-cover"
                    src={avatarPreview || 'https://flowbite.com/docs/images/people/profile-picture-5.jpg'}
                    alt="Profile avatar"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-1 right-1 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-full p-1.5 sm:p-2 shadow-lg opacity-90 hover:opacity-100 transition-all duration-200 group-hover:scale-110 hover:shadow-xl"
                  title="Change avatar"
                >
                  <FaCamera className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <p className="text-gray-600 text-xs mt-2 font-medium text-center">Click the camera icon to change your profile picture</p>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 sm:gap-3">
                <FaExclamationTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 font-medium text-sm sm:text-base">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 sm:gap-3">
                <FaCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                <p className="text-green-700 font-medium text-sm sm:text-base">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Tab Content */}
              {activeTab === 'personal' && (
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-4 sm:p-5 border border-emerald-100">
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <FaUser className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                    Personal Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaUser className="w-3 h-3 text-emerald-600" />
                        Full Name
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md ${
                          fieldErrors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your full name"
                        required
                      />
                      {fieldErrors.name && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                          <FaExclamationTriangle className="w-3 h-3" />
                          {fieldErrors.name}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaEnvelope className="w-4 h-4 text-emerald-600" />
                        Email Address
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md ${
                          fieldErrors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your email address"
                        required
                      />
                      {fieldErrors.email && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <FaExclamationTriangle className="w-3 h-3" />
                          {fieldErrors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaMapMarkerAlt className="w-4 h-4 text-emerald-600" />
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md"
                        placeholder="e.g. 123 Main St, City"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaUser className="w-4 h-4 text-emerald-600" />
                        Birth Date
                      </label>
                      <input
                        type="date"
                        name="birthDate"
                        value={form.birthDate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaUser className="w-4 h-4 text-emerald-600" />
                        Age
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={form.age}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md"
                        placeholder="e.g. 25"
                        min="1"
                        max="120"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaUser className="w-4 h-4 text-emerald-600" />
                        Sex
                      </label>
                      <select
                        name="sex"
                        value={form.sex}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <option value="">Select Sex</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaUser className="w-4 h-4 text-emerald-600" />
                        Civil Status
                      </label>
                      <select
                        name="civilStatus"
                        value={form.civilStatus}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <option value="">Select Civil Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Separated">Separated</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaUser className="w-4 h-4 text-emerald-600" />
                        Birth Place
                      </label>
                      <input
                        type="text"
                        name="birthPlace"
                        value={form.birthPlace}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md"
                        placeholder="e.g. Manila, Philippines"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaUser className="w-4 h-4 text-emerald-600" />
                        Nationality
                      </label>
                      <input
                        type="text"
                        name="nationality"
                        value={form.nationality}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md"
                        placeholder="e.g. Filipino"
                      />
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <FaUser className="w-4 h-4 text-emerald-600" />
                      Religion
                    </label>
                    <input
                      type="text"
                      name="religion"
                      value={form.religion}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md"
                      placeholder="e.g. Catholic, Protestant, Muslim, etc."
                    />
                  </div>
                </div>
              )}


              {activeTab === 'contact' && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FaPhone className="w-5 h-5 text-purple-600" />
                    Contact Information
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaPhone className="w-4 h-4 text-purple-600" />
                        Phone Number
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm hover:shadow-md ${
                          fieldErrors.phone ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="e.g. 09171234567 or +639171234567"
                        maxLength={13}
                        pattern="^(09|\+639)[0-9]{9}$"
                        required
                      />
                      {fieldErrors.phone && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <FaExclamationTriangle className="w-3 h-3" />
                          {fieldErrors.phone}
                        </p>
                      )}
                      <p className="text-gray-500 text-xs">
                        Enter a valid Philippine phone number (09XXXXXXXXX or +639XXXXXXXXX)
                      </p>
                    </div>
                  </div>
                </div>
              )}


              {activeTab === 'emergency' && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FaShieldAlt className="w-5 h-5 text-red-600" />
                    Emergency Contact Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaUser className="w-4 h-4 text-red-600" />
                        Emergency Contact Name
                      </label>
                      <input
                        type="text"
                        name="emergencyContact"
                        value={form.emergencyContact}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 shadow-sm hover:shadow-md"
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaPhone className="w-4 h-4 text-red-600" />
                        Emergency Contact Phone
                      </label>
                      <input
                        type="tel"
                        name="emergencyPhone"
                        value={form.emergencyPhone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 shadow-sm hover:shadow-md"
                        placeholder="e.g. 09171234567 or +639171234567"
                        maxLength={13}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaUser className="w-4 h-4 text-red-600" />
                        Relationship
                      </label>
                      <input
                        type="text"
                        name="emergencyRelationship"
                        value={form.emergencyRelationship}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 shadow-sm hover:shadow-md"
                        placeholder="e.g. Spouse, Parent, Sibling"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'professional' && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FaShieldAlt className="w-5 h-5 text-blue-600" />
                    Professional Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaUser className="w-4 h-4 text-blue-600" />
                        Department
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={form.department}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                        placeholder="e.g. Treasury, Administration"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaUser className="w-4 h-4 text-blue-600" />
                        Position
                      </label>
                      <input
                        type="text"
                        name="position"
                        value={form.position}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                        placeholder="e.g. Treasurer, Secretary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaUser className="w-4 h-4 text-blue-600" />
                        Employee ID
                      </label>
                      <input
                        type="text"
                        name="employeeId"
                        value={form.employeeId}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                        placeholder="e.g. EMP001"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaUser className="w-4 h-4 text-blue-600" />
                        Hire Date
                      </label>
                      <input
                        type="date"
                        name="hireDate"
                        value={form.hireDate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                      />
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <FaUser className="w-4 h-4 text-blue-600" />
                      Educational Attainment
                    </label>
                    <input
                      type="text"
                      name="educationalAttainment"
                      value={form.educationalAttainment}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                      placeholder="e.g. Bachelor's Degree, Master's Degree"
                    />
                  </div>

                  <div className="mt-6 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <FaUser className="w-4 h-4 text-blue-600" />
                      Work Experience
                    </label>
                    <textarea
                      name="workExperience"
                      value={form.workExperience}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                      placeholder="Describe your work experience..."
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between pt-4 sm:pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => navigate(user?.role === 'staff' ? '/staff/dashboard' : '/admin/dashboard')}
                    className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 text-sm sm:text-base"
                  >
                    <FaChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Back to Dashboard</span>
                    <span className="sm:hidden">Back</span>
                  </button>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      const tabs = ['personal', 'contact', 'emergency', 'professional'];
                      const currentIndex = tabs.indexOf(activeTab);
                      const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
                      setActiveTab(tabs[prevIndex]);
                    }}
                    className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
                  >
                    <span className="hidden sm:inline">Previous Tab</span>
                    <span className="sm:hidden">Previous</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const tabs = ['personal', 'contact', 'emergency', 'professional'];
                      const currentIndex = tabs.indexOf(activeTab);
                      const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
                      setActiveTab(tabs[nextIndex]);
                    }}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
                  >
                    <span className="hidden sm:inline">Next Tab</span>
                    <span className="sm:hidden">Next</span>
                  </button>
                  
                  <button
                    type="submit"
                    className={`px-6 sm:px-8 py-2 sm:py-3 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base ${
                      hasChanges && Object.keys(fieldErrors).length === 0
                        ? 'bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600' 
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                    disabled={loading || !hasChanges || Object.keys(fieldErrors).length > 0}
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                        <span className="hidden sm:inline">{isUpdating ? 'Updating...' : 'Saving...'}</span>
                        <span className="sm:hidden">{isUpdating ? 'Updating...' : 'Saving...'}</span>
                      </>
                    ) : (
                      <>
                        <FaSave className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Save Changes</span>
                        <span className="sm:hidden">Save</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default AdminEditProfile;
