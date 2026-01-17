const mongoose = require('mongoose');
const { getCoachId, getToken } = require('../utils/authUtils');
const { API_BASE_URL } = require('../config/apiConfig');
const Commission = require('../schema/Commission');

// Create sample commission data for testing
const createSampleCommission = async () => {
    try {
        // Get a test coach ID (you can change this)
        const testCoachId = '675624b26de8a33a04a55a0d'; // Use your actual coach ID
        
        // Check if coach exists
        const User = require('../schema/User');
        const coach = await User.findById(testCoachId);
        
        if (!coach) {
            console.log('❌ Coach not found with ID:', testCoachId);
            return;
        }
        
        console.log('✅ Coach found:', coach.name);
        
        // Create sample commission record
        const sampleCommission = new Commission({
            coachId: testCoachId,
            subscriptionId: null, // You can add a subscription ID if needed
            referredBy: testCoachId, // Self-referred for testing
            subscriptionAmount: 100, // $100 test subscription
            commissionPercentage: 10, // 10% commission
            commissionAmount: 10, // $10 commission
            currency: 'USD',
            status: 'paid', // Paid status
            paymentDate: new Date(),
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            notes: 'Sample commission for testing'
        });
        
        await sampleCommission.save();
        console.log('✅ Sample commission created successfully');
        
    } catch (error) {
        console.error('❌ Error creating sample commission:', error);
    }
};

// Run the function
createSampleCommission().then(() => {
    console.log('🎉 Sample commission creation completed');
    process.exit(0);
}).catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
});
