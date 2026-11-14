import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  ChevronRight, ArrowLeft, Filter, Building2,
  Calendar, ShieldCheck, AlertCircle
} from 'lucide-react';
import { SEO } from '../../components/common/SEO';
import { JobCard } from '../../components/jobs/JobCard';
import { JOB_CATEGORIES, getJobsByCategory } from '../../data/jobs';
import { JobCategory, JobStatus } from '../../types/jobs';
import { computeJobStatus } from '../../data/jobs/helpers';

interface JobCategoryPageProps {
  categoryOverride?: JobCategory;
}

export function JobCategoryPage({ categoryOverride }: JobCategoryPageProps) {
  const { categoryId } = useParams<{ categoryId: string }>();
  const activeCategoryId = (categoryOverride || categoryId || '') as JobCategory;

  const categoryMeta = JOB_CATEGORIES.find((c) => c.id === activeCategoryId);

  const [statusFilter, setStatusFilter] = useState<'ALL' | JobStatus>('ALL');

  if (!categoryMeta) {
    return <Navigate to="/jobs" replace />;
  }

  const allJobs = getJobsByCategory(activeCategoryId);

  const filteredJobs = allJobs.filter((job) => {
    if (statusFilter === 'ALL') return true;
    const s = computeJobStatus(job.startDate, job.lastDate);
    return s === statusFilter;
  });

  const categorySchema = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${categoryMeta.title} – Zenvio FXO`,
      description: categoryMeta.description,
      url: `https://zenvio-fxo.vercel.app${categoryMeta.path}`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://zenvio-fxo.vercel.app/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Government Jobs',
          item: 'https://zenvio-fxo.vercel.app/jobs',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: categoryMeta.title,
          item: `https://zenvio-fxo.vercel.app${categoryMeta.path}`,
        },
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <SEO
        title={`${categoryMeta.title} 2026 – Latest Notifications & Application Dates | Zenvio FXO`}
        description={categoryMeta.description}
        canonicalPath={categoryMeta.path}
        jsonLd={categorySchema}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#64748B]">
        <Link to="/" className="hover:text-[#0F172A] transition-colors">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <Link to="/jobs" className="hover:text-[#0F172A] transition-colors">
          Government Jobs
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-semibold text-[#0F172A]">{categoryMeta.shortTitle}</span>
      </nav>

      {/* Category Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border border-[#E2E8F0] rounded-2xl shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-[#2563EB] text-xs font-semibold mb-2">
            <Building2 className="size-3.5" />
            Official Recruitment Stream
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            {categoryMeta.title}
          </h1>
          <p className="mt-2 text-sm text-[#475569] max-w-2xl leading-relaxed">
            {categoryMeta.description}
          </p>
        </div>

        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#E2E8F0] bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-semibold text-[#475569] transition-colors self-start md:self-auto"
        >
          <ArrowLeft className="size-3.5" /> All Jobs Hub
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[#64748B] font-semibold pr-2 flex items-center gap-1">
            <Filter className="size-3.5" /> Status:
          </span>
          {(['ALL', 'APPLY NOW', 'NEW', 'CLOSING SOON', 'CLOSED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <span className="text-xs font-semibold text-[#64748B]">
          Showing {filteredJobs.length} {filteredJobs.length === 1 ? 'Notification' : 'Notifications'}
        </span>
      </div>

      {/* Job Cards Grid */}
      {filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white rounded-2xl border border-[#E2E8F0]">
          <AlertCircle className="size-8 text-[#94A3B8] mx-auto mb-2" />
          <h3 className="text-base font-bold text-[#0F172A]">No Jobs Found for this Filter</h3>
          <p className="mt-1 text-xs text-[#64748B]">
            There are currently no notifications matching status "{statusFilter}".
          </p>
          <button
            onClick={() => setStatusFilter('ALL')}
            className="mt-4 px-4 py-2 bg-blue-50 text-[#2563EB] text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Verification Notice */}
      <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0] text-xs text-[#64748B] flex items-start gap-2.5">
        <ShieldCheck className="size-4 text-[#2563EB] shrink-0 mt-0.5" />
        <p>
          All deadlines and eligibility specifications shown on this page are matched directly with official commission circulars. Verify complete terms with the official notification document prior to application fee payment.
        </p>
      </div>
    </div>
  );
}

