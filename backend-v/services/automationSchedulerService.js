// D:\PRJ_YCT_Final\services\automationSchedulerService.js

const { publishEvent } = require('./rabbitmqProducer');

/**
 * Schedules a message to be published to RabbitMQ at a future date/time.
 * @param {Date} scheduledTime The time to publish the event.
 * @param {string} exchange The RabbitMQ exchange to publish to.
 * @param {string} routingKey The routing key for the event.
 * @param {object} eventPayload The payload of the event.
 */
const scheduleFutureEvent = async (scheduledTime, exchange, routingKey, eventPayload) => {
    const now = new Date();
    const delay = scheduledTime.getTime() - now.getTime();

    const publishTask = async () => {
        console.log(`[AutomationScheduler] Publishing scheduled event: "${routingKey}" now.`);
        console.log('[DEBUG] publishEvent arguments:', { exchange, routingKey, eventPayload }); // <-- NEW: Debug log
        try {
            await publishEvent(exchange, routingKey, eventPayload);
        } catch (error) {
            console.error(`[AutomationScheduler] Failed to publish scheduled event "${routingKey}":`, error);
        }
    };

    if (delay < 0) {
        console.warn(`[AutomationScheduler] Scheduled time for event "${routingKey}" is in the past. Publishing immediately.`);
        return await publishTask();
    }

    console.log(`[AutomationScheduler] Scheduling event "${routingKey}" for ${scheduledTime.toISOString()}. Delay: ${delay / 1000} seconds.`);

    setTimeout(publishTask, delay);
};

module.exports = {
    scheduleFutureEvent
};