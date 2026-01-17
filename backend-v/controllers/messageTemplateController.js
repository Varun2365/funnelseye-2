const messageTemplateService = require('../services/messageTemplateService');
const CoachStaffService = require('../services/coachStaffService');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create a new message template
// @route   POST /api/message-templates
// @access  Private (Coaches/Staff with permission)
const createTemplate = asyncHandler(async (req, res, next) => {
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    const { name, description, type, category, content, availableVariables, variables, tags } = req.body;
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'write', 'templates', 'create', { coachId, templateName: name });
    
    if (!name || !type || !content || !content.body) {
        return next(new ErrorResponse('Name, type, and content body are required', 400));
    }

    const templateData = {
        coachId: coachId,
        name,
        description,
        type,
        category: category || 'custom',
        content,
        availableVariables: availableVariables || [],
        variables: variables || {},
        tags: tags || []
    };

    const template = await messageTemplateService.createTemplate(templateData);

    res.status(201).json({
        success: true,
        data: template
    });
});

// @desc    Get all templates for a coach
// @route   GET /api/message-templates
// @access  Private (Coaches/Staff with permission)
const getCoachTemplates = asyncHandler(async (req, res, next) => {
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    const { type, category, isActive, tags } = req.query;
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'templates', 'list', { coachId });
    
    const filters = {};
    if (type) filters.type = type;
    if (category) filters.category = category;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (tags) filters.tags = tags.split(',');

    const templates = await messageTemplateService.getCoachTemplates(coachId, filters);

    res.status(200).json({
        success: true,
        count: templates.length,
        data: templates
    });
});

// @desc    Get pre-built templates
// @route   GET /api/message-templates/pre-built
// @access  Private (Coaches)
const getPreBuiltTemplates = asyncHandler(async (req, res, next) => {
    const { type, category } = req.query;
    
    const templates = await messageTemplateService.getPreBuiltTemplates(type, category);

    res.status(200).json({
        success: true,
        count: templates.length,
        data: templates
    });
});

// @desc    Get a specific template by ID
// @route   GET /api/message-templates/:id
// @access  Private (Coaches)
const getTemplateById = asyncHandler(async (req, res, next) => {
    const template = await messageTemplateService.getTemplateById(req.params.id, req.coachId);

    res.status(200).json({
        success: true,
        data: template
    });
});

// @desc    Update a template
// @route   PUT /api/message-templates/:id
// @access  Private (Coaches)
const updateTemplate = asyncHandler(async (req, res, next) => {
    const template = await messageTemplateService.updateTemplate(
        req.params.id, 
        req.coachId, 
        req.body
    );

    res.status(200).json({
        success: true,
        data: template
    });
});

// @desc    Delete a template
// @route   DELETE /api/message-templates/:id
// @access  Private (Coaches)
const deleteTemplate = asyncHandler(async (req, res, next) => {
    const result = await messageTemplateService.deleteTemplate(req.params.id, req.coachId);

    res.status(200).json(result);
});

// @desc    Duplicate a template
// @route   POST /api/message-templates/:id/duplicate
// @access  Private (Coaches)
const duplicateTemplate = asyncHandler(async (req, res, next) => {
    const { newName } = req.body;
    
    const duplicatedTemplate = await messageTemplateService.duplicateTemplate(
        req.params.id, 
        req.coachId, 
        newName
    );

    res.status(201).json({
        success: true,
        data: duplicatedTemplate
    });
});

// @desc    Render a template with variables
// @route   POST /api/message-templates/:id/render
// @access  Private (Coaches)
const renderTemplate = asyncHandler(async (req, res, next) => {
    const { variables } = req.body;
    
    const result = await messageTemplateService.renderTemplate(
        req.params.id, 
        variables || {}, 
        req.coachId
    );

    res.status(200).json(result);
});

// @desc    Seed pre-built templates for a coach
// @route   POST /api/message-templates/seed
// @access  Private (Coaches)
const seedPreBuiltTemplates = asyncHandler(async (req, res, next) => {
    const templates = await messageTemplateService.seedPreBuiltTemplates(req.coachId);

    res.status(200).json({
        success: true,
        message: `Seeded ${templates.length} pre-built templates`,
        data: templates
    });
});

// @desc    Get template categories
// @route   GET /api/message-templates/categories
// @access  Private (Coaches)
const getTemplateCategories = asyncHandler(async (req, res, next) => {
    const categories = [
        { value: 'welcome', label: 'Welcome Messages', description: 'Messages for new leads and clients' },
        { value: 'follow_up', label: 'Follow-up Messages', description: 'Follow-up and check-in messages' },
        { value: 'appointment', label: 'Appointment Messages', description: 'Appointment confirmations and reminders' },
        { value: 'reminder', label: 'Reminder Messages', description: 'Session and task reminders' },
        { value: 'marketing', label: 'Marketing Messages', description: 'Promotional and offer messages' },
        { value: 'support', label: 'Support Messages', description: 'Customer service and support' },
        { value: 'custom', label: 'Custom Messages', description: 'Custom templates for specific needs' }
    ];

    res.status(200).json({
        success: true,
        data: categories
    });
});

// @desc    Get template types
// @route   GET /api/message-templates/types
// @access  Private (Coaches)
const getTemplateTypes = asyncHandler(async (req, res, next) => {
    const types = [
        // { value: 'whatsapp', label: 'WhatsApp', description: 'WhatsApp Business messages with rich media support' }, // WhatsApp functionality moved to dustbin/whatsapp-dump/
        { value: 'email', label: 'Email', description: 'Professional email templates with HTML support' },
        { value: 'sms', label: 'SMS', description: 'Simple text messages for mobile' },
        { value: 'universal', label: 'Universal', description: 'Templates that work across all platforms' }
    ];

    res.status(200).json({
        success: true,
        data: types
    });
});

// @desc    Get common template variables
// @route   GET /api/message-templates/variables
// @access  Private (Coaches)
const getCommonVariables = asyncHandler(async (req, res, next) => {
    const variables = [
        { name: 'lead.name', description: 'Lead\'s first name', example: 'John', category: 'lead' },
        { name: 'lead.firstName', description: 'Lead\'s first name', example: 'John', category: 'lead' },
        { name: 'lead.lastName', description: 'Lead\'s last name', example: 'Smith', category: 'lead' },
        { name: 'lead.email', description: 'Lead\'s email address', example: 'john@example.com', category: 'lead' },
        { name: 'lead.phone', description: 'Lead\'s phone number', example: '+1234567890', category: 'lead' },
        { name: 'coach.name', description: 'Coach\'s name', example: 'Sarah', category: 'coach' },
        { name: 'coach.firstName', description: 'Coach\'s first name', example: 'Sarah', category: 'coach' },
        { name: 'coach.lastName', description: 'Coach\'s last name', example: 'Johnson', category: 'coach' },
        { name: 'coach.email', description: 'Coach\'s email', example: 'sarah@fitness.com', category: 'coach' },
        { name: 'company.name', description: 'Company name', example: 'FitnessPro', category: 'company' },
        { name: 'company.website', description: 'Company website', example: 'www.fitnesspro.com', category: 'company' },
        { name: 'appointment.date', description: 'Appointment date', example: 'January 15, 2024', category: 'appointment' },
        { name: 'appointment.time', description: 'Appointment time', example: '2:00 PM', category: 'appointment' },
        { name: 'appointment.duration', description: 'Appointment duration', example: '60 minutes', category: 'appointment' },
        { name: 'appointment.location', description: 'Appointment location', example: '123 Fitness St', category: 'appointment' },
        { name: 'appointment.zoomLink', description: 'Zoom meeting link', example: 'https://zoom.us/...', category: 'appointment' },
        { name: 'current.date', description: 'Current date', example: 'January 15, 2024', category: 'system' },
        { name: 'current.time', description: 'Current time', example: '2:00 PM', category: 'system' },
        { name: 'current.year', description: 'Current year', example: '2024', category: 'system' }
    ];

    res.status(200).json({
        success: true,
        data: variables
    });
});

module.exports = {
    createTemplate,
    getCoachTemplates,
    getPreBuiltTemplates,
    getTemplateById,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    renderTemplate,
    seedPreBuiltTemplates,
    getTemplateCategories,
    getTemplateTypes,
    getCommonVariables
};
