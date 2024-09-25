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
  info: (message) => console.log(chalk.blue(message)),
  success: (message) => console.log(chalk.green(message)),
  warning: (message) => console.log(chalk.yellow(message)),
  error: (message) => console.log(chalk.red(message)),
};

const GLOBAL_DEFAULTS = {
  cssPreprocessor: 'CSS',
  initGit: true
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

program
  .version('1.1.1')
  .description(chalk.cyan('🚀 Fleem - Project Generator'))
  .arguments('<projectName>')
  .option('--typescript', 'Use TypeScript')
  .option('--jest', 'Add Jest for testing')
  .option('--prettier', 'Add Prettier for code formatting')
  .option('--scss', 'Use SCSS for styling')
  .option('--routing', 'Add routing (e.g., React Router)')
  .option('--state-management <tool>', 'Specify state management tool (redux, mobx, zustand)')
  .option('--package-manager <manager>', 'Specify package manager (npm, yarn, pnpm)')
  .option('--global-defaults', 'Use global defaults')
  .action(async (projectName, options) => {
    console.log(chalk.cyan('\n🛠️  Welcome to Fleem Project Generator! Let\'s set up your project.\n'));

    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'typescript',
        message: 'Use TypeScript?',
        default: options.typescript || false
      },
      {
        type: 'list',
        name: 'testing',
        message: 'Testing framework:',
        choices: ['Jest', 'Mocha', 'Chai', 'None'],
        default: options.jest ? 'Jest' : 'None'
      },
      {
        type: 'confirm',
        name: 'prettier',
        message: 'Add Prettier?',
        default: options.prettier || false
      },
      {
        type: 'list',
        name: 'cssPreprocessor',
        message: 'CSS preprocessor:',
        choices: ['CSS', 'SCSS', 'LESS'],
        default: options.scss ? 'SCSS' : (options.globalDefaults ? GLOBAL_DEFAULTS.cssPreprocessor : 'CSS')
      },
      {
        type: 'confirm',
        name: 'routing',
        message: 'Add routing?',
        default: options.routing || false
      },
      {
        type: 'list',
        name: 'stateManagement',
        message: 'State management tool:',
        choices: ['None', 'Redux', 'MobX', 'Zustand'],
        default: options.stateManagement || 'None'
      },
      {
        type: 'confirm',
        name: 'initGit',
        message: 'Initialize Git repository?',
        default: options.globalDefaults ? GLOBAL_DEFAULTS.initGit : true
      },
      {
        type: 'list',
        name: 'packageManager',
        message: 'Package manager:',
        choices: ['npm', 'yarn', 'pnpm'],
        default: options.packageManager || 'npm'
      }
    ]);

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

      if (answers.cssPreprocessor !== 'CSS') {
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
      log.success(`\n📁 Location: ${chalk.cyan(projectPath)}`);
      log.success(`🎉 Fleem has successfully created your project: ${chalk.cyan(projectName)}. Best of luck on your project.\n`);

    } catch (error) {
      log.error('An error occurred:');
      log.error(error.message);
      log.warning('Cleaning up...');
      if (fs.existsSync(projectPath)) {
        fs.removeSync(projectPath);
      }
      log.warning('Cleanup complete. Please try again.');
    }
  });

program.parse(process.argv);
