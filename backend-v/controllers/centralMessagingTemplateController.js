const asyncHandler = require('../middleware/async');
const MessageTemplate = require('../schema/MessageTemplate');
const CoachSubscription = require('../schema/CoachSubscription');
const CentralWhatsApp = require('../schema/CentralWhatsApp');
const messagingVariableService = require('../services/messagingVariableService');
const mongoose = require('mongoose');
const User = mongoose.models.User || require('../schema/User');

/**
 * Central Messaging Template Controller
 * Handles template creation, distribution, and management
 */

// @desc    Get available variables for template creation
// @route   GET /api/central-messaging/v1/templates/variables
// @access  Private (Coach/Admin)
exports.getAvailableVariables = asyncHandler(async (req, res) => {
    try {
        const variables = messagingVariableService.getAvailableVariables();
        
        // Format for UI selection
        const formattedVariables = [];
        
        Object.keys(variables).forEach(category => {
            const categoryVars = variables[category];
            Object.keys(categoryVars).forEach(key => {
                formattedVariables.push({
                    id: `${category}.${key}`,
                    category,
                    key,
                    label: categoryVars[key].label,
                    description: categoryVars[key].description,
                    example: categoryVars[key].example || 'N/A'
                });
            });
        });

        res.json({
            success: true,
            data: {
                variables: formattedVariables,
                byCategory: variables
            }
        });
    } catch (error) {
        console.error('❌ Error getting variables:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get available variables',
            error: error.message
        });
    }
});

// @desc    Create template (Admin or Coach)
// @route   POST /api/central-messaging/v1/templates/create
// @access  Private (Coach/Admin)
exports.createTemplate = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [TEMPLATE] Creating template...');
        
        const userId = req.user.id;
        const userRole = req.user.role;
        const {
            name,
            description,
            type, // 'whatsapp', 'email', 'universal'
            category, // 'welcome', 'appointment', 'reminder', etc.
            content, // { body: "...", subject: "..." }
            selectedVariables, // Array of variable IDs like ['lead.name', 'appointment.date']
            isMetaTemplate, // true if this is for Meta WhatsApp
            metaComponents // for Meta templates
        } = req.body;

        // Validate required fields
        if (!name || !content || !content.body) {
            return res.status(400).json({
                success: false,
                message: 'Name and content body are required'
            });
        }

        const isAdmin = userRole === 'admin';
        const coachId = isAdmin ? null : userId;

        // For Meta templates, only admins can create
        if (isMetaTemplate && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Only admins can create Meta WhatsApp templates'
            });
        }

        // If Meta template, submit to Meta first
        if (isMetaTemplate && isAdmin) {
            // This will be handled via Meta Business Manager
            // We just store it in our database
            return res.status(200).json({
                success: true,
                message: 'Meta templates must be created via Meta Business Manager',
                data: {
                    redirectUrl: 'https://business.facebook.com/latest/whatsapp_manager/message_templates',
                    instructions: 'Create template in Meta Business Manager, then sync via /templates/sync endpoint'
                }
            });
        }

        // Create local template
        const availableVariables = selectedVariables ? selectedVariables.map(variableId => {
            const parts = variableId.split('.');
            const category = parts[0];
            const key = parts.slice(1).join('.');
            
            // Get description from messagingVariableService
            const allVars = messagingVariableService.getAvailableVariables();
            const varInfo = allVars[category]?.[key];
            
            return {
                name: variableId,
                description: varInfo?.description || variableId,
                required: false
            };
        }) : [];

        const template = new MessageTemplate({
            coachId: isAdmin ? null : coachId,
            name,
            description,
            type: type || 'universal',
            category: category || 'custom',
            content,
            availableVariables,
            isActive: true,
            isPreBuilt: isAdmin, // Admin templates are pre-built
            version: 1,
            previousVersions: []
        });

        await template.save();

        // If this is an admin template, grant it to all active subscriptions
        if (isAdmin) {
            // Grant to all active coach subscriptions
            await grantTemplateToSubscriptions(template._id, template.name);
        }

        console.log('✅ [TEMPLATE] Template created successfully');
        res.status(201).json({
            success: true,
            message: 'Template created successfully',
            data: {
                template,
                isMetaTemplate: false,
                canUseImmediately: !isMetaTemplate
            }
        });

    } catch (error) {
        console.error('❌ [TEMPLATE] Error creating template:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create template',
            error: error.message
        });
    }
});

// @desc    Get templates available to coach (based on subscription)
// @route   GET /api/central-messaging/v1/templates/my-templates
// @access  Private (Coach)
exports.getMyTemplates = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        
        // Verify user is a coach
        if (userRole !== 'coach') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only coaches can access this endpoint.'
            });
        }

        // Get coach's subscription
        const subscription = await CoachSubscription.findOne({ 
            coachId: userId,
            status: 'active'
        });

        const coachTemplateIds = subscription?.availableTemplates?.map(t => t.templateId) || [];

        // Get all available templates
        const query = {
            $or: [
                { isPreBuilt: true }, // Admin-created templates
                { coachId: userId }, // Coach's own templates
                { _id: { $in: coachTemplateIds } } // Templates from subscription
            ],
            isActive: true
        };

        const templates = await MessageTemplate.find(query);

        // Get Meta templates (for WhatsApp, only if within 24hr window)
        const centralConfig = await CentralWhatsApp.findOne({ isActive: true });
        const metaTemplates = (centralConfig?.templates || []).filter(t => 
            t.status === 'APPROVED'
        );

        res.json({
            success: true,
            data: {
                localTemplates: templates,
                metaTemplates,
                subscriptionInfo: {
                    hasActiveSubscription: !!subscription,
                    availableTemplateCount: coachTemplateIds.length
                }
            }
        });

    } catch (error) {
        console.error('❌ [TEMPLATE] Error getting templates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get templates',
            error: error.message
        });
    }
});

// @desc    Preview template with actual data
// @route   POST /api/central-messaging/v1/templates/preview
// @access  Private (Coach/Admin)
exports.previewTemplate = asyncHandler(async (req, res) => {
    try {
        const {
            templateId,
            leadId,
            clientId,
            appointmentId,
            customVariables = {}
        } = req.body;

        let template;
        if (templateId) {
            template = await MessageTemplate.findById(templateId);
            if (!template) {
                return res.status(404).json({
                    success: false,
                    message: 'Template not found'
                });
            }
        } else {
            // Preview with raw content
            const { content } = req.body;
            template = { content, availableVariables: [] };
        }

        // Extract template data based on provided IDs
        const templateData = await messagingVariableService.extractTemplateData({
            leadId,
            clientId,
            appointmentId,
            coachId: req.user.id
        });

        // Merge with custom variables
        const allVariables = { ...templateData, ...customVariables };

        // Get system variables
        const systemVars = messagingVariableService.getSystemVariables();
        Object.assign(allVariables, systemVars);

        // Replace variables in content
        const processedContent = { ...template.content };
        
        if (processedContent.body) {
            processedContent.body = messagingVariableService.replaceVariables(
                processedContent.body,
                allVariables
            );
        }

        if (processedContent.subject) {
            processedContent.subject = messagingVariableService.replaceVariables(
                processedContent.subject,
                allVariables
            );
        }

        // Show which variables are available vs used
        const availableVars = messagingVariableService.getAvailableVariables();
        const usedVariables = [];
        const unusedVariables = [];

        Object.keys(allVariables).forEach(key => {
            usedVariables.push({
                variable: `{{${key}}}`,
                value: allVariables[key],
                defined: true
            });
        });

        res.json({
            success: true,
            data: {
                preview: processedContent,
                usedVariables,
                availableVariables: availableVars,
                sample: allVariables
            }
        });

    } catch (error) {
        console.error('❌ [TEMPLATE] Error previewing template:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to preview template',
            error: error.message
        });
    }
});

// @desc    Admin: Distribute template to subscriptions
// @route   POST /api/central-messaging/v1/templates/distribute
// @access  Private (Admin)
exports.distributeTemplate = asyncHandler(async (req, res) => {
    try {
        const { templateId, subscriptionPlans } = req.body;

        const template = await MessageTemplate.findById(templateId);
        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        // Grant template to all coaches with specified subscription plans
        let updatedCount = 0;
        
        if (subscriptionPlans && subscriptionPlans.length > 0) {
            // Update all active subscriptions with these plans
            const result = await CoachSubscription.updateMany(
                { 
                    planId: { $in: subscriptionPlans },
                    status: 'active'
                },
                { 
                    $push: {
                        availableTemplates: {
                            templateId: template._id,
                            templateName: template.name,
                            grantedAt: new Date()
                        }
                    }
                }
            );
            updatedCount = result.modifiedCount;
        }

        res.json({
            success: true,
            message: `Template distributed to ${updatedCount} subscriptions`,
            data: {
                templateId,
                subscriptionPlans,
                updatedCount
            }
        });

    } catch (error) {
        console.error('❌ [TEMPLATE] Error distributing template:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to distribute template',
            error: error.message
        });
    }
});

// @desc    Check if template can be used (24hr window for local templates)
// @route   GET /api/central-messaging/v1/templates/:templateId/check-usage
// @access  Private (Coach)
exports.checkTemplateUsage = asyncHandler(async (req, res) => {
    try {
        const { templateId } = req.params;
        const { contactPhone } = req.query;

        const template = await MessageTemplate.findById(templateId);
        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        // Meta templates can be used anytime
        if (template.isPreBuilt && template.type === 'whatsapp') {
            return res.json({
                success: true,
                canUse: true,
                reason: 'Meta approved template can be used anytime',
                requires24hrWindow: false
            });
        }

        // Local templates and email templates need 24hr window for WhatsApp
        if (template.type === 'whatsapp' || template.type === 'universal') {
            // Check if within 24hr window (implementation needed)
            // For now, return true for email, conditional for WhatsApp
            return res.json({
                success: true,
                canUse: true,
                reason: 'Local template can be used within 24hr window',
                requires24hrWindow: true
            });
        }

        // Email templates can always be used
        res.json({
            success: true,
            canUse: true,
            reason: 'Email template can be used anytime',
            requires24hrWindow: false
        });

    } catch (error) {
        console.error('❌ [TEMPLATE] Error checking template usage:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check template usage',
            error: error.message
        });
    }
});

// Helper function to grant template to subscriptions
async function grantTemplateToSubscriptions(templateId, templateName) {
    try {
        const result = await CoachSubscription.updateMany(
            { status: 'active' },
            {
                $push: {
                    availableTemplates: {
                        templateId,
                        templateName,
                        grantedAt: new Date()
                    }
                }
            }
        );
        console.log(`✅ Granted template to ${result.modifiedCount} subscriptions`);
    } catch (error) {
        console.error('❌ Error granting template:', error);
    }
}

// Export all functions
module.exports = exports;

