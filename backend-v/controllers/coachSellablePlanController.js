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
                // Use admin product price if custom pricing not allowed
                planData.price = adminProduct.basePrice;
            }
            
            // Create the plan
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
            
            // Get the correct price and currency
            const planPrice = populatedPlan.price || populatedPlan.adminProductId?.basePrice || 0;
            const planCurrency = populatedPlan.currency || populatedPlan.adminProductId?.currency || '₹';
            
            // Get features from the right source
            const planFeatures = populatedPlan.features || populatedPlan.adminProductId?.features || [];
            
            template = template
                .replace(/{{PLAN_ID}}/g, populatedPlan._id.toString())
                .replace(/{{PLAN_NAME}}/g, populatedPlan.title || populatedPlan.adminProductId?.name || 'Plan')
                .replace(/{{PLAN_DESCRIPTION}}/g, populatedPlan.description || populatedPlan.adminProductId?.description || '')
                .replace(/{{PRICE}}/g, planPrice.toString())
                .replace(/{{CURRENCY}}/g, planCurrency)
                .replace(/{{COACH_NAME}}/g, coachName)
                .replace(/{{COACH_TITLE}}/g, coachTitle)
                .replace(/{{COACH_INITIAL}}/g, coachInitial)
                .replace(/{{FEATURES}}/g, JSON.stringify(planFeatures));
            
            // Write the store page to file
            const storeFilePath = path.join(storeDir, `${plan._id}.html`);
            fs.writeFileSync(storeFilePath, template);
            
            // Generate store URL using the original plan ID
            const baseUrl = process.env.BASE_URL || process.env.FRONTEND_URL || 'http://localhost:8080';
            const storeUrl = `${baseUrl}/store/${plan._id}`;
            
            logger.info(`[CoachSellablePlanController] Store page created: ${storeFilePath}`);
            
            return storeUrl;
            
        } catch (error) {
            logger.error('[CoachSellablePlanController] Error generating store page:', error);
            // Return a fallback URL even if store page generation fails
            const baseUrl = process.env.BASE_URL || process.env.FRONTEND_URL || 'http://localhost:8080';
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
    getCoachPlanStats: controller.getCoachPlanStats.bind(controller),
    generateStorePage: controller.generateStorePage.bind(controller)
};
