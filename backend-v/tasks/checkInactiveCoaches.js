// D:\\PRJ_YCT_Final\\tasks\\checkInactiveCoaches.js

const cron = require('node-cron');
const { Coach } = require('../schema');
const sendAlertToSponsor = require('../services/alertService');

// Inactivity threshold is 4 days
const INACTIVITY_THRESHOLD_DAYS = 4;
const CHECK_FREQUENCY = '0 0 * * *'; // Run once every day at midnight

const checkInactiveCoaches = async () => {
    // console.log('Running scheduled task to check for inactive coaches...');
    const now = new Date();
    const thresholdDate = new Date(now.setDate(now.getDate() - INACTIVITY_THRESHOLD_DAYS));

    try {
        // Find all coaches who are sponsors and have an active downline
        const sponsors = await Coach.find({ role: 'coach' });

        for (const sponsor of sponsors) {
            // Find downline members for this sponsor who have been inactive
            const inactiveDownline = await Coach.find({
                sponsorId: sponsor._id,
                lastActiveAt: { $lt: thresholdDate }
            });

            if (inactiveDownline.length > 0) {
                console.log(`Sponsor ${sponsor.name} has ${inactiveDownline.length} newly inactive downline member(s).`);
                
                // For each newly inactive member, send an alert to the sponsor
                for (const inactiveMember of inactiveDownline) {
                    const message = `Alert: Your downline member, ${inactiveMember.name}, has been inactive for over ${INACTIVITY_THRESHOLD_DAYS} days.`;
                    
                    // Call the alert service
                    await sendAlertToSponsor(sponsor, inactiveMember, message);
                    
                    // Note: Schema has no isInactive flag; avoid writing unknown fields
                }
            }
        }

    } catch (err) {
        console.error('Error in checkInactiveCoaches task:', err);
    }
};

exports.start = () => {
    // Schedule the task to run automatically
    cron.schedule(CHECK_FREQUENCY, () => {
        checkInactiveCoaches();
    });

    // console.log('Inactive coach checker task scheduled.');
};