import * as vscode from 'vscode';
import { PdfCustomProvider } from './pdfProvider';
import { DocxEditorProvider } from './docxEditorProvider';

export function activate(context: vscode.ExtensionContext): void {
  const extensionRoot = vscode.Uri.file(context.extensionPath);
  
  // Register PDF custom editor provider
  const pdfProvider = new PdfCustomProvider(extensionRoot);
  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(
      PdfCustomProvider.viewType,
      pdfProvider,
      {
        webviewOptions: {
          enableFindWidget: false,
          retainContextWhenHidden: true,
        },
      }
    )
  );

  // Register DOCX/ODT custom editor provider
  const docxProvider = new DocxEditorProvider();
  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(
      'quickdoc.docxEditor',
      docxProvider,
      {
        webviewOptions: {
          retainContextWhenHidden: true
        },
        supportsMultipleEditorsPerDocument: false
      }
    )
  );

  // Register zoom commands
  context.subscriptions.push(
    vscode.commands.registerCommand('quickdoc.zoomIn', () => {
      docxProvider.handleZoomIn();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('quickdoc.zoomOut', () => {
      docxProvider.handleZoomOut();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('quickdoc.resetZoom', () => {
      docxProvider.handleResetZoom();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('quickdoc.toggleOutline', () => {
      docxProvider.handleToggleOutline();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('quickdoc.toggleTheme', () => {
      docxProvider.handleToggleTheme();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('quickdoc.toggleToolbar', () => {
      docxProvider.handleToggleToolbar();
    })
  );

  // Register status bar update command
  context.subscriptions.push(
    vscode.commands.registerCommand('quickdoc.updateStatusBar', () => {
      updateStatusBar();
    })
  );

  // Status bar item to show current zoom level
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'quickdoc.resetZoom';
  statusBarItem.tooltip = 'Click to reset zoom';

  function updateStatusBar() {
    const activeEditor = vscode.window.activeTextEditor;
    const isDocxEditor = activeEditor &&
      (activeEditor.document.uri.scheme === 'vscode-webview' ||
        activeEditor.document.fileName.endsWith('.docx') ||
        activeEditor.document.fileName.endsWith('.odt'));

    if (isDocxEditor || docxProvider.hasActiveWebviewPanels()) {
      const zoom = Math.round(docxProvider.getCurrentZoom() * 100);
      statusBarItem.text = `$(zoom-in) ${zoom}%`;
      statusBarItem.show();
    } else {
      statusBarItem.hide();
    }
  }

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => {
      updateStatusBar();
    })
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveColorTheme(() => {
      updateStatusBar();
    })
  );

  context.subscriptions.push(statusBarItem);
}

export function deactivate(): void {}
