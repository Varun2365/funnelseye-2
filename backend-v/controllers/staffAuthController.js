const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/async');
const User = require('../schema/User');

// @desc    Staff login
// @route   POST /api/staffv2/auth/staff-login
// @access  Public
exports.staffLogin = asyncHandler(async (req, res, next) => {
    console.log('🔍 [Staff Login] Route reached!');
    console.log('🔍 [Staff Login] Request body:', req.body);
    console.log('🔍 [Staff Login] Request headers:', req.headers);
    
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide an email and password'
        });
    }

    // Check for staff user
    console.log('🔍 [Staff Login] Looking for staff user with email:', email);
    const staff = await User.findOne({ email, role: 'staff' }).select('+password');
    console.log('🔍 [Staff Login] Staff user found:', !!staff);
    console.log('🔍 [Staff Login] Staff user ID:', staff?._id);
    console.log('🔍 [Staff Login] Staff user name:', staff?.name);

    if (!staff) {
        console.log('❌ [Staff Login] No staff user found with email:', email);
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }

    // Check if password matches
    console.log('🔍 [Staff Login] Checking password match...');
    console.log('🔍 [Staff Login] Staff has matchPassword method:', typeof staff.matchPassword);
    
    const isMatch = await staff.matchPassword(password);
    console.log('🔍 [Staff Login] Password match result:', isMatch);

    if (!isMatch) {
        console.log('❌ [Staff Login] Password does not match');
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }

    // Check if staff user has coachId
    if (!staff.coachId) {
        return res.status(400).json({
            success: false,
            message: 'Staff user is not properly linked to a coach. Please contact your administrator.'
        });
    }

    // Create token
    const token = jwt.sign(
        { 
            id: staff._id,
            role: staff.role,
            coachId: staff.coachId
        },
        process.env.JWT_SECRET || 'your-secret-key',
        {
            expiresIn: process.env.JWT_EXPIRE || '30d',
        }
    );

    // Update last login
    staff.lastLogin = new Date();
    await staff.save();

    res.status(200).json({
        success: true,
        token,
        user: {
            id: staff._id,
            name: staff.name,
            email: staff.email,
            role: staff.role,
            coachId: staff.coachId,
            phone: staff.phone,
            company: staff.company,
            country: staff.country,
            city: staff.city,
            bio: staff.bio,
            status: staff.status,
            createdAt: staff.createdAt,
            lastLogin: staff.lastLogin
        }
    });
});

// @desc    Get current staff user
// @route   GET /api/auth/me
// @access  Private
exports.getCurrentStaff = asyncHandler(async (req, res, next) => {
    console.log('🔍 [getCurrentStaff] Request user:', req.user);
    console.log('🔍 [getCurrentStaff] User ID:', req.user?.id);
    
    const staff = await User.findById(req.user.id);

    if (!staff) {
        return res.status(404).json({
            success: false,
            message: 'Staff user not found'
        });
    }

    res.status(200).json({
        success: true,
        user: {
            id: staff._id,
            name: staff.name,
            email: staff.email,
            role: staff.role,
            coachId: staff.coachId,
            phone: staff.phone,
            company: staff.company,
            country: staff.country,
            city: staff.city,
            bio: staff.bio,
            status: staff.status,
            createdAt: staff.createdAt,
            lastLogin: staff.lastLogin
        }
    });
});

// @desc    Staff logout
// @route   POST /api/auth/logout
// @access  Private
exports.staffLogout = asyncHandler(async (req, res, next) => {
    // In a more sophisticated implementation, you might want to:
    // 1. Add the token to a blacklist
    // 2. Store logout time in the database
    // 3. Implement token refresh mechanism
    
    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
});
