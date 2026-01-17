const express = require('express');
const { makeWASocket, DisconnectReason, useMultiFileAuthState, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode');

console.log('🚀 Starting WhatsApp Standalone Scanner...');
console.log('📡 No Socket.IO conflicts - dedicated WhatsApp server');

// Global variables
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
    console.log('🔧 Setting up WhatsApp authentication...');

    const sessionId = 'standalone-session';
    const authDir = path.join(__dirname, '../sessions', sessionId);

    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
        console.log('📁 Created auth directory:', authDir);
    }

    try {
        const { state, saveCreds } = await useMultiFileAuthState(authDir);
        console.log('🔐 Loading auth state...');

        const sock = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'info' }))
            },
            logger: pino({ level: 'info' }),
            browser: ['WhatsApp Standalone', 'Chrome', '1.0.0'],
            printQRInTerminal: false,
            connectTimeoutMs: 30000,
            qrTimeout: 30000,
            defaultQueryTimeoutMs: 30000,
            keepAliveIntervalMs: 20000,
            maxReconnectAttempts: 0,
            reconnectIntervalMs: 0,
            forceIP: 'ipv4'
        });

        whatsappSocket = sock;
        console.log('📡 Setting up event listeners...');

        sock.ev.on('connection.update', (update) => {
            console.log('🔄 Connection update:', {
                connection: update.connection,
                qr: !!update.qr,
                lastDisconnect: update.lastDisconnect?.error?.message || 'none'
            });

            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                console.log('📱 QR code received, generating data URL...');
                qrcode.toDataURL(qr).then(qrCodeDataURL => {
                    currentQRCode = qrCodeDataURL;
                    isConnected = false;
                    console.log('🎉 QR Code generated successfully!');
                    console.log('🎉 QR Code is ready! Visit http://localhost:3002 to scan it.');
                }).catch(error => {
                    console.error('❌ Error generating QR code:', error.message);
                });
            }

            if (connection === 'close') {
                const errorMessage = lastDisconnect?.error?.message || 'Unknown';
                console.log('🔌 Connection closed. Reason:', errorMessage);

                if (errorMessage === 'Connection Failure') {
                    console.log('🚨 HTTP 405 detected - check network/firewall');
                }

                whatsappSocket = null;
                currentQRCode = null;
                isConnected = false;
                isInitializing = false;
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
        console.log('✅ WhatsApp socket initialized');

        return sock;

    } catch (error) {
        console.error('❌ Failed to initialize WhatsApp:', error);
        isInitializing = false;
        throw error;
    }
}

// Express app
const app = express();
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>WhatsApp Standalone Scanner</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
                    .success { background: #d4edda; color: #155724; }
                    .error { background: #f8d7da; color: #721c24; }
                    .info { background: #d1ecf1; color: #0c5460; }
                    button { padding: 10px 20px; margin: 5px; }
                </style>
            </head>
            <body>
                <h1>🚀 WhatsApp Standalone Scanner</h1>
                <p><strong>Status:</strong> ${isConnected ? 'Connected' : currentQRCode ? 'QR Ready' : 'Initializing...'}</p>

                ${currentQRCode ? `
                    <div class="status success">✅ QR Code Ready!</div>
                    <img src="${currentQRCode}" alt="WhatsApp QR Code" style="max-width: 300px;">
                    <br><br>
                    <button onclick="location.reload()">🔄 Refresh</button>
                ` : isConnected ? `
                    <div class="status success">✅ WhatsApp Connected!</div>
                    <button onclick="location.reload()">🔄 Check Status</button>
                ` : `
                    <div class="status info">⏳ Initializing WhatsApp connection...</div>
                    <button onclick="location.reload()">🔄 Retry</button>
                `}

                <br><br>
                <hr>
                <h3>🔧 Troubleshooting</h3>
                <ul>
                    <li>Try mobile hotspot if connection fails</li>
                    <li>Check console for detailed logs</li>
                    <li>Visit /qr for JSON response</li>
                    <li>Visit /status for connection status</li>
                </ul>
            </body>
        </html>
    `);
});

app.get('/qr', (req, res) => {
    if (currentQRCode) {
        res.json({ success: true, qr: currentQRCode, connected: false });
    } else if (isConnected) {
        res.json({ success: true, qr: null, connected: true, message: 'Already connected' });
    } else {
        res.json({ success: false, qr: null, connected: false, message: 'QR not ready yet' });
    }
});

app.get('/status', (req, res) => {
    res.json({
        connected: isConnected,
        hasQR: !!currentQRCode,
        initializing: isInitializing,
        socket: !!whatsappSocket
    });
});

app.post('/reset', async (req, res) => {
    console.log('🔄 Resetting WhatsApp connection...');

    if (whatsappSocket) {
        try {
            whatsappSocket.logout();
            whatsappSocket.end();
        } catch (e) {
            // Ignore
        }
    }

    whatsappSocket = null;
    currentQRCode = null;
    isConnected = false;
    isInitializing = false;

    // Clear session
    const authDir = path.join(__dirname, '../sessions', 'standalone-session');
    if (fs.existsSync(authDir)) {
        fs.rmSync(authDir, { recursive: true, force: true });
    }

    // Reinitialize
    try {
        await initializeWhatsApp();
        res.json({ success: true, message: 'Reset complete' });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, async () => {
    console.log(`🚀 WhatsApp Standalone Scanner running on http://localhost:${PORT}`);
    console.log('📡 No Socket.IO conflicts - dedicated server');

    try {
        await initializeWhatsApp();
    } catch (error) {
        console.error('❌ Failed to start WhatsApp:', error);
    }
});

console.log('✅ WhatsApp Standalone Scanner initialized');
console.log('🌐 Visit http://localhost:3002 to scan QR code');