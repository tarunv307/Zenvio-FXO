import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Download, Plus, Trash2, ArrowUp, ArrowDown, FileText, RefreshCw } from 'lucide-react';
import { FileUploadZone } from '../../components/ui/FileUpload';
import { Button } from '../../components/ui/FormElements';
import { downloadBlob, formatBytes } from '../../utils/file';

interface PdfFileItem {
  id: string;
  file: File;
  pageCount?: number;
}

export function MergePDF() {
  const [files, setFiles] = useState<PdfFileItem[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleFilesSelect = async (selected: File[]) => {
    const newItems: PdfFileItem[] = [];
    for (const f of selected) {
      let pageCount: number | undefined;
      try {
        const buffer = await f.arrayBuffer();
        const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        pageCount = doc.getPageCount();
      } catch {
        // fallback
      }
      newItems.push({
        id: Math.random().toString(36).substring(7),
        file: f,
        pageCount,
      });
    }
    setFiles((prev) => [...prev, ...newItems]);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= files.length) return;
    const copy = [...files];
    const [removed] = copy.splice(index, 1);
    copy.splice(target, 0, removed);
    setFiles(copy);
  };

  const removeItem = (id: string) => {
    setFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setProcessing(true);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of files) {
        const arrayBuffer = await item.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, 'zenvio-merged.pdf');
    } catch (err) {
      console.error('Merge failed:', err);
      alert('Could not merge the selected PDFs. Ensure they are valid and unencrypted.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <FileUploadZone
        accept={{ 'application/pdf': ['.pdf'] }}
        multiple
        onFilesSelect={handleFilesSelect}
        label="Select or drop multiple PDF files to combine"
        description="Reorder files and merge them into a single clean PDF document"
      />

      {files.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-700">
            <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">
              Selected Files ({files.length})
            </span>
            <Button variant="ghost" size="sm" onClick={() => setFiles([])}>
              Clear All
            </Button>
          </div>

          <div className="space-y-2">
            {files.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                    {index + 1}
                  </div>
                  <FileText className="w-5 h-5 text-orange-500 shrink-0" />
                  <div className="truncate">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                      {item.file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatBytes(item.file.size)} {item.pageCount ? `• ${item.pageCount} pages` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={index === 0}
                    onClick={() => moveItem(index, 'up')}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={index === files.length - 1}
                    onClick={() => moveItem(index, 'down')}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              variant="primary"
              size="lg"
              disabled={files.length < 2 || processing}
              onClick={handleMerge}
            >
              {processing ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Merging Files...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" /> Merge & Download ({files.length} PDFs)
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
