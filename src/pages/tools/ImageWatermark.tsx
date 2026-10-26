import React, { useState, useEffect } from 'react';
import { Download, Sliders, Type, Grid } from 'lucide-react';
import { FileUploadZone } from '../../components/ui/FileUpload';
import { Button, Input, RangeSlider, Select } from '../../components/ui/FormElements';
import { downloadDataUrl } from '../../utils/file';

export function ImageWatermark() {
  const [file, setFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState<number>(36);
  const [fontColor, setFontColor] = useState<string>('#ffffff');
  const [opacity, setOpacity] = useState<number>(0.5);
  const [position, setPosition] = useState<string>('center');
  const [tiled, setTiled] = useState<boolean>(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setImgUrl(URL.createObjectURL(files[0]));
    }
  };

  useEffect(() => {
    if (!imgUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imgUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = fontColor;
      ctx.font = `bold ${fontSize * (canvas.width / 800)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (tiled) {
        const stepX = 250;
        const stepY = 150;
        ctx.rotate((-25 * Math.PI) / 180);
        for (let x = -canvas.width; x < canvas.width * 2; x += stepX) {
          for (let y = -canvas.height; y < canvas.height * 2; y += stepY) {
            ctx.fillText(watermarkText, x, y);
          }
        }
      } else {
        let x = canvas.width / 2;
        let y = canvas.height / 2;

        if (position === 'top-left') {
          x = 100;
          y = 60;
          ctx.textAlign = 'left';
        } else if (position === 'top-right') {
          x = canvas.width - 100;
          y = 60;
          ctx.textAlign = 'right';
        } else if (position === 'bottom-left') {
          x = 100;
          y = canvas.height - 60;
          ctx.textAlign = 'left';
        } else if (position === 'bottom-right') {
          x = canvas.width - 100;
          y = canvas.height - 60;
          ctx.textAlign = 'right';
        }

        ctx.fillText(watermarkText, x, y);
      }

      ctx.restore();
      setResultUrl(canvas.toDataURL('image/png'));
    };
  }, [imgUrl, watermarkText, fontSize, fontColor, opacity, position, tiled]);

  return (
    <div className="space-y-6">
      {!imgUrl ? (
        <FileUploadZone
          accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
          onFilesSelect={handleFileSelect}
          label="Drop an image to add a custom watermark"
          description="Protect your visual assets with custom text or tiled watermarks"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-500" /> Watermark Settings
            </h3>

            <div>
              <Input
                label="Watermark Text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
                  Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fontColor}
                    onChange={(e) => setFontColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border border-slate-300 dark:border-slate-600"
                  />
                  <span className="text-xs font-mono">{fontColor}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
                  Mode
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={!tiled ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setTiled(false)}
                  >
                    Single
                  </Button>
                  <Button
                    variant={tiled ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setTiled(true)}
                  >
                    Tiled
                  </Button>
                </div>
              </div>
            </div>

            {!tiled && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
                  Position
                </label>
                <Select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  options={[
                    { value: 'center', label: 'Center' },
                    { value: 'bottom-right', label: 'Bottom Right' },
                    { value: 'bottom-left', label: 'Bottom Left' },
                    { value: 'top-right', label: 'Top Right' },
                    { value: 'top-left', label: 'Top Left' },
                  ]}
                />
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>Opacity: {Math.round(opacity * 100)}%</span>
              </div>
              <RangeSlider
                min={0.05}
                max={1}
                step={0.05}
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>Font Size: {fontSize}px</span>
              </div>
              <RangeSlider
                min={16}
                max={96}
                step={2}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4"
              onClick={() => {
                setFile(null);
                setImgUrl(null);
              }}
            >
              Choose Another Image
            </Button>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-between">
            <div className="w-full h-80 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 p-2">
              {resultUrl && (
                <img
                  src={resultUrl}
                  alt="Watermarked Preview"
                  className="max-h-full max-w-full object-contain shadow rounded"
                />
              )}
            </div>

            {resultUrl && (
              <Button
                variant="primary"
                size="lg"
                className="w-full justify-center mt-6"
                onClick={() => downloadDataUrl(resultUrl, `watermarked-${file?.name || 'image.png'}`)}
              >
                <Download className="w-5 h-5 mr-2" /> Download Watermarked Image
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
