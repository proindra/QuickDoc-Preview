import * as mammoth from 'mammoth';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const readFileAsync = promisify(fs.readFile);
const unlinkAsync = promisify(fs.unlink);

export class DocxHandler {
    public static async renderDocx(uri: vscode.Uri): Promise<string> {
        try {
            let buffer: Buffer;

            if (uri.scheme === 'git') {
                try {
                    buffer = await this.readFromGit(uri);
                } catch (gitError) {
                    const fileData = await vscode.workspace.fs.readFile(uri);
                    buffer = Buffer.from(fileData);
                }
            } else if (uri.scheme === 'file') {
                try {
                    buffer = await readFileAsync(uri.fsPath);
                } catch (fsError) {
                    const fileData = await vscode.workspace.fs.readFile(uri);
                    buffer = Buffer.from(fileData);
                }
            } else {
                const fileData = await vscode.workspace.fs.readFile(uri);
                buffer = Buffer.from(fileData);
            }

            if (buffer.length === 0) {
                return '<section style="padding: 20px; color: var(--vscode-descriptionForeground);">Empty Document</section>';
            }

            if (buffer.length < 1000) {
                try {
                    const header = buffer.toString('utf8');
                    if (header.startsWith('version https://git-lfs')) {
                        return '<section style="padding: 20px; color: var(--vscode-descriptionForeground); font-style: italic;">Git LFS Pointer File - Original content not available</section>';
                    }
                } catch {}
            }

            const result = await mammoth.convertToHtml({ buffer: buffer });
            return result.value ?? '';
        } catch (error) {
            return '<section style="padding: 20px; color: var(--vscode-descriptionForeground);">Unable to render document content (may be corrupted or incompatible format)</section>';
        }
    }

    private static async readFromGit(uri: vscode.Uri): Promise<Buffer> {
        const query = uri.query;
        if (!query) throw new Error('Git URI missing query parameters');

        const gitInfo = JSON.parse(decodeURIComponent(query));
        const filePath = gitInfo.path;
        const ref = gitInfo.ref || 'HEAD';

        const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(filePath));
        if (!workspaceFolder) throw new Error('File not in workspace');

        const gitRef = ref === '~' ? 'HEAD' : ref;
        const relativePath = path.relative(workspaceFolder.uri.fsPath, filePath);

        try {
            const { stdout } = await execFileAsync('git', ['show', `${gitRef}:${relativePath}`], {
                cwd: workspaceFolder.uri.fsPath,
                encoding: 'buffer',
                maxBuffer: 50 * 1024 * 1024
            });
            return stdout as Buffer;
        } catch (error) {
            const err = error as any;
            if (err.code === 128 || err.stderr?.includes('does not exist')) {
                return Buffer.alloc(0);
            }
            throw error;
        }
    }
}
