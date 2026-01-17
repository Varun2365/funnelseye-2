// Script to check existing funnels in the database
const mongoose = require('mongoose');
const Funnel = require('./schema/Funnel');
const User = require('./schema/User');

async function checkFunnels() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/FunnelsEye');
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({ role: 'coach' }).select('_id name email');
    console.log('Found coaches:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}): ${user._id}`);
    });

    // Get all funnels
    const funnels = await Funnel.find({}).select('name coachId stages');
    console.log(`\nFound ${funnels.length} funnels:`);

    funnels.forEach((funnel, index) => {
      const coach = users.find(u => u._id.toString() === funnel.coachId.toString());
      console.log(`${index + 1}. ${funnel.name}`);
      console.log(`   Coach: ${coach ? coach.name : 'Unknown'} (${funnel.coachId})`);
      console.log(`   Stages: ${funnel.stages?.length || 0}`);
    });

    // Check if there are any funnels without coachId
    const funnelsWithoutCoach = await Funnel.find({ coachId: { $exists: false } });
    console.log(`\nFunnels without coachId: ${funnelsWithoutCoach.length}`);

    const funnelsWithNullCoach = await Funnel.find({ coachId: null });
    console.log(`Funnels with null coachId: ${funnelsWithNullCoach.length}`);

  } catch (error) {
    console.error('Error checking funnels:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkFunnels();