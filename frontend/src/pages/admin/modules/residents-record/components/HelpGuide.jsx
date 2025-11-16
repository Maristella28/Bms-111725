import React, { useState } from 'react';
import {
  QuestionMarkCircleIcon,
  XMarkIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  BookOpenIcon,
  LightBulbIcon,
  CogIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  PlayIcon,
  AcademicCapIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const HelpGuide = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [activeStep, setActiveStep] = useState(0);

  const sections = [
    {
      id: 'overview',
      title: 'Overview',
      icon: BookOpenIcon,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">What is the Residents Records Module?</h3>
            <p className="text-blue-800 text-sm">
              The Residents Records module is a comprehensive system for managing all resident information, 
              including personal details, verification status, analytics, and administrative functions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <UserGroupIcon className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-medium text-gray-900">Resident Management</h4>
              </div>
              <p className="text-gray-600 text-sm">
                Add, edit, view, and manage resident profiles with complete personal information.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <ShieldCheckIcon className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-gray-900">Verification System</h4>
              </div>
              <p className="text-gray-600 text-sm">
                Review and approve resident verification requests for account activation.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <ChartBarIcon className="w-5 h-5 text-purple-600 mr-2" />
                <h4 className="font-medium text-gray-900">Analytics & Reports</h4>
              </div>
              <p className="text-gray-600 text-sm">
                View demographic statistics, trends, and generate comprehensive reports.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CogIcon className="w-5 h-5 text-orange-600 mr-2" />
                <h4 className="font-medium text-gray-900">Administrative Tools</h4>
              </div>
              <p className="text-gray-600 text-sm">
                Export data, manage disabled accounts, and perform bulk operations.
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
              Follow these steps to quickly get familiar with the Residents Records module:
            </p>
          </div>
          
          <div className="space-y-3">
            {[
              {
                step: 1,
                title: "View Current Residents",
                description: "Start by exploring the main residents table to see all registered residents.",
                action: "Look at the residents table on the main page"
              },
              {
                step: 2,
                title: "Check Analytics Dashboard",
                description: "Review the analytics section to understand resident demographics and trends.",
                action: "Scroll to the analytics section below the table"
              },
              {
                step: 3,
                title: "Add a New Resident",
                description: "Click the 'Add Resident' button to create a new resident profile.",
                action: "Click the blue 'Add Resident' button in the header"
              },
              {
                step: 4,
                title: "Review Verification Requests",
                description: "Check the verification section to approve pending resident accounts.",
                action: "Look for verification requests in the users table"
              },
              {
                step: 5,
                title: "Export Data",
                description: "Use the export functions to download resident data in various formats.",
                action: "Click the export buttons in the header controls"
              }
            ].map((item, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                  <div className="bg-blue-50 border border-blue-200 rounded px-2 py-1">
                    <p className="text-blue-800 text-xs font-medium">{item.action}</p>
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
                <UserGroupIcon className="w-5 h-5 text-blue-600 mr-2" />
                Resident Management
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Add new residents with complete profiles
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Edit existing resident information
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  View detailed resident profiles
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Upload and manage profile photos
                </li>
              </ul>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <ShieldCheckIcon className="w-5 h-5 text-green-600 mr-2" />
                Verification System
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Review verification requests
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Approve or deny resident accounts
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Track verification status
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Manage user permissions
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
                  Demographic statistics
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Registration trends
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Interactive charts
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Export to PDF/CSV
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
                  Data export options
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Account management
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
                question: "How do I add a new resident?",
                answer: "Click the 'Add Resident' button in the header, fill out the resident form with all required information, and click 'Save'. The resident will be added to the system immediately."
              },
              {
                question: "What is the verification process?",
                answer: "When residents register, their accounts need verification. You can review their information in the verification section and approve or deny their accounts based on the provided documentation."
              },
              {
                question: "How do I export resident data?",
                answer: "Use the export buttons in the header controls. You can export to CSV for spreadsheet analysis or PDF for reports. Select the data range and format you need."
              },
              {
                question: "Can I filter residents by specific criteria?",
                answer: "Yes! Use the filter controls to search by name, status, age range, civil status, gender, or other criteria. The filters work together to help you find specific residents quickly."
              },
              {
                question: "What happens when I disable a resident?",
                answer: "Disabled residents are moved to the disabled residents section where you can review them and restore their accounts if needed. They cannot log in while disabled."
              },
              {
                question: "How do I view resident analytics?",
                answer: "Scroll down to the analytics section below the residents table. You'll see demographic charts, registration trends, and statistical summaries of your resident data."
              },
              {
                question: "Can I edit resident information after adding them?",
                answer: "Yes! Click the edit button (pencil icon) next to any resident in the table to modify their information. Changes are saved immediately to the database."
              },
              {
                question: "What file formats are supported for profile photos?",
                answer: "The system supports common image formats including JPG, PNG, and GIF. Photos are automatically resized and optimized for web display."
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
                issue: "Resident photo not displaying",
                solution: "Check if the image file is in a supported format (JPG, PNG, GIF) and under 5MB. Try uploading a different image or check the file path.",
                severity: "warning"
              },
              {
                issue: "Cannot save resident information",
                solution: "Ensure all required fields are filled out correctly. Check for special characters in names and verify date formats are correct.",
                severity: "error"
              },
              {
                issue: "Export function not working",
                solution: "Make sure you have residents selected or data to export. Try refreshing the page and ensure your browser allows downloads.",
                severity: "warning"
              },
              {
                issue: "Verification requests not showing",
                solution: "Check if there are pending verification requests. The system only shows residents who have registered but not been verified yet.",
                severity: "info"
              },
              {
                issue: "Analytics charts not loading",
                solution: "Ensure you have resident data in the system. Charts require at least some resident records to display properly.",
                severity: "info"
              },
              {
                issue: "Search/filter not working",
                solution: "Clear all filters and try again. Make sure you're using the correct search terms and that the data exists in the system.",
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
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AcademicCapIcon className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Residents Records Help Guide</h2>
              <p className="text-blue-100 text-sm">Complete guide to using the residents management system</p>
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
                          ? 'bg-blue-100 text-blue-900 border border-blue-200'
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

export default HelpGuide;
