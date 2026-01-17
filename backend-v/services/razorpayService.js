const Razorpay = require('razorpay');
const axios = require('axios');
const crypto = require('crypto');

/**
 * Comprehensive Razorpay Service
 * Handles payments, payouts, balance checking, and MLM commission management
 */
class RazorpayService {
    constructor() {
        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        
        this.baseURL = 'https://api.razorpay.com/v1';
        this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    }

    /**
     * Verify Razorpay webhook signature
     */
    verifyWebhookSignature(body, signature) {
        try {
            const expectedSignature = crypto
                .createHmac('sha256', this.webhookSecret)
                .update(body)
                .digest('hex');
            
            return crypto.timingSafeEqual(
                Buffer.from(signature, 'hex'),
                Buffer.from(expectedSignature, 'hex')
            );
        } catch (error) {
            console.error('Webhook signature verification error:', error);
            return false;
        }
    }

    /**
     * Get Razorpay account balance
     */
    async getAccountBalance() {
        try {
            // Use the correct Razorpay Banking Balances API endpoint
            const response = await axios.get(`${this.baseURL}/banking_balances`, {
                auth: {
                    username: process.env.RAZORPAY_KEY_ID,
                    password: process.env.RAZORPAY_KEY_SECRET
                }
            });

            if (response.data.items && response.data.items.length > 0) {
                // Find RazorpayX account (razorpayx_lite)
                const razorpayXAccount = response.data.items.find(account => 
                    account.account_type === 'razorpayx_lite' || 
                    account.account_type === 'current_account'
                );

                if (razorpayXAccount) {
                    return {
                        success: true,
                        balance: razorpayXAccount.amount / 100, // Convert from paise to rupees
                        currency: razorpayXAccount.currency || 'INR',
                        accountId: razorpayXAccount.account_number,
                        accountName: razorpayXAccount.bank_name || 'RazorpayX Account',
                        accountType: razorpayXAccount.account_type,
                        availableAmount: razorpayXAccount.available_amount / 100,
                        refreshedAt: new Date(razorpayXAccount.refreshed_at * 1000)
                    };
                }

                // If no RazorpayX account found, return the first account
                const firstAccount = response.data.items[0];
                return {
                    success: true,
                    balance: firstAccount.amount / 100,
                    currency: firstAccount.currency || 'INR',
                    accountId: firstAccount.account_number,
                    accountName: firstAccount.bank_name || 'Razorpay Account',
                    accountType: firstAccount.account_type,
                    availableAmount: firstAccount.available_amount / 100,
                    refreshedAt: new Date(firstAccount.refreshed_at * 1000)
                };
            }

            // If no accounts found
            return {
                success: true,
                balance: 0,
                currency: 'INR',
                accountId: 'no_account',
                accountName: 'No RazorpayX Account Found',
                note: 'No banking accounts found'
            };

        } catch (error) {
            console.error('Error fetching Razorpay balance:', error.response?.data || error.message);
            
            // If API fails, return a fallback response
            return {
                success: false,
                error: error.response?.data?.error?.description || error.message,
                balance: 0,
                currency: 'INR',
                accountId: 'error',
                accountName: 'RazorpayX Account (Error)'
            };
        }
    }

    /**
     * Create a payout to UPI
     */
    async createUPIPayout(payoutData) {
        try {
            const { amount, upiId, purpose, notes, referenceId } = payoutData;
            
            const payout = await this.razorpay.payouts.create({
                account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
                fund_account: {
                    account_type: 'vpa',
                    vpa: {
                        address: upiId
                    }
                },
                amount: amount * 100, // Convert to paise
                currency: 'INR',
                mode: 'UPI',
                purpose: purpose || 'payout',
                queue_if_low_balance: true,
                reference_id: referenceId,
                narration: notes || 'Platform payout'
            });

            return {
                success: true,
                payout: payout,
                payoutId: payout.id,
                status: payout.status,
                amount: payout.amount / 100
            };
        } catch (error) {
            console.error('Error creating UPI payout:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.description || error.message
            };
        }
    }

    /**
     * Create a payout to bank account
     */
    async createBankPayout(payoutData) {
        try {
            const { amount, bankAccount, purpose, notes, referenceId } = payoutData;
            
            const payout = await this.razorpay.payouts.create({
                account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
                fund_account: {
                    account_type: 'bank_account',
                    bank_account: {
                        name: bankAccount.accountHolderName,
                        ifsc: bankAccount.ifscCode,
                        account_number: bankAccount.accountNumber
                    }
                },
                amount: amount * 100, // Convert to paise
                currency: 'INR',
                mode: 'IMPS',
                purpose: purpose || 'payout',
                queue_if_low_balance: true,
                reference_id: referenceId,
                narration: notes || 'Platform payout'
            });

            return {
                success: true,
                payout: payout,
                payoutId: payout.id,
                status: payout.status,
                amount: payout.amount / 100
            };
        } catch (error) {
            console.error('Error creating bank payout:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.description || error.message
            };
        }
    }

    /**
     * Get payout status
     */
    async getPayoutStatus(payoutId) {
        try {
            const payout = await this.razorpay.payouts.fetch(payoutId);
            
            return {
                success: true,
                payout: payout,
                status: payout.status,
                amount: payout.amount / 100,
                createdAt: payout.created_at,
                processedAt: payout.processed_at
            };
        } catch (error) {
            console.error('Error fetching payout status:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.description || error.message
            };
        }
    }

    /**
     * Get all payouts with filtering
     */
    async getAllPayouts(filters = {}) {
        try {
            const { count = 10, skip = 0, from, to, status } = filters;
            
            let query = `count=${count}&skip=${skip}`;
            if (from) query += `&from=${from}`;
            if (to) query += `&to=${to}`;
            if (status) query += `&status=${status}`;

            const payouts = await this.razorpay.payouts.all({ query });
            
            return {
                success: true,
                payouts: payouts.items,
                count: payouts.count,
                totalCount: payouts.count
            };
        } catch (error) {
            console.error('Error fetching payouts:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.description || error.message
            };
        }
    }

    /**
     * Create a refund
     */
    async createRefund(paymentId, amount, notes) {
        try {
            const refund = await this.razorpay.payments.refund(paymentId, {
                amount: amount * 100, // Convert to paise
                notes: {
                    reason: notes || 'Customer requested refund'
                }
            });

            return {
                success: true,
                refund: refund,
                refundId: refund.id,
                status: refund.status,
                amount: refund.amount / 100
            };
        } catch (error) {
            console.error('Error creating refund:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.description || error.message
            };
        }
    }

    /**
     * Get refund details
     */
    async getRefundDetails(refundId) {
        try {
            const refund = await this.razorpay.refunds.fetch(refundId);
            
            return {
                success: true,
                refund: refund,
                status: refund.status,
                amount: refund.amount / 100,
                createdAt: refund.created_at,
                processedAt: refund.processed_at
            };
        } catch (error) {
            console.error('Error fetching refund details:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.description || error.message
            };
        }
    }

    /**
     * Get payment details
     */
    async getPaymentDetails(paymentId) {
        try {
            const payment = await this.razorpay.payments.fetch(paymentId);
            
            return {
                success: true,
                payment: payment,
                status: payment.status,
                amount: payment.amount / 100,
                currency: payment.currency,
                createdAt: payment.created_at,
                captured: payment.captured
            };
        } catch (error) {
            console.error('Error fetching payment details:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.description || error.message
            };
        }
    }

    /**
     * Get all payments with filtering
     */
    async getAllPayments(filters = {}) {
        try {
            const { count = 10, skip = 0, from, to, status } = filters;
            
            let query = `count=${count}&skip=${skip}`;
            if (from) query += `&from=${from}`;
            if (to) query += `&to=${to}`;
            if (status) query += `&status=${status}`;

            const payments = await this.razorpay.payments.all({ query });
            
            return {
                success: true,
                payments: payments.items,
                count: payments.count,
                totalCount: payments.count
            };
        } catch (error) {
            console.error('Error fetching payments:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.description || error.message
            };
        }
    }

    /**
     * Calculate MLM commission for platform subscription
     */
    calculateMLMCommission(subscriptionAmount, commissionStructure, coachLevel) {
        try {
            const { levels, platformFeePercentage } = commissionStructure;
            
            // Calculate platform fee
            const platformFee = (subscriptionAmount * platformFeePercentage) / 100;
            const netAmount = subscriptionAmount - platformFee;
            
            // Calculate commission for each level
            const commissions = [];
            let totalCommission = 0;
            
            for (let level = 1; level <= levels.length && level <= coachLevel; level++) {
                const levelConfig = levels[level - 1];
                if (levelConfig && levelConfig.percentage > 0) {
                    const commissionAmount = (netAmount * levelConfig.percentage) / 100;
                    commissions.push({
                        level: level,
                        percentage: levelConfig.percentage,
                        amount: commissionAmount,
                        recipient: levelConfig.recipient || 'coach'
                    });
                    totalCommission += commissionAmount;
                }
            }
            
            return {
                success: true,
                subscriptionAmount,
                platformFee,
                netAmount,
                totalCommission,
                commissions,
                remainingAmount: netAmount - totalCommission
            };
        } catch (error) {
            console.error('Error calculating MLM commission:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Process automatic payout for MLM commission
     */
    async processAutomaticPayout(commissionData, payoutMethod) {
        try {
            const { coachId, amount, upiId, bankAccount, purpose, notes } = commissionData;
            
            let payoutResult;
            
            if (payoutMethod === 'UPI' && upiId) {
                payoutResult = await this.createUPIPayout({
                    amount,
                    upiId,
                    purpose: purpose || 'MLM Commission',
                    notes: notes || `Commission payout for coach ${coachId}`,
                    referenceId: `COMM_${coachId}_${Date.now()}`
                });
            } else if (payoutMethod === 'BANK' && bankAccount) {
                payoutResult = await this.createBankPayout({
                    amount,
                    bankAccount,
                    purpose: purpose || 'MLM Commission',
                    notes: notes || `Commission payout for coach ${coachId}`,
                    referenceId: `COMM_${coachId}_${Date.now()}`
                });
            } else {
                throw new Error('Invalid payout method or missing account details');
            }
            
            return payoutResult;
        } catch (error) {
            console.error('Error processing automatic payout:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new RazorpayService();
