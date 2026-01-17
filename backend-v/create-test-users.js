const mongoose = require('mongoose');
const User = require('./schema/User');
const bcrypt = require('bcryptjs');

async function createTestUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fe_collab');
    console.log('Connected successfully!');

    // Create test users with different roles
    const testUsers = [
      {
        name: 'John Client',
        email: 'client1@example.com',
        role: 'client',
        status: 'active',
        password: await bcrypt.hash('password123', 10)
      },
      {
        name: 'Jane Client',
        email: 'client2@example.com',
        role: 'client',
        status: 'active',
        password: await bcrypt.hash('password123', 10)
      },
      {
        name: 'Bob Staff',
        email: 'staff1@example.com',
        role: 'staff',
        status: 'active',
        password: await bcrypt.hash('password123', 10)
      },
      {
        name: 'Alice Admin',
        email: 'admin@example.com',
        role: 'admin',
        status: 'active',
        password: await bcrypt.hash('password123', 10)
      }
    ];

    console.log('Creating test users...');
    for (const userData of testUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        await User.create(userData);
        console.log(`Created user: ${userData.name} (${userData.role})`);
      } else {
        console.log(`User already exists: ${userData.email}`);
      }
    }

    // Show final user count
    const totalCount = await User.countDocuments();
    const roleCounts = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    console.log(`\nFinal user count: ${totalCount}`);
    console.log('Role distribution:');
    roleCounts.forEach(role => {
      console.log(`  ${role._id}: ${role.count}`);
    });

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestUsers();