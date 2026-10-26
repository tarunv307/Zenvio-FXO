import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Download, CheckSquare, Square, RefreshCw, FileText } from 'lucide-react';
import { FileUploadZone } from '../../components/ui/FileUpload';
import { Button } from '../../components/ui/FormElements';
import { downloadBlob, formatBytes } from '../../utils/file';

export function PDFPageExtractor() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [processing, setProcessing] = useState<boolean>(false);

  const handleFileSelect = async (files: File[]) => {
    if (files.length > 0) {
      const f = files[0];
      setFile(f);
      try {
        const buffer = await f.arrayBuffer();
        const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const count = doc.getPageCount();
        setPageCount(count);
        setSelectedPages(new Set([0]));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const togglePage = (index: number) => {
    const next = new Set(selectedPages);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setSelectedPages(next);
  };

  const selectAll = () => {
    const all = new Set<number>();
    for (let i = 0; i < pageCount; i++) all.add(i);
    setSelectedPages(all);
  };

  const selectOdd = () => {
    const odd = new Set<number>();
    for (let i = 0; i < pageCount; i += 2) odd.add(i);
    setSelectedPages(odd);
  };

  const selectEven = () => {
    const even = new Set<number>();
    for (let i = 1; i < pageCount; i += 2) even.add(i);
    setSelectedPages(even);
  };

  const handleExtract = async () => {
    if (!file || selectedPages.size === 0) return;
    setProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(buffer);
      const newDoc = await PDFDocument.create();

      const sortedIndices = Array.from(selectedPages).sort((a, b) => a - b);
      const copied = await newDoc.copyPages(doc, sortedIndices);
      copied.forEach((p) => newDoc.addPage(p));

      const bytes = await newDoc.save();
      downloadBlob(
        new Blob([bytes], { type: 'application/pdf' }),
        `${file.name.replace(/\.pdf$/i, '')}-extracted.pdf`
      );
    } catch (e) {
      console.error(e);
      alert('Error extracting pages.');
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
          label="Drop a PDF to visually pick and extract pages"
          description="Click any pages to include in your new extracted PDF document"
        />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">{file.name}</h3>
              <p className="text-xs text-slate-500">
                {formatBytes(file.size)} • {selectedPages.size} of {pageCount} pages selected
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={selectOdd}>
                Odd Pages
              </Button>
              <Button variant="outline" size="sm" onClick={selectEven}>
                Even Pages
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedPages(new Set())}>
                Clear
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {Array.from({ length: pageCount }).map((_, idx) => {
              const isSelected = selectedPages.has(idx);
              return (
                <button
                  key={idx}
                  onClick={() => togglePage(idx)}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-between gap-2 transition-all ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/70 dark:bg-orange-950/30 text-orange-600 ring-2 ring-orange-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-500'
                  }`}
                >
                  <div className="w-full flex justify-end">
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-orange-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                    )}
                  </div>
                  <FileText className={`w-7 h-7 ${isSelected ? 'text-orange-500' : 'text-slate-400'}`} />
                  <span className="text-xs font-semibold">Page {idx + 1}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              variant="primary"
              size="lg"
              disabled={selectedPages.size === 0 || processing}
              onClick={handleExtract}
            >
              {processing ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Extracting...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" /> Extract {selectedPages.size} Selected Pages
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
