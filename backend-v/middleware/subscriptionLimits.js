const CoachSubscription = require('../schema/CoachSubscription');
const SubscriptionPlan = require('../schema/SubscriptionPlan');
const Funnel = require('../schema/Funnel');
const Staff = require('../schema/Staff');
const Lead = require('../schema/Lead');
const AdCampaign = require('../schema/AdCampaign');
const Appointment = require('../schema/Appointment');
const WhatsAppDevice = require('../schema/WhatsAppDevice');
const logger = require('../utils/logger');

/**
 * Subscription Limits Middleware
 * Checks coach subscription limits before allowing resource creation
 */
class SubscriptionLimitsMiddleware {
    
    /**
     * Get coach's active subscription with plan details
     */
    static async getCoachSubscription(coachId) {
        try {
            const subscription = await CoachSubscription.findOne({
                coachId,
                status: { $in: ['active', 'trial'] }
            }).populate('planId');
            
            if (!subscription) {
                return null;
            }
            
            return {
                subscription,
                plan: subscription.planId,
                features: subscription.planId?.features || {},
                limits: subscription.planId?.limits || {}
            };
        } catch (error) {
            logger.error('[SubscriptionLimits] Error fetching coach subscription:', error);
            return null;
        }
    }
    
    /**
     * Check funnel limit
     */
    static async checkFunnelLimit(coachId) {
        try {
            const subscriptionData = await this.getCoachSubscription(coachId);
            if (!subscriptionData) {
                logger.warn(`[SubscriptionLimits] No active subscription found for coach: ${coachId}`);
                return { 
                    allowed: false, 
                    reason: 'No active subscription found. Please subscribe to a plan to create funnels.',
                    currentCount: 0,
                    maxLimit: 0,
                    upgradeRequired: true
                };
            }
            
            const { features, plan } = subscriptionData;
            
            // Check if plan exists
            if (!plan) {
                logger.warn(`[SubscriptionLimits] Subscription found but plan is missing for coach: ${coachId}`);
                return { 
                    allowed: false, 
                    reason: 'Subscription plan not found. Please contact support.',
                    currentCount: 0,
                    maxLimit: 0,
                    upgradeRequired: true
                };
            }
            
            // Get maxFunnels from features (it's stored in features.maxFunnels)
            const maxFunnels = features?.maxFunnels !== undefined ? features.maxFunnels : 0;
            
            logger.info(`[SubscriptionLimits] Checking funnel limit for coach ${coachId}: maxFunnels=${maxFunnels}`);
            
            if (maxFunnels === -1) {
                // Unlimited
                const currentFunnelCount = await Funnel.countDocuments({ coachId });
                logger.info(`[SubscriptionLimits] Unlimited funnels allowed. Current count: ${currentFunnelCount}`);
                return { allowed: true, currentCount: currentFunnelCount, maxLimit: -1 };
            }
            
            const currentFunnelCount = await Funnel.countDocuments({ coachId });
            logger.info(`[SubscriptionLimits] Current funnels: ${currentFunnelCount}, Max allowed: ${maxFunnels}`);
            
            if (currentFunnelCount >= maxFunnels) {
                logger.warn(`[SubscriptionLimits] Funnel limit reached for coach ${coachId}: ${currentFunnelCount}/${maxFunnels}`);
                return {
                    allowed: false,
                    reason: `Funnel limit reached. You have ${currentFunnelCount} of ${maxFunnels} funnels. Upgrade your plan to create more funnels.`,
                    currentCount: currentFunnelCount,
                    maxLimit: maxFunnels,
                    upgradeRequired: true
                };
            }
            
            logger.info(`[SubscriptionLimits] Funnel creation allowed. Current: ${currentFunnelCount}, Max: ${maxFunnels}`);
            return { allowed: true, currentCount: currentFunnelCount, maxLimit: maxFunnels };
        } catch (error) {
            logger.error('[SubscriptionLimits] Error checking funnel limit:', error);
            return { 
                allowed: false, 
                reason: 'Error checking subscription limits. Please try again or contact support.',
                currentCount: 0,
                maxLimit: 0,
                upgradeRequired: false
            };
        }
    }
    
    /**
     * Check staff limit
     */
    static async checkStaffLimit(coachId) {
        try {
            const subscriptionData = await this.getCoachSubscription(coachId);
            if (!subscriptionData) {
                logger.warn(`[SubscriptionLimits] No active subscription found for coach: ${coachId}`);
                return { 
                    allowed: false, 
                    reason: 'No active subscription found. Please subscribe to a plan to add staff.',
                    currentCount: 0,
                    maxLimit: 0,
                    upgradeRequired: true
                };
            }
            
            const { features, plan } = subscriptionData;
            
            if (!plan) {
                logger.warn(`[SubscriptionLimits] Subscription found but plan is missing for coach: ${coachId}`);
                return { 
                    allowed: false, 
                    reason: 'Subscription plan not found. Please contact support.',
                    currentCount: 0,
                    maxLimit: 0,
                    upgradeRequired: true
                };
            }
            
            const maxStaff = features?.maxStaff !== undefined ? features.maxStaff : 0;
            
            logger.info(`[SubscriptionLimits] Checking staff limit for coach ${coachId}: maxStaff=${maxStaff}`);
            
            if (maxStaff === -1) {
                const currentStaffCount = await Staff.countDocuments({ coachId, isActive: true });
                logger.info(`[SubscriptionLimits] Unlimited staff allowed. Current count: ${currentStaffCount}`);
                return { allowed: true, currentCount: currentStaffCount, maxLimit: -1 };
            }
            
            const currentStaffCount = await Staff.countDocuments({ coachId, isActive: true });
            logger.info(`[SubscriptionLimits] Current staff: ${currentStaffCount}, Max allowed: ${maxStaff}`);
            
            if (currentStaffCount >= maxStaff) {
                logger.warn(`[SubscriptionLimits] Staff limit reached for coach ${coachId}: ${currentStaffCount}/${maxStaff}`);
                return {
                    allowed: false,
                    reason: `Staff limit reached. You have ${currentStaffCount} of ${maxStaff} staff members. Upgrade your plan to add more staff.`,
                    currentCount: currentStaffCount,
                    maxLimit: maxStaff,
                    upgradeRequired: true
                };
            }
            
            logger.info(`[SubscriptionLimits] Staff creation allowed. Current: ${currentStaffCount}, Max: ${maxStaff}`);
            return { allowed: true, currentCount: currentStaffCount, maxLimit: maxStaff };
        } catch (error) {
            logger.error('[SubscriptionLimits] Error checking staff limit:', error);
            return { 
                allowed: false, 
                reason: 'Error checking subscription limits. Please try again or contact support.',
                currentCount: 0,
                maxLimit: 0,
                upgradeRequired: false
            };
        }
    }
    
    /**
     * Check campaign limit
     */
    static async checkCampaignLimit(coachId) {
        try {
            const subscriptionData = await this.getCoachSubscription(coachId);
            if (!subscriptionData) {
                logger.warn(`[SubscriptionLimits] No active subscription found for coach: ${coachId}`);
                return { 
                    allowed: false, 
                    reason: 'No active subscription found. Please subscribe to a plan to create campaigns.',
                    currentCount: 0,
                    maxLimit: 0,
                    upgradeRequired: true
                };
            }
            
            const { limits, plan } = subscriptionData;
            
            if (!plan) {
                logger.warn(`[SubscriptionLimits] Subscription found but plan is missing for coach: ${coachId}`);
                return { 
                    allowed: false, 
                    reason: 'Subscription plan not found. Please contact support.',
                    currentCount: 0,
                    maxLimit: 0,
                    upgradeRequired: true
                };
            }
            
            const maxCampaigns = limits?.maxCampaigns !== undefined ? limits.maxCampaigns : 0;
            
            logger.info(`[SubscriptionLimits] Checking campaign limit for coach ${coachId}: maxCampaigns=${maxCampaigns}`);
            
            if (maxCampaigns === -1) {
                const currentCampaignCount = await AdCampaign.countDocuments({ coachId });
                logger.info(`[SubscriptionLimits] Unlimited campaigns allowed. Current count: ${currentCampaignCount}`);
                return { allowed: true, currentCount: currentCampaignCount, maxLimit: -1 };
            }
            
            const currentCampaignCount = await AdCampaign.countDocuments({ coachId });
            logger.info(`[SubscriptionLimits] Current campaigns: ${currentCampaignCount}, Max allowed: ${maxCampaigns}`);
            
            if (currentCampaignCount >= maxCampaigns) {
                logger.warn(`[SubscriptionLimits] Campaign limit reached for coach ${coachId}: ${currentCampaignCount}/${maxCampaigns}`);
                return {
                    allowed: false,
                    reason: `Campaign limit reached. You have ${currentCampaignCount} of ${maxCampaigns} campaigns. Upgrade your plan to create more campaigns.`,
                    currentCount: currentCampaignCount,
                    maxLimit: maxCampaigns,
                    upgradeRequired: true
                };
            }
            
            logger.info(`[SubscriptionLimits] Campaign creation allowed. Current: ${currentCampaignCount}, Max: ${maxCampaigns}`);
            return { allowed: true, currentCount: currentCampaignCount, maxLimit: maxCampaigns };
        } catch (error) {
            logger.error('[SubscriptionLimits] Error checking campaign limit:', error);
            return { 
                allowed: false, 
                reason: 'Error checking subscription limits. Please try again or contact support.',
                currentCount: 0,
                maxLimit: 0,
                upgradeRequired: false
            };
        }
    }
    
    /**
     * Check lead limit
     */
    static async checkLeadLimit(coachId) {
        try {
            const subscriptionData = await this.getCoachSubscription(coachId);
            if (!subscriptionData) {
                logger.warn(`[SubscriptionLimits] No active subscription found for coach: ${coachId}`);
                return { 
                    allowed: false, 
                    reason: 'No active subscription found. Please subscribe to a plan to add leads.',
                    currentCount: 0,
                    maxLimit: 0,
                    upgradeRequired: true
                };
            }
            
            const { limits, plan } = subscriptionData;
            
            if (!plan) {
                logger.warn(`[SubscriptionLimits] Subscription found but plan is missing for coach: ${coachId}`);
                return { 
                    allowed: false, 
                    reason: 'Subscription plan not found. Please contact support.',
                    currentCount: 0,
                    maxLimit: 0,
                    upgradeRequired: true
                };
            }
            
            const maxLeads = limits?.maxLeads !== undefined ? limits.maxLeads : -1;
            
            logger.info(`[SubscriptionLimits] Checking lead limit for coach ${coachId}: maxLeads=${maxLeads}`);
            
            if (maxLeads === -1) {
                const currentLeadCount = await Lead.countDocuments({ coachId });
                logger.info(`[SubscriptionLimits] Unlimited leads allowed. Current count: ${currentLeadCount}`);
                return { allowed: true, currentCount: currentLeadCount, maxLimit: -1 };
            }
            
            const currentLeadCount = await Lead.countDocuments({ coachId });
            logger.info(`[SubscriptionLimits] Current leads: ${currentLeadCount}, Max allowed: ${maxLeads}`);
            
            if (currentLeadCount >= maxLeads) {
                logger.warn(`[SubscriptionLimits] Lead limit reached for coach ${coachId}: ${currentLeadCount}/${maxLeads}`);
                return {
                    allowed: false,
                    reason: `Lead limit reached. You have ${currentLeadCount} of ${maxLeads} leads. Upgrade your plan to add more leads.`,
                    currentCount: currentLeadCount,
                    maxLimit: maxLeads,
                    upgradeRequired: true
                };
            }
            
            logger.info(`[SubscriptionLimits] Lead creation allowed. Current: ${currentLeadCount}, Max: ${maxLeads}`);
            return { allowed: true, currentCount: currentLeadCount, maxLimit: maxLeads };
        } catch (error) {
            logger.error('[SubscriptionLimits] Error checking lead limit:', error);
            return { 
                allowed: false, 
                reason: 'Error checking subscription limits. Please try again or contact support.',
                currentCount: 0,
                maxLimit: 0,
                upgradeRequired: false
            };
        }
    }
    
    /**
     * Check feature access (boolean features)
     */
    static async checkFeatureAccess(coachId, featureName) {
        try {
            const subscriptionData = await this.getCoachSubscription(coachId);
            if (!subscriptionData) {
                return { allowed: false, reason: 'No active subscription' };
            }
            
            const { features } = subscriptionData;
            const hasFeature = features[featureName] || false;
            
            if (!hasFeature) {
                return {
                    allowed: false,
                    reason: `${featureName} not available in current plan`,
                    upgradeRequired: true
                };
            }
            
            return { allowed: true };
        } catch (error) {
            logger.error('[SubscriptionLimits] Error checking feature access:', error);
            return { allowed: false, reason: 'Error checking feature access' };
        }
    }
    
    /**
     * Check appointment limit
     */
    static async checkAppointmentLimit(coachId) {
        try {
            const subscriptionData = await this.getCoachSubscription(coachId);
            if (!subscriptionData) {
                logger.warn(`[SubscriptionLimits] No active subscription found for coach: ${coachId}`);
                return { 
                    allowed: false, 
                    reason: 'No active subscription found. Please subscribe to a plan to create appointments.',
                    currentCount: 0,
                    maxLimit: 0,
                    upgradeRequired: true
                };
            }
            
            const { limits, plan } = subscriptionData;
            
            if (!plan) {
                logger.warn(`[SubscriptionLimits] Subscription found but plan is missing for coach: ${coachId}`);
                return { 
                    allowed: false, 
                    reason: 'Subscription plan not found. Please contact support.',
                    currentCount: 0,
                    maxLimit: 0,
                    upgradeRequired: true
                };
            }
            
            const maxAppointments = limits?.maxAppointments !== undefined ? limits.maxAppointments : -1;
            
            logger.info(`[SubscriptionLimits] Checking appointment limit for coach ${coachId}: maxAppointments=${maxAppointments}`);
            
            if (maxAppointments === -1) {
                const currentAppointmentCount = await Appointment.countDocuments({ coachId });
                logger.info(`[SubscriptionLimits] Unlimited appointments allowed. Current count: ${currentAppointmentCount}`);
                return { allowed: true, currentCount: currentAppointmentCount, maxLimit: -1 };
            }
            
            const currentAppointmentCount = await Appointment.countDocuments({ coachId });
            logger.info(`[SubscriptionLimits] Current appointments: ${currentAppointmentCount}, Max allowed: ${maxAppointments}`);
            
            if (currentAppointmentCount >= maxAppointments) {
                logger.warn(`[SubscriptionLimits] Appointment limit reached for coach ${coachId}: ${currentAppointmentCount}/${maxAppointments}`);
                return {
                    allowed: false,
                    reason: `Appointment limit reached. You have ${currentAppointmentCount} of ${maxAppointments} appointments. Upgrade your plan to create more appointments.`,
                    currentCount: currentAppointmentCount,
                    maxLimit: maxAppointments,
                    upgradeRequired: true
                };
            }
            
            logger.info(`[SubscriptionLimits] Appointment creation allowed. Current: ${currentAppointmentCount}, Max: ${maxAppointments}`);
            return { allowed: true, currentCount: currentAppointmentCount, maxLimit: maxAppointments };
        } catch (error) {
            logger.error('[SubscriptionLimits] Error checking appointment limit:', error);
            return { 
                allowed: false, 
                reason: 'Error checking subscription limits. Please try again or contact support.',
                currentCount: 0,
                maxLimit: 0,
                upgradeRequired: false
            };
        }
    }
    
    /**
     * Check device limit
     */
    static async checkDeviceLimit(coachId) {
        try {
            const subscriptionData = await this.getCoachSubscription(coachId);
            if (!subscriptionData) {
                logger.warn(`[SubscriptionLimits] No active subscription found for coach: ${coachId}`);
                return { 
                    allowed: false, 
                    reason: 'No active subscription found. Please subscribe to a plan to connect devices.',
                    currentCount: 0,
                    maxLimit: 0,
                    upgradeRequired: true
                };
            }
            
            const { features, plan } = subscriptionData;
            
            if (!plan) {
                logger.warn(`[SubscriptionLimits] Subscription found but plan is missing for coach: ${coachId}`);
                return { 
                    allowed: false, 
                    reason: 'Subscription plan not found. Please contact support.',
                    currentCount: 0,
                    maxLimit: 0,
                    upgradeRequired: true
                };
            }
            
            const maxDevices = features?.maxDevices !== undefined ? features.maxDevices : 1;
            
            logger.info(`[SubscriptionLimits] Checking device limit for coach ${coachId}: maxDevices=${maxDevices}`);
            
            if (maxDevices === -1) {
                const currentDeviceCount = await WhatsAppDevice.countDocuments({ coachId, isActive: true });
                logger.info(`[SubscriptionLimits] Unlimited devices allowed. Current count: ${currentDeviceCount}`);
                return { allowed: true, currentCount: currentDeviceCount, maxLimit: -1 };
            }
            
            const currentDeviceCount = await WhatsAppDevice.countDocuments({ coachId, isActive: true });
            logger.info(`[SubscriptionLimits] Current devices: ${currentDeviceCount}, Max allowed: ${maxDevices}`);
            
            if (currentDeviceCount >= maxDevices) {
                logger.warn(`[SubscriptionLimits] Device limit reached for coach ${coachId}: ${currentDeviceCount}/${maxDevices}`);
                return {
                    allowed: false,
                    reason: `Device limit reached. You have ${currentDeviceCount} of ${maxDevices} devices connected. Upgrade your plan to connect more devices.`,
                    currentCount: currentDeviceCount,
                    maxLimit: maxDevices,
                    upgradeRequired: true
                };
            }
            
            logger.info(`[SubscriptionLimits] Device connection allowed. Current: ${currentDeviceCount}, Max: ${maxDevices}`);
            return { allowed: true, currentCount: currentDeviceCount, maxLimit: maxDevices };
        } catch (error) {
            logger.error('[SubscriptionLimits] Error checking device limit:', error);
            return { 
                allowed: false, 
                reason: 'Error checking subscription limits. Please try again or contact support.',
                currentCount: 0,
                maxLimit: 0,
                upgradeRequired: false
            };
        }
    }
    
    /**
     * Check credit limits (email, SMS, etc.)
     * Note: This checks the limit from the plan, but actual credit usage tracking should be implemented separately
     */
    static async checkCreditLimit(coachId, creditType) {
        try {
            const subscriptionData = await this.getCoachSubscription(coachId);
            if (!subscriptionData) {
                logger.warn(`[SubscriptionLimits] No active subscription found for coach: ${coachId}`);
                return { 
                    allowed: false, 
                    reason: `No active subscription found. Please subscribe to a plan to use ${creditType}.`,
                    currentCount: 0,
                    maxLimit: 0,
                    upgradeRequired: true
                };
            }
            
            const { features, plan } = subscriptionData;
            
            if (!plan) {
                logger.warn(`[SubscriptionLimits] Subscription found but plan is missing for coach: ${coachId}`);
                return { 
                    allowed: false, 
                    reason: 'Subscription plan not found. Please contact support.',
                    currentCount: 0,
                    maxLimit: 0,
                    upgradeRequired: true
                };
            }
            
            const maxCredits = features?.[creditType] !== undefined ? features[creditType] : 0;
            
            logger.info(`[SubscriptionLimits] Checking ${creditType} limit for coach ${coachId}: maxCredits=${maxCredits}`);
            
            if (maxCredits === -1) {
                logger.info(`[SubscriptionLimits] Unlimited ${creditType} allowed`);
                return { allowed: true, currentCount: 0, maxLimit: -1 };
            }
            
            // TODO: Implement actual credit usage tracking
            // For now, we return allowed but with a note that tracking needs to be implemented
            // The actual credit deduction should happen in the service layer
            logger.info(`[SubscriptionLimits] ${creditType} usage allowed. Max: ${maxCredits}`);
            return { allowed: true, currentCount: 0, maxLimit: maxCredits };
        } catch (error) {
            logger.error(`[SubscriptionLimits] Error checking ${creditType} limit:`, error);
            return { 
                allowed: false, 
                reason: `Error checking ${creditType} limits. Please try again or contact support.`,
                currentCount: 0,
                maxLimit: 0,
                upgradeRequired: false
            };
        }
    }
    
    /**
     * Check storage limit
     * Note: This checks the limit from the plan, but actual storage usage tracking should be implemented separately
     */
    static async checkStorageLimit(coachId, fileSizeInMB = 0) {
        try {
            const subscriptionData = await this.getCoachSubscription(coachId);
            if (!subscriptionData) {
                logger.warn(`[SubscriptionLimits] No active subscription found for coach: ${coachId}`);
                return { 
                    allowed: false, 
                    reason: 'No active subscription found. Please subscribe to a plan to upload files.',
                    currentCount: 0,
                    maxLimit: 0,
                    upgradeRequired: true
                };
            }
            
            const { features, plan } = subscriptionData;
            
            if (!plan) {
                logger.warn(`[SubscriptionLimits] Subscription found but plan is missing for coach: ${coachId}`);
                return { 
                    allowed: false, 
                    reason: 'Subscription plan not found. Please contact support.',
                    currentCount: 0,
                    maxLimit: 0,
                    upgradeRequired: true
                };
            }
            
            const maxStorageGB = features?.storageGB !== undefined ? features.storageGB : 10;
            
            logger.info(`[SubscriptionLimits] Checking storage limit for coach ${coachId}: maxStorageGB=${maxStorageGB}`);
            
            if (maxStorageGB === -1) {
                logger.info(`[SubscriptionLimits] Unlimited storage allowed`);
                return { allowed: true, currentCount: 0, maxLimit: -1 };
            }
            
            // TODO: Implement actual storage usage tracking
            // For now, we check if the file size would exceed the limit
            const maxStorageMB = maxStorageGB * 1024;
            if (fileSizeInMB > maxStorageMB) {
                logger.warn(`[SubscriptionLimits] File size ${fileSizeInMB}MB exceeds storage limit ${maxStorageMB}MB for coach ${coachId}`);
                return {
                    allowed: false,
                    reason: `File size (${fileSizeInMB}MB) exceeds your storage limit (${maxStorageGB}GB). Upgrade your plan for more storage.`,
                    currentCount: fileSizeInMB,
                    maxLimit: maxStorageMB,
                    upgradeRequired: true
                };
            }
            
            logger.info(`[SubscriptionLimits] Storage usage allowed. Max: ${maxStorageGB}GB`);
            return { allowed: true, currentCount: fileSizeInMB, maxLimit: maxStorageMB };
        } catch (error) {
            logger.error('[SubscriptionLimits] Error checking storage limit:', error);
            return { 
                allowed: false, 
                reason: 'Error checking storage limits. Please try again or contact support.',
                currentCount: 0,
                maxLimit: 0,
                upgradeRequired: false
            };
        }
    }
    
    /**
     * Middleware factory for funnel creation
     */
    static checkFunnelCreation() {
        return async (req, res, next) => {
            try {
                const coachId = req.user._id || req.coachId;
                if (!coachId) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required'
                    });
                }
                
                const limitCheck = await this.checkFunnelLimit(coachId);
                
                if (!limitCheck.allowed) {
                    return res.status(403).json({
                        success: false,
                        message: limitCheck.reason,
                        error: 'FUNNEL_LIMIT_REACHED',
                        currentCount: limitCheck.currentCount,
                        maxLimit: limitCheck.maxLimit,
                        upgradeRequired: limitCheck.upgradeRequired,
                        subscriptionRequired: true
                    });
                }
                
                // Add limit info to request for potential use
                req.subscriptionLimits = {
                    funnels: limitCheck
                };
                
                next();
            } catch (error) {
                logger.error('[SubscriptionLimits] Error in funnel creation check:', error);
                next(error);
            }
        };
    }
    
    /**
     * Middleware factory for staff creation
     */
    static checkStaffCreation() {
        return async (req, res, next) => {
            try {
                const coachId = req.user._id || req.coachId;
                if (!coachId) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required'
                    });
                }
                
                const limitCheck = await this.checkStaffLimit(coachId);
                
                if (!limitCheck.allowed) {
                    return res.status(403).json({
                        success: false,
                        message: limitCheck.reason,
                        error: 'STAFF_LIMIT_REACHED',
                        currentCount: limitCheck.currentCount,
                        maxLimit: limitCheck.maxLimit,
                        upgradeRequired: limitCheck.upgradeRequired,
                        subscriptionRequired: true
                    });
                }
                
                // Add limit info to request for potential use
                req.subscriptionLimits = {
                    staff: limitCheck
                };
                
                next();
            } catch (error) {
                logger.error('[SubscriptionLimits] Error in staff creation check:', error);
                next(error);
            }
        };
    }
    
    /**
     * Middleware factory for lead creation
     */
    static checkLeadCreation() {
        return async (req, res, next) => {
            try {
                const coachId = req.user._id || req.coachId;
                if (!coachId) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required'
                    });
                }
                
                const limitCheck = await this.checkLeadLimit(coachId);
                
                if (!limitCheck.allowed) {
                    return res.status(403).json({
                        success: false,
                        message: limitCheck.reason,
                        error: 'LEAD_LIMIT_REACHED',
                        currentCount: limitCheck.currentCount,
                        maxLimit: limitCheck.maxLimit,
                        upgradeRequired: limitCheck.upgradeRequired,
                        subscriptionRequired: true
                    });
                }
                
                // Add limit info to request for potential use
                req.subscriptionLimits = {
                    leads: limitCheck
                };
                
                next();
            } catch (error) {
                logger.error('[SubscriptionLimits] Error in lead creation check:', error);
                next(error);
            }
        };
    }
    
    /**
     * Middleware factory for feature access
     */
    static checkFeatureAccess(featureName) {
        return async (req, res, next) => {
            try {
                const coachId = req.user._id || req.coachId;
                if (!coachId) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required'
                    });
                }
                
                const accessCheck = await this.checkFeatureAccess(coachId, featureName);
                
                if (!accessCheck.allowed) {
                    return res.status(403).json({
                        success: false,
                        message: accessCheck.reason,
                        error: 'FEATURE_NOT_AVAILABLE',
                        featureName,
                        upgradeRequired: accessCheck.upgradeRequired,
                        subscriptionRequired: true
                    });
                }
                
                next();
            } catch (error) {
                logger.error('[SubscriptionLimits] Error in feature access check:', error);
                next(error);
            }
        };
    }
    
    /**
     * Get coach's subscription limits info
     */
    static async getCoachLimitsInfo(coachId) {
        try {
            const subscriptionData = await this.getCoachSubscription(coachId);
            if (!subscriptionData) {
                return {
                    hasActiveSubscription: false,
                    message: 'No active subscription found'
                };
            }
            
            const { subscription, plan, features, limits } = subscriptionData;
            
            // Get current usage counts
            const [funnelCount, staffCount, leadCount] = await Promise.all([
                Funnel.countDocuments({ coachId }),
                Staff.countDocuments({ coachId, isActive: true }),
                Lead.countDocuments({ coachId })
            ]);
            
            return {
                hasActiveSubscription: true,
                subscription: {
                    status: subscription.status,
                    startDate: subscription.startDate,
                    endDate: subscription.endDate,
                    planName: plan.name
                },
                limits: {
                    funnels: {
                        current: funnelCount,
                        max: features.maxFunnels,
                        unlimited: features.maxFunnels === -1
                    },
                    staff: {
                        current: staffCount,
                        max: features.maxStaff,
                        unlimited: features.maxStaff === -1
                    },
                    leads: {
                        current: leadCount,
                        max: limits.maxLeads,
                        unlimited: limits.maxLeads === -1
                    },
                    devices: {
                        max: features.maxDevices,
                        unlimited: features.maxDevices === -1
                    },
                    automationRules: {
                        max: features.automationRules,
                        unlimited: features.automationRules === -1
                    },
                    emailCredits: {
                        max: features.emailCredits,
                        unlimited: features.emailCredits === -1
                    },
                    smsCredits: {
                        max: features.smsCredits,
                        unlimited: features.smsCredits === -1
                    },
                    storageGB: {
                        max: features.storageGB,
                        unlimited: features.storageGB === -1
                    }
                },
                features: {
                    aiFeatures: features.aiFeatures,
                    advancedAnalytics: features.advancedAnalytics,
                    prioritySupport: features.prioritySupport,
                    customDomain: features.customDomain,
                    apiAccess: features.apiAccess,
                    whiteLabel: features.whiteLabel,
                    customBranding: features.customBranding,
                    advancedReporting: features.advancedReporting,
                    teamCollaboration: features.teamCollaboration,
                    mobileApp: features.mobileApp,
                    webhooks: features.webhooks,
                    sso: features.sso
                }
            };
        } catch (error) {
            logger.error('[SubscriptionLimits] Error getting coach limits info:', error);
            return {
                hasActiveSubscription: false,
                message: 'Error retrieving subscription information'
            };
        }
    }
}

module.exports = SubscriptionLimitsMiddleware;
