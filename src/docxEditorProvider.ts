import * as vscode from 'vscode';
import { DocumentRenderer } from './render';
import { DocxHandler } from './docx_handler';

export class DocxEditorProvider implements vscode.CustomEditorProvider {
    private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<vscode.CustomDocumentEditEvent<vscode.CustomDocument>>();
    public readonly onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;

    private activeWebviewPanels = new Map<string, vscode.WebviewPanel>();
    private panelsByPath = new Map<string, vscode.WebviewPanel[]>();
    private currentZoom = 1.0;
    private outlineVisible = true;
    private currentTheme = 'auto';
    private toolbarVisible = true;

    public async resolveCustomEditor(document: vscode.CustomDocument, webviewPanel: vscode.WebviewPanel, _token: vscode.CancellationToken): Promise<void> {
        this.activeWebviewPanels.set(document.uri.toString(), webviewPanel);

        const fsPath = document.uri.fsPath;
        const panels = this.panelsByPath.get(fsPath) || [];
        panels.push(webviewPanel);
        this.panelsByPath.set(fsPath, panels);

        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(require('path').dirname(__dirname))]
        };

        webviewPanel.webview.onDidReceiveMessage(
            message => this.handleWebviewMessage(message, webviewPanel),
            undefined,
            []
        );

        webviewPanel.onDidDispose(() => {
            this.activeWebviewPanels.delete(document.uri.toString());
            const panels = this.panelsByPath.get(fsPath) || [];
            const idx = panels.indexOf(webviewPanel);
            if (idx !== -1) {
                panels.splice(idx, 1);
                if (panels.length === 0) {
                    this.panelsByPath.delete(fsPath);
                } else {
                    this.panelsByPath.set(fsPath, panels);
                }
            }
        });

        await DocumentRenderer.renderDocument(document.uri, webviewPanel);

        if (panels.length >= 2) {
            this.triggerDiffUpdate(fsPath);
        }
    }

    private async handleWebviewMessage(message: any, webviewPanel: vscode.WebviewPanel) {
        switch (message.command) {
            case 'scroll':
                this.syncScroll(webviewPanel, message.scrollPercent ?? 0);
                break;
            case 'zoomChanged':
                this.currentZoom = message.zoom ?? 1.0;
                DocumentRenderer.updateZoom(this.currentZoom);
                vscode.commands.executeCommand('quickdoc.updateStatusBar');
                break;
            case 'outlineToggled':
                this.outlineVisible = message.visible ?? true;
                DocumentRenderer.toggleOutline();
                break;
            case 'themeChanged':
                this.currentTheme = message.theme ?? 'auto';
                DocumentRenderer.updateTheme(this.currentTheme);
                break;
            case 'toolbarToggled':
                this.toolbarVisible = message.visible ?? true;
                DocumentRenderer.toggleToolbar();
                break;
            case 'error':
                vscode.window.showErrorMessage(`Document Viewer Error: ${message.message ?? 'Unknown error'}`);
                break;
            case 'info':
                if (message.message) {
                    vscode.window.showInformationMessage(message.message);
                }
                break;
        }
    }

    private syncScroll(sourcePanel: vscode.WebviewPanel, scrollPercent: number) {
        let targetPath: string | undefined;
        for (const [path, panels] of this.panelsByPath) {
            if (panels.includes(sourcePanel)) {
                targetPath = path;
                break;
            }
        }

        if (targetPath) {
            const panels = this.panelsByPath.get(targetPath);
            if (panels) {
                panels.forEach(p => {
                    if (p !== sourcePanel) {
                        p.webview.postMessage({ command: 'syncScroll', scrollPercent });
                    }
                });
            }
        }
    }

    private async triggerDiffUpdate(fsPath: string) {
        const panels = this.panelsByPath.get(fsPath);
        if (!panels || panels.length < 2) return;

        const panelUris: vscode.Uri[] = [];
        const orderedPanels: vscode.WebviewPanel[] = [];

        for (const p of panels) {
            for (const [uriStr, activeP] of this.activeWebviewPanels) {
                if (activeP === p) {
                    panelUris.push(vscode.Uri.parse(uriStr));
                    orderedPanels.push(p);
                    break;
                }
            }
        }

        if (panelUris.length < 2) return;

        try {
            const html1 = await DocxHandler.renderDocx(panelUris[0]);
            const html2 = await DocxHandler.renderDocx(panelUris[1]);

            const paras1 = this.extractParagraphText(html1);
            const paras2 = this.extractParagraphText(html2);

            const diff = this.diffArrays(paras1, paras2);

            const p1Removals: number[] = [];
            const p2Additions: number[] = [];

            let idx1 = 0;
            let idx2 = 0;

            diff.forEach(part => {
                if (part.added) {
                    for (let i = 0; i < part.count; i++) {
                        p2Additions.push(idx2 + i);
                    }
                    idx2 += part.count;
                } else if (part.removed) {
                    for (let i = 0; i < part.count; i++) {
                        p1Removals.push(idx1 + i);
                    }
                    idx1 += part.count;
                } else {
                    idx1 += part.count;
                    idx2 += part.count;
                }
            });

            orderedPanels[0].webview.postMessage({ command: 'highlight', diffs: { removed: p1Removals, added: [] } });
            orderedPanels[1].webview.postMessage({ command: 'highlight', diffs: { removed: [], added: p2Additions } });
        } catch (error) {
            console.error('Error computing diff:', error);
        }
    }

    private extractParagraphText(html: string): string[] {
        const regex = /<(p|h[1-6]|li|div|blockquote)[^>]*>([\s\S]*?)<\/\1>/gi;
        const results: string[] = [];
        let match;
        while ((match = regex.exec(html)) !== null) {
            results.push(match[2].replace(/<[^>]+>/g, '').trim());
        }
        return results;
    }

    private diffArrays(arr1: string[], arr2: string[]): { count: number, added?: boolean, removed?: boolean }[] {
        const n = arr1.length;
        const m = arr2.length;
        const matrix: number[][] = Array(n + 1).fill(0).map(() => Array(m + 1).fill(0));

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < m; j++) {
                if (arr1[i] === arr2[j]) {
                    matrix[i + 1][j + 1] = matrix[i][j] + 1;
                } else {
                    matrix[i + 1][j + 1] = Math.max(matrix[i + 1][j], matrix[i][j + 1]);
                }
            }
        }

        const parts: { count: number, added?: boolean, removed?: boolean }[] = [];
        let i = n;
        let j = m;
        const stack: { count: number, added?: boolean, removed?: boolean }[] = [];

        while (i > 0 || j > 0) {
            if (i > 0 && j > 0 && arr1[i - 1] === arr2[j - 1]) {
                stack.push({ count: 1 });
                i--;
                j--;
            } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
                stack.push({ count: 1, added: true });
                j--;
            } else {
                stack.push({ count: 1, removed: true });
                i--;
            }
        }

        stack.reverse();
        if (stack.length > 0) {
            let current = stack[0];
            for (let k = 1; k < stack.length; k++) {
                const next = stack[k];
                if ((current.added === next.added) && (current.removed === next.removed)) {
                    current.count += next.count;
                } else {
                    parts.push(current);
                    current = next;
                }
            }
            parts.push(current);
        }

        return parts;
    }

    public async handleZoomIn(webviewPanel?: vscode.WebviewPanel) {
        if (this.currentZoom < 3.0) {
            this.currentZoom = Math.min(3.0, this.currentZoom + 0.1);
            await this.sendZoomUpdate(webviewPanel);
            vscode.commands.executeCommand('quickdoc.updateStatusBar');
        }
    }

    public async handleZoomOut(webviewPanel?: vscode.WebviewPanel) {
        if (this.currentZoom > 0.5) {
            this.currentZoom = Math.max(0.5, this.currentZoom - 0.1);
            await this.sendZoomUpdate(webviewPanel);
            vscode.commands.executeCommand('quickdoc.updateStatusBar');
        }
    }

    public async handleResetZoom(webviewPanel?: vscode.WebviewPanel) {
        this.currentZoom = 1.0;
        await this.sendZoomUpdate(webviewPanel);
        vscode.commands.executeCommand('quickdoc.updateStatusBar');
    }

    public async handleToggleOutline(webviewPanel?: vscode.WebviewPanel) {
        this.outlineVisible = !this.outlineVisible;
        await this.sendOutlineUpdate(webviewPanel);
    }

    public async handleToggleTheme(webviewPanel?: vscode.WebviewPanel) {
        if (this.currentTheme === 'auto') {
            this.currentTheme = 'light';
        } else if (this.currentTheme === 'light') {
            this.currentTheme = 'dark';
        } else {
            this.currentTheme = 'auto';
        }
        await this.sendThemeUpdate(webviewPanel);
    }

    public async handleToggleToolbar(webviewPanel?: vscode.WebviewPanel) {
        this.toolbarVisible = !this.toolbarVisible;
        await this.sendToolbarUpdate(webviewPanel);
    }

    private async sendZoomUpdate(webviewPanel?: vscode.WebviewPanel) {
        const panel = webviewPanel || this.getActiveWebviewPanel();
        if (panel) {
            await panel.webview.postMessage({ command: 'updateZoom', zoom: this.currentZoom });
            DocumentRenderer.updateZoom(this.currentZoom);
        }
    }

    private async sendOutlineUpdate(webviewPanel?: vscode.WebviewPanel) {
        const panel = webviewPanel || this.getActiveWebviewPanel();
        if (panel) {
            await panel.webview.postMessage({ command: 'toggleOutline', visible: this.outlineVisible });
            DocumentRenderer.toggleOutline();
        }
    }

    private async sendThemeUpdate(webviewPanel?: vscode.WebviewPanel) {
        const panel = webviewPanel || this.getActiveWebviewPanel();
        if (panel) {
            await panel.webview.postMessage({ command: 'updateTheme', theme: this.currentTheme });
            DocumentRenderer.updateTheme(this.currentTheme);
        }
    }

    private async sendToolbarUpdate(webviewPanel?: vscode.WebviewPanel) {
        const panel = webviewPanel || this.getActiveWebviewPanel();
        if (panel) {
            await panel.webview.postMessage({ command: 'toggleToolbar', visible: this.toolbarVisible });
            DocumentRenderer.toggleToolbar();
        }
    }

    private getActiveWebviewPanel(): vscode.WebviewPanel | undefined {
        const panels = Array.from(this.activeWebviewPanels.values());
        return panels.length > 0 ? panels[0] : undefined;
    }

    public getCurrentZoom(): number {
        return this.currentZoom;
    }

    public hasActiveWebviewPanels(): boolean {
        return this.activeWebviewPanels.size > 0;
    }

    public saveCustomDocument(_document: vscode.CustomDocument, _cancellation: vscode.CancellationToken): Thenable<void> {
        return Promise.resolve();
    }

    public saveCustomDocumentAs(_document: vscode.CustomDocument, _destination: vscode.Uri, _cancellation: vscode.CancellationToken): Thenable<void> {
        throw new Error('Save As not supported for document viewing');
    }

    public revertCustomDocument(_document: vscode.CustomDocument, _cancellation: vscode.CancellationToken): Thenable<void> {
        return Promise.resolve();
    }

    public backupCustomDocument(_document: vscode.CustomDocument, context: vscode.CustomDocumentBackupContext, _cancellation: vscode.CancellationToken): Thenable<vscode.CustomDocumentBackup> {
        return Promise.resolve({
            id: context.destination.toString(),
            delete: async () => { }
        });
    }

    public openCustomDocument(uri: vscode.Uri, _openContext: vscode.CustomDocumentOpenContext, _token: vscode.CancellationToken): vscode.CustomDocument | Thenable<vscode.CustomDocument> {
        return {
            uri,
            dispose() { }
        };
    }
}
