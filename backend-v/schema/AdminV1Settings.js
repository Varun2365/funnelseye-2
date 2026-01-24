const mongoose = require('mongoose');

// ===== ADMIN V1 GLOBAL SETTINGS SCHEMA =====
// This schema contains all platform-wide settings that can be configured by admins

const adminV1SettingsSchema = new mongoose.Schema({
    // Unique identifier for the settings document
    settingId: {
        type: String,
        default: 'global',
        unique: true,
        required: true
    },

    // ===== PLATFORM CONFIGURATION =====
    platformConfig: {
        // Basic platform information
        platformName: {
            type: String,
            default: 'FunnelEye Platform',
            required: true
        },
        platformVersion: {
            type: String,
            default: '1.0.0'
        },
        platformDescription: {
            type: String,
            default: 'Advanced coaching and MLM platform'
        },
        
        // Localization settings
        defaultLanguage: {
            type: String,
            default: 'en',
            enum: ['en', 'hi', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko']
        },
        supportedLanguages: [{
            type: String,
            enum: ['en', 'hi', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko']
        }],
        defaultTimezone: {
            type: String,
            default: 'Asia/Kolkata'
        },
        defaultCurrency: {
            type: String,
            default: 'INR',
            enum: ['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY']
        },
        
        // Feature toggles
        features: {
            mlmEnabled: {
                type: Boolean,
                default: true
            },
            aiEnabled: {
                type: Boolean,
                default: true
            },
            messagingEnabled: {
                type: Boolean,
                default: true
            },
            communityEnabled: {
                type: Boolean,
                default: true
            },
            marketingEnabled: {
                type: Boolean,
                default: true
            },
            analyticsEnabled: {
                type: Boolean,
                default: true
            },
            gamificationEnabled: {
                type: Boolean,
                default: false
            }
        },
        
        // System limits
        limits: {
            maxUsersPerCoach: {
                type: Number,
                default: 100,
                min: 1,
                max: 10000
            },
            maxCoachesPerAdmin: {
                type: Number,
                default: 50,
                min: 1,
                max: 1000
            },
            maxSubscriptionDuration: {
                type: Number,
                default: 365,
                min: 1,
                max: 3650
            },
            maxFileUploadSize: {
                type: Number,
                default: 10485760, // 10MB in bytes
                min: 1048576, // 1MB
                max: 104857600 // 100MB
            },
        },
        
        // Maintenance mode
        maintenanceMode: {
            enabled: {
                type: Boolean,
                default: false
            },
            message: {
                type: String,
                default: 'Platform is under maintenance. Please try again later.'
            },
            scheduledStart: Date,
            scheduledEnd: Date
        },
        
        // Branding
        branding: {
            logoUrl: String,
            faviconUrl: String,
            primaryColor: {
                type: String,
                default: '#3B82F6'
            },
            secondaryColor: {
                type: String,
                default: '#1E40AF'
            },
            customCss: String,
            customJs: String
        }
    },

    // ===== PAYMENT SYSTEM SETTINGS =====
    paymentSystem: {
        // Razorpay configuration
        razorpay: {
            keyId: String,
            keySecret: String,
            accountNumber: String,
            webhookSecret: String,
            isEnabled: {
                type: Boolean,
                default: false
            }
        },
        
        // Platform fees
        platformFees: {
            subscriptionFee: {
                type: Number,
                default: 5.0,
                min: 0,
                max: 100
            },
            transactionFee: {
                type: Number,
                default: 2.0,
                min: 0,
                max: 100
            },
            payoutFee: {
                type: Number,
                default: 1.0,
                min: 0,
                max: 100
            },
            refundFee: {
                type: Number,
                default: 0.5,
                min: 0,
                max: 100
            }
        },
        
        // MLM Commission Structure
        mlmCommissionStructure: {
            levels: [{
                level: {
                    type: Number,
                    required: true,
                    min: 1,
                    max: 20
                },
                percentage: {
                    type: Number,
                    required: true,
                    min: 0,
                    max: 100
                }
            }],
            platformFeePercentage: {
                type: Number,
                default: 5,
                min: 0,
                max: 100
            },
            maxLevels: {
                type: Number,
                default: 3,
                min: 1,
                max: 20
            },
            autoPayoutEnabled: {
                type: Boolean,
                default: true
            },
            payoutThreshold: {
                type: Number,
                default: 100,
                min: 0
            }
        },
        
        // Currency settings
        currencies: {
            supported: [{
                type: String,
                enum: ['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY']
            }],
            default: {
                type: String,
                default: 'INR'
            }
        },
        
        // Tax settings
        taxSettings: {
            gstEnabled: {
                type: Boolean,
                default: true
            },
            gstPercentage: {
                type: Number,
                default: 18,
                min: 0,
                max: 100
            },
            taxInclusive: {
                type: Boolean,
                default: true
            }
        }
    },

    // ===== MLM SYSTEM SETTINGS =====
    mlmSystem: {
        // Commission eligibility rules
        commissionEligibility: {
            minimumCoachLevel: {
                type: Number,
                default: 1,
                min: 1,
                max: 20
            },
            minimumPerformanceRating: {
                type: Number,
                default: 3.0,
                min: 1.0,
                max: 5.0
            },
            minimumActiveDays: {
                type: Number,
                default: 30,
                min: 1,
                max: 365
            },
            minimumTeamSize: {
                type: Number,
                default: 5,
                min: 0,
                max: 1000
            },
            minimumMonthlyRevenue: {
                type: Number,
                default: 1000,
                min: 0
            },
            requireActiveSubscription: {
                type: Boolean,
                default: true
            }
        },
        
        // Rank advancement rules
        rankAdvancement: {
            autoAdvancement: {
                type: Boolean,
                default: true
            },
            advancementCriteria: [{
                rank: {
                    type: String,
                    required: true
                },
                requiredTeamSize: {
                    type: Number,
                    required: true
                },
                requiredMonthlyRevenue: {
                    type: Number,
                    required: true
                },
                requiredPerformanceRating: {
                    type: Number,
                    required: true
                }
            }]
        }
    },

    // ===== SECURITY SETTINGS =====
    security: {
        // Password policy
        passwordPolicy: {
            minLength: {
                type: Number,
                default: 8,
                min: 6,
                max: 20
            },
            requireUppercase: {
                type: Boolean,
                default: true
            },
            requireLowercase: {
                type: Boolean,
                default: true
            },
            requireNumbers: {
                type: Boolean,
                default: true
            },
            requireSpecialChars: {
                type: Boolean,
                default: true
            },
            passwordHistory: {
                type: Number,
                default: 5,
                min: 0,
                max: 20
            },
            passwordExpiry: {
                type: Number,
                default: 90, // days
                min: 0,
                max: 365
            }
        },
        
        // Session settings
        sessionSettings: {
            sessionTimeout: {
                type: Number,
                default: 24, // hours
                min: 1,
                max: 168
            },
            maxConcurrentSessions: {
                type: Number,
                default: 3,
                min: 1,
                max: 10
            },
            rememberMeDuration: {
                type: Number,
                default: 30, // days
                min: 1,
                max: 365
            }
        },
        
        // API security
        apiSecurity: {
            rateLimiting: {
                enabled: {
                    type: Boolean,
                    default: true
                },
                requestsPerMinute: {
                    type: Number,
                    default: 100,
                    min: 10,
                    max: 10000
                },
                burstLimit: {
                    type: Number,
                    default: 200,
                    min: 20,
                    max: 20000
                }
            },
            ipWhitelist: [String],
            ipBlacklist: [String],
            requireHttps: {
                type: Boolean,
                default: true
            }
        },
        
        // MFA settings
        mfaSettings: {
            enabled: {
                type: Boolean,
                default: false
            },
            requiredForAdmins: {
                type: Boolean,
                default: true
            },
            requiredForCoaches: {
                type: Boolean,
                default: false
            },
            backupCodesCount: {
                type: Number,
                default: 10,
                min: 5,
                max: 20
            }
        }
    },

    // ===== MESSAGING SYSTEM SETTINGS =====
    messagingSystem: {
        // WhatsApp configuration
        whatsapp: {
            enabled: {
                type: Boolean,
                default: true
            },
            provider: {
                type: String,
                enum: ['gupshup', 'twilio', '360dialog', 'meta'],
                default: 'gupshup'
            },
            apiKey: String,
            templateId: String,
            phoneNumber: String,
            webhookUrl: String
        },
        
        // Email configuration
        email: {
            enabled: {
                type: Boolean,
                default: true
            },
            provider: {
                type: String,
                enum: ['sendgrid', 'mailgun', 'ses', 'smtp'],
                default: 'sendgrid'
            },
            apiKey: String,
            fromEmail: String,
            fromName: String,
            smtpConfig: {
                host: String,
                port: Number,
                secure: Boolean,
                username: String,
                password: String
            }
        },
        
        // Push notifications
        push: {
            enabled: {
                type: Boolean,
                default: true
            },
            provider: {
                type: String,
                enum: ['fcm', 'apns', 'webpush'],
                default: 'fcm'
            },
            serverKey: String,
            bundleId: String,
            webPushKey: String
        },
        
        // Automation settings
        automation: {
            welcomeSequence: {
                enabled: {
                    type: Boolean,
                    default: true
                },
                delayMinutes: {
                    type: Number,
                    default: 5,
                    min: 0,
                    max: 1440
                }
            },
            reminderSequence: {
                enabled: {
                    type: Boolean,
                    default: true
                },
                reminderIntervals: [{
                    type: Number,
                    min: 1,
                    max: 168 // hours
                }]
            },
            milestoneSequence: {
                enabled: {
                    type: Boolean,
                    default: true
                },
                milestones: [{
                    type: String,
                    enum: ['first_login', 'first_purchase', 'weight_loss_1kg', 'weight_loss_5kg', 'streak_7days', 'streak_30days']
                }]
            }
        }
    },

    // ===== AI SYSTEM SETTINGS =====
    aiSystem: {
        // AI Nutritionist settings
        nutritionist: {
            enabled: {
                type: Boolean,
                default: true
            },
            model: {
                type: String,
                enum: ['gpt-3.5-turbo', 'gpt-4', 'claude-3-sonnet', 'claude-3-haiku'],
                default: 'gpt-3.5-turbo'
            },
            temperature: {
                type: Number,
                default: 0.7,
                min: 0,
                max: 2
            },
            maxTokens: {
                type: Number,
                default: 500,
                min: 100,
                max: 4000
            },
            safetyMode: {
                type: Boolean,
                default: true
            },
            customInstructions: String,
            knowledgeBase: [String]
        },
        
        // AI Support settings
        support: {
            enabled: {
                type: Boolean,
                default: true
            },
            escalationThreshold: {
                type: Number,
                default: 3,
                min: 1,
                max: 10
            },
            humanHandoff: {
                type: Boolean,
                default: true
            },
            responseDelay: {
                type: Number,
                default: 1000, // milliseconds
                min: 0,
                max: 10000
            }
        },
        
        // AI Automation settings
        automation: {
            enabled: {
                type: Boolean,
                default: true
            },
            maxRetries: {
                type: Number,
                default: 3,
                min: 1,
                max: 10
            },
            retryDelay: {
                type: Number,
                default: 5000, // milliseconds
                min: 1000,
                max: 60000
            }
        }
    },

    // ===== NOTIFICATION SETTINGS =====
    notifications: {
        // Global notification settings
        global: {
            enabled: {
                type: Boolean,
                default: true
            },
            quietHours: {
                enabled: {
                    type: Boolean,
                    default: true
                },
                startTime: {
                    type: String,
                    default: '22:00'
                },
                endTime: {
                    type: String,
                    default: '08:00'
                },
                timezone: {
                    type: String,
                    default: 'Asia/Kolkata'
                }
            }
        },
        
        // Channel-specific settings
        channels: {
            email: {
                enabled: {
                    type: Boolean,
                    default: true
                },
                frequency: {
                    type: String,
                    enum: ['immediate', 'daily', 'weekly'],
                    default: 'immediate'
                }
            },
            whatsapp: {
                enabled: {
                    type: Boolean,
                    default: true
                },
                frequency: {
                    type: String,
                    enum: ['immediate', 'daily', 'weekly'],
                    default: 'immediate'
                }
            },
            push: {
                enabled: {
                    type: Boolean,
                    default: true
                },
                frequency: {
                    type: String,
                    enum: ['immediate', 'daily', 'weekly'],
                    default: 'immediate'
                }
            }
        },
        
        // Notification templates
        templates: [{
            type: {
                type: String,
                required: true,
                enum: ['welcome', 'reminder', 'milestone', 'payment', 'subscription', 'security']
            },
            channel: {
                type: String,
                required: true,
                enum: ['email', 'whatsapp', 'push']
            },
            subject: String,
            content: {
                type: String,
                required: true
            },
            variables: [String],
            isActive: {
                type: Boolean,
                default: true
            }
        }]
    },

    // ===== INTEGRATION SETTINGS =====
    integrations: {
        // Zoom integration
        zoom: {
            enabled: {
                type: Boolean,
                default: true
            },
            clientId: String,
            clientSecret: String,
            redirectUri: String,
            webhookSecret: String
        },
        
        // Google Calendar integration
        googleCalendar: {
            enabled: {
                type: Boolean,
                default: true
            },
            clientId: String,
            clientSecret: String,
            redirectUri: String
        },
        
        // Health tracking integrations
        healthTracking: {
            googleFit: {
                enabled: {
                    type: Boolean,
                    default: true
                },
                clientId: String,
                clientSecret: String
            },
            appleHealth: {
                enabled: {
                    type: Boolean,
                    default: true
                },
                bundleId: String
            }
        },
        
        // Analytics integrations
        analytics: {
            googleAnalytics: {
                enabled: {
                    type: Boolean,
                    default: false
                },
                trackingId: String
            },
            facebookPixel: {
                enabled: {
                    type: Boolean,
                    default: false
                },
                pixelId: String
            }
        }
    },

    // ===== SYSTEM STATUS =====
    systemStatus: {
        lastUpdated: {
            type: Date,
            default: Date.now
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AdminUser'
        },
        version: {
            type: String,
            default: '1.0.0'
        },
        environment: {
            type: String,
            enum: ['development', 'staging', 'production'],
            default: 'development'
        }
    },

    // ===== AUDIT TRAIL =====
    auditTrail: [{
        action: {
            type: String,
            required: true
        },
        section: {
            type: String,
            required: true
        },
        changes: {
            before: mongoose.Schema.Types.Mixed,
            after: mongoose.Schema.Types.Mixed
        },
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AdminUser',
            required: true
        },
        adminEmail: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        ipAddress: String,
        userAgent: String
    }]
}, {
    timestamps: true,
    versionKey: false
});

// Indexes for better performance
adminV1SettingsSchema.index({ 'systemStatus.lastUpdated': -1 });
adminV1SettingsSchema.index({ 'auditTrail.timestamp': -1 });

// Methods
adminV1SettingsSchema.methods.updateSetting = function(section, data, adminId, adminEmail, req) {
    const before = JSON.parse(JSON.stringify(this[section]));
    this[section] = { ...this[section], ...data };
    this.systemStatus.lastUpdated = new Date();
    this.systemStatus.updatedBy = adminId;
    
    // Add to audit trail
    this.auditTrail.push({
        action: 'UPDATE_SETTINGS',
        section: section,
        changes: {
            before: before,
            after: this[section]
        },
        adminId: adminId,
        adminEmail: adminEmail,
        timestamp: new Date(),
        ipAddress: req?.ip || req?.connection?.remoteAddress,
        userAgent: req?.get('User-Agent')
    });
    
    return this.save();
};

adminV1SettingsSchema.methods.getSetting = function(section, key) {
    if (key) {
        return this[section]?.[key];
    }
    return this[section];
};

adminV1SettingsSchema.methods.isFeatureEnabled = function(feature) {
    return this.platformConfig?.features?.[feature] || false;
};

adminV1SettingsSchema.methods.getAuditTrail = function(limit = 50) {
    return this.auditTrail
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
};

// Static methods
adminV1SettingsSchema.statics.getGlobalSettings = async function() {
    let settings = await this.findOne({ settingId: 'global' });
    if (!settings) {
        settings = new this({ settingId: 'global' });
        await settings.save();
    }
    return settings;
};

adminV1SettingsSchema.statics.updateGlobalSettings = async function(section, data, adminId, adminEmail, req) {
    const settings = await this.getGlobalSettings();
    return await settings.updateSetting(section, data, adminId, adminEmail, req);
};

module.exports = mongoose.model('AdminV1Settings', adminV1SettingsSchema);
