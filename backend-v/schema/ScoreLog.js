const mongoose = require('mongoose');

const ScoreLogSchema = new mongoose.Schema({
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    eventType: { type: String, required: true },
    scoreChange: { type: Number, required: true },
    newScore: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.ScoreLog || mongoose.model('ScoreLog', ScoreLogSchema);
