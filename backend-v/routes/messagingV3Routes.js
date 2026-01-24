const express = require('express');
const router = express.Router();

// Import services
const centralWhatsAppService = require('../services/centralWhatsAppService');

// Import controllers
const centralMessagingController = require('../controllers/centralMessagingController');
const centralMessagingTemplateController = require('../controllers/centralMessagingTemplateController');
const centralWhatsAppController = require('../controllers/centralWhatsAppController');
const whatsappInboxController = require('../controllers/whatsappInboxController');
const whatsappAIKnowledgeController = require('../controllers/whatsappAIKnowledgeController');
const whatsappWebhookController = require('../controllers/whatsappWebhookController');
const whatsappCoachSettingsController = require('../controllers/whatsappCoachSettingsController');
const whatsappAdminSettingsController = require('../controllers/whatsappAdminSettingsController');
const messagingController = require('../controllers/messagingController');
const templateController = require('../controllers/templateController');
const contactController = require('../controllers/contactController');
const inboxController = require('../controllers/inboxController');
const unifiedMessagingController = require('../controllers/unifiedMessagingController');
const unifiedMessagingAdminController = require('../controllers/unifiedMessagingAdminController');
const whatsappCreditController = require('../controllers/whatsappCreditController');
const emailConfigController = require('../controllers/emailConfigController');
const messageTemplateController = require('../controllers/messageTemplateController');
const messagingV3Controller = require('../controllers/messagingV3Controller');
const messagingV3Worker = require('../workers/messagingV3Worker');

// Import middleware
const { protect, authorizeCoach, authorizeStaff } = require('../middleware/auth');
const { verifyAdminToken, noLogActivity } = require('../middleware/adminAuth');
const { requirePermission } = require('../middleware/permissionMiddleware');

/**
 * Messaging API v3 Routes
 * Base: /api/messaging/v3/
 *
 * Enhanced unified messaging system for WhatsApp and Email
 * Supports: Coach, Staff, Admin
 * Features: Multi-channel, Credits, Templates, High-throughput messaging
 * Channels: Meta WhatsApp, Bailey's WhatsApp, Email
 */

// ===== ADMIN SETTINGS =====

// @route   GET /api/messaging/v3/admin/settings
// @desc    Get all admin messaging settings
// @access  Private (Admin)
router.get('/admin/settings',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    messagingV3Controller.getAdminSettings
);

// @route   PUT /api/messaging/v3/admin/settings
// @desc    Update admin messaging settings
// @access  Private (Admin)
router.put('/admin/settings',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    messagingV3Controller.updateAdminSettings
);

// @route   PUT /api/messaging/v3/admin/credit-rates
// @desc    Update central credit rates for all channels
// @access  Private (Admin)
router.put('/admin/credit-rates',
    verifyAdminToken,
    requirePermission('systemSettings'),
    messagingV3Controller.updateCreditRates
);

// @route   GET /api/messaging/v3/admin/credit-rates
// @desc    Get current credit rates
// @access  Private (Admin)
router.get('/admin/credit-rates',
    verifyAdminToken,
    requirePermission('systemSettings'),
    messagingV3Controller.getCreditRates
);

// ===== COACH SETTINGS =====

// @route   GET /api/messaging/v3/coach/settings
// @desc    Get coach messaging settings
// @access  Private (Coach)
router.get('/coach/settings',
    protect,
    authorizeCoach('coach'),
    messagingV3Controller.getCoachSettings
);

// @route   PUT /api/messaging/v3/coach/settings
// @desc    Update coach messaging settings
// @access  Private (Coach)
router.put('/coach/settings',
    protect,
    authorizeCoach('coach'),
    messagingV3Controller.updateCoachSettings
);

// ===== MESSAGING CHANNELS =====

// @route   POST /api/messaging/v3/channels
// @desc    Create new messaging channel
// @access  Private (Admin)
router.post('/channels',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    messagingV3Controller.createChannel
);

// @route   GET /api/messaging/v3/channels
// @desc    Get available messaging channels for user
// @access  Private (Coach/Admin)
router.get('/channels',
    protect,
    messagingV3Controller.getAvailableChannels
);

// @route   POST /api/messaging/v3/channels/test
// @desc    Test messaging channel
// @access  Private (Coach/Admin)
router.post('/channels/test',
    protect,
    messagingV3Controller.testChannel
);

// ===== TEMPLATE MANAGEMENT =====

// @route   GET /api/messaging/v3/templates
// @desc    Get available templates for user
// @access  Private (Coach/Admin)
router.get('/templates',
    protect,
    messagingV3Controller.getTemplates
);

// @route   POST /api/messaging/v3/templates/sync-meta
// @desc    Sync templates from Meta WhatsApp
// @access  Private (Admin)
router.post('/templates/sync-meta',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    messagingV3Controller.syncMetaTemplates
);

// ===== MESSAGE SENDING =====

// @route   POST /api/messaging/v3/send
// @desc    Send single message via worker
// @access  Private (Coach/Admin)
// Request Body:
// {
//   "channelCategory": "meta_whatsapp|baileys_whatsapp|email",
//   "channelId": "optional_specific_channel_id",
//   "to": "+1234567890 or email@domain.com",
//   "useTemplate": false,
//   "templateId": "optional_template_id",
//   "templateParams": {"key": "value"},
//   "message": "Direct message text",
//   "mediaUrl": "optional_media_url",
//   "mediaType": "image|video|document",
//   "priority": "normal|high|low",
//   "scheduledAt": "optional_ISO_date"
// }
router.post('/send',
    protect,
    messagingV3Controller.sendMessage
);

// @route   POST /api/messaging/v3/send-bulk
// @desc    Send bulk messages via worker queue
// @access  Private (Coach/Admin)
// Request Body:
// {
//   "channelCategory": "meta_whatsapp|baileys_whatsapp|email",
//   "recipients": [
//     {
//       "to": "+1234567890",
//       "templateParams": {"name": "John"},
//       "customData": {}
//     }
//   ],
//   "useTemplate": true,
//   "templateId": "template_id",
//   "message": "fallback_message",
//   "mediaUrl": "optional",
//   "mediaType": "image",
//   "delayMs": 1000,
//   "batchSize": 10
// }
router.post('/send-bulk',
    protect,
    messagingV3Controller.sendBulkMessages
);

// ===== MESSAGE STATUS & TRACKING =====

// @route   GET /api/messaging/v3/messages/:messageId/status
// @desc    Get message delivery status
// @access  Private (Coach/Admin)
router.get('/messages/:messageId/status',
    protect,
    messagingV3Controller.getMessageStatus
);

// @route   GET /api/messaging/v3/messages
// @desc    Get user's sent messages
// @access  Private (Coach/Admin)
router.get('/messages',
    protect,
    messagingV3Controller.getMessages
);

// ===== ANALYTICS =====

// @route   GET /api/messaging/v3/analytics
// @desc    Get messaging analytics
// @access  Private (Coach/Admin)
router.get('/analytics',
    protect,
    messagingV3Controller.getAnalytics
);

// ===== CREDITS MANAGEMENT =====

// @route   GET /api/messaging/v3/credits/balance
// @desc    Get user's credit balance
// @access  Private (Coach)
router.get('/credits/balance',
    protect,
    messagingV3Controller.getCreditBalance
);

// @route   GET /api/messaging/v3/credits/check
// @desc    Check if user can send messages
// @access  Private (Coach)
router.get('/credits/check',
    protect,
    messagingV3Controller.checkCanSend
);

// @route   POST /api/messaging/v3/credits/purchase
// @desc    Purchase credits
// @access  Private (Coach)
router.post('/credits/purchase',
    protect,
    messagingV3Controller.purchaseCredits
);

// ===== CONTACTS & INBOX =====

// @route   GET /api/messaging/v3/contacts
// @desc    Get messaging contacts
// @access  Private (Coach/Admin)
router.get('/contacts',
    protect,
    messagingV3Controller.getContacts
);

// @route   GET /api/messaging/v3/inbox
// @desc    Get unified inbox
// @access  Private (Coach/Admin)
router.get('/inbox',
    protect,
    messagingV3Controller.getInbox
);

// ===== WORKER MANAGEMENT (Admin Only) =====

// @route   GET /api/messaging/v3/admin/worker/status
// @desc    Get messaging worker status
// @access  Private (Admin)
router.get('/admin/worker/status',
    verifyAdminToken,
    requirePermission('systemSettings'),
    messagingV3Controller.getWorkerStatus
);

// @route   POST /api/messaging/v3/admin/worker/restart
// @desc    Restart messaging worker
// @access  Private (Admin)
router.post('/admin/worker/restart',
    verifyAdminToken,
    requirePermission('systemSettings'),
    messagingV3Controller.restartWorker
);

// @route   GET /api/messaging/v3/admin/queue/stats
// @desc    Get message queue statistics
// @access  Private (Admin)
router.get('/admin/queue/stats',
    verifyAdminToken,
    requirePermission('systemSettings'),
    messagingV3Controller.getQueueStats
);

// ===== SYSTEM HEALTH =====

// @route   GET /api/messaging/v3/health
// @desc    Get messaging system health
// @access  Private (Admin)
router.get('/health',
    verifyAdminToken,
    requirePermission('systemSettings'),
    messagingV3Controller.getHealthStatus
);

module.exports = router;