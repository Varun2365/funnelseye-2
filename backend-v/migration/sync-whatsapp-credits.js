const mongoose = require('mongoose');
const Coach = require('../schema/coachSchema');
const WhatsAppCredit = require('../schema/WhatsAppCredit');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function syncWhatsAppCredits() {
    try {
        console.log('🔄 Starting WhatsApp credit sync migration...\n');

        // Get all coaches
        const coaches = await Coach.find({});
        console.log(`Found ${coaches.length} coaches to sync\n`);

        let syncedCount = 0;
        let errorCount = 0;

        for (const coach of coaches) {
            try {
                console.log(`Processing coach: ${coach.name || coach.email} (ID: ${coach._id})`);
                
                // Get or create WhatsApp credits
                const whatsappCredits = await WhatsAppCredit.getOrCreateCredits(coach._id);
                
                // Sync the balance
                const oldBalance = coach.messagingCredits || 0;
                const newBalance = whatsappCredits.balance;
                
                // Update coach's messaging credits to match WhatsApp credits
                coach.messagingCredits = newBalance;
                coach.whatsappCredits = {
                    enabled: true,
                    lastSync: new Date()
                };
                
                await coach.save();
                
                console.log(`  ✅ Synced: ${oldBalance} → ${newBalance} credits`);
                syncedCount++;
                
            } catch (error) {
                console.error(`  ❌ Error syncing coach ${coach._id}:`, error.message);
                errorCount++;
            }
        }

        console.log(`\n📊 Migration Summary:`);
        console.log(`  ✅ Successfully synced: ${syncedCount} coaches`);
        console.log(`  ❌ Errors: ${errorCount} coaches`);
        console.log(`  📈 Total processed: ${coaches.length} coaches`);

        // Show credit distribution
        const creditStats = await WhatsAppCredit.aggregate([
            {
                $group: {
                    _id: null,
                    totalCredits: { $sum: '$balance' },
                    avgCredits: { $avg: '$balance' },
                    minCredits: { $min: '$balance' },
                    maxCredits: { $max: '$balance' },
                    totalCoaches: { $sum: 1 }
                }
            }
        ]);

        if (creditStats.length > 0) {
            const stats = creditStats[0];
            console.log(`\n💰 Credit Statistics:`);
            console.log(`  Total Credits: ${stats.totalCredits}`);
            console.log(`  Average Credits: ${Math.round(stats.avgCredits)}`);
            console.log(`  Min Credits: ${stats.minCredits}`);
            console.log(`  Max Credits: ${stats.maxCredits}`);
            console.log(`  Total Coaches: ${stats.totalCoaches}`);
        }

        console.log('\n✅ Migration completed successfully!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        mongoose.connection.close();
    }
}

// Run the migration
syncWhatsAppCredits();
