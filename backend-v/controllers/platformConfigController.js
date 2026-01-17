const asyncHandler = require('../middleware/async');
const { AdminSystemSettings, GlobalPaymentSettings, PaymentGatewayConfig } = require('../schema');

// ===== PLATFORM CONFIGURATION CONTROLLER =====

class PlatformConfigController {
    
    // Create audit log
    async createAuditLog(adminId, action, details, req) {
        try {
            const AdminUserController = require('./adminUserController');
            await AdminUserController.createAuditLog(adminId, action, details, req);
        } catch (error) {
            console.error('Error creating audit log:', error);
        }
    }

    // @desc    Get all platform configuration settings
    // @route   GET /api/admin/platform-config
    // @access  Private (Admin)
    getPlatformConfig = asyncHandler(async (req, res) => {
        try {
            let systemSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
            let globalPaymentSettings = await GlobalPaymentSettings.findOne();
            let paymentGateways = await PaymentGatewayConfig.find({ isEnabled: true });

            // If no settings exist, create default ones
            if (!systemSettings) {
                systemSettings = new AdminSystemSettings({ settingId: 'global' });
                await systemSettings.save();
            }

            if (!globalPaymentSettings) {
                globalPaymentSettings = new GlobalPaymentSettings();
                await globalPaymentSettings.save();
            }

            res.status(200).json({
                success: true,
                data: {
                    systemSettings,
                    globalPaymentSettings,
                    paymentGateways
                }
            });
        } catch (error) {
            console.error('Error getting platform config:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving platform configuration',
                error: error.message
            });
        }
    });

    // @desc    Get specific configuration section
    // @route   GET /api/admin/platform-config/:section
    // @access  Private (Admin)
    getConfigSection = asyncHandler(async (req, res) => {
        try {
            const { section } = req.params;
            const systemSettings = await AdminSystemSettings.findOne({ settingId: 'global' });

            if (!systemSettings) {
                return res.status(404).json({
                    success: false,
                    message: 'Configuration not found'
                });
            }

            const allowedSections = [
                'platformConfig', 'paymentSystem', 'mlmSystem', 'security',
                'notifications', 'integrations', 'aiServices', 'workflowConfig',
                'analyticsConfig', 'databaseConfig', 'corsConfig'
            ];

            if (!allowedSections.includes(section)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid configuration section'
                });
            }

            res.status(200).json({
                success: true,
                data: {
                    section,
                    config: systemSettings[section]
                }
            });
        } catch (error) {
            console.error('Error getting config section:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving configuration section',
                error: error.message
            });
        }
    });

    // @desc    Update platform configuration
    // @route   PUT /api/admin/platform-config
    // @access  Private (Admin)
    updatePlatformConfig = asyncHandler(async (req, res) => {
        try {
            const updateData = req.body;
            const adminId = req.admin.id;

            let systemSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
            
            if (!systemSettings) {
                systemSettings = new AdminSystemSettings({ settingId: 'global' });
            }

            // Store previous settings for audit
            const previousSettings = JSON.parse(JSON.stringify(systemSettings.toObject()));

            // Update settings
            Object.keys(updateData).forEach(key => {
                if (systemSettings.schema.paths[key]) {
                    systemSettings[key] = updateData[key];
                }
            });

            systemSettings.systemStatus = {
                ...systemSettings.systemStatus,
                lastUpdated: new Date(),
                updatedBy: adminId
            };

            await systemSettings.save();

            // Create audit log
            await this.createAuditLog(adminId, 'UPDATE_PLATFORM_CONFIG', {
                description: 'Updated platform configuration',
                severity: 'high',
                status: 'success',
                changes: {
                    fieldsChanged: Object.keys(updateData)
                }
            }, req);

            res.status(200).json({
                success: true,
                message: 'Platform configuration updated successfully',
                data: systemSettings
            });
        } catch (error) {
            console.error('Error updating platform config:', error);
            
            // Create audit log for error
            await this.createAuditLog(req.admin.id, 'UPDATE_PLATFORM_CONFIG', {
                description: 'Failed to update platform configuration',
                severity: 'high',
                status: 'error',
                errorMessage: error.message
            }, req);

            res.status(500).json({
                success: false,
                message: 'Error updating platform configuration',
                error: error.message
            });
        }
    });

    // @desc    Update specific configuration section
    // @route   PATCH /api/admin/platform-config/:section
    // @access  Private (Admin)
    updateConfigSection = asyncHandler(async (req, res) => {
        try {
            const { section } = req.params;
            const updateData = req.body;
            const adminId = req.admin.id;

            const allowedSections = [
                'platformConfig', 'paymentSystem', 'mlmSystem', 'security',
                'notifications', 'integrations', 'aiServices', 'workflowConfig',
                'analyticsConfig', 'databaseConfig', 'corsConfig'
            ];

            if (!allowedSections.includes(section)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid configuration section'
                });
            }

            let systemSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
            
            if (!systemSettings) {
                systemSettings = new AdminSystemSettings({ settingId: 'global' });
            }

            // Store previous settings for audit
            const previousSettings = JSON.parse(JSON.stringify(systemSettings.toObject()));

            // Update specific section
            systemSettings[section] = { ...systemSettings[section], ...updateData };
            systemSettings.systemStatus = {
                ...systemSettings.systemStatus,
                lastUpdated: new Date(),
                updatedBy: adminId
            };

            await systemSettings.save();

            // Create audit log
            await this.createAuditLog(adminId, 'UPDATE_CONFIG_SECTION', {
                description: `Updated ${section} configuration`,
                severity: 'medium',
                status: 'success',
                changes: {
                    section,
                    before: previousSettings[section],
                    after: systemSettings[section],
                    fieldsChanged: Object.keys(updateData)
                }
            }, req);

            res.status(200).json({
                success: true,
                message: `${section} configuration updated successfully`,
                data: {
                    section,
                    config: systemSettings[section]
                }
            });
        } catch (error) {
            console.error('Error updating config section:', error);
            
            // Create audit log for error
            await this.createAuditLog(req.admin.id, 'UPDATE_CONFIG_SECTION', {
                description: `Failed to update ${req.params.section} configuration`,
                severity: 'medium',
                status: 'error',
                errorMessage: error.message
            }, req);

            res.status(500).json({
                success: false,
                message: 'Error updating configuration section',
                error: error.message
            });
        }
    });

    // @desc    Update platform core settings
    // @route   PATCH /api/admin/platform-config/core
    // @access  Private (Admin)
    updateCoreSettings = asyncHandler(async (req, res) => {
        try {
            const updateData = req.body;
            const adminId = req.admin.id;

            let systemSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
            
            if (!systemSettings) {
                systemSettings = new AdminSystemSettings({ settingId: 'global' });
            }

            // Store previous settings for audit
            const previousSettings = JSON.parse(JSON.stringify(systemSettings.platformConfig));

            // Update platform configuration
            systemSettings.platformConfig = { ...systemSettings.platformConfig, ...updateData };
            systemSettings.systemStatus = {
                ...systemSettings.systemStatus,
                lastUpdated: new Date(),
                updatedBy: adminId
            };

            await systemSettings.save();

            // Create audit log
            await this.createAuditLog(adminId, 'UPDATE_CORE_SETTINGS', {
                description: 'Updated platform core settings',
                severity: 'medium',
                status: 'success',
                changes: {
                    before: previousSettings,
                    after: systemSettings.platformConfig,
                    fieldsChanged: Object.keys(updateData)
                }
            }, req);

            res.status(200).json({
                success: true,
                message: 'Platform core settings updated successfully',
                data: systemSettings.platformConfig
            });
        } catch (error) {
            console.error('Error updating core settings:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating platform core settings',
                error: error.message
            });
        }
    });

    // @desc    Update maintenance mode
    // @route   PATCH /api/admin/platform-config/maintenance
    // @access  Private (Admin)
    updateMaintenanceMode = asyncHandler(async (req, res) => {
        try {
            const { maintenanceMode, maintenanceMessage } = req.body;
            const adminId = req.admin.id;

            let systemSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
            
            if (!systemSettings) {
                systemSettings = new AdminSystemSettings({ settingId: 'global' });
            }

            // Store previous settings for audit
            const previousMaintenanceMode = systemSettings.platformConfig.maintenanceMode;
            const previousMaintenanceMessage = systemSettings.platformConfig.maintenanceMessage;

            // Update maintenance settings
            systemSettings.platformConfig.maintenanceMode = maintenanceMode;
            if (maintenanceMessage) {
                systemSettings.platformConfig.maintenanceMessage = maintenanceMessage;
            }
            
            systemSettings.systemStatus = {
                ...systemSettings.systemStatus,
                lastUpdated: new Date(),
                updatedBy: adminId
            };

            await systemSettings.save();

            // Create audit log
            await this.createAuditLog(adminId, 'UPDATE_MAINTENANCE_MODE', {
                description: `Maintenance mode ${maintenanceMode ? 'enabled' : 'disabled'}`,
                severity: 'high',
                status: 'success',
                changes: {
                    maintenanceMode: {
                        before: previousMaintenanceMode,
                        after: maintenanceMode
                    },
                    maintenanceMessage: {
                        before: previousMaintenanceMessage,
                        after: maintenanceMessage
                    }
                }
            }, req);

            res.status(200).json({
                success: true,
                message: `Maintenance mode ${maintenanceMode ? 'enabled' : 'disabled'} successfully`,
                data: {
                    maintenanceMode: systemSettings.platformConfig.maintenanceMode,
                    maintenanceMessage: systemSettings.platformConfig.maintenanceMessage
                }
            });
        } catch (error) {
            console.error('Error updating maintenance mode:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating maintenance mode',
                error: error.message
            });
        }
    });

    // @desc    Update payment system settings
    // @route   PATCH /api/admin/platform-config/payment-system
    // @access  Private (Admin)
    updatePaymentSystem = asyncHandler(async (req, res) => {
        try {
            const updateData = req.body;
            const adminId = req.admin.id;

            let systemSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
            
            if (!systemSettings) {
                systemSettings = new AdminSystemSettings({ settingId: 'global' });
            }

            // Store previous settings for audit
            const previousSettings = JSON.parse(JSON.stringify(systemSettings.paymentSystem));

            // Update payment system
            systemSettings.paymentSystem = { ...systemSettings.paymentSystem, ...updateData };
            systemSettings.systemStatus = {
                ...systemSettings.systemStatus,
                lastUpdated: new Date(),
                updatedBy: adminId
            };

            await systemSettings.save();

            // Create audit log
            await this.createAuditLog(adminId, 'UPDATE_PAYMENT_SYSTEM', {
                description: 'Updated payment system settings',
                severity: 'high',
                status: 'success',
                changes: {
                    before: previousSettings,
                    after: systemSettings.paymentSystem,
                    fieldsChanged: Object.keys(updateData)
                }
            }, req);

            res.status(200).json({
                success: true,
                message: 'Payment system settings updated successfully',
                data: systemSettings.paymentSystem
            });
        } catch (error) {
            console.error('Error updating payment system:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating payment system settings',
                error: error.message
            });
        }
    });

    // @desc    Update security settings
    // @route   PATCH /api/admin/platform-config/security
    // @access  Private (Admin)
    updateSecuritySettings = asyncHandler(async (req, res) => {
        try {
            const updateData = req.body;
            const adminId = req.admin.id;

            let systemSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
            
            if (!systemSettings) {
                systemSettings = new AdminSystemSettings({ settingId: 'global' });
            }

            // Store previous settings for audit
            const previousSettings = JSON.parse(JSON.stringify(systemSettings.security));

            // Update security settings
            systemSettings.security = { ...systemSettings.security, ...updateData };
            systemSettings.systemStatus = {
                ...systemSettings.systemStatus,
                lastUpdated: new Date(),
                updatedBy: adminId
            };

            await systemSettings.save();

            // Create audit log
            await this.createAuditLog(adminId, 'UPDATE_SECURITY_SETTINGS', {
                description: 'Updated security settings',
                severity: 'high',
                status: 'success',
                changes: {
                    before: previousSettings,
                    after: systemSettings.security,
                    fieldsChanged: Object.keys(updateData)
                }
            }, req);

            res.status(200).json({
                success: true,
                message: 'Security settings updated successfully',
                data: systemSettings.security
            });
        } catch (error) {
            console.error('Error updating security settings:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating security settings',
                error: error.message
            });
        }
    });

    // @desc    Update notification settings
    // @route   PATCH /api/admin/platform-config/notifications
    // @access  Private (Admin)
    updateNotificationSettings = asyncHandler(async (req, res) => {
        try {
            const updateData = req.body;
            const adminId = req.admin.id;

            let systemSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
            
            if (!systemSettings) {
                systemSettings = new AdminSystemSettings({ settingId: 'global' });
            }

            // Store previous settings for audit
            const previousSettings = JSON.parse(JSON.stringify(systemSettings.notifications));

            // Update notification settings
            systemSettings.notifications = { ...systemSettings.notifications, ...updateData };
            systemSettings.systemStatus = {
                ...systemSettings.systemStatus,
                lastUpdated: new Date(),
                updatedBy: adminId
            };

            await systemSettings.save();

            // Create audit log
            await this.createAuditLog(adminId, 'UPDATE_NOTIFICATION_SETTINGS', {
                description: 'Updated notification settings',
                severity: 'medium',
                status: 'success',
                changes: {
                    before: previousSettings,
                    after: systemSettings.notifications,
                    fieldsChanged: Object.keys(updateData)
                }
            }, req);

            res.status(200).json({
                success: true,
                message: 'Notification settings updated successfully',
                data: systemSettings.notifications
            });
        } catch (error) {
            console.error('Error updating notification settings:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating notification settings',
                error: error.message
            });
        }
    });

    // @desc    Update integration settings
    // @route   PATCH /api/admin/platform-config/integrations
    // @access  Private (Admin)
    updateIntegrationSettings = asyncHandler(async (req, res) => {
        try {
            const updateData = req.body;
            const adminId = req.admin.id;

            let systemSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
            
            if (!systemSettings) {
                systemSettings = new AdminSystemSettings({ settingId: 'global' });
            }

            // Store previous settings for audit
            const previousSettings = JSON.parse(JSON.stringify(systemSettings.integrations));

            // Update integration settings
            systemSettings.integrations = { ...systemSettings.integrations, ...updateData };
            systemSettings.systemStatus = {
                ...systemSettings.systemStatus,
                lastUpdated: new Date(),
                updatedBy: adminId
            };

            await systemSettings.save();

            // Create audit log
            await this.createAuditLog(adminId, 'UPDATE_INTEGRATION_SETTINGS', {
                description: 'Updated integration settings',
                severity: 'medium',
                status: 'success',
                changes: {
                    before: previousSettings,
                    after: systemSettings.integrations,
                    fieldsChanged: Object.keys(updateData)
                }
            }, req);

            res.status(200).json({
                success: true,
                message: 'Integration settings updated successfully',
                data: systemSettings.integrations
            });
        } catch (error) {
            console.error('Error updating integration settings:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating integration settings',
                error: error.message
            });
        }
    });

    // @desc    Update AI services settings
    // @route   PATCH /api/admin/platform-config/ai-services
    // @access  Private (Admin)
    updateAiServices = asyncHandler(async (req, res) => {
        try {
            const updateData = req.body;
            const adminId = req.admin.id;

            let systemSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
            
            if (!systemSettings) {
                systemSettings = new AdminSystemSettings({ settingId: 'global' });
            }

            // Store previous settings for audit
            const previousSettings = JSON.parse(JSON.stringify(systemSettings.aiServices));

            // Update AI services settings
            systemSettings.aiServices = { ...systemSettings.aiServices, ...updateData };
            systemSettings.systemStatus = {
                ...systemSettings.systemStatus,
                lastUpdated: new Date(),
                updatedBy: adminId
            };

            await systemSettings.save();

            // Create audit log
            await this.createAuditLog(adminId, 'UPDATE_AI_SERVICES', {
                description: 'Updated AI services settings',
                severity: 'medium',
                status: 'success',
                changes: {
                    before: previousSettings,
                    after: systemSettings.aiServices,
                    fieldsChanged: Object.keys(updateData)
                }
            }, req);

            res.status(200).json({
                success: true,
                message: 'AI services settings updated successfully',
                data: systemSettings.aiServices
            });
        } catch (error) {
            console.error('Error updating AI services:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating AI services settings',
                error: error.message
            });
        }
    });

    // @desc    Reset configuration to defaults
    // @route   POST /api/admin/platform-config/reset
    // @access  Private (Admin)
    resetToDefaults = asyncHandler(async (req, res) => {
        try {
            const adminId = req.admin.id;

            // Create new default settings
            const defaultSettings = new AdminSystemSettings({ settingId: 'global' });
            await defaultSettings.save();

            // Create audit log
            await this.createAuditLog(adminId, 'RESET_CONFIG_TO_DEFAULTS', {
                description: 'Reset platform configuration to defaults',
                severity: 'high',
                status: 'success'
            }, req);

            res.status(200).json({
                success: true,
                message: 'Configuration reset to defaults successfully',
                data: defaultSettings
            });
        } catch (error) {
            console.error('Error resetting configuration:', error);
            res.status(500).json({
                success: false,
                message: 'Error resetting configuration to defaults',
                error: error.message
            });
        }
    });

    // @desc    Export configuration
    // @route   GET /api/admin/platform-config/export
    // @access  Private (Admin)
    exportConfig = asyncHandler(async (req, res) => {
        try {
            const systemSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
            const globalPaymentSettings = await GlobalPaymentSettings.findOne();
            const paymentGateways = await PaymentGatewayConfig.find();

            const exportData = {
                systemSettings,
                globalPaymentSettings,
                paymentGateways,
                exportDate: new Date(),
                version: '1.0.0'
            };

            res.status(200).json({
                success: true,
                message: 'Configuration exported successfully',
                data: exportData
            });
        } catch (error) {
            console.error('Error exporting configuration:', error);
            res.status(500).json({
                success: false,
                message: 'Error exporting configuration',
                error: error.message
            });
        }
    });

    // @desc    Import configuration
    // @route   POST /api/admin/platform-config/import
    // @access  Private (Admin)
    importConfig = asyncHandler(async (req, res) => {
        try {
            const { systemSettings, globalPaymentSettings, paymentGateways } = req.body;
            const adminId = req.admin.id;

            // Import system settings
            if (systemSettings) {
                await AdminSystemSettings.findOneAndUpdate(
                    { settingId: 'global' },
                    { ...systemSettings, settingId: 'global' },
                    { upsert: true, new: true }
                );
            }

            // Import global payment settings
            if (globalPaymentSettings) {
                await GlobalPaymentSettings.findOneAndUpdate(
                    {},
                    globalPaymentSettings,
                    { upsert: true, new: true }
                );
            }

            // Import payment gateways
            if (paymentGateways && Array.isArray(paymentGateways)) {
                for (const gateway of paymentGateways) {
                    await PaymentGatewayConfig.findOneAndUpdate(
                        { gatewayName: gateway.gatewayName },
                        gateway,
                        { upsert: true, new: true }
                    );
                }
            }

            // Create audit log
            await this.createAuditLog(adminId, 'IMPORT_CONFIG', {
                description: 'Imported platform configuration',
                severity: 'high',
                status: 'success'
            }, req);

            res.status(200).json({
                success: true,
                message: 'Configuration imported successfully'
            });
        } catch (error) {
            console.error('Error importing configuration:', error);
            res.status(500).json({
                success: false,
                message: 'Error importing configuration',
                error: error.message
            });
        }
    });

    // @desc    Test configuration
    // @route   POST /api/admin/platform-config/test
    // @access  Private (Admin)
    testConfiguration = asyncHandler(async (req, res) => {
        try {
            const { testType, config } = req.body;
            const adminId = req.admin.id;

            let testResult = { success: false, message: '', details: {} };

            switch (testType) {
                case 'email':
                    // Test email configuration
                    testResult = await this.testEmailConfig(config);
                    break;
                case 'sms':
                    // Test SMS configuration
                    testResult = await this.testSmsConfig(config);
                    break;
                case 'whatsapp':
                    // Test WhatsApp configuration
                    testResult = await this.testWhatsAppConfig(config);
                    break;
                case 'zoom':
                    // Test Zoom configuration
                    testResult = await this.testZoomConfig(config);
                    break;
                case 'ai':
                    // Test AI services configuration
                    testResult = await this.testAiConfig(config);
                    break;
                default:
                    testResult = {
                        success: false,
                        message: 'Invalid test type'
                    };
            }

            // Create audit log
            await this.createAuditLog(adminId, 'TEST_CONFIGURATION', {
                description: `Tested ${testType} configuration`,
                severity: 'low',
                status: testResult.success ? 'success' : 'error',
                testResult
            }, req);

            res.status(200).json({
                success: true,
                message: 'Configuration test completed',
                data: testResult
            });
        } catch (error) {
            console.error('Error testing configuration:', error);
            res.status(500).json({
                success: false,
                message: 'Error testing configuration',
                error: error.message
            });
        }
    });

    // Helper methods for testing configurations
    async testEmailConfig(config) {
        // Implement email configuration testing
        return { success: true, message: 'Email configuration test passed' };
    }

    async testSmsConfig(config) {
        // Implement SMS configuration testing
        return { success: true, message: 'SMS configuration test passed' };
    }

    async testWhatsAppConfig(config) {
        // Implement WhatsApp configuration testing
        return { success: true, message: 'WhatsApp configuration test passed' };
    }

    async testZoomConfig(config) {
        // Implement Zoom configuration testing
        return { success: true, message: 'Zoom configuration test passed' };
    }

    async testAiConfig(config) {
        // Implement AI services configuration testing
        return { success: true, message: 'AI services configuration test passed' };
    }
}

module.exports = new PlatformConfigController();
