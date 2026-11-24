import React, { useState } from 'react';
import JSZip from 'jszip';
import { Download, Image as ImageIcon, RefreshCw, FileText, CheckCircle2, Archive } from 'lucide-react';
import { FileUploadZone } from '../../components/ui/FileUpload';
import { Button, Select } from '../../components/ui/FormElements';
import { formatBytes, downloadDataUrl, downloadBlob } from '../../utils/file';
import { loadPdfDocument, renderPageToCanvas } from '../../services/documentConversion/pdfRenderer';

export function PDFToImages() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [processing, setProcessing] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [renderedPages, setRenderedPages] = useState<{ pageNum: number; dataUrl: string }[]>([]);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const handleFileSelect = async (files: File[]) => {
    if (files.length > 0) {
      const f = files[0];
      setFile(f);
      setRenderedPages([]);
      setProgressMsg('');
      try {
        const buffer = await f.arrayBuffer();
        const doc = await loadPdfDocument(buffer);
        setPageCount(doc.numPages);
      } catch (err) {
        console.error('Failed to inspect PDF:', err);
      }
    }
  };

  const handleConvert = async () => {
    if (!file || pageCount === 0) return;
    setProcessing(true);
    setRenderedPages([]);

    try {
      const buffer = await file.arrayBuffer();
      const doc = await loadPdfDocument(buffer);
      const results: { pageNum: number; dataUrl: string }[] = [];

      for (let i = 1; i <= doc.numPages; i++) {
        setProgressMsg(`Rendering page ${i} of ${doc.numPages}...`);
        const page = await doc.getPage(i);
        const { canvas } = await renderPageToCanvas(page, 2.0); // High-res 2x

        const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
        const dataUrl = canvas.toDataURL(mime, 0.95);

        results.push({
          pageNum: i,
          dataUrl,
        });
      }

      setRenderedPages(results);
    } catch (e) {
      console.error('Rendering error:', e);
      alert('Could not render PDF pages. The file may be password protected or corrupted.');
    } finally {
      setProcessing(false);
      setProgressMsg('');
    }
  };

  const handleDownloadAllZip = async () => {
    if (renderedPages.length === 0 || !file) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const ext = format === 'jpeg' ? 'jpg' : 'png';
      const baseName = file.name.replace(/\.pdf$/i, '');

      for (const item of renderedPages) {
        const base64Data = item.dataUrl.split(',')[1];
        zip.file(`${baseName}-page-${item.pageNum}.${ext}`, base64Data, { base64: true });
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob, `${baseName}-images.zip`);
    } catch (err) {
      console.error('ZIP creation error:', err);
      alert('Failed to generate ZIP archive.');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <FileUploadZone
          accept={{ 'application/pdf': ['.pdf'] }}
          onFilesSelect={handleFileSelect}
          label="Drop a PDF to convert pages to PNG or JPG images"
          description="High-resolution, 2x crisp page-by-page rendering in your browser"
        />
      ) : (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-800">{file.name}</h3>
              <p className="text-xs text-slate-500">
                {formatBytes(file.size)} • {pageCount} {pageCount === 1 ? 'page' : 'pages'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-28">
                <Select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as any)}
                  options={[
                    { value: 'png', label: 'PNG' },
                    { value: 'jpeg', label: 'JPG' },
                  ]}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFile(null);
                  setRenderedPages([]);
                }}
              >
                Change File
              </Button>
            </div>
          </div>

          {renderedPages.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                <ImageIcon className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-700 mb-1">
                Ready to extract {pageCount} pages as high resolution {format.toUpperCase()} images
              </p>
              <p className="text-xs text-slate-500 max-w-md mb-6">
                All pages are processed privately in your browser without uploading to any external server.
              </p>
              <Button variant="primary" size="lg" disabled={processing} onClick={handleConvert}>
                {processing ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    {progressMsg || 'Rendering Pages...'}
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-5 h-5 mr-2" />
                    Convert All Pages to {format.toUpperCase()}
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <div className="flex items-center gap-2 text-emerald-800 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Successfully converted {renderedPages.length} pages
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isZipping}
                  onClick={handleDownloadAllZip}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isZipping ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Creating ZIP...
                    </>
                  ) : (
                    <>
                      <Archive className="w-4 h-4 mr-2" /> Download All as ZIP
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {renderedPages.map((item) => (
                  <div
                    key={item.pageNum}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-between gap-3 shadow-sm hover:border-blue-300 transition-colors"
                  >
                    <span className="text-xs font-bold text-slate-700">Page {item.pageNum}</span>
                    <div className="w-full bg-white rounded border border-slate-200 overflow-hidden flex items-center justify-center p-1">
                      <img
                        src={item.dataUrl}
                        alt={`Page ${item.pageNum}`}
                        className="max-h-44 object-contain"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() =>
                        downloadDataUrl(
                          item.dataUrl,
                          `${file.name.replace(/\.pdf$/i, '')}-page-${item.pageNum}.${format === 'jpeg' ? 'jpg' : 'png'}`
                        )
                      }
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" /> Download
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setRenderedPages([]);
                  }}
                >
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
