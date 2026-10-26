import React from 'react';
import { Download } from 'lucide-react';
import { DropZone, FileListItem } from '../../components/ui/FileUpload';
import { Button, Input, Select, Checkbox } from '../../components/ui/FormElements';
import { formatBytes, downloadBlob, loadImageFromFile } from '../../utils/file';

export function ImageResizer() {
  const [file, setFile] = React.useState<File | null>(null);
  const [imgDims, setImgDims] = React.useState({ w: 0, h: 0 });
  const [width, setWidth] = React.useState('');
  const [height, setHeight] = React.useState('');
  const [unit, setUnit] = React.useState<'px' | 'percent'>('px');
  const [keepRatio, setKeepRatio] = React.useState(true);
  const [result, setResult] = React.useState<{ blob: Blob; url: string; w: number; h: number } | null>(null);
  const [status, setStatus] = React.useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = React.useState('');

  const handleFiles = async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setResult(null);
    setStatus('idle');
    setError('');
    const img = await loadImageFromFile(f);
    setImgDims({ w: img.naturalWidth, h: img.naturalHeight });
    setWidth(String(img.naturalWidth));
    setHeight(String(img.naturalHeight));
  };

  const handleWidthChange = (val: string) => {
    setWidth(val);
    if (keepRatio && unit === 'px' && imgDims.w > 0) {
      const n = parseInt(val) || 0;
      setHeight(String(Math.round((n / imgDims.w) * imgDims.h)));
    }
  };

  const handleHeightChange = (val: string) => {
    setHeight(val);
    if (keepRatio && unit === 'px' && imgDims.h > 0) {
      const n = parseInt(val) || 0;
      setWidth(String(Math.round((n / imgDims.h) * imgDims.w)));
    }
  };

  const resize = async () => {
    if (!file) return;
    setStatus('processing');
    setError('');
    try {
      const img = await loadImageFromFile(file);
      let targetW = parseInt(width) || imgDims.w;
      let targetH = parseInt(height) || imgDims.h;

      if (unit === 'percent') {
        targetW = Math.round((imgDims.w * targetW) / 100);
        targetH = Math.round((imgDims.h * targetH) / 100);
      }

      if (targetW <= 0 || targetH <= 0 || targetW > 10000 || targetH > 10000) {
        throw new Error('Invalid dimensions. Width and height must be between 1 and 10000 pixels.');
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetW, targetH);

      const mimeType = file.type || 'image/jpeg';
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Resize failed'))), mimeType, 0.9)
      );

      setResult({ blob, url: URL.createObjectURL(blob), w: targetW, h: targetH });
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Resize failed. Please try again.');
      setStatus('error');
    }
  };

  const handleDownload = () => {
    if (!result || !file) return;
    const ext = file.name.split('.').pop() || 'jpg';
    downloadBlob(result.blob, `resized-${file.name.replace(/\.[^.]+$/, '')}.${ext}`);
  };

  const reset = () => {
    if (result?.url) URL.revokeObjectURL(result.url);
    setFile(null); setResult(null); setStatus('idle'); setError('');
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <DropZone onFiles={handleFiles} accept="image/*" maxSizeMB={50} hint="Supports JPG, PNG, WebP, GIF — up to 50 MB" />
      ) : (
        <div className="space-y-5">
          <FileListItem file={file} onRemove={reset} status={status === 'processing' ? 'processing' : 'pending'}
            statusMessage={`${imgDims.w} × ${imgDims.h} px — ${formatBytes(file.size)}`} />

          <div className="flex gap-3 items-center flex-wrap">
            <Select
              label="Unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value as 'px' | 'percent')}
              options={[{ value: 'px', label: 'Pixels (px)' }, { value: 'percent', label: 'Percentage (%)' }]}
              id="unit-select"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label={unit === 'px' ? 'Width (px)' : 'Width (%)'} type="number" min={1} max={unit === 'px' ? 10000 : 1000} value={width}
              onChange={(e) => handleWidthChange(e.target.value)} id="width-input" />
            <Input label={unit === 'px' ? 'Height (px)' : 'Height (%)'} type="number" min={1} max={unit === 'px' ? 10000 : 1000} value={height}
              onChange={(e) => handleHeightChange(e.target.value)} id="height-input" />
          </div>

          <Checkbox label="Maintain aspect ratio" checked={keepRatio} onChange={(e) => setKeepRatio(e.target.checked)} id="keep-ratio" />

          {error && <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700" role="alert">{error}</div>}

          {result && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Resize complete</p>
                  <p className="text-xs text-emerald-700 mt-0.5">{result.w} × {result.h} px — {formatBytes(result.blob.size)}</p>
                </div>
                <Button onClick={handleDownload} size="sm"><Download className="size-4" /> Download</Button>
              </div>
              <img src={result.url} alt="Resized preview" className="mt-3 max-h-40 rounded-lg object-contain mx-auto" />
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={resize} loading={status === 'processing'} disabled={status === 'processing'}>
              Resize Image
            </Button>
            <Button variant="ghost" onClick={reset}>Start over</Button>
          </div>
        </div>
      )}
    </div>
  );
}
