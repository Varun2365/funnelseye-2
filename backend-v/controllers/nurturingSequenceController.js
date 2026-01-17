const NurturingSequence = require('../schema/NurturingSequence');
const Funnel = require('../schema/Funnel');
const Lead = require('../schema/Lead');
const asyncHandler = require('../middleware/async');
const { publishEvent } = require('../services/rabbitmqProducer');

// Create a new nurturing sequence
exports.createSequence = asyncHandler(async (req, res) => {
    const { name, description, category, steps, triggers, triggerConditions, settings } = req.body;
    const coachId = req.coachId;

    // Validate that we have at least one trigger and one action/step
    const hasTriggers = (triggers && Array.isArray(triggers) && triggers.length > 0) || 
                        (triggerConditions && Object.keys(triggerConditions).length > 0);
    const hasSteps = steps && Array.isArray(steps) && steps.length > 0;

    if (!hasTriggers) {
        return res.status(400).json({
            success: false,
            message: 'At least one trigger is required'
        });
    }

    if (!hasSteps) {
        return res.status(400).json({
            success: false,
            message: 'At least one action/step is required'
        });
    }

    // Validate step numbers are sequential (if steps exist)
    if (hasSteps) {
        const stepNumbers = steps.map(step => step.stepNumber).sort((a, b) => a - b);
        for (let i = 0; i < stepNumbers.length; i++) {
            if (stepNumbers[i] !== i + 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Step numbers must be sequential starting from 1'
                });
            }
        }
    }

    // Merge triggers into triggerConditions if provided
    let finalTriggerConditions = triggerConditions || {};
    if (triggers && Array.isArray(triggers) && triggers.length > 0) {
        // Store triggers in triggerConditions for backward compatibility
        finalTriggerConditions = {
            ...finalTriggerConditions,
            triggers: triggers // Store array of triggers
        };
    }

    const sequence = await NurturingSequence.create({
        name,
        description,
        category,
        steps: steps || [],
        triggerConditions: finalTriggerConditions,
        settings,
        coachId
    });

    res.status(201).json({
        success: true,
        message: 'Nurturing sequence created successfully',
        data: sequence
    });
});

// Get all nurturing sequences for a coach
exports.getSequences = asyncHandler(async (req, res) => {
    const coachId = req.coachId;
    const { category, isActive, funnelId } = req.query;

    let query = { coachId };

    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (funnelId) query.assignedFunnels = funnelId;

    const sequences = await NurturingSequence.find(query)
        .populate('assignedFunnels', 'name description')
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        data: sequences
    });
});

// Get a single nurturing sequence
exports.getSequence = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const coachId = req.coachId;

    const sequence = await NurturingSequence.findOne({ _id: id, coachId })
        .populate('assignedFunnels', 'name description');

    if (!sequence) {
        return res.status(404).json({
            success: false,
            message: 'Nurturing sequence not found'
        });
    }

    res.json({
        success: true,
        data: sequence
    });
});

// Update a nurturing sequence
exports.updateSequence = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const coachId = req.coachId;
    const { triggers, triggerConditions, steps, ...updateData } = req.body;

    // Validate that we have at least one trigger and one action/step if updating
    if (triggers !== undefined || triggerConditions !== undefined || steps !== undefined) {
        const hasTriggers = (triggers && Array.isArray(triggers) && triggers.length > 0) || 
                            (triggerConditions && Object.keys(triggerConditions).length > 0) ||
                            (updateData.triggerConditions && Object.keys(updateData.triggerConditions).length > 0);
        const hasSteps = (steps && Array.isArray(steps) && steps.length > 0) ||
                         (updateData.steps && Array.isArray(updateData.steps) && updateData.steps.length > 0);

        // Get existing sequence to check current state
        const existingSequence = await NurturingSequence.findOne({ _id: id, coachId });
        if (!existingSequence) {
            return res.status(404).json({
                success: false,
                message: 'Nurturing sequence not found'
            });
        }

        // Check final state after update
        const finalHasTriggers = hasTriggers || 
                                 (existingSequence.triggerConditions && 
                                  (existingSequence.triggerConditions.triggers?.length > 0 || 
                                   Object.keys(existingSequence.triggerConditions).some(k => k !== 'triggers')));
        const finalHasSteps = hasSteps || (existingSequence.steps && existingSequence.steps.length > 0);

        if (!finalHasTriggers) {
            return res.status(400).json({
                success: false,
                message: 'At least one trigger is required'
            });
        }

        if (!finalHasSteps) {
            return res.status(400).json({
                success: false,
                message: 'At least one action/step is required'
            });
        }

        // Validate step numbers are sequential (if steps are being updated)
        if (steps && Array.isArray(steps) && steps.length > 0) {
            const stepNumbers = steps.map(step => step.stepNumber).sort((a, b) => a - b);
            for (let i = 0; i < stepNumbers.length; i++) {
                if (stepNumbers[i] !== i + 1) {
                    return res.status(400).json({
                        success: false,
                        message: 'Step numbers must be sequential starting from 1'
                    });
                }
            }
        }

        // Merge triggers into triggerConditions if provided
        if (triggers && Array.isArray(triggers) && triggers.length > 0) {
            updateData.triggerConditions = {
                ...(triggerConditions || existingSequence.triggerConditions || {}),
                triggers: triggers
            };
        } else if (triggerConditions) {
            updateData.triggerConditions = triggerConditions;
        }

        if (steps) {
            updateData.steps = steps;
        }
    }

    // Remove fields that shouldn't be updated
    delete updateData.coachId;
    delete updateData.stats;
    delete updateData.assignedFunnels;

    const sequence = await NurturingSequence.findOneAndUpdate(
        { _id: id, coachId },
        updateData,
        { new: true, runValidators: true }
    );

    if (!sequence) {
        return res.status(404).json({
            success: false,
            message: 'Nurturing sequence not found'
        });
    }

    res.json({
        success: true,
        message: 'Nurturing sequence updated successfully',
        data: sequence
    });
});

// Delete a nurturing sequence
exports.deleteSequence = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const coachId = req.coachId;

    // Check if sequence is assigned to any funnels
    const sequence = await NurturingSequence.findOne({ _id: id, coachId });
    if (!sequence) {
        return res.status(404).json({
            success: false,
            message: 'Nurturing sequence not found'
        });
    }

    if (sequence.assignedFunnels.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Cannot delete sequence that is assigned to funnels. Remove assignments first.'
        });
    }

    // Check if any leads are currently using this sequence
    const activeLeads = await Lead.countDocuments({ nurturingSequence: id });
    if (activeLeads > 0) {
        return res.status(400).json({
            success: false,
            message: `Cannot delete sequence. ${activeLeads} leads are currently using it.`
        });
    }

    await NurturingSequence.findByIdAndDelete(id);

    res.json({
        success: true,
        message: 'Nurturing sequence deleted successfully'
    });
});

// Assign sequence to funnel
exports.assignToFunnel = asyncHandler(async (req, res) => {
    const { sequenceId, funnelId } = req.body;
    const coachId = req.coachId;

    // Verify sequence exists and belongs to coach
    const sequence = await NurturingSequence.findOne({ _id: sequenceId, coachId });
    if (!sequence) {
        return res.status(404).json({
            success: false,
            message: 'Nurturing sequence not found'
        });
    }

    // Verify funnel exists and belongs to coach
    const funnel = await Funnel.findOne({ _id: funnelId, coachId });
    if (!funnel) {
        return res.status(404).json({
            success: false,
            message: 'Funnel not found'
        });
    }

    // Check if already assigned
    if (sequence.assignedFunnels.includes(funnelId)) {
        return res.status(400).json({
            success: false,
            message: 'Sequence is already assigned to this funnel'
        });
    }

    await sequence.assignToFunnel(funnelId);

    res.json({
        success: true,
        message: 'Sequence assigned to funnel successfully',
        data: sequence
    });
});

// Remove sequence from funnel
exports.removeFromFunnel = asyncHandler(async (req, res) => {
    const { sequenceId, funnelId } = req.body;
    const coachId = req.coachId;

    const sequence = await NurturingSequence.findOne({ _id: sequenceId, coachId });
    if (!sequence) {
        return res.status(404).json({
            success: false,
            message: 'Nurturing sequence not found'
        });
    }

    await sequence.removeFromFunnel(funnelId);

    res.json({
        success: true,
        message: 'Sequence removed from funnel successfully',
        data: sequence
    });
});

// Duplicate a sequence
exports.duplicateSequence = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { newName } = req.body;
    const coachId = req.coachId;

    const sequence = await NurturingSequence.findOne({ _id: id, coachId });
    if (!sequence) {
        return res.status(404).json({
            success: false,
            message: 'Nurturing sequence not found'
        });
    }

    const duplicate = await sequence.duplicate(newName);

    res.json({
        success: true,
        message: 'Sequence duplicated successfully',
        data: duplicate
    });
});

// Toggle sequence active status
exports.toggleActive = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const coachId = req.coachId;

    const sequence = await NurturingSequence.findOne({ _id: id, coachId });
    if (!sequence) {
        return res.status(404).json({
            success: false,
            message: 'Nurturing sequence not found'
        });
    }

    sequence.isActive = !sequence.isActive;
    await sequence.save();

    res.json({
        success: true,
        message: `Sequence ${sequence.isActive ? 'activated' : 'deactivated'} successfully`,
        data: sequence
    });
});

// Get sequence statistics
exports.getSequenceStats = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const coachId = req.coachId;

    const sequence = await NurturingSequence.findOne({ _id: id, coachId });
    if (!sequence) {
        return res.status(404).json({
            success: false,
            message: 'Nurturing sequence not found'
        });
    }

    // Update stats
    await sequence.updateStats();

    res.json({
        success: true,
        data: {
            sequence: sequence,
            stats: sequence.stats
        }
    });
});

// Get sequences by category
exports.getSequencesByCategory = asyncHandler(async (req, res) => {
    const coachId = req.coachId;
    const { category } = req.params;

    const sequences = await NurturingSequence.find({ 
        coachId, 
        category, 
        isActive: true 
    }).select('name description steps totalSteps stats');

    res.json({
        success: true,
        data: sequences
    });
});

// Bulk assign sequences to funnels
exports.bulkAssignToFunnels = asyncHandler(async (req, res) => {
    const { sequenceIds, funnelIds } = req.body;
    const coachId = req.coachId;

    if (!Array.isArray(sequenceIds) || !Array.isArray(funnelIds)) {
        return res.status(400).json({
            success: false,
            message: 'sequenceIds and funnelIds must be arrays'
        });
    }

    const results = [];
    
    for (const sequenceId of sequenceIds) {
        for (const funnelId of funnelIds) {
            try {
                const sequence = await NurturingSequence.findOne({ _id: sequenceId, coachId });
                if (sequence) {
                    await sequence.assignToFunnel(funnelId);
                    results.push({ sequenceId, funnelId, success: true });
                } else {
                    results.push({ sequenceId, funnelId, success: false, error: 'Sequence not found' });
                }
            } catch (error) {
                results.push({ sequenceId, funnelId, success: false, error: error.message });
            }
        }
    }

    res.json({
        success: true,
        message: 'Bulk assignment completed',
        data: results
    });
});

// Get funnel assignments for a sequence
exports.getFunnelAssignments = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const coachId = req.coachId;

    const sequence = await NurturingSequence.findOne({ _id: id, coachId })
        .populate('assignedFunnels', 'name description isActive');

    if (!sequence) {
        return res.status(404).json({
            success: false,
            message: 'Nurturing sequence not found'
        });
    }

    res.json({
        success: true,
        data: sequence.assignedFunnels
    });
});

// Test sequence execution (dry run)
exports.testSequence = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { leadId } = req.body;
    const coachId = req.coachId;

    const sequence = await NurturingSequence.findOne({ _id: id, coachId });
    if (!sequence) {
        return res.status(404).json({
            success: false,
            message: 'Nurturing sequence not found'
        });
    }

    const lead = await Lead.findOne({ _id: leadId, coachId });
    if (!lead) {
        return res.status(404).json({
            success: false,
            message: 'Lead not found'
        });
    }

    // Simulate sequence execution
    const executionPlan = sequence.steps.map((step, index) => {
        const delayMs = (step.delayDays * 24 * 60 * 60 * 1000) + (step.delayHours * 60 * 60 * 1000);
        const executionTime = new Date(Date.now() + delayMs);
        
        return {
            stepNumber: step.stepNumber,
            name: step.name,
            actionType: step.actionType,
            executionTime: executionTime,
            delay: {
                days: step.delayDays,
                hours: step.delayHours
            },
            actionConfig: step.actionConfig
        };
    });

    res.json({
        success: true,
        message: 'Sequence test execution plan generated',
        data: {
            sequence: sequence.name,
            lead: lead.name,
            executionPlan,
            totalSteps: sequence.steps.length,
            estimatedDuration: sequence.steps.reduce((total, step) => 
                total + (step.delayDays * 24 * 60 * 60 * 1000) + (step.delayHours * 60 * 60 * 1000), 0
            )
        }
    });
});
