import React, { useState, useEffect } from 'react';
import { ShieldCheck, Copy, Check, Lock } from 'lucide-react';
import { Input, Button } from '../../components/ui/FormElements';
import { copyToClipboard } from '../../utils/file';

export function PrivacyHashGenerator() {
  const [text, setText] = useState<string>('Zenvio Privacy Shield');
  const [salt, setSalt] = useState<string>('');
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const computeHashes = async (inputStr: string, saltStr: string) => {
    const combined = saltStr ? `${saltStr}:${inputStr}` : inputStr;
    const encoder = new TextEncoder();
    const data = encoder.encode(combined);

    const compute = async (algo: string) => {
      const buf = await crypto.subtle.digest(algo, data);
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    };

    try {
      const [sha256, sha384, sha512] = await Promise.all([
        compute('SHA-256'),
        compute('SHA-384'),
        compute('SHA-512'),
      ]);

      setHashes({
        'SHA-256': sha256,
        'SHA-384': sha384,
        'SHA-512': sha512,
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    computeHashes(text, salt);
  }, [text, salt]);

  const copyVal = async (k: string, v: string) => {
    await copyToClipboard(v);
    setCopiedKey(k);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-red-500" /> Client-Side Salted Cryptographic Hasher
        </h3>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
              Input Message
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs focus:outline-none"
              placeholder="Enter message to hash..."
            />
          </div>

          <div>
            <Input
              label="Optional Cryptographic Salt"
              value={salt}
              onChange={(e) => setSalt(e.target.value)}
              placeholder="Add pepper/salt for rainbow table defense..."
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Computed Hashes (SubtleCrypto Web API)
        </h4>

        <div className="space-y-3 font-mono text-xs">
          {Object.entries(hashes).map(([algo, hashVal]) => (
            <div
              key={algo}
              className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5"
            >
              <div className="flex justify-between items-center text-red-600 dark:text-red-400 font-bold">
                <span>{algo}</span>
                <button
                  onClick={() => copyVal(algo, hashVal)}
                  className="p-1 text-slate-400 hover:text-red-500"
                >
                  {copiedKey === algo ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-slate-800 dark:text-slate-100 break-all select-all font-semibold leading-relaxed">
                {hashVal}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
