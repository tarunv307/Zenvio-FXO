import React from 'react';
import { Download } from 'lucide-react';
import { DropZone, FileListItem } from '../../components/ui/FileUpload';
import { Button, Select } from '../../components/ui/FormElements';
import { downloadBlob, loadImageFromFile } from '../../utils/file';

const FORMATS = [
  { value: 'image/jpeg', label: 'JPG', ext: 'jpg' },
  { value: 'image/png', label: 'PNG', ext: 'png' },
  { value: 'image/webp', label: 'WebP', ext: 'webp' },
];

export function ImageFormatConverter() {
  const [file, setFile] = React.useState<File | null>(null);
  const [outputFormat, setOutputFormat] = React.useState('image/jpeg');
  const [result, setResult] = React.useState<{ blob: Blob; url: string } | null>(null);
  const [status, setStatus] = React.useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = React.useState('');

  const handleFiles = (files: File[]) => {
    setFile(files[0]);
    setResult(null);
    setStatus('idle');
    setError('');
    const currentFmt = files[0].type;
    const different = FORMATS.find((f) => f.value !== currentFmt);
    if (different) setOutputFormat(different.value);
  };

  const convert = async () => {
    if (!file) return;
    setStatus('processing');
    try {
      const img = await loadImageFromFile(file);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      // White background for JPEG (PNG may have transparency)
      if (outputFormat === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      const blob = await new Promise<Blob>((res, rej) =>
        canvas.toBlob((b) => b ? res(b) : rej(new Error('Conversion failed')), outputFormat, 0.95)
      );
      setResult({ blob, url: URL.createObjectURL(blob) });
      setStatus('success');
    } catch {
      setError('Conversion failed. Please try a different file or format.');
      setStatus('error');
    }
  };

  const ext = FORMATS.find((f) => f.value === outputFormat)?.ext || 'jpg';
  const reset = () => { setFile(null); setResult(null); setStatus('idle'); setError(''); };

  return (
    <div className="space-y-6">
      {!file ? (
        <DropZone onFiles={handleFiles} accept="image/*" maxSizeMB={50} hint="Supports JPG, PNG, WebP, GIF, BMP — up to 50 MB" />
      ) : (
        <div className="space-y-5">
          <FileListItem file={file} onRemove={reset} status={status === 'processing' ? 'processing' : 'pending'}
            statusMessage={`Format: ${file.type || 'unknown'}`} />

          <Select label="Convert to" value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)}
            id="output-format" options={FORMATS.map((f) => ({ value: f.value, label: f.label }))} />

          {file.type === outputFormat && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              The output format is the same as the input. Consider choosing a different format.
            </p>
          )}

          {error && <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700" role="alert">{error}</div>}

          {result && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                <p className="text-sm font-semibold text-emerald-800">Converted to {ext.toUpperCase()}</p>
                <Button size="sm" onClick={() => downloadBlob(result.blob, `converted-${file.name.replace(/\.[^.]+$/, '')}.${ext}`)}>
                  <Download className="size-4" /> Download {ext.toUpperCase()}
                </Button>
              </div>
              <img src={result.url} alt="Converted preview" className="max-h-40 rounded-lg object-contain mx-auto" />
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={convert} loading={status === 'processing'} disabled={status === 'processing'}>Convert</Button>
            <Button variant="ghost" onClick={reset}>Start over</Button>
          </div>
        </div>
      )}
    </div>
  );
}
