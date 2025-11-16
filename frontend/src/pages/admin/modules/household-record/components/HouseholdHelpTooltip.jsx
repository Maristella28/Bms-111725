import React, { useState, useRef, useEffect } from 'react';
import {
  InformationCircleIcon,
  XMarkIcon,
  QuestionMarkCircleIcon,
  BookOpenIcon,
  PlayIcon,
  LightBulbIcon,
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';

// Main tooltip component
export const HouseholdHelpTooltip = ({ 
  content, 
  position = 'top', 
  children, 
  className = '',
  maxWidth = '300px'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + 8;
        break;
    }

    // Adjust for viewport boundaries
    if (left < 8) left = 8;
    if (left + tooltipRect.width > viewportWidth - 8) {
      left = viewportWidth - tooltipRect.width - 8;
    }
    if (top < 8) top = 8;
    if (top + tooltipRect.height > viewportHeight - 8) {
      top = viewportHeight - tooltipRect.height - 8;
    }

    setTooltipPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    }
  }, [isVisible, position]);

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`inline-block ${className}`}
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg shadow-lg p-3 pointer-events-none"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            maxWidth: maxWidth
          }}
        >
          <div className="relative">
            {content}
            {/* Arrow */}
            <div className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
              position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' :
              position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' :
              position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' :
              'right-full top-1/2 -translate-y-1/2 -mr-1'
            }`} />
          </div>
        </div>
      )}
    </>
  );
};

// Quick help button component
export const HouseholdQuickHelpButton = ({ onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 hover:text-green-700 transition-colors duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${className}`}
    >
      <BookOpenIcon className="w-4 h-4" />
      Help Guide
    </button>
  );
};

// Help icon component
export const HouseholdHelpIcon = ({ 
  content, 
  position = 'top',
  className = ''
}) => {
  return (
    <HouseholdHelpTooltip content={content} position={position}>
      <InformationCircleIcon className={`w-4 h-4 text-gray-400 hover:text-green-600 cursor-help transition-colors duration-200 ${className}`} />
    </HouseholdHelpTooltip>
  );
};

// Feature explanation modal component
export const HouseholdFeatureExplanation = ({ 
  isOpen, 
  onClose, 
  feature, 
  content 
}) => {
  if (!isOpen) return null;

  const getFeatureIcon = (featureType) => {
    switch (featureType) {
      case 'household': return HomeIcon;
      case 'analytics': return ChartBarIcon;
      case 'search': return CogIcon;
      case 'management': return UserGroupIcon;
      default: return InformationCircleIcon;
    }
  };

  const getFeatureColor = (featureType) => {
    switch (featureType) {
      case 'household': return 'green';
      case 'analytics': return 'purple';
      case 'search': return 'orange';
      case 'management': return 'blue';
      default: return 'gray';
    }
  };

  const Icon = getFeatureIcon(feature?.type);
  const color = getFeatureColor(feature?.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r from-${color}-600 to-${color}-700 px-6 py-4`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{feature?.title || 'Feature Explanation'}</h2>
                <p className="text-white/80 text-sm">{feature?.subtitle || 'Learn more about this feature'}</p>
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

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {content}
        </div>
      </div>
    </div>
  );
};

// Predefined feature explanations
export const householdFeatureExplanations = {
  statistics: {
    type: 'analytics',
    title: 'Statistics Cards',
    subtitle: 'Understanding household metrics',
    content: (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900 mb-2">Key Metrics Explained</h3>
          <p className="text-purple-800 text-sm">
            The statistics cards provide a quick overview of your household data and community demographics.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <HomeIcon className="w-5 h-5 text-green-600 mr-2" />
              <h4 className="font-medium text-gray-900">Total Households</h4>
            </div>
            <p className="text-gray-600 text-sm">
              Shows the total number of registered households in your community. This helps track community growth and household formation.
            </p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <UserGroupIcon className="w-5 h-5 text-blue-600 mr-2" />
              <h4 className="font-medium text-gray-900">Total Members</h4>
            </div>
            <p className="text-gray-600 text-sm">
              Displays the total number of community members across all households. This gives you the overall population count.
            </p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <ChartBarIcon className="w-5 h-5 text-purple-600 mr-2" />
              <h4 className="font-medium text-gray-900">Average Household Size</h4>
            </div>
            <p className="text-gray-600 text-sm">
              Calculated by dividing total members by total households. This metric helps understand family composition patterns in your community.
            </p>
          </div>
        </div>
      </div>
    )
  },
  
  analytics: {
    type: 'analytics',
    title: 'Analytics Dashboard',
    subtitle: 'Comprehensive household insights',
    content: (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900 mb-2">Dashboard Features</h3>
          <p className="text-purple-800 text-sm">
            The analytics dashboard provides detailed insights into household demographics and community patterns.
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 text-sm mb-2">Key Performance Indicators (KPIs)</h4>
            <p className="text-gray-600 text-sm">
              Visual progress bars and metrics that show household distribution, member counts, and demographic breakdowns.
            </p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 text-sm mb-2">Demographic Analysis</h4>
            <p className="text-gray-600 text-sm">
              Detailed breakdowns of age distribution, civil status, gender distribution, and household size patterns.
            </p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 text-sm mb-2">Coverage Tracking</h4>
            <p className="text-gray-600 text-sm">
              Monitor how comprehensive your household data collection is compared to target goals.
            </p>
          </div>
        </div>
      </div>
    )
  },
  
  search: {
    type: 'search',
    title: 'Search & Filter System',
    subtitle: 'Finding households efficiently',
    content: (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-semibold text-orange-900 mb-2">Search Capabilities</h3>
          <p className="text-orange-800 text-sm">
            The search and filter system helps you quickly find specific households or demographic groups.
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 text-sm mb-2">Search Options</h4>
            <ul className="text-gray-600 text-sm space-y-1">
              <li>• Search by household ID</li>
              <li>• Search by household head name</li>
              <li>• Search by address</li>
              <li>• Real-time search results</li>
            </ul>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 text-sm mb-2">Filter Features</h4>
            <ul className="text-gray-600 text-sm space-y-1">
              <li>• Filter by household size</li>
              <li>• Filter by demographics</li>
              <li>• Clear all filters</li>
              <li>• Advanced filtering options</li>
            </ul>
          </div>
        </div>
      </div>
    )
  },
  
  management: {
    type: 'management',
    title: 'Household Management',
    subtitle: 'Creating and managing household records',
    content: (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Management Features</h3>
          <p className="text-blue-800 text-sm">
            Comprehensive tools for creating, editing, and managing household records effectively.
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 text-sm mb-2">Create Household</h4>
            <p className="text-gray-600 text-sm">
              Add new household records by selecting a household head, setting family size, and providing contact information.
            </p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 text-sm mb-2">Edit Records</h4>
            <p className="text-gray-600 text-sm">
              Update household information, reassign household heads, and modify family composition as needed.
            </p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 text-sm mb-2">View Details</h4>
            <p className="text-gray-600 text-sm">
              Click on any household record to view comprehensive information including demographics and contact details.
            </p>
          </div>
        </div>
      </div>
    )
  }
};

export default HouseholdHelpTooltip;
