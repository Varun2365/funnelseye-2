const express = require('express');
const router = express.Router();

// Import WAHA controller
const {
    // Session management
    listWahaSessions,
    getWahaSession,
    createWahaSession,
    updateWahaSession,
    deleteWahaSession,
    startWahaSession,
    stopWahaSession,
    restartWahaSession,
    logoutWahaSession,
    getWahaScreenshot,
    getWahaMe,
    getWahaQR,
    requestWahaCode,

    // Messaging
    sendWahaText,
    sendWahaSeen,
    sendWahaImage,
    sendWahaFile,

    // Admin functions
    createWahaChannel
} = require('../controllers/wahaController');

// Import middleware
const { verifyAdminToken, noLogActivity } = require('../middleware/adminAuth');
const { requirePermission } = require('../middleware/permissionMiddleware');

/**
 * WAHA WhatsApp API Routes
 * Base: /api/waha/
 * Access: Admin only
 * All routes require admin authentication and systemSettings permission
 */

// Apply middleware to all routes
router.use(verifyAdminToken);
router.use(requirePermission('systemSettings'));

/**
 * Session Management Routes
 */

// List sessions
router.get('/sessions/',
    listWahaSessions
);

// Get session
router.get('/sessions/:sessionId',
    getWahaSession
);

// Create session
router.post('/sessions/',
    createWahaSession
);

// Update session
router.post('/sessions/:sessionId/',
    updateWahaSession
);

// Delete session
router.delete('/sessions/:sessionId/',
    deleteWahaSession
);

// Start session
router.post('/sessions/:sessionId/start',
    startWahaSession
);

// Stop session
router.post('/sessions/:sessionId/stop',
    stopWahaSession
);

// Restart session
router.post('/sessions/:sessionId/restart',
    restartWahaSession
);

// Logout from session
router.post('/sessions/logout',
    logoutWahaSession
);

// Get screenshot
router.get('/screenshot',
    getWahaScreenshot
);

// Get me (current user info)
router.get('/sessions/:sessionId/me',
    getWahaMe
);

// Get QR code
router.post('/:sessionId/auth/qr',
    getWahaQR
);

// Request auth code
router.post('/:sessionId/auth/request-code',
    requestWahaCode
);

/**
 * Messaging Routes
 */

// Send text message
router.post('/sendText',
    sendWahaText
);

// Send seen receipt
router.post('/sendSeen',
    sendWahaSeen
);

// Send image
router.post('/sendImage',
    sendWahaImage
);

// Send file
router.post('/sendFile',
    sendWahaFile
);

/**
 * Admin Routes
 */

// Create messaging channel from connected session
router.post('/:sessionId/create-channel',
    createWahaChannel
);

module.exports = router;