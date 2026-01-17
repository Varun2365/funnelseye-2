const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// Middleware to extract recipient info from token
const extractRecipientInfo = async (req, res, next) => {
    try {
        // Get user info from token (set by protect middleware)
        const user = req.user;
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        
        // Determine recipient type and ID based on user role
        if (user.role === 'coach') {
            req.recipientId = user._id || user.id;
            req.recipientType = 'coach';
            req.coachId = user._id || user.id;
        } else if (user.role === 'staff') {
            req.recipientId = user._id || user.id;
            req.recipientType = 'staff';
            req.coachId = user.coachId || req.coachId;
        } else if (user.role === 'client') {
            req.recipientId = user._id || user.id;
            req.recipientType = 'client';
            req.coachId = user.coachId || req.coachId;
        } else {
            // Fallback: default to coach
            req.recipientId = user._id || user.id;
            req.recipientType = 'coach';
            req.coachId = user._id || user.id;
        }
        
        next();
    } catch (error) {
        console.error('[NotificationRoutes] Error extracting recipient info:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to authenticate'
        });
    }
};

// All routes require authentication
router.use(protect);
router.use(extractRecipientInfo);

// Get notifications
router.get('/', notificationController.getNotifications);

// Get unread count
router.get('/unread-count', notificationController.getUnreadCount);

// Mark notification as read
router.put('/:id/read', notificationController.markAsRead);

// Mark all as read
router.put('/mark-all-read', notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

// Create notification (for system/automation use - requires coach/admin)
router.post('/', notificationController.createNotification);

module.exports = router;

