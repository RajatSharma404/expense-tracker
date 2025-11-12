import express from 'express';
import { body, validationResult, query } from 'express-validator';
import ExpenseModel, { Expense } from '../models/Expense.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get all expenses with filters
router.get('/', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const { startDate, endDate, category, paymentMethod, limit = 50, page = 1 } = req.query;
    
    // Filter expenses from in-memory store
    let filteredExpenses = await ExpenseModel.find({ userId: req.userId!.toString() });

    // Apply date filters
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate as string) : null;
      const end = endDate ? new Date(endDate as string) : null;
      
      filteredExpenses = filteredExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        if (start && expenseDate < start) return false;
        if (end && expenseDate > end) return false;
        return true;
      });
    }

    // Apply category filter
    if (category) {
      filteredExpenses = filteredExpenses.filter(expense => expense.category === category);
    }

    // Apply payment method filter
    if (paymentMethod) {
      filteredExpenses = filteredExpenses.filter(expense => expense.paymentMethod === paymentMethod);
    }

    // Sort by date (newest first)
    filteredExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Apply pagination
    const total = filteredExpenses.length;
    const pageSize = Number(limit);
    const pageNum = Number(page);
    const startIndex = (pageNum - 1) * pageSize;
    const paginatedExpenses = filteredExpenses.slice(startIndex, startIndex + pageSize);

    res.json({
      expenses: paginatedExpenses,
      pagination: {
        total,
        page: pageNum,
        limit: pageSize,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get single expense
router.get('/:id', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const expense = await ExpenseModel.findOne({ id: req.params.id });
    if (!expense || expense.userId !== req.userId) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(expense);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create expense
router.post(
  '/',
  authenticate,
  [
    body('amount').isFloat({ min: 0 }),
    body('date').isISO8601(),
    body('category').isIn([
      'Food & Dining',
      'Transportation',
      'Shopping',
      'Entertainment',
      'Utilities & Bills',
      'Healthcare',
      'Education',
      'Miscellaneous',
    ]),
    body('paymentMethod').isIn(['Cash', 'Card', 'Digital Wallet', 'Bank Transfer']),
    body('description').optional().trim(),
    body('tags').optional().isArray(),
  ],
  async (req: AuthRequest, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { amount, date, category, paymentMethod, description, tags } = req.body;
      const expense = new Expense(
        req.userId!,
        parseFloat(amount),
        new Date(date),
        category,
        paymentMethod,
        description,
        tags
      );
      await expense.save();
      res.status(201).json(expense);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Update expense
router.put(
  '/:id',
  authenticate,
  [
    body('amount').optional().isFloat({ min: 0 }),
    body('date').optional().isISO8601(),
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
    body('paymentMethod').optional().isIn(['Cash', 'Card', 'Digital Wallet', 'Bank Transfer']),
  ],
  async (req: AuthRequest, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Find the expense
      const expense = await ExpenseModel.findOne({ id: req.params.id });
      if (!expense || expense.userId !== req.userId) {
        return res.status(404).json({ message: 'Expense not found' });
      }

      // Update the expense
      const updatedExpense = await ExpenseModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!updatedExpense) {
        return res.status(404).json({ message: 'Expense not found' });
      }

      res.json(updatedExpense);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Delete expense
router.delete('/:id', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    // Find the expense
    const expense = await ExpenseModel.findOne({ id: req.params.id });
    if (!expense || expense.userId !== req.userId) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Delete the expense
    const deletedExpense = await ExpenseModel.findByIdAndDelete(req.params.id);
    if (!deletedExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;