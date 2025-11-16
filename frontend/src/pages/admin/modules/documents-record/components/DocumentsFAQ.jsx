import React, { useState } from 'react';
import {
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  LightBulbIcon,
  PencilIcon,
  ClockIcon,
  UserGroupIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const DocumentsFAQ = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Questions', icon: QuestionMarkCircleIcon },
    { id: 'general', name: 'General', icon: InformationCircleIcon },
    { id: 'processing', name: 'Processing', icon: PencilIcon },
    { id: 'payments', name: 'Payments', icon: CurrencyDollarIcon },
    { id: 'pdfs', name: 'PDF Generation', icon: DocumentTextIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: ExclamationTriangleIcon }
  ];

  const faqData = [
    {
      id: 1,
      category: 'general',
      question: 'What is the Documents Records module?',
      answer: 'The Documents Records module manages barangay document requests, certificate issuance, payment processing, and record keeping. It handles the complete lifecycle from request submission to final document delivery.',
      tags: ['overview', 'introduction', 'system']
    },
    {
      id: 2,
      category: 'processing',
      question: 'How do I process a document request?',
      answer: 'Click the pencil icon next to any request to edit it. You can change the status to "Approved", "Rejected", or "Processing", set payment amounts, add notes, and specify completion dates. Remember to set a payment amount when approving requests.',
      tags: ['process', 'edit', 'approve', 'request']
    },
    {
      id: 3,
      category: 'processing',
      question: 'What happens when I approve a document request?',
      answer: 'When you approve a request, the resident will be notified and can make payment. The request moves to "Approved" status and requires payment confirmation before the document can be generated. You must set a payment amount during approval.',
      tags: ['approve', 'notification', 'payment', 'status']
    },
    {
      id: 4,
      category: 'processing',
      question: 'Can I reject a document request?',
      answer: 'Yes! You can reject requests by changing the status to "Rejected" in the edit modal. Add remarks explaining the rejection reason. Rejected requests will be notified to the resident.',
      tags: ['reject', 'status', 'remarks', 'notification']
    },
    {
      id: 5,
      category: 'payments',
      question: 'How do I confirm payment for a request?',
      answer: 'For approved requests with payment amounts, click the dollar icon to confirm payment. This moves the request to the "Document Records" tab and allows PDF generation. Only approved requests with payment amounts can be confirmed.',
      tags: ['payment', 'confirm', 'dollar icon', 'records']
    },
    {
      id: 6,
      category: 'payments',
      question: 'What if a request doesn\'t require payment?',
      answer: 'Some requests may not require payment. In this case, you can approve them without setting a payment amount, and they will move directly to Document Records for PDF generation.',
      tags: ['no payment', 'free', 'approve', 'direct']
    },
    {
      id: 7,
      category: 'pdfs',
      question: 'How do I generate PDF certificates?',
      answer: 'For approved and paid requests, click the document icon to generate a PDF certificate. The system will create a professional certificate that can be viewed in browser or downloaded for printing.',
      tags: ['pdf', 'generate', 'certificate', 'document icon']
    },
    {
      id: 8,
      category: 'pdfs',
      question: 'What information is included in the PDF?',
      answer: 'Generated PDFs include resident information, document details, official signatures, barangay seal, issue date, and all relevant certification data. They are professionally formatted for official use.',
      tags: ['pdf content', 'information', 'official', 'format']
    },
    {
      id: 9,
      category: 'general',
      question: 'What\'s the difference between Document Requests and Document Records?',
      answer: 'Document Requests shows all pending, processing, and approved requests that haven\'t been paid yet. Document Records shows only finalized requests that have been approved and paid for.',
      tags: ['requests', 'records', 'difference', 'tabs']
    },
    {
      id: 10,
      category: 'general',
      question: 'How do I filter requests by document type?',
      answer: 'Use the document type buttons at the top of the table to filter by specific document types like "Barangay Clearance", "Business Permit", "Certificate of Indigency", etc. Click "All Documents" to see everything.',
      tags: ['filter', 'document type', 'buttons', 'all documents']
    },
    {
      id: 11,
      category: 'analytics',
      question: 'How do I view analytics and trends?',
      answer: 'Scroll up to see the analytics dashboard above the main table. It shows request trends, approval rates, payment collection rates, processing times, revenue tracking, and document type distribution.',
      tags: ['analytics', 'dashboard', 'trends', 'metrics']
    },
    {
      id: 12,
      category: 'analytics',
      question: 'Can I filter analytics by time period?',
      answer: 'Yes! Use the time period filters in the analytics section to analyze different time ranges: This Month, Quarterly, This Year, or All Time. You can also select specific years, quarters, or months.',
      tags: ['time filter', 'period', 'analytics', 'range']
    },
    {
      id: 13,
      category: 'general',
      question: 'How do I search for specific requests?',
      answer: 'Use the search bar to find requests by typing resident name, ID, or document type. The search is case-insensitive and will show results as you type. You can also use status filters.',
      tags: ['search', 'find', 'resident', 'document type']
    },
    {
      id: 14,
      category: 'general',
      question: 'What is auto-refresh and how do I use it?',
      answer: 'Auto-refresh automatically updates the data every 30 seconds. Click the "Auto" button to toggle it on/off. When enabled, you\'ll see a green indicator and spinning refresh icon.',
      tags: ['auto refresh', 'automatic', 'update', 'toggle']
    },
    {
      id: 15,
      category: 'troubleshooting',
      question: 'Cannot approve request without payment amount - what should I do?',
      answer: 'When approving a request, you must set a payment amount. Enter the required fee in the "Payment Amount" field before saving. If no payment is required, you can set it to 0.',
      tags: ['approve', 'payment amount', 'required', 'error']
    },
    {
      id: 16,
      category: 'troubleshooting',
      question: 'PDF generation fails - how to fix?',
      answer: 'Ensure the request is both approved and payment is confirmed. Check your internet connection and try refreshing the page. If the issue persists, contact your system administrator.',
      tags: ['pdf', 'generation', 'fails', 'fix']
    },
    {
      id: 17,
      category: 'troubleshooting',
      question: 'Payment confirmation not working - why?',
      answer: 'Make sure the request is approved and has a payment amount set. Only approved requests with payment can be confirmed. Check that you\'re clicking the correct dollar icon.',
      tags: ['payment', 'confirmation', 'not working', 'approved']
    },
    {
      id: 18,
      category: 'troubleshooting',
      question: 'Excel export not downloading - what to do?',
      answer: 'Ensure you\'re in the Document Records tab and there are finalized records to export. Check your browser\'s download settings and popup blockers. Try refreshing the page.',
      tags: ['excel', 'export', 'download', 'records tab']
    },
    {
      id: 19,
      category: 'troubleshooting',
      question: 'Auto-refresh not working - how to fix?',
      answer: 'Check if auto-refresh is enabled (green indicator). If disabled, click the "Auto" button to enable automatic data updates. Ensure you have a stable internet connection.',
      tags: ['auto refresh', 'not working', 'enable', 'connection']
    },
    {
      id: 20,
      category: 'troubleshooting',
      question: 'Filters not showing expected results - what\'s wrong?',
      answer: 'Clear all filters and try again. Make sure you\'re in the correct tab (Requests vs Records) and check your search terms. Verify that data exists for your filter criteria.',
      tags: ['filters', 'results', 'clear', 'tab']
    },
    {
      id: 21,
      category: 'general',
      question: 'How do I set priority levels for requests?',
      answer: 'In the edit modal, use the Priority dropdown to set levels: Low, Normal, High, or Urgent. This helps prioritize processing and can be used for sorting and filtering.',
      tags: ['priority', 'levels', 'urgent', 'high']
    },
    {
      id: 22,
      category: 'general',
      question: 'Can I add notes to requests?',
      answer: 'Yes! You can add processing notes, payment notes, and remarks in the edit modal. These help track the request history and provide context for future reference.',
      tags: ['notes', 'remarks', 'processing', 'payment']
    },
    {
      id: 23,
      category: 'analytics',
      question: 'How do I interpret the analytics dashboard?',
      answer: 'The dashboard shows key performance indicators: Total Requests, Approval Rate, Payment Rate, and Processing Time. Use the smart suggestions to identify areas for improvement.',
      tags: ['analytics', 'dashboard', 'kpi', 'performance']
    },
    {
      id: 24,
      category: 'general',
      question: 'How do I get help if I\'m stuck?',
      answer: 'Use the Help Guide button in the header to access comprehensive documentation, tutorials, and troubleshooting guides. You can also use the Quick Start Guide for a step-by-step tour.',
      tags: ['help', 'guide', 'tutorial', 'documentation']
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
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <QuestionMarkCircleIcon className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Documents Records FAQ</h2>
              <p className="text-green-100 text-sm">Find answers to common questions about the documents management system</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-green-200 transition-colors"
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
                          ? 'bg-green-100 text-green-900 border border-green-200'
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                              <CategoryIcon className="w-5 h-5 text-green-600" />
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
                                    className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
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

export default DocumentsFAQ;
