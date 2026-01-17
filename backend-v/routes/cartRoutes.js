// D:\PRJ_YCT_Final\routes\cartRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
// const paymentService = require('../services/paymentService');
const asyncHandler = require('../middleware/async');

// Protect all cart routes
router.use(protect);

// ===== SHOPPING CART MANAGEMENT =====

/**
 * @route   POST /api/cart
 * @desc    Update shopping cart
 * @access  Private (Coach/Lead)
 */
router.post('/', asyncHandler(async (req, res, next) => {
    const { coachId, leadId, items, subtotal, tax, discount, total } = req.body;
    
    const cart = await paymentService.updateCart({
        coachId,
        leadId,
        items,
        subtotal,
        tax,
        discount,
        total
    });
    
    res.status(201).json({
        success: true,
        data: cart
    });
}));

/**
 * @route   GET /api/cart/:cartId
 * @desc    Get cart details
 * @access  Private (Coach/Lead)
 */
router.get('/:cartId', asyncHandler(async (req, res, next) => {
    const { cartId } = req.params;
    
    // This would typically fetch from a cart service
    // For now, return mock data
    const cart = {
        id: cartId,
        items: [
            {
                productId: 'prod_123',
                name: '12-Week Fitness Program',
                quantity: 1,
                price: 99,
                total: 99
            }
        ],
        subtotal: 99,
        tax: 8.91,
        discount: 0,
        total: 107.91,
        status: 'active'
    };
    
    res.json({
        success: true,
        data: cart
    });
}));

/**
 * @route   POST /api/cart/:cartId/recovery
 * @desc    Send cart recovery notification
 * @access  Private (Coach)
 */
router.post('/:cartId/recovery', asyncHandler(async (req, res, next) => {
    const { cartId } = req.params;
    
    const recoveryResult = await paymentService.sendCartRecoveryNotification(cartId);
    
    res.json({
        success: true,
        data: recoveryResult
    });
}));

/**
 * @route   POST /api/cart/:cartId/complete
 * @desc    Complete cart purchase
 * @access  Private (Coach/Lead)
 */
router.post('/:cartId/complete', asyncHandler(async (req, res, next) => {
    const { cartId } = req.params;
    const { paymentData } = req.body;
    
    const purchaseResult = await paymentService.completeCartPurchase(cartId, paymentData);
    
    res.json({
        success: true,
        data: purchaseResult
    });
}));

/**
 * @route   GET /api/cart/coach/:coachId
 * @desc    Get all carts for a coach
 * @access  Private (Coach)
 */
router.get('/coach/:coachId', asyncHandler(async (req, res, next) => {
    const { coachId } = req.params;
    
    // This would typically fetch from a cart service
    // For now, return mock data
    const carts = [
        {
            id: 'cart_1',
            leadId: 'lead_123',
            status: 'active',
            total: 107.91,
            createdAt: new Date().toISOString()
        }
    ];
    
    res.json({
        success: true,
        data: carts
    });
}));

/**
 * @route   GET /api/cart/lead/:leadId
 * @desc    Get cart for a specific lead
 * @access  Private (Coach/Lead)
 */
router.get('/lead/:leadId', asyncHandler(async (req, res, next) => {
    const { leadId } = req.params;
    
    // This would typically fetch from a cart service
    // For now, return mock data
    const cart = {
        id: 'cart_1',
        leadId,
        items: [],
        total: 0,
        status: 'active'
    };
    
    res.json({
        success: true,
        data: cart
    });
}));

/**
 * @route   PUT /api/cart/:cartId/abandon
 * @desc    Mark cart as abandoned
 * @access  Private (Coach)
 */
router.put('/:cartId/abandon', asyncHandler(async (req, res, next) => {
    const { cartId } = req.params;
    
    // This would typically update cart status
    // For now, return success
    res.json({
        success: true,
        message: 'Cart marked as abandoned'
    });
}));

module.exports = router;
