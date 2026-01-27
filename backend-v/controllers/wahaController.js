const axios = require('axios');
const mongoose = require('mongoose');

/**
 * WAHA WhatsApp Controller
 * Integrates with WAHA (WhatsApp HTTP API) server
 */

class WahaManager {
    constructor() {
        this.baseUrl = process.env.WAHA_API_URL || 'http://localhost:3000';
        this.apiKey = process.env.WAHA_API_KEY;
        this.sessions = new Map();
    }

    /**
     * Get axios instance with WAHA config
     */
    getAxiosInstance() {
        return axios.create({
            baseURL: this.baseUrl,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': this.apiKey,
                'Authorization': this.apiKey ? `Bearer ${this.apiKey}` : undefined
            }
        });
    }

    /**
     * List all WAHA sessions
     */
    async listSessions() {
        try {
            const axiosInstance = this.getAxiosInstance();
            const response = await axiosInstance.get('/api/sessions/');
            return { success: true, data: response.data };
        } catch (error) {
            console.error('❌ Failed to list WAHA sessions:', error.response?.data || error.message);
            return { success: false, error: error.response?.data || error.message };
        }
    }

    /**
     * Get specific WAHA session
     */
    async getSession(sessionId) {
        try {
            const axiosInstance = this.getAxiosInstance();
            const response = await axiosInstance.get(`/api/sessions/${sessionId}`);
            return { success: true, data: response.data };
        } catch (error) {
            console.error(`❌ Failed to get WAHA session ${sessionId}:`, error.response?.data || error.message);
            return { success: false, error: error.response?.data || error.message };
        }
    }

    /**
     * Create new WAHA session
     */
    async createSession(sessionId, config = {}) {
        try {
            const axiosInstance = this.getAxiosInstance();
            const response = await axiosInstance.post('/api/sessions/', {
                name: sessionId,
                ...config
            });

            // Track locally
            this.sessions.set(sessionId, {
                id: sessionId,
                status: 'created',
                config,
                createdAt: new Date(),
                lastActivity: new Date()
            });

            console.log(`✅ WAHA session ${sessionId} created`);
            return { success: true, data: response.data };
        } catch (error) {
            console.error(`❌ Failed to create WAHA session ${sessionId}:`, error.response?.data || error.message);
            return { success: false, error: error.response?.data || error.message };
        }
    }

    /**
     * Update WAHA session
     */
    async updateSession(sessionId, config = {}) {
        try {
            const axiosInstance = this.getAxiosInstance();
            const response = await axiosInstance.post(`/api/sessions/${sessionId}/`, config);
            return { success: true, data: response.data };
        } catch (error) {
            console.error(`❌ Failed to update WAHA session ${sessionId}:`, error.response?.data || error.message);
            return { success: false, error: error.response?.data || error.message };
        }
    }

    /**
     * Delete WAHA session
     */
    async deleteSession(sessionId) {
        try {
            const axiosInstance = this.getAxiosInstance();
            await axiosInstance.delete(`/api/sessions/${sessionId}/`);

            // Clean up local tracking
            this.sessions.delete(sessionId);

            console.log(`✅ WAHA session ${sessionId} deleted`);
            return { success: true };
        } catch (error) {
            console.error(`❌ Failed to delete WAHA session ${sessionId}:`, error.response?.data || error.message);
            return { success: false, error: error.response?.data || error.message };
        }
    }

    /**
     * Start WAHA session
     */
    async startSession(sessionId, config = {}) {
        try {
            console.log(`🚀 Starting WAHA session: ${sessionId}`);

            const axiosInstance = this.getAxiosInstance();
            const response = await axiosInstance.post(`/api/sessions/${sessionId}/start`, config);

            // Update local tracking
            const session = this.sessions.get(sessionId);
            if (session) {
                session.status = 'starting';
                session.lastActivity = new Date();
            }

            console.log(`✅ WAHA session ${sessionId} started`);
            return { success: true, data: response.data };

        } catch (error) {
            console.error(`❌ Failed to start WAHA session ${sessionId}:`, error.response?.data || error.message);
            return { success: false, error: error.response?.data || error.message };
        }
    }

    /**
     * Stop WAHA session
     */
    async stopSession(sessionId) {
        try {
            console.log(`🛑 Stopping WAHA session: ${sessionId}`);

            const axiosInstance = this.getAxiosInstance();
            const response = await axiosInstance.post(`/api/sessions/${sessionId}/stop`);

            console.log(`✅ WAHA session ${sessionId} stopped`);
            return { success: true, data: response.data };

        } catch (error) {
            console.error(`❌ Failed to stop WAHA session ${sessionId}:`, error.response?.data || error.message);
            return { success: false, error: error.response?.data || error.message };
        }
    }

    /**
     * Restart WAHA session
     */
    async restartSession(sessionId) {
        try {
            const axiosInstance = this.getAxiosInstance();
            const response = await axiosInstance.post(`/api/sessions/${sessionId}/restart`);
            return { success: true, data: response.data };
        } catch (error) {
            console.error(`❌ Failed to restart WAHA session ${sessionId}:`, error.response?.data || error.message);
            return { success: false, error: error.response?.data || error.message };
        }
    }

    /**
     * Logout from WAHA session
     */
    async logoutSession(sessionId) {
        try {
            const axiosInstance = this.getAxiosInstance();
            const response = await axiosInstance.post('/api/sessions/logout', { session: sessionId });

            // Update local tracking
            const session = this.sessions.get(sessionId);
            if (session) {
                session.status = 'logged_out';
                session.lastActivity = new Date();
            }

            return { success: true, data: response.data };
        } catch (error) {
            console.error(`❌ Failed to logout from WAHA session ${sessionId}:`, error.response?.data || error.message);
            return { success: false, error: error.response?.data || error.message };
        }
    }

    /**
     * Get QR code for session
     */
    async getQR(sessionId) {
        try {
            console.log(`📱 Getting QR for WAHA session: ${sessionId}`);

            const axiosInstance = this.getAxiosInstance();
            const response = await axiosInstance.post(`/api/${sessionId}/auth/qr`);

            const session = this.sessions.get(sessionId);
            if (session) {
                session.lastActivity = new Date();
                session.qrCode = response.data.qr;
                session.status = 'qr_ready';
            }

            console.log(`✅ QR retrieved for session ${sessionId}`);
            return { success: true, data: response.data };

        } catch (error) {
            console.error(`❌ Failed to get QR for session ${sessionId}:`, error.response?.data || error.message);

            // Check if session doesn't exist
            if (error.response?.status === 404) {
                const session = this.sessions.get(sessionId);
                if (session) {
                    session.status = 'not_found';
                }
            }

            return { success: false, error: error.response?.data || error.message };
        }
    }

    /**
     * Request auth code for session
     */
    async requestCode(sessionId, phoneNumber) {
        try {
            const axiosInstance = this.getAxiosInstance();
            const response = await axiosInstance.post(`/api/${sessionId}/auth/request-code`, {
                phone: phoneNumber
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error(`❌ Failed to request code for session ${sessionId}:`, error.response?.data || error.message);
            return { success: false, error: error.response?.data || error.message };
        }
    }

    /**
     * Get screenshot
     */
    async getScreenshot(sessionId) {
        try {
            const axiosInstance = this.getAxiosInstance();
            const response = await axiosInstance.get('/api/screenshot', {
                params: { session: sessionId }
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error(`❌ Failed to get screenshot for session ${sessionId}:`, error.response?.data || error.message);
            return { success: false, error: error.response?.data || error.message };
        }
    }

    /**
     * Get me (current user info)
     */
    async getMe(sessionId) {
        try {
            const axiosInstance = this.getAxiosInstance();
            const response = await axiosInstance.get(`/api/sessions/${sessionId}/me`);

            const session = this.sessions.get(sessionId);
            if (session) {
                session.lastActivity = new Date();
                session.status = 'connected';
                if (response.data.phone) {
                    session.phoneNumber = response.data.phone;
                }
            }

            return { success: true, data: response.data };
        } catch (error) {
            console.error(`❌ Failed to get me for session ${sessionId}:`, error.response?.data || error.message);
            return { success: false, error: error.response?.data || error.message };
        }
    }

    /**
     * Send text message via WAHA
     */
    async sendMessage(sessionId, chatId, message) {
        try {
            const axiosInstance = this.getAxiosInstance();
            const response = await axiosInstance.post('/api/sendText', {
                session: sessionId,
                chatId,
                text: message
            });

            return { success: true, data: response.data };

        } catch (error) {
            console.error(`❌ Failed to send message via session ${sessionId}:`, error.response?.data || error.message);
            return { success: false, error: error.response?.data || error.message };
        }
    }

    /**
     * Send seen receipt
     */
    async sendSeen(sessionId, chatId, messageId) {
        try {
            const axiosInstance = this.getAxiosInstance();
            const response = await axiosInstance.post('/api/sendSeen', {
                session: sessionId,
                chatId,
                messageId
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error(`❌ Failed to send seen for session ${sessionId}:`, error.response?.data || error.message);
            return { success: false, error: error.response?.data || error.message };
        }
    }

    /**
     * Send image message
     */
    async sendImage(sessionId, chatId, imageUrl, caption = '') {
        try {
            const axiosInstance = this.getAxiosInstance();
            const response = await axiosInstance.post('/api/sendImage', {
                session: sessionId,
                chatId,
                media: imageUrl,
                caption
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error(`❌ Failed to send image for session ${sessionId}:`, error.response?.data || error.message);
            return { success: false, error: error.response?.data || error.message };
        }
    }

    /**
     * Send file message
     */
    async sendFile(sessionId, chatId, fileUrl, filename) {
        try {
            const axiosInstance = this.getAxiosInstance();
            const response = await axiosInstance.post('/api/sendFile', {
                session: sessionId,
                chatId,
                media: fileUrl,
                filename
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error(`❌ Failed to send file for session ${sessionId}:`, error.response?.data || error.message);
            return { success: false, error: error.response?.data || error.message };
        }
    }

    /**
     * Get local session info
     */
    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }

    /**
     * Clean up old sessions
     */
    cleanupOldSessions() {
        const now = new Date();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        for (const [sessionId, session] of this.sessions) {
            if (now - session.lastActivity > maxAge) {
                console.log(`🧹 Cleaning up old WAHA session: ${sessionId}`);
                this.sessions.delete(sessionId);
            }
        }
    }
}

// Create singleton instance
const wahaManager = new WahaManager();

// Auto cleanup old sessions every hour
setInterval(() => {
    wahaManager.cleanupOldSessions();
}, 60 * 60 * 1000);

/**
 * Controller Functions - Session Management
 */

// List all WAHA sessions
const listWahaSessions = async (req, res) => {
    try {
        const result = await wahaManager.listSessions();

        if (result.success) {
            res.json({
                success: true,
                data: result.data
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to list WAHA sessions',
                error: result.error
            });
        }
    } catch (error) {
        console.error('❌ Error listing WAHA sessions:', error);
        res.status(500).json({
            success: false,
            message: 'Error listing sessions',
            error: error.message
        });
    }
};

// Get specific WAHA session
const getWahaSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const result = await wahaManager.getSession(sessionId);

        if (result.success) {
            res.json({
                success: true,
                data: result.data
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to get WAHA session',
                error: result.error
            });
        }
    } catch (error) {
        console.error('❌ Error getting WAHA session:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting session',
            error: error.message
        });
    }
};

// Create WAHA session
const createWahaSession = async (req, res) => {
    try {
        const { name, ...config } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Session name is required'
            });
        }

        const result = await wahaManager.createSession(name, config);

        if (result.success) {
            res.json({
                success: true,
                data: result.data
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to create WAHA session',
                error: result.error
            });
        }
    } catch (error) {
        console.error('❌ Error creating WAHA session:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating session',
            error: error.message
        });
    }
};

// Update WAHA session
const updateWahaSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const config = req.body;

        const result = await wahaManager.updateSession(sessionId, config);

        if (result.success) {
            res.json({
                success: true,
                data: result.data
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to update WAHA session',
                error: result.error
            });
        }
    } catch (error) {
        console.error('❌ Error updating WAHA session:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating session',
            error: error.message
        });
    }
};

// Delete WAHA session
const deleteWahaSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const result = await wahaManager.deleteSession(sessionId);

        if (result.success) {
            res.json({
                success: true,
                message: 'WAHA session deleted successfully'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to delete WAHA session',
                error: result.error
            });
        }
    } catch (error) {
        console.error('❌ Error deleting WAHA session:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting session',
            error: error.message
        });
    }
};

// Start WAHA session
const startWahaSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const config = req.body;

        const result = await wahaManager.startSession(sessionId, config);

        if (result.success) {
            res.json({
                success: true,
                data: {
                    sessionId,
                    status: 'starting',
                    message: 'WAHA session started. Waiting for QR code...',
                    ...result.data
                }
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to start WAHA session',
                error: result.error
            });
        }
    } catch (error) {
        console.error('❌ Error starting WAHA session:', error);
        res.status(500).json({
            success: false,
            message: 'Error starting WAHA session',
            error: error.message
        });
    }
};

// Stop WAHA session
const stopWahaSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const result = await wahaManager.stopSession(sessionId);

        if (result.success) {
            res.json({
                success: true,
                message: 'WAHA session stopped successfully',
                data: result.data
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to stop WAHA session',
                error: result.error
            });
        }
    } catch (error) {
        console.error('❌ Error stopping WAHA session:', error);
        res.status(500).json({
            success: false,
            message: 'Error stopping session',
            error: error.message
        });
    }
};

// Restart WAHA session
const restartWahaSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const result = await wahaManager.restartSession(sessionId);

        if (result.success) {
            res.json({
                success: true,
                data: result.data
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to restart WAHA session',
                error: result.error
            });
        }
    } catch (error) {
        console.error('❌ Error restarting WAHA session:', error);
        res.status(500).json({
            success: false,
            message: 'Error restarting session',
            error: error.message
        });
    }
};

// Logout from WAHA session
const logoutWahaSession = async (req, res) => {
    try {
        const { session } = req.body;

        if (!session) {
            return res.status(400).json({
                success: false,
                message: 'Session ID is required'
            });
        }

        const result = await wahaManager.logoutSession(session);

        if (result.success) {
            res.json({
                success: true,
                data: result.data
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to logout from WAHA session',
                error: result.error
            });
        }
    } catch (error) {
        console.error('❌ Error logging out from WAHA session:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging out from session',
            error: error.message
        });
    }
};

// Get screenshot
const getWahaScreenshot = async (req, res) => {
    try {
        const { session } = req.query;

        const result = await wahaManager.getScreenshot(session);

        if (result.success) {
            res.json({
                success: true,
                data: result.data
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to get screenshot',
                error: result.error
            });
        }
    } catch (error) {
        console.error('❌ Error getting WAHA screenshot:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting screenshot',
            error: error.message
        });
    }
};

// Get me (current user info)
const getWahaMe = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const result = await wahaManager.getMe(sessionId);

        if (result.success) {
            res.json({
                success: true,
                data: result.data
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to get user info',
                error: result.error
            });
        }
    } catch (error) {
        console.error('❌ Error getting WAHA user info:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting user info',
            error: error.message
        });
    }
};

// Get WAHA QR code
const getWahaQR = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const result = await wahaManager.getQR(sessionId);

        if (result.success) {
            res.json({
                success: true,
                data: {
                    qrCode: result.data.qr,
                    sessionId,
                    status: result.data.status || 'qr_ready',
                    ...result.data
                }
            });
        } else {
            const statusCode = result.error?.status === 404 ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                message: 'Failed to get QR code',
                error: result.error
            });
        }
    } catch (error) {
        console.error('❌ Error getting WAHA QR:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting QR code',
            error: error.message
        });
    }
};

// Request auth code
const requestWahaCode = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
        }

        const result = await wahaManager.requestCode(sessionId, phone);

        if (result.success) {
            res.json({
                success: true,
                data: result.data
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to request auth code',
                error: result.error
            });
        }
    } catch (error) {
        console.error('❌ Error requesting WAHA code:', error);
        res.status(500).json({
            success: false,
            message: 'Error requesting auth code',
            error: error.message
        });
    }
};

/**
 * Controller Functions - Messaging
 */

// Send text message
const sendWahaText = async (req, res) => {
    try {
        const { session, chatId, text } = req.body;

        if (!session || !chatId || !text) {
            return res.status(400).json({
                success: false,
                message: 'Session, chatId, and text are required'
            });
        }

        const result = await wahaManager.sendMessage(session, chatId, text);

        if (result.success) {
            res.json({
                success: true,
                data: result.data
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send text message',
                error: result.error
            });
        }
    } catch (error) {
        console.error('❌ Error sending WAHA text:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending text message',
            error: error.message
        });
    }
};

// Send seen receipt
const sendWahaSeen = async (req, res) => {
    try {
        const { session, chatId, messageId } = req.body;

        if (!session || !chatId || !messageId) {
            return res.status(400).json({
                success: false,
                message: 'Session, chatId, and messageId are required'
            });
        }

        const result = await wahaManager.sendSeen(session, chatId, messageId);

        if (result.success) {
            res.json({
                success: true,
                data: result.data
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send seen receipt',
                error: result.error
            });
        }
    } catch (error) {
        console.error('❌ Error sending WAHA seen:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending seen receipt',
            error: error.message
        });
    }
};

// Send image
const sendWahaImage = async (req, res) => {
    try {
        const { session, chatId, media, caption } = req.body;

        if (!session || !chatId || !media) {
            return res.status(400).json({
                success: false,
                message: 'Session, chatId, and media are required'
            });
        }

        const result = await wahaManager.sendImage(session, chatId, media, caption);

        if (result.success) {
            res.json({
                success: true,
                data: result.data
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send image',
                error: result.error
            });
        }
    } catch (error) {
        console.error('❌ Error sending WAHA image:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending image',
            error: error.message
        });
    }
};

// Send file
const sendWahaFile = async (req, res) => {
    try {
        const { session, chatId, media, filename } = req.body;

        if (!session || !chatId || !media || !filename) {
            return res.status(400).json({
                success: false,
                message: 'Session, chatId, media, and filename are required'
            });
        }

        const result = await wahaManager.sendFile(session, chatId, media, filename);

        if (result.success) {
            res.json({
                success: true,
                data: result.data
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send file',
                error: result.error
            });
        }
    } catch (error) {
        console.error('❌ Error sending WAHA file:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending file',
            error: error.message
        });
    }
};

// Create messaging channel from WAHA session
const createWahaChannel = async (req, res) => {
    try {
        const { sessionId, name } = req.body;
        const adminId = req.admin.id;

        // Check if session is connected
        const session = wahaManager.getSession(sessionId);
        if (!session || session.status !== 'connected') {
            return res.status(400).json({
                success: false,
                message: 'WAHA session not connected'
            });
        }

        const MessagingChannel = mongoose.model('MessagingChannel');

        // Create channel
        const channel = await MessagingChannel.create({
            name: name || `WAHA WhatsApp - ${session.phoneNumber}`,
            type: 'whatsapp_waha',
            description: `WAHA WhatsApp - ${session.phoneNumber}`,
            whatsappWaha: {
                sessionId: session.id,
                phoneNumber: session.phoneNumber,
                apiUrl: wahaManager.baseUrl,
                isConnected: true,
                lastConnectedAt: new Date(),
                connectionStatus: 'connected'
            },
            configuredBy: adminId,
            isActive: true
        });

        // Mark session as used (but don't stop it)
        session.status = 'completed';

        console.log(`✅ Created messaging channel ${channel._id} from WAHA session ${sessionId}`);

        res.json({
            success: true,
            data: channel,
            message: 'WAHA messaging channel created successfully'
        });

    } catch (error) {
        console.error('❌ Error creating WAHA channel:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating messaging channel',
            error: error.message
        });
    }
};

module.exports = {
    // Session management
    listWahaSessions,
    getWahaSession,
    createWahaSession,
    updateWahaSession,
    deleteWahaSession,
    startWahaSession,
    stopWahaSession,
    restartWahaSession,
    logoutWahaSession,
    getWahaScreenshot,
    getWahaMe,
    getWahaQR,
    requestWahaCode,

    // Messaging
    sendWahaText,
    sendWahaSeen,
    sendWahaImage,
    sendWahaFile,

    // Admin functions
    createWahaChannel,
    wahaManager
};