import React, { useRef, useState } from 'react';
import { Pipette, Copy, Check } from 'lucide-react';
import { FileUploadZone } from '../../components/ui/FileUpload';
import { Button } from '../../components/ui/FormElements';
import { copyToClipboard } from '../../utils/file';

export function ImageColorPicker() {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [currentColor, setCurrentColor] = useState<{ hex: string; rgb: string; hsl: string }>({
    hex: '#3B82F6',
    rgb: 'rgb(59, 130, 246)',
    hsl: 'hsl(217, 91%, 60%)',
  });
  const [palette, setPalette] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      const url = URL.createObjectURL(files[0]);
      setImgUrl(url);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);

        // Sample palette
        const colors: Record<string, number> = {};
        const step = Math.max(1, Math.floor((canvas.width * canvas.height) / 1000));
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        for (let i = 0; i < imgData.length; i += step * 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
          colors[hex] = (colors[hex] || 0) + 1;
        }

        const topColors = Object.entries(colors)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([hex]) => hex);
        setPalette(topColors);
      };
    }
  };

  const handleCanvasInteraction = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const r = pixel[0],
      g = pixel[1],
      b = pixel[2];
    const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
    const rgb = `rgb(${r}, ${g}, ${b})`;
    const hsl = rgbToHsl(r, g, b);

    setCurrentColor({ hex, rgb, hsl });
  };

  const copyVal = async (key: string, val: string) => {
    await copyToClipboard(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {!imgUrl ? (
        <FileUploadZone
          accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
          onFilesSelect={handleFileSelect}
          label="Upload image to pick colors & extract palette"
          description="Click or hover anywhere on the image to inspect color values"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Pipette className="w-4 h-4 text-blue-500" /> Click or move cursor over the image
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setImgUrl(null);
                  setPalette([]);
                }}
              >
                Change Image
              </Button>
            </div>

            <div className="max-w-full overflow-auto max-h-[500px] flex justify-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 cursor-crosshair p-2">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasInteraction}
                onMouseMove={handleCanvasInteraction}
                className="max-h-[460px] object-contain shadow-sm rounded"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              Selected Color
            </h3>

            <div
              className="w-full h-24 rounded-2xl shadow-inner border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-colors"
              style={{ backgroundColor: currentColor.hex }}
            />

            <div className="space-y-3">
              {[
                { label: 'HEX', value: currentColor.hex },
                { label: 'RGB', value: currentColor.rgb },
                { label: 'HSL', value: currentColor.hsl },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <div className="text-xs font-mono font-semibold text-slate-500">{item.label}</div>
                  <div className="text-sm font-mono font-bold text-slate-800 dark:text-slate-100">
                    {item.value}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyVal(item.label, item.value)}
                  >
                    {copiedKey === item.label ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400" />
                    )}
                  </Button>
                </div>
              ))}
            </div>

            {palette.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  Dominant Palette
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {palette.map((color, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        setCurrentColor({
                          hex: color,
                          rgb: '',
                          hsl: '',
                        })
                      }
                      style={{ backgroundColor: color }}
                      className="h-10 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 hover:scale-105 transition-transform"
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
