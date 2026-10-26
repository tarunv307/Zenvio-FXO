import React, { useState } from 'react';
import { Code, Copy, Check, ArrowRightLeft } from 'lucide-react';
import { Button } from '../../components/ui/FormElements';
import { copyToClipboard } from '../../utils/file';

export function HTMLEntityEncoder() {
  const [input, setInput] = useState<string>('<div class="zenvio">&copy; 2026 "Tools" & Platform</div>');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [output, setOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const encodeEntities = (str: string) => {
    return str.replace(/[&<>"']/g, (match) => {
      switch (match) {
        case '&':
          return '&amp;';
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case '"':
          return '&quot;';
        case "'":
          return '&#039;';
        default:
          return match;
      }
    });
  };

  const decodeEntities = (str: string) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = str;
    return textarea.value;
  };

  React.useEffect(() => {
    setOutput(mode === 'encode' ? encodeEntities(input) : decodeEntities(input));
  }, [input, mode]);

  const handleCopy = async () => {
    await copyToClipboard(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-2">
          <Button
            variant={mode === 'encode' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setMode('encode')}
          >
            Encode to Entities
          </Button>
          <Button
            variant={mode === 'decode' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setMode('decode')}
          >
            Decode to Text
          </Button>
        </div>

        <Button variant="outline" size="sm" onClick={handleCopy} disabled={!output}>
          {copied ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}
          Copy Output
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            {mode === 'encode' ? 'Plain / HTML Text Input' : 'HTML Entities Input'}
          </span>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={12}
            className="w-full flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs focus:outline-none"
          />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            {mode === 'encode' ? 'Encoded Output' : 'Decoded Output'}
          </span>
          <textarea
            readOnly
            value={output}
            rows={12}
            className="w-full flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
