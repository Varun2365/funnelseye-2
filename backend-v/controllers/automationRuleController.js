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
        // Extract available events from the AutomationRule schema
        const availableEvents = [
            // Lead & Customer Lifecycle
            {
                value: 'lead_created',
                label: 'Lead Created',
                category: 'Lead & Customer Lifecycle',
                description: 'Triggered when a new lead is created'
            },
            {
                value: 'lead_status_changed',
                label: 'Lead Status Changed',
                category: 'Lead & Customer Lifecycle',
                description: 'Triggered when a lead\'s status is updated'
            },
            {
                value: 'lead_temperature_changed',
                label: 'Lead Temperature Changed',
                category: 'Lead & Customer Lifecycle',
                description: 'Triggered when a lead\'s temperature (hot/warm/cold) changes'
            },
            {
                value: 'lead_converted_to_client',
                label: 'Lead Converted to Client',
                category: 'Lead & Customer Lifecycle',
                description: 'Triggered when a lead becomes a paying client'
            },

            // Funnel & Conversion
            {
                value: 'form_submitted',
                label: 'Form Submitted',
                category: 'Funnel & Conversion',
                description: 'Triggered when a form is submitted'
            },
            {
                value: 'funnel_stage_entered',
                label: 'Funnel Stage Entered',
                category: 'Funnel & Conversion',
                description: 'Triggered when a lead enters a new funnel stage'
            },
            {
                value: 'funnel_stage_exited',
                label: 'Funnel Stage Exited',
                category: 'Funnel & Conversion',
                description: 'Triggered when a lead exits a funnel stage'
            },
            {
                value: 'funnel_completed',
                label: 'Funnel Completed',
                category: 'Funnel & Conversion',
                description: 'Triggered when a lead completes the entire funnel'
            },

            // Appointment & Calendar
            {
                value: 'appointment_booked',
                label: 'Appointment Booked',
                category: 'Appointment & Calendar',
                description: 'Triggered when an appointment is booked'
            },
            {
                value: 'appointment_rescheduled',
                label: 'Appointment Rescheduled',
                category: 'Appointment & Calendar',
                description: 'Triggered when an appointment is rescheduled'
            },
            {
                value: 'appointment_cancelled',
                label: 'Appointment Cancelled',
                category: 'Appointment & Calendar',
                description: 'Triggered when an appointment is cancelled'
            },
            {
                value: 'appointment_reminder_time',
                label: 'Appointment Reminder Time',
                category: 'Appointment & Calendar',
                description: 'Triggered at the scheduled reminder time before an appointment'
            },
            {
                value: 'appointment_finished',
                label: 'Appointment Finished',
                category: 'Appointment & Calendar',
                description: 'Triggered when an appointment is completed'
            },

            // Communication
            {
                value: 'content_consumed',
                label: 'Content Consumed',
                category: 'Communication',
                description: 'Triggered when a lead consumes content (views, downloads, etc.)'
            },

            // Task & System
            {
                value: 'task_created',
                label: 'Task Created',
                category: 'Task & System',
                description: 'Triggered when a new task is created'
            },
            {
                value: 'task_completed',
                label: 'Task Completed',
                category: 'Task & System',
                description: 'Triggered when a task is marked as completed'
            },
            {
                value: 'task_overdue',
                label: 'Task Overdue',
                category: 'Task & System',
                description: 'Triggered when a task becomes overdue'
            },

            // Payment & Subscription
            {
                value: 'payment_successful',
                label: 'Payment Successful',
                category: 'Payment & Subscription',
                description: 'Triggered when a payment is successfully processed'
            },
            {
                value: 'payment_failed',
                label: 'Payment Failed',
                category: 'Payment & Subscription',
                description: 'Triggered when a payment fails'
            },
            {
                value: 'payment_link_clicked',
                label: 'Payment Link Clicked',
                category: 'Payment & Subscription',
                description: 'Triggered when a payment link is clicked'
            },
            {
                value: 'payment_abandoned',
                label: 'Payment Abandoned',
                category: 'Payment & Subscription',
                description: 'Triggered when a payment process is abandoned'
            },
            {
                value: 'invoice_paid',
                label: 'Invoice Paid',
                category: 'Payment & Subscription',
                description: 'Triggered when an invoice is paid'
            },
            {
                value: 'subscription_created',
                label: 'Subscription Created',
                category: 'Payment & Subscription',
                description: 'Triggered when a new subscription is created'
            },
            {
                value: 'subscription_cancelled',
                label: 'Subscription Cancelled',
                category: 'Payment & Subscription',
                description: 'Triggered when a subscription is cancelled'
            },
            {
                value: 'card_expired',
                label: 'Card Expired',
                category: 'Payment & Subscription',
                description: 'Triggered when a payment card expires'
            },
            {
                value: 'lead_updated',
                label: 'Lead Updated',
                category: 'Lead & Customer Lifecycle',
                description: 'Triggered when any lead field is updated'
            },
            {
                value: 'lead_tag_added',
                label: 'Lead Tag Added',
                category: 'Lead & Customer Lifecycle',
                description: 'Triggered when a tag is added to a lead'
            },
            {
                value: 'lead_tag_removed',
                label: 'Lead Tag Removed',
                category: 'Lead & Customer Lifecycle',
                description: 'Triggered when a tag is removed from a lead'
            },
            {
                value: 'funnel_page_viewed',
                label: 'Funnel Page Viewed',
                category: 'Funnel & Conversion',
                description: 'Triggered when a lead views a funnel page'
            },
            {
                value: 'appointment_no_show',
                label: 'Appointment No Show',
                category: 'Appointment & Calendar',
                description: 'Triggered when a lead doesn\'t show up for an appointment'
            },
            {
                value: 'email_opened',
                label: 'Email Opened',
                category: 'Communication',
                description: 'Triggered when an email is opened'
            },
            {
                value: 'email_clicked',
                label: 'Email Clicked',
                category: 'Communication',
                description: 'Triggered when a link in an email is clicked'
            },
            {
                value: 'email_bounced',
                label: 'Email Bounced',
                category: 'Communication',
                description: 'Triggered when an email bounces'
            },
            {
                value: 'whatsapp_message_received',
                label: 'WhatsApp Message Received',
                category: 'Communication',
                description: 'Triggered when a WhatsApp message is received'
            },
            {
                value: 'whatsapp_message_sent',
                label: 'WhatsApp Message Sent',
                category: 'Communication',
                description: 'Triggered when a WhatsApp message is sent'
            },
            {
                value: 'sms_received',
                label: 'SMS Received',
                category: 'Communication',
                description: 'Triggered when an SMS is received'
            },
            {
                value: 'sms_sent',
                label: 'SMS Sent',
                category: 'Communication',
                description: 'Triggered when an SMS is sent'
            },
            {
                value: 'task_assigned',
                label: 'Task Assigned',
                category: 'Task & System',
                description: 'Triggered when a task is assigned to someone'
            },
            {
                value: 'invoice_sent',
                label: 'Invoice Sent',
                category: 'Payment & Subscription',
                description: 'Triggered when an invoice is sent'
            },
            {
                value: 'invoice_overdue',
                label: 'Invoice Overdue',
                category: 'Payment & Subscription',
                description: 'Triggered when an invoice becomes overdue'
            },
            {
                value: 'subscription_renewed',
                label: 'Subscription Renewed',
                category: 'Payment & Subscription',
                description: 'Triggered when a subscription is renewed'
            },
            {
                value: 'subscription_expired',
                label: 'Subscription Expired',
                category: 'Payment & Subscription',
                description: 'Triggered when a subscription expires'
            },
            {
                value: 'refund_issued',
                label: 'Refund Issued',
                category: 'Payment & Subscription',
                description: 'Triggered when a refund is issued'
            }
        ];

        // Extract available actions from the AutomationAction schema
        const availableActions = [
            // Lead Data & Funnel Actions
            {
                value: 'update_lead_score',
                label: 'Update Lead Score',
                category: 'Lead Data & Funnel Actions',
                description: 'Update the score of a lead',
                configFields: ['score', 'reason']
            },
            {
                value: 'add_lead_tag',
                label: 'Add Lead Tag',
                category: 'Lead Data & Funnel Actions',
                description: 'Add a tag to a lead',
                configFields: ['tag']
            },
            {
                value: 'remove_lead_tag',
                label: 'Remove Lead Tag',
                category: 'Lead Data & Funnel Actions',
                description: 'Remove a tag from a lead',
                configFields: ['tag']
            },
            {
                value: 'add_to_funnel',
                label: 'Add to Funnel',
                category: 'Lead Data & Funnel Actions',
                description: 'Add a lead to a specific funnel',
                configFields: ['funnelId', 'stageId']
            },
            {
                value: 'move_to_funnel_stage',
                label: 'Move to Funnel Stage',
                category: 'Lead Data & Funnel Actions',
                description: 'Move a lead to a different funnel stage',
                configFields: ['funnelId', 'stageId']
            },
            {
                value: 'remove_from_funnel',
                label: 'Remove from Funnel',
                category: 'Lead Data & Funnel Actions',
                description: 'Remove a lead from a funnel',
                configFields: ['funnelId']
            },
            {
                value: 'update_lead_field',
                label: 'Update Lead Field',
                category: 'Lead Data & Funnel Actions',
                description: 'Update a specific field of a lead',
                configFields: ['field', 'value']
            },
            {
                value: 'create_deal',
                label: 'Create Deal',
                category: 'Lead Data & Funnel Actions',
                description: 'Create a new deal for a lead',
                configFields: ['dealName', 'amount', 'stage']
            },

            // Communication Actions
            {
                value: 'send_whatsapp_message',
                label: 'Send WhatsApp Message',
                category: 'Communication Actions',
                description: 'Send a WhatsApp message to a lead',
                configFields: ['message', 'templateId']
            },
            {
                value: 'send_email_message',
                label: 'Send Email Message',
                category: 'Communication Actions',
                description: 'Send an email message to a lead',
                configFields: ['subject', 'body', 'templateId', 'to']
            },
            {
                value: 'send_sms_message',
                label: 'Send SMS Message',
                category: 'Communication Actions',
                description: 'Send an SMS message to a lead',
                configFields: ['message', 'templateId', 'to']
            },
            {
                value: 'send_internal_notification',
                label: 'Send Internal Notification',
                category: 'Communication Actions',
                description: 'Send an internal notification to team members',
                configFields: ['message', 'recipients']
            },
            {
                value: 'send_push_notification',
                label: 'Send Push Notification',
                category: 'Communication Actions',
                description: 'Send a push notification to a lead',
                configFields: ['title', 'body', 'data']
            },
            {
                value: 'schedule_drip_sequence',
                label: 'Schedule Drip Sequence',
                category: 'Communication Actions',
                description: 'Schedule a drip sequence for a lead',
                configFields: ['sequenceId', 'delay']
            },
            {
                value: 'send_follow_up_message',
                label: 'Send Follow-up Message',
                category: 'Communication Actions',
                description: 'Send a follow-up message based on previous interaction',
                configFields: ['message', 'channel', 'delay', 'conditions']
            },
            {
                value: 'send_personalized_message',
                label: 'Send Personalized Message',
                category: 'Communication Actions',
                description: 'Send a message with personalized content based on lead data',
                configFields: ['template', 'variables', 'channel']
            },
            {
                value: 'send_bulk_message',
                label: 'Send Bulk Message',
                category: 'Communication Actions',
                description: 'Send a message to multiple leads at once',
                configFields: ['message', 'recipients', 'channel', 'segment']
            },
            {
                value: 'schedule_reminder',
                label: 'Schedule Reminder',
                category: 'Communication Actions',
                description: 'Schedule a reminder message for future delivery',
                configFields: ['message', 'reminderTime', 'channel']
            },

            // Task & Workflow Actions
            {
                value: 'create_task',
                label: 'Create Task',
                category: 'Task & Workflow Actions',
                description: 'Create a new task',
                configFields: ['name', 'description', 'assignedTo', 'priority', 'stage', 'dueDate', 'estimatedHours', 'relatedLead']
            },
            {
                value: 'create_multiple_tasks',
                label: 'Create Multiple Tasks',
                category: 'Task & Workflow Actions',
                description: 'Create multiple tasks at once',
                configFields: ['tasks', 'assignToStaff']
            },
            {
                value: 'update_lead_status',
                label: 'Update Lead Status',
                category: 'Lead Data & Funnel Actions',
                description: 'Update the status of a lead',
                configFields: ['status']
            },
            {
                value: 'assign_lead_to_staff',
                label: 'Assign Lead to Staff',
                category: 'Lead Data & Funnel Actions',
                description: 'Assign a lead to a staff member',
                configFields: ['staffId']
            },
            {
                value: 'wait_delay',
                label: 'Wait/Delay',
                category: 'System Actions',
                description: 'Wait for a specified amount of time before continuing',
                configFields: ['delaySeconds', 'delayMinutes', 'delayHours', 'delayDays']
            },
            {
                value: 'create_calendar_event',
                label: 'Create Calendar Event',
                category: 'Task & Workflow Actions',
                description: 'Create a calendar event',
                configFields: ['title', 'startTime', 'endTime', 'attendees']
            },
            {
                value: 'add_note_to_lead',
                label: 'Add Note to Lead',
                category: 'Task & Workflow Actions',
                description: 'Add a note to a lead\'s record',
                configFields: ['note', 'noteType']
            },
            {
                value: 'add_followup_date',
                label: 'Add Follow-up Date',
                category: 'Task & Workflow Actions',
                description: 'Schedule a follow-up date for a lead',
                configFields: ['followupDate', 'notes']
            },

            // Zoom Integration Actions
            {
                value: 'create_zoom_meeting',
                label: 'Create Zoom Meeting',
                category: 'Zoom Integration Actions',
                description: 'Create a Zoom meeting',
                configFields: ['topic', 'startTime', 'duration', 'attendees']
            },

            // Payment Actions
            {
                value: 'create_invoice',
                label: 'Create Invoice',
                category: 'Payment Actions',
                description: 'Create an invoice for a lead',
                configFields: ['amount', 'description', 'dueDate']
            },
            {
                value: 'issue_refund',
                label: 'Issue Refund',
                category: 'Payment Actions',
                description: 'Issue a refund for a payment',
                configFields: ['amount', 'reason', 'paymentId']
            },

            // System Actions
            {
                value: 'call_webhook',
                label: 'Call Webhook',
                category: 'System Actions',
                description: 'Call an external webhook',
                configFields: ['url', 'method', 'headers', 'payload']
            },
            {
                value: 'trigger_another_automation',
                label: 'Trigger Another Automation',
                category: 'System Actions',
                description: 'Trigger another automation rule',
                configFields: ['automationRuleId', 'delay']
            }
        ];

        res.status(200).json({
            success: true,
            data: {
                events: availableEvents,
                actions: availableActions,
                categories: {
                    events: [...new Set(availableEvents.map(e => e.category))],
                    actions: [...new Set(availableActions.map(a => a.category))]
                }
            }
        });
    } catch (error) {
        console.error('Error getting automation events and actions:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

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