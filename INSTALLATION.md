# 🎯 Complete Installation & Usage Guide

## 📋 Table of Contents
1. [System Requirements](#system-requirements)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Running the Application](#running-the-application)
5. [User Guide](#user-guide)
6. [Admin Guide](#admin-guide)
7. [Recruiter Guide](#recruiter-guide)
8. [API Usage](#api-usage)
9. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements
- **OS:** Windows 10/11, macOS 10.15+, or Linux
- **RAM:** 8GB
- **Storage:** 10GB free space
- **Node.js:** v18.0.0 or higher
- **MongoDB:** v6.0 or higher
- **Redis:** v7.0 or higher (optional)

### Recommended Requirements
- **RAM:** 16GB+
- **CPU:** 4 cores
- **Storage:** SSD with 20GB+ free space

---

## Installation

### Step 1: Install Prerequisites

#### Windows (PowerShell)
```powershell
# Install Node.js (download from nodejs.org)
# Or using Chocolatey
choco install nodejs

# Install MongoDB
choco install mongodb

# Install Redis (optional)
choco install redis-64

# Verify installations
node --version
npm --version
mongod --version
```

#### macOS
```bash
# Using Homebrew
brew install node
brew install mongodb-community
brew install redis

# Start services
brew services start mongodb-community
brew services start redis
```

#### Linux (Ubuntu/Debian)
```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Redis
sudo apt-get install redis-server

# Start services
sudo systemctl start mongod
sudo systemctl start redis
```

### Step 2: Clone or Download Project

```powershell
# If using Git
git clone <repository-url>
cd "application tracker"

# Or download and extract ZIP file
```

### Step 3: Install Backend Dependencies

```powershell
cd backend
npm install
```

Expected output: Installation of ~30 packages including:
- express
- mongoose
- socket.io
- openai
- nodemailer
- and more...

### Step 4: Install Frontend Dependencies

```powershell
cd ..\frontend
npm install
```

Expected output: Installation of ~1000+ packages including:
- react
- material-ui
- axios
- socket.io-client
- and more...

---

## Configuration

### Backend Configuration

1. **Copy environment file:**
```powershell
cd backend
cp .env.example .env
```

2. **Edit .env file:**
```powershell
notepad .env
```

3. **Required Configuration:**

```env
# Server
PORT=5000
NODE_ENV=development
JWT_SECRET=generate-a-random-secret-key-here
JWT_EXPIRE=7d

# Database
MONGODB_URI=mongodb://localhost:27017/job-tracker
REDIS_URL=redis://localhost:6379

# OpenAI (Required for AI features)
OPENAI_API_KEY=sk-proj-YOUR-KEY-HERE
OPENAI_MODEL=gpt-4-turbo-preview

# Email (Required for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=Job Tracker <noreply@jobtracker.com>

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Google Sheets (Optional)
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
SPREADSHEET_ID=your-spreadsheet-id

# Job APIs (Optional)
ADZUNA_API_ID=your-adzuna-id
ADZUNA_API_KEY=your-adzuna-key
```

### Getting API Keys

#### OpenAI API Key
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Go to API Keys section
4. Click "Create new secret key"
5. Copy the key (starts with `sk-proj-...`)
6. Add to `.env` file

#### Gmail App Password
1. Enable 2-Factor Authentication on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer"
4. Generate password
5. Copy the 16-character password (format: xxxx-xxxx-xxxx-xxxx)
6. Add to `.env` as SMTP_PASS (remove spaces)

#### Google Sheets Setup (Optional)
1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable Google Sheets API
4. Create Service Account
5. Download JSON key file
6. Extract `client_email` and `private_key` to `.env`
7. Create a Google Sheet and copy its ID from URL
8. Share the sheet with the service account email

---

## Running the Application

### Method 1: Development Mode (Recommended for testing)

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

Expected output:
```
Server running on port 5000 in development mode
MongoDB connected successfully
All cron jobs initialized successfully
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm start
```

Expected output:
```
Compiled successfully!
You can now view job-tracker-frontend in the browser.
Local: http://localhost:3000
```

### Method 2: Production Mode

**Backend:**
```powershell
cd backend
npm start
```

**Frontend (build and serve):**
```powershell
cd frontend
npm run build
# Serve the build folder with a static server
```

### Verify Installation

1. Open browser: http://localhost:3000
2. You should see the login page
3. Check backend: http://localhost:5000/health
   - Expected: `{"status":"healthy","timestamp":"...","uptime":123}`

---

## User Guide

### For Job Seekers (Users)

#### 1. Registration
1. Go to http://localhost:3000
2. Click "Register"
3. Fill in:
   - Email
   - Password (min 6 characters)
   - First Name
   - Last Name
   - Phone (optional)
4. Click "Register"

#### 2. Upload Resume
1. Login to your account
2. Go to Dashboard
3. Click "Upload Resume"
4. Select PDF file (max 5MB)
5. Wait for AI analysis
6. Review extracted skills and experience

#### 3. View Job Recommendations
1. Click "Job Recommendations" in menu
2. AI shows matched jobs with scores
3. Click "View Job" to see details
4. Click "Apply" to track application

#### 4. Add Application Manually
1. Click "Applications" in menu
2. Click "Add Application" button
3. Fill in:
   - Company name
   - Position title
   - Job URL (optional)
   - Location
   - Salary range (optional)
4. Click "Submit"

#### 5. Track Applications
1. View all applications in dashboard
2. See status: Applied, Screening, Interview, Offer, etc.
3. Click on application for details
4. Add personal notes
5. View recruiter notes (if assigned)

#### 6. Email Notifications
- **Daily Report:** Receive at 8 AM with:
  - Application updates
  - New job recommendations
  - Interview reminders
- **Status Changes:** Instant email when recruiter updates status
- **Job Matches:** Weekly digest of new matched jobs

---

## Recruiter Guide

### For Recruiters

#### 1. Login
- Use recruiter credentials
- Email: recruiter@example.com
- Password: recruiter123 (change after first login)

#### 2. View Assigned Candidates
1. Dashboard shows all assigned candidates
2. See their applications and status
3. Click candidate to view resume
4. Filter by status, company, date

#### 3. Update Application Status
1. Click on an application
2. Change status dropdown:
   - Applied
   - Screening
   - Interview
   - Technical Round
   - Offer
   - Accepted
   - Rejected
3. Add notes (visible to admin only or candidate)
4. Set interview date
5. Click "Update"

#### 4. Add Notes
1. Open application details
2. Click "Add Note"
3. Write feedback
4. Choose visibility:
   - Private (only recruiters/admin)
   - Public (visible to candidate)
5. Submit

#### 5. View Performance
- Dashboard shows statistics:
  - Total candidates assigned
  - Applications by status
  - Placement rate
  - Activity timeline

---

## Admin Guide

### For System Administrators

#### 1. Login
- Email: admin@example.com
- Password: admin123 (CHANGE IMMEDIATELY)

#### 2. Dashboard Overview
- Total users, applications, jobs
- Recent activity feed
- System health status
- Charts and analytics

#### 3. User Management
1. Click "Users" in menu
2. View all users (applicants, recruiters, admins)
3. Actions:
   - **Activate/Deactivate:** Toggle user access
   - **Change Role:** Convert user to recruiter
   - **Delete User:** Remove completely
   - **View Details:** See full profile

#### 4. Assign Candidates to Recruiters
1. Click "Assign Candidates"
2. Select candidate from dropdown
3. Select recruiter
4. Click "Assign"
5. Candidate's applications auto-assigned to recruiter

#### 5. View All Applications
1. Click "Applications"
2. Filter by:
   - Status
   - Company
   - Date range
   - Recruiter
3. Export to CSV
4. Bulk actions

#### 6. System Analytics
- **Users:** Registration trends, active users
- **Applications:** Success rates, popular companies
- **Recruiters:** Performance metrics
- **Jobs:** Source analysis, match rates

#### 7. Google Sheets Sync
1. Click "Sync to Sheets" button
2. Wait for confirmation
3. Open Google Sheet to view data
4. Sheets updated automatically every hour

#### 8. Manual Actions
- **Send Test Email:** Verify email configuration
- **Trigger Daily Report:** Send reports immediately
- **Scrape Jobs:** Manually trigger job collection
- **Clear Cache:** Reset Redis cache

---

## API Usage

### Authentication

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Response includes token:
```json
{
  "success": true,
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Using the API

All protected endpoints require Authorization header:
```bash
curl -X GET http://localhost:5000/api/applications \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Example: Create Application
```bash
curl -X POST http://localhost:5000/api/applications \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company": "Google",
    "position": "Software Engineer",
    "location": "Mountain View, CA",
    "jobUrl": "https://careers.google.com/jobs/123",
    "status": "applied"
  }'
```

---

## Troubleshooting

### Common Issues

#### 1. Backend Won't Start

**Error:** `MongoDB connection error`
```powershell
# Check if MongoDB is running
mongod --version

# Start MongoDB
# Windows:
net start MongoDB
# Mac/Linux:
brew services start mongodb-community
# Or:
sudo systemctl start mongod
```

**Error:** `Port 5000 is already in use`
```powershell
# Find process using port 5000
netstat -ano | findstr :5000
# Kill the process (replace PID)
taskkill /PID <PID> /F
# Or change PORT in .env
```

#### 2. Frontend Won't Start

**Error:** `Node modules not found`
```powershell
cd frontend
rm -r node_modules package-lock.json
npm install
```

**Error:** `Port 3000 already in use`
- Frontend will offer to run on different port (3001)
- Or kill process: `taskkill /F /IM node.exe`

#### 3. Email Not Sending

**Error:** `SMTP authentication failed`
- Verify Gmail app password is correct
- Ensure 2FA is enabled
- Check SMTP_USER and SMTP_PASS in .env
- Try without special characters in password

**Error:** `Connection timeout`
- Check firewall settings
- Verify internet connection
- Try different SMTP_PORT (465, 587, 25)

#### 4. AI Features Not Working

**Error:** `OpenAI API error`
- Verify API key is correct
- Check quota: https://platform.openai.com/usage
- Ensure you have credits/billing set up
- Try different model: gpt-3.5-turbo

#### 5. Real-time Updates Not Working

**Symptoms:** Status changes don't appear immediately
- Check browser console for WebSocket errors
- Verify backend Socket.io is running
- Check CORS settings
- Try refreshing the page

#### 6. Database Issues

**Error:** `Collection not found`
```powershell
# Seed database
cd backend
node scripts/seed.js
```

**Error:** `Duplicate key error`
```powershell
# Clear database and reseed
mongo
> use job-tracker
> db.dropDatabase()
> exit
node scripts/seed.js
```

---

## Testing the System

### End-to-End Test

1. **Start services:**
   - MongoDB running
   - Backend running (port 5000)
   - Frontend running (port 3000)

2. **Register as user:**
   - Go to http://localhost:3000/register
   - Create account

3. **Upload resume:**
   - Dashboard → Upload Resume
   - Check AI analysis results

4. **Get job recommendations:**
   - Click "Job Recommendations"
   - View matched jobs

5. **Add application:**
   - Click "Add Application"
   - Fill details and submit

6. **Check email:**
   - Wait for daily report (or trigger manually)
   - Verify email received

7. **Test real-time:**
   - Open two browsers
   - Login as recruiter in one
   - Login as user in other
   - Update application status as recruiter
   - See instant update in user browser

### Manual Testing Checklist

- [ ] User registration works
- [ ] Login successful
- [ ] Dashboard loads
- [ ] Resume upload works
- [ ] AI analysis completes
- [ ] Job recommendations display
- [ ] Application creation works
- [ ] Status updates in real-time
- [ ] Email notifications received
- [ ] Recruiter can view candidates
- [ ] Admin can see analytics
- [ ] Google Sheets sync works

---

## Performance Tips

### Backend Optimization
- Enable Redis caching
- Add database indexes
- Use PM2 for production
- Enable compression
- Monitor memory usage

### Frontend Optimization
- Build for production: `npm run build`
- Enable lazy loading
- Optimize images
- Use CDN for static assets
- Enable service worker

---

## Security Best Practices

1. **Change Default Passwords:**
   - Admin, recruiter, test users

2. **Secure Environment Variables:**
   - Never commit .env to Git
   - Use strong JWT_SECRET
   - Rotate API keys regularly

3. **Database Security:**
   - Enable MongoDB authentication
   - Use strong passwords
   - Restrict network access

4. **API Security:**
   - Enable rate limiting
   - Validate all inputs
   - Use HTTPS in production
   - Keep dependencies updated

---

## Getting Help

### Resources
- 📖 Full Documentation: README.md
- 🏗️ Architecture: ARCHITECTURE.md
- 🚀 Quick Start: QUICKSTART.md
- 🔧 n8n Workflows: n8n-workflows/README.md

### Support Channels
- Check logs: `backend/logs/error.log`
- Review console errors in browser
- Verify environment variables
- Test API endpoints with curl/Postman

### Common Questions

**Q: Can I use a different database?**
A: Currently MongoDB is required, but you can modify the code to support other databases.

**Q: Do I need n8n?**
A: No, the backend has built-in cron jobs. n8n is optional for advanced workflows.

**Q: Can I customize email templates?**
A: Yes, edit `backend/services/emailService.js`

**Q: How do I add more job boards?**
A: Modify `backend/services/aiService.js` scraping functions

**Q: Can users see each other's data?**
A: No, strict role-based access control prevents this.

---

## Next Steps

1. ✅ Complete installation
2. ✅ Seed database with test data
3. ✅ Test all features
4. ✅ Configure email service
5. ✅ Setup OpenAI API
6. ✅ Customize branding
7. ✅ Deploy to production
8. ✅ Setup monitoring
9. ✅ Train users
10. ✅ Go live!

---

**🎉 Congratulations! Your Job Application Tracker is ready to use!**

For production deployment, see DEPLOYMENT.md (coming soon) or contact support.
