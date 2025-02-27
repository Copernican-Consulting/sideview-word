const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function executeCommand(command) {
    try {
        console.log(`Executing: ${command}`);
        execSync(command, { stdio: 'inherit' });
    } catch (error) {
        console.error(`Error executing command: ${command}`);
        console.error(error);
        process.exit(1);
    }
}

async function setupDev() {
    try {
        // Check if node_modules exists
        if (!fs.existsSync(path.join(__dirname, '..', 'node_modules'))) {
            console.log('Installing dependencies...');
            executeCommand('npm install');
        }

        // Verify development certificates
        console.log('Verifying development certificates...');
        executeCommand('npm run dev-certs:verify');

        // Build the project in development mode
        console.log('Building project...');
        executeCommand('npm run build:dev');

        // Start the development server
        console.log('Starting development server...');
        console.log('');
        console.log('===========================================');
        console.log('Development environment setup complete!');
        console.log('To start the add-in, run one of:');
        console.log('  npm run start        - Start for default environment');
        console.log('  npm run start:desktop - Start for desktop Word');
        console.log('  npm run start:web    - Start for Word Online');
        console.log('===========================================');
        console.log('');

    } catch (error) {
        console.error('Error during development setup:', error);
        process.exit(1);
    }
}

setupDev();
