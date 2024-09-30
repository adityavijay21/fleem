#!/usr/bin/env node

import process from 'node:process';
import path from 'node:path';
import { program } from 'commander';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import chalk from 'chalk';
import { execSync } from 'node:child_process';
import ora from 'ora';

// Utility functions
const log = {
  info: message => console.log(chalk.blue(message)),
  success: message => console.log(chalk.green(message)),
  warning: message => console.log(chalk.yellow(message)),
  error: message => console.log(chalk.red(message)),
};

const executeCommand = (command, errorMessage) => {
  try {
    execSync(command, { stdio: 'pipe' });
  } catch (error) {
    throw new Error(`${errorMessage}: ${error.message}`);
  }
};

const installDependency = (spinner, packageManager, isDev, packageName) => {
  const command = `${packageManager} ${isDev ? 'add -D' : 'add'} ${packageName}`;
  spinner.text = `Installing ${packageName}...`;
  executeCommand(command, `Failed to install ${packageName}`);
};

const simulateProjectCreation = async (spinner, totalSteps) => {
  for (let i = 0; i <= totalSteps; i++) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const progress = Math.floor((i / totalSteps) * 100);
    spinner.text = `Creating project... ${progress}%`;
  }
};

// Configuration
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

// Setup functions
const setupTailwind = (spinner, packageManager) => {
  spinner.text = 'Setting up Tailwind CSS...';
  installDependency(spinner, packageManager, true, 'tailwindcss@latest postcss@latest autoprefixer@latest');
  executeCommand('npx tailwindcss init -p', 'Failed to initialize Tailwind CSS');
  
  const tailwindConfig = `
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
}`;
  fs.writeFileSync('tailwind.config.js', tailwindConfig);

  const indexCSS = `
@tailwind base;
@tailwind components;
@tailwind utilities;`;
  fs.writeFileSync('src/index.css', indexCSS);

  spinner.succeed('Tailwind CSS set up successfully.');
};

// Main functions
const upgradeFleem = () => {
  const spinner = ora('Upgrading Fleem...').start();
  try {
    executeCommand('npm install -g fleem@latest', 'Failed to upgrade Fleem');
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
      message: 'Would you like to use TypeScript?',
      default: options.typescript || DEFAULT_OPTIONS.typescript
    },
    {
      type: 'list',
      name: 'testing',
      message: 'Which testing framework would you prefer?',
      choices: [
        { name: 'Jest (Recommended)', value: 'Jest' },
        { name: 'Mocha', value: 'Mocha' },
        { name: 'Chai', value: 'Chai' },
        { name: 'None', value: 'None' }
      ],
      default: options.jest ? 'Jest' : DEFAULT_OPTIONS.testing
    },
    {
      type: 'confirm',
      name: 'prettier',
      message: 'Would you like to add Prettier for code formatting?',
      default: options.prettier || DEFAULT_OPTIONS.prettier
    },
    {
      type: 'list',
      name: 'cssPreprocessor',
      message: 'Which CSS solution would you like to use?',
      choices: [
        { name: 'Plain CSS', value: 'CSS' },
        { name: 'SCSS - Sassy CSS', value: 'SCSS' },
        { name: 'LESS - Leaner CSS', value: 'LESS' },
        { name: 'Tailwind CSS - Utility-first CSS framework', value: 'Tailwind CSS' }
      ],
      default: options.scss ? 'SCSS' : DEFAULT_OPTIONS.cssPreprocessor
    },
    {
      type: 'confirm',
      name: 'routing',
      message: 'Would you like to add routing to your project?',
      default: options.routing || DEFAULT_OPTIONS.routing
    },
    {
      type: 'list',
      name: 'stateManagement',
      message: 'Which state management tool would you like to use?',
      choices: [
        { name: 'None - Use React\'s built-in state management', value: 'None' },
        { name: 'Redux - A Predictable State Container', value: 'Redux' },
        { name: 'MobX - Simple, scalable state management', value: 'MobX' },
        { name: 'Zustand - A small, fast and scalable bearbones state-management solution', value: 'Zustand' }
      ],
      default: options.stateManagement || DEFAULT_OPTIONS.stateManagement
    },
    {
      type: 'confirm',
      name: 'initGit',
      message: 'Would you like to initialize a Git repository?',
      default: DEFAULT_OPTIONS.initGit
    },
    {
      type: 'list',
      name: 'packageManager',
      message: 'Which package manager would you like to use?',
      choices: [
        { name: 'npm - Node Package Manager (default)', value: 'npm' },
        { name: 'yarn - Fast, reliable, and secure dependency management', value: 'yarn' },
        { name: 'pnpm - Fast, disk space efficient package manager', value: 'pnpm' }
      ],
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

    const packageManager = answers.packageManager === 'pnpm' ? 'pnpm' : answers.packageManager === 'yarn' ? 'yarn' : 'npm';

    const spinner = ora('Creating project...').start();
    await simulateProjectCreation(spinner, 100);
    executeCommand(`npx create-react-app . ${answers.typescript ? '--template typescript' : ''}`, 'Failed to create React app');
    spinner.succeed('Project created successfully.');

    if (answers.testing !== 'None') {
      installDependency(spinner, packageManager, true, answers.testing.toLowerCase());
    }

    if (answers.prettier) {
      installDependency(spinner, packageManager, true, 'prettier');
    }

    if (answers.cssPreprocessor === 'Tailwind CSS') {
      setupTailwind(spinner, packageManager);
    } else if (answers.cssPreprocessor !== 'CSS') {
      installDependency(spinner, packageManager, true, answers.cssPreprocessor.toLowerCase());
    }

    if (answers.routing) {
      installDependency(spinner, packageManager, false, 'react-router-dom');
    }

    if (answers.stateManagement !== 'None') {
      installDependency(spinner, packageManager, false, answers.stateManagement.toLowerCase());
    }

    if (answers.initGit) {
      spinner.text = 'Initializing Git repository...';
      executeCommand('git init', 'Failed to initialize Git repository');
      executeCommand('git add .', 'Failed to stage files');
      try {
        executeCommand('git commit -m "Initial commit"', 'Failed to create initial commit');
        spinner.succeed('Initialized Git repository.');
      } catch {
        spinner.warn('Warning: Unable to create initial commit.');
      }
    }

    executeCommand('code .', 'Failed to open VS Code');
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

// CLI configuration
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
