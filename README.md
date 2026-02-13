# QuickDoc Preview

A comprehensive document viewer extension for Visual Studio Code supporting PDF, DOCX, and ODT files with enhanced features and seamless theme integration.

## ✨ Features

### 📄 Multi-Format Support
- **PDF Viewing** - View PDF files with full PDF.js integration
- **DOCX Support** - View Microsoft Word documents (.docx)
- **ODT Support** - View OpenDocument Text files (.odt)

### 🎨 Advanced Document Viewer (DOCX/ODT)
- **VSCode Theme Integration** - Automatically adapts to your current VSCode theme colors
- **Theme Switching** - Manual override with Auto, Light, and Dark themes
- **Zoom Controls** - Zoom in/out with toolbar buttons or keyboard shortcuts (Ctrl +/-)
- **Document Outline** - Navigate through headings with interactive outline panel
- **Search Functionality** - Find text within documents (Ctrl+F)
- **Diff View** - Compare two versions of the same document side-by-side
- **Scroll Sync** - Synchronized scrolling in diff view
- **Status Bar** - Shows current zoom level

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
- Interactive toolbar at the top-right
- Optional outline panel on the left
- Searchable content
- Zoom controls

## 🎮 Keyboard Shortcuts (DOCX/ODT)

- **Ctrl/Cmd + Plus** - Zoom in
- **Ctrl/Cmd + Minus** - Zoom out
- **Ctrl/Cmd + 0** - Reset zoom to 100%
- **Ctrl/Cmd + F** - Open search panel
- **Ctrl/Cmd + H** - Toggle toolbar
- **Esc** - Close search panel

## 🎨 Toolbar Buttons (DOCX/ODT)

- **🔍-** - Zoom out
- **🔍+** - Zoom in
- **⚊** - Reset zoom
- **◧/◨** - Toggle outline panel
- **🔄/☀️/🌙** - Cycle through themes (Auto/Light/Dark)
- **🔍** - Open search
- **✕** - Hide toolbar

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
- `quickdoc.theme` - Theme for document viewer (auto/light/dark)
- `quickdoc.zoomLevel` - Default zoom level (0.5 to 3.0)
- `quickdoc.showOutline` - Show document outline on load (default: true)

## 🔥 What's New in v2.0

- ✅ Added DOCX file support
- ✅ Added ODT file support
- ✅ Interactive document outline/table of contents
- ✅ Advanced zoom controls with status bar
- ✅ Theme switching (Auto/Light/Dark)
- ✅ In-document search functionality
- ✅ Diff view for comparing document versions
- ✅ Keyboard shortcuts for common actions
- ✅ Collapsible toolbar

## 👨‍💻 Author

**proindra**

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details

## 🙏 Acknowledgments

- Built with [PDF.js](https://mozilla.github.io/pdf.js/) by Mozilla
- DOCX rendering powered by [Mammoth.js](https://github.com/mwilliamson/mammoth.js)
- ODT rendering powered by [odt2html](https://github.com/iegik/odt2html)
