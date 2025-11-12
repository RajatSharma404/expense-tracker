import express from 'express';
import { body, validationResult } from 'express-validator';
import RecurringModel, { Recurring } from '../models/Recurring.js';
import ExpenseModel, { Expense } from '../models/Expense.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get all recurring items
router.get('/', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const recurring = await RecurringModel.find({ userId: req.userId! });
    // Sort by nextDueDate (earliest first)
    recurring.sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
    res.json(recurring);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get single recurring item
router.get('/:id', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const recurring = await RecurringModel.findOne({ id: req.params.id });
    if (!recurring || recurring.userId !== req.userId) {
      return res.status(404).json({ message: 'Recurring item not found' });
    }
    res.json(recurring);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create recurring item
router.post(
  '/',
  authenticate,
  [
    body('type').isIn(['expense', 'income']),
    body('amount').isFloat({ min: 0 }),
    body('category').trim().notEmpty(),
    body('frequency').isIn(['daily', 'weekly', 'monthly', 'yearly']),
    body('startDate').isISO8601(),
    body('description').optional().trim(),
    body('endDate').optional().isISO8601(),
  ],
  async (req: AuthRequest, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { type, amount, category, frequency, startDate, description, endDate } = req.body;
      const start = new Date(startDate);
      let nextDueDate = new Date(start);

      // Calculate next due date based on frequency
      switch (frequency) {
        case 'daily':
          nextDueDate.setDate(nextDueDate.getDate() + 1);
          break;
        case 'weekly':
          nextDueDate.setDate(nextDueDate.getDate() + 7);
          break;
        case 'monthly':
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          break;
        case 'yearly':
          nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
          break;
      }

      const recurring = new Recurring(
        req.userId!,
        type,
        parseFloat(amount),
        category,
        frequency,
        start,
        nextDueDate,
        description,
        endDate ? new Date(endDate) : undefined
      );

      await recurring.save();
      res.status(201).json(recurring);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Update recurring item
router.put(
  '/:id',
  authenticate,
  [
    body('amount').optional().isFloat({ min: 0 }),
    body('isActive').optional().isBoolean(),
    body('description').optional().trim(),
  ],
  async (req: AuthRequest, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Find the recurring item
      const recurring = await RecurringModel.findOne({ id: req.params.id });
      if (!recurring || recurring.userId !== req.userId) {
        return res.status(404).json({ message: 'Recurring item not found' });
      }

      // Update the recurring item
      const updatedRecurring = await RecurringModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!updatedRecurring) {
        return res.status(404).json({ message: 'Recurring item not found' });
      }

      res.json(updatedRecurring);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Process recurring item (create expense/income)
router.post('/:id/process', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const recurring = await RecurringModel.findOne({ id: req.params.id });
    if (!recurring || recurring.userId !== req.userId) {
      return res.status(404).json({ message: 'Recurring item not found' });
    }

    if (!recurring.isActive) {
      return res.status(400).json({ message: 'Recurring item is not active' });
    }

    if (recurring.type === 'expense') {
      // Create expense
      const expense = new Expense(
        req.userId!,
        recurring.amount,
        new Date(),
        recurring.category,
        'Bank Transfer',
        recurring.description || `Recurring: ${recurring.category}`
      );
      await expense.save();
    }

    // Update next due date
    const nextDueDate = new Date(recurring.nextDueDate);
    switch (recurring.frequency) {
      case 'daily':
        nextDueDate.setDate(nextDueDate.getDate() + 1);
        break;
      case 'weekly':
        nextDueDate.setDate(nextDueDate.getDate() + 7);
        break;
      case 'monthly':
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        break;
      case 'yearly':
        nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
        break;
    }

    // Update the recurring item
    const updatedRecurring = await RecurringModel.findByIdAndUpdate(
      req.params.id,
      { nextDueDate },
      { new: true }
    );

    if (!updatedRecurring) {
      return res.status(404).json({ message: 'Recurring item not found' });
    }

    res.json({ message: 'Recurring item processed successfully', recurring: updatedRecurring });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete recurring item
router.delete('/:id', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    // Find the recurring item
    const recurring = await RecurringModel.findOne({ id: req.params.id });
    if (!recurring || recurring.userId !== req.userId) {
      return res.status(404).json({ message: 'Recurring item not found' });
    }

    // Delete the recurring item
    const deletedRecurring = await RecurringModel.findByIdAndDelete(req.params.id);
    if (!deletedRecurring) {
      return res.status(404).json({ message: 'Recurring item not found' });
    }

    res.json({ message: 'Recurring item deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;