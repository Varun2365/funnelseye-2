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
// Note: Bailey's routes have been moved to /api/baileys/ for better organization
// Use /api/baileys/init, /api/baileys/:sessionId/* endpoints instead

module.exports = router;