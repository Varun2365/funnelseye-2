// D:\PRJ_YCT_Final\services\rabbitmqProducer.js

const amqp = require('amqplib');

let connection;
let channel;
const DEFAULT_EXCHANGE_NAME = 'funnelseye_events';

/**
 * Initializes the RabbitMQ connection and channel.
 */
const init = async () => {
    try {
      
        connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
        channel = await connection.createChannel();

        await channel.assertExchange(DEFAULT_EXCHANGE_NAME, 'topic', { durable: true });



        connection.on('close', () => {
            console.error('[RabbitMQ Service] Connection closed unexpectedly. Attempting to reconnect...');
            setTimeout(init, 5000);
        });

    } catch (error) {
        console.error('[RabbitMQ Service] Failed to connect or initialize:', error.message);
        setTimeout(init, 5000);
    }
};

/**
 * Publishes an event to a specified RabbitMQ exchange.
 * This function is now backward-compatible and can handle both 2 and 3 arguments.
 *
 * @param {string} exchangeNameOrRoutingKey - The exchange name or the routing key (if no exchange is specified).
 * @param {string|object} routingKeyOrPayload - The routing key or the payload (if no exchange is specified).
 * @param {object} [payload] - The data payload for the event (optional).
 */
const publishEvent = async (...args) => {
    if (!channel) {
        console.error(`[RabbitMQ Service] Channel not initialized. Cannot publish event.`);
        return;
    }

    let exchangeName, routingKey, payload;

    // Check if the first argument is a string and the second is an object.
    // This is a heuristic to guess if the old signature (routingKey, payload) is being used.
    if (typeof args[0] === 'string' && typeof args[1] === 'object' && args.length === 2) {
        exchangeName = DEFAULT_EXCHANGE_NAME;
        routingKey = args[0];
        payload = args[1];
    } else if (args.length === 3) {
        [exchangeName, routingKey, payload] = args;
    } else {
        console.error(`[RabbitMQ Service] Invalid number of arguments provided to publishEvent.`);
        return;
    }
    
    try {
        const message = JSON.stringify(payload);
        channel.publish(exchangeName, routingKey, Buffer.from(message), { persistent: true });
        console.log(`[RabbitMQ Service] Event published to "${exchangeName}" with routing key: "${routingKey}"`);
    } catch (error) {
        console.error(`[RabbitMQ Service] Failed to publish event "${routingKey}":`, error.message);
    }
};

/**
 * Consumes events from a specific queue and handles them.
 * @param {string} exchange - The exchange name to bind to.
 * @param {string} routingKey - The routing key pattern to listen for.
 * @param {Function} handler - The message handler function.
 * @param {string} queueName - The name of the queue to use.
 */
const consumeEvents = async (exchange, routingKey, handler, queueName) => {
    if (!channel) {
        console.error('[RabbitMQ Service] Channel not initialized. Cannot consume events.');
        return;
    }

    try {
        await channel.assertExchange(exchange, 'topic', { durable: true });
        const q = await channel.assertQueue(queueName, { durable: true });
        await channel.bindQueue(q.queue, exchange, routingKey);

        // console.log(`[RabbitMQ Service] Waiting for events in queue "${q.queue}" with routing key "${routingKey}"`);

        await channel.consume(q.queue, (msg) => {
            if (msg) {
                handler(msg);
                channel.ack(msg);
            }
        }, { noAck: false });
    } catch (error) {
        console.error(`[RabbitMQ Service] Error consuming events:`, error.message);
    }
};

/**
 * Gracefully closes the RabbitMQ connection.
 */
const closeConnection = async () => {
    if (connection) {
        try {
            await connection.close();
            console.log('[RabbitMQ Service] Connection closed.');
        } catch (error) {
            console.error('[RabbitMQ Service] Error closing connection:', error.message);
        }
    }
};

/**
 * Publishes a message to a specific queue
 * @param {string} queueName - The queue name
 * @param {object} message - The message payload
 * @param {object} options - Additional options
 */
const publishToQueue = async (queueName, message, options = {}) => {
    if (!channel) {
        console.error(`[RabbitMQ Service] Channel not initialized. Cannot publish to queue.`);
        return;
    }

    try {
        // Assert queue exists
        await channel.assertQueue(queueName, { durable: true });

        // Publish message
        const published = channel.sendToQueue(
            queueName,
            Buffer.from(JSON.stringify(message)),
            {
                persistent: true,
                ...options
            }
        );

        if (published) {
            console.log(`📨 Message published to queue: ${queueName}`);
        } else {
            console.warn(`⚠️ Message not published to queue: ${queueName} (queue full?)`);
        }

        return published;
    } catch (error) {
        console.error(`[RabbitMQ Service] Error publishing to queue ${queueName}:`, error.message);
        return false;
    }
};

process.on('beforeExit', closeConnection);
process.on('SIGINT', closeConnection);

module.exports = {
    init,
    publishEvent,
    consumeEvents,
    publishToQueue,
};