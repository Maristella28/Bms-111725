import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function DemographicCharts({ summary, onDrilldown }) {
  const genderData = Object.entries(summary?.gender || {}).map(([name, value]) => ({ name, value }));
  const civilStatusData = Object.entries(summary?.civilStatus || {}).map(([name, value]) => ({ name, value }));
  const ageGroupsData = Object.entries(summary?.ageGroups || {}).map(([name, value]) => ({ name, value }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-blue-600">{`Count: ${payload[0].value}`}</p>
          <p className="text-gray-600">{`Percentage: ${((payload[0].value / summary?.total) * 100).toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Gender Distribution */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <h5 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
          👥 Gender Distribution
          <button 
            onClick={() => onDrilldown?.({})}
            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
          >
            View All
          </button>
        </h5>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={genderData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              onClick={(data) => onDrilldown?.({ gender: data.name.toLowerCase() })}
            >
              {genderData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Civil Status Distribution */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <h5 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
          💍 Civil Status
          <button 
            onClick={() => onDrilldown?.({})}
            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
          >
            View All
          </button>
        </h5>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={civilStatusData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              fill="#3b82f6"
              onClick={(data) => onDrilldown?.({ civil_status: data.name.toLowerCase() })}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Age Groups Distribution */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <h5 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
          🎂 Age Groups
          <button 
            onClick={() => onDrilldown?.({})}
            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
          >
            View All
          </button>
        </h5>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={ageGroupsData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" fontSize={12} />
            <YAxis dataKey="name" type="category" fontSize={10} width={80} />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              fill="#10b981"
              onClick={(data) => onDrilldown?.({ age_group: data.name })}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
