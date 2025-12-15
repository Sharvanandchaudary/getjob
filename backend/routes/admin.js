const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { syncToGoogleSheets } = require('../services/googleSheetsService');
const logger = require('../utils/logger');

// Apply protection and admin authorization to all routes
router.use(protect, authorize('admin'));

// @route   GET /api/admin/users
// @desc    Get all users with filters
// @access  Private (Admin)
router.get('/users', async (req, res) => {
  try {
    const { role, isActive, search, page = 1, limit = 50 } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .populate('applications')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / limit),
      data: { users }
    });
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// @route   GET /api/admin/recruiters
// @desc    Get all recruiters
// @access  Private (Admin)
router.get('/recruiters', async (req, res) => {
  try {
    const recruiters = await User.find({ role: 'recruiter' })
      .select('-password')
      .populate('assignedCandidates', 'firstName lastName email');
    
    res.json({
      success: true,
      count: recruiters.length,
      data: { recruiters }
    });
  } catch (error) {
    logger.error('Error fetching recruiters:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recruiters',
      error: error.message
    });
  }
});

// @route   GET /api/admin/applications
// @desc    Get all applications with filters
// @access  Private (Admin)
router.get('/applications', async (req, res) => {
  try {
    const { status, company, page = 1, limit = 100 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (company) query.company = new RegExp(company, 'i');
    
    const applications = await Application.find(query)
      .populate('user', 'firstName lastName email')
      .populate('assignedRecruiter', 'firstName lastName')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ lastUpdate: -1 });
    
    const total = await Application.countDocuments(query);
    
    res.json({
      success: true,
      count: applications.length,
      total,
      pages: Math.ceil(total / limit),
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

// @route   GET /api/admin/analytics
// @desc    Get system analytics
// @access  Private (Admin)
router.get('/analytics', async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const analytics = {
      users: {
        total: await User.countDocuments({ role: 'user' }),
        active: await User.countDocuments({ role: 'user', isActive: true }),
        newThisMonth: await User.countDocuments({ 
          role: 'user', 
          createdAt: { $gte: thirtyDaysAgo } 
        })
      },
      recruiters: {
        total: await User.countDocuments({ role: 'recruiter' }),
        active: await User.countDocuments({ role: 'recruiter', isActive: true })
      },
      applications: {
        total: await Application.countDocuments(),
        thisMonth: await Application.countDocuments({ 
          createdAt: { $gte: thirtyDaysAgo } 
        }),
        byStatus: await Application.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        topCompanies: await Application.aggregate([
          { $group: { _id: '$company', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ])
      },
      jobs: {
        total: await Job.countDocuments(),
        active: await Job.countDocuments({ isActive: true }),
        bySource: await Job.aggregate([
          { $group: { _id: '$source', count: { $sum: 1 } } }
        ])
      }
    };
    
    res.json({
      success: true,
      data: { analytics }
    });
  } catch (error) {
    logger.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
});

// @route   POST /api/admin/assign
// @desc    Assign candidate to recruiter
// @access  Private (Admin)
router.post('/assign', async (req, res) => {
  try {
    const { candidateId, recruiterId } = req.body;
    
    const candidate = await User.findById(candidateId);
    const recruiter = await User.findById(recruiterId);
    
    if (!candidate || candidate.role !== 'user') {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }
    
    if (!recruiter || recruiter.role !== 'recruiter') {
      return res.status(404).json({
        success: false,
        message: 'Recruiter not found'
      });
    }
    
    // Add candidate to recruiter's assigned list
    await User.findByIdAndUpdate(recruiterId, {
      $addToSet: { assignedCandidates: candidateId }
    });
    
    // Update candidate's applications with recruiter
    await Application.updateMany(
      { user: candidateId, assignedRecruiter: null },
      { assignedRecruiter: recruiterId }
    );
    
    logger.info(`Candidate ${candidateId} assigned to recruiter ${recruiterId}`);
    
    res.json({
      success: true,
      message: 'Candidate assigned successfully'
    });
  } catch (error) {
    logger.error('Error assigning candidate:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning candidate',
      error: error.message
    });
  }
});

// @route   POST /api/admin/sync-sheets
// @desc    Manually trigger Google Sheets sync
// @access  Private (Admin)
router.post('/sync-sheets', async (req, res) => {
  try {
    await syncToGoogleSheets();
    
    res.json({
      success: true,
      message: 'Google Sheets sync completed successfully'
    });
  } catch (error) {
    logger.error('Error syncing to sheets:', error);
    res.status(500).json({
      success: false,
      message: 'Error syncing to Google Sheets',
      error: error.message
    });
  }
});

// @route   PATCH /api/admin/user/:id
// @desc    Update user (activate/deactivate, change role)
// @access  Private (Admin)
router.patch('/user/:id', async (req, res) => {
  try {
    const { isActive, role } = req.body;
    
    const updates = {};
    if (isActive !== undefined) updates.isActive = isActive;
    if (role) updates.role = role;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    logger.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/user/:id
// @desc    Delete user
// @access  Private (Admin)
router.delete('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Delete user's applications
    await Application.deleteMany({ user: req.params.id });
    
    // Remove from recruiters' assigned candidates
    await User.updateMany(
      { role: 'recruiter' },
      { $pull: { assignedCandidates: req.params.id } }
    );
    
    await User.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

module.exports = router;
