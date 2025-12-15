const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const aiService = require('../services/aiService');
const User = require('../models/User');
const logger = require('../utils/logger');

// Configure multer for resume uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and text files are allowed'), false);
    }
  }
});

// @route   POST /api/ai/analyze-resume
// @desc    Analyze resume and extract information
// @access  Private
router.post('/analyze-resume', protect, upload.single('resume'), async (req, res) => {
  try {
    const { resumeText } = req.body;
    const resumeFile = req.file;
    
    if (!resumeText && !resumeFile) {
      return res.status(400).json({
        success: false,
        message: 'Please provide resume text or file'
      });
    }
    
    const result = await aiService.analyzeResume(resumeText, resumeFile);
    
    // Update user's resume data
    await User.findByIdAndUpdate(req.user.id, {
      resume: {
        text: result.data.text,
        fileName: resumeFile?.originalname,
        uploadedAt: new Date(),
        parsedData: result.data.parsed
      }
    });
    
    logger.info(`Resume analyzed for user: ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Resume analyzed successfully',
      data: result.data.parsed
    });
  } catch (error) {
    logger.error('Resume analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing resume',
      error: error.message
    });
  }
});

// @route   GET /api/ai/job-matches
// @desc    Get AI-matched jobs for user
// @access  Private
router.get('/job-matches', protect, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const user = await User.findById(req.user.id);
    
    if (!user.resume || !user.resume.parsedData) {
      return res.status(400).json({
        success: false,
        message: 'Please upload and analyze your resume first'
      });
    }
    
    const result = await aiService.findMatchingJobs(req.user.id, parseInt(limit));
    
    res.json({
      success: true,
      message: 'Job matches retrieved successfully',
      data: result.data
    });
  } catch (error) {
    logger.error('Job matching error:', error);
    res.status(500).json({
      success: false,
      message: 'Error finding job matches',
      error: error.message
    });
  }
});

// @route   POST /api/ai/recommend
// @desc    Get personalized job recommendations
// @access  Private
router.post('/recommend', protect, async (req, res) => {
  try {
    const { preferences } = req.body;
    
    // Update user preferences if provided
    if (preferences) {
      await User.findByIdAndUpdate(req.user.id, { preferences });
    }
    
    const result = await aiService.findMatchingJobs(req.user.id, 20);
    
    res.json({
      success: true,
      message: 'Recommendations generated successfully',
      data: result.data
    });
  } catch (error) {
    logger.error('Recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating recommendations',
      error: error.message
    });
  }
});

module.exports = router;
