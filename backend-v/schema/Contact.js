const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    // Basic contact information
    name: {
        type: String,
        trim: true,
        index: true
    },

    phone: {
        type: String,
        trim: true,
        index: true,
        sparse: true // Allow null values but ensure uniqueness when present
    },

    email: {
        type: String,
        trim: true,
        lowercase: true,
        index: true,
        sparse: true
    },

    // WhatsApp specific fields
    whatsappId: {
        type: String,
        trim: true,
        index: true,
        sparse: true
    },

    whatsappName: {
        type: String,
        trim: true
    },

    whatsappProfilePic: {
        type: String,
        trim: true
    },

    // Relationship to users/coaches
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },

    // Lead association
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        index: true
    },

    // Client association
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },

    // Contact source
    source: {
        type: String,
        enum: ['manual', 'lead', 'client', 'whatsapp', 'email', 'import'],
        default: 'manual'
    },

    // Contact tags/labels
    tags: [{
        type: String,
        trim: true,
        index: true
    }],

    // WhatsApp 24-hour window tracking
    lastMessageAt: {
        type: Date,
        index: true
    },

    // Meta's 24-hour window calculation
    windowExpiresAt: {
        type: Date,
        index: true
    },

    // Message statistics
    messageCount: {
        type: Number,
        default: 0
    },

    // Last message content (for preview)
    lastMessage: {
        type: String,
        trim: true
    },

    // Contact status
    status: {
        type: String,
        enum: ['active', 'inactive', 'blocked', 'opted_out'],
        default: 'active',
        index: true
    },

    // Opt-in status for messaging
    whatsappOptIn: {
        type: Boolean,
        default: false
    },

    emailOptIn: {
        type: Boolean,
        default: false
    },

    // Additional metadata
    metadata: {
        type: mongoose.Schema.Types.Mixed
    },

    // Custom fields
    customFields: {
        type: mongoose.Schema.Types.Mixed
    },

    // Contact notes
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    // Add compound indexes for performance
    indexes: [
        { phone: 1, coachId: 1 },
        { email: 1, coachId: 1 },
        { whatsappId: 1, coachId: 1 },
        { status: 1, lastMessageAt: -1 },
        { windowExpiresAt: 1 },
        { tags: 1 },
        { source: 1, coachId: 1 }
    ]
});

// Static methods
contactSchema.statics.findByPhone = function(phone, coachId = null) {
    const query = { phone };
    if (coachId) query.coachId = coachId;
    return this.findOne(query);
};

contactSchema.statics.findByEmail = function(email, coachId = null) {
    const query = { email };
    if (coachId) query.coachId = coachId;
    return this.findOne(query);
};

contactSchema.statics.findByWhatsAppId = function(whatsappId, coachId = null) {
    const query = { whatsappId };
    if (coachId) query.coachId = coachId;
    return this.findOne(query);
};

contactSchema.statics.getContactsWithin24Hours = function(coachId = null) {
    const query = {
        windowExpiresAt: { $gt: new Date() },
        status: 'active'
    };
    if (coachId) query.coachId = coachId;

    return this.find(query).sort({ lastMessageAt: -1 });
};

contactSchema.statics.getContactsExpiringSoon = function(hours = 2, coachId = null) {
    const now = new Date();
    const futureTime = new Date(now.getTime() + (hours * 60 * 60 * 1000));

    const query = {
        windowExpiresAt: { $gt: now, $lte: futureTime },
        status: 'active'
    };
    if (coachId) query.coachId = coachId;

    return this.find(query).sort({ windowExpiresAt: 1 });
};

contactSchema.statics.searchContacts = function(searchTerm, coachId = null, limit = 20) {
    const query = {
        $and: [
            {
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { phone: { $regex: searchTerm, $options: 'i' } },
                    { email: { $regex: searchTerm, $options: 'i' } },
                    { whatsappName: { $regex: searchTerm, $options: 'i' } }
                ]
            },
            { status: 'active' }
        ]
    };

    if (coachId) query.$and.push({ coachId });

    return this.find(query)
        .sort({ lastMessageAt: -1 })
        .limit(limit);
};

contactSchema.statics.updateLastMessage = function(contactId, messageContent, messageType = 'whatsapp') {
    const updateData = {
        lastMessage: messageContent,
        lastMessageAt: new Date(),
        messageCount: 1, // Will be incremented by $inc
    };

    // Update 24-hour window for WhatsApp
    if (messageType === 'whatsapp') {
        updateData.windowExpiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours from now
    }

    return this.findByIdAndUpdate(contactId, {
        $set: updateData,
        $inc: { messageCount: 1 }
    }, { new: true });
};

// Instance methods
contactSchema.methods.isWithin24HourWindow = function() {
    return this.windowExpiresAt && this.windowExpiresAt > new Date();
};

contactSchema.methods.getWindowTimeRemaining = function() {
    if (!this.windowExpiresAt) return 0;

    const now = new Date();
    const remaining = this.windowExpiresAt - now;
    return Math.max(0, Math.floor(remaining / (1000 * 60))); // Return minutes remaining
};

contactSchema.methods.optInForWhatsApp = function() {
    this.whatsappOptIn = true;
    this.status = 'active';
    return this.save();
};

contactSchema.methods.optInForEmail = function() {
    this.emailOptIn = true;
    this.status = 'active';
    return this.save();
};

contactSchema.methods.optOut = function() {
    this.status = 'opted_out';
    this.whatsappOptIn = false;
    this.emailOptIn = false;
    return this.save();
};

module.exports = mongoose.model('Contact', contactSchema);