import * as path from 'node:path';
import { exec } from 'node:child_process';
import inquirer from 'inquirer';
import * as fs from 'node:fs';
import { log } from './utils/logger';
import { main } from './generator';
const separator = '--------------------------------------';

interface ScriptArgs {
  framework: string;
  input: string;
  staticFolder: string;
  out: string;
  docs: string;
  tsconfig: string;
  logLevel?: number;
  filter?: string | null;
  telemetry: boolean;
}

function readSvetchrc() {
  try {
    const config = fs.readFileSync('.svetchrc', 'utf8');
    return JSON.parse(config);
  } catch (error) {
    console.error('Error reading .svetchrc file:', error);
    process.exit(1);
  }
}

const defaultArgs: ScriptArgs = {
  framework: 'sveltekit',
  input: 'src/routes/api',
  out: 'src/lib/api',
  docs: 'src/routes/docs',
  staticFolder: 'static',
  tsconfig: 'tsconfig.json',
  logLevel: 5,
  filter: null,
  telemetry: true
};

const isInit = process.argv[2] === 'init';

// Get the command-line arguments
const args: string[] = process.argv.slice(3); // Exclude the first two elements (node binary and script file path)

function parseArgs(rawArgs: string[]): ScriptArgs {
  // Check if .svetchrc file exists
  const svetchrcExists = fs.existsSync('.svetchrc');
  // Use .svetchrc file if it exists
  const parsedArgs = svetchrcExists ? readSvetchrc() : {};

  // Parse command-line arguments
  for (let i = 0; i < rawArgs.length; i += 2) {
    const argName = rawArgs[i]?.replace('--', '');
    const argValue = rawArgs[i + 1];
    if (argName && argValue) {
      parsedArgs[argName] = argValue;
    }
  }

  // Merge parsed arguments with default values
  return { ...defaultArgs, ...parsedArgs };
}

const workingDir = process.env.PWD ?? process.cwd();

export async function initSvetchrc() {
  // Check if the configuration file already exists

  console.log(`
  _____               _          _     
 / ____|             | |        | |    
| (___  __   __  ___ | |_   ___ | |__  
 \\___ \\ \\ \\ / / / _ \\| __| / __|| '_ \\ 
 ____) | \\ V / |  __/| |_ | (__ | | | |
|_____/   \\_/   \\___| \\__| \\___||_| |_|
                                       
Send any feedback or issues here 👉 https://github.com/Bewinxed/svetch/
`);

  console.log(
    `${separator}\nTypesafety, without the typing ;)\n${separator}\n`
  );

  if (fs.existsSync('.svetchrc')) {
    fs.renameSync('.svetchrc', '.svetchrc.backup');
    console.log('Existing .svetchrc file has been renamed to .svetchrc.backup');
  }

  // Ask for configuration options
  const responses: ScriptArgs = await inquirer.prompt([
    // {
    //   name: 'framework',
    //   message: 'What is your framework?',
    //   default: defaultArgs.framework,
    // },
    {
      name: 'input',
      message: `Which folder would you like svetch to scan for API routes? - default: ${defaultArgs.input}`,
      default: defaultArgs.input
    },
    {
      name: 'out',
      message: `${separator}\nWhere would you like svetch to output the generated API files? (The Client/Types/Zod Schemas will be written here) - default: ${defaultArgs.out}`,
      default: defaultArgs.out
    },
    {
      name: 'docs',
      message: `${separator}\nWhere would you like svetch to output the generated API documentation? - default: ${defaultArgs.docs}`,
      default: defaultArgs.docs
    },
    {
      name: 'staticFolder',
      message: `${separator}\nWhere is your static folder located?\n - default: ${defaultArgs.staticFolder}`,
      default: defaultArgs.staticFolder
    }
  ]);

  fs.writeFileSync(
    '.svetchrc',
    JSON.stringify({ ...defaultArgs, ...responses }, null, 2)
  );
  log.success(
    1,
    `Svetch configuration written to ${path.resolve(
      workingDir,
      '.svetchrc'
    )}\n\nenjoy ;)\n\n${separator}`
  );
}

// const packageJson = require(path.resolve(__dirname, '../package.json'));

// function checkVersion() {
//   const packageName = packageJson.name;
//   const currentVersion = packageJson.version;
//   exec(`npm show ${packageName} version`, (err, stdout, stderr) => {
//     if (err) {
//       console.error(`exec error: ${err}`);
//       return;
//     }

//     const latestVersion = stdout.trim();

//     // telemetryPayload.data.script_version = currentVersion;

//     console.log(`Current version: ${currentVersion}`);
//     console.log(`Latest version: ${latestVersion}`);

//     if (currentVersion !== latestVersion) {
//       console.log(`A newer version of ${packageName} is available.`);
//     } else {
//       console.log(`You are using the latest version of ${packageName}.`);
//     }
//   });
// }

export function runAll() {
  if (isInit || !fs.existsSync(path.resolve(workingDir, '.svetchrc'))) {
    initSvetchrc().then(() => {
      // checkVersion();
      main(parseArgs(args));
    });
  } else {
    // checkVersion();
    main(parseArgs(args));
  }
}
