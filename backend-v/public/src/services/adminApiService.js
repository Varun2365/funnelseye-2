// Admin API Service - Comprehensive service for all admin endpoints
import apiConfig from '../config/apiConfig.js';

class AdminApiService {
    constructor() {
        this.token = localStorage.getItem('adminToken');
        this.apiBaseUrl = apiConfig.apiBaseUrl;
        console.log('🔐 [AdminApiService] Initialized with token:', this.token ? `${this.token.substring(0, 20)}...` : 'NO TOKEN');
        console.log('🔗 [AdminApiService] Using API Base URL:', this.apiBaseUrl);
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('adminToken', token);
    }

    // Handle token expiration
    handleTokenExpiration() {
        console.log('🔐 [AdminApiService] Handling token expiration...');
        // Clear the token
        this.token = null;
        localStorage.removeItem('adminToken');
        
        // Redirect to login page
        if (typeof window !== 'undefined') {
            window.location.href = '/admin-login.html';
        }
    }

    // Get authentication headers
    getHeaders() {
        const token = this.token || localStorage.getItem('adminToken');
        console.log('🔐 [AdminApiService] Using token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    // Generic API call method
    async apiCall(endpoint, options = {}) {
        const url = apiConfig.getApiUrl(endpoint);
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        console.log(`🚀 [AdminApiService] Making API call to: ${url}`);
        console.log(`📋 [AdminApiService] Request config:`, {
            method: config.method || 'GET',
            headers: config.headers,
            body: config.body ? 'Present' : 'None'
        });

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            console.log(`📊 [AdminApiService] Response status: ${response.status}`);
            console.log(`📄 [AdminApiService] Response data:`, data);

            if (!response.ok) {
                // Handle token expiration
                if (response.status === 401) {
                    console.log('🔐 [AdminApiService] Token expired or invalid, redirecting to login');
                    this.handleTokenExpiration();
                }
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`❌ [AdminApiService] API call failed for ${endpoint}:`, error);
            throw error;
        }
    }

    // ===== AUTHENTICATION =====
    async login(credentials) {
        return this.apiCall('/admin/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    async logout() {
        return this.apiCall('/admin/auth/logout', {
            method: 'POST'
        });
    }

    async getProfile() {
        return this.apiCall('/admin/auth/profile');
    }

    async changePassword(passwordData) {
        return this.apiCall('/admin/auth/change-password', {
            method: 'POST',
            body: JSON.stringify(passwordData)
        });
    }

    // ===== SYSTEM DASHBOARD =====
    async getDashboard() {
        return this.apiCall('/admin/v1/dashboard');
    }

    async getSystemHealth() {
        return this.apiCall('/admin/v1/system-health');
    }

    async getRevenueTrends() {
        return this.apiCall('/admin/v1/revenue-trends');
    }

    async getTopPerformingCoaches() {
        return this.apiCall('/admin/v1/top-coaches');
    }

    async getSystemAnalytics() {
        return this.apiCall('/admin/v1/platform-analytics');
    }

    async exportSystemAnalytics() {
        return this.apiCall('/admin/v1/platform-analytics/export');
    }

    // ===== SYSTEM SETTINGS =====
    async getSystemSettings() {
        return this.apiCall('/admin/system/settings');
    }

    async updateSystemSettings(settings) {
        return this.apiCall('/admin/system/settings', {
            method: 'PUT',
            body: JSON.stringify(settings)
        });
    }

    async updateSettingsSection(section, data) {
        return this.apiCall(`/admin/system/settings/${section}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    async toggleMaintenanceMode() {
        return this.apiCall('/admin/system/maintenance', {
            method: 'POST'
        });
    }

    // ===== SYSTEM LOGS =====
    async getSystemLogs(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.apiCall(`/admin/system/logs${queryString ? `?${queryString}` : ''}`);
    }

    async clearSystemLogs() {
        return this.apiCall('/admin/system/logs', {
            method: 'DELETE'
        });
    }

    // ===== USER MANAGEMENT =====
    async getUsers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/admin/v1/users${queryString ? `?${queryString}` : ''}`;
        console.log(`👥 [UserManagement] Getting users with params:`, params);
        return this.apiCall(endpoint);
    }

    async getUserById(userId) {
        console.log(`👤 [UserManagement] Getting user by ID:`, userId);
        return this.apiCall(`/admin/v1/users/${userId}`);
    }

    async updateUser(userId, userData) {
        console.log(`✏️ [UserManagement] Updating user:`, userId, userData);
        return this.apiCall(`/admin/v1/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    async updateUserStatus(userId, status) {
        console.log(`🔄 [UserManagement] Updating user status:`, userId, status);
        // Using updateUser endpoint with status field
        return this.apiCall(`/admin/v1/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    async deleteUser(userId) {
        console.log(`🗑️ [UserManagement] Deleting user:`, userId);
        // Using updateUser endpoint with deletedAt field
        return this.apiCall(`/admin/v1/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify({ deletedAt: new Date().toISOString() })
        });
    }

    async restoreUser(userId) {
        console.log(`🔄 [UserManagement] Restoring user:`, userId);
        // Using updateUser endpoint with deletedAt: null
        return this.apiCall(`/admin/v1/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify({ deletedAt: null })
        });
    }

    async getUserAnalytics() {
        console.log(`📊 [UserManagement] Getting user analytics`);
        return this.apiCall('/admin/v1/analytics?metric=users');
    }

    async bulkUpdateUsers(updates) {
        console.log(`🔄 [UserManagement] Bulk updating users:`, updates.length, 'users');
        return this.apiCall('/admin/v1/users/bulk-update', {
            method: 'POST',
            body: JSON.stringify({ updates })
        });
    }

    async exportUsers(format = 'csv', includeDeleted = false) {
        console.log(`📊 [UserManagement] Exporting users as ${format}`);
        const queryString = new URLSearchParams({ format, includeDeleted }).toString();
        return this.apiCall(`/admin/v1/users/export?${queryString}`);
    }

    async createUser(userData) {
        console.log(`➕ [UserManagement] Creating new user:`, userData.email);
        return this.apiCall('/admin/v1/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async bulkDeleteUsers(userIds, permanent = false) {
        console.log(`🗑️ [UserManagement] Bulk deleting users:`, userIds.length, 'users');
        return this.apiCall('/admin/v1/users/bulk-delete', {
            method: 'POST',
            body: JSON.stringify({ userIds, permanent })
        });
    }

    async debugSubscriptionPlans() {
        console.log(`🔍 [DEBUG] Testing subscription plans debug endpoint`);
        return this.apiCall('/admin/v1/debug/subscription-plans');
    }

    async getSubscriptionPlans(params = {}) {
        console.log(`📋 [SubscriptionPlans] Getting subscription plans`);
        const queryString = new URLSearchParams(params).toString();
        return this.apiCall(`/admin/v1/subscription-plans${queryString ? `?${queryString}` : ''}`);
    }

    async createSubscriptionPlan(planData) {
        console.log(`📋 [SubscriptionPlans] Creating subscription plan`);
        return this.apiCall('/admin/v1/subscription-plans', {
            method: 'POST',
            body: JSON.stringify(planData)
        });
    }

    async getSubscriptionPlanById(planId) {
        console.log(`📋 [SubscriptionPlans] Getting subscription plan by ID: ${planId}`);
        return this.apiCall(`/admin/v1/subscription-plans/${planId}`);
    }

    async updateSubscriptionPlan(planId, planData) {
        console.log(`📋 [SubscriptionPlans] Updating subscription plan: ${planId}`);
        return this.apiCall(`/admin/v1/subscription-plans/${planId}`, {
            method: 'PUT',
            body: JSON.stringify(planData)
        });
    }

    async deleteSubscriptionPlan(planId) {
        console.log(`📋 [SubscriptionPlans] Deleting subscription plan: ${planId}`);
        return this.apiCall(`/admin/v1/subscription-plans/${planId}`, {
            method: 'DELETE'
        });
    }

    async toggleSubscriptionPlanStatus(planId) {
        console.log(`📋 [SubscriptionPlans] Toggling subscription plan status: ${planId}`);
        return this.apiCall(`/admin/v1/subscription-plans/${planId}/toggle-status`, {
            method: 'PUT'
        });
    }

    async duplicateSubscriptionPlan(planId, data = {}) {
        console.log(`📋 [SubscriptionPlans] Duplicating subscription plan: ${planId}`);
        return this.apiCall(`/admin/v1/subscription-plans/${planId}/duplicate`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async getSubscriptionPlanAnalytics(params = {}) {
        console.log(`📋 [SubscriptionPlans] Getting subscription plan analytics`);
        const queryString = new URLSearchParams(params).toString();
        return this.apiCall(`/admin/v1/subscription-plans/analytics${queryString ? `?${queryString}` : ''}`);
    }

    async subscribeCoachToPlan(data) {
        console.log(`📋 [SubscriptionPlans] Subscribing coach to plan`);
        return this.apiCall('/admin/v1/subscription-plans/subscribe-coach', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // ===== AUDIT LOGS =====
    async getAuditLogs(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.apiCall(`/admin/audit-logs${queryString ? `?${queryString}` : ''}`);
    }

    async getAuditLogById(logId) {
        return this.apiCall(`/admin/audit-logs/${logId}`);
    }

    async exportAuditLogs(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.apiCall(`/admin/audit-logs/export${queryString ? `?${queryString}` : ''}`);
    }

    // ===== MLM MANAGEMENT =====
    async getMlmSettings() {
        return this.apiCall('/admin/mlm/settings');
    }

    async updateMlmSettings(settings) {
        return this.apiCall('/admin/mlm/settings', {
            method: 'PUT',
            body: JSON.stringify(settings)
        });
    }

    async getMlmAnalytics() {
        return this.apiCall('/admin/mlm/analytics');
    }

    async getMlmHierarchy() {
        return this.apiCall('/admin/mlm/hierarchy');
    }

    async updateMlmHierarchy(hierarchyData) {
        return this.apiCall('/admin/mlm/hierarchy', {
            method: 'PUT',
            body: JSON.stringify(hierarchyData)
        });
    }

    // ===== FINANCIAL MANAGEMENT =====
    async getFinancialDashboard() {
        return this.apiCall('/admin/financial/dashboard');
    }

    async getFinancialAnalytics() {
        return this.apiCall('/admin/financial/analytics');
    }

    async getTransactions(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.apiCall(`/admin/financial/transactions${queryString ? `?${queryString}` : ''}`);
    }

    async exportFinancialData(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.apiCall(`/admin/financial/export${queryString ? `?${queryString}` : ''}`);
    }

    // ===== SECURITY MANAGEMENT =====
    async getSecurityDashboard() {
        return this.apiCall('/admin/security/dashboard');
    }

    async getSecurityLogs(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.apiCall(`/admin/security/logs${queryString ? `?${queryString}` : ''}`);
    }

    async getFailedLogins(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.apiCall(`/admin/security/failed-logins${queryString ? `?${queryString}` : ''}`);
    }

    async blockUser(userId) {
        return this.apiCall(`/admin/security/block-user/${userId}`, {
            method: 'POST'
        });
    }

    async unblockUser(userId) {
        return this.apiCall(`/admin/security/unblock-user/${userId}`, {
            method: 'POST'
        });
    }

    // ===== PAYMENT MANAGEMENT =====
    async getPaymentSettings() {
        return this.apiCall('/paymentsv1/admin/mlm-commission-settings');
    }

    async updatePaymentSettings(settings) {
        return this.apiCall('/paymentsv1/admin/update-mlm-commission-settings', {
            method: 'POST',
            body: JSON.stringify(settings)
        });
    }

    async getRazorpayConfig() {
        return this.apiCall('/paymentsv1/admin/razorpay-status');
    }

    async updateRazorpayConfig(config) {
        return this.apiCall('/paymentsv1/admin/razorpay-config', {
            method: 'POST',
            body: JSON.stringify(config)
        });
    }

    async getCommissionPayouts() {
        return this.apiCall('/admin/financial/commission-payouts');
    }

    async getPaymentAnalytics() {
        return this.apiCall('/admin/financial/payment-analytics');
    }

    async updatePaymentSettings(section, data) {
        return this.apiCall('/admin/financial/payment-settings', {
            method: 'PUT',
            body: JSON.stringify({ section, data })
        });
    }

    async getUnifiedPaymentSettings() {
        return this.apiCall('/unified-payments/settings');
    }

    async updateUnifiedPaymentSettings(settings) {
        return this.apiCall('/unified-payments/settings', {
            method: 'PUT',
            body: JSON.stringify(settings)
        });
    }

    async testPaymentGateway(gatewayName) {
        return this.apiCall(`/admin/financial/payment-gateways/${gatewayName}/test`, {
            method: 'POST'
        });
    }

    async processCommissionPayout(paymentId) {
        return this.apiCall(`/admin/financial/commission-payouts/${paymentId}/process`, {
            method: 'POST'
        });
    }

    async testRazorpay() {
        return this.apiCall('/paymentsv1/admin/test-razorpay');
    }

    // ===== PAYOUT MANAGEMENT =====
    async setupCoachForPayouts(coachId) {
        return this.apiCall(`/paymentsv1/sending/setup-razorpay-coach/${coachId}`, {
            method: 'POST'
        });
    }

    async setupCoachPaymentCollection(coachId, paymentData) {
        return this.apiCall(`/paymentsv1/admin/setup-coach-payment-collection/${coachId}`, {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
    }

    async processSinglePayout(payoutData) {
        return this.apiCall('/paymentsv1/sending/razorpay-payout', {
            method: 'POST',
            body: JSON.stringify(payoutData)
        });
    }

    async processMonthlyPayouts(period, dryRun = false) {
        return this.apiCall('/paymentsv1/sending/monthly-razorpay-payouts', {
            method: 'POST',
            body: JSON.stringify({ period, dryRun })
        });
    }

    async processMlmCommissionPayouts(period, dryRun = false) {
        return this.apiCall('/paymentsv1/sending/monthly-mlm-commission-payouts', {
            method: 'POST',
            body: JSON.stringify({ period, dryRun })
        });
    }

    async getMlmCommissionSummary(coachId, period) {
        return this.apiCall(`/paymentsv1/sending/mlm-commission-summary/${coachId}?period=${period}`);
    }

    async getPayoutStatus(payoutId) {
        return this.apiCall(`/paymentsv1/sending/razorpay-payout-status/${payoutId}`);
    }

    async syncPayoutStatus(payoutId) {
        return this.apiCall(`/paymentsv1/sending/sync-razorpay-status/${payoutId}`, {
            method: 'POST'
        });
    }

    async getPayoutHistory(coachId, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.apiCall(`/paymentsv1/sending/payout-history/${coachId}${queryString ? `?${queryString}` : ''}`);
    }

    // ===== PRODUCT MANAGEMENT =====
    async getAdminProducts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.apiCall(`/paymentsv1/admin/products${queryString ? `?${queryString}` : ''}`);
    }

    async createAdminProduct(productData) {
        return this.apiCall('/paymentsv1/admin/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    async updateAdminProduct(productId, productData) {
        return this.apiCall(`/paymentsv1/admin/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    }

    async deleteAdminProduct(productId) {
        return this.apiCall(`/paymentsv1/admin/products/${productId}`, {
            method: 'DELETE'
        });
    }

    async updateProductStatus(productId, status) {
        return this.apiCall(`/paymentsv1/admin/products/${productId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    // ===== COACH MANAGEMENT =====
    async getCoaches(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.apiCall(`/paymentsv1/admin/coaches${queryString ? `?${queryString}` : ''}`);
    }

    async getCoachById(coachId) {
        return this.apiCall(`/paymentsv1/admin/coaches/${coachId}`);
    }

    async updateCoach(coachId, coachData) {
        return this.apiCall(`/paymentsv1/admin/coaches/${coachId}`, {
            method: 'PUT',
            body: JSON.stringify(coachData)
        });
    }

    async getCoachPlans(coachId, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.apiCall(`/paymentsv1/admin/coaches/${coachId}/plans${queryString ? `?${queryString}` : ''}`);
    }

    async getCoachTransactions(coachId, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.apiCall(`/paymentsv1/admin/coaches/${coachId}/transactions${queryString ? `?${queryString}` : ''}`);
    }

    // ===== ANALYTICS & REPORTS =====
    async getAnalyticsOverview() {
        return this.apiCall('/admin/analytics/overview');
    }

    async getAnalyticsByPeriod(period) {
        return this.apiCall(`/admin/analytics/period/${period}`);
    }

    async exportAnalytics(period, format = 'csv') {
        return this.apiCall(`/admin/analytics/export?period=${period}&format=${format}`);
    }

    // ===== UTILITY METHODS =====
    async uploadFile(file, endpoint = '/files/upload') {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(apiConfig.getApiUrl(endpoint), {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }

        return response.json();
    }

    async downloadFile(endpoint, filename) {
        const response = await fetch(apiConfig.getApiUrl(endpoint), {
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Download failed: ${response.statusText}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.token;
    }

    // Clear authentication
    clearAuth() {
        this.token = null;
        localStorage.removeItem('adminToken');
    }

    // ===== PLATFORM CONFIGURATION API =====

    async getPlatformConfig() {
        return this.apiCall('/admin/platform-config');
    }

    async getConfigSection(section) {
        return this.apiCall(`/admin/platform-config/${section}`);
    }

    async updatePlatformConfig(data) {
        return this.apiCall('/admin/platform-config', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async updateConfigSection(section, data) {
        return this.apiCall(`/admin/platform-config/${section}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    async updateCoreSettings(data) {
        return this.apiCall('/admin/platform-config/core', {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    async updateMaintenanceMode(data) {
        return this.apiCall('/admin/platform-config/maintenance', {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    async updatePaymentSystem(data) {
        return this.apiCall('/admin/platform-config/payment-system', {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    async updateSecuritySettings(data) {
        return this.apiCall('/admin/platform-config/security', {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    async updateNotificationSettings(data) {
        return this.apiCall('/admin/platform-config/notifications', {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    async updateIntegrationSettings(data) {
        return this.apiCall('/admin/platform-config/integrations', {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    async updateAiServices(data) {
        return this.apiCall('/admin/platform-config/ai-services', {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    async exportConfig() {
        return this.apiCall('/admin/platform-config/export');
    }

    async importConfig(data) {
        return this.apiCall('/admin/platform-config/import', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // Financial Management Methods
    async getFinancialSettings() {
        console.log(`💰 [Financial] Getting financial settings`);
        return this.apiCall('/admin/v1/financial/settings');
    }

    async updateFinancialSettings(settings) {
        console.log(`💰 [Financial] Updating financial settings`);
        return this.apiCall('/admin/v1/financial/settings', {
            method: 'PUT',
            body: JSON.stringify(settings)
        });
    }

    async getRevenueStats() {
        console.log(`💰 [Financial] Getting revenue statistics`);
        return this.apiCall('/admin/v1/financial/revenue-stats');
    }

    async getCoachesForPayout() {
        console.log(`💰 [Financial] Getting coaches for payout`);
        return this.apiCall('/admin/v1/financial/coaches-payout');
    }

    async getPaymentHistory() {
        console.log(`💰 [Financial] Getting payment history`);
        return this.apiCall('/admin/v1/financial/payment-history');
    }

    async processCoachPayout(coachId, amount, currency = 'INR', purpose = 'payout', mode = 'IMPS', narration = 'Manual payout') {
        console.log(`💰 [Financial] Processing Razorpay payout for coach ${coachId}: ₹${amount}`);
        return this.apiCall('/paymentsv1/sending/razorpay-payout', {
            method: 'POST',
            body: JSON.stringify({ 
                coachId, 
                amount, 
                currency, 
                purpose, 
                mode, 
                narration 
            })
        });
    }

    async processPayoutAll() {
        console.log(`💰 [Financial] Processing monthly Razorpay payouts for all eligible coaches`);
        return this.apiCall('/paymentsv1/sending/monthly-razorpay-payouts', {
            method: 'POST',
            body: JSON.stringify({ period: 'current' })
        });
    }

    async refreshRazorpayBalance() {
        console.log(`💰 [Financial] Refreshing Razorpay balance`);
        return this.apiCall('/admin/v1/financial/refresh-balance', {
            method: 'POST'
        });
    }

    // Additional payout methods from paymentsv1Routes.js
    async setupRazorpayCoach(coachId) {
        console.log(`💰 [Financial] Setting up Razorpay for coach ${coachId}`);
        return this.apiCall(`/paymentsv1/sending/setup-razorpay-coach/${coachId}`, {
            method: 'POST'
        });
    }

    async getRazorpayPayoutStatus(payoutId) {
        console.log(`💰 [Financial] Getting Razorpay payout status for ${payoutId}`);
        return this.apiCall(`/paymentsv1/sending/razorpay-payout-status/${payoutId}`);
    }

    async syncRazorpayPayoutStatus(payoutId) {
        console.log(`💰 [Financial] Syncing Razorpay payout status for ${payoutId}`);
        return this.apiCall(`/paymentsv1/sending/sync-razorpay-status/${payoutId}`, {
            method: 'POST'
        });
    }

    async getRazorpayStatus() {
        console.log(`💰 [Financial] Getting Razorpay configuration status`);
        return this.apiCall('/paymentsv1/admin/razorpay-status');
    }

    async testRazorpayModule() {
        console.log(`💰 [Financial] Testing Razorpay module`);
        return this.apiCall('/paymentsv1/admin/test-razorpay');
    }

    async updateRazorpayConfig(config) {
        console.log(`💰 [Financial] Updating Razorpay configuration`);
        return this.apiCall('/paymentsv1/admin/razorpay-config', {
            method: 'POST',
            body: JSON.stringify(config)
        });
    }

    async setupCoachPaymentCollection(coachId, paymentDetails) {
        console.log(`💰 [Financial] Setting up payment collection for coach ${coachId}`);
        return this.apiCall(`/paymentsv1/admin/setup-coach-payment-collection/${coachId}`, {
            method: 'POST',
            body: JSON.stringify(paymentDetails)
        });
    }

    // ===== WHATSAPP ADMIN MANAGEMENT =====
    
    async setupCentralWhatsApp(whatsappData) {
        console.log(`📱 [WhatsApp] Setting up central WhatsApp configuration`);
        return this.apiCall('/central-messaging/v1/setup', {
            method: 'POST',
            body: JSON.stringify(whatsappData)
        });
    }

    async getCentralWhatsAppConfig() {
        console.log(`📱 [WhatsApp] Getting central WhatsApp configuration`);
        return this.apiCall('/central-messaging/v1/config');
    }

    async updateCentralWhatsAppConfig(configData) {
        console.log(`📱 [WhatsApp] Updating central WhatsApp configuration`);
        return this.apiCall('/central-messaging/v1/config', {
            method: 'PUT',
            body: JSON.stringify(configData)
        });
    }

    async getCreditSettings() {
        console.log(`📱 [WhatsApp] Getting credit settings`);
        return this.apiCall('/central-messaging/v1/credit-settings');
    }

    async updateCreditSettings(creditData) {
        console.log(`📱 [WhatsApp] Updating credit settings`);
        return this.apiCall('/central-messaging/v1/credit-settings', {
            method: 'PUT',
            body: JSON.stringify(creditData)
        });
    }

    async getWhatsAppSettingsOverview() {
        console.log(`📱 [WhatsApp] Getting settings overview`);
        return this.apiCall('/central-messaging/v1/settings-overview');
    }

    async testWhatsAppConfiguration() {
        console.log(`📱 [WhatsApp] Testing WhatsApp configuration`);
        return this.apiCall('/central-messaging/v1/test-config');
    }

    async getWhatsAppHealth() {
        console.log(`📱 [WhatsApp] Getting WhatsApp health status`);
        return this.apiCall('/central-messaging/v1/health');
    }

    async getWhatsAppTemplates() {
        console.log(`📱 [WhatsApp] Getting WhatsApp templates`);
        return this.apiCall('/central-messaging/v1/admin/whatsapp/templates');
    }

    async createWhatsAppTemplate(templateData) {
        console.log(`📱 [WhatsApp] Creating WhatsApp template`);
        return this.apiCall('/central-messaging/v1/admin/whatsapp/templates', {
            method: 'POST',
            body: JSON.stringify(templateData)
        });
    }

    async syncWhatsAppTemplates() {
        console.log(`📱 [WhatsApp] Syncing WhatsApp templates`);
        return this.apiCall('/central-messaging/v1/admin/whatsapp/templates/sync', {
            method: 'POST'
        });
    }

    async sendWhatsAppTestMessage(messageData) {
        console.log(`📱 [WhatsApp] Sending test message`);
        return this.apiCall('/central-messaging/v1/test-message', {
            method: 'POST',
            body: JSON.stringify(messageData)
        });
    }

    async getWhatsAppAnalytics(params = {}) {
        console.log(`📱 [WhatsApp] Getting WhatsApp analytics`);
        const queryString = new URLSearchParams(params).toString();
        return this.apiCall(`/central-messaging/v1/analytics${queryString ? `?${queryString}` : ''}`);
    }

    async getWhatsAppMessages(params = {}) {
        console.log(`📱 [WhatsApp] Getting WhatsApp messages`);
        const queryString = new URLSearchParams(params).toString();
        return this.apiCall(`/central-messaging/v1/messages${queryString ? `?${queryString}` : ''}`);
    }

    async sendWhatsAppMessage(messageData) {
        console.log(`📱 [WhatsApp] Sending WhatsApp message`);
        return this.apiCall('/central-messaging/v1/admin/send', {
            method: 'POST',
            body: JSON.stringify(messageData)
        });
    }

    async getWhatsAppContacts(params = {}) {
        console.log(`📱 [WhatsApp] Getting WhatsApp contacts`);
        const queryString = new URLSearchParams(params).toString();
        return this.apiCall(`/central-messaging/v1/admin/contacts${queryString ? `?${queryString}` : ''}`);
    }

    async getWhatsAppConversation(conversationId, params = {}) {
        console.log(`📱 [WhatsApp] Getting conversation messages`);
        const queryString = new URLSearchParams(params).toString();
        return this.apiCall(`/central-messaging/v1/messages/conversation/${conversationId}${queryString ? `?${queryString}` : ''}`);
    }

    async getAdminCourses(params = {}) {
        console.log(`📚 [SubscriptionPlans] Loading admin course library`);
        const queryString = new URLSearchParams(params).toString();
        return this.apiCall(`/content/admin/courses${queryString ? `?${queryString}` : ''}`);
    }
}

// Create singleton instance
const adminApiService = new AdminApiService();
export default adminApiService;
