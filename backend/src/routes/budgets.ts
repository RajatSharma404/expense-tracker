import express from 'express';
import { body, validationResult } from 'express-validator';
import BudgetModel, { Budget } from '../models/Budget.js';
import ExpenseModel from '../models/Expense.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get all budgets
router.get('/', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const budgets = await BudgetModel.find({ userId: req.userId! });
    // Sort by createdAt (newest first)
    budgets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(budgets);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get budget with spending
router.get('/:id', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const budget = await BudgetModel.findOne({ id: req.params.id });
    if (!budget || budget.userId !== req.userId) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Calculate spending
    let expenses = await ExpenseModel.find({ userId: req.userId! });
    
    // Filter by date range
    expenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= new Date(budget.startDate) && expenseDate <= new Date(budget.endDate);
    });
    
    // Filter by category if budget has one
    if (budget.category) {
      expenses = expenses.filter(expense => expense.category === budget.category);
    }
    
    // Calculate total spending
    const totalSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remaining = budget.amount - totalSpending;
    const percentage = (totalSpending / budget.amount) * 100;

    res.json({
      ...budget,
      spending: totalSpending,
      remaining,
      percentage: Math.min(100, percentage),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create budget
router.post(
  '/',
  authenticate,
  [
    body('amount').isFloat({ min: 0 }),
    body('period').isIn(['monthly', 'yearly']),
    body('category').optional().isIn([
      'Food & Dining',
      'Transportation',
      'Shopping',
      'Entertainment',
      'Utilities & Bills',
      'Healthcare',
      'Education',
      'Miscellaneous',
    ]),
    body('startDate').isISO8601(),
  ],
  async (req: AuthRequest, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { amount, period, category, startDate } = req.body;
      const start = new Date(startDate);
      let endDate: Date;

      if (period === 'monthly') {
        endDate = new Date(start);
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate = new Date(start);
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      const budget = new Budget(
        req.userId!,
        parseFloat(amount),
        period,
        start,
        endDate,
        category || undefined
      );

      await budget.save();
      res.status(201).json(budget);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Update budget
router.put(
  '/:id',
  authenticate,
  [
    body('amount').optional().isFloat({ min: 0 }),
    body('category').optional().isIn([
      'Food & Dining',
      'Transportation',
      'Shopping',
      'Entertainment',
      'Utilities & Bills',
      'Healthcare',
      'Education',
      'Miscellaneous',
    ]),
  ],
  async (req: AuthRequest, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Find the budget
      const budget = await BudgetModel.findOne({ id: req.params.id });
      if (!budget || budget.userId !== req.userId) {
        return res.status(404).json({ message: 'Budget not found' });
      }

      // Update the budget
      const updatedBudget = await BudgetModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!updatedBudget) {
        return res.status(404).json({ message: 'Budget not found' });
      }

      res.json(updatedBudget);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Delete budget
router.delete('/:id', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    // Find the budget
    const budget = await BudgetModel.findOne({ id: req.params.id });
    if (!budget || budget.userId !== req.userId) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Delete the budget
    const deletedBudget = await BudgetModel.findByIdAndDelete(req.params.id);
    if (!deletedBudget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json({ message: 'Budget deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;