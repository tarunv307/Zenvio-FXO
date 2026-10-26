import React, { useState } from 'react';
import { GitCompare, Copy, ArrowRight, Check } from 'lucide-react';
import { Button } from '../../components/ui/FormElements';
import { copyToClipboard } from '../../utils/file';

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  leftLineNum?: number;
  rightLineNum?: number;
}

export function TextDiff() {
  const [originalText, setOriginalText] = useState<string>('Hello World\nThis is line two\nLine 3 unchanged\nOld line 4');
  const [modifiedText, setModifiedText] = useState<string>('Hello World!\nThis is modified line two\nLine 3 unchanged\nNew line 4 added');
  const [diffLines, setDiffLines] = useState<DiffLine[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  const computeDiff = () => {
    const left = originalText.split('\n');
    const right = modifiedText.split('\n');

    const result: DiffLine[] = [];
    const maxLen = Math.max(left.length, right.length);

    let l = 0;
    let r = 0;

    while (l < left.length || r < right.length) {
      if (l < left.length && r < right.length) {
        if (left[l] === right[r]) {
          result.push({
            type: 'unchanged',
            content: left[l],
            leftLineNum: l + 1,
            rightLineNum: r + 1,
          });
          l++;
          r++;
        } else {
          result.push({
            type: 'removed',
            content: left[l],
            leftLineNum: l + 1,
          });
          result.push({
            type: 'added',
            content: right[r],
            rightLineNum: r + 1,
          });
          l++;
          r++;
        }
      } else if (l < left.length) {
        result.push({
          type: 'removed',
          content: left[l],
          leftLineNum: l + 1,
        });
        l++;
      } else {
        result.push({
          type: 'added',
          content: right[r],
          rightLineNum: r + 1,
        });
        r++;
      }
    }

    setDiffLines(result);
  };

  React.useEffect(() => {
    computeDiff();
  }, [originalText, modifiedText]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">
            Original Text (Before)
          </label>
          <textarea
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            rows={10}
            className="w-full flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            placeholder="Paste original text here..."
          />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">
            Modified Text (After)
          </label>
          <textarea
            value={modifiedText}
            onChange={(e) => setModifiedText(e.target.value)}
            rows={10}
            className="w-full flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            placeholder="Paste modified text here..."
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-purple-500" /> Comparison Result
          </h3>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Added
            </span>
            <span className="flex items-center gap-1.5 text-red-600">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Removed
            </span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-xs leading-relaxed">
          {diffLines.map((line, idx) => (
            <div
              key={idx}
              className={`flex items-center px-4 py-1.5 border-b border-slate-100 dark:border-slate-800/60 ${
                line.type === 'added'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  : line.type === 'removed'
                  ? 'bg-red-500/10 text-red-700 dark:text-red-300'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="w-8 shrink-0 text-slate-400 select-none text-right pr-2">
                {line.leftLineNum || ''}
              </div>
              <div className="w-8 shrink-0 text-slate-400 select-none text-right pr-3 border-r border-slate-200 dark:border-slate-700">
                {line.rightLineNum || ''}
              </div>
              <div className="w-6 shrink-0 text-center select-none font-bold">
                {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
              </div>
              <div className="flex-1 whitespace-pre-wrap break-all pl-1">{line.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
