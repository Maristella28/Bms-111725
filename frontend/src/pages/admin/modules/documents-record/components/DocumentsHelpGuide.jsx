import React, { useState } from 'react';
import {
  QuestionMarkCircleIcon,
  XMarkIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  BookOpenIcon,
  LightBulbIcon,
  CogIcon,
  DocumentTextIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  PlayIcon,
  AcademicCapIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const DocumentsHelpGuide = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [activeStep, setActiveStep] = useState(0);

  const sections = [
    {
      id: 'overview',
      title: 'Overview',
      icon: BookOpenIcon,
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">What is the Documents Records Module?</h3>
            <p className="text-green-800 text-sm">
              The Documents Records module is a comprehensive system for managing barangay document requests, 
              certificate issuance, payment processing, and record keeping. It handles the complete lifecycle 
              from request submission to final document delivery.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <DocumentTextIcon className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-medium text-gray-900">Document Management</h4>
              </div>
              <p className="text-gray-600 text-sm">
                Process and manage various barangay documents including clearances, certificates, and permits.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CurrencyDollarIcon className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-gray-900">Payment Processing</h4>
              </div>
              <p className="text-gray-600 text-sm">
                Handle payment collection, confirmation, and tracking for document services.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <ChartBarIcon className="w-5 h-5 text-purple-600 mr-2" />
                <h4 className="font-medium text-gray-900">Analytics & Reporting</h4>
              </div>
              <p className="text-gray-600 text-sm">
                View comprehensive analytics, trends, and generate reports for document processing.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CogIcon className="w-5 h-5 text-orange-600 mr-2" />
                <h4 className="font-medium text-gray-900">Administrative Tools</h4>
              </div>
              <p className="text-gray-600 text-sm">
                Export data, manage document types, and perform bulk operations.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'quick-start',
      title: 'Quick Start Guide',
      icon: PlayIcon,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">Getting Started in 5 Steps</h3>
            <p className="text-green-800 text-sm mb-4">
              Follow these steps to quickly get familiar with the Documents Records module:
            </p>
          </div>
          
          <div className="space-y-3">
            {[
              {
                step: 1,
                title: "View Document Requests",
                description: "Start by exploring the Document Requests tab to see all pending requests.",
                action: "Click on the 'Document Requests' tab in the main interface"
              },
              {
                step: 2,
                title: "Review Request Details",
                description: "Click on any request to view detailed information about the resident and document type.",
                action: "Click the eye icon or resident name to expand details"
              },
              {
                step: 3,
                title: "Process Requests",
                description: "Edit requests to approve, reject, or update status and payment information.",
                action: "Click the pencil icon to edit and process requests"
              },
              {
                step: 4,
                title: "Confirm Payments",
                description: "For approved requests with payment, confirm when payment is received.",
                action: "Click the dollar icon to confirm payment"
              },
              {
                step: 5,
                title: "Generate Documents",
                description: "Generate PDF certificates for approved and paid requests.",
                action: "Click the document icon to generate PDFs"
              }
            ].map((item, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                  <div className="bg-green-50 border border-green-200 rounded px-2 py-1">
                    <p className="text-green-800 text-xs font-medium">{item.action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'features',
      title: 'Key Features',
      icon: SparklesIcon,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <DocumentTextIcon className="w-5 h-5 text-green-600 mr-2" />
                Document Processing
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Process various document types
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Track request status and progress
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Generate PDF certificates
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Manage document templates
                </li>
              </ul>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <CurrencyDollarIcon className="w-5 h-5 text-blue-600 mr-2" />
                Payment Management
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Set payment amounts
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Confirm payment receipt
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Track payment status
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Generate receipts
                </li>
              </ul>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <ChartBarIcon className="w-5 h-5 text-purple-600 mr-2" />
                Analytics & Reports
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Request trends and patterns
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Revenue tracking
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Performance metrics
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Export data to Excel
                </li>
              </ul>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <CogIcon className="w-5 h-5 text-orange-600 mr-2" />
                Administrative Tools
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Advanced filtering
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Bulk operations
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Auto-refresh functionality
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Document type management
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'faq',
      title: 'Frequently Asked Questions',
      icon: QuestionMarkCircleIcon,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            {[
              {
                question: "How do I process a document request?",
                answer: "Click the pencil icon next to any request to edit it. You can change the status to 'Approved', 'Rejected', or 'Processing', set payment amounts, and add notes. Remember to set a payment amount when approving requests."
              },
              {
                question: "What happens when I approve a document request?",
                answer: "When you approve a request, the resident will be notified and can make payment. The request moves to 'Approved' status and requires payment confirmation before the document can be generated."
              },
              {
                question: "How do I confirm payment for a request?",
                answer: "For approved requests with payment amounts, click the dollar icon to confirm payment. This moves the request to 'Document Records' tab and allows PDF generation."
              },
              {
                question: "How do I generate PDF certificates?",
                answer: "For approved and paid requests, click the document icon to generate a PDF certificate. The system will create a professional certificate that can be viewed or downloaded."
              },
              {
                question: "What's the difference between Document Requests and Document Records?",
                answer: "Document Requests shows all pending and processing requests. Document Records shows only finalized requests that have been approved and paid for."
              },
              {
                question: "How do I filter requests by document type?",
                answer: "Use the document type buttons at the top of the table to filter by specific document types like 'Barangay Clearance', 'Business Permit', etc. Click 'All Documents' to see everything."
              },
              {
                question: "Can I export data from this module?",
                answer: "Yes! Use the 'Download Excel' button in the Document Records tab to export all finalized records. This creates a comprehensive Excel file with all document information."
              },
              {
                question: "How do I track payment status?",
                answer: "Payment status is shown in the 'Payment Status' column. 'Paid' means payment has been confirmed, 'Unpaid' means payment is pending, and 'N/A' means no payment is required."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <InformationCircleIcon className="w-5 h-5 text-blue-600 mr-2" />
                  {faq.question}
                </h4>
                <p className="text-gray-600 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: ExclamationTriangleIcon,
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 mb-2">Common Issues & Solutions</h3>
            <p className="text-red-800 text-sm">
              Here are solutions to common problems you might encounter:
            </p>
          </div>
          
          <div className="space-y-3">
            {[
              {
                issue: "Cannot approve request without payment amount",
                solution: "When approving a request, you must set a payment amount. Enter the required fee in the 'Payment Amount' field before saving.",
                severity: "error"
              },
              {
                issue: "PDF generation fails",
                solution: "Ensure the request is both approved and payment is confirmed. Check your internet connection and try refreshing the page.",
                severity: "warning"
              },
              {
                issue: "Payment confirmation not working",
                solution: "Make sure the request is approved and has a payment amount set. Only approved requests with payment can be confirmed.",
                severity: "warning"
              },
              {
                issue: "Excel export not downloading",
                solution: "Ensure you're in the Document Records tab and there are finalized records to export. Check your browser's download settings.",
                severity: "info"
              },
              {
                issue: "Auto-refresh not working",
                solution: "Check if auto-refresh is enabled (green indicator). If disabled, click the 'Auto' button to enable automatic data updates.",
                severity: "info"
              },
              {
                issue: "Filters not showing expected results",
                solution: "Clear all filters and try again. Make sure you're in the correct tab (Requests vs Records) and check your search terms.",
                severity: "warning"
              }
            ].map((item, index) => (
              <div key={index} className={`border rounded-lg p-4 ${
                item.severity === 'error' ? 'bg-red-50 border-red-200' :
                item.severity === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <h4 className={`font-medium mb-2 ${
                  item.severity === 'error' ? 'text-red-900' :
                  item.severity === 'warning' ? 'text-yellow-900' :
                  'text-blue-900'
                }`}>
                  {item.issue}
                </h4>
                <p className={`text-sm ${
                  item.severity === 'error' ? 'text-red-800' :
                  item.severity === 'warning' ? 'text-yellow-800' :
                  'text-blue-800'
                }`}>
                  {item.solution}
                </p>
              </div>
            ))}
          </div>
        </div>
      )
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Documents Records Help Guide</h2>
              <p className="text-green-100 text-sm">Complete guide to using the documents management system</p>
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
              <h3 className="font-semibold text-gray-900 mb-3">Help Sections</h3>
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? 'bg-green-100 text-green-900 border border-green-200'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{section.title}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {sections.find(section => section.id === activeSection)?.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsHelpGuide;
