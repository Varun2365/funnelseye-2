const asyncHandler = require('../middleware/async');
const WhatsAppMessage = require('../schema/WhatsAppMessage');
const WhatsAppDevice = require('../schema/WhatsAppDevice');
const WhatsAppConversation = require('../schema/WhatsAppConversation');
const WhatsAppTemplate = require('../schema/WhatsAppTemplate');
// WhatsApp services removed - using centralWhatsAppService only
// const unifiedService = require('../whatsapp/services/unifiedWhatsAppService');
// const metaService = require('../whatsapp/services/metaWhatsAppService');
const centralWhatsAppService = require('../services/centralWhatsAppService');
const { Coach, Staff } = require('../schema');
const AdminSystemSettings = require('../schema/AdminSystemSettings');
const logger = require('../utils/logger');

// ===== SYSTEM OVERVIEW =====

// @desc    Get unified messaging system overview
// @route   GET /api/messagingv1/admin/overview
// @access  Private (Admin)
exports.getSystemOverview = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING_ADMIN] getSystemOverview - Starting...');
        
        // Get system statistics
        const [
            totalDevices,
            activeDevices,
            totalMessages,
            totalCoaches,
            totalStaff,
            recentMessages,
            systemHealth
        ] = await Promise.all([
            WhatsAppDevice.countDocuments(),
            WhatsAppDevice.countDocuments({ isActive: true, isConnected: true }),
            WhatsAppMessage.countDocuments(),
            Coach.countDocuments(),
            Staff.countDocuments(),
            WhatsAppMessage.find()
                .sort({ timestamp: -1 })
                .limit(10)
                .populate('coachId', 'name email selfCoachId')
                .select('to message type status timestamp direction'),
            checkSystemHealth()
        ]);
        
        // Get today's message count
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const messagesToday = await WhatsAppMessage.countDocuments({
            timestamp: { $gte: today }
        });
        
        // Get admin settings
        const adminSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
        const centralWhatsAppEnabled = adminSettings?.whatsApp?.isEnabled || false;
        
        console.log('✅ [UNIFIED_MESSAGING_ADMIN] getSystemOverview - Success');
        res.status(200).json({
            success: true,
            data: {
                devices: {
                    total: totalDevices,
                    active: activeDevices,
                    inactive: totalDevices - activeDevices,
                    types: {
                        baileys: await WhatsAppDevice.countDocuments({ deviceType: 'baileys' }),
                        meta: await WhatsAppDevice.countDocuments({ deviceType: 'meta' })
                    }
                },
                messages: {
                    total: totalMessages,
                    today: messagesToday,
                    recent: recentMessages
                },
                users: {
                    coaches: totalCoaches,
                    staff: totalStaff
                },
                system: {
                    centralWhatsAppEnabled,
                    health: systemHealth,
                    lastChecked: new Date()
                }
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING_ADMIN] getSystemOverview - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get system overview',
            error: error.message
        });
    }
});

// ===== DEVICE MANAGEMENT =====

// @desc    Get all WhatsApp devices across coaches
// @route   GET /api/messagingv1/admin/devices
// @access  Private (Admin)
exports.getAllDevices = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING_ADMIN] getAllDevices - Starting...');
        
        const { page = 1, limit = 20, type, status, coachId } = req.query;
        
        // Build query
        const query = {};
        if (type) query.deviceType = type;
        if (status === 'active') query.isActive = true;
        if (status === 'connected') query.isConnected = true;
        if (coachId) query.coachId = coachId;
        
        // Get devices with pagination
        const devices = await WhatsAppDevice.find(query)
            .populate('coachId', 'name email selfCoachId')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const total = await WhatsAppDevice.countDocuments(query);
        
        // Get device statistics
        const deviceStats = await WhatsAppDevice.aggregate([
            { $group: {
                _id: '$deviceType',
                count: { $sum: 1 },
                active: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
                connected: { $sum: { $cond: [{ $eq: ['$isConnected', true] }, 1, 0] } }
            }}
        ]);
        
        console.log('✅ [UNIFIED_MESSAGING_ADMIN] getAllDevices - Success');
        res.status(200).json({
            success: true,
            data: {
                devices: devices.map(device => ({
                    id: device._id,
                    name: device.deviceName,
                    type: device.deviceType,
                    phoneNumber: device.phoneNumber,
                    isActive: device.isActive,
                    isConnected: device.isConnected,
                    isDefault: device.isDefault,
                    coachId: device.coachId?._id,
                    coachName: device.coachId?.name,
                    coachEmail: device.coachId?.email,
                    coachSelfId: device.coachId?.selfCoachId,
                    lastConnected: device.lastConnected,
                    messagesSentThisMonth: device.messagesSentThisMonth,
                    monthlyMessageLimit: device.monthlyMessageLimit,
                    creditsPerMessage: device.creditsPerMessage,
                    createdAt: device.createdAt
                })),
                stats: deviceStats,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total,
                    limit: parseInt(limit)
                }
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING_ADMIN] getAllDevices - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get devices',
            error: error.message
        });
    }
});

// ===== MESSAGE MANAGEMENT =====

// @desc    Get all messages across coaches
// @route   GET /api/messagingv1/admin/messages
// @access  Private (Admin)
exports.getAllMessages = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING_ADMIN] getAllMessages - Starting...');
        
        const { 
            page = 1, 
            limit = 20, 
            coachId, 
            deviceId, 
            direction, 
            status, 
            startDate, 
            endDate,
            search 
        } = req.query;
        
        // Build query
        const query = {};
        if (coachId) query.coachId = coachId;
        if (deviceId) query.deviceId = deviceId;
        if (direction) query.direction = direction;
        if (status) query.status = status;
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }
        if (search) {
            query.$or = [
                { message: new RegExp(search, 'i') },
                { to: new RegExp(search, 'i') },
                { from: new RegExp(search, 'i') }
            ];
        }
        
        // Get messages with pagination
        const messages = await WhatsAppMessage.find(query)
            .populate('coachId', 'name email selfCoachId')
            .populate('deviceId', 'deviceName deviceType phoneNumber')
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const total = await WhatsAppMessage.countDocuments(query);
        
        // Get message statistics
        const messageStats = await WhatsAppMessage.aggregate([
            { $match: query },
            { $group: {
                _id: null,
                total: { $sum: 1 },
                sent: { $sum: { $cond: [{ $eq: ['$direction', 'outbound'] }, 1, 0] } },
                received: { $sum: { $cond: [{ $eq: ['$direction', 'inbound'] }, 1, 0] } },
                successful: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
                failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
                totalCreditsUsed: { $sum: '$creditsUsed' }
            }}
        ]);
        
        console.log('✅ [UNIFIED_MESSAGING_ADMIN] getAllMessages - Success');
        res.status(200).json({
            success: true,
            data: {
                messages,
                stats: messageStats[0] || {
                    total: 0,
                    sent: 0,
                    received: 0,
                    successful: 0,
                    failed: 0,
                    totalCreditsUsed: 0
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
        console.error('❌ [UNIFIED_MESSAGING_ADMIN] getAllMessages - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get messages',
            error: error.message
        });
    }
});

// @desc    Get messages for specific coach
// @route   GET /api/messagingv1/admin/coaches/:coachId/messages
// @access  Private (Admin)
exports.getCoachMessages = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING_ADMIN] getCoachMessages - Starting...');
        
        const { coachId } = req.params;
        const { page = 1, limit = 20, deviceId, direction, status } = req.query;
        
        // Build query
        const query = { coachId };
        if (deviceId) query.deviceId = deviceId;
        if (direction) query.direction = direction;
        if (status) query.status = status;
        
        // Get messages with pagination
        const messages = await WhatsAppMessage.find(query)
            .populate('deviceId', 'deviceName deviceType phoneNumber')
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const total = await WhatsAppMessage.countDocuments(query);
        
        // Get coach info
        const coach = await Coach.findOne({ _id: coachId }).select('name email selfCoachId messagingCredits');
        
        // Get coach's devices
        const devices = await WhatsAppDevice.find({ coachId }).select('deviceName deviceType phoneNumber isActive isConnected');
        
        console.log('✅ [UNIFIED_MESSAGING_ADMIN] getCoachMessages - Success');
        res.status(200).json({
            success: true,
            data: {
                coach,
                devices,
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
        console.error('❌ [UNIFIED_MESSAGING_ADMIN] getCoachMessages - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get coach messages',
            error: error.message
        });
    }
});

// ===== BROADCAST MESSAGING =====

// @desc    Send broadcast message to multiple coaches
// @route   POST /api/messagingv1/admin/broadcast
// @access  Private (Admin)
exports.sendBroadcastMessage = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING_ADMIN] sendBroadcastMessage - Starting...');
        
        const { 
            message, 
            templateId, 
            recipients, 
            coachIds, 
            staffIds,
            type = 'text',
            mediaUrl,
            caption,
            scheduleAt 
        } = req.body;
        
        // Get admin settings
        const adminSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
        if (!adminSettings?.whatsApp?.isEnabled) {
            return res.status(400).json({
                success: false,
                message: 'Central WhatsApp is not enabled'
            });
        }
        
        let targetRecipients = [];
        
        // Build recipient list
        if (recipients && recipients.length > 0) {
            targetRecipients = recipients;
        } else {
            // Get recipients from coach and staff IDs
            const coaches = coachIds ? await Coach.find({ _id: { $in: coachIds } }).select('email phone') : [];
            const staff = staffIds ? await Staff.find({ _id: { $in: staffIds } }).select('email phone') : [];
            
            targetRecipients = [
                ...coaches.map(coach => coach.email || coach.phone).filter(Boolean),
                ...staff.map(staff => staff.email || staff.phone).filter(Boolean)
            ];
        }
        
        if (targetRecipients.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid recipients found'
            });
        }
        
        const results = [];
        let successful = 0;
        let failed = 0;
        
        // Send messages
        for (const recipient of targetRecipients) {
            try {
                const result = await centralWhatsAppService.sendMessage({
                    to: recipient,
                    message: templateId ? await getTemplateMessage(templateId, req.body.templateParams) : message,
                    templateId,
                    type,
                    mediaUrl,
                    caption
                });
                
                results.push({
                    recipient,
                    success: result.success,
                    messageId: result.messageId,
                    error: result.error
                });
                
                if (result.success) {
                    successful++;
                } else {
                    failed++;
                }
                
                // Save message record
                const messageRecord = new WhatsAppMessage({
                    coachId: null, // Admin broadcast
                    deviceId: 'central',
                    to: recipient,
                    message: result.message || message,
                    type,
                    status: result.success ? 'sent' : 'failed',
                    direction: 'outbound',
                    templateId,
                    creditsUsed: 0 // Admin broadcasts don't use credits
                });
                
                await messageRecord.save();
                
            } catch (error) {
                results.push({
                    recipient,
                    success: false,
                    error: error.message
                });
                failed++;
            }
        }
        
        console.log('✅ [UNIFIED_MESSAGING_ADMIN] sendBroadcastMessage - Success');
        res.status(200).json({
            success: true,
            message: 'Broadcast completed',
            data: {
                totalRecipients: targetRecipients.length,
                successful,
                failed,
                results
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING_ADMIN] sendBroadcastMessage - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send broadcast message',
            error: error.message
        });
    }
});

// ===== CREDIT MANAGEMENT =====

// @desc    Update credit rates for messaging
// @route   PUT /api/messagingv1/admin/credit-rates
// @access  Private (Admin)
exports.updateCreditRates = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING_ADMIN] updateCreditRates - Starting...');
        
        const { 
            creditPrice, 
            autoRecharge, 
            rechargeThreshold, 
            rechargeAmount 
        } = req.body;
        
        // Update admin settings
        const updateData = {};
        if (creditPrice !== undefined) updateData['whatsApp.creditPrice'] = creditPrice;
        if (autoRecharge !== undefined) updateData['whatsApp.autoRecharge'] = autoRecharge;
        if (rechargeThreshold !== undefined) updateData['whatsApp.rechargeThreshold'] = rechargeThreshold;
        if (rechargeAmount !== undefined) updateData['whatsApp.rechargeAmount'] = rechargeAmount;
        
        await AdminSystemSettings.findOneAndUpdate(
            { settingId: 'global' },
            { $set: updateData },
            { upsert: true }
        );
        
        console.log('✅ [UNIFIED_MESSAGING_ADMIN] updateCreditRates - Success');
        res.status(200).json({
            success: true,
            message: 'Credit rates updated successfully',
            data: {
                creditPrice,
                autoRecharge,
                rechargeThreshold,
                rechargeAmount
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING_ADMIN] updateCreditRates - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update credit rates',
            error: error.message
        });
    }
});

// ===== TEMPLATE MANAGEMENT =====

// @desc    Get all templates across coaches
// @route   GET /api/messagingv1/admin/templates
// @access  Private (Admin)
exports.getAllTemplates = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING_ADMIN] getAllTemplates - Starting...');
        
        const { page = 1, limit = 20, category, status } = req.query;
        
        // Build query
        const query = {};
        if (category) query.category = category;
        if (status) query.status = status;
        
        // Get custom templates
        const customTemplates = await WhatsAppTemplate.find(query)
            .populate('coachId', 'name email selfCoachId')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const customTotal = await WhatsAppTemplate.countDocuments(query);
        
        // Get global templates from admin settings
        const adminSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
        const globalTemplates = adminSettings?.whatsApp?.messageTemplates || [];
        
        console.log('✅ [UNIFIED_MESSAGING_ADMIN] getAllTemplates - Success');
        res.status(200).json({
            success: true,
            data: {
                custom: {
                    templates: customTemplates,
                    pagination: {
                        current: parseInt(page),
                        pages: Math.ceil(customTotal / limit),
                        total: customTotal,
                        limit: parseInt(limit)
                    }
                },
                global: globalTemplates
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING_ADMIN] getAllTemplates - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get templates',
            error: error.message
        });
    }
});

// @desc    Create global template
// @route   POST /api/messagingv1/admin/templates
// @access  Private (Admin)
exports.createGlobalTemplate = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING_ADMIN] createGlobalTemplate - Starting...');
        
        const { 
            name, 
            category, 
            language = 'en_US', 
            components,
            status = 'pending_approval'
        } = req.body;
        
        const templateId = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Add template to admin settings
        const template = {
            id: templateId,
            name,
            category,
            language,
            components,
            status,
            createdAt: new Date()
        };
        
        await AdminSystemSettings.findOneAndUpdate(
            { settingId: 'global' },
            { $push: { 'whatsApp.messageTemplates': template } },
            { upsert: true }
        );
        
        console.log('✅ [UNIFIED_MESSAGING_ADMIN] createGlobalTemplate - Success');
        res.status(201).json({
            success: true,
            message: 'Global template created successfully',
            data: template
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING_ADMIN] createGlobalTemplate - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create global template',
            error: error.message
        });
    }
});

// @desc    Update global template
// @route   PUT /api/messagingv1/admin/templates/:templateId
// @access  Private (Admin)
exports.updateGlobalTemplate = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING_ADMIN] updateGlobalTemplate - Starting...');
        
        const { templateId } = req.params;
        const { name, category, language, components, status } = req.body;
        
        // Update template in admin settings
        const updateData = {};
        if (name !== undefined) updateData['whatsApp.messageTemplates.$.name'] = name;
        if (category !== undefined) updateData['whatsApp.messageTemplates.$.category'] = category;
        if (language !== undefined) updateData['whatsApp.messageTemplates.$.language'] = language;
        if (components !== undefined) updateData['whatsApp.messageTemplates.$.components'] = components;
        if (status !== undefined) updateData['whatsApp.messageTemplates.$.status'] = status;
        
        const result = await AdminSystemSettings.findOneAndUpdate(
            { 
                settingId: 'global',
                'whatsApp.messageTemplates.id': templateId
            },
            { $set: updateData },
            { new: true }
        );
        
        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }
        
        console.log('✅ [UNIFIED_MESSAGING_ADMIN] updateGlobalTemplate - Success');
        res.status(200).json({
            success: true,
            message: 'Global template updated successfully'
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING_ADMIN] updateGlobalTemplate - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update global template',
            error: error.message
        });
    }
});

// @desc    Delete global template
// @route   DELETE /api/messagingv1/admin/templates/:templateId
// @access  Private (Admin)
exports.deleteGlobalTemplate = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING_ADMIN] deleteGlobalTemplate - Starting...');
        
        const { templateId } = req.params;
        
        // Remove template from admin settings
        const result = await AdminSystemSettings.findOneAndUpdate(
            { settingId: 'global' },
            { $pull: { 'whatsApp.messageTemplates': { id: templateId } } },
            { new: true }
        );
        
        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }
        
        console.log('✅ [UNIFIED_MESSAGING_ADMIN] deleteGlobalTemplate - Success');
        res.status(200).json({
            success: true,
            message: 'Global template deleted successfully'
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING_ADMIN] deleteGlobalTemplate - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete global template',
            error: error.message
        });
    }
});

// ===== SYSTEM STATISTICS =====

// @desc    Get system-wide messaging statistics
// @route   GET /api/messagingv1/admin/stats
// @access  Private (Admin)
exports.getSystemStats = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING_ADMIN] getSystemStats - Starting...');
        
        const { period = '30d', groupBy = 'day' } = req.query;
        
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
                timestamp: { $gte: startDate, $lte: endDate } 
            }},
            { $group: {
                _id: null,
                totalMessages: { $sum: 1 },
                totalSent: { $sum: { $cond: [{ $eq: ['$direction', 'outbound'] }, 1, 0] } },
                totalReceived: { $sum: { $cond: [{ $eq: ['$direction', 'inbound'] }, 1, 0] } },
                successfulSent: { $sum: { $cond: [{ $and: [{ $eq: ['$direction', 'outbound'] }, { $eq: ['$status', 'sent'] }] }, 1, 0] } },
                failedSent: { $sum: { $cond: [{ $and: [{ $eq: ['$direction', 'outbound'] }, { $eq: ['$status', 'failed'] }] }, 1, 0] } },
                totalCreditsUsed: { $sum: '$creditsUsed' }
            }}
        ]);
        
        // Get daily/hourly message counts
        const dateFormat = groupBy === 'hour' ? '%Y-%m-%d %H:00:00' : '%Y-%m-%d';
        const timeStats = await WhatsAppMessage.aggregate([
            { $match: { 
                timestamp: { $gte: startDate, $lte: endDate } 
            }},
            { $group: {
                _id: { $dateToString: { format: dateFormat, date: '$timestamp' } },
                sent: { $sum: { $cond: [{ $eq: ['$direction', 'outbound'] }, 1, 0] } },
                received: { $sum: { $cond: [{ $eq: ['$direction', 'inbound'] }, 1, 0] } },
                creditsUsed: { $sum: '$creditsUsed' }
            }},
            { $sort: { _id: 1 } }
        ]);
        
        // Get coach statistics
        const coachStats = await WhatsAppMessage.aggregate([
            { $match: { 
                timestamp: { $gte: startDate, $lte: endDate },
                coachId: { $ne: null }
            }},
            { $group: {
                _id: '$coachId',
                messageCount: { $sum: 1 },
                creditsUsed: { $sum: '$creditsUsed' }
            }},
            { $lookup: {
                from: 'coaches',
                localField: '_id',
                foreignField: '_id',
                as: 'coach'
            }},
            { $unwind: { path: '$coach', preserveNullAndEmptyArrays: true } },
            { $project: {
                coachName: '$coach.name',
                coachEmail: '$coach.email',
                coachSelfId: '$coach.selfCoachId',
                messageCount: 1,
                creditsUsed: 1
            }},
            { $sort: { messageCount: -1 } },
            { $limit: 20 }
        ]);
        
        // Get device statistics
        const deviceStats = await WhatsAppDevice.aggregate([
            { $group: {
                _id: '$deviceType',
                total: { $sum: 1 },
                active: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
                connected: { $sum: { $cond: [{ $eq: ['$isConnected', true] }, 1, 0] } },
                messagesSent: { $sum: '$messagesSentThisMonth' }
            }}
        ]);
        
        const stats = messageStats[0] || {
            totalMessages: 0,
            totalSent: 0,
            totalReceived: 0,
            successfulSent: 0,
            failedSent: 0,
            totalCreditsUsed: 0
        };
        
        console.log('✅ [UNIFIED_MESSAGING_ADMIN] getSystemStats - Success');
        res.status(200).json({
            success: true,
            data: {
                period,
                groupBy,
                overview: {
                    totalMessages: stats.totalMessages,
                    totalSent: stats.totalSent,
                    totalReceived: stats.totalReceived,
                    successRate: stats.totalSent > 0 ? (stats.successfulSent / stats.totalSent * 100).toFixed(2) : 0,
                    totalCreditsUsed: stats.totalCreditsUsed
                },
                timeStats,
                coachStats,
                deviceStats
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING_ADMIN] getSystemStats - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get system statistics',
            error: error.message
        });
    }
});

// ===== HELPER FUNCTIONS =====

async function checkSystemHealth() {
    try {
        // Check database connection
        const dbStatus = await WhatsAppDevice.findOne().select('_id');
        
        // Check Baileys service
        const baileysStatus = 'operational'; // You can add actual health checks here
        
        // Check Meta service
        const metaStatus = 'operational'; // You can add actual health checks here
        
        return {
            database: dbStatus ? 'connected' : 'disconnected',
            baileys: baileysStatus,
            meta: metaStatus,
            overall: 'healthy'
        };
    } catch (error) {
        logger.error('[UNIFIED_MESSAGING_ADMIN] Error checking system health:', error);
        return {
            database: 'error',
            baileys: 'error',
            meta: 'error',
            overall: 'unhealthy'
        };
    }
}

async function getTemplateMessage(templateId, params = {}) {
    try {
        // First check global templates
        const adminSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
        const globalTemplate = adminSettings?.whatsApp?.messageTemplates?.find(t => t.id === templateId);
        
        if (globalTemplate) {
            let message = globalTemplate.components[0]?.text?.body || '';
            
            // Replace variables in template
            if (params) {
                Object.keys(params).forEach(key => {
                    message = message.replace(new RegExp(`{${key}}`, 'g'), params[key]);
                });
            }
            
            return message;
        }
        
        // Check custom templates
        const customTemplate = await WhatsAppTemplate.findById(templateId);
        if (customTemplate) {
            let message = customTemplate.content;
            
            // Replace variables in template
            customTemplate.variables.forEach(variable => {
                const value = params[variable.name] || variable.defaultValue || `{${variable.name}}`;
                message = message.replace(new RegExp(`{${variable.name}}`, 'g'), value);
            });
            
            return message;
        }
        
        throw new Error('Template not found');
    } catch (error) {
        logger.error('[UNIFIED_MESSAGING_ADMIN] Error getting template message:', error);
        throw error;
    }
}

module.exports = {
    // System overview
    getSystemOverview: exports.getSystemOverview,
    
    // Device management
    getAllDevices: exports.getAllDevices,
    
    // Message management
    getAllMessages: exports.getAllMessages,
    getCoachMessages: exports.getCoachMessages,
    sendBroadcastMessage: exports.sendBroadcastMessage,
    
    // Credit management
    updateCreditRates: exports.updateCreditRates,
    
    // Template management
    getAllTemplates: exports.getAllTemplates,
    createGlobalTemplate: exports.createGlobalTemplate,
    updateGlobalTemplate: exports.updateGlobalTemplate,
    deleteGlobalTemplate: exports.deleteGlobalTemplate,
    
    // Statistics
    getSystemStats: exports.getSystemStats
};
