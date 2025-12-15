const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const Application = require('../models/Application');
const User = require('../models/User');
const logger = require('../utils/logger');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// @route   GET /api/applications
// @desc    Get user's applications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, sortBy = 'lastUpdate', order = 'desc' } = req.query;
    
    const query = { user: req.user.id };
    if (status) query.status = status;
    
    const applications = await Application.find(query)
      .populate('assignedRecruiter', 'firstName lastName email')
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

// @route   GET /api/applications/:id
// @desc    Get single application
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('user', 'firstName lastName email phone')
      .populate('assignedRecruiter', 'firstName lastName email')
      .populate('job');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Check authorization
    if (
      application.user._id.toString() !== req.user.id &&
      req.user.role !== 'admin' &&
      (req.user.role !== 'recruiter' || application.assignedRecruiter?._id.toString() !== req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application'
      });
    }
    
    res.json({
      success: true,
      data: { application }
    });
  } catch (error) {
    logger.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application',
      error: error.message
    });
  }
});

// @route   POST /api/applications
// @desc    Create new application
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { company, position, jobUrl, location, status, salary, jobType, userNotes } = req.body;
    
    const application = await Application.create({
      user: req.user.id,
      company,
      position,
      jobUrl,
      location,
      status: status || 'applied',
      salary,
      jobType,
      userNotes,
      source: 'manual'
    });
    
    // Add to user's applications
    await User.findByIdAndUpdate(req.user.id, {
      $push: { applications: application._id }
    });
    
    // Emit socket event
    const io = req.app.get('io');
    io.to(`user_${req.user.id}`).emit('application:created', application);
    io.to('role_admin').emit('application:created', application);
    
    logger.info(`New application created by user ${req.user.id}: ${position} at ${company}`);
    
    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: { application }
    });
  } catch (error) {
    logger.error('Error creating application:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating application',
      error: error.message
    });
  }
});

// @route   PATCH /api/applications/:id
// @desc    Update application
// @access  Private
router.patch('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Check authorization
    if (application.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }
    
    const allowedUpdates = ['company', 'position', 'jobUrl', 'location', 'salary', 'jobType', 'userNotes', 'tags'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    
    // Emit socket event
    const io = req.app.get('io');
    io.to(`user_${req.user.id}`).emit('application:updated', updatedApplication);
    
    res.json({
      success: true,
      message: 'Application updated successfully',
      data: { application: updatedApplication }
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

// @route   DELETE /api/applications/:id
// @desc    Delete application
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Check authorization
    if (application.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this application'
      });
    }
    
    await Application.findByIdAndDelete(req.params.id);
    
    // Remove from user's applications
    await User.findByIdAndUpdate(application.user, {
      $pull: { applications: req.params.id }
    });
    
    res.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting application:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting application',
      error: error.message
    });
  }
});

// @route   GET /api/applications/stats/summary
// @desc    Get application statistics
// @access  Private
router.get('/stats/summary', protect, async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user.id });
    
    const stats = {
      total: applications.length,
      byStatus: {},
      recentActivity: applications
        .sort((a, b) => b.lastUpdate - a.lastUpdate)
        .slice(0, 5)
        .map(app => ({
          id: app._id,
          company: app.company,
          position: app.position,
          status: app.status,
          lastUpdate: app.lastUpdate
        }))
    };
    
    // Count by status
    applications.forEach(app => {
      stats.byStatus[app.status] = (stats.byStatus[app.status] || 0) + 1;
    });
    
    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    logger.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

module.exports = router;
