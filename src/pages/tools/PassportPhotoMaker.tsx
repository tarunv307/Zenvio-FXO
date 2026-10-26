import React, { useRef, useState, useEffect } from 'react';
import { Download, RefreshCw, ZoomIn, ZoomOut, Check, Sliders } from 'lucide-react';
import { FileUploadZone } from '../../components/ui/FileUpload';
import { Button, Select, RangeSlider } from '../../components/ui/FormElements';
import { downloadDataUrl } from '../../utils/file';

interface CountryPreset {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  aspect: number;
}

const PRESETS: CountryPreset[] = [
  { id: 'us', name: 'United States (2 x 2 in / 51 x 51 mm)', widthMm: 51, heightMm: 51, aspect: 1 },
  { id: 'in', name: 'India (35 x 45 mm)', widthMm: 35, heightMm: 45, aspect: 35 / 45 },
  { id: 'uk', name: 'United Kingdom (35 x 45 mm)', widthMm: 35, heightMm: 45, aspect: 35 / 45 },
  { id: 'eu', name: 'Schengen / EU (35 x 45 mm)', widthMm: 35, heightMm: 45, aspect: 35 / 45 },
  { id: 'ca', name: 'Canada (50 x 70 mm)', widthMm: 50, heightMm: 70, aspect: 50 / 70 },
  { id: 'au', name: 'Australia (35 x 45 mm)', widthMm: 35, heightMm: 45, aspect: 35 / 45 },
];

export function PassportPhotoMaker() {
  const [file, setFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [preset, setPreset] = useState<string>('us');
  const [scale, setScale] = useState<number>(1);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [border, setBorder] = useState<boolean>(true);
  const [sheetPreview, setSheetPreview] = useState<string | null>(null);
  const [singlePreview, setSinglePreview] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const selectedPreset = PRESETS.find((p) => p.id === preset) || PRESETS[0];

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setImgUrl(URL.createObjectURL(files[0]));
      setScale(1);
      setOffsetX(0);
      setOffsetY(0);
    }
  };

  useEffect(() => {
    if (!imgUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imgUrl;
    img.onload = () => {
      // 300 DPI: 1 mm ~ 11.81 pixels
      const pxPerMm = 11.81;
      const targetW = Math.round(selectedPreset.widthMm * pxPerMm);
      const targetH = Math.round(selectedPreset.heightMm * pxPerMm);

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, targetW, targetH);

      // Draw image with scale & offsets
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const boxAspect = targetW / targetH;
      let drawW: number, drawH: number;

      if (imgAspect > boxAspect) {
        drawH = targetH * scale;
        drawW = drawH * imgAspect;
      } else {
        drawW = targetW * scale;
        drawH = drawW / imgAspect;
      }

      const x = (targetW - drawW) / 2 + offsetX;
      const y = (targetH - drawH) / 2 + offsetY;

      ctx.drawImage(img, x, y, drawW, drawH);

      if (border) {
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, targetW - 4, targetH - 4);
      }

      const singleUrl = canvas.toDataURL('image/jpeg', 0.95);
      setSinglePreview(singleUrl);

      // Create 4x6 inch print sheet (1200 x 1800 px at 300 DPI)
      const sheetCanvas = document.createElement('canvas');
      sheetCanvas.width = 1800;
      sheetCanvas.height = 1200;
      const sCtx = sheetCanvas.getContext('2d');
      if (sCtx) {
        sCtx.fillStyle = '#ffffff';
        sCtx.fillRect(0, 0, 1800, 1200);

        // Grid calculation
        const marginX = 80;
        const marginY = 80;
        const gap = 40;
        const cols = Math.floor((1800 - marginX * 2 + gap) / (targetW + gap)) || 1;
        const rows = Math.floor((1200 - marginY * 2 + gap) / (targetH + gap)) || 1;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const posX = marginX + c * (targetW + gap);
            const posY = marginY + r * (targetH + gap);
            sCtx.drawImage(canvas, posX, posY);
            sCtx.strokeStyle = '#e2e8f0';
            sCtx.lineWidth = 1;
            sCtx.strokeRect(posX, posY, targetW, targetH);
          }
        }
        setSheetPreview(sheetCanvas.toDataURL('image/jpeg', 0.95));
      }
    };
  }, [imgUrl, selectedPreset, scale, offsetX, offsetY, bgColor, border]);

  return (
    <div className="space-y-6">
      {!imgUrl ? (
        <FileUploadZone
          accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
          onFilesSelect={handleFileSelect}
          label="Upload a portrait photo for passport/visa"
          description="Clean headshot with neutral lighting works best"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-500" /> Photo Settings
            </h3>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Standard / Country
              </label>
              <Select
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
                options={PRESETS.map((p) => ({ value: p.id, label: p.name }))}
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Background Fill
              </label>
              <div className="flex gap-2">
                {[
                  { label: 'White', color: '#ffffff' },
                  { label: 'Light Blue', color: '#e0f2fe' },
                  { label: 'Off-White', color: '#f8fafc' },
                  { label: 'Light Gray', color: '#f1f5f9' },
                ].map((item) => (
                  <button
                    key={item.color}
                    onClick={() => setBgColor(item.color)}
                    style={{ backgroundColor: item.color }}
                    className={`w-10 h-10 rounded-xl border-2 transition-all ${
                      bgColor === item.color ? 'border-blue-600 scale-105 shadow-md' : 'border-slate-200 dark:border-slate-600'
                    }`}
                    title={item.label}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>Zoom / Scale: {Math.round(scale * 100)}%</span>
              </div>
              <RangeSlider min={0.5} max={2.5} step={0.05} value={scale} onChange={(e) => setScale(Number(e.target.value))} />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>Position X</span>
              </div>
              <RangeSlider min={-300} max={300} step={5} value={offsetX} onChange={(e) => setOffsetX(Number(e.target.value))} />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>Position Y</span>
              </div>
              <RangeSlider min={-300} max={300} step={5} value={offsetY} onChange={(e) => setOffsetY(Number(e.target.value))} />
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => {
                setFile(null);
                setImgUrl(null);
              }}
            >
              Choose Different Image
            </Button>
          </div>

          {/* Previews */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center justify-around gap-6">
              <div className="flex flex-col items-center">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Single Photo ({selectedPreset.widthMm} x {selectedPreset.heightMm} mm)
                </span>
                {singlePreview && (
                  <img
                    src={singlePreview}
                    alt="Single Passport Photo"
                    className="w-44 rounded-lg shadow-md border border-slate-200 dark:border-slate-600"
                  />
                )}
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-4"
                  onClick={() => singlePreview && downloadDataUrl(singlePreview, `passport-photo-${selectedPreset.id}.jpg`)}
                >
                  <Download className="w-4 h-4 mr-1.5" /> Download Single (300 DPI)
                </Button>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Print Sheet (4 x 6 in Grid)
                </span>
                {sheetPreview && (
                  <img
                    src={sheetPreview}
                    alt="Passport Photo Sheet"
                    className="w-64 rounded-lg shadow-md border border-slate-200 dark:border-slate-600"
                  />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => sheetPreview && downloadDataUrl(sheetPreview, `passport-sheet-4x6.jpg`)}
                >
                  <Download className="w-4 h-4 mr-1.5" /> Download 4x6 Sheet
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
