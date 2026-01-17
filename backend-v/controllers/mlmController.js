const { User, CoachPerformance, CoachReport, Lead, Payment, Task, Appointment } = require('../schema');
const CoachStaffService = require('../services/coachStaffService');



// @desc    Add a new coach to downline
// @route   POST /api/mlm/downline
// @access  Private (Coach/Staff with permission)
const addDownline = async (req, res) => {
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'manage', 'mlm', 'add_downline', { coachId });
    
    console.log('[MLM Controller] Request body:', req.body);
    console.log('[MLM Controller] Request headers:', req.headers);
    
    const { name, email, password, sponsorId } = req.body;
    
    console.log('[MLM Controller] Extracted values:', { name, email, password, sponsorId });

    if (!email || !password || !name || !sponsorId) {
        console.log('[MLM Controller] Missing required fields:', { name: !!name, email: !!email, password: !!password, sponsorId: !!sponsorId });
        return res.status(400).json({ 
            success: false,
            message: 'Please enter all required fields: name, email, password, and sponsorId.' 
        });
    }

    try {
        const sponsor = await User.findById(sponsorId);
        if (!sponsor) {
            return res.status(404).json({ 
                success: false,
                message: 'Sponsor not found. Cannot add to downline.' 
            });
        }
        
        let coach = await User.findOne({ email, role: 'coach' });
        if (coach) {
            return res.status(400).json({ 
                success: false,
                message: 'Coach with this email already exists.' 
            });
        }

        // Create coach using User model with role discriminator
        const newCoach = new User({
            name,
            email,
            password,
            role: 'coach', // This will create a Coach discriminator
            sponsorId,
            selfCoachId: null, // Will be set during hierarchy setup
            currentLevel: 1, // Default to level 1
            hierarchyLocked: false,
            isVerified: false // New members need to verify email on first login
        });
        
        await newCoach.save();

        // Initialize performance tracking for new coach
        const performanceRecord = new CoachPerformance({
            coachId: newCoach._id,
            sponsorId: sponsorId
        });
        await performanceRecord.save();

        res.status(201).json({
            success: true,
            message: 'Coach successfully added to downline! Email verification required on first login.',
            data: {
                coachId: newCoach._id,
                sponsorId: newCoach.sponsorId,
                name: newCoach.name,
                email: newCoach.email
            }
        });

    } catch (err) {
        console.error('Error adding downline:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while adding coach to downline'
        });
    }
};

// @desc    Get direct downline of a coach
// @route   GET /api/mlm/downline/:sponsorId
// @access  Private
const getDownline = async (req, res) => {
    const { sponsorId } = req.params;
    const { includePerformance = 'false' } = req.query;

    try {
        const downline = await User.find({ sponsorId, role: 'coach' }).select('-password -__v');
        
        if (downline.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'No downline found for this coach.' 
            });
        }

        let result = { downline };

        // Include performance data if requested
        if (includePerformance === 'true') {
            const performanceData = await CoachPerformance.find({ 
                coachId: { $in: downline.map(d => d._id) } 
            });
            
            result.downlineWithPerformance = downline.map(coach => {
                const performance = performanceData.find(p => p.coachId.toString() === coach._id.toString());
                return {
                    ...coach.toObject(),
                    performance: performance ? {
                        currentLevel: performance.performanceRating.level,
                        performanceScore: performance.performanceRating.score,
                        isActive: performance.isActive,
                        lastActivity: performance.lastActivity,
                        activityStreak: performance.activityStreak
                    } : null
                };
            });
        }

        res.status(200).json({
            success: true,
            message: 'Downline retrieved successfully.',
            data: result
        });

    } catch (err) {
        console.error('Error getting downline:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving downline'
        });
    }
};

// @desc    Get complete downline hierarchy
// @route   GET /api/mlm/hierarchy/:coachId
// @access  Private
const getDownlineHierarchy = async (req, res) => {
    const { coachId } = req.params;
    const { levels = 5, includePerformance = 'false' } = req.query;

    try {
        const sponsor = await User.findById(coachId);
        if (!sponsor) {
            return res.status(404).json({ 
                success: false,
                message: 'Sponsor not found.' 
            });
        }

        const hierarchy = await User.aggregate([
            { $match: { _id: sponsor._id, role: 'coach' } },
            {
                $graphLookup: {
                    from: 'users',
                    startWith: '$_id',
                    connectFromField: '_id',
                    connectToField: 'sponsorId',
                    as: 'downlineHierarchy',
                    depthField: 'level',
                    maxDepth: parseInt(levels)
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    downlineHierarchy: {
                        $map: {
                            input: "$downlineHierarchy",
                            as: "downlineMember",
                            in: {
                                _id: "$$downlineMember._id",
                                name: "$$downlineMember.name",
                                email: "$$downlineMember.email",
                                level: "$$downlineMember.level",
                                isActive: "$$downlineMember.isActive",
                                lastActiveAt: "$$downlineMember.lastActiveAt"
                            }
                        }
                    }
                }
            }
        ]);

        if (!hierarchy || hierarchy.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'No downline hierarchy found.' 
            });
        }

        let result = hierarchy[0];

        // Include performance data if requested
        if (includePerformance === 'true') {
            const downlineIds = result.downlineHierarchy.map(d => d._id);
            const performanceData = await CoachPerformance.find({ 
                coachId: { $in: downlineIds } 
            });

            result.downlineHierarchy = result.downlineHierarchy.map(member => {
                const performance = performanceData.find(p => p.coachId.toString() === member._id.toString());
                return {
                    ...member,
                    performance: performance ? {
                        currentLevel: performance.performanceRating.level,
                        performanceScore: performance.performanceRating.score,
                        isActive: performance.isActive,
                        lastActivity: performance.lastActivity,
                        activityStreak: performance.activityStreak
                    } : null
                };
            });
        }

        res.status(200).json({
            success: true,
            message: 'Downline hierarchy retrieved successfully.',
            data: result
        });

    } catch (err) {
        console.error('Error getting hierarchy:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving hierarchy'
        });
    }
};

// @desc    Get team performance summary
// @route   GET /api/mlm/team-performance/:sponsorId
// @access  Private
const getTeamPerformance = async (req, res) => {
    const { sponsorId } = req.params;
    const { period = 'monthly', startDate, endDate } = req.query;

    try {
        // Get all downline coaches
        const downline = await User.find({ sponsorId, role: 'coach' }).select('_id name email');
        
        if (downline.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No team members found.'
            });
        }

        const downlineIds = downline.map(d => d._id);

        // Calculate date range
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        } else {
            // Default to current month
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            dateFilter = {
                createdAt: {
                    $gte: startOfMonth,
                    $lte: endOfMonth
                }
            };
        }

        // Get performance data
        const performanceData = await CoachPerformance.find({ 
            coachId: { $in: downlineIds } 
        });

        // Get leads data
        const leadsData = await Lead.aggregate([
            { $match: { coachId: { $in: downlineIds }, ...dateFilter } },
            {
                $group: {
                    _id: '$coachId',
                    totalLeads: { $sum: 1 },
                    qualifiedLeads: { 
                        $sum: { 
                            $cond: [{ $eq: ['$status', 'Qualified'] }, 1, 0] 
                        } 
                    },
                    convertedLeads: { 
                        $sum: { 
                            $cond: [{ $eq: ['$status', 'Converted'] }, 1, 0] 
                        } 
                    }
                }
            }
        ]);

        // Get sales data
        const salesData = await Payment.aggregate([
            { $match: { coachId: { $in: downlineIds }, status: 'completed', ...dateFilter } },
            {
                $group: {
                    _id: '$coachId',
                    totalSales: { $sum: 1 },
                    totalRevenue: { $sum: '$amount' },
                    averageDealSize: { $avg: '$amount' }
                }
            }
        ]);

        // Get tasks data
        const tasksData = await Task.aggregate([
            { $match: { assignedTo: { $in: downlineIds }, ...dateFilter } },
            {
                $group: {
                    _id: '$assignedTo',
                    totalTasks: { $sum: 1 },
                    completedTasks: { 
                        $sum: { 
                            $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] 
                        } 
                    }
                }
            }
        ]);

        // Compile team performance summary
        const teamSummary = {
            teamSize: downline.length,
            totalLeads: 0,
            totalSales: 0,
            totalRevenue: 0,
            averageConversionRate: 0,
            topPerformers: [],
            underPerformers: [],
            memberDetails: []
        };

        downline.forEach(member => {
            const leads = leadsData.find(l => l._id.toString() === member._id.toString()) || { totalLeads: 0, qualifiedLeads: 0, convertedLeads: 0 };
            const sales = salesData.find(s => s._id.toString() === member._id.toString()) || { totalSales: 0, totalRevenue: 0, averageDealSize: 0 };
            const tasks = tasksData.find(t => t._id.toString() === member._id.toString()) || { totalTasks: 0, completedTasks: 0 };
            const performance = performanceData.find(p => p.coachId.toString() === member._id.toString());

            const conversionRate = leads.totalLeads > 0 ? (leads.convertedLeads / leads.totalLeads) * 100 : 0;
            const taskCompletionRate = tasks.totalTasks > 0 ? (tasks.completedTasks / tasks.totalTasks) * 100 : 0;

            const memberDetail = {
                coachId: member._id,
                name: member.name,
                email: member.email,
                leads: {
                    total: leads.totalLeads,
                    qualified: leads.qualifiedLeads,
                    converted: leads.convertedLeads,
                    conversionRate: conversionRate
                },
                sales: {
                    total: sales.totalSales,
                    revenue: sales.totalRevenue,
                    averageDealSize: sales.averageDealSize
                },
                tasks: {
                    total: tasks.totalTasks,
                    completed: tasks.completedTasks,
                    completionRate: taskCompletionRate
                },
                performance: performance ? {
                    level: performance.performanceRating.level,
                    score: performance.performanceRating.score,
                    isActive: performance.isActive,
                    lastActivity: performance.lastActivity
                } : null
            };

            teamSummary.memberDetails.push(memberDetail);
            teamSummary.totalLeads += leads.totalLeads;
            teamSummary.totalSales += sales.totalSales;
            teamSummary.totalRevenue += sales.totalRevenue;
        });

        // Calculate averages and identify top/under performers
        teamSummary.averageConversionRate = teamSummary.totalLeads > 0 ? 
            (teamSummary.memberDetails.reduce((sum, m) => sum + m.leads.converted, 0) / teamSummary.totalLeads) * 100 : 0;

        // Sort by performance score for top/under performers
        const sortedMembers = teamSummary.memberDetails.sort((a, b) => 
            (b.performance?.score || 0) - (a.performance?.score || 0)
        );

        teamSummary.topPerformers = sortedMembers.slice(0, 3);
        teamSummary.underPerformers = sortedMembers.slice(-3).reverse();

        res.status(200).json({
            success: true,
            message: 'Team performance summary retrieved successfully.',
            data: {
                period,
                dateRange: dateFilter,
                summary: teamSummary
            }
        });

    } catch (err) {
        console.error('Error getting team performance:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving team performance'
        });
    }
};

// @desc    Generate comprehensive team report
// @route   POST /api/mlm/generate-report
// @access  Private
const generateTeamReport = async (req, res) => {
    const { sponsorId, reportType, period, startDate, endDate, config } = req.body;

    try {
        const reportId = `REP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create report record
        const report = new CoachReport({
            reportId,
            generatedBy: sponsorId,
            reportType,
            reportPeriod: {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                period
            },
            config: config || {}
        });

        await report.save();

        // Generate report data asynchronously
        setTimeout(async () => {
            try {
                await generateReportData(reportId, sponsorId, reportType, startDate, endDate);
                
                // Update report status
                await CoachReport.findOneAndUpdate(
                    { reportId },
                    { status: 'completed' }
                );
            } catch (error) {
                console.error('Error generating report data:', error);
                await CoachReport.findOneAndUpdate(
                    { reportId },
                    { status: 'failed' }
                );
            }
        }, 100);

        res.status(201).json({
            success: true,
            message: 'Report generation started successfully.',
            data: {
                reportId,
                status: 'generating',
                estimatedCompletion: '2-5 minutes'
            }
        });

    } catch (err) {
        console.error('Error generating report:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while generating report'
        });
    }
};

// @desc    Get generated reports
// @route   GET /api/mlm/reports/:sponsorId
// @access  Private
const getReports = async (req, res) => {
    const { sponsorId } = req.params;
    const { status, reportType, limit = 10 } = req.query;

    try {
        let query = { generatedBy: sponsorId };
        
        if (status) query.status = status;
        if (reportType) query.reportType = reportType;

        const reports = await CoachReport.find(query)
            .sort({ generatedAt: -1 })
            .limit(parseInt(limit))
            .select('-reportData');

        res.status(200).json({
            success: true,
            message: 'Reports retrieved successfully.',
            data: reports
        });

    } catch (err) {
        console.error('Error getting reports:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving reports'
        });
    }
};

// @desc    Get specific report details
// @route   GET /api/mlm/reports/detail/:reportId
// @access  Private
const getReportDetail = async (req, res) => {
    const { reportId } = req.params;

    try {
        const report = await CoachReport.findOne({ reportId });
        
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Report details retrieved successfully.',
            data: report
        });

    } catch (err) {
        console.error('Error getting report detail:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving report details'
        });
    }
};

// Helper function to generate report data
async function generateReportData(reportId, sponsorId, reportType, startDate, endDate) {
    // This would contain the logic to generate comprehensive report data
    // Implementation would depend on the specific report type
    console.log(`Generating report data for ${reportId}`);
    
    // Placeholder for actual report generation logic
    const reportData = {
        individualMetrics: {},
        teamMetrics: {},
        comparisons: {},
        trends: {},
        goalProgress: {},
        breakdown: {},
        insights: []
    };

    await CoachReport.findOneAndUpdate(
        { reportId },
        { 
            reportData,
            status: 'completed'
        }
    );
}

module.exports = {
    addDownline,
    getDownline,
    getDownlineHierarchy,
    getTeamPerformance,
    generateTeamReport,
    getReports,
    getReportDetail
};