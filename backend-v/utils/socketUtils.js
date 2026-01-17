// Utility to get Socket.IO instance
// This allows services to access the Socket.IO instance without circular dependencies

let ioInstance = null;

/**
 * Set the Socket.IO instance
 * @param {Object} io - Socket.IO Server instance
 */
function setIoInstance(io) {
    ioInstance = io;
}

/**
 * Get the Socket.IO instance
 * @returns {Object|null} Socket.IO Server instance or null if not set
 */
function getIoInstance() {
    return ioInstance;
}

module.exports = {
    setIoInstance,
    getIoInstance
};

