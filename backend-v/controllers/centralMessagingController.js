const asyncHandler = require('../middleware/async');
const { Coach, Staff, Lead } = require('../schema');
const WhatsAppMessage = require('../schema/WhatsAppMessage');
const EmailMessage = require('../schema/EmailMessage');
const MessageTemplate = require('../schema/MessageTemplate');
const WhatsAppCredit = require('../schema/WhatsAppCredit');
const CentralWhatsApp = require('../schema/CentralWhatsApp');
const AdminSystemSettings = require('../schema/AdminSystemSettings');
const messagingVariableService = require('../services/messagingVariableService');
const centralWhatsAppService = require('../services/centralWhatsAppService');
const emailConfigService = require('../services/emailConfigService');
const messageQueueService = require('../services/messageQueueService');

// Get User and Client dynamically
const mongoose = require('mongoose');
const User = mongoose.models.User || require('../schema/User');
let Client = null;
try {
    Client = mongoose.models.Client || require('../schema/Client');
} catch (e) {
    // Client schema might not exist
    Client = null;
}

/**
 * Central Messaging Controller
 * Unified messaging system for WhatsApp and Email
 * Base: /api/central-messaging/v1/
 */

// ===== HELPER FUNCTIONS =====

/**
 * Get user context based on role
 */
async function getUserContext(userId, userRole) {
    if (userRole === 'admin') {
        return { coachId: null, userType: 'admin' };
    } else if (userRole === 'coach') {
        const user = await User.findById(userId);
        return { coachId: userId, userType: 'coach' };
    } else if (userRole === 'staff') {
        const staff = await Staff.findById(userId).populate('coachId');
        return { coachId: staff?.coachId?._id || staff?.coachId, userType: 'staff' };
    }
    return { coachId: null, userType: 'unknown' };
}

/**
 * Get staff's assigned lead IDs
 */
async function getStaffAssignedLeads(staffId) {
    const staff = await Staff.findById(staffId);
    if (!staff || !staff.assignedLeads || staff.assignedLeads.length === 0) {
        return [];
    }
    return staff.assignedLeads.map(lead => lead.toString());
}

// ===== VARIABLE MANAGEMENT =====

// @desc    Get available template variables
// @route   GET /api/central-messaging/v1/variables
// @access  Private (Coach/Staff/Admin)
exports.getTemplateVariables = asyncHandler(async (req, res) => {
    try {
        const variables = messagingVariableService.getAvailableVariables();
        
        res.json({
            success: true,
            data: variables
        });
    } catch (error) {
        console.error('❌ Error getting template variables:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get template variables',
            error: error.message
        });
    }
});

// @desc    Preview template with sample data
// @route   POST /api/central-messaging/v1/variables/preview
// @access  Private (Coach/Staff/Admin)
exports.previewTemplate = asyncHandler(async (req, res) => {
    try {
        const { templateText, variables } = req.body;
        
        if (!templateText) {
            return res.status(400).json({
                success: false,
                message: 'Template text is required'
            });
        }

        // Get system variables
        const systemVars = messagingVariableService.getSystemVariables();
        
        // Merge with provided variables
        const allVariables = { ...systemVars, ...variables };
        
        // Replace variables
        const preview = messagingVariableService.replaceVariables(templateText, allVariables);
        
        res.json({
            success: true,
            data: {
                preview,
                usedVariables: allVariables
            }
        });
    } catch (error) {
        console.error('❌ Error previewing template:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to preview template',
            error: error.message
        });
    }
});

// ===== MESSAGE SENDING =====

// @desc    Send message (WhatsApp or Email)
// @route   POST /api/central-messaging/v1/send
// @access  Private (Coach/Staff/Admin)
exports.sendMessage = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_MESSAGING] sendMessage - Starting...');
        
        const userId = req.user.id;
        const userRole = req.user.role;
        const { 
            to, 
            message, 
            messageType, // 'whatsapp' or 'email'
            type = 'text', // 'text', 'template', 'media'
            templateName,
            templateParameters = {},
            subject,
            emailBody,
            mediaUrl,
            mediaType,
            caption,
            leadId,
            clientId,
            appointmentId,
            variables = {} // Additional variables for template filling
        } = req.body;

        // Get user context
        const { coachId, userType } = await getUserContext(userId, userRole);

        // Validate required fields
        if (!to) {
            return res.status(400).json({
                success: false,
                message: 'Recipient is required'
            });
        }

        // Check credits for non-admin users
        if (userType !== 'admin' && coachId) {
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
        }

        let result = { success: false };
        let messageRecord = null;

        // Extract template data if lead/client/appointment is provided
        let templateData = {};
        if (leadId || clientId || appointmentId) {
            templateData = await messagingVariableService.extractTemplateData({
                leadId,
                clientId,
                appointmentId,
                coachId: coachId || userId
            });
        }

        // Merge template variables
        const allVariables = { ...templateData, ...variables };

        if (messageType === 'whatsapp') {
            // Initialize WhatsApp service
            await centralWhatsAppService.initialize();

            let messageContent = message;

            // Handle template messages
            if (type === 'template' && templateName) {
                // First, try Meta template (admin-created, approved)
                const centralConfig = await CentralWhatsApp.findOne({ isActive: true });
                const metaTemplate = centralConfig?.templates?.find(
                    t => t.templateName === templateName && t.status === 'APPROVED'
                );

                if (metaTemplate) {
                    // Queue Meta template message instead of sending directly
                    const templateMessageData = {
                        to: to,
                        type: 'template',
                        templateName: templateName,
                        templateParameters: templateParameters,
                        parameters: Array.isArray(templateParameters) ? templateParameters : Object.values(templateParameters || {}),
                        coachId: coachId || null
                    };
                    
                    const queued = await messageQueueService.queueWhatsAppMessage(templateMessageData);
                    if (!queued) {
                        throw new Error('Failed to queue template message');
                    }
                    
                    result = { success: true, messageId: 'queued', status: 'queued' };
                    console.log('✅ Using Meta template (queued):', templateName);
                } else {
                    // Use local template - check if within 24hr window
                    const localTemplate = await MessageTemplate.findOne({
                        name: templateName,
                        $or: [
                            { isPreBuilt: true },
                            { coachId: coachId }
                        ]
                    });

                    if (localTemplate) {
                        // Check if this is WhatsApp and needs 24hr window
                        if (messageType === 'whatsapp') {
                            // TODO: Implement 24hr window check
                            // For now, allow local templates
                            console.log('⚠️ Using local template - ensure within 24hr window');
                        }

                        // Render template with variables
                        const rendered = localTemplate.renderTemplate(allVariables);
                        messageContent = rendered.body;

                        // Send as regular text message since it's local
                        if (!result.success) {
                            result = await centralWhatsAppService.sendTextMessage(
                                to,
                                messageContent,
                                coachId
                            );
                        }
                    } else {
                        throw new Error(`Template '${templateName}' not found`);
                    }
                }
            }

            // Prepare message data for queue (if not already sent via template)
            if (!result || !result.success) {
                // Queue message instead of sending directly
                const messageData = {
                    to: to,
                    message: messageContent,
                    text: messageContent,
                    type: type === 'template' ? 'template' : (type || 'text'),
                    templateName: type === 'template' ? templateName : undefined,
                    templateParameters: templateParameters,
                    parameters: Array.isArray(templateParameters) ? templateParameters : Object.values(templateParameters || {}),
                    mediaUrl: mediaUrl,
                    mediaType: mediaType,
                    caption: caption,
                    coachId: coachId || null
                };

                const queued = await messageQueueService.queueWhatsAppMessage(messageData);
                
                if (!queued) {
                    throw new Error('Failed to queue message');
                }

                result = { success: true, messageId: 'queued', status: 'queued' };
            }

            // Create message record
            messageRecord = new WhatsAppMessage({
                messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                wamid: result.messageId || '',
                senderId: userId,
                senderType: userType,
                recipientPhone: to,
                messageType: type,
                content: { text: messageContent },
                direction: 'outbound',
                status: result.success ? 'sent' : 'failed',
                conversationId: WhatsAppMessage.createConversationId(userId, to),
                coachId: coachId,
                leadId: leadId,
                clientId: clientId,
                creditsUsed: userType === 'admin' ? 0 : 1,
                metaWindowInfo: {
                    isWithin24Hours: true,
                    windowExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
                }
            });

            await messageRecord.save();

            // Deduct credits for non-admin users
            if (userType !== 'admin' && coachId && result.success) {
                const credits = await WhatsAppCredit.getOrCreateCredits(coachId);
                await credits.useCredits(1);
            }

        } else if (messageType === 'email') {
            // Validate email fields
            if (!subject) {
                return res.status(400).json({
                    success: false,
                    message: 'Subject is required for email messages'
                });
            }

            // Get email config
            const emailConfig = await emailConfigService.getEmailConfig();
            if (!emailConfig || !emailConfig.enabled) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is not configured'
                });
            }

            // Get transporter
            const transporter = await emailConfigService.getTransporter();
            if (!transporter) {
                return res.status(500).json({
                    success: false,
                    message: 'Email transporter is not available'
                });
            }

            // Replace variables in email body and subject
            let processedBody = emailBody || message;
            let processedSubject = subject;

            if (Object.keys(allVariables).length > 0) {
                processedBody = messagingVariableService.replaceVariables(processedBody, allVariables);
                processedSubject = messagingVariableService.replaceVariables(processedSubject, allVariables);
            }

            // Send email
            const mailOptions = {
                from: emailConfig.fromEmail || emailConfig.auth.user,
                to: to,
                subject: processedSubject,
                html: processedBody
            };

            await transporter.sendMail(mailOptions);

            // Create email message record
            messageRecord = new EmailMessage({
                messageId: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                from: {
                    email: emailConfig.auth.user,
                    name: emailConfig.fromName || 'FunnelsEye'
                },
                to: {
                    email: to,
                    name: ''
                },
                subject: processedSubject,
                body: {
                    html: processedBody
                },
                direction: 'outbound',
                type: type,
                status: 'sent',
                coachId: coachId || userId,
                leadId: leadId,
                clientId: clientId,
                provider: 'gmail',
                metaWindowInfo: {
                    isWithin24Hours: false,
                    windowExpiresAt: null
                }
            });

            await messageRecord.save();

            // Deduct credits for non-admin users
            if (userType !== 'admin' && coachId) {
                const credits = await WhatsAppCredit.getOrCreateCredits(coachId);
                await credits.useCredits(1);
            }

            result = { success: true, messageId: messageRecord.messageId };
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid message type. Use "whatsapp" or "email"'
            });
        }

        console.log('✅ [CENTRAL_MESSAGING] sendMessage - Success');
        res.json({
            success: true,
            message: 'Message sent successfully',
            data: {
                messageId: messageRecord._id,
                messageType: messageType,
                recipient: to,
                status: 'sent'
            }
        });

    } catch (error) {
        console.error('❌ [CENTRAL_MESSAGING] sendMessage - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message
        });
    }
});

// ===== INBOX MANAGEMENT =====

// @desc    Get unified inbox (role-based)
// @route   GET /api/central-messaging/v1/inbox
// @access  Private (Coach/Staff/Admin)
exports.getUnifiedInbox = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_MESSAGING] getUnifiedInbox - Starting...');
        
        const userId = req.user.id;
        const userRole = req.user.role;
        const { page = 1, limit = 20, contact, type, within24Hours } = req.query;

        // Get user context
        const { coachId, userType } = await getUserContext(userId, userRole);

        // For staff, get assigned leads
        let assignedLeadIds = null;
        if (userType === 'staff') {
            assignedLeadIds = await getStaffAssignedLeads(userId);
        }

        // Build queries
        let whatsappQuery = { direction: 'inbound' };
        let emailQuery = { direction: 'inbound' };

        if (userType === 'admin') {
            // Admin sees all
        } else if (userType === 'staff') {
            // Staff sees only assigned leads
            if (assignedLeadIds.length > 0) {
                whatsappQuery.leadId = { $in: assignedLeadIds };
                emailQuery.leadId = { $in: assignedLeadIds };
            } else {
                // No assigned leads, return empty
                return res.json({
                    success: true,
                    data: {
                        messages: [],
                        total: 0,
                        userType: 'staff',
                        pagination: {
                            current: parseInt(page),
                            pages: 0,
                            total: 0,
                            limit: parseInt(limit)
                        }
                    }
                });
            }
        } else {
            // Coach sees own messages
            whatsappQuery.coachId = coachId;
            emailQuery.coachId = coachId;
        }

        // Apply filters
        if (contact) {
            whatsappQuery.$or = [
                { from: new RegExp(contact, 'i') },
                { to: new RegExp(contact, 'i') }
            ];
            emailQuery.$or = [
                { 'from.email': new RegExp(contact, 'i') },
                { 'to.email': new RegExp(contact, 'i') }
            ];
        }

        if (type === 'whatsapp') {
            emailQuery = {}; // Skip email query
        } else if (type === 'email') {
            whatsappQuery = {}; // Skip WhatsApp query
        }

        if (within24Hours === 'true') {
            whatsappQuery['metaWindowInfo.isWithin24Hours'] = true;
            whatsappQuery['metaWindowInfo.windowExpiresAt'] = { $gt: new Date() };
        }

        // Get messages
        const whatsappMessages = await WhatsAppMessage.find(whatsappQuery)
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('leadId', 'name email phone');

        const emailMessages = await EmailMessage.find(emailQuery)
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('leadId', 'name email phone');

        // Combine messages
        const allMessages = [
            ...whatsappMessages.map(msg => ({ ...msg.toObject(), messageType: 'whatsapp' })),
            ...emailMessages.map(msg => ({ ...msg.toObject(), messageType: 'email' }))
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Get total counts
        const whatsappTotal = await WhatsAppMessage.countDocuments(whatsappQuery);
        const emailTotal = await EmailMessage.countDocuments(emailQuery);
        const total = whatsappTotal + emailTotal;

        console.log('✅ [CENTRAL_MESSAGING] getUnifiedInbox - Success');
        res.json({
            success: true,
            data: {
                messages: allMessages,
                total,
                userType,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total,
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('❌ [CENTRAL_MESSAGING] getUnifiedInbox - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get inbox',
            error: error.message
        });
    }
});

// ===== CONTACTS MANAGEMENT =====

// @desc    Get all contacts with 24hr window info
// @route   GET /api/central-messaging/v1/contacts
// @access  Private (Coach/Staff/Admin)
exports.getContacts = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_MESSAGING] getContacts - Starting...');
        
        const userId = req.user.id;
        const userRole = req.user.role;
        const { page = 1, limit = 20, within24Hours } = req.query;

        const { coachId, userType } = await getUserContext(userId, userRole);

        // For staff, get assigned leads
        let assignedLeadIds = null;
        if (userType === 'staff') {
            assignedLeadIds = await getStaffAssignedLeads(userId);
        }

        // Build aggregation queries
        let whatsappMatch = { direction: 'inbound' };
        let emailMatch = { direction: 'inbound' };

        if (userType !== 'admin') {
            if (userType === 'staff') {
                if (assignedLeadIds.length > 0) {
                    whatsappMatch.leadId = { $in: assignedLeadIds };
                    emailMatch.leadId = { $in: assignedLeadIds };
                } else {
                    return res.json({
                        success: true,
                        data: { contacts: [], total: 0, userType: 'staff' }
                    });
                }
            } else {
                whatsappMatch.coachId = coachId;
                emailMatch.coachId = coachId;
            }
        }

        if (within24Hours === 'true') {
            whatsappMatch['metaWindowInfo.isWithin24Hours'] = true;
            whatsappMatch['metaWindowInfo.windowExpiresAt'] = { $gt: new Date() };
        }

        // Aggregate contacts from WhatsApp
        const whatsappContacts = await WhatsAppMessage.aggregate([
            { $match: whatsappMatch },
            { $group: {
                _id: '$from',
                lastMessage: { $first: '$$ROOT' },
                messageCount: { $sum: 1 },
                windowExpiresAt: { $first: '$metaWindowInfo.windowExpiresAt' },
                isWithin24Hours: { $first: '$metaWindowInfo.isWithin24Hours' }
            }},
            { $sort: { 'lastMessage.timestamp': -1 } },
            { $skip: (page - 1) * limit },
            { $limit: parseInt(limit) }
        ]);

        // Aggregate contacts from Email
        const emailContacts = await EmailMessage.aggregate([
            { $match: emailMatch },
            { $group: {
                _id: '$from.email',
                lastMessage: { $first: '$$ROOT' },
                messageCount: { $sum: 1 }
            }},
            { $sort: { 'lastMessage.timestamp': -1 } },
            { $skip: (page - 1) * limit },
            { $limit: parseInt(limit) }
        ]);

        const contacts = [
            ...whatsappContacts.map(c => ({
                ...c,
                messageType: 'whatsapp'
            })),
            ...emailContacts.map(c => ({
                ...c,
                messageType: 'email'
            }))
        ];

        res.json({
            success: true,
            data: { contacts, total: contacts.length, userType }
        });

    } catch (error) {
        console.error('❌ [CENTRAL_MESSAGING] getContacts - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get contacts',
            error: error.message
        });
    }
});

// ===== ANALYTICS =====

// @desc    Get messaging analytics
// @route   GET /api/central-messaging/v1/analytics
// @access  Private (Coach/Staff/Admin)
exports.getAnalytics = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { startDate, endDate } = req.query;

        const { coachId, userType } = await getUserContext(userId, userRole);

        // For staff, get assigned leads
        let assignedLeadIds = null;
        if (userType === 'staff') {
            assignedLeadIds = await getStaffAssignedLeads(userId);
        }

        // Build date filter
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.timestamp = {};
            if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
            if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
        }

        // Build queries
        let whatsappMatch = { ...dateFilter };
        let emailMatch = { ...dateFilter };

        if (userType !== 'admin') {
            if (userType === 'staff') {
                if (assignedLeadIds.length > 0) {
                    whatsappMatch.leadId = { $in: assignedLeadIds };
                    emailMatch.leadId = { $in: assignedLeadIds };
                } else {
                    return res.json({
                        success: true,
                        data: {
                            userType: 'staff',
                            whatsapp: { sent: 0, total: 0 },
                            email: { sent: 0, total: 0 },
                            totalCreditsUsed: 0,
                            totalCost: 0
                        }
                    });
                }
            } else {
                whatsappMatch.coachId = coachId;
                emailMatch.coachId = coachId;
            }
        }

        // Get WhatsApp stats
        const whatsappStats = await WhatsAppMessage.aggregate([
            { $match: whatsappMatch },
            { $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalCredits: { $sum: '$creditsUsed' }
            }}
        ]);

        // Get Email stats
        const emailStats = await EmailMessage.aggregate([
            { $match: emailMatch },
            { $group: {
                _id: '$status',
                count: { $sum: 1 }
            }}
        ]);

        // Get credits info
        let creditsBalance = 0;
        let totalCreditsUsed = 0;
        if (coachId && userType !== 'admin') {
            const credits = await WhatsAppCredit.findOne({ coachId });
            creditsBalance = credits?.balance || 0;
            totalCreditsUsed = whatsappStats
                .filter(s => s._id === 'sent')
                .reduce((sum, s) => sum + s.totalCredits, 0);
        }

        res.json({
            success: true,
            data: {
                userType,
                whatsapp: {
                    sent: whatsappStats.find(s => s._id === 'sent')?.count || 0,
                    total: whatsappStats.reduce((sum, s) => sum + s.count, 0)
                },
                email: {
                    sent: emailStats.find(s => s._id === 'sent')?.count || 0,
                    total: emailStats.reduce((sum, s) => sum + s.count, 0)
                },
                totalCreditsUsed,
                creditsBalance
            }
        });

    } catch (error) {
        console.error('❌ [CENTRAL_MESSAGING] getAnalytics - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get analytics',
            error: error.message
        });
    }
});

// ===== TEMPLATE MANAGEMENT =====

// @desc    Get templates
// @route   GET /api/central-messaging/v1/templates
// @access  Private (Coach/Staff/Admin)
exports.getTemplates = asyncHandler(async (req, res) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        const { type, category } = req.query;

        console.log('🔄 [CENTRAL_MESSAGING] getTemplates - Starting for user:', userId, 'role:', userRole);

        let coachId = null;
        let userType = 'coach';
        
        try {
            const context = await getUserContext(userId, userRole);
            coachId = context.coachId;
            userType = context.userType;
        } catch (contextError) {
            console.log('⚠️ [CENTRAL_MESSAGING] getUserContext failed, using defaults:', contextError.message);
        }

        // Get Meta templates using the same service as admin endpoint
        // This ensures consistent formatting and ALL coaches can see ALL templates
        let metaTemplates = [];
        try {
            const result = await centralWhatsAppService.getTemplates();
            // Filter for approved templates and add source field
            metaTemplates = (result.templates || [])
                .filter(t => t.status === 'APPROVED')
                .map(t => ({
                    ...t,
                    source: 'meta'
                }));
            console.log('📋 [CENTRAL_MESSAGING] Meta templates from service:', metaTemplates.length);
        } catch (serviceError) {
            console.error('⚠️ [CENTRAL_MESSAGING] Error fetching Meta templates:', serviceError.message);
            // Fallback to direct DB query
            const centralConfig = await CentralWhatsApp.findOne({ isActive: true });
            const rawMetaTemplates = centralConfig?.templates || [];
            metaTemplates = rawMetaTemplates
                .filter(t => t.status === 'APPROVED')
                .map(t => ({
                    ...t.toObject ? t.toObject() : t,
                    name: t.templateName || t.name,
                    templateName: t.templateName || t.name,
                    templateId: t.templateId || t._id?.toString(),
                    source: 'meta'
                }));
            console.log('📋 [CENTRAL_MESSAGING] Meta templates from fallback:', metaTemplates.length);
        }

        // Get local templates
        let localQuery = {};
        if (userType !== 'admin' && coachId) {
            localQuery.$or = [
                { isPreBuilt: true },
                { coachId: coachId }
            ];
        }

        if (type) {
            localQuery.type = type;
        }
        if (category) {
            localQuery.category = category;
        }

        const localTemplates = await MessageTemplate.find(localQuery);
        console.log('📋 [CENTRAL_MESSAGING] Local templates count:', localTemplates.length);

        res.json({
            success: true,
            data: {
                metaTemplates,
                localTemplates,
                userType,
                debug: {
                    metaCount: metaTemplates.length,
                    localCount: localTemplates.length
                }
            }
        });

    } catch (error) {
        console.error('❌ [CENTRAL_MESSAGING] getTemplates - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get templates',
            error: error.message
        });
    }
});

// @desc    Create template (Coach/Staff only)
// @route   POST /api/central-messaging/v1/templates
// @access  Private (Coach/Staff)
exports.createTemplate = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { name, description, type, category, content, availableVariables } = req.body;

        const { coachId, userType } = await getUserContext(userId, userRole);

        if (userType === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admins must create templates via Meta Business Manager'
            });
        }

        if (!name || !content || !content.body) {
            return res.status(400).json({
                success: false,
                message: 'Name and content body are required'
            });
        }

        const template = new MessageTemplate({
            coachId,
            name,
            description,
            type: type || 'universal',
            category: category || 'custom',
            content,
            availableVariables: availableVariables || [],
            isActive: true,
            isPreBuilt: false
        });

        await template.save();

        res.status(201).json({
            success: true,
            message: 'Template created successfully',
            data: template
        });

    } catch (error) {
        console.error('❌ [CENTRAL_MESSAGING] createTemplate - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create template',
            error: error.message
        });
    }
});

// ===== ADMIN CONFIGURATION =====

// @desc    Get messaging configuration (Admin only)
// @route   GET /api/central-messaging/v1/admin/config
// @access  Private (Admin)
exports.getConfig = asyncHandler(async (req, res) => {
    try {
        // Get WhatsApp config
        const whatsappConfig = await CentralWhatsApp.findOne({ isActive: true });
        
        // Get Email config
        const emailConfig = await AdminSystemSettings.findOne({ settingId: 'global' });

        res.json({
            success: true,
            data: {
                whatsapp: {
                    isConfigured: !!whatsappConfig,
                    phoneNumberId: whatsappConfig?.phoneNumberId,
                    businessAccountId: whatsappConfig?.businessAccountId,
                    templatesCount: whatsappConfig?.templates?.length || 0
                },
                email: {
                    isConfigured: !!(emailConfig?.notifications?.email),
                    fromEmail: emailConfig?.notifications?.email?.fromEmail,
                    provider: 'gmail'
                }
            }
        });
    } catch (error) {
        console.error('❌ [CENTRAL_MESSAGING] getConfig - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get configuration',
            error: error.message
        });
    }
});

// @desc    Update messaging configuration (Admin only)
// @route   PUT /api/central-messaging/v1/admin/config
// @access  Private (Admin)
exports.updateConfig = asyncHandler(async (req, res) => {
    try {
        const { whatsapp, email } = req.body;

        // Update WhatsApp config if provided
        if (whatsapp) {
            const whatsappConfig = await CentralWhatsApp.findOne({ isActive: true });
            if (whatsappConfig) {
                // Update fields as needed
                if (whatsapp.phoneNumberId) whatsappConfig.phoneNumberId = whatsapp.phoneNumberId;
                if (whatsapp.businessAccountId) whatsappConfig.businessAccountId = whatsapp.businessAccountId;
                await whatsappConfig.save();
            }
        }

        // Update Email config if provided
        if (email) {
            let emailConfig = await AdminSystemSettings.findOne({ settingId: 'global' });
            if (!emailConfig) {
                emailConfig = new AdminSystemSettings({ settingId: 'global' });
            }

            emailConfig.notifications = emailConfig.notifications || {};
            emailConfig.notifications.email = email;

            await emailConfig.save();
            
            // Clear email service cache
            emailConfigService.clearCache();
        }

        res.json({
            success: true,
            message: 'Configuration updated successfully'
        });
    } catch (error) {
        console.error('❌ [CENTRAL_MESSAGING] updateConfig - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update configuration',
            error: error.message
        });
    }
});

// ===== ADDITIONAL ENDPOINTS =====

// Helper function stubs for new endpoints - to be fully implemented
exports.getSystemOverview = asyncHandler(async (req, res) => {
    res.json({ success: true, message: 'To be implemented' });
});

exports.getAdminStats = asyncHandler(async (req, res) => {
    res.json({ success: true, message: 'To be implemented' });
});

exports.getConversation = asyncHandler(async (req, res) => {
    res.json({ success: true, message: 'To be implemented' });
});

exports.sendBulkMessages = asyncHandler(async (req, res) => {
    res.json({ success: true, message: 'To be implemented' });
});

exports.getCreditBalance = asyncHandler(async (req, res) => {
    res.json({ success: true, message: 'To be implemented' });
});

exports.getCreditPackages = asyncHandler(async (req, res) => {
    res.json({ success: true, message: 'To be implemented' });
});

exports.purchaseCredits = asyncHandler(async (req, res) => {
    res.json({ success: true, message: 'To be implemented' });
});

exports.getCreditTransactions = asyncHandler(async (req, res) => {
    res.json({ success: true, message: 'To be implemented' });
});

exports.getEmailConfig = asyncHandler(async (req, res) => {
    res.json({ success: true, message: 'To be implemented' });
});

exports.setupEmail = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_MESSAGING] setupEmail - Starting...');
        
        const { email, password, isUpdate } = req.body;
        
        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Get or create settings
        const { AdminSystemSettings } = require('../schema');
        let settings = await AdminSystemSettings.findOne({ settingId: 'global' });
        if (!settings) {
            settings = new AdminSystemSettings({ settingId: 'global' });
        }

        // Update email configuration
        settings.notifications = settings.notifications || {};
        settings.notifications.email = {
            enabled: true,
            gmailId: email,
            appPassword: password,
            fromEmail: email,
            fromName: 'FunnelsEye'
        };

        await settings.save();

        // Clear email service cache to force reload
        const emailConfigService = require('../services/emailConfigService');
        emailConfigService.clearCache();

        console.log('✅ [CENTRAL_MESSAGING] setupEmail - Success');
        
        res.json({
            success: true,
            message: isUpdate ? 'Email configuration updated successfully' : 'Email configuration saved successfully',
            data: {
                isUpdate: !!isUpdate
            }
        });
    } catch (error) {
        console.error('❌ [CENTRAL_MESSAGING] setupEmail - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to setup email configuration',
            error: error.message
        });
    }
});

exports.testEmail = asyncHandler(async (req, res) => {
    res.json({ success: true, message: 'To be implemented' });
});

exports.getWhatsAppConfig = asyncHandler(async (req, res) => {
    res.json({ success: true, message: 'To be implemented' });
});

exports.setupWhatsApp = asyncHandler(async (req, res) => {
    res.json({ success: true, message: 'To be implemented' });
});

exports.testWhatsApp = asyncHandler(async (req, res) => {
    res.json({ success: true, message: 'To be implemented' });
});

// @desc    Get Meta templates
// @route   GET /api/central-messaging/v1/admin/whatsapp/templates
// @access  Private (Admin)
exports.getMetaTemplates = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_MESSAGING] getMetaTemplates - Starting...');
        
        const result = await centralWhatsAppService.getTemplates();
        
        console.log('✅ [CENTRAL_MESSAGING] getMetaTemplates - Success');
        res.status(200).json({
            success: true,
            message: 'Templates retrieved successfully',
            data: result.templates || []
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_MESSAGING] getMetaTemplates - Error:', error);
        
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

// @desc    Sync templates from Meta
// @route   POST /api/central-messaging/v1/admin/whatsapp/templates/sync
// @access  Private (Admin)
exports.syncMetaTemplates = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_MESSAGING] syncMetaTemplates - Starting...');
        
        const result = await centralWhatsAppService.syncTemplates();
        
        console.log('✅ [CENTRAL_MESSAGING] syncMetaTemplates - Success');
        res.status(200).json({
            success: true,
            message: 'Templates synced successfully',
            data: {
                syncedCount: result.syncedTemplates || result.newCount || 0,
                addedCount: result.changes?.added || result.addedCount || 0,
                removedCount: result.changes?.removed || result.removedCount || 0,
                totalTemplates: result.changes?.total || result.newCount || 0
            }
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_MESSAGING] syncMetaTemplates - Error:', error);
        
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
                message: 'Failed to sync templates',
                error: error.message
            });
        }
    }
});

exports.getAssignedLeads = asyncHandler(async (req, res) => {
    res.json({ success: true, message: 'To be implemented' });
});

exports.getStaffContacts = asyncHandler(async (req, res) => {
    res.json({ success: true, message: 'To be implemented' });
});

exports.getStaffInbox = asyncHandler(async (req, res) => {
    res.json({ success: true, message: 'To be implemented' });
});

exports.previewMessage = asyncHandler(async (req, res) => {
    res.json({ success: true, message: 'To be implemented' });
});

exports.get24HourWindowContacts = asyncHandler(async (req, res) => {
    res.json({ success: true, message: 'To be implemented' });
});

exports.sendAutomationMessage = asyncHandler(async (req, res) => {
    res.json({ success: true, message: 'To be implemented' });
});

exports.handleAutomationWebhook = asyncHandler(async (req, res) => {
    res.json({ success: true, message: 'To be implemented' });
});

// Export all functions

