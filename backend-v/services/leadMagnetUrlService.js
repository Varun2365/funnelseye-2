const LeadMagnetInteraction = require('../schema/LeadMagnetInteraction');
const User = require('../schema/User');
const Lead = require('../schema/Lead');
const leadMagnetsService = require('./leadMagnetsService');

class LeadMagnetUrlService {
    
    /**
     * Generate deployable URL for a lead magnet
     * @param {string} coachId - Coach ID
     * @param {string} magnetType - Type of lead magnet
     * @param {Object} options - URL generation options
     * @returns {Object} URL information
     */
    async generateMagnetUrl(coachId, magnetType, options = {}) {
        const {
            leadId = null,
            campaign = null,
            medium = null,
            source = null,
            content = null,
            term = null,
            customDomain = null
        } = options;
        
        // Validate coach exists
        const coach = await User.findById(coachId);
        if (!coach) {
            throw new Error('Coach not found');
        }
        
        // Validate magnet type
        if (!leadMagnetsService.availableLeadMagnets[magnetType]) {
            throw new Error('Invalid lead magnet type');
        }
        
        // Build base URL
        const baseUrl = customDomain || process.env.PUBLIC_URL || 'http://localhost:8080';
        let url = `${baseUrl}/lead-magnets/${magnetType}/${coachId}`;
        
        // Add query parameters
        const queryParams = [];
        if (leadId) queryParams.push(`leadId=${leadId}`);
        if (campaign) queryParams.push(`utm_campaign=${encodeURIComponent(campaign)}`);
        if (medium) queryParams.push(`utm_medium=${encodeURIComponent(medium)}`);
        if (source) queryParams.push(`utm_source=${encodeURIComponent(source)}`);
        if (content) queryParams.push(`utm_content=${encodeURIComponent(content)}`);
        if (term) queryParams.push(`utm_term=${encodeURIComponent(term)}`);
        
        if (queryParams.length > 0) {
            url += '?' + queryParams.join('&');
        }
        
        return {
            url,
            shortUrl: await this.generateShortUrl(url),
            qrCode: await this.generateQRCode(url),
            magnetInfo: leadMagnetsService.availableLeadMagnets[magnetType],
            coachInfo: {
                id: coach._id,
                name: coach.name,
                businessName: coach.businessName
            },
            tracking: {
                campaign,
                medium,
                source,
                content,
                term
            }
        };
    }
    
    /**
     * Generate multiple URLs for different channels
     * @param {string} coachId - Coach ID
     * @param {string} magnetType - Type of lead magnet
     * @param {Array} channels - Array of channel configurations
     * @returns {Array} Array of URL objects
     */
    async generateMultiChannelUrls(coachId, magnetType, channels) {
        const urls = [];
        
        for (const channel of channels) {
            try {
                const urlInfo = await this.generateMagnetUrl(coachId, magnetType, {
                    campaign: channel.campaign,
                    medium: channel.medium,
                    source: channel.source,
                    content: channel.content,
                    term: channel.term
                });
                
                urls.push({
                    channel: channel.name,
                    ...urlInfo
                });
            } catch (error) {
                console.error(`Error generating URL for channel ${channel.name}:`, error);
            }
        }
        
        return urls;
    }
    
    /**
     * Get predefined channel configurations
     * @returns {Array} Predefined channels
     */
    getPredefinedChannels() {
        return [
            {
                name: 'Instagram Bio',
                medium: 'social',
                source: 'instagram',
                campaign: 'bio_link',
                content: 'profile'
            },
            {
                name: 'Instagram Story',
                medium: 'social',
                source: 'instagram',
                campaign: 'story_link',
                content: 'story'
            },
            {
                name: 'Instagram Post',
                medium: 'social',
                source: 'instagram',
                campaign: 'post_link',
                content: 'post'
            },
            {
                name: 'Facebook Ad',
                medium: 'paid_social',
                source: 'facebook',
                campaign: 'lead_gen_ad',
                content: 'ad_creative'
            },
            {
                name: 'Google Ads',
                medium: 'paid_search',
                source: 'google',
                campaign: 'search_ads',
                content: 'text_ad'
            },
            {
                name: 'Email Signature',
                medium: 'email',
                source: 'signature',
                campaign: 'email_marketing',
                content: 'signature'
            },
            {
                name: 'WhatsApp Status',
                medium: 'messaging',
                source: 'whatsapp',
                campaign: 'status_update',
                content: 'status'
            },
            {
                name: 'YouTube Description',
                medium: 'video',
                source: 'youtube',
                campaign: 'video_marketing',
                content: 'description'
            },
            {
                name: 'LinkedIn Post',
                medium: 'social',
                source: 'linkedin',
                campaign: 'professional_network',
                content: 'post'
            },
            {
                name: 'Website Header',
                medium: 'website',
                source: 'organic',
                campaign: 'website_integration',
                content: 'header'
            }
        ];
    }
    
    /**
     * Get analytics for magnet URLs
     * @param {string} coachId - Coach ID
     * @param {string} magnetType - Optional magnet type filter
     * @param {number} timeRange - Days to look back (default: 30)
     * @returns {Object} Analytics data
     */
    async getUrlAnalytics(coachId, magnetType = null, timeRange = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);
        
        let query = {
            coachId,
            createdAt: { $gte: startDate }
        };
        
        if (magnetType) {
            query.magnetType = magnetType;
        }
        
        // Get source/medium breakdown
        const sourceAnalytics = await LeadMagnetInteraction.aggregate([
            { $match: query },
            {
                $group: {
                    _id: {
                        source: '$userInfo.utmSource',
                        medium: '$userInfo.utmMedium',
                        campaign: '$userInfo.utmCampaign'
                    },
                    visits: { $sum: 1 },
                    uniqueVisitors: { $addToSet: '$userInfo.ipAddress' },
                    conversions: {
                        $sum: {
                            $cond: [
                                { $in: ['$conversion.status', ['converted', 'lead_created']] },
                                1,
                                0
                            ]
                        }
                    },
                    totalTimeSpent: { $sum: '$timeSpent' },
                    formSubmissions: { $sum: '$engagement.formSubmissions' }
                }
            },
            {
                $addFields: {
                    uniqueVisitorCount: { $size: '$uniqueVisitors' },
                    conversionRate: {
                        $multiply: [
                            { $divide: ['$conversions', '$visits'] },
                            100
                        ]
                    }
                }
            },
            {
                $project: {
                    uniqueVisitors: 0
                }
            },
            {
                $sort: { visits: -1 }
            }
        ]);
        
        // Get top performing URLs
        const topUrls = await LeadMagnetInteraction.aggregate([
            { $match: query },
            {
                $group: {
                    _id: {
                        magnetType: '$magnetType',
                        source: '$userInfo.utmSource',
                        medium: '$userInfo.utmMedium'
                    },
                    visits: { $sum: 1 },
                    conversions: {
                        $sum: {
                            $cond: [
                                { $in: ['$conversion.status', ['converted', 'lead_created']] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $addFields: {
                    conversionRate: {
                        $multiply: [
                            { $divide: ['$conversions', '$visits'] },
                            100
                        ]
                    }
                }
            },
            {
                $sort: { conversionRate: -1, visits: -1 }
            },
            {
                $limit: 10
            }
        ]);
        
        return {
            sourceBreakdown: sourceAnalytics,
            topPerformingUrls: topUrls,
            timeRange,
            totalSources: sourceAnalytics.length
        };
    }
    
    /**
     * Generate QR code for URL
     * @param {string} url - URL to encode
     * @returns {string} QR code image URL
     */
    async generateQRCode(url) {
        // Using QR Server API (free service)
        const size = '300x300';
        const format = 'png';
        const errorCorrection = 'M';
        
        return `https://api.qrserver.com/v1/create-qr-code/?size=${size}&format=${format}&ecc=${errorCorrection}&data=${encodeURIComponent(url)}`;
    }
    
    /**
     * Generate short URL (placeholder implementation)
     * @param {string} url - URL to shorten
     * @returns {string} Shortened URL
     */
    async generateShortUrl(url) {
        // TODO: Implement URL shortening service (bit.ly, tinyurl, etc.)
        // For now, return the original URL
        return url;
    }
    
    /**
     * Get lead magnet performance comparison
     * @param {string} coachId - Coach ID
     * @param {number} timeRange - Days to compare
     * @returns {Object} Comparison data
     */
    async getPerformanceComparison(coachId, timeRange = 30) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);
        
        const previousStartDate = new Date(startDate);
        previousStartDate.setDate(previousStartDate.getDate() - timeRange);
        
        // Current period
        const currentPeriod = await this.getPeriodStats(coachId, startDate, endDate);
        
        // Previous period
        const previousPeriod = await this.getPeriodStats(coachId, previousStartDate, startDate);
        
        // Calculate changes
        const comparison = {};
        for (const metric in currentPeriod) {
            const current = currentPeriod[metric] || 0;
            const previous = previousPeriod[metric] || 0;
            const change = previous === 0 ? 0 : ((current - previous) / previous) * 100;
            
            comparison[metric] = {
                current,
                previous,
                change: parseFloat(change.toFixed(2)),
                trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
            };
        }
        
        return comparison;
    }
    
    /**
     * Get stats for a specific period
     * @param {string} coachId - Coach ID
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @returns {Object} Period stats
     */
    async getPeriodStats(coachId, startDate, endDate) {
        const stats = await LeadMagnetInteraction.aggregate([
            {
                $match: {
                    coachId,
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: 1 },
                    uniqueVisitors: { $addToSet: '$userInfo.ipAddress' },
                    conversions: {
                        $sum: {
                            $cond: [
                                { $in: ['$conversion.status', ['converted', 'lead_created']] },
                                1,
                                0
                            ]
                        }
                    },
                    formSubmissions: { $sum: '$engagement.formSubmissions' },
                    totalTimeSpent: { $sum: '$timeSpent' }
                }
            },
            {
                $addFields: {
                    uniqueVisitorCount: { $size: '$uniqueVisitors' },
                    conversionRate: {
                        $multiply: [
                            { $divide: ['$conversions', '$totalViews'] },
                            100
                        ]
                    },
                    avgTimeSpent: { $divide: ['$totalTimeSpent', '$totalViews'] }
                }
            }
        ]);
        
        if (stats.length === 0) {
            return {
                totalViews: 0,
                uniqueVisitorCount: 0,
                conversions: 0,
                conversionRate: 0,
                formSubmissions: 0,
                avgTimeSpent: 0
            };
        }
        
        return stats[0];
    }
    
    /**
     * Create campaign-specific URLs for a coach
     * @param {string} coachId - Coach ID
     * @param {string} campaignName - Campaign name
     * @param {Array} magnetTypes - Array of magnet types to include
     * @returns {Object} Campaign URLs
     */
    async createCampaignUrls(coachId, campaignName, magnetTypes) {
        const campaign = {
            name: campaignName,
            createdAt: new Date(),
            coachId,
            magnets: []
        };
        
        for (const magnetType of magnetTypes) {
            const urlInfo = await this.generateMagnetUrl(coachId, magnetType, {
                campaign: campaignName.toLowerCase().replace(/\s+/g, '_'),
                source: 'campaign',
                medium: 'organic'
            });
            
            campaign.magnets.push({
                type: magnetType,
                name: leadMagnetsService.availableLeadMagnets[magnetType].name,
                url: urlInfo.url,
                qrCode: urlInfo.qrCode
            });
        }
        
        return campaign;
    }
}

module.exports = new LeadMagnetUrlService();
