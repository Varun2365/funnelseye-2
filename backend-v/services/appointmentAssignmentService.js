// D:\PRJ_YCT_Final\services\appointmentAssignmentService.js

const Staff = require('../schema/Staff');
const User = require('../schema/User');
const Appointment = require('../schema/Appointment');
const CoachAvailability = require('../schema/CoachAvailability');
const StaffCalendar = require('../schema/StaffCalendar');
const zoomMeetingService = require('./zoomMeetingService');
const appointmentReminderService = require('./appointmentReminderService');

/**
 * Appointment Assignment Service
 * Handles automatic and manual staff assignment for appointments
 */

class AppointmentAssignmentService {
    /**
     * Get available staff members who can handle an appointment at a given time
     * @param {String} coachId - Coach ID
     * @param {Date} startTime - Appointment start time
     * @param {Number} duration - Appointment duration in minutes
     * @returns {Array} - Available staff with their load scores
     */
    async getAvailableStaffForSlot(coachId, startTime, duration) {
        try {
            // Get all active staff with calendar permissions
            const allStaff = await User.find({
                coachId: coachId,
                role: 'staff',
                isActive: true,
                permissions: { $in: ['calendar:read', 'calendar:book'] }
            }).select('_id name email permissions');

            if (allStaff.length === 0) {
                return [];
            }

            const appointmentStart = new Date(startTime);
            const appointmentEnd = new Date(appointmentStart.getTime() + duration * 60000);

            // Check each staff member for conflicts
            const staffAvailability = await Promise.all(
                allStaff.map(async (staff) => {
                    // Check for conflicting appointments
                    const appointmentConflicts = await Appointment.countDocuments({
                        assignedStaffId: staff._id,
                        startTime: { $lt: appointmentEnd },
                        $expr: {
                            $gt: [
                                { $add: ['$startTime', { $multiply: ['$duration', 60000] }] },
                                appointmentStart
                            ]
                        },
                        status: { $nin: ['cancelled', 'completed'] }
                    });

                    // Check for conflicting calendar events
                    const calendarConflicts = await StaffCalendar.countDocuments({
                        staffId: staff._id,
                        startTime: { $lt: appointmentEnd },
                        endTime: { $gt: appointmentStart },
                        status: { $ne: 'cancelled' }
                    });

                    const hasConflicts = (appointmentConflicts + calendarConflicts) > 0;

                    // Get staff's distribution ratio (higher = gets more appointments)
                    const staffDoc = await Staff.findOne({ userId: staff._id });
                    const distributionRatio = staffDoc?.distributionRatio || 1;

                    // Get current appointment load for the day
                    const dayStart = new Date(appointmentStart);
                    dayStart.setHours(0, 0, 0, 0);
                    const dayEnd = new Date(dayStart);
                    dayEnd.setHours(23, 59, 59, 999);

                    const todayAppointmentCount = await Appointment.countDocuments({
                        assignedStaffId: staff._id,
                        startTime: { $gte: dayStart, $lte: dayEnd },
                        status: { $nin: ['cancelled'] }
                    });

                    // Calculate load score (lower = less loaded, prioritize for assignment)
                    const loadScore = todayAppointmentCount / distributionRatio;

                    return {
                        staffId: staff._id,
                        name: staff.name,
                        email: staff.email,
                        isAvailable: !hasConflicts,
                        distributionRatio,
                        todayAppointmentCount,
                        loadScore,
                        hasConflicts
                    };
                })
            );

            // Filter to available staff only
            const availableStaff = staffAvailability.filter(s => s.isAvailable);

            // Sort by load score (ascending - assign to least loaded staff first)
            availableStaff.sort((a, b) => a.loadScore - b.loadScore);

            return availableStaff;
        } catch (error) {
            console.error('Error getting available staff for slot:', error);
            throw error;
        }
    }

    /**
     * Automatically assign an appointment to the best available staff member
     * @param {String} coachId - Coach ID
     * @param {String} appointmentId - Appointment ID
     * @returns {Object} - Assignment result
     */
    async autoAssignAppointment(coachId, appointmentId) {
        try {
            const appointment = await Appointment.findById(appointmentId);
            if (!appointment) {
                throw new Error('Appointment not found');
            }

            // Check if already assigned
            if (appointment.assignedStaffId) {
                return {
                    success: false,
                    message: 'Appointment is already assigned',
                    assignedTo: appointment.assignedStaffId
                };
            }

            // Get coach's assignment settings
            const coachSettings = await CoachAvailability.findOne({ coachId });
            if (!coachSettings?.appointmentAssignment?.enabled) {
                return {
                    success: false,
                    message: 'Staff assignment is not enabled for this coach'
                };
            }

            if (coachSettings.appointmentAssignment.mode !== 'automatic') {
                return {
                    success: false,
                    message: 'Automatic assignment is not enabled'
                };
            }

            // Get available staff
            const availableStaff = await this.getAvailableStaffForSlot(
                coachId,
                appointment.startTime,
                appointment.duration
            );

            if (availableStaff.length === 0) {
                return {
                    success: false,
                    message: 'No available staff found for this time slot',
                    allStaffBusy: true
                };
            }

            // Assign to the least loaded available staff (first in sorted array)
            const selectedStaff = availableStaff[0];
            appointment.assignedStaffId = selectedStaff.staffId;
            await appointment.save();

            console.log(`[Auto-Assign] Appointment ${appointmentId} assigned to staff ${selectedStaff.name} (load score: ${selectedStaff.loadScore})`);

            // Generate Zoom meeting using assigned staff's credentials
            const zoomResult = await zoomMeetingService.createMeetingForAppointment(
                appointmentId,
                selectedStaff.staffId
            );

            if (!zoomResult.success) {
                console.log(`[Auto-Assign] Warning: Could not create Zoom meeting - ${zoomResult.error}`);
            }

            // Schedule appointment reminders
            const reminderResult = await appointmentReminderService.scheduleReminders(
                appointmentId,
                coachId
            );

            if (!reminderResult.success) {
                console.log(`[Auto-Assign] Warning: Could not schedule reminders - ${reminderResult.error}`);
            }

            return {
                success: true,
                message: 'Appointment assigned successfully',
                assignedTo: {
                    staffId: selectedStaff.staffId,
                    name: selectedStaff.name,
                    email: selectedStaff.email,
                    loadScore: selectedStaff.loadScore
                },
                availableStaffCount: availableStaff.length,
                zoomMeeting: zoomResult.success ? zoomResult.meetingDetails : null,
                reminders: reminderResult.success ? {
                    scheduled: reminderResult.scheduled,
                    total: reminderResult.total
                } : null
            };
        } catch (error) {
            console.error('Error auto-assigning appointment:', error);
            throw error;
        }
    }

    /**
     * Manually assign an appointment to a specific staff member
     * @param {String} coachId - Coach ID
     * @param {String} appointmentId - Appointment ID
     * @param {String} staffId - Staff ID to assign to
     * @returns {Object} - Assignment result
     */
    async manualAssignAppointment(coachId, appointmentId, staffId) {
        try {
            const appointment = await Appointment.findById(appointmentId);
            if (!appointment) {
                throw new Error('Appointment not found');
            }

            if (String(appointment.coachId) !== String(coachId)) {
                throw new Error('Appointment does not belong to this coach');
            }

            // Verify staff exists and belongs to coach
            const staff = await User.findOne({
                _id: staffId,
                coachId: coachId,
                role: 'staff',
                isActive: true
            });

            if (!staff) {
                throw new Error('Staff member not found or inactive');
            }

            // Check for conflicts
            const appointmentStart = new Date(appointment.startTime);
            const appointmentEnd = new Date(appointmentStart.getTime() + appointment.duration * 60000);

            const appointmentConflicts = await Appointment.countDocuments({
                assignedStaffId: staffId,
                _id: { $ne: appointmentId },
                startTime: { $lt: appointmentEnd },
                $expr: {
                    $gt: [
                        { $add: ['$startTime', { $multiply: ['$duration', 60000] }] },
                        appointmentStart
                    ]
                },
                status: { $nin: ['cancelled', 'completed'] }
            });

            const calendarConflicts = await StaffCalendar.countDocuments({
                staffId: staffId,
                startTime: { $lt: appointmentEnd },
                endTime: { $gt: appointmentStart },
                status: { $ne: 'cancelled' }
            });

            if (appointmentConflicts > 0 || calendarConflicts > 0) {
                return {
                    success: false,
                    message: 'Staff member has a scheduling conflict at this time',
                    hasConflicts: true,
                    conflictCount: appointmentConflicts + calendarConflicts
                };
            }

            // Assign the appointment
            appointment.assignedStaffId = staffId;
            await appointment.save();

            console.log(`[Manual-Assign] Appointment ${appointmentId} assigned to staff ${staff.name}`);

            // Generate Zoom meeting using assigned staff's credentials
            const zoomResult = await zoomMeetingService.createMeetingForAppointment(
                appointmentId,
                staffId
            );

            if (!zoomResult.success) {
                console.log(`[Manual-Assign] Warning: Could not create Zoom meeting - ${zoomResult.error}`);
            }

            // Schedule appointment reminders (if not already scheduled)
            const reminderResult = await appointmentReminderService.scheduleReminders(
                appointmentId,
                coachId
            );

            if (!reminderResult.success) {
                console.log(`[Manual-Assign] Warning: Could not schedule reminders - ${reminderResult.error}`);
            }

            return {
                success: true,
                message: 'Appointment assigned successfully',
                assignedTo: {
                    staffId: staff._id,
                    name: staff.name,
                    email: staff.email
                },
                zoomMeeting: zoomResult.success ? zoomResult.meetingDetails : null,
                reminders: reminderResult.success ? {
                    scheduled: reminderResult.scheduled,
                    total: reminderResult.total
                } : null
            };
        } catch (error) {
            console.error('Error manually assigning appointment:', error);
            throw error;
        }
    }

    /**
     * Get assignment statistics for a coach
     * @param {String} coachId - Coach ID
     * @param {Number} days - Number of days to look back
     * @returns {Object} - Assignment statistics
     */
    async getAssignmentStats(coachId, days = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            // Get all staff under coach
            const allStaff = await User.find({
                coachId: coachId,
                role: 'staff'
            }).select('_id name email');

            const staffStats = await Promise.all(
                allStaff.map(async (staff) => {
                    const appointmentCount = await Appointment.countDocuments({
                        assignedStaffId: staff._id,
                        createdAt: { $gte: startDate },
                        status: { $nin: ['cancelled'] }
                    });

                    const completedCount = await Appointment.countDocuments({
                        assignedStaffId: staff._id,
                        createdAt: { $gte: startDate },
                        status: 'completed'
                    });

                    const staffDoc = await Staff.findOne({ userId: staff._id });
                    const distributionRatio = staffDoc?.distributionRatio || 1;

                    return {
                        staffId: staff._id,
                        name: staff.name,
                        email: staff.email,
                        totalAssigned: appointmentCount,
                        completed: completedCount,
                        completionRate: appointmentCount > 0 ? (completedCount / appointmentCount) * 100 : 0,
                        distributionRatio
                    };
                })
            );

            const totalAppointments = await Appointment.countDocuments({
                coachId: coachId,
                createdAt: { $gte: startDate }
            });

            const assignedAppointments = await Appointment.countDocuments({
                coachId: coachId,
                assignedStaffId: { $exists: true, $ne: null },
                createdAt: { $gte: startDate }
            });

            return {
                totalAppointments,
                assignedAppointments,
                unassignedAppointments: totalAppointments - assignedAppointments,
                assignmentRate: totalAppointments > 0 ? (assignedAppointments / totalAppointments) * 100 : 0,
                staffStats: staffStats.sort((a, b) => b.totalAssigned - a.totalAssigned),
                period: `Last ${days} days`
            };
        } catch (error) {
            console.error('Error getting assignment stats:', error);
            throw error;
        }
    }

    /**
     * Get total available slots considering staff availability
     * @param {String} coachId - Coach ID
     * @param {String} date - Date string (YYYY-MM-DD)
     * @returns {Array} - Available slots with staff capacity
     */
    async getAvailableSlotsWithStaffCapacity(coachId, date) {
        try {
            const coachSettings = await CoachAvailability.findOne({ coachId });
            if (!coachSettings) {
                return [];
            }

            const { workingHours, unavailableSlots, defaultAppointmentDuration, bufferTime, timeZone, appointmentAssignment } = coachSettings;
            const requestedDate = new Date(date);
            const dayOfWeek = requestedDate.getUTCDay();
            const availableSlots = [];
            const appointmentDuration = defaultAppointmentDuration || 30;

            const todayWorkingHours = workingHours.find(wh => wh.dayOfWeek === dayOfWeek);
            if (!todayWorkingHours) {
                return [];
            }

            // Helper to convert "HH:MM" string to minutes from midnight
            const timeToMinutes = (time) => {
                const [hours, minutes] = time.split(':').map(Number);
                return hours * 60 + minutes;
            };

            const startOfDay = timeToMinutes(todayWorkingHours.startTime);
            const endOfDay = timeToMinutes(todayWorkingHours.endTime);
            let currentTime = startOfDay;

            // Check if staff assignment is enabled and set to consider staff availability
            const staffAssignmentEnabled = appointmentAssignment?.enabled && appointmentAssignment?.considerStaffAvailability;

            // Get available staff count if needed
            let availableStaffCount = 1; // Default to 1 (coach only)
            if (staffAssignmentEnabled) {
                const allStaff = await User.find({
                    coachId: coachId,
                    role: 'staff',
                    isActive: true,
                    permissions: { $in: ['calendar:read', 'calendar:book'] }
                });
                availableStaffCount = allStaff.length;
            }

            while (currentTime + appointmentDuration <= endOfDay) {
                const slotStartHour = Math.floor(currentTime / 60);
                const slotStartMinute = currentTime % 60;
                const slotStartTime = new Date(date);
                slotStartTime.setUTCHours(slotStartHour, slotStartMinute, 0, 0);
                const slotEndTime = new Date(slotStartTime.getTime() + appointmentDuration * 60000);

                // Check unavailable slots
                const isUnavailable = unavailableSlots && unavailableSlots.some(slot => {
                    const unavailableEnd = new Date(slot.end);
                    return (slotStartTime < unavailableEnd && slotEndTime > slot.start);
                });

                if (!isUnavailable) {
                    if (staffAssignmentEnabled && appointmentAssignment.allowMultipleStaffSameSlot) {
                        // Count existing appointments at this time
                        const existingAppointmentsCount = await Appointment.countDocuments({
                            coachId: coachId,
                            startTime: slotStartTime,
                            status: { $nin: ['cancelled', 'completed'] }
                        });

                        // Calculate available capacity
                        const remainingCapacity = availableStaffCount - existingAppointmentsCount;

                        if (remainingCapacity > 0) {
                            availableSlots.push({
                                startTime: slotStartTime.toISOString(),
                                duration: appointmentDuration,
                                timeZone,
                                capacity: availableStaffCount,
                                booked: existingAppointmentsCount,
                                available: remainingCapacity,
                                staffAssignmentEnabled: true
                            });
                        }
                    } else {
                        // Traditional single slot check
                        const existingAppointment = await Appointment.findOne({
                            coachId: coachId,
                            startTime: slotStartTime,
                            status: { $nin: ['cancelled', 'completed'] }
                        });

                        if (!existingAppointment) {
                            availableSlots.push({
                                startTime: slotStartTime.toISOString(),
                                duration: appointmentDuration,
                                timeZone,
                                capacity: 1,
                                booked: 0,
                                available: 1,
                                staffAssignmentEnabled: false
                            });
                        }
                    }
                }

                currentTime += appointmentDuration + (bufferTime || 0);
            }

            return availableSlots;
        } catch (error) {
            console.error('Error getting available slots with staff capacity:', error);
            throw error;
        }
    }
}

module.exports = new AppointmentAssignmentService();

