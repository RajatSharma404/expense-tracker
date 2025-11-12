import { dataStore, Expense as ExpenseData, generateId } from '../dataStore.js';

export interface IExpense extends ExpenseData {}

// Expense class that implements the IExpense interface
export class Expense implements IExpense {
  id: string;
  userId: string;
  amount: number;
  date: Date;
  category: string;
  description?: string;
  paymentMethod: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;

  constructor(
    userId: string,
    amount: number,
    date: Date,
    category: string,
    paymentMethod: string,
    description?: string,
    tags?: string[]
  ) {
    this.id = generateId();
    this.userId = userId;
    this.amount = amount;
    this.date = date;
    this.category = category;
    this.paymentMethod = paymentMethod;
    this.description = description;
    this.tags = tags || [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // Save expense to in-memory store
  async save(): Promise<Expense> {
    // Add to data store
    dataStore.expenses.push(this);
    return this;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      amount: this.amount,
      date: this.date,
      category: this.category,
      description: this.description,
      paymentMethod: this.paymentMethod,
      tags: this.tags,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

// Static methods to replace Mongoose methods
export default class ExpenseModel {
  static async find(query: { userId?: string }): Promise<Expense[]> {
    if (query.userId) {
      const expenses = dataStore.expenses.filter(e => e.userId === query.userId);
      return expenses.map(e => Object.assign(new Expense(
        e.userId,
        e.amount,
        e.date,
        e.category,
        e.paymentMethod,
        e.description,
        e.tags
      ), e));
    }
    
    return [];
  }

  static async findOne(query: { id?: string }): Promise<Expense | null> {
    if (query.id) {
      const expense = dataStore.expenses.find(e => e.id === query.id);
      if (!expense) return null;
      
      return Object.assign(new Expense(
        expense.userId,
        expense.amount,
        expense.date,
        expense.category,
        expense.paymentMethod,
        expense.description,
        expense.tags
      ), expense);
    }
    
    return null;
  }

  static async findByIdAndDelete(id: string): Promise<Expense | null> {
    const expenseIndex = dataStore.expenses.findIndex(e => e.id === id);
    if (expenseIndex === -1) return null;
    
    const expense = dataStore.expenses[expenseIndex];
    const deletedExpense = Object.assign(new Expense(
      expense.userId,
      expense.amount,
      expense.date,
      expense.category,
      expense.paymentMethod,
      expense.description,
      expense.tags
    ), expense);
    
    dataStore.expenses.splice(expenseIndex, 1);
    return deletedExpense;
  }

  static async findByIdAndUpdate(
    id: string,
    updates: Partial<ExpenseData>,
    options: { new: boolean }
  ): Promise<Expense | null> {
    const expenseIndex = dataStore.expenses.findIndex(e => e.id === id);
    if (expenseIndex === -1) return null;
    
    // Apply updates
    const updatedExpense = { ...dataStore.expenses[expenseIndex], ...updates, updatedAt: new Date() };
    dataStore.expenses[expenseIndex] = updatedExpense;
    
    return Object.assign(new Expense(
      updatedExpense.userId,
      updatedExpense.amount,
      updatedExpense.date,
      updatedExpense.category,
      updatedExpense.paymentMethod,
      updatedExpense.description,
      updatedExpense.tags
    ), updatedExpense);
  }
}