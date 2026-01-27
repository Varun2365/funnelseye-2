const express = require('express');
const router = express.Router();

// Import Bailey's controller
const {
    initBaileySession,
    getBaileyQR,
    getBaileyStatus,
    connectBaileyDevice,
    createBaileyChannel,
    disconnectBaileySession,
    getBaileyStats
} = require('../controllers/baileysController');

// Import middleware
const { verifyAdminToken, noLogActivity } = require('../middleware/adminAuth');
const { requirePermission } = require('../middleware/permissionMiddleware');

/**
 * Bailey's WhatsApp API Routes
 * Base: /api/baileys/
 * Access: Admin only
 */

// Initialize new Bailey session
router.post('/init',
    verifyAdminToken,
    requirePermission('systemSettings'),
    initBaileySession
);

// Get QR code for session
router.get('/:sessionId/qr',
    verifyAdminToken,
    requirePermission('systemSettings'),
    getBaileyQR
);

// Get session status
router.get('/:sessionId/status',
    verifyAdminToken,
    requirePermission('systemSettings'),
    noLogActivity,
    getBaileyStatus
);

// Connect session after QR scan
router.post('/:sessionId/connect',
    verifyAdminToken,
    requirePermission('systemSettings'),
    connectBaileyDevice
);

// Create messaging channel from connected session
router.post('/:sessionId/create-channel',
    verifyAdminToken,
    requirePermission('systemSettings'),
    createBaileyChannel
);

// Disconnect and cleanup session
router.delete('/:sessionId',
    verifyAdminToken,
    requirePermission('systemSettings'),
    disconnectBaileySession
);

// Get Bailey's manager stats
router.get('/admin/stats',
    verifyAdminToken,
    requirePermission('systemSettings'),
    noLogActivity,
    getBaileyStats
);

module.exports = router;