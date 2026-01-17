const mongoose = require('mongoose');
const Lead = require('../schema/Lead');
const NurturingSequence = require('../schema/NurturingSequence');
const nurturingService = require('../services/nurturingService');
const { publishEvent } = require('../services/rabbitmqProducer');

/**
 * Nurturing Sequence Worker
 * Processes nurturing sequences and executes immediate steps
 */

async function processNurturingSequences() {
    try {
        
        
        // Find leads with active nurturing sequences
        const leads = await Lead.find({ 
            nurturingSequence: { $ne: null },
            status: { $ne: 'Client' } // Don't process converted leads
        }).populate('nurturingSequence');

        console.log(`[NurturingWorker] Found ${leads.length} leads with nurturing sequences`);

        for (const lead of leads) {
            try {
                await processLeadNurturing(lead);
            } catch (error) {
                console.error(`[NurturingWorker] Error processing lead ${lead._id}:`, error.message);
            }
        }

        console.log('[NurturingWorker] Completed nurturing sequence processing');
    } catch (error) {
        console.error('[NurturingWorker] Error in main processing loop:', error);
    }
}

async function processLeadNurturing(lead) {
    try {
        if (!lead.nurturingSequence || !lead.nurturingSequence.isActive) {
            return;
        }

        const sequence = lead.nurturingSequence;
        
        // Migrate existing leads from old nurturingStepIndex to new nurturingProgress structure
        if (!lead.nurturingProgress && typeof lead.nurturingStepIndex === 'number') {
            lead.nurturingProgress = {
                isActive: true,
                currentStepIndex: lead.nurturingStepIndex,
                completedSteps: [],
                lastStepAt: lead.lastNurturingStepAt || lead.updatedAt || lead.createdAt,
                nextStepAt: null
            };
            
            // Mark all previous steps as completed
            for (let i = 0; i < lead.nurturingStepIndex; i++) {
                if (sequence.steps[i]) {
                    lead.nurturingProgress.completedSteps.push(sequence.steps[i]._id.toString());
                }
            }
            
            console.log(`[NurturingWorker] Migrated lead ${lead._id} from old nurturingStepIndex ${lead.nurturingStepIndex} to new nurturingProgress structure`);
        }
        
        // Initialize nurturing progress if not exists
        if (!lead.nurturingProgress) {
            lead.nurturingProgress = {
                isActive: true,
                currentStepIndex: 0,
                completedSteps: [],
                lastStepAt: null,
                nextStepAt: null
            };
        }
        
        // Check if lead has completed the sequence
        if (lead.nurturingProgress.currentStepIndex >= sequence.steps.length) {
            console.log(`[NurturingWorker] Lead ${lead._id} completed sequence "${sequence.name}"`);
            lead.nurturingProgress.isActive = false;
            await lead.save();
            return;
        }

        const currentStep = sequence.steps[lead.nurturingProgress.currentStepIndex];
        if (!currentStep || !currentStep.isActive) {
            // Skip inactive steps and move to next
            lead.nurturingProgress.currentStepIndex += 1;
            await lead.save();
            return await processLeadNurturing(lead);
        }

        // Check if this step was already executed
        if (lead.nurturingProgress.completedSteps.includes(currentStep._id.toString())) {
            console.log(`[NurturingWorker] Step ${currentStep.stepNumber} already executed for lead ${lead._id}, moving to next`);
            lead.nurturingProgress.currentStepIndex += 1;
            await lead.save();
            return await processLeadNurturing(lead);
        }

        // Check if it's time to execute this step
        if (await shouldExecuteStep(lead, currentStep)) {
            console.log(`[NurturingWorker] Executing step ${currentStep.stepNumber} for lead ${lead._id}`);
            
            // Execute the step
            const success = await executeNurturingStep(lead, currentStep);
            
            if (success) {
                // Mark step as completed
                lead.nurturingProgress.completedSteps.push(currentStep._id.toString());
                lead.nurturingProgress.lastStepAt = new Date();
                
                // Move to next step
                lead.nurturingProgress.currentStepIndex += 1;
                
                // Schedule next step if it has delay
                if (lead.nurturingProgress.currentStepIndex < sequence.steps.length) {
                    const nextStep = sequence.steps[lead.nurturingProgress.currentStepIndex];
                    if (nextStep.delayDays > 0 || nextStep.delayHours > 0) {
                        const nextStepTime = await scheduleNextStep(lead, nextStep);
                        lead.nurturingProgress.nextStepAt = nextStepTime;
                    }
                }
                
                await lead.save();
                console.log(`[NurturingWorker] Successfully completed step ${currentStep.stepNumber} for lead ${lead._id}`);
            }
        } else {
            console.log(`[NurturingWorker] Step ${currentStep.stepNumber} not ready for lead ${lead._id}, next check in 2 minutes`);
        }
    } catch (error) {
        console.error(`[NurturingWorker] Error processing lead ${lead._id}:`, error);
    }
}

async function shouldExecuteStep(lead, step) {
    // Check if step was already executed
    if (lead.nurturingProgress && lead.nurturingProgress.completedSteps.includes(step._id.toString())) {
        return false;
    }

    // Immediate execution for 0-delay steps
    if (step.delayDays === 0 && step.delayHours === 0) {
        return true;
    }

    // Check if enough time has passed since the last step
    const lastStepTime = lead.nurturingProgress?.lastStepAt || lead.lastNurturingStepAt || lead.updatedAt || lead.createdAt;
    const delayMs = (step.delayDays * 24 * 60 * 60 * 1000) + (step.delayHours * 60 * 60 * 1000);
    const dueTime = new Date(lastStepTime.getTime() + delayMs);

    return new Date() >= dueTime;
}

async function executeNurturingStep(lead, step) {
    try {
        console.log(`[NurturingWorker] Executing step ${step.stepNumber}: ${step.name} for lead ${lead._id}`);

        // Create automation event for the step
        const eventPayload = {
            leadId: lead._id,
            coachId: lead.coachId,
            stepIndex: lead.nurturingProgress?.currentStepIndex || lead.nurturingStepIndex || 0,
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

        // Update last step execution time
        lead.lastNurturingStepAt = new Date();
        await lead.save();

        console.log(`[NurturingWorker] Successfully executed step ${step.stepNumber} for lead ${lead._id}`);
        return true;
    } catch (error) {
        console.error(`[NurturingWorker] Error executing step ${step.stepNumber} for lead ${lead._id}:`, error);
        return false;
    }
}

async function scheduleNextStep(lead, step) {
    try {
        const delayMs = (step.delayDays * 24 * 60 * 60 * 1000) + (step.delayHours * 60 * 60 * 1000);
        const scheduledTime = new Date(Date.now() + delayMs);

        await publishEvent('funnelseye_actions', 'nurturing_step_due', {
            leadId: lead._id,
            stepId: step._id,
            sequenceId: lead.nurturingSequence,
            scheduledTime: scheduledTime
        });

        console.log(`[NurturingWorker] Scheduled step ${step.stepNumber} for lead ${lead._id} at ${scheduledTime}`);
        return scheduledTime;
    } catch (error) {
        console.error(`[NurturingWorker] Error scheduling next step for lead ${lead._id}:`, error);
        return null;
    }
}

/**
 * Initialize the nurturing worker
 * This function is called by main.js to start the worker
 */
function initNurturingWorker() {
    // console.log('[NurturingWorker] Initializing nurturing sequence worker...');
    
    // Run every 2 minutes for immediate processing
    setInterval(processNurturingSequences, 2 * 60 * 1000);

    // Don't run immediately on startup - let it run on the first interval
    // console.log('[NurturingWorker] Worker initialized, will start processing in 2 minutes');

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
        console.log('[NurturingWorker] Received SIGTERM. Shutting down gracefully...');
        process.exit(0);
    });

    process.on('SIGINT', () => {
        console.log('[NurturingWorker] Received SIGINT. Shutting down gracefully...');
        process.exit(0);
    });
}

// Export the initialization function
module.exports = initNurturingWorker;
