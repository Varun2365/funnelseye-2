const mongoose = require('mongoose');
const { CoachPlan, User } = require('../schema');
const { getUserContext } = require('../middleware/unifiedCoachAuth');

// ===== COACH PLAN CONTROLLER =====

// @desc    Create a new coach plan
// @route   POST /api/coach-plans
// @access  Private (Coach)
const createCoachPlan = async (req, res) => {
    try {
        const {
            title,
            description,
            shortDescription,
            price,
            currency,
            originalPrice,
            discountPercentage,
            features,
            category,
            subcategory,
            tags,
            duration,
            durationType,
            accessType,
            scheduledReleaseDate,
            contentFiles,
            videoContent,
            coverImage,
            galleryImages,
            termsAndConditions,
            refundPolicy,
            seoTitle,
            seoDescription,
            seoKeywords
        } = req.body;

        // Validate required fields
        if (!title || !description || !price || !category || !duration) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: title, description, price, category, duration'
            });
        }

        // Validate price
        if (price <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Price must be greater than 0'
            });
        }

        // Validate discount percentage
        if (discountPercentage && (discountPercentage < 0 || discountPercentage > 100)) {
            return res.status(400).json({
                success: false,
                message: 'Discount percentage must be between 0 and 100'
            });
        }

        // Generate unique plan ID
        const planId = `PLAN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create new plan
        const newPlan = new CoachPlan({
            planId,
            coachId: req.coachId,
            title,
            description,
            shortDescription,
            price,
            currency: currency || 'USD',
            originalPrice: originalPrice || price,
            discountPercentage: discountPercentage || 0,
            features: features || [],
            category,
            subcategory,
            tags: tags || [],
            duration,
            durationType: durationType || 'months',
            accessType: accessType || 'instant',
            scheduledReleaseDate,
            contentFiles: contentFiles || [],
            videoContent: videoContent || [],
            coverImage,
            galleryImages: galleryImages || [],
            termsAndConditions,
            refundPolicy,
            seoTitle,
            seoDescription,
            seoKeywords: seoKeywords || [],
            status: 'draft',
            isPublic: false
        });

        // Save the plan
        await newPlan.save();

        res.status(201).json({
            success: true,
            message: 'Coach plan created successfully',
            data: {
                planId: newPlan.planId,
                title: newPlan.title,
                price: newPlan.price,
                currency: newPlan.currency,
                status: newPlan.status,
                createdAt: newPlan.createdAt
            }
        });

    } catch (error) {
        console.error('Error creating coach plan:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// @desc    Get all plans for a specific coach
// @route   GET /api/coach-plans/coach/:coachId
// @access  Private
const getCoachPlans = async (req, res) => {
    try {
        const { coachId } = req.params;
        const { status, category, page = 1, limit = 10 } = req.query;

        // Build filter
        const filter = { coachId };
        if (status) filter.status = status;
        if (category) filter.category = category;

        // Pagination
        const skip = (page - 1) * limit;

        // Get plans with pagination
        const plans = await CoachPlan.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select('-__v');

        // Get total count
        const totalPlans = await CoachPlan.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: 'Coach plans retrieved successfully',
            data: {
                plans,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalPlans / limit),
                    totalPlans,
                    hasNextPage: page * limit < totalPlans,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Error getting coach plans:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// @desc    Get a specific coach plan
// @route   GET /api/coach-plans/:planId
// @access  Public (for viewing plans)
const getCoachPlan = async (req, res) => {
    try {
        const { planId } = req.params;

        const plan = await CoachPlan.findOne({ planId })
            .populate('coachId', 'name email portfolio.specializations portfolio.experienceYears')
            .select('-__v');

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
        }

        // Increment view count if plan is public
        if (plan.isPublic && plan.status === 'active') {
            plan.viewCount += 1;
            await plan.save();
        }

        res.status(200).json({
            success: true,
            message: 'Coach plan retrieved successfully',
            data: plan
        });

    } catch (error) {
        console.error('Error getting coach plan:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// @desc    Update a coach plan
// @route   PUT /api/coach-plans/:planId
// @access  Private (Coach - owner only)
const updateCoachPlan = async (req, res) => {
    try {
        const { planId } = req.params;
        const updateData = req.body;

        // Find the plan
        const plan = await CoachPlan.findOne({ planId });
        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
        }

        // Check ownership
        if (plan.coachId.toString() !== req.coachId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this plan'
            });
        }

        // Remove fields that shouldn't be updated
        delete updateData.planId;
        delete updateData.coachId;
        delete updateData.totalSales;
        delete updateData.totalRevenue;
        delete updateData.viewCount;
        delete updateData.createdAt;

        // Update the plan
        Object.assign(plan, updateData);
        plan.updatedAt = new Date();

        // If plan is being published, set publishedAt
        if (updateData.status === 'active' && plan.status === 'draft') {
            plan.publishedAt = new Date();
        }

        await plan.save();

        res.status(200).json({
            success: true,
            message: 'Coach plan updated successfully',
            data: {
                planId: plan.planId,
                title: plan.title,
                status: plan.status,
                updatedAt: plan.updatedAt
            }
        });

    } catch (error) {
        console.error('Error updating coach plan:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// @desc    Delete a coach plan
// @route   DELETE /api/coach-plans/:planId
// @access  Private (Coach - owner only)
const deleteCoachPlan = async (req, res) => {
    try {
        const { planId } = req.params;

        // Find the plan
        const plan = await CoachPlan.findOne({ planId });
        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
        }

        // Check ownership
        if (plan.coachId.toString() !== req.coachId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this plan'
            });
        }

        // Check if plan has sales
        if (plan.totalSales > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete plan with existing sales. Consider archiving instead.'
            });
        }

        // Soft delete by changing status
        plan.status = 'deleted';
        plan.updatedAt = new Date();
        await plan.save();

        res.status(200).json({
            success: true,
            message: 'Coach plan deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting coach plan:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// @desc    Get public plans (for customers to browse)
// @route   GET /api/coach-plans/public
// @access  Public
const getPublicPlans = async (req, res) => {
    try {
        const { 
            category, 
            subcategory, 
            minPrice, 
            maxPrice, 
            duration, 
            tags,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = 1, 
            limit = 12 
        } = req.query;

        // Build filter for public plans only
        const filter = {
            status: 'active',
            isPublic: true
        };

        if (category) filter.category = category;
        if (subcategory) filter.subcategory = subcategory;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }
        if (duration) filter.duration = { $gte: parseInt(duration) };
        if (tags) {
            const tagArray = tags.split(',').map(tag => tag.trim());
            filter.tags = { $in: tagArray };
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Pagination
        const skip = (page - 1) * limit;

        // Get plans with pagination
        const plans = await CoachPlan.find(filter)
            .populate('coachId', 'name portfolio.specializations portfolio.experienceYears')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .select('-__v -contentFiles -videoContent -termsAndConditions -refundPolicy');

        // Get total count
        const totalPlans = await CoachPlan.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: 'Public plans retrieved successfully',
            data: {
                plans,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalPlans / limit),
                    totalPlans,
                    hasNextPage: page * limit < totalPlans,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Error getting public plans:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// @desc    Get featured plans
// @route   GET /api/coach-plans/featured
// @access  Public
const getFeaturedPlans = async (req, res) => {
    try {
        const { limit = 6 } = req.query;

        const featuredPlans = await CoachPlan.find({
            status: 'active',
            isPublic: true,
            isFeatured: true
        })
        .populate('coachId', 'name portfolio.specializations portfolio.experienceYears')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .select('-__v -contentFiles -videoContent -termsAndConditions -refundPolicy');

        res.status(200).json({
            success: true,
            message: 'Featured plans retrieved successfully',
            data: featuredPlans
        });

    } catch (error) {
        console.error('Error getting featured plans:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// @desc    Search plans
// @route   GET /api/coach-plans/search
// @access  Public
const searchPlans = async (req, res) => {
    try {
        const { 
            query, 
            category, 
            minPrice, 
            maxPrice,
            page = 1, 
            limit = 12 
        } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        // Build search filter
        const filter = {
            status: 'active',
            isPublic: true,
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { shortDescription: { $regex: query, $options: 'i' } },
                { tags: { $in: [new RegExp(query, 'i')] } }
            ]
        };

        if (category) filter.category = category;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }

        // Pagination
        const skip = (page - 1) * limit;

        // Search plans
        const plans = await CoachPlan.find(filter)
            .populate('coachId', 'name portfolio.specializations portfolio.experienceYears')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select('-__v -contentFiles -videoContent -termsAndConditions -refundPolicy');

        // Get total count
        const totalPlans = await CoachPlan.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: 'Search completed successfully',
            data: {
                plans,
                searchQuery: query,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalPlans / limit),
                    totalPlans,
                    hasNextPage: page * limit < totalPlans,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Error searching plans:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// @desc    Get plan analytics for a coach
// @route   GET /api/coach-plans/analytics/:coachId
// @access  Private (Coach - owner only)
const getPlanAnalytics = async (req, res) => {
    try {
        const { coachId } = req.params;
        const { startDate, endDate } = req.query;

        // Check if user is requesting their own analytics or is admin
        if (req.coachId !== coachId && req.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view these analytics'
            });
        }

        // Build date filter
        const dateFilter = {};
        if (startDate && endDate) {
            dateFilter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Get analytics
        const analytics = await CoachPlan.aggregate([
            { $match: { coachId: mongoose.Types.ObjectId(coachId), ...dateFilter } },
            {
                $group: {
                    _id: null,
                    totalPlans: { $sum: 1 },
                    activePlans: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
                    draftPlans: { $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] } },
                    totalSales: { $sum: "$totalSales" },
                    totalRevenue: { $sum: "$totalRevenue" },
                    totalViews: { $sum: "$viewCount" },
                    averagePrice: { $avg: "$price" },
                    averageRating: { $avg: "$rating" }
                }
            }
        ]);

        // Get plans by category
        const plansByCategory = await CoachPlan.aggregate([
            { $match: { coachId: mongoose.Types.ObjectId(coachId), ...dateFilter } },
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 },
                    totalSales: { $sum: "$totalSales" },
                    totalRevenue: { $sum: "$totalRevenue" }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Get top performing plans
        const topPlans = await CoachPlan.find({ coachId, ...dateFilter })
            .sort({ totalSales: -1, totalRevenue: -1 })
            .limit(5)
            .select('title category totalSales totalRevenue viewCount');

        res.status(200).json({
            success: true,
            message: 'Plan analytics retrieved successfully',
            data: {
                summary: analytics[0] || {},
                plansByCategory,
                topPlans,
                dateRange: { startDate, endDate }
            }
        });

    } catch (error) {
        console.error('Error getting plan analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    createCoachPlan,
    getCoachPlans,
    getCoachPlan,
    updateCoachPlan,
    deleteCoachPlan,
    getPublicPlans,
    getFeaturedPlans,
    searchPlans,
    getPlanAnalytics
};
