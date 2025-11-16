import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../utils/axiosConfig';
import Navbares from '../../../../components/Navbares';
import Sidebares from '../../../../components/Sidebares';
import { useResponsiveLayout } from '../../../../hooks/useResponsiveLayout';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  EyeIcon,
  ArrowPathIcon,
  ChartBarIcon,
  StarIcon,
  BellIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const MyBenefits = () => {
  const navigate = useNavigate();
  const { mainClasses } = useResponsiveLayout();
  const [loading, setLoading] = useState(true);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [sortBy, setSortBy] = useState('date');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [beneficiariesRes, submissionsRes] = await Promise.allSettled([
          axiosInstance.get('/my-benefits'),
          axiosInstance.get('/my-submissions')
        ]);

        const beneficiariesData = beneficiariesRes.status === 'fulfilled' ? beneficiariesRes.value.data : { beneficiaries: [] };
        const submissionsData = submissionsRes.status === 'fulfilled' ? submissionsRes.value.data : { submissions: [] };
        
        setBeneficiaries(beneficiariesData?.beneficiaries || []);
        setSubmissions(submissionsData?.submissions || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper functions
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': 
      case 'under_review': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected': 
      case 'denied': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return <CheckCircleIcon className="w-4 h-4" />;
      case 'pending': return <ClockIcon className="w-4 h-4" />;
      case 'processing': 
      case 'under_review': return <CogIcon className="w-4 h-4" />;
      case 'rejected': 
      case 'denied': return <ExclamationTriangleIcon className="w-4 h-4" />;
      default: return <DocumentTextIcon className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Filter and sort data
  const filteredBeneficiaries = beneficiaries.filter(beneficiary => {
    const matchesSearch = beneficiary.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          beneficiary.beneficiary_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          beneficiary.assistance_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || beneficiary.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.form?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          submission.status?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || submission.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Sort data
  const sortedBeneficiaries = [...filteredBeneficiaries].sort((a, b) => {
    switch (sortBy) {
      case 'amount': return (b.amount || 0) - (a.amount || 0);
      case 'name': return (a.name || '').localeCompare(b.name || '');
      case 'status': return (a.status || '').localeCompare(b.status || '');
      default: return new Date(b.submitted_at || 0) - new Date(a.submitted_at || 0);
    }
  });

  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    switch (sortBy) {
      case 'status': return (a.status || '').localeCompare(b.status || '');
      case 'title': return (a.form?.title || '').localeCompare(b.form?.title || '');
      default: return new Date(b.submitted_at || 0) - new Date(a.submitted_at || 0);
    }
  });

  const hasEnrollments = beneficiaries.length > 0;
  const hasSubmissions = submissions.length > 0;
  const hasAnyActivity = hasEnrollments || hasSubmissions;

  // Calculate statistics
  const totalBenefits = beneficiaries.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  const approvedBenefits = beneficiaries.filter(b => b.status?.toLowerCase() === 'approved').length;
  const pendingApplications = submissions.filter(s => s.status?.toLowerCase() === 'pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbares />
      <Sidebares />
      <main className={mainClasses}>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-green-200 to-teal-200 rounded-full opacity-15 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full opacity-10 animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="w-full max-w-[98%] mx-auto space-y-8 relative z-10">
          {/* Enhanced Header with Actions */}
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl mb-4">
              <StarIcon className="w-10 h-10 text-white" />
            </div>
            <div className="flex items-center justify-center gap-4">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
                My Benefits
              </h1>
              <button
                onClick={() => window.location.reload()}
                className="p-2 bg-green-100 hover:bg-green-200 rounded-full transition-colors duration-200"
                title="Refresh Benefits"
              >
                <ArrowPathIcon className="w-5 h-5 text-green-600" />
              </button>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Track your program enrollments, monitor application status, and manage your benefits
            </p>
          </div>

          {/* Search and Filter Bar */}
          {hasAnyActivity && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search programs, applications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    />
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="name">Sort by Name</option>
                    <option value="status">Sort by Status</option>
                    <option value="amount">Sort by Amount</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          {hasAnyActivity && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setSelectedTab('overview')}
                  className={`flex-1 px-6 py-4 font-semibold transition-all duration-200 ${
                    selectedTab === 'overview'
                      ? 'bg-green-50 text-green-700 border-b-2 border-green-500'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <ChartBarIcon className="w-5 h-5" />
                    Overview
                  </div>
                </button>
                <button
                  onClick={() => setSelectedTab('benefits')}
                  className={`flex-1 px-6 py-4 font-semibold transition-all duration-200 ${
                    selectedTab === 'benefits'
                      ? 'bg-green-50 text-green-700 border-b-2 border-green-500'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircleIcon className="w-5 h-5" />
                    Benefits ({beneficiaries.length})
                  </div>
                </button>
                <button
                  onClick={() => setSelectedTab('applications')}
                  className={`flex-1 px-6 py-4 font-semibold transition-all duration-200 ${
                    selectedTab === 'applications'
                      ? 'bg-green-50 text-green-700 border-b-2 border-green-500'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <DocumentTextIcon className="w-5 h-5" />
                    Applications ({submissions.length})
                  </div>
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg font-medium">Loading Your Benefits</p>
              <p className="text-gray-400 mt-1">Please wait while we fetch your information...</p>
            </div>
          )}

          {!loading && !hasAnyActivity && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">No Program Activity Yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                You haven't enrolled in any programs or submitted any applications yet. 
                Browse available programs and apply to start tracking your benefits here.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate('/residents/enrolledPrograms')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  List of the Enrolled Program
                </button>
                <button
                  onClick={() => navigate('/residents/projects')}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  View Projects
                </button>
              </div>
            </div>
          )}

          {!loading && hasAnyActivity && (
            <div className="space-y-8">
              {/* Tab Content */}
              {selectedTab === 'overview' && (
                <>
                  {/* Enhanced Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                          <CheckCircleIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Enrolled Programs</p>
                          <p className="text-2xl font-bold text-gray-900">{beneficiaries.length}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                          <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Applications Submitted</p>
                          <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                          <CurrencyDollarIcon className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Total Benefits</p>
                          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBenefits)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center">
                          <ClockIcon className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Pending Applications</p>
                          <p className="text-2xl font-bold text-gray-900">{pendingApplications}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
                      <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                        <BellIcon className="w-5 h-5" />
                        Recent Activity
                      </h2>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {[...beneficiaries, ...submissions]
                          .sort((a, b) => new Date(b.submitted_at || b.created_at || 0) - new Date(a.submitted_at || a.created_at || 0))
                          .slice(0, 5)
                          .map((item, index) => (
                            <div key={`${item.id}-${index}`} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                item.name ? 'bg-green-100' : 'bg-blue-100'
                              }`}>
                                {item.name ? (
                                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                ) : (
                                  <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">
                                  {item.name || item.form?.title || 'Application Form'}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {item.name ? 'Benefit Program' : 'Application Submission'} • {formatDate(item.submitted_at || item.created_at)}
                                </p>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(item.status)}
                                  {item.status?.replace('_', ' ').toUpperCase()}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Benefits Tab */}
              {selectedTab === 'benefits' && (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                    <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5" />
                      Enrolled Programs ({sortedBeneficiaries.length})
                    </h2>
                  </div>
                  <div className="p-6">
                    {sortedBeneficiaries.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircleIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Benefits Found</h3>
                        <p className="text-gray-600 mb-4">No benefits match your current search criteria.</p>
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setFilterStatus('all');
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                        >
                          Clear Filters
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {sortedBeneficiaries.map((beneficiary, index) => (
                          <div key={beneficiary.id} className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-green-300">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{beneficiary.name}</h3>
                                <div className="flex items-center gap-3 text-sm mb-3">
                                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-medium">
                                    {beneficiary.beneficiary_type || beneficiary.beneficiaryType}
                                  </span>
                                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-medium">
                                    {beneficiary.assistance_type || beneficiary.assistanceType}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <CalendarIcon className="w-4 h-4" />
                                  <span>Enrolled: {formatDate(beneficiary.created_at || beneficiary.enrolled_at)}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-green-600 mb-2">
                                  {formatCurrency(beneficiary.amount)}
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(beneficiary.status)}`}>
                                  {getStatusIcon(beneficiary.status)}
                                  {beneficiary.status?.toUpperCase()}
                                </div>
                              </div>
                            </div>
                            {beneficiary.remarks && (
                              <div className="bg-white p-4 rounded-lg border border-gray-100">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Notes:</span> {beneficiary.remarks}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Applications Tab */}
              {selectedTab === 'applications' && (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                    <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                      <DocumentTextIcon className="w-5 h-5" />
                      Application Submissions ({sortedSubmissions.length})
                    </h2>
                  </div>
                  <div className="p-6">
                    {sortedSubmissions.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Applications Found</h3>
                        <p className="text-gray-600 mb-4">No applications match your current search criteria.</p>
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setFilterStatus('all');
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                        >
                          Clear Filters
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {sortedSubmissions.map((submission, index) => (
                          <div key={submission.id} className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                  {submission.form?.title || 'Application Form'}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                  <CalendarIcon className="w-4 h-4" />
                                  <span>Submitted: {formatDate(submission.submitted_at)}</span>
                                </div>
                                {submission.form?.program && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-xs font-medium">
                                      {submission.form.program.name}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 mb-2 ${getStatusColor(submission.status)}`}>
                                  {getStatusIcon(submission.status)}
                                  {submission.status?.replace('_', ' ').toUpperCase()}
                                </div>
                                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                                  <EyeIcon className="w-4 h-4" />
                                  View Details
                                </button>
                              </div>
                            </div>
                            {submission.admin_notes && (
                              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Admin Notes:</span> {submission.admin_notes}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => navigate('/residents/enrolledPrograms')}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircleIcon className="w-5 h-5" />
                      <span>View All Programs</span>
                    </div>
                  </button>
                  <button
                    onClick={() => navigate('/residents/projects')}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <DocumentTextIcon className="w-5 h-5" />
                      <span>Browse Projects</span>
                    </div>
                  </button>
                  <button
                    onClick={() => navigate('/residents/modules/Programs/ProgramAnnouncements')}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <BellIcon className="w-5 h-5" />
                      <span>Program Announcements</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyBenefits;
