const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    index: true
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: [String],
  responsibilities: [String],
  location: {
    type: String,
    trim: true
  },
  remote: {
    type: String,
    enum: ['remote', 'hybrid', 'onsite'],
    default: 'onsite'
  },
  salary: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'USD' },
    period: { type: String, enum: ['hourly', 'monthly', 'yearly'], default: 'yearly' }
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'temporary'],
    default: 'full-time'
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  companyWebsite: String,
  // Source tracking
  source: {
    type: String,
    enum: ['manual', 'ai-scraped', 'api', 'n8n-workflow'],
    default: 'manual'
  },
  sourceDetails: {
    platform: String, // Indeed, LinkedIn, Glassdoor, etc.
    scrapedAt: Date,
    apiId: String
  },
  // AI matching data
  matchScore: {
    type: Number,
    min: 0,
    max: 100
  },
  matchedUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    score: Number,
    matchedAt: Date,
    notified: { type: Boolean, default: false }
  }],
  // Skills and keywords
  skills: [String],
  keywords: [String],
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead', 'executive']
  },
  // Dates
  postedDate: Date,
  expiresAt: Date,
  scrapedAt: Date,
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  // Application tracking
  applicationCount: {
    type: Number,
    default: 0
  },
  // Additional metadata
  category: String,
  industry: String,
  benefits: [String],
  companySize: String,
  tags: [String]
}, {
  timestamps: true
});

// Text search index
jobSchema.index({ 
  title: 'text', 
  company: 'text', 
  description: 'text',
  skills: 'text'
});

// Compound indexes for common queries
jobSchema.index({ isActive: 1, postedDate: -1 });
jobSchema.index({ source: 1, isActive: 1 });
jobSchema.index({ location: 1, isActive: 1 });

// Check if job is expired
jobSchema.methods.isExpired = function() {
  return this.expiresAt && this.expiresAt < new Date();
};

// Auto-deactivate expired jobs
jobSchema.pre('save', function(next) {
  if (this.isExpired()) {
    this.isActive = false;
  }
  next();
});

module.exports = mongoose.model('Job', jobSchema);
