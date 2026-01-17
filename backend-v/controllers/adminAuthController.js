const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { AdminUser, AdminAuditLog } = require('../schema');

// Helper function for generating JWT tokens
function generateToken(adminId, role) {
    return jwt.sign(
        { 
            adminId, 
            role,
            type: 'admin'
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' } // Extended to 7 days instead of 24h
    );
}


// Helper function for creating audit logs
async function createAuditLog(adminId, action, details, req) {
    try {
        let adminEmail = 'unknown';
        let adminRole = 'unknown';
        
        if (adminId) {
            const admin = await AdminUser.findById(adminId);
            if (admin) {
                adminEmail = admin.email;
                adminRole = admin.role;
            }
        }

        // Generate logId manually
        const logId = `AUDIT_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        await AdminAuditLog.create({
            logId,
            adminId: adminId || null,
            adminEmail,
            adminRole,
            action,
            category: 'AUTHENTICATION',
            description: details.description,
            severity: details.severity || 'medium',
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            endpoint: req.originalUrl,
            method: req.method,
            status: details.status || 'success',
            errorMessage: details.errorMessage,
            metadata: {
                browser: req.get('User-Agent'),
                sessionId: req.sessionID
            }
        });
    } catch (error) {
        console.error('Error creating audit log:', error);
    }
}

// ===== ADMIN AUTHENTICATION CONTROLLER =====

class AdminAuthController {
    




    // @desc    Admin login
    // @route   POST /api/admin/auth/login
    // @access  Public
    async login(req, res) {
        try {
            console.log('🔐 [BACKEND] Admin login request received');
            console.log('🔐 [BACKEND] Request body:', req.body);
            console.log('🔐 [BACKEND] Request headers:', req.headers);
            console.log('🔐 [BACKEND] Request IP:', req.ip);
            console.log('🔐 [BACKEND] Request User-Agent:', req.get('User-Agent'));

            const { email, password, rememberMe } = req.body;

            // Validate input
            console.log('🔐 [BACKEND] Validating input - Email:', email, 'Password length:', password ? password.length : 0);
            
            if (!email || !password) {
                console.log('🔐 [BACKEND] Validation failed - missing email or password');
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }
            
            console.log('🔐 [BACKEND] Input validation passed');

            // Find admin user
            console.log('🔐 [BACKEND] Looking for admin user with email:', email);
            const admin = await AdminUser.findByEmail(email);
            console.log('🔐 [BACKEND] Admin user lookup result:', admin ? 'Found' : 'Not found');
            
            if (!admin) {
                console.log('🔐 [BACKEND] Admin user not found, creating audit log');
                await createAuditLog(null, 'LOGIN_FAILED', {
                    description: `Failed login attempt for email: ${email}`,
                    severity: 'medium',
                    status: 'failed',
                    errorMessage: 'Admin not found'
                }, req);

                console.log('🔐 [BACKEND] Returning 401 - Admin not found');
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }
            
            console.log('🔐 [BACKEND] Admin user found:', admin.email, 'Role:', admin.role, 'Status:', admin.status);

            // Check if account is locked
            if (admin.isLocked()) {
                await createAuditLog(admin._id, 'LOGIN_FAILED', {
                    description: `Login attempt on locked account: ${email}`,
                    severity: 'high',
                    status: 'failed',
                    errorMessage: 'Account is locked due to too many failed attempts'
                }, req);

                return res.status(423).json({
                    success: false,
                    message: 'Account is temporarily locked due to too many failed login attempts. Please try again later.'
                });
            }

            // Check if account is active
            if (admin.status !== 'active') {
                await createAuditLog(admin._id, 'LOGIN_FAILED', {
                    description: `Login attempt on inactive account: ${email}`,
                    severity: 'medium',
                    status: 'failed',
                    errorMessage: `Account status: ${admin.status}`
                }, req);

                return res.status(401).json({
                    success: false,
                    message: 'Account is not active. Please contact system administrator.'
                });
            }

            // Check if email is verified
            if (!admin.isEmailVerified) {
                await createAuditLog(admin._id, 'LOGIN_FAILED', {
                    description: `Login attempt with unverified email: ${email}`,
                    severity: 'medium',
                    status: 'failed',
                    errorMessage: 'Email not verified'
                }, req);

                return res.status(401).json({
                    success: false,
                    message: 'Please verify your email before logging in.'
                });
            }

            // Verify password
            console.log('🔐 [BACKEND] Verifying password for admin:', admin.email);
            const isPasswordValid = await admin.comparePassword(password);
            console.log('🔐 [BACKEND] Password verification result:', isPasswordValid);
            
            if (!isPasswordValid) {
                console.log('🔐 [BACKEND] Password invalid, incrementing login attempts');
                await admin.incrementLoginAttempts();
                
                console.log('🔐 [BACKEND] Creating audit log for failed password');
                await createAuditLog(admin._id, 'LOGIN_FAILED', {
                    description: `Invalid password for email: ${email}`,
                    severity: 'medium',
                    status: 'failed',
                    errorMessage: 'Invalid password'
                }, req);

                console.log('🔐 [BACKEND] Returning 401 - Invalid password');
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }
            
            console.log('🔐 [BACKEND] Password verified successfully');

            // Reset login attempts on successful login
            await admin.resetLoginAttempts();

            // Update last login info
            await AdminUser.findByIdAndUpdate(admin._id, {
                'security.lastLogin': new Date(),
                'security.lastLoginIP': req.ip || req.connection.remoteAddress
            });

            // Generate token
            console.log('🔐 [ADMIN_LOGIN] Generating token for admin:', admin.email);
            console.log('🔐 [ADMIN_LOGIN] Admin ID:', admin._id);
            console.log('🔐 [ADMIN_LOGIN] Admin role:', admin.role);
            console.log('🔐 [ADMIN_LOGIN] JWT_SECRET present:', !!process.env.JWT_SECRET);
            console.log('🔐 [ADMIN_LOGIN] JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
            
            const token = generateToken(admin._id, admin.role);
            
            console.log('🔐 [ADMIN_LOGIN] Token generated successfully');
            console.log('🔐 [ADMIN_LOGIN] Token length:', token.length);
            console.log('🔐 [ADMIN_LOGIN] Token preview:', token.substring(0, 20) + '...');
            
            // Decode the token to verify its contents
            try {
                const decoded = jwt.decode(token, { complete: true });
                console.log('🔐 [ADMIN_LOGIN] Generated token header:', decoded?.header);
                console.log('🔐 [ADMIN_LOGIN] Generated token payload:', decoded?.payload);
                console.log('🔐 [ADMIN_LOGIN] Token issued at:', decoded?.payload?.iat ? new Date(decoded.payload.iat * 1000).toISOString() : 'N/A');
                console.log('🔐 [ADMIN_LOGIN] Token expires at:', decoded?.payload?.exp ? new Date(decoded.payload.exp * 1000).toISOString() : 'N/A');
            } catch (decodeError) {
                console.log('❌ [ADMIN_LOGIN] Failed to decode generated token:', decodeError.message);
            }

            // Create session token
            const sessionToken = crypto.randomBytes(32).toString('hex');
            const expiresAt = rememberMe ? 
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : // 30 days
                new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            await AdminUser.findByIdAndUpdate(admin._id, {
                $push: {
                    'security.sessionTokens': {
                        token: sessionToken,
                        createdAt: new Date(),
                        expiresAt,
                        ipAddress: req.ip || req.connection.remoteAddress,
                        userAgent: req.get('User-Agent')
                    }
                }
            });

            // Create successful login audit log
            await createAuditLog(admin._id, 'LOGIN', {
                description: `Successful login for admin: ${admin.email}`,
                severity: 'low',
                status: 'success'
            }, req);

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    token,
                    sessionToken,
                    admin: admin.toSafeObject(),
                    expiresAt
                }
            });

        } catch (error) {
            console.error('Admin login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // @desc    Admin logout
    // @route   POST /api/admin/auth/logout
    // @access  Private (Admin)
    async logout(req, res) {
        try {
            const { sessionToken } = req.body;
            const adminId = req.admin.id;

            // Remove session token
            if (sessionToken) {
                await AdminUser.findByIdAndUpdate(adminId, {
                    $pull: {
                        'security.sessionTokens': { token: sessionToken }
                    }
                });
            }

            // Create logout audit log
            await createAuditLog(adminId, 'LOGOUT', {
                description: `Admin logout: ${req.admin.email}`,
                severity: 'low',
                status: 'success'
            }, req);

            res.json({
                success: true,
                message: 'Logout successful'
            });

        } catch (error) {
            console.error('Admin logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // @desc    Get current admin profile
    // @route   GET /api/admin/auth/profile
    // @access  Private (Admin)
    async getProfile(req, res) {
        try {
            const admin = await AdminUser.findById(req.admin.id).select('-password -passwordHistory');
            
    if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: 'Admin not found'
                });
            }

            res.json({
                success: true,
                message: 'Profile retrieved successfully',
                data: admin.toSafeObject()
            });

        } catch (error) {
            console.error('Get admin profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // @desc    Update admin profile
    // @route   PUT /api/admin/auth/profile
    // @access  Private (Admin)
    async updateProfile(req, res) {
        try {
            const { firstName, lastName, phone, timezone, language, notifications } = req.body;
            const adminId = req.admin.id;

            const updateData = {};
            if (firstName) updateData.firstName = firstName;
            if (lastName) updateData.lastName = lastName;
            if (phone) updateData.phone = phone;
            if (timezone) updateData.timezone = timezone;
            if (language) updateData.language = language;
            if (notifications) updateData.notifications = notifications;

            updateData.lastModifiedBy = adminId;

            const admin = await AdminUser.findByIdAndUpdate(
                adminId,
                updateData,
                { new: true, runValidators: true }
            ).select('-password -passwordHistory');

            // Create audit log
            await createAuditLog(adminId, 'UPDATE_PROFILE', {
                description: `Admin profile updated: ${admin.email}`,
                severity: 'low',
                status: 'success',
                changes: {
                    fieldsChanged: Object.keys(updateData)
                }
            }, req);

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: admin.toSafeObject()
            });

        } catch (error) {
            console.error('Update admin profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // @desc    Change password
    // @route   PUT /api/admin/auth/change-password
    // @access  Private (Admin)
    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword, confirmPassword } = req.body;
            const adminId = req.admin.id;

            // Validate input
            if (!currentPassword || !newPassword || !confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password, new password, and confirmation are required'
                });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'New password and confirmation do not match'
                });
            }

            // Get admin
            const admin = await AdminUser.findById(adminId);
            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: 'Admin not found'
                });
            }

            // Verify current password
            const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
            if (!isCurrentPasswordValid) {
                await createAuditLog(adminId, 'CHANGE_PASSWORD_FAILED', {
                    description: `Failed password change attempt for admin: ${admin.email}`,
                    severity: 'medium',
                    status: 'failed',
                    errorMessage: 'Invalid current password'
                }, req);

                return res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Check if new password is in history
            const isInHistory = await admin.isPasswordInHistory(newPassword);
            if (isInHistory) {
                return res.status(400).json({
                    success: false,
                    message: 'New password cannot be the same as one of your last 5 passwords'
                });
            }

            // Update password
            admin.password = newPassword;
            admin.security.lastPasswordChange = new Date();
            await admin.save();

            // Create audit log
            await createAuditLog(adminId, 'CHANGE_PASSWORD', {
                description: `Password changed successfully for admin: ${admin.email}`,
                severity: 'medium',
                status: 'success'
            }, req);

            res.json({
                success: true,
                message: 'Password changed successfully'
            });

        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // @desc    Verify token
    // @route   GET /api/admin/auth/verify
    // @access  Private (Admin)
    async verifyToken(req, res) {
        try {
            const admin = await AdminUser.findById(req.admin.id).select('-password -passwordHistory');
            
            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: 'Admin not found'
                });
            }

            res.json({
        success: true,
                message: 'Token is valid',
        data: {
                    admin: admin.toSafeObject(),
                    permissions: admin.permissions
                }
            });

        } catch (error) {
            console.error('Verify token error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // @desc    Refresh token
    // @route   POST /api/admin/auth/refresh
    // @access  Private (Admin)
    async refreshToken(req, res) {
        try {
            const adminId = req.admin.id;
            const admin = await AdminUser.findById(adminId);
            
            if (!admin || admin.status !== 'active') {
                return res.status(401).json({
                    success: false,
                    message: 'Admin not found or inactive'
                });
            }

            // Generate new token
            const token = generateToken(adminId, admin.role);

            res.json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    token,
                    expiresIn: '7d'
                }
            });

        } catch (error) {
            console.error('Refresh token error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
}

// Create controller instance
const adminAuthController = new AdminAuthController();

// Export both the controller instance and the generateToken function
module.exports = adminAuthController;
module.exports.generateToken = generateToken;
