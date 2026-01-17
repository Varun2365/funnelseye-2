const asyncHandler = require('../middleware/async');
const { AdminSystemSettings } = require('../schema');
const emailConfigService = require('../services/emailConfigService');

/**
 * @desc    Get email configuration
 * @route   GET /api/email/v1/config
 * @access  Private (Admin)
 */
exports.getEmailConfig = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [EMAIL_CONFIG_API] Getting email configuration...');
        
        const settings = await AdminSystemSettings.findOne({ settingId: 'global' });
        
        if (!settings || !settings.notifications?.email) {
            return res.status(404).json({
                success: false,
                message: 'Email configuration not found'
            });
        }

        const emailConfig = settings.notifications.email;
        
        // Don't return the password for security
        const configResponse = {
            enabled: emailConfig.enabled,
            email: emailConfig.auth?.user || emailConfig.fromEmail || '',
            fromEmail: emailConfig.fromEmail || '',
            fromName: emailConfig.fromName || 'FunnelsEye'
        };

        console.log('✅ [EMAIL_CONFIG_API] Email configuration retrieved successfully');
        
        res.json({
            success: true,
            data: configResponse
        });
    } catch (error) {
        console.error('❌ [EMAIL_CONFIG_API] Error getting email configuration:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving email configuration',
            error: error.message
        });
    }
});

/**
 * @desc    Setup/Update email configuration
 * @route   POST /api/email/v1/setup
 * @access  Private (Admin)
 */
exports.setupEmailConfig = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [EMAIL_CONFIG_API] Setting up email configuration...');
        
        const { email, password } = req.body;
        
        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Get or create settings
        let settings = await AdminSystemSettings.findOne({ settingId: 'global' });
        if (!settings) {
            settings = new AdminSystemSettings({ settingId: 'global' });
        }

        // Update email configuration (simplified)
        settings.notifications = settings.notifications || {};
        settings.notifications.email = {
            enabled: true,
            auth: {
                user: email,
                pass: password
            },
            fromEmail: email,
            fromName: 'FunnelsEye'
        };

        await settings.save();

        // Clear email service cache to force reload
        emailConfigService.clearCache();

        console.log('✅ [EMAIL_CONFIG_API] Email configuration saved successfully');
        
        res.json({
            success: true,
            message: 'Email configuration saved successfully',
            data: {
                isUpdate: !!req.body.isUpdate
            }
        });
    } catch (error) {
        console.error('❌ [EMAIL_CONFIG_API] Error setting up email configuration:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving email configuration',
            error: error.message
        });
    }
});

/**
 * @desc    Test email configuration
 * @route   POST /api/email/v1/test-config
 * @access  Private (Admin)
 */
exports.testEmailConfig = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [EMAIL_CONFIG_API] Testing email configuration...');
        
        const { testEmail } = req.body;
        
        const result = await emailConfigService.testEmailConfig(testEmail);
        
        if (result.success) {
            console.log('✅ [EMAIL_CONFIG_API] Email configuration test successful');
            res.json({
                success: true,
                message: result.message,
                data: {
                    messageId: result.messageId
                }
            });
        } else {
            console.log('❌ [EMAIL_CONFIG_API] Email configuration test failed:', result.message);
            res.status(400).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        console.error('❌ [EMAIL_CONFIG_API] Error testing email configuration:', error);
        res.status(500).json({
            success: false,
            message: 'Error testing email configuration',
            error: error.message
        });
    }
});

/**
 * @desc    Get email configuration status
 * @route   GET /api/email/v1/status
 * @access  Private (Admin)
 */
exports.getEmailStatus = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [EMAIL_CONFIG_API] Getting email status...');
        
        const status = await emailConfigService.getStatus();
        
        console.log('✅ [EMAIL_CONFIG_API] Email status retrieved successfully');
        
        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        console.error('❌ [EMAIL_CONFIG_API] Error getting email status:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving email status',
            error: error.message
        });
    }
});

/**
 * @desc    Send test email
 * @route   POST /api/email/v1/send-test
 * @access  Private (Admin)
 */
exports.sendTestEmail = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [EMAIL_CONFIG_API] Sending test email...');
        
        const { to, subject, message } = req.body;
        
        if (!to) {
            return res.status(400).json({
                success: false,
                message: 'Recipient email is required'
            });
        }

        const mailOptions = {
            to: to,
            subject: subject || 'FunnelsEye - Test Email',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #6a1b9a;">Test Email</h2>
                    <p>${message || 'This is a test email from FunnelsEye platform.'}</p>
                    <hr>
                    <p style="color: #666; font-size: 12px;">
                        Sent from FunnelsEye Platform at ${new Date().toLocaleString()}
                    </p>
                </div>
            `
        };

        const result = await emailConfigService.sendEmail(mailOptions);
        
        console.log('✅ [EMAIL_CONFIG_API] Test email sent successfully');
        
        res.json({
            success: true,
            message: 'Test email sent successfully',
            data: {
                messageId: result.messageId
            }
        });
    } catch (error) {
        console.error('❌ [EMAIL_CONFIG_API] Error sending test email:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending test email',
            error: error.message
        });
    }
});
