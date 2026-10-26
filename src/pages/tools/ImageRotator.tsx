import React from 'react';
import { Download } from 'lucide-react';
import { DropZone, FileListItem } from '../../components/ui/FileUpload';
import { Button, Select, Checkbox } from '../../components/ui/FormElements';
import { downloadBlob, loadImageFromFile } from '../../utils/file';

export function ImageRotator() {
  const [file, setFile] = React.useState<File | null>(null);
  const [imgUrl, setImgUrl] = React.useState('');
  const [rotation, setRotation] = React.useState(90);
  const [flipH, setFlipH] = React.useState(false);
  const [flipV, setFlipV] = React.useState(false);
  const [result, setResult] = React.useState<{ blob: Blob; url: string } | null>(null);
  const [status, setStatus] = React.useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = React.useState('');

  const handleFiles = (files: File[]) => {
    const f = files[0];
    setFile(f);
    setImgUrl(URL.createObjectURL(f));
    setResult(null);
    setStatus('idle');
    setError('');
  };

  const apply = async () => {
    if (!file) return;
    setStatus('processing');
    try {
      const img = await loadImageFromFile(file);
      const rad = (rotation * Math.PI) / 180;
      const isRotated90 = rotation % 180 !== 0;
      const canvasW = isRotated90 ? img.naturalHeight : img.naturalWidth;
      const canvasH = isRotated90 ? img.naturalWidth : img.naturalHeight;
      const canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext('2d')!;
      ctx.translate(canvasW / 2, canvasH / 2);
      ctx.rotate(rad);
      if (flipH) ctx.scale(-1, 1);
      if (flipV) ctx.scale(1, -1);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      const blob = await new Promise<Blob>((res, rej) =>
        canvas.toBlob((b) => b ? res(b) : rej(new Error('Failed')), 'image/jpeg', 0.95)
      );
      setResult({ blob, url: URL.createObjectURL(blob) });
      setStatus('success');
    } catch {
      setError('Processing failed. Please try again.');
      setStatus('error');
    }
  };

  const reset = () => {
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    setFile(null); setImgUrl(''); setResult(null); setStatus('idle'); setError('');
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <DropZone onFiles={handleFiles} accept="image/*" maxSizeMB={50} hint="Supports JPG, PNG, WebP — up to 50 MB" />
      ) : (
        <div className="space-y-5">
          <FileListItem file={file} onRemove={reset} status={status === 'processing' ? 'processing' : 'pending'} />

          {imgUrl && <img src={imgUrl} alt="Original" className="max-h-48 rounded-lg object-contain mx-auto border border-gray-200" />}

          <Select label="Rotation" value={String(rotation)} onChange={(e) => setRotation(Number(e.target.value))} id="rotation-select"
            options={[
              { value: '90', label: '90° Clockwise' },
              { value: '180', label: '180°' },
              { value: '270', label: '90° Counter-Clockwise' },
            ]} />

          <div className="flex flex-col gap-2">
            <Checkbox label="Flip horizontally (left–right mirror)" checked={flipH} onChange={(e) => setFlipH(e.target.checked)} id="flip-h" />
            <Checkbox label="Flip vertically (upside-down)" checked={flipV} onChange={(e) => setFlipV(e.target.checked)} id="flip-v" />
          </div>

          {error && <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700" role="alert">{error}</div>}

          {result && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                <p className="text-sm font-semibold text-emerald-800">Done!</p>
                <Button size="sm" onClick={() => downloadBlob(result.blob, `rotated-${file.name}`)}>
                  <Download className="size-4" /> Download
                </Button>
              </div>
              <img src={result.url} alt="Result" className="max-h-48 rounded-lg object-contain mx-auto" />
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={apply} loading={status === 'processing'} disabled={status === 'processing'}>Apply</Button>
            <Button variant="ghost" onClick={reset}>Start over</Button>
          </div>
        </div>
      )}
    </div>
  );
}
