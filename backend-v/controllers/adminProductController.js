const AdminProduct = require('../schema/AdminProduct');
const CoachSellablePlan = require('../schema/CoachSellablePlan');
const logger = require('../utils/logger');

class AdminProductController {
    
    /**
     * Create a new admin product
     * POST /api/paymentsv1/admin/products
     */
    async createProduct(req, res) {
        try {
            logger.info('[AdminProductController] Creating new admin product');
            
            const productData = req.body;
            productData.createdBy = req.admin._id;
            
            const product = new AdminProduct(productData);
            await product.save();
            
            logger.info(`[AdminProductController] Admin product created: ${product._id}`);
            
            res.status(201).json({
                success: true,
                message: 'Admin product created successfully',
                data: product
            });
            
        } catch (error) {
            logger.error('[AdminProductController] Error creating admin product:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating admin product',
                error: error.message
            });
        }
    }
    
    /**
     * Get all admin products
     * GET /api/paymentsv1/admin/products
     */
    async getAllProducts(req, res) {
        try {
            const { page = 1, limit = 20, status, category, productType, search } = req.query;
            
            logger.info('[AdminProductController] Getting all admin products');
            
            // Build query
            const query = {};
            if (status) query.status = status;
            if (category) query.category = category;
            if (productType) query.productType = productType;
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { tags: { $in: [new RegExp(search, 'i')] } }
                ];
            }
            
            // Execute query with pagination
            const skip = (page - 1) * limit;
            
            // Debug: Log the query being used
            logger.info(`[AdminProductController] Query: ${JSON.stringify(query)}`);
            
            const products = await AdminProduct.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('createdBy', 'name email')
                .populate('updatedBy', 'name email');
            
            const total = await AdminProduct.countDocuments(query);
            
            // Debug: Log the results
            logger.info(`[AdminProductController] Found ${products.length} products, total: ${total}`);
            
            res.json({
                success: true,
                data: products,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalProducts: total,
                    hasNextPage: skip + products.length < total,
                    hasPrevPage: page > 1
                }
            });
            
        } catch (error) {
            logger.error('[AdminProductController] Error getting all products:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting all products',
                error: error.message
            });
        }
    }
    
    /**
     * Get product by ID
     * GET /api/paymentsv1/admin/products/:productId
     */
    async getProductById(req, res) {
        try {
            const { productId } = req.params;
            
            logger.info(`[AdminProductController] Getting product: ${productId}`);
            
            const product = await AdminProduct.findById(productId)
                .populate('createdBy', 'name email')
                .populate('updatedBy', 'name email');
            
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }
            
            res.json({
                success: true,
                data: product
            });
            
        } catch (error) {
            logger.error('[AdminProductController] Error getting product:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting product',
                error: error.message
            });
        }
    }
    
    /**
     * Update product
     * PUT /api/paymentsv1/admin/products/:productId
     */
    async updateProduct(req, res) {
        try {
            const { productId } = req.params;
            const updateData = req.body;
            updateData.updatedBy = req.admin._id;
            
            logger.info(`[AdminProductController] Updating product: ${productId}`);
            
            const product = await AdminProduct.findByIdAndUpdate(
                productId,
                updateData,
                { new: true, runValidators: true }
            );
            
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }
            
            logger.info(`[AdminProductController] Product updated: ${productId}`);
            
            res.json({
                success: true,
                message: 'Product updated successfully',
                data: product
            });
            
        } catch (error) {
            logger.error('[AdminProductController] Error updating product:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating product',
                error: error.message
            });
        }
    }
    
    /**
     * Delete product
     * DELETE /api/paymentsv1/admin/products/:productId
     */
    async deleteProduct(req, res) {
        try {
            const { productId } = req.params;
            
            logger.info(`[AdminProductController] Deleting product: ${productId}`);
            
            // Check if product is being used by coaches
            const coachPlans = await CoachSellablePlan.countDocuments({ adminProductId: productId });
            if (coachPlans > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot delete product. It is being used by ${coachPlans} coach plans.`
                });
            }
            
            const product = await AdminProduct.findByIdAndDelete(productId);
            
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }
            
            logger.info(`[AdminProductController] Product deleted: ${productId}`);
            
            res.json({
                success: true,
                message: 'Product deleted successfully'
            });
            
        } catch (error) {
            logger.error('[AdminProductController] Error deleting product:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting product',
                error: error.message
            });
        }
    }
    
    /**
     * Get products available for coaches
     * GET /api/paymentsv1/admin/products/available-for-coaches
     */
    async getProductsForCoaches(req, res) {
        try {
            const { category, productType, search } = req.query;
            
            logger.info('[AdminProductController] Getting products available for coaches');
            
            // Build query for available products
            const query = {
                status: 'active',
                isAvailableForCoaches: true
            };
            
            if (category) query.category = category;
            if (productType) query.productType = productType;
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { tags: { $in: [new RegExp(search, 'i')] } }
                ];
            }
            
            const products = await AdminProduct.find(query)
                .select('_id name description shortDescription category productType basePrice currency pricingRules features coverImage')
                .sort({ createdAt: -1 });
            
            res.json({
                success: true,
                data: products
            });
            
        } catch (error) {
            logger.error('[AdminProductController] Error getting products for coaches:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting products for coaches',
                error: error.message
            });
        }
    }
    
    /**
     * Get product statistics
     * GET /api/paymentsv1/admin/products/:productId/stats
     */
    async getProductStats(req, res) {
        try {
            const { productId } = req.params;
            
            logger.info(`[AdminProductController] Getting product stats: ${productId}`);
            
            const product = await AdminProduct.findById(productId);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }
            
            // Get coach plans using this product
            const coachPlans = await CoachSellablePlan.find({ adminProductId: product._id })
                .populate('coachId', 'name email');
            
            // Calculate statistics
            const totalCoachPlans = coachPlans.length;
            const activeCoachPlans = coachPlans.filter(plan => plan.status === 'active').length;
            const totalSales = coachPlans.reduce((sum, plan) => sum + plan.totalSales, 0);
            const totalRevenue = coachPlans.reduce((sum, plan) => sum + plan.totalRevenue, 0);
            
            res.json({
                success: true,
                data: {
                    product: {
                        _id: product._id,
                        name: product.name,
                        totalSales: product.totalSales,
                        totalRevenue: product.totalRevenue,
                        viewCount: product.viewCount
                    },
                    coachPlans: {
                        total: totalCoachPlans,
                        active: activeCoachPlans,
                        totalSales,
                        totalRevenue
                    },
                    topCoaches: coachPlans
                        .sort((a, b) => b.totalSales - a.totalSales)
                        .slice(0, 10)
                        .map(plan => ({
                            coachId: plan.coachId._id,
                            coachName: plan.coachId.name,
                            planId: plan.planId,
                            sales: plan.totalSales,
                            revenue: plan.totalRevenue
                        }))
                }
            });
            
        } catch (error) {
            logger.error('[AdminProductController] Error getting product stats:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting product statistics',
                error: error.message
            });
        }
    }
    
    /**
     * Update product status
     * PUT /api/paymentsv1/admin/products/:productId/status
     */
    async updateProductStatus(req, res) {
        try {
            const { productId } = req.params;
            const { status } = req.body;
            
            logger.info(`[AdminProductController] Updating product status: ${productId} to ${status}`);
            
            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: 'Status is required'
                });
            }
            
            const product = await AdminProduct.findByIdAndUpdate(
                productId,
                { 
                    status,
                    updatedBy: req.admin._id,
                    ...(status === 'active' && { publishedAt: new Date() })
                },
                { new: true }
            );
            
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }
            
            logger.info(`[AdminProductController] Product status updated: ${productId}`);
            
            res.json({
                success: true,
                message: 'Product status updated successfully',
                data: product
            });
            
        } catch (error) {
            logger.error('[AdminProductController] Error updating product status:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating product status',
                error: error.message
            });
        }
    }
}

// Create controller instance and bind all methods
const controller = new AdminProductController();

module.exports = {
    createProduct: controller.createProduct.bind(controller),
    getAllProducts: controller.getAllProducts.bind(controller),
    getProductById: controller.getProductById.bind(controller),
    updateProduct: controller.updateProduct.bind(controller),
    deleteProduct: controller.deleteProduct.bind(controller),
    getProductsForCoaches: controller.getProductsForCoaches.bind(controller),
    getProductStats: controller.getProductStats.bind(controller),
    updateProductStatus: controller.updateProductStatus.bind(controller)
};
