# Changelog

All notable changes to the "QuickDoc Preview" extension will be documented in this file.

## [2.0.4] - 2025

### Changed
- Redesigned DOCX/ODT toolbar to match PDF viewer design
- Cleaner, more professional toolbar with icon-based buttons
- Improved button spacing and separators
- Better visual consistency across viewers
- Enhanced toolbar styling with proper hover states

## [2.0.3] - 2025

### Fixed
- Fixed light/dark theme for DOCX/ODT document viewer
- Document background and text now properly adapt to theme
- Dark mode: Dark background (#2d2d30) with light text (#d4d4d4)
- Light mode: White background (#fff) with dark text (#000)

## [2.0.2] - 2025

### Fixed
- Fixed .vscodeignore to include runtime dependencies (mammoth, odt2html)
- Resolved issue where documents would only show loading screen
- Ensured node_modules are properly packaged with extension

## [2.0.1] - 2025

### Fixed
- Fixed dependencies configuration to ensure proper package installation
- Moved @types/vscode to devDependencies
- Resolved loading issues on fresh installations

## [2.0.0] - 2025

### Added

#### Multi-Format Support
- ✨ **DOCX Support** - View Microsoft Word documents (.docx) directly in VSCode
- ✨ **ODT Support** - View OpenDocument Text files (.odt) directly in VSCode
- 📄 Seamless integration with existing PDF viewer

#### Advanced Document Viewer (DOCX/ODT)
- 🎨 **VSCode Theme Integration** - Automatically adapts to your current VSCode theme colors
- 🎨 **Theme Switching** - Manual override with Auto, Light, and Dark themes
- 🔎 **Zoom Controls** - Zoom in/out with toolbar buttons or keyboard shortcuts (Ctrl +/-)
- 📋 **Document Outline** - Navigate through headings with interactive outline panel
- 🔍 **Search Functionality** - Find text within documents (Ctrl+F) with highlighting
- 🔄 **Diff View** - Compare two versions of the same document side-by-side
- 🔗 **Scroll Sync** - Synchronized scrolling in diff view
- 📊 **Status Bar** - Shows current zoom level
- 🎯 **Modern Toolbar** - Clean, horizontal toolbar matching PDF viewer design
- ⌨️ **Keyboard Shortcuts** - Full keyboard navigation support

#### New Commands
- `quickdoc.zoomIn` - Zoom in (Ctrl/Cmd + Plus)
- `quickdoc.zoomOut` - Zoom out (Ctrl/Cmd + Minus)
- `quickdoc.resetZoom` - Reset zoom to 100% (Ctrl/Cmd + 0)
- `quickdoc.toggleOutline` - Toggle outline panel
- `quickdoc.toggleTheme` - Cycle through themes (Auto/Light/Dark)
- `quickdoc.toggleToolbar` - Show/hide toolbar (Ctrl/Cmd + H)

#### Configuration Options
- `quickdoc.font` - Font family for document rendering (default: Arial)
- `quickdoc.theme` - Theme for document viewer (auto/light/dark)
- `quickdoc.zoomLevel` - Default zoom level (0.5 to 3.0)
- `quickdoc.showOutline` - Show document outline on load (default: false)

### Technical Improvements
- Integrated Mammoth.js for high-quality DOCX rendering
- Integrated odt2html for ODT file support
- Enhanced custom editor provider architecture
- Improved TypeScript type safety and error handling
- Better user feedback and loading states
- Modular code structure for maintainability

### Keyboard Shortcuts (DOCX/ODT)
- **Ctrl/Cmd + Plus** - Zoom in
- **Ctrl/Cmd + Minus** - Zoom out
- **Ctrl/Cmd + 0** - Reset zoom to 100%
- **Ctrl/Cmd + F** - Open search panel
- **Ctrl/Cmd + H** - Toggle toolbar
- **Esc** - Close search panel

## [1.0.1] - 2024

### Fixed
- Minor bug fixes and improvements
- Updated dependencies for security

## [1.0.0] - 2024

### Added
- 🎉 Initial release of QuickDoc Preview
- 📄 Modern PDF viewer with VSCode theme integration
- 🎨 Custom toolbar buttons: Reset Zoom (R), Fit to Width (F), Open in Browser
- 🧹 Clean, organized project structure
- 👁️ Hidden scrollbars for distraction-free viewing
- 🌓 Seamless dark/light theme adaptation
- ⚙️ Configurable PDF settings (scale, sidebar, scroll mode, cursor, spread mode)

---

## Acknowledgments

This extension is built with:
- [PDF.js](https://mozilla.github.io/pdf.js/) by Mozilla - PDF rendering
- [Mammoth.js](https://github.com/mwilliamson/mammoth.js) - DOCX to HTML conversion
- [odt2html](https://github.com/iegik/odt2html) - ODT to HTML conversion
