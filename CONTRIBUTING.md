# Contributing to @heidi/core

Thank you for your interest in contributing to Heidi! We welcome contributions from the community and are excited to see what you'll build.

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 20 or higher
- **pnpm**: We use pnpm as our package manager
- **TypeScript**: Familiarity with TypeScript is essential

### Development Setup

1. **Fork and Clone**

   ```bash
   git clone https://github.com/your-username/Heidi.git
   cd Heidi
   ```

2. **Install Dependencies**

   ```bash
   pnpm install
   ```

3. **Build the Project**

   ```bash
   pnpm run build
   ```

4. **Run Tests**
   ```bash
   pnpm test
   ```

## 📋 How to Contribute

### Reporting Issues

- Use the [GitHub issue tracker](https://github.com/isla-nicole-may/Heidi/issues)
- Search existing issues before creating a new one
- Provide clear reproduction steps
- Include relevant error messages and stack traces
- Specify your environment (Node.js version, OS, etc.)

### Suggesting Features

- Open an issue with the "feature request" label
- Describe the use case and motivation
- Provide examples of how the feature would be used
- Consider backward compatibility implications

### Pull Requests

1. **Create a Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**

   - Write clear, readable code
   - Follow existing code style and conventions
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**

   ```bash
   pnpm test
   pnpm run build
   ```

4. **Commit Your Changes**

   ```bash
   git commit -m "feat: add new feature description"
   ```

   Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `test:` for test additions/changes
   - `refactor:` for code refactoring
   - `chore:` for maintenance tasks

5. **Push and Create PR**

   ```bash
   git push origin feature/your-feature-name
   ```

   Then create a pull request on GitHub.

## 🧪 Testing Guidelines

### Writing Tests

- Place tests in the `src/tests/` directory
- Use descriptive test names that explain the behavior
- Follow the existing test structure and patterns
- Test both positive and negative cases
- Mock external dependencies appropriately

### Test Structure

```typescript
describe("Feature Name", () => {
  beforeEach(() => {
    // Setup
  });

  test("should do something specific", () => {
    // Arrange
    const input = createTestInput();

    // Act
    const result = functionUnderTest(input);

    // Assert
    expect(result).toBe(expectedValue);
  });
});
```

### Test Coverage

- Aim for high test coverage on new code
- Focus on testing public APIs and edge cases
- Test error conditions and boundary values

## 📝 Code Style

### TypeScript Guidelines

- Use strict TypeScript settings
- Prefer interfaces over types for object shapes
- Use generics appropriately for reusable code
- Add JSDoc comments for public APIs

### Code Formatting

- We use Prettier for code formatting (when configured)
- Follow existing indentation and spacing
- Use meaningful variable and function names
- Keep functions focused and single-purpose

### File Organization

```
src/
├── heidi/           # Core functionality
│   ├── heidi.ts     # Main wrapper
│   ├── namespace.ts # Type definitions
│   ├── router.ts    # Router implementation
│   └── template.ts  # Template system
├── helpers/         # Utility functions
└── tests/           # Test files
    └── heidi/       # Tests organized by feature
```

## 🔧 Development Scripts

```bash
# Build the project
pnpm run build

# Run tests
pnpm test

# Clean build artifacts
pnpm run clean

# Full clean build
pnpm run clean && pnpm run build
```

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for all public APIs
- Include parameter descriptions and return types
- Provide usage examples in comments

### README Updates

- Update examples if you change public APIs
- Add new features to the feature list
- Keep the API reference section current

## 🐛 Debugging

### Common Issues

1. **Typia Transform Errors**: Make sure TypeScript compilation works before runtime
2. **Type Mismatches**: Check generic constraints and interface definitions
3. **Test Failures**: Ensure mocks are properly configured

### Debugging Tips

- Use TypeScript's strict mode to catch issues early
- Run `pnpm run build` to check for compilation errors
- Check the generated `dist/` files to understand output

## 🤝 Community Guidelines

- Be respectful and inclusive
- Help others learn and grow
- Focus on constructive feedback
- Follow our [Code of Conduct](CODE_OF_CONDUCT.md)

## 📞 Getting Help

- **Issues**: Use GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Documentation**: Check the README and inline code documentation

## 🎯 Contribution Areas

We especially welcome contributions in these areas:

- **AWS Event Types**: Support for additional AWS service events
- **Middleware**: New middleware patterns and utilities
- **Performance**: Optimizations and benchmarks
- **Documentation**: Examples, tutorials, and API docs
- **Testing**: Additional test coverage and test utilities
- **Types**: Improved TypeScript definitions and inference

## 📋 Review Process

1. **Automated Checks**: CI will run tests and build checks
2. **Code Review**: Maintainers will review your code
3. **Feedback**: We'll provide constructive feedback
4. **Approval**: Once approved, we'll merge your contribution

## 🏆 Recognition

Contributors will be:

- Added to the contributors list
- Mentioned in release notes for significant contributions
- Invited to provide input on project direction

Thank you for contributing to Heidi! 🎉
