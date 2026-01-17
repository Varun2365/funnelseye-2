const acme = require('acme-client');
const fs = require('fs');
const path = require('path');

const CERTS_DIR = path.join(__dirname, '../certs');
if (!fs.existsSync(CERTS_DIR)) fs.mkdirSync(CERTS_DIR);

// In-memory challenge store for HTTP-01
const challengeStore = {};

// Expose for Express route
function getChallenge(token) {
    return challengeStore[token];
}

async function requestCertificate(domain, email) {
    // 1. Create account keypair
    const accountKey = await acme.openssl.createPrivateKey();

    // 2. Create client
    const client = new acme.Client({
        directoryUrl: acme.directory.letsencrypt.production,
        accountKey
    });

    // 3. Create domain keypair
    const domainKey = await acme.openssl.createPrivateKey();

    // 4. Create CSR
    const [csr, csrPem] = await acme.openssl.createCsr({
        commonName: domain
    });

    // 5. Order certificate
    const cert = await client.auto({
        csr,
        email,
        termsOfServiceAgreed: true,
        challengeCreateFn: async (authz, challenge, keyAuthorization) => {
            // Store keyAuthorization for HTTP-01 challenge
            challengeStore[challenge.token] = keyAuthorization;
        },
        challengeRemoveFn: async (authz, challenge, keyAuthorization) => {
            // Remove challenge after validation
            delete challengeStore[challenge.token];
        }
    });

    // 6. Save cert and key
    fs.writeFileSync(path.join(CERTS_DIR, `${domain}.key`), domainKey);
    fs.writeFileSync(path.join(CERTS_DIR, `${domain}.crt`), cert);

    return {
        key: domainKey,
        cert
    };
}

async function renewCertificate(domain, email) {
    // For Let's Encrypt, renewal is just re-requesting a cert
    return requestCertificate(domain, email);
}

module.exports = {
    requestCertificate,
    renewCertificate,
    getChallenge,
    CERTS_DIR
};
// To use: require this service, call requestCertificate(domain, email) after DNS is verified.
// Add an Express route: app.get('/.well-known/acme-challenge/:token', (req, res) => { ... })
// For SNI: use tls.createSecureContext for each domain with the stored cert/key.
