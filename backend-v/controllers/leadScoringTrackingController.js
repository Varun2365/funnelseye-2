const leadScoringService = require('../services/leadScoringService');
const { Lead } = require('../schema');
const { getUserContext } = require('../middleware/unifiedCoachAuth');

// 1x1 transparent GIF for email open tracking
const pixel = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
  'base64'
);

exports.emailOpened = async (req, res) => {
  const { leadId } = req.query;
  if (leadId) await leadScoringService.updateLeadScore(leadId, 'email_opened');
  res.set('Content-Type', 'image/gif');
  res.send(pixel);
};

exports.linkClicked = async (req, res) => {
  const { leadId, target } = req.query;
  if (leadId) await leadScoringService.updateLeadScore(leadId, 'link_clicked');
  if (target) return res.send(target);
  res.json({ success: true });
};

// exports.whatsappReplied = async (req, res) => { // WhatsApp functionality moved to dustbin/whatsapp-dump/
//     const { leadId } = req.body;
//     if (leadId) await leadScoringService.updateLeadScore(leadId, 'whatsapp_replied');
//   res.json({ success: true });
// };

exports.formSubmitted = async (req, res) => {
  const { leadId } = req.body;
  if (leadId) await leadScoringService.updateLeadScore(leadId, 'form_submitted');
  res.json({ success: true });
};

exports.callBooked = async (req, res) => {
  const { leadId } = req.body;
  if (leadId) await leadScoringService.updateLeadScore(leadId, 'call_booked');
  res.json({ success: true });
};

exports.callAttended = async (req, res) => {
  const { leadId } = req.body;
  if (leadId) await leadScoringService.updateLeadScore(leadId, 'call_attended');
  res.json({ success: true });
};

exports.profileCompleted = async (req, res) => {
  const { leadId } = req.body;
  if (leadId) await leadScoringService.updateLeadScore(leadId, 'profile_completed');
  res.json({ success: true });
};

exports.leadMagnetConverted = async (req, res) => {
  const { leadId } = req.body;
  if (leadId) await leadScoringService.updateLeadScore(leadId, 'lead_magnet_converted');
  res.json({ success: true });
};

exports.followupAdded = async (req, res) => {
  const { leadId } = req.body;
  if (leadId) await leadScoringService.updateLeadScore(leadId, 'followup_added');
  res.json({ success: true });
};

exports.bookingRecovered = async (req, res) => {
  const { leadId } = req.body;
  if (leadId) await leadScoringService.updateLeadScore(leadId, 'booking_recovered');
  res.json({ success: true });
};

exports.inactivityDecay = async (req, res) => {
  const { leadId } = req.body;
  if (leadId) await leadScoringService.updateLeadScore(leadId, 'inactivity_decay');
  res.json({ success: true });
};

exports.unsubscribed = async (req, res) => {
  const { leadId } = req.body;
  if (leadId) await leadScoringService.updateLeadScore(leadId, 'unsubscribed');
  res.json({ success: true });
};

exports.emailBounced = async (req, res) => {
  const { leadId } = req.body;
  if (leadId) await leadScoringService.updateLeadScore(leadId, 'email_bounced');
  res.json({ success: true });
};
