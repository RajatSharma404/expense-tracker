import bcrypt from 'bcryptjs';
import { dataStore, User as UserData, generateId, hashPassword, comparePassword } from '../dataStore.js';

export interface IUser extends UserData {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// User class that implements the IUser interface
export class User implements IUser {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;

  constructor(email: string, password: string, name: string) {
    this.id = generateId();
    this.email = email;
    this.password = password;
    this.name = name;
    this.createdAt = new Date();
  }

  // Compare password method
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return comparePassword(candidatePassword, this.password);
  }

  // Save user to in-memory store
  async save(): Promise<User> {
    // Hash password before saving
    this.password = await hashPassword(this.password);
    
    // Add to data store
    dataStore.users.push(this);
    return this;
  }

  // Convert to JSON (excluding password)
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      createdAt: this.createdAt,
    };
  }
}

// Static methods to replace Mongoose methods
export default class UserModel {
  static async findOne(query: { email?: string; id?: string }): Promise<User | null> {
    if (query.email) {
      const user = dataStore.users.find(u => u.email === query.email);
      return user ? Object.assign(new User(user.email, user.password, user.name), user) : null;
    }
    
    if (query.id) {
      const user = dataStore.users.find(u => u.id === query.id);
      return user ? Object.assign(new User(user.email, user.password, user.name), user) : null;
    }
    
    return null;
  }

  static async findById(id: string): Promise<User | null> {
    const user = dataStore.users.find(u => u.id === id);
    return user ? Object.assign(new User(user.email, user.password, user.name), user) : null;
  }

  static async findByIdAndUpdate(id: string, updates: Partial<UserData>, options: { new: boolean }): Promise<User | null> {
    const userIndex = dataStore.users.findIndex(u => u.id === id);
    if (userIndex === -1) return null;
    
    // Apply updates
    const updatedUser = { ...dataStore.users[userIndex], ...updates };
    dataStore.users[userIndex] = updatedUser;
    
    return Object.assign(new User(updatedUser.email, updatedUser.password, updatedUser.name), updatedUser);
  }
}