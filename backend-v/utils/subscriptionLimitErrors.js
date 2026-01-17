/**
 * Utility functions for standardized subscription limit error responses
 */

/**
 * Create a standardized subscription limit error response
 * @param {string} limitType - Type of limit (e.g., 'FUNNEL', 'STAFF', 'LEAD', 'CAMPAIGN', 'AUTOMATION_RULE')
 * @param {string} reason - Reason for the limit error
 * @param {number} currentCount - Current count of the resource
 * @param {number} maxLimit - Maximum allowed limit
 * @param {boolean} upgradeRequired - Whether an upgrade is required
 * @returns {Object} Standardized error response object
 */
const createLimitErrorResponse = (limitType, reason, currentCount, maxLimit, upgradeRequired = true) => {
    const errorCodes = {
        FUNNEL: 'FUNNEL_LIMIT_REACHED',
        STAFF: 'STAFF_LIMIT_REACHED',
        LEAD: 'LEAD_LIMIT_REACHED',
        CAMPAIGN: 'CAMPAIGN_LIMIT_REACHED',
        AUTOMATION_RULE: 'AUTOMATION_RULE_LIMIT_REACHED',
        APPOINTMENT: 'APPOINTMENT_LIMIT_REACHED',
        EMAIL_CREDIT: 'EMAIL_CREDIT_LIMIT_REACHED',
        SMS_CREDIT: 'SMS_CREDIT_LIMIT_REACHED',
        STORAGE: 'STORAGE_LIMIT_REACHED',
        DEVICE: 'DEVICE_LIMIT_REACHED'
    };

    const errorCode = errorCodes[limitType] || 'SUBSCRIPTION_LIMIT_REACHED';
    
    const messages = {
        FUNNEL: `Funnel limit reached. You have ${currentCount} of ${maxLimit === -1 ? 'unlimited' : maxLimit} funnels. Upgrade your plan to create more funnels.`,
        STAFF: `Staff limit reached. You have ${currentCount} of ${maxLimit === -1 ? 'unlimited' : maxLimit} staff members. Upgrade your plan to add more staff.`,
        LEAD: `Lead limit reached. You have ${currentCount} of ${maxLimit === -1 ? 'unlimited' : maxLimit} leads. Upgrade your plan to add more leads.`,
        CAMPAIGN: `Campaign limit reached. You have ${currentCount} of ${maxLimit === -1 ? 'unlimited' : maxLimit} campaigns. Upgrade your plan to create more campaigns.`,
        AUTOMATION_RULE: `Automation rule limit reached. You have ${currentCount} of ${maxLimit === -1 ? 'unlimited' : maxLimit} automation rules. Upgrade your plan to create more automation rules.`,
        APPOINTMENT: `Appointment limit reached. You have ${currentCount} of ${maxLimit === -1 ? 'unlimited' : maxLimit} appointments. Upgrade your plan to schedule more appointments.`,
        EMAIL_CREDIT: `Email credit limit reached. You have ${currentCount} of ${maxLimit === -1 ? 'unlimited' : maxLimit} email credits. Upgrade your plan to get more email credits.`,
        SMS_CREDIT: `SMS credit limit reached. You have ${currentCount} of ${maxLimit === -1 ? 'unlimited' : maxLimit} SMS credits. Upgrade your plan to get more SMS credits.`,
        STORAGE: `Storage limit reached. You have used ${currentCount}GB of ${maxLimit === -1 ? 'unlimited' : maxLimit + 'GB'} storage. Upgrade your plan to get more storage.`,
        DEVICE: `Device limit reached. You have ${currentCount} of ${maxLimit === -1 ? 'unlimited' : maxLimit} devices. Upgrade your plan to connect more devices.`
    };

    const message = messages[limitType] || reason || 'Subscription limit reached. Please upgrade your plan.';

    return {
        success: false,
        message,
        error: errorCode,
        limitType,
        currentCount,
        maxLimit,
        unlimited: maxLimit === -1,
        upgradeRequired,
        subscriptionRequired: true
    };
};

/**
 * Send a standardized subscription limit error response
 * @param {Object} res - Express response object
 * @param {string} limitType - Type of limit
 * @param {string} reason - Reason for the limit error
 * @param {number} currentCount - Current count
 * @param {number} maxLimit - Maximum limit
 * @param {boolean} upgradeRequired - Whether upgrade is required
 * @returns {Object} Response object
 */
const sendLimitError = (res, limitType, reason, currentCount, maxLimit, upgradeRequired = true) => {
    const errorResponse = createLimitErrorResponse(limitType, reason, currentCount, maxLimit, upgradeRequired);
    return res.status(403).json(errorResponse);
};

module.exports = {
    createLimitErrorResponse,
    sendLimitError
};

