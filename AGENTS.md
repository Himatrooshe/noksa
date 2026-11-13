# Repository Guidelines

## Project Structure & Module Organization

This repository is currently an empty project scaffold. No application code, tests, assets, or package manifests exist yet. When introducing the initial implementation, organize files by responsibility and document the chosen structure here. Prefer `src/` for application code, `tests/` for standalone tests, `assets/` for static resources, and `docs/` for supporting documentation when those directories are relevant. Avoid creating empty directories solely to match this layout.

## Build, Test, and Development Commands

No build system, dependency manager, or development commands are configured. Do not assume commands such as `npm test` or `make build` work. When selecting a toolchain, provide reproducible commands for installing dependencies, running locally, building, linting, and testing. Record those exact commands in this guide and the project README, and commit the appropriate dependency lockfile.

## Coding Style & Naming Conventions

Follow the idioms of the language and framework introduced by the project. Configure a formatter and linter early, and use their configuration as the source of truth for indentation and formatting. Use descriptive names, consistent filename casing within each module, and small modules with clear responsibilities. Keep unrelated formatting changes out of functional patches.

## Testing Guidelines

No test framework or coverage threshold is established. Add tests alongside new behavior using the selected framework's standard naming convention, and document how to run them. Prioritize observable behavior, failure paths, and regression cases. Keep tests deterministic and independent of production credentials or services.

## Commit & Pull Request Guidelines

No Git history is available to establish an existing commit convention. Use concise, imperative commit subjects, such as `Add initial application scaffold`. Keep changes focused. Pull requests should explain the purpose, summarize changes, link relevant issues, and report validation performed. Include screenshots for visual changes and call out configuration or migration requirements.

## Security & Configuration

Never commit credentials, private keys, or local environment files. Provide placeholder configuration examples when needed and document required environment variables without exposing secrets.
