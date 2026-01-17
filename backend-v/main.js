

// 🚀 Load environment variables from .env file jass
require('dotenv').config({ quiet: true });

// 🛡️ Global Error Handlers to prevent server crashes
process.on('uncaughtException', (error) => {
    console.error('🚨 [CRITICAL] Uncaught Exception:', error);
    // Don't exit the process, just log the error
    // This prevents the server from crashing due to service errors
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 [CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit the process, just log the error
    // This prevents the server from crashing due to service errors
});

// 📦 Core Node.js Modules
const express = require('express');
const http = require('http');
const path = require('path');

// 🌐 Socket.IO Imports
const { Server } = require('socket.io');

// ⚙️ Configuration & Utilities
const { connectDB } = require('./config/db');
const checkInactiveCoaches = require('./tasks/checkInactiveCoaches');
const { init } = require('./services/rabbitmqProducer');
const sslService = require('./services/sslService');
const zoomCleanupService = require('./services/zoomCleanupService');
const AdminUser = require('./schema/AdminUser');

// 🛡️ Middleware Imports
const cors = require('cors');
// const adminAuth = require('./middleware/adminAuth');

// 🛣️ Route Imports
const authRoutes = require('./routes/authRoutes.js');
const registerRoutes = require('./routes/registerRoutes.js');
const funnelRoutes = require('./routes/funnelRoutes');
const customUrlRoutes = require('./routes/customUrlRoutes');
const customDomainRoutes = require('./routes/customDomainRoutes');
const leadRoutes = require('./routes/leadRoutes.js');
const automationRuleRoutes = require('./routes/automationRuleRoutes.js');
const automationsV2Routes = require('./routes/automationsV2Routes.js');
const uploadRoutes = require('./routes/uploadRoutes');
const webpageRenderRoutes = require('./routes/webpageRenderRoutes');
const dailyPriorityFeedRoutes = require('./routes/dailyPriorityFeedRoutes');
const advancedMlmRoutes = require('./routes/advancedMlmRoutes');
const coachRoutes = require('./routes/coachRoutes');
const metaRoutes = require('./routes/metaRoutes.js');
// const paymentRoutes = require('./routes/paymentRoutes.js');
const staffRoutes = require('./routes/staffRoutes.js');
const staffCalendarRoutes = require('./routes/staffCalendarRoutes.js');
const staffAppointmentRoutes = require('./routes/staffAppointmentRoutes.js');
const adsRoutes = require('./routes/adsRoutes');
const aiAdsRoutes = require('./routes/aiAdsRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const coachDashboardRoutes = require('./routes/coachDashboardRoutes');
const permissionsRoutes = require('./routes/permissionsRoutes');
const coachSubscriptionLimitsRoutes = require('./routes/coachSubscriptionLimitsRoutes');
const subscriptionManagementTask = require('./tasks/subscriptionManagement');
const coachPaymentRoutes = require('./routes/coachPaymentRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const cartRoutes = require('./routes/cartRoutes');
const nurturingSequenceRoutes = require('./routes/nurturingSequenceRoutes');
const leadMagnetsRoutes = require('./routes/leadMagnetsRoutes');
const publicLeadMagnetRoutes = require('./routes/publicLeadMagnetRoutes');
const leadMagnetManagementRoutes = require('./routes/leadMagnetManagementRoutes');
const leadNurturingRoutes = require('./routes/leadNurturingRoutes');
const leadScoringTrackingRoutes = require('./routes/leadScoringTrackingRoutes');
const aiRoutes = require('./routes/aiRoutes');

const zoomIntegrationRoutes = require('./routes/zoomIntegrationRoutes');
const messageTemplateRoutes = require('./routes/messageTemplateRoutes');
// WhatsApp routes moved to dustbin/whatsapp-dump/
const coachHierarchyRoutes = require('./routes/coachHierarchyRoutes');
const apiDocsRoutes = require('./routes/apiDocsRoutes');
const unifiedPaymentRoutes = require('./routes/unifiedPaymentRoutes');
const checkoutPageRoutes = require('./routes/checkoutPageRoutes');
const coachPlanRoutes = require('./routes/coachPlanRoutes');
const paymentsv1Routes = require('./routes/paymentsv1Routes');
const coachTransactionRoutes = require('./routes/coachTransactionRoutes');
const coachMarketingCredentialsRoutes = require('./routes/coachMarketingCredentialsRoutes');
const marketingV1Routes = require('./routes/marketingV1Routes');
const coachFinancialRoutes = require('./routes/coachFinancialRoutes');
const adminHierarchyRoutes = require('./routes/adminHierarchyRoutes');
const adminV1Routes = require('./routes/adminV1Routes');
const centralWhatsAppRoutes = require('./routes/centralWhatsAppRoutes');
// Email routes moved to centralWhatsAppRoutes
// const emailConfigRoutes = require('./routes/emailConfigRoutes');
// Messaging routes moved to centralWhatsAppRoutes
// const messagingRoutes = require('./routes/messagingRoutes');
const newAdminAuthRoutes = require('./routes/adminAuthRoutes');
const newAdminSystemRoutes = require('./routes/adminSystemRoutes');
const newAdminUserRoutes = require('./routes/adminUserRoutes');
const newAdminAuditRoutes = require('./routes/adminAuditRoutes');
const newAdminMlmRoutes = require('./routes/adminMlmRoutes');
const newAdminFinancialRoutes = require('./routes/adminFinancialRoutes');
const newAdminSecurityRoutes = require('./routes/adminSecurityRoutes');
const platformConfigRoutes = require('./routes/platformConfigRoutes');
const staffAuthRoutes = require('./routes/staffAuthRoutes');
const coachStaffManagementRoutes = require('./routes/coachStaffManagementRoutes');
const publicPermissionsRoutes = require('./routes/publicPermissionsRoutes');
const logsRoutes = require('./routes/logsRoutes');
const centralMessagingRoutes = require('./routes/centralMessagingRoutes');
const contentRoutes = require('./routes/contentRoutes');
const coursePurchaseRoutes = require('./routes/coursePurchaseRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// --- Import the worker initialization functions ---
const initRulesEngineWorker = require('./workers/worker_rules_engine');
const initActionExecutorWorker = require('./workers/worker_action_executor');
const initScheduledExecutorWorker = require('./workers/worker_scheduled_action_executor');
const initPaymentProcessorWorker = require('./workers/worker_payment_processor');
const initNurturingWorker = require('./workers/worker_nurturing_sequence');
const { initMessageProcessorWorker } = require('./workers/worker_message_processor');

// --- Import message queue service ---
const messageQueueService = require('./services/messageQueueService');
const advancedMessageQueue = require('./services/advancedMessageQueueService');
const advancedAutomationProcessorV2 = require('./services/AdvancedAutomationProcessorV2');

// --- END ROUTES DATA ---

// 🌐 Initialize Express App
const app = express();
const server = http.createServer(app);

// Socket.IO configuration for notifications
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: false,
        allowedHeaders: ["*"]
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
    path: '/socket.io' // Explicit Socket.IO path
});

console.log('🔌 [Socket.IO] Main Socket.IO server initialized');

// Log all connection attempts to main namespace (for debugging)
io.on('connection', (socket) => {
    console.log(`🔌 [Socket.IO] ⚠️ Connection to MAIN namespace (not /notification): ${socket.id}`);
    console.log(`🔌 [Socket.IO] Main namespace connection from: ${socket.handshake.address}`);
    console.log(`🔌 [Socket.IO] Main namespace handshake query:`, socket.handshake.query);
    console.log(`🔌 [Socket.IO] Main namespace handshake auth:`, socket.handshake.auth);
    socket.on('disconnect', () => {
        console.log(`🔌 [Socket.IO] Main namespace client disconnected: ${socket.id}`);
    });
});

// Create notification namespace at /notification
const notificationNamespace = io.of('/notification');

console.log('🔌 [Socket.IO] ✅ Notification namespace created at /notification');

// Add error handler for namespace (if supported)
try {
    notificationNamespace.on('connect_error', (error) => {
        console.error('🔌 [Socket.IO] ❌ Connection error in /notification namespace:', error);
    });
} catch (err) {
    console.warn('🔌 [Socket.IO] Note: connect_error event not available on namespace');
}

// Add error handler for engine connection attempts (only if engine exists)
if (notificationNamespace.engine) {
    notificationNamespace.engine.on('connection_error', (error) => {
        console.error('🔌 [Socket.IO] ❌ Engine connection error in /notification namespace:', error);
        console.error('🔌 [Socket.IO] Error details:', {
            message: error.message,
            type: error.type,
            description: error.description,
            context: error.context
        });
    });
} else {
    console.log('🔌 [Socket.IO] Note: Engine not available yet, will attach error handler after connection');
}

// Log namespace connection attempts BEFORE the connection handler
notificationNamespace.use((socket, next) => {
    console.log(`🔌 [Socket.IO] 📥 Incoming connection attempt to /notification namespace`);
    console.log(`🔌 [Socket.IO] Connection attempt details:`, {
        address: socket.handshake.address,
        headers: {
            origin: socket.handshake.headers.origin,
            referer: socket.handshake.headers.referer,
            'user-agent': socket.handshake.headers['user-agent']?.substring(0, 50)
        },
        query: socket.handshake.query,
        auth: socket.handshake.auth ? { 
            hasToken: !!socket.handshake.auth.token,
            tokenLength: socket.handshake.auth.token ? socket.handshake.auth.token.length : 0
        } : null,
        url: socket.handshake.url,
        method: socket.handshake.method
    });
    next(); // Allow the connection
});

// Set Socket.IO instance for use in services (use the namespace)
const { setIoInstance } = require('./utils/socketUtils');
setIoInstance(notificationNamespace);

console.log('🔌 [Socket.IO] ✅ Socket.IO instance set in socketUtils');

// Socket.IO event handlers for notifications namespace
notificationNamespace.on('connection', (socket) => {
    console.log(`🔌 [Socket.IO] ✅✅✅ SUCCESS: New client connected to /notification namespace: ${socket.id}`);
    console.log(`🔌 [Socket.IO] Client transport: ${socket.conn.transport.name}`);
    console.log(`🔌 [Socket.IO] Full connection details:`, {
        socketId: socket.id,
        transport: socket.conn.transport.name,
        address: socket.handshake.address,
        headers: {
            origin: socket.handshake.headers.origin,
            referer: socket.handshake.headers.referer
        },
        query: socket.handshake.query,
        auth: socket.handshake.auth ? { 
            hasToken: !!socket.handshake.auth.token,
            tokenLength: socket.handshake.auth.token ? socket.handshake.auth.token.length : 0
        } : null,
        rooms: Array.from(socket.rooms)
    });
    
    // Send connection confirmation immediately
    socket.emit('connected', {
        socketId: socket.id,
        message: 'Connected to notification server',
        namespace: '/notification',
        timestamp: new Date().toISOString()
    });
    
    console.log(`🔌 [Socket.IO] ✅ Sent connection confirmation to ${socket.id}`);

    // Admin joins admin room
    socket.on('admin-join', (adminId) => {
        socket.join('admin-room');
        socket.join(`admin-${adminId}`);
        console.log(`[Socket.IO] Admin ${adminId} joined notification rooms`);
        socket.emit('room-joined', { room: 'admin-room', adminId });
    });

    // Coach joins coach room
    socket.on('coach-join', (coachId) => {
        if (!coachId) {
            console.warn(`[Socket.IO] ⚠️ Coach join called without coachId`);
            return;
        }
        socket.join('coach-room');
        socket.join(`user-${coachId}`);
        socket.join(`coach-${coachId}`);
        console.log(`[Socket.IO] ✅ Coach ${coachId} joined notification rooms: coach-room, user-${coachId}, coach-${coachId}`);
        socket.emit('room-joined', { 
            room: 'coach-room', 
            coachId,
            rooms: ['coach-room', `user-${coachId}`, `coach-${coachId}`]
        });
    });

    // User joins specific user room
    socket.on('user-join', (userId) => {
        if (!userId) {
            console.warn(`[Socket.IO] ⚠️ User join called without userId`);
            return;
        }
        socket.join(`user-${userId}`);
        console.log(`[Socket.IO] ✅ User ${userId} joined user room: user-${userId}`);
        socket.emit('room-joined', { room: `user-${userId}`, userId });
    });

    // Handle admin notifications
    socket.on('admin-notification', (data) => {
        socket.to('admin-room').emit('admin-notification', data);
    });

    // Handle coach notifications
    socket.on('coach-notification', (data) => {
        socket.to('coach-room').emit('coach-notification', data);
    });

    // Handle global notifications
    socket.on('global-notification', (data) => {
        notificationNamespace.emit('global-notification', data);
    });

    // Handle log streaming connections
    socket.on('logs-join', () => {
        socket.join('logs-room');
        // Send initial logs to the newly connected client
        const { getLogs } = require('./routes/logsRoutes');
        const initialLogs = getLogs(100);
        socket.emit('initial-logs', initialLogs);
    });

    socket.on('disconnect', (reason) => {
        console.log(`🔌 [Socket.IO] ❌ Client disconnected: ${socket.id}, reason: ${reason}`);
    });

    socket.on('error', (error) => {
        console.error(`🔌 [Socket.IO] ❌ Socket error for ${socket.id}:`, error);
    });
});

console.log('🔌 [Socket.IO] ✅ Notification namespace ready and listening');

// Create a single WebSocket server for log streaming
const WebSocket = require('ws');
const logWSS = new WebSocket.Server({ noServer: true });

// Set the WebSocket server reference in logsRoutes
const { setWebSocketServer, getLogs } = require('./routes/logsRoutes');
setWebSocketServer(logWSS);

logWSS.on('connection', (ws) => {
    console.log('📡 Log streaming client connected');
    
    // Send initial logs
    const initialLogs = getLogs(100);
    ws.send(JSON.stringify({
        type: 'initialLogs',
        data: initialLogs
    }));
    
    ws.on('close', () => {
        console.log('📡 Log streaming client disconnected');
    });
    
    ws.on('error', (error) => {
        console.error('📡 Log streaming WebSocket error:', error);
    });
});

// WebSocket upgrade handler for log streaming
server.on('upgrade', (request, socket, head) => {
    const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
    
    if (pathname === '/api/logs/stream') {
        logWSS.handleUpgrade(request, socket, head, (ws) => {
            logWSS.emit('connection', ws, request);
        });
    } else {
        socket.destroy();
    }
});

// ✨ Express Middleware Setup
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// Allow all origins - no CORS restrictions
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: '*',
    credentials: false
}));

// // Request logging middleware for debugging
app.use((req, res, next) => {
    // WhatsApp API calls moved to dustbin/whatsapp-dump/
    // if (req.path.startsWith('/api/whatsapp')) {
    //     console.log(`[WhatsApp API] ${req.method} ${req.path} - Origin: ${req.headers.origin || 'No origin'} - User-Agent: ${req.headers['user-agent'] || 'No user-agent'}`);
    // }
    
    // Log all requests in development
    if (process.env.NODE_ENV === 'development') {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    }
    
    next();
});

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// 🌐 Custom Domain Routing Middleware
app.use(async (req, res, next) => {
    const hostname = req.hostname;

    // Skip if it's the main domain or localhost
    if (hostname === 'api.funnelseye.com' || hostname === 'localhost' || hostname === '127.0.0.1') {
        return next();
    }

    try {
        const CustomDomain = require('./schema/CustomDomain');
        const customDomain = await CustomDomain.findByHostname(hostname);

        if (customDomain) {
            // Add domain info to request for use in other middleware/routes
            req.customDomain = customDomain;
            req.coachId = customDomain.coachId; // Set coach context for the request
        }
    } catch (error) {
        console.error('Error resolving custom domain:', error);
    }

    next();
});

// 🔗 Mount API Routes
// ===== CORE AUTHENTICATION & USER MANAGEMENT =====
app.use('/api/auth', authRoutes);

// ===== REGISTER PAGES (UI) =====
app.use('/register', registerRoutes);

// ===== FUNNEL & LEAD MANAGEMENT =====
app.use('/api/funnels', funnelRoutes);
app.use('/api/custom-urls', customUrlRoutes);
app.use('/api/custom-domains', customDomainRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/lead-magnets', leadMagnetsRoutes);
app.use('/lead-magnets', publicLeadMagnetRoutes); // Public routes (no /api prefix)
app.use('/api/lead-magnet-management', leadMagnetManagementRoutes);
app.use('/api/lead-nurturing', leadNurturingRoutes);
app.use('/api/nurturing-sequences', nurturingSequenceRoutes);
app.use('/api/lead-scoring', leadScoringTrackingRoutes);

// ===== AUTOMATION & WORKFLOW =====
app.use('/api/automation-rules', automationRuleRoutes);
app.use('/api/automation', require('./routes/automation'));
app.use('/api/automations-v2', automationsV2Routes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/mobile', require('./routes/mobile'));

// ===== ACTIVITIES =====
const activityRoutes = require('./routes/activityRoutes');
app.use('/api/activities', activityRoutes);

// ===== COACH DASHBOARD & AUTOMATION =====
app.use('/api/coach-dashboard', coachDashboardRoutes);
// app.use('/api/coach-whatsapp', coachWhatsappRoutes);

// ===== COACH ROUTES (REORGANIZED) =====
// Public coach routes (no auth required)
app.use('/api/coach', dailyPriorityFeedRoutes);
// Protected coach routes (auth required)
app.use('/api/coach-profile', coachRoutes);

// ===== E-COMMERCE & PAYMENTS =====
// app.use('/api/payments', paymentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/coach-payments', coachPaymentRoutes);
app.use('/api/cart', cartRoutes);

// ===== UNIFIED PAYMENT SYSTEM (CONSOLIDATED) =====
// NOTE: Funnelseye Payments disabled - migrating to Unified Payments
// const funnelseyePaymentRoutes = require('./routes/funnelseyePaymentRoutes');
// app.use('/api/funnelseye-payments', funnelseyePaymentRoutes);

// ===== UNIFIED PAYMENT SYSTEM =====

// Mount unified payment routes
app.use('/api/unified-payments', unifiedPaymentRoutes);
app.use('/api/checkout-pages', checkoutPageRoutes);
app.use('/api/coach-plans', coachPlanRoutes);

// ===== NEW PAYMENT SYSTEM V1 =====
app.use('/api/paymentsv1', paymentsv1Routes);

// ===== COACH TRANSACTION ROUTES =====

// Mount coach transaction routes
app.use('/api/coach-transactions', coachTransactionRoutes);


// ===== MARKETING & ADVERTISING =====
app.use('/api/ads', adsRoutes);
app.use('/api/ai-ads', aiAdsRoutes);
app.use('/api/coach-marketing-credentials', coachMarketingCredentialsRoutes);

// ===== NEW MARKETING V1 API =====
app.use('/api/marketing/v1', marketingV1Routes);

// ===== COACH FINANCIAL MANAGEMENT =====
app.use('/api/coach/financial', coachFinancialRoutes);

// ===== ADMIN HIERARCHY MANAGEMENT =====
app.use('/api/admin/hierarchy', adminHierarchyRoutes);

// ===== ADMIN V1 MASTER API =====
app.use('/api/admin/v1', adminV1Routes);


// ===== UNIFIED WHATSAPP V1 SYSTEM =====
// Single endpoint for all WhatsApp functionality - Admin and Coach
app.use('/api/whatsapp/v1', centralWhatsAppRoutes);
// Messaging routes moved to centralWhatsAppRoutes

// ===== WHATSAPP SCAN ROUTE =====
app.use('/whatsapp/scan', require('./routes/whatsappScanRoutes'));
// app.use('/api/messaging', messagingRoutes);

// ===== CENTRAL MESSAGING V1 SYSTEM =====
// New unified messaging endpoint for WhatsApp and Email
// Features: Credits, Templates, Analytics, Role-based access
app.use('/api/central-messaging/v1', centralMessagingRoutes);

// ===== EMAIL CONFIGURATION SYSTEM =====
// Email configuration management is now integrated into /api/whatsapp/v1
// app.use('/api/email/v1', emailConfigRoutes); // Merged into centralWhatsAppRoutes

// ===== PERMISSIONS & SYSTEM =====
app.use('/api/permissions', permissionsRoutes);

// ===== PUBLIC PERMISSIONS (NO AUTH) =====
app.use('/api/public', publicPermissionsRoutes);

// ===== COACH STAFF MANAGEMENT =====
app.use('/api/coach/staff', coachStaffManagementRoutes);

// ===== REAL-TIME LOGS =====
app.use('/api/logs', logsRoutes);

// ===== COACH SUBSCRIPTION LIMITS =====
app.use('/api/coach', coachSubscriptionLimitsRoutes);

// ===== STAFF & TEAM MANAGEMENT =====
app.use('/api/staff', staffRoutes);
app.use('/api/staff-calendar', staffCalendarRoutes);
app.use('/api/staff-appointments', staffAppointmentRoutes);

// // ===== MESSAGE TEMPLATES & ZOOM INTEGRATION =====
app.use('/api/message-templates', messageTemplateRoutes);
app.use('/api/zoom-integration', zoomIntegrationRoutes);

// // ===== ADVANCED MLM & PERFORMANCE (Unified) =====
app.use('/api/advanced-mlm', advancedMlmRoutes);
app.use('/api/coach-hierarchy', coachHierarchyRoutes);

// // ===== UTILITIES & ADMIN =====
app.use('/api/files', uploadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/funnels', webpageRenderRoutes);

// ===== CONTENT MANAGEMENT =====
app.use('/api/content', contentRoutes);
app.use('/api/course-purchase', coursePurchaseRoutes);

// ===== NEW ADMIN SYSTEM =====
// const newAdminPaymentRoutes = require('./routes/adminPaymentRoutes');
// const adminWhatsappRoutes = require('./routes/adminWhatsappRoutes'); // Commented out - using unified WhatsApp v1

// Mount new admin auth routes first (login, logout, etc.)
app.use('/api/admin/auth', newAdminAuthRoutes);

// Mount staff auth routes
app.use('/api/staffv2/auth', staffAuthRoutes);



// Serve new admin dashboard UI (React app)
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'admin', 'index.html'));
});

app.get('/admin-dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'admin', 'index.html'));
});

// Serve static files for the admin dashboard
app.use('/admin-assets', express.static(path.join(__dirname, 'dist', 'admin', 'assets')));

// Fallback for old admin login (keep for compatibility)
app.get('/admin-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

// ===== PAYMENT PAGES =====
// Serve professional checkout page
app.get('/checkout/payment', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'checkout.html'));
});

// Serve checkout page directly
app.get('/checkout.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'checkout.html'));
});

// Serve payment success page
app.get('/payment-success', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'payment-success.html'));
});

// Serve payment failure page (optional)
app.get('/payment-failed', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'payment-failed.html'));
});

// Serve test payment page
app.get('/test-payment', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test-payment.html'));
});

// Serve subscription page
app.get('/subscription', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'subscription.html'));
});

// Serve subscription plans page
app.get('/subscription-plans', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'subscription-plans.html'));
});

app.get('/plans', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'subscription-plans.html'));
});

// Serve store pages
app.get('/store/:planId', (req, res) => {
    const planId = req.params.planId;
    const storeFilePath = path.join(__dirname, 'public', 'store', `${planId}.html`);
    
    // Check if store page exists
    if (require('fs').existsSync(storeFilePath)) {
        res.sendFile(storeFilePath);
    } else {
        res.status(404).send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Store Not Found - FunnelsEye</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    .error { color: #dc2626; font-size: 1.2rem; }
                </style>
            </head>
            <body>
                <h1>Store Not Found</h1>
                <p class="error">The requested store page does not exist.</p>
                <p>Plan ID: ${planId}</p>
                <a href="/">Go to Home</a>
            </body>
            </html>
        `);
    }
});
// 🏠 API Documentation Homepage Route
app.use('/', apiDocsRoutes);

app.get('/.well-known/acme-challenge/:token', (req, res) => {
    const keyAuth = sslService.getChallenge(req.params.token);
    if (!keyAuth) return res.status(404).end();
    res.type('text/plain').send(keyAuth);
});

// --- ❌ 404 Not Found Handler (Enhanced with animations) ---
app.use((req, res, next) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>404 - Page Not Found</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
                body {
                    font-family: 'Inter', sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                    background-color: #1a202c;
                    color: #e2e8f0;
                    text-align: center;
                    overflow: hidden;
                    position: relative;
                }
                .background-grid {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background-image: radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px);
                    background-size: 40px 40px;
                    opacity: 0.5;
                    animation: pan-background 30s linear infinite;
                    z-index: 0;
                }
                .container-404 {
                    background-color: rgba(30, 41, 59, 0.8);
                    backdrop-filter: blur(8px);
                    padding: 4rem 3rem;
                    border-radius: 1rem;
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
                    max-width: 500px;
                    border: 1px solid #4a5568;
                    animation: fadeIn 0.8s ease-out;
                    z-index: 1;
                }
                h1 {
                    font-size: 6rem;
                    font-weight: 700;
                    color: #4f46e5;
                    margin: 0;
                    letter-spacing: -0.1em;
                    animation: pulsate 2s infinite ease-in-out alternate;
                }
                h2 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-top: 0.5rem;
                    color: #cbd5e0;
                }
                p {
                    font-size: 1rem;
                    margin-top: 1rem;
                    color: #a0aec0;
                }
                a {
                    display: inline-block;
                    background-color: #4f46e5;
                    color: #ffffff;
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.5rem;
                    text-decoration: none;
                    font-weight: 600;
                    margin-top: 2rem;
                    transition: all 0.3s ease;
                }
                a:hover {
                    background-color: #4338ca;
                    transform: translateY(-3px);
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes pulsate {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.05); }
                }
                @keyframes pan-background {
                    0% { background-position: 0 0; }
                    100% { background-position: 400px 400px; }
                }
            </style>
        </head>
        <body>
            <div class="background-grid"></div>
            <div class="container-404">
                <h1>404</h1>
                <h2>Page Not Found</h2>
                <p>The URL you requested could not be found on this server. Please check the address or return to the homepage.</p>
                <a href="/">Go to Homepage</a>
            </div>
        </body>
        </html>
    `);
});

// ⚠️ IMPORTANT: Error Handling Middleware (This is commented out as requested)
// app.use(errorHandler);

// Global error handler for unhandled errors
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    
    // CORS headers are handled by the main CORS middleware
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            error: err.message
        });
    }
    
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized',
            error: err.message
        });
    }
    
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Specific routes for standalone pages
app.get('/automations-v2', (req, res) => {
    const indexPath = path.join(__dirname, '..', 'frontend-j', 'dist', 'index.html');
    if (require('fs').existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Frontend not built. Please run npm run build in frontend-j directory.');
    }
});

app.get('/editor/automation', (req, res) => {
    const indexPath = path.join(__dirname, '..', 'frontend-j', 'dist', 'index.html');
    if (require('fs').existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Frontend not built. Please run npm run build in frontend-j directory.');
    }
});

// General dashboard SPA fallback
app.use('/dashboard', (req, res) => {
    const indexPath = path.join(__dirname, '..', 'frontend-j', 'dist', 'index.html');
    if (require('fs').existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Frontend not built. Please run npm run build in frontend-j directory.');
    }
});

// Serve static assets for the frontend
app.use('/assets', express.static(path.join(__dirname, '..', 'frontend-j', 'dist', 'assets')));

// 404 handler for unmatched routes
// app.use('*', (req, res) => {
//     // CORS headers are handled by the main CORS middleware

//     res.status(404).json({
//         success: false,
//         message: 'Route not found',
//         path: req.originalUrl
//     });
// });

// 🌍 Define Server Port
const PORT = process.env.PORT || 8080;

// --- Helper function to print API routes in a formatted table ---
function printApiTable(title, routes, baseUrl) {
    const METHOD_WIDTH = 8;
    const PATH_WIDTH = 75;
    const DESC_WIDTH = 45;

    const totalWidth = METHOD_WIDTH + PATH_WIDTH + DESC_WIDTH + 8;
    const hr = '─'.repeat(totalWidth);

    console.log(`\n\n--- ${title.toUpperCase()} ---`);
    console.log(`╭${hr}╮`);
    console.log(`│ ${'Method'.padEnd(METHOD_WIDTH)} │ ${'URL'.padEnd(PATH_WIDTH)} │ ${'Description'.padEnd(DESC_WIDTH)} │`);
    console.log(`├${'─'.repeat(METHOD_WIDTH)}─┼─${'─'.repeat(PATH_WIDTH)}─┼─${'─'.repeat(DESC_WIDTH)}─┤`);

    routes.forEach(route => {
        const fullPath = `${baseUrl}${route.path}`;
        const method = route.method.padEnd(METHOD_WIDTH);
        const path = fullPath.padEnd(PATH_WIDTH);
        const desc = route.desc.padEnd(DESC_WIDTH);
        console.log(`│ ${method} │ ${path} │ ${desc} │`);
    });

    console.log(`╰${hr}╯`);
}
// -----------------------------------------------------------------

/**
 * Checks for existing admin user and creates one if none exists
 */
const ensureAdminUser = async () => {
    try {
        console.log('🔍 Checking for admin user...');
        
        // Check if any admin user exists
        const existingAdmin = await AdminUser.findOne({});
        
        if (existingAdmin) {
            console.log('✅ Admin user already exists.');
            return;
        }
        
        // Create default super admin user
        console.log('🔧 Creating default admin user...');
        const admin = new AdminUser({
            email: 'admin@funnelseye.com',
            password: 'Admin@123',
            firstName: 'Super',
            lastName: 'Admin',
            role: 'super_admin',
            status: 'active',
            isEmailVerified: true,
            permissions: {
                systemSettings: true,
                userManagement: true,
                paymentSettings: true,
                mlmSettings: true,
                coachManagement: true,
                planManagement: true,
                contentModeration: true,
                viewAnalytics: true,
                exportData: true,
                financialReports: true,
                systemLogs: true,
                maintenanceMode: true,
                backupRestore: true,
                securitySettings: true,
                auditLogs: true,
                twoFactorAuth: true
            }
        });
        
        await admin.save();
        console.log('✅ Default admin user created successfully!');
        console.log('📧 Email: admin@funnelseye.com');
        console.log('🔑 Password: Admin@123');
        console.log('⚠️  Please change the default password after first login!');
        
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        // Don't exit the process, just log the error
        // This allows the server to continue running even if admin creation fails
    }
};

/**
 * Initializes the server by connecting to the database and starting the Express app.
 * It also starts all necessary worker processes.
 */
const startServer = async () => {
    try {
        // First, connect to database
        await connectDB();
        
        // Then, initialize all models to ensure they're registered
        const models = require('./schema');
        
        // Check and create admin user if needed
        await ensureAdminUser();
        
        // Now initialize other services
        await init();

        // --- Initialize message queue service ---
        console.log('🔄 [MAIN] Initializing message queue service...');
        await messageQueueService.initialize();
        console.log('✅ [MAIN] Message queue service initialized');

        // Initialize Advanced Message Queue for V2 Automations
        await advancedMessageQueue.initialize();
        console.log('✅ [MAIN] Advanced message queue service initialized');

        // --- Start all the worker processes here with await ---
        await initRulesEngineWorker();
        await initActionExecutorWorker();
        await initScheduledExecutorWorker();
        await initPaymentProcessorWorker();
        await initNurturingWorker();
        
        // --- Start message processor worker ---
        console.log('🔄 [MAIN] Starting message processor worker...');
        await initMessageProcessorWorker();
        console.log('✅ [MAIN] Message processor worker started');

        server.listen(PORT, () => {
            console.log(`Local Development Base URL: http://localhost:${PORT}`);
            console.log(`🔌 [Socket.IO] ==========================================`);
            console.log(`🔌 [Socket.IO] Server listening on port ${PORT}`);
            console.log(`🔌 [Socket.IO] Socket.IO handshake path: /socket.io`);
            console.log(`🔌 [Socket.IO] Notification namespace: /notification`);
            console.log(`🔌 [Socket.IO] Client should connect to: http://localhost:${PORT}/notification`);
            console.log(`🔌 [Socket.IO] (Socket.IO will use /socket.io path automatically)`);
            console.log(`🔌 [Socket.IO] Ready for WebSocket connections!`);
            console.log(`🔌 [Socket.IO] ==========================================`);

            // --- Start the scheduled task ---
            checkInactiveCoaches.start();
            
            // --- Start subscription management tasks ---
            subscriptionManagementTask.init();
            
            // --- Start Zoom cleanup service ---
            zoomCleanupService.startCleanup(2, 'daily'); // Default: 2 days retention, daily cleanup
            const nextCleanup = zoomCleanupService.getNextCleanupTime();
            if (nextCleanup) {
                // console.log(`[ZoomCleanup] Next cleanup scheduled for: ${nextCleanup.toLocaleString()}`);
            }
        });
    } catch (error) {
        console.error(`\n❌ Server failed to start: ${error.message}\n`);
        process.exit(1);
    }
};

// Import new services for email, SMS, calendar, notification, and AI
const { emailService, smsService, internalNotificationService, aiService } = require('./services/actionExecutorService');

// Initialize Socket.IO dependent services after server starts
const initializeSocketServices = () => {
    try {
        // WhatsApp services moved to dustbin/whatsapp-dump/

    } catch (error) {
        console.error('Error initializing Socket.IO services:', error.message);
    }
};

// Graceful shutdown handlers
process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    try {
        await advancedMessageQueue.shutdown();
        await advancedAutomationProcessorV2.shutdown();
        console.log('✅ Advanced services shut down');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
});

process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    try {
        await advancedMessageQueue.shutdown();
        await advancedAutomationProcessorV2.shutdown();
        console.log('✅ Advanced services shut down');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
});

// Call initialization after server starts
setTimeout(initializeSocketServices, 1000);

// Initiate the server startup process
startServer();