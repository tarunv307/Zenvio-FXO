export * from './types';
export * from './pdfRenderer';
export * from './ocrService';
export * from './pdfToPptx';
export * from './pdfToDocx';
export * from './wordToPdf';
export * from './powerpointToPdf';
export * from './pdfToExcel';
export * from './htmlToPdf';

import { convertPdfToPptx } from './pdfToPptx';
import { convertPdfToDocx } from './pdfToDocx';
import { convertWordToPdf } from './wordToPdf';
import { convertPowerPointToPdf } from './powerpointToPdf';
import { convertPdfToExcel } from './pdfToExcel';
import { convertHtmlToPdf } from './htmlToPdf';
import type { DocumentFormat, ConversionResult, ProgressCallback, PptxConversionMode } from './types';

export interface UniversalConvertOptions {
  sourceFormat: DocumentFormat;
  targetFormat: DocumentFormat;
  pptxMode?: PptxConversionMode;
  enableOcr?: boolean;
  onProgress?: ProgressCallback;
}

/**
 * Universal conversion dispatcher for Document Studio.
 */
export async function executeDocumentConversion(
  file: File | { name: string; buffer: ArrayBuffer; text?: string },
  options: UniversalConvertOptions
): Promise<ConversionResult> {
  const { sourceFormat, targetFormat, pptxMode = 'preserve-layout', enableOcr = true, onProgress } = options;

  let buffer: ArrayBuffer;
  let filename = file.name;

  if ('buffer' in file) {
    buffer = file.buffer;
  } else {
    buffer = await file.arrayBuffer();
  }

  // 1. PDF to PPTX
  if (sourceFormat === 'pdf' && targetFormat === 'pptx') {
    return await convertPdfToPptx(buffer, filename, {
      mode: pptxMode,
      enableOcr,
      onProgress,
    });
  }

  // 2. PDF to DOCX
  if (sourceFormat === 'pdf' && targetFormat === 'docx') {
    return await convertPdfToDocx(buffer, filename, {
      onProgress,
    });
  }

  // 3. Word to PDF
  if (sourceFormat === 'docx' && targetFormat === 'pdf') {
    return await convertWordToPdf(buffer, filename, {
      onProgress,
    });
  }

  // 4. PowerPoint to PDF
  if (sourceFormat === 'pptx' && targetFormat === 'pdf') {
    return await convertPowerPointToPdf(buffer, filename, {
      onProgress,
    });
  }

  // 5. PDF to Excel
  if (sourceFormat === 'pdf' && targetFormat === 'xlsx') {
    return await convertPdfToExcel(buffer, filename, {
      onProgress,
    });
  }

  // 6. HTML to PDF
  if (sourceFormat === 'html' && targetFormat === 'pdf') {
    let htmlText = '';
    if ('text' in file && typeof file.text === 'string') {
      htmlText = file.text;
    } else if (typeof (file as any).text === 'function') {
      htmlText = await (file as any).text();
    } else {
      const decoder = new TextDecoder('utf-8');
      htmlText = decoder.decode(buffer);
    }
    return await convertHtmlToPdf(htmlText, filename, {
      onProgress,
    });
  }

  throw new Error(`Unsupported conversion route: ${sourceFormat.toUpperCase()} to ${targetFormat.toUpperCase()}`);
}
