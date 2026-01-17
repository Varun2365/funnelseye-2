const { AdCampaign, AdSet, AdCreative, Ad } = require('../schema');
const { getUserContext } = require('../middleware/unifiedCoachAuth');
const CoachStaffService = require('../services/coachStaffService');
const metaAdsService = require('../services/metaAdsService');
const aiAdsAgentService = require('../services/aiAdsAgentService');
const CoachMarketingCredentials = require('../schema/CoachMarketingCredentials');

// List all campaigns for a coach
async function listCampaigns(req, res) {
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'ads', 'all', { coachId });
    
    // Build query with staff permission filtering
    const baseQuery = { coachId };
    const filteredQuery = CoachStaffService.buildResourceFilter(req, baseQuery);
    
    const campaigns = await AdCampaign.find(filteredQuery);
    
    // Filter response data based on staff permissions
    const filteredCampaigns = CoachStaffService.filterResponseData(req, campaigns, 'ads');
    
    res.json({ 
        success: true, 
        data: filteredCampaigns,
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
}

// Create a new campaign with AI optimization
async function createCampaign(req, res) {
    console.log("[CreateCampaign] Called");
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'write', 'ads', 'create', { coachId });
    
    const { coachMetaAccountId, campaignData, useAI = false } = req.body;
    
    console.log("[CreateCampaign] Request body:", { coachMetaAccountId, campaignData, useAI });
    
    // Validate required fields
    if (!campaignData) {
        return res.status(400).json({
            success: false,
            error: 'Missing required field: campaignData'
        });
    }
    
    if (!campaignData.name || !campaignData.objective) {
        return res.status(400).json({
            success: false,
            error: 'Campaign name and objective are required'
        });
    }
    
    // Get ad account ID from credentials if not provided
    let adAccountId = coachMetaAccountId;
    if (!adAccountId || adAccountId === '') {
        try {
            const accountInfo = await metaAdsService.getCoachMetaAccountInfo(coachId);
            adAccountId = accountInfo.adAccountId;
            console.log("[CreateCampaign] Retrieved adAccountId from credentials:", adAccountId);
        } catch (error) {
            console.error("[CreateCampaign] Error getting ad account ID:", error);
            return res.status(400).json({
                success: false,
                error: 'Ad account ID not found. Please ensure your Meta account is connected and configured.',
                details: error.message
            });
        }
    }
    
    if (!adAccountId) {
        return res.status(400).json({
            success: false,
            error: 'Ad account ID is required. Please ensure your Meta account is connected and has an ad account configured.'
        });
    }
    
    // Remove 'act_' prefix if present (Meta API adds it automatically)
    adAccountId = adAccountId.replace(/^act_/, '');
    
    // Check subscription limits for campaign creation
    const SubscriptionLimitsMiddleware = require('../middleware/subscriptionLimits');
    const limitCheck = await SubscriptionLimitsMiddleware.checkCampaignLimit(coachId);
    
    if (!limitCheck.allowed) {
        return res.status(403).json({
            success: false,
            message: limitCheck.reason,
            error: 'CAMPAIGN_LIMIT_REACHED',
            currentCount: limitCheck.currentCount,
            maxLimit: limitCheck.maxLimit,
            upgradeRequired: limitCheck.upgradeRequired,
            subscriptionRequired: true
        });
    }
    
    try {
        let enhancedCampaignData = { ...campaignData };
        
        if (useAI && campaignData.targetAudience && campaignData.productInfo) {
            try {
                // Generate AI-powered ad copy
                const aiGeneratedContent = await aiAdsAgentService.generateAdCopy(
                    coachId,
                    campaignData.targetAudience,
                    campaignData.productInfo,
                    campaignData.objective || 'CONVERSIONS'
                );
                
                // Generate targeting recommendations
                const targetingRecommendations = await aiAdsAgentService.generateTargetingRecommendations(
                    coachId,
                    campaignData.targetAudience,
                    campaignData.dailyBudget || campaignData.budget || 50
                );
                
                enhancedCampaignData = {
                    ...campaignData,
                    aiGenerated: true,
                    aiContent: aiGeneratedContent,
                    targetingRecommendations
                };
            } catch (aiError) {
                console.warn("[CreateCampaign] AI generation failed, continuing without AI:", aiError.message);
                // Continue without AI if it fails
            }
        }
        
        // Transform campaign data to Meta API format
        const metaCampaignData = {
            name: enhancedCampaignData.name,
            objective: enhancedCampaignData.objective,
            status: 'PAUSED', // Start paused for review
            // Convert budget from dollars to cents (Meta API expects cents)
            daily_budget: Math.round((enhancedCampaignData.dailyBudget || enhancedCampaignData.budget || 50) * 100),
            // Required parameter: special_ad_categories (empty array if no special categories)
            special_ad_categories: enhancedCampaignData.specialAdCategories || []
        };
        
        console.log("[CreateCampaign] Creating campaign with Meta API:", { adAccountId, metaCampaignData });
        
        let data;
        let testingModeWarning = null;
        
        try {
            data = await metaAdsService.createCampaign(coachId, adAccountId, metaCampaignData);
            console.log("[CreateCampaign] Campaign created successfully:", data.id);
            
            // Check if app is in development mode (this is informational)
            try {
                const credentials = await CoachMarketingCredentials.findOne({ coachId })
                    .select('metaAds.appId');
                if (credentials?.metaAds?.appId) {
                    // Note: We can't directly check app mode without additional API calls
                    // But we can warn if certain conditions are met
                    testingModeWarning = "Note: If your Meta app is in Development mode, campaigns may be created but may not deploy to real audiences. Only test users can interact with campaigns in Development mode. To deploy campaigns to real users, submit your app for App Review and switch to Live mode.";
                }
            } catch (warningError) {
                // Ignore warning check errors
            }
        } catch (error) {
            // Extract Meta API error details
            const metaError = error.response?.data?.error;
            
            // Prioritize user-friendly error messages from Meta API
            let errorMessage = metaError?.error_user_msg || 
                              metaError?.error_user_title || 
                              metaError?.message || 
                              error.message || 
                              'Failed to create campaign';
            
            const errorCode = metaError?.code;
            const errorType = metaError?.type;
            
            console.error("[CreateCampaign] Meta API Error:", {
                code: errorCode,
                type: errorType,
                message: errorMessage,
                user_msg: metaError?.error_user_msg,
                user_title: metaError?.error_user_title,
                subcode: metaError?.error_subcode,
                fbtrace_id: metaError?.fbtrace_id
            });
            
            // Check if error is related to testing mode
            if (errorMessage.includes('testing mode') || errorMessage.includes('Development mode') || errorMessage.includes('App Review')) {
                console.warn("[CreateCampaign] Testing mode restriction detected:", errorMessage);
                return res.status(400).json({
                    success: false,
                    error: errorMessage,
                    testingModeRestriction: true,
                    suggestion: "To deploy campaigns to real audiences, ensure your Meta app is in Live mode and has passed App Review. In Development mode, campaigns can only be used by test users."
                });
            }
            
            // Return user-friendly error message with full Meta API error details
            return res.status(error.response?.status || 500).json({
                success: false,
                error: errorMessage, // User-friendly message
                errorCode: errorCode,
                errorType: errorType,
                details: {
                    error: metaError || error.response?.data?.error || null,
                    fullResponse: error.response?.data || null
                }
            });
        }
 
        // Prepare campaign document with all fields
        const campaignDoc = {
            campaignId: data.id,
            coachId,
            name: campaignData.name,
            objective: campaignData.objective,
            status: 'PAUSED', // Start paused for review
            dailyBudget: enhancedCampaignData.dailyBudget || enhancedCampaignData.budget || 50,
            aiGenerated: useAI,
            aiContent: useAI ? enhancedCampaignData.aiContent : null,
            targetingRecommendations: useAI ? enhancedCampaignData.targetingRecommendations : null,
            metaRaw: data
        };
        
        // Add new fields if provided
        if (campaignData.adTitle) campaignDoc.adTitle = campaignData.adTitle;
        if (campaignData.adDescription) campaignDoc.adDescription = campaignData.adDescription;
        if (campaignData.adImageUrl) campaignDoc.adImageUrl = campaignData.adImageUrl;
        if (campaignData.callToAction) campaignDoc.callToAction = campaignData.callToAction;
        if (campaignData.targeting) campaignDoc.targeting = campaignData.targeting;
        if (campaignData.schedule) campaignDoc.schedule = campaignData.schedule;
        if (campaignData.funnelId) campaignDoc.funnelId = campaignData.funnelId;
        if (campaignData.funnelUrl) campaignDoc.funnelUrl = campaignData.funnelUrl;
        
        // Save to local database with all metadata
        const campaign = await AdCampaign.create(campaignDoc);
        
        res.json({ 
            success: true, 
            data: {
                ...data,
                campaign,
                aiEnhanced: useAI
            },
            warning: testingModeWarning
        });
    } catch (error) {
        console.error("[CreateCampaign] Error creating campaign:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to create campaign',
            details: error.response?.data || error.stack
        });
    }
}

// Update a campaign
async function updateCampaign(req, res) {
    const { campaignId } = req.params;
    const coachId = req.coachId;
    const updateData = req.body;
    const data = await metaAdsService.updateCampaign(coachId, campaignId, updateData);
    res.json({ success: true, data });
}

// Pause a campaign
async function pauseCampaign(req, res) {
    const { campaignId } = req.params;
    const coachId = req.coachId;
    const data = await metaAdsService.pauseCampaign(coachId, campaignId);
    res.json({ success: true, data });
}

// Resume a campaign
async function resumeCampaign(req, res) {
    const { campaignId } = req.params;
    const coachId = req.coachId;
    const data = await metaAdsService.resumeCampaign(coachId, campaignId);
    res.json({ success: true, data });
}

// Fetch analytics/insights for a campaign
async function getCampaignAnalytics(req, res) {
    const { campaignId } = req.params;
    const coachId = req.coachId;
    
    try {
        const data = await metaAdsService.fetchCampaignInsights(coachId, campaignId);
        
        // Get AI-powered insights and recommendations
        const anomalies = await aiAdsAgentService.detectAnomalies(coachId, campaignId);
        const recommendations = [];
        
        if (anomalies.length > 0) {
            anomalies.forEach(anomaly => {
                recommendations.push({
                    type: anomaly.type,
                    severity: anomaly.severity,
                    recommendation: anomaly.recommendation,
                    adSetName: anomaly.adSetName
                });
            });
        }
        
        res.json({ 
            success: true, 
            data: {
                ...data,
                aiInsights: {
                    anomalies,
                    recommendations,
                    optimizationScore: calculateOptimizationScore(data)
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Calculate optimization score based on performance data
function calculateOptimizationScore(data) {
    if (!data.data || data.data.length === 0) return 0;
    
    const campaign = data.data[0];
    const ctr = parseFloat(campaign.ctr) || 0;
    const cpc = parseFloat(campaign.cpc) || 0;
    const spend = parseFloat(campaign.spend) || 0;
    
    // Simple scoring algorithm
    let score = 50; // Base score
    
    if (ctr > 0.02) score += 20; // Good CTR
    if (ctr > 0.05) score += 10; // Excellent CTR
    
    if (cpc < 2.0) score += 15; // Good CPC
    if (cpc < 1.0) score += 10; // Excellent CPC
    
    if (spend > 0) score += 5; // Active campaign
    
    return Math.min(score, 100);
}

// Sync campaigns from Meta to DB
async function syncCampaigns(req, res) {
    const coachId = req.coachId;
    const coachMetaAccountId = req.body.coachMetaAccountId;
    await metaAdsService.syncCampaignsToDB(coachId, coachMetaAccountId);
    res.json({ success: true });
}

// New controllers for complete URL campaign creation

// Upload image and get image hash
async function uploadImage(req, res) {
    try {
        const { imageUrl } = req.body;
        
        if (!imageUrl) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required field: imageUrl' 
            });
        }

        const result = await metaAdsService.uploadImage(imageUrl);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Create ad set for targeting and budget
async function createAdSet(req, res) {
    try {
        const { campaignId } = req.params;
        const adSetData = req.body;
        
        if (!adSetData) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required field: adSetData' 
            });
        }

        const result = await metaAdsService.createAdSet(campaignId, adSetData);
        
        // Save to local database
        await AdSet.findOneAndUpdate(
            { adSetId: result.id, coachId: req.coachId },
            {
                coachId: req.coachId,
                campaignId,
                adSetId: result.id,
                name: adSetData.name,
                status: adSetData.status || 'DRAFT',
                targeting: adSetData.targeting,
                daily_budget: adSetData.daily_budget,
                lifetime_budget: adSetData.lifetime_budget,
                billing_event: adSetData.billing_event,
                optimization_goal: adSetData.optimization_goal,
                start_time: adSetData.start_time,
                end_time: adSetData.end_time,
                lastSynced: new Date(),
                metaRaw: result
            },
            { upsert: true, new: true }
        );

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Create ad creative with image and text
async function createAdCreative(req, res) {
    try {
        const { campaignId } = req.params;
        const creativeData = req.body;
        
        if (!creativeData) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required field: creativeData' 
            });
        }

        const result = await metaAdsService.createAdCreative(campaignId, creativeData);
        
        // Save to local database
        await AdCreative.findOneAndUpdate(
            { creativeId: result.id, coachId: req.coachId },
            {
                coachId: req.coachId,
                campaignId,
                creativeId: result.id,
                name: creativeData.name,
                status: 'ACTIVE',
                object_story_spec: creativeData.object_story_spec,
                image_hash: creativeData.object_story_spec?.link_data?.image_hash,
                image_url: creativeData.image_url,
                link: creativeData.object_story_spec?.link_data?.link,
                message: creativeData.object_story_spec?.link_data?.message,
                call_to_action: creativeData.object_story_spec?.link_data?.call_to_action,
                lastSynced: new Date(),
                metaRaw: result
            },
            { upsert: true, new: true }
        );

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Create ad that combines ad set and creative
async function createAd(req, res) {
    try {
        const { campaignId } = req.params;
        const adData = req.body;
        
        if (!adData) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required field: adData' 
            });
        }

        const result = await metaAdsService.createAd(campaignId, adData);
        
        // Save to local database
        await Ad.findOneAndUpdate(
            { adId: result.id, coachId: req.coachId },
            {
                coachId: req.coachId,
                campaignId,
                adSetId: adData.adset_id,
                adId: result.id,
                creativeId: adData.creative?.creative_id,
                name: adData.name,
                status: adData.status || 'DRAFT',
                adset_id: adData.adset_id,
                creative: adData.creative,
                lastSynced: new Date(),
                metaRaw: result
            },
            { upsert: true, new: true }
        );

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// List ad sets for a campaign
async function listAdSets(req, res) {
    try {
        const { campaignId } = req.params;
        const adSets = await AdSet.find({ campaignId, coachId: req.coachId });
        res.json({ success: true, data: adSets });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// List ad creatives for a campaign
async function listAdCreatives(req, res) {
    try {
        const { campaignId } = req.params;
        const adCreatives = await AdCreative.find({ campaignId, coachId: req.coachId });
        res.json({ success: true, data: adCreatives });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// List ads for a campaign
async function listAds(req, res) {
    try {
        const { campaignId } = req.params;
        const ads = await Ad.find({ campaignId, coachId: req.coachId });
        res.json({ success: true, data: ads });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Create complete URL campaign (all-in-one)
async function createUrlCampaign(req, res) {
    try {
        const { 
            coachMetaAccountId, 
            campaignData, 
            adSetData, 
            creativeData, 
            adData 
        } = req.body;
        
        if (!coachMetaAccountId || !campaignData || !adSetData || !creativeData || !adData) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields' 
            });
        }

        // Step 1: Create campaign
        const campaign = await metaAdsService.createCampaign(coachMetaAccountId, campaignData);
        
        // Step 2: Create ad set
        const adSet = await metaAdsService.createAdSet(campaign.id, adSetData);
        
        // Step 3: Create ad creative
        const creative = await metaAdsService.createAdCreative(campaign.id, creativeData);
        
        // Step 4: Create ad
        const ad = await metaAdsService.createAd(campaign.id, {
            ...adData,
            adset_id: adSet.id,
            creative: { creative_id: creative.id }
        });

        res.json({ 
            success: true, 
            data: {
                campaign,
                adSet,
                creative,
                ad
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {
    listCampaigns,
    createCampaign,
    updateCampaign,
    pauseCampaign,
    resumeCampaign,
    getCampaignAnalytics,
    syncCampaigns,
    uploadImage,
    createAdSet,
    createAdCreative,
    createAd,
    listAdSets,
    listAdCreatives,
    listAds,
    createUrlCampaign
};
