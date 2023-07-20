import * as fs from 'fs';
import * as path from 'path';
import {default as detective} from 'detective-es6';
import * as packageJson from '../package.json';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function checkDependencies(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const requires = detective(fileContent);
    const packageDependencies = Object.keys(packageJson.dependencies || {});

    const missing = requires.filter(dep => {
        // Ignore relative imports.
        if (dep.startsWith('.') || dep.startsWith('/')) {
            return false;
        }

        return !packageDependencies.includes(dep);
    });

    if (missing.length > 0) {
        console.log(`The following dependencies are used in ${filePath} but not listed in package.json: `);
        console.log(missing.join('\n'));
    } else {
        console.log(`All dependencies in ${filePath} are listed in package.json.`);
    }
}

// Replace 'yourScript.js' with the path to your script file.
checkDependencies(path.resolve(__dirname, '../src/generator.ts'));
