/**
 * Meta Pixel Service
 * 
 * Comprehensive service for Meta Pixel event tracking, retargeting,
 * and forwarding pixel data back to Meta for advanced retargeting campaigns.
 */

const axios = require('axios');
const crypto = require('crypto');
const CoachMarketingCredentials = require('../schema/CoachMarketingCredentials');
const AdCampaign = require('../schema/AdCampaign');

const META_GRAPH_API_BASE = 'https://graph.facebook.com/v19.0';
const META_PIXEL_API_BASE = 'https://graph.facebook.com/v19.0';

/**
 * Hash user data for advanced matching (SHA-256)
 */
function hashUserData(data) {
    if (!data) return null;
    const normalized = String(data).toLowerCase().trim();
    return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Get coach's Meta Pixel access token
 */
async function getCoachPixelAccessToken(coachId) {
    try {
        const credentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('+metaAds.accessToken +encryptionKey');
        
        if (!credentials || !credentials.metaAds?.accessToken) {
            throw new Error('Meta Ads credentials not found');
        }
        
        return credentials.getDecryptedAccessToken();
    } catch (error) {
        console.error(`[MetaPixelService] Error getting access token for coach ${coachId}:`, error);
        throw error;
    }
}

/**
 * Track a pixel event and forward to Meta
 * @param {String} coachId - Coach ID (REQUIRED for multi-tenant isolation)
 * @param {String} pixelId - Meta Pixel ID (validated against coach's account)
 * @param {Object} eventData - Event data
 * @param {String} campaignId - Optional campaign ID to associate with
 * 
 * SAFETY: Validates pixelId belongs to coachId before tracking
 */
async function trackPixelEvent(coachId, pixelId, eventData, campaignId = null) {
    // SAFETY CHECK: Validate pixelId ownership
    if (coachId && pixelId) {
        try {
            const credentials = await CoachMarketingCredentials.findOne({ coachId })
                .select('metaAds.pixelId metaAds.pixelEnabled');
            
            if (!credentials || credentials.metaAds?.pixelId !== pixelId) {
                throw new Error(`PixelId ${pixelId} does not belong to coach ${coachId}`);
            }
            
            if (!credentials.metaAds?.pixelEnabled) {
                throw new Error(`Pixel is not enabled for coach ${coachId}`);
            }
        } catch (error) {
            console.error(`[MetaPixelService] Security validation failed:`, error);
            throw error;
        }
    }
    
    try {
        const {
            eventName,
            eventId = null,
            eventTime = Math.floor(Date.now() / 1000),
            userData = {},
            customData = {},
            value = null,
            currency = 'USD',
            sourceUrl = null,
            actionSource = 'website'
        } = eventData;

        // Validate required fields
        if (!eventName || !pixelId) {
            throw new Error('eventName and pixelId are required');
        }

        // Prepare user data with advanced matching
        const processedUserData = {};
        if (userData.email) {
            processedUserData.em = hashUserData(userData.email);
        }
        if (userData.phone) {
            processedUserData.ph = hashUserData(userData.phone);
        }
        if (userData.firstName) {
            processedUserData.fn = hashUserData(userData.firstName);
        }
        if (userData.lastName) {
            processedUserData.ln = hashUserData(userData.lastName);
        }
        if (userData.city) {
            processedUserData.ct = hashUserData(userData.city);
        }
        if (userData.state) {
            processedUserData.st = hashUserData(userData.state);
        }
        if (userData.zip) {
            processedUserData.zp = hashUserData(userData.zip);
        }
        if (userData.country) {
            processedUserData.country = hashUserData(userData.country);
        }

        // Prepare event data for Meta Conversions API
        const eventPayload = {
            data: [{
                event_name: eventName,
                event_time: eventTime,
                event_id: eventId || `${Date.now()}_${Math.random().toString(36).substring(7)}`,
                action_source: actionSource,
                user_data: processedUserData,
                custom_data: {
                    ...customData,
                    ...(value !== null && { value, currency })
                },
                ...(sourceUrl && { event_source_url: sourceUrl })
            }]
        };

        // Forward to Meta Conversions API
        const accessToken = await getCoachPixelAccessToken(coachId);
        const pixelUrl = `${META_PIXEL_API_BASE}/${pixelId}/events`;
        
        const response = await axios.post(pixelUrl, eventPayload, {
            params: {
                access_token: accessToken
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Store event in campaign if campaignId provided
        if (campaignId) {
            await AdCampaign.findOneAndUpdate(
                { campaignId, coachId },
                {
                    $push: {
                        'pixelTracking.eventsTracked': {
                            eventName,
                            eventId: eventPayload.data[0].event_id,
                            timestamp: new Date(eventTime * 1000),
                            value,
                            currency,
                            userData: processedUserData,
                            customData,
                            forwardedToMeta: true,
                            forwardedAt: new Date()
                        }
                    },
                    $inc: { 'pixelTracking.totalEventsForwarded': 1 },
                    'pixelTracking.lastEventForwarded': new Date()
                },
                { upsert: false }
            );
        }

        return {
            success: true,
            events_received: response.data?.events_received || 0,
            messages: response.data?.messages || [],
            eventId: eventPayload.data[0].event_id
        };
    } catch (error) {
        console.error('[MetaPixelService] Error tracking pixel event:', error);
        
        // Store failed event for retry
        if (campaignId) {
            await AdCampaign.findOneAndUpdate(
                { campaignId, coachId },
                {
                    $push: {
                        'pixelTracking.eventsTracked': {
                            eventName: eventData.eventName,
                            eventId: eventData.eventId || `${Date.now()}_${Math.random().toString(36).substring(7)}`,
                            timestamp: new Date(),
                            value: eventData.value,
                            currency: eventData.currency || 'USD',
                            userData: eventData.userData || {},
                            customData: eventData.customData || {},
                            forwardedToMeta: false,
                            error: error.message
                        }
                    }
                },
                { upsert: false }
            );
        }
        
        throw error;
    }
}

/**
 * Batch track multiple pixel events
 * 
 * SAFETY: Validates pixelId belongs to coachId before tracking
 */
async function trackPixelEventsBatch(coachId, pixelId, events, campaignId = null) {
    // SAFETY CHECK: Validate pixelId ownership
    if (coachId && pixelId) {
        try {
            const credentials = await CoachMarketingCredentials.findOne({ coachId })
                .select('metaAds.pixelId metaAds.pixelEnabled');
            
            if (!credentials || credentials.metaAds?.pixelId !== pixelId) {
                throw new Error(`PixelId ${pixelId} does not belong to coach ${coachId}`);
            }
            
            if (!credentials.metaAds?.pixelEnabled) {
                throw new Error(`Pixel is not enabled for coach ${coachId}`);
            }
        } catch (error) {
            console.error(`[MetaPixelService] Security validation failed:`, error);
            throw error;
        }
    }
    
    try {
        const accessToken = await getCoachPixelAccessToken(coachId);
        const processedEvents = events.map(event => {
            const {
                eventName,
                eventId = null,
                eventTime = Math.floor(Date.now() / 1000),
                userData = {},
                customData = {},
                value = null,
                currency = 'USD',
                sourceUrl = null,
                actionSource = 'website'
            } = event;

            const processedUserData = {};
            if (userData.email) processedUserData.em = hashUserData(userData.email);
            if (userData.phone) processedUserData.ph = hashUserData(userData.phone);
            if (userData.firstName) processedUserData.fn = hashUserData(userData.firstName);
            if (userData.lastName) processedUserData.ln = hashUserData(userData.lastName);
            if (userData.city) processedUserData.ct = hashUserData(userData.city);
            if (userData.state) processedUserData.st = hashUserData(userData.state);
            if (userData.zip) processedUserData.zp = hashUserData(userData.zip);
            if (userData.country) processedUserData.country = hashUserData(userData.country);

            return {
                event_name: eventName,
                event_time: eventTime,
                event_id: eventId || `${Date.now()}_${Math.random().toString(36).substring(7)}`,
                action_source: actionSource,
                user_data: processedUserData,
                custom_data: {
                    ...customData,
                    ...(value !== null && { value, currency })
                },
                ...(sourceUrl && { event_source_url: sourceUrl })
            };
        });

        const eventPayload = { data: processedEvents };
        const pixelUrl = `${META_PIXEL_API_BASE}/${pixelId}/events`;
        
        const response = await axios.post(pixelUrl, eventPayload, {
            params: { access_token: accessToken },
            headers: { 'Content-Type': 'application/json' }
        });

        // Store events in campaign
        if (campaignId) {
            const eventsToStore = processedEvents.map((event, index) => ({
                eventName: event.event_name,
                eventId: event.event_id,
                timestamp: new Date(event.event_time * 1000),
                value: event.custom_data?.value || null,
                currency: event.custom_data?.currency || 'USD',
                userData: event.user_data || {},
                customData: event.custom_data || {},
                forwardedToMeta: true,
                forwardedAt: new Date()
            }));

            await AdCampaign.findOneAndUpdate(
                { campaignId, coachId },
                {
                    $push: {
                        'pixelTracking.eventsTracked': { $each: eventsToStore }
                    },
                    $inc: { 'pixelTracking.totalEventsForwarded': eventsToStore.length },
                    'pixelTracking.lastEventForwarded': new Date()
                },
                { upsert: false }
            );
        }

        return {
            success: true,
            events_received: response.data?.events_received || 0,
            messages: response.data?.messages || []
        };
    } catch (error) {
        console.error('[MetaPixelService] Error tracking batch pixel events:', error);
        throw error;
    }
}

/**
 * Create retargeting audience from pixel events
 * 
 * SAFETY: Validates pixelId belongs to coachId before creating audience
 */
async function createRetargetingAudience(coachId, pixelId, audienceConfig) {
    // SAFETY CHECK: Validate pixelId ownership
    if (coachId && pixelId) {
        try {
            const credentials = await CoachMarketingCredentials.findOne({ coachId })
                .select('metaAds.pixelId metaAds.pixelEnabled');
            
            if (!credentials || credentials.metaAds?.pixelId !== pixelId) {
                throw new Error(`PixelId ${pixelId} does not belong to coach ${coachId}`);
            }
            
            if (!credentials.metaAds?.pixelEnabled) {
                throw new Error(`Pixel is not enabled for coach ${coachId}`);
            }
        } catch (error) {
            console.error(`[MetaPixelService] Security validation failed:`, error);
            throw error;
        }
    }
    try {
        const {
            name,
            eventType = 'PageView',
            lookbackWindow = 30,
            exclusionWindow = 1,
            minFrequency = 1,
            maxFrequency = null
        } = audienceConfig;

        const accessToken = await getCoachPixelAccessToken(coachId);
        
        // Get ad account ID
        const credentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('metaAds.adAccountId');
        
        if (!credentials?.metaAds?.adAccountId) {
            throw new Error('Ad account ID not found');
        }

        const adAccountId = credentials.metaAds.adAccountId;

        // Create custom audience based on pixel events
        const audienceData = {
            name: name || `Retargeting Audience - ${new Date().toISOString()}`,
            subtype: 'CUSTOM',
            rule: {
                event_sources: [{
                    id: pixelId,
                    type: 'pixel'
                }],
                retention_days: lookbackWindow,
                ...(eventType && {
                    event: {
                        event_name: eventType
                    }
                })
            },
            ...(minFrequency > 1 && { min_frequency: minFrequency }),
            ...(maxFrequency && { max_frequency: maxFrequency })
        };

        const url = `${META_GRAPH_API_BASE}/act_${adAccountId}/customaudiences`;
        const response = await axios.post(url, audienceData, {
            params: { access_token: accessToken }
        });

        return {
            success: true,
            audienceId: response.data.id,
            name: response.data.name
        };
    } catch (error) {
        console.error('[MetaPixelService] Error creating retargeting audience:', error);
        throw error;
    }
}

/**
 * Get pixel events for a campaign
 */
async function getCampaignPixelEvents(coachId, campaignId) {
    try {
        const campaign = await AdCampaign.findOne({ campaignId, coachId })
            .select('pixelTracking');
        
        if (!campaign) {
            return { events: [], total: 0 };
        }

        return {
            events: campaign.pixelTracking?.eventsTracked || [],
            total: campaign.pixelTracking?.totalEventsForwarded || 0,
            lastEvent: campaign.pixelTracking?.lastEventForwarded || null
        };
    } catch (error) {
        console.error('[MetaPixelService] Error getting campaign pixel events:', error);
        throw error;
    }
}

/**
 * Retry failed pixel events
 */
async function retryFailedPixelEvents(coachId, campaignId) {
    try {
        const campaign = await AdCampaign.findOne({ campaignId, coachId })
            .select('pixelTracking');
        
        if (!campaign || !campaign.pixelTracking?.pixelId) {
            return { retried: 0, failed: 0 };
        }

        const failedEvents = campaign.pixelTracking.eventsTracked.filter(
            event => !event.forwardedToMeta && !event.error
        );

        if (failedEvents.length === 0) {
            return { retried: 0, failed: 0 };
        }

        const pixelId = campaign.pixelTracking.pixelId;
        let retried = 0;
        let failed = 0;

        for (const event of failedEvents) {
            try {
                await trackPixelEvent(coachId, pixelId, {
                    eventName: event.eventName,
                    eventId: event.eventId,
                    eventTime: Math.floor(event.timestamp.getTime() / 1000),
                    userData: event.userData,
                    customData: event.customData,
                    value: event.value,
                    currency: event.currency
                }, campaignId);
                retried++;
            } catch (error) {
                failed++;
                console.error(`[MetaPixelService] Failed to retry event ${event.eventId}:`, error);
            }
        }

        return { retried, failed };
    } catch (error) {
        console.error('[MetaPixelService] Error retrying failed events:', error);
        throw error;
    }
}

module.exports = {
    trackPixelEvent,
    trackPixelEventsBatch,
    createRetargetingAudience,
    getCampaignPixelEvents,
    retryFailedPixelEvents,
    hashUserData
};
