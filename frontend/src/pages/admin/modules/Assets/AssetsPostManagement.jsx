import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../../utils/axiosConfig';
import Navbar from "../../../../components/Navbar";
import Sidebar from "../../../../components/Sidebar";
import ImageCarousel from '../../../../components/ImageCarousel';
import { useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  TagIcon,
  CalendarIcon,
  UserIcon,
  StarIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

const StatCard = ({ label, value, icon, iconBg, gradient }) => (
  <div className="group bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500 flex justify-between items-center transform hover:-translate-y-2 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="relative z-10">
      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-4xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300`}>{value}</p>
    </div>
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${iconBg} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
      {icon}
    </div>
  </div>
);

const badge = (text, color, icon = null) => (
  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${color}`}>
    {icon && icon}
    {text}
  </span>
);

const getStatusColor = (status) => {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800';
    case 'rented':
      return 'bg-blue-100 text-blue-800';
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-800';
    case 'unavailable':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'available':
      return <CheckCircleIcon className="w-3 h-3" />;
    case 'rented':
      return <ClockIcon className="w-3 h-3" />;
    case 'maintenance':
      return <PencilIcon className="w-3 h-3" />;
    case 'unavailable':
      return <ExclamationTriangleIcon className="w-3 h-3" />;
    default:
      return <ClockIcon className="w-3 h-3" />;
  }
};

const AssetsPostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();
  
  // Form states
  const [form, setForm] = useState({
    asset_id: '',
    name: '',
    description: '',
    category: '',
    condition: 'good',
    status: 'available',
    price: '',
    stock: '',
    notes: '',
    images: []
  });
  
  // Image upload states
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPosts();
    fetchAssets();
  }, []);

  // Debug: Monitor form state changes
  useEffect(() => {
    console.log('Form state changed:', form);
  }, [form]);

  // Debug: Monitor image preview state changes
  useEffect(() => {
    console.log('Image previews changed:', imagePreviews);
  }, [imagePreviews]);

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      imagePreviews.forEach(imageData => {
        if (imageData.type === 'new' && imageData.preview) {
          URL.revokeObjectURL(imageData.preview);
        }
      });
    };
  }, [imagePreviews]);


  useEffect(() => {
    setFilteredPosts(
      posts.filter((post) => {
        const matchesSearch = 
          (post.name || '').toLowerCase().includes(search.toLowerCase()) ||
          (post.description || '').toLowerCase().includes(search.toLowerCase()) ||
          (post.category || '').toLowerCase().includes(search.toLowerCase()) ||
          (post.notes || '').toLowerCase().includes(search.toLowerCase());
        
        const matchesStatus = selectedStatus === '' || post.status === selectedStatus;
        
        return matchesSearch && matchesStatus;
      })
    );
  }, [search, selectedStatus, posts]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      console.log('Fetching posts from API...');
      const response = await axiosInstance.get('/api/requestable-assets');
      console.log('API response:', response.data);
      
      if (response.data && response.data.success) {
        // Transform the API response to match the expected format
        const transformedPosts = response.data.data.map(asset => ({
          id: asset.id,
          asset_id: asset.asset_id || asset.id, // Use asset_id if available, otherwise use id
          name: asset.name,
          description: asset.description,
          category: asset.category,
          condition: asset.condition,
          status: asset.status,
          price: asset.price,
          stock: asset.stock,
          notes: asset.notes,
          image: asset.image ? asset.image.map(img => {
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
          }) : [],
          created_at: asset.created_at,
          updated_at: asset.updated_at,
          author: asset.created_by || 'Admin'
        }));
        
        console.log('Transformed posts:', transformedPosts);
        setPosts(transformedPosts);
        setFilteredPosts(transformedPosts);
      } else {
        console.log('No data or unsuccessful response');
        setPosts([]);
        setFilteredPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Show a message to the user
      setSuccessMessage('Please log in to view assets. Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      setPosts([]);
      setFilteredPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const response = await axiosInstance.get('/assets');
      if (response.data) {
        setAssets(response.data);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
      setAssets([]);
    }
  };

  // Function to get available assets (not already in requestable assets)
  const getAvailableAssets = () => {
    // Create a set of used asset identifiers for faster lookup
    const usedAssets = new Set();
    
    // Add all possible identifiers for used assets
    posts.forEach(post => {
      // Add by asset_id
      if (post.asset_id) {
        usedAssets.add(`id:${post.asset_id}`);
      }
      // Add by post id (in case asset_id is the same as post id)
      if (post.id) {
        usedAssets.add(`id:${post.id}`);
      }
      // Add by name (most reliable)
      if (post.name) {
        usedAssets.add(`name:${post.name.toLowerCase().trim()}`);
      }
      // Add by name + category combination (even more reliable)
      if (post.name && post.category) {
        usedAssets.add(`combo:${post.name.toLowerCase().trim()}:${post.category.toLowerCase().trim()}`);
      }
    });
    
    // Filter out assets that are already used
    const availableAssets = assets.filter(asset => {
      const assetIdKey = `id:${asset.id}`;
      const assetNameKey = `name:${asset.name.toLowerCase().trim()}`;
      const assetComboKey = `combo:${asset.name.toLowerCase().trim()}:${(asset.category || '').toLowerCase().trim()}`;
      
      const isUsed = usedAssets.has(assetIdKey) || 
                    usedAssets.has(assetNameKey) || 
                    usedAssets.has(assetComboKey);
      
      if (isUsed) {
        console.log(`Asset "${asset.name}" (ID: ${asset.id}) is already converted:`, {
          assetIdKey,
          assetNameKey,
          assetComboKey,
          usedAssets: Array.from(usedAssets)
        });
      }
      
      return !isUsed;
    });
    
    console.log('=== ASSET FILTERING DEBUG ===');
    console.log('All posts (requestable assets):', posts);
    console.log('Used assets set:', Array.from(usedAssets));
    console.log('All regular assets:', assets);
    console.log('Available assets (filtered):', availableAssets);
    console.log('================================');
    
    return availableAssets;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    console.log(`Form field changed: ${name} = ${value}`);
    setForm({ ...form, [name]: value });
    
    // Auto-populate form when asset is selected (only when creating new post, not editing)
    if (name === 'asset_id' && value && !editingId) {
      const selectedAsset = getAvailableAssets().find(asset => asset.id === parseInt(value));
      if (selectedAsset) {
        // Clear existing images and previews
        setSelectedImages([]);
        setImagePreviews([]);
        setExistingImages([]);
        
        // Map asset status to requestable asset status
        const mapAssetStatus = (assetStatus) => {
          switch (assetStatus) {
            case 'in_stock':
            case 'available':
              return 'available';
            case 'out_of_stock':
            case 'unavailable':
              return 'unavailable';
            case 'maintenance':
              return 'maintenance';
            case 'rented':
              return 'rented';
            default:
              return 'available';
          }
        };
        
        // Set form data
        setForm(prev => ({
          ...prev,
          name: selectedAsset.name,
          description: selectedAsset.description || '',
          category: selectedAsset.category || '',
          condition: selectedAsset.condition || 'good',
          status: mapAssetStatus(selectedAsset.status) || 'available',
          price: selectedAsset.current_value || '',
          stock: selectedAsset.stock || '',
          notes: selectedAsset.notes || '',
          images: selectedAsset.images || []
        }));
        
        // If asset has existing images, create previews for them
        if (selectedAsset.images && selectedAsset.images.length > 0) {
          const imagePreviews = selectedAsset.images.map(imageUrl => {
            // Process the image URL to ensure it's a full URL
            let fullUrl;
            if (typeof imageUrl === 'string') {
              // If it's already a full URL, use it as is
              if (imageUrl.startsWith('http')) {
                fullUrl = imageUrl;
              }
              // If it starts with /storage/, add the base URL
              else if (imageUrl.startsWith('/storage/')) {
                fullUrl = `http://localhost:8000${imageUrl}`;
              }
              // If it's just a filename, assume it's in the requestable-assets folder
              else {
                fullUrl = `http://localhost:8000/storage/requestable-assets/${imageUrl}`;
              }
            } else {
              fullUrl = imageUrl;
            }
            
            return {
              type: 'existing',
              url: fullUrl,
              originalPath: imageUrl,
              name: `Existing Image ${selectedAsset.images.indexOf(imageUrl) + 1}`
            };
          });
          setImagePreviews(imagePreviews);
          setExistingImages(selectedAsset.images);
        }
      }
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types and sizes
    const validFiles = [];
    const errors = [];
    
    files.forEach(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name} is not a valid image file`);
        return;
      }
      
      // Check file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        errors.push(`${file.name} is too large. Maximum size is 2MB`);
        return;
      }
      
      validFiles.push(file);
    });
    
    // Show errors if any
    if (errors.length > 0) {
      setSuccessMessage(`Error: ${errors.join(', ')}`);
      setTimeout(() => setSuccessMessage(''), 5000);
    }
    
    // Only process valid files
    if (validFiles.length > 0) {
      const newImages = [...selectedImages, ...validFiles];
      setSelectedImages(newImages);
      
      // Create previews for new files
      const newPreviews = validFiles.map(file => ({
        type: 'new',
        file: file,
        preview: URL.createObjectURL(file),
        name: file.name
      }));
      setImagePreviews(prev => [...prev, ...newPreviews]);
      
      // Update form with file names
      setForm(prev => ({
        ...prev,
        images: [...prev.images, ...validFiles.map(file => file.name)]
      }));
    }
    
    // Clear the input
    e.target.value = '';
  };

  const removeImage = (index) => {
    const imageToRemove = imagePreviews[index];
    console.log('Removing image at index:', index, 'Image data:', imageToRemove);
    
    if (imageToRemove.type === 'new') {
      // Find the correct index in selectedImages array
      const selectedImageIndex = selectedImages.findIndex(img => img.name === imageToRemove.name);
      if (selectedImageIndex !== -1) {
        const newImages = selectedImages.filter((_, i) => i !== selectedImageIndex);
        setSelectedImages(newImages);
        console.log('Removed from selectedImages, new count:', newImages.length);
      }
      
      // Clean up the object URL to prevent memory leaks
      URL.revokeObjectURL(imageToRemove.preview);
    } else {
      // Find the correct index in existingImages array
      const existingImageIndex = existingImages.findIndex(img => img === imageToRemove.originalPath);
      if (existingImageIndex !== -1) {
        const newExistingImages = existingImages.filter((_, i) => i !== existingImageIndex);
        setExistingImages(newExistingImages);
        console.log('Removed from existingImages, new count:', newExistingImages.length);
      }
    }
    
    // Remove from previews
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
    console.log('Removed from imagePreviews, new count:', newPreviews.length);
    
    // Update form images array (this might not be needed for the backend)
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted!');
    console.log('Current form state:', form);
    console.log('Editing ID:', editingId);
    console.log('Form validation passed, proceeding with submission...');
    
    // Basic validation
    if (!form.name || form.name.trim() === '') {
      console.log('Validation failed: Asset name is required');
      setSuccessMessage('Asset name is required!');
      setTimeout(() => setSuccessMessage(''), 3000);
      return;
    }
    
    if (!form.condition) {
      console.log('Validation failed: Asset condition is required');
      setSuccessMessage('Asset condition is required!');
      setTimeout(() => setSuccessMessage(''), 3000);
      return;
    }
    
    if (!form.status) {
      console.log('Validation failed: Asset status is required');
      setSuccessMessage('Asset status is required!');
      setTimeout(() => setSuccessMessage(''), 3000);
      return;
    }
    
    console.log('All validations passed, preparing form data...');
    
    try {
      // Prepare form data for API submission
      const formData = new FormData();
      
      // Debug: Log form values before appending
      console.log('Form values before appending to FormData:', {
        name: form.name,
        description: form.description,
        category: form.category,
        condition: form.condition,
        status: form.status,
        price: form.price,
        stock: form.stock,
        notes: form.notes
      });
      
      // Add all form fields
      formData.append('name', form.name || '');
      formData.append('description', form.description || '');
      formData.append('category', form.category || '');
      formData.append('condition', form.condition || '');
      formData.append('status', form.status || '');
      formData.append('price', form.price || 0);
      formData.append('stock', form.stock || 1);
      formData.append('notes', form.notes || '');
      formData.append('created_by', 'admin');
      
      // Handle new image uploads
      if (selectedImages.length > 0) {
        selectedImages.forEach((file, index) => {
          formData.append(`images[${index}]`, file);
        });
      }
      
      // Handle existing images (from asset selection or editing)
      if (existingImages.length > 0) {
        // Send the original image paths, not the processed URLs
        const originalPaths = existingImages.map(img => {
          // If it's a full URL, extract the original path
          if (typeof img === 'string' && img.startsWith('http://localhost:8000')) {
            return img.replace('http://localhost:8000', '');
          }
          // If it's already a relative path, use it as is
          return img;
        });
        formData.append('existing_images', JSON.stringify(originalPaths));
        console.log('Sending existing images:', originalPaths);
      }
      
      // Debug: Log FormData after construction
      console.log('FormData after construction:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}:`, `File(${value.name}, ${value.size} bytes)`);
        } else {
          console.log(`${key}:`, value);
        }
      }
      
      // Debug: Check if files are actually in FormData
      console.log('FormData has images:', formData.has('images[0]'), formData.has('images[1]'));
      console.log('Selected images count:', selectedImages.length);
      console.log('Existing images count:', existingImages.length);
      
      if (editingId) {
        // Update existing asset
        console.log('Updating asset with ID:', editingId);
        console.log('Form data being sent:', {
          name: form.name,
          description: form.description,
          category: form.category,
          condition: form.condition,
          status: form.status,
          price: form.price,
          stock: form.stock,
          notes: form.notes
        });
        
        // Debug FormData contents
        console.log('FormData contents:');
        for (let [key, value] of formData.entries()) {
          console.log(key, value);
        }
        
        console.log('Making POST request to:', `/api/admin/requestable-assets/${editingId}/update`);
        
        const response = await axiosInstance.post(`/api/admin/requestable-assets/${editingId}/update`, formData);
        
        console.log('Update response status:', response.status);
        console.log('Update response data:', response.data);
        
        if (response.data.success) {
          setSuccessMessage('Asset updated successfully!');
          setTimeout(() => setSuccessMessage(''), 3000);
          // Refresh the data from API
          await fetchPosts();
          // Reset form after successful update
          setForm({
            asset_id: '',
            name: '',
            description: '',
            category: '',
            condition: 'good',
            status: 'available',
            price: '',
            stock: '',
            notes: '',
            images: []
          });
          setSelectedImages([]);
          setImagePreviews([]);
          setExistingImages([]);
          setShowCreateForm(false);
          setEditingId(null);
          console.log('Form reset after successful update');
        } else {
          console.error('Update failed:', response.data);
          setSuccessMessage('Error updating asset. Please try again.');
          setTimeout(() => setSuccessMessage(''), 3000);
        }
      } else {
        // Create new asset
        const response = await axiosInstance.post('/api/admin/requestable-assets', formData);
        
        if (response.data.success) {
          setSuccessMessage('Asset created successfully!');
          setTimeout(() => setSuccessMessage(''), 3000);
          // Refresh the data from API
          await fetchPosts();
          // Reset form after successful creation
          setForm({
            asset_id: '',
            name: '',
            description: '',
            category: '',
            condition: 'good',
            status: 'available',
            price: '',
            stock: '',
            notes: '',
            images: []
          });
          setSelectedImages([]);
          setImagePreviews([]);
          setExistingImages([]);
          setShowCreateForm(false);
          setEditingId(null);
        }
      }
      
    } catch (error) {
      console.error('Error saving asset:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setSuccessMessage(`Error saving asset: ${error.response?.data?.message || error.message}. Please try again.`);
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  };

  const handleEdit = (post) => {
    console.log('Edit button clicked for post:', post);
    console.log('Post data:', {
      id: post.id,
      name: post.name,
      description: post.description,
      category: post.category,
      condition: post.condition,
      status: post.status,
      price: post.price,
      stock: post.stock,
      notes: post.notes,
      images: post.image
    });
    console.log('Post image data:', {
      image: post.image,
      imageType: typeof post.image,
      imageLength: post.image ? post.image.length : 'null',
      imageArray: Array.isArray(post.image)
    });
    
    setEditingId(post.id);
    const formData = {
      asset_id: '', // Don't set asset_id when editing - we're editing the requestable asset directly
      name: post.name || '',
      description: post.description || '',
      category: post.category || '',
      condition: post.condition || 'good',
      status: post.status || 'available',
      price: post.price || '',
      stock: post.stock || '',
      notes: post.notes || '',
      images: post.image || []
    };
    console.log('Setting form data for editing:', formData);
    setForm(formData);
    setSelectedImages([]);
    
    // Debug: Log the form state after setting
    setTimeout(() => {
      console.log('Form state after setting:', form);
    }, 100);
    
    // Set image previews for existing images
    if (post.image && post.image.length > 0) {
      console.log('Creating image previews for:', post.image);
      const imagePreviews = post.image.map((imageUrl, index) => {
        console.log(`Processing image ${index}:`, imageUrl, typeof imageUrl);
        
        // Ensure we have a valid image URL
        let processedUrl = imageUrl;
        if (typeof imageUrl === 'string') {
          // If it's already a full URL, use it as is
          if (imageUrl.startsWith('http')) {
            processedUrl = imageUrl;
          }
          // If it starts with /storage/, add the base URL
          else if (imageUrl.startsWith('/storage/')) {
            processedUrl = `http://localhost:8000${imageUrl}`;
          }
          // If it's just a filename, assume it's in the requestable-assets folder
          else {
            processedUrl = `http://localhost:8000/storage/requestable-assets/${imageUrl}`;
          }
        }
        
        console.log(`Processed URL for image ${index}:`, processedUrl);
        
        return {
          type: 'existing',
          url: processedUrl,
          originalPath: imageUrl,
          name: `Existing Image ${index + 1}`
        };
      });
      console.log('Final image previews:', imagePreviews);
      setImagePreviews(imagePreviews);
      // Store the original image paths (not processed URLs) for form submission
      setExistingImages(post.image);
    } else {
      console.log('No images to preview');
      setImagePreviews([]);
      setExistingImages([]);
    }
    
    setShowCreateForm(true);
    
    console.log('Form set with data:', {
      asset_id: post.asset_id || '',
      name: post.name || '',
      description: post.description || '',
      category: post.category || '',
      condition: post.condition || 'good',
      status: post.status || 'available',
      price: post.price || '',
      stock: post.stock || '',
      notes: post.notes || '',
      images: post.image || []
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await axiosInstance.delete(`/api/admin/requestable-assets/${id}`);
        setSuccessMessage('Asset deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        // Refresh the data from API
        await fetchPosts();
      } catch (error) {
        console.error('Error deleting asset:', error);
        setSuccessMessage('Error deleting asset. Please try again.');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    }
  };

  const handleCardClick = (post) => {
    // Open the edit form when card is clicked
    handleEdit(post);
  };

  const getStatusCount = (status) => {
    return posts.filter(post => post.status === status).length;
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedStatus('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to process images for carousel
  const processImages = (post) => {
    if (!post) return [];
    
    // Since we now process images in fetch functions, just return the image array
    if (post.image && Array.isArray(post.image)) {
      return post.image;
    }
    
    // Fallback for single image strings
    if (post.image && typeof post.image === 'string') {
      return [post.image];
    }
    
    return [];
  };

  return (
    <>
      <Navbar />
      <Sidebar />
      <main className="bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 min-h-screen ml-64 pt-36 px-6 pb-16 font-sans relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/30 to-blue-200/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-8 relative z-10">
          {/* Enhanced Header */}
          <div className="text-center space-y-6">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-500 to-blue-600 rounded-full blur-xl opacity-30 animate-pulse-slow"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-green-500 via-emerald-500 to-blue-600 rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-300">
                <DocumentTextIcon className="w-12 h-12 text-white drop-shadow-lg" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 bg-clip-text text-transparent tracking-tight leading-tight mb-4">
              Asset Posts Management
            </h1>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed font-medium">
              Create and manage posts, announcements, and updates related to barangay assets and equipment.
              <span className="text-emerald-600 font-semibold"> Keep your community informed and engaged.</span>
            </p>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Total Assets"
              value={posts.length}
              icon={<DocumentTextIcon className="w-6 h-6 text-white" />}
              iconBg="bg-gradient-to-br from-green-500 to-emerald-600"
              gradient="from-green-500 to-emerald-600"
            />
            <StatCard
              label="Available Assets"
              value={getStatusCount('available')}
              icon={<CheckCircleIcon className="w-6 h-6 text-white" />}
              iconBg="bg-gradient-to-br from-emerald-500 to-green-600"
              gradient="from-emerald-500 to-green-600"
            />
            <StatCard
              label="Maintenance"
              value={getStatusCount('maintenance')}
              icon={<PencilIcon className="w-6 h-6 text-white" />}
              iconBg="bg-gradient-to-br from-yellow-500 to-orange-500"
              gradient="from-yellow-500 to-orange-500"
            />
            <StatCard
              label="Total Stock"
              value={posts.reduce((sum, post) => sum + (post.stock || 0), 0)}
              icon={<EyeIcon className="w-6 h-6 text-white" />}
              iconBg="bg-gradient-to-br from-blue-500 to-indigo-600"
              gradient="from-blue-500 to-indigo-600"
            />
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
              {successMessage}
            </div>
          )}

          {/* Enhanced Controls Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <button 
                onClick={() => navigate('/admin/inventoryAssets')} 
                className="group flex items-center gap-3 px-8 py-4 font-bold rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 hover:from-green-700 hover:via-emerald-700 hover:to-blue-700 text-white border-2 border-green-400 hover:border-green-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <ArrowPathIcon className="w-6 h-6 relative z-10" />
                <span className="relative z-10">← Back to GMAC</span>
                <div className="absolute -right-2 -top-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
              </button>

              {/* Enhanced Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 items-center w-full max-w-3xl">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Search posts by title, content, category, or tags..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 rounded-2xl text-sm shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm"
                  />
                  <MagnifyingGlassIcon className="w-6 h-6 absolute left-4 top-4 text-gray-400" />
                </div>
                
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-6 py-4 border-2 border-gray-200 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 rounded-2xl text-sm shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm font-medium"
                >
                  <option value="">All Status</option>
                  <option value="available">Available</option>
                  <option value="rented">Rented</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="unavailable">Unavailable</option>
                </select>

                <button 
                  onClick={clearFilters}
                  className="px-6 py-4 border-2 border-gray-200 hover:border-red-300 focus:ring-4 focus:ring-red-500/20 focus:border-red-500 rounded-2xl text-sm shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm font-medium flex items-center gap-2 text-red-600 hover:bg-red-50"
                >
                  <XMarkIcon className="w-5 h-5" />
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Create Post Button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setShowCreateForm(true)}
              className="group flex items-center gap-3 px-8 py-4 font-bold rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 hover:from-green-700 hover:via-emerald-700 hover:to-blue-700 text-white border-2 border-green-400 hover:border-green-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <PlusIcon className="w-6 h-6 relative z-10" />
              <span className="relative z-10">Create New Post</span>
              <div className="absolute -right-2 -top-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
            </button>
          </div>

          {/* Create/Edit Form */}
          {showCreateForm && (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 mb-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-green-700 flex items-center justify-center gap-3 mb-2">
                  <DocumentTextIcon className="w-8 h-8" />
                  {editingId ? 'Edit Post' : 'Create New Post'}
                </h2>
                <p className="text-gray-600 font-medium">Manage your content and publications</p>
                {!editingId && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">{getAvailableAssets().length}</span> assets available to convert to requestable assets
                      {getAvailableAssets().length === 0 && (
                        <span className="block text-orange-600 mt-1">
                          All assets have already been converted. Add new assets to inventory first.
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
              
              <form onSubmit={(e) => {
                console.log('Form onSubmit triggered!');
                handleSubmit(e);
              }} className="space-y-6">
                {/* Asset Selection - Only show when creating new post */}
                {!editingId && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Select Asset to Convert to Requestable *</label>
                    {getAvailableAssets().length > 0 ? (
                      <>
                        <select
                          name="asset_id"
                          value={form.asset_id}
                          onChange={handleFormChange}
                          className="w-full px-6 py-4 border-2 border-gray-200 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 rounded-2xl text-sm shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm font-medium"
                          required
                        >
                          <option value="">Choose an asset to convert...</option>
                          {getAvailableAssets().map((asset) => (
                            <option key={asset.id} value={asset.id}>
                              {asset.name} - {asset.category}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-2">
                          Selecting an asset will auto-populate all fields. Only assets not already in requestable assets are shown.
                        </p>
                      </>
                    ) : (
                      <div className="w-full px-6 py-4 border-2 border-orange-200 bg-orange-50 rounded-2xl text-sm shadow-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">!</span>
                          </div>
                          <div>
                            <p className="font-medium text-orange-800">No Available Assets</p>
                            <p className="text-orange-600 text-xs mt-1">
                              All assets have already been converted to requestable assets. 
                              Add new assets to the inventory first.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Show editing info when editing */}
                {editingId && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-blue-800">Editing Requestable Asset</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      You are editing the requestable asset directly. Changes will be saved to the database.
                    </p>
                  </div>
                )}

                {/* Asset Details Section */}
                <div className="border-t border-gray-200 pt-8 mt-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <BuildingOfficeIcon className="w-6 h-6 text-green-600" />
                    Asset Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Asset Name *</label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleFormChange}
                        className="w-full px-6 py-4 border-2 border-gray-200 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 rounded-2xl text-sm shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm font-medium"
                        placeholder="Enter asset name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Category</label>
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleFormChange}
                        className="w-full px-6 py-4 border-2 border-gray-200 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 rounded-2xl text-sm shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm font-medium"
                      >
                        <option value="">Select Category</option>
                        {Array.from(new Set(assets.map(asset => asset.category).filter(Boolean))).map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                        <option value="Electronics">Electronics</option>
                        <option value="Furniture">Furniture</option>
                        <option value="Event Equipment">Event Equipment</option>
                        <option value="Health & Safety">Health & Safety</option>
                        <option value="Tools">Tools</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-bold text-gray-700 mb-3">Description</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleFormChange}
                      className="w-full px-6 py-4 border-2 border-gray-200 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 rounded-2xl text-sm shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm font-medium"
                      placeholder="Enter asset description"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Condition</label>
                      <select
                        name="condition"
                        value={form.condition}
                        onChange={handleFormChange}
                        className="w-full px-6 py-4 border-2 border-gray-200 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 rounded-2xl text-sm shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm font-medium"
                      >
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Status</label>
                      <select
                        name="status"
                        value={form.status}
                        onChange={handleFormChange}
                        className="w-full px-6 py-4 border-2 border-gray-200 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 rounded-2xl text-sm shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm font-medium"
                      >
                        <option value="available">Available</option>
                        <option value="rented">Rented</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="unavailable">Unavailable</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Price (₱)</label>
                      <input
                        name="price"
                        type="number"
                        value={form.price}
                        onChange={handleFormChange}
                        className="w-full px-6 py-4 border-2 border-gray-200 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 rounded-2xl text-sm shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm font-medium"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-bold text-gray-700 mb-3">Stock Quantity</label>
                    <input
                      name="stock"
                      type="number"
                      value={form.stock}
                      onChange={handleFormChange}
                      className="w-full px-6 py-4 border-2 border-gray-200 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 rounded-2xl text-sm shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm font-medium"
                      placeholder="1"
                      min="0"
                    />
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-bold text-gray-700 mb-3">Upload Images</label>
                    <div className="space-y-4">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-6 py-4 border-2 border-gray-200 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 rounded-2xl text-sm shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm font-medium"
                      />
                      <p className="text-xs text-gray-500">
                        You can select multiple images at once. Supported formats: JPG, PNG, GIF, WebP (Max 2MB each)
                        {imagePreviews.length > 0 && (
                          <span className="text-green-600 font-medium ml-2">
                            • {imagePreviews.length} image(s) selected
                          </span>
                        )}
                      </p>
                      
                      {/* Image Previews */}
                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                          {imagePreviews.map((imageData, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={imageData.type === 'new' ? imageData.preview : imageData.url}
                                alt={imageData.name}
                                className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                                onError={(e) => {
                                  console.log('Image failed to load:', {
                                    imageData: imageData,
                                    src: e.target.src,
                                    type: imageData.type,
                                    url: imageData.url
                                  });
                                  e.target.style.display = 'none';
                                }}
                                onLoad={() => {
                                  console.log('Image loaded successfully:', imageData.url);
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors duration-200"
                              >
                                ×
                              </button>
                              <p className="text-xs text-gray-500 mt-1 truncate">
                                {imageData.name}
                              </p>
                              {imageData.type === 'existing' && (
                                <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                                  Existing
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>


                  <div className="mt-6">
                    <label className="block text-sm font-bold text-gray-700 mb-3">Notes</label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleFormChange}
                      className="w-full px-6 py-4 border-2 border-gray-200 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 rounded-2xl text-sm shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm font-medium"
                      placeholder="Enter additional notes"
                      rows={3}
                    />
                  </div>
                </div>

                
                <div className="flex gap-4 justify-center">
                  <button
                    type="submit"
                    onClick={() => console.log('Submit button clicked!')}
                    disabled={!editingId && getAvailableAssets().length === 0}
                    className={`group font-bold py-4 px-8 rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center gap-3 border-2 relative overflow-hidden ${
                      !editingId && getAvailableAssets().length === 0
                        ? 'bg-gray-400 text-gray-600 border-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 hover:from-green-700 hover:via-emerald-700 hover:to-blue-700 text-white transform hover:scale-105 border-green-400 hover:border-green-300'
                    }`}
                  >
                    {!editingId && getAvailableAssets().length === 0 ? (
                      <>
                        <div className="w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">!</span>
                        </div>
                        <span>No Assets Available</span>
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <DocumentTextIcon className="w-5 h-5 relative z-10" />
                        <span className="relative z-10">{editingId ? 'Update Post' : 'Create Post'}</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingId(null);
                      setForm({
                        asset_id: '',
                        name: '',
                        description: '',
                        category: '',
                        condition: 'good',
                        status: 'available',
                        price: '',
                        stock: '',
                        notes: '',
                        images: []
                      });
                      setSelectedImages([]);
                      setImagePreviews([]);
                      setExistingImages([]);
                    }}
                    className="px-8 py-4 text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Posts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 min-h-[400px]">
            {loading ? (
              // Enhanced loading skeleton
              [...Array(8)].map((_, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl shadow-xl overflow-hidden animate-pulse">
                  <div className="h-56 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-300 rounded-xl w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded-lg w-full"></div>
                    <div className="h-4 bg-gray-300 rounded-lg w-2/3"></div>
                    <div className="flex items-center justify-between">
                      <div className="h-8 bg-gray-300 rounded-lg w-1/3"></div>
                      <div className="h-6 bg-gray-300 rounded-lg w-1/4"></div>
                    </div>
                    <div className="h-12 bg-gray-300 rounded-2xl w-full"></div>
                  </div>
                </div>
              ))
            ) : filteredPosts.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <div className="flex flex-col items-center gap-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <DocumentTextIcon className="w-12 h-12 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 font-bold text-xl mb-2">No posts found</p>
                    <p className="text-gray-400 text-sm">Try adjusting your search or filters to find what you're looking for</p>
                  </div>
                </div>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => handleCardClick(post)}
                  className="group bg-white/90 backdrop-blur-sm border border-gray-200 rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 overflow-hidden cursor-pointer"
                >
                  {/* Image/Icon Section */}
                  <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    <ImageCarousel
                      images={processImages(post)}
                      alt={post.name}
                      className="w-full h-full"
                      showDots={true}
                      showArrows={true}
                      autoPlay={true}
                      autoPlayInterval={5000}
                      onImageClick={() => handleCardClick(post)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    <div className="absolute top-4 left-4">
                      {badge(post.status.charAt(0).toUpperCase() + post.status.slice(1), getStatusColor(post.status), getStatusIcon(post.status))}
                    </div>
                    <div className="absolute top-4 right-4">
                      {badge(post.category, 'bg-blue-100 text-blue-800', <TagIcon className="w-3 h-3" />)}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3">
                        <p className="text-sm font-medium text-gray-800">Click to manage asset</p>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 space-y-5">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1 mb-2">
                        {post.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {post.description}
                      </p>
                      {post.asset_id && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Asset ID: {post.asset_id}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Stock and Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 font-medium">Stock: {post.stock}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 font-medium">₱{post.price}</span>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-500 font-medium">{formatDate(post.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <UserIcon className="w-4 h-4" />
                        <span className="font-medium">{post.author}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleEdit(post)}
                        className="flex-1 bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                        title="Edit Asset"
                      >
                        <PencilIcon className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-300" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="flex-1 bg-gradient-to-r from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 text-red-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                        title="Delete Asset"
                      >
                        <TrashIcon className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-300" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

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
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

export default AssetsPostManagement;
