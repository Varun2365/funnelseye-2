// D:\\PRJ_YCT_Final\\middleware\\activityMiddleware.js

const User = require('../schema/User'); // Import the base User model

exports.updateLastActive = async (req, res, next) => {
    // Use req.userId (set by auth middleware) or fallback to req.user.id
    const userId = req.userId || (req.user && req.user.id);
    
    if (userId) {
        try {
            // Use a timeout to prevent hanging
            const updatePromise = User.findByIdAndUpdate(userId, { lastActiveAt: Date.now() });
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Update timeout')), 5000)
            );
            
            await Promise.race([updatePromise, timeoutPromise]);

        } catch (err) {
            console.error('🔄 Error updating last active timestamp:', err.message);
            // Don't block the request if this fails
        }
    } else {
        console.log('⚠️ No user ID found for activity update');
    }
    
    next();
};