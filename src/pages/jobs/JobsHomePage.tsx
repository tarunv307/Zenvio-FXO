import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, Search, ArrowRight, ShieldCheck, Calendar,
  Building2, Award, Landmark, Train, FileCheck, Coins,
  Shield, CreditCard, CheckCircle2, ChevronRight, ExternalLink,
  Sparkles, AlertCircle
} from 'lucide-react';
import { SEO } from '../../components/common/SEO';
import { JobCard } from '../../components/jobs/JobCard';
import {
  GOVT_JOBS,
  JOB_CATEGORIES,
  getLatestJobs,
  getJobsByCategory,
  getAdmitCards,
  getExamResults,
  searchGovtJobs
} from '../../data/jobs';
import { GovtJob } from '../../types/jobs';

export function JobsHomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ job: GovtJob; score: number }[]>([]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim().length >= 2) {
      setSearchResults(searchGovtJobs(q));
    } else {
      setSearchResults([]);
    }
  };

  const latestJobs = getLatestJobs(6);
  const tnJobs = getJobsByCategory('tamil-nadu').slice(0, 4);
  const centralJobs = getJobsByCategory('central-government').slice(0, 4);
  const railwayJobs = getJobsByCategory('railway').slice(0, 4);
  const sscJobs = getJobsByCategory('ssc').slice(0, 4);
  const upscJobs = getJobsByCategory('upsc').slice(0, 4);
  const bankingJobs = getJobsByCategory('banking').slice(0, 4);
  const defenceJobs = getJobsByCategory('defence').slice(0, 4);
  const admitCards = getAdmitCards(4);
  const examResults = getExamResults(4);

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Government Jobs Portal – Zenvio FXO',
    url: 'https://zenvio-fxo.vercel.app/jobs',
    description:
      'Curated directory of authentic Government Jobs, SSC, UPSC, Railway, Tamil Nadu, Banking, and Defence recruitments with official notification links and deadlines.',
  };

  return (
    <div className="space-y-12 pb-16">
      <SEO
        title="Government Jobs & Notifications 2026 – Latest Sarkari Bharti | Zenvio FXO"
        description="Discover authentic Government Job notifications, Tamil Nadu Govt Jobs, Railway, SSC, UPSC, Banking, Defence recruitments, admit cards, and exam results with direct official links."
        canonicalPath="/jobs"
        jsonLd={websiteSchema}
      />

      {/* Hero Header */}
      <section className="relative pt-8 pb-10 border-b border-[#E2E8F0] bg-gradient-to-b from-blue-50/60 to-transparent">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-[#1D4ED8] text-xs font-bold mb-4">
              <ShieldCheck className="size-4 text-[#2563EB]" />
              100% Verified Official Sources • Direct Notification Links
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
              Government Jobs & Notifications
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[#475569] leading-relaxed">
              Curated, factual recruitment updates across Central, Tamil Nadu, Railway, SSC, UPSC, Banking, and Defence sectors. No clickbait, strictly authoritative official notifications.
            </p>

            {/* Quick Search */}
            <div className="mt-6 w-full max-w-lg relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#94A3B8]" />
              <input
                type="search"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by job title, department, or organization (e.g. UPSC, TNPSC, SSC)…"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#E2E8F0] bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] shadow-xs"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Search Results Display */}
      {searchQuery.trim().length >= 2 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0F172A]">
              Search Results for "{searchQuery}" ({searchResults.length})
            </h2>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-[#2563EB] font-semibold hover:underline"
            >
              Clear Search
            </button>
          </div>

          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {searchResults.map(({ job }) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#E2E8F0]">
              <p className="text-sm text-[#64748B]">No government jobs found matching "{searchQuery}".</p>
            </div>
          )}
        </section>
      )}

      {/* Category Navigation Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-[#0F172A]">Explore by Category</h2>
          <p className="text-xs text-[#64748B] mt-0.5">Quick access to departmental and sector recruitment notifications.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
          {JOB_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={cat.path}
              className="flex items-center gap-3 p-3.5 bg-white border border-[#E2E8F0] rounded-xl hover:border-blue-300 hover:shadow-xs transition-all group"
            >
              <div className={`size-10 rounded-lg ${cat.bgColor} flex items-center justify-center shrink-0`}>
                <Building2 className="size-5" style={{ color: cat.color }} />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors truncate">
                  {cat.title}
                </h3>
                <p className="text-[11px] text-[#64748B] truncate">View notifications</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Government Jobs */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">Latest Government Jobs</h2>
            <p className="text-xs text-[#64748B] mt-0.5">Recently verified active recruitment drives across India.</p>
          </div>
          <Link
            to="/jobs/central-government"
            className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1"
          >
            View all <ChevronRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {latestJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>

      {/* Tamil Nadu Government Jobs */}
      {tnJobs.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-[#0F172A]">Tamil Nadu Government Jobs</h2>
              <p className="text-xs text-[#64748B] mt-0.5">TNPSC, TNUSRB, and state departmental opportunities.</p>
            </div>
            <Link
              to="/jobs/tamil-nadu"
              className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1"
            >
              View TN Jobs <ChevronRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tnJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </section>
      )}

      {/* Railway & SSC Sections */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Railway */}
          <div>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                <Train className="size-4 text-[#059669]" /> Railway Recruitment (RRB)
              </h2>
              <Link to="/jobs/railway" className="text-xs font-semibold text-[#2563EB] hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {railwayJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>

          {/* SSC */}
          <div>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                <FileCheck className="size-4 text-[#7C3AED]" /> Staff Selection Commission (SSC)
              </h2>
              <Link to="/jobs/ssc" className="text-xs font-semibold text-[#2563EB] hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {sscJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Admit Cards & Exam Results Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Admit Cards */}
          <div className="p-6 bg-slate-50/70 rounded-2xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                <CreditCard className="size-4 text-[#4F46E5]" />
                Latest Admit Cards
              </h3>
              <Link to="/jobs/admit-cards" className="text-xs font-semibold text-[#2563EB] hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {admitCards.map((job) => (
                <div key={job.id} className="p-4 bg-white rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider">{job.shortOrg}</span>
                  <h4 className="text-sm font-bold text-[#0F172A] mt-1">{job.title}</h4>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Exam Date: {job.importantDates.examDate}</span>
                    <Link to={`/jobs/${job.slug}`} className="text-[#2563EB] font-semibold hover:underline">
                      Download Link →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Exam Results */}
          <div className="p-6 bg-slate-50/70 rounded-2xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#EA580C]" />
                Exam Results & Cut-Offs
              </h3>
              <Link to="/jobs/results" className="text-xs font-semibold text-[#2563EB] hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {examResults.map((job) => (
                <div key={job.id} className="p-4 bg-white rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] font-bold text-[#EA580C] uppercase tracking-wider">{job.shortOrg}</span>
                  <h4 className="text-sm font-bold text-[#0F172A] mt-1">{job.title}</h4>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Result Status: Verified</span>
                    <Link to={`/jobs/${job.slug}`} className="text-[#2563EB] font-semibold hover:underline">
                      View Merit List →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Disclaimer */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="p-4 rounded-xl bg-slate-100/80 border border-[#E2E8F0] text-xs text-[#64748B] flex items-start gap-3">
          <ShieldCheck className="size-4 text-[#2563EB] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Authoritative Source Commitment:</strong> All recruitment details listed on Zenvio FXO are compiled directly from gazetted government notifications and official recruitment commission portals (e.g., upsc.gov.in, ssc.gov.in, tnpsc.gov.in, rrbcdg.gov.in). Candidates are strictly advised to review the official notification PDF and verify all eligibility conditions before submitting online application forms.
          </p>
        </div>
      </section>
    </div>
  );
}

