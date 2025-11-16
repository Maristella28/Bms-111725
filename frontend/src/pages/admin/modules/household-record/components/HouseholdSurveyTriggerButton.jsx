import React, { useState } from 'react';
import {
  PaperAirplaneIcon,
  CalendarIcon,
  BellAlertIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/solid';
import HouseholdSurveySystem from './HouseholdSurveySystem';
import HouseholdSurveyScheduler from './HouseholdSurveyScheduler';

const HouseholdSurveyTriggerButton = ({ household, variant = 'button', onSuccess }) => {
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleSurveySent = (survey) => {
    setShowSurveyModal(false);
    if (onSuccess) {
      onSuccess(survey);
    }
  };

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={() => setShowSurveyModal(true)}
          className="p-2 hover:bg-blue-50 rounded-lg transition group"
          title="Send Survey"
        >
          <PaperAirplaneIcon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
        </button>

        {showSurveyModal && (
          <HouseholdSurveySystem
            household={household}
            onClose={() => setShowSurveyModal(false)}
            onSurveySent={handleSurveySent}
          />
        )}
      </>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition flex items-center gap-2"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
          Survey Actions
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <button
              onClick={() => {
                setShowSurveyModal(true);
                setShowMenu(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-blue-50 transition flex items-center gap-3 border-b border-gray-100"
            >
              <PaperAirplaneIcon className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-gray-800">Send Survey Now</div>
                <div className="text-xs text-gray-600">Send to this household</div>
              </div>
            </button>

            <button
              onClick={() => {
                setShowScheduler(true);
                setShowMenu(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-purple-50 transition flex items-center gap-3"
            >
              <CalendarIcon className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-medium text-gray-800">Manage Schedules</div>
                <div className="text-xs text-gray-600">Automate surveys</div>
              </div>
            </button>
          </div>
        )}

        {showSurveyModal && (
          <HouseholdSurveySystem
            household={household}
            onClose={() => setShowSurveyModal(false)}
            onSurveySent={handleSurveySent}
          />
        )}

        {showScheduler && (
          <HouseholdSurveyScheduler
            onClose={() => setShowScheduler(false)}
          />
        )}

        {/* Click outside to close */}
        {showMenu && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
        )}
      </div>
    );
  }

  // Default button variant
  return (
    <>
      <button
        onClick={() => setShowSurveyModal(true)}
        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition flex items-center gap-2"
      >
        <PaperAirplaneIcon className="w-5 h-5" />
        Send Survey
      </button>

      {showSurveyModal && (
        <HouseholdSurveySystem
          household={household}
          onClose={() => setShowSurveyModal(false)}
          onSurveySent={handleSurveySent}
        />
      )}
    </>
  );
};

export default HouseholdSurveyTriggerButton;

