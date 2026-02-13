# Contributing to QuickDoc Preview

Thank you for your interest in contributing to QuickDoc Preview! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

### Prerequisites

- Node.js (v12 or higher)
- npm (v6 or higher)
- Visual Studio Code (v1.46.0 or higher)
- Git

### Setup Development Environment

1. **Fork and Clone**
   ```bash
   git clone https://github.com/proindra/QuickDoc-Preview.git
   cd QuickDoc-Preview
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Compile TypeScript**
   ```bash
   npm run compile
   ```

4. **Run in Development Mode**
   - Open the project in VSCode
   - Press `F5` to launch Extension Development Host
   - Test your changes in the new VSCode window

## 📁 Project Structure

```
QuickDoc Preview/
├── src/
│   ├── extension.ts              # Main extension entry point
│   ├── pdfProvider.ts           # PDF custom editor provider
│   ├── pdfPreview.ts            # PDF preview functionality
│   ├── docxEditorProvider.ts    # DOCX/ODT custom editor provider
│   ├── docx_handler.ts          # DOCX file processing
│   ├── odt_handler.ts           # ODT file processing
│   ├── render.ts                # Document HTML renderer
│   └── disposable.ts            # Utility for resource management
├── resources/                    # PDF.js resources
├── assets/                       # Extension assets
├── package.json                  # Extension manifest
└── README.md                     # User documentation
```

## 🛠️ Development Workflow

### Making Changes

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic

3. **Test Your Changes**
   ```bash
   npm run compile
   npm test
   ```

4. **Lint Your Code**
   ```bash
   npm run lint
   ```

### Code Style

- Use TypeScript for all source files
- Follow existing naming conventions
- Use 2 spaces for indentation
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Commit Messages

Use clear and descriptive commit messages:

```
feat: Add zoom controls for DOCX viewer
fix: Resolve theme switching issue
docs: Update README with new features
refactor: Simplify document rendering logic
test: Add tests for ODT handler
```

Prefixes:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## 🧪 Testing

### Manual Testing

1. **Test PDF Files**
   - Open various PDF files
   - Test zoom, fit to width, open in browser
   - Verify theme integration

2. **Test DOCX Files**
   - Open various DOCX files
   - Test zoom, outline, search
   - Verify theme switching

3. **Test ODT Files**
   - Open various ODT files
   - Verify all features work correctly

### Automated Testing

```bash
npm test
```

## 📝 Documentation

When adding new features:

1. Update `README.md` with user-facing documentation
2. Update `CHANGELOG.md` with changes
3. Add JSDoc comments to new functions/classes
4. Update configuration schema in `package.json`

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Description** - Clear description of the issue
2. **Steps to Reproduce** - Detailed steps to reproduce the bug
3. **Expected Behavior** - What you expected to happen
4. **Actual Behavior** - What actually happened
5. **Environment** - VSCode version, OS, extension version
6. **Screenshots** - If applicable

## 💡 Feature Requests

When requesting features:

1. **Use Case** - Describe the problem you're trying to solve
2. **Proposed Solution** - Your idea for solving it
3. **Alternatives** - Other solutions you've considered
4. **Additional Context** - Any other relevant information

## 🔄 Pull Request Process

1. **Update Documentation**
   - Update README.md if needed
   - Update CHANGELOG.md
   - Add/update comments

2. **Test Thoroughly**
   - Test all affected functionality
   - Ensure no regressions
   - Test on different file types

3. **Submit PR**
   - Provide clear description
   - Reference related issues
   - Include screenshots if UI changes

4. **Code Review**
   - Address review comments
   - Make requested changes
   - Keep discussion professional

## 📋 Checklist for Contributors

Before submitting a PR, ensure:

- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] Code follows project style
- [ ] Documentation is updated
- [ ] CHANGELOG.md is updated
- [ ] Commit messages are clear
- [ ] No unnecessary files included
- [ ] Feature works as expected

## 🎯 Areas for Contribution

We welcome contributions in these areas:

### Features
- Additional file format support
- Enhanced search capabilities
- More theme customization options
- Performance improvements
- Accessibility improvements

### Documentation
- Improve README clarity
- Add more examples
- Create video tutorials
- Translate documentation

### Testing
- Add unit tests
- Add integration tests
- Improve test coverage

### Bug Fixes
- Fix reported issues
- Improve error handling
- Enhance stability

## 📞 Getting Help

- **Issues** - [GitHub Issues](https://github.com/proindra/QuickDoc-Preview/issues)
- **Discussions** - Use GitHub Discussions for questions
- **Email** - Contact the maintainer for private inquiries

## 📜 Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information
- Other unprofessional conduct

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Thank you for contributing to QuickDoc Preview! Your efforts help make this extension better for everyone.

---

**Happy Coding! 🚀**
