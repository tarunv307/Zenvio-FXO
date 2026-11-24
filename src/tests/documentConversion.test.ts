import { describe, it, expect, vi } from 'vitest';
import { TOOLS } from '../data/tools';
import { searchGlobal } from '../utils/search';
import { groupTextIntoBlocks } from '../services/documentConversion/pdfRenderer';
import { convertPowerPointToPdf } from '../services/documentConversion/powerpointToPdf';
import { executeDocumentConversion } from '../services/documentConversion';
import { readFileAsArrayBuffer } from '../utils/file';
import JSZip from 'jszip';
import { PDFDocument, rgb } from 'pdf-lib';
import * as XLSX from 'xlsx';
import type { ExtractedTextItem } from '../services/documentConversion/types';

describe('Document Studio — Tool Registry & Navigation', () => {
  const REQUIRED_STUDIO_TOOLS = [
    { slug: 'document-studio', name: 'Document Studio', category: 'dockit' },
    { slug: 'pdf-to-pptx', name: 'PDF to PowerPoint (.pptx)', category: 'pdfkit' },
    { slug: 'pdf-to-docx', name: 'PDF to Word (.docx)', category: 'pdfkit' },
    { slug: 'word-to-pdf', name: 'Word to PDF', category: 'dockit' },
    { slug: 'powerpoint-to-pdf', name: 'PowerPoint to PDF', category: 'dockit' },
    { slug: 'pdf-to-excel', name: 'PDF to Excel (.xlsx)', category: 'pdfkit' },
    { slug: 'pdf-to-images', name: 'PDF to Images', category: 'pdfkit' },
    { slug: 'images-to-pdf', name: 'Images to PDF', category: 'pdfkit' },
    { slug: 'html-to-pdf', name: 'HTML to PDF', category: 'dockit' },
  ];

  it('registers all Document Studio tools in the tool registry', () => {
    for (const expected of REQUIRED_STUDIO_TOOLS) {
      const tool = TOOLS.find((t) => t.slug === expected.slug);
      expect(tool, `Tool ${expected.slug} should be registered`).toBeDefined();
      expect(tool?.category).toBe(expected.category);
      expect(tool?.status).toBe('live');
    }
  });

  it('ensures zero duplicates among conversion tools', () => {
    for (const expected of REQUIRED_STUDIO_TOOLS) {
      const matches = TOOLS.filter((t) => t.slug === expected.slug);
      expect(matches.length, `Expected exactly 1 registration for ${expected.slug}`).toBe(1);
    }
  });

  it('enables discovery through global search with keywords like Canva, PPTX, Word, Excel', () => {
    const pptxResults = searchGlobal('pptx');
    expect(pptxResults.some((r) => r.path.includes('pdf-to-pptx'))).toBe(true);

    const canvaResults = searchGlobal('canva');
    expect(canvaResults.some((r) => r.path.includes('pdf-to-pptx') || r.path.includes('document-studio'))).toBe(true);

    const docxResults = searchGlobal('docx');
    expect(docxResults.some((r) => r.path.includes('pdf-to-docx') || r.path.includes('word-to-pdf'))).toBe(true);

    const excelResults = searchGlobal('excel');
    expect(excelResults.some((r) => r.path.includes('pdf-to-excel'))).toBe(true);
  });
});

describe('Document Studio — Text Extraction & Layout Reconstructor', () => {
  it('groups items into lines and coherent paragraph blocks', () => {
    const rawItems: ExtractedTextItem[] = [
      { text: 'Executive', x: 50, y: 100, width: 80, height: 28, fontSize: 28, fontFamily: 'Arial' },
      { text: 'Summary', x: 135, y: 100, width: 80, height: 28, fontSize: 28, fontFamily: 'Arial' },
      { text: 'This presentation', x: 50, y: 140, width: 120, height: 14, fontSize: 14, fontFamily: 'Arial' },
      { text: 'highlights key metrics', x: 175, y: 140, width: 140, height: 14, fontSize: 14, fontFamily: 'Arial' },
      { text: 'for Q4 performance.', x: 320, y: 140, width: 120, height: 14, fontSize: 14, fontFamily: 'Arial' },
      { text: 'Second paragraph with details.', x: 50, y: 162, width: 200, height: 14, fontSize: 14, fontFamily: 'Arial' },
    ];

    const blocks = groupTextIntoBlocks(rawItems, 800, 600);

    expect(blocks.length).toBeGreaterThan(0);
    // Heading should be identified by larger font size (28 vs 14)
    const headingBlock = blocks.find((b) => b.isHeading);
    expect(headingBlock).toBeDefined();
    expect(headingBlock?.text).toContain('Executive Summary');
  });

  it('handles empty or pure whitespace text items cleanly without errors', () => {
    const blocks = groupTextIntoBlocks([], 800, 600);
    expect(blocks).toEqual([]);

    const whitespaceItems: ExtractedTextItem[] = [
      { text: '   ', x: 10, y: 10, width: 5, height: 12, fontSize: 12 },
      { text: '\t', x: 20, y: 10, width: 5, height: 12, fontSize: 12 },
    ];
    const whitespaceBlocks = groupTextIntoBlocks(whitespaceItems, 800, 600);
    expect(whitespaceBlocks).toEqual([]);
  });
});

describe('Document Studio — PowerPoint to PDF Engine', () => {
  it('unpacks PPTX presentation archive and creates valid PDF slides', async () => {
    // Construct a synthetic .pptx archive using JSZip
    const zip = new JSZip();
    zip.file(
      'ppt/slides/slide1.xml',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
       <p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
              xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
         <p:cSld>
           <p:spTree>
             <p:sp>
               <p:txBody>
                 <a:p><a:r><a:t>Quarterly Strategy Review</a:t></a:r></a:p>
                 <a:p><a:r><a:t>Revenue exceeded expectations by 24% year-over-year.</a:t></a:r></a:p>
               </p:txBody>
             </p:sp>
           </p:spTree>
         </p:cSld>
       </p:sld>`
    );

    zip.file(
      'ppt/slides/slide2.xml',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
       <p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
              xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
         <p:cSld>
           <p:spTree>
             <p:sp>
               <p:txBody>
                 <a:p><a:r><a:t>Next Steps &amp; Action Items</a:t></a:r></a:p>
                 <a:p><a:r><a:t>Launch Document Studio across production.</a:t></a:r></a:p>
               </p:txBody>
             </p:sp>
           </p:spTree>
         </p:cSld>
       </p:sld>`
    );

    const pptxArray = await zip.generateAsync({ type: 'arraybuffer' });
    const progressUpdates: string[] = [];

    const result = await convertPowerPointToPdf(pptxArray, 'strategy.pptx', {
      onProgress: (p) => progressUpdates.push(p.stage),
    });

    expect(result.filename).toBe('strategy.pdf');
    expect(result.mimeType).toBe('application/pdf');
    expect(result.pageCount).toBe(2);
    expect(result.blob.size).toBeGreaterThan(0);
    expect(progressUpdates.length).toBeGreaterThan(0);

    // Verify PDF validity with pdf-lib
    const pdfBytes = await readFileAsArrayBuffer(result.blob);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    expect(pdfDoc.getPageCount()).toBe(2);

    const page1 = pdfDoc.getPage(0);
    expect(page1.getSize().width).toBe(960);
    expect(page1.getSize().height).toBe(540); // 16:9 widescreen
  });
});

describe('Document Studio — Universal Converter Routing', () => {
  it('throws descriptive error on unsupported route', async () => {
    const dummyBuffer = new ArrayBuffer(10);
    await expect(
      executeDocumentConversion(
        { name: 'test.xyz', buffer: dummyBuffer },
        { sourceFormat: 'html' as any, targetFormat: 'pptx' as any }
      )
    ).rejects.toThrow(/Unsupported conversion route/);
  });
});
