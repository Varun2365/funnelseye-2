const { User } = require('../schema');
const jwt = require('jsonwebtoken');

/**
 * Simple auth middleware for subscription routes
 * This doesn't check subscription status - allows coaches to access subscription management
 */
const subscriptionAuth = async (req, res, next) => {
    // Allow OPTIONS requests (preflight) to pass through for CORS
    if (req.method === 'OPTIONS') {
        return next();
    }

    let token;

    // Check if token exists in the Authorization header (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Check if token is provided
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route, no token provided.'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user by the ID extracted from the token's payload
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User belonging to this token no longer exists.'
            });
        }

        // Attach user info to request
        req.userId = user._id;
        req.coachId = user.role === 'staff' && user.coachId ? user.coachId : user._id;
        req.role = user.role;
        req.user = user;

        next(); // Proceed to the next middleware or route handler

    } catch (error) {
        console.error('🔒 Error in subscription auth middleware:', error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route, invalid token.'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route, token has expired.'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server Error in authentication process.'
        });
    }
};

module.exports = {
    subscriptionAuth
};
