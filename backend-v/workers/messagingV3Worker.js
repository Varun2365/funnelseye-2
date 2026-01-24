const mongoose = require('mongoose');
const MessagingChannel = require('../schema/MessagingChannel');
const Message = require('../schema/Message');
const Template = require('../schema/MessageTemplate');
const User = require('../schema/User');
const {
    makeWASocket,
    DisconnectReason,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore,
    Browsers
} = require('@whiskeysockets/baileys');
const nodemailer = require('nodemailer');
const amqp = require('amqplib');
const pino = require('pino');

/**
 * Messaging v3 Worker
 * High-throughput message processing system
 * Supports Meta WhatsApp, Bailey's WhatsApp, and Email
 * Handles thousands of messages per second with configurable delays
 */

class MessagingV3Worker {
    constructor() {
        this.isRunning = false;
        this.connections = new Map(); // Store active WhatsApp connections
        this.emailTransporters = new Map(); // Store email transporters
        this.messageQueue = [];
        this.processingBatch = false;
        this.stats = {
            processed: 0,
            failed: 0,
            queued: 0,
            avgProcessingTime: 0
        };
    }

    /**
     * Initialize the worker
     */
    async initialize() {
        try {
            console.log('🚀 Initializing Messaging v3 Worker...');

            // Connect to RabbitMQ for message queuing
            await this.connectToQueue();

            // Start message processing
            this.startProcessing();

            // Start connection health monitoring
            this.startHealthMonitoring();

            this.isRunning = true;
            console.log('✅ Messaging v3 Worker initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Messaging v3 Worker:', error);
            throw error;
        }
    }

    /**
     * Connect to RabbitMQ
     */
    async connectToQueue() {
        try {
            // Use environment variables or default to local
            const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost';

            this.connection = await amqp.connect(rabbitUrl);
            this.channel = await this.connection.createChannel();

            // Declare queues
            await this.channel.assertQueue('messaging_v3_single', { durable: true });
            await this.channel.assertQueue('messaging_v3_bulk', { durable: true });

            console.log('📡 Connected to RabbitMQ for Messaging v3');
        } catch (error) {
            console.warn('⚠️ RabbitMQ not available, using in-memory queue:', error.message);
            // Fallback to in-memory queue if RabbitMQ is not available
            this.useInMemoryQueue = true;
        }
    }

    /**
     * Start processing messages
     */
    startProcessing() {
        if (this.useInMemoryQueue) {
            // Process in-memory queue
            setInterval(() => {
                if (this.messageQueue.length > 0 && !this.processingBatch) {
                    this.processInMemoryQueue();
                }
            }, 100); // Process every 100ms
        } else {
            // Process RabbitMQ queues
            this.channel.consume('messaging_v3_single', async (msg) => {
                if (msg) {
                    try {
                        const messageData = JSON.parse(msg.content.toString());
                        await this.processSingleMessage(messageData);
                        this.channel.ack(msg);
                    } catch (error) {
                        console.error('❌ Error processing single message:', error);
                        this.channel.nack(msg, false, false);
                    }
                }
            });

            this.channel.consume('messaging_v3_bulk', async (msg) => {
                if (msg) {
                    try {
                        const batchData = JSON.parse(msg.content.toString());
                        await this.processBulkBatch(batchData);
                        this.channel.ack(msg);
                    } catch (error) {
                        console.error('❌ Error processing bulk batch:', error);
                        this.channel.nack(msg, false, false);
                    }
                }
            });
        }
    }

    /**
     * Queue a single message
     */
    async queueMessage(messageData) {
        if (this.useInMemoryQueue) {
            this.messageQueue.push(messageData);
            this.stats.queued++;
            console.log(`📋 Queued single message: ${messageData.id}`);
        } else {
            await this.channel.sendToQueue(
                'messaging_v3_single',
                Buffer.from(JSON.stringify(messageData)),
                { persistent: true }
            );
            console.log(`📋 Queued single message to RabbitMQ: ${messageData.id}`);
        }
    }

    /**
     * Queue bulk messages
     */
    async queueBulkMessages(batchData) {
        if (this.useInMemoryQueue) {
            // Split bulk into individual messages for in-memory processing
            const { recipients, delayMs = 1000, ...baseData } = batchData;

            recipients.forEach((recipient, index) => {
                const messageData = {
                    ...baseData,
                    to: recipient.to,
                    templateParams: { ...baseData.templateParams, ...recipient.templateParams },
                    customData: recipient.customData,
                    scheduledAt: new Date(Date.now() + (index * delayMs)),
                    batchId: batchData.batchId,
                    batchIndex: index
                };
                this.messageQueue.push(messageData);
                this.stats.queued++;
            });

            console.log(`📋 Queued ${recipients.length} bulk messages`);
        } else {
            await this.channel.sendToQueue(
                'messaging_v3_bulk',
                Buffer.from(JSON.stringify(batchData)),
                { persistent: true }
            );
            console.log(`📋 Queued bulk batch to RabbitMQ: ${batchData.batchId}`);
        }
    }

    /**
     * Process in-memory queue
     */
    async processInMemoryQueue() {
        if (this.processingBatch || this.messageQueue.length === 0) return;

        this.processingBatch = true;

        try {
            // Sort by scheduled time
            this.messageQueue.sort((a, b) => {
                const timeA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
                const timeB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
                return timeA - timeB;
            });

            // Process ready messages (up to 10 at a time)
            const now = Date.now();
            const readyMessages = this.messageQueue.filter(msg =>
                !msg.scheduledAt || new Date(msg.scheduledAt).getTime() <= now
            ).slice(0, 10);

            for (const messageData of readyMessages) {
                await this.processSingleMessage(messageData);
                // Remove from queue
                const index = this.messageQueue.indexOf(messageData);
                if (index > -1) this.messageQueue.splice(index, 1);
            }
        } catch (error) {
            console.error('❌ Error processing in-memory queue:', error);
        } finally {
            this.processingBatch = false;
        }
    }

    /**
     * Process a single message
     */
    async processSingleMessage(messageData) {
        const startTime = Date.now();

        try {
            console.log(`📤 Processing message: ${messageData.id} via ${messageData.channelCategory}`);

            // Get channel configuration
            const channel = await this.getChannelForMessage(messageData);

            if (!channel) {
                throw new Error(`No suitable channel found for category: ${messageData.channelCategory}`);
            }

            // Prepare message content
            const messageContent = await this.prepareMessageContent(messageData, channel);

            // Send message based on channel type
            let result;
            switch (messageData.channelCategory) {
                case 'meta_whatsapp':
                    result = await this.sendMetaWhatsAppMessage(channel, messageContent);
                    break;
                case 'baileys_whatsapp':
                    result = await this.sendBaileysWhatsAppMessage(channel, messageContent);
                    break;
                case 'email':
                    result = await this.sendEmailMessage(channel, messageContent);
                    break;
                default:
                    throw new Error(`Unsupported channel category: ${messageData.channelCategory}`);
            }

            // Update message status in database
            await this.updateMessageStatus(messageData.id, 'delivered', result);

            // Update stats
            this.stats.processed++;
            const processingTime = Date.now() - startTime;
            this.stats.avgProcessingTime = (this.stats.avgProcessingTime + processingTime) / 2;

            console.log(`✅ Message ${messageData.id} delivered successfully in ${processingTime}ms`);

        } catch (error) {
            console.error(`❌ Failed to process message ${messageData.id}:`, error.message);

            // Update message status as failed
            await this.updateMessageStatus(messageData.id, 'failed', null, error.message);

            this.stats.failed++;
        }
    }

    /**
     * Process bulk message batch
     */
    async processBulkBatch(batchData) {
        const { recipients, delayMs = 1000, batchSize = 10 } = batchData;

        console.log(`📦 Processing bulk batch: ${batchData.batchId} with ${recipients.length} messages`);

        // Process in smaller chunks with delays
        for (let i = 0; i < recipients.length; i += batchSize) {
            const chunk = recipients.slice(i, i + batchSize);

            // Process chunk
            const promises = chunk.map(async (recipient, index) => {
                const messageData = {
                    ...batchData,
                    to: recipient.to,
                    templateParams: { ...batchData.templateParams, ...recipient.templateParams },
                    customData: recipient.customData,
                    batchId: batchData.batchId,
                    batchIndex: i + index
                };

                // Add delay between messages in chunk
                if (index > 0) {
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                }

                return this.processSingleMessage(messageData);
            });

            await Promise.all(promises);

            // Delay between chunks
            if (i + batchSize < recipients.length) {
                await new Promise(resolve => setTimeout(resolve, delayMs * 2));
            }
        }

        console.log(`✅ Bulk batch ${batchData.batchId} completed`);
    }

    /**
     * Get suitable channel for message
     */
    async getChannelForMessage(messageData) {
        const { channelCategory, channelId, userId, userRole } = messageData;

        let query = { type: this.mapCategoryToType(channelCategory), isActive: true };

        if (channelId) {
            // Use specific channel
            query._id = channelId;
        } else if (userRole === 'admin') {
            // Admin can use any channel of the category
            // Use the first available one
        } else {
            // Coach can use their own channels or public ones
            query.$or = [
                { configuredBy: userId },
                { isPublic: true }
            ];
        }

        const channel = await MessagingChannel.findOne(query).sort({ priority: -1 });
        return channel;
    }

    /**
     * Map channel category to database type
     */
    mapCategoryToType(category) {
        const mapping = {
            'meta_whatsapp': 'whatsapp_api',
            'baileys_whatsapp': 'whatsapp_bailey',
            'email': 'email_smtp'
        };
        return mapping[category] || category;
    }

    /**
     * Prepare message content (handle templates, media, etc.)
     */
    async prepareMessageContent(messageData, channel) {
        const { useTemplate, templateId, templateParams, message, mediaUrl, mediaType } = messageData;

        let finalMessage = message;
        let finalMediaUrl = mediaUrl;
        let finalMediaType = mediaType;

        if (useTemplate && templateId) {
            // Load and render template
            const template = await Template.findById(templateId);
            if (template) {
                finalMessage = this.renderTemplate(template.content, templateParams);
                if (template.content.whatsappOptions && template.content.whatsappOptions.mediaUrl) {
                    finalMediaUrl = template.content.whatsappOptions.mediaUrl;
                    finalMediaType = template.content.whatsappOptions.mediaType;
                }
            }
        }

        return {
            message: finalMessage,
            mediaUrl: finalMediaUrl,
            mediaType: finalMediaType,
            channel
        };
    }

    /**
     * Render template with variables
     */
    renderTemplate(templateContent, params) {
        let rendered = templateContent;

        // Replace variables like {{name}}, {{lead.name}}, etc.
        Object.keys(params).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            rendered = rendered.replace(regex, params[key] || '');
        });

        return rendered;
    }

    /**
     * Send Meta WhatsApp message
     */
    async sendMetaWhatsAppMessage(channel, content) {
        // Use existing Meta WhatsApp service
        const centralWhatsAppService = require('../services/centralWhatsAppService');

        const messageData = {
            to: content.to,
            message: content.message,
            mediaUrl: content.mediaUrl,
            mediaType: content.mediaType
        };

        return await centralWhatsAppService.sendMessage(messageData);
    }

    /**
     * Send Bailey's WhatsApp message with robust error handling
     */
    async sendBaileysWhatsAppMessage(channel, content) {
        const maxRetries = 3;
        let lastError = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`📤 Bailey message attempt ${attempt}/${maxRetries} to ${content.to}`);

                // Get or create Bailey's connection
                const connection = await this.getBaileysConnection(channel);

                if (!connection || !connection.socket) {
                    throw new Error('Bailey\'s connection not available');
                }

                const sock = connection.socket;

                // Verify connection is ready
                if (connection.status !== 'connected') {
                    throw new Error(`Bailey connection not ready: ${connection.status}`);
                }

                // Prepare message
                let messageData;
                if (content.mediaUrl) {
                    // Send media message
                    messageData = await this.prepareMediaMessage(content, sock);
                } else {
                    // Send text message
                    messageData = { text: content.message };
                }

                // Send with timeout
                const sendPromise = sock.sendMessage(content.to, messageData);
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Send timeout')), 30000); // 30 second timeout
                });

                const result = await Promise.race([sendPromise, timeoutPromise]);

                console.log(`✅ Bailey message sent successfully on attempt ${attempt}`);
                return result;

            } catch (error) {
                lastError = error;
                console.error(`❌ Bailey message attempt ${attempt} failed:`, error.message);

                // Don't retry on certain errors
                if (error.message.includes('not available') ||
                    error.message.includes('not ready') ||
                    error.message.includes('logged out')) {
                    break;
                }

                // Wait before retry (exponential backoff)
                if (attempt < maxRetries) {
                    const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
                    console.log(`⏳ Waiting ${delay}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        // All attempts failed
        throw new Error(`Bailey message failed after ${maxRetries} attempts: ${lastError?.message}`);
    }

    /**
     * Send email message
     */
    async sendEmailMessage(channel, content) {
        // Get or create email transporter
        const transporter = await this.getEmailTransporter(channel);

        const mailOptions = {
            from: channel.emailSmtp.fromEmail,
            to: content.to,
            subject: content.subject || 'Message from FunnelsEye',
            text: content.message,
            html: content.message // Could add HTML version
        };

        if (content.mediaUrl) {
            // Add attachment if media is present
            mailOptions.attachments = [{
                filename: 'attachment',
                path: content.mediaUrl
            }];
        }

        return await transporter.sendMail(mailOptions);
    }

    /**
     * Get or create Bailey's connection with robust error handling
     */
    async getBaileysConnection(channel) {
        const connectionId = `bailey_${channel._id}`;

        // Check if connection exists and is healthy
        if (this.connections.has(connectionId)) {
            const existingConnection = this.connections.get(connectionId);

            // Check if socket is still connected
            if (existingConnection.socket &&
                existingConnection.socket.user &&
                existingConnection.status === 'connected') {
                console.log(`✅ Reusing healthy Bailey connection: ${connectionId}`);
                return existingConnection;
            } else {
                console.log(`🔄 Connection ${connectionId} unhealthy, recreating...`);
                this.connections.delete(connectionId);
            }
        }

        // Create new Bailey's connection with enhanced robustness
        try {
            console.log(`🚀 Creating new Bailey connection: ${connectionId}`);

            // Ensure session directory exists
            const fs = require('fs');
            const path = require('path');
            const sessionDir = path.join('./sessions/bailey', channel._id.toString());
            if (!fs.existsSync(sessionDir)) {
                fs.mkdirSync(sessionDir, { recursive: true });
                console.log(`📁 Created session directory: ${sessionDir}`);
            }

            const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

            const sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, {})
                },
                printQRInTerminal: false,
                browser: Browsers.macOS('FunnelsEye'),
                logger: pino({ level: 'silent' }),
                // Enhanced connection options
                connectTimeoutMs: 60000, // 60 seconds
                qrTimeout: 60000, // 60 seconds
                defaultQueryTimeoutMs: 60000,
                keepAliveIntervalMs: 20000, // Send keep-alive every 20s
                markOnlineOnConnect: true
            });

            const connection = {
                socket: sock,
                state,
                saveCreds,
                status: 'connecting',
                lastActivity: new Date(),
                reconnectAttempts: 0,
                maxReconnectAttempts: 5
            };

            this.connections.set(connectionId, connection);

            // Enhanced connection event handling
            sock.ev.on('connection.update', async (update) => {
                const { connection: connStatus, lastDisconnect, qr } = update;
                connection.status = connStatus || 'unknown';
                connection.lastActivity = new Date();

                console.log(`🔄 Bailey connection ${connectionId} status:`, connStatus);

                if (connStatus === 'close') {
                    const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

                    if (shouldReconnect && connection.reconnectAttempts < connection.maxReconnectAttempts) {
                        connection.reconnectAttempts++;
                        console.log(`🔄 Reconnecting Bailey session ${connectionId} (attempt ${connection.reconnectAttempts})`);

                        // Exponential backoff
                        const delay = Math.min(1000 * Math.pow(2, connection.reconnectAttempts), 30000);
                        setTimeout(async () => {
                            try {
                                console.log(`🔄 Attempting reconnection for ${connectionId}`);
                                // The socket will automatically attempt to reconnect
                            } catch (error) {
                                console.error(`❌ Reconnection failed for ${connectionId}:`, error);
                            }
                        }, delay);
                    } else {
                        console.log(`❌ Bailey session ${connectionId} permanently disconnected`);
                        this.connections.delete(connectionId);
                    }
                } else if (connStatus === 'open') {
                    console.log(`✅ Bailey session ${connectionId} connected successfully`);
                    connection.reconnectAttempts = 0; // Reset on successful connection
                    connection.status = 'connected';
                } else if (connStatus === 'connecting') {
                    console.log(`🔄 Bailey session ${connectionId} connecting...`);
                }
            });

            // Handle QR code events
            sock.ev.on('qr', (qr) => {
                console.log(`📱 Bailey QR generated for ${connectionId}:`, qr.substring(0, 50) + '...');
                connection.status = 'qr_ready';
            });

            // Handle credentials updates
            sock.ev.on('creds.update', () => {
                console.log(`🔑 Credentials updated for ${connectionId}`);
                saveCreds();
            });

            // Handle messages (for receiving)
            sock.ev.on('messages.upsert', async (m) => {
                // Handle incoming messages if needed
                console.log(`📨 Message received on ${connectionId}`);
            });

            // Wait for initial connection attempt
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Connection timeout'));
                }, 30000); // 30 second timeout

                const checkConnection = () => {
                    if (connection.status === 'connected' || connection.status === 'qr_ready') {
                        clearTimeout(timeout);
                        resolve();
                    } else if (connection.status === 'close') {
                        clearTimeout(timeout);
                        reject(new Error('Connection closed'));
                    } else {
                        // Check again in 1 second
                        setTimeout(checkConnection, 1000);
                    }
                };

                checkConnection();
            });

            console.log(`✅ Bailey connection ${connectionId} initialized`);
            return connection;

        } catch (error) {
            console.error(`❌ Failed to create Bailey's connection for ${connectionId}:`, error);

            // Clean up failed connection
            if (this.connections.has(connectionId)) {
                const failedConnection = this.connections.get(connectionId);
                if (failedConnection.socket) {
                    try {
                        failedConnection.socket.end();
                    } catch (e) {
                        // Ignore cleanup errors
                    }
                }
                this.connections.delete(connectionId);
            }

            return null;
        }
    }

    /**
     * Get or create email transporter
     */
    async getEmailTransporter(channel) {
        const transporterId = `email_${channel._id}`;

        if (this.emailTransporters.has(transporterId)) {
            return this.emailTransporters.get(transporterId);
        }

        // Create new email transporter
        const transporter = nodemailer.createTransporter({
            host: channel.emailSmtp.host,
            port: channel.emailSmtp.port,
            secure: channel.emailSmtp.secure,
            auth: {
                user: channel.emailSmtp.auth.user,
                pass: channel.emailSmtp.auth.pass
            }
        });

        // Verify connection
        await transporter.verify();

        this.emailTransporters.set(transporterId, transporter);
        return transporter;
    }

    /**
     * Prepare media message for WhatsApp with proper handling
     */
    async prepareMediaMessage(content, sock) {
        try {
            const axios = require('axios');
            const fs = require('fs');
            const path = require('path');
            const crypto = require('crypto');

            // Download media file
            console.log(`📥 Downloading media from: ${content.mediaUrl}`);
            const response = await axios.get(content.mediaUrl, {
                responseType: 'arraybuffer',
                timeout: 30000,
                maxContentLength: 50 * 1024 * 1024 // 50MB limit
            });

            // Generate unique filename
            const fileExtension = this.getFileExtension(content.mediaType, content.mediaUrl);
            const filename = `media_${crypto.randomBytes(8).toString('hex')}.${fileExtension}`;
            const filepath = path.join('./temp', filename);

            // Ensure temp directory exists
            if (!fs.existsSync('./temp')) {
                fs.mkdirSync('./temp', { recursive: true });
            }

            // Save file temporarily
            fs.writeFileSync(filepath, Buffer.from(response.data));

            console.log(`💾 Media saved to: ${filepath}`);

            // Prepare message based on media type
            let messageData = {};

            if (content.mediaType === 'image') {
                messageData = {
                    image: { url: filepath },
                    caption: content.message
                };
            } else if (content.mediaType === 'video') {
                messageData = {
                    video: { url: filepath },
                    caption: content.message
                };
            } else if (content.mediaType === 'document') {
                messageData = {
                    document: { url: filepath },
                    fileName: filename,
                    caption: content.message
                };
            } else {
                // Default to document
                messageData = {
                    document: { url: filepath },
                    fileName: filename,
                    caption: content.message
                };
            }

            // Clean up file after sending (with delay)
            setTimeout(() => {
                try {
                    if (fs.existsSync(filepath)) {
                        fs.unlinkSync(filepath);
                        console.log(`🗑️ Cleaned up temp file: ${filepath}`);
                    }
                } catch (error) {
                    console.warn(`⚠️ Failed to cleanup temp file: ${filepath}`, error.message);
                }
            }, 60000); // Clean up after 1 minute

            return messageData;

        } catch (error) {
            console.error('❌ Failed to prepare media message:', error);
            throw new Error(`Media preparation failed: ${error.message}`);
        }
    }

    /**
     * Get file extension based on media type and URL
     */
    getFileExtension(mediaType, url) {
        // Try to extract from URL first
        const urlMatch = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
        if (urlMatch) {
            return urlMatch[1].toLowerCase();
        }

        // Fallback based on media type
        const extensions = {
            image: 'jpg',
            video: 'mp4',
            document: 'pdf',
            audio: 'mp3'
        };

        return extensions[mediaType] || 'bin';
    }

    /**
     * Update message status in database
     */
    async updateMessageStatus(messageId, status, result = null, error = null) {
        try {
            const updateData = {
                status,
                updatedAt: new Date()
            };

            if (status === 'delivered' && result) {
                updateData.deliveredAt = new Date();
                updateData.messageId = result.messageId; // External message ID
            } else if (status === 'failed') {
                updateData.failedAt = new Date();
                updateData.error = error;
            }

            await Message.findByIdAndUpdate(messageId, updateData);
        } catch (dbError) {
            console.error('❌ Failed to update message status:', dbError);
        }
    }

    /**
     * Start connection health monitoring
     */
    startHealthMonitoring() {
        // Check connection health every 5 minutes
        setInterval(() => {
            this.checkConnectionHealth();
        }, 5 * 60 * 1000); // 5 minutes

        // Clean up stale connections every 10 minutes
        setInterval(() => {
            this.cleanupStaleConnections();
        }, 10 * 60 * 1000); // 10 minutes
    }

    /**
     * Check health of all connections
     */
    async checkConnectionHealth() {
        console.log('🔍 Checking connection health...');

        for (const [connectionId, connection] of this.connections) {
            try {
                if (connection.socket) {
                    // Check if socket is still alive
                    const isAlive = connection.socket.user && connection.status === 'connected';

                    if (!isAlive) {
                        console.log(`⚠️ Connection ${connectionId} is unhealthy, marking for cleanup`);
                        connection.status = 'unhealthy';
                    } else {
                        console.log(`✅ Connection ${connectionId} is healthy`);
                    }
                }
            } catch (error) {
                console.error(`❌ Error checking health for ${connectionId}:`, error.message);
                connection.status = 'error';
            }
        }
    }

    /**
     * Clean up stale and unhealthy connections
     */
    cleanupStaleConnections() {
        console.log('🧹 Cleaning up stale connections...');

        const now = Date.now();
        const staleThreshold = 30 * 60 * 1000; // 30 minutes

        for (const [connectionId, connection] of this.connections) {
            const isStale = (now - connection.lastActivity.getTime()) > staleThreshold;
            const isUnhealthy = connection.status === 'unhealthy' || connection.status === 'error';

            if (isStale || isUnhealthy) {
                console.log(`🗑️ Cleaning up connection ${connectionId} (${isStale ? 'stale' : 'unhealthy'})`);

                try {
                    if (connection.socket) {
                        connection.socket.end();
                        connection.socket.ws?.close();
                    }
                } catch (error) {
                    console.warn(`⚠️ Error closing connection ${connectionId}:`, error.message);
                }

                this.connections.delete(connectionId);
            }
        }

        // Clean up email transporters (keep for 1 hour)
        const emailStaleThreshold = 60 * 60 * 1000; // 1 hour
        for (const [transporterId, transporter] of this.emailTransporters) {
            // Email transporters don't have activity tracking, so we can clean them up after 1 hour
            // In a real implementation, you'd track usage
            console.log(`🗑️ Cleaning up email transporter ${transporterId}`);
            this.emailTransporters.delete(transporterId);
        }
    }

    /**
     * Get worker status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            queueType: this.useInMemoryQueue ? 'in-memory' : 'rabbitmq',
            connections: this.connections.size,
            emailTransporters: this.emailTransporters.size,
            stats: this.stats
        };
    }

    /**
     * Get queue statistics
     */
    getQueueStats() {
        if (this.useInMemoryQueue) {
            return {
                queued: this.messageQueue.length,
                processing: this.processingBatch,
                ...this.stats
            };
        } else {
            // Would get stats from RabbitMQ
            return {
                ...this.stats,
                rabbitmqConnected: this.connection ? true : false
            };
        }
    }

    /**
     * Restart worker
     */
    async restart() {
        console.log('🔄 Restarting Messaging v3 Worker...');

        // Close connections
        for (const [id, connection] of this.connections) {
            try {
                if (connection.socket) {
                    connection.socket.end();
                }
            } catch (error) {
                console.warn(`⚠️ Error closing connection ${id}:`, error.message);
            }
        }

        // Clear connections and transporters
        this.connections.clear();
        this.emailTransporters.clear();

        // Reset stats
        this.stats = {
            processed: 0,
            failed: 0,
            queued: 0,
            avgProcessingTime: 0
        };

        // Reinitialize
        await this.initialize();

        console.log('✅ Messaging v3 Worker restarted');
    }

    /**
     * Shutdown worker
     */
    async shutdown() {
        console.log('🛑 Shutting down Messaging v3 Worker...');

        this.isRunning = false;

        // Close RabbitMQ connection
        if (this.channel) {
            await this.channel.close();
        }
        if (this.connection) {
            await this.connection.close();
        }

        // Close all connections
        for (const [id, connection] of this.connections) {
            try {
                if (connection.socket) {
                    connection.socket.end();
                }
            } catch (error) {
                console.warn(`⚠️ Error closing connection ${id}:`, error.message);
            }
        }

        this.connections.clear();
        this.emailTransporters.clear();

        console.log('✅ Messaging v3 Worker shut down');
    }
}

// Create singleton instance
const messagingV3Worker = new MessagingV3Worker();

// Initialize on module load
messagingV3Worker.initialize().catch(error => {
    console.error('❌ Failed to initialize Messaging v3 Worker:', error);
});

module.exports = messagingV3Worker;