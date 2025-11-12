import express from 'express';
import ExpenseModel from '../models/Expense.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Export expenses as CSV
router.get('/csv', authenticate, async (req: AuthRequest, res: express.Response) => {
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
    
    // Sort by date (newest first)
    expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const records = expenses.map((exp) => ({
      date: exp.date.toISOString().split('T')[0],
      amount: exp.amount,
      category: exp.category,
      description: exp.description || '',
      paymentMethod: exp.paymentMethod,
      tags: exp.tags?.join(', ') || '',
    }));

    const csvContent = [
      ['Date', 'Amount', 'Category', 'Description', 'Payment Method', 'Tags'].join(','),
      ...records.map((r) =>
        [
          r.date,
          r.amount,
          `"${r.category}"`,
          `"${r.description}"`,
          r.paymentMethod,
          `"${r.tags}"`,
        ].join(',')
      ),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');
    res.send(csvContent);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Export expenses as PDF (disabled due to pdfkit issues)
router.get('/pdf', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    res.status(501).json({ message: 'PDF export is currently disabled' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;