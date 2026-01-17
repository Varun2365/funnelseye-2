// D:\PRJ_YCT_Final\services\automationProcessor.js
const funnelseyeEventEmitter = require('./eventEmitterService');
const AutomationRule = require('../schema/AutomationRule'); // Needed to find rules
// WhatsApp manager moved to dustbin/whatsapp-dump/
const { parseTemplateString } = require('../utils/templateParser'); // The utility we just created
const Lead = require('../schema/Lead'); // Needed for UPDATE_LEAD_STATUS action
const { emailService, smsService, internalNotificationService, aiService } = require('./actionExecutorService');
const centralWhatsAppService = require('./centralWhatsAppService');

const evaluateConditions = (conditions, eventData) => {
    // Simple example: all conditions must be true
    if (!conditions) return true;
    return conditions.every(cond => {
        // Example: { field: 'leadTemperature', op: 'eq', value: 'Hot' }
        if (cond.op === 'eq') return eventData[cond.field] === cond.value;
        if (cond.op === 'ne') return eventData[cond.field] !== cond.value;
        if (cond.op === 'gt') return eventData[cond.field] > cond.value;
        if (cond.op === 'lt') return eventData[cond.field] < cond.value;
        return false;
    });
};

/**
 * Evaluate trigger conditions for automation rules
 * @param {Array} conditions - Array of condition objects
 * @param {String} logic - 'AND' or 'OR'
 * @param {Object} eventData - Event data to evaluate against
 * @returns {Boolean} - True if conditions are met
 */
const evaluateTriggerConditions = (conditions, logic, eventData) => {
    if (!conditions || conditions.length === 0) return true;
    
    const results = conditions.map(cond => {
        const fieldValue = getNestedValue(eventData, cond.field);
        const conditionValue = cond.value;
        
        switch (cond.operator) {
            case 'equals':
                return String(fieldValue) === String(conditionValue);
            case 'not_equals':
                return String(fieldValue) !== String(conditionValue);
            case 'contains':
                return String(fieldValue).toLowerCase().includes(String(conditionValue).toLowerCase());
            case 'not_contains':
                return !String(fieldValue).toLowerCase().includes(String(conditionValue).toLowerCase());
            case 'greater_than':
                return Number(fieldValue) > Number(conditionValue);
            case 'less_than':
                return Number(fieldValue) < Number(conditionValue);
            case 'is_empty':
                return !fieldValue || String(fieldValue).trim() === '';
            case 'is_not_empty':
                return fieldValue && String(fieldValue).trim() !== '';
            case 'in':
                return Array.isArray(conditionValue) && conditionValue.includes(fieldValue);
            case 'not_in':
                return Array.isArray(conditionValue) && !conditionValue.includes(fieldValue);
            default:
                return false;
        }
    });
    
    if (logic === 'OR') {
        return results.some(r => r === true);
    } else {
        return results.every(r => r === true);
    }
};

/**
 * Get nested value from object using dot notation
 * @param {Object} obj - Object to get value from
 * @param {String} path - Dot notation path (e.g., 'lead.status')
 * @returns {*} - Value at path or undefined
 */
const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, prop) => {
        return current && current[prop] !== undefined ? current[prop] : undefined;
    }, obj);
};

/**
 * Executes a single automation action based on its type and configuration.
 * This is where the actual work for each action (like sending a WhatsApp message) happens.
 *
 * @param {object} action - The action object from an AutomationRule (e.g., { type: 'SEND_WHATSAPP', config: { ... } }).
 * @param {object} eventData - The full event payload that triggered the automation (e.g., { eventType: 'LEAD_CREATED', leadData: { ... }, coachId: '...' }).
 */
const executeAutomationAction = async (action, eventData) => {
    try {
        if (action.conditions && !evaluateConditions(action.conditions, eventData)) {
            console.log('Rule conditions not met. Skipping rule.');
            return;
        }

        // AI-enhanced action execution
        switch (action.type) {
            case 'send_whatsapp_message':
                console.log(`[AutomationProcessor] Executing WhatsApp message action for lead: ${eventData.leadId}`);
                try {
                    // WhatsApp service removed - using centralWhatsAppService only
                    // const unifiedWhatsAppService = require('../whatsapp/services/unifiedWhatsAppService');
                    
                    // Get the coach's default device
                    const WhatsAppDevice = require('../schema/WhatsAppDevice');
                    const device = await WhatsAppDevice.findOne({
                        coachId: eventData.coachId,
                        isDefault: true,
                        isActive: true
                    });

                    if (!device) {
                        console.warn(`[AutomationProcessor] No default WhatsApp device found for coach ${eventData.coachId}`);
                        return;
                    }

                    // Parse template variables with comprehensive data
                    const messageContent = parseTemplateString(action.config.message, {
                        // Lead data
                        lead: {
                            name: eventData.lead?.name || eventData.name || eventData.leadData?.name,
                            firstName: eventData.lead?.firstName || eventData.leadData?.firstName,
                            lastName: eventData.lead?.lastName || eventData.leadData?.lastName,
                            email: eventData.lead?.email || eventData.email || eventData.leadData?.email,
                            phone: eventData.lead?.phone || eventData.phone || eventData.leadData?.phone,
                            status: eventData.lead?.status || eventData.leadData?.status,
                            temperature: eventData.lead?.temperature || eventData.leadData?.temperature,
                            source: eventData.lead?.source || eventData.leadData?.source,
                            score: eventData.lead?.score || eventData.leadData?.score
                        },
                        // Coach data
                        coach: {
                            name: eventData.coach?.name || eventData.coachData?.name,
                            email: eventData.coach?.email || eventData.coachData?.email
                        },
                        // Staff data
                        assignedStaff: {
                            name: eventData.assignedStaff?.name || eventData.assignedStaffData?.name,
                            email: eventData.assignedStaff?.email || eventData.assignedStaffData?.email
                        },
                        // Legacy support
                        name: eventData.name || eventData.leadData?.name,
                        email: eventData.email || eventData.leadData?.email,
                        phone: eventData.phone || eventData.leadData?.phone,
                        company: eventData.company || eventData.leadData?.company
                    });

                    // Send the message using central WhatsApp service
                    await centralWhatsAppService.sendMessage({
                        to: eventData.phone || eventData.leadData?.phone,
                        message: messageContent,
                        type: 'text',
                        senderType: 'automation',
                        senderId: eventData.ruleId,
                        coachId: eventData.coachId
                    });

                    console.log(`[AutomationProcessor] WhatsApp message sent successfully to ${eventData.phone || eventData.leadData?.phone}`);
                } catch (error) {
                    console.error(`[AutomationProcessor] Error sending WhatsApp message:`, error);
                }
                break;

            case 'create_task':
                console.log(`[AutomationProcessor] Creating task for lead: ${eventData.leadId || eventData.lead?._id}`);
                try {
                    const Task = require('../schema/Task');
                    const Staff = require('../schema/Staff');
                    
                    // Get required IDs
                    const leadId = eventData.leadId || eventData.lead?._id || eventData.lead?.id;
                    const coachId = eventData.coachId || eventData.coach?._id || eventData.coach?.id;
                    
                    // Validate required fields
                    if (!leadId) {
                        console.warn(`[AutomationProcessor] create_task: Missing leadId in eventData. Cannot create task.`);
                        return;
                    }
                    
                    if (!coachId) {
                        console.warn(`[AutomationProcessor] create_task: Missing coachId in eventData. Cannot create task.`);
                        return;
                    }
                    
                    // Parse template variables in task name and description
                    let taskName = parseTemplateString(action.config.name || action.config.title || 'New Task', {
                        leadName: eventData.lead?.name || eventData.name,
                        leadEmail: eventData.lead?.email || eventData.email,
                        leadPhone: eventData.lead?.phone || eventData.phone,
                        coachName: eventData.coach?.name
                    });
                    
                    // Ensure task name is not empty
                    if (!taskName || taskName.trim() === '') {
                        console.warn(`[AutomationProcessor] create_task: Task name is empty. Using default name.`);
                        taskName = 'New Task';
                    }
                    
                    const taskDescription = parseTemplateString(action.config.description || '', {
                        leadName: eventData.lead?.name || eventData.name,
                        leadEmail: eventData.lead?.email || eventData.email,
                        leadPhone: eventData.lead?.phone || eventData.phone
                    });
                    
                    // Determine assignedTo - MUST be provided
                    let assignedTo = null;
                    if (action.config.assignedTo) {
                        // Check if it's a staff ID
                        const staff = await Staff.findById(action.config.assignedTo);
                        if (staff) {
                            assignedTo = staff._id;
                        } else {
                            // Default to coach
                            assignedTo = coachId;
                        }
                    } else {
                        // Default to coach if no assignment specified
                        assignedTo = coachId;
                    }
                    
                    // Calculate due date - MUST be provided (required field)
                    let dueDate = null;
                    if (action.config.dueDate) {
                        dueDate = new Date(action.config.dueDate);
                    } else if (action.config.dueDateOffset) {
                        // Offset from now (e.g., +7 days)
                        dueDate = new Date();
                        dueDate.setDate(dueDate.getDate() + parseInt(action.config.dueDateOffset));
                    } else {
                        // Default to 7 days from now if not specified
                        dueDate = new Date();
                        dueDate.setDate(dueDate.getDate() + 7);
                    }
                    
                    // Ensure dueDate is valid
                    if (isNaN(dueDate.getTime())) {
                        console.warn(`[AutomationProcessor] create_task: Invalid dueDate. Using default (7 days from now).`);
                        dueDate = new Date();
                        dueDate.setDate(dueDate.getDate() + 7);
                    }
                    
                    const newTask = await Task.create({
                        name: taskName.trim(),
                        description: taskDescription || '',
                        assignedTo: assignedTo,
                        priority: action.config.priority || 'MEDIUM',
                        stage: action.config.stage || 'LEAD_GENERATION',
                        dueDate: dueDate,
                        estimatedHours: action.config.estimatedHours || 1,
                        relatedLead: leadId,
                        coachId: coachId,
                        status: 'Pending'
                    });
                    
                    console.log(`[AutomationProcessor] Task created successfully: ${newTask._id}`);
                } catch (error) {
                    console.error(`[AutomationProcessor] Error creating task:`, error);
                    console.error(`[AutomationProcessor] Error details:`, error.message);
                }
                break;
            
            case 'create_multiple_tasks':
                console.log(`[AutomationProcessor] Creating multiple tasks for lead: ${eventData.leadId || eventData.lead?._id}`);
                try {
                    const Task = require('../schema/Task');
                    const Staff = require('../schema/Staff');
                    const tasks = action.config.tasks || [];
                    
                    // Get required IDs
                    const leadId = eventData.leadId || eventData.lead?._id || eventData.lead?.id;
                    const coachId = eventData.coachId || eventData.coach?._id || eventData.coach?.id;
                    
                    // Validate required fields
                    if (!leadId) {
                        console.warn(`[AutomationProcessor] create_multiple_tasks: Missing leadId in eventData. Cannot create tasks.`);
                        return;
                    }
                    
                    if (!coachId) {
                        console.warn(`[AutomationProcessor] create_multiple_tasks: Missing coachId in eventData. Cannot create tasks.`);
                        return;
                    }
                    
                    for (const taskConfig of tasks) {
                        let taskName = parseTemplateString(taskConfig.name || 'New Task', {
                            leadName: eventData.lead?.name || eventData.name,
                            leadEmail: eventData.lead?.email || eventData.email
                        });
                        
                        // Ensure task name is not empty
                        if (!taskName || taskName.trim() === '') {
                            taskName = 'New Task';
                        }
                        
                        let assignedTo = null;
                        if (taskConfig.assignedTo) {
                            const staff = await Staff.findById(taskConfig.assignedTo);
                            assignedTo = staff ? staff._id : coachId;
                        } else if (action.config.assignToStaff) {
                            // Assign to staff from lead assignment
                            assignedTo = eventData.assignedStaff?._id || eventData.assignedStaffId || coachId;
                        } else {
                            assignedTo = coachId;
                        }
                        
                        // Calculate due date - MUST be provided
                        let dueDate = null;
                        if (taskConfig.dueDate) {
                            dueDate = new Date(taskConfig.dueDate);
                        } else if (taskConfig.dueDateOffset) {
                            dueDate = new Date();
                            dueDate.setDate(dueDate.getDate() + parseInt(taskConfig.dueDateOffset));
                        } else {
                            // Default to 7 days from now
                            dueDate = new Date();
                            dueDate.setDate(dueDate.getDate() + 7);
                        }
                        
                        // Ensure dueDate is valid
                        if (isNaN(dueDate.getTime())) {
                            dueDate = new Date();
                            dueDate.setDate(dueDate.getDate() + 7);
                        }
                        
                        await Task.create({
                            name: taskName.trim(),
                            description: parseTemplateString(taskConfig.description || '', {
                                leadName: eventData.lead?.name || eventData.name
                            }) || '',
                            assignedTo: assignedTo,
                            priority: taskConfig.priority || 'MEDIUM',
                            stage: taskConfig.stage || 'LEAD_GENERATION',
                            dueDate: dueDate,
                            estimatedHours: taskConfig.estimatedHours || 1,
                            relatedLead: leadId,
                            coachId: coachId,
                            status: 'Pending'
                        });
                    }
                    
                    console.log(`[AutomationProcessor] Created ${tasks.length} tasks successfully`);
                } catch (error) {
                    console.error(`[AutomationProcessor] Error creating multiple tasks:`, error);
                    console.error(`[AutomationProcessor] Error details:`, error.message);
                }
                break;
            
            case 'assign_lead_to_staff':
                console.log(`[AutomationProcessor] Assigning lead to staff: ${action.config.staffId}`);
                try {
                    const leadId = eventData.leadId || eventData.lead?._id;
                    if (!leadId) {
                        console.warn(`[AutomationProcessor] assign_lead_to_staff: Missing leadId in eventData`);
                        return;
                    }
                    
                    await Lead.findByIdAndUpdate(leadId, {
                        assignedTo: action.config.staffId
                    });
                    
                    console.log(`[AutomationProcessor] Lead ${leadId} assigned to staff ${action.config.staffId}`);
                } catch (error) {
                    console.error(`[AutomationProcessor] Error assigning lead to staff:`, error);
                }
                break;
            
            case 'add_note_to_lead':
                console.log(`[AutomationProcessor] Adding note to lead`);
                try {
                    const leadId = eventData.leadId || eventData.lead?._id;
                    if (!leadId || !action.config.note) {
                        console.warn(`[AutomationProcessor] add_note_to_lead: Missing leadId or note`);
                        return;
                    }
                    
                    // Parse template variables in note
                    const noteContent = parseTemplateString(action.config.note, {
                        lead: {
                            name: eventData.lead?.name || eventData.name || eventData.leadData?.name,
                            firstName: eventData.lead?.firstName || eventData.leadData?.firstName,
                            lastName: eventData.lead?.lastName || eventData.leadData?.lastName,
                            email: eventData.lead?.email || eventData.email || eventData.leadData?.email,
                            phone: eventData.lead?.phone || eventData.phone || eventData.leadData?.phone,
                            status: eventData.lead?.status || eventData.leadData?.status
                        },
                        coach: {
                            name: eventData.coach?.name || eventData.coachData?.name,
                            email: eventData.coach?.email || eventData.coachData?.email
                        }
                    });
                    
                    const lead = await Lead.findById(leadId);
                    if (lead) {
                        // Lead schema has notes as a String field, so we'll append to it
                        const existingNotes = lead.notes || '';
                        const noteType = action.config.noteType || 'general';
                        const timestamp = new Date().toISOString();
                        const newNote = `[${noteType.toUpperCase()}] ${timestamp}: ${noteContent}`;
                        
                        // Append new note with separator
                        lead.notes = existingNotes 
                            ? `${existingNotes}\n\n${newNote}`
                            : newNote;
                        
                        await lead.save();
                        console.log(`[AutomationProcessor] Note added to lead ${leadId}`);
                    }
                } catch (error) {
                    console.error(`[AutomationProcessor] Error adding note to lead:`, error);
                }
                break;
            
            case 'update_lead_status':
                console.log(`[AutomationProcessor] Updating lead status to: ${action.config.status}`);
                try {
                    const leadId = eventData.leadId || eventData.lead?._id;
                    if (!leadId || !action.config.status) {
                        console.warn(`[AutomationProcessor] update_lead_status: Missing leadId or status`);
                        return;
                    }
                    
                    await Lead.findByIdAndUpdate(leadId, {
                        status: action.config.status
                    });
                    
                    console.log(`[AutomationProcessor] Lead ${leadId} status updated to ${action.config.status}`);
                } catch (error) {
                    console.error(`[AutomationProcessor] Error updating lead status:`, error);
                }
                break;
            
            case 'send_email_message':
                console.log(`[AutomationProcessor] Sending email message`);
                try {
                    const MessageTemplate = require('../schema/MessageTemplate');
                    let emailSubject = action.config.subject || '';
                    let emailBody = action.config.body || '';
                    
                    // If templateId is provided, load template
                    if (action.config.templateId) {
                        const template = await MessageTemplate.findById(action.config.templateId);
                        if (template && template.type === 'email') {
                            emailSubject = template.subject || emailSubject;
                            emailBody = template.content || emailBody;
                        }
                    }
                    
                    // Parse template variables with comprehensive data
                    const templateData = {
                        lead: {
                            name: eventData.lead?.name || eventData.name || eventData.leadData?.name,
                            firstName: eventData.lead?.firstName || eventData.leadData?.firstName,
                            lastName: eventData.lead?.lastName || eventData.leadData?.lastName,
                            email: eventData.lead?.email || eventData.email || eventData.leadData?.email,
                            phone: eventData.lead?.phone || eventData.phone || eventData.leadData?.phone,
                            status: eventData.lead?.status || eventData.leadData?.status
                        },
                        coach: {
                            name: eventData.coach?.name || eventData.coachData?.name,
                            email: eventData.coach?.email || eventData.coachData?.email
                        },
                        // Legacy support
                        leadName: eventData.lead?.name || eventData.name,
                        leadEmail: eventData.lead?.email || eventData.email,
                        coachName: eventData.coach?.name
                    };
                    
                    emailSubject = parseTemplateString(emailSubject, templateData);
                    emailBody = parseTemplateString(emailBody, templateData);
                    
                    const toEmail = action.config.to || eventData.lead?.email || eventData.email;
                    
                    await emailService.sendEmail({
                        to: toEmail,
                        subject: emailSubject,
                        body: emailBody
                    });
                    
                    console.log(`[AutomationProcessor] Email sent successfully to ${toEmail}`);
                } catch (error) {
                    console.error(`[AutomationProcessor] Error sending email:`, error);
                }
                break;
            
            case 'send_sms_message':
                console.log(`[AutomationProcessor] Sending SMS message`);
                try {
                    const MessageTemplate = require('../schema/MessageTemplate');
                    let smsMessage = action.config.message || '';
                    
                    // If templateId is provided, load template
                    if (action.config.templateId) {
                        const template = await MessageTemplate.findById(action.config.templateId);
                        if (template && template.type === 'sms') {
                            smsMessage = template.content || smsMessage;
                        }
                    }
                    
                    // Parse template variables with comprehensive data
                    const smsTemplateData = {
                        lead: {
                            name: eventData.lead?.name || eventData.name || eventData.leadData?.name,
                            firstName: eventData.lead?.firstName || eventData.leadData?.firstName,
                            lastName: eventData.lead?.lastName || eventData.leadData?.lastName,
                            email: eventData.lead?.email || eventData.email || eventData.leadData?.email,
                            phone: eventData.lead?.phone || eventData.phone || eventData.leadData?.phone,
                            status: eventData.lead?.status || eventData.leadData?.status
                        },
                        coach: {
                            name: eventData.coach?.name || eventData.coachData?.name,
                            email: eventData.coach?.email || eventData.coachData?.email
                        },
                        // Legacy support
                        leadName: eventData.lead?.name || eventData.name,
                        leadPhone: eventData.lead?.phone || eventData.phone,
                        coachName: eventData.coach?.name
                    };
                    
                    smsMessage = parseTemplateString(smsMessage, smsTemplateData);
                    
                    const toPhone = action.config.to || eventData.lead?.phone || eventData.phone;
                    
                    await smsService.sendSMS({
                        to: toPhone,
                        message: smsMessage
                    });
                    
                    console.log(`[AutomationProcessor] SMS sent successfully to ${toPhone}`);
                } catch (error) {
                    console.error(`[AutomationProcessor] Error sending SMS:`, error);
                }
                break;
            
            case 'wait_delay':
                console.log(`[AutomationProcessor] Waiting for delay: ${action.config.delaySeconds || action.config.delayMinutes || action.config.delayHours || action.config.delayDays}`);
                // Calculate total delay in milliseconds
                let delayMs = 0;
                if (action.config.delaySeconds) delayMs += action.config.delaySeconds * 1000;
                if (action.config.delayMinutes) delayMs += action.config.delayMinutes * 60 * 1000;
                if (action.config.delayHours) delayMs += action.config.delayHours * 60 * 60 * 1000;
                if (action.config.delayDays) delayMs += action.config.delayDays * 24 * 60 * 60 * 1000;
                
                if (delayMs > 0) {
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                    console.log(`[AutomationProcessor] Delay completed`);
                }
                break;

            case 'UPDATE_LEAD_STATUS':
                console.log(`[AutomationProcessor] Attempting to update lead status for lead: ${eventData.leadId}`);
                if (!eventData.leadId || !action.config.newStatus) {
                    console.warn(`[AutomationProcessor] UPDATE_LEAD_STATUS: Missing leadId in eventData or 'newStatus' in action config. Skipping.`);
                    return;
                }
                try {
                    const updatedLead = await Lead.findByIdAndUpdate(
                        eventData.leadId,
                        { status: action.config.newStatus },
                        { new: true, runValidators: true } // 'new: true' returns the updated doc; 'runValidators' ensures schema validation
                    );
                    if (updatedLead) {
                        console.log(`[AutomationProcessor] Successfully updated lead ${eventData.leadId} status to "${action.config.newStatus}".`);
                        // If this update itself should trigger other automations, you'd emit another event here:
                        // funnelseyeEventEmitter.emit('trigger', {
                        //     eventType: 'LEAD_STATUS_CHANGED',
                        //     leadId: updatedLead._id.toString(),
                        //     leadData: updatedLead.toObject(),
                        //     coachId: updatedLead.coachId.toString(),
                        //     previousStatus: eventData.leadData.status // Pass previous status if known
                        // });
                    } else {
                        console.warn(`[AutomationProcessor] UPDATE_LEAD_STATUS: Lead with ID ${eventData.leadId} not found. Status not updated.`);
                    }
                } catch (updateError) {
                    console.error(`[AutomationProcessor] Error updating lead status for ${eventData.leadId}:`, updateError.message);
                }
                break;

            case 'CREATE_EMAIL_MESSAGE':
                await emailService.sendEmail({
                    to: eventData.email,
                    subject: action.config.subject,
                    body: action.config.body
                });
                break;

            case 'CREATE_SMS_MESSAGE':
                await smsService.sendSMS({
                    to: eventData.phone,
                    message: action.config.message
                });
                break;

            case 'ASSIGN_LEAD_TO_COACH':
                console.log(`[AutomationProcessor] Simulating assigning lead ${eventData.leadId} to coach ${action.config.newCoachId}`);
                // Placeholder: Logic to update the lead's assigned coach.
                break;

            case 'SEND_NOTIFICATION':
                await internalNotificationService.sendNotification({
                    recipientId: eventData.userId,
                    message: action.config.message
                });
                break;

            case 'AI_GENERATE_COPY':
                const copyResult = await aiService.generateMarketingCopy(
                    action.config.prompt || 'Generate marketing copy',
                    action.config.options || {}
                );
                
                if (copyResult.success) {
                    // Store generated copy or use it in subsequent actions
                    eventData.generatedCopy = copyResult.content;
                }
                break;

            case 'AI_DETECT_SENTIMENT':
                if (eventData.message) {
                    const sentiment = await aiService.analyzeSentiment(eventData.message);
                    eventData.detectedSentiment = sentiment;
                }
                break;

            case 'AI_SCORE_LEAD':
                if (eventData.leadData) {
                    const insights = await aiService.generateLeadInsights(eventData.leadData);
                    if (insights.success) {
                        eventData.leadInsights = insights.content;
                    }
                }
                break;

            default:
                console.warn(`[AutomationProcessor] Unknown action type: ${action.type}. No action performed.`);
        }
    } catch (error) {
        console.error(`[AutomationProcessor] CRITICAL ERROR executing action ${action.type}:`, error);
    }
};

/**
 * Initializes the automation processor. This function sets up the event listener
 * that will react to events emitted by other parts of your application.
 */
const initAutomationProcessor = () => {
    console.log('[AutomationProcessor] Initializing. Listening for generic "trigger" events...');

    // The 'trigger' event is designed as a universal entry point for all automations.
    // When any part of your app emits 'trigger' with an eventType, this listener activates.
    funnelseyeEventEmitter.on('trigger', async (payload) => {
        const eventName = payload.eventType; // e.g., 'LEAD_CREATED', 'LEAD_STATUS_CHANGED'
        const eventData = payload; // This is the full context data passed with the event

        if (!eventName) {
            console.warn('[AutomationProcessor] Received a "trigger" event without an "eventType" field in its payload. Skipping.');
            return;
        }

        console.log(`\n[AutomationProcessor] Generic 'trigger' event received. Specific eventType: ${eventName}`);

        try {
            // Find all active automation rules that are configured to trigger on this specific eventName.
            const matchingRules = await AutomationRule.find({
                triggerEvent: eventName,
                isActive: true // Only process active rules
            });

            if (matchingRules.length === 0) {
                console.log(`[AutomationProcessor] No active automation rules found for eventType: ${eventName}`);
                return;
            }

            console.log(`[AutomationProcessor] Found ${matchingRules.length} matching rules for eventType: ${eventName}`);

            // Iterate through each rule that matches the triggered event.
            for (const rule of matchingRules) {
                console.log(`[AutomationProcessor] Processing Rule: "${rule.name}" (ID: ${rule._id})`);

                    // Evaluate trigger conditions
                if (rule.triggerConditions && rule.triggerConditions.length > 0) {
                    const conditionsMet = evaluateTriggerConditions(rule.triggerConditions, rule.triggerConditionLogic || 'AND', eventData);
                    if (!conditionsMet) {
                        console.log(`[AutomationProcessor] Rule "${rule.name}" conditions not met. Skipping rule.`);
                        continue;
                    }
                }

                // For each matching rule, execute all its defined actions in order
                const sortedActions = [...rule.actions].sort((a, b) => (a.order || 0) - (b.order || 0));
                
                for (const action of sortedActions) {
                    // Handle delay if specified
                    if (action.delay && action.delay > 0) {
                        await new Promise(resolve => setTimeout(resolve, action.delay * 1000));
                    }
                    
                    await executeAutomationAction(action, { ...eventData, ruleId: rule._id });
                }
                console.log(`[AutomationProcessor] Finished processing Rule: "${rule.name}".`);
            }
        } catch (error) {
            console.error(`[AutomationProcessor] CRITICAL ERROR during automation rule processing for eventType ${eventName}:`, error);
        }
    });

    console.log(`[AutomationProcessor] Automation processor is ready to process events.`);
};

module.exports = {
    initAutomationProcessor
};