import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Download, ArrowLeft, ArrowRight, Trash2, RefreshCw, FileText } from 'lucide-react';
import { FileUploadZone } from '../../components/ui/FileUpload';
import { Button } from '../../components/ui/FormElements';
import { downloadBlob, formatBytes } from '../../utils/file';

interface PageItem {
  id: string;
  originalIndex: number;
}

export function PDFOrganizer() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [processing, setProcessing] = useState<boolean>(false);

  const handleFileSelect = async (files: File[]) => {
    if (files.length > 0) {
      const f = files[0];
      setFile(f);
      try {
        const buffer = await f.arrayBuffer();
        const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const count = doc.getPageCount();
        const pList: PageItem[] = [];
        for (let i = 0; i < count; i++) {
          pList.push({ id: `p-${i}`, originalIndex: i });
        }
        setPages(pList);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const movePage = (from: number, to: number) => {
    if (to < 0 || to >= pages.length) return;
    const copy = [...pages];
    const [moved] = copy.splice(from, 1);
    copy.splice(to, 0, moved);
    setPages(copy);
  };

  const deletePage = (index: number) => {
    if (pages.length <= 1) {
      alert('A PDF must contain at least one page.');
      return;
    }
    const copy = [...pages];
    copy.splice(index, 1);
    setPages(copy);
  };

  const handleSave = async () => {
    if (!file || pages.length === 0) return;
    setProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(buffer);
      const newDoc = await PDFDocument.create();

      const pageIndices = pages.map((p) => p.originalIndex);
      const copied = await newDoc.copyPages(doc, pageIndices);
      copied.forEach((p) => newDoc.addPage(p));

      const bytes = await newDoc.save();
      downloadBlob(
        new Blob([bytes], { type: 'application/pdf' }),
        `${file.name.replace(/\.pdf$/i, '')}-reorganized.pdf`
      );
    } catch (e) {
      console.error(e);
      alert('Error reorganizing PDF pages.');
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
          label="Drop a PDF to reorganize, reorder, or delete pages"
          description="Drag or click arrows to rearrange pages and remove unwanted ones"
        />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">{file.name}</h3>
              <p className="text-xs text-slate-500">
                {formatBytes(file.size)} • {pages.length} pages remaining
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFile(null);
                  setPages([]);
                }}
              >
                Change File
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={processing || pages.length === 0}
                onClick={handleSave}
              >
                {processing ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-1.5" />
                ) : (
                  <Download className="w-4 h-4 mr-1.5" />
                )}
                Save Reordered PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {pages.map((p, idx) => (
              <div
                key={p.id}
                className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-orange-600 bg-orange-100 dark:bg-orange-950/40 px-2 py-0.5 rounded-full">
                    Page {idx + 1}
                  </span>
                  <button
                    onClick={() => deletePage(idx)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    title="Delete page"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="w-full aspect-[3/4] bg-white dark:bg-slate-800 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center p-2 text-center">
                  <FileText className="w-8 h-8 text-orange-400 mb-1" />
                  <span className="text-[10px] text-slate-400">Orig #{p.originalIndex + 1}</span>
                </div>

                <div className="flex items-center gap-1 w-full justify-between pt-1">
                  <button
                    disabled={idx === 0}
                    onClick={() => movePage(idx, idx - 1)}
                    className="p-1 rounded text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={idx === pages.length - 1}
                    onClick={() => movePage(idx, idx + 1)}
                    className="p-1 rounded text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
