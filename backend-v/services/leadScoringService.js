const Lead = require('../schema/Lead');
const ScoreLog = require('../schema/ScoreLog');

let EVENT_SCORES = {
    email_opened: 5,
    link_clicked: 10,
    call_booked: 30,
    whatsapp_replied: 8,
    form_submitted: 15,
    profile_completed: 10,
    inactivity_decay: -5, // For score decay
    // Add more events as needed
};

function setEventScores(newScores) {
    EVENT_SCORES = { ...EVENT_SCORES, ...newScores };
}

function getScoreForEvent(eventType) {
    return EVENT_SCORES[eventType] || 0;
}

async function triggerScoreAutomation(lead) {
    // Example: If score >= 80, move to 'Hot Lead' sequence, alert coach
    if (lead.score >= 80 && lead.nurturingSequence !== 'HOT_LEAD_SEQUENCE_ID') {
        // TODO: Replace 'HOT_LEAD_SEQUENCE_ID' with actual ObjectId or config
        // await require('./nurturingService').assignSequenceToLead(lead._id, 'HOT_LEAD_SEQUENCE_ID');
        // TODO: Alert coach (e.g., send notification)
        console.log(`Lead ${lead._id} is now HOT!`);
    } else if (lead.score >= 50 && lead.nurturingSequence !== 'WARM_LEAD_SEQUENCE_ID') {
        // TODO: Replace 'WARM_LEAD_SEQUENCE_ID' with actual ObjectId or config
        // await require('./nurturingService').assignSequenceToLead(lead._id, 'WARM_LEAD_SEQUENCE_ID');
        console.log(`Lead ${lead._id} is now WARM!`);
    }
}

async function updateLeadScore(leadId, eventType) {
    const scoreChange = getScoreForEvent(eventType);
    if (scoreChange === 0) return;
    const lead = await Lead.findById(leadId);
    if (!lead) return;
    const newScore = Math.max(0, (lead.score || 0) + scoreChange);
    await Lead.findByIdAndUpdate(leadId, { score: newScore });
    await ScoreLog.create({
        lead: leadId,
        eventType,
        scoreChange,
        newScore
    });
    // Trigger automation
    lead.score = newScore;
    await triggerScoreAutomation(lead);
    return newScore;
}

module.exports = {
    updateLeadScore,
    getScoreForEvent,
    setEventScores,
    triggerScoreAutomation
};
