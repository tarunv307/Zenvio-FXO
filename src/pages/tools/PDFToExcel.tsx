import React, { useState } from 'react';
import {
  Download,
  Table,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Lock,
} from 'lucide-react';
import { FileUploadZone } from '../../components/ui/FileUpload';
import { Button } from '../../components/ui/FormElements';
import { downloadBlob, formatBytes } from '../../utils/file';
import { inspectPdfDocument } from '../../services/documentConversion/pdfRenderer';
import { convertPdfToExcel } from '../../services/documentConversion/pdfToExcel';
import type { ConversionResult, ConversionProgress } from '../../services/documentConversion/types';

export function PDFToExcel() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfInfo, setPdfInfo] = useState<{
    pageCount: number;
    thumbnailDataUrl: string;
    hasDigitalText: boolean;
  } | null>(null);

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
    } catch (err: any) {
      console.error('Error inspecting PDF:', err);
      setError('Could not inspect PDF document. The file may be password protected or invalid.');
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setProgress({ stage: 'Extracting data tables from PDF...', percent: 15 });

    try {
      const buffer = await file.arrayBuffer();
      const convResult = await convertPdfToExcel(buffer, file.name, {
        onProgress: (p) => setProgress(p),
      });

      setResult(convResult);
    } catch (err: any) {
      console.error('PDF to Excel failed:', err);
      setError(err?.message || 'Could not convert PDF to Excel spreadsheet.');
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
        <FileUploadZone
          accept={{ 'application/pdf': ['.pdf'] }}
          onFilesSelect={handleFileSelect}
          label="Drop your PDF here to extract tables to Excel (.xlsx)"
          description="Detects table rows, columns, numerical data, and text cells into a formatted spreadsheet. Up to 50 MB."
        />
      ) : (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-start gap-3.5">
              {pdfInfo?.thumbnailDataUrl ? (
                <img
                  src={pdfInfo.thumbnailDataUrl}
                  alt="First page preview"
                  className="w-14 h-14 object-cover rounded-lg border border-slate-200 shadow-xs"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <Table className="size-6" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-slate-900 text-base">{file.name}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                  <span>{formatBytes(file.size)}</span>
                  <span>•</span>
                  <span>{pdfInfo?.pageCount || 1} pages</span>
                </div>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={handleReset} disabled={processing}>
              Change File
            </Button>
          </div>

          {!result && (
            <div className="space-y-5">
              <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700">
                <Info className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                  Tables, invoices, financial reports, and aligned columns in your PDF are extracted into individual sheet tabs for each page.
                </p>
              </div>

              {processing && progress && (
                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-emerald-900">
                    <span>{progress.stage}</span>
                    <span>{progress.percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
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

              <div className="flex justify-end pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  disabled={processing}
                  onClick={handleConvert}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {processing ? (
                    <>
                      <RefreshCw className="size-4 mr-2 animate-spin" />
                      Converting to Excel (.xlsx)...
                    </>
                  ) : (
                    <>
                      <Table className="size-4 mr-2" />
                      Convert to Excel (.xlsx)
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="size-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950">Excel Spreadsheet Ready!</h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      {result.filename} • {formatBytes(result.metadata?.convertedSize || 0)} • {result.pageCount} sheets
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
                  Download Excel (.xlsx)
                </Button>
              </div>

              {result.warnings && result.warnings.length > 0 && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Info className="size-3.5 text-slate-500" />
                    Data Extraction Notes
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
  );
}

