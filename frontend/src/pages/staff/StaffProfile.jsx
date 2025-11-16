import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../utils/axiosConfig';
import {
  User, Mail, Phone, Calendar, Home, MapPin, BadgeCheck,
  Landmark, Cake, Image as ImageIcon, Edit2, Save, X, ArrowLeft, AlertCircle, CheckCircle,
  Briefcase, GraduationCap, Users, Award, FileText
} from 'lucide-react';

const StaffProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileStatus, setProfileStatus] = useState({ profile_completed: false, has_profile: false });

  const [form, setForm] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    name_suffix: '',
    birth_date: '',
    birth_place: '',
    age: '',
    nationality: '',
    sex: '',
    civil_status: '',
    religion: '',
    email: '',
    mobile_number: '',
    landline_number: '',
    current_address: '',
    current_photo: null,
    department: '',
    position: '',
    employee_id: '',
    hire_date: '',
    employment_status: 'active',
    educational_attainment: '',
    work_experience: '',
    emergency_contact_name: '',
    emergency_contact_number: '',
    emergency_contact_relationship: '',
    skills: '',
    certifications: '',
  });

  // Fetch staff profile data
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/staff/my-profile');
      
      if (response.data.staff) {
        const staffData = response.data.staff;
        const profileData = response.data.profile;
        
        // Update form with staff data
        setForm(prev => ({
          ...prev,
          first_name: profileData?.first_name || staffData.name?.split(' ')[0] || '',
          middle_name: profileData?.middle_name || '',
          last_name: profileData?.last_name || staffData.name?.split(' ').slice(1).join(' ') || '',
          name_suffix: profileData?.name_suffix || '',
          birth_date: profileData?.birth_date || staffData.birthdate || '',
          birth_place: profileData?.birth_place || '',
          age: profileData?.age || '',
          nationality: profileData?.nationality || '',
          sex: profileData?.sex || staffData.gender || '',
          civil_status: profileData?.civil_status || staffData.civil_status || '',
          religion: profileData?.religion || '',
          email: profileData?.email || staffData.email || '',
          mobile_number: profileData?.mobile_number || staffData.contact_number || '',
          landline_number: profileData?.landline_number || '',
          current_address: profileData?.current_address || staffData.address || '',
          current_photo: profileData?.current_photo || null,
          department: profileData?.department || staffData.department || '',
          position: profileData?.position || staffData.position || '',
          employee_id: profileData?.employee_id || '',
          hire_date: profileData?.hire_date || '',
          employment_status: profileData?.employment_status || 'active',
          educational_attainment: profileData?.educational_attainment || '',
          work_experience: profileData?.work_experience || '',
          emergency_contact_name: profileData?.emergency_contact_name || '',
          emergency_contact_number: profileData?.emergency_contact_number || '',
          emergency_contact_relationship: profileData?.emergency_contact_relationship || '',
          skills: profileData?.skills || '',
          certifications: profileData?.certifications || '',
        }));
      }
    } catch (error) {
      console.error('Error fetching staff profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Check profile completion status
  const checkProfileStatus = async () => {
    try {
      const response = await axiosInstance.get('/staff/profile/status');
      setProfileStatus(response.data);
    } catch (error) {
      console.error('Error checking profile status:', error);
    }
  };

  useEffect(() => {
    fetchProfile();
    checkProfileStatus();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setForm(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      
      Object.entries(form).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value);
        }
      });

      const response = await axiosInstance.post('/staff/profile/update', formData);
      
      setSuccess(response.data.message || 'Profile updated successfully');
      setIsEditing(false);
      await fetchProfile();
      await checkProfileStatus();
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError(null);
    setSuccess(null);
    fetchProfile(); // Reset form to original data
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-4 lg:ml-64">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-center py-16">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-blue-800 mb-2">Loading profile...</h3>
                <p className="text-blue-600">Please wait while we load your profile information.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 lg:ml-64">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Staff Profile</h1>
          <p className="text-gray-600">Manage your personal and professional information</p>
        </div>

        {/* Profile Completion Status */}
        {!profileStatus.profile_completed && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-800">Profile Incomplete</h3>
                <p className="text-yellow-700 text-sm">Please complete your profile to access all features.</p>
              </div>
            </div>
          </div>
        )}

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8">
            {!isEditing ? (
              <ReadOnlyView form={form} onEditClick={handleEditProfile} />
            ) : (
              <EditableForm 
                form={form} 
                handleChange={handleChange} 
                handleSubmit={handleSubmit} 
                onCancel={handleCancelEdit}
                submitting={submitting}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Read-only view component
const ReadOnlyView = ({ form, onEditClick }) => {
  return (
    <div>
      {/* Header with Edit Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
          <p className="text-gray-600">Your personal and professional details</p>
        </div>
        <button
          onClick={onEditClick}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      {/* Profile Photo */}
      <div className="flex items-center gap-6 mb-8">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
          {form.current_photo ? (
            <img 
              src={form.current_photo} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-12 h-12 text-gray-400" />
          )}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            {form.first_name} {form.middle_name} {form.last_name} {form.name_suffix}
          </h3>
          <p className="text-gray-600">{form.position}</p>
          <p className="text-gray-500">{form.department}</p>
        </div>
      </div>

      {/* Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Personal Information</h4>
          
          <InfoCard icon={<User className="w-5 h-5" />} label="Full Name" 
            value={`${form.first_name} ${form.middle_name} ${form.last_name} ${form.name_suffix}`.trim()} />
          
          <InfoCard icon={<Calendar className="w-5 h-5" />} label="Birth Date" value={form.birth_date} />
          
          <InfoCard icon={<MapPin className="w-5 h-5" />} label="Birth Place" value={form.birth_place} />
          
          <InfoCard icon={<Cake className="w-5 h-5" />} label="Age" value={form.age} />
          
          <InfoCard icon={<User className="w-5 h-5" />} label="Sex" value={form.sex} />
          
          <InfoCard icon={<Users className="w-5 h-5" />} label="Civil Status" value={form.civil_status} />
          
          <InfoCard icon={<Landmark className="w-5 h-5" />} label="Religion" value={form.religion} />
          
          <InfoCard icon={<MapPin className="w-5 h-5" />} label="Nationality" value={form.nationality} />
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Contact Information</h4>
          
          <InfoCard icon={<Mail className="w-5 h-5" />} label="Email" value={form.email} />
          
          <InfoCard icon={<Phone className="w-5 h-5" />} label="Mobile Number" value={form.mobile_number} />
          
          <InfoCard icon={<Phone className="w-5 h-5" />} label="Landline Number" value={form.landline_number} />
          
          <InfoCard icon={<Home className="w-5 h-5" />} label="Address" value={form.current_address} fullWidth />
        </div>

        {/* Professional Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Professional Information</h4>
          
          <InfoCard icon={<Briefcase className="w-5 h-5" />} label="Department" value={form.department} />
          
          <InfoCard icon={<BadgeCheck className="w-5 h-5" />} label="Position" value={form.position} />
          
          <InfoCard icon={<FileText className="w-5 h-5" />} label="Employee ID" value={form.employee_id} />
          
          <InfoCard icon={<Calendar className="w-5 h-5" />} label="Hire Date" value={form.hire_date} />
          
          <InfoCard icon={<BadgeCheck className="w-5 h-5" />} label="Employment Status" value={form.employment_status} />
        </div>

        {/* Education & Skills */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Education & Skills</h4>
          
          <InfoCard icon={<GraduationCap className="w-5 h-5" />} label="Educational Attainment" value={form.educational_attainment} />
          
          <InfoCard icon={<Award className="w-5 h-5" />} label="Skills" value={form.skills} fullWidth />
          
          <InfoCard icon={<Award className="w-5 h-5" />} label="Certifications" value={form.certifications} fullWidth />
          
          <InfoCard icon={<FileText className="w-5 h-5" />} label="Work Experience" value={form.work_experience} fullWidth />
        </div>

        {/* Emergency Contact */}
        <div className="space-y-4 md:col-span-2">
          <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Emergency Contact</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoCard icon={<User className="w-5 h-5" />} label="Contact Name" value={form.emergency_contact_name} />
            <InfoCard icon={<Phone className="w-5 h-5" />} label="Contact Number" value={form.emergency_contact_number} />
            <InfoCard icon={<Users className="w-5 h-5" />} label="Relationship" value={form.emergency_contact_relationship} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Editable form component
const EditableForm = ({ form, handleChange, handleSubmit, onCancel, submitting }) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
          <p className="text-gray-600">Update your personal and professional information</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Personal Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Personal Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
            <input
              type="text"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Middle Name</label>
            <input
              type="text"
              name="middle_name"
              value={form.middle_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
            <input
              type="text"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name Suffix</label>
            <select
              name="name_suffix"
              value={form.name_suffix}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">None</option>
              <option value="Jr.">Jr.</option>
              <option value="Sr.">Sr.</option>
              <option value="II">II</option>
              <option value="III">III</option>
              <option value="IV">IV</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Birth Date *</label>
            <input
              type="date"
              name="birth_date"
              value={form.birth_date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Birth Place</label>
            <input
              type="text"
              name="birth_place"
              value={form.birth_place}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
            <input
              type="number"
              name="age"
              value={form.age}
              onChange={handleChange}
              required
              min="1"
              max="120"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sex *</label>
            <select
              name="sex"
              value={form.sex}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Civil Status *</label>
            <select
              name="civil_status"
              value={form.civil_status}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Civil Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widowed">Widowed</option>
              <option value="Divorced">Divorced</option>
              <option value="Separated">Separated</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Religion</label>
            <input
              type="text"
              name="religion"
              value={form.religion}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
            <input
              type="text"
              name="nationality"
              value={form.nationality}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
            <input
              type="tel"
              name="mobile_number"
              value={form.mobile_number}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Landline Number</label>
            <input
              type="tel"
              name="landline_number"
              value={form.landline_number}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Address</label>
            <textarea
              name="current_address"
              value={form.current_address}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Professional Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
            <input
              type="text"
              name="department"
              value={form.department}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
            <input
              type="text"
              name="position"
              value={form.position}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
            <input
              type="text"
              name="employee_id"
              value={form.employee_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hire Date</label>
            <input
              type="date"
              name="hire_date"
              value={form.hire_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Employment Status</label>
            <select
              name="employment_status"
              value={form.employment_status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="terminated">Terminated</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>
        </div>
      </div>

      {/* Education & Skills */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Education & Skills</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Educational Attainment</label>
            <input
              type="text"
              name="educational_attainment"
              value={form.educational_attainment}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
            <textarea
              name="skills"
              value={form.skills}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="List your skills separated by commas"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
            <textarea
              name="certifications"
              value={form.certifications}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="List your certifications"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Work Experience</label>
            <textarea
              name="work_experience"
              value={form.work_experience}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your work experience"
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Emergency Contact</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
            <input
              type="text"
              name="emergency_contact_name"
              value={form.emergency_contact_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
            <input
              type="tel"
              name="emergency_contact_number"
              value={form.emergency_contact_number}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
            <input
              type="text"
              name="emergency_contact_relationship"
              value={form.emergency_contact_relationship}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Profile Photo */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Profile Photo</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Photo</label>
          <input
            type="file"
            name="current_photo"
            onChange={handleChange}
            accept="image/*"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">Accepted formats: JPG, PNG. Max size: 2MB</p>
        </div>
      </div>
    </form>
  );
};

// Info card component
const InfoCard = ({ icon, label, value, fullWidth = false }) => (
  <div className={`${fullWidth ? 'col-span-full' : ''} bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200`}>
    <div className="flex items-start gap-3">
      <div className="text-blue-600 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-sm font-medium text-gray-900 break-words">{value || 'Not provided'}</p>
      </div>
    </div>
  </div>
);

export default StaffProfile;
