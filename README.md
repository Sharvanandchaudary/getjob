# Enterprise Job Application Tracking System

## 🎯 Overview
A comprehensive real-time job application tracking platform with AI-powered job matching, automated reporting, and multi-role dashboards.

## 🏗️ System Architecture

### Frontend
- **React 18** with TypeScript
- **Material-UI** for dashboard components
- **Socket.io Client** for real-time updates
- **React Query** for data fetching
- **Recharts** for analytics visualization

### Backend
- **Node.js + Express** REST API
- **Socket.io** for WebSocket connections
- **JWT** authentication with role-based access
- **MongoDB** for flexible document storage
- **Redis** for session management & caching

### AI & Automation
- **OpenAI GPT-4** for resume analysis and job matching
- **n8n** for workflow automation
- **Node-cron** for scheduled tasks
- **Nodemailer** for email reports

### Integrations
- **Google Sheets API** for data sync
- **GitHub Actions** for CI/CD
- **Multiple Job Boards** scraping integration

## 👥 User Roles & Permissions

### 1. **Applicant/User**
- View their applications and status
- Upload resume for AI analysis
- Get AI-recommended job matches
- Track application progress
- Receive daily email reports

### 2. **Recruiter**
- View assigned candidates
- Update application statuses
- Add notes and feedback
- Track pipeline metrics
- Receive daily assigned candidate reports

### 3. **Admin**
- Full system access
- View all users, recruiters, applications
- Analytics dashboard with charts
- User management
- System-wide reports
- Google Sheets integration management

## 🚀 Features

### Real-Time Synchronization
- Live updates when recruiters change application status
- Instant notifications for users on status changes
- WebSocket-based bi-directional communication
- Optimistic UI updates

### AI Job Matching Agent
- Analyzes resume content using GPT-4
- Extracts skills, experience, preferences
- Searches multiple job boards (Indeed, LinkedIn, Glassdoor)
- Returns curated list of job URLs with match scores
- Automatic job recommendations

### Automated Email Reports
- **Daily 8 AM Report**: All users receive personalized updates
- **Weekly Summary**: Application statistics and trends
- **Instant Notifications**: Status changes, new assignments
- **Admin Digest**: System-wide metrics

### Google Sheets Integration
- Auto-sync all data to Google Sheets
- Real-time updates via n8n workflows
- Backup and reporting
- Accessible spreadsheet dashboard

### n8n Workflows
1. **Daily Report Workflow**: Generates and emails reports
2. **Job Scraping Workflow**: Fetches new job listings
3. **Sheet Sync Workflow**: Updates Google Sheets
4. **Notification Workflow**: Sends real-time alerts

## 📊 Data Models

### User (Applicant)
```javascript
{
  _id, email, password, role: 'user',
  firstName, lastName, phone,
  resume: { text, fileUrl, uploadedAt },
  preferences: { jobTitles, locations, salary },
  applications: [ApplicationId],
  createdAt, updatedAt
}
```

### Recruiter
```javascript
{
  _id, email, password, role: 'recruiter',
  firstName, lastName, company,
  assignedCandidates: [UserId],
  createdAt, updatedAt
}
```

### Admin
```javascript
{
  _id, email, password, role: 'admin',
  firstName, lastName,
  permissions: ['all'],
  createdAt, updatedAt
}
```

### Application
```javascript
{
  _id, userId, jobId,
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected',
  assignedRecruiter: RecruiterId,
  company, position, jobUrl,
  appliedDate, lastUpdate,
  notes: [{ author, text, createdAt }],
  timeline: [{ status, timestamp, updatedBy }]
}
```

### Job
```javascript
{
  _id, title, company, description,
  location, salary, url,
  source: 'manual' | 'ai-scraped',
  matchScore: Number,
  createdAt, expiresAt
}
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Redis 7+
- n8n instance
- Google Cloud Project (for Sheets API)
- OpenAI API key

### Environment Variables
```env
# Server
PORT=5000
NODE_ENV=production
JWT_SECRET=your-secret-key

# Database
MONGODB_URI=mongodb://localhost:27017/job-tracker
REDIS_URL=redis://localhost:6379

# OpenAI
OPENAI_API_KEY=sk-...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Google Sheets
GOOGLE_SHEETS_CLIENT_EMAIL=...
GOOGLE_SHEETS_PRIVATE_KEY=...
SPREADSHEET_ID=...

# n8n
N8N_WEBHOOK_URL=https://your-n8n.com/webhook/...

# Frontend
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5000
```

### Installation

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

#### n8n
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

## 📅 Automated Schedules

### Daily (8:00 AM)
- Generate personalized reports for all users
- Send email digests
- Sync data to Google Sheets
- Scrape new job listings

### Weekly (Monday 9:00 AM)
- Comprehensive analytics report
- Admin system health check
- Data backup

### Real-time
- Application status updates
- New application notifications
- Job recommendations

## 🔐 Security Features
- JWT token authentication
- Password hashing with bcrypt
- Role-based access control
- Rate limiting on API endpoints
- XSS protection
- CORS configuration
- Input validation and sanitization

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Applications (User)
- `GET /api/applications` - Get user's applications
- `POST /api/applications` - Create application
- `GET /api/applications/:id` - Get application details
- `PATCH /api/applications/:id` - Update application

### Recruiter
- `GET /api/recruiter/candidates` - Get assigned candidates
- `PATCH /api/recruiter/application/:id` - Update application status
- `POST /api/recruiter/notes` - Add notes to application

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/recruiters` - Get all recruiters
- `GET /api/admin/applications` - Get all applications
- `GET /api/admin/analytics` - Get system analytics
- `POST /api/admin/assign` - Assign candidate to recruiter

### AI Agent
- `POST /api/ai/analyze-resume` - Upload and analyze resume
- `GET /api/ai/job-matches` - Get AI-matched jobs
- `POST /api/ai/recommend` - Get personalized recommendations

## 🎨 Dashboard Views

### User Dashboard
- Application status cards
- Timeline view of each application
- AI job recommendations
- Upload resume section
- Personal statistics

### Recruiter Dashboard
- Assigned candidates list
- Candidate details and resumes
- Status update interface
- Notes and feedback section
- Performance metrics

### Admin Dashboard
- System overview with charts
- User management table
- Recruiter management
- Application pipeline visualization
- Real-time activity feed
- Export to Google Sheets button

## 🤖 LLM Agent Capabilities

### Resume Analysis
1. Extract key information (skills, experience, education)
2. Identify job preferences and career goals
3. Calculate experience level

### Job Matching
1. Search job boards with extracted keywords
2. Score jobs based on resume match
3. Filter by location, salary, preferences
4. Return top 20 matches with URLs

### Continuous Learning
- Learns from user feedback on recommendations
- Improves matching algorithms over time

## 📧 Email Report Format

### Daily User Report
```
Subject: Your Job Application Update - Dec 14, 2025

Hi [Name],

Applications Summary:
- Total Active: 15
- New Updates: 3
- Interviews Scheduled: 1

Recent Updates:
1. Software Engineer at Google - Moved to "Interview"
2. Frontend Dev at Meta - Status: "Screening"

New AI Recommendations:
- Senior React Developer at Netflix [View Job]
- Full Stack Engineer at Amazon [View Job]

[View Full Dashboard]
```

### Admin Report
```
Subject: Daily System Report - Dec 14, 2025

System Metrics:
- Total Users: 245
- Active Applications: 1,203
- Recruiters: 12
- Applications Today: 34

Top Performing Recruiters:
1. John Doe - 45 placements
2. Jane Smith - 38 placements

[View Admin Dashboard]
```

## 🚀 Deployment

### GitHub Actions Workflow
Automated deployment on push to main branch:
- Run tests
- Build frontend and backend
- Deploy to production server
- Run database migrations
- Trigger n8n workflows

### Production Checklist
- [ ] Environment variables configured
- [ ] Database indexes created
- [ ] Redis cache configured
- [ ] SSL certificates installed
- [ ] n8n workflows imported
- [ ] Google Sheets API enabled
- [ ] SMTP credentials verified
- [ ] OpenAI API key validated
- [ ] Cron jobs scheduled
- [ ] Monitoring setup

## 📈 Scalability
- Horizontal scaling with load balancer
- MongoDB replica set for HA
- Redis cluster for distributed caching
- CDN for static assets
- Queue system (Bull) for background jobs

## 🔍 Monitoring
- Application logs with Winston
- Error tracking with Sentry
- Performance monitoring
- Database query optimization
- Real-time user analytics

## 📞 Support
For issues or questions, contact the development team.

## 📄 License
MIT License
