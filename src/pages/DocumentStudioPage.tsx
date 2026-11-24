import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Presentation,
  Table,
  Image as ImageIcon,
  Code2,
  Download,
  ArrowRight,
  ArrowLeftRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Layers,
  Edit3,
  ScanText,
  Lock,
  Zap,
  ShieldCheck,
  ChevronRight,
  Info,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import { FileUploadZone } from '../components/ui/FileUpload';
import { Button, Select } from '../components/ui/FormElements';
import { downloadBlob, formatBytes } from '../utils/file';
import { SEO } from '../components/common/SEO';
import { inspectPdfDocument } from '../services/documentConversion/pdfRenderer';
import { executeDocumentConversion } from '../services/documentConversion';
import type {
  DocumentFormat,
  PptxConversionMode,
  ConversionProgress,
  ConversionResult,
} from '../services/documentConversion/types';

// Supported format pairings
const FORMAT_OPTIONS: { value: DocumentFormat; label: string; icon: any }[] = [
  { value: 'pdf', label: 'PDF Document (.pdf)', icon: FileText },
  { value: 'pptx', label: 'PowerPoint (.pptx)', icon: Presentation },
  { value: 'docx', label: 'Word (.docx)', icon: FileText },
  { value: 'xlsx', label: 'Excel (.xlsx)', icon: Table },
  { value: 'png', label: 'Images (PNG/JPG)', icon: ImageIcon },
  { value: 'html', label: 'HTML (.html)', icon: Code2 },
];

const TARGETS_FOR_SOURCE: Record<DocumentFormat, DocumentFormat[]> = {
  pdf: ['pptx', 'docx', 'xlsx', 'png'],
  docx: ['pdf'],
  pptx: ['pdf'],
  xlsx: ['pdf'],
  png: ['pdf'],
  jpg: ['pdf'],
  html: ['pdf'],
};

export function DocumentStudioPage() {
  const navigate = useNavigate();

  // Selected formats
  const [sourceFormat, setSourceFormat] = useState<DocumentFormat>('pdf');
  const [targetFormat, setTargetFormat] = useState<DocumentFormat>('pptx');

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [pdfInfo, setPdfInfo] = useState<{
    pageCount: number;
    thumbnailDataUrl: string;
    hasDigitalText: boolean;
    aspectRatio: number;
  } | null>(null);

  // Conversion options
  const [pptxMode, setPptxMode] = useState<PptxConversionMode>('preserve-layout');
  const [enableOcr, setEnableOcr] = useState<boolean>(true);

  // Status
  const [processing, setProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<ConversionProgress | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Update target when source changes
  const handleSourceChange = (newSource: DocumentFormat) => {
    setSourceFormat(newSource);
    const validTargets = TARGETS_FOR_SOURCE[newSource] || ['pdf'];
    if (!validTargets.includes(targetFormat)) {
      setTargetFormat(validTargets[0]);
    }
    handleReset();
  };

  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setResult(null);
    setError(null);
    setProgress(null);

    // Auto-detect source format based on extension
    const ext = f.name.split('.').pop()?.toLowerCase();
    let detectedSource = sourceFormat;

    if (ext === 'pdf') detectedSource = 'pdf';
    else if (ext === 'docx' || ext === 'doc') detectedSource = 'docx';
    else if (ext === 'pptx' || ext === 'ppt') detectedSource = 'pptx';
    else if (ext === 'html' || ext === 'htm') detectedSource = 'html';
    else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext || '')) detectedSource = 'png';

    if (detectedSource !== sourceFormat) {
      setSourceFormat(detectedSource);
      const validTargets = TARGETS_FOR_SOURCE[detectedSource] || ['pdf'];
      if (!validTargets.includes(targetFormat)) {
        setTargetFormat(validTargets[0]);
      }
    }

    // Inspect if PDF
    if (ext === 'pdf') {
      try {
        const buf = await f.arrayBuffer();
        const info = await inspectPdfDocument(buf);
        setPdfInfo(info);
        if (!info.hasDigitalText) {
          setEnableOcr(true);
        }
      } catch (err) {
        console.warn('PDF inspect warning:', err);
      }
    } else {
      setPdfInfo(null);
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    // Special redirection for image-heavy workflows if requested
    if (sourceFormat === 'pdf' && targetFormat === 'png') {
      navigate('/tools/pdf-to-images');
      return;
    }

    setProcessing(true);
    setError(null);
    setProgress({ stage: 'Reading document file...', percent: 10 });

    try {
      const convResult = await executeDocumentConversion(file, {
        sourceFormat,
        targetFormat,
        pptxMode,
        enableOcr,
        onProgress: (p) => setProgress(p),
      });

      setResult(convResult);
    } catch (err: any) {
      console.error('Document Studio conversion failed:', err);
      setError(err?.message || 'Failed to complete conversion. Please try again.');
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

  const validTargets = TARGETS_FOR_SOURCE[sourceFormat] || ['pdf'];

  return (
    <>
      <SEO
        title="Document Studio — Premium Document & Presentation Conversion | Zenvio FXO"
        description="Convert Canva PDFs to editable PowerPoint (.pptx), Word (.docx), Excel (.xlsx), and back. High fidelity layout preservation, scanned slide OCR, and 100% in-browser privacy."
        canonicalPath="/document-studio"
      />

      <div className="min-h-screen bg-[#F8FAFC]">
        {/* Breadcrumb Header */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <Link to="/" className="hover:text-[#2563EB] transition-colors">Home</Link>
            <ChevronRight className="size-3" aria-hidden="true" />
            <Link to="/tools" className="hover:text-[#2563EB] transition-colors">Tools</Link>
            <ChevronRight className="size-3" aria-hidden="true" />
            <span className="text-[#0F172A] font-semibold">Document Studio</span>
          </nav>
        </div>

        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
            <Sparkles className="size-3.5 text-blue-600" />
            <span>Document Studio Hub</span>
            <span className="text-blue-300">•</span>
            <span className="text-slate-600">Canva & AI Presentation Ready</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#0F172A] tracking-tight">
            High-Fidelity <span className="text-[#2563EB]">Document Studio</span>
          </h1>

          <p className="mt-3 text-base sm:text-lg text-[#475569] max-w-2xl mx-auto">
            Convert PDFs into editable PowerPoint presentations, Word documents, spreadsheets, and back — preserving original visual alignment, formatting, and fonts.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-[#64748B]">
            <span className="flex items-center gap-1.5">
              <Lock className="size-4 text-[#2563EB]" /> 100% In-Browser Privacy
            </span>
            <span className="flex items-center gap-1.5">
              <Layers className="size-4 text-[#2563EB]" /> Preserve Layout & Fonts
            </span>
            <span className="flex items-center gap-1.5">
              <ScanText className="size-4 text-[#2563EB]" /> Scanned PDF OCR
            </span>
          </div>
        </div>

        {/* Main Studio Conversion Workspace */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
          <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-6 sm:p-8 space-y-6">
            {/* Format Selection Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              {/* Source Format */}
              <div className="w-full sm:w-1/2 space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Convert From
                </label>
                <Select
                  value={sourceFormat}
                  onChange={(e) => handleSourceChange(e.target.value as DocumentFormat)}
                  options={[
                    { value: 'pdf', label: 'PDF Document (.pdf)' },
                    { value: 'docx', label: 'Word Document (.docx)' },
                    { value: 'pptx', label: 'PowerPoint Presentation (.pptx)' },
                    { value: 'html', label: 'HTML Document (.html)' },
                    { value: 'png', label: 'Images (PNG / JPG)' },
                  ]}
                />
              </div>

              {/* Direction Indicator */}
              <div className="hidden sm:flex size-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-blue-600 shadow-xs mt-5">
                <ArrowRight className="size-4" />
              </div>

              {/* Target Format */}
              <div className="w-full sm:w-1/2 space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Convert To
                </label>
                <Select
                  value={targetFormat}
                  onChange={(e) => {
                    setTargetFormat(e.target.value as DocumentFormat);
                    setResult(null);
                  }}
                  options={validTargets.map((tgt) => ({
                    value: tgt,
                    label:
                      tgt === 'pptx'
                        ? 'PowerPoint (.pptx) — Editable Slides'
                        : tgt === 'docx'
                        ? 'Word (.docx) — Editable Document'
                        : tgt === 'xlsx'
                        ? 'Excel (.xlsx) — Structured Tables'
                        : tgt === 'pdf'
                        ? 'PDF (.pdf) — Formatted Vector Document'
                        : tgt === 'png'
                        ? 'Images (.png / .jpg)'
                        : tgt.toUpperCase(),
                  }))}
                />
              </div>
            </div>

            {/* Upload Zone */}
            {!file ? (
              <FileUploadZone
                accept={{
                  'application/pdf': ['.pdf'],
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
                  'text/html': ['.html', '.htm'],
                  'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
                }}
                onFilesSelect={handleFileSelect}
                label={`Drop your ${sourceFormat.toUpperCase()} file to convert to ${targetFormat.toUpperCase()}`}
                description="Auto-detects format. Safe and private — files never leave your computer. Up to 50 MB."
              />
            ) : (
              <div className="space-y-6">
                {/* File Details Card */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="flex items-start gap-3.5">
                    {pdfInfo?.thumbnailDataUrl ? (
                      <img
                        src={pdfInfo.thumbnailDataUrl}
                        alt="Preview"
                        className="w-14 h-14 object-cover rounded-xl border border-slate-200 shadow-xs"
                      />
                    ) : (
                      <div className="size-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                        {sourceFormat === 'pptx' ? (
                          <Presentation className="size-6" />
                        ) : sourceFormat === 'xlsx' ? (
                          <Table className="size-6" />
                        ) : (
                          <FileText className="size-6" />
                        )}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">{file.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                        <span>{formatBytes(file.size)}</span>
                        {pdfInfo && (
                          <>
                            <span>•</span>
                            <span>{pdfInfo.pageCount} pages</span>
                            <span>•</span>
                            <span>
                              {pdfInfo.aspectRatio > 1.5 ? '16:9 Presentation' : 'Document Portrait'}
                            </span>
                            {!pdfInfo.hasDigitalText && (
                              <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                                <ScanText className="size-3" /> Scanned Document
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" onClick={handleReset} disabled={processing}>
                    Change File
                  </Button>
                </div>

                {/* PDF to PPTX Specialized Mode Controls */}
                {sourceFormat === 'pdf' && targetFormat === 'pptx' && !result && (
                  <div className="space-y-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Conversion Engine Mode
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPptxMode('preserve-layout')}
                        className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          pptxMode === 'preserve-layout'
                            ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Layers className="size-4 text-blue-600" />
                            <span className="text-sm font-bold text-slate-900">Preserve Original Layout</span>
                          </div>
                          {pptxMode === 'preserve-layout' && (
                            <div className="size-2 rounded-full bg-blue-600" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600">
                          Maintains slide dimensions, vector positioning, and colors with overlay editable text. Best for Canva & Gamma decks.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPptxMode('editable-content')}
                        className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          pptxMode === 'editable-content'
                            ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Edit3 className="size-4 text-indigo-600" />
                            <span className="text-sm font-bold text-slate-900">Editable Content</span>
                          </div>
                          {pptxMode === 'editable-content' && (
                            <div className="size-2 rounded-full bg-blue-600" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600">
                          Extracts text into pure PowerPoint text boxes and lists for deep content editing and restyling.
                        </p>
                      </button>
                    </div>

                    {/* OCR Checkbox */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <ScanText className="size-4 text-slate-700" />
                        <div>
                          <p className="text-xs font-semibold text-slate-900">Optical Character Recognition (OCR)</p>
                          <p className="text-[11px] text-slate-500">
                            Reconstruct text from scanned pages or rasterized slides
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
                        <div className="w-10 h-5 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                      </label>
                    </div>
                  </div>
                )}

                {/* Conversion Notice */}
                {!result && (
                  <div className="flex items-start gap-3 p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-900">
                    <Info className="size-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed">
                      <strong>Fidelity note:</strong> Complex multi-layer gradients, custom desktop fonts, and chart vectors may require minor font or position adjustments in your target office suite.
                    </p>
                  </div>
                )}

                {/* Progress bar */}
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

                {/* Execute Button */}
                {!result && (
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
                          Processing Conversion...
                        </>
                      ) : (
                        <>
                          <Zap className="size-4 mr-2" />
                          Convert {sourceFormat.toUpperCase()} to {targetFormat.toUpperCase()}
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Result Display */}
                {result && (
                  <div className="space-y-6">
                    <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <CheckCircle2 className="size-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-emerald-950">Conversion Finished Successfully!</h4>
                          <p className="text-xs text-emerald-800 mt-0.5">
                            {result.filename} • {formatBytes(result.metadata?.convertedSize || 0)}
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
                        Download Converted File
                      </Button>
                    </div>

                    {/* Before & After comparison card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Before</span>
                        <div className="mt-2 text-sm font-semibold text-slate-800">{file.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {sourceFormat.toUpperCase()} • {formatBytes(file.size)}
                        </div>
                      </div>
                      <div className="p-4 bg-blue-50/40 border border-blue-200 rounded-xl">
                        <span className="text-xs font-bold uppercase text-blue-600 tracking-wider">After</span>
                        <div className="mt-2 text-sm font-semibold text-slate-900">{result.filename}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {targetFormat.toUpperCase()} • {formatBytes(result.metadata?.convertedSize || 0)}
                        </div>
                      </div>
                    </div>

                    {result.warnings && result.warnings.length > 0 && (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <Info className="size-3.5 text-slate-500" />
                          Conversion Quality Notice
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
            )}
          </div>

          {/* Dedicated Tools Grid */}
          <div className="mt-12 space-y-6">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Explore Dedicated Conversion Tools
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Direct access to specialized single-purpose document workflows
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/tools/pdf-to-pptx"
                className="group p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Presentation className="size-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                    PDF to PowerPoint
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Convert Canva, Gamma, and Tome PDF exports to editable PPTX slides.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 mt-4">
                  Open Tool <ArrowRight className="size-3" />
                </div>
              </Link>

              <Link
                to="/tools/pdf-to-docx"
                className="group p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="size-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <FileText className="size-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                    PDF to Word
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Reconstruct headings, paragraphs, and formatting for Microsoft Word.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 mt-4">
                  Open Tool <ArrowRight className="size-3" />
                </div>
              </Link>

              <Link
                to="/tools/word-to-pdf"
                className="group p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="size-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <FileCheck className="size-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                    Word to PDF
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Convert DOCX documents to standard vector PDFs with perfect page flow.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 mt-4">
                  Open Tool <ArrowRight className="size-3" />
                </div>
              </Link>

              <Link
                to="/tools/powerpoint-to-pdf"
                className="group p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="size-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Presentation className="size-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                    PowerPoint to PDF
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Export PPTX presentation slides to clean widescreen 16:9 PDF documents.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 mt-4">
                  Open Tool <ArrowRight className="size-3" />
                </div>
              </Link>

              <Link
                to="/tools/pdf-to-excel"
                className="group p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Table className="size-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                    PDF to Excel
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Extract data tables, financial figures, and rows from PDF into XLSX sheets.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 mt-4">
                  Open Tool <ArrowRight className="size-3" />
                </div>
              </Link>

              <Link
                to="/tools/pdf-to-images"
                className="group p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="size-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <ImageIcon className="size-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                    PDF to PNG/JPG
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Render high-resolution 2x crisp pages as image files or bulk ZIP archive.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 mt-4">
                  Open Tool <ArrowRight className="size-3" />
                </div>
              </Link>

              <Link
                to="/tools/images-to-pdf"
                className="group p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="size-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <ImageIcon className="size-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                    Images to PDF
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Combine multiple JPG, PNG, and WebP images into one organized PDF file.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 mt-4">
                  Open Tool <ArrowRight className="size-3" />
                </div>
              </Link>

              <Link
                to="/tools/html-to-pdf"
                className="group p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="size-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Code2 className="size-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                    HTML to PDF
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Convert raw HTML, styling, and web documents to printable PDF pages.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 mt-4">
                  Open Tool <ArrowRight className="size-3" />
                </div>
              </Link>
            </div>
          </div>

          {/* Value Props & Pro Tips */}
          <div className="mt-12 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-slate-900">
              Why use Zenvio FXO Document Studio?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <ShieldCheck className="size-4 text-blue-600" />
                  Zero Cloud Upload
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Unlike traditional converters that transmit confidential files to remote servers, Zenvio FXO converts files entirely within your web browser.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Presentation className="size-4 text-indigo-600" />
                  Canva & AI Presentation Ready
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Designed specifically to solve the non-editable PDF export dilemma from Canva, Beautiful.ai, Gamma, and Tome.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <ScanText className="size-4 text-emerald-600" />
                  Built-in Scanned Slide OCR
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Integrated Optical Character Recognition automatically recovers text from scanned documents or flattened image slides.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
