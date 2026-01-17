const express = require('express');
const router = express.Router();

// Import controllers
const unifiedMessagingController = require('../controllers/unifiedMessagingController');
const unifiedMessagingAdminController = require('../controllers/unifiedMessagingAdminController');
const whatsappCreditController = require('../controllers/whatsappCreditController');

// Import middleware
const { protect } = require('../middleware/auth');
const { verifyAdminToken, noLogActivity } = require('../middleware/adminAuth');
const { requirePermission } = require('../middleware/permissionMiddleware');

// ===== DEBUG ENDPOINTS =====

// @route   GET /api/messagingv1/debug/qr-setup/:deviceId
// @desc    Debug QR setup page
// @access  Public (for debugging)
router.get('/debug/qr-setup/:deviceId', 
    noLogActivity, 
    unifiedMessagingController.debugQRSetup
);

// ===== COACH WHATSAPP SETTINGS =====

// @route   GET /api/messagingv1/settings
// @desc    Get coach WhatsApp settings
// @access  Private (Coach)
router.get('/settings', 
    protect, 
    noLogActivity, 
    unifiedMessagingController.getCoachWhatsAppSettings
);

// @route   POST /api/messagingv1/settings
// @desc    Set coach WhatsApp settings
// @access  Private (Coach)
router.post('/settings', 
    protect, 
    unifiedMessagingController.setCoachWhatsAppSettings
);

// ===== UNIFIED MESSAGING =====

// @route   POST /api/messagingv1/send
// @desc    Send message via unified endpoint
// @access  Private (Coach)
router.post('/send', 
    protect, 
    unifiedMessagingController.sendMessage
);

// @route   GET /api/messagingv1/inbox
// @desc    Get inbox messages
// @access  Private (Coach)
router.get('/inbox', 
    protect, 
    noLogActivity, 
    unifiedMessagingController.getInboxMessages
);

// @route   GET /api/messagingv1/messages/:contact
// @desc    Get message history for a specific contact
// @access  Private (Coach)
router.get('/messages/:contact', 
    protect, 
    noLogActivity, 
    unifiedMessagingController.getMessageHistory
);

// @route   PUT /api/messagingv1/messages/mark-read
// @desc    Mark messages as read
// @access  Private (Coach)
router.put('/messages/mark-read', 
    protect, 
    unifiedMessagingController.markMessagesAsRead
);

// ===== MESSAGE TEMPLATES =====

// @route   GET /api/messagingv1/templates
// @desc    Get message templates
// @access  Private (Coach)
router.get('/templates', 
    protect, 
    noLogActivity, 
    unifiedMessagingController.getMessageTemplates
);

// @route   POST /api/messagingv1/templates
// @desc    Create message template
// @access  Private (Coach)
router.post('/templates', 
    protect, 
    unifiedMessagingController.createMessageTemplate
);

// @route   PUT /api/messagingv1/templates/:templateId
// @desc    Update message template
// @access  Private (Coach)
router.put('/templates/:templateId', 
    protect, 
    unifiedMessagingController.updateMessageTemplate
);

// @route   DELETE /api/messagingv1/templates/:templateId
// @desc    Delete message template
// @access  Private (Coach)
router.delete('/templates/:templateId', 
    protect, 
    unifiedMessagingController.deleteMessageTemplate
);

// ===== STAFF INTEGRATION =====

// @route   GET /api/messagingv1/staff/devices
// @desc    Get staff WhatsApp devices under coach
// @access  Private (Coach)
router.get('/staff/devices', 
    protect, 
    noLogActivity, 
    unifiedMessagingController.getStaffDevices
);

// ===== STATISTICS AND CONTACTS =====

// @route   GET /api/messagingv1/stats
// @desc    Get messaging statistics
// @access  Private (Coach)
router.get('/stats', 
    protect, 
    noLogActivity, 
    unifiedMessagingController.getMessagingStats
);

// @route   GET /api/messagingv1/contacts
// @desc    Get contacts
// @access  Private (Coach)
router.get('/contacts', 
    protect, 
    noLogActivity, 
    unifiedMessagingController.getContacts
);

// ===== WHATSAPP DEVICE MANAGEMENT =====

// @route   POST /api/messagingv1/devices
// @desc    Create a new WhatsApp device
// @access  Private (Coach)
router.post('/devices', 
    protect, 
    unifiedMessagingController.createWhatsAppDevice
);

// @route   GET /api/messagingv1/devices
// @desc    Get all WhatsApp devices for coach
// @access  Private (Coach)
router.get('/devices', 
    protect, 
    noLogActivity, 
    unifiedMessagingController.getCoachWhatsAppDevices
);

// @route   PUT /api/messagingv1/devices/:deviceId
// @desc    Update WhatsApp device
// @access  Private (Coach)
router.put('/devices/:deviceId', 
    protect, 
    unifiedMessagingController.updateWhatsAppDevice
);

// @route   DELETE /api/messagingv1/devices/:deviceId
// @desc    Delete WhatsApp device
// @access  Private (Coach)
router.delete('/devices/:deviceId', 
    protect, 
    unifiedMessagingController.deleteWhatsAppDevice
);

// @route   GET /api/messagingv1/devices/:deviceId/status
// @desc    Get device status
// @access  Private (Coach)
router.get('/devices/:deviceId/status', 
    protect, 
    noLogActivity, 
    unifiedMessagingController.getDeviceStatus
);

// @route   POST /api/messagingv1/devices/:deviceId/switch
// @desc    Switch WhatsApp device
// @access  Private (Coach)
router.post('/devices/:deviceId/switch', 
    protect, 
    unifiedMessagingController.switchWhatsAppDevice
);

// ===== BAILEYS WHATSAPP SETUP (TEMPORARILY DISABLED) =====
// Baileys routes are temporarily disabled while we focus on Central WhatsApp Meta API

/*
// @route   GET /api/messagingv1/baileys/qr/:deviceId
// @desc    Get QR code for Baileys WhatsApp setup
// @access  Public (No auth required for QR display)
router.get('/baileys/qr/:deviceId', 
    unifiedMessagingController.getBaileysQR
);
*/

// ===== BAILEYS ROUTES (TEMPORARILY DISABLED) =====
// Baileys routes are temporarily disabled while we focus on Central WhatsApp Meta API

/*
// @route   POST /api/messagingv1/baileys/connect/:deviceId
// @desc    Initialize Baileys connection
// @access  Private (Coach)
router.post('/baileys/connect/:deviceId', 
    protect, 
    unifiedMessagingController.initializeBaileysConnection
);

// @route   DELETE /api/messagingv1/baileys/disconnect/:deviceId
// @desc    Disconnect Baileys WhatsApp
// @access  Private (Coach)
router.delete('/baileys/disconnect/:deviceId', 
    protect, 
    unifiedMessagingController.disconnectBaileys
);

// @route   GET /api/messagingv1/baileys/status/:deviceId
// @desc    Get Baileys connection status
// @access  Private (Coach)
router.get('/baileys/status/:deviceId', 
    protect, 
    noLogActivity, 
    unifiedMessagingController.getBaileysStatus
);
*/

/*
// @route   POST /api/messagingv1/baileys/force-qr/:deviceId
// @desc    Force QR code generation
// @access  Private (Coach)
router.post('/baileys/force-qr/:deviceId', 
    protect, 
    noLogActivity, 
    unifiedMessagingController.forceQRGeneration
);
*/

// ===== ADMIN ROUTES =====

// @route   GET /api/messagingv1/admin/overview
// @desc    Get unified messaging system overview
// @access  Private (Admin)
router.get('/admin/overview', 
    verifyAdminToken, 
    requirePermission('systemSettings'), 
    noLogActivity, 
    unifiedMessagingAdminController.getSystemOverview
);

// @route   GET /api/messagingv1/admin/devices
// @desc    Get all WhatsApp devices across coaches
// @access  Private (Admin)
router.get('/admin/devices', 
    verifyAdminToken, 
    requirePermission('systemSettings'), 
    noLogActivity, 
    unifiedMessagingAdminController.getAllDevices
);

// @route   GET /api/messagingv1/admin/messages
// @desc    Get all messages across coaches
// @access  Private (Admin)
router.get('/admin/messages', 
    verifyAdminToken, 
    requirePermission('systemSettings'), 
    noLogActivity, 
    unifiedMessagingAdminController.getAllMessages
);

// @route   GET /api/messagingv1/admin/stats
// @desc    Get system-wide messaging statistics
// @access  Private (Admin)
router.get('/admin/stats', 
    verifyAdminToken, 
    requirePermission('systemSettings'), 
    noLogActivity, 
    unifiedMessagingAdminController.getSystemStats
);

// @route   GET /api/messagingv1/admin/coaches/:coachId/messages
// @desc    Get messages for specific coach
// @access  Private (Admin)
router.get('/admin/coaches/:coachId/messages', 
    verifyAdminToken, 
    requirePermission('systemSettings'), 
    noLogActivity, 
    unifiedMessagingAdminController.getCoachMessages
);

// @route   POST /api/messagingv1/admin/broadcast
// @desc    Send broadcast message to multiple coaches
// @access  Private (Admin)
router.post('/admin/broadcast', 
    verifyAdminToken, 
    requirePermission('systemSettings'), 
    unifiedMessagingAdminController.sendBroadcastMessage
);

// @route   PUT /api/messagingv1/admin/credit-rates
// @desc    Update credit rates for messaging
// @access  Private (Admin)
router.put('/admin/credit-rates', 
    verifyAdminToken, 
    requirePermission('systemSettings'), 
    unifiedMessagingAdminController.updateCreditRates
);

// @route   GET /api/messagingv1/admin/templates
// @desc    Get all templates across coaches
// @access  Private (Admin)
router.get('/admin/templates', 
    verifyAdminToken, 
    requirePermission('systemSettings'), 
    noLogActivity, 
    unifiedMessagingAdminController.getAllTemplates
);

// @route   POST /api/messagingv1/admin/templates
// @desc    Create global template
// @access  Private (Admin)
router.post('/admin/templates', 
    verifyAdminToken, 
    requirePermission('systemSettings'), 
    unifiedMessagingAdminController.createGlobalTemplate
);

// @route   PUT /api/messagingv1/admin/templates/:templateId
// @desc    Update global template
// @access  Private (Admin)
router.put('/admin/templates/:templateId', 
    verifyAdminToken, 
    requirePermission('systemSettings'), 
    unifiedMessagingAdminController.updateGlobalTemplate
);

// @route   DELETE /api/messagingv1/admin/templates/:templateId
// @desc    Delete global template
// @access  Private (Admin)
router.delete('/admin/templates/:templateId', 
    verifyAdminToken, 
    requirePermission('systemSettings'), 
    unifiedMessagingAdminController.deleteGlobalTemplate
);

// ===== CREDIT MANAGEMENT ENDPOINTS =====

// @route   GET /api/messagingv1/credits/balance
// @desc    Get coach's credit balance
// @access  Private (Coach)
router.get('/credits/balance', protect, whatsappCreditController.getCreditBalance);

// @route   GET /api/messagingv1/credits/check
// @desc    Check if user can send messages
// @access  Private (Coach)
router.get('/credits/check', protect, whatsappCreditController.checkCanSendMessage);

// @route   GET /api/messagingv1/credits/packages
// @desc    Get available credit packages
// @access  Public
router.get('/credits/packages', whatsappCreditController.getCreditPackages);

// @route   POST /api/messagingv1/credits/purchase
// @desc    Purchase credits
// @access  Private (Coach)
router.post('/credits/purchase', protect, whatsappCreditController.purchaseCredits);

// @route   GET /api/messagingv1/credits/transactions
// @desc    Get credit transactions
// @access  Private (Coach)
router.get('/credits/transactions', protect, whatsappCreditController.getCreditTransactions);

module.exports = router;
