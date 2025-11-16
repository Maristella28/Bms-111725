import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function StatusDistributionChart({ summary }) {
  const data = [
    { name: 'Active', value: summary?.updateStatus?.Active || 0, fill: '#10b981' },
    { name: 'Outdated', value: summary?.updateStatus?.Outdated || 0, fill: '#f59e0b' },
    { name: 'Needs Verification', value: summary?.updateStatus?.['Needs Verification'] || 0, fill: '#ef4444' },
  ];
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <h5 className="text-md font-semibold text-gray-800 mb-3">Status Distribution</h5>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


