const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reportId: {
        type: String,
        required: true,
        unique: true
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reportType: {
        type: String,
        enum: ['individual_performance', 'team_summary', 'downline_analysis', 'comparison_report', 'trend_analysis', 'goal_tracking'],
        required: true
    },
    reportPeriod: {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        period: {
            type: String,
            enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'],
            required: true
        }
    },
    // Report Data
    reportData: {
        // Individual Performance Metrics
        individualMetrics: {
            leadsGenerated: { type: Number, default: 0 },
            leadsConverted: { type: Number, default: 0 },
            conversionRate: { type: Number, default: 0 },
            salesClosed: { type: Number, default: 0 },
            revenueGenerated: { type: Number, default: 0 },
            averageDealSize: { type: Number, default: 0 },
            tasksCompleted: { type: Number, default: 0 },
            appointmentsScheduled: { type: Number, default: 0 },
            appointmentsCompleted: { type: Number, default: 0 },
            followUpsSent: { type: Number, default: 0 },
            clientSatisfaction: { type: Number, default: 0 }
        },
        // Team Performance Metrics
        teamMetrics: {
            teamSize: { type: Number, default: 0 },
            teamLeads: { type: Number, default: 0 },
            teamSales: { type: Number, default: 0 },
            teamRevenue: { type: Number, default: 0 },
            teamConversionRate: { type: Number, default: 0 },
            averageTeamPerformance: { type: Number, default: 0 },
            topPerformers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
            underPerformers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
        },
        // Comparative Analysis
        comparisons: {
            previousPeriod: {
                leadsGrowth: { type: Number, default: 0 },
                salesGrowth: { type: Number, default: 0 },
                revenueGrowth: { type: Number, default: 0 },
                conversionChange: { type: Number, default: 0 }
            },
            teamAverage: {
                leadsVsTeam: { type: Number, default: 0 },
                salesVsTeam: { type: Number, default: 0 },
                revenueVsTeam: { type: Number, default: 0 },
                conversionVsTeam: { type: Number, default: 0 }
            }
        },
        // Trend Analysis
        trends: {
            leadTrend: { type: String, enum: ['increasing', 'decreasing', 'stable'] },
            salesTrend: { type: String, enum: ['increasing', 'decreasing', 'stable'] },
            revenueTrend: { type: String, enum: ['increasing', 'decreasing', 'stable'] },
            conversionTrend: { type: String, enum: ['increasing', 'decreasing', 'stable'] }
        },
        // Goal Tracking
        goalProgress: {
            leadsGoal: { achieved: { type: Number, default: 0 }, target: { type: Number, default: 0 }, percentage: { type: Number, default: 0 } },
            salesGoal: { achieved: { type: Number, default: 0 }, target: { type: Number, default: 0 }, percentage: { type: Number, default: 0 } },
            revenueGoal: { achieved: { type: Number, default: 0 }, target: { type: Number, default: 0 }, percentage: { type: Number, default: 0 } },
            conversionGoal: { achieved: { type: Number, default: 0 }, target: { type: Number, default: 0 }, percentage: { type: Number, default: 0 } }
        },
        // Detailed Breakdown
        breakdown: {
            leadSources: {
                website: { type: Number, default: 0 },
                socialMedia: { type: Number, default: 0 },
                referrals: { type: Number, default: 0 },
                ads: { type: Number, default: 0 },
                other: { type: Number, default: 0 }
            },
            monthlyPerformance: [{
                month: { type: String },
                leads: { type: Number, default: 0 },
                sales: { type: Number, default: 0 },
                revenue: { type: Number, default: 0 },
                conversionRate: { type: Number, default: 0 }
            }],
            teamBreakdown: [{
                coachId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                name: { type: String },
                leads: { type: Number, default: 0 },
                sales: { type: Number, default: 0 },
                revenue: { type: Number, default: 0 },
                conversionRate: { type: Number, default: 0 },
                performanceScore: { type: Number, default: 0 }
            }]
        }
    },
    // Report Status and Metadata
    status: {
        type: String,
        enum: ['generating', 'completed', 'failed'],
        default: 'generating'
    },
    generatedAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        default: function() {
            return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        }
    },
    // Report Configuration
    config: {
        includeCharts: { type: Boolean, default: true },
        includeComparisons: { type: Boolean, default: true },
        includeRecommendations: { type: Boolean, default: true },
        format: {
            type: String,
            enum: ['json', 'pdf', 'excel', 'html'],
            default: 'json'
        }
    },
    // AI-Generated Insights
    insights: [{
        type: { type: String, enum: ['performance', 'trend', 'recommendation', 'warning'] },
        title: { type: String, required: true },
        description: { type: String, required: true },
        priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
        actionable: { type: Boolean, default: true },
        actionItems: [{ type: String }]
    }],
    // Report Access
    sharedWith: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        accessLevel: { type: String, enum: ['view', 'comment', 'edit'], default: 'view' },
        sharedAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

// Indexes for performance
reportSchema.index({ generatedBy: 1, generatedAt: -1 });
reportSchema.index({ reportType: 1, 'reportPeriod.startDate': -1 });
reportSchema.index({ status: 1, expiresAt: 1 });

module.exports = mongoose.model('CoachReport', reportSchema);
