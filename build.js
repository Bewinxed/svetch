const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

// Run SWC
console.log('Running SWC...');
execSync('swc src -d dist', { stdio: 'inherit' });

// Copy assets
console.log('Copying assets...');
const srcDir = path.join(__dirname, 'src/assets');
const destDir = path.join(__dirname, 'dist/assets');

if (fs.existsSync(srcDir)) {
  fs.copySync(srcDir, destDir, { overwrite: true });
  console.log('Assets copied successfully.');
} else {
  console.warn('Source assets directory not found.');
}

console.log('Build completed.');