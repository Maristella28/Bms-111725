// Normalization helpers
export const normalizeString = (value, fallback = 'Unknown') => {
  if (value == null) return fallback;
  const s = String(value).trim();
  if (!s) return fallback;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

export const getAgeGroup = (age) => {
  const a = parseInt(age, 10);
  if (isNaN(a)) return 'Unknown';
  if (a < 5) return 'Under 5 years old';
  if (a < 10) return '5-9 years old';
  if (a < 15) return '10-14 years old';
  if (a < 20) return '15-19 years old';
  if (a < 25) return '20-24 years old';
  if (a < 30) return '25-29 years old';
  if (a < 35) return '30-34 years old';
  if (a < 40) return '35-39 years old';
  if (a < 45) return '40-44 years old';
  if (a < 50) return '45-49 years old';
  if (a < 55) return '50-54 years old';
  if (a < 60) return '55-59 years old';
  if (a < 65) return '60-64 years old';
  if (a < 70) return '65-69 years old';
  if (a < 75) return '70-74 years old';
  if (a < 80) return '75-79 years old';
  return '80 years old and over';
};

export const getSector = (resident) => {
  const age = parseInt(resident?.age, 10) || 0;
  const occupation = String(resident?.occupation_type || '').toLowerCase();
  const educational = String(resident?.educational_attainment || '').toLowerCase();

  if (age >= 18 && age <= 65 && occupation && !['none', 'unemployed'].includes(occupation)) {
    return 'Labor Force';
  }
  if (age >= 18 && age <= 65 && (!occupation || ['none', 'unemployed'].includes(occupation))) {
    return 'Unemployed';
  }
  if (age >= 15 && age <= 24 && (!educational || ['none', 'elementary'].includes(educational))) {
    return 'Out-of-School Youth (OSY)';
  }
  if (age >= 6 && age <= 14) {
    return 'Out-of-School Children (OSC)';
  }
  const cats = Array.isArray(resident?.special_categories) ? resident.special_categories : [];
  const hasPwd = cats.some((c) => String(c).toLowerCase().includes('pwd') || String(c).toLowerCase().includes('disability'));
  if (hasPwd) return 'Persons with Disabilities (PDWs)';
  const hasOfw = cats.some((c) => String(c).toLowerCase().includes('ofw') || String(c).toLowerCase().includes('overseas'));
  if (hasOfw) return 'Overseas Filipino Workers (OFWs)';
  return 'Other';
};

// Compute monthly registrations data for charts (expects array of { month: 'YYYY-MM', count })
export const toLineChartData = (monthly) => {
  if (!Array.isArray(monthly)) return [];
  return monthly.map((m) => ({
    month: m.month,
    registrations: m.count,
  }));
};

// Enhanced caching with TTL
const analyticsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const cacheGet = (key) => {
  const cached = analyticsCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  analyticsCache.delete(key);
  return null;
};

export const cacheSet = (key, data) => {
  analyticsCache.set(key, {
    data,
    timestamp: Date.now()
  });
  
  // Cleanup old entries
  if (analyticsCache.size > 50) {
    const entries = Array.from(analyticsCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toDelete = entries.slice(0, 10);
    toDelete.forEach(([k]) => analyticsCache.delete(k));
  }
};

// Debounce utility for filter inputs
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Calculate trend indicators
export const calculateTrend = (current, previous) => {
  if (!previous || previous === 0) return { direction: 'neutral', percentage: '0' };
  
  const change = ((current - previous) / previous) * 100;
  const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
  const percentage = Math.abs(change).toFixed(1);
  
  return { direction, percentage: `${change >= 0 ? '+' : ''}${percentage}` };
};

// Generate forecast data (simple linear regression)
export const generateForecast = (data, periods = 1) => {
  if (data.length < 3) return [];
  
  const values = data.map(d => d.count || d.value || 0);
  const n = values.length;
  
  // Simple linear regression
  const sumX = n * (n - 1) / 2;
  const sumY = values.reduce((sum, val) => sum + val, 0);
  const sumXY = values.reduce((sum, val, i) => sum + val * i, 0);
  const sumXX = n * (n - 1) * (2 * n - 1) / 6;
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  const forecast = [];
  for (let i = 0; i < periods; i++) {
    const nextIndex = n + i;
    const predictedValue = Math.max(0, Math.round(intercept + slope * nextIndex));
    
    // Generate next month string
    const lastDate = new Date(data[data.length - 1].month + '-01');
    const nextDate = new Date(lastDate.getFullYear(), lastDate.getMonth() + i + 1, 1);
    const monthStr = nextDate.toISOString().slice(0, 7);
    
    forecast.push({
      month: monthStr,
      count: predictedValue,
      forecast: true
    });
  }
  
  return forecast;
};


