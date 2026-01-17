const leadMagnetsService = require('../services/leadMagnetsService');
const CoachStaffService = require('../services/coachStaffService');
const asyncHandler = require('../middleware/async');

// Get all lead magnets for a coach
exports.getCoachLeadMagnets = asyncHandler(async (req, res, next) => {
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'lead_magnets', 'list', { coachId });

    const leadMagnets = await leadMagnetsService.getCoachLeadMagnets(coachId);

    // Filter response data based on staff permissions
    const filteredLeadMagnets = CoachStaffService.filterResponseData(req, leadMagnets, 'leads');

    res.json({
        success: true,
        data: filteredLeadMagnets,
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

// Update coach's lead magnet settings
exports.updateCoachLeadMagnets = asyncHandler(async (req, res, next) => {
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    const { leadMagnetSettings } = req.body;
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'update', 'lead_magnets', 'settings', { coachId, leadMagnetSettings });

    const updatedLeadMagnets = await leadMagnetsService.updateCoachLeadMagnets(
        coachId, 
        leadMagnetSettings
    );

    // Filter response data based on staff permissions
    const filteredLeadMagnets = CoachStaffService.filterResponseData(req, updatedLeadMagnets, 'leads');

    res.json({
        success: true,
        data: filteredLeadMagnets,
        message: 'Lead magnet settings updated successfully',
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

        // Generate AI Diet Plan via Email (WhatsApp functionality moved to dustbin/whatsapp-dump/)
exports.generateAIDietPlan = asyncHandler(async (req, res, next) => {
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    const { leadId, userPreferences } = req.body;
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'write', 'lead_magnets', 'ai_diet_plan', { coachId, leadId });

    // Validate leadId
    if (!leadId) {
        return res.status(400).json({
            success: false,
            message: 'leadId is required'
        });
    }

    // Validate leadId format (should be a valid MongoDB ObjectId)
    if (!leadId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid leadId format'
        });
    }

    console.log(`[generateAIDietPlan] Generating diet plan for leadId: ${leadId}, coachId: ${coachId}`);

    try {
        const dietPlan = await leadMagnetsService.generateAIDietPlan(
            coachId,
            leadId,
            userPreferences
        );

        // Filter response data based on staff permissions
        const filteredDietPlan = CoachStaffService.filterResponseData(req, dietPlan, 'leads');

        res.json({
            success: true,
            data: filteredDietPlan,
            message: 'AI diet plan generated successfully',
            userContext: {
                isStaff: userContext.isStaff,
                permissions: userContext.permissions
            }
        });
    } catch (error) {
        console.error('[generateAIDietPlan] Error:', error);
        
        if (error.message === 'Lead not found') {
            return res.status(404).json({
                success: false,
                message: 'Lead not found',
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error generating AI diet plan',
            error: error.message
        });
    }
});

// Calculate BMI and get recommendations
exports.calculateBMIAndRecommendations = asyncHandler(async (req, res, next) => {
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    const { weight, height, age, gender, activityLevel } = req.body;
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'write', 'lead_magnets', 'bmi_calculator', { coachId });

    const bmiResults = await leadMagnetsService.calculateBMIAndRecommendations(
        weight,
        height,
        age,
        gender,
        activityLevel
    );

    // Filter response data based on staff permissions
    const filteredResults = CoachStaffService.filterResponseData(req, bmiResults, 'leads');

    res.json({
        success: true,
        data: filteredResults,
        message: 'BMI calculated successfully',
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

// Generate e-book content
exports.generateEbookContent = asyncHandler(async (req, res, next) => {
    const { ebookType, userData } = req.body;

    const ebookContent = await leadMagnetsService.generateEbookContent(
        ebookType,
        userData
    );

    res.json({
        success: true,
        data: ebookContent,
        message: 'E-book content generated successfully'
    });
});

// Calculate workout metrics
exports.calculateWorkoutMetrics = asyncHandler(async (req, res, next) => {
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    const { age, weight, height, gender, activityLevel, exerciseData } = req.body;
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'write', 'lead_magnets', 'workout_calculator', { coachId });

    const workoutMetrics = leadMagnetsService.calculateWorkoutMetrics(
        age,
        weight,
        height,
        gender,
        activityLevel,
        exerciseData
    );

    // Filter response data based on staff permissions
    const filteredMetrics = CoachStaffService.filterResponseData(req, workoutMetrics, 'leads');

    res.json({
        success: true,
        data: filteredMetrics,
        message: 'Workout metrics calculated successfully',
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

// Track progress
exports.trackProgress = asyncHandler(async (req, res, next) => {
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    const { leadId, progressData } = req.body;
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'write', 'lead_magnets', 'track_progress', { coachId, leadId });

    const progressResults = await leadMagnetsService.trackProgress(
        leadId,
        progressData
    );

    res.json({
        success: true,
        data: progressResults,
        message: 'Progress tracked successfully'
    });
});

// Analyze sleep quality
exports.analyzeSleepQuality = asyncHandler(async (req, res, next) => {
    const { sleepData } = req.body;

    const sleepAnalysis = await leadMagnetsService.analyzeSleepQuality(sleepData);

    res.json({
        success: true,
        data: sleepAnalysis,
        message: 'Sleep quality analyzed successfully'
    });
});

// Assess stress level
exports.assessStressLevel = asyncHandler(async (req, res, next) => {
    const { stressResponses } = req.body;

    const stressAssessment = await leadMagnetsService.assessStressLevel(stressResponses);

    res.json({
        success: true,
        data: stressAssessment,
        message: 'Stress level assessed successfully'
    });
});

// Get available lead magnets
exports.getAvailableLeadMagnets = asyncHandler(async (req, res, next) => {
    const availableMagnets = Object.keys(leadMagnetsService.availableLeadMagnets).map(magnetId => ({
        id: magnetId,
        ...leadMagnetsService.availableLeadMagnets[magnetId]
    }));

    res.json({
        success: true,
        data: availableMagnets,
        message: 'Available lead magnets retrieved successfully'
    });
});

// Get lead magnet analytics
exports.getLeadMagnetAnalytics = asyncHandler(async (req, res, next) => {
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'lead_magnets', 'analytics', { coachId });
    const { timeRange = 30 } = req.query;

    // This would typically fetch analytics from the database
    // For now, returning placeholder data
    const analytics = {
        totalInteractions: 150,
        mostPopularMagnet: 'ai_diet_planner',
        conversionRate: 0.25,
        averageEngagementTime: 8.5,
        topPerformingMagnets: [
            { id: 'ai_diet_planner', interactions: 45, conversions: 12 },
            { id: 'bmi_calculator', interactions: 38, conversions: 8 },
            { id: 'fitness_ebook', interactions: 32, conversions: 6 }
        ],
        interactionsByDay: [
            { date: '2024-01-01', interactions: 5 },
            { date: '2024-01-02', interactions: 8 },
            { date: '2024-01-03', interactions: 12 }
        ]
    };

    // Filter response data based on staff permissions
    const filteredAnalytics = CoachStaffService.filterResponseData(req, analytics, 'leads');

    res.json({
        success: true,
        data: filteredAnalytics,
        message: 'Lead magnet analytics retrieved successfully',
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

// Get lead magnet interaction history for a lead
exports.getLeadMagnetHistory = asyncHandler(async (req, res, next) => {
    const { leadId } = req.params;

    // This would typically fetch from the Lead schema
    // For now, returning placeholder data
    const interactionHistory = [
        {
            type: 'ai_diet_planner',
            timestamp: new Date('2024-01-01T10:00:00Z'),
            data: { preferences: { goals: 'weight_loss' } }
        },
        {
            type: 'bmi_calculator',
            timestamp: new Date('2024-01-02T14:30:00Z'),
            data: { bmi: 24.5, category: 'Normal weight' }
        }
    ];

    res.json({
        success: true,
        data: interactionHistory,
        message: 'Lead magnet history retrieved successfully'
    });
});

// Mark lead magnet interaction as converted (when lead actually signs up)
exports.markConversion = asyncHandler(async (req, res, next) => {
    const { leadId, interactionType } = req.body;
    const coachId = req.coachId;

    if (!leadId || !interactionType) {
        return res.status(400).json({
            success: false,
            error: 'Lead ID and interaction type are required'
        });
    }

    try {
        const result = await leadMagnetsService.markLeadMagnetConversion(leadId, interactionType);
        
        res.json({
            success: true,
            message: 'Lead magnet conversion marked successfully',
            data: {
                leadId,
                interactionType,
                newScore: result.score,
                scoreExplanation: result.explanation
            }
        });
    } catch (error) {
        console.error('Error marking lead magnet conversion:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to mark conversion'
        });
    }
});

// Get lead magnet interaction analytics
exports.getInteractionAnalytics = asyncHandler(async (req, res, next) => {
    const coachId = req.coachId;
    const { timeRange = 30 } = req.query;

    try {
        const analytics = await leadMagnetsService.getInteractionAnalytics(coachId, parseInt(timeRange));
        
        res.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('Error getting interaction analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get analytics'
        });
    }
});
