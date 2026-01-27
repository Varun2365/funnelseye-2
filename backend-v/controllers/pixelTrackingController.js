/**
 * Pixel Tracking Controller
 * 
 * Handles pixel event tracking, forwarding to Meta, and retargeting audience management
 */

const asyncHandler = require('../middleware/async');
const metaPixelService = require('../services/metaPixelService');
const AdCampaign = require('../schema/AdCampaign');
const CoachStaffService = require('../services/coachStaffService');

/**
 * @desc    Track a pixel event
 * @route   POST /api/pixel/track
 * @access  Public (can be called from frontend)
 * 
 * CRITICAL: coachId is REQUIRED for multi-tenant isolation
 * pixelId is validated against coach's Meta account to prevent cross-coach usage
 */
exports.trackPixelEvent = asyncHandler(async (req, res) => {
    const {
        coachId,
        pixelId,
        campaignId,
        eventName,
        eventId,
        userData,
        customData,
        value,
        currency,
        sourceUrl,
        actionSource
    } = req.body;

    // CRITICAL: coachId is required for multi-tenant isolation
    if (!coachId) {
        return res.status(400).json({
            success: false,
            error: 'coachId is required for pixel tracking'
        });
    }

    if (!eventName) {
        return res.status(400).json({
            success: false,
            error: 'eventName is required'
        });
    }

    // Validate coachId format
    if (!mongoose.Types.ObjectId.isValid(coachId)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid coachId format'
        });
    }

    // Resolve pixelId from coach's Meta account if not provided
    let resolvedPixelId = pixelId;
    if (!resolvedPixelId) {
        try {
            const CoachMarketingCredentials = require('../schema/CoachMarketingCredentials');
            const credentials = await CoachMarketingCredentials.findOne({ coachId })
                .select('metaAds.pixelId metaAds.pixelEnabled metaAds.isConnected');
            
            if (!credentials || !credentials.metaAds?.isConnected || !credentials.metaAds?.pixelEnabled) {
                return res.status(400).json({
                    success: false,
                    error: 'Coach does not have a connected Meta Pixel'
                });
            }
            
            resolvedPixelId = credentials.metaAds.pixelId;
        } catch (error) {
            console.error('[PixelTracking] Error resolving pixelId:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to resolve pixelId for coach'
            });
        }
    } else {
        // SAFETY CHECK: Validate that pixelId belongs to this coach
        try {
            const CoachMarketingCredentials = require('../schema/CoachMarketingCredentials');
            const credentials = await CoachMarketingCredentials.findOne({ coachId })
                .select('metaAds.pixelId');
            
            if (!credentials || credentials.metaAds?.pixelId !== resolvedPixelId) {
                console.error(`[PixelTracking] SECURITY: PixelId ${resolvedPixelId} does not belong to coach ${coachId}`);
                return res.status(403).json({
                    success: false,
                    error: 'PixelId does not belong to this coach'
                });
            }
        } catch (error) {
            console.error('[PixelTracking] Error validating pixelId ownership:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to validate pixelId ownership'
            });
        }
    }

    try {
        const result = await metaPixelService.trackPixelEvent(
            coachId,
            resolvedPixelId,
            {
                eventName,
                eventId,
                userData: userData || {},
                customData: customData || {},
                value,
                currency: currency || 'USD',
                sourceUrl,
                actionSource: actionSource || 'website'
            },
            campaignId
        );

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('[PixelTracking] Error tracking event:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to track pixel event'
        });
    }
});

/**
 * @desc    Track multiple pixel events (batch)
 * @route   POST /api/pixel/track-batch
 * @access  Public
 */
exports.trackPixelEventsBatch = asyncHandler(async (req, res) => {
    const { coachId, pixelId, campaignId, events } = req.body;

    if (!pixelId || !events || !Array.isArray(events) || events.length === 0) {
        return res.status(400).json({
            success: false,
            error: 'pixelId and events array are required'
        });
    }

    try {
        const result = await metaPixelService.trackPixelEventsBatch(
            coachId,
            resolvedPixelId,
            events,
            campaignId
        );

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('[PixelTracking] Error tracking batch events:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to track pixel events'
        });
    }
});

/**
 * @desc    Create retargeting audience
 * @route   POST /api/pixel/retargeting-audience
 * @access  Private (Coach/Admin)
 */
exports.createRetargetingAudience = asyncHandler(async (req, res) => {
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const { pixelId, audienceConfig } = req.body;

    if (!pixelId || !audienceConfig) {
        return res.status(400).json({
            success: false,
            error: 'pixelId and audienceConfig are required'
        });
    }

    try {
        const result = await metaPixelService.createRetargetingAudience(
            coachId,
            pixelId,
            audienceConfig
        );

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('[PixelTracking] Error creating retargeting audience:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create retargeting audience'
        });
    }
});

/**
 * @desc    Get pixel events for a campaign
 * @route   GET /api/pixel/campaign/:campaignId/events
 * @access  Private (Coach/Admin)
 */
exports.getCampaignPixelEvents = asyncHandler(async (req, res) => {
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const { campaignId } = req.params;

    try {
        const result = await metaPixelService.getCampaignPixelEvents(coachId, campaignId);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('[PixelTracking] Error getting campaign events:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get campaign pixel events'
        });
    }
});

/**
 * @desc    Retry failed pixel events
 * @route   POST /api/pixel/campaign/:campaignId/retry
 * @access  Private (Coach/Admin)
 */
exports.retryFailedPixelEvents = asyncHandler(async (req, res) => {
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const { campaignId } = req.params;

    try {
        const result = await metaPixelService.retryFailedPixelEvents(coachId, campaignId);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('[PixelTracking] Error retrying failed events:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to retry pixel events'
        });
    }
});
