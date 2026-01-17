const express = require('express');
const router = express.Router();
const {
    getRecentActivities,
    getActivityStats,
    getOngoingActivities
} = require('../controllers/activityController');

// Import unified authentication middleware
const { 
    unifiedCoachAuth, 
    requirePermission, 
    filterResourcesByPermission 
} = require('../middleware/unifiedCoachAuth');
const { updateLastActive } = require('../middleware/activityMiddleware');

// Apply unified authentication to all routes
router.use(unifiedCoachAuth(), updateLastActive);

// Get recent activities
router.get('/recent', requirePermission('activities:read'), getRecentActivities);

// Get activity statistics
router.get('/stats', requirePermission('activities:read'), getActivityStats);

// Get ongoing activities
router.get('/ongoing', requirePermission('activities:read'), getOngoingActivities);

module.exports = router;

