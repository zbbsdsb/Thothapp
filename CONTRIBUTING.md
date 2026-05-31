# Contributing to Thoth

First off, thank you for considering contributing to Thoth! It's people like you that make Thoth such a great tool for dream archiving.

This document provides guidelines and instructions for contributing to the project. Please read it carefully to ensure a smooth collaboration.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Workflow](#development-workflow)
- [Style Guidelines](#style-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ and npm
- Git
- A Firebase account
- A Google Cloud account (for Gemini API access)

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Thothapp.git
   cd Thothapp
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/Thothapp.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Set up environment variables** (see [README.md](README.md#environment-variables))
6. **Start the development server**:
   ```bash
   npm run dev
   ```

---

## 💡 How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please check the [existing issues](https://github.com/yourusername/Thothapp/issues) to see if the problem has already been reported.

When creating a bug report, please include as much detail as possible:
- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** to demonstrate the steps
- **Describe the behavior you observed** and what behavior you expected
- **Include screenshots or recordings** if applicable
- **Include your environment details** (OS, browser, app version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a step-by-step description** of the suggested enhancement
- **Provide specific examples** to demonstrate the enhancement
- **Explain why this enhancement would be useful**
- **List some other applications where this enhancement exists**, if applicable

### Contributing Code

#### Good First Issues

Looking for a place to start? Check out issues labeled [`good first issue`](.github/GOOD_FIRST_ISSUES.md) or [`help wanted`](https://github.com/yourusername/Thothapp/labels/help%20wanted).

#### Areas of Contribution

- **Frontend**: React components, UI/UX improvements, animations
- **Mobile**: Capacitor plugins, native functionality, platform-specific features
- **Backend**: Firebase functions, API integrations, data modeling
- **Documentation**: Guides, tutorials, API documentation
- **Design**: UI mockups, iconography, branding assets
- **Testing**: Unit tests, E2E tests, manual QA

---

## 🔄 Development Workflow

### Branching Strategy

We follow a simplified Git Flow:

- **`main`**: Production-ready code
- **`develop`**: Integration branch for features
- **`feature/*`**: New features or enhancements
- **`bugfix/*`**: Bug fixes
- **`hotfix/*`**: Urgent production fixes

### Creating a Branch

```bash
# For new features
git checkout -b feature/your-feature-name

# For bug fixes
git checkout -b bugfix/description-of-bug

# For hotfixes
git checkout -b hotfix/urgent-fix-description
```

### Keeping Your Fork Updated

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

---

## 🎨 Style Guidelines

### Code Style

We use ESLint and Prettier to maintain code quality. Please ensure your code passes linting:

```bash
npm run lint
npm run type-check
```

### TypeScript Guidelines

- Use **strict TypeScript** settings
- Provide **explicit return types** for functions
- Use **interfaces** over type aliases for object shapes
- Avoid using `any` — use `unknown` with type guards when necessary

### React Guidelines

- Use **functional components** with hooks
- Follow the **Rules of Hooks**
- Use **custom hooks** to extract reusable logic
- Keep components **focused and small**

### CSS/Styling Guidelines

- Use **Tailwind CSS** utility classes
- Follow **mobile-first** responsive design
- Use **CSS custom properties** for theming
- Maintain **consistent spacing** using Tailwind's scale

### File Organization

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   └── features/       # Feature-specific components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── types/              # TypeScript type definitions
└── styles/             # Global styles and themes
```

---

## 📝 Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **`feat`**: A new feature
- **`fix`**: A bug fix
- **`docs`**: Documentation only changes
- **`style`**: Changes that don't affect code meaning (formatting, semicolons, etc.)
- **`refactor`**: Code change that neither fixes a bug nor adds a feature
- **`perf`**: Performance improvement
- **`test`**: Adding or correcting tests
- **`chore`**: Changes to build process or auxiliary tools

### Examples

```bash
feat(recording): add voice activity detection

fix(auth): resolve Google Sign-In timeout issue

docs(readme): update installation instructions

style(components): format with prettier

refactor(hooks): simplify useRecording logic

test(api): add tests for dream analysis endpoint
```

---

## 🔍 Pull Request Process

### Before Submitting

1. **Update your branch** with the latest changes from `main`
2. **Run all tests** and ensure they pass
3. **Check your code** with `npm run lint`
4. **Update documentation** if needed
5. **Add yourself to contributors** (if not already there)

### Creating a Pull Request

1. **Push your branch** to your fork
2. **Open a Pull Request** against the `main` branch
3. **Fill out the PR template** completely
4. **Link related issues** using keywords (e.g., `Closes #123`)
5. **Request review** from maintainers

### PR Review Process

- All PRs require **at least one review** from a maintainer
- Address review comments **promptly and respectfully**
- Maintainers may request changes — please be patient
- Once approved, a maintainer will **merge your PR**

### PR Title Format

Follow the same format as commit messages:
```
feat: add dream sharing functionality
fix: resolve memory leak in audio recorder
docs: update API documentation
```

---

## 🌐 Community

### Communication Channels

- **GitHub Discussions**: For questions, ideas, and general discussion
- **Discord**: For real-time chat and quick questions
- **GitHub Issues**: For bug reports and feature requests

### Getting Help

If you need help with anything:
1. Check the [documentation](docs/)
2. Search [existing issues](https://github.com/yourusername/Thothapp/issues)
3. Ask in [GitHub Discussions](https://github.com/yourusername/Thothapp/discussions)
4. Join our [Discord server](https://discord.gg/your-invite-code)

---

## 🏆 Recognition

Contributors will be:
- Listed in our [Contributors](https://github.com/yourusername/Thothapp/graphs/contributors) page
- Mentioned in release notes for significant contributions
- Invited to the core team for sustained, quality contributions

---

## 📄 License

By contributing to Thoth, you agree that your contributions will be licensed under the [Apache License 2.0](LICENSE).

---

## ❓ Questions?

If you have questions about contributing that aren't answered here, please:
- Open a [Discussion](https://github.com/yourusername/Thothapp/discussions)
- Reach out on [Discord](https://discord.gg/your-invite-code)
- Email the maintainers at [your-email@example.com](mailto:your-email@example.com)

---

Thank you for contributing to Thoth! 🌙
