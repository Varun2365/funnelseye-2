const { AdminUser, AdminAuditLog, User, Lead, CoachPlan } = require('../schema');

// ===== ADMIN USER MANAGEMENT CONTROLLER =====

class AdminUserController {

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
                category: 'USER_MANAGEMENT',
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

    // @desc    Get all users with filtering and pagination
    // @route   GET /api/admin/users
    // @access  Private (Admin)
    async getUsers(req, res) {
        try {
            const { 
                page = 1, 
                limit = 50, 
                role, 
                status, 
                search,
                sortBy = 'createdAt',
                sortOrder = 'desc',
                startDate,
                endDate,
                includeDeleted = false
            } = req.query;

            console.log('🔍 [AdminUserController] getUsers called with query:', req.query);

            const query = {};
            
            // Handle deleted users filter
            if (includeDeleted === 'true') {
                // Show only deleted users
                query.deletedAt = { $ne: null };
            } else {
                // Show only active users (default)
                query.deletedAt = null;
            }
            
            if (role) query.role = role;
            if (status) query.status = status;
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } }
                ];
            }
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) query.createdAt.$gte = new Date(startDate);
                if (endDate) query.createdAt.$lte = new Date(endDate);
            }

            console.log('🔍 [AdminUserController] Final query:', JSON.stringify(query, null, 2));

            const sortOptions = {};
            sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

            // First, let's check total count without any filters
            const totalUsersInDB = await User.countDocuments();
            console.log('📊 [AdminUserController] Total users in database:', totalUsersInDB);
            
            // Let's also check what users exist without any filters
            const sampleUsers = await User.find({}).limit(5).lean();
            console.log('📊 [AdminUserController] Sample users in database:', sampleUsers.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role })));

            const users = await User.find(query)
                .sort(sortOptions)
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .select('-password -passwordHistory')
                .lean(); // Use lean() for better performance and to avoid discriminator issues

            const total = await User.countDocuments(query);

            console.log('📊 [AdminUserController] Found users:', users.length, 'out of', total, 'total matching query');

            // Get user statistics
            const stats = await User.aggregate([
                { $group: { _id: '$role', count: { $sum: 1 } } }
            ]);

            const roleStats = stats.reduce((acc, stat) => {
                acc[stat._id] = stat.count;
                return acc;
            }, {});

            res.json({
                success: true,
                message: 'Users retrieved successfully',
                data: {
                    users,
                    pagination: {
                        current: page,
                        pages: Math.ceil(total / limit),
                        total
                    },
                    stats: {
                        total,
                        byRole: roleStats
                    }
                }
            });

        } catch (error) {
            console.error('Error getting users:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve users',
                error: error.message
            });
        }
    }

    // @desc    Get user by ID
    // @route   GET /api/admin/users/:id
    // @access  Private (Admin)
    async getUserById(req, res) {
        try {
            const { id } = req.params;

            const user = await User.findById(id)
                .select('-password -passwordHistory')
                .populate('coachId', 'firstName lastName email');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Get user's leads
            const userLeads = await Lead.find({ userId: id })
                .sort({ createdAt: -1 })
                .limit(10)
                .select('firstName lastName email phone status createdAt');

            // Get user's coach plans (if user is a coach)
            let userPlans = [];
            if (user.role === 'coach') {
                userPlans = await CoachPlan.find({ coachId: id })
                    .sort({ createdAt: -1 })
                    .limit(10)
                    .select('title price currency status totalSales totalRevenue');
            }

            // Get user's payment history
            const paymentHistory = await Payment.find({ customerId: id })
                .sort({ createdAt: -1 })
                .limit(10)
                .select('amount currency status createdAt');

            res.json({
                success: true,
                message: 'User retrieved successfully',
                data: {
                    user,
                    leads: userLeads,
                    plans: userPlans,
                    paymentHistory
                }
            });

        } catch (error) {
            console.error('Error getting user:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve user',
                error: error.message
            });
        }
    }

    // @desc    Update user
    // @route   PUT /api/admin/users/:id
    // @access  Private (Admin)
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const adminId = req.admin.id;
            
            console.log('✏️ [AdminUserController] updateUser called for ID:', id, 'with data:', updateData);

            // Remove sensitive fields that shouldn't be updated directly
            delete updateData.password;
            delete updateData.passwordHistory;
            delete updateData._id;
            delete updateData.createdAt;
            delete updateData.updatedAt;

            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Store previous data for audit
            const previousData = JSON.parse(JSON.stringify(user.toObject()));

            // Update user
            const updatedUser = await User.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            ).select('-password -passwordHistory');

            // Create audit log
            const changedFields = Object.keys(updateData);
            await AdminUserController.createAuditLog(adminId, 'UPDATE_USER', {
                description: `User updated: ${user.email}`,
                severity: 'medium',
                status: 'success',
                targetType: 'user',
                targetId: id,
                targetEmail: user.email,
                changes: {
                    before: previousData,
                    after: updatedUser.toObject(),
                    fieldsChanged: changedFields
                }
            }, req);

            res.json({
                success: true,
                message: 'User updated successfully',
                data: updatedUser
            });

        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user',
                error: error.message
            });
        }
    }

    // @desc    Update user status
    // @route   PATCH /api/admin/users/:id/status
    // @access  Private (Admin)
    async updateUserStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, reason } = req.body;
            const adminId = req.admin.id;
            
            console.log('🔄 [AdminUserController] updateUserStatus called for ID:', id, 'Status:', status);

            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: 'Status is required'
                });
            }

            const validStatuses = ['active', 'inactive', 'suspended', 'pending'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status'
                });
            }

            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const previousStatus = user.status;

            // Update user status
            const updatedUser = await User.findByIdAndUpdate(
                id,
                { 
                    status,
                    statusReason: reason,
                    statusUpdatedAt: new Date(),
                    statusUpdatedBy: adminId
                },
                { new: true, runValidators: true }
            ).select('-password -passwordHistory');

            // Create audit log
            await AdminUserController.createAuditLog(adminId, 'UPDATE_USER_STATUS', {
                description: `User status changed from ${previousStatus} to ${status}: ${user.email}`,
                severity: status === 'suspended' ? 'high' : 'medium',
                status: 'success',
                targetType: 'user',
                targetId: id,
                targetEmail: user.email,
                changes: {
                    before: { status: previousStatus },
                    after: { status, reason },
                    fieldsChanged: ['status', 'statusReason']
                }
            }, req);

            res.json({
                success: true,
                message: 'User status updated successfully',
                data: updatedUser
            });

        } catch (error) {
            console.error('Error updating user status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user status',
                error: error.message
            });
        }
    }

    // @desc    Delete user
    // @route   DELETE /api/admin/users/:id
    // @access  Private (Admin)
    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body || {}; // Handle case where body is undefined
            const adminId = req.admin.id;
            
            console.log('🗑️ [AdminUserController] deleteUser called for ID:', id);

            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Check if user has any important data (commented out for testing)
            // const hasLeads = await Lead.countDocuments({ userId: id });
            // const hasPlans = await CoachPlan.countDocuments({ coachId: id });
            // const hasPayments = await Payment.countDocuments({ customerId: id });

            // if (hasLeads > 0 || hasPlans > 0 || hasPayments > 0) {
            //     return res.status(400).json({
            //         success: false,
            //         message: 'Cannot delete user with existing data. Consider deactivating instead.',
            //         data: {
            //             hasLeads,
            //             hasPlans,
            //             hasPayments
            //         }
            //     });
            // }

            // Soft delete - mark as deleted instead of actually deleting
            const deletedUser = await User.findByIdAndUpdate(
                id,
                { 
                    status: 'inactive',
                    deletedAt: new Date(),
                    isActive: false
                },
                { new: true, runValidators: true }
            ).select('-password -passwordHistory');

            // Create audit log
            await AdminUserController.createAuditLog(adminId, 'DELETE_USER', {
                description: `User deleted: ${user.email}`,
                severity: 'high',
                status: 'success',
                targetType: 'user',
                targetId: id,
                targetEmail: user.email,
                changes: {
                    before: user.toObject(),
                    after: deletedUser.toObject(),
                    fieldsChanged: ['status', 'deletedAt', 'isActive']
                }
            }, req);

            res.json({
                success: true,
                message: 'User deleted successfully',
                data: deletedUser
            });

        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete user',
                error: error.message
            });
        }
    }

    // @desc    Get user analytics
    // @route   GET /api/admin/users/analytics
    // @access  Private (Admin)
    async getUserAnalytics(req, res) {
        try {
            const { period = '30' } = req.query;
            const days = parseInt(period);
            const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
            
            console.log('📊 [AdminUserController] getUserAnalytics called with period:', period);

            // User growth analytics
            const userGrowth = await User.aggregate([
                {
                    $match: { 
                        createdAt: { $gte: startDate },
                        deletedAt: null // Exclude soft-deleted users
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

            // User role distribution
            const roleDistribution = await User.aggregate([
                {
                    $match: { deletedAt: null } // Exclude soft-deleted users
                },
                {
                    $group: {
                        _id: '$role',
                        count: { $sum: 1 }
                    }
                }
            ]);

            // User status distribution
            const statusDistribution = await User.aggregate([
                {
                    $match: { deletedAt: null } // Exclude soft-deleted users
                },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            // Active users (logged in within last 7 days)
            const activeUsers = await User.countDocuments({
                lastActiveAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                deletedAt: null
            });

            // New users this period
            const newUsers = await User.countDocuments({
                createdAt: { $gte: startDate },
                deletedAt: null
            });

            // Total users
            const totalUsers = await User.countDocuments({ deletedAt: null });

            // Calculate additional metrics for frontend
            const coaches = await User.countDocuments({ role: 'coach', deletedAt: null });
            const activePercentage = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0;
            const coachPercentage = totalUsers > 0 ? ((coaches / totalUsers) * 100).toFixed(1) : 0;
            const growthRate = totalUsers > 0 ? ((newUsers / totalUsers) * 100).toFixed(1) : 0;

            // Calculate max for progress bars
            const monthlyGrowthData = userGrowth.map(item => ({
                month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
                count: item.count
            }));
            const maxMonthlyUsers = Math.max(...monthlyGrowthData.map(item => item.count), 1);

            // Format data for frontend
            const formattedData = {
                // Main metrics for cards
                totalUsers,
                activeUsers,
                activePercentage: `${activePercentage}%`,
                coaches,
                coachPercentage: `${coachPercentage}%`,
                newUsersThisMonth: newUsers,
                growthRate: `${growthRate}%`,
                
                // Detailed analytics for charts
                monthlyGrowth: monthlyGrowthData,
                maxMonthlyUsers,
                roleDistribution: roleDistribution.map(item => ({
                    role: item._id,
                    count: item.count
                })),
                statusDistribution: statusDistribution.map(item => ({
                    status: item._id,
                    count: item.count
                })),
                recentActivity: [
                    {
                        description: `${newUsers} new users this month`,
                        timestamp: new Date().toLocaleDateString()
                    },
                    {
                        description: `${activeUsers} active users`,
                        timestamp: new Date().toLocaleDateString()
                    }
                ]
            };

            res.json({
                success: true,
                message: 'User analytics retrieved successfully',
                data: formattedData
            });

        } catch (error) {
            console.error('Error getting user analytics:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve user analytics',
                error: error.message
            });
        }
    }

    // @desc    Bulk update users
    // @route   POST /api/admin/users/bulk-update
    // @access  Private (Admin)
    async bulkUpdateUsers(req, res) {
        try {
            const { userIds, updateData, reason } = req.body;
            const adminId = req.admin.id;

            if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'User IDs array is required'
                });
            }

            if (!updateData || Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Update data is required'
                });
            }

            // Remove sensitive fields
            delete updateData.password;
            delete updateData.passwordHistory;

            // Update users
            const result = await User.updateMany(
                { _id: { $in: userIds } },
                { 
                    ...updateData,
                    lastModifiedBy: adminId,
                    bulkUpdateReason: reason
                }
            );

            // Create audit log
            await AdminUserController.createAuditLog(adminId, 'BULK_UPDATE_USERS', {
                description: `Bulk updated ${result.modifiedCount} users`,
                severity: 'medium',
                status: 'success',
                changes: {
                    userIds,
                    updateData,
                    reason,
                    modifiedCount: result.modifiedCount
                }
            }, req);

            res.json({
                success: true,
                message: `Successfully updated ${result.modifiedCount} users`,
                data: {
                    modifiedCount: result.modifiedCount,
                    matchedCount: result.matchedCount
                }
            });

        } catch (error) {
            console.error('Error bulk updating users:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to bulk update users',
                error: error.message
            });
        }
    }

    // @desc    Export users data
    // @route   GET /api/admin/users/export
    // @access  Private (Admin)
    async exportUsers(req, res) {
        try {
            const { format = 'json', role, status, startDate, endDate } = req.query;
            const adminId = req.admin.id;

            const query = {};
            if (role) query.role = role;
            if (status) query.status = status;
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) query.createdAt.$gte = new Date(startDate);
                if (endDate) query.createdAt.$lte = new Date(endDate);
            }

            const users = await User.find(query)
                .select('-password -passwordHistory')
                .sort({ createdAt: -1 });

            // Create audit log
            await AdminUserController.createAuditLog(adminId, 'EXPORT_USERS', {
                description: `Exported ${users.length} users in ${format} format`,
                severity: 'medium',
                status: 'success',
                changes: {
                    format,
                    userCount: users.length,
                    filters: { role, status, startDate, endDate }
                }
            }, req);

            if (format === 'csv') {
                // Convert to CSV format
                const csvData = this.convertToCSV(users);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
                res.send(csvData);
            } else {
                res.json({
                    success: true,
                    message: 'Users exported successfully',
                    data: users
                });
            }

        } catch (error) {
            console.error('Error exporting users:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to export users',
                error: error.message
            });
        }
    }

    // Helper method to convert data to CSV
    convertToCSV(data) {
        if (!data || data.length === 0) return '';

        const headers = Object.keys(data[0].toObject());
        const csvHeaders = headers.join(',');
        
        const csvRows = data.map(item => {
            const values = headers.map(header => {
                const value = item[header];
                if (value === null || value === undefined) return '';
                if (typeof value === 'object') return JSON.stringify(value);
                return `"${value}"`;
            });
            return values.join(',');
        });

        return [csvHeaders, ...csvRows].join('\n');
    }

    // @desc    Restore soft-deleted user
    // @route   PATCH /api/admin/users/:id/restore
    // @access  Private (Admin)
    async restoreUser(req, res) {
        try {
            const { id } = req.params;
            const adminId = req.admin.id;
            
            console.log('🔄 [AdminUserController] restoreUser called for ID:', id);

            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (!user.deletedAt) {
                return res.status(400).json({
                    success: false,
                    message: 'User is not deleted'
                });
            }

            // Restore user
            const restoredUser = await User.findByIdAndUpdate(
                id,
                { 
                    deletedAt: null,
                    status: 'active',
                    isActive: true
                },
                { new: true, runValidators: true }
            ).select('-password -passwordHistory');

            // Create audit log
            await AdminUserController.createAuditLog(adminId, 'RESTORE_USER', {
                description: `User restored: ${user.email}`,
                severity: 'medium',
                status: 'success',
                targetType: 'user',
                targetId: id,
                targetEmail: user.email,
                changes: {
                    before: user.toObject(),
                    after: restoredUser.toObject(),
                    fieldsChanged: ['deletedAt', 'status', 'isActive']
                }
            }, req);

            res.json({
                success: true,
                message: 'User restored successfully',
                data: restoredUser
            });

        } catch (error) {
            console.error('Error restoring user:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to restore user',
                error: error.message
            });
        }
    }

    // @desc    Create new user
    // @route   POST /api/admin/users
    // @access  Private (Admin)
    async createUser(req, res) {
        try {
            console.log('👤 [AdminUserController] createUser called with body:', req.body);
            
            const {
                name,
                email,
                phone,
                role = 'client',
                status = 'active',
                address,
                city,
                state,
                country,
                zipCode,
                password = 'defaultPassword123!' // Default password for admin-created users
            } = req.body;

            // Validate required fields
            if (!name || !email) {
                return res.status(400).json({
                    success: false,
                    message: 'Name and email are required'
                });
            }

            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User with this email already exists'
                });
            }

            // Prepare user data
            const userData = {
                name,
                email,
                phone,
                role,
                status,
                address,
                city,
                state,
                country,
                zipCode,
                password: password || 'defaultPassword123', // Default password, should be changed on first login
                isEmailVerified: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Add coach-specific fields if role is coach
            if (role === 'coach') {
                userData.selfCoachId = `COACH_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
                userData.currentLevel = 1;
                userData.hierarchyLevel = 1;
                userData.sponsorId = null;
                userData.uplineCoachId = null;
                userData.downlineCoaches = [];
                userData.totalDownlineCount = 0;
                userData.directDownlineCount = 0;
                userData.totalEarnings = 0;
                userData.monthlyEarnings = 0;
                userData.commissionRate = 0;
                userData.isActiveCoach = true;
                userData.coachStatus = 'active';
                userData.verificationStatus = 'pending';
                userData.bio = '';
                userData.specializations = [];
                userData.experience = 0;
                userData.certifications = [];
                userData.socialMediaLinks = {};
                userData.portfolio = {};
                userData.appointmentSettings = {};
                userData.pricing = {};
                userData.availability = {};
                userData.coachingPreferences = {};
                userData.marketingMaterials = {};
                userData.performanceMetrics = {};
                userData.clientTestimonials = [];
                userData.coachingPackages = [];
                userData.razorpayDetails = {};
                userData.mlmSettings = {};
                userData.commissionHistory = [];
                userData.payoutHistory = [];
                userData.analytics = {};
                userData.notifications = {};
                userData.preferences = {};
                userData.coachingTools = {};
                userData.resources = {};
                userData.trainingMaterials = {};
                userData.assessmentTools = {};
            }

            // Create new user
            const newUser = await User.create(userData);

            // Create audit log
            await AdminUserController.createAuditLog(req.admin._id, 'CREATE_USER', {
                description: `Created new user: ${newUser.email}`,
                severity: 'medium',
                status: 'success',
                changes: {
                    userId: newUser._id,
                    email: newUser.email,
                    role: newUser.role,
                    status: newUser.status
                }
            }, req);

            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: {
                    user: newUser
                }
            });

        } catch (error) {
            console.error('Error creating user:', error);
            
            // Create audit log for error
            await AdminUserController.createAuditLog(req.admin._id, 'CREATE_USER', {
                description: 'Failed to create user',
                severity: 'high',
                status: 'error',
                errorMessage: error.message
            }, req);

            res.status(500).json({
                success: false,
                message: 'Failed to create user',
                error: error.message
            });
        }
    }

    // @desc    Bulk delete users
    // @route   POST /api/admin/users/bulk-delete
    // @access  Private (Admin)
    async bulkDeleteUsers(req, res) {
        try {
            const { userIds } = req.body;

            if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'User IDs array is required'
                });
            }

            // Validate that all users exist
            const users = await User.find({ _id: { $in: userIds } });
            if (users.length !== userIds.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Some users not found'
                });
            }

            // Soft delete users (set deletedAt instead of removing)
            const result = await User.updateMany(
                { _id: { $in: userIds } },
                { 
                    $set: { 
                        status: 'deleted',
                        deletedAt: new Date(),
                        updatedAt: new Date()
                    }
                }
            );

            // Create audit log
            await AdminUserController.createAuditLog(req.admin._id, 'BULK_DELETE_USERS', {
                description: `Bulk deleted ${userIds.length} users`,
                severity: 'high',
                status: 'success',
                changes: {
                    deletedUserIds: userIds,
                    deletedCount: result.modifiedCount
                }
            }, req);

            res.json({
                success: true,
                message: `${result.modifiedCount} users deleted successfully`,
                data: {
                    deletedCount: result.modifiedCount,
                    deletedUserIds: userIds
                }
            });

        } catch (error) {
            console.error('Error bulk deleting users:', error);
            
            // Create audit log for error
            await AdminUserController.createAuditLog(req.admin._id, 'BULK_DELETE_USERS', {
                description: 'Failed to bulk delete users',
                severity: 'high',
                status: 'error',
                errorMessage: error.message
            }, req);

            res.status(500).json({
                success: false,
                message: 'Failed to bulk delete users',
                error: error.message
            });
        }
    }
}

module.exports = new AdminUserController();
