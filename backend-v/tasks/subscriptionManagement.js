const cron = require('node-cron');
const subscriptionService = require('../services/subscriptionService');
const logger = require('../utils/logger');

class SubscriptionManagementTask {
    constructor() {
        this.isRunning = false;
    }

    /**
     * Initialize the subscription management tasks
     */
    init() {
        try {
            // Daily task at 9:00 AM - Check subscriptions and send reminders
            cron.schedule('0 9 * * *', async () => {
                console.log('🕘 [Subscription Task] Starting daily subscription check...');
                await this.dailySubscriptionCheck();
            }, {
                scheduled: true,
                timezone: "UTC"
            });

            // Daily task at 11:00 PM - Disable expired subscriptions
            cron.schedule('0 23 * * *', async () => {
                console.log('🌙 [Subscription Task] Starting expired subscription cleanup...');
                await this.disableExpiredSubscriptions();
            }, {
                scheduled: true,
                timezone: "UTC"
            });

            // Every 6 hours - Check for urgent reminders (1 day before expiry)
            cron.schedule('0 */6 * * *', async () => {
                console.log('⏰ [Subscription Task] Checking for urgent reminders...');
                await this.checkUrgentReminders();
            }, {
                scheduled: true,
                timezone: "UTC"
            });

            console.log('✅ [Subscription Task] Subscription management tasks initialized successfully');
        } catch (error) {
            console.error('❌ [Subscription Task] Error initializing subscription tasks:', error);
        }
    }

    /**
     * Daily subscription check and reminder sending
     */
    async dailySubscriptionCheck() {
        if (this.isRunning) {
            console.log('⚠️ [Subscription Task] Daily check already running, skipping...');
            return;
        }

        this.isRunning = true;
        const startTime = Date.now();

        try {
            console.log('📧 [Subscription Task] Sending subscription reminders...');
            
            const reminderResult = await subscriptionService.checkAndSendReminders();
            
            if (reminderResult.success) {
                console.log('✅ [Subscription Task] Reminder check completed successfully');
            } else {
                console.error('❌ [Subscription Task] Error in reminder check:', reminderResult.error);
            }

            // Log performance metrics
            const duration = Date.now() - startTime;
            console.log(`⏱️ [Subscription Task] Daily check completed in ${duration}ms`);
            
        } catch (error) {
            console.error('❌ [Subscription Task] Error in daily subscription check:', error);
        } finally {
            this.isRunning = false;
        }
    }

    /**
     * Disable expired subscriptions
     */
    async disableExpiredSubscriptions() {
        if (this.isRunning) {
            console.log('⚠️ [Subscription Task] Expired subscription cleanup already running, skipping...');
            return;
        }

        this.isRunning = true;
        const startTime = Date.now();

        try {
            console.log('🚫 [Subscription Task] Disabling expired subscriptions...');
            
            const result = await subscriptionService.disableExpiredSubscriptions();
            
            if (result.success) {
                if (result.disabledCount > 0) {
                    console.log(`✅ [Subscription Task] Disabled ${result.disabledCount} expired subscriptions`);
                } else {
                    console.log('✅ [Subscription Task] No expired subscriptions to disable');
                }
            } else {
                console.error('❌ [Subscription Task] Error disabling expired subscriptions:', result.error);
            }

            // Log performance metrics
            const duration = Date.now() - startTime;
            console.log(`⏱️ [Subscription Task] Expired subscription cleanup completed in ${duration}ms`);
            
        } catch (error) {
            console.error('❌ [Subscription Task] Error in expired subscription cleanup:', error);
        } finally {
            this.isRunning = false;
        }
    }

    /**
     * Check for urgent reminders (1 day before expiry)
     */
    async checkUrgentReminders() {
        try {
            console.log('🚨 [Subscription Task] Checking for urgent reminders...');
            
            const result = await subscriptionService.checkAndSendReminders();
            
            if (result.success) {
                console.log('✅ [Subscription Task] Urgent reminder check completed');
            } else {
                console.error('❌ [Subscription Task] Error in urgent reminder check:', result.error);
            }
            
        } catch (error) {
            console.error('❌ [Subscription Task] Error in urgent reminder check:', error);
        }
    }

    /**
     * Manual trigger for testing purposes
     */
    async manualTrigger(type = 'daily') {
        console.log(`🔧 [Subscription Task] Manual trigger for ${type} check`);
        
        switch (type) {
            case 'daily':
                await this.dailySubscriptionCheck();
                break;
            case 'expired':
                await this.disableExpiredSubscriptions();
                break;
            case 'urgent':
                await this.checkUrgentReminders();
                break;
            default:
                console.log('❌ [Subscription Task] Invalid trigger type. Use: daily, expired, or urgent');
        }
    }

    /**
     * Get task status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            tasks: {
                daily: '0 9 * * * (9:00 AM UTC)',
                expired: '0 23 * * * (11:00 PM UTC)',
                urgent: '0 */6 * * * (Every 6 hours)'
            },
            timezone: 'UTC'
        };
    }
}

// Create singleton instance
const subscriptionManagementTask = new SubscriptionManagementTask();

module.exports = subscriptionManagementTask;
