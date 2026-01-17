// routes/metaRoutes.js

const express = require('express');
// WhatsApp services moved to dustbin/whatsapp-dump/
// const { handleWebhook, sendMessageByCoach } = require('../services/metaWhatsAppService');

const router = express.Router();

// This is the GET endpoint for webhook verification from Meta
// router.get('/webhook', handleWebhook); // WhatsApp functionality moved to dustbin/whatsapp-dump/

// This is the POST endpoint for receiving incoming messages from Meta
// router.post('/webhook', handleWebhook); // WhatsApp functionality moved to dustbin/whatsapp-dump/

// This is a sample POST endpoint to trigger an outbound message from your app
// For example, this could be used by a UI button on the coach dashboard
// Note: This route is currently disabled as WhatsApp functionality has been moved
router.post('/send-message', async (req, res) => {
    try {
        const { coachId, recipientPhoneNumber, messageContent, useTemplate = false } = req.body;

        if (!coachId || !recipientPhoneNumber || !messageContent) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        // const result = await sendMessageByCoach(coachId, recipientPhoneNumber, messageContent, useTemplate); // WhatsApp functionality moved to dustbin/whatsapp-dump/
        res.status(200).json({ 
            success: false, 
            message: 'WhatsApp functionality has been moved. This endpoint is no longer active.' 
        });
    } catch (error) {
        console.error('Error in /send-message route:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;