// Admin Funnel Routes for managing central funnels
const express = require('express');
const router = express.Router();
const { verifyAdminToken, checkAdminPermission } = require('../middleware/adminAuth');
const { AdminFunnel } = require('../schema');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const logger = require('../utils/logger');

// Helper for ownership check
const checkFunnelOwnership = (funnel, req) => {
    if (funnel.adminId.toString() !== req.admin._id.toString()) {
        throw new ErrorResponse('Forbidden: You are not authorized to access/modify this funnel.', 403);
    }
};

const handleDuplicateKeyError = (error, next) => {
    if (error?.code === 11000) {
        let message = 'Duplicate value detected.';
        if (error?.keyPattern?.name && error?.keyPattern?.adminId) {
            message = 'A funnel with this name already exists. Please choose a different name.';
        } else if (error?.keyPattern?.funnelUrl) {
            message = 'This funnel URL is already in use. Please choose a different URL slug.';
        } else if (error?.keyPattern?.['stages.pageId']) {
            message = 'Stage pageId must be unique within a funnel.';
        }
        next(new ErrorResponse(message, 400));
        return true;
    }
    return false;
};

// Apply admin authentication to all routes
router.use(verifyAdminToken);

// Get all funnels (central funnels viewable by admin)
router.get('/all', verifyAdminToken, checkAdminPermission('funnelManagement'), asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const targetAudience = req.query.targetAudience || 'all';
    const status = req.query.status || 'all';

    let query = {};

    // Search filter
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    // Target audience filter
    if (targetAudience !== 'all') {
        query.targetAudience = targetAudience;
    }

    // Status filter
    if (status !== 'all') {
        query.isActive = status === 'active';
    }

    const skip = (page - 1) * limit;

    const total = await AdminFunnel.countDocuments(query);
    const funnels = await AdminFunnel.find(query)
        .populate('adminId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const transformedFunnels = funnels.map(f => ({
        id: f._id,
        name: f.name,
        description: f.description,
        targetAudience: f.targetAudience,
        isActive: f.isActive,
        funnelUrl: f.funnelUrl,
        stages: f.stages || [],
        stageCount: f.stages?.length || 0,
        adminId: f.adminId,
        adminName: f.adminId ? `${f.adminId.firstName} ${f.adminId.lastName}` : 'Admin',
        adminEmail: f.adminId?.email || '',
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
        lastUpdated: f.updatedAt || f.createdAt
    }));

    res.status(200).json({
        success: true,
        data: transformedFunnels,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        },
        filters: {
            search,
            targetAudience,
            status
        }
    });
}));

// Get funnel by ID
router.get('/:funnelId', verifyAdminToken, checkAdminPermission('funnelManagement'), asyncHandler(async (req, res, next) => {
    const funnel = await AdminFunnel.findById(req.params.funnelId)
        .populate('adminId', 'firstName lastName email');

    if (!funnel) {
        return next(new ErrorResponse('Funnel not found', 404));
    }

    const transformedFunnel = {
        id: funnel._id,
        name: funnel.name,
        description: funnel.description,
        targetAudience: funnel.targetAudience,
        isActive: funnel.isActive,
        funnelUrl: funnel.funnelUrl,
        stages: funnel.stages || [],
        stageCount: funnel.stages?.length || 0,
        adminId: funnel.adminId,
        adminName: funnel.adminId ? `${funnel.adminId.firstName} ${funnel.adminId.lastName}` : 'Admin',
        adminEmail: funnel.adminId?.email || '',
        createdAt: funnel.createdAt,
        updatedAt: funnel.updatedAt,
        lastUpdated: funnel.updatedAt || funnel.createdAt
    };

    res.status(200).json({
        success: true,
        data: transformedFunnel
    });
}));

// Create a new funnel (admin can create central funnels)
router.post('/', verifyAdminToken, checkAdminPermission('funnelManagement'), asyncHandler(async (req, res, next) => {
    const { name, description, targetAudience, funnelUrl, stages } = req.body;

    if (!name || !targetAudience) {
        return next(new ErrorResponse('Name and target audience are required', 400));
    }

    // Generate funnel URL if not provided
    let finalFunnelUrl = funnelUrl;
    if (!finalFunnelUrl) {
        const sanitizedName = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
        finalFunnelUrl = `${sanitizedName}-${Date.now().toString(36)}`;
    }

    const funnelData = {
        name: name.trim(),
        description: description?.trim() || '',
        targetAudience: targetAudience,
        funnelUrl: finalFunnelUrl.trim(),
        stages: stages || [{
            pageId: `welcome-page-${Date.now()}`,
            name: 'Welcome Page',
            type: 'welcome-page',
            order: 0,
            html: `<h1>Welcome to ${name.trim()}</h1><p>Get started with your journey.</p>`,
            css: '',
            js: '',
            assets: [],
            isEnabled: true,
            basicInfo: {
                title: name.trim() || 'Welcome Page',
                description: description?.trim() || '',
                favicon: null,
                keywords: '',
                socialTitle: '',
                socialImage: null,
                socialDescription: '',
                customHtmlHead: '',
                customHtmlBody: ''
            }
        }],
        adminId: req.admin._id,
        isActive: false // Default to inactive for admin funnels
    };

    const funnel = await AdminFunnel.create(funnelData);

    const transformedFunnel = {
        id: funnel._id,
        name: funnel.name,
        description: funnel.description,
        targetAudience: funnel.targetAudience,
        isActive: funnel.isActive,
        funnelUrl: funnel.funnelUrl,
        stages: funnel.stages || [],
        stageCount: funnel.stages?.length || 0,
        adminId: funnel.adminId,
        createdAt: funnel.createdAt,
        updatedAt: funnel.updatedAt,
        lastUpdated: funnel.updatedAt || funnel.createdAt
    };

    res.status(201).json({
        success: true,
        data: transformedFunnel,
        message: 'Funnel created successfully'
    });
}));

// Update funnel
router.put('/:funnelId', verifyAdminToken, checkAdminPermission('funnelManagement'), asyncHandler(async (req, res, next) => {
    const { name, description, targetAudience, funnelUrl, stages, isActive } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || '';
    if (targetAudience !== undefined) updateData.targetAudience = targetAudience;
    if (funnelUrl !== undefined) updateData.funnelUrl = funnelUrl.trim();
    if (stages !== undefined) updateData.stages = stages;
    if (isActive !== undefined) updateData.isActive = isActive;

    const funnel = await AdminFunnel.findByIdAndUpdate(
        req.params.funnelId,
        updateData,
        { new: true, runValidators: true }
    ).populate('adminId', 'firstName lastName email');

    if (!funnel) {
        return next(new ErrorResponse('Funnel not found', 404));
    }

    const transformedFunnel = {
        id: funnel._id,
        name: funnel.name,
        description: funnel.description,
        targetAudience: funnel.targetAudience,
        isActive: funnel.isActive,
        funnelUrl: funnel.funnelUrl,
        stages: funnel.stages || [],
        stageCount: funnel.stages?.length || 0,
        adminId: funnel.adminId,
        adminName: funnel.adminId ? `${funnel.adminId.firstName} ${funnel.adminId.lastName}` : 'Admin',
        adminEmail: funnel.adminId?.email || '',
        createdAt: funnel.createdAt,
        updatedAt: funnel.updatedAt,
        lastUpdated: funnel.updatedAt || funnel.createdAt
    };

    res.status(200).json({
        success: true,
        data: transformedFunnel,
        message: 'Funnel updated successfully'
    });
}));

// Delete funnel
router.delete('/:funnelId', verifyAdminToken, checkAdminPermission('funnelManagement'), asyncHandler(async (req, res, next) => {
    const funnel = await AdminFunnel.findByIdAndDelete(req.params.funnelId);

    if (!funnel) {
        return next(new ErrorResponse('Funnel not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Funnel deleted successfully'
    });
}));

// Toggle funnel status (activate/deactivate)
router.patch('/:funnelId/toggle-status', verifyAdminToken, checkAdminPermission('funnelManagement'), asyncHandler(async (req, res, next) => {
    const funnel = await AdminFunnel.findById(req.params.funnelId);

    if (!funnel) {
        return next(new ErrorResponse('Funnel not found', 404));
    }

    funnel.isActive = !funnel.isActive;
    funnel.lastUpdated = Date.now();
    await funnel.save();

    res.status(200).json({
        success: true,
        data: {
            id: funnel._id,
            isActive: funnel.isActive
        },
        message: `Funnel ${funnel.isActive ? 'activated' : 'deactivated'} successfully`
    });
}));

// Bulk operations
router.post('/bulk/activate', verifyAdminToken, checkAdminPermission('funnelManagement'), asyncHandler(async (req, res, next) => {
    const { funnelIds } = req.body;

    if (!funnelIds || !Array.isArray(funnelIds)) {
        return next(new ErrorResponse('Funnel IDs array is required', 400));
    }

    await AdminFunnel.updateMany(
        { _id: { $in: funnelIds } },
        { isActive: true, lastUpdated: Date.now() }
    );

    res.status(200).json({
        success: true,
        message: `${funnelIds.length} funnels activated successfully`
    });
}));

router.post('/bulk/deactivate', verifyAdminToken, checkAdminPermission('funnelManagement'), asyncHandler(async (req, res, next) => {
    const { funnelIds } = req.body;

    if (!funnelIds || !Array.isArray(funnelIds)) {
        return next(new ErrorResponse('Funnel IDs array is required', 400));
    }

    await AdminFunnel.updateMany(
        { _id: { $in: funnelIds } },
        { isActive: false, lastUpdated: Date.now() }
    );

    res.status(200).json({
        success: true,
        message: `${funnelIds.length} funnels deactivated successfully`
    });
}));

router.post('/bulk/delete', verifyAdminToken, checkAdminPermission('funnelManagement'), asyncHandler(async (req, res, next) => {
    const { funnelIds } = req.body;

    if (!funnelIds || !Array.isArray(funnelIds)) {
        return next(new ErrorResponse('Funnel IDs array is required', 400));
    }

    await AdminFunnel.deleteMany({ _id: { $in: funnelIds } });

    res.status(200).json({
        success: true,
        message: `${funnelIds.length} funnels deleted successfully`
    });
}));

module.exports = router;