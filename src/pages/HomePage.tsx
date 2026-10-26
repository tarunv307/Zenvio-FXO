import { Link } from 'react-router-dom';
import {
  ArrowRight, Image, FileText, Code2, GraduationCap,
  Briefcase, ShieldCheck, ChevronRight, Zap, Lock, Download
} from 'lucide-react';
import { TOOLS, CATEGORIES, getFeaturedTools, getToolsByCategory } from '../data/tools';
import { ToolCard, CategoryCard } from '../components/ui/Cards';
import { SearchBar } from '../components/layout/Header';

// ─── Stats derived from actual data ──────────────────────────────────────────
const LIVE_TOOLS = TOOLS.filter((t) => t.status === 'live').length;

// ─── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative pt-16 pb-12 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-brand-50/60 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-6">
          <div className="size-1.5 rounded-full bg-brand-500 animate-pulse" />
          {LIVE_TOOLS} tools available • All free • No sign-up required
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight">
          Everyday Tasks.
          <br />
          <span className="text-brand-500">Made Effortless.</span>
        </h1>

        <p className="mt-5 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Discover simple, powerful tools for images, PDFs, documents, development, learning,
          and everyday productivity — all running in your browser.
        </p>

        {/* Search */}
        <div className="mt-8 max-w-lg mx-auto">
          <SearchBar placeholder="Search tools — try 'compress', 'PDF', 'QR code'…" className="text-base" />
        </div>

        {/* CTA Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 active:bg-brand-700 transition-colors shadow-brand"
          >
            Explore All Tools <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            to="#categories"
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-colors"
          >
            Browse Categories
          </Link>
        </div>

        {/* Trust signals */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
          <span className="flex items-center gap-1.5"><Lock className="size-4 text-brand-500" />Files never uploaded</span>
          <span className="flex items-center gap-1.5"><Zap className="size-4 text-brand-500" />Instant processing</span>
          <span className="flex items-center gap-1.5"><Download className="size-4 text-brand-500" />No watermarks</span>
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ──────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: Image,
      title: 'Choose a Tool',
      description: 'Browse by category or search to find the exact tool you need from our growing library.',
    },
    {
      number: '02',
      icon: FileText,
      title: 'Upload or Enter Input',
      description: 'Drag and drop files or type your content. Files are processed entirely in your browser.',
    },
    {
      number: '03',
      icon: Download,
      title: 'Download Your Result',
      description: 'Preview the output, then download your processed file or copy the result with one click.',
    },
  ];

  return (
    <section className="py-16 border-t border-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">How it works</h2>
          <p className="mt-2 text-sm text-gray-500">Three steps to get things done.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div key={step.number} className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50">
              <span className="absolute top-4 right-4 text-5xl font-black text-gray-100 select-none" aria-hidden="true">
                {step.number}
              </span>
              <div className="flex size-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600 mb-4">
                <step.icon className="size-6" aria-hidden="true" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Featured Tools ────────────────────────────────────────────────────────────

function FeaturedTools() {
  const featured = getFeaturedTools().slice(0, 9);

  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Popular Tools</h2>
            <p className="mt-1 text-sm text-gray-500">The most-used utilities in Zenvio FXO.</p>
          </div>
          <Link
            to="/tools"
            className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            All {LIVE_TOOLS} tools <ChevronRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Categories Grid ───────────────────────────────────────────────────────────

function CategoriesGrid() {
  return (
    <section id="categories" className="py-12 bg-gray-50/60 border-y border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900">Browse by Category</h2>
          <p className="mt-1.5 text-sm text-gray-500 max-w-lg">
            Curated tool collections for specific tasks — find what you need without hunting.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.id}
              categoryId={cat.id}
              toolCount={getToolsByCategory(cat.id).filter((t) => t.status === 'live').length}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Privacy Section ───────────────────────────────────────────────────────────

function PrivacySection() {
  const points = [
    {
      icon: Lock,
      title: 'Files Stay in Your Browser',
      description: 'Image compression, PDF merging, and document processing all happen locally using browser APIs. Your files are never transmitted to any server.',
    },
    {
      icon: ShieldCheck,
      title: 'No Account Required',
      description: 'Most tools work without signing up. An optional account lets you save preferences and favourite tools — but it\'s never mandatory.',
    },
    {
      icon: Code2,
      title: 'Open Processing',
      description: 'All processing logic runs in the browser using well-known libraries. No hidden server-side operations for file-based tools.',
    },
  ];

  return (
    <section className="py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">Your Privacy Comes First</h2>
          <p className="mt-2 text-sm text-gray-500 max-w-xl mx-auto">
            We built Zenvio FXO with a privacy-by-default approach. Here's what that means in practice.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {points.map((point) => (
            <div key={point.title} className="p-6 rounded-2xl border border-gray-200 bg-white">
              <div className="flex size-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 mb-4">
                <point.icon className="size-5" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{point.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{point.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ Section ──────────────────────────────────────────────────────────────

function FAQSection() {
  const faqs = [
    {
      q: 'Are all tools free to use?',
      a: 'Yes. All tools in Zenvio FXO are free. We do not charge for any tool, and we do not show intrusive ads.',
    },
    {
      q: 'Do I need to create an account?',
      a: 'No account is required for any tool. An optional account lets you save favourite tools and preferences.',
    },
    {
      q: 'Are my files safe? Do you store them?',
      a: 'File-processing tools (image compressor, PDF merger, etc.) run entirely in your browser. Your files are not uploaded to any server and are not stored anywhere.',
    },
    {
      q: 'What file size limits apply?',
      a: 'Limits vary by tool, but most image tools support files up to 50 MB and PDF tools up to 100 MB. Each tool page states its specific limits.',
    },
    {
      q: 'What formats are supported?',
      a: 'Supported formats depend on the tool. Image tools generally support JPG, PNG, WebP, and GIF. PDF tools support standard PDF files. Each tool lists its supported formats.',
    },
    {
      q: 'Can I use Zenvio FXO on mobile?',
      a: 'Yes. The website is fully responsive and works on phones and tablets. Some tools that use drag-and-drop also support file selection via the browse button.',
    },
  ];

  return (
    <section className="py-16 bg-gray-50/60 border-t border-gray-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {faqs.map((faq) => (
            <div key={faq.q} className="py-5">
              <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/faq"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            View all FAQs <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────

export function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedTools />
      <CategoriesGrid />
      <HowItWorks />
      <PrivacySection />
      <FAQSection />
    </>
  );
}
