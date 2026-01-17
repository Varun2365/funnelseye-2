const express = require('express');
const router = express.Router();
const mobileNotificationService = require('../services/mobileNotificationService');
const { protect } = require('../middleware/auth');

// Apply authentication to all routes
router.use(protect);

// Get mobile settings
router.get('/settings', async (req, res) => {
  try {
    // In a real implementation, this would fetch from database
    // For now, return default settings
    const settings = {
      appNotifications: {
        enabled: true,
        sound: true,
        vibration: true,
        showPreview: true
      },
      notificationTypes: {
        sequence_started: { enabled: true, priority: 'normal' },
        message_sent: { enabled: true, priority: 'low' },
        reply_received: { enabled: true, priority: 'high' },
        ai_decision: { enabled: true, priority: 'normal' },
        error: { enabled: true, priority: 'high' },
        completed: { enabled: false, priority: 'low' }
      },
      channels: {
        push: {
          enabled: true,
          deviceTokens: []
        },
        sms: {
          enabled: false,
          phoneNumber: '',
          provider: 'twilio'
        },
        whatsapp: {
          enabled: true,
          phoneNumber: '',
          businessAccount: ''
        },
        email: {
          enabled: true,
          address: '',
          smtpSettings: {}
        }
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
        timezone: 'UTC'
      },
      emergency: {
        enabled: true,
        criticalErrors: true,
        systemDown: true,
        highPriorityReplies: true
      }
    };

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching mobile settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mobile settings'
    });
  }
});

// Update mobile settings
router.put('/settings', async (req, res) => {
  try {
    const settings = req.body;

    // In a real implementation, this would save to database
    // For now, just acknowledge the update

    res.json({
      success: true,
      message: 'Mobile settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error updating mobile settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update mobile settings'
    });
  }
});

// Send test notification
router.post('/test-notification', async (req, res) => {
  try {
    const { type } = req.body;

    // Create test notification data
    const testNotificationData = {
      title: `Test ${type.toUpperCase()} Notification`,
      message: `This is a test ${type} notification from FunnelEye Automation.`,
      type: 'test',
      timestamp: new Date().toISOString()
    };

    // Get user's notification preferences (mock for now)
    const preferences = {
      pushNotifications: true,
      sms: false,
      whatsapp: true,
      email: true,
      deviceTokens: ['test_device_token'],
      phoneNumber: '+1234567890',
      emailAddress: 'user@example.com'
    };

    // Send test notification
    const result = await mobileNotificationService.sendNotification(req.user.id, testNotificationData);

    res.json({
      success: true,
      message: 'Test notification sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification'
    });
  }
});

// Register device token
router.post('/register-device', async (req, res) => {
  try {
    const { deviceToken, platform } = req.body;

    // In a real implementation, this would save the device token to user's profile
    console.log(`Registering device token for user ${req.user.id}:`, { deviceToken, platform });

    res.json({
      success: true,
      message: 'Device registered successfully'
    });
  } catch (error) {
    console.error('Error registering device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register device'
    });
  }
});

// Unregister device token
router.post('/unregister-device', async (req, res) => {
  try {
    const { deviceToken } = req.body;

    // In a real implementation, this would remove the device token from user's profile
    console.log(`Unregistering device token for user ${req.user.id}:`, deviceToken);

    res.json({
      success: true,
      message: 'Device unregistered successfully'
    });
  } catch (error) {
    console.error('Error unregistering device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unregister device'
    });
  }
});

// Get notification history
router.get('/notifications', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    // In a real implementation, this would fetch notification history from database
    // For now, return mock data
    const notifications = [
      {
        id: 'notif_1',
        type: 'sequence_started',
        title: 'Automation Started',
        message: 'New sequence "Welcome Series" started for John Doe',
        sentAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        status: 'delivered',
        channel: 'push'
      },
      {
        id: 'notif_2',
        type: 'reply_received',
        title: 'Reply Received',
        message: 'New reply from Jane Smith: "I\'m interested in the premium plan"',
        sentAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        status: 'delivered',
        channel: 'push'
      }
    ];

    res.json({
      success: true,
      data: notifications.slice(offset, offset + limit),
      total: notifications.length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    // In a real implementation, this would mark the notification as read in database
    console.log(`Marking notification ${id} as read for user ${req.user.id}`);

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

// Bulk mark notifications as read
router.put('/notifications/read-all', async (req, res) => {
  try {
    // In a real implementation, this would mark all notifications as read for the user
    console.log(`Marking all notifications as read for user ${req.user.id}`);

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read'
    });
  }
});

module.exports = router;
