import React, { useState, useEffect } from 'react';
import { DropZone } from '../../components/ui/FileUpload';
import { ImageComparisonSlider } from '../../components/image/ImageComparisonSlider';
import { checkImageAIStatus, processImageViaServer, removeBackgroundClientCanvas } from '../../lib/imageClient';
import { Scissors, Sliders, AlertCircle, RefreshCw, Crosshair, ShieldCheck, Download } from 'lucide-react';
import { formatBytes } from '../../utils/file';

export function ImageCutout() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [processedUrl, setProcessedUrl] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [engineMode, setEngineMode] = useState<'ai' | 'browser'>('ai');
  const [tolerance, setTolerance] = useState<number>(32);
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
    setProgress('Detecting primary subject and extracting boundary silhouette…');

    try {
      if (engineMode === 'ai' && serverAIConfigured) {
        setProgress('Isolating subject via Server AI Cutout Provider…');
        const res = await processImageViaServer({
          task: 'cutout',
          image: originalUrl,
        });

        if (res.ok && res.output) {
          setProcessedUrl(res.output);
        } else {
          setError(res.error || 'AI image cutout failed.');
        }
      } else {
        setProgress('Generating centered subject alpha matte in browser…');
        await new Promise((r) => setTimeout(r, 60));
        const output = await removeBackgroundClientCanvas(originalUrl, {
          tolerance,
          subjectFocus: 'center',
        });
        setProcessedUrl(output);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during subject cutout.');
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
            <Scissors className="size-4 text-[#2563EB]" />
            Subject Cutout Studio
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Isolate products, people, and objects to create clean transparent cutouts.
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
            AI Subject Isolation
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
            Browser Cutout Engine
          </button>
        </div>
      </div>

      {engineMode === 'ai' && serverAIConfigured === false && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">AI Cutout Provider Key Not Configured on Server</p>
            <p className="text-amber-800 leading-relaxed">
              To activate Cloud AI subject extraction, provide <code>CLIPDROP_API_KEY</code> or <code>REMOVEBG_API_KEY</code> in your environment settings. You can switch to the <strong>Browser Cutout Engine</strong> to generate clean subject cutouts locally with zero upload latency.
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
            <div className="p-4 bg-white border border-[#E2E8F0] rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                  <Sliders className="size-3.5 text-[#2563EB]" /> Foreground Isolation Sensitivity:
                </span>
                <span className="font-mono text-[#2563EB] font-bold">{tolerance}%</span>
              </div>
              <input
                type="range"
                min="15"
                max="75"
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                className="w-full accent-[#2563EB]"
              />
              <p className="text-[11px] text-[#64748B]">
                Optimized for centering on people, items, or ecommerce products.
              </p>
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
                    Extracting Subject…
                  </>
                ) : (
                  <>
                    <Scissors className="size-4" />
                    Extract Subject Cutout
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

          {/* Result */}
          {processedUrl && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                  <Scissors className="size-4 text-[#16A34A]" />
                  Isolated Subject Cutout
                </h3>
                <button
                  onClick={handleProcess}
                  disabled={processing}
                  className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="size-3.5" /> Re-extract
                </button>
              </div>

              <ImageComparisonSlider
                originalSrc={originalUrl}
                processedSrc={processedUrl}
                originalLabel="Original Scene"
                processedLabel="Subject Cutout"
                isTransparent={true}
                downloadFilename={`${file?.name.replace(/\.[^/.]+$/, '') || 'cutout'}-isolated.png`}
              />
            </div>
          )}
        </div>
      )}

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#E2E8F0] text-xs text-[#475569]">
        <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0]">
          <Crosshair className="size-5 text-[#2563EB] mb-2" />
          <h4 className="font-semibold text-[#0F172A] mb-1">Subject Centering</h4>
          <p>Prioritizes primary subject foreground pixels while eliminating exterior background noise.</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0]">
          <Download className="size-5 text-[#2563EB] mb-2" />
          <h4 className="font-semibold text-[#0F172A] mb-1">E-Commerce Ready</h4>
          <p>Export PNG assets with smooth boundaries suitable for Shopify, Amazon, and marketing assets.</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0]">
          <ShieldCheck className="size-5 text-[#2563EB] mb-2" />
          <h4 className="font-semibold text-[#0F172A] mb-1">Privacy Guarantee</h4>
          <p>No storage, no tracking. Images stay in memory only during your active session.</p>
        </div>
      </div>
    </div>
  );
}

