import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Cpu, Globe, ArrowRight, Mail, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';
import { SEO } from '../../components/common/SEO';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SEO
        title="About Us – Zenvio FXO"
        description="Learn about Zenvio FXO, an all-in-one platform providing free browser-based tools with complete privacy and zero data uploads."
        canonicalPath="/about"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFF6FF] border border-blue-200 text-[#1D4ED8] text-xs font-semibold mb-4">
            About Zenvio FXO
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
            Every Tool. One Platform.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#475569] max-w-2xl mx-auto leading-relaxed">
            Zenvio FXO is a modern suite of free, browser-based online tools built to make everyday digital tasks fast, seamless, and completely private.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
            <div className="size-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center mb-4">
              <Lock className="size-5" />
            </div>
            <h2 className="text-lg font-bold text-[#0F172A] mb-2">100% In-Browser Privacy</h2>
            <p className="text-sm text-[#475569] leading-relaxed">
              Your files never leave your device. Image compression, PDF merging, document editing, and QR generation are processed client-side.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
            <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Cpu className="size-5" />
            </div>
            <h2 className="text-lg font-bold text-[#0F172A] mb-2">High Performance</h2>
            <p className="text-sm text-[#475569] leading-relaxed">
              Powered by modern web technologies, HTML5 canvas, and WebAssembly for instantaneous local processing without server delays.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
            <div className="size-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Globe className="size-5" />
            </div>
            <h2 className="text-lg font-bold text-[#0F172A] mb-2">Always Free</h2>
            <p className="text-sm text-[#475569] leading-relaxed">
              No mandatory paywalls, subscription fees, or intrusive ads. Just reliable utilities ready whenever you need them.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm space-y-6 text-[#334155] leading-relaxed">
          <h2 className="text-xl font-bold text-[#0F172A]">Our Mission</h2>
          <p>
            The web is often cluttered with tool sites packed with full-page ads, complex registration gates, and questionable file upload policies. Zenvio FXO was created to fix that: providing a clean, unified, fast, and privacy-first toolkit accessible to everyone from students and developers to professionals and creators.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <Link
              to="/tools"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white font-semibold rounded-xl hover:bg-[#1D4ED8] transition-colors text-sm shadow-sm"
            >
              Explore Tools <ArrowRight className="size-4" />
            </Link>
            <a
              href="https://github.com/tarunv307"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#E2E8F0] text-[#0F172A] font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SEO
        title="Privacy Policy – Zenvio FXO"
        description="Zenvio FXO privacy policy. Understand how our client-side processing guarantees your files and data never leave your browser."
        canonicalPath="/privacy"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-4">
            <Shield className="size-3.5" /> Privacy-First Architecture
          </div>
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Privacy Policy</h1>
          <p className="mt-2 text-sm text-[#64748B]">Last updated: October 27, 2026</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm space-y-6 text-[#334155] leading-relaxed text-sm">
          <div>
            <h2 className="text-base font-bold text-[#0F172A] mb-2">1. The Core Principle: Zero File Uploads</h2>
            <p>
              At Zenvio FXO, our core architectural decision is that <strong>your files are processed locally within your browser</strong>. When you compress an image, merge PDFs, crop photos, or convert formats, the data remains inside your device's memory. No file data is uploaded to, transmitted across, or stored on our servers.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-[#0F172A] mb-2">2. Information We Do Not Collect</h2>
            <p>
              We do not collect, view, or retain your uploaded photos, documents, PDFs, personal notes, passwords, or encrypted tokens.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-[#0F172A] mb-2">3. Optional User Accounts</h2>
            <p>
              Using Zenvio FXO does not require creating an account. If you choose to sign up or sign in (via email or Google authentication), your basic profile information (such as your name and email) is securely stored solely to preserve your tool preferences and favorites.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-[#0F172A] mb-2">4. Local Storage</h2>
            <p>
              We may use standard browser <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">localStorage</code> to save non-sensitive UI settings such as theme preferences or recently used tool configurations. This data never leaves your browser.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-[#0F172A] mb-2">5. Third-Party Services</h2>
            <p>
              Our website is hosted on Vercel. Standard server logs (such as IP addresses and user agents) may be automatically gathered by the hosting infrastructure solely for traffic monitoring, security, and DDOS mitigation.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-[#0F172A] mb-2">6. Contact</h2>
            <p>
              If you have any questions or feedback regarding this Privacy Policy, please visit our <Link to="/contact" className="text-[#2563EB] hover:underline font-medium">Contact page</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SEO
        title="Terms of Service – Zenvio FXO"
        description="Terms of service and usage conditions for Zenvio FXO free online productivity tools."
        canonicalPath="/terms"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#1D4ED8] text-xs font-semibold mb-4">
            <FileText className="size-3.5" /> Legal Terms
          </div>
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Terms of Service</h1>
          <p className="mt-2 text-sm text-[#64748B]">Last updated: October 27, 2026</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm space-y-6 text-[#334155] leading-relaxed text-sm">
          <div>
            <h2 className="text-base font-bold text-[#0F172A] mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Zenvio FXO (zenvio-fxo.vercel.app), you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use the website.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-[#0F172A] mb-2">2. Permitted Use</h2>
            <p>
              All tools provided on Zenvio FXO are free for personal, educational, and commercial use. You agree not to misuse the website, attempt unauthorized access, disrupt infrastructure, or use the tools for unlawful purposes.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-[#0F172A] mb-2">3. Intellectual Property</h2>
            <p>
              You retain all ownership, rights, and intellectual property in any files, images, or documents you process through Zenvio FXO. Zenvio FXO makes no claim of ownership over your content.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-[#0F172A] mb-2">4. Disclaimer of Warranties</h2>
            <p>
              The tools and services are provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. While we strive for precision and reliability across all utilities, we do not warrant that operation will be error-free or uninterrupted.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-[#0F172A] mb-2">5. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the platform constitutes acceptance of updated terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FAQPage() {
  const faqs = [
    {
      q: 'What is Zenvio FXO?',
      a: 'Zenvio FXO is an online platform that brings together 80+ essential digital tools for everyday tasks, including QR code generation, image optimization, PDF manipulation, text formatting, and developer utilities.',
    },
    {
      q: 'Are the tools really free to use?',
      a: 'Yes, all tools on Zenvio FXO are 100% free with no subscription requirements, hidden paywalls, or credit card requirements.',
    },
    {
      q: 'Do you store or upload my files?',
      a: 'No. Tools run directly in your web browser using HTML5 Canvas, Web Workers, and WebAssembly APIs. Your files are never uploaded to any remote server.',
    },
    {
      q: 'Do I need to install software or extensions?',
      a: 'No installation is needed. Zenvio FXO runs in any modern web browser on desktop, tablet, and mobile devices.',
    },
    {
      q: 'What are the supported image and document formats?',
      a: 'Image tools support JPG, PNG, WebP, GIF, and SVG. Document tools handle PDF, TXT, CSV, JSON, Markdown, and various code formats.',
    },
    {
      q: 'Do I need an account to use the tools?',
      a: 'No. All tools are fully functional without signing in. Creating an optional account simply allows you to save favorite tools for quick access.',
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SEO
        title="Frequently Asked Questions – Zenvio FXO"
        description="Find answers to common questions about Zenvio FXO tools, security, file limitations, and browser compatibility."
        canonicalPath="/faq"
        jsonLd={faqSchema}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#1D4ED8] text-xs font-semibold mb-4">
            <HelpCircle className="size-3.5" /> Support & Help
          </div>
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Frequently Asked Questions</h1>
          <p className="mt-2 text-sm text-[#475569]">
            Everything you need to know about Zenvio FXO, our tools, and privacy guarantees.
          </p>
        </div>

        <div className="divide-y divide-[#E2E8F0] bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 sm:p-8">
          {faqs.map((faq) => (
            <div key={faq.q} className="py-5 first:pt-0 last:pb-0">
              <h2 className="text-base font-bold text-[#0F172A] mb-2">{faq.q}</h2>
              <p className="text-sm text-[#475569] leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SEO
        title="Contact & Support – Zenvio FXO"
        description="Get in touch with the Zenvio FXO team for support, feedback, bug reports, and tool suggestions."
        canonicalPath="/contact"
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#1D4ED8] text-xs font-semibold mb-4">
            <Mail className="size-3.5" /> Get in Touch
          </div>
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Contact & Support</h1>
          <p className="mt-2 text-sm text-[#475569]">
            Have a question, feedback, or a suggestion for a new tool? We'd love to hear from you.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8 space-y-6">
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-[#0F172A]">Community & Open Feedback</h2>
            <p className="text-sm text-[#475569] leading-relaxed">
              Zenvio FXO is continuously being improved. If you encounter an issue with any tool or would like to request new features, the best way to reach out is via GitHub.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0] flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-[#0F172A]">GitHub Repository & Issues</p>
              <p className="text-xs text-[#64748B]">Report bugs, view the project, or contribute</p>
            </div>
            <a
              href="https://github.com/tarunv307"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#2563EB] text-white text-xs font-semibold rounded-lg hover:bg-[#1D4ED8] transition-colors shrink-0"
            >
              Open GitHub
            </a>
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] text-xs text-[#64748B] flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600" />
            <span>Response time is typically within 24-48 hours.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
