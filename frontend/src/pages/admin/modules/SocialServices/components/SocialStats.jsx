import React from 'react';
import { 
  DocumentTextIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/solid';

const SocialStats = ({ 
  totalPrograms, 
  totalBeneficiaries, 
  totalBudget, 
  activePrograms, 
  completedPrograms, 
  pendingPayments, 
  averageHealthScore, 
  earliestStart, 
  latestEnd, 
  formatCurrency, 
  formatDate 
}) => {
  return (
    <>
      {/* Main Statistics Cards - 3x3 Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Programs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden transition-all duration-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Total Programs</div>
              <div className="text-4xl font-bold text-green-600">{totalPrograms}</div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <DocumentTextIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Beneficiaries */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden transition-all duration-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Total Beneficiaries</div>
              <div className="text-4xl font-bold text-blue-600">{totalBeneficiaries}</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <UserGroupIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Budget */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden transition-all duration-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Total Budget</div>
              <div className="text-4xl font-bold text-purple-600">{formatCurrency(totalBudget)}</div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Active Programs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden transition-all duration-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Active Programs</div>
              <div className="text-4xl font-bold text-green-600">{activePrograms}</div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Completed Programs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden transition-all duration-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Completed Programs</div>
              <div className="text-4xl font-bold text-orange-600">{completedPrograms}</div>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <ClockIcon className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Programs Date Range */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden transition-all duration-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Programs Date Range</div>
              <div className="text-lg font-bold text-purple-600">
                {earliestStart ? formatDate(earliestStart) : 'N/A'} - {latestEnd ? formatDate(latestEnd) : 'N/A'}
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CalendarIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden transition-all duration-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Pending Payments</div>
              <div className="text-4xl font-bold text-green-600">{pendingPayments}</div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Avg Health Score */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden transition-all duration-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Avg Health Score</div>
              <div className="text-4xl font-bold text-blue-600">{averageHealthScore}</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <DocumentTextIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Avg Beneficiaries/Program */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden transition-all duration-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Avg Beneficiaries/Program</div>
              <div className="text-4xl font-bold text-purple-600">{Math.round(totalBeneficiaries / totalPrograms) || 0}</div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <UserGroupIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Avg Budget/Program */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden transition-all duration-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Avg Budget/Program</div>
              <div className="text-4xl font-bold text-orange-600">{formatCurrency(totalBudget / totalPrograms) || 0}</div>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CurrencyDollarIcon className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SocialStats;