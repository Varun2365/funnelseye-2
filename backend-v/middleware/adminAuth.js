const jwt = require('jsonwebtoken');
const { AdminUser } = require('../schema');

// ===== ADMIN AUTHENTICATION MIDDLEWARE =====

// No-log middleware for debugging
const noLogActivity = (req, res, next) => {
    //console.log('🔧 [NO_LOG] Skipping admin activity logging for:', req.method, req.url);
    next();
};

// Verify admin JWT token
const verifyAdminToken = async (req, res, next) => {
    try {
 
        
        const authHeader = req.header('Authorization');
        //console.log('🔐 [ADMIN_AUTH] verifyAdminToken - Auth header present:', !!authHeader);
        //console.log('🔐 [ADMIN_AUTH] verifyAdminToken - Auth header length:', authHeader ? authHeader.length : 0);
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            //console.log('❌ [ADMIN_AUTH] verifyAdminToken - No valid auth header');
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        if (!token) {
            //console.log('❌ [ADMIN_AUTH] verifyAdminToken - Empty token after Bearer removal');
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Try to decode token without verification first to see its structure
        try {
            const unverifiedDecoded = jwt.decode(token, { complete: true });
            //console.log('🔐 [ADMIN_AUTH] verifyAdminToken - Token header:', unverifiedDecoded?.header);
            //console.log('🔐 [ADMIN_AUTH] verifyAdminToken - Token payload:', unverifiedDecoded?.payload);
            //console.log('🔐 [ADMIN_AUTH] verifyAdminToken - Token issued at:', unverifiedDecoded?.payload?.iat ? new Date(unverifiedDecoded.payload.iat * 1000).toISOString() : 'N/A');
            //console.log('🔐 [ADMIN_AUTH] verifyAdminToken - Token expires at:', unverifiedDecoded?.payload?.exp ? new Date(unverifiedDecoded.payload.exp * 1000).toISOString() : 'N/A');
            //console.log('🔐 [ADMIN_AUTH] verifyAdminToken - Current time:', new Date().toISOString());
            //console.log('🔐 [ADMIN_AUTH] verifyAdminToken - Token expired?', unverifiedDecoded?.payload?.exp ? (Date.now() / 1000) > unverifiedDecoded.payload.exp : 'Unknown');
        } catch (decodeError) {
            //console.log('❌ [ADMIN_AUTH] verifyAdminToken - Failed to decode token:', decodeError.message);
        }

        // Verify token
        // Use same JWT_SECRET fallback as generateToken in adminAuthController for consistency
        //console.log('🔐 [ADMIN_AUTH] verifyAdminToken - Attempting JWT verification...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'thisisaverysecretkeywhichcantbehacked');

        //console.log('✅ [ADMIN_AUTH] verifyAdminToken - JWT verification successful');
        // console.log('🔐 [ADMIN_AUTH] verifyAdminToken - Decoded payload:', decoded);
        
        // Check if token is for admin
        //console.log('🔐 [ADMIN_AUTH] verifyAdminToken - Checking token type:', decoded.type);
        if (decoded.type !== 'admin') {
            //console.log('❌ [ADMIN_AUTH] verifyAdminToken - Invalid token type:', decoded.type);
            return res.status(401).json({
                success: false,
                message: 'Invalid token type. Admin token required.'
            });
        }

        // Get admin user
        //console.log('🔐 [ADMIN_AUTH] verifyAdminToken - Looking up admin with ID:', decoded.adminId);
        const admin = await AdminUser.findById(decoded.adminId).select('-password -passwordHistory');
        
        if (!admin) {
            //console.log('❌ [ADMIN_AUTH] verifyAdminToken - Admin not found in database');
            return res.status(401).json({
                success: false,
                message: 'Admin not found.'
            });
        }

        //console.log('✅ [ADMIN_AUTH] verifyAdminToken - Admin found:', admin.email);
        //console.log('🔐 [ADMIN_AUTH] verifyAdminToken - Admin status:', admin.status);
        //console.log('🔐 [ADMIN_AUTH] verifyAdminToken - Admin role:', admin.role);

        // Check if admin is active
        if (admin.status !== 'active') {
            //console.log('❌ [ADMIN_AUTH] verifyAdminToken - Admin account not active:', admin.status);
            return res.status(401).json({
                success: false,
                message: 'Admin account is not active.'
            });
        }

        // Check if admin is locked
        const isLocked = admin.isLocked();
        //console.log('🔐 [ADMIN_AUTH] verifyAdminToken - Admin locked?', isLocked);
        if (isLocked) {
            //console.log('❌ [ADMIN_AUTH] verifyAdminToken - Admin account is locked');
            return res.status(423).json({
                success: false,
                message: 'Admin account is temporarily locked.'
            });
        }

        // Add admin to request object
        req.admin = admin;
        //console.log('✅ [ADMIN_AUTH] verifyAdminToken - Authentication successful');
        //console.log('✅ [ADMIN_AUTH] verifyAdminToken - Admin:', admin.email);
        //console.log('✅ [ADMIN_AUTH] verifyAdminToken - Admin ID:', admin._id);
        //console.log('✅ [ADMIN_AUTH] verifyAdminToken - Admin permissions:', admin.permissions);
        next();

    } catch (error) {
        console.error('Admin token verification error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Token verification failed.'
        });
    }
};

// Check admin permissions
const checkAdminPermission = (permission) => {
    return (req, res, next) => {
        try {
            //console.log('🔐 [ADMIN_AUTH] checkAdminPermission - Starting...');
            //console.log('🔐 [ADMIN_AUTH] checkAdminPermission - Required permission:', permission);
            
            if (!req.admin) {
                //console.log('❌ [ADMIN_AUTH] checkAdminPermission - No admin in request');
                return res.status(401).json({
                    success: false,
                    message: 'Admin authentication required.'
                });
            }

            //console.log('🔐 [ADMIN_AUTH] checkAdminPermission - Admin role:', req.admin.role);
            //console.log('🔐 [ADMIN_AUTH] checkAdminPermission - Admin permissions:', req.admin.permissions);

            // Super admin and admin have all permissions - bypass permission check
            const adminRole = req.admin.role?.toLowerCase();
            if (adminRole === 'super_admin' || adminRole === 'admin') {
                //console.log('✅ [ADMIN_AUTH] checkAdminPermission - Super admin/Admin, bypassing permission check');
                return next();
            }

            // Check specific permission
            //console.log('🔐 [ADMIN_AUTH] checkAdminPermission - Checking permission...');
            const hasPermission = req.admin.hasPermission(permission);
            //console.log('🔐 [ADMIN_AUTH] checkAdminPermission - Has permission:', hasPermission);
            
            if (!hasPermission) {
                //console.log('❌ [ADMIN_AUTH] checkAdminPermission - Permission denied');
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Required permission: ${permission}`
                });
            }

            //console.log('✅ [ADMIN_AUTH] checkAdminPermission - Permission granted');
            next();
        } catch (error) {
            //console.error('❌ [ADMIN_AUTH] checkAdminPermission - Error:', error);
            //console.error('❌ [ADMIN_AUTH] checkAdminPermission - Error stack:', error.stack);
            return res.status(500).json({
                success: false,
                message: 'Permission check failed.'
            });
        }
    };
};

// Check admin role
const checkAdminRole = (roles) => {
    return (req, res, next) => {
        try {
            if (!req.admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Admin authentication required.'
                });
            }

            const allowedRoles = Array.isArray(roles) ? roles : [roles];
            
            if (!allowedRoles.includes(req.admin.role)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
                });
            }

            next();
        } catch (error) {
            //console.error('Role check error:', error);
            return res.status(500).json({
                success: false,
                message: 'Role check failed.'
            });
        }
    };
};

// Rate limiting middleware for admin routes
const adminRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    const requests = new Map();

    return (req, res, next) => {
        const adminId = req.admin?.id || req.ip;
        const now = Date.now();
        const windowStart = now - windowMs;

        // Clean old entries
        for (const [key, data] of requests.entries()) {
            if (data.windowStart < windowStart) {
                requests.delete(key);
            }
        }

        // Get or create request data for this admin
        if (!requests.has(adminId)) {
            requests.set(adminId, {
                count: 0,
                windowStart: now
            });
        }

        const requestData = requests.get(adminId);

        // Reset window if needed
        if (requestData.windowStart < windowStart) {
            requestData.count = 0;
            requestData.windowStart = now;
        }

        // Check rate limit
        if (requestData.count >= maxRequests) {
            return res.status(429).json({
                success: false,
                message: 'Too many requests. Please try again later.',
                retryAfter: Math.ceil((requestData.windowStart + windowMs - now) / 1000)
            });
        }

        // Increment counter
        requestData.count++;
        requests.set(adminId, requestData);

        next();
    };
};

// Log admin activity
const logAdminActivity = (action, category = 'SYSTEM_MANAGEMENT') => {
    return async (req, res, next) => {
        try {
            //console.log('🔐 [ADMIN_AUTH] logAdminActivity - Starting...');
            //console.log('🔐 [ADMIN_AUTH] logAdminActivity - Action:', action);
            //console.log('🔐 [ADMIN_AUTH] logAdminActivity - Category:', category);
            
            // Store original res.json
            const originalJson = res.json;

            // Override res.json to log after response
            res.json = function(data) {
                // Log the activity asynchronously without blocking
                if (req.admin) {
                    try {
                        const { AdminAuditLog } = require('../schema');
                        
                        // Generate logId manually
                        const logId = `AUDIT_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
                        
                        // Map invalid actions to valid ones
                        const validAction = action === 'VIEW_DASHBOARD' ? 'VIEW_SENSITIVE_DATA' : action;
                        
                        // Fire and forget - don't wait for completion
                        AdminAuditLog.create({
                            logId,
                            adminId: req.admin.id,
                            adminEmail: req.admin.email,
                            adminRole: req.admin.role,
                            action: validAction,
                            category,
                            description: `${validAction} - ${req.method} ${req.originalUrl}`,
                            severity: 'low',
                            ipAddress: req.ip || req.connection.remoteAddress,
                            userAgent: req.get('User-Agent'),
                            endpoint: req.originalUrl,
                            method: req.method,
                            status: data.success ? 'success' : 'failed',
                            errorMessage: data.success ? null : data.message
                        }).catch(err => {
                            // Silently ignore audit log errors to prevent blocking
                            //console.error('❌ [ADMIN_AUTH] logAdminActivity - Silent audit log error:', err.message);
                        });
                    } catch (err) {
                        // Silently ignore any errors in audit logging
                        //console.error('❌ [ADMIN_AUTH] logAdminActivity - Silent audit setup error:', err.message);
                    }
                }

                // Call original json method
                return originalJson.call(this, data);
            };

            //console.log('✅ [ADMIN_AUTH] logAdminActivity - Middleware setup complete, calling next()');
            next();
        } catch (error) {
            //console.error('❌ [ADMIN_AUTH] logAdminActivity - Error:', error);
            //console.error('❌ [ADMIN_AUTH] logAdminActivity - Error stack:', error.stack);
            next();
        }
    };
};

// Validate admin session
const validateAdminSession = async (req, res, next) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'Admin authentication required.'
            });
        }

        // Check if admin session is still valid
        const admin = await AdminUser.findById(req.admin.id);
        
        if (!admin || admin.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Admin session is no longer valid.'
            });
        }

        // Update last activity
        admin.security.lastLogin = new Date();
        await admin.save();

        next();
    } catch (error) {
        //console.error('Session validation error:', error);
        return res.status(500).json({
            success: false,
            message: 'Session validation failed.'
        });
    }
};

module.exports = {
    verifyAdminToken,
    checkAdminPermission,
    checkAdminRole,
    adminRateLimit,
    logAdminActivity,
    noLogActivity,
    validateAdminSession
};