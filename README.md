# 🚀 Job Application Tracking System

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A comprehensive **enterprise-grade** job application tracking platform with **AI-powered job matching**, **real-time updates**, **automated reporting**, and **multi-role dashboards**.

---

## 📋 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)

---

## ✨ Features

### 🎯 Core Features
- **Multi-Role Dashboard**: Separate interfaces for Users, Recruiters, and Admins
- **Real-Time Updates**: WebSocket-powered live status changes and notifications
- **AI Job Matching**: GPT-4 powered resume analysis and personalized job recommendations
- **Application Tracking**: Comprehensive tracking through all stages (Applied → Screening → Interview → Offer)
- **Email Automation**: Daily reports, status notifications, and weekly summaries
- **Google Sheets Sync**: Bidirectional data synchronization for easy reporting

### 👥 User Roles & Features

#### 📱 **Job Seekers (Users)**
- Create and track job applications
- Upload resume for AI analysis
- Get personalized job recommendations with match scores
- View application timeline and status history
- Receive daily email summaries

#### 👔 **Recruiters**
- View and manage assigned candidates
- Update application statuses
- Schedule interviews with calendar integration
- Add notes and feedback to applications
- Track pipeline metrics and conversion rates

#### 🔐 **Administrators**
- Manage all users, recruiters, and applications
- Assign candidates to recruiters
- View system-wide analytics and success rates
- Sync data to Google Sheets
- Configure system settings

---

## 🎥 Demo

### Demo Credentials
```
Admin:
  Email: admin@getjob.com
  Password: admin123

Recruiter:
  Email: recruiter1@getjob.com
  Password: recruiter123

User:
  Email: user1@getjob.com
  Password: user123
```

### Screenshots
![User Dashboard](docs/images/user-dashboard.png)
![Recruiter Dashboard](docs/images/recruiter-dashboard.png)
![Admin Dashboard](docs/images/admin-dashboard.png)

---

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Modern UI library with hooks
- **Material-UI (MUI)** - Professional UI components
- **Zustand** - Lightweight state management
- **React Router v6** - Client-side routing
- **Socket.io Client** - Real-time WebSocket connections
- **Axios** - HTTP client with interceptors
- **Recharts** - Data visualization

### **Backend**
- **Node.js 18+** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud NoSQL database
- **Socket.io** - WebSocket server
- **JWT** - Secure authentication
- **Bcrypt** - Password hashing

### **AI & Automation**
- **OpenAI GPT-4** - Resume parsing and job matching
- **Node-cron** - Scheduled tasks
- **Nodemailer** - Email delivery
- **n8n** - Workflow automation (optional)

### **DevOps & Deployment**
- **Docker** - Containerization
- **GitHub Actions** - CI/CD pipeline
- **Google Cloud Platform** - Cloud hosting (Cloud Run)
- **Nginx** - Reverse proxy for frontend

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and **npm 9+**
- **MongoDB Atlas** account (free tier available)
- **Git** for version control

### 1. Clone the Repository
```bash
git clone https://github.com/Sharvanandchaudary/getjob.git
cd getjob
```

### 2. Setup Backend
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB Atlas connection string
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
```

### 4. Seed Database (Optional)
```bash
cd backend
node scripts/seed.js
# Creates demo users, applications, and jobs
```

### 5. Start Development Servers
```bash
# Terminal 1 - Backend (port 5000)
cd backend
npm run dev

# Terminal 2 - Frontend (port 3000)
cd frontend
npm start
```

### 6. Open Application
Navigate to `http://localhost:3000` and login with demo credentials above.

---

## 📦 Installation

### Detailed Setup

See **[INSTALLATION.md](INSTALLATION.md)** for comprehensive installation instructions.

#### Quick Setup Commands

```bash
# 1. Clone repository
git clone https://github.com/Sharvanandchaudary/getjob.git
cd getjob

# 2. Install backend dependencies
cd backend
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your MongoDB Atlas connection string

# 4. Install frontend dependencies
cd ../frontend
npm install

# 5. Seed database with demo data
cd ../backend
node scripts/seed.js

# 6. Start development servers
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd ../frontend
npm start
```

---

## ⚙️ Configuration

### Backend Environment Variables (`backend/.env`)

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://appuser:password@cluster.mongodb.net/job-tracker?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRE=7d

# OpenAI API (for AI features)
OPENAI_API_KEY=sk-proj-YOUR_API_KEY_HERE

# Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-gmail-app-password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Google Sheets (Optional)
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id

# Redis (Optional - for caching)
REDIS_URL=redis://localhost:6379
```

### Frontend Environment Variables (`frontend/.env`)

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5000
```

---

## 💻 Usage

### For Job Seekers

1. **Register Account**: Sign up with email and password
2. **Add Applications**: Track jobs you've applied to
   - Company name
   - Position title
   - Application status
   - Job URL
   - Notes
3. **Upload Resume**: Get AI-powered job recommendations
4. **Track Progress**: Monitor application status in real-time
5. **Receive Updates**: Daily email summaries and status notifications

### For Recruiters

1. **View Candidates**: See all assigned job seekers
2. **Manage Applications**: Update status (Applied → Screening → Interview → Offer)
3. **Schedule Interviews**: Set interview dates and times
4. **Add Notes**: Document feedback and next steps
5. **Track Metrics**: View pipeline statistics and conversion rates

### For Administrators

1. **Manage Users**: View, edit, delete users and recruiters
2. **Assign Candidates**: Match job seekers with recruiters
3. **View Analytics**: System-wide statistics and success rates
4. **Sync Data**: Export to Google Sheets for reporting
5. **Monitor System**: Track application trends and user activity

---

## 🚀 Deployment

For complete deployment instructions, see **[DEPLOYMENT.md](DEPLOYMENT.md)**.

### Quick Deploy to Google Cloud Platform

```bash
# 1. Install gcloud CLI and login
gcloud auth login
gcloud config set project job-tracker-prod

# 2. Deploy backend
cd backend
gcloud run deploy job-tracker-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# 3. Deploy frontend
cd ../frontend
gcloud run deploy job-tracker-frontend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# 4. Setup cron jobs with Cloud Scheduler
gcloud scheduler jobs create http daily-reports \
  --schedule="0 8 * * *" \
  --uri="https://YOUR-BACKEND-URL/api/cron/daily-reports"
```

### Deploy with Docker

```bash
# Build images
docker build -t job-tracker-backend ./backend
docker build -t job-tracker-frontend ./frontend

# Run containers
docker-compose up -d
```

---

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user"
}

# Response: { token, user }
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

# Response: { token, user }
```

### Application Endpoints

#### Get All Applications (User)
```bash
GET /api/applications
Authorization: Bearer <token>

# Response: [{ _id, company, position, status, appliedDate, ... }]
```

#### Create Application
```bash
POST /api/applications
Authorization: Bearer <token>
Content-Type: application/json

{
  "company": "Google",
  "position": "Software Engineer",
  "status": "applied",
  "appliedDate": "2025-01-15",
  "jobUrl": "https://careers.google.com/jobs/123",
  "notes": "Applied through referral"
}

# Response: { _id, company, position, ... }
```

#### Update Application
```bash
PATCH /api/applications/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "interview",
  "notes": "Phone screen scheduled"
}

# Response: { _id, status, ... }
```

### Recruiter Endpoints

#### Get Assigned Candidates
```bash
GET /api/recruiter/candidates
Authorization: Bearer <token>

# Response: [{ _id, firstName, lastName, email, applications: [...] }]
```

#### Update Application Status
```bash
PATCH /api/recruiter/application/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "interview",
  "interviewDate": "2025-01-20T10:00:00Z",
  "notes": "Technical interview scheduled"
}

# Response: { success, application }
```

### Admin Endpoints

#### Get All Users
```bash
GET /api/admin/users
Authorization: Bearer <admin-token>

# Response: [{ _id, email, role, firstName, lastName, ... }]
```

#### Assign Candidate to Recruiter
```bash
POST /api/admin/assign-candidate
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "userId": "user-id-here",
  "recruiterId": "recruiter-id-here"
}

# Response: { success, message }
```

#### Get Analytics
```bash
GET /api/admin/analytics
Authorization: Bearer <admin-token>

# Response: { 
#   totalUsers, 
#   totalApplications, 
#   successRate, 
#   applicationsByStatus: {...} 
# }
```

### AI Endpoints

#### Analyze Resume
```bash
POST /api/ai/analyze-resume
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: resume.pdf

# Response: { 
#   skills: [...], 
#   experience: [...], 
#   recommendations: [...] 
# }
```

#### Get Job Matches
```bash
GET /api/ai/job-matches
Authorization: Bearer <token>

# Response: [{ 
#   title, 
#   company, 
#   url, 
#   matchScore, 
#   skills: [...] 
# }]
```

For complete API documentation, see **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)**.

---

## 🏗️ Project Structure

```
job-application-tracker/
├── backend/                  # Node.js/Express API
│   ├── models/              # MongoDB schemas (User, Application, Job)
│   ├── routes/              # API routes (auth, applications, recruiter, admin, ai)
│   ├── middleware/          # Auth, error handling, rate limiting
│   ├── services/            # Business logic (AI, email, sheets)
│   ├── scripts/             # Utilities (seed, cron jobs)
│   ├── config/              # Configuration files
│   ├── server.js            # Express app setup
│   ├── Dockerfile           # Backend container config
│   └── package.json         # Backend dependencies
│
├── frontend/                 # React application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI components (Navbar, PrivateRoute)
│   │   ├── pages/           # Dashboard pages (Login, Register, User/Recruiter/Admin)
│   │   ├── store/           # Zustand state management
│   │   ├── api/             # API client with Axios
│   │   ├── App.js           # Main app with routing
│   │   └── index.js         # Entry point
│   ├── Dockerfile           # Frontend container config
│   ├── nginx.conf           # Nginx configuration
│   └── package.json         # Frontend dependencies
│
├── docs/                     # Documentation
│   ├── ARCHITECTURE.md      # System design
│   ├── INSTALLATION.md      # Setup guide
│   ├── DEPLOYMENT_GCP.md    # GCP deployment
│   ├── SYSTEM_FLOWS.md      # Data flow diagrams
│   └── QUICK_REFERENCE.md   # API quick reference
│
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions CI/CD
│
├── README.md                # This file
├── DEPLOYMENT.md            # Deployment guide
├── docker-compose.yml       # Docker orchestration
└── .gitignore              # Git ignore rules
```

---

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
npm test

# Run with coverage
npm run test:coverage
```

### Run Frontend Tests
```bash
cd frontend
npm test

# Run in watch mode
npm test -- --watch
```

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Create, read, update, delete applications
- [ ] Upload resume and get AI analysis
- [ ] Recruiter can view assigned candidates
- [ ] Recruiter can update application status
- [ ] Admin can manage users
- [ ] Admin can assign candidates to recruiters
- [ ] Real-time updates work between users
- [ ] Email notifications are sent
- [ ] Google Sheets sync works

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Commit changes**: `git commit -m 'Add some feature'`
4. **Push to branch**: `git push origin feature/your-feature`
5. **Open a Pull Request**

### Code Style

- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenAI** for GPT-4 API
- **MongoDB Atlas** for cloud database
- **Google Cloud Platform** for hosting
- **Material-UI** for beautiful components
- **Socket.io** for real-time capabilities

---

## 📞 Support & Contact

- **GitHub Issues**: [Report bugs or request features](https://github.com/Sharvanandchaudary/getjob/issues)
- **GitHub Discussions**: [Ask questions](https://github.com/Sharvanandchaudary/getjob/discussions)
- **Email**: support@getjob.com

---

## 🗺️ Roadmap

### Planned Features

- [ ] **Mobile App** (React Native)
- [ ] **Calendar Integration** (Google Calendar, Outlook)
- [ ] **Interview Prep** (AI-generated questions based on job description)
- [ ] **Salary Negotiation Tools** (Market data and suggestions)
- [ ] **Chrome Extension** (Quick-add jobs from any website)
- [ ] **Advanced Analytics** (Predictive success rates, time-to-offer estimates)
- [ ] **Video Interview Integration** (Zoom, Google Meet scheduling)
- [ ] **Document Management** (Cover letters, portfolios)
- [ ] **Networking Tools** (LinkedIn integration, referral tracking)
- [ ] **Multi-language Support** (i18n)

---

## 📊 System Status

- **Backend Status**: [![Backend Status](https://img.shields.io/badge/status-operational-green.svg)](https://status.getjob.com)
- **Database**: [![Database](https://img.shields.io/badge/MongoDB-operational-green.svg)](https://cloud.mongodb.com)
- **AI Service**: [![OpenAI](https://img.shields.io/badge/OpenAI-operational-green.svg)](https://status.openai.com)

---

**Built with ❤️ by Sharvanand Chaudary**

[⬆ Back to Top](#-job-application-tracking-system)
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
