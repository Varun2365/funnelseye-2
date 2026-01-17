const express = require('express');
const router = express.Router();
const RegisterController = require('../controllers/registerController');

// Initialize controller
const registerController = new RegisterController();

// --- Register Routes ---

// Signup page
// GET /register/signup
router.get('/signup', registerController.getSignupPage.bind(registerController));

// Login page
// GET /register/login
router.get('/login', registerController.getLoginPage.bind(registerController));

// Verify OTP page
// GET /register/verify-otp
router.get('/verify-otp', registerController.getVerifyOtpPage.bind(registerController));

// Select plan page
// GET /register/select-plan
router.get('/select-plan', registerController.getSelectPlanPage.bind(registerController));

module.exports = router;
