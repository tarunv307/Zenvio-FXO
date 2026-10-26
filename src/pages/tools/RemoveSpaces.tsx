import React from 'react';
import { Button } from '../../components/ui/FormElements';
import { CopyButton } from '../../components/ui/Cards';

export function RemoveSpaces() {
  const [text, setText] = React.useState('');
  const [result, setResult] = React.useState('');

  const processOptions = [
    {
      key: 'double',
      label: 'Remove double spaces',
      fn: (t: string) => t.replace(/[ \t]{2,}/g, ' '),
    },
    {
      key: 'leading',
      label: 'Remove leading spaces per line',
      fn: (t: string) => t.split('\n').map((l) => l.trimStart()).join('\n'),
    },
    {
      key: 'trailing',
      label: 'Remove trailing spaces per line',
      fn: (t: string) => t.split('\n').map((l) => l.trimEnd()).join('\n'),
    },
    {
      key: 'blankLines',
      label: 'Remove blank lines',
      fn: (t: string) => t.split('\n').filter((l) => l.trim() !== '').join('\n'),
    },
    {
      key: 'allWhitespace',
      label: 'Remove all extra whitespace',
      fn: (t: string) => t.replace(/\s+/g, ' ').trim(),
    },
  ];

  const [selected, setSelected] = React.useState<string[]>(['double', 'leading', 'trailing']);

  const apply = () => {
    let r = text;
    for (const opt of processOptions) {
      if (selected.includes(opt.key)) r = opt.fn(r);
    }
    setResult(r);
  };

  const toggle = (key: string) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="input-text" className="text-sm font-medium text-gray-700 block mb-1.5">Input text</label>
        <textarea id="input-text" value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Paste text with extra spaces or blank lines…"
          className="code-area font-sans" rows={6} />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Cleaning options</p>
        {processOptions.map((opt) => (
          <label key={opt.key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={selected.includes(opt.key)} onChange={() => toggle(opt.key)}
              className="w-4 h-4 text-brand-500 border-gray-300 rounded" />
            {opt.label}
          </label>
        ))}
      </div>

      <Button onClick={apply} disabled={!text.trim()}>Clean Text</Button>

      {result && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="result-text" className="text-sm font-medium text-gray-700">Result</label>
            <CopyButton text={result} />
          </div>
          <textarea id="result-text" readOnly value={result} className="code-area font-sans bg-gray-50" rows={6} />
        </div>
      )}
    </div>
  );
}
