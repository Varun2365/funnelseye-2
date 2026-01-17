const express = require('express');
const router = express.Router();
const leadNurturingController = require('../controllers/leadNurturingController');
const { 
    unifiedCoachAuth, 
    requireLeadPermission,
    filterResourcesByPermission
} = require('../middleware/unifiedCoachAuth');
const { updateLastActive } = require('../middleware/activityMiddleware');

// Apply unified authentication and resource filtering to all routes
router.use(unifiedCoachAuth(), updateLastActive, filterResourcesByPermission('leads'));

router.post('/assign-sequence', requireLeadPermission('manage'), leadNurturingController.assignSequence);
router.post('/progress-step', requireLeadPermission('update'), leadNurturingController.progressStep);
router.get('/status', requireLeadPermission('read'), leadNurturingController.getStatus);

module.exports = router;
