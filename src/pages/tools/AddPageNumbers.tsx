import React, { useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Download, Hash, RefreshCw } from 'lucide-react';
import { FileUploadZone } from '../../components/ui/FileUpload';
import { Button, Select, Input } from '../../components/ui/FormElements';
import { downloadBlob, formatBytes } from '../../utils/file';

export function AddPageNumbers() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [position, setPosition] = useState<string>('bottom-center');
  const [format, setFormat] = useState<string>('page-of-total');
  const [startFrom, setStartFrom] = useState<number>(1);
  const [skipFirst, setSkipFirst] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);

  const handleFileSelect = async (files: File[]) => {
    if (files.length > 0) {
      const f = files[0];
      setFile(f);
      try {
        const buffer = await f.arrayBuffer();
        const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        setPageCount(doc.getPageCount());
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleApply = async () => {
    if (!file) return;
    setProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(buffer);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();
      const total = pages.length;

      for (let i = 0; i < total; i++) {
        if (skipFirst && i === 0) continue;

        const page = pages[i];
        const { width, height } = page.getSize();
        const currentNum = startFrom + (skipFirst ? i - 1 : i);

        let label = `${currentNum}`;
        if (format === 'page-of-total') {
          label = `Page ${currentNum} of ${skipFirst ? total - 1 : total}`;
        } else if (format === 'slash') {
          label = `${currentNum} / ${skipFirst ? total - 1 : total}`;
        }

        const fontSize = 10;
        const textWidth = font.widthOfTextAtSize(label, fontSize);

        let x = (width - textWidth) / 2;
        let y = 24;

        if (position === 'bottom-right') {
          x = width - textWidth - 36;
          y = 24;
        } else if (position === 'bottom-left') {
          x = 36;
          y = 24;
        } else if (position === 'top-right') {
          x = width - textWidth - 36;
          y = height - 36;
        } else if (position === 'top-center') {
          x = (width - textWidth) / 2;
          y = height - 36;
        }

        page.drawText(label, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });
      }

      const bytes = await doc.save();
      downloadBlob(
        new Blob([bytes], { type: 'application/pdf' }),
        `${file.name.replace(/\.pdf$/i, '')}-numbered.pdf`
      );
    } catch (e) {
      console.error(e);
      alert('Error adding page numbers.');
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
          label="Drop a PDF to insert formatted page numbering"
          description="Customize position, format (Page X of Y), and cover-page skipping"
        />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">{file.name}</h3>
              <p className="text-xs text-slate-500">
                {formatBytes(file.size)} • {pageCount} pages
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Number Position
              </label>
              <Select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                options={[
                  { value: 'bottom-center', label: 'Bottom Center' },
                  { value: 'bottom-right', label: 'Bottom Right' },
                  { value: 'bottom-left', label: 'Bottom Left' },
                  { value: 'top-center', label: 'Top Center' },
                  { value: 'top-right', label: 'Top Right' },
                ]}
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Numbering Style
              </label>
              <Select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                options={[
                  { value: 'page-of-total', label: 'Page 1 of N' },
                  { value: 'slash', label: '1 / N' },
                  { value: 'number', label: '1 (Single Number)' },
                ]}
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Options
              </label>
              <label className="flex items-center gap-2 mt-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={skipFirst}
                  onChange={(e) => setSkipFirst(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                Skip cover page (Page 1)
              </label>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
            disabled={processing}
            onClick={handleApply}
          >
            {processing ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Numbering Pages...
              </>
            ) : (
              <>
                <Hash className="w-5 h-5 mr-2" /> Add Page Numbers & Download
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
