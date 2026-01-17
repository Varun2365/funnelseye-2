const coachDashboardService = require('../services/coachDashboardService');
const staffDashboardService = require('../services/staffDashboardService');
const calendarService = require('../services/calendarService');
const CoachStaffService = require('../services/coachStaffService');
const asyncHandler = require('../middleware/async');
const { SECTIONS } = require('../utils/sectionPermissions');

// Get complete dashboard data
exports.getDashboardData = asyncHandler(async (req, res, next) => {
    const { timeRange = 30 } = req.query;
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'dashboard', 'overview', { coachId });

    let dashboardData;
    
    // Check if user is staff - show personalized staff dashboard
    if (userContext.isStaff) {
        // Get staff-specific personalized dashboard
        dashboardData = await staffDashboardService.getStaffDashboardData(
            coachId,
            userContext.userId,
            req,
            parseInt(timeRange)
        );
    } else {
        // Get coach dashboard (full coach stats)
        dashboardData = await coachDashboardService.getDashboardData(
            coachId, 
            parseInt(timeRange)
        );
        
        // Filter response data based on permissions (for coach)
        dashboardData = CoachStaffService.filterResponseData(req, dashboardData, 'dashboard');
    }

    res.json({
        success: true,
        data: dashboardData,
        userContext: {
            isStaff: userContext.isStaff,
            isCoach: userContext.isCoach,
            userId: userContext.userId,
            permissions: userContext.permissions
        }
    });
});

// Get overview data only
exports.getOverviewData = asyncHandler(async (req, res, next) => {
    const { timeRange = 30 } = req.query;
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'dashboard', 'overview', { coachId });

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const overview = await coachDashboardService.getOverviewData(coachId, startDate);

    // Filter response data based on staff permissions
    const filteredOverview = CoachStaffService.filterResponseData(req, overview, 'dashboard');

    res.json({
        success: true,
        data: filteredOverview,
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

// Get leads data only
exports.getLeadsData = asyncHandler(async (req, res, next) => {
    const { timeRange = 30 } = req.query;
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'dashboard', 'leads', { coachId });

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const leadsData = await coachDashboardService.getLeadsData(coachId, startDate);

    // Filter response data based on staff permissions
    const filteredLeadsData = CoachStaffService.filterResponseData(req, leadsData, 'dashboard');

    res.json({
        success: true,
        data: filteredLeadsData,
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

// Get tasks data only
exports.getTasksData = asyncHandler(async (req, res, next) => {
    const { timeRange = 30 } = req.query;
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'dashboard', 'tasks', { coachId });

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const tasksData = await coachDashboardService.getTasksData(coachId, startDate);

    // Filter response data based on staff permissions
    const filteredTasksData = CoachStaffService.filterResponseData(req, tasksData, 'tasks');

    res.json({
        success: true,
        data: filteredTasksData,
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

// Get marketing data only
exports.getMarketingData = asyncHandler(async (req, res, next) => {
    const { timeRange = 30 } = req.query;
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'dashboard', 'marketing', { coachId });

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const marketingData = await coachDashboardService.getMarketingData(coachId, startDate);

    // Filter response data based on staff permissions
    const filteredMarketingData = CoachStaffService.filterResponseData(req, marketingData, 'marketing');

    res.json({
        success: true,
        data: filteredMarketingData,
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

// Get financial data only
exports.getFinancialData = asyncHandler(async (req, res, next) => {
    const { timeRange = 30 } = req.query;
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Check if staff has permission to view financial data
    if (userContext.isStaff && !CoachStaffService.hasPermission(req, SECTIONS.DASHBOARD.VIEW)) {
        return res.json({
            success: true,
            data: { message: 'No data found' },
            userContext: {
                isStaff: userContext.isStaff,
                permissions: userContext.permissions
            }
        });
    }
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'dashboard', 'financial', { coachId });

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const financialData = await coachDashboardService.getFinancialData(coachId, startDate, parseInt(timeRange));

    // Filter response data based on staff permissions
    const filteredFinancialData = CoachStaffService.filterResponseData(req, financialData, 'financial');

    res.json({
        success: true,
        data: filteredFinancialData,
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

// Get team data only
exports.getTeamData = asyncHandler(async (req, res, next) => {
    const { timeRange = 30 } = req.query;
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Check if staff has permission to view team data
    if (userContext.isStaff && !CoachStaffService.hasPermission(req, SECTIONS.STAFF_MANAGEMENT.VIEW)) {
        return res.json({
            success: true,
            data: { message: 'No data found' },
            userContext: {
                isStaff: userContext.isStaff,
                permissions: userContext.permissions
            }
        });
    }
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'dashboard', 'team', { coachId });

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const teamData = await coachDashboardService.getTeamData(coachId, startDate);

    // Filter response data based on staff permissions
    const filteredTeamData = CoachStaffService.filterResponseData(req, teamData, 'team');

    res.json({
        success: true,
        data: filteredTeamData,
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

// Get performance data only
exports.getPerformanceData = asyncHandler(async (req, res, next) => {
    const { timeRange = 30 } = req.query;
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Check if staff has permission to view performance data
    if (userContext.isStaff && !CoachStaffService.hasPermission(req, SECTIONS.DASHBOARD.VIEW)) {
        return res.json({
            success: true,
            data: { message: 'No data found' },
            userContext: {
                isStaff: userContext.isStaff,
                permissions: userContext.permissions
            }
        });
    }
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'dashboard', 'performance', { coachId });

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const performanceData = await coachDashboardService.getPerformanceData(coachId, startDate);

    // Filter response data based on staff permissions
    const filteredPerformanceData = CoachStaffService.filterResponseData(req, performanceData, 'performance');

    res.json({
        success: true,
        data: filteredPerformanceData,
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

// Get dashboard widgets
exports.getDashboardWidgets = asyncHandler(async (req, res, next) => {
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'dashboard', 'widgets', { coachId });

    const widgets = await coachDashboardService.getDashboardWidgets(coachId);

    // Filter response data based on staff permissions
    const filteredWidgets = CoachStaffService.filterResponseData(req, widgets, 'dashboard');

    res.json({
        success: true,
        data: filteredWidgets,
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

// Get specific widget data
exports.getWidgetData = asyncHandler(async (req, res, next) => {
    const { widgetId } = req.params;
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'dashboard', 'widget', { coachId, widgetId });

    let data;
    switch (widgetId) {
        case 'revenue_chart':
            // Check permission for financial data
            if (userContext.isStaff && !CoachStaffService.hasPermission(req, SECTIONS.DASHBOARD.VIEW)) {
                data = { message: 'No data found' };
            } else {
                data = await coachDashboardService.getRevenueChartData(coachId);
            }
            break;
        case 'lead_funnel':
            // Check permission for lead data
            if (userContext.isStaff && !CoachStaffService.hasPermission(req, SECTIONS.LEADS.VIEW)) {
                data = { message: 'No data found' };
            } else {
                data = await coachDashboardService.getLeadFunnelData(coachId);
            }
            break;
        case 'team_performance':
            // Check permission for team data
            if (userContext.isStaff && !CoachStaffService.hasPermission(req, SECTIONS.STAFF_MANAGEMENT.VIEW)) {
                data = { message: 'No data found' };
            } else {
                const staffLeaderboardService = require('../services/staffLeaderboardService');
                data = await staffLeaderboardService.getLeaderboard(coachId, 30, 5);
            }
            break;
        case 'task_overview':
            // Check permission for task data
            if (userContext.isStaff && !CoachStaffService.hasPermission(req, SECTIONS.DASHBOARD.VIEW)) {
                data = { message: 'No data found' };
            } else {
                const workflowTaskService = require('../services/workflowTaskService');
                data = await workflowTaskService.getKanbanBoard(coachId);
            }
            break;
        default:
            return res.status(400).json({
                success: false,
                error: 'Invalid widget ID'
            });
    }

    // Filter response data based on staff permissions
    const filteredData = CoachStaffService.filterResponseData(req, data, 'widget');

    res.json({
        success: true,
        data: filteredData,
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

// Get performance trends
exports.getPerformanceTrends = asyncHandler(async (req, res, next) => {
    const { timeRange = 30 } = req.query;
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Check if staff has permission to view performance trends
    if (userContext.isStaff && !CoachStaffService.hasPermission(req, SECTIONS.DASHBOARD.VIEW)) {
        return res.json({
            success: true,
            data: { message: 'No data found' },
            userContext: {
                isStaff: userContext.isStaff,
                permissions: userContext.permissions
            }
        });
    }
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'dashboard', 'performance_trends', { coachId });

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const trends = await coachDashboardService.getPerformanceTrends(coachId, startDate);

    // Filter response data based on staff permissions
    const filteredTrends = CoachStaffService.filterResponseData(req, trends, 'performance');

    res.json({
        success: true,
        data: filteredTrends,
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

// Get performance alerts
exports.getPerformanceAlerts = asyncHandler(async (req, res, next) => {
    const { timeRange = 30 } = req.query;
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Check if staff has permission to view performance alerts
    if (userContext.isStaff && !CoachStaffService.hasPermission(req, SECTIONS.DASHBOARD.VIEW)) {
        return res.json({
            success: true,
            data: { message: 'No data found' },
            userContext: {
                isStaff: userContext.isStaff,
                permissions: userContext.permissions
            }
        });
    }
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'dashboard', 'performance_alerts', { coachId });

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const alerts = await coachDashboardService.getPerformanceAlerts(coachId, startDate);

    // Filter response data based on staff permissions
    const filteredAlerts = CoachStaffService.filterResponseData(req, alerts, 'performance');

    res.json({
        success: true,
        data: filteredAlerts,
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

// Get AI insights
exports.getAIInsights = asyncHandler(async (req, res, next) => {
    const { timeRange = 30 } = req.query;
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Check if staff has permission to view AI insights
    if (userContext.isStaff && !CoachStaffService.hasPermission(req, SECTIONS.DASHBOARD.VIEW)) {
        return res.json({
            success: true,
            data: { message: 'No data found' },
            userContext: {
                isStaff: userContext.isStaff,
                permissions: userContext.permissions
            }
        });
    }
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'dashboard', 'ai_insights', { coachId });

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const insights = await coachDashboardService.getAIInsights(coachId, startDate);

    // Filter response data based on staff permissions
    const filteredInsights = CoachStaffService.filterResponseData(req, insights, 'ai');

    res.json({
        success: true,
        data: filteredInsights,
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

// Get KPIs
exports.getKPIs = asyncHandler(async (req, res, next) => {
    const { timeRange = 30 } = req.query;
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Check if staff has permission to view KPIs
    if (userContext.isStaff && !CoachStaffService.hasPermission(req, SECTIONS.DASHBOARD.VIEW)) {
        return res.json({
            success: true,
            data: { message: 'No data found' },
            userContext: {
                isStaff: userContext.isStaff,
                permissions: userContext.permissions
            }
        });
    }
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'dashboard', 'kpis', { coachId });

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const kpis = await coachDashboardService.calculateKPIs(coachId, startDate);

    // Filter response data based on staff permissions
    const filteredKPIs = CoachStaffService.filterResponseData(req, kpis, 'performance');

    res.json({
        success: true,
        data: filteredKPIs,
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

// Get dashboard sections configuration
exports.getDashboardSections = asyncHandler(async (req, res, next) => {
    const userContext = CoachStaffService.getUserContext(req);
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'dashboard', 'sections', {});

    // Filter sections based on staff permissions
    let sections = coachDashboardService.dashboardSections;
    if (userContext.isStaff) {
        sections = sections.filter(section => {
            // Check if staff has permission for this section
            switch (section.key) {
                case 'leads':
                    return CoachStaffService.hasPermission(req, SECTIONS.LEADS.VIEW);
                case 'funnels':
                    return CoachStaffService.hasPermission(req, SECTIONS.FUNNELS.VIEW);
                case 'tasks':
                    return CoachStaffService.hasPermission(req, SECTIONS.DASHBOARD.VIEW);
                case 'financial':
                    return CoachStaffService.hasPermission(req, SECTIONS.DASHBOARD.VIEW);
                case 'team':
                    return CoachStaffService.hasPermission(req, SECTIONS.STAFF_MANAGEMENT.VIEW);
                case 'performance':
                    return CoachStaffService.hasPermission(req, SECTIONS.DASHBOARD.VIEW);
                case 'calendar':
                    return CoachStaffService.hasPermission(req, SECTIONS.CALENDAR.VIEW);
                default:
                    return true; // Allow access to other sections
            }
        });
    }

    res.json({
        success: true,
        data: sections,
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

// Get real-time dashboard updates
exports.getRealTimeUpdates = asyncHandler(async (req, res, next) => {
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'dashboard', 'realtime', { coachId });

    // Get only critical updates that need real-time monitoring
    const [overview, alerts] = await Promise.all([
        coachDashboardService.getOverviewData(coachId, new Date(Date.now() - 24 * 60 * 60 * 1000)), // Last 24 hours
        userContext.isStaff && !CoachStaffService.hasPermission(req, SECTIONS.DASHBOARD.VIEW) 
            ? { message: 'No data found' }
            : coachDashboardService.getPerformanceAlerts(coachId, new Date(Date.now() - 24 * 60 * 60 * 1000))
    ]);

    // Filter response data based on staff permissions
    const filteredOverview = CoachStaffService.filterResponseData(req, overview, 'dashboard');
    const filteredAlerts = CoachStaffService.filterResponseData(req, alerts, 'performance');

    res.json({
        success: true,
        data: {
            overview: filteredOverview.metrics || filteredOverview,
            alerts: filteredAlerts,
            lastUpdated: new Date().toISOString()
        },
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

// Export dashboard data
exports.exportDashboardData = asyncHandler(async (req, res, next) => {
    const { timeRange = 30, format = 'json' } = req.query;
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Check if staff has permission to export data
    if (userContext.isStaff && !CoachStaffService.hasPermission(req, SECTIONS.DASHBOARD.VIEW)) {
        return res.status(403).json({
            success: false,
            message: 'No permission to export data'
        });
    }
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'export', 'dashboard', 'data', { coachId, format });

    const dashboardData = await coachDashboardService.getDashboardData(
        coachId, 
        parseInt(timeRange)
    );

    // Filter response data based on staff permissions
    const filteredData = CoachStaffService.filterResponseData(req, dashboardData, 'dashboard');

    if (format === 'csv') {
        // Convert to CSV format
        const csvData = convertToCSV(filteredData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=dashboard-data.csv');
        return res.send(csvData);
    }

    res.json({
        success: true,
        data: filteredData,
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

// ===== NEW: CALENDAR & APPOINTMENT MANAGEMENT =====

// Get coach's calendar for a date range
exports.getCalendar = asyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Check if staff has permission to view calendar
    if (userContext.isStaff && !CoachStaffService.hasPermission(req, SECTIONS.CALENDAR.VIEW)) {
        return res.json({
            success: true,
            data: { message: 'No data found' },
            userContext: {
                isStaff: userContext.isStaff,
                permissions: userContext.permissions
            }
        });
    }

    if (!startDate || !endDate) {
        return res.status(400).json({
            success: false,
            message: 'Both startDate and endDate are required'
        });
    }
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'calendar', 'view', { coachId, startDate, endDate });

    let calendar = await calendarService.getCoachCalendar(coachId, startDate, endDate);

    // If user is staff, filter to show only their assigned appointments
    if (userContext.isStaff) {
        calendar = calendar.filter(appointment => 
            appointment.assignedStaffId && 
            appointment.assignedStaffId.toString() === userContext.userId.toString()
        );
    }

    // Filter response data based on staff permissions
    const filteredCalendar = CoachStaffService.filterResponseData(req, calendar, 'appointments');

    res.json({
        success: true,
        data: filteredCalendar,
        dateRange: { startDate, endDate },
        count: filteredCalendar.length,
        userContext: {
            isStaff: userContext.isStaff,
            userId: userContext.userId,
            permissions: userContext.permissions
        }
    });
});

// Get available booking slots for a specific date
exports.getAvailableSlots = asyncHandler(async (req, res, next) => {
    const { date } = req.query;
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Check if staff has permission to view available slots
    if (userContext.isStaff && !CoachStaffService.hasPermission(req, SECTIONS.CALENDAR.VIEW)) {
        return res.json({
            success: true,
            data: { message: 'No data found' },
            userContext: {
                isStaff: userContext.isStaff,
                permissions: userContext.permissions
            }
        });
    }

    if (!date) {
        return res.status(400).json({
            success: false,
            message: 'Date is required'
        });
    }
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'calendar', 'slots', { coachId, date });

    const slots = await calendarService.getAvailableSlots(coachId, date);

    // Filter response data based on staff permissions
    const filteredSlots = CoachStaffService.filterResponseData(req, slots, 'appointments');

    res.json({
        success: true,
        data: filteredSlots,
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

// Book a new appointment
exports.bookAppointment = asyncHandler(async (req, res, next) => {
    const { leadId, startTime, duration, notes, timeZone } = req.body;
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Check if staff has permission to book appointments
    if (userContext.isStaff && !CoachStaffService.hasPermission(req, SECTIONS.CALENDAR.BOOK)) {
        return res.status(403).json({
            success: false,
            message: 'No permission to book appointments'
        });
    }

    if (!leadId || !startTime || !duration) {
        return res.status(400).json({
            success: false,
            message: 'leadId, startTime, and duration are required'
        });
    }
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'create', 'appointment', 'book', { coachId, leadId, startTime });

    const appointment = await calendarService.bookAppointment(
        coachId, 
        leadId, 
        startTime, 
        duration, 
        notes, 
        timeZone
    );

    // Filter response data based on staff permissions
    const filteredAppointment = CoachStaffService.filterResponseData(req, appointment, 'appointments');

    res.status(201).json({
        success: true,
        message: 'Appointment booked successfully',
        data: filteredAppointment,
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

// Get upcoming appointments
exports.getUpcomingAppointments = asyncHandler(async (req, res, next) => {
    const { limit = 10 } = req.query;
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Check if staff has permission to view appointments
    if (userContext.isStaff && !CoachStaffService.hasPermission(req, SECTIONS.CALENDAR.VIEW)) {
        return res.json({
            success: true,
            data: { message: 'No data found' },
            userContext: {
                isStaff: userContext.isStaff,
                permissions: userContext.permissions
            }
        });
    }
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'appointments', 'upcoming', { coachId, limit });

    let appointments = await calendarService.getUpcomingAppointments(coachId, parseInt(limit));

    // If user is staff, filter to show only their assigned appointments
    if (userContext.isStaff) {
        appointments = appointments.filter(appointment => 
            appointment.assignedStaffId && 
            appointment.assignedStaffId.toString() === userContext.userId.toString()
        );
    }

    // Filter response data based on staff permissions
    const filteredAppointments = CoachStaffService.filterResponseData(req, appointments, 'appointments');

    res.json({
        success: true,
        data: filteredAppointments,
        count: filteredAppointments.length,
        userContext: {
            isStaff: userContext.isStaff,
            userId: userContext.userId,
            permissions: userContext.permissions
        }
    });
});

// Get today's appointments
exports.getTodayAppointments = asyncHandler(async (req, res, next) => {
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Check if staff has permission to view appointments
    if (userContext.isStaff && !CoachStaffService.hasPermission(req, 'calendar:read')) {
        return res.json({
            success: true,
            data: { message: 'No data found' },
            userContext: {
                isStaff: userContext.isStaff,
                permissions: userContext.permissions
            }
        });
    }
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'appointments', 'today', { coachId });

    let appointments = await calendarService.getTodayAppointments(coachId);

    // If user is staff, filter to show only their assigned appointments
    if (userContext.isStaff) {
        appointments = appointments.filter(appointment => 
            appointment.assignedStaffId && 
            appointment.assignedStaffId.toString() === userContext.userId.toString()
        );
    }

    // Filter response data based on staff permissions
    const filteredAppointments = CoachStaffService.filterResponseData(req, appointments, 'appointments');

    const today = new Date().toISOString().split('T')[0];

    res.json({
        success: true,
        data: filteredAppointments,
        date: today,
        count: filteredAppointments.length,
        userContext: {
            isStaff: userContext.isStaff,
            userId: userContext.userId,
            permissions: userContext.permissions
        }
    });
});

// Reschedule an appointment
exports.rescheduleAppointment = asyncHandler(async (req, res, next) => {
    const { appointmentId } = req.params;
    const { newStartTime, newDuration } = req.body;
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Check if staff has permission to reschedule appointments
    if (userContext.isStaff && !CoachStaffService.hasPermission(req, SECTIONS.CALENDAR.RESCHEDULE)) {
        return res.status(403).json({
            success: false,
            message: 'No permission to reschedule appointments'
        });
    }

    if (!newStartTime) {
        return res.status(400).json({
            success: false,
            message: 'newStartTime is required'
        });
    }
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'update', 'appointment', 'reschedule', { coachId, appointmentId, newStartTime });

    const appointment = await calendarService.rescheduleAppointment(
        appointmentId, 
        coachId, 
        newStartTime, 
        newDuration
    );

    // Filter response data based on staff permissions
    const filteredAppointment = CoachStaffService.filterResponseData(req, appointment, 'appointments');

    res.json({
        success: true,
        message: 'Appointment rescheduled successfully',
        data: filteredAppointment,
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

// Cancel an appointment
exports.cancelAppointment = asyncHandler(async (req, res, next) => {
    const { appointmentId } = req.params;
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Check if staff has permission to cancel appointments
    if (userContext.isStaff && !CoachStaffService.hasPermission(req, SECTIONS.CALENDAR.DELETE)) {
        return res.status(403).json({
            success: false,
            message: 'No permission to cancel appointments'
        });
    }
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'delete', 'appointment', 'cancel', { coachId, appointmentId });

    const result = await calendarService.cancelAppointment(appointmentId, coachId);

    res.json({
        success: true,
        message: result.message,
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

// Get appointment statistics
exports.getAppointmentStats = asyncHandler(async (req, res, next) => {
    const { timeRange = 30 } = req.query;
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Check if staff has permission to view appointment stats
    if (userContext.isStaff && !CoachStaffService.hasPermission(req, SECTIONS.CALENDAR.VIEW)) {
        return res.json({
            success: true,
            data: { message: 'No data found' },
            userContext: {
                isStaff: userContext.isStaff,
                permissions: userContext.permissions
            }
        });
    }
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'appointments', 'stats', { coachId, timeRange });

    const stats = await calendarService.getAppointmentStats(coachId, parseInt(timeRange));

    // Filter response data based on staff permissions
    const filteredStats = CoachStaffService.filterResponseData(req, stats, 'appointments');

    res.json({
        success: true,
        data: filteredStats,
        userContext: {
            isStaff: userContext.isStaff,
            permissions: userContext.permissions
        }
    });
});

// Get coach availability settings
exports.getAvailability = asyncHandler(async (req, res, next) => {
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Check if staff has permission to view availability settings
    if (userContext.isStaff && !CoachStaffService.hasPermission(req, SECTIONS.CALENDAR.VIEW)) {
        return res.json({
            success: true,
            data: { message: 'No data found' },
            userContext: {
                isStaff: userContext.isStaff,
                permissions: userContext.permissions
            }
        });
    }
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'calendar', 'availability', { coachId });

    let availability;
    
    // If staff token, get staff's own availability
    if (userContext.isStaff) {
        const StaffAvailability = require('../schema/StaffAvailability');
        availability = await StaffAvailability.findOne({ staffId: userContext.userId });
        
        // If staff has no availability yet, auto-create from coach settings
        if (!availability) {
            const coachAvailability = await calendarService.getCoachAvailability(coachId);
            if (coachAvailability) {
                availability = await StaffAvailability.create({
                    staffId: userContext.userId,
                    coachId: coachId,
                    workingHours: coachAvailability.workingHours,
                    unavailableSlots: [],
                    defaultAppointmentDuration: coachAvailability.defaultAppointmentDuration,
                    bufferTime: coachAvailability.bufferTime,
                    timeZone: coachAvailability.timeZone,
                    copiedFromCoach: true,
                    lastSyncedWithCoach: new Date()
                });
                console.log(`[Dashboard] Auto-created staff availability from coach settings`);
            }
        }
    } else {
        // If coach token, get coach availability
        availability = await calendarService.getCoachAvailability(coachId);
    }

    // Filter response data based on staff permissions
    const filteredAvailability = CoachStaffService.filterResponseData(req, availability, 'appointments');

    res.json({
        success: true,
        data: filteredAvailability,
        userContext: {
            isStaff: userContext.isStaff,
            userId: userContext.userId,
            permissions: userContext.permissions
        }
    });
});

// Set availability settings (Coach or Staff)
exports.setAvailability = asyncHandler(async (req, res, next) => {
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    const availabilityData = req.body;
    
    // Check if staff has permission to manage availability settings
    if (userContext.isStaff && !CoachStaffService.hasPermission(req, SECTIONS.CALENDAR.MANAGE)) {
        return res.status(403).json({
            success: false,
            message: 'No permission to manage availability settings'
        });
    }
    
    // Check if user has Zoom integration before allowing availability setup
    const zoomMeetingService = require('../services/zoomMeetingService');
    const targetUserId = userContext.isStaff ? userContext.userId : coachId;
    const hasZoom = await zoomMeetingService.hasValidZoomIntegration(targetUserId);
    if (!hasZoom) {
        return res.status(403).json({
            success: false,
            message: 'You must connect your Zoom account before setting availability',
            requiresZoomIntegration: true,
            userType: userContext.isStaff ? 'staff' : 'coach'
        });
    }
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'update', 'calendar', 'availability', { coachId, availabilityData });

    let availability;
    
    if (userContext.isStaff) {
        // Update staff availability
        const StaffAvailability = require('../schema/StaffAvailability');
        availability = await StaffAvailability.findOneAndUpdate(
            { staffId: userContext.userId },
            {
                coachId,
                ...availabilityData,
                hasZoomIntegration: true,
                zoomIntegrationStatus: 'active',
                copiedFromCoach: false
            },
            { new: true, upsert: true, runValidators: true }
        );
        console.log(`[Dashboard] Updated staff availability for staff ${userContext.userId}`);
    } else {
        // Update coach availability
        availability = await calendarService.setCoachAvailability(coachId, {
            ...availabilityData,
            hasZoomIntegration: true,
            zoomIntegrationStatus: 'active'
        });
        console.log(`[Dashboard] Updated coach availability for coach ${coachId}`);
    }

    // Filter response data based on staff permissions
    const filteredAvailability = CoachStaffService.filterResponseData(req, availability, 'appointments');

    res.json({
        success: true,
        message: userContext.isStaff ? 'Staff availability updated successfully' : 'Coach availability updated successfully',
        data: filteredAvailability,
        userContext: {
            isStaff: userContext.isStaff,
            userId: userContext.userId,
            permissions: userContext.permissions
        }
    });
});

// Copy coach availability to staff (Staff only)
exports.copyCoachAvailabilityToStaff = asyncHandler(async (req, res, next) => {
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Only staff can use this endpoint
    if (!userContext.isStaff) {
        return res.status(403).json({
            success: false,
            message: 'This endpoint is for staff members only'
        });
    }
    
    // Get coach availability
    const coachAvailability = await calendarService.getCoachAvailability(coachId);
    if (!coachAvailability) {
        return res.status(404).json({
            success: false,
            message: 'Coach availability settings not found'
        });
    }
    
    // Copy to staff
    const StaffAvailability = require('../schema/StaffAvailability');
    const availability = await StaffAvailability.findOneAndUpdate(
        { staffId: userContext.userId },
        {
            coachId,
            workingHours: coachAvailability.workingHours,
            unavailableSlots: [],
            defaultAppointmentDuration: coachAvailability.defaultAppointmentDuration,
            bufferTime: coachAvailability.bufferTime,
            timeZone: coachAvailability.timeZone,
            copiedFromCoach: true,
            lastSyncedWithCoach: new Date()
        },
        { new: true, upsert: true, runValidators: true }
    );
    
    res.json({
        success: true,
        message: 'Coach availability copied to staff successfully',
        data: availability,
        userContext: {
            isStaff: true,
            userId: userContext.userId
        }
    });
});

// Check Zoom integration status
exports.checkZoomStatus = asyncHandler(async (req, res, next) => {
    const userContext = CoachStaffService.getUserContext(req);
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const targetUserId = userContext.isStaff ? userContext.userId : coachId;
    
    const zoomMeetingService = require('../services/zoomMeetingService');
    const hasZoom = await zoomMeetingService.hasValidZoomIntegration(targetUserId);
    
    res.json({
        success: true,
        data: {
            hasZoomIntegration: hasZoom,
            userId: targetUserId,
            userType: userContext.isStaff ? 'staff' : 'coach'
        },
        userContext: {
            isStaff: userContext.isStaff,
            userId: userContext.userId
        }
    });
});

// Helper function to convert data to CSV
function convertToCSV(data) {
    // This is a simplified CSV conversion
    // In a real implementation, you'd want a more robust CSV library
    const lines = [];
    
    // Add headers
    lines.push('Metric,Value');
    
    // Add overview metrics
    Object.entries(data.overview.metrics).forEach(([key, value]) => {
        lines.push(`${key},${value}`);
    });
    
    return lines.join('\n');
}

// ===== ZOOM MEETINGS MANAGEMENT =====

// Get all Zoom meetings for the coach
exports.getZoomMeetings = asyncHandler(async (req, res, next) => {
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Check if staff has permission to view Zoom meetings
    if (userContext.isStaff && !CoachStaffService.hasPermission(req, SECTIONS.CALENDAR.VIEW)) {
        return res.json({
            success: true,
            data: { message: 'No data found' },
            userContext: {
                isStaff: userContext.isStaff,
                permissions: userContext.permissions
            }
        });
    }
    
    const zoomService = require('../services/zoomService');
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'zoom', 'meetings', { coachId });

    try {
        const meetings = await zoomService.getCoachZoomMeetings(coachId);
        
        // Filter response data based on staff permissions
        const filteredMeetings = CoachStaffService.filterResponseData(req, meetings, 'appointments');
        
        res.json({
            success: true,
            data: filteredMeetings,
            userContext: {
                isStaff: userContext.isStaff,
                permissions: userContext.permissions
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get Zoom meeting details for a specific appointment
exports.getZoomMeetingDetails = asyncHandler(async (req, res, next) => {
    const { appointmentId } = req.params;
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Check if staff has permission to view Zoom meeting details
    if (userContext.isStaff && !CoachStaffService.hasPermission(req, SECTIONS.CALENDAR.VIEW)) {
        return res.json({
            success: true,
            data: { message: 'No data found' },
            userContext: {
                isStaff: userContext.isStaff,
                permissions: userContext.permissions
            }
        });
    }
    
    const zoomService = require('../services/zoomService');
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'zoom', 'meeting_details', { coachId, appointmentId });

    try {
        const meetingDetails = await zoomService.getZoomMeetingForAppointment(appointmentId, coachId);
        
        // Filter response data based on staff permissions
        const filteredMeetingDetails = CoachStaffService.filterResponseData(req, meetingDetails, 'appointments');
        
        res.json({
            success: true,
            data: filteredMeetingDetails,
            userContext: {
                isStaff: userContext.isStaff,
                permissions: userContext.permissions
            }
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
});
