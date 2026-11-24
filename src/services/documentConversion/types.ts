export type DocumentFormat =
  | 'pdf'
  | 'pptx'
  | 'docx'
  | 'xlsx'
  | 'png'
  | 'jpg'
  | 'html';

export type PptxConversionMode = 'preserve-layout' | 'editable-content';

export interface ConversionProgress {
  stage: string;
  percent: number; // 0 to 100
  currentPage?: number;
  totalPages?: number;
}

export type ProgressCallback = (progress: ConversionProgress) => void;

export interface ExtractedTextItem {
  text: string;
  x: number; // in PDF points (from left)
  y: number; // in PDF points (from bottom in PDF coords, or top normalized)
  width: number;
  height: number;
  fontSize: number;
  fontFamily?: string;
  color?: string;
  hasEol?: boolean;
}

export interface ExtractedTextBlock {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily?: string;
  isHeading?: boolean;
  isListItem?: boolean;
  lines: string[];
}

export interface TableCell {
  text: string;
  colSpan?: number;
  rowSpan?: number;
}

export interface ExtractedTable {
  rows: TableCell[][];
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RenderedPdfPage {
  pageNumber: number;
  widthPt: number;
  heightPt: number;
  aspectRatio: number;
  canvas: HTMLCanvasElement;
  imageDataUrl: string;
  textItems: ExtractedTextItem[];
  textBlocks: ExtractedTextBlock[];
  hasDigitalText: boolean;
  totalTextLength: number;
}

export interface PdfToPptxOptions {
  mode: PptxConversionMode;
  enableOcr?: boolean;
  ocrLanguage?: string;
  onProgress?: ProgressCallback;
}

export interface PdfToDocxOptions {
  includeImages?: boolean;
  detectTables?: boolean;
  onProgress?: ProgressCallback;
}

export interface WordToPdfOptions {
  pageSize?: 'a4' | 'letter';
  margins?: number;
  onProgress?: ProgressCallback;
}

export interface PptxToPdfOptions {
  slideFormat?: '16x9' | '4x3';
  onProgress?: ProgressCallback;
}

export interface PdfToExcelOptions {
  sheetPerPage?: boolean;
  onProgress?: ProgressCallback;
}

export interface HtmlToPdfOptions {
  title?: string;
  pageSize?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  onProgress?: ProgressCallback;
}

export interface ConversionResult {
  blob: Blob;
  filename: string;
  mimeType: string;
  pageCount?: number;
  warnings?: string[];
  previewUrl?: string;
  metadata?: {
    originalSize: number;
    convertedSize: number;
    processingTimeMs: number;
    pagesConverted: number;
    modeUsed?: string;
    ocrApplied?: boolean;
  };
}

