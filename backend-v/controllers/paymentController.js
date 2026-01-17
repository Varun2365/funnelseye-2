// D:\PRJ_YCT_Final\controllers\paymentController.js

const Lead = require('../schema/Lead');
const Payment = require('../schema/Payment');
const { publishEvent } = require('../services/rabbitmqProducer');

/**
 * Handles incoming payment webhook data.
 * This function will:
 * 1. Validate the incoming data.
 * 2. Find the associated Lead.
 * 3. Create a new Payment document.
 * 4. Publish a 'payment_received' event to the message queue.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.handlePaymentWebhook = async (req, res) => {
    // NOTE: In a real-world application, you MUST verify the webhook
    // signature to ensure the request is from a legitimate source (e.g., Stripe, Razorpay).
    // The implementation below is simplified for demonstration purposes.

    const { paymentId, leadId, amount, currency, status, paymentMethod, gatewayResponse } = req.body;

    if (!paymentId || !leadId || !amount || !currency) {
        return res.status(400).json({ error: 'Missing required payment data.' });
    }

    try {
        // Find the lead associated with the payment
        const lead = await Lead.findById(leadId);
        if (!lead) {
            return res.status(404).json({ error: 'Associated lead not found.' });
        }
        
        // Create a new Payment document in your database
        const newPayment = await Payment.create({
            paymentId,
            lead: lead._id,
            coach: lead.coachId, // Associate the payment with the lead's coach
            amount,
            currency,
            status,
            paymentMethod,
            gatewayResponse
        });

        console.log(`[Payment Controller] New payment received and saved: ${newPayment._id}`);

        // Publish a payment_received event to the RabbitMQ queue
        const eventPayload = {
            eventName: 'payment_received',
            payload: {
                paymentId: newPayment._id,
                leadId: lead._id
            },
            relatedDoc: newPayment, // The full payment document
            timestamp: new Date().toISOString()
        };
        
        await publishEvent('funnelseye_events', 'payment.received', eventPayload);
        
        // Respond to the webhook sender to acknowledge receipt
        res.status(200).json({ message: 'Payment event received and processed successfully.', paymentId: newPayment._id });

    } catch (error) {
        console.error('[Payment Controller] Error processing payment webhook:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Example: After payment is successful
const publishPaymentSuccessful = (payment, lead) => {
    const eventName = 'payment_successful';
    const eventPayload = {
        eventName,
        payload: {
            paymentId: payment._id,
            leadId: lead._id,
            coachId: lead.coachId,
            amount: payment.amount,
            currency: payment.currency,
        }
    };
    publishEvent(eventName, eventPayload).catch(err => console.error(`[Controller] Failed to publish event: ${eventName}`, err));
};
// Similarly for payment_failed, payment_link_clicked, payment_abandoned, invoice_paid, subscription_created, subscription_cancelled, card_expired