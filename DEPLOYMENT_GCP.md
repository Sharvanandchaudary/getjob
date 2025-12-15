# ☁️ GCP Deployment Guide

## Prerequisites

1. **GCP Account**: https://console.cloud.google.com
2. **MongoDB Atlas Account**: https://www.mongodb.com/cloud/atlas (Free M0 tier)
3. **gcloud CLI**: https://cloud.google.com/sdk/docs/install

## Architecture

```
┌─────────────────────────────────────────────────┐
│                 Users/Browsers                  │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│         GCP Cloud Load Balancer                 │
│              (HTTPS/SSL)                        │
└─────┬─────────────────────────────┬─────────────┘
      │                             │
┌─────▼──────────┐         ┌────────▼────────────┐
│  Cloud Run     │         │   Cloud Run         │
│  (Frontend)    │────────▶│   (Backend API)     │
│  React App     │         │   Node.js/Express   │
└────────────────┘         └─────────┬───────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
           ┌────────▼──────┐  ┌─────▼────────┐  ┌───▼──────┐
           │ MongoDB Atlas │  │ Cloud Storage│  │  Redis   │
           │  (Database)   │  │  (Uploads)   │  │ (Cache)  │
           └───────────────┘  └──────────────┘  └──────────┘
```

---

## Step 1: Setup MongoDB Atlas (Free Cloud Database)

### 1.1 Create MongoDB Atlas Account
```bash
# Go to: https://www.mongodb.com/cloud/atlas/register
# 1. Sign up for free
# 2. Create organization
# 3. Create project: "Job Tracker"
```

### 1.2 Create Free Cluster
```bash
# 1. Click "Build a Database"
# 2. Choose "M0 FREE" tier
# 3. Select region closest to your GCP region
# 4. Cluster Name: "job-tracker-cluster"
# 5. Click "Create"
```

### 1.3 Configure Database Access
```bash
# 1. Go to "Database Access"
# 2. Click "Add New Database User"
#    - Username: jobtracker-admin
#    - Password: [Generate secure password - SAVE THIS!]
#    - Database User Privileges: "Read and write to any database"
# 3. Click "Add User"
```

### 1.4 Configure Network Access
```bash
# 1. Go to "Network Access"
# 2. Click "Add IP Address"
# 3. Click "Allow Access from Anywhere" (0.0.0.0/0)
#    (For production, restrict to GCP IP ranges)
# 4. Click "Confirm"
```

### 1.5 Get Connection String
```bash
# 1. Go to "Database" → "Connect"
# 2. Choose "Connect your application"
# 3. Driver: Node.js, Version: 5.5 or later
# 4. Copy connection string - looks like:
mongodb+srv://jobtracker-admin:<password>@job-tracker-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority

# 5. Replace <password> with your actual password
# 6. Add database name before the ?:
mongodb+srv://jobtracker-admin:yourpassword@job-tracker-cluster.xxxxx.mongodb.net/job-tracker?retryWrites=true&w=majority
```

---

## Step 2: Setup GCP Project

### 2.1 Install gcloud CLI
```powershell
# Download from: https://cloud.google.com/sdk/docs/install
# Or use PowerShell:
(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
& $env:Temp\GoogleCloudSDKInstaller.exe
```

### 2.2 Initialize gcloud
```bash
gcloud init

# Follow prompts:
# 1. Login with Google account
# 2. Create new project: "job-tracker-prod"
# 3. Select region: us-central1 (or closest to you)
```

### 2.3 Enable Required APIs
```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable redis.googleapis.com
```

---

## Step 3: Setup Environment Variables in GCP Secret Manager

### 3.1 Create Secrets
```bash
# Set your project ID
gcloud config set project job-tracker-prod

# MongoDB URI
echo "mongodb+srv://username:password@cluster.mongodb.net/job-tracker" | gcloud secrets create MONGODB_URI --data-file=-

# JWT Secret
echo "your-super-secret-jwt-key-change-this-in-production" | gcloud secrets create JWT_SECRET --data-file=-

# OpenAI API Key
echo "sk-proj-your-openai-key" | gcloud secrets create OPENAI_API_KEY --data-file=-

# Gmail SMTP
echo "your-email@gmail.com" | gcloud secrets create SMTP_USER --data-file=-
echo "your-app-password" | gcloud secrets create SMTP_PASS --data-file=-

# Frontend URL (will update after deployment)
echo "https://your-frontend-url.run.app" | gcloud secrets create FRONTEND_URL --data-file=-
```

---

## Step 4: Deploy Backend to Cloud Run

### 4.1 Create Dockerfile for Backend
Already created at `backend/Dockerfile`

### 4.2 Build and Deploy
```bash
cd backend

# Build container
gcloud builds submit --tag gcr.io/job-tracker-prod/backend

# Deploy to Cloud Run
gcloud run deploy job-tracker-backend \
  --image gcr.io/job-tracker-prod/backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="MONGODB_URI=MONGODB_URI:latest,JWT_SECRET=JWT_SECRET:latest,OPENAI_API_KEY=OPENAI_API_KEY:latest,SMTP_USER=SMTP_USER:latest,SMTP_PASS=SMTP_PASS:latest" \
  --set-env-vars="NODE_ENV=production,PORT=8080" \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10

# Note the Service URL - it will look like:
# https://job-tracker-backend-xxxxx-uc.a.run.app
```

---

## Step 5: Deploy Frontend to Cloud Run

### 5.1 Update Frontend API URL
```bash
cd ../frontend

# Edit .env.production
echo "REACT_APP_API_URL=https://job-tracker-backend-xxxxx-uc.a.run.app" > .env.production
```

### 5.2 Build and Deploy
```bash
# Build container
gcloud builds submit --tag gcr.io/job-tracker-prod/frontend

# Deploy to Cloud Run
gcloud run deploy job-tracker-frontend \
  --image gcr.io/job-tracker-prod/frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1

# Note the Service URL - it will look like:
# https://job-tracker-frontend-xxxxx-uc.a.run.app
```

### 5.3 Update Backend CORS Settings
```bash
# Update FRONTEND_URL secret with actual frontend URL
echo "https://job-tracker-frontend-xxxxx-uc.a.run.app" | gcloud secrets versions add FRONTEND_URL --data-file=-

# Redeploy backend to pick up new CORS settings
gcloud run deploy job-tracker-backend \
  --image gcr.io/job-tracker-prod/backend \
  --platform managed \
  --region us-central1
```

---

## Step 6: Setup Cloud Scheduler for Cron Jobs

### 6.1 Create Service Account
```bash
gcloud iam service-accounts create cloud-run-invoker \
  --display-name "Cloud Run Invoker"

gcloud run services add-iam-policy-binding job-tracker-backend \
  --member="serviceAccount:cloud-run-invoker@job-tracker-prod.iam.gserviceaccount.com" \
  --role="roles/run.invoker" \
  --region us-central1
```

### 6.2 Create Cron Jobs
```bash
# Daily Reports (8 AM)
gcloud scheduler jobs create http daily-reports \
  --location us-central1 \
  --schedule "0 8 * * *" \
  --uri "https://job-tracker-backend-xxxxx-uc.a.run.app/api/cron/daily-reports" \
  --http-method POST \
  --oidc-service-account-email cloud-run-invoker@job-tracker-prod.iam.gserviceaccount.com

# Hourly Sheets Sync
gcloud scheduler jobs create http sheets-sync \
  --location us-central1 \
  --schedule "0 * * * *" \
  --uri "https://job-tracker-backend-xxxxx-uc.a.run.app/api/cron/sync-sheets" \
  --http-method POST \
  --oidc-service-account-email cloud-run-invoker@job-tracker-prod.iam.gserviceaccount.com

# Job Scraping (Every 6 hours)
gcloud scheduler jobs create http job-scraping \
  --location us-central1 \
  --schedule "0 */6 * * *" \
  --uri "https://job-tracker-backend-xxxxx-uc.a.run.app/api/cron/scrape-jobs" \
  --http-method POST \
  --oidc-service-account-email cloud-run-invoker@job-tracker-prod.iam.gserviceaccount.com
```

---

## Step 7: Setup Redis (Optional - for Caching)

### 7.1 Create Redis Instance
```bash
gcloud redis instances create job-tracker-cache \
  --size=1 \
  --region=us-central1 \
  --tier=basic

# Get Redis host
gcloud redis instances describe job-tracker-cache \
  --region=us-central1 \
  --format="value(host)"

# Update backend with Redis URL
echo "redis://REDIS_IP:6379" | gcloud secrets create REDIS_URL --data-file=-
```

---

## Step 8: Seed Production Database

### 8.1 Run Seed Script Locally (One-Time)
```bash
cd backend

# Update .env with MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/job-tracker

# Run seed
node scripts/seed.js
```

### 8.2 Or Create Cloud Run Job
```bash
gcloud run jobs create seed-database \
  --image gcr.io/job-tracker-prod/backend \
  --command "node,scripts/seed.js" \
  --set-secrets="MONGODB_URI=MONGODB_URI:latest" \
  --region us-central1

# Execute once
gcloud run jobs execute seed-database --region us-central1
```

---

## Step 9: Setup Custom Domain (Optional)

### 9.1 Map Custom Domain
```bash
# Frontend
gcloud run domain-mappings create \
  --service job-tracker-frontend \
  --domain app.yourdomain.com \
  --region us-central1

# Backend
gcloud run domain-mappings create \
  --service job-tracker-backend \
  --domain api.yourdomain.com \
  --region us-central1
```

### 9.2 Update DNS Records
```bash
# Add the following records in your DNS provider:
# Type: CNAME
# Name: app
# Value: ghs.googlehosted.com

# Type: CNAME
# Name: api
# Value: ghs.googlehosted.com
```

---

## Step 10: Monitoring & Logging

### 10.1 View Logs
```bash
# Backend logs
gcloud run logs read job-tracker-backend --region us-central1

# Frontend logs
gcloud run logs read job-tracker-frontend --region us-central1

# Scheduler logs
gcloud scheduler jobs describe daily-reports --location us-central1
```

### 10.2 Setup Alerts
```bash
# Go to: https://console.cloud.google.com/monitoring
# Create alerts for:
# - Error rate > 5%
# - Response time > 2s
# - Memory usage > 80%
```

---

## Costs Estimate (Monthly)

| Service | Tier | Cost |
|---------|------|------|
| MongoDB Atlas | M0 Free | $0 |
| Cloud Run Backend | 1M requests | ~$5-10 |
| Cloud Run Frontend | 1M requests | ~$3-5 |
| Cloud Scheduler | 3 jobs | $0.30 |
| Redis (Basic) | 1GB | $35 (optional) |
| **Total** | | **~$8-15/month** |

*Free tier includes 2M Cloud Run requests/month*

---

## Production Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Network access configured
- [ ] GCP project created
- [ ] APIs enabled
- [ ] Secrets created in Secret Manager
- [ ] Backend deployed to Cloud Run
- [ ] Frontend deployed to Cloud Run
- [ ] CORS configured
- [ ] Cloud Scheduler jobs created
- [ ] Database seeded
- [ ] Default passwords changed
- [ ] Monitoring enabled
- [ ] Custom domain mapped (optional)

---

## Useful Commands

### Redeploy After Code Changes
```bash
# Backend
cd backend
gcloud builds submit --tag gcr.io/job-tracker-prod/backend
gcloud run deploy job-tracker-backend --image gcr.io/job-tracker-prod/backend --region us-central1

# Frontend
cd frontend
gcloud builds submit --tag gcr.io/job-tracker-prod/frontend
gcloud run deploy job-tracker-frontend --image gcr.io/job-tracker-prod/frontend --region us-central1
```

### View Service URLs
```bash
gcloud run services list --platform managed
```

### Update Environment Variables
```bash
# Update secret
echo "new-value" | gcloud secrets versions add SECRET_NAME --data-file=-

# Redeploy to pick up changes
gcloud run deploy SERVICE_NAME --image IMAGE_URL --region REGION
```

### Scale Services
```bash
# Set max instances
gcloud run services update job-tracker-backend \
  --max-instances 20 \
  --region us-central1

# Set min instances (for faster cold starts, costs more)
gcloud run services update job-tracker-backend \
  --min-instances 1 \
  --region us-central1
```

---

## Troubleshooting

### Backend won't start
```bash
# Check logs
gcloud run logs read job-tracker-backend --region us-central1 --limit 50

# Common issues:
# 1. MongoDB connection string incorrect
# 2. Secrets not accessible
# 3. Port not set to 8080
```

### Frontend can't reach backend
```bash
# Check CORS settings in backend
# Verify REACT_APP_API_URL in frontend/.env.production
# Check backend URL is correct
```

### Scheduled jobs not running
```bash
# Check job status
gcloud scheduler jobs describe JOB_NAME --location us-central1

# Check service account has permissions
gcloud run services get-iam-policy job-tracker-backend --region us-central1
```

---

## Next Steps

1. **Setup CI/CD**: Use Cloud Build triggers for automatic deployments
2. **Add Load Balancer**: For custom domain with SSL
3. **Enable CDN**: For faster static asset delivery
4. **Setup Backups**: MongoDB Atlas automated backups
5. **Add Monitoring**: Cloud Monitoring dashboards

**Your app is now live on GCP! 🚀**
