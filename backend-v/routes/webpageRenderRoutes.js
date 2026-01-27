// D:\PRJ_YCT_Final\routes\webpageRenderRoutes.js

const express = require('express');
const AdminFunnel = require('../schema/AdminFunnel');
const CoachSubscription = require('../schema/CoachSubscription');
const SubscriptionPlan = require('../schema/SubscriptionPlan');
const CoachMarketingCredentials = require('../schema/CoachMarketingCredentials');
const asyncHandler = require('../middleware/async');
const mongoose = require('mongoose');

const router = express.Router();

// Helper function to generate Meta Pixel code
const generateMetaPixelCode = (pixelId, coachId, funnelId, pageId, stageName = '', stage = null) => {
    if (!pixelId) return '';
    const safeStageName = (stageName || '').replace(/'/g, "\\'");
    const stageOrder = stage?.order || 0;
    
    return `
    <!-- Meta Pixel Code -->
    <script>
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
        fbq('track', 'PageView');
    </script>
    <noscript><img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"
    /></noscript>
    <!-- End Meta Pixel Code -->
    
    <!-- Meta Pixel Server-Side Tracking with Stage Info -->
    <script>
        // Track page view to our server (for Conversions API)
        (function() {
            const pixelData = {
                pixelId: '${pixelId}',
                coachId: '${coachId || ''}',
                funnelId: '${funnelId || ''}',
                pageId: '${pageId || ''}',
                eventName: 'PageView',
                eventTime: Math.floor(Date.now() / 1000),
                actionSource: 'website',
                userData: {
                    client_ip_address: '',
                    client_user_agent: navigator.userAgent
                },
                customData: {
                    content_name: '${safeStageName}',
                    content_category: 'funnel_page',
                    funnel_stage: '${pageId || ''}',
                    funnel_stage_name: '${safeStageName}',
                    funnel_stage_order: ${stageOrder}
                }
            };
            
            // Track FunnelStageViewed custom event (REQUIRED for stage-wise retargeting)
            // CRITICAL: Fires ONCE per stage per session (Meta best practice)
            // This is the ONLY custom event we use for segmentation
            const stageViewKey = 'funnel_stage_viewed_${pageId || ''}';
            const hasViewed = sessionStorage.getItem(stageViewKey);
            
            if (!hasViewed && typeof fbq !== 'undefined') {
                sessionStorage.setItem(stageViewKey, 'true');
                
                // Client-side Meta Pixel tracking
                fbq('trackCustom', 'FunnelStageViewed', {
                    funnel_id: '${funnelId || ''}',
                    stage_id: '${pageId || ''}',
                    stage_order: ${stageOrder}
                });
                
                // Server-side tracking (for Conversions API)
                fetch(window.location.origin + '/api/pixel/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...pixelData,
                        eventName: 'FunnelStageViewed',
                        customData: {
                            ...pixelData.customData,
                            funnel_id: '${funnelId || ''}',
                            stage_id: '${pageId || ''}',
                            stage_order: ${stageOrder}
                        }
                    })
                }).catch(err => console.debug('Pixel tracking error:', err));
            }
            
            // Send PageView to our backend for server-side tracking
            fetch(window.location.origin + '/api/pixel/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pixelData)
            }).catch(err => console.debug('Pixel tracking error:', err));
        })();
    </script>
    `;
};

/**
 * Resolve coach's pixel settings at runtime
 * CRITICAL: Pixel resolution happens at runtime based on coachId from URL
 * AdminFunnel is pixel-agnostic - no static pixelId stored there
 */
async function resolveCoachPixelSettings(coachId) {
    if (!coachId || !mongoose.Types.ObjectId.isValid(coachId)) {
        return { pixelId: null, enabled: false, exitIntentEnabled: false };
    }
    
    try {
        const credentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('metaAds.pixelId metaAds.pixelEnabled metaAds.isConnected metaAds.exitIntentTrackingEnabled');
        
        if (!credentials || !credentials.metaAds?.isConnected) {
            return { pixelId: null, enabled: false, exitIntentEnabled: false };
        }
        
        const pixelId = credentials.metaAds?.pixelId;
        const enabled = credentials.metaAds?.pixelEnabled && !!pixelId;
        const exitIntentEnabled = credentials.metaAds?.exitIntentTrackingEnabled || false;
        
        return { pixelId, enabled, exitIntentEnabled };
    } catch (error) {
        console.error(`[resolveCoachPixelSettings] Error resolving pixel for coach ${coachId}:`, error);
        return { pixelId: null, enabled: false, exitIntentEnabled: false };
    }
}

// Helper function to render funnel page
const renderFunnelPage = async (funnel, stage, coachId = null, coachPixelSettings = null) => {
    const basicInfo = stage.basicInfo || {};
    
    // Resolve pixel settings at runtime from coach's Meta account
    // NEVER read from AdminFunnel - it's pixel-agnostic
    const pixelSettings = coachPixelSettings || await resolveCoachPixelSettings(coachId);
    const pixelId = pixelSettings.pixelId;
    const pixelEnabled = pixelSettings.enabled && !!pixelId;
    const exitIntentEnabled = pixelSettings.exitIntentEnabled || false;
    
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
    
    ${pixelEnabled ? generateMetaPixelCode(pixelId, coachId, funnel._id.toString(), stage.pageId, stage.name, stage) : ''}
    
    ${basicInfo.customHtmlHead || ''}

    <style>
        /* CSS from the saved stage */
        ${stage.css || ''}
    </style>
</head>
<body>
    ${stage.html || ''}

    ${basicInfo.customHtmlBody || ''}
    
    ${pixelEnabled ? `
    <script>
        // Meta Pixel Best Practices: Standard Events + Minimal Custom Events
        (function() {
            const funnelData = {
                funnelId: '${funnel._id.toString()}',
                stageId: '${stage.pageId || ''}',
                stageOrder: ${stage.order || 0},
                coachId: '${coachId || ''}',
                pixelId: '${pixelId}',
                exitIntentEnabled: ${exitIntentEnabled}
            };
            
            // Track Lead event when form is submitted (STANDARD Meta event)
            // Also track CompleteRegistration for non-paid conversions (webinar/call signups)
            document.addEventListener('submit', function(e) {
                const form = e.target;
                if (form.tagName === 'FORM') {
                    const formType = form.getAttribute('data-form-type') || 'lead'; // 'lead', 'webinar', 'call', 'course'
                    const isNonPaidConversion = ['webinar', 'call', 'course'].includes(formType);
                    
                    // Standard Lead event (Meta-optimized) - for all form submissions
                    if (typeof fbq !== 'undefined') {
                        fbq('track', 'Lead', {
                            content_name: '${(stage.name || '').replace(/'/g, "\\'")}',
                            content_category: 'form_submission',
                            funnel_stage: funnelData.stageId,
                            funnel_stage_order: funnelData.stageOrder
                        });
                        
                        // Track CompleteRegistration for non-paid conversions (webinar/call/course)
                        if (isNonPaidConversion) {
                            fbq('track', 'CompleteRegistration', {
                                content_name: '${(stage.name || '').replace(/'/g, "\\'")}',
                                content_category: formType,
                                funnel_stage: funnelData.stageId,
                                funnel_stage_order: funnelData.stageOrder
                            });
                        }
                    }
                    
                    // Server-side tracking
                    fetch(window.location.origin + '/api/pixel/track', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            pixelId: funnelData.pixelId,
                            coachId: funnelData.coachId,
                            funnelId: funnelData.funnelId,
                            pageId: funnelData.stageId,
                            eventName: 'Lead',
                            eventTime: Math.floor(Date.now() / 1000),
                            actionSource: 'website',
                            customData: {
                                content_name: '${(stage.name || '').replace(/'/g, "\\'")}',
                                content_category: 'form_submission',
                                funnel_stage: funnelData.stageId,
                                funnel_stage_order: funnelData.stageOrder,
                                form_type: formType
                            }
                        })
                    }).catch(err => console.debug('Pixel tracking error:', err));
                    
                    // Also track CompleteRegistration server-side if non-paid conversion
                    if (isNonPaidConversion) {
                        fetch(window.location.origin + '/api/pixel/track', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                pixelId: funnelData.pixelId,
                                coachId: funnelData.coachId,
                                funnelId: funnelData.funnelId,
                                pageId: funnelData.stageId,
                                eventName: 'CompleteRegistration',
                                eventTime: Math.floor(Date.now() / 1000),
                                actionSource: 'website',
                                customData: {
                                    content_name: '${(stage.name || '').replace(/'/g, "\\'")}',
                                    content_category: formType,
                                    funnel_stage: funnelData.stageId,
                                    funnel_stage_order: funnelData.stageOrder
                                }
                            })
                        }).catch(err => console.debug('Pixel tracking error:', err));
                    }
                }
            });
            
            // Track ViewContent for product/service pages (STANDARD Meta event)
            if (document.querySelector('[data-pixel-event="ViewContent"]')) {
                if (typeof fbq !== 'undefined') {
                    fbq('track', 'ViewContent', {
                        content_name: '${(stage.name || '').replace(/'/g, "\\'")}',
                        content_category: 'funnel_page',
                        funnel_stage: funnelData.stageId
                    });
                }
            }
            
            // Track exit intent (OPTIONAL custom event - only if enabled)
            if (funnelData.exitIntentEnabled) {
                let exitIntentTracked = false;
                document.addEventListener('mouseleave', function(e) {
                    if (e.clientY <= 0 && !exitIntentTracked) {
                        exitIntentTracked = true;
                        if (typeof fbq !== 'undefined') {
                            fbq('trackCustom', 'ExitIntent', {
                                funnel_id: funnelData.funnelId,
                                stage_id: funnelData.stageId,
                                stage_order: funnelData.stageOrder
                            });
                        }
                    }
                }, { once: true });
            }
            
            // Internal analytics only (NOT sent to Meta Pixel)
            // Tracked for dashboard analytics but don't clutter Meta events
            const internalAnalytics = {
                timeSpent: 0,
                maxScroll: 0,
                buttonClicks: []
            };
            
            const startTime = Date.now();
            
            // Track time spent (internal only - sent to /api/funnels/track)
            setTimeout(function() {
                internalAnalytics.timeSpent = Math.floor((Date.now() - startTime) / 1000);
                fetch(window.location.origin + '/api/funnels/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        funnelId: funnelData.funnelId,
                        stageId: funnelData.stageId,
                        eventType: 'PageEngaged',
                        sessionId: localStorage.getItem('funnel_session_id') || 'unknown',
                        metadata: {
                            time_spent: internalAnalytics.timeSpent,
                            stage_name: '${(stage.name || '').replace(/'/g, "\\'")}'
                        }
                    })
                }).catch(() => {});
            }, 10000);
            
            // Track scroll depth (internal only)
            window.addEventListener('scroll', function() {
                const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
                if (scrollPercent > internalAnalytics.maxScroll) {
                    internalAnalytics.maxScroll = scrollPercent;
                }
            });
            
            // Track button clicks (internal only)
            document.addEventListener('click', function(e) {
                const button = e.target.closest('button, a[data-pixel-track]');
                if (button) {
                    internalAnalytics.buttonClicks.push({
                        text: button.textContent.trim() || button.getAttribute('aria-label') || 'Unknown',
                        timestamp: Date.now()
                    });
                }
            });
        })();
    </script>
    ` : ''}

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

    // Render page without coachId (preview mode) - NO PIXEL INJECTION
    const fullHtmlContent = await renderFunnelPage(funnel, stage, null, { pixelId: null, enabled: false });
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

    // 5. Resolve coach's pixel settings at runtime
    const coachPixelSettings = await resolveCoachPixelSettings(coachId);
    
    // 6. Render the funnel page with coachId and resolved pixel settings
    const fullHtmlContent = await renderFunnelPage(funnel, stage, coachId, coachPixelSettings);
    res.set('Content-Type', 'text/html');
    res.send(fullHtmlContent);
}));

module.exports = router;