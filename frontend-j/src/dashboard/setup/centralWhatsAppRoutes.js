const express = require('express');
const router = express.Router();

// Import controllers
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

// Import middleware
const { verifyAdminToken, noLogActivity } = require('../middleware/adminAuth');
const { protect, authorizeCoach, authorizeStaff } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissionMiddleware');

// ===== ADMIN CENTRAL WHATSAPP ROUTES =====
// These routes are mounted at /api/admin/central-whatsapp
// All admin routes use verifyAdminToken middleware

// @route   GET /api/admin/central-whatsapp/debug-auth
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

// @route   POST /api/admin/central-whatsapp/setup
// @desc    Setup Central WhatsApp Configuration
// @access  Private (Admin) - Uses verifyAdminToken
router.post('/setup',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.setupCentralWhatsApp
);

// @route   GET /api/admin/central-whatsapp/config
// @desc    Get Central WhatsApp Configuration
// @access  Private (Admin)
router.get('/config',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getCentralWhatsAppConfig
);

// @route   PUT /api/admin/central-whatsapp/config
// @desc    Update Central WhatsApp Configuration
// @access  Private (Admin)
router.put('/config',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.updateCentralWhatsAppConfig
);

// @route   GET /api/admin/central-whatsapp/health
// @desc    Health Check for Central WhatsApp
// @access  Private (Admin)
router.get('/health',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.healthCheck
);

// ===== TEMPLATE MANAGEMENT =====

// @route   POST /api/admin/central-whatsapp/templates
// @desc    Create WhatsApp Template
// @access  Private (Admin)
router.post('/templates',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.createTemplate
);

// @route   GET /api/admin/central-whatsapp/templates
// @desc    Get All Templates
// @access  Private (Admin)
router.get('/templates',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getTemplates
);

// @route   POST /api/admin/central-whatsapp/templates/sync
// @desc    Sync Templates from Meta
// @access  Private (Admin)
router.post('/templates/sync',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.syncTemplates
);

// ===== CONTACT MANAGEMENT =====

// @route   GET /api/admin/central-whatsapp/contacts
// @desc    Get Contacts
// @access  Private (Admin)
router.get('/contacts',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getContacts
);

// ===== TESTING =====

// @route   POST /api/admin/central-whatsapp/test-message
// @desc    Send Test Message
// @access  Private (Admin)
router.post('/test-message',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.sendTestMessage
);

// ===== MESSAGE MANAGEMENT =====

// @route   GET /api/admin/central-whatsapp/messages
// @desc    Get All WhatsApp Messages
// @access  Private (Admin)
router.get('/messages',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getAllMessages
);

// @route   GET /api/admin/central-whatsapp/messages/conversation/:conversationId
// @desc    Get Conversation Messages
// @access  Private (Admin)
router.get('/messages/conversation/:conversationId',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getConversationMessages
);

// @route   GET /api/admin/central-whatsapp/messages/coach/:coachId
// @desc    Get Messages by Coach
// @access  Private (Admin)
router.get('/messages/coach/:coachId',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getMessagesByCoach
);

// @route   GET /api/admin/central-whatsapp/messages/lead/:leadId
// @desc    Get Messages by Lead
// @access  Private (Admin)
router.get('/messages/lead/:leadId',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getMessagesByLead
);

// @route   POST /api/admin/central-whatsapp/send-message
// @desc    Send Message as Admin
// @access  Private (Admin)
router.post('/send-message',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.sendAdminMessage
);

// @route   GET /api/whatsapp/v1/test-config
// @desc    Test WhatsApp Configuration
// @access  Private (Admin)
router.get('/test-config',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.testConfiguration
);

// ===== WHATSAPP V1 ADMIN ROUTES =====
// These routes are mounted at /api/whatsapp/v1 for admin access

// @route   GET /api/whatsapp/v1/config
// @desc    Get Central WhatsApp Configuration
// @access  Private (Admin)
router.get('/config',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getCentralWhatsAppConfig
);

// @route   POST /api/whatsapp/v1/setup
// @desc    Setup Central WhatsApp
// @access  Private (Admin)
router.post('/setup',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.setupCentralWhatsApp
);

// @route   GET /api/whatsapp/v1/templates
// @desc    Get All Templates
// @access  Private (Admin)
router.get('/templates',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getTemplates
);

// @route   GET /api/whatsapp/v1/contacts
// @desc    Get Contacts
// @access  Private (Admin)
router.get('/contacts',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getContacts
);

// @route   GET /api/whatsapp/v1/analytics
// @desc    Get WhatsApp Analytics
// @access  Private (Admin)
router.get('/analytics',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getWhatsAppAnalytics
);

// @route   GET /api/whatsapp/v1/messages
// @desc    Get All WhatsApp Messages
// @access  Private (Admin)
router.get('/messages',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getAllMessages
);

// @route   POST /api/whatsapp/v1/send-message
// @desc    Send Message as Admin
// @access  Private (Admin)
router.post('/send-message',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.sendAdminMessage
);

// @route   POST /api/whatsapp/v1/test-message
// @desc    Send Test Message
// @access  Private (Admin)
router.post('/test-message',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.sendTestMessage
);

// @route   PUT /api/whatsapp/v1/contacts/update
// @desc    Update Contact Name
// @access  Private (Admin)
router.put('/contacts/update',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.updateContact
);

// @route   POST /api/whatsapp/v1/send-bulk-messages
// @desc    Send Bulk Messages
// @access  Private (Admin)
router.post('/send-bulk-messages',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.sendBulkMessages
);

// @route   GET /api/admin/central-whatsapp/analytics
// @desc    Get WhatsApp Analytics
// @access  Private (Admin)
router.get('/analytics',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getWhatsAppAnalytics
);

// ===== CREDIT & SETTINGS MANAGEMENT =====

// @route   GET /api/admin/central-whatsapp/credit-settings
// @desc    Get Credit Rates and Settings
// @access  Private (Admin)
router.get('/credit-settings',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getCreditSettings
);

// @route   PUT /api/admin/central-whatsapp/credit-settings
// @desc    Update Credit Rates and Settings
// @access  Private (Admin)
router.put('/credit-settings',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.updateCreditSettings
);

// @route   GET /api/admin/central-whatsapp/settings-overview
// @desc    Get Complete Admin Settings Overview
// @access  Private (Admin)
router.get('/settings-overview',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getSettingsOverview
);

// ===== COACH WHATSAPP ROUTES =====
// These routes are mounted at /api/centralwhatsapp
// All coach routes use protect middleware (coach authentication)

// @route   POST /api/centralwhatsapp/send-message
// @desc    Send WhatsApp Message (Coach)
// @access  Private (Coach) - Uses protect middleware
router.post('/send-message',
    protect,
    authorizeCoach('coach'),
    centralWhatsAppController.sendCoachMessage
);

// @route   GET /api/centralwhatsapp/templates
// @desc    Get Available Templates (Coach)
// @access  Private (Coach)
router.get('/templates',
    protect,
    authorizeCoach('coach'),
    centralWhatsAppController.getCoachTemplates
);

// @route   GET /api/centralwhatsapp/contacts
// @desc    Get Coach's Contacts
// @access  Private (Coach)
router.get('/contacts',
    protect,
    authorizeCoach('coach'),
    centralWhatsAppController.getCoachContacts
);

// @route   GET /api/centralwhatsapp/status
// @desc    Get Central WhatsApp Status (Coach)
// @access  Private (Coach)
router.get('/status',
    protect,
    authorizeCoach('coach'),
    centralWhatsAppController.getCoachStatus
);

// ===== WHATSAPP INBOX ROUTES =====
// These routes are accessible by Admin, Coach, and Staff

// @route   GET /api/whatsapp/v1/inbox
// @desc    Get inbox messages for user
// @access  Private (Admin/Coach/Staff)
router.get('/inbox',
    protect,
    whatsappInboxController.getInboxMessages
);

// @route   GET /api/whatsapp/v1/inbox/conversation/:conversationId
// @desc    Get conversation messages
// @access  Private (Admin/Coach/Staff)
router.get('/inbox/conversation/:conversationId',
    protect,
    whatsappInboxController.getConversationMessages
);

// @route   POST /api/whatsapp/v1/inbox/send
// @desc    Send message from inbox
// @access  Private (Admin/Coach/Staff)
router.post('/inbox/send',
    protect,
    whatsappInboxController.sendInboxMessage
);

// @route   PUT /api/whatsapp/v1/inbox/messages/:messageId/read
// @desc    Mark message as read
// @access  Private (Admin/Coach/Staff)
router.put('/inbox/messages/:messageId/read',
    protect,
    whatsappInboxController.markMessageAsRead
);

// @route   PUT /api/whatsapp/v1/inbox/messages/:messageId/assign
// @desc    Assign message to user
// @access  Private (Admin/Coach/Staff)
router.put('/inbox/messages/:messageId/assign',
    protect,
    whatsappInboxController.assignMessage
);

// @route   PUT /api/whatsapp/v1/inbox/messages/:messageId/archive
// @desc    Archive message
// @access  Private (Admin/Coach/Staff)
router.put('/inbox/messages/:messageId/archive',
    protect,
    whatsappInboxController.archiveMessage
);

// @route   GET /api/whatsapp/v1/inbox/stats
// @desc    Get inbox statistics
// @access  Private (Admin/Coach/Staff)
router.get('/inbox/stats',
    protect,
    whatsappInboxController.getInboxStats
);

// ===== AI KNOWLEDGE MANAGEMENT ROUTES =====
// These routes are Admin only

// @route   POST /api/whatsapp/v1/ai-knowledge
// @desc    Create AI Knowledge Base
// @access  Private (Admin)
router.post('/ai-knowledge',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAIKnowledgeController.createAIKnowledge
);

// @route   GET /api/whatsapp/v1/ai-knowledge
// @desc    Get all AI Knowledge Bases
// @access  Private (Admin)
router.get('/ai-knowledge',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAIKnowledgeController.getAIKnowledgeBases
);

// @route   GET /api/whatsapp/v1/ai-knowledge/:id
// @desc    Get single AI Knowledge Base
// @access  Private (Admin)
router.get('/ai-knowledge/:id',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAIKnowledgeController.getAIKnowledgeBase
);

// @route   PUT /api/whatsapp/v1/ai-knowledge/:id
// @desc    Update AI Knowledge Base
// @access  Private (Admin)
router.put('/ai-knowledge/:id',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAIKnowledgeController.updateAIKnowledgeBase
);

// @route   DELETE /api/whatsapp/v1/ai-knowledge/:id
// @desc    Delete AI Knowledge Base
// @access  Private (Admin)
router.delete('/ai-knowledge/:id',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAIKnowledgeController.deleteAIKnowledgeBase
);

// @route   PUT /api/whatsapp/v1/ai-knowledge/:id/set-default
// @desc    Set default AI Knowledge Base
// @access  Private (Admin)
router.put('/ai-knowledge/:id/set-default',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAIKnowledgeController.setDefaultAIKnowledgeBase
);

// @route   POST /api/whatsapp/v1/ai-knowledge/:id/test
// @desc    Test AI Knowledge Base
// @access  Private (Admin)
router.post('/ai-knowledge/:id/test',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAIKnowledgeController.testAIKnowledgeBase
);

// @route   GET /api/whatsapp/v1/ai-knowledge/:id/stats
// @desc    Get AI Knowledge Base statistics
// @access  Private (Admin)
router.get('/ai-knowledge/:id/stats',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAIKnowledgeController.getAIKnowledgeStats
);

// ===== WEBHOOK ROUTES =====

// @route   POST /api/whatsapp/v1/webhook
// @desc    Handle WhatsApp webhook from Meta
// @access  Public (Meta webhook)
router.post('/webhook',
    whatsappWebhookController.handleWebhook
);

// @route   GET /api/whatsapp/v1/webhook/status
// @desc    Get webhook status
// @access  Private (Admin)
router.get('/webhook/status',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappWebhookController.getWebhookStatus
);

// ===== COACH WHATSAPP SETTINGS ROUTES =====
// These routes are mounted at /api/whatsapp/v1/coach/settings
// All coach routes use protect middleware

// @route   GET /api/whatsapp/v1/coach/settings
// @desc    Get coach's WhatsApp settings
// @access  Private (Coach)
router.get('/coach/settings',
    protect,
    authorizeCoach('coach'),
    whatsappCoachSettingsController.getCoachSettings
);

// @route   POST /api/whatsapp/v1/coach/settings
// @desc    Create or update coach's WhatsApp settings
// @access  Private (Coach)
router.post('/coach/settings',
    protect,
    authorizeCoach('coach'),
    whatsappCoachSettingsController.createOrUpdateCoachSettings
);

// @route   PUT /api/whatsapp/v1/coach/settings/customize
// @desc    Customize specific field in coach settings
// @access  Private (Coach)
router.put('/coach/settings/customize',
    protect,
    authorizeCoach('coach'),
    whatsappCoachSettingsController.customizeCoachField
);

// @route   DELETE /api/whatsapp/v1/coach/settings/customize/:fieldPath
// @desc    Remove customization for specific field
// @access  Private (Coach)
router.delete('/coach/settings/customize/:fieldPath',
    protect,
    authorizeCoach('coach'),
    whatsappCoachSettingsController.removeCoachCustomization
);

// @route   PUT /api/whatsapp/v1/coach/settings/set-default
// @desc    Set coach settings as default
// @access  Private (Coach)
router.put('/coach/settings/set-default',
    protect,
    authorizeCoach('coach'),
    whatsappCoachSettingsController.setCoachSettingsAsDefault
);

// @route   GET /api/whatsapp/v1/coach/settings/effective
// @desc    Get coach's effective settings (with inheritance applied)
// @access  Private (Coach)
router.get('/coach/settings/effective',
    protect,
    authorizeCoach('coach'),
    whatsappCoachSettingsController.getCoachEffectiveSettings
);

// @route   POST /api/whatsapp/v1/coach/settings/test-ai
// @desc    Test coach's AI settings
// @access  Private (Coach)
router.post('/coach/settings/test-ai',
    protect,
    authorizeCoach('coach'),
    whatsappCoachSettingsController.testCoachAISettings
);

// @route   GET /api/whatsapp/v1/coach/settings/analytics
// @desc    Get coach's WhatsApp analytics
// @access  Private (Coach)
router.get('/coach/settings/analytics',
    protect,
    authorizeCoach('coach'),
    whatsappCoachSettingsController.getCoachAnalytics
);

// @route   PUT /api/whatsapp/v1/coach/settings/reset
// @desc    Reset coach settings to inherit from parent
// @access  Private (Coach)
router.put('/coach/settings/reset',
    protect,
    authorizeCoach('coach'),
    whatsappCoachSettingsController.resetCoachSettings
);

// @route   POST /api/whatsapp/v1/coach/settings/clone
// @desc    Clone settings from another coach
// @access  Private (Coach)
router.post('/coach/settings/clone',
    protect,
    authorizeCoach('coach'),
    whatsappCoachSettingsController.cloneCoachSettings
);

// ===== ADMIN WHATSAPP SETTINGS ROUTES =====
// These routes are mounted at /api/whatsapp/v1/admin/settings
// All admin routes use verifyAdminToken middleware

// ===== CENTRAL EMAIL CONFIGURATION =====
// Email routes must be defined before other /admin/* routes to avoid conflicts

// @route   GET /api/whatsapp/v1/admin/email/config
// @desc    Get central email configuration
// @access  Private (Admin)
router.get('/admin/email/config',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    emailConfigController.getEmailConfig
);

// @route   POST /api/whatsapp/v1/admin/email/setup
// @desc    Setup central email configuration
// @access  Private (Admin)
router.post('/admin/email/setup',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    emailConfigController.setupEmailConfig
);

// @route   POST /api/whatsapp/v1/admin/email/test-config
// @desc    Test central email configuration
// @access  Private (Admin)
router.post('/admin/email/test-config',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    emailConfigController.testEmailConfig
);

// @route   GET /api/whatsapp/v1/admin/email/status
// @desc    Get central email status
// @access  Private (Admin)
router.get('/admin/email/status',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    emailConfigController.getEmailStatus
);

// @route   POST /api/whatsapp/v1/admin/email/send-test
// @desc    Send test email via central email system
// @access  Private (Admin)
router.post('/admin/email/send-test',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    emailConfigController.sendTestEmail
);

// @route   GET /api/whatsapp/v1/admin/settings
// @desc    Get all admin WhatsApp settings
// @access  Private (Admin)
router.get('/admin/settings',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.getAllAdminSettings
);

// @route   GET /api/whatsapp/v1/admin/settings/:id
// @desc    Get specific admin WhatsApp settings
// @access  Private (Admin)
router.get('/admin/settings/:id',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.getAdminSettings
);

// @route   GET /api/whatsapp/v1/admin/settings/default
// @desc    Get default admin WhatsApp settings
// @access  Private (Admin)
router.get('/admin/settings/default',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.getDefaultAdminSettings
);

// @route   POST /api/whatsapp/v1/admin/settings
// @desc    Create new admin WhatsApp settings
// @access  Private (Admin)
router.post('/admin/settings',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.createAdminSettings
);

// @route   PUT /api/whatsapp/v1/admin/settings/:id
// @desc    Update admin WhatsApp settings
// @access  Private (Admin)
router.put('/admin/settings/:id',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.updateAdminSettings
);

// @route   PUT /api/whatsapp/v1/admin/settings/:id/set-default
// @desc    Set admin settings as default
// @access  Private (Admin)
router.put('/admin/settings/:id/set-default',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.setAdminSettingsAsDefault
);

// @route   DELETE /api/whatsapp/v1/admin/settings/:id
// @desc    Delete admin WhatsApp settings
// @access  Private (Admin)
router.delete('/admin/settings/:id',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.deleteAdminSettings
);

// @route   POST /api/whatsapp/v1/admin/settings/:id/test-ai
// @desc    Test admin AI settings
// @access  Private (Admin)
router.post('/admin/settings/:id/test-ai',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.testAdminAISettings
);

// @route   GET /api/whatsapp/v1/admin/settings/analytics
// @desc    Get admin WhatsApp analytics
// @access  Private (Admin)
router.get('/admin/settings/analytics',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.getAdminAnalytics
);

// @route   POST /api/whatsapp/v1/admin/settings/:id/clone
// @desc    Clone admin settings
// @access  Private (Admin)
router.post('/admin/settings/:id/clone',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.cloneAdminSettings
);

// @route   POST /api/whatsapp/v1/admin/settings/:id/apply-to-coaches
// @desc    Apply settings to all coaches
// @access  Private (Admin)
router.post('/admin/settings/:id/apply-to-coaches',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.applySettingsToCoaches
);

// @route   GET /api/whatsapp/v1/admin/settings/usage-stats
// @desc    Get settings usage statistics
// @access  Private (Admin)
router.get('/admin/settings/usage-stats',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.getSettingsUsageStats
);

// ===== UNIFIED MESSAGING SYSTEM ROUTES =====
// These routes are mounted at /api/messaging
// Includes all Coach and Admin messaging functionality

// ===== COACH MESSAGING ROUTES =====
// All routes use protect middleware for coach authentication

// @route   POST /api/messaging/send
// @desc    Send single message (text, template, or media)
// @access  Private (Coach)
router.post('/send', 
    protect, 
    authorizeCoach('coach'),
    messagingController.sendMessage
);

// @route   POST /api/messaging/send-bulk
// @desc    Send bulk messages to multiple contacts
// @access  Private (Coach)
router.post('/send-bulk', 
    protect, 
    authorizeCoach('coach'),
    messagingController.sendBulkMessages
);

// @route   GET /api/messaging/contacts
// @desc    Get coach's contacts (leads only)
// @access  Private (Coach)
router.get('/contacts', 
    protect, 
    authorizeCoach('coach'),
    noLogActivity, 
    contactController.getCoachContacts
);

// @route   GET /api/messaging/contacts/search
// @desc    Search contacts by name, phone, or email
// @access  Private (Coach)
router.get('/contacts/search', 
    protect, 
    authorizeCoach('coach'),
    noLogActivity, 
    contactController.searchContacts
);

// @route   GET /api/messaging/templates
// @desc    Get available templates for coach
// @access  Private (Coach)
router.get('/templates', 
    protect, 
    authorizeCoach('coach'),
    noLogActivity, 
    templateController.getCoachTemplates
);

// @route   GET /api/messaging/templates/:templateId/preview
// @desc    Preview template with sample data
// @access  Private (Coach)
router.get('/templates/:templateId/preview', 
    protect, 
    authorizeCoach('coach'),
    noLogActivity, 
    templateController.previewTemplate
);

// @route   GET /api/messaging/templates/parameters
// @desc    Get available template parameters from database
// @access  Private (Coach)
router.get('/templates/parameters', 
    protect, 
    authorizeCoach('coach'),
    noLogActivity, 
    templateController.getTemplateParameters
);

// @route   GET /api/messaging/inbox
// @desc    Get inbox messages for coach
// @access  Private (Coach)
router.get('/inbox', 
    protect, 
    authorizeCoach('coach'),
    noLogActivity, 
    inboxController.getInboxMessages
);

// @route   GET /api/messaging/inbox/conversation/:contactId
// @desc    Get conversation with specific contact
// @access  Private (Coach)
router.get('/inbox/conversation/:contactId', 
    protect, 
    authorizeCoach('coach'),
    noLogActivity, 
    inboxController.getConversation
);

// *route   POST /api/messaging/inbox/send
// @desc    Send message from inbox
// @access  Private (Coach)
router.post('/inbox/send', 
    protect, 
    authorizeCoach('coach'),
    inboxController.sendInboxMessage
);

// @route   PUT /api/messaging/inbox/messages/:messageId/read
// @desc    Mark message as read
// @access  Private (Coach)
router.put('/inbox/messages/:messageId/read', 
    protect, 
    authorizeCoach('coach'),
    inboxController.markAsRead
);

// @route   GET /api/messaging/stats
// @desc    Get messaging statistics for coach
// @access  Private (Coach)
router.get('/stats', 
    protect, 
    authorizeCoach('coach'),
    noLogActivity, 
    messagingController.getMessagingStats
);

// ===== ADMIN MESSAGING ROUTES =====
// All routes use verifyAdminToken middleware for admin authentication

// @route   GET /api/messaging/admin/contacts
// @desc    Get all contacts across all coaches
// @access  Private (Admin)
router.get('/admin/contacts', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    noLogActivity, 
    contactController.getAllContacts
);

// @route   GET /api/messaging/admin/contacts/search
// @desc    Search all contacts by name, phone, or email
// @access  Private (Admin)
router.get('/admin/contacts/search', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    noLogActivity, 
    contactController.searchAllContacts
);

// @route   POST /api/messaging/admin/send
// @desc    Send message as admin to any contact
// @access  Private (Admin)
router.post('/admin/send', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    messagingController.sendAdminMessage
);

// @route   POST /api/messaging/admin/send-bulk
// @desc    Send bulk messages as admin
// @access  Private (Admin)
router.post('/admin/send-bulk', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    messagingController.sendAdminBulkMessages
);

// @route   GET /api/messaging/admin/templates
// @desc    Get all templates across all coaches
// @access  Private (Admin)
router.get('/admin/templates', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    noLogActivity, 
    templateController.getAllTemplates
);

// @route   POST /api/messaging/admin/templates
// @desc    Create global template
// @access  Private (Admin)
router.post('/admin/templates', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    templateController.createGlobalTemplate
);

// @route   PUT /api/messaging/admin/templates/:templateId
// @desc    Update global template
// @access  Private (Admin)
router.put('/admin/templates/:templateId', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    templateController.updateGlobalTemplate
);

// @route   DELETE /api/messaging/admin/templates/:templateId
// @desc    Delete global template
// @access  Private (Admin)
router.delete('/admin/templates/:templateId', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    templateController.deleteGlobalTemplate
);

// @route   GET /api/messaging/admin/inbox
// @desc    Get all inbox messages across coaches
// @access  Private (Admin)
router.get('/admin/inbox', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    noLogActivity, 
    inboxController.getAllInboxMessages
);

// @route   GET /api/messaging/admin/inbox/conversation/:contactId
// @desc    Get conversation with specific contact (admin view)
// @access  Private (Admin)
router.get('/admin/inbox/conversation/:contactId', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    noLogActivity, 
    inboxController.getAdminConversation
);

// @route   GET /api/messaging/admin/stats
// @desc    Get system-wide messaging statistics
// @access  Private (Admin)
router.get('/admin/stats', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    noLogActivity, 
    messagingController.getAdminMessagingStats
);

// @route   GET /api/messaging/admin/coaches/:coachId/messages
// @desc    Get messages for specific coach
// @access  Private (Admin)
router.get('/admin/coaches/:coachId/messages', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    noLogActivity, 
    messagingController.getCoachMessages
);

// ===== UNIFIED MESSAGING V1 ROUTES =====
// These routes are mounted at /api/messagingv1
// Includes device management, credits, and advanced features

// @route   GET /api/messagingv1/debug/qr-setup/:deviceId
// @desc    Debug QR setup page
// @access  Public (for debugging)
router.get('/messagingv1/debug/qr-setup/:deviceId', 
    noLogActivity, 
    unifiedMessagingController.debugQRSetup
);

// @route   GET /api/messagingv1/settings
// @desc    Get coach WhatsApp settings
// @access  Private (Coach)
router.get('/messagingv1/settings', 
    protect, 
    authorizeCoach('coach'),
    noLogActivity, 
    unifiedMessagingController.getCoachWhatsAppSettings
);

// @route   POST /api/messagingv1/settings
// @desc    Set coach WhatsApp settings
// @access  Private (Coach)
router.post('/messagingv1/settings', 
    protect, 
    authorizeCoach('coach'),
    unifiedMessagingController.setCoachWhatsAppSettings
);

// @route   POST /api/messagingv1/send
// @desc    Send message via unified endpoint
// @access  Private (Coach)
router.post('/messagingv1/send', 
    protect, 
    authorizeCoach('coach'),
    unifiedMessagingController.sendMessage
);

// @route   GET /api/messagingv1/inbox
// @desc    Get inbox messages
// @access  Private (Coach)
router.get('/messagingv1/inbox', 
    protect, 
    authorizeCoach('coach'),
    noLogActivity, 
    unifiedMessagingController.getInboxMessages
);

// @route   GET /api/messagingv1/messages/:contact
// @desc    Get message history for a specific contact
// @access  Private (Coach)
router.get('/messagingv1/messages/:contact', 
    protect, 
    authorizeCoach('coach'),
    noLogActivity, 
    unifiedMessagingController.getMessageHistory
);

// @route   PUT /api/messagingv1/messages/mark-read
// @desc    Mark messages as read
// @access  Private (Coach)
router.put('/messagingv1/messages/mark-read', 
    protect, 
    authorizeCoach('coach'),
    unifiedMessagingController.markMessagesAsRead
);

// @route   GET /api/messagingv1/templates
// @desc    Get message templates
// @access  Private (Coach)
router.get('/messagingv1/templates', 
    protect, 
    authorizeCoach('coach'),
    noLogActivity, 
    unifiedMessagingController.getMessageTemplates
);

// @route   POST /api/messagingv1/templates
// @desc    Create message template
// @access  Private (Coach)
router.post('/messagingv1/templates', 
    protect, 
    authorizeCoach('coach'),
    unifiedMessagingController.createMessageTemplate
);

// *route   PUT /api/messagingv1/templates/:templateId
// @desc    Update message template
// @access  Private (Coach)
router.put('/messagingv1/templates/:templateId', 
    protect, 
    authorizeCoach('coach'),
    unifiedMessagingController.updateMessageTemplate
);

// @route   DELETE /api/messagingv1/templates/:templateId
// @desc    Delete message template
// @access  Private (Coach)
router.delete('/messagingv1/templates/:templateId', 
    protect, 
    authorizeCoach('coach'),
    unifiedMessagingController.deleteMessageTemplate
);

// ===== UNIFIED MESSAGING ROUTES =====
// Unified routes that work for all user types based on token role

// @route   GET /api/messagingv1/unified/inbox
// @desc    Get inbox messages (role-based access)
// @access  Private (Coach/Staff/Admin)
router.get('/messagingv1/unified/inbox', 
    protect, 
    authorizeStaff('staff', 'coach'),
    noLogActivity, 
    unifiedMessagingController.getUnifiedInboxMessages
);

// @route   GET /api/messagingv1/unified/templates
// @desc    Get templates based on user role
// @access  Private (Coach/Staff/Admin)
router.get('/messagingv1/unified/templates', 
    protect, 
    authorizeStaff('staff', 'coach'),
    noLogActivity, 
    unifiedMessagingController.getUnifiedTemplates
);

// @route   POST /api/messagingv1/unified/send
// @desc    Send message (role-based permissions)
// @access  Private (Coach/Staff/Admin)
router.post('/messagingv1/unified/send', 
    protect, 
    authorizeStaff('staff', 'coach'),
    unifiedMessagingController.sendUnifiedMessage
);

// @route   POST /api/messagingv1/unified/send-bulk
// @desc    Send bulk messages (role-based permissions)
// @access  Private (Coach/Staff/Admin)
router.post('/messagingv1/unified/send-bulk', 
    protect, 
    authorizeStaff('staff', 'coach'),
    unifiedMessagingController.sendUnifiedBulkMessages
);

// @route   GET /api/messagingv1/unified/inbox/conversation/:contactId
// @desc    Get conversation messages (role-based access)
// @access  Private (Coach/Staff/Admin)
router.get('/messagingv1/unified/inbox/conversation/:contactId', 
    protect, 
    authorizeStaff('staff', 'coach'),
    noLogActivity, 
    unifiedMessagingController.getUnifiedConversation
);

// @route   GET /api/messagingv1/stats
// @desc    Get messaging statistics
// @access  Private (Coach)
router.get('/messagingv1/stats', 
    protect, 
    authorizeCoach('coach'),
    noLogActivity, 
    unifiedMessagingController.getMessagingStats
);

// @route   GET /api/messagingv1/contacts
// @desc    Get contacts
// @access  Private (Coach)
router.get('/messagingv1/contacts', 
    protect, 
    authorizeCoach('coach'),
    noLogActivity, 
    unifiedMessagingController.getContacts
);

// @route   POST /api/messagingv1/devices
// @desc    Create a new WhatsApp device
// @access  Private (Coach)
router.post('/messagingv1/devices', 
    protect, 
    authorizeCoach('coach'),
    unifiedMessagingController.createWhatsAppDevice
);

// @route   GET /api/messagingv1/devices
// @desc    Get all WhatsApp devices for coach
// @access  Private (Coach)
router.get('/messagingv1/devices', 
    protect, 
    authorizeCoach('coach'),
    noLogActivity, 
    unifiedMessagingController.getCoachWhatsAppDevices
);

// *route   PUT /api/messagingv1/devices/:deviceId
// @desc    Update WhatsApp device
// @access  Private (Coach)
router.put('/messagingv1/devices/:deviceId', 
    protect, 
    authorizeCoach('coach'),
    unifiedMessagingController.updateWhatsAppDevice
);

// @route   DELETE /api/messagingv1/devices/:deviceId
// @desc    Delete WhatsApp device
// @access  Private (Coach)
router.delete('/messagingv1/devices/:deviceId', 
    protect, 
    authorizeCoach('coach'),
    unifiedMessagingController.deleteWhatsAppDevice
);

// @route   GET /api/messagingv1/devices/:deviceId/status
// @desc    Get device status
// @access  Private (Coach)
router.get('/messagingv1/devices/:deviceId/status', 
    protect, 
    authorizeCoach('coach'),
    noLogActivity, 
    unifiedMessagingController.getDeviceStatus
);

// @route   POST /api/messagingv1/devices/:deviceId/switch
// @desc    Switch WhatsApp device
// @access  Private (Coach)
router.post('/messagingv1/devices/:deviceId/switch', 
    protect, 
    authorizeCoach('coach'),
    unifiedMessagingController.switchWhatsAppDevice
);

// ===== UNIFIED MESSAGING ADMIN ROUTES =====

// @route   GET /api/messagingv1/admin/overview
// @desc    Get unified messaging system overview
// @access  Private (Admin)
router.get('/messagingv1/admin/overview', 
    verifyAdminToken, 
    requirePermission('systemSettings'), 
    noLogActivity, 
    unifiedMessagingAdminController.getSystemOverview
);

// @route   GET /api/messagingv1/admin/devices
// @desc    Get all WhatsApp devices across coaches
// @access  Private (Admin)
router.get('/messagingv1/admin/devices', 
    verifyAdminToken, 
    requirePermission('systemSettings'), 
    noLogActivity, 
    unifiedMessagingAdminController.getAllDevices
);

// @route   GET /api/messagingv1/admin/messages
// @desc    Get all messages across coaches
// @access  Private (Admin)
router.get('/messagingv1/admin/messages', 
    verifyAdminToken, 
    requirePermission('systemSettings'), 
    noLogActivity, 
    unifiedMessagingAdminController.getAllMessages
);

// @route   GET /api/messagingv1/admin/stats
// @desc    Get system-wide messaging statistics
// @access  Private (Admin)
router.get('/messagingv1/admin/stats', 
    verifyAdminToken, 
    requirePermission('systemSettings'), 
    noLogActivity, 
    unifiedMessagingAdminController.getSystemStats
);

// @route   GET /api/messagingv1/admin/coaches/:coachId/messages
// @desc    Get messages for specific coach
// @access  Private (Admin)
router.get('/messagingv1/admin/coaches/:coachId/messages', 
    verifyAdminToken, 
    requirePermission('systemSettings'), 
    noLogActivity, 
    unifiedMessagingAdminController.getCoachMessages
);

// @route   POST /api/messagingv1/admin/broadcast
// @desc    Send broadcast message to multiple coaches
// @access  Private (Admin)
router.post('/messagingv1/admin/broadcast', 
    verifyAdminToken, 
    requirePermission('systemSettings'), 
    unifiedMessagingAdminController.sendBroadcastMessage
);

// @route   PUT /api/messagingv1/admin/credit-rates
// @desc    Update credit rates for messaging
// @access  Private (Admin)
router.put('/messagingv1/admin/credit-rates', 
    verifyAdminToken, 
    requirePermission('systemSettings'), 
    unifiedMessagingAdminController.updateCreditRates
);

// @route   GET /api/messagingv1/admin/templates
// @desc    Get all templates across coaches
// @access  Private (Admin)
router.get('/messagingv1/admin/templates', 
    verifyAdminToken, 
    requirePermission('systemSettings'), 
    noLogActivity, 
    unifiedMessagingAdminController.getAllTemplates
);

// @route   POST /api/messagingv1/admin/templates
// @desc    Create global template
// @access  Private (Admin)
router.post('/messagingv1/admin/templates', 
    verifyAdminToken, 
    requirePermission('systemSettings'), 
    unifiedMessagingAdminController.createGlobalTemplate
);

// @route   PUT /api/messagingv1/admin/templates/:templateId
// @desc    Update global template
// @access  Private (Admin)
router.put('/messagingv1/admin/templates/:templateId', 
    verifyAdminToken, 
    requirePermission('systemSettings'), 
    unifiedMessagingAdminController.updateGlobalTemplate
);

// @route   DELETE /api/messagingv1/admin/templates/:templateId
// @desc    Delete global template
// @access  Private (Admin)
router.delete('/messagingv1/admin/templates/:templateId', 
    verifyAdminToken, 
    requirePermission('systemSettings'), 
    unifiedMessagingAdminController.deleteGlobalTemplate
);

// ===== CREDIT MANAGEMENT ENDPOINTS =====

// @route   GET /api/messagingv1/credits/balance
// @desc    Get coach's credit balance
// @access  Private (Coach)
router.get('/messagingv1/credits/balance', protect, authorizeCoach('coach'), whatsappCreditController.getCreditBalance);

// @route   GET /api/messagingv1/credits/check
// @desc    Check if user can send messages
// @access  Private (Coach)
router.get('/messagingv1/credits/check', protect, authorizeCoach('coach'), whatsappCreditController.checkCanSendMessage);

// @route   GET /api/messagingv1/credits/packages
// @desc    Get available credit packages
// @access  Public
router.get('/messagingv1/credits/packages', whatsappCreditController.getCreditPackages);

// @route   POST /api/messagingv1/credits/purchase
// @desc    Purchase credits
// @access  Private (Coach)
router.post('/messagingv1/credits/purchase', protect, authorizeCoach('coach'), whatsappCreditController.purchaseCredits);

// @route   GET /api/messagingv1/admin/credit-rates
// @desc    Get system credit rates
// @access  Private (Admin)
router.get('/messagingv1/admin/credit-rates', 
    verifyAdminToken, 
    requirePermission('systemSettings'), 
    whatsappCreditController.getSystemCreditRates
);

// *route   GET /api/messagingv1/credits/transactions
// @desc    Get credit transactions
// @access  Private (Coach)
router.get('/messagingv1/credits/transactions', protect, authorizeCoach('coach'), whatsappCreditController.getCreditTransactions);


// ===== MESSAGE TEMPLATES MANAGEMENT =====

// @route   POST /api/messaging/templates/message-template
// @desc    Create message template
// @access  Private (Coach)
router.post('/messaging/templates/message-template',
    protect,
    requirePermission('messaging'),
    require('../controllers/messageTemplateController').createTemplate
);

// @route   GET /api/messaging/templates/message-templates
// @desc    Get coach message templates
// @access  Private (Coach)
router.get('/messaging/templates/message-templates',
    protect,
    requirePermission('messaging'),
    require('../controllers/messageTemplateController').getCoachTemplates
);

// @route   GET /api/messaging/templates/message-templates/pre-built
// @desc    Get pre-built templates
// @access  Private (Coach)
router.get('/messaging/templates/message-templates/pre-built',
    protect,
    requirePermission('messaging'),
    require('../controllers/messageTemplateController').getPreBuiltTemplates
);

// @route   GET /api/messaging/templates/message-templates/categories
// @desc    Get template categories
// @access  Private (Coach)
router.get('/messaging/templates/message-templates/categories',
    protect,
    requirePermission('messaging'),
    require('../controllers/messageTemplateController').getTemplateCategories
);

// @route   GET /api/messaging/templates/message-templates/types
// @desc    Get template types
// @access  Private (Coach)
router.get('/messaging/templates/message-templates/types',
    protect,
    requirePermission('messaging'),
    require('../controllers/messageTemplateController').getTemplateTypes
);

// @route   GET /api/messaging/templates/message-templates/variables
// @desc    Get common template variables
// @access  Private (Coach)
router.get('/messaging/templates/message-templates/variables',
    protect,
    requirePermission('messaging'),
    require('../controllers/messageTemplateController').getCommonVariables
);

// @route   POST /api/messaging/templates/message-templates/seed
// @desc    Seed pre-built templates
// @access  Private (Coach)
router.post('/messaging/templates/message-templates/seed',
    protect,
    requirePermission('messaging'),
    require('../controllers/messageTemplateController').seedPreBuiltTemplates
);

// @route   GET /api/messaging/templates/message-templates/:id
// @desc    Get specific template
// @access  Private (Coach)
router.get('/messaging/templates/message-templates/:id',
    protect,
    requirePermission('messaging'),
    require('../controllers/messageTemplateController').getTemplateById
);

// *route   PUT /api/messaging/templates/message-templates/:id
// @desc    Update message template
// @access  Private (Coach)
router.put('/messaging/templates/message-templates/:id',
    protect,
    requirePermission('messaging'),
    require('../controllers/messageTemplateController').updateTemplate
);

// @route   DELETE /api/messaging/templates/message-templates/:id
// @desc    Delete message template
// @access  Private (Coach)
router.delete('/messaging/templates/message-templates/:id',
    protect,
    requirePermission('messaging'),
    require('../controllers/messageTemplateController').deleteTemplate
);

// @route   POST /api/messaging/templates/message-templates/:id/duplicate
// @desc    Duplicate template
// @access  Private (Coach)
router.post('/messaging/templates/message-templates/:id/duplicate',
    protect,
    requirePermission('messaging'),
    require('../controllers/messageTemplateController').duplicateTemplate
);

// @route   POST /api/messaging/templates/message-templates/:id/render
// @desc    Render template with variables
// @access  Private (Coach)
router.post('/messaging/templates/message-templates/:id/render',
    protect,
    requirePermission('messaging'),
    require('../controllers/messageTemplateController').renderTemplate
);

// ===== LEGACY MESSAGING ROUTES (moved from /api/messaging) =====
// These routes are now available under /api/whatsapp/v1/messaging

// @route   POST /api/whatsapp/v1/messaging/send
// @desc    Send single message (text, template, or media)
// @access  Private (Coach)
router.post('/messaging/send', 
    protect, 
    messagingController.sendMessage
);

// @route   POST /api/whatsapp/v1/messaging/send-bulk
// @desc    Send bulk messages to multiple contacts
// @access  Private (Coach)
router.post('/messaging/send-bulk', 
    protect, 
    messagingController.sendBulkMessages
);

// @route   GET /api/whatsapp/v1/messaging/contacts
// @desc    Get coach's contacts (leads only)
// @access  Private (Coach)
router.get('/messaging/contacts', 
    protect, 
    noLogActivity, 
    contactController.getCoachContacts
);

// @route   GET /api/whatsapp/v1/messaging/contacts/search
// @desc    Search contacts by name, phone, or email
// @access  Private (Coach)
router.get('/messaging/contacts/search', 
    protect, 
    noLogActivity, 
    contactController.searchContacts
);

// @route   GET /api/whatsapp/v1/messaging/templates
// @desc    Get available templates for coach
// @access  Private (Coach)
router.get('/messaging/templates', 
    protect, 
    noLogActivity, 
    templateController.getCoachTemplates
);

// @route   GET /api/whatsapp/v1/messaging/templates/:templateId/preview
// @desc    Preview template with sample data
// @access  Private (Coach)
router.get('/messaging/templates/:templateId/preview', 
    protect, 
    noLogActivity, 
    templateController.previewTemplate
);

// @route   GET /api/whatsapp/v1/messaging/templates/parameters
// @desc    Get available template parameters from database
// @access  Private (Coach)
router.get('/messaging/templates/parameters', 
    protect, 
    noLogActivity, 
    templateController.getTemplateParameters
);

// @route   GET /api/whatsapp/v1/messaging/inbox
// @desc    Get inbox messages for coach
// @access  Private (Coach)
router.get('/messaging/inbox', 
    protect, 
    noLogActivity, 
    inboxController.getInboxMessages
);

// @route   GET /api/whatsapp/v1/messaging/inbox/conversation/:contactId
// @desc    Get conversation with specific contact
// @access  Private (Coach)
router.get('/messaging/inbox/conversation/:contactId', 
    protect, 
    noLogActivity, 
    inboxController.getConversation
);

// @route   POST /api/whatsapp/v1/messaging/inbox/send
// @desc    Send message from inbox
// @access  Private (Coach)
router.post('/messaging/inbox/send', 
    protect, 
    inboxController.sendInboxMessage
);

// @route   PUT /api/whatsapp/v1/messaging/inbox/messages/:messageId/read
// @desc    Mark message as read
// @access  Private (Coach)
router.put('/messaging/inbox/messages/:messageId/read', 
    protect, 
    inboxController.markAsRead
);

// @route   GET /api/whatsapp/v1/messaging/stats
// @desc    Get messaging statistics for coach
// @access  Private (Coach)
router.get('/messaging/stats', 
    protect, 
    noLogActivity, 
    messagingController.getMessagingStats
);

// ===== ADMIN MESSAGING ROUTES =====

// @route   GET /api/whatsapp/v1/messaging/admin/contacts
// @desc    Get all contacts across all coaches
// @access  Private (Admin)
router.get('/messaging/admin/contacts', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    noLogActivity, 
    contactController.getAllContacts
);

// @route   GET /api/whatsapp/v1/messaging/admin/contacts/search
// @desc    Search all contacts by name, phone, or email
// @access  Private (Admin)
router.get('/messaging/admin/contacts/search', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    noLogActivity, 
    contactController.searchAllContacts
);

// @route   POST /api/whatsapp/v1/messaging/admin/send
// @desc    Send message as admin to any contact
// @access  Private (Admin)
router.post('/messaging/admin/send', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    messagingController.sendAdminMessage
);

// @route   POST /api/whatsapp/v1/messaging/admin/send-bulk
// @desc    Send bulk messages as admin
// @access  Private (Admin)
router.post('/messaging/admin/send-bulk', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    messagingController.sendAdminBulkMessages
);

// @route   GET /api/whatsapp/v1/messaging/admin/templates
// @desc    Get all templates across all coaches
// @access  Private (Admin)
router.get('/messaging/admin/templates', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    noLogActivity, 
    templateController.getAllTemplates
);

// @route   POST /api/whatsapp/v1/messaging/admin/templates
// @desc    Create global template
// @access  Private (Admin)
router.post('/messaging/admin/templates', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    templateController.createGlobalTemplate
);

// @route   PUT /api/whatsapp/v1/messaging/admin/templates/:templateId
// @desc    Update global template
// @access  Private (Admin)
router.put('/messaging/admin/templates/:templateId', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    templateController.updateGlobalTemplate
);

// @route   DELETE /api/whatsapp/v1/messaging/admin/templates/:templateId
// @desc    Delete global template
// @access  Private (Admin)
router.delete('/messaging/admin/templates/:templateId', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    templateController.deleteGlobalTemplate
);

// @route   GET /api/whatsapp/v1/messaging/admin/inbox
// @desc    Get all inbox messages across coaches
// @access  Private (Admin)
router.get('/messaging/admin/inbox', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    noLogActivity, 
    inboxController.getAllInboxMessages
);

// @route   GET /api/whatsapp/v1/messaging/admin/inbox/conversation/:contactId
// @desc    Get conversation with specific contact (admin view)
// @access  Private (Admin)
router.get('/messaging/admin/inbox/conversation/:contactId', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    noLogActivity, 
    inboxController.getAdminConversation
);

// @route   GET /api/whatsapp/v1/messaging/admin/stats
// @desc    Get system-wide messaging statistics
// @access  Private (Admin)
router.get('/messaging/admin/stats', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    noLogActivity, 
    messagingController.getAdminMessagingStats
);

// @route   GET /api/whatsapp/v1/messaging/admin/coaches/:coachId/messages
// @desc    Get messages for specific coach
// @access  Private (Admin)
router.get('/messaging/admin/coaches/:coachId/messages', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    noLogActivity, 
    messagingController.getCoachMessages
);

// ===== ENHANCED UNIFIED MESSAGING ROUTES =====

// @route   GET /api/messagingv1/unified/parameter-options
// @desc    Get available parameters for template assignment
// @access  Private (Coach/Staff/Admin)
router.get('/messagingv1/unified/parameter-options',
    protect,
    authorizeStaff('staff', 'coach'),
    noLogActivity,
    unifiedMessagingController.getParameterOptions
);

// Note: Template assignment functions not yet implemented
// TODO: Implement assignTemplate and getAssignedTemplates functions

// @route   GET /api/messagingv1/unified/24hr-contacts
// @desc    Get contacts within Meta 24-hour window
// @access  Private (Coach/Staff/Admin)
router.get('/messagingv1/unified/24hr-contacts',
    protect,
    authorizeStaff('staff', 'coach'),
    noLogActivity,
    unifiedMessagingController.get24HourContacts
);

// Note: sendMessageWithQueue function not yet implemented
// TODO: Implement sendMessageWithQueue function

// @route   GET /api/messagingv1/unified/queue-stats
// @desc    Get RabbitMQ queue statistics
// @access  Private (Admin only)
router.get('/messagingv1/unified/queue-stats',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    noLogActivity,
    unifiedMessagingController.getQueueStats
);

module.exports = router;
