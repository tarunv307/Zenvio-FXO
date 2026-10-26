import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, Globe, Link2 } from 'lucide-react';
import { Input, Button, RangeSlider } from '../../components/ui/FormElements';
import { downloadDataUrl, copyToClipboard } from '../../utils/file';

export function QRUrl() {
  const [url, setUrl] = useState<string>('https://zenvio.io');
  const [size, setSize] = useState<number>(300);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!url.trim()) {
      setQrUrl('');
      return;
    }

    QRCode.toDataURL(url.trim(), {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((data) => setQrUrl(data))
      .catch((err) => console.error(err));
  }, [url, size]);

  const handleCopy = async () => {
    await copyToClipboard(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl space-y-5">
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Link2 className="w-5 h-5 text-teal-600" /> Website URL to QR Code
        </h3>

        <div>
          <Input
            label="Target Web Address"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-500">
            <span>Size: {size} px</span>
          </div>
          <RangeSlider min={180} max={500} step={10} value={size} onChange={(e) => setSize(Number(e.target.value))} />
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
          {qrUrl ? (
            <img src={qrUrl} alt="URL QR" className="max-w-[240px] rounded shadow-md" />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
              Enter a valid URL to render QR code
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
            onClick={() => qrUrl && downloadDataUrl(qrUrl, 'url-qr.png')}
            disabled={!qrUrl}
          >
            <Download className="w-4 h-4 mr-2" /> Download PNG
          </Button>
        </div>
      </div>
    </div>
  );
}
