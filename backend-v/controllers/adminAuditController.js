const AdminAuditLog = require('../schema/AdminAuditLog');

// ===== ADMIN AUDIT LOGS CONTROLLER =====

/**
 * Get audit logs with filtering and pagination
 */
const getAuditLogs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            action,
            category,
            severity,
            adminEmail,
            startDate,
            endDate,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query
        const query = {};
        if (action && action !== 'all') query.action = action;
        if (category && category !== 'all') query.category = category;
        if (severity && severity !== 'all') query.severity = severity;
        if (adminEmail) query.adminEmail = { $regex: adminEmail, $options: 'i' };
        
        // Date range filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        // Execute query
        const logs = await AdminAuditLog.find(query)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await AdminAuditLog.countDocuments(query);
        const pages = Math.ceil(total / parseInt(limit));

        res.json({
            success: true,
            data: {
                logs,
                pagination: {
                    current: parseInt(page),
                    pages,
                    total,
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Error getting audit logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch audit logs',
            error: error.message
        });
    }
};

/**
 * Export audit logs
 */
const exportAuditLogs = async (req, res) => {
    try {
        const {
            action,
            category,
            severity,
            adminEmail,
            startDate,
            endDate
        } = req.query;

        // Build query
        const query = {};
        if (action && action !== 'all') query.action = action;
        if (category && category !== 'all') query.category = category;
        if (severity && severity !== 'all') query.severity = severity;
        if (adminEmail) query.adminEmail = { $regex: adminEmail, $options: 'i' };
        
        // Date range filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
        }

        const logs = await AdminAuditLog.find(query)
            .sort({ createdAt: -1 })
            .lean();

        // Convert to CSV format
        const csvHeaders = [
            'Log ID',
            'Timestamp',
            'Admin Email',
            'Admin Role',
            'Action',
            'Category',
            'Severity',
            'Status',
            'Description',
            'IP Address',
            'Endpoint',
            'Method',
            'User Agent'
        ];

        const csvRows = logs.map(log => [
            log.logId,
            new Date(log.createdAt).toISOString(),
            log.adminEmail || 'System',
            log.adminRole || 'N/A',
            log.action,
            log.category,
            log.severity,
            log.status,
            log.description,
            log.ipAddress || 'N/A',
            log.endpoint || 'N/A',
            log.method || 'N/A',
            log.userAgent || 'N/A'
        ]);

        const csvContent = [csvHeaders, ...csvRows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csvContent);

    } catch (error) {
        console.error('Error exporting audit logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export audit logs',
            error: error.message
        });
    }
};

/**
 * Get specific audit log details
 */
const getAuditLogById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const log = await AdminAuditLog.findById(id).lean();
        
        if (!log) {
            return res.status(404).json({
                success: false,
                message: 'Audit log not found'
            });
        }

        res.json({
            success: true,
            data: log
        });
    } catch (error) {
        console.error('Error getting audit log details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch audit log details',
            error: error.message
        });
    }
};

module.exports = {
    getAuditLogs,
    exportAuditLogs,
    getAuditLogById
};
