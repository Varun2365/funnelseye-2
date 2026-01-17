const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getSequences,
  createSequence,
  getSequenceById,
  updateSequence,
  deleteSequence,
  getFlows,
  startAutomation,
  getRuns,
  getAnalytics,
  handleReply,
  getAIAnalysis,
  triggerAutomation
} = require('../controllers/automationsV2Controller');

// Apply authentication to all routes
router.use(protect);

// Get all messaging sequences for coach (V2)
router.get('/sequences', getSequences);

// Get single messaging sequence by ID (V2)
router.get('/sequences/:id', getSequenceById);

// Create new messaging sequence (V2)
router.post('/sequences', createSequence);

// Update messaging sequence (V2)
router.put('/sequences/:id', updateSequence);

// Delete messaging sequence (V2)
router.delete('/sequences/:id', deleteSequence);

// Get flow controls (V2)
router.get('/flows', getFlows);

// Start automation run (V2)
router.post('/run', startAutomation);

// Get automation runs (V2)
router.get('/runs', getRuns);

// Get automation analytics (V2) - Enhanced version
router.get('/analytics', getAnalytics);

// Handle incoming reply (V2)
router.post('/reply', handleReply);

// Advanced AI analysis for V2
router.post('/ai-analysis', getAIAnalysis);

// Trigger automation event (V2)
router.post('/trigger', triggerAutomation);

module.exports = router;
