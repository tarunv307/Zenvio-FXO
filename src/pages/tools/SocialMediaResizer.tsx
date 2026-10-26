import React, { useState, useEffect } from 'react';
import { Download, Sliders, Smartphone, Monitor } from 'lucide-react';
import { FileUploadZone } from '../../components/ui/FileUpload';
import { Button, Select } from '../../components/ui/FormElements';
import { downloadDataUrl } from '../../utils/file';

interface Preset {
  id: string;
  platform: string;
  name: string;
  width: number;
  height: number;
}

const PRESETS: Preset[] = [
  { id: 'ig-square', platform: 'Instagram', name: 'Square Post (1080 x 1080)', width: 1080, height: 1080 },
  { id: 'ig-portrait', platform: 'Instagram', name: 'Portrait Post (1080 x 1350)', width: 1080, height: 1350 },
  { id: 'ig-story', platform: 'Instagram', name: 'Story / Reel (1080 x 1920)', width: 1080, height: 1920 },
  { id: 'yt-thumb', platform: 'YouTube', name: 'Video Thumbnail (1280 x 720)', width: 1280, height: 720 },
  { id: 'yt-banner', platform: 'YouTube', name: 'Channel Banner (2560 x 1440)', width: 2560, height: 1440 },
  { id: 'x-post', platform: 'Twitter / X', name: 'Single Image Post (1200 x 675)', width: 1200, height: 675 },
  { id: 'x-header', platform: 'Twitter / X', name: 'Profile Header (1500 x 500)', width: 1500, height: 500 },
  { id: 'li-post', platform: 'LinkedIn', name: 'Feed Post (1200 x 627)', width: 1200, height: 627 },
  { id: 'li-banner', platform: 'LinkedIn', name: 'Profile Cover (1584 x 396)', width: 1584, height: 396 },
  { id: 'fb-post', platform: 'Facebook', name: 'Shared Image (1200 x 630)', width: 1200, height: 630 },
  { id: 'fb-cover', platform: 'Facebook', name: 'Page Cover (820 x 312)', width: 820, height: 312 },
];

export function SocialMediaResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('ig-square');
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>('cover');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const selectedPreset = PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0];

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
      canvas.width = selectedPreset.width;
      canvas.height = selectedPreset.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Fill background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const srcAspect = img.naturalWidth / img.naturalHeight;
      const targetAspect = canvas.width / canvas.height;

      let drawW = canvas.width;
      let drawH = canvas.height;
      let drawX = 0;
      let drawY = 0;

      if (fitMode === 'cover') {
        if (srcAspect > targetAspect) {
          drawW = canvas.height * srcAspect;
          drawX = (canvas.width - drawW) / 2;
        } else {
          drawH = canvas.width / srcAspect;
          drawY = (canvas.height - drawH) / 2;
        }
      } else {
        // contain
        if (srcAspect > targetAspect) {
          drawH = canvas.width / srcAspect;
          drawY = (canvas.height - drawH) / 2;
        } else {
          drawW = canvas.height * srcAspect;
          drawX = (canvas.width - drawW) / 2;
        }
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      setResultUrl(canvas.toDataURL('image/png'));
    };
  }, [imgUrl, selectedPreset, fitMode, bgColor]);

  return (
    <div className="space-y-6">
      {!imgUrl ? (
        <FileUploadZone
          accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
          onFilesSelect={handleFileSelect}
          label="Drop an image to resize for social media"
          description="Supports Instagram, YouTube, Twitter / X, LinkedIn, Facebook"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-500" /> Format & Preset
            </h3>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Platform Preset
              </label>
              <Select
                value={selectedPresetId}
                onChange={(e) => setSelectedPresetId(e.target.value)}
                options={PRESETS.map((p) => ({
                  value: p.id,
                  label: `[${p.platform}] ${p.name}`,
                }))}
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Fit Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={fitMode === 'cover' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFitMode('cover')}
                >
                  Fill / Crop
                </Button>
                <Button
                  variant={fitMode === 'contain' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFitMode('contain')}
                >
                  Fit Entire Image
                </Button>
              </div>
            </div>

            {fitMode === 'contain' && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
                  Background Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border border-slate-300 dark:border-slate-600"
                  />
                  <span className="text-sm font-mono text-slate-600 dark:text-slate-300 uppercase">
                    {bgColor}
                  </span>
                </div>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4"
              onClick={() => {
                setFile(null);
                setImgUrl(null);
                setResultUrl(null);
              }}
            >
              Choose Another Image
            </Button>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-between">
            <div className="w-full flex justify-between items-center mb-4">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {selectedPreset.platform} — {selectedPreset.width} × {selectedPreset.height} px
              </span>
            </div>

            <div className="w-full h-80 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 p-2">
              {resultUrl && (
                <img
                  src={resultUrl}
                  alt="Result preview"
                  className="max-h-full max-w-full object-contain shadow rounded"
                />
              )}
            </div>

            {resultUrl && (
              <Button
                variant="primary"
                size="lg"
                className="w-full justify-center mt-6"
                onClick={() => downloadDataUrl(resultUrl, `${selectedPreset.id}.png`)}
              >
                <Download className="w-5 h-5 mr-2" /> Download Resized Image ({selectedPreset.width}x{selectedPreset.height})
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
