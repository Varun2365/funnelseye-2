const mongoose = require('mongoose');
const CentralPayment = require('../schema/CentralPayment');
const UnifiedPaymentTransaction = require('../schema/UnifiedPaymentTransaction');
const GlobalPaymentSettings = require('../schema/GlobalPaymentSettings');
const logger = require('../utils/logger');

/**
 * Migration script to move from Funnelseye Payments to Unified Payments
 */
class PaymentSystemMigration {
    
    constructor() {
        this.migrationStats = {
            totalRecords: 0,
            migratedRecords: 0,
            failedRecords: 0,
            errors: []
        };
    }

    /**
     * Initialize default global payment settings
     */
    async initializeGlobalSettings() {
        try {
            logger.info('[MIGRATION] Initializing global payment settings...');
            
            const existingSettings = await GlobalPaymentSettings.findOne();
            if (existingSettings) {
                logger.info('[MIGRATION] Global settings already exist, skipping initialization');
                return existingSettings;
            }

            const defaultSettings = new GlobalPaymentSettings({
                platformFee: {
                    percentage: 10,
                    fixedAmount: 0,
                    isPercentageBased: true
                },
                commission: {
                    mlmLevels: [
                        { level: 1, percentage: 5 },
                        { level: 2, percentage: 3 },
                        { level: 3, percentage: 2 },
                        { level: 4, percentage: 1 },
                        { level: 5, percentage: 0.5 }
                    ],
                    directCommission: {
                        percentage: 15,
                        isEnabled: true
                    },
                    maxLevels: 5,
                    cap: 10000
                },
                payouts: {
                    instantPayout: {
                        isEnabled: true,
                        fee: 2,
                        minimumAmount: 100
                    },
                    monthlyPayout: {
                        isEnabled: true,
                        dayOfMonth: 25,
                        minimumAmount: 500
                    },
                    methods: ['upi', 'bank_transfer', 'paytm']
                },
                tax: {
                    gst: {
                        isEnabled: true,
                        percentage: 18
                    },
                    tds: {
                        isEnabled: true,
                        percentage: 10,
                        threshold: 10000
                    }
                },
                centralAccount: {
                    gatewayAccounts: {
                        razorpay: {
                            isEnabled: true,
                            isActive: false,
                            config: {
                                keyId: '',
                                keySecret: ''
                            }
                        },
                        stripe: {
                            isEnabled: false,
                            isActive: false,
                            config: {
                                publishableKey: '',
                                secretKey: ''
                            }
                        },
                        paypal: {
                            isEnabled: false,
                            isActive: false,
                            config: {
                                clientId: '',
                                clientSecret: ''
                            }
                        }
                    }
                }
            });

            await defaultSettings.save();
            logger.info('[MIGRATION] Global payment settings initialized successfully');
            return defaultSettings;

        } catch (error) {
            logger.error('[MIGRATION] Error initializing global settings:', error);
            throw error;
        }
    }

    /**
     * Migrate CentralPayment records to UnifiedPaymentTransaction
     */
    async migratePaymentRecords() {
        try {
            logger.info('[MIGRATION] Starting payment records migration...');
            
            const centralPayments = await CentralPayment.find({});
            this.migrationStats.totalRecords = centralPayments.length;
            
            logger.info(`[MIGRATION] Found ${this.migrationStats.totalRecords} records to migrate`);

            for (const centralPayment of centralPayments) {
                try {
                    await this.migrateSinglePayment(centralPayment);
                    this.migrationStats.migratedRecords++;
                    
                    if (this.migrationStats.migratedRecords % 10 === 0) {
                        logger.info(`[MIGRATION] Progress: ${this.migrationStats.migratedRecords}/${this.migrationStats.totalRecords}`);
                    }
                } catch (error) {
                    this.migrationStats.failedRecords++;
                    this.migrationStats.errors.push({
                        recordId: centralPayment._id,
                        error: error.message
                    });
                    logger.error(`[MIGRATION] Failed to migrate payment ${centralPayment._id}:`, error.message);
                }
            }

            logger.info('[MIGRATION] Payment records migration completed');
            this.printMigrationStats();

        } catch (error) {
            logger.error('[MIGRATION] Error during payment records migration:', error);
            throw error;
        }
    }

    /**
     * Migrate a single CentralPayment record
     */
    async migrateSinglePayment(centralPayment) {
        // Check if already migrated
        const existingTransaction = await UnifiedPaymentTransaction.findOne({
            'metadata.originalCentralPaymentId': centralPayment._id.toString()
        });

        if (existingTransaction) {
            logger.info(`[MIGRATION] Payment ${centralPayment._id} already migrated, skipping`);
            return existingTransaction;
        }

        // Map transaction type
        const transactionType = this.mapTransactionType(centralPayment.businessType);
        
        // Create unified transaction
        const unifiedTransaction = new UnifiedPaymentTransaction({
            transactionId: centralPayment.paymentId || `MIGRATED_${centralPayment._id}`,
            orderId: centralPayment.orderId || `ORDER_${centralPayment._id}`,
            referenceId: centralPayment.referenceId || `REF_${centralPayment._id}`,
            transactionType,
            grossAmount: centralPayment.amount || 0,
            senderId: centralPayment.senderId || 'unknown',
            senderType: this.mapUserType(centralPayment.senderType),
            receiverId: centralPayment.receiverId || 'central_account',
            receiverType: 'system',
            productId: centralPayment.productId,
            productType: this.mapProductType(centralPayment.businessType),
            productName: centralPayment.productName || 'Migrated Product',
            productDescription: centralPayment.description || 'Migrated from old system',
            coachId: centralPayment.coachId,
            status: this.mapStatus(centralPayment.status),
            gateway: centralPayment.gateway || 'razorpay',
            platformFee: centralPayment.platformFee || 0,
            commissionAmount: centralPayment.commissionAmount || 0,
            taxAmount: centralPayment.taxAmount || 0,
            netAmount: centralPayment.netAmount || centralPayment.amount || 0,
            initiatedAt: centralPayment.createdAt,
            completedAt: centralPayment.status === 'completed' ? centralPayment.updatedAt : null,
            metadata: {
                originalCentralPaymentId: centralPayment._id.toString(),
                migrationDate: new Date(),
                originalBusinessType: centralPayment.businessType,
                originalStatus: centralPayment.status,
                originalGateway: centralPayment.gateway,
                originalData: {
                    businessType: centralPayment.businessType,
                    status: centralPayment.status,
                    gateway: centralPayment.gateway,
                    description: centralPayment.description
                }
            }
        });

        await unifiedTransaction.save();
        return unifiedTransaction;
    }

    /**
     * Map old business type to new transaction type
     */
    mapTransactionType(businessType) {
        const typeMap = {
            'product_purchase': 'product_purchase',
            'subscription': 'subscription_payment',
            'mlm_commission': 'mlm_commission',
            'service_payment': 'service_payment',
            'refund': 'refund',
            'adjustment': 'adjustment'
        };
        
        return typeMap[businessType] || 'course_purchase';
    }

    /**
     * Map old user type to new user type
     */
    mapUserType(userType) {
        const typeMap = {
            'customer': 'customer',
            'coach': 'coach',
            'admin': 'admin',
            'system': 'system'
        };
        
        return typeMap[userType] || 'customer';
    }

    /**
     * Map old product type to new product type
     */
    mapProductType(businessType) {
        const typeMap = {
            'product_purchase': 'product',
            'subscription': 'subscription',
            'mlm_commission': 'commission',
            'service_payment': 'service',
            'refund': 'refund',
            'adjustment': 'adjustment'
        };
        
        return typeMap[businessType] || 'course';
    }

    /**
     * Map old status to new status
     */
    mapStatus(status) {
        const statusMap = {
            'pending': 'pending',
            'processing': 'processing',
            'completed': 'completed',
            'failed': 'failed',
            'cancelled': 'cancelled',
            'refunded': 'refunded'
        };
        
        return statusMap[status] || 'pending';
    }

    /**
     * Print migration statistics
     */
    printMigrationStats() {
        logger.info('=== MIGRATION STATISTICS ===');
        logger.info(`Total Records: ${this.migrationStats.totalRecords}`);
        logger.info(`Successfully Migrated: ${this.migrationStats.migratedRecords}`);
        logger.info(`Failed Records: ${this.migrationStats.failedRecords}`);
        logger.info(`Success Rate: ${((this.migrationStats.migratedRecords / this.migrationStats.totalRecords) * 100).toFixed(2)}%`);
        
        if (this.migrationStats.errors.length > 0) {
            logger.info('Errors encountered:');
            this.migrationStats.errors.slice(0, 5).forEach(error => {
                logger.info(`  - Record ${error.recordId}: ${error.error}`);
            });
            if (this.migrationStats.errors.length > 5) {
                logger.info(`  ... and ${this.migrationStats.errors.length - 5} more errors`);
            }
        }
    }

    /**
     * Run complete migration
     */
    async runMigration() {
        try {
            logger.info('[MIGRATION] Starting complete payment system migration...');
            
            // Step 1: Initialize global settings
            await this.initializeGlobalSettings();
            
            // Step 2: Migrate payment records
            await this.migratePaymentRecords();
            
            logger.info('[MIGRATION] Complete payment system migration finished successfully!');
            
        } catch (error) {
            logger.error('[MIGRATION] Migration failed:', error);
            throw error;
        }
    }

    /**
     * Rollback migration (for testing)
     */
    async rollbackMigration() {
        try {
            logger.info('[MIGRATION] Rolling back migration...');
            
            // Delete all migrated transactions
            const result = await UnifiedPaymentTransaction.deleteMany({
                'metadata.migrationDate': { $exists: true }
            });
            
            logger.info(`[MIGRATION] Rollback completed. Deleted ${result.deletedCount} migrated records`);
            
        } catch (error) {
            logger.error('[MIGRATION] Rollback failed:', error);
            throw error;
        }
    }
}

// Export migration class
module.exports = PaymentSystemMigration;

// If run directly, execute migration
if (require.main === module) {
    const migration = new PaymentSystemMigration();
    
    // Connect to database
    const { connectDB } = require('../config/db');
    
    connectDB()
        .then(() => {
            logger.info('[MIGRATION] Database connected, starting migration...');
            return migration.runMigration();
        })
        .then(() => {
            logger.info('[MIGRATION] Migration completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            logger.error('[MIGRATION] Migration failed:', error);
            process.exit(1);
        });
}
