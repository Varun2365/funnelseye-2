const express = require('express');
const router = express.Router();
const coachAdDraftController = require('../controllers/coachAdDraftController');
const { unifiedCoachAuth, requireAdsPermission } = require('../middleware/unifiedCoachAuth');
const { updateLastActive } = require('../middleware/activityMiddleware');

// All routes require authentication
router.use(unifiedCoachAuth(), updateLastActive);

router.get('/', requireAdsPermission('read'), coachAdDraftController.getAdDrafts);
router.get('/:draftId', requireAdsPermission('read'), coachAdDraftController.getAdDraft);
router.post('/', requireAdsPermission('write'), coachAdDraftController.createAdDraft);
router.put('/:draftId', requireAdsPermission('write'), coachAdDraftController.updateAdDraft);
router.post('/:draftId/publish', requireAdsPermission('write'), coachAdDraftController.publishAdDraft);
router.delete('/:draftId', requireAdsPermission('write'), coachAdDraftController.deleteAdDraft);

module.exports = router;
