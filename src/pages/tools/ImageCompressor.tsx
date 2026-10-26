import React from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { DropZone, FileListItem } from '../../components/ui/FileUpload';
import { Button, RangeSlider } from '../../components/ui/FormElements';
import { formatBytes, downloadBlob, loadImageFromFile } from '../../utils/file';

export function ImageCompressor() {
  const [file, setFile] = React.useState<File | null>(null);
  const [quality, setQuality] = React.useState(80);
  const [result, setResult] = React.useState<{ blob: Blob; url: string; size: number } | null>(null);
  const [status, setStatus] = React.useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = React.useState('');

  const handleFiles = (files: File[]) => {
    setFile(files[0]);
    setResult(null);
    setStatus('idle');
    setError('');
  };

  const compress = async () => {
    if (!file) return;
    setStatus('processing');
    setError('');

    try {
      const img = await loadImageFromFile(file);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      // Determine output format
      const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const q = mimeType === 'image/png' ? undefined : quality / 100;

      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Compression failed'))),
          mimeType,
          q
        )
      );

      const url = URL.createObjectURL(blob);
      setResult({ blob, url, size: blob.size });
      setStatus('success');
    } catch {
      setError('Failed to compress image. Please try a different file.');
      setStatus('error');
    }
  };

  const handleDownload = () => {
    if (!result || !file) return;
    const ext = file.type === 'image/png' ? 'png' : 'jpg';
    downloadBlob(result.blob, `compressed-${file.name.replace(/\.[^.]+$/, '')}.${ext}`);
  };

  const reset = () => {
    if (result?.url) URL.revokeObjectURL(result.url);
    setFile(null);
    setResult(null);
    setStatus('idle');
    setError('');
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <DropZone
          onFiles={handleFiles}
          accept="image/jpeg,image/png,image/webp"
          maxSizeMB={50}
          hint="Supports JPG, PNG, WebP — up to 50 MB"
        />
      ) : (
        <div className="space-y-5">
          <FileListItem
            file={file}
            onRemove={reset}
            status={status === 'processing' ? 'processing' : 'pending'}
            statusMessage={`Original: ${formatBytes(file.size)}`}
          />

          {/* Quality Slider (only for non-PNG) */}
          {file.type !== 'image/png' && (
            <RangeSlider
              label="Quality"
              valueLabel={`${quality}%`}
              id="quality-slider"
              min={10}
              max={100}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
            />
          )}
          {file.type === 'image/png' && (
            <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              PNG files use lossless compression. Quality slider is not applicable.
            </p>
          )}

          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Compression complete</p>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    {formatBytes(file.size)} → {formatBytes(result.size)}
                    {' '}
                    <span className="font-bold">
                      ({Math.max(0, Math.round((1 - result.size / file.size) * 100))}% smaller)
                    </span>
                  </p>
                  {result.size > file.size && (
                    <p className="text-xs text-amber-700 mt-1">
                      Note: Output is larger than the original. Try increasing quality or use the original.
                    </p>
                  )}
                </div>
                <Button onClick={handleDownload} size="sm">
                  <Download className="size-4" />
                  Download
                </Button>
              </div>
              <div className="mt-3">
                <img src={result.url} alt="Compressed preview" className="max-h-48 rounded-lg object-contain mx-auto" />
              </div>
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            {status !== 'success' && (
              <Button onClick={compress} loading={status === 'processing'} disabled={status === 'processing'}>
                Compress Image
              </Button>
            )}
            {status === 'success' && (
              <Button onClick={compress} variant="secondary">
                <RefreshCw className="size-4" /> Recompress
              </Button>
            )}
            <Button variant="ghost" onClick={reset}>
              Start over
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
