const Staff = require('../schema/Staff');
const StaffCalendar = require('../schema/StaffCalendar');
const Task = require('../schema/Task');
const Lead = require('../schema/Lead');

/**
 * Staff Performance Service
 * Tracks and calculates performance metrics for staff members
 */
class StaffPerformanceService {
    
    /**
     * Calculate comprehensive performance metrics for a staff member
     * @param {string} staffId - Staff member ID
     * @param {Object} options - Calculation options
     * @returns {Object} Performance metrics
     */
    async calculateStaffPerformance(staffId, options = {}) {
        try {
            const {
                startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                endDate = new Date(),
                includeDetails = false
            } = options;

            const start = new Date(startDate);
            const end = new Date(endDate);

            // Get staff member
            const staff = await Staff.findById(staffId);
            if (!staff) {
                throw new Error('Staff member not found');
            }

            // Calculate task performance
            const taskMetrics = await this.calculateTaskMetrics(staffId, start, end);
            
            // Calculate lead management performance
            const leadMetrics = await this.calculateLeadMetrics(staffId, start, end);
            
            // Calculate calendar/availability performance
            const calendarMetrics = await this.calculateCalendarMetrics(staffId, start, end);
            
            // Calculate response time metrics
            const responseMetrics = await this.calculateResponseMetrics(staffId, start, end);
            
            // Calculate overall score
            const overallScore = this.calculateOverallScore({
                taskMetrics,
                leadMetrics,
                calendarMetrics,
                responseMetrics
            });

            const performance = {
                staffId: staff._id,
                staffName: staff.name,
                period: {
                    start: start,
                    end: end
                },
                overallScore,
                taskMetrics,
                leadMetrics,
                calendarMetrics,
                responseMetrics,
                summary: {
                    totalTasks: taskMetrics.totalTasks,
                    completedTasks: taskMetrics.completedTasks,
                    totalLeads: leadMetrics.totalLeads,
                    managedLeads: leadMetrics.managedLeads,
                    availability: calendarMetrics.availabilityPercentage,
                    averageResponseTime: responseMetrics.averageResponseTime
                }
            };

            if (includeDetails) {
                performance.detailedMetrics = {
                    taskBreakdown: taskMetrics.breakdown,
                    leadBreakdown: leadMetrics.breakdown,
                    calendarBreakdown: calendarMetrics.breakdown
                };
            }

            return performance;

        } catch (error) {
            console.error('Error calculating staff performance:', error);
            throw error;
        }
    }

    /**
     * Calculate task-related performance metrics
     */
    async calculateTaskMetrics(staffId, startDate, endDate) {
        try {
            const tasks = await Task.find({
                assignedTo: staffId,
                createdAt: { $gte: startDate, $lte: endDate }
            });

            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(task => task.status === 'completed').length;
            const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
            const overdueTasks = tasks.filter(task => 
                task.dueDate < new Date() && task.status !== 'completed'
            ).length;

            const onTimeCompletion = tasks.filter(task => 
                task.status === 'completed' && task.completedAt <= task.dueDate
            ).length;

            const breakdown = {
                total: totalTasks,
                completed: completedTasks,
                inProgress: inProgressTasks,
                overdue: overdueTasks,
                onTime: onTimeCompletion,
                completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
                onTimeRate: completedTasks > 0 ? (onTimeCompletion / completedTasks) * 100 : 0
            };

            return {
                totalTasks,
                completedTasks,
                inProgressTasks,
                overdueTasks,
                onTimeCompletion,
                breakdown
            };

        } catch (error) {
            console.error('Error calculating task metrics:', error);
            return {
                totalTasks: 0,
                completedTasks: 0,
                inProgressTasks: 0,
                overdueTasks: 0,
                onTimeCompletion: 0,
                breakdown: {
                    total: 0,
                    completed: 0,
                    inProgress: 0,
                    overdue: 0,
                    onTime: 0,
                    completionRate: 0,
                    onTimeRate: 0
                }
            };
        }
    }

    /**
     * Calculate lead management performance metrics
     */
    async calculateLeadMetrics(staffId, startDate, endDate) {
        try {
            const leads = await Lead.find({
                assignedTo: staffId,
                createdAt: { $gte: startDate, $lte: endDate }
            });

            const totalLeads = leads.length;
            const managedLeads = leads.filter(lead => lead.status !== 'new').length;
            const convertedLeads = leads.filter(lead => lead.status === 'converted').length;
            const qualifiedLeads = leads.filter(lead => lead.status === 'qualified').length;

            const breakdown = {
                total: totalLeads,
                managed: managedLeads,
                converted: convertedLeads,
                qualified: qualifiedLeads,
                managementRate: totalLeads > 0 ? (managedLeads / totalLeads) * 100 : 0,
                conversionRate: managedLeads > 0 ? (convertedLeads / managedLeads) * 100 : 0,
                qualificationRate: managedLeads > 0 ? (qualifiedLeads / managedLeads) * 100 : 0
            };

            return {
                totalLeads,
                managedLeads,
                convertedLeads,
                qualifiedLeads,
                breakdown
            };

        } catch (error) {
            console.error('Error calculating lead metrics:', error);
            return {
                totalLeads: 0,
                managedLeads: 0,
                convertedLeads: 0,
                qualifiedLeads: 0,
                breakdown: {
                    total: 0,
                    managed: 0,
                    converted: 0,
                    qualified: 0,
                    managementRate: 0,
                    conversionRate: 0,
                    qualificationRate: 0
                }
            };
        }
    }

    /**
     * Calculate calendar and availability metrics
     */
    async calculateCalendarMetrics(staffId, startDate, endDate) {
        try {
            const events = await StaffCalendar.find({
                staffId,
                startTime: { $gte: startDate, $lte: endDate },
                status: { $ne: 'cancelled' }
            });

            const totalEvents = events.length;
            const completedEvents = events.filter(event => event.status === 'completed').length;
            const cancelledEvents = events.filter(event => event.status === 'cancelled').length;
            const totalDuration = events.reduce((sum, event) => sum + (event.duration || 0), 0);

            // Calculate availability percentage (assuming 8-hour workday)
            const workDays = Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000));
            const totalWorkHours = workDays * 8 * 60; // in minutes
            const availabilityPercentage = totalWorkHours > 0 ? (totalDuration / totalWorkHours) * 100 : 0;

            const breakdown = {
                total: totalEvents,
                completed: completedEvents,
                cancelled: cancelledEvents,
                totalDuration,
                availabilityPercentage: Math.min(availabilityPercentage, 100)
            };

            return {
                totalEvents,
                completedEvents,
                cancelledEvents,
                totalDuration,
                availabilityPercentage: Math.min(availabilityPercentage, 100),
                breakdown
            };

        } catch (error) {
            console.error('Error calculating calendar metrics:', error);
            return {
                totalEvents: 0,
                completedEvents: 0,
                cancelledEvents: 0,
                totalDuration: 0,
                availabilityPercentage: 0,
                breakdown: {
                    total: 0,
                    completed: 0,
                    cancelled: 0,
                    totalDuration: 0,
                    availabilityPercentage: 0
                }
            };
        }
    }

    /**
     * Calculate response time metrics
     */
    async calculateResponseMetrics(staffId, startDate, endDate) {
        try {
            // This would need to be implemented based on your specific response tracking
            // For now, returning placeholder metrics
            const breakdown = {
                averageResponseTime: 0, // in minutes
                responseRate: 0,
                totalResponses: 0
            };

            return {
                averageResponseTime: 0,
                responseRate: 0,
                totalResponses: 0,
                breakdown
            };

        } catch (error) {
            console.error('Error calculating response metrics:', error);
            return {
                averageResponseTime: 0,
                responseRate: 0,
                totalResponses: 0,
                breakdown: {
                    averageResponseTime: 0,
                    responseRate: 0,
                    totalResponses: 0
                }
            };
        }
    }

    /**
     * Calculate overall performance score
     */
    calculateOverallScore(metrics) {
        const weights = {
            taskCompletion: 0.3,
            leadManagement: 0.25,
            availability: 0.2,
            responseTime: 0.15,
            onTimeCompletion: 0.1
        };

        let score = 0;

        // Task completion score
        if (metrics.taskMetrics.totalTasks > 0) {
            score += (metrics.taskMetrics.completedTasks / metrics.taskMetrics.totalTasks) * weights.taskCompletion;
        }

        // Lead management score
        if (metrics.leadMetrics.totalLeads > 0) {
            score += (metrics.leadMetrics.managedLeads / metrics.leadMetrics.totalLeads) * weights.leadManagement;
        }

        // Availability score
        score += (metrics.calendarMetrics.availabilityPercentage / 100) * weights.availability;

        // Response time score (inverse - lower response time = higher score)
        const responseScore = Math.max(0, 1 - (metrics.responseMetrics.averageResponseTime / 1440)); // 1440 minutes = 24 hours
        score += responseScore * weights.responseTime;

        // On-time completion score
        if (metrics.taskMetrics.completedTasks > 0) {
            score += (metrics.taskMetrics.onTimeCompletion / metrics.taskMetrics.completedTasks) * weights.onTimeCompletion;
        }

        return Math.round(score * 100); // Convert to percentage
    }

    /**
     * Get performance comparison between staff members
     */
    async getStaffPerformanceComparison(coachId, options = {}) {
        try {
            const staff = await Staff.find({ coachId, isActive: true });
            const comparison = [];

            for (const member of staff) {
                const performance = await this.calculateStaffPerformance(member._id, options);
                comparison.push({
                    staffId: member._id,
                    staffName: member.name,
                    overallScore: performance.overallScore,
                    summary: performance.summary
                });
            }

            // Sort by overall score (descending)
            comparison.sort((a, b) => b.overallScore - a.overallScore);

            return comparison;

        } catch (error) {
            console.error('Error getting staff performance comparison:', error);
            throw error;
        }
    }

    /**
     * Get performance trends over time
     */
    async getPerformanceTrends(staffId, period = 'monthly', months = 6) {
        try {
            const trends = [];
            const now = new Date();

            for (let i = 0; i < months; i++) {
                const endDate = new Date(now.getFullYear(), now.getMonth() - i, 0);
                const startDate = new Date(now.getFullYear(), now.getMonth() - i - 1, 1);

                const performance = await this.calculateStaffPerformance(staffId, {
                    startDate,
                    endDate
                });

                trends.unshift({
                    period: `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`,
                    overallScore: performance.overallScore,
                    summary: performance.summary
                });
            }

            return trends;

        } catch (error) {
            console.error('Error getting performance trends:', error);
            throw error;
        }
    }
}

module.exports = new StaffPerformanceService();
