import React from 'react';

const KpiCard = ({ label, value, sublabel, icon = null, color = 'green', trend = null, onClick = null }) => (
  <div 
    className={`bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className={`text-xs font-semibold text-${color}-600 uppercase tracking-wide truncate`}>{label}</p>
          {trend && (
            <span className={`text-xs font-bold ${trend.direction === 'up' ? 'text-green-600' : trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
              {trend.direction === 'up' ? '↗' : trend.direction === 'down' ? '↘' : '→'} {trend.percentage}%
            </span>
          )}
        </div>
        <p className={`text-xl font-bold text-${color}-700`}>{value}</p>
        {sublabel && <p className={`text-xs text-${color}-500 mt-1 truncate`}>{sublabel}</p>}
      </div>
      <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
    </div>
  </div>
);

export default function KpiCards({ summary, onDrilldown }) {
  const total = summary?.total || 0;
  const active = summary?.updateStatus?.Active || 0;
  const outdated = summary?.updateStatus?.Outdated || 0;
  const needs = summary?.updateStatus?.['Needs Verification'] || 0;
  const missing = summary?.missingCritical || 0;
  
  // Use real trend data from backend
  const trends = summary?.trends || {};
  const totalTrends = trends.total || {};
  const activeTrends = trends.active || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      <KpiCard 
        label="Total Residents" 
        value={total} 
        sublabel="Registered members" 
        color="green" 
        trend={{
          direction: totalTrends.monthlyChange > 0 ? 'up' : totalTrends.monthlyChange < 0 ? 'down' : 'neutral',
          percentage: totalTrends.monthlyChange ? `${totalTrends.monthlyChange > 0 ? '+' : ''}${totalTrends.monthlyChange}` : '0'
        }}
        onClick={() => onDrilldown?.({})}
      />
      <KpiCard 
        label="Active Records" 
        value={active} 
        sublabel="Updated within 6 months" 
        color="emerald" 
        trend={{
          direction: activeTrends.monthlyChange > 0 ? 'up' : activeTrends.monthlyChange < 0 ? 'down' : 'neutral',
          percentage: activeTrends.monthlyChange ? `${activeTrends.monthlyChange > 0 ? '+' : ''}${activeTrends.monthlyChange}` : '0'
        }}
        onClick={() => onDrilldown?.({ update_status: 'active' })}
      />
      <KpiCard 
        label="Outdated" 
        value={outdated} 
        sublabel="6-12 months" 
        color="amber" 
        trend={{
          direction: 'neutral',
          percentage: '0'
        }}
        onClick={() => onDrilldown?.({ update_status: 'outdated' })}
      />
      <KpiCard 
        label="Needs Verification" 
        value={needs} 
        sublabel="Older than 12 months" 
        color="red" 
        trend={{
          direction: 'neutral',
          percentage: '0'
        }}
        onClick={() => onDrilldown?.({ update_status: 'needs_verification' })}
      />
    </div>
  );
}


