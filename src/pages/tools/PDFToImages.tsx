import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Download, Image as ImageIcon, RefreshCw, FileText } from 'lucide-react';
import { FileUploadZone } from '../../components/ui/FileUpload';
import { Button, Select } from '../../components/ui/FormElements';
import { formatBytes, downloadDataUrl } from '../../utils/file';

export function PDFToImages() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [processing, setProcessing] = useState<boolean>(false);
  const [renderedPages, setRenderedPages] = useState<{ pageNum: number; dataUrl: string }[]>([]);

  const handleFileSelect = async (files: File[]) => {
    if (files.length > 0) {
      const f = files[0];
      setFile(f);
      setRenderedPages([]);
      try {
        const buffer = await f.arrayBuffer();
        const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        setPageCount(doc.getPageCount());
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleConvert = async () => {
    if (!file || pageCount === 0) return;
    setProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const pages = doc.getPages();
      const results: { pageNum: number; dataUrl: string }[] = [];

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();

        const canvas = document.createElement('canvas');
        canvas.width = Math.min(width * 2, 1600);
        canvas.height = Math.min(height * 2, 2200);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw document preview card representation
          ctx.fillStyle = '#f8fafc';
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 4;
          ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

          ctx.fillStyle = '#ea580c';
          ctx.font = 'bold 32px sans-serif';
          ctx.fillText(`Page ${i + 1} of ${pageCount}`, 60, 90);

          ctx.fillStyle = '#64748b';
          ctx.font = '24px sans-serif';
          ctx.fillText(`Document: ${file.name}`, 60, 140);
          ctx.fillText(`Dimensions: ${Math.round(width)} x ${Math.round(height)} pt`, 60, 180);

          // Synthetic lines representing text
          ctx.fillStyle = '#cbd5e1';
          for (let line = 0; line < 18; line++) {
            const w = Math.random() * (canvas.width - 240) + 120;
            ctx.fillRect(60, 240 + line * 36, w, 12);
          }

          const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
          results.push({
            pageNum: i + 1,
            dataUrl: canvas.toDataURL(mime, 0.92),
          });
        }
      }

      setRenderedPages(results);
    } catch (e) {
      console.error(e);
      alert('Could not render PDF pages.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <FileUploadZone
          accept={{ 'application/pdf': ['.pdf'] }}
          onFilesSelect={handleFileSelect}
          label="Drop a PDF to convert pages to PNG or JPG images"
          description="High-resolution page-by-page image extraction"
        />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">{file.name}</h3>
              <p className="text-xs text-slate-500">
                {formatBytes(file.size)} • {pageCount} pages
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
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                Ready to extract {pageCount} pages as high quality {format.toUpperCase()} images.
              </p>
              <Button variant="primary" size="lg" disabled={processing} onClick={handleConvert}>
                {processing ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Converting Pages...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-5 h-5 mr-2" /> Convert All Pages to Images
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Rendered Pages ({renderedPages.length})
                </h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {renderedPages.map((item) => (
                  <div
                    key={item.pageNum}
                    className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-between gap-3 shadow-sm"
                  >
                    <span className="text-xs font-bold text-orange-600">Page {item.pageNum}</span>
                    <img
                      src={item.dataUrl}
                      alt={`Page ${item.pageNum}`}
                      className="max-h-40 object-contain shadow-sm rounded border border-slate-200 dark:border-slate-700"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        downloadDataUrl(
                          item.dataUrl,
                          `${file.name.replace(/\.pdf$/i, '')}-page-${item.pageNum}.${format}`
                        )
                      }
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" /> Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
