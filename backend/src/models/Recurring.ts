import { dataStore, Recurring as RecurringData, generateId } from '../dataStore.js';

export interface IRecurring extends RecurringData {}

// Recurring class that implements the IRecurring interface
export class Recurring implements IRecurring {
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

  constructor(
    userId: string,
    type: 'expense' | 'income',
    amount: number,
    category: string,
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly',
    startDate: Date,
    nextDueDate: Date,
    description?: string,
    endDate?: Date,
    isActive: boolean = true
  ) {
    this.id = generateId();
    this.userId = userId;
    this.type = type;
    this.amount = amount;
    this.category = category;
    this.frequency = frequency;
    this.startDate = startDate;
    this.nextDueDate = nextDueDate;
    this.description = description;
    this.endDate = endDate;
    this.isActive = isActive;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // Save recurring to in-memory store
  async save(): Promise<Recurring> {
    // Add to data store
    dataStore.recurring.push(this);
    return this;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      amount: this.amount,
      category: this.category,
      description: this.description,
      frequency: this.frequency,
      startDate: this.startDate,
      endDate: this.endDate,
      nextDueDate: this.nextDueDate,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

// Static methods to replace Mongoose methods
export default class RecurringModel {
  static async find(query: { userId?: string; isActive?: boolean }): Promise<Recurring[]> {
    let recurringItems = dataStore.recurring;
    
    if (query.userId) {
      recurringItems = recurringItems.filter(r => r.userId === query.userId);
    }
    
    if (query.isActive !== undefined) {
      recurringItems = recurringItems.filter(r => r.isActive === query.isActive);
    }
    
    return recurringItems.map(r => Object.assign(new Recurring(
      r.userId,
      r.type,
      r.amount,
      r.category,
      r.frequency,
      r.startDate,
      r.nextDueDate,
      r.description,
      r.endDate,
      r.isActive
    ), r));
  }

  static async findOne(query: { id?: string }): Promise<Recurring | null> {
    if (query.id) {
      const recurring = dataStore.recurring.find(r => r.id === query.id);
      if (!recurring) return null;
      
      return Object.assign(new Recurring(
        recurring.userId,
        recurring.type,
        recurring.amount,
        recurring.category,
        recurring.frequency,
        recurring.startDate,
        recurring.nextDueDate,
        recurring.description,
        recurring.endDate,
        recurring.isActive
      ), recurring);
    }
    
    return null;
  }

  static async findByIdAndDelete(id: string): Promise<Recurring | null> {
    const recurringIndex = dataStore.recurring.findIndex(r => r.id === id);
    if (recurringIndex === -1) return null;
    
    const recurring = dataStore.recurring[recurringIndex];
    const deletedRecurring = Object.assign(new Recurring(
      recurring.userId,
      recurring.type,
      recurring.amount,
      recurring.category,
      recurring.frequency,
      recurring.startDate,
      recurring.nextDueDate,
      recurring.description,
      recurring.endDate,
      recurring.isActive
    ), recurring);
    
    dataStore.recurring.splice(recurringIndex, 1);
    return deletedRecurring;
  }

  static async findByIdAndUpdate(
    id: string,
    updates: Partial<RecurringData>,
    options: { new: boolean }
  ): Promise<Recurring | null> {
    const recurringIndex = dataStore.recurring.findIndex(r => r.id === id);
    if (recurringIndex === -1) return null;
    
    // Apply updates
    const updatedRecurring = { ...dataStore.recurring[recurringIndex], ...updates, updatedAt: new Date() };
    dataStore.recurring[recurringIndex] = updatedRecurring;
    
    return Object.assign(new Recurring(
      updatedRecurring.userId,
      updatedRecurring.type,
      updatedRecurring.amount,
      updatedRecurring.category,
      updatedRecurring.frequency,
      updatedRecurring.startDate,
      updatedRecurring.nextDueDate,
      updatedRecurring.description,
      updatedRecurring.endDate,
      updatedRecurring.isActive
    ), updatedRecurring);
  }
}