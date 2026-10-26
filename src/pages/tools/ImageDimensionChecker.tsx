import React, { useState } from 'react';
import { Eye, Info, CheckCircle2 } from 'lucide-react';
import { FileUploadZone } from '../../components/ui/FileUpload';
import { Button } from '../../components/ui/FormElements';
import { formatBytes } from '../../utils/file';

interface DimensionInfo {
  width: number;
  height: number;
  aspectRatio: string;
  orientation: 'Landscape' | 'Portrait' | 'Square';
  megaPixels: string;
  size: string;
  type: string;
  name: string;
}

export function ImageDimensionChecker() {
  const [info, setInfo] = useState<DimensionInfo | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      setImgUrl(url);

      const img = new Image();
      img.src = url;
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const div = gcd(w, h);
        const aspect = `${w / div}:${h / div}`;
        const mp = ((w * h) / 1000000).toFixed(2);
        const orientation = w > h ? 'Landscape' : w < h ? 'Portrait' : 'Square';

        setInfo({
          width: w,
          height: h,
          aspectRatio: aspect,
          orientation,
          megaPixels: mp,
          size: formatBytes(file.size),
          type: file.type || 'image/unknown',
          name: file.name,
        });
      };
    }
  };

  return (
    <div className="space-y-6">
      {!info ? (
        <FileUploadZone
          accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'] }}
          onFilesSelect={handleFileSelect}
          label="Drop an image to inspect dimensions & resolution"
          description="Instant analysis of width, height, aspect ratio, orientation, and megapixels"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center">
            <h3 className="text-sm font-semibold text-slate-500 mb-3 self-start">Image Preview</h3>
            {imgUrl && (
              <img
                src={imgUrl}
                alt="Uploaded"
                className="max-h-72 object-contain rounded-xl border border-slate-100 dark:border-slate-700 shadow"
              />
            )}
            <Button
              variant="outline"
              size="sm"
              className="mt-6"
              onClick={() => {
                setInfo(null);
                setImgUrl(null);
              }}
            >
              Analyze Another Image
            </Button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" /> Dimension Details
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-500 uppercase">Width</span>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{info.width} px</p>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-500 uppercase">Height</span>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{info.height} px</p>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-500 uppercase">Aspect Ratio</span>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{info.aspectRatio}</p>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-500 uppercase">Resolution</span>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{info.megaPixels} MP</p>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-500 uppercase">Orientation</span>
                <p className="text-base font-semibold text-slate-800 dark:text-slate-100">{info.orientation}</p>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-500 uppercase">File Size</span>
                <p className="text-base font-semibold text-slate-800 dark:text-slate-100">{info.size}</p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-300">
              <span className="font-semibold block mb-1">Standard Match / Category:</span>
              {info.width >= 3840 ? '4K Ultra High Definition' : info.width >= 1920 ? '1080p Full HD' : info.width >= 1280 ? '720p HD' : 'Standard Web Resolution'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
