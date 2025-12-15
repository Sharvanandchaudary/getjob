# 📋 Quick Reference Card

## 🚀 Quick Start Commands

### First Time Setup
```powershell
# 1. Start MongoDB
net start MongoDB

# 2. Install & Seed
cd backend
npm install
node scripts/seed.js

cd ..\frontend
npm install

# 3. Start Everything
# Use the start script:
.\start.ps1
# Or manually:
# Terminal 1: cd backend && npm run dev
# Terminal 2: cd frontend && npm start
```

### Daily Use
```powershell
# Start with script (easiest)
.\start.ps1

# Or start services
cd backend
npm run dev      # Terminal 1

cd frontend  
npm start        # Terminal 2
```

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Recruiter | recruiter@example.com | recruiter123 |
| User | user1@example.com | user123 |

⚠️ **Change passwords after first login!**

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| Health Check | http://localhost:5000/health |

## 📧 Required Environment Variables

```env
# Minimum required in backend/.env
MONGODB_URI=mongodb://localhost:27017/job-tracker
JWT_SECRET=your-secret-key-change-this
OPENAI_API_KEY=sk-proj-your-key-here
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FRONTEND_URL=http://localhost:3000
```

## 🔧 Common Tasks

### Seed Database
```powershell
cd backend
node scripts/seed.js
```

### Send Test Email
```powershell
cd backend
node scripts/send-daily-reports.js
```

### Sync Google Sheets
```powershell
cd backend
node scripts/sync-sheets.js
```

### Update Job Recommendations
```powershell
cd backend
node scripts/scrape-jobs.js
```

### Clear Database
```powershell
mongo
> use job-tracker
> db.dropDatabase()
> exit
# Then reseed
node scripts/seed.js
```

## 📊 API Endpoints Quick Reference

### Authentication
```bash
POST /api/auth/register    # Register new user
POST /api/auth/login       # Login
GET  /api/auth/me          # Get current user
PUT  /api/auth/profile     # Update profile
```

### Applications
```bash
GET    /api/applications          # List all
POST   /api/applications          # Create
GET    /api/applications/:id      # Get one
PATCH  /api/applications/:id      # Update
DELETE /api/applications/:id      # Delete
GET    /api/applications/stats/summary  # Statistics
```

### AI Features
```bash
POST /api/ai/analyze-resume       # Upload & analyze resume
GET  /api/ai/job-matches          # Get matched jobs
POST /api/ai/recommend            # Get recommendations
```

### Recruiter (Role: recruiter)
```bash
GET   /api/recruiter/candidates         # Assigned candidates
GET   /api/recruiter/applications       # Applications
PATCH /api/recruiter/application/:id    # Update application
POST  /api/recruiter/notes              # Add note
GET   /api/recruiter/stats              # Statistics
```

### Admin (Role: admin)
```bash
GET    /api/admin/users            # All users
GET    /api/admin/recruiters       # All recruiters
GET    /api/admin/applications     # All applications
GET    /api/admin/analytics        # System analytics
POST   /api/admin/assign           # Assign candidate
PATCH  /api/admin/user/:id         # Update user
DELETE /api/admin/user/:id         # Delete user
POST   /api/admin/sync-sheets      # Sync Google Sheets
```

## 🐛 Troubleshooting Quick Fixes

### Backend won't start
```powershell
# Check MongoDB
mongod --version
net start MongoDB

# Check port
netstat -ano | findstr :5000
```

### Frontend won't start
```powershell
# Clear cache
cd frontend
rm -r node_modules
npm install
```

### Database issues
```powershell
# Reseed
cd backend
node scripts/seed.js
```

### Email not working
- Check Gmail app password
- Verify 2FA is enabled
- Check `.env` settings

### AI not working
- Verify OpenAI API key
- Check quota at platform.openai.com/usage
- Ensure you have credits

## 📱 Features by Role

### 👤 User Can:
- ✅ Register/Login
- ✅ Upload resume (PDF)
- ✅ Get AI job matches
- ✅ Add applications
- ✅ Track status
- ✅ Receive email reports
- ✅ Update preferences

### 👨‍💼 Recruiter Can:
- ✅ View assigned candidates
- ✅ See applications
- ✅ Update statuses
- ✅ Add notes
- ✅ Set interview dates
- ✅ View metrics

### 🔧 Admin Can:
- ✅ View all data
- ✅ Manage users
- ✅ Assign candidates
- ✅ View analytics
- ✅ Sync Google Sheets
- ✅ Export data

## 📅 Automated Tasks

| Task | Frequency | Time |
|------|-----------|------|
| Daily Reports | Daily | 8:00 AM |
| Sheets Sync | Hourly | Every hour |
| Job Scraping | Every 6 hours | 00:00, 06:00, 12:00, 18:00 |
| Job Cleanup | Daily | Midnight |

## 🎯 Testing Checklist

- [ ] User can register
- [ ] User can login
- [ ] Resume upload works
- [ ] AI analysis completes
- [ ] Job recommendations show
- [ ] Application creation works
- [ ] Status updates in real-time
- [ ] Emails are received
- [ ] Recruiter can update status
- [ ] Admin sees all data
- [ ] Google Sheets sync works

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| README.md | Main documentation |
| QUICKSTART.md | 5-minute setup |
| INSTALLATION.md | Detailed install guide |
| ARCHITECTURE.md | System design |
| PROJECT_SUMMARY.md | Complete overview |
| start.ps1 | Easy startup script |

## 🔗 Useful Links

- **OpenAI API:** https://platform.openai.com/
- **MongoDB Docs:** https://docs.mongodb.com/
- **n8n Docs:** https://docs.n8n.io/
- **React Docs:** https://react.dev/
- **Material-UI:** https://mui.com/

## 💡 Pro Tips

1. **Use the start.ps1 script** - Easiest way to start everything
2. **Seed database first** - Run `node scripts/seed.js`
3. **Check health endpoint** - http://localhost:5000/health
4. **View logs** - backend/logs/error.log
5. **Gmail app password** - Generate at myaccount.google.com/apppasswords
6. **OpenAI credits** - Add payment method for API to work
7. **Test locally first** - Before deploying to production
8. **Change default passwords** - Security first!

## ⚡ Performance Tips

- Enable Redis for caching
- Use PM2 in production
- Enable compression
- Build frontend for production
- Add database indexes
- Monitor logs regularly

## 🎓 Learning Path

1. Read QUICKSTART.md
2. Install and seed database
3. Test as User
4. Test as Recruiter  
5. Test as Admin
6. Upload real resume
7. Check email reports
8. Customize for your needs
9. Deploy to production

## 📞 Need Help?

1. Check logs: `backend/logs/error.log`
2. Read INSTALLATION.md
3. Review ARCHITECTURE.md
4. Verify environment variables
5. Test API with curl/Postman

---

**Last Updated:** December 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅

**🚀 Happy Job Tracking!**
