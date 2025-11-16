import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../utils/axiosConfig';
import { 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  ClockIcon,
  UserGroupIcon,
  ArrowPathIcon
} from '@heroicons/react/24/solid';

export default function ReviewFlagStatistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/admin/residents/review-statistics');
      if (response.data.success) {
        setStats(response.data.statistics);
      }
    } catch (err) {
      console.error('Error fetching review statistics:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center">
          <ArrowPathIcon className="w-6 h-6 animate-spin text-blue-500" />
          <span className="ml-2 text-sm text-gray-600">Loading statistics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return null; // Silently fail to not disrupt the page
  }

  if (!stats) {
    return null;
  }

  const StatCard = ({ title, value, subtitle, icon: Icon, color, percentage }) => (
    <div className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${color} hover:shadow-lg transition-shadow duration-200`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
          )}
          {percentage !== undefined && (
            <p className="mt-1 text-xs font-semibold text-gray-700">{percentage}% of total</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('-500', '-100')}`}>
          <Icon className={`w-6 h-6 ${color.replace('border-', 'text-')}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Review Flagging Overview</h3>
        <button
          onClick={fetchStatistics}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          title="Refresh statistics"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Residents"
          value={stats.total_residents}
          icon={UserGroupIcon}
          color="border-blue-500"
        />
        
        <StatCard
          title="Flagged for Review"
          value={stats.flagged_for_review}
          subtitle="Requires attention"
          icon={ExclamationTriangleIcon}
          color="border-orange-500"
          percentage={stats.flagged_percentage}
        />
        
        <StatCard
          title="Active Residents"
          value={stats.active_residents}
          subtitle="Updated recently"
          icon={CheckCircleIcon}
          color="border-green-500"
        />
        
        <StatCard
          title="Never Active"
          value={stats.never_active}
          subtitle="No activity recorded"
          icon={ClockIcon}
          color="border-red-500"
        />
      </div>

      {/* Detailed breakdown */}
      {(stats.inactive_1_to_2_years > 0 || stats.inactive_over_2_years > 0) && (
        <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Inactivity Breakdown</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">1-2 years inactive:</span>
              <span className="ml-2 font-semibold text-gray-900">{stats.inactive_1_to_2_years}</span>
            </div>
            <div>
              <span className="text-gray-600">Over 2 years:</span>
              <span className="ml-2 font-semibold text-gray-900">{stats.inactive_over_2_years}</span>
            </div>
            <div>
              <span className="text-gray-600">Never active:</span>
              <span className="ml-2 font-semibold text-gray-900">{stats.never_active}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

