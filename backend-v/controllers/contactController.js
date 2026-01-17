const asyncHandler = require('../middleware/async');
const Lead = require('../schema/Lead');
const WhatsAppMessage = require('../schema/WhatsAppMessage');

// @desc    Get coach's contacts (leads only)
// @route   GET /api/messaging/contacts
// @access  Private (Coach)
exports.getCoachContacts = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CONTACT] getCoachContacts - Starting...');
        
        const coachId = req.user.id;
        const { page = 1, limit = 50, search, status } = req.query;
        
        // Build query
        const query = { coachId: coachId };
        
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Get leads with pagination
        const leads = await Lead.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('name email phone status leadTemperature source createdAt');
        
        const total = await Lead.countDocuments(query);
        
        // Get message counts for each lead
        const contactsWithMessageCount = await Promise.all(
            leads.map(async (lead) => {
                const messageCount = await WhatsAppMessage.countDocuments({
                    $or: [
                        { leadId: lead._id },
                        { recipientPhone: lead.phone }
                    ]
                });
                
                return {
                    ...lead.toObject(),
                    messageCount
                };
            })
        );
        
        console.log('✅ [CONTACT] getCoachContacts - Success');
        res.status(200).json({
            success: true,
            data: {
                contacts: contactsWithMessageCount,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total,
                    limit: parseInt(limit)
                }
            }
        });
        
    } catch (error) {
        console.error('❌ [CONTACT] getCoachContacts - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get contacts',
            error: error.message
        });
    }
});

// @desc    Search contacts by name, phone, or email
// @route   GET /api/messaging/contacts/search
// @access  Private (Coach)
exports.searchContacts = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CONTACT] searchContacts - Starting...');
        
        const coachId = req.user.id;
        const { q, limit = 20 } = req.query;
        
        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters long'
            });
        }
        
        // Build search query
        const query = {
            coachId: coachId,
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } },
                { phone: { $regex: q, $options: 'i' } }
            ]
        };
        
        // Search leads
        const leads = await Lead.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .select('name email phone status leadTemperature source createdAt');
        
        console.log('✅ [CONTACT] searchContacts - Success');
        res.status(200).json({
            success: true,
            data: {
                contacts: leads,
                total: leads.length,
                query: q
            }
        });
        
    } catch (error) {
        console.error('❌ [CONTACT] searchContacts - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search contacts',
            error: error.message
        });
    }
});

// @desc    Get all contacts across all coaches
// @route   GET /api/messaging/admin/contacts
// @access  Private (Admin)
exports.getAllContacts = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CONTACT] getAllContacts - Starting...');
        
        const { page = 1, limit = 50, search, status, coachId } = req.query;
        
        // Build query
        const query = {};
        
        if (coachId) query.coachId = coachId;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Get leads with pagination
        const leads = await Lead.find(query)
            .populate('coachId', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('name email phone status leadTemperature source coachId createdAt');
        
        const total = await Lead.countDocuments(query);
        
        // Get message counts for each lead
        const contactsWithMessageCount = await Promise.all(
            leads.map(async (lead) => {
                const messageCount = await WhatsAppMessage.countDocuments({
                    $or: [
                        { leadId: lead._id },
                        { recipientPhone: lead.phone }
                    ]
                });
                
                return {
                    ...lead.toObject(),
                    messageCount
                };
            })
        );
        
        console.log('✅ [CONTACT] getAllContacts - Success');
        res.status(200).json({
            success: true,
            data: {
                contacts: contactsWithMessageCount,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total,
                    limit: parseInt(limit)
                }
            }
        });
        
    } catch (error) {
        console.error('❌ [CONTACT] getAllContacts - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get all contacts',
            error: error.message
        });
    }
});

// @desc    Search all contacts by name, phone, or email
// @route   GET /api/messaging/admin/contacts/search
// @access  Private (Admin)
exports.searchAllContacts = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CONTACT] searchAllContacts - Starting...');
        
        const { q, limit = 20, coachId } = req.query;
        
        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters long'
            });
        }
        
        // Build search query
        const query = {
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } },
                { phone: { $regex: q, $options: 'i' } }
            ]
        };
        
        if (coachId) query.coachId = coachId;
        
        // Search leads
        const leads = await Lead.find(query)
            .populate('coachId', 'name email')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .select('name email phone status leadTemperature source coachId createdAt');
        
        console.log('✅ [CONTACT] searchAllContacts - Success');
        res.status(200).json({
            success: true,
            data: {
                contacts: leads,
                total: leads.length,
                query: q
            }
        });
        
    } catch (error) {
        console.error('❌ [CONTACT] searchAllContacts - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search all contacts',
            error: error.message
        });
    }
});

module.exports = exports;
