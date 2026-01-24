const express = require('express');
const router = express.Router();
const adTemplateController = require('../controllers/adTemplateController');
const { verifyAdminToken } = require('../middleware/adminAuth');

// All routes require admin authentication
router.use(verifyAdminToken);

// Template CRUD routes
router.get('/', adTemplateController.getTemplates);
router.get('/stats', adTemplateController.getTemplateStats);
router.get('/:templateId', adTemplateController.getTemplate);
router.post('/', adTemplateController.createTemplate);
router.put('/:templateId', adTemplateController.updateTemplate);
router.delete('/:templateId', adTemplateController.deleteTemplate);
router.post('/:templateId/duplicate', adTemplateController.duplicateTemplate);
router.post('/:templateId/increment-usage', adTemplateController.incrementUsage);

module.exports = router;
