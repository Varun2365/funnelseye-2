const nodemailer = require('nodemailer');
const { AdminSystemSettings } = require('../schema');

class EmailConfigService {
    constructor() {
        this.transporter = null;
        this.config = null;
        this.lastConfigUpdate = null;
    }

    /**
     * Get email configuration from database (Gmail only)
     */
    async getEmailConfig() {
        try {
            console.log('🔄 [EMAIL_CONFIG] Fetching email configuration from database...');
            
            const settings = await AdminSystemSettings.findOne({ settingId: 'global' });
            
            if (!settings || !settings.notifications?.email) {
                console.log('❌ [EMAIL_CONFIG] No email configuration found in database');
                return null;
            }

            const emailConfig = settings.notifications.email;
            
            if (!emailConfig.enabled) {
                console.log('❌ [EMAIL_CONFIG] Email notifications are disabled');
                return null;
            }

            // Simple validation - just need Gmail ID and app password
            if (!emailConfig.gmailId || !emailConfig.appPassword) {
                console.log('❌ [EMAIL_CONFIG] Gmail ID or app password not configured');
                return null;
            }

            const config = {
                service: 'gmail',
                auth: {
                    user: emailConfig.gmailId,
                    pass: emailConfig.appPassword
                },
                fromEmail: emailConfig.fromEmail || emailConfig.gmailId,
                fromName: emailConfig.fromName || 'FunnelsEye'
            };

            console.log('✅ [EMAIL_CONFIG] Email configuration loaded successfully');
            return config;
        } catch (error) {
            console.error('❌ [EMAIL_CONFIG] Error fetching email configuration:', error);
            return null;
        }
    }

    /**
     * Create or update nodemailer transporter (Gmail only)
     */
    async getTransporter() {
        try {
            const config = await this.getEmailConfig();
            
            if (!config) {
                console.log('❌ [EMAIL_CONFIG] No valid email configuration available');
                return null;
            }

            // Check if config has changed
            const configString = JSON.stringify(config);
            if (this.transporter && this.config === configString) {
                console.log('🔄 [EMAIL_CONFIG] Using cached transporter');
                return this.transporter;
            }

            console.log('🔄 [EMAIL_CONFIG] Creating new Gmail transporter...');
            
            // Simple Gmail transporter
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: config.auth.user,
                    pass: config.auth.pass
                }
            });

            // Verify connection
            try {
                await this.transporter.verify();
                console.log('✅ [EMAIL_CONFIG] Gmail transporter verified successfully');
            } catch (verifyError) {
                console.warn('⚠️ [EMAIL_CONFIG] Gmail verification failed:', verifyError.message);
                console.warn('⚠️ Make sure you are using a Gmail App Password, not your regular password');
            }

            // Cache the config
            this.config = configString;
            this.lastConfigUpdate = new Date();

            return this.transporter;
        } catch (error) {
            console.error('❌ [EMAIL_CONFIG] Error creating transporter:', error);
            this.transporter = null;
            this.config = null;
            return null;
        }
    }

    /**
     * Send email using dynamic configuration
     */
    async sendEmail(mailOptions) {
        try {
            const transporter = await this.getTransporter();
            
            if (!transporter) {
                throw new Error('No valid email transporter available');
            }

            // Get current config for from field
            const config = await this.getEmailConfig();
            if (config) {
                mailOptions.from = mailOptions.from || `"${config.fromName}" <${config.fromEmail}>`;
            }

            console.log('🔄 [EMAIL_CONFIG] Sending email...');
            const result = await transporter.sendMail(mailOptions);
            console.log('✅ [EMAIL_CONFIG] Email sent successfully:', result.messageId);
            
            return result;
        } catch (error) {
            console.error('❌ [EMAIL_CONFIG] Error sending email:', error);
            throw error;
        }
    }

    /**
     * Test email configuration
     */
    async testEmailConfig(testEmail = null) {
        try {
            const transporter = await this.getTransporter();
            
            if (!transporter) {
                return {
                    success: false,
                    message: 'No valid email configuration found'
                };
            }

            const config = await this.getEmailConfig();
            const testToEmail = testEmail || config.fromEmail;

            const testMailOptions = {
                to: testToEmail,
                subject: 'FunnelsEye - Email Configuration Test',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #6a1b9a;">Email Configuration Test</h2>
                        <p>This is a test email to verify that your email configuration is working correctly.</p>
                        <p><strong>Configuration Details:</strong></p>
                        <ul>
                            <li>Host: ${config.host}</li>
                            <li>Port: ${config.port}</li>
                            <li>Secure: ${config.secure ? 'Yes' : 'No'}</li>
                            <li>From: ${config.fromEmail}</li>
                        </ul>
                        <p>If you received this email, your configuration is working properly!</p>
                        <hr>
                        <p style="color: #666; font-size: 12px;">
                            Sent from FunnelsEye Platform at ${new Date().toLocaleString()}
                        </p>
                    </div>
                `
            };

            const result = await this.sendEmail(testMailOptions);
            
            return {
                success: true,
                message: 'Test email sent successfully',
                messageId: result.messageId
            };
        } catch (error) {
            console.error('❌ [EMAIL_CONFIG] Test email failed:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * Clear cached transporter (useful when config is updated)
     */
    clearCache() {
        console.log('🔄 [EMAIL_CONFIG] Clearing transporter cache...');
        this.transporter = null;
        this.config = null;
        this.lastConfigUpdate = null;
    }

    /**
     * Get configuration status
     */
    async getStatus() {
        try {
            const config = await this.getEmailConfig();
            const transporter = await this.getTransporter();
            
            return {
                configured: !!config,
                transporterReady: !!transporter,
                lastUpdate: this.lastConfigUpdate,
                config: config ? {
                    host: config.host,
                    port: config.port,
                    secure: config.secure,
                    fromEmail: config.fromEmail,
                    fromName: config.fromName
                } : null
            };
        } catch (error) {
            console.error('❌ [EMAIL_CONFIG] Error getting status:', error);
            return {
                configured: false,
                transporterReady: false,
                error: error.message
            };
        }
    }
}

// Create singleton instance
const emailConfigService = new EmailConfigService();

module.exports = emailConfigService;
