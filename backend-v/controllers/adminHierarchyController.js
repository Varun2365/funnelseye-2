const { AdminUser, AdminAuditLog, User, AdminRequest, CoachHierarchyLevel } = require('../schema');

// ===== ADMIN HIERARCHY MANAGEMENT CONTROLLER =====

class AdminHierarchyController {

    // Create audit log
    static async createAuditLog(adminId, action, details, req) {
        try {
            const admin = await AdminUser.findById(adminId);
            if (!admin) return;

            // Map status values to valid enum values
            const statusMapping = {
                'success': 'success',
                'error': 'failed',
                'failed': 'failed',
                'partial': 'partial'
            };

            // Generate logId
            const logId = `AUDIT_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

            await AdminAuditLog.create({
                logId,
                adminId,
                adminEmail: admin.email,
                adminRole: admin.role,
                action,
                category: 'HIERARCHY_MANAGEMENT',
                description: details.description,
                severity: details.severity || 'medium',
                ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
                userAgent: req.get('User-Agent'),
                endpoint: req.originalUrl,
                method: req.method,
                status: statusMapping[details.status] || 'success',
                errorMessage: details.errorMessage,
                changes: details.changes
            });
        } catch (error) {
            console.error('Error creating audit log:', error);
        }
    }

    // @desc    Get all hierarchy change requests
    // @route   GET /api/admin/hierarchy/requests
    // @access  Private (Admin)
    async getHierarchyRequests(req, res) {
        try {
            const { 
                page = 1, 
                limit = 20, 
                status = 'all',
                requestType = 'all',
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = req.query;

            console.log('🔍 [AdminHierarchyController] getHierarchyRequests called with query:', req.query);

            const query = {};
            
            if (status !== 'all') {
                query.status = status;
            }
            
            if (requestType !== 'all') {
                query.requestType = requestType;
            }

            const sortOptions = {};
            sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

            const requests = await AdminRequest.find(query)
                .populate('coachId', 'name email selfCoachId currentLevel')
                .populate('processedBy', 'firstName lastName email')
                .sort(sortOptions)
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .lean();

            const total = await AdminRequest.countDocuments(query);

            // Get statistics
            const stats = await AdminRequest.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            const statusStats = stats.reduce((acc, stat) => {
                acc[stat._id] = stat.count;
                return acc;
            }, {});

            // Get request type statistics
            const typeStats = await AdminRequest.aggregate([
                {
                    $group: {
                        _id: '$requestType',
                        count: { $sum: 1 }
                    }
                }
            ]);

            const requestTypeStats = typeStats.reduce((acc, stat) => {
                acc[stat._id] = stat.count;
                return acc;
            }, {});

            res.json({
                success: true,
                message: 'Hierarchy requests retrieved successfully',
                data: {
                    requests,
                    pagination: {
                        current: page,
                        pages: Math.ceil(total / limit),
                        total
                    },
                    stats: {
                        byStatus: statusStats,
                        byType: requestTypeStats
                    }
                }
            });

        } catch (error) {
            console.error('Error getting hierarchy requests:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve hierarchy requests',
                error: error.message
            });
        }
    }

    // @desc    Get hierarchy request by ID
    // @route   GET /api/admin/hierarchy/requests/:id
    // @access  Private (Admin)
    async getHierarchyRequestById(req, res) {
        try {
            const { id } = req.params;

            const request = await AdminRequest.findById(id)
                .populate('coachId', 'name email selfCoachId currentLevel sponsorId teamRankName presidentTeamRankName')
                .populate('processedBy', 'firstName lastName email')
                .populate('coachId.sponsorId', 'name email selfCoachId currentLevel');

            if (!request) {
                return res.status(404).json({
                    success: false,
                    message: 'Hierarchy request not found'
                });
            }

            res.json({
                success: true,
                message: 'Hierarchy request retrieved successfully',
                data: request
            });

        } catch (error) {
            console.error('Error getting hierarchy request:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve hierarchy request',
                error: error.message
            });
        }
    }

    // @desc    Process hierarchy change request
    // @route   PUT /api/admin/hierarchy/requests/:id/process
    // @access  Private (Admin)
    async processHierarchyRequest(req, res) {
        try {
            const { id } = req.params;
            const { status, adminNotes } = req.body;
            const adminId = req.admin.id;

            console.log('🔄 [AdminHierarchyController] processHierarchyRequest called for ID:', id, 'Status:', status);

            if (!['approved', 'rejected'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Status must be either approved or rejected'
                });
            }

            const request = await AdminRequest.findById(id);
            if (!request) {
                return res.status(404).json({
                    success: false,
                    message: 'Hierarchy request not found'
                });
            }

            if (request.status !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: 'Request has already been processed'
                });
            }

            // Store previous data for audit
            const previousData = JSON.parse(JSON.stringify(request.toObject()));

            // Update request
            request.status = status;
            request.adminNotes = adminNotes;
            request.processedBy = adminId;
            request.processedAt = new Date();

            // If approved, update coach hierarchy
            if (status === 'approved') {
                const coach = await User.findById(request.coachId);
                if (coach) {
                    // Store coach's previous data for audit
                    const coachPreviousData = JSON.parse(JSON.stringify(coach.toObject()));

                    // Update coach with requested data
                    Object.assign(coach, request.requestedData);
                    await coach.save();

                    // Create audit log for coach update
                    await AdminHierarchyController.createAuditLog(adminId, 'UPDATE_COACH_HIERARCHY', {
                        description: `Coach hierarchy updated via approved request: ${coach.email}`,
                        severity: 'high',
                        status: 'success',
                        targetType: 'coach',
                        targetId: coach._id,
                        targetEmail: coach.email,
                        changes: {
                            before: coachPreviousData,
                            after: coach.toObject(),
                            fieldsChanged: Object.keys(request.requestedData)
                        }
                    }, req);
                }
            }

            await request.save();

            // Create audit log for request processing
            await AdminHierarchyController.createAuditLog(adminId, 'PROCESS_HIERARCHY_REQUEST', {
                description: `Hierarchy request ${status}: ${request.requestType}`,
                severity: status === 'approved' ? 'high' : 'medium',
                status: 'success',
                targetType: 'hierarchy_request',
                targetId: id,
                changes: {
                    before: previousData,
                    after: request.toObject(),
                    fieldsChanged: ['status', 'adminNotes', 'processedBy', 'processedAt']
                }
            }, req);

            res.json({
                success: true,
                message: `Hierarchy request ${status} successfully`,
                data: request
            });

        } catch (error) {
            console.error('Error processing hierarchy request:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process hierarchy request',
                error: error.message
            });
        }
    }

    // @desc    Get hierarchy analytics
    // @route   GET /api/admin/hierarchy/analytics
    // @access  Private (Admin)
    async getHierarchyAnalytics(req, res) {
        try {
            const { period = '30' } = req.query;
            const days = parseInt(period);
            const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

            console.log('📊 [AdminHierarchyController] getHierarchyAnalytics called with period:', period);

            // Request statistics
            const requestStats = await AdminRequest.aggregate([
                {
                    $match: { 
                        createdAt: { $gte: startDate }
                    }
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

            // Status distribution
            const statusDistribution = await AdminRequest.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            // Request type distribution
            const typeDistribution = await AdminRequest.aggregate([
                {
                    $group: {
                        _id: '$requestType',
                        count: { $sum: 1 }
                    }
                }
            ]);

            // Processing time analytics
            const processingTimeStats = await AdminRequest.aggregate([
                {
                    $match: {
                        status: { $in: ['approved', 'rejected'] },
                        processedAt: { $exists: true }
                    }
                },
                {
                    $project: {
                        processingTimeHours: {
                            $divide: [
                                { $subtract: ['$processedAt', '$createdAt'] },
                                1000 * 60 * 60
                            ]
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        avgProcessingTime: { $avg: '$processingTimeHours' },
                        minProcessingTime: { $min: '$processingTimeHours' },
                        maxProcessingTime: { $max: '$processingTimeHours' }
                    }
                }
            ]);

            // Recent activity
            const recentRequests = await AdminRequest.find()
                .populate('coachId', 'name email selfCoachId')
                .populate('processedBy', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .limit(10)
                .select('requestType status createdAt processedAt coachId processedBy');

            // Format data for frontend
            const formattedData = {
                requestStats: requestStats.map(item => ({
                    date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
                    count: item.count
                })),
                statusDistribution: statusDistribution.map(item => ({
                    status: item._id,
                    count: item.count
                })),
                typeDistribution: typeDistribution.map(item => ({
                    type: item._id,
                    count: item.count
                })),
                processingTime: processingTimeStats[0] || {
                    avgProcessingTime: 0,
                    minProcessingTime: 0,
                    maxProcessingTime: 0
                },
                recentRequests
            };

            res.json({
                success: true,
                message: 'Hierarchy analytics retrieved successfully',
                data: formattedData
            });

        } catch (error) {
            console.error('Error getting hierarchy analytics:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve hierarchy analytics',
                error: error.message
            });
        }
    }

    // @desc    Bulk process hierarchy requests
    // @route   POST /api/admin/hierarchy/requests/bulk-process
    // @access  Private (Admin)
    async bulkProcessHierarchyRequests(req, res) {
        try {
            const { requestIds, status, adminNotes } = req.body;
            const adminId = req.admin.id;

            if (!requestIds || !Array.isArray(requestIds) || requestIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Request IDs array is required'
                });
            }

            if (!['approved', 'rejected'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Status must be either approved or rejected'
                });
            }

            // Get all requests
            const requests = await AdminRequest.find({ 
                _id: { $in: requestIds },
                status: 'pending'
            });

            if (requests.length !== requestIds.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Some requests not found or already processed'
                });
            }

            // Process each request
            const processedRequests = [];
            for (const request of requests) {
                request.status = status;
                request.adminNotes = adminNotes;
                request.processedBy = adminId;
                request.processedAt = new Date();

                // If approved, update coach hierarchy
                if (status === 'approved') {
                    const coach = await User.findById(request.coachId);
                    if (coach) {
                        Object.assign(coach, request.requestedData);
                        await coach.save();
                    }
                }

                await request.save();
                processedRequests.push(request);
            }

            // Create audit log
            await AdminHierarchyController.createAuditLog(adminId, 'BULK_PROCESS_HIERARCHY_REQUESTS', {
                description: `Bulk ${status} ${processedRequests.length} hierarchy requests`,
                severity: 'high',
                status: 'success',
                changes: {
                    requestIds,
                    status,
                    adminNotes,
                    processedCount: processedRequests.length
                }
            }, req);

            res.json({
                success: true,
                message: `Successfully ${status} ${processedRequests.length} hierarchy requests`,
                data: {
                    processedCount: processedRequests.length,
                    processedRequests: processedRequests.map(req => ({
                        id: req._id,
                        requestType: req.requestType,
                        status: req.status
                    }))
                }
            });

        } catch (error) {
            console.error('Error bulk processing hierarchy requests:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to bulk process hierarchy requests',
                error: error.message
            });
        }
    }
}

module.exports = new AdminHierarchyController();
