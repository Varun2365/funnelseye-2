const express = require('express');
const router = express.Router();
const {
    getRules,
    getRuleById,
    createRule,
    updateRule,
    deleteRule,
    toggleActive,
    duplicateRule
} = require('../controllers/adminAutomationRuleController');
const { unifiedCoachAuth } = require('../middleware/unifiedCoachAuth');

// All routes require admin authentication
router.use(unifiedCoachAuth);

// Get all rules
router.get('/', getRules);

// Get single rule
router.get('/:id', getRuleById);

// Create new rule
router.post('/', createRule);

// Update rule
router.put('/:id', updateRule);

// Delete rule
router.delete('/:id', deleteRule);

// Toggle active status
router.put('/:id/toggle', toggleActive);

// Duplicate rule
router.post('/:id/duplicate', duplicateRule);

module.exports = router;
