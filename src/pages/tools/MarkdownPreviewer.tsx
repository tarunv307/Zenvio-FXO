import React, { useState } from 'react';
import { Download, Copy, Eye, Edit3, Check } from 'lucide-react';
import { Button } from '../../components/ui/FormElements';
import { copyToClipboard, downloadBlob } from '../../utils/file';

const DEFAULT_MARKDOWN = `# Welcome to Zenvio FXO Markdown Editor

Zenvio FXO is an **all-in-one** productivity and developer utility platform.

## Features at a Glance
- Fast client-side performance
- Zero server uploads for maximum privacy
- Clean modern aesthetic

### Supported Markdown Elements
1. **Bold** and *Italic* formatting
2. \`Inline code\` and blockquotes
3. Lists, headings, and links

> "Simplicity is prerequisite for reliability." — Edsger W. Dijkstra

### Sample Code
\`\`\`javascript
const greet = (name) => {
  return \`Hello, \${name}!\`;
};
\`\`\`

Enjoy formatting your documents!`;

export function MarkdownPreviewer() {
  const [markdown, setMarkdown] = useState<string>(DEFAULT_MARKDOWN);
  const [copied, setCopied] = useState<boolean>(false);

  // Lightweight, secure markdown parser
  const renderMarkdown = (src: string): string => {
    let html = src
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Headings
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2 text-slate-800 dark:text-slate-100">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-5 mb-2 text-slate-800 dark:text-slate-100">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-black mt-6 mb-3 text-slate-900 dark:text-white">$1</h1>');

    // Blockquotes
    html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-purple-500 pl-4 py-1 italic my-3 text-slate-600 dark:text-slate-300 bg-purple-500/5 rounded-r">$1</blockquote>');

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/gim, '<pre class="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto my-3"><code>$1</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/gim, '<code class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-purple-600 font-mono text-xs">$1</code>');

    // Bold & italic
    html = html.replace(/\*\*([^*]+)\*\*/gim, '<strong class="font-bold text-slate-900 dark:text-slate-100">$1</strong>');
    html = html.replace(/\*([^*]+)\*/gim, '<em class="italic">$1</em>');

    // Unordered lists
    html = html.replace(/^\- (.*$)/gim, '<li class="ml-5 list-disc text-slate-700 dark:text-slate-300">$1</li>');

    // Ordered lists
    html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-5 list-decimal text-slate-700 dark:text-slate-300">$1</li>');

    // Paragraphs
    html = html.replace(/\n{2,}/g, '</p><p class="my-3 text-slate-700 dark:text-slate-300 leading-relaxed">');
    html = `<p class="my-3 text-slate-700 dark:text-slate-300 leading-relaxed">${html}</p>`;

    return html;
  };

  const handleCopyHtml = async () => {
    await copyToClipboard(renderMarkdown(markdown));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-purple-500" /> Interactive Markdown Editor & Live Preview
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyHtml}>
            {copied ? <Check className="w-4 h-4 mr-1.5 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1.5" />}
            Copy HTML
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => downloadBlob(new Blob([markdown], { type: 'text/markdown' }), 'document.md')}
          >
            <Download className="w-4 h-4 mr-1.5" /> Download .md
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Editor */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Markdown Source
          </span>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            rows={18}
            className="w-full flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 leading-relaxed"
          />
        </div>

        {/* Preview */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-purple-500" /> Rendered Output
          </span>
          <div
            className="flex-1 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-y-auto max-h-[460px] text-sm prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
          />
        </div>
      </div>
    </div>
  );
}
