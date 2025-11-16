import React from 'react';
import { ChevronUpIcon, ChevronDownIcon, TrophyIcon } from '@heroicons/react/24/outline';

const SocialTable = ({ 
  topPrograms, 
  sortConfig, 
  handleSort, 
  getBeneficiariesByProgram, 
  getProgramHealthScore, 
  getProgramPaymentRate, 
  getProgramCompletionRate, 
  getProgramEfficiencyScore, 
  formatCurrency, 
  formatDate 
}) => {
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ChevronUpIcon className="w-4 h-4 opacity-30" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUpIcon className="w-4 h-4 text-green-600" /> : 
      <ChevronDownIcon className="w-4 h-4 text-green-600" />;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8 w-full">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
        <h4 className="text-xl font-bold text-gray-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          Top Performing Programs
        </h4>
        <div className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
          Ranked by overall performance score
        </div>
      </div>
      
      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm min-w-full">
          <thead className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-gray-200">
            <tr>
              <th 
                className="px-6 py-4 text-left font-bold text-emerald-800 cursor-pointer hover:bg-emerald-100 transition-colors duration-200 min-w-[100px]"
                onClick={() => handleSort('rank')}
              >
                <div className="flex items-center gap-2">
                  Rank
                  {getSortIcon('rank')}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left font-bold text-emerald-800 cursor-pointer hover:bg-emerald-100 transition-colors duration-200 min-w-[250px]"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Program
                  {getSortIcon('name')}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left font-bold text-emerald-800 cursor-pointer hover:bg-emerald-100 transition-colors duration-200 min-w-[120px]"
                onClick={() => handleSort('score')}
              >
                <div className="flex items-center gap-2">
                  Score
                  {getSortIcon('score')}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left font-bold text-emerald-800 cursor-pointer hover:bg-emerald-100 transition-colors duration-200 min-w-[140px]"
                onClick={() => handleSort('beneficiaries')}
              >
                <div className="flex items-center gap-2">
                  Beneficiaries
                  {getSortIcon('beneficiaries')}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left font-bold text-emerald-800 cursor-pointer hover:bg-emerald-100 transition-colors duration-200 min-w-[130px]"
                onClick={() => handleSort('payment')}
              >
                <div className="flex items-center gap-2">
                  Payment
                  {getSortIcon('payment')}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left font-bold text-emerald-800 cursor-pointer hover:bg-emerald-100 transition-colors duration-200 min-w-[140px]"
                onClick={() => handleSort('completion')}
              >
                <div className="flex items-center gap-2">
                  Completion
                  {getSortIcon('completion')}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left font-bold text-emerald-800 cursor-pointer hover:bg-emerald-100 transition-colors duration-200 min-w-[130px]"
                onClick={() => handleSort('efficiency')}
              >
                <div className="flex items-center gap-2">
                  Efficiency
                  {getSortIcon('efficiency')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {topPrograms.map((p, index) => {
              const beneficiaries = getBeneficiariesByProgram(p.id);
              const healthScore = getProgramHealthScore(p.id);
              const paymentRate = getProgramPaymentRate(p.id);
              const completionRate = getProgramCompletionRate(p.id);
              const efficiencyScore = getProgramEfficiencyScore(p.id);
              
              return (
                <tr key={p.id} className="hover:bg-emerald-50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-bold rounded-full flex items-center justify-center">
                        {index + 1}
                      </span>
                      {index < 3 && (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                          'bg-gradient-to-br from-amber-600 to-amber-800'
                        }`}>
                          <TrophyIcon className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 text-base truncate">{p.name}</div>
                      <div className="text-sm text-gray-500 truncate">{p.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-bold text-emerald-600">{healthScore}</div>
                      <div className="text-sm text-gray-500">/100</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-base font-semibold text-gray-900">{beneficiaries.length}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="text-base font-semibold text-green-600">{paymentRate}%</div>
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="text-base font-semibold text-blue-600">{completionRate}%</div>
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="text-base font-semibold text-purple-600">{efficiencyScore}%</div>
                      <div className="w-2.5 h-2.5 bg-purple-500 rounded-full"></div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SocialTable;