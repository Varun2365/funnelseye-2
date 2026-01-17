const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
    commissionId: {
        type: String,
        required: true,
        unique: true
    },
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
        required: true
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subscriptionAmount: {
        type: Number,
        required: true
    },
    commissionPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    commissionAmount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true,
        default: 'USD'
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'approved', 'paid', 'cancelled'],
        default: 'pending'
    },
    paymentDate: {
        type: Date
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    year: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
commissionSchema.index({ coachId: 1 });
commissionSchema.index({ referredBy: 1 });
commissionSchema.index({ status: 1 });
commissionSchema.index({ month: 1, year: 1 });
commissionSchema.index({ paymentDate: 1 });

module.exports = mongoose.models.Commission || mongoose.model('Commission', commissionSchema);
