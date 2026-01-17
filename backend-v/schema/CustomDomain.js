const mongoose = require('mongoose');
const dns = require('dns').promises;

const customDomainSchema = new mongoose.Schema({
    // Coach who owns this domain
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Domain information
    domain: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        match: [/^[a-z0-9\-\.]+$/, 'Domain can only contain lowercase letters, numbers, hyphens, and dots']
    },
    
    // Domain status
    status: {
        type: String,
        enum: ['pending', 'verified', 'active', 'error', 'expired'],
        default: 'pending'
    },
    
    // DNS verification
    dnsVerification: {
        isVerified: {
            type: Boolean,
            default: false
        },
        verificationMethod: {
            type: String,
            enum: ['cname', 'a_record', 'txt'],
            default: 'cname'
        },
        requiredRecords: [{
            type: {
                type: String,
                enum: ['CNAME', 'A', 'TXT'],
                required: true
            },
            name: {
                type: String,
                required: true
            },
            value: {
                type: String,
                required: true
            },
            isVerified: {
                type: Boolean,
                default: false
            }
        }],
        lastChecked: {
            type: Date,
            default: Date.now
        }
    },
    
    // SSL certificate
    sslCertificate: {
        isActive: {
            type: Boolean,
            default: false
        },
        provider: {
            type: String,
            enum: ['letsencrypt', 'manual', 'cloudflare'],
            default: 'letsencrypt'
        },
        expiresAt: {
            type: Date
        },
        lastRenewed: {
            type: Date
        }
    },
    
    // Domain settings
    settings: {
        redirectToHttps: {
            type: Boolean,
            default: true
        },
        enableHsts: {
            type: Boolean,
            default: true
        },
        customHeaders: [{
            name: {
                type: String,
                trim: true
            },
            value: {
                type: String,
                trim: true
            }
        }]
    },
    
    // Analytics
    analytics: {
        totalVisits: {
            type: Number,
            default: 0
        },
        lastVisited: {
            type: Date
        }
    },
    
    // Metadata
    metadata: {
        registrar: {
            type: String,
            trim: true
        },
        nameservers: [{
            type: String,
            trim: true
        }],
        notes: {
            type: String,
            trim: true,
            maxlength: 500
        }
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    },
    
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
customDomainSchema.index({ coachId: 1, status: 1 });
customDomainSchema.index({ 'dnsVerification.isVerified': 1 });
customDomainSchema.index({ 'sslCertificate.isActive': 1 });

// Pre-save middleware
customDomainSchema.pre('save', function(next) {
    this.lastUpdated = new Date();
    
    // Generate required DNS records if not set
    if (this.isNew && this.dnsVerification.requiredRecords.length === 0) {
        // A simple check to determine if it's a root domain
        const isRootDomain = !this.domain.includes('.');
        
        if (isRootDomain) {
            // This is a simple case, and you might need a more robust check for TLDs
        } else {
            // Split the domain to check if it's a root domain vs a subdomain.
            const domainParts = this.domain.split('.');
            const hasSubdomain = domainParts.length > 2;
            
            if (!hasSubdomain) {
                // Root domain (e.g., yctinfo.com)
                this.dnsVerification.requiredRecords.push({
                    type: 'A',
                    name: this.domain,
                    value: '69.62.77.6', // Your VPS IP address
                    isVerified: false
                });
                this.dnsVerification.requiredRecords.push({
                    type: 'CNAME',
                    name: `www.${this.domain}`,
                    value: 'api.funnelseye.com', // Your VPS hostname
                    isVerified: false
                });
            } else {
                // Subdomain (e.g., funnels.yctinfo.com)
                this.dnsVerification.requiredRecords.push({
                    type: 'CNAME',
                    name: this.domain,
                    value: 'api.funnelseye.com', // Your VPS hostname
                    isVerified: false
                });
            }
        }
    }
    
    next();
});

// Method to check DNS verification
customDomainSchema.methods.checkDnsVerification = async function() {
    try {
        for (let record of this.dnsVerification.requiredRecords) {
            if (record.type === 'CNAME') {
                const cnameRecords = await dns.resolveCname(record.name);
                record.isVerified = cnameRecords.includes(record.value);
            } else if (record.type === 'A') {
                // Check for A records and compare the resolved IP address
                const aRecords = await dns.resolve4(record.name);
                record.isVerified = aRecords.includes(record.value);
            } else {
                // Handle other record types if needed, or default to false
                record.isVerified = false;
            }
        }
        
        this.dnsVerification.isVerified = this.dnsVerification.requiredRecords.every(r => r.isVerified);
        this.dnsVerification.lastChecked = new Date();
        
        if (this.dnsVerification.isVerified && this.status === 'pending') {
            this.status = 'verified';
        }
        
        await this.save();
        return this.dnsVerification.isVerified;
    } catch (error) {
        console.error('DNS verification failed:', error);
        return false;
    }
};

// Method to generate SSL certificate
customDomainSchema.methods.generateSSLCertificate = async function() {
    try {
        this.sslCertificate.isActive = true;
        this.sslCertificate.lastRenewed = new Date();
        this.sslCertificate.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
        
        if (this.status === 'verified') {
            this.status = 'active';
        }
        
        await this.save();
        return true;
    } catch (error) {
        console.error('SSL certificate generation failed:', error);
        return false;
    }
};

// Static method to find domain by hostname
customDomainSchema.statics.findByHostname = function(hostname) {
    return this.findOne({
        domain: hostname,
        status: 'active',
        'dnsVerification.isVerified': true
    });
};

module.exports = mongoose.model('CustomDomain', customDomainSchema);
