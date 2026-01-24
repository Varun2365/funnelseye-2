const mongoose = require('mongoose');

const adminSystemSettingsSchema = new mongoose.Schema({
    settingId: { type: String, required: true, unique: true, default: 'global' },
    
    // Platform Configuration
    platformConfig: {
        platformName: { type: String, default: 'FunnelsEye' },
        platformVersion: { type: String, default: '1.0.0' },
        maintenanceMode: { type: Boolean, default: false },
        maintenanceMessage: { type: String, default: 'System is under maintenance. Please try again later.' },
        maxUsers: { type: Number, default: 10000 },
        maxCoaches: { type: Number, default: 1000 },
        maxLeads: { type: Number, default: 100000 },
        systemTimezone: { type: String, default: 'UTC' },
        dateFormat: { type: String, default: 'MM/DD/YYYY' },
        timeFormat: { type: String, default: '12h' },
        environment: { type: String, enum: ['development', 'staging', 'production'], default: 'development' },
        debugMode: { type: Boolean, default: true },
        logLevel: { type: String, enum: ['error', 'warn', 'info', 'debug'], default: 'info' }
    },

    // Database Configuration
    databaseConfig: {
        connectionPool: {
            maxPoolSize: { type: Number, default: 10 },
            socketTimeoutMS: { type: Number, default: 0 },
            connectTimeoutMS: { type: Number, default: 30000 },
            serverSelectionTimeoutMS: { type: Number, default: 30000 },
            heartbeatFrequencyMS: { type: Number, default: 10000 }
        },
        retryAttempts: { type: Number, default: 3 },
        retryDelay: { type: Number, default: 1000 }
    },

    // CORS Configuration
    corsConfig: {
        allowedOrigins: [{
            type: String,
            default: [
                'http://localhost:3000',
                'http://localhost:5000',
                'http://localhost:8080',
                'http://localhost:5173',
                'http://127.0.0.1:3000',
                'http://127.0.0.1:5000',
                'http://127.0.0.1:8080',
                'http://127.0.0.1:5173',
                'https://funnelseye.com',
                'https://www.funnelseye.com',
                'https://app.funnelseye.com',
                'https://admin.funnelseye.com',
                'https://api.funnelseye.com'
            ]
        }],
        allowedMethods: [{ type: String, default: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'] }],
        allowedHeaders: [{
            type: String,
            default: [
                'Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin',
                'X-API-Key', 'X-Client-Version', 'Cache-Control', 'Pragma', 'Expires',
                'x-coach-id', 'X-Coach-ID', 'x-user-id', 'X-User-ID', 'x-session-id',
                'X-Session-ID', 'x-request-id', 'X-Request-ID', 'x-forwarded-for',
                'X-Forwarded-For', 'x-real-ip', 'X-Real-IP', 'x-custom-domain',
                'X-Custom-Domain', 'x-auth-token', 'X-Auth-Token', 'x-refresh-token',
                'X-Refresh-Token', 'x-tenant-id', 'X-Tenant-ID', 'x-version', 'X-Version'
            ]
        }],
        credentials: { type: Boolean, default: true },
        maxAge: { type: Number, default: 86400 }
    },

    // Payment System Configuration
    paymentSystem: {
        // Platform Fees
        platformFees: {
            defaultPercentage: { type: Number, default: 10, min: 0, max: 100 },
            byCategory: {
                fitness_training: { type: Number, default: 10 },
                nutrition_coaching: { type: Number, default: 8 },
                weight_loss: { type: Number, default: 12 },
                muscle_gain: { type: Number, default: 10 },
                sports_performance: { type: Number, default: 15 },
                wellness_coaching: { type: Number, default: 8 },
                rehabilitation: { type: Number, default: 12 },
                online_courses: { type: Number, default: 5 },
                ebooks: { type: Number, default: 3 },
                consultation: { type: Number, default: 15 },
                other: { type: Number, default: 10 }
            },
            byPriceRange: [{
                minAmount: { type: Number, required: true },
                maxAmount: { type: Number, required: true },
                percentage: { type: Number, required: true, min: 0, max: 100 }
            }],
            minimumAmount: { type: Number, default: 1, min: 0 }
        },

        // MLM Commission Structure
        mlmCommissionStructure: {
            level1: { type: Number, default: 5, min: 0, max: 100 },
            level2: { type: Number, default: 3, min: 0, max: 100 },
            level3: { type: Number, default: 2, min: 0, max: 100 },
            level4: { type: Number, default: 1, min: 0, max: 100 },
            level5: { type: Number, default: 0.5, min: 0, max: 100 },
            level6: { type: Number, default: 0.3, min: 0, max: 100 },
            level7: { type: Number, default: 0.2, min: 0, max: 100 },
            level8: { type: Number, default: 0.1, min: 0, max: 100 },
            level9: { type: Number, default: 0.05, min: 0, max: 100 },
            level10: { type: Number, default: 0.02, min: 0, max: 100 }
        },

        // Commission Eligibility Rules
        commissionEligibility: {
            minimumCoachLevel: { type: Number, default: 1, min: 1 },
            minimumPerformanceRating: { type: Number, default: 3.0, min: 0, max: 5 },
            minimumActiveDays: { type: Number, default: 30, min: 0 },
            minimumTeamSize: { type: Number, default: 1, min: 0 },
            minimumMonthlyRevenue: { type: Number, default: 100, min: 0 },
            requireActiveSubscription: { type: Boolean, default: true }
        },

        // Payout Settings
        payoutSettings: {
            frequency: { 
                type: String, 
                enum: ['instant', 'daily', 'weekly', 'monthly', 'manual'], 
                default: 'monthly' 
            },
            minimumPayoutAmount: { type: Number, default: 50, min: 0 },
            maximumPayoutAmount: { type: Number, default: 10000, min: 0 },
            allowedPayoutMethods: [{ 
                type: String, 
                enum: ['bank_transfer', 'paypal', 'stripe_connect', 'wallet', 'crypto', 'other'] 
            }],
            payoutProcessingDays: { type: Number, default: 3, min: 0 },
            autoApproveThreshold: { type: Number, default: 100, min: 0 }
        },

        // Refund Policy
        refundPolicy: {
            refundsAllowed: { type: Boolean, default: true },
            timeLimit: { type: Number, default: 7, min: 0 }, // days
            partialRefundsAllowed: { type: Boolean, default: true },
            refundProcessingDays: { type: Number, default: 5, min: 0 },
            refundFeePercentage: { type: Number, default: 2, min: 0, max: 100 }
        },

        // Payment Gateways
        paymentGateways: {
            stripe: {
                enabled: { type: Boolean, default: false },
                config: {
                    publishableKey: { type: String, default: '' },
                    secretKey: { type: String, default: '' },
                    webhookSecret: { type: String, default: '' },
                    currency: { type: String, default: 'USD' }
                }
            },
            paypal: {
                enabled: { type: Boolean, default: false },
                config: {
                    clientId: { type: String, default: '' },
                    clientSecret: { type: String, default: '' },
                    mode: { type: String, enum: ['sandbox', 'live'], default: 'sandbox' }
                }
            },
            razorpay: {
                enabled: { type: Boolean, default: false },
                config: {
                    keyId: { type: String, default: '' },
                    keySecret: { type: String, default: '' },
                    webhookSecret: { type: String, default: '' }
                }
            }
        },

        // Currency Settings
        currencies: {
            supported: [{ type: String, enum: ['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD'] }],
            default: { type: String, default: 'USD' },
            exchangeRates: { type: Map, of: Number, default: new Map() }
        },

        // Tax Settings
        taxSettings: {
            taxHandledBy: { type: String, enum: ['coach', 'platform'], default: 'coach' },
            taxRates: {
                default: { type: Number, default: 0, min: 0, max: 100 },
                byCountry: { type: Map, of: Number, default: new Map() },
                byState: { type: Map, of: Number, default: new Map() }
            },
            taxInclusive: { type: Boolean, default: false }
        }
    },

    // MLM System Configuration
    mlmSystem: {
        maxDownlineLevels: { type: Number, default: 10, min: 1, max: 20 },
        performanceUpdateInterval: { type: Number, default: 3600000 }, // 1 hour in ms
        reportRetentionDays: { type: Number, default: 365 },
        aiInsightsEnabled: { type: Boolean, default: true },
        realTimeUpdates: { type: Boolean, default: true },
        
        // Performance Scoring Weights
        performanceScoring: {
            leadGenerationWeight: { type: Number, default: 0.30, min: 0, max: 1 },
            salesPerformanceWeight: { type: Number, default: 0.25, min: 0, max: 1 },
            clientManagementWeight: { type: Number, default: 0.20, min: 0, max: 1 },
            activityEngagementWeight: { type: Number, default: 0.15, min: 0, max: 1 },
            teamLeadershipWeight: { type: Number, default: 0.10, min: 0, max: 1 }
        },

        // Coach Requirements
        coachRequirements: {
            minimumAge: { type: Number, default: 18, min: 16 },
            requiredCertifications: [{ type: String }],
            minimumExperience: { type: Number, default: 1 }, // years
            backgroundCheckRequired: { type: Boolean, default: false },
            insuranceRequired: { type: Boolean, default: false }
        }
    },

    // System Security
    security: {
        passwordPolicy: {
            minLength: { type: Number, default: 8, min: 6 },
            requireUppercase: { type: Boolean, default: true },
            requireLowercase: { type: Boolean, default: true },
            requireNumbers: { type: Boolean, default: true },
            requireSpecialChars: { type: Boolean, default: true },
            maxLoginAttempts: { type: Number, default: 5, min: 3 },
            lockoutDuration: { type: Number, default: 30, min: 5 } // minutes
        },
        sessionSettings: {
            sessionTimeout: { type: Number, default: 24, min: 1 }, // hours
            rememberMeDuration: { type: Number, default: 30, min: 1 }, // days
            requireTwoFactor: { type: Boolean, default: false }
        },
        apiSecurity: {
            maxRequestsPerHour: { type: Number, default: 1000, min: 100 },
            allowedOrigins: [{ type: String }],
            requireApiKey: { type: Boolean, default: false }
        },
        jwtSettings: {
            secret: { type: String, default: 'your-secret-key' },
            expiresIn: { type: String, default: '30d' },
            cookieExpire: { type: Number, default: 30 } // days
        }
    },

    // Rate Limiting Configuration
    rateLimiting: {
        global: {
            windowMs: { type: Number, default: 15 * 60 * 1000 }, // 15 minutes
            maxRequests: { type: Number, default: 100 }
        },
        auth: {
            windowMs: { type: Number, default: 15 * 60 * 1000 }, // 15 minutes
            maxRequests: { type: Number, default: 5 }
        },
        admin: {
            windowMs: { type: Number, default: 5 * 60 * 1000 }, // 5 minutes
            maxRequests: { type: Number, default: 10 }
        },
        api: {
            windowMs: { type: Number, default: 60 * 1000 }, // 1 minute
            maxRequests: { type: Number, default: 100 }
        },
        export: {
            windowMs: { type: Number, default: 60 * 60 * 1000 }, // 1 hour
            maxRequests: { type: Number, default: 5 }
        }
    },

    // AI Service Configuration
    aiServices: {
        openai: {
            enabled: { type: Boolean, default: false },
            apiKey: { type: String, default: '' },
            baseUrl: { type: String, default: 'https://api.openai.com/v1' },
            defaultModel: { type: String, default: 'gpt-3.5-turbo' },
            maxRetries: { type: Number, default: 3 },
            retryDelay: { type: Number, default: 1000 }
        },
        openrouter: {
            enabled: { type: Boolean, default: false },
            apiKey: { type: String, default: '' },
            baseUrl: { type: String, default: 'https://openrouter.ai/api/v1' },
            defaultModel: { type: String, default: 'openai/gpt-3.5-turbo' }
        },
        models: {
            openai: {
                gpt4: { type: String, default: 'gpt-4' },
                gpt4Turbo: { type: String, default: 'gpt-4-turbo-preview' },
                gpt35: { type: String, default: 'gpt-3.5-turbo' },
                gpt35Turbo: { type: String, default: 'gpt-3.5-turbo-16k' }
            },
            openrouter: {
                gpt4: { type: String, default: 'openai/gpt-4' },
                gpt4Turbo: { type: String, default: 'openai/gpt-4-turbo-preview' },
                gpt35: { type: String, default: 'openai/gpt-3.5-turbo' },
                gpt35Turbo: { type: String, default: 'openai/gpt-3.5-turbo-16k' },
                claude: { type: String, default: 'anthropic/claude-3-sonnet' },
                gemini: { type: String, default: 'google/gemini-pro' },
                llama: { type: String, default: 'meta-llama/llama-2-70b-chat' }
            }
        }
    },

    // Workflow and Task Configuration
    workflowConfig: {
        stages: {
            LEAD_GENERATION: {
                name: { type: String, default: 'Lead Generation' },
                color: { type: String, default: '#3498db' },
                tasks: [{ type: String, default: ['Research Prospects', 'Create Content', 'Run Ads', 'Follow Up'] }]
            },
            LEAD_QUALIFICATION: {
                name: { type: String, default: 'Lead Qualification' },
                color: { type: String, default: '#f39c12' },
                tasks: [{ type: String, default: ['Initial Contact', 'Needs Assessment', 'Budget Discussion', 'Decision Maker ID'] }]
            },
            PROPOSAL: {
                name: { type: String, default: 'Proposal' },
                color: { type: String, default: '#e74c3c' },
                tasks: [{ type: String, default: ['Create Proposal', 'Present Solution', 'Handle Objections', 'Negotiate Terms'] }]
            },
            CLOSING: {
                name: { type: String, default: 'Closing' },
                color: { type: String, default: '#27ae60' },
                tasks: [{ type: String, default: ['Final Agreement', 'Contract Signing', 'Payment Processing', 'Onboarding Setup'] }]
            },
            ONBOARDING: {
                name: { type: String, default: 'Onboarding' },
                color: { type: String, default: '#9b59b6' },
                tasks: [{ type: String, default: ['Welcome Call', 'Goal Setting', 'Program Setup', 'First Session'] }]
            }
        },
        taskPriorities: {
            LOW: { value: { type: Number, default: 1 }, color: { type: String, default: '#95a5a6' }, label: { type: String, default: 'Low' } },
            MEDIUM: { value: { type: Number, default: 2 }, color: { type: String, default: '#f39c12' }, label: { type: String, default: 'Medium' } },
            HIGH: { value: { type: Number, default: 3 }, color: { type: String, default: '#e74c3c' }, label: { type: String, default: 'High' } },
            URGENT: { value: { type: Number, default: 4 }, color: { type: String, default: '#c0392b' }, label: { type: String, default: 'Urgent' } }
        }
    },

    // Staff Leaderboard Configuration
    staffLeaderboard: {
        scoringWeights: {
            taskCompletion: { type: Number, default: 0.35 },
            qualityRating: { type: Number, default: 0.25 },
            efficiency: { type: Number, default: 0.20 },
            leadership: { type: Number, default: 0.15 },
            innovation: { type: Number, default: 0.05 }
        },
        achievements: {
            TASK_MASTER: { name: { type: String, default: "🏅 Task Master" }, description: { type: String, default: "Complete 100 tasks successfully" }, threshold: { type: Number, default: 100 } },
            SPEED_DEMON: { name: { type: String, default: "⚡ Speed Demon" }, description: { type: String, default: "Complete tasks 20% faster than average" }, threshold: { type: Number, default: 0.8 } },
            QUALITY_CHAMPION: { name: { type: String, default: "💎 Quality Champion" }, description: { type: String, default: "Maintain 95%+ satisfaction rating" }, threshold: { type: Number, default: 0.95 } },
            LEAD_CLOSER: { name: { type: String, default: "🎯 Lead Closer" }, description: { type: String, default: "Convert 80%+ of qualified leads" }, threshold: { type: Number, default: 0.8 } },
            TEAM_PLAYER: { name: { type: String, default: "🌟 Team Player" }, description: { type: String, default: "Help 10+ team members with tasks" }, threshold: { type: Number, default: 10 } },
            PROCESS_INNOVATOR: { name: { type: String, default: "🚀 Process Innovator" }, description: { type: String, default: "Suggest 5+ process improvements" }, threshold: { type: Number, default: 5 } },
            CONSISTENCY_KING: { name: { type: String, default: "👑 Consistency King" }, description: { type: String, default: "Maintain top performance for 3 months" }, threshold: { type: Number, default: 90 } },
            FAST_LEARNER: { name: { type: String, default: "📚 Fast Learner" }, description: { type: String, default: "Improve performance by 50% in 30 days" }, threshold: { type: Number, default: 0.5 } }
        },
        rankingLevels: {
            ELITE: { name: { type: String, default: "🥇 Elite Performer" }, minScore: { type: Number, default: 90 }, color: { type: String, default: "#FFD700" } },
            HIGH_ACHIEVER: { name: { type: String, default: "🥈 High Achiever" }, minScore: { type: Number, default: 80 }, color: { type: String, default: "#C0C0C0" } }
        }
    },

    // AI Ads Configuration
    aiAdsConfig: {
        performanceThresholds: {
            ctr: { type: Number, default: 0.02 }, // 2% CTR threshold
            cpc: { type: Number, default: 2.0 },  // $2 CPC threshold
            roas: { type: Number, default: 3.0 }  // 3:1 ROAS threshold
        },
        optimizationHistory: { type: Map, of: mongoose.Schema.Types.Mixed, default: new Map() }
    },

    // Notification Settings (Simplified - Gmail Only)
    notifications: {
        email: {
            enabled: { type: Boolean, default: true },
            gmailId: { type: String, default: '' },
            appPassword: { type: String, default: '' },
            fromEmail: { type: String, default: '' },
            fromName: { type: String, default: 'FunnelsEye' }
        },
        sms: {
            enabled: { type: Boolean, default: false },
            provider: { type: String, enum: ['twilio', 'aws_sns', 'other'], default: 'twilio' },
            config: {
                accountSid: { type: String, default: '' },
                authToken: { type: String, default: '' },
                fromNumber: { type: String, default: '' }
            }
        },
        push: {
            enabled: { type: Boolean, default: false },
            firebaseConfig: {
                serverKey: { type: String, default: '' },
                projectId: { type: String, default: '' }
            }
        }
    },

    // Integration Settings
    integrations: {
        whatsapp: {
            enabled: { type: Boolean, default: true },
            // Meta Official API Configuration
            meta: {
                enabled: { type: Boolean, default: true },
                apiUrl: { type: String, default: 'https://graph.facebook.com/v19.0' },
                apiToken: { type: String, default: '' },
                phoneNumberId: { type: String, default: '' },
                businessAccountId: { type: String, default: '' },
                webhookVerifyToken: { type: String, default: '' },
                maxRetries: { type: Number, default: 3 },
                retryDelay: { type: Number, default: 1000 },
                timeout: { type: Number, default: 30000 }
            },
            // Baileys Personal Account Configuration
            baileys: {
                enabled: { type: Boolean, default: true },
                sessionTimeout: { type: Number, default: 300000 }, // 5 minutes
                qrCodeTimeout: { type: Number, default: 60000 }, // 1 minute
                maxSessions: { type: Number, default: 100 },
                autoReconnect: { type: Boolean, default: true },
                reconnectInterval: { type: Number, default: 30000 }, // 30 seconds
                browser: { type: String, default: 'Chrome' },
                platform: { type: String, default: 'Ubuntu' },
                version: { type: String, default: 'latest' },
                markOnlineOnConnect: { type: Boolean, default: false },
                emitOwnEvents: { type: Boolean, default: false },
                connectTimeoutMs: { type: Number, default: 30000 },
                keepAliveIntervalMs: { type: Number, default: 15000 }
            },
            // Central Fallback Configuration
            central: {
                enabled: { type: Boolean, default: true },
                apiToken: { type: String, default: '' },
                phoneNumberId: { type: String, default: '' },
                businessAccountId: { type: String, default: '' },
                fallbackEnabled: { type: Boolean, default: true },
                maxMessagesPerMinute: { type: Number, default: 60 },
                maxMessagesPerHour: { type: Number, default: 1000 }
            },
            // General WhatsApp Settings
            general: {
                maxMessageLength: { type: Number, default: 4096 },
                maxMediaSize: { type: Number, default: 16 }, // MB
                supportedMediaTypes: [{ type: String, default: ['image', 'video', 'audio', 'document'] }],
                messageRetentionDays: { type: Number, default: 365 },
                conversationRetentionDays: { type: Number, default: 730 },
                autoArchiveInactive: { type: Boolean, default: true },
                inactiveThresholdDays: { type: Number, default: 30 },
                enableAnalytics: { type: Boolean, default: true },
                enableWebhooks: { type: Boolean, default: true },
                webhookTimeout: { type: Number, default: 10000 }
            }
        },
        zoom: {
            enabled: { type: Boolean, default: false },
            accountId: { type: String, default: '' },
            clientId: { type: String, default: '' },
            clientSecret: { type: String, default: '' },
            webhookSecret: { type: String, default: '' }
        },
        calendar: {
            enabled: { type: Boolean, default: false },
            googleCalendar: {
                clientId: { type: String, default: '' },
                clientSecret: { type: String, default: '' }
            }
        },
        rabbitmq: {
            enabled: { type: Boolean, default: false },
            url: { type: String, default: 'amqp://localhost:5672' },
            retryAttempts: { type: Number, default: 3 },
            retryDelay: { type: Number, default: 1000 }
        },
        metaAds: {
            enabled: { type: Boolean, default: false },
            accessToken: { type: String, default: '' },
            apiVersion: { type: String, default: 'v19.0' }
        }
    },

    // Lead Management Configuration
    leadManagement: {
        temperatureThresholds: {
            hot: { minScore: { type: Number, default: 80 }, color: { type: String, default: '#e74c3c' } },
            warm: { minScore: { type: Number, default: 50 }, color: { type: String, default: '#f39c12' } },
            cold: { minScore: { type: Number, default: 0 }, color: { type: String, default: '#3498db' } }
        },
        scoringWeights: {
            formCompletion: { type: Number, default: 0.3 },
            engagement: { type: Number, default: 0.25 },
            demographics: { type: Number, default: 0.2 },
            behavior: { type: Number, default: 0.15 },
            source: { type: Number, default: 0.1 }
        },
        nurturingSettings: {
            maxSequenceLength: { type: Number, default: 10 },
            defaultDelay: { type: Number, default: 24 }, // hours
            maxDelay: { type: Number, default: 168 } // 7 days
        }
    },

    // Coach Availability Configuration
    coachAvailability: {
        defaultAppointmentDuration: { type: Number, default: 60 }, // minutes
        defaultBufferTime: { type: Number, default: 15 }, // minutes
        maxAdvanceBooking: { type: Number, default: 90 }, // days
        minAdvanceBooking: { type: Number, default: 2 }, // hours
        workingHours: {
            monday: { start: { type: String, default: '09:00' }, end: { type: String, default: '17:00' }, enabled: { type: Boolean, default: true } },
            tuesday: { start: { type: String, default: '09:00' }, end: { type: String, default: '17:00' }, enabled: { type: Boolean, default: true } },
            wednesday: { start: { type: String, default: '09:00' }, end: { type: String, default: '17:00' }, enabled: { type: Boolean, default: true } },
            thursday: { start: { type: String, default: '09:00' }, end: { type: String, default: '17:00' }, enabled: { type: Boolean, default: true } },
            friday: { start: { type: String, default: '09:00' }, end: { type: String, default: '17:00' }, enabled: { type: Boolean, default: true } },
            saturday: { start: { type: String, default: '10:00' }, end: { type: String, default: '15:00' }, enabled: { type: Boolean, default: false } },
            sunday: { start: { type: String, default: '10:00' }, end: { type: String, default: '15:00' }, enabled: { type: Boolean, default: false } }
        }
    },

    // Subscription Management Configuration
    subscriptionConfig: {
        reminderIntervals: {
            sevenDays: { type: Number, default: 7 },
            threeDays: { type: Number, default: 3 },
            oneDay: { type: Number, default: 1 },
            onExpiry: { type: Number, default: 0 }
        },
        gracePeriod: { type: Number, default: 7 }, // days
        autoRenewal: { type: Boolean, default: false },
        prorationEnabled: { type: Boolean, default: true }
    },

    // Central WhatsApp Management
    whatsApp: {
        isEnabled: { type: Boolean, default: false },
        apiUrl: { type: String, default: 'https://graph.facebook.com/v19.0' },
        centralApiToken: { type: String, default: '' },
        centralPhoneNumberId: { type: String, default: '' },
        centralBusinessAccountId: { type: String, default: '' },
        webhookVerifyToken: { type: String, default: '' },
        webhookUrl: { type: String, default: '' },
        creditPrice: { type: Number, default: 0.01, min: 0 },
        autoRecharge: { type: Boolean, default: false },
        rechargeThreshold: { type: Number, default: 10, min: 0 },
        rechargeAmount: { type: Number, default: 100, min: 0 },
        messageTemplates: [{
            id: { type: String, required: true },
            name: { type: String, required: true },
            category: { type: String, required: true },
            language: { type: String, default: 'en_US' },
            components: [{ type: mongoose.Schema.Types.Mixed }],
            status: { type: String, enum: ['pending_approval', 'approved', 'rejected'], default: 'pending_approval' },
            createdAt: { type: Date, default: Date.now }
        }],
        globalSettings: {
            autoReply: { type: Boolean, default: false },
            autoReplyMessage: { type: String, default: '' },
            businessHours: {
                enabled: { type: Boolean, default: false },
                timezone: { type: String, default: 'UTC+05:30' },
                hours: {
                    monday: { start: { type: String, default: '09:00' }, end: { type: String, default: '17:00' }, enabled: { type: Boolean, default: true } },
                    tuesday: { start: { type: String, default: '09:00' }, end: { type: String, default: '17:00' }, enabled: { type: Boolean, default: true } },
                    wednesday: { start: { type: String, default: '09:00' }, end: { type: String, default: '17:00' }, enabled: { type: Boolean, default: true } },
                    thursday: { start: { type: String, default: '09:00' }, end: { type: String, default: '17:00' }, enabled: { type: Boolean, default: true } },
                    friday: { start: { type: String, default: '09:00' }, end: { type: String, default: '17:00' }, enabled: { type: Boolean, default: true } },
                    saturday: { start: { type: String, default: '10:00' }, end: { type: String, default: '15:00' }, enabled: { type: Boolean, default: true } },
                    sunday: { start: { type: String, default: '10:00' }, end: { type: String, default: '15:00' }, enabled: { type: Boolean, default: false } }
                }
            }
        },
        updatedAt: { type: Date, default: Date.now }
    },

    // System Status
    systemStatus: {
        isActive: { type: Boolean, default: true },
        lastUpdated: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        version: { type: String, default: '1.0.0' },
        maintenanceMode: { type: Boolean, default: false },
        maintenanceMessage: { type: String, default: '' }
    },

    // Audit Trail
    auditTrail: {
        enabled: { type: Boolean, default: true },
        retentionDays: { type: Number, default: 365 },
        logLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
    }

}, { 
    timestamps: true,
    versionKey: false 
});

// Indexes for better performance
adminSystemSettingsSchema.index({ 'systemStatus.isActive': 1 });
adminSystemSettingsSchema.index({ updatedAt: -1 });

// Methods
adminSystemSettingsSchema.methods.getPlatformFee = function(category, amount) {
    const fees = this.paymentSystem.platformFees;
    
    // Check category-specific fee
    if (fees.byCategory[category]) {
        return Math.max(fees.byCategory[category], fees.minimumAmount);
    }
    
    // Check price range fees
    for (const range of fees.byPriceRange) {
        if (amount >= range.minAmount && amount <= range.maxAmount) {
            return Math.max(range.percentage, fees.minimumAmount);
        }
    }
    
    // Return default fee
    return Math.max(fees.defaultPercentage, fees.minimumAmount);
};

adminSystemSettingsSchema.methods.getCommissionForLevel = function(level) {
    const commissions = this.paymentSystem.mlmCommissionStructure;
    return commissions[`level${level}`] || 0;
};

adminSystemSettingsSchema.methods.isCommissionEligible = function(coachData) {
    const eligibility = this.paymentSystem.commissionEligibility;
    
    return (
        coachData.level >= eligibility.minimumCoachLevel &&
        coachData.performanceRating >= eligibility.minimumPerformanceRating &&
        coachData.activeDays >= eligibility.minimumActiveDays &&
        coachData.teamSize >= eligibility.minimumTeamSize &&
        coachData.monthlyRevenue >= eligibility.minimumMonthlyRevenue &&
        (!eligibility.requireActiveSubscription || coachData.hasActiveSubscription)
    );
};

// Get rate limit configuration for specific operation
adminSystemSettingsSchema.methods.getRateLimit = function(operation) {
    const rateLimits = this.rateLimiting;
    return rateLimits[operation] || rateLimits.global;
};

// Get AI service configuration
adminSystemSettingsSchema.methods.getAIServiceConfig = function(service) {
    return this.aiServices[service] || null;
};

// Get workflow stage configuration
adminSystemSettingsSchema.methods.getWorkflowStage = function(stage) {
    return this.workflowConfig.stages[stage] || null;
};

// Get task priority configuration
adminSystemSettingsSchema.methods.getTaskPriority = function(priority) {
    return this.workflowConfig.taskPriorities[priority] || null;
};

// Get lead temperature configuration
adminSystemSettingsSchema.methods.getLeadTemperature = function(score) {
    const thresholds = this.leadManagement.temperatureThresholds;
    
    if (score >= thresholds.hot.minScore) return 'hot';
    if (score >= thresholds.warm.minScore) return 'warm';
    return 'cold';
};

// Get staff leaderboard scoring weights
adminSystemSettingsSchema.methods.getStaffScoringWeights = function() {
    return this.staffLeaderboard.scoringWeights;
};

// Get staff achievement configuration
adminSystemSettingsSchema.methods.getStaffAchievement = function(achievement) {
    return this.staffLeaderboard.achievements[achievement] || null;
};

// Get coach availability defaults
adminSystemSettingsSchema.methods.getCoachAvailabilityDefaults = function() {
    return {
        defaultAppointmentDuration: this.coachAvailability.defaultAppointmentDuration,
        defaultBufferTime: this.coachAvailability.defaultBufferTime,
        maxAdvanceBooking: this.coachAvailability.maxAdvanceBooking,
        minAdvanceBooking: this.coachAvailability.minAdvanceBooking,
        workingHours: this.coachAvailability.workingHours
    };
};

// Get subscription configuration
adminSystemSettingsSchema.methods.getSubscriptionConfig = function() {
    return this.subscriptionConfig;
};

// Get CORS configuration
adminSystemSettingsSchema.methods.getCorsConfig = function() {
    return {
        origin: this.corsConfig.allowedOrigins,
        methods: this.corsConfig.allowedMethods,
        allowedHeaders: this.corsConfig.allowedHeaders,
        credentials: this.corsConfig.credentials,
        maxAge: this.corsConfig.maxAge
    };
};

// Get database configuration
adminSystemSettingsSchema.methods.getDatabaseConfig = function() {
    return this.databaseConfig;
};

// Check if feature is enabled
adminSystemSettingsSchema.methods.isFeatureEnabled = function(feature) {
    const featureMap = {
        'whatsapp': this.whatsApp.isEnabled,
        'zoom': this.integrations.zoom.enabled,
        'calendar': this.integrations.calendar.enabled,
        'rabbitmq': this.integrations.rabbitmq.enabled,
        'metaAds': this.integrations.metaAds.enabled,
        'openai': this.aiServices.openai.enabled,
        'openrouter': this.aiServices.openrouter.enabled,
        'email': this.notifications.email.enabled,
        'sms': this.notifications.sms.enabled,
        'push': this.notifications.push.enabled
    };
    
    return featureMap[feature] || false;
};

// Get integration configuration
adminSystemSettingsSchema.methods.getIntegrationConfig = function(integration) {
    return this.integrations[integration] || null;
};

// Get WhatsApp configuration
adminSystemSettingsSchema.methods.getWhatsAppConfig = function() {
    return this.integrations.whatsapp;
};

// Get WhatsApp Meta configuration
adminSystemSettingsSchema.methods.getWhatsAppMetaConfig = function() {
    return this.integrations.whatsapp.meta;
};

// Get WhatsApp Baileys configuration
adminSystemSettingsSchema.methods.getWhatsAppBaileysConfig = function() {
    return this.integrations.whatsapp.baileys;
};

// Get WhatsApp Central configuration
adminSystemSettingsSchema.methods.getWhatsAppCentralConfig = function() {
    return this.integrations.whatsapp.central;
};

// Get WhatsApp General configuration
adminSystemSettingsSchema.methods.getWhatsAppGeneralConfig = function() {
    return this.integrations.whatsapp.general;
};

// Check if WhatsApp integration is enabled
adminSystemSettingsSchema.methods.isWhatsAppEnabled = function() {
    return this.integrations.whatsapp.enabled;
};

// Check if specific WhatsApp service is enabled
adminSystemSettingsSchema.methods.isWhatsAppServiceEnabled = function(service) {
    const serviceMap = {
        'meta': this.integrations.whatsapp.meta.enabled,
        'baileys': this.integrations.whatsapp.baileys.enabled,
        'central': this.integrations.whatsapp.central.enabled
    };
    return serviceMap[service] || false;
};

// Get notification configuration
adminSystemSettingsSchema.methods.getNotificationConfig = function(type) {
    return this.notifications[type] || null;
};

module.exports = mongoose.models.AdminSystemSettings || mongoose.model('AdminSystemSettings', adminSystemSettingsSchema);
