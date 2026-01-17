const mongoose = require('mongoose');
const { Lead, Task, AdCampaign, RazorpayPayment, Staff, Coach, Appointment, Funnel, FunnelEvent } = require('../schema');
const dailyPriorityFeedService = require('./dailyPriorityFeedService');
const staffLeaderboardService = require('./staffLeaderboardService');
const aiAdsAgentService = require('./aiAdsAgentService');
const workflowTaskService = require('./workflowTaskService');
const calendarService = require('./calendarService');
const aiService = require('./aiService');

class CoachDashboardService {
    constructor() {
        this.dashboardSections = {
            OVERVIEW: 'overview',
            LEADS: 'leads',
            TASKS: 'tasks',
            MARKETING: 'marketing',
            FINANCIAL: 'financial',
            TEAM: 'team',
            PERFORMANCE: 'performance',
            CALENDAR: 'calendar' // NEW: Added calendar section
        };
    }

    async getDashboardData(coachId, timeRange = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);

        try {
            const [
                overview,
                leadsData,
                tasksData,
                detailedTasksData,
                marketingData,
                financialData,
                teamData,
                performanceData,
                calendarData,
                funnelsData,
                dailyFeed
            ] = await Promise.all([
                this.getOverviewData(coachId, startDate),
                this.getLeadsData(coachId, startDate),
                this.getTasksData(coachId, startDate),
                this.getDetailedTasksData(coachId),
                this.getMarketingData(coachId, startDate),
                this.getFinancialData(coachId, startDate, timeRange),
                this.getTeamData(coachId, startDate),
                this.getPerformanceData(coachId, startDate),
                this.getCalendarData(coachId, startDate), // NEW: Added calendar data
                this.getFunnelsData(coachId),
                dailyPriorityFeedService.generateDailyPriorityFeed(coachId)
            ]);

            // Merge tasks data with detailed tasks
            const mergedTasksData = {
                ...tasksData,
                ...detailedTasksData
            };

            return {
                overview,
                leads: leadsData,
                tasks: mergedTasksData,
                marketing: marketingData,
                financial: financialData,
                team: teamData,
                performance: performanceData,
                calendar: calendarData, // NEW: Added calendar data
                funnels: funnelsData,
                dailyFeed,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting dashboard data:', error);
            throw error;
        }
    }

    async getOverviewData(coachId, startDate) {
        const leads = await Lead.find({ coachId, createdAt: { $gte: startDate } });
        const tasks = await Task.find({ coachId, createdAt: { $gte: startDate } });
        const allPayments = await RazorpayPayment.find({ 
            coachId, 
            createdAt: { $gte: startDate },
            status: 'captured' // Only successful payments
        });
        const appointments = await Appointment.find({ coachId, startTime: { $gte: startDate } }); // NEW: Added appointments

        // Filter to only include revenue-generating payments (exclude platform_subscription, coach_payout, refund)
        const revenuePayments = allPayments.filter(payment => {
            return payment.businessType === 'coach_plan_purchase' || 
                   payment.businessType === 'mlm_commission' ||
                   (payment.businessType === 'other' && payment.userType === 'customer');
        });

        const totalLeads = leads.length;
        const convertedLeads = leads.filter(lead => lead.status === 'Converted').length;
        const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.status === 'Completed').length;
        const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        // Calculate revenue only from revenue-generating payments
        const totalRevenue = revenuePayments.reduce((sum, payment) => sum + payment.amount, 0);
        const avgRevenuePerLead = convertedLeads > 0 ? totalRevenue / convertedLeads : 0;

        // NEW: Appointment metrics
        const totalAppointments = appointments.length;
        const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
        const appointmentCompletionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;

        // Calculate growth rates
        const previousPeriodStart = new Date(startDate);
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 30);
        
        const previousLeads = await Lead.find({ 
            coachId, 
            createdAt: { $gte: previousPeriodStart, $lt: startDate } 
        });
        
        const leadGrowth = previousLeads.length > 0 ? 
            ((totalLeads - previousLeads.length) / previousLeads.length) * 100 : 0;

        return {
            metrics: {
                totalLeads,
                convertedLeads,
                conversionRate: Math.round(conversionRate * 100) / 100,
                totalTasks,
                completedTasks,
                taskCompletionRate: Math.round(taskCompletionRate * 100) / 100,
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                avgRevenuePerLead: Math.round(avgRevenuePerLead * 100) / 100,
                leadGrowth: Math.round(leadGrowth * 100) / 100,
                // NEW: Added appointment metrics
                totalAppointments,
                completedAppointments,
                appointmentCompletionRate: Math.round(appointmentCompletionRate * 100) / 100
            },
            quickActions: [
                { name: 'Create New Lead', action: 'create_lead', icon: '👤' },
                { name: 'Generate Ad Copy', action: 'generate_ad', icon: '🤖' },
                { name: 'View Kanban Board', action: 'view_kanban', icon: '📋' },
                { name: 'Team Leaderboard', action: 'view_leaderboard', icon: '🏆' },
                { name: 'Book Appointment', action: 'book_appointment', icon: '📅' }, // NEW: Added appointment action
                { name: 'View Calendar', action: 'view_calendar', icon: '🗓️' } // NEW: Added calendar action
            ]
        };
    }

    // NEW: Added calendar data method
    async getCalendarData(coachId, startDate) {
        try {
            const [upcomingAppointments, todayAppointments, appointmentStats] = await Promise.all([
                calendarService.getUpcomingAppointments(coachId, 5),
                calendarService.getTodayAppointments(coachId),
                calendarService.getAppointmentStats(coachId, 30)
            ]);

            return {
                upcomingAppointments,
                todayAppointments,
                stats: appointmentStats,
                nextAppointment: upcomingAppointments.length > 0 ? upcomingAppointments[0] : null
            };
        } catch (error) {
            console.error('Error getting calendar data:', error);
            return {
                upcomingAppointments: [],
                todayAppointments: [],
                stats: {},
                nextAppointment: null
            };
        }
    }

    async getLeadsData(coachId, startDate) {
        const leads = await Lead.find({ coachId, createdAt: { $gte: startDate } })
            .populate('funnelId', 'name')
            .lean();

        // Lead status distribution
        const statusDistribution = {};
        leads.forEach(lead => {
            statusDistribution[lead.status] = (statusDistribution[lead.status] || 0) + 1;
        });

        // Lead distribution by Funnel Name ONLY (not by source)
        // Only count leads that have a funnelId - ignore leads without funnels
        const leadsBySource = [];
        const funnelDistribution = {};
        
        leads.forEach(lead => {
            // Only get funnel name from funnelId or funnelName field - NO fallback to source
            let funnelName = null;
            if (lead.funnelId && lead.funnelId.name) {
                funnelName = lead.funnelId.name;
            } else if (lead.funnelName) {
                funnelName = lead.funnelName;
            }
            
            // Only count leads that have a funnel
            if (funnelName) {
                funnelDistribution[funnelName] = (funnelDistribution[funnelName] || 0) + 1;
            }
        });

        // Get all unique funnel IDs from leads
        const funnelIdSet = new Set();
        const funnelNameToIdMap = {};
        
        leads.forEach(lead => {
            let funnelId = null;
            let funnelName = null;
            
            if (lead.funnelId) {
                if (lead.funnelId._id) {
                    funnelId = lead.funnelId._id;
                    funnelName = lead.funnelId.name;
                } else if (typeof lead.funnelId === 'object' && lead.funnelId.toString) {
                    funnelId = lead.funnelId;
                    funnelName = lead.funnelName;
                } else if (typeof lead.funnelId === 'string') {
                    funnelId = lead.funnelId;
                    funnelName = lead.funnelName;
                }
            } else if (lead.funnelName) {
                funnelName = lead.funnelName;
            }
            
            if (funnelId) {
                const idStr = funnelId.toString ? funnelId.toString() : funnelId;
                funnelIdSet.add(idStr);
                if (funnelName && !funnelNameToIdMap[funnelName]) {
                    funnelNameToIdMap[funnelName] = idStr;
                }
            }
        });

        // Get view counts for each funnel from FunnelEvent
        const funnelIdsArray = Array.from(funnelIdSet).map(id => {
            try {
                return new mongoose.Types.ObjectId(id);
            } catch (e) {
                return id;
            }
        });
        
        let viewsMap = {};
        if (funnelIdsArray.length > 0) {
            try {
                // Use same pattern as analyticsController for consistency
                const viewCounts = await FunnelEvent.aggregate([
                    {
                        $match: {
                            funnelId: { $in: funnelIdsArray },
                            eventType: 'PageView'
                        }
                    },
                    {
                        $group: {
                            _id: '$funnelId',
                            totalViews: { $sum: 1 },
                            uniqueVisitors: { $addToSet: '$sessionId' }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            totalViews: 1,
                            uniqueVisitors: { $size: '$uniqueVisitors' }
                        }
                    }
                ]);

                // Create a map of funnelId to views
                viewCounts.forEach(item => {
                    const idStr = item._id.toString();
                    viewsMap[idStr] = {
                        totalViews: item.totalViews,
                        uniqueViews: item.uniqueVisitors
                    };
                });
            } catch (error) {
                console.error('Error getting funnel views:', error);
                // Continue with empty viewsMap if there's an error
            }
        }

        // Convert to array format for frontend with views
        Object.entries(funnelDistribution).forEach(([funnelName, count]) => {
            const totalLeadsWithFunnels = Object.values(funnelDistribution).reduce((sum, val) => sum + val, 0);
            const funnelId = funnelNameToIdMap[funnelName];
            const views = funnelId ? (viewsMap[funnelId] || { totalViews: 0, uniqueViews: 0 }) : { totalViews: 0, uniqueViews: 0 };
            
            leadsBySource.push({
                name: funnelName,
                count: count,
                percentage: totalLeadsWithFunnels > 0 ? ((count / totalLeadsWithFunnels) * 100).toFixed(1) : 0,
                views: views.totalViews,
                uniqueViews: views.uniqueViews
            });
        });

        // Sort by count descending
        leadsBySource.sort((a, b) => b.count - a.count);

        // Conversion funnel
        const funnel = {
            total: leads.length,
            qualified: leads.filter(lead => lead.status === 'Qualified').length,
            proposal: leads.filter(lead => lead.status === 'Proposal').length,
            converted: leads.filter(lead => lead.status === 'Converted').length
        };

        // Recent leads
        const recentLeads = leads
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map(lead => ({
                id: lead._id,
                name: lead.name,
                email: lead.email,
                status: lead.status,
                source: lead.source,
                funnelId: lead.funnelId?._id || lead.funnelId,
                funnelName: lead.funnelId?.name || lead.funnelName,
                createdAt: lead.createdAt,
                assignedTo: lead.assignedTo
            }));

        return {
            statusDistribution,
            sourceAnalysis: funnelDistribution, // Keep for backward compatibility
            leadsBySource, // New format with funnel names
            funnel,
            recentLeads,
            totalLeads: leads.length
        };
    }

    async getTasksData(coachId, startDate) {
        const tasks = await Task.find({ coachId, createdAt: { $gte: startDate } });

        // Task status distribution
        const statusDistribution = {};
        tasks.forEach(task => {
            statusDistribution[task.status] = (statusDistribution[task.status] || 0) + 1;
        });

        // Task stage distribution
        const stageDistribution = {};
        tasks.forEach(task => {
            stageDistribution[task.stage] = (stageDistribution[task.stage] || 0) + 1;
        });

        // Priority distribution
        const priorityDistribution = {};
        tasks.forEach(task => {
            priorityDistribution[task.priority] = (priorityDistribution[task.priority] || 0) + 1;
        });

        // Overdue tasks
        const overdueTasks = tasks.filter(task => 
            task.status !== 'Completed' && 
            task.dueDate < new Date()
        );

        // Upcoming tasks (next 7 days)
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const upcomingTasks = tasks.filter(task => 
            task.status !== 'Completed' && 
            task.dueDate >= new Date() && 
            task.dueDate <= nextWeek
        );

        return {
            statusDistribution,
            stageDistribution,
            priorityDistribution,
            overdueTasks: overdueTasks.length,
            upcomingTasks: upcomingTasks.length,
            totalTasks: tasks.length,
            completedTasks: tasks.filter(task => task.status === 'Completed').length
        };
    }

    async getDetailedTasksData(coachId) {
        try {
            // Get all tasks with full details (limit to 200 for performance)
            const tasks = await Task.find({ coachId })
                .sort({ createdAt: -1 })
                .limit(200)
                .lean();

            // Calculate distributions and metrics
            const statusDistribution = {};
            const stageDistribution = {};
            const priorityDistribution = {};
            let overdueTasks = 0;
            let upcomingTasks = 0;
            const now = new Date();

            tasks.forEach(task => {
                // Status distribution
                const status = task.status || 'Pending';
                statusDistribution[status] = (statusDistribution[status] || 0) + 1;
                
                // Stage distribution
                const stage = task.stage || task.customStage || 'Unassigned';
                stageDistribution[stage] = (stageDistribution[stage] || 0) + 1;
                
                // Priority distribution
                const priority = task.priority || 'LOW';
                priorityDistribution[priority] = (priorityDistribution[priority] || 0) + 1;
                
                // Overdue and upcoming tasks
                if (task.dueDate) {
                    const dueDate = new Date(task.dueDate);
                    if (dueDate < now && status !== 'Completed' && status !== 'Done') {
                        overdueTasks++;
                    } else if (dueDate > now && status !== 'Completed' && status !== 'Done') {
                        upcomingTasks++;
                    }
                }
            });

            const completedTasks = tasks.filter(t => 
                t.status === 'Completed' || t.status === 'Done'
            ).length;

            return {
                totalTasks: tasks.length,
                completedTasks,
                pendingTasks: tasks.length - completedTasks,
                statusDistribution,
                stageDistribution,
                priorityDistribution,
                overdueTasks,
                upcomingTasks,
                tasks: tasks.slice(0, 10) // Keep recent tasks for reference
            };
        } catch (error) {
            console.error('Error getting detailed tasks data:', error);
            // Return empty structure on error
            return {
                totalTasks: 0,
                completedTasks: 0,
                pendingTasks: 0,
                statusDistribution: {},
                stageDistribution: {},
                priorityDistribution: {},
                overdueTasks: 0,
                upcomingTasks: 0,
                tasks: []
            };
        }
    }

    async getFunnelsData(coachId) {
        try {
            // Get all funnels for the coach
            const funnels = await Funnel.find({ coachId })
                .select('name _id stages funnelUrl')
                .lean();

            // Get view counts for each funnel from FunnelEvent (using same pattern as analyticsController)
            const funnelIds = funnels.map(f => f._id);
            const viewCounts = await FunnelEvent.aggregate([
                {
                    $match: {
                        funnelId: { $in: funnelIds },
                        eventType: 'PageView'
                    }
                },
                {
                    $group: {
                        _id: '$funnelId',
                        totalViews: { $sum: 1 },
                        uniqueVisitors: { $addToSet: '$sessionId' }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        totalViews: 1,
                        uniqueVisitors: { $size: '$uniqueVisitors' }
                    }
                }
            ]);

            // Create a map of funnelId to view count
            const viewsMap = {};
            viewCounts.forEach(item => {
                viewsMap[item._id.toString()] = {
                    totalViews: item.totalViews,
                    uniqueViews: item.uniqueVisitors
                };
            });

            // Create a map of funnelId to funnel name (string) for easy lookup
            const funnelMap = {};
            funnels.forEach(funnel => {
                funnelMap[funnel._id.toString()] = funnel.name; // Just the name as string
            });

            return {
                funnels: funnels.map(f => ({
                    id: f._id.toString(),
                    name: f.name,
                    url: f.funnelUrl,
                    stages: f.stages || [],
                    views: viewsMap[f._id.toString()]?.totalViews || 0,
                    uniqueViews: viewsMap[f._id.toString()]?.uniqueViews || 0
                })),
                funnelMap // Now contains string values, not objects
            };
        } catch (error) {
            console.error('Error getting funnels data:', error);
            // Return empty structure on error
            return {
                funnels: [],
                funnelMap: {}
            };
        }
    }

    async getMarketingData(coachId, startDate) {
        const campaigns = await AdCampaign.find({ coachId, createdAt: { $gte: startDate } });

        // Campaign performance
        const campaignPerformance = campaigns.map(campaign => ({
            id: campaign._id,
            name: campaign.name,
            status: campaign.status,
            spend: campaign.totalSpent || 0,
            impressions: campaign.impressions || 0,
            clicks: campaign.clicks || 0,
            conversions: campaign.conversions || 0,
            ctr: campaign.clicks > 0 ? (campaign.clicks / campaign.impressions) * 100 : 0,
            cpc: campaign.clicks > 0 ? campaign.spend / campaign.clicks : 0,
            roas: campaign.conversions > 0 ? campaign.revenue / campaign.spend : 0
        }));

        // AI insights
        const aiInsights = await this.getAIInsights(coachId, startDate);

        // Marketing metrics
        const totalSpend = campaigns.reduce((sum, campaign) => sum + (campaign.totalSpent || 0), 0);
        const totalImpressions = campaigns.reduce((sum, campaign) => sum + (campaign.impressions || 0), 0);
        const totalClicks = campaigns.reduce((sum, campaign) => sum + (campaign.clicks || 0), 0);
        const totalConversions = campaigns.reduce((sum, campaign) => sum + (campaign.conversions || 0), 0);

        return {
            campaignPerformance,
            aiInsights,
            metrics: {
                totalSpend,
                totalImpressions,
                totalClicks,
                totalConversions,
                avgCTR: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
                avgCPC: totalClicks > 0 ? totalSpend / totalClicks : 0,
                avgROAS: totalConversions > 0 ? totalConversions / totalSpend : 0
            },
            activeCampaigns: campaigns.filter(campaign => campaign.status === 'ACTIVE').length
        };
    }

    async getFinancialData(coachId, startDate, timeRange) {
        // Only get payments that are REVENUE (money coming IN to the coach)
        // Exclude: platform_subscription (coach paying for platform), coach_payout (money going out), refunds
        const allPayments = await RazorpayPayment.find({ 
            coachId, 
            createdAt: { $gte: startDate },
            status: 'captured' // Only successful payments
        });

        // Filter to only include revenue-generating payments
        // Include: coach_plan_purchase (clients buying coach's plans), mlm_commission (earnings)
        // Exclude: platform_subscription, coach_payout, refund
        const revenuePayments = allPayments.filter(payment => {
            return payment.businessType === 'coach_plan_purchase' || 
                   payment.businessType === 'mlm_commission' ||
                   (payment.businessType === 'other' && payment.userType === 'customer');
        });

        // Revenue by month (only from revenue payments)
        const revenueByMonth = {};
        revenuePayments.forEach(payment => {
            const month = new Date(payment.createdAt).toISOString().slice(0, 7);
            revenueByMonth[month] = (revenueByMonth[month] || 0) + payment.amount;
        });

        // Payment status distribution (for all payments, but revenue calculated separately)
        const paymentStatusDistribution = {};
        allPayments.forEach(payment => {
            paymentStatusDistribution[payment.status] = (paymentStatusDistribution[payment.status] || 0) + 1;
        });

        // Revenue trends (only from revenue payments)
        const totalRevenue = revenuePayments.reduce((sum, payment) => sum + payment.amount, 0);
        const avgRevenuePerDay = timeRange > 0 ? totalRevenue / timeRange : 0;

        // Projected revenue (based on current conversion rate and leads)
        const leads = await Lead.find({ coachId, createdAt: { $gte: startDate } });
        const conversionRate = leads.length > 0 ? 
            leads.filter(lead => lead.status === 'Converted').length / leads.length : 0;
        const avgRevenuePerClient = revenuePayments.length > 0 ? totalRevenue / revenuePayments.length : 0;
        const projectedRevenue = leads.filter(lead => lead.status === 'Qualified').length * 
            conversionRate * avgRevenuePerClient;

        return {
            revenueByMonth,
            paymentStatusDistribution,
            metrics: {
                totalRevenue,
                avgRevenuePerDay,
                projectedRevenue,
                totalPayments: revenuePayments.length, // Only count revenue payments
                avgRevenuePerClient
            }
        };
    }

    async getTeamData(coachId, startDate) {
        const staff = await Staff.find({ coachId, isActive: true });
        const leaderboard = await staffLeaderboardService.getLeaderboard(coachId, 30, 10);
        const teamAnalytics = await staffLeaderboardService.getTeamAnalytics(coachId, 30);

        // Staff workload
        const staffWorkload = await Promise.all(staff.map(async (member) => {
            const tasks = await Task.find({ 
                assignedTo: member._id, 
                coachId, 
                status: { $ne: 'Completed' } 
            });

            return {
                staffId: member._id,
                name: member.name,
                role: member.role,
                currentTasks: tasks.length,
                completedThisWeek: await this.getCompletedTasksThisWeek(member._id, coachId)
            };
        }));

        return {
            leaderboard,
            teamAnalytics,
            staffWorkload,
            totalStaff: staff.length,
            activeStaff: staff.filter(s => s.isActive).length
        };
    }

    async getPerformanceData(coachId, startDate) {
        // Performance trends over time
        const performanceTrends = await this.getPerformanceTrends(coachId, startDate);

        // Key performance indicators
        const kpis = await this.calculateKPIs(coachId, startDate);

        // Performance alerts
        const alerts = await this.getPerformanceAlerts(coachId, startDate);

        return {
            trends: performanceTrends,
            kpis,
            alerts
        };
    }

    async getAIInsights(coachId, startDate) {
        const campaigns = await AdCampaign.find({ coachId, createdAt: { $gte: startDate } });
        const insights = [];

        // Analyze campaign performance
        for (const campaign of campaigns) {
            if (campaign.status === 'ACTIVE') {
                try {
                    const anomalies = await aiAdsAgentService.detectAnomalies(coachId, campaign._id);
                    if (anomalies.length > 0) {
                        insights.push({
                            type: 'anomaly',
                            campaignId: campaign._id,
                            campaignName: campaign.name,
                            anomalies: anomalies
                        });
                    }

                    // Budget optimization suggestions
                    const budgetOptimization = await aiAdsAgentService.optimizeBudgetAllocation(coachId, campaign._id);
                    if (budgetOptimization.recommendations.length > 0) {
                        insights.push({
                            type: 'budget_optimization',
                            campaignId: campaign._id,
                            campaignName: campaign.name,
                            recommendations: budgetOptimization.recommendations
                        });
                    }
                } catch (error) {
                    console.error(`Error getting AI insights for campaign ${campaign._id}:`, error);
                }
            }
        }

        return insights;
    }

    async getPerformanceTrends(coachId, startDate) {
        const trends = [];
        const days = 30;

        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            const dayStart = new Date(date);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 59, 999);

            const leads = await Lead.find({
                coachId,
                createdAt: { $gte: dayStart, $lte: dayEnd }
            });

            const tasks = await Task.find({
                coachId,
                createdAt: { $gte: dayStart, $lte: dayEnd }
            });

            const payments = await RazorpayPayment.find({
                coachId,
                createdAt: { $gte: dayStart, $lte: dayEnd }
            });

            // NEW: Added appointment trends
            const appointments = await Appointment.find({
                coachId,
                startTime: { $gte: dayStart, $lte: dayEnd }
            });

            trends.push({
                date: date.toISOString().split('T')[0],
                leads: leads.length,
                tasks: tasks.length,
                revenue: payments.reduce((sum, payment) => sum + payment.amount, 0),
                conversions: leads.filter(lead => lead.status === 'Converted').length,
                appointments: appointments.length // NEW: Added appointment count
            });
        }

        return trends;
    }

    async calculateKPIs(coachId, startDate) {
        const leads = await Lead.find({ coachId, createdAt: { $gte: startDate } });
        const tasks = await Task.find({ coachId, createdAt: { $gte: startDate } });
        const payments = await RazorpayPayment.find({ coachId, createdAt: { $gte: startDate } });
        const appointments = await Appointment.find({ coachId, startTime: { $gte: startDate } }); // NEW: Added appointments

        const totalLeads = leads.length;
        const convertedLeads = leads.filter(lead => lead.status === 'Converted').length;
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.status === 'Completed').length;
        const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
        
        // NEW: Added appointment KPIs
        const totalAppointments = appointments.length;
        const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;

        return {
            leadConversionRate: totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0,
            taskCompletionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
            revenuePerLead: totalLeads > 0 ? totalRevenue / totalLeads : 0,
            avgTaskDuration: await this.calculateAvgTaskDuration(tasks),
            customerSatisfaction: await this.calculateCustomerSatisfaction(coachId, startDate),
            // NEW: Added appointment KPIs
            appointmentCompletionRate: totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0,
            avgAppointmentsPerDay: totalAppointments > 0 ? totalAppointments / 30 : 0
        };
    }

    async getPerformanceAlerts(coachId, startDate) {
        const alerts = [];

        // Check for low conversion rates
        const leads = await Lead.find({ coachId, createdAt: { $gte: startDate } });
        const conversionRate = leads.length > 0 ? 
            leads.filter(lead => lead.status === 'Converted').length / leads.length : 0;

        if (conversionRate < 0.1) { // Less than 10%
            alerts.push({
                type: 'warning',
                message: 'Low lead conversion rate detected',
                value: `${(conversionRate * 100).toFixed(1)}%`,
                recommendation: 'Review lead qualification process and sales approach'
            });
        }

        // Check for overdue tasks
        const overdueTasks = await Task.find({
            coachId,
            status: { $ne: 'Completed' },
            dueDate: { $lt: new Date() }
        });

        if (overdueTasks.length > 5) {
            alerts.push({
                type: 'error',
                message: 'Multiple overdue tasks detected',
                value: `${overdueTasks.length} tasks`,
                recommendation: 'Review task assignments and deadlines'
            });
        }

        // NEW: Check for appointment issues
        const appointments = await Appointment.find({
            coachId,
            startTime: { $gte: startDate }
        });
        
        const noShowRate = appointments.length > 0 ? 
            appointments.filter(apt => apt.status === 'no_show').length / appointments.length : 0;
            
        if (noShowRate > 0.2) { // More than 20%
            alerts.push({
                type: 'warning',
                message: 'High no-show rate detected',
                value: `${(noShowRate * 100).toFixed(1)}%`,
                recommendation: 'Implement better reminder system and follow-up procedures'
            });
        }

        // Check for low team performance
        const teamAnalytics = await staffLeaderboardService.getTeamAnalytics(coachId, 30);
        if (teamAnalytics.averageScore < 70) {
            alerts.push({
                type: 'warning',
                message: 'Team performance below target',
                value: `${teamAnalytics.averageScore}%`,
                recommendation: 'Consider additional training or support'
            });
        }

        return alerts;
    }

    async getCompletedTasksThisWeek(staffId, coachId) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        
        const tasks = await Task.find({
            assignedTo: staffId,
            coachId,
            status: 'Completed',
            completedAt: { $gte: weekStart }
        });

        return tasks.length;
    }

    async calculateAvgTaskDuration(tasks) {
        const completedTasks = tasks.filter(task => 
            task.status === 'Completed' && 
            task.completedAt && 
            task.createdAt
        );

        if (completedTasks.length === 0) return 0;

        const totalDuration = completedTasks.reduce((sum, task) => {
            const duration = new Date(task.completedAt) - new Date(task.createdAt);
            return sum + duration;
        }, 0);

        return totalDuration / completedTasks.length / (1000 * 60 * 60); // Convert to hours
    }

    async calculateCustomerSatisfaction(coachId, startDate) {
        const leads = await Lead.find({ 
            coachId, 
            createdAt: { $gte: startDate },
            satisfactionRating: { $exists: true }
        });

        if (leads.length === 0) return 0;

        const totalRating = leads.reduce((sum, lead) => sum + lead.satisfactionRating, 0);
        return totalRating / leads.length;
    }

    async getDashboardWidgets(coachId) {
        return [
            {
                id: 'revenue_chart',
                title: 'Revenue Trends',
                type: 'chart',
                data: await this.getRevenueChartData(coachId)
            },
            {
                id: 'lead_funnel',
                title: 'Lead Conversion Funnel',
                type: 'funnel',
                data: await this.getLeadFunnelData(coachId)
            },
            {
                id: 'team_performance',
                title: 'Team Performance',
                type: 'leaderboard',
                data: await staffLeaderboardService.getLeaderboard(coachId, 30, 5)
            },
            {
                id: 'task_overview',
                title: 'Task Overview',
                type: 'kanban',
                data: await workflowTaskService.getKanbanBoard(coachId)
            },
            // NEW: Added calendar widget
            {
                id: 'calendar_overview',
                title: 'Calendar Overview',
                type: 'calendar',
                data: await this.getCalendarData(coachId, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
            }
        ];
    }

    async getRevenueChartData(coachId) {
        const payments = await RazorpayPayment.find({ coachId });
        const monthlyData = {};

        payments.forEach(payment => {
            const month = new Date(payment.createdAt).toISOString().slice(0, 7);
            monthlyData[month] = (monthlyData[month] || 0) + payment.amount;
        });

        return Object.entries(monthlyData).map(([month, revenue]) => ({
            month,
            revenue
        }));
    }

    async getLeadFunnelData(coachId) {
        const leads = await Lead.find({ coachId });
        
        return {
            total: leads.length,
            qualified: leads.filter(lead => lead.status === 'Qualified').length,
            proposal: leads.filter(lead => lead.status === 'Proposal').length,
            converted: leads.filter(lead => lead.status === 'Converted').length
        };
    }
}

// AI-powered dashboard insights generation
async function generateAIDashboardInsights(coachId, timeRange = '30d') {
    try {
        // Get coach performance data
        const performanceData = await this.calculateKPIs(coachId, timeRange);
        const leadData = await this.getLeadsData(coachId, timeRange);
        const revenueData = await this.getFinancialData(coachId, timeRange, 30);

        // Generate AI insights
        const insightsPrompt = `Analyze this coach's performance data and provide actionable insights:
        
        Performance Metrics:
        - Total Leads: ${leadData.totalLeads}
        - Conversion Rate: ${performanceData.leadConversionRate}%
        - Average Lead Score: ${performanceData.avgLeadScore}
        - Revenue: $${revenueData.totalRevenue}
        - Time Period: ${timeRange}
        
        Provide:
        1. Key performance insights
        2. Areas for improvement
        3. Recommended actions
        4. Growth opportunities
        5. Risk factors to watch`;

        const insights = await aiService.generateMarketingCopy(insightsPrompt, {
            temperature: 0.6,
            maxTokens: 600
        });

        // Generate personalized recommendations
        const recommendationsPrompt = `Based on the performance data above, generate specific, actionable recommendations for this coach to improve their business:
        
        Focus on:
        - Lead generation strategies
        - Conversion optimization
        - Revenue growth tactics
        - Time management
        - Skill development`;

        const recommendations = await aiService.generateMarketingCopy(recommendationsPrompt, {
            temperature: 0.7,
            maxTokens: 500
        });

        return {
            success: true,
            insights: insights.content,
            recommendations: recommendations.content,
            generatedAt: new Date(),
            timeRange
        };

    } catch (error) {
        console.error('Error generating AI dashboard insights:', error);
        return { success: false, error: error.message };
    }
}

// AI-powered content generation for social media
async function generateSocialMediaContent(coachId, platform, contentType) {
    try {
        const coach = await Coach.findById(coachId);
        if (!coach) {
            throw new Error('Coach not found');
        }

        const leadData = await this.getLeadsData(coachId, '7d');
        
        let prompt = '';
        switch (contentType) {
            case 'success_story':
                prompt = `Create a compelling success story post for ${coach.name}, a ${coach.niche} coach. 
                Recent achievements: ${leadData.convertedLeads} new clients this week, 
                average lead score: ${leadData.avgLeadScore}/100. 
                Make it inspiring and include relevant hashtags for ${platform}.`;
                break;
                
            case 'lead_generation':
                prompt = `Create a lead generation post for ${coach.name}, a ${coach.niche} coach. 
                Offer: ${coach.offer || 'Transformation Program'}. 
                Target audience: ${coach.targetAudience || 'Fitness enthusiasts'}. 
                Make it engaging and include a clear call-to-action for ${platform}.`;
                break;
                
            case 'value_content':
                prompt = `Create valuable, educational content for ${coach.name}, a ${coach.niche} coach. 
                Focus on providing actionable tips that showcase expertise. 
                Platform: ${platform}, Goal: Build authority and trust.`;
                break;
                
            default:
                prompt = `Create engaging social media content for ${coach.name}, a ${coach.niche} coach. 
                Content type: ${contentType}, Platform: ${platform}. 
                Make it relevant to their audience and business goals.`;
        }

        const content = await aiService.generateSocialPost(
            coach.name,
            coach.niche,
            coach.offer || 'Transformation Program',
            coach.targetAudience || 'Fitness enthusiasts'
        );

        return {
            success: true,
            content: content.content,
            platform,
            contentType,
            generatedAt: new Date()
        };

    } catch (error) {
        console.error('Error generating social media content:', error);
        return { success: false, error: error.message };
    }
}

// AI-powered lead nurturing recommendations
async function generateLeadNurturingRecommendations(coachId, leadId) {
    try {
        const lead = await Lead.findById(leadId).populate('coachId');
        if (!lead) {
            throw new Error('Lead not found');
        }

        const nurturingPrompt = `Generate a personalized nurturing strategy for ${lead.name}:
        
        Lead Profile:
        - Score: ${lead.score}/100
        - Status: ${lead.status}
        - Source: ${lead.source}
        - Previous follow-ups: ${lead.followUpHistory?.length || 0}
        - Coach: ${lead.coachId?.name}, Niche: ${lead.coachId?.niche}
        
        Provide:
        1. Recommended nurturing sequence (3-5 steps)
        2. Timing for each step
        3. Content suggestions for each message
        4. Objection handling strategies
        5. Conversion optimization tips`;

        const recommendations = await aiService.generateMarketingCopy(nurturingPrompt, {
            temperature: 0.7,
            maxTokens: 800
        });

        return {
            success: true,
            recommendations: recommendations.content,
            leadId: lead._id,
            leadName: lead.name,
            generatedAt: new Date()
        };

    } catch (error) {
        console.error('Error generating nurturing recommendations:', error);
        return { success: false, error: error.message };
    }
}

// AI-powered performance optimization suggestions
async function generatePerformanceOptimizationSuggestions(coachId) {
    try {
        const performanceData = await this.calculateKPIs(coachId, '90d');
        const leadData = await this.getLeadsData(coachId, '90d');
        const revenueData = await this.getFinancialData(coachId, '90d', 30);

        const optimizationPrompt = `Analyze this coach's performance and provide optimization suggestions:
        
        Current Performance:
        - Lead Conversion: ${performanceData.leadConversionRate}%
        - Average Lead Score: ${performanceData.avgLeadScore}/100
        - Revenue per Lead: $${revenueData.avgRevenuePerLead}
        - Lead Response Time: ${performanceData.avgResponseTime} hours
        
        Provide specific, actionable suggestions to:
        1. Improve conversion rates
        2. Increase lead scores
        3. Reduce response times
        4. Boost revenue per lead
        5. Optimize lead nurturing processes`;

        const suggestions = await aiService.generateMarketingCopy(optimizationPrompt, {
            temperature: 0.6,
            maxTokens: 700
        });

        return {
            success: true,
            suggestions: suggestions.content,
            coachId,
            generatedAt: new Date()
        };

    } catch (error) {
        console.error('Error generating optimization suggestions:', error);
        return { success: false, error: error.message };
    }
}

module.exports = new CoachDashboardService();
