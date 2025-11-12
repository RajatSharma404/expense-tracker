# Git setup script for Expense Tracker (PowerShell)

# Initialize git repository
git init

# Add all files
git add .

# Configure git user (if not already configured)
if (-not (git config user.name)) {
    git config user.name "Expense Tracker"
    git config user.email "expense@tracker.com"
}

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

Write-Host "✅ Git repository initialized and initial commit created!" -ForegroundColor Green
Write-Host ""
Write-Host "To push to a remote repository:" -ForegroundColor Yellow
Write-Host "1. Create a repository on GitHub/GitLab"
Write-Host "2. Run: git remote add origin <repository-url>"
Write-Host "3. Run: git push -u origin main"
Write-Host ""
Write-Host "Or if using 'master' branch:" -ForegroundColor Yellow
Write-Host "git branch -M main"
Write-Host "git remote add origin <repository-url>"
Write-Host "git push -u origin main"

