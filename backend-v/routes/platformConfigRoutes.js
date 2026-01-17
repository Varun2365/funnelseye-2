const express = require('express');
const router = express.Router();
const { verifyAdminToken, checkAdminPermission } = require('../middleware/adminAuth');
const platformConfigController = require('../controllers/platformConfigController');

// ===== PLATFORM CONFIGURATION ROUTES =====

// @desc    Get all platform configuration settings
// @route   GET /api/admin/platform-config
// @access  Private (Admin with systemSettings permission)
router.get('/', verifyAdminToken, checkAdminPermission('systemSettings'), platformConfigController.getPlatformConfig);

// @desc    Get specific configuration section
// @route   GET /api/admin/platform-config/:section
// @access  Private (Admin with systemSettings permission)
router.get('/:section', verifyAdminToken, checkAdminPermission('systemSettings'), platformConfigController.getConfigSection);

// @desc    Update platform configuration
// @route   PUT /api/admin/platform-config
// @access  Private (Admin with systemSettings permission)
router.put('/', verifyAdminToken, checkAdminPermission('systemSettings'), platformConfigController.updatePlatformConfig);

// @desc    Update specific configuration section
// @route   PATCH /api/admin/platform-config/:section
// @access  Private (Admin with systemSettings permission)
router.patch('/:section', verifyAdminToken, checkAdminPermission('systemSettings'), platformConfigController.updateConfigSection);

// Reset functionality can be added when needed

// @desc    Export configuration
// @route   GET /api/admin/platform-config/export
// @access  Private (Admin with systemSettings permission)
router.get('/export', verifyAdminToken, checkAdminPermission('systemSettings'), platformConfigController.exportConfig);

// @desc    Import configuration
// @route   POST /api/admin/platform-config/import
// @access  Private (Admin with systemSettings permission)
router.post('/import', verifyAdminToken, checkAdminPermission('systemSettings'), platformConfigController.importConfig);

// ===== PLATFORM CORE SETTINGS =====

// @desc    Update platform core settings
// @route   PATCH /api/admin/platform-config/core
// @access  Private (Admin with systemSettings permission)
router.patch('/core', verifyAdminToken, checkAdminPermission('systemSettings'), platformConfigController.updateCoreSettings);

// @desc    Update maintenance mode
// @route   PATCH /api/admin/platform-config/maintenance
// @access  Private (Admin with systemSettings permission)
router.patch('/maintenance', verifyAdminToken, checkAdminPermission('systemSettings'), platformConfigController.updateMaintenanceMode);

// ===== PAYMENT SYSTEM CONFIGURATION =====

// @desc    Update payment system settings
// @route   PATCH /api/admin/platform-config/payment-system
// @access  Private (Admin with paymentSettings permission)
router.patch('/payment-system', verifyAdminToken, checkAdminPermission('paymentSettings'), platformConfigController.updatePaymentSystem);

// ===== MLM SYSTEM CONFIGURATION =====

// @desc    Update MLM system settings
// @route   PATCH /api/admin/platform-config/mlm-system
// @access  Private (Admin with mlmSettings permission)
router.patch('/mlm-system', verifyAdminToken, checkAdminPermission('mlmSettings'), (req, res) => {
    req.params.section = 'mlmSystem';
    platformConfigController.updateConfigSection(req, res);
});

// @desc    Update global payment settings
// @route   PATCH /api/admin/platform-config/global-payment
// @access  Private (Admin with paymentSettings permission)
router.patch('/global-payment', verifyAdminToken, checkAdminPermission('paymentSettings'), (req, res) => {
    req.params.section = 'paymentSystem';
    platformConfigController.updateConfigSection(req, res);
});

// ===== SECURITY CONFIGURATION =====

// @desc    Update security settings
// @route   PATCH /api/admin/platform-config/security
// @access  Private (Admin with securitySettings permission)
router.patch('/security', verifyAdminToken, checkAdminPermission('securitySettings'), platformConfigController.updateSecuritySettings);

// All security sub-settings use the main security update method

// ===== NOTIFICATION CONFIGURATION =====

// @desc    Update notification settings
// @route   PATCH /api/admin/platform-config/notifications
// @access  Private (Admin with systemSettings permission)
router.patch('/notifications', verifyAdminToken, checkAdminPermission('systemSettings'), platformConfigController.updateNotificationSettings);

// All notification sub-settings use the main notifications update method

// ===== INTEGRATION CONFIGURATION =====

// @desc    Update integration settings
// @route   PATCH /api/admin/platform-config/integrations
// @access  Private (Admin with systemSettings permission)
router.patch('/integrations', verifyAdminToken, checkAdminPermission('systemSettings'), platformConfigController.updateIntegrationSettings);

// All integration sub-settings use the main integrations update method

// ===== AI SERVICES CONFIGURATION =====

// @desc    Update AI services settings
// @route   PATCH /api/admin/platform-config/ai-services
// @access  Private (Admin with systemSettings permission)
router.patch('/ai-services', verifyAdminToken, checkAdminPermission('systemSettings'), platformConfigController.updateAiServices);

// All AI services sub-settings use the main AI services update method

// ===== WORKFLOW & AUTOMATION CONFIGURATION =====

// Additional configuration routes can use the generic updateConfigSection method

// ===== VALIDATION & TESTING =====
// Additional testing and validation routes can be added when needed

module.exports = router;
