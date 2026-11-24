import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  PageBreak,
  AlignmentType,
} from 'docx';
import { loadPdfDocument, processFullPdfPage } from './pdfRenderer';
import type { PdfToDocxOptions, ConversionResult } from './types';

/**
 * Convert a PDF document (ArrayBuffer) to a Microsoft Word document (.docx).
 */
export async function convertPdfToDocx(
  pdfBuffer: ArrayBuffer,
  filename: string,
  options: PdfToDocxOptions = {}
): Promise<ConversionResult> {
  const startTime = Date.now();
  const { onProgress } = options;
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

  const docChildren: Paragraph[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const pagePercent = Math.round(15 + ((pageNum - 1) / totalPages) * 70);
    onProgress?.({
      stage: `Extracting text & formatting from page ${pageNum} of ${totalPages}...`,
      percent: pagePercent,
      currentPage: pageNum,
      totalPages,
    });

    const page = await pdfDoc.getPage(pageNum);
    const fullPage = await processFullPdfPage(page, pageNum, 1.5);

    if (pageNum > 1) {
      docChildren.push(new Paragraph({ children: [new PageBreak()] }));
    }

    if (fullPage.textBlocks.length === 0) {
      warnings.push(`Page ${pageNum} contains no selectable text.`);
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `[Page ${pageNum}: Image or scanned content without selectable text]`,
              italics: true,
              color: '64748B',
            }),
          ],
        })
      );
      continue;
    }

    for (const block of fullPage.textBlocks) {
      if (block.isHeading || block.fontSize >= 20) {
        docChildren.push(
          new Paragraph({
            heading: block.fontSize > 26 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({
                text: block.text,
                bold: true,
                size: Math.round(block.fontSize * 2), // docx uses half-points
                color: '0F172A',
                font: 'Calibri',
              }),
            ],
          })
        );
      } else {
        // Regular paragraph or bullet
        const lines = block.lines;
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          const isBullet = /^[•\-\*]\s/.test(trimmed);
          const cleanText = isBullet ? trimmed.replace(/^[•\-\*]\s+/, '') : trimmed;

          docChildren.push(
            new Paragraph({
              bullet: isBullet ? { level: 0 } : undefined,
              spacing: { after: 100, line: 276 },
              children: [
                new TextRun({
                  text: cleanText,
                  size: Math.max(20, Math.min(28, Math.round(block.fontSize * 2))),
                  color: '334155',
                  font: 'Calibri',
                }),
              ],
            })
          );
        }
      }
    }
  }

  onProgress?.({
    stage: 'Building Word document (.docx)...',
    percent: 90,
  });

  const doc = new Document({
    creator: 'Zenvio FXO Document Studio',
    title: filename.replace(/\.pdf$/i, ''),
    sections: [
      {
        properties: {},
        children: docChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const duration = Date.now() - startTime;
  const outFilename = filename.replace(/\.[^/.]+$/, '') + '.docx';

  warnings.push('Complex multi-column layouts and custom graphics are converted to standard document flow.');

  onProgress?.({
    stage: 'Conversion complete!',
    percent: 100,
  });

  return {
    blob,
    filename: outFilename,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    pageCount: totalPages,
    warnings,
    metadata: {
      originalSize: pdfBuffer.byteLength,
      convertedSize: blob.size,
      processingTimeMs: duration,
      pagesConverted: totalPages,
    },
  };
}

