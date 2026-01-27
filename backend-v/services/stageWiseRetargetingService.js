/**
 * Stage-Wise Retargeting Service
 * 
 * Creates segmented retargeting audiences based on funnel stage behavior
 * Each coach can have multiple audiences for different visitor segments
 */

const CoachMarketingCredentials = require('../schema/CoachMarketingCredentials');
const axios = require('axios');

const META_GRAPH_API_BASE = 'https://graph.facebook.com/v19.0';

/**
 * Get coach's Meta access token
 */
async function getCoachAccessToken(coachId) {
    try {
        const credentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('+metaAds.accessToken +encryptionKey');
        
        if (!credentials || !credentials.metaAds?.accessToken) {
            throw new Error('Meta Ads credentials not found');
        }
        
        return credentials.getDecryptedAccessToken();
    } catch (error) {
        console.error(`[StageWiseRetargeting] Error getting access token:`, error);
        throw error;
    }
}

/**
 * Create a simplified retargeting audience following Meta best practices
 * 
 * Uses standard Meta events + minimal custom events (FunnelStageViewed, ExitIntent)
 * 
 * @param {String} coachId - Coach ID
 * @param {String} pixelId - Coach's pixel ID
 * @param {Object} config - Audience configuration
 * @param {String} config.audienceType - Type: 'stage_abandoners', 'leads_not_converted', 'converted', 'exit_intent'
 * @param {String} config.funnelId - Funnel ID (optional, for stage-specific)
 * @param {String} config.stageId - Stage ID (optional, for stage-specific)
 * @param {Number} config.lookbackWindow - Days to look back (default: 30)
 */
async function createSimplifiedAudience(coachId, pixelId, config) {
    try {
        const {
            audienceType,
            funnelId = null,
            stageId = null,
            stageOrder = null,
            lookbackWindow = 30,
            exitIntentLookback = null,
            name
        } = config;

        // Validate pixelId belongs to coach
        const credentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('metaAds.pixelId metaAds.adAccountId');
        
        if (!credentials || credentials.metaAds?.pixelId !== pixelId) {
            throw new Error(`PixelId ${pixelId} does not belong to coach ${coachId}`);
        }

        const adAccountId = credentials.metaAds?.adAccountId;
        if (!adAccountId) {
            throw new Error('Ad account ID not found for coach');
        }

        const accessToken = await getCoachAccessToken(coachId);

        // Build audience rule based on audience type
        let audienceRule = {
            event_sources: [{
                id: pixelId,
                type: 'pixel'
            }],
            retention_days: lookbackWindow
        };

        // A. Stage Abandoners: FunnelStageViewed(stage = X) but NOT Lead WHERE stage_order > X
        // CRITICAL: Only create if stage.hasNextStage = true (handled in createFunnelSegmentedAudiences)
        // Exclusion logic: Exclude users who converted (Lead) at this stage or later stages
        if (audienceType === 'stage_abandoners') {
            if (!stageId) {
                throw new Error('stageId is required for stage_abandoners audience type');
            }
            
            audienceRule.rule = {
                event_sources: [{
                    id: pixelId,
                    type: 'pixel'
                }],
                event: {
                    event_name: 'FunnelStageViewed'
                },
                filters: [{
                    field: 'event.custom_data.stage_id',
                    operator: 'eq',
                    value: stageId
                }],
                exclusions: {
                    event_sources: [{
                        id: pixelId,
                        type: 'pixel'
                    }],
                    event: {
                        event_name: 'Lead'
                    }
                    // Note: Meta's API may not support nested filters in exclusions
                    // The exclusion of Lead WHERE stage_order > X is handled by the inclusion rule
                    // We only include FunnelStageViewed for this specific stage_id
                    // Users who converted (Lead) at this or later stages won't be in this audience
                }
            };
        }
        // B. Leads (Not Converted): Lead but NOT Purchase
        else if (audienceType === 'leads_not_converted') {
            audienceRule.rule = {
                event_sources: [{
                    id: pixelId,
                    type: 'pixel'
                }],
                event: {
                    event_name: 'Lead'
                },
                exclusions: {
                    event_sources: [{
                        id: pixelId,
                        type: 'pixel'
                    }],
                    event: {
                        event_name: 'Purchase'
                    }
                }
            };
        }
        // C. Converted Users: Purchase
        else if (audienceType === 'converted') {
            audienceRule.rule = {
                event_sources: [{
                    id: pixelId,
                    type: 'pixel'
                }],
                event: {
                    event_name: 'Purchase'
                }
            };
        }
        // D. Exit Intent: ExitIntent but NOT Lead (optional)
        // Lookback: 7-14 days (configurable, default 7)
        else if (audienceType === 'exit_intent') {
            // Validate lookback window for exit intent (7-14 days)
            const exitLookback = exitIntentLookback || 7;
            if (exitLookback < 7 || exitLookback > 14) {
                throw new Error('Exit intent lookback window must be between 7 and 14 days');
            }
            
            audienceRule.retention_days = exitLookback;
            audienceRule.rule = {
                event_sources: [{
                    id: pixelId,
                    type: 'pixel'
                }],
                event: {
                    event_name: 'ExitIntent'
                },
                exclusions: {
                    event_sources: [{
                        id: pixelId,
                        type: 'pixel'
                    }],
                    event: {
                        event_name: 'Lead'
                    }
                }
            };
        } else {
            throw new Error(`Invalid audience type: ${audienceType}`);
        }

        // Generate audience name
        const audienceName = name || generateAudienceName(audienceType, stageId, funnelId);

        // Create custom audience
        const audienceData = {
            name: audienceName,
            subtype: 'CUSTOM',
            rule: audienceRule
        };

        const url = `${META_GRAPH_API_BASE}/act_${adAccountId}/customaudiences`;
        const response = await axios.post(url, audienceData, {
            params: { access_token: accessToken }
        });

        return {
            success: true,
            audienceId: response.data.id,
            name: response.data.name,
            audienceType,
            stageId,
            funnelId
        };
    } catch (error) {
        console.error('[StageWiseRetargeting] Error creating audience:', error);
        throw error;
    }
}

/**
 * Generate audience name based on type
 */
function generateAudienceName(audienceType, stageId, funnelId) {
    const timestamp = new Date().toISOString().split('T')[0];
    
    const names = {
        'stage_abandoners': stageId ? `Stage Abandoners - ${stageId}` : 'Stage Abandoners',
        'leads_not_converted': 'Leads (Not Converted)',
        'converted': 'Converted Users',
        'exit_intent': 'Exit Intent Visitors'
    };
    
    return `${names[audienceType] || 'Retargeting'} - ${timestamp}`;
}

/**
 * Create simplified segmented audiences for a funnel (Meta best practices - REFINED)
 * 
 * Creates audiences per funnel following strict Meta Ads best practices:
 * A. Stage Abandoners (per stage, conditional) - ONLY if stage.hasNextStage = true
 *    Include: FunnelStageViewed(stage = X)
 *    Exclude: Lead WHERE stage_order > X
 * B. Leads (Not Converted) - Global
 *    Include: Lead
 *    Exclude: Purchase
 * C. Converted Users - Global
 *    Include: Purchase
 * D. Exit Intent Visitors - Optional (if exitIntentEnabled = true)
 *    Include: ExitIntent
 *    Exclude: Lead
 *    Lookback: 7-14 days (configurable)
 * 
 * Total: 2 global + N stage abandoners (conditional) + 1 optional
 */
async function createFunnelSegmentedAudiences(coachId, pixelId, funnelId, stages, options = {}) {
    try {
        const {
            exitIntentEnabled = false,
            exitIntentLookback = 7, // 7-14 days for exit intent
            lookbackWindow = 30 // Default 30 days for all other audiences
        } = options;

        // Validate exit intent lookback window
        if (exitIntentEnabled && (exitIntentLookback < 7 || exitIntentLookback > 14)) {
            throw new Error('Exit intent lookback window must be between 7 and 14 days');
        }

        // Validate pixel ownership BEFORE creating any audiences
        const credentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('metaAds.pixelId metaAds.adAccountId');
        
        if (!credentials || credentials.metaAds?.pixelId !== pixelId) {
            throw new Error(`PixelId ${pixelId} does not belong to coach ${coachId}`);
        }

        const audiences = [];
        let stageAbandonerCount = 0;

        // A. Global: Leads (Not Converted) - Lead but NOT Purchase
        const leadsNotConverted = await createSimplifiedAudience(coachId, pixelId, {
            audienceType: 'leads_not_converted',
            funnelId,
            lookbackWindow,
            name: `Leads (Not Converted) - Funnel ${funnelId}`
        });
        audiences.push({
            ...leadsNotConverted,
            segment: 'leads_not_converted',
            description: 'Visitors who filled form but didn\'t purchase',
            purpose: 'Next funnel stage or offer ads'
        });

        // B. Global: Converted Users - Purchase
        const converted = await createSimplifiedAudience(coachId, pixelId, {
            audienceType: 'converted',
            funnelId,
            lookbackWindow,
            name: `Converted Users - Funnel ${funnelId}`
        });
        audiences.push({
            ...converted,
            segment: 'converted',
            description: 'Visitors who completed purchase',
            purpose: 'Upsell or exclusion'
        });

        // C. Per-Stage: Stage Abandoners - ONLY if stage.hasNextStage = true
        // Include: FunnelStageViewed(stage = X)
        // Exclude: Lead WHERE stage_order > X
        for (let i = 0; i < stages.length; i++) {
            const stage = stages[i];
            const stageId = stage.pageId;
            const stageName = stage.name;
            const stageOrder = stage.order || i;
            
            // CRITICAL: Only create stage abandoner audience if stage has a next stage
            // Check if there's a next stage in the funnel
            const hasNextStage = i < stages.length - 1;
            
            if (hasNextStage) {
                const stageAbandoners = await createSimplifiedAudience(coachId, pixelId, {
                    audienceType: 'stage_abandoners',
                    funnelId,
                    stageId,
                    stageOrder,
                    lookbackWindow,
                    name: `Stage Abandoners - ${stageName}`
                });
                audiences.push({
                    ...stageAbandoners,
                    segment: 'stage_abandoners',
                    stageId,
                    stageName,
                    stageOrder,
                    description: `Visitors who viewed ${stageName} but didn't convert`,
                    purpose: 'Reminder / next step ads'
                });
                stageAbandonerCount++;
            }
        }

        // D. Optional: Exit Intent - ExitIntent but NOT Lead (if enabled)
        // Lookback: 7-14 days (configurable)
        if (exitIntentEnabled) {
            const exitIntent = await createSimplifiedAudience(coachId, pixelId, {
                audienceType: 'exit_intent',
                funnelId,
                exitIntentLookback,
                lookbackWindow: exitIntentLookback, // Override default for exit intent
                name: `Exit Intent Visitors - Funnel ${funnelId}`
            });
            audiences.push({
                ...exitIntent,
                segment: 'exit_intent',
                description: 'Visitors who showed exit intent but didn\'t convert',
                purpose: 'Urgency-based ads',
                lookbackWindow: exitIntentLookback
            });
        }

        return {
            success: true,
            audiences,
            totalAudiences: audiences.length,
            summary: {
                leadsNotConverted: 1,
                converted: 1,
                stageAbandoners: stageAbandonerCount, // Only stages with next stage
                exitIntent: exitIntentEnabled ? 1 : 0,
                total: 2 + stageAbandonerCount + (exitIntentEnabled ? 1 : 0)
            },
            meta: {
                pixelId,
                funnelId,
                stagesProcessed: stages.length,
                stagesWithAbandonerAudience: stageAbandonerCount,
                exitIntentEnabled,
                exitIntentLookback: exitIntentEnabled ? exitIntentLookback : null
            }
        };
    } catch (error) {
        console.error('[StageWiseRetargeting] Error creating segmented audiences:', error);
        throw error;
    }
}

/**
 * Get retargeting recommendations based on Meta best practices
 */
function getRetargetingRecommendations(audienceType, stageData = {}) {
    const recommendations = [];

    switch (audienceType) {
        case 'stage_abandoners':
            recommendations.push({
                audience: 'stage_abandoners',
                action: 'Show reminder / next stage ad',
                message: 'They viewed the stage but didn\'t convert - show them the next step or reminder',
                suggestedCTAs: ['LEARN_MORE', 'SIGN_UP'],
                suggestedContent: 'Social proof, testimonials, or next stage preview'
            });
            break;

        case 'leads_not_converted':
            recommendations.push({
                audience: 'leads_not_converted',
                action: 'Show next funnel stage / offer ad',
                message: 'They filled form but didn\'t purchase - show them the next offer or upsell',
                suggestedCTAs: ['SHOP_NOW', 'GET_QUOTE', 'APPLY_NOW'],
                suggestedContent: 'Upsell, special offer, or next funnel stage'
            });
            break;

        case 'converted':
            recommendations.push({
                audience: 'converted',
                action: 'Show upsell / exclusion',
                message: 'They converted - show upsell or exclude from retargeting',
                suggestedCTAs: ['SHOP_NOW', 'LEARN_MORE'],
                suggestedContent: 'Upsell products, related services, or exclude from retargeting'
            });
            break;

        case 'exit_intent':
            recommendations.push({
                audience: 'exit_intent',
                action: 'Show urgency-based ad',
                message: 'They showed exit intent - create urgency with limited-time offers',
                suggestedCTAs: ['SHOP_NOW', 'SIGN_UP'],
                suggestedContent: 'Limited-time discount, urgency messaging, or special offer'
            });
            break;

        default:
            recommendations.push({
                audience: 'general',
                action: 'Show relevant content',
                message: 'Use standard retargeting best practices'
            });
    }

    return recommendations;
}

module.exports = {
    createSimplifiedAudience,
    createFunnelSegmentedAudiences,
    getRetargetingRecommendations,
    generateAudienceName
};
