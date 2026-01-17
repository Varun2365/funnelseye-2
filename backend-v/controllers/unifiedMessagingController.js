const asyncHandler = require('../middleware/async');
const mongoose = require('mongoose');
const WhatsAppMessage = require('../schema/WhatsAppMessage');
const WhatsAppDevice = require('../schema/WhatsAppDevice');
const WhatsAppConversation = require('../schema/WhatsAppConversation');
const WhatsAppTemplate = require('../schema/WhatsAppTemplate');
const EmailMessage = require('../schema/EmailMessage');
// WhatsApp services removed - using centralWhatsAppService only
// const unifiedService = require('../whatsapp/services/unifiedWhatsAppService');
// const metaService = require('../whatsapp/services/metaWhatsAppService');
const centralWhatsAppService = require('../services/centralWhatsAppService');
const messageQueueService = require('../services/messageQueueService');
const emailConfigService = require('../services/emailConfigService');
const { Coach, Staff, Lead } = require('../schema');
const AdminSystemSettings = require('../schema/AdminSystemSettings');
const WhatsAppCredit = require('../schema/WhatsAppCredit');
const logger = require('../utils/logger');
const { SECTIONS } = require('../utils/sectionPermissions');

// Utility function to validate device ID
function validateDeviceId(deviceId) {
    if (!deviceId || deviceId === 'null' || deviceId === 'undefined') {
        return { isValid: false, message: 'Invalid device ID' };
    }
    
    if (!/^[0-9a-fA-F]{24}$/.test(deviceId)) {
        return { isValid: false, message: 'Invalid device ID format' };
    }
    
    return { isValid: true };
}

// Utility function to create WhatsApp message record
async function createWhatsAppMessage(messageData) {
    try {
        const message = new WhatsAppMessage({
            messageId: messageData.messageId,
            wamid: messageData.wamid,
            from: messageData.senderId,
            to: messageData.recipientPhone,
            type: messageData.messageType,
            content: messageData.content,
            timestamp: new Date(),
            direction: 'outbound',
            status: messageData.status,
            conversationId: messageData.conversationId,
            senderId: messageData.senderId,
            senderType: messageData.senderType,
            coachId: messageData.coachId,
            leadId: messageData.leadId,
            clientId: messageData.clientId,
            creditsUsed: messageData.creditsUsed,
            metaWindowInfo: {
                isWithin24Hours: true,
                windowExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            }
        });

        return await message.save();
    } catch (error) {
        console.error('Error creating WhatsApp message record:', error);
        throw error;
    }
}

// ===== DEBUG ENDPOINTS =====

// @desc    Debug endpoint to test QR setup page
// @route   GET /api/messagingv1/debug/qr-setup/:deviceId
// @access  Public (for debugging)
exports.debugQRSetup = asyncHandler(async (req, res) => {
    try {
        const { deviceId } = req.params;
        
        console.log('🔍 [DEBUG] QR Setup Debug - Device ID:', deviceId);
        
        // Validate deviceId
        const deviceValidation = validateDeviceId(deviceId);
        if (!deviceValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: deviceValidation.message,
                debug: {
                    deviceId,
                    validation: deviceValidation
                }
            });
        }
        
        // Check if device exists
        const device = await WhatsAppDevice.findOne({ _id: deviceId });
        
        return res.status(200).json({
            success: true,
            message: 'Debug info',
            data: {
                deviceId,
                deviceExists: !!device,
                device: device ? {
                    id: device._id,
                    name: device.deviceName,
                    type: device.deviceType,
                    phone: device.phoneNumber,
                    isActive: device.isActive,
                    sessionId: device.sessionId
                } : null,
                qrSetupUrl: `/whatsapp-qr-setup.html?device=${deviceId}`,
                qrApiUrl: null // Baileys service removed
            }
        });
        
    } catch (error) {
        console.error('❌ [DEBUG] debugQRSetup - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Debug error',
            error: error.message
        });
    }
});

// ===== COACH WHATSAPP SETTINGS MANAGEMENT =====

// @desc    Get coach WhatsApp settings
// @route   GET /api/messagingv1/settings
// @access  Private (Coach)
exports.getCoachWhatsAppSettings = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] getCoachWhatsAppSettings - Starting...');
        
        const coachId = req.user.id;
        
        // Get coach's WhatsApp devices
        const devices = await WhatsAppDevice.find({ coachId }).sort({ isDefault: -1, createdAt: -1 });
        
        // Get admin system settings for central WhatsApp
        const adminSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
        const centralWhatsAppEnabled = adminSettings?.whatsApp?.isEnabled || false;
        
        // Get coach's messaging credits
        const coach = await Coach.findOne({ selfCoachId: req.user.selfCoachId });
        const messagingCredits = coach?.messagingCredits || 0;
        
        // Get credit pricing from admin settings
        const creditPrice = adminSettings?.whatsApp?.creditPrice || 0.01;
        
        console.log('✅ [UNIFIED_MESSAGING] getCoachWhatsAppSettings - Success');
        res.status(200).json({
            success: true,
            data: {
                centralWhatsApp: {
                    enabled: centralWhatsAppEnabled,
                    available: centralWhatsAppEnabled
                },
                devices: devices.map(device => ({
                    id: device._id,
                    name: device.deviceName,
                    type: device.deviceType,
                    phoneNumber: device.phoneNumber,
                    isConnected: device.isConnected,
                    isDefault: device.isDefault,
                    isActive: device.isActive,
                    creditsPerMessage: device.creditsPerMessage,
                    messagesSentThisMonth: device.messagesSentThisMonth,
                    monthlyMessageLimit: device.monthlyMessageLimit,
                    lastConnected: device.lastConnected,
                    settings: device.settings
                })),
                credits: {
                    balance: messagingCredits,
                    pricePerCredit: creditPrice,
                    autoRecharge: adminSettings?.whatsApp?.autoRecharge || false,
                    rechargeThreshold: adminSettings?.whatsApp?.rechargeThreshold || 10
                }
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] getCoachWhatsAppSettings - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get WhatsApp settings',
            error: error.message
        });
    }
});

// @desc    Set coach WhatsApp settings
// @route   POST /api/messagingv1/settings
// @access  Private (Coach)
exports.setCoachWhatsAppSettings = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] setCoachWhatsAppSettings - Starting...');
        
        const coachId = req.user.id;
        const { 
            useCentralWhatsApp, 
            baileysSettings, 
            emailSettings,
            autoReplySettings 
        } = req.body;
        
        // Update coach's WhatsApp preference
        await Coach.findOneAndUpdate(
            { selfCoachId: req.user.selfCoachId },
            { 
                $set: {
                    'whatsAppSettings.useCentralWhatsApp': useCentralWhatsApp,
                    'whatsAppSettings.emailSettings': emailSettings,
                    'whatsAppSettings.autoReplySettings': autoReplySettings
                }
            }
        );
        
        // Baileys service removed - only Meta WhatsApp supported
        if (!useCentralWhatsApp && false) { // Disabled Baileys
            const { deviceName, phoneNumber } = {};
            
            // Create new device or update existing
            const device = await WhatsAppDevice.findOneAndUpdate(
                { coachId, deviceType: 'meta', phoneNumber },
                {
                    coachId,
                    deviceName: deviceName || 'My WhatsApp Device',
                    deviceType: 'meta',
                    phoneNumber,
                    isActive: true,
                    isDefault: true,
                    creditsPerMessage: 1
                },
                { upsert: true, new: true }
            );
            
            // Baileys service removed
            const sessionId = `session_${device._id}`;
            await device.updateOne({ sessionId });
            
            const initResult = { success: false, error: 'Baileys service not available' };
            
            console.log('✅ [UNIFIED_MESSAGING] setCoachWhatsAppSettings - Success');
            console.log('Device created/updated:', {
                deviceId: device._id,
                deviceName: device.deviceName,
                phoneNumber: device.phoneNumber,
                sessionId: sessionId
            });
            
            res.status(200).json({
                success: true,
                message: 'WhatsApp settings updated successfully',
                data: {
                    deviceId: device._id,
                    qrSetupUrl: `/whatapp-qr?device=${device._id}`,
                    sessionStatus: initResult.success ? 'initialized' : 'failed'
                }
            });
        } else {
            console.log('✅ [UNIFIED_MESSAGING] setCoachWhatsAppSettings - Success');
            res.status(200).json({
                success: true,
                message: 'WhatsApp settings updated successfully',
                data: {
                    useCentralWhatsApp: true
                }
            });
        }
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] setCoachWhatsAppSettings - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update WhatsApp settings',
            error: error.message
        });
    }
});

// ===== UNIFIED MESSAGING ENDPOINTS =====

// @desc    Send message via unified endpoint
// @route   POST /api/messagingv1/send
// @access  Private (Coach)
exports.sendMessage = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] sendMessage - Starting...');
        
        const coachId = req.user.id;
        
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
        const { 
            to, 
            message, 
            templateId, 
            deviceId, 
            type = 'text',
            mediaUrl,
            caption
        } = req.body;
        
        // Get coach's WhatsApp preference
        const coach = await Coach.findOne({ selfCoachId: req.user.selfCoachId });
        const useCentralWhatsApp = coach?.whatsAppSettings?.useCentralWhatsApp || false;
        
        let result;
        let deviceUsed;
        
        if (useCentralWhatsApp) {
            // Use central Meta WhatsApp
            try {
                // Initialize central WhatsApp service
                await centralWhatsAppService.initialize();
                
                // Queue message via Central WhatsApp service instead of sending directly
                let queueMessageData = {
                    to: to,
                    message: message,
                    text: message,
                    type: type || 'text',
                    coachId: coachId || null
                };

                if (templateId) {
                    // Queue template message
                    const template = await WhatsAppTemplate.findById(templateId);
                    if (!template) {
                        return res.status(400).json({
                            success: false,
                            message: 'Template not found'
                        });
                    }
                    
                    queueMessageData.type = 'template';
                    queueMessageData.templateName = template.name;
                    queueMessageData.templateParameters = req.body.templateParams || [];
                    queueMessageData.parameters = Array.isArray(req.body.templateParams) ? req.body.templateParams : Object.values(req.body.templateParams || []);
                } else if (type === 'image' || type === 'video' || type === 'document') {
                    // Queue media message
                    queueMessageData.type = 'media';
                    queueMessageData.mediaUrl = mediaUrl;
                    queueMessageData.mediaType = type;
                    queueMessageData.caption = caption;
                } else {
                    // Queue text message
                    queueMessageData.type = 'text';
                }
                
                const queued = await messageQueueService.queueWhatsAppMessage(queueMessageData);
                
                if (!queued) {
                    throw new Error('Failed to queue message');
                }
                
                result = { success: true, messageId: 'queued', status: 'queued' };
                deviceUsed = 'central';
                
            } catch (centralError) {
                console.error('❌ [CENTRAL_WHATSAPP] Error:', centralError.message);
                return res.status(500).json({
                    success: false,
                    message: 'Central WhatsApp service error',
                    error: centralError.message
                });
            }
        } else {
            // Baileys service removed
            let device;
            if (deviceId) {
                device = await WhatsAppDevice.findById(deviceId);
            } else {
                device = await WhatsAppDevice.findOne({ coachId, isDefault: true, isActive: true });
            }
            
            if (!device) {
                return res.status(400).json({
                    success: false,
                    message: 'No active WhatsApp device found'
                });
            }
            
            // Credits are already checked at the beginning of this method using WhatsAppCredit system
            
            // Baileys microservice removed - using Meta service only
            result = { success: false, error: 'Baileys service not available' };
            
            deviceUsed = device._id;
            
            // Deduct credits
            await Coach.findOneAndUpdate(
                { selfCoachId: req.user.selfCoachId },
                { $inc: { messagingCredits: -device.creditsPerMessage } }
            );
            
            // Update device message count
            await WhatsAppDevice.findByIdAndUpdate(device._id, {
                $inc: { messagesSentThisMonth: 1 }
            });
        }
        
        // Save message to database
        const messageRecord = new WhatsAppMessage({
            coachId,
            deviceId: deviceUsed,
            to,
            message: result.message || message,
            type,
            status: result.success ? 'sent' : 'failed',
            templateId,
            creditsUsed: deviceUsed !== 'central' ? (await WhatsAppDevice.findById(deviceUsed))?.creditsPerMessage || 1 : 0
        });
        
        await messageRecord.save();
        
        console.log('✅ [UNIFIED_MESSAGING] sendMessage - Success');
        res.status(200).json({
            success: result.success,
            message: result.success ? 'Message sent successfully' : 'Failed to send message',
            data: {
                messageId: messageRecord._id,
                status: result.success ? 'sent' : 'failed',
                deviceUsed,
                creditsUsed: messageRecord.creditsUsed
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] sendMessage - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message
        });
    }
});

// @desc    Get inbox messages
// @route   GET /api/messagingv1/inbox
// @access  Private (Coach)
exports.getInboxMessages = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] getInboxMessages - Starting...');
        
        const coachId = req.user.id;
        const { page = 1, limit = 20, contact } = req.query;
        
        // Build query
        const query = { coachId, direction: 'inbound' };
        if (contact) {
            query.from = new RegExp(contact, 'i');
        }
        
        // Get messages with pagination
        const messages = await WhatsAppMessage.find(query)
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('deviceId', 'deviceName deviceType phoneNumber');
        
        const total = await WhatsAppMessage.countDocuments(query);
        
        // Also get real-time messages from microservice for Baileys devices
        try {
            const baileysDevices = []; // Baileys service removed
            
            for (const device of baileysDevices) {
                try {
                    // Baileys microservice removed
                    const microserviceInbox = { success: false, data: [] };
                    
                    if (microserviceInbox.success && microserviceInbox.data.messages) {
                        // Merge microservice messages with database messages
                        messages.push(...microserviceInbox.data.messages);
                    }
                } catch (error) {
                    console.log(`Could not fetch microservice inbox for device ${device._id}:`, error.message);
                }
            }
            
            // Sort merged messages by timestamp
            messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } catch (error) {
            console.log('Could not fetch microservice inbox:', error.message);
        }
        
        // Get conversations summary
        const conversations = await WhatsAppMessage.aggregate([
            { $match: { coachId, direction: 'inbound' } },
            { $group: {
                _id: '$from',
                lastMessage: { $max: '$timestamp' },
                messageCount: { $sum: 1 },
                unreadCount: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } }
            }},
            { $sort: { lastMessage: -1 } },
            { $limit: 10 }
        ]);
        
        console.log('✅ [UNIFIED_MESSAGING] getInboxMessages - Success');
        res.status(200).json({
            success: true,
            data: {
                messages,
                conversations,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total,
                    limit: parseInt(limit)
                }
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] getInboxMessages - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get inbox messages',
            error: error.message
        });
    }
});

// ===== MESSAGE TEMPLATE MANAGEMENT =====

// @desc    Get message templates
// @route   GET /api/messagingv1/templates
// @access  Private (Coach)
exports.getMessageTemplates = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] getMessageTemplates - Starting...');
        
        const coachId = req.user.id;
        const { category, status } = req.query;
        
        // Get coach's custom templates
        const coachTemplates = await WhatsAppTemplate.find({
            coachId,
            ...(category && { category }),
            ...(status && { status })
        }).sort({ createdAt: -1 });
        
        // Get admin global templates
        const adminSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
        const globalTemplates = adminSettings?.whatsApp?.messageTemplates || [];
        
        console.log('✅ [UNIFIED_MESSAGING] getMessageTemplates - Success');
        res.status(200).json({
            success: true,
            data: {
                custom: coachTemplates,
                global: globalTemplates
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] getMessageTemplates - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get message templates',
            error: error.message
        });
    }
});

// @desc    Create message template
// @route   POST /api/messagingv1/templates
// @access  Private (Coach)
exports.createMessageTemplate = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] createMessageTemplate - Starting...');
        
        const coachId = req.user.id;
        const { name, content, category, language = 'en_US', variables } = req.body;
        
        const template = new WhatsAppTemplate({
            coachId,
            name,
            content,
            category,
            language,
            variables: variables || [],
            status: 'active'
        });
        
        await template.save();
        
        console.log('✅ [UNIFIED_MESSAGING] createMessageTemplate - Success');
        res.status(201).json({
            success: true,
            message: 'Template created successfully',
            data: template
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] createMessageTemplate - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create template',
            error: error.message
        });
    }
});

// ===== STAFF WHATSAPP INTEGRATION =====

// @desc    Get staff WhatsApp devices under coach
// @route   GET /api/messagingv1/staff/devices
// @access  Private (Coach)
exports.getStaffDevices = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] getStaffDevices - Starting...');
        
        const coachId = req.user.id;
        
        // Get all staff under this coach
        const staffMembers = await Staff.find({ coachId }).select('_id name email phone');
        
        // Get WhatsApp devices for all staff
        const staffIds = staffMembers.map(staff => staff._id);
        const staffDevices = await WhatsAppDevice.find({ 
            coachId: { $in: staffIds },
            deviceType: 'baileys'
        }).populate('coachId', 'name email phone');
        
        console.log('✅ [UNIFIED_MESSAGING] getStaffDevices - Success');
        res.status(200).json({
            success: true,
            data: {
                staff: staffMembers,
                devices: staffDevices.map(device => ({
                    id: device._id,
                    staffName: device.coachId?.name,
                    staffEmail: device.coachId?.email,
                    deviceName: device.deviceName,
                    phoneNumber: device.phoneNumber,
                    isConnected: device.isConnected,
                    isActive: device.isActive,
                    lastConnected: device.lastConnected
                }))
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] getStaffDevices - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get staff devices',
            error: error.message
        });
    }
});

// ===== MESSAGING STATISTICS =====

// @desc    Get messaging statistics
// @route   GET /api/messagingv1/stats
// @access  Private (Coach)
exports.getMessagingStats = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] getMessagingStats - Starting...');
        
        const coachId = req.user.id;
        const { period = '30d' } = req.query;
        
        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        if (period === '7d') {
            startDate.setDate(endDate.getDate() - 7);
        } else if (period === '30d') {
            startDate.setDate(endDate.getDate() - 30);
        } else if (period === '90d') {
            startDate.setDate(endDate.getDate() - 90);
        }
        
        // Get message statistics
        const messageStats = await WhatsAppMessage.aggregate([
            { $match: { 
                coachId, 
                timestamp: { $gte: startDate, $lte: endDate } 
            }},
            { $group: {
                _id: null,
                totalSent: { $sum: { $cond: [{ $eq: ['$direction', 'outbound'] }, 1, 0] } },
                totalReceived: { $sum: { $cond: [{ $eq: ['$direction', 'inbound'] }, 1, 0] } },
                totalCreditsUsed: { $sum: '$creditsUsed' },
                successfulSent: { $sum: { $cond: [{ $and: [{ $eq: ['$direction', 'outbound'] }, { $eq: ['$status', 'sent'] }] }, 1, 0] } },
                failedSent: { $sum: { $cond: [{ $and: [{ $eq: ['$direction', 'outbound'] }, { $eq: ['$status', 'failed'] }] }, 1, 0] } }
            }}
        ]);
        
        // Get daily message counts
        const dailyStats = await WhatsAppMessage.aggregate([
            { $match: { 
                coachId, 
                timestamp: { $gte: startDate, $lte: endDate } 
            }},
            { $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                sent: { $sum: { $cond: [{ $eq: ['$direction', 'outbound'] }, 1, 0] } },
                received: { $sum: { $cond: [{ $eq: ['$direction', 'inbound'] }, 1, 0] } }
            }},
            { $sort: { _id: 1 } }
        ]);
        
        // Get device statistics
        const deviceStats = await WhatsAppDevice.aggregate([
            { $match: { coachId } },
            { $lookup: {
                from: 'whatsappmessages',
                localField: '_id',
                foreignField: 'deviceId',
                as: 'messages',
                pipeline: [
                    { $match: { 
                        timestamp: { $gte: startDate, $lte: endDate },
                        direction: 'outbound'
                    }}
                ]
            }},
            { $project: {
                deviceName: 1,
                deviceType: 1,
                isConnected: 1,
                messagesSent: { $size: '$messages' }
            }}
        ]);
        
        const stats = messageStats[0] || {
            totalSent: 0,
            totalReceived: 0,
            totalCreditsUsed: 0,
            successfulSent: 0,
            failedSent: 0
        };
        
        console.log('✅ [UNIFIED_MESSAGING] getMessagingStats - Success');
        res.status(200).json({
            success: true,
            data: {
                period,
                overview: {
                    totalSent: stats.totalSent,
                    totalReceived: stats.totalReceived,
                    totalCreditsUsed: stats.totalCreditsUsed,
                    successRate: stats.totalSent > 0 ? (stats.successfulSent / stats.totalSent * 100).toFixed(2) : 0
                },
                dailyStats,
                deviceStats
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] getMessagingStats - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get messaging statistics',
            error: error.message
        });
    }
});

// ===== CONTACT MANAGEMENT =====

// @desc    Get contacts
// @route   GET /api/messagingv1/contacts
// @access  Private (Coach)
exports.getContacts = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] getContacts - Starting...');
        
        const coachId = req.user.id;
        const { page = 1, limit = 50, search } = req.query;
        
        // Get unique contacts from messages
        const contacts = await WhatsAppMessage.aggregate([
            { $match: { coachId } },
            { $group: {
                _id: { $ifNull: ['$from', '$to'] },
                lastMessage: { $max: '$timestamp' },
                messageCount: { $sum: 1 },
                unreadCount: { $sum: { $cond: [{ $and: [{ $eq: ['$direction', 'inbound'] }, { $eq: ['$isRead', false] }] }, 1, 0] } },
                lastMessageText: { $last: '$message' },
                direction: { $last: '$direction' }
            }},
            ...(search ? [{ $match: { _id: new RegExp(search, 'i') } }] : []),
            { $sort: { lastMessage: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: parseInt(limit) }
        ]);
        
        const total = await WhatsAppMessage.aggregate([
            { $match: { coachId } },
            { $group: { _id: { $ifNull: ['$from', '$to'] } } },
            { $count: 'total' }
        ]);
        
        console.log('✅ [UNIFIED_MESSAGING] getContacts - Success');
        res.status(200).json({
            success: true,
            data: {
                contacts,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil((total[0]?.total || 0) / limit),
                    total: total[0]?.total || 0,
                    limit: parseInt(limit)
                }
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] getContacts - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get contacts',
            error: error.message
        });
    }
});

// ===== HELPER FUNCTIONS =====

async function getTemplateMessage(templateId, params = {}) {
    try {
        const template = await WhatsAppTemplate.findById(templateId);
        if (!template) {
            throw new Error('Template not found');
        }
        
        let message = template.content;
        
        // Replace variables in template
        template.variables.forEach(variable => {
            const value = params[variable.name] || variable.defaultValue || `{${variable.name}}`;
            message = message.replace(new RegExp(`{${variable.name}}`, 'g'), value);
        });
        
        return message;
    } catch (error) {
        logger.error('[UNIFIED_MESSAGING] Error getting template message:', error);
        throw error;
    }
}

// @desc    Update message template
// @route   PUT /api/messagingv1/templates/:templateId
// @access  Private (Coach)
exports.updateMessageTemplate = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] updateMessageTemplate - Starting...');
        
        const coachId = req.user.id;
        const { templateId } = req.params;
        const { name, content, category, language, variables } = req.body;
        
        const template = await WhatsAppTemplate.findOneAndUpdate(
            { _id: templateId, coachId },
            { name, content, category, language, variables },
            { new: true }
        );
        
        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }
        
        console.log('✅ [UNIFIED_MESSAGING] updateMessageTemplate - Success');
        res.status(200).json({
            success: true,
            message: 'Template updated successfully',
            data: template
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] updateMessageTemplate - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update template',
            error: error.message
        });
    }
});

// @desc    Delete message template
// @route   DELETE /api/messagingv1/templates/:templateId
// @access  Private (Coach)
exports.deleteMessageTemplate = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] deleteMessageTemplate - Starting...');
        
        const coachId = req.user.id;
        const { templateId } = req.params;
        
        const template = await WhatsAppTemplate.findOneAndDelete({ _id: templateId, coachId });
        
        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }
        
        console.log('✅ [UNIFIED_MESSAGING] deleteMessageTemplate - Success');
        res.status(200).json({
            success: true,
            message: 'Template deleted successfully'
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] deleteMessageTemplate - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete template',
            error: error.message
        });
    }
});

// @desc    Create a new WhatsApp device
// @route   POST /api/messagingv1/devices
// @access  Private (Coach)
exports.createWhatsAppDevice = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] createWhatsAppDevice - Starting...');
        
        const coachId = req.user.id;
        const { deviceName, deviceType = 'meta', phoneNumber, description } = req.body;
        
        // Validate required fields
        if (!deviceName) {
            return res.status(400).json({
                success: false,
                message: 'Device name is required'
            });
        }
        
        if (!['meta'].includes(deviceType)) {
            return res.status(400).json({
                success: false,
                message: 'Device type must be "meta"'
            });
        }
        
        // Phone number required for Meta devices
        // For Meta, phone number is required
        if (deviceType === 'meta' && !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required for Meta WhatsApp devices'
            });
        }
        
        // Check if coach already has a default device
        const existingDefaultDevice = await WhatsAppDevice.findOne({ 
            coachId, 
            isDefault: true 
        });
        
        // Create new device
        const device = new WhatsAppDevice({
            coachId,
            deviceName,
            deviceType,
            phoneNumber: phoneNumber || '',
            description: description || '',
            isDefault: !existingDefaultDevice, // Set as default if no default device exists
            isActive: true,
            isConnected: false
        });
        
        await device.save();
        
        console.log('✅ [UNIFIED_MESSAGING] createWhatsAppDevice - Success');
        res.status(201).json({
            success: true,
            message: 'WhatsApp device created successfully',
            data: {
                deviceId: device._id,
                deviceName: device.deviceName,
                deviceType: device.deviceType,
                phoneNumber: device.phoneNumber,
                description: device.description,
                isDefault: device.isDefault,
                isActive: device.isActive,
                isConnected: device.isConnected,
                nextStep: 'Configure Meta credentials',
                createdAt: device.createdAt
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] createWhatsAppDevice - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create WhatsApp device',
            error: error.message
        });
    }
});

// @desc    Get all WhatsApp devices for coach
// @route   GET /api/messagingv1/devices
// @access  Private (Coach)
exports.getCoachWhatsAppDevices = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] getCoachWhatsAppDevices - Starting...');
        
        const coachId = req.user.id;
        
        const devices = await WhatsAppDevice.find({ coachId }).sort({ isDefault: -1, createdAt: -1 });
        
        console.log('✅ [UNIFIED_MESSAGING] getCoachWhatsAppDevices - Success');
        res.status(200).json({
            success: true,
            data: devices
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] getCoachWhatsAppDevices - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get WhatsApp devices',
            error: error.message
        });
    }
});

// ===== DEVICE MANAGEMENT =====

// @desc    Create a new WhatsApp device
// @route   POST /api/messagingv1/devices
// @access  Private (Coach)
exports.createWhatsAppDevice = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] createWhatsAppDevice - Starting...');
        
        const coachId = req.user.id;
        const { deviceName, deviceType = 'meta', phoneNumber, description } = req.body;
        
        // Validate required fields
        if (!deviceName) {
            return res.status(400).json({
                success: false,
                message: 'Device name is required'
            });
        }
        
        if (!['meta'].includes(deviceType)) {
            return res.status(400).json({
                success: false,
                message: 'Device type must be "meta"'
            });
        }
        
        // Phone number required for Meta devices
        // For Meta, phone number is required
        if (deviceType === 'meta' && !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required for Meta WhatsApp devices'
            });
        }
        
        // Check if coach already has a default device
        const existingDefaultDevice = await WhatsAppDevice.findOne({ 
            coachId, 
            isDefault: true 
        });
        
        // Create new device
        const device = new WhatsAppDevice({
            coachId,
            deviceName,
            deviceType,
            phoneNumber: phoneNumber || '',
            description: description || '',
            isDefault: !existingDefaultDevice, // Set as default if no default device exists
            isActive: true,
            isConnected: false
        });
        
        await device.save();
        
        console.log('✅ [UNIFIED_MESSAGING] createWhatsAppDevice - Success');
        res.status(201).json({
            success: true,
            message: 'WhatsApp device created successfully',
            data: {
                deviceId: device._id,
                deviceName: device.deviceName,
                deviceType: device.deviceType,
                phoneNumber: device.phoneNumber,
                description: device.description,
                isDefault: device.isDefault,
                isActive: device.isActive,
                isConnected: device.isConnected,
                nextStep: 'Configure Meta credentials',
                createdAt: device.createdAt
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] createWhatsAppDevice - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create WhatsApp device',
            error: error.message
        });
    }
});

// @desc    Get all WhatsApp devices for coach
// @route   GET /api/messagingv1/devices
// @access  Private (Coach)
exports.getCoachWhatsAppDevices = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] getCoachWhatsAppDevices - Starting...');
        
        const coachId = req.user.id;
        
        const devices = await WhatsAppDevice.find({ coachId }).sort({ isDefault: -1, createdAt: -1 });
        
        console.log('✅ [UNIFIED_MESSAGING] getCoachWhatsAppDevices - Success');
        res.status(200).json({
            success: true,
            data: devices
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] getCoachWhatsAppDevices - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get WhatsApp devices',
            error: error.message
        });
    }
});

// @desc    Update WhatsApp device
// @route   PUT /api/messagingv1/devices/:deviceId
// @access  Private (Coach)
exports.updateWhatsAppDevice = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] updateWhatsAppDevice - Starting...');
        
        const coachId = req.user.id;
        const { deviceId } = req.params;
        const { deviceName, description, isDefault, isActive } = req.body;
        
        // Validate deviceId
        const deviceValidation = validateDeviceId(deviceId);
        if (!deviceValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: deviceValidation.message
            });
        }
        
        // Verify device belongs to coach
        const device = await WhatsAppDevice.findOne({ _id: deviceId, coachId });
        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Device not found'
            });
        }
        
        // If setting as default, unset other default devices
        if (isDefault && !device.isDefault) {
            await WhatsAppDevice.updateMany(
                { coachId, _id: { $ne: deviceId } },
                { isDefault: false }
            );
        }
        
        // Update device
        const updatedDevice = await WhatsAppDevice.findByIdAndUpdate(
            deviceId,
            { deviceName, description, isDefault, isActive },
            { new: true }
        );
        
        console.log('✅ [UNIFIED_MESSAGING] updateWhatsAppDevice - Success');
        res.status(200).json({
            success: true,
            message: 'Device updated successfully',
            data: updatedDevice
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] updateWhatsAppDevice - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update device',
            error: error.message
        });
    }
});

// @desc    Delete WhatsApp device
// @route   DELETE /api/messagingv1/devices/:deviceId
// @access  Private (Coach)
exports.deleteWhatsAppDevice = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] deleteWhatsAppDevice - Starting...');
        
        const coachId = req.user.id;
        const { deviceId } = req.params;
        
        // Validate deviceId
        const deviceValidation = validateDeviceId(deviceId);
        if (!deviceValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: deviceValidation.message
            });
        }
        
        // Verify device belongs to coach
        const device = await WhatsAppDevice.findOne({ _id: deviceId, coachId });
        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Device not found'
            });
        }
        
        // Baileys service removed
        
        // Delete device
        await WhatsAppDevice.findByIdAndDelete(deviceId);
        
        console.log('✅ [UNIFIED_MESSAGING] deleteWhatsAppDevice - Success');
        res.status(200).json({
            success: true,
            message: 'Device deleted successfully'
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] deleteWhatsAppDevice - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete device',
            error: error.message
        });
    }
});

// ===== DEVICE STATUS MANAGEMENT =====

// @desc    Get device status
// @route   GET /api/messagingv1/devices/:deviceId/status
// @access  Private (Coach)
exports.getDeviceStatus = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] getDeviceStatus - Starting...');
        
        const coachId = req.user.id;
        const { deviceId } = req.params;
        
        // Validate deviceId
        const deviceValidation = validateDeviceId(deviceId);
        if (!deviceValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: deviceValidation.message
            });
        }
        
        // Verify device belongs to coach
        const device = await WhatsAppDevice.findOne({ _id: deviceId, coachId });
        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Device not found'
            });
        }
        
        let status = 'disconnected';
        
        // Baileys service removed - only Meta devices supported
        if (device.deviceType === 'meta') {
            // For Meta devices, assume connected if credentials are valid
            status = device.isActive ? 'connected' : 'disconnected';
        }
        
        console.log('✅ [UNIFIED_MESSAGING] getDeviceStatus - Success');
        res.status(200).json({
            success: true,
            data: {
                deviceId,
                deviceName: device.deviceName,
                deviceType: device.deviceType,
                phoneNumber: device.phoneNumber,
                status,
                isConnected: device.isConnected,
                isActive: device.isActive,
                lastConnected: device.lastConnected,
                sessionId: device.sessionId
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] getDeviceStatus - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get device status',
            error: error.message
        });
    }
});

// @desc    Switch WhatsApp device (set as default)
// @route   POST /api/messagingv1/devices/:deviceId/switch
// @access  Private (Coach)
exports.switchWhatsAppDevice = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] switchWhatsAppDevice - Starting...');
        
        const coachId = req.user.id;
        const { deviceId } = req.params;
        
        // Validate deviceId
        const deviceValidation = validateDeviceId(deviceId);
        if (!deviceValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: deviceValidation.message
            });
        }
        
        // Verify device belongs to coach
        const device = await WhatsAppDevice.findOne({ _id: deviceId, coachId });
        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Device not found'
            });
        }
        
        // Unset all other default devices
        await WhatsAppDevice.updateMany(
            { coachId, _id: { $ne: deviceId } },
            { isDefault: false }
        );
        
        // Set this device as default
        await WhatsAppDevice.findByIdAndUpdate(deviceId, { isDefault: true });
        
        console.log('✅ [UNIFIED_MESSAGING] switchWhatsAppDevice - Success');
        res.status(200).json({
            success: true,
            message: 'Device switched successfully',
            data: {
                deviceId,
                deviceName: device.deviceName,
                isDefault: true
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] switchWhatsAppDevice - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to switch device',
            error: error.message
        });
    }
});

// ===== INBOX AND MESSAGE HISTORY =====

// @desc    Get inbox messages with advanced filtering
// @route   GET /api/messagingv1/inbox
// @access  Private (Coach)
exports.getInboxMessages = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] getInboxMessages - Starting...');
        
        const coachId = req.user.id;
        const { 
            page = 1, 
            limit = 20, 
            contact, 
            deviceId, 
            status = 'all',
            dateFrom,
            dateTo,
            unreadOnly = false
        } = req.query;
        
        // Build query
        const query = { coachId, direction: 'inbound' };
        
        if (contact) {
            query.from = new RegExp(contact, 'i');
        }
        
        if (deviceId) {
            query.deviceId = deviceId;
        }
        
        if (status !== 'all') {
            query.status = status;
        }
        
        if (unreadOnly === 'true') {
            query.isRead = false;
        }
        
        if (dateFrom || dateTo) {
            query.timestamp = {};
            if (dateFrom) query.timestamp.$gte = new Date(dateFrom);
            if (dateTo) query.timestamp.$lte = new Date(dateTo);
        }
        
        // Get messages with pagination
        const messages = await WhatsAppMessage.find(query)
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('deviceId', 'deviceName deviceType phoneNumber');
        
        const total = await WhatsAppMessage.countDocuments(query);
        
        // Get conversations summary
        const conversations = await WhatsAppMessage.aggregate([
            { $match: { coachId, direction: 'inbound' } },
            { $group: {
                _id: '$from',
                lastMessage: { $max: '$timestamp' },
                messageCount: { $sum: 1 },
                unreadCount: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } },
                lastMessageText: { $last: '$message' },
                deviceId: { $last: '$deviceId' }
            }},
            { $sort: { lastMessage: -1 } },
            { $limit: 10 }
        ]);
        
        // Get unread count
        const unreadCount = await WhatsAppMessage.countDocuments({
            coachId,
            direction: 'inbound',
            isRead: false
        });
        
        console.log('✅ [UNIFIED_MESSAGING] getInboxMessages - Success');
        res.status(200).json({
            success: true,
            data: {
                messages,
                conversations,
                unreadCount,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total,
                    limit: parseInt(limit)
                }
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] getInboxMessages - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get inbox messages',
            error: error.message
        });
    }
});

// @desc    Get message history for a specific contact
// @route   GET /api/messagingv1/messages/:contact
// @access  Private (Coach)
exports.getMessageHistory = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] getMessageHistory - Starting...');
        
        const coachId = req.user.id;
        const { contact } = req.params;
        const { page = 1, limit = 50, deviceId } = req.query;
        
        // Build query
        const query = { 
            coachId,
            $or: [
                { from: contact },
                { to: contact }
            ]
        };
        
        if (deviceId) {
            query.deviceId = deviceId;
        }
        
        // Get messages with pagination
        const messages = await WhatsAppMessage.find(query)
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('deviceId', 'deviceName deviceType phoneNumber');
        
        const total = await WhatsAppMessage.countDocuments(query);
        
        // Mark messages as read
        await WhatsAppMessage.updateMany(
            { coachId, from: contact, isRead: false },
            { isRead: true, readAt: new Date() }
        );
        
        console.log('✅ [UNIFIED_MESSAGING] getMessageHistory - Success');
        res.status(200).json({
            success: true,
            data: {
                contact,
                messages: messages.reverse(), // Show oldest first
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total,
                    limit: parseInt(limit)
                }
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] getMessageHistory - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get message history',
            error: error.message
        });
    }
});

// @desc    Mark messages as read
// @route   PUT /api/messagingv1/messages/mark-read
// @access  Private (Coach)
exports.markMessagesAsRead = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] markMessagesAsRead - Starting...');
        
        const coachId = req.user.id;
        const { messageIds, contact } = req.body;
        
        let query = { coachId, isRead: false };
        
        if (messageIds && Array.isArray(messageIds)) {
            query._id = { $in: messageIds };
        } else if (contact) {
            query.from = contact;
        } else {
            return res.status(400).json({
                success: false,
                message: 'Either messageIds or contact is required'
            });
        }
        
        const result = await WhatsAppMessage.updateMany(query, {
            isRead: true,
            readAt: new Date()
        });
        
        console.log('✅ [UNIFIED_MESSAGING] markMessagesAsRead - Success');
        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} messages marked as read`,
            data: {
                modifiedCount: result.modifiedCount
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] markMessagesAsRead - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark messages as read',
            error: error.message
        });
    }
});

// ===== BAILEYS SPECIFIC OPERATIONS =====

// Baileys service removed
exports.getBaileysQR = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] getBaileysQR - Starting...');
        
        const { deviceId } = req.params;
        
        // Validate deviceId
        const deviceValidation = validateDeviceId(deviceId);
        if (!deviceValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: deviceValidation.message
            });
        }
        
        // Find device by ID (no auth required for QR display)
        const device = await WhatsAppDevice.findOne({ _id: deviceId });
        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Device not found'
            });
        }
        
        // Baileys microservice removed
        console.log('Getting QR code for device:', deviceId);
        const qrResponse = { success: false, error: 'Baileys service not available' };
        console.log('QR response:', JSON.stringify(qrResponse, null, 2));
        console.log('QR data received:', 'Not available');
        
        if (!qrResponse.success || !qrResponse.data) {
            return res.status(404).json({
                success: false,
                message: qrResponse.message || 'QR code not available. Please initialize the device first.',
                data: null
            });
        }
        
        console.log('✅ [UNIFIED_MESSAGING] getBaileysQR - Success');
        res.status(200).json({
            success: true,
            message: qrResponse.message || 'QR code retrieved successfully',
            data: {
                qrCode: qrResponse.data, // QR data URL is directly in qrResponse.data
                deviceId,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes from now
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] getBaileysQR - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get QR code',
            error: error.message
        });
    }
});

// Baileys service removed
exports.initializeBaileysConnection = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] initializeBaileysConnection - Starting...');
        
        const coachId = req.user.id;
        const { deviceId } = req.params;
        
        // Validate deviceId
        const deviceValidation = validateDeviceId(deviceId);
        if (!deviceValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: deviceValidation.message
            });
        }
        
        // Verify device belongs to coach
        const device = await WhatsAppDevice.findOne({ _id: deviceId, coachId });
        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Device not found'
            });
        }
        
        // For Baileys devices, if phoneNumber is still pending, we'll update it after QR scan
        // The phone number should already be set during device creation
        
        // Baileys microservice removed
        console.log(`🔄 [UNIFIED_MESSAGING] Baileys service not available for device ${deviceId}`);
        
        // Initialize Baileys session via microservice
        const sessionId = device.sessionId || `session_${device._id}`;
        if (!device.sessionId) {
            await device.updateOne({ sessionId });
        }
        
        console.log(`[UNIFIED_MESSAGING] Baileys microservice not available for device ${deviceId} for coach ${device.coachId}`);
        const result = { success: false, error: 'Baileys service not available' };
        
        if (result.success) {
            // Update device status
            await device.updateOne({ 
                isActive: true,
                lastConnected: new Date()
            });
            
            // Wait longer for QR generation, then get QR data
            console.log('🔄 [UNIFIED_MESSAGING] Waiting for QR generation...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Baileys microservice removed
            let qrResponse = { success: false, error: 'Baileys service not available' };
            console.log('🔄 [UNIFIED_MESSAGING] QR response:', 'Not available');
            
            console.log('✅ [UNIFIED_MESSAGING] initializeBaileysConnection - Success');
            res.status(200).json({
                success: result.success,
                message: result.success ? 'Connection initialized successfully' : 'Failed to initialize connection',
                data: {
                    deviceId,
                    sessionId,
                    status: result.success ? 'initialized' : 'failed',
                    qrSetupUrl: `/whatsapp-qr-setup.html?device=${deviceId}`,
                    qrCode: qrResponse.success ? qrResponse.data : null,
                    qrMessage: qrResponse.message || (qrResponse.success ? 'QR code generated successfully' : 'QR code not available yet')
                }
            });
        } else {
            console.log('❌ [UNIFIED_MESSAGING] initializeBaileysConnection - Failed');
            res.status(200).json({
                success: result.success,
                message: 'Failed to initialize connection',
                data: {
                    deviceId,
                    sessionId,
                    status: 'failed',
                    qrSetupUrl: `/whatsapp-qr-setup.html?device=${deviceId}`,
                    qrCode: null,
                    qrMessage: 'Device initialization failed'
                }
            });
        }
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] initializeBaileysConnection - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initialize connection',
            error: error.message
        });
    }
});

// Baileys service removed
exports.disconnectBaileys = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] disconnectBaileys - Starting...');
        
        const coachId = req.user.id;
        const { deviceId } = req.params;
        
        // Validate deviceId
        const deviceValidation = validateDeviceId(deviceId);
        if (!deviceValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: deviceValidation.message
            });
        }
        
        // Verify device belongs to coach
        const device = await WhatsAppDevice.findOne({ _id: deviceId, coachId });
        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Device not found'
            });
        }
        
        // Baileys microservice removed
        console.log('Baileys service not available');
        
        // Update device status
        await device.updateOne({ 
            isConnected: false,
            isActive: false,
            qrCode: null,
            qrCodeExpiry: null
        });
        
        console.log('✅ [UNIFIED_MESSAGING] disconnectBaileys - Success');
        res.status(200).json({
            success: true,
            message: 'WhatsApp disconnected successfully',
            data: {
                deviceId,
                status: 'disconnected'
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] disconnectBaileys - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to disconnect WhatsApp',
            error: error.message
        });
    }
});

// Baileys service removed
exports.getBaileysStatus = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] getBaileysStatus - Starting...');
        
        const coachId = req.user.id;
        const { deviceId } = req.params;
        
        // Validate deviceId
        const deviceValidation = validateDeviceId(deviceId);
        if (!deviceValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: deviceValidation.message
            });
        }
        
        // Verify device belongs to coach
        const device = await WhatsAppDevice.findOne({ _id: deviceId, coachId });
        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Device not found'
            });
        }
        
        // Baileys microservice removed
        const status = 'disconnected';
        
        console.log('✅ [UNIFIED_MESSAGING] getBaileysStatus - Success');
        res.status(200).json({
            success: true,
            data: {
                deviceId,
                deviceName: device.deviceName,
                deviceType: device.deviceType,
                phoneNumber: device.phoneNumber,
                status: status || 'disconnected',
                isConnected: device.isConnected,
                isActive: device.isActive,
                lastConnected: device.lastConnected,
                sessionId: device.sessionId
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] getBaileysStatus - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get connection status',
            error: error.message
        });
    }
});

// @desc    Force QR code generation
// @route   POST /api/messagingv1/baileys/force-qr/:deviceId
// @access  Private (Coach)
exports.forceQRGeneration = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] forceQRGeneration - Starting...');
        
        const coachId = req.user.id;
        const { deviceId } = req.params;
        
        // Validate deviceId
        const deviceValidation = validateDeviceId(deviceId);
        if (!deviceValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: deviceValidation.message
            });
        }
        
        // Verify device belongs to coach
        const device = await WhatsAppDevice.findOne({ _id: deviceId, coachId });
        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Device not found'
            });
        }
        
        // Baileys microservice removed
        const result = { success: false, error: 'Baileys service not available' };
        
        // Update device with new session ID if provided
        if (result.success && result.sessionId) {
            await device.updateOne({ sessionId: result.sessionId });
            console.log(`Updated device ${deviceId} with new session ID: ${result.sessionId}`);
        }
        
        console.log('✅ [UNIFIED_MESSAGING] forceQRGeneration - Success');
        res.status(200).json({
            success: true,
            message: 'QR generation forced successfully',
            data: {
                deviceId,
                result
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] forceQRGeneration - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to force QR generation',
            error: error.message
        });
    }
});

// ===== UNIFIED MESSAGING FUNCTIONS =====

// Helper function to get user context based on role
async function getUserContext(userId, userRole) {
    let coachId = null;
    let userType = userRole;
    
    if (userRole === 'staff') {
        const staff = await Staff.findById(userId).populate('coachId');
        if (!staff || !staff.coachId) {
            throw new Error('Staff member not found or not assigned to a coach');
        }
        coachId = staff.coachId._id;
        userType = 'staff';
    } else if (userRole === 'coach') {
        coachId = userId;
        userType = 'coach';
    } else if (userRole === 'admin') {
        coachId = null; // Admin can access all data
        userType = 'admin';
    }
    
    return { coachId, userType };
}

// @desc    Get unified inbox messages (role-based access)
// @route   GET /api/messagingv1/unified/inbox
// @access  Private (Coach/Staff/Admin)
exports.getUnifiedInboxMessages = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] getUnifiedInboxMessages - Starting...');
        
        const userId = req.user.id;
        const userRole = req.user.role;
        const { page = 1, limit = 20, contact, type, within24Hours } = req.query;
        
        // Get user context based on role
        const { coachId, userType } = await getUserContext(userId, userRole);
        
        // Build base query
        let whatsappQuery = { direction: 'inbound' };
        let emailQuery = { direction: 'inbound' };
        
        if (userType === 'admin') {
            // Admin can see all messages
            whatsappQuery = { direction: 'inbound' };
            emailQuery = { direction: 'inbound' };
        } else {
            // Coach and Staff can only see their coach's messages
            whatsappQuery = { coachId, direction: 'inbound' };
            emailQuery = { coachId, direction: 'inbound' };
        }
        
        // Apply filters
        if (contact) {
            whatsappQuery.from = new RegExp(contact, 'i');
            emailQuery.$or = [
                { 'from.email': new RegExp(contact, 'i') },
                { 'to.email': new RegExp(contact, 'i') }
            ];
        }
        
        if (type === 'whatsapp') {
            whatsappQuery.type = { $exists: true };
        } else if (type === 'email') {
            emailQuery.type = { $exists: true };
        }
        
        if (within24Hours === 'true') {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            whatsappQuery['metaWindowInfo.isWithin24Hours'] = true;
            whatsappQuery['metaWindowInfo.windowExpiresAt'] = { $gt: new Date() };
            emailQuery['metaWindowInfo.isWithin24Hours'] = true;
            emailQuery['metaWindowInfo.windowExpiresAt'] = { $gt: new Date() };
        }
        
        // Get WhatsApp messages
        const whatsappMessages = await WhatsAppMessage.find(whatsappQuery)
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('deviceId', 'deviceName deviceType phoneNumber')
            .populate('leadId', 'firstName lastName phone email');
        
        // Get Email messages
        const emailMessages = await EmailMessage.find(emailQuery)
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('leadId', 'firstName lastName phone email');
        
        // Combine and sort messages
        const allMessages = [
            ...whatsappMessages.map(msg => ({ ...msg.toObject(), messageType: 'whatsapp' })),
            ...emailMessages.map(msg => ({ ...msg.toObject(), messageType: 'email' }))
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Get total counts
        const whatsappTotal = await WhatsAppMessage.countDocuments(whatsappQuery);
        const emailTotal = await EmailMessage.countDocuments(emailQuery);
        const total = whatsappTotal + emailTotal;
        
        // Get conversations summary (unified)
        const whatsappConversations = await WhatsAppMessage.aggregate([
            { $match: whatsappQuery },
            { $group: {
                _id: '$from',
                lastMessage: { $first: '$$ROOT' },
                unreadCount: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } },
                totalMessages: { $sum: 1 },
                messageType: { $first: 'whatsapp' }
            }},
            { $sort: { 'lastMessage.timestamp': -1 } }
        ]);
        
        const emailConversations = await EmailMessage.aggregate([
            { $match: emailQuery },
            { $group: {
                _id: '$from.email',
                lastMessage: { $first: '$$ROOT' },
                unreadCount: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } },
                totalMessages: { $sum: 1 },
                messageType: { $first: 'email' }
            }},
            { $sort: { 'lastMessage.timestamp': -1 } }
        ]);
        
        // Combine conversations
        const allConversations = [
            ...whatsappConversations,
            ...emailConversations
        ].sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp))
         .slice(0, 50);
        
        console.log('✅ [UNIFIED_MESSAGING] getUnifiedInboxMessages - Success');
        res.status(200).json({
            success: true,
            data: {
                messages: allMessages,
                conversations: allConversations,
                userType,
                stats: {
                    whatsapp: whatsappTotal,
                    email: emailTotal,
                    total: total
                },
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total,
                    limit: parseInt(limit)
                }
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] getUnifiedInboxMessages - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get unified inbox messages',
            error: error.message
        });
    }
});

// @desc    Get unified templates based on user role
// @route   GET /api/messagingv1/unified/templates
// @access  Private (Coach/Staff/Admin)
exports.getUnifiedTemplates = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] getUnifiedTemplates - Starting...');
        
        const userId = req.user.id;
        const userRole = req.user.role;
        
        // Get user context based on role
        const { coachId, userType } = await getUserContext(userId, userRole);
        
        // Get templates from central WhatsApp
        const result = await centralWhatsAppService.getTemplates();
        let templates = result.templates;
        
        // Filter templates based on user type
        if (userType === 'admin') {
            // Admin can see all templates
            templates = result.templates;
        } else {
            // Coach and Staff can only see approved templates
            templates = result.templates.filter(template => 
                template.status === 'APPROVED'
            );
        }
        
        console.log('✅ [UNIFIED_MESSAGING] getUnifiedTemplates - Success');
        res.status(200).json({
            success: true,
            data: templates,
            userType
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] getUnifiedTemplates - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get unified templates',
            error: error.message
        });
    }
});

// @desc    Send unified message (role-based permissions)
// @route   POST /api/messagingv1/unified/send
// @access  Private (Coach/Staff/Admin)
exports.sendUnifiedMessage = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] sendUnifiedMessage - Starting...');

        const userId = req.user.id;
        const userRole = req.user.role;
        const { to, message, templateName, templateParameters = [], type = 'text', mediaUrl, mediaType, caption, messageType = 'whatsapp', subject, emailBody, leadId, clientId } = req.body;

        // Get user context based on role
        const { coachId, userType } = await getUserContext(userId, userRole);

        // Validate required fields
        if (!to) {
            return res.status(400).json({
                success: false,
                message: 'Recipient is required'
            });
        }

        if (messageType === 'whatsapp') {
            if (type === 'text' && !message) {
                return res.status(400).json({
                    success: false,
                    message: 'Message content is required for text messages'
                });
            }

            if (type === 'template' && !templateName) {
                return res.status(400).json({
                    success: false,
                    message: 'Template name is required for template messages'
                });
            }
        } else if (messageType === 'email') {
            if (!subject) {
                return res.status(400).json({
                    success: false,
                    message: 'Subject is required for email messages'
                });
            }

            if (!emailBody && !message) {
                return res.status(400).json({
                    success: false,
                    message: 'Email body is required'
                });
            }
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

        let result;

        if (messageType === 'whatsapp') {
            // Initialize central WhatsApp service
            await centralWhatsAppService.initialize();
            
            // Create conversation ID
            const conversationId = WhatsAppMessage.createConversationId(userId, to);
            
            // Prepare message data for tracking
            let messageData = {
                messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                wamid: '', // Will be updated after sending
                senderId: userId,
                senderType: userType,
                recipientPhone: to,
                conversationId,
                creditsUsed: userType === 'admin' ? 0 : 1, // Admin messages don't use credits
                leadId: leadId || null,
                clientId: clientId || null,
                coachId: userType === 'admin' ? null : coachId
            };
            
            // Queue message instead of sending directly
            const queueMessageData = {
                to: to,
                message: message,
                text: message,
                type: templateName ? 'template' : (mediaUrl ? 'media' : 'text'),
                templateName: templateName,
                templateParameters: templateParameters || [],
                parameters: Array.isArray(templateParameters) ? templateParameters : Object.values(templateParameters || {}),
                mediaUrl: mediaUrl,
                mediaType: mediaType || 'image',
                caption: caption,
                coachId: userType === 'admin' ? null : coachId
            };

            const queued = await messageQueueService.queueWhatsAppMessage(queueMessageData);
            
            if (!queued) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to queue message',
                    error: 'Message queue service unavailable'
                });
            }
            
            result = { success: true, messageId: 'queued', status: 'queued' };
            
            messageData.messageType = templateName ? 'template' : (mediaUrl ? 'media' : 'text');
            messageData.content = templateName ? {
                templateName,
                templateParameters: templateParameters || []
            } : mediaUrl ? {
                mediaUrl,
                mediaType: mediaType || 'image',
                caption: message || null
            } : {
                text: message
            };
            messageData.status = 'queued';
            
            // Create message record (will be updated by worker when sent)
            const messageRecord = await createWhatsAppMessage(messageData);
            
            result = {
                success: true,
                messageId: result.messageId || result.id,
                wamid: result.messageId || result.id,
                recordId: messageRecord._id,
                recipient: result.recipient,
                status: result.status,
                conversationId: conversationId,
                messageType: 'whatsapp'
            };

            // Deduct credits for non-admin users
            if (userType !== 'admin' && coachId) {
                const credits = await WhatsAppCredit.getOrCreateCredits(coachId);
                await credits.useCredits(1);
            }

        } else if (messageType === 'email') {
            // For email, we'll use a simplified approach for now
            // In a full implementation, you'd integrate with your email service
            const emailMessageId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            result = {
                success: true,
                messageId: emailMessageId,
                status: 'sent',
                recipient: to,
                messageType: 'email'
            };
        }

        console.log('✅ [UNIFIED_MESSAGING] sendUnifiedMessage - Success');
        res.status(200).json({
            success: true,
            data: result,
            userType,
            message: 'Message sent successfully'
        });

    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] sendUnifiedMessage - Error:', error);
        
        let errorMessage = 'Failed to send unified message';
        if (error.code === 'TEMPLATE_NOT_FOUND') {
            errorMessage = `Template Error: ${error.message}`;
        } else if (error.response?.data?.error?.message) {
            errorMessage = error.response.data.error.message;
        } else {
            errorMessage = error.message;
        }
        
        res.status(500).json({
            success: false,
            message: errorMessage,
            error: error.response?.data?.error || error.message
        });
    }
});

// @desc    Send unified bulk messages (role-based permissions)
// @route   POST /api/messagingv1/unified/send-bulk
// @access  Private (Coach/Staff/Admin)
exports.sendUnifiedBulkMessages = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] sendUnifiedBulkMessages - Starting...');
        
        const userId = req.user.id;
        const userRole = req.user.role;
        const { recipients, message, templateId, templateParameters = {}, type = 'text', mediaUrl, caption } = req.body;
        
        // Get user context based on role
        const { coachId, userType } = await getUserContext(userId, userRole);
        
        // Validate required fields
        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Recipients array is required and must not be empty'
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
        
        // Check credits for non-admin users
        if (userType !== 'admin' && coachId) {
            const credits = await WhatsAppCredit.getOrCreateCredits(coachId);
            const requiredCredits = recipients.length;
            if (!credits.canSendMessage() || credits.balance < requiredCredits) {
                return res.status(402).json({
                    success: false,
                    message: 'Insufficient credits to send bulk messages',
                    data: {
                        balance: credits.balance,
                        required: requiredCredits
                    }
                });
            }
        }
        
        // Send bulk messages
        const results = [];
        for (const recipient of recipients) {
            try {
                const messageData = {
                    to: recipient.phone || recipient,
                    message,
                    templateId,
                    templateParameters,
                    type,
                    mediaUrl,
                    caption,
                    senderType: userType,
                    senderId: userId,
                    coachId: userType === 'admin' ? null : coachId
                };
                
                const result = await centralWhatsAppService.sendMessage(messageData);
                results.push({
                    recipient,
                    success: true,
                    result
                });
                
                // Small delay between messages to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                results.push({
                    recipient,
                    success: false,
                    error: error.message
                });
            }
        }
        
        // Deduct credits for successful sends (non-admin users only)
        if (userType !== 'admin' && coachId) {
            const credits = await WhatsAppCredit.getOrCreateCredits(coachId);
            const successfulSends = results.filter(r => r.success).length;
            await credits.useCredits(successfulSends);
        }
        
        console.log('✅ [UNIFIED_MESSAGING] sendUnifiedBulkMessages - Success');
        res.status(200).json({
            success: true,
            data: {
                totalRecipients: recipients.length,
                successfulSends: results.filter(r => r.success).length,
                failedSends: recipients.length - results.filter(r => r.success).length,
                results
            },
            userType,
            message: `Bulk messages sent: ${results.filter(r => r.success).length}/${recipients.length} successful`
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] sendUnifiedBulkMessages - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send unified bulk messages',
            error: error.message
        });
    }
});

// @desc    Get unified conversation messages (role-based access)
// @route   GET /api/messagingv1/unified/inbox/conversation/:contactId
// @access  Private (Coach/Staff/Admin)
exports.getUnifiedConversation = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] getUnifiedConversation - Starting...');
        
        const userId = req.user.id;
        const userRole = req.user.role;
        const { contactId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        
        // Get user context based on role
        const { coachId, userType } = await getUserContext(userId, userRole);
        
        // Build queries for both WhatsApp and Email
        let whatsappQuery = {
            $or: [
                { from: contactId },
                { to: contactId }
            ]
        };
        
        let emailQuery = {
            $or: [
                { 'from.email': contactId },
                { 'to.email': contactId }
            ]
        };
        
        if (userType !== 'admin') {
            // Coach and Staff can only see their coach's conversations
            whatsappQuery.coachId = coachId;
            emailQuery.coachId = coachId;
        }
        
        // Get WhatsApp messages
        const whatsappMessages = await WhatsAppMessage.find(whatsappQuery)
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('deviceId', 'deviceName deviceType phoneNumber')
            .populate('leadId', 'firstName lastName phone email');
        
        // Get Email messages
        const emailMessages = await EmailMessage.find(emailQuery)
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('leadId', 'firstName lastName phone email');
        
        // Combine and sort messages
        const allMessages = [
            ...whatsappMessages.map(msg => ({ ...msg.toObject(), messageType: 'whatsapp' })),
            ...emailMessages.map(msg => ({ ...msg.toObject(), messageType: 'email' }))
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Get total counts
        const whatsappTotal = await WhatsAppMessage.countDocuments(whatsappQuery);
        const emailTotal = await EmailMessage.countDocuments(emailQuery);
        const total = whatsappTotal + emailTotal;
        
        console.log('✅ [UNIFIED_MESSAGING] getUnifiedConversation - Success');
        res.status(200).json({
            success: true,
            data: {
                messages: allMessages.reverse(), // Reverse to show oldest first
                userType,
                stats: {
                    whatsapp: whatsappTotal,
                    email: emailTotal,
                    total: total
                },
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total,
                    limit: parseInt(limit)
                }
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] getUnifiedConversation - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get unified conversation',
            error: error.message
        });
    }
});

// @desc    Get available parameters for template assignment
// @route   GET /api/messagingv1/unified/parameter-options
// @access  Private (Coach/Staff/Admin)
exports.getParameterOptions = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] getParameterOptions - Starting...');
        
        const userId = req.user.id;
        const userRole = req.user.role;
        
        // Get user context based on role
        const { coachId, userType } = await getUserContext(userId, userRole);
        
        // Get available parameters from database schemas
        const parameterOptions = {
            lead: {
                firstName: 'Lead First Name',
                lastName: 'Lead Last Name',
                fullName: 'Lead Full Name',
                phone: 'Lead Phone Number',
                email: 'Lead Email Address',
                company: 'Lead Company',
                source: 'Lead Source',
                status: 'Lead Status'
            },
            coach: {
                firstName: 'Coach First Name',
                lastName: 'Coach Last Name',
                fullName: 'Coach Full Name',
                phone: 'Coach Phone Number',
                email: 'Coach Email Address',
                company: 'Coach Company'
            },
            system: {
                currentDate: 'Current Date',
                currentTime: 'Current Time',
                currentDateTime: 'Current Date & Time',
                platformName: 'Platform Name (FunnelsEye)'
            },
            custom: {
                // Custom parameters can be added here
            }
        };
        
        console.log('✅ [UNIFIED_MESSAGING] getParameterOptions - Success');
        res.status(200).json({
            success: true,
            data: parameterOptions,
            userType
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] getParameterOptions - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get parameter options',
            error: error.message
        });
    }
});

// @desc    Get contacts within Meta 24-hour window
// @route   GET /api/messagingv1/unified/24hr-contacts
// @access  Private (Coach/Staff/Admin)
exports.get24HourContacts = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] get24HourContacts - Starting...');
        
        const userId = req.user.id;
        const userRole = req.user.role;
        const { page = 1, limit = 20 } = req.query;
        
        // Get user context based on role
        const { coachId, userType } = await getUserContext(userId, userRole);
        
        // Build query for contacts within 24-hour window
        let whatsappQuery = {
            'metaWindowInfo.isWithin24Hours': true,
            'metaWindowInfo.windowExpiresAt': { $gt: new Date() }
        };
        
        let emailQuery = {
            'metaWindowInfo.isWithin24Hours': true,
            'metaWindowInfo.windowExpiresAt': { $gt: new Date() }
        };
        
        if (userType !== 'admin') {
            whatsappQuery.coachId = coachId;
            emailQuery.coachId = coachId;
        }
        
        // Get WhatsApp contacts within 24-hour window
        const whatsappContacts = await WhatsAppMessage.aggregate([
            { $match: whatsappQuery },
            { $group: {
                _id: '$from',
                lastMessage: { $first: '$$ROOT' },
                messageCount: { $sum: 1 },
                windowExpiresAt: { $first: '$metaWindowInfo.windowExpiresAt' }
            }},
            { $sort: { 'lastMessage.timestamp': -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit * 1 }
        ]);
        
        // Get Email contacts within 24-hour window
        const emailContacts = await EmailMessage.aggregate([
            { $match: emailQuery },
            { $group: {
                _id: '$from.email',
                lastMessage: { $first: '$$ROOT' },
                messageCount: { $sum: 1 },
                windowExpiresAt: { $first: '$metaWindowInfo.windowExpiresAt' }
            }},
            { $sort: { 'lastMessage.timestamp': -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit * 1 }
        ]);
        
        // Combine contacts
        const allContacts = [
            ...whatsappContacts.map(contact => ({ ...contact, messageType: 'whatsapp' })),
            ...emailContacts.map(contact => ({ ...contact, messageType: 'email' }))
        ].sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));
        
        // Get total counts
        const whatsappTotal = await WhatsAppMessage.countDocuments(whatsappQuery);
        const emailTotal = await EmailMessage.countDocuments(emailQuery);
        const total = whatsappTotal + emailTotal;
        
        console.log('✅ [UNIFIED_MESSAGING] get24HourContacts - Success');
        res.status(200).json({
            success: true,
            data: {
                contacts: allContacts,
                stats: {
                    whatsapp: whatsappTotal,
                    email: emailTotal,
                    total: total
                },
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total,
                    limit: parseInt(limit)
                }
            },
            userType
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] get24HourContacts - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get 24-hour contacts',
            error: error.message
        });
    }
});

// @desc    Get RabbitMQ queue statistics
// @route   GET /api/messagingv1/unified/queue-stats
// @access  Private (Coach/Staff/Admin)
exports.getQueueStats = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] getQueueStats - Starting...');
        
        const userId = req.user.id;
        const userRole = req.user.role;
        
        // Get user context based on role
        const { coachId, userType } = await getUserContext(userId, userRole);
        
        // Get queue statistics
        const queueStats = await messageQueueService.getQueueStats();
        
        if (!queueStats) {
            return res.status(500).json({
                success: false,
                message: 'Failed to get queue statistics'
            });
        }
        
        console.log('✅ [UNIFIED_MESSAGING] getQueueStats - Success');
        res.status(200).json({
            success: true,
            data: queueStats,
            userType
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] getQueueStats - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get queue statistics',
            error: error.message
        });
    }
});

module.exports = {
    // Debug endpoints
    debugQRSetup: exports.debugQRSetup,
    
    // Coach settings
    getCoachWhatsAppSettings: exports.getCoachWhatsAppSettings,
    setCoachWhatsAppSettings: exports.setCoachWhatsAppSettings,
    
    // Messaging
    sendMessage: exports.sendMessage,
    getInboxMessages: exports.getInboxMessages,
    
    // Templates
    getMessageTemplates: exports.getMessageTemplates,
    createMessageTemplate: exports.createMessageTemplate,
    updateMessageTemplate: exports.updateMessageTemplate,
    deleteMessageTemplate: exports.deleteMessageTemplate,
    
    // Staff integration
    getStaffDevices: exports.getStaffDevices,
    
    // Statistics and contacts
    getMessagingStats: exports.getMessagingStats,
    getContacts: exports.getContacts,
    
    // Device Management
    createWhatsAppDevice: exports.createWhatsAppDevice,
    getCoachWhatsAppDevices: exports.getCoachWhatsAppDevices,
    updateWhatsAppDevice: exports.updateWhatsAppDevice,
    deleteWhatsAppDevice: exports.deleteWhatsAppDevice,
    
    // Device Status Management
    getDeviceStatus: exports.getDeviceStatus,
    switchWhatsAppDevice: exports.switchWhatsAppDevice,
    
    // Message History and Inbox
    getMessageHistory: exports.getMessageHistory,
    markMessagesAsRead: exports.markMessagesAsRead,
    
    // Baileys service removed
    forceQRGeneration: exports.forceQRGeneration,
    
    // Unified messaging functions
    getUnifiedInboxMessages: exports.getUnifiedInboxMessages,
    getUnifiedTemplates: exports.getUnifiedTemplates,
    sendUnifiedMessage: exports.sendUnifiedMessage,
    sendUnifiedBulkMessages: exports.sendUnifiedBulkMessages,
    getUnifiedConversation: exports.getUnifiedConversation,
    
    // Enhanced unified messaging
    getParameterOptions: exports.getParameterOptions,
    get24HourContacts: exports.get24HourContacts,
    getQueueStats: exports.getQueueStats
};
