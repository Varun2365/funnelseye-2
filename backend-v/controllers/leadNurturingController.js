const Lead = require('../schema/Lead');
const NurturingSequence = require('../schema/NurturingSequence');
const nurturingService = require('../services/nurturingService');

// Assign a nurturing sequence to a lead
exports.assignSequence = async (req, res) => {
    try {
        const { leadId, sequenceId } = req.body;
        await nurturingService.assignSequenceToLead(leadId, sequenceId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Progress the lead to the next step
exports.progressStep = async (req, res) => {
    try {
        const { leadId } = req.body;
        const lead = await Lead.findById(leadId);
        await nurturingService.progressLeadStep(lead);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get the current sequence status for a lead
exports.getStatus = async (req, res) => {
    try {
        const { leadId } = req.query;
        const status = await nurturingService.getLeadSequenceStatus(leadId);
        res.json({ status });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
