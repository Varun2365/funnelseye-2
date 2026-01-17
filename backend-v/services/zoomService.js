const axios = require('axios');
const crypto = require('crypto');
const ZoomIntegration = require('../schema/ZoomIntegration');
const Appointment = require('../schema/Appointment');

/**
 * Zoom Integration Service
 * Handles Zoom API operations, meeting creation, and automatic link generation
 */
class ZoomService {
    constructor() {
        this.baseURL = 'https://api.zoom.us/v2';
        this.zoomAccountId = process.env.ZOOM_ACCOUNT_ID;
        this.zoomClientId = process.env.ZOOM_CLIENT_ID;
        this.zoomClientSecret = process.env.ZOOM_CLIENT_SECRET;
    }

    /**
     * Generate OAuth access token for Zoom API authentication
     * Supports both OAuth 2.0 (authorization code) and Server-to-Server OAuth
     */
    async generateOAuthToken(clientId, clientSecret, accountId, integration = null) {
        try {
            // If integration has a valid OAuth 2.0 access token, use it
            if (integration && integration.accessToken) {
                const now = new Date();
                const expiresAt = integration.tokenExpiresAt ? new Date(integration.tokenExpiresAt) : null;
                
                // Check if token is still valid (with 5 minute buffer)
                if (!expiresAt || now < new Date(expiresAt.getTime() - 5 * 60 * 1000)) {
                    return {
                        accessToken: integration.accessToken,
                        expiresIn: expiresAt ? Math.floor((expiresAt - now) / 1000) : 3600,
                        tokenType: 'Bearer'
                    };
                }
                
                // Token expired, try to refresh
                if (integration.refreshToken) {
                    try {
                        const refreshed = await this.refreshOAuthToken(integration.refreshToken);
                        // Update integration with new token
                        integration.accessToken = refreshed.accessToken;
                        integration.tokenExpiresAt = new Date(Date.now() + (refreshed.expiresIn * 1000));
                        await integration.save();
                        return refreshed;
                    } catch (refreshError) {
                        console.error('[ZoomService] Token refresh failed:', refreshError);
                        // Fall through to generate new token
                    }
                }
            }

            // Fallback to Server-to-Server OAuth if OAuth 2.0 token not available
            if (!clientId || !clientSecret || !accountId) {
                throw new Error('OAuth credentials not available');
            }

            const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
            
            const response = await axios.post('https://zoom.us/oauth/token', 
                'grant_type=account_credentials&account_id=' + accountId,
                {
                    headers: {
                        'Authorization': `Basic ${credentials}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            return {
                accessToken: response.data.access_token,
                expiresIn: response.data.expires_in,
                tokenType: response.data.token_type
            };
        } catch (error) {
            console.error('[ZoomService] Error generating OAuth token:', error.response?.data || error.message);
            throw new Error('Failed to generate OAuth token');
        }
    }

    /**
     * Refresh OAuth 2.0 access token using refresh token
     */
    async refreshOAuthToken(refreshToken) {
        try {
            const zoomClientId = process.env.ZOOM_OAUTH_CLIENT_ID;
            const zoomClientSecret = process.env.ZOOM_OAUTH_CLIENT_SECRET;

            if (!zoomClientId || !zoomClientSecret) {
                throw new Error('Zoom OAuth credentials not configured');
            }

            const response = await axios.post('https://zoom.us/oauth/token', null, {
                params: {
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken
                },
                auth: {
                    username: zoomClientId,
                    password: zoomClientSecret
                }
            });

            return {
                accessToken: response.data.access_token,
                refreshToken: response.data.refresh_token || refreshToken,
                expiresIn: response.data.expires_in,
                tokenType: 'Bearer'
            };
        } catch (error) {
            console.error('[ZoomService] Error refreshing OAuth token:', error.response?.data || error.message);
            throw new Error('Failed to refresh OAuth token');
        }
    }

    /**
     * Get Zoom integration for a coach
     */
    async getCoachIntegration(coachId) {
        try {
            const integration = await ZoomIntegration.findOne({ 
                coachId, 
                isActive: true 
            });

            if (!integration) {
                throw new Error(`Zoom integration not found for coach ${coachId}. Please set up Zoom integration first.`);
            }

            return integration;
        } catch (error) {
            console.error(`[ZoomService] Error getting coach integration:`, error);
            throw error;
        }
    }

    /**
     * Create a custom Zoom meeting for automation rules
     * @param {object} config - Meeting configuration from automation rule
     * @param {string} coachId - Coach ID who owns the integration
     */
    async createCustomMeeting(config, coachId) {
        try {
            console.log(`[ZoomService] Creating custom Zoom meeting for coach: ${coachId}`);

            // Get Zoom integration for the coach
            const integration = await ZoomIntegration.findOne({ coachId });
            if (!integration) {
                throw new Error('Zoom integration not found for coach');
            }

            // Generate OAuth token
            const tokenData = await this.generateOAuthToken(
                integration.clientId,
                integration.clientSecret,
                integration.accountId,
                integration
            );

            // Prepare meeting data from config
            const meetingData = {
                topic: config.meetingTopic || 'Automation Meeting',
                type: config.meetingType === 'scheduled' ? 2 : 1, // 1 = instant, 2 = scheduled
                start_time: config.startDate && config.startTime ?
                    new Date(`${config.startDate}T${config.startTime}`).toISOString() : undefined,
                duration: config.duration || 60,
                timezone: config.timezone || 'UTC',
                agenda: config.meetingDescription || '',
                settings: {
                    host_video: true,
                    participant_video: true,
                    join_before_host: config.joinBeforeHost || false,
                    mute_upon_entry: false,
                    watermark: false,
                    use_pmi: false,
                    approval_type: 0, // Automatically approve
                    audio: 'both', // Both telephone and computer audio
                    auto_recording: config.autoRecord ? 'cloud' : 'none',
                    waiting_room: false
                }
            };

            // Add password if configured
            if (config.passwordProtected) {
                meetingData.password = this.generateMeetingPassword();
            }

            console.log(`[ZoomService] Creating meeting with data:`, JSON.stringify(meetingData, null, 2));

            // Create the meeting
            const response = await axios.post(`${this.baseURL}/users/me/meetings`, meetingData, {
                headers: {
                    'Authorization': `Bearer ${tokenData.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            const zoomMeeting = response.data;

            // Update usage stats
            await integration.updateUsageStats({
                participants: 0,
                duration: config.duration || 60
            });

            console.log(`[ZoomService] Successfully created custom Zoom meeting: ${zoomMeeting.id}`);

            return {
                success: true,
                meetingId: zoomMeeting.id,
                joinUrl: zoomMeeting.join_url,
                startUrl: zoomMeeting.start_url,
                password: zoomMeeting.password,
                topic: zoomMeeting.topic,
                startTime: zoomMeeting.start_time,
                duration: zoomMeeting.duration
            };

        } catch (error) {
            console.error(`[ZoomService] Error creating custom meeting:`, error);
            throw new Error(`Failed to create Zoom meeting: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Generate a random meeting password
     */
    generateMeetingPassword() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    /**
     * Create a Zoom meeting for an appointment
     */
    async createMeetingForAppointment(appointmentId) {
        try {
            console.log(`[ZoomService] Creating Zoom meeting for appointment: ${appointmentId}`);

            // Get appointment details
            const appointment = await Appointment.findById(appointmentId)
                .populate('coachId')
                .populate('leadId');

            if (!appointment) {
                throw new Error('Appointment not found');
            }

            // Check if appointment is online (with backward compatibility)
            if (appointment.appointmentType && appointment.appointmentType !== 'online') {
                throw new Error('Appointment is not online type');
            }
            
            // If appointmentType is not set, assume it's online (for backward compatibility)
            if (!appointment.appointmentType) {
                console.log(`[ZoomService] Appointment ${appointment._id} has no appointmentType, assuming online`);
            }

            // Get coach's Zoom integration
            const integration = await this.getCoachIntegration(appointment.coachId._id);

            // Generate OAuth token (supports both OAuth 2.0 and Server-to-Server)
            const tokenData = await this.generateOAuthToken(
                integration.clientId, 
                integration.clientSecret, 
                integration.zoomAccountId,
                integration // Pass integration to use OAuth 2.0 tokens if available
            );
            const token = tokenData.accessToken;

            // Prepare meeting data
            const meetingData = {
                topic: `Session with ${appointment.leadId?.name || 'Client'}`,
                type: 2, // Scheduled meeting
                start_time: appointment.startTime.toISOString(),
                duration: appointment.duration || 60,
                timezone: appointment.timezone || 'UTC',
                password: this.generateMeetingPassword(),
                settings: {
                    host_video: integration.meetingSettings.settings.hostVideo,
                    participant_video: integration.meetingSettings.settings.participantVideo,
                    join_before_host: integration.meetingSettings.settings.joinBeforeHost,
                    mute_upon_entry: integration.meetingSettings.settings.muteUponEntry,
                    watermark: integration.meetingSettings.settings.watermark,
                    use_pmi: integration.meetingSettings.settings.usePersonalMeetingId,
                    waiting_room: integration.meetingSettings.settings.waitingRoom,
                    auto_recording: integration.meetingSettings.settings.autoRecording
                }
            };

            // Create meeting via Zoom API
            const response = await axios.post(
                `${this.baseURL}/users/me/meetings`,
                meetingData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const zoomMeeting = response.data;

            // Update appointment with Zoom meeting details
            appointment.zoomMeeting = {
                meetingId: zoomMeeting.id,
                joinUrl: zoomMeeting.join_url,
                startUrl: zoomMeeting.start_url,
                password: zoomMeeting.password,
                zoomMeetingId: zoomMeeting.id
            };

            await appointment.save();

            // Update Zoom integration usage stats
            await integration.updateUsageStats({
                participants: 1,
                duration: appointment.duration || 60
            });

            console.log(`[ZoomService] Successfully created Zoom meeting: ${zoomMeeting.id}`);

            return {
                success: true,
                meetingId: zoomMeeting.id,
                joinUrl: zoomMeeting.join_url,
                startUrl: zoomMeeting.start_url,
                password: zoomMeeting.password
            };

        } catch (error) {
            console.error(`[ZoomService] Error creating meeting:`, error);
            throw error;
        }
    }

    /**
     * Generate a secure meeting password
     */
    generateMeetingPassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let password = '';
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    /**
     * Update an existing Zoom meeting
     */
    async updateMeeting(appointmentId, updates) {
        try {
            const appointment = await Appointment.findById(appointmentId);
            if (!appointment || !appointment.zoomMeeting) {
                throw new Error('Appointment or Zoom meeting not found');
            }

            const integration = await this.getCoachIntegration(appointment.coachId);
            const tokenData = await this.generateOAuthToken(
                integration.clientId, 
                integration.clientSecret, 
                integration.zoomAccountId,
                integration // Pass integration to use OAuth 2.0 tokens if available
            );
            const token = tokenData.accessToken;

            const meetingData = {
                topic: updates.topic || appointment.zoomMeeting.topic,
                start_time: updates.startTime ? updates.startTime.toISOString() : appointment.startTime.toISOString(),
                duration: updates.duration || appointment.duration || 60,
                timezone: updates.timezone || appointment.timezone || 'UTC'
            };

            const response = await axios.patch(
                `${this.baseURL}/meetings/${appointment.zoomMeeting.meetingId}`,
                meetingData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Update appointment if needed
            if (updates.startTime) appointment.startTime = updates.startTime;
            if (updates.duration) appointment.duration = updates.duration;
            if (updates.timezone) appointment.timezone = updates.timezone;

            await appointment.save();

            return {
                success: true,
                message: 'Meeting updated successfully'
            };

        } catch (error) {
            console.error(`[ZoomService] Error updating meeting:`, error);
            throw error;
        }
    }

    /**
     * Delete a Zoom meeting
     */
    async deleteMeeting(appointmentId) {
        try {
            const appointment = await Appointment.findById(appointmentId);
            if (!appointment || !appointment.zoomMeeting) {
                throw new Error('Appointment or Zoom meeting not found');
            }

            const integration = await this.getCoachIntegration(appointment.coachId);
            const tokenData = await this.generateOAuthToken(
                integration.clientId, 
                integration.clientSecret, 
                integration.zoomAccountId,
                integration // Pass integration to use OAuth 2.0 tokens if available
            );
            const token = tokenData.accessToken;

            await axios.delete(
                `${this.baseURL}/meetings/${appointment.zoomMeeting.meetingId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            // Remove Zoom meeting details from appointment
            appointment.zoomMeeting = undefined;
            await appointment.save();

            return {
                success: true,
                message: 'Meeting deleted successfully'
            };

        } catch (error) {
            console.error(`[ZoomService] Error deleting meeting:`, error);
            throw error;
        }
    }

    /**
     * Get meeting details
     */
    async getMeetingDetails(meetingId, coachId) {
        try {
            const integration = await this.getCoachIntegration(coachId);
            const tokenData = await this.generateOAuthToken(
                integration.clientId, 
                integration.clientSecret, 
                integration.zoomAccountId,
                integration // Pass integration to use OAuth 2.0 tokens if available
            );
            const token = tokenData.accessToken;

            const response = await axios.get(
                `${this.baseURL}/meetings/${meetingId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            return {
                success: true,
                meeting: response.data
            };

        } catch (error) {
            console.error(`[ZoomService] Error getting meeting details:`, error);
            throw error;
        }
    }

    /**
     * Get meeting participants
     */
    async getMeetingParticipants(meetingId, coachId) {
        try {
            const integration = await this.getCoachIntegration(coachId);
            const tokenData = await this.generateOAuthToken(
                integration.clientId, 
                integration.clientSecret, 
                integration.zoomAccountId,
                integration // Pass integration to use OAuth 2.0 tokens if available
            );
            const token = tokenData.accessToken;

            const response = await axios.get(
                `${this.baseURL}/meetings/${meetingId}/participants`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            return {
                success: true,
                participants: response.data.participants || []
            };

        } catch (error) {
            console.error(`[ZoomService] Error getting meeting participants:`, error);
            throw error;
        }
    }

    /**
     * Test Zoom integration connection
     */
    async testConnection(coachId) {
        try {
            const integration = await this.getCoachIntegration(coachId);
            const tokenData = await this.generateOAuthToken(
                integration.clientId, 
                integration.clientSecret, 
                integration.zoomAccountId,
                integration // Pass integration to use OAuth 2.0 tokens if available
            );
            const token = tokenData.accessToken;

            // Test API connection by getting user profile
            const response = await axios.get(
                `${this.baseURL}/users/me`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            return {
                success: true,
                message: 'Connection successful',
                user: response.data
            };

        } catch (error) {
            console.error(`[ZoomService] Connection test failed:`, error);
            return {
                success: false,
                message: 'Connection failed',
                error: error.message
            };
        }
    }

    /**
     * Get Zoom account usage statistics
     */
    async getAccountUsage(coachId) {
        try {
            const integration = await this.getCoachIntegration(coachId);
            
            return {
                success: true,
                usage: integration.usageStats,
                lastSync: integration.lastSync
            };

        } catch (error) {
            console.error(`[ZoomService] Error getting usage stats:`, error);
            throw error;
        }
    }

    /**
     * Get Zoom meeting details for a specific appointment
     */
    async getZoomMeetingForAppointment(appointmentId, coachId) {
        try {
            const appointment = await Appointment.findById(appointmentId)
                .populate('leadId', 'name email phone')
                .populate('coachId', 'name email');

            if (!appointment) {
                throw new Error('Appointment not found');
            }

            if (appointment.coachId._id.toString() !== coachId.toString()) {
                throw new Error('Unauthorized access to appointment');
            }

            if (!appointment.zoomMeeting) {
                return {
                    success: false,
                    message: 'No Zoom meeting found for this appointment',
                    appointment: {
                        id: appointment._id,
                        startTime: appointment.startTime,
                        duration: appointment.duration,
                        leadName: appointment.leadId?.name,
                        status: appointment.status
                    }
                };
            }

            return {
                success: true,
                meeting: appointment.zoomMeeting,
                appointment: {
                    id: appointment._id,
                    startTime: appointment.startTime,
                    duration: appointment.duration,
                    leadName: appointment.leadId?.name,
                    status: appointment.status,
                    appointmentType: appointment.appointmentType
                }
            };
        } catch (error) {
            console.error(`[ZoomService] Error getting meeting details:`, error);
            throw error;
        }
    }

    /**
     * Get all Zoom meetings for a coach
     */
    async getCoachZoomMeetings(coachId) {
        try {
            const appointments = await Appointment.find({
                coachId: coachId,
                'zoomMeeting.meetingId': { $exists: true }
            })
            .populate('leadId', 'name email phone')
            .sort('-startTime');

            const meetings = appointments.map(appointment => ({
                meetingId: appointment.zoomMeeting.meetingId,
                joinUrl: appointment.zoomMeeting.joinUrl,
                startUrl: appointment.zoomMeeting.startUrl,
                password: appointment.zoomMeeting.password,
                appointment: {
                    id: appointment._id,
                    startTime: appointment.startTime,
                    duration: appointment.duration,
                    leadName: appointment.leadId?.name,
                    leadEmail: appointment.leadId?.email,
                    status: appointment.status
                }
            }));

            return {
                success: true,
                meetings: meetings,
                total: meetings.length
            };
        } catch (error) {
            console.error(`[ZoomService] Error getting coach meetings:`, error);
            throw error;
        }
    }
}

module.exports = new ZoomService();
