#!/usr/bin/env node

import process from 'node:process';
import path from 'node:path';
import { program } from 'commander';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import chalk from 'chalk';
import { execSync } from 'node:child_process';

program
  .version('1.1.1')
  .description('Project Generator')
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
    const globalDefaults = {
      cssPreprocessor: 'CSS',
      initGit: true
    };

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
        default: options.scss ? 'SCSS' : (options.globalDefaults ? globalDefaults.cssPreprocessor : 'CSS')
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
        default: options.globalDefaults ? globalDefaults.initGit : true
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
        console.log(`Error: Directory ${projectPath} already exists.`);
        return;
      }

      fs.mkdirSync(projectPath);
      process.chdir(projectPath);

      const useYarn = answers.packageManager === 'yarn';
      const usePnpm = answers.packageManager === 'pnpm';
      const pkgInstall = usePnpm ? 'pnpm add' : useYarn ? 'yarn add' : 'npm install';
      const pkgInstallDev = usePnpm ? 'pnpm add -D' : useYarn ? 'yarn add --dev' : 'npm install --save-dev';

      console.log(chalk.blue('Creating project...'));
      execSync(`npx create-react-app . ${answers.typescript ? '--template typescript' : ''}`, { stdio: 'pipe' });
      console.log(chalk.green('Project created successfully.'));

      if (answers.testing !== 'None') {
        console.log(chalk.blue(`Adding ${answers.testing} for testing...`));
        execSync(`${pkgInstallDev} ${answers.testing.toLowerCase()}`, { stdio: 'pipe' });
        console.log(chalk.green(`Added ${answers.testing} for testing.`));
      }

      if (answers.prettier) {
        console.log(chalk.blue('Adding Prettier...'));
        execSync(`${pkgInstallDev} prettier`, { stdio: 'pipe' });
        console.log(chalk.green('Added Prettier for code formatting.'));
      }

      if (answers.cssPreprocessor !== 'CSS') {
        console.log(chalk.blue(`Adding ${answers.cssPreprocessor}...`));
        execSync(`${pkgInstallDev} ${answers.cssPreprocessor.toLowerCase()}`, { stdio: 'pipe' });
        console.log(chalk.green(`Added ${answers.cssPreprocessor} for styling.`));
      }

      if (answers.routing) {
        console.log(chalk.blue('Adding routing...'));
        execSync(`${pkgInstall} react-router-dom`, { stdio: 'pipe' });
        console.log(chalk.green('Added routing.'));
      }

      if (answers.stateManagement !== 'None') {
        console.log(chalk.blue(`Adding ${answers.stateManagement}...`));
        execSync(`${pkgInstall} ${answers.stateManagement.toLowerCase()}`, { stdio: 'pipe' });
        console.log(chalk.green(`Added ${answers.stateManagement} for state management.`));
      }

      if (answers.initGit) {
        console.log(chalk.blue('Initializing Git repository...'));
        execSync('git init', { stdio: 'pipe' });
        execSync('git add .', { stdio: 'pipe' });
        try {
          execSync('git commit -m "Initial commit"', { stdio: 'pipe' });
          console.log(chalk.green('Initialized Git repository.'));
        } catch {
          console.log(chalk.yellow('Warning: Unable to create initial commit.'));
        }
      }

      execSync('code .', { stdio: 'pipe' });
      console.log(chalk.green(`Project ${projectName} created.`));
      console.log(chalk.green(`Location: ${projectPath}`));
      console.log(chalk.green('Project creation complete.'));
    } catch (error) {
      console.log(chalk.red('Error occurred:'));
      console.log(chalk.red(error.message));
      console.log(chalk.yellow('Cleaning up...'));
      if (fs.existsSync(projectPath)) {
        fs.removeSync(projectPath);
      }
      console.log(chalk.yellow('Cleanup complete. Please try again.'));
    }
  });

program.parse(process.argv);
