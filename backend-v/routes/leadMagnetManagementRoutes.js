const express = require('express');
const router = express.Router();
const {
    getAvailableMagnets,
    generateShareableUrls,
    getPredefinedChannels,
    createCampaign,
    getAnalytics,
    getInteractions,
    getTopPerformers,
    exportData,
    getTrends
} = require('../controllers/leadMagnetManagementController');

const { 
    unifiedCoachAuth, 
    requirePermission, 
    checkResourceOwnership,
    filterResourcesByPermission 
} = require('../middleware/unifiedCoachAuth');
const { updateLastActive } = require('../middleware/activityMiddleware');

// Apply unified authentication and resource filtering to all routes
router.use(unifiedCoachAuth(), updateLastActive, filterResourcesByPermission('leads'));

// @route   GET /api/lead-magnet-management/available
// @desc    Get all available lead magnets for coach
// @access  Private (Coach/Staff)
router.get('/available', requirePermission(require('../utils/sectionPermissions').SECTIONS.LEADS.VIEW), getAvailableMagnets);

// @route   POST /api/lead-magnet-management/generate-urls
// @desc    Generate shareable URLs for a lead magnet
// @access  Private (Coach/Staff)
router.post('/generate-urls', requirePermission(require('../utils/sectionPermissions').SECTIONS.LEADS.CREATE), generateShareableUrls);

// @route   GET /api/lead-magnet-management/channels
// @desc    Get predefined channel configurations
// @access  Private (Coach/Staff)
router.get('/channels', requirePermission(require('../utils/sectionPermissions').SECTIONS.LEADS.VIEW), getPredefinedChannels);

// @route   POST /api/lead-magnet-management/campaigns
// @desc    Create campaign with multiple lead magnets
// @access  Private (Coach/Staff)
router.post('/campaigns', requirePermission(require('../utils/sectionPermissions').SECTIONS.LEADS.MANAGE), createCampaign);

// @route   GET /api/lead-magnet-management/analytics
// @desc    Get lead magnet analytics
// @access  Private (Coach/Staff)
router.get('/analytics', requirePermission(require('../utils/sectionPermissions').SECTIONS.LEADS.VIEW), getAnalytics);

// @route   GET /api/lead-magnet-management/interactions
// @desc    Get lead magnet interaction details
// @access  Private (Coach/Staff)
router.get('/interactions', requirePermission(require('../utils/sectionPermissions').SECTIONS.LEADS.VIEW), getInteractions);

// @route   GET /api/lead-magnet-management/top-performers
// @desc    Get top performing lead magnets
// @access  Private (Coach/Staff)
router.get('/top-performers', requirePermission(require('../utils/sectionPermissions').SECTIONS.LEADS.VIEW), getTopPerformers);

// @route   GET /api/lead-magnet-management/export
// @desc    Export lead magnet data
// @access  Private (Coach/Staff)
router.get('/export', requirePermission(require('../utils/sectionPermissions').SECTIONS.LEADS.EXPORT), exportData);

// @route   GET /api/lead-magnet-management/trends
// @desc    Get lead magnet performance trends
// @access  Private (Coach/Staff)
router.get('/trends', requirePermission(require('../utils/sectionPermissions').SECTIONS.LEADS.VIEW), getTrends);

module.exports = router;
