// D:\PRJ_YCT_Final\schema\CoachAvailability.js
const mongoose = require('mongoose');

// Sub-schema for funnel-specific settings
const FunnelSettingsSchema = new mongoose.Schema({
    funnelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Funnel', // Assuming you have a 'Funnel' model
        required: [true, 'Funnel-specific settings must be linked to a funnel.']
    },
    defaultAppointmentDuration: {
        type: Number, // Overrides global duration
        min: 10
    },
    bufferTime: { // Overrides global buffer time
        type: Number,
        min: 0
    },
    // You could add workingHours and unavailableSlots here as well if needed
});

const CoachAvailabilitySchema = new mongoose.Schema({
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Availability must be linked to a coach.']
    },
    // --- Global Availability Settings ---
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
        required: [true, 'Please specify the coach\'s time zone for availability.'],
        default: 'Asia/Kolkata'
    },
    // --- Funnel-Specific Availability Settings (the new feature) ---
    funnelSpecificSettings: [FunnelSettingsSchema],
    // --- Staff Appointment Assignment Settings ---
    appointmentAssignment: {
        enabled: {
            type: Boolean,
            default: false, // If true, appointments can be assigned to staff
            description: 'Enable staff assignment for appointments'
        },
        mode: {
            type: String,
            enum: ['manual', 'automatic'],
            default: 'manual',
            description: 'Manual = coach assigns appointments, Automatic = system assigns based on distribution ratio'
        },
        considerStaffAvailability: {
            type: Boolean,
            default: true,
            description: 'When enabled, total slots = coach slots × number of available staff'
        },
        allowMultipleStaffSameSlot: {
            type: Boolean,
            default: true,
            description: 'Allow multiple staff to have appointments at the same time slot'
        }
    },
    // --- Appointment Reminder Settings ---
    appointmentReminders: {
        enabled: {
            type: Boolean,
            default: true,
            description: 'Enable automated appointment reminders'
        },
        reminders: [{
            name: {
                type: String,
                required: true,
                description: 'Reminder name (e.g., "3 days before")'
            },
            timing: {
                type: Number,
                required: true,
                description: 'Minutes before appointment (e.g., 4320 for 3 days)'
            },
            channel: {
                type: String,
                enum: ['whatsapp', 'email', 'sms', 'both'],
                default: 'whatsapp'
            },
            templateId: {
                type: String,
                description: 'WhatsApp template ID to use'
            },
            isActive: {
                type: Boolean,
                default: true
            }
        }],
        defaultReminders: {
            type: Boolean,
            default: true,
            description: 'Use default reminders (3 days, 1 day, 10 minutes)'
        }
    },
    // --- Zoom Integration Status ---
    hasZoomIntegration: {
        type: Boolean,
        default: false,
        description: 'Whether coach has connected Zoom account'
    },
    zoomIntegrationStatus: {
        type: String,
        enum: ['not_configured', 'active', 'expired', 'error'],
        default: 'not_configured'
    }
}, {
    timestamps: true
});

CoachAvailabilitySchema.index({ coachId: 1 }, { unique: true });

module.exports = mongoose.models.CoachAvailabilitySchema ||  mongoose.model('CoachAvailability', CoachAvailabilitySchema);