// D:\PRJ_YCT_Final\controllers\bookingRecoveryController.js

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

const { scheduleFutureEvent } = require('../services/automationSchedulerService');
const CoachStaffService = require('../services/coachStaffService');

// This map will store temporary booking session data
const bookingSessions = new Map();
const BOOKING_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

/**
 * @desc    Initializes a booking recovery session
 * @route   POST /api/booking-recovery/initiate
 * @access  Public (with optional staff logging)
 */
const initiateBookingRecovery = asyncHandler(async (req, res) => {
    const { leadId, coachId, funnelId } = req.body;

    if (!leadId || !coachId || !funnelId) {
        return res.status(400).json({ success: false, message: 'leadId, coachId, and funnelId are required.' });
    }
    
    // Log staff action if this is an authenticated request
    if (req.userId || req.coachId) {
        CoachStaffService.logStaffAction(req, 'create', 'calendar', 'booking_recovery', { leadId, coachId, funnelId });
    }

    const sessionId = `${leadId}-${coachId}-${funnelId}-${Date.now()}`;
    const recoveryTime = new Date(Date.now() + BOOKING_TIMEOUT_MS);

    // Store the session data
    bookingSessions.set(sessionId, { leadId, coachId, funnelId, recoveryTime });

    // Schedule the booking_abandoned event
    const eventPayload = {
        eventName: 'booking_abandoned',
        payload: { leadId, coachId, funnelId },
        relatedDoc: { leadId, coachId, funnelId },
        timestamp: new Date().toISOString()
    };

    scheduleFutureEvent(recoveryTime, 'funnelseye_events', 'booking_abandoned', eventPayload);

    console.log(`[BookingRecovery] Recovery session initiated for lead ${leadId}. Session ID: ${sessionId}`);

    res.status(200).json({
        success: true,
        message: 'Booking recovery session initiated.',
        sessionId: sessionId,
    });
});

/**
 * @desc    Cancels a booking recovery session
 * @route   POST /api/booking-recovery/cancel
 * @access  Public
 */
const cancelBookingRecovery = asyncHandler(async (req, res) => {
    const { sessionId } = req.body;

    if (!bookingSessions.has(sessionId)) {
        return res.status(404).json({ success: false, message: 'Session not found or already completed.' });
    }

    // Remove the session from the map to prevent the event from firing
    bookingSessions.delete(sessionId);

    console.log(`[BookingRecovery] Recovery session cancelled for session ID: ${sessionId}`);

    res.status(200).json({
        success: true,
        message: 'Booking recovery session cancelled.',
    });
});

module.exports = {
    initiateBookingRecovery,
    cancelBookingRecovery
};