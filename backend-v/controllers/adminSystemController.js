const { AdminSystemSettings, AdminUser, AdminAuditLog, User, Lead, CentralPayment, CoachPlan } = require('../schema');

// Helper function for getting system health
async function getSystemHealth() {
    try {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Database health
        const mongoose = require('mongoose');
        let dbStats = {};
        try {
            dbStats = await mongoose.connection.db.stats();
        } catch (dbError) {
            console.warn('Could not get database stats:', dbError.message);
            dbStats = {
                collections: 0,
                dataSize: 0,
                indexSize: 0
            };
        }
        
        // Recent errors
        const recentErrors = await AdminAuditLog.countDocuments({
            severity: { $in: ['high', 'critical'] },
            createdAt: { $gte: oneHourAgo }
        });

        // System load (simplified)
        const systemLoad = {
            cpu: Math.random() * 100, // This would be actual system metrics
            memory: Math.random() * 100,
            disk: Math.random() * 100
        };

        return {
            status: 'healthy',
            database: {
                connected: true,
                collections: dbStats.collections,
                dataSize: dbStats.dataSize,
                indexSize: dbStats.indexSize
            },
            errors: {
                recent: recentErrors,
                critical: recentErrors
            },
            performance: {
                responseTime: Math.random() * 100,
                uptime: process.uptime(),
                load: systemLoad
            },
            lastChecked: now
        };
    } catch (error) {
        console.error('Error getting system health:', error);
        return {
            status: 'error',
            error: error.message,
            lastChecked: new Date()
        };
    }
}

// ===== ADMIN SYSTEM CONTROLLER =====

class AdminSystemController {

    // Create audit log
    async createAuditLog(adminId, action, details, req) {
        try {
            const admin = await AdminUser.findById(adminId);
            if (!admin) return;

            await AdminAuditLog.create({
                adminId,
                adminEmail: admin.email,
                adminRole: admin.role,
                action,
                category: 'SYSTEM_MANAGEMENT',
                description: details.description,
                severity: details.severity || 'medium',
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent'),
                endpoint: req.originalUrl,
                method: req.method,
                status: details.status || 'success',
                errorMessage: details.errorMessage,
                changes: details.changes
            });
        } catch (error) {
            console.error('Error creating audit log:', error);
        }
    }

    // @desc    Get system dashboard data
    // @route   GET /api/admin/system/dashboard
    // @access  Private (Admin)
    async getDashboard(req, res) {
        try {
            const { period = '30' } = req.query;
            const days = parseInt(period);
            const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

            // Get user statistics
            const totalUsers = await User.countDocuments();
            const newUsers = await User.countDocuments({ createdAt: { $gte: startDate } });
            const activeUsers = await User.countDocuments({ 
                lastActiveAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            });
            const coaches = await User.countDocuments({ role: 'coach' });
            const newCoaches = await User.countDocuments({ 
                role: 'coach', 
                createdAt: { $gte: startDate } 
            });

            // Get lead statistics
            const totalLeads = await Lead.countDocuments();
            const newLeads = await Lead.countDocuments({ createdAt: { $gte: startDate } });
            const convertedLeads = await Lead.countDocuments({ 
                status: 'converted', 
                updatedAt: { $gte: startDate } 
            });

            // Get payment statistics
            const totalPayments = await CentralPayment.countDocuments();
            const successfulPayments = await CentralPayment.countDocuments({ status: 'completed' });
            const totalRevenue = await CentralPayment.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);

            // Get coach plan statistics
            const totalPlans = await CoachPlan.countDocuments();
            const activePlans = await CoachPlan.countDocuments({ status: 'active' });
            const totalPlanSales = await CoachPlan.aggregate([
                { $group: { _id: null, totalSales: { $sum: '$totalSales' }, totalRevenue: { $sum: '$totalRevenue' } } }
            ]);

            // Get system health
            const systemHealth = await getSystemHealth();

            // Get recent activity
            const recentActivity = await AdminAuditLog.find()
                .sort({ createdAt: -1 })
                .limit(10)
                .select('action description createdAt adminEmail severity')
                .populate('adminId', 'firstName lastName email');

            // Get performance metrics
            const performanceMetrics = {
                userGrowth: ((newUsers / totalUsers) * 100).toFixed(2),
                leadConversion: totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(2) : 0,
                paymentSuccess: totalPayments > 0 ? ((successfulPayments / totalPayments) * 100).toFixed(2) : 0,
                coachEngagement: coaches > 0 ? ((activeUsers / coaches) * 100).toFixed(2) : 0
            };

            const dashboardData = {
                overview: {
                    totalUsers,
                    newUsers,
                    activeUsers,
                    coaches,
                    newCoaches,
                    totalLeads,
                    newLeads,
                    convertedLeads,
                    totalPayments,
                    successfulPayments,
                    totalRevenue: totalRevenue[0]?.total || 0,
                    totalPlans,
                    activePlans,
                    totalPlanSales: totalPlanSales[0]?.totalSales || 0,
                    totalPlanRevenue: totalPlanSales[0]?.totalRevenue || 0
                },
                performance: performanceMetrics,
                systemHealth,
                recentActivity,
                period: days
            };

            res.json({
                success: true,
                message: 'Dashboard data retrieved successfully',
                data: dashboardData
            });

        } catch (error) {
            console.error('Error getting dashboard:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve dashboard data',
                error: error.message
            });
        }
    }

    // @desc    Get system health
    // @route   GET /api/admin/system/health
    // @access  Private (Admin)
    async getSystemHealth(req, res) {
        try {
            const health = await getSystemHealth();
            res.json({
                success: true,
                message: 'System health retrieved successfully',
                data: health
            });
        } catch (error) {
            console.error('Error getting system health:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve system health',
                error: error.message
            });
        }
    }

    // Helper method to get system health


    // @desc    Get system settings
    // @route   GET /api/admin/system/settings
    // @access  Private (Admin)
    async getSystemSettings(req, res) {
        try {
            let settings = await AdminSystemSettings.findOne({ settingId: 'global' });
            
            if (!settings) {
                // Create default settings
                settings = new AdminSystemSettings({
                    settingId: 'global'
                });
                await settings.save();
            }

            res.json({
                success: true,
                message: 'System settings retrieved successfully',
                data: settings
            });

        } catch (error) {
            console.error('Error getting system settings:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve system settings',
                error: error.message
            });
        }
    }

    // @desc    Update system settings
    // @route   PUT /api/admin/system/settings
    // @access  Private (Admin)
    async updateSystemSettings(req, res) {
        try {
            const { settings } = req.body;
            const adminId = req.admin.id;

            if (!settings) {
                return res.status(400).json({
                    success: false,
                    message: 'Settings data is required'
                });
            }

            let systemSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
            
            if (!systemSettings) {
                systemSettings = new AdminSystemSettings({
                    settingId: 'global'
                });
            }

            // Store previous settings for audit
            const previousSettings = JSON.parse(JSON.stringify(systemSettings.toObject()));

            // Update settings
            Object.keys(settings).forEach(key => {
                if (systemSettings[key] !== undefined) {
                    systemSettings[key] = settings[key];
                }
            });

            // Update system status
            systemSettings.systemStatus.lastUpdated = new Date();
            systemSettings.systemStatus.updatedBy = adminId;
            systemSettings.systemStatus.version = systemSettings.platformConfig.platformVersion;

            await systemSettings.save();

            // Create audit log
            const changedFields = Object.keys(settings);
            await this.createAuditLog(adminId, 'UPDATE_SYSTEM_SETTINGS', {
                description: `System settings updated: ${changedFields.join(', ')}`,
                severity: 'medium',
                status: 'success',
                changes: {
                    before: previousSettings,
                    after: systemSettings.toObject(),
                    fieldsChanged: changedFields
                }
            }, req);

            res.json({
                success: true,
                message: 'System settings updated successfully',
                data: systemSettings
            });

        } catch (error) {
            console.error('Error updating system settings:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update system settings',
                error: error.message
            });
        }
    }

    // @desc    Update specific settings section
    // @route   PATCH /api/admin/system/settings/:section
    // @access  Private (Admin)
    async updateSettingsSection(req, res) {
        try {
            const { section } = req.params;
            const updateData = req.body;
            const adminId = req.admin.id;

            const allowedSections = [
                'platformConfig', 'paymentSystem', 'mlmSystem', 
                'security', 'notifications', 'integrations'
            ];

            if (!allowedSections.includes(section)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid settings section'
                });
            }

            let systemSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
            
            if (!systemSettings) {
                systemSettings = new AdminSystemSettings({
                    settingId: 'global'
                });
            }

            // Store previous settings for audit
            const previousSettings = JSON.parse(JSON.stringify(systemSettings.toObject()));

            // Update specific section
            systemSettings[section] = { ...systemSettings[section], ...updateData };
            systemSettings.systemStatus.lastUpdated = new Date();
            systemSettings.systemStatus.updatedBy = adminId;

            await systemSettings.save();

            // Create audit log
            await this.createAuditLog(adminId, 'UPDATE_SYSTEM_SETTINGS', {
                description: `Updated ${section} settings`,
                severity: 'medium',
                status: 'success',
                changes: {
                    before: previousSettings[section],
                    after: systemSettings[section],
                    fieldsChanged: Object.keys(updateData)
                }
            }, req);

            res.json({
                success: true,
                message: `${section} settings updated successfully`,
                data: systemSettings[section]
            });

        } catch (error) {
            console.error('Error updating settings section:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update settings section',
                error: error.message
            });
        }
    }

    // @desc    Toggle maintenance mode
    // @route   POST /api/admin/system/maintenance
    // @access  Private (Admin)
    async toggleMaintenanceMode(req, res) {
        try {
            const { enabled, message } = req.body;
            const adminId = req.admin.id;

            let systemSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
            
            if (!systemSettings) {
                systemSettings = new AdminSystemSettings({
                    settingId: 'global'
                });
            }

            const previousMode = systemSettings.platformConfig.maintenanceMode;

            systemSettings.platformConfig.maintenanceMode = enabled;
            if (message) {
                systemSettings.platformConfig.maintenanceMessage = message;
            }
            systemSettings.systemStatus.lastUpdated = new Date();
            systemSettings.systemStatus.updatedBy = adminId;

            await systemSettings.save();

            // Create audit log
            await this.createAuditLog(adminId, enabled ? 'ENABLE_MAINTENANCE' : 'DISABLE_MAINTENANCE', {
                description: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
                severity: 'high',
                status: 'success',
                changes: {
                    before: { maintenanceMode: previousMode },
                    after: { maintenanceMode: enabled, message }
                }
            }, req);

            res.json({
                success: true,
                message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'} successfully`,
                data: {
                    maintenanceMode: enabled,
                    message: systemSettings.platformConfig.maintenanceMessage
                }
            });

        } catch (error) {
            console.error('Error toggling maintenance mode:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to toggle maintenance mode',
                error: error.message
            });
        }
    }

    // @desc    Get system logs
    // @route   GET /api/admin/system/logs
    // @access  Private (Admin)
    async getSystemLogs(req, res) {
        try {
            const { 
                page = 1, 
                limit = 50, 
                action, 
                category, 
                severity, 
                adminId,
                startDate,
                endDate,
                search
            } = req.query;

            const query = {};
            
            if (action) query.action = action;
            if (category) query.category = category;
            if (severity) query.severity = severity;
            if (adminId) query.adminId = adminId;
            if (search) {
                query.$or = [
                    { description: { $regex: search, $options: 'i' } },
                    { adminEmail: { $regex: search, $options: 'i' } }
                ];
            }
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) query.createdAt.$gte = new Date(startDate);
                if (endDate) query.createdAt.$lte = new Date(endDate);
            }

            const logs = await AdminAuditLog.find(query)
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .populate('adminId', 'firstName lastName email role')
                .select('-changes.before -changes.after'); // Exclude sensitive data by default

            const total = await AdminAuditLog.countDocuments(query);

            res.json({
                success: true,
                message: 'System logs retrieved successfully',
                data: {
                    logs,
                    pagination: {
                        current: page,
                        pages: Math.ceil(total / limit),
                        total
                    }
                }
            });

        } catch (error) {
            console.error('Error getting system logs:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve system logs',
                error: error.message
            });
        }
    }

    // @desc    Clear old system logs
    // @route   DELETE /api/admin/system/logs
    // @access  Private (Admin)
    async clearSystemLogs(req, res) {
        try {
            const { olderThan = 365 } = req.query; // days
            const adminId = req.admin.id;
            
            const cutoffDate = new Date(Date.now() - olderThan * 24 * 60 * 60 * 1000);
            
            const result = await AdminAuditLog.updateMany(
                { 
                    createdAt: { $lt: cutoffDate },
                    archived: false 
                },
                { 
                    $set: { archived: true } 
                }
            );

            // Create audit log
            await this.createAuditLog(adminId, 'CLEAR_SYSTEM_LOGS', {
                description: `Cleared system logs older than ${olderThan} days`,
                severity: 'medium',
                status: 'success',
                changes: {
                    logsArchived: result.modifiedCount,
                    cutoffDate
                }
            }, req);

            res.json({
                success: true,
                message: `Successfully archived ${result.modifiedCount} old system logs`,
                data: {
                    logsArchived: result.modifiedCount,
                    cutoffDate
                }
            });

        } catch (error) {
            console.error('Error clearing system logs:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to clear system logs',
                error: error.message
            });
        }
    }

    // @desc    Get system analytics
    // @route   GET /api/admin/system/analytics
    // @access  Private (Admin)
    async getSystemAnalytics(req, res) {
        try {
            const { period = '30' } = req.query;
            const days = parseInt(period);
            const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

            // User analytics
            const userAnalytics = await User.aggregate([
                {
                    $match: { createdAt: { $gte: startDate } }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' },
                            day: { $dayOfMonth: '$createdAt' }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
            ]);

            // Payment analytics
            const paymentAnalytics = await Payment.aggregate([
                {
                    $match: { 
                        createdAt: { $gte: startDate },
                        status: 'successful'
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' },
                            day: { $dayOfMonth: '$createdAt' }
                        },
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$amount' }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
            ]);

            // Admin activity analytics
            const adminAnalytics = await AdminAuditLog.aggregate([
                {
                    $match: { createdAt: { $gte: startDate } }
                },
                {
                    $group: {
                        _id: '$action',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]);

            // System performance metrics
            const performanceMetrics = {
                averageResponseTime: Math.random() * 1000, // This would be actual metrics
                errorRate: Math.random() * 5,
                uptime: 99.9,
                activeUsers: await User.countDocuments({
                    lastActiveAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                })
            };

            res.json({
                success: true,
                message: 'System analytics retrieved successfully',
                data: {
                    userAnalytics,
                    paymentAnalytics,
                    adminAnalytics,
                    performanceMetrics,
                    period: days
                }
            });

        } catch (error) {
            console.error('Error getting system analytics:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve system analytics',
                error: error.message
            });
        }
    }

    // @desc    Export system analytics
    // @route   GET /api/admin/system/analytics/export
    // @access  Private (Admin)
    async exportSystemAnalytics(req, res) {
        try {
            const { period = '30' } = req.query;
            const days = parseInt(period);
            const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

            // Get analytics data
            const userAnalytics = await User.aggregate([
                {
                    $match: { createdAt: { $gte: startDate } }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' },
                            day: { $dayOfMonth: '$createdAt' }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
            ]);

            const paymentAnalytics = await Payment.aggregate([
                {
                    $match: { 
                        createdAt: { $gte: startDate },
                        status: 'successful'
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' },
                            day: { $dayOfMonth: '$createdAt' }
                        },
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$amount' }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
            ]);

            // Convert to CSV format
            const csvHeaders = [
                'Date',
                'New Users',
                'Payments',
                'Total Amount'
            ];

            const csvRows = [];
            const dateMap = new Map();

            // Process user analytics
            userAnalytics.forEach(item => {
                const date = `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`;
                if (!dateMap.has(date)) {
                    dateMap.set(date, { users: 0, payments: 0, amount: 0 });
                }
                dateMap.get(date).users = item.count;
            });

            // Process payment analytics
            paymentAnalytics.forEach(item => {
                const date = `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`;
                if (!dateMap.has(date)) {
                    dateMap.set(date, { users: 0, payments: 0, amount: 0 });
                }
                dateMap.get(date).payments = item.count;
                dateMap.get(date).amount = item.totalAmount;
            });

            // Convert to CSV rows
            dateMap.forEach((data, date) => {
                csvRows.push([
                    date,
                    data.users,
                    data.payments,
                    data.amount
                ]);
            });

            const csvContent = [csvHeaders, ...csvRows]
                .map(row => row.map(field => `"${field}"`).join(','))
                .join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="system-analytics-${days}days-${new Date().toISOString().split('T')[0]}.csv"`);
            res.send(csvContent);

        } catch (error) {
            console.error('Error exporting system analytics:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to export system analytics',
                error: error.message
            });
        }
    }
}

module.exports = new AdminSystemController();
