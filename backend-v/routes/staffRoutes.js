const express = require('express');
const router = express.Router();
const { protect, authorizeCoach } = require('../middleware/auth');
const { updateLastActive } = require('../middleware/activityMiddleware');
const { populateStaffPermissions } = require('../middleware/permissionMiddleware');
const { 
    createStaff, 
    listStaff, 
    getStaff,
    updateStaff, 
    deactivateStaff,
    updateStaffPermissions,
    activateStaff,
    getStaffPerformance,
    getStaffPerformanceComparison,
    getStaffPerformanceTrends,
    bulkStaffActions,
    searchStaff,
    getStaffStats,
    resetStaffPassword,
    getStaffProfile,
    updateStaffProfile,
    getStaffActivity,
    sendStaffInvitation
} = require('../controllers/staffController');

// All staff routes are protected; coach/admin/staff access as applicable
router.use(protect, updateLastActive, populateStaffPermissions);

// ===== STAFF MANAGEMENT =====

// Create and list staff
router.post('/', authorizeCoach('coach','admin','super_admin'), createStaff);
router.get('/', authorizeCoach('coach','admin','super_admin'), listStaff);

// Staff search and statistics
router.get('/search', authorizeCoach('coach','admin','super_admin'), searchStaff);
router.get('/stats', authorizeCoach('coach','admin','super_admin'), getStaffStats);

// Individual staff management
router.get('/:id', authorizeCoach('coach','admin','super_admin'), getStaff);
router.put('/:id', authorizeCoach('coach','admin','super_admin'), updateStaff);
router.delete('/:id', authorizeCoach('coach','admin','super_admin'), deactivateStaff);

// Staff permissions management
router.post('/:id/permissions', authorizeCoach('coach','admin','super_admin'), updateStaffPermissions);

// Staff activation/deactivation
router.post('/:id/activate', authorizeCoach('coach','admin','super_admin'), activateStaff);

// Staff profile management
router.get('/:id/profile', authorizeCoach('coach','admin','super_admin'), getStaffProfile);
router.put('/:id/profile', authorizeCoach('coach','admin','super_admin'), updateStaffProfile);

// Staff password management
router.post('/:id/reset-password', authorizeCoach('coach','admin','super_admin'), resetStaffPassword);

// Staff activity and invitations
router.get('/:id/activity', authorizeCoach('coach','admin','super_admin'), getStaffActivity);
router.post('/:id/send-invitation', authorizeCoach('coach','admin','super_admin'), sendStaffInvitation);

// ===== STAFF PERFORMANCE =====

// Staff performance
router.get('/:id/performance', authorizeCoach('coach','admin','super_admin'), getStaffPerformance);
router.get('/:id/performance/trends', authorizeCoach('coach','admin','super_admin'), getStaffPerformanceTrends);

// Performance comparison
router.get('/performance/comparison', authorizeCoach('coach','admin','super_admin'), getStaffPerformanceComparison);

// ===== BULK OPERATIONS =====

// Bulk actions
router.post('/bulk-actions', authorizeCoach('coach','admin','super_admin'), bulkStaffActions);

module.exports = router;


