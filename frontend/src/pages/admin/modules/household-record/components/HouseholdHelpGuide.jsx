import React, { useState } from 'react';
import {
  QuestionMarkCircleIcon,
  XMarkIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  BookOpenIcon,
  LightBulbIcon,
  CogIcon,
  HomeIcon,
  ChartBarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  PlayIcon,
  AcademicCapIcon,
  SparklesIcon,
  UserIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const HouseholdHelpGuide = ({ isOpen, onClose }) => {
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
            <h3 className="font-semibold text-green-900 mb-2">What is the Household Records Module?</h3>
            <p className="text-green-800 text-sm">
              The Household Records module is a comprehensive system for managing household information, 
              family units, and resident demographics. It provides tools to track household composition, 
              maintain accurate family records, and manage household-related data efficiently.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <HomeIcon className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-medium text-gray-900">Household Management</h4>
              </div>
              <p className="text-gray-600 text-sm">
                Create, edit, and manage household records with detailed family information and demographics.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <UserGroupIcon className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-gray-900">Family Composition</h4>
              </div>
              <p className="text-gray-600 text-sm">
                Track family members, household size, and demographic distribution across the community.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <ChartBarIcon className="w-5 h-5 text-purple-600 mr-2" />
                <h4 className="font-medium text-gray-900">Analytics & Insights</h4>
              </div>
              <p className="text-gray-600 text-sm">
                View comprehensive analytics on household demographics, size distribution, and community patterns.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CogIcon className="w-5 h-5 text-orange-600 mr-2" />
                <h4 className="font-medium text-gray-900">Administrative Tools</h4>
              </div>
              <p className="text-gray-600 text-sm">
                Export household data, manage resident assignments, and perform bulk household operations.
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
              Follow these steps to quickly get familiar with the Household Records module:
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                step: 1,
                title: "View Household Records",
                description: "Start by exploring the household table to see existing records and understand the data structure.",
                icon: HomeIcon,
                color: "green"
              },
              {
                step: 2,
                title: "Create New Household",
                description: "Click 'Create Household' to add a new family unit to the system.",
                icon: UserGroupIcon,
                color: "blue"
              },
              {
                step: 3,
                title: "Assign Household Head",
                description: "Select a resident to serve as the household head and provide family leadership.",
                icon: UserIcon,
                color: "purple"
              },
              {
                step: 4,
                title: "Review Analytics",
                description: "Check the analytics dashboard to understand household demographics and patterns.",
                icon: ChartBarIcon,
                color: "orange"
              },
              {
                step: 5,
                title: "Search & Filter",
                description: "Use search and filter tools to find specific households or demographic groups.",
                icon: CogIcon,
                color: "indigo"
              }
            ].map((item) => (
              <div key={item.step} className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                <div className={`w-8 h-8 rounded-full bg-${item.color}-100 flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`w-4 h-4 text-${item.color}-600`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm">{item.step}. {item.title}</h4>
                  <p className="text-gray-600 text-xs mt-1">{item.description}</p>
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
      icon: LightBulbIcon,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Core Features Overview</h3>
            <p className="text-blue-800 text-sm">
              The Household Records module includes powerful features for comprehensive household management:
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              {
                title: "Household Creation & Management",
                description: "Create new households, assign household heads, and manage family composition with detailed demographic information.",
                features: ["Create household records", "Assign household heads", "Set household size", "Manage family composition"],
                icon: HomeIcon,
                color: "green"
              },
              {
                title: "Resident Assignment",
                description: "Link residents to households and manage family relationships within the community structure.",
                features: ["Promote residents to household heads", "Assign family members", "Manage household relationships", "Track family connections"],
                icon: UserGroupIcon,
                color: "blue"
              },
              {
                title: "Demographic Analytics",
                description: "Comprehensive analytics on household size, age distribution, civil status, and community demographics.",
                features: ["Household size distribution", "Age demographics", "Civil status analysis", "Gender distribution"],
                icon: ChartBarIcon,
                color: "purple"
              },
              {
                title: "Search & Filter System",
                description: "Advanced search and filtering capabilities to quickly find specific households or demographic groups.",
                features: ["Search by household ID", "Filter by household size", "Search by household head name", "Filter by demographics"],
                icon: CogIcon,
                color: "orange"
              },
              {
                title: "Data Export & Reporting",
                description: "Export household data for analysis, reporting, and integration with other systems.",
                features: ["Export household records", "Generate demographic reports", "Data analysis tools", "Integration capabilities"],
                icon: DocumentArrowDownIcon,
                color: "indigo"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-lg bg-${feature.color}-100 flex items-center justify-center flex-shrink-0`}>
                    <feature.icon className={`w-5 h-5 text-${feature.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm mb-2">{feature.title}</h4>
                    <p className="text-gray-600 text-xs mb-3">{feature.description}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {feature.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <CheckCircleIcon className="w-3 h-3 text-green-500 flex-shrink-0" />
                          <span className="text-xs text-gray-600">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'faq',
      title: 'FAQ',
      icon: QuestionMarkCircleIcon,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">Frequently Asked Questions</h3>
            <p className="text-purple-800 text-sm">
              Find answers to common questions about household management and system usage:
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                question: "How do I create a new household?",
                answer: "Click the 'Create Household' button, select a resident to serve as household head, set the household size, and provide contact information. The system will automatically generate a unique household ID.",
                category: "General"
              },
              {
                question: "Can I change the household head after creation?",
                answer: "Yes, you can edit any household record and reassign the household head by selecting a different resident from the dropdown list.",
                category: "Management"
              },
              {
                question: "What information is required for a household?",
                answer: "Minimum requirements include household size (number of members) and either a household head assignment or manual name entry. Contact information is optional but recommended.",
                category: "General"
              },
              {
                question: "How do I search for specific households?",
                answer: "Use the search bar to find households by household ID, household head name, or address. You can also use filters to narrow down results by demographics.",
                category: "Search"
              },
              {
                question: "What analytics are available?",
                answer: "The system provides analytics on total households, total members, average household size, coverage rate, and demographic distribution across the community.",
                category: "Analytics"
              },
              {
                question: "Can I export household data?",
                answer: "Yes, household data can be exported for analysis and reporting purposes. Use the export functionality to download records in various formats.",
                category: "Export"
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                        {faq.category}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 text-sm mb-2">{faq.question}</h4>
                    <p className="text-gray-600 text-xs">{faq.answer}</p>
                  </div>
                </div>
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
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 mb-2">Common Issues & Solutions</h3>
            <p className="text-red-800 text-sm">
              Troubleshoot common issues and find solutions to problems you might encounter:
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                issue: "Cannot create household - form validation error",
                solution: "Ensure household size is greater than 0 and either a resident is selected as household head or a name is provided manually.",
                icon: CheckCircleIcon,
                color: "green"
              },
              {
                issue: "Resident not appearing in dropdown",
                solution: "Check if the resident exists in the residents database. Use the search function to find residents by name or ID.",
                icon: UserIcon,
                color: "blue"
              },
              {
                issue: "Search not returning results",
                solution: "Try different search terms or clear filters. Ensure you're searching for the correct household ID or name format.",
                icon: MagnifyingGlassIcon,
                color: "purple"
              },
              {
                issue: "Analytics showing incorrect data",
                solution: "Refresh the page to reload data from the server. Check if household records have been properly saved.",
                icon: ChartBarIcon,
                color: "orange"
              },
              {
                issue: "Cannot edit household information",
                solution: "Ensure you have proper permissions and the household record exists. Try refreshing the page and attempting the edit again.",
                icon: CogIcon,
                color: "indigo"
              }
            ].map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full bg-${item.color}-100 flex items-center justify-center flex-shrink-0`}>
                    <item.icon className={`w-4 h-4 text-${item.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm mb-2">{item.issue}</h4>
                    <p className="text-gray-600 text-xs">{item.solution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 text-sm mb-1">Need More Help?</h4>
                <p className="text-blue-800 text-xs">
                  If you're still experiencing issues, contact your system administrator or refer to the 
                  complete documentation for advanced troubleshooting steps.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <BookOpenIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Household Records Help Guide</h2>
                <p className="text-white/80 text-sm">Comprehensive guide to household management</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-200 transition-colors duration-200 p-2 hover:bg-white/10 rounded-lg"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      activeSection === section.id
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{section.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {sections.find(section => section.id === activeSection)?.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HouseholdHelpGuide;