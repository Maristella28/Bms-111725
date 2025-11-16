import React, { useState } from 'react';
import {
  PlayIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  XMarkIcon,
  UserPlusIcon,
  EyeIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  CogIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

const QuickStartGuide = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Residents Records',
      icon: PlayIcon,
      description: 'Let\'s get you started with the residents management system in just a few minutes!',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">What you'll learn:</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• How to navigate the residents table</li>
              <li>• How to add new residents</li>
              <li>• How to manage verifications</li>
              <li>• How to use analytics and reports</li>
              <li>• How to export data</li>
            </ul>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <LightBulbIcon className="w-5 h-5 text-yellow-600 mr-2" />
              <h4 className="font-medium text-yellow-900">Pro Tip</h4>
            </div>
            <p className="text-yellow-800 text-sm">
              This guide will take about 5 minutes to complete. You can skip steps or come back later using the Help Guide.
            </p>
          </div>
        </div>
      ),
      action: 'Start Tour',
      actionType: 'primary'
    },
    {
      id: 'explore-table',
      title: 'Explore the Residents Table',
      icon: EyeIcon,
      description: 'The main residents table shows all registered residents with their key information.',
      content: (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">What you'll see:</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Resident photos</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Personal details</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>Status indicators</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Action buttons</span>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Try this:</h4>
            <p className="text-blue-800 text-sm">
              Scroll through the table to see different residents. Notice the status badges and action buttons for each resident.
            </p>
          </div>
        </div>
      ),
      action: 'Next: Add Resident',
      actionType: 'primary'
    },
    {
      id: 'add-resident',
      title: 'Add a New Resident',
      icon: UserPlusIcon,
      description: 'Learn how to add new residents to the system with complete profile information.',
      content: (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Steps to add a resident:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">1</div>
                <span>Click the "Add Resident" button</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">2</div>
                <span>Fill out the resident form</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">3</div>
                <span>Upload a profile photo (optional)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">4</div>
                <span>Click "Save" to add the resident</span>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Required fields:</h4>
            <p className="text-green-800 text-sm">
              First name, last name, email, phone number, birth date, address, and civil status are required.
            </p>
          </div>
        </div>
      ),
      action: 'Next: Verification',
      actionType: 'primary'
    },
    {
      id: 'verification',
      title: 'Manage Verifications',
      icon: ShieldCheckIcon,
      description: 'Review and approve resident verification requests to activate their accounts.',
      content: (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Verification process:</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center text-sm font-semibold">!</div>
                <div>
                  <h5 className="font-medium text-gray-900">Pending Requests</h5>
                  <p className="text-gray-600 text-sm">New residents appear in the verification section</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">✓</div>
                <div>
                  <h5 className="font-medium text-gray-900">Review Information</h5>
                  <p className="text-gray-600 text-sm">Check their details and documentation</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-semibold">✓</div>
                <div>
                  <h5 className="font-medium text-gray-900">Approve or Deny</h5>
                  <p className="text-gray-600 text-sm">Make your decision to activate their account</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-medium text-orange-900 mb-2">Important:</h4>
            <p className="text-orange-800 text-sm">
              Only verified residents can log into the system and access resident features.
            </p>
          </div>
        </div>
      ),
      action: 'Next: Analytics',
      actionType: 'primary'
    },
    {
      id: 'analytics',
      title: 'View Analytics & Reports',
      icon: ChartBarIcon,
      description: 'Explore demographic statistics and trends in your resident data.',
      content: (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Analytics features:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Demographic charts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Registration trends</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>Age distribution</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>Civil status breakdown</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Gender statistics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  <span>Voter status</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Scroll down to see:</h4>
            <p className="text-blue-800 text-sm">
              The analytics section appears below the residents table. You'll find interactive charts and statistical summaries.
            </p>
          </div>
        </div>
      ),
      action: 'Next: Export Data',
      actionType: 'primary'
    },
    {
      id: 'export',
      title: 'Export Data',
      icon: DocumentArrowDownIcon,
      description: 'Learn how to export resident data in various formats for reporting and analysis.',
      content: (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Export options:</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-semibold">CSV</div>
                  <div>
                    <h5 className="font-medium text-gray-900">CSV Export</h5>
                    <p className="text-gray-600 text-sm">For spreadsheet analysis</p>
                  </div>
                </div>
                <button className="px-3 py-1 bg-green-600 text-white text-xs rounded-md">Export</button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 text-red-800 rounded-full flex items-center justify-center text-sm font-semibold">PDF</div>
                  <div>
                    <h5 className="font-medium text-gray-900">PDF Report</h5>
                    <p className="text-gray-600 text-sm">For official reports</p>
                  </div>
                </div>
                <button className="px-3 py-1 bg-red-600 text-white text-xs rounded-md">Export</button>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">Filter before export:</h4>
            <p className="text-yellow-800 text-sm">
              Use the filter controls to export specific groups of residents (e.g., by status, age range, etc.).
            </p>
          </div>
        </div>
      ),
      action: 'Next: Search & Filter',
      actionType: 'primary'
    },
    {
      id: 'search-filter',
      title: 'Search & Filter',
      icon: MagnifyingGlassIcon,
      description: 'Master the search and filtering capabilities to quickly find specific residents.',
      content: (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Search & filter options:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Search by name, email, or phone</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Filter by verification status</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Filter by age range</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Filter by civil status</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Filter by gender</span>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Pro tip:</h4>
            <p className="text-blue-800 text-sm">
              Combine multiple filters to narrow down results. Clear all filters to see all residents again.
            </p>
          </div>
        </div>
      ),
      action: 'Complete Tour',
      actionType: 'success'
    },
    {
      id: 'complete',
      title: 'Tour Complete!',
      icon: CheckCircleIcon,
      description: 'Congratulations! You\'ve learned the basics of the Residents Records system.',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-900 mb-2">Well done!</h3>
            <p className="text-green-800">
              You now know how to navigate, add residents, manage verifications, view analytics, and export data.
            </p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">What's next?</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Start adding residents to your system</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Review pending verification requests</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Explore the analytics dashboard</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Use the Help Guide for detailed information</span>
              </div>
            </div>
          </div>
        </div>
      ),
      action: 'Finish',
      actionType: 'success'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(currentStep + 1);
    } else {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      onComplete?.();
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const handleStepClick = (stepIndex) => {
    setCurrentStep(stepIndex);
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">{currentStepData.title}</h2>
              <p className="text-blue-100 text-sm">{currentStepData.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-200 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex h-[calc(90vh-140px)]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Tour Steps</h3>
              <nav className="space-y-1">
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isCompleted = completedSteps.has(index);
                  const isCurrent = currentStep === index;
                  
                  return (
                    <button
                      key={step.id}
                      onClick={() => handleStepClick(index)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        isCurrent
                          ? 'bg-blue-100 text-blue-900 border border-blue-200'
                          : isCompleted
                          ? 'bg-green-100 text-green-900 border border-green-200'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <StepIcon className="w-5 h-5" />
                      <span className="font-medium text-sm">{step.title}</span>
                      {isCompleted && (
                        <CheckCircleIcon className="w-4 h-4 text-green-600 ml-auto" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {currentStepData.content}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Skip Tour
          </button>
          
          <div className="flex items-center space-x-3">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Previous
              </button>
            )}
            
            <button
              onClick={handleNext}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                currentStepData.actionType === 'success'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {currentStepData.action}
              <ArrowRightIcon className="w-4 h-4 ml-2 inline" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStartGuide;
