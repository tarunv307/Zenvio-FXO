import React from 'react';
import { RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Button, Checkbox, RangeSlider } from '../../components/ui/FormElements';
import { CopyButton } from '../../components/ui/Cards';
import { generateSecurePassword } from '../../utils/file';

function calcStrength(pwd: string): { label: string; color: string; width: number } {
  if (!pwd) return { label: '', color: 'bg-gray-200', width: 0 };
  let score = 0;
  if (pwd.length >= 12) score++;
  if (pwd.length >= 16) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 2) return { label: 'Weak', color: 'bg-red-500', width: 25 };
  if (score <= 4) return { label: 'Fair', color: 'bg-amber-500', width: 50 };
  if (score <= 5) return { label: 'Strong', color: 'bg-brand-500', width: 75 };
  return { label: 'Very strong', color: 'bg-emerald-600', width: 100 };
}

export function PasswordGenerator() {
  const [length, setLength] = React.useState(16);
  const [opts, setOpts] = React.useState({ uppercase: true, lowercase: true, numbers: true, symbols: false });
  const [password, setPassword] = React.useState('');
  const [showPwd, setShowPwd] = React.useState(false);

  const generate = React.useCallback(() => {
    setPassword(generateSecurePassword(length, opts));
  }, [length, opts]);

  React.useEffect(() => { generate(); }, [generate]);

  const strength = calcStrength(password);

  return (
    <div className="space-y-6">
      <div className="px-3 py-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
        Passwords are generated using <code>crypto.getRandomValues()</code> — cryptographically secure. Nothing is sent anywhere.
      </div>

      {/* Password Display */}
      {password && (
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
          <code className={`flex-1 text-lg font-mono text-gray-900 tracking-widest break-all ${!showPwd ? 'filter blur-sm select-none' : ''}`}>
            {password}
          </code>
          <button onClick={() => setShowPwd(!showPwd)} className="p-2 text-gray-400 hover:text-gray-600" aria-label={showPwd ? 'Hide password' : 'Show password'}>
            {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
          <CopyButton text={password} />
        </div>
      )}

      {/* Strength meter */}
      {password && (
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Strength</span>
            <span className="font-semibold">{strength.label}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: `${strength.width}%` }} />
          </div>
        </div>
      )}

      <RangeSlider label="Password length" valueLabel={`${length} characters`} min={8} max={64} value={length} onChange={(e) => setLength(Number(e.target.value))} id="pwd-length" />

      <div className="grid grid-cols-2 gap-2">
        <Checkbox label="Uppercase (A-Z)" checked={opts.uppercase} onChange={(e) => setOpts((o) => ({ ...o, uppercase: e.target.checked }))} id="opt-upper" />
        <Checkbox label="Lowercase (a-z)" checked={opts.lowercase} onChange={(e) => setOpts((o) => ({ ...o, lowercase: e.target.checked }))} id="opt-lower" />
        <Checkbox label="Numbers (0-9)" checked={opts.numbers} onChange={(e) => setOpts((o) => ({ ...o, numbers: e.target.checked }))} id="opt-nums" />
        <Checkbox label="Symbols (!@#$…)" checked={opts.symbols} onChange={(e) => setOpts((o) => ({ ...o, symbols: e.target.checked }))} id="opt-syms" />
      </div>

      <Button onClick={generate}>
        <RefreshCw className="size-4" /> Generate new password
      </Button>
    </div>
  );
}
