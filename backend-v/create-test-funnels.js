// Script to create test funnels for development/testing
const mongoose = require('mongoose');
const Funnel = require('./schema/Funnel');

// Connect to MongoDB
async function createTestFunnels() {
  try {
    // Connect to your MongoDB database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database-name');

    console.log('Connected to MongoDB');

    // Test coach ID - replace with actual coach ID from your auth system
    const testCoachId = '507f1f77bcf86cd799439011'; // Replace with actual coach ID

    // Create test funnels
    const testFunnels = [
      {
        name: 'Lead Generation Funnel',
        coachId: testCoachId,
        stages: [
          { name: 'Awareness', pageId: 'page1', order: 1 },
          { name: 'Interest', pageId: 'page2', order: 2 },
          { name: 'Consideration', pageId: 'page3', order: 3 },
          { name: 'Decision', pageId: 'page4', order: 4 }
        ]
      },
      {
        name: 'Sales Funnel',
        coachId: testCoachId,
        stages: [
          { name: 'Prospect', pageId: 'page5', order: 1 },
          { name: 'Qualified Lead', pageId: 'page6', order: 2 },
          { name: 'Proposal', pageId: 'page7', order: 3 },
          { name: 'Closed Won', pageId: 'page8', order: 4 }
        ]
      },
      {
        name: 'Email Marketing Funnel',
        coachId: testCoachId,
        stages: [
          { name: 'Subscriber', pageId: 'page9', order: 1 },
          { name: 'Engaged', pageId: 'page10', order: 2 },
          { name: 'Customer', pageId: 'page11', order: 3 }
        ]
      }
    ];

    console.log('Creating test funnels...');

    for (const funnelData of testFunnels) {
      const funnel = new Funnel(funnelData);
      await funnel.save();
      console.log(`Created funnel: ${funnel.name}`);
    }

    console.log('Test funnels created successfully!');
    console.log('You can now test the funnel assignment feature in the automation rules.');

  } catch (error) {
    console.error('Error creating test funnels:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
createTestFunnels();