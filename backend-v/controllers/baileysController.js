const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const {
    makeWASocket,
    DisconnectReason,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore,
    Browsers
} = require('@whiskeysockets/baileys');
const pino = require('pino');

/**
 * Bailey's WhatsApp Controller
 * Simple, robust WhatsApp scanner management
 */

class BaileysManager {
    constructor() {
        this.sessions = new Map();
        this.sessionDir = path.join(process.cwd(), 'sessions', 'baileys');
        this.ensureSessionDir();
    }

    async ensureSessionDir() {
        try {
            await fs.mkdir(this.sessionDir, { recursive: true });
        } catch (error) {
            console.warn('Failed to create sessions directory:', error.message);
        }
    }

    /**
     * Create new Bailey's session
     */
    async createSession(deviceName = 'FunnelsEye Device') {
        const sessionId = `bailey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const sessionPath = path.join(this.sessionDir, sessionId);

        console.log(`🚀 Creating Bailey session: ${sessionId}`);

        const session = {
            id: sessionId,
            deviceName,
            status: 'creating',
            qrCode: null,
            phoneNumber: null,
            deviceId: null,
            socket: null,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
            lastActivity: new Date(),
            retryCount: 0,
            maxRetries: 3,
            retryDelay: 2000, // Start with 2 seconds
            isRetrying: false,
            authRestored: false // Track if we restored previous auth
        };

        this.sessions.set(sessionId, session);

        try {
            // Initialize auth state
            const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

            // Check if we have existing auth
            const hasExistingAuth = state.creds?.me?.id || Object.keys(state.keys?.get('app-state-sync-key', '000000')).length > 0;
            session.authRestored = hasExistingAuth;

            console.log(`🔧 Creating WhatsApp socket for session ${sessionId}...`);
            console.log(`🔑 Has existing auth: ${hasExistingAuth}`);

            // Custom logger to avoid Baileys logger issues
            const customLogger = {
                info: (...args) => console.log('📱 [Baileys]', ...args),
                warn: (...args) => console.warn('⚠️ [Baileys]', ...args),
                error: (...args) => console.error('❌ [Baileys]', ...args),
                debug: (...args) => console.debug('🔍 [Baileys]', ...args),
                trace: (...args) => console.debug('🔬 [Baileys]', ...args), // Add trace method
                fatal: (...args) => console.error('💀 [Baileys]', ...args),
                child: () => customLogger
            };

            const socket = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, {})
                },
                printQRInTerminal: false,
                browser: Browsers.macOS('FunnelsEye'),
                logger: customLogger,
                connectTimeoutMs: 30000,
                qrTimeout: 60000,
                defaultQueryTimeoutMs: 60000,
                keepAliveIntervalMs: 30000,
                // Additional options to handle auth issues
                markOnlineOnConnect: false,
                syncFullHistory: false,
                fireInitQueries: false, // Disable init queries that are causing bad-request
                // Only generate QR if we don't have existing auth
                qrTimeout: hasExistingAuth ? 10000 : 60000 // Shorter timeout if we have auth
            });

            console.log(`✅ Socket created for session ${sessionId}`);

            session.socket = socket;

            // Setup event listeners
            this.setupEventListeners(session, saveCreds);

            console.log(`🎧 Event listeners set up for session ${sessionId}`);

            // If we have existing auth, set a timeout to check if we connect without QR
            if (hasExistingAuth) {
                setTimeout(() => {
                    if (session.status === 'creating' || session.status === 'connecting') {
                        console.log(`⏰ Existing auth timeout for ${sessionId}, will try QR if needed`);
                        // Don't change status here, let the connection events handle it
                    }
                }, 15000); // 15 seconds to establish connection with existing auth
            }

            // Set timeout for QR generation/connection
            const qrTimeout = hasExistingAuth ? 30000 : 60000; // Shorter timeout for existing auth
            setTimeout(() => {
                if (session.status === 'creating' || session.status === 'connecting') {
                    console.log(`⏰ Timeout for session ${sessionId} (${hasExistingAuth ? 'existing auth' : 'new session'})`);
                    if (hasExistingAuth && session.status === 'connecting') {
                        // If we have existing auth and are still connecting, might be logged out
                        console.log(`🚫 Existing auth session ${sessionId} might be logged out`);
                        session.status = 'logged_out';
                    } else {
                        session.status = 'timeout';
                    }
                    this.cleanupSession(sessionId);
                }
            }, qrTimeout);

            return sessionId;

        } catch (error) {
            console.error(`❌ Failed to create Bailey session ${sessionId}:`, error.message);
            this.cleanupSession(sessionId);
            throw error;
        }
    }

    /**
     * Check if connection should be retried
     */
    shouldRetryConnection(reason) {
        // Retry for these error codes:
        const retryableErrors = [
            515, // Stream error
            408, // Request timeout
            502, // Bad gateway
            503, // Service unavailable
            504, // Gateway timeout
            DisconnectReason.connectionLost,
            DisconnectReason.connectionClosed,
            DisconnectReason.restartRequired
        ];

        return retryableErrors.includes(reason);
    }

    /**
     * Handle automatic connection retry
     */
    async handleConnectionRetry(session, reason) {
        if (session.isRetrying || session.retryCount >= session.maxRetries) {
            console.log(`⏰ Max retries reached for session ${session.id}`);
            session.status = 'error';
            return;
        }

        session.isRetrying = true;
        session.retryCount++;
        const delay = session.retryDelay * Math.pow(2, session.retryCount - 1); // Exponential backoff

        console.log(`🔄 Retrying connection for ${session.id} (attempt ${session.retryCount}/${session.maxRetries}) in ${delay}ms...`);

        setTimeout(async () => {
            try {
                session.isRetrying = false;
                session.status = 'retrying';

                // Close existing socket
                if (session.socket) {
                    try {
                        session.socket.end();
                        session.socket.ws?.close();
                    } catch (e) {
                        console.warn(`⚠️ Error closing old socket:`, e.message);
                    }
                }

                // Recreate socket
                console.log(`🔧 Recreating socket for session ${session.id}...`);
                const sessionPath = path.join(this.sessionDir, session.id);
                const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

                // Custom logger to avoid Baileys logger issues
                const customLogger = {
                    info: (...args) => console.log('📱 [Baileys]', ...args),
                    warn: (...args) => console.warn('⚠️ [Baileys]', ...args),
                    error: (...args) => console.error('❌ [Baileys]', ...args),
                    debug: (...args) => console.debug('🔍 [Baileys]', ...args),
                    trace: (...args) => console.debug('🔬 [Baileys]', ...args), // Add trace method
                    fatal: (...args) => console.error('💀 [Baileys]', ...args),
                    child: () => customLogger
                };

                const newSocket = makeWASocket({
                    auth: {
                        creds: state.creds,
                        keys: makeCacheableSignalKeyStore(state.keys, {})
                    },
                    printQRInTerminal: false,
                    browser: Browsers.macOS('FunnelsEye'),
                    logger: customLogger,
                    connectTimeoutMs: 30000,
                    qrTimeout: 60000,
                    defaultQueryTimeoutMs: 60000,
                    keepAliveIntervalMs: 30000,
                    // Additional options to handle auth issues
                    markOnlineOnConnect: false,
                    syncFullHistory: false,
                    fireInitQueries: false // Disable init queries that are causing bad-request
                });

                session.socket = newSocket;
                session.lastActivity = new Date();

                // Re-setup event listeners
                this.setupEventListeners(session, saveCreds);

                console.log(`✅ Socket recreated for session ${session.id}, waiting for connection...`);

            } catch (error) {
                console.error(`❌ Failed to retry connection for ${session.id}:`, error.message);
                session.isRetrying = false;
                session.status = 'error';
            }
        }, delay);
    }

    /**
     * Setup socket event listeners
     */
    setupEventListeners(session, saveCreds) {
        const socket = session.socket;

        // QR Code event
        socket.ev.on('qr', (qr) => {
            console.log(`📱 QR CODE GENERATED for session ${session.id}!`);
            console.log(`📄 QR Length: ${qr.length}`);
            session.qrCode = qr;
            session.status = 'qr_ready';
            session.lastActivity = new Date();
            console.log(`✅ Session ${session.id} status set to qr_ready`);
        });

        // Connection update
        socket.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;
            console.log(`🔄 Connection update for ${session.id}:`, { connection, hasQr: !!qr, lastDisconnect: lastDisconnect?.error?.message });

            if (connection === 'close') {
                const reason = lastDisconnect?.error?.output?.statusCode;
                console.log(`❌ Connection closed for ${session.id}, reason:`, reason);

                if (reason === DisconnectReason.loggedOut) {
                    console.log(`🚫 Session ${session.id} logged out - cleaning up`);
                    session.status = 'disconnected';
                    this.cleanupSession(session.id);
                } else if (this.shouldRetryConnection(reason)) {
                    // Auto-retry for recoverable errors
                    this.handleConnectionRetry(session, reason);
                } else {
                    console.log(`❌ Unrecoverable error for ${session.id}, stopping session`);
                    session.status = 'error';
                    // Don't cleanup immediately, let user try again or timeout
                }
            } else if (connection === 'open') {
                session.status = 'connected';
                session.phoneNumber = socket.user?.id?.split('@')[0];
                session.deviceId = socket.user?.id;
                session.lastActivity = new Date();
                console.log(`✅ Bailey session ${session.id} connected as ${session.phoneNumber}`);

                // If we have existing auth and connected directly, we might not need QR
                if (session.authRestored && !session.qrCode) {
                    console.log(`🔄 Session ${session.id} restored from existing auth, no QR needed`);
                }
            } else if (connection === 'connecting') {
                session.status = 'connecting';
                session.isRetrying = false; // Clear retry flag when actively connecting
                console.log(`🔗 Bailey session ${session.id} is connecting...`);
            } else if (!connection) {
                // Handle undefined connection status - might be waiting for QR
                console.log(`⏳ Bailey session ${session.id} waiting for QR or connection...`);
                if (qr) {
                    console.log(`📱 QR received in connection update for ${session.id}`);
                    session.qrCode = qr;
                    session.status = 'qr_ready';
                    session.lastActivity = new Date();
                }
            }
        });

        // Credentials update
        socket.ev.on('creds.update', saveCreds);
    }

    /**
     * Get session status
     */
    getSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) return null;

        // Check if expired
        if (new Date() > session.expiresAt) {
            this.cleanupSession(sessionId);
            return null;
        }

        return {
            id: session.id,
            status: session.status,
            qrCode: session.qrCode,
            phoneNumber: session.phoneNumber,
            deviceId: session.deviceId,
            createdAt: session.createdAt,
            expiresAt: session.expiresAt,
            timeLeft: Math.max(0, session.expiresAt - new Date()),
            retryCount: session.retryCount,
            maxRetries: session.maxRetries,
            isRetrying: session.isRetrying
        };
    }

    /**
     * Connect session (after QR scan)
     */
    async connectSession(sessionId, phoneNumber) {
        const session = this.sessions.get(sessionId);
        if (!session || session.status !== 'connected') {
            throw new Error('Session not ready for connection');
        }

        // Update session info
        session.phoneNumber = phoneNumber;
        session.lastActivity = new Date();

        console.log(`✅ Session ${sessionId} connected with phone: ${phoneNumber}`);

        return {
            sessionId: session.id,
            phoneNumber: session.phoneNumber,
            deviceId: session.deviceId,
            status: 'connected'
        };
    }

    /**
     * Create messaging channel from session
     */
    async createChannel(sessionId, adminId) {
        const session = this.sessions.get(sessionId);
        if (!session || session.status !== 'connected') {
            throw new Error('Session not connected');
        }

        const MessagingChannel = mongoose.model('MessagingChannel');

        // Create channel
        const channel = await MessagingChannel.create({
            name: session.deviceName,
            type: 'whatsapp_bailey',
            description: `Bailey's WhatsApp - ${session.phoneNumber}`,
            whatsappBailey: {
                deviceId: session.deviceId,
                sessionId: session.id,
                phoneNumber: session.phoneNumber,
                isConnected: true,
                lastConnectedAt: new Date(),
                connectionStatus: 'connected'
            },
            configuredBy: adminId,
            isActive: true
        });

        // Mark session as used
        session.status = 'completed';

        // Cleanup after channel creation
        setTimeout(() => this.cleanupSession(sessionId), 5000);

        console.log(`✅ Created messaging channel ${channel._id} from session ${sessionId}`);

        return channel;
    }

    /**
     * Cleanup session
     */
    async cleanupSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) return;

        console.log(`🧹 Cleaning up Bailey session: ${sessionId}`);

        // Close socket
        if (session.socket) {
            try {
                session.socket.end();
                session.socket.ws?.close();
            } catch (error) {
                console.warn(`⚠️ Error closing socket for ${sessionId}:`, error.message);
            }
        }

        // Remove from memory
        this.sessions.delete(sessionId);

        // Cleanup session files after delay
        setTimeout(async () => {
            try {
                const sessionPath = path.join(this.sessionDir, sessionId);
                await fs.rm(sessionPath, { recursive: true, force: true });
                console.log(`🗑️ Cleaned up session files: ${sessionId}`);
            } catch (error) {
                console.warn(`⚠️ Failed to cleanup session files for ${sessionId}:`, error.message);
            }
        }, 30000); // Cleanup files after 30 seconds
    }

    /**
     * Cleanup expired sessions
     */
    cleanupExpiredSessions() {
        const now = new Date();
        for (const [sessionId, session] of this.sessions) {
            if (now > session.expiresAt) {
                this.cleanupSession(sessionId);
            }
        }
    }

    /**
     * Get manager stats
     */
    getStats() {
        const activeSessions = Array.from(this.sessions.values()).filter(s => s.status !== 'completed');
        return {
            activeSessions: activeSessions.length,
            sessions: activeSessions.map(s => ({
                id: s.id,
                status: s.status,
                createdAt: s.createdAt,
                timeLeft: Math.max(0, s.expiresAt - new Date())
            }))
        };
    }
}

// Create singleton instance
const baileysManager = new BaileysManager();

// Auto cleanup expired sessions every 5 minutes
setInterval(() => {
    baileysManager.cleanupExpiredSessions();
}, 5 * 60 * 1000);

/**
 * Controller Functions
 */

// Initialize Bailey session
const initBaileySession = async (req, res) => {
    try {
        const { deviceName } = req.body;
        const sessionId = await baileysManager.createSession(deviceName);

        res.json({
            success: true,
            data: {
                sessionId,
                status: 'creating',
                message: 'Bailey session created. Waiting for QR code...'
            }
        });
    } catch (error) {
        console.error('❌ Error initializing Bailey session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initialize Bailey session',
            error: error.message
        });
    }
};

// Get QR code
const getBaileyQR = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = baileysManager.getSession(sessionId);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Bailey session not found or expired'
            });
        }

        if (session.status === 'qr_ready') {
            res.json({
                success: true,
                data: {
                    qrCode: session.qrCode,
                    sessionId: session.id,
                    expiresIn: Math.floor(session.timeLeft / 1000)
                }
            });
        } else {
            res.json({
                success: true,
                data: {
                    status: session.status,
                    message: session.status === 'creating' ? 'QR code is being generated...' : 'Session not ready'
                }
            });
        }
    } catch (error) {
        console.error('❌ Error getting Bailey QR:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get QR code',
            error: error.message
        });
    }
};

// Get session status
const getBaileyStatus = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = baileysManager.getSession(sessionId);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Bailey session not found or expired'
            });
        }

        res.json({
            success: true,
            data: session
        });
    } catch (error) {
        console.error('❌ Error getting Bailey status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get status',
            error: error.message
        });
    }
};

// Connect session
const connectBaileyDevice = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { phoneNumber } = req.body;

        const result = await baileysManager.connectSession(sessionId, phoneNumber);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('❌ Error connecting Bailey device:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to connect device',
            error: error.message
        });
    }
};

// Create messaging channel from session
const createBaileyChannel = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const adminId = req.admin.id;

        const channel = await baileysManager.createChannel(sessionId, adminId);

        res.json({
            success: true,
            data: channel,
            message: 'Bailey messaging channel created successfully'
        });
    } catch (error) {
        console.error('❌ Error creating Bailey channel:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create messaging channel',
            error: error.message
        });
    }
};

// Disconnect and cleanup session
const disconnectBaileySession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        await baileysManager.cleanupSession(sessionId);

        res.json({
            success: true,
            message: 'Bailey session disconnected and cleaned up'
        });
    } catch (error) {
        console.error('❌ Error disconnecting Bailey session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to disconnect session',
            error: error.message
        });
    }
};

// Get manager stats
const getBaileyStats = async (req, res) => {
    try {
        const stats = baileysManager.getStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('❌ Error getting Bailey stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get stats',
            error: error.message
        });
    }
};

module.exports = {
    initBaileySession,
    getBaileyQR,
    getBaileyStatus,
    connectBaileyDevice,
    createBaileyChannel,
    disconnectBaileySession,
    getBaileyStats
};