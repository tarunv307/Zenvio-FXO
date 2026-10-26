import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Download, ArrowUp, ArrowDown, Trash2, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { FileUploadZone } from '../../components/ui/FileUpload';
import { Button, Select } from '../../components/ui/FormElements';
import { downloadBlob, formatBytes } from '../../utils/file';

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
}

export function ImagesToPDF() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<'fit' | 'a4' | 'letter'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [processing, setProcessing] = useState(false);

  const handleFilesSelect = (selected: File[]) => {
    const newItems = selected.map((f) => ({
      id: Math.random().toString(36).substring(7),
      file: f,
      previewUrl: URL.createObjectURL(f),
    }));
    setImages((prev) => [...prev, ...newItems]);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= images.length) return;
    const copy = [...images];
    const [moved] = copy.splice(index, 1);
    copy.splice(target, 0, moved);
    setImages(copy);
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleConvert = async () => {
    if (images.length === 0) return;
    setProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const item of images) {
        const buffer = await item.file.arrayBuffer();
        let pdfImage;
        const isPng = item.file.type === 'image/png';

        if (isPng) {
          pdfImage = await pdfDoc.embedPng(buffer);
        } else {
          // For JPEG or WEBP converted to canvas JPEG
          try {
            pdfImage = await pdfDoc.embedJpg(buffer);
          } catch {
            // Fallback render to canvas -> JPEG
            const img = new Image();
            img.src = item.previewUrl;
            await new Promise((r) => (img.onload = r));
            const c = document.createElement('canvas');
            c.width = img.naturalWidth;
            c.height = img.naturalHeight;
            const ctx = c.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            const jpgDataUrl = c.toDataURL('image/jpeg', 0.9);
            const jpgBytes = await (await fetch(jpgDataUrl)).arrayBuffer();
            pdfImage = await pdfDoc.embedJpg(jpgBytes);
          }
        }

        const imgWidth = pdfImage.width;
        const imgHeight = pdfImage.height;

        let pageWidth = 595.28; // A4 standard pt
        let pageHeight = 841.89;

        if (pageSize === 'letter') {
          pageWidth = 612;
          pageHeight = 792;
        } else if (pageSize === 'fit') {
          pageWidth = imgWidth;
          pageHeight = imgHeight;
        }

        if (orientation === 'landscape' && pageSize !== 'fit') {
          const temp = pageWidth;
          pageWidth = pageHeight;
          pageHeight = temp;
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        if (pageSize === 'fit') {
          page.drawImage(pdfImage, {
            x: 0,
            y: 0,
            width: pageWidth,
            height: pageHeight,
          });
        } else {
          // Scale to fit inside page margin
          const margin = 36;
          const maxW = pageWidth - margin * 2;
          const maxH = pageHeight - margin * 2;
          const scale = Math.min(maxW / imgWidth, maxH / imgHeight, 1);
          const scaledW = imgWidth * scale;
          const scaledH = imgHeight * scale;
          const x = (pageWidth - scaledW) / 2;
          const y = (pageHeight - scaledH) / 2;

          page.drawImage(pdfImage, {
            x,
            y,
            width: scaledW,
            height: scaledH,
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'zenvio-images.pdf');
    } catch (e) {
      console.error(e);
      alert('Failed to generate PDF from images.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <FileUploadZone
        accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
        multiple
        onFilesSelect={handleFilesSelect}
        label="Select or drop images to convert to PDF"
        description="Supports JPG, PNG, WEBP — combines all into one clean PDF"
      />

      {images.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                Selected Images ({images.length})
              </h3>
              <p className="text-xs text-slate-500">Reorder pages or adjust document layout</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-32">
                <Select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as any)}
                  options={[
                    { value: 'a4', label: 'A4 Page' },
                    { value: 'letter', label: 'US Letter' },
                    { value: 'fit', label: 'Fit to Image' },
                  ]}
                />
              </div>
              {pageSize !== 'fit' && (
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
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between shadow-sm"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-orange-600 bg-orange-100 dark:bg-orange-950/40 px-2 py-0.5 rounded-full">
                    Page {idx + 1}
                  </span>
                  <button
                    onClick={() => removeImage(item.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="w-full h-32 flex items-center justify-center overflow-hidden rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <img src={item.previewUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                </div>

                <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 truncate max-w-[80px]">
                    {item.file.name}
                  </span>
                  <div className="flex gap-1">
                    <button
                      disabled={idx === 0}
                      onClick={() => moveImage(idx, 'up')}
                      className="p-1 rounded text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={idx === images.length - 1}
                      onClick={() => moveImage(idx, 'down')}
                      className="p-1 rounded text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              variant="primary"
              size="lg"
              disabled={images.length === 0 || processing}
              onClick={handleConvert}
            >
              {processing ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Building PDF...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" /> Download Combined PDF
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
