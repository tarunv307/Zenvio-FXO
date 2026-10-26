import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, Wifi, Eye, EyeOff } from 'lucide-react';
import { Input, Select, Button } from '../../components/ui/FormElements';
import { downloadDataUrl, copyToClipboard } from '../../utils/file';

export function QRWifi() {
  const [ssid, setSsid] = useState<string>('Zenvio-Guest');
  const [password, setPassword] = useState<string>('SecureGuest2026');
  const [authType, setAuthType] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [hidden, setHidden] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!ssid.trim()) {
      setQrUrl('');
      return;
    }

    // Standard Wi-Fi QR Code string:
    // WIFI:T:WPA;S:MyNetwork;P:MyPassword;H:false;;
    const escapeSpecial = (str: string) => str.replace(/([\\;,:"])/g, '\\$1');
    const wifiString = `WIFI:T:${authType};S:${escapeSpecial(ssid)};${
      authType !== 'nopass' ? `P:${escapeSpecial(password)};` : ''
    }H:${hidden};;`;

    QRCode.toDataURL(wifiString, {
      width: 320,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((data) => setQrUrl(data))
      .catch((err) => console.error(err));
  }, [ssid, password, authType, hidden]);

  const handleCopy = async () => {
    await copyToClipboard(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl space-y-5">
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Wifi className="w-5 h-5 text-teal-600" /> Wi-Fi Quick Connect QR Code
        </h3>
        <p className="text-xs text-slate-500">
          Guests can scan with any camera to instantly connect to Wi-Fi without typing credentials.
        </p>

        <div className="space-y-3">
          <Input label="Network Name (SSID)" value={ssid} onChange={(e) => setSsid(e.target.value)} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Security
              </label>
              <Select
                value={authType}
                onChange={(e) => setAuthType(e.target.value as any)}
                options={[
                  { value: 'WPA', label: 'WPA / WPA2 / WPA3' },
                  { value: 'WEP', label: 'WEP' },
                  { value: 'nopass', label: 'Open (No Password)' },
                ]}
              />
            </div>

            {authType !== 'nopass' && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={hidden}
              onChange={(e) => setHidden(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            Hidden Network (SSID broadcast disabled)
          </label>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
          {qrUrl ? (
            <img src={qrUrl} alt="WiFi QR" className="max-w-[240px] rounded shadow-md" />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
              Enter network name to render QR
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 justify-center" onClick={handleCopy} disabled={!qrUrl}>
            {copied ? <Check className="w-4 h-4 mr-2 text-emerald-500" /> : <Copy className="w-4 h-4 mr-2" />}
            Copy Image URL
          </Button>
          <Button
            variant="primary"
            className="flex-1 justify-center"
            onClick={() => qrUrl && downloadDataUrl(qrUrl, `wifi-${ssid}.png`)}
            disabled={!qrUrl}
          >
            <Download className="w-4 h-4 mr-2" /> Download Wi-Fi Sign (PNG)
          </Button>
        </div>
      </div>
    </div>
  );
}
