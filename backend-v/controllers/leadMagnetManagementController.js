const asyncHandler = require('../middleware/async');
const LeadMagnetInteraction = require('../schema/LeadMagnetInteraction');
const leadMagnetUrlService = require('../services/leadMagnetUrlService');
const leadMagnetsService = require('../services/leadMagnetsService');
const CoachStaffService = require('../services/coachStaffService');

// @desc    Get all available lead magnets for coach
// @route   GET /api/lead-magnet-management/available
// @access  Private (Coach/Staff with permission)
exports.getAvailableMagnets = asyncHandler(async (req, res) => {
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'lead_magnets', 'available', { coachId });
    
    const magnets = Object.keys(leadMagnetsService.availableLeadMagnets).map(magnetId => ({
        id: magnetId,
        ...leadMagnetsService.availableLeadMagnets[magnetId],
        url: `/lead-magnets/${magnetId}/${coachId}`,
        previewUrl: `/lead-magnets/${magnetId}/${coachId}?preview=true`
    }));
    
    // Filter response data based on staff permissions
    const filteredMagnets = CoachStaffService.filterResponseData(req, magnets, 'leads');
    
    res.json({
        success: true,
        data: filteredMagnets,
        count: filteredMagnets.length,
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

// @desc    Generate shareable URLs for a lead magnet
// @route   POST /api/lead-magnet-management/generate-urls
// @access  Private (Coach/Staff with permission)
exports.generateShareableUrls = asyncHandler(async (req, res) => {
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    const { magnetType, channels, customOptions } = req.body;
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'write', 'lead_magnets', 'generate_urls', { coachId, magnetType });
    
    if (!magnetType) {
        return res.status(400).json({
            success: false,
            message: 'Magnet type is required'
        });
    }
    
    try {
        let urls = [];
        
        if (channels && channels.length > 0) {
            // Generate URLs for specific channels
            const channelConfigs = channels.map(channel => {
                if (typeof channel === 'string') {
                    // Find predefined channel
                    const predefined = leadMagnetUrlService.getPredefinedChannels()
                        .find(c => c.name.toLowerCase() === channel.toLowerCase());
                    return predefined || { name: channel, source: channel };
                }
                return channel;
            });
            
            urls = await leadMagnetUrlService.generateMultiChannelUrls(
                coachId, 
                magnetType, 
                channelConfigs
            );
        } else {
            // Generate single URL with custom options
            const urlInfo = await leadMagnetUrlService.generateMagnetUrl(
                coachId, 
                magnetType, 
                customOptions || {}
            );
            urls = [{ channel: 'custom', ...urlInfo }];
        }
        
        res.json({
            success: true,
            data: {
                magnetType,
                urls,
                totalUrls: urls.length
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get predefined channel configurations
// @route   GET /api/lead-magnet-management/channels
// @access  Private (Coach)
exports.getPredefinedChannels = asyncHandler(async (req, res) => {
    const channels = leadMagnetUrlService.getPredefinedChannels();
    
    res.json({
        success: true,
        data: channels,
        count: channels.length
    });
});

// @desc    Create campaign with multiple lead magnets
// @route   POST /api/lead-magnet-management/campaigns
// @access  Private (Coach)
exports.createCampaign = asyncHandler(async (req, res) => {
    const coachId = req.coachId;
    const { campaignName, magnetTypes, description } = req.body;
    
    if (!campaignName || !magnetTypes || magnetTypes.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Campaign name and magnet types are required'
        });
    }
    
    try {
        const campaign = await leadMagnetUrlService.createCampaignUrls(
            coachId, 
            campaignName, 
            magnetTypes
        );
        
        campaign.description = description;
        
        res.json({
            success: true,
            data: campaign,
            message: 'Campaign created successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get lead magnet analytics
// @route   GET /api/lead-magnet-management/analytics
// @access  Private (Coach)
exports.getAnalytics = asyncHandler(async (req, res) => {
    const coachId = req.coachId;
    const { timeRange = 30, magnetType, detailed = false } = req.query;
    
    try {
        // Get basic analytics
        const analytics = await LeadMagnetInteraction.getAnalytics(
            coachId, 
            parseInt(timeRange)
        );
        
        // Get URL-specific analytics if requested
        let urlAnalytics = null;
        if (detailed === 'true') {
            urlAnalytics = await leadMagnetUrlService.getUrlAnalytics(
                coachId, 
                magnetType, 
                parseInt(timeRange)
            );
        }
        
        // Get performance comparison
        const comparison = await leadMagnetUrlService.getPerformanceComparison(
            coachId, 
            parseInt(timeRange)
        );
        
        res.json({
            success: true,
            data: {
                overview: analytics,
                urlAnalytics,
                comparison,
                timeRange: parseInt(timeRange)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics',
            error: error.message
        });
    }
});

// @desc    Get lead magnet interaction details
// @route   GET /api/lead-magnet-management/interactions
// @access  Private (Coach)
exports.getInteractions = asyncHandler(async (req, res) => {
    const coachId = req.coachId;
    const { 
        page = 1, 
        limit = 20, 
        magnetType, 
        status, 
        source, 
        timeRange = 30 
    } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));
    
    let query = {
        coachId,
        createdAt: { $gte: startDate }
    };
    
    if (magnetType) query.magnetType = magnetType;
    if (status) query['conversion.status'] = status;
    if (source) query['userInfo.utmSource'] = source;
    
    const interactions = await LeadMagnetInteraction.find(query)
        .populate('leadId', 'name email phone status leadTemperature')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await LeadMagnetInteraction.countDocuments(query);
    
    res.json({
        success: true,
        data: interactions,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
        }
    });
});

// @desc    Get top performing lead magnets
// @route   GET /api/lead-magnet-management/top-performers
// @access  Private (Coach)
exports.getTopPerformers = asyncHandler(async (req, res) => {
    const coachId = req.coachId;
    const { timeRange = 30, metric = 'conversions' } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));
    
    let sortField;
    switch (metric) {
        case 'views':
            sortField = { totalViews: -1 };
            break;
        case 'conversions':
            sortField = { conversions: -1 };
            break;
        case 'conversion_rate':
            sortField = { conversionRate: -1 };
            break;
        case 'time_spent':
            sortField = { avgTimeSpent: -1 };
            break;
        default:
            sortField = { conversions: -1 };
    }
    
    const topPerformers = await LeadMagnetInteraction.aggregate([
        {
            $match: {
                coachId,
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: '$magnetType',
                magnetName: { $first: '$magnetName' },
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
                totalTimeSpent: { $sum: '$timeSpent' },
                formSubmissions: { $sum: '$engagement.formSubmissions' }
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
        },
        {
            $project: {
                uniqueVisitors: 0
            }
        },
        {
            $sort: sortField
        },
        {
            $limit: 10
        }
    ]);
    
    res.json({
        success: true,
        data: topPerformers,
        metric,
        timeRange: parseInt(timeRange)
    });
});

// @desc    Export lead magnet data
// @route   GET /api/lead-magnet-management/export
// @access  Private (Coach)
exports.exportData = asyncHandler(async (req, res) => {
    const coachId = req.coachId;
    const { format = 'json', timeRange = 30, magnetType } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));
    
    let query = {
        coachId,
        createdAt: { $gte: startDate }
    };
    
    if (magnetType) query.magnetType = magnetType;
    
    const interactions = await LeadMagnetInteraction.find(query)
        .populate('leadId', 'name email phone status leadTemperature')
        .sort({ createdAt: -1 });
    
    if (format === 'csv') {
        // Convert to CSV format
        const csv = convertToCSV(interactions);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=lead-magnet-data.csv');
        res.send(csv);
    } else {
        // Return JSON format
        res.json({
            success: true,
            data: interactions,
            exportedAt: new Date(),
            totalRecords: interactions.length
        });
    }
});

// @desc    Get lead magnet performance trends
// @route   GET /api/lead-magnet-management/trends
// @access  Private (Coach)
exports.getTrends = asyncHandler(async (req, res) => {
    const coachId = req.coachId;
    const { timeRange = 30, groupBy = 'day' } = req.query;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));
    
    let groupFormat;
    switch (groupBy) {
        case 'hour':
            groupFormat = '%Y-%m-%d-%H';
            break;
        case 'day':
            groupFormat = '%Y-%m-%d';
            break;
        case 'week':
            groupFormat = '%Y-%U';
            break;
        case 'month':
            groupFormat = '%Y-%m';
            break;
        default:
            groupFormat = '%Y-%m-%d';
    }
    
    const trends = await LeadMagnetInteraction.aggregate([
        {
            $match: {
                coachId,
                createdAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: {
                    period: { $dateToString: { format: groupFormat, date: '$createdAt' } },
                    magnetType: '$magnetType'
                },
                views: { $sum: 1 },
                conversions: {
                    $sum: {
                        $cond: [
                            { $in: ['$conversion.status', ['converted', 'lead_created']] },
                            1,
                            0
                        ]
                    }
                },
                uniqueVisitors: { $addToSet: '$userInfo.ipAddress' },
                totalTimeSpent: { $sum: '$timeSpent' }
            }
        },
        {
            $addFields: {
                uniqueVisitorCount: { $size: '$uniqueVisitors' },
                conversionRate: {
                    $multiply: [
                        { $divide: ['$conversions', '$views'] },
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
            $sort: { '_id.period': 1, '_id.magnetType': 1 }
        }
    ]);
    
    res.json({
        success: true,
        data: trends,
        timeRange: parseInt(timeRange),
        groupBy
    });
});

// Helper function to convert data to CSV
const convertToCSV = (data) => {
    if (data.length === 0) return '';
    
    const headers = [
        'Date',
        'Magnet Type',
        'Magnet Name',
        'User Name',
        'User Email',
        'User Phone',
        'Source',
        'Medium',
        'Campaign',
        'Conversion Status',
        'Time Spent (seconds)',
        'Page Views',
        'Form Submissions'
    ];
    
    const rows = data.map(interaction => [
        interaction.createdAt.toISOString().split('T')[0],
        interaction.magnetType,
        interaction.magnetName,
        interaction.userInfo.name || '',
        interaction.userInfo.email || '',
        interaction.userInfo.phone || '',
        interaction.userInfo.utmSource || '',
        interaction.userInfo.utmMedium || '',
        interaction.userInfo.utmCampaign || '',
        interaction.conversion.status,
        interaction.timeSpent,
        interaction.pageViews,
        interaction.engagement.formSubmissions
    ]);
    
    return [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
};
