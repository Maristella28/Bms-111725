import React from 'react';

export default function DataQualityMetrics({ summary, onDrilldown }) {
  const missing = summary?.missingCritical || 0;
  const duplicateEmails = summary?.duplicates?.emails?.length || 0;
  const duplicateIds = summary?.duplicates?.resident_ids?.length || 0;
  const total = summary?.total || 0;

  const qualityScore = total > 0 ? Math.round(((total - missing - duplicateEmails - duplicateIds) / total) * 100) : 100;

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <h5 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
        🔍 Data Quality Metrics
        <span className={`text-xs px-2 py-1 rounded ${
          qualityScore >= 90 ? 'bg-green-100 text-green-600' :
          qualityScore >= 75 ? 'bg-yellow-100 text-yellow-600' :
          'bg-red-100 text-red-600'
        }`}>
          {qualityScore}% Quality Score
        </span>
      </h5>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Missing Critical Fields */}
        <div 
          className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${
            missing > 0 ? 'bg-red-50 border-red-200 hover:bg-red-100' : 'bg-green-50 border-green-200'
          }`}
          onClick={() => onDrilldown?.({ missing_fields: true })}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Missing Critical Fields</p>
              <p className={`text-lg font-bold ${missing > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {missing}
              </p>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              missing > 0 ? 'bg-red-100' : 'bg-green-100'
            }`}>
              {missing > 0 ? '⚠️' : '✅'}
            </div>
          </div>
          {missing > 0 && (
            <p className="text-xs text-red-600 mt-1">Click to view incomplete profiles</p>
          )}
        </div>

        {/* Duplicate Emails */}
        <div 
          className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${
            duplicateEmails > 0 ? 'bg-orange-50 border-orange-200 hover:bg-orange-100' : 'bg-green-50 border-green-200'
          }`}
          onClick={() => onDrilldown?.({ duplicate_emails: true })}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Duplicate Emails</p>
              <p className={`text-lg font-bold ${duplicateEmails > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {duplicateEmails}
              </p>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              duplicateEmails > 0 ? 'bg-orange-100' : 'bg-green-100'
            }`}>
              {duplicateEmails > 0 ? '📧' : '✅'}
            </div>
          </div>
          {duplicateEmails > 0 && (
            <p className="text-xs text-orange-600 mt-1">Click to view duplicates</p>
          )}
        </div>

        {/* Duplicate Resident IDs */}
        <div 
          className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${
            duplicateIds > 0 ? 'bg-purple-50 border-purple-200 hover:bg-purple-100' : 'bg-green-50 border-green-200'
          }`}
          onClick={() => onDrilldown?.({ duplicate_ids: true })}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Duplicate Resident IDs</p>
              <p className={`text-lg font-bold ${duplicateIds > 0 ? 'text-purple-600' : 'text-green-600'}`}>
                {duplicateIds}
              </p>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              duplicateIds > 0 ? 'bg-purple-100' : 'bg-green-100'
            }`}>
              {duplicateIds > 0 ? '🆔' : '✅'}
            </div>
          </div>
          {duplicateIds > 0 && (
            <p className="text-xs text-purple-600 mt-1">Click to view duplicates</p>
          )}
        </div>
      </div>

      {/* Quality Score Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Data Quality</span>
          <span className={`text-sm font-bold ${
            qualityScore >= 90 ? 'text-green-600' :
            qualityScore >= 75 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {qualityScore}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              qualityScore >= 90 ? 'bg-green-500' :
              qualityScore >= 75 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${qualityScore}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
