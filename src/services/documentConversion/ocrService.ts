import { createWorker } from 'tesseract.js';
import type { ExtractedTextBlock, ProgressCallback } from './types';

let workerPromise: ReturnType<typeof createWorker> | null = null;

/**
 * Get or initialize a reusable Tesseract OCR worker.
 */
async function getOcrWorker(language = 'eng') {
  if (!workerPromise) {
    workerPromise = createWorker(language);
  }
  return await workerPromise;
}

/**
 * Perform OCR on a Canvas or ImageDataUrl.
 * Returns recognized text blocks with bounding boxes normalized to the original point coordinates.
 */
export async function performOcrOnCanvas(
  canvas: HTMLCanvasElement,
  targetWidthPt: number,
  targetHeightPt: number,
  language = 'eng',
  onProgress?: ProgressCallback
): Promise<ExtractedTextBlock[]> {
  try {
    onProgress?.({
      stage: 'Running Optical Character Recognition (OCR)...',
      percent: 30,
    });

    const worker = await getOcrWorker(language);
    const result = await worker.recognize(canvas);

    onProgress?.({
      stage: 'Parsing recognized text bounding boxes...',
      percent: 85,
    });

    const scaleX = targetWidthPt / canvas.width;
    const scaleY = targetHeightPt / canvas.height;

    const blocks: ExtractedTextBlock[] = [];

    // Tesseract gives blocks, paragraphs, and lines
    const lines = (result.data as any)?.lines;
    if (lines && Array.isArray(lines)) {
      for (const line of lines) {
        const text = line.text?.trim();
        if (!text) continue;

        const x = line.bbox.x0 * scaleX;
        const y = line.bbox.y0 * scaleY;
        const width = Math.max(20, (line.bbox.x1 - line.bbox.x0) * scaleX);
        const height = Math.max(12, (line.bbox.y1 - line.bbox.y0) * scaleY);
        const fontSize = Math.max(10, Math.min(48, Math.round(height * 0.8)));

        blocks.push({
          text,
          x,
          y,
          width,
          height,
          fontSize,
          fontFamily: 'Arial',
          isHeading: fontSize > 20,
          lines: [text],
        });
      }
    }

    // If no individual lines found, fall back to entire text block
    if (blocks.length === 0 && result.data.text.trim().length > 0) {
      blocks.push({
        text: result.data.text.trim(),
        x: targetWidthPt * 0.1,
        y: targetHeightPt * 0.1,
        width: targetWidthPt * 0.8,
        height: targetHeightPt * 0.8,
        fontSize: 14,
        fontFamily: 'Arial',
        lines: result.data.text.trim().split('\n'),
      });
    }

    return blocks;
  } catch (err) {
    console.warn('OCR processing failed or timed out:', err);
    return [];
  }
}

/**
 * Terminate the OCR worker to free resources if needed.
 */
export async function terminateOcrWorker() {
  if (workerPromise) {
    const worker = await workerPromise;
    await worker.terminate();
    workerPromise = null;
  }
}
