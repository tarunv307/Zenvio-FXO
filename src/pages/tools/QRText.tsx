import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, AlignLeft } from 'lucide-react';
import { Button, RangeSlider } from '../../components/ui/FormElements';
import { downloadDataUrl, copyToClipboard } from '../../utils/file';

export function QRText() {
  const [text, setText] = useState<string>('Welcome to Zenvio FXO — The complete online utility suite.');
  const [size, setSize] = useState<number>(300);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!text.trim()) {
      setQrUrl('');
      return;
    }

    QRCode.toDataURL(text.trim(), {
      width: size,
      margin: 2,
      color: {
        dark: '#1e293b',
        light: '#ffffff',
      },
    })
      .then((data) => setQrUrl(data))
      .catch((err) => console.error(err));
  }, [text, size]);

  const handleCopy = async () => {
    await copyToClipboard(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl space-y-5">
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <AlignLeft className="w-5 h-5 text-teal-600" /> Plain Text to QR Code
        </h3>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
            Text / Message Content
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none"
            placeholder="Type your message or notes..."
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
            <img src={qrUrl} alt="Text QR" className="max-w-[240px] rounded shadow-md" />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
              Type text to render QR
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
            onClick={() => qrUrl && downloadDataUrl(qrUrl, 'text-qr.png')}
            disabled={!qrUrl}
          >
            <Download className="w-4 h-4 mr-2" /> Download PNG
          </Button>
        </div>
      </div>
    </div>
  );
}
