const mongoose = require('mongoose');

/**
 * Staff Calendar Schema
 * Handles staff calendar events, availability, and scheduling
 */
const StaffCalendarSchema = new mongoose.Schema({
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // coach user
        required: true
    },
    eventType: {
        type: String,
        enum: ['task', 'meeting', 'break', 'unavailable', 'custom'],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: false
    },
    status: {
        type: String,
        enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled'],
        default: 'scheduled'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurrencePattern: {
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'monthly', 'yearly']
        },
        interval: {
            type: Number,
            default: 1
        },
        endDate: Date,
        daysOfWeek: [Number], // 0-6 for Sunday-Saturday
        dayOfMonth: Number
    },
    relatedTask: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    },
    relatedLead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead'
    },
    location: {
        type: String,
        trim: true
    },
    attendees: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        name: String,
        email: String,
        role: String
    }],
    notes: {
        type: String,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    color: {
        type: String,
        default: '#3788d8'
    },
    isPublic: {
        type: Boolean,
        default: false // visible to other staff members
    },
    reminder: {
        enabled: {
            type: Boolean,
            default: true
        },
        time: {
            type: Number, // minutes before event
            default: 15
        },
        sent: {
            type: Boolean,
            default: false
        }
    },
    metadata: {
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        lastModifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        source: {
            type: String,
            enum: ['manual', 'task_assignment', 'lead_booking', 'automation', 'import'],
            default: 'manual'
        }
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
StaffCalendarSchema.index({ staffId: 1, startTime: 1, endTime: 1 });
StaffCalendarSchema.index({ coachId: 1, startTime: 1, endTime: 1 });
StaffCalendarSchema.index({ startTime: 1, endTime: 1 });
StaffCalendarSchema.index({ status: 1, startTime: 1 });

// Virtual for checking if event is currently active
StaffCalendarSchema.virtual('isActive').get(function() {
    const now = new Date();
    return this.startTime <= now && this.endTime >= now && this.status === 'scheduled';
});

// Virtual for checking if event is overdue
StaffCalendarSchema.virtual('isOverdue').get(function() {
    const now = new Date();
    return this.endTime < now && this.status === 'scheduled';
});

// Pre-save middleware to calculate duration
StaffCalendarSchema.pre('save', function(next) {
    if (this.startTime && this.endTime) {
        this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60)); // Convert to minutes
    }
    // Ensure duration is always set
    if (!this.duration && this.startTime && this.endTime) {
        this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60));
    }
    next();
});

// Static method to find overlapping events
StaffCalendarSchema.statics.findOverlapping = function(staffId, startTime, endTime, excludeId = null) {
    const query = {
        staffId,
        status: { $ne: 'cancelled' },
        $or: [
            // Event starts during the new event
            { startTime: { $lt: endTime, $gte: startTime } },
            // Event ends during the new event
            { endTime: { $gt: startTime, $lte: endTime } },
            // Event completely contains the new event
            { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
        ]
    };
    
    if (excludeId) {
        query._id = { $ne: excludeId };
    }
    
    return this.find(query);
};

// Static method to get staff availability for a time range
StaffCalendarSchema.statics.getAvailability = function(staffId, startTime, endTime) {
    return this.aggregate([
        {
            $match: {
                staffId: mongoose.Types.ObjectId(staffId),
                startTime: { $lt: endTime },
                endTime: { $gt: startTime },
                status: { $ne: 'cancelled' }
            }
        },
        {
            $project: {
                startTime: 1,
                endTime: 1,
                duration: 1,
                eventType: 1
            }
        },
        {
            $sort: { startTime: 1 }
        }
    ]);
};

module.exports = mongoose.model('StaffCalendar', StaffCalendarSchema);
