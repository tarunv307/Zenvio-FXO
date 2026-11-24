import JSZip from 'jszip';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { PptxToPdfOptions, ConversionResult } from './types';

interface ExtractedSlideData {
  slideNumber: number;
  title: string;
  paragraphs: string[];
  imageBytes?: Uint8Array;
  imageMime?: string;
}

/**
 * Convert a PowerPoint presentation (.pptx) to a PDF document.
 */
export async function convertPowerPointToPdf(
  pptxBuffer: ArrayBuffer,
  filename: string,
  options: PptxToPdfOptions = {}
): Promise<ConversionResult> {
  const startTime = Date.now();
  const { onProgress } = options;
  const warnings: string[] = [];

  onProgress?.({
    stage: 'Unpacking PowerPoint presentation archive...',
    percent: 15,
  });

  const zip = await JSZip.loadAsync(pptxBuffer);
  const slideEntries: { name: string; number: number }[] = [];

  // Find all slide XML files (ppt/slides/slide1.xml, etc.)
  zip.forEach((relativePath) => {
    const match = relativePath.match(/^ppt\/slides\/slide(\d+)\.xml$/i);
    if (match) {
      slideEntries.push({
        name: relativePath,
        number: parseInt(match[1], 10),
      });
    }
  });

  // Sort slides in natural presentation order
  slideEntries.sort((a, b) => a.number - b.number);

  if (slideEntries.length === 0) {
    throw new Error('No slides found in the PowerPoint presentation.');
  }

  onProgress?.({
    stage: `Found ${slideEntries.length} slides. Parsing slide contents...`,
    percent: 30,
  });

  const slidesData: ExtractedSlideData[] = [];

  for (let i = 0; i < slideEntries.length; i++) {
    const entry = slideEntries[i];
    const xmlContent = await zip.file(entry.name)?.async('string');
    if (!xmlContent) continue;

    // Parse text paragraphs from slide XML
    // In OpenXML PPTX, text is contained in <a:p> ... <a:t>text</a:t> ... </a:p>
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'application/xml');

    const paragraphs: string[] = [];
    let title = '';

    const pNodes = xmlDoc.getElementsByTagName('a:p');
    for (let pIdx = 0; pIdx < pNodes.length; pIdx++) {
      const pNode = pNodes[pIdx];
      const tNodes = pNode.getElementsByTagName('a:t');
      let pText = '';
      for (let tIdx = 0; tIdx < tNodes.length; tIdx++) {
        pText += tNodes[tIdx].textContent || '';
      }
      pText = pText.trim();
      if (pText) {
        if (!title && (pIdx === 0 || pText.length < 80)) {
          title = pText;
        } else {
          paragraphs.push(pText);
        }
      }
    }

    if (!title && paragraphs.length > 0) {
      title = paragraphs.shift() || `Slide ${entry.number}`;
    }

    // Check for associated slide image
    let imageBytes: Uint8Array | undefined;
    let imageMime: string | undefined;

    // Check ppt/media/
    const mediaFiles = Object.keys(zip.files).filter((f) => f.startsWith('ppt/media/'));
    if (mediaFiles.length > i) {
      const mediaFile = zip.file(mediaFiles[i]);
      if (mediaFile) {
        const bytes = await mediaFile.async('uint8array');
        imageBytes = bytes;
        imageMime = mediaFiles[i].endsWith('.png') ? 'image/png' : 'image/jpeg';
      }
    }

    slidesData.push({
      slideNumber: entry.number,
      title: title || `Slide ${entry.number}`,
      paragraphs,
      imageBytes,
      imageMime,
    });
  }

  onProgress?.({
    stage: 'Building high-fidelity PDF slides...',
    percent: 60,
  });

  // Create PDF with widescreen 16:9 dimensions (960 x 540 pt)
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const slideWidth = 960;
  const slideHeight = 540;

  for (let idx = 0; idx < slidesData.length; idx++) {
    const slide = slidesData[idx];
    const page = pdfDoc.addPage([slideWidth, slideHeight]);

    // Slide Background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: slideWidth,
      height: slideHeight,
      color: rgb(0.98, 0.99, 1.0), // Very light soft blue-gray
    });

    // Top accent bar
    page.drawRectangle({
      x: 0,
      y: slideHeight - 8,
      width: slideWidth,
      height: 8,
      color: rgb(0.14, 0.38, 0.92), // Zenvio Blue (#2563EB)
    });

    // Slide Title
    const titleText = slide.title.length > 80 ? slide.title.substring(0, 77) + '...' : slide.title;
    page.drawText(titleText, {
      x: 60,
      y: slideHeight - 70,
      size: 28,
      font: fontBold,
      color: rgb(0.06, 0.09, 0.16), // #0F172A
    });

    // Title divider line
    page.drawLine({
      start: { x: 60, y: slideHeight - 85 },
      end: { x: slideWidth - 60, y: slideHeight - 85 },
      thickness: 1.5,
      color: rgb(0.88, 0.91, 0.94),
    });

    // Embed slide image if available
    let textAvailableWidth = slideWidth - 120;
    if (slide.imageBytes) {
      try {
        const isPng = slide.imageMime === 'image/png';
        const embeddedImage = isPng
          ? await pdfDoc.embedPng(slide.imageBytes)
          : await pdfDoc.embedJpg(slide.imageBytes);

        const imgWidth = 360;
        const imgHeight = Math.min(300, (embeddedImage.height / embeddedImage.width) * imgWidth);

        page.drawImage(embeddedImage, {
          x: slideWidth - 60 - imgWidth,
          y: slideHeight - 110 - imgHeight,
          width: imgWidth,
          height: imgHeight,
        });

        textAvailableWidth = slideWidth - 120 - imgWidth - 30;
      } catch {
        // Image embedding fallback
      }
    }

    // Slide Paragraphs / Bullet points
    let currentY = slideHeight - 130;
    const maxParagraphs = Math.min(slide.paragraphs.length, 8);

    for (let p = 0; p < maxParagraphs; p++) {
      if (currentY < 60) break;
      const text = slide.paragraphs[p];

      // Draw subtle bullet point dot
      page.drawCircle({
        x: 68,
        y: currentY + 5,
        size: 3,
        color: rgb(0.14, 0.38, 0.92),
      });

      // Simple word wrapping for PDF text
      const words = text.split(' ');
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        const testWidth = fontRegular.widthOfTextAtSize(testLine, 14);

        if (testWidth > textAvailableWidth && currentLine) {
          page.drawText(currentLine, {
            x: 85,
            y: currentY,
            size: 14,
            font: fontRegular,
            color: rgb(0.2, 0.27, 0.36),
          });
          currentY -= 22;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        page.drawText(currentLine, {
          x: 85,
          y: currentY,
          size: 14,
          font: fontRegular,
          color: rgb(0.2, 0.27, 0.36),
        });
        currentY -= 32;
      }
    }

    // Slide footer: Slide Number & Zenvio watermark
    page.drawText(`Slide ${idx + 1} of ${slidesData.length}`, {
      x: slideWidth - 130,
      y: 25,
      size: 10,
      font: fontRegular,
      color: rgb(0.55, 0.62, 0.7),
    });

    page.drawText('Converted with Zenvio FXO Document Studio', {
      x: 60,
      y: 25,
      size: 10,
      font: fontRegular,
      color: rgb(0.55, 0.62, 0.7),
    });
  }

  onProgress?.({
    stage: 'Finalizing PDF document...',
    percent: 90,
  });

  const pdfBytes = await pdfDoc.save();
  const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
  const duration = Date.now() - startTime;
  const outFilename = filename.replace(/\.[^/.]+$/, '') + '.pdf';

  warnings.push('PowerPoint animations, slide transitions, and video clips are not supported in static PDF output.');

  onProgress?.({
    stage: 'Conversion complete!',
    percent: 100,
  });

  return {
    blob: pdfBlob,
    filename: outFilename,
    mimeType: 'application/pdf',
    pageCount: slidesData.length,
    warnings,
    metadata: {
      originalSize: pptxBuffer.byteLength,
      convertedSize: pdfBlob.size,
      processingTimeMs: duration,
      pagesConverted: slidesData.length,
    },
  };
}

