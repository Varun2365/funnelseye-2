const { Staff, Task, Lead, Coach } = require('../schema');

class StaffLeaderboardService {
    constructor() {
        this.scoringWeights = {
            taskCompletion: 0.35,    // 35% - Tasks completed on time
            qualityRating: 0.25,     // 25% - Client satisfaction scores
            efficiency: 0.20,        // 20% - Time taken vs estimated
            leadership: 0.15,        // 15% - Helping other team members
            innovation: 0.05         // 5% - Process improvements suggested
        };

        this.achievements = {
            TASK_MASTER: { name: "🏅 Task Master", description: "Complete 100 tasks successfully", threshold: 100 },
            SPEED_DEMON: { name: "⚡ Speed Demon", description: "Complete tasks 20% faster than average", threshold: 0.8 },
            QUALITY_CHAMPION: { name: "💎 Quality Champion", description: "Maintain 95%+ satisfaction rating", threshold: 0.95 },
            LEAD_CLOSER: { name: "🎯 Lead Closer", description: "Convert 80%+ of qualified leads", threshold: 0.8 },
            TEAM_PLAYER: { name: "🌟 Team Player", description: "Help 10+ team members with tasks", threshold: 10 },
            PROCESS_INNOVATOR: { name: "🚀 Process Innovator", description: "Suggest 5+ process improvements", threshold: 5 },
            CONSISTENCY_KING: { name: "👑 Consistency King", description: "Maintain top performance for 3 months", threshold: 90 },
            FAST_LEARNER: { name: "📚 Fast Learner", description: "Improve performance by 50% in 30 days", threshold: 0.5 }
        };

        this.rankingLevels = {
            ELITE: { name: "🥇 Elite Performer", minScore: 90, color: "#FFD700" },
            HIGH_ACHIEVER: { name: "🥈 High Achiever", minScore: 80, color: "#C0C0C0" },
            CONSISTENT: { name: "🥉 Consistent Performer", minScore: 70, color: "#CD7F32" },
            RISING_STAR: { name: "📈 Rising Star", minScore: 60, color: "#32CD32" },
            NEEDS_SUPPORT: { name: "🔄 Needs Support", minScore: 0, color: "#FF6B6B" }
        };
    }

    async calculateStaffScore(staffId, coachId, timeRange = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);

        // Convert coachId to ObjectId if it's a string
        const mongoose = require('mongoose');
        const coachObjectId = mongoose.Types.ObjectId.isValid(coachId) 
            ? (typeof coachId === 'string' ? new mongoose.Types.ObjectId(coachId) : coachId)
            : null;

        if (!coachObjectId) {
            throw new Error(`Invalid coachId: ${coachId}`);
        }

        // Get all tasks for this staff member
        const tasks = await Task.find({
            assignedTo: staffId,
            coachId: coachObjectId,
            createdAt: { $gte: startDate }
        });

        // Get leads handled by this staff member
        const leads = await Lead.find({
            assignedTo: staffId,
            coachId: coachObjectId,
            createdAt: { $gte: startDate }
        });

        // Calculate task completion score
        const completedTasks = tasks.filter(task => task.status === 'Completed');
        const onTimeTasks = completedTasks.filter(task => 
            task.completedAt && task.completedAt <= task.dueDate
        );
        const taskCompletionScore = completedTasks.length > 0 ? 
            (onTimeTasks.length / completedTasks.length) * 100 : 0;

        // Calculate quality rating (from task comments and lead feedback)
        const qualityScore = await this.calculateQualityScore(staffId, coachObjectId, startDate);

        // Calculate efficiency score
        const efficiencyScore = await this.calculateEfficiencyScore(tasks);

        // Calculate leadership score
        const leadershipScore = await this.calculateLeadershipScore(staffId, coachObjectId, startDate);

        // Calculate innovation score
        const innovationScore = await this.calculateInnovationScore(staffId, coachObjectId, startDate);

        // Calculate weighted total score
        const totalScore = (
            taskCompletionScore * this.scoringWeights.taskCompletion +
            qualityScore * this.scoringWeights.qualityRating +
            efficiencyScore * this.scoringWeights.efficiency +
            leadershipScore * this.scoringWeights.leadership +
            innovationScore * this.scoringWeights.innovation
        );

        return {
            staffId,
            scores: {
                taskCompletion: taskCompletionScore,
                qualityRating: qualityScore,
                efficiency: efficiencyScore,
                leadership: leadershipScore,
                innovation: innovationScore,
                total: Math.round(totalScore)
            },
            metrics: {
                tasksCompleted: completedTasks.length,
                tasksOnTime: onTimeTasks.length,
                totalTasks: tasks.length,
                leadsHandled: leads.length,
                leadsConverted: leads.filter(lead => lead.status === 'Converted').length
            }
        };
    }

    async calculateQualityScore(staffId, coachId, startDate) {
        // Convert coachId to ObjectId if it's a string
        const mongoose = require('mongoose');
        const coachObjectId = mongoose.Types.ObjectId.isValid(coachId) 
            ? (typeof coachId === 'string' ? new mongoose.Types.ObjectId(coachId) : coachId)
            : null;

        if (!coachObjectId) {
            throw new Error(`Invalid coachId: ${coachId}`);
        }

        // Calculate based on client feedback, task quality ratings, and lead conversion rates
        const tasks = await Task.find({
            assignedTo: staffId,
            coachId: coachObjectId,
            createdAt: { $gte: startDate }
        });

        const leads = await Lead.find({
            assignedTo: staffId,
            coachId: coachObjectId,
            createdAt: { $gte: startDate }
        });

        // Average task quality rating (if available)
        const taskRatings = tasks
            .filter(task => task.qualityRating)
            .map(task => task.qualityRating);
        
        const avgTaskRating = taskRatings.length > 0 ? 
            taskRatings.reduce((a, b) => a + b, 0) / taskRatings.length : 0;

        // Lead conversion rate
        const convertedLeads = leads.filter(lead => lead.status === 'Converted').length;
        const conversionRate = leads.length > 0 ? convertedLeads / leads.length : 0;

        // Client satisfaction (from lead feedback)
        const leadRatings = leads
            .filter(lead => lead.satisfactionRating)
            .map(lead => lead.satisfactionRating);
        
        const avgLeadRating = leadRatings.length > 0 ? 
            leadRatings.reduce((a, b) => a + b, 0) / leadRatings.length : 0;

        // Weighted quality score
        const qualityScore = (
            avgTaskRating * 0.4 +
            conversionRate * 100 * 0.4 +
            avgLeadRating * 0.2
        );

        return Math.min(100, Math.max(0, qualityScore));
    }

    async calculateEfficiencyScore(tasks) {
        if (tasks.length === 0) return 0;

        const completedTasks = tasks.filter(task => 
            task.status === 'Completed' && task.estimatedHours && task.actualHours
        );

        if (completedTasks.length === 0) return 0;

        // Calculate efficiency based on estimated vs actual time
        const efficiencyRatios = completedTasks.map(task => {
            if (task.actualHours <= task.estimatedHours) {
                return 100; // Completed on time or early
            } else {
                const ratio = task.estimatedHours / task.actualHours;
                return Math.max(0, ratio * 100); // Penalty for taking longer
            }
        });

        return efficiencyRatios.reduce((a, b) => a + b, 0) / efficiencyRatios.length;
    }

    async calculateLeadershipScore(staffId, coachId, startDate) {
        // Convert coachId to ObjectId if it's a string
        const mongoose = require('mongoose');
        const coachObjectId = mongoose.Types.ObjectId.isValid(coachId) 
            ? (typeof coachId === 'string' ? new mongoose.Types.ObjectId(coachId) : coachId)
            : null;

        if (!coachObjectId) {
            throw new Error(`Invalid coachId: ${coachId}`);
        }

        // Calculate based on helping other team members, mentoring, etc.
        const tasks = await Task.find({
            coachId: coachObjectId,
            createdAt: { $gte: startDate }
        });

        // Count tasks where this staff member helped others
        const helpingTasks = tasks.filter(task => 
            task.assignedTo.toString() !== staffId.toString() &&
            task.comments.some(comment => 
                comment.user.toString() === staffId.toString() &&
                comment.content.toLowerCase().includes('help') ||
                comment.content.toLowerCase().includes('assist')
            )
        );

        // Count mentoring activities
        const mentoringActivities = await this.getMentoringActivities(staffId, coachObjectId, startDate);

        const leadershipScore = Math.min(100, (helpingTasks.length * 5) + (mentoringActivities * 10));
        return leadershipScore;
    }

    async calculateInnovationScore(staffId, coachId, startDate) {
        // Convert coachId to ObjectId if it's a string
        const mongoose = require('mongoose');
        const coachObjectId = mongoose.Types.ObjectId.isValid(coachId) 
            ? (typeof coachId === 'string' ? new mongoose.Types.ObjectId(coachId) : coachId)
            : null;

        if (!coachObjectId) {
            throw new Error(`Invalid coachId: ${coachId}`);
        }

        // Calculate based on process improvements, suggestions, etc.
        const improvementSuggestions = await this.getImprovementSuggestions(staffId, coachObjectId, startDate);
        const processOptimizations = await this.getProcessOptimizations(staffId, coachObjectId, startDate);

        const innovationScore = Math.min(100, (improvementSuggestions * 15) + (processOptimizations * 10));
        return innovationScore;
    }

    async getLeaderboard(coachId, timeRange = 30, limit = 20) {
        const staff = await Staff.find({ coachId: coachId, isActive: true });
        const staffScores = [];

        for (const member of staff) {
            const score = await this.calculateStaffScore(member._id, coachId, timeRange);
            const achievements = await this.getStaffAchievements(member._id, coachId, timeRange);
            const rankingLevel = this.getRankingLevel(score.scores.total);

            staffScores.push({
                staffId: member._id,
                name: member.name,
                email: member.email,
                role: member.role,
                avatar: member.avatar,
                score: score.scores.total,
                rankingLevel: rankingLevel,
                achievements: achievements,
                metrics: score.metrics,
                detailedScores: score.scores
            });
        }

        // Sort by total score (descending)
        staffScores.sort((a, b) => b.score - a.score);

        // Add rank
        staffScores.forEach((staff, index) => {
            staff.rank = index + 1;
        });

        return staffScores.slice(0, limit);
    }

    async getStaffAchievements(staffId, coachId, timeRange = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);

        const tasks = await Task.find({
            assignedTo: staffId,
            coachId: coachId,
            createdAt: { $gte: startDate }
        });

        const leads = await Lead.find({
            assignedTo: staffId,
            coachId: coachId,
            createdAt: { $gte: startDate }
        });

        const achievements = [];

        // Check each achievement
        if (tasks.filter(t => t.status === 'Completed').length >= this.achievements.TASK_MASTER.threshold) {
            achievements.push(this.achievements.TASK_MASTER);
        }

        // Check efficiency achievement
        const avgEfficiency = await this.calculateEfficiencyScore(tasks);
        if (avgEfficiency >= 80) { // 20% faster than average
            achievements.push(this.achievements.SPEED_DEMON);
        }

        // Check quality achievement
        const qualityScore = await this.calculateQualityScore(staffId, coachId, startDate);
        if (qualityScore >= 95) {
            achievements.push(this.achievements.QUALITY_CHAMPION);
        }

        // Check lead conversion achievement
        const convertedLeads = leads.filter(lead => lead.status === 'Converted').length;
        const conversionRate = leads.length > 0 ? convertedLeads / leads.length : 0;
        if (conversionRate >= 0.8) {
            achievements.push(this.achievements.LEAD_CLOSER);
        }

        return achievements;
    }

    getRankingLevel(score) {
        for (const [level, config] of Object.entries(this.rankingLevels)) {
            if (score >= config.minScore) {
                return config;
            }
        }
        return this.rankingLevels.NEEDS_SUPPORT;
    }

    async getMentoringActivities(staffId, coachId, startDate) {
        // Implementation for tracking mentoring activities
        // This could be based on task comments, training sessions, etc.
        return Math.floor(Math.random() * 5); // Placeholder
    }

    async getImprovementSuggestions(staffId, coachId, startDate) {
        // Implementation for tracking improvement suggestions
        // This could be based on feedback forms, process improvement submissions, etc.
        return Math.floor(Math.random() * 3); // Placeholder
    }

    async getProcessOptimizations(staffId, coachId, startDate) {
        // Implementation for tracking process optimizations
        // This could be based on workflow improvements, automation suggestions, etc.
        return Math.floor(Math.random() * 2); // Placeholder
    }

    async getStaffProgress(staffId, coachId, days = 30) {
        const progressData = [];
        
        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            const score = await this.calculateStaffScore(staffId, coachId, i);
            progressData.push({
                date: date.toISOString().split('T')[0],
                score: score.scores.total
            });
        }

        return progressData;
    }

    async getTeamAnalytics(coachId, timeRange = 30) {
        const leaderboard = await this.getLeaderboard(coachId, timeRange);
        
        const totalStaff = leaderboard.length;
        const avgScore = leaderboard.reduce((sum, staff) => sum + staff.score, 0) / totalStaff;
        
        const levelDistribution = {};
        leaderboard.forEach(staff => {
            const level = staff.rankingLevel.name;
            levelDistribution[level] = (levelDistribution[level] || 0) + 1;
        });

        return {
            totalStaff,
            averageScore: Math.round(avgScore),
            levelDistribution,
            topPerformer: leaderboard[0],
            mostImproved: await this.getMostImprovedStaff(coachId, timeRange)
        };
    }

    async getMostImprovedStaff(coachId, timeRange = 30) {
        // Compare current performance with previous period
        const currentScores = await this.getLeaderboard(coachId, timeRange);
        const previousScores = await this.getLeaderboard(coachId, timeRange * 2);
        
        let mostImproved = null;
        let maxImprovement = 0;

        for (const current of currentScores) {
            const previous = previousScores.find(p => p.staffId.toString() === current.staffId.toString());
            if (previous) {
                const improvement = current.score - previous.score;
                if (improvement > maxImprovement) {
                    maxImprovement = improvement;
                    mostImproved = {
                        staffId: current.staffId,
                        name: current.name,
                        improvement: improvement,
                        currentScore: current.score,
                        previousScore: previous.score
                    };
                }
            }
        }

        return mostImproved;
    }
}

module.exports = new StaffLeaderboardService();
