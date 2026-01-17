const Notification = require('../schema/Notification');
const Coach = require('../schema/coachSchema');
const Staff = require('../schema/Staff');
const User = require('../schema/User');

/**
 * @desc Get all notifications for a user
 * @route GET /api/notifications
 * @access Private
 */
exports.getNotifications = async (req, res) => {
    try {
        const { recipientId, recipientType } = req;
        const { page = 1, limit = 50, unreadOnly = false, type, priority } = req.query;
        
        const query = {
            recipientId,
            recipientType,
            $or: [
                { expiresAt: null },
                { expiresAt: { $gt: new Date() } }
            ]
        };
        
        if (unreadOnly === 'true') {
            query.isRead = false;
        }
        
        if (type) {
            query.type = type;
        }
        
        if (priority) {
            query.priority = priority;
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .lean();
        
        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.getUnreadCount(recipientId, recipientType);
        
        res.status(200).json({
            success: true,
            data: {
                notifications,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                },
                unreadCount
            }
        });
    } catch (error) {
        console.error('[NotificationController] Error getting notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications',
            error: error.message
        });
    }
};

/**
 * @desc Get unread notification count
 * @route GET /api/notifications/unread-count
 * @access Private
 */
exports.getUnreadCount = async (req, res) => {
    try {
        const { recipientId, recipientType } = req;
        
        const count = await Notification.getUnreadCount(recipientId, recipientType);
        
        res.status(200).json({
            success: true,
            data: { count }
        });
    } catch (error) {
        console.error('[NotificationController] Error getting unread count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch unread count',
            error: error.message
        });
    }
};

/**
 * @desc Mark notification as read
 * @route PUT /api/notifications/:id/read
 * @access Private
 */
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const { recipientId, recipientType } = req;
        
        const notification = await Notification.findOne({
            _id: id,
            recipientId,
            recipientType
        });
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }
        
        await notification.markAsRead();
        
        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('[NotificationController] Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read',
            error: error.message
        });
    }
};

/**
 * @desc Mark all notifications as read
 * @route PUT /api/notifications/mark-all-read
 * @access Private
 */
exports.markAllAsRead = async (req, res) => {
    try {
        const { recipientId, recipientType } = req;
        
        const result = await Notification.markAllAsRead(recipientId, recipientType);
        
        res.status(200).json({
            success: true,
            data: {
                modifiedCount: result.modifiedCount
            }
        });
    } catch (error) {
        console.error('[NotificationController] Error marking all as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark all notifications as read',
            error: error.message
        });
    }
};

/**
 * @desc Delete notification
 * @route DELETE /api/notifications/:id
 * @access Private
 */
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const { recipientId, recipientType } = req;
        
        const notification = await Notification.findOneAndDelete({
            _id: id,
            recipientId,
            recipientType
        });
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        console.error('[NotificationController] Error deleting notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification',
            error: error.message
        });
    }
};

/**
 * @desc Create notification (for system/automation use)
 * @route POST /api/notifications
 * @access Private (Admin/System)
 */
exports.createNotification = async (req, res) => {
    try {
        const {
            recipientId,
            recipientType,
            title,
            message,
            type = 'info',
            priority = 'normal',
            actionUrl,
            actionLabel,
            relatedEntityType,
            relatedEntityId,
            source = 'system',
            sourceId,
            coachId,
            expiresAt,
            metadata
        } = req.body;
        
        // Validate recipient exists
        let recipient;
        if (recipientType === 'coach') {
            recipient = await Coach.findById(recipientId);
        } else if (recipientType === 'staff') {
            recipient = await Staff.findById(recipientId);
        } else if (recipientType === 'client') {
            recipient = await User.findById(recipientId);
        }
        
        if (!recipient) {
            return res.status(400).json({
                success: false,
                message: 'Invalid recipient'
            });
        }
        
        // Use recipient's coachId if not provided
        const finalCoachId = coachId || recipient.coachId || req.coachId;
        
        if (!finalCoachId) {
            return res.status(400).json({
                success: false,
                message: 'Coach ID is required'
            });
        }
        
        const notification = await Notification.createNotification({
            recipientId,
            recipientType,
            title,
            message,
            type,
            priority,
            actionUrl,
            actionLabel,
            relatedEntityType,
            relatedEntityId,
            source,
            sourceId,
            coachId: finalCoachId,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            metadata: metadata || {}
        });

        // Emit WebSocket event for real-time notification
        try {
            const { getIoInstance } = require('../utils/socketUtils');
            const io = getIoInstance();
            
            if (io) {
                const notificationPayload = {
                    id: notification._id.toString(),
                    title: notification.title,
                    message: notification.message,
                    type: notification.type,
                    priority: notification.priority,
                    actionUrl: notification.actionUrl,
                    actionLabel: notification.actionLabel,
                    createdAt: notification.createdAt,
                    isRead: notification.isRead,
                    recipientId: recipientId.toString(),
                    recipientType: recipientType
                };

                // Emit to specific user room (primary target)
                const userRoom = `user-${recipientId}`;
                io.to(userRoom).emit('notification', notificationPayload);
                console.log(`[NotificationController] 📡 Emitted to room: ${userRoom}`);
                
                // Also emit to coach/staff room based on type
                if (recipientType === 'coach') {
                    const coachRoom = `coach-${recipientId}`;
                    io.to(coachRoom).emit('notification', notificationPayload);
                    console.log(`[NotificationController] 📡 Emitted to room: ${coachRoom}`);
                    
                    // Also emit to general coach room
                    io.to('coach-room').emit('notification', notificationPayload);
                    console.log(`[NotificationController] 📡 Emitted to room: coach-room`);
                }
                
                // Log room occupancy for debugging (async operation)
                io.in(userRoom).fetchSockets().then((sockets) => {
                    console.log(`[NotificationController] 📊 Room ${userRoom} has ${sockets.length} connected client(s)`);
                }).catch((err) => {
                    console.warn(`[NotificationController] Could not fetch room sockets:`, err.message);
                });
                
                console.log(`[NotificationController] ✅ WebSocket notification emitted to ${recipientType} ${recipientId}`);
            } else {
                console.warn(`[NotificationController] ⚠️ Socket.IO instance not available`);
            }
        } catch (socketError) {
            console.error(`[NotificationController] ❌ Error emitting WebSocket notification:`, socketError);
        }
        
        res.status(201).json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('[NotificationController] Error creating notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create notification',
            error: error.message
        });
    }
};

