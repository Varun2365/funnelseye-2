const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // OTP expires after 300 seconds (5 minutes)
                     // MongoDB will automatically delete documents after this time
    }
});

// Create a unique index on email to prevent multiple OTPs for the same email
otpSchema.index({ email: 1 }, { unique: true });

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;