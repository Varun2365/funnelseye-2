const express = require('express');
const router = express.Router();
const {
    getCreditBalance,
    purchaseCredits,
    getCreditTransactions,
    getCreditPackages,
    checkCanSendMessage
} = require('../controllers/whatsappCreditController');
const { protect } = require('../middleware/auth');

// @route   GET /api/messagingv1/credits/balance
// @desc    Get coach's credit balance
// @access  Private (Coach)
router.get('/balance', protect, getCreditBalance);

// @route   GET /api/messagingv1/credits/check
// @desc    Check if user can send messages
// @access  Private (Coach)
router.get('/check', protect, checkCanSendMessage);

// @route   GET /api/messagingv1/credits/packages
// @desc    Get available credit packages
// @access  Public
router.get('/packages', getCreditPackages);

// @route   POST /api/messagingv1/credits/purchase
// @desc    Purchase credits
// @access  Private (Coach)
router.post('/purchase', protect, purchaseCredits);

// @route   GET /api/messagingv1/credits/transactions
// @desc    Get credit transactions
// @access  Private (Coach)
router.get('/transactions', protect, getCreditTransactions);

module.exports = router;
