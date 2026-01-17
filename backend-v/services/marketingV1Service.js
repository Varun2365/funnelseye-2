// D:\PRJ_YCT_Final\services\marketingV1Service.js

const axios = require('axios');
const CoachMarketingCredentials = require('../schema/CoachMarketingCredentials');
const { AdCampaign, AdSet, AdCreative, Ad } = require('../schema');
const crypto = require('crypto');

const META_ADS_API_BASE = 'https://graph.facebook.com/v19.0';

// ===== CREDENTIALS MANAGEMENT =====

/**
 * Setup Meta API credentials for a coach
 */
async function setupMetaCredentials(coachId, credentials) {
    const {
        accessToken,
        appId,
        appSecret,
        businessAccountId,
        adAccountId,
        facebookPageId,
        instagramAccountId
    } = credentials;

    // Check if credentials already exist
    let coachCredentials = await CoachMarketingCredentials.findOne({ coachId })
        .select('+encryptionKey +metaAds.accessToken +metaAds.appSecret');
    
    if (!coachCredentials) {
        // Create new credentials record
        const encryptionKey = crypto.randomBytes(32).toString('hex');
        coachCredentials = new CoachMarketingCredentials({
            coachId,
            encryptionKey,
            updatedBy: coachId
        });
    } else {
        // COMPLETELY CLEAR ALL PREVIOUS META CREDENTIALS BEFORE SETTING NEW ONES
        // This ensures no old/corrupted tokens remain
        console.log(`[MetaCredentials] 🧹 COMPLETELY CLEARING all previous Meta credentials for coach ${coachId}`);
        console.log(`[MetaCredentials] Old token exists: ${!!coachCredentials.metaAds?.accessToken}`);
        console.log(`[MetaCredentials] Old appId: ${coachCredentials.metaAds?.appId || 'none'}`);
        console.log(`[MetaCredentials] Old adAccountId: ${coachCredentials.metaAds?.adAccountId || 'none'}`);
        
        // Completely reset metaAds object
        coachCredentials.metaAds = {
            accessToken: null,
            appId: null,
            appSecret: null,
            businessAccountId: null,
            adAccountId: null,
            facebookPageId: null,
            instagramAccountId: null,
            isConnected: false,
            lastVerified: null,
            permissions: []
        };
        
        // Mark the entire metaAds object as modified to ensure Mongoose saves the cleared state
        coachCredentials.markModified('metaAds');
        
        // Ensure encryption key exists (generate new one if missing)
        if (!coachCredentials.encryptionKey) {
            console.warn(`[MetaCredentials] No encryption key found for coach ${coachId}, generating new one`);
            coachCredentials.encryptionKey = crypto.randomBytes(32).toString('hex');
        }
        
        // Save the cleared state first to ensure old tokens are completely removed
        try {
            await coachCredentials.save();
            console.log(`[MetaCredentials] ✅ Successfully cleared all old Meta credentials`);
        } catch (clearError) {
            console.error(`[MetaCredentials] Error clearing old credentials:`, clearError);
            // Continue anyway - we'll overwrite with new credentials
        }
        
        // Re-fetch to ensure we have a clean state
        coachCredentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('+encryptionKey');
        
        if (!coachCredentials) {
            throw new Error('Failed to retrieve credentials after clearing');
        }
        
        // Re-initialize metaAds as empty
        coachCredentials.metaAds = {
            accessToken: null,
            appId: null,
            appSecret: null,
            businessAccountId: null,
            adAccountId: null,
            facebookPageId: null,
            instagramAccountId: null,
            isConnected: false,
            lastVerified: null,
            permissions: []
        };
    }

    // Always set updatedBy when updating credentials
    coachCredentials.updatedBy = coachId;
    coachCredentials.lastUpdated = new Date();

    // Mark as connected immediately if we have accessToken and appId
    // This ensures the UI shows it as connected right away, even before verification
    const shouldBeConnected = !!(accessToken && appId);
    
    console.log(`[MetaCredentials] 🆕 Setting fresh Meta credentials for coach ${coachId}`);
    
    // Update Meta credentials - merge instead of replace to preserve existing fields
    if (accessToken) {
        // Always encrypt the token - never store plain text tokens
        // Clear any old token first to avoid conflicts
        try {
            console.log(`[MetaCredentials] Encrypting access token for coach ${coachId}, token length: ${accessToken.length}`);
            
            // Validate token is not empty
            if (!accessToken || accessToken.trim().length === 0) {
                throw new Error('Access token is empty');
            }
            
            // Always encrypt - don't check if it's already encrypted
            // This ensures we use the current encryption key
            const encryptedToken = coachCredentials.encrypt(accessToken);
            if (!encryptedToken) {
                throw new Error('Failed to encrypt access token - encrypt() returned null');
            }
            
            if (encryptedToken.length < 64) {
                throw new Error(`Encrypted token is too short (${encryptedToken.length}), encryption may have failed`);
            }
            
            coachCredentials.metaAds.accessToken = encryptedToken;
            console.log(`[MetaCredentials] Access token encrypted successfully, encrypted length: ${encryptedToken.length}`);
            
            // Mark as modified to ensure Mongoose saves it
            coachCredentials.markModified('metaAds');
            coachCredentials.markModified('metaAds.accessToken');
        } catch (encryptError) {
            console.error(`[MetaCredentials] Error encrypting access token for coach ${coachId}:`, encryptError);
            console.error(`[MetaCredentials] Error stack:`, encryptError.stack);
            throw new Error(`Failed to encrypt access token: ${encryptError.message}`);
        }
    }
    if (appId) {
        coachCredentials.metaAds.appId = appId;
    }
    if (appSecret) {
        coachCredentials.metaAds.appSecret = appSecret;
    }
    if (businessAccountId) {
        coachCredentials.metaAds.businessAccountId = businessAccountId;
    }
    if (adAccountId) {
        coachCredentials.metaAds.adAccountId = adAccountId;
    }
    if (facebookPageId) {
        coachCredentials.metaAds.facebookPageId = facebookPageId;
    }
    if (instagramAccountId) {
        coachCredentials.metaAds.instagramAccountId = instagramAccountId;
    }
    
    // Set connection status
    coachCredentials.metaAds.isConnected = shouldBeConnected;
    if (shouldBeConnected) {
        coachCredentials.metaAds.lastVerified = new Date();
    }
    
    // Preserve existing permissions if they exist
    if (!coachCredentials.metaAds.permissions) {
        coachCredentials.metaAds.permissions = [];
    }

    // Save first with isConnected already set
    console.log(`[MetaCredentials] About to save credentials for coach ${coachId}`);
    console.log(`[MetaCredentials] Has encryptionKey: ${!!coachCredentials.encryptionKey}`);
    console.log(`[MetaCredentials] Has accessToken before save: ${!!coachCredentials.metaAds?.accessToken}`);
    if (coachCredentials.metaAds?.accessToken) {
        console.log(`[MetaCredentials] accessToken length: ${coachCredentials.metaAds.accessToken.length}`);
        console.log(`[MetaCredentials] accessToken preview (first 30 chars): ${coachCredentials.metaAds.accessToken.substring(0, 30)}...`);
    }
    
    try {
        await coachCredentials.save();
        console.log(`[MetaCredentials] Credentials saved successfully for coach ${coachId}, isConnected: ${coachCredentials.metaAds.isConnected}`);
    } catch (saveError) {
        console.error(`[MetaCredentials] Error saving credentials for coach ${coachId}:`, saveError);
        throw saveError;
    }
    
    // Verify the token was actually saved and can be decrypted
    const verificationCheck = await CoachMarketingCredentials.findOne({ coachId })
        .select('+metaAds.accessToken +encryptionKey');
    if (verificationCheck && verificationCheck.metaAds && verificationCheck.metaAds.accessToken) {
        console.log(`[MetaCredentials] Verified: Access token was saved successfully for coach ${coachId}`);
        console.log(`[MetaCredentials] Encrypted token length: ${verificationCheck.metaAds.accessToken.length}`);
        
        try {
            const testDecrypt = verificationCheck.getDecryptedAccessToken();
            if (testDecrypt) {
                console.log(`[MetaCredentials] ✅ SUCCESS: Access token can be decrypted successfully for coach ${coachId}`);
                console.log(`[MetaCredentials] Decrypted token length: ${testDecrypt.length}`);
                console.log(`[MetaCredentials] Decrypted token preview: ${testDecrypt.substring(0, 20)}...`);
            } else {
                console.error(`[MetaCredentials] ❌ WARNING: Access token exists but cannot be decrypted for coach ${coachId}`);
                console.error(`[MetaCredentials] Has encryptionKey: ${!!verificationCheck.encryptionKey}`);
                console.error(`[MetaCredentials] EncryptionKey length: ${verificationCheck.encryptionKey?.length || 0}`);
                throw new Error('Access token was saved but cannot be decrypted. Encryption key may be missing or incorrect.');
            }
        } catch (decryptError) {
            console.error(`[MetaCredentials] ❌ ERROR: Failed to decrypt access token:`, decryptError);
            throw new Error(`Access token decryption failed: ${decryptError.message}`);
        }
    } else {
        console.error(`[MetaCredentials] ❌ ERROR: Access token was NOT saved for coach ${coachId}`);
        if (verificationCheck) {
            console.error(`[MetaCredentials] Verification check - has metaAds: ${!!verificationCheck.metaAds}`);
            console.error(`[MetaCredentials] Verification check - has accessToken: ${!!verificationCheck.metaAds?.accessToken}`);
        }
        throw new Error('Access token was not saved to database');
    }
    
    // Verify credentials in background (but don't fail if verification doesn't work immediately)
    // This is just to test the token, but we already marked it as connected
    if (shouldBeConnected) {
        try {
            const verificationResult = await verifyMetaCredentials(coachId);
            
            if (verificationResult && verificationResult.isValid) {
                // Update last verified timestamp (isConnected already true)
                coachCredentials.metaAds.lastVerified = new Date();
                await coachCredentials.save();
                console.log(`[MetaCredentials] Verification successful for coach ${coachId}`);
            } else {
                console.warn(`[MetaCredentials] Verification failed for coach ${coachId}:`, verificationResult?.error || 'Unknown error');
                // Keep isConnected as true since we already set it above
            }
        } catch (verifyError) {
            console.error(`[MetaCredentials] Error during verification for coach ${coachId}:`, verifyError);
            // Keep isConnected as true since we already set it above
        }
    }

    return {
        isConnected: coachCredentials.metaAds.isConnected,
        lastVerified: coachCredentials.metaAds.lastVerified,
        businessAccountId: coachCredentials.metaAds.businessAccountId,
        adAccountId: coachCredentials.metaAds.adAccountId
    };
}

/**
 * Verify Meta API credentials
 */
async function verifyMetaCredentials(coachId) {
    try {
        const credentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('+metaAds.accessToken +encryptionKey');
        
        if (!credentials || !credentials.metaAds.accessToken) {
            return { isValid: false, error: 'No Meta credentials found' };
        }

        const accessToken = credentials.getDecryptedAccessToken();
        
        // Test API access
        const response = await axios.get(`${META_ADS_API_BASE}/me`, {
            params: { access_token: accessToken }
        });

        if (response.status === 200) {
            // Update verification status
            credentials.metaAds.isConnected = true;
            credentials.metaAds.lastVerified = new Date();
            await credentials.save();

            return { 
                isValid: true, 
                userInfo: response.data,
                lastVerified: credentials.metaAds.lastVerified
            };
        }

        return { isValid: false, error: 'Invalid access token' };
    } catch (error) {
        return { 
            isValid: false, 
            error: error.response?.data?.error?.message || error.message 
        };
    }
}

/**
 * Get Meta account information
 */
async function getMetaAccountInfo(coachId) {
    try {
        const credentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('+metaAds.accessToken +encryptionKey');
        
        if (!credentials || !credentials.metaAds.accessToken) {
            throw new Error('Meta credentials not found');
        }

        const accessToken = credentials.getDecryptedAccessToken();
        
        // Get user info
        const userResponse = await axios.get(`${META_ADS_API_BASE}/me`, {
            params: { access_token: accessToken }
        });

        // Get ad accounts
        const adAccountsResponse = await axios.get(`${META_ADS_API_BASE}/me/adaccounts`, {
            params: { 
                access_token: accessToken,
                fields: 'id,name,account_status,currency,timezone_name'
            }
        });

        // Get business accounts
        const businessAccountsResponse = await axios.get(`${META_ADS_API_BASE}/me/businesses`, {
            params: { 
                access_token: accessToken,
                fields: 'id,name,primary_page'
            }
        });

        return {
            user: userResponse.data,
            adAccounts: adAccountsResponse.data.data,
            businessAccounts: businessAccountsResponse.data.data,
            connectedAccount: {
                businessAccountId: credentials.metaAds.businessAccountId,
                adAccountId: credentials.metaAds.adAccountId,
                facebookPageId: credentials.metaAds.facebookPageId,
                instagramAccountId: credentials.metaAds.instagramAccountId
            }
        };
    } catch (error) {
        throw new Error(`Failed to get Meta account info: ${error.message}`);
    }
}

/**
 * Setup OpenAI credentials
 */
async function setupOpenAICredentials(coachId, credentials) {
    const { apiKey, modelPreference } = credentials;

    let coachCredentials = await CoachMarketingCredentials.findOne({ coachId });
    
    if (!coachCredentials) {
        const encryptionKey = crypto.randomBytes(32).toString('hex');
        coachCredentials = new CoachMarketingCredentials({
            coachId,
            encryptionKey,
            updatedBy: coachId
        });
    }

    coachCredentials.openAI = {
        apiKey,
        modelPreference,
        isConnected: false,
        lastVerified: null
    };

    // Verify credentials
    const isValid = await verifyOpenAICredentials(coachId);
    
    if (isValid) {
        coachCredentials.openAI.isConnected = true;
        coachCredentials.openAI.lastVerified = new Date();
    }

    await coachCredentials.save();

    return {
        isConnected: coachCredentials.openAI.isConnected,
        lastVerified: coachCredentials.openAI.lastVerified,
        modelPreference: coachCredentials.openAI.modelPreference
    };
}

/**
 * Verify OpenAI credentials
 */
async function verifyOpenAICredentials(coachId) {
    try {
        const credentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('+openAI.apiKey +encryptionKey');
        
        if (!credentials || !credentials.openAI.apiKey) {
            return { isValid: false, error: 'No OpenAI credentials found' };
        }

        const apiKey = credentials.getDecryptedOpenAIKey();
        
        const response = await axios.get('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (response.status === 200) {
            credentials.openAI.isConnected = true;
            credentials.openAI.lastVerified = new Date();
            await credentials.save();

            return { 
                isValid: true, 
                models: response.data.data,
                lastVerified: credentials.openAI.lastVerified
            };
        }

        return { isValid: false, error: 'Invalid API key' };
    } catch (error) {
        return { 
            isValid: false, 
            error: error.response?.data?.error?.message || error.message 
        };
    }
}

/**
 * Get credentials status
 */
async function getCredentialsStatus(coachId) {
    try {
        console.log(`[CredentialsStatus] Fetching status for coach ${coachId}`);
        const credentials = await CoachMarketingCredentials.findOne({ coachId });
        
        if (!credentials) {
            console.log(`[CredentialsStatus] No credentials found for coach ${coachId}`);
            return {
                meta: { 
                    isConnected: false, 
                    hasCredentials: false,
                    isConfigured: false
                },
                openai: { 
                    isConnected: false, 
                    hasCredentials: false 
                },
                setupComplete: false
            };
        }

        // Check if credentials exist - if they do, mark as connected even if verification hasn't run yet
        const hasAccessToken = !!credentials.metaAds?.accessToken;
        const hasAppId = !!credentials.metaAds?.appId;
        const isConfigured = hasAccessToken && hasAppId;
        
        // If we have credentials, consider it connected (verification can happen later)
        const isConnected = credentials.metaAds?.isConnected || (isConfigured && hasAccessToken);
        
        const metaStatus = {
            isConnected: isConnected,
            hasCredentials: hasAccessToken,
            isConfigured: isConfigured,
            lastVerified: credentials.metaAds?.lastVerified || null,
            businessAccountId: credentials.metaAds?.businessAccountId || null,
            adAccountId: credentials.metaAds?.adAccountId || null
        };

        console.log(`[CredentialsStatus] Meta status for coach ${coachId}:`, {
            isConnected: metaStatus.isConnected,
            hasCredentials: metaStatus.hasCredentials,
            isConfigured: metaStatus.isConfigured,
            hasAccessToken: hasAccessToken,
            hasAppId: hasAppId,
            rawIsConnected: credentials.metaAds?.isConnected
        });

        return {
            meta: metaStatus,
            openai: {
                isConnected: credentials.openAI?.isConnected || false,
                hasCredentials: !!credentials.openAI?.apiKey,
                lastVerified: credentials.openAI?.lastVerified || null,
                modelPreference: credentials.openAI?.modelPreference || 'gpt-4'
            },
            setupComplete: (credentials.metaAds?.isConnected || false) && (credentials.openAI?.isConnected || false)
        };
    } catch (error) {
        console.error(`[CredentialsStatus] Error getting credentials status for coach ${coachId}:`, error);
        return {
            meta: { 
                isConnected: false, 
                hasCredentials: false,
                isConfigured: false
            },
            openai: { 
                isConnected: false, 
                hasCredentials: false 
            },
            setupComplete: false
        };
    }
}

// ===== CAMPAIGN ANALYSIS & MANAGEMENT =====

/**
 * Get comprehensive campaign analysis
 */
async function getCampaignAnalysis(coachId, options) {
    const { dateRange, campaignIds, includeInsights, includeRecommendations } = options;
    
    try {
        // First, try to get campaigns from local database
        const localCampaigns = await AdCampaign.find({ coachId });
        
        // If we have local campaigns, use them
        if (localCampaigns && localCampaigns.length > 0) {
            const filteredCampaigns = campaignIds.length > 0 
                ? localCampaigns.filter(c => campaignIds.includes(c.campaignId))
                : localCampaigns;

            const analysis = {
                summary: {
                    totalCampaigns: filteredCampaigns.length,
                    activeCampaigns: filteredCampaigns.filter(c => c.status === 'ACTIVE').length,
                    pausedCampaigns: filteredCampaigns.filter(c => c.status === 'PAUSED').length,
                    dateRange,
                    overallMetrics: {
                        totalImpressions: filteredCampaigns.reduce((sum, c) => sum + (parseFloat(c.impressions) || 0), 0),
                        totalClicks: filteredCampaigns.reduce((sum, c) => sum + (parseFloat(c.clicks) || 0), 0),
                        totalSpend: filteredCampaigns.reduce((sum, c) => sum + (parseFloat(c.totalSpent) || 0), 0),
                        totalConversions: filteredCampaigns.reduce((sum, c) => sum + (parseFloat(c.conversions) || 0), 0)
                    }
                },
                campaigns: filteredCampaigns.map(campaign => ({
                    id: campaign.campaignId || campaign._id,
                    name: campaign.name,
                    status: campaign.status,
                    objective: campaign.objective,
                    insights: includeInsights ? {
                        impressions: campaign.impressions || 0,
                        clicks: campaign.clicks || 0,
                        spend: campaign.totalSpent || 0,
                        conversions: campaign.conversions || 0,
                        ctr: campaign.impressions > 0 ? ((campaign.clicks || 0) / campaign.impressions * 100).toFixed(2) : '0.00',
                        cpc: campaign.clicks > 0 ? ((campaign.totalSpent || 0) / campaign.clicks).toFixed(2) : '0.00'
                    } : null
                }))
            };

            return analysis;
        }
        
        // If no local campaigns, try to fetch from Meta API if credentials exist
        const credentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('+metaAds.accessToken +encryptionKey');
        
        if (!credentials || !credentials.metaAds.accessToken) {
            // Return empty analysis if no credentials
            return {
                summary: {
                    totalCampaigns: 0,
                    activeCampaigns: 0,
                    pausedCampaigns: 0,
                    dateRange,
                    overallMetrics: {
                        totalImpressions: 0,
                        totalClicks: 0,
                        totalSpend: 0,
                        totalConversions: 0
                    }
                },
                campaigns: []
            };
        }

        const accessToken = credentials.getDecryptedAccessToken();
        const adAccountId = credentials.metaAds.adAccountId;
        
        if (!adAccountId) {
            // Return empty analysis if no ad account
            return {
                summary: {
                    totalCampaigns: 0,
                    activeCampaigns: 0,
                    pausedCampaigns: 0,
                    dateRange,
                    overallMetrics: {
                        totalImpressions: 0,
                        totalClicks: 0,
                        totalSpend: 0,
                        totalConversions: 0
                    }
                },
                campaigns: []
            };
        }

        // Get campaigns from Meta API
        const campaignsResponse = await axios.get(`${META_ADS_API_BASE}/act_${adAccountId}/campaigns`, {
            params: {
                access_token: accessToken,
                fields: 'id,name,status,objective,created_time,updated_time',
                limit: 100
            }
        });

        const campaigns = campaignsResponse.data.data || [];
        const filteredCampaigns = campaignIds.length > 0 
            ? campaigns.filter(c => campaignIds.includes(c.id))
            : campaigns;

        // Get insights for each campaign
        const analysis = {
            summary: {
                totalCampaigns: filteredCampaigns.length,
                activeCampaigns: filteredCampaigns.filter(c => c.status === 'ACTIVE').length,
                pausedCampaigns: filteredCampaigns.filter(c => c.status === 'PAUSED').length,
                dateRange,
                overallMetrics: {
                    totalImpressions: 0,
                    totalClicks: 0,
                    totalSpend: 0,
                    totalConversions: 0
                }
            },
            campaigns: []
        };

        for (const campaign of filteredCampaigns) {
            const campaignData = {
                id: campaign.id,
                name: campaign.name,
                status: campaign.status,
                objective: campaign.objective,
                createdTime: campaign.created_time,
                updatedTime: campaign.updated_time
            };

            if (includeInsights) {
                try {
                    const insightsResponse = await axios.get(`${META_ADS_API_BASE}/${campaign.id}/insights`, {
                        params: {
                            access_token: accessToken,
                            date_preset: dateRange,
                            fields: 'impressions,clicks,spend,ctr,cpc,cpm,conversions,conversion_rate'
                        }
                    });

                    campaignData.insights = insightsResponse.data.data[0] || {};
                } catch (error) {
                    campaignData.insights = null;
                    campaignData.insightsError = error.message;
                }
            }

            analysis.campaigns.push(campaignData);
        }

        // Calculate overall performance metrics
        const campaignsWithInsights = analysis.campaigns.filter(c => c.insights);
        if (campaignsWithInsights.length > 0) {
            analysis.summary.overallMetrics = {
                totalImpressions: campaignsWithInsights.reduce((sum, c) => sum + (parseInt(c.insights.impressions) || 0), 0),
                totalClicks: campaignsWithInsights.reduce((sum, c) => sum + (parseInt(c.insights.clicks) || 0), 0),
                totalSpend: campaignsWithInsights.reduce((sum, c) => sum + (parseFloat(c.insights.spend) || 0), 0),
                totalConversions: campaignsWithInsights.reduce((sum, c) => sum + (parseInt(c.insights.conversions) || 0), 0),
                averageCTR: campaignsWithInsights.reduce((sum, c) => sum + (parseFloat(c.insights.ctr) || 0), 0) / campaignsWithInsights.length,
                averageCPC: campaignsWithInsights.reduce((sum, c) => sum + (parseFloat(c.insights.cpc) || 0), 0) / campaignsWithInsights.length
            };
        } else {
            analysis.summary.overallMetrics = {
                totalImpressions: 0,
                totalClicks: 0,
                totalSpend: 0,
                totalConversions: 0,
                averageCTR: 0,
                averageCPC: 0
            };
        }

        return analysis;
    } catch (error) {
        throw new Error(`Failed to get campaign analysis: ${error.message}`);
    }
}

/**
 * Get detailed campaign insights
 */
async function getCampaignInsights(coachId, campaignId, options) {
    const { dateRange, breakdown, includeDemographics, includePlacements } = options;
    
    try {
        const credentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('+metaAds.accessToken +encryptionKey');
        
        if (!credentials || !credentials.metaAds.accessToken) {
            throw new Error('Meta credentials not found');
        }

        const accessToken = credentials.getDecryptedAccessToken();
        
        // Get basic insights
        const insightsResponse = await axios.get(`${META_ADS_API_BASE}/${campaignId}/insights`, {
            params: {
                access_token: accessToken,
                date_preset: dateRange,
                level: breakdown,
                fields: 'impressions,clicks,spend,ctr,cpc,cpm,conversions,conversion_rate,reach,frequency'
            }
        });

        const insights = {
            basic: insightsResponse.data.data[0] || {},
            demographics: null,
            placements: null
        };

        // Get demographic insights if requested
        if (includeDemographics) {
            try {
                const demographicsResponse = await axios.get(`${META_ADS_API_BASE}/${campaignId}/insights`, {
                    params: {
                        access_token: accessToken,
                        date_preset: dateRange,
                        breakdowns: 'age,gender',
                        fields: 'impressions,clicks,spend,ctr,cpc,cpm,conversions'
                    }
                });
                insights.demographics = demographicsResponse.data.data;
            } catch (error) {
                insights.demographicsError = error.message;
            }
        }

        // Get placement insights if requested
        if (includePlacements) {
            try {
                const placementsResponse = await axios.get(`${META_ADS_API_BASE}/${campaignId}/insights`, {
                    params: {
                        access_token: accessToken,
                        date_preset: dateRange,
                        breakdowns: 'publisher_platform,placement',
                        fields: 'impressions,clicks,spend,ctr,cpc,cpm,conversions'
                    }
                });
                insights.placements = placementsResponse.data.data;
            } catch (error) {
                insights.placementsError = error.message;
            }
        }

        return insights;
    } catch (error) {
        throw new Error(`Failed to get campaign insights: ${error.message}`);
    }
}

/**
 * Get campaign metrics
 */
async function getCampaignMetrics(coachId, campaignId, options) {
    const { dateRange, metrics } = options;
    
    try {
        const credentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('+metaAds.accessToken +encryptionKey');
        
        if (!credentials || !credentials.metaAds.accessToken) {
            throw new Error('Meta credentials not found');
        }

        const accessToken = credentials.getDecryptedAccessToken();
        
        const response = await axios.get(`${META_ADS_API_BASE}/${campaignId}/insights`, {
            params: {
                access_token: accessToken,
                date_preset: dateRange,
                fields: metrics.join(',')
            }
        });

        return {
            campaignId,
            dateRange,
            metrics: response.data.data[0] || {},
            timestamp: new Date()
        };
    } catch (error) {
        throw new Error(`Failed to get campaign metrics: ${error.message}`);
    }
}

/**
 * Get campaign audience insights
 */
async function getCampaignAudienceInsights(coachId, campaignId, options) {
    const { dateRange } = options;
    
    try {
        const credentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('+metaAds.accessToken +encryptionKey');
        
        if (!credentials || !credentials.metaAds.accessToken) {
            throw new Error('Meta credentials not found');
        }

        const accessToken = credentials.getDecryptedAccessToken();
        
        // Get audience insights
        const response = await axios.get(`${META_ADS_API_BASE}/${campaignId}/insights`, {
            params: {
                access_token: accessToken,
                date_preset: dateRange,
                breakdowns: 'age,gender,country,region',
                fields: 'impressions,clicks,spend,ctr,cpc,cpm,conversions'
            }
        });

        return {
            campaignId,
            dateRange,
            audienceInsights: response.data.data,
            timestamp: new Date()
        };
    } catch (error) {
        throw new Error(`Failed to get audience insights: ${error.message}`);
    }
}

/**
 * Get campaign recommendations
 */
async function getCampaignRecommendations(coachId, campaignId, options) {
    const { includeAIRecommendations } = options;
    
    try {
        const credentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('+metaAds.accessToken +encryptionKey');
        
        if (!credentials || !credentials.metaAds.accessToken) {
            throw new Error('Meta credentials not found');
        }

        const accessToken = credentials.getDecryptedAccessToken();
        
        // Get campaign insights for recommendations
        const insightsResponse = await axios.get(`${META_ADS_API_BASE}/${campaignId}/insights`, {
            params: {
                access_token: accessToken,
                date_preset: 'last_30d',
                fields: 'impressions,clicks,spend,ctr,cpc,cpm,conversions,conversion_rate'
            }
        });

        const insights = insightsResponse.data.data[0] || {};
        
        // Generate basic recommendations based on performance
        const recommendations = [];
        
        if (insights.ctr && parseFloat(insights.ctr) < 1.0) {
            recommendations.push({
                type: 'performance',
                priority: 'high',
                title: 'Low Click-Through Rate',
                description: 'Your CTR is below 1%. Consider improving ad creative or targeting.',
                action: 'Review ad creative and audience targeting'
            });
        }

        if (insights.cpc && parseFloat(insights.cpc) > 2.0) {
            recommendations.push({
                type: 'cost',
                priority: 'medium',
                title: 'High Cost Per Click',
                description: 'Your CPC is above $2. Consider optimizing bidding strategy.',
                action: 'Review bidding strategy and audience targeting'
            });
        }

        if (insights.conversion_rate && parseFloat(insights.conversion_rate) < 2.0) {
            recommendations.push({
                type: 'conversion',
                priority: 'high',
                title: 'Low Conversion Rate',
                description: 'Your conversion rate is below 2%. Consider improving landing page or targeting.',
                action: 'Review landing page and audience targeting'
            });
        }

        const result = {
            campaignId,
            recommendations,
            insights,
            timestamp: new Date()
        };

        // Add AI recommendations if requested and OpenAI is available
        if (includeAIRecommendations) {
            try {
                const aiMarketingService = require('./aiMarketingService');
                const aiRecommendations = await aiMarketingService.generateCampaignRecommendations(coachId, campaignId, insights);
                result.aiRecommendations = aiRecommendations;
            } catch (error) {
                result.aiRecommendationsError = error.message;
            }
        }

        return result;
    } catch (error) {
        throw new Error(`Failed to get campaign recommendations: ${error.message}`);
    }
}

// ===== CAMPAIGN CREATION & MANAGEMENT =====

/**
 * Create new campaign
 */
async function createCampaign(coachId, campaignData) {
    const {
        name,
        objective,
        budget,
        targetAudience,
        productInfo,
        useAI,
        autoOptimize,
        schedule
    } = campaignData;

    try {
        const credentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('+metaAds.accessToken +encryptionKey');
        
        if (!credentials || !credentials.metaAds.accessToken) {
            throw new Error('Meta credentials not found');
        }

        const accessToken = credentials.getDecryptedAccessToken();
        const adAccountId = credentials.metaAds.adAccountId;
        
        if (!adAccountId) {
            throw new Error('Ad account ID not configured');
        }

        // Prepare campaign data for Meta API
        const metaCampaignData = {
            name,
            objective,
            status: 'PAUSED', // Start paused for review
            daily_budget: budget * 100 // Convert to cents
        };

        // Create campaign via Meta API
        const campaignResponse = await axios.post(`${META_ADS_API_BASE}/act_${adAccountId}/campaigns`, {
            ...metaCampaignData,
            access_token: accessToken
        });

        const metaCampaign = campaignResponse.data;

        // Save to local database
        const campaign = new AdCampaign({
            campaignId: metaCampaign.id,
            coachId,
            name,
            objective,
            status: 'PAUSED',
            dailyBudget: budget,
            aiGenerated: useAI,
            metaRaw: metaCampaign,
            createdAt: new Date()
        });

        await campaign.save();

        // Generate AI content if requested
        let aiContent = null;
        if (useAI) {
            try {
                const aiMarketingService = require('./aiMarketingService');
                aiContent = await aiMarketingService.generateCampaignContent(coachId, {
                    campaignData,
                    metaCampaignId: metaCampaign.id
                });
                
                campaign.aiContent = aiContent;
                await campaign.save();
            } catch (error) {
                console.error('AI content generation failed:', error.message);
            }
        }

        return {
            campaign: campaign.toObject(),
            metaCampaign,
            aiContent,
            message: 'Campaign created successfully. Review and activate when ready.'
        };
    } catch (error) {
        throw new Error(`Failed to create campaign: ${error.message}`);
    }
}

/**
 * Update campaign
 */
async function updateCampaign(coachId, campaignId, updateData) {
    try {
        const credentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('+metaAds.accessToken +encryptionKey');
        
        if (!credentials || !credentials.metaAds.accessToken) {
            throw new Error('Meta credentials not found');
        }

        const accessToken = credentials.getDecryptedAccessToken();
        
        // Update via Meta API
        const metaUpdateData = {};
        if (updateData.name) metaUpdateData.name = updateData.name;
        if (updateData.status) metaUpdateData.status = updateData.status;
        if (updateData.dailyBudget) metaUpdateData.daily_budget = updateData.dailyBudget * 100;

        if (Object.keys(metaUpdateData).length > 0) {
            await axios.post(`${META_ADS_API_BASE}/${campaignId}`, {
                ...metaUpdateData,
                access_token: accessToken
            });
        }

        // Update local database
        const campaign = await AdCampaign.findOneAndUpdate(
            { campaignId, coachId },
            updateData,
            { new: true }
        );

        if (!campaign) {
            throw new Error('Campaign not found');
        }

        return campaign;
    } catch (error) {
        throw new Error(`Failed to update campaign: ${error.message}`);
    }
}

/**
 * Pause campaign
 */
async function pauseCampaign(coachId, campaignId) {
    return updateCampaign(coachId, campaignId, { status: 'PAUSED' });
}

/**
 * Resume campaign
 */
async function resumeCampaign(coachId, campaignId) {
    return updateCampaign(coachId, campaignId, { status: 'ACTIVE' });
}

/**
 * Delete campaign
 */
async function deleteCampaign(coachId, campaignId) {
    try {
        const credentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('+metaAds.accessToken +encryptionKey');
        
        if (!credentials || !credentials.metaAds.accessToken) {
            throw new Error('Meta credentials not found');
        }

        const accessToken = credentials.getDecryptedAccessToken();
        
        // Delete from Meta API
        await axios.delete(`${META_ADS_API_BASE}/${campaignId}`, {
            params: { access_token: accessToken }
        });

        // Delete from local database
        await AdCampaign.findOneAndDelete({ campaignId, coachId });

        return { success: true };
    } catch (error) {
        throw new Error(`Failed to delete campaign: ${error.message}`);
    }
}

/**
 * Duplicate campaign
 */
async function duplicateCampaign(coachId, campaignId, options) {
    const { newName, modifications = {} } = options;
    
    try {
        // Get original campaign
        const originalCampaign = await AdCampaign.findOne({ campaignId, coachId });
        if (!originalCampaign) {
            throw new Error('Original campaign not found');
        }

        // Create new campaign with modifications
        const newCampaignData = {
            name: newName || `${originalCampaign.name} (Copy)`,
            objective: originalCampaign.objective,
            budget: modifications.budget || originalCampaign.dailyBudget,
            targetAudience: modifications.targetAudience || originalCampaign.targetAudience,
            productInfo: modifications.productInfo || originalCampaign.productInfo,
            useAI: modifications.useAI !== undefined ? modifications.useAI : originalCampaign.aiGenerated,
            autoOptimize: modifications.autoOptimize !== undefined ? modifications.autoOptimize : false
        };

        return await createCampaign(coachId, newCampaignData);
    } catch (error) {
        throw new Error(`Failed to duplicate campaign: ${error.message}`);
    }
}

// ===== DASHBOARD & ANALYTICS =====

/**
 * Get marketing dashboard data
 */
async function getMarketingDashboard(coachId, options) {
    const { dateRange, includeAIInsights, includeRecommendations } = options;
    
    try {
        // Get credentials status first
        const credentialsStatus = await getCredentialsStatus(coachId);

        // Get campaign analysis (will return empty if no credentials/campaigns)
        let campaignAnalysis;
        try {
            campaignAnalysis = await getCampaignAnalysis(coachId, {
                dateRange,
                campaignIds: [],
                includeInsights: true,
                includeRecommendations: includeRecommendations === true || includeRecommendations === 'true'
            });
        } catch (error) {
            console.error('Error getting campaign analysis:', error);
            // Return empty analysis on error
            campaignAnalysis = {
                summary: {
                    totalCampaigns: 0,
                    activeCampaigns: 0,
                    pausedCampaigns: 0,
                    dateRange,
                    overallMetrics: {
                        totalImpressions: 0,
                        totalClicks: 0,
                        totalSpend: 0,
                        totalConversions: 0
                    }
                },
                campaigns: []
            };
        }

        const dashboard = {
            credentials: credentialsStatus,
            campaigns: campaignAnalysis,
            timestamp: new Date()
        };

        // Add AI insights if requested (optional, don't fail if it errors)
        if (includeAIInsights === true || includeAIInsights === 'true') {
            try {
                const aiMarketingService = require('./aiMarketingService');
                if (aiMarketingService && typeof aiMarketingService.generateDashboardInsights === 'function') {
                    const aiInsights = await aiMarketingService.generateDashboardInsights(coachId, campaignAnalysis);
                    dashboard.aiInsights = aiInsights;
                }
            } catch (error) {
                console.error('Error getting AI insights:', error);
                // Provide user-friendly error message
                if (error.message?.includes('API key') || error.message?.includes('401') || error.message?.includes('Incorrect API key')) {
                    dashboard.aiInsightsError = 'OpenAI API key is invalid or expired. Please update your API key in settings to enable AI insights.';
                } else if (error.message?.includes('rate limit') || error.message?.includes('429')) {
                    dashboard.aiInsightsError = 'OpenAI API rate limit exceeded. Please try again later.';
                } else {
                    dashboard.aiInsightsError = error.message || 'Failed to generate AI insights';
                }
                // Don't fail the entire dashboard - AI insights are optional
                console.warn(`[getMarketingDashboard] AI insights unavailable for coach ${coachId}: ${dashboard.aiInsightsError}`);
            }
        }

        return dashboard;
    } catch (error) {
        console.error('Error in getMarketingDashboard:', error);
        // Return minimal dashboard on error
        return {
            credentials: {
                meta: { isConnected: false, hasCredentials: false },
                openai: { isConnected: false, hasCredentials: false },
                setupComplete: false
            },
            campaigns: {
                summary: {
                    totalCampaigns: 0,
                    activeCampaigns: 0,
                    pausedCampaigns: 0,
                    dateRange: dateRange || '30d',
                    overallMetrics: {
                        totalImpressions: 0,
                        totalClicks: 0,
                        totalSpend: 0,
                        totalConversions: 0
                    }
                },
                campaigns: []
            },
            timestamp: new Date(),
            error: error.message
        };
    }
}

/**
 * Get campaign performance summary
 */
async function getCampaignPerformanceSummary(coachId, options) {
    const { dateRange, campaignIds, includeComparisons } = options;
    
    try {
        const analysis = await getCampaignAnalysis(coachId, {
            dateRange,
            campaignIds,
            includeInsights: true,
            includeRecommendations: false
        });

        const summary = {
            totalCampaigns: analysis.summary.totalCampaigns,
            activeCampaigns: analysis.summary.activeCampaigns,
            pausedCampaigns: analysis.summary.pausedCampaigns,
            overallMetrics: analysis.summary.overallMetrics,
            topPerformers: analysis.campaigns
                .filter(c => c.insights)
                .sort((a, b) => parseFloat(b.insights.ctr) - parseFloat(a.insights.ctr))
                .slice(0, 5),
            timestamp: new Date()
        };

        if (includeComparisons) {
            // Add comparison with previous period
            const previousAnalysis = await getCampaignAnalysis(coachId, {
                dateRange: 'previous_period',
                campaignIds,
                includeInsights: true,
                includeRecommendations: false
            });

            summary.comparison = {
                impressions: {
                    current: analysis.summary.overallMetrics?.totalImpressions || 0,
                    previous: previousAnalysis.summary.overallMetrics?.totalImpressions || 0
                },
                clicks: {
                    current: analysis.summary.overallMetrics?.totalClicks || 0,
                    previous: previousAnalysis.summary.overallMetrics?.totalClicks || 0
                },
                spend: {
                    current: analysis.summary.overallMetrics?.totalSpend || 0,
                    previous: previousAnalysis.summary.overallMetrics?.totalSpend || 0
                }
            };
        }

        return summary;
    } catch (error) {
        throw new Error(`Failed to get performance summary: ${error.message}`);
    }
}

/**
 * Export campaign data
 */
async function exportCampaignData(coachId, options) {
    const { format, dateRange, campaignIds, includeInsights } = options;
    
    try {
        const analysis = await getCampaignAnalysis(coachId, {
            dateRange,
            campaignIds,
            includeInsights,
            includeRecommendations: false
        });

        if (format === 'csv') {
            // Convert to CSV format
            const csvData = analysis.campaigns.map(campaign => ({
                'Campaign ID': campaign.id,
                'Campaign Name': campaign.name,
                'Status': campaign.status,
                'Objective': campaign.objective,
                'Impressions': campaign.insights?.impressions || 0,
                'Clicks': campaign.insights?.clicks || 0,
                'Spend': campaign.insights?.spend || 0,
                'CTR': campaign.insights?.ctr || 0,
                'CPC': campaign.insights?.cpc || 0,
                'CPM': campaign.insights?.cpm || 0,
                'Conversions': campaign.insights?.conversions || 0
            }));

            return {
                format: 'csv',
                data: csvData,
                filename: `campaign_data_${new Date().toISOString().split('T')[0]}.csv`
            };
        }

        return {
            format,
            data: analysis,
            timestamp: new Date()
        };
    } catch (error) {
        throw new Error(`Failed to export campaign data: ${error.message}`);
    }
}

// ===== AUTOMATION & SCHEDULING =====

/**
 * Schedule campaign
 */
async function scheduleCampaign(coachId, campaignId, scheduleData) {
    const { startDate, endDate, timezone, budgetSchedule } = scheduleData;
    
    try {
        // Update campaign with schedule information
        const updateData = {
            scheduledStart: new Date(startDate),
            scheduledEnd: endDate ? new Date(endDate) : null,
            timezone,
            budgetSchedule
        };

        return await updateCampaign(coachId, campaignId, updateData);
    } catch (error) {
        throw new Error(`Failed to schedule campaign: ${error.message}`);
    }
}

/**
 * Setup campaign automation
 */
async function setupCampaignAutomation(coachId, campaignId, automationData) {
    const { rules, notifications, autoOptimize } = automationData;
    
    try {
        // Update campaign with automation rules
        const updateData = {
            automationRules: rules,
            automationNotifications: notifications,
            autoOptimize
        };

        return await updateCampaign(coachId, campaignId, updateData);
    } catch (error) {
        throw new Error(`Failed to setup campaign automation: ${error.message}`);
    }
}

/**
 * Get automation status
 */
async function getAutomationStatus(coachId, campaignId) {
    try {
        const campaign = await AdCampaign.findOne({ campaignId, coachId });
        
        if (!campaign) {
            throw new Error('Campaign not found');
        }

        return {
            campaignId,
            hasAutomation: !!(campaign.automationRules && campaign.automationRules.length > 0),
            automationRules: campaign.automationRules || [],
            notifications: campaign.automationNotifications || false,
            autoOptimize: campaign.autoOptimize || false,
            lastAutomationRun: campaign.lastAutomationRun || null
        };
    } catch (error) {
        throw new Error(`Failed to get automation status: ${error.message}`);
    }
}

module.exports = {
    // Credentials Management
    setupMetaCredentials,
    verifyMetaCredentials,
    getMetaAccountInfo,
    setupOpenAICredentials,
    verifyOpenAICredentials,
    getCredentialsStatus,
    
    // Campaign Analysis
    getCampaignAnalysis,
    getCampaignInsights,
    getCampaignMetrics,
    getCampaignAudienceInsights,
    getCampaignRecommendations,
    
    // Campaign Management
    createCampaign,
    updateCampaign,
    pauseCampaign,
    resumeCampaign,
    deleteCampaign,
    duplicateCampaign,
    
    // Dashboard & Analytics
    getMarketingDashboard,
    getCampaignPerformanceSummary,
    exportCampaignData,
    
    // Automation & Scheduling
    scheduleCampaign,
    setupCampaignAutomation,
    getAutomationStatus
};
