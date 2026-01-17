const Appointment = require('../schema/Appointment');
const logger = require('../utils/logger') || console;

/**
 * Zoom Cleanup Service
 * Automatically removes Zoom meeting data for appointments older than specified days
 */
class ZoomCleanupService {
    constructor() {
        this.cleanupInterval = null;
        this.defaultRetentionDays = 2; // Default: delete meetings older than 2 days
    }

    /**
     * Start the automatic cleanup process
     * @param {number} retentionDays - Number of days to keep Zoom meeting data
     * @param {string} interval - Cleanup interval ('daily', 'weekly', 'manual')
     */
    startCleanup(retentionDays = this.defaultRetentionDays, interval = 'daily') {
        if (this.cleanupInterval) {
            this.stopCleanup();
        }

        const retentionMs = retentionDays * 24 * 60 * 60 * 1000;
        
        if (interval === 'daily') {
            // Run cleanup daily at 2 AM
            this.cleanupInterval = setInterval(() => {
                const now = new Date();
                const twoAM = new Date(now);
                twoAM.setHours(2, 0, 0, 0);
                
                if (now >= twoAM) {
                    this.performCleanup(retentionMs);
                }
            }, 60 * 60 * 1000); // Check every hour
            
            // Don't run immediately on restart - only schedule for next 2 AM
            const nextCleanup = this.getNextCleanupTime();
            // logger.info(`[ZoomCleanup] Scheduled daily cleanup at 2 AM with ${retentionDays} days retention. Next cleanup: ${nextCleanup ? nextCleanup.toLocaleString() : 'Not scheduled'}`);
        } else if (interval === 'weekly') {
            // Run cleanup weekly on Sunday at 2 AM
            this.cleanupInterval = setInterval(() => {
                const now = new Date();
                const isSunday = now.getDay() === 0;
                const twoAM = new Date(now);
                twoAM.setHours(2, 0, 0, 0);
                
                if (isSunday && now >= twoAM) {
                    this.performCleanup(retentionMs);
                }
            }, 24 * 60 * 60 * 1000); // Check daily
            
            const nextCleanup = this.getNextCleanupTime();
            // logger.info(`[ZoomCleanup] Scheduled weekly cleanup on Sundays at 2 AM with ${retentionDays} days retention. Next cleanup: ${nextCleanup ? nextCleanup.toLocaleString() : 'Not scheduled'}`);
        }

        // logger.info(`[ZoomCleanup] Started automatic cleanup with ${retentionDays} days retention, interval: ${interval}`);
    }

    /**
     * Stop the automatic cleanup process
     */
    stopCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
            logger.info('[ZoomCleanup] Stopped automatic cleanup');
        }
    }

    /**
     * Perform the actual cleanup operation
     * @param {number} retentionMs - Retention period in milliseconds
     */
    async performCleanup(retentionMs) {
        try {
            const cutoffDate = new Date(Date.now() - retentionMs);
            
            logger.info(`[ZoomCleanup] Starting cleanup for meetings older than ${cutoffDate.toISOString()}`);
            
            // Find appointments with Zoom meetings older than retention period
            const oldAppointments = await Appointment.find({
                'zoomMeeting.createdAt': { $lt: cutoffDate },
                'zoomMeeting.meetingId': { $exists: true }
            }).select('_id zoomMeeting startTime leadId coachId');

            if (oldAppointments.length === 0) {
                logger.info('[ZoomCleanup] No old Zoom meetings found to clean up');
                return;
            }

            logger.info(`[ZoomCleanup] Found ${oldAppointments.length} appointments with old Zoom meetings`);

            let cleanedCount = 0;
            let errorCount = 0;

            for (const appointment of oldAppointments) {
                try {
                    // Remove Zoom meeting data but keep the appointment
                    await Appointment.updateOne(
                        { _id: appointment._id },
                        { 
                            $unset: { 
                                'zoomMeeting.meetingId': 1,
                                'zoomMeeting.joinUrl': 1,
                                'zoomMeeting.startUrl': 1,
                                'zoomMeeting.password': 1,
                                'zoomMeeting.createdAt': 1
                            }
                        }
                    );

                    cleanedCount++;
                    logger.debug(`[ZoomCleanup] Cleaned Zoom data for appointment ${appointment._id}`);
                } catch (error) {
                    errorCount++;
                    logger.error(`[ZoomCleanup] Error cleaning appointment ${appointment._id}:`, error.message);
                }
            }

            logger.info(`[ZoomCleanup] Cleanup completed: ${cleanedCount} meetings cleaned, ${errorCount} errors`);

        } catch (error) {
            logger.error('[ZoomCleanup] Error during cleanup process:', error.message);
        }
    }

    /**
     * Manual cleanup for specific retention period
     * @param {number} retentionDays - Number of days to keep Zoom meeting data
     * @returns {Object} Cleanup results
     */
    async manualCleanup(retentionDays = this.defaultRetentionDays) {
        const retentionMs = retentionDays * 24 * 60 * 60 * 1000;
        
        logger.info(`[ZoomCleanup] Manual cleanup initiated for meetings older than ${retentionDays} days`);
        
        await this.performCleanup(retentionMs);
        
        return {
            success: true,
            message: `Manual cleanup completed for meetings older than ${retentionDays} days`,
            timestamp: new Date()
        };
    }

    /**
     * Temporarily disable automatic cleanup
     * @param {number} hours - Number of hours to disable (default: 24)
     */
    disableCleanup(hours = 24) {
        if (this.cleanupInterval) {
            this.stopCleanup();
            logger.info(`[ZoomCleanup] Automatic cleanup disabled for ${hours} hours`);
            
            // Re-enable after specified hours
            setTimeout(() => {
                this.startCleanup(this.defaultRetentionDays, 'daily');
                logger.info('[ZoomCleanup] Automatic cleanup re-enabled');
            }, hours * 60 * 60 * 1000);
        }
    }

    /**
     * Check if cleanup is currently disabled
     * @returns {boolean} True if cleanup is disabled
     */
    isDisabled() {
        return !this.cleanupInterval;
    }

    /**
     * Preview what would be cleaned up without actually doing it
     * @param {number} retentionDays - Number of days to check
     * @returns {Object} Preview of what would be cleaned up
     */
    async previewCleanup(retentionDays = this.defaultRetentionDays) {
        try {
            const retentionMs = retentionDays * 24 * 60 * 60 * 1000;
            const cutoffDate = new Date(Date.now() - retentionMs);
            
            logger.info(`[ZoomCleanup] Previewing cleanup for meetings older than ${cutoffDate.toISOString()}`);
            
            // Find appointments with Zoom meetings older than retention period
            const oldAppointments = await Appointment.find({
                'zoomMeeting.createdAt': { $lt: cutoffDate },
                'zoomMeeting.meetingId': { $exists: true }
            }).select('_id zoomMeeting startTime leadId coachId');

            if (oldAppointments.length === 0) {
                return {
                    wouldClean: 0,
                    cutoffDate: cutoffDate,
                    message: 'No old Zoom meetings found to clean up'
                };
            }

            return {
                wouldClean: oldAppointments.length,
                cutoffDate: cutoffDate,
                appointments: oldAppointments.map(apt => ({
                    id: apt._id,
                    startTime: apt.startTime,
                    leadId: apt.leadId,
                    coachId: apt.coachId,
                    meetingId: apt.zoomMeeting?.meetingId
                })),
                message: `Found ${oldAppointments.length} appointments with old Zoom meetings that would be cleaned up`
            };

        } catch (error) {
            logger.error('[ZoomCleanup] Error during cleanup preview:', error.message);
            throw error;
        }
    }

    /**
     * Get cleanup statistics
     * @returns {Object} Cleanup statistics
     */
    async getCleanupStats() {
        try {
            const now = new Date();
            const twoDaysAgo = new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000));
            const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
            const oneMonthAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

            const stats = {
                totalMeetings: await Appointment.countDocuments({ 'zoomMeeting.meetingId': { $exists: true } }),
                meetingsOlderThan2Days: await Appointment.countDocuments({ 'zoomMeeting.createdAt': { $lt: twoDaysAgo } }),
                meetingsOlderThan1Week: await Appointment.countDocuments({ 'zoomMeeting.createdAt': { $lt: oneWeekAgo } }),
                meetingsOlderThan1Month: await Appointment.countDocuments({ 'zoomMeeting.createdAt': { $lt: oneMonthAgo } }),
                lastCleanup: this.lastCleanupTime || null,
                isRunning: !!this.cleanupInterval,
                nextCleanup: this.getNextCleanupTime()
            };

            return stats;
        } catch (error) {
            logger.error('[ZoomCleanup] Error getting cleanup stats:', error.message);
            throw error;
        }
    }

    /**
     * Get the current status of the cleanup service
     * @returns {Object} Current status information
     */
    getStatus() {
        const nextCleanup = this.getNextCleanupTime();
        return {
            isRunning: !!this.cleanupInterval,
            retentionDays: this.defaultRetentionDays,
            nextCleanup: nextCleanup,
            nextCleanupFormatted: nextCleanup ? nextCleanup.toLocaleString() : 'Not scheduled',
            isActive: !!this.cleanupInterval
        };
    }

    /**
     * Get the next scheduled cleanup time
     * @returns {Date|null} Next cleanup time or null if not scheduled
     */
    getNextCleanupTime() {
        if (!this.cleanupInterval) {
            return null;
        }

        const now = new Date();
        const nextCleanup = new Date(now);
        nextCleanup.setHours(2, 0, 0, 0);
        
        // If it's already past 2 AM today, schedule for tomorrow
        if (now >= nextCleanup) {
            nextCleanup.setDate(nextCleanup.getDate() + 1);
        }
        
        return nextCleanup;
    }

    /**
     * Update retention period
     * @param {number} retentionDays - New retention period in days
     */
    updateRetentionPeriod(retentionDays) {
        if (retentionDays < 1) {
            throw new Error('Retention period must be at least 1 day');
        }
        
        this.defaultRetentionDays = retentionDays;
        logger.info(`[ZoomCleanup] Updated retention period to ${retentionDays} days`);
        
        // Restart cleanup with new retention period if running
        if (this.cleanupInterval) {
            this.stopCleanup();
            this.startCleanup(retentionDays);
        }
    }
}

// Create singleton instance
const zoomCleanupService = new ZoomCleanupService();

module.exports = zoomCleanupService;
