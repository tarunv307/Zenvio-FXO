import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getToolBySlug } from '../data/tools';
import { ToolPageLayout } from '../components/layout/ToolPageLayout';

// ── Lazy-loaded tool implementations ──────────────────────────────────────────
const ImageCompressor       = React.lazy(() => import('./tools/ImageCompressor').then((m) => ({ default: m.ImageCompressor })));
const ImageResizer          = React.lazy(() => import('./tools/ImageResizer').then((m) => ({ default: m.ImageResizer })));
const ImageCropper          = React.lazy(() => import('./tools/ImageCropper').then((m) => ({ default: m.ImageCropper })));
const ImageFormatConverter  = React.lazy(() => import('./tools/ImageFormatConverter').then((m) => ({ default: m.ImageFormatConverter })));
const ImageRotator          = React.lazy(() => import('./tools/ImageRotator').then((m) => ({ default: m.ImageRotator })));
const ImageToBase64         = React.lazy(() => import('./tools/ImageToBase64').then((m) => ({ default: m.ImageToBase64 })));
const Base64ToImage         = React.lazy(() => import('./tools/Base64ToImage').then((m) => ({ default: m.Base64ToImage })));
const ImageMetadataViewer   = React.lazy(() => import('./tools/ImageMetadataViewer').then((m) => ({ default: m.ImageMetadataViewer })));
const TargetSizeCompressor  = React.lazy(() => import('./tools/TargetSizeCompressor').then((m) => ({ default: m.TargetSizeCompressor })));
const PassportPhotoMaker    = React.lazy(() => import('./tools/PassportPhotoMaker').then((m) => ({ default: m.PassportPhotoMaker })));
const SocialMediaResizer    = React.lazy(() => import('./tools/SocialMediaResizer').then((m) => ({ default: m.SocialMediaResizer })));
const ImageColorPicker      = React.lazy(() => import('./tools/ImageColorPicker').then((m) => ({ default: m.ImageColorPicker })));
const ImageWatermark        = React.lazy(() => import('./tools/ImageWatermark').then((m) => ({ default: m.ImageWatermark })));
const ImageDimensionChecker = React.lazy(() => import('./tools/ImageDimensionChecker').then((m) => ({ default: m.ImageDimensionChecker })));
const MergePDF              = React.lazy(() => import('./tools/MergePDF').then((m) => ({ default: m.MergePDF })));
const SplitPDF              = React.lazy(() => import('./tools/SplitPDF').then((m) => ({ default: m.SplitPDF })));
const CompressPDF           = React.lazy(() => import('./tools/CompressPDF').then((m) => ({ default: m.CompressPDF })));
const RotatePDF             = React.lazy(() => import('./tools/RotatePDF').then((m) => ({ default: m.RotatePDF })));
const PDFOrganizer          = React.lazy(() => import('./tools/PDFOrganizer').then((m) => ({ default: m.PDFOrganizer })));
const PDFPageExtractor      = React.lazy(() => import('./tools/PDFPageExtractor').then((m) => ({ default: m.PDFPageExtractor })));
const ImagesToPDF           = React.lazy(() => import('./tools/ImagesToPDF').then((m) => ({ default: m.ImagesToPDF })));
const PDFToImages           = React.lazy(() => import('./tools/PDFToImages').then((m) => ({ default: m.PDFToImages })));
const PDFInfo               = React.lazy(() => import('./tools/PDFInfo').then((m) => ({ default: m.PDFInfo })));
const AddPageNumbers        = React.lazy(() => import('./tools/AddPageNumbers').then((m) => ({ default: m.AddPageNumbers })));
const PDFWatermark          = React.lazy(() => import('./tools/PDFWatermark').then((m) => ({ default: m.PDFWatermark })));
const WordCounter           = React.lazy(() => import('./tools/WordCounter').then((m) => ({ default: m.WordCounter })));
const CaseConverter         = React.lazy(() => import('./tools/CaseConverter').then((m) => ({ default: m.CaseConverter })));
const RemoveSpaces          = React.lazy(() => import('./tools/RemoveSpaces').then((m) => ({ default: m.RemoveSpaces })));
const TextDiff              = React.lazy(() => import('./tools/TextDiff').then((m) => ({ default: m.TextDiff })));
const MarkdownPreviewer     = React.lazy(() => import('./tools/MarkdownPreviewer').then((m) => ({ default: m.MarkdownPreviewer })));
const CSVToJSON             = React.lazy(() => import('./tools/CSVToJSON').then((m) => ({ default: m.CSVToJSON })));
const JSONToCSV             = React.lazy(() => import('./tools/JSONToCSV').then((m) => ({ default: m.JSONToCSV })));
const InvoiceGenerator      = React.lazy(() => import('./tools/InvoiceGenerator').then((m) => ({ default: m.InvoiceGenerator })));
const GPACalculator         = React.lazy(() => import('./tools/GPACalculator').then((m) => ({ default: m.GPACalculator })));
const CGPACalculator        = React.lazy(() => import('./tools/CGPACalculator').then((m) => ({ default: m.CGPACalculator })));
const PercentageCalculator  = React.lazy(() => import('./tools/PercentageCalculator').then((m) => ({ default: m.PercentageCalculator })));
const PomodoroTimer         = React.lazy(() => import('./tools/PomodoroTimer').then((m) => ({ default: m.PomodoroTimer })));
const FlashcardCreator      = React.lazy(() => import('./tools/FlashcardCreator').then((m) => ({ default: m.FlashcardCreator })));
const UnitConverter         = React.lazy(() => import('./tools/UnitConverter').then((m) => ({ default: m.UnitConverter })));
const ScientificCalculator  = React.lazy(() => import('./tools/ScientificCalculator').then((m) => ({ default: m.ScientificCalculator })));
const CitationFormatter     = React.lazy(() => import('./tools/CitationFormatter').then((m) => ({ default: m.CitationFormatter })));
const ResumeBuilder         = React.lazy(() => import('./tools/ResumeBuilder').then((m) => ({ default: m.ResumeBuilder })));
const CoverLetterBuilder    = React.lazy(() => import('./tools/CoverLetterBuilder').then((m) => ({ default: m.CoverLetterBuilder })));
const JobTracker            = React.lazy(() => import('./tools/JobTracker').then((m) => ({ default: m.JobTracker })));
const SkillsChecklist       = React.lazy(() => import('./tools/SkillsChecklist').then((m) => ({ default: m.SkillsChecklist })));
const JSONFormatter         = React.lazy(() => import('./tools/JSONFormatter').then((m) => ({ default: m.JSONFormatter })));
const Base64Encoder         = React.lazy(() => import('./tools/Base64Encoder').then((m) => ({ default: m.Base64Encoder })));
const URLEncoder            = React.lazy(() => import('./tools/URLEncoder').then((m) => ({ default: m.URLEncoder })));
const UUIDGenerator         = React.lazy(() => import('./tools/UUIDGenerator').then((m) => ({ default: m.UUIDGenerator })));
const PasswordGenerator     = React.lazy(() => import('./tools/PasswordGenerator').then((m) => ({ default: m.PasswordGenerator })));
const HashGenerator         = React.lazy(() => import('./tools/HashGenerator').then((m) => ({ default: m.HashGenerator })));
const RegexTester           = React.lazy(() => import('./tools/RegexTester').then((m) => ({ default: m.RegexTester })));
const JWTDecoder            = React.lazy(() => import('./tools/JWTDecoder').then((m) => ({ default: m.JWTDecoder })));
const ColorConverter        = React.lazy(() => import('./tools/ColorConverter').then((m) => ({ default: m.ColorConverter })));
const LoremIpsum            = React.lazy(() => import('./tools/LoremIpsum').then((m) => ({ default: m.LoremIpsum })));
const TimestampConverter    = React.lazy(() => import('./tools/TimestampConverter').then((m) => ({ default: m.TimestampConverter })));
const HTMLEntityEncoder     = React.lazy(() => import('./tools/HTMLEntityEncoder').then((m) => ({ default: m.HTMLEntityEncoder })));
const URLParser             = React.lazy(() => import('./tools/URLParser').then((m) => ({ default: m.URLParser })));
const QRCodeGenerator       = React.lazy(() => import('./tools/QRCodeGenerator').then((m) => ({ default: m.QRCodeGenerator })));
const QRCodeScanner         = React.lazy(() => import('./tools/QRCodeScanner').then((m) => ({ default: m.QRCodeScanner })));
const AspectRatioCalc       = React.lazy(() => import('./tools/AspectRatioCalculator').then((m) => ({ default: m.AspectRatioCalculator })));
const FileSizeCalc          = React.lazy(() => import('./tools/FileSizeCalculator').then((m) => ({ default: m.FileSizeCalculator })));
const PrivacyPasswordGen    = React.lazy(() => import('./tools/PrivacyPasswordGenerator').then((m) => ({ default: m.PrivacyPasswordGenerator })));
const PrivacyHashGen        = React.lazy(() => import('./tools/PrivacyHashGenerator').then((m) => ({ default: m.PrivacyHashGenerator })));
const QRUrl                 = React.lazy(() => import('./tools/QRUrl').then((m) => ({ default: m.QRUrl })));
const QRText                = React.lazy(() => import('./tools/QRText').then((m) => ({ default: m.QRText })));
const QRWifi                = React.lazy(() => import('./tools/QRWifi').then((m) => ({ default: m.QRWifi })));
const QRVcard               = React.lazy(() => import('./tools/QRVcard').then((m) => ({ default: m.QRVcard })));
const QRStudio              = React.lazy(() => import('./tools/QRStudio').then((m) => ({ default: m.QRStudio })));

// ── AI Tools ──────────────────────────────────────────────────────────────────
const AISummarizer          = React.lazy(() => import('./tools/ai/AISummarizer').then((m) => ({ default: m.AISummarizer })));
const AIRewriter            = React.lazy(() => import('./tools/ai/AIRewriter').then((m) => ({ default: m.AIRewriter })));
const AIGrammarChecker      = React.lazy(() => import('./tools/ai/AIGrammarChecker').then((m) => ({ default: m.AIGrammarChecker })));
const AIParaphraser         = React.lazy(() => import('./tools/ai/AIParaphraser').then((m) => ({ default: m.AIParaphraser })));
const AIToneChanger         = React.lazy(() => import('./tools/ai/AIToneChanger').then((m) => ({ default: m.AIToneChanger })));
const AITextSimplifier      = React.lazy(() => import('./tools/ai/AITextSimplifier').then((m) => ({ default: m.AITextSimplifier })));
const AIBulletPoints        = React.lazy(() => import('./tools/ai/AIBulletPoints').then((m) => ({ default: m.AIBulletPoints })));
const AIEmailGenerator      = React.lazy(() => import('./tools/ai/AIEmailGenerator').then((m) => ({ default: m.AIEmailGenerator })));
const AIBlogOutline         = React.lazy(() => import('./tools/ai/AIBlogOutline').then((m) => ({ default: m.AIBlogOutline })));
const AINotesSummarizer     = React.lazy(() => import('./tools/ai/AINotesSummarizer').then((m) => ({ default: m.AINotesSummarizer })));
const AIFlashcardGenerator  = React.lazy(() => import('./tools/ai/AIFlashcardGenerator').then((m) => ({ default: m.AIFlashcardGenerator })));
const AIQuizGenerator       = React.lazy(() => import('./tools/ai/AIQuizGenerator').then((m) => ({ default: m.AIQuizGenerator })));
const AICodeExplainer       = React.lazy(() => import('./tools/ai/AICodeExplainer').then((m) => ({ default: m.AICodeExplainer })));
const AIErrorExplainer      = React.lazy(() => import('./tools/ai/AIErrorExplainer').then((m) => ({ default: m.AIErrorExplainer })));
const AIReadmeGenerator     = React.lazy(() => import('./tools/ai/AIReadmeGenerator').then((m) => ({ default: m.AIReadmeGenerator })));

// ─── Tool Component Map ────────────────────────────────────────────────────────

const TOOL_COMPONENTS: Record<string, React.ComponentType> = {
  'image-compressor':       ImageCompressor,
  'image-resizer':          ImageResizer,
  'image-cropper':          ImageCropper,
  'image-format-converter': ImageFormatConverter,
  'image-rotator':          ImageRotator,
  'image-to-base64':        ImageToBase64,
  'base64-to-image':        Base64ToImage,
  'image-metadata-viewer':  ImageMetadataViewer,
  'target-file-size-compressor': TargetSizeCompressor,
  'passport-photo-maker':   PassportPhotoMaker,
  'social-media-resizer':   SocialMediaResizer,
  'image-color-picker':     ImageColorPicker,
  'image-watermark':        ImageWatermark,
  'image-dimension-checker': ImageDimensionChecker,
  'merge-pdf':              MergePDF,
  'split-pdf':              SplitPDF,
  'compress-pdf':           CompressPDF,
  'rotate-pdf':             RotatePDF,
  'pdf-organizer':          PDFOrganizer,
  'pdf-page-extractor':     PDFPageExtractor,
  'images-to-pdf':          ImagesToPDF,
  'pdf-to-images':          PDFToImages,
  'pdf-info':               PDFInfo,
  'add-page-numbers':       AddPageNumbers,
  'pdf-watermark':          PDFWatermark,
  'word-counter':           WordCounter,
  'case-converter':         CaseConverter,
  'remove-extra-spaces':    RemoveSpaces,
  'text-diff':              TextDiff,
  'markdown-previewer':     MarkdownPreviewer,
  'csv-to-json':            CSVToJSON,
  'json-to-csv':            JSONToCSV,
  'invoice-generator':      InvoiceGenerator,
  'gpa-calculator':         GPACalculator,
  'cgpa-calculator':        CGPACalculator,
  'percentage-calculator':  PercentageCalculator,
  'pomodoro-timer':         PomodoroTimer,
  'flashcard-creator':      FlashcardCreator,
  'unit-converter':         UnitConverter,
  'scientific-calculator':  ScientificCalculator,
  'citation-formatter':     CitationFormatter,
  'resume-builder':         ResumeBuilder,
  'cover-letter-builder':   CoverLetterBuilder,
  'job-tracker':            JobTracker,
  'skills-checklist':       SkillsChecklist,
  'json-formatter':         JSONFormatter,
  'base64-encoder':         Base64Encoder,
  'url-encoder':            URLEncoder,
  'uuid-generator':         UUIDGenerator,
  'password-generator':     PasswordGenerator,
  'hash-generator':         HashGenerator,
  'regex-tester':           RegexTester,
  'jwt-decoder':            JWTDecoder,
  'color-converter':        ColorConverter,
  'lorem-ipsum':            LoremIpsum,
  'timestamp-converter':    TimestampConverter,
  'html-entity-encoder':    HTMLEntityEncoder,
  'url-parser':             URLParser,
  'qr-code-generator':      QRStudio,
  'qr-studio':              QRStudio,
  'qr-code-scanner':        QRCodeScanner,
  'aspect-ratio-calculator': AspectRatioCalc,
  'file-size-calculator':   FileSizeCalc,
  'privacy-password-generator': PrivacyPasswordGen,
  'privacy-hash-generator': PrivacyHashGen,
  'qr-url':                 QRUrl,
  'qr-text':                QRText,
  'qr-wifi':                QRWifi,
  'qr-vcard':               QRVcard,

  // AI Tools
  'ai-summarizer':          AISummarizer,
  'ai-rewriter':            AIRewriter,
  'ai-grammar-checker':     AIGrammarChecker,
  'ai-paraphraser':         AIParaphraser,
  'ai-tone-changer':        AIToneChanger,
  'ai-text-simplifier':     AITextSimplifier,
  'ai-bullet-points':       AIBulletPoints,
  'ai-email-generator':     AIEmailGenerator,
  'ai-blog-outline':        AIBlogOutline,
  'ai-notes-summarizer':    AINotesSummarizer,
  'ai-flashcard-generator': AIFlashcardGenerator,
  'ai-quiz-generator':      AIQuizGenerator,
  'ai-code-explainer':      AICodeExplainer,
  'ai-error-explainer':     AIErrorExplainer,
  'ai-readme-generator':    AIReadmeGenerator,
};

// ─── Tool Page Dispatcher ──────────────────────────────────────────────────────

function ToolLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin size-8 text-[#2563EB]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm text-[#64748B]">Loading tool…</p>
      </div>
    </div>
  );
}

export function ToolPage() {
  const { slug } = useParams<{ slug: string }>();
  const tool = getToolBySlug(slug || '');

  if (!tool) {
    return <Navigate to="/tools" replace />;
  }

  const ToolComponent = TOOL_COMPONENTS[tool.slug];

  return (
    <ToolPageLayout tool={tool}>
      {ToolComponent ? (
        <React.Suspense fallback={<ToolLoadingFallback />}>
          <ToolComponent />
        </React.Suspense>
      ) : (
        <div className="py-12 text-center">
          <p className="text-gray-500">This tool is being developed. Check back soon.</p>
        </div>
      )}
    </ToolPageLayout>
  );
}
