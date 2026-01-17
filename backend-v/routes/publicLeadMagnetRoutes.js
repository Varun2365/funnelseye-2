const express = require('express');
const router = express.Router();
const {
    serveMagnetPage,
    submitMagnetForm,
    trackInteraction,
    getMagnetAnalytics,
    generateShareableUrl
} = require('../controllers/publicLeadMagnetController');
const { 
    unifiedCoachAuth, 
    requirePermission 
} = require('../middleware/unifiedCoachAuth');

// ===== PUBLIC ROUTES (No authentication required) =====

// @route   GET /lead-magnets/:magnetType/:coachId
// @desc    Serve lead magnet landing page
// @access  Public
router.get('/:magnetType/:coachId', serveMagnetPage);

// @route   POST /lead-magnets/:magnetType/submit
// @desc    Process lead magnet form submission
// @access  Public
router.post('/:magnetType/submit', submitMagnetForm);

// @route   POST /lead-magnets/track
// @desc    Track page interactions (AJAX endpoint)
// @access  Public
router.post('/track', trackInteraction);

// ===== PROTECTED ROUTES (Authentication required) =====

// @route   GET /lead-magnets/analytics/:coachId
// @desc    Get lead magnet analytics for coach
// @access  Private (Coach/Staff with permission)
router.get('/analytics/:coachId', unifiedCoachAuth(), requirePermission('leads:view'), getMagnetAnalytics);

// @route   GET /lead-magnets/generate-url/:magnetType/:coachId
// @desc    Generate shareable URL for lead magnet
// @access  Private (Coach/Staff with permission)
router.get('/generate-url/:magnetType/:coachId', unifiedCoachAuth(), requirePermission('leads:write'), generateShareableUrl);

module.exports = router;
