import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Download, Scissors, RefreshCw } from 'lucide-react';
import { FileUploadZone } from '../../components/ui/FileUpload';
import { Button, Input } from '../../components/ui/FormElements';
import { downloadBlob, formatBytes } from '../../utils/file';

export function SplitPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [pageRange, setPageRange] = useState<string>('1');
  const [splitMode, setSplitMode] = useState<'range' | 'single'>('range');
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
        setPageRange(count > 1 ? `1-${Math.min(count, 3)}` : '1');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const parseRanges = (str: string, total: number): number[] => {
    const pages = new Set<number>();
    const parts = str.split(',').map((s) => s.trim());
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map((v) => parseInt(v.trim(), 10));
        if (!isNaN(start) && !isNaN(end)) {
          for (let p = Math.max(1, start); p <= Math.min(total, end); p++) {
            pages.add(p - 1);
          }
        }
      } else {
        const p = parseInt(part, 10);
        if (!isNaN(p) && p >= 1 && p <= total) {
          pages.add(p - 1);
        }
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  const handleSplit = async () => {
    if (!file || pageCount === 0) return;
    setProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(buffer);

      if (splitMode === 'range') {
        const indices = parseRanges(pageRange, pageCount);
        if (indices.length === 0) {
          alert('Please enter a valid page range.');
          setProcessing(false);
          return;
        }

        const newDoc = await PDFDocument.create();
        const copied = await newDoc.copyPages(doc, indices);
        copied.forEach((p) => newDoc.addPage(p));

        const bytes = await newDoc.save();
        downloadBlob(
          new Blob([bytes], { type: 'application/pdf' }),
          `${file.name.replace(/\.pdf$/i, '')}-pages-${pageRange.replace(/\s+/g, '')}.pdf`
        );
      } else {
        // Download each page individually (or page 1 if not zipped)
        for (let i = 0; i < pageCount; i++) {
          const singleDoc = await PDFDocument.create();
          const [p] = await singleDoc.copyPages(doc, [i]);
          singleDoc.addPage(p);
          const bytes = await singleDoc.save();
          downloadBlob(
            new Blob([bytes], { type: 'application/pdf' }),
            `${file.name.replace(/\.pdf$/i, '')}-page-${i + 1}.pdf`
          );
        }
      }
    } catch (e) {
      console.error(e);
      alert('Error splitting PDF file.');
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
          label="Drop a PDF document to split or extract pages"
          description="Extract specific page ranges or split each page into an individual PDF"
        />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-base">{file.name}</h3>
              <p className="text-xs text-slate-500">
                {formatBytes(file.size)} • {pageCount} {pageCount === 1 ? 'page' : 'pages'} total
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFile(null);
                setPageCount(0);
              }}
            >
              Change File
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="splitMode"
                  checked={splitMode === 'range'}
                  onChange={() => setSplitMode('range')}
                  className="text-orange-600 focus:ring-orange-500"
                />
                Extract Page Range
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="splitMode"
                  checked={splitMode === 'single'}
                  onChange={() => setSplitMode('single')}
                  className="text-orange-600 focus:ring-orange-500"
                />
                Extract All Pages Separately
              </label>
            </div>

            {splitMode === 'range' && (
              <div className="max-w-md">
                <Input
                  label="Pages to Extract (e.g. 1-3, 5)"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  placeholder={`1-${pageCount}`}
                  hint={`Enter page numbers between 1 and ${pageCount}`}
                />
              </div>
            )}
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
            disabled={processing}
            onClick={handleSplit}
          >
            {processing ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Processing Pages...
              </>
            ) : (
              <>
                <Scissors className="w-5 h-5 mr-2" /> Split PDF
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
