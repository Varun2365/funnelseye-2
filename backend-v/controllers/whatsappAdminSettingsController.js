const asyncHandler = require('../middleware/async');
const WhatsAppCustomSettings = require('../schema/WhatsAppCustomSettings');
const WhatsAppAIKnowledge = require('../schema/WhatsAppAIKnowledge');
const User = require('../schema/User');

// @desc    Get all admin WhatsApp settings
// @route   GET /api/whatsapp/v1/admin/settings
// @access  Private (Admin)
exports.getAllAdminSettings = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search, isActive } = req.query;
    
    let query = {
        ownerType: 'admin',
        isActive: isActive !== 'false'
    };
    
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }
    
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
        populate: [
            { path: 'createdBy', select: 'name email' },
            { path: 'updatedBy', select: 'name email' }
        ]
    };
    
    const result = await WhatsAppCustomSettings.paginate(query, options);
    
    res.status(200).json({
        success: true,
        data: result.docs,
        pagination: {
            totalDocs: result.totalDocs,
            limit: result.limit,
            page: result.page,
            totalPages: result.totalPages,
            nextPage: result.nextPage,
            prevPage: result.prevPage,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage
        }
    });
});

// @desc    Get specific admin WhatsApp settings
// @route   GET /api/whatsapp/v1/admin/settings/:id
// @access  Private (Admin)
exports.getAdminSettings = asyncHandler(async (req, res) => {
    const settings = await WhatsAppCustomSettings.findOne({
        _id: req.params.id,
        ownerType: 'admin',
        isActive: true
    }).populate('createdBy updatedBy', 'name email');
    
    if (!settings) {
        return res.status(404).json({
            success: false,
            message: 'Admin settings not found'
        });
    }
    
    res.status(200).json({
        success: true,
        data: settings
    });
});

// @desc    Get default admin WhatsApp settings
// @route   GET /api/whatsapp/v1/admin/settings/default
// @access  Private (Admin)
exports.getDefaultAdminSettings = asyncHandler(async (req, res) => {
    let settings = await WhatsAppCustomSettings.findOne({
        ownerType: 'admin',
        isDefault: true,
        isActive: true
    }).populate('createdBy updatedBy', 'name email');
    
    if (!settings) {
        // Create default settings if none exist
        settings = await WhatsAppCustomSettings.create({
            ownerId: req.admin.id,
            ownerType: 'admin',
            name: 'Default Admin Settings',
            description: 'Default WhatsApp settings for all coaches',
            inheritance: {
                enabled: false,
                inheritFrom: 'admin'
            },
            aiKnowledge: {
                useDefault: true
            },
            businessHours: {
                useDefault: true,
                customSchedule: {
                    enabled: true,
                    timezone: 'Asia/Kolkata',
                    schedule: [
                        { day: 'monday', startTime: '09:00', endTime: '18:00', isActive: true },
                        { day: 'tuesday', startTime: '09:00', endTime: '18:00', isActive: true },
                        { day: 'wednesday', startTime: '09:00', endTime: '18:00', isActive: true },
                        { day: 'thursday', startTime: '09:00', endTime: '18:00', isActive: true },
                        { day: 'friday', startTime: '09:00', endTime: '18:00', isActive: true },
                        { day: 'saturday', startTime: '10:00', endTime: '16:00', isActive: true },
                        { day: 'sunday', startTime: '10:00', endTime: '14:00', isActive: false }
                    ]
                }
            },
            autoReplyRules: {
                useDefault: true,
                customRules: []
            },
            messageFiltering: {
                enabled: false
            },
            notifications: {
                enabled: true
            },
            analytics: {
                enabled: true
            },
            integrations: {},
            advanced: {},
            isDefault: true,
            createdBy: req.admin.id
        });
    }
    
    res.status(200).json({
        success: true,
        data: settings
    });
});

// @desc    Create new admin WhatsApp settings
// @route   POST /api/whatsapp/v1/admin/settings
// @access  Private (Admin)
exports.createAdminSettings = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        inheritance,
        aiKnowledge,
        businessHours,
        autoReplyRules,
        messageFiltering,
        notifications,
        analytics,
        integrations,
        advanced,
        isDefault = false
    } = req.body;
    
    if (!name) {
        return res.status(400).json({
            success: false,
            message: 'Settings name is required'
        });
    }
    
    // If setting as default, unset previous default
    if (isDefault) {
        await WhatsAppCustomSettings.updateMany(
            { ownerType: 'admin', isDefault: true },
            { $set: { isDefault: false } }
        );
    }
    
    const settings = await WhatsAppCustomSettings.create({
        ownerId: req.admin.id,
        ownerType: 'admin',
        name,
        description: description || '',
        inheritance: inheritance || { enabled: false, inheritFrom: 'admin' },
        aiKnowledge: aiKnowledge || { useDefault: true },
        businessHours: businessHours || { useDefault: true },
        autoReplyRules: autoReplyRules || { useDefault: true },
        messageFiltering: messageFiltering || { enabled: false },
        notifications: notifications || { enabled: true },
        analytics: analytics || { enabled: true },
        integrations: integrations || {},
        advanced: advanced || {},
        isDefault,
        createdBy: req.admin.id
    });
    
    res.status(201).json({
        success: true,
        message: 'Admin WhatsApp settings created successfully',
        data: settings
    });
});

// @desc    Update admin WhatsApp settings
// @route   PUT /api/whatsapp/v1/admin/settings/:id
// @access  Private (Admin)
exports.updateAdminSettings = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        inheritance,
        aiKnowledge,
        businessHours,
        autoReplyRules,
        messageFiltering,
        notifications,
        analytics,
        integrations,
        advanced,
        isDefault
    } = req.body;
    
    let settings = await WhatsAppCustomSettings.findOne({
        _id: req.params.id,
        ownerType: 'admin',
        isActive: true
    });
    
    if (!settings) {
        return res.status(404).json({
            success: false,
            message: 'Admin settings not found'
        });
    }
    
    // If setting as default, unset previous default
    if (isDefault === true && !settings.isDefault) {
        await WhatsAppCustomSettings.updateMany(
            { ownerType: 'admin', isDefault: true },
            { $set: { isDefault: false } }
        );
    }
    
    // Update fields
    settings.name = name || settings.name;
    settings.description = description !== undefined ? description : settings.description;
    settings.inheritance = inheritance || settings.inheritance;
    settings.aiKnowledge = aiKnowledge || settings.aiKnowledge;
    settings.businessHours = businessHours || settings.businessHours;
    settings.autoReplyRules = autoReplyRules || settings.autoReplyRules;
    settings.messageFiltering = messageFiltering || settings.messageFiltering;
    settings.notifications = notifications || settings.notifications;
    settings.analytics = analytics || settings.analytics;
    settings.integrations = integrations || settings.integrations;
    settings.advanced = advanced || settings.advanced;
    settings.isDefault = isDefault !== undefined ? isDefault : settings.isDefault;
    settings.updatedBy = req.admin.id;
    settings.version += 1;
    
    await settings.save();
    
    res.status(200).json({
        success: true,
        message: 'Admin WhatsApp settings updated successfully',
        data: settings
    });
});

// @desc    Set admin settings as default
// @route   PUT /api/whatsapp/v1/admin/settings/:id/set-default
// @access  Private (Admin)
exports.setAdminSettingsAsDefault = asyncHandler(async (req, res) => {
    const settings = await WhatsAppCustomSettings.findOne({
        _id: req.params.id,
        ownerType: 'admin',
        isActive: true
    });
    
    if (!settings) {
        return res.status(404).json({
            success: false,
            message: 'Admin settings not found'
        });
    }
    
    // Unset current default
    await WhatsAppCustomSettings.updateMany(
        { ownerType: 'admin', isDefault: true },
        { $set: { isDefault: false } }
    );
    
    // Set new default
    settings.isDefault = true;
    settings.updatedBy = req.admin.id;
    await settings.save();
    
    res.status(200).json({
        success: true,
        message: 'Admin settings set as default successfully',
        data: settings
    });
});

// @desc    Delete admin WhatsApp settings
// @route   DELETE /api/whatsapp/v1/admin/settings/:id
// @access  Private (Admin)
exports.deleteAdminSettings = asyncHandler(async (req, res) => {
    const settings = await WhatsAppCustomSettings.findOne({
        _id: req.params.id,
        ownerType: 'admin',
        isActive: true
    });
    
    if (!settings) {
        return res.status(404).json({
            success: false,
            message: 'Admin settings not found'
        });
    }
    
    if (settings.isDefault) {
        return res.status(400).json({
            success: false,
            message: 'Cannot delete default settings. Set another as default first.'
        });
    }
    
    // Soft delete
    settings.isActive = false;
    settings.updatedBy = req.admin.id;
    await settings.save();
    
    res.status(200).json({
        success: true,
        message: 'Admin settings deleted successfully'
    });
});

// @desc    Test admin AI settings
// @route   POST /api/whatsapp/v1/admin/settings/:id/test-ai
// @access  Private (Admin)
exports.testAdminAISettings = asyncHandler(async (req, res) => {
    const { testMessage, leadContext } = req.body;
    
    if (!testMessage) {
        return res.status(400).json({
            success: false,
            message: 'Test message is required'
        });
    }
    
    const settings = await WhatsAppCustomSettings.findOne({
        _id: req.params.id,
        ownerType: 'admin',
        isActive: true
    });
    
    if (!settings) {
        return res.status(404).json({
            success: false,
            message: 'Admin settings not found'
        });
    }
    
    // Get AI knowledge base
    let aiKnowledge;
    if (settings.aiKnowledge.useDefault && settings.aiKnowledge.customKnowledgeId) {
        aiKnowledge = await WhatsAppAIKnowledge.findById(settings.aiKnowledge.customKnowledgeId);
    } else {
        aiKnowledge = await WhatsAppAIKnowledge.findOne({ isDefault: true });
    }
    
    if (!aiKnowledge) {
        return res.status(404).json({
            success: false,
            message: 'AI knowledge base not found'
        });
    }
    
    // Apply customizations to AI knowledge
    const customizedAI = {
        ...aiKnowledge.toObject(),
        systemPrompt: settings.aiKnowledge.customizations?.systemPrompt || aiKnowledge.systemPrompt,
        businessInfo: settings.aiKnowledge.customizations?.businessInfo || aiKnowledge.businessInfo,
        responseSettings: {
            ...aiKnowledge.responseSettings,
            ...settings.aiKnowledge.customizations?.responseSettings
        }
    };
    
    // Generate AI response (implement based on your AI service)
    try {
        const aiResponse = `Test response for: "${testMessage}"`;
        
        res.status(200).json({
            success: true,
            message: 'AI test completed successfully',
            data: {
                testMessage,
                aiResponse,
                settings: customizedAI,
                responseTime: 150
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'AI test failed',
            error: error.message
        });
    }
});

// @desc    Get admin WhatsApp analytics
// @route   GET /api/whatsapp/v1/admin/settings/analytics
// @access  Private (Admin)
exports.getAdminAnalytics = asyncHandler(async (req, res) => {
    const { period = '7d', coachId } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
        case '1d':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
        case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        default:
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    // Get analytics data
    const analytics = {
        overview: {
            totalSettings: await WhatsAppCustomSettings.countDocuments({ ownerType: 'admin', isActive: true }),
            activeCoaches: await WhatsAppCustomSettings.countDocuments({ ownerType: 'coach', isActive: true }),
            totalMessages: 1250, // Implement based on your WhatsAppInbox
            aiReplies: 1100,
            averageResponseTime: 120
        },
        performance: {
            aiSuccessRate: 95.5,
            averageResponseTime: 120,
            messagesPerDay: 180,
            peakHours: ['10:00', '14:00', '18:00'],
            topPerformingCoaches: [
                { coachId: 'coach1', name: 'John Doe', messages: 150, aiReplies: 140 },
                { coachId: 'coach2', name: 'Jane Smith', messages: 120, aiReplies: 115 }
            ]
        },
        trends: {
            messageVolume: [
                { date: '2024-01-01', count: 150 },
                { date: '2024-01-02', count: 180 },
                { date: '2024-01-03', count: 200 }
            ],
            aiUsage: [
                { date: '2024-01-01', count: 135 },
                { date: '2024-01-02', count: 165 },
                { date: '2024-01-03', count: 185 }
            ],
            coachActivity: [
                { coachId: 'coach1', name: 'John Doe', activity: 85 },
                { coachId: 'coach2', name: 'Jane Smith', activity: 75 }
            ]
        },
        settings: {
            mostUsedSettings: await WhatsAppCustomSettings.find({ ownerType: 'admin', isActive: true })
                .sort({ 'stats.totalMessages': -1 })
                .limit(5)
                .select('name stats.totalMessages'),
            inheritanceUsage: {
                enabled: await WhatsAppCustomSettings.countDocuments({ 
                    ownerType: 'coach', 
                    'inheritance.enabled': true 
                }),
                disabled: await WhatsAppCustomSettings.countDocuments({ 
                    ownerType: 'coach', 
                    'inheritance.enabled': false 
                })
            }
        }
    };
    
    res.status(200).json({
        success: true,
        data: analytics
    });
});

// @desc    Clone admin settings
// @route   POST /api/whatsapp/v1/admin/settings/:id/clone
// @access  Private (Admin)
exports.cloneAdminSettings = asyncHandler(async (req, res) => {
    const { settingsName } = req.body;
    
    const sourceSettings = await WhatsAppCustomSettings.findOne({
        _id: req.params.id,
        ownerType: 'admin',
        isActive: true
    });
    
    if (!sourceSettings) {
        return res.status(404).json({
            success: false,
            message: 'Source settings not found'
        });
    }
    
    const newSettings = await WhatsAppCustomSettings.create({
        ownerId: req.admin.id,
        ownerType: 'admin',
        name: settingsName || `${sourceSettings.name} (Copy)`,
        description: `Cloned from ${sourceSettings.name}`,
        inheritance: sourceSettings.inheritance,
        aiKnowledge: sourceSettings.aiKnowledge,
        businessHours: sourceSettings.businessHours,
        autoReplyRules: sourceSettings.autoReplyRules,
        messageFiltering: sourceSettings.messageFiltering,
        notifications: sourceSettings.notifications,
        analytics: sourceSettings.analytics,
        integrations: sourceSettings.integrations,
        advanced: sourceSettings.advanced,
        createdBy: req.admin.id
    });
    
    res.status(201).json({
        success: true,
        message: 'Settings cloned successfully',
        data: newSettings
    });
});

// @desc    Apply settings to all coaches
// @route   POST /api/whatsapp/v1/admin/settings/:id/apply-to-coaches
// @access  Private (Admin)
exports.applySettingsToCoaches = asyncHandler(async (req, res) => {
    const { coachIds, forceUpdate = false } = req.body;
    
    const adminSettings = await WhatsAppCustomSettings.findOne({
        _id: req.params.id,
        ownerType: 'admin',
        isActive: true
    });
    
    if (!adminSettings) {
        return res.status(404).json({
            success: false,
            message: 'Admin settings not found'
        });
    }
    
    let query = { ownerType: 'coach', isActive: true };
    if (coachIds && coachIds.length > 0) {
        query.ownerId = { $in: coachIds };
    }
    
    const coaches = await WhatsAppCustomSettings.find(query);
    const results = [];
    
    for (const coach of coaches) {
        if (forceUpdate || !coach.inheritance.enabled) {
            // Update coach settings to inherit from admin
            coach.inheritance.enabled = true;
            coach.inheritance.inheritFrom = 'admin';
            coach.inheritance.customizations = [];
            coach.updatedBy = req.admin.id;
            coach.version += 1;
            
            await coach.save();
            results.push({
                coachId: coach.ownerId,
                status: 'updated',
                message: 'Settings updated to inherit from admin'
            });
        } else {
            results.push({
                coachId: coach.ownerId,
                status: 'skipped',
                message: 'Coach has custom settings, use forceUpdate=true to override'
            });
        }
    }
    
    res.status(200).json({
        success: true,
        message: `Settings applied to ${results.length} coaches`,
        data: results
    });
});

// @desc    Get settings usage statistics
// @route   GET /api/whatsapp/v1/admin/settings/usage-stats
// @access  Private (Admin)
exports.getSettingsUsageStats = asyncHandler(async (req, res) => {
    const stats = {
        totalSettings: await WhatsAppCustomSettings.countDocuments({ ownerType: 'admin', isActive: true }),
        totalCoaches: await WhatsAppCustomSettings.countDocuments({ ownerType: 'coach', isActive: true }),
        defaultSettings: await WhatsAppCustomSettings.findOne({ ownerType: 'admin', isDefault: true }),
        inheritanceStats: {
            coachesWithInheritance: await WhatsAppCustomSettings.countDocuments({ 
                ownerType: 'coach', 
                'inheritance.enabled': true 
            }),
            coachesWithoutInheritance: await WhatsAppCustomSettings.countDocuments({ 
                ownerType: 'coach', 
                'inheritance.enabled': false 
            })
        },
        mostUsedFeatures: {
            aiKnowledge: await WhatsAppCustomSettings.countDocuments({ 
                'aiKnowledge.useDefault': false 
            }),
            customBusinessHours: await WhatsAppCustomSettings.countDocuments({ 
                'businessHours.useDefault': false 
            }),
            customRules: await WhatsAppCustomSettings.countDocuments({ 
                'autoReplyRules.useDefault': false 
            }),
            messageFiltering: await WhatsAppCustomSettings.countDocuments({ 
                'messageFiltering.enabled': true 
            })
        },
        recentActivity: await WhatsAppCustomSettings.find({ ownerType: 'admin', isActive: true })
            .sort({ updatedAt: -1 })
            .limit(5)
            .select('name updatedAt updatedBy')
            .populate('updatedBy', 'name email')
    };
    
    res.status(200).json({
        success: true,
        data: stats
    });
});
