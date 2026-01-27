const axios = require('axios');
const { AdCampaign, AdSet, AdCreative, Ad } = require('../schema');
const CoachMarketingCredentials = require('../schema/CoachMarketingCredentials');

const META_ADS_API_BASE = 'https://graph.facebook.com/v19.0';

// Helper function to get coach's Meta Ads access token
async function getCoachAccessToken(coachId) {
    try {
        // First, check if credentials exist at all
        const credentialsCheck = await CoachMarketingCredentials.findOne({ coachId })
            .select('metaAds.isConnected metaAds.appId');
        
        if (!credentialsCheck) {
            console.error(`[getCoachAccessToken] No credentials document found for coach ${coachId}`);
            throw new Error('Meta Ads credentials not found. Please connect your Meta account first.');
        }
        
        console.log(`[getCoachAccessToken] Found credentials for coach ${coachId}, isConnected: ${credentialsCheck.metaAds?.isConnected}, hasAppId: ${!!credentialsCheck.metaAds?.appId}`);
        
        // Now get the full credentials with access token
        const credentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('+metaAds.accessToken +encryptionKey +metaAds.isConnected +metaAds.appId');
        
        if (!credentials) {
            console.error(`[getCoachAccessToken] Failed to retrieve credentials with access token for coach ${coachId}`);
            throw new Error('Meta Ads credentials not found. Please connect your Meta account first.');
        }
        
        console.log(`[getCoachAccessToken] Retrieved credentials, hasAccessToken: ${!!credentials.metaAds?.accessToken}, hasEncryptionKey: ${!!credentials.encryptionKey}`);
        
        // More detailed logging
        if (credentials.metaAds) {
            console.log(`[getCoachAccessToken] metaAds object exists, isConnected: ${credentials.metaAds.isConnected}, hasAppId: ${!!credentials.metaAds.appId}, hasAccessToken: ${!!credentials.metaAds.accessToken}`);
        } else {
            console.error(`[getCoachAccessToken] metaAds object does not exist for coach ${coachId}`);
        }
        
        if (!credentials.metaAds || !credentials.metaAds.accessToken) {
            console.error(`[getCoachAccessToken] No access token found for coach ${coachId}. isConnected: ${credentials.metaAds?.isConnected}, appId: ${credentials.metaAds?.appId}`);
            
            // Try to get more info about what's in the database
            const rawCheck = await CoachMarketingCredentials.findOne({ coachId })
                .select('metaAds.isConnected metaAds.appId');
            if (rawCheck && rawCheck.metaAds) {
                console.error(`[getCoachAccessToken] Database check - isConnected: ${rawCheck.metaAds.isConnected}, hasAppId: ${!!rawCheck.metaAds.appId}`);
            }
            
            throw new Error('Meta Ads access token not found. Please reconnect your Meta account.');
        }
        
        if (!credentials.encryptionKey) {
            console.error(`[getCoachAccessToken] No encryption key found for coach ${coachId}`);
            throw new Error('Encryption key not found. Please reconnect your Meta account.');
        }
        
        const decryptedToken = credentials.getDecryptedAccessToken();
        
        if (!decryptedToken) {
            console.error(`[getCoachAccessToken] Failed to decrypt access token for coach ${coachId}`);
            throw new Error('Failed to decrypt access token. Please reconnect your Meta account.');
        }
        
        console.log(`[getCoachAccessToken] Successfully retrieved and decrypted access token for coach ${coachId}`);
        return decryptedToken;
    } catch (error) {
        console.error(`[getCoachAccessToken] Error for coach ${coachId}:`, error.message);
        throw error;
    }
}

// Helper function to get coach's Meta Ads account info
async function getCoachMetaAccountInfo(coachId) {
    const credentials = await CoachMarketingCredentials.findOne({ coachId })
        .select('metaAds.businessAccountId metaAds.adAccountId');
    
    if (!credentials) {
        throw new Error('Meta Ads account information not found for this coach');
    }
    
    return {
        businessAccountId: credentials.metaAds.businessAccountId,
        adAccountId: credentials.metaAds.adAccountId
    };
}

async function fetchCampaigns(coachId, coachMetaAccountId) {
    // Fetch campaigns for a given Meta Ad Account
    const accessToken = await getCoachAccessToken(coachId);
    const url = `${META_ADS_API_BASE}/act_${coachMetaAccountId}/campaigns?access_token=${accessToken}`;
    const { data } = await axios.get(url);
    return data;
}

async function fetchCampaignInsights(coachId, campaignId) {
    // Fetch analytics/insights for a campaign
    const accessToken = await getCoachAccessToken(coachId);
    const url = `${META_ADS_API_BASE}/${campaignId}/insights?access_token=${accessToken}`;
    const { data } = await axios.get(url);
    return data;
}

async function createCampaign(coachId, coachMetaAccountId, campaignData) {
    // Create a new campaign
    const accessToken = await getCoachAccessToken(coachId);
    const url = `${META_ADS_API_BASE}/act_${coachMetaAccountId}/campaigns?access_token=${accessToken}`;
    
    try {
        // Ensure special_ad_categories is always present (required by Meta API)
        if (!campaignData.special_ad_categories) {
            campaignData.special_ad_categories = [];
        }
        
        console.log(`[createCampaign] Creating campaign with data:`, {
            name: campaignData.name,
            objective: campaignData.objective,
            status: campaignData.status,
            daily_budget: campaignData.daily_budget,
            special_ad_categories: campaignData.special_ad_categories
        });
        
        const { data } = await axios.post(url, campaignData);
        
        // Check if we're in development/testing mode by checking app info
        try {
            const appInfo = await axios.get(`${META_ADS_API_BASE}/app?access_token=${accessToken}&fields=id,name`);
            console.log(`[createCampaign] App info:`, appInfo.data);
        } catch (appInfoError) {
            // Ignore app info errors, not critical
        }
        
        return data;
    } catch (error) {
        // Log the full error response for debugging
        console.error(`[createCampaign] Meta API error:`, {
            status: error.response?.status,
            statusText: error.response?.statusText,
            error: error.response?.data?.error,
            requestData: campaignData
        });
        
        // Check for common testing mode errors
        const errorMessage = error.response?.data?.error?.message || error.message;
        const errorCode = error.response?.data?.error?.code;
        
        // Common errors in testing mode:
        // - Invalid permissions
        // - App not in live mode
        // - Test user restrictions
        if (errorCode === 200 || errorCode === 190 || errorMessage?.includes('permission') || errorMessage?.includes('review')) {
            console.warn(`[createCampaign] Possible testing mode restriction:`, errorMessage);
            throw new Error(`Campaign creation may be limited in testing mode: ${errorMessage}. Please ensure your Meta app is in Live mode and has passed App Review for production use.`);
        }
        
        // Re-throw with more context
        const enhancedError = new Error(errorMessage || 'Failed to create campaign');
        enhancedError.response = error.response;
        enhancedError.requestData = campaignData;
        throw enhancedError;
    }
}

async function updateCampaign(coachId, campaignId, updateData) {
    // Update campaign settings
    const accessToken = await getCoachAccessToken(coachId);
    const url = `${META_ADS_API_BASE}/${campaignId}?access_token=${accessToken}`;
    const { data } = await axios.post(url, updateData);
    return data;
}

async function pauseCampaign(coachId, campaignId) {
    return updateCampaign(coachId, campaignId, { status: 'PAUSED' });
}

async function resumeCampaign(coachId, campaignId) {
    return updateCampaign(coachId, campaignId, { status: 'ACTIVE' });
}

// New methods for complete URL campaign creation
async function createAdSet(coachId, campaignId, adSetData) {
    // Create an ad set for targeting and budget
    const accessToken = await getCoachAccessToken(coachId);
    const url = `${META_ADS_API_BASE}/act_${campaignId}/adsets?access_token=${accessToken}`;
    const { data } = await axios.post(url, adSetData);
    return data;
}

async function createAdCreative(coachId, campaignId, creativeData) {
    // Create an ad creative with image and text
    const accessToken = await getCoachAccessToken(coachId);
    const url = `${META_ADS_API_BASE}/act_${campaignId}/adcreatives?access_token=${accessToken}`;
    const { data } = await axios.post(url, creativeData);
    return data;
}

async function createAd(coachId, campaignId, adData) {
    // Create an ad that combines ad set and creative
    const accessToken = await getCoachAccessToken(coachId);
    const url = `${META_ADS_API_BASE}/act_${campaignId}/ads?access_token=${accessToken}`;
    const { data } = await axios.post(url, adData);
    return data;
}

async function uploadImage(coachId, imageUrl) {
    // Upload image to Meta and get image hash
    const accessToken = await getCoachAccessToken(coachId);
    const url = `${META_ADS_API_BASE}/me/adimages?access_token=${accessToken}`;
    const { data } = await axios.post(url, { url: imageUrl });
    return data;
}

async function fetchAdSets(coachId, campaignId) {
    // Fetch ad sets for a campaign
    const accessToken = await getCoachAccessToken(coachId);
    const url = `${META_ADS_API_BASE}/${campaignId}/adsets?access_token=${accessToken}`;
    const { data } = await axios.get(url);
    return data;
}

async function fetchAdCreatives(coachId, campaignId) {
    // Fetch ad creatives for a campaign
    const accessToken = await getCoachAccessToken(coachId);
    const url = `${META_ADS_API_BASE}/${campaignId}/adcreatives?access_token=${accessToken}`;
    const { data } = await axios.get(url);
    return data;
}

async function fetchAds(coachId, campaignId) {
    // Fetch ads for a campaign
    const accessToken = await getCoachAccessToken(coachId);
    const url = `${META_ADS_API_BASE}/${campaignId}/ads?access_token=${accessToken}`;
    const { data } = await axios.get(url);
    return data;
}

async function syncCampaignsToDB(coachId, coachMetaAccountId) {
    // Fetch and upsert all campaigns for a coach
    const campaigns = await fetchCampaigns(coachId, coachMetaAccountId);
    for (const c of campaigns.data) {
        await AdCampaign.findOneAndUpdate(
            { campaignId: c.id, coachId },
            { name: c.name, status: c.status, objective: c.objective, lastSynced: new Date(), metaRaw: c },
            { upsert: true, new: true }
        );
    }
    return campaigns.data.length;
}

// ===== ANDROMEDA ADS SUPPORT =====

/**
 * Create Andromeda ad creative (advanced Meta ad format)
 * @param {String} coachId - Coach ID
 * @param {String} adAccountId - Ad account ID
 * @param {Object} andromedaData - Andromeda ad configuration
 */
async function createAndromedaAdCreative(coachId, adAccountId, andromedaData) {
    try {
        const accessToken = await getCoachAccessToken(coachId);
        const {
            format = 'single_image',
            creativeType = 'image',
            name,
            imageUrls = [],
            videoId = null,
            headline,
            description,
            callToAction = 'LEARN_MORE',
            linkUrl,
            dynamicProductAds = false,
            catalogId = null,
            productSetId = null,
            carouselSettings = {},
            interactiveElements = {}
        } = andromedaData;

        let creativePayload = {
            name: name || `Andromeda Ad - ${new Date().toISOString()}`,
            object_story_spec: {}
        };

        // Handle different Andromeda formats
        switch (format) {
            case 'single_image':
                if (imageUrls.length === 0) {
                    throw new Error('At least one image URL is required for single_image format');
                }
                creativePayload.object_story_spec = {
                    page_id: await getPageId(coachId, adAccountId),
                    link_data: {
                        image_url: imageUrls[0],
                        link: linkUrl,
                        message: description,
                        name: headline,
                        call_to_action: {
                            type: callToAction
                        }
                    }
                };
                break;

            case 'single_video':
                if (!videoId) {
                    throw new Error('Video ID is required for single_video format');
                }
                creativePayload.object_story_spec = {
                    page_id: await getPageId(coachId, adAccountId),
                    video_id: videoId,
                    link_data: {
                        link: linkUrl,
                        message: description,
                        name: headline,
                        call_to_action: {
                            type: callToAction
                        }
                    }
                };
                break;

            case 'carousel':
                if (imageUrls.length < 2) {
                    throw new Error('At least 2 images are required for carousel format');
                }
                const carouselCards = imageUrls.slice(0, carouselSettings.maxCards || 10).map((imageUrl, index) => ({
                    link: linkUrl,
                    name: `${headline} - Card ${index + 1}`,
                    description: description,
                    image_url: imageUrl
                }));

                creativePayload.object_story_spec = {
                    page_id: await getPageId(coachId, adAccountId),
                    link_data: {
                        link: linkUrl,
                        message: description,
                        name: headline,
                        child_attachments: carouselCards,
                        call_to_action: {
                            type: callToAction
                        }
                    }
                };
                break;

            case 'collection':
                if (!catalogId) {
                    throw new Error('Catalog ID is required for collection format');
                }
                creativePayload.object_story_spec = {
                    page_id: await getPageId(coachId, adAccountId),
                    collection_data: {
                        collection_thumbnail_url: imageUrls[0],
                        image_urls: imageUrls,
                        link: linkUrl,
                        name: headline,
                        description: description
                    }
                };
                break;

            case 'dynamic':
                if (!dynamicProductAds || !catalogId) {
                    throw new Error('Dynamic product ads require catalogId and dynamicProductAds enabled');
                }
                creativePayload.object_story_spec = {
                    page_id: await getPageId(coachId, adAccountId),
                    product_set_id: productSetId,
                    link_data: {
                        link: linkUrl,
                        message: description,
                        name: headline,
                        call_to_action: {
                            type: callToAction
                        }
                    }
                };
                break;

            default:
                throw new Error(`Unsupported Andromeda format: ${format}`);
        }

        // Add interactive elements if enabled
        if (interactiveElements.pollEnabled || interactiveElements.quizEnabled || interactiveElements.countdownEnabled) {
            creativePayload.object_story_spec.interactive_components = {};
            if (interactiveElements.pollEnabled) {
                creativePayload.object_story_spec.interactive_components.poll = interactiveElements.pollData;
            }
            if (interactiveElements.quizEnabled) {
                creativePayload.object_story_spec.interactive_components.quiz = interactiveElements.quizData;
            }
            if (interactiveElements.countdownEnabled) {
                creativePayload.object_story_spec.interactive_components.countdown = interactiveElements.countdownData;
            }
        }

        const url = `${META_ADS_API_BASE}/act_${adAccountId}/adcreatives?access_token=${accessToken}`;
        const { data } = await axios.post(url, creativePayload);

        return {
            success: true,
            creativeId: data.id,
            creative: data
        };
    } catch (error) {
        console.error('[metaAdsService] Error creating Andromeda ad creative:', error);
        throw error;
    }
}

/**
 * Create ad set with pixel tracking and retargeting
 */
async function createAdSetWithPixel(coachId, campaignId, adSetData, pixelSettings = {}) {
    try {
        const accessToken = await getCoachAccessToken(coachId);
        
        // Prepare ad set data
        let enhancedAdSetData = { ...adSetData };

        // Add pixel tracking if configured
        if (pixelSettings.pixelId) {
            enhancedAdSetData.pixel_id = pixelSettings.pixelId;
        }

        // Add conversion events if specified
        if (pixelSettings.conversionEvents && pixelSettings.conversionEvents.length > 0) {
            enhancedAdSetData.promoted_object = {
                pixel_id: pixelSettings.pixelId,
                custom_event_type: pixelSettings.conversionEvents[0].eventName
            };
        }

        // Add retargeting audience if enabled
        if (pixelSettings.retargetingAudience?.enabled && pixelSettings.retargetingAudience?.audienceId) {
            if (!enhancedAdSetData.targeting) {
                enhancedAdSetData.targeting = {};
            }
            if (!enhancedAdSetData.targeting.custom_audiences) {
                enhancedAdSetData.targeting.custom_audiences = [];
            }
            enhancedAdSetData.targeting.custom_audiences.push({
                id: pixelSettings.retargetingAudience.audienceId
            });
        }

        const url = `${META_ADS_API_BASE}/act_${campaignId}/adsets?access_token=${accessToken}`;
        const { data } = await axios.post(url, enhancedAdSetData);

        return data;
    } catch (error) {
        console.error('[metaAdsService] Error creating ad set with pixel:', error);
        throw error;
    }
}

/**
 * Helper to get page ID for ad account
 */
async function getPageId(coachId, adAccountId) {
    try {
        const accessToken = await getCoachAccessToken(coachId);
        const url = `${META_ADS_API_BASE}/act_${adAccountId}?access_token=${accessToken}&fields=page_id`;
        const { data } = await axios.get(url);
        return data.page_id;
    } catch (error) {
        console.error('[metaAdsService] Error getting page ID:', error);
        // Return a default or throw based on requirements
        throw new Error('Unable to retrieve page ID for ad account');
    }
}

// Exports will be at the end of file

// New method for complete URL campaign creation
async function createCompleteUrlCampaign(coachId, campaignData, adSetData, creativeData, adData) {
    try {
        // Step 1: Create campaign
        const campaign = await createCampaign(coachId, campaignData.coachMetaAccountId, campaignData);
        
        // Step 2: Create ad set
        const adSet = await createAdSet(coachId, campaign.id, adSetData);
        
        // Step 3: Create ad creative
        const creative = await createAdCreative(coachId, campaign.id, creativeData);
        
        // Step 4: Create ad
        const ad = await createAd(coachId, campaign.id, {
            ...adData,
            adset_id: adSet.id,
            creative: { creative_id: creative.id }
        });
        
        return {
            campaign,
            adSet,
            creative,
            ad
        };
    } catch (error) {
        throw new Error(`Failed to create complete URL campaign: ${error.message}`);
    }
}

// Verify coach's Meta Ads credentials
async function verifyCoachCredentials(coachId) {
    try {
        const credentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('+metaAds.accessToken +encryptionKey');
        
        if (!credentials || !credentials.metaAds.accessToken) {
            return false;
        }
        
        const accessToken = credentials.getDecryptedAccessToken();
        const response = await axios.get(`${META_ADS_API_BASE}/me?access_token=${accessToken}`);
        
        return response.status === 200;
    } catch (error) {
        return false;
    }
}

module.exports = {
    getCoachAccessToken,
    getCoachMetaAccountInfo,
    fetchCampaigns,
    fetchCampaignInsights,
    createCampaign,
    updateCampaign,
    pauseCampaign,
    resumeCampaign,
    createAdSet,
    createAdSetWithPixel,
    createAdCreative,
    createAndromedaAdCreative,
    createAd,
    uploadImage,
    fetchAdSets,
    fetchAdCreatives,
    fetchAds,
    syncCampaignsToDB,
    createCompleteUrlCampaign,
    verifyCoachCredentials
};
