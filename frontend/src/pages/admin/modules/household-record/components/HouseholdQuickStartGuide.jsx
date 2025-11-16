import React, { useState } from 'react';
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  HomeIcon,
  UserGroupIcon,
  UserIcon,
  ChartBarIcon,
  CogIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  SparklesIcon,
  ArrowPathIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

const HouseholdQuickStartGuide = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Household Records',
      subtitle: 'Let\'s get you started with household management',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <HomeIcon className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Household Records!</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              This interactive tour will guide you through the key features of the Household Records module. 
              You'll learn how to manage household information, track family demographics, and use analytics effectively.
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">What you'll learn:</h4>
            <ul className="text-green-800 text-sm space-y-1">
              <li>• How to navigate the household records interface</li>
              <li>• Creating and managing household records</li>
              <li>• Assigning household heads and family members</li>
              <li>• Understanding analytics and demographics</li>
              <li>• Using search and filter tools effectively</li>
            </ul>
          </div>
        </div>
      ),
      icon: HomeIcon,
      color: 'green'
    },
    {
      id: 'explore-interface',
      title: 'Explore the Interface',
      subtitle: 'Understanding the main dashboard and navigation',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChartBarIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Dashboard Overview</h3>
            <p className="text-gray-600">
              The main dashboard provides a comprehensive view of household data and key metrics.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <HomeIcon className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-medium text-gray-900">Statistics Cards</h4>
              </div>
              <p className="text-gray-600 text-sm">
                View total households, members, and average household size at a glance.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <ChartBarIcon className="w-5 h-5 text-purple-600 mr-2" />
                <h4 className="font-medium text-gray-900">Analytics Dashboard</h4>
              </div>
              <p className="text-gray-600 text-sm">
                Comprehensive analytics with KPIs, progress bars, and demographic insights.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CogIcon className="w-5 h-5 text-orange-600 mr-2" />
                <h4 className="font-medium text-gray-900">Search & Controls</h4>
              </div>
              <p className="text-gray-600 text-sm">
                Search households, create new records, and access filter options.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <UserGroupIcon className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-gray-900">Household Table</h4>
              </div>
              <p className="text-gray-600 text-sm">
                Main data table showing all household records with action buttons.
              </p>
            </div>
          </div>
        </div>
      ),
      icon: ChartBarIcon,
      color: 'blue'
    },
    {
      id: 'create-household',
      title: 'Create Household Records',
      subtitle: 'Adding new households to the system',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserGroupIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Creating New Households</h3>
            <p className="text-gray-600">
              Learn how to add new household records and assign household heads.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-3">Step-by-Step Process:</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-purple-600">1</span>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 text-sm">Click "Create Household"</h5>
                    <p className="text-gray-600 text-xs">Located in the search and controls section</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-purple-600">2</span>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 text-sm">Select Household Head</h5>
                    <p className="text-gray-600 text-xs">Choose a resident from the dropdown or search by name</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-purple-600">3</span>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 text-sm">Set Household Size</h5>
                    <p className="text-gray-600 text-xs">Enter the number of family members</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-purple-600">4</span>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 text-sm">Add Contact Information</h5>
                    <p className="text-gray-600 text-xs">Provide phone number and email (optional)</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-purple-600">5</span>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 text-sm">Save the Record</h5>
                    <p className="text-gray-600 text-xs">Click "Save Changes" to create the household</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      icon: UserGroupIcon,
      color: 'purple'
    },
    {
      id: 'assign-head',
      title: 'Assign Household Head',
      subtitle: 'Managing household leadership and family structure',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Household Head Assignment</h3>
            <p className="text-gray-600">
              Understanding how to assign and manage household heads effectively.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <UserIcon className="w-5 h-5 text-orange-600 mr-2" />
                <h4 className="font-medium text-gray-900">Resident Selection</h4>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                Choose from existing residents in the system to serve as household head.
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Search residents by name or ID</li>
                <li>• View resident details before selection</li>
                <li>• Check existing household assignments</li>
              </ul>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <HomeIcon className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-medium text-gray-900">Household Management</h4>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                Manage household composition and family structure.
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Set household size accurately</li>
                <li>• Update household head as needed</li>
                <li>• Track family demographics</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-semibold text-orange-900 mb-2">Best Practices:</h4>
            <ul className="text-orange-800 text-sm space-y-1">
              <li>• Choose residents who are 18+ years old as household heads</li>
              <li>• Ensure household head information is complete and accurate</li>
              <li>• Update household size when family composition changes</li>
              <li>• Maintain current contact information for communication</li>
            </ul>
          </div>
        </div>
      ),
      icon: UserIcon,
      color: 'orange'
    },
    {
      id: 'view-analytics',
      title: 'View Analytics',
      subtitle: 'Understanding household demographics and insights',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChartBarIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics Dashboard</h3>
            <p className="text-gray-600">
              Explore comprehensive analytics and demographic insights for your community.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <HomeIcon className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-medium text-gray-900">Household Metrics</h4>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                Key performance indicators for household management.
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Total households registered</li>
                <li>• Total community members</li>
                <li>• Average household size</li>
                <li>• Coverage rate percentage</li>
              </ul>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <ChartBarIcon className="w-5 h-5 text-purple-600 mr-2" />
                <h4 className="font-medium text-gray-900">Demographic Insights</h4>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                Understanding community composition and patterns.
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Age distribution analysis</li>
                <li>• Civil status breakdown</li>
                <li>• Gender distribution</li>
                <li>• Household size patterns</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
            <h4 className="font-semibold text-indigo-900 mb-2">Using Analytics Effectively:</h4>
            <ul className="text-indigo-800 text-sm space-y-1">
              <li>• Monitor community growth and household formation trends</li>
              <li>• Identify demographic patterns for planning purposes</li>
              <li>• Track coverage rate to ensure comprehensive data collection</li>
              <li>• Use insights for community development and resource allocation</li>
            </ul>
          </div>
        </div>
      ),
      icon: ChartBarIcon,
      color: 'indigo'
    },
    {
      id: 'search-filter',
      title: 'Search & Filter',
      subtitle: 'Finding specific households and demographic groups',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MagnifyingGlassIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Search & Filter Tools</h3>
            <p className="text-gray-600">
              Learn how to efficiently find and filter household records.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <MagnifyingGlassIcon className="w-5 h-5 text-teal-600 mr-2" />
                <h4 className="font-medium text-gray-900">Search Functionality</h4>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                Find households using various search criteria.
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Search by household ID</li>
                <li>• Search by household head name</li>
                <li>• Search by address</li>
                <li>• Real-time search results</li>
              </ul>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CogIcon className="w-5 h-5 text-orange-600 mr-2" />
                <h4 className="font-medium text-gray-900">Filter Options</h4>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                Narrow down results using filter criteria.
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Filter by household size</li>
                <li>• Filter by demographics</li>
                <li>• Clear all filters</li>
                <li>• Advanced filtering options</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-4">
            <h4 className="font-semibold text-teal-900 mb-2">Search Tips:</h4>
            <ul className="text-teal-800 text-sm space-y-1">
              <li>• Use partial matches for flexible searching</li>
              <li>• Combine search terms for more specific results</li>
              <li>• Clear search to view all records</li>
              <li>• Use filters to narrow down large datasets</li>
            </ul>
          </div>
        </div>
      ),
      icon: MagnifyingGlassIcon,
      color: 'teal'
    },
    {
      id: 'complete',
      title: 'Tour Complete!',
      subtitle: 'You\'re ready to manage household records effectively',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <SparklesIcon className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Congratulations!</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              You've completed the Household Records tour! You now have a solid understanding of how to 
              manage household information, track demographics, and use the system effectively.
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-3">What's Next?</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h5 className="font-medium text-gray-900 text-sm">Immediate Actions:</h5>
                <ul className="text-green-800 text-sm space-y-1">
                  <li>• Create your first household record</li>
                  <li>• Explore the analytics dashboard</li>
                  <li>• Test the search functionality</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium text-gray-900 text-sm">Advanced Features:</h5>
                <ul className="text-green-800 text-sm space-y-1">
                  <li>• Export household data</li>
                  <li>• Use advanced filtering</li>
                  <li>• Monitor demographic trends</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircleIcon className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900 text-sm mb-1">Need More Help?</h4>
                <p className="text-blue-800 text-xs">
                  Access the Help Guide for detailed documentation, or check the FAQ section 
                  for answers to common questions. You can also contact your system administrator for support.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
      icon: SparklesIcon,
      color: 'green'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const handleComplete = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    onClose();
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <PlayIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Quick Start Guide</h2>
                <p className="text-white/80 text-sm">Step {currentStep + 1} of {steps.length}</p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-white hover:text-red-200 transition-colors duration-200 p-2 hover:bg-white/10 rounded-lg"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-white/80 text-xs mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[calc(90vh-200px)] overflow-y-auto">
          <div className="flex items-center justify-center mb-6">
            <div className={`w-16 h-16 bg-gradient-to-br from-${currentStepData.color}-500 to-${currentStepData.color}-600 rounded-full flex items-center justify-center`}>
              <currentStepData.icon className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{currentStepData.title}</h3>
            <p className="text-gray-600">{currentStepData.subtitle}</p>
          </div>
          
          {currentStepData.content}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ChevronLeftIcon className="w-4 h-4" />
              <span>Previous</span>
            </button>
            
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep
                      ? 'bg-green-600'
                      : index < currentStep || completedSteps.has(index)
                      ? 'bg-green-400'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleComplete}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg text-sm font-medium transition-all duration-200"
              >
                <CheckCircleIcon className="w-4 h-4" />
                <span>Complete Tour</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg text-sm font-medium transition-all duration-200"
              >
                <span>Next</span>
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HouseholdQuickStartGuide;