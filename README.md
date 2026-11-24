# Zenvio-FXO

> **Every Tool. One Platform.**  
> A complete, production-grade, privacy-first online tools platform featuring 65+ utility tools across PDF, Images, QR Studio, AI Assistant, Developers, and Academic productivity.

---

## 🌟 Overview

**Zenvio FXO** is built with modern web technologies to deliver an ultra-fast, client-side first experience with zero unnecessary server roundtrips. Every tool is carefully crafted with high UX polish, Midnight Blue SaaS styling, dark-mode support, keyboard shortcuts, and responsive layouts for desktop, tablet, and mobile.

---

## 🚀 Key Feature Categories

### 1. 📑 Document Studio (Premium Conversion Hub)
- **Flagship Conversion Hub** (`/document-studio`):
  - Built specifically to convert Canva, Gamma, Beautiful.ai, Tome, and Figma PDF exports into editable PowerPoint (`.pptx`) and Word (`.docx`) files.
  - **Two Conversion Modes**:
    - **Preserve Original Layout**: Locks exact slide dimensions (16:9 widescreen, 4:3, or custom), renders high-DPI backdrops, and overlays editable PowerPoint text boxes matching original coordinates.
    - **Editable Content**: Reconstructs structured headings, body paragraphs, bullet lists, and tables into clean PowerPoint text shapes for deep editing.
  - **Scanned Document OCR**: Client-side optical character recognition via Tesseract.js to recover text from scanned pages or flattened slide images.
- **Dedicated Document Conversion Tools**:
  - **PDF to PowerPoint (.pptx)** (`/tools/pdf-to-pptx`): Dual-mode slide conversion with OCR support.
  - **PDF to Word (.docx)** (`/tools/pdf-to-docx`): Reconstructs headings, paragraphs, and formatting for Microsoft Word.
  - **Word to PDF** (`/tools/word-to-pdf`): Converts `.docx` documents to standard vector PDFs.
  - **PowerPoint to PDF** (`/tools/powerpoint-to-pdf`): Exports `.pptx` slides into clean widescreen 16:9 PDF documents.
  - **PDF to Excel (.xlsx)** (`/tools/pdf-to-excel`): Extracts tabular rows, columns, and financial data into `.xlsx` spreadsheets.
  - **PDF to PNG/JPG** (`/tools/pdf-to-images`): High-resolution 2x crisp page rendering with individual and bulk ZIP download.
  - **Images to PDF** (`/tools/images-to-pdf`): Reorders and compiles JPG, PNG, and WebP images into one organized PDF.
  - **HTML to PDF** (`/tools/html-to-pdf`): Converts raw HTML/CSS or HTML files into multi-page PDFs.
  - **100% In-Browser Privacy**: All processing runs locally with WebAssembly, Canvas, and local Workers — zero document uploads to remote servers.

### 2. 🔲 QR Studio & QR Kit
- **Advanced QR Studio**:
  - High-resolution SVG and PNG exports (up to 4096px).
  - Custom dot matrix patterns (square, rounded, dots, classy).
  - Customizable finder eyes (outer rings and center eyes).
  - Logo embedding with smart circular/rounded badge backgrounds.
  - Frame & label templates ("SCAN ME", "VISIT WEBSITE", "CONNECT").
  - Dynamic QR codes with editable destination URLs and scan count analytics.
  - Real-time contrast ratio calculator & scan reliability indicators.
  - Built-in history to save and reload QR creations locally.
- **Dedicated QR Tools**:
  - Website URL QR Generator (Pure `#000000` high-contrast defaults).
  - Plain Text QR Generator.
  - Wi-Fi Quick Connect QR (SSID, WPA/WEP/Open, hidden network).
  - Digital vCard Contact Card QR.
  - Camera-based QR Code Scanner with webcam detection and upload support.

### 3. 🤖 AI Studio (15 Powered Tools)
- **AI Text Summarizer**: Executive bullets, concise summaries, key insights.
- **AI Paraphraser & Rewriter**: Professional, fluent, concise, casual rephrasing.
- **AI Grammar & Style Checker**: Highlight and fix errors with explanations.
- **AI Email Generator**: Cold outreach, follow-ups, inquiries, apologies.
- **AI Code Explainer**: Line-by-line syntax and logic breakdown.
- **AI Error Explainer & Fixer**: Stack trace debugger and recommended solutions.
- **AI Flashcard Generator**: Study decks from lecture notes or textbooks.
- **AI Quiz Generator**: Multiple-choice assessments with answers & explanations.
- **AI Blog Outline Builder**: SEO-optimized headings, sections, and talking points.
- **AI Readme Generator**: Professional GitHub documentation builder.
- **AI Tone Changer**: Formal, academic, persuasive, witty, empathetic rewrites.
- **AI Text Simplifier**: Plain-language converter (Explain Like I'm 5).
- **AI Bullet Point Extractor**: Actionable takeaway lists.
- **AI Study Notes Summarizer**: Academic concept organizers.

### 4. 🖼️ Image Utilities
- Image Compressor & Target Size Compressor (KB/MB budget targeting).
- Image Resizer, Cropper & Aspect Ratio Adjuster.
- Image Format Converter (WebP, PNG, JPEG, SVG).
- Social Media Resizer (Instagram, YouTube, Twitter/X, LinkedIn, Facebook).
- Image Watermark Tool & Color Palette Picker.
- Passport Photo Maker & Image Metadata (EXIF) Viewer.
- Base64 to Image & Image to Base64 Converters.

### 5. 📄 PDF Utilities
- Merge PDF, Split PDF, and Organize PDF Pages.
- PDF Page Extractor & PDF to Images.
- Images to PDF Maker.
- Compress PDF & Rotate PDF.
- PDF Watermark & Add Page Numbers.
- PDF Info & Metadata Inspector.

### 6. 💻 Developer & Student Productivity
- JSON Formatter, Validator & Minifier.
- JSON ⇄ CSV Converter.
- JWT Decoder (Header, Payload, Token expiration checker).
- Base64 Encoder / Decoder & URL Encoder / Decoder.
- HTML Entity Encoder & Hash Generator (MD5, SHA-1, SHA-256, SHA-512).
- Regex Tester with live group capture matching.
- UUID v4 Generator & Timestamp / Unix Epoch Converter.
- GPA & CGPA Calculators, Citation Formatter (APA, MLA, Chicago, Harvard).
- Pomodoro Focus Timer, Job Application Tracker & Resume Builder.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS (Midnight Blue theme token system)
- **Icons**: Lucide React
- **Document & PDF Engines**: PDF.js, PptxGenJS, docx, SheetJS (xlsx), Mammoth, jsPDF, html2canvas, PDF-Lib
- **OCR Engine**: Tesseract.js (Client-side WebAssembly / Web Worker)
- **Graphics & Utilities**: Canvas API, JSZip, QRCode
- **Testing**: Vitest with unit test coverage
- **Architecture**: Client-side first processing + secure rate-limited server proxy for AI integration

---

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/tarunv307/Zenvio-FXO.git
cd Zenvio-FXO

# Install dependencies
npm install

# Start local development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Running Tests
```bash
npm test
```

### Production Build
```bash
npm run build
```

---

## 🔒 Privacy & Security

- **Client-Side Execution**: File conversions, image processing, and PDF manipulation happen directly in your browser. Files are never uploaded to a remote server.
- **API Key Protection**: External AI API keys are never exposed in browser bundles. All AI calls flow through a serverless proxy with token-bucket rate limiting.
- **Zero Tracking**: No intrusive telemetry or user tracking.

---

## 📄 License

MIT © [Zenvio FXO](https://zenvio.io)
