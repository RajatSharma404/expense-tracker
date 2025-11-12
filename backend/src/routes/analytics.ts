import express from 'express';
import ExpenseModel from '../models/Expense.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get spending by category
router.get('/by-category', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get all expenses for the user
    let expenses = await ExpenseModel.find({ userId: req.userId! });
    
    // Apply date filters
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate as string) : null;
      const end = endDate ? new Date(endDate as string) : null;
      
      expenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        if (start && expenseDate < start) return false;
        if (end && expenseDate > end) return false;
        return true;
      });
    }
    
    // Group by category
    const categoryMap: { [key: string]: { total: number; count: number } } = {};
    expenses.forEach(expense => {
      if (!categoryMap[expense.category]) {
        categoryMap[expense.category] = { total: 0, count: 0 };
      }
      categoryMap[expense.category].total += expense.amount;
      categoryMap[expense.category].count += 1;
    });
    
    // Convert to array and sort by total (descending)
    const categorySpending = Object.entries(categoryMap)
      .map(([category, data]) => ({
        _id: category,
        total: data.total,
        count: data.count
      }))
      .sort((a, b) => b.total - a.total);
    
    res.json(categorySpending);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get monthly spending trends
router.get('/monthly-trends', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const { months = 6 } = req.query;
    const monthsAgo = new Date();
    monthsAgo.setMonth(monthsAgo.getMonth() - Number(months));
    
    // Get all expenses for the user
    let expenses = await ExpenseModel.find({ userId: req.userId! });
    
    // Filter by date (last N months)
    expenses = expenses.filter(expense => new Date(expense.date) >= monthsAgo);
    
    // Group by year and month
    const monthMap: { [key: string]: { total: number; count: number } } = {};
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!monthMap[key]) {
        monthMap[key] = { total: 0, count: 0 };
      }
      monthMap[key].total += expense.amount;
      monthMap[key].count += 1;
    });
    
    // Convert to array and sort by date
    const trends = Object.entries(monthMap)
      .map(([key, data]) => {
        const [year, month] = key.split('-');
        return {
          _id: {
            year: parseInt(year),
            month: parseInt(month)
          },
          total: data.total,
          count: data.count
        };
      })
      .sort((a, b) => {
        if (a._id.year !== b._id.year) {
          return a._id.year - b._id.year;
        }
        return a._id.month - b._id.month;
      });
    
    res.json(trends);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get daily spending
router.get('/daily', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get all expenses for the user
    let expenses = await ExpenseModel.find({ userId: req.userId! });
    
    // Apply date filters
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate as string) : null;
      const end = endDate ? new Date(endDate as string) : null;
      
      expenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        if (start && expenseDate < start) return false;
        if (end && expenseDate > end) return false;
        return true;
      });
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      expenses = expenses.filter(expense => new Date(expense.date) >= thirtyDaysAgo);
    }
    
    // Group by date
    const dateMap: { [key: string]: { total: number; count: number } } = {};
    expenses.forEach(expense => {
      const dateStr = new Date(expense.date).toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!dateMap[dateStr]) {
        dateMap[dateStr] = { total: 0, count: 0 };
      }
      dateMap[dateStr].total += expense.amount;
      dateMap[dateStr].count += 1;
    });
    
    // Convert to array and sort by date
    const dailySpending = Object.entries(dateMap)
      .map(([date, data]) => ({
        _id: date,
        total: data.total,
        count: data.count
      }))
      .sort((a, b) => a._id.localeCompare(b._id));
    
    res.json(dailySpending);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get summary statistics
router.get('/summary', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get all expenses for the user
    let expenses = await ExpenseModel.find({ userId: req.userId! });
    
    // Apply date filters
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate as string) : null;
      const end = endDate ? new Date(endDate as string) : null;
      
      expenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        if (start && expenseDate < start) return false;
        if (end && expenseDate > end) return false;
        return true;
      });
    }
    
    // Calculate overall statistics
    if (expenses.length === 0) {
      res.json({
        overall: { total: 0, average: 0, count: 0, min: 0, max: 0 },
        byPaymentMethod: []
      });
      return;
    }
    
    const amounts = expenses.map(e => e.amount);
    const total = amounts.reduce((sum, amount) => sum + amount, 0);
    const average = total / amounts.length;
    const min = Math.min(...amounts);
    const max = Math.max(...amounts);
    const count = amounts.length;
    
    // Group by payment method
    const paymentMethodMap: { [key: string]: number } = {};
    expenses.forEach(expense => {
      if (!paymentMethodMap[expense.paymentMethod]) {
        paymentMethodMap[expense.paymentMethod] = 0;
      }
      paymentMethodMap[expense.paymentMethod] += expense.amount;
    });
    
    const paymentMethodStats = Object.entries(paymentMethodMap)
      .map(([method, total]) => ({
        _id: method,
        total
      }));
    
    res.json({
      overall: { total, average, count, min, max },
      byPaymentMethod: paymentMethodStats,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Compare periods
router.get('/compare', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const { period1Start, period1End, period2Start, period2End } = req.query;
    
    if (!period1Start || !period1End || !period2Start || !period2End) {
      return res.status(400).json({ message: 'All period dates are required' });
    }
    
    // Get all expenses for the user
    const expenses = await ExpenseModel.find({ userId: req.userId! });
    
    // Filter for period 1
    const period1Expenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= new Date(period1Start as string) && 
             expenseDate <= new Date(period1End as string);
    });
    
    // Filter for period 2
    const period2Expenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= new Date(period2Start as string) && 
             expenseDate <= new Date(period2End as string);
    });
    
    // Calculate period 1 stats
    const p1Total = period1Expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const p1Count = period1Expenses.length;
    const p1 = { total: p1Total, count: p1Count };
    
    // Calculate period 2 stats
    const p2Total = period2Expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const p2Count = period2Expenses.length;
    const p2 = { total: p2Total, count: p2Count };
    
    // Calculate difference and percentage change
    const difference = p2.total - p1.total;
    const percentageChange = p1.total > 0 ? ((difference / p1.total) * 100) : 0;
    
    res.json({
      period1: p1,
      period2: p2,
      difference,
      percentageChange: parseFloat(percentageChange.toFixed(2)),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;