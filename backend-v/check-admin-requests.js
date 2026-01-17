const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/your-database-name', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('✅ Connected to MongoDB');
  
  try {
    const AdminRequest = require('./schema/AdminRequest');
    
    // Check total admin requests
    const totalRequests = await AdminRequest.countDocuments();
    console.log(`📊 Total AdminRequests in database: ${totalRequests}`);
    
    if (totalRequests > 0) {
      // Get sample requests
      const requests = await AdminRequest.find({})
        .populate('coachId', 'name email selfCoachId')
        .sort({ createdAt: -1 })
        .limit(5);
      
      console.log('\n📋 Sample Admin Requests:');
      requests.forEach((req, index) => {
        console.log(`\n${index + 1}. Request ID: ${req._id}`);
        console.log(`   Coach: ${req.coachId?.name || 'N/A'} (${req.coachId?.email || 'N/A'})`);
        console.log(`   Type: ${req.requestType}`);
        console.log(`   Status: ${req.status}`);
        console.log(`   Created: ${req.createdAt}`);
        console.log(`   Reason: ${req.reason?.substring(0, 100)}...`);
      });
    } else {
      console.log('❌ No admin requests found in database');
      
      // Create a sample admin request for testing
      console.log('\n🔧 Creating sample admin request for testing...');
      const User = require('./schema/User');
      
      // Find a coach user
      const coach = await User.findOne({ role: 'coach' });
      if (coach) {
        const sampleRequest = new AdminRequest({
          coachId: coach._id,
          requestType: 'sponsor_change',
          currentData: {
            selfCoachId: coach.selfCoachId,
            currentLevel: coach.currentLevel,
            sponsorId: coach.sponsorId
          },
          requestedData: {
            sponsorId: '64f1234567890abcdef123456' // Sample sponsor ID
          },
          reason: 'Requesting sponsor change for better team alignment and growth opportunities'
        });
        
        await sampleRequest.save();
        console.log('✅ Sample admin request created successfully');
        console.log(`   Request ID: ${sampleRequest._id}`);
        console.log(`   Coach: ${coach.name} (${coach.email})`);
      } else {
        console.log('❌ No coach users found in database');
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking admin requests:', error);
  }
  
  process.exit();
}).catch(error => {
  console.error('❌ MongoDB connection error:', error);
  process.exit();
});
