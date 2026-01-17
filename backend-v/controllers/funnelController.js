// D:\PRJ_YCT_Final\controllers/funnelController.js

const { Funnel, FunnelEvent, CustomDomain } = require('../schema'); // Corrected path to the Funnel model
const CoachStaffService = require('../services/coachStaffService');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { SECTIONS } = require('../utils/sectionPermissions');
const logger = require('../utils/logger');

// No longer need to import separate stage content schemas
// No longer need `stageModels` object

// Helper for ownership check (updated for staff context)
const checkFunnelOwnership = (funnel, req) => {
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    if (funnel.coachId.toString() !== coachId.toString()) {
        throw new ErrorResponse('Forbidden: You are not authorized to access/modify this funnel.', 403);
    }
};

const handleDuplicateKeyError = (error, next) => {
    if (error?.code === 11000) {
        let message = 'Duplicate value detected.';
        if (error?.keyPattern?.name && error?.keyPattern?.coachId) {
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

const getFunnelsByCoachId = asyncHandler(async (req, res, next) => {
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'funnels', 'all', { coachId });
    
    // For staff: middleware already ensures they can only access their coach's data
    // For coaches: validate URL param matches their coachId for security
    if (userContext.isCoach && coachId.toString() !== req.params.coachId.toString()) {
        return next(new ErrorResponse('Forbidden: You can only access your own funnels.', 403));
    }
    
    // Build query with staff permission filtering
    // Use coachId from service (not URL param) to ensure staff access their coach's data correctly
    const baseQuery = { coachId: coachId };
    const filteredQuery = CoachStaffService.buildResourceFilter(req, baseQuery);
    
    const funnels = await Funnel.find(filteredQuery);
    
    // Filter response data based on staff permissions
    const filteredFunnels = CoachStaffService.filterResponseData(req, funnels, 'funnels');
    
    res.status(200).json({
        success: true,
        count: filteredFunnels.length,
        data: filteredFunnels,
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

const getFunnelById = asyncHandler(async (req, res, next) => {
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'funnels', req.params.funnelId, { coachId });
    
    const funnel = await Funnel.findById(req.params.funnelId);
    if (!funnel) {
        return next(new ErrorResponse(`Funnel not found with id of ${req.params.funnelId}`, 404));
    }
    checkFunnelOwnership(funnel, req);
    
    // Filter response data based on staff permissions
    const filteredFunnel = CoachStaffService.filterResponseData(req, funnel, 'funnels');
    
    res.status(200).json({ 
        success: true, 
        data: filteredFunnel,
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

const createFunnel = asyncHandler(async (req, res, next) => {
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'write', 'funnels', 'create', { coachId });
    
    req.body.coachId = coachId;
    // For staff: middleware already ensures they can only create for their coach
    // For coaches: validate URL param matches their coachId for security
    if (userContext.isCoach && coachId.toString() !== req.params.coachId.toString()) {
        return next(new ErrorResponse('Forbidden: You can only create funnels for yourself.', 403));
    }
    
    // Check subscription limits for funnel creation - MUST happen before any funnel creation
    const SubscriptionLimitsMiddleware = require('../middleware/subscriptionLimits');
    const limitCheck = await SubscriptionLimitsMiddleware.checkFunnelLimit(coachId);
    
    if (!limitCheck.allowed) {
        const { sendLimitError } = require('../utils/subscriptionLimitErrors');
        logger.warn(`[FunnelController] Funnel creation blocked for coach ${coachId}: ${limitCheck.reason}`);
        return sendLimitError(
            res, 
            'FUNNEL', 
            limitCheck.reason || 'Funnel limit reached', 
            limitCheck.currentCount || 0, 
            limitCheck.maxLimit || 0, 
            limitCheck.upgradeRequired !== false
        );
    }
    
    // Validate customDomain if provided
    if (req.body.customDomain) {
        const customDomain = await CustomDomain.findOne({
            domain: req.body.customDomain.toLowerCase(),
            coachId: coachId,
            status: 'active'
        });
        if (!customDomain) {
            return next(new ErrorResponse('Custom domain is not valid, not active, or not owned by you.', 400));
        }
    }
    
    // Ensure stages have required fields (html and basicInfo.title)
    if (req.body.stages && Array.isArray(req.body.stages)) {
        req.body.stages = req.body.stages.map((stage, index) => {
            // Ensure html field exists (required)
            if (!stage.html || stage.html.trim() === '') {
                stage.html = `<h1>${stage.name || `Page ${index + 1}`}</h1><p>Content goes here.</p>`;
            }
            
            // Ensure basicInfo exists with required title field
            if (!stage.basicInfo) {
                stage.basicInfo = {
                    title: stage.name || `Page ${index + 1}`,
                    description: '',
                    favicon: null,
                    keywords: '',
                    socialTitle: '',
                    socialImage: null,
                    socialDescription: '',
                    customHtmlHead: '',
                    customHtmlBody: ''
                };
            } else if (!stage.basicInfo.title || stage.basicInfo.title.trim() === '') {
                stage.basicInfo.title = stage.name || `Page ${index + 1}`;
            }
            
            // Ensure other required fields have defaults
            if (!stage.pageId) {
                stage.pageId = `page-${Date.now()}-${index}`;
            }
            if (!stage.name) {
                stage.name = `Page ${index + 1}`;
            }
            if (!stage.type) {
                stage.type = 'LandingPage';
            }
            if (stage.css === undefined) {
                stage.css = '';
            }
            if (stage.js === undefined) {
                stage.js = '';
            }
            if (!Array.isArray(stage.assets)) {
                stage.assets = [];
            }
            if (stage.isEnabled === undefined) {
                stage.isEnabled = true;
            }
            
            return stage;
        });
    }
    
    let funnel;
    try {
        funnel = await Funnel.create(req.body);
    } catch (error) {
        if (handleDuplicateKeyError(error, next)) {
            return;
        }
        return next(error);
    }
    
    // Filter response data based on staff permissions
    const filteredFunnel = CoachStaffService.filterResponseData(req, funnel, 'funnels');
    
    res.status(201).json({
        success: true,
        data: filteredFunnel,
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

const updateFunnel = asyncHandler(async (req, res, next) => {
    let funnel = await Funnel.findById(req.params.funnelId);
    if (!funnel) {
        return next(new ErrorResponse(`Funnel not found with id of ${req.params.funnelId}`, 404));
    }
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'update', 'funnels', req.params.funnelId, { coachId });
    
    checkFunnelOwnership(funnel, req);

    // If `stages` array is sent in `req.body`, it will entirely replace the existing one.
    // Ensure frontend sends the complete updated `stages` array if modifying stages.
    // Validate customDomain if provided
    if (req.body.customDomain) {
        const customDomain = await CustomDomain.findOne({
            domain: req.body.customDomain.toLowerCase(),
            coachId: coachId,
            status: 'active'
        });
        if (!customDomain) {
            return next(new ErrorResponse('Custom domain is not valid, not active, or not owned by you.', 400));
        }
    }
    try {
        funnel = await Funnel.findByIdAndUpdate(req.params.funnelId, req.body, {
            new: true,
            runValidators: true
        });
    } catch (error) {
        if (handleDuplicateKeyError(error, next)) {
            return;
        }
        return next(error);
    }
    
    // Filter response data based on staff permissions
    const filteredFunnel = CoachStaffService.filterResponseData(req, funnel, 'funnels');
    
    res.status(200).json({ 
        success: true, 
        data: filteredFunnel,
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

const deleteFunnel = asyncHandler(async (req, res, next) => {
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'delete', 'funnels', req.params.funnelId, { coachId });
    
    const funnel = await Funnel.findById(req.params.funnelId);
    if (!funnel) {
        return next(new ErrorResponse(`Funnel not found with id of ${req.params.funnelId}`, 404));
    }
    checkFunnelOwnership(funnel, req);
    await funnel.deleteOne();
    res.status(200).json({ 
        success: true, 
        message: 'Funnel deleted successfully.',
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

const addStageToFunnel = asyncHandler(async (req, res, next) => {
    const { funnelId } = req.params;
    const newStageData = req.body; // Expecting the full stage object here
    
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'write', 'funnels', 'add_stage', { coachId, funnelId });

    const funnel = await Funnel.findById(funnelId);
    if (!funnel) {
        return next(new ErrorResponse('Funnel not found.', 404));
    }
    checkFunnelOwnership(funnel, req);

    if (!newStageData || !newStageData.pageId || !newStageData.name || !newStageData.type) {
        return next(new ErrorResponse('Missing required stage data (pageId, name, type).', 400));
    }

    // Check for duplicate custom `pageId` within the funnel
    const existingStageWithPageId = funnel.stages.find(s => s.pageId === newStageData.pageId);
    if (existingStageWithPageId) {
        return next(new ErrorResponse(`Stage with pageId '${newStageData.pageId}' already exists in this funnel.`, 400));
    }

    if (newStageData.order === undefined || newStageData.order === null) {
        newStageData.order = funnel.stages.length; // Assign sequential order if not provided
    }

    funnel.stages.push(newStageData);
    funnel.stages.sort((a, b) => a.order - b.order); // Keep stages sorted

    await funnel.save();
    
    // Filter response data based on staff permissions
    const filteredStage = CoachStaffService.filterResponseData(req, funnel.stages.find(s => s.pageId === newStageData.pageId), 'funnels');

    res.status(201).json({
        success: true,
        message: `Stage '${newStageData.name}' (${newStageData.type}) added successfully.`,
        data: filteredStage,
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

const editFunnelStage = asyncHandler(async (req, res, next) => {
    const { funnelId, stageId } = req.params; // `stageId` here refers to the MongoDB `_id` of the subdocument
    const updates = req.body; // Full or partial updates for the stage
    
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'update', 'funnels', 'edit_stage', { coachId, funnelId, stageId });

    const funnel = await Funnel.findById(funnelId);
    if (!funnel) {
        return next(new ErrorResponse('Funnel not found.', 404));
    }
    checkFunnelOwnership(funnel, req);

    const stageToUpdate = funnel.stages.id(stageId); // Mongoose helper to find subdocument by _id
    if (!stageToUpdate) {
        return next(new ErrorResponse('Stage not found in this funnel.', 404));
    }

    // Apply updates
    Object.assign(stageToUpdate, updates);

    // If order was updated, re-sort the array
    if (updates.order !== undefined) {
        funnel.stages.sort((a, b) => a.order - b.order);
    }

    await funnel.save(); // Save the entire funnel document
    
    // Filter response data based on staff permissions
    const filteredStage = CoachStaffService.filterResponseData(req, stageToUpdate, 'funnels');

    res.status(200).json({
        success: true,
        message: 'Funnel stage updated successfully.',
        data: filteredStage,
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});


// ⭐ MAJOR CHANGE HERE: getFunnelStagesByType
// This route now filters embedded stages instead of querying separate collections
const getFunnelStagesByType = asyncHandler(async (req, res, next) => {
    const { coachId, funnelId, stageType } = req.params;
    
    // Get coach ID using unified service (handles both coach and staff)
    const coachIdFromReq = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'funnels', 'stages_by_type', { coachId, funnelId, stageType });

    // For staff: middleware already ensures they can only access their coach's data
    // For coaches: validate URL param matches their coachId for security
    if (userContext.isCoach && coachIdFromReq.toString() !== coachId.toString()) {
        return next(new ErrorResponse('Forbidden: You are not authorized to access this coach\'s funnels.', 403));
    }

    const funnel = await Funnel.findById(funnelId);
    if (!funnel) {
        return next(new ErrorResponse('Funnel not found.', 404));
    }
    checkFunnelOwnership(funnel, req);

    // Filter stages directly from the embedded array based on 'type'
    const filteredStages = funnel.stages.filter(stage => stage.type === stageType);
    
    // Filter response data based on staff permissions
    const filteredData = CoachStaffService.filterResponseData(req, filteredStages, 'funnels');

    res.status(200).json({
        success: true,
        count: filteredData.length,
        data: filteredData,
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});


const trackFunnelEvent = asyncHandler(async (req, res, next) => {
    const { funnelId, stageId, eventType, sessionId, userId, metadata } = req.body;

    if (!funnelId || !eventType || !sessionId) {
        return next(new ErrorResponse('Missing required tracking parameters: funnelId, eventType, sessionId', 400));
    }

    const eventData = {
        funnelId,
        stageId: stageId || null,
        eventType,
        sessionId,
        userId: userId || null,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        metadata: metadata || null
    };

    const funnelEvent = await FunnelEvent.create(eventData);

    res.status(201).json({
        success: true,
        message: 'Funnel event tracked successfully',
        data: funnelEvent
    });
});

// Example: After a user enters a funnel stage
const publishFunnelStageEntered = (leadId, funnelId, stageId, coachId) => {
    const eventName = 'funnel_stage_entered';
    const eventPayload = {
        eventName,
        payload: {
            leadId,
            funnelId,
            stageId,
            coachId,
        }
    };
    // Use your event emitter or publishEvent as appropriate
    // funnelseyeEventEmitter.emit('trigger', eventPayload);
};
// Similarly for funnel_stage_exited and funnel_completed

module.exports = {
    getFunnelsByCoachId,
    getFunnelById,
    createFunnel,
    updateFunnel,
    deleteFunnel,
    addStageToFunnel,
    editFunnelStage,
    getFunnelStagesByType,
    trackFunnelEvent,
};