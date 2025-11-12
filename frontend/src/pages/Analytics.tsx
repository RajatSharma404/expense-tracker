import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Filler,
} from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import toast from 'react-hot-toast';
// Using simple SVG icon
const ArrowDownTrayIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Filler
);

export default function Analytics() {
  const [categoryData, setCategoryData] = useState<any>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<any>(null);
  const [dailyData, setDailyData] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      };

      const [categoryRes, monthlyRes, dailyRes, summaryRes] = await Promise.all([
        axios.get('/analytics/by-category', { params }),
        axios.get('/analytics/monthly-trends', { params: { months: 6 } }),
        axios.get('/analytics/daily', { params }),
        axios.get('/analytics/summary', { params }),
      ]);

      // Process category data for pie chart
      const catData = categoryRes.data;
      setCategoryData({
        labels: catData.map((item: any) => item._id),
        datasets: [
          {
            label: 'Spending',
            data: catData.map((item: any) => item.total),
            backgroundColor: [
              '#3b82f6',
              '#ef4444',
              '#10b981',
              '#f59e0b',
              '#8b5cf6',
              '#ec4899',
              '#06b6d4',
              '#84cc16',
            ],
          },
        ],
      });

      // Process monthly trends
      const trends = monthlyRes.data;
      setMonthlyTrends({
        labels: trends.map(
          (item: any) => `${item._id.month}/${item._id.year}`
        ),
        datasets: [
          {
            label: 'Monthly Spending',
            data: trends.map((item: any) => item.total),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      });

      // Process daily data
      const daily = dailyRes.data;
      setDailyData({
        labels: daily.map((item: any) => item._id),
        datasets: [
          {
            label: 'Daily Spending',
            data: daily.map((item: any) => item.total),
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1,
          },
        ],
      });

      setSummary(summaryRes.data);
    } catch (error) {
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      const url = `/export/${format}?${params.toString()}`;
      window.open(url, '_blank');
      toast.success(`Exporting as ${format.toUpperCase()}...`);
    } catch (error) {
      toast.error('Failed to export');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics & Reports</h1>
          <p className="mt-2 text-sm text-gray-400">Visualize your spending patterns</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => handleExport('csv')}
            className="inline-flex items-center px-4 py-2 border border-gray-600 shadow-lg text-sm font-medium rounded-lg text-white bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Export CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="inline-flex items-center px-4 py-2 border border-gray-600 shadow-lg text-sm font-medium rounded-lg text-white bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="mb-6 bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
            <input
              type="date"
              className="block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
            <input
              type="date"
              className="block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            />
          </div>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-700">
            <div className="p-5">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate">Total Spending</dt>
                <dd className="mt-1 text-3xl font-semibold text-white">
                  ${summary.overall.total.toFixed(2)}
                </dd>
              </dl>
            </div>
          </div>
          <div className="bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-700">
            <div className="p-5">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate">Average Expense</dt>
                <dd className="mt-1 text-3xl font-semibold text-white">
                  ${summary.overall.average.toFixed(2)}
                </dd>
              </dl>
            </div>
          </div>
          <div className="bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-700">
            <div className="p-5">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate">Total Transactions</dt>
                <dd className="mt-1 text-3xl font-semibold text-white">{summary.overall.count}</dd>
              </dl>
            </div>
          </div>
          <div className="bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-700">
            <div className="p-5">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate">Largest Expense</dt>
                <dd className="mt-1 text-3xl font-semibold text-white">
                  ${summary.overall.max.toFixed(2)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {categoryData && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <h3 className="text-lg font-medium text-white mb-4">Spending by Category</h3>
            <div className="h-64">
              <Pie data={categoryData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        )}

        {monthlyTrends && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <h3 className="text-lg font-medium text-white mb-4">Monthly Trends</h3>
            <div className="h-64">
              <Line data={monthlyTrends} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        )}
      </div>

      {dailyData && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h3 className="text-lg font-medium text-white mb-4">Daily Spending</h3>
          <div className="h-64">
            <Bar data={dailyData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      )}
    </div>
  );
}

