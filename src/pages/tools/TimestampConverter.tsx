import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, Copy, Check } from 'lucide-react';
import { Input, Button } from '../../components/ui/FormElements';
import { copyToClipboard } from '../../utils/file';

export function TimestampConverter() {
  const [currentEpoch, setCurrentEpoch] = useState<number>(Math.floor(Date.now() / 1000));
  const [inputEpoch, setInputEpoch] = useState<string>(String(Math.floor(Date.now() / 1000)));
  const [inputDate, setInputDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const parsedEpoch = parseInt(inputEpoch, 10);
  const isValidEpoch = !isNaN(parsedEpoch) && parsedEpoch > 0;
  // Handle both seconds (10 digits) and milliseconds (13 digits)
  const epochDate = isValidEpoch
    ? new Date(inputEpoch.length >= 13 ? parsedEpoch : parsedEpoch * 1000)
    : null;

  const handleDateToEpoch = (dtStr: string) => {
    setInputDate(dtStr);
    const d = new Date(dtStr);
    if (!isNaN(d.getTime())) {
      setInputEpoch(String(Math.floor(d.getTime() / 1000)));
    }
  };

  const copyVal = async (k: string, v: string) => {
    await copyToClipboard(v);
    setCopiedKey(k);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Live Counter */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Current Unix Epoch Timestamp
          </span>
          <span className="text-3xl font-black font-mono text-cyan-600 dark:text-cyan-400">
            {currentEpoch}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setInputEpoch(String(currentEpoch));
            setInputDate(new Date().toISOString().slice(0, 16));
          }}
        >
          <RefreshCw className="w-4 h-4 mr-1.5" /> Use Current Timestamp
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Unix Timestamp (Seconds or Milliseconds)"
              value={inputEpoch}
              onChange={(e) => setInputEpoch(e.target.value)}
              placeholder="e.g. 1761528400"
            />
          </div>
          <div>
            <Input
              label="Local Date & Time"
              type="datetime-local"
              value={inputDate}
              onChange={(e) => handleDateToEpoch(e.target.value)}
            />
          </div>
        </div>

        {epochDate && !isNaN(epochDate.getTime()) ? (
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700 font-mono text-xs">
            {[
              { label: 'UTC Time', val: epochDate.toUTCString() },
              { label: 'ISO 8601', val: epochDate.toISOString() },
              { label: 'Local Time', val: epochDate.toString() },
              { label: 'Relative', val: getRelativeTime(epochDate) },
            ].map((item) => (
              <div
                key={item.label}
                className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <span className="text-slate-400 uppercase w-24 shrink-0 font-bold">{item.label}</span>
                <span className="text-slate-800 dark:text-slate-100 font-semibold truncate pr-2">
                  {item.val}
                </span>
                <button
                  onClick={() => copyVal(item.label, item.val)}
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
        ) : (
          <p className="text-xs text-red-500 font-mono text-center">Invalid timestamp value.</p>
        )}
      </div>
    </div>
  );
}

function getRelativeTime(date: Date): string {
  const diffSec = Math.round((date.getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const abs = Math.abs(diffSec);

  if (abs < 60) return rtf.format(diffSec, 'seconds');
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), 'minutes');
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), 'hours');
  return rtf.format(Math.round(diffSec / 86400), 'days');
}
