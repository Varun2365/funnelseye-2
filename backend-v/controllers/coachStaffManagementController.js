const Staff = require('../schema/Staff');
const User = require('../schema/User');
const Lead = require('../schema/Lead');
const Task = require('../schema/Task');
const asyncHandler = require('../middleware/async');
const staffDashboardService = require('../services/staffDashboardService');
const CoachStaffService = require('../services/coachStaffService');
const { 
    SECTIONS,
    SECTION_METADATA,
    PERMISSION_PRESETS,
    getAllValidPermissions,
    getSectionsGroupedByCategory,
    getAvailablePresets 
} = require('../utils/sectionPermissions');

/**
 * Coach Staff Management Controller
 * Allows coaches to manage their staff members and assign permissions
 */
class CoachStaffManagementController {

    /**
     * Get available permission presets
     * @route GET /api/coach/staff/presets
     * @access Private (Coach/Staff with staff:read permission)
     */
    getPermissionPresets = asyncHandler(async (req, res) => {
        const userContext = req.userContext;
        
        // Log staff action if applicable
        if (userContext && userContext.isStaff) {
            console.log(`[Staff Action] ${userContext.userId} accessed permission presets`);
        }

        // Get available presets from unified permissions
        const presetNames = getAvailablePresets();
        const presets = {};
        
        for (const presetName of presetNames) {
            presets[presetName] = {
                name: presetName,
                permissions: PERMISSION_PRESETS[presetName],
                description: `${presetName} permission preset`
            };
        }

        res.json({
            success: true,
            data: {
                presets: presets,
                totalPresets: presetNames.length,
                userContext: {
                    isStaff: userContext ? userContext.isStaff : false,
                    permissions: userContext ? userContext.permissions : []
                }
            }
        });
    });

    /**
     * Get all permissions grouped by category
     * @route GET /api/coach/staff/permissions
     * @access Private (Coach/Staff with staff:read permission)
     */
    getPermissionsList = asyncHandler(async (req, res) => {
        const coachId = req.coachId;
        const userContext = req.userContext;
        
        // Log staff action if applicable
        if (userContext && userContext.isStaff) {
            console.log(`[Staff Action] ${userContext.userId} accessed permissions list for coach ${coachId}`);
        }

        // Get permissions dynamically from section permissions system
        const permissionsGrouped = getSectionsGroupedByCategory();
        const formattedPermissions = {};
        
        // Build permissions response dynamically from permissionsGrouped
        for (const [category, sections] of Object.entries(permissionsGrouped)) {
            if (!formattedPermissions[category]) {
                formattedPermissions[category] = {
                    category: category,
                    description: `${category} permissions`,
                    permissions: {}
                };
            }
            
            sections.forEach(sectionData => {
                formattedPermissions[category].permissions[sectionData.section] = {
                    permission: sectionData.section,
                    name: sectionData.name,
                    description: sectionData.description,
                    icon: sectionData.icon || '📋',
                    alwaysAccessible: sectionData.alwaysAccessible || false,
                    coachOnly: sectionData.coachOnly || false
                };
            });
        }

        res.json({
            success: true,
            data: {
                permissions: formattedPermissions,
                totalCategories: Object.keys(formattedPermissions).length,
                totalPermissions: Object.values(formattedPermissions).reduce((total, category) => {
                    return total + Object.keys(category.permissions).length;
                }, 0),
                userContext: {
                    isStaff: userContext ? userContext.isStaff : false,
                    permissions: userContext ? userContext.permissions : []
                }
            }
        });
    });

    /**
     * Get all staff members for a coach
     * @route GET /api/coach/staff
     * @access Private (Coach)
     */
    getStaffMembers = asyncHandler(async (req, res) => {
        const coachId = req.coachId;
        
        const staffMembers = await Staff.find({ coachId }).select('-password');
        
        res.json({
            success: true,
            data: staffMembers
        });
    });

    /**
     * Create new staff member
     * @route POST /api/coach/staff
     * @access Private (Coach)
     */
    createStaffMember = asyncHandler(async (req, res) => {
        const coachId = req.coachId;
        
        // Check subscription limits for staff creation
        const SubscriptionLimitsMiddleware = require('../middleware/subscriptionLimits');
        const limitCheck = await SubscriptionLimitsMiddleware.checkStaffLimit(coachId);
        
        if (!limitCheck.allowed) {
            return res.status(403).json({
                success: false,
                message: limitCheck.reason,
                error: 'STAFF_LIMIT_REACHED',
                currentCount: limitCheck.currentCount,
                maxLimit: limitCheck.maxLimit,
                upgradeRequired: limitCheck.upgradeRequired,
                subscriptionRequired: true
            });
        }
        
        // Validate required fields
        const { name, email, password, permissions = [] } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required'
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Create staff member
        const staffData = {
            name,
            email,
            password,
            role: 'staff',
            coachId,
            permissions,
            isActive: true
        };

        const staff = await Staff.create(staffData);
        
        // Remove password from response
        const staffResponse = staff.toObject();
        delete staffResponse.password;

        res.status(201).json({
            success: true,
            data: staffResponse
        });
    });

    /**
     * Update staff member
     * @route PUT /api/coach/staff/:staffId
     * @access Private (Coach)
     */
    updateStaffMember = asyncHandler(async (req, res) => {
        const { staffId } = req.params;
        const coachId = req.coachId;
        
        const staff = await Staff.findOneAndUpdate(
            { _id: staffId, coachId },
            req.body,
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        res.json({
            success: true,
            data: staff
        });
    });

    /**
     * Delete staff member
     * @route DELETE /api/coach/staff/:staffId
     * @access Private (Coach)
     */
    deleteStaffMember = asyncHandler(async (req, res) => {
        const { staffId } = req.params;
        const coachId = req.coachId;
        
        const staff = await Staff.findOneAndDelete({ _id: staffId, coachId });
        
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        res.json({
            success: true,
            message: 'Staff member deleted successfully'
        });
    });

    /**
     * Update staff permissions
     * @route PUT /api/coach/staff/:staffId/permissions
     * @access Private (Coach)
     */
    updateStaffPermissions = asyncHandler(async (req, res) => {
        const { staffId } = req.params;
        const { permissions } = req.body;
        const coachId = req.coachId;
        
        if (!Array.isArray(permissions)) {
            return res.status(400).json({
                success: false,
                message: 'Permissions must be an array'
            });
        }

        // Validate permissions
        const allValidPermissions = Object.values(PERMISSIONS).flatMap(group => Object.values(group));
        const invalidPermissions = permissions.filter(permission => !allValidPermissions.includes(permission));
        
        if (invalidPermissions.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Invalid permissions: ${invalidPermissions.join(', ')}`
            });
        }

        const staff = await Staff.findOneAndUpdate(
            { _id: staffId, coachId },
            { permissions },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        res.json({
            success: true,
            data: staff
        });
    });

    /**
     * Assign permission group to staff
     * @route POST /api/coach/staff/:staffId/permission-group
     * @access Private (Coach)
     */
    assignPermissionGroup = asyncHandler(async (req, res) => {
        const { staffId } = req.params;
        const { groupName } = req.body;
        const coachId = req.coachId;
        
        if (!PERMISSION_GROUPS[groupName]) {
            return res.status(400).json({
                success: false,
                message: `Permission group '${groupName}' not found`
            });
        }

        const permissions = PERMISSION_GROUPS[groupName];

        const staff = await Staff.findOneAndUpdate(
            { _id: staffId, coachId },
            { permissions },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        res.json({
            success: true,
            data: staff,
            message: `Permission group '${groupName}' assigned successfully`
        });
    });

    /**
     * Toggle staff active status
     * @route PUT /api/coach/staff/:staffId/toggle-status
     * @access Private (Coach)
     */
    toggleStaffStatus = asyncHandler(async (req, res) => {
        const { staffId } = req.params;
        const coachId = req.coachId;
        
        const staff = await Staff.findOne({ _id: staffId, coachId });
        
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        staff.isActive = !staff.isActive;
        await staff.save();

        res.json({
            success: true,
            data: {
                staffId: staff._id,
                isActive: staff.isActive
            },
            message: `Staff member ${staff.isActive ? 'activated' : 'deactivated'} successfully`
        });
    });

    /**
     * Get staff member details
     * @route GET /api/coach/staff/:staffId
     * @access Private (Coach)
     */
    getStaffDetails = asyncHandler(async (req, res) => {
        const { staffId } = req.params;
        const coachId = req.coachId;
        
        const staff = await Staff.findOne({ _id: staffId, coachId }).select('-password');
        
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        res.json({
            success: true,
            data: staff
        });
    });

    /**
     * Get staff performance summary
     * @route GET /api/coach/staff/:staffId/performance
     * @access Private (Coach)
     */
    getStaffPerformance = asyncHandler(async (req, res) => {
        const { staffId } = req.params;
        const coachId = req.coachId;
        
        const staff = await Staff.findOne({ _id: staffId, coachId });
        
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        // This would integrate with your performance tracking system
        const performance = {
            staffId: staff._id,
            name: staff.name,
            email: staff.email,
            isActive: staff.isActive,
            permissions: staff.permissions,
            lastActive: staff.lastActive || 'Never',
            createdAt: staff.createdAt,
            // Add performance metrics here
            metrics: {
                tasksCompleted: 0,
                leadsGenerated: 0,
                performanceScore: 0
            }
        };

        res.json({
            success: true,
            data: performance
        });
    });

    /**
     * Bulk update staff permissions
     * @route PUT /api/coach/staff/bulk-permissions
     * @access Private (Coach)
     */
    bulkUpdatePermissions = asyncHandler(async (req, res) => {
        const { staffUpdates } = req.body;
        const coachId = req.coachId;
        
        if (!Array.isArray(staffUpdates)) {
            return res.status(400).json({
                success: false,
                message: 'staffUpdates must be an array'
            });
        }

        const results = [];
        
        for (const update of staffUpdates) {
            const { staffId, permissions } = update;
            
            if (!staffId || !Array.isArray(permissions)) {
                results.push({
                    staffId,
                    success: false,
                    message: 'Invalid staffId or permissions'
                });
                continue;
            }

            try {
                const staff = await Staff.findOneAndUpdate(
                    { _id: staffId, coachId },
                    { permissions },
                    { new: true, runValidators: true }
                ).select('-password');
                
                if (staff) {
                    results.push({
                        staffId,
                        success: true,
                        data: staff
                    });
                } else {
                    results.push({
                        staffId,
                        success: false,
                        message: 'Staff member not found'
                    });
                }
            } catch (error) {
                results.push({
                    staffId,
                    success: false,
                    message: error.message
                });
            }
        }

        res.json({
            success: true,
            data: results
        });
    });

    /**
     * Get all sections grouped by category (NEW SECTION-BASED SYSTEM)
     * @route GET /api/coach/staff/sections
     * @access Private (Coach/Staff with staff_management permission)
     */
    getSectionsList = asyncHandler(async (req, res) => {
        const coachId = req.coachId;
        const userContext = req.userContext;
        
        // Log staff action if applicable
        if (userContext && userContext.isStaff) {
            console.log(`[Staff Action] ${userContext.userId} accessed sections list for coach ${coachId}`);
        }

        // Get sections grouped by category
        const sectionsGrouped = getSectionsGroupedByCategory();
        
        // Get available presets
        const presets = {};
        const presetNames = getAvailablePresets();
        for (const presetName of presetNames) {
            presets[presetName] = PERMISSION_PRESETS[presetName];
        }

        res.json({
            success: true,
            data: {
                sections: sectionsGrouped,
                presets: presets,
                totalCategories: Object.keys(sectionsGrouped).length,
                totalSections: Object.keys(SECTIONS).length,
                userContext: {
                    isStaff: userContext ? userContext.isStaff : false,
                    sections: userContext ? userContext.sections : []
                }
            }
        });
    });

    /**
     * Update staff sections (NEW SECTION-BASED SYSTEM)
     * @route PUT /api/coach/staff/:staffId/sections
     * @access Private (Coach/Staff with staff_management permission)
     */
    updateStaffSections = asyncHandler(async (req, res) => {
        const { staffId } = req.params;
        const { sections } = req.body;
        const coachId = req.coachId;

        // Validate sections array
        if (!Array.isArray(sections)) {
            return res.status(400).json({
                success: false,
                message: 'Sections must be an array'
            });
        }

        // Validate each section
        const { validateSections } = require('../utils/sectionPermissions');
        const validation = validateSections(sections);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.error,
                invalid: validation.invalid
            });
        }

        // Find staff member
        const staff = await Staff.findById(staffId);
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        // Verify staff belongs to this coach
        if (staff.coachId.toString() !== coachId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only manage your own staff members'
            });
        }

        // Always include dashboard and profile
        const finalSections = [...new Set([...sections, 'dashboard', 'profile'])];

        // Update staff sections
        staff.permissions = finalSections; // Reuse permissions field
        await staff.save();

        // Log action
        if (req.userContext && req.userContext.isStaff) {
            console.log(`[Staff Action] ${req.userContext.userId} updated sections for staff ${staffId}`);
        }

        res.json({
            success: true,
            message: 'Staff sections updated successfully',
            data: {
                staffId: staff._id,
                sections: staff.permissions,
                updatedAt: staff.updatedAt
            }
        });
    });

    /**
     * Assign section preset to staff (NEW SECTION-BASED SYSTEM)
     * @route POST /api/coach/staff/:staffId/section-preset
     * @access Private (Coach/Staff with staff_management permission)
     */
    assignSectionPreset = asyncHandler(async (req, res) => {
        const { staffId } = req.params;
        const { presetName } = req.body;
        const coachId = req.coachId;

        // Validate preset exists
        if (!PERMISSION_PRESETS[presetName]) {
            return res.status(400).json({
                success: false,
                message: 'Invalid preset name',
                availablePresets: getAvailablePresets()
            });
        }

        // Find staff member
        const staff = await Staff.findById(staffId);
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        // Verify staff belongs to this coach
        if (staff.coachId.toString() !== coachId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only manage your own staff members'
            });
        }

        // Get preset sections
        const presetSections = PERMISSION_PRESETS[presetName];

        // Update staff sections
        staff.permissions = presetSections;
        await staff.save();

        // Log action
        if (req.userContext && req.userContext.isStaff) {
            console.log(`[Staff Action] ${req.userContext.userId} assigned preset "${presetName}" to staff ${staffId}`);
        }

        res.json({
            success: true,
            message: `Preset "${presetName}" assigned successfully`,
            data: {
                staffId: staff._id,
                presetName: presetName,
                sections: staff.permissions,
                updatedAt: staff.updatedAt
            }
        });
    });
    
    /**
     * Get staff tasks (Coach view or Staff's own tasks)
     * @route GET /api/coach/staff/:staffId/tasks
     * @access Private (Coach or Staff viewing own tasks)
     */
    getStaffTasks = asyncHandler(async (req, res) => {
        const { staffId } = req.params;
        const coachId = CoachStaffService.getCoachIdForQuery(req);
        const userContext = CoachStaffService.getUserContext(req);
        
        // Staff can only view their own tasks unless they have staff:read permission
        if (userContext.isStaff && userContext.userId.toString() !== staffId.toString() && !CoachStaffService.hasPermission(req, SECTIONS.STAFF_MANAGEMENT.VIEW)) {
            return res.status(403).json({
                success: false,
                message: 'You can only view your own tasks'
            });
        }
        
        try {
            const tasks = await Task.find({
                coachId,
                assignedTo: staffId
            }).sort({ dueDate: 1, priority: -1 });
            
            const pendingTasks = tasks.filter(t => t.status !== 'Completed' && t.status !== 'Cancelled');
            const completedTasks = tasks.filter(t => t.status === 'Completed');
            
            // Overdue tasks
            const overdueTasks = pendingTasks.filter(t => 
                t.dueDate && new Date(t.dueDate) < new Date()
            );
            
            // Today's tasks
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);
            
            const todayTasks = pendingTasks.filter(t => 
                t.dueDate && 
                new Date(t.dueDate) >= today && 
                new Date(t.dueDate) <= todayEnd
            );
            
            res.json({
                success: true,
                data: {
                    total: tasks.length,
                    pending: pendingTasks.length,
                    completed: completedTasks.length,
                    overdue: overdueTasks.length,
                    todayTasks: todayTasks,
                    allTasks: tasks,
                    completionRate: tasks.length > 0 
                        ? ((completedTasks.length / tasks.length) * 100).toFixed(1)
                        : 0
                }
            });
        } catch (error) {
            res.json({
                success: true,
                data: {
                    total: 0,
                    pending: 0,
                    completed: 0,
                    message: 'Task tracking not available'
                }
            });
        }
    });
    
    /**
     * Get staff performance metrics (detailed)
     * @route GET /api/coach/staff/:staffId/metrics
     * @access Private (Coach or Staff viewing own metrics)
     */
    getStaffMetrics = asyncHandler(async (req, res) => {
        const { staffId } = req.params;
        const coachId = CoachStaffService.getCoachIdForQuery(req);
        const userContext = CoachStaffService.getUserContext(req);
        
        // Staff can only view their own metrics unless they have staff:read permission
        if (userContext.isStaff && userContext.userId.toString() !== staffId.toString() && !CoachStaffService.hasPermission(req, SECTIONS.STAFF_MANAGEMENT.VIEW)) {
            return res.status(403).json({
                success: false,
                message: 'You can only view your own metrics'
            });
        }
        
        // Get comprehensive staff metrics using staff dashboard service
        const performanceScore = await staffDashboardService.calculatePerformanceScore(coachId, staffId, req);
        
        // Get lead stats
        const mongoose = require('mongoose');
        const leadStats = await Lead.aggregate([
            {
                $match: {
                    coachId: new mongoose.Types.ObjectId(coachId),
                    $or: [
                        { assignedTo: new mongoose.Types.ObjectId(staffId) },
                        { 'appointment.assignedStaffId': new mongoose.Types.ObjectId(staffId) }
                    ]
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        res.json({
            success: true,
            data: {
                performanceScore: performanceScore,
                leadStats: leadStats,
                staffId: staffId,
                coachId: coachId
            }
        });
    });
    
    /**
     * Get team performance (all staff members)
     * @route GET /api/coach/staff/team-performance
     * @access Private (Coach or Staff)
     */
    getTeamPerformanceMetrics = asyncHandler(async (req, res) => {
        const coachId = CoachStaffService.getCoachIdForQuery(req);
        const userContext = CoachStaffService.getUserContext(req);
        
        // Log staff action if applicable
        if (userContext && userContext.isStaff) {
            console.log(`[Staff Action] ${userContext.userId} accessed team performance`);
        }
        
        const teamPerformance = await staffDashboardService.getTeamPerformance(coachId, userContext.userId, req);
        
        res.json({
            success: true,
            data: teamPerformance
        });
    });
    
    /**
     * Get lead distribution settings
     * @route GET /api/coach/staff/lead-distribution
     * @access Private (Coach only)
     */
    getLeadDistribution = asyncHandler(async (req, res) => {
        const coachId = CoachStaffService.getCoachIdForQuery(req);
        const userContext = CoachStaffService.getUserContext(req);
        
        // Only coaches can view/manage lead distribution
        if (userContext.isStaff) {
            return res.status(403).json({
                success: false,
                message: 'Only coaches can manage lead distribution settings'
            });
        }
        
        // Get all active staff
        const staff = await Staff.find({ coachId, isActive: true }).select('name email distributionRatio');
        
        res.json({
            success: true,
            data: {
                staff: staff.map(s => ({
                    staffId: s._id,
                    name: s.name,
                    email: s.email,
                    distributionRatio: s.distributionRatio || 1
                })),
                totalRatio: staff.reduce((sum, s) => sum + (s.distributionRatio || 1), 0)
            }
        });
    });
    
    /**
     * Update lead distribution settings
     * @route PUT /api/coach/staff/lead-distribution
     * @access Private (Coach only)
     */
    updateLeadDistribution = asyncHandler(async (req, res) => {
        const coachId = CoachStaffService.getCoachIdForQuery(req);
        const userContext = CoachStaffService.getUserContext(req);
        const { distributions } = req.body;
        
        // Only coaches can manage lead distribution
        if (userContext.isStaff) {
            return res.status(403).json({
                success: false,
                message: 'Only coaches can manage lead distribution settings'
            });
        }
        
        if (!Array.isArray(distributions)) {
            return res.status(400).json({
                success: false,
                message: 'distributions must be an array'
            });
        }
        
        // Update each staff member's distribution ratio
        const results = [];
        for (const dist of distributions) {
            const { staffId, ratio } = dist;
            
            if (!staffId || ratio === undefined) {
                results.push({ staffId, success: false, message: 'Invalid data' });
                continue;
            }
            
            const staff = await Staff.findOneAndUpdate(
                { _id: staffId, coachId },
                { distributionRatio: ratio },
                { new: true }
            ).select('name email distributionRatio');
            
            if (staff) {
                results.push({
                    staffId: staff._id,
                    name: staff.name,
                    ratio: staff.distributionRatio,
                    success: true
                });
            } else {
                results.push({ staffId, success: false, message: 'Staff not found' });
            }
        }
        
        res.json({
            success: true,
            message: 'Lead distribution settings updated',
            data: results
        });
    });
    
    /**
     * Get all assigned leads for a staff member
     * @route GET /api/coach/staff/:staffId/leads
     * @access Private (Coach or Staff viewing own leads)
     */
    getStaffLeads = asyncHandler(async (req, res) => {
        const { staffId } = req.params;
        const coachId = CoachStaffService.getCoachIdForQuery(req);
        const userContext = CoachStaffService.getUserContext(req);
        
        // Staff can only view their own leads unless they have staff:read permission
        if (userContext.isStaff && userContext.userId.toString() !== staffId.toString() && !CoachStaffService.hasPermission(req, SECTIONS.STAFF_MANAGEMENT.VIEW)) {
            return res.status(403).json({
                success: false,
                message: 'You can only view your own leads'
            });
        }
        
        const leads = await Lead.find({
            coachId,
            $or: [
                { assignedTo: staffId },
                { 'appointment.assignedStaffId': staffId }
            ]
        }).sort({ createdAt: -1 }).populate('funnelId', 'name');
        
        const leadsByStatus = {
            new: leads.filter(l => l.status === 'New').length,
            contacted: leads.filter(l => l.status === 'Contacted').length,
            qualified: leads.filter(l => l.status === 'Qualified').length,
            converted: leads.filter(l => l.status === 'Converted').length,
            lost: leads.filter(l => l.status === 'Lost').length
        };
        
        res.json({
            success: true,
            data: {
                total: leads.length,
                leads: leads,
                leadsByStatus: leadsByStatus,
                conversionRate: leads.length > 0 
                    ? ((leadsByStatus.converted / leads.length) * 100).toFixed(1)
                    : 0
            }
        });
    });

    /**
     * Get activity logs for all staff or specific staff
     * @route GET /api/coach/staff/activity or /api/coach/staff/:staffId/activity
     * @access Private (Coach/Staff with staff:read permission)
     */
    getActivityLogs = asyncHandler(async (req, res) => {
        const coachId = req.coachId;
        const { staffId } = req.params;
        
        // Get activity logs from ActivityLog model if exists, otherwise return empty
        try {
            const ActivityLog = require('../schema/ActivityLog');
            const query = { coachId };
            if (staffId) {
                query.userId = staffId;
            }
            
            const logs = await ActivityLog.find(query)
                .sort({ timestamp: -1 })
                .limit(100)
                .populate('userId', 'name email')
                .lean();
            
            res.json({
                success: true,
                data: logs || []
            });
        } catch (error) {
            // If ActivityLog model doesn't exist, return empty array
            res.json({
                success: true,
                data: []
            });
        }
    });

    getStaffActivityLogs = asyncHandler(async (req, res) => {
        return this.getActivityLogs(req, res);
    });

    /**
     * Bulk delete staff members
     * @route POST /api/coach/staff/bulk-delete
     * @access Private (Coach with staff:delete permission)
     */
    bulkDeleteStaff = asyncHandler(async (req, res) => {
        const coachId = req.coachId;
        const { staffIds } = req.body;
        
        if (!Array.isArray(staffIds) || staffIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an array of staff IDs to delete'
            });
        }
        
        const result = await Staff.deleteMany({
            _id: { $in: staffIds },
            coachId
        });
        
        res.json({
            success: true,
            message: `Successfully deleted ${result.deletedCount} staff member(s)`,
            data: {
                deletedCount: result.deletedCount
            }
        });
    });

    /**
     * Bulk export staff data
     * @route POST /api/coach/staff/bulk-export
     * @access Private (Coach/Staff with staff:read permission)
     */
    bulkExportStaff = asyncHandler(async (req, res) => {
        const coachId = req.coachId;
        const { staffIds, format = 'json' } = req.body;
        
        let query = { coachId };
        if (staffIds && Array.isArray(staffIds) && staffIds.length > 0) {
            query._id = { $in: staffIds };
        }
        
        const staffMembers = await Staff.find(query).select('-password').lean();
        
        if (format === 'csv') {
            // Convert to CSV format
            const csvRows = [];
            if (staffMembers.length > 0) {
                const headers = Object.keys(staffMembers[0]);
                csvRows.push(headers.join(','));
                
                staffMembers.forEach(staff => {
                    const values = headers.map(header => {
                        const value = staff[header];
                        if (Array.isArray(value)) {
                            return `"${value.join(';')}"`;
                        }
                        return `"${value || ''}"`;
                    });
                    csvRows.push(values.join(','));
                });
            }
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=staff_export_${Date.now()}.csv`);
            res.send(csvRows.join('\n'));
        } else {
            res.json({
                success: true,
                data: staffMembers
            });
        }
    });
}

module.exports = new CoachStaffManagementController();
