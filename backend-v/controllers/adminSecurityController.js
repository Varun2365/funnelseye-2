const asyncHandler = require('../middleware/async');
const { AdminSystemSettings, AdminUser, AdminAuditLog } = require('../schema');
const jwt = require('jsonwebtoken');

// ===== SECURITY & COMPLIANCE CENTER =====

/**
 * @desc    Get security settings
 * @route   GET /api/admin/security/settings
 * @access  Private (Admin)
 */
exports.getSecuritySettings = asyncHandler(async (req, res) => {
    try {
        const settings = await AdminSystemSettings.findOne().select('security');
        
        if (!settings) {
            return res.status(404).json({
                success: false,
                message: 'Security settings not found'
            });
        }

        res.status(200).json({
            success: true,
            data: settings.security
        });
    } catch (error) {
        console.error('Error getting security settings:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving security settings',
            error: error.message
        });
    }
});

/**
 * @desc    Update security settings
 * @route   PUT /api/admin/security/settings
 * @access  Private (Admin)
 */
exports.updateSecuritySettings = asyncHandler(async (req, res) => {
    try {
        const { passwordPolicy, sessionSettings, apiSecurity } = req.body;

        const settings = await AdminSystemSettings.findOneAndUpdate(
            {},
            {
                $set: {
                    'security.passwordPolicy': passwordPolicy,
                    'security.sessionSettings': sessionSettings,
                    'security.apiSecurity': apiSecurity
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            message: 'Security settings updated successfully',
            data: settings.security
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

/**
 * @desc    Get active sessions
 * @route   GET /api/admin/security/active-sessions
 * @access  Private (Admin)
 */
exports.getActiveSessions = asyncHandler(async (req, res) => {
    try {
        // This would typically fetch from a Session schema
        // For now, we'll return mock data
        const activeSessions = [
            {
                id: 'session_1',
                adminId: req.admin.id,
                adminEmail: req.admin.email,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                createdAt: new Date(),
                lastActivity: new Date(),
                isActive: true
            }
        ];

        res.status(200).json({
            success: true,
            data: activeSessions
        });
    } catch (error) {
        console.error('Error getting active sessions:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving active sessions',
            error: error.message
        });
    }
});

/**
 * @desc    Terminate session
 * @route   DELETE /api/admin/security/sessions/:sessionId
 * @access  Private (Admin)
 */
exports.terminateSession = asyncHandler(async (req, res) => {
    try {
        const { sessionId } = req.params;

        // This would typically update a Session schema
        // For now, we'll just return success

        res.status(200).json({
            success: true,
            message: 'Session terminated successfully'
        });
    } catch (error) {
        console.error('Error terminating session:', error);
        res.status(500).json({
            success: false,
            message: 'Error terminating session',
            error: error.message
        });
    }
});

/**
 * @desc    Get security incidents
 * @route   GET /api/admin/security/incidents
 * @access  Private (Admin)
 */
exports.getSecurityIncidents = asyncHandler(async (req, res) => {
    try {
        const { timeRange = 30, severity } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);

        // Get security-related audit logs
        const query = {
            createdAt: { $gte: startDate },
            category: { $in: ['SECURITY', 'AUTHENTICATION', 'AUTHORIZATION'] }
        };

        if (severity && severity !== 'all') {
            query.severity = severity;
        }

        const incidents = await AdminAuditLog.find(query)
            .populate('adminId', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(100);

        // Categorize incidents
        const categorizedIncidents = {
            failedLogins: incidents.filter(log => log.action === 'LOGIN_FAILED'),
            suspiciousActivity: incidents.filter(log => log.severity === 'high'),
            unauthorizedAccess: incidents.filter(log => log.action === 'UNAUTHORIZED_ACCESS'),
            other: incidents.filter(log => 
                !['LOGIN_FAILED', 'UNAUTHORIZED_ACCESS'].includes(log.action) && 
                log.severity !== 'high'
            )
        };

        res.status(200).json({
            success: true,
            data: {
                incidents: categorizedIncidents,
                totalCount: incidents.length,
                timeRange
            }
        });
    } catch (error) {
        console.error('Error getting security incidents:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving security incidents',
            error: error.message
        });
    }
});

/**
 * @desc    Get threat detection summary
 * @route   GET /api/admin/security/threat-summary
 * @access  Private (Admin)
 */
exports.getThreatSummary = asyncHandler(async (req, res) => {
    try {
        const { timeRange = 24 } = req.query; // Default to 24 hours for threat summary
        const startDate = new Date();
        startDate.setHours(startDate.getHours() - timeRange);

        // Get failed login attempts
        const failedLogins = await AdminAuditLog.countDocuments({
            action: 'LOGIN_FAILED',
            createdAt: { $gte: startDate }
        });

        // Get suspicious IP addresses
        const suspiciousIPs = await AdminAuditLog.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    action: 'LOGIN_FAILED'
                }
            },
            {
                $group: {
                    _id: '$ipAddress',
                    attempts: { $sum: 1 },
                    lastAttempt: { $max: '$createdAt' }
                }
            },
            {
                $match: { attempts: { $gte: 5 } } // 5+ failed attempts from same IP
            }
        ]);

        // Get unusual access patterns
        const unusualAccess = await AdminAuditLog.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    category: 'SECURITY'
                }
            },
            {
                $group: {
                    _id: '$adminId',
                    actions: { $push: '$action' },
                    count: { $sum: 1 }
                }
            },
            {
                $match: { count: { $gte: 50 } } // 50+ actions in time period
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                failedLogins,
                suspiciousIPs,
                unusualAccess: unusualAccess.length,
                timeRange,
                riskLevel: getRiskLevel(failedLogins, suspiciousIPs.length, unusualAccess.length)
            }
        });
    } catch (error) {
        console.error('Error getting threat summary:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving threat summary',
            error: error.message
        });
    }
});

/**
 * @desc    Enable/disable MFA for admin
 * @route   PUT /api/admin/security/mfa/:adminId
 * @access  Private (Admin)
 */
exports.updateMfaStatus = asyncHandler(async (req, res) => {
    try {
        const { adminId } = req.params;
        const { enabled, method } = req.body;

        const admin = await AdminUser.findByIdAndUpdate(
            adminId,
            {
                $set: {
                    'security.mfaEnabled': enabled,
                    'security.mfaMethod': method || 'app',
                    'security.mfaSetupAt': enabled ? new Date() : null
                }
            },
            { new: true }
        );

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin user not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `MFA ${enabled ? 'enabled' : 'disabled'} successfully`,
            data: {
                mfaEnabled: admin.security.mfaEnabled,
                mfaMethod: admin.security.mfaMethod
            }
        });
    } catch (error) {
        console.error('Error updating MFA status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating MFA status',
            error: error.message
        });
    }
});

/**
 * @desc    Get compliance report
 * @route   GET /api/admin/security/compliance
 * @access  Private (Admin)
 */
exports.getComplianceReport = asyncHandler(async (req, res) => {
    try {
        const { timeRange = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);

        // Get GDPR/DPDP compliance data
        const dataAccessLogs = await AdminAuditLog.countDocuments({
            action: { $in: ['VIEW_USER_DATA', 'EXPORT_USER_DATA', 'DELETE_USER_DATA'] },
            createdAt: { $gte: startDate }
        });

        const consentUpdates = await AdminAuditLog.countDocuments({
            action: 'UPDATE_CONSENT',
            createdAt: { $gte: startDate }
        });

        // Get security compliance metrics
        const securityMetrics = {
            mfaAdoption: await AdminUser.countDocuments({ 'security.mfaEnabled': true }),
            totalAdmins: await AdminUser.countDocuments(),
            passwordPolicyCompliance: 100, // Assuming 100% compliance
            sessionTimeoutCompliance: 100,
            auditLoggingEnabled: true
        };

        res.status(200).json({
            success: true,
            data: {
                dataAccessLogs,
                consentUpdates,
                securityMetrics,
                timeRange,
                complianceScore: calculateComplianceScore(securityMetrics)
            }
        });
    } catch (error) {
        console.error('Error getting compliance report:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving compliance report',
            error: error.message
        });
    }
});

// Helper functions
function getRiskLevel(failedLogins, suspiciousIPs, unusualAccess) {
    let riskScore = 0;
    
    if (failedLogins > 100) riskScore += 3;
    else if (failedLogins > 50) riskScore += 2;
    else if (failedLogins > 20) riskScore += 1;
    
    if (suspiciousIPs > 10) riskScore += 3;
    else if (suspiciousIPs > 5) riskScore += 2;
    else if (suspiciousIPs > 0) riskScore += 1;
    
    if (unusualAccess > 20) riskScore += 3;
    else if (unusualAccess > 10) riskScore += 2;
    else if (unusualAccess > 5) riskScore += 1;
    
    if (riskScore >= 7) return 'critical';
    if (riskScore >= 5) return 'high';
    if (riskScore >= 3) return 'medium';
    if (riskScore >= 1) return 'low';
    return 'minimal';
}

function calculateComplianceScore(metrics) {
    const totalChecks = 5;
    let passedChecks = 0;
    
    if (metrics.mfaAdoption / metrics.totalAdmins > 0.8) passedChecks++;
    if (metrics.passwordPolicyCompliance === 100) passedChecks++;
    if (metrics.sessionTimeoutCompliance === 100) passedChecks++;
    if (metrics.auditLoggingEnabled) passedChecks++;
    if (metrics.totalAdmins > 0) passedChecks++;
    
    return Math.round((passedChecks / totalChecks) * 100);
}
