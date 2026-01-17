// D:\PRJ_YCT_Final\Schema\FunnelEvent.js

const mongoose = require('mongoose');

const FunnelEventSchema = new mongoose.Schema({
    funnelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Funnel', // This links to your Funnel model
        required: true,
    },
    stageId: { // The specific ID of the funnel stage (e.g., the ID of a LandingPage document, Appointment document, etc.)
        type: mongoose.Schema.Types.ObjectId,
        required: false, // Make false if some events might not be tied to a specific stage (e.g., general funnel entry)
    },
    eventType: {
        type: String,
        required: true,
        enum: [
            'PageView',           // User viewed a page in the funnel
            'FormSubmission',     // User submitted a form
            'ButtonInteraction',  // User clicked a specific button (e.g., CTA)
            'AppointmentBooked',  // User booked an appointment
            'ProductPurchased',   // User completed a purchase
            'WACommunityJoined',  // User joined a WhatsApp community
            'VideoWatched',       // User watched a video (e.g., on a VSL page)
            'StageCompleted',     // User successfully completed a stage (moved to next)
            'FunnelCompleted',    // User completed the entire funnel goal
            'FunnelAbandoned',    // User explicitly left the funnel before completion
            'QuizCompleted',      // User completed a quiz
            'FileDownloaded',     // User downloaded a file/lead magnet
            // Add any other specific events you want to track
        ],
    },
    sessionId: { // A unique identifier to track a single user's journey, even if they're not logged in. Stored in browser's local storage.
        type: String,
        required: true
    },
    userId: { // The ID of the logged-in user (optional, will be null for guest users)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming your main User model is named 'User'
        required: false
    },
    ipAddress: { // The user's IP address (captured by the backend from req.ip)
        type: String,
        required: false,
    },
    userAgent: { // The user's browser and device information (captured by the backend from req.headers['user-agent'])
        type: String,
        required: false,
    },
    // Optional: A field to store any additional, event-specific data (e.g., form field values for a FormSubmission)
    // metadata: {
    //     type: mongoose.Schema.Types.Mixed, // Allows storing data of any type (object, string, number, etc.)
    //     required: false,
    // }
}, {
    timestamps: true // Mongoose automatically adds 'createdAt' and 'updatedAt' fields
});

// Create compound indexes to optimize queries for analytics
FunnelEventSchema.index({ funnelId: 1, sessionId: 1, eventType: 1, createdAt: -1 });
FunnelEventSchema.index({ funnelId: 1, stageId: 1, eventType: 1, createdAt: -1 });


module.exports = mongoose.models.FunnelEvent ||  mongoose.model('FunnelEvent', FunnelEventSchema);