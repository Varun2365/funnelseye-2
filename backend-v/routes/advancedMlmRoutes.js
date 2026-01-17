const express = require('express');
const router = express.Router();

const { 
    // Health Check
    mlmHealthCheck,
    
    // Hierarchy Level Management
    getHierarchyLevels,
    generateCoachId,
    setupHierarchyLevels,
    
    // Sponsor Management
    searchSponsor,
    createExternalSponsor,
    
    // Hierarchy Locking
    lockHierarchy,
    
    // Admin Request System
    submitAdminRequest,
    getCoachAdminRequests,
    
    // Admin Functions
    getPendingAdminRequests,
    processAdminRequest,
    changeCoachUpline,
    
    // Commission System
    getCommissionSettings,
    updateCommissionSettings,
    calculateCommission,
    getCoachCommissions,
    processMonthlyCommissions,
    calculateSubscriptionCommission,
    
    // Admin Functions
    getAdminCoaches,
    
    // ===== INTEGRATED EXISTING MLM FUNCTIONALITY =====
    addDownline,
    getDownline,
    getDownlineHierarchy,
    getTeamPerformance,
    generateTeamReport,
    getReports,
    getReportDetail,
    
    // ===== ENHANCED PERFORMANCE TRACKING =====
    getCoachPerformance,
    getSalesPerformance,
    getClientPerformance,
    getLeadPerformance,
    
} = require('../controllers/advancedMlmController');

const { protect, authorizeCoach, authorizeStaff, authorizeAdmin } = require('../middleware/auth');
const { verifyAdminToken, checkAdminPermission, noLogActivity } = require('../middleware/adminAuth');
const { updateLastActive } = require('../middleware/activityMiddleware');

// ===== PUBLIC ROUTES (No Authentication Required) =====

// Route 0: Health check
router.get('/health', mlmHealthCheck);

// Route 0.1: Test middleware chain (Admin only)
router.get('/test-middleware', verifyAdminToken, checkAdminPermission('mlmSettings'), noLogActivity, (req, res) => {
    res.json({
        success: true,
        message: 'Middleware chain working correctly',
        admin: {
            id: req.admin.id,
            email: req.admin.email
        }
    });
});

// Route 0.2: Clean up database - Fix null selfCoachId values (Admin only)
// router.post('/cleanup-database', protect, updateLastActive, authorizeAdmin, cleanupDatabase);

// ===== HIERARCHY LEVEL MANAGEMENT =====

// Route 1: Setup default hierarchy levels (Admin only)
router.post('/setup-hierarchy', verifyAdminToken, checkAdminPermission('mlmSettings'), noLogActivity, setupHierarchyLevels);

// Route 2: Get all hierarchy levels (Public)
router.get('/hierarchy-levels', getHierarchyLevels);

// Route 3: Generate unique coach ID
router.post('/generate-coach-id', generateCoachId);

// Route 4: Search for sponsors (digital system users and external)
router.get('/search-sponsor', searchSponsor);

// Route 5: Create external sponsor
router.post('/external-sponsor', createExternalSponsor);

// Route 6: Coach signup with hierarchy details
// REMOVED: Now handled by unified signup at /api/auth/signup
// Use /api/auth/signup with role: 'coach' and optional MLM fields

// ===== PRIVATE ROUTES (Coach Authentication Required) =====

// Route 7: Lock hierarchy after first login
router.post('/lock-hierarchy', protect, updateLastActive, authorizeCoach('coach'), lockHierarchy);

// Route 8: Submit admin request for hierarchy changes
router.post('/admin-request', protect, updateLastActive, authorizeCoach('coach'), submitAdminRequest);

// Route 9: Get admin requests for a specific coach
// Coaches can view their own admin requests
router.get('/admin-requests/:coachId', protect, updateLastActive, authorizeCoach('coach', 'admin', 'super_admin'), getCoachAdminRequests);

// ===== COMMISSION SYSTEM =====

// Route 10: Calculate commission only on platform subscriptions (Admin only)
router.post('/calculate-subscription-commission', verifyAdminToken, checkAdminPermission('mlmSettings'), noLogActivity, calculateSubscriptionCommission);

// Route 10: Get coach commissions
// Coaches can view their own commissions, admins can view any coach's commissions
router.get('/commissions/:coachId', protect, updateLastActive, authorizeCoach('coach', 'admin', 'super_admin'), getCoachCommissions);

// ===== ADMIN ROUTES (Admin Authentication Required) =====

// Route 11: Get all pending admin requests
router.get('/admin/pending-requests', verifyAdminToken, noLogActivity, getPendingAdminRequests);

// Route 12: Process admin request (approve/reject)
router.put('/admin/process-request/:requestId', verifyAdminToken, checkAdminPermission('mlmSettings'), noLogActivity, processAdminRequest);

// Route 13: Change coach upline
router.put('/admin/change-upline', verifyAdminToken, checkAdminPermission('mlmSettings'), noLogActivity, changeCoachUpline);

// Route 14: Get commission settings
router.get('/admin/commission-settings', verifyAdminToken, checkAdminPermission('mlmSettings'), noLogActivity, getCommissionSettings);

// Route 15: Update commission settings
router.put('/admin/commission-settings', verifyAdminToken, checkAdminPermission('mlmSettings'), noLogActivity, updateCommissionSettings);

// Route 16: Calculate and create commission for subscription
router.post('/admin/calculate-commission', verifyAdminToken, checkAdminPermission('mlmSettings'), noLogActivity, calculateCommission);

// Route 17: Process monthly commission payments
router.post('/admin/process-monthly-commissions', verifyAdminToken, checkAdminPermission('mlmSettings'), noLogActivity, processMonthlyCommissions);

// Route 18: Get all coaches (Admin only)
router.get('/admin/coaches', verifyAdminToken, checkAdminPermission('mlmSettings'), noLogActivity, getAdminCoaches);

// Route 19: Get hierarchy for admin (Admin only)
router.get('/admin/hierarchy/:coachId', verifyAdminToken, checkAdminPermission('mlmSettings'), noLogActivity, getDownlineHierarchy);

// Route 20: Get coach performance for admin (Admin only)
router.get('/admin/coach-performance/:coachId', verifyAdminToken, checkAdminPermission('mlmSettings'), noLogActivity, getCoachPerformance);

// Route 21: Get sales performance for admin (Admin only)
router.get('/admin/sales-performance/:sponsorId', verifyAdminToken, checkAdminPermission('mlmSettings'), noLogActivity, getSalesPerformance);

// Route 22: Get client performance for admin (Admin only)
router.get('/admin/client-performance/:sponsorId', verifyAdminToken, checkAdminPermission('mlmSettings'), noLogActivity, getClientPerformance);

// Route 23: Get lead performance for admin (Admin only)
router.get('/admin/lead-performance/:sponsorId', verifyAdminToken, checkAdminPermission('mlmSettings'), noLogActivity, getLeadPerformance);

// ===== INTEGRATED EXISTING MLM FUNCTIONALITY =====

// Route 18: Add a new coach to downline
router.post('/downline', protect, updateLastActive, authorizeCoach('coach'), addDownline);

// Route 19: Get direct downline for a specific sponsor
// Coaches can view their own downline, admins can view any coach's downline
router.get('/downline/:sponsorId', protect, updateLastActive, authorizeCoach('coach', 'admin', 'super_admin'), getDownline);

// Route 20: Get complete downline hierarchy
// Coaches can view their own hierarchy, admins can view any coach's hierarchy
router.get('/hierarchy/:coachId', protect, updateLastActive, authorizeCoach('coach', 'admin', 'super_admin'), getDownlineHierarchy);

// Route 21: Get team performance summary
// Coaches can view their own team performance, admins can view any coach's team performance
router.get('/team-performance/:sponsorId', protect, updateLastActive, authorizeCoach('coach', 'admin', 'super_admin'), getTeamPerformance);

// Route 22: Generate comprehensive team report
router.post('/generate-report', protect, updateLastActive, authorizeCoach('coach'), generateTeamReport);

// Route 23: Get list of generated reports
// Coaches can view their own reports, admins can view any coach's reports
router.get('/reports/:sponsorId', protect, updateLastActive, authorizeCoach('coach', 'admin', 'super_admin'), getReports);

// Route 24: Get specific report details
// Coaches can view their own reports, admins can view any report
router.get('/reports/detail/:reportId', protect, updateLastActive, authorizeCoach('coach', 'admin', 'super_admin'), getReportDetail);

// ===== ENHANCED PERFORMANCE TRACKING ROUTES =====

// Route 25: Get detailed performance metrics for a specific coach
// Coaches can view their own performance, admins can view any coach's performance
router.get('/coach-performance/:coachId', protect, updateLastActive, authorizeCoach('coach', 'admin', 'super_admin'), getCoachPerformance);

// Route 26: Get sales performance for downline coaches
// Coaches can view their own team's sales performance, admins can view any coach's sales performance
router.get('/sales-performance/:sponsorId', protect, updateLastActive, authorizeCoach('coach', 'admin', 'super_admin'), getSalesPerformance);

// Route 27: Get client acquisition performance for downline coaches
// Coaches can view their own team's client performance, admins can view any coach's client performance
router.get('/client-performance/:sponsorId', protect, updateLastActive, authorizeCoach('coach', 'admin', 'super_admin'), getClientPerformance);

// Route 28: Get lead generation performance for downline coaches
// Coaches can view their own team's lead performance, admins can view any coach's lead performance
router.get('/lead-performance/:sponsorId', protect, updateLastActive, authorizeCoach('coach', 'admin', 'super_admin'), getLeadPerformance);

module.exports = router;
