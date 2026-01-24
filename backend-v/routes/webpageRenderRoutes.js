// D:\PRJ_YCT_Final\routes\webpageRenderRoutes.js

const express = require('express');
const AdminFunnel = require('../schema/AdminFunnel');
const CoachSubscription = require('../schema/CoachSubscription');
const SubscriptionPlan = require('../schema/SubscriptionPlan');
const asyncHandler = require('../middleware/async');
const mongoose = require('mongoose');

const router = express.Router();

// Helper function to render funnel page
const renderFunnelPage = (funnel, stage, coachId = null) => {
    const basicInfo = stage.basicInfo || {};
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${basicInfo.title || stage.name || 'FunnelsEye Page'}</title>
    ${basicInfo.description ? `<meta name="description" content="${basicInfo.description}">` : ''}
    ${basicInfo.keywords ? `<meta name="keywords" content="${basicInfo.keywords}">` : ''}
    ${basicInfo.favicon ? `<link rel="icon" href="${basicInfo.favicon}">` : ''}
    
    ${basicInfo.socialTitle ? `<meta property="og:title" content="${basicInfo.socialTitle}">` : ''}
    ${basicInfo.socialDescription ? `<meta property="og:description" content="${basicInfo.socialDescription}">` : ''}
    ${basicInfo.socialImage ? `<meta property="og:image" content="${basicInfo.socialImage}">` : ''}
    <meta property="og:type" content="website">
    
    ${basicInfo.customHtmlHead || ''}

    <style>
        /* CSS from the saved stage */
        ${stage.css || ''}
    </style>
</head>
<body>
    ${stage.html || ''}

    ${basicInfo.customHtmlBody || ''}

    <script>
        // Store coachId in localStorage for lead tracking
        ${coachId ? `localStorage.setItem('coachId', '${coachId}');` : ''}
        
        // Funnel Analytics Tracking
        (function() {
            // Get or create session ID
            function getSessionId() {
                let sessionId = localStorage.getItem('funnel_session_id');
                if (!sessionId) {
                    sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
                    localStorage.setItem('funnel_session_id', sessionId);
                }
                return sessionId;
            }

            // Track page view
            function trackPageView() {
                const sessionId = getSessionId();
                const funnelId = '${funnel._id.toString()}';
                const pageId = '${stage.pageId || ''}';
                const eventType = 'PageView';
                const coachId = '${coachId || ''}';
                
                // Get API base URL from current origin
                const apiBaseUrl = window.location.origin;
                
                // Track the event
                fetch(apiBaseUrl + '/api/funnels/track', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        funnelId: funnelId,
                        stageId: null,
                        eventType: eventType,
                        sessionId: sessionId,
                        userId: null,
                        coachId: coachId || null,
                        metadata: {
                            referrer: document.referrer || '',
                            url: window.location.href,
                            userAgent: navigator.userAgent,
                            timestamp: new Date().toISOString(),
                            pageId: pageId,
                            stageName: '${(stage.name || '').replace(/'/g, "\\'")}'
                        }
                    })
                }).catch(error => {
                    console.debug('Funnel tracking error:', error);
                });
            }

            // Track page view when DOM is ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', trackPageView);
            } else {
                trackPageView();
            }
        })();

        // JavaScript from the saved stage
        ${stage.js || ''}
    </script>
</body>
</html>
    `;
};

// @desc    Preview a funnel page (no coachId required)
// @route   GET /preview/funnels/:funnelSlug/:pageSlug
// @access  Public
router.get('/preview/funnels/:funnelSlug/:pageSlug', asyncHandler(async (req, res, next) => {
    const { funnelSlug, pageSlug } = req.params;

    // Find the admin funnel
    const funnel = await AdminFunnel.findOne({ funnelUrl: funnelSlug, isActive: true });

    if (!funnel) {
        return next();
    }

    // Find the specific stage
    const stage = funnel.stages.find(s => s.pageId === pageSlug && s.isEnabled);

    if (!stage) {
        return next();
    }

    // Render page without coachId (preview mode)
    const fullHtmlContent = renderFunnelPage(funnel, stage, null);
    res.set('Content-Type', 'text/html');
    res.send(fullHtmlContent);
}));

// @desc    Render a specific page within a funnel for a coach
// @route   GET /:coachId/funnels/:funnelSlug/:pageSlug
// @access  Public
router.get('/:coachId/funnels/:funnelSlug/:pageSlug', asyncHandler(async (req, res, next) => {
    const { coachId, funnelSlug, pageSlug } = req.params;

    // Validate coachId
    if (!coachId || !mongoose.Types.ObjectId.isValid(coachId)) {
        return res.status(400).send(`
            <!DOCTYPE html>
            <html>
            <head><title>Invalid Coach ID</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h1>Invalid Coach ID</h1>
                <p>A valid coach ID is required in the URL.</p>
                <p>Expected format: /{coachId}/funnels/{funnelSlug}/{pageSlug}</p>
            </body>
            </html>
        `);
    }

    // 1. Find the admin funnel using the funnelSlug
    const funnel = await AdminFunnel.findOne({ funnelUrl: funnelSlug, isActive: true });

    if (!funnel) {
        return next();
    }

    // 2. Check if coach has active subscription
    const subscription = await CoachSubscription.findOne({
        coachId: coachId,
        status: { $in: ['active', 'trial'] }
    }).populate({
        path: 'planId',
        populate: {
            path: 'funnelBundles.funnel',
            model: 'AdminFunnel'
        }
    });

    if (!subscription || !subscription.planId) {
        return res.status(403).send(`
            <!DOCTYPE html>
            <html>
            <head><title>Subscription Required</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h1>Subscription Required</h1>
                <p>This coach does not have an active subscription plan.</p>
            </body>
            </html>
        `);
    }

    // 3. Check if the funnel is assigned to the coach's subscription plan
    const plan = subscription.planId;
    const funnelId = funnel._id.toString();
    
    const hasFunnelAccess = plan.funnelBundles && plan.funnelBundles.length > 0 && plan.funnelBundles.some(bundle => {
        // Handle both populated and unpopulated cases
        const bundleFunnelId = bundle.funnel?._id?.toString() || bundle.funnel?.toString();
        return bundleFunnelId === funnelId;
    });

    if (!hasFunnelAccess) {
        return res.status(403).send(`
            <!DOCTYPE html>
            <html>
            <head><title>Funnel Not Available</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h1>Funnel Not Available</h1>
                <p>This funnel is not assigned to your subscription plan.</p>
                <p>Please contact support or upgrade your plan to access this funnel.</p>
            </body>
            </html>
        `);
    }

    // 4. Find the specific stage (page) within this funnel's stages array
    const stage = funnel.stages.find(s => s.pageId === pageSlug && s.isEnabled);

    if (!stage) {
        return next();
    }

    // 5. Render the funnel page with coachId
    const fullHtmlContent = renderFunnelPage(funnel, stage, coachId);
    res.set('Content-Type', 'text/html');
    res.send(fullHtmlContent);
}));

module.exports = router;