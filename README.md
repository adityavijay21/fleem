# Fleem - The Ultimate React Project Generator

🚀 **Fleem** is a powerful CLI tool that allows developers to quickly scaffold React projects with customizable options like TypeScript, testing frameworks, CSS preprocessors, routing, and state management. Fleem simplifies project setup and configuration, enabling you to focus on coding.

## Features

- **TypeScript support**: Easily add TypeScript to your project.
- **Testing frameworks**: Choose between Jest, Mocha, or Chai for testing.
- **Code formatting**: Optionally integrate Prettier for code formatting.
- **CSS preprocessors**: Choose between plain CSS, SCSS, LESS, or Tailwind CSS.
- **Routing**: Add React Router for routing management.
- **State management**: Optionally integrate Redux, MobX, or Zustand for state management.
- **Git initialization**: Automatically initialize a Git repository.
- **Supports npm, yarn, and pnpm**: Select your preferred package manager.

## Installation

To install Fleem globally, run:

```bash
npm install -g fleem
```

## Usage

### Create a new React project

You can generate a new React project by running:

```bash
fleem <project-name>
```

The CLI will guide you through a series of prompts to configure your project. You can also use the `--default` flag for a quick setup with default options:

```bash
fleem <project-name> --default
```

### Custom Options

You can override the default configuration using various options:

- `--typescript`: Use TypeScript.
- `--jest`: Add Jest for testing.
- `--prettier`: Add Prettier for code formatting.
- `--scss`: Use SCSS for styling.
- `--routing`: Add React Router for routing.
- `--state-management <tool>`: Specify a state management tool (`redux`, `mobx`, or `zustand`).
- `--package-manager <manager>`: Specify the package manager (`npm`, `yarn`, or `pnpm`).

Example:

```bash
fleem my-app --typescript --jest --prettier --scss --routing --state-management redux
```

### Upgrade Fleem

To upgrade Fleem to the latest version, run:

```bash
fleem upgrade
```

## Contributing

We welcome contributions to Fleem! Feel free to open issues or submit pull requests on [GitHub](https://github.com/adityavijay21/fleem).

## Socials

- **Website**: [https://fleem.is-a.dev/](https://fleem.is-a.dev/)
- **NPM Package**: [https://www.npmjs.com/package/fleem](https://www.npmjs.com/package/fleem)
- **GitHub**: [https://github.com/adityavijay21/fleem](https://github.com/adityavijay21/fleem)
