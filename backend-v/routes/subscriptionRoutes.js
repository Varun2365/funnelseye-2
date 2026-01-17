const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { subscriptionAuth } = require('../middleware/subscriptionAuth');

// Public routes
router.get('/plans', subscriptionController.getPlans);
router.get('/select-plan', subscriptionController.getSelectPlanPage);

// Protected routes (require authentication but no subscription check)
router.get('/current', subscriptionAuth, subscriptionController.getCurrentSubscription);
router.post('/create-order', subscriptionAuth, subscriptionController.createOrder);
router.post('/verify-payment', subscriptionAuth, subscriptionController.verifyPayment);
router.post('/cancel', subscriptionAuth, subscriptionController.cancelSubscription);
router.get('/history', subscriptionAuth, subscriptionController.getSubscriptionHistory);

module.exports = router;