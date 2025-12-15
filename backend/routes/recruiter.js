const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Application = require('../models/Application');
const User = require('../models/User');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

// Apply protection and recruiter authorization to all routes
router.use(protect, authorize('recruiter'));

// @route   GET /api/recruiter/candidates
// @desc    Get assigned candidates
// @access  Private (Recruiter)
router.get('/candidates', async (req, res) => {
  try {
    const recruiter = await User.findById(req.user.id)
      .populate('assignedCandidates', 'firstName lastName email phone resume createdAt');
    
    res.json({
      success: true,
      count: recruiter.assignedCandidates.length,
      data: { candidates: recruiter.assignedCandidates }
    });
  } catch (error) {
    logger.error('Error fetching candidates:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching candidates',
      error: error.message
    });
  }
});

// @route   GET /api/recruiter/applications
// @desc    Get applications for assigned candidates
// @access  Private (Recruiter)
router.get('/applications', async (req, res) => {
  try {
    const { status, sortBy = 'lastUpdate', order = 'desc' } = req.query;
    
    const query = { assignedRecruiter: req.user.id };
    if (status) query.status = status;
    
    const applications = await Application.find(query)
      .populate('user', 'firstName lastName email phone resume')
      .populate('job')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 });
    
    res.json({
      success: true,
      count: applications.length,
      data: { applications }
    });
  } catch (error) {
    logger.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
});

// @route   PATCH /api/recruiter/application/:id
// @desc    Update application status and add notes
// @access  Private (Recruiter)
router.patch('/application/:id', async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('user', 'firstName lastName email emailPreferences');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Check if recruiter is assigned to this application
    if (application.assignedRecruiter?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }
    
    const { status, note, interviewDate, responseDeadline, priority } = req.body;
    const oldStatus = application.status;
    
    // Update fields
    if (status) application.status = status;
    if (interviewDate) application.interviewDate = interviewDate;
    if (responseDeadline) application.responseDeadline = responseDeadline;
    if (priority) application.priority = priority;
    
    // Add note if provided
    if (note) {
      application.notes.push({
        author: req.user.id,
        text: note,
        isPrivate: req.body.isPrivateNote || false
      });
    }
    
    // Mark as viewed
    if (!application.viewedByRecruiter) {
      application.viewedByRecruiter = true;
      application.viewedAt = new Date();
    }
    
    await application.save();
    
    // Send notification if status changed
    if (status && status !== oldStatus && application.user.emailPreferences.statusUpdates) {
      await emailService.sendStatusChangeNotification(
        application.user,
        application,
        oldStatus,
        status
      );
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user_${application.user._id}`).emit('application:updated', application);
    io.to('role_admin').emit('application:updated', application);
    
    logger.info(`Application ${application._id} updated by recruiter ${req.user.id}`);
    
    res.json({
      success: true,
      message: 'Application updated successfully',
      data: { application }
    });
  } catch (error) {
    logger.error('Error updating application:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application',
      error: error.message
    });
  }
});

// @route   POST /api/recruiter/notes
// @desc    Add note to application
// @access  Private (Recruiter)
router.post('/notes', async (req, res) => {
  try {
    const { applicationId, note, isPrivate = false } = req.body;
    
    const application = await Application.findById(applicationId);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    if (application.assignedRecruiter?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    application.notes.push({
      author: req.user.id,
      text: note,
      isPrivate
    });
    
    await application.save();
    
    res.json({
      success: true,
      message: 'Note added successfully',
      data: { application }
    });
  } catch (error) {
    logger.error('Error adding note:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding note',
      error: error.message
    });
  }
});

// @route   GET /api/recruiter/stats
// @desc    Get recruiter statistics
// @access  Private (Recruiter)
router.get('/stats', async (req, res) => {
  try {
    const applications = await Application.find({ assignedRecruiter: req.user.id });
    
    const stats = {
      totalCandidates: await User.countDocuments({
        _id: { $in: (await User.findById(req.user.id)).assignedCandidates }
      }),
      totalApplications: applications.length,
      byStatus: {},
      recentActivity: applications
        .sort((a, b) => b.lastUpdate - a.lastUpdate)
        .slice(0, 10)
    };
    
    applications.forEach(app => {
      stats.byStatus[app.status] = (stats.byStatus[app.status] || 0) + 1;
    });
    
    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    logger.error('Error fetching recruiter stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

module.exports = router;
