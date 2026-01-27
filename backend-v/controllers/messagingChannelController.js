const MessagingChannel = require('../schema/MessagingChannel');

// @desc    Get all messaging channels
// @route   GET /api/messaging-channels
// @access  Private (Admin)
const getMessagingChannels = async (req, res) => {
    try {
        const { type, isActive, page = 1, limit = 20 } = req.query;

        const query = {};

        if (type) query.type = type;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Get total count for pagination
        const total = await MessagingChannel.countDocuments(query);

        // Get paginated results
        const channels = await MessagingChannel.find(query)
            .sort({ priority: -1, createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate({
                path: 'configuredBy',
                select: 'name email'
            });

        const totalPages = Math.ceil(total / limitNum);

        res.json({
            success: true,
            data: channels,
            pagination: {
                page: pageNum,
                pages: totalPages,
                total: total,
                limit: limitNum
            }
        });
    } catch (error) {
        console.error('Error fetching messaging channels:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messaging channels',
            error: error.message
        });
    }
};

// @desc    Get single messaging channel
// @route   GET /api/messaging-channels/:id
// @access  Private (Admin)
const getMessagingChannel = async (req, res) => {
    try {
        const channel = await MessagingChannel.findById(req.params.id)
            .populate('configuredBy', 'name email');

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Messaging channel not found'
            });
        }

        res.json({
            success: true,
            data: channel
        });
    } catch (error) {
        console.error('Error fetching messaging channel:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messaging channel',
            error: error.message
        });
    }
};

// @desc    Create messaging channel
// @route   POST /api/messaging-channels
// @access  Private (Admin)
const createMessagingChannel = async (req, res) => {
    try {
        const channelData = {
            ...req.body,
            configuredBy: req.admin.id
        };

        // Validate configuration based on type
        await validateChannelConfiguration(channelData);

        const channel = await MessagingChannel.create(channelData);

        await channel.populate('configuredBy', 'name email');

        res.status(201).json({
            success: true,
            data: channel,
            message: 'Messaging channel created successfully'
        });
    } catch (error) {
        console.error('Error creating messaging channel:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Failed to create messaging channel',
            error: error.message
        });
    }
};

// @desc    Update messaging channel
// @route   PUT /api/messaging-channels/:id
// @access  Private (Admin)
const updateMessagingChannel = async (req, res) => {
    try {
        const channelData = req.body;

        // Validate configuration based on type
        await validateChannelConfiguration(channelData, req.params.id);

        const channel = await MessagingChannel.findByIdAndUpdate(
            req.params.id,
            channelData,
            { new: true, runValidators: true }
        ).populate('configuredBy', 'name email');

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Messaging channel not found'
            });
        }

        res.json({
            success: true,
            data: channel,
            message: 'Messaging channel updated successfully'
        });
    } catch (error) {
        console.error('Error updating messaging channel:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Failed to update messaging channel',
            error: error.message
        });
    }
};

// @desc    Delete messaging channel
// @route   DELETE /api/messaging-channels/:id
// @access  Private (Admin)
const deleteMessagingChannel = async (req, res) => {
    try {
        const channel = await MessagingChannel.findById(req.params.id);

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Messaging channel not found'
            });
        }

        // Check if channel has active subscriptions or messages
        if (channel.statistics.totalMessagesSent > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete channel with existing messages. Deactivate it instead.'
            });
        }

        await MessagingChannel.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Messaging channel deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting messaging channel:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete messaging channel',
            error: error.message
        });
    }
};

// @desc    Test messaging channel configuration
// @route   POST /api/messaging-channels/:id/test
// @access  Private (Admin)
const testMessagingChannel = async (req, res) => {
    try {
        const channel = await MessagingChannel.findById(req.params.id);

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Messaging channel not found'
            });
        }

        await channel.testConfiguration();

        res.json({
            success: true,
            message: 'Channel configuration tested successfully',
            data: {
                testStatus: channel.configMetadata.testStatus,
                lastTested: channel.configMetadata.lastTested,
                testError: channel.configMetadata.testError
            }
        });
    } catch (error) {
        console.error('Error testing messaging channel:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to test messaging channel',
            error: error.message
        });
    }
};

// @desc    Toggle channel active status
// @route   PATCH /api/messaging-channels/:id/toggle
// @access  Private (Admin)
const toggleChannelStatus = async (req, res) => {
    try {
        const channel = await MessagingChannel.findById(req.params.id);

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Messaging channel not found'
            });
        }

        channel.isActive = !channel.isActive;
        await channel.save();

        res.json({
            success: true,
            data: channel,
            message: `Channel ${channel.isActive ? 'activated' : 'deactivated'} successfully`
        });
    } catch (error) {
        console.error('Error toggling channel status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle channel status',
            error: error.message
        });
    }
};

// @desc    Set channel as default for its type
// @route   PATCH /api/messaging-channels/:id/set-default
// @access  Private (Admin)
const setDefaultChannel = async (req, res) => {
    try {
        const channel = await MessagingChannel.findById(req.params.id);

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Messaging channel not found'
            });
        }

        if (!channel.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Cannot set inactive channel as default'
            });
        }

        // Set as default (pre-save middleware will handle unsetting others)
        channel.isDefault = true;
        await channel.save();

        res.json({
            success: true,
            data: channel,
            message: 'Channel set as default successfully'
        });
    } catch (error) {
        console.error('Error setting default channel:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to set default channel',
            error: error.message
        });
    }
};

// @desc    Get channel statistics
// @route   GET /api/messaging-channels/:id/stats
// @access  Private (Admin)
const getChannelStats = async (req, res) => {
    try {
        const channel = await MessagingChannel.findById(req.params.id);

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Messaging channel not found'
            });
        }

        res.json({
            success: true,
            data: channel.statistics
        });
    } catch (error) {
        console.error('Error fetching channel stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch channel statistics',
            error: error.message
        });
    }
};

// @desc    Get active channels by type
// @route   GET /api/messaging-channels/active/:type
// @access  Private (Admin)
const getActiveChannelsByType = async (req, res) => {
    try {
        const { type } = req.params;
        const channels = await MessagingChannel.getActiveChannels(type);

        res.json({
            success: true,
            data: channels
        });
    } catch (error) {
        console.error('Error fetching active channels:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch active channels',
            error: error.message
        });
    }
};

// @desc    Get default channel for type
// @route   GET /api/messaging-channels/default/:type
// @access  Private (Admin)
const getDefaultChannel = async (req, res) => {
    try {
        const { type } = req.params;
        const channel = await MessagingChannel.getDefaultChannel(type);

        res.json({
            success: true,
            data: channel
        });
    } catch (error) {
        console.error('Error fetching default channel:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch default channel',
            error: error.message
        });
    }
};

// Helper function to validate channel configuration
const validateChannelConfiguration = async (channelData, existingId = null) => {
    const { type } = channelData;

    // Check for unique constraints
    if (type === 'whatsapp_api' && channelData.whatsappApi?.phoneNumberId) {
        const existing = await MessagingChannel.findOne({
            'whatsappApi.phoneNumberId': channelData.whatsappApi.phoneNumberId,
            _id: { $ne: existingId }
        });
        if (existing) {
            const error = new Error('Phone Number ID already exists');
            error.status = 400;
            throw error;
        }
    }

    if (type === 'whatsapp_bailey' && channelData.whatsappBailey?.deviceId) {
        const existing = await MessagingChannel.findOne({
            'whatsappBailey.deviceId': channelData.whatsappBailey.deviceId,
            _id: { $ne: existingId }
        });
        if (existing) {
            const error = new Error('Device ID already exists');
            error.status = 400;
            throw error;
        }
    }

    if (type === 'email_smtp' && channelData.emailSmtp?.auth?.user) {
        const existing = await MessagingChannel.findOne({
            'emailSmtp.auth.user': channelData.emailSmtp.auth.user,
            _id: { $ne: existingId }
        });
        if (existing) {
            const error = new Error('Email address already configured');
            error.status = 400;
            throw error;
        }
    }

    // Validate required fields based on type
    if (type === 'whatsapp_api') {
        const { phoneNumberId, accessToken, businessAccountId } = channelData.whatsappApi || {};
        if (!phoneNumberId || !accessToken || !businessAccountId) {
            const error = new Error('Missing required WhatsApp API configuration fields');
            error.status = 400;
            throw error;
        }
    }

    if (type === 'whatsapp_bailey') {
        const { deviceId } = channelData.whatsappBailey || {};
        if (!deviceId) {
            const error = new Error('Missing required Bailey WhatsApp configuration fields');
            error.status = 400;
            throw error;
        }
    }

    if (type === 'email_smtp') {
        const { host, port, auth, fromEmail } = channelData.emailSmtp || {};
        if (!host || !port || !auth?.user || !auth?.pass || !fromEmail) {
            const error = new Error('Missing required Email SMTP configuration fields');
            error.status = 400;
            throw error;
        }
    }
};

// ===== BAILEY'S WHATSAPP CONTROLLERS =====
// Bailey's WhatsApp functionality has been moved to controllers/baileysController.js
// and routes/baileysRoutes.js for better organization and robustness

module.exports = {
    getMessagingChannels,
    getMessagingChannel,
    createMessagingChannel,
    updateMessagingChannel,
    deleteMessagingChannel,
    testMessagingChannel,
    toggleChannelStatus,
    setDefaultChannel,
    getChannelStats,
    getActiveChannelsByType,
    getDefaultChannel
};