const mongoose = require('mongoose');

const NurturingStepSchema = new mongoose.Schema({
    stepNumber: {
        type: Number,
        required: true,
        min: 1
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    actionType: {
        type: String,
        required: true,
        enum: [
            'send_whatsapp_message',
            'send_email',
            'create_task',
            'update_lead_score',
            'add_lead_tag',
            'schedule_appointment',
            'send_notification',
            'wait_delay'
        ]
    },
    actionConfig: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    delayDays: {
        type: Number,
        default: 0,
        min: 0
    },
    delayHours: {
        type: Number,
        default: 0,
        min: 0
    },
    conditions: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { _id: true });

const NurturingSequenceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        enum: ['warm_lead', 'cold_lead', 'objection_handling', 'follow_up', 'reactivation', 'custom'],
        default: 'custom'
    },
    steps: [NurturingStepSchema],
    assignedFunnels: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Funnel'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    triggerConditions: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    settings: {
        maxRetries: {
            type: Number,
            default: 3,
            min: 1
        },
        retryDelayDays: {
            type: Number,
            default: 2,
            min: 1
        },
        stopOnConversion: {
            type: Boolean,
            default: true
        },
        allowManualAdvance: {
            type: Boolean,
            default: true
        }
    },
    stats: {
        totalLeads: {
            type: Number,
            default: 0
        },
        activeLeads: {
            type: Number,
            default: 0
        },
        completedLeads: {
            type: Number,
            default: 0
        },
        conversionRate: {
            type: Number,
            default: 0
        },
        averageCompletionTime: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Indexes for better performance
NurturingSequenceSchema.index({ coachId: 1, isActive: 1 });
NurturingSequenceSchema.index({ assignedFunnels: 1 });
NurturingSequenceSchema.index({ category: 1 });

// Virtual for total steps
NurturingSequenceSchema.virtual('totalSteps').get(function() {
    return this.steps.filter(step => step.isActive).length;
});

// Method to assign to funnel
NurturingSequenceSchema.methods.assignToFunnel = function(funnelId) {
    if (!this.assignedFunnels.includes(funnelId)) {
        this.assignedFunnels.push(funnelId);
        return this.save();
    }
    return Promise.resolve(this);
};

// Method to remove from funnel
NurturingSequenceSchema.methods.removeFromFunnel = function(funnelId) {
    this.assignedFunnels = this.assignedFunnels.filter(id => !id.equals(funnelId));
    return this.save();
};

// Method to duplicate sequence
NurturingSequenceSchema.methods.duplicate = function(newName) {
    const duplicate = new this.constructor({
        name: newName || `${this.name} (Copy)`,
        description: this.description,
        coachId: this.coachId,
        category: this.category,
        steps: this.steps,
        triggerConditions: this.triggerConditions,
        settings: this.settings,
        isDefault: false
    });
    return duplicate.save();
};

// Method to update stats
NurturingSequenceSchema.methods.updateStats = async function() {
    const Lead = require('./Lead');
    
    const stats = await Lead.aggregate([
        { $match: { nurturingSequence: this._id } },
        {
            $group: {
                _id: null,
                totalLeads: { $sum: 1 },
                activeLeads: {
                    $sum: {
                        $cond: [
                            { $and: [
                                { $ne: ['$nurturingSequence', null] },
                                { $lt: ['$nurturingStepIndex', { $size: '$nurturingSequence.steps' }] }
                            ]},
                            1,
                            0
                        ]
                    }
                },
                completedLeads: {
                    $sum: {
                        $cond: [
                            { $gte: ['$nurturingStepIndex', { $size: '$nurturingSequence.steps' }] },
                            1,
                            0
                        ]
                    }
                }
            }
        }
    ]);

    if (stats.length > 0) {
        this.stats.totalLeads = stats[0].totalLeads;
        this.stats.activeLeads = stats[0].activeLeads;
        this.stats.completedLeads = stats[0].completedLeads;
        this.stats.conversionRate = stats[0].totalLeads > 0 ? 
            (stats[0].completedLeads / stats[0].totalLeads) * 100 : 0;
        
        await this.save();
    }
};

const NurturingSequence = mongoose.models.NurturingSequence || mongoose.model('NurturingSequence', NurturingSequenceSchema);

module.exports = NurturingSequence;
