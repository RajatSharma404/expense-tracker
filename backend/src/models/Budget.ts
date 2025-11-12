import { dataStore, Budget as BudgetData, generateId } from '../dataStore.js';

export interface IBudget extends BudgetData {}

// Budget class that implements the IBudget interface
export class Budget implements IBudget {
  id: string;
  userId: string;
  category?: string;
  amount: number;
  period: 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    userId: string,
    amount: number,
    period: 'monthly' | 'yearly',
    startDate: Date,
    endDate: Date,
    category?: string
  ) {
    this.id = generateId();
    this.userId = userId;
    this.amount = amount;
    this.period = period;
    this.startDate = startDate;
    this.endDate = endDate;
    this.category = category;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // Save budget to in-memory store
  async save(): Promise<Budget> {
    // Add to data store
    dataStore.budgets.push(this);
    return this;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      category: this.category,
      amount: this.amount,
      period: this.period,
      startDate: this.startDate,
      endDate: this.endDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

// Static methods to replace Mongoose methods
export default class BudgetModel {
  static async find(query: { userId?: string }): Promise<Budget[]> {
    if (query.userId) {
      const budgets = dataStore.budgets.filter(b => b.userId === query.userId);
      return budgets.map(b => Object.assign(new Budget(
        b.userId,
        b.amount,
        b.period,
        b.startDate,
        b.endDate,
        b.category
      ), b));
    }
    
    return [];
  }

  static async findOne(query: { id?: string }): Promise<Budget | null> {
    if (query.id) {
      const budget = dataStore.budgets.find(b => b.id === query.id);
      if (!budget) return null;
      
      return Object.assign(new Budget(
        budget.userId,
        budget.amount,
        budget.period,
        budget.startDate,
        budget.endDate,
        budget.category
      ), budget);
    }
    
    return null;
  }

  static async findByIdAndDelete(id: string): Promise<Budget | null> {
    const budgetIndex = dataStore.budgets.findIndex(b => b.id === id);
    if (budgetIndex === -1) return null;
    
    const budget = dataStore.budgets[budgetIndex];
    const deletedBudget = Object.assign(new Budget(
      budget.userId,
      budget.amount,
      budget.period,
      budget.startDate,
      budget.endDate,
      budget.category
    ), budget);
    
    dataStore.budgets.splice(budgetIndex, 1);
    return deletedBudget;
  }

  static async findByIdAndUpdate(
    id: string,
    updates: Partial<BudgetData>,
    options: { new: boolean }
  ): Promise<Budget | null> {
    const budgetIndex = dataStore.budgets.findIndex(b => b.id === id);
    if (budgetIndex === -1) return null;
    
    // Apply updates
    const updatedBudget = { ...dataStore.budgets[budgetIndex], ...updates, updatedAt: new Date() };
    dataStore.budgets[budgetIndex] = updatedBudget;
    
    return Object.assign(new Budget(
      updatedBudget.userId,
      updatedBudget.amount,
      updatedBudget.period,
      updatedBudget.startDate,
      updatedBudget.endDate,
      updatedBudget.category
    ), updatedBudget);
  }
}