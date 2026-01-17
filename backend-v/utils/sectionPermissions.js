/**
 * Section-Based Staff Permissions System
 * Simplified permission structure where staff get full access to a section if granted
 * No fine-grained permissions like read/write/update - just section access
 */

// ===== SECTION PERMISSIONS =====
const SECTIONS = {
    // Dashboard - Staff gets their own custom dashboard
    DASHBOARD: {
        VIEW: 'dashboard:view'
    },
    
    // Funnel Management - Fine-grained funnel permissions
    FUNNELS: {
        VIEW: 'funnels:view',
        CREATE: 'funnels:create',
        UPDATE: 'funnels:update',
        DELETE: 'funnels:delete',
        PUBLISH: 'funnels:publish',
        UNPUBLISH: 'funnels:unpublish',
        VIEW_ANALYTICS: 'funnels:view_analytics',
        MANAGE: 'funnels:manage'
    },
    
    // Lead Management - Fine-grained permissions available
    LEADS: {
        VIEW: 'leads:view',           // View assigned leads
        CREATE: 'leads:create',       // Create new leads
        UPDATE: 'leads:update',       // Update lead information
        DELETE: 'leads:delete',       // Delete leads
        ASSIGN: 'leads:assign',       // Assign leads to other staff
        EXPORT: 'leads:export',       // Export lead data
        MANAGE_ALL: 'leads:manage_all', // View and manage all coach leads (not just assigned)
        MANAGE: 'leads:manage'        // Full lead management
    },
    
    // Central WhatsApp & Email System - Fine-grained messaging permissions
    MESSAGING: {
        VIEW: 'messaging:view',
        SEND: 'messaging:send',
        REPLY: 'messaging:reply',
        DELETE: 'messaging:delete',
        MANAGE_INBOX: 'messaging:manage_inbox',
        MANAGE: 'messaging:manage'
    },
    
    // Calendar - Fine-grained calendar permissions
    CALENDAR: {
        VIEW: 'calendar:view',
        CREATE: 'calendar:create',
        UPDATE: 'calendar:update',
        DELETE: 'calendar:delete',
        BOOK: 'calendar:book',
        RESCHEDULE: 'calendar:reschedule',
        MANAGE: 'calendar:manage'
    },
    
    // Marketing & Ads - Fine-grained marketing permissions
    MARKETING: {
        VIEW: 'marketing:view',
        CREATE_CAMPAIGN: 'marketing:create_campaign',
        UPDATE_CAMPAIGN: 'marketing:update_campaign',
        DELETE_CAMPAIGN: 'marketing:delete_campaign',
        VIEW_ANALYTICS: 'marketing:view_analytics',
        MANAGE_CREDENTIALS: 'marketing:manage_credentials',
        MANAGE: 'marketing:manage'
    },
    
    // AI & Automation - Fine-grained automation permissions
    AUTOMATION: {
        VIEW: 'automation:view',
        CREATE: 'automation:create',
        UPDATE: 'automation:update',
        DELETE: 'automation:delete',
        EXECUTE: 'automation:execute',
        MANAGE: 'automation:manage'
    },
    
    // MLM Network - Fine-grained MLM permissions
    MLM: {
        VIEW: 'mlm:view',
        VIEW_HIERARCHY: 'mlm:view_hierarchy',
        MANAGE_COMMISSIONS: 'mlm:manage_commissions',
        MANAGE: 'mlm:manage'
    },
    
    // Staff Profile - Own profile management (always accessible)
    PROFILE: {
        VIEW: 'profile:view',
        UPDATE: 'profile:update'
    },
    
    // Subscription - Blocked for staff (coaches only)
    SUBSCRIPTION: {
        VIEW: 'subscription:view',
        MANAGE: 'subscription:manage'
    },
    
    // Zoom Settings - Fine-grained Zoom permissions
    ZOOM: {
        VIEW: 'zoom:view',
        CREATE_MEETING: 'zoom:create_meeting',
        UPDATE_SETTINGS: 'zoom:update_settings',
        MANAGE: 'zoom:manage'
    },
    
    // Payment Gateway - Fine-grained payment permissions
    PAYMENT_GATEWAY: {
        VIEW: 'payment_gateway:view',
        CONFIGURE: 'payment_gateway:configure',
        MANAGE: 'payment_gateway:manage'
    },
    
    // Custom Domains - Fine-grained domain permissions
    DOMAINS: {
        VIEW: 'domains:view',
        CREATE: 'domains:create',
        UPDATE: 'domains:update',
        DELETE: 'domains:delete',
        MANAGE: 'domains:manage'
    },
    
    // Message Templates - Fine-grained template permissions
    TEMPLATES: {
        VIEW: 'templates:view',
        CREATE: 'templates:create',
        UPDATE: 'templates:update',
        DELETE: 'templates:delete',
        MANAGE: 'templates:manage'
    },
    
    // Course Creation & Selling - Fine-grained course permissions
    COURSES: {
        VIEW: 'courses:view',
        CREATE: 'courses:create',
        UPDATE: 'courses:update',
        DELETE: 'courses:delete',
        PUBLISH: 'courses:publish',
        MANAGE_SALES: 'courses:manage_sales',
        MANAGE: 'courses:manage'
    },
    
    // Staff Management - Fine-grained staff permissions
    STAFF_MANAGEMENT: {
        VIEW: 'staff:view',
        CREATE: 'staff:create',
        UPDATE: 'staff:update',
        DELETE: 'staff:delete',
        MANAGE_PERMISSIONS: 'staff:manage_permissions',
        MANAGE: 'staff:manage'
    }
};

// ===== SECTION METADATA =====
const SECTION_METADATA = {
    // Dashboard
    [SECTIONS.DASHBOARD.VIEW]: {
        name: 'View Dashboard',
        description: 'Access to staff dashboard with assigned tasks and overview',
        icon: '📊',
        alwaysAccessible: true,
        category: 'Core'
    },
    
    // Funnels
    [SECTIONS.FUNNELS.VIEW]: {
        name: 'View Funnels',
        description: 'View funnel information and analytics',
        icon: '👁️',
        category: 'Sales & Marketing'
    },
    [SECTIONS.FUNNELS.CREATE]: {
        name: 'Create Funnels',
        description: 'Create new sales funnels',
        icon: '➕',
        category: 'Sales & Marketing'
    },
    [SECTIONS.FUNNELS.UPDATE]: {
        name: 'Update Funnels',
        description: 'Modify existing funnel configurations',
        icon: '✏️',
        category: 'Sales & Marketing'
    },
    [SECTIONS.FUNNELS.DELETE]: {
        name: 'Delete Funnels',
        description: 'Remove funnels from the system',
        icon: '🗑️',
        category: 'Sales & Marketing'
    },
    [SECTIONS.FUNNELS.PUBLISH]: {
        name: 'Publish Funnels',
        description: 'Make funnels live and accessible',
        icon: '🚀',
        category: 'Sales & Marketing'
    },
    [SECTIONS.FUNNELS.UNPUBLISH]: {
        name: 'Unpublish Funnels',
        description: 'Take funnels offline',
        icon: '⏸️',
        category: 'Sales & Marketing'
    },
    [SECTIONS.FUNNELS.VIEW_ANALYTICS]: {
        name: 'View Funnel Analytics',
        description: 'Access funnel performance analytics',
        icon: '📊',
        category: 'Sales & Marketing'
    },
    [SECTIONS.FUNNELS.MANAGE]: {
        name: 'Manage Funnels',
        description: 'Full funnel management access',
        icon: '⚙️',
        category: 'Sales & Marketing'
    },
    
    // Leads
    [SECTIONS.LEADS.VIEW]: {
        name: 'View Leads',
        description: 'View assigned leads and their information',
        icon: '👁️',
        category: 'Lead Management'
    },
    [SECTIONS.LEADS.CREATE]: {
        name: 'Create Leads',
        description: 'Create new leads',
        icon: '➕',
        category: 'Lead Management'
    },
    [SECTIONS.LEADS.UPDATE]: {
        name: 'Update Leads',
        description: 'Update lead information and status',
        icon: '✏️',
        category: 'Lead Management'
    },
    [SECTIONS.LEADS.DELETE]: {
        name: 'Delete Leads',
        description: 'Delete leads from the system',
        icon: '🗑️',
        category: 'Lead Management'
    },
    [SECTIONS.LEADS.ASSIGN]: {
        name: 'Assign Leads',
        description: 'Assign leads to other staff members',
        icon: '👤',
        category: 'Lead Management'
    },
    [SECTIONS.LEADS.EXPORT]: {
        name: 'Export Leads',
        description: 'Export lead data to CSV/Excel',
        icon: '📤',
        category: 'Lead Management'
    },
    [SECTIONS.LEADS.MANAGE_ALL]: {
        name: 'Manage All Leads',
        description: 'View and manage all coach leads (not just assigned ones)',
        icon: '👥',
        category: 'Lead Management',
        isAdvanced: true
    },
    [SECTIONS.LEADS.MANAGE]: {
        name: 'Manage Leads',
        description: 'Full lead management access',
        icon: '⚙️',
        category: 'Lead Management'
    },
    
    // Messaging
    [SECTIONS.MESSAGING.VIEW]: {
        name: 'View Messages',
        description: 'View WhatsApp and email conversations',
        icon: '👁️',
        category: 'Communication'
    },
    [SECTIONS.MESSAGING.SEND]: {
        name: 'Send Messages',
        description: 'Send new WhatsApp and email messages',
        icon: '📤',
        category: 'Communication'
    },
    [SECTIONS.MESSAGING.REPLY]: {
        name: 'Reply to Messages',
        description: 'Reply to existing conversations',
        icon: '💬',
        category: 'Communication'
    },
    [SECTIONS.MESSAGING.DELETE]: {
        name: 'Delete Messages',
        description: 'Delete messages and conversations',
        icon: '🗑️',
        category: 'Communication'
    },
    [SECTIONS.MESSAGING.MANAGE_INBOX]: {
        name: 'Manage Inbox',
        description: 'Organize and manage message inbox',
        icon: '📥',
        category: 'Communication'
    },
    [SECTIONS.MESSAGING.MANAGE]: {
        name: 'Manage Messaging',
        description: 'Full messaging system management',
        icon: '⚙️',
        category: 'Communication'
    },
    
    // Calendar
    [SECTIONS.CALENDAR.VIEW]: {
        name: 'View Calendar',
        description: 'View calendar events and appointments',
        icon: '👁️',
        category: 'Operations'
    },
    [SECTIONS.CALENDAR.CREATE]: {
        name: 'Create Events',
        description: 'Create new calendar events',
        icon: '➕',
        category: 'Operations'
    },
    [SECTIONS.CALENDAR.UPDATE]: {
        name: 'Update Events',
        description: 'Modify existing calendar events',
        icon: '✏️',
        category: 'Operations'
    },
    [SECTIONS.CALENDAR.DELETE]: {
        name: 'Delete Events',
        description: 'Remove calendar events',
        icon: '🗑️',
        category: 'Operations'
    },
    [SECTIONS.CALENDAR.BOOK]: {
        name: 'Book Appointments',
        description: 'Book appointments for clients',
        icon: '📅',
        category: 'Operations'
    },
    [SECTIONS.CALENDAR.RESCHEDULE]: {
        name: 'Reschedule Appointments',
        description: 'Reschedule existing appointments',
        icon: '🔄',
        category: 'Operations'
    },
    [SECTIONS.CALENDAR.MANAGE]: {
        name: 'Manage Calendar',
        description: 'Full calendar management access',
        icon: '⚙️',
        category: 'Operations'
    },
    
    // Marketing
    [SECTIONS.MARKETING.VIEW]: {
        name: 'View Marketing',
        description: 'View marketing campaigns and analytics',
        icon: '👁️',
        category: 'Sales & Marketing'
    },
    [SECTIONS.MARKETING.CREATE_CAMPAIGN]: {
        name: 'Create Campaigns',
        description: 'Create new marketing campaigns',
        icon: '➕',
        category: 'Sales & Marketing'
    },
    [SECTIONS.MARKETING.UPDATE_CAMPAIGN]: {
        name: 'Update Campaigns',
        description: 'Modify existing marketing campaigns',
        icon: '✏️',
        category: 'Sales & Marketing'
    },
    [SECTIONS.MARKETING.DELETE_CAMPAIGN]: {
        name: 'Delete Campaigns',
        description: 'Remove marketing campaigns',
        icon: '🗑️',
        category: 'Sales & Marketing'
    },
    [SECTIONS.MARKETING.VIEW_ANALYTICS]: {
        name: 'View Marketing Analytics',
        description: 'Access marketing performance analytics',
        icon: '📊',
        category: 'Sales & Marketing'
    },
    [SECTIONS.MARKETING.MANAGE_CREDENTIALS]: {
        name: 'Manage Marketing Credentials',
        description: 'Configure marketing platform credentials',
        icon: '🔑',
        category: 'Sales & Marketing'
    },
    [SECTIONS.MARKETING.MANAGE]: {
        name: 'Manage Marketing',
        description: 'Full marketing management access',
        icon: '⚙️',
        category: 'Sales & Marketing'
    },
    
    // Automation
    [SECTIONS.AUTOMATION.VIEW]: {
        name: 'View Automation',
        description: 'View automation rules and sequences',
        icon: '👁️',
        category: 'Automation'
    },
    [SECTIONS.AUTOMATION.CREATE]: {
        name: 'Create Automation',
        description: 'Create new automation rules',
        icon: '➕',
        category: 'Automation'
    },
    [SECTIONS.AUTOMATION.UPDATE]: {
        name: 'Update Automation',
        description: 'Modify existing automation rules',
        icon: '✏️',
        category: 'Automation'
    },
    [SECTIONS.AUTOMATION.DELETE]: {
        name: 'Delete Automation',
        description: 'Remove automation rules',
        icon: '🗑️',
        category: 'Automation'
    },
    [SECTIONS.AUTOMATION.EXECUTE]: {
        name: 'Execute Automation',
        description: 'Run and test automation sequences',
        icon: '▶️',
        category: 'Automation'
    },
    [SECTIONS.AUTOMATION.MANAGE]: {
        name: 'Manage Automation',
        description: 'Full automation management access',
        icon: '⚙️',
        category: 'Automation'
    },
    
    // MLM
    [SECTIONS.MLM.VIEW]: {
        name: 'View MLM',
        description: 'View MLM network and hierarchy',
        icon: '👁️',
        category: 'Network'
    },
    [SECTIONS.MLM.VIEW_HIERARCHY]: {
        name: 'View Hierarchy',
        description: 'View detailed MLM hierarchy structure',
        icon: '🌳',
        category: 'Network'
    },
    [SECTIONS.MLM.MANAGE_COMMISSIONS]: {
        name: 'Manage Commissions',
        description: 'Manage commission distribution',
        icon: '💰',
        category: 'Network'
    },
    [SECTIONS.MLM.MANAGE]: {
        name: 'Manage MLM',
        description: 'Full MLM network management',
        icon: '⚙️',
        category: 'Network'
    },
    
    // Profile
    [SECTIONS.PROFILE.VIEW]: {
        name: 'View Profile',
        description: 'View your own profile',
        icon: '👁️',
        alwaysAccessible: true,
        category: 'Core'
    },
    [SECTIONS.PROFILE.UPDATE]: {
        name: 'Update Profile',
        description: 'Update your own profile and settings',
        icon: '✏️',
        alwaysAccessible: true,
        category: 'Core'
    },
    
    // Subscription
    [SECTIONS.SUBSCRIPTION.VIEW]: {
        name: 'View Subscription',
        description: 'View subscription plans and billing',
        icon: '👁️',
        coachOnly: true,
        category: 'Admin'
    },
    [SECTIONS.SUBSCRIPTION.MANAGE]: {
        name: 'Manage Subscription',
        description: 'Manage subscription and billing (Coach only)',
        icon: '💳',
        coachOnly: true,
        category: 'Admin'
    },
    
    // Zoom
    [SECTIONS.ZOOM.VIEW]: {
        name: 'View Zoom Settings',
        description: 'View Zoom integration settings',
        icon: '👁️',
        category: 'Integrations'
    },
    [SECTIONS.ZOOM.CREATE_MEETING]: {
        name: 'Create Zoom Meetings',
        description: 'Create new Zoom meetings',
        icon: '🎥',
        category: 'Integrations'
    },
    [SECTIONS.ZOOM.UPDATE_SETTINGS]: {
        name: 'Update Zoom Settings',
        description: 'Modify Zoom configuration',
        icon: '⚙️',
        category: 'Integrations'
    },
    [SECTIONS.ZOOM.MANAGE]: {
        name: 'Manage Zoom',
        description: 'Full Zoom integration management',
        icon: '⚙️',
        category: 'Integrations'
    },
    
    // Payment Gateway
    [SECTIONS.PAYMENT_GATEWAY.VIEW]: {
        name: 'View Payment Gateway',
        description: 'View payment gateway settings',
        icon: '👁️',
        category: 'Finance'
    },
    [SECTIONS.PAYMENT_GATEWAY.CONFIGURE]: {
        name: 'Configure Payment Gateway',
        description: 'Setup and configure payment gateways',
        icon: '⚙️',
        category: 'Finance'
    },
    [SECTIONS.PAYMENT_GATEWAY.MANAGE]: {
        name: 'Manage Payment Gateway',
        description: 'Full payment gateway management',
        icon: '💰',
        category: 'Finance'
    },
    
    // Domains
    [SECTIONS.DOMAINS.VIEW]: {
        name: 'View Domains',
        description: 'View custom domain configurations',
        icon: '👁️',
        category: 'Settings'
    },
    [SECTIONS.DOMAINS.CREATE]: {
        name: 'Create Domains',
        description: 'Add new custom domains',
        icon: '➕',
        category: 'Settings'
    },
    [SECTIONS.DOMAINS.UPDATE]: {
        name: 'Update Domains',
        description: 'Modify domain configurations',
        icon: '✏️',
        category: 'Settings'
    },
    [SECTIONS.DOMAINS.DELETE]: {
        name: 'Delete Domains',
        description: 'Remove custom domains',
        icon: '🗑️',
        category: 'Settings'
    },
    [SECTIONS.DOMAINS.MANAGE]: {
        name: 'Manage Domains',
        description: 'Full domain management access',
        icon: '🌐',
        category: 'Settings'
    },
    
    // Templates
    [SECTIONS.TEMPLATES.VIEW]: {
        name: 'View Templates',
        description: 'View message templates',
        icon: '👁️',
        category: 'Communication'
    },
    [SECTIONS.TEMPLATES.CREATE]: {
        name: 'Create Templates',
        description: 'Create new message templates',
        icon: '➕',
        category: 'Communication'
    },
    [SECTIONS.TEMPLATES.UPDATE]: {
        name: 'Update Templates',
        description: 'Modify existing templates',
        icon: '✏️',
        category: 'Communication'
    },
    [SECTIONS.TEMPLATES.DELETE]: {
        name: 'Delete Templates',
        description: 'Remove message templates',
        icon: '🗑️',
        category: 'Communication'
    },
    [SECTIONS.TEMPLATES.MANAGE]: {
        name: 'Manage Templates',
        description: 'Full template management access',
        icon: '📝',
        category: 'Communication'
    },
    
    // Courses
    [SECTIONS.COURSES.VIEW]: {
        name: 'View Courses',
        description: 'View course information and sales',
        icon: '👁️',
        category: 'Content'
    },
    [SECTIONS.COURSES.CREATE]: {
        name: 'Create Courses',
        description: 'Create new courses',
        icon: '➕',
        category: 'Content'
    },
    [SECTIONS.COURSES.UPDATE]: {
        name: 'Update Courses',
        description: 'Modify existing courses',
        icon: '✏️',
        category: 'Content'
    },
    [SECTIONS.COURSES.DELETE]: {
        name: 'Delete Courses',
        description: 'Remove courses',
        icon: '🗑️',
        category: 'Content'
    },
    [SECTIONS.COURSES.PUBLISH]: {
        name: 'Publish Courses',
        description: 'Make courses available for sale',
        icon: '🚀',
        category: 'Content'
    },
    [SECTIONS.COURSES.MANAGE_SALES]: {
        name: 'Manage Course Sales',
        description: 'Manage course sales and transactions',
        icon: '💰',
        category: 'Content'
    },
    [SECTIONS.COURSES.MANAGE]: {
        name: 'Manage Courses',
        description: 'Full course management access',
        icon: '📚',
        category: 'Content'
    },
    
    // Staff Management
    [SECTIONS.STAFF_MANAGEMENT.VIEW]: {
        name: 'View Staff',
        description: 'View staff member information',
        icon: '👁️',
        category: 'Admin'
    },
    [SECTIONS.STAFF_MANAGEMENT.CREATE]: {
        name: 'Create Staff',
        description: 'Add new staff members',
        icon: '➕',
        category: 'Admin'
    },
    [SECTIONS.STAFF_MANAGEMENT.UPDATE]: {
        name: 'Update Staff',
        description: 'Modify staff member information',
        icon: '✏️',
        category: 'Admin'
    },
    [SECTIONS.STAFF_MANAGEMENT.DELETE]: {
        name: 'Delete Staff',
        description: 'Remove staff members',
        icon: '🗑️',
        category: 'Admin'
    },
    [SECTIONS.STAFF_MANAGEMENT.MANAGE_PERMISSIONS]: {
        name: 'Manage Staff Permissions',
        description: 'Assign and modify staff permissions',
        icon: '🔑',
        category: 'Admin'
    },
    [SECTIONS.STAFF_MANAGEMENT.MANAGE]: {
        name: 'Manage Staff',
        description: 'Full staff management access',
        icon: '👨‍💼',
        category: 'Admin'
    }
};

// ===== SECTION TO ROUTE MAPPING =====
// Maps sections to their corresponding route patterns
const SECTION_ROUTES = {
    'dashboard': [
        '/api/coach/dashboard',
        '/api/coach/daily-feed'
    ],
    'funnels': [
        '/api/funnels',
        '/api/funnel'
    ],
    'leads': [
        '/api/leads',
        '/api/lead',
        '/api/lead-magnets',
        '/api/lead-magnet-management',
        '/api/lead-scoring'
    ],
    'messaging': [
        '/api/whatsapp',
        '/api/unified-messaging',
        '/api/inbox',
        '/api/messaging'
    ],
    'calendar': [
        '/api/coach/availability',
        '/api/staff-calendar',
        '/api/staff-appointments'
    ],
    'marketing': [
        '/api/marketing',
        '/api/ads',
        '/api/ai-ads',
        '/api/coach/marketing-credentials'
    ],
    'automation': [
        '/api/automation-rules',
        '/api/nurturing-sequence',
        '/api/workflow',
        '/api/ai'
    ],
    'mlm': [
        '/api/mlm',
        '/api/coach/hierarchy',
        '/api/advanced-mlm'
    ],
    'profile': [
        '/api/staff/profile'
    ],
    'subscription': [
        '/api/subscription',
        '/api/coach/subscription-limits'
    ],
    'zoom': [
        '/api/zoom'
    ],
    'payment_gateway': [
        '/api/coach/payment',
        '/api/central-payment'
    ],
    'domains': [
        '/api/custom-domain'
    ],
    'templates': [
        '/api/message-templates'
    ],
    'courses': [
        '/api/courses',
        '/api/course-management',
        '/api/paymentsv1'
    ],
    'staff': [
        '/api/coach/staff'
    ]
};

// ===== PERMISSION PRESETS =====
// Common permission combinations for different staff roles
const PERMISSION_PRESETS = {
    'Sales Representative': [
        SECTIONS.DASHBOARD.VIEW,
        SECTIONS.LEADS.VIEW,
        SECTIONS.LEADS.CREATE,
        SECTIONS.LEADS.UPDATE,
        SECTIONS.FUNNELS.VIEW,
        SECTIONS.CALENDAR.VIEW,
        SECTIONS.CALENDAR.BOOK,
        SECTIONS.MESSAGING.VIEW,
        SECTIONS.MESSAGING.SEND,
        SECTIONS.MESSAGING.REPLY,
        SECTIONS.PROFILE.VIEW,
        SECTIONS.PROFILE.UPDATE
    ],
    'Lead Manager': [
        SECTIONS.DASHBOARD.VIEW,
        SECTIONS.LEADS.VIEW,
        SECTIONS.LEADS.CREATE,
        SECTIONS.LEADS.UPDATE,
        SECTIONS.LEADS.DELETE,
        SECTIONS.LEADS.ASSIGN,
        SECTIONS.LEADS.EXPORT,
        SECTIONS.FUNNELS.VIEW,
        SECTIONS.CALENDAR.VIEW,
        SECTIONS.CALENDAR.BOOK,
        SECTIONS.MESSAGING.VIEW,
        SECTIONS.MESSAGING.SEND,
        SECTIONS.MESSAGING.REPLY,
        SECTIONS.PROFILE.VIEW,
        SECTIONS.PROFILE.UPDATE
    ],
    'Senior Lead Manager': [
        SECTIONS.DASHBOARD.VIEW,
        SECTIONS.LEADS.VIEW,
        SECTIONS.LEADS.CREATE,
        SECTIONS.LEADS.UPDATE,
        SECTIONS.LEADS.DELETE,
        SECTIONS.LEADS.ASSIGN,
        SECTIONS.LEADS.EXPORT,
        SECTIONS.LEADS.MANAGE_ALL,
        SECTIONS.LEADS.MANAGE,
        SECTIONS.FUNNELS.VIEW,
        SECTIONS.CALENDAR.VIEW,
        SECTIONS.CALENDAR.MANAGE,
        SECTIONS.MESSAGING.VIEW,
        SECTIONS.MESSAGING.MANAGE,
        SECTIONS.PROFILE.VIEW,
        SECTIONS.PROFILE.UPDATE
    ],
    'Marketing Manager': [
        SECTIONS.DASHBOARD.VIEW,
        SECTIONS.MARKETING.VIEW,
        SECTIONS.MARKETING.CREATE_CAMPAIGN,
        SECTIONS.MARKETING.UPDATE_CAMPAIGN,
        SECTIONS.MARKETING.VIEW_ANALYTICS,
        SECTIONS.MARKETING.MANAGE_CREDENTIALS,
        SECTIONS.LEADS.VIEW,
        SECTIONS.LEADS.CREATE,
        SECTIONS.AUTOMATION.VIEW,
        SECTIONS.AUTOMATION.CREATE,
        SECTIONS.TEMPLATES.VIEW,
        SECTIONS.TEMPLATES.CREATE,
        SECTIONS.PROFILE.VIEW,
        SECTIONS.PROFILE.UPDATE
    ],
    'Operations Manager': [
        SECTIONS.DASHBOARD.VIEW,
        SECTIONS.CALENDAR.VIEW,
        SECTIONS.CALENDAR.CREATE,
        SECTIONS.CALENDAR.UPDATE,
        SECTIONS.CALENDAR.BOOK,
        SECTIONS.CALENDAR.RESCHEDULE,
        SECTIONS.CALENDAR.MANAGE,
        SECTIONS.LEADS.VIEW,
        SECTIONS.LEADS.UPDATE,
        SECTIONS.MESSAGING.VIEW,
        SECTIONS.MESSAGING.SEND,
        SECTIONS.MESSAGING.REPLY,
        SECTIONS.TEMPLATES.VIEW,
        SECTIONS.PROFILE.VIEW,
        SECTIONS.PROFILE.UPDATE
    ],
    'Content Manager': [
        SECTIONS.DASHBOARD.VIEW,
        SECTIONS.COURSES.VIEW,
        SECTIONS.COURSES.CREATE,
        SECTIONS.COURSES.UPDATE,
        SECTIONS.COURSES.PUBLISH,
        SECTIONS.TEMPLATES.VIEW,
        SECTIONS.TEMPLATES.CREATE,
        SECTIONS.TEMPLATES.UPDATE,
        SECTIONS.PROFILE.VIEW,
        SECTIONS.PROFILE.UPDATE
    ],
    'Technical Manager': [
        SECTIONS.DASHBOARD.VIEW,
        SECTIONS.ZOOM.VIEW,
        SECTIONS.ZOOM.CREATE_MEETING,
        SECTIONS.ZOOM.UPDATE_SETTINGS,
        SECTIONS.ZOOM.MANAGE,
        SECTIONS.PAYMENT_GATEWAY.VIEW,
        SECTIONS.PAYMENT_GATEWAY.CONFIGURE,
        SECTIONS.DOMAINS.VIEW,
        SECTIONS.DOMAINS.CREATE,
        SECTIONS.DOMAINS.UPDATE,
        SECTIONS.AUTOMATION.VIEW,
        SECTIONS.AUTOMATION.CREATE,
        SECTIONS.AUTOMATION.UPDATE,
        SECTIONS.PROFILE.VIEW,
        SECTIONS.PROFILE.UPDATE
    ],
    'Team Lead': [
        SECTIONS.DASHBOARD.VIEW,
        SECTIONS.LEADS.VIEW,
        SECTIONS.LEADS.CREATE,
        SECTIONS.LEADS.UPDATE,
        SECTIONS.LEADS.DELETE,
        SECTIONS.LEADS.ASSIGN,
        SECTIONS.LEADS.EXPORT,
        SECTIONS.LEADS.MANAGE_ALL,
        SECTIONS.LEADS.MANAGE,
        SECTIONS.FUNNELS.VIEW,
        SECTIONS.FUNNELS.CREATE,
        SECTIONS.FUNNELS.UPDATE,
        SECTIONS.CALENDAR.VIEW,
        SECTIONS.CALENDAR.MANAGE,
        SECTIONS.MESSAGING.VIEW,
        SECTIONS.MESSAGING.MANAGE,
        SECTIONS.MARKETING.VIEW,
        SECTIONS.MARKETING.CREATE_CAMPAIGN,
        SECTIONS.AUTOMATION.VIEW,
        SECTIONS.AUTOMATION.CREATE,
        SECTIONS.TEMPLATES.VIEW,
        SECTIONS.TEMPLATES.CREATE,
        SECTIONS.TEMPLATES.UPDATE,
        SECTIONS.STAFF_MANAGEMENT.VIEW,
        SECTIONS.STAFF_MANAGEMENT.UPDATE,
        SECTIONS.STAFF_MANAGEMENT.MANAGE_PERMISSIONS,
        SECTIONS.PROFILE.VIEW,
        SECTIONS.PROFILE.UPDATE
    ],
    'Full Access': [
        SECTIONS.DASHBOARD.VIEW,
        SECTIONS.FUNNELS.VIEW,
        SECTIONS.FUNNELS.CREATE,
        SECTIONS.FUNNELS.UPDATE,
        SECTIONS.FUNNELS.DELETE,
        SECTIONS.FUNNELS.PUBLISH,
        SECTIONS.FUNNELS.UNPUBLISH,
        SECTIONS.FUNNELS.VIEW_ANALYTICS,
        SECTIONS.FUNNELS.MANAGE,
        SECTIONS.LEADS.VIEW,
        SECTIONS.LEADS.CREATE,
        SECTIONS.LEADS.UPDATE,
        SECTIONS.LEADS.DELETE,
        SECTIONS.LEADS.ASSIGN,
        SECTIONS.LEADS.EXPORT,
        SECTIONS.LEADS.MANAGE_ALL,
        SECTIONS.LEADS.MANAGE,
        SECTIONS.MESSAGING.VIEW,
        SECTIONS.MESSAGING.SEND,
        SECTIONS.MESSAGING.REPLY,
        SECTIONS.MESSAGING.DELETE,
        SECTIONS.MESSAGING.MANAGE_INBOX,
        SECTIONS.MESSAGING.MANAGE,
        SECTIONS.CALENDAR.VIEW,
        SECTIONS.CALENDAR.CREATE,
        SECTIONS.CALENDAR.UPDATE,
        SECTIONS.CALENDAR.DELETE,
        SECTIONS.CALENDAR.BOOK,
        SECTIONS.CALENDAR.RESCHEDULE,
        SECTIONS.CALENDAR.MANAGE,
        SECTIONS.MARKETING.VIEW,
        SECTIONS.MARKETING.CREATE_CAMPAIGN,
        SECTIONS.MARKETING.UPDATE_CAMPAIGN,
        SECTIONS.MARKETING.DELETE_CAMPAIGN,
        SECTIONS.MARKETING.VIEW_ANALYTICS,
        SECTIONS.MARKETING.MANAGE_CREDENTIALS,
        SECTIONS.MARKETING.MANAGE,
        SECTIONS.AUTOMATION.VIEW,
        SECTIONS.AUTOMATION.CREATE,
        SECTIONS.AUTOMATION.UPDATE,
        SECTIONS.AUTOMATION.DELETE,
        SECTIONS.AUTOMATION.EXECUTE,
        SECTIONS.AUTOMATION.MANAGE,
        SECTIONS.MLM.VIEW,
        SECTIONS.MLM.VIEW_HIERARCHY,
        SECTIONS.MLM.MANAGE_COMMISSIONS,
        SECTIONS.MLM.MANAGE,
        SECTIONS.ZOOM.VIEW,
        SECTIONS.ZOOM.CREATE_MEETING,
        SECTIONS.ZOOM.UPDATE_SETTINGS,
        SECTIONS.ZOOM.MANAGE,
        SECTIONS.PAYMENT_GATEWAY.VIEW,
        SECTIONS.PAYMENT_GATEWAY.CONFIGURE,
        SECTIONS.PAYMENT_GATEWAY.MANAGE,
        SECTIONS.DOMAINS.VIEW,
        SECTIONS.DOMAINS.CREATE,
        SECTIONS.DOMAINS.UPDATE,
        SECTIONS.DOMAINS.DELETE,
        SECTIONS.DOMAINS.MANAGE,
        SECTIONS.TEMPLATES.VIEW,
        SECTIONS.TEMPLATES.CREATE,
        SECTIONS.TEMPLATES.UPDATE,
        SECTIONS.TEMPLATES.DELETE,
        SECTIONS.TEMPLATES.MANAGE,
        SECTIONS.COURSES.VIEW,
        SECTIONS.COURSES.CREATE,
        SECTIONS.COURSES.UPDATE,
        SECTIONS.COURSES.DELETE,
        SECTIONS.COURSES.PUBLISH,
        SECTIONS.COURSES.MANAGE_SALES,
        SECTIONS.COURSES.MANAGE,
        SECTIONS.STAFF_MANAGEMENT.VIEW,
        SECTIONS.STAFF_MANAGEMENT.CREATE,
        SECTIONS.STAFF_MANAGEMENT.UPDATE,
        SECTIONS.STAFF_MANAGEMENT.DELETE,
        SECTIONS.STAFF_MANAGEMENT.MANAGE_PERMISSIONS,
        SECTIONS.STAFF_MANAGEMENT.MANAGE,
        SECTIONS.PROFILE.VIEW,
        SECTIONS.PROFILE.UPDATE
        // Subscription excluded
    ]
};

// ===== VALIDATION FUNCTIONS =====

/**
 * Get all valid permission strings (flattened)
 * @returns {string[]} - Array of all valid permissions
 */
function getAllValidPermissions() {
    const permissions = [];
    
    function flattenSections(obj) {
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                permissions.push(obj[key]);
            } else if (typeof obj[key] === 'object') {
                flattenSections(obj[key]);
            }
        }
    }
    
    flattenSections(SECTIONS);
    return permissions;
}

/**
 * Check if a section permission is valid
 * @param {string} section - Section to validate
 * @returns {boolean} - True if valid
 */
function isValidSection(section) {
    const allPermissions = getAllValidPermissions();
    return allPermissions.includes(section);
}

/**
 * Validate an array of section permissions
 * @param {string[]} sections - Array of sections to validate
 * @returns {Object} - { valid: boolean, invalid: string[] }
 */
function validateSections(sections) {
    if (!Array.isArray(sections)) {
        return { valid: false, invalid: [], error: 'Sections must be an array' };
    }
    
    const invalid = sections.filter(s => !isValidSection(s));
    return {
        valid: invalid.length === 0,
        invalid,
        error: invalid.length > 0 ? `Invalid sections: ${invalid.join(', ')}` : null
    };
}

/**
 * Check if staff has access to a section
 * @param {string[]} staffSections - Staff's section permissions array
 * @param {string} requiredSection - Required section
 * @returns {boolean} - True if staff has access
 */
function hasSection(staffSections, requiredSection) {
    if (!Array.isArray(staffSections)) return false;
    
    // Check if section is always accessible
    const metadata = SECTION_METADATA[requiredSection];
    if (metadata && metadata.alwaysAccessible) return true;
    
    return staffSections.includes(requiredSection);
}

/**
 * Check if staff has access to any of the required sections
 * @param {string[]} staffSections - Staff's section permissions array
 * @param {string[]} requiredSections - Array of required sections (any one)
 * @returns {boolean} - True if staff has at least one section
 */
function hasAnySection(staffSections, requiredSections) {
    if (!Array.isArray(staffSections) || !Array.isArray(requiredSections)) return false;
    return requiredSections.some(section => hasSection(staffSections, section));
}

/**
 * Check if staff has access to all required sections
 * @param {string[]} staffSections - Staff's section permissions array
 * @param {string[]} requiredSections - Array of required sections (all)
 * @returns {boolean} - True if staff has all sections
 */
function hasAllSections(staffSections, requiredSections) {
    if (!Array.isArray(staffSections) || !Array.isArray(requiredSections)) return false;
    return requiredSections.every(section => hasSection(staffSections, section));
}

/**
 * Get section for a route path
 * @param {string} routePath - Route path to check
 * @returns {string|null} - Section name or null if not found
 */
function getSectionForRoute(routePath) {
    for (const [section, routes] of Object.entries(SECTION_ROUTES)) {
        if (routes.some(route => routePath.startsWith(route))) {
            return section;
        }
    }
    return null;
}

/**
 * Check if section is blocked for staff
 * @param {string} section - Section to check
 * @returns {boolean} - True if blocked for staff
 */
function isCoachOnly(section) {
    const metadata = SECTION_METADATA[section];
    return metadata && metadata.coachOnly === true;
}

/**
 * Get all available sections
 * @param {boolean} includeCoachOnly - Include coach-only sections
 * @returns {string[]} - Array of all sections
 */
function getAllSections(includeCoachOnly = false) {
    const sections = Object.values(SECTIONS);
    if (includeCoachOnly) return sections;
    return sections.filter(section => !isCoachOnly(section));
}

/**
 * Get sections by category
 * @param {string} category - Category name
 * @returns {string[]} - Array of sections in category
 */
function getSectionsByCategory(category) {
    return Object.entries(SECTION_METADATA)
        .filter(([_, metadata]) => metadata.category === category)
        .map(([section, _]) => section);
}

/**
 * Get all categories
 * @returns {string[]} - Array of unique categories
 */
function getCategories() {
    return [...new Set(Object.values(SECTION_METADATA).map(m => m.category))];
}

/**
 * Get sections grouped by category
 * @returns {Object} - Object with categories as keys and sections as values
 */
function getSectionsGroupedByCategory() {
    const grouped = {};
    for (const [section, metadata] of Object.entries(SECTION_METADATA)) {
        const category = metadata.category;
        if (!grouped[category]) {
            grouped[category] = [];
        }
        grouped[category].push({
            section,
            ...metadata
        });
    }
    return grouped;
}

/**
 * Get permission preset by name
 * @param {string} presetName - Name of preset
 * @returns {string[]} - Array of sections in preset
 */
function getPermissionPreset(presetName) {
    return PERMISSION_PRESETS[presetName] || [];
}

/**
 * Get available permission presets
 * @returns {string[]} - Array of available preset names
 */
function getAvailablePresets() {
    return Object.keys(PERMISSION_PRESETS);
}

/**
 * Check if staff has a specific lead permission
 * @param {string[]} staffPermissions - Staff's permission array
 * @param {string} requiredPermission - Required lead permission
 * @returns {boolean} - True if staff has permission
 */
function hasLeadPermission(staffPermissions, requiredPermission) {
    if (!Array.isArray(staffPermissions)) return false;
    
    // Check if staff has the specific permission
    if (staffPermissions.includes(requiredPermission)) {
        return true;
    }
    
    // Check if staff has MANAGE_ALL which grants all lead permissions
    if (staffPermissions.includes(SECTIONS.LEADS.MANAGE_ALL)) {
        return true;
    }
    
    return false;
}

/**
 * Check if staff can view all leads (not just assigned)
 * @param {string[]} staffPermissions - Staff's permission array
 * @returns {boolean} - True if staff can view all leads
 */
function canViewAllLeads(staffPermissions) {
    if (!Array.isArray(staffPermissions)) return false;
    return staffPermissions.includes(SECTIONS.LEADS.MANAGE_ALL);
}

/**
 * Get lead permissions for staff
 * @param {string[]} staffPermissions - Staff's permission array
 * @returns {Object} - Object with boolean flags for each lead permission
 */
function getLeadPermissions(staffPermissions) {
    if (!Array.isArray(staffPermissions)) {
        return {
            canView: false,
            canCreate: false,
            canUpdate: false,
            canDelete: false,
            canAssign: false,
            canExport: false,
            canManageAll: false
        };
    }
    
    return {
        canView: hasLeadPermission(staffPermissions, SECTIONS.LEADS.VIEW),
        canCreate: hasLeadPermission(staffPermissions, SECTIONS.LEADS.CREATE),
        canUpdate: hasLeadPermission(staffPermissions, SECTIONS.LEADS.UPDATE),
        canDelete: hasLeadPermission(staffPermissions, SECTIONS.LEADS.DELETE),
        canAssign: hasLeadPermission(staffPermissions, SECTIONS.LEADS.ASSIGN),
        canExport: hasLeadPermission(staffPermissions, SECTIONS.LEADS.EXPORT),
        canManageAll: staffPermissions.includes(SECTIONS.LEADS.MANAGE_ALL)
    };
}

module.exports = {
    SECTIONS,
    SECTION_METADATA,
    SECTION_ROUTES,
    PERMISSION_PRESETS,
    isValidSection,
    validateSections,
    hasSection,
    hasAnySection,
    hasAllSections,
    getSectionForRoute,
    isCoachOnly,
    getAllSections,
    getSectionsByCategory,
    getCategories,
    getSectionsGroupedByCategory,
    getPermissionPreset,
    getAvailablePresets,
    getAllValidPermissions,
    hasLeadPermission,
    canViewAllLeads,
    getLeadPermissions
};

