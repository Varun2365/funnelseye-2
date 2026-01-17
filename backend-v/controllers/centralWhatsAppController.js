const asyncHandler = require('../middleware/async');
const CentralWhatsApp = require('../schema/CentralWhatsApp');
const centralWhatsAppService = require('../services/centralWhatsAppService');
const WhatsAppCredit = require('../schema/WhatsAppCredit');
const WhatsAppMessage = require('../schema/WhatsAppMessage');
const logger = require('../utils/logger');

// Helper function to create and track WhatsApp message
const createWhatsAppMessage = async (messageData) => {
    try {
        const message = new WhatsAppMessage(messageData);
        await message.save();
        return message;
    } catch (error) {
        console.error('Error creating WhatsApp message record:', error);
        throw error;
    }
};

// Helper function to update message status
const updateMessageStatus = async (messageId, status, errorCode = null, errorMessage = null) => {
    try {
        const message = await WhatsAppMessage.findOne({ messageId });
        if (message) {
            if (status === 'failed') {
                await message.markAsFailed(errorCode, errorMessage);
            } else {
                message.status = status;
                await message.save();
            }
        }
    } catch (error) {
        console.error('Error updating message status:', error);
    }
};

// @desc    Setup Central WhatsApp Configuration
// @route   POST /api/admin/central-whatsapp/setup
// @access  Private (Admin)
exports.setupCentralWhatsApp = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] setupCentralWhatsApp - Starting...');
        
        const {
            phoneNumberId,
            accessToken,
            businessAccountId
        } = req.body;
        
        // Validate required fields (only essential Meta API fields)
        if (!phoneNumberId || !accessToken || !businessAccountId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: phoneNumberId, accessToken, businessAccountId'
            });
        }
        
        // Check if central WhatsApp already exists
        const existingConfig = await CentralWhatsApp.findOne({ isActive: true });
        const isUpdate = existingConfig !== null;
        
        // Test the configuration by making a direct API call
        try {
            const axios = require('axios');
            const testUrl = `https://graph.facebook.com/v23.0/${phoneNumberId}`;
            const testResponse = await axios.get(testUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ [CENTRAL_WHATSAPP] Configuration test successful');
        } catch (testError) {
            console.error('❌ [CENTRAL_WHATSAPP] Configuration test failed:', testError.message);
            return res.status(400).json({
                success: false,
                message: 'Invalid WhatsApp Business API credentials. Please check your phoneNumberId and accessToken.',
                error: testError.response?.data?.error?.message || testError.message
            });
        }
        
        let centralWhatsApp;
        
        if (isUpdate) {
            // Update existing configuration
            centralWhatsApp = existingConfig;
            centralWhatsApp.phoneNumberId = phoneNumberId;
            centralWhatsApp.accessToken = accessToken;
            centralWhatsApp.businessAccountId = businessAccountId;
            centralWhatsApp.updatedBy = req.admin.id;
            centralWhatsApp.updatedAt = new Date();

            await centralWhatsApp.save();
            console.log('✅ [CENTRAL_WHATSAPP] Configuration updated successfully');
        } else {
            // Create new configuration
            centralWhatsApp = new CentralWhatsApp({
                phoneNumberId,
                accessToken,
                businessAccountId,
                isActive: true,
                isDefault: true,
                configuredBy: req.admin.id
            });

            await centralWhatsApp.save();
            console.log('✅ [CENTRAL_WHATSAPP] Configuration created successfully');
        }
        
        // Initialize the service with new/updated config
        await centralWhatsAppService.initialize();
        
        // Sync templates from Meta asynchronously (non-blocking)
        setImmediate(async () => {
            try {
                await centralWhatsAppService.syncTemplates();
                console.log('✅ [CENTRAL_WHATSAPP] Templates synced successfully');
            } catch (syncError) {
                console.warn('⚠️ [CENTRAL_WHATSAPP] Template sync failed:', syncError.message);
            }
        });
        
        console.log('✅ [CENTRAL_WHATSAPP] setupCentralWhatsApp - Success');
        res.status(isUpdate ? 200 : 201).json({
            success: true,
            message: isUpdate ? 'Central WhatsApp configuration updated successfully' : 'Central WhatsApp configured successfully',
            data: {
                id: centralWhatsApp._id,
                phoneNumberId: centralWhatsApp.phoneNumberId,
                isActive: centralWhatsApp.isActive,
                templatesCount: centralWhatsApp.templates.length,
                contactsCount: centralWhatsApp.contacts.length,
                configuredAt: centralWhatsApp.createdAt,
                updatedAt: centralWhatsApp.updatedAt,
                configuredBy: centralWhatsApp.configuredBy,
                updatedBy: centralWhatsApp.updatedBy,
                isUpdate: isUpdate
            }
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] setupCentralWhatsApp - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to setup Central WhatsApp',
            error: error.message
        });
    }
});

// @desc    Get Central WhatsApp Configuration
// @route   GET /api/admin/central-whatsapp/config
// @access  Private (Admin)
exports.getCentralWhatsAppConfig = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] getCentralWhatsAppConfig - Starting...');
        
        const config = await CentralWhatsApp.findOne({ isActive: true })
            .select('-accessToken') // Don't expose access token
            .populate('configuredBy', 'name email');
        
        if (!config) {
            return res.status(404).json({
                success: false,
                message: 'Central WhatsApp not configured'
            });
        }
        
        console.log('✅ [CENTRAL_WHATSAPP] getCentralWhatsAppConfig - Success');
        res.status(200).json({
            success: true,
            data: config
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] getCentralWhatsAppConfig - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get Central WhatsApp configuration',
            error: error.message
        });
    }
});

// @desc    Update Central WhatsApp Configuration
// @route   PUT /api/admin/central-whatsapp/config
// @access  Private (Admin)
exports.updateCentralWhatsAppConfig = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] updateCentralWhatsAppConfig - Starting...');
        
        const {
            dailyLimit,
            monthlyLimit
        } = req.body;
        
        const config = await CentralWhatsApp.findOne({ isActive: true });
        if (!config) {
            return res.status(404).json({
                success: false,
                message: 'Central WhatsApp not configured'
            });
        }
        
        // Update fields (only statistics limits - business info managed by Meta)
        if (dailyLimit) config.statistics.dailyLimit = dailyLimit;
        if (monthlyLimit) config.statistics.monthlyLimit = monthlyLimit;
        
        await config.save();
        
        console.log('✅ [CENTRAL_WHATSAPP] updateCentralWhatsAppConfig - Success');
        res.status(200).json({
            success: true,
            message: 'Central WhatsApp configuration updated successfully',
            data: config
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] updateCentralWhatsAppConfig - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update Central WhatsApp configuration',
            error: error.message
        });
    }
});

// @desc    Create WhatsApp Template
// @route   POST /api/admin/central-whatsapp/templates
// @access  Private (Admin)
exports.createTemplate = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] createTemplate - Starting...');
        
        const { name, category, language, components } = req.body;
        
        // Validate required fields
        if (!name || !category || !components) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, category, components'
            });
        }
        
        // Validate category
        const validCategories = ['AUTHENTICATION', 'MARKETING', 'UTILITY', 'OTP'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
            });
        }
        
        const result = await centralWhatsAppService.createTemplate({
            name,
            category,
            language: language || 'en',
            components
        });
        
        console.log('✅ [CENTRAL_WHATSAPP] createTemplate - Success');
        res.status(201).json({
            success: true,
            message: 'Template created successfully and submitted for approval',
            data: result
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] createTemplate - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create template',
            error: error.response?.data?.error?.message || error.message
        });
    }
});

// @desc    Get All Templates
// @route   GET /api/admin/central-whatsapp/templates
// @access  Private (Admin)
exports.getTemplates = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] getTemplates - Starting...');
        
        const result = await centralWhatsAppService.getTemplates();
        
        console.log('✅ [CENTRAL_WHATSAPP] getTemplates - Success');
        res.status(200).json({
            success: true,
            message: 'Templates retrieved successfully',
            data: {
                templates: result.templates || [],
                approvedTemplates: result.approvedTemplates || [],
                summary: result.summary || {},
                total: result.total || 0,
                approved: result.approved || 0
            }
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] getTemplates - Error:', error);
        
        // Handle specific error types
        if (error.code === 'TOKEN_EXPIRED') {
            res.status(401).json({
                success: false,
                message: 'WhatsApp access token has expired. Please reconfigure your WhatsApp settings.',
                error: error.message,
                errorCode: 'TOKEN_EXPIRED',
                action: 'reconfigure'
            });
        } else if (error.code === 'OAUTH_ERROR') {
            res.status(401).json({
                success: false,
                message: 'WhatsApp authentication failed. Please check your credentials.',
                error: error.message,
                errorCode: 'OAUTH_ERROR',
                action: 'reconfigure'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to get templates',
                error: error.message
            });
        }
    }
});

// @desc    Sync Templates from Meta
// @route   POST /api/admin/central-whatsapp/templates/sync
// @access  Private (Admin)
exports.syncTemplates = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] syncTemplates - Starting...');
        
        const result = await centralWhatsAppService.syncTemplates();
        
        console.log('✅ [CENTRAL_WHATSAPP] syncTemplates - Success');
        res.status(200).json({
            success: true,
            message: 'Templates synced successfully',
            data: result
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] syncTemplates - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to sync templates',
            error: error.message
        });
    }
});

// @desc    Get Contacts
// @route   GET /api/admin/central-whatsapp/contacts
// @access  Private (Admin)
exports.getContacts = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] getContacts - Starting...');
        
        const { limit = 100, offset = 0 } = req.query;
        
        const result = await centralWhatsAppService.getContacts(
            parseInt(limit),
            parseInt(offset)
        );
        
        console.log('✅ [CENTRAL_WHATSAPP] getContacts - Success');
        res.status(200).json({
            success: true,
            data: {
                contacts: result.contacts,
                total: result.total,
                limit: result.limit,
                offset: result.offset
            }
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] getContacts - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get contacts',
            error: error.message
        });
    }
});

// @desc    Health Check
// @route   GET /api/admin/central-whatsapp/health
// @access  Private (Admin)
exports.healthCheck = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] healthCheck - Starting...');
        
        const result = await centralWhatsAppService.healthCheck();
        
        console.log('✅ [CENTRAL_WHATSAPP] healthCheck - Success');
        res.status(200).json({
            success: true,
            data: result
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] healthCheck - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Health check failed',
            error: error.message
        });
    }
});

// @desc    Send Test Message
// @route   POST /api/admin/central-whatsapp/test-message
// @access  Private (Admin)
exports.sendTestMessage = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] sendTestMessage - Starting...');
        
        const { to, message, templateName, parameters } = req.body;
        
        if (!to) {
            return res.status(400).json({
                success: false,
                message: 'Recipient phone number is required'
            });
        }
        
        let result;
        if (templateName) {
            // Send template message
            result = await centralWhatsAppService.sendTemplateMessage(
                to,
                templateName,
                'en_US',
                parameters || []
            );
        } else if (message) {
            // Send text message
            result = await centralWhatsAppService.sendTextMessage(to, message);
        } else {
            return res.status(400).json({
                success: false,
                message: 'Either message or templateName is required'
            });
        }
        
        console.log('✅ [CENTRAL_WHATSAPP] sendTestMessage - Success');
        res.status(200).json({
            success: true,
            message: 'Test message sent successfully',
            data: result
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] sendTestMessage - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send test message',
            error: error.response?.data?.error?.message || error.message
        });
    }
});

// @desc    Update Contact Name
// @route   PUT /api/whatsapp/v1/contacts/update
// @access  Private (Admin)
exports.updateContact = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] updateContact - Starting...');
        
        const { phoneNumber, name } = req.body;
        
        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
        }
        
        const result = await centralWhatsAppService.updateContact(phoneNumber, name);
        
        console.log('✅ [CENTRAL_WHATSAPP] updateContact - Success');
        res.status(200).json({
            success: true,
            message: 'Contact updated successfully',
            data: result
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] updateContact - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update contact',
            error: error.message
        });
    }
});

// @desc    Send Bulk Messages
// @route   POST /api/whatsapp/v1/send-bulk-messages
// @access  Private (Admin)
exports.sendBulkMessages = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] sendBulkMessages - Starting...');
        
        const { contacts, message, templateName, parameters, mediaUrl, mediaType } = req.body;
        
        if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Contacts array is required and must not be empty'
            });
        }
        
        // Validate message content based on type
        if (templateName && templateName.trim()) {
            // Template message - parameters are optional but template name is required
            console.log('📝 [CENTRAL_WHATSAPP] Sending bulk template messages');
        } else if (mediaUrl && mediaUrl.trim()) {
            // Media message - mediaUrl is required
            console.log('📷 [CENTRAL_WHATSAPP] Sending bulk media messages');
        } else {
            // Text message - message is required
            if (!message || !message.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Message is required for text messages'
                });
            }
            console.log('💬 [CENTRAL_WHATSAPP] Sending bulk text messages');
        }
        
        const result = await centralWhatsAppService.sendBulkMessages(contacts, message, templateName, parameters, mediaUrl, mediaType);
        
        console.log('✅ [CENTRAL_WHATSAPP] sendBulkMessages - Success');
        res.status(200).json({
            success: true,
            message: `Bulk messages sent successfully to ${result.sentCount} contacts`,
            data: result
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] sendBulkMessages - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send bulk messages',
            error: error.message
        });
    }
});

// ===== MESSAGE MANAGEMENT METHODS =====

// @desc    Get All WhatsApp Messages
// @route   GET /api/admin/central-whatsapp/messages
// @access  Private (Admin)
exports.getAllMessages = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] getAllMessages - Starting...');
        
        const { 
            limit = 50, 
            offset = 0, 
            status, 
            messageType, 
            senderType,
            startDate,
            endDate,
            search
        } = req.query;
        
        // Build filter object
        const filter = {};
        
        if (status) filter.status = status;
        if (messageType) filter.messageType = messageType;
        if (senderType) filter.senderType = senderType;
        
        if (startDate || endDate) {
            filter.sentAt = {};
            if (startDate) filter.sentAt.$gte = new Date(startDate);
            if (endDate) filter.sentAt.$lte = new Date(endDate);
        }
        
        if (search) {
            filter.$or = [
                { recipientPhone: { $regex: search, $options: 'i' } },
                { 'content.text': { $regex: search, $options: 'i' } },
                { 'content.templateName': { $regex: search, $options: 'i' } }
            ];
        }
        
        const messages = await WhatsAppMessage.find(filter)
            .sort({ sentAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(offset))
            .populate('senderId', 'name email')
            .populate('leadId', 'name email phone')
            .populate('clientId', 'name email phone')
            .populate('automationRuleId', 'name');
        
        const total = await WhatsAppMessage.countDocuments(filter);
        
        console.log('✅ [CENTRAL_WHATSAPP] getAllMessages - Success');
        res.status(200).json({
            success: true,
            data: {
                messages,
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: (parseInt(offset) + parseInt(limit)) < total
            }
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] getAllMessages - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get messages',
            error: error.message
        });
    }
});

// @desc    Get Conversation Messages
// @route   GET /api/admin/central-whatsapp/messages/conversation/:conversationId
// @access  Private (Admin)
exports.getConversationMessages = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] getConversationMessages - Starting...');
        
        const { conversationId } = req.params;
        const { limit = 50, offset = 0 } = req.query;
        
        const result = await WhatsAppMessage.getConversation(conversationId, parseInt(limit), parseInt(offset));
        const total = await WhatsAppMessage.countDocuments({ conversationId });
        
        console.log('✅ [CENTRAL_WHATSAPP] getConversationMessages - Success');
        res.status(200).json({
            success: true,
            data: {
                messages: result,
                total,
                conversationId,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] getConversationMessages - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get conversation messages',
            error: error.message
        });
    }
});

// @desc    Get Messages by Coach
// @route   GET /api/admin/central-whatsapp/messages/coach/:coachId
// @access  Private (Admin)
exports.getMessagesByCoach = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] getMessagesByCoach - Starting...');
        
        const { coachId } = req.params;
        const { limit = 50, offset = 0 } = req.query;
        
        const result = await WhatsAppMessage.getMessagesByCoach(coachId, parseInt(limit), parseInt(offset));
        const total = await WhatsAppMessage.countDocuments({ senderId: coachId });
        
        console.log('✅ [CENTRAL_WHATSAPP] getMessagesByCoach - Success');
        res.status(200).json({
            success: true,
            data: {
                messages: result,
                total,
                coachId,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] getMessagesByCoach - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get coach messages',
            error: error.message
        });
    }
});

// @desc    Get Messages by Lead
// @route   GET /api/admin/central-whatsapp/messages/lead/:leadId
// @access  Private (Admin)
exports.getMessagesByLead = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] getMessagesByLead - Starting...');
        
        const { leadId } = req.params;
        const { limit = 50, offset = 0 } = req.query;
        
        const result = await WhatsAppMessage.getMessagesByLead(leadId, parseInt(limit), parseInt(offset));
        const total = await WhatsAppMessage.countDocuments({ leadId });
        
        console.log('✅ [CENTRAL_WHATSAPP] getMessagesByLead - Success');
        res.status(200).json({
            success: true,
            data: {
                messages: result,
                total,
                leadId,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] getMessagesByLead - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get lead messages',
            error: error.message
        });
    }
});

// @desc    Send Message as Admin
// @route   POST /api/admin/central-whatsapp/send-message
// @access  Private (Admin)
exports.sendAdminMessage = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] sendAdminMessage - Starting...');
        
        const adminId = req.admin.id;
        const { to, message, templateName, parameters, mediaUrl, mediaType, leadId, clientId } = req.body;
        
        // Validate required fields
        if (!to) {
            return res.status(400).json({
                success: false,
                message: 'Recipient phone number is required'
            });
        }
        
        if (!message && !templateName && !mediaUrl) {
            return res.status(400).json({
                success: false,
                message: 'Either message, templateName, or mediaUrl is required'
            });
        }
        
        // Initialize central WhatsApp service
        await centralWhatsAppService.initialize();
        
        // Create conversation ID
        const conversationId = WhatsAppMessage.createConversationId(adminId, to);
        
        // Prepare message data for tracking
        let messageData = {
            messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            wamid: '', // Will be updated after sending
            senderId: adminId,
            senderType: 'admin',
            recipientPhone: to,
            conversationId,
            creditsUsed: 0, // Admin messages don't use credits
            leadId: leadId || null,
            clientId: clientId || null
        };
        
        let result;
        
        if (templateName) {
            // Send template message
            result = await centralWhatsAppService.sendTemplateMessage(
                to,
                templateName,
                'en_US',
                parameters || [],
                adminId
            );
            
            messageData.messageType = 'template';
            messageData.content = {
                templateName,
                templateParameters: parameters || []
            };
        } else if (mediaUrl) {
            // Send media message
            result = await centralWhatsAppService.sendMediaMessage(
                to,
                mediaType || 'image',
                mediaUrl,
                message || null,
                adminId
            );
            
            messageData.messageType = 'media';
            messageData.content = {
                mediaUrl,
                mediaType: mediaType || 'image',
                caption: message || null
            };
        } else {
            // Send plain text message
            result = await centralWhatsAppService.sendTextMessage(to, message, adminId);
            
            messageData.messageType = 'text';
            messageData.content = {
                text: message
            };
        }
        
        // Update message data with result
        messageData.wamid = result.messageId || result.id;
        messageData.status = 'sent';
        
        // Create message record
        const messageRecord = await createWhatsAppMessage(messageData);
        
        console.log('✅ [CENTRAL_WHATSAPP] sendAdminMessage - Success');
        res.status(200).json({
            success: true,
            message: 'Message sent successfully',
            data: {
                messageId: result.messageId,
                wamid: result.messageId || result.id,
                recordId: messageRecord._id,
                recipient: result.recipient,
                status: result.status,
                conversationId: conversationId
            }
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] sendAdminMessage - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.response?.data?.error?.message || error.message
        });
    }
});

// @desc    Test WhatsApp Configuration
// @route   GET /api/whatsapp/v1/test-config
// @access  Private (Admin)
exports.testConfiguration = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] testConfiguration - Starting...');
        
        const result = await centralWhatsAppService.healthCheck();
        
        console.log('✅ [CENTRAL_WHATSAPP] testConfiguration - Success');
        res.status(200).json({
            success: true,
            message: 'WhatsApp configuration is working properly',
            data: result
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] testConfiguration - Error:', error);
        
        // Handle specific error types
        if (error.code === 'TOKEN_EXPIRED') {
            res.status(401).json({
                success: false,
                message: 'WhatsApp access token has expired. Please reconfigure your WhatsApp settings.',
                error: error.message,
                errorCode: 'TOKEN_EXPIRED',
                action: 'reconfigure'
            });
        } else if (error.code === 'OAUTH_ERROR') {
            res.status(401).json({
                success: false,
                message: 'WhatsApp authentication failed. Please check your credentials.',
                error: error.message,
                errorCode: 'OAUTH_ERROR',
                action: 'reconfigure'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'WhatsApp configuration test failed',
                error: error.message
            });
        }
    }
});

// @desc    Get WhatsApp Analytics
// @route   GET /api/admin/central-whatsapp/analytics
// @access  Private (Admin)
exports.getWhatsAppAnalytics = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] getWhatsAppAnalytics - Starting...');
        
        const { startDate, endDate } = req.query;
        
        // Build date filter
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.sentAt = {};
            if (startDate) dateFilter.sentAt.$gte = new Date(startDate);
            if (endDate) dateFilter.sentAt.$lte = new Date(endDate);
        }
        
        // Get message statistics
        const totalMessages = await WhatsAppMessage.countDocuments(dateFilter);
        const sentMessages = await WhatsAppMessage.countDocuments({ ...dateFilter, status: 'sent' });
        const deliveredMessages = await WhatsAppMessage.countDocuments({ ...dateFilter, status: 'delivered' });
        const readMessages = await WhatsAppMessage.countDocuments({ ...dateFilter, status: 'read' });
        const failedMessages = await WhatsAppMessage.countDocuments({ ...dateFilter, status: 'failed' });
        
        // Get message type breakdown
        const messageTypeStats = await WhatsAppMessage.aggregate([
            { $match: dateFilter },
            { $group: { _id: '$messageType', count: { $sum: 1 } } }
        ]);
        
        // Get sender type breakdown
        const senderTypeStats = await WhatsAppMessage.aggregate([
            { $match: dateFilter },
            { $group: { _id: '$senderType', count: { $sum: 1 } } }
        ]);
        
        // Get daily message count for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const dailyStats = await WhatsAppMessage.aggregate([
            {
                $match: {
                    sentAt: { $gte: thirtyDaysAgo },
                    ...dateFilter
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$sentAt' },
                        month: { $month: '$sentAt' },
                        day: { $dayOfMonth: '$sentAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);
        
        // Get top templates
        const topTemplates = await WhatsAppMessage.aggregate([
            { $match: { ...dateFilter, messageType: 'template' } },
            { $group: { _id: '$content.templateName', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        
        // Get total credits used
        const totalCreditsUsed = await WhatsAppMessage.aggregate([
            { $match: dateFilter },
            { $group: { _id: null, totalCredits: { $sum: '$creditsUsed' } } }
        ]);
        
        console.log('✅ [CENTRAL_WHATSAPP] getWhatsAppAnalytics - Success');
        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalMessages,
                    sentMessages,
                    deliveredMessages,
                    readMessages,
                    failedMessages,
                    deliveryRate: totalMessages > 0 ? ((deliveredMessages / totalMessages) * 100).toFixed(2) : 0,
                    readRate: deliveredMessages > 0 ? ((readMessages / deliveredMessages) * 100).toFixed(2) : 0
                },
                messageTypeBreakdown: messageTypeStats,
                senderTypeBreakdown: senderTypeStats,
                dailyStats,
                topTemplates,
                totalCreditsUsed: totalCreditsUsed[0]?.totalCredits || 0
            }
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] getWhatsAppAnalytics - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get analytics',
            error: error.message
        });
    }
});

// ===== COACH WHATSAPP METHODS =====

// @desc    Send WhatsApp Message (Coach)
// @route   POST /api/centralwhatsapp/send-message
// @access  Private (Coach)
exports.sendCoachMessage = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] sendCoachMessage - Starting...');
        
        const coachId = req.user.id;
        const { to, message, templateName, parameters, mediaUrl, mediaType } = req.body;
        
        // Validate required fields
        if (!to) {
            return res.status(400).json({
                success: false,
                message: 'Recipient phone number is required'
            });
        }
        
        if (!message && !templateName && !mediaUrl) {
            return res.status(400).json({
                success: false,
                message: 'Either message, templateName, or mediaUrl is required'
            });
        }
        
        // Check credits before sending message
        const credits = await WhatsAppCredit.getOrCreateCredits(coachId);
        if (!credits.canSendMessage()) {
            return res.status(402).json({
                success: false,
                message: 'Insufficient credits to send messages',
                data: {
                    balance: credits.balance,
                    status: credits.status,
                    required: 1,
                    suggestion: 'Please purchase more credits to continue sending messages'
                }
            });
        }
        
        // Initialize central WhatsApp service
        await centralWhatsAppService.initialize();
        
        // Create conversation ID
        const conversationId = WhatsAppMessage.createConversationId(coachId, to);
        
        // Prepare message data for tracking
        let messageData = {
            messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            wamid: '', // Will be updated after sending
            senderId: coachId,
            senderType: 'coach',
            recipientPhone: to,
            conversationId,
            creditsUsed: 1
        };
        
        let result;
        
        if (templateName) {
            // Send template message
            result = await centralWhatsAppService.sendTemplateMessage(
                to,
                templateName,
                'en_US',
                parameters || [],
                coachId
            );
            
            messageData.messageType = 'template';
            messageData.content = {
                templateName,
                templateParameters: parameters || []
            };
        } else if (mediaUrl) {
            // Send media message
            result = await centralWhatsAppService.sendMediaMessage(
                to,
                mediaType || 'image',
                mediaUrl,
                message || null,
                coachId
            );
            
            messageData.messageType = 'media';
            messageData.content = {
                mediaUrl,
                mediaType: mediaType || 'image',
                caption: message || null
            };
        } else {
            // Send plain text message
            result = await centralWhatsAppService.sendTextMessage(to, message, coachId);
            
            messageData.messageType = 'text';
            messageData.content = {
                text: message
            };
        }
        
        // Update message data with result
        messageData.wamid = result.messageId || result.id;
        messageData.status = 'sent';
        
        // Create message record
        const messageRecord = await createWhatsAppMessage(messageData);
        
        // Deduct credits after successful send
        await credits.deductCredits(1, 'WhatsApp message sent via Central WhatsApp');
        
        console.log('✅ [CENTRAL_WHATSAPP] sendCoachMessage - Success');
        res.status(200).json({
            success: true,
            message: 'Message sent successfully',
            data: {
                messageId: result.messageId,
                wamid: result.messageId || result.id,
                recordId: messageRecord._id,
                recipient: result.recipient,
                status: result.status,
                creditsUsed: 1,
                remainingCredits: credits.balance - 1,
                conversationId: conversationId
            }
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] sendCoachMessage - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.response?.data?.error?.message || error.message
        });
    }
});

// @desc    Get Available Templates (Coach)
// @route   GET /api/centralwhatsapp/templates
// @access  Private (Coach)
exports.getCoachTemplates = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] getCoachTemplates - Starting...');
        
        const result = await centralWhatsAppService.getTemplates();
        
        // Filter only approved templates for coaches
        const approvedTemplates = result.templates.filter(template => 
            template.status === 'APPROVED'
        );
        
        console.log('✅ [CENTRAL_WHATSAPP] getCoachTemplates - Success');
        res.status(200).json({
            success: true,
            data: approvedTemplates
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] getCoachTemplates - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get templates',
            error: error.message
        });
    }
});

// @desc    Get Coach's Contacts
// @route   GET /api/centralwhatsapp/contacts
// @access  Private (Coach)
exports.getCoachContacts = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] getCoachContacts - Starting...');
        
        const { limit = 50, offset = 0, search } = req.query;
        
        const result = await centralWhatsAppService.getContacts(
            parseInt(limit),
            parseInt(offset)
        );
        
        // Filter contacts based on search if provided
        let filteredContacts = result.contacts;
        if (search) {
            const searchLower = search.toLowerCase();
            filteredContacts = result.contacts.filter(contact => 
                contact.phoneNumber.includes(search) ||
                (contact.name && contact.name.toLowerCase().includes(searchLower)) ||
                (contact.profileName && contact.profileName.toLowerCase().includes(searchLower))
            );
        }
        
        console.log('✅ [CENTRAL_WHATSAPP] getCoachContacts - Success');
        res.status(200).json({
            success: true,
            data: {
                contacts: filteredContacts,
                total: result.total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                search: search || null
            }
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] getCoachContacts - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get contacts',
            error: error.message
        });
    }
});

// @desc    Get Central WhatsApp Status (Coach)
// @route   GET /api/centralwhatsapp/status
// @access  Private (Coach)
exports.getCoachStatus = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] getCoachStatus - Starting...');
        
        const coachId = req.user.id;
        
        // Get coach's credit status
        const credits = await WhatsAppCredit.getOrCreateCredits(coachId);
        
        // Get central WhatsApp health status
        const healthStatus = await centralWhatsAppService.healthCheck();
        
        // Get basic config info
        const config = await CentralWhatsApp.findOne({ isActive: true })
            .select('phoneNumberId statistics templates contacts');
        
        console.log('✅ [CENTRAL_WHATSAPP] getCoachStatus - Success');
        res.status(200).json({
            success: true,
            data: {
                centralWhatsApp: {
                    isActive: healthStatus.success,
                    phoneNumberId: config?.phoneNumberId || 'Not configured',
                    status: healthStatus.status,
                    templatesCount: config?.templates?.length || 0,
                    contactsCount: config?.contacts?.length || 0
                },
                credits: {
                    balance: credits.balance,
                    status: credits.status,
                    canSendMessage: credits.canSendMessage()
                },
                limits: {
                    dailyLimit: config?.statistics?.dailyLimit || 1000,
                    monthlyLimit: config?.statistics?.monthlyLimit || 25000
                }
            }
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] getCoachStatus - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get status',
            error: error.message
        });
    }
});

// ===== ADMIN CREDIT & SETTINGS MANAGEMENT =====

// @desc    Get Credit Rates and Settings
// @route   GET /api/admin/central-whatsapp/credit-settings
// @access  Private (Admin)
exports.getCreditSettings = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] getCreditSettings - Starting...');
        
        const AdminSystemSettings = require('../schema/AdminSystemSettings');
        const settings = await AdminSystemSettings.findOne({ settingId: 'global' })
            .select('whatsApp');
        
        if (!settings || !settings.whatsApp) {
            return res.status(404).json({
                success: false,
                message: 'WhatsApp settings not found'
            });
        }
        
        console.log('✅ [CENTRAL_WHATSAPP] getCreditSettings - Success');
        res.status(200).json({
            success: true,
            data: {
                creditPrice: settings.whatsApp.creditPrice || 0.01,
                autoRecharge: settings.whatsApp.autoRecharge || false,
                rechargeThreshold: settings.whatsApp.rechargeThreshold || 10,
                rechargeAmount: settings.whatsApp.rechargeAmount || 100,
                isEnabled: settings.whatsApp.isEnabled || false,
                webhookVerifyToken: settings.whatsApp.webhookVerifyToken || '',
                webhookUrl: settings.whatsApp.webhookUrl || ''
            }
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] getCreditSettings - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get credit settings',
            error: error.message
        });
    }
});

// @desc    Update Credit Rates and Settings
// @route   PUT /api/admin/central-whatsapp/credit-settings
// @access  Private (Admin)
exports.updateCreditSettings = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] updateCreditSettings - Starting...');
        
        const {
            creditPrice,
            autoRecharge,
            rechargeThreshold,
            rechargeAmount,
            isEnabled,
            webhookVerifyToken,
            webhookUrl
        } = req.body;
        
        const AdminSystemSettings = require('../schema/AdminSystemSettings');
        
        // Build update object
        const updateData = {};
        if (creditPrice !== undefined) updateData['whatsApp.creditPrice'] = creditPrice;
        if (autoRecharge !== undefined) updateData['whatsApp.autoRecharge'] = autoRecharge;
        if (rechargeThreshold !== undefined) updateData['whatsApp.rechargeThreshold'] = rechargeThreshold;
        if (rechargeAmount !== undefined) updateData['whatsApp.rechargeAmount'] = rechargeAmount;
        if (isEnabled !== undefined) updateData['whatsApp.isEnabled'] = isEnabled;
        if (webhookVerifyToken !== undefined) updateData['whatsApp.webhookVerifyToken'] = webhookVerifyToken;
        if (webhookUrl !== undefined) updateData['whatsApp.webhookUrl'] = webhookUrl;
        
        // Update settings
        const settings = await AdminSystemSettings.findOneAndUpdate(
            { settingId: 'global' },
            { $set: updateData },
            { new: true, upsert: true }
        ).select('whatsApp');
        
        console.log('✅ [CENTRAL_WHATSAPP] updateCreditSettings - Success');
        res.status(200).json({
            success: true,
            message: 'Credit settings updated successfully',
            data: {
                creditPrice: settings.whatsApp.creditPrice,
                autoRecharge: settings.whatsApp.autoRecharge,
                rechargeThreshold: settings.whatsApp.rechargeThreshold,
                rechargeAmount: settings.whatsApp.rechargeAmount,
                isEnabled: settings.whatsApp.isEnabled,
                webhookVerifyToken: settings.whatsApp.webhookVerifyToken,
                webhookUrl: settings.whatsApp.webhookUrl
            }
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] updateCreditSettings - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update credit settings',
            error: error.message
        });
    }
});

// @desc    Get Complete Admin Settings Overview
// @route   GET /api/admin/central-whatsapp/settings-overview
// @access  Private (Admin)
exports.getSettingsOverview = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] getSettingsOverview - Starting...');
        
        // Get Central WhatsApp Config
        const config = await CentralWhatsApp.findOne({ isActive: true })
            .select('-accessToken')
            .populate('configuredBy', 'name email');
        
        // Get Admin System Settings
        const AdminSystemSettings = require('../schema/AdminSystemSettings');
        const adminSettings = await AdminSystemSettings.findOne({ settingId: 'global' })
            .select('whatsApp');
        
        // Get total credits across all coaches
        const totalCredits = await WhatsAppCredit.aggregate([
            { $group: { _id: null, totalBalance: { $sum: '$balance' } } }
        ]);
        
        // Get total coaches using WhatsApp (count all coaches with credit accounts)
        const totalCoaches = await WhatsAppCredit.countDocuments();
        
        // Get message statistics
        const totalMessages = await WhatsAppMessage.countDocuments();
        const todayMessages = await WhatsAppMessage.countDocuments({
            sentAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        });
        
        console.log('✅ [CENTRAL_WHATSAPP] getSettingsOverview - Success');
        res.status(200).json({
            success: true,
            data: {
                centralWhatsApp: config ? {
                    id: config._id,
                    phoneNumberId: config.phoneNumberId,
                    businessAccountId: config.businessAccountId,
                    isActive: config.isActive,
                    templatesCount: config.templates?.length || 0,
                    contactsCount: config.contacts?.length || 0,
                    statistics: config.statistics,
                    configuredBy: config.configuredBy,
                    configuredAt: config.createdAt,
                    updatedAt: config.updatedAt
                } : null,
                creditSettings: adminSettings?.whatsApp ? {
                    creditPrice: adminSettings.whatsApp.creditPrice,
                    autoRecharge: adminSettings.whatsApp.autoRecharge,
                    rechargeThreshold: adminSettings.whatsApp.rechargeThreshold,
                    rechargeAmount: adminSettings.whatsApp.rechargeAmount,
                    isEnabled: adminSettings.whatsApp.isEnabled,
                    webhookVerifyToken: adminSettings.whatsApp.webhookVerifyToken,
                    webhookUrl: adminSettings.whatsApp.webhookUrl
                } : null,
                systemStats: {
                    totalCreditsInSystem: totalCredits[0]?.totalBalance || 0,
                    totalActiveCoaches: totalCoaches,
                    totalMessages: totalMessages,
                    todayMessages: todayMessages
                }
            }
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] getSettingsOverview - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get settings overview',
            error: error.message
        });
    }
});