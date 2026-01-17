const express = require('express');
const router = express.Router();
const {
    createTemplate,
    getCoachTemplates,
    getPreBuiltTemplates,
    getTemplateById,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    renderTemplate,
    seedPreBuiltTemplates,
    getTemplateCategories,
    getTemplateTypes,
    getCommonVariables
} = require('../controllers/messageTemplateController');

const { 
    unifiedCoachAuth, 
    requirePermission, 
    checkResourceOwnership,
    filterResourcesByPermission 
} = require('../middleware/unifiedCoachAuth');
const { updateLastActive } = require('../middleware/activityMiddleware');

// Apply unified authentication and resource filtering to all routes
router.use(unifiedCoachAuth(), updateLastActive, filterResourcesByPermission('templates'));

// ===== TEMPLATE MANAGEMENT =====

// Create a new message template
router.post('/', requirePermission('templates:write'), createTemplate);

// Get all templates for the authenticated coach
router.get('/', requirePermission('templates:read'), getCoachTemplates);

// Get pre-built templates
router.get('/pre-built', requirePermission('templates:read'), getPreBuiltTemplates);

// Get template categories
router.get('/categories', requirePermission('templates:read'), getTemplateCategories);

// Get template types
router.get('/types', requirePermission('templates:read'), getTemplateTypes);

// Get common template variables
router.get('/variables', requirePermission('templates:read'), getCommonVariables);

// Seed pre-built templates for the coach
router.post('/seed', requirePermission('templates:manage'), seedPreBuiltTemplates);

// ===== INDIVIDUAL TEMPLATE OPERATIONS =====

// Get a specific template by ID
router.get('/:id', requirePermission('templates:read'), getTemplateById);

// Update a template
router.put('/:id', requirePermission('templates:update'), updateTemplate);

// Delete a template
router.delete('/:id', requirePermission('templates:delete'), deleteTemplate);

// Duplicate a template
router.post('/:id/duplicate', requirePermission('templates:write'), duplicateTemplate);

// Render a template with variables
router.post('/:id/render', requirePermission('templates:read'), renderTemplate);

module.exports = router;
