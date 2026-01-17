const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/FunnelsEye');
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Fix AdminRequest schema and indexes
const fixAdminRequestSchema = async () => {
    try {
        console.log('🔧 Starting AdminRequest schema fix...');
        
        const db = mongoose.connection.db;
        const collection = db.collection('adminrequests');
        
        // 1. Drop the old requestId unique index
        console.log('📋 Dropping old requestId unique index...');
        try {
            await collection.dropIndex('requestId_1');
            console.log('✅ Dropped requestId_1 index');
        } catch (error) {
            if (error.code === 27) {
                console.log('ℹ️ requestId_1 index does not exist (already dropped)');
            } else {
                console.log('⚠️ Error dropping requestId_1 index:', error.message);
            }
        }
        
        // 2. Remove any documents with null requestId (if any exist)
        console.log('🧹 Cleaning up documents with null requestId...');
        const deleteResult = await collection.deleteMany({ requestId: null });
        console.log(`✅ Deleted ${deleteResult.deletedCount} documents with null requestId`);
        
        // 3. Remove requestId field from all existing documents
        console.log('🔄 Removing requestId field from existing documents...');
        const updateResult = await collection.updateMany(
            { requestId: { $exists: true } },
            { $unset: { requestId: 1 } }
        );
        console.log(`✅ Updated ${updateResult.modifiedCount} documents to remove requestId field`);
        
        // 4. Create new indexes
        console.log('📊 Creating new indexes...');
        await collection.createIndex({ coachId: 1 });
        await collection.createIndex({ status: 1 });
        await collection.createIndex({ requestType: 1 });
        await collection.createIndex({ createdAt: -1 });
        console.log('✅ Created new indexes');
        
        // 5. List all indexes to verify
        console.log('📋 Current indexes:');
        const indexes = await collection.indexes();
        indexes.forEach(index => {
            console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
        });
        
        console.log('🎉 AdminRequest schema fix completed successfully!');
        
    } catch (error) {
        console.error('❌ Error fixing AdminRequest schema:', error);
        throw error;
    }
};

// Main execution
const main = async () => {
    try {
        await connectDB();
        await fixAdminRequestSchema();
        console.log('✅ Migration completed successfully');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
};

// Run the migration
main();
