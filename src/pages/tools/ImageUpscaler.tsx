import React, { useState, useEffect } from 'react';
import { DropZone } from '../../components/ui/FileUpload';
import { ImageComparisonSlider } from '../../components/image/ImageComparisonSlider';
import { checkImageAIStatus, processImageViaServer, upscaleImageClientCanvas, loadImage } from '../../lib/imageClient';
import { Maximize2, AlertCircle, RefreshCw, Zap, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { formatBytes } from '../../utils/file';

export function ImageUpscaler() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [processedUrl, setProcessedUrl] = useState<string>('');
  const [origDims, setOrigDims] = useState<{ width: number; height: number } | null>(null);
  const [procDims, setProcDims] = useState<{ width: number; height: number } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [engineMode, setEngineMode] = useState<'ai' | 'browser'>('ai');
  const [scaleFactor, setScaleFactor] = useState<2 | 4>(2);
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
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setOriginalUrl(dataUrl);
      setProcessedUrl('');
      setProcDims(null);
      try {
        const img = await loadImage(dataUrl);
        setOrigDims({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
      } catch {
        // non-blocking
      }
    };
    reader.readAsDataURL(selected);
  };

  const handleProcess = async () => {
    if (!originalUrl) return;
    setProcessing(true);
    setError('');
    setProgress(`Generating ${scaleFactor}x higher-resolution detail reconstruction…`);

    try {
      if (engineMode === 'ai' && serverAIConfigured) {
        setProgress(`Upscaling ${scaleFactor}x via Server AI Super-Resolution Provider…`);
        const res = await processImageViaServer({
          task: 'upscale',
          image: originalUrl,
          scale: scaleFactor,
        });

        if (res.ok && res.output) {
          setProcessedUrl(res.output);
          const img = await loadImage(res.output);
          setProcDims({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
        } else {
          setError(res.error || 'AI image upscaling failed.');
        }
      } else {
        setProgress(`Applying ${scaleFactor}x multi-pass bicubic step interpolation in browser…`);
        await new Promise((r) => setTimeout(r, 60));
        const output = await upscaleImageClientCanvas(originalUrl, scaleFactor);
        setProcessedUrl(output);
        const img = await loadImage(output);
        setProcDims({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during image upscaling.');
    } finally {
      setProcessing(false);
      setProgress('');
    }
  };

  const handleReset = () => {
    setFile(null);
    setOriginalUrl('');
    setProcessedUrl('');
    setOrigDims(null);
    setProcDims(null);
    setError('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Engine Selection & Status Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
            <Maximize2 className="size-4 text-[#2563EB]" />
            AI Image Upscaler & Super-Resolution
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Increase pixel resolution by 2x or 4x without visible pixelation.
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
            AI Cloud Model
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
            Browser High-Fidelity
          </button>
        </div>
      </div>

      {engineMode === 'ai' && serverAIConfigured === false && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">AI Upscaling API Key Not Configured on Server</p>
            <p className="text-amber-800 leading-relaxed">
              To use deep-learning AI upscaling, set <code>CLIPDROP_API_KEY</code> or <code>STABILITY_API_KEY</code> on
              your server. You can also use the <strong>Browser High-Fidelity</strong> mode to apply multi-stage bicubic scaling and edge reconstruction directly in your browser.
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
                <p className="text-[#64748B]">
                  {file ? formatBytes(file.size) : ''}
                  {origDims ? ` • ${origDims.width} × ${origDims.height} px` : ''}
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="text-xs font-semibold text-[#DC2626] hover:underline"
            >
              Upload another
            </button>
          </div>

          {/* Upscale Factor Selection */}
          <div className="p-4 bg-white border border-[#E2E8F0] rounded-xl space-y-3">
            <span className="text-xs font-semibold text-[#0F172A] block">Select Upscale Factor:</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setScaleFactor(2)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  scaleFactor === 2
                    ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]'
                    : 'border-[#E2E8F0] bg-white text-[#475569] hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-black">2x Upscale</span>
                  <span className="text-xs font-semibold bg-blue-100 text-[#1D4ED8] px-2 py-0.5 rounded-full">
                    Fast & Crisp
                  </span>
                </div>
                {origDims && (
                  <p className="mt-1 text-xs text-[#64748B]">
                    Output: {origDims.width * 2} × {origDims.height * 2} px
                  </p>
                )}
              </button>

              <button
                type="button"
                onClick={() => setScaleFactor(4)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  scaleFactor === 4
                    ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]'
                    : 'border-[#E2E8F0] bg-white text-[#475569] hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-black">4x Ultra HD</span>
                  <span className="text-xs font-semibold bg-purple-100 text-[#7C3AED] px-2 py-0.5 rounded-full">
                    Maximum Detail
                  </span>
                </div>
                {origDims && (
                  <p className="mt-1 text-xs text-[#64748B]">
                    Output: {origDims.width * 4} × {origDims.height * 4} px
                  </p>
                )}
              </button>
            </div>
          </div>

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
                    Upscaling Image…
                  </>
                ) : (
                  <>
                    <Maximize2 className="size-4" />
                    Upscale {scaleFactor}x Resolution
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
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                    <Maximize2 className="size-4 text-[#16A34A]" />
                    Upscaled Result ({procDims ? `${procDims.width} × ${procDims.height} px` : `${scaleFactor}x`})
                  </h3>
                </div>
                <button
                  onClick={handleProcess}
                  disabled={processing}
                  className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="size-3.5" /> Re-upscale
                </button>
              </div>

              <ImageComparisonSlider
                originalSrc={originalUrl}
                processedSrc={processedUrl}
                originalLabel={`Original (${origDims?.width}×${origDims?.height})`}
                processedLabel={`Upscaled ${scaleFactor}x (${procDims?.width}×${procDims?.height})`}
                downloadFilename={`${file?.name.replace(/\.[^/.]+$/, '') || 'image'}-${scaleFactor}x-upscaled.png`}
              />
            </div>
          )}
        </div>
      )}

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#E2E8F0] text-xs text-[#475569]">
        <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0]">
          <ArrowUpRight className="size-5 text-[#2563EB] mb-2" />
          <h4 className="font-semibold text-[#0F172A] mb-1">2x and 4x Multipliers</h4>
          <p>Easily enlarge wallpapers, logos, and print artwork to high-definition standards.</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0]">
          <Zap className="size-5 text-[#2563EB] mb-2" />
          <h4 className="font-semibold text-[#0F172A] mb-1">Step-Wise Resampling</h4>
          <p>Iterative step interpolation prevents blur artifacts and maintains sharp line definition.</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0]">
          <ShieldCheck className="size-5 text-[#2563EB] mb-2" />
          <h4 className="font-semibold text-[#0F172A] mb-1">Client Performance</h4>
          <p>Fast hardware-accelerated Canvas computation right inside your modern web browser.</p>
        </div>
      </div>
    </div>
  );
}

