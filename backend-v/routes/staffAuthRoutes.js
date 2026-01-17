const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const staffAuthController = require('../controllers/staffAuthController');

// Staff login
router.post('/staff-login', staffAuthController.staffLogin);

// Get current staff user
router.get('/me', protect, staffAuthController.getCurrentStaff);

// Staff logout (optional - mainly for token invalidation)
router.post('/logout', protect, staffAuthController.staffLogout);

module.exports = router;
