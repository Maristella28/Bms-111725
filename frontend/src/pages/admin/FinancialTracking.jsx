import React, { useState, useEffect } from 'react';
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { useAdminResponsiveLayout } from "../../hooks/useAdminResponsiveLayout";
import {
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DocumentArrowDownIcon,
  BuildingOfficeIcon,
  FunnelIcon,
  ChartBarIcon,
  CalendarIcon,
  UserGroupIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area } from 'recharts';
import axios from '../../utils/axiosConfig';
import * as XLSX from 'xlsx';

const StatCard = ({ label, value, icon, iconBg, valueColor = "text-green-600" }) => (
  <div className="relative overflow-hidden rounded-3xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 flex justify-between items-center group transform hover:scale-105 bg-white">
    <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="relative z-10">
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className={`text-4xl font-bold ${valueColor} group-hover:text-emerald-600 transition`}>₱ {value.toLocaleString()}</p>
    </div>
    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${iconBg} relative z-10`}>
      {icon}
    </div>
  </div>
);

const badge = (text, color, icon = null) => (
  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${color}`}>
    {icon && icon}
    {text}
  </span>
);


const FinancialTracking = () => {
  const { mainClasses } = useAdminResponsiveLayout();
  const [error, setError] = useState('');
  
  // Receipts state (income from documents and assets)
  const [receipts, setReceipts] = useState([]);
  const [loadingReceipts, setLoadingReceipts] = useState(false);
  const [receiptSearch, setReceiptSearch] = useState('');
  const [activeTab, setActiveTab] = useState('documents'); // 'documents' or 'assets'
  const [monthFilter, setMonthFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  
  // Advanced filters
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [selectedResident, setSelectedResident] = useState('All');
  const [quickDateFilter, setQuickDateFilter] = useState('all'); // 'all', 'today', 'week', 'month', 'quarter', 'year'
  const [chartType, setChartType] = useState('line'); // 'line', 'bar', 'area'
  const [showComparison, setShowComparison] = useState(false);
  const [selectedReceipts, setSelectedReceipts] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Fetch all receipts (documents and assets)
  const fetchAllReceipts = async () => {
    setLoadingReceipts(true);
    try {
      const res = await axios.get('/financial-records/receipts/all');
      setReceipts(res.data);
    } catch (err) {
      console.error('Failed to fetch receipts:', err);
      setError('Failed to load receipts');
    } finally {
      setLoadingReceipts(false);
    }
  };

  useEffect(() => {
    fetchAllReceipts();
  }, []);

  // Calculate summary from receipts
  const documentReceipts = receipts.filter(r => r.type === 'document');
  const assetReceipts = receipts.filter(r => r.type === 'asset');
  
  const totalIncome = receipts.reduce((sum, receipt) => sum + parseFloat(receipt.amount || 0), 0);
  const documentTotal = documentReceipts.reduce((sum, receipt) => sum + parseFloat(receipt.amount || 0), 0);
  const assetTotal = assetReceipts.reduce((sum, receipt) => sum + parseFloat(receipt.amount || 0), 0);
  
  // Average transaction values
  const averageDocumentAmount = documentReceipts.length > 0 
    ? documentTotal / documentReceipts.length 
    : 0;
  const averageAssetAmount = assetReceipts.length > 0 
    ? assetTotal / assetReceipts.length 
    : 0;
  const averageTransactionAmount = receipts.length > 0 
    ? totalIncome / receipts.length 
    : 0;

  // Highest single transaction
  const highestTransaction = receipts.length > 0
    ? Math.max(...receipts.map(r => parseFloat(r.amount || 0)))
    : 0;

  // Get unique residents for filter
  const uniqueResidents = Array.from(new Set(receipts.map(r => r.resident_name).filter(Boolean))).sort();

  // Calculate top residents by total income
  const topResidents = Object.entries(
    receipts.reduce((acc, r) => {
      const name = r.resident_name || 'Unknown';
      if (!acc[name]) {
        acc[name] = { name, total: 0, count: 0, documents: 0, assets: 0 };
      }
      acc[name].total += parseFloat(r.amount || 0);
      acc[name].count += 1;
      if (r.type === 'document') acc[name].documents += 1;
      if (r.type === 'asset') acc[name].assets += 1;
      return acc;
    }, {})
  )
    .map(([_, data]) => data)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  // Calculate peak periods (days of week, hours if available)
  const peakDays = React.useMemo(() => {
    try {
      if (!receipts || receipts.length === 0) return [];
      return Object.entries(
        receipts.reduce((acc, r) => {
          if (!r || !r.date) return acc;
          try {
            const date = new Date(r.date);
            if (isNaN(date.getTime())) return acc;
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            if (!acc[dayName]) acc[dayName] = { name: dayName, income: 0, count: 0 };
            acc[dayName].income += parseFloat(r.amount || 0);
            acc[dayName].count += 1;
            return acc;
          } catch (e) {
            return acc;
          }
        }, {})
      )
        .map(([_, data]) => data)
        .filter(item => item && item.name && item.income !== undefined)
        .sort((a, b) => (b.income || 0) - (a.income || 0));
    } catch (error) {
      console.error('Error calculating peak days:', error);
      return [];
    }
  }, [receipts]);

  // Calculate daily income for the selected year
  const getDailyIncomeData = () => {
    const days = [];
    const currentDate = new Date(chartYear, 0, 1);
    const endDate = new Date(chartYear, 11, 31);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayIncome = receipts
        .filter(r => {
          if (!r.date) return false;
          const rDate = typeof r.date === 'string' ? r.date.split('T')[0] : new Date(r.date).toISOString().split('T')[0];
          return rDate === dateStr;
        })
        .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
      
      if (dayIncome > 0 || currentDate <= new Date()) {
        days.push({
          date: dateStr,
          day: currentDate.getDate(),
          month: currentDate.toLocaleDateString('en-US', { month: 'short' }),
          income: dayIncome,
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days.slice(-90); // Last 90 days for performance
  };

  // Quick date filter helper
  const getQuickDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (quickDateFilter) {
      case 'today':
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return { start: weekStart, end: today };
      case 'month':
        return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: today };
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        return { start: new Date(now.getFullYear(), quarter * 3, 1), end: today };
      case 'year':
        return { start: new Date(now.getFullYear(), 0, 1), end: today };
      default:
        return null;
    }
  };

  // Chart data - Income from documents and assets
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartYear = parseInt(selectedYear);
  
  // Monthly income data with comparison
  const monthlyIncomeData = React.useMemo(() => {
    if (!receipts || receipts.length === 0) {
      return months.map(m => ({
        month: m,
        total: 0,
        documents: 0,
        assets: 0,
        previousYear: 0,
      }));
    }

    return months.map((m, idx) => {
      const monthNum = String(idx + 1).padStart(2, '0');
      const monthStr = `${chartYear}-${monthNum}`;
      const prevYearStr = `${chartYear - 1}-${monthNum}`;
      
      try {
        // Total income from all receipts
        const monthIncome = receipts
          .filter(r => {
            if (!r || !r.date) return false;
            try {
              const dateStr = typeof r.date === 'string' ? r.date : new Date(r.date).toISOString();
              return dateStr && dateStr.startsWith(monthStr);
            } catch (e) {
              return false;
            }
          })
          .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
        
        // Income from documents
        const monthDocuments = receipts
          .filter(r => {
            if (!r || !r.date || r.type !== 'document') return false;
            try {
              const dateStr = typeof r.date === 'string' ? r.date : new Date(r.date).toISOString();
              return dateStr && dateStr.startsWith(monthStr);
            } catch (e) {
              return false;
            }
          })
          .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
        
        // Income from assets
        const monthAssets = receipts
          .filter(r => {
            if (!r || !r.date || r.type !== 'asset') return false;
            try {
              const dateStr = typeof r.date === 'string' ? r.date : new Date(r.date).toISOString();
              return dateStr && dateStr.startsWith(monthStr);
            } catch (e) {
              return false;
            }
          })
          .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
        
        // Previous year data for comparison
        const prevYearIncome = showComparison ? receipts
          .filter(r => {
            if (!r || !r.date) return false;
            try {
              const dateStr = typeof r.date === 'string' ? r.date : new Date(r.date).toISOString();
              return dateStr && dateStr.startsWith(prevYearStr);
            } catch (e) {
              return false;
            }
          })
          .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0) : 0;
        
        return {
          month: m,
          total: monthIncome || 0,
          documents: monthDocuments || 0,
          assets: monthAssets || 0,
          previousYear: prevYearIncome || 0,
        };
      } catch (error) {
        console.error('Error processing month data:', error);
        return {
          month: m,
          total: 0,
          documents: 0,
          assets: 0,
          previousYear: 0,
        };
      }
    }).filter(item => item !== null && item !== undefined);
  }, [receipts, chartYear, showComparison]);

  // Calculate growth metrics
  const getGrowthPercentage = (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // Income by source (documents vs assets)
  const incomeBySource = [
    {
      name: 'Documents',
      value: documentTotal,
      color: '#3b82f6' // blue
    },
    {
      name: 'Assets',
      value: assetTotal,
      color: '#8b5cf6' // purple
    }
  ].filter(item => item.value > 0);

  // Current month vs previous month
  const currentMonth = new Date().getMonth();
  const currentMonthIncome = monthlyIncomeData[currentMonth]?.total || 0;
  const previousMonthIncome = monthlyIncomeData[currentMonth - 1]?.total || 0;
  const monthOverMonthGrowth = getGrowthPercentage(currentMonthIncome, previousMonthIncome);

  // Current year vs previous year
  const currentYearData = receipts.filter(r => {
    if (!r.date) return false;
    const dateStr = typeof r.date === 'string' ? r.date : new Date(r.date).toISOString();
    return dateStr.startsWith(`${chartYear}-`);
  }).reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

  const previousYearData = receipts.filter(r => {
    if (!r.date) return false;
    const dateStr = typeof r.date === 'string' ? r.date : new Date(r.date).toISOString();
    return dateStr.startsWith(`${chartYear - 1}-`);
  }).reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

  const yearOverYearGrowth = getGrowthPercentage(currentYearData, previousYearData);


  // Export XLSX for receipts
  const handleExportCSV = () => {
    // Get all receipts (not filtered, to include everything)
    const allDocumentReceipts = documentReceipts;
    const allAssetReceipts = assetReceipts;
    
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Headers for the data
    const headers = ['Receipt Number', 'Type', 'Resident Name', 'Resident ID', 'Description', 'Amount (PHP)', 'Date'];
    
    // Build worksheet data
    const wsData = [];
    
    // DOCUMENTS Section
    wsData.push(['DOCUMENTS']);
    wsData.push([]); // Empty row for spacing
    wsData.push(headers); // Headers
    
    // Document receipts
    allDocumentReceipts.forEach(r => {
      wsData.push([
        r.receipt_number || 'N/A',
        'Document',
        r.resident_name || 'Unknown',
        r.resident_id || 'N/A',
        r.description || '',
        parseFloat(r.amount || 0),
        r.date ? formatDate(r.date) : 'N/A'
      ]);
    });
    
    // Documents total income
    wsData.push([]); // Empty row
    wsData.push(['DOCUMENTS TOTAL INCOME', '', '', '', '', parseFloat(documentTotal.toFixed(2)), '']);
    wsData.push([]); // Empty row for spacing
    
    // ASSETS Section
    wsData.push(['ASSETS']);
    wsData.push([]); // Empty row for spacing
    wsData.push(headers); // Headers
    
    // Asset receipts
    allAssetReceipts.forEach(r => {
      wsData.push([
        r.receipt_number || 'N/A',
        'Asset',
        r.resident_name || 'Unknown',
        r.resident_id || 'N/A',
        r.description || '',
        parseFloat(r.amount || 0),
        r.date ? formatDate(r.date) : 'N/A'
      ]);
    });
    
    // Assets total income
    wsData.push([]); // Empty row
    wsData.push(['ASSETS TOTAL INCOME', '', '', '', '', parseFloat(assetTotal.toFixed(2)), '']);
    wsData.push([]); // Empty row for spacing
    
    // OVERALL TOTAL INCOME
    wsData.push(['OVERALL TOTAL INCOME', '', '', '', '', parseFloat(totalIncome.toFixed(2)), '']);
    
    // Create worksheet from data
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths for better readability
    // Column widths are in character units (approximate)
    ws['!cols'] = [
      { wch: 20 }, // Receipt Number - wide enough for receipt numbers
      { wch: 12 }, // Type - wide enough for "Document"/"Asset"
      { wch: 25 }, // Resident Name - wide enough for full names
      { wch: 15 }, // Resident ID - wide enough for resident IDs
      { wch: 35 }, // Description - wider for longer descriptions
      { wch: 18 }, // Amount - wide enough for currency values
      { wch: 20 }  // Date - wide enough for formatted dates
    ];
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Financial Records');
    
    // Generate Excel file and download
    const fileName = `financial-receipts-export-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  // Filter receipts based on active tab, search, and date filters
  const getFilteredReceipts = () => {
    const quickDateRange = getQuickDateRange();
    
    return receipts.filter(receipt => {
      // Filter by active tab
      const matchesTab = activeTab === 'documents' 
        ? receipt.type === 'document' 
        : receipt.type === 'asset';
      
      // Filter by search
      const matchesSearch = 
        (receipt.receipt_number && receipt.receipt_number.toLowerCase().includes(receiptSearch.toLowerCase())) ||
        (receipt.resident_name && receipt.resident_name.toLowerCase().includes(receiptSearch.toLowerCase())) ||
        (receipt.resident_id && receipt.resident_id.toLowerCase().includes(receiptSearch.toLowerCase())) ||
        (receipt.description && receipt.description.toLowerCase().includes(receiptSearch.toLowerCase()));
      
      // Filter by month - handle both date string and Date object
      const dateStr = receipt.date 
        ? (typeof receipt.date === 'string' ? receipt.date : new Date(receipt.date).toISOString())
        : '';
      const receiptDate = receipt.date ? new Date(receipt.date) : null;
      
      let matchesMonth = true;
      let matchesYear = true;
      let matchesQuickDate = true;
      
      if (quickDateFilter !== 'all' && quickDateRange && receiptDate) {
        matchesQuickDate = receiptDate >= quickDateRange.start && receiptDate < quickDateRange.end;
      }
      
      if (monthFilter !== 'All' && dateStr) {
        matchesMonth = dateStr.slice(5, 7) === monthFilter;
      }
      
      if (yearFilter !== 'All' && dateStr) {
        matchesYear = dateStr.slice(0, 4) === yearFilter;
      }
      
      // Filter by amount range
      const amount = parseFloat(receipt.amount || 0);
      const matchesMinAmount = !minAmount || amount >= parseFloat(minAmount);
      const matchesMaxAmount = !maxAmount || amount <= parseFloat(maxAmount);
      
      // Filter by resident
      const matchesResident = selectedResident === 'All' || receipt.resident_name === selectedResident;
      
      return matchesTab && matchesSearch && matchesMonth && matchesYear && 
             matchesQuickDate && matchesMinAmount && matchesMaxAmount && matchesResident;
    });
  };

  const filteredReceipts = getFilteredReceipts();

  // Comparison data (current period vs previous period)
  const getComparisonData = () => {
    if (!showComparison) return null;
    
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const currentPeriod = receipts.filter(r => {
      if (!r.date) return false;
      const rDate = new Date(r.date);
      return rDate >= currentMonthStart && rDate <= now;
    });
    
    const previousPeriod = receipts.filter(r => {
      if (!r.date) return false;
      const rDate = new Date(r.date);
      return rDate >= previousMonthStart && rDate <= previousMonthEnd;
    });
    
    const currentTotal = currentPeriod.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
    const previousTotal = previousPeriod.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
    const currentCount = currentPeriod.length;
    const previousCount = previousPeriod.length;
    
    return {
      current: { total: currentTotal, count: currentCount },
      previous: { total: previousTotal, count: previousCount },
      growth: getGrowthPercentage(currentTotal, previousTotal),
      countGrowth: getGrowthPercentage(currentCount, previousCount),
    };
  };

  const comparisonData = getComparisonData();

  // Toggle receipt selection for bulk operations
  const toggleReceiptSelection = (receiptId) => {
    setSelectedReceipts(prev => 
      prev.includes(receiptId)
        ? prev.filter(id => id !== receiptId)
        : [...prev, receiptId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedReceipts.length === filteredReceipts.length) {
      setSelectedReceipts([]);
    } else {
      setSelectedReceipts(filteredReceipts.map(r => `${r.type}-${r.id}`));
    }
  };

  // Bulk download receipts
  const handleBulkDownload = async () => {
    if (selectedReceipts.length === 0) return;
    
    for (const receiptId of selectedReceipts) {
      const [type, id] = receiptId.split('-');
      const receipt = receipts.find(r => `${r.type}-${r.id}` === receiptId);
      if (receipt) {
        await handleDownloadReceipt(receipt);
        // Add small delay to prevent browser blocking multiple downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    setSelectedReceipts([]);
  };

  // Download receipt
  const handleDownloadReceipt = async (receipt) => {
    try {
      if (receipt.type === 'document') {
        const response = await axios.post('/document-requests/generate-receipt', {
          document_request_id: receipt.request_id,
          receipt_number: receipt.receipt_number,
          amount_paid: receipt.amount
        }, {
          responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${receipt.receipt_number}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else if (receipt.type === 'asset') {
        const response = await axios.post('/asset-requests/generate-receipt', {
          asset_request_id: receipt.request_id,
          receipt_number: receipt.receipt_number,
          amount_paid: receipt.amount
        }, {
          responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${receipt.receipt_number}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Error downloading receipt:', err);
      setError('Failed to download receipt');
    }
  };

  return (
    <>
      <Navbar />
      <Sidebar />
      <main className="bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen ml-0 lg:ml-64 pt-20 lg:pt-36 px-4 pb-16">
        <div className="w-full max-w-[98%] mx-auto space-y-10 px-2 lg:px-4">
          {/* Enhanced Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl mb-4">
              <CurrencyDollarIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
              Income Tracking & Analytics
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Track and analyze income from document fees and asset rentals with comprehensive analytics and insights.
            </p>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Total Income"
              value={totalIncome}
              icon={<ArrowUpIcon className="w-6 h-6 text-green-600" />}
              iconBg="bg-green-100"
              valueColor="text-green-600"
            />
            <StatCard
              label="Document Income"
              value={documentTotal}
              icon={<DocumentArrowDownIcon className="w-6 h-6 text-blue-600" />}
              iconBg="bg-blue-100"
              valueColor="text-blue-600"
            />
            <StatCard
              label="Asset Income"
              value={assetTotal}
              icon={<BuildingOfficeIcon className="w-6 h-6 text-purple-600" />}
              iconBg="bg-purple-100"
              valueColor="text-purple-600"
            />
            <StatCard
              label="Total Transactions"
              value={receipts.length}
              icon={<DocumentArrowDownIcon className="w-6 h-6 text-indigo-600" />}
              iconBg="bg-indigo-100"
              valueColor="text-indigo-600"
            />
          </div>

          {/* Additional Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Transaction</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">₱ {averageTransactionAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <CurrencyDollarIcon className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Highest Transaction</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">₱ {highestTransaction.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <ArrowUpIcon className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Growth (MoM)</p>
                  <p className={`text-2xl font-bold mt-1 ${monthOverMonthGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {monthOverMonthGrowth >= 0 ? '+' : ''}{monthOverMonthGrowth.toFixed(1)}%
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${monthOverMonthGrowth >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  {monthOverMonthGrowth >= 0 ? (
                    <ArrowUpIcon className="w-6 h-6 text-green-600" />
                  ) : (
                    <ArrowDownIcon className="w-6 h-6 text-red-600" />
                  )}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Growth (YoY)</p>
                  <p className={`text-2xl font-bold mt-1 ${yearOverYearGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {yearOverYearGrowth >= 0 ? '+' : ''}{yearOverYearGrowth.toFixed(1)}%
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${yearOverYearGrowth >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  {yearOverYearGrowth >= 0 ? (
                    <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-6 h-6 text-red-600" />
                  )}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Top Residents</p>
                  <p className="text-2xl font-bold text-indigo-600 mt-1">{topResidents.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Active payers</p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Comparison View */}
          {comparisonData && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-xl border border-blue-100 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-blue-600" />
                  Period Comparison (Current Month vs Previous Month)
                </h3>
                <button
                  onClick={() => setShowComparison(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <p className="text-sm text-gray-600">Current Period</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">₱ {comparisonData.current.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p className="text-xs text-gray-500 mt-1">{comparisonData.current.count} transactions</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <p className="text-sm text-gray-600">Previous Period</p>
                  <p className="text-2xl font-bold text-gray-600 mt-1">₱ {comparisonData.previous.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p className="text-xs text-gray-500 mt-1">{comparisonData.previous.count} transactions</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <p className="text-sm text-gray-600">Income Growth</p>
                  <p className={`text-2xl font-bold mt-1 ${comparisonData.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {comparisonData.growth >= 0 ? '+' : ''}{comparisonData.growth.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">vs previous period</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <p className="text-sm text-gray-600">Transaction Growth</p>
                  <p className={`text-2xl font-bold mt-1 ${comparisonData.countGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {comparisonData.countGrowth >= 0 ? '+' : ''}{comparisonData.countGrowth.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">vs previous period</p>
                </div>
              </div>
            </div>
          )}

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Income Trend Chart */}
            <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <h3 className="text-base font-bold text-green-700 flex items-center gap-2">
                  <ArrowUpIcon className="w-4 h-4 text-green-400" /> 
                  Monthly Income Trend
                </h3>
                <div className="flex gap-2 items-center">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  >
                    {(() => {
                      const currentYear = new Date().getFullYear();
                      const years = [];
                      for (let i = currentYear; i >= currentYear - 5; i--) {
                        years.push(
                          <option key={i} value={i.toString()}>{i}</option>
                        );
                      }
                      return years;
                    })()}
                  </select>
                  <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setChartType('line')}
                      className={`px-3 py-1 text-xs rounded ${chartType === 'line' ? 'bg-white shadow-sm' : ''}`}
                    >
                      Line
                    </button>
                    <button
                      onClick={() => setChartType('bar')}
                      className={`px-3 py-1 text-xs rounded ${chartType === 'bar' ? 'bg-white shadow-sm' : ''}`}
                    >
                      Bar
                    </button>
                    <button
                      onClick={() => setChartType('area')}
                      className={`px-3 py-1 text-xs rounded ${chartType === 'area' ? 'bg-white shadow-sm' : ''}`}
                    >
                      Area
                    </button>
                  </div>
                  <button
                    onClick={() => setShowComparison(!showComparison)}
                    className={`px-3 py-1 text-xs rounded-lg ${showComparison ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                  >
                    Compare
                  </button>
                </div>
              </div>
              {monthlyIncomeData && monthlyIncomeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  {chartType === 'line' ? (
                    <LineChart data={monthlyIncomeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                      <XAxis dataKey="month" tick={{ fill: '#047857', fontWeight: 600 }} />
                      <YAxis tick={{ fill: '#047857', fontWeight: 600 }} />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'rgba(255,255,255,0.95)', 
                          borderRadius: '1rem', 
                          border: '1px solid #a7f3d0', 
                          color: '#047857' 
                        }}
                        formatter={(value) => `₱${(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#10b981" 
                        strokeWidth={3} 
                        dot={{ r: 6 }} 
                        activeDot={{ r: 8 }} 
                        name="Total Income" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="documents" 
                        stroke="#3b82f6" 
                        strokeWidth={2} 
                        dot={{ r: 4 }} 
                        activeDot={{ r: 6 }} 
                        name="Documents" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="assets" 
                        stroke="#8b5cf6" 
                        strokeWidth={2} 
                        dot={{ r: 4 }} 
                        activeDot={{ r: 6 }} 
                        name="Assets" 
                      />
                      {showComparison && (
                        <Line 
                          type="monotone" 
                          dataKey="previousYear" 
                          stroke="#94a3b8" 
                          strokeWidth={2} 
                          strokeDasharray="5 5"
                          dot={{ r: 4 }} 
                          activeDot={{ r: 6 }} 
                          name="Previous Year" 
                        />
                      )}
                    </LineChart>
                  ) : chartType === 'bar' ? (
                    <BarChart data={monthlyIncomeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                      <XAxis dataKey="month" tick={{ fill: '#047857', fontWeight: 600 }} />
                      <YAxis tick={{ fill: '#047857', fontWeight: 600 }} />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'rgba(255,255,255,0.95)', 
                          borderRadius: '1rem', 
                          border: '1px solid #a7f3d0', 
                          color: '#047857' 
                        }}
                        formatter={(value) => `₱${(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      />
                      <Legend />
                      <Bar dataKey="total" fill="#10b981" name="Total Income" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="documents" fill="#3b82f6" name="Documents" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="assets" fill="#8b5cf6" name="Assets" radius={[4, 4, 0, 0]} />
                      {showComparison && (
                        <Bar dataKey="previousYear" fill="#94a3b8" name="Previous Year" radius={[4, 4, 0, 0]} opacity={0.6} />
                      )}
                    </BarChart>
                  ) : (
                    <AreaChart data={monthlyIncomeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                      <XAxis dataKey="month" tick={{ fill: '#047857', fontWeight: 600 }} />
                      <YAxis tick={{ fill: '#047857', fontWeight: 600 }} />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'rgba(255,255,255,0.95)', 
                          borderRadius: '1rem', 
                          border: '1px solid #a7f3d0', 
                          color: '#047857' 
                        }}
                        formatter={(value) => `₱${(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="documents" 
                        stackId="1" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.6} 
                        name="Documents" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="assets" 
                        stackId="1" 
                        stroke="#8b5cf6" 
                        fill="#8b5cf6" 
                        fillOpacity={0.6} 
                        name="Assets" 
                      />
                      {showComparison && (
                        <Area 
                          type="monotone" 
                          dataKey="previousYear" 
                          stroke="#94a3b8" 
                          fill="#94a3b8" 
                          fillOpacity={0.3} 
                          name="Previous Year" 
                        />
                      )}
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center" style={{ height: '300px' }}>
                  <p className="text-gray-500">No data available for the selected period</p>
                </div>
              )}
            </div>

            {/* Income by Source Pie Chart */}
            <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-6 flex flex-col items-center">
              <h3 className="text-base font-bold text-green-700 mb-4 flex items-center gap-2">
                <CurrencyDollarIcon className="w-4 h-4 text-green-400" /> 
                Income by Source
              </h3>
              {incomeBySource.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie 
                      data={incomeBySource} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={100} 
                      label={(entry) => `${entry.name}: ₱${entry.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    >
                      {incomeBySource.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `₱${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Analytics Insights Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Top Residents */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5 text-indigo-600" />
                Top Residents by Income
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {topResidents.length > 0 ? (
                  topResidents.map((resident, idx) => (
                    <div key={resident.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-400 w-6">#{idx + 1}</span>
                        <div>
                          <p className="font-semibold text-gray-800">{resident.name}</p>
                          <p className="text-xs text-gray-500">{resident.count} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">₱{resident.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <div className="flex gap-2 text-xs">
                          <span className="text-blue-600">{resident.documents} docs</span>
                          <span className="text-purple-600">{resident.assets} assets</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No data available</p>
                )}
              </div>
            </div>

            {/* Peak Days Analysis */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-purple-600" />
                Peak Days Analysis
              </h3>
              {peakDays && peakDays.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={peakDays} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#666', fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value) => `₱${(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px' 
                      }}
                    />
                    <Bar dataKey="income" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[200px]">
                  <p className="text-gray-500">No data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleExportCSV} 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  <DocumentArrowDownIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Export Excel</span>
                  <span className="sm:hidden">Export</span>
                </button>
                {selectedReceipts.length > 0 && (
                  <button 
                    onClick={handleBulkDownload} 
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    <DocumentArrowDownIcon className="w-5 h-5" />
                    Download Selected ({selectedReceipts.length})
                  </button>
                )}
                <button 
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300"
                >
                  <FunnelIcon className="w-5 h-5" />
                  Advanced Filters
                </button>
              </div>

              <div className="flex gap-3 items-center w-full max-w-md">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-2 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent rounded-xl text-sm shadow-sm transition-all duration-300"
                    placeholder="Search by receipt number, resident name, or description..."
                    value={receiptSearch}
                    onChange={(e) => setReceiptSearch(e.target.value)}
                  />
                  <MagnifyingGlassIcon className="w-4 h-4 absolute left-4 top-2.5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Quick Date Filters */}
            <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Quick Filters:
              </span>
              {['all', 'today', 'week', 'month', 'quarter', 'year'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setQuickDateFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    quickDateFilter === filter
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-200">
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
              >
                <option value="All">All Months</option>
                <option value="01">January</option>
                <option value="02">February</option>
                <option value="03">March</option>
                <option value="04">April</option>
                <option value="05">May</option>
                <option value="06">June</option>
                <option value="07">July</option>
                <option value="08">August</option>
                <option value="09">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>

              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
              >
                <option value="All">All Years</option>
                {(() => {
                  const currentYear = new Date().getFullYear();
                  const years = [];
                  for (let i = currentYear; i >= currentYear - 5; i--) {
                    years.push(
                      <option key={i} value={i.toString()}>{i}</option>
                    );
                  }
                  return years;
                })()}
              </select>
            </div>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                  <FunnelIcon className="w-4 h-4" />
                  Advanced Filters
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount Range</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Resident</label>
                    <select
                      value={selectedResident}
                      onChange={(e) => setSelectedResident(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="All">All Residents</option>
                      {uniqueResidents.map((resident) => (
                        <option key={resident} value={resident}>{resident}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setMinAmount('');
                        setMaxAmount('');
                        setSelectedResident('All');
                        setQuickDateFilter('all');
                        setMonthFilter('All');
                        setYearFilter('All');
                      }}
                      className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tabs and Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-full">
            {/* Tabs */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold text-base flex items-center gap-2">
                  <CurrencyDollarIcon className="w-4 h-4" />
                  Paid Records
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('documents')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                      activeTab === 'documents'
                        ? 'bg-white text-green-600 shadow-lg'
                        : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                    }`}
                  >
                    Documents ({documentReceipts.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('assets')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                      activeTab === 'assets'
                        ? 'bg-white text-green-600 shadow-lg'
                        : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                    }`}
                  >
                    Assets ({assetReceipts.length})
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-slate-700 text-sm uppercase tracking-wider min-w-[50px]">
                      <input
                        type="checkbox"
                        checked={selectedReceipts.length === filteredReceipts.length && filteredReceipts.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                    </th>
                    <th className="px-6 py-4 text-left font-bold text-slate-700 text-sm uppercase tracking-wider min-w-[80px]">#</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-700 text-sm uppercase tracking-wider min-w-[150px]">Receipt #</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-700 text-sm uppercase tracking-wider min-w-[200px]">Resident</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-700 text-sm uppercase tracking-wider hidden md:table-cell min-w-[200px]">Description</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-700 text-sm uppercase tracking-wider min-w-[140px]">Amount</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-700 text-sm uppercase tracking-wider hidden lg:table-cell min-w-[150px]">Date</th>
                    <th className="px-6 py-4 text-center font-bold text-slate-700 text-sm uppercase tracking-wider min-w-[120px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loadingReceipts ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                          <p className="text-gray-500 font-medium">Loading receipts...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredReceipts.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <DocumentArrowDownIcon className="w-12 h-12 text-gray-300" />
                          <p className="text-gray-500 font-medium">No {activeTab} receipts found</p>
                          <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredReceipts.map((receipt, index) => {
                      const receiptId = `${receipt.type}-${receipt.id}`;
                      const isSelected = selectedReceipts.includes(receiptId);
                      return (
                        <tr key={receiptId} className={`hover:bg-green-50 transition-all duration-200 ${isSelected ? 'bg-green-50' : ''}`}>
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleReceiptSelection(receiptId)}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-green-600 bg-green-50 px-2 py-1 rounded text-xs">
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-indigo-600 font-semibold text-sm">
                              {receipt.receipt_number || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900">{receipt.resident_name || 'Unknown'}</div>
                              <div className="text-xs text-gray-500">{receipt.resident_id || 'N/A'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-700 hidden md:table-cell">
                            <div className="max-w-xs truncate">{receipt.description || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-green-600">
                              ₱{parseFloat(receipt.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 hidden lg:table-cell">
                            {formatDate(receipt.date)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              <button
                                onClick={() => handleDownloadReceipt(receipt)}
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105"
                              >
                                <DocumentArrowDownIcon className="w-3 h-3" />
                                Download
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold text-green-600">{filteredReceipts.length}</span> of{' '}
                <span className="font-semibold text-green-600">
                  {activeTab === 'documents' ? documentReceipts.length : assetReceipts.length}
                </span>{' '}
                {activeTab} receipts
              </div>
              <div className="text-sm text-gray-600">
                Total: <span className="font-semibold text-green-600">
                  ₱{filteredReceipts.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default FinancialTracking;