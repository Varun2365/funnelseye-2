const express = require('express');
const router = express.Router();
const {
    getRules,
    getRuleById,
    createRule,
    updateRule,
    deleteRule,
    toggleActive,
    duplicateRule,
    getBuilderResources,
    getEventsAndActions,
    getFlows,
    getRuns,
    getRunDetails,
    getAnalytics,
    assignFunnel,
    startAutomationRun,
    validateWorkflow,
    testAutomation
} = require('../controllers/adminAutomationRuleController');
const { verifyAdminToken } = require('../middleware/adminAuth');

// All routes require admin authentication
router.use(verifyAdminToken);

// Specific routes (must come before generic :id routes)
router.get('/builder-resources', getBuilderResources);
router.get('/events-actions', getEventsAndActions);
router.get('/flows', getFlows);
router.get('/runs', getRuns);
router.get('/runs/:executionId', getRunDetails);
router.get('/analytics', getAnalytics);
router.post('/run', startAutomationRun);
router.post('/validate-graph', validateWorkflow);

// Basic CRUD operations (generic :id routes)
router.get('/', getRules);
router.get('/:id', getRuleById);
router.post('/', createRule);
router.put('/:id', updateRule);
router.delete('/:id', deleteRule);
router.put('/:id/toggle', toggleActive);
router.post('/:id/duplicate', duplicateRule);
router.put('/:id/assign-funnel', assignFunnel);
router.post('/:id/test', testAutomation);

module.exports = router;
