/**
 * Centralized API Configuration
 * Root UI Application
 *
 * This file manages the API base URL for the root UI application.
 * - Development: Uses localhost:8080
 * - Production: Uses api.funnelseye.com
 *
 * The environment is automatically detected based on:
 * - import.meta.env.MODE === 'development' (Vite dev mode)
 * - import.meta.env.PROD === true (production build)
 */

// Determine if we're in development or production
const isDevelopment = import.meta.env.MODE === 'development' || import.meta.env.DEV;
const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';

// Set the API base URL based on environment
// In development, use localhost:8080
// In production (build), use api.funnelseye.com
export const API_BASE_URL = isDevelopment
  ? 'http://localhost:8080'
  : 'https://api.funnelseye.com';

// Export for use in other files
export default API_BASE_URL;

// Log the current configuration (only in development)
if (isDevelopment) {
  console.log('🔧 Root UI API Configuration:', {
    environment: isDevelopment ? 'Development' : 'Production',
    apiBaseUrl: API_BASE_URL,
    mode: import.meta.env.MODE,
    prod: import.meta.env.PROD,
    dev: import.meta.env.DEV
  });
}
