import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Navbar from '../../../../components/Navbar';
import Sidebar from '../../../../components/Sidebar';
import ResidentsVerificationTable from './ResidentsVerificationTable';

const ResidentsVerificationPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/admin/residentsRecords');
  };

  const handleRefresh = () => {
    // This will be handled by the ResidentsVerificationTable component
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 ml-64">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-white via-gray-50 to-white shadow-lg border-b-2 border-gray-200">
            <div className="max-w-[95%] xl:max-w-[1800px] mx-auto px-8">
              <div className="flex items-center justify-between h-20">
                <div className="flex items-center gap-4">
                  {/* Enhanced Back Button */}
                  <button
                    onClick={handleBack}
                    className="group relative flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-x-1 focus:outline-none focus:ring-4 focus:ring-blue-500/40"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                    <ArrowLeftIcon className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300" />
                    <span className="font-semibold relative z-10">Back to Residents Records</span>
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Residents Verification
                    </h1>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-[95%] xl:max-w-[1800px] mx-auto px-8 py-8">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Page Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6">
                {/* Back Button */}
                <div className="mb-4">
                  <button
                    onClick={handleBack}
                    className="group relative flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-x-1 focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    <ArrowLeftIcon className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300" />
                    <span className="font-semibold">Back to Residents Records</span>
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Residents Verification Management
                    </h2>
                    <p className="text-blue-100">
                      Review and approve resident verification requests
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                      <span className="text-white text-sm font-medium">
                        Verification Center
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table Component */}
              <div className="p-6">
                <ResidentsVerificationTable 
                  showVerification={true} 
                  onRefresh={handleRefresh}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentsVerificationPage;
