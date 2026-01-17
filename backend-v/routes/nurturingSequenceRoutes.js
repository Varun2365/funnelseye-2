const express = require('express');
const router = express.Router();
const { 
    unifiedCoachAuth, 
    requirePermission, 
    checkResourceOwnership,
    filterResourcesByPermission 
} = require('../middleware/unifiedCoachAuth');
const { updateLastActive } = require('../middleware/activityMiddleware');
const nurturingSequenceController = require('../controllers/nurturingSequenceController');

// Apply unified authentication and resource filtering to all routes
router.use(unifiedCoachAuth(), updateLastActive, filterResourcesByPermission('automation'));

// ===== CRUD OPERATIONS =====
router.post('/', requirePermission('automation:write'), nurturingSequenceController.createSequence);
router.get('/', requirePermission('automation:read'), nurturingSequenceController.getSequences);
router.get('/:id', requirePermission('automation:read'), nurturingSequenceController.getSequence);
router.put('/:id', requirePermission('automation:update'), nurturingSequenceController.updateSequence);
router.delete('/:id', requirePermission('automation:delete'), nurturingSequenceController.deleteSequence);

// ===== SEQUENCE MANAGEMENT =====
router.post('/:id/duplicate', requirePermission('automation:write'), nurturingSequenceController.duplicateSequence);
router.put('/:id/toggle', requirePermission('automation:update'), nurturingSequenceController.toggleActive);
router.get('/:id/stats', requirePermission('automation:read'), nurturingSequenceController.getSequenceStats);

// ===== FUNNEL ASSIGNMENTS =====
router.post('/assign-to-funnel', requirePermission('automation:manage'), nurturingSequenceController.assignToFunnel);
router.post('/remove-from-funnel', requirePermission('automation:manage'), nurturingSequenceController.removeFromFunnel);
router.post('/bulk-assign', requirePermission('automation:manage'), nurturingSequenceController.bulkAssignToFunnels);
router.get('/:id/funnel-assignments', requirePermission('automation:read'), nurturingSequenceController.getFunnelAssignments);

// ===== CATEGORY & TESTING =====
router.get('/category/:category', requirePermission('automation:read'), nurturingSequenceController.getSequencesByCategory);
router.post('/:id/test', requirePermission('automation:execute'), nurturingSequenceController.testSequence);

module.exports = router;
