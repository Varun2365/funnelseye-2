// D:\PRJ_YCT_Final\routes\dailyPriorityFeedRoutes.js

const express = require('express');
const { getDailyPriorityFeed } = require('../controllers/dailyPriorityFeedController');
const { 
    getCoachAvailability, 
    setCoachAvailability, 
    getAvailableSlots, 
    bookAppointment, 
    getCoachCalendar,
    getAppointmentDetails,
    rescheduleAppointment,
    cancelAppointment,
    getAssignmentSettings,
    updateAssignmentSettings,
    getAssignmentStats,
    getReminderSettings,
    updateReminderSettings,
    copyCoachAvailability,
    getZoomStatus
} = require('../controllers/coachAvailabilityController');
const { 
    initiateBookingRecovery, 
    cancelBookingRecovery 
} = require('../controllers/bookingRecoveryController');
const { 
    unifiedCoachAuth, 
    requirePermission, 
    checkResourceOwnership,
    filterResourcesByPermission 
} = require('../middleware/unifiedCoachAuth');
const { updateLastActive } = require('../middleware/activityMiddleware');

const router = express.Router();

// ===== PUBLIC BOOKING ROUTES (NO AUTHENTICATION) =====
// These routes are accessible without authentication for public appointment booking

// Get coach availability settings (public)
router.get('/:coachId/availability', getCoachAvailability);

// Get available time slots for a coach (public)
router.get('/:coachId/available-slots', getAvailableSlots);

// Get coach calendar view (public - shows only available/booked status, not details)
router.get('/:coachId/calendar', getCoachCalendar);

// Book an appointment (public - no authentication required)
router.post('/:coachId/book', bookAppointment);

// Booking Recovery Routes (public)
router.post('/booking-recovery/initiate', initiateBookingRecovery);
router.post('/booking-recovery/cancel', cancelBookingRecovery);

// ===== PROTECTED ROUTES (AUTHENTICATION REQUIRED) =====
// Apply unified authentication and resource filtering to remaining routes
router.use(unifiedCoachAuth(), updateLastActive, filterResourcesByPermission('dashboard'));

// --- Main Coach & Feed Routes ---
router.get('/daily-feed', requirePermission('dashboard:read'), getDailyPriorityFeed);

// --- Coach Availability Management (Protected) ---
router.post('/availability', requirePermission('calendar:manage'), setCoachAvailability);

// --- Appointment Management (Protected) ---
router.get('/appointments/:id', requirePermission('calendar:read'), getAppointmentDetails);
router.put('/appointments/:id/reschedule', requirePermission('calendar:update'), rescheduleAppointment);
router.delete('/appointments/:id', requirePermission('calendar:delete'), cancelAppointment);

// --- Assignment Settings (Coach Only) ---
router.get('/availability/assignment-settings', requirePermission('calendar:manage'), getAssignmentSettings);
router.put('/availability/assignment-settings', requirePermission('calendar:manage'), updateAssignmentSettings);
router.get('/availability/assignment-stats', requirePermission('calendar:manage'), getAssignmentStats);

// --- Reminder Settings (Coach Only) ---
router.get('/availability/reminder-settings', requirePermission('calendar:manage'), getReminderSettings);
router.put('/availability/reminder-settings', requirePermission('calendar:manage'), updateReminderSettings);

// --- Staff Availability Management (Staff using same endpoints) ---
router.post('/availability/copy-from-coach', requirePermission('calendar:read'), copyCoachAvailability);
router.get('/availability/zoom-status', requirePermission('calendar:read'), getZoomStatus);

module.exports = router;