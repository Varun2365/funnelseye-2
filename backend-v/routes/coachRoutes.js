// D:\PRJ_YCT_Final\routes\coachRoutes.js

const express = require('express');
const router = express.Router();
const { updateCoachProfile, addCredits, updateWhatsAppConfig, getMyInfo } = require('../controllers/coachController');

const { 
    unifiedCoachAuth, 
    requirePermission, 
    checkResourceOwnership,
    filterResourcesByPermission 
} = require('../middleware/unifiedCoachAuth');
const { updateLastActive } = require('../middleware/activityMiddleware');

// Apply unified authentication middleware to all routes
router.use(unifiedCoachAuth(), updateLastActive);

// Route 1: Get my coach information
// Method: GET
// Both coaches and staff can access this (staff see their coach's info)
router.get('/me', getMyInfo);

// Route 2: Update a coach's portfolio information
// Method: PUT
// Only coaches can update their profile, staff cannot
router.put('/:id/profile', requirePermission('coach:update'), updateCoachProfile);

// Route 3: Update WhatsApp configuration for a coach
// Method: PUT
// Only coaches can update WhatsApp config, staff cannot
router.put('/:id/whatsapp-config', requirePermission('whatsapp:manage'), updateWhatsAppConfig);

// Route 4: Add credits to a coach's account
// A coach can add credits to their own account. An admin can add credits to any account.
// Method: POST
// Only coaches can add credits to their own account
router.post('/add-credits/:id', requirePermission('coach:manage'), addCredits);

module.exports = router;