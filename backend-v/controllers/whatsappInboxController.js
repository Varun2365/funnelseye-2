const asyncHandler = require('../middleware/async');
const WhatsAppInbox = require('../schema/WhatsAppInbox');
const WhatsAppAIKnowledge = require('../schema/WhatsAppAIKnowledge');
const whatsappAIAutoReplyService = require('../services/whatsappAIAutoReplyService');

// @desc    Get inbox messages for user
// @route   GET /api/whatsapp/v1/inbox
// @access  Private (Admin/Coach/Staff)
const getInboxMessages = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        const userType = req.user.role || 'coach';
        
        const {
            page = 1,
            limit = 50,
            conversationId,
            senderPhone,
            category,
            priority,
            isArchived = false,
            requiresFollowUp,
            assignedTo,
            startDate,
            endDate,
            search
        } = req.query;

        // Build query
        const query = {
            $or: [
                { userId: userId },
                { assignedTo: userId },
                { userType: userType }
            ],
            isArchived: isArchived === 'true'
        };

        // Add filters
        if (conversationId) query.conversationId = conversationId;
        if (senderPhone) query.senderPhone = senderPhone;
        if (category) query.category = category;
        if (priority) query.priority = priority;
        if (assignedTo) query.assignedTo = assignedTo;
        if (requiresFollowUp) query.requiresFollowUp = requiresFollowUp === 'true';

        // Date range filter
        if (startDate || endDate) {
            query.sentAt = {};
            if (startDate) query.sentAt.$gte = new Date(startDate);
            if (endDate) query.sentAt.$lte = new Date(endDate);
        }

        // Search filter
        if (search) {
            query.$or = [
                { 'content.text': { $regex: search, $options: 'i' } },
                { senderName: { $regex: search, $options: 'i' } },
                { senderPhone: { $regex: search, $options: 'i' } }
            ];
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Get messages
        const messages = await WhatsAppInbox.find(query)
            .populate('leadId', 'name email phone')
            .populate('coachId', 'name email')
            .populate('assignedTo', 'name email')
            .sort({ sentAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
        const total = await WhatsAppInbox.countDocuments(query);

        // Get conversation summaries
        const conversations = await WhatsAppInbox.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$conversationId',
                    lastMessage: { $last: '$$ROOT' },
                    messageCount: { $sum: 1 },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { $not: { $in: [userId, '$readBy.userId'] } },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            { $sort: { 'lastMessage.sentAt': -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                messages,
                conversations,
                pagination: {
                    current: parseInt(page),
                    total: Math.ceil(total / parseInt(limit)),
                    count: messages.length,
                    totalCount: total
                }
            }
        });

    } catch (error) {
        console.error('Error getting inbox messages:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving inbox messages'
        });
    }
});

// @desc    Get conversation messages
// @route   GET /api/whatsapp/v1/inbox/conversation/:conversationId
// @access  Private (Admin/Coach/Staff)
const getConversationMessages = asyncHandler(async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        const messages = await WhatsAppInbox.find({ conversationId })
            .populate('leadId', 'name email phone')
            .populate('coachId', 'name email')
            .populate('assignedTo', 'name email')
            .sort({ sentAt: 1 });

        // Mark messages as read by current user
        for (const message of messages) {
            await message.markAsRead(userId);
        }

        res.status(200).json({
            success: true,
            data: messages
        });

    } catch (error) {
        console.error('Error getting conversation messages:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving conversation messages'
        });
    }
});

// @desc    Send message from inbox
// @route   POST /api/whatsapp/v1/inbox/send
// @access  Private (Admin/Coach/Staff)
const sendInboxMessage = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        const userType = req.user.role || 'coach';
        const { to, message, messageType = 'text', conversationId, leadId } = req.body;

        if (!to || !message) {
            return res.status(400).json({
                success: false,
                message: 'Recipient phone number and message are required'
            });
        }

        // Send message via central WhatsApp service
        const centralWhatsAppService = require('../services/centralWhatsAppService');
        const sendResult = await centralWhatsAppService.sendMessage({
            to: to,
            message: message,
            type: messageType
        });

        // Create inbox record
        const inboxRecord = new WhatsAppInbox({
            messageId: `outbound_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            wamid: sendResult.wamid,
            senderPhone: process.env.WHATSAPP_PHONE_NUMBER || 'unknown',
            recipientPhone: to,
            conversationId: conversationId || to,
            messageType: messageType,
            content: {
                text: message
            },
            direction: 'outbound',
            status: 'sent',
            sentAt: new Date(),
            userId: userId,
            userType: userType,
            leadId: leadId,
            category: 'manual',
            priority: 'medium'
        });

        await inboxRecord.save();

        res.status(200).json({
            success: true,
            message: 'Message sent successfully',
            data: {
                messageId: inboxRecord.messageId,
                wamid: sendResult.wamid,
                sentAt: inboxRecord.sentAt
            }
        });

    } catch (error) {
        console.error('Error sending inbox message:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending message'
        });
    }
});

// @desc    Mark message as read
// @route   PUT /api/whatsapp/v1/inbox/messages/:messageId/read
// @access  Private (Admin/Coach/Staff)
const markMessageAsRead = asyncHandler(async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;

        const message = await WhatsAppInbox.findById(messageId);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        await message.markAsRead(userId);

        res.status(200).json({
            success: true,
            message: 'Message marked as read'
        });

    } catch (error) {
        console.error('Error marking message as read:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking message as read'
        });
    }
});

// @desc    Assign message to user
// @route   PUT /api/whatsapp/v1/inbox/messages/:messageId/assign
// @access  Private (Admin/Coach/Staff)
const assignMessage = asyncHandler(async (req, res) => {
    try {
        const { messageId } = req.params;
        const { assignedTo, priority, category, notes } = req.body;

        const message = await WhatsAppInbox.findById(messageId);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        const updateData = {};
        if (assignedTo) updateData.assignedTo = assignedTo;
        if (priority) updateData.priority = priority;
        if (category) updateData.category = category;
        if (notes) updateData.followUpNotes = notes;

        const updatedMessage = await WhatsAppInbox.findByIdAndUpdate(
            messageId,
            updateData,
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Message assigned successfully',
            data: updatedMessage
        });

    } catch (error) {
        console.error('Error assigning message:', error);
        res.status(500).json({
            success: false,
            message: 'Error assigning message'
        });
    }
});

// @desc    Archive message
// @route   PUT /api/whatsapp/v1/inbox/messages/:messageId/archive
// @access  Private (Admin/Coach/Staff)
const archiveMessage = asyncHandler(async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;

        const message = await WhatsAppInbox.findByIdAndUpdate(
            messageId,
            {
                isArchived: true,
                archivedAt: new Date(),
                archivedBy: userId
            },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Message archived successfully'
        });

    } catch (error) {
        console.error('Error archiving message:', error);
        res.status(500).json({
            success: false,
            message: 'Error archiving message'
        });
    }
});

// @desc    Get inbox statistics
// @route   GET /api/whatsapp/v1/inbox/stats
// @access  Private (Admin/Coach/Staff)
const getInboxStats = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        const userType = req.user.role || 'coach';

        const query = {
            $or: [
                { userId: userId },
                { assignedTo: userId },
                { userType: userType }
            ],
            isArchived: false
        };

        const stats = await WhatsAppInbox.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalMessages: { $sum: 1 },
                    unreadMessages: {
                        $sum: {
                            $cond: [
                                { $not: { $in: [userId, '$readBy.userId'] } },
                                1,
                                0
                            ]
                        }
                    },
                    inboundMessages: {
                        $sum: {
                            $cond: [{ $eq: ['$direction', 'inbound'] }, 1, 0]
                        }
                    },
                    outboundMessages: {
                        $sum: {
                            $cond: [{ $eq: ['$direction', 'outbound'] }, 1, 0]
                        }
                    },
                    aiReplies: {
                        $sum: {
                            $cond: [{ $eq: ['$aiProcessed', true] }, 1, 0]
                        }
                    },
                    requiresFollowUp: {
                        $sum: {
                            $cond: [{ $eq: ['$requiresFollowUp', true] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        const categoryStats = await WhatsAppInbox.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

        const priorityStats = await WhatsAppInbox.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                overview: stats[0] || {
                    totalMessages: 0,
                    unreadMessages: 0,
                    inboundMessages: 0,
                    outboundMessages: 0,
                    aiReplies: 0,
                    requiresFollowUp: 0
                },
                categories: categoryStats,
                priorities: priorityStats
            }
        });

    } catch (error) {
        console.error('Error getting inbox stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving inbox statistics'
        });
    }
});

module.exports = {
    getInboxMessages,
    getConversationMessages,
    sendInboxMessage,
    markMessageAsRead,
    assignMessage,
    archiveMessage,
    getInboxStats
};
