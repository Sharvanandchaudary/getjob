# 🚀 Deployment Guide

Complete guide to deploy the Job Application Tracking System to production.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [MongoDB Atlas Setup](#1-mongodb-atlas-setup)
3. [Google Cloud Platform Deployment](#2-google-cloud-platform-deployment)
4. [Alternative Deployment Options](#3-alternative-deployment-options)
5. [Environment Configuration](#4-environment-configuration)
6. [Post-Deployment](#5-post-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
- ✅ **GitHub Account** (for source code)
- ✅ **MongoDB Atlas Account** (free tier available)
- ✅ **Google Cloud Platform Account** (free $300 credit)
- ✅ **OpenAI Account** (for AI features, optional)
- ✅ **Gmail Account** (for email notifications)

### Required Tools
```bash
# Install Node.js 18+
https://nodejs.org/

# Install Git
https://git-scm.com/

# Install Docker (for containerization)
https://www.docker.com/

# Install gcloud CLI (for GCP deployment)
https://cloud.google.com/sdk/docs/install
```

---

## 1. MongoDB Atlas Setup

MongoDB Atlas provides a **free cloud-hosted MongoDB database** (M0 tier with 512MB storage).

### Step 1.1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google account
3. Complete verification

### Step 1.2: Create a Free Cluster
1. Click **"Build a Database"**
2. Choose **"M0 FREE"** tier
3. Select provider: **AWS** (recommended)
4. Select region: **us-east-1** (or closest to your users)
5. Cluster name: `ClusterApp` (or your choice)
6. Click **"Create"** (takes 3-5 minutes)

### Step 1.3: Create Database User
1. Click **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `appuser`
5. Password: Generate secure password or use: `dbuseradmin`
6. Database User Privileges: **Read and write to any database**
7. Click **"Add User"**

### Step 1.4: Configure Network Access
1. Click **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - For production, whitelist only your GCP Cloud Run IPs
4. Click **"Confirm"**

### Step 1.5: Get Connection String
1. Click **"Database"** in left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**, Version: **4.1 or later**
5. Copy connection string:
```
mongodb+srv://appuser:<password>@clusterapp.ozstfuw.mongodb.net/?retryWrites=true&w=majority
```
6. Replace `<password>` with your actual password
7. Add database name before `?`:
```
mongodb+srv://appuser:dbuseradmin@clusterapp.ozstfuw.mongodb.net/job-tracker?retryWrites=true&w=majority
```

### Step 1.6: Test Connection
```bash
cd backend
# Update .env with your connection string
node scripts/test-connection.js
# Should output: "MongoDB connected successfully!"
```

---

## 2. Google Cloud Platform Deployment

Deploy to **GCP Cloud Run** - a fully managed serverless platform that automatically scales.

### Step 2.1: Initial GCP Setup

#### 1. Create GCP Account & Project
```bash
# Go to: https://console.cloud.google.com/
# 1. Sign in with Google account
# 2. Activate $300 free credit (requires credit card, but won't charge)
# 3. Click "Select a Project" → "New Project"
# 4. Project name: job-tracker-prod
# 5. Click "Create"
```

#### 2. Install and Initialize gcloud CLI
```bash
# Download and install from: https://cloud.google.com/sdk/docs/install

# Initialize gcloud
gcloud init

# Login
gcloud auth login

# Set project
gcloud config set project job-tracker-prod

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable cloudscheduler.googleapis.com
```

### Step 2.2: Configure Secrets

Store sensitive credentials in GCP Secret Manager:

```bash
# MongoDB connection string
echo -n "mongodb+srv://appuser:dbuseradmin@clusterapp.ozstfuw.mongodb.net/job-tracker?retryWrites=true&w=majority" | \
gcloud secrets create mongodb-uri --data-file=-

# JWT Secret (generate random string)
echo -n "$(openssl rand -base64 32)" | \
gcloud secrets create jwt-secret --data-file=-

# OpenAI API Key (get from https://platform.openai.com/api-keys)
echo -n "sk-proj-YOUR_OPENAI_KEY_HERE" | \
gcloud secrets create openai-api-key --data-file=-

# Gmail credentials for email notifications
echo -n "your-email@gmail.com" | \
gcloud secrets create smtp-user --data-file=-

echo -n "your-gmail-app-password" | \
gcloud secrets create smtp-pass --data-file=-

# Frontend URL (update after frontend deployment)
echo -n "https://YOUR-FRONTEND-URL.run.app" | \
gcloud secrets create frontend-url --data-file=-
```

**Note**: To generate Gmail App Password:
1. Go to https://myaccount.google.com/apppasswords
2. Enable 2-factor authentication first
3. Create app password for "Mail"
4. Copy the 16-character password

### Step 2.3: Deploy Backend API

```bash
cd backend

# Build and deploy to Cloud Run
gcloud run deploy job-tracker-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,PORT=8080" \
  --set-secrets "MONGODB_URI=mongodb-uri:latest,JWT_SECRET=jwt-secret:latest,OPENAI_API_KEY=openai-api-key:latest,SMTP_USER=smtp-user:latest,SMTP_PASS=smtp-pass:latest,FRONTEND_URL=frontend-url:latest" \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300

# Note the Service URL output (e.g., https://job-tracker-backend-xxx-uc.a.run.app)
```

### Step 2.4: Deploy Frontend

```bash
cd ../frontend

# Update src/config.js with backend URL
# Replace API_URL with your backend URL from previous step

# Build and deploy
gcloud run deploy job-tracker-frontend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 80 \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5

# Note the Service URL output (e.g., https://job-tracker-frontend-xxx-uc.a.run.app)
```

### Step 2.5: Update CORS and Frontend URL

```bash
# Update frontend URL secret
echo -n "https://job-tracker-frontend-xxx-uc.a.run.app" | \
gcloud secrets versions add frontend-url --data-file=-

# Redeploy backend to pick up new frontend URL
gcloud run deploy job-tracker-backend \
  --source ./backend \
  --platform managed \
  --region us-central1 \
  --update-secrets "FRONTEND_URL=frontend-url:latest"
```

### Step 2.6: Setup Cron Jobs (Cloud Scheduler)

```bash
# Create App Engine app (required for Cloud Scheduler)
gcloud app create --region=us-central

# Daily Reports (8 AM daily)
gcloud scheduler jobs create http daily-reports \
  --schedule="0 8 * * *" \
  --uri="https://job-tracker-backend-xxx-uc.a.run.app/api/cron/daily-reports" \
  --http-method=POST \
  --time-zone="America/New_York"

# Hourly Google Sheets Sync
gcloud scheduler jobs create http sheets-sync \
  --schedule="0 * * * *" \
  --uri="https://job-tracker-backend-xxx-uc.a.run.app/api/cron/sync-sheets" \
  --http-method=POST \
  --time-zone="America/New_York"

# Job Scraping (every 6 hours)
gcloud scheduler jobs create http job-scraping \
  --schedule="0 */6 * * *" \
  --uri="https://job-tracker-backend-xxx-uc.a.run.app/api/cron/scrape-jobs" \
  --http-method=POST \
  --time-zone="America/New_York"

# Weekly Summaries (Monday 9 AM)
gcloud scheduler jobs create http weekly-summary \
  --schedule="0 9 * * 1" \
  --uri="https://job-tracker-backend-xxx-uc.a.run.app/api/cron/weekly-summary" \
  --http-method=POST \
  --time-zone="America/New_York"
```

### Step 2.7: Seed Production Database

```bash
cd backend

# Set MongoDB URI environment variable
export MONGODB_URI="mongodb+srv://appuser:dbuseradmin@clusterapp.ozstfuw.mongodb.net/job-tracker?retryWrites=true&w=majority"

# Run seed script
node scripts/seed.js

# Output should show:
# ✅ Database seeded successfully!
# ✅ Admin: admin@getjob.com / admin123
# ✅ Recruiters: 2 created
# ✅ Users: 5 created
# ✅ Applications: 15-35 created
```

### Step 2.8: Verify Deployment

1. **Open Frontend**: `https://job-tracker-frontend-xxx-uc.a.run.app`
2. **Login with Demo Credentials**:
   - Admin: `admin@getjob.com` / `admin123`
   - User: `user1@getjob.com` / `user123`
3. **Test Features**:
   - Create new application (User Dashboard)
   - Update application status (Recruiter Dashboard)
   - View analytics (Admin Dashboard)
   - Check real-time updates (open two browser windows)

---

## 3. Alternative Deployment Options

### Option A: Docker + VPS (DigitalOcean, Linode, AWS EC2)

```bash
# 1. Build Docker images
cd backend
docker build -t job-tracker-backend .

cd ../frontend
docker build -t job-tracker-frontend .

# 2. Push to Docker Hub
docker tag job-tracker-backend yourusername/job-tracker-backend:latest
docker push yourusername/job-tracker-backend:latest

docker tag job-tracker-frontend yourusername/job-tracker-frontend:latest
docker push yourusername/job-tracker-frontend:latest

# 3. On your VPS, create docker-compose.yml
# See docker-compose.yml in repository root

# 4. Deploy
docker-compose up -d
```

### Option B: Heroku (Simple but Paid)

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create apps
heroku create job-tracker-backend
heroku create job-tracker-frontend

# Add MongoDB Atlas addon (or use existing connection string)
heroku config:set MONGODB_URI="mongodb+srv://..." -a job-tracker-backend

# Deploy backend
cd backend
git push heroku main

# Deploy frontend
cd ../frontend
git push heroku main
```

### Option C: Vercel (Frontend) + Railway (Backend)

**Frontend to Vercel:**
```bash
npm install -g vercel
cd frontend
vercel --prod
```

**Backend to Railway:**
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add environment variables in Railway dashboard
5. Deploy automatically triggers

---

## 4. Environment Configuration

### Backend Environment Variables (.env)

```bash
# Server
NODE_ENV=production
PORT=8080

# Database
MONGODB_URI=mongodb+srv://appuser:dbuseradmin@clusterapp.ozstfuw.mongodb.net/job-tracker?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRE=7d

# AI Services
OPENAI_API_KEY=sk-proj-YOUR_OPENAI_KEY_HERE

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password

# Frontend
FRONTEND_URL=https://your-frontend-url.com

# Google Sheets (Optional)
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id

# Redis (Optional - for caching)
REDIS_URL=redis://localhost:6379
```

### Frontend Environment Variables (.env)

```bash
REACT_APP_API_URL=https://your-backend-url.com
REACT_APP_WS_URL=wss://your-backend-url.com
```

---

## 5. Post-Deployment

### 5.1: Custom Domain (Optional)

```bash
# Map custom domain to Cloud Run
gcloud run domain-mappings create \
  --service job-tracker-frontend \
  --domain www.yourjobtracker.com \
  --region us-central1

# Update DNS records with the provided values
```

### 5.2: SSL/HTTPS

GCP Cloud Run automatically provides SSL certificates. For custom domains:
1. Verify domain ownership in Google Search Console
2. Add DNS records provided by GCP
3. Certificate auto-provisions in 15 minutes

### 5.3: Monitoring & Logging

```bash
# View logs
gcloud run services logs read job-tracker-backend --limit 50

# Enable Cloud Monitoring alerts
gcloud alpha monitoring policies create \
  --notification-channels=YOUR_CHANNEL_ID \
  --display-name="High Error Rate" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=0.05
```

### 5.4: Backup Strategy

**MongoDB Atlas Backups (Automatic):**
- M0 free tier: No automatic backups
- M2+ tiers: Continuous backups with point-in-time recovery
- Manual backup: Use `mongodump` command

```bash
# Manual backup
mongodump --uri="mongodb+srv://appuser:dbuseradmin@clusterapp.ozstfuw.mongodb.net/job-tracker" --out=./backup-$(date +%Y%m%d)
```

### 5.5: Performance Optimization

1. **Enable Cloud CDN** for frontend static assets
2. **Configure Cloud Armor** for DDoS protection
3. **Set up Cloud Load Balancer** for multiple regions
4. **Enable Redis** for session caching (speeds up API)

---

## Troubleshooting

### Issue 1: MongoDB Connection Failed

**Error**: `MongooseServerSelectionError: Could not connect to any servers`

**Solutions**:
1. Check IP whitelist in MongoDB Atlas (Network Access)
2. Verify connection string has correct username/password
3. Test connection locally: `node scripts/test-connection.js`
4. Check if behind corporate firewall (use mobile hotspot to test)

### Issue 2: Cloud Run Deployment Fails

**Error**: `ERROR: (gcloud.run.deploy) Image build failed`

**Solutions**:
1. Check Dockerfile syntax
2. Verify all dependencies in package.json
3. Check Cloud Build logs: `gcloud builds list`
4. Ensure billing is enabled on GCP project

### Issue 3: CORS Errors in Browser

**Error**: `Access-Control-Allow-Origin header is not present`

**Solutions**:
1. Update FRONTEND_URL in backend .env
2. Verify CORS configuration in `backend/server.js`
3. Redeploy backend after updating FRONTEND_URL secret

### Issue 4: Email Notifications Not Sending

**Error**: `Invalid login: 535-5.7.8 Username and Password not accepted`

**Solutions**:
1. Enable 2FA on Gmail account
2. Generate App Password at https://myaccount.google.com/apppasswords
3. Use the 16-character app password (not your Gmail password)
4. Test with: `node scripts/send-test-email.js`

### Issue 5: AI Job Matching Not Working

**Error**: `OpenAI API rate limit exceeded`

**Solutions**:
1. Verify OpenAI API key is valid
2. Check billing at https://platform.openai.com/account/billing
3. Add minimum $5 credit to OpenAI account
4. Monitor usage at https://platform.openai.com/usage

### Issue 6: Real-time Updates Not Working

**Error**: WebSocket connection fails

**Solutions**:
1. Verify Socket.io endpoint in frontend config
2. Check if WebSocket is enabled on Cloud Run (default: yes)
3. Test WebSocket connection: `wscat -c wss://your-backend.run.app`
4. Check CORS configuration includes Socket.io origins

---

## 📞 Support

- **Documentation**: See `/docs` folder
- **Issues**: https://github.com/Sharvanandchaudary/getjob/issues
- **Discussions**: https://github.com/Sharvanandchaudary/getjob/discussions

---

## 📝 Deployment Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Database user created with password
- [ ] Network access configured (0.0.0.0/0 or specific IPs)
- [ ] Connection string tested locally
- [ ] GCP project created and billing enabled
- [ ] gcloud CLI installed and authenticated
- [ ] Required GCP APIs enabled (Cloud Run, Cloud Build, Secret Manager)
- [ ] Secrets configured in Secret Manager
- [ ] OpenAI API key obtained (for AI features)
- [ ] Gmail App Password generated (for emails)
- [ ] Backend deployed to Cloud Run
- [ ] Frontend deployed to Cloud Run
- [ ] CORS configured with actual frontend URL
- [ ] Cron jobs scheduled in Cloud Scheduler
- [ ] Database seeded with demo data
- [ ] Application tested with all user roles
- [ ] Custom domain configured (optional)
- [ ] Monitoring and alerts set up
- [ ] Backup strategy implemented

---

**🎉 Congratulations! Your application is now live and production-ready!**

Access your app at: `https://job-tracker-frontend-xxx-uc.a.run.app`

For detailed architecture and API documentation, see:
- `ARCHITECTURE.md` - System design and data flow
- `QUICK_REFERENCE.md` - API endpoints reference
- `docs/` folder - Additional guides and tutorials
