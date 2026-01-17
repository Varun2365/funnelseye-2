// D:\PRJ_YCT_Final\controllers\coachController.js

const { Coach } = require('../schema');
const { getUserContext } = require('../middleware/unifiedCoachAuth');
const CoachStaffService = require('../services/coachStaffService');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Update a coach's portfolio information
// @route   PUT /api/coach/:id/profile
// @access  Private (Coach)
exports.updateCoachProfile = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { headline, bio, experienceYears, specializations } = req.body;

    const updatedCoach = await Coach.findByIdAndUpdate(
        id,
        {
            $set: {
                'portfolio.headline': headline,
                'portfolio.bio': bio,
                'portfolio.experienceYears': experienceYears,
                'portfolio.specializations': specializations
            }
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!updatedCoach) {
        return res.status(404).json({ success: false, message: 'Coach not found.' });
    }

    res.status(200).json({
        success: true,
        message: 'Coach profile updated successfully.',
        data: updatedCoach
    });
});

// @desc    Add credits to a coach's account
// @route   POST /api/coach/add-credits/:id
// @access  Private (Coach & Admin)
exports.addCredits = asyncHandler(async (req, res, next) => {
    const { creditsToAdd } = req.body;
    const coachId = req.params.id;

    // 🛡️ Access Control:
    // A coach can only add credits to their own account. An admin can add credits to any account.
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user._id.toString() !== coachId) {
        return res.status(403).json({ success: false, message: 'You are not authorized to add credits to this account.' });
    }

    if (typeof creditsToAdd !== 'number' || creditsToAdd <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid number of credits. Must be a positive number.' });
    }

    const coach = await Coach.findById(coachId);
    if (!coach) {
        return res.status(404).json({ success: false, message: 'Coach not found.' });
    }

    // --- 💳 PLACEHOLDER FOR PAYMENT INTEGRATION ---
    // Here, you would integrate a payment gateway.
    // The code would look something like this:
    /*
    const paymentSuccessful = await processPayment(req.user, creditsToAdd, req.body.paymentInfo);

    if (!paymentSuccessful) {
        return res.status(400).json({ success: false, message: 'Payment failed. Credits were not added.' });
    }
    */
    // --- END PAYMENT PLACEHOLDER ---


    // ✅ Add credits to the coach's account using findOneAndUpdate
    // This avoids validation issues with required fields like selfCoachId
    const updatedCoach = await Coach.findByIdAndUpdate(
        coachId,
        { $inc: { credits: creditsToAdd } },
        { new: true, runValidators: true }
    );

    if (!updatedCoach) {
        return res.status(404).json({ success: false, message: 'Coach not found or update failed.' });
    }

    res.status(200).json({
        success: true,
        message: `${creditsToAdd} credits added to coach ${updatedCoach.name}.`,
        newCredits: updatedCoach.credits
    });
});

// WhatsApp functionality moved to dustbin/whatsapp-dump/
// @desc    Update WhatsApp credentials for a coach
// @route   PUT /api/coach/:id/whatsapp-config
// @access  Private (Coach)
exports.updateWhatsAppConfig = asyncHandler(async (req, res, next) => {
    console.log('[CoachController] WhatsApp functionality moved to dustbin/whatsapp-dump/');
    throw new Error('WhatsApp functionality moved to dustbin/whatsapp-dump/');
});

// @desc    Get coach information (including ID)
// @route   GET /api/coach/me
// @access  Private (Coach)
exports.getMyInfo = asyncHandler(async (req, res, next) => {
    // Get user context (handles both coach and staff)
    const userContext = CoachStaffService.getUserContext(req);
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'coach', 'profile', { coachId });
    
    const coach = await Coach.findById(coachId);
    
    if (!coach) {
        return res.status(404).json({ success: false, message: 'Coach not found.' });
    }

    // Filter response data based on staff permissions
    const filteredCoach = CoachStaffService.filterResponseData(req, coach, 'coach');

    res.status(200).json({
        success: true,
        data: {
            id: filteredCoach._id,
            name: filteredCoach.name,
            email: filteredCoach.email,
            credits: filteredCoach.credits,
            // WhatsApp functionality moved to dustbin/whatsapp-dump/
        },
        userContext: {
            isStaff: userContext.isStaff,
            isCoach: userContext.isCoach,
            permissions: userContext.permissions,
            staffInfo: userContext.staffInfo
        }
    });
});