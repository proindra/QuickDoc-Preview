import * as vscode from 'vscode';
import * as path from 'path';
import { DocxHandler } from './docx_handler';
import { OdtHandler } from './odt_handler';

export class DocumentRenderer {
  private static currentZoom = 1.0;
  private static outlineVisible = false;
  private static currentTheme = 'auto';
  private static toolbarVisible = true;

  public static async renderDocument(
    uri: vscode.Uri,
    panel: vscode.WebviewPanel
  ): Promise<void> {
    const docPath = uri.fsPath;
    try {
      panel.webview.html = this.getLoadingHtml();

      const config = vscode.workspace.getConfiguration('quickdoc');
      const font = config.get('font', 'Arial');
      const theme = config.get('theme', 'auto');
      this.currentZoom = config.get('zoomLevel', 1.0);
      this.outlineVisible = config.get('showOutline', false);
      this.currentTheme = theme;

      let documentHtml = '';
      let processedData: { html: string; outline: OutlineItem[] };

      if (docPath.toLowerCase().endsWith('.docx')) {
        documentHtml = await DocxHandler.renderDocx(uri);
        processedData = this.processDocumentHtmlAndExtractOutline(documentHtml);
      } else if (docPath.toLowerCase().endsWith('.odt')) {
        documentHtml = await OdtHandler.renderOdt(uri);
        processedData = this.processDocumentHtmlAndExtractOutline(documentHtml);
      } else {
        panel.webview.html = this.getErrorHtml(
          'Unsupported file format',
          'Only .docx and .odt files are supported.'
        );
        return;
      }

      panel.webview.html = this.generateEnhancedHtml(
        processedData.html,
        processedData.outline,
        font,
        theme,
        docPath
      );
    } catch (error) {
      panel.webview.html = this.getErrorHtml(
        'Failed to load document',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  private static generateEnhancedHtml(
    documentHtml: string,
    outline: OutlineItem[],
    font: string,
    theme: string,
    filePath: string
  ): string {
    const fileName = path.basename(filePath);
    const themeClass =
      theme === 'dark'
        ? 'vscode-dark'
        : theme === 'light'
        ? 'vscode-light'
        : 'vscode-theme-auto';
    const outlineHtml = this.generateOutlineHtml(outline);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fileName}</title>
    <style>${this.getInlineCSS()}</style>
</head>
<body class="${themeClass}" style="font-family: ${font};">
    <div class="docx-viewer-container">
        <div class="toolbar">
            <div id="toolbarContainer">
                <div id="toolbarViewer">
                    <div id="toolbarViewerLeft">
                        <button id="toggleOutline" class="toolbarButton" title="Toggle Outline">
                            <span>${
                              this.outlineVisible ? '◧' : '◨'
                            } Outline</span>
                        </button>
                        <div class="toolbarButtonSpacer"></div>
                        <button id="searchBtn" class="toolbarButton" title="Find in Document">
                            <span>🔍 Find</span>
                        </button>
                    </div>
                    <div id="toolbarViewerMiddle">
                        <div class="splitToolbarButton">
                            <button id="zoomOut" class="toolbarButton" title="Zoom Out">
                                <span>Zoom Out</span>
                            </button>
                            <div class="splitToolbarButtonSeparator"></div>
                            <button id="zoomIn" class="toolbarButton" title="Zoom In">
                                <span>Zoom In</span>
                            </button>
                        </div>
                        <span id="zoomLevel" class="toolbarLabel">${Math.round(
                          this.currentZoom * 100
                        )}%</span>
                        <button id="resetZoom" class="toolbarButton" title="Reset Zoom (100%)">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <text x="8" y="12" font-size="11" font-weight="bold" text-anchor="middle" fill="currentColor">R</text>
                            </svg>
                        </button>
                    </div>
                    <div id="toolbarViewerRight">
                        <button id="themeToggle" class="toolbarButton" title="Toggle Theme">
                            <span>${
                              this.currentTheme === 'dark'
                                ? '☀️'
                                : this.currentTheme === 'light'
                                ? '🌙'
                                : '🔄'
                            }</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="findbar hidden" id="searchPanel">
            <div id="findbarInputContainer">
                <input type="text" id="searchInput" class="toolbarField" placeholder="Find in document...">
                <div class="splitToolbarButton">
                    <button id="searchPrev" class="toolbarButton" title="Previous">
                        <span>Previous</span>
                    </button>
                    <div class="splitToolbarButtonSeparator"></div>
                    <button id="searchNext" class="toolbarButton" title="Next">
                        <span>Next</span>
                    </button>
                </div>
            </div>
            <button id="closeSearch" class="toolbarButton" title="Close">✕</button>
        </div>
        
        <div class="docx-outline ${
          this.outlineVisible ? '' : 'hidden'
        }" id="outlinePanel">
            <h3>📋 Document Outline</h3>
            ${outlineHtml}
        </div>
        
        <div class="docx-content" id="documentContent">
            <div class="docx-document" id="document" style="transform: scale(${
              this.currentZoom
            });">
                ${documentHtml}
            </div>
        </div>
    </div>
    <script>${this.getViewerScript()}</script>
</body>
</html>`;
  }

  private static processDocumentHtmlAndExtractOutline(
    html: string
  ): { html: string; outline: OutlineItem[] } {
    const outline: OutlineItem[] = [];
    let headingCounter = 0;

    const processedHtml = html.replace(
      /<(h[1-6])[^>]*>(.*?)<\/h[1-6]>/gi,
      (match, tag, content) => {
        const level = parseInt(tag.charAt(1));
        const text = content.replace(/<[^>]*>/g, '').trim();
        const id = this.generateHeadingId(text, headingCounter++);

        if (text) {
          outline.push({ level, text, id });
        }

        return `<${tag} id="${id}">${content}</${tag}>`;
      }
    );

    return { html: processedHtml, outline };
  }

  private static generateHeadingId(text: string, index: number): string {
    const baseId = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    return `${baseId}-${index}`;
  }

  private static generateOutlineHtml(outline: OutlineItem[]): string {
    if (outline.length === 0) {
      return '<p style="opacity: 0.7; font-style: italic;">No headings found</p>';
    }

    return outline
      .map(
        (item) =>
          `<div class="docx-outline-item level-${item.level}" data-target="${item.id}">
                ${item.text}
            </div>`
      )
      .join('');
  }

  private static getLoadingHtml(): string {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { margin: 0; padding: 0; font-family: var(--vscode-font-family); background: var(--vscode-editor-background); color: var(--vscode-editor-foreground); }
        .docx-loading { display: flex; justify-content: center; align-items: center; height: 100vh; font-size: 14px; }
        .spinner { width: 20px; height: 20px; border: 2px solid var(--vscode-input-border); border-top: 2px solid var(--vscode-button-background); border-radius: 50%; animation: spin 1s linear infinite; margin-left: 10px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="docx-loading">Loading document...<div class="spinner"></div></div>
</body>
</html>`;
  }

  private static getErrorHtml(title: string, message: string): string {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { margin: 0; padding: 20px; font-family: var(--vscode-font-family); background: var(--vscode-editor-background); color: var(--vscode-editor-foreground); }
        .docx-error { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 80vh; text-align: center; }
        .error-icon { font-size: 48px; margin-bottom: 20px; }
        h2 { color: var(--vscode-errorForeground); margin: 0 0 10px 0; }
        p { opacity: 0.8; margin: 0; }
    </style>
</head>
<body>
    <div class="docx-error">
        <div class="error-icon">⚠️</div>
        <h2>${title}</h2>
        <p>${message}</p>
    </div>
</body>
</html>`;
  }

  private static getInlineCSS(): string {
    return `:root{--viewer-bg:var(--vscode-editor-background,#fff);--viewer-fg:var(--vscode-editor-foreground,#000);--viewer-border:var(--vscode-panel-border,#ccc);--viewer-hover:var(--vscode-list-hoverBackground,#f0f0f0);--viewer-active:var(--vscode-list-activeSelectionBackground,#0078d4);--viewer-shadow:rgba(0,0,0,.1);--outline-width:250px;--document-bg:#fff}body.vscode-light{--viewer-bg:var(--vscode-editor-background,#fff);--viewer-fg:var(--vscode-editor-foreground,#000);--viewer-border:var(--vscode-panel-border,#ccc);--viewer-hover:var(--vscode-list-hoverBackground,#f0f0f0);--viewer-active:var(--vscode-list-activeSelectionBackground,#0078d4);--viewer-shadow:rgba(0,0,0,.1);--document-bg:#fff}body.vscode-dark{--viewer-bg:var(--vscode-editor-background,#1e1e1e);--viewer-fg:var(--vscode-editor-foreground,#fff);--viewer-border:var(--vscode-panel-border,#3c3c3c);--viewer-hover:var(--vscode-list-hoverBackground,#2a2d2e);--viewer-active:var(--vscode-list-activeSelectionBackground,#0078d4);--viewer-shadow:rgba(255,255,255,.1);--document-bg:#2d2d30}*{box-sizing:border-box}body{margin:0;padding:0;overflow:hidden;font-family:var(--vscode-font-family);background:var(--vscode-editor-background)}.docx-viewer-container{display:flex;flex-direction:column;height:100vh;background:var(--vscode-editor-background);color:var(--vscode-editor-foreground)}.toolbar{position:relative;background:var(--vscode-editor-background);border-bottom:1px solid var(--vscode-panel-border);box-shadow:0 1px 3px var(--viewer-shadow)}#toolbarContainer{width:100%;height:32px}#toolbarViewer{display:flex;align-items:center;height:100%;padding:0 8px}#toolbarViewerLeft,#toolbarViewerMiddle,#toolbarViewerRight{display:flex;align-items:center;gap:4px}#toolbarViewerLeft{flex:1}#toolbarViewerMiddle{flex:0 0 auto;justify-content:center}#toolbarViewerRight{flex:0 0 auto}.toolbarButton{background:transparent;border:none;color:var(--vscode-editor-foreground);padding:4px 8px;cursor:pointer;font-size:12px;border-radius:2px;display:flex;align-items:center;gap:4px;height:26px}.toolbarButton:hover{background:var(--vscode-list-hoverBackground)}.toolbarButton:active{background:var(--vscode-list-activeSelectionBackground);color:#fff}.toolbarButton span{font-size:12px}.toolbarButtonSpacer{width:8px}.splitToolbarButton{display:flex;align-items:center}.splitToolbarButtonSeparator{width:1px;height:20px;background:var(--vscode-panel-border);margin:0 2px}.toolbarLabel{padding:0 8px;font-size:12px;min-width:45px;text-align:center}.findbar{position:absolute;top:32px;left:50%;transform:translateX(-50%);z-index:999;background:var(--vscode-editor-background);border:1px solid var(--vscode-panel-border);border-radius:4px;padding:8px;box-shadow:0 4px 12px var(--viewer-shadow);display:flex;gap:8px;align-items:center}.findbar.hidden{display:none}#findbarInputContainer{display:flex;gap:4px;align-items:center}.toolbarField{background:var(--vscode-input-background);border:1px solid var(--vscode-input-border);color:var(--vscode-input-foreground);padding:4px 8px;border-radius:2px;font-size:12px;width:200px}.docx-outline{position:absolute;left:0;top:32px;bottom:0;width:var(--outline-width);background:var(--vscode-sideBar-background);border-right:1px solid var(--vscode-panel-border);overflow-y:auto;padding:16px;transition:transform .3s ease;z-index:100}.docx-outline.hidden{transform:translateX(-100%)}.docx-outline h3{margin:0 0 12px 0;font-size:14px;font-weight:600;border-bottom:1px solid var(--vscode-panel-border);padding-bottom:8px;color:var(--vscode-sideBarTitle-foreground)}.docx-outline-item{padding:4px 8px;cursor:pointer;border-radius:4px;font-size:12px;margin:2px 0;transition:background .2s ease;color:var(--vscode-sideBar-foreground)}.docx-outline-item:hover{background:var(--vscode-list-hoverBackground)}.docx-outline-item.active{background:var(--vscode-list-activeSelectionBackground);color:var(--vscode-list-activeSelectionForeground)}.docx-outline-item.level-1{padding-left:8px;font-weight:600}.docx-outline-item.level-2{padding-left:20px}.docx-outline-item.level-3{padding-left:32px}.docx-outline-item.level-4{padding-left:44px}.docx-outline-item.level-5{padding-left:56px}.docx-outline-item.level-6{padding-left:68px}.docx-content{flex:1;overflow:auto;padding:16px;scroll-behavior:smooth;background:#525659;position:relative}.docx-document{max-width:210mm;min-height:297mm;margin:0 auto;background:#fff;color:#000;box-shadow:0 0 20px rgba(0,0,0,.3);border-radius:4px;padding:40px;line-height:1.6;transform-origin:top center;transition:transform .2s ease}.docx-document h1,.docx-document h2,.docx-document h3,.docx-document h4,.docx-document h5,.docx-document h6{margin:1.5em 0 .5em 0;line-height:1.4}.docx-document p{margin:.8em 0}.docx-document img{max-width:100%;height:auto;margin:1em 0}.docx-document table{border-collapse:collapse;margin:1em 0;width:100%}.docx-document table td,.docx-document table th{border:1px solid #ccc;padding:8px 12px}.docx-document table th{background:#f0f0f0;font-weight:600}.search-highlight{background:#ff0;color:#000;padding:1px 2px;border-radius:2px}body.vscode-dark .search-highlight{background:#f60;color:#fff}.diff-added{background-color:#e6ffec;border-left:4px solid #2ea043}body.vscode-dark .diff-added{background-color:rgba(46,160,67,.15);border-left:4px solid #2ea043}.diff-removed{background-color:#ffebe9;border-left:4px solid red}body.vscode-dark .diff-removed{background-color:rgba(255,0,0,.15);border-left:4px solid red}`;
  }

  private static getViewerScript(): string {
    return `(function(){let currentZoom=${this.currentZoom};let outlineVisible=${this.outlineVisible};let currentTheme='${this.currentTheme}';let toolbarVisible=${this.toolbarVisible};let searchResults=[];let currentSearchIndex=-1;const vscode=acquireVsCodeApi();function detectVSCodeTheme(){if(currentTheme==='auto'){const computedStyle=getComputedStyle(document.body);const bgColor=computedStyle.getPropertyValue('--vscode-editor-background').trim();if(!bgColor){const bodyBg=computedStyle.backgroundColor;const rgb=bodyBg.match(/\\d+/g);if(rgb&&rgb.length>=3){const brightness=(parseInt(rgb[0])*299+parseInt(rgb[1])*587+parseInt(rgb[2])*114)/1000;return brightness>128?'vscode-light':'vscode-dark'}}if(bgColor.startsWith('#')){const hex=bgColor.substring(1);const r=parseInt(hex.substring(0,2),16);const g=parseInt(hex.substring(2,4),16);const b=parseInt(hex.substring(4,6),16);const brightness=(r*299+g*587+b*114)/1000;return brightness>128?'vscode-light':'vscode-dark'}else if(bgColor.startsWith('rgb')){const rgb=bgColor.match(/\\d+/g);if(rgb&&rgb.length>=3){const brightness=(parseInt(rgb[0])*299+parseInt(rgb[1])*587+parseInt(rgb[2])*114)/1000;return brightness>128?'vscode-light':'vscode-dark'}}return'vscode-light'}return null}function initializeTheme(){const detectedTheme=detectVSCodeTheme();if(detectedTheme){document.body.classList.remove('vscode-theme-auto');document.body.classList.add(detectedTheme);updateThemeButton()}}initializeTheme();const observer=new MutationObserver(()=>{if(currentTheme==='auto'){const detectedTheme=detectVSCodeTheme();if(detectedTheme){document.body.classList.remove('vscode-light','vscode-dark','vscode-theme-auto');document.body.classList.add(detectedTheme);updateThemeButton()}}});observer.observe(document.documentElement,{attributes:true,attributeFilter:['style','class']});function updateThemeButton(){const button=document.getElementById('themeToggle');if(currentTheme==='auto'){button.textContent='🔄';button.title='Theme: Auto (Click for Dark)'}else if(currentTheme==='light'){button.textContent='🌙';button.title='Theme: Light (Click for Auto)'}else{button.textContent='☀️';button.title='Theme: Dark (Click for Light)'}}document.getElementById('zoomIn').addEventListener('click',()=>{if(currentZoom<3){currentZoom=Math.min(3,currentZoom+0.1);updateZoom();vscode.postMessage({command:'zoomChanged',zoom:currentZoom})}});document.getElementById('zoomOut').addEventListener('click',()=>{if(currentZoom>0.5){currentZoom=Math.max(0.5,currentZoom-0.1);updateZoom();vscode.postMessage({command:'zoomChanged',zoom:currentZoom})}});document.getElementById('resetZoom').addEventListener('click',()=>{currentZoom=1;updateZoom();vscode.postMessage({command:'zoomChanged',zoom:currentZoom})});function updateZoom(){const doc=document.getElementById('document');const zoomLevel=document.getElementById('zoomLevel');doc.style.transform='scale('+currentZoom+')';const zoomPercent=Math.round(currentZoom*100);zoomLevel.textContent=zoomPercent+'%'}document.getElementById('toggleOutline').addEventListener('click',()=>{outlineVisible=!outlineVisible;const outline=document.getElementById('outlinePanel');const button=document.getElementById('toggleOutline');outline.classList.toggle('hidden',!outlineVisible);button.textContent=outlineVisible?'◧':'◨';vscode.postMessage({command:'outlineToggled',visible:outlineVisible})});document.getElementById('themeToggle').addEventListener('click',()=>{if(currentTheme==='dark'){currentTheme='light'}else if(currentTheme==='light'){currentTheme='auto'}else{currentTheme='dark'}updateTheme();vscode.postMessage({command:'themeChanged',theme:currentTheme})});function updateTheme(){const body=document.body;body.classList.remove('vscode-light','vscode-dark','vscode-theme-auto');if(currentTheme==='light'){body.classList.add('vscode-light')}else if(currentTheme==='dark'){body.classList.add('vscode-dark')}else if(currentTheme==='auto'){body.classList.add('vscode-theme-auto');const detectedTheme=detectVSCodeTheme();if(detectedTheme){body.classList.remove('vscode-theme-auto');body.classList.add(detectedTheme)}}updateThemeButton()}document.querySelectorAll('.docx-outline-item').forEach(item=>{item.addEventListener('click',()=>{const targetId=item.getAttribute('data-target');const target=document.getElementById(targetId);if(target){document.querySelectorAll('.docx-outline-item').forEach(i=>i.classList.remove('active'));item.classList.add('active');target.scrollIntoView({behavior:'smooth',block:'start'})}})});document.getElementById('searchBtn').addEventListener('click',()=>{const searchPanel=document.getElementById('searchPanel');searchPanel.classList.toggle('hidden');if(!searchPanel.classList.contains('hidden')){document.getElementById('searchInput').focus()}});document.getElementById('closeSearch').addEventListener('click',()=>{document.getElementById('searchPanel').classList.add('hidden');clearSearchResults()});document.getElementById('searchInput').addEventListener('input',performSearch);document.getElementById('searchNext').addEventListener('click',()=>navigateSearch(1));document.getElementById('searchPrev').addEventListener('click',()=>navigateSearch(-1));function performSearch(){const searchTerm=document.getElementById('searchInput').value.trim();clearSearchResults();if(searchTerm.length<2)return;const content=document.getElementById('document');const walker=document.createTreeWalker(content,NodeFilter.SHOW_TEXT,null,false);const textNodes=[];let node;while(node=walker.nextNode()){textNodes.push(node)}searchResults=[];textNodes.forEach(textNode=>{const text=textNode.textContent;const regex=new RegExp(searchTerm,'gi');let match;while((match=regex.exec(text))!==null){searchResults.push({node:textNode,start:match.index,length:match[0].length})}});highlightSearchResults();if(searchResults.length>0){currentSearchIndex=0;navigateToSearchResult(0)}}function highlightSearchResults(){searchResults.forEach(result=>{const textNode=result.node;const parent=textNode.parentNode;const text=textNode.textContent;const before=text.substring(0,result.start);const match=text.substring(result.start,result.start+result.length);const after=text.substring(result.start+result.length);const highlightSpan=document.createElement('span');highlightSpan.className='search-highlight';highlightSpan.textContent=match;const beforeNode=document.createTextNode(before);const afterNode=document.createTextNode(after);parent.insertBefore(beforeNode,textNode);parent.insertBefore(highlightSpan,textNode);parent.insertBefore(afterNode,textNode);parent.removeChild(textNode);result.element=highlightSpan})}function clearSearchResults(){document.querySelectorAll('.search-highlight').forEach(highlight=>{const parent=highlight.parentNode;parent.replaceChild(document.createTextNode(highlight.textContent),highlight);parent.normalize()});searchResults=[];currentSearchIndex=-1}function navigateSearch(direction){if(searchResults.length===0)return;currentSearchIndex+=direction;if(currentSearchIndex>=searchResults.length)currentSearchIndex=0;if(currentSearchIndex<0)currentSearchIndex=searchResults.length-1;navigateToSearchResult(currentSearchIndex)}function navigateToSearchResult(index){if(index<0||index>=searchResults.length)return;const result=searchResults[index];if(result.element){result.element.scrollIntoView({behavior:'smooth',block:'center'});result.element.style.background='#ff0000';setTimeout(()=>{if(document.body.classList.contains('vscode-dark')){result.element.style.background='#ff6600'}else{result.element.style.background='yellow'}},500)}}const docContent=document.getElementById('documentContent');let isSyncing=false;if(docContent){docContent.addEventListener('scroll',()=>{if(!isSyncing){const maxScroll=docContent.scrollHeight-docContent.clientHeight;if(maxScroll>0){const pct=docContent.scrollTop/maxScroll;vscode.postMessage({command:'scroll',scrollPercent:pct})}}isSyncing=false})}window.addEventListener('message',event=>{const message=event.data;switch(message.command){case'updateZoom':currentZoom=message.zoom;updateZoom();break;case'toggleOutline':outlineVisible=message.visible;const outline=document.getElementById('outlinePanel');const button=document.getElementById('toggleOutline');outline.classList.toggle('hidden',!outlineVisible);button.textContent=outlineVisible?'◧':'◨';break;case'updateTheme':currentTheme=message.theme;updateTheme();break;case'toggleToolbar':toolbarVisible=message.visible;updateToolbarVisibility();break;case'syncScroll':if(docContent){isSyncing=true;const maxScroll=docContent.scrollHeight-docContent.clientHeight;docContent.scrollTop=message.scrollPercent*maxScroll}break;case'highlight':highlightDiffs(message.diffs);break}});function highlightDiffs(diffs){const doc=document.getElementById('document');if(!doc)return;doc.querySelectorAll('.diff-added, .diff-removed').forEach(el=>{el.classList.remove('diff-added','diff-removed')});const elements=Array.from(doc.children);if(diffs.added){diffs.added.forEach(idx=>{if(elements[idx])elements[idx].classList.add('diff-added')})}if(diffs.removed){diffs.removed.forEach(idx=>{if(elements[idx])elements[idx].classList.add('diff-removed')})}}document.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey){switch(e.key){case'+':case'=':e.preventDefault();document.getElementById('zoomIn').click();break;case'-':e.preventDefault();document.getElementById('zoomOut').click();break;case'0':e.preventDefault();document.getElementById('resetZoom').click();break;case'f':e.preventDefault();document.getElementById('searchBtn').click();break}}if(e.key==='Escape'){document.getElementById('closeSearch').click()}})})();`;
  }

  public static updateZoom(zoom: number): void {
    this.currentZoom = zoom;
  }

  public static toggleOutline(): void {
    this.outlineVisible = !this.outlineVisible;
  }

  public static updateTheme(theme: string): void {
    this.currentTheme = theme;
  }

  public static toggleToolbar(): void {
    this.toolbarVisible = !this.toolbarVisible;
  }
}

interface OutlineItem {
  level: number;
  text: string;
  id: string;
}
