const devCerts = require("office-addin-dev-certs");

async function generateDevCerts() {
    try {
        await devCerts.getHttpsServerOptions();
        console.log('Development certificates generated successfully.');
    } catch (err) {
        console.error('Error generating development certificates:', err);
        process.exit(1);
    }
}

generateDevCerts();
