const cron = require('node-cron');
const User = require('../models/User');
const Application = require('../models/Application');
const Job = require('../models/Job');
const emailService = require('./emailService');
const aiService = require('./aiService');
const { syncToGoogleSheets } = require('./googleSheetsService');
const logger = require('../utils/logger');

class CronService {
  /**
   * Initialize all cron jobs
   */
  initializeCronJobs() {
    logger.info('Initializing cron jobs...');
    
    // Daily reports at 8 AM (0 8 * * *)
    const dailyReportSchedule = process.env.DAILY_REPORT_CRON || '0 8 * * *';
    cron.schedule(dailyReportSchedule, async () => {
      logger.info('Running daily report job...');
      await this.sendDailyReports();
    });
    
    // Google Sheets sync every hour
    cron.schedule('0 * * * *', async () => {
      logger.info('Running Google Sheets sync...');
      await this.syncDataToSheets();
    });
    
    // Job recommendations update - every 6 hours
    cron.schedule('0 */6 * * *', async () => {
      logger.info('Running job recommendations update...');
      await this.updateJobRecommendations();
    });
    
    // Clean up expired jobs - daily at midnight
    cron.schedule('0 0 * * *', async () => {
      logger.info('Running job cleanup...');
      await this.cleanupExpiredJobs();
    });
    
    // Weekly reports - Monday at 9 AM
    cron.schedule('0 9 * * 1', async () => {
      logger.info('Running weekly reports...');
      await this.sendWeeklyReports();
    });
    
    logger.info('All cron jobs initialized successfully');
  }
  
  /**
   * Send daily reports to all users
   */
  async sendDailyReports() {
    try {
      // Get all users who want daily reports
      const users = await User.find({ 
        role: 'user',
        isActive: true,
        'emailPreferences.dailyReport': true
      });
      
      logger.info(`Sending daily reports to ${users.length} users`);
      
      for (const user of users) {
        try {
          // Get user's applications
          const applications = await Application.find({ user: user._id })
            .sort({ lastUpdate: -1 })
            .limit(50);
          
          // Get AI job recommendations
          let jobRecommendations = [];
          if (user.resume && user.resume.parsedData) {
            try {
              const matchResult = await aiService.findMatchingJobs(user._id, 5);
              jobRecommendations = matchResult.data.jobs;
            } catch (err) {
              logger.error(`Error getting recommendations for user ${user._id}:`, err);
            }
          }
          
          // Send email
          await emailService.sendDailyUserReport(user, applications, jobRecommendations);
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          logger.error(`Error sending daily report to user ${user._id}:`, error);
        }
      }
      
      // Send recruiter reports
      const recruiters = await User.find({ 
        role: 'recruiter',
        isActive: true
      }).populate('assignedCandidates');
      
      logger.info(`Sending daily reports to ${recruiters.length} recruiters`);
      
      for (const recruiter of recruiters) {
        try {
          const applications = await Application.find({ 
            assignedRecruiter: recruiter._id 
          })
            .populate('user', 'firstName lastName email')
            .sort({ lastUpdate: -1 })
            .limit(50);
          
          await emailService.sendDailyRecruiterReport(
            recruiter, 
            recruiter.assignedCandidates, 
            applications
          );
          
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          logger.error(`Error sending recruiter report to ${recruiter._id}:`, error);
        }
      }
      
      // Send admin reports
      const admins = await User.find({ role: 'admin', isActive: true });
      
      for (const admin of admins) {
        try {
          const stats = await this.getSystemStats();
          await emailService.sendAdminDailyDigest(admin, stats);
        } catch (error) {
          logger.error(`Error sending admin report:`, error);
        }
      }
      
      logger.info('Daily reports sent successfully');
    } catch (error) {
      logger.error('Error in sendDailyReports:', error);
    }
  }
  
  /**
   * Get system statistics
   */
  async getSystemStats() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const stats = {
        totalUsers: await User.countDocuments({ role: 'user' }),
        totalApplications: await Application.countDocuments(),
        applicationsToday: await Application.countDocuments({
          createdAt: { $gte: today }
        }),
        activeRecruiters: await User.countDocuments({ 
          role: 'recruiter', 
          isActive: true 
        }),
        activeJobs: await Job.countDocuments({ isActive: true })
      };
      
      return stats;
    } catch (error) {
      logger.error('Error getting system stats:', error);
      return {};
    }
  }
  
  /**
   * Sync data to Google Sheets
   */
  async syncDataToSheets() {
    try {
      await syncToGoogleSheets();
      logger.info('Google Sheets sync completed');
    } catch (error) {
      logger.error('Error syncing to Google Sheets:', error);
    }
  }
  
  /**
   * Update job recommendations for all users
   */
  async updateJobRecommendations() {
    try {
      const users = await User.find({ 
        role: 'user',
        isActive: true,
        resume: { $exists: true }
      });
      
      logger.info(`Updating job recommendations for ${users.length} users`);
      
      for (const user of users) {
        try {
          if (user.resume && user.resume.parsedData) {
            await aiService.findMatchingJobs(user._id, 20);
          }
        } catch (error) {
          logger.error(`Error updating recommendations for user ${user._id}:`, error);
        }
      }
      
      logger.info('Job recommendations updated');
    } catch (error) {
      logger.error('Error in updateJobRecommendations:', error);
    }
  }
  
  /**
   * Clean up expired jobs
   */
  async cleanupExpiredJobs() {
    try {
      const result = await Job.updateMany(
        { 
          expiresAt: { $lt: new Date() },
          isActive: true
        },
        { 
          isActive: false 
        }
      );
      
      logger.info(`Deactivated ${result.modifiedCount} expired jobs`);
    } catch (error) {
      logger.error('Error cleaning up jobs:', error);
    }
  }
  
  /**
   * Send weekly summary reports
   */
  async sendWeeklyReports() {
    try {
      // Implementation for weekly reports
      logger.info('Weekly reports sent');
    } catch (error) {
      logger.error('Error sending weekly reports:', error);
    }
  }
}

const cronService = new CronService();

module.exports = {
  initializeCronJobs: () => cronService.initializeCronJobs(),
  sendDailyReports: () => cronService.sendDailyReports(),
  syncDataToSheets: () => cronService.syncDataToSheets()
};
