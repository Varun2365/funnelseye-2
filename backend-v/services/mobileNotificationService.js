const axios = require('axios');

class MobileNotificationService {
  constructor() {
    this.fcmServerKey = process.env.FCM_SERVER_KEY;
    this.fcmUrl = 'https://fcm.googleapis.com/fcm/send';
  }

  // Send push notification to mobile device
  async sendPushNotification(deviceToken, notificationData) {
    try {
      if (!this.fcmServerKey) {
        console.warn('FCM server key not configured, skipping push notification');
        return;
      }

      const payload = {
        to: deviceToken,
        notification: {
          title: notificationData.title,
          body: notificationData.message,
          icon: 'ic_launcher',
          sound: 'default'
        },
        data: {
          type: notificationData.type,
          runId: notificationData.runId,
          leadId: notificationData.leadId,
          timestamp: new Date().toISOString()
        }
      };

      const response = await axios.post(this.fcmUrl, payload, {
        headers: {
          'Authorization': `key=${this.fcmServerKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Push notification sent:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  // Send SMS notification
  async sendSMS(phoneNumber, message) {
    try {
      // Implementation would integrate with SMS service (Twilio, AWS SNS, etc.)
      console.log(`Sending SMS to ${phoneNumber}: ${message}`);

      // Mock SMS sending for development
      return {
        success: true,
        messageId: `sms_${Date.now()}`,
        status: 'sent'
      };
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }

  // Send WhatsApp notification
  async sendWhatsApp(phoneNumber, message) {
    try {
      // Implementation would integrate with WhatsApp Business API
      console.log(`Sending WhatsApp to ${phoneNumber}: ${message}`);

      // Mock WhatsApp sending for development
      return {
        success: true,
        messageId: `wa_${Date.now()}`,
        status: 'sent'
      };
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      throw error;
    }
  }

  // Send email notification
  async sendEmail(email, subject, message) {
    try {
      // Implementation would integrate with email service
      console.log(`Sending email to ${email}: ${subject} - ${message}`);

      // Mock email sending for development
      return {
        success: true,
        messageId: `email_${Date.now()}`,
        status: 'sent'
      };
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  // Create notification based on type and user preferences
  async sendNotification(coachId, notificationData) {
    try {
      // Get coach's notification preferences
      const preferences = await this.getCoachNotificationPreferences(coachId);

      const results = [];

      // Send based on preferences
      if (preferences.pushNotifications && preferences.deviceTokens.length > 0) {
        for (const token of preferences.deviceTokens) {
          try {
            const result = await this.sendPushNotification(token, notificationData);
            results.push({ type: 'push', status: 'sent', result });
          } catch (error) {
            results.push({ type: 'push', status: 'failed', error: error.message });
          }
        }
      }

      if (preferences.sms && preferences.phoneNumber) {
        try {
          const result = await this.sendSMS(preferences.phoneNumber, notificationData.message);
          results.push({ type: 'sms', status: 'sent', result });
        } catch (error) {
          results.push({ type: 'sms', status: 'failed', error: error.message });
        }
      }

      if (preferences.whatsapp && preferences.phoneNumber) {
        try {
          const result = await this.sendWhatsApp(preferences.phoneNumber, notificationData.message);
          results.push({ type: 'whatsapp', status: 'sent', result });
        } catch (error) {
          results.push({ type: 'whatsapp', status: 'failed', error: error.message });
        }
      }

      if (preferences.email && preferences.emailAddress) {
        try {
          const result = await this.sendEmail(
            preferences.emailAddress,
            notificationData.title || 'FunnelEye Notification',
            notificationData.message
          );
          results.push({ type: 'email', status: 'sent', result });
        } catch (error) {
          results.push({ type: 'email', status: 'failed', error: error.message });
        }
      }

      return {
        success: true,
        results
      };
    } catch (error) {
      console.error('Error sending notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get coach notification preferences
  async getCoachNotificationPreferences(coachId) {
    // In a real implementation, this would fetch from database
    // For now, return default preferences
    return {
      pushNotifications: true,
      sms: false,
      whatsapp: true,
      email: true,
      deviceTokens: [], // Would be populated from user's devices
      phoneNumber: null, // Would be from user's profile
      emailAddress: null // Would be from user's profile
    };
  }

  // Create notification payload for different types
  createNotificationPayload(type, data) {
    const basePayload = {
      timestamp: new Date().toISOString(),
      ...data
    };

    switch (type) {
      case 'sequence_started':
        return {
          title: 'Automation Started',
          message: `New sequence started for lead ${data.leadName || data.leadId}`,
          ...basePayload
        };

      case 'message_sent':
        return {
          title: 'Message Sent',
          message: `Message sent via ${data.channel} in sequence`,
          ...basePayload
        };

      case 'reply_received':
        return {
          title: 'Reply Received',
          message: `New reply from lead: "${data.preview || 'Check details'}"`,
          ...basePayload
        };

      case 'ai_decision':
        return {
          title: 'AI Decision Made',
          message: `AI decided: ${data.decision} (${Math.round(data.confidence * 100)}% confidence)`,
          ...basePayload
        };

      case 'error':
        return {
          title: 'Automation Error',
          message: `Error in automation: ${data.error}`,
          ...basePayload
        };

      case 'completed':
        return {
          title: 'Sequence Completed',
          message: `Automation sequence completed successfully`,
          ...basePayload
        };

      default:
        return {
          title: 'FunnelEye Notification',
          message: data.message || 'You have a new notification',
          ...basePayload
        };
    }
  }

  // Batch send notifications
  async sendBatchNotifications(notifications) {
    const results = [];

    for (const notification of notifications) {
      try {
        const result = await this.sendNotification(notification.coachId, notification.data);
        results.push({
          notificationId: notification.id,
          success: result.success,
          results: result.results
        });
      } catch (error) {
        results.push({
          notificationId: notification.id,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  // Schedule delayed notification
  async scheduleNotification(coachId, notificationData, delayMinutes) {
    const scheduledTime = new Date();
    scheduledTime.setMinutes(scheduledTime.getMinutes() + delayMinutes);

    // In a real implementation, this would use a job queue like Bull or Agenda
    console.log(`Notification scheduled for ${scheduledTime.toISOString()}:`, notificationData);

    // Mock implementation - just send immediately for now
    setTimeout(async () => {
      await this.sendNotification(coachId, notificationData);
    }, delayMinutes * 60 * 1000);
  }
}

module.exports = new MobileNotificationService();
