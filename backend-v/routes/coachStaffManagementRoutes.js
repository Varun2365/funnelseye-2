const express = require('express');
const router = express.Router();
const coachStaffManagementController = require('../controllers/coachStaffManagementController');
const { 
    unifiedCoachAuth, 
    requirePermission, 
    checkResourceOwnership,
    filterResourcesByPermission 
} = require('../middleware/unifiedCoachAuth');

const { updateLastActive } = require('../middleware/activityMiddleware');

// Apply unified authentication and resource filtering to all routes
router.use(unifiedCoachAuth(), updateLastActive, filterResourcesByPermission('staff'));

// ===== STAFF MANAGEMENT ENDPOINTS =====

// IMPORTANT: Specific routes MUST come before :staffId routes

// Get all permissions grouped by category (for frontend permission management)
router.get('/permissions', requirePermission('staff:read'), coachStaffManagementController.getPermissionsList);

// Get available permission presets
router.get('/presets', requirePermission('staff:read'), coachStaffManagementController.getPermissionPresets);

// Get team performance (all staff comparison)
router.get('/team-performance', coachStaffManagementController.getTeamPerformanceMetrics);

// Get lead distribution settings (Coach only)
router.get('/lead-distribution', coachStaffManagementController.getLeadDistribution);

// Update lead distribution settings (Coach only)
router.put('/lead-distribution', coachStaffManagementController.updateLeadDistribution);

// Bulk update staff permissions
router.put('/bulk-permissions', coachStaffManagementController.bulkUpdatePermissions);

// Get all staff members
router.get('/', requirePermission('staff:read'), coachStaffManagementController.getStaffMembers);

// Create new staff member
router.post('/', requirePermission('staff:write'), coachStaffManagementController.createStaffMember);

// Get staff member details
router.get('/:staffId', requirePermission('staff:read'), coachStaffManagementController.getStaffDetails);

// Update staff member
router.put('/:staffId', requirePermission('staff:update'), coachStaffManagementController.updateStaffMember);

// Delete staff member
router.delete('/:staffId', requirePermission('staff:delete'), coachStaffManagementController.deleteStaffMember);

// ===== PERMISSION MANAGEMENT ENDPOINTS =====

// Update staff permissions
router.put('/:staffId/permissions', requirePermission('staff:manage'), coachStaffManagementController.updateStaffPermissions);

// Assign permission group to staff
router.post('/:staffId/permission-group', requirePermission('staff:manage'), coachStaffManagementController.assignPermissionGroup);

// Toggle staff active status
router.put('/:staffId/toggle-status', requirePermission('staff:manage'), coachStaffManagementController.toggleStaffStatus);

// Get staff performance (legacy endpoint)
router.get('/:staffId/performance', requirePermission('staff:read'), coachStaffManagementController.getStaffPerformance);

// Get staff tasks
router.get('/:staffId/tasks', coachStaffManagementController.getStaffTasks);

// Get staff metrics (performance score and stats)
router.get('/:staffId/metrics', coachStaffManagementController.getStaffMetrics);

// Get staff assigned leads
router.get('/:staffId/leads', coachStaffManagementController.getStaffLeads);

// Get staff activity logs
router.get('/activity', requirePermission('staff:read'), coachStaffManagementController.getActivityLogs);
router.get('/:staffId/activity', requirePermission('staff:read'), coachStaffManagementController.getStaffActivityLogs);

// Bulk operations
router.post('/bulk-delete', requirePermission('staff:delete'), coachStaffManagementController.bulkDeleteStaff);
router.post('/bulk-export', requirePermission('staff:read'), coachStaffManagementController.bulkExportStaff);

module.exports = router;
