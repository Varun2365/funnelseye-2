const mongoose = require('mongoose');

const whatsAppDeviceSchema = new mongoose.Schema({
    // Device ID for microservice compatibility
    deviceId: {
        type: String,
        unique: true,
        sparse: true, // Allow multiple null values
        default: function() {
            return this._id ? this._id.toString() : null;
        }
    },
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coach',
        required: true
    },
    deviceName: {
        type: String,
        required: true,
        trim: true
    },
    deviceType: {
        type: String,
        enum: ['meta'],
        required: true
    },
    // Meta specific fields
    phoneNumberId: {
        type: String,
        trim: true
    },
    whatsAppBusinessAccountId: {
        type: String,
        trim: true,
        sparse: true
    },
    accessToken: {
        type: String,
        trim: true,
        select: false,
        sparse: true
    },
    // Common fields
    phoneNumber: {
        type: String,
        trim: true,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    creditsPerMessage: {
        type: Number,
        default: 1
    },
    monthlyMessageLimit: {
        type: Number,
        default: 1000
    },
    messagesSentThisMonth: {
        type: Number,
        default: 0
    },
    messagesReceivedThisMonth: {
        type: Number,
        default: 0
    },
    settings: {
        autoReply: {
            type: Boolean,
            default: false
        },
        autoReplyMessage: {
            type: String,
            trim: true,
            default: ''
        },
        businessHours: {
            enabled: {
                type: Boolean,
                default: false
            },
            startTime: {
                type: String,
                default: '09:00'
            },
            endTime: {
                type: String,
                default: '17:00'
            },
            timezone: {
                type: String,
                default: 'UTC'
            },
            awayMessage: {
                type: String,
                default: 'We are currently closed. We will respond during business hours.'
            }
        }
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Indexes
whatsAppDeviceSchema.index({ coachId: 1, isActive: 1 });
whatsAppDeviceSchema.index({ sessionId: 1 }, { sparse: true });
whatsAppDeviceSchema.index({ phoneNumberId: 1 }, { sparse: true });

// Ensure deviceId is set and only one default device per coach
whatsAppDeviceSchema.pre('save', async function(next) {
    // Set deviceId if not already set
    if (!this.deviceId) {
        this.deviceId = this._id ? this._id.toString() : new mongoose.Types.ObjectId().toString();
    }
    
    // Ensure only one default device per coach
    if (this.isDefault) {
        await this.constructor.updateMany(
            { coachId: this.coachId, _id: { $ne: this._id } },
            { isDefault: false }
        );
    }
    next();
});

module.exports = mongoose.model('WhatsAppDevice', whatsAppDeviceSchema);
