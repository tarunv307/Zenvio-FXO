import React from 'react';
import { Download } from 'lucide-react';
import { DropZone, FileListItem } from '../../components/ui/FileUpload';
import { Button, Select } from '../../components/ui/FormElements';
import { downloadBlob, loadImageFromFile } from '../../utils/file';

export function ImageCropper() {
  const [file, setFile] = React.useState<File | null>(null);
  const [imgUrl, setImgUrl] = React.useState('');
  const [imgDims, setImgDims] = React.useState({ w: 0, h: 0 });
  const [x, setX] = React.useState(0);
  const [y, setY] = React.useState(0);
  const [cropW, setCropW] = React.useState(0);
  const [cropH, setCropH] = React.useState(0);
  const [aspect, setAspect] = React.useState('free');
  const [result, setResult] = React.useState<{ blob: Blob; url: string } | null>(null);
  const [status, setStatus] = React.useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = React.useState('');

  const ASPECT_PRESETS: Record<string, [number, number] | null> = {
    free: null,
    '1:1': [1, 1],
    '4:3': [4, 3],
    '16:9': [16, 9],
    '3:2': [3, 2],
    '2:3': [2, 3],
    '9:16': [9, 16],
    'passport': [35, 45],
  };

  const handleFiles = async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setResult(null);
    setStatus('idle');
    setError('');
    const url = URL.createObjectURL(f);
    setImgUrl(url);
    const img = await loadImageFromFile(f);
    setImgDims({ w: img.naturalWidth, h: img.naturalHeight });
    setCropW(img.naturalWidth);
    setCropH(img.naturalHeight);
    setX(0);
    setY(0);
  };

  const handleAspectChange = (val: string) => {
    setAspect(val);
    const preset = ASPECT_PRESETS[val];
    if (preset && imgDims.w > 0) {
      const [aw, ah] = preset;
      const newH = Math.round((cropW * ah) / aw);
      if (newH <= imgDims.h) {
        setCropH(newH);
      } else {
        const newW = Math.round((imgDims.h * aw) / ah);
        setCropW(newW);
        setCropH(imgDims.h);
      }
    }
  };

  const crop = async () => {
    if (!file) return;
    setStatus('processing');
    try {
      const img = await loadImageFromFile(file);
      const canvas = document.createElement('canvas');
      const safeX = Math.max(0, Math.min(x, imgDims.w - 1));
      const safeY = Math.max(0, Math.min(y, imgDims.h - 1));
      const safeW = Math.max(1, Math.min(cropW, imgDims.w - safeX));
      const safeH = Math.max(1, Math.min(cropH, imgDims.h - safeY));
      canvas.width = safeW;
      canvas.height = safeH;
      canvas.getContext('2d')!.drawImage(img, safeX, safeY, safeW, safeH, 0, 0, safeW, safeH);
      const blob = await new Promise<Blob>((res, rej) =>
        canvas.toBlob((b) => b ? res(b) : rej(new Error('Crop failed')), 'image/jpeg', 0.95)
      );
      setResult({ blob, url: URL.createObjectURL(blob) });
      setStatus('success');
    } catch {
      setError('Crop failed. Please check your values and try again.');
      setStatus('error');
    }
  };

  const reset = () => {
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    if (result?.url) URL.revokeObjectURL(result.url);
    setFile(null); setImgUrl(''); setResult(null); setStatus('idle'); setError('');
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <DropZone onFiles={handleFiles} accept="image/*" maxSizeMB={50} hint="Supports JPG, PNG, WebP — up to 50 MB" />
      ) : (
        <div className="space-y-5">
          <FileListItem file={file} onRemove={reset} status={status === 'processing' ? 'processing' : 'pending'}
            statusMessage={`${imgDims.w} × ${imgDims.h} px`} />

          {imgUrl && (
            <div className="relative">
              <img src={imgUrl} alt="Crop preview" className="w-full max-h-64 object-contain rounded-lg border border-gray-200" />
            </div>
          )}

          <Select label="Aspect Ratio Preset" value={aspect} onChange={(e) => handleAspectChange(e.target.value)}
            id="aspect-select"
            options={[
              { value: 'free', label: 'Free (custom)' },
              { value: '1:1', label: '1:1 (Square)' },
              { value: '4:3', label: '4:3 (Photo)' },
              { value: '16:9', label: '16:9 (Widescreen)' },
              { value: '3:2', label: '3:2 (DSLR)' },
              { value: '2:3', label: '2:3 (Portrait)' },
              { value: '9:16', label: '9:16 (Mobile)' },
              { value: 'passport', label: '35×45mm (Passport)' },
            ]} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Crop X (px)</label>
              <input type="number" min={0} max={imgDims.w - 1} value={x} onChange={(e) => setX(Number(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Crop Y (px)</label>
              <input type="number" min={0} max={imgDims.h - 1} value={y} onChange={(e) => setY(Number(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Width (px)</label>
              <input type="number" min={1} max={imgDims.w} value={cropW} onChange={(e) => setCropW(Number(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Height (px)</label>
              <input type="number" min={1} max={imgDims.h} value={cropH} onChange={(e) => setCropH(Number(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>

          {error && <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700" role="alert">{error}</div>}

          {result && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                <p className="text-sm font-semibold text-emerald-800">Crop complete — {cropW} × {cropH} px</p>
                <Button onClick={() => downloadBlob(result.blob, `cropped-${file.name}`)} size="sm">
                  <Download className="size-4" /> Download
                </Button>
              </div>
              <img src={result.url} alt="Cropped result" className="max-h-48 rounded-lg object-contain mx-auto" />
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={crop} loading={status === 'processing'} disabled={status === 'processing'}>Crop Image</Button>
            <Button variant="ghost" onClick={reset}>Start over</Button>
          </div>
        </div>
      )}
    </div>
  );
}
