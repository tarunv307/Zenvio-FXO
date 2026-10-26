import React from 'react';
import { Upload, Download, RefreshCw, FileArchive, ArrowRight } from 'lucide-react';
import { FileUploadZone } from '../../components/ui/FileUpload';
import { Button, Input, Select } from '../../components/ui/FormElements';
import { formatBytes, downloadBlob } from '../../utils/file';

export function TargetSizeCompressor() {
  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [targetSize, setTargetSize] = React.useState<number>(100);
  const [unit, setUnit] = React.useState<'KB' | 'MB'>('KB');
  const [processing, setProcessing] = React.useState(false);
  const [compressedBlob, setCompressedBlob] = React.useState<Blob | null>(null);
  const [currentQuality, setCurrentQuality] = React.useState<number>(0.92);

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      const f = files[0];
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
      setCompressedBlob(null);
    }
  };

  const compressToTarget = async () => {
    if (!file || !previewUrl) return;
    setProcessing(true);

    try {
      const targetBytes = targetSize * (unit === 'MB' ? 1024 * 1024 : 1024);
      const img = new Image();
      img.src = previewUrl;
      await new Promise((res) => (img.onload = res));

      let minQ = 0.05;
      let maxQ = 0.98;
      let bestBlob: Blob | null = null;
      let bestDiff = Infinity;
      let chosenQ = 0.8;

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      ctx.drawImage(img, 0, 0);

      // Binary search quality iterations
      for (let i = 0; i < 7; i++) {
        const q = (minQ + maxQ) / 2;
        const b = await new Promise<Blob | null>((res) =>
          canvas.toBlob((blob) => res(blob), 'image/jpeg', q)
        );

        if (b) {
          const diff = Math.abs(b.size - targetBytes);
          if (diff < bestDiff || b.size <= targetBytes) {
            bestDiff = diff;
            bestBlob = b;
            chosenQ = q;
          }

          if (b.size > targetBytes) {
            maxQ = q;
          } else {
            minQ = q;
          }
        }
      }

      // If still bigger than target, downscale dimensions
      if (bestBlob && bestBlob.size > targetBytes) {
        let scale = 0.85;
        for (let j = 0; j < 4; j++) {
          const scaledCanvas = document.createElement('canvas');
          scaledCanvas.width = Math.round(img.naturalWidth * scale);
          scaledCanvas.height = Math.round(img.naturalHeight * scale);
          const sCtx = scaledCanvas.getContext('2d');
          if (sCtx) {
            sCtx.drawImage(img, 0, 0, scaledCanvas.width, scaledCanvas.height);
            const scaledBlob = await new Promise<Blob | null>((res) =>
              scaledCanvas.toBlob((blob) => res(blob), 'image/jpeg', 0.8)
            );
            if (scaledBlob) {
              bestBlob = scaledBlob;
              if (scaledBlob.size <= targetBytes) break;
            }
          }
          scale *= 0.8;
        }
      }

      setCompressedBlob(bestBlob);
      setCurrentQuality(chosenQ);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (compressedBlob && file) {
      const ext = 'jpg';
      const name = file.name.replace(/\.[^/.]+$/, '') + `-target-${targetSize}${unit}.${ext}`;
      downloadBlob(compressedBlob, name);
    }
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <FileUploadZone
          accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
          onFilesSelect={handleFileSelect}
          label="Drop an image to compress to target file size"
          description="Supports JPG, PNG, WEBP — up to 50MB"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center">
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3 self-start">
              Original ({formatBytes(file.size)})
            </h3>
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-72 object-contain rounded-xl border border-slate-100 dark:border-slate-700 shadow-inner"
              />
            )}
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setFile(null);
                setPreviewUrl(null);
                setCompressedBlob(null);
              }}
            >
              Choose Another Image
            </Button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
            <div className="space-y-5">
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <FileArchive className="w-5 h-5 text-blue-500" /> Compression Settings
              </h3>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Input
                    label="Desired Target File Size"
                    type="number"
                    min="10"
                    max="10000"
                    value={targetSize}
                    onChange={(e) => setTargetSize(Number(e.target.value))}
                  />
                </div>
                <div className="w-28 pt-6">
                  <Select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as 'KB' | 'MB')}
                    options={[
                      { value: 'KB', label: 'KB' },
                      { value: 'MB', label: 'MB' },
                    ]}
                  />
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full justify-center"
                onClick={compressToTarget}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Compressing to target...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 mr-2" /> Compress to ~{targetSize} {unit}
                  </>
                )}
              </Button>

              {compressedBlob && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2">
                  <div className="flex justify-between items-center text-sm font-medium text-emerald-800 dark:text-emerald-300">
                    <span>Result Size:</span>
                    <span className="font-bold text-base">{formatBytes(compressedBlob.size)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-emerald-700 dark:text-emerald-400">
                    <span>Reduction:</span>
                    <span>{Math.round((1 - compressedBlob.size / file.size) * 100)}% smaller</span>
                  </div>
                </div>
              )}
            </div>

            {compressedBlob && (
              <Button
                variant="primary"
                size="lg"
                className="w-full justify-center mt-6"
                onClick={handleDownload}
              >
                <Download className="w-5 h-5 mr-2" /> Download Compressed Image
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
