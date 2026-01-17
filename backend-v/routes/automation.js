const express = require('express');
const router = express.Router();
const MessagingSequence = require('../schema/messagingSequence');
const FlowControl = require('../schema/flowControl');
const AutomationRun = require('../schema/automationRun');
const automationEngine = require('../services/automationEngine');
const aiAutomationService = require('../services/aiAutomationService');
const { protect } = require('../middleware/auth');

// Apply authentication to all routes
router.use(protect);

// Get all messaging sequences for coach
router.get('/sequences', async (req, res) => {
  try {
    const sequences = await MessagingSequence.find({
      coachId: req.user.id
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: sequences
    });
  } catch (error) {
    console.error('Error fetching sequences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messaging sequences'
    });
  }
});

// Create new messaging sequence
router.post('/sequences', async (req, res) => {
  try {
    const sequenceData = {
      ...req.body,
      coachId: req.user.id
    };

    const sequence = new MessagingSequence(sequenceData);
    await sequence.save();

    res.json({
      success: true,
      data: sequence
    });
  } catch (error) {
    console.error('Error creating sequence:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create messaging sequence'
    });
  }
});

// Update messaging sequence
router.put('/sequences/:id', async (req, res) => {
  try {
    const sequence = await MessagingSequence.findOneAndUpdate(
      { _id: req.params.id, coachId: req.user.id },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!sequence) {
      return res.status(404).json({
        success: false,
        message: 'Sequence not found'
      });
    }

    res.json({
      success: true,
      data: sequence
    });
  } catch (error) {
    console.error('Error updating sequence:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update messaging sequence'
    });
  }
});

// Delete messaging sequence
router.delete('/sequences/:id', async (req, res) => {
  try {
    const sequence = await MessagingSequence.findOneAndDelete({
      _id: req.params.id,
      coachId: req.user.id
    });

    if (!sequence) {
      return res.status(404).json({
        success: false,
        message: 'Sequence not found'
      });
    }

    res.json({
      success: true,
      message: 'Sequence deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting sequence:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete messaging sequence'
    });
  }
});

// Get flow controls
router.get('/flows', async (req, res) => {
  try {
    const flows = await FlowControl.find({
      coachId: req.user.id
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: flows
    });
  } catch (error) {
    console.error('Error fetching flows:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch flow controls'
    });
  }
});

// Create flow control
router.post('/flows', async (req, res) => {
  try {
    const flowData = {
      ...req.body,
      coachId: req.user.id
    };

    const flow = new FlowControl(flowData);
    await flow.save();

    res.json({
      success: true,
      data: flow
    });
  } catch (error) {
    console.error('Error creating flow:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create flow control'
    });
  }
});

// Start automation run
router.post('/run', async (req, res) => {
  try {
    const { sequenceId, leadId, triggerData } = req.body;

    const run = await automationEngine.startAutomation(
      req.user.id,
      sequenceId,
      leadId,
      triggerData
    );

    res.json({
      success: true,
      data: run
    });
  } catch (error) {
    console.error('Error starting automation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start automation'
    });
  }
});

// Get automation runs
router.get('/runs', async (req, res) => {
  try {
    const { status, sequenceId } = req.query;
    const filter = { coachId: req.user.id };

    if (status) filter.status = status;
    if (sequenceId) filter.sequenceId = sequenceId;

    const runs = await AutomationRun.find(filter)
      .populate('sequenceId', 'name')
      .populate('leadId', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: runs
    });
  } catch (error) {
    console.error('Error fetching runs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch automation runs'
    });
  }
});

// Handle incoming reply
router.post('/reply/:runId', async (req, res) => {
  try {
    const { runId } = req.params;
    const { content, type } = req.body;

    await automationEngine.handleReply(runId, content, type);

    res.json({
      success: true,
      message: 'Reply processed successfully'
    });
  } catch (error) {
    console.error('Error processing reply:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process reply'
    });
  }
});

// Analyze reply with AI
router.post('/analyze-reply', async (req, res) => {
  try {
    const { content, context } = req.body;

    const analysis = await aiAutomationService.analyzeReply(content, context);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Error analyzing reply:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze reply'
    });
  }
});

// Get automation analytics
router.get('/analytics', async (req, res) => {
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

    const analytics = await AutomationRun.aggregate([
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
          activeRuns: { $sum: { $cond: [{ $eq: ['$status', 'running'] }, 1, 0] } },
          failedRuns: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
          totalMessages: { $sum: '$messagesSent' },
          totalReplies: { $sum: '$repliesReceived' },
          avgReplyRate: { $avg: { $divide: ['$repliesReceived', { $max: ['$messagesSent', 1] }] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: analytics[0] || {
        totalRuns: 0,
        completedRuns: 0,
        activeRuns: 0,
        failedRuns: 0,
        totalMessages: 0,
        totalReplies: 0,
        avgReplyRate: 0
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
});

// Test sequence (for development)
router.post('/test-sequence/:sequenceId', async (req, res) => {
  try {
    const sequence = await MessagingSequence.findOne({
      _id: req.params.sequenceId,
      coachId: req.user.id
    });

    if (!sequence) {
      return res.status(404).json({
        success: false,
        message: 'Sequence not found'
      });
    }

    // Validate sequence structure
    const validation = validateSequence(sequence);

    res.json({
      success: true,
      data: {
        isValid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings,
        sequence: sequence
      }
    });
  } catch (error) {
    console.error('Error testing sequence:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test sequence'
    });
  }
});

// Get replies for monitoring
router.get('/replies', async (req, res) => {
  try {
    const { sentiment, intent, confidence, dateRange } = req.query;

    // Build match conditions
    const matchConditions = { coachId: req.user.id };

    if (sentiment && sentiment !== 'all') {
      matchConditions['aiAnalysis.sentiment'] = sentiment;
    }

    if (intent && intent !== 'all') {
      matchConditions['aiAnalysis.intent'] = intent;
    }

    if (confidence && confidence !== 'all') {
      const confidenceFilter = {
        high: { $gte: 0.8 },
        medium: { $gte: 0.6, $lt: 0.8 },
        low: { $lt: 0.6 }
      }[confidence];

      if (confidenceFilter) {
        matchConditions['aiAnalysis.confidence'] = confidenceFilter;
      }
    }

    // Date range filter
    if (dateRange) {
      const endDate = new Date();
      const startDate = new Date();

      switch (dateRange) {
        case '1d':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      matchConditions.createdAt = { $gte: startDate, $lte: endDate };
    }

    const replies = await AutomationRun.aggregate([
      { $match: matchConditions },
      { $unwind: '$messageLogs' },
      {
        $match: {
          'messageLogs.aiAnalysis': { $exists: true }
        }
      },
      {
        $project: {
          _id: '$messageLogs._id',
          runId: '$_id',
          leadName: '$context.leadData.name',
          content: '$messageLogs.replyContent',
          aiAnalysis: '$messageLogs.aiAnalysis',
          createdAt: '$messageLogs.repliedAt'
        }
      },
      { $sort: { createdAt: -1 } },
      { $limit: 100 }
    ]);

    res.json({
      success: true,
      data: replies
    });
  } catch (error) {
    console.error('Error fetching replies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch replies'
    });
  }
});

// Get AI decisions for monitoring
router.get('/ai-decisions', async (req, res) => {
  try {
    const { dateRange } = req.query;

    const matchConditions = { coachId: req.user.id };

    // Date range filter
    if (dateRange) {
      const endDate = new Date();
      const startDate = new Date();

      switch (dateRange) {
        case '1d':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      matchConditions.createdAt = { $gte: startDate, $lte: endDate };
    }

    const decisions = await AutomationRun.aggregate([
      { $match: matchConditions },
      { $unwind: '$aiDecisions' },
      {
        $project: {
          _id: '$aiDecisions._id',
          runId: '$_id',
          sequenceName: '$sequenceId.name',
          leadName: '$context.leadData.name',
          action: '$aiDecisions.action',
          confidence: '$aiDecisions.confidence',
          reasoning: '$aiDecisions.reasoning',
          status: 'executed', // Default status
          timestamp: '$aiDecisions.timestamp'
        }
      },
      { $sort: { timestamp: -1 } },
      { $limit: 100 }
    ]);

    res.json({
      success: true,
      data: decisions
    });
  } catch (error) {
    console.error('Error fetching AI decisions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI decisions'
    });
  }
});

// Get reply analytics
router.get('/reply-analytics', async (req, res) => {
  try {
    const { dateRange } = req.query;

    const matchConditions = { coachId: req.user.id };

    // Date range filter
    if (dateRange) {
      const endDate = new Date();
      const startDate = new Date();

      switch (dateRange) {
        case '1d':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      matchConditions.createdAt = { $gte: startDate, $lte: endDate };
    }

    const analytics = await AutomationRun.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: null,
          totalReplies: { $sum: '$repliesReceived' },
          repliesToday: {
            $sum: {
              $cond: [
                { $gte: ['$lastActivityAt', new Date(Date.now() - 24 * 60 * 60 * 1000)] },
                '$repliesReceived',
                0
              ]
            }
          },
          sentimentBreakdown: {
            positive: { $sum: { $size: { $filter: { input: '$messageLogs', cond: { $eq: ['$$this.aiAnalysis.sentiment', 'positive'] } } } } },
            negative: { $sum: { $size: { $filter: { input: '$messageLogs', cond: { $eq: ['$$this.aiAnalysis.sentiment', 'negative'] } } } } },
            neutral: { $sum: { $size: { $filter: { input: '$messageLogs', cond: { $eq: ['$$this.aiAnalysis.sentiment', 'neutral'] } } } } }
          },
          aiAccuracy: { $avg: '$aiDecisions.confidence' },
          avgResponseTime: { $avg: '$aiDecisions.responseTime' },
          humanOverrides: { $sum: { $size: '$aiDecisions' } }
        }
      }
    ]);

    res.json({
      success: true,
      data: analytics[0] || {
        totalReplies: 0,
        repliesToday: 0,
        sentimentBreakdown: { positive: 0, negative: 0, neutral: 0 },
        aiAccuracy: 0,
        avgResponseTime: 0,
        humanOverrides: 0
      }
    });
  } catch (error) {
    console.error('Error fetching reply analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reply analytics'
    });
  }
});

// Validate sequence structure
function validateSequence(sequence) {
  const errors = [];
  const warnings = [];

  // Check for required fields
  if (!sequence.name) errors.push('Sequence name is required');
  if (!sequence.steps || sequence.steps.length === 0) {
    errors.push('Sequence must have at least one step');
  }

  // Validate steps
  sequence.steps.forEach((step, index) => {
    if (!step.stepId) errors.push(`Step ${index + 1}: Missing stepId`);
    if (!step.stepType) errors.push(`Step ${index + 1}: Missing stepType`);
    if (step.stepType === 'message' && !step.content) {
      errors.push(`Step ${index + 1}: Message step must have content`);
    }
  });

  // Check for circular references or broken flows
  const stepIds = sequence.steps.map(s => s.stepId);
  sequence.steps.forEach(step => {
    if (step.nextSteps) {
      step.nextSteps.forEach(nextStep => {
        if (nextStep.stepId && !stepIds.includes(nextStep.stepId)) {
          warnings.push(`Step ${step.stepId}: References non-existent step ${nextStep.stepId}`);
        }
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

module.exports = router;
