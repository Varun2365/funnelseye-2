const AdTemplate = require('../schema/AdTemplate');
const asyncHandler = require('../middleware/async');

// Get all ad templates
exports.getTemplates = asyncHandler(async (req, res) => {
    const { category, isActive, isPublic, search, tags } = req.query;
    
    const filter = {};
    
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isPublic !== undefined) filter.isPublic = isPublic === 'true';
    if (tags) filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { adTitle: { $regex: search, $options: 'i' } },
            { adDescription: { $regex: search, $options: 'i' } }
        ];
    }
    
    // Only show public templates or templates created by the current admin
    const adminId = req.admin?._id;
    if (adminId) {
        filter.$or = [
            { isPublic: true },
            { createdBy: adminId }
        ];
    } else {
        filter.isPublic = true;
    }
    
    const templates = await AdTemplate.find(filter)
        .populate('createdBy', 'name email')
        .populate('funnelId', 'name')
        .sort({ createdAt: -1 })
        .lean();
    
    res.json({
        success: true,
        data: templates,
        count: templates.length
    });
});

// Get single template by ID
exports.getTemplate = asyncHandler(async (req, res) => {
    const { templateId } = req.params;
    
    const template = await AdTemplate.findById(templateId)
        .populate('createdBy', 'name email')
        .populate('funnelId', 'name url')
        .lean();
    
    if (!template) {
        return res.status(404).json({
            success: false,
            message: 'Template not found'
        });
    }
    
    // Check if user has access (public or created by them)
    const adminId = req.admin?._id;
    if (!template.isPublic && template.createdBy?._id?.toString() !== adminId?.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Access denied'
        });
    }
    
    res.json({
        success: true,
        data: template
    });
});

// Create new template
exports.createTemplate = asyncHandler(async (req, res) => {
    const adminId = req.admin?._id;
    
    const templateData = {
        ...req.body,
        createdBy: adminId
    };
    
    const template = await AdTemplate.create(templateData);
    
    res.status(201).json({
        success: true,
        data: template,
        message: 'Template created successfully'
    });
});

// Update template
exports.updateTemplate = asyncHandler(async (req, res) => {
    const { templateId } = req.params;
    const adminId = req.admin?._id;
    
    const template = await AdTemplate.findById(templateId);
    
    if (!template) {
        return res.status(404).json({
            success: false,
            message: 'Template not found'
        });
    }
    
    // Check if user has permission (created by them or is admin)
    if (template.createdBy?.toString() !== adminId?.toString() && !req.admin?.role?.includes('admin')) {
        return res.status(403).json({
            success: false,
            message: 'You do not have permission to update this template'
        });
    }
    
    Object.assign(template, req.body);
    await template.save();
    
    res.json({
        success: true,
        data: template,
        message: 'Template updated successfully'
    });
});

// Delete template
exports.deleteTemplate = asyncHandler(async (req, res) => {
    const { templateId } = req.params;
    const adminId = req.admin?._id;
    
    const template = await AdTemplate.findById(templateId);
    
    if (!template) {
        return res.status(404).json({
            success: false,
            message: 'Template not found'
        });
    }
    
    // Check if user has permission (created by them or is admin)
    if (template.createdBy?.toString() !== adminId?.toString() && !req.admin?.role?.includes('admin')) {
        return res.status(403).json({
            success: false,
            message: 'You do not have permission to delete this template'
        });
    }
    
    await template.deleteOne();
    
    res.json({
        success: true,
        message: 'Template deleted successfully'
    });
});

// Duplicate template
exports.duplicateTemplate = asyncHandler(async (req, res) => {
    const { templateId } = req.params;
    const adminId = req.admin?._id;
    
    const template = await AdTemplate.findById(templateId);
    
    if (!template) {
        return res.status(404).json({
            success: false,
            message: 'Template not found'
        });
    }
    
    // Check if user has access
    if (!template.isPublic && template.createdBy?.toString() !== adminId?.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Access denied'
        });
    }
    
    // Create duplicate
    const templateData = template.toObject();
    delete templateData._id;
    delete templateData.createdAt;
    delete templateData.updatedAt;
    templateData.name = `${templateData.name} (Copy)`;
    templateData.createdBy = adminId;
    templateData.isPublic = false; // Duplicates are private by default
    templateData.usageCount = 0;
    templateData.lastUsed = null;
    
    const newTemplate = await AdTemplate.create(templateData);
    
    res.status(201).json({
        success: true,
        data: newTemplate,
        message: 'Template duplicated successfully'
    });
});

// Increment usage count
exports.incrementUsage = asyncHandler(async (req, res) => {
    const { templateId } = req.params;
    
    const template = await AdTemplate.findByIdAndUpdate(
        templateId,
        {
            $inc: { usageCount: 1 },
            lastUsed: new Date()
        },
        { new: true }
    );
    
    if (!template) {
        return res.status(404).json({
            success: false,
            message: 'Template not found'
        });
    }
    
    res.json({
        success: true,
        data: template
    });
});

// Get template statistics
exports.getTemplateStats = asyncHandler(async (req, res) => {
    const stats = await AdTemplate.aggregate([
        {
            $group: {
                _id: null,
                totalTemplates: { $sum: 1 },
                activeTemplates: {
                    $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
                },
                publicTemplates: {
                    $sum: { $cond: [{ $eq: ['$isPublic', true] }, 1, 0] }
                },
                totalUsage: { $sum: '$usageCount' },
                byCategory: {
                    $push: {
                        category: '$category',
                        count: 1
                    }
                }
            }
        }
    ]);
    
    const categoryStats = await AdTemplate.aggregate([
        {
            $group: {
                _id: '$category',
                count: { $sum: 1 }
            }
        }
    ]);
    
    res.json({
        success: true,
        data: {
            ...(stats[0] || {}),
            categoryBreakdown: categoryStats
        }
    });
});
