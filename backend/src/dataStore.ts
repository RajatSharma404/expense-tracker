// In-memory data store for the expense tracker
import bcrypt from 'bcryptjs';

// Data structures
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
}

export interface Expense {
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
}

export interface Budget {
  id: string;
  userId: string;
  category?: string;
  amount: number;
  period: 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Recurring {
  id: string;
  userId: string;
  type: 'expense' | 'income';
  amount: number;
  category: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  nextDueDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage
export const dataStore = {
  users: [] as User[],
  expenses: [] as Expense[],
  budgets: [] as Budget[],
  recurring: [] as Recurring[],
};

// Helper functions
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};