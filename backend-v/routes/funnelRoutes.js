// D:\\PRJ_YCT_Final\\routes\\funnelRoutes.js

const express = require('express');
const router = express.Router();
const funnelController = require('../controllers/funnelController');
const { 
    unifiedCoachAuth,
    requireFunnelPermission,
    filterResourcesByPermission
} = require('../middleware/unifiedCoachAuth');
const { updateLastActive } = require('../middleware/activityMiddleware');
const { getFunnelAnalytics } = require('../controllers/analyticsController');

// --- Public Routes (Must be defined BEFORE router.use()) ---
// Track a funnel event (no changes needed here as it deals with FunnelEvent schema)
router.post('/track', funnelController.trackFunnelEvent);

// --- Apply unified authentication and resource filtering to all routes below this line ---
router.use(unifiedCoachAuth(), updateLastActive, filterResourcesByPermission('funnels'));

// Route to get all funnels for a specific coach
router.get('/coach/:coachId/funnels', requireFunnelPermission('read'), funnelController.getFunnelsByCoachId);

// Route to get a specific funnel by ID
router.get('/coach/:coachId/funnels/:funnelId', requireFunnelPermission('read'), funnelController.getFunnelById);

// Route to create a new funnel
router.post('/coach/:coachId/funnels', requireFunnelPermission('write'), funnelController.createFunnel);

// Route to update an existing funnel
router.put('/coach/:coachId/funnels/:funnelId', requireFunnelPermission('update'), funnelController.updateFunnel);

// Route to delete a funnel
router.delete('/coach/:coachId/funnels/:funnelId', requireFunnelPermission('delete'), funnelController.deleteFunnel);

// Route to add a new stage to a funnel
router.post(
    '/:funnelId/stages',
    requireFunnelPermission('manage_stages'),
    funnelController.addStageToFunnel
);

// PUT /api/funnels/:funnelId/stages/:stageId
router.put(
    '/:funnelId/stages/:stageId',
    requireFunnelPermission('manage_stages'),
    funnelController.editFunnelStage
);

// Get analytics for a specific funnel
router.get('/:funnelId/analytics', requireFunnelPermission('analytics'), getFunnelAnalytics);

module.exports = router;