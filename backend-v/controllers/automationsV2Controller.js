// Automations V2 Controller
const AutomationRule = require('../schema/AutomationRule');
const AutomationRunV2 = require('../schema/AutomationRunV2');
const FlowControl = require('../schema/flowControl');
const advancedAutomationProcessorV2 = require('../services/AdvancedAutomationProcessorV2');
const advancedMessageQueue = require('../services/advancedMessageQueueService');
const aiAutomationService = require('../services/aiAutomationService');

// Get all automation rules for coach (V2)
const getSequences = async (req, res) => {
  try {
    const sequences = await AutomationRule.find({
      coachId: req.user.id
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: sequences,
      version: 'v2'
    });
  } catch (error) {
    console.error('Error fetching automation rules (V2):', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch automation rules',
      version: 'v2'
    });
  }
};

// Create new automation rule (V2)
const createSequence = async (req, res) => {
  try {
    const {
      name,
      nodes = [],
      edges = [],
      viewport = { x: 0, y: 0, zoom: 1 }
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Automation name is required',
        version: 'v2'
      });
    }

    // Validate automation structure
    if (!nodes || nodes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Automation must have at least one node',
        version: 'v2'
      });
    }

    // Find trigger node and extract trigger event
    const triggerNode = nodes.find(node => node.type === 'trigger');
    if (!triggerNode) {
      return res.status(400).json({
        success: false,
        message: 'Automation must have at least one trigger node',
        version: 'v2'
      });
    }

    // Validate and format nodes to ensure required fields
    const validatedNodes = nodes.map(node => ({
      id: node.id,
      type: node.type,
      nodeType: node.nodeType || node.type, // Use nodeType or fallback to type
      label: node.data?.label || node.label || `${node.type.charAt(0).toUpperCase() + node.type.slice(1)} Node`,
      position: {
        x: typeof node.position?.x === 'number' ? node.position.x : 100,
        y: typeof node.position?.y === 'number' ? node.position.y : 100
      },
      data: node.data || {},
      config: node.config || {}
    }));

    // Extract trigger event from trigger node data
    const triggerEvent = triggerNode.data?.triggerEvent || triggerNode.nodeType || 'lead_created';

    const automationData = {
      name,
      coachId: req.coachId || req.userId,
      createdBy: req.userId,
      triggerEvent,
      workflowType: 'graph',
      nodes: validatedNodes,
      edges: edges || [],
      viewport: viewport || { x: 0, y: 0, zoom: 1 },
      isActive: true
    };

    const automation = new AutomationRule(automationData);
    await automation.save();

    res.json({
      success: true,
      data: automation,
      version: 'v2'
    });
  } catch (error) {
    console.error('Error creating automation rule (V2):', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create automation rule',
      error: error.message,
      version: 'v2'
    });
  }
};

// Get single automation rule by ID (V2)
const getSequenceById = async (req, res) => {
  try {
    const { id } = req.params;

    const sequence = await AutomationRule.findOne({
      _id: id,
      coachId: req.user.id
    });

    if (!sequence) {
      return res.status(404).json({
        success: false,
        message: 'Automation rule not found',
        version: 'v2'
      });
    }

    res.json({
      success: true,
      data: sequence,
      version: 'v2'
    });
  } catch (error) {
    console.error('Error fetching automation rule (V2):', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch automation rule',
      version: 'v2'
    });
  }
};

// Update automation rule (V2)
const updateSequence = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const sequence = await AutomationRule.findOneAndUpdate(
      { _id: id, coachId: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!sequence) {
      return res.status(404).json({
        success: false,
        message: 'Automation rule not found',
        version: 'v2'
      });
    }

    res.json({
      success: true,
      data: sequence,
      version: 'v2'
    });
  } catch (error) {
    console.error('Error updating automation rule (V2):', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update automation rule',
      error: error.message,
      version: 'v2'
    });
  }
};

// Delete automation rule (V2)
const deleteSequence = async (req, res) => {
  try {
    const { id } = req.params;

    const sequence = await AutomationRule.findOneAndDelete({
      _id: id,
      coachId: req.user.id
    });

    if (!sequence) {
      return res.status(404).json({
        success: false,
        message: 'Automation rule not found',
        version: 'v2'
      });
    }

    res.json({
      success: true,
      message: 'Automation rule deleted successfully',
      version: 'v2'
    });
  } catch (error) {
    console.error('Error deleting automation rule (V2):', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete automation rule',
      version: 'v2'
    });
  }
};

// Get flow controls (V2)
const getFlows = async (req, res) => {
  try {
    const flows = await FlowControl.find({
      coachId: req.user.id
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: flows,
      version: 'v2'
    });
  } catch (error) {
    console.error('Error fetching flows (V2):', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch flow controls',
      version: 'v2'
    });
  }
};

// Start automation run (V2)
const startAutomation = async (req, res) => {
  try {
    const { sequenceId, leadId, triggerData, funnelId } = req.body;

    // Get lead data if leadId provided
    let leadData = null;
    if (leadId) {
      const Lead = require('../schema/Lead');
      leadData = await Lead.findById(leadId);
    }

    const triggerContext = {
      leadId,
      funnelId,
      leadData,
      triggerData,
      event: triggerData?.event || 'manual_trigger',
      startedBy: req.user.id
    };

    const run = await advancedAutomationProcessorV2.startAutomation(
      sequenceId,
      triggerContext,
      req.user.id
    );

    res.json({
      success: true,
      data: run,
      version: 'v2'
    });
  } catch (error) {
    console.error('Error starting automation (V2):', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start automation',
      version: 'v2'
    });
  }
};

// Get automation runs (V2)
const getRuns = async (req, res) => {
  try {
    const { status, sequenceId } = req.query;
    const filter = { coachId: req.user.id };

    if (status) filter.status = status;
    if (sequenceId) filter.automationRuleId = sequenceId;

    const runs = await AutomationRunV2.find(filter)
      .populate('automationRuleId', 'name')
      .populate('leadId', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: runs,
      version: 'v2'
    });
  } catch (error) {
    console.error('Error fetching runs (V2):', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch automation runs',
      version: 'v2'
    });
  }
};

// Get automation analytics (V2) - Enhanced version
const getAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    const analytics = await AutomationRunV2.aggregate([
      {
        $match: {
          coachId: req.user.id,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRuns: { $sum: 1 },
          completedRuns: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          activeRuns: {
            $sum: {
              $cond: [
                { $in: ['$status', ['running', 'waiting_for_reply', 'waiting_for_delay', 'waiting_for_condition']] },
                1, 0
              ]
            }
          },
          failedRuns: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
          totalMessages: { $sum: '$metrics.messagesSent' },
          totalReplies: { $sum: '$metrics.repliesReceived' },
          avgReplyRate: { $avg: { $divide: ['$metrics.repliesReceived', { $max: ['$metrics.messagesSent', 1] }] } },
          // V2 specific metrics
          totalSequences: { $addToSet: '$automationRuleId' },
          uniqueLeads: { $addToSet: '$leadId' },
          aiDecisions: { $sum: '$metrics.aiDecisionsMade' },
          avgProcessingTime: { $avg: '$metrics.processingTime' }
        }
      }
    ]);

    const result = analytics[0] || {
      totalRuns: 0,
      completedRuns: 0,
      activeRuns: 0,
      failedRuns: 0,
      totalMessages: 0,
      totalReplies: 0,
      avgReplyRate: 0,
      totalSequences: [],
      uniqueLeads: []
    };

    // Calculate additional V2 metrics
    result.totalUniqueSequences = result.totalSequences.length;
    result.totalUniqueLeads = result.uniqueLeads.length;

    res.json({
      success: true,
      data: result,
      version: 'v2',
      period
    });
  } catch (error) {
    console.error('Error fetching analytics (V2):', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      version: 'v2'
    });
  }
};

// Handle incoming reply (V2)
const handleReply = async (req, res) => {
  try {
    const { automationRunId, content, type = 'text' } = req.body;

    await advancedAutomationProcessorV2.processReply(automationRunId, content, type);

    res.json({
      success: true,
      message: 'Reply processed successfully',
      version: 'v2'
    });
  } catch (error) {
    console.error('Error processing reply (V2):', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process reply',
      version: 'v2'
    });
  }
};

// Advanced AI analysis for V2
const getAIAnalysis = async (req, res) => {
  try {
    const { content, context } = req.body;

    const analysis = await aiAutomationService.analyzeReply(content, context);

    res.json({
      success: true,
      data: analysis,
      version: 'v2'
    });
  } catch (error) {
    console.error('Error in AI analysis (V2):', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze content',
      version: 'v2'
    });
  }
};

// Trigger automation event (V2)
const triggerAutomation = async (req, res) => {
  try {
    const { eventType, data } = req.body;

    const results = await advancedAutomationProcessorV2.triggerAutomation(eventType, data, req.user.id);

    res.json({
      success: true,
      message: 'Automation triggered successfully',
      data: results,
      version: 'v2'
    });
  } catch (error) {
    console.error('Error triggering automation (V2):', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger automation',
      version: 'v2'
    });
  }
};

module.exports = {
  getSequences,
  createSequence,
  getSequenceById,
  updateSequence,
  deleteSequence,
  getFlows,
  startAutomation,
  getRuns,
  getAnalytics,
  handleReply,
  getAIAnalysis,
  triggerAutomation
};
