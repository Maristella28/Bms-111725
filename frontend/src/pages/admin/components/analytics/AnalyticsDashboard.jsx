import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axiosInstance from '../../../../utils/axiosConfig';
import KpiCards from './KpiCards';
import StatusDistributionChart from './StatusDistributionChart';
import DemographicCharts from './DemographicCharts';
import DataQualityMetrics from './DataQualityMetrics';
import EnhancedTimeSeries from './EnhancedTimeSeries';
import CrossTabAnalysis from './CrossTabAnalysis';
import ExportAndSharing from './ExportAndSharing';
import AnalyticsExport from './AnalyticsExport';
import { toLineChartData, cacheGet, cacheSet } from '../../../../utils/analytics';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';

export default function AnalyticsDashboard({ onDrilldown }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Debounced filter updates
  const [debouncedYear, setDebouncedYear] = useState('');
  const [debouncedMonth, setDebouncedMonth] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedYear(year);
      setDebouncedMonth(month);
    }, 300);
    return () => clearTimeout(timer);
  }, [year, month]);

  const fetchAnalytics = useCallback(async () => {
    const cacheKey = `analytics-${debouncedYear}-${debouncedMonth}`;
    const cached = cacheGet(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes cache
      setSummary(cached.data);
      return;
    }

    setLoading(true);
    try {
      const params = {};
      if (debouncedYear) params.year = debouncedYear;
      if (debouncedMonth) params.month = debouncedMonth;
      
      const res = await axiosInstance.get('/admin/residents/analytics', { params, timeout: 20000 });
      const data = res.data.summary;
      
      setSummary(data);
      cacheSet(cacheKey, { data, timestamp: Date.now() });
    } catch (e) {
      console.error('Analytics fetch error:', e);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [debouncedYear, debouncedMonth]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const chartData = useMemo(() => toLineChartData(summary?.monthlyRegistrations || []), [summary]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'demographics', label: 'Demographics', icon: '👥' },
    { id: 'quality', label: 'Data Quality', icon: '🔍' },
    { id: 'trends', label: 'Trends', icon: '📈' },
    { id: 'analysis', label: 'Cross-Tab', icon: '🔬' },
    { id: 'export', label: 'Export', icon: '📤' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-4 md:p-6">
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-4 md:mb-6 items-center justify-between">
        <div>
          <h3 className="text-lg md:text-2xl font-bold text-gray-900">Residents Analytics Dashboard</h3>
          <p className="text-gray-600 text-sm">Comprehensive insights into resident demographics and community patterns</p>
        </div>
        <div className="flex gap-2">
          <select value={year} onChange={(e) => { setYear(e.target.value); setMonth(''); }} className="px-3 py-2 border rounded-lg text-sm">
            <option value="">All Years</option>
            {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - i).map((y) => (
              <option key={y} value={y.toString()}>{y}</option>
            ))}
          </select>
          <select value={month} onChange={(e) => setMonth(e.target.value)} disabled={!year} className="px-3 py-2 border rounded-lg text-sm">
            <option value="">All Months</option>
            {[{ value: '01', name: 'January' }, { value: '02', name: 'February' }, { value: '03', name: 'March' }, { value: '04', name: 'April' }, { value: '05', name: 'May' }, { value: '06', name: 'June' }, { value: '07', name: 'July' }, { value: '08', name: 'August' }, { value: '09', name: 'September' }, { value: '10', name: 'October' }, { value: '11', name: 'November' }, { value: '12', name: 'December' }].map(m => (
              <option key={m.value} value={m.value}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-6 text-center text-gray-500">Loading analytics…</div>
      ) : summary ? (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <KpiCards summary={summary} onDrilldown={onDrilldown} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <h5 className="text-md font-semibold text-gray-800 mb-3">Registrations Trend</h5>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="registrations" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <StatusDistributionChart summary={summary} />
              </div>

              {/* Drilldown buttons */}
              <div className="flex flex-wrap gap-2">
                <button onClick={() => onDrilldown?.({ update_status: 'active' })} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm">View Active</button>
                <button onClick={() => onDrilldown?.({ update_status: 'outdated' })} className="px-3 py-2 bg-amber-600 text-white rounded-lg text-sm">View Outdated</button>
                <button onClick={() => onDrilldown?.({ update_status: 'needs_verification' })} className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm">View Needs Verification</button>
              </div>
            </div>
          )}

          {/* Demographics Tab */}
          {activeTab === 'demographics' && (
            <DemographicCharts summary={summary} onDrilldown={onDrilldown} />
          )}

          {/* Data Quality Tab */}
          {activeTab === 'quality' && (
            <DataQualityMetrics summary={summary} onDrilldown={onDrilldown} />
          )}

          {/* Trends Tab */}
          {activeTab === 'trends' && (
            <EnhancedTimeSeries summary={summary} onDrilldown={onDrilldown} />
          )}

          {/* Cross-Tab Analysis Tab */}
          {activeTab === 'analysis' && (
            <CrossTabAnalysis summary={summary} onDrilldown={onDrilldown} />
          )}

          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <ExportAndSharing summary={summary} />
              <AnalyticsExport summary={summary} />
            </div>
          )}
        </>
      ) : (
        <div className="p-6 text-center text-gray-500">No analytics available</div>
      )}
    </div>
  );
}


