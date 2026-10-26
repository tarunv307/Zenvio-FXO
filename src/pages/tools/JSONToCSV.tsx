import React, { useState } from 'react';
import { Download, Copy, Check, FileSpreadsheet } from 'lucide-react';
import { Button } from '../../components/ui/FormElements';
import { copyToClipboard, downloadBlob } from '../../utils/file';

const SAMPLE_JSON = `[
  { "id": 1, "product": "Zenvio Pro Plan", "qty": 1, "price": 49.00 },
  { "id": 2, "product": "Enterprise Add-on", "qty": 3, "price": 29.50 },
  { "id": 3, "product": "Custom Domain SSL", "qty": 1, "price": 12.00 }
]`;

export function JSONToCSV() {
  const [jsonInput, setJsonInput] = useState<string>(SAMPLE_JSON);
  const [csvOutput, setCsvOutput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const convertJson = (src: string) => {
    if (!src.trim()) {
      setCsvOutput('');
      setError(null);
      return;
    }

    try {
      const parsed = JSON.parse(src);
      const items = Array.isArray(parsed) ? parsed : [parsed];

      if (items.length === 0) {
        setCsvOutput('');
        setError(null);
        return;
      }

      // Collect all keys
      const keysSet = new Set<string>();
      items.forEach((item) => {
        if (typeof item === 'object' && item !== null) {
          Object.keys(item).forEach((k) => keysSet.add(k));
        }
      });

      const headers = Array.from(keysSet);
      const escapeVal = (val: any) => {
        if (val === null || val === undefined) return '';
        const s = typeof val === 'object' ? JSON.stringify(val) : String(val);
        if (s.includes(',') || s.includes('"') || s.includes('\n')) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      };

      const headerLine = headers.map(escapeVal).join(',');
      const rows = items.map((item) => {
        return headers.map((h) => escapeVal(item[h])).join(',');
      });

      setCsvOutput([headerLine, ...rows].join('\n'));
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setCsvOutput('');
    }
  };

  React.useEffect(() => {
    convertJson(jsonInput);
  }, [jsonInput]);

  const handleCopy = async () => {
    await copyToClipboard(csvOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="w-5 h-5 text-purple-500" />
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            JSON to CSV Converter
          </span>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy} disabled={!csvOutput}>
            {copied ? <Check className="w-4 h-4 mr-1.5 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1.5" />}
            Copy CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => downloadBlob(new Blob([csvOutput], { type: 'text/csv' }), 'data.csv')}
            disabled={!csvOutput}
          >
            <Download className="w-4 h-4 mr-1.5" /> Download .csv
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            JSON Input
          </span>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={14}
            className={`w-full flex-1 p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl font-mono text-xs focus:outline-none ${
              error ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
            }`}
            placeholder='[ { "id": 1, "name": "Item" } ]'
          />
          {error && <span className="text-xs text-red-500 mt-2 font-mono">{error}</span>}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            CSV Output
          </span>
          <textarea
            readOnly
            value={csvOutput}
            rows={14}
            className="w-full flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs focus:outline-none text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>
    </div>
  );
}
