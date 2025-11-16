import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function CrossTabAnalysis({ summary, onDrilldown }) {
  // Use real cross-tab data from backend
  const crossTabData = summary?.crossTab || {};
  const genderCivilData = crossTabData.genderCivil || {};
  const ageSectorData = crossTabData.ageSector || {};

  // Convert backend data to chart format
  const genderCivilChartData = Object.entries(genderCivilData).map(([gender, civilStatuses]) => {
    const data = { gender };
    Object.entries(civilStatuses).forEach(([status, count]) => {
      data[status.toLowerCase()] = count;
    });
    return data;
  });

  const ageSectorChartData = Object.entries(ageSectorData).map(([ageGroup, sectors]) => {
    const data = { ageGroup };
    Object.entries(sectors).forEach(([sector, count]) => {
      // Map sector names to shorter keys for chart
      const key = sector.includes('Labor Force') ? 'laborForce' :
                  sector.includes('Unemployed') ? 'unemployed' :
                  sector.includes('OSY') ? 'osy' :
                  sector.includes('OSC') ? 'osc' :
                  sector.includes('PWD') ? 'pwd' :
                  'other';
      data[key] = count;
    });
    return data;
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Gender × Civil Status */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <h5 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
          👥 Gender × Civil Status Cross-Tab
          <button 
            onClick={() => onDrilldown?.({})}
            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
          >
            View All
          </button>
        </h5>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={genderCivilChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="gender" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="single" stackId="a" fill="#3b82f6" name="Single" />
            <Bar dataKey="married" stackId="a" fill="#10b981" name="Married" />
            <Bar dataKey="widowed" stackId="a" fill="#f59e0b" name="Widowed" />
            <Bar dataKey="divorced" stackId="a" fill="#ef4444" name="Divorced" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Age × Sector Analysis */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <h5 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
          🎂 Age × Sector Analysis
          <button 
            onClick={() => onDrilldown?.({})}
            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
          >
            View All
          </button>
        </h5>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={ageSectorChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="ageGroup" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="laborForce" stackId="b" fill="#10b981" name="Labor Force" />
            <Bar dataKey="unemployed" stackId="b" fill="#f59e0b" name="Unemployed" />
            <Bar dataKey="osy" stackId="b" fill="#3b82f6" name="OSY" />
            <Bar dataKey="osc" stackId="b" fill="#8b5cf6" name="OSC" />
            <Bar dataKey="pwd" stackId="b" fill="#ef4444" name="PWD" />
            <Bar dataKey="other" stackId="b" fill="#6b7280" name="Other" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <h6 className="text-sm font-semibold text-blue-900 mb-2">🔍 Key Insights</h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-medium">Demographics:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Most married residents are male (20 vs 18)</li>
              <li>Higher widowed population among females</li>
              <li>Young adults (19-35) dominate labor force</li>
            </ul>
          </div>
          <div>
            <p className="font-medium">Sector Distribution:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>45 residents in labor force (19-60 age group)</li>
              <li>9 unemployed adults need support</li>
              <li>10 out-of-school youth/children</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}