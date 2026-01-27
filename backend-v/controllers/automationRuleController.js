// D:\PRJ_YCT_Final\controllers\automationRuleController.js

const AutomationRule = require('../schema/AutomationRule');
// The publishEvent function is not needed here
// const { publishEvent } = require('../services/rabbitmqProducer');

/**
 * @desc Create a new automation rule.
 * @route POST /api/automation-rules
 * @access Private (Protected by auth middleware)
 */
exports.createRule = async (req, res) => {
    try {
        const {
            name,
            coachId,
            triggerEvent,
            triggerConditions,
            triggerConditionLogic,
            actions,
            description,
            isActive,
            // Graph-based workflow fields
            workflowType,
            nodes,
            edges,
            viewport
        } = req.body;

        // Use coachId from request body or authenticated user
        const ruleCoachId = coachId || req.coachId || req.user?.id;
        
        if (!ruleCoachId) {
            return res.status(400).json({ 
                success: false,
                message: 'coachId is required' 
            });
        }

        // Determine workflow type
        const isGraphWorkflow = workflowType === 'graph' || (nodes && nodes.length > 0);
        
        // Validation based on workflow type
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'name is required'
            });
        }

        if (isGraphWorkflow) {
            // Graph-based workflow validation
            if (!nodes || nodes.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'At least one node is required for graph-based workflows'
                });
            }
            
            // Validate that there's at least one trigger node
            const hasTrigger = nodes.some(node => node.type === 'trigger');
            if (!hasTrigger) {
                return res.status(400).json({
                    success: false,
                    message: 'At least one trigger node is required'
                });
            }
            
            // Validate that there's at least one action node
            const hasAction = nodes.some(node => node.type === 'action');
            if (!hasAction) {
                return res.status(400).json({
                    success: false,
                    message: 'At least one action node is required'
                });
            }
        } else {
            // Legacy workflow validation
            if (!triggerEvent || !actions || actions.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'name, triggerEvent, and at least one action are required for legacy workflows'
                });
            }
        }

        // Check subscription limits for automation rule creation
        const SubscriptionLimitsMiddleware = require('../middleware/subscriptionLimits');
        const subscriptionData = await SubscriptionLimitsMiddleware.getCoachSubscription(ruleCoachId);
        
        if (!subscriptionData) {
            return res.status(403).json({
                success: false,
                message: 'No active subscription found. Please subscribe to a plan to create automation rules.',
                error: 'SUBSCRIPTION_REQUIRED',
                subscriptionRequired: true
            });
        }

        const { features } = subscriptionData;
        const maxAutomationRules = features.maxAutomationRules || features.automationRules || 10;
        
        if (maxAutomationRules !== -1) {
            const currentRuleCount = await AutomationRule.countDocuments({ coachId: ruleCoachId });
            
            if (currentRuleCount >= maxAutomationRules) {
                const { sendLimitError } = require('../utils/subscriptionLimitErrors');
                return sendLimitError(res, 'AUTOMATION_RULE', 'Automation rule limit reached', currentRuleCount, maxAutomationRules, true);
            }
        }

        // Get the createdBy ID from the authenticated user
        const createdBy = req.user?.id || req.user?._id || ruleCoachId;
        
        // Prepare rule data
        const ruleData = {
            name,
            coachId: ruleCoachId,
            description,
            isActive: isActive !== undefined ? isActive : true,
            createdBy,
            workflowType: isGraphWorkflow ? 'graph' : 'legacy'
        };

        if (isGraphWorkflow) {
            // Graph-based workflow
            ruleData.nodes = nodes || [];
            ruleData.edges = edges || [];
            ruleData.viewport = viewport || { x: 0, y: 0, zoom: 1 };

            // For graph workflows, don't set triggerEvent since it's not required
            // The trigger information is stored in the nodes themselves
        } else {
            // Legacy workflow
            ruleData.triggerEvent = triggerEvent;
            ruleData.triggerConditions = triggerConditions || [];
            ruleData.triggerConditionLogic = triggerConditionLogic || 'AND';
            
            // Sort actions by order
            const sortedActions = actions.map((action, index) => ({
                ...action,
                order: action.order !== undefined ? action.order : index
            })).sort((a, b) => a.order - b.order);
            ruleData.actions = sortedActions;
        }
        
        // Create the new rule in MongoDB
        const newRule = new AutomationRule(ruleData);
        await newRule.save();

        console.log(`[AutomationRuleController] New automation rule created: "${newRule.name}" (ID: ${newRule._id}, Type: ${newRule.workflowType}) by coach ${newRule.coachId}.`);
        
        res.status(201).json({
            success: true,
            data: newRule
        });
    } catch (error) {
        console.error('Error creating automation rule:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
};

/**
 * @desc Get all automation rules
 * @route GET /api/automation-rules
 * @access Private
 */
exports.getRules = async (req, res) => {
    try {
        const coachId = req.coachId || req.user?.id || req.user?._id;
        const query = coachId ? { coachId } : {};
        
        const rules = await AutomationRule.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: rules,
            count: rules.length
        });
    } catch (error) {
        console.error('Error getting automation rules:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

/**
 * @desc Get a single automation rule by ID
 * @route GET /api/automation-rules/:id
 * @access Private
 */
exports.getRuleById = async (req, res) => {
    try {
        const rule = await AutomationRule.findById(req.params.id)
            .populate('createdBy', 'name email');
        if (!rule) {
            return res.status(404).json({ 
                success: false,
                message: 'Rule not found' 
            });
        }
        res.status(200).json({
            success: true,
            data: rule
        });
    } catch (error) {
        console.error('Error getting automation rule:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
};

/**
 * @desc Update an existing automation rule
 * @route PUT /api/automation-rules/:id
 * @access Private
 */
exports.updateRule = async (req, res) => {
    try {
        const {
            workflowType,
            nodes,
            edges,
            viewport,
            ...otherFields
        } = req.body;

        // Get existing rule
        const existingRule = await AutomationRule.findById(req.params.id);
        if (!existingRule) {
            return res.status(404).json({ 
                success: false,
                message: 'Rule not found' 
            });
        }

        // Determine if updating to graph workflow
        const isGraphWorkflow = workflowType === 'graph' || (nodes && nodes.length > 0);
        
        // Prepare update data - preserve required fields from existing rule
        const updateData = {
            ...otherFields,
            // Preserve required fields that shouldn't be changed during update
            coachId: existingRule.coachId,
            createdBy: existingRule.createdBy
        };
        
        if (isGraphWorkflow) {
            // Validate graph workflow if nodes are provided
            if (nodes) {
                if (nodes.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'At least one node is required for graph-based workflows'
                    });
                }
                
                const hasTrigger = nodes.some(node => node.type === 'trigger');
                const hasAction = nodes.some(node => node.type === 'action');
                
                if (!hasTrigger || !hasAction) {
                    return res.status(400).json({
                        success: false,
                        message: 'Graph workflow must have at least one trigger and one action node'
                    });
                }
            }
            
            updateData.workflowType = 'graph';
            if (nodes) updateData.nodes = nodes;
            if (edges) updateData.edges = edges;
            if (viewport) updateData.viewport = viewport;
            
            // Extract trigger event from trigger node if nodes are updated
            if (nodes) {
                const triggerNode = nodes.find(n => n.type === 'trigger');
                if (triggerNode) {
                    updateData.triggerEvent = triggerNode.nodeType;
                    updateData.triggerConditions = triggerNode.data?.conditions || [];
                    updateData.triggerConditionLogic = triggerNode.data?.conditionLogic || 'AND';
                }
            }
        } else if (workflowType === 'legacy') {
            updateData.workflowType = 'legacy';
        }

        const rule = await AutomationRule.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true, runValidators: true }
        );
        
        if (!rule) {
            return res.status(404).json({
                success: false,
                message: 'Rule not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: rule
        });
    } catch (error) {
        console.error('Error updating automation rule:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
};

/**
 * @desc Assign a funnel to an automation rule
 * @route PUT /api/automation-rules/:id/assign-funnel
 * @access Private
 */
exports.assignFunnel = async (req, res) => {
    try {
        const { funnelId } = req.body;

        // Get existing rule
        const existingRule = await AutomationRule.findById(req.params.id);
        if (!existingRule) {
            return res.status(404).json({
                success: false,
                message: 'Automation rule not found'
            });
        }

        // Update the rule with funnel assignment
        const rule = await AutomationRule.findByIdAndUpdate(
            req.params.id,
            { funnelId: funnelId || null },
            { new: true, runValidators: true }
        );

        if (!rule) {
            return res.status(404).json({
                success: false,
                message: 'Rule not found'
            });
        }

        res.status(200).json({
            success: true,
            data: rule,
            message: funnelId ? 'Rule assigned to funnel' : 'Rule unassigned from funnel'
        });
    } catch (error) {
        console.error('Error assigning funnel to automation rule:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * @desc Delete an automation rule
 * @route DELETE /api/automation-rules/:id
 * @access Private
 */
exports.deleteRule = async (req, res) => {
    try {
        const rule = await AutomationRule.findByIdAndDelete(req.params.id);
        if (!rule) {
            return res.status(404).json({ message: 'Rule not found' });
        }
        res.status(200).json({ message: 'Rule deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @desc Get all available automation events and actions
 * @route GET /api/automation-rules/events-actions
 * @access Public
 */
exports.getEventsAndActions = async (req, res) => {
    try {
        // Return comprehensive events and actions data as requested
        const data = {
            events: {
                "Leads": [
                    { label: "Lead Created", description: "Triggered when a new lead is created", value: "lead_created" },
                    { label: "Lead Status Changed", description: "Triggered when a lead's status is updated", value: "lead_status_changed" },
                    { label: "Lead Temperature Changed", description: "Triggered when a lead's temperature (hot/warm/cold) changes", value: "lead_temperature_changed" },
                    { label: "Lead Converted to Client", description: "Triggered when a lead becomes a paying client", value: "lead_converted_to_client" },
                    { label: "Lead Updated", description: "Triggered when any lead field is updated", value: "lead_updated" },
                    { label: "Lead Tag Added", description: "Triggered when a tag is added to a lead", value: "lead_tag_added" },
                    { label: "Lead Tag Removed", description: "Triggered when a tag is removed from a lead", value: "lead_tag_removed" }
                ],
                "Funnels": [
                    { label: "Form Submitted", description: "Triggered when a form is submitted", value: "form_submitted" },
                    { label: "Funnel Stage Entered", description: "Triggered when a lead enters a new funnel stage", value: "funnel_stage_entered" },
                    { label: "Funnel Stage Exited", description: "Triggered when a lead exits a funnel stage", value: "funnel_stage_exited" },
                    { label: "Funnel Completed", description: "Triggered when a lead completes the entire funnel", value: "funnel_completed" },
                    { label: "Funnel Page Viewed", description: "Triggered when a lead views a funnel page", value: "funnel_page_viewed" }
                ],
                "Appointments": [
                    { label: "Appointment Booked", description: "Triggered when an appointment is booked", value: "appointment_booked" },
                    { label: "Appointment Rescheduled", description: "Triggered when an appointment is rescheduled", value: "appointment_rescheduled" },
                    { label: "Appointment Cancelled", description: "Triggered when an appointment is cancelled", value: "appointment_cancelled" },
                    { label: "Appointment Reminder Time", description: "Triggered at the scheduled reminder time before an appointment", value: "appointment_reminder_time" },
                    { label: "Appointment Finished", description: "Triggered when an appointment is completed", value: "appointment_finished" },
                    { label: "Appointment No Show", description: "Triggered when a lead doesn't show up for an appointment", value: "appointment_no_show" }
                ],
                "Communication": [
                    { label: "Content Consumed", description: "Triggered when a lead consumes content (views, downloads, etc.)", value: "content_consumed" },
                    { label: "Email Opened", description: "Triggered when an email is opened", value: "email_opened" },
                    { label: "Email Clicked", description: "Triggered when a link in an email is clicked", value: "email_clicked" },
                    { label: "Email Bounced", description: "Triggered when an email bounces", value: "email_bounced" },
                    { label: "WhatsApp Message Received", description: "Triggered when a WhatsApp message is received", value: "whatsapp_message_received" },
                    { label: "WhatsApp Message Sent", description: "Triggered when a WhatsApp message is sent", value: "whatsapp_message_sent" },
                    { label: "SMS Received", description: "Triggered when an SMS is received", value: "sms_received" },
                    { label: "SMS Sent", description: "Triggered when an SMS is sent", value: "sms_sent" }
                ],
                "Tasks": [
                    { label: "Task Created", description: "Triggered when a new task is created", value: "task_created" },
                    { label: "Task Completed", description: "Triggered when a task is marked as completed", value: "task_completed" },
                    { label: "Task Overdue", description: "Triggered when a task becomes overdue", value: "task_overdue" },
                    { label: "Task Assigned", description: "Triggered when a task is assigned to someone", value: "task_assigned" }
                ],
                "Payments": [
                    { label: "Payment Successful", description: "Triggered when a payment is successfully processed", value: "payment_successful" },
                    { label: "Payment Failed", description: "Triggered when a payment fails", value: "payment_failed" },
                    { label: "Payment Link Clicked", description: "Triggered when a payment link is clicked", value: "payment_link_clicked" },
                    { label: "Payment Abandoned", description: "Triggered when a payment process is abandoned", value: "payment_abandoned" },
                    { label: "Card Expired", description: "Triggered when a payment card expires", value: "card_expired" }
                ]
            },
            actions: {
                "Lead Actions": [
                    { label: "Update Lead Status", description: "Update the status of a lead", value: "update_lead_status" },
                    { label: "Add Lead Tag", description: "Add a tag to a lead", value: "add_lead_tag" },
                    { label: "Remove Lead Tag", description: "Remove a tag from a lead", value: "remove_lead_tag" },
                    { label: "Assign Lead", description: "Assign a lead to a user", value: "assign_lead" },
                    { label: "Create Task", description: "Create a new task for the lead", value: "create_task" }
                ],
                "Messages": [
                    { label: "Send Email", description: "Send an email to the lead", value: "send_email" },
                    { label: "Send WhatsApp Message", description: "Send a WhatsApp message to the lead", value: "send_whatsapp_message" },
                    { label: "Send SMS", description: "Send an SMS to the lead", value: "send_sms" },
                    { label: "Schedule Email", description: "Schedule an email to be sent later", value: "schedule_email" },
                    { label: "Add to Email Sequence", description: "Add the lead to an email sequence", value: "add_to_email_sequence" }
                ],
                "Tasks": [
                    { label: "Create Task", description: "Create a new task", value: "create_task" },
                    { label: "Update Task", description: "Update an existing task", value: "update_task" },
                    { label: "Assign Task", description: "Assign a task to someone", value: "assign_task" },
                    { label: "Complete Task", description: "Mark a task as completed", value: "complete_task" },
                    { label: "Delete Task", description: "Delete a task", value: "delete_task" }
                ],
                "System": [
                    { label: "Wait/Delay", description: "Wait for a specified amount of time", value: "wait_delay" },
                    { label: "Conditional Split", description: "Split workflow based on conditions", value: "conditional_split" },
                    { label: "Webhook", description: "Send data to a webhook URL", value: "webhook" },
                    { label: "API Call", description: "Make an API call", value: "api_call" },
                    { label: "Update Custom Field", description: "Update a custom field value", value: "update_custom_field" }
                ],
                "Zoom": [
                    { label: "Create Zoom Meeting", description: "Create a new Zoom meeting", value: "create_zoom_meeting" },
                    { label: "Send Zoom Invite", description: "Send a Zoom meeting invite", value: "send_zoom_invite" },
                    { label: "Cancel Zoom Meeting", description: "Cancel a Zoom meeting", value: "cancel_zoom_meeting" },
                    { label: "Reschedule Zoom Meeting", description: "Reschedule a Zoom meeting", value: "reschedule_zoom_meeting" }
                ],
                "Payments": [
                    { label: "Create Invoice", description: "Create an invoice for a lead", value: "create_invoice" },
                    { label: "Issue Refund", description: "Issue a refund for a payment", value: "issue_refund" },
                    { label: "Send Payment Link", description: "Send a payment link to the lead", value: "send_payment_link" },
                    { label: "Update Payment Status", description: "Update the status of a payment", value: "update_payment_status" },
                    { label: "Charge Card", description: "Charge a credit card", value: "charge_card" }
                ]
            }
        };

        return res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('Error getting events and actions:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};


/**
 * @desc Assign or unassign a funnel to an automation rule
 * @route PUT /api/automation-rules/:id/assign-funnel
 * @access Private
 */

/**
 * @desc Get resources needed for automation rule builder (staff, funnels, templates)
 * @route GET /api/automation-rules/builder-resources
 * @access Private
 */
exports.getBuilderResources = async (req, res) => {
    try {
        const coachId = req.coachId || req.user?.id || req.user?._id;

        console.log('=== GET BUILDER RESOURCES ===');
        console.log('req.coachId:', req.coachId);
        console.log('req.user:', req.user);
        console.log('Final coachId:', coachId);

        if (!coachId) {
            console.log('No coachId found - returning error');
            return res.status(400).json({
                success: false,
                message: 'Coach ID is required'
            });
        }

        const Staff = require('../schema/Staff');
        const Funnel = require('../schema/Funnel');
        const MessageTemplate = require('../schema/MessageTemplate');

        console.log('Fetching staff for coachId:', coachId);
        // Fetch staff members
        const staff = await Staff.find({ coachId, isActive: true })
            .select('name email _id')
            .limit(100);

        console.log('Fetching funnels for coachId:', coachId);
        // Fetch funnels
        const funnels = await Funnel.find({ coachId })
            .select('name _id stages')
            .limit(100);

        console.log('Found funnels:', funnels.length);
        funnels.forEach(f => console.log('- Funnel:', f.name, 'ID:', f._id));

        // Fetch message templates (WhatsApp and Email)
        const messageTemplates = await MessageTemplate.find({
            coachId,
            isActive: true
        })
            .select('name type category _id')
            .limit(100);

        // Fetch existing automation rules (for trigger_another_automation action)
        const automationRules = await AutomationRule.find({ coachId, isActive: true })
            .select('name _id')
            .limit(100);

        res.status(200).json({
            success: true,
            data: {
                staff: staff.map(s => ({
                    id: s._id,
                    name: s.name,
                    email: s.email
                })),
                funnels: funnels.map(f => ({
                    id: f._id,
                    name: f.name,
                    stages: f.stages?.length || 0
                })),
                messageTemplates: messageTemplates.map(t => ({
                    id: t._id,
                    name: t.name,
                    type: t.type,
                    category: t.category
                })),
                automationRules: automationRules.map(r => ({
                    id: r._id,
                    name: r.name
                }))
            }
        });
    } catch (error) {
        console.error('Error getting builder resources:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * @desc Assign or unassign a funnel to an automation rule
 * @route PUT /api/automation-rules/:id/assign-funnel
 * @access Private
 */
exports.assignFunnel = async (req, res) => {
try{
        console.log('Fetching funnels for coachId:', coachId);
        // Fetch funnels
        const funnels = await Funnel.find({ coachId })
            .select('name _id stages')
            .limit(100);

        console.log('Found funnels:', funnels.length);
        funnels.forEach(f => console.log('- Funnel:', f.name, 'ID:', f._id));

        // Fetch message templates (WhatsApp and Email)
        const messageTemplates = await MessageTemplate.find({
            coachId,
            isActive: true
        })
            .select('name type category _id')
            .limit(100);

        // Fetch existing automation rules (for trigger_another_automation action)
        const automationRules = await AutomationRule.find({ coachId, isActive: true })
            .select('name _id')
            .limit(100);
        
        res.status(200).json({
            success: true,
            data: {
                staff: staff.map(s => ({ id: s._id, name: s.name || s.email, email: s.email })),
                funnels: funnels.map(f => ({ 
                    id: f._id, 
                    name: f.name,
                    stages: f.stages?.map(s => ({ id: s.pageId || s._id, name: s.name })) || []
                })),
                messageTemplates: messageTemplates.map(t => ({
                    id: t._id,
                    name: t.name,
                    type: t.type,
                    category: t.category
                })),
                automationRules: automationRules.map(r => ({
                    id: r._id,
                    name: r.name
                }))
            }
        });
    } catch (error) {
        console.error('Error getting builder resources:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * @desc Validate a graph-based workflow
 * @route POST /api/automation-rules/validate-graph
 * @access Private
 */
/**
 * @desc Assign or unassign a funnel to an automation rule
 * @route PUT /api/automation-rules/:id/assign-funnel
 * @access Private
 */
exports.assignFunnel = async (req, res) => {
    try {
        const { id } = req.params;
        const { funnelId } = req.body; // null to unassign
        const coachId = req.coachId || req.user?.id;

        if (!coachId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Find the automation rule
        const rule = await AutomationRule.findOne({ _id: id, coachId });
        if (!rule) {
            return res.status(404).json({
                success: false,
                message: 'Automation rule not found'
            });
        }

        // If assigning a funnel, check if it's already assigned to another rule
        if (funnelId) {
            const Funnel = require('../schema/Funnel');
            const funnel = await Funnel.findById(funnelId);
            if (!funnel) {
                return res.status(404).json({
                    success: false,
                    message: 'Funnel not found'
                });
            }

            // Check if funnel belongs to the same coach
            if (funnel.coachId.toString() !== coachId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Funnel does not belong to your account'
                });
            }

            // Check if another rule already has this funnel
            const existingRule = await AutomationRule.findOne({ 
                funnelId, 
                _id: { $ne: id },
                coachId 
            });
            if (existingRule) {
                return res.status(400).json({
                    success: false,
                    message: `Funnel is already assigned to automation rule: ${existingRule.name}`
                });
            }
        }

        // Update the rule
        rule.funnelId = funnelId || null;
        await rule.save();

        res.status(200).json({
            success: true,
            data: rule,
            message: funnelId ? 'Funnel assigned successfully' : 'Funnel unassigned successfully'
        });
    } catch (error) {
        console.error('[AutomationRuleController] Error assigning funnel:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to assign funnel',
            error: error.message
        });
    }
};

/**
 * @desc Get automation rule analytics
 * @route GET /api/automation-rules/:id/analytics
 * @access Private
 */
exports.getAnalytics = async (req, res) => {
    try {
        const { id } = req.params;
        const coachId = req.coachId || req.user?.id;

        if (!coachId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const rule = await AutomationRule.findOne({ _id: id, coachId });
        if (!rule) {
            return res.status(404).json({
                success: false,
                message: 'Automation rule not found'
            });
        }

        // Get execution logs from automation processor (if available)
        // For now, return basic stats
        const analytics = {
            ruleId: rule._id,
            ruleName: rule.name,
            totalExecutions: rule.executionCount || 0,
            lastExecutedAt: rule.lastExecutedAt || null,
            isActive: rule.isActive,
            workflowType: rule.workflowType,
            nodeCount: rule.nodes?.length || 0,
            actionCount: rule.actions?.length || 0,
            createdAt: rule.createdAt,
            updatedAt: rule.updatedAt,
            // Additional stats can be added from execution logs
            executionsByDay: [], // TODO: Aggregate from execution logs
            successRate: null, // TODO: Calculate from execution logs
            averageExecutionTime: null // TODO: Calculate from execution logs
        };

        res.status(200).json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('[AutomationRuleController] Error getting analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get analytics',
            error: error.message
        });
    }
};

/**
 * @desc Get automation rule for a funnel
 * @route GET /api/automation-rules/funnel/:funnelId
 * @access Private
 */
exports.getRuleByFunnel = async (req, res) => {
    try {
        const { funnelId } = req.params;
        const coachId = req.coachId || req.user?.id;

        if (!coachId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const rule = await AutomationRule.findOne({ funnelId, coachId });
        
        if (!rule) {
            return res.status(200).json({
                success: true,
                data: null,
                message: 'No automation rule assigned to this funnel'
            });
        }

        res.status(200).json({
            success: true,
            data: rule
        });
    } catch (error) {
        console.error('[AutomationRuleController] Error getting rule by funnel:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get automation rule',
            error: error.message
        });
    }
};

exports.validateGraphWorkflow = async (req, res) => {
    try {
        const { nodes, edges } = req.body;
        
        const errors = [];
        const warnings = [];
        
        // Basic validation
        if (!nodes || nodes.length === 0) {
            errors.push('At least one node is required');
        }
        
        if (!edges || edges.length === 0) {
            warnings.push('No connections between nodes. Workflow may not execute properly.');
        }
        
        // Check for trigger node
        const triggerNodes = nodes?.filter(n => n.type === 'trigger') || [];
        if (triggerNodes.length === 0) {
            errors.push('At least one trigger node is required');
        }
        if (triggerNodes.length > 1) {
            warnings.push('Multiple trigger nodes detected. Only one trigger will execute per event.');
        }
        
        // Check for action nodes
        const actionNodes = nodes?.filter(n => n.type === 'action') || [];
        if (actionNodes.length === 0) {
            errors.push('At least one action node is required');
        }
        
        // Validate edges
        if (edges && nodes) {
            const nodeIds = new Set(nodes.map(n => n.id));
            edges.forEach(edge => {
                if (!nodeIds.has(edge.source)) {
                    errors.push(`Edge references non-existent source node: ${edge.source}`);
                }
                if (!nodeIds.has(edge.target)) {
                    errors.push(`Edge references non-existent target node: ${edge.target}`);
                }
            });
        }
        
        // Check for orphaned nodes (nodes with no connections)
        if (nodes && edges) {
            const connectedNodeIds = new Set();
            edges.forEach(edge => {
                connectedNodeIds.add(edge.source);
                connectedNodeIds.add(edge.target);
            });
            
            nodes.forEach(node => {
                if (!connectedNodeIds.has(node.id) && node.type !== 'trigger') {
                    warnings.push(`Node "${node.label}" (${node.id}) is not connected to the workflow`);
                }
            });
        }
        
        // Check for cycles (basic check)
        if (edges && nodes) {
            const visited = new Set();
            const recStack = new Set();
            
            const hasCycle = (nodeId) => {
                if (recStack.has(nodeId)) return true;
                if (visited.has(nodeId)) return false;
                
                visited.add(nodeId);
                recStack.add(nodeId);
                
                const outgoingEdges = edges.filter(e => e.source === nodeId);
                for (const edge of outgoingEdges) {
                    if (hasCycle(edge.target)) return true;
                }
                
                recStack.delete(nodeId);
                return false;
            };
            
            for (const node of nodes) {
                if (!visited.has(node.id) && hasCycle(node.id)) {
                    warnings.push('Circular dependencies detected in workflow. This may cause infinite loops.');
                    break;
                }
            }
        }
        
        res.status(200).json({
            success: errors.length === 0,
            valid: errors.length === 0,
            errors,
            warnings
        });
    } catch (error) {
        console.error('Error validating graph workflow:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};