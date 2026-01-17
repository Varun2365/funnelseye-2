const mongoose = require('mongoose');
const CoachSellablePlan = require('../schema/CoachSellablePlan');
const AdminProduct = require('../schema/AdminProduct');
const User = require('../schema/User');
const logger = require('../utils/logger');

class CoachSellablePlanController {
    
    /**
     * Create a new coach sellable plan
     * POST /api/paymentsv1/coach/plans
     */
    async createPlan(req, res) {
        try {
            logger.info('[CoachSellablePlanController] Creating new coach sellable plan');
            
            const planData = req.body;
            planData.coachId = req.user._id;
            
            // Validate admin product exists and is available
            const adminProduct = await AdminProduct.findOne({ 
                _id: planData.adminProductId,
                status: 'active',
                isAvailableForCoaches: true
            });
            
            if (!adminProduct) {
                return res.status(404).json({
                    success: false,
                    message: 'Admin product not found or not available for coaches'
                });
            }
            
            // Set the actual MongoDB ObjectId for the admin product
            planData.adminProductId = adminProduct._id;
            
            // Validate pricing rules
            if (adminProduct.pricingRules.allowCustomPricing) {
                if (adminProduct.pricingRules.minPrice && planData.price < adminProduct.pricingRules.minPrice) {
                    return res.status(400).json({
                        success: false,
                        message: `Price must be at least ${adminProduct.pricingRules.minPrice} ${adminProduct.currency}`
                    });
                }
                if (adminProduct.pricingRules.maxPrice && planData.price > adminProduct.pricingRules.maxPrice) {
                    return res.status(400).json({
                        success: false,
                        message: `Price must not exceed ${adminProduct.pricingRules.maxPrice} ${adminProduct.currency}`
                    });
                }
            } else {
                planData.price = adminProduct.basePrice;
            }
            
            // Set currency from admin product
            planData.currency = adminProduct.currency;
            
            const plan = new CoachSellablePlan(planData);
            await plan.save();
            
            logger.info(`[CoachSellablePlanController] Coach sellable plan created: ${plan._id}`);
            
            // Auto-generate store page
            const storeUrl = await this.generateStorePage(plan);
            
            res.status(201).json({
                success: true,
                message: 'Coach sellable plan created successfully',
                data: {
                    ...plan.toObject(),
                    storeUrl: storeUrl
                }
            });
            
        } catch (error) {
            logger.error('[CoachSellablePlanController] Error creating coach sellable plan:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating coach sellable plan',
                error: error.message
            });
        }
    }
    
    /**
     * Get coach's sellable plans
     * GET /api/paymentsv1/coach/plans
     */
    async getCoachPlans(req, res) {
        try {
            const { page = 1, limit = 20, status, search } = req.query;
            const coachId = req.user._id;
            
            logger.info(`[CoachSellablePlanController] Getting coach plans for: ${coachId}`);
            
            // Build query
            const query = { coachId };
            if (status) query.status = status;
            if (search) {
                query.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }
            
            // Execute query with pagination
            const skip = (page - 1) * limit;
            const plans = await CoachSellablePlan.find(query)
                .populate('adminProductId', 'name description category productType basePrice coverImage')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));
            
            const total = await CoachSellablePlan.countDocuments(query);
            
            res.json({
                success: true,
                data: plans,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalPlans: total,
                    hasNextPage: skip + plans.length < total,
                    hasPrevPage: page > 1
                }
            });
            
        } catch (error) {
            logger.error('[CoachSellablePlanController] Error getting coach plans:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting coach plans',
                error: error.message
            });
        }
    }
    
    /**
     * Get plan by ID
     * GET /api/paymentsv1/coach/plans/:planId
     */
    async getPlanById(req, res) {
        try {
            const { planId } = req.params;
            const coachId = req.user._id;
            
            logger.info(`[CoachSellablePlanController] Getting plan: ${planId}`);
            
            // Validate planId
            if (!planId || planId === 'null' || planId === 'undefined') {
                return res.status(400).json({
                    success: false,
                    message: 'Valid plan ID is required'
                });
            }
            
            // Validate MongoDB ObjectId format
            if (!mongoose.Types.ObjectId.isValid(planId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid plan ID format'
                });
            }
            
            const plan = await CoachSellablePlan.findOne({ _id: planId, coachId })
                .populate('adminProductId', 'name description category productType basePrice pricingRules features coverImage');
            
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Plan not found'
                });
            }
            
            res.json({
                success: true,
                data: plan
            });
            
        } catch (error) {
            logger.error('[CoachSellablePlanController] Error getting plan:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting plan',
                error: error.message
            });
        }
    }
    
    /**
     * Update plan
     * PUT /api/paymentsv1/coach/plans/:planId
     */
    async updatePlan(req, res) {
        try {
            const { planId } = req.params;
            const coachId = req.user._id;
            const updateData = req.body;
            
            logger.info(`[CoachSellablePlanController] Updating plan: ${planId}`);
            
            // Validate planId
            if (!planId || planId === 'null' || planId === 'undefined') {
                return res.status(400).json({
                    success: false,
                    message: 'Valid plan ID is required'
                });
            }
            
            // Validate MongoDB ObjectId format
            if (!mongoose.Types.ObjectId.isValid(planId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid plan ID format'
                });
            }
            
            // If updating price, validate against admin product pricing rules
            if (updateData.price) {
                const plan = await CoachSellablePlan.findOne({ _id: planId, coachId }).populate('adminProductId');
                if (plan && plan.adminProductId) {
                    const adminProduct = plan.adminProductId;
                    if (adminProduct.pricingRules.allowCustomPricing) {
                        if (adminProduct.pricingRules.minPrice && updateData.price < adminProduct.pricingRules.minPrice) {
                            return res.status(400).json({
                                success: false,
                                message: `Price must be at least ${adminProduct.pricingRules.minPrice} ${adminProduct.currency}`
                            });
                        }
                        if (adminProduct.pricingRules.maxPrice && updateData.price > adminProduct.pricingRules.maxPrice) {
                            return res.status(400).json({
                                success: false,
                                message: `Price must not exceed ${adminProduct.pricingRules.maxPrice} ${adminProduct.currency}`
                            });
                        }
                    } else {
                        updateData.price = adminProduct.basePrice;
                    }
                }
            }
            
            const plan = await CoachSellablePlan.findOneAndUpdate(
                { _id: planId, coachId },
                updateData,
                { new: true, runValidators: true }
            );
            
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Plan not found'
                });
            }
            
            logger.info(`[CoachSellablePlanController] Plan updated: ${planId}`);
            
            res.json({
                success: true,
                message: 'Plan updated successfully',
                data: plan
            });
            
        } catch (error) {
            logger.error('[CoachSellablePlanController] Error updating plan:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating plan',
                error: error.message
            });
        }
    }
    
    /**
     * Delete plan
     * DELETE /api/paymentsv1/coach/plans/:planId
     */
    async deletePlan(req, res) {
        try {
            const { planId } = req.params;
            const coachId = req.user._id;
            
            logger.info(`[CoachSellablePlanController] Deleting plan: ${planId}`);
            
            // Validate planId
            if (!planId || planId === 'null' || planId === 'undefined') {
                return res.status(400).json({
                    success: false,
                    message: 'Valid plan ID is required'
                });
            }
            
            // Validate MongoDB ObjectId format
            if (!mongoose.Types.ObjectId.isValid(planId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid plan ID format'
                });
            }
            
            const plan = await CoachSellablePlan.findOneAndDelete({ _id: planId, coachId });
            
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Plan not found'
                });
            }
            
            logger.info(`[CoachSellablePlanController] Plan deleted: ${planId}`);
            
            res.json({
                success: true,
                message: 'Plan deleted successfully'
            });
            
        } catch (error) {
            logger.error('[CoachSellablePlanController] Error deleting plan:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting plan',
                error: error.message
            });
        }
    }
    
    /**
     * Update plan status
     * PUT /api/paymentsv1/coach/plans/:planId/status
     */
    async updatePlanStatus(req, res) {
        try {
            const { planId } = req.params;
            const coachId = req.user._id;
            const { status } = req.body;
            
            logger.info(`[CoachSellablePlanController] Updating plan status: ${planId} to ${status}`);
            
            // Validate planId
            if (!planId || planId === 'null' || planId === 'undefined') {
                return res.status(400).json({
                    success: false,
                    message: 'Valid plan ID is required'
                });
            }
            
            // Validate MongoDB ObjectId format
            if (!mongoose.Types.ObjectId.isValid(planId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid plan ID format'
                });
            }
            
            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: 'Status is required'
                });
            }
            
            const plan = await CoachSellablePlan.findOneAndUpdate(
                { _id: planId, coachId },
                { 
                    status,
                    ...(status === 'active' && { publishedAt: new Date() })
                },
                { new: true }
            );
            
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Plan not found'
                });
            }
            
            logger.info(`[CoachSellablePlanController] Plan status updated: ${planId}`);
            
            res.json({
                success: true,
                message: 'Plan status updated successfully',
                data: plan
            });
            
        } catch (error) {
            logger.error('[CoachSellablePlanController] Error updating plan status:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating plan status',
                error: error.message
            });
        }
    }
    
    /**
     * Get public plans (for customers to view)
     * GET /api/paymentsv1/public/plans
     */
    async getPublicPlans(req, res) {
        try {
            const { page = 1, limit = 20, category, coachId, search, minPrice, maxPrice } = req.query;
            
            logger.info('[CoachSellablePlanController] Getting public plans');
            
            // Build query for public plans
            const query = {
                status: 'active',
                isPublic: true
            };
            
            if (category) query.category = category;
            if (coachId) query.coachId = coachId;
            if (search) {
                query.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }
            if (minPrice || maxPrice) {
                query.price = {};
                if (minPrice) query.price.$gte = parseFloat(minPrice);
                if (maxPrice) query.price.$lte = parseFloat(maxPrice);
            }
            
            // Execute query with pagination
            const skip = (page - 1) * limit;
            const plans = await CoachSellablePlan.find(query)
                .populate('coachId', 'name email profilePicture')
                .populate('adminProductId', 'name description category productType basePrice coverImage')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));
            
            const total = await CoachSellablePlan.countDocuments(query);
            
            res.json({
                success: true,
                data: plans,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalPlans: total,
                    hasNextPage: skip + plans.length < total,
                    hasPrevPage: page > 1
                }
            });
            
        } catch (error) {
            logger.error('[CoachSellablePlanController] Error getting public plans:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting public plans',
                error: error.message
            });
        }
    }
    
    /**
     * Get plan details for purchase
     * GET /api/paymentsv1/public/plans/:planId/details
     */
    async getPlanForPurchase(req, res) {
        try {
            const { planId } = req.params;
            
            logger.info(`[CoachSellablePlanController] Getting plan for purchase: ${planId}`);
            
            // Validate planId
            if (!planId || planId === 'null' || planId === 'undefined') {
                return res.status(400).json({
                    success: false,
                    message: 'Valid plan ID is required'
                });
            }
            
            // Validate MongoDB ObjectId format
            if (!mongoose.Types.ObjectId.isValid(planId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid plan ID format'
                });
            }
            
            const plan = await CoachSellablePlan.findOne({ 
                _id: planId, 
                status: 'active', 
                isPublic: true 
            })
                .populate('coachId', 'name email profilePicture')
                .populate('adminProductId', 'name description category productType features coverImage');
            
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Plan not found or not available for purchase'
                });
            }
            
            // Increment view count
            await CoachSellablePlan.findByIdAndUpdate(plan._id, { $inc: { viewCount: 1 } });
            
            res.json({
                success: true,
                data: plan
            });
            
        } catch (error) {
            logger.error('[CoachSellablePlanController] Error getting plan for purchase:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting plan for purchase',
                error: error.message
            });
        }
    }
    
    /**
     * Get coach's plan statistics
     * GET /api/paymentsv1/coach/plans/stats
     */
    async getCoachPlanStats(req, res) {
        try {
            const coachId = req.user._id;
            
            logger.info(`[CoachSellablePlanController] Getting coach plan stats: ${coachId}`);
            
            const plans = await CoachSellablePlan.find({ coachId });
            
            const stats = {
                totalPlans: plans.length,
                activePlans: plans.filter(plan => plan.status === 'active').length,
                publicPlans: plans.filter(plan => plan.isPublic).length,
                totalSales: plans.reduce((sum, plan) => sum + plan.totalSales, 0),
                totalRevenue: plans.reduce((sum, plan) => sum + plan.totalRevenue, 0),
                totalViews: plans.reduce((sum, plan) => sum + plan.viewCount, 0),
                totalCommissionEarned: plans.reduce((sum, plan) => sum + plan.commissionEarned, 0),
                totalPlatformCommissionPaid: plans.reduce((sum, plan) => sum + plan.platformCommissionPaid, 0)
            };
            
            res.json({
                success: true,
                data: stats
            });
            
        } catch (error) {
            logger.error('[CoachSellablePlanController] Error getting coach plan stats:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting coach plan statistics',
                error: error.message
            });
        }
    }
    
    /**
     * Generate store page for a plan
     */
    async generateStorePage(plan) {
        try {
            const fs = require('fs');
            const path = require('path');
            
            // Populate the plan with coach and admin product details
            const populatedPlan = await CoachSellablePlan.findById(plan._id)
                .populate('coachId', 'name email profilePicture')
                .populate('adminProductId', 'name description category productType features coverImage');
            
            if (!populatedPlan) {
                throw new Error('Plan not found');
            }
            
            // Create store directory if it doesn't exist
            const storeDir = path.join(__dirname, '..', 'public', 'store');
            if (!fs.existsSync(storeDir)) {
                fs.mkdirSync(storeDir, { recursive: true });
            }
            
            // Read the template
            const templatePath = path.join(__dirname, '..', 'public', 'store-template.html');
            let template = fs.readFileSync(templatePath, 'utf8');
            
            // Replace template variables
            const coachName = populatedPlan.coachId.name || 'Coach';
            const coachInitial = coachName.charAt(0).toUpperCase();
            const coachTitle = 'Certified Expert';
            
            template = template
                .replace(/{{PLAN_ID}}/g, populatedPlan._id.toString())
                .replace(/{{PLAN_NAME}}/g, populatedPlan.title || populatedPlan.adminProductId.name)
                .replace(/{{PLAN_DESCRIPTION}}/g, populatedPlan.description || populatedPlan.adminProductId.description)
                .replace(/{{PRICE}}/g, populatedPlan.customizations.price || populatedPlan.adminProductId.basePrice)
                .replace(/{{CURRENCY}}/g, populatedPlan.customizations.currency || '₹')
                .replace(/{{COACH_NAME}}/g, coachName)
                .replace(/{{COACH_TITLE}}/g, coachTitle)
                .replace(/{{COACH_INITIAL}}/g, coachInitial)
                .replace(/{{FEATURES}}/g, JSON.stringify(populatedPlan.customizations.features || populatedPlan.adminProductId.features || []));
            
            // Write the store page to file
            const storeFilePath = path.join(storeDir, `${populatedPlan._id}.html`);
            fs.writeFileSync(storeFilePath, template);
            
            // Generate store URL
            const baseUrl = process.env.FRONTEND_URL || process.env.BASE_URL || 'http://localhost:3000';
            const storeUrl = `${baseUrl}/store/${populatedPlan._id}`;
            
            logger.info(`[CoachSellablePlanController] Store page created: ${storeFilePath}`);
            
            return storeUrl;
            
        } catch (error) {
            logger.error('[CoachSellablePlanController] Error generating store page:', error);
            // Return a fallback URL even if store page generation fails
            const baseUrl = process.env.FRONTEND_URL || process.env.BASE_URL || 'http://localhost:3000';
            return `${baseUrl}/store/${plan._id}`;
        }
    }
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${populatedPlan.title} - FunnelsEye Store</title>
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
        }

        .logo {
            font-size: 2.5rem;
            font-weight: bold;
            color: white;
            margin-bottom: 10px;
        }

        .subtitle {
            color: rgba(255, 255, 255, 0.8);
            font-size: 1.2rem;
        }

        .store-card {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            margin-bottom: 30px;
        }

        .hero-section {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            padding: 60px 40px;
            text-align: center;
        }

        .plan-title {
            font-size: 3rem;
            font-weight: bold;
            margin-bottom: 20px;
        }

        .plan-description {
            font-size: 1.2rem;
            opacity: 0.9;
            margin-bottom: 30px;
            line-height: 1.6;
        }

        .price-section {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
            margin-bottom: 30px;
        }

        .price {
            font-size: 4rem;
            font-weight: bold;
        }

        .currency {
            font-size: 2rem;
            opacity: 0.8;
        }

        .buy-button {
            background: white;
            color: #4f46e5;
            border: none;
            padding: 20px 40px;
            font-size: 1.3rem;
            font-weight: bold;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .buy-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
        }

        .content-section {
            padding: 60px 40px;
        }

        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-bottom: 60px;
        }

        .feature-card {
            background: #f8fafc;
            border-radius: 15px;
            padding: 30px;
            border: 1px solid #e2e8f0;
            transition: all 0.3s ease;
        }

        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .feature-title {
            font-size: 1.3rem;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
        }

        .feature-description {
            color: #6b7280;
            line-height: 1.6;
        }

        .coach-section {
            background: #f8fafc;
            border-radius: 15px;
            padding: 40px;
            text-align: center;
            margin-bottom: 40px;
        }

        .coach-name {
            font-size: 1.5rem;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
        }

        .coach-title {
            color: #6b7280;
            font-size: 1.1rem;
        }

        .error {
            color: #dc2626;
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            display: none;
        }

        .success {
            color: #059669;
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            display: none;
        }

        .loading {
            display: none;
            color: #6b7280;
            text-align: center;
            margin: 20px 0;
        }

        @media (max-width: 768px) {
            .plan-title {
                font-size: 2rem;
            }
            
            .price {
                font-size: 3rem;
            }
            
            .content-section {
                padding: 40px 20px;
            }
            
            .features-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">FunnelsEye</div>
            <div class="subtitle">Premium Digital Products</div>
        </div>

        <div class="store-card">
            <div class="hero-section">
                <h1 class="plan-title">${populatedPlan.title}</h1>
                <p class="plan-description">${populatedPlan.description}</p>
                <div class="price-section">
                    <span class="currency">₹</span>
                    <span class="price">${populatedPlan.price.toLocaleString()}</span>
                </div>
                <button class="buy-button" onclick="initiatePayment()">
                    Buy Now
                </button>
            </div>

            <div class="content-section">
                <div class="features-grid">
                    ${populatedPlan.additionalFeatures.map(feature => `
                        <div class="feature-card">
                            <h3 class="feature-title">${feature.title}</h3>
                            <p class="feature-description">${feature.description}</p>
                        </div>
                    `).join('')}
                </div>

                <div class="coach-section">
                    <h3 class="coach-name">${populatedPlan.coachId.name}</h3>
                    <p class="coach-title">Certified Expert</p>
                </div>
            </div>
        </div>

        <div class="error" id="error-message"></div>
        <div class="success" id="success-message"></div>
        <div class="loading" id="loading">Processing your payment...</div>
    </div>

    <script>
        const planId = '${populatedPlan._id}';
        const planPrice = ${populatedPlan.price};
        const planCurrency = '${populatedPlan.currency}';

        function showError(message) {
            const errorDiv = document.getElementById('error-message');
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }

        function showSuccess(message) {
            const successDiv = document.getElementById('success-message');
            successDiv.textContent = message;
            successDiv.style.display = 'block';
        }

        function showLoading() {
            document.getElementById('loading').style.display = 'block';
        }

        function hideLoading() {
            document.getElementById('loading').style.display = 'none';
        }

        async function initiatePayment() {
            try {
                showLoading();
                console.log('Creating payment order...');
                
                // Create payment order
                const orderResponse = await fetch('/api/paymentsv1/payments/coach-plan/create-order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        planId: planId,
                        customerId: 'customer_' + Date.now(),
                        customerEmail: 'customer@example.com',
                        customerPhone: '+919876543210'
                    })
                });

                if (!orderResponse.ok) {
                    throw new Error('Failed to create order: ' + orderResponse.status);
                }

                const orderData = await orderResponse.json();
                console.log('Order created:', orderData);

                if (!orderData.success) {
                    throw new Error('Order creation failed: ' + orderData.message);
                }

                // Check if Razorpay is available
                if (typeof Razorpay === 'undefined') {
                    throw new Error('Razorpay SDK not loaded. Please refresh the page.');
                }

                // Razorpay configuration
                const options = {
                    key: 'rzp_test_REx4pinstkpCf5', // Replace with your actual Razorpay key
                    amount: orderData.data.amount,
                    currency: orderData.data.currency,
                    name: 'FunnelsEye',
                    description: '${populatedPlan.title}',
                    order_id: orderData.data.orderId,
                    handler: function (response) {
                        console.log('Payment successful:', response);
                        verifyPayment(response);
                    },
                    prefill: {
                        name: 'Customer Name',
                        email: 'customer@example.com',
                        contact: '+919876543210'
                    },
                    theme: {
                        color: '#4f46e5'
                    },
                    modal: {
                        ondismiss: function() {
                            hideLoading();
                        }
                    }
                };

                console.log('Opening Razorpay checkout...');
                const rzp = new Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    console.error('Payment failed:', response.error);
                    showError('Payment failed: ' + response.error.description);
                    hideLoading();
                });
                rzp.open();

            } catch (error) {
                console.error('Payment initiation failed:', error);
                showError('Payment failed: ' + error.message);
                hideLoading();
            }
        }

        async function verifyPayment(response) {
            try {
                console.log('Verifying payment:', response);

                const verifyResponse = await fetch('/api/paymentsv1/payments/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature
                    })
                });

                const result = await verifyResponse.json();
                console.log('Verification result:', result);

                if (result.success) {
                    showSuccess('Payment successful! You will receive access details via email.');
                    hideLoading();
                } else {
                    showError('Payment verification failed: ' + (result.message || 'Unknown error'));
                    hideLoading();
                }
            } catch (error) {
                console.error('Verification failed:', error);
                showError('Payment verification failed. Please contact support.');
                hideLoading();
            }
        }

        // Check if Razorpay is loaded
        window.addEventListener('load', function() {
            if (typeof Razorpay === 'undefined') {
                showError('Razorpay SDK failed to load. Please refresh the page.');
            } else {
                console.log('Razorpay SDK loaded successfully');
            }
        });
    </script>
</body>
</html>`;

            // Write the store page to file
            const storeFilePath = path.join(storeDir, `${populatedPlan._id}.html`);
            fs.writeFileSync(storeFilePath, storePageHtml);
            
            // Generate store URL
            const baseUrl = process.env.FRONTEND_URL || process.env.BASE_URL || 'http://localhost:8080';
            const storeUrl = `${baseUrl}/store/${populatedPlan._id}`;
            
            logger.info(`[CoachSellablePlanController] Store page created: ${storeFilePath}`);
            
            return storeUrl;
            
        } catch (error) {
            logger.error('[CoachSellablePlanController] Error generating store page:', error);
            // Return a fallback URL even if store page generation fails
            const baseUrl = process.env.FRONTEND_URL || process.env.BASE_URL || 'http://localhost:8080';
            return `${baseUrl}/store/${plan._id}`;
        }
    }
}

// Create controller instance and bind all methods
const controller = new CoachSellablePlanController();

module.exports = {
    createPlan: controller.createPlan.bind(controller),
    getCoachPlans: controller.getCoachPlans.bind(controller),
    getPlanById: controller.getPlanById.bind(controller),
    updatePlan: controller.updatePlan.bind(controller),
    deletePlan: controller.deletePlan.bind(controller),
    updatePlanStatus: controller.updatePlanStatus.bind(controller),
    getPublicPlans: controller.getPublicPlans.bind(controller),
    getPlanForPurchase: controller.getPlanForPurchase.bind(controller),
    getCoachPlanStats: controller.getCoachPlanStats.bind(controller)
};
