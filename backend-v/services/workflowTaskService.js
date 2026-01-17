// D:\PRJ_YCT_Final\services/workflowTaskService.js

const { Task, Lead, Coach, Staff } = require('../schema');
const OpenAI = require('openai');
const { scheduleFutureEvent } = require('./automationSchedulerService');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

class WorkflowTaskService {
    constructor() {
        this.workflowStages = {
            'LEAD_GENERATION': {
                name: 'Lead Generation',
                color: '#3498db',
                tasks: ['Research Prospects', 'Create Content', 'Run Ads', 'Follow Up']
            },
            'LEAD_QUALIFICATION': {
                name: 'Lead Qualification',
                color: '#f39c12',
                tasks: ['Initial Contact', 'Needs Assessment', 'Budget Discussion', 'Decision Maker ID']
            },
            'PROPOSAL': {
                name: 'Proposal',
                color: '#e74c3c',
                tasks: ['Create Proposal', 'Present Solution', 'Handle Objections', 'Negotiate Terms']
            },
            'CLOSING': {
                name: 'Closing',
                color: '#27ae60',
                tasks: ['Final Agreement', 'Contract Signing', 'Payment Processing', 'Onboarding Setup']
            },
            'ONBOARDING': {
                name: 'Onboarding',
                color: '#9b59b6',
                tasks: ['Welcome Call', 'Goal Setting', 'Program Setup', 'First Session']
            }
        };

        this.taskPriorities = {
            'LOW': { value: 1, color: '#95a5a6', label: 'Low' },
            'MEDIUM': { value: 2, color: '#f39c12', label: 'Medium' },
            'HIGH': { value: 3, color: '#e74c3c', label: 'High' },
            'URGENT': { value: 4, color: '#c0392b', label: 'Urgent' }
        };
    }

    /**
     * Create a new task with intelligent assignment
     */
    async createTask(taskData) {
        try {
            const { name, description, dueDate, relatedLead, coachId, priority = 'MEDIUM', stage = 'LEAD_GENERATION' } = taskData;

            // Intelligent task assignment based on workload and skills
            const assignedTo = await this.intelligentTaskAssignment(coachId, taskData);

            const task = await Task.create({
                name,
                description,
                status: 'Pending',
                dueDate: new Date(dueDate),
                assignedTo,
                relatedLead,
                priority,
                stage,
                coachId,
                createdAt: new Date()
            });

            // Schedule reminder for task
            await this.scheduleTaskReminder(task);

            console.log(`[WorkflowTaskService] Created task: ${name} assigned to ${assignedTo}`);
            return task;
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    }

    /**
     * Intelligent task assignment based on workload and skills
     */
    async intelligentTaskAssignment(coachId, taskData) {
        try {
            // Get all staff members for the coach
            const staffMembers = await Staff.find({ coachId, isActive: true });
            
            if (staffMembers.length === 0) {
                return coachId; // Assign to coach if no staff
            }

            // Calculate workload for each staff member
            const workloadData = await Promise.all(
                staffMembers.map(async (staff) => {
                    const pendingTasks = await Task.countDocuments({
                        assignedTo: staff._id,
                        status: { $in: ['Pending', 'In Progress'] }
                    });

                    const overdueTasks = await Task.countDocuments({
                        assignedTo: staff._id,
                        status: 'Overdue'
                    });

                    const workloadScore = pendingTasks + (overdueTasks * 2); // Overdue tasks count double

                    return {
                        staffId: staff._id,
                        name: staff.name,
                        workloadScore,
                        permissions: staff.permissions,
                        skills: staff.skills || []
                    };
                })
            );

            // Sort by workload (lowest first)
            workloadData.sort((a, b) => a.workloadScore - b.workloadScore);

            // Find staff with appropriate permissions and skills
            const suitableStaff = workloadData.find(staff => {
                const hasPermission = staff.permissions.includes('tasks:manage') || 
                                    staff.permissions.includes('leads:manage') ||
                                    staff.permissions.includes('tasks:assign');
                const hasSkills = this.checkTaskSkills(staff.skills, taskData);
                return hasPermission && hasSkills;
            });

            return suitableStaff ? suitableStaff.staffId : workloadData[0].staffId;
        } catch (error) {
            console.error('Error in intelligent task assignment:', error);
            return coachId; // Fallback to coach
        }
    }

    /**
     * Check if staff has required skills for the task
     */
    checkTaskSkills(staffSkills, taskData) {
        if (!staffSkills || staffSkills.length === 0) return true;

        const taskSkills = this.extractTaskSkills(taskData);
        return taskSkills.some(skill => staffSkills.includes(skill));
    }

    /**
     * Extract required skills from task data
     */
    extractTaskSkills(taskData) {
        const skills = [];
        const taskName = taskData.name.toLowerCase();
        const description = taskData.description?.toLowerCase() || '';

        if (taskName.includes('content') || description.includes('content')) {
            skills.push('content_creation');
        }
        if (taskName.includes('ads') || description.includes('ads')) {
            skills.push('advertising');
        }
        if (taskName.includes('proposal') || description.includes('proposal')) {
            skills.push('sales');
        }
        if (taskName.includes('follow') || description.includes('follow')) {
            skills.push('communication');
        }

        return skills;
    }

    /**
     * Schedule task reminder
     */
    async scheduleTaskReminder(task) {
        try {
            const reminderTime = new Date(task.dueDate);
            reminderTime.setHours(reminderTime.getHours() - 24); // 24 hours before due date

            if (reminderTime > new Date()) {
                await scheduleFutureEvent(
                    reminderTime,
                    'task_reminders',
                    'task_due_soon',
                    {
                        taskId: task._id,
                        taskName: task.name,
                        assignedTo: task.assignedTo,
                        dueDate: task.dueDate
                    }
                );
            }
        } catch (error) {
            console.error('Error scheduling task reminder:', error);
        }
    }

    /**
     * Get Kanban board data for a coach
     */
    async getKanbanBoard(coachId) {
        try {
            console.log(`[WorkflowTaskService] getKanbanBoard - Coach ID: ${coachId}`);
            
            const tasks = await Task.find({ coachId })
                .populate('assignedTo', 'name email')
                .populate('relatedLead', 'name email phone status')
                .sort('dueDate');

            console.log(`[WorkflowTaskService] getKanbanBoard - Found ${tasks.length} tasks for coach ${coachId}`);

            const boardData = {};

            // Initialize stages
            Object.keys(this.workflowStages).forEach(stage => {
                boardData[stage] = {
                    ...this.workflowStages[stage],
                    tasks: []
                };
            });

            // Group tasks by stage
            tasks.forEach(task => {
                const stage = task.stage || 'LEAD_GENERATION';
                if (boardData[stage]) {
                    boardData[stage].tasks.push(task);
                }
            });

            return boardData;
        } catch (error) {
            console.error('Error getting Kanban board:', error);
            throw error;
        }
    }

    /**
     * Move task between stages (Kanban drag & drop)
     */
    async moveTask(taskId, newStage, coachId) {
        try {
            const task = await Task.findOne({ _id: taskId, coachId });
            if (!task) {
                throw new Error('Task not found');
            }

            task.stage = newStage;
            task.updatedAt = new Date();

            // Auto-update status based on stage
            if (newStage === 'CLOSING') {
                task.status = 'In Progress';
            } else if (newStage === 'ONBOARDING') {
                task.status = 'Completed';
            }

            await task.save();

            // Trigger stage-specific automations
            await this.triggerStageAutomations(task, newStage);

            return task;
        } catch (error) {
            console.error('Error moving task:', error);
            throw error;
        }
    }

    /**
     * Trigger automations based on stage changes
     */
    async triggerStageAutomations(task, newStage) {
        try {
            switch (newStage) {
                case 'LEAD_QUALIFICATION':
                    await this.createFollowUpTask(task);
                    break;
                case 'PROPOSAL':
                    await this.createProposalTask(task);
                    break;
                case 'CLOSING':
                    await this.createContractTask(task);
                    break;
                case 'ONBOARDING':
                    await this.createOnboardingTasks(task);
                    break;
            }
        } catch (error) {
            console.error('Error triggering stage automations:', error);
        }
    }

    /**
     * Create follow-up task when lead moves to qualification
     */
    async createFollowUpTask(originalTask) {
        const followUpTask = await this.createTask({
            name: `Follow Up: ${originalTask.name}`,
            description: 'Schedule follow-up call or meeting with the prospect',
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
            relatedLead: originalTask.relatedLead,
            coachId: originalTask.coachId,
            priority: 'HIGH',
            stage: 'LEAD_QUALIFICATION'
        });

        return followUpTask;
    }

    /**
     * Create proposal task
     */
    async createProposalTask(originalTask) {
        const proposalTask = await this.createTask({
            name: `Create Proposal: ${originalTask.name}`,
            description: 'Create and send personalized proposal to the prospect',
            dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
            relatedLead: originalTask.relatedLead,
            coachId: originalTask.coachId,
            priority: 'HIGH',
            stage: 'PROPOSAL'
        });

        return proposalTask;
    }

    /**
     * Create contract task
     */
    async createContractTask(originalTask) {
        const contractTask = await this.createTask({
            name: `Prepare Contract: ${originalTask.name}`,
            description: 'Prepare and send contract for signature',
            dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
            relatedLead: originalTask.relatedLead,
            coachId: originalTask.coachId,
            priority: 'URGENT',
            stage: 'CLOSING'
        });

        return contractTask;
    }

    /**
     * Create onboarding tasks
     */
    async createOnboardingTasks(originalTask) {
        const onboardingTasks = [
            {
                name: `Welcome Call: ${originalTask.name}`,
                description: 'Conduct welcome call and goal setting session',
                dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
                priority: 'HIGH'
            },
            {
                name: `Program Setup: ${originalTask.name}`,
                description: 'Set up client program and initial assessment',
                dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                priority: 'MEDIUM'
            },
            {
                name: `First Session: ${originalTask.name}`,
                description: 'Conduct first coaching session',
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                priority: 'HIGH'
            }
        ];

        const createdTasks = [];
        for (const taskData of onboardingTasks) {
            const task = await this.createTask({
                ...taskData,
                relatedLead: originalTask.relatedLead,
                coachId: originalTask.coachId,
                stage: 'ONBOARDING'
            });
            createdTasks.push(task);
        }

        return createdTasks;
    }

    /**
     * AI SOP Agent - Generate standard operating procedures
     */
    async generateSOP(taskType, context) {
        try {
            const prompt = `
                Generate a standard operating procedure (SOP) for a fitness coach's ${taskType} task.
                
                Context: ${context}
                
                Provide:
                1. Step-by-step procedure (5-10 steps)
                2. Required tools/resources
                3. Quality checkpoints
                4. Common mistakes to avoid
                5. Success metrics
                
                Make it practical and actionable for a fitness coach.
            `;

            const completion = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 600
            });

            return this.parseSOP(completion.choices[0].message.content);
        } catch (error) {
            console.error('Error generating SOP:', error);
            throw new Error('Failed to generate SOP');
        }
    }

    /**
     * Parse SOP content into structured format
     */
    parseSOP(content) {
        const sop = {
            steps: [],
            tools: [],
            checkpoints: [],
            mistakes: [],
            metrics: []
        };

        const lines = content.split('\n');
        let currentSection = '';

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            if (trimmedLine.includes('Step-by-step') || trimmedLine.includes('Procedure:')) {
                currentSection = 'steps';
            } else if (trimmedLine.includes('Required tools') || trimmedLine.includes('Tools:')) {
                currentSection = 'tools';
            } else if (trimmedLine.includes('Quality checkpoints') || trimmedLine.includes('Checkpoints:')) {
                currentSection = 'checkpoints';
            } else if (trimmedLine.includes('Common mistakes') || trimmedLine.includes('Mistakes:')) {
                currentSection = 'mistakes';
            } else if (trimmedLine.includes('Success metrics') || trimmedLine.includes('Metrics:')) {
                currentSection = 'metrics';
            } else if (trimmedLine.match(/^\d+\./)) {
                const item = trimmedLine.replace(/^\d+\.\s*/, '');
                if (currentSection && sop[currentSection]) {
                    sop[currentSection].push(item);
                }
            }
        }

        return sop;
    }

    /**
     * Get task analytics and performance metrics
     */
    async getTaskAnalytics(coachId, dateRange = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - dateRange);

            const tasks = await Task.find({
                coachId,
                createdAt: { $gte: startDate }
            }).populate('assignedTo', 'name');

            const analytics = {
                totalTasks: tasks.length,
                completedTasks: tasks.filter(t => t.status === 'Completed').length,
                overdueTasks: tasks.filter(t => t.status === 'Overdue').length,
                pendingTasks: tasks.filter(t => t.status === 'Pending').length,
                inProgressTasks: tasks.filter(t => t.status === 'In Progress').length,
                completionRate: 0,
                averageCompletionTime: 0,
                stageDistribution: {},
                priorityDistribution: {},
                staffPerformance: {}
            };

            // Calculate completion rate
            if (analytics.totalTasks > 0) {
                analytics.completionRate = (analytics.completedTasks / analytics.totalTasks) * 100;
            }

            // Calculate average completion time
            const completedTasks = tasks.filter(t => t.status === 'Completed' && t.updatedAt);
            if (completedTasks.length > 0) {
                const totalTime = completedTasks.reduce((sum, task) => {
                    return sum + (task.updatedAt - task.createdAt);
                }, 0);
                analytics.averageCompletionTime = totalTime / completedTasks.length / (1000 * 60 * 60); // in hours
            }

            // Stage distribution
            tasks.forEach(task => {
                const stage = task.stage || 'LEAD_GENERATION';
                analytics.stageDistribution[stage] = (analytics.stageDistribution[stage] || 0) + 1;
            });

            // Priority distribution
            tasks.forEach(task => {
                const priority = task.priority || 'MEDIUM';
                analytics.priorityDistribution[priority] = (analytics.priorityDistribution[priority] || 0) + 1;
            });

            // Staff performance
            tasks.forEach(task => {
                const staffId = task.assignedTo?._id?.toString() || 'unassigned';
                const staffName = task.assignedTo?.name || 'Unassigned';
                
                if (!analytics.staffPerformance[staffId]) {
                    analytics.staffPerformance[staffId] = {
                        name: staffName,
                        totalTasks: 0,
                        completedTasks: 0,
                        overdueTasks: 0
                    };
                }

                analytics.staffPerformance[staffId].totalTasks++;
                if (task.status === 'Completed') {
                    analytics.staffPerformance[staffId].completedTasks++;
                } else if (task.status === 'Overdue') {
                    analytics.staffPerformance[staffId].overdueTasks++;
                }
            });

            return analytics;
        } catch (error) {
            console.error('Error getting task analytics:', error);
            throw error;
        }
    }

    /**
     * Auto-assign tasks based on workload and skills
     */
    async autoAssignTasks(coachId) {
        try {
            const unassignedTasks = await Task.find({
                coachId,
                assignedTo: null,
                status: { $in: ['Pending', 'In Progress'] }
            });

            const assignments = [];

            for (const task of unassignedTasks) {
                const assignedTo = await this.intelligentTaskAssignment(coachId, {
                    name: task.name,
                    description: task.description,
                    priority: task.priority,
                    stage: task.stage
                });

                task.assignedTo = assignedTo;
                await task.save();

                assignments.push({
                    taskId: task._id,
                    taskName: task.name,
                    assignedTo
                });
            }

            return {
                success: true,
                message: `Auto-assigned ${assignments.length} tasks`,
                assignments
            };
        } catch (error) {
            console.error('Error auto-assigning tasks:', error);
            throw error;
        }
    }

    /**
     * Get upcoming tasks and deadlines
     */
    async getUpcomingTasks(coachId, days = 7) {
        try {
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + days);

            const tasks = await Task.find({
                coachId,
                dueDate: { $lte: endDate },
                status: { $in: ['Pending', 'In Progress'] }
            })
            .populate('assignedTo', 'name email')
            .populate('relatedLead', 'name email phone')
            .sort('dueDate');

            return tasks;
        } catch (error) {
            console.error('Error getting upcoming tasks:', error);
            throw error;
        }
    }

    /**
     * Bulk update task status
     */
    async bulkUpdateTaskStatus(taskIds, newStatus, coachId) {
        try {
            const result = await Task.updateMany(
                {
                    _id: { $in: taskIds },
                    coachId
                },
                {
                    status: newStatus,
                    updatedAt: new Date()
                }
            );

            return {
                success: true,
                message: `Updated ${result.modifiedCount} tasks to ${newStatus}`,
                modifiedCount: result.modifiedCount
            };
        } catch (error) {
            console.error('Error bulk updating task status:', error);
            throw error;
        }
    }
}

module.exports = new WorkflowTaskService();
