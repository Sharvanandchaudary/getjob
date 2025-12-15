const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  
  /**
   * Send a generic email
   */
  async sendEmail(to, subject, html, text = null) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
      };
      
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to}: ${info.messageId}`);
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error(`Email send error to ${to}:`, error);
      throw error;
    }
  }
  
  /**
   * Send daily report to user
   */
  async sendDailyUserReport(user, applications, jobRecommendations = []) {
    try {
      const today = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      // Count applications by status
      const statusCounts = applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {});
      
      // Get recent updates (last 24 hours)
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentUpdates = applications.filter(app => 
        new Date(app.lastUpdate) > yesterday
      );
      
      const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; }
    .stats { display: table; width: 100%; margin: 20px 0; }
    .stat { display: table-cell; text-align: center; padding: 15px; background: white; border-radius: 8px; margin: 5px; }
    .stat-number { font-size: 32px; font-weight: bold; color: #667eea; }
    .stat-label { font-size: 14px; color: #666; margin-top: 5px; }
    .update { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #667eea; border-radius: 4px; }
    .update-title { font-weight: bold; color: #333; }
    .update-status { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; margin-top: 5px; }
    .status-applied { background: #e3f2fd; color: #1976d2; }
    .status-screening { background: #fff3e0; color: #f57c00; }
    .status-interview { background: #f3e5f5; color: #7b1fa2; }
    .status-offer { background: #e8f5e9; color: #388e3c; }
    .job-recommendation { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border: 1px solid #e0e0e0; }
    .job-title { font-weight: bold; color: #667eea; font-size: 16px; }
    .job-company { color: #666; margin: 5px 0; }
    .job-match { background: #4caf50; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .btn { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Your Daily Job Search Update</h1>
      <p>${today}</p>
    </div>
    
    <div class="content">
      <h2>Hello ${user.firstName}! 👋</h2>
      <p>Here's your daily application tracking summary:</p>
      
      <div class="stats">
        <div class="stat">
          <div class="stat-number">${applications.length}</div>
          <div class="stat-label">Total Applications</div>
        </div>
        <div class="stat">
          <div class="stat-number">${statusCounts.interview || 0}</div>
          <div class="stat-label">Interviews</div>
        </div>
        <div class="stat">
          <div class="stat-number">${recentUpdates.length}</div>
          <div class="stat-label">New Updates</div>
        </div>
      </div>
      
      ${recentUpdates.length > 0 ? `
      <h3>🔔 Recent Updates (Last 24 Hours)</h3>
      ${recentUpdates.slice(0, 5).map(app => `
        <div class="update">
          <div class="update-title">${app.position} at ${app.company}</div>
          <span class="update-status status-${app.status}">${app.status.toUpperCase()}</span>
          <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
            Last updated: ${new Date(app.lastUpdate).toLocaleString()}
          </p>
        </div>
      `).join('')}
      ` : '<p>No updates in the last 24 hours.</p>'}
      
      ${jobRecommendations.length > 0 ? `
      <h3>✨ AI-Recommended Jobs for You</h3>
      <p>Based on your resume and preferences, here are today's top matches:</p>
      ${jobRecommendations.slice(0, 5).map(job => `
        <div class="job-recommendation">
          <div class="job-title">${job.title}</div>
          <div class="job-company">🏢 ${job.company} • 📍 ${job.location} ${job.remote === 'remote' ? '🏠 Remote' : ''}</div>
          <div style="margin: 10px 0;">
            <span class="job-match">${job.matchScore}% Match</span>
          </div>
          <a href="${job.url}" class="btn" style="font-size: 14px; padding: 8px 16px;">View Job →</a>
        </div>
      `).join('')}
      ` : ''}
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/dashboard" class="btn">View Full Dashboard</a>
        <a href="${process.env.FRONTEND_URL}/applications" class="btn">Manage Applications</a>
      </div>
      
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        <strong>💡 Pro Tip:</strong> The best time to apply for jobs is early in the week. 
        ${applications.length < 10 ? 'Consider adding more applications to increase your chances!' : 'You\'re doing great! Keep up the momentum!'}
      </p>
    </div>
    
    <div class="footer">
      <p>You're receiving this email because you enabled daily reports in your settings.</p>
      <p><a href="${process.env.FRONTEND_URL}/settings">Update Email Preferences</a></p>
      <p>&copy; ${new Date().getFullYear()} Job Tracker. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
      `;
      
      await this.sendEmail(
        user.email,
        `Your Daily Job Search Update - ${today}`,
        html
      );
      
      logger.info(`Daily report sent to user: ${user.email}`);
      return { success: true };
    } catch (error) {
      logger.error(`Error sending daily report to ${user.email}:`, error);
      throw error;
    }
  }
  
  /**
   * Send daily report to recruiter
   */
  async sendDailyRecruiterReport(recruiter, candidates, applications) {
    try {
      const today = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentApplications = applications.filter(app => 
        new Date(app.lastUpdate) > yesterday
      );
      
      const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; }
    .stats { display: table; width: 100%; margin: 20px 0; }
    .stat { display: table-cell; text-align: center; padding: 15px; background: white; border-radius: 8px; }
    .stat-number { font-size: 32px; font-weight: bold; color: #f5576c; }
    .stat-label { font-size: 14px; color: #666; margin-top: 5px; }
    .candidate { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #f5576c; }
    .btn { display: inline-block; padding: 12px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 Your Daily Recruiter Report</h1>
      <p>${today}</p>
    </div>
    
    <div class="content">
      <h2>Hello ${recruiter.firstName}! 👋</h2>
      
      <div class="stats">
        <div class="stat">
          <div class="stat-number">${candidates.length}</div>
          <div class="stat-label">Assigned Candidates</div>
        </div>
        <div class="stat">
          <div class="stat-number">${applications.length}</div>
          <div class="stat-label">Total Applications</div>
        </div>
        <div class="stat">
          <div class="stat-number">${recentApplications.length}</div>
          <div class="stat-label">Recent Updates</div>
        </div>
      </div>
      
      ${recentApplications.length > 0 ? `
      <h3>📋 Recent Activity</h3>
      ${recentApplications.slice(0, 10).map(app => `
        <div class="candidate">
          <strong>${app.user?.firstName} ${app.user?.lastName}</strong>
          <p>${app.position} at ${app.company} - <strong>${app.status}</strong></p>
          <small>Updated: ${new Date(app.lastUpdate).toLocaleString()}</small>
        </div>
      `).join('')}
      ` : '<p>No recent updates.</p>'}
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/recruiter/dashboard" class="btn">View Dashboard</a>
        <a href="${process.env.FRONTEND_URL}/recruiter/candidates" class="btn">Manage Candidates</a>
      </div>
    </div>
    
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Job Tracker. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
      `;
      
      await this.sendEmail(
        recruiter.email,
        `Your Daily Recruiter Report - ${today}`,
        html
      );
      
      logger.info(`Daily report sent to recruiter: ${recruiter.email}`);
      return { success: true };
    } catch (error) {
      logger.error(`Error sending recruiter report:`, error);
      throw error;
    }
  }
  
  /**
   * Send status change notification
   */
  async sendStatusChangeNotification(user, application, oldStatus, newStatus) {
    try {
      const statusEmojis = {
        applied: '📝',
        screening: '👀',
        interview: '💼',
        technical: '💻',
        offer: '🎉',
        accepted: '✅',
        rejected: '❌',
        withdrawn: '⏸️'
      };
      
      const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
    .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; }
    .status-change { padding: 20px; background: #e3f2fd; border-radius: 8px; margin: 20px 0; text-align: center; }
    .btn { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Application Status Updated ${statusEmojis[newStatus]}</h2>
    </div>
    <div class="content">
      <h3>Hello ${user.firstName}!</h3>
      <p>Great news! Your application status has been updated:</p>
      
      <div class="status-change">
        <h2>${application.position}</h2>
        <p style="font-size: 18px; color: #666;">${application.company}</p>
        <p style="font-size: 24px; margin: 20px 0;">
          <strong>${oldStatus}</strong> → <strong style="color: #667eea;">${newStatus}</strong>
        </p>
      </div>
      
      ${application.notes && application.notes.length > 0 ? `
        <h4>Latest Note:</h4>
        <p style="background: #f5f5f5; padding: 15px; border-radius: 5px; font-style: italic;">
          "${application.notes[application.notes.length - 1].text}"
        </p>
      ` : ''}
      
      <p style="text-align: center;">
        <a href="${process.env.FRONTEND_URL}/applications/${application._id}" class="btn">View Details</a>
      </p>
    </div>
  </div>
</body>
</html>
      `;
      
      await this.sendEmail(
        user.email,
        `Application Update: ${application.position} at ${application.company}`,
        html
      );
      
      return { success: true };
    } catch (error) {
      logger.error('Error sending status notification:', error);
      throw error;
    }
  }
  
  /**
   * Send admin daily digest
   */
  async sendAdminDailyDigest(admin, stats) {
    try {
      const today = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 700px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; }
    .metric { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .metric-value { font-size: 36px; font-weight: bold; color: #667eea; }
    .metric-label { font-size: 14px; color: #666; margin-top: 5px; }
    .btn { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📈 Admin Daily System Report</h1>
      <p>${today}</p>
    </div>
    
    <div class="content">
      <h2>System Overview</h2>
      
      <div class="metric">
        <div class="metric-value">${stats.totalUsers}</div>
        <div class="metric-label">Total Users</div>
      </div>
      
      <div class="metric">
        <div class="metric-value">${stats.totalApplications}</div>
        <div class="metric-label">Total Applications</div>
      </div>
      
      <div class="metric">
        <div class="metric-value">${stats.applicationsToday}</div>
        <div class="metric-label">New Applications Today</div>
      </div>
      
      <div class="metric">
        <div class="metric-value">${stats.activeRecruiters}</div>
        <div class="metric-label">Active Recruiters</div>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/admin/dashboard" class="btn">View Admin Dashboard</a>
        <a href="${process.env.FRONTEND_URL}/admin/analytics" class="btn">View Analytics</a>
      </div>
    </div>
  </div>
</body>
</html>
      `;
      
      await this.sendEmail(
        admin.email,
        `Admin Daily Digest - ${today}`,
        html
      );
      
      return { success: true };
    } catch (error) {
      logger.error('Error sending admin digest:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();
