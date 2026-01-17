// D:\\PRJ_YCT_Final\\routes\\leads.js

const express = require('express');
const {
    createLead,
    getLeads,
    getLead,
    updateLead,
    addFollowUpNote,
    getUpcomingFollowUps,
    deleteLead,
    assignNurturingSequence,
    advanceNurturingStep,
    getNurturingProgress,
    aiQualifyLead,
    generateNurturingSequence,
    generateFollowUpMessage,
    submitQuestionResponses,
    getQuestionTypes
} = require('../controllers/leadController');

const { 
    unifiedCoachAuth,
    requireLeadPermission,
    requireAIPermission,
    filterResourcesByPermission
} = require('../middleware/unifiedCoachAuth');
const { updateLastActive } = require('../middleware/activityMiddleware');

const router = express.Router();

// --- Public Route for creating a Lead ---
router.route('/').post(createLead);

// --- PUBLIC ROUTE: Update Lead (No Auth Required) ---
router.route('/:leadId').put(updateLead);

// --- PUBLIC ROUTE: Submit Question Responses (No Auth Required) ---
router.post('/question-responses', submitQuestionResponses);

// --- PUBLIC ROUTE: Get Question Types (No Auth Required) ---
router.get('/question-types', getQuestionTypes);

// --- All Subsequent Routes require Authentication ---
// Apply unified authentication and resource filtering
router.use(unifiedCoachAuth(), updateLastActive, filterResourcesByPermission('leads'));

// Lead management routes with permission checking
router.route('/').get(requireLeadPermission('read'), getLeads);
router.route('/:leadId')
    .get(requireLeadPermission('read'), getLead)
    .delete(requireLeadPermission('delete'), deleteLead);

// AI rescore endpoint (protected)
router.post('/:leadId/ai-rescore', requireAIPermission('write'), require('../controllers/leadController').aiRescore);

// Follow-up management
router.route('/:leadId/followup')
    .post(requireLeadPermission('update'), addFollowUpNote);
router.route('/followups/upcoming')
    .get(requireLeadPermission('read'), getUpcomingFollowUps);

// Nurturing sequence management
router.post('/assign-nurturing-sequence', requireLeadPermission('manage'), assignNurturingSequence);
router.post('/advance-nurturing-step', requireLeadPermission('update'), advanceNurturingStep);
router.get('/:leadId/nurturing-progress', requireLeadPermission('read'), getNurturingProgress);

// AI-powered lead management endpoints
router.get('/:leadId/ai-qualify', requireAIPermission('read'), aiQualifyLead);
router.post('/:leadId/generate-nurturing-sequence', requireAIPermission('write'), generateNurturingSequence);
router.post('/:leadId/generate-followup-message', requireAIPermission('write'), generateFollowUpMessage);

module.exports = router;