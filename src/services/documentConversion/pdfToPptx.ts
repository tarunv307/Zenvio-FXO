import PptxGenJS from 'pptxgenjs';
import {
  loadPdfDocument,
  processFullPdfPage,
} from './pdfRenderer';
import { performOcrOnCanvas } from './ocrService';
import type {
  PdfToPptxOptions,
  ConversionResult,
  ExtractedTextBlock,
} from './types';

/**
 * Convert a PDF file (ArrayBuffer) to a PowerPoint presentation (.pptx)
 * with two conversion modes: 'preserve-layout' and 'editable-content'.
 */
export async function convertPdfToPptx(
  pdfBuffer: ArrayBuffer,
  filename: string,
  options: PdfToPptxOptions
): Promise<ConversionResult> {
  const startTime = Date.now();
  const { mode = 'preserve-layout', enableOcr = true, onProgress } = options;
  const warnings: string[] = [];

  onProgress?.({
    stage: 'Opening PDF document...',
    percent: 10,
  });

  const pdfDoc = await loadPdfDocument(pdfBuffer);
  const totalPages = pdfDoc.numPages;

  if (totalPages === 0) {
    throw new Error('PDF document contains no pages.');
  }

  // Create PPTX Presentation
  const pptx = new PptxGenJS();
  pptx.author = 'Zenvio FXO Document Studio';
  pptx.company = 'Zenvio FXO';
  pptx.title = filename.replace(/\.pdf$/i, '');

  let ocrAppliedAnyPage = false;

  // Process first page to define layout dimensions
  const firstPage = await pdfDoc.getPage(1);
  const firstViewport = firstPage.getViewport({ scale: 1.0 });
  const baseWidthPt = firstViewport.width;
  const baseHeightPt = firstViewport.height;

  // Calculate slide dimensions in inches (72 points = 1 inch)
  const slideWidthInches = Math.round((baseWidthPt / 72) * 100) / 100;
  const slideHeightInches = Math.round((baseHeightPt / 72) * 100) / 100;

  // Define layout to perfectly match the PDF page dimensions
  pptx.defineLayout({
    name: 'PDF_MATCHED_LAYOUT',
    width: Math.max(5, slideWidthInches),
    height: Math.max(4, slideHeightInches),
  });
  pptx.layout = 'PDF_MATCHED_LAYOUT';

  // Process all pages
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const pagePercent = Math.round(15 + ((pageNum - 1) / totalPages) * 70);
    onProgress?.({
      stage: `Processing slide ${pageNum} of ${totalPages}...`,
      percent: pagePercent,
      currentPage: pageNum,
      totalPages,
    });

    const page = await pdfDoc.getPage(pageNum);
    const fullPage = await processFullPdfPage(page, pageNum, 2.0);

    const slide = pptx.addSlide();
    let textBlocksToUse = fullPage.textBlocks;

    // Check if this page is a scanned document (little to no digital text)
    const isScanned = !fullPage.hasDigitalText || fullPage.totalTextLength < 25;
    if (isScanned) {
      if (enableOcr) {
        onProgress?.({
          stage: `Running OCR on scanned slide ${pageNum}...`,
          percent: pagePercent + 5,
          currentPage: pageNum,
          totalPages,
        });

        const ocrBlocks = await performOcrOnCanvas(
          fullPage.canvas,
          fullPage.widthPt,
          fullPage.heightPt,
          options.ocrLanguage || 'eng'
        );

        if (ocrBlocks.length > 0) {
          textBlocksToUse = ocrBlocks;
          ocrAppliedAnyPage = true;
        } else {
          warnings.push(`Slide ${pageNum}: Page appears to be an image/scan with low-contrast text.`);
        }
      } else {
        warnings.push(`Slide ${pageNum}: No selectable digital text found. Enable OCR for scanned slides.`);
      }
    }

    if (mode === 'preserve-layout') {
      // ─── Mode 1: Preserve Original Layout ────────────────────────────────────
      // 1. Full-fidelity background render of the original page
      slide.addImage({
        data: fullPage.imageDataUrl,
        x: 0,
        y: 0,
        w: slideWidthInches,
        h: slideHeightInches,
      });

      // 2. Reconstruct editable text boxes mapped directly onto original positions
      for (const block of textBlocksToUse) {
        const xIn = (block.x / fullPage.widthPt) * slideWidthInches;
        const yIn = (block.y / fullPage.heightPt) * slideHeightInches;
        const wIn = Math.min(
          slideWidthInches - xIn,
          Math.max(0.6, (block.width / fullPage.widthPt) * slideWidthInches * 1.1)
        );
        const hIn = Math.min(
          slideHeightInches - yIn,
          Math.max(0.3, (block.height / fullPage.heightPt) * slideHeightInches * 1.15)
        );

        // Clamped font size in pt
        const fontSizePt = Math.max(9, Math.min(48, Math.round(block.fontSize * 0.95)));

        // Create editable text box overlay (transparent background with dark or white text)
        slide.addText(block.text, {
          x: xIn,
          y: yIn,
          w: wIn,
          h: hIn,
          fontSize: fontSizePt,
          fontFace: 'Arial',
          color: '0F172A',
          bold: block.isHeading,
          margin: 0,
          wrap: true,
          fill: { color: 'FFFFFF', transparency: 85 }, // Semi-translucent for readability and editing
        });
      }
    } else {
      // ─── Mode 2: Editable Content ────────────────────────────────────────────
      // Clean slide layout where text and shapes are native PowerPoint objects
      slide.background = { color: 'FFFFFF' };

      // Optional decorative header bar
      slide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: slideWidthInches,
        h: 0.1,
        fill: { color: '2563EB' },
        line: { color: '2563EB', width: 0 },
      });

      // If slide had minimal text and is scanned, also provide the source image as a reference card
      if (isScanned && textBlocksToUse.length === 0) {
        slide.addImage({
          data: fullPage.imageDataUrl,
          x: 0.5,
          y: 0.5,
          w: slideWidthInches - 1,
          h: slideHeightInches - 1,
        });
        continue;
      }

      // Add structured text boxes
      let currentTopY = 0.5;

      for (const block of textBlocksToUse) {
        const xIn = Math.max(0.5, (block.x / fullPage.widthPt) * (slideWidthInches - 1));
        const originalY = (block.y / fullPage.heightPt) * (slideHeightInches - 1);
        const yIn = Math.max(currentTopY, originalY);
        const wIn = Math.min(slideWidthInches - xIn - 0.5, Math.max(2, (block.width / fullPage.widthPt) * slideWidthInches));
        const hIn = Math.max(0.35, (block.height / fullPage.heightPt) * slideHeightInches);

        const isTitle = block.isHeading || block.fontSize > 20;
        const fontSizePt = isTitle
          ? Math.max(18, Math.min(36, Math.round(block.fontSize)))
          : Math.max(10, Math.min(16, Math.round(block.fontSize)));

        slide.addText(block.text, {
          x: xIn,
          y: yIn,
          w: wIn,
          h: hIn,
          fontSize: fontSizePt,
          fontFace: 'Segoe UI',
          color: isTitle ? '0F172A' : '334155',
          bold: isTitle,
          wrap: true,
          margin: 4,
        });

        currentTopY = Math.min(slideHeightInches - 0.8, yIn + hIn + 0.15);
      }
    }
  }

  onProgress?.({
    stage: 'Generating PowerPoint presentation file...',
    percent: 90,
  });

  const pptxBlob = (await pptx.write({ outputType: 'blob' })) as Blob;

  const duration = Date.now() - startTime;
  const outFilename = filename.replace(/\.[^/.]+$/, '') + '.pptx';

  if (ocrAppliedAnyPage) {
    warnings.push('Optical Character Recognition (OCR) was used on scanned slides. Text accuracy may vary.');
  }

  warnings.push('Fonts and complex shapes may require minor formatting adjustments in PowerPoint.');

  onProgress?.({
    stage: 'Conversion complete!',
    percent: 100,
  });

  return {
    blob: pptxBlob,
    filename: outFilename,
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    pageCount: totalPages,
    warnings,
    metadata: {
      originalSize: pdfBuffer.byteLength,
      convertedSize: pptxBlob.size,
      processingTimeMs: duration,
      pagesConverted: totalPages,
      modeUsed: mode,
      ocrApplied: ocrAppliedAnyPage,
    },
  };
}

