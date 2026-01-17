const asyncHandler = require('../middleware/async');
const WhatsAppCustomSettings = require('../schema/WhatsAppCustomSettings');
const WhatsAppAIKnowledge = require('../schema/WhatsAppAIKnowledge');
const User = require('../schema/User');

// Helper function to get parent settings (admin or parent coach)
const getParentSettings = async (coachId, ownerType = 'admin') => {
    if (ownerType === 'admin') {
        return await WhatsAppCustomSettings.findOne({ 
            ownerType: 'admin', 
            isDefault: true, 
            isActive: true 
        });
    }
    
    // For parent coach inheritance, you might need to implement coach hierarchy logic
    // For now, we'll default to admin settings
    return await WhatsAppCustomSettings.findOne({ 
        ownerType: 'admin', 
        isDefault: true, 
        isActive: true 
    });
};

// @desc    Get coach's WhatsApp settings
// @route   GET /api/whatsapp/v1/coach/settings
// @access  Private (Coach)
exports.getCoachSettings = asyncHandler(async (req, res) => {
    const coachId = req.user.id;
    
    let settings = await WhatsAppCustomSettings.findOne({
        ownerId: coachId,
        ownerType: 'coach',
        isActive: true
    }).populate('createdBy updatedBy', 'name email');
    
    if (!settings) {
        // Create default settings for coach
        settings = await WhatsAppCustomSettings.create({
            ownerId: coachId,
            ownerType: 'coach',
            name: 'Default Coach Settings',
            description: 'Default WhatsApp settings for coach',
            inheritance: {
                enabled: true,
                inheritFrom: 'admin'
            },
            createdBy: coachId
        });
    }
    
    // Get parent settings for inheritance
    const parentSettings = await getParentSettings(coachId, settings.inheritance.inheritFrom);
    
    // Get effective settings
    const effectiveSettings = settings.getEffectiveSettings(parentSettings);
    
    res.status(200).json({
        success: true,
        data: {
            settings: settings,
            effectiveSettings: effectiveSettings,
            parentSettings: parentSettings,
            inheritanceEnabled: settings.inheritance.enabled
        }
    });
});

// @desc    Create or update coach's WhatsApp settings
// @route   POST /api/whatsapp/v1/coach/settings
// @access  Private (Coach)
exports.createOrUpdateCoachSettings = asyncHandler(async (req, res) => {
    const coachId = req.user.id;
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
        advanced
    } = req.body;
    
    let settings = await WhatsAppCustomSettings.findOne({
        ownerId: coachId,
        ownerType: 'coach',
        isActive: true
    });
    
    if (settings) {
        // Update existing settings
        settings.name = name || settings.name;
        settings.description = description || settings.description;
        settings.inheritance = inheritance || settings.inheritance;
        settings.aiKnowledge = aiKnowledge || settings.aiKnowledge;
        settings.businessHours = businessHours || settings.businessHours;
        settings.autoReplyRules = autoReplyRules || settings.autoReplyRules;
        settings.messageFiltering = messageFiltering || settings.messageFiltering;
        settings.notifications = notifications || settings.notifications;
        settings.analytics = analytics || settings.analytics;
        settings.integrations = integrations || settings.integrations;
        settings.advanced = advanced || settings.advanced;
        settings.updatedBy = coachId;
        settings.version += 1;
        
        await settings.save();
    } else {
        // Create new settings
        settings = await WhatsAppCustomSettings.create({
            ownerId: coachId,
            ownerType: 'coach',
            name: name || 'Coach WhatsApp Settings',
            description: description || 'Custom WhatsApp settings for coach',
            inheritance: inheritance || { enabled: true, inheritFrom: 'admin' },
            aiKnowledge: aiKnowledge || { useDefault: true },
            businessHours: businessHours || { useDefault: true },
            autoReplyRules: autoReplyRules || { useDefault: true },
            messageFiltering: messageFiltering || { enabled: false },
            notifications: notifications || { enabled: true },
            analytics: analytics || { enabled: true },
            integrations: integrations || {},
            advanced: advanced || {},
            createdBy: coachId
        });
    }
    
    res.status(200).json({
        success: true,
        message: 'Coach WhatsApp settings saved successfully',
        data: settings
    });
});

// @desc    Customize specific field in coach settings
// @route   PUT /api/whatsapp/v1/coach/settings/customize
// @access  Private (Coach)
exports.customizeCoachField = asyncHandler(async (req, res) => {
    const coachId = req.user.id;
    const { fieldPath, value, enableInheritance = true } = req.body;
    
    if (!fieldPath || value === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Field path and value are required'
        });
    }
    
    let settings = await WhatsAppCustomSettings.findOne({
        ownerId: coachId,
        ownerType: 'coach',
        isActive: true
    });
    
    if (!settings) {
        settings = await WhatsAppCustomSettings.create({
            ownerId: coachId,
            ownerType: 'coach',
            name: 'Coach WhatsApp Settings',
            inheritance: { enabled: enableInheritance, inheritFrom: 'admin' },
            createdBy: coachId
        });
    }
    
    // Add customization
    await settings.addCustomization(fieldPath, value);
    
    // Update the actual field value
    const fieldParts = fieldPath.split('.');
    let target = settings;
    for (let i = 0; i < fieldParts.length - 1; i++) {
        if (!target[fieldParts[i]]) {
            target[fieldParts[i]] = {};
        }
        target = target[fieldParts[i]];
    }
    target[fieldParts[fieldParts.length - 1]] = value;
    
    settings.updatedBy = coachId;
    settings.version += 1;
    await settings.save();
    
    res.status(200).json({
        success: true,
        message: `Field ${fieldPath} customized successfully`,
        data: {
            fieldPath,
            value,
            customized: true
        }
    });
});

// @desc    Remove customization for specific field
// @route   DELETE /api/whatsapp/v1/coach/settings/customize/:fieldPath
// @access  Private (Coach)
exports.removeCoachCustomization = asyncHandler(async (req, res) => {
    const coachId = req.user.id;
    const { fieldPath } = req.params;
    
    const settings = await WhatsAppCustomSettings.findOne({
        ownerId: coachId,
        ownerType: 'coach',
        isActive: true
    });
    
    if (!settings) {
        return res.status(404).json({
            success: false,
            message: 'Coach settings not found'
        });
    }
    
    await settings.removeCustomization(fieldPath);
    
    // Reset field to default value (inherit from parent)
    const parentSettings = await getParentSettings(coachId, settings.inheritance.inheritFrom);
    if (parentSettings) {
        const fieldParts = fieldPath.split('.');
        let parentValue = parentSettings;
        for (const part of fieldParts) {
            parentValue = parentValue[part];
            if (parentValue === undefined) break;
        }
        
        if (parentValue !== undefined) {
            let target = settings;
            for (let i = 0; i < fieldParts.length - 1; i++) {
                if (!target[fieldParts[i]]) {
                    target[fieldParts[i]] = {};
                }
                target = target[fieldParts[i]];
            }
            target[fieldParts[fieldParts.length - 1]] = parentValue;
        }
    }
    
    settings.updatedBy = coachId;
    settings.version += 1;
    await settings.save();
    
    res.status(200).json({
        success: true,
        message: `Customization for ${fieldPath} removed successfully`,
        data: {
            fieldPath,
            customized: false
        }
    });
});

// @desc    Set coach settings as default
// @route   PUT /api/whatsapp/v1/coach/settings/set-default
// @access  Private (Coach)
exports.setCoachSettingsAsDefault = asyncHandler(async (req, res) => {
    const coachId = req.user.id;
    
    const settings = await WhatsAppCustomSettings.findOne({
        ownerId: coachId,
        ownerType: 'coach',
        isActive: true
    });
    
    if (!settings) {
        return res.status(404).json({
            success: false,
            message: 'Coach settings not found'
        });
    }
    
    settings.isDefault = true;
    settings.updatedBy = coachId;
    await settings.save();
    
    res.status(200).json({
        success: true,
        message: 'Coach settings set as default successfully',
        data: settings
    });
});

// @desc    Get coach's effective settings (with inheritance applied)
// @route   GET /api/whatsapp/v1/coach/settings/effective
// @access  Private (Coach)
exports.getCoachEffectiveSettings = asyncHandler(async (req, res) => {
    const coachId = req.user.id;
    
    const settings = await WhatsAppCustomSettings.findOne({
        ownerId: coachId,
        ownerType: 'coach',
        isActive: true
    });
    
    if (!settings) {
        return res.status(404).json({
            success: false,
            message: 'Coach settings not found'
        });
    }
    
    const parentSettings = await getParentSettings(coachId, settings.inheritance.inheritFrom);
    const effectiveSettings = settings.getEffectiveSettings(parentSettings);
    
    res.status(200).json({
        success: true,
        data: {
            effectiveSettings,
            inheritanceEnabled: settings.inheritance.enabled,
            parentSettings: parentSettings,
            customizations: settings.inheritance.customizations
        }
    });
});

// @desc    Test coach's AI settings
// @route   POST /api/whatsapp/v1/coach/settings/test-ai
// @access  Private (Coach)
exports.testCoachAISettings = asyncHandler(async (req, res) => {
    const coachId = req.user.id;
    const { testMessage, leadContext } = req.body;
    
    if (!testMessage) {
        return res.status(400).json({
            success: false,
            message: 'Test message is required'
        });
    }
    
    const settings = await WhatsAppCustomSettings.findOne({
        ownerId: coachId,
        ownerType: 'coach',
        isActive: true
    });
    
    if (!settings) {
        return res.status(404).json({
            success: false,
            message: 'Coach settings not found'
        });
    }
    
    const parentSettings = await getParentSettings(coachId, settings.inheritance.inheritFrom);
    const effectiveSettings = settings.getEffectiveSettings(parentSettings);
    
    // Get AI knowledge base
    let aiKnowledge;
    if (effectiveSettings.aiKnowledge.useDefault && effectiveSettings.aiKnowledge.customKnowledgeId) {
        aiKnowledge = await WhatsAppAIKnowledge.findById(effectiveSettings.aiKnowledge.customKnowledgeId);
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
        systemPrompt: effectiveSettings.aiKnowledge.customizations?.systemPrompt || aiKnowledge.systemPrompt,
        businessInfo: effectiveSettings.aiKnowledge.customizations?.businessInfo || aiKnowledge.businessInfo,
        responseSettings: {
            ...aiKnowledge.responseSettings,
            ...effectiveSettings.aiKnowledge.customizations?.responseSettings
        }
    };
    
    // Generate AI response (you'll need to implement this based on your AI service)
    try {
        // This is a placeholder - implement actual AI response generation
        const aiResponse = `Test response for: "${testMessage}"`;
        
        res.status(200).json({
            success: true,
            message: 'AI test completed successfully',
            data: {
                testMessage,
                aiResponse,
                settings: customizedAI,
                responseTime: 150 // milliseconds
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

// @desc    Get coach's WhatsApp analytics
// @route   GET /api/whatsapp/v1/coach/settings/analytics
// @access  Private (Coach)
exports.getCoachAnalytics = asyncHandler(async (req, res) => {
    const coachId = req.user.id;
    const { period = '7d' } = req.query;
    
    const settings = await WhatsAppCustomSettings.findOne({
        ownerId: coachId,
        ownerType: 'coach',
        isActive: true
    });
    
    if (!settings) {
        return res.status(404).json({
            success: false,
            message: 'Coach settings not found'
        });
    }
    
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
    
    // Get analytics data (implement based on your WhatsAppInbox schema)
    const analytics = {
        overview: {
            totalMessages: settings.stats.totalMessages,
            aiReplies: settings.stats.aiReplies,
            responseTime: 120, // average response time in seconds
            satisfactionScore: 4.2, // out of 5
            lastUsed: settings.stats.lastUsed
        },
        performance: {
            aiSuccessRate: 95.5, // percentage
            averageResponseTime: 120, // seconds
            messagesPerDay: 25,
            peakHours: ['10:00', '14:00', '18:00']
        },
        trends: {
            messageVolume: [
                { date: '2024-01-01', count: 20 },
                { date: '2024-01-02', count: 25 },
                { date: '2024-01-03', count: 30 }
            ],
            aiUsage: [
                { date: '2024-01-01', count: 18 },
                { date: '2024-01-02', count: 22 },
                { date: '2024-01-03', count: 28 }
            ]
        }
    };
    
    res.status(200).json({
        success: true,
        data: analytics
    });
});

// @desc    Reset coach settings to inherit from parent
// @route   PUT /api/whatsapp/v1/coach/settings/reset
// @access  Private (Coach)
exports.resetCoachSettings = asyncHandler(async (req, res) => {
    const coachId = req.user.id;
    const { resetType = 'all' } = req.body; // all, ai, business_hours, rules, etc.
    
    const settings = await WhatsAppCustomSettings.findOne({
        ownerId: coachId,
        ownerType: 'coach',
        isActive: true
    });
    
    if (!settings) {
        return res.status(404).json({
            success: false,
            message: 'Coach settings not found'
        });
    }
    
    const parentSettings = await getParentSettings(coachId, settings.inheritance.inheritFrom);
    
    if (!parentSettings) {
        return res.status(404).json({
            success: false,
            message: 'Parent settings not found for inheritance'
        });
    }
    
    // Reset based on type
    switch (resetType) {
        case 'all':
            settings.inheritance.customizations = [];
            settings.aiKnowledge.useDefault = true;
            settings.businessHours.useDefault = true;
            settings.autoReplyRules.useDefault = true;
            break;
        case 'ai':
            settings.aiKnowledge.useDefault = true;
            settings.inheritance.customizations = settings.inheritance.customizations.filter(
                c => !c.field.startsWith('aiKnowledge')
            );
            break;
        case 'business_hours':
            settings.businessHours.useDefault = true;
            settings.inheritance.customizations = settings.inheritance.customizations.filter(
                c => !c.field.startsWith('businessHours')
            );
            break;
        case 'rules':
            settings.autoReplyRules.useDefault = true;
            settings.inheritance.customizations = settings.inheritance.customizations.filter(
                c => !c.field.startsWith('autoReplyRules')
            );
            break;
    }
    
    settings.updatedBy = coachId;
    settings.version += 1;
    await settings.save();
    
    res.status(200).json({
        success: true,
        message: `Coach settings reset successfully (${resetType})`,
        data: settings
    });
});

// @desc    Clone settings from another coach
// @route   POST /api/whatsapp/v1/coach/settings/clone
// @access  Private (Coach)
exports.cloneCoachSettings = asyncHandler(async (req, res) => {
    const coachId = req.user.id;
    const { sourceCoachId, settingsName } = req.body;
    
    if (!sourceCoachId) {
        return res.status(400).json({
            success: false,
            message: 'Source coach ID is required'
        });
    }
    
    const sourceSettings = await WhatsAppCustomSettings.findOne({
        ownerId: sourceCoachId,
        ownerType: 'coach',
        isActive: true
    });
    
    if (!sourceSettings) {
        return res.status(404).json({
            success: false,
            message: 'Source coach settings not found'
        });
    }
    
    // Create new settings based on source
    const newSettings = await WhatsAppCustomSettings.create({
        ownerId: coachId,
        ownerType: 'coach',
        name: settingsName || `${sourceSettings.name} (Cloned)`,
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
        createdBy: coachId
    });
    
    res.status(201).json({
        success: true,
        message: 'Settings cloned successfully',
        data: newSettings
    });
});
