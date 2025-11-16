import React, { useState } from 'react';
import {
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

const FAQ = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Questions', icon: QuestionMarkCircleIcon },
    { id: 'general', name: 'General', icon: InformationCircleIcon },
    { id: 'residents', name: 'Residents', icon: UserGroupIcon },
    { id: 'verification', name: 'Verification', icon: ShieldCheckIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'export', name: 'Export', icon: DocumentArrowDownIcon },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: ExclamationTriangleIcon }
  ];

  const faqData = [
    {
      id: 1,
      category: 'general',
      question: 'What is the Residents Records module?',
      answer: 'The Residents Records module is a comprehensive system for managing all resident information, including personal details, verification status, analytics, and administrative functions. It allows you to add, edit, view, and manage resident profiles with complete personal information.',
      tags: ['overview', 'introduction', 'system']
    },
    {
      id: 2,
      category: 'residents',
      question: 'How do I add a new resident?',
      answer: 'To add a new resident: 1) Click the "Add Resident" button in the header, 2) Fill out the resident form with all required information (first name, last name, email, phone, birth date, address, civil status), 3) Upload a profile photo (optional), 4) Click "Save" to add the resident to the system.',
      tags: ['add', 'create', 'new resident', 'form']
    },
    {
      id: 3,
      category: 'residents',
      question: 'What information is required when adding a resident?',
      answer: 'Required fields include: First name, last name, email address, phone number, birth date, complete address, and civil status. Optional fields include profile photo, occupation, educational background, and additional notes.',
      tags: ['required fields', 'form', 'validation']
    },
    {
      id: 4,
      category: 'residents',
      question: 'Can I edit resident information after adding them?',
      answer: 'Yes! Click the edit button (pencil icon) next to any resident in the table to modify their information. You can update any field including personal details, contact information, and profile photo. Changes are saved immediately to the database.',
      tags: ['edit', 'update', 'modify', 'change']
    },
    {
      id: 5,
      category: 'residents',
      question: 'How do I view detailed resident information?',
      answer: 'Click the view button (eye icon) next to any resident in the table to see their complete profile. This opens a detailed view showing all personal information, contact details, verification status, and any uploaded documents.',
      tags: ['view', 'details', 'profile', 'information']
    },
    {
      id: 6,
      category: 'verification',
      question: 'What is the verification process?',
      answer: 'When residents register for accounts, their information needs to be verified before they can access the system. You can review their submitted information in the verification section and approve or deny their accounts based on the provided documentation and accuracy of information.',
      tags: ['verification', 'approve', 'review', 'process']
    },
    {
      id: 7,
      category: 'verification',
      question: 'How do I approve or deny a verification request?',
      answer: 'In the verification section, you\'ll see pending requests. Click on a resident to review their information, then use the "Approve" button to activate their account or "Deny" to reject their request. You can also add notes explaining your decision.',
      tags: ['approve', 'deny', 'verification', 'request']
    },
    {
      id: 8,
      category: 'verification',
      question: 'What happens when I disable a resident?',
      answer: 'Disabled residents are moved to the disabled residents section where you can review them and restore their accounts if needed. They cannot log into the system while disabled, but their data is preserved and can be restored.',
      tags: ['disable', 'disabled', 'restore', 'account']
    },
    {
      id: 9,
      category: 'analytics',
      question: 'How do I view resident analytics?',
      answer: 'Scroll down to the analytics section below the residents table. You\'ll see demographic charts, registration trends, age distribution, civil status breakdown, gender statistics, and voter status summaries. These charts update automatically as you add or modify residents.',
      tags: ['analytics', 'charts', 'statistics', 'demographics']
    },
    {
      id: 10,
      category: 'analytics',
      question: 'What analytics are available?',
      answer: 'Available analytics include: demographic statistics, registration trends over time, age distribution charts, civil status breakdown, gender statistics, voter status summaries, and most common demographic patterns. All charts are interactive and can be filtered by date ranges.',
      tags: ['analytics', 'charts', 'statistics', 'demographics', 'trends']
    },
    {
      id: 11,
      category: 'export',
      question: 'How do I export resident data?',
      answer: 'Use the export buttons in the header controls. You can export to CSV format for spreadsheet analysis or PDF format for official reports. Select the data range and apply any filters before exporting to get specific subsets of data.',
      tags: ['export', 'csv', 'pdf', 'download', 'data']
    },
    {
      id: 12,
      category: 'export',
      question: 'What file formats are supported for export?',
      answer: 'The system supports CSV export for spreadsheet analysis and PDF export for official reports. CSV files can be opened in Excel, Google Sheets, or any spreadsheet application. PDF reports are formatted for printing and official documentation.',
      tags: ['export', 'formats', 'csv', 'pdf', 'files']
    },
    {
      id: 13,
      category: 'general',
      question: 'Can I filter residents by specific criteria?',
      answer: 'Yes! Use the filter controls to search by name, email, phone number, verification status, age range, civil status, gender, voter status, or other criteria. Multiple filters can be combined to narrow down results. Clear all filters to see all residents again.',
      tags: ['filter', 'search', 'criteria', 'find']
    },
    {
      id: 14,
      category: 'general',
      question: 'How do I search for specific residents?',
      answer: 'Use the search bar to find residents by typing their name, email, or phone number. The search is case-insensitive and will show results as you type. You can also use the advanced filters to search by specific criteria like status or demographics.',
      tags: ['search', 'find', 'lookup', 'resident']
    },
    {
      id: 15,
      category: 'troubleshooting',
      question: 'Resident photo not displaying - what should I do?',
      answer: 'Check if the image file is in a supported format (JPG, PNG, GIF) and under 5MB in size. Try uploading a different image or check if the file path is correct. If the issue persists, try refreshing the page or clearing your browser cache.',
      tags: ['photo', 'image', 'display', 'upload', 'troubleshoot']
    },
    {
      id: 16,
      category: 'troubleshooting',
      question: 'Cannot save resident information - what\'s wrong?',
      answer: 'Ensure all required fields are filled out correctly. Check for special characters in names, verify date formats are correct (MM/DD/YYYY), and make sure email addresses are valid. Also check your internet connection and try refreshing the page.',
      tags: ['save', 'error', 'validation', 'required fields', 'troubleshoot']
    },
    {
      id: 17,
      category: 'troubleshooting',
      question: 'Export function not working - how to fix?',
      answer: 'Make sure you have residents selected or data to export. Try refreshing the page and ensure your browser allows downloads. Check if you have sufficient disk space and that no pop-up blockers are preventing the download.',
      tags: ['export', 'download', 'error', 'troubleshoot', 'fix']
    },
    {
      id: 18,
      category: 'troubleshooting',
      question: 'Verification requests not showing - why?',
      answer: 'Check if there are actually pending verification requests. The system only shows residents who have registered but not been verified yet. If you recently verified someone, they won\'t appear in pending requests anymore.',
      tags: ['verification', 'requests', 'pending', 'not showing', 'troubleshoot']
    },
    {
      id: 19,
      category: 'troubleshooting',
      question: 'Analytics charts not loading - what to do?',
      answer: 'Ensure you have resident data in the system. Charts require at least some resident records to display properly. If you have data but charts aren\'t loading, try refreshing the page or clearing your browser cache.',
      tags: ['analytics', 'charts', 'loading', 'data', 'troubleshoot']
    },
    {
      id: 20,
      category: 'troubleshooting',
      question: 'Search/filter not working - how to fix?',
      answer: 'Clear all filters and try again. Make sure you\'re using the correct search terms and that the data exists in the system. Check for typos in your search terms and ensure the filters are set to the correct values.',
      tags: ['search', 'filter', 'not working', 'troubleshoot', 'fix']
    },
    {
      id: 21,
      category: 'general',
      question: 'What file formats are supported for profile photos?',
      answer: 'The system supports common image formats including JPG, JPEG, PNG, and GIF. Photos are automatically resized and optimized for web display. Maximum file size is 5MB per image.',
      tags: ['photos', 'images', 'upload', 'formats', 'files']
    },
    {
      id: 22,
      category: 'general',
      question: 'How do I navigate between different sections?',
      answer: 'Use the sidebar navigation to access different modules. The Residents Records module includes the main table, analytics section, verification management, and disabled residents. You can also use the breadcrumb navigation at the top of each page.',
      tags: ['navigation', 'sidebar', 'sections', 'menu']
    },
    {
      id: 23,
      category: 'general',
      question: 'Is there a limit to how many residents I can add?',
      answer: 'There is no hard limit on the number of residents you can add. The system is designed to handle large datasets efficiently. However, for optimal performance with very large datasets (10,000+ residents), consider using the filtering and pagination features.',
      tags: ['limit', 'residents', 'capacity', 'performance', 'large datasets']
    },
    {
      id: 24,
      category: 'general',
      question: 'How do I get help if I\'m stuck?',
      answer: 'Use the Help Guide button in the header to access comprehensive documentation, tutorials, and troubleshooting guides. You can also use the Quick Start Guide for a step-by-step tour of the system features.',
      tags: ['help', 'support', 'guide', 'documentation', 'tutorial']
    }
  ];

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.icon : QuestionMarkCircleIcon;
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'General';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <QuestionMarkCircleIcon className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
              <p className="text-blue-100 text-sm">Find answers to common questions about the Residents Records system</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-200 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
              <nav className="space-y-1">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-100 text-blue-900 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium text-sm">{category.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search FAQs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Results Count */}
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Showing {filteredFAQs.length} of {faqData.length} questions
                  {searchTerm && ` for "${searchTerm}"`}
                  {selectedCategory !== 'all' && ` in ${getCategoryName(selectedCategory)}`}
                </p>
              </div>

              {/* FAQ Items */}
              <div className="space-y-4">
                {filteredFAQs.length === 0 ? (
                  <div className="text-center py-8">
                    <QuestionMarkCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
                    <p className="text-gray-600">
                      Try adjusting your search terms or selecting a different category.
                    </p>
                  </div>
                ) : (
                  filteredFAQs.map((faq) => {
                    const CategoryIcon = getCategoryIcon(faq.category);
                    const isExpanded = expandedItems.has(faq.id);
                    
                    return (
                      <div key={faq.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleExpanded(faq.id)}
                          className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <CategoryIcon className="w-5 h-5 text-blue-600" />
                              <h3 className="font-medium text-gray-900">{faq.question}</h3>
                            </div>
                            {isExpanded ? (
                              <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </button>
                        
                        {isExpanded && (
                          <div className="px-6 pb-4 border-t border-gray-100">
                            <div className="pt-4">
                              <p className="text-gray-700 mb-3">{faq.answer}</p>
                              <div className="flex flex-wrap gap-2">
                                {faq.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
