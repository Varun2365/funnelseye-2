// D:\PRJ_YCT_Final\controllers\dailyPriorityFeedController.js

const asyncHandler = require('../middleware/async');
const { generateDailyPriorityFeed } = require('../services/dailyPriorityFeedService'); // Import the service
const CoachStaffService = require('../services/coachStaffService');

// @desc    Get the daily priority feed for the authenticated coach
// @route   GET /api/coach/daily-feed
// @access  Private (Coaches/Staff with permission)
const getDailyPriorityFeed = asyncHandler(async (req, res) => {
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);

    // Basic validation: ensure a user ID is present
    if (!coachId) {
        return res.status(401).json({ success: false, message: 'Authentication required: User ID not found.' });
    }

    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'dashboard', 'daily_feed', { coachId });

    console.log(`[DailyPriorityFeedController] Request to get daily feed for coachId: ${coachId}`);

    // Call the service to generate the prioritized feed items
    const feed = await generateDailyPriorityFeed(coachId);

    // Filter response data based on staff permissions
    const filteredFeed = CoachStaffService.filterResponseData(req, feed, 'dashboard');

    res.status(200).json({
        success: true,
        count: filteredFeed.length,
        data: filteredFeed,
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

module.exports = {
    getDailyPriorityFeed
};