#!/bin/bash
# Git setup script for Expense Tracker

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Expense Tracker application with dark theme

- Full-stack expense tracking application
- React frontend with dark theme
- Node.js/Express backend with MongoDB
- User authentication and authorization
- Expense management with CRUD operations
- Budget tracking and monitoring
- Recurring transactions support
- Analytics with charts and visualizations
- Export functionality (CSV/PDF)
- Modern dark-themed UI
- Responsive design
- Unified dev setup with concurrently"

echo "✅ Git repository initialized and initial commit created!"
echo ""
echo "To push to a remote repository:"
echo "1. Create a repository on GitHub/GitLab"
echo "2. Run: git remote add origin <repository-url>"
echo "3. Run: git push -u origin main"
echo ""
echo "Or if using 'master' branch:"
echo "git branch -M main"
echo "git remote add origin <repository-url>"
echo "git push -u origin main"

