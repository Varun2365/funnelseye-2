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

/**
 * @desc Get builder resources (funnels, etc.)
 * @route GET /api/admin-automation-rules/builder-resources
 * @access Private (Admin only)
 */
exports.getBuilderResources = asyncHandler(async (req, res) => {
    const AdminFunnel = require('../schema/AdminFunnel');

    const funnels = await AdminFunnel.find({ isActive: true })
        .select('_id name funnelUrl')
        .sort({ name: 1 });

    res.status(200).json({
        success: true,
        data: {
            funnels: funnels.map(funnel => ({
                id: funnel._id,
                name: funnel.name,
                funnelUrl: funnel.funnelUrl
            }))
        }
    });
});

/**
 * @desc Get events and actions for the builder
 * @route GET /api/admin-automation-rules/events-actions
 * @access Private (Admin only)
 */
exports.getEventsAndActions = asyncHandler(async (req, res) => {
    console.log('🔍 [getEventsAndActions] API called');

    // Static events and actions for now
    const events = [
        { value: 'lead_created', label: 'Lead Created', description: 'When a new lead is created in the system', category: 'Lead Management' },
        { value: 'lead_status_changed', label: 'Lead Status Changed', description: 'When a lead\'s status is updated', category: 'Lead Management' },
        { value: 'lead_converted_to_client', label: 'Lead Converted to Client', description: 'When a lead becomes a paying client', category: 'Lead Management' },
        { value: 'form_submitted', label: 'Form Submitted', description: 'When a funnel form is submitted', category: 'Lead Management' },
        { value: 'appointment_scheduled', label: 'Appointment Scheduled', description: 'When an appointment is booked', category: 'Lead Management' },
        { value: 'payment_received', label: 'Payment Received', description: 'When a payment is successfully processed', category: 'Payment Processing' }
    ];

    const actions = [
        { value: 'send_email', label: 'Send Email', description: 'Send an email to the lead', category: 'Communication' },
        { value: 'send_sms', label: 'Send SMS', description: 'Send an SMS message', category: 'Communication' },
        { value: 'update_lead_status', label: 'Update Lead Status', description: 'Change the lead\'s status', category: 'Lead Management' },
        { value: 'create_task', label: 'Create Task', description: 'Create a task for the team', category: 'Task Management' },
        { value: 'send_webhook', label: 'Send Webhook', description: 'Send data to external service', category: 'System Integration' },
        { value: 'assign_to_coach', label: 'Assign to Coach', description: 'Assign lead to a specific coach', category: 'Lead Management' }
    ];

    const categories = [
        'Lead Management',
        'Communication',
        'Task Management',
        'Payment Processing',
        'System Integration'
    ];

    const responseData = {
        success: true,
        data: {
            events,
            actions,
            categories
        }
    };

    console.log('🔍 [getEventsAndActions] Returning data:', responseData);

    res.status(200).json(responseData);
});

/**
 * @desc Get workflow flows
 * @route GET /api/admin-automation-rules/flows
 * @access Private (Admin only)
 */
exports.getFlows = asyncHandler(async (req, res) => {
    // Return empty array for now - flows would be workflow executions
    res.status(200).json({
        success: true,
        data: []
    });
});

/**
 * @desc Get automation runs
 * @route GET /api/admin-automation-rules/runs
 * @access Private (Admin only)
 */
exports.getRuns = asyncHandler(async (req, res) => {
    // Return empty array for now - runs would be execution history
    res.status(200).json({
        success: true,
        data: []
    });
});

/**
 * @desc Get automation analytics
 * @route GET /api/admin-automation-rules/analytics
 * @access Private (Admin only)
 */
exports.getAnalytics = asyncHandler(async (req, res) => {
    // Calculate basic analytics
    const totalRules = await AdminAutomationRule.countDocuments();
    const activeRules = await AdminAutomationRule.countDocuments({ isActive: true });
    const totalExecutions = await AdminAutomationRule.aggregate([
        { $group: { _id: null, total: { $sum: '$executionCount' } } }
    ]);

    const successRate = totalExecutions.length > 0 ? 95 : 0; // Mock success rate
    const averageDuration = totalExecutions.length > 0 ? 2.5 : 0; // Mock duration

    res.status(200).json({
        success: true,
        data: {
            totalExecutions: totalExecutions.length > 0 ? totalExecutions[0].total : 0,
            successRate,
            averageDuration,
            totalRules,
            activeRules
        }
    });
});

/**
 * @desc Assign funnel to automation rule
 * @route PUT /api/admin-automation-rules/:id/assign-funnel
 * @access Private (Admin only)
 */
exports.assignFunnel = asyncHandler(async (req, res) => {
    const { funnelId } = req.body;
    const rule = await AdminAutomationRule.findById(req.params.id);

    if (!rule) {
        return res.status(404).json({
            success: false,
            message: 'Automation rule not found'
        });
    }

    rule.funnelId = funnelId || null;
    await rule.save();

    res.status(200).json({
        success: true,
        data: rule,
        message: `Rule ${funnelId ? 'assigned to funnel' : 'unassigned from funnel'} successfully`
    });
});

/**
 * @desc Start automation run
 * @route POST /api/admin-automation-rules/run
 * @access Private (Admin only)
 */
exports.startAutomationRun = asyncHandler(async (req, res) => {
    // Mock automation run - in real implementation, this would trigger the workflow
    const runData = {
        _id: Date.now().toString(),
        ruleId: req.body.ruleId,
        status: 'completed',
        startedAt: new Date(),
        completedAt: new Date(Date.now() + 2000), // 2 seconds later
        result: 'success'
    };

    res.status(200).json({
        success: true,
        data: runData,
        message: 'Automation run completed successfully'
    });
});

/**
 * @desc Validate workflow graph
 * @route POST /api/admin-automation-rules/validate-graph
 * @access Private (Admin only)
 */
exports.validateWorkflow = asyncHandler(async (req, res) => {
    const { nodes, edges } = req.body;

    // Basic validation
    const errors = [];
    const warnings = [];

    if (!nodes || nodes.length === 0) {
        errors.push('Workflow must have at least one node');
    }

    if (!edges || edges.length === 0) {
        warnings.push('Workflow has no connections between nodes');
    }

    // Check for trigger nodes
    const triggerNodes = nodes.filter(node => node.type === 'trigger');
    if (triggerNodes.length === 0) {
        errors.push('Workflow must have at least one trigger node');
    }

    // Check for orphan nodes
    const connectedNodeIds = new Set();
    edges.forEach(edge => {
        connectedNodeIds.add(edge.source);
        connectedNodeIds.add(edge.target);
    });

    nodes.forEach(node => {
        if (!connectedNodeIds.has(node.id)) {
            warnings.push(`Node "${node.data.label}" is not connected to the workflow`);
        }
    });

    res.status(200).json({
        success: true,
        data: {
            isValid: errors.length === 0,
            errors,
            warnings
        }
    });
});

/**
 * @desc Test automation rule
 * @route POST /api/admin-automation-rules/:id/test
 * @access Private (Admin only)
 */
exports.testAutomation = asyncHandler(async (req, res) => {
    const { testData } = req.body;
    const rule = await AdminAutomationRule.findById(req.params.id);

    if (!rule) {
        return res.status(404).json({
            success: false,
            message: 'Automation rule not found'
        });
    }

    // Mock test execution
    res.status(200).json({
        success: true,
        data: {
            ruleId: rule._id,
            status: 'completed',
            result: 'success',
            message: 'Test execution completed successfully'
        },
        message: 'Automation rule tested successfully'
    });
});