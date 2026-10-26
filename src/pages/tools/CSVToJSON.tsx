import React, { useState } from 'react';
import { Download, Copy, RefreshCw, Check, FileSpreadsheet } from 'lucide-react';
import { Button, Select } from '../../components/ui/FormElements';
import { copyToClipboard, downloadBlob } from '../../utils/file';

const SAMPLE_CSV = `id,name,role,department,salary
1,Tarun V,Lead Architect,Engineering,145000
2,Sarah Chen,Product Manager,Product,130000
3,Marcus Brody,Senior Designer,Design,115000
4,Elena Rostova,Security Engineer,SecOps,138000`;

export function CSVToJSON() {
  const [csvInput, setCsvInput] = useState<string>(SAMPLE_CSV);
  const [jsonOutput, setJsonOutput] = useState<string>('');
  const [delimiter, setDelimiter] = useState<string>(',');
  const [copied, setCopied] = useState<boolean>(false);

  const convertCsv = (src: string, delim: string) => {
    if (!src.trim()) {
      setJsonOutput('');
      return;
    }

    try {
      const lines = src.trim().split(/\r?\n/).filter(Boolean);
      if (lines.length < 1) {
        setJsonOutput('[]');
        return;
      }

      // Simple CSV parser supporting quotes
      const parseLine = (line: string): string[] => {
        const result: string[] = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"' || char === "'") {
            inQuotes = !inQuotes;
          } else if (char === delim && !inQuotes) {
            result.push(cur.trim());
            cur = '';
          } else {
            cur += char;
          }
        }
        result.push(cur.trim());
        return result;
      };

      const headers = parseLine(lines[0]);
      const rows = lines.slice(1).map((line) => {
        const values = parseLine(line);
        const obj: Record<string, any> = {};
        headers.forEach((header, i) => {
          const val = values[i] ?? '';
          // Try parse number or boolean
          if (!isNaN(Number(val)) && val !== '') {
            obj[header] = Number(val);
          } else if (val.toLowerCase() === 'true') {
            obj[header] = true;
          } else if (val.toLowerCase() === 'false') {
            obj[header] = false;
          } else {
            obj[header] = val;
          }
        });
        return obj;
      });

      setJsonOutput(JSON.stringify(rows, null, 2));
    } catch (err: any) {
      setJsonOutput(`// Error parsing CSV: ${err.message}`);
    }
  };

  React.useEffect(() => {
    convertCsv(csvInput, delimiter);
  }, [csvInput, delimiter]);

  const handleCopy = async () => {
    await copyToClipboard(jsonOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="w-5 h-5 text-purple-500" />
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            CSV to JSON Converter
          </span>
          <div className="w-32">
            <Select
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
              options={[
                { value: ',', label: 'Comma (,)' },
                { value: ';', label: 'Semicolon (;)' },
                { value: '\t', label: 'Tab' },
                { value: '|', label: 'Pipe (|)' },
              ]}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy} disabled={!jsonOutput}>
            {copied ? <Check className="w-4 h-4 mr-1.5 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1.5" />}
            Copy JSON
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => downloadBlob(new Blob([jsonOutput], { type: 'application/json' }), 'data.json')}
            disabled={!jsonOutput}
          >
            <Download className="w-4 h-4 mr-1.5" /> Download .json
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            CSV Input
          </span>
          <textarea
            value={csvInput}
            onChange={(e) => setCsvInput(e.target.value)}
            rows={14}
            className="w-full flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            placeholder="id,name,value..."
          />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            JSON Output
          </span>
          <textarea
            readOnly
            value={jsonOutput}
            rows={14}
            className="w-full flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs focus:outline-none text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>
    </div>
  );
}
