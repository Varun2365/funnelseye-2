const mongoose = require('mongoose');
const SubscriptionPlan = require('../schema/SubscriptionPlan');
const CoachSubscription = require('../schema/CoachSubscription');
const User = require('../schema/User');
const Funnel = require('../schema/Funnel');
const Staff = require('../schema/Staff');
const AutomationRule = require('../schema/AutomationRule');
const Lead = require('../schema/Lead');
const logger = require('../utils/logger');

class SubscriptionController {
    
    /**
     * Get all available subscription plans
     * GET /api/subscriptions/plans
     */
    async getPlans(req, res) {
        try {
            logger.info('[SubscriptionController] Getting subscription plans');
            
            const plans = await SubscriptionPlan.find({ isActive: true })
                .sort({ sortOrder: 1, price: 1 })
                .populate('courseBundles.course', 'title thumbnail price currency category');
            
            res.json({
                success: true,
                data: plans
            });
            
        } catch (error) {
            logger.error('[SubscriptionController] Error getting plans:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting subscription plans',
                error: error.message
            });
        }
    }
  
    /**
     * Get plan selection page
     * GET /api/subscriptions/select-plan?token=coach_token
     */
    async getSelectPlanPage(req, res) {
        try {
            const { token } = req.query;
            
            let coach = null;
            let hasValidToken = false;
            
            if (token) {
                // Verify the token and get coach info
                const jwt = require('jsonwebtoken');
                const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
                
                try {
                    const decoded = jwt.verify(token, JWT_SECRET);
                    coach = await User.findById(decoded.id);
                    
                    if (coach && coach.role === 'coach') {
                        hasValidToken = true;
                    }
                } catch (error) {
                    // Token is invalid, but we'll still show the page
                    hasValidToken = false;
                }
            }

            // Get active subscription plans
            const plans = await SubscriptionPlan.find({ isActive: true })
                .sort({ sortOrder: 1, price: 1 })
                .populate('courseBundles.course', 'title thumbnail price currency category');

            // Check if coach already has an active subscription (only if valid token)
            let existingSubscription = null;
            if (hasValidToken && coach) {
                existingSubscription = await CoachSubscription.findOne({
                    coachId: coach._id,
                    status: { $in: ['active', 'trial'] }
                });
            }

            // Render the plan selection page
            res.send(this.renderPlanSelectionPage(plans, coach, existingSubscription, token, hasValidToken));
            
        } catch (error) {
            logger.error('[SubscriptionController] Error getting select plan page:', error);
            res.status(500).send(`
                <html>
                    <head><title>Error</title></head>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h1>Server Error</h1>
                        <p>An error occurred while loading the page.</p>
                    </body>
                </html>
            `);
        }
    }

    /**
     * Render the plan selection page HTML
     */
    renderPlanSelectionPage(plans, coach, existingSubscription, token, hasValidToken) {
        const hasActiveSubscription = !!existingSubscription;
        
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Select Your Plan - FunnelsEye</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #fafbff 0%, #f8f9ff 100%);
            min-height: 100vh;
            color: #1a1a1a;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        .header {
            text-align: center;
            padding: 80px 0 60px;
            border-bottom: 1px solid #f0f0f0;
            margin-bottom: 60px;
        }
        
        .header .subtitle {
            font-size: 0.75rem;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #6366f1;
            margin-bottom: 24px;
            font-family: 'Poppins', sans-serif;
        }
        
        .header h1 {
            font-size: 2.5rem;
            font-weight: 300;
            color: #1a1a1a;
            margin-bottom: 0;
            line-height: 1.3;
            font-family: 'Poppins', sans-serif;
        }
        
        .billing-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 80px;
        }
        
        .toggle-container {
            background: #f1f5f9;
            border-radius: 8px;
            padding: 4px;
            display: flex;
            position: relative;
        }
        
        .toggle-option {
            padding: 12px 32px;
            font-weight: 400;
            cursor: pointer;
            transition: all 0.3s ease;
            border-radius: 6px;
            position: relative;
            z-index: 2;
            font-family: 'Poppins', sans-serif;
            font-size: 0.9rem;
        }
        
        .toggle-option.active {
            background: #6366f1;
            color: #ffffff;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        
        .toggle-option:not(.active) {
            color: #64748b;
        }
        
        .plans-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 32px;
            margin-bottom: 100px;
            max-width: 1000px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .plan-card {
            background: #ffffff;
            border-radius: 12px;
            padding: 40px 32px;
            border: 1px solid #e2e8f0;
            transition: all 0.3s ease;
            position: relative;
            width: 100%;
            max-width: 320px;
            min-height: 480px;
            display: flex;
            flex-direction: column;
            margin: 0 auto;
        }
        
        .plan-card:hover {
            border-color: #6366f1;
            box-shadow: 0 8px 32px rgba(99, 102, 241, 0.12);
            transform: translateY(-2px);
        }
        
        .plan-card.popular {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            border: 2px solid #6366f1;
            transform: none;
            min-height: 480px;
            color: white;
        }
        
        .plan-card.popular .plan-name,
        .plan-card.popular .plan-description,
        .plan-card.popular .plan-price,
        .plan-card.popular .plan-billing,
        .plan-card.popular .plan-features li {
            color: #ffffff;
        }
        
        .plan-icon {
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 24px;
            color: #ffffff;
            font-weight: 500;
            font-size: 1rem;
        }
        
        .plan-card.popular .plan-icon {
            background: rgba(255, 255, 255, 0.2);
            color: #ffffff;
        }
        
        .plan-name {
            font-size: 1.25rem;
            font-weight: 500;
            color: #1a1a1a;
            margin-bottom: 12px;
            font-family: 'Poppins', sans-serif;
        }
        
        .plan-description {
            color: #666666;
            margin-bottom: 32px;
            font-size: 0.9rem;
            font-family: 'Poppins', sans-serif;
            font-weight: 400;
            line-height: 1.5;
        }
        
        .plan-price {
            font-size: 2.5rem;
            font-weight: 300;
            color: #1a1a1a;
            margin-bottom: 8px;
            line-height: 1;
            font-family: 'Poppins', sans-serif;
        }
        
        .plan-billing {
            color: #888888;
            margin-bottom: 40px;
            font-size: 0.85rem;
            font-family: 'Poppins', sans-serif;
            font-weight: 400;
        }
        
        .plan-features {
            list-style: none;
            margin-bottom: 32px;
            flex-grow: 1;
            min-height: 0;
        }
        
        .plan-features li {
            padding: 6px 0;
            color: #666666;
            position: relative;
            padding-left: 20px;
            font-size: 0.85rem;
            font-family: 'Poppins', sans-serif;
            font-weight: 400;
        }
        
        .plan-features li::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #10b981;
            font-weight: bold;
            font-size: 0.9rem;
        }
        
        .plan-card.popular .plan-features li::before {
            color: #ffffff;
        }
        
        .select-btn {
            width: 100%;
            padding: 16px 24px;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: none;
            margin-top: auto;
            font-family: 'Poppins', sans-serif;
        }
        
        .select-btn:hover {
            background: linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%);
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
        }
        
        .select-btn:disabled {
            background: #f0f0f0;
            color: #cccccc;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        
        .plan-card.popular .select-btn {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .plan-card.popular .select-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            border-color: rgba(255, 255, 255, 0.5);
        }
        
        .current-plan {
            background: #f0fdf4;
            border: 2px solid #10b981;
        }
        
        .current-plan .select-btn {
            background: #10b981;
        }
        
        .current-plan .select-btn:hover {
            background: #059669;
        }
        
        .error-dialog {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.4);
            z-index: 1000;
        }
        
        .error-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 48px 40px;
            border-radius: 12px;
            text-align: center;
            max-width: 400px;
            width: 90%;
            border: 1px solid #f0f0f0;
            box-shadow: 0 16px 48px rgba(0, 0, 0, 0.1);
        }
        
        .error-content h2 {
            color: #1a1a1a;
            margin-bottom: 16px;
            font-size: 1.25rem;
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
        }
        
        .error-content p {
            color: #666666;
            margin-bottom: 32px;
            line-height: 1.6;
            font-family: 'Poppins', sans-serif;
            font-weight: 400;
            font-size: 0.9rem;
        }
        
        .error-btn {
            padding: 12px 32px;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 500;
            transition: all 0.3s ease;
            font-family: 'Poppins', sans-serif;
        }
        
        .error-btn:hover {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }
        
        .success-dialog {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.4);
            z-index: 1000;
        }
        
        .success-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 48px 40px;
            border-radius: 12px;
            text-align: center;
            max-width: 400px;
            width: 90%;
            border: 1px solid #f0f0f0;
            box-shadow: 0 16px 48px rgba(0, 0, 0, 0.1);
        }
        
        .success-content h2 {
            color: #1a1a1a;
            margin-bottom: 16px;
            font-size: 1.25rem;
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
        }
        
        .success-content p {
            color: #666666;
            margin-bottom: 32px;
            line-height: 1.6;
            font-family: 'Poppins', sans-serif;
            font-weight: 400;
            font-size: 0.9rem;
        }
        
        .success-btn {
            padding: 12px 32px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 500;
            transition: all 0.3s ease;
            font-family: 'Poppins', sans-serif;
        }
        
        .success-btn:hover {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        
        .loading {
            display: none;
            text-align: center;
            color: #666666;
            margin-top: 40px;
        }
        
        .spinner {
            border: 3px solid rgba(99, 102, 241, 0.2);
            border-top: 3px solid #6366f1;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .features-section {
            text-align: center;
            padding: 100px 0;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            margin: 0 -20px;
            border-top: 1px solid #e2e8f0;
        }
        
        .features-section .subtitle {
            font-size: 0.75rem;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #6366f1;
            margin-bottom: 24px;
            font-family: 'Poppins', sans-serif;
        }
        
        .features-section h2 {
            font-size: 2rem;
            font-weight: 300;
            color: #1a1a1a;
            margin-bottom: 80px;
            line-height: 1.3;
            font-family: 'Poppins', sans-serif;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 48px;
            max-width: 900px;
            margin: 0 auto;
        }
        
        .feature-card {
            text-align: center;
            padding: 0;
        }
        
        .feature-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
            color: #ffffff;
            font-size: 1.25rem;
        }
        
        .feature-title {
            font-size: 1.125rem;
            font-weight: 500;
            color: #1a1a1a;
            margin-bottom: 16px;
            font-family: 'Poppins', sans-serif;
        }
        
        .feature-description {
            color: #666666;
            line-height: 1.6;
            font-family: 'Poppins', sans-serif;
            font-weight: 400;
        }
        
        @media (max-width: 768px) {
            .header h1 {
                font-size: 2.25rem;
            }
            
            .plans-grid {
                grid-template-columns: 1fr;
                gap: 20px;
                max-width: 400px;
            }
            
            .plan-card {
                padding: 24px;
                max-width: 100%;
                height: 480px;
            }
            
            .features-section h2 {
                font-size: 2rem;
            }
            
            .features-grid {
                grid-template-columns: 1fr;
                gap: 32px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="subtitle">COACHING PLATFORM</div>
            <h1>Select The Best Plan For Your Needs</h1>
            
            <div class="billing-toggle">
                <div class="toggle-container">
                    <div class="toggle-option active" onclick="toggleBilling('monthly')">Monthly Plan</div>
                    <div class="toggle-option" onclick="toggleBilling('yearly')">Yearly Plan</div>
                </div>
            </div>
        </div>
        
        <div class="plans-grid" id="plansGrid">
            ${plans.map(plan => this.renderPlanCard(plan, hasActiveSubscription, hasValidToken)).join('')}
        </div>
        
        <div class="loading" id="loading">
            <div class="spinner"></div>
            <p style="font-family: 'Poppins', sans-serif; font-weight: 500;">Processing your request...</p>
        </div>
    </div>
    
    <div class="features-section">
        <div class="container">
            <div class="subtitle">SCALE YOUR BUSINESS</div>
            <h2>A Platform That Is Designed For Your Business Growth</h2>
            
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">📊</div>
                    <div class="feature-title">Advanced Analytics</div>
                    <div class="feature-description">Track your coaching performance with detailed analytics and insights to optimize your business growth.</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🔧</div>
                    <div class="feature-title">Powerful Tools</div>
                    <div class="feature-description">Access a comprehensive suite of tools designed specifically for coaches to manage clients and grow their practice.</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">👥</div>
                    <div class="feature-title">Dedicated Support</div>
                    <div class="feature-description">Get priority support from our team of experts who understand the unique needs of coaching businesses.</div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="error-dialog" id="errorDialog">
        <div class="error-content">
            <h2>Payment Failed</h2>
            <p class="error-message">Your payment could not be processed. Please try again or contact support.</p>
            <button class="error-btn" onclick="closeErrorDialog()">OK</button>
        </div>
    </div>
    
    <div class="success-dialog" id="successDialog">
        <div class="success-content">
            <h2>Payment Successful!</h2>
            <p class="success-message">Your payment has been processed successfully. Redirecting to dashboard...</p>
            <button class="success-btn" onclick="closeSuccessDialog()">OK</button>
        </div>
    </div>
    
    <script>
        const token = '${token || ''}';
        const coachId = '${coach ? coach._id : ''}';
        const hasValidToken = ${hasValidToken};
        
        function selectPlan(planId, planPrice, planName) {
            if (!hasValidToken) {
                alert('Please log in to select a plan. You need a valid authentication token to proceed with the subscription.');
                return;
            }
            
            if (${hasActiveSubscription}) {
                alert('You already have an active subscription. Please contact support to change your plan.');
                return;
            }
            
            document.getElementById('loading').style.display = 'block';
            
            // Create Razorpay order
            fetch('/api/subscriptions/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    planId: planId,
                    amount: planPrice * 100 // Convert to paise
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Payment order response:', data); // Debug log
                if (data.success && data.data && data.data.paymentOrder) {
                    const paymentOrder = data.data.paymentOrder;
                    const razorpayKey = '${process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890'}';
                    
                    if (!razorpayKey || razorpayKey === 'rzp_test_1234567890') {
                        throw new Error('Razorpay key not configured. Please contact support.');
                    }
                    
                    const options = {
                        key: razorpayKey,
                        amount: paymentOrder.amount,
                        currency: paymentOrder.currency,
                        name: 'FunnelsEye',
                        description: planName,
                        order_id: paymentOrder.orderId,
                        handler: function (response) {
                            verifyPayment(response, planId);
                        },
                        prefill: {
                            name: '${coach ? coach.name || '' : ''}',
                            email: '${coach ? coach.email || '' : ''}',
                        },
                        theme: {
                            color: '#940612'
                        }
                    };
                    
                    const rzp = new Razorpay(options);
                    rzp.open();
                } else {
                    console.error('Failed to create payment order:', data);
                    throw new Error(data.message || 'Failed to create payment order');
                }
            })
            .catch(error => {
                console.error('Error creating payment order:', error);
                showErrorDialog(error.message || 'Failed to create payment order. Please try again.');
            })
            .finally(() => {
                document.getElementById('loading').style.display = 'none';
            });
        }
        
        function verifyPayment(paymentResponse, planId) {
            document.getElementById('loading').style.display = 'block';
            
            fetch('/api/subscriptions/verify-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    razorpay_payment_id: paymentResponse.razorpay_payment_id,
                    razorpay_order_id: paymentResponse.razorpay_order_id,
                    razorpay_signature: paymentResponse.razorpay_signature,
                    planId: planId
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Show success dialog
                    showSuccessDialog(data.message || 'Payment successful!');
                    // Redirect to dashboard after 3 seconds
                    setTimeout(() => {
                        window.location.href = 'https://dashboard.funnelseye.com';
                    }, 3000);
                } else {
                    throw new Error(data.message || 'Payment verification failed');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showErrorDialog(error.message || 'Payment verification failed. Please try again.');
            })
            .finally(() => {
                document.getElementById('loading').style.display = 'none';
            });
        }
        
        function showErrorDialog(message = 'An error occurred during payment. Please try again.') {
            const errorDialog = document.getElementById('errorDialog');
            const errorMessage = errorDialog.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.textContent = message;
            }
            errorDialog.style.display = 'block';
        }
        
        function showSuccessDialog(message = 'Payment successful!') {
            const successDialog = document.getElementById('successDialog');
            const successMessage = successDialog.querySelector('.success-message');
            if (successMessage) {
                successMessage.textContent = message;
            }
            successDialog.style.display = 'block';
        }
        
        function closeErrorDialog() {
            document.getElementById('errorDialog').style.display = 'none';
        }
        
        function closeSuccessDialog() {
            document.getElementById('successDialog').style.display = 'none';
        }
        
        // Close error dialog when clicking outside
        document.getElementById('errorDialog').addEventListener('click', function(e) {
            if (e.target === this) {
                closeErrorDialog();
            }
        });
        
        // Close success dialog when clicking outside
        document.getElementById('successDialog').addEventListener('click', function(e) {
            if (e.target === this) {
                closeSuccessDialog();
            }
        });
        
        function toggleBilling(period) {
            // Update toggle UI
            document.querySelectorAll('.toggle-option').forEach(option => {
                option.classList.remove('active');
            });
            event.target.classList.add('active');
            
            // Here you can add logic to recalculate prices based on billing period
            // For now, we'll just update the UI
            console.log('Billing period changed to:', period);
        }
    </script>
</body>
</html>
        `;
    }

    /**
     * Render individual plan card
     */
    renderPlanCard(plan, hasActiveSubscription, hasValidToken) {
        const isCurrentPlan = false; // You can add logic to check if this is the current plan
        const price = plan.price;
        const currency = plan.currency || 'INR';
        const billingCycle = plan.billingCycle || 'monthly';
        
        // Get first letter of plan name for icon
        const planIcon = plan.name.charAt(0).toUpperCase();
        
        return `
            <div class="plan-card ${plan.isPopular ? 'popular' : ''} ${isCurrentPlan ? 'current-plan' : ''}">
                <div class="plan-icon">${planIcon}</div>
                <div class="plan-name">${plan.name}</div>
                <div class="plan-description">${plan.description}</div>
                <div class="plan-price">${currency} ${price}</div>
                <div class="plan-billing">per ${billingCycle}</div>
                
                <ul class="plan-features">
                    <li>${plan.features.maxFunnels || 0} Funnels</li>
                    <li>${plan.features.maxStaff || 0} Staff Members</li>
                    <li>${plan.features.maxDevices || 0} Devices</li>
                    <li>${plan.features.storageGB || 0} GB Storage</li>
                    ${plan.features.aiFeatures ? '<li>AI Features</li>' : ''}
                    ${plan.features.advancedAnalytics ? '<li>Advanced Analytics</li>' : ''}
                    ${plan.features.prioritySupport ? '<li>Priority Support</li>' : ''}
                    ${plan.features.customDomain ? '<li>Custom Domain</li>' : ''}
                    ${plan.features.apiAccess ? '<li>API Access</li>' : ''}
                    ${plan.features.whiteLabel ? '<li>White Label</li>' : ''}
                </ul>
                
                <button class="select-btn" 
                        onclick="selectPlan('${plan._id}', ${price}, '${plan.name}')"
                        ${hasActiveSubscription ? 'disabled' : ''}>
                    ${hasActiveSubscription ? 'Already Subscribed' : 'Start Free Trial'}
                </button>
            </div>
        `;
    }
    
    /**
     * Get coach's current subscription
     * GET /api/subscriptions/current
     */
    async getCurrentSubscription(req, res) {
        try {
            const coachId = req.user._id;
            
            logger.info(`[SubscriptionController] Getting current subscription for coach: ${coachId}`);
            
            const subscription = await CoachSubscription.findOne({ 
                coachId, 
                status: { $in: ['active', 'trial'] }
            }).populate('planId');
            
            if (!subscription) {
                return res.json({
                    success: true,
                    data: null,
                    message: 'No active subscription found'
                });
            }
            
            // Get actual usage statistics
            const [funnelCount, staffCount, automationRuleCount, leadCount] = await Promise.all([
                Funnel.countDocuments({ coachId }),
                Staff.countDocuments({ coachId, isActive: true }),
                AutomationRule.countDocuments({ coachId }),
                Lead.countDocuments({ coachId })
            ]);
            
            // Add usage statistics to subscription data
            const subscriptionData = subscription.toObject();
            subscriptionData.usage = {
                funnels: funnelCount,
                staff: staffCount,
                automationRules: automationRuleCount,
                leads: leadCount
            };
            
            res.json({
                success: true,
                data: subscriptionData
            });
            
        } catch (error) {
            logger.error('[SubscriptionController] Error getting current subscription:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting current subscription',
                error: error.message
            });
        }
    }
    
    /**
     * Create subscription order
     * POST /api/subscriptions/create-order
     */
    async createOrder(req, res) {
        try {
            const { planId, paymentMethod = 'razorpay' } = req.body;
            const coachId = req.user._id;
            
            logger.info(`[SubscriptionController] Creating payment order for plan: ${planId}`);
            
            // Clean up any incomplete subscriptions for this coach
            await CoachSubscription.deleteMany({
                coachId: coachId,
                status: 'pending'
            });
            
            // Validate plan exists and is active
            const plan = await SubscriptionPlan.findOne({ 
                _id: planId, 
                isActive: true 
            });
            
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Subscription plan not found or not available'
                });
            }
            
            // Check if coach already has an active subscription
            const existingSubscription = await CoachSubscription.findOne({
                coachId,
                status: { $in: ['active', 'trial'] }
            });
            
            if (existingSubscription) {
                return res.status(400).json({
                    success: false,
                    message: 'You already have an active subscription. Please cancel it before subscribing to a new plan.'
                });
            }
            
            // Create payment order (without creating subscription yet)
            const paymentOrder = await this.createPaymentOrder(plan, coachId);
            
            res.json({
                success: true,
                message: 'Payment order created successfully',
                data: {
                    plan: plan,
                    paymentOrder: {
                        ...paymentOrder,
                        key: process.env.RAZORPAY_KEY_ID // Include Razorpay key for frontend
                    }
                }
            });
            
        } catch (error) {
            logger.error('[SubscriptionController] Error creating subscription order:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating subscription order',
                error: error.message
            });
        }
    }
    
    /**
     * Create Razorpay payment order for subscription
     */
    async createPaymentOrder(plan, coachId) {
        try {
            const Razorpay = require('razorpay');
            const razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET
            });
            
            // Create a short receipt (max 40 characters for Razorpay)
            const receipt = `sub_${Date.now()}`.substring(0, 40);
            
            const orderOptions = {
                amount: (plan.price + plan.setupFee) * 100, // Convert to paise
                currency: plan.currency,
                receipt: receipt,
                notes: {
                    plan_id: plan._id.toString(),
                    coach_id: coachId.toString(),
                    billing_cycle: plan.billingCycle
                }
            };
            
            const razorpayOrder = await razorpay.orders.create(orderOptions);
            
            return {
                orderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                receipt: razorpayOrder.receipt
            };
            
        } catch (error) {
            logger.error('[SubscriptionController] Error creating payment order:', error);
            throw error;
        }
    }
    
    /**
     * Verify subscription payment
     * POST /api/subscriptions/verify-payment
     */
    async verifyPayment(req, res) {
        try {
            const { 
                razorpay_order_id, 
                razorpay_payment_id, 
                razorpay_signature,
                planId 
            } = req.body;
            
            const coachId = req.user._id;
            
            logger.info(`[SubscriptionController] Verifying payment for coach: ${coachId}, plan: ${planId}`);
            
            // Verify Razorpay signature
            const crypto = require('crypto');
            const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
            hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
            const generatedSignature = hmac.digest('hex');
            
            if (generatedSignature !== razorpay_signature) {
                logger.error(`[SubscriptionController] Invalid payment signature for payment: ${razorpay_payment_id}`);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid payment signature'
                });
            }
            
            // Verify payment with Razorpay API
            const Razorpay = require('razorpay');
            const razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET
            });
            
            try {
                const payment = await razorpay.payments.fetch(razorpay_payment_id);
                
                if (payment.status !== 'captured') {
                    logger.error(`[SubscriptionController] Payment not captured. Status: ${payment.status}`);
                    return res.status(400).json({
                        success: false,
                        message: 'Payment not completed successfully'
                    });
                }
            } catch (error) {
                logger.error(`[SubscriptionController] Error verifying payment with Razorpay: ${error.message}`);
                return res.status(400).json({
                    success: false,
                    message: 'Unable to verify payment status'
                });
            }
            
            // Get the plan details
            const plan = await SubscriptionPlan.findById(planId);
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Subscription plan not found'
                });
            }
            
            // Check if coach already has an active subscription
            const existingSubscription = await CoachSubscription.findOne({
                coachId: coachId,
                status: { $in: ['active', 'trial'] }
            });
            
            if (existingSubscription) {
                return res.status(400).json({
                    success: false,
                    message: 'You already have an active subscription'
                });
            }
            
            // Check if this payment has already been processed
            const existingPayment = await CoachSubscription.findOne({
                'paymentHistory.razorpayPaymentId': razorpay_payment_id
            });
            
            if (existingPayment) {
                return res.status(400).json({
                    success: false,
                    message: 'This payment has already been processed'
                });
            }
            
            // Create new subscription
            const subscription = new CoachSubscription({
                coachId: coachId,
                planId: planId,
                status: 'active',
                startDate: new Date(),
                endDate: new Date(Date.now() + (plan.duration * 30 * 24 * 60 * 60 * 1000)), // Convert months to milliseconds
                paymentMethod: 'razorpay',
                paymentHistory: [{
                    paymentId: razorpay_payment_id,
                    amount: plan.price,
                    currency: plan.currency,
                    paymentMethod: 'razorpay',
                    paymentDate: new Date(),
                    status: 'success',
                    razorpayOrderId: razorpay_order_id,
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature
                }]
            });
            
            await subscription.save();
            
            // Update coach's subscription status
            await User.findByIdAndUpdate(coachId, {
                hasActiveSubscription: true,
                subscriptionId: subscription._id
            });
            
            // Create RazorpayPayment record for admin earnings tracking
            const RazorpayPayment = require('../schema/RazorpayPayment');
            const razorpayPayment = new RazorpayPayment({
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                amount: plan.price,
                currency: plan.currency || 'INR',
                status: 'captured',
                businessType: 'platform_subscription',
                userId: coachId,
                userType: 'coach',
                coachId: coachId,
                productType: 'subscription',
                productName: `${plan.name} Subscription`,
                productDescription: `Subscription payment for ${plan.name}`,
                paymentMethod: 'other', // Razorpay is the gateway, not the payment method
                razorpayResponse: {
                    order_id: razorpay_order_id,
                    payment_id: razorpay_payment_id,
                    signature: razorpay_signature
                },
                // For subscription payments, the full amount goes to platform (no coach commission)
                coachCommission: 0,
                platformFee: plan.price,
                netAmount: plan.price
            });
            
            await razorpayPayment.save();
            
            logger.info(`[SubscriptionController] Payment verified, subscription created, and RazorpayPayment record created for coach: ${coachId}`);
            
            res.json({
                success: true,
                message: 'Payment verified successfully',
                data: {
                    subscription: subscription,
                    plan: plan
                }
            });
            
        } catch (error) {
            logger.error('[SubscriptionController] Error verifying payment:', error);
            res.status(500).json({
                success: false,
                message: 'Error verifying payment',
                error: error.message
            });
        }
    }
    
    /**
     * Cancel subscription
     * POST /api/subscriptions/cancel
     */
    async cancelSubscription(req, res) {
        try {
            const { reason } = req.body;
            const coachId = req.user._id;
            
            logger.info(`[SubscriptionController] Cancelling subscription for coach: ${coachId}`);
            
            const subscription = await CoachSubscription.findOne({
                coachId,
                status: { $in: ['active', 'trial'] }
            });
            
            if (!subscription) {
                return res.status(404).json({
                    success: false,
                    message: 'No active subscription found'
                });
            }
            
            subscription.status = 'cancelled';
            subscription.cancellationDate = new Date();
            subscription.cancellationReason = reason;
            subscription.autoRenew = false;
            
            await subscription.save();
            
            res.json({
                success: true,
                message: 'Subscription cancelled successfully',
                data: subscription
            });
            
        } catch (error) {
            logger.error('[SubscriptionController] Error cancelling subscription:', error);
            res.status(500).json({
                success: false,
                message: 'Error cancelling subscription',
                error: error.message
            });
        }
    }
    
    /**
     * Get subscription history
     * GET /api/subscriptions/history
     */
    async getSubscriptionHistory(req, res) {
        try {
            const coachId = req.user._id;
            const { page = 1, limit = 10 } = req.query;
            
            logger.info(`[SubscriptionController] Getting subscription history for coach: ${coachId}`);
            
            const skip = (page - 1) * limit;
            const subscriptions = await CoachSubscription.find({ coachId })
                .populate('planId', 'name price currency billingCycle')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));
            
            const total = await CoachSubscription.countDocuments({ coachId });
            
            res.json({
                success: true,
                data: subscriptions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalSubscriptions: total,
                    hasNextPage: skip + subscriptions.length < total,
                    hasPrevPage: page > 1
                }
            });
            
        } catch (error) {
            logger.error('[SubscriptionController] Error getting subscription history:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting subscription history',
                error: error.message
            });
        }
    }
}

// Create controller instance and bind all methods
const controller = new SubscriptionController();

module.exports = {
    getPlans: controller.getPlans.bind(controller),
    getSelectPlanPage: controller.getSelectPlanPage.bind(controller),
    getCurrentSubscription: controller.getCurrentSubscription.bind(controller),
    createOrder: controller.createOrder.bind(controller),
    verifyPayment: controller.verifyPayment.bind(controller),
    cancelSubscription: controller.cancelSubscription.bind(controller),
    getSubscriptionHistory: controller.getSubscriptionHistory.bind(controller)
};