/**
 * Environment Configuration
 * 
 * To change the API URL for different environments:
 * 1. For development: Set API_BASE_URL to 'http://localhost:8080'
 * 2. For production: Set API_BASE_URL to 'https://api.funnelseye.com'
 * 3. For staging: Set API_BASE_URL to 'https://staging-api.funnelseye.com'
 */

// ========================================
// CONFIGURATION - CHANGE THIS FOR DIFFERENT ENVIRONMENTS
// ========================================

// Development URL (localhost)
const DEV_API_URL = 'http://localhost:8080';

// Production URL
const PROD_API_URL = 'https://api.funnelseye.com';

// Staging URL (if needed)
const STAGING_API_URL = 'https://staging-api.funnelseye.com';

// ========================================
// ENVIRONMENT DETECTION
// ========================================

function getEnvironment() {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'development';
    } else if (hostname.includes('staging') || hostname.includes('test')) {
        return 'staging';
    } else {
        return 'production';
    }
}

function getApiBaseUrl() {
    // Check for manual override first (useful for testing)
    const manualOverride = window.MANUAL_API_URL;
    if (manualOverride) {
        console.log('🔧 [Config] Using manual API URL override:', manualOverride);
        return manualOverride;
    }
    
    const env = getEnvironment();
    console.log('🌍 [Config] Detected environment:', env);
    
    switch (env) {
        case 'development':
            console.log('🔗 [Config] Using development API URL:', DEV_API_URL);
            return DEV_API_URL;
        case 'staging':
            console.log('🔗 [Config] Using staging API URL:', STAGING_API_URL);
            return STAGING_API_URL;
        case 'production':
            console.log('🔗 [Config] Using production API URL:', PROD_API_URL);
            return PROD_API_URL;
        default:
            console.log('🔗 [Config] Using default development API URL:', DEV_API_URL);
            return DEV_API_URL;
    }
}

// ========================================
// EXPORTED CONFIGURATION
// ========================================

const config = {
    // Base URLs
    API_BASE_URL: getApiBaseUrl(),
    API_ENDPOINT: `${getApiBaseUrl()}/api`,
    
    // Environment info
    ENVIRONMENT: getEnvironment(),
    
    // Helper methods
    getApiUrl: (endpoint) => {
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        return `${config.API_ENDPOINT}${cleanEndpoint}`;
    },
    
    getWebSocketUrl: () => {
        const wsProtocol = config.API_BASE_URL.startsWith('https') ? 'wss' : 'ws';
        const wsHost = config.API_BASE_URL.replace(/^https?:\/\//, '');
        return `${wsProtocol}://${wsHost}/ws`;
    },
    
    getUploadUrl: () => {
        return `${config.API_BASE_URL}/uploads`;
    },
    
    // Manual override method (for testing)
    setApiUrl: (newUrl) => {
        config.API_BASE_URL = newUrl;
        config.API_ENDPOINT = `${newUrl}/api`;
        console.log('🔄 [Config] API URL manually updated to:', newUrl);
    }
};

// Log configuration on load
console.log('⚙️ [Config] Configuration loaded:', {
    environment: config.ENVIRONMENT,
    apiBaseUrl: config.API_BASE_URL,
    apiEndpoint: config.API_ENDPOINT
});

// Export for both ES6 modules and global access
export default config;

// Also make it available globally for easy access
if (typeof window !== 'undefined') {
    window.API_CONFIG = config;
    
    // Add helper function for easy URL changes during testing
    window.setApiUrl = (url) => {
        config.setApiUrl(url);
        console.log('🔧 [Config] Use window.setApiUrl("http://localhost:8080") to change API URL for testing');
    };
}
