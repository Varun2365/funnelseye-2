const express = require('express');
const router = express.Router();
const customDomainController = require('../controllers/customDomainController');
const { protect, authorizeCoach } = require('../middleware/auth');
const { updateLastActive } = require('../middleware/activityMiddleware');

// Apply authentication and activity tracking to all routes
router.use(protect, updateLastActive);

// Custom domain management routes (private)
router.post('/', authorizeCoach(), customDomainController.addCustomDomain);
router.get('/', authorizeCoach(), customDomainController.getCustomDomains);
router.get('/:id', authorizeCoach(), customDomainController.getCustomDomain);
router.put('/:id', authorizeCoach(), customDomainController.updateCustomDomain);
router.delete('/:id', authorizeCoach(), customDomainController.deleteCustomDomain);

// DNS and SSL management
router.post('/:id/verify-dns', authorizeCoach(), customDomainController.verifyDnsRecords);
router.post('/:id/generate-ssl', authorizeCoach(), customDomainController.generateSSLCertificate);
router.get('/:id/dns-instructions', authorizeCoach(), customDomainController.getDnsInstructions);

// Public route for domain resolution (no authentication required)
router.get('/resolve/:hostname', customDomainController.resolveDomain);

module.exports = router;
