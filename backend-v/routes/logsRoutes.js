const express = require('express');
const router = express.Router();

// Store logs in memory (in production, you might want to use a database)
let logs = [];
const MAX_LOGS = 1000; // Keep last 1000 logs

// Store connected WebSocket clients
let connectedClients = new Set();

// Global reference to WebSocket server for broadcasting
let globalWSS = null;

// Function to set the WebSocket server reference
function setWebSocketServer(wss) {
    globalWSS = wss;
}

// Function to get logs (for external access)
function getLogs(limit = 100) {
    return logs.slice(0, limit);
}

// Override console methods to capture logs
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;

function addLog(type, message, timestamp = new Date()) {
    const logEntry = {
        id: Date.now() + Math.random(),
        timestamp: timestamp.toISOString(),
        type: type,
        message: typeof message === 'object' ? JSON.stringify(message, null, 2) : String(message),
        level: type === 'error' ? 'error' : type === 'warn' ? 'warn' : 'info'
    };

    // Add to logs array
    logs.unshift(logEntry);
    
    // Keep only the last MAX_LOGS entries
    if (logs.length > MAX_LOGS) {
        logs = logs.slice(0, MAX_LOGS);
    }

    // Broadcast to all connected clients
    broadcastLog(logEntry);
}

function broadcastLog(logEntry) {
    const message = JSON.stringify({
        type: 'newLog',
        data: logEntry
    });

    // Broadcast to WebSocket clients
    if (globalWSS) {
        globalWSS.clients.forEach(client => {
            try {
                if (client.readyState === client.OPEN) {
                    client.send(message);
                }
            } catch (error) {
                console.error('Error broadcasting to WebSocket client:', error);
            }
        });
    }

    // Also broadcast to connected clients (fallback)
    connectedClients.forEach(client => {
        try {
            if (client.readyState === client.OPEN) {
                client.send(message);
            }
        } catch (error) {
            // Remove disconnected clients
            connectedClients.delete(client);
        }
    });
}

// Override console methods
console.log = (...args) => {
    const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    
    addLog('log', message);
    originalConsoleLog(...args);
};

console.error = (...args) => {
    const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    
    addLog('error', message);
    originalConsoleError(...args);
};

console.warn = (...args) => {
    const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    
    addLog('warn', message);
    originalConsoleWarn(...args);
};

console.info = (...args) => {
    const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    
    addLog('info', message);
    originalConsoleInfo(...args);
};

// Serve the logs page
router.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Real-time Server Logs</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
                    color: #e2e8f0;
                    min-height: 100vh;
                    overflow: hidden;
                }

                .app-container {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    background: rgba(15, 15, 35, 0.95);
                    backdrop-filter: blur(20px);
                }

                .header {
                    background: rgba(26, 26, 46, 0.8);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 1rem 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .header h1 {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    font-size: 1.5rem;
                    font-weight: 700;
                    letter-spacing: -0.025em;
                }

                .status-indicator {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    border-radius: 2rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }

                .status-indicator.connected {
                    background: rgba(34, 197, 94, 0.2);
                    color: #22c55e;
                    border: 1px solid rgba(34, 197, 94, 0.3);
                }

                .status-indicator.disconnected {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                    border: 1px solid rgba(239, 68, 68, 0.3);
                }

                .status-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    animation: pulse 2s infinite;
                }

                .status-indicator.connected .status-dot {
                    background: #22c55e;
                }

                .status-indicator.disconnected .status-dot {
                    background: #ef4444;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                .controls {
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                }

                .btn {
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    font-size: 0.875rem;
                    font-weight: 500;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                    color: white;
                    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
                }

                .btn-primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
                }

                .btn-danger {
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    color: white;
                    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
                }

                .btn-danger:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
                }

                .filters-section {
                    background: rgba(26, 26, 46, 0.6);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 1rem 1.5rem;
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                    flex-wrap: wrap;
                }

                .filter-group {
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                }

                .filter-label {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #94a3b8;
                }

                .filter-btn {
                    padding: 0.375rem 0.75rem;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 0.375rem;
                    background: rgba(255, 255, 255, 0.05);
                    color: #e2e8f0;
                    cursor: pointer;
                    font-size: 0.75rem;
                    font-weight: 500;
                    transition: all 0.2s ease;
                }

                .filter-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(255, 255, 255, 0.3);
                }

                .filter-btn.active {
                    background: rgba(59, 130, 246, 0.2);
                    border-color: #3b82f6;
                    color: #60a5fa;
                }

                .filter-btn.log.active {
                    background: rgba(59, 130, 246, 0.2);
                    border-color: #3b82f6;
                    color: #60a5fa;
                }

                .filter-btn.info.active {
                    background: rgba(34, 197, 94, 0.2);
                    border-color: #22c55e;
                    color: #4ade80;
                }

                .filter-btn.warn.active {
                    background: rgba(245, 158, 11, 0.2);
                    border-color: #f59e0b;
                    color: #fbbf24;
                }

                .filter-btn.error.active {
                    background: rgba(239, 68, 68, 0.2);
                    border-color: #ef4444;
                    color: #f87171;
                }

                .logs-container {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1rem;
                    background: rgba(15, 15, 35, 0.3);
                }

                .log-entry {
                    margin-bottom: 0.5rem;
                    padding: 0.75rem 1rem;
                    border-radius: 0.5rem;
                    border-left: 3px solid transparent;
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(10px);
                    transition: all 0.2s ease;
                    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
                    font-size: 0.875rem;
                    line-height: 1.5;
                }

                .log-entry:hover {
                    background: rgba(255, 255, 255, 0.08);
                    transform: translateX(4px);
                }

                .log-entry.log {
                    border-left-color: #3b82f6;
                }

                .log-entry.info {
                    border-left-color: #22c55e;
                }

                .log-entry.warn {
                    border-left-color: #f59e0b;
                    background: rgba(245, 158, 11, 0.05);
                }

                .log-entry.error {
                    border-left-color: #ef4444;
                    background: rgba(239, 68, 68, 0.05);
                }

                .log-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 0.25rem;
                }

                .log-timestamp {
                    color: #64748b;
                    font-size: 0.75rem;
                    font-weight: 500;
                    min-width: 80px;
                }

                .log-type-badge {
                    padding: 0.125rem 0.5rem;
                    border-radius: 0.25rem;
                    font-size: 0.625rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .log-type-badge.log {
                    background: rgba(59, 130, 246, 0.2);
                    color: #60a5fa;
                }

                .log-type-badge.info {
                    background: rgba(34, 197, 94, 0.2);
                    color: #4ade80;
                }

                .log-type-badge.warn {
                    background: rgba(245, 158, 11, 0.2);
                    color: #fbbf24;
                }

                .log-type-badge.error {
                    background: rgba(239, 68, 68, 0.2);
                    color: #f87171;
                }

                .log-message {
                    color: #e2e8f0;
                    word-wrap: break-word;
                    white-space: pre-wrap;
                    font-size: 0.875rem;
                }

                .no-logs {
                    text-align: center;
                    color: #64748b;
                    margin-top: 3rem;
                    font-size: 1rem;
                    font-weight: 500;
                }

                .no-logs-icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                    opacity: 0.5;
                }

                /* Scrollbar styling */
                .logs-container::-webkit-scrollbar {
                    width: 6px;
                }

                .logs-container::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 3px;
                }

                .logs-container::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 3px;
                }

                .logs-container::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.3);
                }

                /* Auto-scroll indicator */
                .auto-scroll {
                    position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    width: 3rem;
                    height: 3rem;
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                }

                .auto-scroll:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 25px rgba(59, 130, 246, 0.6);
                }

                .auto-scroll.disabled {
                    background: linear-gradient(135deg, #64748b 0%, #475569 100%);
                    box-shadow: 0 4px 20px rgba(100, 116, 139, 0.4);
                }

                .stats-bar {
                    background: rgba(26, 26, 46, 0.6);
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 0.75rem 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.875rem;
                    color: #94a3b8;
                }

                .stats-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .stats-count {
                    font-weight: 600;
                    color: #e2e8f0;
                }

                @media (max-width: 768px) {
                    .header {
                        flex-direction: column;
                        gap: 1rem;
                        align-items: stretch;
                    }

                    .header-left {
                        justify-content: center;
                    }

                    .controls {
                        justify-content: center;
                    }

                    .filters-section {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .filter-group {
                        justify-content: center;
                    }
                }
            </style>
        </head>
        <body>
            <div class="app-container">
                <div class="header">
                    <div class="header-left">
                        <h1>📊 Real-time Server Logs</h1>
                        <div class="status-indicator disconnected" id="status">
                            <div class="status-dot"></div>
                            <span>Disconnected</span>
                        </div>
                    </div>
                    <div class="controls">
                        <button class="btn btn-primary" onclick="connect()">
                            <span>🔌</span>
                            Connect
                        </button>
                        <button class="btn btn-danger" onclick="clearLogs()">
                            <span>🗑️</span>
                            Clear Logs
                        </button>
                    </div>
                </div>

                <div class="filters-section">
                    <div class="filter-group">
                        <span class="filter-label">Filter by type:</span>
                        <button class="filter-btn active" data-type="all" onclick="toggleFilter('all')">All</button>
                        <button class="filter-btn log" data-type="log" onclick="toggleFilter('log')">Log</button>
                        <button class="filter-btn info" data-type="info" onclick="toggleFilter('info')">Info</button>
                        <button class="filter-btn warn" data-type="warn" onclick="toggleFilter('warn')">Warn</button>
                        <button class="filter-btn error" data-type="error" onclick="toggleFilter('error')">Error</button>
                    </div>
                </div>

                <div class="logs-container" id="logsContainer">
                    <div class="no-logs" id="noLogs">
                        <div class="no-logs-icon">📋</div>
                        <div>No logs available. Connect to start streaming...</div>
                    </div>
                </div>

                <div class="stats-bar">
                    <div class="stats-item">
                        <span>📊 Total Logs:</span>
                        <span class="stats-count" id="totalLogs">0</span>
                    </div>
                    <div class="stats-item">
                        <span>🔵 Logs:</span>
                        <span class="stats-count" id="logCount">0</span>
                    </div>
                    <div class="stats-item">
                        <span>🟢 Info:</span>
                        <span class="stats-count" id="infoCount">0</span>
                    </div>
                    <div class="stats-item">
                        <span>🟡 Warnings:</span>
                        <span class="stats-count" id="warnCount">0</span>
                    </div>
                    <div class="stats-item">
                        <span>🔴 Errors:</span>
                        <span class="stats-count" id="errorCount">0</span>
                    </div>
                </div>
            </div>

            <button class="auto-scroll" id="autoScroll" onclick="toggleAutoScroll()" title="Auto-scroll to bottom">
                ⬇️
            </button>

            <script>
                let ws = null;
                let autoScrollEnabled = true;
                let isConnected = false;
                let allLogs = [];
                let filteredLogs = [];
                let activeFilter = 'all';
                let logCounts = { log: 0, info: 0, warn: 0, error: 0 };

                function connect() {
                    if (ws && ws.readyState === WebSocket.OPEN) {
                        return;
                    }

                    // Use the same protocol and host as the current page
                    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                    const wsUrl = protocol + '//' + window.location.host + '/api/logs/stream';
                    
                    ws = new WebSocket(wsUrl);

                    ws.onopen = function() {
                        isConnected = true;
                        updateStatus('connected', 'Connected');
                        console.log('✅ Connected to log stream');
                        console.log('WebSocket URL:', wsUrl);
                    };

                    ws.onmessage = function(event) {
                        console.log('📥 Received WebSocket message:', event.data);
                        try {
                            const data = JSON.parse(event.data);
                            console.log('📋 Parsed data:', data);
                            if (data.type === 'newLog') {
                                console.log('➕ Adding new log entry');
                                addLogEntry(data.data);
                            } else if (data.type === 'initialLogs') {
                                console.log('📊 Loading initial logs:', data.data.length, 'logs');
                                loadInitialLogs(data.data);
                            }
                        } catch (error) {
                            console.error('❌ Error parsing log message:', error);
                        }
                    };

                    ws.onclose = function() {
                        isConnected = false;
                        updateStatus('disconnected', 'Disconnected');
                        console.log('Disconnected from log stream');
                        
                        // Auto-reconnect after 3 seconds
                        setTimeout(() => {
                            if (!isConnected) {
                                connect();
                            }
                        }, 3000);
                    };

                    ws.onerror = function(error) {
                        console.error('❌ WebSocket error:', error);
                        updateStatus('disconnected', 'Error');
                    };
                }

                function updateStatus(status, text) {
                    const statusElement = document.getElementById('status');
                    statusElement.className = 'status-indicator ' + status;
                    statusElement.querySelector('span').textContent = text;
                }

                function addLogEntry(log) {
                    // Add to all logs array
                    allLogs.unshift(log);
                    
                    // Update counts
                    logCounts[log.type] = (logCounts[log.type] || 0) + 1;
                    
                    // Apply current filter
                    applyFilter();
                    
                    // Update stats
                    updateStats();
                    
                    // Limit total logs
                    if (allLogs.length > 1000) {
                        const removedLog = allLogs.pop();
                        logCounts[removedLog.type] = Math.max(0, logCounts[removedLog.type] - 1);
                    }
                }

                function applyFilter() {
                    const container = document.getElementById('logsContainer');
                    const noLogs = document.getElementById('noLogs');
                    
                    // Filter logs based on active filter
                    if (activeFilter === 'all') {
                        filteredLogs = [...allLogs];
                    } else {
                        filteredLogs = allLogs.filter(log => log.type === activeFilter);
                    }
                    
                    // Clear container
                    container.innerHTML = '';
                    
                    if (filteredLogs.length === 0) {
                        const noLogsDiv = document.createElement('div');
                        noLogsDiv.className = 'no-logs';
                        noLogsDiv.innerHTML = 
                            '<div class="no-logs-icon">📋</div>' +
                            '<div>No ' + (activeFilter === 'all' ? '' : activeFilter + ' ') + 'logs found</div>';
                        container.appendChild(noLogsDiv);
                        return;
                    }
                    
                    // Add filtered logs
                    filteredLogs.forEach(log => {
                        const logEntry = createLogEntry(log);
                        container.appendChild(logEntry);
                    });
                    
                    // Auto-scroll if enabled
                    if (autoScrollEnabled && filteredLogs.length > 0) {
                        container.scrollTop = 0;
                    }
                }

                function createLogEntry(log) {
                    const logEntry = document.createElement('div');
                    logEntry.className = 'log-entry ' + log.type;
                    logEntry.innerHTML = 
                        '<div class="log-header">' +
                            '<span class="log-timestamp">' + formatTimestamp(log.timestamp) + '</span>' +
                            '<span class="log-type-badge ' + log.type + '">' + log.type + '</span>' +
                        '</div>' +
                        '<div class="log-message">' + escapeHtml(log.message) + '</div>';
                    return logEntry;
                }

                function updateStats() {
                    document.getElementById('totalLogs').textContent = allLogs.length;
                    document.getElementById('logCount').textContent = logCounts.log || 0;
                    document.getElementById('infoCount').textContent = logCounts.info || 0;
                    document.getElementById('warnCount').textContent = logCounts.warn || 0;
                    document.getElementById('errorCount').textContent = logCounts.error || 0;
                }

                function toggleFilter(type) {
                    // Update active filter
                    activeFilter = type;
                    
                    // Update filter buttons
                    document.querySelectorAll('.filter-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    document.querySelector('.filter-btn[data-type="' + type + '"]').classList.add('active');
                    
                    // Apply filter
                    applyFilter();
                }

                function loadInitialLogs(initialLogs) {
                    // Clear existing logs
                    allLogs = [];
                    logCounts = { log: 0, info: 0, warn: 0, error: 0 };
                    
                    // Add initial logs
                    initialLogs.forEach(log => {
                        allLogs.unshift(log);
                        logCounts[log.type] = (logCounts[log.type] || 0) + 1;
                    });
                    
                    // Apply current filter and update display
                    applyFilter();
                    updateStats();
                }

                function clearLogs() {
                    if (confirm('Are you sure you want to clear all logs?')) {
                        fetch('/api/logs/clear', { method: 'POST' })
                            .then(response => response.json())
                            .then(data => {
                                if (data.success) {
                                    // Clear local logs
                                    allLogs = [];
                                    logCounts = { log: 0, info: 0, warn: 0, error: 0 };
                                    
                                    // Update display
                                    applyFilter();
                                    updateStats();
                                }
                            })
                            .catch(error => {
                                console.error('Error clearing logs:', error);
                            });
                    }
                }

                function toggleAutoScroll() {
                    autoScrollEnabled = !autoScrollEnabled;
                    const autoScrollBtn = document.getElementById('autoScroll');
                    
                    if (autoScrollEnabled) {
                        autoScrollBtn.className = 'auto-scroll';
                        autoScrollBtn.title = 'Auto-scroll enabled (click to disable)';
                    } else {
                        autoScrollBtn.className = 'auto-scroll disabled';
                        autoScrollBtn.title = 'Auto-scroll disabled (click to enable)';
                    }
                }

                function formatTimestamp(timestamp) {
                    const date = new Date(timestamp);
                    return date.toLocaleTimeString() + '.' + date.getMilliseconds().toString().padStart(3, '0');
                }

                function escapeHtml(text) {
                    const div = document.createElement('div');
                    div.textContent = text;
                    return div.innerHTML;
                }

                // Auto-connect on page load
                window.addEventListener('load', () => {
                    connect();
                });

                // Handle page visibility change
                document.addEventListener('visibilitychange', () => {
                    if (document.hidden) {
                        // Page is hidden, we can pause updates
                    } else {
                        // Page is visible, reconnect if needed
                        if (!isConnected) {
                            connect();
                        }
                    }
                });
            </script>
        </body>
        </html>
    `);
});

// WebSocket endpoint for real-time log streaming
router.get('/stream', (req, res) => {
    // This will be handled by the WebSocket upgrade in main.js
    res.status(426).json({ error: 'Upgrade Required' });
});

// API endpoint to get current logs
router.get('/api', (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const type = req.query.type;
    
    let filteredLogs = logs;
    
    if (type) {
        filteredLogs = logs.filter(log => log.type === type);
    }
    
    res.json({
        success: true,
        logs: filteredLogs.slice(0, limit),
        total: filteredLogs.length
    });
});

// API endpoint to clear logs
router.post('/clear', (req, res) => {
    logs = [];
    res.json({
        success: true,
        message: 'Logs cleared successfully'
    });
});

// Export the router and utility functions
module.exports = router;
module.exports.setWebSocketServer = setWebSocketServer;
module.exports.getLogs = getLogs;
