const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  // Job details (captured at time of application)
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  position: {
    type: String,
    required: [true, 'Position title is required'],
    trim: true
  },
  jobUrl: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  salary: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'USD' }
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'temporary'],
    default: 'full-time'
  },
  // Application status tracking
  status: {
    type: String,
    enum: ['applied', 'screening', 'interview', 'technical', 'offer', 'accepted', 'rejected', 'withdrawn'],
    default: 'applied'
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: String
  }],
  // Recruiter assignment
  assignedRecruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Application dates
  appliedDate: {
    type: Date,
    default: Date.now
  },
  lastUpdate: {
    type: Date,
    default: Date.now
  },
  interviewDate: Date,
  offerDate: Date,
  responseDeadline: Date,
  // Notes and feedback
  notes: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    createdAt: { type: Date, default: Date.now },
    isPrivate: { type: Boolean, default: false } // Only visible to recruiters/admin
  }],
  // User's personal notes
  userNotes: String,
  // Resume used for this application
  resumeVersion: {
    fileUrl: String,
    fileName: String
  },
  // Additional fields
  source: {
    type: String,
    enum: ['manual', 'ai-recommended', 'recruiter-assigned'],
    default: 'manual'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  coverLetter: String,
  tags: [String],
  // Tracking
  viewedByRecruiter: {
    type: Boolean,
    default: false
  },
  viewedAt: Date,
  // Metadata
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Update lastUpdate on any change
applicationSchema.pre('save', function(next) {
  this.lastUpdate = new Date();
  next();
});

// Add status to history when status changes
applicationSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    });
  }
  next();
});

// Indexes for better query performance
applicationSchema.index({ user: 1, status: 1 });
applicationSchema.index({ assignedRecruiter: 1 });
applicationSchema.index({ appliedDate: -1 });
applicationSchema.index({ company: 1, position: 1 });

module.exports = mongoose.model('Application', applicationSchema);
