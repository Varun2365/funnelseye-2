// services/globalSettingsService.js
// Centralized service for managing all global system settings

const AdminSystemSettings = require('../schema/AdminSystemSettings');
const mongoose = require('mongoose');

class GlobalSettingsService {
    constructor() {
        this.settings = null;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.lastCacheUpdate = 0;
    }

    /**
     * Get global settings with caching
     */
    async getSettings(forceRefresh = false) {
        const now = Date.now();
        
        // Return cached settings if still valid and not forcing refresh
        if (!forceRefresh && this.settings && (now - this.lastCacheUpdate) < this.cacheTimeout) {
            return this.settings;
        }

        try {
            // Try to get existing settings
            this.settings = await AdminSystemSettings.findOne({ settingId: 'global' });
            
            // If no settings exist, create default ones
            if (!this.settings) {
                this.settings = new AdminSystemSettings({
                    settingId: 'global'
                });
                await this.settings.save();
                console.log('✅ Created default global settings');
            }
            
            this.lastCacheUpdate = now;
            return this.settings;
        } catch (error) {
            console.error('❌ Error fetching global settings:', error);
            throw error;
        }
    }

    /**
     * Update specific section of settings
     */
    async updateSettings(section, data) {
        try {
            const settings = await this.getSettings();
            
            // Update the specific section
            if (section && data) {
                settings[section] = { ...settings[section], ...data };
            } else if (data) {
                // Update entire settings object
                Object.assign(settings, data);
            }
            
            settings.systemStatus.lastUpdated = new Date();
            await settings.save();
            
            // Clear cache to force refresh
            this.settings = null;
            this.lastCacheUpdate = 0;
            
            return settings;
        } catch (error) {
            console.error('❌ Error updating global settings:', error);
            throw error;
        }
    }

    /**
     * Get platform configuration
     */
    async getPlatformConfig() {
        const settings = await this.getSettings();
        return settings.platformConfig;
    }

    /**
     * Get database configuration
     */
    async getDatabaseConfig() {
        const settings = await this.getSettings();
        return settings.databaseConfig;
    }

    /**
     * Get CORS configuration
     */
    async getCorsConfig() {
        const settings = await this.getSettings();
        return settings.corsConfig;
    }

    /**
     * Get payment system configuration
     */
    async getPaymentConfig() {
        const settings = await this.getSettings();
        return settings.paymentSystem;
    }

    /**
     * Get MLM system configuration
     */
    async getMlmConfig() {
        const settings = await this.getSettings();
        return settings.mlmSystem;
    }

    /**
     * Get security configuration
     */
    async getSecurityConfig() {
        const settings = await this.getSettings();
        return settings.security;
    }

    /**
     * Get rate limiting configuration
     */
    async getRateLimitConfig(operation = 'global') {
        const settings = await this.getSettings();
        return settings.getRateLimit(operation);
    }

    /**
     * Get AI services configuration
     */
    async getAIConfig(service = null) {
        const settings = await this.getSettings();
        if (service) {
            return settings.getAIServiceConfig(service);
        }
        return settings.aiServices;
    }

    /**
     * Get workflow configuration
     */
    async getWorkflowConfig() {
        const settings = await this.getSettings();
        return settings.workflowConfig;
    }

    /**
     * Get staff leaderboard configuration
     */
    async getStaffLeaderboardConfig() {
        const settings = await this.getSettings();
        return settings.staffLeaderboard;
    }

    /**
     * Get lead management configuration
     */
    async getLeadManagementConfig() {
        const settings = await this.getSettings();
        return settings.leadManagement;
    }

    /**
     * Get coach availability configuration
     */
    async getCoachAvailabilityConfig() {
        const settings = await this.getSettings();
        return settings.coachAvailability;
    }

    /**
     * Get subscription configuration
     */
    async getSubscriptionConfig() {
        const settings = await this.getSettings();
        return settings.subscriptionConfig;
    }

    /**
     * Get WhatsApp configuration
     */
    async getWhatsAppConfig() {
        const settings = await this.getSettings();
        return settings.whatsApp;
    }

    /**
     * Get integrations configuration
     */
    async getIntegrationsConfig(integration = null) {
        const settings = await this.getSettings();
        if (integration) {
            return settings.getIntegrationConfig(integration);
        }
        return settings.integrations;
    }

    /**
     * Get notifications configuration
     */
    async getNotificationsConfig(type = null) {
        const settings = await this.getSettings();
        if (type) {
            return settings.getNotificationConfig(type);
        }
        return settings.notifications;
    }

    /**
     * Check if a feature is enabled
     */
    async isFeatureEnabled(feature) {
        const settings = await this.getSettings();
        return settings.isFeatureEnabled(feature);
    }

    /**
     * Get environment-specific configuration
     */
    async getEnvironmentConfig() {
        const settings = await this.getSettings();
        return {
            environment: settings.platformConfig.environment,
            debugMode: settings.platformConfig.debugMode,
            logLevel: settings.platformConfig.logLevel,
            maintenanceMode: settings.platformConfig.maintenanceMode
        };
    }

    /**
     * Get JWT configuration
     */
    async getJWTConfig() {
        const settings = await this.getSettings();
        return settings.security.jwtSettings;
    }

    /**
     * Get platform fee for category and amount
     */
    async getPlatformFee(category, amount) {
        const settings = await this.getSettings();
        return settings.getPlatformFee(category, amount);
    }

    /**
     * Get commission for MLM level
     */
    async getCommissionForLevel(level) {
        const settings = await this.getSettings();
        return settings.getCommissionForLevel(level);
    }

    /**
     * Check if coach is eligible for commission
     */
    async isCommissionEligible(coachData) {
        const settings = await this.getSettings();
        return settings.isCommissionEligible(coachData);
    }

    /**
     * Get lead temperature based on score
     */
    async getLeadTemperature(score) {
        const settings = await this.getSettings();
        return settings.getLeadTemperature(score);
    }

    /**
     * Get workflow stage configuration
     */
    async getWorkflowStage(stage) {
        const settings = await this.getSettings();
        return settings.getWorkflowStage(stage);
    }

    /**
     * Get task priority configuration
     */
    async getTaskPriority(priority) {
        const settings = await this.getSettings();
        return settings.getTaskPriority(priority);
    }

    /**
     * Get staff scoring weights
     */
    async getStaffScoringWeights() {
        const settings = await this.getSettings();
        return settings.getStaffScoringWeights();
    }

    /**
     * Get staff achievement configuration
     */
    async getStaffAchievement(achievement) {
        const settings = await this.getSettings();
        return settings.getStaffAchievement(achievement);
    }

    /**
     * Get coach availability defaults
     */
    async getCoachAvailabilityDefaults() {
        const settings = await this.getSettings();
        return settings.getCoachAvailabilityDefaults();
    }

    /**
     * Get subscription configuration
     */
    async getSubscriptionConfig() {
        const settings = await this.getSettings();
        return settings.getSubscriptionConfig();
    }

    /**
     * Get CORS configuration
     */
    async getCorsConfig() {
        const settings = await this.getSettings();
        return settings.getCorsConfig();
    }

    /**
     * Get database configuration
     */
    async getDatabaseConfig() {
        const settings = await this.getSettings();
        return settings.getDatabaseConfig();
    }

    /**
     * Initialize default settings if they don't exist
     */
    async initializeDefaultSettings() {
        try {
            const existingSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
            
            if (!existingSettings) {
                const defaultSettings = new AdminSystemSettings({
                    settingId: 'global'
                });
                
                await defaultSettings.save();
                console.log('✅ Initialized default global settings');
                return defaultSettings;
            }
            
            return existingSettings;
        } catch (error) {
            console.error('❌ Error initializing default settings:', error);
            throw error;
        }
    }

    /**
     * Reset settings to defaults
     */
    async resetToDefaults() {
        try {
            await AdminSystemSettings.deleteOne({ settingId: 'global' });
            this.settings = null;
            this.lastCacheUpdate = 0;
            
            return await this.initializeDefaultSettings();
        } catch (error) {
            console.error('❌ Error resetting settings to defaults:', error);
            throw error;
        }
    }

    /**
     * Export settings for backup
     */
    async exportSettings() {
        const settings = await this.getSettings();
        return settings.toObject();
    }

    /**
     * Import settings from backup
     */
    async importSettings(settingsData) {
        try {
            // Remove settingId to prevent conflicts
            delete settingsData.settingId;
            delete settingsData._id;
            delete settingsData.__v;
            delete settingsData.createdAt;
            delete settingsData.updatedAt;
            
            const settings = await this.getSettings();
            Object.assign(settings, settingsData);
            settings.systemStatus.lastUpdated = new Date();
            
            await settings.save();
            this.settings = null;
            this.lastCacheUpdate = 0;
            
            return settings;
        } catch (error) {
            console.error('❌ Error importing settings:', error);
            throw error;
        }
    }
}

// Create singleton instance
const globalSettingsService = new GlobalSettingsService();

module.exports = globalSettingsService;
