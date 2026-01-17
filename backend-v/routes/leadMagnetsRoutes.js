const express = require('express');
const router = express.Router();
const { 
    getCoachLeadMagnets,
    updateCoachLeadMagnets,
    generateAIDietPlan,
    calculateBMIAndRecommendations,
    generateEbookContent,
    calculateWorkoutMetrics,
    trackProgress,
    analyzeSleepQuality,
    assessStressLevel,
    getAvailableLeadMagnets,
    getLeadMagnetAnalytics,
    getLeadMagnetHistory,
    markConversion,
    getInteractionAnalytics
} = require('../controllers/leadMagnetsController');

const { 
    unifiedCoachAuth, 
    requirePermission, 
    checkResourceOwnership,
    filterResourcesByPermission 
} = require('../middleware/unifiedCoachAuth');
const { updateLastActive } = require('../middleware/activityMiddleware');

// Apply unified authentication and resource filtering to all routes
router.use(unifiedCoachAuth(), updateLastActive, filterResourcesByPermission('leads'));

// Coach lead magnet management
router.get('/coach', requirePermission(require('../utils/sectionPermissions').SECTIONS.LEADS.VIEW), getCoachLeadMagnets);
router.put('/coach', requirePermission(require('../utils/sectionPermissions').SECTIONS.LEADS.MANAGE), updateCoachLeadMagnets);

// Lead magnet tools
router.post('/ai-diet-plan', requirePermission(require('../utils/sectionPermissions').SECTIONS.LEADS.CREATE), generateAIDietPlan);
router.post('/bmi-calculator', requirePermission(require('../utils/sectionPermissions').SECTIONS.LEADS.CREATE), calculateBMIAndRecommendations);
router.post('/ebook-generator', requirePermission(require('../utils/sectionPermissions').SECTIONS.LEADS.CREATE), generateEbookContent);
router.post('/workout-calculator', requirePermission(require('../utils/sectionPermissions').SECTIONS.LEADS.CREATE), calculateWorkoutMetrics);
router.post('/progress-tracker', requirePermission(require('../utils/sectionPermissions').SECTIONS.LEADS.CREATE), trackProgress);
router.post('/sleep-analyzer', requirePermission(require('../utils/sectionPermissions').SECTIONS.LEADS.CREATE), analyzeSleepQuality);
router.post('/stress-assessment', requirePermission(require('../utils/sectionPermissions').SECTIONS.LEADS.CREATE), assessStressLevel);

// Mark lead magnet conversion
router.post('/mark-conversion', requirePermission(require('../utils/sectionPermissions').SECTIONS.LEADS.UPDATE), markConversion);

// Analytics and history
router.get('/available', requirePermission(require('../utils/sectionPermissions').SECTIONS.LEADS.VIEW), getAvailableLeadMagnets);
router.get('/analytics', requirePermission(require('../utils/sectionPermissions').SECTIONS.LEADS.VIEW), getLeadMagnetAnalytics);
router.get('/interaction-analytics', requirePermission(require('../utils/sectionPermissions').SECTIONS.LEADS.VIEW), getInteractionAnalytics);
router.get('/history/:leadId', requirePermission(require('../utils/sectionPermissions').SECTIONS.LEADS.VIEW), getLeadMagnetHistory);

module.exports = router;
