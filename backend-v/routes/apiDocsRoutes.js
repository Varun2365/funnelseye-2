// API Documentation Routes
// This file will contain the API documentation HTML generation logic moved from main.js

const express = require('express');
const router = express.Router();

// TODO: Add the API documentation route logic here
const allApiRoutes = {
    // ===== 🔐 CORE AUTHENTICATION & USER MANAGEMENT =====
    '🔐 Authentication & User Management': [
        { method: 'POST', path: '/api/auth/signup', desc: 'User Registration', sample: { name: 'John Doe', email: 'john@example.com', password: 'Passw0rd!', role: 'coach' } },
        { method: 'POST', path: '/api/auth/verify-otp', desc: 'OTP Verification', sample: { email: 'john@example.com', otp: '123456' } },
        { method: 'POST', path: '/api/auth/login', desc: 'User Login', sample: { email: 'john@example.com', password: 'Passw0rd!' } },
        { method: 'POST', path: '/api/auth/forgot-password', desc: 'Request Password Reset', sample: { email: 'john@example.com' } },
        { method: 'POST', path: '/api/auth/reset-password', desc: 'Reset Password with Token', sample: { token: 'reset_token_123', password: 'NewPassw0rd!' } },
        { method: 'POST', path: '/api/auth/resend-otp', desc: 'Resend Verification OTP', sample: { email: 'john@example.com' } },
        { method: 'GET', path: '/api/auth/me', desc: 'Get Current User' },
        { method: 'GET', path: '/api/auth/logout', desc: 'Logout User' },
    ],
    // ===== 📈 FUNNEL & WEBSITE MANAGEMENT =====
    '📈 Funnel Management': [
        { method: 'GET', path: '/api/funnels/coach/:coachId/funnels', desc: 'Get all Funnels for a Coach' },
        { method: 'GET', path: '/api/funnels/coach/:coachId/funnels/:funnelId', desc: 'Get Single Funnel Details' },
        { method: 'POST', path: '/api/funnels/coach/:coachId/funnels', desc: 'Create New Funnel', sample: { name: 'My Funnel', description: 'Demo', funnelUrl: 'coach-1/demo-funnel', targetAudience: 'customer', stages: [] } },
        { method: 'PUT', path: '/api/funnels/coach/:coachId/funnels/:funnelId', desc: 'Update Funnel', sample: { name: 'Updated Funnel Name' } },
        { method: 'DELETE', path: '/api/funnels/coach/:coachId/funnel/:funnelId', desc: 'Delete Funnel' },
        { method: 'GET', path: '/api/funnels/coach/:coachId/funnels/:funnelId/stages/:stageType', desc: 'Get Stages by Type' },
        { method: 'POST', path: '/api/funnels/:funnelId/stages', desc: 'Add Stage to Funnel', sample: { pageId: 'landing-1', name: 'Landing', type: 'Landing', html: '<div>...</div>' } },
        { method: 'PUT', path: '/api/funnels/:funnelId/stages/:stageSettingsId', desc: 'Update Stage Settings', sample: { name: 'New name', isEnabled: true } },
        { method: 'POST', path: '/api/funnels/track', desc: 'Track Funnel Event', sample: { funnelId: '...', stageId: '...', eventType: 'PageView', sessionId: 'sess-123', metadata: { ref: 'ad' } } },
        { method: 'GET', path: '/api/funnels/:funnelId/analytics', desc: 'Get Funnel Analytics Data' },
        // // Custom URL Management
        // { method: 'POST', path: '/api/funnels/:funnelId/custom-urls', desc: 'Add Custom URL to Funnel', sample: { customSlug: 'my-brand', displayName: 'My Branded URL', description: 'Custom URL for marketing' } },
        // { method: 'GET', path: '/api/funnels/:funnelId/custom-urls', desc: 'Get All Custom URLs for Funnel' },
        // { method: 'PUT', path: '/api/funnels/:funnelId/custom-urls/:customSlug', desc: 'Update Custom URL', sample: { displayName: 'Updated Name', isActive: true } },
        // { method: 'DELETE', path: '/api/funnels/:funnelId/custom-urls/:customSlug', desc: 'Delete Custom URL' },
        // { method: 'GET', path: '/api/funnels/:funnelId/custom-urls/:customSlug/analytics', desc: 'Get Custom URL Analytics' },
    ],

    // ===== 🌐 CUSTOM DOMAIN & URL MANAGEMENT =====
    '🌐 Custom Domain Management': [
        { method: 'POST', path: '/api/custom-domains', desc: 'Add Custom Domain', sample: { domain: 'coachvarun.in' } },
        { method: 'GET', path: '/api/custom-domains', desc: 'Get All Custom Domains for Coach' },
        { method: 'GET', path: '/api/custom-domains/:id', desc: 'Get Single Custom Domain Details' },
        { method: 'PUT', path: '/api/custom-domains/:id', desc: 'Update Custom Domain Settings' },
        { method: 'DELETE', path: '/api/custom-domains/:id', desc: 'Delete Custom Domain' },
        { method: 'POST', path: '/api/custom-domains/:id/verify-dns', desc: 'Verify DNS Records' },
        { method: 'POST', path: '/api/custom-domains/:id/generate-ssl', desc: 'Generate SSL Certificate' },
        { method: 'GET', path: '/api/custom-domains/:id/dns-instructions', desc: 'Get DNS Setup Instructions' },
        { method: 'GET', path: '/api/custom-domains/resolve/:hostname', desc: 'Resolve Domain by Hostname (Public)' },
    ],
    // ===== 🎯 LEAD MANAGEMENT & CRM =====
    '🎯 Lead Management (CRM)': [
        { method: 'POST', path: '/api/leads', desc: 'Create New Lead (PUBLIC)', sample: { coachId: '...', funnelId: '...', name: 'Jane', email: 'jane@ex.com', phone: '+11234567890', source: 'Web Form' } },
        { method: 'GET', path: '/api/leads', desc: 'Get All Leads (filters/pagination)' },
        { method: 'GET', path: '/api/leads/:leadId', desc: 'Get Single Lead by ID' },
        { method: 'PUT', path: '/api/leads/:leadId', desc: 'Update Lead (PUBLIC - No Auth Required)', sample: { status: 'Contacted', leadTemperature: 'Hot', vslWatchPercentage: 75.5 } },
        { method: 'DELETE', path: '/api/leads/:leadId', desc: 'Delete Lead' },
        { method: 'POST', path: '/api/leads/:leadId/followup', desc: 'Add Follow-up Note', sample: { note: 'Called the lead', nextFollowUpAt: '2025-01-20T10:00:00Z' } },
        { method: 'GET', path: '/api/leads/followups/upcoming', desc: 'Get Leads for Upcoming Follow-ups' },
        { method: 'POST', path: '/api/leads/:leadId/ai-rescore', desc: 'AI Rescore a Lead' },
        { method: 'POST', path: '/api/leads/assign-nurturing-sequence', desc: 'Assign a nurturing sequence to a lead', sample: { leadId: '...', sequenceId: '...' } },
        { method: 'POST', path: '/api/leads/advance-nurturing-step', desc: 'Advance a lead to the next nurturing step', sample: { leadId: '...' } },
        { method: 'GET', path: '/api/leads/:leadId/nurturing-progress', desc: 'Get nurturing sequence progress for a lead' },
        // AI-powered Lead Management Endpoints
        { method: 'GET', path: '/api/leads/:leadId/ai-qualify', desc: 'AI-powered lead qualification and insights', sample: { leadId: '...' } },
        { method: 'POST', path: '/api/leads/:leadId/generate-nurturing-sequence', desc: 'Generate AI-powered nurturing strategy', sample: { leadId: '...', sequenceType: 'warm_lead' } },
        { method: 'POST', path: '/api/leads/:leadId/generate-followup-message', desc: 'Generate AI-powered follow-up message', sample: { leadId: '...', followUpType: 'first_followup', context: 'General follow-up' } },
    ],
    // ===== 🌱 LEAD NURTURING & SEQUENCES =====
    '🌱 Lead Nurturing': [
        { method: 'POST', path: '/api/lead-nurturing/assign-sequence', desc: 'Assign nurturing sequence to lead', sample: { leadId: '...', sequenceId: '...' } },
        { method: 'POST', path: '/api/lead-nurturing/progress-step', desc: 'Progress lead to next nurturing step', sample: { leadId: '...' } },
        { method: 'GET', path: '/api/lead-nurturing/status', desc: 'Get nurturing status for leads' },
    ],
    // ===== 📊 LEAD SCORING & TRACKING =====
    '📊 Lead Scoring & Tracking': [
        { method: 'GET', path: '/api/lead-scoring/email-opened', desc: 'Track email opened event' },
        { method: 'GET', path: '/api/lead-scoring/link-clicked', desc: 'Track link clicked event' },
        // WhatsApp scoring moved to dustbin/whatsapp-dump/
        { method: 'POST', path: '/api/lead-scoring/form-submitted', desc: 'Track form submission event', sample: { leadId: '...', formData: {} } },
        { method: 'POST', path: '/api/lead-scoring/call-booked', desc: 'Track call booking event', sample: { leadId: '...', callTime: '2025-01-25T10:00:00Z' } },
        { method: 'POST', path: '/api/lead-scoring/call-attended', desc: 'Track call attendance event', sample: { leadId: '...', duration: 30 } },
        { method: 'POST', path: '/api/lead-scoring/profile-completed', desc: 'Track profile completion event', sample: { leadId: '...' } },
        { method: 'POST', path: '/api/lead-scoring/lead-magnet-converted', desc: 'Track lead magnet conversion', sample: { leadId: '...', magnetId: '...' } },
        { method: 'POST', path: '/api/lead-scoring/followup-added', desc: 'Track followup addition', sample: { leadId: '...', followupNote: 'Called prospect' } },
        { method: 'POST', path: '/api/lead-scoring/booking-recovered', desc: 'Track booking recovery', sample: { leadId: '...', originalBookingId: '...' } },
        { method: 'POST', path: '/api/lead-scoring/inactivity-decay', desc: 'Track inactivity decay', sample: { leadId: '...', daysInactive: 30 } },
        { method: 'POST', path: '/api/lead-scoring/unsubscribed', desc: 'Track unsubscription event', sample: { leadId: '...', reason: 'No longer interested' } },
        { method: 'POST', path: '/api/lead-scoring/email-bounced', desc: 'Track email bounce event', sample: { leadId: '...', bounceType: 'hard' } },
    ],
    // ===== 📱 WHATSAPP INTEGRATION & AUTOMATION =====
    // WhatsApp integration moved to dustbin/whatsapp-dump/
    // '📱 WhatsApp Integration': [
    //     // WhatsApp integration moved to dustbin/whatsapp-dump/
    // ],
    // ===== 🌱 NURTURING SEQUENCES & AUTOMATION =====
    '🌱 Nurturing Sequences': [
        { method: 'POST', path: '/api/nurturing-sequences', desc: 'Create new nurturing sequence', sample: { name: 'Warm Lead Sequence', description: '5-step sequence for warm leads', category: 'warm_lead', steps: [{ stepNumber: 1, name: 'Welcome Message', actionType: 'send_email', actionConfig: { message: 'Hi {{lead.name}}, welcome!' }, delayDays: 0 }] } },
        { method: 'GET', path: '/api/nurturing-sequences', desc: 'Get all nurturing sequences for coach' },
        { method: 'GET', path: '/api/nurturing-sequences/:id', desc: 'Get single nurturing sequence details' },
        { method: 'PUT', path: '/api/nurturing-sequences/:id', desc: 'Update nurturing sequence' },
        { method: 'DELETE', path: '/api/nurturing-sequences/:id', desc: 'Delete nurturing sequence' },
        { method: 'POST', path: '/api/nurturing-sequences/:id/duplicate', desc: 'Duplicate a nurturing sequence', sample: { newName: 'Warm Lead Sequence Copy' } },
        { method: 'PUT', path: '/api/nurturing-sequences/:id/toggle', desc: 'Toggle sequence active status' },
        { method: 'POST', path: '/api/nurturing-sequences/assign-to-funnel', desc: 'Assign sequence to funnel', sample: { sequenceId: '...', funnelId: '...' } },
        { method: 'POST', path: '/api/nurturing-sequences/remove-from-funnel', desc: 'Remove sequence from funnel', sample: { sequenceId: '...', funnelId: '...' } },
        { method: 'POST', path: '/api/nurturing-sequences/bulk-assign', desc: 'Bulk assign sequences to funnels', sample: { sequenceIds: ['seq1', 'seq2'], funnelIds: ['funnel1', 'funnel2'] } },
        { method: 'GET', path: '/api/nurturing-sequences/:id/stats', desc: 'Get sequence execution statistics' },
        { method: 'GET', path: '/api/nurturing-sequences/category/:category', desc: 'Get sequences by category' },
        { method: 'POST', path: '/api/nurturing-sequences/:id/test', desc: 'Test sequence execution (dry run)', sample: { leadId: '...' } },
    ],
    // ===== 📊 ADVANCED MLM NETWORK & HIERARCHY =====
    '📊 Advanced MLM Network (Unified)': {
        'GET /api/advanced-mlm/health': {
            description: 'Health check for MLM system',
            note: 'Public endpoint to check system health',
            example: 'GET /api/advanced-mlm/health'
        },
        'GET /api/advanced-mlm/test-middleware': {
            description: 'Test middleware chain (Admin only)',
            note: 'Admin endpoint to test if middleware chain is working correctly',
            example: 'GET /api/advanced-mlm/test-middleware (with admin JWT token)'
        },
        'POST /api/advanced-mlm/setup-hierarchy': {
            description: 'Setup default coach ranks (Admin only)',
            body: 'No body required',
            note: 'Creates 12 default coach ranks (Distributor Coach to Founder\'s Circle)',
            example: 'POST /api/advanced-mlm/setup-hierarchy (with admin JWT token)'
        },
        'GET /api/advanced-mlm/hierarchy-levels': {
            description: 'Get all available coach ranks',
            body: 'No body required',
            note: 'Returns list of coach ranks with names and descriptions',
            example: 'GET /api/advanced-mlm/hierarchy-levels'
        },
        'POST /api/advanced-mlm/generate-coach-id': {
            description: 'Generate unique coach ID',
            body: 'No body required',
            note: 'Generates a unique 8-character coach ID',
            example: 'POST /api/advanced-mlm/generate-coach-id'
        },
        'GET /api/advanced-mlm/search-sponsor': {
            description: 'Search for sponsors (digital system users only)',
            query: {
                searchTerm: 'string (required)',
                searchType: 'string (optional: "digital")'
            },
            note: 'Search for potential sponsors by name, email, or coach ID (external sponsors removed)',
            example: 'GET /api/advanced-mlm/search-sponsor?searchTerm=john&searchType=digital'
        },
        'POST /api/advanced-mlm/external-sponsor': {
            description: 'Create external sponsor (DEPRECATED)',
            body: {
                required: ['name', 'email', 'phone', 'company'],
                optional: ['website', 'address', 'notes']
            },
            note: 'External sponsors are no longer supported. Only digital coaches can be sponsors.',
            example: 'This endpoint is deprecated - use digital coaches only'
        },
        'POST /api/advanced-mlm/lock-hierarchy': {
            description: 'Lock hierarchy after first login (Coach only)',
            body: {
                required: ['coachId']
            },
            note: 'Prevents future hierarchy changes after first login',
            example: { coachId: '507f1f77bcf86cd799439011' }
        },
        'POST /api/advanced-mlm/admin-request': {
            description: 'Submit admin request for hierarchy changes (Coach only)',
            body: {
                required: ['coachId', 'requestType', 'reason'],
                optional: ['requestedChanges', 'priority']
            },
            note: 'Request admin approval for hierarchy modifications',
            example: {
                coachId: '507f1f77bcf86cd799439011',
                requestType: 'changeSponsor',
                reason: 'Better mentorship opportunity',
                requestedChanges: { newSponsorId: '507f1f77bcf86cd799439012' }
            }
        },
        'GET /api/advanced-mlm/admin-requests/:coachId': {
            description: 'Get admin requests for a specific coach (Coach only)',
            params: {
                coachId: 'string (required)'
            },
            note: 'View all admin requests submitted by a specific coach',
            example: 'GET /api/advanced-mlm/admin-requests/507f1f77bcf86cd799439011'
        },
        'GET /api/advanced-mlm/commissions/:coachId': {
            description: 'Get coach commissions (Coach only)',
            params: {
                coachId: 'string (required)'
            },
            query: {
                month: 'string (optional: YYYY-MM format)',
                year: 'number (optional)'
            },
            note: 'View commission earnings and calculations',
            example: 'GET /api/advanced-mlm/commissions/507f1f77bcf86cd799439011?month=2024-01'
        },
        'GET /api/advanced-mlm/admin/pending-requests': {
            description: 'Get all pending admin requests (Admin only)',
            body: 'No body required',
            note: 'Admin view of all pending hierarchy change requests',
            example: 'GET /api/advanced-mlm/admin/pending-requests (with admin JWT token)'
        },
        'PUT /api/advanced-mlm/admin/process-request/:requestId': {
            description: 'Process admin request (approve/reject) (Admin only)',
            params: {
                requestId: 'string (required)'
            },
            body: {
                required: ['action', 'adminNotes'],
                optional: ['approvedChanges']
            },
            note: 'Approve or reject hierarchy change requests',
            example: {
                action: 'approve',
                adminNotes: 'Request approved after review',
                approvedChanges: { newSponsorId: '507f1f77bcf86cd799439012' }
            }
        },
        'PUT /api/advanced-mlm/admin/change-upline': {
            description: 'Change coach upline (Admin only)',
            body: {
                required: ['coachId', 'newSponsorId'],
                optional: ['reason', 'effectiveDate']
            },
            note: 'Admin override to change coach sponsor/hierarchy',
            example: {
                coachId: '507f1f77bcf86cd799439011',
                newSponsorId: '507f1f77bcf86cd799439012',
                reason: 'Performance optimization'
            }
        },
        'GET /api/advanced-mlm/admin/commission-settings': {
            description: 'Get commission settings (Admin only)',
            body: 'No body required',
            note: 'View current commission structure and rates',
            example: 'GET /api/advanced-mlm/admin/commission-settings (with admin JWT token)'
        },
        'PUT /api/advanced-mlm/admin/commission-settings': {
            description: 'Update commission settings (Admin only)',
            body: {
                required: ['subscriptionCommissions'],
                optional: ['levelMultipliers']
            },
            note: 'Modify commission calculations for platform subscriptions only',
            example: {
                subscriptionCommissions: {
                    monthly: 0.10,
                    yearly: 0.15,
                    lifetime: 0.20,
                    default: 0.10
                },
                levelMultipliers: {
                    "1": 1.0,
                    "2": 1.1,
                    "3": 1.2
                }
            }
        },
        'POST /api/advanced-mlm/admin/calculate-commission': {
            description: 'Calculate and create commission for subscription (Admin only)',
            body: {
                required: ['subscriptionId', 'coachId', 'amount'],
                optional: ['commissionType', 'notes']
            },
            note: 'Manually calculate commission for specific transactions',
            example: {
                subscriptionId: '507f1f77bcf86cd799439011',
                coachId: '507f1f77bcf86cd799439012',
                amount: 100.00
            }
        },
        'POST /api/advanced-mlm/calculate-subscription-commission': {
            description: 'Calculate commission only on platform subscriptions (Admin only)',
            body: {
                required: ['subscriptionId', 'coachId', 'subscriptionAmount'],
                optional: ['subscriptionType', 'notes']
            },
            note: 'NEW: Calculate commission only on platform subscriptions, not all earnings',
            example: {
                subscriptionId: 'sub_123',
                coachId: 'coach_id',
                subscriptionAmount: 99.99,
                subscriptionType: 'monthly',
                notes: 'Monthly subscription commission'
            }
        },
        'POST /api/advanced-mlm/admin/process-monthly-commissions': {
            description: 'Process monthly commission payments (Admin only)',
            body: {
                required: ['month', 'year'],
                optional: ['paymentMethod', 'batchSize']
            },
            note: 'Bulk process all pending commissions for a month',
            example: {
                month: '01',
                year: 2024,
                paymentMethod: 'bank_transfer'
            }
        },
        'POST /api/advanced-mlm/downline': {
            description: 'Add a new coach to downline (Coach only)',
            body: {
                required: ['name', 'email', 'password', 'sponsorId'],
                optional: ['phone', 'currentLevel', 'teamRankName']
            },
            note: 'Add new coach to your downline team',
            example: {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'Passw0rd!',
                sponsorId: '507f1f77bcf86cd799439011'
            }
        },
        'GET /api/advanced-mlm/downline/:sponsorId': {
            description: 'Get direct downline for a specific sponsor (Coach only)',
            params: {
                sponsorId: 'string (required)'
            },
            query: {
                includePerformance: 'boolean (optional: true/false)'
            },
            note: 'View direct team members under a specific sponsor',
            example: 'GET /api/advanced-mlm/downline/507f1f77bcf86cd799439011?includePerformance=true'
        },
        'GET /api/advanced-mlm/hierarchy/:coachId': {
            description: 'Get complete downline hierarchy (Coach only)',
            params: {
                coachId: 'string (required)'
            },
            query: {
                levels: 'number (optional: default 5)',
                includePerformance: 'boolean (optional: true/false)'
            },
            note: 'View complete team structure with configurable depth',
            example: 'GET /api/advanced-mlm/hierarchy/507f1f77bcf86cd799439011?levels=10&includePerformance=true'
        },
        'GET /api/advanced-mlm/team-performance/:sponsorId': {
            description: 'Get team performance summary (Coach only)',
            params: {
                sponsorId: 'string (required)'
            },
            query: {
                period: 'string (optional: "month", "quarter", "year")',
                includeInactive: 'boolean (optional: true/false)'
            },
            note: 'Comprehensive team performance metrics and analytics',
            example: 'GET /api/advanced-mlm/team-performance/507f1f77bcf86cd799439011?period=month'
        },
        'POST /api/advanced-mlm/generate-report': {
            description: 'Generate comprehensive team report (Coach only)',
            body: {
                required: ['reportType', 'sponsorId'],
                optional: ['dateRange', 'includeCharts', 'format']
            },
            note: 'Create detailed performance reports with charts and insights',
            example: {
                reportType: 'team_performance',
                sponsorId: '507f1f77bcf86cd799439011',
                dateRange: { start: '2024-01-01', end: '2024-01-31' }
            }
        },
        'GET /api/advanced-mlm/reports/:sponsorId': {
            description: 'Get list of generated reports (Coach only)',
            params: {
                sponsorId: 'string (required)'
            },
            query: {
                reportType: 'string (optional)',
                limit: 'number (optional: default 20)'
            },
            note: 'View all generated reports for a specific sponsor',
            example: 'GET /api/advanced-mlm/reports/507f1f77bcf86cd799439011?reportType=team_performance'
        },
        'GET /api/advanced-mlm/reports/detail/:reportId': {
            description: 'Get specific report details (Coach only)',
            params: {
                reportId: 'string (required)'
            },
            note: 'View detailed content and data of a specific report',
            example: 'GET /api/advanced-mlm/reports/detail/507f1f77bcf86cd799439011'
        }
    },
    // Note: Coach Hierarchy System has been integrated into Advanced MLM Network (Unified) above
    // ===== 🏗️ COACH HIERARCHY & TEAM MANAGEMENT =====
    '🏗️ Coach Hierarchy Management': [
        { method: 'GET', path: '/api/coach-hierarchy/coach/:coachId', desc: 'Get coach hierarchy information' },
        { method: 'GET', path: '/api/coach-hierarchy/upline/:coachId', desc: 'Get coach upline structure' },
        { method: 'GET', path: '/api/coach-hierarchy/downline/:coachId', desc: 'Get coach downline structure' },
        { method: 'POST', path: '/api/coach-hierarchy/change-sponsor', desc: 'Request sponsor change', sample: { newSponsorId: '...', reason: 'Better mentorship opportunity' } },
        { method: 'GET', path: '/api/coach-hierarchy/requests', desc: 'Get hierarchy change requests' },
        { method: 'PUT', path: '/api/coach-hierarchy/requests/:requestId', desc: 'Process hierarchy change request', sample: { action: 'approve', notes: 'Request approved' } },
    ],
    // ===== 👥 STAFF MANAGEMENT & TEAM COLLABORATION =====
    '👥 Staff Management': [
        { method: 'POST', path: '/api/staff', desc: 'Create staff under coach (verification required on first login)', sample: { name: 'Assistant A', email: 'assistant@ex.com', password: 'Passw0rd!', permissions: ['leads:view', 'leads:update'] } },
        { method: 'GET', path: '/api/staff', desc: 'List staff of coach (admin can pass ?coachId=...)' },
        { method: 'GET', path: '/api/staff/:id', desc: 'Get specific staff details' },
        { method: 'PUT', path: '/api/staff/:id', desc: 'Update staff (name, permissions, isActive)', sample: { name: 'Assistant A2', permissions: ['leads:view'] } },
        { method: 'DELETE', path: '/api/staff/:id', desc: 'Deactivate staff' },
        { method: 'POST', path: '/api/staff/:id/permissions', desc: 'Update staff permissions', sample: { permissions: ['leads:view', 'leads:write', 'funnels:read'] } },
        { method: 'POST', path: '/api/staff/:id/activate', desc: 'Activate staff account' },
        { method: 'GET', path: '/api/staff/:id/performance', desc: 'Get staff performance metrics', sample: { startDate: '2025-01-01', endDate: '2025-01-31', includeDetails: 'true' } },
        { method: 'GET', path: '/api/staff/:id/performance/trends', desc: 'Get staff performance trends over time', sample: { period: 'monthly', months: 6 } },
        { method: 'GET', path: '/api/staff/performance/comparison', desc: 'Compare performance between staff members', sample: { startDate: '2025-01-01', endDate: '2025-01-31' } },
        { method: 'POST', path: '/api/staff/bulk-actions', desc: 'Perform bulk actions on staff', sample: { staffIds: ['staff1', 'staff2'], action: 'activate' } },
    ],
    // ===== 📅 STAFF CALENDAR & SCHEDULING =====
    '📅 Staff Calendar & Scheduling': [
        { method: 'POST', path: '/api/staff-calendar', desc: 'Create calendar event for staff', sample: { staffId: 'staff123', eventType: 'task', title: 'Follow up call', startTime: '2025-01-21T09:00Z', endTime: '2025-01-21T09:30Z' } },
        { method: 'GET', path: '/api/staff-calendar', desc: 'Get calendar events (filtered by permissions)', sample: { staffId: 'staff123', startDate: '2025-01-21', endDate: '2025-01-28' } },
        { method: 'GET', path: '/api/staff-calendar/:id', desc: 'Get specific calendar event' },
        { method: 'PUT', path: '/api/staff-calendar/:id', desc: 'Update calendar event' },
        { method: 'DELETE', path: '/api/staff-calendar/:id', desc: 'Delete calendar event' },
        { method: 'GET', path: '/api/staff-calendar/staff/:staffId/availability', desc: 'Get staff availability for time range', sample: { startTime: '2025-01-21T09:00Z', endTime: '2025-01-21T17:00Z' } },
        { method: 'POST', path: '/api/staff-calendar/bulk-create', desc: 'Create multiple calendar events (recurring)', sample: { events: [{ staffId: 'staff123', eventType: 'meeting', title: 'Weekly standup', startTime: '2025-01-21T09:00Z', endTime: '2025-01-21T09:30Z' }] } },
    ],
    // ===== 💰 PERFORMANCE & COMMISSIONS =====
    '💰 Performance & Commissions': [
        { method: 'POST', path: '/api/performance/record-sale', desc: 'Record a new sale for a coach', sample: { coachId: '...', amount: 1000, currency: 'USD' } },
        { method: 'GET', path: '/api/performance/downline/:coachId', desc: 'Get total sales for downline coaches' },
        // Note: Advanced MLM commission system is now integrated in the Advanced MLM Network section
    ],
    // ===== ⚙️ AUTOMATION & WORKFLOW ENGINE =====
    '⚙️ Automation Rules': [
        {
            "method": "POST",
            "path": "/api/automation-rules",
            "desc": "Create New Automation Rule",
            "sample": {
                "name": "Hot lead message",
                "coachId": "...",
                "triggerEvent": "lead_temperature_changed",
                "actions": [
                    {
                        "type": "send_email",
                        "config": {
                            "message": "Hi {{leadData.name}}"
                        }
                    }
                ]
            }
        },
        {
            "method": "GET",
            "path": "/api/automation-rules",
            "desc": "Get All Automation Rules"
        },
        {
            "method": "GET",
            "path": "/api/automation-rules/:id",
            "desc": "Get Single Automation Rule"
        },
        {
            "method": "PUT",
            "path": "/api/automation-rules/:id",
            "desc": "Update Automation Rule",
            "sample": {
                "isActive": false
            }
        },
        {
            "method": "DELETE",
            "path": "/api/automation-rules/:id",
            "desc": "Delete Automation Rule"
        },
        { method: 'POST', path: '/api/automation-rules/:id/duplicate', desc: 'Duplicate automation rule' },
        { method: 'PUT', path: '/api/automation-rules/:id/toggle', desc: 'Toggle automation rule active status' },
        { method: 'POST', path: '/api/automation-rules/:id/test', desc: 'Test automation rule execution' },
        { method: 'GET', path: '/api/automation-rules/triggers', desc: 'Get available trigger events' },
        { method: 'GET', path: '/api/automation-rules/actions', desc: 'Get available action types' },
        { method: 'GET', path: '/api/automation-rules/analytics', desc: 'Get automation rule analytics' },
    ],


    // ===== 📁 FILE & MEDIA MANAGEMENT =====
    '📁 File Upload': [
        { method: 'POST', path: '/api/files/upload', desc: 'Upload a file' },
    ],
    '🤖 AI Services': [
        { method: 'POST', path: '/api/ai/generate-content', desc: 'Generate AI content', sample: { prompt: 'Write a fitness blog post', contentType: 'blog', tone: 'professional' } },
        { method: 'POST', path: '/api/ai/analyze-lead', desc: 'AI lead analysis and insights', sample: { leadId: '...', analysisType: 'behavioral' } },
        { method: 'POST', path: '/api/ai/optimize-funnel', desc: 'AI funnel optimization suggestions', sample: { funnelId: '...', optimizationType: 'conversion' } },
        { method: 'POST', path: '/api/ai/generate-copy', desc: 'Generate marketing copy', sample: { product: 'Fitness Program', targetAudience: 'Weight loss seekers', copyType: 'ad' } },
        { method: 'GET', path: '/api/ai/available-models', desc: 'Get available AI models' },
        { method: 'POST', path: '/api/ai/chat', desc: 'AI chat assistant', sample: { message: 'Help me optimize my funnel', context: 'funnel_optimization' } },
    ],
    // ===== 💡 PRIORITY FEED & CALENDAR MANAGEMENT =====
    '💡 Priority Feed & Calendar': [
        { method: 'GET', path: '/api/coach/daily-feed', desc: 'Get daily prioritized suggestions' },
        { method: 'GET', path: '/api/coach/:coachId/availability', desc: 'Get coach availability settings' },
        { method: 'POST', path: '/api/coach/availability', desc: 'Set or update coach availability', sample: { timeZone: 'Asia/Kolkata', workingHours: [{ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }], unavailableSlots: [], slotDuration: 30, bufferTime: 0 } },
        { method: 'GET', path: '/api/coach/:coachId/available-slots', desc: 'Get bookable slots for a coach' },
        { method: 'POST', path: '/api/coach/:coachId/book', desc: 'Book a new appointment', sample: { leadId: '...', startTime: '2025-01-21T09:00Z', duration: 30, notes: 'Intro call', timeZone: 'Asia/Kolkata' } },
        { method: 'PUT', path: '/api/coach/appointments/:id/reschedule', desc: 'Reschedule an appointment', sample: { newStartTime: '2025-01-22T10:00:00Z', newDuration: 45 } },
        { method: 'DELETE', path: '/api/coach/appointments/:id', desc: 'Cancel an appointment' },
        { method: 'GET', path: '/api/coach/:coachId/calendar', desc: 'Get Calendar of Coach' },
        { method: 'POST', path: '/api/coach/booking-recovery/initiate', desc: 'Initiate booking recovery session' },
        { method: 'POST', path: '/api/coach/booking-recovery/cancel', desc: 'Cancel booking recovery session' },
        { method: 'GET', path: '/api/coach/priority-tasks', desc: 'Get priority tasks for today' },
        { method: 'GET', path: '/api/coach/performance-insights', desc: 'Get AI-powered performance insights' },
        { method: 'POST', path: '/api/coach/feedback', desc: 'Submit feedback for priority feed', sample: { taskId: '...', rating: 5, feedback: 'Very helpful suggestion' } },
    ],
    // ===== 👤 COACH PROFILE & PORTFOLIO MANAGEMENT =====
    '👤 Coach Profile Management': [
        { method: 'GET', path: '/api/coach-profile/me', desc: 'Get my coach information' },
        { method: 'PUT', path: '/api/coach-profile/:id/profile', desc: 'Update a coaches profile' },
        // WhatsApp configuration moved to dustbin/whatsapp-dump/
        { method: 'POST', path: '/api/coach-profile/add-credits/:id', desc: 'Add credits to a coach account' },
        { method: 'GET', path: '/api/coach-profile/:id/portfolio', desc: 'Get coach portfolio details' },
        { method: 'PUT', path: '/api/coach-profile/:id/portfolio', desc: 'Update coach portfolio', sample: { headline: 'Fitness Expert', bio: 'Certified personal trainer', specializations: ['Weight Loss', 'Muscle Building'] } },
        { method: 'GET', path: '/api/coach-profile/:id/appointment-settings', desc: 'Get coach appointment settings' },
        { method: 'PUT', path: '/api/coach-profile/:id/appointment-settings', desc: 'Update appointment settings', sample: { availableDays: ['Monday', 'Tuesday'], availableFromTime: '09:00', availableToTime: '17:00' } },
        { method: 'GET', path: '/api/coach-profile/:id/lead-magnets', desc: 'Get coach lead magnet settings' },
        { method: 'PUT', path: '/api/coach-profile/:id/lead-magnets', desc: 'Update lead magnet settings' },
    ],
    // ===== 💳 FUNNELSEYE CENTRAL PAYMENT SYSTEM =====
    '💳 Funnelseye Central Payment System': [
        // Payment Session Management
        { method: 'POST', path: '/api/funnelseye-payments/create-session', desc: 'Create a new payment session', sample: { amount: 999, currency: 'INR', paymentMethod: 'razorpay', businessType: 'product_purchase', userId: '...', userType: 'customer', productId: '...', productName: 'Fitness Book', productDescription: 'Complete fitness guide' } },
        { method: 'GET', path: '/api/funnelseye-payments/:paymentId', desc: 'Get payment details by ID' },
        { method: 'GET', path: '/api/funnelseye-payments/user/:userId', desc: 'Get all payments for a user', sample: { status: 'completed', businessType: 'product_purchase', page: 1, limit: 10 } },
        
        // Payment Processing
        { method: 'POST', path: '/api/funnelseye-payments/webhook', desc: 'Process payment gateway webhooks (Public)' },
        { method: 'POST', path: '/api/funnelseye-payments/refund/:paymentId', desc: 'Process payment refund', sample: { amount: 500, reason: 'Customer request' } },
        
        // Analytics & Statistics
        { method: 'GET', path: '/api/funnelseye-payments/stats', desc: 'Get payment statistics', sample: { startDate: '2024-01-01', endDate: '2024-01-31', businessType: 'product_purchase', status: 'completed' } },
        { method: 'GET', path: '/api/funnelseye-payments/health', desc: 'Check payment system health status' },
        { method: 'GET', path: '/api/funnelseye-payments/docs', desc: 'Get detailed API documentation' },
        
        // Admin Management
        { method: 'GET', path: '/api/funnelseye-payments/admin/payments', desc: 'Get all payments (Admin only)', sample: { status: 'pending', businessType: 'commission', page: 1, limit: 20 } },
        { method: 'PUT', path: '/api/funnelseye-payments/admin/payments/:paymentId/status', desc: 'Update payment status (Admin only)', sample: { status: 'completed', notes: 'Payment processed successfully' } },
        
        // Gateway Configuration (Admin)
        { method: 'GET', path: '/api/funnelseye-payments/admin/gateways', desc: 'Get payment gateway configurations (Admin only)' },
        { method: 'PUT', path: '/api/funnelseye-payments/admin/gateways/:gatewayName', desc: 'Update gateway configuration (Admin only)', sample: { isEnabled: true, config: { keyId: 'rzp_test_...', keySecret: '...' } } },
        { method: 'POST', path: '/api/funnelseye-payments/admin/gateways', desc: 'Create new gateway configuration (Admin only)', sample: { gatewayName: 'stripe', isEnabled: false, config: { publishableKey: 'pk_test_...', secretKey: 'sk_test_...' } } },
        { method: 'DELETE', path: '/api/funnelseye-payments/admin/gateways/:gatewayName', desc: 'Delete gateway configuration (Admin only)' },
        { method: 'POST', path: '/api/funnelseye-payments/admin/gateways/:gatewayName/test', desc: 'Test gateway connection (Admin only)' },
    ],
    // ===== 📦 SUBSCRIPTION MANAGEMENT =====
    '📦 Subscription Management': [
        // Public subscription endpoints
        { method: 'GET', path: '/api/subscriptions/plans', desc: 'Get available subscription plans (Public)' },
        { method: 'POST', path: '/api/subscriptions/subscribe', desc: 'Subscribe to a plan (Coach)', sample: { planId: 'professional', paymentMethod: 'stripe', autoRenew: true } },
        { method: 'POST', path: '/api/subscriptions/renew', desc: 'Renew subscription (Coach)' },
        { method: 'POST', path: '/api/subscriptions/cancel', desc: 'Cancel subscription (Coach)', sample: { reason: 'User requested cancellation' } },
        { method: 'GET', path: '/api/subscriptions/my-subscription', desc: 'Get current user subscription (Coach)' },
        
        // Admin subscription management
        { method: 'POST', path: '/api/subscriptions/plans', desc: 'Create new subscription plan (Admin)', sample: { name: 'Professional Plan', price: 99, features: ['maxFunnels: 10', 'maxLeads: 1000'] } },
        { method: 'PUT', path: '/api/subscriptions/plans/:id', desc: 'Update subscription plan (Admin)', sample: { name: 'Updated Plan Name', price: 129 } },
        { method: 'DELETE', path: '/api/subscriptions/plans/:id', desc: 'Delete subscription plan (Admin)' },
        { method: 'POST', path: '/api/subscriptions/subscribe-coach', desc: 'Subscribe coach to plan (Admin)', sample: { coachId: '...', planId: 'professional' } },
        { method: 'POST', path: '/api/subscriptions/renew-coach', desc: 'Renew coach subscription (Admin)' },
        { method: 'POST', path: '/api/subscriptions/cancel-coach', desc: 'Cancel coach subscription (Admin)' },
        { method: 'GET', path: '/api/subscriptions/coach/:coachId', desc: 'Get specific coach subscription (Admin)' },
        { method: 'GET', path: '/api/subscriptions/all', desc: 'Get all coach subscriptions (Admin)' },
        { method: 'GET', path: '/api/subscriptions/analytics', desc: 'Get subscription analytics (Admin)' },
        { method: 'POST', path: '/api/subscriptions/send-reminders', desc: 'Send subscription reminders (Admin)' },
        { method: 'POST', path: '/api/subscriptions/disable-expired', desc: 'Disable expired subscriptions (Admin)' },
    ],
    // ===== 🛒 SHOPPING CART MANAGEMENT =====
    '🛒 Shopping Cart Management': [
        { method: 'POST', path: '/api/cart', desc: 'Update shopping cart', sample: { coachId: '...', leadId: '...', items: [{ productId: 'prod_123', quantity: 1, price: 99 }], subtotal: 99, tax: 8.91, discount: 0, total: 107.91 } },
        { method: 'GET', path: '/api/cart/:cartId', desc: 'Get cart details' },
        { method: 'POST', path: '/api/cart/:cartId/recovery', desc: 'Send cart recovery notification' },
        { method: 'POST', path: '/api/cart/:cartId/complete', desc: 'Complete cart purchase', sample: { paymentData: { method: 'stripe', token: 'tok_123' } } },
        { method: 'GET', path: '/api/cart/coach/:coachId', desc: 'Get all carts for a coach' },
        { method: 'GET', path: '/api/cart/lead/:leadId', desc: 'Get cart for a specific lead' },
        { method: 'PUT', path: '/api/cart/:cartId/abandon', desc: 'Mark cart as abandoned' },
    ],
    // ===== 🤖 AI ADS & MARKETING AUTOMATION =====
    '🤖 AI Ads Agent': [
        { method: 'POST', path: '/api/ai-ads/generate-copy', desc: 'Generate AI-powered ad copy', sample: { targetAudience: 'Fitness enthusiasts 25-40', productInfo: 'Personal training program', campaignObjective: 'CONVERSIONS' } },
        { method: 'POST', path: '/api/ai-ads/optimize-budget/:campaignId', desc: 'Optimize budget allocation for campaign' },
        { method: 'GET', path: '/api/ai-ads/detect-anomalies/:campaignId', desc: 'Detect performance anomalies' },
        { method: 'POST', path: '/api/ai-ads/targeting-recommendations', desc: 'Generate targeting recommendations', sample: { targetAudience: 'Weight loss seekers', budget: 100 } },
        { method: 'POST', path: '/api/ai-ads/auto-optimize/:campaignId', desc: 'Auto-optimize campaign performance' },
        { method: 'GET', path: '/api/ai-ads/performance-insights/:campaignId', desc: 'Get detailed performance insights' },
        { method: 'POST', path: '/api/ai-ads/create-optimized-campaign', desc: 'Create AI-optimized campaign', sample: { name: 'AI Campaign', objective: 'CONVERSIONS', targetAudience: 'Fitness', budget: 50, productInfo: 'Training program' } },
        { method: 'GET', path: '/api/ai-ads/dashboard', desc: 'Get AI ads dashboard data' },
        { method: 'POST', path: '/api/ai-ads/bulk-optimize', desc: 'Bulk optimize multiple campaigns', sample: { campaignIds: ['campaign1', 'campaign2'] } },
        { method: 'POST', path: '/api/ai-ads/generate-variations', desc: 'Generate ad variations', sample: { originalAdCopy: 'Lose weight fast', targetAudience: 'Fitness', variationCount: 5 } },
        // Social Media Integration
        { method: 'POST', path: '/api/ai-ads/generate-poster', desc: 'Generate simple background image with AI text content and positioning instructions', sample: { coachName: 'John Doe', niche: 'Weight Loss & Nutrition', offer: '12-Week Transformation Program', targetAudience: 'weight_loss' } },
        { method: 'POST', path: '/api/ai-ads/generate-poster-variations', desc: 'Generate multiple background variations with text content for better selection', sample: { coachName: 'John Doe', niche: 'Weight Loss & Nutrition', offer: '12-Week Transformation Program', targetAudience: 'weight_loss', variationCount: 3 } },
        { method: 'POST', path: '/api/ai-ads/generate-headlines', desc: 'Generate AI-powered marketing headlines', sample: { coachName: 'John Doe', niche: 'Weight Loss & Nutrition', offer: '12-Week Transformation Program', targetAudience: 'weight_loss', headlineCount: 5 } },
        { method: 'POST', path: '/api/ai-ads/generate-social-post', desc: 'Generate complete social media post content', sample: { coachName: 'John Doe', niche: 'Weight Loss & Nutrition', offer: '12-Week Transformation Program', targetAudience: 'weight_loss' } },
        { method: 'POST', path: '/api/ai-ads/upload-to-instagram', desc: 'Upload generated content to Instagram via Meta Ads', sample: { imageUrl: 'https://example.com/poster.jpg', caption: 'Transform your body!', coachMetaAccountId: 'act_123456789' } },
        { method: 'POST', path: '/api/ai-ads/generate-campaign', desc: 'Generate complete social media campaign package', sample: { coachName: 'John Doe', niche: 'Weight_loss', offer: '12-Week Transformation Program', targetAudience: 'weight_loss', campaignDuration: 7, dailyBudget: 50 } },
        { method: 'GET', path: '/api/ai-ads/social-media-history', desc: 'Get social media content generation history' },
    ],
    // ===== 📋 WORKFLOW & TASK MANAGEMENT =====
    '📋 Workflow & Task Management': [
        { method: 'GET', path: '/api/workflow/kanban-board', desc: 'Get Kanban board data' },
        { method: 'POST', path: '/api/workflow/tasks', desc: 'Create new task with intelligent assignment', sample: { name: 'Follow up call', description: 'Call prospect', dueDate: '2025-01-25T10:00:00Z', relatedLead: 'leadId', priority: 'HIGH', stage: 'LEAD_QUALIFICATION' } },
        { method: 'GET', path: '/api/workflow/tasks', desc: 'Get all tasks with filtering', sample: { status: 'Pending', priority: 'HIGH', page: 1, limit: 10 } },
        { method: 'GET', path: '/api/workflow/tasks/:id', desc: 'Get single task details' },
        { method: 'PUT', path: '/api/workflow/tasks/:id', desc: 'Update task', sample: { status: 'In Progress', priority: 'URGENT' } },
        { method: 'DELETE', path: '/api/workflow/tasks/:id', desc: 'Delete task' },
        { method: 'PUT', path: '/api/workflow/tasks/:taskId/move', desc: 'Move task between stages (Kanban)', sample: { newStage: 'PROPOSAL' } },
        { method: 'POST', path: '/api/workflow/tasks/:id/comments', desc: 'Add comment to task', sample: { content: 'Called prospect, interested in program' } },
        { method: 'POST', path: '/api/workflow/tasks/:id/time-log', desc: 'Log time to task', sample: { startTime: '2025-01-20T09:00:00Z', endTime: '2025-01-20T10:00:00Z', description: 'Client call' } },
        { method: 'POST', path: '/api/workflow/tasks/:id/subtasks', desc: 'Add subtask', sample: { name: 'Send proposal', description: 'Email proposal to client' } },
        { method: 'GET', path: '/api/workflow/analytics', desc: 'Get task analytics', sample: { dateRange: 30 } },
        { method: 'POST', path: '/api/workflow/auto-assign', desc: 'Auto-assign unassigned tasks' },
        { method: 'GET', path: '/api/workflow/upcoming-tasks', desc: 'Get upcoming tasks', sample: { days: 7 } },
        { method: 'PUT', path: '/api/workflow/bulk-update-status', desc: 'Bulk update task status', sample: { taskIds: ['task1', 'task2'], newStatus: 'Completed' } },
        { method: 'POST', path: '/api/workflow/generate-sop', desc: 'Generate SOP for task type', sample: { taskType: 'Lead Follow-up', context: 'Fitness coaching business' } },
        { method: 'GET', path: '/api/workflow/overdue-tasks', desc: 'Get overdue tasks' },
        { method: 'GET', path: '/api/workflow/tasks/stage/:stage', desc: 'Get tasks by stage' },
        { method: 'POST', path: '/api/workflow/tasks/from-lead/:leadId', desc: 'Create task from lead', sample: { taskName: 'Follow up call', description: 'Follow up on lead inquiry' } },
        { method: 'GET', path: '/api/workflow/tasks/:id/dependencies', desc: 'Get task dependencies' },
        { method: 'POST', path: '/api/workflow/tasks/:id/dependencies', desc: 'Add task dependency', sample: { dependentTaskId: '...', dependencyType: 'blocks' } },
        { method: 'DELETE', path: '/api/workflow/tasks/:id/dependencies/:dependencyId', desc: 'Remove task dependency' },
        { method: 'POST', path: '/api/workflow/tasks/:id/dependencies', desc: 'Add task dependency', sample: { dependencyId: 'taskId' } },
        { method: 'DELETE', path: '/api/workflow/tasks/:id/dependencies/:dependencyId', desc: 'Remove task dependency' },
        { method: 'GET', path: '/api/workflow/stages', desc: 'Get workflow stages configuration' },
        { method: 'PUT', path: '/api/workflow/stages', desc: 'Update workflow stages configuration' },
        { method: 'GET', path: '/api/workflow/templates', desc: 'Get workflow templates' },
        { method: 'POST', path: '/api/workflow/templates', desc: 'Create workflow template' },
        { method: 'POST', path: '/api/workflow/templates/:templateId/apply', desc: 'Apply workflow template to coach' },
    ],
    // ===== 🏆 STAFF LEADERBOARD & PERFORMANCE TRACKING =====
    '🏆 Staff Leaderboard & Scoring': [
        { method: 'GET', path: '/api/staff-leaderboard/leaderboard', desc: 'Get staff leaderboard with rankings' },
        { method: 'GET', path: '/api/staff-leaderboard/staff/:staffId/score', desc: 'Get individual staff performance score' },
        { method: 'GET', path: '/api/staff-leaderboard/staff/:staffId/achievements', desc: 'Get staff achievements and badges' },
        { method: 'GET', path: '/api/staff-leaderboard/staff/:staffId/progress', desc: 'Get staff progress over time' },
        { method: 'GET', path: '/api/staff-leaderboard/team/analytics', desc: 'Get team performance analytics' },
        { method: 'GET', path: '/api/staff-leaderboard/team/most-improved', desc: 'Get most improved staff member' },
        { method: 'GET', path: '/api/staff-leaderboard/team/trends', desc: 'Get team performance trends' },
        { method: 'GET', path: '/api/staff-leaderboard/staff/comparison', desc: 'Compare staff performance', sample: { staffIds: ['staff1', 'staff2'] } },
        { method: 'GET', path: '/api/staff-leaderboard/config/ranking-levels', desc: 'Get ranking levels configuration' },
        { method: 'GET', path: '/api/staff-leaderboard/config/achievements', desc: 'Get achievements configuration' },
        { method: 'GET', path: '/api/staff-leaderboard/config/scoring-weights', desc: 'Get scoring weights configuration' },
        { method: 'PUT', path: '/api/staff-leaderboard/config/scoring-weights', desc: 'Update scoring weights', sample: { weights: { taskCompletion: 0.4, qualityRating: 0.3, efficiency: 0.2, leadership: 0.1 } } },
    ],
    // ===== 👥 STAFF DASHBOARD & PERFORMANCE ANALYTICS =====
    '👥 Staff Dashboard': [
        { method: 'GET', path: '/api/staff-dashboard/data', desc: 'Get complete staff dashboard data', sample: { timeRange: 30 } },
        { method: 'GET', path: '/api/staff-dashboard/overview', desc: 'Get staff overview metrics and quick actions' },
        { method: 'GET', path: '/api/staff-dashboard/tasks', desc: 'Get staff tasks overview and analytics' },
        { method: 'GET', path: '/api/staff-dashboard/performance', desc: 'Get staff performance metrics and scoring' },
        { method: 'GET', path: '/api/staff-dashboard/achievements', desc: 'Get staff achievements and badges' },
        { method: 'GET', path: '/api/staff-dashboard/team', desc: 'Get team data and collaboration metrics' },
        { method: 'GET', path: '/api/staff-dashboard/progress', desc: 'Get staff progress over time', sample: { timeRange: 30 } },
        { method: 'GET', path: '/api/staff-dashboard/comparison', desc: 'Compare staff performance with team' },
        { method: 'GET', path: '/api/staff-dashboard/goals', desc: 'Get staff goals and targets' },
        { method: 'GET', path: '/api/staff-dashboard/calendar', desc: 'Get staff calendar and schedule' },
        { method: 'GET', path: '/api/staff-dashboard/notifications', desc: 'Get staff notifications and alerts' },
        { method: 'GET', path: '/api/staff-dashboard/analytics', desc: 'Get staff analytics and insights' },
        // NEW: Coach to Staff Appointment Transfer with Host Permissions
        { method: 'PUT', path: '/api/staff-dashboard/unified/appointments/transfer-from-coach', desc: 'Transfer appointment from coach to staff with meeting host permissions', sample: { appointmentId: 'appointment_id', staffId: 'staff_id', hostPermissions: { hasHostAccess: true, canStartMeeting: true, canManageParticipants: true, canShareScreen: true, canRecordMeeting: false }, reason: 'Coach unavailable' } },
        { method: 'PUT', path: '/api/staff-dashboard/unified/appointments/transfer', desc: 'Transfer appointment between staff members', sample: { appointmentId: 'appointment_id', fromStaffId: 'staff_id_1', toStaffId: 'staff_id_2', reason: 'Workload redistribution' } },
    ],
    // ===== 💰 COACH FINANCIAL MANAGEMENT =====
    '💰 Coach Financial Management': [
        // Revenue & Analytics
        { method: 'GET', path: '/api/coach/financial/revenue', desc: 'Get coach revenue analytics', sample: { timeRange: 30, period: 'daily' } },
        { method: 'GET', path: '/api/coach/financial/payments', desc: 'Get payment history', sample: { page: 1, limit: 20, status: 'active' } },
        // Razorpay Balance & Account
        { method: 'GET', path: '/api/coach/financial/balance', desc: 'Get Razorpay account balance' },
        // Payout Management
        { method: 'POST', path: '/api/coach/financial/payout', desc: 'Create manual payout', sample: { amount: 1000, payoutMethod: 'UPI', upiId: 'coach@paytm', notes: 'Monthly payout' } },
        { method: 'GET', path: '/api/coach/financial/payouts', desc: 'Get payout history', sample: { page: 1, limit: 20, status: 'processed' } },
        { method: 'PUT', path: '/api/coach/financial/payout-settings', desc: 'Update automatic payout settings', sample: { autoPayoutEnabled: true, payoutMethod: 'UPI', upiId: 'coach@paytm', minimumAmount: 500, payoutFrequency: 'weekly' } },
        // MLM Commission
        { method: 'GET', path: '/api/coach/financial/mlm-commission', desc: 'Get MLM commission structure and history' },
        // Coach to Coach Payouts
        { method: 'POST', path: '/api/coach/financial/payout-to-coach', desc: 'Payout to another coach', sample: { targetCoachId: 'coach_id', amount: 500, notes: 'Commission payout' } },
        // Refund Management
        { method: 'GET', path: '/api/coach/financial/refunds', desc: 'Get refund history', sample: { page: 1, limit: 20 } },
    ],

    // ===== 🎛️ ADMIN V1 MASTER API =====
    '🎛️ Admin V1 Master API': [
        // Authentication - Use unified admin auth endpoints
        { method: 'POST', path: '/api/admin/auth/login', desc: 'Admin login (unified)', sample: { email: 'admin@example.com', password: 'password123', rememberMe: true } },
        { method: 'POST', path: '/api/admin/auth/logout', desc: 'Admin logout (unified)', sample: { sessionToken: 'session_token_here' } },
        { method: 'GET', path: '/api/admin/v1/auth/profile', desc: 'Get admin profile' },
        
        // Dashboard & Analytics
        { method: 'GET', path: '/api/admin/v1/dashboard', desc: 'Get comprehensive admin dashboard', sample: { timeRange: 30 } },
        { method: 'GET', path: '/api/admin/v1/analytics', desc: 'Get platform analytics', sample: { timeRange: 30, metric: 'all' } },
        
        // User Management
        { method: 'GET', path: '/api/admin/v1/users', desc: 'Get all users with filtering', sample: { page: 1, limit: 20, role: 'user', status: 'active', search: 'john' } },
        { method: 'GET', path: '/api/admin/v1/users/:userId', desc: 'Get user details with subscriptions' },
        { method: 'PUT', path: '/api/admin/v1/users/:userId', desc: 'Update user status or details', sample: { status: 'active', coachId: 'coach_id', notes: 'VIP client' } },
        
        // Financial Settings
        { method: 'GET', path: '/api/admin/v1/financial-settings', desc: 'Get financial settings' },
        { method: 'PUT', path: '/api/admin/v1/financial-settings', desc: 'Update financial settings', sample: { razorpay: { keyId: 'rzp_test_...' }, platformFees: { subscriptionFee: 5.0 } } },
        { method: 'GET', path: '/api/admin/v1/financial/razorpay-account', desc: 'Get Razorpay account details' },
        { method: 'PUT', path: '/api/admin/v1/financial/mlm-commission-structure', desc: 'Update MLM commission structure', sample: { levels: [{ level: 1, percentage: 10 }], platformFeePercentage: 5 } },
        { method: 'POST', path: '/api/admin/v1/financial/process-mlm-commission', desc: 'Process MLM commission', sample: { subscriptionId: 'sub_id', subscriptionAmount: 1000, coachId: 'coach_id' } },
        { method: 'GET', path: '/api/admin/v1/financial/platform-fees', desc: 'Get platform fee settings' },
        { method: 'PUT', path: '/api/admin/v1/financial/platform-fees', desc: 'Update platform fee settings', sample: { subscriptionFee: 5.0, transactionFee: 2.0 } },
        { method: 'GET', path: '/api/admin/v1/financial/analytics-dashboard', desc: 'Get financial analytics dashboard', sample: { timeRange: 30 } },
        
        // Downline Management
        { method: 'GET', path: '/api/admin/v1/downline', desc: 'Get downline structure', sample: { coachId: 'coach_id', level: 3 } },
        { method: 'GET', path: '/api/admin/v1/mlm-reports', desc: 'Get MLM commission reports', sample: { timeRange: 30, coachId: 'coach_id' } },
        
        // Platform Configuration
        { method: 'GET', path: '/api/admin/v1/platform-config', desc: 'Get platform configuration' },
        { method: 'PUT', path: '/api/admin/v1/platform-config', desc: 'Update platform configuration', sample: { general: { platformName: 'New Platform' }, features: { mlmEnabled: true } } },
        
        // Content Management
        { method: 'GET', path: '/api/admin/v1/content/plans', desc: 'Get all coach plans/programs', sample: { page: 1, limit: 20, status: 'active', search: 'fat loss' } },
        { method: 'POST', path: '/api/admin/v1/content/plans', desc: 'Create new coach plan', sample: { name: '21-Day Fat Loss', description: 'Complete program', price: 2999, duration: 21 } },
        { method: 'PUT', path: '/api/admin/v1/content/plans/:planId', desc: 'Update coach plan', sample: { price: 3999, status: 'active' } },
        
        // Messaging & Automation
        { method: 'GET', path: '/api/admin/v1/messaging/settings', desc: 'Get messaging settings' },
        { method: 'PUT', path: '/api/admin/v1/messaging/settings', desc: 'Update messaging settings', sample: { whatsapp: { enabled: true, provider: 'gupshup' }, email: { enabled: true } } },
        
        // Subscription Plans
        { method: 'GET', path: '/api/admin/v1/subscription-plans', desc: 'Get subscription plans' },
        
        // AI Settings
        { method: 'GET', path: '/api/admin/v1/ai-settings', desc: 'Get AI settings' },
        { method: 'PUT', path: '/api/admin/v1/ai-settings', desc: 'Update AI settings', sample: { nutritionist: { enabled: true, model: 'gpt-3.5-turbo' }, support: { enabled: true } } },
        
        // System Management
        { method: 'GET', path: '/api/admin/v1/system/health', desc: 'Get system health status' },
        { method: 'GET', path: '/api/admin/v1/settings', desc: 'Get global platform settings' },
        { method: 'PUT', path: '/api/admin/v1/settings/:section', desc: 'Update global settings section', sample: { platformName: 'New Platform Name', defaultLanguage: 'en' } },
        
        // Audit Logs
        { method: 'GET', path: '/api/admin/v1/audit-logs', desc: 'Get audit logs with filtering', sample: { page: 1, limit: 20, severity: 'high', startDate: '2024-01-01' } },
        
        // Product Management
        { method: 'GET', path: '/api/admin/v1/products', desc: 'Get all admin products', sample: { page: 1, limit: 20, status: 'active', search: 'fitness' } },
        { method: 'POST', path: '/api/admin/v1/products', desc: 'Create admin product', sample: { name: 'Fitness Program', description: 'Complete program', category: 'fitness', basePrice: 2999 } },
        
        // Security Management
        { method: 'GET', path: '/api/admin/v1/security/incidents', desc: 'Get security incidents', sample: { timeRange: 7, severity: 'high' } },
    ],

    // ===== 📊 COACH DASHBOARD & ANALYTICS =====
    '📊 Coach Dashboard': [
        { method: 'GET', path: '/api/coach-dashboard/data', desc: 'Get complete dashboard data' },
        { method: 'GET', path: '/api/coach-dashboard/overview', desc: 'Get overview metrics and quick actions' },
        { method: 'GET', path: '/api/coach-dashboard/leads', desc: 'Get leads analytics and funnel data' },
        { method: 'GET', path: '/api/coach-dashboard/tasks', desc: 'Get tasks analytics and distribution' },
        { method: 'GET', path: '/api/coach-dashboard/marketing', desc: 'Get marketing analytics and AI insights' },
        { method: 'GET', path: '/api/coach-dashboard/financial', desc: 'Get financial analytics and revenue trends' },
        { method: 'GET', path: '/api/coach-dashboard/team', desc: 'Get team analytics and leaderboard' },
        { method: 'GET', path: '/api/coach-dashboard/performance', desc: 'Get performance analytics and KPIs' },
        { method: 'GET', path: '/api/coach-dashboard/widgets', desc: 'Get dashboard widgets configuration' },
        { method: 'GET', path: '/api/coach-dashboard/widgets/:widgetId', desc: 'Get specific widget data' },
        { method: 'GET', path: '/api/coach-dashboard/trends', desc: 'Get performance trends over time' },
        { method: 'GET', path: '/api/coach-dashboard/alerts', desc: 'Get performance alerts and warnings' },
        { method: 'GET', path: '/api/coach-dashboard/ai-insights', desc: 'Get AI-powered insights and recommendations' },
        { method: 'GET', path: '/api/coach-dashboard/kpis', desc: 'Get key performance indicators' },
        { method: 'GET', path: '/api/coach-dashboard/sections', desc: 'Get dashboard sections configuration' },
        { method: 'GET', path: '/api/coach-dashboard/real-time', desc: 'Get real-time dashboard updates' },
        { method: 'GET', path: '/api/coach-dashboard/export', desc: 'Export dashboard data', sample: { format: 'csv', timeRange: 30 } },
        // ===== NEW: CALENDAR & APPOINTMENT MANAGEMENT =====
        { method: 'GET', path: '/api/coach-dashboard/calendar', desc: 'Get coach calendar with appointments' },
        { method: 'GET', path: '/api/coach-dashboard/available-slots', desc: 'Get available booking slots' },
        { method: 'POST', path: '/api/coach-dashboard/appointments', desc: 'Book new appointment', sample: { leadId: '...', startTime: '2025-01-21T09:00:00Z', duration: 30, notes: 'Intro call' } },
        { method: 'GET', path: '/api/coach-dashboard/appointments/upcoming', desc: 'Get upcoming appointments' },
        { method: 'GET', path: '/api/coach-dashboard/appointments/today', desc: 'Get today\'s appointments' },
        { method: 'PUT', path: '/api/coach-dashboard/appointments/:appointmentId/reschedule', desc: 'Reschedule appointment', sample: { newStartTime: '2025-01-22T10:00:00Z', newDuration: 45 } },
        { method: 'DELETE', path: '/api/coach-dashboard/appointments/:appointmentId', desc: 'Cancel appointment' },
        { method: 'GET', path: '/api/coach-dashboard/appointments/stats', desc: 'Get appointment statistics' },
        { method: 'GET', path: '/api/coach-dashboard/availability', desc: 'Get coach availability settings' },
        { method: 'PUT', path: '/api/coach-dashboard/availability', desc: 'Set coach availability', sample: { timeZone: 'Asia/Kolkata', workingHours: [{ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }], slotDuration: 30 } },
        // ===== NEW: ZOOM MEETINGS MANAGEMENT =====
        { method: 'GET', path: '/api/coach-dashboard/zoom-meetings', desc: 'Get all Zoom meetings for coach' },
        { method: 'GET', path: '/api/coach-dashboard/zoom-meetings/appointment/:appointmentId', desc: 'Get Zoom meeting details for specific appointment' },
    ],
    // ===== 💬 MESSAGE TEMPLATES & COMMUNICATION =====
    '💬 Message Templates': [
        { method: 'POST', path: '/api/message-templates', desc: 'Create new message template', sample: { name: 'Welcome Message', type: 'email', category: 'welcome', content: { body: 'Hi {{lead.name}}, welcome to our program!' } } },
        { method: 'GET', path: '/api/message-templates', desc: 'Get all message templates for coach' },
        { method: 'GET', path: '/api/message-templates/pre-built', desc: 'Get pre-built message templates' },
        { method: 'GET', path: '/api/message-templates/categories', desc: 'Get available template categories' },
        { method: 'GET', path: '/api/message-templates/types', desc: 'Get available template types' },
        { method: 'GET', path: '/api/message-templates/variables', desc: 'Get common template variables' },
        { method: 'GET', path: '/api/message-templates/:id', desc: 'Get specific template details' },
        { method: 'PUT', path: '/api/message-templates/:id', desc: 'Update message template' },
        { method: 'DELETE', path: '/api/message-templates/:id', desc: 'Delete message template' },
        { method: 'POST', path: '/api/message-templates/:id/duplicate', desc: 'Duplicate a template', sample: { newName: 'Welcome Message Copy' } },
        { method: 'POST', path: '/api/message-templates/:id/render', desc: 'Render template with variables', sample: { variables: { 'lead.name': 'John', 'coach.name': 'Sarah' } } },
        { method: 'POST', path: '/api/message-templates/seed', desc: 'Seed pre-built templates for coach' },
    ],
    // ===== 🔗 ZOOM INTEGRATION & MEETING MANAGEMENT =====
    '🔗 Zoom Integration': [
        { method: 'POST', path: '/api/zoom-integration/setup', desc: 'Setup Zoom API integration', sample: { clientId: 'zoom_client_id', clientSecret: 'zoom_client_secret', zoomEmail: 'coach@example.com', zoomAccountId: 'zoom_account_id' } },
        { method: 'GET', path: '/api/zoom-integration', desc: 'Get Zoom integration settings' },
        { method: 'PUT', path: '/api/zoom-integration', desc: 'Update Zoom integration settings' },
        { method: 'POST', path: '/api/zoom-integration/test', desc: 'Test Zoom API connection' },
        { method: 'GET', path: '/api/zoom-integration/usage', desc: 'Get Zoom account usage statistics' },
        { method: 'GET', path: '/api/zoom-integration/status', desc: 'Get integration status and health' },
        { method: 'POST', path: '/api/zoom-integration/meeting-templates', desc: 'Create meeting template', sample: { name: '30-min Session', duration: 30, settings: { join_before_host: true } } },
        { method: 'GET', path: '/api/zoom-integration/meeting-templates', desc: 'Get meeting templates' },
        { method: 'DELETE', path: '/api/zoom-integration', desc: 'Delete Zoom integration' },
        // NEW: Zoom Meeting Management
        { method: 'GET', path: '/api/zoom-integration/meetings', desc: 'Get all Zoom meetings for coach' },
        { method: 'GET', path: '/api/zoom-integration/meetings/appointment/:appointmentId', desc: 'Get Zoom meeting details for specific appointment' },
        // NEW: Zoom Cleanup Management
        { method: 'POST', path: '/api/zoom-integration/cleanup/start', desc: 'Start automatic Zoom meeting cleanup', sample: { retentionDays: 2, interval: 'daily' } },
        { method: 'POST', path: '/api/zoom-integration/cleanup/stop', desc: 'Stop automatic Zoom meeting cleanup' },
        { method: 'POST', path: '/api/zoom-integration/cleanup/manual', desc: 'Perform manual Zoom meeting cleanup', sample: { retentionDays: 2 } },
        { method: 'GET', path: '/api/zoom-integration/cleanup/stats', desc: 'Get Zoom cleanup statistics and status' },
        { method: 'PUT', path: '/api/zoom-integration/cleanup/retention', desc: 'Update Zoom cleanup retention period', sample: { retentionDays: 3 } },
    ],
    // ===== 🎯 LEAD MAGNETS & CONTENT GENERATION =====
    '🎯 Lead Magnets': [
        { method: 'GET', path: '/api/lead-magnets/coach', desc: 'Get coach lead magnet settings' },
        { method: 'PUT', path: '/api/lead-magnets/coach', desc: 'Update coach lead magnet settings' },
        { method: 'POST', path: '/api/lead-magnets/ai-diet-plan', desc: 'Generate AI diet plan' },
        { method: 'POST', path: '/api/lead-magnets/bmi-calculator', desc: 'Calculate BMI with recommendations' },
        { method: 'POST', path: '/api/lead-magnets/ebook-generator', desc: 'Generate personalized e-book content' },
        { method: 'POST', path: '/api/lead-magnets/workout-calculator', desc: 'Calculate workout metrics (1RM, heart rate)' },
        { method: 'POST', path: '/api/lead-magnets/progress-tracker', desc: 'Track fitness progress and analytics' },
        { method: 'POST', path: '/api/lead-magnets/sleep-analyzer', desc: 'Analyze sleep quality and get recommendations' },
        { method: 'POST', path: '/api/lead-magnets/stress-assessment', desc: 'Assess stress levels and get coping strategies' },
        { method: 'GET', path: '/api/lead-magnets/available', desc: 'Get all available lead magnets' },
        { method: 'GET', path: '/api/lead-magnets/analytics', desc: 'Get lead magnet performance analytics' },
        { method: 'GET', path: '/api/lead-magnets/history/:leadId', desc: 'Get lead magnet interaction history' },
    ],
    // ===== 🌐 PUBLIC FUNNEL PAGES & ACCESS =====
    '🌐 Public Funnel Pages': [
        { method: 'GET', path: '/funnels/:funnelSlug/:pageSlug', desc: 'Render a public funnel page' },
    ],
    // ===== 👑 ADMIN MANAGEMENT & PLATFORM CONTROL =====
    '👑 Admin Management': [
        // Admin Authentication
        { method: 'POST', path: '/api/admin/auth/login', desc: 'Admin login' },
        { method: 'POST', path: '/api/admin/auth/logout', desc: 'Admin logout' },
        { method: 'GET', path: '/api/admin/auth/me', desc: 'Get current admin user' },
        
        // Admin Settings
        { method: 'GET', path: '/api/admin/settings', desc: 'Get platform settings' },
        { method: 'PUT', path: '/api/admin/settings', desc: 'Update platform settings' },
        { method: 'GET', path: '/api/admin/settings/credit-system', desc: 'Get credit system configuration' },
        { method: 'PUT', path: '/api/admin/settings/credit-system', desc: 'Update credit system configuration' },
        
        // Admin User Management
        { method: 'GET', path: '/api/admin/users', desc: 'Get all users (Admin)' },
        { method: 'GET', path: '/api/admin/users/:userId', desc: 'Get specific user details (Admin)' },
        { method: 'PUT', path: '/api/admin/users/:userId', desc: 'Update user (Admin)' },
        { method: 'DELETE', path: '/api/admin/users/:userId', desc: 'Delete user (Admin)' },
        { method: 'POST', path: '/api/admin/users/:userId/activate', desc: 'Activate user account (Admin)' },
        { method: 'POST', path: '/api/admin/users/:userId/deactivate', desc: 'Deactivate user account (Admin)' },
        
        // Admin Logs
        { method: 'GET', path: '/api/admin/logs', desc: 'Get system logs (Admin)' },
        { method: 'GET', path: '/api/admin/logs/errors', desc: 'Get error logs (Admin)' },
        { method: 'GET', path: '/api/admin/logs/access', desc: 'Get access logs (Admin)' },
        { method: 'GET', path: '/api/admin/logs/audit', desc: 'Get audit logs (Admin)' },
        
        // Admin Analytics
        { method: 'GET', path: '/api/admin/analytics/platform', desc: 'Get platform-wide analytics (Admin)' },
        { method: 'GET', path: '/api/admin/analytics/users', desc: 'Get user analytics (Admin)' },
        { method: 'GET', path: '/api/admin/analytics/revenue', desc: 'Get revenue analytics (Admin)' },
        { method: 'GET', path: '/api/admin/analytics/performance', desc: 'Get performance analytics (Admin)' },
        
        // Admin Financial & Payment Management
        { method: 'GET', path: '/api/admin/financial/credit-system', desc: 'Get credit system configuration (Admin)' },
        { method: 'PUT', path: '/api/admin/financial/credit-system', desc: 'Update credit system configuration (Admin)' },
        { method: 'GET', path: '/api/admin/financial/credit-packages', desc: 'Get credit packages (Admin)' },
        { method: 'GET', path: '/api/admin/financial/revenue-analytics', desc: 'Get revenue analytics (Admin)' },
        { method: 'GET', path: '/api/admin/financial/payment-failures', desc: 'Get payment failure analytics (Admin)' },
        { method: 'GET', path: '/api/admin/financial/gateway-markup', desc: 'Get gateway markup analytics (Admin)' },
        { method: 'GET', path: '/api/admin/financial/credit-usage', desc: 'Get credit usage analytics (Admin)' },
        
        // Admin Payment Settings & Commission Payouts
        { method: 'GET', path: '/api/admin/financial/payment-settings', desc: 'Get payment settings (Admin)' },
        { method: 'PUT', path: '/api/admin/financial/payment-settings', desc: 'Update payment settings (Admin)' },
        { method: 'GET', path: '/api/admin/financial/commission-payouts', desc: 'Get commission payouts (Admin)' },
        { method: 'POST', path: '/api/admin/financial/commission-payouts/:paymentId/process', desc: 'Process commission payout (Admin)' },
        { method: 'GET', path: '/api/admin/financial/payment-gateways', desc: 'Get payment gateway configurations (Admin)' },
        { method: 'PUT', path: '/api/admin/financial/payment-gateways/:gatewayName', desc: 'Update payment gateway configuration (Admin)' },
        { method: 'POST', path: '/api/admin/financial/payment-gateways/:gatewayName/test', desc: 'Test payment gateway (Admin)' },
        { method: 'GET', path: '/api/admin/financial/payment-analytics', desc: 'Get payment analytics (Admin)' },
        
        // NEW: Razorpay Account Management
        { method: 'GET', path: '/api/admin/financial/razorpay-account', desc: 'Get Razorpay account details and balance (Admin)' },
        // NEW: MLM Commission Management
        { method: 'PUT', path: '/api/admin/financial/mlm-commission-structure', desc: 'Update MLM commission structure (Admin)', sample: { levels: [{ level: 1, percentage: 10 }, { level: 2, percentage: 5 }], platformFeePercentage: 5, maxLevels: 3, autoPayoutEnabled: true, payoutThreshold: 100 } },
        { method: 'POST', path: '/api/admin/financial/process-mlm-commission', desc: 'Process MLM commission for subscription (Admin)', sample: { subscriptionId: 'sub_id', subscriptionAmount: 1000, coachId: 'coach_id' } },
        // NEW: Platform Fee Management
        { method: 'GET', path: '/api/admin/financial/platform-fees', desc: 'Get platform fee settings (Admin)' },
        { method: 'PUT', path: '/api/admin/financial/platform-fees', desc: 'Update platform fee settings (Admin)', sample: { subscriptionFee: 5.0, transactionFee: 2.0, payoutFee: 1.0, refundFee: 0.5 } },
        // NEW: Financial Analytics Dashboard
        { method: 'GET', path: '/api/admin/financial/analytics-dashboard', desc: 'Get comprehensive financial analytics dashboard (Admin)', sample: { timeRange: 30 } },
    ],
    // ===== 📢 MARKETING & ADVERTISING CAMPAIGNS =====
    '📢 Marketing & Advertising': [
        { method: 'GET', path: '/api/ads', desc: 'List all ad campaigns for coach' },
        { method: 'POST', path: '/api/ads/create', desc: 'Create a new ad campaign', sample: { coachMetaAccountId: '123456789', campaignData: { name: 'My Campaign', objective: 'LEAD_GENERATION', budget: 100 } } },
        { method: 'POST', path: '/api/ads/sync', desc: 'Sync campaigns from Meta to DB', sample: { coachMetaAccountId: '123456789' } },
        { method: 'PUT', path: '/api/ads/:campaignId', desc: 'Update an ad campaign', sample: { name: 'Updated Name', budget: 200 } },
        { method: 'POST', path: '/api/ads/:campaignId/pause', desc: 'Pause an ad campaign' },
        { method: 'POST', path: '/api/ads/:campaignId/resume', desc: 'Resume an ad campaign' },
        { method: 'GET', path: '/api/ads/:campaignId/analytics', desc: 'Get analytics/insights for a campaign' },
        { method: 'POST', path: '/api/ads/upload-image', desc: 'Upload image and get Meta image hash', sample: { imageUrl: 'https://example.com/image.jpg' } },
        { method: 'POST', path: '/api/ads/:campaignId/ad-sets', desc: 'Create ad set for targeting and budget', sample: { name: 'Target Audience', targeting: { age_min: 25, age_max: 45, geo_locations: { countries: ['US'] } }, daily_budget: 2500 } },
        { method: 'POST', path: '/api/ads/:campaignId/creatives', desc: 'Create ad creative with image and text', sample: { name: 'Website Creative', object_story_spec: { link_data: { link: 'https://yourwebsite.com', message: 'Check out our amazing program!', image_hash: 'abc123...', call_to_action: { type: 'LEARN_MORE' } } } } },
        { method: 'POST', path: '/api/ads/:campaignId/ads', desc: 'Create ad that combines ad set and creative', sample: { name: 'Website Traffic Ad', adset_id: 'adset_456', creative: { creative_id: 'creative_789' }, status: 'PAUSED' } },
        { method: 'GET', path: '/api/ads/:campaignId/ad-sets', desc: 'List ad sets for a campaign' },
        { method: 'GET', path: '/api/ads/:campaignId/creatives', desc: 'List ad creatives for a campaign' },
        { method: 'GET', path: '/api/ads/:campaignId/ads', desc: 'List ads for a campaign' },
        { method: 'DELETE', path: '/api/ads/:campaignId', desc: 'Delete ad campaign' },
        { method: 'GET', path: '/api/ads/coach/:coachId', desc: 'Get all ads for specific coach' },
        { method: 'GET', path: '/api/ads/analytics/overview', desc: 'Get overall ads analytics' },
        { method: 'POST', path: '/api/ads/bulk-actions', desc: 'Perform bulk actions on campaigns', sample: { campaignIds: ['camp1', 'camp2'], action: 'pause' } },
        {
            method: 'POST', path: '/api/ads/create-url-campaign', desc: 'Create complete URL campaign (all-in-one)', sample: {
                coachMetaAccountId: '123456789',
                campaignData: { name: 'Website Traffic Q1', objective: 'LINK_CLICKS', status: 'PAUSED', daily_budget: 5000 },
                adSetData: { name: 'Target Audience', targeting: { age_min: 25, age_max: 45, geo_locations: { countries: ['US'] } }, daily_budget: 2500, billing_event: 'IMPRESSIONS', optimization_goal: 'LINK_CLICKS' },
                creativeData: { name: 'Website Creative', object_story_spec: { link_data: { link: 'https://yourfitnesswebsite.com', message: 'Transform your fitness journey today!', image_hash: 'abc123...', call_to_action: { type: 'LEARN_MORE' } } } },
                adData: { name: 'Website Traffic Ad', status: 'PAUSED' }
            }
        }
    ],
    // ===== 🚀 MARKETING V1 API (NEW COMPREHENSIVE SYSTEM) =====
    '🚀 Marketing V1 API (Comprehensive)': [
        // Credentials Management
        { method: 'GET', path: '/api/marketing/v1/credentials/meta/setup-steps', desc: 'Get detailed Meta API setup instructions' },
        { method: 'GET', path: '/api/marketing/v1/credentials/openai/setup-steps', desc: 'Get detailed OpenAI setup instructions' },
        { method: 'POST', path: '/api/marketing/v1/credentials/meta', desc: 'Setup Meta API credentials for coach', sample: { accessToken: 'EAABwzLixnjYBO...', appId: '123456789', appSecret: 'abc123...', businessAccountId: '123456789', adAccountId: 'act_123456789' } },
        { method: 'POST', path: '/api/marketing/v1/credentials/meta/verify', desc: 'Verify Meta API credentials' },
        { method: 'GET', path: '/api/marketing/v1/credentials/meta/account-info', desc: 'Get Meta account information' },
        { method: 'POST', path: '/api/marketing/v1/credentials/openai', desc: 'Setup OpenAI credentials for AI features', sample: { apiKey: 'sk-...', modelPreference: 'gpt-4' } },
        { method: 'GET', path: '/api/marketing/v1/credentials/status', desc: 'Get marketing credentials status' },
        
        // Campaign Analysis & Management
        { method: 'GET', path: '/api/marketing/v1/campaigns/analysis', desc: 'Get comprehensive campaign analysis', sample: { dateRange: '30d', campaignIds: 'camp1,camp2', includeInsights: true, includeRecommendations: true } },
        { method: 'GET', path: '/api/marketing/v1/campaigns/:campaignId/insights', desc: 'Get detailed campaign insights', sample: { dateRange: '30d', breakdown: 'daily', includeDemographics: true, includePlacements: true } },
        { method: 'GET', path: '/api/marketing/v1/campaigns/:campaignId/metrics', desc: 'Get campaign performance metrics', sample: { dateRange: '30d', metrics: 'impressions,clicks,spend,ctr,cpc,cpm,conversions' } },
        { method: 'GET', path: '/api/marketing/v1/campaigns/:campaignId/audience-insights', desc: 'Get campaign audience insights', sample: { dateRange: '30d' } },
        { method: 'GET', path: '/api/marketing/v1/campaigns/:campaignId/recommendations', desc: 'Get campaign optimization recommendations', sample: { includeAIRecommendations: true } },
        { method: 'POST', path: '/api/marketing/v1/campaigns/create', desc: 'Create new campaign with AI assistance', sample: { name: 'AI Campaign', objective: 'CONVERSIONS', budget: 50, targetAudience: 'Fitness enthusiasts 25-45', productInfo: 'Online fitness coaching program', useAI: true, autoOptimize: false } },
        { method: 'PUT', path: '/api/marketing/v1/campaigns/:campaignId', desc: 'Update campaign settings', sample: { name: 'Updated Campaign', status: 'ACTIVE', dailyBudget: 75 } },
        { method: 'POST', path: '/api/marketing/v1/campaigns/:campaignId/pause', desc: 'Pause campaign' },
        { method: 'POST', path: '/api/marketing/v1/campaigns/:campaignId/resume', desc: 'Resume campaign' },
        { method: 'DELETE', path: '/api/marketing/v1/campaigns/:campaignId', desc: 'Delete campaign' },
        { method: 'POST', path: '/api/marketing/v1/campaigns/:campaignId/duplicate', desc: 'Duplicate campaign', sample: { newName: 'Campaign Copy', modifications: { budget: 60, targetAudience: 'Updated audience' } } },
        
        // AI-Powered Features
        { method: 'POST', path: '/api/marketing/v1/ai/generate-copy', desc: 'Generate AI-powered ad copy', sample: { productInfo: 'Online fitness coaching', targetAudience: 'Fitness enthusiasts 25-45', campaignObjective: 'CONVERSIONS', tone: 'motivational', length: 'medium', includeCallToAction: true } },
        { method: 'POST', path: '/api/marketing/v1/ai/targeting-recommendations', desc: 'Generate AI-powered targeting recommendations', sample: { targetAudience: 'Fitness enthusiasts', budget: 50, objective: 'CONVERSIONS', productInfo: 'Online fitness coaching', excludeAudiences: ['competitors'] } },
        { method: 'POST', path: '/api/marketing/v1/ai/optimize-campaign/:campaignId', desc: 'Optimize campaign with AI', sample: { optimizationType: 'performance', includeBudgetOptimization: true, includeAudienceOptimization: true, includeCreativeOptimization: true } },
        { method: 'POST', path: '/api/marketing/v1/ai/generate-creatives', desc: 'Generate AI-powered creative variations', sample: { baseCreative: 'Transform your fitness journey', productInfo: 'Online fitness coaching', targetAudience: 'Fitness enthusiasts', variations: 3, includeImages: false, includeVideos: false } },
        { method: 'GET', path: '/api/marketing/v1/ai/performance-insights/:campaignId', desc: 'Get AI-powered performance insights', sample: { dateRange: '30d', includePredictions: true, includeTrends: true, includeAnomalies: true } },
        { method: 'POST', path: '/api/marketing/v1/ai/generate-strategy', desc: 'Generate AI-powered marketing strategy', sample: { businessInfo: 'Online fitness coaching business', goals: 'Increase conversions by 50%', budget: 1000, timeline: '3 months', targetAudience: 'Fitness enthusiasts 25-45', competitors: ['competitor1', 'competitor2'] } },
        
        // Dashboard & Analytics
        { method: 'GET', path: '/api/marketing/v1/dashboard', desc: 'Get marketing dashboard data', sample: { dateRange: '30d', includeAIInsights: true, includeRecommendations: true } },
        { method: 'GET', path: '/api/marketing/v1/campaigns/performance-summary', desc: 'Get campaign performance summary', sample: { dateRange: '30d', campaignIds: 'camp1,camp2', includeComparisons: true } },
        { method: 'GET', path: '/api/marketing/v1/campaigns/export', desc: 'Export campaign data', sample: { format: 'csv', dateRange: '30d', campaignIds: 'camp1,camp2', includeInsights: true } },
        
        // Automation & Scheduling
        { method: 'POST', path: '/api/marketing/v1/campaigns/:campaignId/schedule', desc: 'Schedule campaign', sample: { startDate: '2024-01-01T00:00:00Z', endDate: '2024-01-31T23:59:59Z', timezone: 'UTC', budgetSchedule: { dailyBudget: 50 } } },
        { method: 'POST', path: '/api/marketing/v1/campaigns/:campaignId/automation', desc: 'Set up campaign automation rules', sample: { rules: [{ condition: 'ctr < 1%', action: 'pause_campaign' }], notifications: true, autoOptimize: false } },
        { method: 'GET', path: '/api/marketing/v1/campaigns/:campaignId/automation/status', desc: 'Get automation status' }
    ],
    // ===== 🧮 LEAD SCORING & TRACKING (EXTENDED) =====
    '🧮 Lead Scoring & Tracking': [
        { method: 'GET', path: '/api/lead-scoring/email-opened', desc: 'Track email open (tracking pixel, use ?leadId=LEAD_ID)' },
        { method: 'GET', path: '/api/lead-scoring/link-clicked', desc: 'Track link click and redirect (use ?leadId=LEAD_ID&target=URL)' },
        // WhatsApp scoring moved to dustbin/whatsapp-dump/
        { method: 'POST', path: '/api/lead-scoring/form-submitted', desc: 'Track form submission ({ leadId })' },
        { method: 'POST', path: '/api/lead-scoring/call-booked', desc: 'Track call/meeting booking ({ leadId })' },
        { method: 'POST', path: '/api/lead-scoring/call-attended', desc: 'Track attended call ({ leadId })' },
        { method: 'POST', path: '/api/lead-scoring/profile-completed', desc: 'Track profile completion ({ leadId })' },
        { method: 'POST', path: '/api/lead-scoring/lead-magnet-converted', desc: 'Track lead magnet conversion ({ leadId })' },
        { method: 'POST', path: '/api/lead-scoring/followup-added', desc: 'Track follow-up note added ({ leadId })' },
        { method: 'POST', path: '/api/lead-scoring/booking-recovered', desc: 'Track booking recovery ({ leadId })' },
        { method: 'POST', path: '/api/lead-scoring/inactivity-decay', desc: 'Track inactivity decay ({ leadId })' },
        { method: 'POST', path: '/api/lead-scoring/unsubscribed', desc: 'Track unsubscribe event ({ leadId })' },
        { method: 'POST', path: '/api/lead-scoring/email-bounced', desc: 'Track email bounce event ({ leadId })' },
    ],
    // ===== 🤖 AI SERVICES & INTELLIGENCE (EXTENDED) =====
    '🤖 AI Services': [
      { method: 'GET', path: '/api/ai/test-connection', desc: 'Test AI service connection and API keys' },
      { method: 'GET', path: '/api/ai/models', desc: 'Get available AI models and providers' },
      { method: 'POST', path: '/api/ai/generate-marketing-copy', desc: 'Generate marketing copy with AI', sample: { prompt: 'Create compelling copy for a fitness program', temperature: 0.8, maxTokens: 500 } },
      { method: 'POST', path: '/api/ai/generate-headlines', desc: 'Generate marketing headlines and CTAs', sample: { product: '12-week fitness program', targetAudience: 'busy professionals', count: 5 } },
      { method: 'POST', path: '/api/ai/generate-social-post', desc: 'Generate social media posts', sample: { coachName: 'John Doe', niche: 'Weight Loss', offer: '12-week program', targetAudience: 'weight loss seekers' } },
              { method: 'POST', path: '/api/ai/analyze-sentiment', desc: 'Analyze sentiment of messages', sample: { message: 'I am interested in your program' } },
      { method: 'POST', path: '/api/ai/generate-contextual-response', desc: 'Generate contextual responses based on sentiment', sample: { userMessage: 'How much does it cost?', sentiment: 'interested', context: { leadStage: 'qualified' } } },
      { method: 'POST', path: '/api/ai/generate-sop', desc: 'Generate Standard Operating Procedures', sample: { taskType: 'Lead Follow-up', context: 'Fitness coaching business' } },
      { method: 'POST', path: '/api/ai/generate-lead-insights', desc: 'Generate AI-powered lead insights', sample: { leadData: { name: 'Jane', email: 'jane@example.com', source: 'Facebook Ad', engagement: 'high' } } },
      { method: 'POST', path: '/api/ai/optimize-content', desc: 'Optimize content for better performance', sample: { content: 'Join our fitness program', targetAudience: 'beginners', goal: 'increase conversions' } },
      { method: 'POST', path: '/api/ai/chat-completion', desc: 'Generic AI chat completion', sample: { messages: [{ role: 'user', content: 'Hello' }], model: 'gpt-3.5-turbo', temperature: 0.7 } },
 
      { method: 'POST', path: '/api/leads/:leadId/generate-nurturing-sequence', desc: 'Generate AI-powered nurturing strategy', sample: { leadId: '...', sequenceType: 'warm_lead' } },
      { method: 'POST', path: '/api/leads/:leadId/generate-followup-message', desc: 'Generate AI-powered follow-up message', sample: { leadId: '...', followUpType: 'first_followup', context: 'General follow-up' } },
    ],
    // ===== 🚀 COMPREHENSIVE COACH DASHBOARD FEATURES =====
    '🚀 NEW: COMPREHENSIVE COACH DASHBOARD FEATURES': [
        { method: 'INFO', path: '📅 Calendar & Appointment System', desc: 'Complete appointment booking, scheduling, and calendar management with conflict detection and reminders' },
        // WhatsApp automation moved to dustbin/whatsapp-dump/
        { method: 'INFO', path: '🛒 E-commerce & Payment Processing', desc: 'Multi-gateway payment processing (Stripe, PayPal, Razorpay), subscription management, shopping cart, and revenue analytics' },
        { method: 'INFO', path: '🤖 AI Integration', desc: 'Sentiment analysis, lead qualification, performance insights, and automated content generation' },
        { method: 'INFO', path: '⚡ Automation Engine', desc: 'Event-driven automation with RabbitMQ integration for seamless workflow orchestration' },
        { method: 'INFO', path: '📊 Advanced Analytics', desc: 'Comprehensive dashboard with real-time metrics, performance tracking, and business intelligence' },
        { method: 'INFO', path: '🔗 Integration Hub', desc: 'Seamless integration with existing automation rules, lead nurturing, and marketing campaigns' }
    ],
    // ===== 🔐 AUTHENTICATION & USER MANAGEMENT (DETAILED) =====
    '🔐 Authentication & User Management': {
        'POST /api/auth/signup': {
            description: 'Unified user registration supporting all roles including MLM coaches',
            note: 'For coaches: must provide unique selfCoachId. For other roles: MLM fields are optional.',
            body: {
                name: 'Full name (required)',
                email: 'Email address (required)',
                password: 'Password (required)',
                role: 'User role: client, coach, admin, staff (required)',
                selfCoachId: 'Unique Coach ID - required only for coach role',
                currentLevel: 'MLM hierarchy level (1-12) - required only for coach role',
                sponsorId: 'Sponsor coach ID (required for coach role)',
                teamRankName: 'Team rank name (optional for coach role)',
                presidentTeamRankName: 'President team rank name (optional for coach role)'
            },
            example: 'POST /api/auth/signup\nBody: {"name": "John Doe", "email": "john@example.com", "password": "password123", "role": "coach", "selfCoachId": "COACH123", "currentLevel": 1, "sponsorId": "sponsor_id"}'
        },
        'POST /api/auth/upgrade-to-coach': {
            description: 'Convert existing verified user to MLM coach',
            body: {
                required: ['userId', 'selfCoachId', 'currentLevel', 'sponsorId'],
                optional: ['teamRankName', 'presidentTeamRankName']
            },
            note: 'Allows users to join MLM system later without re-signup. All hierarchy fields required.',
            example: {
                userId: 'user_id',
                selfCoachId: 'W1234567',
                currentLevel: 1,
                sponsorId: 'sponsor_id',
                teamRankName: 'Team Alpha',
                presidentTeamRankName: 'President Team'
            }
        },
        'POST /api/auth/lock-hierarchy': {
            description: 'Lock coach hierarchy to prevent future changes (one-time action)',
            body: {
                required: ['coachId']
            },
            note: 'NEW: Lock hierarchy after first save. Changes can only be made through admin request.',
            example: { coachId: 'coach_id' }
        },
        'GET /api/auth/available-sponsors': {
            description: 'Get list of available digital coaches who can be sponsors',
            body: 'No body required',
            note: 'NEW: Only digital coaches can be sponsors. External sponsors removed.',
            example: 'GET /api/auth/available-sponsors'
        },
        'GET /api/auth/coach-ranks': {
            description: 'Get all available coach ranks for signup dropdown',
            body: 'No body required',
            note: 'NEW: Returns 12 MLM coach ranks (Distributor Coach to Founder\'s Circle)',
            example: 'GET /api/auth/coach-ranks'
        },
        'POST /api/auth/verify-otp': 'Verify email with OTP',
        'POST /api/auth/login': 'User login and authentication',
        'POST /api/auth/forgot-password': 'Request password reset',
        'POST /api/auth/reset-password': 'Reset password with token',
        'POST /api/auth/resend-otp': 'Resend OTP for verification',
        'GET /api/auth/me': 'Get current user profile (protected)',
        'PUT /api/auth/update-profile': 'Update user profile (protected)',
        'POST /api/auth/logout': 'User logout'
    }
};

// 🏠 Dynamic Homepage Route with new UI
router.get('/', (req, res) => {
    let routeTables = '';
    let sidebarLinks = '';

    // Group similar sections for better organization
    const groupedSections = {
        '🔐 Core Services & Authentication': [
            '🔐 Authentication & User Management', 
            '🔐 Authentication & User Management (Detailed)',
            '📈 Funnel Management', 
            '🌐 Custom Domain Management',
            '🎯 Lead Management (CRM)', 
            '🌱 Lead Nurturing',
            '🧮 Lead Scoring & Tracking',
            '🧮 Lead Scoring & Tracking (EXTENDED)',
            // WhatsApp integration moved to dustbin/whatsapp-dump/
        ],
        '🤖 AI & Automation': [
            '🤖 AI Services', 
            '🤖 AI Services (EXTENDED)',
            '🤖 AI Ads Agent', 
            '⚙️ Automation Rules', 
            '📋 Workflow & Task Management'
        ],
        '📊 Business Intelligence & MLM': [
            '📊 Coach Dashboard', 
            '👥 Staff Management',
            '👥 Staff Dashboard',
            '🏆 Staff Leaderboard & Scoring',
            '📊 Advanced MLM Network (Unified)',
            '💰 Performance & Commissions'
        ],
        '💰 E-commerce & Payments': [
            '💳 Funnelseye Central Payment System',
            '📦 Subscription Management',
            '🛒 Shopping Cart Management'
        ],
        '📢 Marketing & Content': [
            '📢 Marketing & Advertising', 
            '🌱 Nurturing Sequences', 
            '🎯 Lead Magnets',
            '🌐 Public Funnel Pages'
        ],
        '🔗 Integrations & Utilities': [
            '🔗 Zoom Integration', 
            '💬 Message Templates', 
            '📁 File Upload', 
            '💡 Priority Feed & Calendar', 
            '👤 Coach Profile Management',
            '🚀 COMPREHENSIVE COACH DASHBOARD FEATURES'
        ]
    };

    // Generate sidebar with grouped sections
    for (const groupTitle in groupedSections) {
        const groupId = groupTitle.replace(/[^a-zA-Z0-9]/g, '');
        sidebarLinks += `
            <div class="sidebar-group">
                <div class="sidebar-group-header" onclick="toggleGroup('${groupId}')">
                    <span class="sidebar-group-title">${groupTitle}</span>
                    <button class="sidebar-group-toggle" id="toggle-${groupId}">▼</button>
                </div>
                <div class="sidebar-group-links" id="group-${groupId}">
        `;
        
        groupedSections[groupTitle].forEach(sectionTitle => {
            if (allApiRoutes[sectionTitle]) {
                const id = sectionTitle.replace(/[^a-zA-Z0-9]/g, '');
                sidebarLinks += `<a href="#${id}" class="tab-link">${sectionTitle}</a>`;
            }
        });
        
        sidebarLinks += `
                </div>
            </div>
        `;
    }

    // Generate route tables for all sections
    for (const title in allApiRoutes) {
        const id = title.replace(/[^a-zA-Z0-9]/g, '');
        routeTables += `
            <div id="${id}" class="route-table-container">
                <h2>${title}</h2>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Method</th>
                                <th>Endpoint</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        // Handle both array and object formats
        if (Array.isArray(allApiRoutes[title])) {
            // Old array format
            allApiRoutes[title].forEach(route => {
                routeTables += `
                    <tr>
                        <td class="method method-${route.method.toLowerCase()}">${route.method}</td>
                        <td>${route.path}</td>
                        <td>
                            ${route.desc.replace(/`/g, '\\`')}
                            ${route.sample ? '<pre style="margin-top:8px;background:#0b1020;color:#d1e9ff;padding:10px;border-radius:6px;white-space:pre-wrap;">' + JSON.stringify(route.sample, null, 2).replace(/`/g, '\\`') + '</pre>' : ''}
                        </td>
                    </tr>
                `;
            });
        } else {
            // New object format with detailed route information
            Object.entries(allApiRoutes[title]).forEach(([endpoint, routeInfo]) => {
                const method = endpoint.split(' ')[0];
                const path = endpoint.split(' ')[1];
                
                routeTables += `
                    <tr>
                        <td class="method method-${method.toLowerCase()}">${method}</td>
                        <td>${path}</td>
                        <td>
                            <strong>${routeInfo.description || 'No description'}</strong><br>
                            ${routeInfo.note ? `<em>${routeInfo.note}</em><br>` : ''}
                            ${routeInfo.body ? `<strong>Body:</strong> ${typeof routeInfo.body === 'string' ? routeInfo.body : JSON.stringify(routeInfo.body, null, 2)}<br>` : ''}
                            ${routeInfo.query ? `<strong>Query:</strong> ${JSON.stringify(routeInfo.query, null, 2)}<br>` : ''}
                            ${routeInfo.params ? `<strong>Params:</strong> ${JSON.stringify(routeInfo.params, null, 2)}<br>` : ''}
                            ${routeInfo.example ? `<strong>Example:</strong> <pre style="margin-top:8px;background:#0b1020;color:#d1e9ff;padding:10px;border-radius:6px;white-space:pre-wrap;">${JSON.stringify(routeInfo.example, null, 2)}</pre>` : ''}
                        </td>
                    </tr>
                `;
            });
        }
        routeTables += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>FunnelsEye API</title>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
            <style>
                :root {
                    --bg-color: #0d1117;
                    --card-bg: rgba(22, 27, 34, 0.8);
                    --primary-color: #58a6ff;
                    --secondary-color: #f082ff;
                    --text-color: #c9d1d9;
                    --border-color: #30363d;
                    --button-bg: #238636;
                    --button-hover: #2ea043;
                }
                body, html {
                    margin: 0;
                    padding: 0;
                    font-family: 'Poppins', sans-serif;
                    background-color: var(--bg-color);
                    color: var(--text-color);
                    height: 100%;
                    overflow-x: hidden;
                    overflow-y: auto;
                }
                .background-bubbles {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    z-index: 0;
                }
                .bubble {
                    position: absolute;
                    bottom: -100px;
                    background-color: rgba(88, 166, 255, 0.1);
                    border-radius: 50%;
                    animation: floatUp 15s infinite ease-in;
                }
                .bubble:nth-child(1) { width: 60px; height: 60px; left: 10%; animation-duration: 12s; }
                .bubble:nth-child(2) { width: 40px; height: 40px; left: 20%; animation-duration: 15s; animation-delay: 2s; }
                .bubble:nth-child(3) { width: 80px; height: 80px; left: 35%; animation-duration: 18s; animation-delay: 1s; }
                .bubble:nth-child(4) { width: 50px; height: 50px; left: 50%; animation-duration: 11s; }
                .bubble:nth-child(5) { width: 70px; height: 70px; left: 65%; animation-duration: 16s; animation-delay: 3s; }
                .bubble:nth-child(6) { width: 90px; height: 90px; left: 80%; animation-duration: 20s; }
                .bubble:nth-child(7) { width: 65px; height: 65px; left: 90%; animation-duration: 13s; animation-delay: 2s; }
                .bubble:nth-child(8) { width: 55px; height: 55px; left: 25%; animation-duration: 17s; animation-delay: 4s; }
                .bubble:nth-child(9) { width: 75px; height: 75px; left: 45%; animation-duration: 14s; }
                .bubble:nth-child(10) { width: 100px; height: 100px; left: 70%; animation-duration: 22s; animation-delay: 5s; }

                @keyframes floatUp {
                    0% { transform: translateY(0) rotate(0deg); opacity: 0; border-radius: 50%; }
                    50% { opacity: 1; }
                    100% { transform: translateY(-1000px) rotate(720deg); opacity: 0; border-radius: 20%; }
                }

                .main-content {
                    position: relative;
                    z-index: 1;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    flex-direction: column;
                    transition: all 0.5s ease-in-out;
                    padding: 2rem;
                    box-sizing: border-box;
                }
                .main-content.collapsed {
                    justify-content: flex-start;
                    align-items: flex-start;
                    height: auto;
                    padding: 0;
                }
                .main-content.collapsed .header-section {
                    display: none;
                }
                .container {
                    background-color: var(--card-bg);
                    backdrop-filter: blur(10px);
                    border: 1px solid var(--border-color);
                    border-radius: 1rem;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    max-width: 1200px;
                    width: 90%;
                    display: flex;
                    flex-direction: column;
                    min-height: 80vh;
                    overflow: hidden;
                    transition: all 0.5s ease-in-out;
                }
                .header-section {
                    text-align: center;
                    padding: 4rem 2rem;
                    max-width: 800px;
                    animation: fadeIn 1.5s ease-in-out;
                }
                .header-section h1 {
                    font-size: 3rem;
                    font-weight: 700;
                    color: white;
                    margin: 0;
                    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    filter: drop-shadow(0 0 5px rgba(88, 166, 255, 0.3));
                }
                .header-section p {
                    margin-top: 1rem;
                    font-size: 1.1rem;
                    color: var(--text-color);
                }
                #show-endpoints-btn {
                    margin-top: 2rem;
                    padding: 12px 28px;
                    font-size: 1rem;
                    font-weight: 600;
                    color: white;
                    background-color: var(--button-bg);
                    border: none;
                    border-radius: 50px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(35, 134, 54, 0.4);
                }
                #show-endpoints-btn:hover {
                    background-color: var(--button-hover);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(46, 160, 67, 0.6);
                }
                .api-docs-container {
                    display: none;
                    flex: 1;
                    transition: all 0.5s ease-in-out;
                    max-height: calc(100vh - 40px);
                    overflow-y: auto;
                    overflow-x: auto;
                    min-width: 0;
                }
                .api-docs-container.visible {
                    display: flex;
                    min-width: 0;
                    width: 100%;
                }
                .sidebar {
                    width: 280px;
                    padding: 2rem 1rem;
                    display: flex;
                    flex-direction: column;
                    border-right: 1px solid var(--border-color);
                    overflow-y: auto;
                    flex-shrink: 0;
                    transition: transform 0.3s ease-in-out;
                }
                
                .sidebar-group {
                    margin-bottom: 1rem;
                }
                
                .sidebar-group-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.5rem 0;
                    cursor: pointer;
                    user-select: none;
                    border-bottom: 1px solid var(--border-color);
                    margin-bottom: 0.5rem;
                }
                
                .sidebar-group-title {
                    font-weight: 600;
                    color: var(--primary-color);
                    font-size: 0.9rem;
                }
                
                .sidebar-group-toggle {
                    background: none;
                    border: none;
                    color: var(--text-color);
                    cursor: pointer;
                    padding: 0.25rem;
                    border-radius: 4px;
                    transition: all 0.2s ease;
                }
                
                .sidebar-group-toggle:hover {
                    background: rgba(88, 166, 255, 0.1);
                }
                
                .sidebar-group-toggle.expanded {
                    transform: rotate(180deg);
                }
                
                .sidebar-group-links {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s ease-in-out;
                }
                
                .sidebar-group-links.expanded {
                    max-height: 500px;
                }
                
                .sidebar-group-links a {
                    display: block;
                    padding: 0.5rem 0.5rem 0.5rem 1rem;
                    color: var(--text-color);
                    text-decoration: none;
                    font-size: 0.85rem;
                    border-radius: 4px;
                    transition: all 0.2s ease;
                    margin-bottom: 0.25rem;
                }
                
                .sidebar-group-links a:hover {
                    background: rgba(88, 166, 255, 0.1);
                    color: var(--primary-color);
                }
                .sidebar.collapsed {
                    transform: translateX(-100%);
                }
                .sidebar-overlay {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 998;
                    opacity: 0;
                    transition: opacity 0.3s ease-in-out;
                }
                .sidebar-overlay.visible {
                    opacity: 1;
                }
                .hamburger-menu {
                    display: none;
                    position: fixed;
                    top: 20px;
                    left: 20px;
                    z-index: 1000;
                    background: var(--card-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    padding: 10px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .hamburger-menu:hover {
                    background: rgba(88, 166, 255, 0.1);
                    border-color: var(--primary-color);
                }
                .hamburger-icon {
                    width: 20px;
                    height: 2px;
                    background: var(--text-color);
                    margin: 4px 0;
                    transition: 0.3s;
                }
                .hamburger-menu.active .hamburger-icon:nth-child(1) {
                    transform: rotate(-45deg) translate(-5px, 6px);
                }
                .hamburger-menu.active .hamburger-icon:nth-child(2) {
                    opacity: 0;
                }
                .hamburger-menu.active .hamburger-icon:nth-child(3) {
                    transform: rotate(45deg) translate(-5px, -6px);
                }
                .tabs {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .tab-link {
                    display: block;
                    padding: 12px 15px;
                    color: var(--text-color);
                    text-decoration: none;
                    font-weight: 400;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }
                .tab-link:hover, .tab-link.active {
                    background-color: rgba(88, 166, 255, 0.2);
                    color: var(--primary-color);
                    font-weight: 600;
                }
                .content-wrapper {
                    padding: 2rem;
                    flex-grow: 1;
                    overflow-y: auto;
                    overflow-x: auto;
                    min-width: 0;
                    max-width: 100%;
                }
                .route-table-container {
                    display: none;
                    animation: fadeIn 0.5s ease-in-out;
                }
                .route-table-container.active {
                    display: block;
                }
                .table-wrapper {
                    overflow-x: auto;
                    border-radius: 10px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                    scrollbar-width: thin;
                    scrollbar-color: var(--border-color) transparent;
                }
                .table-wrapper::-webkit-scrollbar {
                    height: 8px;
                }
                .table-wrapper::-webkit-scrollbar-track {
                    background: transparent;
                }
                .table-wrapper::-webkit-scrollbar-thumb {
                    background: var(--border-color);
                    border-radius: 4px;
                }
                .table-wrapper::-webkit-scrollbar-thumb:hover {
                    background: var(--primary-color);
                }
                h2 {
                    font-size: 1.8rem;
                    color: var(--primary-color);
                    margin-top: 0;
                    margin-bottom: 1.5rem;
                }
                table {
                    width: 100%;
                    min-width: 800px;
                    border-collapse: separate;
                    border-spacing: 0;
                    background-color: rgba(0,0,0,0.1);
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                    margin-bottom: 2rem;
                }
                th, td {
                    padding: 15px;
                    text-align: left;
                    border-bottom: 1px solid var(--border-color);
                }
                th {
                    background-color: rgba(0,0,0,0.2);
                    color: var(--primary-color);
                    font-weight: 600;
                    text-transform: uppercase;
                }
                tr:last-child td { border-bottom: none; }
                tr:hover { background-color: rgba(255,255,255,0.05); }
                .method {
                    padding: 5px 10px;
                    border-radius: 5px;
                    color: white;
                    font-weight: bold;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                }
                .method-get { background-color: #2da44e; }
                .method-post { background-color: #58a6ff; }
                .method-put { background-color: #e3b341; }
                .method-delete { background-color: #f85149; }
                
                /* Animations */
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 768px) {
                    .container {
                        width: 95%;
                        min-height: 90vh;
                        flex-direction: column;
                    }
                    .main-content.collapsed {
                        height: 100%;
                    }
                    .api-docs-container.visible {
                        flex-direction: column;
                    }
                    .sidebar {
                        width: 100%;
                        border-right: none;
                        border-bottom: 1px solid var(--border-color);
                        position: fixed;
                        left: 0;
                        top: 0;
                        height: 100vh;
                        background: var(--card-bg);
                        z-index: 999;
                        transform: translateX(-100%);
                    }
                    .sidebar.visible {
                        transform: translateX(0);
                    }
                    .hamburger-menu {
                        display: block;
                    }
                    .content-wrapper {
                        padding: 1rem;
                        margin-left: 0;
                        width: 100%;
                        overflow-x: auto;
                    }
                    .table-wrapper {
                        overflow-x: auto;
                        -webkit-overflow-scrolling: touch;
                    }
                    .hamburger-menu {
                        top: 15px;
                        left: 15px;
                    }
                    .sidebar-overlay {
                        display: block;
                    }
                }
            </style>
        </head>
        <body>
            <div class="hamburger-menu" id="hamburger-menu">
                <div class="hamburger-icon"></div>
                <div class="hamburger-icon"></div>
                <div class="hamburger-icon"></div>
            </div>
            <div class="sidebar-overlay" id="sidebar-overlay"></div>
            <div class="background-bubbles">
                <div class="bubble"></div><div class="bubble"></div><div class="bubble"></div><div class="bubble"></div><div class="bubble"></div>
                <div class="bubble"></div><div class="bubble"></div><div class="bubble"></div><div class="bubble"></div><div class="bubble"></div>
            </div>
            <div class="main-content" id="main-content">
                <div class="header-section" id="header-section">
                    <h1>✨ FunnelsEye API</h1>
                    <p>Your all-in-one backend for marketing funnels, lead management, and more.</p>
                    <button id="show-endpoints-btn">Show API Endpoints</button>
                </div>
                <div class="api-docs-container" id="api-docs-container">
                    <div class="sidebar">
                        <div class="tabs">
                            ${sidebarLinks}
                        </div>
                    </div>
                    <div class="content-wrapper">
                        <div id="docsWrapper">
                            ${routeTables}
                        </div>
                    </div>
                </div>
            </div>
            <script>
                // Function to toggle sidebar groups
                function toggleGroup(groupId) {
                    const groupLinks = document.getElementById(\`group-\${groupId}\`);
                    const toggleBtn = document.getElementById(\`toggle-\${groupId}\`);
                    
                    if (groupLinks.classList.contains('expanded')) {
                        groupLinks.classList.remove('expanded');
                        toggleBtn.classList.remove('expanded');
                        toggleBtn.textContent = '▼';
                    } else {
                        groupLinks.classList.add('expanded');
                        toggleBtn.classList.add('expanded');
                        toggleBtn.textContent = '▲';
                    }
                }

                document.addEventListener('DOMContentLoaded', () => {
                    const tabLinks = document.querySelectorAll('.tab-link');
                    const tabContents = document.querySelectorAll('.route-table-container');
                    const showBtn = document.getElementById('show-endpoints-btn');
                    const docsContainer = document.getElementById('api-docs-container');
                    const headerSection = document.getElementById('header-section');
                    const mainContent = document.getElementById('main-content');
                    const hamburgerMenu = document.getElementById('hamburger-menu');
                    const sidebar = document.querySelector('.sidebar');
                    const sidebarOverlay = document.getElementById('sidebar-overlay');

                    // Initialize sidebar groups - expand first group by default
                    if (window.innerWidth > 768) {
                        const firstGroup = document.querySelector('.sidebar-group');
                        if (firstGroup) {
                            const groupId = firstGroup.querySelector('.sidebar-group-header').getAttribute('onclick').match(/'([^']+)'/)[1];
                            toggleGroup(groupId);
                        }
                    }

                    showBtn.addEventListener('click', () => {
                        docsContainer.classList.add('visible');
                        mainContent.classList.add('collapsed');
                        
                        // Set the first tab as active by default
                        if (tabLinks.length > 0) {
                            tabLinks[0].classList.add('active');
                            tabContents[0].classList.add('active');
                        }
                    });

                    tabLinks.forEach(link => {
                        link.addEventListener('click', (e) => {
                            e.preventDefault();
                            tabLinks.forEach(l => l.classList.remove('active'));
                            tabContents.forEach(c => c.classList.remove('active'));

                            e.target.classList.add('active');
                            const targetId = e.target.getAttribute('href').substring(1);
                            document.getElementById(targetId).classList.add('active');
                            
                            // On mobile, close sidebar after tab selection
                            if (window.innerWidth <= 768) {
                                sidebar.classList.remove('visible');
                                hamburgerMenu.classList.remove('active');
                                sidebarOverlay.classList.remove('visible');
                            }
                        });
                    });

                    // Hamburger menu functionality
                    hamburgerMenu.addEventListener('click', (e) => {
                        e.stopPropagation();
                        hamburgerMenu.classList.toggle('active');
                        sidebar.classList.toggle('visible');
                        sidebarOverlay.classList.toggle('visible');
                    });

                    // Close sidebar when clicking outside on mobile
                    document.addEventListener('click', (e) => {
                        if (window.innerWidth <= 768) {
                            if (!sidebar.contains(e.target) && !hamburgerMenu.contains(e.target)) {
                                sidebar.classList.remove('visible');
                                hamburgerMenu.classList.remove('active');
                                sidebarOverlay.classList.remove('visible');
                            }
                        }
                    });

                    // Close sidebar when clicking on overlay
                    sidebarOverlay.addEventListener('click', () => {
                        sidebar.classList.remove('visible');
                        hamburgerMenu.classList.remove('active');
                        sidebarOverlay.classList.remove('visible');
                    });

                    // Handle window resize
                    window.addEventListener('resize', () => {
                        if (window.innerWidth > 768) {
                            sidebar.classList.remove('visible');
                            hamburgerMenu.classList.remove('active');
                            sidebarOverlay.classList.remove('visible');
                        }
                    });
                });
            </script>
        </body>
        </html>
    `);
});

module.exports = router;
