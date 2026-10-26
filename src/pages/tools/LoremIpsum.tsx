import React, { useState } from 'react';
import { Copy, Check, Download, RefreshCw } from 'lucide-react';
import { Button, Input, Select } from '../../components/ui/FormElements';
import { copyToClipboard, downloadBlob } from '../../utils/file';

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'curabitur', 'vel',
  'hendrerit', 'libero', 'eleifend', 'blandit', 'nunc', 'ornare', 'odio', 'ut', 'orci', 'gravida',
  'imperdiet', 'nullam', 'purus', 'lacinia', 'a', 'pretium', 'quis', 'congue', 'praesent', 'sagittis',
  'laoreet', 'auctor', 'mauris', 'non', 'velit', 'eros', 'dictum', 'proin', 'accumsan', 'sapien',
  'nec', 'massa', 'volutpat', 'venenatis', 'sed', 'eu', 'molestie', 'lacus', 'quisque', 'porttitor',
  'ligula', 'dapibus', 'habitant', 'morbi', 'tristique', 'senectus', 'et', 'netus', 'fames', 'ac',
  'turpis', 'egestas', 'aliquam', 'fringilla', 'justo', 'in', 'facilisis', 'feugiat', 'suspendisse', 'potenti',
];

export function LoremIpsum() {
  const [count, setCount] = useState<number>(3);
  const [unit, setUnit] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [startWithLorem, setStartWithLorem] = useState<boolean>(true);
  const [asHtml, setAsHtml] = useState<boolean>(false);
  const [generatedText, setGeneratedText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const generate = () => {
    const getRandomWord = () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];

    const createSentence = () => {
      const len = Math.floor(Math.random() * 10) + 8;
      const words = Array.from({ length: len }, getRandomWord);
      words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
      return words.join(' ') + '.';
    };

    const createParagraph = () => {
      const len = Math.floor(Math.random() * 4) + 4;
      return Array.from({ length: len }, createSentence).join(' ');
    };

    let result = '';

    if (unit === 'words') {
      const words = Array.from({ length: count }, getRandomWord);
      if (startWithLorem && count >= 2) {
        words[0] = 'Lorem';
        words[1] = 'ipsum';
      }
      result = words.join(' ');
    } else if (unit === 'sentences') {
      const sents = Array.from({ length: count }, createSentence);
      if (startWithLorem) {
        sents[0] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
      }
      result = sents.join(' ');
    } else {
      // paragraphs
      const paras = Array.from({ length: count }, createParagraph);
      if (startWithLorem) {
        paras[0] =
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';
      }
      result = asHtml
        ? paras.map((p) => `<p>${p}</p>`).join('\n\n')
        : paras.join('\n\n');
    }

    setGeneratedText(result);
  };

  React.useEffect(() => {
    generate();
  }, [count, unit, startWithLorem, asHtml]);

  const handleCopy = async () => {
    await copyToClipboard(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <Input
              label="Quantity"
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(Math.max(1, Number(e.target.value)))}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
              Type
            </label>
            <Select
              value={unit}
              onChange={(e) => setUnit(e.target.value as any)}
              options={[
                { value: 'paragraphs', label: 'Paragraphs' },
                { value: 'sentences', label: 'Sentences' },
                { value: 'words', label: 'Words' },
              ]}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={startWithLorem}
                onChange={(e) => setStartWithLorem(e.target.checked)}
                className="rounded text-cyan-600 focus:ring-cyan-500"
              />
              Start with "Lorem ipsum"
            </label>
            {unit === 'paragraphs' && (
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={asHtml}
                  onChange={(e) => setAsHtml(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-cyan-500"
                />
                Wrap with &lt;p&gt; HTML tags
              </label>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={generate}>
              <RefreshCw className="w-4 h-4 mr-1.5" /> Re-generate
            </Button>
            <Button variant="primary" className="flex-1" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4 mr-1.5 text-emerald-300" /> : <Copy className="w-4 h-4 mr-1.5" />}
              Copy
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col space-y-3">
        <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
          <span>{generatedText.split(/\s+/).filter(Boolean).length} Words</span>
          <span>{generatedText.length} Characters</span>
        </div>
        <textarea
          readOnly
          value={generatedText}
          rows={12}
          className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm leading-relaxed text-slate-800 dark:text-slate-100 font-serif focus:outline-none"
        />
      </div>
    </div>
  );
}
