import React, { useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { RotateCw, RotateCcw, Download, RefreshCw } from 'lucide-react';
import { FileUploadZone } from '../../components/ui/FileUpload';
import { Button } from '../../components/ui/FormElements';
import { downloadBlob, formatBytes } from '../../utils/file';

export function RotatePDF() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [rotationAngle, setRotationAngle] = useState<number>(90);
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

  const handleRotate = async () => {
    if (!file) return;
    setProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);
      const pages = pdfDoc.getPages();

      pages.forEach((page) => {
        const currentRot = page.getRotation().angle;
        page.setRotation(degrees((currentRot + rotationAngle) % 360));
      });

      const pdfBytes = await pdfDoc.save();
      downloadBlob(
        new Blob([pdfBytes], { type: 'application/pdf' }),
        `${file.name.replace(/\.pdf$/i, '')}-rotated-${rotationAngle}deg.pdf`
      );
    } catch (e) {
      console.error(e);
      alert('Error rotating PDF pages.');
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
          label="Drop a PDF to rotate its pages"
          description="Rotate all pages by 90°, 180°, or 270° clockwise"
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

          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
              Rotation Angle
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { angle: 90, label: '90° Clockwise', icon: RotateCw },
                { angle: 180, label: '180° Flip', icon: RotateCw },
                { angle: 270, label: '90° Counter-Clockwise', icon: RotateCcw },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.angle}
                    onClick={() => setRotationAngle(item.angle)}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                      rotationAngle === item.angle
                        ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 text-orange-600'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
            disabled={processing}
            onClick={handleRotate}
          >
            {processing ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Rotating PDF...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" /> Download Rotated PDF
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
