const asyncHandler = require('../middleware/async');
const WhatsAppAIKnowledge = require('../schema/WhatsAppAIKnowledge');

// @desc    Create AI Knowledge Base
// @route   POST /api/whatsapp/v1/ai-knowledge
// @access  Private (Admin)
const createAIKnowledge = asyncHandler(async (req, res) => {
    try {
        const {
            title,
            description,
            businessInfo,
            systemPrompt,
            responseSettings,
            businessHours,
            autoReplyRules
        } = req.body;

        if (!title || !systemPrompt) {
            return res.status(400).json({
                success: false,
                message: 'Title and system prompt are required'
            });
        }

        const knowledgeBase = new WhatsAppAIKnowledge({
            title,
            description,
            businessInfo: businessInfo || {},
            systemPrompt,
            responseSettings: responseSettings || {
                maxLength: 150,
                tone: 'friendly',
                includeEmojis: true,
                autoReplyEnabled: true
            },
            businessHours: businessHours || {
                enabled: true,
                timezone: 'Asia/Kolkata',
                schedule: [],
                afterHoursMessage: "Thank you for your message! We're currently outside business hours. We'll get back to you soon."
            },
            autoReplyRules: autoReplyRules || [],
            createdBy: req.admin.id
        });

        await knowledgeBase.save();

        res.status(201).json({
            success: true,
            message: 'AI Knowledge Base created successfully',
            data: knowledgeBase
        });

    } catch (error) {
        console.error('Error creating AI knowledge base:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating AI knowledge base'
        });
    }
});

// @desc    Get all AI Knowledge Bases
// @route   GET /api/whatsapp/v1/ai-knowledge
// @access  Private (Admin)
const getAIKnowledgeBases = asyncHandler(async (req, res) => {
    try {
        const { isActive, isDefault } = req.query;
        
        const query = {};
        if (isActive !== undefined) query.isActive = isActive === 'true';
        if (isDefault !== undefined) query.isDefault = isDefault === 'true';

        const knowledgeBases = await WhatsAppAIKnowledge.find(query)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: knowledgeBases
        });

    } catch (error) {
        console.error('Error getting AI knowledge bases:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving AI knowledge bases'
        });
    }
});

// @desc    Get single AI Knowledge Base
// @route   GET /api/whatsapp/v1/ai-knowledge/:id
// @access  Private (Admin)
const getAIKnowledgeBase = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const knowledgeBase = await WhatsAppAIKnowledge.findById(id)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');

        if (!knowledgeBase) {
            return res.status(404).json({
                success: false,
                message: 'AI Knowledge Base not found'
            });
        }

        res.status(200).json({
            success: true,
            data: knowledgeBase
        });

    } catch (error) {
        console.error('Error getting AI knowledge base:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving AI knowledge base'
        });
    }
});

// @desc    Update AI Knowledge Base
// @route   PUT /api/whatsapp/v1/ai-knowledge/:id
// @access  Private (Admin)
const updateAIKnowledgeBase = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updatedBy: req.admin.id
        };

        const knowledgeBase = await WhatsAppAIKnowledge.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!knowledgeBase) {
            return res.status(404).json({
                success: false,
                message: 'AI Knowledge Base not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'AI Knowledge Base updated successfully',
            data: knowledgeBase
        });

    } catch (error) {
        console.error('Error updating AI knowledge base:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating AI knowledge base'
        });
    }
});

// @desc    Delete AI Knowledge Base
// @route   DELETE /api/whatsapp/v1/ai-knowledge/:id
// @access  Private (Admin)
const deleteAIKnowledgeBase = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const knowledgeBase = await WhatsAppAIKnowledge.findById(id);
        if (!knowledgeBase) {
            return res.status(404).json({
                success: false,
                message: 'AI Knowledge Base not found'
            });
        }

        if (knowledgeBase.isDefault) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete default knowledge base'
            });
        }

        await WhatsAppAIKnowledge.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'AI Knowledge Base deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting AI knowledge base:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting AI knowledge base'
        });
    }
});

// @desc    Set default AI Knowledge Base
// @route   PUT /api/whatsapp/v1/ai-knowledge/:id/set-default
// @access  Private (Admin)
const setDefaultAIKnowledgeBase = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const knowledgeBase = await WhatsAppAIKnowledge.findById(id);
        if (!knowledgeBase) {
            return res.status(404).json({
                success: false,
                message: 'AI Knowledge Base not found'
            });
        }

        // Set all others to non-default
        await WhatsAppAIKnowledge.updateMany(
            { _id: { $ne: id } },
            { isDefault: false }
        );

        // Set this one as default
        knowledgeBase.isDefault = true;
        knowledgeBase.updatedBy = req.admin.id;
        await knowledgeBase.save();

        res.status(200).json({
            success: true,
            message: 'Default AI Knowledge Base updated successfully',
            data: knowledgeBase
        });

    } catch (error) {
        console.error('Error setting default AI knowledge base:', error);
        res.status(500).json({
            success: false,
            message: 'Error setting default AI knowledge base'
        });
    }
});

// @desc    Test AI Knowledge Base
// @route   POST /api/whatsapp/v1/ai-knowledge/:id/test
// @access  Private (Admin)
const testAIKnowledgeBase = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { testMessage } = req.body;

        if (!testMessage) {
            return res.status(400).json({
                success: false,
                message: 'Test message is required'
            });
        }

        const knowledgeBase = await WhatsAppAIKnowledge.findById(id);
        if (!knowledgeBase) {
            return res.status(404).json({
                success: false,
                message: 'AI Knowledge Base not found'
            });
        }

        // Use the AI service to test the knowledge base
        const aiService = require('../services/aiService');
        const whatsappAIService = require('../services/whatsappAIAutoReplyService');

        // Create mock message data
        const mockMessageData = {
            messageId: `test_${Date.now()}`,
            senderPhone: '+1234567890',
            senderName: 'Test User',
            recipientPhone: '+0987654321',
            conversationId: 'test_conversation',
            messageType: 'text',
            content: { text: testMessage },
            direction: 'inbound',
            sentAt: new Date(),
            userId: req.admin.id,
            userType: 'admin',
            threadId: 'test_thread'
        };

        // Process the test message
        const aiResponse = await whatsappAIService.processIncomingMessage(mockMessageData);

        res.status(200).json({
            success: true,
            message: 'AI Knowledge Base test completed',
            data: {
                testMessage,
                aiResponse,
                knowledgeBase: {
                    id: knowledgeBase._id,
                    title: knowledgeBase.title,
                    systemPrompt: knowledgeBase.systemPrompt,
                    responseSettings: knowledgeBase.responseSettings
                }
            }
        });

    } catch (error) {
        console.error('Error testing AI knowledge base:', error);
        res.status(500).json({
            success: false,
            message: 'Error testing AI knowledge base',
            error: error.message
        });
    }
});

// @desc    Get AI Knowledge Base statistics
// @route   GET /api/whatsapp/v1/ai-knowledge/:id/stats
// @access  Private (Admin)
const getAIKnowledgeStats = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const knowledgeBase = await WhatsAppAIKnowledge.findById(id);
        if (!knowledgeBase) {
            return res.status(404).json({
                success: false,
                message: 'AI Knowledge Base not found'
            });
        }

        // Get additional stats from WhatsAppInbox
        const WhatsAppInbox = require('../schema/WhatsAppInbox');
        
        const stats = await WhatsAppInbox.aggregate([
            {
                $match: {
                    'aiReply.messageId': { $exists: true },
                    'aiReply.processedAt': { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
                }
            },
            {
                $group: {
                    _id: null,
                    totalAIReplies: { $sum: 1 },
                    avgConfidence: { $avg: '$aiReply.confidence' },
                    successfulReplies: {
                        $sum: {
                            $cond: [{ $ne: ['$aiReply.response', null] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                knowledgeBase: {
                    id: knowledgeBase._id,
                    title: knowledgeBase.title,
                    stats: knowledgeBase.stats
                },
                recentStats: stats[0] || {
                    totalAIReplies: 0,
                    avgConfidence: 0,
                    successfulReplies: 0
                }
            }
        });

    } catch (error) {
        console.error('Error getting AI knowledge stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving AI knowledge statistics'
        });
    }
});

module.exports = {
    createAIKnowledge,
    getAIKnowledgeBases,
    getAIKnowledgeBase,
    updateAIKnowledgeBase,
    deleteAIKnowledgeBase,
    setDefaultAIKnowledgeBase,
    testAIKnowledgeBase,
    getAIKnowledgeStats
};
