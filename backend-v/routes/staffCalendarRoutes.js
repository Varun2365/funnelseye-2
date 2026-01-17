const express = require('express');
const router = express.Router();
const {
    unifiedCoachAuth,
    requirePermission,
    filterResourcesByPermission
} = require('../middleware/unifiedCoachAuth');
const { updateLastActive } = require('../middleware/activityMiddleware');
const { 
    createCalendarEvent,
    getCalendarEvents,
    getCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    getStaffAvailability,
    bulkCreateEvents
} = require('../controllers/staffCalendarController');

// All calendar routes are protected with unified authentication
router.use(unifiedCoachAuth(), updateLastActive, filterResourcesByPermission('calendar'));

// Calendar event management
router.post('/', requirePermission('calendar:write'), createCalendarEvent);
router.get('/', requirePermission('calendar:read'), getCalendarEvents);
router.get('/:id', requirePermission('calendar:read'), getCalendarEvent);
router.put('/:id', requirePermission('calendar:update'), updateCalendarEvent);
router.delete('/:id', requirePermission('calendar:delete'), deleteCalendarEvent);

// Staff availability
router.get('/staff/:staffId/availability', requirePermission('calendar:read'), getStaffAvailability);

// Bulk operations
router.post('/bulk-create', requirePermission('calendar:manage'), bulkCreateEvents);

module.exports = router;
