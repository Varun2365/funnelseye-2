// D:\PRJ_YCT_Final\schema\StaffAvailability.js

const mongoose = require('mongoose');

const StaffAvailabilitySchema = new mongoose.Schema({
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Availability must be linked to a staff member.']
    },
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Staff must be linked to a coach.']
    },
    // --- Availability Settings (copied from coach by default) ---
    workingHours: [{
        dayOfWeek: {
            type: Number, // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
            required: true,
            min: 0,
            max: 6
        },
        startTime: {
            type: String, // e.g., "09:00"
            required: true,
            match: [/^([0-1]\d|2[0-3]):([0-5]\d)$/, 'Please use HH:MM format for start time.']
        },
        endTime: {
            type: String, // e.g., "17:00"
            required: true,
            match: [/^([0-1]\d|2[0-3]):([0-5]\d)$/, 'Please use HH:MM format for end time.']
        }
    }],
    unavailableSlots: [{
        start: {
            type: Date,
            required: true
        },
        end: {
            type: Date,
            required: true
        },
        reason: {
            type: String,
            maxlength: [200, 'Reason can not be more than 200 characters']
        }
    }],
    defaultAppointmentDuration: {
        type: Number,
        default: 30,
        min: 10
    },
    bufferTime: {
        type: Number,
        default: 0,
        min: 0
    },
    timeZone: {
        type: String,
        required: [true, 'Please specify the staff\'s time zone for availability.'],
        default: 'Asia/Kolkata'
    },
    // --- Zoom Integration Status ---
    hasZoomIntegration: {
        type: Boolean,
        default: false,
        description: 'Whether staff has connected their Zoom account'
    },
    zoomIntegrationStatus: {
        type: String,
        enum: ['not_configured', 'active', 'expired', 'error'],
        default: 'not_configured'
    },
    // --- Metadata ---
    isActive: {
        type: Boolean,
        default: true
    },
    copiedFromCoach: {
        type: Boolean,
        default: true,
        description: 'Whether this availability was copied from coach settings'
    },
    lastSyncedWithCoach: {
        type: Date,
        description: 'Last time availability was synced with coach settings'
    }
}, {
    timestamps: true
});

StaffAvailabilitySchema.index({ staffId: 1 }, { unique: true });
StaffAvailabilitySchema.index({ coachId: 1 });

module.exports = mongoose.model('StaffAvailability', StaffAvailabilitySchema);


