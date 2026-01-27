const asyncHandler = require('../middleware/async');
const whatsappAIAutoReplyService = require('../services/whatsappAIAutoReplyService');
const WhatsAppInbox = require('../schema/WhatsAppInbox');
const Lead = require('../schema/Lead');

// @desc    Handle WhatsApp webhook from Meta
// @route   POST /api/whatsapp/v1/webhook
// @access  Public (Meta webhook)
const handleWebhook = asyncHandler(async (req, res) => {
    try {
        console.log('📱 [WEBHOOK] Received WhatsApp webhook:', JSON.stringify(req.body, null, 2));

        const { body } = req;

        // Verify webhook (if verification token is set)
        if (req.query['hub.verify_token'] === process.env.WHATSAPP_VERIFY_TOKEN) {
            console.log('📱 [WEBHOOK] Verification successful');
            return res.status(200).send(req.query['hub.challenge']);
        }

        // Process incoming messages
        if (body.object === 'whatsapp_business_account') {
            for (const entry of body.entry) {
                for (const change of entry.changes) {
                    if (change.field === 'messages') {
                        await processMessageChange(change.value);
                    }
                }
            }
        }

        res.status(200).json({ success: true });

    } catch (error) {
        console.error('📱 [WEBHOOK] Error processing webhook:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// @desc    Process message change from webhook
// @param {Object} value - Change value from webhook
const processMessageChange = async (value) => {
    try {
        console.log('📱 [WEBHOOK] Processing message change:', JSON.stringify(value, null, 2));

        const { messages, contacts, metadata } = value;

        if (!messages || messages.length === 0) {
            console.log('📱 [WEBHOOK] No messages found in webhook');
            return;
        }

        for (const message of messages) {
            await processIncomingMessage(message, contacts, metadata);
        }

    } catch (error) {
        console.error('📱 [WEBHOOK] Error processing message change:', error);
    }
};

// @desc    Process individual incoming message
// @param {Object} message - Message object from webhook
// @param {Array} contacts - Contacts array from webhook
// @param {Object} metadata - Metadata from webhook
const processIncomingMessage = async (message, contacts, metadata) => {
    try {
        console.log('📱 [WEBHOOK] Processing incoming message:', message.id);

        // Extract message data
        const messageData = extractMessageData(message, contacts, metadata);
        if (!messageData) {
            console.log('📱 [WEBHOOK] Could not extract message data');
            return;
        }

        // Check if message already exists
        const existingMessage = await WhatsAppInbox.findOne({ wamid: message.id });
        if (existingMessage) {
            console.log('📱 [WEBHOOK] Message already processed:', message.id);
            return;
        }

        // Try to find associated lead
        const lead = await findAssociatedLead(messageData.senderPhone);
        if (lead) {
            messageData.leadId = lead._id;
            messageData.coachId = lead.coachId;
            messageData.userId = lead.coachId;
            messageData.userType = 'coach';
        } else {
            // Default to admin if no lead found
            messageData.userId = null; // Will be set based on business logic
            messageData.userType = 'admin';
        }

        // Create inbox record
        const inboxRecord = new WhatsAppInbox({
            messageId: `inbound_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            wamid: message.id,
            senderPhone: messageData.senderPhone,
            senderName: messageData.senderName,
            recipientPhone: messageData.recipientPhone,
            conversationId: messageData.conversationId,
            messageType: messageData.messageType,
            content: messageData.content,
            direction: 'inbound',
            status: 'delivered',
            sentAt: messageData.sentAt,
            userId: messageData.userId,
            userType: messageData.userType,
            leadId: messageData.leadId,
            coachId: messageData.coachId,
            threadId: messageData.conversationId,
            category: 'inbound'
        });

        await inboxRecord.save();

        // Process for AI auto-reply
        const aiResponse = await whatsappAIAutoReplyService.processIncomingMessage(messageData);
        
        if (aiResponse && aiResponse.isAutoReply) {
            console.log('🤖 [WEBHOOK] Sending AI auto-reply');
            await whatsappAIAutoReplyService.sendAIReply(messageData, aiResponse);
        }

        // Handle automation reply if lead exists
        if (messageData.leadId) {
            try {
                const automationGraphTrigger = require('../services/automationGraphTrigger');
                await automationGraphTrigger.handleReplyReceived(messageData.leadId, {
                    text: messageData.content?.text || messageData.content,
                    body: messageData.content?.text || messageData.content,
                    channel: 'whatsapp',
                    from: messageData.senderPhone,
                    timestamp: messageData.sentAt || new Date()
                });
            } catch (error) {
                console.error('📱 [WEBHOOK] Error handling automation reply:', error);
            }
        }

        console.log('📱 [WEBHOOK] Message processed successfully:', message.id);

    } catch (error) {
        console.error('📱 [WEBHOOK] Error processing incoming message:', error);
    }
};

// @desc    Extract message data from webhook
// @param {Object} message - Message object
// @param {Array} contacts - Contacts array
// @param {Object} metadata - Metadata object
// @returns {Object|null} - Extracted message data
const extractMessageData = (message, contacts, metadata) => {
    try {
        // Get contact info
        const contact = contacts?.find(c => c.wa_id === message.from);
        const senderName = contact?.profile?.name || 'Unknown';

        // Extract message content based on type
        let content = {};
        let messageType = 'text';

        if (message.text) {
            content.text = message.text.body;
            messageType = 'text';
        } else if (message.image) {
            content.mediaUrl = message.image.id;
            content.mediaType = 'image';
            content.caption = message.image.caption;
            messageType = 'image';
        } else if (message.video) {
            content.mediaUrl = message.video.id;
            content.mediaType = 'video';
            content.caption = message.video.caption;
            messageType = 'video';
        } else if (message.audio) {
            content.mediaUrl = message.audio.id;
            content.mediaType = 'audio';
            messageType = 'audio';
        } else if (message.document) {
            content.mediaUrl = message.document.id;
            content.mediaType = 'document';
            content.fileName = message.document.filename;
            content.caption = message.document.caption;
            messageType = 'document';
        } else if (message.location) {
            content.location = {
                latitude: message.location.latitude,
                longitude: message.location.longitude,
                name: message.location.name,
                address: message.location.address
            };
            messageType = 'location';
        } else if (message.contacts) {
            content.contact = {
                name: message.contacts[0]?.name?.formatted_name,
                phone: message.contacts[0]?.phones?.[0]?.phone
            };
            messageType = 'contact';
        }

        return {
            messageId: message.id,
            wamid: message.id,
            senderPhone: message.from,
            senderName: senderName,
            recipientPhone: metadata.phone_number_id,
            conversationId: message.from,
            messageType: messageType,
            content: content,
            direction: 'inbound',
            sentAt: new Date(parseInt(message.timestamp) * 1000),
            threadId: message.from
        };

    } catch (error) {
        console.error('📱 [WEBHOOK] Error extracting message data:', error);
        return null;
    }
};

// @desc    Find associated lead by phone number
// @param {String} phoneNumber - Phone number
// @returns {Object|null} - Lead object or null
const findAssociatedLead = async (phoneNumber) => {
    try {
        // Clean phone number (remove +, spaces, etc.)
        const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
        
        // Search for lead by phone number
        const lead = await Lead.findOne({
            $or: [
                { phone: cleanPhone },
                { phone: phoneNumber },
                { 'clientQuestions.whatsappNumber': cleanPhone },
                { 'clientQuestions.whatsappNumber': phoneNumber },
                { 'coachQuestions.whatsappNumber': cleanPhone },
                { 'coachQuestions.whatsappNumber': phoneNumber }
            ]
        });

        return lead;

    } catch (error) {
        console.error('📱 [WEBHOOK] Error finding associated lead:', error);
        return null;
    }
};

// @desc    Get webhook status
// @route   GET /api/whatsapp/v1/webhook/status
// @access  Private (Admin)
const getWebhookStatus = asyncHandler(async (req, res) => {
    try {
        const recentMessages = await WhatsAppInbox.find({
            direction: 'inbound',
            sentAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        })
        .sort({ sentAt: -1 })
        .limit(10);

        const aiReplies = await WhatsAppInbox.find({
            aiProcessed: true,
            sentAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        })
        .sort({ sentAt: -1 })
        .limit(10);

        res.status(200).json({
            success: true,
            data: {
                webhookActive: true,
                recentMessages: recentMessages.length,
                recentAIReplies: aiReplies.length,
                lastMessage: recentMessages[0]?.sentAt,
                lastAIReply: aiReplies[0]?.sentAt
            }
        });

    } catch (error) {
        console.error('Error getting webhook status:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving webhook status'
        });
    }
});

module.exports = {
    handleWebhook,
    getWebhookStatus
};
