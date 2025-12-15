const mongoose = require('mongoose');
const { sendDailyReports } = require('../services/cronService');
require('dotenv').config();

async function main() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected');

    console.log('Sending daily reports...');
    await sendDailyReports();
    console.log('Daily reports sent successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
