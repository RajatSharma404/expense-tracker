# 💰 Expense Tracker

A full-featured expense tracking application with a modern React frontend and Node.js/Express backend. Track your expenses, manage budgets, set up recurring transactions, and analyze your spending patterns with beautiful visualizations.

## ✨ Features

### Core Features

1. **User Authentication & Account Management**

   - Secure user registration and login
   - JWT-based authentication
   - Profile management

2. **Real-Time Expense Logging**

   - Quick expense entry with amount, date, category, description
   - Multiple payment methods (Cash, Card, Digital Wallet, Bank Transfer)
   - Tags for advanced organization
   - Full CRUD operations

3. **Expense Categorization**

   - Predefined categories: Food & Dining, Transportation, Shopping, Entertainment, Utilities & Bills, Healthcare, Education, Miscellaneous
   - Easy filtering and organization

4. **Budget Management**

   - Create monthly or yearly budgets
   - Category-specific or overall budgets
   - Visual progress indicators
   - Budget tracking with spending alerts

5. **Analytics & Visual Reports**

   - Pie charts showing spending by category
   - Monthly spending trend lines
   - Daily spending bar charts
   - Summary statistics
   - Period comparison

6. **Recurring Expenses Management**

   - Set up recurring expenses (rent, subscriptions, etc.)
   - Set up recurring income (salary)
   - Daily, weekly, monthly, or yearly frequency
   - Automatic processing

7. **Data Storage & Persistence**

   - MongoDB database for all data (default version)
   - In-memory storage (no-MongoDB version available)
   - Secure user data isolation
   - Cloud-ready architecture

### Advanced Features

- **Export Functionality**: Export reports as CSV or PDF
- **Responsive Design**: Beautiful, modern UI with Tailwind CSS
- **Real-time Updates**: Instant data synchronization

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance) - for default version
- npm or yarn

### Installation Options

#### Option 1: Default Version (with MongoDB)

1. **Clone the repository**

   ```bash
   cd "Expense Tracker"
   ```

2. **Install dependencies**

   ```bash
   npm run install:all
   ```

3. **Set up environment variables**

   Create `backend/.env` file:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/expense-tracker
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

   For MongoDB Atlas (cloud), use:

   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker
   ```

4. **Start the backend**

   ```bash
   npm run dev:backend
   ```

   The backend will run on `http://localhost:5000`

5. **Start the frontend** (in a new terminal)

   ```bash
   npm run dev:frontend
   ```

   The frontend will run on `http://localhost:3000`

6. **Open your browser**
   Navigate to `http://localhost:3000`

#### Option 2: No-MongoDB Version (In-Memory Storage)

If you want to run the application without MongoDB:

1. **Check the separate README**: [NO_MONGODB_README.md](NO_MONGODB_README.md)

2. **Install dependencies**

   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Start the backend**

   ```bash
   cd backend && npm run dev
   ```

4. **Start the frontend** (in a new terminal)

   ```bash
   cd frontend && npm run dev
   ```

**Note**: In the no-MongoDB version, all data is stored in memory and will be lost when the server restarts.

## 📁 Project Structure

```
Expense Tracker/
├── backend/
│   ├── src/
│   │   ├── models/          # Data models (MongoDB or in-memory)
│   │   ├── routes/          # API routes (auth, expenses, budgets, etc.)
│   │   ├── middleware/      # Authentication middleware
│   │   └── server.ts        # Express server setup
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context (Auth)
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Expenses

- `GET /api/expenses` - Get all expenses (with filters)
- `GET /api/expenses/:id` - Get single expense
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Budgets

- `GET /api/budgets` - Get all budgets
- `GET /api/budgets/:id` - Get budget with spending stats
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Recurring

- `GET /api/recurring` - Get all recurring items
- `POST /api/recurring` - Create recurring item
- `PUT /api/recurring/:id` - Update recurring item
- `POST /api/recurring/:id/process` - Process recurring item
- `DELETE /api/recurring/:id` - Delete recurring item

### Analytics

- `GET /api/analytics/by-category` - Spending by category
- `GET /api/analytics/monthly-trends` - Monthly trends
- `GET /api/analytics/daily` - Daily spending
- `GET /api/analytics/summary` - Summary statistics
- `GET /api/analytics/compare` - Compare periods

### Export

- `GET /api/export/csv` - Export expenses as CSV
- `GET /api/export/pdf` - Export expenses as PDF

## 🛠️ Tech Stack

### Backend

- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose (default) or in-memory storage (no-MongoDB version)
- **JWT** for authentication
- **bcryptjs** for password hashing
- **PDFKit** and **csv-writer** for exports

### Frontend

- **React** with TypeScript
- **Vite** for fast development
- **React Router** for routing
- **Tailwind CSS** for styling
- **Chart.js** with react-chartjs-2 for visualizations
- **Axios** for API calls
- **React Hot Toast** for notifications

## 📊 Database Schema

### User

- email (unique)
- password (hashed)
- name
- createdAt

### Expense

- userId
- amount
- date
- category
- description
- paymentMethod
- tags
- createdAt, updatedAt

### Budget

- userId
- category (optional)
- amount
- period (monthly/yearly)
- startDate, endDate
- createdAt, updatedAt

### Recurring

- userId
- type (expense/income)
- amount
- category
- description
- frequency (daily/weekly/monthly/yearly)
- startDate, endDate
- nextDueDate
- isActive
- createdAt, updatedAt

## 🎨 Features in Detail

### Dashboard

- Overview of total expenses
- Monthly spending summary
- Active budgets count
- Recent expenses list
- Budget status with progress bars

### Expense Management

- Add, edit, delete expenses
- Filter by date range, category, payment method
- Tag support for organization
- Quick entry form

### Budget Tracking

- Create category-specific or overall budgets
- Visual progress indicators
- Color-coded alerts (green/yellow/red)
- Budget exceeded warnings

### Analytics

- Interactive pie charts for category breakdown
- Line charts for monthly trends
- Bar charts for daily spending
- Summary statistics
- Export capabilities

### Recurring Transactions

- Set up recurring expenses and income
- Multiple frequency options
- Automatic processing
- Active/inactive status

## 🔒 Security

- Passwords are hashed using bcryptjs
- JWT tokens for secure authentication
- User data isolation (users can only access their own data)
- Input validation on both frontend and backend

## 🚀 Deployment

### Backend Deployment

1. Set environment variables in your hosting platform
2. Ensure MongoDB connection string is correct (for default version)
3. Build: `cd backend && npm run build`
4. Start: `npm start`

### Frontend Deployment

1. Build: `cd frontend && npm run build`
2. Deploy the `dist` folder to your hosting platform
3. Update API URL in environment variables if needed

## 📝 License

MIT License - feel free to use this project for your hackathon or personal projects!

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## 📧 Support

If you encounter any issues, please check:

1. MongoDB is running and accessible (for default version)
2. Environment variables are set correctly
3. All dependencies are installed
4. Ports 3000 and 5000 are available

---

**Happy Expense Tracking! 💰📊**#   e x p e n s e - t r a c k e r  
 