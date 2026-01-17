// D:\PRJ_YCT_Final\workers\worker_payment_processor.js
//jaspreet1
const { consumeEvents, publishEvent } = require('../services/rabbitmqProducer'); // <-- UPDATED: Now imports from the correct file
const Lead = require('../schema/Lead');
// Removed the funnelsEyeEventEmitter import as we are now using RabbitMQ for all events.

const PAYMENT_EVENT_ROUTING_KEY = 'payment.received';
const CONVERTED_LEAD_EVENT = 'lead_converted';

/**
 * Initializes the payment processor worker.
 * This worker listens for successful payment events and updates the lead accordingly.
 */
const initPaymentProcessorWorker = async () => {
    try {
        

        const eventHandler = async (msg) => {
            if (!msg || !msg.content) {
                console.warn('[Payment Processor Worker] Received an empty message.');
                return;
            }

            try {
                const eventPayload = JSON.parse(msg.content.toString());
                console.log(`[Payment Processor Worker] Received event: ${eventPayload.eventName}`);

                if (eventPayload.eventName === PAYMENT_EVENT_ROUTING_KEY) {
                    const { leadId } = eventPayload.payload;
                    const paymentDoc = eventPayload.relatedDoc;

                    if (!leadId) {
                        console.error('[Payment Processor Worker] Missing leadId in payment received event.');
                        return;
                    }

                    console.log(`[Payment Processor Worker] Processing payment for lead ID: ${leadId}`);

                    const updatedLead = await Lead.findByIdAndUpdate(
                        leadId,
                        {
                            status: 'Converted',
                            $unset: { nextFollowUpAt: 1 }
                        },
                        { new: true }
                    );

                    if (!updatedLead) {
                        console.error(`[Payment Processor Worker] Lead with ID ${leadId} not found.`);
                        return;
                    }

                    console.log(`[Payment Processor Worker] Lead ${leadId} status updated to 'Converted'.`);

                    // <-- UPDATED: Publish a RabbitMQ event instead of using a local event emitter
                    const event = {
                        eventName: CONVERTED_LEAD_EVENT,
                        payload: {
                            leadId: updatedLead._id,
                            coachId: updatedLead.coachId,
                            payment: paymentDoc
                        },
                        relatedDoc: {
                            leadId: updatedLead._id,
                            coachId: updatedLead.coachId
                        },
                        timestamp: new Date().toISOString()
                    };
                    await publishEvent('funnelseye_events', CONVERTED_LEAD_EVENT, event);
                }
            } catch (error) {
                console.error('[Payment Processor Worker] Error processing message:', error);
            }
        };

        await consumeEvents('funnelseye_events', PAYMENT_EVENT_ROUTING_KEY, eventHandler, 'payment_processor_queue');

    } catch (error) {
        console.error('[Payment Processor Worker] Failed to initialize:', error);
        setTimeout(initPaymentProcessorWorker, 5000);
    }
};

module.exports = initPaymentProcessorWorker;