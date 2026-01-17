const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminUserSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: { 
        type: String, 
        required: true,
        minlength: 8
    },
    firstName: { 
        type: String, 
        required: true, 
        trim: true,
        maxlength: 50
    },
    lastName: { 
        type: String, 
        required: true, 
        trim: true,
        maxlength: 50
    },
    role: { 
        type: String, 
        enum: ['super_admin', 'admin', 'moderator', 'viewer'], 
        default: 'admin' 
    },
    permissions: {
        // System Management
        systemSettings: { type: Boolean, default: false },
        userManagement: { type: Boolean, default: false },
        paymentSettings: { type: Boolean, default: false },
        mlmSettings: { type: Boolean, default: false },
        
        // Content Management
        coachManagement: { type: Boolean, default: false },
        planManagement: { type: Boolean, default: false },
        contentModeration: { type: Boolean, default: false },
        
        // Analytics & Reports
        viewAnalytics: { type: Boolean, default: false },
        exportData: { type: Boolean, default: false },
        financialReports: { type: Boolean, default: false },
        
        // System Operations
        systemLogs: { type: Boolean, default: false },
        maintenanceMode: { type: Boolean, default: false },
        backupRestore: { type: Boolean, default: false },
        
        // Security
        securitySettings: { type: Boolean, default: false },
        auditLogs: { type: Boolean, default: false },
        twoFactorAuth: { type: Boolean, default: false }
    },
    profile: {
        avatar: { type: String, default: '' },
        phone: { type: String, default: '' },
        timezone: { type: String, default: 'UTC' },
        language: { type: String, default: 'en' },
        notifications: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: false },
            push: { type: Boolean, default: true }
        }
    },
    security: {
        twoFactorEnabled: { type: Boolean, default: false },
        twoFactorSecret: { type: String, default: '' },
        lastPasswordChange: { type: Date, default: Date.now },
        passwordHistory: [{ type: String }],
        loginAttempts: { type: Number, default: 0 },
        lockoutUntil: { type: Date },
        lastLogin: { type: Date },
        lastLoginIP: { type: String },
        sessionTokens: [{ 
            token: { type: String },
            createdAt: { type: Date, default: Date.now },
            expiresAt: { type: Date },
            ipAddress: { type: String },
            userAgent: { type: String }
        }]
    },
    status: { 
        type: String, 
        enum: ['active', 'inactive', 'suspended', 'pending'], 
        default: 'pending' 
    },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' }
}, { 
    timestamps: true,
    versionKey: false 
});

// Indexes
adminUserSchema.index({ role: 1 });
adminUserSchema.index({ status: 1 });
adminUserSchema.index({ 'security.lastLogin': -1 });

// Pre-save middleware to hash password
adminUserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        
        // Add to password history
        if (!this.passwordHistory) {
            this.passwordHistory = [];
        }
        if (this.passwordHistory.length >= 5) {
            this.passwordHistory.shift();
        }
        this.passwordHistory.push(this.password);
        
        next();
    } catch (error) {
        next(error);
    }
});

// Instance methods
adminUserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

adminUserSchema.methods.isPasswordInHistory = async function(newPassword) {
    for (const oldPassword of this.passwordHistory) {
        if (await bcrypt.compare(newPassword, oldPassword)) {
            return true;
        }
    }
    return false;
};

adminUserSchema.methods.isLocked = function() {
    return !!(this.security.lockoutUntil && this.security.lockoutUntil > Date.now());
};

adminUserSchema.methods.incrementLoginAttempts = function() {
    // If we have a previous lock that has expired, restart at 1
    if (this.security.lockoutUntil && this.security.lockoutUntil < Date.now()) {
        return this.updateOne({
            $unset: { 'security.lockoutUntil': 1 },
            $set: { 'security.loginAttempts': 1 }
        });
    }
    
    const updates = { $inc: { 'security.loginAttempts': 1 } };
    
    // Lock account after 5 failed attempts for 30 minutes
    if (this.security.loginAttempts + 1 >= 5 && !this.isLocked()) {
        updates.$set = { 'security.lockoutUntil': Date.now() + 30 * 60 * 1000 }; // 30 minutes
    }
    
    return this.updateOne(updates);
};

adminUserSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $unset: { 'security.loginAttempts': 1, 'security.lockoutUntil': 1 }
    });
};

adminUserSchema.methods.hasPermission = function(permission) {
    // Super admin has all permissions
    if (this.role === 'super_admin') return true;
    
    // Check specific permission
    return this.permissions[permission] === true;
};

adminUserSchema.methods.getFullName = function() {
    return `${this.firstName} ${this.lastName}`;
};

adminUserSchema.methods.toSafeObject = function() {
    const obj = this.toObject();
    delete obj.password;
    delete obj.passwordHistory;
    delete obj.security.twoFactorSecret;
    delete obj.passwordResetToken;
    delete obj.emailVerificationToken;
    return obj;
};

// Static methods
adminUserSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};

adminUserSchema.statics.findActiveAdmins = function() {
    return this.find({ status: 'active' }).select('-password -passwordHistory');
};

adminUserSchema.statics.getAdminStats = function() {
    return this.aggregate([
        {
            $group: {
                _id: '$role',
                count: { $sum: 1 }
            }
        }
    ]);
};

module.exports = mongoose.models.AdminUser || mongoose.model('AdminUser', adminUserSchema);