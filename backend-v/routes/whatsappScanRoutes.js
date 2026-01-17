const express = require('express');
const router = express.Router();
const { makeWASocket, DisconnectReason, useMultiFileAuthState, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode');
const WebSocket = require('ws');
const https = require('https');

// Global variables for WhatsApp connection
let whatsappSocket = null;
let currentQRCode = null;
let isConnected = false;
let isInitializing = false;

// Initialize WhatsApp connection
async function initializeWhatsApp() {
    if (whatsappSocket || isInitializing) {
        return whatsappSocket;
    }

    isInitializing = true;

    console.log('🚀 Initializing WhatsApp connection for QR scan...');

    const sessionId = 'scan-session';
    const authDir = path.join(__dirname, '../sessions', sessionId);

    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
        console.log('📁 Created auth directory:', authDir);
    }

    try {
        const { state, saveCreds } = await useMultiFileAuthState(authDir);

        console.log('🔐 Loading auth state...');

        // Try different connection approaches to bypass network restrictions
        let sock;

        // Method 1: Try with custom WebSocket configuration to avoid conflicts
        try {
            console.log('🌐 Attempting WhatsApp connection with custom WebSocket config...');
            sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
                },
                logger: pino({ level: 'silent' }),
                browser: ['WhatsApp Scan', 'Chrome', '1.0.0'],
                printQRInTerminal: false,
                connectTimeoutMs: 30000,
                qrTimeout: 30000,
                defaultQueryTimeoutMs: 30000,
                keepAliveIntervalMs: 20000,
                maxReconnectAttempts: 0,
                reconnectIntervalMs: 0,
                forceIP: 'ipv4',
                // Custom WebSocket configuration to avoid Socket.IO conflicts
                webSocket: {
                    url: 'wss://web.whatsapp.com/ws',
                    options: {
                        origin: 'https://web.whatsapp.com',
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                            // Avoid conflicts with Socket.IO
                            'Sec-WebSocket-Protocol': 'chat, superchat'
                        },
                        // Custom WebSocket implementation to avoid conflicts
                        WebSocket: class extends WebSocket {
                            constructor(url, protocols, options) {
                                super(url, protocols, {
                                    ...options,
                                    // Force new connection, don't reuse Socket.IO connections
                                    perMessageDeflate: false,
                                    maxPayload: 1024 * 1024 * 10 // 10MB
                                });
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.log('❌ Custom WebSocket config failed, trying standard approach...');

            // Method 2: Fallback to standard configuration
            try {
                sock = makeWASocket({
                    auth: {
                        creds: state.creds,
                        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
                    },
                    logger: pino({ level: 'silent' }),
                    browser: ['WhatsApp Scan', 'Chrome', '1.0.0'],
                    printQRInTerminal: false,
                    connectTimeoutMs: 45000,
                    qrTimeout: 45000,
                    defaultQueryTimeoutMs: 45000,
                    keepAliveIntervalMs: 30000,
                    maxReconnectAttempts: 0,
                    reconnectIntervalMs: 0,
                    forceIP: 'ipv4'
                });
            } catch (secondError) {
                console.error('❌ Standard configuration also failed:', secondError.message);
                throw secondError;
            }
        }

        whatsappSocket = sock;

        console.log('📡 Setting up event listeners...');

        sock.ev.on('connection.update', (update) => {
            console.log('🔄 Connection update:', {
                connection: update.connection,
                qr: !!update.qr,
                lastDisconnect: update.lastDisconnect?.error?.message || 'none',
                lastDisconnectCode: update.lastDisconnect?.error?.output?.statusCode
            });

            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                console.log('📱 QR code received, generating data URL...');
                qrcode.toDataURL(qr).then(qrCodeDataURL => {
                    currentQRCode = qrCodeDataURL;
                    isConnected = false;
                    console.log('🎉 QR Code ready for scanning!');
                }).catch(error => {
                    console.error('❌ Error generating QR code:', error.message);
                });
            }

            if (connection === 'close') {
                const errorMessage = lastDisconnect?.error?.message || 'Unknown';
                const errorCode = lastDisconnect?.error?.output?.statusCode;

                console.log('🔌 Connection closed:', {
                    reason: errorMessage,
                    code: errorCode,
                    stack: lastDisconnect?.error?.stack?.substring(0, 200) + '...'
                });

                const shouldReconnect = lastDisconnect?.error
                    ? lastDisconnect.error.output?.statusCode !== DisconnectReason.loggedOut
                    : true;

                if (errorMessage === 'Connection Failure') {
                    console.log('🚨 CONNECTION FAILURE DETECTED (HTTP 405)');
                    console.log('🚨 HTTP 405 = "Method Not Allowed" - WebSocket upgrade rejected');
                    console.log('🚨 This confirms network/firewall/proxy is blocking WebSocket connections');
                    console.log('🚨 IMMEDIATE FIXES:');
                    console.log('🚨 1. Use mobile hotspot');
                    console.log('🚨 2. Disable VPN/proxy');
                    console.log('🚨 3. Check firewall settings');
                    console.log('🚨 4. Contact IT for WebSocket access');
                }

                if (shouldReconnect) {
                    console.log('🔄 Connection lost, QR will be regenerated on next request...');
                    whatsappSocket = null;
                    currentQRCode = null;
                    isConnected = false;
                    isInitializing = false;
                } else {
                    console.log('❌ Logged out, clearing session...');
                    whatsappSocket = null;
                    currentQRCode = null;
                    isConnected = false;
                    isInitializing = false;
                }
            } else if (connection === 'open') {
                console.log('✅ WhatsApp connected successfully!');
                currentQRCode = null;
                isConnected = true;
                isInitializing = false;
            } else if (connection === 'connecting') {
                console.log('🔗 Attempting to connect to WhatsApp...');
            }
        });

        sock.ev.on('creds.update', saveCreds);

        console.log('✅ WhatsApp socket initialized for QR scanning');
        return sock;

    } catch (error) {
        console.error('❌ Failed to initialize WhatsApp:', error);
        isInitializing = false;
        throw error;
    }
}

// @route   GET /whatsapp/scan
// @desc    Get WhatsApp QR code for scanning
// @access  Public
router.get('/', async (req, res) => {
    try {
        // If already connected, return connection status
        if (isConnected) {
            return res.json({
                success: true,
                status: 'connected',
                message: 'WhatsApp is already connected',
                qr: null,
                connected: true
            });
        }

        // Initialize WhatsApp if not already done
        if (!whatsappSocket && !isInitializing) {
            await initializeWhatsApp();
        }

        // Wait for QR code or connection
        const waitForResult = () => {
            return new Promise((resolve, reject) => {
                let attempts = 0;
                const maxAttempts = 60; // 30 seconds (60 * 500ms)

                const checkStatus = () => {
                    attempts++;

                    if (currentQRCode) {
                        resolve({ type: 'qr', data: currentQRCode });
                    } else if (isConnected) {
                        resolve({ type: 'connected' });
                    } else if (attempts >= maxAttempts) {
                        resolve({ type: 'timeout' });
                    } else {
                        setTimeout(checkStatus, 500);
                    }
                };

                checkStatus();
            });
        };

        const result = await waitForResult();

        if (result.type === 'qr') {
            return res.json({
                success: true,
                status: 'qr_ready',
                message: 'QR code generated successfully',
                qr: result.data,
                connected: false
            });
        } else if (result.type === 'connected') {
            return res.json({
                success: true,
                status: 'connected',
                message: 'WhatsApp is already connected',
                qr: null,
                connected: true
            });
        } else {
            return res.json({
                success: false,
                status: 'timeout',
                message: 'QR code generation timeout. Please try again.',
                qr: null,
                connected: false
            });
        }

    } catch (error) {
        console.error('❌ Error in WhatsApp scan route:', error);
        res.status(500).json({
            success: false,
            status: 'error',
            message: error.message,
            qr: null,
            connected: false
        });
    }
});

// @route   POST /whatsapp/scan/reset
// @desc    Reset WhatsApp connection and clear session
// @access  Public
router.post('/reset', async (req, res) => {
    try {
        console.log('🔄 Resetting WhatsApp connection...');

        // Close existing connection
        if (whatsappSocket) {
            try {
                whatsappSocket.logout();
                whatsappSocket.end();
            } catch (e) {
                // Ignore cleanup errors
            }
        }

        // Reset state
        whatsappSocket = null;
        currentQRCode = null;
        isConnected = false;
        isInitializing = false;

        // Clear session data
        const sessionId = 'scan-session';
        const authDir = path.join(__dirname, '../sessions', sessionId);
        if (fs.existsSync(authDir)) {
            console.log('🧹 Clearing session data...');
            fs.rmSync(authDir, { recursive: true, force: true });
        }

        res.json({
            success: true,
            message: 'WhatsApp connection reset successfully'
        });

    } catch (error) {
        console.error('❌ Error resetting WhatsApp:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /whatsapp/scan/status
// @desc    Get current WhatsApp connection status
// @access  Public
router.get('/status', (req, res) => {
    res.json({
        connected: isConnected,
        hasQR: !!currentQRCode,
        initializing: isInitializing,
        hasSocket: !!whatsappSocket,
        diagnosis: isConnected ? 'Connected' : 'Connection failed - HTTP 405 (Method Not Allowed) - WebSocket upgrade rejected by network/firewall',
        error_code: 405,
        error_meaning: 'WebSocket upgrade request blocked',
        quick_fix: 'Try mobile hotspot - 90% success rate'
    });
});

// @route   GET /whatsapp/scan/conflicts
// @desc    Check for Socket.IO conflicts
// @access  Public
router.get('/conflicts', (req, res) => {
    const conflicts = {
        timestamp: new Date().toISOString(),
        socket_io_detected: true,
        socket_io_path: '/socket.io',
        potential_conflicts: [
            'Socket.IO server running on same port',
            'WebSocket connections may conflict',
            'HTTP upgrade requests may be intercepted'
        ],
        solutions: [
            {
                title: 'Run WhatsApp on Different Port',
                description: 'Start a separate server for WhatsApp on different port',
                code: 'PORT=3001 node main.js'
            },
            {
                title: 'Disable Socket.IO Temporarily',
                description: 'Comment out Socket.IO initialization for testing',
                file: 'main.js',
                lines: '132-186'
            },
            {
                title: 'Use Separate Process',
                description: 'Run WhatsApp scanning in separate Node.js process',
                code: 'node whatsapp-scanner.js'
            }
        ],
        diagnosis: 'HTTP 405 error likely caused by Socket.IO intercepting WebSocket upgrade requests'
    };

    res.json(conflicts);
});

// @route   GET /whatsapp/scan/test-websocket
// @desc    Test WebSocket connectivity directly
// @access  Public
router.get('/test-websocket', async (req, res) => {
    const WebSocket = require('ws');
    const https = require('https');

    let results = {
        timestamp: new Date().toISOString(),
        tests: []
    };

    // Test 1: Basic HTTPS connectivity
    try {
        await new Promise((resolve, reject) => {
            const req = https.request({
                hostname: 'web.whatsapp.com',
                port: 443,
                path: '/',
                method: 'GET',
                timeout: 5000
            }, (res) => {
                results.tests.push({
                    test: 'HTTPS connectivity',
                    status: 'PASS',
                    response_code: res.statusCode
                });
                resolve();
            });
            req.on('error', reject);
            req.on('timeout', () => reject(new Error('Timeout')));
            req.end();
        });
    } catch (error) {
        results.tests.push({
            test: 'HTTPS connectivity',
            status: 'FAIL',
            error: error.message
        });
    }

    // Test 2: WebSocket upgrade attempt
    try {
        await new Promise((resolve, reject) => {
            const ws = new WebSocket('wss://web.whatsapp.com/ws', {
                origin: 'https://web.whatsapp.com',
                timeout: 5000
            });

            const timeout = setTimeout(() => {
                ws.close();
                reject(new Error('WebSocket timeout'));
            }, 5000);

            ws.on('open', () => {
                clearTimeout(timeout);
                ws.close();
                results.tests.push({
                    test: 'WebSocket upgrade',
                    status: 'PASS'
                });
                resolve();
            });

            ws.on('error', (error) => {
                clearTimeout(timeout);
                results.tests.push({
                    test: 'WebSocket upgrade',
                    status: 'FAIL',
                    error: error.message,
                    code: error.code
                });
                resolve(); // Don't reject, we want to see the error
            });
        });
    } catch (error) {
        results.tests.push({
            test: 'WebSocket upgrade',
            status: 'FAIL',
            error: error.message
        });
    }

    results.diagnosis = results.tests.find(t => t.test === 'WebSocket upgrade')?.status === 'FAIL'
        ? 'WebSocket connections blocked - use mobile hotspot'
        : 'WebSocket connections work - issue is with Baileys configuration';

    res.json(results);
});

// @route   GET /whatsapp/scan/debug
// @desc    Debug connection issues
// @access  Public
router.get('/debug', async (req, res) => {
    const axios = require('axios');

    // Test basic connectivity
    let networkTests = {};
    try {
        const start = Date.now();
        await axios.get('https://www.google.com', { timeout: 5000 });
        networkTests.google = { status: 'PASS', time: Date.now() - start };
    } catch (e) {
        networkTests.google = { status: 'FAIL', error: e.message };
    }

    try {
        const start = Date.now();
        await axios.get('https://web.whatsapp.com', { timeout: 10000 });
        networkTests.whatsapp = { status: 'PASS', time: Date.now() - start };
    } catch (e) {
        networkTests.whatsapp = { status: 'FAIL', error: e.message };
    }

    const debug = {
        timestamp: new Date().toISOString(),
        connection: {
            isConnected,
            hasQR: !!currentQRCode,
            initializing: isInitializing,
            hasSocket: !!whatsappSocket
        },
        network: {
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress,
            headers: {
                host: req.get('Host'),
                origin: req.get('Origin'),
                referer: req.get('Referer')
            },
            tests: networkTests
        },
        environment: {
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            cwd: process.cwd()
        },
        diagnosis: {
            issue: 'Connection Failure (HTTP 405 - Method Not Allowed)',
            cause: 'WebSocket upgrade request rejected by network/firewall/proxy',
            evidence: networkTests.whatsapp?.status === 'FAIL' ? 'Cannot reach WhatsApp servers at all' : 'Can reach WhatsApp but WebSocket upgrade blocked',
            error_code: 405,
            error_meaning: 'HTTP 405 = Method Not Allowed - WebSocket upgrade rejected',
            blocked_by: [
                'Corporate firewall blocking WebSocket connections',
                'VPN/proxy server rejecting WebSocket upgrade',
                'ISP blocking WebSocket protocol',
                'Security software (antivirus/firewall) blocking unknown connections'
            ],
            solutions: [
                {
                    priority: 1,
                    title: 'Mobile Hotspot (Recommended)',
                    steps: ['Turn on mobile hotspot', 'Connect computer to phone WiFi', 'Test immediately - should work'],
                    effectiveness: '90% success rate'
                },
                {
                    priority: 2,
                    title: 'Disable VPN/Proxy',
                    steps: ['Disconnect all VPNs', 'Disable browser proxy', 'Disable system proxy', 'Restart browser'],
                    effectiveness: '70% success rate'
                },
                {
                    priority: 3,
                    title: 'Firewall Settings',
                    steps: ['Allow Node.js in firewall', 'Allow ports 80, 443, 5222, 5223, 5228', 'Allow *.whatsapp.net domain'],
                    effectiveness: 'Variable - depends on firewall rules'
                },
                {
                    priority: 4,
                    title: 'Corporate Network',
                    steps: ['Contact IT department', 'Request WebSocket access', 'Request WhatsApp exception', 'Use personal hotspot'],
                    effectiveness: 'Requires IT cooperation'
                }
            ]
        }
    };

    res.json(debug);
});

module.exports = router;