// D:\PRJ_YCT_Final\controllers\analyticsController.js

const mongoose = require('mongoose');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const CoachStaffService = require('../services/coachStaffService');
const { SECTIONS } = require('../utils/sectionPermissions');

const Funnel = require('../schema/Funnel');
const FunnelEvent = require('../schema/FunnelEvent.js');

const getFunnelAnalytics = asyncHandler(async (req, res, next) => {
    const { funnelId } = req.params;
    
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'funnels', 'analytics', { coachId, funnelId });

    // Extract startDate and endDate from query parameters
    // Example: /api/funnels/:funnelId/analytics?startDate=2025-06-01T00:00:00Z&endDate=2025-06-30T23:59:59Z
    const { startDate, endDate } = req.query;

    // Validate and parse dates
    let dateFilter = {};
    if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
            return next(new ErrorResponse('Invalid startDate provided', 400));
        }
        dateFilter.createdAt = { $gte: start };
    }
    if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
            return next(new ErrorResponse('Invalid endDate provided', 400));
        }
        dateFilter.createdAt = { ...dateFilter.createdAt, $lte: end };
    }

    // 1. Validate Funnel Existence and Ownership
    const funnel = await Funnel.findOne({ _id: funnelId, coachId });
    if (!funnel) {
        return next(new ErrorResponse(`Funnel not found or you are not authorized for this funnel with ID: ${funnelId}`, 404));
    }

    // --- COMMON MATCH CRITERIA FOR ALL QUERIES ---
    // Now includes the dateFilter
    const commonMatch = {
        funnelId: new mongoose.Types.ObjectId(funnelId),
        ...dateFilter // Add the date filter to all relevant matches
    };

    // --- OVERALL FUNNEL METRICS (ALL USERS) ---
    const overallViewsData = await FunnelEvent.aggregate([
        { $match: { ...commonMatch, eventType: 'PageView' }},
        { $group: {
            _id: null,
            totalViews: { $sum: 1 },
            uniqueVisitors: { $addToSet: '$sessionId' }
        }},
        { $project: {
            _id: 0,
            totalViews: 1,
            uniqueVisitors: { $size: '$uniqueVisitors' }
        }}
    ]);
    const totalUniqueVisitors = overallViewsData[0]?.uniqueVisitors || 0;

    const leadsCapturedCount = await FunnelEvent.countDocuments({
        ...commonMatch,
        eventType: 'FormSubmission'
    });

    const appointmentsBookedCount = await FunnelEvent.countDocuments({
        ...commonMatch,
        eventType: 'AppointmentBooked'
    });

    const productsPurchasedCount = await FunnelEvent.countDocuments({
        ...commonMatch,
        eventType: 'ProductPurchased'
    });

    const funnelCompletionCount = await FunnelEvent.countDocuments({
        ...commonMatch,
        eventType: 'FunnelCompleted'
    });

    const overallConversionToLead = totalUniqueVisitors > 0
        ? (leadsCapturedCount / totalUniqueVisitors) * 100
        : 0;

    const funnelCompletionRate = totalUniqueVisitors > 0
        ? (funnelCompletionCount / totalUniqueVisitors) * 100
        : 0;

    // --- LOGGED-IN USER METRICS ---
    const loggedInMatch = {
        ...commonMatch,
        userId: { $ne: null } // Filter for events where userId is NOT null
    };

    const loggedInOverallViewsData = await FunnelEvent.aggregate([
        { $match: { ...loggedInMatch, eventType: 'PageView' }},
        { $group: {
            _id: null,
            totalViews: { $sum: 1 },
            uniqueVisitors: { $addToSet: '$userId' }
        }},
        { $project: {
            _id: 0,
            totalViews: 1,
            uniqueVisitors: { $size: '$uniqueVisitors' }
        }}
    ]);
    const loggedInTotalUniqueVisitors = loggedInOverallViewsData[0]?.uniqueVisitors || 0;

    const loggedInLeadsCapturedCount = await FunnelEvent.countDocuments({
        ...loggedInMatch,
        eventType: 'FormSubmission'
    });

    const loggedInAppointmentsBookedCount = await FunnelEvent.countDocuments({
        ...loggedInMatch,
        eventType: 'AppointmentBooked'
    });

    const loggedInProductsPurchasedCount = await FunnelEvent.countDocuments({
        ...loggedInMatch,
        eventType: 'ProductPurchased'
    });

    const loggedInFunnelCompletionCount = await FunnelEvent.countDocuments({
        ...loggedInMatch,
        eventType: 'FunnelCompleted'
    });

    const loggedInConversionToLead = loggedInTotalUniqueVisitors > 0
        ? (loggedInLeadsCapturedCount / loggedInTotalUniqueVisitors) * 100
        : 0;

    const loggedInFunnelCompletionRate = loggedInTotalUniqueVisitors > 0
        ? (loggedInFunnelCompletionCount / loggedInTotalUniqueVisitors) * 100
        : 0;

    // --- STAGE-WISE METRICS (ALL USERS) ---
    const stageAnalytics = await FunnelEvent.aggregate([
        { $match: {
            ...commonMatch,
            eventType: 'PageView',
            stageId: { $exists: true, $ne: null }
        }},
        { $group: {
            _id: '$stageId',
            totalViews: { $sum: 1 },
            uniqueVisitors: { $addToSet: '$sessionId' }
        }},
        { $project: {
            _id: 0,
            stageId: '$_id',
            totalViews: 1,
            uniqueVisitors: { $size: '$uniqueVisitors' }
        }},
        { $sort: { stageId: 1 } }
    ]);

    // --- DAILY BREAKDOWN (TIME SERIES) ---
    const dailyBreakdown = await FunnelEvent.aggregate([
        { $match: { ...commonMatch, eventType: 'PageView' }},
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
                },
                views: { $sum: 1 },
                uniqueVisitors: { $addToSet: '$sessionId' }
            }
        },
        {
            $project: {
                _id: 0,
                date: '$_id.date',
                views: 1,
                uniqueVisitors: { $size: '$uniqueVisitors' }
            }
        },
        { $sort: { date: 1 } }
    ]);

    // Get daily breakdown for conversions
    const dailyConversions = await FunnelEvent.aggregate([
        { $match: { ...commonMatch, eventType: 'FormSubmission' }},
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
                },
                conversions: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                date: '$_id.date',
                conversions: 1
            }
        },
        { $sort: { date: 1 } }
    ]);

    // Merge daily data
    const dailyDataMap = {};
    dailyBreakdown.forEach(item => {
        dailyDataMap[item.date] = {
            date: item.date,
            views: item.views,
            uniqueVisitors: item.uniqueVisitors,
            conversions: 0
        };
    });
    dailyConversions.forEach(item => {
        if (dailyDataMap[item.date]) {
            dailyDataMap[item.date].conversions = item.conversions;
        } else {
            dailyDataMap[item.date] = {
                date: item.date,
                views: 0,
                uniqueVisitors: 0,
                conversions: item.conversions
            };
        }
    });
    const dailyTrends = Object.values(dailyDataMap).sort((a, b) => a.date.localeCompare(b.date));

    // --- HOURLY BREAKDOWN (LAST 24 HOURS) ---
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);
    const hourlyBreakdown = await FunnelEvent.aggregate([
        { $match: { 
            ...commonMatch, 
            eventType: 'PageView',
            createdAt: { $gte: last24Hours }
        }},
        {
            $group: {
                _id: {
                    hour: { $hour: '$createdAt' }
                },
                views: { $sum: 1 },
                uniqueVisitors: { $addToSet: '$sessionId' }
            }
        },
        {
            $project: {
                _id: 0,
                hour: '$_id.hour',
                views: 1,
                uniqueVisitors: { $size: '$uniqueVisitors' }
            }
        },
        { $sort: { hour: 1 } }
    ]);

    // Filter response data based on staff permissions
    const analyticsData = {
        overall: overallViewsData[0] || { totalViews: 0, uniqueVisitors: 0 },
        leadsCaptured: leadsCapturedCount,
        appointmentsBooked: appointmentsBookedCount,
        productsPurchased: productsPurchasedCount,
        funnelCompletionCount: funnelCompletionCount,
        overallConversionToLead: parseFloat(overallConversionToLead.toFixed(2)),
        funnelCompletionRate: parseFloat(funnelCompletionRate.toFixed(2)),
        loggedInOverall: loggedInOverallViewsData[0] || { totalViews: 0, uniqueVisitors: 0 },
        loggedInLeadsCaptured: loggedInLeadsCapturedCount,
        loggedInAppointmentsBooked: loggedInAppointmentsBookedCount,
        loggedInProductsPurchased: loggedInProductsPurchasedCount,
        loggedInFunnelCompletionCount: loggedInFunnelCompletionCount,
        loggedInConversionToLead: parseFloat(loggedInConversionToLead.toFixed(2)),
        loggedInFunnelCompletionRate: parseFloat(loggedInFunnelCompletionRate.toFixed(2)),
        stageAnalytics: stageAnalytics,
        dailyTrends: dailyTrends,
        hourlyBreakdown: hourlyBreakdown,
        funnelInfo: {
            id: funnel._id,
            name: funnel.name,
            createdAt: funnel.createdAt,
            isPublished: funnel.isPublished || funnel.isActive || false
        }
    };
    
    const filteredAnalytics = CoachStaffService.filterResponseData(req, analyticsData, 'funnels');
    
    res.status(200).json({
        success: true,
        data: filteredAnalytics,
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

module.exports = {
    getFunnelAnalytics
};