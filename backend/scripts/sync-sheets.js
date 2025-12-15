const mongoose = require('mongoose');
const { syncToGoogleSheets } = require('../services/googleSheetsService');
require('dotenv').config();

async function main() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected');

    console.log('Syncing to Google Sheets...');
    await syncToGoogleSheets();
    console.log('Google Sheets sync completed');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
