const ZoomIntegration = require('../schema/ZoomIntegration');
const zoomService = require('../services/zoomService');
const zoomCleanupService = require('../services/zoomCleanupService');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Setup Zoom integration for a coach
// @route   POST /api/zoom-integration/setup
// @access  Private (Coaches)
const setupZoomIntegration = asyncHandler(async (req, res, next) => {
    const { clientId, clientSecret, zoomEmail, zoomAccountId, meetingSettings } = req.body;
    
    // ===== STEP 1: VALIDATE REQUIRED FIELDS =====
    if (!clientId || !clientSecret || !zoomEmail || !zoomAccountId) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields',
            errors: {
                clientId: !clientId ? 'Client ID is required' : null,
                clientSecret: !clientSecret ? 'Client Secret is required' : null,
                zoomEmail: !zoomEmail ? 'Zoom Email is required' : null,
                zoomAccountId: !zoomAccountId ? 'Zoom Account ID is required' : null
            }
        });
    }

    // ===== STEP 2: VALIDATE FIELD FORMATS =====
    const validationErrors = {};
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(zoomEmail)) {
        validationErrors.zoomEmail = 'Please enter a valid email address';
    }
    
    // Validate client ID format (should be alphanumeric, 20-40 characters)
    if (!/^[a-zA-Z0-9]{20,40}$/.test(clientId)) {
        validationErrors.clientId = 'Client ID should be 20-40 alphanumeric characters';
    }
    
    // Validate client secret format (should be alphanumeric, 20-40 characters)
    if (!/^[a-zA-Z0-9]{20,40}$/.test(clientSecret)) {
        validationErrors.clientSecret = 'Client Secret should be 20-40 alphanumeric characters';
    }
    
    // Validate account ID format (should be alphanumeric, 8-20 characters)
    if (!/^[a-zA-Z0-9]{8,20}$/.test(zoomAccountId)) {
        validationErrors.zoomAccountId = 'Account ID should be 8-20 alphanumeric characters';
    }
    
    // If there are validation errors, return them
    if (Object.keys(validationErrors).length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid field formats',
            errors: validationErrors
        });
    }

    // ===== STEP 3: CREATE TEMPORARY INTEGRATION FOR TESTING =====
    let tempIntegration;
    try {
        tempIntegration = new ZoomIntegration({
            coachId: req.coachId,
            clientId,
            clientSecret,
            zoomEmail,
            zoomAccountId,
            meetingSettings: meetingSettings || {},
            isActive: false // Don't activate until verified
        });
        
        // Validate the schema (this will catch any schema validation errors)
        await tempIntegration.validate();
        
    } catch (validationError) {
        return res.status(400).json({
            success: false,
            message: 'Invalid integration data',
            errors: {
                schema: validationError.message
            }
        });
    }

    // ===== STEP 4: TEST CREDENTIALS WITHOUT SAVING =====
    try {
        console.log('[ZoomIntegration] Testing credentials before saving...');
        
        // Test the credentials by attempting to generate an OAuth token
        const testResult = await zoomService.testCredentials({
            clientId,
            clientSecret,
            zoomEmail,
            zoomAccountId
        });
        
        if (!testResult.success) {
            return res.status(400).json({
                success: false,
                message: 'Zoom credentials verification failed',
                errors: {
                    credentials: testResult.message || 'Invalid credentials or network error',
                    details: testResult.details || null
                },
                suggestions: [
                    'Verify your Client ID and Client Secret from Zoom Marketplace',
                    'Ensure your Zoom account is active and has API access',
                    'Check that the Account ID matches your Zoom account',
                    'Verify your email address is associated with the Zoom account'
                ]
            });
        }
        
        console.log('[ZoomIntegration] Credentials verified successfully');
        
    } catch (error) {
        console.error('[ZoomIntegration] Credential test error:', error);
        return res.status(400).json({
            success: false,
            message: 'Failed to verify Zoom credentials',
            errors: {
                network: 'Unable to connect to Zoom API',
                details: error.message
            },
            suggestions: [
                'Check your internet connection',
                'Verify Zoom API endpoints are accessible',
                'Try again in a few moments'
            ]
        });
    }

    // ===== STEP 5: SAVE TO DATABASE ONLY AFTER VERIFICATION =====
    try {
        // Check if integration already exists
        let existingIntegration = await ZoomIntegration.findOne({ coachId: req.coachId });
        
        if (existingIntegration) {
            // Update existing integration with verified credentials
            existingIntegration.clientId = clientId;
            existingIntegration.clientSecret = clientSecret;
            existingIntegration.zoomEmail = zoomEmail;
            existingIntegration.zoomAccountId = zoomAccountId;
            if (meetingSettings) {
                existingIntegration.meetingSettings = { ...existingIntegration.meetingSettings, ...meetingSettings };
            }
            existingIntegration.isActive = true;
            existingIntegration.lastSync = {
                timestamp: new Date(),
                status: 'success',
                message: 'Credentials verified and integration updated successfully'
            };
            
            await existingIntegration.save();
            integration = existingIntegration;
            
        } else {
            // Create new integration with verified credentials
            tempIntegration.isActive = true;
            tempIntegration.lastSync = {
                timestamp: new Date(),
                status: 'success',
                message: 'Credentials verified and integration created successfully'
            };
            
            integration = await tempIntegration.save();
        }
        
        console.log('[ZoomIntegration] Integration saved successfully for coach:', req.coachId);
        
        res.status(200).json({
            success: true,
            message: 'Zoom integration setup completed successfully',
            data: {
                _id: integration._id,
                zoomAccountId: integration.zoomAccountId,
                zoomEmail: integration.zoomEmail,
                isActive: integration.isActive,
                lastSync: integration.lastSync,
                meetingSettings: integration.meetingSettings
            },
            verification: {
                credentials: 'verified',
                connection: 'successful',
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('[ZoomIntegration] Database save error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to save Zoom integration',
            errors: {
                database: 'Unable to save integration to database',
                details: error.message
            }
        });
    }
});

// @desc    Get Zoom integration details
// @route   GET /api/zoom-integration
// @access  Private (Coaches)
const getZoomIntegration = asyncHandler(async (req, res, next) => {
    try {
        const integration = await ZoomIntegration.findOne({ coachId: req.coachId });
        
        if (!integration) {
            return res.status(200).json({
                success: false,
                message: 'Zoom integration not found. Please set up your Zoom integration first.',
                data: null,
                error: 'Integration not found'
            });
        }

        // Don't send sensitive data
        const safeIntegration = {
            _id: integration._id,
            zoomAccountId: integration.zoomAccountId,
            zoomEmail: integration.zoomEmail,
            isActive: integration.isActive,
            meetingSettings: integration.meetingSettings,
            lastSync: integration.lastSync,
            usageStats: integration.usageStats,
            createdAt: integration.createdAt,
            updatedAt: integration.updatedAt
        };

        res.status(200).json({
            success: true,
            data: safeIntegration
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to get Zoom integration details',
            error: error.message,
            details: error.stack || 'No additional details available'
        });
    }
});

// @desc    Update Zoom integration settings
// @route   PUT /api/zoom-integration
// @access  Private (Coaches)
const updateZoomIntegration = asyncHandler(async (req, res, next) => {
    try {
        const { meetingSettings, isActive } = req.body;
        
        let integration = await ZoomIntegration.findOne({ coachId: req.coachId });
        
        if (!integration) {
            return res.status(200).json({
                success: false,
                message: 'Zoom integration not found. Please set up your Zoom integration first.',
                data: null,
                error: 'Integration not found'
            });
        }

        if (meetingSettings) {
            integration.meetingSettings = { ...integration.meetingSettings, ...meetingSettings };
        }
        
        if (isActive !== undefined) {
            integration.isActive = isActive;
        }

        await integration.save();

        res.status(200).json({
            success: true,
            message: 'Zoom integration updated successfully',
            data: {
                meetingSettings: integration.meetingSettings,
                isActive: integration.isActive
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to update Zoom integration',
            error: error.message,
            details: error.stack || 'No additional details available'
        });
    }
});

// @desc    Test Zoom connection
// @route   POST /api/zoom-integration/test
// @access  Private (Coaches)
const testZoomConnection = asyncHandler(async (req, res, next) => {
    try {
        const result = await zoomService.testConnection(req.coachId);
        res.status(200).json(result);
    } catch (error) {
        if (error.message.includes('Zoom integration not found')) {
            return res.status(200).json({
                success: false,
                message: 'Zoom integration not found. Please set up your Zoom integration first.',
                data: null,
                error: error.message
            });
        }
        
        // Include error details for frontend debugging
        return res.status(500).json({
            success: false,
            message: 'Failed to test Zoom connection',
            error: error.message,
            details: error.stack || 'No additional details available'
        });
    }
});

// @desc    Get Zoom usage statistics
// @route   GET /api/zoom-integration/usage
// @access  Private (Coaches)
const getZoomUsage = asyncHandler(async (req, res, next) => {
    try {
        const result = await zoomService.getAccountUsage(req.coachId);
        res.status(200).json(result);
    } catch (error) {
        if (error.message.includes('Zoom integration not found')) {
            return res.status(200).json({
                success: false,
                message: 'Zoom integration not found. Please set up your Zoom integration first.',
                data: null,
                error: error.message
            });
        }
        
        // Include error details for frontend debugging
        return res.status(500).json({
            success: false,
            message: 'Failed to get Zoom usage statistics',
            error: error.message,
            details: error.stack || 'No additional details available'
        });
    }
});

// @desc    Create a meeting template
// @route   POST /api/zoom-integration/meeting-templates
// @access  Private (Coaches)
const createMeetingTemplate = asyncHandler(async (req, res, next) => {
    try {
        const { name, description, duration, settings, isDefault } = req.body;
        
        if (!name || !duration) {
            return res.status(400).json({
                success: false,
                message: 'Name and duration are required',
                error: 'Missing required fields',
                details: `Missing: ${!name ? 'name' : ''} ${!duration ? 'duration' : ''}`.trim()
            });
        }

        const integration = await ZoomIntegration.findOne({ coachId: req.coachId });
        
        if (!integration) {
            return res.status(200).json({
                success: false,
                message: 'Zoom integration not found. Please set up your Zoom integration first.',
                data: null,
                error: 'Integration not found'
            });
        }

        await integration.createMeetingTemplate({
            name,
            description,
            duration,
            settings,
            isDefault
        });

        res.status(201).json({
            success: true,
            message: 'Meeting template created successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to create meeting template',
            error: error.message,
            details: error.stack || 'No additional details available'
        });
    }
});

// @desc    Get meeting templates
// @route   GET /api/zoom-integration/meeting-templates
// @access  Private (Coaches)
const getMeetingTemplates = asyncHandler(async (req, res, next) => {
    try {
        const integration = await ZoomIntegration.findOne({ coachId: req.coachId });
        
        if (!integration) {
            return res.status(200).json({
                success: false,
                message: 'Zoom integration not found. Please set up your Zoom integration first.',
                data: [],
                error: 'Integration not found'
            });
        }

        res.status(200).json({
            success: true,
            data: integration.meetingSettings.templates
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to get meeting templates',
            error: error.message,
            details: error.stack || 'No additional details available'
        });
    }
});

// @desc    Delete Zoom integration
// @route   DELETE /api/zoom-integration
// @access  Private (Coaches)
const deleteZoomIntegration = asyncHandler(async (req, res, next) => {
    try {
        const integration = await ZoomIntegration.findOne({ coachId: req.coachId });
        
        if (!integration) {
            return res.status(200).json({
                success: false,
                message: 'Zoom integration not found. Please set up your Zoom integration first.',
                data: null,
                error: 'Integration not found'
            });
        }

        await integration.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Zoom integration deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to delete Zoom integration',
            error: error.message,
            details: error.stack || 'No additional details available'
        });
    }
});

// @desc    Get Zoom integration status
// @route   GET /api/zoom-integration/status
// @access  Private (Coaches)
const getIntegrationStatus = asyncHandler(async (req, res, next) => {
    try {
        const integration = await ZoomIntegration.findOne({ coachId: req.coachId });
        
        if (!integration) {
            return res.status(200).json({
                success: true,
                data: {
                    isConnected: false,
                    message: 'No Zoom integration found'
                }
            });
        }

        const status = {
            isConnected: integration.isValid(),
            isActive: integration.isActive,
            lastSync: integration.lastSync,
            accountInfo: {
                zoomAccountId: integration.zoomAccountId,
                zoomEmail: integration.zoomEmail
            }
        };

        res.status(200).json({
            success: true,
            data: status
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to get integration status',
            error: error.message,
            details: error.stack || 'No additional details available'
        });
    }
});

// @desc    Get Zoom meeting details for a specific appointment
// @route   GET /api/zoom-integration/meetings/appointment/:appointmentId
// @access  Private (Coaches)
const getZoomMeetingForAppointment = asyncHandler(async (req, res, next) => {
    const { appointmentId } = req.params;
    
    try {
        const meetingDetails = await zoomService.getZoomMeetingForAppointment(appointmentId, req.coachId);
        
        res.status(200).json({
            success: true,
            data: meetingDetails
        });
    } catch (error) {
        if (error.message.includes('Zoom integration not found')) {
            return res.status(200).json({
                success: false,
                message: 'Zoom integration not found. Please set up your Zoom integration first.',
                data: null,
                error: error.message
            });
        }
        
        // Include error details for frontend debugging
        return res.status(404).json({
            success: false,
            message: 'Failed to get Zoom meeting details',
            error: error.message,
            details: error.stack || 'No additional details available',
            appointmentId: appointmentId
        });
    }
});

// @desc    Get all Zoom meetings for a coach
// @route   GET /api/zoom-integration/meetings
// @access  Private (Coaches)
const getCoachZoomMeetings = asyncHandler(async (req, res, next) => {
    try {
        const meetings = await zoomService.getCoachZoomMeetings(req.coachId);
        
        res.status(200).json({
            success: true,
            data: meetings
        });
    } catch (error) {
        if (error.message.includes('Zoom integration not found')) {
            return res.status(200).json({
                success: false,
                message: 'Zoom integration not found. Please set up your Zoom integration first.',
                data: [],
                error: error.message
            });
        }
        
        // Include error details for frontend debugging
        return res.status(500).json({
            success: false,
            message: 'Failed to get Zoom meetings',
            error: error.message,
            details: error.stack || 'No additional details available'
        });
    }
});

// ===== ZOOM CLEANUP MANAGEMENT =====

// @desc    Start automatic Zoom meeting cleanup
// @route   POST /api/zoom-integration/cleanup/start
// @access  Private (Coaches)
const startCleanup = asyncHandler(async (req, res, next) => {
    try {
        const { retentionDays = 2, interval = 'daily' } = req.body;
        
        if (retentionDays < 1) {
            return res.status(400).json({
                success: false,
                message: 'Retention period must be at least 1 day',
                error: 'Invalid retention period',
                details: `Provided retentionDays: ${retentionDays}, minimum required: 1`
            });
        }
        
        if (!['daily', 'weekly', 'manual'].includes(interval)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid interval. Must be daily, weekly, or manual',
                error: 'Invalid interval',
                details: `Provided interval: ${interval}, valid options: daily, weekly, manual`
            });
        }
        
        zoomCleanupService.startCleanup(retentionDays, interval);
        
        res.status(200).json({
            success: true,
            message: `Zoom cleanup started with ${retentionDays} days retention, interval: ${interval}`,
            data: {
                retentionDays,
                interval,
                isRunning: true
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to start Zoom cleanup',
            error: error.message,
            details: error.stack || 'No additional details available'
        });
    }
});

// @desc    Stop automatic Zoom meeting cleanup
// @route   POST /api/zoom-integration/cleanup/stop
// @access  Private (Coaches)
const stopCleanup = asyncHandler(async (req, res, next) => {
    try {
        zoomCleanupService.stopCleanup();
        
        res.status(200).json({
            success: true,
            message: 'Zoom cleanup stopped successfully',
            data: {
                isRunning: false
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to stop Zoom cleanup',
            error: error.message,
            details: error.stack || 'No additional details available'
        });
    }
});

// @desc    Perform manual Zoom meeting cleanup
// @route   POST /api/zoom-integration/cleanup/manual
// @access  Private (Coaches)
const manualCleanup = asyncHandler(async (req, res, next) => {
    try {
        const { retentionDays = 2 } = req.body;
        
        if (retentionDays < 1) {
            return res.status(400).json({
                success: false,
                message: 'Retention period must be at least 1 day',
                error: 'Invalid retention period',
                details: `Provided retentionDays: ${retentionDays}, minimum required: 1`
            });
        }
        
        const result = await zoomCleanupService.manualCleanup(retentionDays);
        
        res.status(200).json({
            success: true,
            message: result.message,
            data: result
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to perform manual Zoom cleanup',
            error: error.message,
            details: error.stack || 'No additional details available'
        });
    }
});

// @desc    Get Zoom cleanup statistics and status
// @route   GET /api/zoom-integration/cleanup/stats
// @access  Private (Coaches)
const getCleanupStats = asyncHandler(async (req, res, next) => {
    try {
        const stats = await zoomCleanupService.getCleanupStats();
        
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to get Zoom cleanup statistics',
            error: error.message,
            details: error.stack || 'No additional details available'
        });
    }
});

// @desc    Update Zoom cleanup retention period
// @route   PUT /api/zoom-integration/cleanup/retention
// @access  Private (Coaches)
const updateRetentionPeriod = asyncHandler(async (req, res, next) => {
    try {
        const { retentionDays } = req.body;
        
        if (!retentionDays || retentionDays < 1) {
            return res.status(400).json({
                success: false,
                message: 'Retention period must be at least 1 day',
                error: 'Invalid retention period',
                details: `Provided retentionDays: ${retentionDays}, minimum required: 1`
            });
        }
        
        zoomCleanupService.updateRetentionPeriod(retentionDays);
        
        res.status(200).json({
            success: true,
            message: `Retention period updated to ${retentionDays} days`,
            data: {
                retentionDays,
                isRunning: !!zoomCleanupService.cleanupInterval
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to update retention period',
            error: error.message,
            details: error.stack || 'No additional details available'
        });
    }
});

// ===== ZOOM OAUTH 2.0 INTEGRATION =====

// @desc    Initiate Zoom OAuth 2.0 flow
// @route   GET /api/zoom-integration/oauth/authorize
// @access  Public (redirects to Zoom)
const initiateZoomOAuth = asyncHandler(async (req, res, next) => {
    try {
        const { coachId } = req.query;
        
        if (!coachId) {
            return res.status(400).json({
                success: false,
                message: 'Coach ID is required'
            });
        }

        // Zoom OAuth 2.0 configuration
        const zoomClientId = process.env.ZOOM_OAUTH_CLIENT_ID;
        const redirectUri = process.env.ZOOM_OAUTH_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/zoom-integration/oauth/callback`;
        
        if (!zoomClientId) {
            return res.status(500).json({
                success: false,
                message: 'Zoom OAuth is not configured. Please contact administrator.'
            });
        }

        // Generate state parameter for security (store coachId and timestamp)
        // State is verified on callback by decoding and checking timestamp (must be within 10 minutes)
        const state = Buffer.from(JSON.stringify({ coachId, timestamp: Date.now() })).toString('base64');

        // Zoom OAuth 2.0 authorization URL
        // Using user-level scopes (not admin scopes) for user-managed apps
        // These scope names match what's available in Zoom Marketplace
        const scopes = [
            'meeting:write:meeting',      // Create a meeting for a user
            'meeting:update:meeting',     // Update a meeting
            'meeting:delete:meeting',     // Delete a meeting
            'meeting:read:meeting',       // View a meeting
            'meeting:read:list_meetings', // View a user's meetings
            'user:read:user',             // Read user information (required for /v2/users/me)
            'user:read:user:admin'        // Alternative user read scope (some endpoints may require this)
        ].join(' ');

        const authUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${zoomClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${encodeURIComponent(state)}`;

        // Redirect to Zoom authorization page
        res.redirect(authUrl);
    } catch (error) {
        console.error('[ZoomOAuth] Error initiating OAuth:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to initiate Zoom OAuth',
            error: error.message
        });
    }
});

// @desc    Handle Zoom OAuth 2.0 callback
// @route   GET /api/zoom-integration/oauth/callback
// @access  Public (callback from Zoom)
const handleZoomOAuthCallback = asyncHandler(async (req, res, next) => {
    try {
        const { code, state, error } = req.query;

        if (error) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/calendar?zoom_error=${encodeURIComponent(error)}`);
        }

        if (!code || !state) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/calendar?zoom_error=missing_parameters`);
        }

        // Verify state parameter (decode and check timestamp)
        let stateData;
        try {
            stateData = JSON.parse(Buffer.from(state, 'base64').toString());
        } catch (e) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/calendar?zoom_error=invalid_state`);
        }

        const { coachId, timestamp } = stateData;

        if (!coachId) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/calendar?zoom_error=missing_coach_id`);
        }

        // Verify state timestamp (must be within 10 minutes)
        const stateAge = Date.now() - timestamp;
        if (stateAge > 10 * 60 * 1000) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/calendar?zoom_error=state_expired`);
        }

        // Exchange authorization code for access token
        const zoomClientId = process.env.ZOOM_OAUTH_CLIENT_ID;
        const zoomClientSecret = process.env.ZOOM_OAUTH_CLIENT_SECRET;
        const redirectUri = process.env.ZOOM_OAUTH_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/zoom-integration/oauth/callback`;

        if (!zoomClientId || !zoomClientSecret) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/calendar?zoom_error=oauth_not_configured`);
        }

        // Exchange code for tokens
        const axios = require('axios');
        const tokenResponse = await axios.post('https://zoom.us/oauth/token', null, {
            params: {
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri
            },
            auth: {
                username: zoomClientId,
                password: zoomClientSecret
            }
        });

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        // Get user info from Zoom (try with error handling)
        let zoomEmail = null;
        let zoomAccountId = null;
        
        try {
            const userResponse = await axios.get('https://api.zoom.us/v2/users/me', {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            });

            const zoomUser = userResponse.data;
            zoomEmail = zoomUser.email;
            zoomAccountId = zoomUser.account_id || zoomUser.id;
        } catch (userInfoError) {
            // If we can't get user info, we'll still save the integration
            // The user info can be retrieved later when needed
            console.warn('[ZoomOAuth] Could not fetch user info:', userInfoError.response?.data || userInfoError.message);
            
            // Try to decode user info from the token if possible
            // For now, we'll save without email/accountId and fetch it later when needed
            zoomEmail = 'pending@zoom.user'; // Placeholder, will be updated on first API call
            zoomAccountId = 'pending'; // Placeholder
        }

        // Save or update Zoom integration
        let integration = await ZoomIntegration.findOne({ coachId });

        const tokenExpiresAt = new Date(Date.now() + (expires_in * 1000));

        if (integration) {
            // Update existing integration
            integration.accessToken = access_token;
            integration.refreshToken = refresh_token;
            integration.tokenExpiresAt = tokenExpiresAt;
            integration.tokenGeneratedAt = new Date();
            integration.zoomEmail = zoomEmail;
            integration.zoomAccountId = zoomAccountId;
            integration.isActive = true;
            integration.lastSync = {
                timestamp: new Date(),
                status: 'success',
                message: 'OAuth connection established successfully'
            };
            await integration.save();
        } else {
            // Create new integration
            integration = new ZoomIntegration({
                coachId,
                accessToken: access_token,
                refreshToken: refresh_token,
                tokenExpiresAt: tokenExpiresAt,
                tokenGeneratedAt: new Date(),
                zoomEmail: zoomEmail,
                zoomAccountId: zoomAccountId,
                isActive: true,
                lastSync: {
                    timestamp: new Date(),
                    status: 'success',
                    message: 'OAuth connection established successfully'
                }
            });
            await integration.save();
        }

        // Redirect back to frontend with success
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/calendar?zoom_connected=true`);
    } catch (error) {
        console.error('[ZoomOAuth] Error handling callback:', error);
        const errorMessage = error.response?.data?.error_description || error.message || 'unknown_error';
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/calendar?zoom_error=${encodeURIComponent(errorMessage)}`);
    }
});

// @desc    Get Zoom OAuth status
// @route   GET /api/zoom-integration/oauth/status
// @access  Private (Coaches)
const getZoomOAuthStatus = asyncHandler(async (req, res, next) => {
    try {
        const integration = await ZoomIntegration.findOne({ coachId: req.coachId });
        
        if (!integration) {
            return res.status(200).json({
                success: true,
                data: {
                    isConnected: false,
                    message: 'No Zoom integration found'
                }
            });
        }

        const isConnected = integration.isActive && integration.accessToken && 
                           (!integration.tokenExpiresAt || new Date() < integration.tokenExpiresAt);

        res.status(200).json({
            success: true,
            data: {
                isConnected,
                isActive: integration.isActive,
                accountInfo: {
                    zoomEmail: integration.zoomEmail,
                    zoomAccountId: integration.zoomAccountId
                },
                lastSync: integration.lastSync
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to get OAuth status',
            error: error.message
        });
    }
});

module.exports = {
    setupZoomIntegration,
    getZoomIntegration,
    updateZoomIntegration,
    testZoomConnection,
    getZoomUsage,
    createMeetingTemplate,
    getMeetingTemplates,
    deleteZoomIntegration,
    getIntegrationStatus,
    getZoomMeetingForAppointment,
    getCoachZoomMeetings,
    // NEW: Zoom Cleanup Management
    startCleanup,
    stopCleanup,
    manualCleanup,
    getCleanupStats,
    updateRetentionPeriod,
    // NEW: OAuth 2.0 Integration
    initiateZoomOAuth,
    handleZoomOAuthCallback,
    getZoomOAuthStatus
};
