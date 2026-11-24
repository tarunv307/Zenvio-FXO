import * as pdfjsLib from 'pdfjs-dist';
import type {
  ExtractedTextItem,
  ExtractedTextBlock,
  RenderedPdfPage,
} from './types';

// Ensure worker is configured
if (typeof window !== 'undefined') {
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    } catch {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    }
  }
}

/**
 * Load a PDF document from an ArrayBuffer or Uint8Array.
 */
export async function loadPdfDocument(data: ArrayBuffer | Uint8Array): Promise<pdfjsLib.PDFDocumentProxy> {
  const loadingTask = pdfjsLib.getDocument({
    data,
    useSystemFonts: true,
  });
  return await loadingTask.promise;
}

/**
 * Render a single PDF page to an off-screen HTML5 Canvas.
 */
export async function renderPageToCanvas(
  page: pdfjsLib.PDFPageProxy,
  scale = 2.0
): Promise<{ canvas: HTMLCanvasElement; dataUrl: string; width: number; height: number }> {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const renderContext: any = {
    canvasContext: ctx,
    viewport,
    canvas,
  };

  await page.render(renderContext).promise;
  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

  return {
    canvas,
    dataUrl,
    width: canvas.width,
    height: canvas.height,
  };
}

/**
 * Extract raw text items with coordinate positions from a PDF page.
 */
export async function extractPageText(
  page: pdfjsLib.PDFPageProxy,
  viewport: pdfjsLib.PageViewport
): Promise<ExtractedTextItem[]> {
  const textContent = await page.getTextContent();
  const items: ExtractedTextItem[] = [];

  for (const item of textContent.items) {
    // Only process TextItem (has str and transform)
    if ('str' in item && typeof item.str === 'string') {
      const tx = item.transform; // [scaleX, skewY, skewX, scaleY, transX, transY]
      const fontSize = Math.hypot(tx[2], tx[3]) || Math.abs(tx[0]) || 12;

      // Convert PDF coordinate space to standard top-left origin (pt)
      // tx[4] is x in pt, tx[5] is y in pt from bottom
      const x = tx[4];
      const pdfY = tx[5];
      const yFromTop = viewport.height - pdfY - fontSize;

      items.push({
        text: item.str,
        x: Math.max(0, x),
        y: Math.max(0, yFromTop),
        width: item.width || Math.max(8, item.str.length * fontSize * 0.5),
        height: item.height || fontSize,
        fontSize,
        fontFamily: item.fontName,
        hasEol: item.hasEOL,
      });
    }
  }

  return items;
}

/**
 * Group raw text items into coherent paragraph blocks and headings.
 */
export function groupTextIntoBlocks(
  items: ExtractedTextItem[],
  _pageWidth: number,
  _pageHeight: number
): ExtractedTextBlock[] {
  if (items.length === 0) return [];

  // Filter out pure whitespace
  const cleanItems = items.filter((it) => it.text.trim().length > 0);
  if (cleanItems.length === 0) return [];

  // Sort items primarily by Y (top to bottom), then by X (left to right)
  cleanItems.sort((a, b) => {
    const yDiff = a.y - b.y;
    if (Math.abs(yDiff) > 4) return yDiff;
    return a.x - b.x;
  });

  // Calculate average font size
  const totalFontSize = cleanItems.reduce((acc, it) => acc + it.fontSize, 0);
  const avgFontSize = totalFontSize / cleanItems.length;

  const blocks: ExtractedTextBlock[] = [];
  let currentBlock: ExtractedTextBlock | null = null;

  for (const item of cleanItems) {
    if (!currentBlock) {
      currentBlock = {
        text: item.text,
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
        fontSize: item.fontSize,
        fontFamily: item.fontFamily,
        isHeading: item.fontSize > avgFontSize * 1.3,
        lines: [item.text],
      };
      continue;
    }

    // Check if this item belongs to the same block:
    // Vertical distance within 1.6x line height and horizontal overlap or left-alignment proximity
    const lineDelta = item.y - (currentBlock.y + currentBlock.height);
    const sameSize = Math.abs(item.fontSize - currentBlock.fontSize) < 3;
    const isAdjacentLine = lineDelta >= -4 && lineDelta < item.fontSize * 1.8;
    const isSameLine = Math.abs(item.y - currentBlock.y) < 6;

    if (isSameLine) {
      // Append horizontally to same line
      currentBlock.text += (currentBlock.text.endsWith(' ') ? '' : ' ') + item.text;
      currentBlock.width = Math.max(currentBlock.width, item.x + item.width - currentBlock.x);
      currentBlock.height = Math.max(currentBlock.height, item.height);
      if (currentBlock.lines.length > 0) {
        currentBlock.lines[currentBlock.lines.length - 1] += ' ' + item.text;
      }
    } else if (isAdjacentLine && sameSize && !currentBlock.isHeading) {
      // Append vertically to next line
      currentBlock.text += '\n' + item.text;
      currentBlock.lines.push(item.text);
      currentBlock.width = Math.max(currentBlock.width, item.x + item.width - currentBlock.x);
      currentBlock.height = item.y + item.height - currentBlock.y;
    } else {
      // Finalize current block and start new one
      blocks.push(currentBlock);
      currentBlock = {
        text: item.text,
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
        fontSize: item.fontSize,
        fontFamily: item.fontFamily,
        isHeading: item.fontSize > avgFontSize * 1.3,
        lines: [item.text],
      };
    }
  }

  if (currentBlock) {
    blocks.push(currentBlock);
  }

  return blocks;
}

/**
 * Inspect a PDF document and return summary metadata, first page thumbnail,
 * page dimensions, and whether it has digital text.
 */
export async function inspectPdfDocument(buffer: ArrayBuffer): Promise<{
  pageCount: number;
  firstPageWidthPt: number;
  firstPageHeightPt: number;
  aspectRatio: number;
  thumbnailDataUrl: string;
  hasDigitalText: boolean;
  totalTextLength: number;
}> {
  const pdfDoc = await loadPdfDocument(buffer);
  const pageCount = pdfDoc.numPages;

  if (pageCount === 0) {
    throw new Error('PDF has no pages');
  }

  const firstPage = await pdfDoc.getPage(1);
  const viewport = firstPage.getViewport({ scale: 1.0 });
  const widthPt = viewport.width;
  const heightPt = viewport.height;
  const aspectRatio = widthPt / (heightPt || 1);

  // Render low-res thumbnail
  const thumbViewport = firstPage.getViewport({ scale: 0.5 });
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(thumbViewport.width);
  canvas.height = Math.floor(thumbViewport.height);
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const thumbContext: any = {
      canvasContext: ctx,
      viewport: thumbViewport,
      canvas,
    };
    await firstPage.render(thumbContext).promise;
  }
  const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.85);

  // Check text content
  const textContent = await firstPage.getTextContent();
  let totalChars = 0;
  for (const item of textContent.items) {
    if ('str' in item) {
      totalChars += item.str.trim().length;
    }
  }

  return {
    pageCount,
    firstPageWidthPt: widthPt,
    firstPageHeightPt: heightPt,
    aspectRatio,
    thumbnailDataUrl,
    hasDigitalText: totalChars > 25,
    totalTextLength: totalChars,
  };
}

/**
 * Process and extract a full page with rendered canvas, items, and blocks.
 */
export async function processFullPdfPage(
  page: pdfjsLib.PDFPageProxy,
  pageNumber: number,
  scale = 2.0
): Promise<RenderedPdfPage> {
  const unscaledViewport = page.getViewport({ scale: 1.0 });
  const { canvas, dataUrl } = await renderPageToCanvas(page, scale);
  const textItems = await extractPageText(page, unscaledViewport);
  const textBlocks = groupTextIntoBlocks(textItems, unscaledViewport.width, unscaledViewport.height);

  let totalChars = 0;
  for (const it of textItems) {
    totalChars += it.text.trim().length;
  }

  return {
    pageNumber,
    widthPt: unscaledViewport.width,
    heightPt: unscaledViewport.height,
    aspectRatio: unscaledViewport.width / (unscaledViewport.height || 1),
    canvas,
    imageDataUrl: dataUrl,
    textItems,
    textBlocks,
    hasDigitalText: totalChars > 20,
    totalTextLength: totalChars,
  };
}
