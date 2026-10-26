import React, { useState } from 'react';
import { Globe, Copy, Check, ExternalLink } from 'lucide-react';
import { Input, Button } from '../../components/ui/FormElements';
import { copyToClipboard } from '../../utils/file';

const SAMPLE_URL =
  'https://zenvio.io:8080/tools/developer/url-parser?theme=dark&client=web&session=xyz123#results';

export function URLParser() {
  const [urlInput, setUrlInput] = useState<string>(SAMPLE_URL);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const parse = () => {
    try {
      const u = new URL(urlInput);
      const params: { key: string; value: string }[] = [];
      u.searchParams.forEach((v, k) => {
        params.push({ key: k, value: v });
      });

      return {
        valid: true,
        protocol: u.protocol,
        hostname: u.hostname,
        port: u.port || '(default)',
        pathname: u.pathname,
        search: u.search,
        hash: u.hash || '(none)',
        origin: u.origin,
        params,
      };
    } catch {
      return { valid: false };
    }
  };

  const parsed = parse();

  const copyVal = async (k: string, v: string) => {
    await copyToClipboard(v);
    setCopiedKey(k);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
          Enter Full URL to Inspect
        </label>
        <Input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="https://example.com/path?key=value#hash"
        />
      </div>

      {parsed.valid ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              URL Components
            </h4>
            <div className="space-y-2 font-mono text-xs">
              {[
                { label: 'Origin', val: parsed.origin },
                { label: 'Protocol', val: parsed.protocol },
                { label: 'Hostname', val: parsed.hostname },
                { label: 'Port', val: parsed.port },
                { label: 'Pathname', val: parsed.pathname },
                { label: 'Hash / Anchor', val: parsed.hash },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <span className="text-slate-400 w-28 shrink-0 font-bold">{item.label}</span>
                  <span className="text-slate-800 dark:text-slate-100 font-semibold truncate pr-2">
                    {item.val}
                  </span>
                  <button
                    onClick={() => copyVal(item.label, item.val || '')}
                    className="p-1 text-slate-400 hover:text-cyan-500 shrink-0"
                  >
                    {copiedKey === item.label ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Query Parameters ({parsed.params?.length || 0})
            </h4>

            {parsed.params && parsed.params.length > 0 ? (
              <div className="space-y-2 font-mono text-xs">
                {parsed.params.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold">{p.key}</span>
                    <span className="text-slate-800 dark:text-slate-100 font-semibold truncate px-2">
                      {p.value}
                    </span>
                    <button
                      onClick={() => copyVal(`param-${idx}`, p.value)}
                      className="p-1 text-slate-400 hover:text-cyan-500"
                    >
                      {copiedKey === `param-${idx}` ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic p-4 text-center">No query parameters found in this URL.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 font-mono text-center">
          Invalid URL string. Please ensure it begins with a valid protocol like https://
        </div>
      )}
    </div>
  );
}
