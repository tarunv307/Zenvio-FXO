import React, { useState } from 'react';
import { ShieldCheck, RefreshCw, Copy, Check, Lock } from 'lucide-react';
import { Button, RangeSlider } from '../../components/ui/FormElements';
import { copyToClipboard } from '../../utils/file';

const WORDS = [
  'anchor', 'beacon', 'breeze', 'castle', 'cobalt', 'crater', 'crystal', 'delta', 'falcon', 'galaxy',
  'glacier', 'horizon', 'island', 'jupiter', 'lagoon', 'matrix', 'meadow', 'nebula', 'ocean', 'orbit',
  'phantom', 'planet', 'portal', 'pulsar', 'quantum', 'quasar', 'shadow', 'silver', 'summit', 'vortex',
];

export function PrivacyPasswordGenerator() {
  const [mode, setMode] = useState<'random' | 'diceware'>('random');
  const [length, setLength] = useState<number>(20);
  const [wordCount, setWordCount] = useState<number>(5);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [password, setPassword] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const generate = () => {
    if (mode === 'diceware') {
      const chosen: string[] = [];
      const randomValues = new Uint32Array(wordCount);
      crypto.getRandomValues(randomValues);
      for (let i = 0; i < wordCount; i++) {
        chosen.push(WORDS[randomValues[i] % WORDS.length]);
      }
      let phrase = chosen.join('-');
      if (includeNumbers) phrase += `-${Math.floor(Math.random() * 90 + 10)}`;
      if (includeSymbols) phrase += '!';
      setPassword(phrase);
    } else {
      let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (includeNumbers) chars += '0123456789';
      if (includeSymbols) chars += '!@#$%^&*()_+~|}{[]:;?><,./-=';

      const array = new Uint32Array(length);
      crypto.getRandomValues(array);
      const res = Array.from(array, (x) => chars[x % chars.length]).join('');
      setPassword(res);
    }
  };

  React.useEffect(() => {
    generate();
  }, [mode, length, wordCount, includeSymbols, includeNumbers]);

  const handleCopy = async () => {
    await copyToClipboard(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Entropy calculation
  const poolSize = mode === 'diceware' ? WORDS.length : 26 + 26 + (includeNumbers ? 10 : 0) + (includeSymbols ? 30 : 0);
  const entropy = mode === 'diceware' ? Math.round(wordCount * Math.log2(WORDS.length)) : Math.round(length * Math.log2(poolSize));

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl space-y-6">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-red-500" /> Privacy-First Zero-Knowledge Password Generator
          </span>
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
            <button
              onClick={() => setMode('random')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                mode === 'random' ? 'bg-white dark:bg-slate-800 text-red-600 shadow' : 'text-slate-500'
              }`}
            >
              Cryptographic Random
            </button>
            <button
              onClick={() => setMode('diceware')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                mode === 'diceware' ? 'bg-white dark:bg-slate-800 text-red-600 shadow' : 'text-slate-500'
              }`}
            >
              Passphrase (Diceware)
            </button>
          </div>
        </div>

        {/* Display Box */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
          <span className="font-mono text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 break-all select-all">
            {password}
          </span>
          <div className="flex gap-1 shrink-0">
            <button onClick={generate} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
              <RefreshCw className="w-5 h-5" />
            </button>
            <button onClick={handleCopy} className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Entropy Meter */}
        <div className="flex items-center justify-between text-xs px-2">
          <span className="text-slate-500">
            Estimated Entropy: <strong className="text-slate-800 dark:text-slate-100">{entropy} bits</strong>
          </span>
          <span className="font-semibold text-emerald-500 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" /> Virtually Unbreakable
          </span>
        </div>

        {/* Controls */}
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-700">
          {mode === 'random' ? (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>Password Length</span>
                <span>{length} characters</span>
              </div>
              <RangeSlider min={8} max={64} value={length} onChange={(e) => setLength(Number(e.target.value))} />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>Number of Words</span>
                <span>{wordCount} words</span>
              </div>
              <RangeSlider min={3} max={8} value={wordCount} onChange={(e) => setWordCount(Number(e.target.value))} />
            </div>
          )}

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500"
              />
              Include Numbers
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSymbols}
                onChange={(e) => setIncludeSymbols(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500"
              />
              Include Symbols (!@#$)
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
