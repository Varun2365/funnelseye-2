// Simple script to add commission data to MongoDB
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/your-database-name', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const Commission = require('./schema/Commission');
    const User = require('./schema/User');
    
    try {
        // Find your coach
        const coachId = '675624b26de8a33a04a55a0d'; // Your coach ID
        const coach = await User.findById(coachId);
        
        if (!coach) {
            console.log('❌ Coach not found');
            return;
        }
        
        console.log('✅ Coach found:', coach.name);
        
        // Create sample commission
        const commission = new Commission({
            coachId: coachId,
            subscriptionId: null,
            referredBy: coachId,
            subscriptionAmount: 100,
            commissionPercentage: 10,
            commissionAmount: 10,
            currency: 'USD',
            status: 'paid',
            paymentDate: new Date(),
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            notes: 'Sample commission for testing - Sponsor change functionality'
        });
        
        const result = await commission.save();
        console.log('✅ Commission created:', result._id);
        
        // Create another commission with different status
        const commission2 = new Commission({
            coachId: coachId,
            subscriptionId: null,
            referredBy: coachId,
            subscriptionAmount: 50,
            commissionPercentage: 5,
            commissionAmount: 2.5,
            currency: 'USD',
            status: 'pending',
            paymentDate: new Date(),
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            notes: 'Pending commission from new referral'
        });
        
        const result2 = await commission2.save();
        console.log('✅ Pending commission created:', result2._id);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        mongoose.connection.close();
    }
}).catch(error => {
    console.error('❌ MongoDB connection error:', error);
});
