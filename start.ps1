# Job Application Tracker - Quick Start Script
# This script helps you start all services quickly

Write-Host "🚀 Job Application Tracker - Starting Services..." -ForegroundColor Green
Write-Host ""

# Check if MongoDB is running
Write-Host "📦 Checking MongoDB..." -ForegroundColor Yellow
$mongoProcess = Get-Process mongod -ErrorAction SilentlyContinue
if ($mongoProcess) {
    Write-Host "✅ MongoDB is running" -ForegroundColor Green
} else {
    Write-Host "❌ MongoDB is not running. Please start MongoDB first." -ForegroundColor Red
    Write-Host "   Windows: net start MongoDB" -ForegroundColor Cyan
    Write-Host "   Mac: brew services start mongodb-community" -ForegroundColor Cyan
    Write-Host "   Linux: sudo systemctl start mongod" -ForegroundColor Cyan
    exit 1
}

Write-Host ""

# Check if Redis is running (optional)
Write-Host "📦 Checking Redis (optional)..." -ForegroundColor Yellow
$redisProcess = Get-Process redis-server -ErrorAction SilentlyContinue
if ($redisProcess) {
    Write-Host "✅ Redis is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  Redis is not running (optional, but recommended)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Ask user what to do
Write-Host "What would you like to do?" -ForegroundColor Cyan
Write-Host "1. Start Backend Only" -ForegroundColor White
Write-Host "2. Start Frontend Only" -ForegroundColor White
Write-Host "3. Start Both (Recommended)" -ForegroundColor White
Write-Host "4. Seed Database" -ForegroundColor White
Write-Host "5. Run Tests" -ForegroundColor White
Write-Host "6. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-6)"

switch ($choice) {
    1 {
        Write-Host ""
        Write-Host "Starting Backend Server..." -ForegroundColor Green
        Set-Location -Path "backend"
        
        # Check if node_modules exists
        if (-Not (Test-Path "node_modules")) {
            Write-Host "Installing dependencies..." -ForegroundColor Yellow
            npm install
        }
        
        # Check if .env exists
        if (-Not (Test-Path ".env")) {
            Write-Host ".env file not found. Copying from .env.example..." -ForegroundColor Yellow
            Copy-Item ".env.example" ".env"
            Write-Host "Please edit backend/.env with your credentials before continuing." -ForegroundColor Red
            Write-Host "Required: OPENAI_API_KEY, SMTP_USER, SMTP_PASS" -ForegroundColor Yellow
            pause
        }
        
        Write-Host ""
        Write-Host "Backend starting on http://localhost:5000" -ForegroundColor Green
        Write-Host "Health check: http://localhost:5000/health" -ForegroundColor Cyan
        Write-Host ""
        npm run dev
    }
    
    2 {
        Write-Host ""
        Write-Host "Starting Frontend Server..." -ForegroundColor Green
        Set-Location -Path "frontend"
        
        # Check if node_modules exists
        if (-Not (Test-Path "node_modules")) {
            Write-Host "Installing dependencies..." -ForegroundColor Yellow
            npm install
        }
        
        Write-Host ""
        Write-Host "Frontend starting on http://localhost:3000" -ForegroundColor Green
        Write-Host ""
        npm start
    }
    
    3 {
        Write-Host ""
        Write-Host "Starting Both Backend and Frontend..." -ForegroundColor Green
        Write-Host ""
        
        # Start backend in new window
        Write-Host "Starting Backend in new window..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; if (-Not (Test-Path 'node_modules')) { npm install }; if (-Not (Test-Path '.env')) { Copy-Item '.env.example' '.env'; Write-Host 'Please configure backend/.env file' -ForegroundColor Red; pause }; Write-Host 'Backend running on http://localhost:5000' -ForegroundColor Green; npm run dev"
        
        Start-Sleep -Seconds 5
        
        # Start frontend in new window
        Write-Host "Starting Frontend in new window..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; if (-Not (Test-Path 'node_modules')) { npm install }; Write-Host 'Frontend running on http://localhost:3000' -ForegroundColor Green; npm start"
        
        Write-Host ""
        Write-Host "Services are starting!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
        Write-Host "Health: http://localhost:5000/health" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Default Login Credentials:" -ForegroundColor Yellow
        Write-Host "Admin: admin@example.com / admin123" -ForegroundColor White
        Write-Host "Recruiter: recruiter@example.com / recruiter123" -ForegroundColor White
        Write-Host "User: user1@example.com / user123" -ForegroundColor White
        Write-Host ""
        Write-Host "Note: You need to seed the database first if this is your first run!" -ForegroundColor Yellow
        Write-Host "Run: cd backend && node scripts/seed.js" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Press any key to exit this window..." -ForegroundColor Gray
        pause
    }
    
    4 {
        Write-Host ""
        Write-Host "Seeding Database..." -ForegroundColor Green
        Set-Location -Path "backend"
        
        if (-Not (Test-Path "node_modules")) {
            Write-Host "Installing dependencies first..." -ForegroundColor Yellow
            npm install
        }
        
        Write-Host ""
        node scripts/seed.js
        Write-Host ""
        Write-Host "Database seeded successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "You can now login with these credentials:" -ForegroundColor Yellow
        Write-Host "Admin: admin@example.com / admin123" -ForegroundColor White
        Write-Host "Recruiter: recruiter@example.com / recruiter123" -ForegroundColor White
        Write-Host "User: user1@example.com / user123" -ForegroundColor White
        Write-Host ""
        pause
    }
    
    5 {
        Write-Host ""
        Write-Host "Running Tests..." -ForegroundColor Green
        Write-Host ""
        
        # Backend tests
        Write-Host "Testing Backend..." -ForegroundColor Yellow
        Set-Location -Path "backend"
        npm test
        
        Write-Host ""
        Write-Host "Testing Frontend..." -ForegroundColor Yellow
        Set-Location -Path "../frontend"
        npm test -- --watchAll=false
        
        Write-Host ""
        Write-Host "Tests completed!" -ForegroundColor Green
        pause
    }
    
    6 {
        Write-Host ""
        Write-Host "Goodbye!" -ForegroundColor Green
        exit 0
    }
    
    default {
        Write-Host ""
        Write-Host "Invalid choice. Please run the script again." -ForegroundColor Red
        exit 1
    }
}
