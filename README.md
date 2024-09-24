# Fleem 🚀

Create customizable React projects with ease using this powerful CLI tool.

## Installation

To install the CLI globally, run:

```bash
npm install -g fleem
```

This will make the command `fleem` available globally.

## Usage

To create a new React project, simply run the command:

```bash
fleem <projectName> [options]
```

You will be guided step-by-step through the project setup with interactive prompts. You can also pass specific options directly.

### Example

```bash
fleem my-app --typescript --jest --scss
```

This command will create a React project named `my-app` using TypeScript, Jest for testing, and SCSS for styling.

After project creation, the tool will install the necessary dependencies, set up your chosen configurations, and initialize a Git repository (if specified).

### Available Commands

- `fleem <projectName> [options]`: Generate a new project with customizable options.

Example:

```bash
fleem my-app --routing --state-management redux
```

This command creates a new project with React Router and Redux for state management.

## Configuration Options

| Option                     | Description                                        | Default       |
|-----------------------------|----------------------------------------------------|---------------|
| `--typescript`              | Use TypeScript for the project.                    | `false`       |
| `--jest`                    | Add Jest for testing.                              | `false`       |
| `--prettier`                | Add Prettier for code formatting.                  | `false`       |
| `--scss`                    | Use SCSS for styling.                              | `false`       |
| `--routing`                 | Add routing (e.g., React Router).                  | `false`       |
| `--state-management <tool>` | Specify state management tool (redux, mobx, zustand)| `None`        |
| `--package-manager <manager>`| Specify package manager (npm, yarn, pnpm).         | `npm`         |
| `--global-defaults`         | Use global default settings.                       | `false`       |

## Features

- TypeScript support
- Add Jest or other testing frameworks
- Integrate Prettier for consistent code formatting
- Choose between CSS, SCSS, or LESS
- Add React Router for routing
- Optionally include state management tools (Redux, MobX, Zustand)
- Flexible package manager support (npm, yarn, pnpm)
- Initialize a Git repository

## Examples

### Create a React project with SCSS and Jest for testing:

```bash
fleem my-app --scss --jest
```

This will create a project with SCSS for styling and Jest for testing.

### Create a React project with TypeScript and Redux for state management:

```bash
fleem my-app --typescript --state-management redux
```

This will create a project using TypeScript and Redux for state management.

### Use interactive mode to customize your project:

```bash
fleem my-app
```

You'll be prompted to choose your options for TypeScript, testing frameworks, state management, and more.

## Troubleshooting

If you encounter an error during project creation, the tool will attempt to clean up by removing the project directory. In case the issue persists, please verify:
1. You have Node.js 14 or higher installed.
2. The directory you're trying to create the project in doesn't already exist.
3. Ensure you're running the CLI in an environment with the necessary permissions to create directories and install packages.

For further issues, check the [issues page](https://github.com/kiriotheo/fleem/issues).

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any features or bug fixes.

1. Fork the project.
2. Create a new branch.
3. Make your changes.
4. Submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
