// PRJ_YCT_Final/models/FormSubmissionMessage.js (or schema/FormSubmissionMessage.js)
const mongoose = require('mongoose');

const FormSubmissionMessageSchema = new mongoose.Schema({
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        required: [true, 'Form submission message must be associated with a lead.']
    },
    coach: { // The coach who owns this lead (for easier querying)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Form submission message must be associated with a coach.']
    },
    content: {
        type: String,
        required: [true, 'Message content cannot be empty.']
    },
    senderInfo: { // Information about who submitted the form (name, email, phone from form)
        name: { type: String, trim: true },
        email: { type: String, trim: true, lowercase: true },
        phone: { type: String, trim: true }
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Index for efficient querying by lead
FormSubmissionMessageSchema.index({ lead: 1, timestamp: -1 });
FormSubmissionMessageSchema.index({ coach: 1, timestamp: -1 });

module.exports = mongoose.models.FormSubmissionMessage || mongoose.model('FormSubmissionMessage', FormSubmissionMessageSchema);