import React, { useState } from 'react';
import {
  Download,
  FileText,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Lock,
} from 'lucide-react';
import { FileUploadZone } from '../../components/ui/FileUpload';
import { Button } from '../../components/ui/FormElements';
import { downloadBlob, formatBytes } from '../../utils/file';
import { convertWordToPdf } from '../../services/documentConversion/wordToPdf';
import type { ConversionResult, ConversionProgress } from '../../services/documentConversion/types';

export function WordToPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<ConversionProgress | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setResult(null);
    setError(null);
    setProgress(null);
  };

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setProgress({ stage: 'Reading Word document...', percent: 15 });

    try {
      const buffer = await file.arrayBuffer();
      const convResult = await convertWordToPdf(buffer, file.name, {
        onProgress: (p) => setProgress(p),
      });

      setResult(convResult);
    } catch (err: any) {
      console.error('Word to PDF failed:', err);
      setError(err?.message || 'Could not convert Word document to PDF. Ensure it is a valid .docx file.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(null);
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <FileUploadZone
          accept={{
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/msword': ['.doc'],
          }}
          onFilesSelect={handleFileSelect}
          label="Drop your Word document (.docx) here to convert to PDF"
          description="Preserves typography, lists, tables, and images. 100% private in-browser conversion. Up to 50 MB."
        />
      ) : (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="size-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <FileText className="size-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-base">{file.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Word Document • {formatBytes(file.size)}</p>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={handleReset} disabled={processing}>
              Change File
            </Button>
          </div>

          {!result && (
            <div className="space-y-5">
              <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700">
                <Lock className="size-4 text-slate-500 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                  Your document is converted directly in your browser. No files are uploaded to any third-party or cloud servers.
                </p>
              </div>

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
                      Converting to PDF...
                    </>
                  ) : (
                    <>
                      <FileText className="size-4 mr-2" />
                      Convert to PDF
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
                    <h4 className="text-sm font-bold text-emerald-950">PDF Document Ready!</h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      {result.filename} • {formatBytes(result.metadata?.convertedSize || 0)} • {result.pageCount} pages
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
                  Download PDF
                </Button>
              </div>

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

