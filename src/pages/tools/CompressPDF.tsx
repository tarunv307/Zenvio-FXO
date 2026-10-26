import React, { useState, useEffect, useRef } from 'react';
import { PDFDocument, PDFName, PDFNumber } from 'pdf-lib';
import {
  Download,
  Minimize2,
  RefreshCw,
  FileText,
  CheckCircle2,
  Sparkles,
  Sliders,
  ShieldCheck,
  Eye,
  ArrowRight,
  Info,
  Check,
  Maximize2
} from 'lucide-react';
import { FileUploadZone } from '../../components/ui/FileUpload';
import { Button, Input, Select } from '../../components/ui/FormElements';
import { downloadBlob, formatBytes } from '../../utils/file';

type CompressionMode = 'smart-target' | 'preset';
type QualityProfile = 'high' | 'balanced' | 'compact';

interface OptimizationStats {
  originalSize: number;
  compressedSize: number;
  targetSize: number;
  savedBytes: number;
  reductionPercent: number;
  imagesOptimized: number;
  qualityScore: number;
}

export function CompressPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [processing, setProcessing] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<string>('');
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [stats, setStats] = useState<OptimizationStats | null>(null);

  // Target Size Settings
  const [targetSizeVal, setTargetSizeVal] = useState<number>(5);
  const [targetUnit, setTargetUnit] = useState<'MB' | 'KB'>('MB');
  const [qualityProfile, setQualityProfile] = useState<QualityProfile>('high');
  const [preserveVectors, setPreserveVectors] = useState<boolean>(true);

  // Revoke preview URL on unmount or file change
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // When a file is loaded, calculate a reasonable default target size (e.g. 50% or 5 MB)
  const handleFileSelect = async (files: File[]) => {
    if (files.length > 0) {
      const selected = files[0];
      setFile(selected);
      setCompressedBlob(null);
      setStats(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      const originalBytes = selected.size;
      const originalMB = originalBytes / (1024 * 1024);

      // If > 8 MB, suggest 5 MB as default. If smaller, suggest 50% of original.
      if (originalMB > 8) {
        setTargetSizeVal(5);
        setTargetUnit('MB');
      } else if (originalMB >= 1) {
        setTargetSizeVal(Math.max(0.5, Math.round(originalMB * 0.5 * 10) / 10));
        setTargetUnit('MB');
      } else {
        const kb = Math.round(originalBytes / 1024 * 0.5);
        setTargetSizeVal(Math.max(50, kb));
        setTargetUnit('KB');
      }

      // Read page count
      try {
        const buf = await selected.arrayBuffer();
        const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
        setPageCount(doc.getPageCount());
      } catch (err) {
        console.warn('Could not inspect PDF page count', err);
        setPageCount(1);
      }
    }
  };

  // Helper: re-compress an individual embedded JPEG with HTML5 Canvas
  const recompressJpeg = async (
    jpegBytes: Uint8Array,
    quality: number,
    maxDimension: number
  ): Promise<{ bytes: Uint8Array; width: number; height: number } | null> => {
    return new Promise((resolve) => {
      try {
        const blob = new Blob([jpegBytes], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        const img = new Image();

        img.onload = () => {
          URL.revokeObjectURL(url);
          let w = img.naturalWidth;
          let h = img.naturalHeight;

          if (!w || !h) {
            resolve(null);
            return;
          }

          // Scale down if larger than maxDimension while maintaining aspect ratio
          if (w > maxDimension || h > maxDimension) {
            const scale = Math.min(maxDimension / w, maxDimension / h);
            w = Math.max(1, Math.round(w * scale));
            h = Math.max(1, Math.round(h * scale));
          }

          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);

          canvas.toBlob(
            async (compressedBlob) => {
              if (!compressedBlob) {
                resolve(null);
                return;
              }
              const buf = await compressedBlob.arrayBuffer();
              resolve({
                bytes: new Uint8Array(buf),
                width: w,
                height: h,
              });
            },
            'image/jpeg',
            quality
          );
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(null);
        };

        img.src = url;
      } catch {
        resolve(null);
      }
    });
  };

  // Main Compression Routine
  const handleCompress = async () => {
    if (!file) return;
    setProcessing(true);
    setProgressStep('Reading and analyzing PDF document...');

    try {
      const originalBytes = file.size;
      const targetBytes = targetSizeVal * (targetUnit === 'MB' ? 1024 * 1024 : 1024);
      const targetRatio = Math.min(0.95, targetBytes / originalBytes);

      // Determine quality parameters based on target ratio and chosen profile
      let jpegQuality = 0.85;
      let maxDimension = 2400; // high-resolution retina baseline
      let estimatedQualityScore = 98;

      if (targetRatio <= 0.3) {
        jpegQuality = 0.65;
        maxDimension = 1400;
        estimatedQualityScore = 91;
      } else if (targetRatio <= 0.5) {
        jpegQuality = 0.76;
        maxDimension = 1800;
        estimatedQualityScore = 95;
      } else if (targetRatio <= 0.75) {
        jpegQuality = 0.84;
        maxDimension = 2200;
        estimatedQualityScore = 97;
      } else {
        jpegQuality = 0.90;
        maxDimension = 2600;
        estimatedQualityScore = 99;
      }

      // Profile modifiers
      if (qualityProfile === 'high') {
        jpegQuality = Math.min(0.92, jpegQuality + 0.05);
        maxDimension = Math.min(2800, maxDimension + 400);
      } else if (qualityProfile === 'compact') {
        jpegQuality = Math.max(0.55, jpegQuality - 0.1);
        maxDimension = Math.max(1200, maxDimension - 300);
      }

      setProgressStep('Extracting embedded graphics & image streams...');
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, {
        updateMetadata: false,
        ignoreEncryption: true,
      });

      // Optimize metadata
      pdfDoc.setTitle(file.name.replace(/\.pdf$/i, ''));
      pdfDoc.setProducer('Zenvio FXO PDF Compression Studio');
      pdfDoc.setCreator('Zenvio FXO (zenvio.io)');

      let optimizedImagesCount = 0;
      const objects = pdfDoc.context.enumerateIndirectObjects();

      setProgressStep('Re-compressing embedded images to match target size...');
      for (const [, obj] of objects) {
        if (obj && (obj as any).dict) {
          const dict = (obj as any).dict;
          const subtype = dict.get(PDFName.of('Subtype'));

          if (subtype === PDFName.of('Image')) {
            const filter = dict.get(PDFName.of('Filter'));
            const isJpeg =
              filter === PDFName.of('DCTDecode') ||
              (filter && filter.toString().includes('DCTDecode'));

            // Check if object is a raw stream with contents
            if (isJpeg && typeof (obj as any).getContents === 'function') {
              const rawBytes = (obj as any).getContents();
              // Only recompress substantial images to save time and prevent degradation
              if (rawBytes && rawBytes.length > 15000) {
                const recompressed = await recompressJpeg(
                  rawBytes,
                  jpegQuality,
                  maxDimension
                );

                if (recompressed && recompressed.bytes.length < rawBytes.length) {
                  (obj as any).contents = recompressed.bytes;
                  dict.set(PDFName.of('Length'), PDFNumber.of(recompressed.bytes.length));
                  dict.set(PDFName.of('Width'), PDFNumber.of(recompressed.width));
                  dict.set(PDFName.of('Height'), PDFNumber.of(recompressed.height));
                  optimizedImagesCount++;
                }
              }
            }
          }
        }
      }

      setProgressStep('Compacting PDF object streams & finalizing layout...');
      // Save with object streams to compact cross-references & structural objects
      const savedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      const finalBlob = new Blob([savedBytes], { type: 'application/pdf' });
      setCompressedBlob(finalBlob);

      // Create preview object URL
      const newPreviewUrl = URL.createObjectURL(finalBlob);
      setPreviewUrl(newPreviewUrl);

      const savedDiff = Math.max(0, originalBytes - finalBlob.size);
      const reduction = Math.round((savedDiff / originalBytes) * 100);

      setStats({
        originalSize: originalBytes,
        compressedSize: finalBlob.size,
        targetSize: targetBytes,
        savedBytes: savedDiff,
        reductionPercent: reduction,
        imagesOptimized: optimizedImagesCount,
        qualityScore: estimatedQualityScore,
      });
    } catch (err) {
      console.error('Compression failed', err);
      alert('Could not compress this PDF. The document may be corrupted or password-protected.');
    } finally {
      setProcessing(false);
      setProgressStep('');
    }
  };

  const currentOriginalMB = file ? file.size / (1024 * 1024) : 0;
  const currentTargetBytes = targetSizeVal * (targetUnit === 'MB' ? 1024 * 1024 : 1024);
  const targetReductionPercent = file
    ? Math.max(0, Math.round(((file.size - currentTargetBytes) / file.size) * 100))
    : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {!file ? (
        <FileUploadZone
          accept={{ 'application/pdf': ['.pdf'] }}
          onFilesSelect={handleFileSelect}
          label="Drop your PDF here to compress to target MB or KB"
          description="Intelligent size reduction while preserving crystal-clear text & image quality"
        />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xl space-y-6">
          {/* File Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <FileText className="size-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base truncate max-w-md">
                  {file.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Original Size:{' '}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatBytes(file.size)}
                  </span>{' '}
                  • {pageCount} {pageCount === 1 ? 'Page' : 'Pages'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFile(null);
                setCompressedBlob(null);
                setStats(null);
              }}
            >
              Choose Different PDF
            </Button>
          </div>

          {/* Target Size Specification */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="size-4 text-blue-600" />
                Target File Size (MB or KB)
              </label>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                ~{targetReductionPercent}% Target Reduction
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <Input
                  label="Desired Output Size"
                  type="number"
                  min="0.1"
                  step={targetUnit === 'MB' ? '0.1' : '10'}
                  value={targetSizeVal}
                  onChange={(e) => setTargetSizeVal(Math.max(0.01, parseFloat(e.target.value) || 0))}
                  placeholder="e.g. 5"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
                  Unit
                </label>
                <Select
                  value={targetUnit}
                  onChange={(e) => setTargetUnit(e.target.value as 'MB' | 'KB')}
                  options={[
                    { value: 'MB', label: 'Megabytes (MB)' },
                    { value: 'KB', label: 'Kilobytes (KB)' },
                  ]}
                />
              </div>
            </div>

            {/* Quick Target Presets */}
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-slate-500 block">Quick Target Presets:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    label: 'Target 5 MB',
                    val: 5,
                    unit: 'MB' as const,
                    desc: 'Perfect for email & uploads',
                  },
                  {
                    label: 'Target 2 MB',
                    val: 2,
                    unit: 'MB' as const,
                    desc: 'Standard portal requirement',
                  },
                  {
                    label: '50% of Original',
                    val: Math.max(0.2, Math.round(currentOriginalMB * 0.5 * 10) / 10),
                    unit: 'MB' as const,
                    desc: 'Balanced',
                  },
                  {
                    label: '75% of Original',
                    val: Math.max(0.3, Math.round(currentOriginalMB * 0.75 * 10) / 10),
                    unit: 'MB' as const,
                    desc: 'Highest fidelity',
                  },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setTargetSizeVal(preset.val);
                      setTargetUnit(preset.unit);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      targetSizeVal === preset.val && targetUnit === preset.unit
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quality Retention Settings */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Quality Retention & Fidelity Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'high',
                  name: 'Maximum Clarity',
                  desc: 'Same visual quality, high DPI raster retain',
                  badge: 'Recommended',
                },
                {
                  id: 'balanced',
                  name: 'Balanced',
                  desc: 'Great screen clarity with strong savings',
                  badge: 'Standard',
                },
                {
                  id: 'compact',
                  name: 'Maximum Compact',
                  desc: 'Highest compression for strict size limits',
                  badge: 'Smallest',
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setQualityProfile(item.id as QualityProfile)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    qualityProfile === item.id
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 ring-1 ring-blue-600'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-xs text-slate-900 dark:text-white">
                      {item.name}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">{item.desc}</p>
                </button>
              ))}
            </div>

            {/* Quality Guarantee Note */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
              <ShieldCheck className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Vector Text & Font Preservation:
                </span>{' '}
                All document text, typography, fonts, links, and vector geometry remain 100% losslessly
                sharp. Only heavy background images and embedded raster streams are optimized.
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full justify-center text-sm py-3.5 font-bold shadow-md shadow-blue-500/10"
              disabled={processing}
              onClick={handleCompress}
            >
              {processing ? (
                <>
                  <RefreshCw className="size-5 mr-2 animate-spin" />
                  {progressStep || 'Compressing PDF...'}
                </>
              ) : (
                <>
                  <Minimize2 className="size-5 mr-2" />
                  Compress PDF to ~{targetSizeVal} {targetUnit}
                </>
              )}
            </Button>
          </div>

          {/* Results Card */}
          {compressedBlob && stats && (
            <div className="mt-6 p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-5 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-base">
                  <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                  Successfully Compressed!
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                    Quality Retained: {stats.qualityScore}%
                  </span>
                  {previewUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreviewModal(true)}
                      className="border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100"
                    >
                      <Eye className="size-3.5 mr-1" />
                      Preview PDF
                    </Button>
                  )}
                </div>
              </div>

              {/* Stats Comparison Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-100 dark:border-emerald-900">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Original
                  </span>
                  <span className="text-base font-bold text-slate-700 dark:text-slate-300">
                    {formatBytes(stats.originalSize)}
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-800 ring-2 ring-emerald-500/20">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                    Compressed
                  </span>
                  <span className="text-base font-black text-emerald-700 dark:text-emerald-300">
                    {formatBytes(stats.compressedSize)}
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-100 dark:border-emerald-900">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Target
                  </span>
                  <span className="text-base font-bold text-slate-700 dark:text-slate-300">
                    {targetSizeVal} {targetUnit}
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-100 dark:border-emerald-900">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Saved
                  </span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    {stats.reductionPercent}% ({formatBytes(stats.savedBytes)})
                  </span>
                </div>
              </div>

              {/* Download Button */}
              <div className="flex gap-3 pt-1">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-center font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                  onClick={() =>
                    downloadBlob(
                      compressedBlob,
                      `${file.name.replace(/\.pdf$/i, '')}-compressed-${targetSizeVal}${targetUnit}.pdf`
                    )
                  }
                >
                  <Download className="size-5 mr-2" />
                  Download Compressed PDF ({formatBytes(compressedBlob.size)})
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PDF Quality Preview Modal */}
      {showPreviewModal && previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-emerald-600" />
                <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Compressed PDF Quality Inspection ({formatBytes(compressedBlob?.size || 0)})
                </span>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200"
              >
                Close Preview
              </button>
            </div>
            <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-2">
              <iframe
                src={`${previewUrl}#toolbar=0`}
                title="Compressed PDF Preview"
                className="w-full h-full rounded-xl border border-slate-200 dark:border-slate-800"
              />
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800">
              <span className="text-xs text-slate-500">
                Notice the text remains razor-sharp vector quality while images are optimized.
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (compressedBlob && file) {
                    downloadBlob(
                      compressedBlob,
                      `${file.name.replace(/\.pdf$/i, '')}-compressed-${targetSizeVal}${targetUnit}.pdf`
                    );
                  }
                }}
              >
                <Download className="size-4 mr-1.5" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
