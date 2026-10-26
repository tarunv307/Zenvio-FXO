import React from 'react';
import { Button } from '../../components/ui/FormElements';
import { CopyButton } from '../../components/ui/Cards';

export function JSONFormatter() {
  const [input, setInput] = React.useState('');
  const [output, setOutput] = React.useState('');
  const [error, setError] = React.useState('');
  const [mode, setMode] = React.useState<'format' | 'minify'>('format');

  const process = () => {
    setError('');
    try {
      const parsed = JSON.parse(input);
      if (mode === 'format') {
        setOutput(JSON.stringify(parsed, null, 2));
      } else {
        setOutput(JSON.stringify(parsed));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      setOutput('');
    }
  };

  const validate = () => {
    try {
      JSON.parse(input);
      setError('');
      setOutput('✓ Valid JSON');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      setOutput('');
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="json-input" className="text-sm font-medium text-gray-700 block mb-1.5">JSON Input</label>
        <textarea id="json-input" value={input} onChange={(e) => setInput(e.target.value)}
          placeholder={'{\n  "example": "Paste your JSON here"\n}'}
          className="code-area" rows={8} spellCheck={false} />
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button onClick={() => setMode('format')} className={`px-4 py-2 text-sm font-medium transition-colors ${mode === 'format' ? 'bg-brand-500 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>
            Format / Pretty Print
          </button>
          <button onClick={() => setMode('minify')} className={`px-4 py-2 text-sm font-medium transition-colors ${mode === 'minify' ? 'bg-brand-500 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>
            Minify
          </button>
        </div>
        <Button onClick={process} disabled={!input.trim()}>Process</Button>
        <Button variant="secondary" onClick={validate} disabled={!input.trim()}>Validate</Button>
        <Button variant="ghost" onClick={() => { setInput(''); setOutput(''); setError(''); }}>Clear</Button>
      </div>

      {error && <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 font-mono" role="alert">{error}</div>}

      {output && !error && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="json-output" className="text-sm font-medium text-gray-700">Output</label>
            <CopyButton text={output} />
          </div>
          <textarea id="json-output" readOnly value={output} className="code-area bg-gray-50" rows={8} spellCheck={false} />
        </div>
      )}
    </div>
  );
}
