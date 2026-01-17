const mongoose = require('mongoose');

const NurturingStepSchema = new mongoose.Schema({
    sequence: { type: mongoose.Schema.Types.ObjectId, ref: 'NurturingSequence', required: true },
    stepIndex: { type: Number, required: true },
    type: { type: String, enum: ['email', 'whatsapp', 'task'], required: true },
    content: { type: String, required: true },
    delayHours: { type: Number, default: 24 }, // Delay after previous step
    metadata: { type: mongoose.Schema.Types.Mixed },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.models.NurturingStep || mongoose.model('NurturingStep', NurturingStepSchema);
