const express = require('express');
const router = express.Router();
const coursePurchaseController = require('../controllers/coursePurchaseController');

/**
 * @route   GET /api/course-purchase/:courseId
 * @desc    Render course purchase page
 * @access  Public
 */
router.get('/:courseId', coursePurchaseController.renderCoursePage);

/**
 * @route   GET /api/course-purchase/:courseId/details
 * @desc    Get course details for purchase page
 * @access  Public
 */
router.get('/:courseId/details', coursePurchaseController.getCourseDetails);

/**
 * @route   POST /api/course-purchase/:courseId/create-order
 * @desc    Create Razorpay order for course purchase
 * @access  Public
 */
router.post('/:courseId/create-order', coursePurchaseController.createOrder);

/**
 * @route   POST /api/course-purchase/verify-payment
 * @desc    Verify payment and grant access
 * @access  Public
 */
router.post('/verify-payment', coursePurchaseController.verifyPayment);

/**
 * @route   POST /api/course-purchase/webhook
 * @desc    Razorpay webhook handler
 * @access  Public (verified by signature)
 */
router.post('/webhook', (req, res, next) => {
  // Razorpay sends webhooks as raw JSON, we need to parse it
  let data = '';
  req.setEncoding('utf8');
  req.on('data', (chunk) => {
    data += chunk;
  });
  req.on('end', () => {
    try {
      req.body = JSON.parse(data);
      next();
    } catch (e) {
      res.status(400).send('Invalid JSON');
    }
  });
}, coursePurchaseController.handleWebhook);

/**
 * @route   GET /api/course-purchase/customer/:customerId/courses
 * @desc    Get customer's purchased courses
 * @access  Public (will be protected when customer auth is implemented)
 */
router.get('/customer/:customerId/courses', coursePurchaseController.getCustomerCourses);

/**
 * @route   GET /api/course-purchase/check-access/:courseId
 * @desc    Check if customer has access to a course
 * @access  Public (will be protected when customer auth is implemented)
 */
router.get('/check-access/:courseId', coursePurchaseController.checkAccess);

module.exports = router;

