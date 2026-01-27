const CoachMarketingCredentials = require('../schema/CoachMarketingCredentials');
const { Coach } = require('../schema');
const { getUserContext } = require('../middleware/unifiedCoachAuth');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const crypto = require('crypto');

// @desc    Get coach marketing credentials
// @route   GET /api/coach-marketing-credentials
// @access  Private (Coach)
exports.getCredentials = asyncHandler(async (req, res, next) => {
    const credentials = await CoachMarketingCredentials.findOne({ coachId: req.user._id })
        .select('metaAds.isConnected metaAds.lastVerified openAI.isConnected openAI.lastVerified preferences');

    if (!credentials) {
        return res.status(404).json({
            success: false,
            message: 'Marketing credentials not found. Please set up your credentials first.'
        });
    }

    res.status(200).json({
        success: true,
        data: credentials
    });
});

// @desc    Set up Meta Ads credentials
// @route   POST /api/coach-marketing-credentials/meta-ads
// @access  Private (Coach)
exports.setupMetaAdsCredentials = asyncHandler(async (req, res, next) => {
    const {
        accessToken,
        appId,
        appSecret,
        businessAccountId,
        adAccountId,
        facebookPageId,
        instagramAccountId,
        pixelId,
        pixelEnabled
    } = req.body;

    // Validate required fields
    if (!accessToken) {
        return next(new ErrorResponse('Meta Ads access token is required', 400));
    }

    let credentials = await CoachMarketingCredentials.findOne({ coachId: req.user._id });

    if (!credentials) {
        // Create new credentials record
        credentials = new CoachMarketingCredentials({
            coachId: req.user._id,
            encryptionKey: crypto.randomBytes(32).toString('hex'),
            updatedBy: req.user._id
        });
    }

    // Update Meta Ads credentials
    credentials.metaAds = {
        accessToken,
        appId,
        appSecret,
        businessAccountId,
        adAccountId,
        facebookPageId,
        instagramAccountId,
        pixelId: pixelId || null,
        pixelEnabled: pixelEnabled || false,
        isConnected: false,
        lastVerified: null,
        permissions: []
    };

    credentials.updatedBy = req.user._id;
    credentials.lastUpdated = new Date();

    await credentials.save();

    // Verify credentials
    const isVerified = await credentials.verifyMetaCredentials();

    res.status(200).json({
        success: true,
        message: 'Meta Ads credentials saved successfully',
        data: {
            isConnected: credentials.metaAds.isConnected,
            lastVerified: credentials.metaAds.lastVerified,
            businessAccountId: credentials.metaAds.businessAccountId,
            adAccountId: credentials.metaAds.adAccountId
        }
    });
});

// @desc    Set up OpenAI credentials
// @route   POST /api/coach-marketing-credentials/openai
// @access  Private (Coach)
exports.setupOpenAICredentials = asyncHandler(async (req, res, next) => {
    const { apiKey, modelPreference } = req.body;

    // Validate required fields
    if (!apiKey) {
        return next(new ErrorResponse('OpenAI API key is required', 400));
    }

    let credentials = await CoachMarketingCredentials.findOne({ coachId: req.user._id });

    if (!credentials) {
        // Create new credentials record
        credentials = new CoachMarketingCredentials({
            coachId: req.user._id,
            encryptionKey: crypto.randomBytes(32).toString('hex'),
            updatedBy: req.user._id
        });
    }

    // Update OpenAI credentials
    credentials.openAI = {
        apiKey,
        isConnected: false,
        lastVerified: null,
        modelPreference: modelPreference || 'gpt-4'
    };

    credentials.updatedBy = req.user._id;
    credentials.lastUpdated = new Date();

    await credentials.save();

    // Verify credentials
    const isVerified = await credentials.verifyOpenAICredentials();

    res.status(200).json({
        success: true,
        message: 'OpenAI credentials saved successfully',
        data: {
            isConnected: credentials.openAI.isConnected,
            lastVerified: credentials.openAI.lastVerified,
            modelPreference: credentials.openAI.modelPreference
        }
    });
});

// @desc    Update marketing preferences
// @route   PUT /api/coach-marketing-credentials/preferences
// @access  Private (Coach)
exports.updatePreferences = asyncHandler(async (req, res, next) => {
    const {
        autoPublish,
        requireApproval,
        defaultBudget,
        defaultDuration,
        timezone,
        language
    } = req.body;

    let credentials = await CoachMarketingCredentials.findOne({ coachId: req.user._id });

    if (!credentials) {
        return next(new ErrorResponse('Marketing credentials not found. Please set up your credentials first.', 404));
    }

    // Update preferences
    credentials.preferences = {
        autoPublish: autoPublish !== undefined ? autoPublish : credentials.preferences.autoPublish,
        requireApproval: requireApproval !== undefined ? requireApproval : credentials.preferences.requireApproval,
        defaultBudget: defaultBudget || credentials.preferences.defaultBudget,
        defaultDuration: defaultDuration || credentials.preferences.defaultDuration,
        timezone: timezone || credentials.preferences.timezone,
        language: language || credentials.preferences.language
    };

    credentials.updatedBy = req.user._id;
    credentials.lastUpdated = new Date();

    await credentials.save();

    res.status(200).json({
        success: true,
        message: 'Marketing preferences updated successfully',
        data: credentials.preferences
    });
});

// @desc    Verify Meta Ads credentials
// @route   POST /api/coach-marketing-credentials/verify-meta
// @access  Private (Coach)
exports.verifyMetaCredentials = asyncHandler(async (req, res, next) => {
    const credentials = await CoachMarketingCredentials.findOne({ coachId: req.user._id })
        .select('+metaAds.accessToken +encryptionKey');

    if (!credentials) {
        return next(new ErrorResponse('Meta Ads credentials not found', 404));
    }

    const isVerified = await credentials.verifyMetaCredentials();

    res.status(200).json({
        success: true,
        message: isVerified ? 'Meta Ads credentials verified successfully' : 'Meta Ads credentials verification failed',
        data: {
            isConnected: credentials.metaAds.isConnected,
            lastVerified: credentials.metaAds.lastVerified
        }
    });
});

// @desc    Verify OpenAI credentials
// @route   POST /api/coach-marketing-credentials/verify-openai
// @access  Private (Coach)
exports.verifyOpenAICredentials = asyncHandler(async (req, res, next) => {
    const credentials = await CoachMarketingCredentials.findOne({ coachId: req.user._id })
        .select('+openAI.apiKey +encryptionKey');

    if (!credentials) {
        return next(new ErrorResponse('OpenAI credentials not found', 404));
    }

    const isVerified = await credentials.verifyOpenAICredentials();

    res.status(200).json({
        success: true,
        message: isVerified ? 'OpenAI credentials verified successfully' : 'OpenAI credentials verification failed',
        data: {
            isConnected: credentials.openAI.isConnected,
            lastVerified: credentials.openAI.lastVerified
        }
    });
});

// @desc    Get Meta Ads access token (for internal use)
// @route   GET /api/coach-marketing-credentials/meta-token
// @access  Private (Coach)
exports.getMetaAccessToken = asyncHandler(async (req, res, next) => {
    const credentials = await CoachMarketingCredentials.findOne({ coachId: req.user._id })
        .select('+metaAds.accessToken +encryptionKey');

    if (!credentials || !credentials.metaAds.accessToken) {
        return next(new ErrorResponse('Meta Ads access token not found', 404));
    }

    const accessToken = credentials.getDecryptedAccessToken();

    res.status(200).json({
        success: true,
        data: {
            accessToken,
            businessAccountId: credentials.metaAds.businessAccountId,
            adAccountId: credentials.metaAds.adAccountId
        }
    });
});

// @desc    Get OpenAI API key (for internal use)
// @route   GET /api/coach-marketing-credentials/openai-key
// @access  Private (Coach)
exports.getOpenAIKey = asyncHandler(async (req, res, next) => {
    const credentials = await CoachMarketingCredentials.findOne({ coachId: req.user._id })
        .select('+openAI.apiKey +encryptionKey');

    if (!credentials || !credentials.openAI.apiKey) {
        return next(new ErrorResponse('OpenAI API key not found', 404));
    }

    const apiKey = credentials.getDecryptedOpenAIKey();

    res.status(200).json({
        success: true,
        data: {
            apiKey,
            modelPreference: credentials.openAI.modelPreference
        }
    });
});

// @desc    Delete marketing credentials
// @route   DELETE /api/coach-marketing-credentials
// @access  Private (Coach)
exports.deleteCredentials = asyncHandler(async (req, res, next) => {
    const credentials = await CoachMarketingCredentials.findOne({ coachId: req.user._id });

    if (!credentials) {
        return next(new ErrorResponse('Marketing credentials not found', 404));
    }

    await credentials.remove();

    res.status(200).json({
        success: true,
        message: 'Marketing credentials deleted successfully'
    });
});

// @desc    Get setup status
// @route   GET /api/coach-marketing-credentials/setup-status
// @access  Private (Coach)
exports.getSetupStatus = asyncHandler(async (req, res, next) => {
    const credentials = await CoachMarketingCredentials.findOne({ coachId: req.user._id })
        .select('metaAds.isConnected metaAds.lastVerified openAI.isConnected openAI.lastVerified preferences');

    const setupStatus = {
        metaAds: {
            isSetup: false,
            isConnected: false,
            lastVerified: null
        },
        openAI: {
            isSetup: false,
            isConnected: false,
            lastVerified: null
        },
        preferences: {
            autoPublish: false,
            requireApproval: true,
            defaultBudget: 25,
            defaultDuration: 7
        }
    };

    if (credentials) {
        setupStatus.metaAds = {
            isSetup: true,
            isConnected: credentials.metaAds.isConnected,
            lastVerified: credentials.metaAds.lastVerified
        };
        setupStatus.openAI = {
            isSetup: true,
            isConnected: credentials.openAI.isConnected,
            lastVerified: credentials.openAI.lastVerified
        };
        setupStatus.preferences = credentials.preferences;
    }

    res.status(200).json({
        success: true,
        data: setupStatus
    });
});

