import React from 'react';

const exportJsonToCsv = (summary) => {
  const rows = [];
  rows.push(['Barangay Residents Analytics Summary']);
  rows.push(['Generated on', new Date().toISOString()]);
  rows.push([]);
  rows.push(['Totals']);
  rows.push(['Total Residents', summary?.total || 0]);
  rows.push(['Active', summary?.updateStatus?.Active || 0]);
  rows.push(['Outdated', summary?.updateStatus?.Outdated || 0]);
  rows.push(['Needs Verification', summary?.updateStatus?.['Needs Verification'] || 0]);
  rows.push([]);
  rows.push(['Gender Distribution']);
  Object.entries(summary?.gender || {}).forEach(([k, v]) => rows.push([k, v]));
  rows.push([]);
  rows.push(['Civil Status']);
  Object.entries(summary?.civilStatus || {}).forEach(([k, v]) => rows.push([k, v]));
  rows.push([]);
  rows.push(['Age Groups']);
  Object.entries(summary?.ageGroups || {}).forEach(([k, v]) => rows.push([k, v]));
  rows.push([]);
  rows.push(['Sectors']);
  Object.entries(summary?.sectors || {}).forEach(([k, v]) => rows.push([k, v]));
  rows.push([]);
  rows.push(['Missing Critical Records', summary?.missingCritical || 0]);
  rows.push(['Duplicate Emails', (summary?.duplicates?.emails || []).length]);
  rows.push(['Duplicate Resident IDs', (summary?.duplicates?.resident_ids || []).length]);
  rows.push([]);
  rows.push(['Monthly Registrations']);
  (summary?.monthlyRegistrations || []).forEach((m) => rows.push([m.month, m.count]));

  const csv = rows
    .map((row) => row
      .map((cell) => {
        const s = cell == null ? '' : String(cell);
        if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
          return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
      })
      .join(','))
    .join('\r\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `residents-analytics-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default function AnalyticsExport({ summary }) {
  return (
    <div className="mt-4">
      <button onClick={() => exportJsonToCsv(summary)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md">
        Export Analytics CSV
      </button>
    </div>
  );
}


