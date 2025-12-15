const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'recruiter', 'admin'],
    default: 'user'
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  // User (Applicant) specific fields
  resume: {
    text: String,
    fileUrl: String,
    fileName: String,
    uploadedAt: Date,
    parsedData: {
      skills: [String],
      experience: String,
      education: [String],
      summary: String
    }
  },
  preferences: {
    jobTitles: [String],
    locations: [String],
    minSalary: Number,
    maxSalary: Number,
    jobTypes: [String], // full-time, part-time, contract
    remotePreference: {
      type: String,
      enum: ['remote', 'hybrid', 'onsite', 'any'],
      default: 'any'
    }
  },
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }],
  // Recruiter specific fields
  company: {
    type: String,
    trim: true
  },
  assignedCandidates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Admin specific fields
  permissions: [{
    type: String
  }],
  // Common fields
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailPreferences: {
    dailyReport: { type: Boolean, default: true },
    weeklyReport: { type: Boolean, default: true },
    statusUpdates: { type: Boolean, default: true },
    jobRecommendations: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
