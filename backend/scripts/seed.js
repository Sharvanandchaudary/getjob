const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Application = require('../models/Application');
const Job = require('../models/Job');
require('dotenv').config();

async function seed() {
  try {
    console.log('🌱 Starting database seed...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Application.deleteMany({});
    await Job.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create Admin
    const admin = await User.create({
      email: 'admin@example.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
      emailVerified: true
    });
    console.log('✅ Created admin user');

    // Create Recruiters
    const recruiter1 = await User.create({
      email: 'recruiter@example.com',
      password: 'recruiter123',
      firstName: 'John',
      lastName: 'Recruiter',
      role: 'recruiter',
      company: 'TechCorp Inc.',
      isActive: true
    });

    const recruiter2 = await User.create({
      email: 'recruiter2@example.com',
      password: 'recruiter123',
      firstName: 'Sarah',
      lastName: 'Smith',
      role: 'recruiter',
      company: 'StartupXYZ',
      isActive: true
    });
    console.log('✅ Created 2 recruiters');

    // Create Sample Users
    const users = [];
    for (let i = 1; i <= 5; i++) {
      const user = await User.create({
        email: `user${i}@example.com`,
        password: 'user123',
        firstName: `User${i}`,
        lastName: `Test`,
        role: 'user',
        phone: `555-010${i}`,
        resume: {
          text: 'Experienced software developer with 5+ years in web development...',
          uploadedAt: new Date(),
          parsedData: {
            skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
            experience: '5 years',
            education: ['BS Computer Science'],
            summary: 'Full-stack developer with expertise in modern web technologies',
            jobTitles: ['Software Engineer', 'Full Stack Developer'],
            experienceLevel: 'mid'
          }
        },
        preferences: {
          jobTitles: ['Software Engineer', 'Full Stack Developer', 'Backend Developer'],
          locations: ['Remote', 'San Francisco', 'New York'],
          minSalary: 80000,
          maxSalary: 150000,
          remotePreference: 'remote'
        },
        isActive: true
      });
      users.push(user);
    }
    console.log('✅ Created 5 sample users');

    // Assign candidates to recruiters
    recruiter1.assignedCandidates = [users[0]._id, users[1]._id, users[2]._id];
    await recruiter1.save();
    
    recruiter2.assignedCandidates = [users[3]._id, users[4]._id];
    await recruiter2.save();
    console.log('✅ Assigned candidates to recruiters');

    // Create Sample Jobs
    const jobs = await Job.create([
      {
        title: 'Senior Software Engineer',
        company: 'Google',
        description: 'We are looking for a senior software engineer...',
        location: 'Mountain View, CA',
        remote: 'hybrid',
        salary: { min: 150000, max: 200000, currency: 'USD', period: 'yearly' },
        jobType: 'full-time',
        url: 'https://careers.google.com/jobs/123',
        skills: ['JavaScript', 'React', 'System Design'],
        experienceLevel: 'senior',
        postedDate: new Date(),
        isActive: true,
        source: 'manual'
      },
      {
        title: 'Full Stack Developer',
        company: 'Meta',
        description: 'Join our team as a full stack developer...',
        location: 'Remote',
        remote: 'remote',
        salary: { min: 120000, max: 170000, currency: 'USD', period: 'yearly' },
        jobType: 'full-time',
        url: 'https://www.metacareers.com/jobs/456',
        skills: ['React', 'Node.js', 'GraphQL'],
        experienceLevel: 'mid',
        postedDate: new Date(),
        isActive: true,
        source: 'ai-scraped'
      },
      {
        title: 'Backend Engineer',
        company: 'Amazon',
        description: 'Looking for backend engineers to join AWS team...',
        location: 'Seattle, WA',
        remote: 'onsite',
        salary: { min: 130000, max: 180000, currency: 'USD', period: 'yearly' },
        jobType: 'full-time',
        url: 'https://amazon.jobs/en/jobs/789',
        skills: ['Python', 'AWS', 'Microservices'],
        experienceLevel: 'mid',
        postedDate: new Date(),
        isActive: true,
        source: 'manual'
      }
    ]);
    console.log('✅ Created 3 sample jobs');

    // Create Sample Applications
    const statuses = ['applied', 'screening', 'interview', 'offer', 'rejected'];
    const applications = [];

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const numApplications = Math.floor(Math.random() * 5) + 3; // 3-7 applications per user

      for (let j = 0; j < numApplications; j++) {
        const application = await Application.create({
          user: user._id,
          company: ['Google', 'Meta', 'Amazon', 'Netflix', 'Apple', 'Microsoft'][Math.floor(Math.random() * 6)],
          position: ['Software Engineer', 'Full Stack Developer', 'Backend Engineer', 'Frontend Developer'][Math.floor(Math.random() * 4)],
          jobUrl: `https://example.com/job/${Math.random().toString(36).substr(2, 9)}`,
          location: ['San Francisco', 'New York', 'Remote', 'Seattle'][Math.floor(Math.random() * 4)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          salary: {
            min: 100000 + Math.floor(Math.random() * 50000),
            max: 150000 + Math.floor(Math.random() * 50000),
            currency: 'USD'
          },
          jobType: 'full-time',
          appliedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
          assignedRecruiter: i < 3 ? recruiter1._id : recruiter2._id,
          source: 'manual',
          notes: [
            {
              author: i < 3 ? recruiter1._id : recruiter2._id,
              text: 'Great candidate, moving to next round',
              createdAt: new Date()
            }
          ]
        });
        
        applications.push(application);
        user.applications.push(application._id);
      }
      
      await user.save();
    }
    console.log(`✅ Created ${applications.length} sample applications`);

    // Summary
    console.log('\n📊 Database Seed Summary:');
    console.log('========================');
    console.log(`👤 Admin Users: 1`);
    console.log(`👨‍💼 Recruiters: 2`);
    console.log(`👥 Users: ${users.length}`);
    console.log(`💼 Jobs: ${jobs.length}`);
    console.log(`📝 Applications: ${applications.length}`);
    console.log('\n🔐 Default Credentials:');
    console.log('========================');
    console.log('Admin: admin@example.com / admin123');
    console.log('Recruiter: recruiter@example.com / recruiter123');
    console.log('User: user1@example.com / user123');
    console.log('\n✨ Seed completed successfully!\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
