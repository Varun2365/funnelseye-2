// D:\PRJ_YCT_Final\schema/coachSchema.js

const mongoose = require('mongoose');

// --- Sub-schema for Portfolio Details ---
const portfolioSchema = new mongoose.Schema({
    headline: { type: String, trim: true },
    bio: { type: String, trim: true },
    specializations: [{ name: { type: String, trim: true } }],
    experienceYears: { type: Number, min: 0, default: 0 },
    totalProjectsCompleted: { type: Number, min: 0, default: 0 },
    profileImages: [{ url: { type: String, trim: true }, altText: { type: String, trim: true } }],
    gallery: [{ url: { type: String, trim: true }, caption: { type: String, trim: true } }],
    testimonials: [{
        text: { type: String, trim: true },
        image: { type: String, trim: true },
        name: { type: String, trim: true },
        rating: { type: Number, min: 1, max: 5 }
    }],
    partnerLogos: [{ name: { type: String, trim: true }, url: { type: String, trim: true } }],
    coachLogos: [{ name: { type: String, trim: true }, url: { type: String, trim: true } }],
    certificationIcons: [{ name: { type: String, trim: true }, url: { type: String, trim: true } }],
    videoEmbedUrls: [{
        ytUrl: {
            type: String,
            trim: true,
            match: [/^<iframe.*src="(https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/embed\/[^"]+)".*<\/iframe>$/, 'Please use a valid YouTube embed iframe.']
        },
        title: { type: String, trim: true }
    }],
    customVideoUploads: [{
        url: { type: String, trim: true },
        thumbnailUrl: { type: String, trim: true },
        title: { type: String, trim: true }
    }],
    trainingOfferings: [{
        imageUrl: { type: String, trim: true },
        text: { type: String, trim: true }
    }],
    faqs: [{
        id: { type: Number },
        question: { type: String, trim: true },
        answer: { type: String, trim: true }
    }]
}, { _id: false });

// --- Sub-schema for Appointment Settings ---
const appointmentSchema = new mongoose.Schema({
    appointmentHeadline: { type: String, trim: true, default: 'Schedule a Call With Us' },
    availableDays: [{
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    availableFromTime: {
        type: String,
        trim: true,
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please use HH:MM format (e.g., 09:00).']
    },
    availableToTime: {
        type: String,
        trim: true,
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please use HH:MM format (e.g., 17:00).']
    },
    slotDuration: {
        type: Number,
        min: 1,
        default: 30
    },
    timeZone: {
        type: String,
        trim: true,
        default: 'UTC+05:30'
    },
    blockedDates: [{
        date: { type: Date, required: true },
        reason: { type: String, trim: true }
    }]
}, { _id: false });

// --- Main Coach Schema ---
const coachSchema = new mongoose.Schema({
    // --- Hierarchy Fields ---
    selfCoachId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    currentLevel: {
        type: Number,
        required: true,
        min: 1,
        max: 12,
        default: 1
    },
    sponsorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    externalSponsorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExternalSponsor',
        default: null
    },
    teamRankName: {
        type: String,
        trim: true,
        default: ''
    },
    presidentTeamRankName: {
        type: String,
        trim: true,
        default: ''
    },
    // --- Hierarchy Lock Fields ---
    hierarchyLocked: {
        type: Boolean,
        default: false
    },
    hierarchyLockedAt: {
        type: Date
    },
    portfolio: {
        type: portfolioSchema,
        default: {}
    },
    appointmentSettings: {
        type: appointmentSchema,
        default: {}
    },
    // --- Fields for WhatsApp Integration ---
    // WhatsApp functionality moved to dustbin/whatsapp-dump/
    // whatsApp: {
    //     useCentralAccount: {
    //         type: Boolean,
    //         default: true
    //     },
    //     phoneNumberId: {
    //         type: String,
    //         trim: true,
    //         default: null
    //     },
    //     whatsAppBusinessAccountId: {
    //         type: String,
    //         trim: true,
    //         default: null
    //     },
    //     whatsAppApiToken: {
    //         type: String,
    //         trim: true,
    //         default: null,
    //         select: false
    //     },
    // },
    // ✅ ADDED: The new credits field for message-based billing
    credits: {
        type: Number,
        required: true,
        default: 100
    },

    // ✅ ADDED: Payment Collection Settings
    paymentCollection: {
        upiId: {
            type: String,
            trim: true,
            default: null,
            match: [/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+$/, 'Please enter a valid UPI ID (e.g., username@bank)']
        },
        bankAccount: {
            accountNumber: {
                type: String,
                trim: true,
                default: null
            },
            ifscCode: {
                type: String,
                trim: true,
                default: null,
                match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please enter a valid IFSC code']
            },
            accountHolderName: {
                type: String,
                trim: true,
                default: null
            }
        },
        isPaymentCollectionEnabled: {
            type: Boolean,
            default: false
        },
        paymentCollectionMethod: {
            type: String,
            enum: ['upi', 'bank_transfer', 'both'],
            default: 'upi'
        },
        lastPaymentReceived: {
            amount: { type: Number, default: 0 },
            date: { type: Date, default: null },
            reference: { type: String, default: null }
        },
        totalPaymentsReceived: {
            type: Number,
            default: 0
        },
        pendingPayments: {
            type: Number,
            default: 0
        }
    },

    // Razorpay Payout Details
    razorpayDetails: {
        contactId: {
            type: String,
            trim: true
        },
        fundAccountId: {
            type: String,
            trim: true
        },
        setupDate: {
            type: Date
        },
        isActive: {
            type: Boolean,
            default: false
        },
        lastPayoutDate: {
            type: Date
        },
        totalPayouts: {
            type: Number,
            default: 0
        }
    },

    // --- Lead Magnet Settings ---
    leadMagnets: {
        ai_diet_planner: {
            isEnabled: { type: Boolean, default: true },
            config: {
                maxInteractions: { type: Number, default: 10 },
                planDuration: { type: Number, default: 7 },
                includeRecipes: { type: Boolean, default: true },
                includeShoppingList: { type: Boolean, default: true }
            }
        },
        bmi_calculator: {
            isEnabled: { type: Boolean, default: true },
            config: {
                includeBodyFat: { type: Boolean, default: true },
                provideRecommendations: { type: Boolean, default: true }
            }
        },
        fitness_ebook: {
            isEnabled: { type: Boolean, default: true },
            config: {
                availableEbooks: [{
                    title: String,
                    category: String,
                    isEnabled: { type: Boolean, default: true }
                }]
            }
        },
        meal_planner: {
            isEnabled: { type: Boolean, default: true },
            config: {
                includeCalories: { type: Boolean, default: true },
                includeMacros: { type: Boolean, default: true },
                dietaryRestrictions: [String]
            }
        },
        workout_calculator: {
            isEnabled: { type: Boolean, default: true },
            config: {
                include1RM: { type: Boolean, default: true },
                includeHeartRate: { type: Boolean, default: true },
                includeCalorieBurn: { type: Boolean, default: true }
            }
        },
        progress_tracker: {
            isEnabled: { type: Boolean, default: true },
            config: {
                trackWeight: { type: Boolean, default: true },
                trackMeasurements: { type: Boolean, default: true },
                trackWorkouts: { type: Boolean, default: true },
                generateReports: { type: Boolean, default: true }
            }
        },
        sleep_analyzer: {
            isEnabled: { type: Boolean, default: true },
            config: {
                trackSleepHours: { type: Boolean, default: true },
                analyzeSleepQuality: { type: Boolean, default: true },
                provideRecommendations: { type: Boolean, default: true }
            }
        },
        stress_assessment: {
            isEnabled: { type: Boolean, default: true },
            config: {
                stressQuestionnaire: { type: Boolean, default: true },
                provideCopingStrategies: { type: Boolean, default: true },
                recommendActivities: { type: Boolean, default: true }
            }
        }
    },

    // --- WhatsApp Settings ---
    whatsAppSettings: {
        useCentralWhatsApp: {
            type: Boolean,
            default: false
        },
        emailSettings: {
            isEnabled: { type: Boolean, default: true },
            email: { type: String, trim: true },
            autoReply: { type: Boolean, default: false },
            autoReplyMessage: { type: String, trim: true, default: 'Thank you for your message. We will get back to you soon.' }
        },
        autoReplySettings: {
            isEnabled: { type: Boolean, default: false },
            message: { type: String, trim: true, default: 'Thank you for your message. We will get back to you soon.' },
            businessHours: {
                enabled: { type: Boolean, default: false },
                startTime: { type: String, default: '09:00' },
                endTime: { type: String, default: '17:00' },
                timezone: { type: String, default: 'UTC+05:30' }
            }
        }
    },

    // --- Messaging Credits ---
    messagingCredits: {
        type: Number,
        default: 0,
        min: 0
    },

    // WhatsApp Credit System Integration
    whatsappCredits: {
        enabled: {
            type: Boolean,
            default: true
        },
        lastSync: {
            type: Date,
            default: null
        }
    },

    // --- Staff Management ---
    staffSettings: {
        allowStaffWhatsApp: {
            type: Boolean,
            default: true
        },
        staffPermissions: {
            sendMessages: { type: Boolean, default: true },
            viewInbox: { type: Boolean, default: true },
            manageTemplates: { type: Boolean, default: false },
            viewStats: { type: Boolean, default: true }
        }
    }
}, { 
    timestamps: true
    // Remove collection: 'users' - let it inherit from User model
    // Remove discriminatorKey: 'role' - let it inherit from User model
});

// Method to sync credits with WhatsApp credit system
coachSchema.methods.syncWhatsAppCredits = async function() {
    try {
        const WhatsAppCredit = require('./WhatsAppCredit');
        
        // Get or create WhatsApp credits for this coach
        const whatsappCredits = await WhatsAppCredit.getOrCreateCredits(this._id);
        
        // Sync the balance
        this.messagingCredits = whatsappCredits.balance;
        this.whatsappCredits.lastSync = new Date();
        
        await this.save();
        
        return {
            success: true,
            oldBalance: this.messagingCredits,
            newBalance: whatsappCredits.balance,
            whatsappCredits: whatsappCredits
        };
    } catch (error) {
        console.error('Error syncing WhatsApp credits:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Method to get current WhatsApp credit balance
coachSchema.methods.getWhatsAppCreditBalance = async function() {
    try {
        const WhatsAppCredit = require('./WhatsAppCredit');
        const whatsappCredits = await WhatsAppCredit.getOrCreateCredits(this._id);
        return whatsappCredits.balance;
    } catch (error) {
        console.error('Error getting WhatsApp credit balance:', error);
        return this.messagingCredits; // Fallback to old system
    }
};

// Export the schema instead of the model to avoid circular dependency
module.exports = coachSchema;