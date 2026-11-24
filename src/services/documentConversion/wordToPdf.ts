import mammoth from 'mammoth';
import { jsPDF } from 'jspdf';
import type { WordToPdfOptions, ConversionResult } from './types';

/**
 * Convert a Microsoft Word document (.docx) to a PDF file.
 */
export async function convertWordToPdf(
  docxBuffer: ArrayBuffer,
  filename: string,
  options: WordToPdfOptions = {}
): Promise<ConversionResult> {
  const startTime = Date.now();
  const { onProgress } = options;
  const warnings: string[] = [];

  onProgress?.({
    stage: 'Parsing Word document structure...',
    percent: 20,
  });

  // Extract HTML with formatting from DOCX
  const mammothResult = await mammoth.convertToHtml({ arrayBuffer: docxBuffer });
  const htmlContent = mammothResult.value;

  if (mammothResult.messages && mammothResult.messages.length > 0) {
    for (const msg of mammothResult.messages.slice(0, 3)) {
      warnings.push(msg.message);
    }
  }

  if (!htmlContent || htmlContent.trim().length === 0) {
    throw new Error('Word document is empty or could not be parsed.');
  }

  onProgress?.({
    stage: 'Rendering document layout...',
    percent: 50,
  });

  // Create an offscreen container with clean document styling
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '595px'; // Standard A4 width in pt
  container.style.padding = '40px 48px';
  container.style.background = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily = 'Calibri, Arial, sans-serif';
  container.style.fontSize = '12pt';
  container.style.lineHeight = '1.6';
  container.style.boxSizing = 'border-box';

  // Inject sanitized HTML with reset CSS
  container.innerHTML = `
    <style>
      .word-doc-body h1 { font-size: 22pt; font-weight: bold; margin: 18pt 0 8pt 0; color: #0f172a; }
      .word-doc-body h2 { font-size: 16pt; font-weight: bold; margin: 14pt 0 6pt 0; color: #1e293b; }
      .word-doc-body h3 { font-size: 13pt; font-weight: bold; margin: 10pt 0 4pt 0; color: #334155; }
      .word-doc-body p { margin: 0 0 8pt 0; color: #334155; }
      .word-doc-body ul, .word-doc-body ol { margin: 0 0 8pt 20pt; padding: 0; }
      .word-doc-body li { margin-bottom: 4pt; }
      .word-doc-body table { width: 100%; border-collapse: collapse; margin: 10pt 0; }
      .word-doc-body th, .word-doc-body td { border: 1px solid #cbd5e1; padding: 6pt 8pt; text-align: left; }
      .word-doc-body th { background-color: #f8fafc; font-weight: 600; }
      .word-doc-body img { max-width: 100%; height: auto; display: block; margin: 8pt 0; }
    </style>
    <div class="word-doc-body">
      ${htmlContent}
    </div>
  `;

  document.body.appendChild(container);

  try {
    onProgress?.({
      stage: 'Generating PDF pages...',
      percent: 75,
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    await pdf.html(container, {
      callback: () => {},
      x: 0,
      y: 0,
      width: 595,
      windowWidth: 595,
      autoPaging: 'text',
      margin: [20, 0, 20, 0],
    });

    const totalPages = pdf.getNumberOfPages();
    const pdfBlob = pdf.output('blob');

    const duration = Date.now() - startTime;
    const outFilename = filename.replace(/\.[^/.]+$/, '') + '.pdf';

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
        originalSize: docxBuffer.byteLength,
        convertedSize: pdfBlob.size,
        processingTimeMs: duration,
        pagesConverted: totalPages,
      },
    };
  } finally {
    document.body.removeChild(container);
  }
}

