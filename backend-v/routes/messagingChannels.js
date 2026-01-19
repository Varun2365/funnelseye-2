const express = require('express');
const router = express.Router();

// Import controller
const messagingChannelController = require('../controllers/messagingChannelController');

// Import middleware
const { verifyAdminToken, noLogActivity } = require('../middleware/adminAuth');
const { requirePermission } = require('../middleware/permissionMiddleware');

/**
 * Messaging Channels API Routes
 * Base: /api/messaging-channels/
 * Access: Admin only
 */

// @route   GET /api/messaging-channels
// @desc    Get all messaging channels with pagination and filtering
// @access  Private (Admin)
router.get('/',
    verifyAdminToken,
    requirePermission('systemSettings'),
    noLogActivity,
    messagingChannelController.getMessagingChannels
);

// @route   GET /api/messaging-channels/active/:type
// @desc    Get active channels by type
// @access  Private (Admin)
router.get('/active/:type',
    verifyAdminToken,
    requirePermission('systemSettings'),
    noLogActivity,
    messagingChannelController.getActiveChannelsByType
);

// @route   GET /api/messaging-channels/default/:type
// @desc    Get default channel for type
// @access  Private (Admin)
router.get('/default/:type',
    verifyAdminToken,
    requirePermission('systemSettings'),
    noLogActivity,
    messagingChannelController.getDefaultChannel
);

// @route   GET /api/messaging-channels/:id
// @desc    Get single messaging channel
// @access  Private (Admin)
router.get('/:id',
    verifyAdminToken,
    requirePermission('systemSettings'),
    noLogActivity,
    messagingChannelController.getMessagingChannel
);

// @route   POST /api/messaging-channels
// @desc    Create new messaging channel
// @access  Private (Admin)
router.post('/',
    verifyAdminToken,
    requirePermission('systemSettings'),
    messagingChannelController.createMessagingChannel
);

// @route   PUT /api/messaging-channels/:id
// @desc    Update messaging channel
// @access  Private (Admin)
router.put('/:id',
    verifyAdminToken,
    requirePermission('systemSettings'),
    messagingChannelController.updateMessagingChannel
);

// @route   DELETE /api/messaging-channels/:id
// @desc    Delete messaging channel
// @access  Private (Admin)
router.delete('/:id',
    verifyAdminToken,
    requirePermission('systemSettings'),
    messagingChannelController.deleteMessagingChannel
);

// @route   POST /api/messaging-channels/:id/test
// @desc    Test messaging channel configuration
// @access  Private (Admin)
router.post('/:id/test',
    verifyAdminToken,
    requirePermission('systemSettings'),
    messagingChannelController.testMessagingChannel
);

// @route   PATCH /api/messaging-channels/:id/toggle
// @desc    Toggle channel active status
// @access  Private (Admin)
router.patch('/:id/toggle',
    verifyAdminToken,
    requirePermission('systemSettings'),
    messagingChannelController.toggleChannelStatus
);

// @route   PATCH /api/messaging-channels/:id/set-default
// @desc    Set channel as default for its type
// @access  Private (Admin)
router.patch('/:id/set-default',
    verifyAdminToken,
    requirePermission('systemSettings'),
    messagingChannelController.setDefaultChannel
);

// @route   GET /api/messaging-channels/:id/stats
// @desc    Get channel statistics
// @access  Private (Admin)
router.get('/:id/stats',
    verifyAdminToken,
    requirePermission('systemSettings'),
    noLogActivity,
    messagingChannelController.getChannelStats
);

// ===== BAILEY'S WHATSAPP SCANNER ROUTES =====

// @route   POST /api/messaging-channels/bailey/init
// @desc    Initialize Bailey's WhatsApp scanner session
// @access  Private (Admin)
router.post('/bailey/init',
    verifyAdminToken,
    requirePermission('systemSettings'),
    messagingChannelController.initBaileySession
);

// @route   GET /api/messaging-channels/bailey/:sessionId/qr
// @desc    Get QR code for Bailey's WhatsApp scanner
// @access  Private (Admin)
router.get('/bailey/:sessionId/qr',
    verifyAdminToken,
    requirePermission('systemSettings'),
    messagingChannelController.getBaileyQR
);

// @route   GET /api/messaging-channels/bailey/:sessionId/status
// @desc    Get Bailey's WhatsApp scanner connection status
// @access  Private (Admin)
router.get('/bailey/:sessionId/status',
    verifyAdminToken,
    requirePermission('systemSettings'),
    noLogActivity,
    messagingChannelController.getBaileyStatus
);

// @route   POST /api/messaging-channels/bailey/:sessionId/connect
// @desc    Connect Bailey's WhatsApp scanner after QR scan
// @access  Private (Admin)
router.post('/bailey/:sessionId/connect',
    verifyAdminToken,
    requirePermission('systemSettings'),
    messagingChannelController.connectBaileyDevice
);

// @route   DELETE /api/messaging-channels/bailey/:sessionId
// @desc    Disconnect and cleanup Bailey's WhatsApp scanner session
// @access  Private (Admin)
router.delete('/bailey/:sessionId',
    verifyAdminToken,
    requirePermission('systemSettings'),
    messagingChannelController.disconnectBaileySession
);

module.exports = router;