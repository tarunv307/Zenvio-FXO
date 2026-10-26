import React from 'react';
import { Button } from '../../components/ui/FormElements';
import { CopyButton } from '../../components/ui/Cards';

export function WordCounter() {
  const [text, setText] = React.useState('');

  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).filter(Boolean).length;
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, '').length;
  const sentences = text.trim() === '' ? 0 : text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const paragraphs = text.trim() === '' ? 0 : text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
  const readingTime = words === 0 ? 0 : Math.max(1, Math.ceil(words / 200));

  const stats = [
    { label: 'Words', value: words.toLocaleString() },
    { label: 'Characters', value: chars.toLocaleString() },
    { label: 'Chars (no spaces)', value: charsNoSpace.toLocaleString() },
    { label: 'Sentences', value: sentences.toLocaleString() },
    { label: 'Paragraphs', value: paragraphs.toLocaleString() },
    { label: 'Reading time', value: `~${readingTime} min` },
  ];

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="text-input" className="text-sm font-medium text-gray-700">Your text</label>
          <div className="flex gap-2">
            <CopyButton text={text} />
            <Button size="sm" variant="ghost" onClick={() => setText('')} disabled={!text}>Clear</Button>
          </div>
        </div>
        <textarea
          id="text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type your text here…"
          className="code-area font-sans"
          rows={10}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map(({ label, value }) => (
          <div key={label} className="px-4 py-3 bg-[#EFF6FF]/50 border border-[#E2E8F0] rounded-xl text-center">
            <p className="text-2xl font-black text-[#2563EB]">{value}</p>
            <p className="text-xs text-[#64748B] mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
