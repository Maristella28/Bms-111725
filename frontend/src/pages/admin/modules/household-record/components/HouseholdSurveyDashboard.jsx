import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CalendarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  BellAlertIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/solid';
import api from '../../../../../utils/axiosConfig';

const StatCard = ({ label, value, icon, bgColor, textColor }) => (
  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-600 mb-1">{label}</div>
        <div className={`text-3xl font-bold ${textColor}`}>{value}</div>
      </div>
      <div className={`p-4 rounded-xl ${bgColor}`}>
        {icon}
      </div>
    </div>
  </div>
);

const HouseholdSurveyDashboard = ({ onViewSurvey, onSendNewSurvey }) => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    expired: 0,
    responseRate: 0,
  });
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');

  useEffect(() => {
    fetchSurveys();
    fetchStats();
  }, [filter, timeFilter]);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/household-surveys', {
        params: {
          status: filter !== 'all' ? filter : undefined,
          time_period: timeFilter !== 'all' ? timeFilter : undefined,
        },
      });
      setSurveys(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch surveys:', err);
      setSurveys([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/household-surveys/statistics');
      setStats(response.data.data || {
        total: 0,
        completed: 0,
        pending: 0,
        expired: 0,
        responseRate: 0,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const getSurveyStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
            <CheckCircleIcon className="w-3 h-3" />
            Completed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
            <ClockIcon className="w-3 h-3" />
            Pending
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
            <XCircleIcon className="w-3 h-3" />
            Expired
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
            <PaperAirplaneIcon className="w-3 h-3" />
            Sent
          </span>
        );
      default:
        return null;
    }
  };

  const getUrgencyIndicator = (survey) => {
    if (survey.status === 'expired') {
      return (
        <div className="flex items-center gap-1 text-red-600 text-xs">
          <ExclamationTriangleIcon className="w-4 h-4" />
          Expired
        </div>
      );
    }
    
    if (survey.status === 'pending') {
      const daysLeft = Math.ceil((new Date(survey.expires_at) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 7) {
        return (
          <div className="flex items-center gap-1 text-orange-600 text-xs">
            <BellAlertIcon className="w-4 h-4" />
            {daysLeft} days left
          </div>
        );
      }
    }
    return null;
  };

  const filteredSurveys = surveys.filter(survey => {
    const searchLower = searchTerm.toLowerCase();
    return (
      survey.household_no?.toLowerCase().includes(searchLower) ||
      survey.head_name?.toLowerCase().includes(searchLower) ||
      survey.survey_type?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Surveys"
          value={stats.total}
          icon={<DocumentTextIcon className="w-6 h-6 text-blue-600" />}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={<CheckCircleIcon className="w-6 h-6 text-green-600" />}
          bgColor="bg-green-50"
          textColor="text-green-600"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={<ClockIcon className="w-6 h-6 text-yellow-600" />}
          bgColor="bg-yellow-50"
          textColor="text-yellow-600"
        />
        <StatCard
          label="Expired"
          value={stats.expired}
          icon={<XCircleIcon className="w-6 h-6 text-red-600" />}
          bgColor="bg-red-50"
          textColor="text-red-600"
        />
        <StatCard
          label="Response Rate"
          value={`${stats.responseRate}%`}
          icon={<ChartBarIcon className="w-6 h-6 text-purple-600" />}
          bgColor="bg-purple-50"
          textColor="text-purple-600"
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by household, name, or survey type..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="expired">Expired</option>
              <option value="sent">Sent</option>
            </select>
          </div>

          {/* Time Filter */}
          <div>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
        </div>
      </div>

      {/* Surveys List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5 text-blue-600" />
            Survey Records
          </h3>
          <button
            onClick={fetchSurveys}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Refresh"
          >
            <ArrowPathIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <ArrowPathIcon className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-3" />
              <div className="text-gray-600">Loading surveys...</div>
            </div>
          ) : filteredSurveys.length === 0 ? (
            <div className="p-12 text-center">
              <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <div className="text-gray-600">No surveys found</div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Household</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Head Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Survey Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Sent Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Expires</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Method</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSurveys.map((survey) => (
                  <tr key={survey.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm">{survey.household_no}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{survey.head_name || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{survey.survey_type_label}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {getSurveyStatusBadge(survey.status)}
                        {getUrgencyIndicator(survey)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">
                        {new Date(survey.sent_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">
                        {new Date(survey.expires_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600 capitalize">
                        {survey.notification_method}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onViewSurvey(survey)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition group"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                        </button>
                        {survey.status === 'pending' && (
                          <button
                            onClick={() => onSendNewSurvey(survey.household)}
                            className="p-2 hover:bg-green-50 rounded-lg transition group"
                            title="Send Reminder"
                          >
                            <BellAlertIcon className="w-4 h-4 text-gray-600 group-hover:text-green-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default HouseholdSurveyDashboard;

