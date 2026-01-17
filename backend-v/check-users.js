const mongoose = require('mongoose');
const User = require('./schema/User');

async function checkUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/FunnelsEye');
    console.log('Connected successfully!');

    const totalCount = await User.countDocuments();
    console.log(`Total users in database: ${totalCount}`);

    if (totalCount > 0) {
      const users = await User.find({}, 'name email role status').limit(5);
      console.log('Sample users:');
      users.forEach(user => {
        console.log(`  ${user.name} - ${user.email} - Role: ${user.role} - Status: ${user.status}`);
      });

      const roleCounts = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]);
      console.log('\nRole distribution:');
      roleCounts.forEach(role => {
        console.log(`  ${role._id}: ${role.count}`);
      });
    } else {
      console.log('No users found in database. Let me check if the collection exists...');

      // Check if there are any documents in any collections
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('Available collections:');
      collections.forEach(col => {
        console.log(`  ${col.name}`);
      });
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    console.error('Error details:', error.message);
  }
}

checkUsers();