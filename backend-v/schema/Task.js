// D:\PRJ_YCT_Final\schema\Task.js

const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Task name is required.']
    },
    description: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed', 'Overdue', 'Cancelled', 'Paused'],
        default: 'Pending'
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
        default: 'MEDIUM'
    },
    stage: {
        type: String,
        enum: ['LEAD_GENERATION', 'LEAD_QUALIFICATION', 'PROPOSAL', 'CLOSING', 'ONBOARDING'],
        default: 'LEAD_GENERATION'
    },
    dueDate: {
        type: Date,
        required: [true, 'Task due date is required.']
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'A task must be assigned to a coach or staff member.']
    },
    relatedLead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        required: [true, 'A task must be related to a lead.']
    },
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'A task must belong to a coach.']
    },
    estimatedHours: {
        type: Number,
        default: 1
    },
    actualHours: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String
    }],
    attachments: [{
        filename: String,
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        content: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    dependencies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    subtasks: [{
        name: String,
        description: String,
        completed: {
            type: Boolean,
            default: false
        },
        dueDate: Date
    }],
    timeLogs: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        startTime: Date,
        endTime: Date,
        duration: Number, // in minutes
        description: String
    }],
    reminders: [{
        time: Date,
        type: {
            type: String,
            enum: ['email', 'push'],
            default: 'email'
        },
        sent: {
            type: Boolean,
            default: false
        }
    }],
    automationRules: [{
        trigger: {
            type: String,
            enum: ['status_change', 'due_date_approaching', 'completion', 'assignment']
        },
        action: {
            type: String,
            enum: ['create_task', 'send_notification', 'update_lead', 'send_email']
        },
        config: mongoose.Schema.Types.Mixed
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    },
    // Staff-specific fields for task completion
    startedAt: {
        type: Date
    },
    pausedAt: {
        type: Date
    },
    totalPauseTime: {
        type: Number, // in minutes
        default: 0
    },
    completionNotes: {
        type: String
    },
    outcome: {
        type: String,
        enum: ['SUCCESS', 'PARTIAL_SUCCESS', 'FAILED', 'CANCELLED'],
        default: 'SUCCESS'
    },
    qualityRating: {
        type: Number,
        min: 1,
        max: 5
    },
    feedback: {
        type: String
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    timeSpent: {
        type: Number, // in minutes
        default: 0
    },
    efficiency: {
        type: Number, // percentage
        min: 0,
        max: 100
    }
});

// Indexes for better query performance
TaskSchema.index({ coachId: 1, status: 1 });
TaskSchema.index({ assignedTo: 1, dueDate: 1 });
TaskSchema.index({ coachId: 1, stage: 1 });
TaskSchema.index({ dueDate: 1, status: 1 });

// Pre-save middleware to update updatedAt
TaskSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    
    // Set completedAt when status changes to Completed
    if (this.isModified('status') && this.status === 'Completed' && !this.completedAt) {
        this.completedAt = new Date();
    }
    
    next();
});

// Virtual for task progress (based on subtasks)
TaskSchema.virtual('progress').get(function() {
    if (!this.subtasks || this.subtasks.length === 0) {
        return this.status === 'Completed' ? 100 : 0;
    }
    
    const completedSubtasks = this.subtasks.filter(subtask => subtask.completed).length;
    return Math.round((completedSubtasks / this.subtasks.length) * 100);
});

// Virtual for overdue status
TaskSchema.virtual('isOverdue').get(function() {
    return this.dueDate < new Date() && this.status !== 'Completed';
});

// Instance method to add comment
TaskSchema.methods.addComment = function(userId, content) {
    this.comments.push({
        user: userId,
        content: content
    });
    return this.save();
};

// Instance method to log time
TaskSchema.methods.logTime = function(userId, startTime, endTime, description) {
    const duration = Math.round((endTime - startTime) / (1000 * 60)); // Convert to minutes
    
    this.timeLogs.push({
        user: userId,
        startTime: startTime,
        endTime: endTime,
        duration: duration,
        description: description
    });
    
    this.actualHours = this.timeLogs.reduce((total, log) => total + (log.duration / 60), 0);
    
    return this.save();
};

// Instance method to add subtask
TaskSchema.methods.addSubtask = function(name, description, dueDate) {
    this.subtasks.push({
        name: name,
        description: description,
        dueDate: dueDate
    });
    return this.save();
};

// Static method to get overdue tasks
TaskSchema.statics.getOverdueTasks = function(coachId) {
    return this.find({
        coachId: coachId,
        dueDate: { $lt: new Date() },
        status: { $ne: 'Completed' }
    }).populate('assignedTo', 'name email');
};

// Static method to get tasks by stage
TaskSchema.statics.getTasksByStage = function(coachId, stage) {
    return this.find({
        coachId: coachId,
        stage: stage
    }).populate('assignedTo', 'name email')
      .populate('relatedLead', 'name email phone');
};

// Static method to get task analytics
TaskSchema.statics.getAnalytics = function(coachId, startDate, endDate) {
    const matchStage = {
        coachId: coachId,
        createdAt: {
            $gte: startDate,
            $lte: endDate
        }
    };

    return this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                avgCompletionTime: {
                    $avg: {
                        $cond: [
                            { $eq: ['$status', 'Completed'] },
                            { $subtract: ['$completedAt', '$createdAt'] },
                            null
                        ]
                    }
                }
            }
        }
    ]);
};

module.exports = mongoose.model('Task', TaskSchema);