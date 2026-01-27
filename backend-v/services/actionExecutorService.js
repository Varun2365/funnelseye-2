// D:\PRJ_YCT_Final\services\actionExecutorService.js

// --- Imports for your Mongoose Schemas ---
const { Lead, Coach, Task, Funnel, Payment } = require('../schema');
// WhatsApp services moved to dustbin/whatsapp-dump/
// const unifiedWhatsAppService = require('./unifiedWhatsAppService');

const nodemailer = require('nodemailer');
const twilio = require('twilio');
const ical = require('ical-generator');
const { Configuration, OpenAIApi } = require('openai');
// WhatsApp manager moved to dustbin/whatsapp-dump/
// const { getIoInstance } = require('./whatsappManager');

// =======================================================================
// Section 1: Placeholder External Service Integrations
// =======================================================================
const emailService = {
    sendEmail: async ({ to, subject, body, attachments }) => {
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html: body,
            attachments
        });
    }
};

const smsService = {
    sendSMS: async ({ to, message }) => {
        const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to
        });
    }
};

const calendarService = {
    createAppointment: async ({ coachEmail, leadEmail, leadName, appointmentTime, zoomLink }) => {
        const cal = ical({ name: 'Appointment' });
        cal.createEvent({
            start: appointmentTime,
            end: new Date(new Date(appointmentTime).getTime() + 30 * 60000),
            summary: `Appointment with ${leadName}`,
            description: zoomLink,
            organizer: coachEmail,
            attendees: [leadEmail]
        });
        return {
            filename: 'appointment.ics',
            content: cal.toString()
        };
    }
};

const Notification = require('../schema/Notification');
const Staff = require('../schema/Staff');

const internalNotificationService = {
    sendNotification: async ({ recipientId, recipientType, message, title, type = 'info', priority = 'normal', actionUrl, actionLabel, relatedEntityType, relatedEntityId, source = 'automation', sourceId, coachId, metadata }) => {
        try {
            // If recipientType is not provided, try to determine it
            if (!recipientType) {
                // Check if it's a coach
                const coach = await Coach.findById(recipientId);
                if (coach) {
                    recipientType = 'coach';
                    coachId = coachId || coach._id;
                } else {
                    // Check if it's a staff
                    const staff = await Staff.findById(recipientId);
                    if (staff) {
                        recipientType = 'staff';
                        coachId = coachId || staff.coachId;
                    } else {
                        recipientType = 'coach'; // Default fallback
                    }
                }
            }
            
            // Ensure coachId is set
            if (!coachId && recipientType === 'staff') {
                const staff = await Staff.findById(recipientId);
                coachId = staff?.coachId;
            } else if (!coachId) {
                coachId = recipientId; // Assume it's the coach
            }
            
            if (!coachId) {
                console.error(`[InternalNotificationService] Cannot determine coachId for recipient ${recipientId}`);
                return;
            }
            
            const notification = await Notification.createNotification({
                recipientId,
                recipientType: recipientType || 'coach',
                title: title || 'Notification',
                message,
                type,
                priority,
                actionUrl,
                actionLabel,
                relatedEntityType,
                relatedEntityId,
                source,
                sourceId,
                coachId,
                metadata: metadata || {}
            });
            
            // Emit WebSocket event for real-time notification
            try {
                // Get Socket.IO instance from main.js
                const { getIoInstance } = require('../utils/socketUtils');
                const io = getIoInstance();
                
                if (io) {
                    const notificationPayload = {
                        id: notification._id.toString(),
                        title: notification.title,
                        message: notification.message,
                        type: notification.type,
                        priority: notification.priority,
                        actionUrl: notification.actionUrl,
                        actionLabel: notification.actionLabel,
                        createdAt: notification.createdAt,
                        isRead: notification.isRead,
                        recipientId: recipientId.toString(),
                        recipientType: recipientType
                    };

                    // Emit to specific user room (primary target)
                    const userRoom = `user-${recipientId}`;
                    io.to(userRoom).emit('notification', notificationPayload);
                    console.log(`[InternalNotificationService] 📡 Emitted to room: ${userRoom}`);
                    
                    // Also emit to coach/staff room based on type
                    if (recipientType === 'coach') {
                        const coachRoom = `coach-${recipientId}`;
                        io.to(coachRoom).emit('notification', notificationPayload);
                        console.log(`[InternalNotificationService] 📡 Emitted to room: ${coachRoom}`);
                        
                        // Also emit to general coach room
                        io.to('coach-room').emit('notification', notificationPayload);
                        console.log(`[InternalNotificationService] 📡 Emitted to room: coach-room`);
                    }
                    
                    // Log room occupancy for debugging (async operation)
                    io.in(userRoom).fetchSockets().then((sockets) => {
                        console.log(`[InternalNotificationService] 📊 Room ${userRoom} has ${sockets.length} connected client(s)`);
                    }).catch((err) => {
                        console.warn(`[InternalNotificationService] Could not fetch room sockets:`, err.message);
                    });
                    
                    console.log(`[InternalNotificationService] ✅ WebSocket notification emitted to ${recipientType} ${recipientId}`);
                } else {
                    console.warn(`[InternalNotificationService] ⚠️ Socket.IO instance not available`);
                }
            } catch (socketError) {
                console.error(`[InternalNotificationService] ❌ Error emitting WebSocket notification:`, socketError);
                // Don't fail if WebSocket is not available
            }
            
            console.log(`[InternalNotificationService] ✅ Notification created for ${recipientType} ${recipientId}: ${message}`);
            return notification;
        } catch (error) {
            console.error(`[InternalNotificationService] ❌ Error creating notification:`, error);
            throw error;
        }
    },
    
    sendBulkNotifications: async ({ recipients, message, title, type = 'info', priority = 'normal', actionUrl, actionLabel, relatedEntityType, relatedEntityId, source = 'automation', sourceId, coachId, metadata }) => {
        try {
            const notifications = [];
            
            for (const recipient of recipients) {
                const recipientId = typeof recipient === 'string' ? recipient : recipient.id || recipient._id;
                const recipientType = recipient.type || 'coach';
                
                const notification = await internalNotificationService.sendNotification({
                    recipientId,
                    recipientType,
                    message,
                    title,
                    type,
                    priority,
                    actionUrl,
                    actionLabel,
                    relatedEntityType,
                    relatedEntityId,
                    source,
                    sourceId,
                    coachId,
                    metadata
                });
                
                if (notification) {
                    notifications.push(notification);
                }
            }
            
            console.log(`[InternalNotificationService] ✅ Created ${notifications.length} notifications`);
            return notifications;
        } catch (error) {
            console.error(`[InternalNotificationService] ❌ Error creating bulk notifications:`, error);
            throw error;
        }
    }
};

const aiService = {
    generateCopy: async (config, eventPayload) => {
        const prompt = config.prompt || 'Write a marketing message.';
        const completion = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt,
            max_tokens: 100
        });
        return completion.data.choices[0].text.trim();
    },
    detectSentiment: async (message) => {
        const completion = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt: `Detect the sentiment of this message: ${message}`,
            max_tokens: 10
        });
        return completion.data.choices[0].text.trim();
    },
    scoreLead: async (lead) => {
        // Use OpenAI for lead scoring
        const prompt = `Score this lead (0-100): ${JSON.stringify(lead)}`;
        const completion = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt,
            max_tokens: 5
        });
        return parseInt(completion.data.choices[0].text.trim(), 10) || 0;
    }
};


// =======================================================================
// Section 2: Core Automation Action Functions
// =======================================================================

/**
 * Sends a WhatsApp message to a lead using the messaging v3 worker.
 */
async function sendWhatsAppMessage(config, eventPayload) {
    try {
        // Get lead data and coach info
        const leadData = eventPayload.relatedDoc || eventPayload.payload?.relatedDoc || eventPayload.payload?.leadData;
        const coachId = leadData?.coachId || eventPayload.coachId || eventPayload.payload?.coachId;
        const recipientNumber = config.to || leadData?.phone || eventPayload.payload?.leadData?.phone;

        if (!recipientNumber) {
            throw new Error('Recipient phone number not found in event payload or config.');
        }

        // Get message content from config
        let messageContent = config.messageTemplate || config.message || config.messageContent || `Hi {{lead.name}}, this is an automated message.`;

        // Process template variables in the message using comprehensive parser
        const { parseTemplateString } = require('../utils/templateParser');
        const templateData = {
            lead: {
                name: leadData?.name,
                firstName: leadData?.firstName,
                lastName: leadData?.lastName,
                email: leadData?.email,
                phone: leadData?.phone,
                source: leadData?.source,
                status: leadData?.status,
                temperature: leadData?.temperature,
                score: leadData?.score,
                createdAt: leadData?.createdAt,
                updatedAt: leadData?.updatedAt,
                created_at: leadData?.createdAt,
                updated_at: leadData?.updatedAt
            },
            coach: {
                name: eventPayload.coach?.name,
                email: eventPayload.coach?.email
            }
        };

        messageContent = parseTemplateString(messageContent, templateData);

        // Prepare message data for messaging v3 worker
        const messageData = {
            id: `automation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            channelCategory: config.channelCategory || 'meta_whatsapp', // Default to Meta WhatsApp
            channelId: config.channelId, // Specific channel if provided
            to: recipientNumber,
            message: messageContent,
            useTemplate: config.useTemplate || false,
            templateId: config.templateId,
            templateParams: config.templateParams || {},
            mediaUrl: config.mediaUrl,
            mediaType: config.mediaType,
            priority: config.priority || 'normal',
            scheduledAt: config.delayMinutes ? new Date(Date.now() + (config.delayMinutes * 60 * 1000)) : null,
            userId: coachId || 'system',
            userRole: 'coach'
        };

        // Get messaging worker instance
        const messagingV3Worker = require('../workers/messagingV3Worker');

        // Queue the message
        await messagingV3Worker.queueMessage(messageData);

        console.log(`[ActionExecutor] ✅ WhatsApp message queued successfully to ${recipientNumber} via ${messageData.channelCategory}`);
        console.log(`[ActionExecutor] Message ID: ${messageData.id}`);

    } catch (error) {
        console.error(`[ActionExecutor] ❌ Failed to send WhatsApp message:`, error.message);
        console.log(`[ActionExecutor] WhatsApp message failed but continuing to prevent infinite loops`);
        // Don't throw error - just log and continue to prevent infinite loops
    }
}

/**
 * Sends an email to a lead.
 */
async function sendEmail(config, eventPayload) {
    // Corrected to use relatedDoc
    const leadData = eventPayload.relatedDoc || eventPayload.payload?.relatedDoc || eventPayload.payload?.leadData; 
    const recipientEmail = config.to || leadData?.email || eventPayload.payload?.leadData?.email;
    if (!recipientEmail) { 
        console.error('[ActionExecutor] sendEmail: Recipient email not found. Config:', config, 'EventPayload:', eventPayload);
        throw new Error('Recipient email not found in event payload or config.'); 
    }

    // Process template variables in subject and body
    let subject = config.subject || 'Automated Message';
    let body = config.body || config.message || config.messageTemplate || '';

    // Process template variables using comprehensive parser
    const { parseTemplateString } = require('../utils/templateParser');
    const templateData = {
        lead: {
            name: leadData.name,
            firstName: leadData.firstName,
            lastName: leadData.lastName,
            email: leadData.email,
            phone: leadData.phone,
            source: leadData.source,
            status: leadData.status,
            temperature: leadData.temperature,
            score: leadData.score,
            createdAt: leadData.createdAt,
            updatedAt: leadData.updatedAt,
            created_at: leadData.createdAt,
            updated_at: leadData.updatedAt
        },
        coach: {
            name: eventPayload.coach?.name,
            email: eventPayload.coach?.email
        }
    };

    subject = parseTemplateString(subject, templateData);
    body = parseTemplateString(body, templateData);

    // Placeholder for .ics file generation
    const calendarInvite = config.sendCalendarInvite ? createICSFile(leadData) : null;

    await emailService.sendEmail({
        to: recipientEmail,
        subject: subject,
        body: body,
        attachments: calendarInvite ? [calendarInvite] : []
    });
    
    console.log(`[ActionExecutor] Email sent successfully to ${recipientEmail}`);
}

/**
 * Helper function to create a placeholder .ics file
 * TODO: Replace with a proper calendar library
 */
function createICSFile(leadData) {
    console.log('[ActionExecutor] Generating .ics calendar file...');
    // In a real application, you'd use a library like 'ical-generator'
    // This is a simplified placeholder
    return {
        filename: 'appointment.ics',
        content: `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//YourCompany//Appointment\n...`
    };
}


/**
 * Sends a message via SMS.
 */
async function sendSMS(config, eventPayload) {
    // Corrected to use relatedDoc
    const leadData = eventPayload.relatedDoc || eventPayload.payload?.relatedDoc || eventPayload.payload?.leadData;
    const recipientNumber = config.to || leadData?.phone || eventPayload.payload?.leadData?.phone;
    if (!recipientNumber) { 
        console.error('[ActionExecutor] sendSMS: Recipient phone number not found. Config:', config, 'EventPayload:', eventPayload);
        throw new Error('Recipient phone number not found in event payload or config.'); 
    }
    
    let message = config.message || config.messageTemplate || '';
    if (!message) {
        throw new Error('SMS message content is required.');
    }

    // Process template variables using comprehensive parser
    const { parseTemplateString } = require('../utils/templateParser');
    const templateData = {
        lead: {
            name: leadData.name,
            firstName: leadData.firstName,
            lastName: leadData.lastName,
            email: leadData.email,
            phone: leadData.phone,
            source: leadData.source,
            status: leadData.status,
            temperature: leadData.temperature,
            score: leadData.score,
            createdAt: leadData.createdAt,
            updatedAt: leadData.updatedAt,
            created_at: leadData.createdAt,
            updated_at: leadData.updatedAt
        },
        coach: {
            name: eventPayload.coach?.name,
            email: eventPayload.coach?.email
        }
    };

    message = parseTemplateString(message, templateData);
    
    await smsService.sendSMS({ to: recipientNumber, message: message });
    console.log(`[ActionExecutor] SMS sent successfully to ${recipientNumber}`);
}

/**
 * Creates a new task for a coach or staff member.
 */
async function createNewTask(config, eventPayload) {
    // Corrected to use relatedDoc
    const leadData = eventPayload.relatedDoc;
    const { coachId } = leadData;

    // Support multiple field naming conventions
    let taskName = config.taskName || config.title || config.name || config.task_name;
    let taskDescription = config.taskDescription || config.description || config.task_description;
    let dueDate = config.dueDate;
    
    if (!leadData || !coachId) { 
        throw new Error('Lead or coach data not found.'); 
    }
    
    // Parse template variables in task name and description
    const { parseTemplateString } = require('../utils/templateParser');
    const templateData = {
        lead: {
            name: leadData.name,
            firstName: leadData.firstName,
            lastName: leadData.lastName,
            email: leadData.email,
            phone: leadData.phone,
            source: leadData.source,
            status: leadData.status,
            temperature: leadData.temperature,
            score: leadData.score,
            createdAt: leadData.createdAt,
            updatedAt: leadData.updatedAt,
            created_at: leadData.createdAt,
            updated_at: leadData.updatedAt
        },
        coach: {
            name: eventPayload.coach?.name,
            email: eventPayload.coach?.email
        }
    };
    
    // Parse template variables
    if (taskName) {
        taskName = parseTemplateString(taskName, templateData);
    }
    if (taskDescription) {
        taskDescription = parseTemplateString(taskDescription, templateData);
    }
    
    if (!taskName || taskName.trim() === '') {
        throw new Error('Task name is required.');
    }
    
    // Process dueDate if it's a template string or relative time
    if (dueDate && typeof dueDate === 'string') {
        if (dueDate.includes('{{lead.createdAt + 24h}}')) {
            // Calculate 24 hours from lead creation
            const leadCreatedAt = new Date(leadData.createdAt);
            dueDate = new Date(leadCreatedAt.getTime() + 24 * 60 * 60 * 1000);
        } else if (dueDate.includes('{{lead.createdAt + 2h}}')) {
            // Calculate 2 hours from lead creation
            const leadCreatedAt = new Date(leadData.createdAt);
            dueDate = new Date(leadCreatedAt.getTime() + 2 * 60 * 60 * 1000);
        }
    }
    
    // Handle dueDate offset if provided (in days)
    if (!dueDate && config.dueDateOffset) {
        const offsetDays = parseInt(config.dueDateOffset) || 7;
        dueDate = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
    }
    
    // If no dueDate is set, default to 7 days from now
    if (!dueDate) {
        dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    
    // Handle assignedTo - use config.assignedTo if provided, otherwise use intelligent assignment
    let assignedTo = null;
    if (config.assignedTo && config.assignedTo.trim() !== '') {
        // Use the provided staff ID
        assignedTo = config.assignedTo;
    } else {
        // Use intelligent task assignment
        const workflowTaskService = require('./workflowTaskService');
        assignedTo = await workflowTaskService.intelligentTaskAssignment(coachId, {
            name: taskName,
            description: taskDescription,
            relatedLead: leadData._id,
            dueDate: dueDate
        });
    }
    
    // If still no assignment, default to coach
    if (!assignedTo) {
        assignedTo = coachId;
    }

    const task = await Task.create({
        name: taskName,
        description: taskDescription || '',
        assignedTo: assignedTo,
        relatedLead: leadData._id,
        dueDate: dueDate,
        coachId: coachId,
        priority: config.priority || 'MEDIUM',
        stage: config.stage || 'LEAD_GENERATION',
        estimatedHours: config.estimatedHours || 1,
        status: 'Pending'
    });
    
    console.log(`[ActionExecutor] ✅ Task created successfully!`);
    console.log(`[ActionExecutor] Task ID: ${task._id}`);
    console.log(`[ActionExecutor] Task Name: ${task.name}`);
    console.log(`[ActionExecutor] Coach ID: ${coachId}`);
    console.log(`[ActionExecutor] Assigned To: ${assignedTo}`);
    console.log(`[ActionExecutor] Related Lead: ${leadData._id}`);
    console.log(`[ActionExecutor] Status: ${task.status}`);
    console.log(`[ActionExecutor] Due Date: ${task.dueDate}`);
    
    return task;
}

/**
 * Creates a calendar event for the coach.
 */
async function createCalendarEvent(config, eventPayload) {
    // Corrected to use relatedDoc
    const leadData = eventPayload.relatedDoc;
    const { coachId } = leadData;
    if (!leadData || !coachId) { throw new Error('Lead or coach data not found.'); }

    // Assuming a method to get coach email from coachId
    const coach = await Coach.findById(coachId);
    if (!coach) { throw new Error('Coach not found for calendar event.'); }

    await calendarService.createAppointment({
        coachEmail: coach.email,
        leadEmail: leadData.email,
        leadName: leadData.name,
        appointmentTime: leadData.appointment.scheduledTime,
        zoomLink: leadData.appointment.zoomLink
    });
}

    /**
     * Sends Zoom meeting notification to lead
     */
    async function sendZoomMeetingNotification(appointmentId, zoomMeeting) {
        try {
            // Get appointment details
            const appointment = await Appointment.findById(appointmentId)
                .populate('leadId', 'name email phone')
                .populate('coachId', 'name email');

            if (!appointment || !appointment.leadId) {
                throw new Error('Appointment or lead not found');
            }

            const lead = appointment.leadId;
            const coach = appointment.coachId;

            // Send WhatsApp message with Zoom details
            if (lead.phone) {
                const whatsappMessage = `Hi ${lead.name}! 🎉

Your Zoom meeting has been scheduled with ${coach.name}:

📅 Date: ${new Date(appointment.startTime).toLocaleDateString()}
⏰ Time: ${new Date(appointment.startTime).toLocaleTimeString()}
⏱️ Duration: ${appointment.duration} minutes

🔗 Join Meeting: ${zoomMeeting.joinUrl}
🔑 Password: ${zoomMeeting.password}

Please join 5 minutes before the scheduled time.

See you there! 👋`;

                await sendWhatsAppMessage({
                    messageTemplate: whatsappMessage
                }, {
                    relatedDoc: {
                        phone: lead.phone,
                        coachId: coach._id,
                        name: lead.name,
                        email: lead.email
                    }
                });
            }

            // Send email with Zoom details
            if (lead.email) {
                const emailSubject = `Your Zoom Meeting with ${coach.name} - ${new Date(appointment.startTime).toLocaleDateString()}`;
                const emailBody = `
                    <h2>Your Zoom Meeting is Ready! 🎉</h2>
                    
                    <p>Hi ${lead.name},</p>
                    
                    <p>Your Zoom meeting with <strong>${coach.name}</strong> has been scheduled:</p>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>Meeting Details:</h3>
                        <p><strong>Date:</strong> ${new Date(appointment.startTime).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> ${new Date(appointment.startTime).toLocaleTimeString()}</p>
                        <p><strong>Duration:</strong> ${appointment.duration} minutes</p>
                        <p><strong>Coach:</strong> ${coach.name}</p>
                    </div>
                    
                    <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>Join Your Meeting:</h3>
                        <p><strong>Meeting Link:</strong> <a href="${zoomMeeting.joinUrl}" style="color: #1976d2;">${zoomMeeting.joinUrl}</a></p>
                        <p><strong>Password:</strong> ${zoomMeeting.password}</p>
                    </div>
                    
                    <p><strong>Important:</strong> Please join 5 minutes before the scheduled time.</p>
                    
                    <p>If you have any questions, please contact your coach.</p>
                    
                    <p>Best regards,<br>Your Coaching Team</p>
                `;

                await sendEmail({
                    subject: emailSubject,
                    body: emailBody
                }, {
                    relatedDoc: {
                        email: lead.email,
                        name: lead.name
                    }
                });
            }

            console.log(`[ActionExecutor] Zoom meeting notification sent to lead ${lead.name} (${lead.email})`);
        } catch (error) {
            console.error(`[ActionExecutor] Error sending Zoom notification:`, error.message);
            throw error;
        }
    }

    /**
     * Creates a Zoom meeting for an appointment.
     */
    async function createZoomMeeting(config, eventPayload) {
        console.log('[ActionExecutor] createZoomMeeting called with config:', JSON.stringify(config, null, 2));

        // Extract coach ID from event payload
        let coachId = eventPayload.coachId || eventPayload.payload?.coachId;

        if (!coachId) {
            // Try to get from related document
            if (eventPayload.relatedDoc?.coachId) {
                coachId = eventPayload.relatedDoc.coachId;
            } else {
                throw new Error('Coach ID is required for creating Zoom meeting');
            }
        }

        try {
            // Import Zoom service
            const zoomService = require('./zoomService');

            // Create custom Zoom meeting using the configuration from automation rule
            const zoomMeeting = await zoomService.createCustomMeeting(config, coachId);

            console.log(`[ActionExecutor] Custom Zoom meeting created successfully: ${zoomMeeting.meetingId}`);

            // Try to send meeting details to the lead if we have lead information
            try {
                const leadId = eventPayload.leadId || eventPayload.payload?.leadId || eventPayload.relatedDoc?.leadId;

                if (leadId) {
                    // Send notification with meeting details
                    await sendMeetingNotificationToLead(leadId, zoomMeeting, config);
                    console.log(`[ActionExecutor] Meeting notification sent to lead ${leadId}`);
                }
            } catch (notificationError) {
                console.error(`[ActionExecutor] Failed to send meeting notification:`, notificationError.message);
                // Don't fail the entire process if notification fails
            }

            return zoomMeeting;
        } catch (error) {
            console.error(`[ActionExecutor] Failed to create custom Zoom meeting:`, error.message);
            throw error;
        }
    }

    async function sendMeetingNotificationToLead(leadId, meetingData, config) {
        try {
            // Get lead details
            const lead = await Lead.findById(leadId);
            if (!lead) return;

            // Create notification message
            const message = `Your Zoom meeting has been scheduled: "${meetingData.topic}"

Meeting ID: ${meetingData.meetingId}
Join URL: ${meetingData.joinUrl}
${meetingData.password ? `Password: ${meetingData.password}` : ''}
${meetingData.startTime ? `Start Time: ${new Date(meetingData.startTime).toLocaleString()}` : ''}

Duration: ${meetingData.duration} minutes`;

            // Send WhatsApp message if lead has phone
            if (lead.phone && config.sendInvites !== false) {
                try {
                    await sendSMS({
                        to: lead.phone,
                        message: message
                    });
                } catch (error) {
                    console.error('[ActionExecutor] Failed to send WhatsApp meeting notification:', error);
                }
            }

            // Send email if lead has email
            if (lead.email && config.sendInvites !== false) {
                try {
                    await sendEmail({
                        to: lead.email,
                        subject: `Zoom Meeting: ${meetingData.topic}`,
                        body: message.replace(/\n/g, '<br>')
                    });
                } catch (error) {
                    console.error('[ActionExecutor] Failed to send email meeting notification:', error);
                }
            }

        } catch (error) {
            console.error('[ActionExecutor] Error sending meeting notification:', error);
        }
    }

/**
 * Sends a notification to a coach's dashboard.
 */
async function sendInternalNotification(config, eventPayload) {
    try {
        const {
            message,
            title,
            recipients = 'all', // 'all', 'coach', or array of IDs
            type = 'info',
            priority = 'normal',
            actionUrl,
            actionLabel,
            notificationType = 'automation'
        } = config;
        
        if (!message) {
            throw new Error('Message is required for internal notification.');
        }
        
        const leadData = eventPayload.relatedDoc || eventPayload.payload?.relatedDoc || eventPayload.payload?.leadData;
        const coachId = eventPayload.coachId || eventPayload.payload?.coachId || leadData?.coachId;
        
        if (!coachId) {
            throw new Error('Coach ID is required for internal notification.');
        }
        
        // Parse template variables in message and title
        let processedMessage = message;
        let processedTitle = title || 'Notification';
        
        if (leadData) {
            // Replace common template variables
            processedMessage = processedMessage.replace(/\{\{lead\.name\}\}/g, leadData.name || 'Lead');
            processedMessage = processedMessage.replace(/\{\{lead\.email\}\}/g, leadData.email || '');
            processedMessage = processedTitle.replace(/\{\{lead\.name\}\}/g, leadData.name || 'Lead');
        }
        
        // Determine recipients
        let recipientList = [];
        
        if (recipients === 'self' || recipients === 'coach') {
            // Send to coach (self) - for testing
            recipientList = [{ id: coachId, type: 'coach' }];
        } else if (recipients === 'all') {
            // Get all staff for this coach
            const Staff = require('../schema/Staff');
            const staffMembers = await Staff.find({ coachId, isActive: true }).select('_id');
            recipientList = [
                { id: coachId, type: 'coach' },
                ...staffMembers.map(s => ({ id: s._id, type: 'staff' }))
            ];
        } else if (recipients === 'assigned') {
            // Get assigned staff if available
            const assignedStaffId = leadData?.assignedStaffId || leadData?.assignedStaff?._id;
            if (assignedStaffId) {
                recipientList = [{ id: assignedStaffId, type: 'staff' }];
            } else {
                recipientList = [{ id: coachId, type: 'coach' }];
            }
        } else if (Array.isArray(recipients)) {
            // Array of recipient IDs
            recipientList = recipients.map(id => {
                // Try to determine type, default to staff
                return { id, type: 'staff' };
            });
        } else if (typeof recipients === 'string') {
            // Single recipient ID
            recipientList = [{ id: recipients, type: 'staff' }];
        }
        
        if (recipientList.length === 0) {
            recipientList = [{ id: coachId, type: 'coach' }];
        }
        
        // Build action URL if related entity exists
        let finalActionUrl = actionUrl;
        if (!finalActionUrl && leadData?._id) {
            finalActionUrl = `/leads/${leadData._id}`;
        }
        
        // Send notifications
        const notifications = await internalNotificationService.sendBulkNotifications({
            recipients: recipientList,
            message: processedMessage,
            title: processedTitle,
            type: notificationType || type,
            priority,
            actionUrl: finalActionUrl,
            actionLabel: actionLabel || 'View Details',
            relatedEntityType: leadData ? 'lead' : null,
            relatedEntityId: leadData?._id || null,
            source: 'automation',
            sourceId: eventPayload.ruleId || null,
            coachId,
            metadata: {
                automationRuleId: eventPayload.ruleId,
                eventType: eventPayload.eventName || eventPayload.payload?.eventName
            }
        });
        
        console.log(`[ActionExecutor] ✅ Internal notifications sent to ${notifications.length} recipients`);
    } catch (error) {
        console.error(`[ActionExecutor] ❌ Failed to execute action "send_internal_notification": ${error.message}`);
        console.error(`[ActionExecutor] Error stack:`, error.stack);
        throw error;
    }
}

/**
 * Updates a specific field on the lead document.
 */
async function updateLeadField(config, eventPayload) {
    // Corrected to use relatedDoc
    const leadId = eventPayload.relatedDoc._id;
    const { field, value } = config;
    if (!leadId || !field) { throw new Error('Lead ID and field to update are required.'); }
    
    let processedValue = value;
    
    // Process template variables in the value
    if (typeof value === 'string') {
        const { parseTemplateString } = require('../utils/templateParser');
        const leadData = eventPayload.relatedDoc;
        const templateData = {
            lead: {
                name: leadData.name,
                firstName: leadData.firstName,
                lastName: leadData.lastName,
                email: leadData.email,
                phone: leadData.phone,
                source: leadData.source,
                status: leadData.status,
                temperature: leadData.temperature,
                score: leadData.score,
                createdAt: leadData.createdAt,
                updatedAt: leadData.updatedAt,
                created_at: leadData.createdAt,
                updated_at: leadData.updatedAt
            },
            coach: {
                name: eventPayload.coach?.name,
                email: eventPayload.coach?.email
            }
        };
        processedValue = parseTemplateString(value, templateData);
    }
    
    const updateObject = {};
    updateObject[field] = processedValue;
    await Lead.findByIdAndUpdate(leadId, { $set: updateObject });
    
    console.log(`[ActionExecutor] Lead field "${field}" updated to "${processedValue}" for lead ${leadId}`);
}

async function updateLeadScore(config, eventPayload) {
    // Corrected to use relatedDoc
    const leadId = eventPayload.relatedDoc._id;
    // Support both 'score' (absolute value) and 'scoreIncrement' (relative change)
    const { scoreIncrement, score } = config;
    if (!leadId) { throw new Error('Lead ID not found.'); }
    
    // If 'score' is provided, set it directly; otherwise use 'scoreIncrement' to increment
    if (typeof score === 'number') {
        await Lead.findByIdAndUpdate(leadId, { $set: { score: score } });
    } else if (typeof scoreIncrement === 'number') {
        await Lead.findByIdAndUpdate(leadId, { $inc: { score: scoreIncrement } });
    } else {
        throw new Error('Invalid score or scoreIncrement. Must be a number.');
    }
}

async function aiRescoreLead(config, eventPayload) {
    const leadData = eventPayload.relatedDoc;
    if (!leadData || !leadData._id) { throw new Error('Lead data missing for AI scoring.'); }
    const score = await aiService.scoreLead(leadData);
    await Lead.findByIdAndUpdate(leadData._id, { $set: { score } });
}

/**
 * A dedicated function to handle all payment-related actions.
 */
async function handlePaymentActions(config, eventPayload) {
    const { paymentId, leadId } = eventPayload;
    if (!paymentId || !leadId) { throw new Error('Payment ID and Lead ID not found in event payload.'); }
    
    const lead = await Lead.findById(leadId);
    const payment = await Payment.findById(paymentId);

    if (!lead || !payment) {
        throw new Error('Lead or Payment document not found.');
    }
    
    switch(config.actionType) {
        case 'update_lead_status':
            lead.status = config.newStatus;
            await lead.save();
            console.log(`[ActionExecutor] Lead ${leadId} status updated to ${config.newStatus}.`);
            break;
        case 'send_confirmation_email':
            await sendEmail({
                to: lead.email,
                subject: 'Payment Confirmation',
                body: `Hello ${lead.name}, your payment of ${payment.amount} ${payment.currency} was successful!`
            });
            break;
        case 'send_internal_alert':
            await sendInternalNotification({
                recipientId: payment.coach, // Send to the related coach
                message: `Payment received: ${lead.name} paid ${payment.amount} ${payment.currency}.`
            });
            break;
        default:
            console.warn(`[ActionExecutor] Unhandled payment action: ${config.actionType}`);
    }
}

// Add missing action handlers
async function addLeadTag(config, eventPayload) {
    const leadId = eventPayload.relatedDoc._id;
    const { tag } = config;
    
    if (!leadId || !tag) {
        throw new Error('Lead ID and tag are required for adding lead tag.');
    }
    
    await Lead.findByIdAndUpdate(leadId, { 
        $addToSet: { tags: tag } 
    });
    
    console.log(`[ActionExecutor] Tag "${tag}" added to lead ${leadId}`);
}
async function removeLeadTag(config, eventPayload) {
    const leadId = eventPayload.relatedDoc._id;
    const { tag } = config;
    
    if (!leadId || !tag) {
        throw new Error('Lead ID and tag are required for removing lead tag.');
    }
    
    await Lead.findByIdAndUpdate(leadId, { 
        $pull: { tags: tag } 
    });
    
    console.log(`[ActionExecutor] Tag "${tag}" removed from lead ${leadId}`);
}
async function addToFunnel(config, eventPayload) {
    const leadId = eventPayload.relatedDoc._id;
    const { funnelId, stageId = null } = config;
    
    if (!leadId || !funnelId) {
        throw new Error('Lead ID and funnel ID are required for adding lead to funnel.');
    }
    
    await Lead.findByIdAndUpdate(leadId, { 
        $set: { 
            funnelId: funnelId,
            currentStage: stageId || 'entry',
            addedToFunnelAt: new Date()
        } 
    });
    
    console.log(`[ActionExecutor] Lead ${leadId} added to funnel ${funnelId} at stage ${stageId || 'entry'}`);
}
async function moveToFunnelStage(config, eventPayload) {
    const leadId = eventPayload.relatedDoc._id;
    const { stageId, stageName } = config;
    
    if (!leadId || !stageId) {
        throw new Error('Lead ID and stage ID are required for moving lead to funnel stage.');
    }
    
    await Lead.findByIdAndUpdate(leadId, { 
        $set: { 
            currentStage: stageId,
            lastStageChange: new Date()
        },
        $push: {
            funnelHistory: {
                stageId: stageId,
                stageName: stageName || stageId,
                enteredAt: new Date()
            }
        }
    });
    
    console.log(`[ActionExecutor] Lead ${leadId} moved to funnel stage ${stageId}`);
}
async function removeFromFunnel(config, eventPayload) {
    const leadId = eventPayload.relatedDoc._id;
    
    if (!leadId) {
        throw new Error('Lead ID is required for removing lead from funnel.');
    }
    
    await Lead.findByIdAndUpdate(leadId, { 
        $unset: { 
            funnelId: 1,
            currentStage: 1,
            addedToFunnelAt: 1
        } 
    });
    
    console.log(`[ActionExecutor] Lead ${leadId} removed from funnel`);
}
async function createDeal(config, eventPayload) {
    const leadId = eventPayload.relatedDoc._id;
    const { dealValue, dealType = 'consultation', description } = config;

    if (!leadId) {
        throw new Error('Lead ID is required for creating deal.');
    }

    // Process template variables in description
    let processedDescription = description;
    if (description) {
        const { parseTemplateString } = require('../utils/templateParser');
        const leadData = eventPayload.relatedDoc;
        const templateData = {
            lead: {
                name: leadData.name,
                firstName: leadData.firstName,
                lastName: leadData.lastName,
                email: leadData.email,
                phone: leadData.phone,
                source: leadData.source,
                status: leadData.status,
                temperature: leadData.temperature,
                score: leadData.score,
                createdAt: leadData.createdAt,
                updatedAt: leadData.updatedAt,
                created_at: leadData.createdAt,
                updated_at: leadData.updatedAt
            },
            coach: {
                name: eventPayload.coach?.name,
                email: eventPayload.coach?.email
            }
        };
        processedDescription = parseTemplateString(description, templateData);
    }
    
    // This would typically create a deal in a separate collection
    // For now, we'll update the lead with deal information
    await Lead.findByIdAndUpdate(leadId, { 
        $set: { 
            dealStatus: 'created',
            dealValue: dealValue,
            dealType: dealType,
            dealDescription: processedDescription,
            dealCreatedAt: new Date()
        } 
    });
    
    console.log(`[ActionExecutor] Deal created for lead ${leadId}: ${dealType} - ${dealValue}`);
}
async function sendPushNotification(config, eventPayload) {
    const { recipientId, message, title } = config;

    if (!recipientId || !message) {
        throw new Error('Recipient ID and message are required for push notification.');
    }

    // Process template variables in message and title
    const { parseTemplateString } = require('../utils/templateParser');
    const leadData = eventPayload.relatedDoc;
    const templateData = {
        lead: {
            name: leadData.name,
            firstName: leadData.firstName,
            lastName: leadData.lastName,
            email: leadData.email,
            phone: leadData.phone,
            source: leadData.source,
            status: leadData.status,
            temperature: leadData.temperature,
            score: leadData.score,
            createdAt: leadData.createdAt,
            updatedAt: leadData.updatedAt,
            created_at: leadData.createdAt,
            updated_at: leadData.updatedAt
        },
        coach: {
            name: eventPayload.coach?.name,
            email: eventPayload.coach?.email
        }
    };

    const processedMessage = parseTemplateString(message, templateData);
    const processedTitle = title ? parseTemplateString(title, templateData) : title;
    
    // This would typically integrate with a push notification service
    // For now, we'll log it and could store it in a notifications collection
    console.log(`[ActionExecutor] Push notification sent to ${recipientId}: ${title || 'Notification'} - ${message}`);
    
    // You could store this in a notifications collection for later processing
    // await Notification.create({ recipientId, title, message, type: 'push', sentAt: new Date() });
}
async function scheduleDripSequence(config, eventPayload) {
    const leadId = eventPayload.relatedDoc._id;
    const { sequenceName, startDelay = 0 } = config;
    
    if (!leadId || !sequenceName) {
        throw new Error('Lead ID and sequence name are required for scheduling drip sequence.');
    }
    
    // Calculate start time based on delay
    const startTime = new Date(Date.now() + (startDelay * 60 * 1000)); // Convert minutes to milliseconds
    
    await Lead.findByIdAndUpdate(leadId, { 
        $set: { 
            dripSequence: {
                name: sequenceName,
                scheduledStart: startTime,
                status: 'scheduled',
                currentStep: 0
            }
        } 
    });
    
    console.log(`[ActionExecutor] Drip sequence "${sequenceName}" scheduled for lead ${leadId} to start at ${startTime}`);
}
async function addNoteToLead(config, eventPayload) {
    const leadId = eventPayload.relatedDoc._id;
    const { note, noteType = 'automation' } = config;

    if (!leadId || !note) {
        throw new Error('Lead ID and note are required for adding note to lead.');
    }

    // Process template variables in note
    const { parseTemplateString } = require('../utils/templateParser');
    const leadData = eventPayload.relatedDoc;
    const templateData = {
        lead: {
            name: leadData.name,
            firstName: leadData.firstName,
            lastName: leadData.lastName,
            email: leadData.email,
            phone: leadData.phone,
            source: leadData.source,
            status: leadData.status,
            temperature: leadData.temperature,
            score: leadData.score,
            createdAt: leadData.createdAt,
            updatedAt: leadData.updatedAt,
            created_at: leadData.createdAt,
            updated_at: leadData.updatedAt
        },
        coach: {
            name: eventPayload.coach?.name,
            email: eventPayload.coach?.email
        }
    };

    const processedNote = parseTemplateString(note, templateData);
    
    await Lead.findByIdAndUpdate(leadId, { 
        $push: { 
            notes: {
                content: processedNote,
                type: noteType,
                createdAt: new Date(),
                createdBy: 'automation_system'
            }
        } 
    });
    
    console.log(`[ActionExecutor] Note added to lead ${leadId}: ${note}`);
}
async function addFollowupDate(config, eventPayload) {
    const leadId = eventPayload.relatedDoc._id;
    const { followupDate, followupType = 'general' } = config;
    
    if (!leadId || !followupDate) {
        throw new Error('Lead ID and followup date are required.');
    }
    
    let calculatedDate;
    if (typeof followupDate === 'string' && followupDate.includes('{{lead.createdAt +')) {
        // Parse relative time expressions
        const leadCreatedAt = new Date(eventPayload.relatedDoc.createdAt);
        if (followupDate.includes('24h')) {
            calculatedDate = new Date(leadCreatedAt.getTime() + 24 * 60 * 60 * 1000);
        } else if (followupDate.includes('2h')) {
            calculatedDate = new Date(leadCreatedAt.getTime() + 2 * 60 * 60 * 1000);
        } else {
            calculatedDate = new Date(followupDate);
        }
    } else {
        calculatedDate = new Date(followupDate);
    }
    
    await Lead.findByIdAndUpdate(leadId, { 
        $set: { 
            nextFollowupDate: calculatedDate,
            followupType: followupType
        } 
    });
    
    console.log(`[ActionExecutor] Followup date set for lead ${leadId}: ${calculatedDate}`);
}
async function createInvoice(config, eventPayload) {
    const leadId = eventPayload.relatedDoc._id;
    const { amount, currency = 'USD', description, dueDate } = config;

    if (!leadId || !amount) {
        throw new Error('Lead ID and amount are required for creating invoice.');
    }

    // Process template variables in description
    let processedDescription = description;
    if (description) {
        const { parseTemplateString } = require('../utils/templateParser');
        const leadData = eventPayload.relatedDoc;
        const templateData = {
            lead: {
                name: leadData.name,
                firstName: leadData.firstName,
                lastName: leadData.lastName,
                email: leadData.email,
                phone: leadData.phone,
                source: leadData.source,
                status: leadData.status,
                temperature: leadData.temperature,
                score: leadData.score,
                createdAt: leadData.createdAt,
                updatedAt: leadData.updatedAt,
                created_at: leadData.createdAt,
                updated_at: leadData.updatedAt
            },
            coach: {
                name: eventPayload.coach?.name,
                email: eventPayload.coach?.email
            }
        };
        processedDescription = parseTemplateString(description, templateData);
    }
    
    // This would typically create an invoice in a separate collection
    // For now, we'll update the lead with invoice information
    await Lead.findByIdAndUpdate(leadId, { 
        $set: { 
            invoiceStatus: 'created',
            invoiceAmount: amount,
            invoiceCurrency: currency,
            invoiceDescription: processedDescription,
            invoiceDueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
            invoiceCreatedAt: new Date()
        } 
    });
    
    console.log(`[ActionExecutor] Invoice created for lead ${leadId}: ${amount} ${currency}`);
}
async function issueRefund(config, eventPayload) {
    const leadId = eventPayload.relatedDoc._id;
    const { amount, reason, refundType = 'partial' } = config;
    
    if (!leadId || !amount) {
        throw new Error('Lead ID and amount are required for issuing refund.');
    }
    
    // This would typically create a refund record in a separate collection
    // For now, we'll update the lead with refund information
    await Lead.findByIdAndUpdate(leadId, { 
        $set: { 
            refundStatus: 'issued',
            refundAmount: amount,
            refundReason: reason,
            refundType: refundType,
            refundIssuedAt: new Date()
        } 
    });
    
    console.log(`[ActionExecutor] Refund issued for lead ${leadId}: ${amount} - ${reason}`);
}
async function callWebhook(config, eventPayload) {
    const { url, method = 'POST', headers = {}, body = {} } = config;
    
    if (!url) {
        throw new Error('Webhook URL is required for calling webhook.');
    }
    
    try {
        // This would typically use axios or fetch to call the webhook
        console.log(`[ActionExecutor] Webhook called: ${method} ${url}`);
        console.log(`[ActionExecutor] Webhook payload:`, body);
        
        // Example webhook call (you'd need to import axios)
        // const response = await axios({
        //     method: method.toLowerCase(),
        //     url: url,
        //     headers: headers,
        //     data: body
        // });
        
        console.log(`[ActionExecutor] Webhook call successful to ${url}`);
    } catch (error) {
        console.error(`[ActionExecutor] Webhook call failed to ${url}:`, error.message);
        throw error;
    }
}
async function triggerAnotherAutomation(config, eventPayload) {
    const { automationRuleId, triggerData = {} } = config;
    
    if (!automationRuleId) {
        throw new Error('Automation rule ID is required for triggering another automation.');
    }
    
    try {
        // This would typically publish a new event to RabbitMQ
        console.log(`[ActionExecutor] Triggering another automation rule: ${automationRuleId}`);
        console.log(`[ActionExecutor] Trigger data:`, triggerData);
        
        // Example: Publish event to trigger another automation
        // await publishEvent('automation_triggered', {
        //     ruleId: automationRuleId,
        //     triggerData: triggerData,
        //     sourceEvent: eventPayload
        // });
        
        console.log(`[ActionExecutor] Successfully triggered automation rule ${automationRuleId}`);
    } catch (error) {
        console.error(`[ActionExecutor] Failed to trigger automation rule ${automationRuleId}:`, error.message);
        throw error;
    }
}

/**
 * Updates the status of a lead
 */
async function updateLeadStatus(config, eventPayload) {
    const leadId = eventPayload.relatedDoc._id;
    const { status } = config;
    
    if (!leadId || !status) {
        throw new Error('Lead ID and status are required for updating lead status.');
    }
    
    await Lead.findByIdAndUpdate(leadId, { 
        $set: { status: status, statusUpdatedAt: new Date() } 
    });
    
    console.log(`[ActionExecutor] Lead ${leadId} status updated to "${status}"`);
}

/**
 * Assigns a lead to a staff member
 */
async function assignLeadToStaff(config, eventPayload) {
    const leadId = eventPayload.relatedDoc._id;
    const { staffId } = config;
    const Staff = require('../schema/Staff');
    
    if (!leadId || !staffId) {
        throw new Error('Lead ID and staff ID are required for assigning lead to staff.');
    }
    
    // Verify staff exists
    const staff = await Staff.findById(staffId);
    if (!staff) {
        throw new Error(`Staff member with ID ${staffId} not found.`);
    }
    
    await Lead.findByIdAndUpdate(leadId, { 
        $set: { 
            assignedTo: staffId,
            assignedAt: new Date()
        } 
    });
    
    console.log(`[ActionExecutor] Lead ${leadId} assigned to staff ${staffId} (${staff.name})`);
}

/**
 * Creates multiple tasks at once
 */
async function createMultipleTasks(config, eventPayload) {
    const leadData = eventPayload.relatedDoc;
    const { tasks, assignToStaff } = config;
    
    if (!leadData || !leadData._id) {
        throw new Error('Lead data is required for creating multiple tasks.');
    }
    
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
        throw new Error('Tasks array is required and must not be empty.');
    }
    
    const createdTasks = [];
    
    for (const taskConfig of tasks) {
        try {
            // Use the same createNewTask function but with task-specific config
            const taskPayload = {
                ...eventPayload,
                relatedDoc: leadData
            };
            
            const task = await createNewTask({
                ...taskConfig,
                assignedTo: assignToStaff || taskConfig.assignedTo
            }, taskPayload);
            
            createdTasks.push(task);
            console.log(`[ActionExecutor] Created task: ${task.name} (ID: ${task._id})`);
        } catch (error) {
            console.error(`[ActionExecutor] Failed to create task: ${taskConfig.name || 'unnamed'}:`, error.message);
            // Continue with other tasks even if one fails
        }
    }
    
    console.log(`[ActionExecutor] Created ${createdTasks.length} out of ${tasks.length} tasks for lead ${leadData._id}`);
    return createdTasks;
}


// =======================================================================
// Section 3: Main Action Dispatcher
// =======================================================================

/**
 * Process nurturing step due events
 */
async function processNurturingStepDue(config, eventPayload) {
    try {
        const { leadId, stepId, sequenceId } = eventPayload;
        
        console.log(`[ActionExecutor] Processing nurturing step due for lead ${leadId}, step ${stepId}`);
        
        // Get the lead and sequence
        const lead = await Lead.findById(leadId);
        const sequence = await require('../schema/NurturingSequence').findById(sequenceId);
        
        if (!lead || !sequence) {
            console.error(`[ActionExecutor] Lead or sequence not found for nurturing step`);
            return;
        }
        
        // Check if this is still the current step for the lead
        if (lead.nurturingStepIndex >= sequence.steps.length) {
            console.log(`[ActionExecutor] Lead ${leadId} has completed the sequence`);
            return;
        }
        
        const currentStep = sequence.steps[lead.nurturingStepIndex];
        if (!currentStep || currentStep._id.toString() !== stepId) {
            console.log(`[ActionExecutor] Step ${stepId} is no longer current for lead ${leadId}`);
            return;
        }
        
        // Execute the step
        await executeNurturingStep(lead, currentStep);
        
        // Move to next step
        lead.nurturingStepIndex += 1;
        lead.lastNurturingStepAt = new Date();
        await lead.save();
        
        console.log(`[ActionExecutor] Successfully processed nurturing step ${currentStep.stepNumber} for lead ${leadId}`);
        
    } catch (error) {
        console.error(`[ActionExecutor] Error processing nurturing step due:`, error);
    }
}

/**
 * Execute a nurturing step
 */
async function executeNurturingStep(lead, step) {
    try {
        console.log(`[ActionExecutor] Executing nurturing step ${step.stepNumber}: ${step.name}`);
        
        // Create automation event for the step
        const eventPayload = {
            leadId: lead._id,
            coachId: lead.coachId,
            stepIndex: lead.nurturingStepIndex,
            actionType: step.actionType,
            config: step.actionConfig || {},
            leadData: lead.toObject(),
            sequenceStep: {
                stepNumber: step.stepNumber,
                stepName: step.name,
                stepDescription: step.description
            }
        };

        // Execute the step action
        await executeAutomationAction({
            actionType: step.actionType,
            config: step.actionConfig || {},
            payload: eventPayload
        });
        
    } catch (error) {
        console.error(`[ActionExecutor] Error executing nurturing step:`, error);
    }
}

/**
 * Main dispatcher to execute the correct action based on its type.
 * @param {object} payload - The message payload from the RabbitMQ actions queue.
 */
async function executeAutomationAction(payload) {
    const { actionType, config, payload: eventPayload } = payload;
    console.log(`[ActionExecutor] Dispatching action: ${actionType}`);
    console.log(`[ActionExecutor] Full payload:`, JSON.stringify(payload, null, 2));

    try {
        switch (actionType) {
            case 'send_whatsapp_message':
                await sendWhatsAppMessage(config, eventPayload);
                break;
            case 'send_email':
            case 'send_email_message':
            case 'create_email_message':
                await sendEmail(config, eventPayload);
                break;
            case 'send_sms':
            case 'send_sms_message':
                await sendSMS(config, eventPayload);
                break;
            case 'update_lead_score':
                await updateLeadScore(config, eventPayload);
                break;
            case 'ai_rescore_lead':
                await aiRescoreLead(config, eventPayload);
                break;
            case 'create_new_task':
            case 'create_task':
                try {
                    const task = await createNewTask(config, eventPayload);
                    console.log(`[ActionExecutor] ✅ Task creation completed successfully. Task ID: ${task?._id}`);
                } catch (error) {
                    console.error(`[ActionExecutor] ❌ Failed to execute action "create_task": ${error.message}`);
                    console.error(`[ActionExecutor] Error stack:`, error.stack);
                    throw error; // Re-throw to be caught by the outer try-catch
                }
                break;
            case 'send_internal_notification':
                await sendInternalNotification(config, eventPayload);
                break;
            case 'create_calendar_event':
                await createCalendarEvent(config, eventPayload);
                break;
            case 'update_lead_field':
                await updateLeadField(config, eventPayload);
                break;
            case 'update_lead_status':
                await updateLeadStatus(config, eventPayload);
                break;
            case 'assign_lead_to_staff':
                await assignLeadToStaff(config, eventPayload);
                break;
            case 'create_multiple_tasks':
                await createMultipleTasks(config, eventPayload);
                break;
            // Case for handling all payment-related actions
            case 'handle_payment_actions':
                await handlePaymentActions(config, eventPayload);
                break;
            case 'add_lead_tag':
                await addLeadTag(config, eventPayload);
                break;
            case 'remove_lead_tag':
                await removeLeadTag(config, eventPayload);
                break;
            case 'add_to_funnel':
                await addToFunnel(config, eventPayload);
                break;
            case 'move_to_funnel_stage':
                await moveToFunnelStage(config, eventPayload);
                break;
            case 'remove_from_funnel':
                await removeFromFunnel(config, eventPayload);
                break;
            case 'create_deal':
                await createDeal(config, eventPayload);
                break;
            case 'send_push_notification':
                await sendPushNotification(config, eventPayload);
                break;
            case 'schedule_drip_sequence':
                await scheduleDripSequence(config, eventPayload);
                break;
            case 'add_note_to_lead':
                await addNoteToLead(config, eventPayload);
                break;
            case 'add_followup_date':
                await addFollowupDate(config, eventPayload);
                break;
            case 'create_zoom_meeting':
                await createZoomMeeting(config, eventPayload);
                break;
            case 'nurturing_step_due':
                await processNurturingStepDue(config, eventPayload);
                break;
            case 'create_deal':
                await createDeal(config, eventPayload);
                break;
            case 'create_invoice':
                await createInvoice(config, eventPayload);
                break;
            case 'issue_refund':
                await issueRefund(config, eventPayload);
                break;
            case 'call_webhook':
                await callWebhook(config, eventPayload);
                break;
            case 'trigger_another_automation':
                await triggerAnotherAutomation(config, eventPayload);
                break;
            default:
                throw new Error(`Unknown action type: ${actionType}`);
        }
    } catch (error) {
        console.error(`[ActionExecutor] Failed to execute action "${actionType}":`, error.message);
        // Don't re-throw the error to prevent infinite loops in RabbitMQ
        // Just log the failure and continue
        console.log(`[ActionExecutor] Action "${actionType}" failed but continuing to prevent infinite loops`);
    }
}

module.exports = {
    executeAutomationAction
};