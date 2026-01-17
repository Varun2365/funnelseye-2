// D:\PRJ_YCT_Final\controllers\coachAvailabilityController.js

// --- Imports ---
const CoachAvailability = require('../schema/CoachAvailability');
const Appointment = require('../schema/Appointment');
const { getAvailableSlots, bookAppointment: bookAppointmentService, rescheduleAppointment, cancelAppointment } = require('../services/calendarService'); // <-- NEW: Import from the new service
const CoachStaffService = require('../services/coachStaffService');
const zoomMeetingService = require('../services/zoomMeetingService');
const appointmentReminderService = require('../services/appointmentReminderService');

// Utility to wrap async functions for error handling
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * @desc    Get availability settings (Coach or Staff)
 * @route   GET /api/coach/:coachId/availability
 * @access  Public (or authenticated for staff viewing their own)
 */
const getCoachAvailability = asyncHandler(async (req, res) => {
  const { coachId } = req.params;
  
  // If this is an authenticated request, get user context
  let userContext = null;
  let targetAvailability = null;
  
  if (req.userId || req.coachId) {
    userContext = CoachStaffService.getUserContext(req);
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'calendar', 'availability', { coachId });
    
    // If staff is viewing, get their specific availability
    if (userContext.isStaff) {
      const StaffAvailability = require('../schema/StaffAvailability');
      let staffAvailability = await StaffAvailability.findOne({ staffId: userContext.userId });
      
      // If staff has no availability yet, auto-create from coach settings
      if (!staffAvailability) {
        const coachAvailability = await CoachAvailability.findOne({ coachId });
        if (coachAvailability) {
          staffAvailability = await StaffAvailability.create({
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
          console.log(`[Staff Availability] Auto-created availability for staff ${userContext.userId} from coach settings`);
        }
      }
      
      targetAvailability = staffAvailability;
    }
  }
  
  // If not staff or no user context, get coach availability
  if (!targetAvailability) {
    // Try to find by coachId (handle both string and ObjectId)
    const mongoose = require('mongoose');
    let query = { coachId: coachId };
    
    // If coachId is a valid ObjectId string, try both string and ObjectId formats
    if (mongoose.Types.ObjectId.isValid(coachId)) {
      query = {
        $or: [
          { coachId: coachId },
          { coachId: new mongoose.Types.ObjectId(coachId) }
        ]
      };
    }
    
    targetAvailability = await CoachAvailability.findOne(query);
  }
  
  if (!targetAvailability) {
    return res.status(200).json({
      success: true,
      data: {
        timeZone: 'UTC',
        workingHours: [],
        unavailableSlots: [],
        slotDuration: 30, // Keep slotDuration for backward compatibility
        defaultAppointmentDuration: 30,
        bufferTime: 10,
      },
    });
  }

  // Transform the response to include both slotDuration (for backward compatibility) and defaultAppointmentDuration
  const responseData = targetAvailability.toObject ? targetAvailability.toObject() : { ...targetAvailability };
  
  // Ensure slotDuration is present for backward compatibility
  if (responseData.defaultAppointmentDuration !== undefined && responseData.slotDuration === undefined) {
    responseData.slotDuration = responseData.defaultAppointmentDuration;
  } else if (responseData.slotDuration === undefined && responseData.defaultAppointmentDuration === undefined) {
    responseData.slotDuration = 30;
    responseData.defaultAppointmentDuration = 30;
  }

  res.status(200).json({
    success: true,
    data: responseData,
    userContext: userContext ? {
      isStaff: userContext.isStaff,
      userId: userContext.userId,
      permissions: userContext.permissions
    } : null
  });
});

/**
 * @desc    Set or update availability (Coach or Staff)
 * @route   POST /api/coach/availability
 * @access  Private (Coach or Staff with permission)
 */
const setCoachAvailability = asyncHandler(async (req, res) => {
    // Get coach ID and user context
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'manage', 'calendar', 'set_availability', { coachId });
    
    // Check if the user is authenticated
    if (!coachId) {
        console.error('Authentication Error: coachId not found');
        return res.status(401).json({
            success: false,
            message: 'Not authorized. Please log in.'
        });
    }

    // Check if user has Zoom integration before allowing availability setup
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

    const { timeZone, workingHours, unavailableSlots, defaultAppointmentDuration, bufferTime } = req.body;

    if (!workingHours || !Array.isArray(workingHours)) {
        return res.status(400).json({
            success: false,
            message: 'Working hours are required and must be an array.',
        });
    }

    try {
        let availability;
        
        if (userContext.isStaff) {
            // Update staff availability
            const StaffAvailability = require('../schema/StaffAvailability');
            availability = await StaffAvailability.findOneAndUpdate(
                { staffId: userContext.userId },
                {
                    coachId,
                    timeZone,
                    workingHours,
                    unavailableSlots,
                    defaultAppointmentDuration,
                    bufferTime,
                    hasZoomIntegration: true,
                    zoomIntegrationStatus: 'active',
                    copiedFromCoach: false
                },
                { new: true, upsert: true, runValidators: true }
            );
            
            console.log(`[Staff Availability] Updated availability for staff ${userContext.userId}`);
        } else {
            // Update coach availability
            // Handle both string and ObjectId formats for coachId
            const mongoose = require('mongoose');
            let query = { coachId: coachId };
            
            if (mongoose.Types.ObjectId.isValid(coachId)) {
                query = {
                    $or: [
                        { coachId: coachId },
                        { coachId: new mongoose.Types.ObjectId(coachId) }
                    ]
                };
            }
            
            availability = await CoachAvailability.findOneAndUpdate(
                query,
                {
                    coachId: mongoose.Types.ObjectId.isValid(coachId) ? new mongoose.Types.ObjectId(coachId) : coachId,
                    timeZone,
                    workingHours,
                    unavailableSlots,
                    defaultAppointmentDuration,
                    bufferTime,
                    hasZoomIntegration: true,
                    zoomIntegrationStatus: 'active'
                },
                { new: true, upsert: true, runValidators: true }
            );
            
            console.log(`[Coach Availability] Updated availability for coach ${coachId}`, {
                workingHoursCount: workingHours?.length || 0,
                timeZone,
                defaultAppointmentDuration
            });
        }

        res.status(200).json({
            success: true,
            message: userContext.isStaff ? 'Staff availability updated successfully' : 'Coach availability updated successfully',
            data: availability,
            userContext: {
                isStaff: userContext.isStaff,
                userId: userContext.userId
            }
        });
    } catch (error) {
        console.error('Error saving availability settings:', error.message);
        res.status(500).json({
            success: false,
            message: 'An error occurred while saving availability settings.',
            error: error.message
        });
    }
});
/**
 * @desc    Get available booking slots for a coach on a specific day
 * @route   GET /api/coach/:coachId/available-slots?date=YYYY-MM-DD
 * @access  Public
 */
const getAvailableSlotsController = asyncHandler(async (req, res) => {
  const { coachId } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({
      success: false,
      message: 'Date is required to find available slots.',
    });
  }
  
  // <-- CHANGED: Now calls the service function
  const availableSlots = await getAvailableSlots(coachId, date);

  res.status(200).json({
    success: true,
    date,
    slots: availableSlots,
  });
});

/**
 * @desc    Book an appointment with a coach
 * @route   POST /api/coach/:coachId/book
 * @access  Public
 */
const bookAppointmentController = asyncHandler(async (req, res) => {
  const { coachId } = req.params;
  const { leadId, startTime, duration, notes, timeZone } = req.body;

  // <-- CHANGED: Now calls the service function for booking logic
  const newAppointment = await bookAppointmentService(coachId, leadId, startTime, duration, notes, timeZone);

  res.status(201).json({
    success: true,
    message: 'Appointment booked successfully.',
    appointmentDetails: newAppointment,
  });
});

/**
 * @desc    Reschedule an existing appointment (protected)
 * @route   PUT /api/coach/appointments/:id/reschedule
 * @access  Private (Coach/Admin/Staff)
 */
const rescheduleAppointmentController = asyncHandler(async (req, res) => {
  const appointmentId = req.params.id;
  const { newStartTime, newDuration } = req.body;

  if (!newStartTime) {
    return res.status(400).json({ success: false, message: 'newStartTime is required.' });
  }

  const updated = await rescheduleAppointment(appointmentId, req.coachId, newStartTime, newDuration);

  res.status(200).json({
    success: true,
    message: 'Appointment rescheduled successfully.',
    appointmentDetails: updated,
  });
});

/**
 * @desc    Cancel an appointment (protected)
 * @route   DELETE /api/coach/appointments/:id
 * @access  Private (Coach/Admin/Staff)
 */
const cancelAppointmentController = asyncHandler(async (req, res) => {
  const appointmentId = req.params.id;
  await cancelAppointment(appointmentId, req.coachId);
  res.status(200).json({ success: true, message: 'Appointment cancelled.' });
});

/**
 * @desc    Get a full calendar view for a coach, including available and booked slots
 * @route   GET /api/coach/:coachId/calendar?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * @access  Public
 */
const getCoachCalendar = asyncHandler(async (req, res) => {
  const { coachId } = req.params;
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'Both startDate and endDate are required to view the calendar.',
    });
  }
  
  const calendar = [];
  let currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    const dateString = currentDate.toISOString().split('T')[0];

    // <-- CHANGED: Now calls the service function to get slots for the day
    const availableSlots = await getAvailableSlots(coachId, dateString);

    // Get all existing appointments for the day from the database
    // Populate lead data with name and clientQuestions/coachQuestions for lead name
    const existingAppointments = await Appointment.find({
      coachId: coachId,
      startTime: {
        $gte: new Date(dateString),
        $lt: new Date(new Date(dateString).getTime() + 86400000),
      },
    })
    .populate('leadId', 'name email phone clientQuestions coachQuestions')
    .lean(); // Use lean() for better performance
    
    // Format appointments with zoom meeting details and lead name
    const formattedAppointments = existingAppointments.map(appointment => {
      const formatted = { ...appointment };
      
      // Extract lead name - prioritize clientQuestions.fullName or coachQuestions.fullName, fallback to name field
      const lead = appointment.leadId;
      if (lead && typeof lead === 'object') {
        // Lead is populated as an object
        formatted.leadName = lead.clientQuestions?.fullName || 
                            lead.coachQuestions?.fullName || 
                            lead.name || 
                            'Unknown Lead';
        formatted.lead = lead; // Include full lead object for frontend
      } else if (lead) {
        // Lead is just an ID string (shouldn't happen with populate, but handle it)
        formatted.leadName = 'Unknown Lead';
        formatted.lead = null;
      } else {
        formatted.leadName = 'Unknown Lead';
        formatted.lead = null;
      }
      
      // Format zoom meeting details to match frontend expectations
      if (appointment.zoomMeeting && typeof appointment.zoomMeeting === 'object') {
        if (appointment.zoomMeeting.joinUrl) {
          formatted.zoomMeetingLink = appointment.zoomMeeting.joinUrl;
          formatted.zoom_link = appointment.zoomMeeting.joinUrl;
          formatted.zoomUrl = appointment.zoomMeeting.joinUrl;
          formatted.meetingLink = appointment.zoomMeeting.joinUrl;
        }
        if (appointment.zoomMeeting.meetingId) {
          formatted.zoomMeetingId = appointment.zoomMeeting.meetingId;
          formatted.zoomMeetingNumber = appointment.zoomMeeting.meetingId;
        }
        if (appointment.zoomMeeting.password) {
          formatted.zoomPassword = appointment.zoomMeeting.password;
        }
        if (appointment.startTime) {
          formatted.zoomStartTime = appointment.startTime; // Use appointment start time
        }
        if (appointment.zoomMeeting.startUrl) {
          formatted.zoomStartUrl = appointment.zoomMeeting.startUrl;
        }
        formatted.zoomTopic = appointment.summary || appointment.notes || 'Appointment Meeting';
        formatted.zoomAgenda = appointment.notes || '';
      }
      
      // Keep the original zoomMeeting object for backward compatibility
      formatted.zoomMeeting = appointment.zoomMeeting;
      
      return formatted;
    });
    
    const daySchedule = {
      date: dateString,
      appointments: formattedAppointments,
      availableSlots: availableSlots,
    };

    calendar.push(daySchedule);

    currentDate.setDate(currentDate.getDate() + 1);
  }

    res.status(200).json({
    success: true,
    data: calendar,
  });
});

/**
 * @desc    Get appointment details including Zoom meeting information
 * @route   GET /api/coach/appointments/:id
 * @access  Private (Coach/Admin/Staff)
 */
const getAppointmentDetails = asyncHandler(async (req, res) => {
  const appointmentId = req.params.id;
  const appointment = await Appointment.findById(appointmentId)
    .populate('leadId', 'name email phone')
    .populate('coachId', 'name email');
  
  if (!appointment) {
    return res.status(404).json({ 
      success: false, 
      message: 'Appointment not found.' 
    });
  }

  res.status(200).json({
    success: true,
    data: appointment
  });
});

/**
 * @desc    Get appointment assignment settings for a coach
 * @route   GET /api/coach/availability/assignment-settings
 * @access  Private (Coach only)
 */
const getAssignmentSettings = asyncHandler(async (req, res) => {
  const coachId = CoachStaffService.getCoachIdForQuery(req);
  const userContext = CoachStaffService.getUserContext(req);
  
  // Only coach can view assignment settings
  if (userContext.isStaff) {
    return res.status(403).json({
      success: false,
      message: 'Only coaches can view assignment settings'
    });
  }
  
  const availability = await CoachAvailability.findOne({ coachId });
  if (!availability) {
    return res.status(200).json({
      success: true,
      data: {
        enabled: false,
        mode: 'manual',
        considerStaffAvailability: true,
        allowMultipleStaffSameSlot: true
      }
    });
  }

  res.status(200).json({
    success: true,
    data: availability.appointmentAssignment || {
      enabled: false,
      mode: 'manual',
      considerStaffAvailability: true,
      allowMultipleStaffSameSlot: true
    }
  });
});

/**
 * @desc    Update appointment assignment settings for a coach
 * @route   PUT /api/coach/availability/assignment-settings
 * @access  Private (Coach only)
 */
const updateAssignmentSettings = asyncHandler(async (req, res) => {
  const coachId = CoachStaffService.getCoachIdForQuery(req);
  const userContext = CoachStaffService.getUserContext(req);
  
  // Only coach can update assignment settings
  if (userContext.isStaff) {
    return res.status(403).json({
      success: false,
      message: 'Only coaches can update assignment settings'
    });
  }

  const { enabled, mode, considerStaffAvailability, allowMultipleStaffSameSlot } = req.body;

  // Validate mode
  if (mode && !['manual', 'automatic'].includes(mode)) {
    return res.status(400).json({
      success: false,
      message: 'Mode must be either "manual" or "automatic"'
    });
  }

  const availability = await CoachAvailability.findOneAndUpdate(
    { coachId },
    {
      $set: {
        'appointmentAssignment.enabled': enabled !== undefined ? enabled : false,
        'appointmentAssignment.mode': mode || 'manual',
        'appointmentAssignment.considerStaffAvailability': considerStaffAvailability !== undefined ? considerStaffAvailability : true,
        'appointmentAssignment.allowMultipleStaffSameSlot': allowMultipleStaffSameSlot !== undefined ? allowMultipleStaffSameSlot : true
      }
    },
    { new: true, upsert: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Assignment settings updated successfully',
    data: availability.appointmentAssignment
  });
});

/**
 * @desc    Get assignment statistics for a coach
 * @route   GET /api/coach/availability/assignment-stats
 * @access  Private (Coach only)
 */
const getAssignmentStats = asyncHandler(async (req, res) => {
  const coachId = CoachStaffService.getCoachIdForQuery(req);
  const userContext = CoachStaffService.getUserContext(req);
  const { days = 30 } = req.query;
  
  // Only coach can view assignment stats
  if (userContext.isStaff) {
    return res.status(403).json({
      success: false,
      message: 'Only coaches can view assignment statistics'
    });
  }

  const appointmentAssignmentService = require('../services/appointmentAssignmentService');
  const stats = await appointmentAssignmentService.getAssignmentStats(coachId, parseInt(days));

  res.status(200).json({
    success: true,
    data: stats
  });
});

/**
 * @desc    Get appointment reminder settings for a coach
 * @route   GET /api/coach/availability/reminder-settings
 * @access  Private (Coach only)
 */
const getReminderSettings = asyncHandler(async (req, res) => {
  const coachId = CoachStaffService.getCoachIdForQuery(req);
  const userContext = CoachStaffService.getUserContext(req);
  
  // Only coach can view reminder settings
  if (userContext.isStaff) {
    return res.status(403).json({
      success: false,
      message: 'Only coaches can view reminder settings'
    });
  }
  
  const settings = await appointmentReminderService.getReminderSettings(coachId);

  res.status(200).json({
    success: true,
    data: settings
  });
});

/**
 * @desc    Update appointment reminder settings for a coach
 * @route   PUT /api/coach/availability/reminder-settings
 * @access  Private (Coach only)
 */
const updateReminderSettings = asyncHandler(async (req, res) => {
  const coachId = CoachStaffService.getCoachIdForQuery(req);
  const userContext = CoachStaffService.getUserContext(req);
  
  // Only coach can update reminder settings
  if (userContext.isStaff) {
    return res.status(403).json({
      success: false,
      message: 'Only coaches can update reminder settings'
    });
  }

  const { enabled, defaultReminders, reminders } = req.body;

  const result = await appointmentReminderService.updateReminderSettings(coachId, {
    enabled,
    defaultReminders,
    reminders
  });

  res.status(200).json({
    success: true,
    message: 'Reminder settings updated successfully',
    data: result.settings
  });
});

/**
 * @desc    Copy coach availability to staff
 * @route   POST /api/coach/availability/copy-from-coach
 * @access  Private (Staff only)
 */
const copyCoachAvailability = asyncHandler(async (req, res) => {
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
  const coachAvailability = await CoachAvailability.findOne({ coachId });
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
  
  res.status(200).json({
    success: true,
    message: 'Coach availability copied to staff successfully',
    data: availability
  });
});

/**
 * @desc    Check Zoom integration status
 * @route   GET /api/coach/availability/zoom-status
 * @access  Private (Coach or Staff)
 */
const getZoomStatus = asyncHandler(async (req, res) => {
  const userContext = CoachStaffService.getUserContext(req);
  const targetUserId = userContext.isStaff ? userContext.userId : CoachStaffService.getCoachIdForQuery(req);
  
  const hasZoom = await zoomMeetingService.hasValidZoomIntegration(targetUserId);
  
  res.status(200).json({
    success: true,
    data: {
      hasZoomIntegration: hasZoom,
      userId: targetUserId,
      userType: userContext.isStaff ? 'staff' : 'coach'
    }
  });
});

module.exports = {
  getCoachAvailability,
  setCoachAvailability,
  getAvailableSlots: getAvailableSlotsController, // <-- CHANGED: Export the new controller function
  bookAppointment: bookAppointmentController, // <-- CHANGED: Export the new controller function
  getCoachCalendar,
  getAppointmentDetails,
  rescheduleAppointment: rescheduleAppointmentController,
  cancelAppointment: cancelAppointmentController,
  getAssignmentSettings,
  updateAssignmentSettings,
  getAssignmentStats,
  getReminderSettings,
  updateReminderSettings,
  copyCoachAvailability,
  getZoomStatus
};