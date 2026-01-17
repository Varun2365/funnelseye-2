// config/cors.js
// Simple CORS configuration - allows all origins

const corsOptions = {
    origin: '*',  // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: '*',  // Allow all headers
    credentials: false,  // Disable credentials for security
    optionsSuccessStatus: 200
};

// Export both the options and a function for dynamic configuration
module.exports = {
    corsOptions,
    
    // Function to get CORS options with custom origins (for admin settings)
    getCorsOptions: function(customOrigins = []) {
        return corsOptions;  // Always return the same permissive options
    },
    
    // Function to validate if an origin is allowed
    isOriginAllowed: function(origin) {
        return true;  // Always allow all origins
    }
};