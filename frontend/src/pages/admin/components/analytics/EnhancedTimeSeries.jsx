import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function EnhancedTimeSeries({ summary, onDrilldown }) {
  const monthlyData = summary?.monthlyRegistrations || [];
  
  // Generate forecast data (simple linear trend)
  const generateForecast = (data) => {
    if (data.length < 3) return [];
    
    const last3Months = data.slice(-3);
    const avgGrowth = last3Months.reduce((sum, item, index) => {
      if (index === 0) return sum;
      return sum + (item.count - last3Months[index - 1].count);
    }, 0) / (last3Months.length - 1);
    
    const lastMonth = data[data.length - 1];
    const nextMonth = {
      month: new Date(new Date(lastMonth.month + '-01').setMonth(new Date(lastMonth.month + '-01').getMonth() + 1)).toISOString().slice(0, 7),
      count: Math.max(0, lastMonth.count + avgGrowth),
      forecast: true
    };
    
    return [nextMonth];
  };

  const forecastData = generateForecast(monthlyData);
  const chartData = [...monthlyData, ...forecastData];

  // Calendar heatmap data (last 12 months)
  const generateHeatmapData = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = date.toISOString().slice(0, 7);
      const monthData = monthlyData.find(m => m.month === monthStr);
      
      months.push({
        month: monthStr,
        count: monthData?.count || 0,
        intensity: monthData?.count ? Math.min(100, (monthData.count / Math.max(...monthlyData.map(m => m.count))) * 100) : 0
      });
    }
    
    return months;
  };

  const heatmapData = generateHeatmapData();

  return (
    <div className="space-y-6">
      {/* Registration Trends with Forecast */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <h5 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
          📈 Registration Trends & Forecast
          <button 
            onClick={() => onDrilldown?.({})}
            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
          >
            View All
          </button>
        </h5>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                      <p className="font-semibold">{label}</p>
                      <p className="text-blue-600">{`Registrations: ${data.count}`}</p>
                      {data.forecast && <p className="text-orange-600 text-xs">📊 Forecast</p>}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#3b82f6" 
              strokeWidth={3} 
              dot={{ r: 4 }} 
              name="Actual"
            />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#f59e0b" 
              strokeWidth={2} 
              strokeDasharray="5 5"
              dot={{ r: 3 }} 
              name="Forecast"
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Calendar Heatmap */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <h5 className="text-md font-semibold text-gray-800 mb-3">📅 Registration Activity Heatmap</h5>
        <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
          {heatmapData.map((month, index) => (
            <div
              key={month.month}
              className={`aspect-square rounded cursor-pointer hover:scale-110 transition-transform ${
                month.intensity === 0 ? 'bg-gray-100' :
                month.intensity < 25 ? 'bg-green-200' :
                month.intensity < 50 ? 'bg-green-300' :
                month.intensity < 75 ? 'bg-green-400' :
                'bg-green-500'
              }`}
              onClick={() => onDrilldown?.({ month: month.month })}
              title={`${month.month}: ${month.count} registrations`}
            >
              <div className="w-full h-full flex items-center justify-center text-xs font-medium text-white">
                {month.count}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-gray-100 rounded"></div>
            <div className="w-3 h-3 bg-green-200 rounded"></div>
            <div className="w-3 h-3 bg-green-300 rounded"></div>
            <div className="w-3 h-3 bg-green-400 rounded"></div>
            <div className="w-3 h-3 bg-green-500 rounded"></div>
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
