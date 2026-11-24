import * as XLSX from 'xlsx';
import { loadPdfDocument, processFullPdfPage } from './pdfRenderer';
import type { PdfToExcelOptions, ConversionResult, ExtractedTextItem } from './types';

/**
 * Convert PDF tables and text into a Microsoft Excel spreadsheet (.xlsx).
 */
export async function convertPdfToExcel(
  pdfBuffer: ArrayBuffer,
  filename: string,
  options: PdfToExcelOptions = {}
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

  const wb = XLSX.utils.book_new();
  let totalRowsDetected = 0;

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const pagePercent = Math.round(15 + ((pageNum - 1) / totalPages) * 70);
    onProgress?.({
      stage: `Extracting tabular rows from page ${pageNum} of ${totalPages}...`,
      percent: pagePercent,
      currentPage: pageNum,
      totalPages,
    });

    const page = await pdfDoc.getPage(pageNum);
    const fullPage = await processFullPdfPage(page, pageNum, 1.5);

    const items = fullPage.textItems.filter((i) => i.text.trim().length > 0);

    if (items.length === 0) {
      // Empty page sheet placeholder
      const emptyWs = XLSX.utils.aoa_to_sheet([[`Page ${pageNum} (No text data detected)`]]);
      XLSX.utils.book_append_sheet(wb, emptyWs, `Page ${pageNum}`);
      continue;
    }

    // 1. Group items into rows based on Y coordinates
    // Sort top-to-bottom
    items.sort((a, b) => a.y - b.y);

    const rowBuckets: ExtractedTextItem[][] = [];
    let currentRow: ExtractedTextItem[] = [];
    let currentY = -999;

    for (const item of items) {
      if (currentY < 0 || Math.abs(item.y - currentY) <= 6) {
        currentRow.push(item);
        currentY = currentRow.reduce((acc, it) => acc + it.y, 0) / currentRow.length;
      } else {
        if (currentRow.length > 0) {
          currentRow.sort((a, b) => a.x - b.x);
          rowBuckets.push(currentRow);
        }
        currentRow = [item];
        currentY = item.y;
      }
    }
    if (currentRow.length > 0) {
      currentRow.sort((a, b) => a.x - b.x);
      rowBuckets.push(currentRow);
    }

    // 2. Identify column boundaries by analyzing X positions across rows
    // Cluster X positions that are close into distinct column indices
    const allXPositions: number[] = [];
    for (const row of rowBuckets) {
      for (const item of row) {
        allXPositions.push(Math.round(item.x));
      }
    }
    allXPositions.sort((a, b) => a - b);

    // Form discrete column bounds
    const columnCenters: number[] = [];
    for (const x of allXPositions) {
      if (columnCenters.length === 0) {
        columnCenters.push(x);
      } else {
        const lastCol = columnCenters[columnCenters.length - 1];
        if (Math.abs(x - lastCol) > 28) {
          columnCenters.push(x);
        }
      }
    }

    // 3. Place cells into the 2D grid
    const aoa: (string | number)[][] = [];

    for (const row of rowBuckets) {
      const rowData: string[] = new Array(Math.max(1, columnCenters.length)).fill('');

      for (const item of row) {
        // Find best matching column
        let bestColIdx = 0;
        let minDiff = 999999;

        for (let colIdx = 0; colIdx < columnCenters.length; colIdx++) {
          const diff = Math.abs(item.x - columnCenters[colIdx]);
          if (diff < minDiff) {
            minDiff = diff;
            bestColIdx = colIdx;
          }
        }

        const existing = rowData[bestColIdx];
        rowData[bestColIdx] = existing ? existing + ' ' + item.text : item.text;
      }

      // Filter out trailing empty cells
      while (rowData.length > 1 && !rowData[rowData.length - 1]) {
        rowData.pop();
      }

      aoa.push(rowData);
    }

    totalRowsDetected += aoa.length;
    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // Auto-fit column widths
    const colWidths = columnCenters.map((_, colIdx) => {
      let maxLen = 10;
      for (const r of aoa) {
        const cell = r[colIdx];
        if (cell) maxLen = Math.max(maxLen, String(cell).length);
      }
      return { wch: Math.min(60, maxLen + 2) };
    });
    ws['!cols'] = colWidths;

    const sheetTitle = `Page ${pageNum}`.substring(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetTitle);
  }

  onProgress?.({
    stage: 'Writing Excel workbook (.xlsx)...',
    percent: 90,
  });

  const xlsxArray = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([xlsxArray], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const duration = Date.now() - startTime;
  const outFilename = filename.replace(/\.[^/.]+$/, '') + '.xlsx';

  if (totalRowsDetected === 0) {
    warnings.push('No structured text or tables were detected in the source PDF.');
  } else {
    warnings.push('Unstructured paragraph text was aligned to tabular rows. Check column alignment.');
  }

  onProgress?.({
    stage: 'Conversion complete!',
    percent: 100,
  });

  return {
    blob,
    filename: outFilename,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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

