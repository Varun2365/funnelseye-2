const express = require('express');
const router = express.Router();

// Import services
const centralWhatsAppService = require('../services/centralWhatsAppService');

// Import controllers
const centralMessagingController = require('../controllers/centralMessagingController');
const centralMessagingTemplateController = require('../controllers/centralMessagingTemplateController');
const centralWhatsAppController = require('../controllers/centralWhatsAppController');
const whatsappInboxController = require('../controllers/whatsappInboxController');
const whatsappAIKnowledgeController = require('../controllers/whatsappAIKnowledgeController');
const whatsappWebhookController = require('../controllers/whatsappWebhookController');
const whatsappCoachSettingsController = require('../controllers/whatsappCoachSettingsController');
const whatsappAdminSettingsController = require('../controllers/whatsappAdminSettingsController');
const messagingController = require('../controllers/messagingController');
const templateController = require('../controllers/templateController');
const contactController = require('../controllers/contactController');
const inboxController = require('../controllers/inboxController');
const unifiedMessagingController = require('../controllers/unifiedMessagingController');
const unifiedMessagingAdminController = require('../controllers/unifiedMessagingAdminController');
const whatsappCreditController = require('../controllers/whatsappCreditController');
const emailConfigController = require('../controllers/emailConfigController');
const messageTemplateController = require('../controllers/messageTemplateController');

// Import middleware
const { protect, authorizeCoach, authorizeStaff } = require('../middleware/auth');
const { verifyAdminToken, noLogActivity } = require('../middleware/adminAuth');
const { requirePermission } = require('../middleware/permissionMiddleware');

/**
 * Central Messaging API Routes
 * Base: /api/central-messaging/v1/
 * 
 * Unified messaging system for WhatsApp and Email
 * Supports: Coach, Staff, Admin
 * Features: Credits, Templates, Analytics, 24hr Window
 */

// ===== TEMPLATE VARIABLES =====

// @route   GET /api/central-messaging/v1/variables
// @desc    Get available template variables
// @access  Private (Coach/Staff/Admin)
router.get('/variables', 
    protect,
    centralMessagingController.getTemplateVariables
);

// @route   POST /api/central-messaging/v1/variables/preview
// @desc    Preview template with variables
// @access  Private (Coach/Staff/Admin)
router.post('/variables/preview',
    protect,
    centralMessagingController.previewTemplate
);

// ===== MESSAGE SENDING =====

// @route   POST /api/central-messaging/v1/send
// @desc    Send message (WhatsApp or Email)
// @access  Private (Coach/Staff/Admin)
// 
// Request Body (WhatsApp - Text Message):
// {
//   "to": "+1234567890",
//   "messageType": "whatsapp",
//   "type": "text",
//   "message": "Hello!",
//   "leadId": "optional_lead_id",
//   "clientId": "optional_client_id"
// }
//
// Request Body (WhatsApp - Template Message):
// {
//   "to": "+1234567890",
//   "messageType": "whatsapp",
//   "type": "template",
//   "templateName": "welcome_message",
//   "parameters": ["John", "Welcome"],
//   "leadId": "optional_lead_id",
//   "clientId": "optional_client_id"
// }
//
// Request Body (WhatsApp - Media Message):
// {
//   "to": "+1234567890",
//   "messageType": "whatsapp",
//   "type": "media",
//   "mediaUrl": "https://example.com/image.jpg",
//   "mediaType": "image",
//   "message": "Optional caption",
//   "leadId": "optional_lead_id",
//   "clientId": "optional_client_id"
// }
//
// Request Body (Email):
// {
//   "to": "user@example.com",
//   "messageType": "email",
//   "subject": "Subject",
//   "emailBody": "Body content"
// }
router.post('/send',
    protect,
    centralMessagingController.sendMessage
);

// ===== INBOX =====

// @route   GET /api/central-messaging/v1/inbox
// @desc    Get unified inbox (role-based access)
// @access  Private (Coach/Staff/Admin)
// 
// Query Parameters:
// - page: Page number (default: 1)
// - limit: Items per page (default: 20)
// - contact: Filter by contact phone/email
// - type: Filter by message type (whatsapp, email)
// - within24Hours: Filter contacts within 24hr window (true/false)
//
// Notes:
// - Admin sees all messages
// - Coach sees own messages
// - Staff sees only assigned leads
router.get('/inbox',
    protect,
    centralMessagingController.getUnifiedInbox
);

// ===== CONTACTS =====

// @route   GET /api/central-messaging/v1/contacts
// @desc    Get all contacts with 24hr window info
// @access  Private (Coach/Staff/Admin)
// 
// Query Parameters:
// - page: Page number (default: 1)
// - limit: Items per page (default: 20)
// - within24Hours: Filter by 24hr window (true/false)
//
// Response includes:
// - Contact info
// - Last message
// - Message count
// - 24hr window status
// - Window expiration
router.get('/contacts',
    protect,
    centralMessagingController.getContacts
);

// ===== ANALYTICS =====

// @route   GET /api/central-messaging/v1/analytics
// @desc    Get messaging analytics
// @access  Private (Coach/Staff/Admin)
// 
// Query Parameters:
// - startDate: Start date filter (ISO format)
// - endDate: End date filter (ISO format)
//
// Response includes:
// - WhatsApp stats (sent, total)
// - Email stats (sent, total)
// - Total credits used
// - Credits balance
// - User type
router.get('/analytics',
    protect,
    centralMessagingController.getAnalytics
);

// ===== TEMPLATE VARIABLES =====

// @route   GET /api/central-messaging/v1/templates/variables
// @desc    Get available variables for template creation (with selectable UI format)
// @access  Private (Coach/Admin)
router.get('/templates/variables',
    protect,
    centralMessagingTemplateController.getAvailableVariables
);

// ===== TEMPLATE MANAGEMENT =====

// @route   GET /api/central-messaging/v1/templates/my-templates
// @desc    Get templates available to coach (from subscription + own templates)
// @access  Private (Coach)
router.get('/templates/my-templates',
    protect,
    centralMessagingTemplateController.getMyTemplates
);

// @route   POST /api/central-messaging/v1/templates/create
// @desc    Create template (Admin or Coach) with variable selection
// @access  Private (Coach/Admin)
// 
// Request Body:
// {
//   "name": "appointment_reminder",
//   "description": "Reminder for upcoming appointment",
//   "type": "whatsapp",
//   "category": "reminder",
//   "content": {
//     "body": "Hi {{lead.name}}, your appointment with {{appointment.coachName}} is on {{appointment.dateTime}}"
//   },
//   "selectedVariables": ["lead.name", "appointment.date", "appointment.coachName"],
//   "isMetaTemplate": false
// }
router.post('/templates/create',
    protect,
    centralMessagingTemplateController.createTemplate
);

// @route   POST /api/central-messaging/v1/templates/preview
// @desc    Preview template with actual data
// @access  Private (Coach/Admin)
router.post('/templates/preview',
    protect,
    centralMessagingTemplateController.previewTemplate
);

// @route   GET /api/central-messaging/v1/templates/:templateId/check-usage
// @desc    Check if template can be used (24hr window check)
// @access  Private (Coach)
router.get('/templates/:templateId/check-usage',
    protect,
    centralMessagingTemplateController.checkTemplateUsage
);

// ===== ADMIN TEMPLATE DISTRIBUTION =====

// @route   POST /api/central-messaging/v1/templates/distribute
// @desc    Distribute template to specific subscriptions
// @access  Private (Admin)
router.post('/templates/distribute',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralMessagingTemplateController.distributeTemplate
);

// ===== LEGACY ROUTES (Keeping for backward compatibility) =====

// @route   GET /api/central-messaging/v1/templates
// @desc    Get templates (Meta + Local) - Legacy endpoint
router.get('/templates',
    protect,
    centralMessagingController.getTemplates
);

// @route   POST /api/central-messaging/v1/templates
// @desc    Create template - Legacy endpoint
router.post('/templates',
    protect,
    centralMessagingController.createTemplate
);

// ===== ADMIN ROUTES =====

// @route   GET /api/central-messaging/v1/admin/config
// @desc    Get messaging configuration
// @access  Private (Admin)
router.get('/admin/config',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralMessagingController.getConfig
);

// @route   PUT /api/central-messaging/v1/admin/config
// @desc    Update messaging configuration
// @access  Private (Admin)
router.put('/admin/config',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralMessagingController.updateConfig
);

// ===== CONVERSATION MANAGEMENT =====

// @route   GET /api/central-messaging/v1/conversation/:contactId
// @desc    Get conversation with contact
// @access  Private (Coach/Staff/Admin)
// 
// Query Parameters:
// - page: Page number (default: 1)
// - limit: Items per page (default: 50)
//
// Notes:
// - Returns all messages (WhatsApp + Email) for a contact
// - Role-based access enforced
router.get('/conversation/:contactId',
    protect,
    centralMessagingController.getConversation
);

// ===== BULK MESSAGING =====

// @route   POST /api/central-messaging/v1/bulk
// @desc    Send bulk messages
// @access  Private (Coach/Staff/Admin)
// 
// Request Body (WhatsApp - Text):
// {
//   "contacts": ["+1234567890", "+9876543210"],
//   "messageType": "whatsapp",
//   "type": "text",
//   "message": "Bulk message content"
// }
//
// Request Body (WhatsApp - Template):
// {
//   "contacts": ["+1234567890", "+9876543210"],
//   "messageType": "whatsapp",
//   "type": "template",
//   "templateName": "welcome_template",
//   "parameters": ["John", "Welcome"]
// }
//
// Request Body (WhatsApp - Media):
// {
//   "contacts": ["+1234567890", "+9876543210"],
//   "messageType": "whatsapp",
//   "type": "media",
//   "mediaUrl": "https://example.com/image.jpg",
//   "mediaType": "image",
//   "message": "Optional caption"
// }
//
// Request Body (Email):
// {
//   "recipients": ["user1@email.com", "user2@email.com"],
//   "messageType": "email",
//   "subject": "Subject",
//   "emailBody": "Body content"
// }
//
// Notes:
// - Deducts credits for each successful send
// - Returns results for each recipient
router.post('/bulk',
    protect,
    centralMessagingController.sendBulkMessages
);

// ===== COACH CREDITS MANAGEMENT =====

// @route   GET /api/central-messaging/v1/coach/credits/balance
// @desc    Get coach's credit balance from user schema
// @access  Private (Coach)
router.get('/coach/credits/balance',
    protect,
    authorizeCoach('coach'),
    require('../controllers/coachCreditsController').getCreditBalance
);

// @route   GET /api/central-messaging/v1/coach/credits/check
// @desc    Check if coach can send messages
// @access  Private (Coach)
router.get('/coach/credits/check',
    protect,
    authorizeCoach('coach'),
    require('../controllers/coachCreditsController').checkCanSendMessage
);

// @route   POST /api/central-messaging/v1/coach/credits/deduct
// @desc    Deduct credits after successful message send
// @access  Private (Coach)
router.post('/coach/credits/deduct',
    protect,
    authorizeCoach('coach'),
    require('../controllers/coachCreditsController').deductCredits
);

// @route   POST /api/central-messaging/v1/coach/credits/purchase
// @desc    Purchase credits with Razorpay
// @access  Private (Coach)
router.post('/coach/credits/purchase',
    protect,
    authorizeCoach('coach'),
    require('../controllers/coachCreditsController').purchaseCredits
);

// @route   POST /api/central-messaging/v1/coach/credits/verify-payment
// @desc    Verify credit purchase payment
// @access  Private (Coach)
router.post('/coach/credits/verify-payment',
    protect,
    authorizeCoach('coach'),
    require('../controllers/coachCreditsController').verifyCreditPayment
);

// @route   GET /api/central-messaging/v1/coach/credits/transactions
// @desc    Get credit transaction history
// @access  Private (Coach)
router.get('/coach/credits/transactions',
    protect,
    authorizeCoach('coach'),
    require('../controllers/coachCreditsController').getCreditTransactions
);

// ===== LEGACY CREDITS MANAGEMENT =====

// @route   GET /api/central-messaging/v1/credits/balance
// @desc    Get credit balance
// @access  Private (Coach/Staff)
router.get('/credits/balance',
    protect,
    centralMessagingController.getCreditBalance
);

// @route   GET /api/central-messaging/v1/credits/packages
// @desc    Get available credit packages
// @access  Public
router.get('/credits/packages',
    centralMessagingController.getCreditPackages
);

// @route   POST /api/central-messaging/v1/credits/purchase
// @desc    Purchase credits
// @access  Private (Coach/Staff)
router.post('/credits/purchase',
    protect,
    centralMessagingController.purchaseCredits
);

// @route   GET /api/central-messaging/v1/credits/transactions
// @desc    Get credit transaction history
// @access  Private (Coach/Staff)
router.get('/credits/transactions',
    protect,
    centralMessagingController.getCreditTransactions
);

// ===== EMAIL CONFIGURATION (Admin) =====

// @route   GET /api/central-messaging/v1/admin/email/config
// @desc    Get email configuration
// @access  Private (Admin)
router.get('/admin/email/config',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralMessagingController.getEmailConfig
);

// @route   POST /api/central-messaging/v1/admin/email/setup
// @desc    Setup email configuration
// @access  Private (Admin)
router.post('/admin/email/setup',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralMessagingController.setupEmail
);

// @route   POST /api/central-messaging/v1/admin/email/test
// @desc    Send test email
// @access  Private (Admin)
router.post('/admin/email/test',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralMessagingController.testEmail
);

// ===== WHATSAPP CONFIGURATION (Admin) =====

// @route   GET /api/central-messaging/v1/admin/whatsapp/config
// @desc    Get WhatsApp configuration
// @access  Private (Admin)
router.get('/admin/whatsapp/config',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralMessagingController.getWhatsAppConfig
);

// @route   POST /api/central-messaging/v1/admin/whatsapp/setup
// @desc    Setup WhatsApp configuration
// @access  Private (Admin)
router.post('/admin/whatsapp/setup',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralMessagingController.setupWhatsApp
);

// @route   POST /api/central-messaging/v1/admin/whatsapp/test
// @desc    Send test WhatsApp message
// @access  Private (Admin)
router.post('/admin/whatsapp/test',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralMessagingController.testWhatsApp
);

// @route   GET /api/central-messaging/v1/admin/whatsapp/templates
// @desc    Get Meta templates
// @access  Private (Admin)
router.get('/admin/whatsapp/templates',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralMessagingController.getMetaTemplates
);

// @route   POST /api/central-messaging/v1/admin/whatsapp/templates/sync
// @desc    Sync templates from Meta
// @access  Private (Admin)
router.post('/admin/whatsapp/templates/sync',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralMessagingController.syncMetaTemplates
);

// ===== STAFF ROUTES =====

// @route   GET /api/central-messaging/v1/staff/assigned-leads
// @desc    Get leads assigned to staff member
// @access  Private (Staff)
router.get('/staff/assigned-leads',
    protect,
    centralMessagingController.getAssignedLeads
);

// @route   GET /api/central-messaging/v1/staff/contacts
// @desc    Get contacts from assigned leads only
// @access  Private (Staff)
router.get('/staff/contacts',
    protect,
    centralMessagingController.getStaffContacts
);

// @route   GET /api/central-messaging/v1/staff/inbox
// @desc    Get inbox for staff (filtered by assigned leads)
// @access  Private (Staff)
router.get('/staff/inbox',
    protect,
    centralMessagingController.getStaffInbox
);

// ===== ADVANCED FEATURES =====

// @route   POST /api/central-messaging/v1/preview
// @desc    Preview message before sending
// @access  Private (Coach/Staff)
// 
// Request Body:
// {
//   "messageType": "whatsapp",
//   "type": "text",
//   "message": "Hello {{lead.name}}",
//   "leadId": "lead_id_here",
//   "variables": { "custom.var": "value" }
// }
router.post('/preview',
    protect,
    centralMessagingController.previewMessage
);

// @route   GET /api/central-messaging/v1/24hr-window
// @desc    Get contacts within Meta 24-hour window
// @access  Private (Coach/Staff/Admin)
router.get('/24hr-window',
    protect,
    centralMessagingController.get24HourWindowContacts
);

// ===== AUTOMATION INTEGRATION =====

// @route   POST /api/central-messaging/v1/automation/send
// @desc    Send message via automation
// @access  Private (System/Automation)
router.post('/automation/send',
    centralMessagingController.sendAutomationMessage
);

// @route   POST /api/central-messaging/v1/automation/webhook
// @desc    Handle automation webhook events
// @access  Private (System)
router.post('/automation/webhook',
    centralMessagingController.handleAutomationWebhook
);

// ===== ADMIN CENTRAL WHATSAPP ROUTES =====
// All admin routes use verifyAdminToken middleware

// @route   GET /api/central-messaging/v1/debug-auth
// @desc    Debug admin authentication
// @access  Private (Admin) - Uses verifyAdminToken only
router.get('/debug-auth',
    verifyAdminToken,
    (req, res) => {
        res.json({
            success: true,
            message: 'Admin authentication successful',
            data: {
                adminId: req.admin?.id,
                adminEmail: req.admin?.email,
                adminRole: req.admin?.role,
                adminPermissions: req.admin?.permissions,
                timestamp: new Date().toISOString()
            }
        });
    }
);

// @route   POST /api/central-messaging/v1/setup
// @desc    Setup Central WhatsApp Configuration
// @access  Private (Admin) - Uses verifyAdminToken
router.post('/setup',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.setupCentralWhatsApp
);

// @route   GET /api/central-messaging/v1/config
// @desc    Get Central WhatsApp Configuration
// @access  Private (Admin)
router.get('/config',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getCentralWhatsAppConfig
);

// @route   PUT /api/central-messaging/v1/config
// @desc    Update Central WhatsApp Configuration
// @access  Private (Admin)
router.put('/config',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.updateCentralWhatsAppConfig
);

// @route   GET /api/central-messaging/v1/health
// @desc    Health Check for Central WhatsApp
// @access  Private (Admin)
router.get('/health',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.healthCheck
);

// ===== TEMPLATE MANAGEMENT =====

// @route   POST /api/central-messaging/v1/templates
// @desc    Create WhatsApp Template
// @access  Private (Admin)
router.post('/templates',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.createTemplate
);

// @route   GET /api/central-messaging/v1/templates
// @desc    Get All Templates
// @access  Private (Admin)
router.get('/templates',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getTemplates
);

// @route   POST /api/central-messaging/v1/templates/sync
// @desc    Sync Templates from Meta
// @access  Private (Admin)
router.post('/templates/sync',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.syncTemplates
);

// ===== CONTACT MANAGEMENT =====

// @route   GET /api/central-messaging/v1/contacts
// @desc    Get Contacts
// @access  Private (Admin)
router.get('/contacts',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getContacts
);

// ===== TESTING =====

// @route   POST /api/central-messaging/v1/test-message
// @desc    Send Test Message
// @access  Private (Admin)
router.post('/test-message',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.sendTestMessage
);

// ===== MESSAGE MANAGEMENT =====

// @route   GET /api/central-messaging/v1/messages
// @desc    Get All WhatsApp Messages
// @access  Private (Admin)
router.get('/messages',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getAllMessages
);

// @route   GET /api/central-messaging/v1/messages/conversation/:conversationId
// @desc    Get Conversation Messages
// @access  Private (Admin)
router.get('/messages/conversation/:conversationId',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getConversationMessages
);

// @route   GET /api/central-messaging/v1/messages/coach/:coachId
// @desc    Get Messages by Coach
// @access  Private (Admin)
router.get('/messages/coach/:coachId',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getMessagesByCoach
);

// @route   GET /api/central-messaging/v1/messages/lead/:leadId
// @desc    Get Messages by Lead
// @access  Private (Admin)
router.get('/messages/lead/:leadId',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getMessagesByLead
);

// @route   GET /api/central-messaging/v1/test-config
// @desc    Test WhatsApp Configuration
// @access  Private (Admin)
router.get('/test-config',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.testConfiguration
);

// @route   GET /api/central-messaging/v1/analytics
// @desc    Get WhatsApp Analytics
// @access  Private (Admin)
router.get('/analytics',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getWhatsAppAnalytics
);

// @route   PUT /api/central-messaging/v1/contacts/update
// @desc    Update Contact Name
// @access  Private (Admin)
router.put('/contacts/update',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.updateContact
);

// Note: Bulk messages endpoint moved to /admin/send-bulk

// ===== CREDIT & SETTINGS MANAGEMENT =====

// @route   GET /api/central-messaging/v1/credit-settings
// @desc    Get Credit Rates and Settings
// @access  Private (Admin)
router.get('/credit-settings',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getCreditSettings
);

// @route   PUT /api/central-messaging/v1/credit-settings
// @desc    Update Credit Rates and Settings
// @access  Private (Admin)
router.put('/credit-settings',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.updateCreditSettings
);

// @route   GET /api/central-messaging/v1/settings-overview
// @desc    Get Complete Admin Settings Overview
// @access  Private (Admin)
router.get('/settings-overview',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getSettingsOverview
);

// ===== COACH WHATSAPP ROUTES =====
// All coach routes use protect middleware (coach authentication)

// @route   GET /api/central-messaging/v1/coach/whatsapp-templates
// @desc    Get All WhatsApp Templates for Coach (LIVE from Meta API using stored tokens)
// @access  Private (Coach)
router.get('/coach/whatsapp-templates',
    protect,
    async (req, res) => {
        try {
            console.log('🔄 [COACH_TEMPLATES] Fetching WhatsApp templates LIVE from Meta API...');
            
            // Fetch templates LIVE from Meta API using stored tokens
            const result = await centralWhatsAppService.getTemplatesFromMeta();
            
            // Filter for approved templates only for coaches
            const approvedTemplates = (result.templates || [])
                .filter(t => t.status === 'APPROVED');
            
            console.log('✅ [COACH_TEMPLATES] Found', approvedTemplates.length, 'approved templates from Meta');
            
            res.json({
                success: true,
                data: {
                    templates: approvedTemplates,
                    count: approvedTemplates.length,
                    summary: result.summary
                }
            });
        } catch (error) {
            console.error('❌ [COACH_TEMPLATES] Error:', error.message);
            res.status(500).json({
                success: false,
                message: 'Failed to get templates from Meta API',
                error: error.message
            });
        }
    }
);

// @route   GET /api/central-messaging/v1/coach/whatsapp-templates/all
// @desc    Get ALL WhatsApp Templates for Coach (including pending/rejected - for visibility)
// @access  Private (Coach)
router.get('/coach/whatsapp-templates/all',
    protect,
    async (req, res) => {
        try {
            console.log('🔄 [COACH_TEMPLATES] Fetching ALL WhatsApp templates from Meta API...');
            
            const result = await centralWhatsAppService.getTemplatesFromMeta();
            
            console.log('✅ [COACH_TEMPLATES] Found', result.templates?.length || 0, 'total templates');
            
            res.json({
                success: true,
                data: {
                    templates: result.templates || [],
                    count: result.templates?.length || 0,
                    summary: result.summary
                }
            });
        } catch (error) {
            console.error('❌ [COACH_TEMPLATES] Error:', error.message);
            res.status(500).json({
                success: false,
                message: 'Failed to get templates from Meta API',
                error: error.message
            });
        }
    }
);

// @route   GET /api/central-messaging/v1/templates
// @desc    Get Available Templates (Coach)
// @access  Private (Coach)
router.get('/templates',
    protect,
    authorizeCoach('coach'),
    centralWhatsAppController.getCoachTemplates
);

// @route   GET /api/central-messaging/v1/contacts
// @desc    Get Coach's Contacts
// @access  Private (Coach)
router.get('/contacts',
    protect,
    authorizeCoach('coach'),
    centralWhatsAppController.getCoachContacts
);

// @route   GET /api/central-messaging/v1/status
// @desc    Get Central WhatsApp Status (Coach)
// @access  Private (Coach)
router.get('/status',
    protect,
    authorizeCoach('coach'),
    centralWhatsAppController.getCoachStatus
);

// ===== WHATSAPP INBOX ROUTES =====
// These routes are accessible by Admin, Coach, and Staff

// @route   GET /api/central-messaging/v1/inbox
// @desc    Get inbox messages for user
// @access  Private (Admin/Coach/Staff)
router.get('/inbox',
    protect,
    whatsappInboxController.getInboxMessages
);

// @route   GET /api/central-messaging/v1/inbox/conversation/:conversationId
// @desc    Get conversation messages
// @access  Private (Admin/Coach/Staff)
router.get('/inbox/conversation/:conversationId',
    protect,
    whatsappInboxController.getConversationMessages
);

// @route   POST /api/central-messaging/v1/inbox/send
// @desc    Send message from inbox
// @access  Private (Admin/Coach/Staff)
router.post('/inbox/send',
    protect,
    whatsappInboxController.sendInboxMessage
);

// @route   PUT /api/central-messaging/v1/inbox/messages/:messageId/read
// @desc    Mark message as read
// @access  Private (Admin/Coach/Staff)
router.put('/inbox/messages/:messageId/read',
    protect,
    whatsappInboxController.markMessageAsRead
);

// @route   PUT /api/central-messaging/v1/inbox/messages/:messageId/assign
// @desc    Assign message to user
// @access  Private (Admin/Coach/Staff)
router.put('/inbox/messages/:messageId/assign',
    protect,
    whatsappInboxController.assignMessage
);

// @route   PUT /api/central-messaging/v1/inbox/messages/:messageId/archive
// @desc    Archive message
// @access  Private (Admin/Coach/Staff)
router.put('/inbox/messages/:messageId/archive',
    protect,
    whatsappInboxController.archiveMessage
);

// @route   GET /api/central-messaging/v1/inbox/stats
// @desc    Get inbox statistics
// @access  Private (Admin/Coach/Staff)
router.get('/inbox/stats',
    protect,
    whatsappInboxController.getInboxStats
);

// ===== AI KNOWLEDGE MANAGEMENT ROUTES =====
// These routes are Admin only

// @route   POST /api/central-messaging/v1/ai-knowledge
// @desc    Create AI Knowledge Base
// @access  Private (Admin)
router.post('/ai-knowledge',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAIKnowledgeController.createAIKnowledge
);

// @route   GET /api/central-messaging/v1/ai-knowledge
// @desc    Get all AI Knowledge Bases
// @access  Private (Admin)
router.get('/ai-knowledge',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAIKnowledgeController.getAIKnowledgeBases
);

// @route   GET /api/central-messaging/v1/ai-knowledge/:id
// @desc    Get single AI Knowledge Base
// @access  Private (Admin)
router.get('/ai-knowledge/:id',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAIKnowledgeController.getAIKnowledgeBase
);

// @route   PUT /api/central-messaging/v1/ai-knowledge/:id
// @desc    Update AI Knowledge Base
// @access  Private (Admin)
router.put('/ai-knowledge/:id',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAIKnowledgeController.updateAIKnowledgeBase
);

// @route   DELETE /api/central-messaging/v1/ai-knowledge/:id
// @desc    Delete AI Knowledge Base
// @access  Private (Admin)
router.delete('/ai-knowledge/:id',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAIKnowledgeController.deleteAIKnowledgeBase
);

// @route   PUT /api/central-messaging/v1/ai-knowledge/:id/set-default
// @desc    Set default AI Knowledge Base
// @access  Private (Admin)
router.put('/ai-knowledge/:id/set-default',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAIKnowledgeController.setDefaultAIKnowledgeBase
);

// @route   POST /api/central-messaging/v1/ai-knowledge/:id/test
// @desc    Test AI Knowledge Base
// @access  Private (Admin)
router.post('/ai-knowledge/:id/test',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAIKnowledgeController.testAIKnowledgeBase
);

// @route   GET /api/central-messaging/v1/ai-knowledge/:id/stats
// @desc    Get AI Knowledge Base statistics
// @access  Private (Admin)
router.get('/ai-knowledge/:id/stats',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAIKnowledgeController.getAIKnowledgeStats
);

// ===== WEBHOOK ROUTES =====

// @route   POST /api/central-messaging/v1/webhook
// @desc    Handle WhatsApp webhook from Meta
// @access  Public (Meta webhook)
router.post('/webhook',
    whatsappWebhookController.handleWebhook
);

// @route   GET /api/central-messaging/v1/webhook/status
// @desc    Get webhook status
// @access  Private (Admin)
router.get('/webhook/status',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappWebhookController.getWebhookStatus
);

// ===== COACH WHATSAPP SETTINGS ROUTES =====
// All coach routes use protect middleware

// @route   GET /api/central-messaging/v1/coach/settings
// @desc    Get coach's WhatsApp settings
// @access  Private (Coach)
router.get('/coach/settings',
    protect,
    authorizeCoach('coach'),
    whatsappCoachSettingsController.getCoachSettings
);

// @route   POST /api/central-messaging/v1/coach/settings
// @desc    Create or update coach's WhatsApp settings
// @access  Private (Coach)
router.post('/coach/settings',
    protect,
    authorizeCoach('coach'),
    whatsappCoachSettingsController.createOrUpdateCoachSettings
);

// @route   PUT /api/central-messaging/v1/coach/settings/customize
// @desc    Customize specific field in coach settings
// @access  Private (Coach)
router.put('/coach/settings/customize',
    protect,
    authorizeCoach('coach'),
    whatsappCoachSettingsController.customizeCoachField
);

// @route   DELETE /api/central-messaging/v1/coach/settings/customize/:fieldPath
// @desc    Remove customization for specific field
// @access  Private (Coach)
router.delete('/coach/settings/customize/:fieldPath',
    protect,
    authorizeCoach('coach'),
    whatsappCoachSettingsController.removeCoachCustomization
);

// @route   PUT /api/central-messaging/v1/coach/settings/set-default
// @desc    Set coach settings as default
// @access  Private (Coach)
router.put('/coach/settings/set-default',
    protect,
    authorizeCoach('coach'),
    whatsappCoachSettingsController.setCoachSettingsAsDefault
);

// @route   GET /api/central-messaging/v1/coach/settings/effective
// @desc    Get coach's effective settings (with inheritance applied)
// @access  Private (Coach)
router.get('/coach/settings/effective',
    protect,
    authorizeCoach('coach'),
    whatsappCoachSettingsController.getCoachEffectiveSettings
);

// @route   GET /api/central-messaging/v1/coach/email/config
// @desc    Get coach's email configuration status
// @access  Private (Coach)
router.get('/coach/email/config',
    protect,
    authorizeCoach('coach'),
    async (req, res) => {
        try {
            // For now, just return a basic email config status
            // In a real implementation, this would check coach-specific email settings
            res.status(200).json({
                success: true,
                data: {
                    emailSettings: {
                        isConfigured: true,
                        provider: 'system',
                        canSend: true
                    }
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get email config',
                error: error.message
            });
        }
    }
);

// @route   POST /api/central-messaging/v1/coach/settings/test-ai
// @desc    Test coach's AI settings
// @access  Private (Coach)
router.post('/coach/settings/test-ai',
    protect,
    authorizeCoach('coach'),
    whatsappCoachSettingsController.testCoachAISettings
);

// @route   GET /api/central-messaging/v1/coach/settings/analytics
// @desc    Get coach's WhatsApp analytics
// @access  Private (Coach)
router.get('/coach/settings/analytics',
    protect,
    authorizeCoach('coach'),
    whatsappCoachSettingsController.getCoachAnalytics
);

// @route   PUT /api/central-messaging/v1/coach/settings/reset
// @desc    Reset coach settings to inherit from parent
// @access  Private (Coach)
router.put('/coach/settings/reset',
    protect,
    authorizeCoach('coach'),
    whatsappCoachSettingsController.resetCoachSettings
);

// @route   POST /api/central-messaging/v1/coach/settings/clone
// @desc    Clone settings from another coach
// @access  Private (Coach)
router.post('/coach/settings/clone',
    protect,
    authorizeCoach('coach'),
    whatsappCoachSettingsController.cloneCoachSettings
);

// ===== ADMIN WHATSAPP SETTINGS ROUTES =====
// All admin routes use verifyAdminToken middleware

// @route   GET /api/central-messaging/v1/admin/email/config
// @desc    Get central email configuration
// @access  Private (Admin)
router.get('/admin/email/config',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    emailConfigController.getEmailConfig
);

// @route   POST /api/central-messaging/v1/admin/email/setup
// @desc    Setup central email configuration
// @access  Private (Admin)
router.post('/admin/email/setup',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    emailConfigController.setupEmailConfig
);

// @route   POST /api/central-messaging/v1/admin/email/test-config
// @desc    Test central email configuration
// @access  Private (Admin)
router.post('/admin/email/test-config',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    emailConfigController.testEmailConfig
);

// @route   GET /api/central-messaging/v1/admin/email/status
// @desc    Get central email status
// @access  Private (Admin)
router.get('/admin/email/status',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    emailConfigController.getEmailStatus
);

// @route   POST /api/central-messaging/v1/admin/email/send-test
// @desc    Send test email via central email system
// @access  Private (Admin)
router.post('/admin/email/send-test',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    emailConfigController.sendTestEmail
);

// @route   GET /api/central-messaging/v1/admin/settings
// @desc    Get all admin WhatsApp settings
// @access  Private (Admin)
router.get('/admin/settings',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.getAllAdminSettings
);

// @route   GET /api/central-messaging/v1/admin/settings/:id
// @desc    Get specific admin WhatsApp settings
// @access  Private (Admin)
router.get('/admin/settings/:id',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.getAdminSettings
);

// @route   GET /api/central-messaging/v1/admin/settings/default
// @desc    Get default admin WhatsApp settings
// @access  Private (Admin)
router.get('/admin/settings/default',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.getDefaultAdminSettings
);

// @route   POST /api/central-messaging/v1/admin/settings
// @desc    Create new admin WhatsApp settings
// @access  Private (Admin)
router.post('/admin/settings',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.createAdminSettings
);

// @route   PUT /api/central-messaging/v1/admin/settings/:id
// @desc    Update admin WhatsApp settings
// @access  Private (Admin)
router.put('/admin/settings/:id',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.updateAdminSettings
);

// @route   PUT /api/central-messaging/v1/admin/settings/:id/set-default
// @desc    Set admin settings as default
// @access  Private (Admin)
router.put('/admin/settings/:id/set-default',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.setAdminSettingsAsDefault
);

// @route   DELETE /api/central-messaging/v1/admin/settings/:id
// @desc    Delete admin WhatsApp settings
// @access  Private (Admin)
router.delete('/admin/settings/:id',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.deleteAdminSettings
);

// @route   POST /api/central-messaging/v1/admin/settings/:id/test-ai
// @desc    Test admin AI settings
// @access  Private (Admin)
router.post('/admin/settings/:id/test-ai',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.testAdminAISettings
);

// @route   GET /api/central-messaging/v1/admin/settings/analytics
// @desc    Get admin WhatsApp analytics
// @access  Private (Admin)
router.get('/admin/settings/analytics',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.getAdminAnalytics
);

// @route   POST /api/central-messaging/v1/admin/settings/:id/clone
// @desc    Clone admin settings
// @access  Private (Admin)
router.post('/admin/settings/:id/clone',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.cloneAdminSettings
);

// @route   POST /api/central-messaging/v1/admin/settings/:id/apply-to-coaches
// @desc    Apply settings to all coaches
// @access  Private (Admin)
router.post('/admin/settings/:id/apply-to-coaches',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.applySettingsToCoaches
);

// @route   GET /api/central-messaging/v1/admin/settings/usage-stats
// @desc    Get settings usage statistics
// @access  Private (Admin)
router.get('/admin/settings/usage-stats',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.getSettingsUsageStats
);

// ===== COACH MESSAGING ROUTES =====
// All routes use protect middleware for coach authentication

// @route   POST /api/central-messaging/v1/coach/send
// @desc    Send single message (text, template, or media)
// @access  Private (Coach)
// 
// Request Body (Text):
// {
//   "to": "+1234567890",
//   "message": "Hello!",
//   "leadId": "optional_lead_id",
//   "clientId": "optional_client_id"
// }
//
// Request Body (Template):
// {
//   "to": "+1234567890",
//   "templateId": "template_id_here",
//   "templateParameters": { "lead.name": "John" },
//   "leadId": "optional_lead_id",
//   "clientId": "optional_client_id"
// }
//
// Request Body (Media):
// {
//   "to": "+1234567890",
//   "mediaUrl": "https://example.com/image.jpg",
//   "mediaType": "image",
//   "caption": "Optional caption",
//   "leadId": "optional_lead_id",
//   "clientId": "optional_client_id"
// }
router.post('/coach/send', 
    protect, 
    authorizeCoach('coach'),
    messagingController.sendMessage
);

// @route   POST /api/central-messaging/v1/coach/send-bulk
// @desc    Send bulk messages to multiple contacts
// @access  Private (Coach)
// 
// Request Body:
// {
//   "contacts": [
//     { "phone": "+1234567890", "name": "John", "leadId": "optional" },
//     { "phone": "+9876543210", "name": "Jane", "leadId": "optional" }
//   ],
//   "message": "Bulk message text",
//   "templateId": "optional_template_id",
//   "templateParameters": { "lead.name": "John" },
//   "mediaUrl": "optional_media_url",
//   "mediaType": "optional_media_type",
//   "caption": "optional_caption",
//   "type": "text|template|media",
//   "delay": 1000
// }
router.post('/coach/send-bulk', 
    protect, 
    authorizeCoach('coach'),
    messagingController.sendBulkMessages
);

// @route   GET /api/central-messaging/v1/coach/contacts
// @desc    Get coach's contacts (leads only)
// @access  Private (Coach)
router.get('/coach/contacts', 
    protect, 
    authorizeCoach('coach'),
    noLogActivity, 
    contactController.getCoachContacts
);

// @route   GET /api/central-messaging/v1/coach/contacts/search
// @desc    Search contacts by name, phone, or email
// @access  Private (Coach)
router.get('/coach/contacts/search', 
    protect, 
    authorizeCoach('coach'),
    noLogActivity, 
    contactController.searchContacts
);

// @route   GET /api/central-messaging/v1/coach/templates
// @desc    Get available templates for coach
// @access  Private (Coach)
router.get('/coach/templates', 
    protect, 
    authorizeCoach('coach'),
    noLogActivity, 
    templateController.getCoachTemplates
);

// @route   GET /api/central-messaging/v1/coach/templates/:templateId/preview
// @desc    Preview template with sample data
// @access  Private (Coach)
router.get('/coach/templates/:templateId/preview', 
    protect, 
    authorizeCoach('coach'),
    noLogActivity, 
    templateController.previewTemplate
);

// @route   GET /api/central-messaging/v1/coach/templates/parameters
// @desc    Get available template parameters from database
// @access  Private (Coach)
router.get('/coach/templates/parameters', 
    protect, 
    authorizeCoach('coach'),
    noLogActivity, 
    templateController.getTemplateParameters
);

// @route   GET /api/central-messaging/v1/coach/inbox
// @desc    Get inbox messages for coach
// @access  Private (Coach)
router.get('/coach/inbox', 
    protect, 
    authorizeCoach('coach'),
    noLogActivity, 
    inboxController.getInboxMessages
);

// @route   GET /api/central-messaging/v1/coach/inbox/conversation/:contactId
// @desc    Get conversation with specific contact
// @access  Private (Coach)
router.get('/coach/inbox/conversation/:contactId', 
    protect, 
    authorizeCoach('coach'),
    noLogActivity, 
    inboxController.getConversation
);

// @route   POST /api/central-messaging/v1/coach/inbox/send
// @desc    Send message from inbox
// @access  Private (Coach)
router.post('/coach/inbox/send', 
    protect, 
    authorizeCoach('coach'),
    inboxController.sendInboxMessage
);

// @route   PUT /api/central-messaging/v1/coach/inbox/messages/:messageId/read
// @desc    Mark message as read
// @access  Private (Coach)
router.put('/coach/inbox/messages/:messageId/read', 
    protect, 
    authorizeCoach('coach'),
    inboxController.markAsRead
);

// @route   GET /api/central-messaging/v1/coach/stats
// @desc    Get messaging statistics for coach
// @access  Private (Coach)
router.get('/coach/stats', 
    protect, 
    authorizeCoach('coach'),
    noLogActivity, 
    messagingController.getMessagingStats
);

// ===== ADMIN MESSAGING ROUTES =====
// All routes use verifyAdminToken middleware for admin authentication

// @route   GET /api/central-messaging/v1/admin/contacts
// @desc    Get all contacts across all coaches
// @access  Private (Admin)
router.get('/admin/contacts', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    noLogActivity, 
    contactController.getAllContacts
);

// @route   GET /api/central-messaging/v1/admin/contacts/search
// @desc    Search all contacts by name, phone, or email
// @access  Private (Admin)
router.get('/admin/contacts/search', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    noLogActivity, 
    contactController.searchAllContacts
);

// @route   POST /api/central-messaging/v1/admin/send
// @desc    Send message as admin to any contact
// @access  Private (Admin)
// 
// Request Body (Text):
// {
//   "to": "+1234567890",
//   "message": "Hello!",
//   "leadId": "optional_lead_id",
//   "clientId": "optional_client_id",
//   "coachId": "optional_coach_id"
// }
//
// Request Body (Template):
// {
//   "to": "+1234567890",
//   "templateId": "template_id_here",
//   "templateParameters": { "lead.name": "John" },
//   "leadId": "optional_lead_id",
//   "clientId": "optional_client_id",
//   "coachId": "optional_coach_id"
// }
//
// Request Body (Media):
// {
//   "to": "+1234567890",
//   "mediaUrl": "https://example.com/image.jpg",
//   "mediaType": "image",
//   "caption": "Optional caption",
//   "leadId": "optional_lead_id",
//   "clientId": "optional_client_id",
//   "coachId": "optional_coach_id"
// }
router.post('/admin/send', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    messagingController.sendAdminMessage
);

// @route   POST /api/central-messaging/v1/admin/send-bulk
// @desc    Send bulk messages as admin
// @access  Private (Admin)
// 
// Request Body:
// {
//   "contacts": [
//     { "phone": "+1234567890", "name": "John", "leadId": "optional" },
//     { "phone": "+9876543210", "name": "Jane", "leadId": "optional" }
//   ],
//   "message": "Bulk message text",
//   "templateId": "optional_template_id",
//   "templateParameters": { "lead.name": "John" },
//   "mediaUrl": "optional_media_url",
//   "mediaType": "optional_media_type",
//   "caption": "optional_caption",
//   "type": "text|template|media",
//   "delay": 1000
// }
router.post('/admin/send-bulk', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    messagingController.sendAdminBulkMessages
);

// @route   GET /api/central-messaging/v1/admin/templates
// @desc    Get all templates across all coaches
// @access  Private (Admin)
router.get('/admin/templates', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    noLogActivity, 
    templateController.getAllTemplates
);

// @route   POST /api/central-messaging/v1/admin/templates
// @desc    Create global template
// @access  Private (Admin)
router.post('/admin/templates', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    templateController.createGlobalTemplate
);

// @route   PUT /api/central-messaging/v1/admin/templates/:templateId
// @desc    Update global template
// @access  Private (Admin)
router.put('/admin/templates/:templateId', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    templateController.updateGlobalTemplate
);

// @route   DELETE /api/central-messaging/v1/admin/templates/:templateId
// @desc    Delete global template
// @access  Private (Admin)
router.delete('/admin/templates/:templateId', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    templateController.deleteGlobalTemplate
);

// @route   GET /api/central-messaging/v1/admin/inbox
// @desc    Get all inbox messages across coaches
// @access  Private (Admin)
router.get('/admin/inbox', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    noLogActivity, 
    inboxController.getAllInboxMessages
);

// @route   GET /api/central-messaging/v1/admin/inbox/conversation/:contactId
// @desc    Get conversation with specific contact (admin view)
// @access  Private (Admin)
router.get('/admin/inbox/conversation/:contactId', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    noLogActivity, 
    inboxController.getAdminConversation
);

// @route   GET /api/central-messaging/v1/admin/stats
// @desc    Get system-wide messaging statistics
// @access  Private (Admin)
router.get('/admin/stats', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    noLogActivity, 
    messagingController.getAdminMessagingStats
);

// @route   GET /api/central-messaging/v1/admin/coaches/:coachId/messages
// @desc    Get messages for specific coach
// @access  Private (Admin)
router.get('/admin/coaches/:coachId/messages', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    noLogActivity, 
    messagingController.getCoachMessages
);

// ===== DEVICE MANAGEMENT ROUTES =====
// Device management for coaches

// @route   GET /api/central-messaging/v1/debug/qr-setup/:deviceId
// @desc    Debug QR setup page
// @access  Public (for debugging)
router.get('/debug/qr-setup/:deviceId', 
    noLogActivity, 
    unifiedMessagingController.debugQRSetup
);

// @route   POST /api/central-messaging/v1/coach/devices
// @desc    Create a new WhatsApp device
// @access  Private (Coach)
router.post('/coach/devices', 
    protect, 
    authorizeCoach('coach'),
    unifiedMessagingController.createWhatsAppDevice
);

// @route   GET /api/central-messaging/v1/coach/devices
// @desc    Get all WhatsApp devices for coach
// @access  Private (Coach)
router.get('/coach/devices', 
    protect, 
    authorizeCoach('coach'),
    noLogActivity, 
    unifiedMessagingController.getCoachWhatsAppDevices
);

// @route   PUT /api/central-messaging/v1/coach/devices/:deviceId
// @desc    Update WhatsApp device
// @access  Private (Coach)
router.put('/coach/devices/:deviceId', 
    protect, 
    authorizeCoach('coach'),
    unifiedMessagingController.updateWhatsAppDevice
);

// @route   DELETE /api/central-messaging/v1/coach/devices/:deviceId
// @desc    Delete WhatsApp device
// @access  Private (Coach)
router.delete('/coach/devices/:deviceId', 
    protect, 
    authorizeCoach('coach'),
    unifiedMessagingController.deleteWhatsAppDevice
);

// @route   GET /api/central-messaging/v1/coach/devices/:deviceId/status
// @desc    Get device status
// @access  Private (Coach)
router.get('/coach/devices/:deviceId/status', 
    protect, 
    authorizeCoach('coach'),
    noLogActivity, 
    unifiedMessagingController.getDeviceStatus
);

// @route   POST /api/central-messaging/v1/coach/devices/:deviceId/switch
// @desc    Switch WhatsApp device
// @access  Private (Coach)
router.post('/coach/devices/:deviceId/switch', 
    protect, 
    authorizeCoach('coach'),
    unifiedMessagingController.switchWhatsAppDevice
);

// ===== ADMIN DEVICE & SYSTEM ROUTES =====

// @route   GET /api/central-messaging/v1/admin/overview
// @desc    Get unified messaging system overview
// @access  Private (Admin)
router.get('/admin/overview', 
    verifyAdminToken, 
    requirePermission('systemSettings'), 
    noLogActivity, 
    unifiedMessagingAdminController.getSystemOverview
);

// @route   GET /api/central-messaging/v1/admin/devices
// @desc    Get all WhatsApp devices across coaches
// @access  Private (Admin)
router.get('/admin/devices', 
    verifyAdminToken, 
    requirePermission('systemSettings'), 
    noLogActivity, 
    unifiedMessagingAdminController.getAllDevices
);

// @route   GET /api/central-messaging/v1/admin/messages
// @desc    Get all messages across coaches
// @access  Private (Admin)
router.get('/admin/messages', 
    verifyAdminToken, 
    requirePermission('systemSettings'), 
    noLogActivity, 
    unifiedMessagingAdminController.getAllMessages
);

// @route   GET /api/central-messaging/v1/admin/coaches/:coachId/messages
// @desc    Get messages for specific coach
// @access  Private (Admin)
router.get('/admin/coaches/:coachId/messages', 
    verifyAdminToken, 
    requirePermission('systemSettings'), 
    noLogActivity, 
    unifiedMessagingAdminController.getCoachMessages
);

// @route   POST /api/central-messaging/v1/admin/broadcast
// @desc    Send broadcast message to multiple coaches
// @access  Private (Admin)
router.post('/admin/broadcast', 
    verifyAdminToken, 
    requirePermission('systemSettings'), 
    unifiedMessagingAdminController.sendBroadcastMessage
);

// @route   PUT /api/central-messaging/v1/admin/credit-rates
// @desc    Update credit rates for messaging
// @access  Private (Admin)
router.put('/admin/credit-rates', 
    verifyAdminToken, 
    requirePermission('systemSettings'), 
    unifiedMessagingAdminController.updateCreditRates
);

// ===== CREDIT MANAGEMENT ENDPOINTS =====

// @route   GET /api/central-messaging/v1/credits/balance
// @desc    Get coach's credit balance
// @access  Private (Coach)
router.get('/credits/balance', protect, authorizeCoach('coach'), whatsappCreditController.getCreditBalance);

// @route   GET /api/central-messaging/v1/credits/check
// @desc    Check if user can send messages
// @access  Private (Coach)
router.get('/credits/check', protect, authorizeCoach('coach'), whatsappCreditController.checkCanSendMessage);

// @route   GET /api/central-messaging/v1/credits/packages
// @desc    Get available credit packages
// @access  Public
router.get('/credits/packages', whatsappCreditController.getCreditPackages);

// @route   POST /api/central-messaging/v1/credits/purchase
// @desc    Purchase credits
// @access  Private (Coach)
router.post('/credits/purchase', protect, authorizeCoach('coach'), whatsappCreditController.purchaseCredits);

// @route   GET /api/central-messaging/v1/credits/transactions
// @desc    Get credit transactions
// @access  Private (Coach)
router.get('/credits/transactions', protect, authorizeCoach('coach'), whatsappCreditController.getCreditTransactions);

// @route   GET /api/central-messaging/v1/admin/credit-rates
// @desc    Get system credit rates
// @access  Private (Admin)
router.get('/admin/credit-rates', 
    verifyAdminToken, 
    requirePermission('systemSettings'), 
    whatsappCreditController.getSystemCreditRates
);

// ===== MESSAGE TEMPLATES MANAGEMENT =====

// @route   POST /api/central-messaging/v1/templates/message-templates
// @desc    Create message template
// @access  Private (Coach)
router.post('/templates/message-templates',
    protect,
    requirePermission('messaging'),
    messageTemplateController.createTemplate
);

// @route   GET /api/central-messaging/v1/templates/message-templates
// @desc    Get coach message templates
// @access  Private (Coach)
router.get('/templates/message-templates',
    protect,
    requirePermission('messaging'),
    messageTemplateController.getCoachTemplates
);

// @route   GET /api/central-messaging/v1/templates/message-templates/pre-built
// @desc    Get pre-built templates
// @access  Private (Coach)
router.get('/templates/message-templates/pre-built',
    protect,
    requirePermission('messaging'),
    messageTemplateController.getPreBuiltTemplates
);

// @route   GET /api/central-messaging/v1/templates/message-templates/categories
// @desc    Get template categories
// @access  Private (Coach)
router.get('/templates/message-templates/categories',
    protect,
    requirePermission('messaging'),
    messageTemplateController.getTemplateCategories
);

// @route   GET /api/central-messaging/v1/templates/message-templates/types
// @desc    Get template types
// @access  Private (Coach)
router.get('/templates/message-templates/types',
    protect,
    requirePermission('messaging'),
    messageTemplateController.getTemplateTypes
);

// @route   GET /api/central-messaging/v1/templates/message-templates/variables
// @desc    Get common template variables
// @access  Private (Coach)
router.get('/templates/message-templates/variables',
    protect,
    requirePermission('messaging'),
    messageTemplateController.getCommonVariables
);

// @route   POST /api/central-messaging/v1/templates/message-templates/seed
// @desc    Seed pre-built templates
// @access  Private (Coach)
router.post('/templates/message-templates/seed',
    protect,
    requirePermission('messaging'),
    messageTemplateController.seedPreBuiltTemplates
);

// @route   GET /api/central-messaging/v1/templates/message-templates/:id
// @desc    Get specific template
// @access  Private (Coach)
router.get('/templates/message-templates/:id',
    protect,
    requirePermission('messaging'),
    messageTemplateController.getTemplateById
);

// @route   PUT /api/central-messaging/v1/templates/message-templates/:id
// @desc    Update message template
// @access  Private (Coach)
router.put('/templates/message-templates/:id',
    protect,
    requirePermission('messaging'),
    messageTemplateController.updateTemplate
);

// @route   DELETE /api/central-messaging/v1/templates/message-templates/:id
// @desc    Delete message template
// @access  Private (Coach)
router.delete('/templates/message-templates/:id',
    protect,
    requirePermission('messaging'),
    messageTemplateController.deleteTemplate
);

// @route   POST /api/central-messaging/v1/templates/message-templates/:id/duplicate
// @desc    Duplicate template
// @access  Private (Coach)
router.post('/templates/message-templates/:id/duplicate',
    protect,
    requirePermission('messaging'),
    messageTemplateController.duplicateTemplate
);

// @route   POST /api/central-messaging/v1/templates/message-templates/:id/render
// @desc    Render template with variables
// @access  Private (Coach)
router.post('/templates/message-templates/:id/render',
    protect,
    requirePermission('messaging'),
    messageTemplateController.renderTemplate
);

// ===== ADVANCED FEATURES =====

// @route   GET /api/central-messaging/v1/parameter-options
// @desc    Get available parameters for template assignment
// @access  Private (Coach/Staff/Admin)
router.get('/parameter-options',
    protect,
    authorizeStaff('staff', 'coach'),
    noLogActivity,
    unifiedMessagingController.getParameterOptions
);

// @route   GET /api/central-messaging/v1/admin/queue-stats
// @desc    Get RabbitMQ queue statistics
// @access  Private (Admin only)
router.get('/admin/queue-stats',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    noLogActivity,
    unifiedMessagingController.getQueueStats
);

// ===== MESSAGING V3 ROUTES (Enhanced Version) =====
// This will be moved to a separate file: messagingV3Routes.js

module.exports = router;

