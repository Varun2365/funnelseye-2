const bcrypt = require('bcryptjs');
const { User, Coach, Otp, CoachHierarchyLevel } = require('../schema'); // Removed ExternalSponsor
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailConfigService = require('../services/emailConfigService');

// --- Helper Functions ---

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOtp = async (email, otp) => {
    try {
        const mailOptions = {
            to: email,
            subject: 'FunnelsEye: Your One-Time Password (OTP)',
            html: `
                <div style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7fa; padding: 20px 0;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 16px rgba(0,0,0,0.1);">
                        <div style="position: relative; height: 120px; background-color: #6a1b9a; padding-top: 20px; text-align: center;">
                            <h1 style="color: #ffffff; font-size: 32px; margin: 0; padding-bottom: 10px;">FunnelsEye</h1>
                            <p style="color: #ffffff; font-size: 16px; margin: 0;">Your Path to Growth</p>
                            <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 60px; fill: #f4f7fa;">
                                <path d="M0,32L120,42.7C240,53,480,75,720,74.7C960,75,1200,53,1320,42.7L1440,32L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z"></path>
                            </svg>
                        </div>
                        <div style="padding: 30px; text-align: center;">
                            <h2 style="color: #0056b3; font-size: 24px; margin-bottom: 20px;">Email Verification</h2>
                            <p style="font-size: 16px; margin-bottom: 25px;">Dear User,</p>
                            <p style="font-size: 18px; margin-bottom: 30px;">To complete your verification, please use the following One-Time Password (OTP):</p>
                            <div style="background-color: #e0f2f7; border: 1px solid #b3e5fc; border-radius: 10px; padding: 18px 30px; display: inline-block; margin-bottom: 30px;">
                                <h3 style="font-size: 38px; color: #e91e63; margin: 0; font-weight: bold; letter-spacing: 3px;">${otp}</h3>
                            </div>
                            <p style="font-size: 14px; color: #777; margin-top: 0;">This OTP is valid for 5 minutes. Please ensure you use it promptly.</p>
                            <p style="font-size: 14px; color: #777; margin-top: 15px;">If you did not request this OTP, please disregard this email.</p>
                            <p style="font-size: 16px; font-weight: bold; margin-top: 30px; color: #555;">Thank you,<br/>The FunnelsEye Team</p>
                        </div>
                        <div style="position: relative; height: 80px; background-color: #6a1b9a; padding: 10px 0; text-align: center;">
                            <p style="color: #ffffff; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} FunnelsEye. All rights reserved.</p>
                            <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0; width: 100%; height: 60px; fill: #ffffff; transform: rotateX(180deg);">
                                <path d="M0,32L120,42.7C240,53,480,75,720,74.7C960,75,1200,53,1320,42.7L1440,32L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            `
        };
        await emailConfigService.sendEmail(mailOptions);
        console.log(`OTP sent successfully to ${email}`);
        return true;
    } catch (error) {
        console.error(`Error sending OTP to ${email}:`, error.message);
        return false;
    }
};

const sendPasswordResetEmail = async (email, resetToken) => {
    try {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;
        
        const mailOptions = {
            to: email,
            subject: 'FunnelsEye: Password Reset Request',
            html: `
                <div style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7fa; padding: 20px 0;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 16px rgba(0,0,0,0.1);">
                        <div style="position: relative; height: 120px; background-color: #6a1b9a; padding-top: 20px; text-align: center;">
                            <h1 style="color: #ffffff; font-size: 32px; margin: 0; padding-bottom: 10px;">FunnelsEye</h1>
                            <p style="color: #ffffff; font-size: 16px; margin: 0;">Your Path to Growth</p>
                            <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 60px; fill: #f4f7fa;">
                                <path d="M0,32L120,42.7C240,53,480,75,720,74.7C960,75,1200,53,1320,42.7L1440,32L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z"></path>
                            </svg>
                        </div>
                        <div style="padding: 30px; text-align: center;">
                            <h2 style="color: #0056b3; font-size: 24px; margin-bottom: 20px;">Password Reset Request</h2>
                            <p style="font-size: 16px; margin-bottom: 25px;">Dear User,</p>
                            <p style="font-size: 18px; margin-bottom: 30px;">You requested a password reset for your FunnelsEye account. Click the button below to reset your password:</p>
                            <div style="margin-bottom: 30px;">
                                <a href="${resetUrl}" style="display: inline-block; background-color: #6a1b9a; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Reset Password</a>
                            </div>
                            <p style="font-size: 14px; color: #777; margin-top: 0;">This link is valid for 1 hour. If you did not request this password reset, please ignore this email.</p>
                            <p style="font-size: 14px; color: #777; margin-top: 15px;">For security reasons, this link will expire automatically.</p>
                            <p style="font-size: 16px; font-weight: bold; margin-top: 30px; color: #555;">Thank you,<br/>The FunnelsEye Team</p>
                        </div>
                        <div style="position: relative; height: 80px; background-color: #6a1b9a; padding: 10px 0; text-align: center;">
                            <p style="color: #ffffff; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} FunnelsEye. All rights reserved.</p>
                            <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0; width: 100%; height: 60px; fill: #ffffff; transform: rotateX(180deg);">
                                <path d="M0,32L120,42.7C240,53,480,75,720,74.7C960,75,1200,53,1320,42.7L1440,32L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            `
        };
        await emailConfigService.sendEmail(mailOptions);
        console.log(`Password reset email sent successfully to ${email}`);
        return true;
    } catch (error) {
        console.error(`Error sending password reset email to ${email}:`, error.message);
        return false;
    }
};

const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    // Remove password from user object
    user.password = undefined;

    // Convert user to plain object and remove password
    const userData = user.toObject ? user.toObject() : { ...user };
    delete userData.password;

    res.status(statusCode)
       .cookie('token', token, options)
       .json({
            success: true,
            token,
            user: userData
        });
};


// --- Authentication Controllers ---

const signup = async (req, res) => {
    const { 
        name, 
        email, 
        password, 
        role,
        // MLM hierarchy fields - required for coach role
        selfCoachId,
        currentLevel,
        sponsorId, // Only digital coach sponsors allowed
        teamRankName,
        presidentTeamRankName
    } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ success: false, message: 'Please enter all required fields: name, email, password, and role.' });
    }
    if (!['coach', 'admin', 'client', 'super_admin'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }

    // For coach role, require all hierarchy fields
    if (role === 'coach') {
        if (!selfCoachId) {
            return res.status(400).json({ success: false, message: 'Coach ID is required for coach role. Please provide your unique Coach ID.' });
        }
        if (!currentLevel || currentLevel < 1 || currentLevel > 12) {
            return res.status(400).json({ success: false, message: 'Valid hierarchy level (1-12) is required for coach role.' });
        }
        // TEMPORARILY DISABLED: Allow creating first coach without sponsor
        // if (!sponsorId) {
        //     return res.status(400).json({ success: false, message: 'Sponsor ID is required for coach role. Please select a digital coach as your sponsor.' });
        // }
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            if (!user.isVerified) {
                // User exists but not verified - auto-send OTP
                await Otp.deleteMany({ email });
                const otp = generateOtp();
                await Otp.create({ email, otp, createdAt: new Date(), expiresAt: new Date(Date.now() + 5 * 60 * 1000) });
                const otpSent = await sendOtp(email, otp);
                if (otpSent) {
                    return res.status(200).json({ 
                        success: true, 
                        otpSent: true,
                        needsVerification: true,
                        userId: user._id,
                        email: user.email,
                        message: 'User already exists but is not verified. A new OTP has been sent to your email for verification.' 
                    });
                } else {
                    return res.status(500).json({ 
                        success: false, 
                        otpSent: false,
                        message: 'User exists but failed to send OTP. Please try again.' 
                    });
                }
            }
            return res.status(400).json({ 
                success: false, 
                message: 'User with this email already exists and is verified. Please login.' 
            });
        }

        // Check if coach ID is already taken (only for coach role)
        if (role === 'coach') {
            const existingCoach = await User.findOne({ selfCoachId });
            if (existingCoach) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'This Coach ID is already taken. Please choose a different one.' 
                });
            }
        }

        // Prepare user data
        const userData = {
            name,
            email,
            password,
            role,
            isVerified: false
        };

        // Add MLM hierarchy fields only if role is 'coach'
        if (role === 'coach') {
            userData.selfCoachId = selfCoachId;
            userData.currentLevel = currentLevel;
            userData.hierarchyLocked = false; // Will be locked after first save
            
            // Add sponsor if provided (optional now)
            if (sponsorId) {
                // Look up sponsor by MongoDB ObjectId directly
                const sponsor = await User.findById(sponsorId);
                if (!sponsor || sponsor.role !== 'coach') {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Invalid sponsor ID. Please provide a valid coach ID.' 
                    });
                }
                userData.sponsorId = sponsor._id;
            }
            
            // Add optional team rank fields
            if (teamRankName) userData.teamRankName = teamRankName;
            if (presidentTeamRankName) userData.presidentTeamRankName = presidentTeamRankName;
        }

        // Create user with discriminator (Coach if role is 'coach')
        const newUser = await User.create(userData);
        
        // Auto-lock hierarchy for coaches after first save
        if (role === 'coach') {
            await autoLockHierarchy(newUser._id);
        }
        
        // Generate and send OTP
        const otp = generateOtp();
        await Otp.create({ email, otp, createdAt: new Date(), expiresAt: new Date(Date.now() + 5 * 60 * 1000) });

        const otpSent = await sendOtp(email, otp);

        if (otpSent) {
            res.status(201).json({
                success: true,
                otpSent: true,
                needsVerification: true,
                message: role === 'coach' 
                    ? 'Coach registered successfully with MLM hierarchy. An OTP has been sent to your email for verification.'
                    : 'User registered successfully. An OTP has been sent to your email for verification.',
                userId: newUser._id,
                email: newUser.email,
                role: newUser.role,
                ...(role === 'coach' && { 
                    selfCoachId: newUser.selfCoachId,
                    currentLevel: newUser.currentLevel,
                    sponsorId: newUser.sponsorId,
                    teamRankName: newUser.teamRankName,
                    presidentTeamRankName: newUser.presidentTeamRankName
                })
            });
        } else {
            res.status(500).json({ 
                success: false, 
                otpSent: false,
                message: 'User registered, but failed to send OTP. Please try resending OTP.' 
            });
        }

    } catch (error) {
        console.error('Error during signup:', error.message);
        if (error.code === 11000) {
            if (error.keyPattern && error.keyPattern.selfCoachId) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'This Coach ID is already taken. Please choose a different one.' 
                });
            }
            return res.status(409).json({ success: false, message: 'User with this email already exists.' });
        }
        res.status(500).json({ success: false, message: 'Server error during signup.' });
    }
};

const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'Email and OTP are required for verification.' });
    }
    try {
        const otpRecord = await Otp.findOne({ email, otp });
        if (!otpRecord) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found for this email.' });
        }
        
        // Use findOneAndUpdate to avoid validation issues with required fields like selfCoachId
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { $set: { isVerified: true } },
            { new: true, runValidators: true }
        );
        
        if (!updatedUser) {
            return res.status(500).json({ success: false, message: 'Failed to update user verification status.' });
        }
        
        await Otp.deleteOne({ email });
        sendTokenResponse(user, 200, res);
    } catch (error) {
        console.error('Error during OTP verification:', error.message);
        res.status(500).json({ success: false, message: 'Server error during OTP verification.' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please enter both email and password.' });
    }
    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials.' });
        }
        
        // Verify password first
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials.' });
        }
        
        // If user is not verified, auto-send OTP
        if (!user.isVerified) {
            // Delete old OTPs and generate new one
            await Otp.deleteMany({ email });
            const otp = generateOtp();
            await Otp.create({ email, otp, createdAt: new Date(), expiresAt: new Date(Date.now() + 5 * 60 * 1000) });
            const otpSent = await sendOtp(email, otp);
            
            return res.status(403).json({ 
                success: false, 
                otpSent: otpSent,
                needsVerification: true,
                userId: user._id,
                email: user.email,
                message: otpSent 
                    ? 'Your account is not verified. An OTP has been sent to your email for verification.'
                    : 'Your account is not verified. Failed to send OTP. Please try resending OTP.'
            });
        }
        
        // User is verified, send token
        sendTokenResponse(user, 200, res);
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
};

const getMe = async (req, res) => {
    try {
        // CRITICAL FIX: Use req.userId (the actual logged-in user) instead of req.coachId
        // req.coachId is the coach's ID for staff, but req.userId is always the logged-in user's ID
        const userId = req.userId || req.user?._id;
        
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated.' });
        }

        const user = await User.findById(userId)
            .populate('sponsorId', 'name email selfCoachId currentLevel')
            .populate('coachId', 'name email'); // Populate coach info if user is staff
            
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Convert user to plain object and remove password
        const userData = user.toObject();
        delete userData.password;

        // Log for debugging
        console.log(`[getMe] Returning user data for ${userData.role}: ${userData.email || userData.name} (ID: ${userData._id})`);

        res.status(200).json({ success: true, user: userData });
    } catch (err) {
        console.error("GetMe error:", err);
        res.status(500).json({ success: false, message: 'Server Error fetching user data.' });
    }
};

const logout = (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email address.'
            });
        }

        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No user found with that email address.'
            });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        // Create reset url
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password/${resetToken}`;

        try {
            await sendPasswordResetEmail(email, resetToken);
            
            res.status(200).json({
                success: true,
                message: 'Password reset email sent successfully.'
            });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({
                success: false,
                message: 'Email could not be sent. Please try again.'
            });
        }
    } catch (error) {
        console.error('Error in forgot password:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error during password reset request.'
        });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.body.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token.'
            });
        }

        // Set new password - password will be hashed by pre-save hook
        // Ensure user document is complete (re-fetch to ensure all fields including selfCoachId are present)
        const userToUpdate = await User.findById(user._id);
        if (!userToUpdate) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        
        userToUpdate.password = req.body.password;
        userToUpdate.resetPasswordToken = undefined;
        userToUpdate.resetPasswordExpire = undefined;
        await userToUpdate.save();

        // Send token response
        sendTokenResponse(userToUpdate, 200, res);
    } catch (error) {
        console.error('Error in reset password:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error during password reset.'
        });
    }
};

// @desc    Request password reset OTP
// @route   POST /api/auth/forgot-password-otp
// @access  Public
const forgotPasswordOtp = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email address.'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No user found with that email address.'
            });
        }

        // Generate OTP
        const otp = generateOtp();
        
        // Delete any existing OTP for this email first
        await Otp.findOneAndDelete({ email: email.toLowerCase().trim() });
        
        // Save new OTP to database (schema has TTL of 5 minutes via createdAt)
        await Otp.create({
            email: email.toLowerCase().trim(),
            otp
        });

        // Send OTP email with password reset specific styling
        const mailOptions = {
            to: email,
            subject: 'FunnelsEye: Password Reset OTP',
            html: `
                <div style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7fa; padding: 20px 0;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 16px rgba(0,0,0,0.1);">
                        <div style="position: relative; height: 120px; background-color: #6a1b9a; padding-top: 20px; text-align: center;">
                            <h1 style="color: #ffffff; font-size: 32px; margin: 0; padding-bottom: 10px;">FunnelsEye</h1>
                            <p style="color: #ffffff; font-size: 16px; margin: 0;">Your Path to Growth</p>
                            <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 60px; fill: #f4f7fa;">
                                <path d="M0,32L120,42.7C240,53,480,75,720,74.7C960,75,1200,53,1320,42.7L1440,32L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z"></path>
                            </svg>
                        </div>
                        <div style="padding: 30px; text-align: center;">
                            <h2 style="color: #0056b3; font-size: 24px; margin-bottom: 20px;">Password Reset Request</h2>
                            <p style="font-size: 16px; margin-bottom: 25px;">Dear User,</p>
                            <p style="font-size: 18px; margin-bottom: 30px;">You requested a password reset for your FunnelsEye account. Use the following OTP to reset your password:</p>
                            <div style="background-color: #e0f2f7; border: 1px solid #b3e5fc; border-radius: 10px; padding: 18px 30px; display: inline-block; margin-bottom: 30px;">
                                <h3 style="font-size: 38px; color: #e91e63; margin: 0; font-weight: bold; letter-spacing: 3px;">${otp}</h3>
                            </div>
                            <p style="font-size: 14px; color: #777; margin-top: 0;">This OTP is valid for 5 minutes. Please ensure you use it promptly.</p>
                            <p style="font-size: 14px; color: #777; margin-top: 15px;">If you did not request this password reset, please ignore this email.</p>
                            <p style="font-size: 16px; font-weight: bold; margin-top: 30px; color: #555;">Thank you,<br/>The FunnelsEye Team</p>
                        </div>
                        <div style="position: relative; height: 80px; background-color: #6a1b9a; padding: 10px 0; text-align: center;">
                            <p style="color: #ffffff; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} FunnelsEye. All rights reserved.</p>
                            <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0; width: 100%; height: 60px; fill: #ffffff; transform: rotateX(180deg);">
                                <path d="M0,32L120,42.7C240,53,480,75,720,74.7C960,75,1200,53,1320,42.7L1440,32L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            `
        };
        
        await emailConfigService.sendEmail(mailOptions);
        console.log(`Password reset OTP sent successfully to ${email}`);

        res.status(200).json({
            success: true,
            message: 'Password reset OTP sent to your email address.'
        });
    } catch (error) {
        console.error('Error in forgot password OTP:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error during password reset request.'
        });
    }
};

// @desc    Verify password reset OTP
// @route   POST /api/auth/verify-password-reset-otp
// @access  Public
const verifyPasswordResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and OTP.'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Find OTP record (TTL is handled by MongoDB, createdAt expires after 5 minutes)
        const otpRecord = await Otp.findOne({ 
            email: normalizedEmail, 
            otp: otp.toString()
        });

        console.log('Looking for OTP:', { email: normalizedEmail, otp: otp.toString() });
        console.log('Found OTP record:', otpRecord);

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP.'
            });
        }

        // Generate a temporary reset token for the password change step
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // Store the reset token temporarily
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        // Hash the token and store it
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save({ validateBeforeSave: false });

        // Delete the OTP record as it's been used
        await Otp.findOneAndDelete({ email: normalizedEmail });

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully.',
            resetToken: resetToken
        });
    } catch (error) {
        console.error('Error in verify password reset OTP:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error during OTP verification.'
        });
    }
};

// @desc    Reset password with OTP-verified token
// @route   POST /api/auth/reset-password-with-otp
// @access  Public
const resetPasswordWithOtp = async (req, res) => {
    try {
        const { resetToken, newPassword, confirmPassword } = req.body;
        
        if (!resetToken || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide reset token and new password.'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match.'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long.'
            });
        }

        // Hash the provided token
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token.'
            });
        }

        // Update password
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successfully. You can now login with your new password.'
        });
    } catch (error) {
        console.error('Error in reset password with OTP:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error during password reset.'
        });
    }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email address.'
            });
        }

        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No user found with that email address.'
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'User is already verified.'
            });
        }

        // Delete existing OTP
        await Otp.deleteMany({ email });

        // Generate new OTP
        const otp = generateOtp();
        await Otp.create({ 
            email, 
            otp, 
            createdAt: new Date(), 
            expiresAt: new Date(Date.now() + 5 * 60 * 1000) 
        });

        // Send new OTP
        const otpSent = await sendOtp(email, otp);
        
        if (otpSent) {
            res.status(200).json({
                success: true,
                message: 'New OTP sent successfully to your email.'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send OTP. Please try again.'
            });
        }
    } catch (error) {
        console.error('Error in resend OTP:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error during OTP resend.'
        });
    }
};

const upgradeToCoach = async (req, res) => {
    const { 
        userId,
        selfCoachId, // Required from client
        currentLevel, // Required from client
        sponsorId, // Only digital coach sponsors allowed
        teamRankName,
        presidentTeamRankName
    } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required.' });
    }

    if (!selfCoachId) {
        return res.status(400).json({ success: false, message: 'Coach ID is required. Please provide your unique coach ID.' });
    }

    if (!currentLevel || currentLevel < 1 || currentLevel > 12) {
        return res.status(400).json({ success: false, message: 'Valid hierarchy level (1-12) is required.' });
    }

    // if (!sponsorId) {
    //     return res.status(400).json({ success: false, message: 'Sponsor ID is required. Please select a digital coach as your sponsor.' });
    // }

    try {
        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Check if user is already a coach
        if (user.role === 'coach') {
            return res.status(400).json({ success: false, message: 'User is already a coach.' });
        }

        // Check if user is verified
        if (!user.isVerified) {
            return res.status(400).json({ success: false, message: 'User must be verified before becoming a coach.' });
        }

        // Check if the provided coach ID is already taken
        const existingCoach = await User.findOne({ selfCoachId });
        if (existingCoach) {
            return res.status(400).json({ 
                success: false, 
                message: 'This Coach ID is already taken. Please choose a different one.' 
            });
        }
        
        console.log(`User ${user.email} is upgrading to coach with ID: ${selfCoachId}`);
        
        // Use findOneAndUpdate to set all required coach fields at once
        // This ensures all required fields (selfCoachId, currentLevel) are set together
        const updateData = {
            role: 'coach',
            status: 'under_review', // Set to under review for admin approval
            selfCoachId: selfCoachId,
            currentLevel: currentLevel,
            hierarchyLocked: false
        };
        
        // Look up sponsor by selfCoachId and convert to MongoDB ObjectId
        // if (sponsorId) {
        //     const sponsor = await User.findOne({ selfCoachId: sponsorId, role: 'coach' });
        //     if (!sponsor) {
        //         return res.status(400).json({ 
        //             success: false, 
        //             message: `Sponsor with Coach ID "${sponsorId}" not found. Please enter a valid Coach ID.` 
        //         });
        //     }
        //     updateData.sponsorId = sponsor._id; // Use MongoDB ObjectId
        // }
        
        // Add optional team rank fields
        // if (teamRankName) updateData.teamRankName = teamRankName;
        // if (presidentTeamRankName) updateData.presidentTeamRankName = presidentTeamRankName;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to upgrade user to coach.' 
            });
        }

        // Auto-lock hierarchy after upgrade
        await autoLockHierarchy(updatedUser._id);

        res.status(200).json({
            success: true,
            message: 'User successfully upgraded to coach with MLM hierarchy!',
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                selfCoachId: updatedUser.selfCoachId,
                currentLevel: updatedUser.currentLevel,
                sponsorId: updatedUser.sponsorId,
                teamRankName: updatedUser.teamRankName,
                presidentTeamRankName: updatedUser.presidentTeamRankName
            },
            message: 'You can now build your downline and earn commissions!'
        });

    } catch (error) {
        console.error('Error upgrading user to coach:', error.message);
        
        // Handle specific duplicate key error
        if (error.code === 11000) {
            if (error.keyPattern && error.keyPattern.selfCoachId) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'This Coach ID is already taken. Please choose a different one.' 
                });
            }
        }
        
        res.status(500).json({ success: false, message: 'Server error during coach upgrade.' });
    }
};

// @desc    Lock hierarchy after first save (non-editable)
// @route   POST /api/auth/lock-hierarchy
// @access  Private (Coach)
const lockHierarchy = async (req, res) => {
    try {
        const { coachId } = req.body;
        
        if (!coachId) {
            return res.status(400).json({ success: false, message: 'Coach ID is required.' });
        }

        // Find the coach
        const coach = await User.findById(coachId);
        if (!coach) {
            return res.status(404).json({ success: false, message: 'Coach not found.' });
        }

        // Check if user is a coach
        if (coach.role !== 'coach') {
            return res.status(400).json({ success: false, message: 'User is not a coach.' });
        }

        // Check if hierarchy is already locked
        if (coach.hierarchyLocked) {
            return res.status(400).json({ success: false, message: 'Hierarchy is already locked.' });
        }

        // Lock the hierarchy
        coach.hierarchyLocked = true;
        coach.hierarchyLockedAt = new Date();
        await coach.save();

        res.status(200).json({
            success: true,
            message: 'Hierarchy locked successfully. Changes can only be made through admin request.',
            data: {
                hierarchyLocked: true,
                hierarchyLockedAt: coach.hierarchyLockedAt
            }
        });

    } catch (error) {
        console.error('Error locking hierarchy:', error.message);
        res.status(500).json({ success: false, message: 'Server error during hierarchy lock.' });
    }
};

// @desc    Auto-lock hierarchy after first save (called internally)
// @access  Private
const autoLockHierarchy = async (coachId) => {
    try {
        const coach = await User.findById(coachId);
        if (coach && coach.role === 'coach' && !coach.hierarchyLocked) {
            coach.hierarchyLocked = true;
            coach.hierarchyLockedAt = new Date();
            await coach.save();
            console.log(`✅ Hierarchy auto-locked for coach: ${coach.email}`);
        }
    } catch (error) {
        console.error('Error auto-locking hierarchy:', error.message);
    }
};

// @desc    Get available sponsors for coach signup dropdown
// @route   GET /api/auth/available-sponsors
// @access  Public
const getAvailableSponsors = async (req, res) => {
    try {
        // Get all verified coaches who can be sponsors (only digital coaches)
        const sponsors = await User.find({ 
            role: 'coach', 
            isVerified: true,
            isActive: true 
        }).select('name email selfCoachId currentLevel teamRankName');

        res.status(200).json({
            success: true,
            message: 'Available sponsors retrieved successfully.',
            data: {
                digitalSponsors: sponsors,
                message: 'Only digital coaches can be sponsors. External sponsors are not supported.'
            }
        });

    } catch (error) {
        console.error('Error getting available sponsors:', error.message);
        res.status(500).json({ success: false, message: 'Server error getting available sponsors.' });
    }
};

// @desc    Get coach ranks for signup dropdown
// @route   GET /api/auth/coach-ranks
// @access  Public
const getCoachRanks = async (req, res) => {
    try {
        // Get all active coach ranks
        const ranks = await CoachHierarchyLevel.find({ 
            isActive: true 
        }).select('level name description').sort('level');

        res.status(200).json({
            success: true,
            message: 'Coach ranks retrieved successfully.',
            data: ranks
        });

    } catch (error) {
        console.error('Error getting coach ranks:', error.message);
        res.status(500).json({ success: false, message: 'Server error getting coach ranks.' });
    }
};


// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated.' });
        }

        const {
            name,
            bio,
            tagline,
            company,
            phone,
            country,
            city,
            state,
            zipCode,
            address,
            website,
            linkedin,
            twitter,
            facebook,
            instagram,
            youtube,
            age,
            dateOfBirth
        } = req.body;

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Build update object with only provided fields
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio;
        if (tagline !== undefined) updateData.tagline = tagline;
        if (company !== undefined) updateData.company = company;
        if (phone !== undefined) updateData.phone = phone;
        if (country !== undefined) updateData.country = country;
        if (city !== undefined) updateData.city = city;
        if (state !== undefined) updateData.state = state;
        if (zipCode !== undefined) updateData.zipCode = zipCode;
        if (address !== undefined) updateData.address = address;
        if (website !== undefined) updateData.website = website;
        if (linkedin !== undefined) updateData.linkedin = linkedin;
        if (twitter !== undefined) updateData.twitter = twitter;
        if (facebook !== undefined) updateData.facebook = facebook;
        if (instagram !== undefined) updateData.instagram = instagram;
        if (youtube !== undefined) updateData.youtube = youtube;
        if (dateOfBirth !== undefined) {
            updateData.dateOfBirth = dateOfBirth;
            // Calculate age from date of birth
            if (dateOfBirth) {
                const birthDate = new Date(dateOfBirth);
                const today = new Date();
                let calculatedAge = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    calculatedAge--;
                }
                updateData.age = calculatedAge;
            }
        } else if (age !== undefined) {
            updateData.age = age;
        }

        // Use findOneAndUpdate to avoid validation issues with required fields like selfCoachId
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found or update failed.' });
        }

        const userData = updatedUser.toObject();
        delete userData.password;

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully.',
            user: userData
        });
    } catch (error) {
        console.error('Error updating profile:', error.message);
        res.status(500).json({ success: false, message: 'Server error updating profile.' });
    }
};

// @desc    Update profile picture
// @route   PUT /api/auth/profile/picture
// @access  Private
const updateProfilePicture = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated.' });
        }

        const { profilePicture } = req.body;

        if (!profilePicture) {
            return res.status(400).json({ success: false, message: 'Profile picture URL is required.' });
        }

        // Use findOneAndUpdate to avoid validation issues with required fields like selfCoachId
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { profilePicture } },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found or update failed.' });
        }

        const userData = updatedUser.toObject();
        delete userData.password;

        res.status(200).json({
            success: true,
            message: 'Profile picture updated successfully.',
            user: userData
        });
    } catch (error) {
        console.error('Error updating profile picture:', error.message);
        res.status(500).json({ success: false, message: 'Server error updating profile picture.' });
    }
};

// @desc    Update achievements
// @route   PUT /api/auth/profile/achievements
// @access  Private
const updateAchievements = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated.' });
        }

        const { achievements } = req.body;

        if (!Array.isArray(achievements)) {
            return res.status(400).json({ success: false, message: 'Achievements must be an array.' });
        }

        if (achievements.length > 4) {
            return res.status(400).json({ success: false, message: 'Maximum 4 achievements allowed.' });
        }

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Validate each achievement
        for (const achievement of achievements) {
            if (!achievement.title || achievement.title.trim() === '') {
                return res.status(400).json({ success: false, message: 'Each achievement must have a title.' });
            }
        }

        // Use findOneAndUpdate to avoid validation issues with required fields like selfCoachId
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { achievements } },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found or update failed.' });
        }

        const userData = updatedUser.toObject();
        delete userData.password;

        res.status(200).json({
            success: true,
            message: 'Achievements updated successfully.',
            user: userData
        });
    } catch (error) {
        console.error('Error updating achievements:', error.message);
        res.status(500).json({ success: false, message: 'Server error updating achievements.' });
    }
};

// @desc    Update experiences
// @route   PUT /api/auth/profile/experiences
// @access  Private
const updateExperiences = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated.' });
        }

        const { experiences } = req.body;

        if (!Array.isArray(experiences)) {
            return res.status(400).json({ success: false, message: 'Experiences must be an array.' });
        }

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Validate each experience
        for (const experience of experiences) {
            if (!experience.company || experience.company.trim() === '') {
                return res.status(400).json({ success: false, message: 'Each experience must have a company name.' });
            }
            if (!experience.position || experience.position.trim() === '') {
                return res.status(400).json({ success: false, message: 'Each experience must have a position/title.' });
            }
            if (!experience.startDate) {
                return res.status(400).json({ success: false, message: 'Each experience must have a start date.' });
            }
            // If not current, endDate should be provided
            if (!experience.isCurrent && !experience.endDate) {
                return res.status(400).json({ success: false, message: 'End date is required if not current position.' });
            }
        }

        // Use findOneAndUpdate to avoid validation issues with required fields like selfCoachId
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { experiences } },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found or update failed.' });
        }

        const userData = updatedUser.toObject();
        delete userData.password;

        res.status(200).json({
            success: true,
            message: 'Experiences updated successfully.',
            user: userData
        });
    } catch (error) {
        console.error('Error updating experiences:', error.message);
        res.status(500).json({ success: false, message: 'Server error updating experiences.' });
    }
};

module.exports = {
    signup,
    verifyOtp,
    login,
    getMe,
    logout,
    forgotPassword,
    resetPassword,
    forgotPasswordOtp,
    verifyPasswordResetOtp,
    resetPasswordWithOtp,
    resendOtp,
    upgradeToCoach,
    lockHierarchy,
    updateProfile,
    updateProfilePicture,
    updateAchievements,
    updateExperiences,
    // Helper functions for other controllers
    generateOtp,
    sendOtp,
    getAvailableSponsors,
    getCoachRanks,
    autoLockHierarchy
};