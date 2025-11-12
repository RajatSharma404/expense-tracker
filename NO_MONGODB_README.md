# Expense Tracker - No MongoDB Version

This version of the Expense Tracker application has been modified to work without MongoDB. It uses in-memory storage instead, which means all data will be lost when the server is restarted.

## Changes Made

1. Removed MongoDB dependency and all Mongoose models
2. Created in-memory data storage using JavaScript objects
3. Updated all routes to work with in-memory storage
4. Maintained the same API structure for frontend compatibility

## How It Works

- All data (users, expenses, budgets, recurring items) is stored in memory
- Data is lost when the server restarts
- Perfect for testing and development without database setup

## Running the Application

### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm run dev
   ```

### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

All API endpoints remain the same as the original version:

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create a new expense
- `GET /api/expenses/:id` - Get a specific expense
- `PUT /api/expenses/:id` - Update an expense
- `DELETE /api/expenses/:id` - Delete an expense
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create a new budget
- `GET /api/budgets/:id` - Get a specific budget
- `PUT /api/budgets/:id` - Update a budget
- `DELETE /api/budgets/:id` - Delete a budget
- `GET /api/recurring` - Get all recurring items
- `POST /api/recurring` - Create a new recurring item
- `GET /api/recurring/:id` - Get a specific recurring item
- `PUT /api/recurring/:id` - Update a recurring item
- `DELETE /api/recurring/:id` - Delete a recurring item
- `POST /api/recurring/:id/process` - Process a recurring item
- `GET /api/analytics/by-category` - Get spending by category
- `GET /api/analytics/monthly-trends` - Get monthly spending trends
- `GET /api/analytics/daily` - Get daily spending
- `GET /api/analytics/summary` - Get summary statistics
- `GET /api/analytics/compare` - Compare spending periods
- `GET /api/export/csv` - Export expenses as CSV

## Limitations

- Data is not persisted between server restarts
- Not suitable for production use
- No data backup or recovery options
- Limited to single server instance

## Testing

You can test the API endpoints using the provided test script:

```
cd backend
node test-api.js
```

This will test the authentication endpoints to verify the application is working correctly.