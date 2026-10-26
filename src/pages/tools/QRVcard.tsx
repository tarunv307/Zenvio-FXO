import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, Contact2 } from 'lucide-react';
import { Input, Button } from '../../components/ui/FormElements';
import { downloadDataUrl, copyToClipboard } from '../../utils/file';

export function QRVcard() {
  const [firstName, setFirstName] = useState<string>('Alex');
  const [lastName, setLastName] = useState<string>('Morgan');
  const [org, setOrg] = useState<string>('Zenvio');
  const [title, setTitle] = useState<string>('Chief Technology Officer');
  const [phone, setPhone] = useState<string>('+1 (555) 234-5678');
  const [email, setEmail] = useState<string>('alex.morgan@zenvio.io');
  const [url, setUrl] = useState<string>('https://zenvio.io');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!firstName.trim() && !lastName.trim()) {
      setQrUrl('');
      return;
    }

    const vcard = `BEGIN:VCARD
VERSION:3.0
N:${lastName};${firstName};;;
FN:${firstName} ${lastName}
ORG:${org}
TITLE:${title}
TEL;TYPE=CELL:${phone}
EMAIL:${email}
URL:${url}
END:VCARD`;

    QRCode.toDataURL(vcard, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0f766e',
        light: '#ffffff',
      },
    })
      .then((data) => setQrUrl(data))
      .catch((err) => console.error(err));
  }, [firstName, lastName, org, title, phone, email, url]);

  const handleCopy = async () => {
    await copyToClipboard(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl space-y-5">
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Contact2 className="w-5 h-5 text-teal-600" /> Digital vCard Business Card QR
        </h3>
        <p className="text-xs text-slate-500">
          Scanning this QR code prompts smartphones to save your contact card with full details.
        </p>

        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Company / Organization" value={org} onChange={(e) => setOrg(e.target.value)} />
            <Input label="Job Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <Input label="Website" value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
          {qrUrl ? (
            <img src={qrUrl} alt="vCard QR" className="max-w-[240px] rounded shadow-md" />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
              Enter name to render QR
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
            onClick={() => qrUrl && downloadDataUrl(qrUrl, `vcard-${firstName}-${lastName}.png`)}
            disabled={!qrUrl}
          >
            <Download className="w-4 h-4 mr-2" /> Download vCard QR
          </Button>
        </div>
      </div>
    </div>
  );
}
