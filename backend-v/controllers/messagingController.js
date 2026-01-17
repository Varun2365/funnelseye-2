const asyncHandler = require('../middleware/async');
const mongoose = require('mongoose');
const WhatsAppMessage = require('../schema/WhatsAppMessage');
const Lead = require('../schema/Lead');
const MessageTemplate = require('../schema/MessageTemplate');
const WhatsAppCredit = require('../schema/WhatsAppCredit');
const centralWhatsAppService = require('../services/centralWhatsAppService');
const templateService = require('../services/templateService');
const messageQueueService = require('../services/messageQueueService');
const { SECTIONS } = require('../utils/sectionPermissions');

// @desc    Send single message
// @route   POST /api/messaging/send
// @access  Private (Coach)
exports.sendMessage = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [MESSAGING] sendMessage - Starting...');
        
        const coachId = req.user.id;
        const { 
            to, 
            message, 
            templateId, 
            template, // Template object with name and language
            templateParameters = {},
            type = 'text',
            mediaUrl,
            caption,
            leadId
        } = req.body;
        
        // Validate required fields
        if (!to) {
            return res.status(400).json({
                success: false,
                message: 'Recipient phone number is required'
            });
        }
        
        if (type === 'text' && !message) {
            return res.status(400).json({
                success: false,
                message: 'Message content is required for text messages'
            });
        }
        
        if (type === 'template' && !templateId) {
            return res.status(400).json({
                success: false,
                message: 'Template ID is required for template messages'
            });
        }
        
        // Check credits
        const credits = await WhatsAppCredit.getOrCreateCredits(coachId);
        if (!credits.canSendMessage()) {
            return res.status(402).json({
                success: false,
                message: 'Insufficient credits to send messages',
                data: {
                    balance: credits.balance,
                    required: 1
                }
            });
        }
        
        let messageContent = message;
        let templateName = null;
        
        // Handle template messages
        if (type === 'template' && templateId) {
            // Check if templateId is a valid MongoDB ObjectId
            // If not, it's likely a Meta template ID (e.g., "1934990210683335")
            const isValidObjectId = mongoose.Types.ObjectId.isValid(templateId);
            
            if (isValidObjectId) {
                // MongoDB template - look it up and render
                const template = await MessageTemplate.findById(templateId);
                if (!template) {
                    return res.status(404).json({
                        success: false,
                        message: 'Template not found'
                    });
                }
                
                // Get lead data for template parameters
                let leadData = {};
                if (leadId) {
                    const lead = await Lead.findById(leadId);
                    if (lead) {
                        leadData = templateService.extractLeadData(lead);
                    }
                }
                
                // Merge template parameters with lead data
                const allParameters = { ...leadData, ...templateParameters };
                
                // Render template
                const renderedTemplate = template.renderTemplate(allParameters);
                messageContent = renderedTemplate.body;
                templateName = template.name;
            } else {
                // Meta template ID - pass it through to be handled by centralWhatsAppService
                // Don't try to look it up in MongoDB
                templateName = null; // Will be looked up by Meta template ID
            }
        }
        
        // Prepare message data for queue
        const messageData = {
            to: to,
            message: messageContent,
            text: messageContent,
            type: type,
            templateId: templateId && !mongoose.Types.ObjectId.isValid(templateId) ? templateId : undefined, // Pass Meta template ID if not MongoDB ObjectId
            template: template, // Template object with name and language from request body
            templateName: templateName,
            templateParameters: templateParameters,
            parameters: Array.isArray(templateParameters) ? templateParameters : Object.values(templateParameters || {}),
            mediaUrl: mediaUrl,
            caption: caption,
            coachId: coachId,
            leadId: leadId
        };
        
        // Queue message instead of sending directly
        const queued = await messageQueueService.queueWhatsAppMessage(messageData);
        
        if (!queued) {
            return res.status(500).json({
                success: false,
                message: 'Failed to queue message',
                error: 'Message queue service unavailable'
            });
        }
        
        // Deduct credits immediately (will be processed by worker)
        await credits.useCredits(1, 'message_queued', `Message queued for ${to}`);
        
        console.log('✅ [MESSAGING] sendMessage - Success');
        res.status(200).json({
            success: true,
            message: 'Message queued successfully',
            data: {
                status: 'queued',
                recipient: to,
                creditsUsed: 1,
                remainingCredits: credits.balance - 1,
                note: 'Message will be processed by worker shortly'
            }
        });
        
    } catch (error) {
        console.error('❌ [MESSAGING] sendMessage - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message
        });
    }
});

// @desc    Send bulk messages
// @route   POST /api/messaging/send-bulk
// @access  Private (Coach)
exports.sendBulkMessages = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [MESSAGING] sendBulkMessages - Starting...');
        
        const coachId = req.user.id;
        const { 
            contacts, 
            message, 
            templateId, 
            templateParameters = {},
            type = 'text',
            mediaUrl,
            caption,
            delay = 1000 // Delay between messages in ms
        } = req.body;
        
        // Validate required fields
        if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Contacts array is required and must not be empty'
            });
        }
        
        if (type === 'text' && !message) {
            return res.status(400).json({
                success: false,
                message: 'Message content is required for text messages'
            });
        }
        
        if (type === 'template' && !templateId) {
            return res.status(400).json({
                success: false,
                message: 'Template ID is required for template messages'
            });
        }
        
        // Check credits
        const credits = await WhatsAppCredit.getOrCreateCredits(coachId);
        const requiredCredits = contacts.length;
        
        if (!credits.canSendMessage(requiredCredits)) {
            return res.status(402).json({
                success: false,
                message: 'Insufficient credits to send bulk messages',
                data: {
                    balance: credits.balance,
                    required: requiredCredits
                }
            });
        }
        
        // Get template if needed
        let template = null;
        if (type === 'template' && templateId) {
            template = await MessageTemplate.findById(templateId);
            if (!template) {
                return res.status(404).json({
                    success: false,
                    message: 'Template not found'
                });
            }
        }
        
        // Prepare contacts for queue (with lead data embedded if needed)
        const contactsForQueue = await Promise.all(contacts.map(async (contact) => {
            const contactData = {
                phone: contact.phone || contact.to,
                email: contact.email,
                name: contact.name,
                leadId: contact.leadId
            };
            
            // If template and leadId exists, get lead data for template rendering
            if (type === 'template' && contact.leadId && template) {
                try {
                    const lead = await Lead.findById(contact.leadId);
                    if (lead) {
                        contactData.leadData = templateService.extractLeadData(lead);
                    }
                } catch (error) {
                    // Continue without lead data
                }
            }
            
            return contactData;
        }));
        
        // Prepare bulk message data
        const bulkData = {
            messageType: 'whatsapp',
            recipients: contactsForQueue,
            contacts: contactsForQueue,
            type: type,
            message: message,
            templateId: templateId,
            templateName: template ? template.name : null,
            templateParameters: templateParameters,
            parameters: Array.isArray(templateParameters) ? templateParameters : Object.values(templateParameters || {}),
            mediaUrl: mediaUrl,
            caption: caption,
            coachId: coachId,
            delay: delay || 1000 // Default 1 second delay
        };
        
        // Queue bulk messages
        const queued = await messageQueueService.queueBulkMessages(bulkData);
        
        if (!queued) {
            return res.status(500).json({
                success: false,
                message: 'Failed to queue bulk messages',
                error: 'Message queue service unavailable'
            });
        }
        
        // Deduct credits immediately for all contacts (will be processed by worker)
        await credits.useCredits(contacts.length, 'bulk_message_queued', `Bulk message queued for ${contacts.length} contacts`);
        
        console.log('✅ [MESSAGING] sendBulkMessages - Success');
        res.status(200).json({
            success: true,
            message: `Bulk messages queued successfully`,
            data: {
                status: 'queued',
                total: contacts.length,
                queued: contacts.length,
                creditsUsed: contacts.length,
                remainingCredits: credits.balance - contacts.length,
                note: 'Messages will be processed by worker shortly'
            }
        });
        
    } catch (error) {
        console.error('❌ [MESSAGING] sendBulkMessages - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send bulk messages',
            error: error.message
        });
    }
});

// @desc    Send message as admin
// @route   POST /api/messaging/admin/send
// @access  Private (Admin)
exports.sendAdminMessage = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [MESSAGING] sendAdminMessage - Starting...');
        console.log('📦 [MESSAGING] Request body:', JSON.stringify(req.body, null, 2));
        
        const adminId = req.admin.id;
        const { 
            to, 
            message, 
            templateId, 
            templateName: reqTemplateName, // Template name from request (e.g., "hello_world")
            template, // Template object with name and language
            templateParameters = {},
            parameters = [], // Alternative parameter format (array)
            type: requestType,
            mediaUrl,
            mediaType,
            caption,
            leadId,
            coachId // Optional: specify which coach this message is for
        } = req.body;
        
        // Determine message type based on what's provided
        let type = requestType;
        if (!type) {
            if (reqTemplateName || templateId) {
                type = 'template';
            } else if (mediaUrl) {
                type = 'media';
            } else {
                type = 'text';
            }
        }
        
        console.log(`📝 [MESSAGING] Determined message type: ${type}`);
        
        // Validate required fields
        if (!to) {
            return res.status(400).json({
                success: false,
                message: 'Recipient phone number is required'
            });
        }
        
        if (type === 'text' && !message) {
            return res.status(400).json({
                success: false,
                message: 'Message content is required for text messages'
            });
        }
        
        if (type === 'template' && !templateId && !reqTemplateName) {
            return res.status(400).json({
                success: false,
                message: 'Template ID or template name is required for template messages'
            });
        }
        
        let messageContent = message;
        let templateName = reqTemplateName || null;
        
        // Handle template messages
        if (type === 'template') {
            if (templateId) {
                // Check if templateId is a valid MongoDB ObjectId
                // If not, it's likely a Meta template ID (e.g., "1934990210683335")
                const isValidObjectId = mongoose.Types.ObjectId.isValid(templateId);
                
                if (isValidObjectId) {
                    // MongoDB template - look it up and render
                    const template = await MessageTemplate.findById(templateId);
                    if (!template) {
                        return res.status(404).json({
                            success: false,
                            message: 'Template not found'
                        });
                    }
                    
                    // Get lead data for template parameters
                    let leadData = {};
                    if (leadId) {
                        const lead = await Lead.findById(leadId);
                        if (lead) {
                            leadData = templateService.extractLeadData(lead);
                        }
                    }
                    
                    // Merge template parameters with lead data
                    const allParameters = { ...leadData, ...templateParameters };
                    
                    // Render template
                    const renderedTemplate = template.renderTemplate(allParameters);
                    messageContent = renderedTemplate.body;
                    templateName = template.name;
                } else {
                    // Meta template ID - pass it through to be handled by centralWhatsAppService
                    // Don't try to look it up in MongoDB
                    templateName = null; // Will be looked up by Meta template ID
                }
            } else if (reqTemplateName) {
                // Template name provided directly (e.g., "hello_world")
                // This will be sent as a Meta template via centralWhatsAppService
                console.log(`📝 [MESSAGING] Using template name directly: ${reqTemplateName}`);
                templateName = reqTemplateName;
            }
        }
        
        // Prepare parameters - handle both object and array formats
        let finalParameters = parameters;
        if (!Array.isArray(parameters) && templateParameters) {
            finalParameters = Array.isArray(templateParameters) 
                ? templateParameters 
                : Object.values(templateParameters || {});
        }
        
        console.log(`📝 [MESSAGING] Final parameters:`, finalParameters);
        
        // Queue message via message queue service instead of sending directly
        const messageData = {
            to: to,
            message: messageContent,
            text: messageContent,
            type: type,
            templateId: templateId && !mongoose.Types.ObjectId.isValid(templateId) ? templateId : undefined, // Pass Meta template ID if not MongoDB ObjectId
            template: template, // Template object with name and language from request body
            templateName: templateName,
            templateParameters: templateParameters,
            parameters: finalParameters,
            mediaUrl: mediaUrl,
            mediaType: mediaType,
            caption: caption,
            coachId: adminId // For admin messages, pass adminId as coachId
        };
        
        console.log(`📝 [MESSAGING] Message data to queue:`, JSON.stringify(messageData, null, 2));
        
        const queued = await messageQueueService.queueWhatsAppMessage(messageData);
        
        if (!queued) {
            return res.status(500).json({
                success: false,
                message: 'Failed to queue message',
                error: 'Message queue service unavailable'
            });
        }
        
        console.log('✅ [MESSAGING] sendAdminMessage - Success');
        res.status(200).json({
            success: true,
            message: 'Message queued successfully',
            data: {
                status: 'queued',
                recipient: to,
                senderType: 'admin',
                note: 'Message will be processed by worker shortly'
            }
        });
        
    } catch (error) {
        console.error('❌ [MESSAGING] sendAdminMessage - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message
        });
    }
});

// @desc    Send bulk messages as admin
// @route   POST /api/messaging/admin/send-bulk
// @access  Private (Admin)
exports.sendAdminBulkMessages = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [MESSAGING] sendAdminBulkMessages - Starting...');
        
        const adminId = req.admin.id;
        const { 
            contacts, 
            message, 
            templateId, 
            templateParameters = {},
            type = 'text',
            mediaUrl,
            caption,
            delay = 1000
        } = req.body;
        
        // Validate required fields
        if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Contacts array is required and must not be empty'
            });
        }
        
        if (type === 'text' && !message) {
            return res.status(400).json({
                success: false,
                message: 'Message content is required for text messages'
            });
        }
        
        if (type === 'template' && !templateId) {
            return res.status(400).json({
                success: false,
                message: 'Template ID is required for template messages'
            });
        }
        
        // Get template if needed
        let template = null;
        if (type === 'template' && templateId) {
            template = await MessageTemplate.findById(templateId);
            if (!template) {
                return res.status(404).json({
                    success: false,
                    message: 'Template not found'
                });
            }
        }
        
        // Prepare contacts for queue (with lead data embedded if needed)
        const contactsForQueue = await Promise.all(contacts.map(async (contact) => {
            const contactData = {
                phone: contact.phone || contact.to,
                email: contact.email,
                name: contact.name,
                leadId: contact.leadId
            };
            
            // If template and leadId exists, get lead data for template rendering
            if (type === 'template' && contact.leadId && template) {
                try {
                    const lead = await Lead.findById(contact.leadId);
                    if (lead) {
                        contactData.leadData = templateService.extractLeadData(lead);
                    }
                } catch (error) {
                    // Continue without lead data
                }
            }
            
            return contactData;
        }));
        
        // Prepare bulk message data
        const bulkData = {
            messageType: 'whatsapp',
            recipients: contactsForQueue,
            contacts: contactsForQueue,
            type: type,
            message: message,
            templateId: templateId,
            templateName: template ? template.name : null,
            templateParameters: templateParameters,
            parameters: Array.isArray(templateParameters) ? templateParameters : Object.values(templateParameters || {}),
            mediaUrl: mediaUrl,
            caption: caption,
            adminId: adminId,
            coachId: coachId,
            delay: delay || 1000, // Default 1 second delay
            isAdmin: true
        };
        
        // Queue bulk messages
        const queued = await messageQueueService.queueBulkMessages(bulkData);
        
        if (!queued) {
            return res.status(500).json({
                success: false,
                message: 'Failed to queue bulk messages',
                error: 'Message queue service unavailable'
            });
        }
        
        console.log('✅ [MESSAGING] sendAdminBulkMessages - Success');
        res.status(200).json({
            success: true,
            message: `Bulk messages queued successfully`,
            data: {
                status: 'queued',
                total: contacts.length,
                queued: contacts.length,
                note: 'Messages will be processed by worker shortly',
                senderType: 'admin'
            }
        });
        
    } catch (error) {
        console.error('❌ [MESSAGING] sendAdminBulkMessages - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send bulk messages',
            error: error.message
        });
    }
});

// @desc    Get messaging statistics for coach
// @route   GET /api/messaging/stats
// @access  Private (Coach)
exports.getMessagingStats = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [MESSAGING] getMessagingStats - Starting...');
        
        const coachId = req.user.id;
        
        // Get message statistics
        const totalMessages = await WhatsAppMessage.countDocuments({ senderId: coachId });
        const sentMessages = await WhatsAppMessage.countDocuments({ 
            senderId: coachId, 
            status: 'sent' 
        });
        const deliveredMessages = await WhatsAppMessage.countDocuments({ 
            senderId: coachId, 
            status: 'delivered' 
        });
        const readMessages = await WhatsAppMessage.countDocuments({ 
            senderId: coachId, 
            status: 'read' 
        });
        const failedMessages = await WhatsAppMessage.countDocuments({ 
            senderId: coachId, 
            status: 'failed' 
        });
        
        // Get recent activity
        const recentMessages = await WhatsAppMessage.find({ senderId: coachId })
            .sort({ sentAt: -1 })
            .limit(10)
            .select('recipientPhone content.text sentAt status');
        
        // Get credit information
        const credits = await WhatsAppCredit.getOrCreateCredits(coachId);
        
        console.log('✅ [MESSAGING] getMessagingStats - Success');
        res.status(200).json({
            success: true,
            data: {
                totalMessages,
                sentMessages,
                deliveredMessages,
                readMessages,
                failedMessages,
                successRate: totalMessages > 0 ? ((deliveredMessages + readMessages) / totalMessages * 100).toFixed(2) : 0,
                recentMessages,
                credits: {
                    balance: credits.balance,
                    status: credits.status,
                    totalUsed: credits.usage.creditsUsed
                }
            }
        });
        
    } catch (error) {
        console.error('❌ [MESSAGING] getMessagingStats - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get messaging statistics',
            error: error.message
        });
    }
});

// @desc    Get system-wide messaging statistics
// @route   GET /api/messaging/admin/stats
// @access  Private (Admin)
exports.getAdminMessagingStats = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [MESSAGING] getAdminMessagingStats - Starting...');
        
        // Get system-wide message statistics
        const totalMessages = await WhatsAppMessage.countDocuments();
        const sentMessages = await WhatsAppMessage.countDocuments({ status: 'sent' });
        const deliveredMessages = await WhatsAppMessage.countDocuments({ status: 'delivered' });
        const readMessages = await WhatsAppMessage.countDocuments({ status: 'read' });
        const failedMessages = await WhatsAppMessage.countDocuments({ status: 'failed' });
        
        // Get messages by sender type
        const coachMessages = await WhatsAppMessage.countDocuments({ senderType: 'coach' });
        const adminMessages = await WhatsAppMessage.countDocuments({ senderType: 'admin' });
        
        // Get recent activity
        const recentMessages = await WhatsAppMessage.find()
            .sort({ sentAt: -1 })
            .limit(20)
            .populate('senderId', 'name email')
            .select('senderId senderType recipientPhone content.text sentAt status');
        
        // Get top coaches by message count
        const topCoaches = await WhatsAppMessage.aggregate([
            { $match: { senderType: 'coach' } },
            { $group: { _id: '$senderId', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'coach' } },
            { $unwind: '$coach' },
            { $project: { coachName: '$coach.name', coachEmail: '$coach.email', messageCount: '$count' } }
        ]);
        
        console.log('✅ [MESSAGING] getAdminMessagingStats - Success');
        res.status(200).json({
            success: true,
            data: {
                totalMessages,
                sentMessages,
                deliveredMessages,
                readMessages,
                failedMessages,
                successRate: totalMessages > 0 ? ((deliveredMessages + readMessages) / totalMessages * 100).toFixed(2) : 0,
                coachMessages,
                adminMessages,
                recentMessages,
                topCoaches
            }
        });
        
    } catch (error) {
        console.error('❌ [MESSAGING] getAdminMessagingStats - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get admin messaging statistics',
            error: error.message
        });
    }
});

// @desc    Get messages for specific coach
// @route   GET /api/messaging/admin/coaches/:coachId/messages
// @access  Private (Admin)
exports.getCoachMessages = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [MESSAGING] getCoachMessages - Starting...');
        
        const { coachId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        
        // Get messages for specific coach
        const messages = await WhatsAppMessage.find({ senderId: coachId })
            .sort({ sentAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('leadId', 'name email phone')
            .select('recipientPhone content.text sentAt status deliveryStatus');
        
        const total = await WhatsAppMessage.countDocuments({ senderId: coachId });
        
        console.log('✅ [MESSAGING] getCoachMessages - Success');
        res.status(200).json({
            success: true,
            data: {
                messages,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total,
                    limit: parseInt(limit)
                }
            }
        });
        
    } catch (error) {
        console.error('❌ [MESSAGING] getCoachMessages - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get coach messages',
            error: error.message
        });
    }
});

module.exports = exports;
