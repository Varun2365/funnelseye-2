const StaffCalendar = require('../schema/StaffCalendar');
const Staff = require('../schema/Staff');
const User = require('../schema/User');
const { hasPermission } = require('../utils/unifiedPermissions');
const CoachStaffService = require('../services/coachStaffService');

/**
 * Staff Calendar Controller
 * Handles all calendar operations for staff members
 */

// Helper function to ensure staff can only access their own calendar or coach can access staff calendar
function ensureCalendarAccess(req, calendarDoc) {
    const userContext = CoachStaffService.getUserContext(req);
    
    if (userContext.role === 'admin' || userContext.role === 'super_admin') return true;
    
    if (userContext.role === 'coach') {
        // Coach can access any staff calendar under them
        if (String(calendarDoc.coachId) === String(userContext.coachId)) return true;
    }
    
    if (userContext.role === 'staff') {
        // Staff can only access their own calendar
        if (String(calendarDoc.staffId) === String(userContext.userId)) return true;
    }
    
    const err = new Error('Access denied');
    err.statusCode = 403;
    throw err;
}

// POST /api/staff-calendar
// Create a new calendar event
exports.createCalendarEvent = async (req, res) => {
    try {
        const {
            staffId,
            eventType,
            title,
            description,
            startTime,
            endTime,
            priority,
            isRecurring,
            recurrencePattern,
            relatedTask,
            relatedLead,
            location,
            attendees,
            notes,
            tags,
            color,
            isPublic,
            reminder
        } = req.body;

        // Validate required fields
        if (!staffId || !eventType || !title || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: 'staffId, eventType, title, startTime, and endTime are required'
            });
        }

        // Validate time logic
        if (new Date(startTime) >= new Date(endTime)) {
            return res.status(400).json({
                success: false,
                message: 'startTime must be before endTime'
            });
        }

        // Check if staff exists and get coachId
        const staff = await User.findOne({ _id: staffId, role: 'staff' });
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        // Check permissions
        if (req.role === 'staff') {
            if (!hasPermission(req.staffPermissions, 'calendar:write')) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions to create calendar events'
                });
            }
            // Staff can only create events for themselves
            if (String(staffId) !== String(req.userId)) {
                return res.status(403).json({
                    success: false,
                    message: 'Staff can only create events for themselves'
                });
            }
        }

        // Check for overlapping events
        const overlapping = await StaffCalendar.findOverlapping(staffId, startTime, endTime);
        if (overlapping.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Event overlaps with existing calendar events',
                overlappingEvents: overlapping.map(e => ({
                    id: e._id,
                    title: e.title,
                    startTime: e.startTime,
                    endTime: e.endTime
                }))
            });
        }

        const calendarEvent = await StaffCalendar.create({
            staffId,
            coachId: staff.coachId,
            eventType,
            title,
            description,
            startTime,
            endTime,
            priority,
            isRecurring,
            recurrencePattern,
            relatedTask,
            relatedLead,
            location,
            attendees,
            notes,
            tags,
            color,
            isPublic,
            reminder,
            metadata: {
                createdBy: req.userId,
                lastModifiedBy: req.userId,
                source: 'manual'
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Calendar event created successfully',
            data: calendarEvent
        });

    } catch (err) {
        console.error('createCalendarEvent error:', err.message);
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
};

// GET /api/staff-calendar
// Get calendar events for staff (filtered by permissions)
exports.getCalendarEvents = async (req, res) => {
    try {
        const {
            staffId,
            coachId,
            startDate,
            endDate,
            eventType,
            status,
            limit = 50,
            page = 1
        } = req.query;

        // Build query
        const query = {};

        if (staffId) {
            query.staffId = staffId;
        }

        if (coachId) {
            query.coachId = coachId;
        }

        if (eventType) {
            query.eventType = eventType;
        }

        if (status) {
            query.status = status;
        }

        // Permission-based filtering
        if (req.role === 'staff') {
            if (!hasPermission(req.staffPermissions, 'calendar:read')) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions to view calendar events'
                });
            }
            // Staff can only see their own events and public events
            query.$or = [
                { staffId: req.userId },
                { isPublic: true }
            ];
        } else if (req.role === 'coach') {
            // Coach can see events for their staff
            if (!query.coachId) {
                query.coachId = req.coachId;
            }
        }

        // Date filtering - apply after permission filtering to avoid conflicts
        if (startDate && endDate) {
            query.startTime = { $lt: new Date(endDate) }; // Event starts before endDate
            query.endTime = { $gt: new Date(startDate) };  // Event ends after startDate
        }

        // Debug: Log the final query
        console.log('Calendar query:', JSON.stringify(query, null, 2));

        const skip = (page - 1) * limit;
        const events = await StaffCalendar.find(query)
            .populate({
                path: 'staffId',
                select: 'name email role',
                match: { role: 'staff' }
            })
            .populate('relatedTask', 'name status')
            .populate('relatedLead', 'name email phone')
            .sort({ startTime: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await StaffCalendar.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: events,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (err) {
        console.error('getCalendarEvents error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// GET /api/staff-calendar/:id
// Get specific calendar event
exports.getCalendarEvent = async (req, res) => {
    try {
        const event = await StaffCalendar.findById(req.params.id)
            .populate({
                path: 'staffId',
                select: 'name email role',
                match: { role: 'staff' }
            })
            .populate('relatedTask', 'name status')
            .populate('relatedLead', 'name email phone');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Calendar event not found'
            });
        }

        // Check access permissions
        ensureCalendarAccess(req, event);

        return res.status(200).json({
            success: true,
            data: event
        });

    } catch (err) {
        console.error('getCalendarEvent error:', err.message);
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
};

// PUT /api/staff-calendar/:id
// Update calendar event
exports.updateCalendarEvent = async (req, res) => {
    try {
        const event = await StaffCalendar.findById(req.params.id);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Calendar event not found'
            });
        }

        // Check access permissions
        ensureCalendarAccess(req, event);

        // Check permissions for staff
        if (req.role === 'staff') {
            if (!hasPermission(req.staffPermissions, 'calendar:update')) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions to update calendar events'
                });
            }
        }

        const updates = req.body;
        delete updates.staffId; // Prevent changing staff assignment
        delete updates.coachId; // Prevent changing coach assignment

        // Check for overlapping events if time is being changed
        if (updates.startTime || updates.endTime) {
            const startTime = updates.startTime || event.startTime;
            const endTime = updates.endTime || event.endTime;
            
            if (new Date(startTime) >= new Date(endTime)) {
                return res.status(400).json({
                    success: false,
                    message: 'startTime must be before endTime'
                });
            }

            const overlapping = await StaffCalendar.findOverlapping(
                event.staffId,
                startTime,
                endTime,
                event._id
            );
            
            if (overlapping.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Updated event overlaps with existing calendar events',
                    overlappingEvents: overlapping.map(e => ({
                        id: e._id,
                        title: e.title,
                        startTime: e.startTime,
                        endTime: e.endTime
                    }))
                });
            }
        }

        // Update metadata
        updates.metadata = {
            ...event.metadata,
            lastModifiedBy: req.userId
        };

        const updatedEvent = await StaffCalendar.findByIdAndUpdate(
            event._id,
            { $set: updates },
            { new: true }
        ).populate({
            path: 'staffId',
            select: 'name email role',
            match: { role: 'staff' }
        })
         .populate('relatedTask', 'name status')
         .populate('relatedLead', 'name email phone');

        return res.status(200).json({
            success: true,
            message: 'Calendar event updated successfully',
            data: updatedEvent
        });

    } catch (err) {
        console.error('updateCalendarEvent error:', err.message);
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
};

// DELETE /api/staff-calendar/:id
// Delete calendar event
exports.deleteCalendarEvent = async (req, res) => {
    try {
        const event = await StaffCalendar.findById(req.params.id);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Calendar event not found'
            });
        }

        // Check access permissions
        ensureCalendarAccess(req, event);

        // Check permissions for staff
        if (req.role === 'staff') {
            if (!hasPermission(req.staffPermissions, 'calendar:delete')) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions to delete calendar events'
                });
            }
        }

        await StaffCalendar.findByIdAndDelete(event._id);

        return res.status(200).json({
            success: true,
            message: 'Calendar event deleted successfully'
        });

    } catch (err) {
        console.error('deleteCalendarEvent error:', err.message);
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
};

// GET /api/staff-calendar/staff/:staffId/availability
// Get staff availability for a time range
exports.getStaffAvailability = async (req, res) => {
    try {
        const { staffId } = req.params;
        const { startTime, endTime } = req.query;

        if (!startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: 'startTime and endTime query parameters are required'
            });
        }

        // Check permissions
        if (req.role === 'staff') {
            if (!hasPermission(req.staffPermissions, 'calendar:read')) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions to view availability'
                });
            }
            // Staff can only see their own availability
            if (String(staffId) !== String(req.userId)) {
                return res.status(403).json({
                    success: false,
                    message: 'Staff can only view their own availability'
                });
            }
        }

        const availability = await StaffCalendar.getAvailability(staffId, startTime, endTime);

        return res.status(200).json({
            success: true,
            data: availability
        });

    } catch (err) {
        console.error('getStaffAvailability error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// POST /api/staff-calendar/bulk-create
// Create multiple calendar events (for recurring events)
exports.bulkCreateEvents = async (req, res) => {
    try {
        const { events } = req.body;

        if (!Array.isArray(events) || events.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'events array is required'
            });
        }

        // Check permissions
        if (req.role === 'staff') {
            if (!hasPermission(req.staffPermissions, 'calendar:write')) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions to create calendar events'
                });
            }
        }

        const createdEvents = [];
        const errors = [];

        for (const eventData of events) {
            try {
                // Validate each event
                if (!eventData.staffId || !eventData.eventType || !eventData.title || !eventData.startTime || !eventData.endTime) {
                    errors.push({
                        event: eventData,
                        error: 'Missing required fields'
                    });
                    continue;
                }

                // Check if staff exists
                const staff = await User.findOne({ _id: eventData.staffId, role: 'staff' });
                if (!staff) {
                    errors.push({
                        event: eventData,
                        error: 'Staff member not found'
                    });
                    continue;
                }

                // Check for overlapping events
                const overlapping = await StaffCalendar.findOverlapping(
                    eventData.staffId,
                    eventData.startTime,
                    eventData.endTime
                );

                if (overlapping.length > 0) {
                    errors.push({
                        event: eventData,
                        error: 'Event overlaps with existing calendar events'
                    });
                    continue;
                }

                const event = await StaffCalendar.create({
                    ...eventData,
                    coachId: staff.coachId,
                    metadata: {
                        createdBy: req.userId,
                        lastModifiedBy: req.userId,
                        source: 'bulk_create'
                    }
                });

                createdEvents.push(event);

            } catch (error) {
                errors.push({
                    event: eventData,
                    error: error.message
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: `Created ${createdEvents.length} events successfully`,
            data: {
                created: createdEvents.length,
                errors: errors.length,
                createdEvents,
                errors
            }
        });

    } catch (err) {
        console.error('bulkCreateEvents error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
