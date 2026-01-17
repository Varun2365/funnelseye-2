const express = require('express');
const router = express.Router();
const { 
    getDashboardData, 
    getOverviewData, 
    getLeadsData, 
    getTasksData, 
    getMarketingData, 
    getFinancialData, 
    getTeamData, 
    getPerformanceData, 
    getDashboardWidgets, 
    getWidgetData, 
    getPerformanceTrends, 
    getPerformanceAlerts, 
    getAIInsights, 
    getKPIs, 
    getDashboardSections, 
    getRealTimeUpdates, 
    exportDashboardData,
    // NEW: Calendar & Appointment Management
    getCalendar,
    getAvailableSlots,
    bookAppointment,
    getUpcomingAppointments,
    getTodayAppointments,
    rescheduleAppointment,
    cancelAppointment,
    getAppointmentStats,
    getAvailability,
    setAvailability,
    copyCoachAvailabilityToStaff,
    checkZoomStatus,
    // NEW: Zoom Meetings Management
    getZoomMeetings,
    getZoomMeetingDetails
} = require('../controllers/coachDashboardController');
const { 
    unifiedCoachAuth,
    requireDashboardPermission,
    requirePerformancePermission,
    requireCalendarPermission,
    requireLeadPermission,
    requireTaskPermission,
    requireAIPermission
} = require('../middleware/unifiedCoachAuth');
const { updateLastActive } = require('../middleware/activityMiddleware');

// Apply unified authentication middleware to all routes
router.use(unifiedCoachAuth(), updateLastActive);

// ===== DASHBOARD DATA ENDPOINTS =====

// Get complete dashboard data
router.get('/data', requireDashboardPermission('overview'), getDashboardData);

// Get specific dashboard sections
router.get('/overview', requireDashboardPermission('overview'), getOverviewData);
router.get('/leads', requireDashboardPermission('leads'), getLeadsData);
router.get('/tasks', requireDashboardPermission('tasks'), getTasksData);
router.get('/marketing', requireDashboardPermission('marketing'), getMarketingData);
router.get('/financial', requireDashboardPermission('financial'), getFinancialData);
router.get('/team', requireDashboardPermission('team'), getTeamData);
router.get('/performance', requireDashboardPermission('performance'), getPerformanceData);

// Get dashboard widgets
router.get('/widgets', requireDashboardPermission('overview'), getDashboardWidgets);
router.get('/widgets/:widgetId', requireDashboardPermission('overview'), getWidgetData);

// Get performance data
router.get('/trends', requirePerformancePermission('read'), getPerformanceTrends);
router.get('/alerts', requirePerformancePermission('read'), getPerformanceAlerts);
router.get('/ai-insights', requireAIPermission('read'), getAIInsights);
router.get('/kpis', requirePerformancePermission('read'), getKPIs);

// Get configuration and real-time data
router.get('/sections', requireDashboardPermission('overview'), getDashboardSections);
router.get('/real-time', requireDashboardPermission('overview'), getRealTimeUpdates);

// Export dashboard data
router.get('/export', requirePerformancePermission('read'), exportDashboardData);

// ===== NEW: CALENDAR & APPOINTMENT MANAGEMENT =====

// Calendar view and management
router.get('/calendar', requireCalendarPermission('read'), getCalendar);
router.get('/available-slots', requireCalendarPermission('read'), getAvailableSlots);

// Appointment management
router.post('/appointments', requireCalendarPermission('write'), bookAppointment);
router.get('/appointments/upcoming', requireCalendarPermission('read'), getUpcomingAppointments);
router.get('/appointments/today', requireCalendarPermission('read'), getTodayAppointments);
router.put('/appointments/:appointmentId/reschedule', requireCalendarPermission('update'), rescheduleAppointment);
router.delete('/appointments/:appointmentId', requireCalendarPermission('delete'), cancelAppointment);

// Appointment analytics
router.get('/appointments/stats', requireCalendarPermission('read'), getAppointmentStats);

// Coach availability settings (unified for coach & staff)
router.get('/availability', requireCalendarPermission('read'), getAvailability);
router.put('/availability', requireCalendarPermission('manage'), setAvailability);

// Staff availability helper endpoints
router.post('/availability/copy-from-coach', requireCalendarPermission('read'), copyCoachAvailabilityToStaff);
router.get('/availability/zoom-status', requireCalendarPermission('read'), checkZoomStatus);

// ===== ZOOM MEETINGS MANAGEMENT =====

// Get all Zoom meetings for the coach
router.get('/zoom-meetings', requireCalendarPermission('read'), getZoomMeetings);

// Get Zoom meeting details for a specific appointment
router.get('/zoom-meetings/appointment/:appointmentId', requireCalendarPermission('read'), getZoomMeetingDetails);

module.exports = router;
