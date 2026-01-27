/**
 * Stage-Wise Retargeting Controller
 * 
 * Handles creation of segmented retargeting audiences based on funnel stage behavior
 */

const asyncHandler = require('../middleware/async');
const stageWiseRetargetingService = require('../services/stageWiseRetargetingService');
const CoachMarketingCredentials = require('../schema/CoachMarketingCredentials');
const AdminFunnel = require('../schema/AdminFunnel');
const CoachStaffService = require('../services/coachStaffService');

/**
 * @desc    Create a simplified retargeting audience (Meta best practices)
 * @route   POST /api/pixel/stage-audience
 * @access  Private (Coach)
 */
exports.createStageAudience = asyncHandler(async (req, res) => {
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const { pixelId, audienceType, funnelId, stageId, lookbackWindow, name } = req.body;

    if (!pixelId) {
        return res.status(400).json({
            success: false,
            error: 'pixelId is required'
        });
    }

    if (!audienceType || !['stage_abandoners', 'leads_not_converted', 'converted', 'exit_intent'].includes(audienceType)) {
        return res.status(400).json({
            success: false,
            error: 'audienceType must be one of: stage_abandoners, leads_not_converted, converted, exit_intent'
        });
    }

    try {
        const result = await stageWiseRetargetingService.createSimplifiedAudience(
            coachId,
            pixelId,
            {
                audienceType,
                funnelId,
                stageId,
                lookbackWindow: lookbackWindow || 30,
                name
            }
        );

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('[StageWiseRetargeting] Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create audience'
        });
    }
});

/**
 * @desc    Create simplified segmented audiences for entire funnel (Meta best practices)
 * @route   POST /api/pixel/funnel-segments/:funnelId
 * @access  Private (Coach)
 */
exports.createFunnelSegments = asyncHandler(async (req, res) => {
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const { funnelId } = req.params;
    const { 
        pixelId, 
        exitIntentEnabled = false, 
        exitIntentLookback = 7, // 7-14 days for exit intent
        lookbackWindow = 30 // Default 30 days for all other audiences
    } = req.body;

    if (!pixelId) {
        return res.status(400).json({
            success: false,
            error: 'pixelId is required'
        });
    }

    // Validate exit intent lookback window if enabled
    if (exitIntentEnabled && (exitIntentLookback < 7 || exitIntentLookback > 14)) {
        return res.status(400).json({
            success: false,
            error: 'exitIntentLookback must be between 7 and 14 days'
        });
    }

    try {
        // Load funnel to get stages
        const funnel = await AdminFunnel.findById(funnelId);
        if (!funnel) {
            return res.status(404).json({
                success: false,
                error: 'Funnel not found'
            });
        }

        const result = await stageWiseRetargetingService.createFunnelSegmentedAudiences(
            coachId,
            pixelId,
            funnelId,
            funnel.stages || [],
            {
                exitIntentEnabled,
                exitIntentLookback,
                lookbackWindow
            }
        );

        res.status(200).json({
            success: true,
            data: result,
            message: `Created ${result.totalAudiences} retargeting audiences following Meta Ads best practices`,
            meta: {
                audiencesCreated: result.summary,
                pixelId,
                funnelId,
                exitIntentEnabled,
                exitIntentLookback: exitIntentEnabled ? exitIntentLookback : null
            }
        });
    } catch (error) {
        console.error('[StageWiseRetargeting] Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create funnel segments'
        });
    }
});

/**
 * @desc    Get retargeting recommendations (Meta best practices)
 * @route   GET /api/pixel/recommendations
 * @access  Private (Coach)
 */
exports.getRecommendations = asyncHandler(async (req, res) => {
    const { audienceType, stageData } = req.query;

    if (!audienceType) {
        return res.status(400).json({
            success: false,
            error: 'audienceType is required (stage_abandoners, leads_not_converted, converted, exit_intent)'
        });
    }

    try {
        const parsedStageData = stageData ? (typeof stageData === 'string' ? JSON.parse(stageData) : stageData) : {};
        const recommendations = stageWiseRetargetingService.getRetargetingRecommendations(audienceType, parsedStageData);

        res.status(200).json({
            success: true,
            data: recommendations
        });
    } catch (error) {
        console.error('[StageWiseRetargeting] Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get recommendations'
        });
    }
});
