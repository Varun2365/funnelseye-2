const express = require('express');
const router = express.Router();
const tracking = require('../controllers/leadScoringTrackingController');

// These are tracking routes that don't require authentication
// They are used for external tracking (email opens, link clicks, etc.)
router.get('/email-opened', tracking.emailOpened);
router.get('/link-clicked', tracking.linkClicked);
// router.post('/whatsapp-replied', tracking.whatsappReplied); // WhatsApp functionality moved to dustbin/whatsapp-dump/
router.post('/form-submitted', tracking.formSubmitted);
router.post('/call-booked', tracking.callBooked);
router.post('/call-attended', tracking.callAttended);
router.post('/profile-completed', tracking.profileCompleted);
router.post('/lead-magnet-converted', tracking.leadMagnetConverted);
router.post('/followup-added', tracking.followupAdded);
router.post('/booking-recovered', tracking.bookingRecovered);
router.post('/inactivity-decay', tracking.inactivityDecay);
router.post('/unsubscribed', tracking.unsubscribed);
router.post('/email-bounced', tracking.emailBounced);

module.exports = router;
