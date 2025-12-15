const { google } = require('googleapis');
const User = require('../models/User');
const Application = require('../models/Application');
const Job = require('../models/Job');
const logger = require('../utils/logger');

class GoogleSheetsService {
  constructor() {
    this.auth = null;
    this.sheets = null;
    this.spreadsheetId = process.env.SPREADSHEET_ID;
    
    this.initialize();
  }
  
  /**
   * Initialize Google Sheets API
   */
  initialize() {
    try {
      if (!process.env.GOOGLE_SHEETS_CLIENT_EMAIL || !process.env.GOOGLE_SHEETS_PRIVATE_KEY) {
        logger.warn('Google Sheets credentials not configured');
        return;
      }
      
      this.auth = new google.auth.JWT(
        process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        null,
        process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
        ['https://www.googleapis.com/auth/spreadsheets']
      );
      
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      logger.info('Google Sheets service initialized');
    } catch (error) {
      logger.error('Error initializing Google Sheets:', error);
    }
  }
  
  /**
   * Sync all data to Google Sheets
   */
  async syncToGoogleSheets() {
    try {
      if (!this.sheets || !this.spreadsheetId) {
        logger.warn('Google Sheets not configured, skipping sync');
        return;
      }
      
      await this.syncUsers();
      await this.syncApplications();
      await this.syncJobs();
      await this.syncAnalytics();
      
      logger.info('All data synced to Google Sheets');
    } catch (error) {
      logger.error('Error syncing to Google Sheets:', error);
      throw error;
    }
  }
  
  /**
   * Sync users data
   */
  async syncUsers() {
    try {
      const users = await User.find({ role: 'user' })
        .select('firstName lastName email phone createdAt applications')
        .lean();
      
      const values = [
        ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Applications Count', 'Created At']
      ];
      
      users.forEach(user => {
        values.push([
          user._id.toString(),
          user.firstName,
          user.lastName,
          user.email,
          user.phone || '',
          user.applications?.length || 0,
          new Date(user.createdAt).toLocaleString()
        ]);
      });
      
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: 'Users!A1',
        valueInputOption: 'RAW',
        resource: { values }
      });
      
      logger.info(`Synced ${users.length} users to Google Sheets`);
    } catch (error) {
      logger.error('Error syncing users:', error);
    }
  }
  
  /**
   * Sync applications data
   */
  async syncApplications() {
    try {
      const applications = await Application.find()
        .populate('user', 'firstName lastName email')
        .populate('assignedRecruiter', 'firstName lastName')
        .lean();
      
      const values = [
        ['ID', 'User', 'User Email', 'Company', 'Position', 'Status', 'Applied Date', 'Last Update', 'Recruiter']
      ];
      
      applications.forEach(app => {
        values.push([
          app._id.toString(),
          app.user ? `${app.user.firstName} ${app.user.lastName}` : 'N/A',
          app.user?.email || '',
          app.company,
          app.position,
          app.status,
          new Date(app.appliedDate).toLocaleDateString(),
          new Date(app.lastUpdate).toLocaleString(),
          app.assignedRecruiter ? `${app.assignedRecruiter.firstName} ${app.assignedRecruiter.lastName}` : 'Unassigned'
        ]);
      });
      
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: 'Applications!A1',
        valueInputOption: 'RAW',
        resource: { values }
      });
      
      logger.info(`Synced ${applications.length} applications to Google Sheets`);
    } catch (error) {
      logger.error('Error syncing applications:', error);
    }
  }
  
  /**
   * Sync jobs data
   */
  async syncJobs() {
    try {
      const jobs = await Job.find({ isActive: true })
        .select('title company location remote salary source postedDate')
        .lean();
      
      const values = [
        ['ID', 'Title', 'Company', 'Location', 'Remote', 'Salary Min', 'Salary Max', 'Source', 'Posted Date', 'URL']
      ];
      
      jobs.forEach(job => {
        values.push([
          job._id.toString(),
          job.title,
          job.company,
          job.location || '',
          job.remote || '',
          job.salary?.min || '',
          job.salary?.max || '',
          job.source,
          job.postedDate ? new Date(job.postedDate).toLocaleDateString() : '',
          job.url || ''
        ]);
      });
      
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: 'Jobs!A1',
        valueInputOption: 'RAW',
        resource: { values }
      });
      
      logger.info(`Synced ${jobs.length} jobs to Google Sheets`);
    } catch (error) {
      logger.error('Error syncing jobs:', error);
    }
  }
  
  /**
   * Sync analytics data
   */
  async syncAnalytics() {
    try {
      const stats = {
        totalUsers: await User.countDocuments({ role: 'user' }),
        totalApplications: await Application.countDocuments(),
        totalJobs: await Job.countDocuments({ isActive: true }),
        applicationsByStatus: await Application.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ])
      };
      
      const values = [
        ['Metric', 'Value', 'Updated At'],
        ['Total Users', stats.totalUsers, new Date().toLocaleString()],
        ['Total Applications', stats.totalApplications, new Date().toLocaleString()],
        ['Active Jobs', stats.totalJobs, new Date().toLocaleString()],
        ['', '', ''],
        ['Application Status', 'Count', '']
      ];
      
      stats.applicationsByStatus.forEach(item => {
        values.push([item._id, item.count, '']);
      });
      
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: 'Analytics!A1',
        valueInputOption: 'RAW',
        resource: { values }
      });
      
      logger.info('Synced analytics to Google Sheets');
    } catch (error) {
      logger.error('Error syncing analytics:', error);
    }
  }
}

const googleSheetsService = new GoogleSheetsService();

module.exports = {
  syncToGoogleSheets: () => googleSheetsService.syncToGoogleSheets()
};
