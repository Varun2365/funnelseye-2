const asyncHandler = require('../middleware/async');
const WhatsAppMessage = require('../schema/WhatsAppMessage');
const Lead = require('../schema/Lead');

// @desc    Get inbox messages for coach
// @route   GET /api/messaging/inbox
// @access  Private (Coach)
exports.getInboxMessages = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [INBOX] getInboxMessages - Starting...');
        
        const coachId = req.user.id;
        const { page = 1, limit = 50, unreadOnly = false } = req.query;
        
        // Build query for messages where coach is either sender or recipient
        const query = {
            $or: [
                { senderId: coachId },
                { recipientPhone: { $in: await getCoachContactPhones(coachId) } }
            ]
        };
        
        if (unreadOnly === 'true') {
            query.isRead = false;
        }
        
        // Get messages with pagination
        const messages = await WhatsAppMessage.find(query)
            .sort({ sentAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('leadId', 'name email phone')
            .select('senderId senderType recipientPhone content sentAt status deliveryStatus isRead');
        
        const total = await WhatsAppMessage.countDocuments(query);
        
        // Group messages by conversation
        const conversations = groupMessagesByConversation(messages, coachId);
        
        console.log('✅ [INBOX] getInboxMessages - Success');
        res.status(200).json({
            success: true,
            data: {
                conversations,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total,
                    limit: parseInt(limit)
                }
            }
        });
        
    } catch (error) {
        console.error('❌ [INBOX] getInboxMessages - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get inbox messages',
            error: error.message
        });
    }
});

// @desc    Get conversation with specific contact
// @route   GET /api/messaging/inbox/conversation/:contactId
// @access  Private (Coach)
exports.getConversation = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [INBOX] getConversation - Starting...');
        
        const coachId = req.user.id;
        const { contactId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        
        // Get contact details
        const contact = await Lead.findById(contactId);
        if (!contact || contact.coachId.toString() !== coachId.toString()) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }
        
        // Get conversation messages
        const conversationId = WhatsAppMessage.createConversationId(coachId, contact.phone);
        const messages = await WhatsAppMessage.find({ conversationId })
            .sort({ sentAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('leadId', 'name email phone')
            .select('senderId senderType content sentAt status deliveryStatus isRead');
        
        const total = await WhatsAppMessage.countDocuments({ conversationId });
        
        // Mark messages as read
        await WhatsAppMessage.updateMany(
            { conversationId, senderId: { $ne: coachId }, isRead: false },
            { isRead: true, readAt: new Date() }
        );
        
        console.log('✅ [INBOX] getConversation - Success');
        res.status(200).json({
            success: true,
            data: {
                contact: {
                    id: contact._id,
                    name: contact.name,
                    email: contact.email,
                    phone: contact.phone
                },
                messages: messages.reverse(), // Show oldest first
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total,
                    limit: parseInt(limit)
                }
            }
        });
        
    } catch (error) {
        console.error('❌ [INBOX] getConversation - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get conversation',
            error: error.message
        });
    }
});

// @desc    Send message from inbox
// @route   POST /api/messaging/inbox/send
// @access  Private (Coach)
exports.sendInboxMessage = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [INBOX] sendInboxMessage - Starting...');
        
        const coachId = req.user.id;
        const { 
            contactId, 
            message, 
            templateId, 
            templateParameters = {},
            type = 'text',
            mediaUrl,
            caption
        } = req.body;
        
        // Get contact details
        const contact = await Lead.findById(contactId);
        if (!contact || contact.coachId.toString() !== coachId.toString()) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }
        
        // Validate required fields
        if (!message && type === 'text') {
            return res.status(400).json({
                success: false,
                message: 'Message content is required'
            });
        }
        
        // Import messaging controller to reuse send logic
        const messagingController = require('./messagingController');
        
        // Create a mock request object for the messaging controller
        const mockReq = {
            user: { id: coachId },
            body: {
                to: contact.phone,
                message,
                templateId,
                templateParameters,
                type,
                mediaUrl,
                caption,
                leadId: contactId
            }
        };
        
        // Create a mock response object
        let responseData = null;
        let responseStatus = 200;
        const mockRes = {
            status: (code) => {
                responseStatus = code;
                return mockRes;
            },
            json: (data) => {
                responseData = data;
                return mockRes;
            }
        };
        
        // Call the messaging controller
        await messagingController.sendMessage(mockReq, mockRes);
        
        if (responseStatus !== 200) {
            return res.status(responseStatus).json(responseData);
        }
        
        console.log('✅ [INBOX] sendInboxMessage - Success');
        res.status(200).json({
            success: true,
            message: 'Message sent successfully',
            data: responseData.data
        });
        
    } catch (error) {
        console.error('❌ [INBOX] sendInboxMessage - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message
        });
    }
});

// @desc    Mark message as read
// @route   PUT /api/messaging/inbox/messages/:messageId/read
// @access  Private (Coach)
exports.markAsRead = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [INBOX] markAsRead - Starting...');
        
        const coachId = req.user.id;
        const { messageId } = req.params;
        
        // Find message
        const message = await WhatsAppMessage.findById(messageId);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }
        
        // Check if coach has access to this message
        const hasAccess = await checkMessageAccess(message, coachId);
        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        
        // Mark as read
        message.isRead = true;
        message.readAt = new Date();
        await message.save();
        
        console.log('✅ [INBOX] markAsRead - Success');
        res.status(200).json({
            success: true,
            message: 'Message marked as read'
        });
        
    } catch (error) {
        console.error('❌ [INBOX] markAsRead - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark message as read',
            error: error.message
        });
    }
});

// @desc    Get all inbox messages across coaches
// @route   GET /api/messaging/admin/inbox
// @access  Private (Admin)
exports.getAllInboxMessages = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [INBOX] getAllInboxMessages - Starting...');
        
        const { page = 1, limit = 50, unreadOnly = false, coachId } = req.query;
        
        // Build query
        const query = {};
        
        if (coachId) {
            query.$or = [
                { senderId: coachId },
                { recipientPhone: { $in: await getCoachContactPhones(coachId) } }
            ];
        }
        
        if (unreadOnly === 'true') {
            query.isRead = false;
        }
        
        // Get messages with pagination
        const messages = await WhatsAppMessage.find(query)
            .sort({ sentAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('senderId', 'name email')
            .populate('leadId', 'name email phone')
            .select('senderId senderType recipientPhone content sentAt status deliveryStatus isRead');
        
        const total = await WhatsAppMessage.countDocuments(query);
        
        // Group messages by conversation
        const conversations = groupMessagesByConversation(messages, null, true);
        
        console.log('✅ [INBOX] getAllInboxMessages - Success');
        res.status(200).json({
            success: true,
            data: {
                conversations,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total,
                    limit: parseInt(limit)
                }
            }
        });
        
    } catch (error) {
        console.error('❌ [INBOX] getAllInboxMessages - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get all inbox messages',
            error: error.message
        });
    }
});

// @desc    Get conversation with specific contact (admin view)
// @route   GET /api/messaging/admin/inbox/conversation/:contactId
// @access  Private (Admin)
exports.getAdminConversation = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [INBOX] getAdminConversation - Starting...');
        
        const { contactId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        
        // Get contact details
        const contact = await Lead.findById(contactId).populate('coachId', 'name email');
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }
        
        // Get conversation messages
        const conversationId = WhatsAppMessage.createConversationId(contact.coachId._id, contact.phone);
        const messages = await WhatsAppMessage.find({ conversationId })
            .sort({ sentAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('senderId', 'name email')
            .populate('leadId', 'name email phone')
            .select('senderId senderType content sentAt status deliveryStatus isRead');
        
        const total = await WhatsAppMessage.countDocuments({ conversationId });
        
        console.log('✅ [INBOX] getAdminConversation - Success');
        res.status(200).json({
            success: true,
            data: {
                contact: {
                    id: contact._id,
                    name: contact.name,
                    email: contact.email,
                    phone: contact.phone,
                    coach: {
                        id: contact.coachId._id,
                        name: contact.coachId.name,
                        email: contact.coachId.email
                    }
                },
                messages: messages.reverse(), // Show oldest first
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total,
                    limit: parseInt(limit)
                }
            }
        });
        
    } catch (error) {
        console.error('❌ [INBOX] getAdminConversation - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get admin conversation',
            error: error.message
        });
    }
});

// Helper function to get coach's contact phones
async function getCoachContactPhones(coachId) {
    const leads = await Lead.find({ coachId }).select('phone');
    return leads.map(lead => lead.phone).filter(phone => phone);
}

// Helper function to group messages by conversation
async function groupMessagesByConversation(messages, coachId, isAdmin = false) {
    const conversations = {};
    const phoneNumbers = new Set();

    // Collect all unique phone numbers to look up contacts
    messages.forEach(message => {
        if (message.recipientPhone) phoneNumbers.add(message.recipientPhone);
    });

    // Look up contacts/leads for these phone numbers
    const phoneArray = Array.from(phoneNumbers);
    let contacts = [];
    if (phoneArray.length > 0) {
        const query = isAdmin ?
            { phone: { $in: phoneArray } } :
            { coachId, phone: { $in: phoneArray } };

        contacts = await Lead.find(query).select('name phone email').lean();
    }

    // Create a phone-to-contact map
    const contactMap = {};
    contacts.forEach(contact => {
        if (contact.phone) {
            contactMap[contact.phone] = contact;
        }
    });

    messages.forEach(message => {
        const contactPhone = message.recipientPhone;
        const conversationKey = contactPhone;

        if (!conversations[conversationKey]) {
            const contact = contactMap[contactPhone];
            conversations[conversationKey] = {
                contactPhone,
                participantPhone: contactPhone, // Add for frontend compatibility
                participantName: contact?.name || null, // Add for frontend compatibility
                name: contact?.name || null, // Alternative field
                contact: contact || null,
                lastMessage: message,
                lastMessageAt: message.sentAt,
                lastMessageContent: message.content,
                unreadCount: 0,
                totalMessages: 0
            };
        }

        conversations[conversationKey].totalMessages++;

        if (!message.isRead && message.senderId.toString() !== coachId?.toString()) {
            conversations[conversationKey].unreadCount++;
        }

        if (message.sentAt > conversations[conversationKey].lastMessage.sentAt) {
            conversations[conversationKey].lastMessage = message;
            conversations[conversationKey].lastMessageAt = message.sentAt;
            conversations[conversationKey].lastMessageContent = message.content;
        }
    });

    return Object.values(conversations).sort((a, b) =>
        new Date(b.lastMessage.sentAt) - new Date(a.lastMessage.sentAt)
    );
}

// Helper function to check if coach has access to message
async function checkMessageAccess(message, coachId) {
    // Check if coach is the sender
    if (message.senderId.toString() === coachId.toString()) {
        return true;
    }
    
    // Check if message is to one of coach's contacts
    const lead = await Lead.findOne({ 
        coachId: coachId, 
        phone: message.recipientPhone 
    });
    
    return !!lead;
}

module.exports = exports;
