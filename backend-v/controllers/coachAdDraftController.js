/**
 * Coach Ad Draft Controller
 * 
 * Handles coach-owned ad instances created from Admin Ad Templates.
 * All pixel, account, budget, and audience operations are coach-specific.
 */

const CoachAdDraft = require('../schema/CoachAdDraft');
const AdTemplate = require('../schema/AdTemplate');
const CoachMarketingCredentials = require('../schema/CoachMarketingCredentials');
const CoachStaffService = require('../services/coachStaffService');
const metaAdsService = require('../services/metaAdsService');
const asyncHandler = require('../middleware/async');

/**
 * @desc    Create ad draft from admin template
 * @route   POST /api/coach-ad-drafts
 * @access  Private (Coach)
 * 
 * CRITICAL: Resolves pixelId from coach's credentials at creation time
 */
exports.createAdDraft = asyncHandler(async (req, res) => {
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const {
        adminTemplateId,
        campaignName,
        objective,
        creativeContent,
        destinationUrl,
        funnelId,
        conversionEvent,
        budget,
        schedule,
        audienceType,
        audienceConfig,
        selectedFormat,
        andromedaConfig,
        placements,
        optimization
    } = req.body;

    // Validate required fields
    if (!adminTemplateId || !campaignName || !objective || !creativeContent || !destinationUrl) {
        return res.status(400).json({
            success: false,
            error: 'adminTemplateId, campaignName, objective, creativeContent, and destinationUrl are required'
        });
    }

    // Load admin template to validate structure
    const template = await AdTemplate.findById(adminTemplateId);
    if (!template) {
        return res.status(404).json({
            success: false,
            error: 'Admin template not found'
        });
    }

    // Validate objective is supported by template
    if (!template.supportedObjectives.includes(objective)) {
        return res.status(400).json({
            success: false,
            error: `Objective ${objective} is not supported by this template. Supported: ${template.supportedObjectives.join(', ')}`
        });
    }

    // Validate format is supported by template
    if (selectedFormat && !template.supportedFormats.includes(selectedFormat)) {
        return res.status(400).json({
            success: false,
            error: `Format ${selectedFormat} is not supported by this template. Supported: ${template.supportedFormats.join(', ')}`
        });
    }

    // Validate conversion event is supported by template
    if (conversionEvent && !template.supportedConversionEvents.includes(conversionEvent)) {
        return res.status(400).json({
            success: false,
            error: `Conversion event ${conversionEvent} is not supported by this template. Supported: ${template.supportedConversionEvents.join(', ')}`
        });
    }

    // Validate CTA is supported by template
    if (creativeContent.callToAction && !template.validationRules.supportedCTATypes.includes(creativeContent.callToAction)) {
        return res.status(400).json({
            success: false,
            error: `CTA ${creativeContent.callToAction} is not supported by this template. Supported: ${template.validationRules.supportedCTATypes.join(', ')}`
        });
    }

    // Resolve pixelId from coach's Meta credentials
    let pixelId = null;
    try {
        const credentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('metaAds.pixelId metaAds.pixelEnabled metaAds.isConnected');
        
        if (credentials && credentials.metaAds?.isConnected && credentials.metaAds?.pixelEnabled) {
            pixelId = credentials.metaAds.pixelId;
        }
    } catch (error) {
        console.error('[CoachAdDraft] Error resolving pixelId:', error);
        // Continue without pixel - coach can add it later
    }

    // Create ad draft
    const adDraft = await CoachAdDraft.create({
        coachId,
        adminTemplateId,
        campaignName,
        objective,
        creativeContent,
        destinationUrl,
        funnelId: funnelId || null,
        pixelId,
        conversionEvent: conversionEvent || 'PageView',
        budget,
        schedule: schedule || {},
        audienceType: audienceType || 'cold',
        audienceConfig: audienceConfig || {},
        selectedFormat: selectedFormat || template.supportedFormats[0],
        andromedaConfig: andromedaConfig || { enabled: false },
        placements: placements || ['all'],
        optimization: optimization || {
            optimizationGoal: 'LINK_CLICKS',
            bidStrategy: 'LOWEST_COST'
        },
        status: 'draft'
    });

    res.status(201).json({
        success: true,
        data: adDraft,
        message: 'Ad draft created successfully'
    });
});

/**
 * @desc    Get all ad drafts for coach
 * @route   GET /api/coach-ad-drafts
 * @access  Private (Coach)
 */
exports.getAdDrafts = asyncHandler(async (req, res) => {
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const { status, adminTemplateId } = req.query;

    const filter = { coachId };
    if (status) filter.status = status;
    if (adminTemplateId) filter.adminTemplateId = adminTemplateId;

    const drafts = await CoachAdDraft.find(filter)
        .populate('adminTemplateId', 'name description category supportedObjectives supportedFormats')
        .populate('funnelId', 'name funnelUrl')
        .sort({ createdAt: -1 })
        .lean();

    res.json({
        success: true,
        data: drafts,
        count: drafts.length
    });
});

/**
 * @desc    Get single ad draft
 * @route   GET /api/coach-ad-drafts/:draftId
 * @access  Private (Coach)
 */
exports.getAdDraft = asyncHandler(async (req, res) => {
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const { draftId } = req.params;

    const draft = await CoachAdDraft.findOne({ _id: draftId, coachId })
        .populate('adminTemplateId')
        .populate('funnelId')
        .lean();

    if (!draft) {
        return res.status(404).json({
            success: false,
            error: 'Ad draft not found'
        });
    }

    res.json({
        success: true,
        data: draft
    });
});

/**
 * @desc    Update ad draft
 * @route   PUT /api/coach-ad-drafts/:draftId
 * @access  Private (Coach)
 */
exports.updateAdDraft = asyncHandler(async (req, res) => {
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const { draftId } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.coachId;
    delete updateData.adminTemplateId;
    delete updateData.metaCampaignId;
    delete updateData.metaAdSetId;
    delete updateData.metaAdId;

    // If pixelId is being updated, validate it belongs to coach
    if (updateData.pixelId) {
        const credentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('metaAds.pixelId');
        
        if (!credentials || credentials.metaAds?.pixelId !== updateData.pixelId) {
            return res.status(403).json({
                success: false,
                error: 'PixelId does not belong to this coach'
            });
        }
    }

    const draft = await CoachAdDraft.findOneAndUpdate(
        { _id: draftId, coachId },
        { $set: updateData },
        { new: true, runValidators: true }
    );

    if (!draft) {
        return res.status(404).json({
            success: false,
            error: 'Ad draft not found'
        });
    }

    res.json({
        success: true,
        data: draft
    });
});

/**
 * @desc    Publish ad draft (create live campaign in Meta)
 * @route   POST /api/coach-ad-drafts/:draftId/publish
 * @access  Private (Coach)
 * 
 * CRITICAL: Uses coach's Meta account, pixel, and access token
 */
exports.publishAdDraft = asyncHandler(async (req, res) => {
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const { draftId } = req.params;

    const draft = await CoachAdDraft.findOne({ _id: draftId, coachId })
        .populate('adminTemplateId');

    if (!draft) {
        return res.status(404).json({
            success: false,
            error: 'Ad draft not found'
        });
    }

    // Validate draft is ready
    if (!draft.pixelId) {
        return res.status(400).json({
            success: false,
            error: 'PixelId is required. Please connect your Meta account and enable pixel tracking.'
        });
    }

    // Get coach's Meta account info
    let adAccountId;
    try {
        const accountInfo = await metaAdsService.getCoachMetaAccountInfo(coachId);
        adAccountId = accountInfo.adAccountId;
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: 'Meta account not connected. Please connect your Meta Ads account first.'
        });
    }

    // Remove 'act_' prefix if present
    adAccountId = adAccountId.replace(/^act_/, '');

    try {
        // Create campaign in Meta
        const campaignData = {
            name: draft.campaignName,
            objective: draft.objective,
            status: 'PAUSED', // Start paused for review
            daily_budget: Math.round(draft.budget.amount * 100), // Convert to cents
            special_ad_categories: []
        };

        const campaign = await metaAdsService.createCampaign(coachId, adAccountId, campaignData);

        // Create ad set with pixel and targeting
        const adSetData = {
            name: `${draft.campaignName} - Ad Set`,
            campaign_id: campaign.id,
            billing_event: 'IMPRESSIONS',
            optimization_goal: draft.optimization.optimizationGoal,
            bid_strategy: draft.optimization.bidStrategy,
            daily_budget: Math.round(draft.budget.amount * 100),
            targeting: draft.audienceConfig.targeting || {},
            ...(draft.pixelId && { pixel_id: draft.pixelId })
        };

        // Add retargeting audience if configured
        if (draft.audienceType === 'retargeting' && draft.audienceConfig.retargeting?.audienceId) {
            if (!adSetData.targeting.custom_audiences) {
                adSetData.targeting.custom_audiences = [];
            }
            adSetData.targeting.custom_audiences.push({
                id: draft.audienceConfig.retargeting.audienceId
            });
        }

        const adSet = await metaAdsService.createAdSet(coachId, campaign.id, adSetData);

        // Get page ID for creative (already retrieved above, but ensure we have it)
        if (!pageId) {
            try {
                const accountInfo = await metaAdsService.getCoachMetaAccountInfo(coachId);
                pageId = accountInfo.facebookPageId;
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    error: 'Facebook Page ID not found. Please ensure your Meta account has a connected Facebook page.'
                });
            }
        }

        // Create ad creative
        const creativeData = {
            name: `${draft.campaignName} - Creative`,
            object_story_spec: {
                page_id: pageId,
                link_data: {
                    ...(draft.creativeContent.mediaAssets[0]?.type === 'image' && {
                        image_url: draft.creativeContent.mediaAssets[0].url
                    }),
                    ...(draft.creativeContent.mediaAssets[0]?.type === 'video' && {
                        video_id: draft.creativeContent.mediaAssets[0].url
                    }),
                    link: draft.destinationUrl,
                    message: draft.creativeContent.primaryText,
                    name: draft.creativeContent.headline,
                    call_to_action: {
                        type: draft.creativeContent.callToAction
                    }
                }
            }
        };

        const creative = await metaAdsService.createAdCreative(coachId, adAccountId, creativeData);
        
        // Note: getPageId is available in metaAdsService, but we already have pageId from accountInfo above

        // Create ad
        const adData = {
            name: draft.campaignName,
            adset_id: adSet.id,
            creative: { creative_id: creative.id },
            status: 'PAUSED'
        };

        const ad = await metaAdsService.createAd(coachId, adAccountId, adData);

        // Update draft with Meta IDs
        draft.metaCampaignId = campaign.id;
        draft.metaAdSetId = adSet.id;
        draft.metaAdId = ad.id;
        draft.metaCreativeId = creative.id;
        draft.status = 'pending_review';
        await draft.save();

        res.json({
            success: true,
            data: {
                draft,
                metaCampaign: campaign,
                metaAdSet: adSet,
                metaAd: ad,
                metaCreative: creative
            },
            message: 'Ad draft published successfully. Campaign is paused for review.'
        });
    } catch (error) {
        console.error('[CoachAdDraft] Error publishing:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to publish ad draft'
        });
    }
});


/**
 * @desc    Delete ad draft
 * @route   DELETE /api/coach-ad-drafts/:draftId
 * @access  Private (Coach)
 */
exports.deleteAdDraft = asyncHandler(async (req, res) => {
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const { draftId } = req.params;

    const draft = await CoachAdDraft.findOneAndDelete({ _id: draftId, coachId });

    if (!draft) {
        return res.status(404).json({
            success: false,
            error: 'Ad draft not found'
        });
    }

    res.json({
        success: true,
        message: 'Ad draft deleted successfully'
    });
});
