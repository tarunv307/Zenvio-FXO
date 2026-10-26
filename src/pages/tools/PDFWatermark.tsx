import React, { useState } from 'react';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { Download, ShieldAlert, RefreshCw } from 'lucide-react';
import { FileUploadZone } from '../../components/ui/FileUpload';
import { Button, Input, RangeSlider } from '../../components/ui/FormElements';
import { downloadBlob, formatBytes } from '../../utils/file';

export function PDFWatermark() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState<number>(48);
  const [opacity, setOpacity] = useState<number>(0.3);
  const [rotation, setRotation] = useState<number>(45);
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

  const handleWatermark = async () => {
    if (!file) return;
    setProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(buffer);
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      const pages = doc.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
        const textHeight = font.heightAtSize(fontSize);

        page.drawText(watermarkText, {
          x: width / 2 - (textWidth / 2) * Math.cos((rotation * Math.PI) / 180),
          y: height / 2 - (textWidth / 2) * Math.sin((rotation * Math.PI) / 180),
          size: fontSize,
          font,
          color: rgb(0.8, 0.2, 0.2),
          opacity,
          rotate: degrees(rotation),
        });
      }

      const bytes = await doc.save();
      downloadBlob(
        new Blob([bytes], { type: 'application/pdf' }),
        `${file.name.replace(/\.pdf$/i, '')}-watermarked.pdf`
      );
    } catch (e) {
      console.error(e);
      alert('Error adding watermark to PDF.');
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
          label="Drop a PDF to stamp a security or draft watermark"
          description="Applies angled or centered watermark text across every page"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Watermark Text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="CONFIDENTIAL, DRAFT, SAMPLE"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>Font Size: {fontSize}pt</span>
              </div>
              <RangeSlider
                min={24}
                max={96}
                step={4}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>Opacity: {Math.round(opacity * 100)}%</span>
              </div>
              <RangeSlider
                min={0.05}
                max={0.8}
                step={0.05}
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>Rotation Angle: {rotation}°</span>
              </div>
              <RangeSlider
                min={-90}
                max={90}
                step={5}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
              />
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
            disabled={processing}
            onClick={handleWatermark}
          >
            {processing ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Stamping Watermark...
              </>
            ) : (
              <>
                <ShieldAlert className="w-5 h-5 mr-2" /> Stamp Watermark & Download
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
