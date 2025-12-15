require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const http = require('http');
const socketio = require('socket.io');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/applications');
const recruiterRoutes = require('./routes/recruiter');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');
const jobRoutes = require('./routes/jobs');

// Import services
const { initializeCronJobs } = require('./services/cronService');
const { authenticateSocket } = require('./middleware/auth');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  logger.info('MongoDB connected successfully');
})
.catch((err) => {
  logger.error('MongoDB connection error:', err);
  process.exit(1);
});

// Socket.io connection
io.use(authenticateSocket);

io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.user.id} - Role: ${socket.user.role}`);
  
  // Join user to their personal room
  socket.join(`user_${socket.user.id}`);
  
  // Join role-based rooms
  socket.join(`role_${socket.user.role}`);
  
  // Join recruiter's assigned candidates room
  if (socket.user.role === 'recruiter') {
    socket.join(`recruiter_${socket.user.id}`);
  }
  
  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.user.id}`);
  });
  
  // Handle real-time events
  socket.on('application:update', (data) => {
    // Broadcast to relevant users
    io.to(`user_${data.userId}`).emit('application:updated', data);
    if (data.recruiterId) {
      io.to(`recruiter_${data.recruiterId}`).emit('application:updated', data);
    }
    io.to('role_admin').emit('application:updated', data);
  });
  
  socket.on('status:change', (data) => {
    io.to(`user_${data.userId}`).emit('status:changed', data);
  });
});

// Make io accessible to routes
app.set('io', io);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/jobs', jobRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Error:', err);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Initialize cron jobs
initializeCronJobs();

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  logger.info(`Frontend URL: ${process.env.FRONTEND_URL}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = { app, io };
