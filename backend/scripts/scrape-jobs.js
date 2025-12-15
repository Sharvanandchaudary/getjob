const mongoose = require('mongoose');
const User = require('../models/User');
const aiService = require('../services/aiService');
require('dotenv').config();

async function main() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected');

    console.log('Finding users with resumes...');
    const users = await User.find({
      role: 'user',
      isActive: true,
      'resume.parsedData': { $exists: true }
    });

    console.log(`Found ${users.length} users to process`);

    for (const user of users) {
      try {
        console.log(`Scraping jobs for user: ${user.email}`);
        await aiService.findMatchingJobs(user._id, 20);
        console.log(`Completed for ${user.email}`);
      } catch (error) {
        console.error(`Error for user ${user.email}:`, error.message);
      }
    }

    console.log('Job scraping completed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
