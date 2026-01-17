const Appointment = require('../schema/Appointment');
const Staff = require('../schema/Staff');
const Lead = require('../schema/Lead');
const { hasPermission } = require('../utils/unifiedPermissions');
const CoachStaffService = require('../services/coachStaffService');

/**
 * Staff Appointment Controller
 * Handles staff appointment assignments and management
 */

// Helper function to ensure proper access control
function ensureAppointmentAccess(req, appointmentDoc) {
    const userContext = CoachStaffService.getUserContext(req);
    
    if (userContext.role === 'admin' || userContext.role === 'super_admin') return true;
    
    if (userContext.role === 'coach') {
        // Coach can access appointments they created
        if (String(appointmentDoc.coachId) === String(userContext.coachId)) return true;
    }
    
    if (userContext.role === 'staff') {
        // Staff can only access appointments assigned to them
        if (String(appointmentDoc.assignedStaffId) === String(userContext.userId)) return true;
    }
    
    const err = new Error('Access denied');
    err.statusCode = 403;
    throw err;
}

// POST /api/staff-appointments/assign
// Assign an appointment to a staff member
exports.assignAppointmentToStaff = async (req, res) => {
    try {
        const { appointmentId, staffId } = req.body;
        
        if (!appointmentId || !staffId) {
            return res.status(400).json({
                success: false,
                message: 'appointmentId and staffId are required'
            });
        }

        // Verify coach has permission to assign appointments
        if (req.role === 'coach' && !hasPermission(req.staffPermissions, 'calendar:manage')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to assign appointments'
            });
        }

        // Get the appointment
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Ensure coach owns the appointment
        if (req.role === 'coach' && String(appointment.coachId) !== String(req.coachId)) {
            return res.status(403).json({
                success: false,
                message: 'You can only assign your own appointments'
            });
        }

        // Verify staff member exists and belongs to the coach
        const staff = await Staff.findById(staffId);
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        if (req.role === 'coach' && String(staff.coachId) !== String(req.coachId)) {
            return res.status(403).json({
                success: false,
                message: 'You can only assign to your own staff members'
            });
        }

        // Check if staff has calendar permissions
        if (!hasPermission(staff.permissions, 'calendar:read')) {
            return res.status(400).json({
                success: false,
                message: 'Staff member does not have calendar permissions'
            });
        }

        // Assign the appointment
        appointment.assignedStaffId = staffId;
        await appointment.save();

        const populatedAppointment = await Appointment.findById(appointmentId)
            .populate('assignedStaffId', 'name email')
            .populate('leadId', 'name email phone');

        return res.status(200).json({
            success: true,
            message: 'Appointment assigned to staff successfully',
            data: populatedAppointment
        });

    } catch (err) {
        console.error('assignAppointmentToStaff error:', err.message);
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
};

// GET /api/staff-appointments/staff/:staffId
// Get all appointments assigned to a specific staff member
exports.getStaffAppointments = async (req, res) => {
    try {
        const { staffId } = req.params;
        const { startDate, endDate, status, page = 1, limit = 20 } = req.query;

        // Verify access permissions
        if (req.role === 'coach') {
            if (!hasPermission(req.staffPermissions, 'calendar:read')) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions to view appointments'
                });
            }

            // Verify staff belongs to coach
            const staff = await Staff.findById(staffId);
            if (!staff || String(staff.coachId) !== String(req.coachId)) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }
        } else if (req.role === 'staff') {
            // Staff can only view their own appointments
            if (String(staffId) !== String(req.userId)) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only view your own appointments'
                });
            }
        }

        // Build query
        const query = { assignedStaffId: staffId };
        
        if (startDate && endDate) {
            query.startTime = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;
        const appointments = await Appointment.find(query)
            .populate('leadId', 'name email phone')
            .populate('coachId', 'name email')
            .sort({ startTime: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Appointment.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: appointments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (err) {
        console.error('getStaffAppointments error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// GET /api/staff-appointments/available-staff
// Get available staff members for appointment assignment
exports.getAvailableStaff = async (req, res) => {
    try {
        const { appointmentDate, appointmentTime, duration = 30 } = req.query;

        if (!appointmentDate || !appointmentTime) {
            return res.status(400).json({
                success: false,
                message: 'appointmentDate and appointmentTime are required'
            });
        }

        // Verify coach permissions
        if (req.role === 'coach' && !hasPermission(req.staffPermissions, 'calendar:read')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to view staff availability'
            });
        }

        const filterCoachId = (req.role === 'admin' || req.role === 'super_admin') && req.query.coachId ? req.query.coachId : req.coachId;

        // Get all active staff members
        const staff = await Staff.find({ 
            coachId: filterCoachId, 
            isActive: true 
        }).select('name email permissions');

        // Filter staff with calendar permissions
        const availableStaff = staff.filter(member => 
            hasPermission(member.permissions, 'calendar:read')
        );

        // If specific time is provided, check for conflicts
        if (appointmentDate && appointmentTime) {
            const appointmentStart = new Date(`${appointmentDate}T${appointmentTime}`);
            const appointmentEnd = new Date(appointmentStart.getTime() + duration * 60000);

            const availableWithConflicts = await Promise.all(
                availableStaff.map(async (member) => {
                    // Check for conflicting appointments
                    const conflicts = await Appointment.find({
                        assignedStaffId: member._id,
                        startTime: { $lt: appointmentEnd },
                        $or: [
                            { 
                                startTime: { $gte: appointmentStart },
                                startTime: { $lt: appointmentEnd }
                            },
                            {
                                startTime: { $lte: appointmentStart },
                                $expr: {
                                    $gte: {
                                        $add: ['$startTime', { $multiply: ['$duration', 60000] }],
                                        appointmentStart
                                    }
                                }
                            }
                        ],
                        status: { $nin: ['cancelled'] }
                    });

                    return {
                        ...member.toObject(),
                        hasConflicts: conflicts.length > 0,
                        conflictCount: conflicts.length
                    };
                })
            );

            return res.status(200).json({
                success: true,
                data: availableWithConflicts,
                appointmentTime: {
                    start: appointmentStart,
                    end: appointmentEnd,
                    duration
                }
            });
        }

        return res.status(200).json({
            success: true,
            data: availableStaff
        });

    } catch (err) {
        console.error('getAvailableStaff error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// PUT /api/staff-appointments/:appointmentId/unassign
// Unassign an appointment from staff (make it coach-only)
exports.unassignAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;

        // Get the appointment
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Ensure proper access
        ensureAppointmentAccess(req, appointment);

        // Verify coach has permission
        if (req.role === 'coach' && !hasPermission(req.staffPermissions, 'calendar:manage')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to unassign appointments'
            });
        }

        // Unassign the appointment
        appointment.assignedStaffId = null;
        await appointment.save();

        const populatedAppointment = await Appointment.findById(appointmentId)
            .populate('leadId', 'name email phone')
            .populate('coachId', 'name email');

        return res.status(200).json({
            success: true,
            message: 'Appointment unassigned successfully',
            data: populatedAppointment
        });

    } catch (err) {
        console.error('unassignAppointment error:', err.message);
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
};

// GET /api/staff-appointments/staff/:staffId/calendar
// Get staff calendar view with appointments
exports.getStaffCalendar = async (req, res) => {
    try {
        const { staffId } = req.params;
        const { startDate, endDate } = req.query;

        // Verify access permissions
        if (req.role === 'coach') {
            if (!hasPermission(req.staffPermissions, 'calendar:read')) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions to view calendar'
                });
            }

            // Verify staff belongs to coach
            const staff = await Staff.findById(staffId);
            if (!staff || String(staff.coachId) !== String(req.coachId)) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }
        } else if (req.role === 'staff') {
            // Staff can only view their own calendar
            if (String(staffId) !== String(req.userId)) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only view your own calendar'
                });
            }
        }

        const start = startDate ? new Date(startDate) : new Date();
        const end = endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        // Get appointments
        const appointments = await Appointment.find({
            assignedStaffId: staffId,
            startTime: { $gte: start, $lte: end }
        }).populate('leadId', 'name email phone')
          .populate('coachId', 'name email')
          .sort({ startTime: 1 });

        // Get calendar events (from StaffCalendar)
        const StaffCalendar = require('../schema/StaffCalendar');
        const calendarEvents = await StaffCalendar.find({
            staffId,
            startTime: { $gte: start, $lte: end }
        }).sort({ startTime: 1 });

        return res.status(200).json({
            success: true,
            data: {
                appointments,
                calendarEvents,
                dateRange: { start, end }
            }
        });

    } catch (err) {
        console.error('getStaffCalendar error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// POST /api/staff-appointments/bulk-assign
// Bulk assign appointments to staff
exports.bulkAssignAppointments = async (req, res) => {
    try {
        const { assignments } = req.body;

        if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'assignments array is required'
            });
        }

        // Verify coach permissions
        if (req.role === 'coach' && !hasPermission(req.staffPermissions, 'calendar:manage')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to assign appointments'
            });
        }

        const results = [];
        const errors = [];

        for (const assignment of assignments) {
            try {
                const { appointmentId, staffId } = assignment;

                if (!appointmentId || !staffId) {
                    errors.push({
                        appointmentId,
                        staffId,
                        error: 'appointmentId and staffId are required'
                    });
                    continue;
                }

                // Get the appointment
                const appointment = await Appointment.findById(appointmentId);
                if (!appointment) {
                    errors.push({
                        appointmentId,
                        staffId,
                        error: 'Appointment not found'
                    });
                    continue;
                }

                // Ensure coach owns the appointment
                if (req.role === 'coach' && String(appointment.coachId) !== String(req.coachId)) {
                    errors.push({
                        appointmentId,
                        staffId,
                        error: 'You can only assign your own appointments'
                    });
                    continue;
                }

                // Verify staff member
                const staff = await Staff.findById(staffId);
                if (!staff) {
                    errors.push({
                        appointmentId,
                        staffId,
                        error: 'Staff member not found'
                    });
                    continue;
                }

                if (req.role === 'coach' && String(staff.coachId) !== String(req.coachId)) {
                    errors.push({
                        appointmentId,
                        staffId,
                        error: 'You can only assign to your own staff members'
                    });
                    continue;
                }

                // Assign the appointment
                appointment.assignedStaffId = staffId;
                await appointment.save();

                results.push({
                    appointmentId,
                    staffId,
                    success: true
                });

            } catch (error) {
                errors.push({
                    appointmentId: assignment.appointmentId,
                    staffId: assignment.staffId,
                    error: error.message
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: `Bulk assignment completed. ${results.length} successful, ${errors.length} failed.`,
            results,
            errors
        });

    } catch (err) {
        console.error('bulkAssignAppointments error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
