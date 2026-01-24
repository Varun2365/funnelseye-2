const AdminAutomationRule = require('../schema/AdminAutomationRule');
const asyncHandler = require('../middleware/async');

/**
 * @desc Get all admin automation rules
 * @route GET /api/admin-automation-rules
 * @access Private (Admin only)
 */
exports.getRules = asyncHandler(async (req, res) => {
    const { category, isActive, workflowType, search } = req.query;
    const query = {};

    if (category && category !== 'all') {
        query.category = category;
    }

    if (isActive !== undefined) {
        query.isActive = isActive === 'true';
    }

    if (workflowType && workflowType !== 'all') {
        query.workflowType = workflowType;
    }

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    const rules = await AdminAutomationRule.find(query)
        .populate('createdByAdmin', 'name email')
        .populate('funnelId', 'name funnelUrl')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        data: rules,
        count: rules.length
    });
});

/**
 * @desc Get a single admin automation rule by ID
 * @route GET /api/admin-automation-rules/:id
 * @access Private (Admin only)
 */
exports.getRuleById = asyncHandler(async (req, res) => {
    const rule = await AdminAutomationRule.findById(req.params.id)
        .populate('createdByAdmin', 'name email')
        .populate('funnelId', 'name funnelUrl');

    if (!rule) {
        return res.status(404).json({
            success: false,
            message: 'Automation rule not found'
        });
    }

    res.status(200).json({
        success: true,
        data: rule
    });
});

/**
 * @desc Create a new admin automation rule
 * @route POST /api/admin-automation-rules
 * @access Private (Admin only)
 */
exports.createRule = asyncHandler(async (req, res) => {
    const adminId = req.admin?._id || req.user?._id;

    if (!adminId) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized - Admin ID required'
        });
    }

    const ruleData = {
        ...req.body,
        createdByAdmin: adminId
    };

    const rule = await AdminAutomationRule.create(ruleData);

    res.status(201).json({
        success: true,
        data: rule,
        message: 'Automation rule created successfully'
    });
});

/**
 * @desc Update an admin automation rule
 * @route PUT /api/admin-automation-rules/:id
 * @access Private (Admin only)
 */
exports.updateRule = asyncHandler(async (req, res) => {
    const rule = await AdminAutomationRule.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    )
        .populate('createdByAdmin', 'name email')
        .populate('funnelId', 'name funnelUrl');

    if (!rule) {
        return res.status(404).json({
            success: false,
            message: 'Automation rule not found'
        });
    }

    res.status(200).json({
        success: true,
        data: rule,
        message: 'Automation rule updated successfully'
    });
});

/**
 * @desc Delete an admin automation rule
 * @route DELETE /api/admin-automation-rules/:id
 * @access Private (Admin only)
 */
exports.deleteRule = asyncHandler(async (req, res) => {
    const rule = await AdminAutomationRule.findByIdAndDelete(req.params.id);

    if (!rule) {
        return res.status(404).json({
            success: false,
            message: 'Automation rule not found'
        });
    }

    res.status(200).json({
        success: true,
        message: 'Automation rule deleted successfully'
    });
});

/**
 * @desc Toggle active status of an admin automation rule
 * @route PUT /api/admin-automation-rules/:id/toggle
 * @access Private (Admin only)
 */
exports.toggleActive = asyncHandler(async (req, res) => {
    const rule = await AdminAutomationRule.findById(req.params.id);

    if (!rule) {
        return res.status(404).json({
            success: false,
            message: 'Automation rule not found'
        });
    }

    rule.isActive = !rule.isActive;
    await rule.save();

    res.status(200).json({
        success: true,
        data: rule,
        message: `Automation rule ${rule.isActive ? 'activated' : 'deactivated'} successfully`
    });
});

/**
 * @desc Duplicate an admin automation rule
 * @route POST /api/admin-automation-rules/:id/duplicate
 * @access Private (Admin only)
 */
exports.duplicateRule = asyncHandler(async (req, res) => {
    const originalRule = await AdminAutomationRule.findById(req.params.id);

    if (!originalRule) {
        return res.status(404).json({
            success: false,
            message: 'Automation rule not found'
        });
    }

    const ruleData = originalRule.toObject();
    delete ruleData._id;
    delete ruleData.createdAt;
    delete ruleData.updatedAt;
    ruleData.name = `${ruleData.name} (Copy)`;
    ruleData.executionCount = 0;
    ruleData.lastExecutedAt = null;

    const duplicatedRule = await AdminAutomationRule.create(ruleData);

    res.status(201).json({
        success: true,
        data: duplicatedRule,
        message: 'Automation rule duplicated successfully'
    });
});
