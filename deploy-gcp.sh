#!/bin/bash

# Quick GCP Deployment Script
# Run this after setting up MongoDB Atlas and gcloud CLI

set -e

echo "🚀 Job Tracker - GCP Deployment"
echo "================================"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed"
    echo "   Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

echo "✅ gcloud CLI found"
echo ""

# Get project ID
PROJECT_ID=$(gcloud config get-value project)
echo "📦 Project: $PROJECT_ID"
echo ""

# Prompt for MongoDB Atlas connection string
echo "📝 Enter your MongoDB Atlas connection string:"
echo "   Format: mongodb+srv://username:password@cluster.mongodb.net/job-tracker"
read -r MONGODB_URI

echo ""
echo "📝 Enter your OpenAI API Key:"
read -r OPENAI_API_KEY

echo ""
echo "📝 Enter your Gmail address:"
read -r SMTP_USER

echo ""
echo "📝 Enter your Gmail App Password:"
read -r -s SMTP_PASS

echo ""
echo ""
echo "🔐 Creating secrets in Secret Manager..."

# Create secrets
echo "$MONGODB_URI" | gcloud secrets create MONGODB_URI --data-file=- 2>/dev/null || \
    echo "$MONGODB_URI" | gcloud secrets versions add MONGODB_URI --data-file=-

echo "your-super-secret-jwt-key-$(date +%s)" | gcloud secrets create JWT_SECRET --data-file=- 2>/dev/null || \
    echo "your-super-secret-jwt-key-$(date +%s)" | gcloud secrets versions add JWT_SECRET --data-file=-

echo "$OPENAI_API_KEY" | gcloud secrets create OPENAI_API_KEY --data-file=- 2>/dev/null || \
    echo "$OPENAI_API_KEY" | gcloud secrets versions add OPENAI_API_KEY --data-file=-

echo "$SMTP_USER" | gcloud secrets create SMTP_USER --data-file=- 2>/dev/null || \
    echo "$SMTP_USER" | gcloud secrets versions add SMTP_USER --data-file=-

echo "$SMTP_PASS" | gcloud secrets create SMTP_PASS --data-file=- 2>/dev/null || \
    echo "$SMTP_PASS" | gcloud secrets versions add SMTP_PASS --data-file=-

echo "https://temp-url.run.app" | gcloud secrets create FRONTEND_URL --data-file=- 2>/dev/null || \
    echo "https://temp-url.run.app" | gcloud secrets versions add FRONTEND_URL --data-file=-

echo "✅ Secrets created"
echo ""

# Deploy Backend
echo "🔧 Deploying Backend to Cloud Run..."
cd backend

gcloud builds submit --tag gcr.io/$PROJECT_ID/backend

gcloud run deploy job-tracker-backend \
  --image gcr.io/$PROJECT_ID/backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="MONGODB_URI=MONGODB_URI:latest,JWT_SECRET=JWT_SECRET:latest,OPENAI_API_KEY=OPENAI_API_KEY:latest,SMTP_USER=SMTP_USER:latest,SMTP_PASS=SMTP_PASS:latest,FRONTEND_URL=FRONTEND_URL:latest" \
  --set-env-vars="NODE_ENV=production,PORT=8080" \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10

BACKEND_URL=$(gcloud run services describe job-tracker-backend --region us-central1 --format="value(status.url)")
echo "✅ Backend deployed: $BACKEND_URL"
echo ""

# Update frontend .env.production
cd ../frontend
cat > .env.production << EOF
REACT_APP_API_URL=$BACKEND_URL
REACT_APP_SOCKET_URL=$BACKEND_URL
EOF

echo "🎨 Deploying Frontend to Cloud Run..."

gcloud builds submit --tag gcr.io/$PROJECT_ID/frontend

gcloud run deploy job-tracker-frontend \
  --image gcr.io/$PROJECT_ID/frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1

FRONTEND_URL=$(gcloud run services describe job-tracker-frontend --region us-central1 --format="value(status.url)")
echo "✅ Frontend deployed: $FRONTEND_URL"
echo ""

# Update FRONTEND_URL secret
echo "$FRONTEND_URL" | gcloud secrets versions add FRONTEND_URL --data-file=-

# Redeploy backend with updated CORS
echo "🔄 Updating backend CORS settings..."
gcloud run deploy job-tracker-backend \
  --image gcr.io/$PROJECT_ID/backend \
  --platform managed \
  --region us-central1

echo ""
echo "================================"
echo "✅ Deployment Complete!"
echo "================================"
echo ""
echo "📱 Frontend: $FRONTEND_URL"
echo "🔧 Backend: $BACKEND_URL"
echo ""
echo "🔑 Default Login Credentials:"
echo "   Admin: admin@example.com / admin123"
echo "   Recruiter: recruiter@example.com / recruiter123"
echo "   User: user1@example.com / user123"
echo ""
echo "⚠️  Don't forget to:"
echo "   1. Seed the database: cd backend && node scripts/seed.js"
echo "   2. Setup Cloud Scheduler for cron jobs"
echo "   3. Change default passwords"
echo ""
echo "📚 See DEPLOYMENT_GCP.md for detailed instructions"
echo ""
