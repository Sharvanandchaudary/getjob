const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

console.log('Testing MongoDB Atlas connection...');
console.log('Connection string:', uri.replace(/:[^:@]+@/, ':****@'));

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000
})
.then(() => {
  console.log('✅ Successfully connected to MongoDB Atlas!');
  console.log('Database:', mongoose.connection.name);
  process.exit(0);
})
.catch((err) => {
  console.error('❌ Connection failed:', err.message);
  console.error('\nPossible reasons:');
  console.error('1. Cluster is still being created (wait 5-7 minutes)');
  console.error('2. IP address not whitelisted');
  console.error('3. Incorrect username or password');
  console.error('4. Network/firewall blocking connection');
  process.exit(1);
});
