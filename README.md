# QuickDoc Preview

A comprehensive document viewer extension for Visual Studio Code supporting PDF, DOCX, and ODT files with enhanced features and seamless theme integration.

## ✨ Features

### 📄 Multi-Format Support
- **PDF Viewing** - View PDF files with full PDF.js integration
- **DOCX Support** - View Microsoft Word documents (.docx)
- **ODT Support** - View OpenDocument Text files (.odt)

### 🎨 Advanced Document Viewer (DOCX/ODT)
- **VSCode Theme Integration** - Toolbar adapts to your VSCode theme
- **Theme Switching** - Toggle between Light and Dark document themes
- **Zoom Controls** - Zoom in/out with toolbar buttons or keyboard shortcuts (Ctrl +/-)
- **Document Outline** - Navigate through headings with interactive outline panel
- **Search Functionality** - Find text within documents (Ctrl+F)
- **Status Bar** - Shows current zoom level
- **Clean UI** - Modern, minimalist interface matching PDF viewer design

### 🎯 PDF Viewer Features
- **Reset Zoom (R)** - Quickly reset to 100% zoom
- **Fit to Width (F)** - Automatically fit PDF to editor width
- **Open in Browser** - Open PDF in your default browser
- **Clean UI** - Modern, minimalist interface

## 🚀 Usage

### PDF Files
Simply open any `.pdf` file in VSCode and it will automatically open in the QuickDoc Preview viewer.

### DOCX/ODT Files
Open any `.docx` or `.odt` file in VSCode. The document will render with:
- Interactive toolbar at the top
- Optional outline panel on the left
- Searchable content
- Zoom controls
- Light mode by default (toggle to dark mode available)

## 🎮 Keyboard Shortcuts (DOCX/ODT)

- **Ctrl/Cmd + Plus** - Zoom in
- **Ctrl/Cmd + Minus** - Zoom out
- **Ctrl/Cmd + 0** - Reset zoom to 100%
- **Ctrl/Cmd + F** - Open search panel
- **Esc** - Close search panel

## 🎨 Toolbar Buttons (DOCX/ODT)

- **◧/◨** - Toggle outline panel
- **🔍** - Open search
- **−** - Zoom out
- **+** - Zoom in
- **⚊** - Reset zoom to 100%
- **☀️/🌙** - Toggle between Light/Dark theme

## 📦 Installation

1. Open VSCode
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "QuickDoc Preview"
4. Click Install

## 🛠️ Configuration

### PDF Settings
- `pdf-preview.default.scale` - Default zoom level
- `pdf-preview.default.sidebar` - Show sidebar on load
- `pdf-preview.default.scrollMode` - Scroll mode (vertical/horizontal/wrapped)
- `pdf-preview.default.cursor` - Default cursor tool (select/hand)
- `pdf-preview.default.spreadMode` - Spread mode (none/odd/even)

### DOCX/ODT Settings
- `quickdoc.font` - Font family for document rendering (default: Arial)
- `quickdoc.theme` - Theme for document viewer (light/dark, default: light)
- `quickdoc.zoomLevel` - Default zoom level (0.5 to 3.0, default: 1.0)
- `quickdoc.showOutline` - Show document outline on load (default: false)

## 🔥 What's New in v2.0

### Document Support
- ✅ Added DOCX file support
- ✅ Added ODT file support
- ✅ Interactive document outline/table of contents
- ✅ Advanced zoom controls with status bar
- ✅ Theme switching (Light/Dark)
- ✅ In-document search functionality
- ✅ Keyboard shortcuts for common actions

### UI Improvements
- ✅ Toolbar matches VSCode theme colors
- ✅ PDF-style toolbar design for consistency
- ✅ Light mode default for better readability

## 👨‍💻 Author

**proindra**

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details

## 🙏 Acknowledgments

- Built with [PDF.js](https://mozilla.github.io/pdf.js/) by Mozilla
- DOCX rendering powered by [Mammoth.js](https://github.com/mwilliamson/mammoth.js)
- ODT rendering powered by [odt2html](https://github.com/iegik/odt2html)
