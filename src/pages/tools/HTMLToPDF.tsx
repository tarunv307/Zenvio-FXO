import React, { useState } from 'react';
import {
  Download,
  Code2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Eye,
  FileCode,
} from 'lucide-react';
import { FileUploadZone } from '../../components/ui/FileUpload';
import { Button, Select, Textarea } from '../../components/ui/FormElements';
import { downloadBlob, formatBytes } from '../../utils/file';
import { convertHtmlToPdf } from '../../services/documentConversion/htmlToPdf';
import type { ConversionResult, ConversionProgress } from '../../services/documentConversion/types';

export function HTMLToPDF() {
  const [activeTab, setActiveTab] = useState<'upload' | 'code'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [htmlCode, setHtmlCode] = useState<string>(
    `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 24px; color: #1e293b; }
    h1 { color: #2563eb; font-size: 24px; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
    p { font-size: 14px; line-height: 1.6; color: #475569; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
    th { background: #f1f5f9; color: #0f172a; }
  </style>
</head>
<body>
  <h1>Document Report</h1>
  <p>Generated with Zenvio FXO Document Studio HTML to PDF converter.</p>
  
  <div class="card">
    <strong>Executive Summary:</strong>
    <p>This report documents conversion metrics and formatted data tables.</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Category</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Presentation Deck</td>
        <td>PowerPoint</td>
        <td>Complete</td>
      </tr>
      <tr>
        <td>Executive Document</td>
        <td>Word</td>
        <td>Verified</td>
      </tr>
    </tbody>
  </table>
</body>
</html>`
  );

  const [pageSize, setPageSize] = useState<'a4' | 'letter'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
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
    try {
      const text = await f.text();
      setHtmlCode(text);
    } catch (err: any) {
      console.error('Failed to read file:', err);
    }
  };

  const handleConvert = async () => {
    const content = activeTab === 'upload' && file ? htmlCode : htmlCode;
    if (!content.trim()) {
      setError('Please provide HTML content or upload an HTML file.');
      return;
    }

    setProcessing(true);
    setError(null);
    setProgress({ stage: 'Rendering HTML to vector PDF canvas...', percent: 20 });

    try {
      const filename = file ? file.name : 'document.html';
      const convResult = await convertHtmlToPdf(content, filename, {
        pageSize,
        orientation,
        onProgress: (p) => setProgress(p),
      });

      setResult(convResult);
    } catch (err: any) {
      console.error('HTML to PDF failed:', err);
      setError(err?.message || 'Could not convert HTML to PDF.');
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
      {/* Mode Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors cursor-pointer ${
            activeTab === 'upload'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Upload HTML File
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('code')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors cursor-pointer ${
            activeTab === 'code'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Paste HTML Code
        </button>
      </div>

      {activeTab === 'upload' && !file && (
        <FileUploadZone
          accept={{
            'text/html': ['.html', '.htm'],
          }}
          onFilesSelect={handleFileSelect}
          label="Drop your HTML file (.html, .htm) here to convert to PDF"
          description="Preserves HTML5 formatting, CSS styles, tables, and typography. Up to 25 MB."
        />
      )}

      {((activeTab === 'upload' && file) || activeTab === 'code') && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <FileCode className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">
                  {file ? file.name : 'Custom HTML Document'}
                </h3>
                <p className="text-xs text-slate-500">
                  {file ? formatBytes(file.size) : `${htmlCode.length} characters`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-28">
                <Select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as any)}
                  options={[
                    { value: 'a4', label: 'A4' },
                    { value: 'letter', label: 'Letter' },
                  ]}
                />
              </div>
              <div className="w-32">
                <Select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as any)}
                  options={[
                    { value: 'portrait', label: 'Portrait' },
                    { value: 'landscape', label: 'Landscape' },
                  ]}
                />
              </div>
              {file && (
                <Button variant="outline" size="sm" onClick={handleReset} disabled={processing}>
                  Change
                </Button>
              )}
            </div>
          </div>

          {activeTab === 'code' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                HTML & CSS Source
              </label>
              <Textarea
                rows={10}
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                className="font-mono text-xs"
                placeholder="<html>...</html>"
              />
            </div>
          )}

          {!result && (
            <div className="space-y-4">
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
                      Rendering PDF...
                    </>
                  ) : (
                    <>
                      <Code2 className="size-4 mr-2" />
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

