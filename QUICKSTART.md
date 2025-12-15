# 🚀 Quick Start Guide - Job Application Tracker

## Prerequisites

Before you begin, ensure you have:
- ✅ Node.js 18+ installed
- ✅ MongoDB 6+ installed and running
- ✅ Redis 7+ installed and running (optional but recommended)
- ✅ OpenAI API key
- ✅ Gmail account (for SMTP)
- ✅ Google Cloud project (for Sheets API - optional)

## 📦 Installation Steps

### 1. Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
notepad .env
```

**Required environment variables:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/job-tracker
JWT_SECRET=your-random-secret-key-here
OPENAI_API_KEY=sk-your-openai-key
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FRONTEND_URL=http://localhost:3000
```

**Start the backend:**
```powershell
# Development mode
npm run dev

# Production mode
npm start
```

### 2. Frontend Setup

```powershell
# Navigate to frontend directory
cd ..\frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will open at: http://localhost:3000

### 3. Database Setup

MongoDB will create collections automatically. For initial data:

```powershell
cd backend
node scripts/seed.js
```

This creates:
- 1 Admin user (admin@example.com / password: admin123)
- 2 Recruiters
- 5 Sample users
- 20 Sample applications

### 4. First Login

1. Open http://localhost:3000
2. Click "Register" or use seed credentials:
   - **Admin:** admin@example.com / admin123
   - **Recruiter:** recruiter@example.com / recruiter123
   - **User:** user@example.com / user123

## 🎯 Quick Feature Test

### For Users (Applicants):
1. Login as user
2. Upload resume (Dashboard → Upload Resume)
3. View AI job recommendations
4. Add new application
5. Track application status

### For Recruiters:
1. Login as recruiter
2. View assigned candidates
3. Update application status
4. Add notes to applications
5. View recruiter dashboard

### For Admin:
1. Login as admin
2. View system analytics
3. Assign candidates to recruiters
4. Export data to Google Sheets
5. Manage all users

## 🔧 Configuration

### Email Setup (Gmail)

1. Go to Google Account Settings
2. Enable 2-Factor Authentication
3. Generate App Password:
   - Go to Security → App Passwords
   - Select "Mail" and "Windows Computer"
   - Copy the 16-character password
4. Add to `.env`:
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=xxxx-xxxx-xxxx-xxxx
   ```

### OpenAI Setup

1. Go to https://platform.openai.com/api-keys
2. Create new API key
3. Add to `.env`:
   ```env
   OPENAI_API_KEY=sk-proj-...
   ```

### Google Sheets Setup (Optional)

1. Go to Google Cloud Console
2. Create new project
3. Enable Google Sheets API
4. Create Service Account
5. Download JSON key file
6. Extract credentials to `.env`:
   ```env
   GOOGLE_SHEETS_CLIENT_EMAIL=...
   GOOGLE_SHEETS_PRIVATE_KEY=...
   SPREADSHEET_ID=your-spreadsheet-id
   ```

## 📊 Testing the System

### Test Daily Reports

```powershell
cd backend
node scripts/send-daily-reports.js
```

Check your email for the daily report!

### Test AI Job Matching

1. Login as user
2. Upload a resume (PDF)
3. Go to "Job Recommendations"
4. Click "Get AI Matches"
5. View matched jobs with scores

### Test Real-time Updates

1. Open two browser windows
2. Login as user in window 1
3. Login as recruiter in window 2
4. Recruiter updates application status
5. User sees real-time notification

### Test Google Sheets Sync

```powershell
cd backend
node scripts/sync-sheets.js
```

Check your Google Sheet for updated data!

## 🐛 Troubleshooting

### Backend won't start
```powershell
# Check MongoDB is running
mongod --version

# Check if port 5000 is available
netstat -ano | findstr :5000

# Check logs
cd backend
type logs\error.log
```

### Frontend won't start
```powershell
# Clear cache
rm -r node_modules
npm install

# Check React version
npm list react
```

### Email not sending
- Verify Gmail app password is correct
- Check SMTP settings in `.env`
- Disable antivirus temporarily
- Check firewall settings

### AI features not working
- Verify OpenAI API key
- Check API quota: https://platform.openai.com/usage
- Ensure you have credits

### Real-time updates not working
- Check WebSocket connection in browser console
- Verify backend server is running
- Check CORS settings

## 📝 Default Credentials

**Admin Account:**
- Email: admin@example.com
- Password: admin123

**Recruiter Account:**
- Email: recruiter@example.com
- Password: recruiter123

**User Account:**
- Email: user@example.com
- Password: user123

**⚠️ Change these passwords in production!**

## 🚀 Next Steps

1. ✅ Customize email templates (`backend/services/emailService.js`)
2. ✅ Add your company logo
3. ✅ Configure job board APIs
4. ✅ Setup n8n workflows (optional)
5. ✅ Configure GitHub Actions
6. ✅ Deploy to production

## 📖 Additional Resources

- Full Documentation: See README.md
- API Documentation: http://localhost:5000/api/docs (after starting server)
- n8n Workflows: See `n8n-workflows/README.md`
- Deployment Guide: See `DEPLOYMENT.md`

## 🆘 Getting Help

If you encounter issues:

1. Check logs: `backend/logs/error.log`
2. Verify all environment variables
3. Ensure all services are running
4. Check network connectivity
5. Review the full README.md

## ✅ Health Check

Verify everything is working:

```powershell
# Check backend health
curl http://localhost:5000/health

# Expected response:
# {"status":"healthy","timestamp":"...","uptime":123.456}
```

## 🎉 You're Ready!

Your Job Application Tracker is now running!

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000
- **Database:** mongodb://localhost:27017

Start tracking applications and let the AI find your perfect job match! 🎯
