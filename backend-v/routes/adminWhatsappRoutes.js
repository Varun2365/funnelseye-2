const express = require('express');
const router = express.Router();
const adminWhatsappController = require('../controllers/adminWhatsappController');
const { verifyAdminToken, checkAdminPermission, adminRateLimit, logAdminActivity } = require('../middleware/adminAuth');

// Create a no-op middleware for skipping audit logging
const noLogActivity = (req, res, next) => {
    console.log('🔐 [WHATSAPP_ROUTE] Skipping audit logging for performance');
    next();
};

// ===== ADMIN WHATSAPP MANAGEMENT ROUTES =====

// @route   GET /api/admin/whatsapp/overview
// @desc    Get WhatsApp system overview
// @access  Private (Admin)
router.get('/overview', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    noLogActivity, 
    adminWhatsappController.getWhatsappOverview
);

// @route   GET /api/admin/whatsapp/devices
// @desc    Get all WhatsApp devices across coaches
// @access  Private (Admin)
router.get('/devices', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    noLogActivity, 
    adminWhatsappController.getAllDevices
);

// @route   GET /api/admin/whatsapp/devices/:deviceId
// @desc    Get specific device details
// @access  Private (Admin)
router.get('/devices/:deviceId', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    noLogActivity, 
    adminWhatsappController.getDeviceDetails
);

// @route   PUT /api/admin/whatsapp/devices/:deviceId/status
// @desc    Update device status (activate/deactivate)
// @access  Private (Admin)
router.put('/devices/:deviceId/status', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    adminRateLimit(10, 5 * 60 * 1000), // 10 requests per 5 minutes
    noLogActivity, 
    adminWhatsappController.updateDeviceStatus
);

// @route   GET /api/admin/whatsapp/messages
// @desc    Get message history across all coaches
// @access  Private (Admin)
router.get('/messages', 
    verifyAdminToken, 
    checkAdminPermission('viewAnalytics'), 
    noLogActivity, 
    adminWhatsappController.getMessageHistory
);

// @route   GET /api/admin/whatsapp/messages/stats
// @desc    Get messaging statistics
// @access  Private (Admin)
router.get('/messages/stats', 
    verifyAdminToken, 
    checkAdminPermission('viewAnalytics'), 
    noLogActivity, 
    adminWhatsappController.getMessageStats
);

// @route   GET /api/admin/whatsapp/conversations
// @desc    Get conversation history
// @access  Private (Admin)
router.get('/conversations', 
    verifyAdminToken, 
    checkAdminPermission('viewAnalytics'), 
    noLogActivity, 
    adminWhatsappController.getConversationHistory
);

// @route   GET /api/admin/whatsapp/templates
// @desc    Get all WhatsApp templates
// @access  Private (Admin)
router.get('/templates', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    noLogActivity, 
    adminWhatsappController.getAllTemplates
);

// @route   POST /api/admin/whatsapp/templates
// @desc    Create new WhatsApp template
// @access  Private (Admin)
router.post('/templates', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    adminRateLimit(5, 5 * 60 * 1000), // 5 requests per 5 minutes
    noLogActivity, 
    adminWhatsappController.createTemplate
);

// @route   PUT /api/admin/whatsapp/templates/:templateId
// @desc    Update WhatsApp template
// @access  Private (Admin)
router.put('/templates/:templateId', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    adminRateLimit(5, 5 * 60 * 1000), // 5 requests per 5 minutes
    noLogActivity, 
    adminWhatsappController.updateTemplate
);

// @route   DELETE /api/admin/whatsapp/templates/:templateId
// @desc    Delete WhatsApp template
// @access  Private (Admin)
router.delete('/templates/:templateId', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    adminRateLimit(5, 5 * 60 * 1000), // 5 requests per 5 minutes
    noLogActivity, 
    adminWhatsappController.deleteTemplate
);

// @route   GET /api/admin/whatsapp/coaches/:coachId/messages
// @desc    Get messages for specific coach
// @access  Private (Admin)
router.get('/coaches/:coachId/messages', 
    verifyAdminToken, 
    checkAdminPermission('viewAnalytics'), 
    noLogActivity, 
    adminWhatsappController.getCoachMessages
);

// @route   GET /api/admin/whatsapp/coaches/:coachId/devices
// @desc    Get devices for specific coach
// @access  Private (Admin)
router.get('/coaches/:coachId/devices', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    noLogActivity, 
    adminWhatsappController.getCoachDevices
);

// @route   POST /api/admin/whatsapp/send-broadcast
// @desc    Send broadcast message to multiple recipients
// @access  Private (Admin)
router.post('/send-broadcast', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    adminRateLimit(3, 10 * 60 * 1000), // 3 requests per 10 minutes
    noLogActivity, 
    adminWhatsappController.sendBroadcastMessage
);

// @route   GET /api/admin/whatsapp/usage-stats
// @desc    Get usage statistics by coach
// @access  Private (Admin)
router.get('/usage-stats', 
    verifyAdminToken, 
    checkAdminPermission('viewAnalytics'), 
    noLogActivity, 
    adminWhatsappController.getUsageStats
);

// @route   GET /api/admin/whatsapp/health
// @desc    Check WhatsApp service health
// @access  Private (Admin)
router.get('/health', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    noLogActivity, 
    adminWhatsappController.getServiceHealth
);

module.exports = router;
