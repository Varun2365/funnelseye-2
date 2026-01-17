// D:\PRJ_YCT_Final\controllers/leadController.js

const mongoose = require('mongoose');
const { Lead, Funnel, NurturingSequence } = require('../schema');
const { publishEvent } = require('../services/rabbitmqProducer');
const { scheduleFutureEvent } = require('../services/automationSchedulerService');
const leadScoringService = require('../services/leadScoringService');
const aiService = require('../services/aiService');
const CoachStaffService = require('../services/coachStaffService');
const leadAssignmentService = require('../services/leadAssignmentService');
const { SECTIONS } = require('../utils/sectionPermissions');

// Lead qualification logic (integrated)
const qualifyClientLead = (clientQuestions, vslWatchPercentage = 0) => {
    let score = 0;
    const maxScore = 100;
    const insights = [];
    
    // Video engagement (15 points)
    if (clientQuestions.watchedVideo === 'Yes') {
        score += 15;
        insights.push('Watched full video - high engagement');
    } else if (clientQuestions.watchedVideo === 'I plan to watch it soon') {
        score += 8;
        insights.push('Plans to watch video - moderate engagement');
    }
    
    // VSL Engagement scoring (up to 20 points based on watch percentage)
    if (vslWatchPercentage >= 100) {
        score += 20;
        insights.push('Watched complete VSL (100%) - maximum engagement');
    } else if (vslWatchPercentage >= 75) {
        score += 18;
        insights.push(`Watched ${vslWatchPercentage}% of VSL - very high engagement`);
    } else if (vslWatchPercentage >= 50) {
        score += 15;
        insights.push(`Watched ${vslWatchPercentage}% of VSL - high engagement`);
    } else if (vslWatchPercentage >= 25) {
        score += 10;
        insights.push(`Watched ${vslWatchPercentage}% of VSL - moderate engagement`);
    } else if (vslWatchPercentage > 0) {
        score += 5;
        insights.push(`Watched ${vslWatchPercentage}% of VSL - low engagement`);
    }
    
    // Health goal specificity (20 points)
    if (clientQuestions.healthGoal && clientQuestions.healthGoal.includes('Lose Weight (15+ kg)')) {
        score += 20;
        insights.push('Significant weight loss goal - high motivation');
    } else if (clientQuestions.healthGoal && (clientQuestions.healthGoal.includes('Lose Weight (5-15 kg)') || clientQuestions.healthGoal.includes('Manage Health Condition'))) {
        score += 15;
        insights.push('Specific health goal - good motivation');
    } else if (clientQuestions.healthGoal && clientQuestions.healthGoal.includes('General Wellness')) {
        score += 10;
        insights.push('General wellness goal - moderate motivation');
    }
    
    // Timeline urgency (20 points)
    if (clientQuestions.timelineForResults === '1-3 months (Urgent)') {
        score += 20;
        insights.push('Urgent timeline - high priority');
    } else if (clientQuestions.timelineForResults === '3-6 months (Moderate)') {
        score += 15;
        insights.push('Moderate timeline - good commitment');
    } else if (clientQuestions.timelineForResults === '6-12 months (Gradual)') {
        score += 10;
        insights.push('Gradual timeline - patient approach');
    }
    
    // Seriousness level (25 points)
    if (clientQuestions.seriousnessLevel === 'Very serious - willing to invest time and money') {
        score += 25;
        insights.push('Very serious - high conversion potential');
    } else if (clientQuestions.seriousnessLevel === 'Serious - depends on the approach') {
        score += 20;
        insights.push('Serious with conditions - good potential');
    } else if (clientQuestions.seriousnessLevel === 'Somewhat serious - exploring options') {
        score += 10;
        insights.push('Exploring options - needs nurturing');
    }
    
    // Investment range (15 points)
    if (clientQuestions.investmentRange && clientQuestions.investmentRange.includes('₹1,00,000+')) {
        score += 15;
        insights.push('High investment capacity - premium client');
    } else if (clientQuestions.investmentRange && clientQuestions.investmentRange.includes('₹50,000 - ₹1,00,000')) {
        score += 12;
        insights.push('Good investment capacity - solid client');
    } else if (clientQuestions.investmentRange && clientQuestions.investmentRange.includes('₹25,000 - ₹50,000')) {
        score += 8;
        insights.push('Moderate investment capacity - budget conscious');
    } else if (clientQuestions.investmentRange === 'Need to understand value first') {
        score += 5;
        insights.push('Needs value education - requires nurturing');
    }
    
    // Start timeline (5 points)
    if (clientQuestions.startTimeline === 'Immediately (This week)') {
        score += 5;
        insights.push('Immediate start - high urgency');
    } else if (clientQuestions.startTimeline === 'Within 2 weeks') {
        score += 3;
        insights.push('Quick start - good urgency');
    }
    
    return { score, maxScore, insights };
};

const qualifyCoachLead = (coachQuestions) => {
    let score = 0;
    const maxScore = 100;
    const insights = [];
    
    // Video engagement (15 points)
    if (coachQuestions.watchedVideo === 'Yes') {
        score += 15;
        insights.push('Watched full video - high engagement');
    }
    
    // Professional background (20 points)
    if (coachQuestions.currentProfession && ['Fitness Trainer/Gym Instructor', 'Nutritionist/Dietitian', 'Healthcare Professional'].includes(coachQuestions.currentProfession)) {
        score += 20;
        insights.push('Relevant professional background - high potential');
    } else if (coachQuestions.currentProfession && ['Sales Professional', 'Business Owner'].includes(coachQuestions.currentProfession)) {
        score += 15;
        insights.push('Business/sales background - good potential');
    } else if (coachQuestions.currentProfession && ['Corporate Employee', 'Student'].includes(coachQuestions.currentProfession)) {
        score += 10;
        insights.push('Professional background - moderate potential');
    }
    
    // Interest reasons (multiple select) (20 points)
    if (coachQuestions.interestReasons && Array.isArray(coachQuestions.interestReasons)) {
        const highValueReasons = ['Want financial freedom', 'Passionate about helping people transform', 'Already in fitness, want to scale'];
        const matchingReasons = coachQuestions.interestReasons.filter(reason => highValueReasons.includes(reason));
        if (matchingReasons.length >= 2) {
            score += 20;
            insights.push('Multiple high-value motivations - strong drive');
        } else if (matchingReasons.length === 1) {
            score += 15;
            insights.push('Good motivation - solid potential');
        } else {
            score += 10;
            insights.push('Basic motivation - needs nurturing');
        }
    }
    
    // Income goal ambition (20 points)
    if (coachQuestions.incomeGoal && coachQuestions.incomeGoal.includes('₹5,00,000+/month')) {
        score += 20;
        insights.push('Empire building mindset - high ambition');
    } else if (coachQuestions.incomeGoal && coachQuestions.incomeGoal.includes('₹2,00,000 - ₹5,00,000/month')) {
        score += 15;
        insights.push('Advanced income goal - strong ambition');
    } else if (coachQuestions.incomeGoal && coachQuestions.incomeGoal.includes('₹1,00,000 - ₹2,00,000/month')) {
        score += 12;
        insights.push('Professional income goal - good ambition');
    } else if (coachQuestions.incomeGoal && coachQuestions.incomeGoal.includes('₹50,000 - ₹1,00,000/month')) {
        score += 8;
        insights.push('Full-time income goal - moderate ambition');
    }
    
    // Investment capacity (15 points)
    if (coachQuestions.investmentCapacity && coachQuestions.investmentCapacity.includes('₹3,00,000+')) {
        score += 15;
        insights.push('High investment capacity - serious commitment');
    } else if (coachQuestions.investmentCapacity && coachQuestions.investmentCapacity.includes('₹2,00,000 - ₹3,00,000')) {
        score += 12;
        insights.push('Good investment capacity - solid commitment');
    } else if (coachQuestions.investmentCapacity && coachQuestions.investmentCapacity.includes('₹1,00,000 - ₹2,00,000')) {
        score += 8;
        insights.push('Moderate investment capacity - reasonable commitment');
    } else if (coachQuestions.investmentCapacity === 'Need to understand business model first') {
        score += 5;
        insights.push('Needs education - requires nurturing');
    }
    
    // Time availability (10 points)
    if (coachQuestions.timeAvailability && coachQuestions.timeAvailability.includes('8+ hours/day')) {
        score += 10;
        insights.push('Full commitment - maximum potential');
    } else if (coachQuestions.timeAvailability && coachQuestions.timeAvailability.includes('6-8 hours/day')) {
        score += 8;
        insights.push('Full-time availability - strong potential');
    } else if (coachQuestions.timeAvailability && coachQuestions.timeAvailability.includes('4-6 hours/day')) {
        score += 5;
        insights.push('Serious part-time - good potential');
    }
    
    return { score, maxScore, insights };
};

const getQualificationSummary = (qualification) => {
    const { score, maxScore, insights } = qualification;
    const percentage = Math.round((score / maxScore) * 100);
    
    let temperature = 'Cold';
    if (percentage >= 80) temperature = 'Hot';
    else if (percentage >= 50) temperature = 'Warm';
    
    const recommendations = [];
    
    if (temperature === 'Hot') {
        recommendations.push('High priority follow-up within 24 hours');
        recommendations.push('Send detailed program information');
        recommendations.push('Schedule discovery call immediately');
    } else if (temperature === 'Warm') {
        recommendations.push('Follow up within 48-72 hours');
        recommendations.push('Send nurturing content and testimonials');
        recommendations.push('Offer free consultation to build trust');
    } else {
        recommendations.push('Add to nurturing sequence');
        recommendations.push('Send educational content regularly');
        recommendations.push('Re-engage after 1-2 weeks');
    }
    
    return { temperature, percentage, recommendations };
};

// @desc    Create a new Lead
// @route   POST /api/leads
// @access  Public - Triggered by a public form submission
const createLead = async (req, res) => {
    try {
        const { 
            coachId, 
            funnelId, 
            targetAudience,
            clientQuestions,
            coachQuestions,
            ...otherLeadData 
        } = req.body;

        if (!coachId || !funnelId) {
            return res.status(400).json({
                success: false,
                message: 'Both coachId and funnelId are required to create a new lead.'
            });
        }

        // Check subscription limits for lead creation - MUST happen before any lead creation
        const SubscriptionLimitsMiddleware = require('../middleware/subscriptionLimits');
        const limitCheck = await SubscriptionLimitsMiddleware.checkLeadLimit(coachId);
        
        if (!limitCheck.allowed) {
            const { sendLimitError } = require('../utils/subscriptionLimitErrors');
            const logger = require('../utils/logger');
            logger.warn(`[LeadController] Lead creation blocked for coach ${coachId}: ${limitCheck.reason}`);
            return sendLimitError(
                res, 
                'LEAD', 
                limitCheck.reason || 'Lead limit reached', 
                limitCheck.currentCount || 0, 
                limitCheck.maxLimit || 0, 
                limitCheck.upgradeRequired !== false
            );
        }

        const funnel = await Funnel.findOne({ _id: funnelId, coachId });

        if (!funnel) {
            return res.status(404).json({
                success: false,
                message: `Funnel not found or does not belong to the specified coach.`
            });
        }

        // Prepare lead data
        const leadData = {
            ...otherLeadData,
            coachId,
            funnelId,
            targetAudience: targetAudience || 'client'
        };

        // Add booking form questions based on target audience
        if (targetAudience === 'client' && clientQuestions) {
            leadData.clientQuestions = clientQuestions;
        } else if (targetAudience === 'coach' && coachQuestions) {
            leadData.coachQuestions = coachQuestions;
        }

        // Automatically qualify the lead if booking form questions are provided
        if (clientQuestions || coachQuestions) {
            let qualification;
            
            if (targetAudience === 'client' && clientQuestions) {
                qualification = qualifyClientLead(clientQuestions, otherLeadData.vslWatchPercentage || 0);
            } else if (targetAudience === 'coach' && coachQuestions) {
                qualification = qualifyCoachLead(coachQuestions);
            }
            
            if (qualification) {
                const summary = getQualificationSummary(qualification);
                
                // Update lead data with qualification results
                leadData.score = qualification.score;
                leadData.maxScore = qualification.maxScore;
                leadData.leadTemperature = summary.temperature;
                leadData.qualificationInsights = qualification.insights;
                leadData.recommendations = summary.recommendations;
                
                // Add qualification note
                const qualificationNote = `\n\n--- AUTOMATIC QUALIFICATION ---\nScore: ${qualification.score}/${qualification.maxScore} (${summary.percentage}%)\nTemperature: ${summary.temperature}\nInsights: ${qualification.insights.join(', ')}\nRecommendations: ${summary.recommendations.join(', ')}`;
                leadData.notes = leadData.notes ? leadData.notes + qualificationNote : `Lead qualified via booking form${qualificationNote}`;
            }
        }

        const lead = await Lead.create(leadData);
        
        // Log lead creation
        console.log(`[Lead Created] Lead ID: ${lead._id} | Name: ${lead.name} | Email: ${lead.email || 'N/A'} | Phone: ${lead.phone || 'N/A'} | Coach ID: ${coachId} | Created At: ${lead.createdAt.toISOString()}`);

        // Auto-assign lead to staff based on distribution ratio
        try {
            const assignmentResult = await leadAssignmentService.autoAssignLead(coachId, lead._id);
            
            if (!assignmentResult.success) {
                if (!assignmentResult.noStaffAvailable && !assignmentResult.allRatiosZero && assignmentResult.message !== 'Lead is already assigned') {
                    console.warn(`[Lead Assignment Failed] Lead ID: ${lead._id} | Reason: ${assignmentResult.message}`);
                }
            }
        } catch (assignmentError) {
            // Don't fail lead creation if assignment fails
            console.error(`[Lead Assignment Error] Lead ID: ${lead._id} | Error: ${assignmentError.message}`);
        }

        // --- Publish event to RabbitMQ ---
        const eventName = 'lead_created';
        const eventPayload = {
            eventName: eventName,
            payload: {
                leadId: lead._id,
                leadData: lead.toObject(),
                coachId: lead.coachId,
                funnelId: lead.funnelId,
            }
        };

        publishEvent(eventName, eventPayload)
            .then(() => console.log(`[Controller] Published event: ${eventName}`))
            .catch(err => console.error(`[Controller] Failed to publish event: ${eventName}`, err));
        // --- End of event publishing ---

        await leadScoringService.updateLeadScore(lead._id, 'form_submitted');

        // Auto-assign nurturing sequence if funnel is provided
        if (funnelId) {
            try {
                const nurturingService = require('../services/nurturingService');
                await nurturingService.autoAssignSequenceToLead(lead._id, funnelId);
            } catch (nurturingError) {
                console.error('Error auto-assigning nurturing sequence:', nurturingError);
                // Don't fail the lead creation if nurturing fails
            }
        }

        res.status(201).json({
            success: true,
            data: {
                ...lead.toObject(),
                score: lead.score || 0,
                maxScore: lead.maxScore || 100,
                qualificationInsights: lead.qualificationInsights || [],
                recommendations: lead.recommendations || []
            }
        });
    } catch (error) {
        console.error("Error creating lead:", error);
        res.status(500).json({
            success: false,
            message: "Error creating lead",
            error: error.message
        });
    }
};

// @desc    Get all Leads for the authenticated coach with filtering, sorting, and pagination
// @route   GET /api/leads?status=New&temperature=Hot&assignedTo=userId&nextFollowUpAt[lte]=date&sortBy=-createdAt&page=1&limit=10
// @access  Private (Coaches/Admins)
const getLeads = async (req, res) => {
    try {
        // Get coach ID using unified service (handles both coach and staff)
        const coachId = CoachStaffService.getCoachIdForQuery(req);
        const userContext = CoachStaffService.getUserContext(req);
        
        // Log staff action if applicable
        CoachStaffService.logStaffAction(req, 'read', 'leads', 'all', { coachId });
        
        // Build base query - ALWAYS filter by coachId first
        // Ensure coachId is converted to ObjectId for proper MongoDB comparison
        let leadQuery = { coachId: mongoose.Types.ObjectId.isValid(coachId) ? coachId : new mongoose.Types.ObjectId(coachId) };

        // Apply additional filters from query params FIRST
        const reqQuery = { ...req.query };
        const removeFields = ['select', 'sort', 'page', 'limit', 'nextFollowUpAt'];
        removeFields.forEach(param => delete reqQuery[param]);

        let queryStr = JSON.stringify(reqQuery);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        if (req.query.nextFollowUpAt) {
            const nextFollowUpAtFilter = JSON.parse(req.query.nextFollowUpAt);
            if (nextFollowUpAtFilter.lte) {
                nextFollowUpAtFilter.lte = new Date(nextFollowUpAtFilter.lte);
            }
            if (nextFollowUpAtFilter.gte) {
                nextFollowUpAtFilter.gte = new Date(nextFollowUpAtFilter.gte);
            }
            queryStr = JSON.stringify({ ...JSON.parse(queryStr), nextFollowUpAt: nextFollowUpAtFilter });
        }

        // Merge additional query params
        if (queryStr && queryStr !== '{}') {
            const additionalParams = JSON.parse(queryStr);
            leadQuery = { ...leadQuery, ...additionalParams };
        }
        
        // CRITICAL: For staff - Apply filtering to show ONLY assigned leads
        // Check if user is staff by checking req.role directly (more reliable than userContext)
        const isStaff = req.role === 'staff' || userContext.isStaff || userContext.role === 'staff';
        const staffUserId = req.userId || userContext.userId;
        
        if (isStaff) {
            // ALL staff can ONLY see leads assigned to them (assignedTo field matches their userId)
            // NO EXCEPTIONS - even staff with manage_all permission only see their assigned leads
            // Convert staffUserId to ObjectId for proper MongoDB matching
            const staffObjectId = mongoose.Types.ObjectId.isValid(staffUserId) 
                ? new mongoose.Types.ObjectId(staffUserId) 
                : staffUserId;
            
            // Build clean query: coachId + assignedTo filter + other params
            // Remove any conflicting assignedTo from query params
            const cleanQuery = { ...leadQuery };
            delete cleanQuery.assignedTo;
            delete cleanQuery.$and;
            delete cleanQuery.$or;
            
            // Build final query - staff can ONLY see leads where assignedTo = their userId
            // Remove coachId, assignedTo, $and, $or from cleanQuery to rebuild properly
            const { coachId: _, assignedTo: __, $and: ___, $or: ____, ...filterParams } = cleanQuery;
            
            leadQuery = {
                coachId: mongoose.Types.ObjectId.isValid(coachId) ? coachId : new mongoose.Types.ObjectId(coachId),
                assignedTo: staffObjectId, // CRITICAL: ALL staff can ONLY see their assigned leads (no exceptions)
                ...filterParams // Include other filters like status, temperature, etc.
            };
            
        }
        let query = Lead.find(leadQuery);

        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 25;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Lead.countDocuments(leadQuery);

        query = query.skip(startIndex).limit(limit);

        query = query.populate('funnelId', 'name');
        query = query.populate('assignedTo', 'name');

        const leads = await query;

        const pagination = {};
        if (endIndex < total) {
            pagination.next = { page: page + 1, limit };
        }
        if (startIndex > 0) {
            pagination.prev = { page: page - 1, limit };
        }

        // Ensure score and qualification data are included
        const leadsWithScore = leads.map(lead => ({
            ...lead.toObject(),
            score: lead.score || 0,
            maxScore: lead.maxScore || 100,
            qualificationInsights: lead.qualificationInsights || [],
            recommendations: lead.recommendations || []
        }));

        res.status(200).json({
            success: true,
            count: leadsWithScore.length,
            total,
            pagination,
            data: leadsWithScore,
            userContext: {
                isStaff: userContext.isStaff,
                permissions: userContext.permissions
            }
        });
    } catch (error) {
        console.error("Error fetching leads:", error);
        res.status(500).json({
            success: false,
            message: 'Server Error. Could not retrieve leads.'
        });
    }
};

// @desc    Get single Lead by ID for the authenticated coach
// @route   GET /api/leads/:id
// @access  Private (Coaches/Admins)
const getLead = async (req, res) => {
    try {
        // Get coach ID using unified service (handles both coach and staff)
        const coachId = CoachStaffService.getCoachIdForQuery(req);
        const userContext = CoachStaffService.getUserContext(req);
        
        // Log staff action if applicable
        CoachStaffService.logStaffAction(req, 'read', 'leads', req.params.leadId, { coachId });
        
        // Build query with assignment filtering for staff
        const leadQuery = CoachStaffService.buildLeadQueryFilter(req, { _id: req.params.leadId });
        
        const lead = await Lead.findOne(leadQuery)
            .populate('funnelId', 'name')
            .populate('assignedTo', 'name')
            .populate('followUpHistory.createdBy', 'name')

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: `Lead not found or you do not have access to this lead.`
            });
        }

        // Filter response data based on staff permissions
        const filteredLead = CoachStaffService.filterResponseData(req, lead, 'leads');

        // Ensure score and qualification data are included
        const leadWithScore = {
            ...filteredLead.toObject(),
            score: filteredLead.score || 0,
            maxScore: filteredLead.maxScore || 100,
            qualificationInsights: filteredLead.qualificationInsights || [],
            recommendations: filteredLead.recommendations || []
        };

        res.status(200).json({
            success: true,
            data: leadWithScore,
            userContext: {
                isStaff: userContext.isStaff,
                permissions: userContext.permissions
            }
        });
    } catch (error) {
        console.error("Error fetching single lead:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid Lead ID format.'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server Error. Could not retrieve lead.'
        });
    }
};

// @desc    Update Lead (Public access - no authentication required)
// @route   PUT /api/leads/:id
// @access  Public
const updateLead = async (req, res) => {
    try {
        // Find lead by ID only (no coachId filter for public access)
        const existingLead = await Lead.findOne({ _id: req.params.leadId });

        if (!existingLead) {
            return res.status(404).json({
                success: false,
                message: `Lead not found.`
            });
        }

        const oldStatus = existingLead.status;
        const oldTemperature = existingLead.leadTemperature;
        const oldAssignedTo = existingLead.assignedTo ? existingLead.assignedTo.toString() : null;

        const updatedLead = await Lead.findOneAndUpdate({ _id: req.params.leadId }, req.body, {
            new: true,
            runValidators: true
        });

        // --- Publish events based on changes to RabbitMQ ---
        if (updatedLead.status !== oldStatus) {
            const eventName = 'lead_status_changed';
            const eventPayload = {
                eventName: eventName,
                payload: {
                    leadId: updatedLead._id,
                    leadData: updatedLead.toObject(),
                    oldStatus: oldStatus,
                    newStatus: updatedLead.status,
                    coachId: updatedLead.coachId, // Use lead's coachId instead of req.user.id
                }
            };
            publishEvent(eventName, eventPayload).catch(err => console.error(`[Controller] Failed to publish event: ${eventName}`, err));
        }

        if (updatedLead.leadTemperature !== oldTemperature) {
            const eventName = 'lead_temperature_changed';
            const eventPayload = {
                eventName: eventName,
                payload: {
                    leadId: updatedLead._id,
                    leadData: updatedLead.toObject(),
                    oldTemperature: oldTemperature,
                    newTemperature: updatedLead.leadTemperature,
                    coachId: updatedLead.coachId, // Use lead's coachId instead of req.user.id
                }
            };
            publishEvent(eventName, eventPayload).catch(err => console.error(`[Controller] Failed to publish event: ${eventName}`, err));
        }

        const newAssignedTo = updatedLead.assignedTo ? updatedLead.assignedTo.toString() : null;
        if (newAssignedTo && newAssignedTo !== oldAssignedTo) {
            const eventName = 'assign_lead_to_coach';
            const eventPayload = {
                eventName: eventName,
                payload: {
                    leadId: updatedLead._id,
                    leadData: updatedLead.toObject(),
                    oldAssignedTo: oldAssignedTo,
                    newAssignedTo: newAssignedTo,
                    coachId: updatedLead.coachId, // Use lead's coachId instead of req.user.id
                }
            };
            publishEvent(eventName, eventPayload).catch(err => console.error(`[Controller] Failed to publish event: ${eventName}`, err));
        }
        // --- End of event publishing ---

        res.status(200).json({
            success: true,
            data: {
                ...updatedLead.toObject(),
                score: updatedLead.score || 0,
                maxScore: updatedLead.maxScore || 100,
                qualificationInsights: updatedLead.qualificationInsights || [],
                recommendations: updatedLead.recommendations || []
            }
        });
    } catch (error) {
        console.error("Error updating lead:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid Lead ID format.'
            });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server Error. Could not update lead.'
        });
    }
};

// @desc    Add a follow-up note to a Lead
// @route   POST /api/leads/:id/followup
// @access  Private (Coaches/Admins)
const addFollowUpNote = async (req, res) => {
    try {
        // Get coach ID using unified service (handles both coach and staff)
        const coachId = CoachStaffService.getCoachIdForQuery(req);
        const userContext = CoachStaffService.getUserContext(req);
        
        // Log staff action if applicable
        CoachStaffService.logStaffAction(req, 'update', 'leads', 'add_followup', { coachId, leadId: req.params.leadId });
        
        // Build query with assignment filtering for staff
        const leadQuery = CoachStaffService.buildLeadQueryFilter(req, { _id: req.params.leadId });
        
        let lead = await Lead.findOne(leadQuery);

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: `Lead not found or you do not have access to this lead.`
            });
        }

        const { note, nextFollowUpAt } = req.body;

        if (!note || note.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Follow-up note is required.'
            });
        }

        const oldNextFollowUpAt = lead.nextFollowUpAt ? lead.nextFollowUpAt.toISOString() : null;

        lead.followUpHistory.push({
            note: note,
            createdBy: req.user.id,
            followUpDate: Date.now()
        });
        lead.lastFollowUpAt = Date.now();

        if (nextFollowUpAt) {
            const nextDate = new Date(nextFollowUpAt);
            if (isNaN(nextDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid next follow-up date provided.'
                });
            }
            lead.nextFollowUpAt = nextDate;
        } else {
            lead.nextFollowUpAt = undefined;
        }

        await lead.save();

        await leadScoringService.updateLeadScore(lead._id, 'followup_added');

        lead = await Lead.findOne({ _id: req.params.leadId, coachId: req.coachId })
            .populate('funnelId', 'name')
            .populate('assignedTo', 'name')
            .populate('followUpHistory.createdBy', 'name');

        const newNextFollowUpAt = lead.nextFollowUpAt ? lead.nextFollowUpAt.toISOString() : null;
        if (newNextFollowUpAt !== oldNextFollowUpAt) {
            const eventName = 'lead_followup_scheduled_or_updated';
            const eventPayload = {
                eventName: eventName,
                payload: {
                    leadId: lead._id,
                    leadData: lead.toObject(),
                    oldNextFollowUpAt: oldNextFollowUpAt,
                    newNextFollowUpAt: newNextFollowUpAt,
                    coachId: req.user.id,
                }
            };
            publishEvent(eventName, eventPayload).catch(err => console.error(`[Controller] Failed to publish event: ${eventName}`, err));
        }

        res.status(200).json({
            success: true,
            data: lead
        });
    } catch (error) {
        console.error("Error adding follow-up note:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid Lead ID format.'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server Error. Could not add follow-up note.'
        });
    }
};

// @desc    Get Leads for upcoming follow-ups
// @route   GET /api/leads/followups/upcoming?days=7
// @access  Private (Coaches/Admins)
const getUpcomingFollowUps = async (req, res) => {
    try {
        // Get coach ID using unified service (handles both coach and staff)
        const coachId = CoachStaffService.getCoachIdForQuery(req);
        const userContext = CoachStaffService.getUserContext(req);
        
        // Log staff action if applicable
        CoachStaffService.logStaffAction(req, 'read', 'leads', 'upcoming_followups', { coachId });
        
        const days = parseInt(req.query.days, 10) || 7;
        const includeOverdue = req.query.includeOverdue === 'true';

        const now = new Date();
        const futureDate = new Date(now);
        futureDate.setDate(now.getDate() + days);

        let matchQuery = {
            nextFollowUpAt: { $ne: null }
        };

        if (includeOverdue) {
            matchQuery.nextFollowUpAt.$lte = futureDate;
        } else {
            matchQuery.nextFollowUpAt.$gte = now;
            matchQuery.nextFollowUpAt.$lte = futureDate;
        }
        
        // Build query with assignment filtering for staff
        matchQuery = CoachStaffService.buildLeadQueryFilter(req, matchQuery);

        const leads = await Lead.find(matchQuery)
            .sort('nextFollowUpAt')
            .populate('funnelId', 'name')
            .populate('assignedTo', 'name');

        res.status(200).json({
            success: true,
            count: leads.length,
            data: leads
        });
    } catch (error) {
        console.error("Error fetching upcoming follow-ups:", error);
        res.status(500).json({
            success: false,
            message: 'Server Error. Could not retrieve upcoming follow-ups.'
        });
    }
};

// @desc    Delete Lead for the authenticated coach
// @route   DELETE /api/leads/:id
// @access  Private (Coaches/Admins)
const deleteLead = async (req, res) => {
    try {
        // Get coach ID using unified service (handles both coach and staff)
        const coachId = CoachStaffService.getCoachIdForQuery(req);
        const userContext = CoachStaffService.getUserContext(req);
        
        // Log staff action if applicable
        CoachStaffService.logStaffAction(req, 'delete', 'leads', req.params.leadId, { coachId });
        
        // Build query with assignment filtering for staff
        const leadQuery = CoachStaffService.buildLeadQueryFilter(req, { _id: req.params.leadId });
        
        const lead = await Lead.findOne(leadQuery);

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: `Lead not found or you do not have access to this lead.`
            });
        }

        await lead.deleteOne();

        // --- Publish event to RabbitMQ ---
        const eventName = 'lead_deleted';
        const eventPayload = {
            eventName: eventName,
            payload: {
                leadId: lead._id,
                coachId: coachId,
                deletedBy: userContext.userId,
                deletedByType: userContext.isStaff ? 'staff' : 'coach'
            }
        };
        publishEvent(eventName, eventPayload).catch(err => console.error(`[Controller] Failed to publish event: ${eventName}`, err));
        // --- End of event publishing ---

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error("Error deleting lead:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid Lead ID format.'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server Error. Could not delete lead.'
        });
    }
};

// --- Basic lead scoring function with explanation ---
function calculateLeadScore(lead) {
    let score = 0;
    let explanation = [];
    
    // --- Basic Lead Scoring ---
    if (lead.leadTemperature === 'Hot') {
        score += 30;
        explanation.push('Hot lead temperature: +30');
    }
    if (lead.source) {
        score += 5;
        explanation.push('Lead source present: +5');
    }
    if (lead.email && lead.phone) {
        score += 15;
        explanation.push('Both email and phone provided: +15');
    } else if (lead.email || lead.phone) {
        score += 5;
        explanation.push('Either email or phone provided: +5');
    }
    if (lead.nextFollowUpAt) {
        score += 10;
        explanation.push('Next follow-up scheduled: +10');
    }
    
    // --- VSL Watch Percentage Scoring ---
    if (lead.vslWatchPercentage && lead.vslWatchPercentage > 0) {
        if (lead.vslWatchPercentage >= 100) {
            score += 20;
            explanation.push(`VSL watched completely (${lead.vslWatchPercentage}%): +20`);
        } else if (lead.vslWatchPercentage >= 75) {
            score += 18;
            explanation.push(`VSL mostly watched (${lead.vslWatchPercentage}%): +18`);
        } else if (lead.vslWatchPercentage >= 50) {
            score += 15;
            explanation.push(`VSL half watched (${lead.vslWatchPercentage}%): +15`);
        } else if (lead.vslWatchPercentage >= 25) {
            score += 10;
            explanation.push(`VSL partially watched (${lead.vslWatchPercentage}%): +10`);
        } else {
            score += 5;
            explanation.push(`VSL started (${lead.vslWatchPercentage}%): +5`);
        }
    }
    
    // --- NEW: Lead Magnet Interaction Scoring ---
    if (lead.leadMagnetInteractions && lead.leadMagnetInteractions.length > 0) {
        const interactionCount = lead.leadMagnetInteractions.length;
        const conversionCount = lead.leadMagnetInteractions.filter(interaction => interaction.conversion).length;
        
        // Points for each interaction (shows engagement)
        const interactionPoints = interactionCount * 8;
        score += interactionPoints;
        explanation.push(`Lead magnet interactions (${interactionCount}): +${interactionPoints}`);
        
        // Bonus points for conversions (shows high intent)
        const conversionPoints = conversionCount * 15;
        score += conversionPoints;
        if (conversionCount > 0) {
            explanation.push(`Lead magnet conversions (${conversionCount}): +${conversionPoints}`);
        }
        
        // Bonus for multiple interactions (shows sustained interest)
        if (interactionCount >= 3) {
            score += 20;
            explanation.push('Multiple lead magnet interactions (3+): +20');
        }
        
        // Bonus for recent interactions (shows current engagement)
        const recentInteractions = lead.leadMagnetInteractions.filter(interaction => {
            const daysSince = (Date.now() - new Date(interaction.timestamp).getTime()) / (1000 * 60 * 60 * 24);
            return daysSince <= 7; // Last 7 days
        });
        if (recentInteractions.length > 0) {
            score += 10;
            explanation.push(`Recent lead magnet activity (last 7 days): +10`);
        }
    }
    
    // --- Progress Tracking Bonus ---
    if (lead.progressTracking && lead.progressTracking.length > 0) {
        const progressEntries = lead.progressTracking.length;
        const progressPoints = Math.min(progressEntries * 5, 25); // Max 25 points for progress tracking
        score += progressPoints;
        explanation.push(`Progress tracking entries (${progressEntries}): +${progressPoints}`);
    }
    
    score = Math.min(100, score);
    return { score, explanation };
}

// Helper to trigger automation for a nurturing step
async function triggerNurturingStepAction(lead, step) {
    const actionType = step.actionType;
    const config = step.actionConfig || {};
    const eventPayload = {
        leadId: lead._id,
        coachId: lead.coachId,
        stepIndex: lead.nurturingStepIndex,
        actionType,
        config,
        leadData: lead.toObject()
    };
    await publishEvent('funnelseye_actions', 'lead.nurture', {
        actionType,
        config,
        payload: eventPayload
    });
}

// Assign a nurturing sequence to a lead
const assignNurturingSequence = async (req, res) => {
    try {
        // Get coach ID using unified service (handles both coach and staff)
        const coachId = CoachStaffService.getCoachIdForQuery(req);
        const userContext = CoachStaffService.getUserContext(req);
        
        const { leadId, sequenceId } = req.body;
        
        // Log staff action if applicable
        CoachStaffService.logStaffAction(req, 'update', 'leads', 'assign_sequence', { coachId, leadId, sequenceId });
        
        // Build query with assignment filtering for staff
        const leadQuery = CoachStaffService.buildLeadQueryFilter(req, { _id: leadId });
        
        const lead = await Lead.findOne(leadQuery);
        if (!lead) return res.status(404).json({ success: false, message: 'Lead not found or you do not have access to this lead' });
        
        const sequence = await NurturingSequence.findById(sequenceId);
        if (!sequence) return res.status(404).json({ success: false, message: 'Nurturing sequence not found' });
        
        lead.nurturingSequence = sequenceId;
        lead.nurturingStepIndex = 0;
        await lead.save();
        
        res.status(200).json({ 
            success: true, 
            message: 'Nurturing sequence assigned', 
            data: lead,
            userContext: {
                isStaff: userContext.isStaff,
                permissions: userContext.permissions
            }
        });
    } catch (e) {
        console.error('Assign nurturing sequence error:', e);
        res.status(500).json({ success: false, message: 'Server error during assignment.' });
    }
};

// Advance a lead to the next nurturing step (now uses automation system)
const advanceNurturingStep = async (req, res) => {
    try {
        // Get coach ID using unified service (handles both coach and staff)
        const coachId = CoachStaffService.getCoachIdForQuery(req);
        const userContext = CoachStaffService.getUserContext(req);
        
        const { leadId } = req.body;
        
        // Log staff action if applicable
        CoachStaffService.logStaffAction(req, 'update', 'leads', 'advance_nurturing', { coachId, leadId });
        
        // Build query with assignment filtering for staff
        const leadQuery = CoachStaffService.buildLeadQueryFilter(req, { _id: leadId });
        
        const lead = await Lead.findOne(leadQuery).populate('nurturingSequence');
        if (!lead) return res.status(404).json({ success: false, message: 'Lead not found or you do not have access to this lead' });
        if (!lead.nurturingSequence) return res.status(400).json({ success: false, message: 'No nurturing sequence assigned' });
        const sequence = lead.nurturingSequence;
        if (lead.nurturingStepIndex >= sequence.steps.length) {
            return res.status(400).json({ success: false, message: 'Lead has completed the nurturing sequence' });
        }
        const step = sequence.steps[lead.nurturingStepIndex];
        // Schedule or trigger the action
        if (step.delayDays && step.delayDays > 0) {
            const scheduledTime = new Date(Date.now() + step.delayDays * 24 * 60 * 60 * 1000);
            await scheduleFutureEvent(scheduledTime, 'funnelseye_actions', 'lead.nurture', {
                actionType: step.actionType,
                config: step.actionConfig || {},
                payload: {
                    leadId: lead._id,
                    coachId: lead.coachId,
                    stepIndex: lead.nurturingStepIndex,
                    actionType: step.actionType,
                    config: step.actionConfig || {},
                    leadData: lead.toObject()
                }
            });
        } else {
            await triggerNurturingStepAction(lead, step);
        }
        lead.nurturingStepIndex += 1;
        await lead.save();
        res.status(200).json({ success: true, message: 'Advanced to next nurturing step and published automation event', data: lead });
    } catch (e) {
        console.error('Advance nurturing step error:', e);
        res.status(500).json({ success: false, message: 'Server error during step advancement.' });
    }
};

// Get nurturing sequence progress for a lead
const getNurturingProgress = async (req, res) => {
    try {
        // Get coach ID using unified service (handles both coach and staff)
        const coachId = CoachStaffService.getCoachIdForQuery(req);
        const userContext = CoachStaffService.getUserContext(req);
        
        const { leadId } = req.params;
        
        // Log staff action if applicable
        CoachStaffService.logStaffAction(req, 'read', 'leads', 'nurturing_progress', { coachId, leadId });
        
        // Build query with assignment filtering for staff
        const leadQuery = CoachStaffService.buildLeadQueryFilter(req, { _id: leadId });
        
        const lead = await Lead.findOne(leadQuery).populate('nurturingSequence');
        if (!lead) return res.status(404).json({ success: false, message: 'Lead not found or you do not have access to this lead' });
        if (!lead.nurturingSequence) return res.status(200).json({ success: true, data: { progress: null, message: 'No nurturing sequence assigned' } });
        const sequence = lead.nurturingSequence;
        const currentStep = sequence.steps[lead.nurturingStepIndex] || null;
        res.status(200).json({ 
            success: true, 
            data: { sequence, currentStep, stepIndex: lead.nurturingStepIndex },
            userContext: {
                isStaff: userContext.isStaff,
                permissions: userContext.permissions
            }
        });
    } catch (e) {
        console.error('Get nurturing progress error:', e);
        res.status(500).json({ success: false, message: 'Server error during progress fetch.' });
    }
};

// Example: After converting a lead to a client
const convertLeadToClient = async (req, res) => {
    try {
        const { leadId } = req.body;
        const lead = await Lead.findById(leadId);
        if (!lead) {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }
        // Conversion logic here...
        lead.status = 'Client';
        await lead.save();
        // Publish automation event
        const eventName = 'lead_converted_to_client';
        const eventPayload = {
            eventName,
            payload: {
                leadId: lead._id,
                leadData: lead.toObject(),
                coachId: lead.coachId,
            }
        };
        publishEvent(eventName, eventPayload).catch(err => console.error(`[Controller] Failed to publish event: ${eventName}`, err));
        await leadScoringService.updateLeadScore(leadId, 'lead_magnet_converted');
        res.status(200).json({ success: true, data: lead });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error during lead conversion.' });
    }
};

// AI-powered lead qualification
const aiQualifyLead = async (req, res) => {
    try {
        // Get coach ID using unified service (handles both coach and staff)
        const coachId = CoachStaffService.getCoachIdForQuery(req);
        const userContext = CoachStaffService.getUserContext(req);
        
        const { leadId } = req.params;
        
        // Log staff action if applicable
        CoachStaffService.logStaffAction(req, 'read', 'leads', 'ai_qualify', { coachId, leadId });
        
        // Build query with assignment filtering for staff
        const leadQuery = CoachStaffService.buildLeadQueryFilter(req, { _id: leadId });
        
        const lead = await Lead.findOne(leadQuery).populate('coachId');
        
        if (!lead) {
            return res.status(404).json({ success: false, message: 'Lead not found or you do not have access to this lead' });
        }

        // Generate AI insights for the lead
        const leadInsights = await aiService.generateLeadInsights({
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            source: lead.source,
            score: lead.score,
            status: lead.status,
            notes: lead.notes,
            followUpHistory: lead.followUpHistory,
            appointment: lead.appointment
        });

        // Generate personalized follow-up message
        const followUpMessage = await aiService.generateContextualResponse(
            `Lead ${lead.name} from ${lead.source} with score ${lead.score}`,
            'interested',
            {
                leadStage: lead.status,
                coachName: lead.coachId?.name || 'Coach',
                niche: lead.coachId?.niche || 'Fitness',
                offer: lead.coachId?.offer || 'Transformation Program'
            }
        );

        // Generate marketing copy for this lead
        const marketingCopy = await aiService.generateMarketingCopy(
            `Create compelling follow-up message for ${lead.name}, a ${lead.source} lead with ${lead.score}/100 score. 
            Coach: ${lead.coachId?.name || 'Coach'}, Niche: ${lead.coachId?.niche || 'Fitness'}, 
            Offer: ${lead.coachId?.offer || 'Transformation Program'}. 
            Lead status: ${lead.status}, Previous follow-ups: ${lead.followUpHistory?.length || 0}`
        );

        res.json({
            success: true,
            data: {
                leadInsights: leadInsights.content,
                followUpMessage: followUpMessage.content,
                marketingCopy: marketingCopy.content,
                aiRecommendations: {
                    nextAction: leadInsights.content.includes('hot') ? 'Immediate follow-up' : 'Scheduled follow-up',
                    priority: lead.score > 70 ? 'High' : lead.score > 40 ? 'Medium' : 'Low',
                    bestApproach: leadInsights.content.includes('objection') ? 'Address concerns first' : 'Direct offer'
                }
            }
        });

    } catch (error) {
        console.error('AI lead qualification error:', error);
        res.status(500).json({ success: false, message: 'Error in AI qualification' });
    }
};

// Helper function to convert AI content to structured nurturing steps
function generateSequenceSteps(aiContent, sequenceType, lead) {
    const steps = [];
    let stepNumber = 1;
    
    // Define action types based on sequence type
    const actionTypes = {
        'warm_lead': ['send_email', 'send_whatsapp_message', 'create_task'],
        'cold_lead': ['send_email', 'send_whatsapp_message', 'send_email', 'create_task', 'send_whatsapp_message'],
        'objection_handling': ['send_whatsapp_message', 'send_email', 'create_task', 'send_whatsapp_message'],
        'follow_up': ['send_whatsapp_message', 'send_email', 'create_task'],
        'reactivation': ['send_email', 'send_whatsapp_message', 'create_task', 'send_whatsapp_message']
    };
    
    const sequenceActions = actionTypes[sequenceType] || actionTypes['warm_lead'];
    
    // Generate steps based on action types
    sequenceActions.forEach((actionType, index) => {
        let actionConfig = {};
        let stepName = '';
        let stepDescription = '';
        
        switch (actionType) {
            case 'send_email':
                stepName = `Email ${stepNumber}`;
                stepDescription = `Send personalized email to ${lead.name}`;
                actionConfig = {
                    subject: `Follow-up from your coach`,
                    body: `Hi ${lead.name}, this is a personalized follow-up message.`
                };
                break;
                
            case 'send_whatsapp_message':
                stepName = `WhatsApp ${stepNumber}`;
                stepDescription = `Send WhatsApp message to ${lead.name}`;
                actionConfig = {
                    message: `Hi ${lead.name}, how are you doing with your fitness journey?`
                };
                break;
                
            case 'create_task':
                stepName = `Follow-up Task ${stepNumber}`;
                stepDescription = `Create manual follow-up task for ${lead.name}`;
                actionConfig = {
                    title: `Follow up with ${lead.name}`,
                    description: `Check progress and answer questions`,
                    priority: 'medium'
                };
                break;
        }
        
        steps.push({
            stepNumber: stepNumber,
            name: stepName,
            description: stepDescription,
            actionType: actionType,
            actionConfig: actionConfig,
            delayDays: index === 0 ? 0 : Math.floor(index / 2), // First step immediate, others spaced out
            delayHours: index === 0 ? 0 : (index % 2) * 12, // Alternate between 0 and 12 hours
            isActive: true
        });
        
        stepNumber++;
    });
    
    return steps;
}

// AI-powered lead nurturing sequence generation
const generateNurturingSequence = async (req, res) => {
    try {
        // Get coach ID using unified service (handles both coach and staff)
        const coachId = CoachStaffService.getCoachIdForQuery(req);
        const userContext = CoachStaffService.getUserContext(req);
        
        const { sequenceType } = req.body;
        const leadId = req.params.leadId; // Get leadId from URL parameters
        
        // Log staff action if applicable
        CoachStaffService.logStaffAction(req, 'write', 'leads', 'generate_sequence', { coachId, leadId, sequenceType });
        
        // Build query with assignment filtering for staff
        const leadQuery = CoachStaffService.buildLeadQueryFilter(req, { _id: leadId });
        
        const lead = await Lead.findOne(leadQuery).populate('coachId');
        
        if (!lead) {
            return res.status(404).json({ success: false, message: 'Lead not found or you do not have access to this lead' });
        }

        let sequencePrompt = '';
        switch (sequenceType) {
            case 'warm_lead':
                sequencePrompt = `Create a 5-step nurturing sequence for ${lead.name}, a warm lead (score: ${lead.score}) 
                interested in ${lead.coachId?.offer || 'fitness transformation'}. 
                Target audience: ${lead.source} leads, Goal: Convert to client`;
                break;
            case 'cold_lead':
                sequencePrompt = `Create a 7-step nurturing sequence for ${lead.name}, a cold lead (score: ${lead.score}) 
                from ${lead.source}. Goal: Warm up and engage before offering ${lead.coachId?.offer || 'fitness program'}`;
                break;
            case 'objection_handling':
                sequencePrompt = `Create a 4-step nurturing sequence to handle objections for ${lead.name}. 
                Lead concerns: ${lead.notes || 'General hesitation'}. 
                Goal: Address concerns and convert to ${lead.coachId?.offer || 'client'}`;
                break;
            default:
                sequencePrompt = `Create a nurturing sequence for ${lead.name} (score: ${lead.score}) 
                from ${lead.source}. Goal: Convert to client for ${lead.coachId?.offer || 'fitness program'}`;
        }

        // Generate AI content for the sequence
        const aiSequenceContent = await aiService.generateMarketingCopy(sequencePrompt, {
            temperature: 0.7,
            maxTokens: 800
        });

        // Convert AI content to proper nurturing sequence format
        const sequenceSteps = generateSequenceSteps(aiSequenceContent.content, sequenceType, lead);

        res.json({
            success: true,
            data: {
                sequence: aiSequenceContent.content,
                type: sequenceType,
                leadId: lead._id,
                recommendedSteps: 5,
                // Add the structured sequence for easy creation
                structuredSequence: {
                    name: `${sequenceType.replace('_', ' ').toUpperCase()} Sequence for ${lead.name}`,
                    description: `AI-generated nurturing sequence for ${lead.name} (${sequenceType})`,
                    category: sequenceType,
                    steps: sequenceSteps
                }
            }
        });

    } catch (error) {
        console.error('AI nurturing sequence generation error:', error);
        res.status(500).json({ success: false, message: 'Error generating nurturing sequence' });
    }
};

// AI-powered follow-up message generation
const generateFollowUpMessage = async (req, res) => {
    try {
        // Get coach ID using unified service (handles both coach and staff)
        const coachId = CoachStaffService.getCoachIdForQuery(req);
        const userContext = CoachStaffService.getUserContext(req);
        
        const { followUpType, context } = req.body;
        const leadId = req.params.leadId; // Get leadId from URL parameters
        
        // Log staff action if applicable
        CoachStaffService.logStaffAction(req, 'write', 'leads', 'generate_followup_message', { coachId, leadId, followUpType });
        
        // Build query with assignment filtering for staff
        const leadQuery = CoachStaffService.buildLeadQueryFilter(req, { _id: leadId });
        
        const lead = await Lead.findOne(leadQuery).populate('coachId');
        
        if (!lead) {
            return res.status(404).json({ success: false, message: 'Lead not found or you do not have access to this lead' });
        }

        let prompt = '';
        switch (followUpType) {
            case 'first_followup':
                prompt = `Generate a first follow-up message for ${lead.name} who signed up from ${lead.source}. 
                Coach: ${lead.coachId?.name || 'Coach'}, Offer: ${lead.coachId?.offer || 'Fitness Program'}. 
                Make it personal, engaging, and include a clear next step.`;
                break;
            case 'reminder':
                prompt = `Generate a reminder follow-up for ${lead.name} who hasn't responded to previous messages. 
                Lead score: ${lead.score}, Previous follow-ups: ${lead.followUpHistory?.length || 0}. 
                Be persistent but not pushy, offer value, and create urgency.`;
                break;
            case 'offer':
                prompt = `Generate an offer presentation message for ${lead.name} (score: ${lead.score}). 
                Coach: ${lead.coachId?.name || 'Coach'}, Offer: ${lead.coachId?.offer || 'Fitness Program'}. 
                Include social proof, benefits, and a compelling call-to-action.`;
                break;
            default:
                prompt = `Generate a follow-up message for ${lead.name} (${followUpType}). 
                Context: ${context || 'General follow-up'}. 
                Make it relevant to their situation and lead score (${lead.score}).`;
        }

        const followUpMessage = await aiService.generateMarketingCopy(prompt, {
            temperature: 0.8,
            maxTokens: 300
        });

        res.json({
            success: true,
            data: {
                message: followUpMessage.content,
                type: followUpType,
                leadId: lead._id,
                recommendedTiming: followUpType === 'first_followup' ? '24 hours' : '3-5 days'
            }
        });

    } catch (error) {
        console.error('AI follow-up generation error:', error);
        res.status(500).json({ success: false, message: 'Error generating follow-up message' });
    }
};

// @desc    Submit question responses for appointment booking (No Auth Required)
// @route   POST /api/leads/question-responses
// @access  Public (No authentication required for appointment booking)
const submitQuestionResponses = async (req, res) => {
    try {
        const { leadId, questionResponses, appointmentData } = req.body;

        // Validate required fields
        if (!leadId) {
            return res.status(400).json({
                success: false,
                message: 'Lead ID is required'
            });
        }

        if (!questionResponses || Object.keys(questionResponses).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Question responses are required'
            });
        }

        // Find the lead by ID (no coach validation for public access)
        const lead = await Lead.findById(leadId);
        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        // Prepare update data
        const updateData = {
            lastUpdated: new Date()
        };

        // Update client questions if provided
        if (questionResponses.clientQuestions) {
            updateData.clientQuestions = {
                ...lead.clientQuestions,
                ...questionResponses.clientQuestions
            };
        }

        // Update coach questions if provided
        if (questionResponses.coachQuestions) {
            updateData.coachQuestions = {
                ...lead.coachQuestions,
                ...questionResponses.coachQuestions
            };
        }

        // Update appointment-related data if provided
        if (appointmentData) {
            if (appointmentData.preferredTime) {
                updateData.preferredTime = appointmentData.preferredTime;
            }
            if (appointmentData.preferredDate) {
                updateData.preferredDate = appointmentData.preferredDate;
            }
            if (appointmentData.timezone) {
                updateData.timezone = appointmentData.timezone;
            }
            if (appointmentData.notes) {
                updateData.appointmentNotes = appointmentData.notes;
            }
        }
        
        // Update VSL watch percentage if provided
        if (questionResponses.vslWatchPercentage !== undefined) {
            updateData.vslWatchPercentage = Math.max(0, Math.min(100, questionResponses.vslWatchPercentage));
        }

        // Update lead status to indicate questions have been answered
        if (lead.status === 'New' || lead.status === 'Contacted') {
            updateData.status = 'Qualified';
        }

        // Recalculate lead score based on new responses
        const allQuestions = {
            ...updateData.clientQuestions,
            ...updateData.coachQuestions
        };
        
        let newScore = 0;
        const insights = [];

        // Basic scoring logic based on question responses
        if (allQuestions.watchedVideo === 'Yes') {
            newScore += 20;
            insights.push('Watched full video - high engagement');
        } else if (allQuestions.watchedVideo === 'Partially') {
            newScore += 10;
            insights.push('Partially watched video - moderate engagement');
        }
        
        // VSL Watch Percentage scoring
        if (updateData.vslWatchPercentage !== undefined) {
            if (updateData.vslWatchPercentage >= 100) {
                newScore += 20;
                insights.push(`VSL watched completely (${updateData.vslWatchPercentage}%) - maximum engagement`);
            } else if (updateData.vslWatchPercentage >= 75) {
                newScore += 18;
                insights.push(`VSL mostly watched (${updateData.vslWatchPercentage}%) - very high engagement`);
            } else if (updateData.vslWatchPercentage >= 50) {
                newScore += 15;
                insights.push(`VSL half watched (${updateData.vslWatchPercentage}%) - high engagement`);
            } else if (updateData.vslWatchPercentage >= 25) {
                newScore += 10;
                insights.push(`VSL partially watched (${updateData.vslWatchPercentage}%) - moderate engagement`);
            } else if (updateData.vslWatchPercentage > 0) {
                newScore += 5;
                insights.push(`VSL started (${updateData.vslWatchPercentage}%) - low engagement`);
            }
        }

        if (allQuestions.readyToStart === 'Yes') {
            newScore += 25;
            insights.push('Ready to start within 7 days - high urgency');
        } else if (allQuestions.readyToStart === 'Not sure') {
            newScore += 10;
            insights.push('Uncertain about timeline - needs nurturing');
        }

        if (allQuestions.willingToInvest === 'Yes') {
            newScore += 25;
            insights.push('Willing to invest - high conversion potential');
        } else if (allQuestions.willingToInvest === 'Need a flexible option') {
            newScore += 15;
            insights.push('Open to investment with flexibility - moderate potential');
        }

        if (allQuestions.seriousnessScale >= 8) {
            newScore += 20;
            insights.push('High seriousness level - strong commitment');
        } else if (allQuestions.seriousnessScale >= 6) {
            newScore += 15;
            insights.push('Moderate seriousness level - good potential');
        } else if (allQuestions.seriousnessScale >= 4) {
            newScore += 10;
            insights.push('Low-moderate seriousness level - needs motivation');
        }

        // Update score and insights
        updateData.score = Math.min(newScore, 100);
        updateData.qualificationInsights = insights;

        // Update the lead
        const updatedLead = await Lead.findByIdAndUpdate(
            leadId,
            updateData,
            { new: true, runValidators: true }
        );

        // Publish event for question responses submitted
        const eventName = 'lead_question_responses_submitted';
        const eventPayload = {
            eventName: eventName,
            payload: {
                leadId: updatedLead._id,
                leadData: updatedLead.toObject(),
                questionResponses: questionResponses,
                appointmentData: appointmentData,
                newScore: updateData.score,
                coachId: updatedLead.coachId
            }
        };
        publishEvent(eventName, eventPayload).catch(err => 
            console.error(`[Controller] Failed to publish event: ${eventName}`, err)
        );

        res.status(200).json({
            success: true,
            message: 'Question responses submitted successfully',
            data: {
                leadId: updatedLead._id,
                score: updatedLead.score || 0,
                maxScore: updatedLead.maxScore || 100,
                qualificationInsights: updatedLead.qualificationInsights || [],
                recommendations: updatedLead.recommendations || [],
                status: updatedLead.status,
                leadTemperature: updatedLead.leadTemperature
            }
        });

    } catch (error) {
        console.error("Error submitting question responses:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid Lead ID format.'
            });
        }
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server Error. Could not submit question responses.'
        });
    }
};

// @desc    Get all question types and their expected responses
// @route   GET /api/leads/question-types
// @access  Public
const getQuestionTypes = async (req, res) => {
    try {
        const questionTypes = {
            client: {
                title: "Fitness Client Lead Questions",
                description: "Questions for potential fitness clients",
                questions: [
                    {
                        field: "watchedVideo",
                        question: "Did you watch the full video before booking this call?",
                        type: "radio",
                        required: true,
                        options: ["Yes", "No"]
                    },
                    {
                        field: "healthGoal",
                        question: "Primary Health Goal",
                        type: "radio",
                        required: true,
                        options: [
                            "Lose Weight (5-15 kg)",
                            "Lose Weight (15+ kg)",
                            "Gain Weight/Muscle",
                            "Improve Fitness & Energy",
                            "Manage Health Condition (Diabetes, PCOS, Thyroid)",
                            "General Wellness & Lifestyle",
                            "Other"
                        ]
                    },
                    {
                        field: "timelineForResults",
                        question: "Timeline for Results",
                        type: "dropdown",
                        required: true,
                        options: [
                            "1-3 months (Urgent)",
                            "3-6 months (Moderate)",
                            "6-12 months (Gradual)",
                            "No specific timeline"
                        ]
                    },
                    {
                        field: "seriousnessLevel",
                        question: "How serious are you about achieving your goal?",
                        type: "radio",
                        required: true,
                        options: [
                            "Very serious - willing to invest time and money",
                            "Serious - depends on the approach",
                            "Somewhat serious - exploring options",
                            "Just curious about possibilities"
                        ]
                    },
                    {
                        field: "investmentRange",
                        question: "Investment Range for Transformation Program",
                        type: "radio",
                        required: true,
                        options: [
                            "₹10,000 - ₹25,000",
                            "₹25,000 - ₹50,000",
                            "₹50,000 - ₹1,00,000",
                            "₹1,00,000+ (Premium programs)",
                            "Need to understand value first"
                        ]
                    },
                    {
                        field: "startTimeline",
                        question: "When would you like to start?",
                        type: "radio",
                        required: true,
                        options: [
                            "Immediately (This week)",
                            "Within 2 weeks",
                            "Within a month",
                            "In 2-3 months",
                            "Just exploring for now"
                        ]
                    },
                    {
                        field: "additionalInfo",
                        question: "Anything else we should know about you?",
                        type: "textarea",
                        required: false,
                        placeholder: "Optional additional information"
                    }
                ]
            },
            coach: {
                title: "Coach Recruitment Lead Questions",
                description: "Questions for potential coach recruits",
                questions: [
                    {
                        field: "watchedVideo",
                        question: "Did you watch the full video before booking this call?",
                        type: "radio",
                        required: true,
                        options: ["Yes", "No"]
                    },
                    {
                        field: "currentProfession",
                        question: "Current Profession",
                        type: "dropdown",
                        required: true,
                        options: [
                            "Fitness Trainer/Gym Instructor",
                            "Nutritionist/Dietitian",
                            "Healthcare Professional",
                            "Sales Professional",
                            "Business Owner",
                            "Corporate Employee",
                            "Homemaker",
                            "Student",
                            "Unemployed/Looking for Career Change",
                            "Other"
                        ]
                    },
                    {
                        field: "interestReasons",
                        question: "Why are you interested in health coaching business?",
                        type: "checkbox",
                        required: true,
                        options: [
                            "Want additional income source",
                            "Passionate about helping people transform",
                            "Looking for career change",
                            "Want financial freedom",
                            "Interested in flexible work schedule",
                            "Want to build a team/network",
                            "Already in fitness, want to scale",
                            "Other"
                        ]
                    },
                    {
                        field: "incomeGoal",
                        question: "Income Goal from Coaching Business",
                        type: "radio",
                        required: true,
                        options: [
                            "₹25,000 - ₹50,000/month (Part-time)",
                            "₹50,000 - ₹1,00,000/month (Full-time basic)",
                            "₹1,00,000 - ₹2,00,000/month (Professional)",
                            "₹2,00,000 - ₹5,00,000/month (Advanced)",
                            "₹5,00,000+/month (Empire building)"
                        ]
                    },
                    {
                        field: "investmentCapacity",
                        question: "Investment Capacity for one time Business Setup",
                        type: "radio",
                        required: true,
                        options: [
                            "₹50,000 - ₹1,00,000",
                            "₹1,00,000 - ₹2,00,000",
                            "₹2,00,000 - ₹3,00,000",
                            "₹3,00,000+",
                            "Need to understand business model first"
                        ]
                    },
                    {
                        field: "timeAvailability",
                        question: "Time Availability for Business",
                        type: "radio",
                        required: true,
                        options: [
                            "2-4 hours/day (Part-time)",
                            "4-6 hours/day (Serious part-time)",
                            "6-8 hours/day (Full-time)",
                            "8+ hours/day (Fully committed)",
                            "Flexible based on results"
                        ]
                    },
                    {
                        field: "timelineToAchieveGoal",
                        question: "Timeline to Achieve Income Goal",
                        type: "radio",
                        required: true,
                        options: [
                            "1-3 months (Very urgent)",
                            "3-6 months (Moderate urgency)",
                            "6-12 months (Gradual building)",
                            "1-2 years (Long-term vision)"
                        ]
                    },
                    {
                        field: "additionalInfo",
                        question: "Anything else we should know about you?",
                        type: "textarea",
                        required: false,
                        placeholder: "Optional additional information"
                    }
                ]
            }
        };

        res.status(200).json({
            success: true,
            data: questionTypes
        });

    } catch (error) {
        console.error("Error getting question types:", error);
        res.status(500).json({
            success: false,
            message: 'Server Error. Could not retrieve question types.'
        });
    }
};

// Export all functions
module.exports = {
    createLead,
    getLeads,
    getLead,
    updateLead,
    addFollowUpNote,
    getUpcomingFollowUps,
    deleteLead,
    submitQuestionResponses, // New method for public question responses
    getQuestionTypes, // New method to get all question types
    // simple AI rescore endpoint handler
    aiRescore: async (req, res) => {
        try {
            // Get coach ID using unified service (handles both coach and staff)
            const coachId = CoachStaffService.getCoachIdForQuery(req);
            const userContext = CoachStaffService.getUserContext(req);
            
            // Log staff action if applicable
            CoachStaffService.logStaffAction(req, 'write', 'leads', 'ai_rescore', { coachId, leadId: req.params.leadId });
            
            // Build query with assignment filtering for staff
            const leadQuery = CoachStaffService.buildLeadQueryFilter(req, { _id: req.params.leadId });
            
            const lead = await Lead.findOne(leadQuery);
            if (!lead) return res.status(404).json({ success: false, message: 'Lead not found or you do not have access to this lead' });
            
            const { score, explanation } = calculateLeadScore(lead);
            lead.score = score;
            await lead.save();
            
            return res.status(200).json({ 
                success: true, 
                data: { leadId: lead._id, score, explanation },
                userContext: {
                    isStaff: userContext.isStaff,
                    permissions: userContext.permissions
                }
            });
        } catch (e) {
            console.error('AI rescore error:', e);
            return res.status(500).json({ success: false, message: 'Server error during AI rescore.' });
        }
    },
    assignNurturingSequence,
    advanceNurturingStep,
    getNurturingProgress,
    convertLeadToClient,
    aiQualifyLead,
    generateNurturingSequence,
    generateFollowUpMessage,
};