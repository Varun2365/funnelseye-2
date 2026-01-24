const mongoose = require('mongoose');
const MessagingChannel = require('../schema/MessagingChannel');
const User = require('../schema/User');
const Message = require('../schema/Message');
const Contact = require('../schema/Contact');
const MessageTemplate = require('../schema/MessageTemplate');
const messagingV3Worker = require('../workers/messagingV3Worker');
const centralWhatsAppService = require('../services/centralWhatsAppService');

/**
 * Messaging API v3 Controller
 * Enhanced messaging system with multi-channel support and high-throughput worker
 */

// ===== ADMIN SETTINGS =====

/**
 * Get admin messaging settings
 */
const getAdminSettings = async (req, res) => {
    try {
        // Get system-wide messaging settings
        const settings = {
            creditRates: {
                meta_whatsapp: 0.01,
                baileys_whatsapp: 0.008,
                email: 0.005
            },
            maxBatchSize: 100,
            maxMessagesPerHour: 10000,
            defaultDelay: 1000,
            channels: {
                meta_whatsapp: { enabled: true },
                baileys_whatsapp: { enabled: true },
                email: { enabled: true }
            }
        };

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error getting admin settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get admin settings',
            error: error.message
        });
    }
};

/**
 * Update admin messaging settings
 */
const updateAdminSettings = async (req, res) => {
    try {
        const { settings } = req.body;

        // Update settings in database or cache
        // Implementation depends on your settings storage

        res.json({
            success: true,
            message: 'Admin settings updated successfully'
        });
    } catch (error) {
        console.error('Error updating admin settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update admin settings',
            error: error.message
        });
    }
};

/**
 * Update central credit rates
 */
const updateCreditRates = async (req, res) => {
    try {
        const { creditRates } = req.body;

        // Validate rates
        const validChannels = ['meta_whatsapp', 'baileys_whatsapp', 'email'];
        for (const channel of validChannels) {
            if (creditRates[channel] < 0) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid credit rate for ${channel}`
                });
            }
        }

        // Update rates in database/cache
        // This would typically update a settings collection

        res.json({
            success: true,
            message: 'Credit rates updated successfully',
            data: creditRates
        });
    } catch (error) {
        console.error('Error updating credit rates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update credit rates',
            error: error.message
        });
    }
};

/**
 * Get current credit rates
 */
const getCreditRates = async (req, res) => {
    try {
        // Get rates from database/cache
        const creditRates = {
            meta_whatsapp: 0.01,
            baileys_whatsapp: 0.008,
            email: 0.005
        };

        res.json({
            success: true,
            data: creditRates
        });
    } catch (error) {
        console.error('Error getting credit rates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get credit rates',
            error: error.message
        });
    }
};

// ===== COACH SETTINGS =====

/**
 * Get coach messaging settings
 */
const getCoachSettings = async (req, res) => {
    try {
        const coachId = req.user.id;

        // Get coach-specific settings
        const settings = {
            preferredChannel: 'meta_whatsapp',
            autoSelectChannel: true,
            defaultTemplate: null,
            notifications: {
                deliveryStatus: true,
                creditAlerts: true
            }
        };

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error getting coach settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get coach settings',
            error: error.message
        });
    }
};

/**
 * Update coach messaging settings
 */
const updateCoachSettings = async (req, res) => {
    try {
        const coachId = req.user.id;
        const { settings } = req.body;

        // Update coach settings in database

        res.json({
            success: true,
            message: 'Coach settings updated successfully'
        });
    } catch (error) {
        console.error('Error updating coach settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update coach settings',
            error: error.message
        });
    }
};

// ===== MESSAGING CHANNELS =====

/**
 * Create new messaging channel
 */
const createChannel = async (req, res) => {
    try {
        const { name, type, config } = req.body;

        if (!name || !type) {
            return res.status(400).json({
                success: false,
                message: 'Channel name and type are required'
            });
        }

        // Validate channel type
        const validTypes = ['whatsapp_api', 'whatsapp_bailey', 'email_smtp'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid channel type'
            });
        }

        // Create channel using existing service
        const MessagingChannel = require('../schema/MessagingChannel');

        const channelData = {
            name,
            type,
            configuredBy: req.admin.id,
            isActive: true,
            isDefault: false
        };

        // Add type-specific configuration
        if (type === 'whatsapp_api') {
            channelData.whatsappApi = config.whatsappApi || {};
        } else if (type === 'whatsapp_bailey') {
            channelData.whatsappBailey = config.whatsappBailey || {};
        } else if (type === 'email_smtp') {
            channelData.emailSmtp = config.emailSmtp || {};
        }

        const channel = new MessagingChannel(channelData);
        await channel.save();

        console.log('✅ Created messaging channel:', channel._id);

        res.json({
            success: true,
            message: 'Channel created successfully',
            data: channel
        });
    } catch (error) {
        console.error('Error creating channel:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create channel',
            error: error.message
        });
    }
};

/**
 * Get available messaging channels for user
 */
const getAvailableChannels = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let channels = [];

        if (userRole === 'admin') {
            // Admin can use all channels
            channels = await MessagingChannel.find({ isActive: true });
        } else {
            // Coach can use their own channels or public ones
            channels = await MessagingChannel.find({
                $or: [
                    { configuredBy: userId },
                    { isPublic: true }
                ],
                isActive: true
            });
        }

        // Group by category
        const groupedChannels = {
            meta_whatsapp: channels.filter(c => c.type === 'whatsapp_api'),
            baileys_whatsapp: channels.filter(c => c.type === 'whatsapp_bailey'),
            email: channels.filter(c => c.type === 'email_smtp')
        };

        res.json({
            success: true,
            data: groupedChannels
        });
    } catch (error) {
        console.error('Error getting available channels:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get available channels',
            error: error.message
        });
    }
};

/**
 * Test messaging channel
 */
const testChannel = async (req, res) => {
    try {
        const { channelId, channelCategory } = req.body;
        const userId = req.user.id;

        // Send test message via worker
        const testMessage = {
            channelCategory,
            channelId,
            to: req.user.email || '+1234567890', // Use user's contact
            message: 'Test message from Messaging v3 API',
            userId,
            isTest: true
        };

        // Queue test message
        await messagingV3Worker.queueMessage(testMessage);

        res.json({
            success: true,
            message: 'Test message queued successfully'
        });
    } catch (error) {
        console.error('Error testing channel:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to test channel',
            error: error.message
        });
    }
};

// ===== TEMPLATE MANAGEMENT =====

/**
 * Get available templates for user
 */
const getTemplates = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let templates = [];

        if (userRole === 'admin') {
            // Admin sees all templates
            templates = await Template.find({});
        } else {
            // Coach sees own templates + public ones
            templates = await Template.find({
                $or: [
                    { createdBy: userId },
                    { isPublic: true }
                ]
            });
        }

        res.json({
            success: true,
            data: templates
        });
    } catch (error) {
        console.error('Error getting templates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get templates',
            error: error.message
        });
    }
};

/**
 * Sync templates from Meta WhatsApp
 */
const syncMetaTemplates = async (req, res) => {
    try {
        console.log('🔄 Syncing Meta WhatsApp templates...');

        // Call central WhatsApp service to sync templates
        const result = await centralWhatsAppService.syncTemplatesFromMeta();

        res.json({
            success: true,
            message: 'Meta templates synced successfully',
            data: result
        });
    } catch (error) {
        console.error('Error syncing Meta templates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to sync Meta templates',
            error: error.message
        });
    }
};

// ===== MESSAGE SENDING =====

/**
 * Send single message via worker
 */
const sendMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        const {
            channelCategory,
            channelId,
            to,
            useTemplate = false,
            templateId,
            templateParams = {},
            message,
            mediaUrl,
            mediaType,
            priority = 'normal',
            scheduledAt
        } = req.body;

        // Validate required fields
        if (!channelCategory || !to) {
            return res.status(400).json({
                success: false,
                message: 'Channel category and recipient are required'
            });
        }

        if (useTemplate && !templateId) {
            return res.status(400).json({
                success: false,
                message: 'Template ID is required when useTemplate is true'
            });
        }

        if (!useTemplate && !message && !mediaUrl) {
            return res.status(400).json({
                success: false,
                message: 'Message content or media is required'
            });
        }

        // Check credits for non-admin users
        if (userRole !== 'admin') {
            const canSend = await checkCreditBalance(userId, channelCategory);
            if (!canSend) {
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient credits to send message'
                });
            }
        }

        // Prepare message for worker
        const messageData = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            channelCategory,
            channelId,
            to,
            useTemplate,
            templateId,
            templateParams,
            message,
            mediaUrl,
            mediaType,
            priority,
            scheduledAt,
            userId,
            userRole,
            timestamp: new Date()
        };

        // Queue message in worker
        await messagingV3Worker.queueMessage(messageData);

        // Deduct credits immediately for non-admin
        if (userRole !== 'admin') {
            await deductCredits(userId, channelCategory);
        }

        res.json({
            success: true,
            message: 'Message queued successfully',
            data: {
                messageId: messageData.id,
                status: 'queued'
            }
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message
        });
    }
};

/**
 * Send bulk messages via worker queue
 */
const sendBulkMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        const {
            channelCategory,
            recipients,
            useTemplate = false,
            templateId,
            templateParams = {},
            message,
            mediaUrl,
            mediaType,
            delayMs = 1000,
            batchSize = 10,
            priority = 'normal'
        } = req.body;

        // Validate inputs
        if (!channelCategory || !recipients || !Array.isArray(recipients)) {
            return res.status(400).json({
                success: false,
                message: 'Channel category and recipients array are required'
            });
        }

        if (useTemplate && !templateId) {
            return res.status(400).json({
                success: false,
                message: 'Template ID is required for template messages'
            });
        }

        // Check total credits needed
        const totalMessages = recipients.length;
        if (userRole !== 'admin') {
            const canSend = await checkBulkCreditBalance(userId, channelCategory, totalMessages);
            if (!canSend) {
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient credits to send bulk messages'
                });
            }
        }

        // Prepare bulk message batch
        const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const messageBatch = {
            batchId,
            channelCategory,
            recipients,
            useTemplate,
            templateId,
            templateParams,
            message,
            mediaUrl,
            mediaType,
            delayMs,
            batchSize,
            priority,
            userId,
            userRole,
            totalMessages,
            timestamp: new Date()
        };

        // Queue bulk messages
        await messagingV3Worker.queueBulkMessages(messageBatch);

        // Deduct credits for all messages
        if (userRole !== 'admin') {
            await deductBulkCredits(userId, channelCategory, totalMessages);
        }

        res.json({
            success: true,
            message: `${totalMessages} messages queued successfully`,
            data: {
                batchId,
                totalMessages,
                estimatedTime: Math.ceil(totalMessages / batchSize) * (delayMs / 1000)
            }
        });
    } catch (error) {
        console.error('Error sending bulk messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send bulk messages',
            error: error.message
        });
    }
};

// ===== MESSAGE STATUS & TRACKING =====

/**
 * Get message delivery status
 */
const getMessageStatus = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;

        // Find message in database
        const message = await Message.findOne({
            _id: messageId,
            $or: [
                { senderId: userId },
                { recipientId: userId }
            ]
        });

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        res.json({
            success: true,
            data: {
                messageId: message._id,
                status: message.status,
                deliveredAt: message.deliveredAt,
                readAt: message.readAt,
                failedAt: message.failedAt,
                error: message.error
            }
        });
    } catch (error) {
        console.error('Error getting message status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get message status',
            error: error.message
        });
    }
};

/**
 * Get user's sent messages
 */
const getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20, status } = req.query;

        const query = { senderId: userId };
        if (status) query.status = status;

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('templateId', 'name');

        const total = await Message.countDocuments(query);

        res.json({
            success: true,
            data: messages,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get messages',
            error: error.message
        });
    }
};

// ===== ANALYTICS =====

/**
 * Get messaging analytics
 */
const getAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { startDate, endDate } = req.query;

        const query = userRole === 'admin' ? {} : { senderId: userId };
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const [
            totalSent,
            delivered,
            failed,
            byChannel
        ] = await Promise.all([
            Message.countDocuments({ ...query, status: { $ne: 'failed' } }),
            Message.countDocuments({ ...query, status: 'delivered' }),
            Message.countDocuments({ ...query, status: 'failed' }),
            Message.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: '$channelCategory',
                        count: { $sum: 1 },
                        delivered: {
                            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
                        }
                    }
                }
            ])
        ]);

        res.json({
            success: true,
            data: {
                totalSent,
                delivered,
                failed,
                deliveryRate: totalSent > 0 ? (delivered / totalSent * 100).toFixed(2) : 0,
                byChannel
            }
        });
    } catch (error) {
        console.error('Error getting analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get analytics',
            error: error.message
        });
    }
};

// ===== CREDITS MANAGEMENT =====

/**
 * Get user's credit balance
 */
const getCreditBalance = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).select('credits');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                balance: user.credits || 0,
                currency: 'USD'
            }
        });
    } catch (error) {
        console.error('Error getting credit balance:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get credit balance',
            error: error.message
        });
    }
};

/**
 * Check if user can send messages
 */
const checkCanSend = async (req, res) => {
    try {
        const userId = req.user.id;
        const { channelCategory, count = 1 } = req.query;

        const canSend = await checkBulkCreditBalance(userId, channelCategory, count);

        res.json({
            success: true,
            data: {
                canSend,
                requiredCredits: await getCreditCost(channelCategory, count)
            }
        });
    } catch (error) {
        console.error('Error checking send capability:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check send capability',
            error: error.message
        });
    }
};

/**
 * Purchase credits
 */
const purchaseCredits = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, packageId } = req.body;

        // Implement Razorpay integration here
        // For now, just add credits directly

        const user = await User.findById(userId);
        user.credits = (user.credits || 0) + amount;
        await user.save();

        res.json({
            success: true,
            message: `Successfully purchased ${amount} credits`,
            data: {
                newBalance: user.credits
            }
        });
    } catch (error) {
        console.error('Error purchasing credits:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to purchase credits',
            error: error.message
        });
    }
};

// ===== CONTACTS & INBOX =====

/**
 * Get messaging contacts
 */
const getContacts = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { page = 1, limit = 20 } = req.query;

        const query = userRole === 'admin' ? {} : { coachId: userId };

        const contacts = await Contact.find(query)
            .sort({ lastMessageAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Contact.countDocuments(query);

        res.json({
            success: true,
            data: contacts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error getting contacts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get contacts',
            error: error.message
        });
    }
};

/**
 * Get unified inbox
 */
const getInbox = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { page = 1, limit = 20 } = req.query;

        const query = userRole === 'admin' ? {} : {
            $or: [
                { senderId: userId },
                { recipientId: userId }
            ]
        };

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('senderId', 'name email')
            .populate('recipientId', 'name email');

        const total = await Message.countDocuments(query);

        res.json({
            success: true,
            data: messages,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error getting inbox:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get inbox',
            error: error.message
        });
    }
};

// ===== WORKER MANAGEMENT =====

/**
 * Get messaging worker status
 */
const getWorkerStatus = async (req, res) => {
    try {
        const status = await messagingV3Worker.getStatus();

        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        console.error('Error getting worker status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get worker status',
            error: error.message
        });
    }
};

/**
 * Restart messaging worker
 */
const restartWorker = async (req, res) => {
    try {
        await messagingV3Worker.restart();

        res.json({
            success: true,
            message: 'Worker restarted successfully'
        });
    } catch (error) {
        console.error('Error restarting worker:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to restart worker',
            error: error.message
        });
    }
};

/**
 * Get message queue statistics
 */
const getQueueStats = async (req, res) => {
    try {
        const stats = await messagingV3Worker.getQueueStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error getting queue stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get queue stats',
            error: error.message
        });
    }
};

// ===== SYSTEM HEALTH =====

/**
 * Get messaging system health
 */
const getHealthStatus = async (req, res) => {
    try {
        const [
            workerStatus,
            queueStats,
            channelStatus
        ] = await Promise.all([
            messagingV3Worker.getStatus(),
            messagingV3Worker.getQueueStats(),
            checkChannelHealth()
        ]);

        const health = {
            status: 'healthy',
            timestamp: new Date(),
            components: {
                worker: workerStatus,
                queue: queueStats,
                channels: channelStatus
            }
        };

        // Determine overall health
        if (!workerStatus.isRunning || queueStats.failed > 10) {
            health.status = 'degraded';
        }

        res.json({
            success: true,
            data: health
        });
    } catch (error) {
        console.error('Error getting health status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get health status',
            error: error.message
        });
    }
};

// ===== HELPER FUNCTIONS =====

/**
 * Check if user has enough credits
 */
const checkCreditBalance = async (userId, channelCategory) => {
    try {
        const user = await User.findById(userId).select('credits');
        const cost = await getCreditCost(channelCategory, 1);

        return (user.credits || 0) >= cost;
    } catch (error) {
        console.error('Error checking credit balance:', error);
        return false;
    }
};

/**
 * Check if user has enough credits for bulk messages
 */
const checkBulkCreditBalance = async (userId, channelCategory, count) => {
    try {
        const user = await User.findById(userId).select('credits');
        const cost = await getCreditCost(channelCategory, count);

        return (user.credits || 0) >= cost;
    } catch (error) {
        console.error('Error checking bulk credit balance:', error);
        return false;
    }
};

/**
 * Get credit cost for channel
 */
const getCreditCost = async (channelCategory, count = 1) => {
    const rates = {
        meta_whatsapp: 0.01,
        baileys_whatsapp: 0.008,
        email: 0.005
    };

    return rates[channelCategory] * count || 0.01 * count;
};

/**
 * Deduct credits from user
 */
const deductCredits = async (userId, channelCategory) => {
    try {
        const cost = await getCreditCost(channelCategory, 1);
        const user = await User.findById(userId);

        if (user.credits >= cost) {
            user.credits -= cost;
            await user.save();
            console.log(`💰 Deducted ${cost} credits from user ${userId}`);
        }
    } catch (error) {
        console.error('Error deducting credits:', error);
    }
};

/**
 * Deduct credits for bulk messages
 */
const deductBulkCredits = async (userId, channelCategory, count) => {
    try {
        const cost = await getCreditCost(channelCategory, count);
        const user = await User.findById(userId);

        if (user.credits >= cost) {
            user.credits -= cost;
            await user.save();
            console.log(`💰 Deducted ${cost} credits (${count} messages) from user ${userId}`);
        }
    } catch (error) {
        console.error('Error deducting bulk credits:', error);
    }
};

/**
 * Check channel health
 */
const checkChannelHealth = async () => {
    try {
        const channels = await MessagingChannel.find({ isActive: true });

        const health = {
            total: channels.length,
            healthy: 0,
            degraded: 0,
            down: 0
        };

        // Basic health check - in production you'd test actual connectivity
        for (const channel of channels) {
            if (channel.type === 'whatsapp_api' && channel.whatsappApi?.accessToken) {
                health.healthy++;
            } else if (channel.type === 'whatsapp_bailey') {
                health.healthy++;
            } else if (channel.type === 'email_smtp' && channel.emailSmtp?.host) {
                health.healthy++;
            } else {
                health.degraded++;
            }
        }

        return health;
    } catch (error) {
        console.error('Error checking channel health:', error);
        return { total: 0, healthy: 0, degraded: 0, down: 0, error: error.message };
    }
};

module.exports = {
    // Admin settings
    getAdminSettings,
    updateAdminSettings,
    updateCreditRates,
    getCreditRates,

    // Coach settings
    getCoachSettings,
    updateCoachSettings,

    // Channels
    createChannel,
    getAvailableChannels,
    testChannel,

    // Templates
    getTemplates,
    syncMetaTemplates,

    // Message sending
    sendMessage,
    sendBulkMessages,

    // Status & tracking
    getMessageStatus,
    getMessages,

    // Analytics
    getAnalytics,

    // Credits
    getCreditBalance,
    checkCanSend,
    purchaseCredits,

    // Contacts & inbox
    getContacts,
    getInbox,

    // Worker management
    getWorkerStatus,
    restartWorker,
    getQueueStats,

    // Health
    getHealthStatus
};