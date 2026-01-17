const asyncHandler = require('../middleware/async');
const MessageTemplate = require('../schema/MessageTemplate');
const Lead = require('../schema/Lead');
const templateService = require('../services/templateService');

// @desc    Get available templates for coach
// @route   GET /api/messaging/templates
// @access  Private (Coach)
exports.getCoachTemplates = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [TEMPLATE] getCoachTemplates - Starting...');
        
        const coachId = req.user.id;
        const { type, category, search } = req.query;
        
        // Build query
        const query = { 
            $or: [
                { coachId: coachId }, // Coach's own templates
                { isPreBuilt: true }  // Pre-built templates
            ],
            isActive: true
        };
        
        if (type) query.type = type;
        if (category) query.category = category;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        const templates = await MessageTemplate.find(query)
            .sort({ isPreBuilt: 1, name: 1 })
            .select('name description type category content availableVariables isPreBuilt usageStats');
        
        console.log('✅ [TEMPLATE] getCoachTemplates - Success');
        res.status(200).json({
            success: true,
            data: {
                templates,
                total: templates.length
            }
        });
        
    } catch (error) {
        console.error('❌ [TEMPLATE] getCoachTemplates - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get templates',
            error: error.message
        });
    }
});

// @desc    Preview template with sample data
// @route   GET /api/messaging/templates/:templateId/preview
// @access  Private (Coach)
exports.previewTemplate = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [TEMPLATE] previewTemplate - Starting...');
        
        const { templateId } = req.params;
        const { leadId } = req.query;
        
        const template = await MessageTemplate.findById(templateId);
        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }
        
        // Get sample data
        let sampleData = {};
        if (leadId) {
            const lead = await Lead.findById(leadId);
            if (lead) {
                sampleData = templateService.extractLeadData(lead);
            }
        } else {
            // Use default sample data
            sampleData = templateService.getSampleData();
        }
        
        // Render template
        const renderedTemplate = template.renderTemplate(sampleData);
        
        console.log('✅ [TEMPLATE] previewTemplate - Success');
        res.status(200).json({
            success: true,
            data: {
                template: {
                    id: template._id,
                    name: template.name,
                    description: template.description,
                    type: template.type,
                    category: template.category
                },
                sampleData,
                renderedContent: renderedTemplate,
                availableVariables: template.availableVariables
            }
        });
        
    } catch (error) {
        console.error('❌ [TEMPLATE] previewTemplate - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to preview template',
            error: error.message
        });
    }
});

// @desc    Get available template parameters from database
// @route   GET /api/messaging/templates/parameters
// @access  Private (Coach)
exports.getTemplateParameters = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [TEMPLATE] getTemplateParameters - Starting...');
        
        const parameters = templateService.getAvailableParameters();
        
        console.log('✅ [TEMPLATE] getTemplateParameters - Success');
        res.status(200).json({
            success: true,
            data: {
                parameters,
                total: parameters.length
            }
        });
        
    } catch (error) {
        console.error('❌ [TEMPLATE] getTemplateParameters - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get template parameters',
            error: error.message
        });
    }
});

// @desc    Get all templates across all coaches
// @route   GET /api/messaging/admin/templates
// @access  Private (Admin)
exports.getAllTemplates = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [TEMPLATE] getAllTemplates - Starting...');
        
        const { type, category, search, coachId } = req.query;
        
        // Build query
        const query = { isActive: true };
        
        if (type) query.type = type;
        if (category) query.category = category;
        if (coachId) query.coachId = coachId;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        const templates = await MessageTemplate.find(query)
            .populate('coachId', 'name email')
            .sort({ createdAt: -1 })
            .select('name description type category content availableVariables isPreBuilt usageStats coachId createdAt');
        
        console.log('✅ [TEMPLATE] getAllTemplates - Success');
        res.status(200).json({
            success: true,
            data: {
                templates,
                total: templates.length
            }
        });
        
    } catch (error) {
        console.error('❌ [TEMPLATE] getAllTemplates - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get all templates',
            error: error.message
        });
    }
});

// @desc    Create global template
// @route   POST /api/messaging/admin/templates
// @access  Private (Admin)
exports.createGlobalTemplate = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [TEMPLATE] createGlobalTemplate - Starting...');
        
        const {
            name,
            description,
            type,
            category,
            content,
            availableVariables,
            tags
        } = req.body;
        
        // Validate required fields
        if (!name || !type || !content || !content.body) {
            return res.status(400).json({
                success: false,
                message: 'Name, type, and content body are required'
            });
        }
        
        // Create template
        const template = new MessageTemplate({
            name,
            description,
            type,
            category: category || 'custom',
            content,
            availableVariables: availableVariables || [],
            tags: tags || [],
            isPreBuilt: true,
            isActive: true
        });
        
        await template.save();
        
        console.log('✅ [TEMPLATE] createGlobalTemplate - Success');
        res.status(201).json({
            success: true,
            message: 'Global template created successfully',
            data: {
                template
            }
        });
        
    } catch (error) {
        console.error('❌ [TEMPLATE] createGlobalTemplate - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create global template',
            error: error.message
        });
    }
});

// @desc    Update global template
// @route   PUT /api/messaging/admin/templates/:templateId
// @access  Private (Admin)
exports.updateGlobalTemplate = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [TEMPLATE] updateGlobalTemplate - Starting...');
        
        const { templateId } = req.params;
        const updateData = req.body;
        
        const template = await MessageTemplate.findById(templateId);
        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }
        
        // Update template
        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                template[key] = updateData[key];
            }
        });
        
        await template.save();
        
        console.log('✅ [TEMPLATE] updateGlobalTemplate - Success');
        res.status(200).json({
            success: true,
            message: 'Global template updated successfully',
            data: {
                template
            }
        });
        
    } catch (error) {
        console.error('❌ [TEMPLATE] updateGlobalTemplate - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update global template',
            error: error.message
        });
    }
});

// @desc    Delete global template
// @route   DELETE /api/messaging/admin/templates/:templateId
// @access  Private (Admin)
exports.deleteGlobalTemplate = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [TEMPLATE] deleteGlobalTemplate - Starting...');
        
        const { templateId } = req.params;
        
        const template = await MessageTemplate.findById(templateId);
        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }
        
        // Soft delete by setting isActive to false
        template.isActive = false;
        await template.save();
        
        console.log('✅ [TEMPLATE] deleteGlobalTemplate - Success');
        res.status(200).json({
            success: true,
            message: 'Global template deleted successfully'
        });
        
    } catch (error) {
        console.error('❌ [TEMPLATE] deleteGlobalTemplate - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete global template',
            error: error.message
        });
    }
});

module.exports = exports;
