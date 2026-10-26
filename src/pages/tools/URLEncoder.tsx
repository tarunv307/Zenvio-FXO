import React from 'react';
import { CopyButton } from '../../components/ui/Cards';

export function URLEncoder() {
  const [input, setInput] = React.useState('');
  const [mode, setMode] = React.useState<'encode' | 'decode'>('encode');

  const output = React.useMemo(() => {
    if (!input) return '';
    try {
      return mode === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input);
    } catch {
      return 'Error: Invalid input for decoding.';
    }
  }, [input, mode]);

  return (
    <div className="space-y-5">
      <div className="flex rounded-lg border border-gray-200 overflow-hidden w-fit">
        <button onClick={() => setMode('encode')} className={`px-5 py-2 text-sm font-medium transition-colors ${mode === 'encode' ? 'bg-brand-500 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>Encode</button>
        <button onClick={() => setMode('decode')} className={`px-5 py-2 text-sm font-medium transition-colors ${mode === 'decode' ? 'bg-brand-500 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>Decode</button>
      </div>

      <div>
        <label htmlFor="url-input" className="text-sm font-medium text-gray-700 block mb-1.5">
          {mode === 'encode' ? 'URL or text to encode' : 'Encoded URL to decode'}
        </label>
        <textarea id="url-input" value={input} onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'encode' ? 'https://example.com/search?q=hello world&lang=en' : 'https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world'}
          className="code-area" rows={4} spellCheck={false} />
      </div>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="url-output" className="text-sm font-medium text-gray-700">{mode === 'encode' ? 'Encoded URL' : 'Decoded URL'}</label>
            <CopyButton text={output} />
          </div>
          <textarea id="url-output" readOnly value={output} className="code-area bg-gray-50" rows={4} spellCheck={false} />
        </div>
      )}
    </div>
  );
}
