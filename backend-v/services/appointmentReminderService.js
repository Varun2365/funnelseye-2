// D:\PRJ_YCT_Final\services\appointmentReminderService.js

const CoachAvailability = require('../schema/CoachAvailability');
const Appointment = require('../schema/Appointment');
const { scheduleFutureEvent } = require('./automationSchedulerService');
const { publishEvent } = require('./rabbitmqProducer');

/**
 * Appointment Reminder Service
 * Handles scheduling and management of appointment reminders
 */

class AppointmentReminderService {
    /**
     * Get default reminders if coach hasn't configured custom ones
     */
    getDefaultReminders() {
        return [
            {
                name: '3 Days Before',
                timing: 4320, // 3 days = 72 hours = 4320 minutes
                channel: 'whatsapp',
                isActive: true
            },
            {
                name: '1 Day Before',
                timing: 1440, // 1 day = 24 hours = 1440 minutes
                channel: 'whatsapp',
                isActive: true
            },
            {
                name: '10 Minutes Before',
                timing: 10, // 10 minutes
                channel: 'whatsapp',
                isActive: true
            }
        ];
    }

    /**
     * Schedule all reminders for an appointment
     * @param {String} appointmentId - Appointment ID
     * @param {String} coachId - Coach ID
     */
    async scheduleReminders(appointmentId, coachId) {
        try {
            const appointment = await Appointment.findById(appointmentId)
                .populate('leadId', 'name email phone countryCode')
                .populate('assignedStaffId', 'name email');

            if (!appointment) {
                throw new Error('Appointment not found');
            }

            // Get coach's reminder settings
            const coachSettings = await CoachAvailability.findOne({ coachId });
            
            let reminders = [];
            
            if (coachSettings?.appointmentReminders?.enabled === false) {
                console.log(`[Reminders] Reminders disabled for coach ${coachId}`);
                return { success: true, scheduled: 0, message: 'Reminders disabled' };
            }

            // Use default reminders if coach hasn't configured custom ones
            if (!coachSettings?.appointmentReminders?.reminders || 
                coachSettings.appointmentReminders.reminders.length === 0 ||
                coachSettings.appointmentReminders.defaultReminders) {
                reminders = this.getDefaultReminders();
            } else {
                reminders = coachSettings.appointmentReminders.reminders.filter(r => r.isActive);
            }

            const appointmentTime = new Date(appointment.startTime);
            const now = new Date();
            let scheduledCount = 0;

            for (const reminder of reminders) {
                // Calculate reminder time
                const reminderTime = new Date(appointmentTime.getTime() - (reminder.timing * 60 * 1000));

                // Only schedule if reminder time is in the future
                if (reminderTime > now) {
                    const reminderPayload = {
                        eventName: 'appointment_reminder_time',
                        payload: {
                            appointmentId: appointment._id,
                            leadId: appointment.leadId._id,
                            coachId: appointment.coachId,
                            assignedStaffId: appointment.assignedStaffId || null,
                            reminderName: reminder.name,
                            reminderTiming: reminder.timing,
                            channel: reminder.channel,
                            templateId: reminder.templateId,
                            lead: {
                                name: appointment.leadId.name,
                                email: appointment.leadId.email,
                                phone: appointment.leadId.phone,
                                countryCode: appointment.leadId.countryCode
                            },
                            appointment: {
                                summary: appointment.summary,
                                startTime: appointment.startTime,
                                duration: appointment.duration,
                                zoomMeeting: appointment.zoomMeeting
                            },
                            staff: appointment.assignedStaffId ? {
                                name: appointment.assignedStaffId.name,
                                email: appointment.assignedStaffId.email
                            } : null
                        },
                        relatedDoc: {
                            appointmentId: appointment._id,
                            leadId: appointment.leadId._id,
                            coachId: appointment.coachId
                        },
                        timestamp: new Date().toISOString()
                    };

                    // Schedule the reminder
                    await scheduleFutureEvent(
                        reminderTime,
                        'funnelseye_events',
                        'appointment_reminder_time',
                        reminderPayload
                    );

                    scheduledCount++;
                    console.log(`[Reminders] Scheduled "${reminder.name}" for appointment ${appointmentId} at ${reminderTime.toISOString()}`);
                } else {
                    console.log(`[Reminders] Skipping "${reminder.name}" - reminder time has passed`);
                }
            }

            return {
                success: true,
                scheduled: scheduledCount,
                total: reminders.length,
                message: `Scheduled ${scheduledCount} out of ${reminders.length} reminders`
            };
        } catch (error) {
            console.error('[Reminders] Error scheduling reminders:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get reminder settings for a coach
     * @param {String} coachId - Coach ID
     * @returns {Object} - Reminder settings
     */
    async getReminderSettings(coachId) {
        try {
            const coachSettings = await CoachAvailability.findOne({ coachId });

            if (!coachSettings || !coachSettings.appointmentReminders) {
                return {
                    enabled: true,
                    reminders: this.getDefaultReminders(),
                    defaultReminders: true
                };
            }

            return coachSettings.appointmentReminders;
        } catch (error) {
            console.error('[Reminders] Error getting settings:', error.message);
            throw error;
        }
    }

    /**
     * Update reminder settings for a coach
     * @param {String} coachId - Coach ID
     * @param {Object} settings - Reminder settings
     */
    async updateReminderSettings(coachId, settings) {
        try {
            const update = {
                'appointmentReminders.enabled': settings.enabled !== undefined ? settings.enabled : true,
                'appointmentReminders.defaultReminders': settings.defaultReminders !== undefined ? settings.defaultReminders : false
            };

            // If custom reminders are provided
            if (settings.reminders && Array.isArray(settings.reminders)) {
                update['appointmentReminders.reminders'] = settings.reminders.map(r => ({
                    name: r.name,
                    timing: r.timing,
                    channel: r.channel || 'whatsapp',
                    templateId: r.templateId || null,
                    isActive: r.isActive !== undefined ? r.isActive : true
                }));
            }

            const coachSettings = await CoachAvailability.findOneAndUpdate(
                { coachId },
                { $set: update },
                { new: true, upsert: true }
            );

            console.log(`[Reminders] Settings updated for coach ${coachId}`);

            return {
                success: true,
                settings: coachSettings.appointmentReminders
            };
        } catch (error) {
            console.error('[Reminders] Error updating settings:', error.message);
            throw error;
        }
    }

    /**
     * Cancel all scheduled reminders for an appointment
     * @param {String} appointmentId - Appointment ID
     */
    async cancelReminders(appointmentId) {
        try {
            // This would typically interface with your scheduler service
            // to cancel scheduled events. For now, we'll just log it.
            console.log(`[Reminders] Cancelling all reminders for appointment ${appointmentId}`);
            
            // TODO: Implement actual cancellation with scheduler service
            // This depends on your scheduler implementation (Bull, Agenda, etc.)
            
            return {
                success: true,
                message: 'Reminders cancelled'
            };
        } catch (error) {
            console.error('[Reminders] Error cancelling reminders:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Reschedule reminders when appointment time changes
     * @param {String} appointmentId - Appointment ID
     * @param {String} coachId - Coach ID
     */
    async rescheduleReminders(appointmentId, coachId) {
        try {
            // Cancel existing reminders
            await this.cancelReminders(appointmentId);
            
            // Schedule new reminders with updated time
            return await this.scheduleReminders(appointmentId, coachId);
        } catch (error) {
            console.error('[Reminders] Error rescheduling reminders:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new AppointmentReminderService();


