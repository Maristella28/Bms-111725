import React, { useState } from 'react';
import {
  PlayIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  XMarkIcon,
  DocumentTextIcon,
  EyeIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  CogIcon,
  LightBulbIcon,
  PencilIcon,
  ClockIcon,
  UserGroupIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const DocumentsQuickStartGuide = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Documents Records',
      icon: PlayIcon,
      description: 'Let\'s get you started with the documents management system in just a few minutes!',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">What you'll learn:</h3>
            <ul className="text-green-800 text-sm space-y-1">
              <li>• How to navigate document requests and records</li>
              <li>• How to process and approve requests</li>
              <li>• How to handle payments and confirmations</li>
              <li>• How to generate PDF certificates</li>
              <li>• How to use analytics and export data</li>
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
      id: 'explore-interface',
      title: 'Explore the Interface',
      icon: EyeIcon,
      description: 'The Documents Records interface has two main tabs: Requests and Records.',
      content: (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Main Interface Elements:</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Document Requests tab</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Document Records tab</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>Analytics dashboard</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Filter controls</span>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Try this:</h4>
            <p className="text-green-800 text-sm">
              Switch between the "Document Requests" and "Document Records" tabs to see the difference. 
              Requests show pending items, Records show completed ones.
            </p>
          </div>
        </div>
      ),
      action: 'Next: Process Requests',
      actionType: 'primary'
    },
    {
      id: 'process-requests',
      title: 'Process Document Requests',
      icon: PencilIcon,
      description: 'Learn how to review and process incoming document requests.',
      content: (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Steps to process a request:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">1</div>
                <span>Click on a request to view details</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">2</div>
                <span>Click the pencil icon to edit</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">3</div>
                <span>Set status (Approved/Rejected/Processing)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">4</div>
                <span>Set payment amount if approving</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">5</div>
                <span>Save changes</span>
              </div>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-900 mb-2">Important:</h4>
            <p className="text-red-800 text-sm">
              When approving a request, you must set a payment amount. This is required for the approval process.
            </p>
          </div>
        </div>
      ),
      action: 'Next: Handle Payments',
      actionType: 'primary'
    },
    {
      id: 'handle-payments',
      title: 'Handle Payments',
      icon: CurrencyDollarIcon,
      description: 'Learn how to confirm payments for approved document requests.',
      content: (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Payment confirmation process:</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                <div>
                  <h5 className="font-medium text-gray-900">Request Approved</h5>
                  <p className="text-gray-600 text-sm">Resident receives notification to make payment</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                <div>
                  <h5 className="font-medium text-gray-900">Payment Received</h5>
                  <p className="text-gray-600 text-sm">Resident makes payment and provides receipt</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                <div>
                  <h5 className="font-medium text-gray-900">Confirm Payment</h5>
                  <p className="text-gray-600 text-sm">Click the dollar icon to confirm payment</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Result:</h4>
            <p className="text-blue-800 text-sm">
              Once payment is confirmed, the request moves to Document Records and becomes ready for PDF generation.
            </p>
          </div>
        </div>
      ),
      action: 'Next: Generate PDFs',
      actionType: 'primary'
    },
    {
      id: 'generate-pdfs',
      title: 'Generate PDF Certificates',
      icon: DocumentTextIcon,
      description: 'Learn how to generate professional PDF certificates for completed requests.',
      content: (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">PDF generation process:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">1</div>
                <span>Ensure request is approved and paid</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">2</div>
                <span>Click the document icon to generate PDF</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">3</div>
                <span>Wait for PDF generation to complete</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">4</div>
                <span>View or download the generated PDF</span>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">PDF Features:</h4>
            <p className="text-green-800 text-sm">
              Generated PDFs include resident information, document details, official signatures, and barangay seal. 
              They can be viewed in browser or downloaded for printing.
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
      description: 'Explore the analytics dashboard to understand document processing trends and performance.',
      content: (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Analytics features:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Request trends over time</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Approval rates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>Payment collection rates</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>Processing time metrics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Revenue tracking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  <span>Document type distribution</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Scroll up to see:</h4>
            <p className="text-blue-800 text-sm">
              The analytics dashboard appears above the main table. Use the time period filters to analyze different time ranges.
            </p>
          </div>
        </div>
      ),
      action: 'Next: Export Data',
      actionType: 'primary'
    },
    {
      id: 'export-data',
      title: 'Export Data',
      icon: DocumentArrowDownIcon,
      description: 'Learn how to export document records for reporting and analysis.',
      content: (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Export options:</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-semibold">Excel</div>
                  <div>
                    <h5 className="font-medium text-gray-900">Excel Export</h5>
                    <p className="text-gray-600 text-sm">For spreadsheet analysis</p>
                  </div>
                </div>
                <button className="px-3 py-1 bg-green-600 text-white text-xs rounded-md">Export</button>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">Export requirements:</h4>
            <p className="text-yellow-800 text-sm">
              Excel export is only available in the Document Records tab and includes only finalized (paid) records. 
              Use filters to export specific subsets of data.
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
      description: 'Master the search and filtering capabilities to quickly find specific document requests.',
      content: (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Search & filter options:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Search by resident name, ID, or document type</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Filter by document type (Clearance, Permit, etc.)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Filter by status (Pending, Approved, etc.)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Filter by payment status</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Auto-refresh functionality</span>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Pro tip:</h4>
            <p className="text-green-800 text-sm">
              Use the document type buttons at the top of the table for quick filtering. 
              Enable auto-refresh to keep data updated automatically.
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
      description: 'Congratulations! You\'ve learned the basics of the Documents Records system.',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-900 mb-2">Well done!</h3>
            <p className="text-green-800">
              You now know how to process requests, handle payments, generate PDFs, view analytics, and export data.
            </p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">What's next?</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Start processing document requests</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Confirm payments for approved requests</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Generate PDF certificates</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Explore the analytics dashboard</span>
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
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">{currentStepData.title}</h2>
              <p className="text-green-100 text-sm">{currentStepData.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-green-200 transition-colors"
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
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
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
                          ? 'bg-green-100 text-green-900 border border-green-200'
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
                  : 'bg-green-600 text-white hover:bg-green-700'
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

export default DocumentsQuickStartGuide;
