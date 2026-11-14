import React, { useState, useEffect } from 'react';
import { DropZone } from '../../components/ui/FileUpload';
import { ImageComparisonSlider } from '../../components/image/ImageComparisonSlider';
import { checkImageAIStatus, processImageViaServer, enhanceImageClientCanvas } from '../../lib/imageClient';
import { Sparkles, Sliders, AlertCircle, RefreshCw, Zap, ShieldCheck, SunMedium } from 'lucide-react';
import { formatBytes } from '../../utils/file';

export function ImageEnhancer() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [processedUrl, setProcessedUrl] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [engineMode, setEngineMode] = useState<'ai' | 'browser'>('ai');
  const [sharpness, setSharpness] = useState<number>(3);
  const [contrast, setContrast] = useState<number>(1.2);
  const [serverAIConfigured, setServerAIConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    checkImageAIStatus().then((status) => {
      setServerAIConfigured(status.configured);
      if (!status.configured) {
        setEngineMode('browser');
      }
    });
  }, []);

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(selected.type)) {
      setError('Please upload a valid PNG, JPG, JPEG, or WEBP image.');
      return;
    }

    setError('');
    setFile(selected);
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalUrl(e.target?.result as string);
      setProcessedUrl('');
    };
    reader.readAsDataURL(selected);
  };

  const handleProcess = async () => {
    if (!originalUrl) return;
    setProcessing(true);
    setError('');
    setProgress('Analyzing image clarity, edges, and color distribution…');

    try {
      if (engineMode === 'ai' && serverAIConfigured) {
        setProgress('Enhancing resolution & sharpness via Server AI Provider…');
        const res = await processImageViaServer({
          task: 'enhance',
          image: originalUrl,
        });

        if (res.ok && res.output) {
          setProcessedUrl(res.output);
        } else {
          setError(res.error || 'AI image enhancement failed.');
        }
      } else {
        setProgress('Applying high-pass unsharp mask and adaptive contrast in browser…');
        await new Promise((r) => setTimeout(r, 60));
        const output = await enhanceImageClientCanvas(originalUrl, {
          sharpness,
          contrast,
        });
        setProcessedUrl(output);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during image enhancement.');
    } finally {
      setProcessing(false);
      setProgress('');
    }
  };

  const handleReset = () => {
    setFile(null);
    setOriginalUrl('');
    setProcessedUrl('');
    setError('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Engine Selection & Status Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
            <Sparkles className="size-4 text-[#2563EB]" />
            Image Enhancement Engine
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Boost clarity, recover blurry details, and balance contrast.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setEngineMode('ai')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              engineMode === 'ai'
                ? 'bg-white text-[#2563EB] shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            AI Cloud API
          </button>
          <button
            type="button"
            onClick={() => setEngineMode('browser')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              engineMode === 'browser'
                ? 'bg-white text-[#2563EB] shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Browser High-Precision
          </button>
        </div>
      </div>

      {engineMode === 'ai' && serverAIConfigured === false && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">AI Enhancement API Key Not Configured on Server</p>
            <p className="text-amber-800 leading-relaxed">
              To use AI upscaling and deep-learning enhancement, configure <code>CLIPDROP_API_KEY</code> or{' '}
              <code>STABILITY_API_KEY</code> on your server. You can also use the <strong>Browser High-Precision</strong> mode to apply real Unsharp Mask convolution filters locally with zero latency.
            </p>
          </div>
        </div>
      )}

      {/* Upload or View */}
      {!originalUrl ? (
        <DropZone
          onFiles={handleFiles}
          accept="image/png,image/jpeg,image/webp"
          maxSizeMB={25}
          hint="Supports PNG, JPG, JPEG, WEBP up to 25 MB"
        />
      ) : (
        <div className="space-y-6">
          {/* File summary */}
          <div className="flex items-center justify-between p-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
                IMG
              </div>
              <div>
                <p className="font-semibold text-[#0F172A] truncate max-w-xs">{file?.name || 'Uploaded image'}</p>
                <p className="text-[#64748B]">{file ? formatBytes(file.size) : ''}</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="text-xs font-semibold text-[#DC2626] hover:underline"
            >
              Upload another
            </button>
          </div>

          {/* Engine Parameters */}
          {engineMode === 'browser' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white border border-[#E2E8F0] rounded-xl">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                    <Sliders className="size-3.5 text-[#2563EB]" /> Sharpness Intensity:
                  </span>
                  <span className="font-mono text-[#2563EB] font-bold">{sharpness}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={sharpness}
                  onChange={(e) => setSharpness(Number(e.target.value))}
                  className="w-full accent-[#2563EB]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                    <SunMedium className="size-3.5 text-[#2563EB]" /> Contrast Stretch:
                  </span>
                  <span className="font-mono text-[#2563EB] font-bold">{Math.round((contrast - 1) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="1.5"
                  step="0.05"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-[#2563EB]"
                />
              </div>
            </div>
          )}

          {/* Processing Trigger */}
          {!processedUrl && (
            <div className="text-center">
              <button
                type="button"
                onClick={handleProcess}
                disabled={processing}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#2563EB] text-white font-semibold rounded-xl hover:bg-[#1D4ED8] transition-colors shadow-sm disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" />
                    Enhancing Image…
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    Enhance Image Clarity
                  </>
                )}
              </button>
              {progress && <p className="mt-3 text-xs text-[#2563EB] animate-pulse">{progress}</p>}
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Comparison Slider */}
          {processedUrl && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                  <Sparkles className="size-4 text-[#16A34A]" />
                  Enhanced Image Comparison
                </h3>
                <button
                  onClick={handleProcess}
                  disabled={processing}
                  className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="size-3.5" /> Re-apply
                </button>
              </div>

              <ImageComparisonSlider
                originalSrc={originalUrl}
                processedSrc={processedUrl}
                originalLabel="Original Photo"
                processedLabel="Enhanced Clarity"
                downloadFilename={`${file?.name.replace(/\.[^/.]+$/, '') || 'image'}-enhanced.png`}
              />
            </div>
          )}
        </div>
      )}

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#E2E8F0] text-xs text-[#475569]">
        <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0]">
          <Zap className="size-5 text-[#2563EB] mb-2" />
          <h4 className="font-semibold text-[#0F172A] mb-1">Unsharp Mask Filtering</h4>
          <p>Advanced edge-preserving convolution highlights fine texture and restores softness.</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0]">
          <SunMedium className="size-5 text-[#2563EB] mb-2" />
          <h4 className="font-semibold text-[#0F172A] mb-1">Adaptive Contrast</h4>
          <p>Dynamically balances dynamic range without blowing out highlights or muddying shadows.</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0]">
          <ShieldCheck className="size-5 text-[#2563EB] mb-2" />
          <h4 className="font-semibold text-[#0F172A] mb-1">Private & Safe</h4>
          <p>Direct browser processing ensures complete confidentiality for sensitive photos.</p>
        </div>
      </div>
    </div>
  );
}

