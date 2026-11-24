import React, { useState } from 'react';
import {
  Download,
  Presentation,
  RefreshCw,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Edit3,
  ScanText,
  Sparkles,
  Info,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { FileUploadZone } from '../../components/ui/FileUpload';
import { Button } from '../../components/ui/FormElements';
import { downloadBlob, formatBytes } from '../../utils/file';
import { inspectPdfDocument } from '../../services/documentConversion/pdfRenderer';
import { convertPdfToPptx } from '../../services/documentConversion/pdfToPptx';
import type { PptxConversionMode, ConversionResult, ConversionProgress } from '../../services/documentConversion/types';

export function PDFToPPTX() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfInfo, setPdfInfo] = useState<{
    pageCount: number;
    aspectRatio: number;
    thumbnailDataUrl: string;
    hasDigitalText: boolean;
  } | null>(null);

  // Conversion settings
  const [mode, setMode] = useState<PptxConversionMode>('preserve-layout');
  const [enableOcr, setEnableOcr] = useState<boolean>(true);

  // Execution states
  const [processing, setProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<ConversionProgress | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setResult(null);
    setError(null);
    setProgress(null);

    try {
      const buffer = await f.arrayBuffer();
      const info = await inspectPdfDocument(buffer);
      setPdfInfo(info);
      // Auto-enable OCR if document appears scanned
      if (!info.hasDigitalText) {
        setEnableOcr(true);
      }
    } catch (err: any) {
      console.error('Error inspecting PDF:', err);
      setError('Could not inspect PDF document. The file may be password protected or invalid.');
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setProgress({ stage: 'Initializing converter...', percent: 5 });

    try {
      const buffer = await file.arrayBuffer();
      const convResult = await convertPdfToPptx(buffer, file.name, {
        mode,
        enableOcr,
        onProgress: (p) => setProgress(p),
      });

      setResult(convResult);
    } catch (err: any) {
      console.error('Conversion failed:', err);
      setError(err?.message || 'Failed to convert PDF to PowerPoint. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPdfInfo(null);
    setResult(null);
    setError(null);
    setProgress(null);
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <div className="space-y-4">
          <FileUploadZone
            accept={{ 'application/pdf': ['.pdf'] }}
            onFilesSelect={handleFileSelect}
            label="Drop your PDF presentation here to convert to PowerPoint (.pptx)"
            description="Perfect for Canva, Gamma, Tome, and Figma PDF slide exports. Up to 50 MB."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800 mb-1">
                <Layers className="size-4 text-blue-600" />
                Preserve Original Layout Mode
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Maintains original slide dimensions, vector layout, colors, and positioning with editable text overlay.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800 mb-1">
                <Edit3 className="size-4 text-indigo-600" />
                Editable Content Mode
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Extracts text, paragraphs, and tables into clean PowerPoint text shapes ready for deep editing.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Card & Inspector */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-start gap-3.5">
                {pdfInfo?.thumbnailDataUrl ? (
                  <img
                    src={pdfInfo.thumbnailDataUrl}
                    alt="First page preview"
                    className="w-14 h-14 object-cover rounded-lg border border-slate-200 shadow-xs"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
                    <Presentation className="size-6" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-slate-900 text-base">{file.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                    <span>{formatBytes(file.size)}</span>
                    <span>•</span>
                    <span>{pdfInfo?.pageCount || 1} slides</span>
                    <span>•</span>
                    <span className="capitalize">
                      {pdfInfo?.aspectRatio && pdfInfo.aspectRatio > 1.5 ? '16:9 Widescreen' : 'Standard 4:3'}
                    </span>
                    {!pdfInfo?.hasDigitalText && (
                      <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                        <ScanText className="size-3" /> Scanned / Raster Slide
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={handleReset} disabled={processing}>
                Change File
              </Button>
            </div>

            {/* Conversion Mode Selection */}
            {!result && (
              <div className="pt-6 space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Select Conversion Engine
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMode('preserve-layout')}
                      className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        mode === 'preserve-layout'
                          ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Layers className="size-4 text-blue-600" />
                          <span className="text-sm font-bold text-slate-900">Preserve Original Layout</span>
                        </div>
                        {mode === 'preserve-layout' && (
                          <div className="size-2 rounded-full bg-blue-600" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Best for Canva, Figma, and graphic presentations. Locks exact visual design while making text boxes editable.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMode('editable-content')}
                      className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        mode === 'editable-content'
                          ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Edit3 className="size-4 text-indigo-600" />
                          <span className="text-sm font-bold text-slate-900">Editable Content</span>
                        </div>
                        {mode === 'editable-content' && (
                          <div className="size-2 rounded-full bg-blue-600" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Best for text-heavy documents and business decks. Rebuilds slides with clean PowerPoint text boxes, lists, and tables.
                      </p>
                    </button>
                  </div>
                </div>

                {/* OCR Toggle for scanned slides */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <ScanText className="size-4 text-slate-700" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Optical Character Recognition (OCR)</p>
                      <p className="text-[11px] text-slate-500">
                        Automatically extract text from scanned pages or flattened Canva images
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableOcr}
                      onChange={(e) => setEnableOcr(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>

                {/* Realistic quality notice */}
                <div className="flex items-start gap-3 p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-900">
                  <Info className="size-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed">
                    <strong>Quality notice:</strong> Complex vector graphics, proprietary brand fonts, or low-contrast scanned slides may require minor layout or typography touch-ups in PowerPoint.
                  </p>
                </div>

                {/* Processing Progress */}
                {processing && progress && (
                  <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-blue-900">
                      <span>{progress.stage}</span>
                      <span>{progress.percent}%</span>
                    </div>
                    <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                    <AlertTriangle className="size-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Action Button */}
                <div className="flex justify-end pt-2">
                  <Button
                    variant="primary"
                    size="lg"
                    disabled={processing}
                    onClick={handleConvert}
                    className="w-full sm:w-auto"
                  >
                    {processing ? (
                      <>
                        <RefreshCw className="size-4 mr-2 animate-spin" />
                        Converting to PowerPoint...
                      </>
                    ) : (
                      <>
                        <Presentation className="size-4 mr-2" />
                        Convert to PowerPoint (.pptx)
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Conversion Result State */}
            {result && (
              <div className="pt-6 space-y-6">
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="size-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950">Conversion Successful!</h4>
                      <p className="text-xs text-emerald-800 mt-0.5">
                        Your editable presentation is ready • {formatBytes(result.metadata?.convertedSize || 0)} • {result.pageCount} slides
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => downloadBlob(result.blob, result.filename)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                  >
                    <Download className="size-4 mr-2" />
                    Download PowerPoint (.pptx)
                  </Button>
                </div>

                {/* Before / After Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Before (Source)</span>
                    <div className="mt-2 text-sm font-semibold text-slate-800">{file.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      PDF Document • {formatBytes(file.size)} • {pdfInfo?.pageCount} pages
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50/40 border border-blue-200 rounded-xl">
                    <span className="text-xs font-bold uppercase text-blue-600 tracking-wider">After (Converted)</span>
                    <div className="mt-2 text-sm font-semibold text-slate-900">{result.filename}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      PowerPoint (.pptx) • {formatBytes(result.metadata?.convertedSize || 0)} • Fully editable
                    </div>
                  </div>
                </div>

                {/* Quality Notices */}
                {result.warnings && result.warnings.length > 0 && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <Info className="size-3.5 text-slate-500" />
                      Conversion Details & Quality Tips
                    </div>
                    <ul className="text-xs text-slate-600 list-disc list-inside space-y-1">
                      {result.warnings.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-center pt-2">
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    Convert Another Document
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

