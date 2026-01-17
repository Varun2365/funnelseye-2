const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/your-database-name', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('✅ Connected to MongoDB');
  
  try {
    const User = require('./schema/User');
    const AdminRequest = require('./schema/AdminRequest');
    
    // Check if coach already exists
    const existingCoach = await User.findOne({ email: 'testcoach@example.com' });
    if (existingCoach) {
      console.log('✅ Test coach already exists');
      
      // Create sample admin request for existing coach
      const existingRequest = await AdminRequest.findOne({ coachId: existingCoach._id });
      if (!existingRequest) {
        const sampleRequest = new AdminRequest({
          coachId: existingCoach._id,
          requestType: 'sponsor_change',
          currentData: {
            selfCoachId: existingCoach.selfCoachId || 'COACH-2024-0001',
            currentLevel: existingCoach.currentLevel || 1,
            sponsorId: existingCoach.sponsorId
          },
          requestedData: {
            sponsorId: '64f1234567890abcdef123456' // Sample sponsor ID
          },
          reason: 'Requesting sponsor change for better team alignment and growth opportunities'
        });
        
        await sampleRequest.save();
        console.log('✅ Sample admin request created for existing coach');
        console.log(`   Request ID: ${sampleRequest._id}`);
        console.log(`   Coach: ${existingCoach.name} (${existingCoach.email})`);
      } else {
        console.log('✅ Admin request already exists for coach');
      }
    } else {
      // Create sample coach user
      const sampleCoach = new User({
        name: 'Test Coach',
        email: 'testcoach@example.com',
        password: 'password123', // This should be hashed in real implementation
        role: 'coach',
        selfCoachId: 'COACH-2024-0001',
        currentLevel: 1,
        isActive: true,
        phone: '+1234567890',
        address: '123 Test Street, Test City, TC 12345'
      });
      
      await sampleCoach.save();
      console.log('✅ Sample coach created successfully');
      console.log(`   Coach ID: ${sampleCoach._id}`);
      console.log(`   Name: ${sampleCoach.name}`);
      console.log(`   Email: ${sampleCoach.email}`);
      
      // Create sample admin request
      const sampleRequest = new AdminRequest({
        coachId: sampleCoach._id,
        requestType: 'sponsor_change',
        currentData: {
          selfCoachId: sampleCoach.selfCoachId,
          currentLevel: sampleCoach.currentLevel,
          sponsorId: sampleCoach.sponsorId
        },
        requestedData: {
          sponsorId: '64f1234567890abcdef123456' // Sample sponsor ID
        },
        reason: 'Requesting sponsor change for better team alignment and growth opportunities'
      });
      
      await sampleRequest.save();
      console.log('✅ Sample admin request created successfully');
      console.log(`   Request ID: ${sampleRequest._id}`);
      console.log(`   Coach: ${sampleCoach.name} (${sampleCoach.email})`);
    }
    
    // Check final admin requests count
    const totalRequests = await AdminRequest.countDocuments();
    console.log(`\n📊 Total AdminRequests in database: ${totalRequests}`);
    
    // Show all requests
    const requests = await AdminRequest.find({})
      .populate('coachId', 'name email selfCoachId')
      .sort({ createdAt: -1 });
    
    console.log('\n📋 All Admin Requests:');
    requests.forEach((req, index) => {
      console.log(`\n${index + 1}. Request ID: ${req._id}`);
      console.log(`   Coach: ${req.coachId?.name || 'N/A'} (${req.coachId?.email || 'N/A'})`);
      console.log(`   Type: ${req.requestType}`);
      console.log(`   Status: ${req.status}`);
      console.log(`   Created: ${req.createdAt}`);
      console.log(`   Reason: ${req.reason?.substring(0, 100)}...`);
    });
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  }
  
  process.exit();
}).catch(error => {
  console.error('❌ MongoDB connection error:', error);
  process.exit();
});
