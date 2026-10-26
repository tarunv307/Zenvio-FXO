import React from 'react';
import { Button } from '../../components/ui/FormElements';
import { CopyButton } from '../../components/ui/Cards';

const TRANSFORMS: Record<string, (t: string) => string> = {
  uppercase: (t) => t.toUpperCase(),
  lowercase: (t) => t.toLowerCase(),
  titleCase: (t) =>
    t.toLowerCase().replace(/(?:^|\s)\S/g, (c) => c.toUpperCase()),
  sentenceCase: (t) =>
    t.toLowerCase().replace(/(^|[.!?]\s+)([a-z])/g, (_, p, c) => p + c.toUpperCase()),
  camelCase: (t) =>
    t.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()),
  pascalCase: (t) =>
    t.toLowerCase().replace(/(^|[^a-zA-Z0-9]+)(.)/g, (_, _p, c) => c.toUpperCase()),
  snakeCase: (t) =>
    t.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''),
  kebabCase: (t) =>
    t.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
  alternatingCase: (t) =>
    t.split('').map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase())).join(''),
  inverseCase: (t) =>
    t.split('').map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join(''),
};

const BUTTONS = [
  { key: 'uppercase',      label: 'UPPERCASE' },
  { key: 'lowercase',      label: 'lowercase' },
  { key: 'titleCase',      label: 'Title Case' },
  { key: 'sentenceCase',   label: 'Sentence case' },
  { key: 'camelCase',      label: 'camelCase' },
  { key: 'pascalCase',     label: 'PascalCase' },
  { key: 'snakeCase',      label: 'snake_case' },
  { key: 'kebabCase',      label: 'kebab-case' },
  { key: 'alternatingCase', label: 'aLtErNaTiNg' },
  { key: 'inverseCase',    label: 'iNVERSE' },
];

export function CaseConverter() {
  const [text, setText] = React.useState('');
  const [result, setResult] = React.useState('');
  const [activeKey, setActiveKey] = React.useState('');

  const apply = (key: string) => {
    setActiveKey(key);
    setResult(TRANSFORMS[key](text));
  };

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="input-text" className="text-sm font-medium text-gray-700 block mb-1.5">Input text</label>
        <textarea
          id="input-text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (activeKey) setResult(TRANSFORMS[activeKey](e.target.value));
          }}
          placeholder="Type or paste your text here…"
          className="code-area font-sans"
          rows={5}
        />
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Case conversion options">
        {BUTTONS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => apply(key)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors
              ${activeKey === key
                ? 'bg-brand-500 text-white border-brand-500'
                : 'border-gray-200 text-gray-700 hover:border-brand-300 hover:text-brand-700'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {result && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="result-text" className="text-sm font-medium text-gray-700">Result</label>
            <CopyButton text={result} />
          </div>
          <textarea
            id="result-text"
            readOnly
            value={result}
            className="code-area font-sans bg-gray-50"
            rows={5}
          />
        </div>
      )}

      {result && (
        <Button variant="ghost" onClick={() => { setResult(''); setActiveKey(''); }}>Clear result</Button>
      )}
    </div>
  );
}
