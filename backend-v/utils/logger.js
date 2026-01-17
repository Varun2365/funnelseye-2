/**
 * Simple Logger Utility
 * Provides consistent logging across the application
 */

class Logger {
    constructor() {
        this.isDevelopment = process.env.NODE_ENV === 'development';
    }

    info(message, ...args) {
        const timestamp = new Date().toISOString();
        console.log(`[INFO] ${timestamp} - ${message}`, ...args);
    }

    warn(message, ...args) {
        const timestamp = new Date().toISOString();
        console.warn(`[WARN] ${timestamp} - ${message}`, ...args);
    }

    error(message, ...args) {
        const timestamp = new Date().toISOString();
        console.error(`[ERROR] ${timestamp} - ${message}`, ...args);
    }

    debug(message, ...args) {
        if (this.isDevelopment) {
            const timestamp = new Date().toISOString();
            console.log(`[DEBUG] ${timestamp} - ${message}`, ...args);
        }
    }

    log(level, message, ...args) {
        switch (level.toLowerCase()) {
            case 'info':
                this.info(message, ...args);
                break;
            case 'warn':
                this.warn(message, ...args);
                break;
            case 'error':
                this.error(message, ...args);
                break;
            case 'debug':
                this.debug(message, ...args);
                break;
            default:
                this.info(message, ...args);
        }
    }
}

module.exports = new Logger();
