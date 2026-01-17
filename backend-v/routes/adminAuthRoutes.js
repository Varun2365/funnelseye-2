const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');
const { verifyAdminToken, adminRateLimit } = require('../middleware/adminAuth');

// ===== ADMIN AUTHENTICATION ROUTES =====

// @route   POST /api/admin/auth/login
// @desc    Admin login
// @access  Public
router.post('/login', adminRateLimit(5, 15 * 60 * 1000), adminAuthController.login);

// @route   POST /api/admin/auth/logout
// @desc    Admin logout
// @access  Private (Admin)
router.post('/logout', verifyAdminToken, adminAuthController.logout);

// @route   GET /api/admin/auth/profile
// @desc    Get admin profile
// @access  Private (Admin)
router.get('/profile', verifyAdminToken, adminAuthController.getProfile);

// @route   PUT /api/admin/auth/profile
// @desc    Update admin profile
// @access  Private (Admin)
router.put('/profile', verifyAdminToken, adminAuthController.updateProfile);

// @route   PUT /api/admin/auth/change-password
// @desc    Change admin password
// @access  Private (Admin)
router.put('/change-password', verifyAdminToken, adminAuthController.changePassword);

// @route   GET /api/admin/auth/verify
// @desc    Verify admin token
// @access  Private (Admin)
router.get('/verify', verifyAdminToken, adminAuthController.verifyToken);

// @route   POST /api/admin/auth/refresh
// @desc    Refresh admin token
// @access  Private (Admin)
router.post('/refresh', verifyAdminToken, adminAuthController.refreshToken);

module.exports = router;
