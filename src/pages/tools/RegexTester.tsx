import React, { useState } from 'react';
import { Code2, Check, AlertCircle } from 'lucide-react';
import { Input, Select } from '../../components/ui/FormElements';

const PRESET_PATTERNS = [
  { label: 'Email Address', pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$', flags: 'gm' },
  { label: 'URL / Web Link', pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)', flags: 'gm' },
  { label: 'IPv4 Address', pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b', flags: 'gm' },
  { label: 'HEX Color Code', pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b', flags: 'g' },
  { label: 'Date (YYYY-MM-DD)', pattern: '\\b\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])\\b', flags: 'gm' },
];

export function RegexTester() {
  const [pattern, setPattern] = useState<string>('([A-Z0-9._%+-]+)@([A-Z0-9.-]+\\.[A-Z]{2,})');
  const [flags, setFlags] = useState<string>('gmi');
  const [testString, setTestString] = useState<string>(
    'Contact our support team at support@zenvio.io or sales@example.com for inquiries.'
  );
  const [error, setError] = useState<string | null>(null);

  const testRegex = () => {
    if (!pattern) return { matches: [], highlighted: testString };

    try {
      const regex = new RegExp(pattern, flags);
      const matches: { text: string; index: number; groups: string[] }[] = [];

      let m;
      let highlighted = testString;

      if (flags.includes('g')) {
        while ((m = regex.exec(testString)) !== null) {
          if (m.index === regex.lastIndex) regex.lastIndex++;
          matches.push({
            text: m[0],
            index: m.index,
            groups: m.slice(1),
          });
        }
      } else {
        m = regex.exec(testString);
        if (m) {
          matches.push({
            text: m[0],
            index: m.index,
            groups: m.slice(1),
          });
        }
      }

      setError(null);
      return { matches, regex };
    } catch (err: any) {
      setError(err.message);
      return { matches: [] };
    }
  };

  const { matches } = testRegex();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-700">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-cyan-500" /> Regular Expression Pattern Tester
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_PATTERNS.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setPattern(p.pattern);
                  setFlags(p.flags);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs hover:bg-cyan-500 hover:text-white transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-3">
            <Input
              label="Regular Expression Pattern"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g. ^[a-z]+$"
            />
          </div>
          <div>
            <Input
              label="Flags (g, i, m, s, u)"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              placeholder="gmi"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Regex Error: {error}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Test String
          </span>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            rows={12}
            className="w-full flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20 leading-relaxed"
            placeholder="Type or paste test string..."
          />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Matches Found ({matches.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[360px] space-y-2">
            {matches.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-4 text-center">No matches found for current expression.</p>
            ) : (
              matches.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono"
                >
                  <div className="flex justify-between text-cyan-600 dark:text-cyan-400 font-bold mb-1">
                    <span>Match #{idx + 1}</span>
                    <span className="text-slate-400 font-normal">Index: {m.index}</span>
                  </div>
                  <div className="p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 break-all font-semibold">
                    {m.text}
                  </div>
                  {m.groups.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Captured Groups:</span>
                      {m.groups.map((g, gIdx) => (
                        <div key={gIdx} className="text-slate-600 dark:text-slate-300 pl-2">
                          ${gIdx + 1}: <span className="font-semibold">{g}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
