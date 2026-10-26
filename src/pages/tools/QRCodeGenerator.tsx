import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, QrCode, Sliders, Check } from 'lucide-react';
import { Button, Input, Select, RangeSlider } from '../../components/ui/FormElements';
import { downloadDataUrl, copyToClipboard } from '../../utils/file';

export function QRCodeGenerator() {
  const [text, setText] = useState<string>('https://zenvio.io');
  const [size, setSize] = useState<number>(300);
  const [margin, setMargin] = useState<number>(2);
  const [darkColor, setDarkColor] = useState<string>('#000000');
  const [lightColor, setLightColor] = useState<string>('#ffffff');
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!text.trim()) {
      setQrDataUrl('');
      return;
    }

    QRCode.toDataURL(text, {
      width: size,
      margin,
      errorCorrectionLevel: errorLevel,
      color: {
        dark: darkColor,
        light: lightColor,
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error(err));
  }, [text, size, margin, darkColor, lightColor, errorLevel]);

  const handleCopy = async () => {
    await copyToClipboard(qrDataUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-teal-500" /> QR Code Configuration
          </h3>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
              Content or URL
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none"
              placeholder="Enter text, URL, phone number..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
                QR Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={darkColor}
                  onChange={(e) => setDarkColor(e.target.value)}
                  className="w-9 h-9 rounded cursor-pointer border"
                />
                <span className="text-xs font-mono">{darkColor}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Background
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={lightColor}
                  onChange={(e) => setLightColor(e.target.value)}
                  className="w-9 h-9 rounded cursor-pointer border"
                />
                <span className="text-xs font-mono">{lightColor}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
              Error Correction Level
            </label>
            <Select
              value={errorLevel}
              onChange={(e) => setErrorLevel(e.target.value as any)}
              options={[
                { value: 'L', label: 'Low (~7% recovery)' },
                { value: 'M', label: 'Medium (~15% recovery)' },
                { value: 'Q', label: 'Quartile (~25% recovery)' },
                { value: 'H', label: 'High (~30% recovery)' },
              ]}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-500">
              <span>Size: {size} px</span>
            </div>
            <RangeSlider
              min={150}
              max={600}
              step={10}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Preview & Download */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider self-start mb-4">
            Live Preview
          </span>

          <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner flex items-center justify-center">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code" className="max-w-[280px] rounded shadow-md" />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                Enter text to render QR
              </div>
            )}
          </div>

          <div className="flex gap-3 w-full mt-6">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 justify-center"
              onClick={handleCopy}
              disabled={!qrDataUrl}
            >
              {copied ? <Check className="w-4 h-4 mr-2 text-emerald-500" /> : <Copy className="w-4 h-4 mr-2" />}
              Copy Data URL
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1 justify-center"
              onClick={() => qrDataUrl && downloadDataUrl(qrDataUrl, 'qrcode.png')}
              disabled={!qrDataUrl}
            >
              <Download className="w-5 h-5 mr-2" /> Download PNG
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
