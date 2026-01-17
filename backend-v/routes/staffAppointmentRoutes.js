const express = require('express');
const router = express.Router();
const {
    unifiedCoachAuth,
    requirePermission,
    filterResourcesByPermission
} = require('../middleware/unifiedCoachAuth');
const { updateLastActive } = require('../middleware/activityMiddleware');
const { 
    assignAppointmentToStaff,
    getStaffAppointments,
    getAvailableStaff,
    unassignAppointment,
    getStaffCalendar,
    bulkAssignAppointments
} = require('../controllers/staffAppointmentController');

// All staff appointment routes are protected with unified authentication
router.use(unifiedCoachAuth(), updateLastActive, filterResourcesByPermission('appointments'));

// ===== APPOINTMENT ASSIGNMENT =====

// Assign appointment to staff member
router.post('/assign', requirePermission('appointments:manage'), assignAppointmentToStaff);

// Get available staff for assignment
router.get('/available-staff', requirePermission('appointments:read'), getAvailableStaff);

// Bulk assign appointments
router.post('/bulk-assign', requirePermission('appointments:manage'), bulkAssignAppointments);

// ===== STAFF APPOINTMENT MANAGEMENT =====

// Get appointments for specific staff member
router.get('/staff/:staffId', requirePermission('appointments:read'), getStaffAppointments);

// Get staff calendar view
router.get('/staff/:staffId/calendar', requirePermission('appointments:read'), getStaffCalendar);

// ===== APPOINTMENT UNASSIGNMENT =====

// Unassign appointment from staff
router.put('/:appointmentId/unassign', requirePermission('appointments:manage'), unassignAppointment);

module.exports = router;
