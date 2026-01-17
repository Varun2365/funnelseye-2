const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    age: {
        type: Number,
        min: 0
    },
    dateOfBirth: {
        type: Date
    },
    bio: {
        type: String,
        trim: true,
        default: ''
    },
    tagline: {
        type: String,
        trim: true,
        default: ''
    },
    company: {
        type: String,
        trim: true,
        default: ''
    },
    phone: {
        type: String,
        trim: true,
    },
    country: {
        type: String,
        trim: true,
        default: ''
    },
    city: {
        type: String,
        trim: true,
        default: ''
    },
    role: {
        type: String,
        enum: ['coach', 'admin', 'client', 'super_admin', 'staff'],
        default: 'client'
    },
    profilePictureUrl: {
        type: String,
        trim: true,
        match: [/^https?:\/\//, 'Please use a valid URL for the profile picture.']
    },
    profilePicture: {
        type: String,
        trim: true,
        default: ''
    },
    bannerImage: {
        type: String,
        trim: true,
        default: ''
    },
    website: {
        type: String,
        trim: true,
        default: ''
    },
    linkedin: {
        type: String,
        trim: true,
        default: ''
    },
    twitter: {
        type: String,
        trim: true,
        default: ''
    },
    facebook: {
        type: String,
        trim: true,
        default: ''
    },
    instagram: {
        type: String,
        trim: true,
        default: ''
    },
    youtube: {
        type: String,
        trim: true,
        default: ''
    },
    address: {
        type: String,
        trim: true,
        default: ''
    },
    zipCode: {
        type: String,
        trim: true,
        default: ''
    },
    state: {
        type: String,
        trim: true,
        default: ''
    },
    achievements: {
        type: [{
            image: { type: String, trim: true, default: '' },
            title: { type: String, trim: true, required: true },
            description: { type: String, trim: true, default: '' }
        }],
        default: [],
        validate: {
            validator: function(v) {
                return v.length <= 10;
            },
            message: 'Maximum 10 achievements allowed'
        }
    },
    experiences: {
        type: [{
            company: { type: String, trim: true, required: true },
            position: { type: String, trim: true, required: true },
            startDate: { type: Date, required: true },
            endDate: { type: Date, default: null },
            isCurrent: { type: Boolean, default: false },
            description: { type: String, trim: true, default: '' },
            location: { type: String, trim: true, default: '' },
            employmentType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Self-employed'], default: 'Full-time' },
            specializations: { type: [String], default: [] },
            certifications: { type: [String], default: [] },
            clientCount: { type: Number, default: null },
            keyResults: { type: String, trim: true, default: '' },
            programsCreated: { type: [String], default: [] },
            trainingMethodologies: { type: [String], default: [] }
        }],
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended', 'pending', 'under_review'],
        default: 'active'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date
    },
    // The new field for tracking active sessions
    lastActiveAt: {
        type: Date,
        default: Date.now
    },
    // Password reset fields
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpire: {
        type: Date
    },
    // Soft delete field
    deletedAt: {
        type: Date,
        default: null
    },
    // Lead Magnet configurations
    leadMagnets: {
        ai_diet_planner: {
            isEnabled: { type: Boolean, default: false },
            downloads: { type: Number, default: 0 },
            leads: { type: Number, default: 0 },
            config: { type: mongoose.Schema.Types.Mixed, default: {} }
        },
        bmi_calculator: {
            isEnabled: { type: Boolean, default: false },
            downloads: { type: Number, default: 0 },
            leads: { type: Number, default: 0 },
            config: { type: mongoose.Schema.Types.Mixed, default: {} }
        },
        fitness_ebook: {
            isEnabled: { type: Boolean, default: false },
            downloads: { type: Number, default: 0 },
            leads: { type: Number, default: 0 },
            config: {
                ebooks: [{
                    title: String,
                    category: String,
                    fileUrl: String,
                    isEnabled: { type: Boolean, default: true }
                }]
            }
        },
        meal_planner: {
            isEnabled: { type: Boolean, default: false },
            downloads: { type: Number, default: 0 },
            leads: { type: Number, default: 0 },
            config: { type: mongoose.Schema.Types.Mixed, default: {} }
        },
        workout_calculator: {
            isEnabled: { type: Boolean, default: false },
            downloads: { type: Number, default: 0 },
            leads: { type: Number, default: 0 },
            config: { type: mongoose.Schema.Types.Mixed, default: {} }
        },
        stress_assessment: {
            isEnabled: { type: Boolean, default: false },
            downloads: { type: Number, default: 0 },
            leads: { type: Number, default: 0 },
            config: { type: mongoose.Schema.Types.Mixed, default: {} }
        }
    },
    
}, {
    timestamps: true,
    discriminatorKey: 'role',
    collection: 'users'
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getSignedJwtToken = function() {
    return jwt.sign(
        { id: this._id, role: this.role },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    );
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function() {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    
    // Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    return resetToken;
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
module.exports = User;