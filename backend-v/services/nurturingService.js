const Lead = require('../schema/Lead');
const NurturingSequence = require('../schema/NurturingSequence');
const Funnel = require('../schema/Funnel');
const { publishEvent } = require('./rabbitmqProducer');
const { scheduleFutureEvent } = require('./automationSchedulerService');

// ===== AUTOMATIC SEQUENCE ASSIGNMENT =====

/**
 * Automatically assign nurturing sequence to a new lead based on funnel
 */
async function autoAssignSequenceToLead(leadId, funnelId) {
    try {
        // Find sequences assigned to this funnel
        const sequences = await NurturingSequence.find({
            assignedFunnels: funnelId,
            isActive: true
        });

        if (sequences.length === 0) {
            console.log(`[NurturingService] No nurturing sequences found for funnel ${funnelId}`);
            return null;
        }

        // Get the lead to check trigger conditions
        const lead = await Lead.findById(leadId);
        if (!lead) {
            console.log(`[NurturingService] Lead ${leadId} not found`);
            return null;
        }

        // Find the best matching sequence based on trigger conditions
        let bestSequence = null;
        let bestScore = 0;

        for (const sequence of sequences) {
            const matchScore = calculateSequenceMatchScore(lead, sequence);
            if (matchScore > bestScore) {
                bestScore = matchScore;
                bestSequence = sequence;
            }
        }

        if (bestSequence) {
            // Assign the sequence to the lead
            await assignSequenceToLead(leadId, bestSequence._id);
            
            // Start the sequence immediately
            await startNurturingSequence(leadId, bestSequence._id);
            
            console.log(`[NurturingService] Auto-assigned sequence "${bestSequence.name}" to lead ${leadId}`);
            return bestSequence;
        }

        return null;
    } catch (error) {
        console.error('[NurturingService] Error auto-assigning sequence:', error);
        return null;
    }
}

/**
 * Calculate how well a sequence matches a lead based on trigger conditions
 */
function calculateSequenceMatchScore(lead, sequence) {
    let score = 0;
    const conditions = sequence.triggerConditions;

    // Lead score matching
    if (conditions.leadScore) {
        if (conditions.leadScore.min !== undefined && lead.score >= conditions.leadScore.min) {
            score += 10;
        }
        if (conditions.leadScore.max !== undefined && lead.score <= conditions.leadScore.max) {
            score += 10;
        }
    }

    // Lead source matching
    if (conditions.leadSource && conditions.leadSource.includes(lead.source)) {
        score += 15;
    }

    // Lead status matching
    if (conditions.leadStatus && conditions.leadStatus.includes(lead.status)) {
        score += 10;
    }

    // Lead temperature matching
    if (conditions.leadTemperature && conditions.leadTemperature.includes(lead.leadTemperature)) {
        score += 10;
    }

    // Default sequence gets lower priority
    if (sequence.isDefault) {
        score -= 5;
    }

    return score;
}

// ===== SEQUENCE EXECUTION =====

/**
 * Start a nurturing sequence for a lead
 */
async function startNurturingSequence(leadId, sequenceId) {
    try {
        const lead = await Lead.findById(leadId);
        const sequence = await NurturingSequence.findById(sequenceId);

        if (!lead || !sequence) {
            throw new Error('Lead or sequence not found');
        }

        // Reset lead to start of sequence
        lead.nurturingSequence = sequenceId;
        lead.nurturingStepIndex = 0;
        await lead.save();

        // Execute the first step if it has no delay
        const firstStep = sequence.steps[0];
        if (firstStep && firstStep.delayDays === 0 && firstStep.delayHours === 0) {
            await executeNurturingStep(lead, firstStep);
            // Move to next step
            lead.nurturingStepIndex = 1;
            await lead.save();
        }

        console.log(`[NurturingService] Started nurturing sequence "${sequence.name}" for lead ${leadId}`);
        return true;
    } catch (error) {
        console.error('[NurturingService] Error starting nurturing sequence:', error);
        return false;
    }
}

/**
 * Execute a specific nurturing step
 */
async function executeNurturingStep(lead, step) {
    try {
        console.log(`[NurturingService] Executing step ${step.stepNumber}: ${step.name} for lead ${lead._id}`);

        // Create automation event for the step
        const eventPayload = {
            leadId: lead._id,
            coachId: lead.coachId,
            stepIndex: lead.nurturingStepIndex,
            actionType: step.actionType,
            config: step.actionConfig || {},
            leadData: lead.toObject(),
            sequenceStep: {
                stepNumber: step.stepNumber,
                stepName: step.name,
                stepDescription: step.description
            }
        };

        // Publish to automation system
        await publishEvent('funnelseye_actions', 'lead.nurture', {
            actionType: step.actionType,
            config: step.actionConfig || {},
            payload: eventPayload
        });

        // Log the step execution
        await logStepExecution(lead._id, step, 'executed');

        return true;
    } catch (error) {
        console.error('[NurturingService] Error executing nurturing step:', error);
        await logStepExecution(lead._id, step, 'failed', error.message);
        return false;
    }
}

/**
 * Progress a lead to the next nurturing step
 */
async function progressLeadStep(lead) {
    try {
        if (!lead.nurturingSequence) {
            return false;
        }

        const sequence = await NurturingSequence.findById(lead.nurturingSequence);
        if (!sequence || !sequence.isActive) {
            return false;
        }

        // Check if lead has completed the sequence
        if (lead.nurturingStepIndex >= sequence.steps.length) {
            console.log(`[NurturingService] Lead ${lead._id} completed nurturing sequence "${sequence.name}"`);
            await markSequenceCompleted(lead._id, sequence._id);
            return true;
        }

        const currentStep = sequence.steps[lead.nurturingStepIndex];
        if (!currentStep || !currentStep.isActive) {
            // Skip inactive steps
            lead.nurturingStepIndex += 1;
            await lead.save();
            return await progressLeadStep(lead);
        }

        // Check if it's time to execute this step
        if (await shouldExecuteStep(lead, currentStep)) {
            await executeNurturingStep(lead, currentStep);
            
            // Move to next step
            lead.nurturingStepIndex += 1;
            await lead.save();

            // Schedule next step if it has delay
            if (lead.nurturingStepIndex < sequence.steps.length) {
                const nextStep = sequence.steps[lead.nurturingStepIndex];
                if (nextStep.delayDays > 0 || nextStep.delayHours > 0) {
                    await scheduleNextStep(lead, nextStep);
                }
            }
        }

        return true;
    } catch (error) {
        console.error('[NurturingService] Error progressing lead step:', error);
        return false;
    }
}

/**
 * Check if a step should be executed based on timing
 */
async function shouldExecuteStep(lead, step) {
    if (step.delayDays === 0 && step.delayHours === 0) {
        return true;
    }

    // Calculate when this step should be executed
    const lastStepTime = lead.updatedAt || lead.createdAt;
    const delayMs = (step.delayDays * 24 * 60 * 60 * 1000) + (step.delayHours * 60 * 60 * 1000);
    const dueTime = new Date(lastStepTime.getTime() + delayMs);

    return new Date() >= dueTime;
}

/**
 * Schedule the next step for execution
 */
async function scheduleNextStep(lead, step) {
    try {
        const delayMs = (step.delayDays * 24 * 60 * 60 * 1000) + (step.delayHours * 60 * 60 * 1000);
        const scheduledTime = new Date(Date.now() + delayMs);

        await scheduleFutureEvent(scheduledTime, 'funnelseye_actions', 'nurturing_step_due', {
            leadId: lead._id,
            stepId: step._id,
            sequenceId: lead.nurturingSequence
        });

        console.log(`[NurturingService] Scheduled step ${step.stepNumber} for lead ${lead._id} at ${scheduledTime}`);
    } catch (error) {
        console.error('[NurturingService] Error scheduling next step:', error);
    }
}

// ===== SEQUENCE MANAGEMENT =====

/**
 * Assign a nurturing sequence to a lead
 */
async function assignSequenceToLead(leadId, sequenceId) {
    try {
        await Lead.findByIdAndUpdate(leadId, {
            nurturingSequence: sequenceId,
            nurturingStepIndex: 0
        });
        return true;
    } catch (error) {
        console.error('[NurturingService] Error assigning sequence to lead:', error);
        return false;
    }
}

/**
 * Get the current sequence status for a lead
 */
async function getLeadSequenceStatus(leadId) {
    try {
        const lead = await Lead.findById(leadId).populate('nurturingSequence');
        if (!lead || !lead.nurturingSequence) {
            return { hasSequence: false };
        }

        const sequence = lead.nurturingSequence;
        const currentStep = sequence.steps[lead.nurturingStepIndex];
        const progress = (lead.nurturingStepIndex / sequence.steps.length) * 100;

        return {
            hasSequence: true,
            sequenceName: sequence.name,
            currentStep: lead.nurturingStepIndex + 1,
            totalSteps: sequence.steps.length,
            progress: Math.round(progress),
            currentStepName: currentStep ? currentStep.name : 'Completed',
            isCompleted: lead.nurturingStepIndex >= sequence.steps.length
        };
    } catch (error) {
        console.error('[NurturingService] Error getting lead sequence status:', error);
        return { hasSequence: false, error: error.message };
    }
}

/**
 * Mark a sequence as completed for a lead
 */
async function markSequenceCompleted(leadId, sequenceId) {
    try {
        await Lead.findByIdAndUpdate(leadId, {
            $unset: { nurturingSequence: 1, nurturingStepIndex: 1 }
        });

        // Update sequence stats
        const sequence = await NurturingSequence.findById(sequenceId);
        if (sequence) {
            await sequence.updateStats();
        }

        console.log(`[NurturingService] Marked sequence ${sequenceId} as completed for lead ${leadId}`);
        return true;
    } catch (error) {
        console.error('[NurturingService] Error marking sequence completed:', error);
        return false;
    }
}

// ===== LOGGING =====

/**
 * Log step execution for tracking
 */
async function logStepExecution(leadId, step, status, errorMessage = null) {
    try {
        const SequenceLog = require('../schema/SequenceLog');
        await SequenceLog.create({
            lead: leadId,
            sequence: step.sequenceId,
            step: step._id,
            status: status,
            executedAt: new Date(),
            errorMessage: errorMessage
        });
    } catch (error) {
        console.error('[NurturingService] Error logging step execution:', error);
    }
}

// ===== BULK OPERATIONS =====

/**
 * Bulk assign sequences to leads based on criteria
 */
async function bulkAssignSequences(criteria, sequenceId) {
    try {
        const leads = await Lead.find(criteria);
        let successCount = 0;
        let errorCount = 0;

        for (const lead of leads) {
            try {
                await assignSequenceToLead(lead._id, sequenceId);
                successCount++;
            } catch (error) {
                errorCount++;
                console.error(`[NurturingService] Error assigning sequence to lead ${lead._id}:`, error);
            }
        }

        return { successCount, errorCount, total: leads.length };
    } catch (error) {
        console.error('[NurturingService] Error in bulk assignment:', error);
        return { successCount: 0, errorCount: 0, total: 0 };
    }
}

module.exports = {
    autoAssignSequenceToLead,
    assignSequenceToLead,
    progressLeadStep,
    startNurturingSequence,
    getLeadSequenceStatus,
    markSequenceCompleted,
    bulkAssignSequences,
    executeNurturingStep
};
