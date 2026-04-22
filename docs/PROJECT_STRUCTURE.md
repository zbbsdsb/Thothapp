# Thoth Project Structure

This document outlines the monorepo structure for the Thoth AI Dream Archive project. The architecture is designed to support multiple platforms while maintaining a single source of truth for core business logic.

## Monorepo Architecture

Thoth uses a monorepo structure managed by Nx, which provides powerful tools for code sharing, task execution, and dependency management across multiple applications and libraries.

```
thoth/
├── apps/                   # Applications
│   ├── web/                # Web application
│   │   ├── public/         # Static assets
│   │   ├── src/            # Source code
│   │   ├── index.html      # Entry point
│   │   ├── vite.config.ts  # Vite configuration
│   │   └── package.json    # Dependencies
│   ├── mobile/             # React Native application
│   │   ├── app/            # App navigation and screens
│   │   ├── assets/         # Static assets
│   │   ├── components/     # UI components
│   │   └── package.json    # Dependencies
│   ├── windows/            # Windows desktop application (Electron)
│   │   ├── src/            # Source code
│   │   ├── main/           # Main process
│   │   ├── renderer/       # Renderer process
│   │   └── package.json    # Dependencies
│   ├── wearos/             # WearOS application
│   │   ├── app/            # App components
│   │   └── build.gradle    # Build configuration
│   └── apple-watch/        # Apple Watch application
│       ├── WatchKit App/   # WatchKit application
│       └── WatchKit Extension/ # WatchKit extension
├── packages/               # Shared packages
│   ├── common/             # Core business logic
│   │   ├── src/            # Source code
│   │   │   ├── ai/         # AI analysis services
│   │   │   ├── data/       # Data models and services
│   │   │   ├── auth/       # Authentication services
│   │   │   ├── storage/    # Storage services
│   │   │   └── utils/      # Utility functions
│   │   ├── package.json    # Dependencies
│   │   └── tsconfig.json   # TypeScript configuration
│   ├── ui/                 # Shared UI components
│   │   ├── src/            # Source code
│   │   │   ├── components/ # Reusable components
│   │   │   ├── hooks/      # Custom React hooks
│   │   │   └── styles/     # Shared styles
│   │   ├── package.json    # Dependencies
│   │   └── tsconfig.json   # TypeScript configuration
│   ├── types/              # Shared TypeScript types
│   │   ├── src/            # Source code
│   │   │   └── index.ts    # Type definitions
│   │   ├── package.json    # Dependencies
│   │   └── tsconfig.json   # TypeScript configuration
│   └── config/             # Shared configuration
│       ├── src/            # Source code
│       │   └── index.ts    # Configuration values
│       ├── package.json    # Dependencies
│       └── tsconfig.json   # TypeScript configuration
├── tools/                  # Build and development tools
│   ├── scripts/            # Utility scripts
│   └── nx-plugins/         # Custom Nx plugins
├── docs/                   # Project documentation
│   ├── README.md           # Project overview
│   ├── ARCHITECTURE.md     # Architecture documentation
│   ├── FEATURES.md         # Feature documentation
│   ├── PRIVACY.md          # Privacy policy
│   ├── QUOTA.md            # Quota information
│   ├── dreambase.md        # DreamBase documentation
│   └── PROJECT_STRUCTURE.md # This file
├── nx.json                 # Nx configuration
├── package.json            # Root package.json
├── tsconfig.base.json      # Base TypeScript configuration
└── .gitignore              # Git ignore patterns
```

## Directory Structure Details

### apps/
This directory contains all the platform-specific applications. Each application is a self-contained project with its own configuration and dependencies.

#### web/
The web application built with React 19 and Vite. It serves as the primary interface for desktop users.

#### mobile/
The React Native application for iOS and Android devices. It provides a native mobile experience with access to device features like microphone and notifications.

#### windows/
The Windows desktop application built with Electron. It provides a native desktop experience for Windows users.

#### wearos/
The WearOS application for Android smartwatches. It provides a simplified interface optimized for small screens.

#### apple-watch/
The Apple Watch application. It provides a simplified interface optimized for Apple Watch devices.

### packages/
This directory contains shared packages that are used across multiple applications.

#### common/
The core business logic of the application. This package contains services for AI analysis, data management, authentication, and storage.

#### ui/
Shared UI components that are used across multiple applications. This ensures a consistent user experience across all platforms.

#### types/
Shared TypeScript types that are used across the entire project. This ensures type consistency and reduces duplication.

#### config/
Shared configuration values that are used across the entire project. This includes API keys, feature flags, and other configuration settings.

### tools/
This directory contains build and development tools, including utility scripts and custom Nx plugins.

### docs/
This directory contains project documentation, including architecture, features, privacy policy, and other important information.

## Code Sharing Strategy

The monorepo structure enables efficient code sharing across multiple platforms:

1. **Core Business Logic**: All core business logic is implemented in the `packages/common` package, which is shared across all applications.

2. **UI Components**: Reusable UI components are implemented in the `packages/ui` package, which is shared across web and mobile applications.

3. **Type Definitions**: Type definitions are centralized in the `packages/types` package, ensuring type consistency across the entire project.

4. **Configuration**: Configuration values are centralized in the `packages/config` package, making it easy to manage settings across all applications.

## Build Process

The project uses Nx to manage the build process:

1. **Dependency Management**: Nx ensures that dependencies are properly resolved across all applications and packages.

2. **Build Caching**: Nx caches build results to speed up subsequent builds.

3. **Parallel Execution**: Nx executes tasks in parallel to optimize build performance.

4. **Code Generation**: Nx provides code generation tools to scaffold new applications and packages.

## Development Workflow

1. **Setup**: Clone the repository and run `npm install` to install dependencies.

2. **Development**: Use `nx serve <app-name>` to start a development server for a specific application.

3. **Testing**: Use `nx test <package-name>` to run tests for a specific package.

4. **Building**: Use `nx build <app-name>` to build a specific application.

5. **Deployment**: Use `nx deploy <app-name>` to deploy a specific application.

## Scalability Considerations

The monorepo structure is designed to scale with the project:

1. **New Platforms**: New platforms can be added as new applications in the `apps` directory.

2. **New Features**: New features can be implemented in the appropriate packages and shared across all applications.

3. **Team Collaboration**: The monorepo structure enables multiple teams to work on different parts of the project simultaneously.

4. **Version Control**: The monorepo structure simplifies version control and release management.

---

*Thoth Project Structure v1.0.0*