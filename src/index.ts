import * as path from 'node:path';
import * as fs from 'node:fs';
import prompts, { type PromptObject } from 'prompts';
import { log } from './utils/logger.js';
import { main } from './generator.js';
import { performance } from 'perf_hooks';

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
const args: string[] = process.argv.slice(3);

function parseArgs(rawArgs: string[]): ScriptArgs {
  const svetchrcExists = fs.existsSync('.svetchrc');
  const parsedArgs = svetchrcExists ? readSvetchrc() : {};

  for (let i = 0; i < rawArgs.length; i += 2) {
    const argName = rawArgs[i]?.replace('--', '');
    const argValue = rawArgs[i + 1];
    if (argName && argValue) {
      parsedArgs[argName] = argValue;
    }
  }

  return { ...defaultArgs, ...parsedArgs };
}

const workingDir = process.env.PWD ?? process.cwd();

export async function initSvetchrc() {
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

  const questions: PromptObject[] = [
    {
      type: 'text',
      name: 'input',
      message: 'Which folder would you like svetch to scan for API routes?',
      initial: defaultArgs.input
    },
    {
      type: 'text',
      name: 'out',
      message:
        'Where would you like svetch to output the generated API files? (The Client/Types/Zod Schemas will be written here)',
      initial: defaultArgs.out
    },
    {
      type: 'text',
      name: 'docs',
      message:
        'Where would you like svetch to output the generated API documentation?',
      initial: defaultArgs.docs
    },
    {
      type: 'text',
      name: 'staticFolder',
      message: 'Where is your static folder located?',
      initial: defaultArgs.staticFolder
    }
  ];

  const response = await prompts(questions);

  fs.writeFileSync(
    '.svetchrc',
    JSON.stringify({ ...defaultArgs, ...response }, null, 2)
  );
  log.success(
    1,
    `Svetch configuration written to ${path.resolve(
      workingDir,
      '.svetchrc'
    )}\n\nenjoy ;)\n\n${separator}`
  );
}

function measureTime(fn: () => void, label: string) {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${label} took ${(end - start).toFixed(2)}ms`);
}

function readSvetchrc() {
  return measureTime(() => {
    try {
      const config = fs.readFileSync('.svetchrc', 'utf8');
      return JSON.parse(config);
    } catch (error) {
      console.error('Error reading .svetchrc file:', error);
      process.exit(1);
    }
  }, 'Reading .svetchrc');
}

export async function runAll() {
  const start = performance.now();

  if (isInit || !fs.existsSync(path.resolve(workingDir, '.svetchrc'))) {
    await measureTime(async () => {
      await initSvetchrc();
    }, 'Initializing Svetchrc');

    measureTime(() => {
      main(parseArgs(args));
    }, 'Running main function');
  } else {
    measureTime(() => {
      main(parseArgs(args));
    }, 'Running main function');
  }

  const end = performance.now();
  console.log(`Total execution time: ${(end - start).toFixed(2)}ms`);
}
