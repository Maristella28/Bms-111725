import React from 'react';

const exportAnalyticsToPDF = (summary) => {
  // Create a comprehensive analytics report
  const reportData = {
    title: 'Residents Analytics Report',
    generatedAt: new Date().toISOString(),
    summary: {
      total: summary?.total || 0,
      active: summary?.updateStatus?.Active || 0,
      outdated: summary?.updateStatus?.Outdated || 0,
      needsVerification: summary?.updateStatus?.['Needs Verification'] || 0,
      missingCritical: summary?.missingCritical || 0,
      duplicateEmails: summary?.duplicates?.emails?.length || 0,
      duplicateIds: summary?.duplicates?.resident_ids?.length || 0
    },
    demographics: {
      gender: summary?.gender || {},
      civilStatus: summary?.civilStatus || {},
      ageGroups: summary?.ageGroups || {},
      sectors: summary?.sectors || {}
    },
    trends: summary?.monthlyRegistrations || []
  };

  // For now, we'll create a downloadable JSON file
  // In a real implementation, you'd use a PDF library like jsPDF
  const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `residents-analytics-report-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const shareDashboard = () => {
  const url = window.location.href;
  const shareData = {
    title: 'Residents Analytics Dashboard',
    text: 'Check out our residents analytics dashboard',
    url: url
  };

  if (navigator.share) {
    navigator.share(shareData);
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(url).then(() => {
      alert('Dashboard URL copied to clipboard!');
    });
  }
};

export default function ExportAndSharing({ summary }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <h5 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
        📤 Export & Sharing
      </h5>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Export Analytics Report */}
        <button
          onClick={() => exportAnalyticsToPDF(summary)}
          className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
        >
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            📊
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-blue-900">Export Report</p>
            <p className="text-xs text-blue-600">Download analytics summary</p>
          </div>
        </button>

        {/* Share Dashboard */}
        <button
          onClick={shareDashboard}
          className="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors"
        >
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            🔗
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-green-900">Share Dashboard</p>
            <p className="text-xs text-green-600">Share current view</p>
          </div>
        </button>

        {/* Schedule Reports */}
        <button
          onClick={() => alert('Scheduled reports feature coming soon!')}
          className="flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
        >
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            ⏰
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-purple-900">Schedule Reports</p>
            <p className="text-xs text-purple-600">Auto-email analytics</p>
          </div>
        </button>
      </div>

      {/* Quick Stats for Export */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h6 className="text-sm font-medium text-gray-700 mb-2">Report Preview</h6>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="text-center">
            <p className="font-bold text-gray-900">{summary?.total || 0}</p>
            <p className="text-gray-600">Total Residents</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-green-600">{summary?.updateStatus?.Active || 0}</p>
            <p className="text-gray-600">Active Records</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-red-600">{summary?.missingCritical || 0}</p>
            <p className="text-gray-600">Missing Fields</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-blue-600">{(summary?.monthlyRegistrations || []).length}</p>
            <p className="text-gray-600">Months Tracked</p>
          </div>
        </div>
      </div>
    </div>
  );
}
