const express = require('express');
const router = express.Router();
const {
    // Payment Collection Settings
    setupPaymentCollection,
    getPaymentSettings,
    
    // Coach Payments
    createPayment,
    getMyPayments,
    getCoachPayments,
    processPayment,
    
    // Analytics
    getPaymentAnalytics,
    getAdminPaymentAnalytics
} = require('../controllers/coachPaymentController');

const { 
    unifiedCoachAuth, 
    requirePermission, 
    checkResourceOwnership,
    filterResourcesByPermission 
} = require('../middleware/unifiedCoachAuth');
const { updateLastActive } = require('../middleware/activityMiddleware');
const { authorizeAdmin, protect } = require('../middleware/auth');

// ===== PAYMENT COLLECTION SETTINGS =====

// Coach routes with unified authentication
router.post('/setup-payment-collection', unifiedCoachAuth(), updateLastActive, requirePermission('payment:manage'), setupPaymentCollection);
router.get('/payment-settings', unifiedCoachAuth(), updateLastActive, requirePermission('payment:read'), getPaymentSettings);

// Admin routes for managing coach payment settings
router.get('/coach/:coachId/payment-settings', protect, authorizeAdmin, getPaymentSettings);
router.post('/setup-coach-payment-collection', protect, authorizeAdmin, setupPaymentCollection);

// ===== COACH PAYMENTS =====

// Coach routes with unified authentication
router.get('/my-payments', unifiedCoachAuth(), updateLastActive, requirePermission('payment:read'), getMyPayments);
router.get('/analytics', unifiedCoachAuth(), updateLastActive, requirePermission('payment:read'), getPaymentAnalytics);

// Admin routes for managing coach payments
router.post('/create-payment', protect, authorizeAdmin, createPayment);
router.get('/coach/:coachId/payments', protect, authorizeAdmin, getCoachPayments);
router.put('/:paymentId/process', protect, authorizeAdmin, processPayment);
router.get('/admin/analytics', protect, authorizeAdmin, getAdminPaymentAnalytics);

module.exports = router;
