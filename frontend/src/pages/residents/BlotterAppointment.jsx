import React from 'react';
import { Link } from 'react-router-dom';
import { FaFileAlt, FaEdit, FaSearch, FaShieldAlt, FaGavel, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import Navbares from "../../components/Navbares";
import Sidebares from "../../components/Sidebares";
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';

const BlotterAppointment = () => {
  const { mainClasses } = useResponsiveLayout();
  
  return (
    <>
      <Navbares />
      <Sidebares />
      <main className={mainClasses}>
        {/* Simplified background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-green-200 to-teal-200 rounded-full opacity-15 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full opacity-10 animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="w-full max-w-7xl mx-auto space-y-10 relative z-10">
          
          {/* Enhanced Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl mb-4">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3L2 12H5V20H19V12H22L12 3M12 8.75A2.25 2.25 0 0,1 14.25 11A2.25 2.25 0 0,1 12 13.25A2.25 2.25 0 0,1 9.75 11A2.25 2.25 0 0,1 12 8.75M12 15C13.5 15 16.5 15.75 16.5 17.25V18H7.5V17.25C7.5 15.75 10.5 15 12 15Z"/>
              </svg>
            </div>
            <div className="flex items-center justify-center gap-4">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
                Blotter Management
              </h1>
              <button
                onClick={() => window.location.reload()}
                className="p-2 bg-green-100 hover:bg-green-200 rounded-full transition-colors duration-200"
                title="Refresh Page"
              >
                <svg 
                  className="w-5 h-5 text-green-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Professional dispute resolution and incident reporting system for our community
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Instructions Card */}
            <Link
              to="/residents/charterList"
              className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
            >
              <div className="mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FaFileAlt className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <h3 className="font-bold text-gray-800 text-lg mb-2">
                Blotter Instructions
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Learn the proper procedures and guidelines for filing barangay blotter reports and understanding your rights.
              </p>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span className="text-sm font-semibold text-blue-600">View Guidelines</span>
                <FaExclamationTriangle className="w-3 h-3 text-blue-500" />
              </div>
            </Link>

            {/* Generate Blotter Card */}
            <Link
              to="/residents/generateBlotter"
              className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
            >
              <div className="mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FaEdit className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <h3 className="font-bold text-gray-800 text-lg mb-2">
                Request Blotter Appointment
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Create and submit a new blotter report for incidents, disputes, or complaints within the barangay.
              </p>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span className="text-sm font-semibold text-green-600">Create Report</span>
                <FaGavel className="w-3 h-3 text-green-500" />
              </div>
            </Link>

            {/* Status Requests Card */}
            <Link
              to="/residents/statusBlotterRequests"
              className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
            >
              <div className="mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FaSearch className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <h3 className="font-bold text-gray-800 text-lg mb-2">
                Track Requests
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Monitor the status of your submitted blotter requests and view ticket numbers and admin responses.
              </p>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span className="text-sm font-semibold text-purple-600">View Status</span>
                <FaClock className="w-3 h-3 text-purple-500" />
              </div>
            </Link>
          </div>
          
          {/* Info Section */}
          <div className="text-center bg-white rounded-2xl p-8 border border-gray-100 shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FaCheckCircle className="text-green-500 text-2xl" />
              <h3 className="text-2xl font-bold text-gray-800">Professional Dispute Resolution</h3>
              <FaCheckCircle className="text-green-500 text-2xl" />
            </div>
            <p className="text-gray-600 max-w-4xl mx-auto text-lg leading-relaxed">
              Our barangay blotter system ensures fair and transparent handling of all community disputes and incidents. 
              All reports are processed professionally with proper documentation and follow-up procedures.
            </p>
          </div>
        </div>
      </main>
    </>
  );
};

export default BlotterAppointment;
