const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    sponsorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Monthly Performance Tracking
    monthlyStats: [{
        month: {
            type: String, // Format: "YYYY-MM"
            required: true
        },
        // Lead Generation Metrics
        totalLeads: { type: Number, default: 0 },
        qualifiedLeads: { type: Number, default: 0 },
        conversionRate: { type: Number, default: 0 }, // percentage
        leadSources: {
            website: { type: Number, default: 0 },
            socialMedia: { type: Number, default: 0 },
            referrals: { type: Number, default: 0 },
            ads: { type: Number, default: 0 },
            other: { type: Number, default: 0 }
        },
        // Sales Metrics
        totalSales: { type: Number, default: 0 },
        revenue: { type: Number, default: 0 },
        averageDealSize: { type: Number, default: 0 },
        salesCycle: { type: Number, default: 0 }, // in days
        // Client Management
        activeClients: { type: Number, default: 0 },
        newClients: { type: Number, default: 0 },
        churnRate: { type: Number, default: 0 }, // percentage
        clientSatisfaction: { type: Number, default: 0 }, // 1-10 scale
        // Activity Metrics
        tasksCompleted: { type: Number, default: 0 },
        appointmentsScheduled: { type: Number, default: 0 },
        appointmentsCompleted: { type: Number, default: 0 },
        followUpsSent: { type: Number, default: 0 },
        // Team Performance (for sponsors)
        teamSize: { type: Number, default: 0 },
        teamSales: { type: Number, default: 0 },
        teamRevenue: { type: Number, default: 0 },
        teamConversionRate: { type: Number, default: 0 }
    }],
    // Overall Performance Summary
    overallStats: {
        // Career Totals
        totalLeadsGenerated: { type: Number, default: 0 },
        totalSalesClosed: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },
        totalClients: { type: Number, default: 0 },
        // Averages
        averageMonthlyLeads: { type: Number, default: 0 },
        averageMonthlySales: { type: Number, default: 0 },
        averageMonthlyRevenue: { type: Number, default: 0 },
        averageConversionRate: { type: Number, default: 0 },
        // Team Performance
        totalTeamSize: { type: Number, default: 0 },
        totalTeamSales: { type: Number, default: 0 },
        totalTeamRevenue: { type: Number, default: 0 },
        // Activity Metrics
        totalTasksCompleted: { type: Number, default: 0 },
        totalAppointments: { type: Number, default: 0 },
        totalFollowUps: { type: Number, default: 0 }
    },
    // Performance Goals and Targets
    goals: {
        monthlyLeads: { type: Number, default: 0 },
        monthlySales: { type: Number, default: 0 },
        monthlyRevenue: { type: Number, default: 0 },
        conversionRate: { type: Number, default: 0 },
        clientSatisfaction: { type: Number, default: 0 },
        teamSize: { type: Number, default: 0 }
    },
    // Performance Trends
    trends: {
        leadGrowth: { type: Number, default: 0 }, // percentage change
        salesGrowth: { type: Number, default: 0 },
        revenueGrowth: { type: Number, default: 0 },
        conversionTrend: { type: Number, default: 0 },
        teamGrowth: { type: Number, default: 0 }
    },
    // Performance Rating and Status
    performanceRating: {
        score: { type: Number, default: 0, min: 0, max: 100 },
        level: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'],
            default: 'Beginner'
        },
        lastUpdated: { type: Date, default: Date.now }
    },
    // Activity Status
    isActive: { type: Boolean, default: true },
    lastActivity: { type: Date, default: Date.now },
    activityStreak: { type: Number, default: 0 }, // consecutive days active
    // Notes and Comments
    performanceNotes: [{
        note: { type: String, trim: true },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        addedAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

// Indexes for performance
performanceSchema.index({ sponsorId: 1, 'performanceRating.score': -1 });
performanceSchema.index({ 'monthlyStats.month': 1 });
performanceSchema.index({ isActive: 1, lastActivity: -1 });

module.exports = mongoose.model('CoachPerformance', performanceSchema);
