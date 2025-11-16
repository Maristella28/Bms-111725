import React from 'react';
import { XMarkIcon, LightBulbIcon, CheckCircleIcon, ChartBarIcon, ClockIcon, DocumentTextIcon, MapPinIcon, SparklesIcon } from '@heroicons/react/24/outline';

const SocialInsights = ({ 
  showExecutiveSummary, 
  setShowExecutiveSummary, 
  activePrograms, 
  totalBeneficiaries, 
  pendingPaymentCount, 
  draftPrograms, 
  averageHealthScore 
}) => {
  return (
    <>
      {showExecutiveSummary && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <LightBulbIcon className="w-7 h-7 text-yellow-500" />
              <span>Quick Insights - What You Need to Know</span>
            </h3>
            <button
              onClick={() => setShowExecutiveSummary(false)}
              className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full max-w-full overflow-hidden">
            {/* Key Insight 1 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-l-4 border-green-500 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircleIcon className="w-7 h-7 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-gray-800 mb-2 text-lg">Programs Performing Well</h4>
                  <p className="text-gray-600 leading-relaxed">
                    {activePrograms} programs are active and helping {totalBeneficiaries} families
                  </p>
                </div>
              </div>
            </div>

            {/* Key Insight 2 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-l-4 border-blue-500 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <ChartBarIcon className="w-7 h-7 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-gray-800 mb-2 text-lg">System Health</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Overall system health score is {averageHealthScore}/100
                  </p>
                </div>
              </div>
            </div>

            {/* Key Insight 3 */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border-l-4 border-yellow-500 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <ClockIcon className="w-7 h-7 text-yellow-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-gray-800 mb-2 text-lg">Pending Actions</h4>
                  <p className="text-gray-600 leading-relaxed">
                    {pendingPaymentCount} payments waiting for processing
                  </p>
                </div>
              </div>
            </div>

            {/* Key Insight 4 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-l-4 border-purple-500 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <DocumentTextIcon className="w-7 h-7 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-gray-800 mb-2 text-lg">Draft Programs</h4>
                  <p className="text-gray-600 leading-relaxed">
                    {draftPrograms} programs are in draft status
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What to Focus On */}
          <div className="mt-6 bg-gradient-to-br from-yellow-50 to-amber-50 border-l-4 border-yellow-400 p-6 rounded-xl">
            <h4 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center gap-2">
              <MapPinIcon className="w-5 h-5" /> What to Focus On Today:
            </h4>
            <ul className="space-y-2 text-gray-700 leading-relaxed">
              {pendingPaymentCount > 0 && (
                <li>• <strong>{pendingPaymentCount} payments</strong> are waiting - prioritize processing these</li>
              )}
              {draftPrograms > 0 && (
                <li>• <strong>{draftPrograms} programs</strong> are in draft - review and activate them</li>
              )}
              {averageHealthScore < 60 && (
                <li>• Program health is <strong>{averageHealthScore}/100</strong> - check low-performing programs</li>
              )}
              {averageHealthScore >= 80 && pendingPaymentCount === 0 && (
                <li className="flex items-center gap-2">
                  • <SparklesIcon className="w-4 h-4 text-yellow-600" /> Programs are performing excellently! Keep up the great work!
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default SocialInsights;