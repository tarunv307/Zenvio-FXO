import { jsPDF } from 'jspdf';
import type { HtmlToPdfOptions, ConversionResult } from './types';

/**
 * Convert raw HTML or an HTML file to a formatted PDF document.
 */
export async function convertHtmlToPdf(
  htmlContent: string,
  filename: string,
  options: HtmlToPdfOptions = {}
): Promise<ConversionResult> {
  const startTime = Date.now();
  const { onProgress, pageSize = 'a4', orientation = 'portrait' } = options;
  const warnings: string[] = [];

  onProgress?.({
    stage: 'Parsing HTML content and stylesheets...',
    percent: 25,
  });

  const pageWidth = orientation === 'landscape' ? 842 : 595;
  const pageHeight = orientation === 'landscape' ? 595 : 842;

  // Create an isolated rendering container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = `${pageWidth}px`;
  container.style.padding = '36px 48px';
  container.style.background = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  container.style.boxSizing = 'border-box';

  // Apply default styles to plain HTML
  container.innerHTML = `
    <style>
      body, html { margin: 0; padding: 0; }
      img { max-width: 100%; height: auto; }
      table { width: 100%; border-collapse: collapse; margin: 12px 0; }
      th, td { border: 1px solid #cbd5e1; padding: 6px 10px; }
      th { background: #f1f5f9; }
      pre, code { font-family: monospace; background: #f1f5f9; padding: 2px 4px; border-radius: 4px; }
    </style>
    ${htmlContent}
  `;

  document.body.appendChild(container);

  try {
    onProgress?.({
      stage: 'Rendering pages to PDF canvas...',
      percent: 60,
    });

    const pdf = new jsPDF({
      orientation,
      unit: 'pt',
      format: pageSize,
    });

    await pdf.html(container, {
      callback: () => {},
      x: 0,
      y: 0,
      width: pageWidth,
      windowWidth: pageWidth,
      autoPaging: 'text',
      margin: [20, 0, 20, 0],
    });

    const totalPages = pdf.getNumberOfPages();
    const pdfBlob = pdf.output('blob');

    const duration = Date.now() - startTime;
    const outFilename = filename.replace(/\.(html|htm)$/i, '') + '.pdf';

    onProgress?.({
      stage: 'Conversion complete!',
      percent: 100,
    });

    return {
      blob: pdfBlob,
      filename: outFilename,
      mimeType: 'application/pdf',
      pageCount: totalPages,
      warnings,
      metadata: {
        originalSize: new Blob([htmlContent]).size,
        convertedSize: pdfBlob.size,
        processingTimeMs: duration,
        pagesConverted: totalPages,
      },
    };
  } finally {
    document.body.removeChild(container);
  }
}

