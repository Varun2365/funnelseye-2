const mongoose = require('mongoose');
const CoachTransaction = require('../schema/CoachTransaction');
const CoachPayment = require('../schema/CoachPayment');
const GlobalPaymentSettings = require('../schema/GlobalPaymentSettings');
const User = require('../schema/User');
const Razorpay = require('razorpay');
const axios = require('axios');
const logger = require('../utils/logger');

class PayoutController {
    
    constructor() {
        this.razorpay = null;
        // Don't initialize here as it's async and constructor can't be async
        // Will initialize when needed
    }

    /**
     * Helper function to ensure narration is within RazorpayX limits (max 30 characters)
     */
    truncateNarration(narration, maxLength = 30) {
        if (narration.length <= maxLength) {
            return narration;
        }
        return narration.substring(0, maxLength - 3) + '...';
    }

    /**
     * Initialize Razorpay instance
     */
    async initializeRazorpay() {
        try {
            logger.info('[PayoutController] Starting Razorpay initialization...');
            
            const settings = await GlobalPaymentSettings.findOne();
            if (!settings || !settings.razorpay) {
                logger.warn('[PayoutController] Razorpay settings not configured');
                throw new Error('Razorpay settings not found. Please configure Razorpay first.');
            }

            if (!settings.razorpay.keyId || !settings.razorpay.keySecret) {
                logger.warn('[PayoutController] Razorpay keyId or keySecret missing');
                throw new Error('Razorpay keyId and keySecret are required. Please update your Razorpay configuration.');
            }

            if (!settings.razorpay.isActive) {
                logger.warn('[PayoutController] Razorpay is disabled');
                throw new Error('Razorpay is disabled. Please enable it in your configuration.');
            }

            logger.info('[PayoutController] Creating Razorpay instance with credentials...');
            
            // Test Razorpay module first
            if (typeof Razorpay !== 'function') {
                throw new Error('Razorpay module is not properly imported');
            }

            this.razorpay = new Razorpay({
                key_id: settings.razorpay.keyId,
                key_secret: settings.razorpay.keySecret
            });

            // Validate the created instance
            if (!this.razorpay || typeof this.razorpay !== 'object') {
                throw new Error('Failed to create Razorpay instance');
            }

            logger.info('[PayoutController] Razorpay instance created successfully:', {
                hasContacts: typeof this.razorpay.contacts === 'object',
                hasFundAccounts: typeof this.razorpay.fundAccounts === 'object',
                hasPayouts: typeof this.razorpay.payouts === 'object'
            });

            return true;
        } catch (error) {
            logger.error('[PayoutController] Error initializing Razorpay:', error);
            this.razorpay = null;
            throw error;
        }
    }

    /**
     * Setup coach for Razorpay payouts
     * POST /api/paymentsv1/sending/setup-razorpay-coach/:coachId
     */
    async setupRazorpayCoach(req, res) {
        try {
            const { coachId } = req.params;

            // Admin authentication is already verified by verifyAdminToken middleware
            // No additional access control needed since this is admin-only endpoint

            // Check Razorpay configuration first
            const settings = await GlobalPaymentSettings.findOne();
            if (!settings || !settings.razorpay) {
                return res.status(400).json({
                    success: false,
                    message: 'Razorpay not configured. Please configure Razorpay settings first.',
                    hint: 'Use POST /api/paymentsv1/admin/razorpay-config to configure Razorpay'
                });
            }

            if (!settings.razorpay.keyId || !settings.razorpay.keySecret) {
                return res.status(400).json({
                    success: false,
                    message: 'Razorpay credentials missing. Please provide keyId and keySecret.',
                    hint: 'Use POST /api/paymentsv1/admin/razorpay-config to update Razorpay credentials'
                });
            }

            if (!settings.razorpay.isActive) {
                return res.status(400).json({
                    success: false,
                    message: 'Razorpay is disabled. Please enable it in your configuration.',
                    hint: 'Set isActive: true in your Razorpay configuration'
                });
            }

            const result = await this.setupCoachForRazorpayPayouts(coachId);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Coach setup completed for Razorpay payouts',
                    data: result
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.error
                });
            }

        } catch (error) {
            logger.error('[PayoutController] Error setting up Razorpay coach:', error);
            res.status(500).json({
                success: false,
                message: 'Error setting up coach for Razorpay payouts',
                error: error.message
            });
        }
    }

    /**
     * Calculate and track MLM commission for a transaction
     * @param {Object} transactionData - Transaction data
     */
    async calculateAndTrackMlmCommission(transactionData) {
        try {
            const { coachId, grossAmount, transactionType, productInfo } = transactionData;
            
            // Get coach details
            const coach = await User.findById(coachId);
            if (!coach || !coach.sponsorId) {
                logger.info(`[PayoutController] No sponsor found for coach ${coachId}, skipping MLM commission`);
                return;
            }

            // Get MLM commission settings
            const settings = await GlobalPaymentSettings.findOne();
            if (!settings || !settings.commission.mlmLevels.length) {
                logger.warn('[PayoutController] MLM commission settings not configured');
                return;
            }

            const commissionEntries = [];
            let currentCoachId = coach.sponsorId;
            let level = 1;

            // Calculate commissions for up to 12 levels
            while (currentCoachId && level <= 12) {
                const levelConfig = settings.commission.mlmLevels.find(l => l.level === level && l.isActive);
                
                if (levelConfig && levelConfig.percentage > 0) {
                    const commissionAmount = (grossAmount * levelConfig.percentage) / 100;
                    
                    // Create commission transaction
                    const commissionTransaction = new CoachTransaction({
                        coachId: currentCoachId,
                        transactionType: 'mlm_commission',
                        direction: 'incoming',
                        grossAmount: commissionAmount,
                        netAmount: commissionAmount,
                        currency: 'INR',
                        commissionDetails: {
                            level: level,
                            percentage: levelConfig.percentage,
                            baseAmount: grossAmount,
                            sponsorId: coachId
                        },
                        productInfo: productInfo,
                        status: 'completed',
                        transactionDate: new Date(),
                        metadata: {
                            source: 'system',
                            mlmLevel: level,
                            sourceCoachId: coachId,
                            transactionType: transactionType
                        }
                    });

                    await commissionTransaction.save();
                    
                    commissionEntries.push({
                        coachId: currentCoachId,
                        level: level,
                        commissionAmount: commissionAmount,
                        transactionId: commissionTransaction.transactionId
                    });

                    logger.info(`[PayoutController] MLM commission created for coach ${currentCoachId}`, {
                        level: level,
                        amount: commissionAmount,
                        percentage: levelConfig.percentage,
                        sourceCoach: coachId
                    });
                }

                // Move to next level
                const parentCoach = await User.findById(currentCoachId);
                currentCoachId = parentCoach?.sponsorId;
                level++;
            }

            return commissionEntries;
        } catch (error) {
            logger.error('[PayoutController] Error calculating MLM commission:', error);
            throw error;
        }
    }

    /**
     * Get coach's accumulated MLM commissions for a period
     * @param {String} coachId - Coach ID
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     */
    async getCoachMlmCommissions(coachId, startDate, endDate) {
        try {
            const commissions = await CoachTransaction.aggregate([
                {
                    $match: {
                        coachId: new mongoose.Types.ObjectId(coachId),
                        transactionType: 'mlm_commission',
                        direction: 'incoming',
                        status: 'completed',
                        transactionDate: {
                            $gte: startDate,
                            $lte: endDate
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalCommissions: { $sum: '$netAmount' },
                        commissionCount: { $sum: 1 },
                        levelBreakdown: {
                            $push: {
                                level: '$commissionDetails.level',
                                amount: '$netAmount',
                                percentage: '$commissionDetails.percentage'
                            }
                        }
                    }
                }
            ]);

            return commissions[0] || {
                totalCommissions: 0,
                commissionCount: 0,
                levelBreakdown: []
            };
        } catch (error) {
            logger.error('[PayoutController] Error getting coach MLM commissions:', error);
            throw error;
        }
    }

    /**
     * Process monthly MLM commission payouts
     * POST /api/paymentsv1/sending/monthly-mlm-commission-payouts
     */
    async processMonthlyMlmCommissionPayouts(req, res) {
        try {
            // Debug: Check if req.admin exists
            if (!req.admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Admin authentication required - req.admin is undefined'
                });
            }

            const { period, dryRun = false } = req.body;
            
            if (!period) {
                return res.status(400).json({
                    success: false,
                    message: 'Period is required (e.g., "2024-01")'
                });
            }

            logger.info(`[PayoutController] Processing monthly MLM commission payouts for period ${period}`, {
                adminId: req.admin._id,
                dryRun: dryRun
            });

            // Get all active coaches
            const coaches = await User.find({ 
                role: 'coach', 
                isActive: true,
                'razorpayDetails.isActive': true,
                'paymentCollection.isPaymentCollectionEnabled': true
            });

            const payoutResults = [];
            const startDate = this.getPeriodStartDate(period);
            const endDate = this.getPeriodEndDate(period);

            for (const coach of coaches) {
                try {
                    // Get coach's MLM commissions for the period
                    const commissions = await this.getCoachMlmCommissions(coach._id, startDate, endDate);
                    
                    if (commissions.totalCommissions >= 100) { // Minimum ₹1 for Razorpay
                        if (dryRun) {
                            payoutResults.push({
                                coachId: coach._id,
                                coachName: coach.name,
                                coachEmail: coach.email,
                                commissionAmount: commissions.totalCommissions,
                                commissionCount: commissions.commissionCount,
                                wouldPayout: true
                            });
                        } else {
                            // Process actual payout
                            const payoutData = {
                                coachId: coach._id,
                                amount: commissions.totalCommissions,
                                fundAccountId: coach.razorpayDetails.fundAccountId,
                                narration: this.truncateNarration(`MLM Commissions - ${period} - FE`)
                            };

                            const payoutResult = await this.processRazorpayPayoutWithGateway(payoutData);

                            if (payoutResult.success) {
                                // Create payout transaction record
                                const payoutTransaction = new CoachTransaction({
                                    coachId: coach._id,
                                    transactionType: 'payout_completed',
                                    direction: 'outgoing',
                                    grossAmount: commissions.totalCommissions,
                                    netAmount: commissions.totalCommissions,
                                    currency: 'INR',
                                    payoutInfo: {
                                        payoutId: payoutResult.payoutId,
                                        payoutMethod: coach.paymentCollection.paymentCollectionMethod,
                                        destination: coach.paymentCollection,
                                        isInstant: coach.paymentCollection.paymentCollectionMethod === 'upi',
                                        initiatedAt: new Date(),
                                        completedAt: new Date()
                                    },
                                    status: 'completed',
                                    metadata: {
                                        source: 'system',
                                        period: period,
                                        commissionAmount: commissions.totalCommissions,
                                        commissionCount: commissions.commissionCount
                                    }
                                });

                                await payoutTransaction.save();
                            }

                            payoutResults.push({
                                coachId: coach._id,
                                coachName: coach.name,
                                coachEmail: coach.email,
                                commissionAmount: commissions.totalCommissions,
                                commissionCount: commissions.commissionCount,
                                payoutResult: payoutResult
                            });
                        }
                    } else {
                        payoutResults.push({
                            coachId: coach._id,
                            coachName: coach.name,
                            coachEmail: coach.email,
                            commissionAmount: commissions.totalCommissions,
                            commissionCount: commissions.commissionCount,
                            wouldPayout: false,
                            reason: 'Below minimum payout threshold'
                        });
                    }
                } catch (error) {
                    logger.error(`[PayoutController] Error processing MLM payout for coach ${coach._id}:`, error);
                    payoutResults.push({
                        coachId: coach._id,
                        coachName: coach.name,
                        coachEmail: coach.email,
                        error: error.message
                    });
                }
            }

            const summary = {
                totalCoaches: coaches.length,
                processedPayouts: payoutResults.filter(r => r.payoutResult?.success || r.wouldPayout).length,
                totalAmount: payoutResults.reduce((sum, r) => sum + (r.commissionAmount || 0), 0),
                failedPayouts: payoutResults.filter(r => r.error).length
            };

            res.status(200).json({
                success: true,
                message: dryRun ? 'MLM commission payout simulation completed' : 'Monthly MLM commission payouts processed',
                data: {
                    period: period,
                    summary: summary,
                    results: payoutResults
                }
            });

        } catch (error) {
            logger.error('[PayoutController] Error processing monthly MLM commission payouts:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing monthly MLM commission payouts',
                error: error.message
            });
        }
    }

    /**
     * Update MLM commission settings
     * POST /api/paymentsv1/admin/update-mlm-commission-settings
     */
    async updateMlmCommissionSettings(req, res) {
        try {
            // Debug: Check if req.admin exists
            if (!req.admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Admin authentication required - req.admin is undefined'
                });
            }

            const { mlmLevels, minimumPayoutAmount } = req.body;

            if (!mlmLevels || !Array.isArray(mlmLevels)) {
                return res.status(400).json({
                    success: false,
                    message: 'MLM levels configuration is required'
                });
            }

            // Validate MLM levels
            for (const level of mlmLevels) {
                if (!level.level || !level.percentage || level.percentage < 0 || level.percentage > 100) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid MLM level configuration: Level ${level.level} must have percentage between 0-100`
                    });
                }
            }

            logger.info('[PayoutController] Updating MLM commission settings', {
                adminId: req.admin._id,
                levelsCount: mlmLevels.length,
                minimumPayoutAmount: minimumPayoutAmount
            });

            // Get or create global payment settings
            let settings = await GlobalPaymentSettings.findOne();
            if (!settings) {
                settings = new GlobalPaymentSettings();
            }

            // Update commission settings
            settings.commission.mlmLevels = mlmLevels.map(level => ({
                level: level.level,
                percentage: level.percentage,
                isActive: level.isActive !== false // Default to true
            }));

            if (minimumPayoutAmount !== undefined) {
                settings.commission.minimumPayoutAmount = minimumPayoutAmount;
            }

            await settings.save();

            res.status(200).json({
                success: true,
                message: 'MLM commission settings updated successfully',
                data: {
                    mlmLevels: settings.commission.mlmLevels,
                    minimumPayoutAmount: settings.commission.minimumPayoutAmount,
                    updatedBy: req.admin._id,
                    updatedAt: new Date()
                }
            });

        } catch (error) {
            logger.error('[PayoutController] Error updating MLM commission settings:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating MLM commission settings',
                error: error.message
            });
        }
    }

    /**
     * Get current MLM commission settings
     * GET /api/paymentsv1/admin/mlm-commission-settings
     */
    async getMlmCommissionSettings(req, res) {
        try {
            // Debug: Check if req.admin exists
            if (!req.admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Admin authentication required - req.admin is undefined'
                });
            }

            const settings = await GlobalPaymentSettings.findOne();
            if (!settings) {
                return res.status(404).json({
                    success: false,
                    message: 'MLM commission settings not configured'
                });
            }

            res.status(200).json({
                success: true,
                message: 'MLM commission settings retrieved successfully',
                data: {
                    mlmLevels: settings.commission.mlmLevels,
                    minimumPayoutAmount: settings.commission.minimumPayoutAmount,
                    directCommission: settings.commission.directCommission
                }
            });

        } catch (error) {
            logger.error('[PayoutController] Error getting MLM commission settings:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting MLM commission settings',
                error: error.message
            });
        }
    }

    /**
     * Get MLM commission summary for a coach
     * GET /api/paymentsv1/sending/mlm-commission-summary/:coachId
     */
    async getMlmCommissionSummary(req, res) {
        try {
            const { coachId } = req.params;
            const { period } = req.query;

            if (!coachId) {
                return res.status(400).json({
                    success: false,
                    message: 'Coach ID is required'
                });
            }

            const coach = await User.findById(coachId);
            if (!coach) {
                return res.status(404).json({
                    success: false,
                    message: 'Coach not found'
                });
            }

            let startDate, endDate;
            if (period) {
                startDate = this.getPeriodStartDate(period);
                endDate = this.getPeriodEndDate(period);
            } else {
                // Default to current month
                const now = new Date();
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            }

            const commissions = await this.getCoachMlmCommissions(coachId, startDate, endDate);

            res.status(200).json({
                success: true,
                message: 'MLM commission summary retrieved successfully',
                data: {
                    coachId: coachId,
                    coachName: coach.name,
                    coachEmail: coach.email,
                    period: period || 'current_month',
                    startDate: startDate,
                    endDate: endDate,
                    commissions: commissions
                }
            });

        } catch (error) {
            logger.error('[PayoutController] Error getting MLM commission summary:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting MLM commission summary',
                error: error.message
            });
        }
    }

    /**
     * Process Razorpay payout
     * POST /api/paymentsv1/sending/razorpay-payout
     */
    async processRazorpayPayout(req, res) {
        try {
            // Debug: Check if req.admin exists (admin routes use req.admin, not req.user)
            if (!req.admin) {
                logger.error('[PayoutController] req.admin is undefined in processRazorpayPayout', {
                    headers: req.headers,
                    body: req.body
                });
                return res.status(401).json({
                    success: false,
                    message: 'Admin authentication required - req.admin is undefined'
                });
            }

            logger.info('[PayoutController] Processing Razorpay payout', {
                adminId: req.admin._id,
                adminRole: req.admin.role,
                coachId: req.body.coachId,
                amount: req.body.amount
            });

            const {
                coachId,
                amount,
                currency = 'INR',
                purpose = 'payout',
                mode = 'IMPS',
                narration
            } = req.body;

            // Validate required fields
            if (!coachId || !amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Coach ID and amount are required'
                });
            }

            // Get coach details
            const coach = await User.findById(coachId);
            if (!coach) {
                return res.status(404).json({
                    success: false,
                    message: 'Coach not found'
                });
            }

            if (!coach.razorpayDetails || !coach.razorpayDetails.isActive) {
                return res.status(400).json({
                    success: false,
                    message: 'Coach not setup for Razorpay payouts'
                });
            }

            // Process payout
            const payoutData = {
                coachId,
                amount,
                currency,
                fundAccountId: coach.razorpayDetails.fundAccountId,
                purpose,
                mode,
                narration: this.truncateNarration(narration || `Manual payout - ${coach.name} - FE`)
            };

            const result = await this.processRazorpayPayoutWithGateway(payoutData);

            if (result.success) {
                // Create transaction record
                const payoutTransaction = new CoachTransaction({
                    transactionId: result.payoutId,
                    coachId: coachId,
                    transactionType: 'payout_processing',
                    direction: 'outgoing',
                    grossAmount: amount,
                    netAmount: amount,
                    currency: currency,
                    payoutInfo: {
                        payoutId: result.payoutId,
                        payoutMethod: coach.paymentCollection.paymentCollectionMethod,
                        destination: coach.paymentCollection,
                        isInstant: mode === 'UPI',
                        initiatedAt: new Date()
                    },
                    status: 'processing',
                    metadata: {
                        source: 'admin',
                        initiatedBy: req.admin._id,
                        purpose: purpose,
                        mode: mode
                    }
                });

                await payoutTransaction.save();

                res.status(200).json({
                    success: true,
                    message: 'Razorpay payout initiated successfully',
                    data: {
                        payoutId: result.payoutId,
                        amount: result.amount,
                        currency: result.currency,
                        status: result.status,
                        transactionId: payoutTransaction.transactionId
                    }
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.error
                });
            }

        } catch (error) {
            logger.error('[PayoutController] Error processing Razorpay payout:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing Razorpay payout',
                error: error.message
            });
        }
    }

    /**
     * Process automatic payouts for coaches
     * POST /api/payments/sending/automatic-payouts
     */
    async processAutomaticPayouts(req, res) {
        try {
            logger.info('[PayoutController] Processing automatic payouts');
            
            const { payoutType = 'commission', period = 'current' } = req.body;
            
            const settings = await GlobalPaymentSettings.findOne();
            if (!settings) {
                return res.status(500).json({
                    success: false,
                    message: 'Payment settings not configured'
                });
            }
            
            if (!settings.payout.monthlyPayout.isEnabled) {
                return res.status(400).json({
                    success: false,
                    message: 'Automatic payouts are disabled'
                });
            }
            
            let payoutResults = [];
            
            switch (payoutType) {
                case 'commission':
                    payoutResults = await this.processCommissionPayouts(settings, period);
                    break;
                case 'revenue':
                    payoutResults = await this.processRevenuePayouts(settings, period);
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid payout type'
                    });
            }
            
            res.json({
                success: true,
                message: 'Automatic payouts processed successfully',
                data: {
                    payoutType,
                    period,
                    totalProcessed: payoutResults.length,
                    totalAmount: payoutResults.reduce((sum, result) => sum + (result.amount || 0), 0),
                    results: payoutResults
                }
            });
            
        } catch (error) {
            logger.error('[PayoutController] Error processing automatic payouts:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing automatic payouts',
                error: error.message
            });
        }
    }
    
    /**
     * Process commission payouts
     */
    async processCommissionPayouts(settings, period) {
        try {
            const payoutResults = [];
            
            // Get coaches with pending commissions
            const coaches = await User.find({ 
                role: 'coach',
                'paymentCollection.isPaymentCollectionEnabled': true 
            });
            
            for (const coach of coaches) {
                try {
                    // Get coach's earnings summary
                    const earnings = await CoachTransaction.getCoachEarningsSummary(
                        coach._id,
                        this.getPeriodStartDate(period),
                        this.getPeriodEndDate(period)
                    );
                    
                    // Get coach's payout summary
                    const payouts = await CoachTransaction.getCoachPayoutSummary(
                        coach._id,
                        this.getPeriodStartDate(period),
                        this.getPeriodEndDate(period)
                    );
                    
                    // Calculate available balance
                    const availableBalance = earnings.totalEarnings - payouts.totalPayouts;
                    
                    if (availableBalance >= settings.commission.minimumPayoutAmount) {
                        // Process payout
                        const payoutResult = await this.processSinglePayout({
                            coachId: coach._id,
                            amount: availableBalance,
                            currency: 'INR',
                            payoutType: 'commission',
                            payoutMethod: coach.paymentCollection.paymentCollectionMethod,
                            destination: coach.paymentCollection,
                            metadata: {
                                period,
                                source: 'system',
                                earnings: earnings.totalEarnings,
                                previousPayouts: payouts.totalPayouts
                            }
                        });
                        
                        payoutResults.push(payoutResult);
                    }
                    
                } catch (error) {
                    logger.error(`[PayoutController] Error processing payout for coach ${coach._id}:`, error);
                    payoutResults.push({
                        coachId: coach._id,
                        success: false,
                        message: error.message
                    });
                }
            }
            
            return payoutResults;
            
        } catch (error) {
            logger.error('[PayoutController] Error processing commission payouts:', error);
            throw error;
        }
    }
    
    /**
     * Process revenue payouts
     */
    async processRevenuePayouts(settings, period) {
        try {
            // Similar to commission payouts but for direct revenue
            const payoutResults = [];
            
            const coaches = await User.find({ 
                role: 'coach',
                'paymentCollection.isPaymentCollectionEnabled': true 
            });
            
            for (const coach of coaches) {
                try {
                    // Get direct sales earnings
                    const directSales = await CoachTransaction.aggregate([
                        {
                            $match: {
                                coachId: coach._id,
                                direction: 'incoming',
                                status: 'completed',
                                transactionType: 'direct_sale',
                                transactionDate: {
                                    $gte: this.getPeriodStartDate(period),
                                    $lte: this.getPeriodEndDate(period)
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalAmount: { $sum: '$netAmount' },
                                count: { $sum: 1 }
                            }
                        }
                    ]);
                    
                    const totalDirectSales = directSales[0]?.totalAmount || 0;
                    
                    if (totalDirectSales >= settings.commission.minimumPayoutAmount) {
                        const payoutResult = await this.processSinglePayout({
                            coachId: coach._id,
                            amount: totalDirectSales,
                            currency: 'INR',
                            payoutType: 'revenue',
                            payoutMethod: coach.paymentCollection.paymentCollectionMethod,
                            destination: coach.paymentCollection,
                            metadata: {
                                period,
                                source: 'system',
                                directSales: totalDirectSales
                            }
                        });
                        
                        payoutResults.push(payoutResult);
                    }
                    
                } catch (error) {
                    logger.error(`[PayoutController] Error processing revenue payout for coach ${coach._id}:`, error);
                    payoutResults.push({
                        coachId: coach._id,
                        success: false,
                        message: error.message
                    });
                }
            }
            
            return payoutResults;
            
        } catch (error) {
            logger.error('[PayoutController] Error processing revenue payouts:', error);
            throw error;
        }
    }
    
    /**
     * Process a single payout to a coach
     */
    async processSinglePayout(payoutData) {
        try {
            const {
                coachId,
                amount,
                currency,
                payoutType,
                payoutMethod,
                destination,
                metadata = {}
            } = payoutData;
            
            const coach = await User.findById(coachId);
            if (!coach) {
                return {
                    success: false,
                    message: 'Coach not found'
                };
            }
            
            if (!coach.paymentCollection || !coach.paymentCollection.isPaymentCollectionEnabled) {
                return {
                    success: false,
                    message: 'Coach has no payout method configured'
                };
            }
            
            const payoutId = `PAYOUT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Get payment settings
            const settings = await GlobalPaymentSettings.findOne();
            const payoutFee = settings?.payout?.instantPayout?.fee || 0;
            const netAmount = amount - payoutFee;
            
            // Create payout transaction
            const payoutTransaction = new CoachTransaction({
                transactionId: payoutId,
                coachId: coachId,
                transactionType: 'payout_processing',
                direction: 'outgoing',
                grossAmount: amount,
                netAmount: netAmount,
                currency: currency,
                fees: {
                    payoutFee: payoutFee,
                    totalFees: payoutFee
                },
                payoutInfo: {
                    payoutId: payoutId,
                    payoutMethod: payoutMethod,
                    destination: destination,
                    isInstant: payoutMethod === 'upi',
                    initiatedAt: new Date()
                },
                status: 'processing',
                metadata: {
                    ...metadata,
                    source: 'system',
                    payoutType: payoutType
                }
            });
            
            await payoutTransaction.save();
            
            // Process payout with gateway (simplified for now)
            const payoutResult = await this.processPayoutWithGateway(payoutTransaction);
            
            if (payoutResult.success) {
                payoutTransaction.status = 'completed';
                payoutTransaction.completedAt = new Date();
                payoutTransaction.payoutInfo.completedAt = new Date();
                payoutTransaction.payoutInfo.processingTime = Date.now() - payoutTransaction.payoutInfo.initiatedAt.getTime();
                
                await payoutTransaction.save();
                
                // Create payout received transaction
                const receivedTransaction = new CoachTransaction({
                    transactionId: `RECEIVED_${payoutId}`,
                    coachId: coachId,
                    transactionType: 'payout_received',
                    direction: 'incoming',
                    grossAmount: netAmount,
                    netAmount: netAmount,
                    currency: currency,
                    payoutInfo: {
                        payoutId: payoutId,
                        payoutMethod: payoutMethod,
                        destination: destination,
                        completedAt: new Date()
                    },
                    status: 'completed',
                    metadata: {
                        source: 'system',
                        originalPayoutId: payoutId
                    }
                });
                
                await receivedTransaction.save();
                
                return {
                    success: true,
                    payoutId: payoutId,
                    amount: netAmount,
                    currency: currency,
                    coachId: coachId,
                    message: 'Payout processed successfully'
                };
            } else {
                payoutTransaction.status = 'failed';
                payoutTransaction.failedAt = new Date();
                payoutTransaction.payoutInfo.failureReason = payoutResult.message;
                
                await payoutTransaction.save();
                
                return {
                    success: false,
                    payoutId: payoutId,
                    message: payoutResult.message
                };
            }
            
        } catch (error) {
            logger.error('[PayoutController] Error processing single payout:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }
    
    /**
     * Process payout with payment gateway
     */
    async processPayoutWithGateway(payoutTransaction) {
        try {
            // This is a simplified implementation
            // In a real scenario, you would integrate with actual payment gateways
            
            const { payoutMethod, destination } = payoutTransaction.payoutInfo;
            
            switch (payoutMethod) {
                case 'upi':
                    return await this.processUPIPayout(destination.upiId, payoutTransaction.netAmount);
                    
                case 'bank_transfer':
                    return await this.processBankTransferPayout(destination.bankAccount, payoutTransaction.netAmount);
                    
                default:
                    return {
                        success: false,
                        message: 'Unsupported payout method'
                    };
            }
            
        } catch (error) {
            logger.error('[PayoutController] Error processing payout with gateway:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }
    
    /**
     * Process UPI payout
     */
    async processUPIPayout(upiId, amount) {
        try {
            // Simulate UPI payout processing
            // In real implementation, integrate with UPI gateway
            
            logger.info(`[PayoutController] Processing UPI payout: ${upiId}, Amount: ${amount}`);
            
            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            return {
                success: true,
                message: 'UPI payout processed successfully',
                transactionId: `UPI_${Date.now()}`
            };
            
        } catch (error) {
            logger.error('[PayoutController] Error processing UPI payout:', error);
            return {
                success: false,
                message: 'UPI payout failed'
            };
        }
    }
    
    /**
     * Process bank transfer payout
     */
    async processBankTransferPayout(bankAccount, amount) {
        try {
            // Simulate bank transfer processing
            // In real implementation, integrate with bank API
            
            logger.info(`[PayoutController] Processing bank transfer: ${bankAccount.accountNumber}, Amount: ${amount}`);
            
            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            return {
                success: true,
                message: 'Bank transfer processed successfully',
                transactionId: `BANK_${Date.now()}`
            };
            
        } catch (error) {
            logger.error('[PayoutController] Error processing bank transfer:', error);
            return {
                success: false,
                message: 'Bank transfer failed'
            };
        }
    }
    
    /**
     * Get period start date
     */
    getPeriodStartDate(period) {
        const now = new Date();
        
        switch (period) {
            case 'current':
                return new Date(now.getFullYear(), now.getMonth(), 1);
            case 'previous':
                return new Date(now.getFullYear(), now.getMonth() - 1, 1);
            case 'last30days':
                return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            case 'last90days':
                return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            default:
                return new Date(now.getFullYear(), now.getMonth(), 1);
        }
    }
    
    /**
     * Get period end date
     */
    getPeriodEndDate(period) {
        const now = new Date();
        
        switch (period) {
            case 'current':
                return new Date(now.getFullYear(), now.getMonth() + 1, 0);
            case 'previous':
                return new Date(now.getFullYear(), now.getMonth(), 0);
            case 'last30days':
            case 'last90days':
                return now;
            default:
                return new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }
    }

    /**
     * Setup coach for Razorpay payouts (create contact and fund account)
     */
    async setupCoachForRazorpayPayouts(coachId) {
        try {
            // Get Razorpay settings
            const settings = await GlobalPaymentSettings.findOne();
            if (!settings || !settings.razorpay) {
                throw new Error('Razorpay settings not found. Please configure Razorpay first.');
            }

            if (!settings.razorpay.keyId || !settings.razorpay.keySecret) {
                throw new Error('Razorpay keyId and keySecret are required.');
            }

            if (!settings.razorpay.isActive) {
                throw new Error('Razorpay is disabled. Please enable it in your configuration.');
            }

            logger.info('[PayoutController] Setting up coach for RazorpayX payouts using REST API...');

            const coach = await User.findById(coachId);
            if (!coach) {
                return {
                    success: false,
                    error: 'Coach not found'
                };
            }

            if (!coach.paymentCollection || !coach.paymentCollection.isPaymentCollectionEnabled) {
                return {
                    success: false,
                    error: 'Coach payment collection not configured'
                };
            }

            // Validate payment collection data based on method
            if (coach.paymentCollection.paymentCollectionMethod === 'upi' && !coach.paymentCollection.upiId) {
                return {
                    success: false,
                    error: 'Coach UPI ID not configured'
                };
            }

            if (coach.paymentCollection.paymentCollectionMethod === 'bank_transfer' && !coach.paymentCollection.bankAccount) {
                return {
                    success: false,
                    error: 'Coach bank account not configured'
                };
            }

            // Create contact using RazorpayX REST API
            const contactData = {
                name: coach.name,
                email: coach.email,
                contact: coach.phone,
                type: 'vendor',
                reference_id: `coach_${coach._id}`,
                notes: {
                    coach_id: coach._id.toString(),
                    role: 'coach',
                    platform: 'funnelseye'
                }
            };

            let contact;
            try {
                logger.info('[PayoutController] Creating RazorpayX contact via REST API...');
                
                const contactResponse = await axios.post('https://api.razorpay.com/v1/contacts', contactData, {
                    auth: {
                        username: settings.razorpay.keyId,
                        password: settings.razorpay.keySecret
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                contact = contactResponse.data;
                logger.info('[PayoutController] Contact created successfully:', {
                    contact_id: contact.id,
                    contact_name: contact.name,
                    contact_email: contact.email,
                    contact_type: contact.type
                });

                // Validate contact was created successfully
                if (!contact || !contact.id) {
                    throw new Error('Contact creation failed - no contact ID returned');
                }
            } catch (contactError) {
                logger.error('[PayoutController] Error creating contact:', contactError.response?.data || contactError.message);
                throw new Error(`Failed to create RazorpayX contact: ${contactError.response?.data?.error?.description || contactError.message}`);
            }
            
            // Create fund account using RazorpayX REST API
            const fundAccountData = {
                contact_id: contact.id,
                account_type: coach.paymentCollection.paymentCollectionMethod === 'upi' ? 'vpa' : 'bank_account',
                ...(coach.paymentCollection.paymentCollectionMethod === 'upi' ? {
                    vpa: {
                        address: coach.paymentCollection.upiId
                    }
                } : {
                    bank_account: {
                        name: coach.paymentCollection.bankAccount.accountHolderName,
                        ifsc: coach.paymentCollection.bankAccount.ifscCode,
                        account_number: coach.paymentCollection.bankAccount.accountNumber
                    }
                })
            };

            let fundAccount;
            try {
                logger.info('[PayoutController] Creating RazorpayX fund account via REST API...', {
                    contact_id: contact.id,
                    account_type: fundAccountData.account_type,
                    has_vpa: !!fundAccountData.vpa,
                    has_bank_account: !!fundAccountData.bank_account,
                    fund_account_data: fundAccountData
                });
                
                const fundAccountResponse = await axios.post('https://api.razorpay.com/v1/fund_accounts', fundAccountData, {
                    auth: {
                        username: settings.razorpay.keyId,
                        password: settings.razorpay.keySecret
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                fundAccount = fundAccountResponse.data;
                logger.info('[PayoutController] Fund account created successfully:', fundAccount.id);
            } catch (fundAccountError) {
                logger.error('[PayoutController] Error creating fund account:', fundAccountError.response?.data || fundAccountError.message);
                throw new Error(`Failed to create RazorpayX fund account: ${fundAccountError.response?.data?.error?.description || fundAccountError.message}`);
            }
            
            // Update coach with Razorpay details
            coach.razorpayDetails = {
                contactId: contact.id,
                fundAccountId: fundAccount.id,
                setupDate: new Date(),
                isActive: true
            };

            await coach.save();

            logger.info(`[PayoutController] Coach ${coachId} setup completed for Razorpay payouts`);

            return {
                success: true,
                contactId: contact.id,
                fundAccountId: fundAccount.id,
                message: 'Coach setup completed for Razorpay payouts'
            };

        } catch (error) {
            logger.error('[PayoutController] Error setting up coach for Razorpay payouts:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Process Razorpay payout with gateway
     */
    async processRazorpayPayoutWithGateway(payoutData) {
        try {
            const {
                coachId,
                amount,
                currency = 'INR',
                fundAccountId,
                purpose = 'payout',
                mode: originalMode = 'IMPS',
                narration = 'Coach Payout - FE'
            } = payoutData;

            // Validate minimum amount
            if (amount < 100) { // Minimum ₹1 for Razorpay
                throw new Error('Minimum payout amount is ₹1');
            }

            const settings = await GlobalPaymentSettings.findOne();
            if (!settings || !settings.razorpay) {
                throw new Error('Razorpay settings not found');
            }

            // Create a short reference ID (max 40 characters for RazorpayX)
            const timestamp = Date.now().toString().slice(-8);
            const shortCoachId = coachId.toString().slice(-8);
            const referenceId = `PAYOUT_${timestamp}_${shortCoachId}`;
            
            // Ensure reference ID is not longer than 40 characters
            if (referenceId.length > 40) {
                throw new Error(`Reference ID too long: ${referenceId.length} characters (max 40)`);
            }

            // Ensure narration is not longer than 30 characters
            const truncatedNarration = this.truncateNarration(narration);

            // Get coach details to include fund account information
            const coach = await User.findById(coachId);
            if (!coach || !coach.razorpayDetails) {
                throw new Error('Coach Razorpay details not found');
            }

            if (!coach.paymentCollection || !coach.paymentCollection.isPaymentCollectionEnabled) {
                throw new Error('Coach payment collection not configured');
            }

            // Determine the correct mode based on payment method
            const mode = coach.paymentCollection.paymentCollectionMethod === 'upi' ? 'UPI' : originalMode;

            // Build fund account details based on payment method (without ID)
            let fundAccountDetails;
            if (coach.paymentCollection.paymentCollectionMethod === 'upi') {
                fundAccountDetails = {
                    account_type: 'vpa',
                    vpa: {
                        address: coach.paymentCollection.upiId
                    },
                    contact: {
                        name: coach.name,
                        email: coach.email,
                        contact: coach.phone,
                        type: 'vendor'
                    }
                };
            } else {
                fundAccountDetails = {
                    account_type: 'bank_account',
                    bank_account: {
                        name: coach.paymentCollection.bankAccount.accountHolderName,
                        ifsc: coach.paymentCollection.bankAccount.ifscCode,
                        account_number: coach.paymentCollection.bankAccount.accountNumber
                    },
                    contact: {
                        name: coach.name,
                        email: coach.email,
                        contact: coach.phone,
                        type: 'vendor'
                    }
                };
            }

            const payoutRequest = {
                account_number: settings.razorpay.accountNumber,
                fund_account: fundAccountDetails,
                amount: amount * 100, // Convert to paise
                currency: currency,
                mode: mode,
                purpose: purpose,
                queue_if_low_balance: true,
                reference_id: referenceId,
                narration: truncatedNarration
            };

            logger.info(`[PayoutController] Creating RazorpayX payout via REST API for coach ${coachId}`, {
                account_type: fundAccountDetails.account_type,
                payment_method: coach.paymentCollection.paymentCollectionMethod,
                mode: mode,
                contact_name: coach.name,
                contact_email: coach.email,
                reference_id: referenceId,
                narration: truncatedNarration,
                amount: amount * 100,
                fund_account_structure: fundAccountDetails
            });

            const payoutResponse = await axios.post('https://api.razorpay.com/v1/payouts', payoutRequest, {
                auth: {
                    username: settings.razorpay.keyId,
                    password: settings.razorpay.keySecret
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const payout = payoutResponse.data;
            
            logger.info(`[PayoutController] RazorpayX payout initiated for coach ${coachId}: ${payout.id}`);
            
            return {
                success: true,
                payoutId: payout.id,
                status: payout.status,
                amount: payout.amount / 100, // Convert back to rupees
                currency: payout.currency,
                data: payout
            };

        } catch (error) {
            logger.error('[PayoutController] Error processing RazorpayX payout:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.description || error.message
            };
        }
    }

    /**
     * Get Razorpay payout status
     * GET /api/paymentsv1/sending/razorpay-payout-status/:payoutId
     */
    async getRazorpayPayoutStatus(req, res) {
        try {
            const { payoutId } = req.params;

            const settings = await GlobalPaymentSettings.findOne();
            if (!settings || !settings.razorpay) {
                return res.status(500).json({
                    success: false,
                    message: 'Razorpay settings not found'
                });
            }

            logger.info(`[PayoutController] Fetching RazorpayX payout status via REST API: ${payoutId}`);

            const payoutResponse = await axios.get(`https://api.razorpay.com/v1/payouts/${payoutId}`, {
                auth: {
                    username: settings.razorpay.keyId,
                    password: settings.razorpay.keySecret
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const payout = payoutResponse.data;
            
            res.status(200).json({
                success: true,
                data: {
                    payoutId: payout.id,
                    status: payout.status,
                    amount: payout.amount / 100,
                    currency: payout.currency,
                    utr: payout.utr,
                    failure_reason: payout.failure_reason,
                    created_at: payout.created_at
                }
            });

        } catch (error) {
            logger.error('[PayoutController] Error getting RazorpayX payout status:', error.response?.data || error.message);
            res.status(500).json({
                success: false,
                message: 'Error getting payout status',
                error: error.response?.data?.error?.description || error.message
            });
        }
    }

    /**
     * Sync Razorpay payout status with database
     * POST /api/paymentsv1/sending/sync-razorpay-status/:payoutId
     */
    async syncRazorpayPayoutStatus(req, res) {
        try {
            const { payoutId } = req.params;

            const settings = await GlobalPaymentSettings.findOne();
            if (!settings || !settings.razorpay) {
                return res.status(500).json({
                    success: false,
                    message: 'Razorpay settings not found'
                });
            }

            logger.info(`[PayoutController] Syncing RazorpayX payout status via REST API: ${payoutId}`);

            const payoutResponse = await axios.get(`https://api.razorpay.com/v1/payouts/${payoutId}`, {
                auth: {
                    username: settings.razorpay.keyId,
                    password: settings.razorpay.keySecret
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const payout = payoutResponse.data;
            
            // Find and update transaction
            const transaction = await CoachTransaction.findOne({
                'payoutInfo.payoutId': payoutId
            });

            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    message: 'Transaction not found'
                });
            }

            // Update transaction status
            const razorpayStatus = payout.status;
            let transactionStatus = 'processing';

            switch (razorpayStatus) {
                case 'processed':
                case 'queued':
                    transactionStatus = 'processing';
                    break;
                case 'reversed':
                case 'failed':
                    transactionStatus = 'failed';
                    transaction.payoutInfo.failureReason = payout.failure_reason;
                    transaction.failedAt = new Date();
                    break;
                case 'completed':
                    transactionStatus = 'completed';
                    transaction.completedAt = new Date();
                    transaction.payoutInfo.completedAt = new Date();
                    transaction.payoutInfo.utr = payout.utr;
                    break;
            }

            transaction.status = transactionStatus;
            await transaction.save();

            logger.info(`[PayoutController] Synced Razorpay payout status for ${payoutId}: ${transactionStatus}`);

            res.status(200).json({
                success: true,
                message: 'Payout status synced successfully',
                data: {
                    payoutId: payoutId,
                    status: transactionStatus,
                    razorpayStatus: razorpayStatus
                }
            });

        } catch (error) {
            logger.error('[PayoutController] Error syncing RazorpayX payout status:', error.response?.data || error.message);
            res.status(500).json({
                success: false,
                message: 'Error syncing payout status',
                error: error.response?.data?.error?.description || error.message
            });
        }
    }

    /**
     * Process monthly Razorpay payouts
     * POST /api/paymentsv1/sending/monthly-razorpay-payouts
     */
    async processMonthlyRazorpayPayouts(req, res) {
        try {
            const { period = 'current' } = req.body;

            logger.info(`[PayoutController] Processing monthly Razorpay payouts for period: ${period}`);

            // Get coaches with pending earnings and Razorpay setup
            const coaches = await User.find({
                role: 'coach',
                'paymentCollection.isPaymentCollectionEnabled': true,
                'razorpayDetails.isActive': true
            });

            const payoutResults = [];

            for (const coach of coaches) {
                try {
                    // Calculate available balance
                    const earnings = await CoachTransaction.getCoachEarningsSummary(
                        coach._id,
                        this.getPeriodStartDate(period),
                        this.getPeriodEndDate(period)
                    );

                    const payouts = await CoachTransaction.getCoachPayoutSummary(
                        coach._id,
                        this.getPeriodStartDate(period),
                        this.getPeriodEndDate(period)
                    );

                    const availableBalance = earnings.totalEarnings - payouts.totalPayouts;

                    if (availableBalance >= 100) { // Minimum ₹1 for Razorpay
                        const payoutData = {
                            coachId: coach._id,
                            amount: availableBalance,
                            fundAccountId: coach.razorpayDetails.fundAccountId,
                            narration: this.truncateNarration(`Monthly payout - ${period} - FE`)
                        };

                        const payoutResult = await this.processRazorpayPayoutWithGateway(payoutData);

                        if (payoutResult.success) {
                            // Create transaction record
                            const payoutTransaction = new CoachTransaction({
                                transactionId: payoutResult.payoutId,
                                coachId: coach._id,
                                transactionType: 'payout_processing',
                                direction: 'outgoing',
                                grossAmount: availableBalance,
                                netAmount: availableBalance,
                                currency: 'INR',
                                payoutInfo: {
                                    payoutId: payoutResult.payoutId,
                                    payoutMethod: coach.paymentCollection.paymentCollectionMethod,
                                    destination: coach.paymentCollection,
                                    isInstant: false,
                                    initiatedAt: new Date()
                                },
                                status: 'processing',
                                metadata: {
                                    source: 'system',
                                    period: period,
                                    earnings: earnings.totalEarnings,
                                    previousPayouts: payouts.totalPayouts
                                }
                            });

                            await payoutTransaction.save();
                        }

                        payoutResults.push({
                            coachId: coach._id,
                            coachName: coach.name,
                            availableBalance: availableBalance,
                            ...payoutResult
                        });
                    }

                } catch (error) {
                    logger.error(`[PayoutController] Error processing Razorpay payout for coach ${coach._id}:`, error);
                    payoutResults.push({
                        coachId: coach._id,
                        coachName: coach.name,
                        success: false,
                        error: error.message
                    });
                }
            }

            res.status(200).json({
                success: true,
                message: 'Monthly Razorpay payouts processed',
                data: {
                    totalCoaches: coaches.length,
                    totalProcessed: payoutResults.length,
                    successful: payoutResults.filter(r => r.success).length,
                    failed: payoutResults.filter(r => !r.success).length,
                    results: payoutResults
                }
            });

        } catch (error) {
            logger.error('[PayoutController] Error processing monthly Razorpay payouts:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing monthly Razorpay payouts',
                error: error.message
            });
        }
    }
    /**
     * Update Razorpay configuration
     * POST /api/paymentsv1/admin/razorpay-config
     */
    async updateRazorpayConfig(req, res) {
        try {
            const {
                keyId,
                keySecret,
                accountNumber,
                webhookSecret,
                isActive = true
            } = req.body;

            // Validate required fields
            if (!keyId || !keySecret) {
                return res.status(400).json({
                    success: false,
                    message: 'keyId and keySecret are required'
                });
            }

            // Get or create settings
            let settings = await GlobalPaymentSettings.findOne();
            if (!settings) {
                settings = new GlobalPaymentSettings({
                    platformFee: { percentage: 10, isPercentageBased: true },
                    commission: { directCommission: { percentage: 70 } },
                    payout: { monthlyPayout: { isEnabled: true, dayOfMonth: 1, minimumThreshold: 1000 } }
                });
            }

            // Update Razorpay configuration
            settings.razorpay = {
                keyId: keyId.trim(),
                keySecret: keySecret.trim(),
                accountNumber: accountNumber ? accountNumber.trim() : undefined,
                webhookSecret: webhookSecret ? webhookSecret.trim() : undefined,
                isActive: isActive
            };

            await settings.save();

            // Reinitialize Razorpay instance
            await this.initializeRazorpay();

            logger.info('[PayoutController] Razorpay configuration updated successfully');

            res.status(200).json({
                success: true,
                message: 'Razorpay configuration updated successfully',
                data: {
                    keyId: settings.razorpay.keyId,
                    accountNumber: settings.razorpay.accountNumber,
                    isActive: settings.razorpay.isActive
                }
            });

        } catch (error) {
            logger.error('[PayoutController] Error updating Razorpay configuration:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating Razorpay configuration',
                error: error.message
            });
        }
    }

    /**
     * Test Razorpay module
     * GET /api/paymentsv1/admin/test-razorpay
     */
    async testRazorpayModule(req, res) {
        try {
            // Test Razorpay module import
            const RazorpayModule = require('razorpay');
            logger.info('[PayoutController] Razorpay module loaded:', typeof RazorpayModule);
            
            // Test creating Razorpay instance
            const testRazorpay = new RazorpayModule({
                key_id: 'test_key',
                key_secret: 'test_secret'
            });
            
            logger.info('[PayoutController] Test Razorpay instance created:', {
                hasContacts: typeof testRazorpay.contacts === 'object',
                hasFundAccounts: typeof testRazorpay.fundAccounts === 'object',
                hasPayouts: typeof testRazorpay.payouts === 'object'
            });

            res.status(200).json({
                success: true,
                message: 'Razorpay module test successful',
                data: {
                    moduleLoaded: true,
                    instanceCreated: true,
                    hasContacts: typeof testRazorpay.contacts === 'object',
                    hasFundAccounts: typeof testRazorpay.fundAccounts === 'object',
                    hasPayouts: typeof testRazorpay.payouts === 'object'
                }
            });

        } catch (error) {
            logger.error('[PayoutController] Razorpay module test failed:', error);
            res.status(500).json({
                success: false,
                message: 'Razorpay module test failed',
                error: error.message
            });
        }
    }

    /**
     * Check Razorpay status
     * GET /api/paymentsv1/admin/razorpay-status
     */
    async getRazorpayStatus(req, res) {
        try {
            const settings = await GlobalPaymentSettings.findOne();
            
            if (!settings || !settings.razorpay) {
                return res.status(400).json({
                    success: false,
                    message: 'Razorpay not configured',
                    status: 'not_configured'
                });
            }

            // Try to initialize Razorpay
            try {
                await this.initializeRazorpay();
                const isInitialized = !!this.razorpay;
                
                res.status(200).json({
                    success: true,
                    message: 'Razorpay status retrieved',
                    data: {
                        isConfigured: true,
                        isInitialized: isInitialized,
                        isActive: settings.razorpay.isActive,
                        hasKeyId: !!settings.razorpay.keyId,
                        hasKeySecret: !!settings.razorpay.keySecret,
                        hasAccountNumber: !!settings.razorpay.accountNumber,
                        keyId: settings.razorpay.keyId ? settings.razorpay.keyId.substring(0, 8) + '...' : null
                    }
                });
            } catch (initError) {
                res.status(400).json({
                    success: false,
                    message: 'Razorpay initialization failed',
                    error: initError.message,
                    data: {
                        isConfigured: true,
                        isInitialized: false,
                        isActive: settings.razorpay.isActive,
                        hasKeyId: !!settings.razorpay.keyId,
                        hasKeySecret: !!settings.razorpay.keySecret,
                        hasAccountNumber: !!settings.razorpay.accountNumber
                    }
                });
            }

        } catch (error) {
            logger.error('[PayoutController] Error getting Razorpay status:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting Razorpay status',
                error: error.message
            });
        }
    }

    /**
     * Setup coach payment collection
     * POST /api/paymentsv1/admin/setup-coach-payment-collection/:coachId
     */
    async setupCoachPaymentCollection(req, res) {
        try {
            const { coachId } = req.params;
            const {
                upiId,
                bankAccount,
                paymentCollectionMethod = 'upi'
            } = req.body;

            // Validate required fields based on method
            if (paymentCollectionMethod === 'upi' && !upiId) {
                return res.status(400).json({
                    success: false,
                    message: 'UPI ID is required for UPI payment collection'
                });
            }

            if (paymentCollectionMethod === 'bank_transfer' && !bankAccount) {
                return res.status(400).json({
                    success: false,
                    message: 'Bank account details are required for bank transfer payment collection'
                });
            }

            if (paymentCollectionMethod === 'both' && (!upiId || !bankAccount)) {
                return res.status(400).json({
                    success: false,
                    message: 'Both UPI ID and bank account details are required for both payment methods'
                });
            }

            // Get coach
            const coach = await User.findById(coachId);
            if (!coach) {
                return res.status(404).json({
                    success: false,
                    message: 'Coach not found'
                });
            }

            // Update coach payment collection settings
            coach.paymentCollection = {
                upiId: upiId || null,
                bankAccount: bankAccount || null,
                isPaymentCollectionEnabled: true,
                paymentCollectionMethod: paymentCollectionMethod,
                lastPaymentReceived: {
                    amount: 0,
                    date: null,
                    reference: null
                },
                totalPaymentsReceived: 0,
                pendingPayments: 0
            };

            await coach.save();

            logger.info(`[PayoutController] Coach ${coachId} payment collection setup completed`);

            res.status(200).json({
                success: true,
                message: 'Coach payment collection setup completed successfully',
                data: {
                    coachId: coach._id,
                    coachName: coach.name,
                    paymentCollection: {
                        method: coach.paymentCollection.paymentCollectionMethod,
                        upiId: coach.paymentCollection.upiId,
                        bankAccount: coach.paymentCollection.bankAccount ? {
                            accountHolderName: coach.paymentCollection.bankAccount.accountHolderName,
                            accountNumber: coach.paymentCollection.bankAccount.accountNumber ? 
                                coach.paymentCollection.bankAccount.accountNumber.slice(-4).padStart(coach.paymentCollection.bankAccount.accountNumber.length, '*') : null,
                            ifscCode: coach.paymentCollection.bankAccount.ifscCode
                        } : null,
                        isEnabled: coach.paymentCollection.isPaymentCollectionEnabled
                    }
                }
            });

        } catch (error) {
            logger.error('[PayoutController] Error setting up coach payment collection:', error);
            res.status(500).json({
                success: false,
                message: 'Error setting up coach payment collection',
                error: error.message
            });
        }
    }
}

// Create controller instance and bind all methods
const controller = new PayoutController();

module.exports = {
    processAutomaticPayouts: controller.processAutomaticPayouts.bind(controller),
    setupRazorpayCoach: controller.setupRazorpayCoach.bind(controller),
    processRazorpayPayout: controller.processRazorpayPayout.bind(controller),
    getRazorpayPayoutStatus: controller.getRazorpayPayoutStatus.bind(controller),
    syncRazorpayPayoutStatus: controller.syncRazorpayPayoutStatus.bind(controller),
    processMonthlyRazorpayPayouts: controller.processMonthlyRazorpayPayouts.bind(controller),
    updateRazorpayConfig: controller.updateRazorpayConfig.bind(controller),
    setupCoachPaymentCollection: controller.setupCoachPaymentCollection.bind(controller),
    getRazorpayStatus: controller.getRazorpayStatus.bind(controller),
    testRazorpayModule: controller.testRazorpayModule.bind(controller),
    processMonthlyMlmCommissionPayouts: controller.processMonthlyMlmCommissionPayouts.bind(controller),
    getMlmCommissionSummary: controller.getMlmCommissionSummary.bind(controller),
    updateMlmCommissionSettings: controller.updateMlmCommissionSettings.bind(controller),
    getMlmCommissionSettings: controller.getMlmCommissionSettings.bind(controller)
};
