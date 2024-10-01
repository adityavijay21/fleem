#!/usr/bin/env node

import process from 'node:process';
import path from 'node:path';
import { program } from 'commander';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import chalk from 'chalk';
import { execSync } from 'node:child_process';
import ora from 'ora';

const log = {
  info: m => console.log(chalk.blue(m)),
  success: m => console.log(chalk.green(m)),
  warning: m => console.log(chalk.yellow(m)),
  error: m => console.log(chalk.red(m)),
};

const executeCommand = (cmd, errMsg) => {
  try {
    execSync(cmd, { stdio: 'pipe' });
  } catch (err) {
    throw new Error(`${errMsg}: ${err.message}`);
  }
};

const installDependencies = async (spinner, pm, deps) => {
  if (deps.length) {
    spinner.text = 'Installing dependencies...';
    await executeCommand(`${pm} ${pm === 'npm' ? 'install' : 'add'} ${deps.join(' ')}`, 'Failed to install dependencies');
  }
};

const simulateProjectCreation = async (spinner) => {
  const steps = [
    'Creating package.json',
    'Setting up project structure',
    'Adding configuration files',
    'Installing dependencies',
    'Finalizing setup'
  ];

  for (let i = 0; i < steps.length; i++) {
    spinner.text = `${steps[i]}... ${(i + 1) * 20}%`;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
};

const DEFAULT_OPTIONS = {
  typescript: false,
  testing: 'None',
  prettier: false,
  cssPreprocessor: 'CSS',
  routing: false,
  stateManagement: 'None',
  initGit: true,
  packageManager: 'npm'
};

const setupTailwind = async (spinner, pm) => {
  spinner.text = 'Setting up Tailwind CSS...';
  await executeCommand(`${pm} ${pm === 'npm' ? 'install --save-dev' : 'add -D'} tailwindcss@latest postcss@latest autoprefixer@latest`, 'Failed to install Tailwind CSS');
  await executeCommand('npx tailwindcss init -p', 'Failed to initialize Tailwind CSS');
  
  fs.writeFileSync('tailwind.config.js', `module.exports = {content: ["./src/**/*.{js,jsx,ts,tsx}"],theme: { extend: {} },plugins: [],}`);
  fs.writeFileSync('src/index.css', '@tailwind base;@tailwind components;@tailwind utilities;');

  spinner.succeed('Tailwind CSS set up successfully.');
};

const upgradeFleem = async () => {
  const spinner = ora('Upgrading Fleem...').start();
  try {
    await executeCommand('npm install -g fleem@latest', 'Failed to upgrade Fleem');
    spinner.succeed('Fleem has been successfully upgraded to the latest version.');
  } catch (error) {
    spinner.fail('Failed to upgrade Fleem.');
    log.error(error.message);
  }
};

const createProject = async (projectName, options) => {
  console.log(chalk.cyan('\n🛠️  Welcome to Fleem Project Generator! Let\'s set up your project.\n'));

  const promptQuestions = [
    {
      type: 'confirm',
      name: 'typescript',
      message: 'Use TypeScript?',
      default: options.typescript || DEFAULT_OPTIONS.typescript
    },
    {
      type: 'list',
      name: 'testing',
      message: 'Testing framework?',
      choices: ['Jest (Recommended)', 'Mocha', 'Chai', 'None'],
      default: options.jest ? 'Jest' : DEFAULT_OPTIONS.testing
    },
    {
      type: 'confirm',
      name: 'prettier',
      message: 'Add Prettier for code formatting?',
      default: options.prettier || DEFAULT_OPTIONS.prettier
    },
    {
      type: 'list',
      name: 'cssPreprocessor',
      message: 'CSS solution?',
      choices: ['Plain CSS', 'SCSS', 'LESS', 'Tailwind CSS'],
      default: options.scss ? 'SCSS' : DEFAULT_OPTIONS.cssPreprocessor
    },
    {
      type: 'confirm',
      name: 'routing',
      message: 'Add routing?',
      default: options.routing || DEFAULT_OPTIONS.routing
    },
    {
      type: 'list',
      name: 'stateManagement',
      message: 'State management tool?',
      choices: ['None', 'Redux', 'MobX', 'Zustand'],
      default: options.stateManagement || DEFAULT_OPTIONS.stateManagement
    },
    {
      type: 'confirm',
      name: 'initGit',
      message: 'Initialize Git repository?',
      default: DEFAULT_OPTIONS.initGit
    },
    {
      type: 'list',
      name: 'packageManager',
      message: 'Package manager?',
      choices: ['npm', 'yarn', 'pnpm'],
      default: options.packageManager || DEFAULT_OPTIONS.packageManager
    }
  ];

  const answers = options.default ? DEFAULT_OPTIONS : await inquirer.prompt(promptQuestions);

  const projectPath = path.join(process.cwd(), projectName);

  try {
    if (fs.existsSync(projectPath)) {
      throw new Error(`Directory ${projectPath} already exists.`);
    }

    fs.mkdirSync(projectPath);
    process.chdir(projectPath);

    const pm = answers.packageManager;
    const spinner = ora('Creating project...').start();

    await executeCommand(`npx create-react-app . ${answers.typescript ? '--template typescript' : ''}`, 'Failed to create React app');

    const deps = [
      answers.testing !== 'None' && answers.testing.toLowerCase(),
      answers.prettier && 'prettier',
      answers.cssPreprocessor !== 'CSS' && answers.cssPreprocessor !== 'Tailwind CSS' && answers.cssPreprocessor.toLowerCase(),
      answers.routing && 'react-router-dom',
      answers.stateManagement !== 'None' && answers.stateManagement.toLowerCase()
    ].filter(Boolean);

    if (answers.cssPreprocessor === 'Tailwind CSS') {
      await setupTailwind(spinner, pm);
    }

    await installDependencies(spinner, pm, deps);

    if (answers.initGit) {
      spinner.text = 'Initializing Git repository...';
      await executeCommand('git init && git add . && git commit -m "Initial commit"', 'Failed to initialize Git repository');
    }

    await simulateProjectCreation(spinner);

    await executeCommand('code .', 'Failed to open VS Code');

    spinner.succeed('Project created successfully.');

    log.success(`\n📁 Project created at: ${chalk.cyan(projectPath)}`);
    log.success(`🎉 Fleem has successfully set up your project: ${chalk.cyan(projectName)}. Happy coding!\n`);

  } catch (error) {
    log.error('An error occurred:');
    log.error(error.message);
    log.warning('Cleaning up...');
    if (fs.existsSync(projectPath)) {
      fs.removeSync(projectPath);
    }
    log.warning('Cleanup complete. Please try again.');
  }
};

program
  .version('1.1.2')
  .description(chalk.cyan('🚀 Fleem - The Ultimate React Project Generator'))
  .arguments('<project-name>')
  .option('-d, --default', 'Use default options for quick setup')
  .option('--typescript', 'Use TypeScript (overrides default)')
  .option('--jest', 'Add Jest for testing (overrides default)')
  .option('--prettier', 'Add Prettier for code formatting (overrides default)')
  .option('--scss', 'Use SCSS for styling (overrides default)')
  .option('--routing', 'Add React Router for routing (overrides default)')
  .option('--state-management <tool>', 'Specify state management tool: redux, mobx, or zustand (overrides default)')
  .option('--package-manager <manager>', 'Specify package manager: npm, yarn, or pnpm (overrides default)')
  .action(createProject);

program
  .command('upgrade')
  .description('Upgrade Fleem to the latest version')
  .action(upgradeFleem);

program.parse(process.argv);
