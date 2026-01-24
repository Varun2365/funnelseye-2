// D:\PRJ_YCT_Final\schema\index.js

const mongoose = require('mongoose');

// Import all models in dependency order
const User = require('./User');
// Import schemas that will become discriminators
const coachSchema = require('./coachSchema');
const Staff = require('./Staff');
const Lead = require('./Lead');
const Task = require('./Task');
const AdCampaign = require('./AdCampaign');
const AdSet = require('./AdSet');
const AdCreative = require('./AdCreative');
const Ad = require('./Ad');
// const Payment = require('./Payment');
const Subscription = require('./Subscription');
const Cart = require('./Cart');
const Funnel = require('./Funnel');
const AdminFunnel = require('./AdminFunnel');
const FunnelEvent = require('./FunnelEvent');
const NurturingSequence = require('./NurturingSequence');
const NurturingStep = require('./NurturingStep');
const AutomationRule = require('./AutomationRule');
const CoachAvailability = require('./CoachAvailability');
const CoachPerformance = require('./CoachPerformance');
const CoachReport = require('./CoachReport');
const Appointment = require('./Appointment');
const CustomDomain = require('./CustomDomain');
const File = require('./File');
const FormSubmissionMessage = require('./FormSubmissionMessage');
const Message = require('./Message');
const Contact = require('./Contact');
const Otp = require('./Otp');
const ScoreLog = require('./ScoreLog');
const SequenceLog = require('./SequenceLog');
const SystemLog = require('./SystemLog');
const MessageTemplate = require('./MessageTemplate');
const ZoomIntegration = require('./ZoomIntegration');

// WhatsApp schemas moved to dustbin/whatsapp-dump/

// Import hierarchy schemas
const CoachHierarchyLevel = require('./CoachHierarchyLevel');
const AdminRequest = require('./AdminRequest');
const ExternalSponsor = require('./ExternalSponsor');
const Commission = require('./Commission');
const CommissionSettings = require('./CommissionSettings');

// Import new payment and plan schemas
const CoachPlan = require('./CoachPlan');
const CentralPayment = require('./CentralPayment');
const CoachTransaction = require('./CoachTransaction');
// const CentralPaymentHandler = require('./CentralPaymentHandler');
const MlmCommissionDistribution = require('./MlmCommissionDistribution');

// Import unified payment system schemas
const GlobalPaymentSettings = require('./GlobalPaymentSettings');
const PaymentGatewayConfig = require('./PaymentGatewayConfig');
const UnifiedPaymentTransaction = require('./UnifiedPaymentTransaction');
const CheckoutPage = require('./CheckoutPage');

// Import new payment system v1 schemas
const AdminProduct = require('./AdminProduct');
const CoachSellablePlan = require('./CoachSellablePlan');
const RazorpayPayment = require('./RazorpayPayment');

// Import subscription schemas
const SubscriptionPlan = require('./SubscriptionPlan');
const CoachSubscription = require('./CoachSubscription');


// Import new admin system schemas
const AdminSystemSettings = require('./AdminSystemSettings');
const AdminV1Settings = require('./AdminV1Settings');
const AdminUser = require('./AdminUser');
const AdminAuditLog = require('./AdminAuditLog');

// Import messaging channel schema
const MessagingChannel = require('./MessagingChannel');

// Create discriminator models after base models are loaded
let CoachDiscriminator, ClientDiscriminator, AdminDiscriminator;

try {
    // Create discriminators of User
    if (User && mongoose.models.User) {
        // console.log('Creating discriminators of User model');
        CoachDiscriminator = User.discriminator('coach', coachSchema);
        ClientDiscriminator = User.discriminator('client', new mongoose.Schema({}));
        AdminDiscriminator = User.discriminator('admin', new mongoose.Schema({}));
        // Staff discriminator is already created in Staff.js
        // console.log('✅ All discriminators created successfully');
    } else {
        // console.warn('⚠️ User model not available, creating standalone models');
        CoachDiscriminator = mongoose.model('Coach', coachSchema);
        ClientDiscriminator = mongoose.model('Client', new mongoose.Schema({}));
        AdminDiscriminator = mongoose.model('Admin', new mongoose.Schema({}));
    }
} catch (error) {
    // console.error('❌ Error creating discriminator models:', error.message);
    // Fallback to standalone models
    CoachDiscriminator = mongoose.model('Coach', coachSchema);
    ClientDiscriminator = mongoose.model('Client', new mongoose.Schema({}));
    AdminDiscriminator = mongoose.model('Admin', new mongoose.Schema({}));
}

// Export all models
const models = {
    User,
    Coach: CoachDiscriminator,
    Client: ClientDiscriminator,
    Admin: AdminDiscriminator,
    Staff, // Keep original Staff discriminator from Staff.js
    Lead,
    Task,
    AdCampaign,
    AdSet,
    AdCreative,
    Ad,
    // Payment,
    Subscription,
    Cart,
    Funnel,
    AdminFunnel,
    FunnelEvent,
    NurturingSequence,
    NurturingStep,
    AutomationRule,
    CoachAvailability,
    CoachPerformance,
    CoachReport,
    Appointment,
    CustomDomain,
    File,
    FormSubmissionMessage,
    Message,
    Contact,

    Otp,
    ScoreLog,
    SequenceLog,
    SystemLog,
    MessageTemplate,
    ZoomIntegration,
    // WhatsApp models moved to dustbin/whatsapp-dump/
    // Hierarchy models
    CoachHierarchyLevel,
    AdminRequest,
    ExternalSponsor,
    // Commission models
    Commission,
    CommissionSettings,
    // New payment and plan models
    CoachPlan,
    CentralPayment,
    // CentralPaymentHandler,
    MlmCommissionDistribution,
    
    // Unified payment system models
    GlobalPaymentSettings,
    PaymentGatewayConfig,
    UnifiedPaymentTransaction,
    CheckoutPage,
    
    // New payment system v1 models
    AdminProduct,
    CoachSellablePlan,
    RazorpayPayment,

    // Subscription models
    SubscriptionPlan,
    CoachSubscription,

    // New admin system models
    AdminSystemSettings,
    AdminV1Settings,
    AdminUser,
    AdminAuditLog,

    // Messaging channel model
    MessagingChannel
};

// Validate all models are properly loaded
Object.entries(models).forEach(([name, model]) => {
    if (!model) {
        // console.warn(`⚠️ Warning: Model ${name} is undefined`);
    } else if (typeof model !== 'function') {
        // console.warn(`⚠️ Warning: Model ${name} is not a function:`, typeof model);
    }
});

module.exports = models;
