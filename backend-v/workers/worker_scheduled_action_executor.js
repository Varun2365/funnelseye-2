// D:\PRJ_YCT_Final\workers\worker_scheduled_action_executor.js
//varun
const amqp = require('amqplib');
const mongoose = require('mongoose');
const Lead = require('../schema/Lead');
const NurturingSequence = require('../schema/NurturingSequence');
const axios = require('axios');
const { executeAutomationAction } = require('../services/actionExecutorService');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const SCHEDULED_ACTIONS_QUEUE = 'funnelseye_scheduled_actions';
const MONGODB_URI = 'mongodb://localhost:27017/FunnelsEye';
const CHECK_INTERVAL_MINUTES = 10; // How often to check for due nurturing steps

// Export this function so it can be called by main.js
const initScheduledExecutorWorker = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        

        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        
        // Assert the queue with the 'x-delayed-message' exchange plugin
        // This is necessary for RabbitMQ to handle delayed messages
        await channel.assertExchange('delayed_actions_exchange', 'x-delayed-message', {
            durable: true,
            arguments: { 'x-delayed-type': 'direct' }
        });
        await channel.assertQueue(SCHEDULED_ACTIONS_QUEUE, { durable: true });
        await channel.bindQueue(SCHEDULED_ACTIONS_QUEUE, 'delayed_actions_exchange', SCHEDULED_ACTIONS_QUEUE);

        

        channel.consume(SCHEDULED_ACTIONS_QUEUE, async (msg) => {
            if (msg.content) {
                const message = JSON.parse(msg.content.toString());
                console.log(`[Scheduled Action Executor] Received delayed message for action: ${message.actionType}`);
                
                try {
                    // Call the same executeAutomationAction function from the main executor
                    await executeAutomationAction(message);
                    console.log(`[Scheduled Action Executor] Successfully executed action: ${message.actionType}`);
                    channel.ack(msg);
                } catch (error) {
                    console.error(`[Scheduled Action Executor] Error executing scheduled action "${message.actionType}":`, error.message);
                    // Requeue the message for another attempt
                    channel.nack(msg);
                }
            }
        }, { noAck: false });

    } catch (error) {
        console.error('[Scheduled Action Executor] Failed to initialize worker:', error);
        setTimeout(initScheduledExecutorWorker, 5000);
    }
};

async function processNurturingSequences() {
    await mongoose.connect(MONGODB_URI);
    const now = new Date();
    const leads = await Lead.find({ nurturingSequence: { $ne: null } }).populate('nurturingSequence');
    for (const lead of leads) {
        const sequence = lead.nurturingSequence;
        if (!sequence || lead.nurturingStepIndex >= sequence.steps.length) continue;
        const step = sequence.steps[lead.nurturingStepIndex];
        // Calculate when this step should be triggered
        let lastStepTime = lead.updatedAt || lead.createdAt;
        if (lead.nurturingStepIndex > 0 && sequence.steps[lead.nurturingStepIndex - 1].delayDays) {
            lastStepTime = new Date(lastStepTime.getTime() + sequence.steps[lead.nurturingStepIndex - 1].delayDays * 24 * 60 * 60 * 1000);
        }
        const dueTime = new Date(lastStepTime.getTime() + (step.delayDays || 0) * 24 * 60 * 60 * 1000);
        if (now >= dueTime) {
            // Call the advanceNurturingStep endpoint to trigger the step and publish automation event
            try {
                await axios.post(
                    process.env.NURTURING_ADVANCE_URL || 'http://localhost:8080/api/leads/advance-nurturing-step',
                    { leadId: lead._id },
                    { headers: { 'Authorization': `Bearer ${process.env.NURTURING_WORKER_TOKEN || ''}` } }
                );
                console.log(`[NurturingWorker] Advanced nurturing step for lead ${lead._id}`);
            } catch (err) {
                console.error(`[NurturingWorker] Failed to advance nurturing step for lead ${lead._id}:`, err.message);
            }
        }
    }

}

setInterval(processNurturingSequences, CHECK_INTERVAL_MINUTES * 60 * 1000);
console.log(`[NurturingWorker] Scheduled nurturing sequence processor started. Checking every ${CHECK_INTERVAL_MINUTES} minutes.`);

module.exports = initScheduledExecutorWorker;