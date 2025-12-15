const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Job = require('../models/Job');
const logger = require('../utils/logger');

// @route   GET /api/jobs
// @desc    Get all active jobs
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { search, location, remote, page = 1, limit = 20 } = req.query;
    
    const query = { isActive: true };
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (location) {
      query.location = new RegExp(location, 'i');
    }
    
    if (remote) {
      query.remote = remote;
    }
    
    const jobs = await Job.find(query)
      .sort({ postedDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Job.countDocuments(query);
    
    res.json({
      success: true,
      count: jobs.length,
      total,
      pages: Math.ceil(total / limit),
      data: { jobs }
    });
  } catch (error) {
    logger.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: error.message
    });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get single job
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    res.json({
      success: true,
      data: { job }
    });
  } catch (error) {
    logger.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job',
      error: error.message
    });
  }
});

module.exports = router;
