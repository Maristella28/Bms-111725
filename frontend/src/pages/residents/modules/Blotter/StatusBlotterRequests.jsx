import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaFileAlt, FaClock, FaCheckCircle, FaTimes, FaSpinner, FaTicketAlt, FaComments, FaCalendarAlt, FaIdCard, FaExclamationTriangle } from 'react-icons/fa';
import axios from '../../../../utils/axiosConfig';
import Navbares from '../../../../components/Navbares';
import Sidebares from '../../../../components/Sidebares';

const StatusBlotterRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        // Fetch all blotter requests for the logged-in resident
        const res = await axios.get('/blotter-requests');
        setRequests(res.data);
      } catch (err) {
        console.error('Failed to load blotter requests:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <FaCheckCircle className="w-4 h-4" />;
      case 'pending':
        return <FaClock className="w-4 h-4" />;
      case 'rejected':
        return <FaTimes className="w-4 h-4" />;
      case 'processing':
        return <FaSpinner className="w-4 h-4 animate-spin" />;
      default:
        return <FaExclamationTriangle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Navbares />
      <Sidebares />
      <main className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen ml-64 pt-36 px-6 pb-16 font-sans relative overflow-hidden">
        {/* Simplified background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-green-200 to-teal-200 rounded-full opacity-15 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full opacity-10 animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="w-full max-w-7xl mx-auto space-y-10 relative z-10">
          
          {/* Back Button */}
          <div className="mb-6">
            <Link
              to="/residents/blotterAppointment"
              className="inline-flex items-center bg-white text-gray-700 hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-100"
            >
              <FaArrowLeft className="mr-2" />
              Back to Blotter Management
            </Link>
          </div>

          {/* Enhanced Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl mb-4">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9Z"/>
              </svg>
            </div>
            <div className="flex items-center justify-center gap-4">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
                Blotter Requests
              </h1>
              <button
                onClick={() => window.location.reload()}
                className="p-2 bg-green-100 hover:bg-green-200 rounded-full transition-colors duration-200"
                title="Refresh Requests"
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
              Track and monitor the status of your submitted blotter reports and incidents
            </p>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaFileAlt className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-xl">Request History</h2>
                  <p className="text-white/80 text-sm">All your submitted blotter requests and their current status</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 text-lg font-medium">Loading your requests...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaFileAlt className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Blotter Requests Found</h3>
                  <p className="text-gray-500 mb-6">You haven't submitted any blotter requests yet.</p>
                  <Link
                    to="/residents/generateBlotter"
                    className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
                  >
                    <FaFileAlt className="mr-2" />
                    Create New Request
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <FaIdCard className="w-4 h-4 text-gray-500" />
                            Request ID
                          </div>
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <FaCheckCircle className="w-4 h-4 text-gray-500" />
                            Status
                          </div>
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <FaTicketAlt className="w-4 h-4 text-gray-500" />
                            Ticket Number
                          </div>
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <FaComments className="w-4 h-4 text-gray-500" />
                            Staff Message
                          </div>
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="w-4 h-4 text-gray-500" />
                            Created Date
                          </div>
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <FaCheckCircle className="w-4 h-4 text-gray-500" />
                            Approved Scheduled Date
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {requests.map((req, index) => (
                        <tr key={req.id} className="hover:bg-gray-50/50 transition-colors duration-200">
                          <td className="py-6 px-6">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                {req.id}
                              </div>
                              <span className="ml-3 font-medium text-gray-900">#{req.id}</span>
                            </div>
                          </td>
                          <td className="py-6 px-6">
                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(req.status)}`}>
                              {getStatusIcon(req.status)}
                              {req.status}
                            </span>
                          </td>
                          <td className="py-6 px-6">
                            {req.ticket_number ? (
                              <div className="flex items-center gap-2">
                                <FaTicketAlt className="w-4 h-4 text-gray-400" />
                                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{req.ticket_number}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">Not assigned</span>
                            )}
                          </td>
                          <td className="py-6 px-6">
                            {req.admin_message ? (
                              <div className="max-w-xs">
                                <p className="text-sm text-gray-700 line-clamp-2">{req.admin_message}</p>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">No message</span>
                            )}
                          </td>
                          <td className="py-6 px-6">
                            <div className="flex items-center gap-2">
                              <FaCalendarAlt className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">{formatDate(req.created_at)}</span>
                            </div>
                          </td>
                          <td className="py-6 px-6">
                            {req.approved_date ? (
                              <div className="flex items-center gap-2">
                                <FaCheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-gray-700">{formatDate(req.approved_date)}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">Not scheduled</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          {!loading && requests.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Total Requests</p>
                    <p className="text-3xl font-bold text-gray-900">{requests.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                    <FaFileAlt className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Approved</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {requests.filter(req => req.status?.toLowerCase() === 'approved').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                    <FaCheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Pending</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {requests.filter(req => req.status?.toLowerCase() === 'pending').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center">
                    <FaClock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Rejected</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {requests.filter(req => req.status?.toLowerCase() === 'rejected').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center">
                    <FaTimes className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default StatusBlotterRequests;