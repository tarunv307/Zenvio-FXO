import React, { useState } from 'react';
import { KeyRound, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { CopyButton } from '../../components/ui/Cards';

const SAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRhcnVuIFZlcm1hIiwiYWRtaW4iOnRydWUsImlhdCI6MTc2MTUyODQwMCwiZXhwIjoxNzYxNTM1NjAwLCJpc3MiOiJ6ZW52aW8uaW8ifQ.db30_sample_signature_not_verified_client_side';

export function JWTDecoder() {
  const [token, setToken] = useState<string>(SAMPLE_JWT);

  const decodePart = (part: string) => {
    try {
      const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(json);
    } catch {
      return null;
    }
  };

  const parts = token.trim().split('.');
  const header = parts[0] ? decodePart(parts[0]) : null;
  const payload = parts[1] ? decodePart(parts[1]) : null;
  const signature = parts[2] || '';

  const formatTimestamp = (ts?: number) => {
    if (!ts) return null;
    return new Date(ts * 1000).toLocaleString();
  };

  const isExpired = payload?.exp ? Date.now() >= payload.exp * 1000 : false;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
          Paste Encoded JWT
        </label>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          rows={4}
          className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs break-all focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-slate-800 dark:text-slate-100"
          placeholder="eyJhbGciOi..."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
            <span className="text-xs font-bold uppercase tracking-wider text-red-500">
              Header: Algorithm & Token Type
            </span>
            {header && <CopyButton text={JSON.stringify(header, null, 2)} />}
          </div>
          <pre className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl font-mono text-xs text-red-600 dark:text-red-400 overflow-x-auto">
            {header ? JSON.stringify(header, null, 2) : 'Invalid header'}
          </pre>
        </div>

        {/* Payload */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-500">
              Payload: Data & Standard Claims
            </span>
            {payload && <CopyButton text={JSON.stringify(payload, null, 2)} />}
          </div>
          <pre className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl font-mono text-xs text-purple-600 dark:text-purple-400 overflow-x-auto">
            {payload ? JSON.stringify(payload, null, 2) : 'Invalid payload'}
          </pre>

          {payload && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-1 text-xs">
              {payload.iat && (
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="w-3.5 h-3.5" /> Issued At: {formatTimestamp(payload.iat)}
                </div>
              )}
              {payload.exp && (
                <div className={`flex items-center gap-2 font-medium ${isExpired ? 'text-red-500' : 'text-emerald-500'}`}>
                  <Clock className="w-3.5 h-3.5" /> Expiration: {formatTimestamp(payload.exp)} ({isExpired ? 'Expired' : 'Active'})
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
