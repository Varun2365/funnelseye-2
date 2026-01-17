/**
 * Razorpay Utilities
 * Dynamically loads Razorpay checkout script to avoid compatibility issues
 */

// Global flag to track if Razorpay is loaded
let razorpayLoaded = false;
let razorpayLoadingPromise = null;

/**
 * Dynamically load Razorpay checkout script
 * @returns {Promise} Promise that resolves when Razorpay is loaded
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    // If already loaded, resolve immediately
    if (razorpayLoaded && window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }

    // If already loading, return the existing promise
    if (razorpayLoadingPromise) {
      razorpayLoadingPromise.then(() => resolve(window.Razorpay)).catch(reject);
      return;
    }

    // Create a new loading promise
    razorpayLoadingPromise = new Promise((resolveLoading, rejectLoading) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;

      script.onload = () => {
        razorpayLoaded = true;
        console.log('✅ Razorpay script loaded successfully');
        resolveLoading(window.Razorpay);
      };

      script.onerror = (error) => {
        console.error('❌ Failed to load Razorpay script:', error);
        rejectLoading(error);
      };

      document.head.appendChild(script);
    });

    // Handle the promise resolution
    razorpayLoadingPromise.then(() => resolve(window.Razorpay)).catch(reject);
  });
};

/**
 * Initialize Razorpay payment
 * @param {Object} options - Razorpay options
 * @returns {Promise} Payment result
 */
export const initializeRazorpayPayment = async (options) => {
  try {
    // Load Razorpay script if not already loaded
    await loadRazorpayScript();

    // Create Razorpay instance
    const razorpayInstance = new window.Razorpay({
      key: options.key || process.env.REACT_APP_RAZORPAY_KEY_ID,
      ...options
    });

    return razorpayInstance;
  } catch (error) {
    console.error('Error initializing Razorpay:', error);
    throw error;
  }
};

/**
 * Open Razorpay checkout modal
 * @param {Object} options - Payment options
 */
export const openRazorpayCheckout = async (options) => {
  try {
    const razorpayInstance = await initializeRazorpayPayment(options);

    // Open the checkout modal
    razorpayInstance.open();
  } catch (error) {
    console.error('Error opening Razorpay checkout:', error);
    throw error;
  }
};

export default {
  loadRazorpayScript,
  initializeRazorpayPayment,
  openRazorpayCheckout
};