const CustomDomain = require('../schema/CustomDomain');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sslService = require('../services/sslService');

// @desc    Add custom domain
// @route   POST /api/custom-domains
// @access  Private
const addCustomDomain = asyncHandler(async (req, res, next) => {
    const { domain } = req.body;
    
    if (!domain) {
        return next(new ErrorResponse('Domain is required', 400));
    }
    
    // Check if domain already exists
    const existingDomain = await CustomDomain.findOne({ domain });
    if (existingDomain) {
        return next(new ErrorResponse('Domain is already registered', 400));
    }
    
    const customDomain = await CustomDomain.create({
        coachId: req.coachId,
        domain: domain.toLowerCase()
    });
    
    res.status(201).json({
        success: true,
        message: 'Custom domain added successfully. Please configure DNS records.',
        data: customDomain
    });
});

// @desc    Get all custom domains for coach
// @route   GET /api/custom-domains
// @access  Private
const getCustomDomains = asyncHandler(async (req, res, next) => {
    const customDomains = await CustomDomain.find({ coachId: req.coachId });
    
    res.status(200).json({
        success: true,
        count: customDomains.length,
        data: customDomains
    });
});

// @desc    Get single custom domain
// @route   GET /api/custom-domains/:id
// @access  Private
const getCustomDomain = asyncHandler(async (req, res, next) => {
    const customDomain = await CustomDomain.findById(req.params.id);
    
    if (!customDomain) {
        return next(new ErrorResponse('Custom domain not found', 404));
    }
    
    if (customDomain.coachId.toString() !== req.coachId.toString()) {
        return next(new ErrorResponse('Not authorized to access this domain', 403));
    }
    
    res.status(200).json({
        success: true,
        data: customDomain
    });
});

// @desc    Update custom domain
// @route   PUT /api/custom-domains/:id
// @access  Private
const updateCustomDomain = asyncHandler(async (req, res, next) => {
    let customDomain = await CustomDomain.findById(req.params.id);
    
    if (!customDomain) {
        return next(new ErrorResponse('Custom domain not found', 404));
    }
    
    if (customDomain.coachId.toString() !== req.coachId.toString()) {
        return next(new ErrorResponse('Not authorized to update this domain', 403));
    }
    
    customDomain = await CustomDomain.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    
    res.status(200).json({
        success: true,
        message: 'Custom domain updated successfully',
        data: customDomain
    });
});

// @desc    Delete custom domain
// @route   DELETE /api/custom-domains/:id
// @access  Private
const deleteCustomDomain = asyncHandler(async (req, res, next) => {
    const customDomain = await CustomDomain.findById(req.params.id);
    
    if (!customDomain) {
        return next(new ErrorResponse('Custom domain not found', 404));
    }
    
    if (customDomain.coachId.toString() !== req.coachId.toString()) {
        return next(new ErrorResponse('Not authorized to delete this domain', 403));
    }
    
    await customDomain.deleteOne();
    
    res.status(200).json({
        success: true,
        message: 'Custom domain deleted successfully'
    });
});

// @desc    Verify DNS records
// @route   POST /api/custom-domains/:id/verify-dns
// @access  Private
const verifyDnsRecords = asyncHandler(async (req, res, next) => {
    const customDomain = await CustomDomain.findById(req.params.id);
    
    if (!customDomain) {
        return next(new ErrorResponse('Custom domain not found', 404));
    }
    
    if (customDomain.coachId.toString() !== req.coachId.toString()) {
        return next(new ErrorResponse('Not authorized to verify this domain', 403));
    }
    
    const isVerified = await customDomain.checkDnsVerification();
    
    res.status(200).json({
        success: true,
        message: isVerified ? 'DNS verification successful' : 'DNS verification failed',
        data: {
            isVerified,
            dnsRecords: customDomain.dnsVerification.requiredRecords,
            lastChecked: customDomain.dnsVerification.lastChecked
        }
    });
});

// @desc    Generate SSL certificate
// @route   POST /api/custom-domains/:id/generate-ssl
// @access  Private
const generateSSLCertificate = asyncHandler(async (req, res, next) => {
    const customDomain = await CustomDomain.findById(req.params.id);
    if (!customDomain) {
        return next(new ErrorResponse('Custom domain not found', 404));
    }
    if (customDomain.coachId.toString() !== req.coachId.toString()) {
        return next(new ErrorResponse('Not authorized to generate SSL for this domain', 403));
    }
    if (!customDomain.dnsVerification.isVerified) {
        return next(new ErrorResponse('DNS verification must be completed before generating SSL', 400));
    }
    // Use coach's email if available, else fallback
    const email = (req.user && req.user.email) || req.body.email || 'admin@funnelseye.com';
    try {
        const { key, cert } = await sslService.requestCertificate(customDomain.domain, email);
        // Update CustomDomain with SSL info
        customDomain.sslCertificate.isActive = true;
        customDomain.sslCertificate.lastRenewed = new Date();
        customDomain.sslCertificate.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
        await customDomain.save();
        res.status(200).json({
            success: true,
            message: 'SSL certificate generated successfully',
            data: {
                sslActive: true,
                expiresAt: customDomain.sslCertificate.expiresAt,
                lastRenewed: customDomain.sslCertificate.lastRenewed
            }
        });
    } catch (error) {
        console.error('SSL generation error:', error);
        return next(new ErrorResponse('SSL certificate generation failed: ' + error.message, 500));
    }
});

// @desc    Get DNS setup instructions
// @route   GET /api/custom-domains/:id/dns-instructions
// @access  Private
const getDnsInstructions = asyncHandler(async (req, res, next) => {
    const customDomain = await CustomDomain.findById(req.params.id);
    
    if (!customDomain) {
        return next(new ErrorResponse('Custom domain not found', 404));
    }
    
    if (customDomain.coachId.toString() !== req.coachId.toString()) {
        return next(new ErrorResponse('Not authorized to access this domain', 403));
    }
    
    const instructions = {
        domain: customDomain.domain,
        requiredRecords: customDomain.dnsVerification.requiredRecords,
        instructions: [
            '1. Log in to your domain registrar or DNS provider',
            '2. Navigate to DNS management',
            '3. Add the following DNS records:',
            ...customDomain.dnsVerification.requiredRecords.map(record => 
                `   - Type: ${record.type}, Name: ${record.name}, Value: ${record.value}`
            ),
            '4. Wait for DNS propagation (can take up to 48 hours)',
            '5. Use the verify DNS endpoint to check status'
        ]
    };
    
    res.status(200).json({
        success: true,
        data: instructions
    });
});

// @desc    Get domain by hostname (for routing)
// @route   GET /api/custom-domains/resolve/:hostname
// @access  Public
const resolveDomain = asyncHandler(async (req, res, next) => {
    const { hostname } = req.params;
    
    const customDomain = await CustomDomain.findByHostname(hostname);
    
    if (!customDomain) {
        return next(new ErrorResponse('Domain not found or not active', 404));
    }
    
    res.status(200).json({
        success: true,
        data: {
            domain: customDomain.domain,
            coachId: customDomain.coachId,
            status: customDomain.status,
            sslActive: customDomain.sslCertificate.isActive
        }
    });
});

module.exports = {
    addCustomDomain,
    getCustomDomains,
    getCustomDomain,
    updateCustomDomain,
    deleteCustomDomain,
    verifyDnsRecords,
    generateSSLCertificate,
    getDnsInstructions,
    resolveDomain
};
