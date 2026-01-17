const SubscriptionPlan = require('../schema/SubscriptionPlan');
const CoachSubscription = require('../schema/CoachSubscription');

class SubscriptionService {
    constructor() {
        this.reminderIntervals = {
            sevenDays: 7,
            threeDays: 3,
            oneDay: 1,
            onExpiry: 0
        };
    }

    /**
     * Create a new subscription plan (Admin only)
     */
    async createPlan(planData, adminId) {
        try {
            const plan = new SubscriptionPlan({
                ...planData,
                createdBy: adminId
            });
            
            await plan.save();
            return { success: true, data: plan };
        } catch (error) {
            console.error('Error creating subscription plan:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get all active subscription plans
     */
    async getActivePlans() {
        try {
            const plans = await SubscriptionPlan.find({ isActive: true })
                .sort({ sortOrder: 1, 'price.amount': 1 });
            return { success: true, data: plans };
        } catch (error) {
            console.error('Error fetching active plans:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Subscribe a coach to a plan
     */
    async subscribeCoach(coachId, planId, paymentData = {}) {
        try {
            // Get the plan
            const plan = await SubscriptionPlan.findById(planId);
            if (!plan || !plan.isActive) {
                return { success: false, error: 'Invalid or inactive plan' };
            }

            // Check if coach already has a subscription
            const existingSubscription = await CoachSubscription.findOne({ coachId });
            if (existingSubscription) {
                return { success: false, error: 'Coach already has a subscription' };
            }

            // Calculate dates
            const now = new Date();
            const startDate = new Date(now);
            let endDate = new Date(now);
            
            switch (plan.price.billingCycle) {
                case 'monthly':
                    endDate.setMonth(endDate.getMonth() + 1);
                    break;
                case 'quarterly':
                    endDate.setMonth(endDate.getMonth() + 3);
                    break;
                case 'yearly':
                    endDate.setFullYear(endDate.getFullYear() + 1);
                    break;
            }

            // Create subscription
            const subscription = new CoachSubscription({
                coachId,
                planId,
                currentPeriod: {
                    startDate,
                    endDate
                },
                billing: {
                    amount: plan.price.amount,
                    currency: plan.price.currency,
                    billingCycle: plan.price.billingCycle,
                    nextBillingDate: endDate,
                    paymentStatus: paymentData.status || 'pending'
                },
                features: plan.features
            });

            await subscription.save();

            return { success: true, data: subscription };
        } catch (error) {
            console.error('Error subscribing coach:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Renew a coach's subscription
     */
    async renewSubscription(coachId, planId, paymentData = {}) {
        try {
            const subscription = await CoachSubscription.findOne({ coachId });
            if (!subscription) {
                return { success: false, error: 'No subscription found for this coach' };
            }

            const plan = await SubscriptionPlan.findById(planId);
            if (!plan || !plan.isActive) {
                return { success: false, error: 'Invalid or inactive plan' };
            }

            // Calculate new dates
            const now = new Date();
            const startDate = new Date(now);
            let endDate = new Date(now);
            
            switch (plan.price.billingCycle) {
                case 'monthly':
                    endDate.setMonth(endDate.getMonth() + 1);
                    break;
                case 'quarterly':
                    endDate.setMonth(endDate.getMonth() + 3);
                    break;
                case 'yearly':
                    endDate.setFullYear(endDate.getFullYear() + 1);
                    break;
            }

            // Update subscription
            subscription.planId = planId;
            subscription.status = 'active';
            subscription.currentPeriod = { startDate, endDate };
            subscription.billing.amount = plan.price.amount;
            subscription.billing.currency = plan.price.currency;
            subscription.billing.billingCycle = plan.price.billingCycle;
            subscription.billing.nextBillingDate = endDate;
            subscription.billing.paymentStatus = paymentData.status || 'paid';
            subscription.billing.lastPaymentDate = now;
            subscription.features = plan.features;
            subscription.accountStatus.isEnabled = true;
            subscription.accountStatus.reEnabledAt = now;

            // Reset reminder flags
            subscription.reminders.sevenDaysBefore.sent = false;
            subscription.reminders.threeDaysBefore.sent = false;
            subscription.reminders.oneDayBefore.sent = false;
            subscription.reminders.onExpiry.sent = false;

            await subscription.save();

            return { success: true, data: subscription };
        } catch (error) {
            console.error('Error renewing subscription:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Cancel a coach's subscription
     */
    async cancelSubscription(coachId, reason, cancelledBy) {
        try {
            const subscription = await CoachSubscription.findOne({ coachId });
            if (!subscription) {
                return { success: false, error: 'No subscription found for this coach' };
            }

            subscription.status = 'cancelled';
            subscription.cancellation = {
                cancelledAt: new Date(),
                cancelledBy,
                reason,
                effectiveDate: subscription.currentPeriod.endDate
            };

            await subscription.save();

            return { success: true, data: subscription };
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get coach's subscription details
     */
    async getCoachSubscription(coachId) {
        try {
            // Check only the CoachSubscription collection (single source of truth)
            const subscription = await CoachSubscription.findOne({ coachId })
                .populate('planId')
                .populate('coachId', 'name email company');
            
            if (!subscription) {
                return { success: false, error: 'No subscription found for this coach' };
            }

            return { success: true, data: subscription };
        } catch (error) {
            console.error('Error fetching coach subscription:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Check subscription status and send reminders
     */
    async checkAndSendReminders() {
        try {
            const now = new Date();
            const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
            const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
            const oneDayFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000));

            // Find subscriptions that need reminders
            const subscriptions = await CoachSubscription.find({
                status: 'active',
                'currentPeriod.endDate': { $lte: sevenDaysFromNow }
            }).populate('coachId', 'name email phone');

            for (const subscription of subscriptions) {
                const daysUntilExpiry = subscription.daysUntilExpiry;
                
                // 7 days before
                if (daysUntilExpiry === 7 && !subscription.reminders.sevenDaysBefore.sent) {
                    await this.sendReminder(subscription, 'sevenDays');
                }
                // 3 days before
                else if (daysUntilExpiry === 3 && !subscription.reminders.threeDaysBefore.sent) {
                    await this.sendReminder(subscription, 'threeDays');
                }
                // 1 day before
                else if (daysUntilExpiry === 1 && !subscription.reminders.oneDayBefore.sent) {
                    await this.sendReminder(subscription, 'oneDay');
                }
                // On expiry
                else if (daysUntilExpiry === 0 && !subscription.reminders.onExpiry.sent) {
                    await this.sendReminder(subscription, 'onExpiry');
                }
            }

            return { success: true, message: 'Reminder check completed' };
        } catch (error) {
            console.error('Error checking and sending reminders:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send reminder for subscription expiry
     */
    async sendReminder(subscription, reminderType) {
        try {
            const coach = subscription.coachId;
            const plan = await SubscriptionPlan.findById(subscription.planId);
            
            if (!coach || !plan) {
                console.error('Coach or plan not found for reminder');
                return;
            }

            const reminderData = {
                coachName: coach.name,
                planName: plan.name,
                expiryDate: subscription.currentPeriod.endDate,
                amount: subscription.billing.amount,
                currency: subscription.billing.currency,
                billingCycle: subscription.billing.billingCycle,
                renewalLink: `${process.env.FRONTEND_URL}/subscription/renew?coachId=${coach._id}&planId=${plan._id}`,
                daysLeft: subscription.daysUntilExpiry
            };

            // Send email reminder
            if (coach.email) {
                await this.sendEmailReminder(coach.email, reminderData, reminderType);
            }

            // Send WhatsApp reminder
            if (coach.phone) {
                await this.sendWhatsAppReminder(coach.phone, reminderData, reminderType);
            }

            // Update reminder status
            const updateData = {};
            updateData[`reminders.${reminderType}.sent`] = true;
            updateData[`reminders.${reminderType}.sentAt`] = new Date();
            
            if (coach.email) {
                updateData[`reminders.${reminderType}.emailSent`] = true;
            }
            if (coach.phone) {
                updateData[`reminders.${reminderType}.whatsappSent`] = true;
            }

            await CoachSubscription.findByIdAndUpdate(subscription._id, updateData);

            console.log(`Reminder sent for coach ${coach.name} - ${reminderType}`);
        } catch (error) {
            console.error('Error sending reminder:', error);
        }
    }

    /**
     * Send email reminder
     */
    async sendEmailReminder(email, reminderData, reminderType) {
        try {
            const subject = this.getReminderSubject(reminderType, reminderData);
            const html = this.getReminderEmailTemplate(reminderData, reminderType);
            
            // TODO: Implement email service when available
            // For now, just log the reminder
            console.log(`📧 [SubscriptionService] Email reminder would be sent to ${email}:`, {
                subject,
                reminderType,
                coachId: reminderData.coachId,
                html: html.substring(0, 200) + '...'
            });
            
            return { success: true, message: 'Email reminder logged (service not implemented yet)' };
        } catch (error) {
            console.error('Error sending email reminder:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send WhatsApp reminder
     */
    async sendWhatsAppReminder(phone, reminderData, reminderType) {
        try {
            const message = this.getReminderWhatsAppMessage(reminderData, reminderType);
            
            // TODO: Implement WhatsApp service when available
            // For now, just log the reminder
            console.log(`📱 [SubscriptionService] WhatsApp reminder would be sent to ${phone}:`, {
                message: message.substring(0, 100) + '...',
                reminderType,
                coachId: reminderData.coachId
            });
            
            return { success: true, message: 'WhatsApp reminder logged (service not implemented yet)' };
        } catch (error) {
            console.error('Error sending WhatsApp reminder:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get reminder subject based on type
     */
    getReminderSubject(reminderType, data) {
        switch (reminderType) {
            case 'sevenDays':
                return `⚠️ Your FunnelsEye subscription expires in 7 days`;
            case 'threeDays':
                return `🚨 Your FunnelsEye subscription expires in 3 days`;
            case 'oneDay':
                return `🔥 URGENT: Your FunnelsEye subscription expires tomorrow`;
            case 'onExpiry':
                return `❌ Your FunnelsEye subscription has expired`;
            default:
                return `Subscription Reminder`;
        }
    }

    /**
     * Get reminder email template
     */
    getReminderEmailTemplate(data, reminderType) {
        const daysText = data.daysLeft === 1 ? '1 day' : `${data.daysLeft} days`;
        
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #e74c3c;">Subscription Expiry Reminder</h2>
                <p>Dear ${data.coachName},</p>
                <p>Your <strong>${data.planName}</strong> subscription on FunnelsEye will expire in <strong>${daysText}</strong>.</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>Subscription Details:</h3>
                    <ul>
                        <li><strong>Plan:</strong> ${data.planName}</li>
                        <li><strong>Expiry Date:</strong> ${new Date(data.expiryDate).toLocaleDateString()}</li>
                        <li><strong>Amount:</strong> ${data.currency} ${data.amount}</li>
                        <li><strong>Billing Cycle:</strong> ${data.billingCycle}</li>
                    </ul>
                </div>
                
                <p>To continue using FunnelsEye without interruption, please renew your subscription now.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${data.renewalLink}" 
                       style="background: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        Renew Subscription Now
                    </a>
                </div>
                
                <p>If you have any questions, please contact our support team.</p>
                
                <p>Best regards,<br>The FunnelsEye Team</p>
            </div>
        `;
    }

    /**
     * Get reminder WhatsApp message
     */
    getReminderWhatsAppMessage(data, reminderType) {
        const daysText = data.daysLeft === 1 ? '1 day' : `${data.daysLeft} days`;
        
        return `⚠️ *Subscription Expiry Reminder*

Dear ${data.coachName},

Your *${data.planName}* subscription on FunnelsEye will expire in *${daysText}*.

*Subscription Details:*
• Plan: ${data.planName}
• Expiry Date: ${new Date(data.expiryDate).toLocaleDateString()}
• Amount: ${data.currency} ${data.amount}
• Billing Cycle: ${data.billingCycle}

To continue using FunnelsEye without interruption, please renew your subscription now.

Renew here: ${data.renewalLink}

If you have any questions, please contact our support team.

Best regards,
The FunnelsEye Team`;
    }

    /**
     * Disable expired subscriptions (run daily)
     */
    async disableExpiredSubscriptions() {
        try {
            const now = new Date();
            const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

            // Find subscriptions expired for more than 7 days
            const expiredSubscriptions = await CoachSubscription.find({
                status: 'expired',
                'currentPeriod.endDate': { $lte: sevenDaysAgo },
                'accountStatus.isEnabled': true
            });

            for (const subscription of expiredSubscriptions) {
                // Disable account
                subscription.accountStatus.isEnabled = false;
                subscription.accountStatus.disabledAt = now;
                subscription.accountStatus.disabledReason = 'Subscription expired for more than 7 days';
                subscription.status = 'suspended';

                await subscription.save();

                // Update user schema


                console.log(`Account disabled for coach ${subscription.coachId} due to expired subscription`);
            }

            return { success: true, disabledCount: expiredSubscriptions.length };
        } catch (error) {
            console.error('Error disabling expired subscriptions:', error);
            return { success: false, error: error.message };
        }
    }



    /**
     * Get subscription analytics for admin
     */
    async getSubscriptionAnalytics() {
        try {
            const totalSubscriptions = await CoachSubscription.countDocuments();
            const activeSubscriptions = await CoachSubscription.countDocuments({ status: 'active' });
            const expiredSubscriptions = await CoachSubscription.countDocuments({ status: 'expired' });
            const cancelledSubscriptions = await CoachSubscription.countDocuments({ status: 'cancelled' });
            const suspendedSubscriptions = await CoachSubscription.countDocuments({ status: 'suspended' });

            const expiringThisWeek = await CoachSubscription.countDocuments({
                status: 'active',
                'currentPeriod.endDate': {
                    $gte: new Date(),
                    $lte: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000))
                }
            });

            const totalRevenue = await CoachSubscription.aggregate([
                { $match: { status: 'active' } },
                { $group: { _id: null, total: { $sum: '$billing.amount' } } }
            ]);

            return {
                success: true,
                data: {
                    totalSubscriptions,
                    activeSubscriptions,
                    expiredSubscriptions,
                    cancelledSubscriptions,
                    suspendedSubscriptions,
                    expiringThisWeek,
                    totalRevenue: totalRevenue[0]?.total || 0
                }
            };
        } catch (error) {
            console.error('Error fetching subscription analytics:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new SubscriptionService();
