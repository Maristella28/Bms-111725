import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../../utils/axiosConfig';
import Navbar from "../../../../components/Navbar";
import Sidebar from "../../../../components/Sidebar";
import { useNavigate } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ArchiveBoxIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";

const StatCard = ({ label, value, icon, iconBg }) => (
  <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-500 flex justify-between items-center group transform hover:-translate-y-2">
    <div className="space-y-2">
      <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">{label}</p>
      <p className="text-4xl font-bold text-slate-800 group-hover:text-emerald-600 transition-colors duration-300">{value}</p>
    </div>
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${iconBg} group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>
  </div>
);

const badge = (text, color, icon = null) => (
  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-sm border ${color}`}>
    {icon && <span className="w-3 h-3">{icon}</span>}
    {text}
  </span>
);

const getStatusColor = (status) => {
  switch (status) {
    case 'in_stock':
      return 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200';
    case 'limited':
      return 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200';
    case 'available':
      return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200';
    case 'out_of_stock':
      return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200';
    default:
      return 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-800 border-slate-200';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'in_stock':
      return <CheckCircleIcon className="w-3 h-3" />;
    case 'limited':
      return <ClockIcon className="w-3 h-3" />;
    case 'available':
      return <CheckCircleIcon className="w-3 h-3" />;
    case 'out_of_stock':
      return <ExclamationTriangleIcon className="w-3 h-3" />;
    default:
      return <ClockIcon className="w-3 h-3" />;
  }
};

// Asset Actions Dropdown Component
const AssetActionsDropdown = ({ asset, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-gradient-to-br from-slate-100 to-gray-200 hover:from-slate-200 hover:to-gray-300 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg"
      >
        <ChevronDownIcon className="w-5 h-5 text-slate-600" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border-2 border-slate-200 z-20 overflow-hidden">
            <button
              onClick={() => { onEdit(asset); setIsOpen(false); }}
              className="w-full px-4 py-3 text-left hover:bg-amber-50 flex items-center gap-3 transition-colors"
            >
              <PencilIcon className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium">Edit Asset</span>
            </button>
            
            <button
              onClick={() => { onDelete(asset.id); setIsOpen(false); }}
              className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center gap-3 transition-colors border-t border-slate-100"
            >
              <TrashIcon className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium">Delete Asset</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const AssetsManagement = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const navigate = useNavigate();
  
  // Record Asset states
  const [showRecordDropdown, setShowRecordDropdown] = useState(false);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [recordingAsset, setRecordingAsset] = useState(null);
  const [recordFiles, setRecordFiles] = useState([]);
  const [recordFilePreviews, setRecordFilePreviews] = useState([]);
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetDescription, setNewAssetDescription] = useState('');
  const [newAssetCategory, setNewAssetCategory] = useState('');
  const [newAssetLocation, setNewAssetLocation] = useState('');
  const [newAssetCondition, setNewAssetCondition] = useState('Good');
  const [newAssetStatus, setNewAssetStatus] = useState('Available');
  const [newAssetValue, setNewAssetValue] = useState('');
  const [newAssetNotes, setNewAssetNotes] = useState('');

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    setFilteredAssets(
      assets.filter((asset) => {
        const matchesSearch = 
        asset.name.toLowerCase().includes(search.toLowerCase()) ||
        asset.category.toLowerCase().includes(search.toLowerCase()) ||
          asset.description.toLowerCase().includes(search.toLowerCase());
        
        const matchesStatus = selectedStatus === '' || asset.status === selectedStatus;
        
        return matchesSearch && matchesStatus;
      })
    );
  }, [search, selectedStatus, assets]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showRecordDropdown && !event.target.closest('.relative')) {
        setShowRecordDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRecordDropdown]);

  const fetchAssets = () => {
    setLoading(true);
    axiosInstance.get('/assets')
      .then(res => setAssets(res.data))
      .catch(() => alert('Failed to load assets'))
      .finally(() => setLoading(false));
  };


  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    try {
  await axiosInstance.delete(`/assets/${id}`);
      setAssets(assets.filter(a => a.id !== id));
      alert('Asset deleted!');
    } catch (err) {
      alert('Failed to delete asset');
    }
  };

  const getStatusCount = (status) => {
    return assets.filter(asset => asset.status === status).length;
  };

  // Clear all filters
  const clearFilters = () => {
    setSearch('');
    setSelectedStatus('');
  };

  // Record Asset functions
  const handleRecordAsset = (asset) => {
    setRecordingAsset(asset);
    setNewAssetName(asset.name);
    setNewAssetDescription(asset.description || '');
    setNewAssetCategory(asset.category || '');
    setNewAssetLocation(asset.location || '');
    setNewAssetCondition(asset.condition || 'Good');
    setNewAssetStatus(asset.status || 'Available');
    setNewAssetValue(asset.currentValue || '');
    setNewAssetNotes(asset.notes || '');
    setRecordFiles([]);
    setRecordFilePreviews([]);
    setShowRecordForm(true);
    setShowRecordDropdown(false);
  };

  const handleRecordAssetSubmit = async () => {
    if (!newAssetName.trim()) {
      alert('Asset name is required');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newAssetName);
      formData.append('description', newAssetDescription);
      formData.append('category', newAssetCategory);
      formData.append('location', newAssetLocation);
      formData.append('condition', newAssetCondition);
      formData.append('status', newAssetStatus);
      formData.append('current_value', newAssetValue);
      formData.append('notes', newAssetNotes);
      
      // Add files
      recordFiles.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
      });

      const response = await axiosInstance.post('/assets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update the assets list
      setAssets([...assets, response.data]);
      setFilteredAssets([...filteredAssets, response.data]);

      // Reset form
      setNewAssetName('');
      setNewAssetDescription('');
      setNewAssetCategory('');
      setNewAssetLocation('');
      setNewAssetCondition('Good');
      setNewAssetStatus('Available');
      setNewAssetValue('');
      setNewAssetNotes('');
      setRecordFiles([]);
      setRecordFilePreviews([]);
      setShowRecordForm(false);
      setRecordingAsset(null);
      
      alert(`Asset recorded successfully with ${recordFiles.length} additional files!`);
    } catch (err) {
      console.error('Error recording asset:', err);
      alert('Failed to record asset');
    }
  };

  const cancelRecord = () => {
    setShowRecordForm(false);
    setRecordingAsset(null);
    setNewAssetName('');
    setNewAssetDescription('');
    setNewAssetCategory('');
    setNewAssetLocation('');
    setNewAssetCondition('Good');
    setNewAssetStatus('Available');
    setNewAssetValue('');
    setNewAssetNotes('');
    setRecordFiles([]);
    setRecordFilePreviews([]);
  };

  const handleRecordFilesChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [...recordFiles, ...files];
    setRecordFiles(newFiles);
    
    // Create previews for images
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setRecordFilePreviews(prev => [...prev, {
            name: file.name,
            url: e.target.result,
            type: file.type
          }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeRecordFile = (index) => {
    setRecordFiles(prev => prev.filter((_, i) => i !== index));
    setRecordFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <Navbar />
      <Sidebar />
      <main className="bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 min-h-screen ml-64 pt-20 px-8 pb-16 font-sans">
        <div className="w-full max-w-8xl mx-auto space-y-8">
          {/* Enhanced Header */}
          <div className="text-center space-y-6 py-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 rounded-2xl shadow-2xl mb-6 transform hover:scale-105 transition-all duration-300">
              <BuildingOfficeIcon className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-slate-800 via-emerald-800 to-green-800 bg-clip-text text-transparent tracking-tight leading-tight">
              Assets Management
            </h1>
            <p className="text-slate-600 text-xl max-w-3xl mx-auto leading-relaxed font-medium">
              Comprehensive management system for barangay assets with real-time inventory tracking and availability scheduling.
            </p>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <StatCard
              label="Total Assets"
              value={assets.length}
              icon={<BuildingOfficeIcon className="w-8 h-8 text-emerald-600" />}
              iconBg="bg-gradient-to-br from-emerald-50 to-emerald-100"
            />
            <StatCard
              label="In Stock"
              value={getStatusCount('in_stock')}
              icon={<CheckCircleIcon className="w-8 h-8 text-green-600" />}
              iconBg="bg-gradient-to-br from-green-50 to-green-100"
            />
            <StatCard
              label="Limited"
              value={getStatusCount('limited')}
              icon={<ClockIcon className="w-8 h-8 text-amber-600" />}
              iconBg="bg-gradient-to-br from-amber-50 to-amber-100"
            />
            <StatCard
              label="Out of Stock"
              value={getStatusCount('out_of_stock')}
              icon={<ExclamationTriangleIcon className="w-8 h-8 text-red-600" />}
              iconBg="bg-gradient-to-br from-red-50 to-red-100"
            />
          </div>

          {/* Enhanced Search and Add Section */}
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 mb-12">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
              {/* Navigation Button */}
              <div className="flex gap-4">
                <button 
                  onClick={() => navigate('/admin/inventoryAssets')} 
                  className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-8 py-4 rounded-2xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                >
                  <ArchiveBoxIcon className="w-5 h-5" />
                  ← Back to GMAC
                </button>
              </div>

              {/* Search and Filter Controls */}
              <div className="flex flex-col lg:flex-row gap-6 items-center w-full xl:max-w-5xl">
                {/* Search Input */}
                <div className="relative flex-grow min-w-0">
                  <input
                    type="text"
                    className="w-full pl-14 pr-6 py-4 border-2 border-slate-200 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 rounded-2xl text-base shadow-sm transition-all duration-300 bg-slate-50 focus:bg-white"
                    placeholder="Search by name, category, or description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <MagnifyingGlassIcon className="w-6 h-6 absolute left-5 top-4 text-slate-400" />
          </div>

                {/* Status Filter */}
                <div className="flex gap-4 items-center">
                  <select 
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-6 py-4 text-base border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 focus:bg-white shadow-sm transition-all duration-300 font-medium"
                  >
                    <option value="">All Status</option>
                    <option value="in_stock">In Stock</option>
                    <option value="limited">Limited</option>
                    <option value="available">Available</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button 
                    onClick={clearFilters}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-4 rounded-2xl text-sm font-semibold shadow-lg transition-all duration-300 flex items-center gap-2 transform hover:scale-105 hover:shadow-xl"
                    title="Clear all filters"
                  >
                    <XMarkIcon className="w-5 h-5" />
                    Clear
                  </button>
                  <button className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-6 py-4 rounded-2xl text-sm font-semibold shadow-lg transition-all duration-300 flex items-center gap-2 transform hover:scale-105 hover:shadow-xl">
                    <FunnelIcon className="w-5 h-5" />
                    Filter
                  </button>
                </div>
                
                {/* Record Asset Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowRecordDropdown(!showRecordDropdown)}
                    className="flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl"
                    title="Record a new asset"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Record an Asset
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Enhanced Dropdown Menu */}
                  {showRecordDropdown && (
                    <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-green-50">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                          <BuildingOfficeIcon className="w-6 h-6 text-emerald-600" />
                          Create New Asset Record
                        </h3>
                        <p className="text-slate-600 mt-2 font-medium">Add a new asset to the inventory</p>
                      </div>
                      
                      <div className="p-6">
                        <button
                          onClick={() => {
                            setShowRecordForm(true);
                            setShowRecordDropdown(false);
                            setRecordingAsset(null);
                          }}
                          className="w-full p-6 text-left hover:bg-emerald-50 border-2 border-slate-200 hover:border-emerald-300 rounded-2xl transition-all duration-300 group"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                              <BuildingOfficeIcon className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-lg">Create New Asset</h4>
                              <p className="text-slate-600 font-medium">Add a completely new asset to the inventory</p>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>


          {/* Enhanced Record Asset Form */}
          {showRecordForm && (
            <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-3xl shadow-2xl border border-purple-200 p-8 mb-8 animate-slide-down">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <BuildingOfficeIcon className="w-8 h-8 mr-3 text-purple-600" />
                  {recordingAsset ? `Record Asset: ${recordingAsset.name}` : 'Record New Asset'}
                </h2>
                <button
                  onClick={cancelRecord}
                  className="flex items-center gap-2 border-2 border-purple-600 text-purple-700 hover:bg-purple-50 font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                >
                  <XMarkIcon className="w-5 h-5" />
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Basic Information */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <BuildingOfficeIcon className="w-5 h-5 text-purple-600" />
                      Basic Information
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Asset Name *</label>
                        <input
                          type="text"
                          value={newAssetName}
                          onChange={(e) => setNewAssetName(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          placeholder="Enter asset name"
                          required
                        />
                      </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea 
                          value={newAssetDescription}
                          onChange={(e) => setNewAssetDescription(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter asset description" 
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                          <select
                            value={newAssetCategory}
                            onChange={(e) => setNewAssetCategory(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          >
                            <option value="">Select Category</option>
                            <option value="Equipment">Equipment</option>
                            <option value="Furniture">Furniture</option>
                            <option value="Vehicle">Vehicle</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Tools">Tools</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                          <input
                            type="text"
                            value={newAssetLocation}
                            onChange={(e) => setNewAssetLocation(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                            placeholder="Enter location"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Status & Value */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <CurrencyDollarIcon className="w-5 h-5 text-purple-600" />
                      Status & Value
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                          <select
                            value={newAssetStatus}
                            onChange={(e) => setNewAssetStatus(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          >
                            <option value="Available">Available</option>
                            <option value="In Use">In Use</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Out of Service">Out of Service</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Condition</label>
                          <select
                            value={newAssetCondition}
                            onChange={(e) => setNewAssetCondition(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          >
                            <option value="Excellent">Excellent</option>
                            <option value="Good">Good</option>
                            <option value="Fair">Fair</option>
                            <option value="Poor">Poor</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Current Value (₱)</label>
                        <input
                          type="number"
                          value={newAssetValue}
                          onChange={(e) => setNewAssetValue(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          placeholder="Enter current value"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                        <textarea
                          value={newAssetNotes}
                          onChange={(e) => setNewAssetNotes(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          placeholder="Enter additional notes"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <DocumentTextIcon className="w-5 h-5 text-purple-600" />
                  Attach Files (Optional)
                </h3>
                
                <div className="relative border-2 border-dashed border-purple-300 rounded-2xl p-8 hover:border-purple-500 transition-all duration-300 bg-gradient-to-br from-purple-50 to-indigo-50">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                    onChange={handleRecordFilesChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    id="record-files-upload"
                  />
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto text-purple-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-lg font-semibold text-gray-700 mb-2">Upload Asset Files</p>
                    <p className="text-sm text-gray-500 mb-4">Drag and drop files here, or click to select files</p>
                    <p className="text-xs text-gray-400">Supports: Images, PDF, DOC, XLS, TXT, ZIP, RAR</p>
                  </div>
                </div>

                {/* File Previews */}
                {recordFilePreviews.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Selected Files:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {recordFilePreviews.map((file, index) => (
                        <div key={index} className="relative bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <button
                            onClick={() => removeRecordFile(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                          {file.type.startsWith('image/') ? (
                            <img src={file.url} alt={file.name} className="w-full h-20 object-cover rounded" />
                          ) : (
                            <div className="w-full h-20 bg-gray-200 rounded flex items-center justify-center">
                              <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <p className="text-xs text-gray-600 mt-2 truncate" title={file.name}>
                            {file.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-8">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    handleRecordAssetSubmit();
                  }}
                  type="button"
                  className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 text-white font-semibold py-4 px-10 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Record Asset
                </button>
              </div>
          </div>
          )}

          {/* Enhanced Table */}
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800 via-emerald-800 to-green-800 px-8 py-6">
              <h3 className="text-white font-bold text-2xl flex items-center gap-3">
                <BuildingOfficeIcon className="w-7 h-7" />
                Assets Records
              </h3>
              <p className="text-emerald-100 mt-2 font-medium">Manage and track all your organization's assets</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-slate-50 to-emerald-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-slate-700 text-xs uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <BuildingOfficeIcon className="w-4 h-4 text-slate-500" />
                        Asset Name
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left font-bold text-slate-700 text-xs uppercase tracking-wider hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Category
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left font-bold text-slate-700 text-xs uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Stock
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left font-bold text-slate-700 text-xs uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4 text-slate-500" />
                        Status
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left font-bold text-slate-700 text-xs uppercase tracking-wider hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Image
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center font-bold text-slate-700 text-xs uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Actions
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-8 py-16 text-center">
                        <div className="flex flex-col items-center justify-center space-y-6">
                          <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center">
                            <BuildingOfficeIcon className="w-12 h-12 text-slate-400" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-slate-600">No assets found</h3>
                            <p className="text-slate-500 text-lg font-medium">Try adjusting your search criteria or add a new asset to get started.</p>
                          </div>
                          <button
                            onClick={() => setShowRecordForm(true)}
                            className="mt-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                          >
                            Add Your First Asset
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAssets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 transition-all duration-200">
                        <td className="px-4 py-4">
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">{asset.name}</div>
                            {asset.description && (
                              <div className="text-xs text-gray-500 truncate max-w-xs">{asset.description}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200">
                            {asset.category}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-semibold text-gray-900 text-sm">
                            {asset.stock}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {badge(
                            asset.status.replace('_', ' ').toUpperCase(), 
                            getStatusColor(asset.status), 
                            getStatusIcon(asset.status)
                          )}
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          {asset.image ? (
                            <img
                              src={asset.image.startsWith('/storage/') ? `http://localhost:8000${asset.image}` : asset.image}
                              alt={asset.name}
                              className="w-12 h-12 rounded-lg object-cover shadow-md border border-slate-200"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center border border-slate-200">
                              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-center">
                            <AssetActionsDropdown
                              asset={asset}
                              onEdit={handleRecordAsset}
                              onDelete={handleDelete}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default AssetsManagement; 