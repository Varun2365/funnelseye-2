// D:\PRJ_YCT_Final\workers\worker_action_executor.js

const amqp = require('amqplib');
const mongoose = require('mongoose');
const { executeAutomationAction } = require('../services/actionExecutorService');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const ACTIONS_EXCHANGE = 'funnelseye_actions';

const initActionExecutorWorker = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/FunnelsEye');


        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertExchange(ACTIONS_EXCHANGE, 'topic', { durable: true });

        // Assert a queue for this worker
        const { queue } = await channel.assertQueue('funnelseye_action_executor_queue', { durable: true });

        // Bind the queue to listen for all action types
        await channel.bindQueue(queue, ACTIONS_EXCHANGE, '#');



        channel.consume(queue, async (msg) => {
            if (msg.content) {
                let actionPayload;
                try {
                    actionPayload = JSON.parse(msg.content.toString());

                    console.log(`[Action Executor] Received action: ${actionPayload.actionType}`);

                    // Dispatch the action to the dedicated service
                    await executeAutomationAction(actionPayload);

                    channel.ack(msg);
                } catch (error) {
                    console.error('[Action Executor] Error processing action:', error);
                    // Log the payload for debugging
                    console.error('Action Payload:', actionPayload);
                    // Since we handle failures gracefully in the action executor,
                    // we can still ack the message to prevent infinite loops
                    console.log('[Action Executor] Acknowledging message despite error to prevent infinite loops');
                    channel.ack(msg);
                }
            }
        });

    } catch (error) {
        console.error('[Action Executor] Failed to initialize worker:', error);
        // Retry connection after 5 seconds if it fails
        setTimeout(initActionExecutorWorker, 5000);
    }
};

module.exports = initActionExecutorWorker;