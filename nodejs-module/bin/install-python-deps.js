#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('Installing Python dependencies for ragas-js...');

const pythonDeps = [
    'ragas',
    'openai',  // Common LLM provider
    'langchain',
    'langchain-openai'
];

function installPythonPackage(packageName) {
    return new Promise((resolve, reject) => {
        console.log(`Installing ${packageName}...`);

        const pip = spawn('pip', ['install', packageName], {
            stdio: 'inherit'
        });

        pip.on('close', (code) => {
            if (code === 0) {
                console.log(`✓ ${packageName} installed successfully`);
                resolve();
            } else {
                reject(new Error(`Failed to install ${packageName}`));
            }
        });

        pip.on('error', (error) => {
            reject(new Error(`Failed to spawn pip: ${error.message}`));
        });
    });
}

async function installAllDependencies() {
    try {
        // Check if Python is available
        await new Promise((resolve, reject) => {
            const python = spawn('python3', ['--version']);
            python.on('close', (code) => {
                if (code === 0) {
                    console.log('✓ Python 3 is available');
                    resolve();
                } else {
                    reject(new Error('Python 3 is not available'));
                }
            });
            python.on('error', () => {
                reject(new Error('Python 3 is not available'));
            });
        });

        // Install each dependency
        for (const dep of pythonDeps) {
            await installPythonPackage(dep);
        }

        console.log('✓ All Python dependencies installed successfully');
        console.log('✓ ragas-js is ready to use!');

    } catch (error) {
        console.error('✗ Installation failed:', error.message);
        console.error('\nPlease ensure you have:');
        console.error('- Python 3.9+ installed');
        console.error('- pip package manager available');
        console.error('- Write permissions for Python packages');
        process.exit(1);
    }
}

// Only run if called directly (not required)
if (require.main === module) {
    installAllDependencies();
}

module.exports = installAllDependencies;
