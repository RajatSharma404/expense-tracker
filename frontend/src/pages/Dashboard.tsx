import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
// Using simple SVG icons
const CurrencyDollarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ChartBarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const ArrowTrendingUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

interface DashboardStats {
  totalExpenses: number;
  monthlyExpenses: number;
  budgetStatus: { total: number; spent: number; remaining: number }[];
  recentExpenses: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const [expensesRes, budgetsRes] = await Promise.all([
        axios.get('/expenses', {
          params: { limit: 10, startDate: startOfMonth.toISOString(), endDate: endOfMonth.toISOString() },
        }),
        axios.get('/budgets'),
      ]);

      const expenses = expensesRes.data.expenses;
      const monthlyTotal = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);

      const budgets = budgetsRes.data;
      const budgetStatus = budgets.map((budget: any) => {
        const budgetExpenses = expenses.filter(
          (exp: any) => !budget.category || exp.category === budget.category
        );
        const spent = budgetExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
        return {
          total: budget.amount,
          spent,
          remaining: budget.amount - spent,
        };
      });

      setStats({
        totalExpenses: expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0),
        monthlyExpenses: monthlyTotal,
        budgetStatus,
        recentExpenses: expenses.slice(0, 5),
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-400">Welcome back! Here's your financial overview.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-400 truncate">Total Expenses</dt>
                  <dd className="text-lg font-medium text-white">
                    ${stats?.totalExpenses.toFixed(2) || '0.00'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-400 truncate">This Month</dt>
                  <dd className="text-lg font-medium text-white">
                    ${stats?.monthlyExpenses.toFixed(2) || '0.00'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-400 truncate">Active Budgets</dt>
                  <dd className="text-lg font-medium text-white">{stats?.budgetStatus.length || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-400 truncate">Recent Expenses</dt>
                  <dd className="text-lg font-medium text-white">{stats?.recentExpenses.length || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 shadow-lg rounded-lg border border-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">Recent Expenses</h3>
              <Link
                to="/expenses"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                View all
              </Link>
            </div>
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-700">
                {stats?.recentExpenses.length ? (
                  stats.recentExpenses.map((expense) => (
                    <li key={expense._id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <CurrencyDollarIcon className="h-5 w-5 text-blue-400" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {expense.description || expense.category}
                          </p>
                          <p className="text-sm text-gray-400">{expense.category}</p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-sm font-medium text-white">${expense.amount.toFixed(2)}</p>
                          <p className="text-sm text-gray-400">
                            {format(new Date(expense.date), 'MMM d')}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="py-4 text-center text-gray-400">No expenses yet</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 shadow-lg rounded-lg border border-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">Budget Status</h3>
              <Link
                to="/budgets"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Manage
              </Link>
            </div>
            <div className="space-y-4">
              {stats?.budgetStatus.length ? (
                stats.budgetStatus.map((budget, index) => {
                  const percentage = (budget.spent / budget.total) * 100;
                  return (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Budget {index + 1}</span>
                        <span className="text-white">
                          ${budget.spent.toFixed(2)} / ${budget.total.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            percentage > 100
                              ? 'bg-red-600'
                              : percentage > 80
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-400">No budgets set</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

