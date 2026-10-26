import React from 'react';
import { Button } from '../../components/ui/FormElements';
import { CopyButton } from '../../components/ui/Cards';

export function Base64Encoder() {
  const [input, setInput] = React.useState('');
  const [output, setOutput] = React.useState('');
  const [mode, setMode] = React.useState<'encode' | 'decode'>('encode');
  const [error, setError] = React.useState('');

  const process = () => {
    setError('');
    try {
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input.trim()))));
      }
    } catch {
      setError(mode === 'decode' ? 'Invalid Base64 string. Please check the input.' : 'Encoding failed.');
      setOutput('');
    }
  };

  React.useEffect(() => {
    if (input) process();
    else setOutput('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, mode]);

  return (
    <div className="space-y-5">
      <div className="flex rounded-lg border border-gray-200 overflow-hidden w-fit">
        <button onClick={() => setMode('encode')} className={`px-5 py-2 text-sm font-medium transition-colors ${mode === 'encode' ? 'bg-brand-500 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>
          Encode
        </button>
        <button onClick={() => setMode('decode')} className={`px-5 py-2 text-sm font-medium transition-colors ${mode === 'decode' ? 'bg-brand-500 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>
          Decode
        </button>
      </div>

      <div>
        <label htmlFor="b64-input" className="text-sm font-medium text-gray-700 block mb-1.5">
          {mode === 'encode' ? 'Plain text input' : 'Base64 input'}
        </label>
        <textarea id="b64-input" value={input} onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'encode' ? 'Type text to encode…' : 'Paste Base64 to decode…'}
          className="code-area" rows={5} spellCheck={false} />
      </div>

      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

      {output && !error && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="b64-output" className="text-sm font-medium text-gray-700">
              {mode === 'encode' ? 'Base64 output' : 'Decoded text'}
            </label>
            <CopyButton text={output} />
          </div>
          <textarea id="b64-output" readOnly value={output} className="code-area bg-gray-50" rows={5} spellCheck={false} />
        </div>
      )}
    </div>
  );
}
