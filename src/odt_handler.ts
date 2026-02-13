import * as vscode from 'vscode';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';

const odt2html = require('odt2html');
const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);
const statAsync = promisify(fs.stat);

export class OdtHandler {
    public static async renderOdt(uri: vscode.Uri): Promise<string> {
        try {
            let filePath = uri.fsPath;
            let tempFile: string | undefined;

            if (uri.scheme !== 'file') {
                const fileData = await vscode.workspace.fs.readFile(uri);
                if (fileData.byteLength === 0) return '';

                const tempDir = os.tmpdir();
                tempFile = path.join(tempDir, `temp_${Date.now()}.odt`);
                await writeFileAsync(tempFile, Buffer.from(fileData));
                filePath = tempFile;
            } else {
                const stat = await statAsync(filePath);
                if (stat.size === 0) return '';
            }

            const html = await odt2html.toHTML({ path: filePath });

            if (tempFile) {
                try {
                    await unlinkAsync(tempFile);
                } catch {}
            }

            return html;
        } catch (error) {
            throw new Error(`Failed to convert ODT file: ${error}`);
        }
    }
}
