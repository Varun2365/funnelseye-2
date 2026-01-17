const WhatsAppCredit = require('../schema/WhatsAppCredit');

// Middleware to check if user has sufficient credits to send messages
const checkCredits = async (req, res, next) => {
    try {
        const coachId = req.user.id;
        
        // Get or create credits for the coach
        const credits = await WhatsAppCredit.getOrCreateCredits(coachId);
        
        // Check if user can send messages
        if (!credits.canSendMessage()) {
            return res.status(402).json({
                success: false,
                message: 'Insufficient credits to send messages',
                data: {
                    balance: credits.balance,
                    status: credits.status,
                    required: 1,
                    suggestion: 'Please purchase more credits to continue sending messages'
                }
            });
        }
        
        // Add credits info to request for later use
        req.credits = credits;
        next();
        
    } catch (error) {
        console.error('❌ [CREDIT_CHECK] Error checking credits:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking credits',
            error: error.message
        });
    }
};

// Middleware to deduct credits after successful message send
const deductCredits = async (req, res, next) => {
    try {
        // Only deduct credits if message was sent successfully
        if (res.locals.messageSent && req.credits) {
            const credits = req.credits;
            const messageCount = res.locals.messageCount || 1;
            
            try {
                await credits.deductCredits(messageCount, 'WhatsApp message sent');
                console.log(`✅ [CREDITS] Deducted ${messageCount} credit(s) for coach ${req.user.id}. New balance: ${credits.balance}`);
                
                // Add credit info to response
                res.locals.creditsUsed = messageCount;
                res.locals.remainingCredits = credits.balance;
                
            } catch (error) {
                console.error('❌ [CREDITS] Error deducting credits:', error);
                // Don't fail the request if credit deduction fails
            }
        }
        
        next();
        
    } catch (error) {
        console.error('❌ [CREDIT_DEDUCT] Error in credit deduction middleware:', error);
        next(); // Continue even if credit deduction fails
    }
};

// Middleware to check credits for batch messages
const checkBatchCredits = async (req, res, next) => {
    try {
        const coachId = req.user.id;
        const messages = req.body.messages || [];
        
        if (messages.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No messages provided'
            });
        }
        
        // Get or create credits for the coach
        const credits = await WhatsAppCredit.getOrCreateCredits(coachId);
        
        // Check if user has enough credits for all messages
        if (credits.balance < messages.length) {
            return res.status(402).json({
                success: false,
                message: 'Insufficient credits for batch messages',
                data: {
                    balance: credits.balance,
                    required: messages.length,
                    messagesCount: messages.length,
                    suggestion: `You need ${messages.length} credits but only have ${credits.balance}`
                }
            });
        }
        
        // Add credits info to request
        req.credits = credits;
        req.messageCount = messages.length;
        next();
        
    } catch (error) {
        console.error('❌ [BATCH_CREDIT_CHECK] Error checking batch credits:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking batch credits',
            error: error.message
        });
    }
};

module.exports = {
    checkCredits,
    deductCredits,
    checkBatchCredits
};
