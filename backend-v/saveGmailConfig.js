/**
 * Simple script to save Gmail configuration
 * Run this to set up email configuration in the database
 * 
 * Usage: node saveGmailConfig.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { AdminSystemSettings } = require('./schema');

// ===== CONFIGURE YOUR GMAIL HERE =====
const GMAIL_CONFIG = {
    gmailId: 'varun.kumar.sharma.2365@gmail.com',           // ← Change this to your Gmail
    appPassword: 'kdog vgzs phvu zgju',  // ← Change this to your Gmail App Password
    fromEmail: 'noreply@funnelseye.com',       // ← Optional: Display email
    fromName: 'FunnelsEye'                     // ← Optional: Display name
};
// =======================================

async function saveGmailConfig() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect('mongodb://localhost:27017/FunnelsEye');
        console.log('✅ Connected to MongoDB');

        console.log('🔄 Saving Gmail configuration...');
        
        const result = await AdminSystemSettings.findOneAndUpdate(
            { settingId: 'global' },
            {
                $set: {
                    'notifications.email': {
                        enabled: true,
                        gmailId: GMAIL_CONFIG.gmailId,
                        appPassword: GMAIL_CONFIG.appPassword,
                        fromEmail: GMAIL_CONFIG.fromEmail,
                        fromName: GMAIL_CONFIG.fromName
                    }
                }
            },
            { 
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        );

        console.log('✅ Gmail configuration saved successfully!');
        console.log('📧 Gmail ID:', GMAIL_CONFIG.gmailId);
        console.log('📛 From Name:', GMAIL_CONFIG.fromName);
        console.log('📮 From Email:', GMAIL_CONFIG.fromEmail);
        
        console.log('\n✨ Email system is now configured!');
        console.log('🚀 Restart your server to use the new configuration');
        
        await mongoose.disconnect();
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error saving Gmail configuration:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

saveGmailConfig();

