const mongoose = require('mongoose');
const crypto = require('crypto');

const coachMarketingCredentialsSchema = new mongoose.Schema({
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },

    // Meta/Facebook Ads Credentials
    metaAds: {
        accessToken: {
            type: String,
            required: false,
            select: false // Don't include in queries by default
        },
        appId: {
            type: String,
            trim: true,
            required: false
        },
        appSecret: {
            type: String,
            required: false,
            select: false
        },
        businessAccountId: {
            type: String,
            trim: true,
            required: false
        },
        adAccountId: {
            type: String,
            trim: true,
            required: false
        },
        pixelId: {
            type: String,
            trim: true,
            required: false,
            default: null
        },
        pixelEnabled: {
            type: Boolean,
            default: false
        },
        exitIntentTrackingEnabled: {
            type: Boolean,
            default: false // Feature flag for exit intent tracking
        },
        facebookPageId: {
            type: String,
            trim: true,
            required: false
        },
        instagramAccountId: {
            type: String,
            trim: true,
            required: false
        },
        isConnected: {
            type: Boolean,
            default: false
        },
        lastVerified: {
            type: Date,
            default: null
        },
        permissions: [{
            type: String,
            enum: ['ads_management', 'pages_manage_posts', 'pages_read_engagement', 'instagram_basic', 'instagram_content_publish']
        }]
    },

    // OpenAI Credentials (for AI content generation)
    openAI: {
        apiKey: {
            type: String,
            required: false,
            select: false
        },
        isConnected: {
            type: Boolean,
            default: false
        },
        lastVerified: {
            type: Date,
            default: null
        },
        modelPreference: {
            type: String,
            enum: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo-preview'],
            default: 'gpt-4'
        }
    },

    // Marketing Preferences
    preferences: {
        autoPublish: {
            type: Boolean,
            default: false
        },
        requireApproval: {
            type: Boolean,
            default: true
        },
        defaultBudget: {
            type: Number,
            default: 25,
            min: 1
        },
        defaultDuration: {
            type: Number,
            default: 7, // days
            min: 1,
            max: 30
        },
        timezone: {
            type: String,
            default: 'UTC'
        },
        language: {
            type: String,
            default: 'en'
        },
        currency: {
            type: String,
            enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'],
            default: 'USD'
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },

    // Security and Audit
    encryptionKey: {
        type: String,
        required: true,
        select: false
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }

}, {
    timestamps: true
});

// Encrypt sensitive data before saving
coachMarketingCredentialsSchema.pre('save', function(next) {
    try {
        if (this.isModified('metaAds.accessToken') && this.metaAds.accessToken) {
            // Only encrypt if it's not already encrypted (encrypted tokens are much longer)
            if (this.metaAds.accessToken.length < 200) {
                console.log(`[PreSave] Encrypting access token, original length: ${this.metaAds.accessToken.length}`);
                const encrypted = this.encrypt(this.metaAds.accessToken);
                if (!encrypted) {
                    return next(new Error('Failed to encrypt access token'));
                }
                this.metaAds.accessToken = encrypted;
                console.log(`[PreSave] Access token encrypted, new length: ${this.metaAds.accessToken.length}`);
            } else {
                console.log(`[PreSave] Access token appears already encrypted (length: ${this.metaAds.accessToken.length}), skipping encryption`);
            }
        }
        if (this.isModified('metaAds.appSecret') && this.metaAds.appSecret) {
            if (this.metaAds.appSecret.length < 200) {
                const encrypted = this.encrypt(this.metaAds.appSecret);
                if (!encrypted) {
                    return next(new Error('Failed to encrypt app secret'));
                }
                this.metaAds.appSecret = encrypted;
            }
        }
        if (this.isModified('openAI.apiKey') && this.openAI.apiKey) {
            if (this.openAI.apiKey.length < 200) {
                const encrypted = this.encrypt(this.openAI.apiKey);
                if (!encrypted) {
                    return next(new Error('Failed to encrypt OpenAI API key'));
                }
                this.openAI.apiKey = encrypted;
            }
        }
        next();
    } catch (error) {
        console.error('[PreSave] Error in pre-save hook:', error);
        next(error);
    }
});

// Decrypt sensitive data when retrieving
coachMarketingCredentialsSchema.methods.decrypt = function(encryptedData) {
    if (!encryptedData) {
        console.warn('[Decrypt] No encrypted data provided');
        return null;
    }
    
    if (!this.encryptionKey) {
        console.error('[Decrypt] No encryption key available');
        return null;
    }
    
    try {
        // Check if data looks encrypted (should be at least 64 chars: 32 for IV + 32 for encrypted data)
        if (encryptedData.length < 64) {
            console.warn(`[Decrypt] Data too short to be encrypted (length: ${encryptedData.length}), might be plain text`);
            // If it's too short, it might be plain text - return as-is (but log warning)
            return encryptedData;
        }
        
        const algorithm = 'aes-256-cbc';
        const key = Buffer.from(this.encryptionKey, 'hex');
        
        // Validate key length
        if (key.length !== 32) {
            console.error(`[Decrypt] Invalid encryption key length: ${key.length}, expected 32`);
            return null;
        }
        
        // Extract IV (first 32 hex chars = 16 bytes)
        const ivHex = encryptedData.substring(0, 32);
        const encrypted = encryptedData.substring(32);
        
        // Validate IV
        if (ivHex.length !== 32 || !/^[0-9a-fA-F]+$/.test(ivHex)) {
            console.error(`[Decrypt] Invalid IV format: ${ivHex.substring(0, 10)}...`);
            return null;
        }
        
        const iv = Buffer.from(ivHex, 'hex');
        if (iv.length !== 16) {
            console.error(`[Decrypt] Invalid IV length: ${iv.length}, expected 16`);
            return null;
        }
        
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error('[Decrypt] Decryption error:', error.message);
        console.error('[Decrypt] Error code:', error.code);
        console.error('[Decrypt] Encrypted data length:', encryptedData.length);
        console.error('[Decrypt] Encrypted data preview:', encryptedData.substring(0, 50));
        return null;
    }
};

// Encrypt sensitive data
coachMarketingCredentialsSchema.methods.encrypt = function(data) {
    if (!data) {
        console.warn('[Encrypt] No data provided to encrypt');
        return null;
    }
    
    if (!this.encryptionKey) {
        console.error('[Encrypt] No encryption key available');
        throw new Error('Encryption key is required but not found');
    }
    
    try {
        const algorithm = 'aes-256-cbc';
        const key = Buffer.from(this.encryptionKey, 'hex');
        if (key.length !== 32) {
            console.error(`[Encrypt] Invalid encryption key length: ${key.length}, expected 32`);
            throw new Error('Invalid encryption key length');
        }
        const iv = crypto.randomBytes(16);
        
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const result = iv.toString('hex') + encrypted;
        console.log(`[Encrypt] Successfully encrypted data, result length: ${result.length}`);
        return result;
    } catch (error) {
        console.error('[Encrypt] Encryption error:', error);
        console.error('[Encrypt] Error stack:', error.stack);
        throw new Error(`Failed to encrypt data: ${error.message}`);
    }
};

// Generate encryption key
coachMarketingCredentialsSchema.methods.generateEncryptionKey = function() {
    return crypto.randomBytes(32).toString('hex');
};

// Get decrypted access token
coachMarketingCredentialsSchema.methods.getDecryptedAccessToken = function() {
    return this.decrypt(this.metaAds.accessToken);
};

// Get decrypted app secret
coachMarketingCredentialsSchema.methods.getDecryptedAppSecret = function() {
    return this.decrypt(this.metaAds.appSecret);
};

// Get decrypted OpenAI API key
coachMarketingCredentialsSchema.methods.getDecryptedOpenAIKey = function() {
    return this.decrypt(this.openAI.apiKey);
};

// Verify Meta credentials
coachMarketingCredentialsSchema.methods.verifyMetaCredentials = async function() {
    try {
        const accessToken = this.getDecryptedAccessToken();
        if (!accessToken) return false;

        const axios = require('axios');
        const response = await axios.get(`https://graph.facebook.com/v19.0/me?access_token=${accessToken}`);
        
        this.metaAds.isConnected = true;
        this.metaAds.lastVerified = new Date();
        await this.save();
        
        return true;
    } catch (error) {
        this.metaAds.isConnected = false;
        await this.save();
        return false;
    }
};

// Verify OpenAI credentials
coachMarketingCredentialsSchema.methods.verifyOpenAICredentials = async function() {
    try {
        const apiKey = this.getDecryptedOpenAIKey();
        if (!apiKey) return false;

        const axios = require('axios');
        const response = await axios.get('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });
        
        this.openAI.isConnected = true;
        this.openAI.lastVerified = new Date();
        await this.save();
        
        return true;
    } catch (error) {
        this.openAI.isConnected = false;
        await this.save();
        return false;
    }
};

module.exports = mongoose.model('CoachMarketingCredentials', coachMarketingCredentialsSchema);

