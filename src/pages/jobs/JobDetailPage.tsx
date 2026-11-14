import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  ChevronRight, ArrowLeft, Calendar, MapPin, GraduationCap,
  Users, Building2, ExternalLink, ShieldCheck, Clock, FileText,
  CreditCard, Award, CheckCircle2, AlertCircle, Info, Landmark
} from 'lucide-react';
import { SEO } from '../../components/common/SEO';
import { getJobBySlug, JOB_CATEGORIES } from '../../data/jobs';
import { computeJobStatus, formatGovtDate, getStatusBadgeStyle } from '../../data/jobs/helpers';

export function JobDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const job = getJobBySlug(slug || '');

  if (!job) {
    return <Navigate to="/jobs" replace />;
  }

  const categoryMeta = JOB_CATEGORIES.find((c) => c.id === job.category);
  const status = computeJobStatus(job.startDate, job.lastDate);
  const badgeStyle = getStatusBadgeStyle(status);

  // SEO JSON-LD schema (JobPosting only included if job is active and not closed!)
  const jsonLdData: any[] = [
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
        ...(categoryMeta
          ? [
              {
                '@type': 'ListItem',
                position: 3,
                name: categoryMeta.shortTitle,
                item: `https://zenvio-fxo.vercel.app${categoryMeta.path}`,
              },
            ]
          : []),
        {
          '@type': 'ListItem',
          position: categoryMeta ? 4 : 3,
          name: job.title,
          item: `https://zenvio-fxo.vercel.app/jobs/${job.slug}`,
        },
      ],
    },
  ];

  // ONLY generate JobPosting structured data if the job is actively open and not closed
  if (status !== 'CLOSED' && !job.isAdmitCard && !job.isResult) {
    jsonLdData.push({
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: job.title,
      description: job.overview,
      datePosted: job.startDate,
      validThrough: `${job.lastDate}T23:59:59`,
      employmentType: 'FULL_TIME',
      hiringOrganization: {
        '@type': 'Organization',
        name: job.organization,
        sameAs: job.sourceUrl,
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'IN',
          addressRegion: job.location,
        },
      },
      educationRequirements: job.qualification,
      totalJobOpenings: typeof job.vacancies === 'number' ? job.vacancies : undefined,
    });
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <SEO
        title={`${job.title} – ${job.organization} | Zenvio FXO`}
        description={`${job.title} by ${job.organization}. Total Vacancies: ${job.vacancies}. Last Date to apply: ${formatGovtDate(job.lastDate)}. View official notification and application links.`}
        canonicalPath={`/jobs/${job.slug}`}
        jsonLd={jsonLdData}
      />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#64748B] flex-wrap">
        <Link to="/" className="hover:text-[#0F172A] transition-colors">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <Link to="/jobs" className="hover:text-[#0F172A] transition-colors">
          Government Jobs
        </Link>
        {categoryMeta && (
          <>
            <ChevronRight className="size-3.5" />
            <Link to={categoryMeta.path} className="hover:text-[#0F172A] transition-colors">
              {categoryMeta.shortTitle}
            </Link>
          </>
        )}
        <ChevronRight className="size-3.5" />
        <span className="font-semibold text-[#0F172A] truncate max-w-xs">{job.title}</span>
      </nav>

      {/* Main Header Card */}
      <div className="p-6 sm:p-8 bg-white border border-[#E2E8F0] rounded-2xl shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-md bg-blue-50 text-[#2563EB] text-xs font-bold uppercase tracking-wide">
                {job.shortOrg}
              </span>
              <span className="text-xs text-[#64748B] font-medium">{job.department}</span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border tracking-wide uppercase ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
              >
                {status}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight leading-tight">
              {job.title}
            </h1>
            <p className="text-sm font-semibold text-[#475569]">{job.organization}</p>
          </div>

          <Link
            to={categoryMeta ? categoryMeta.path : '/jobs'}
            className="inline-flex items-center gap-1 px-3 py-1.5 border border-[#E2E8F0] bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-semibold text-[#475569] transition-colors self-start shrink-0"
          >
            <ArrowLeft className="size-3.5" /> Back to List
          </Link>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-[#E2E8F0] text-xs">
          <div>
            <span className="text-[#64748B] block">Total Vacancies</span>
            <span className="font-bold text-[#0F172A] text-sm sm:text-base">{job.vacancies}</span>
          </div>
          <div>
            <span className="text-[#64748B] block">Job Location</span>
            <span className="font-bold text-[#0F172A] text-sm sm:text-base">{job.location}</span>
          </div>
          <div>
            <span className="text-[#64748B] block">Application Starts</span>
            <span className="font-bold text-[#0F172A] text-sm sm:text-base">{formatGovtDate(job.startDate)}</span>
          </div>
          <div>
            <span className="text-[#64748B] block">Application Deadline</span>
            <span className="font-bold text-red-600 text-sm sm:text-base">{formatGovtDate(job.lastDate)}</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {job.officialNotificationUrl && (
            <a
              href={job.officialNotificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-semibold rounded-xl text-xs sm:text-sm border border-[#E2E8F0] transition-colors"
            >
              <FileText className="size-4 text-[#2563EB]" /> Official Notification PDF / Link <ExternalLink className="size-3.5" />
            </a>
          )}

          {status !== 'CLOSED' && job.officialApplyUrl ? (
            <a
              href={job.officialApplyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors shadow-sm"
            >
              Apply Online Officially <ExternalLink className="size-3.5" />
            </a>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-semibold">
              <Clock className="size-3.5" /> Application Period Closed
            </span>
          )}

          <div className="ml-auto text-[11px] text-[#64748B] flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-[#16A34A]" />
            Source Verified: {job.lastVerifiedDate}
          </div>
        </div>
      </div>

      {/* Official Summary Box vs Editorial Summary Notice */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950 space-y-2">
        <div className="flex items-center gap-2 font-bold text-blue-900">
          <Info className="size-4 text-[#2563EB]" />
          Official Notification Summary (Authentic Excerpt)
        </div>
        <p className="leading-relaxed font-mono text-[11.5px] bg-white/70 p-3 rounded-lg border border-blue-100">
          "{job.officialSummary}"
        </p>
        <p className="text-[10.5px] text-blue-800">
          * Note: Below is an editorial summary curated for applicant convenience. Always verify rules from the official notification document linked above.
        </p>
      </div>

      {/* Main Content Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left 2 Columns: Detailed Information */}
        <div className="md:col-span-2 space-y-8">
          {/* 1. Job Overview */}
          <section className="p-6 bg-white border border-[#E2E8F0] rounded-2xl shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
              <Building2 className="size-5 text-[#2563EB]" />
              Job Overview & Purpose
            </h2>
            <p className="text-sm text-[#475569] leading-relaxed">
              {job.overview}
            </p>
          </section>

          {/* 2. Eligibility Criteria */}
          <section className="p-6 bg-white border border-[#E2E8F0] rounded-2xl shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
              <GraduationCap className="size-5 text-[#2563EB]" />
              Eligibility Criteria
            </h2>

            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                  Educational Qualification:
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-[#475569]">
                  {job.eligibilityCriteria.education.map((item, idx) => (
                    <li key={idx} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-[#E2E8F0]">
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                  Age Limit:
                </h3>
                <p className="text-sm text-[#475569]">
                  {job.eligibilityCriteria.ageLimit.description}
                  {job.eligibilityCriteria.ageLimit.min && job.eligibilityCriteria.ageLimit.max && (
                    <span className="font-semibold text-[#0F172A]"> ({job.eligibilityCriteria.ageLimit.min} to {job.eligibilityCriteria.ageLimit.max} years)</span>
                  )}
                </p>
                {job.eligibilityCriteria.ageLimit.relaxationRules && (
                  <p className="text-xs text-[#64748B] mt-1 bg-slate-50 p-2 rounded-lg border border-[#E2E8F0]">
                    <strong>Age Relaxation:</strong> {job.eligibilityCriteria.ageLimit.relaxationRules}
                  </p>
                )}
              </div>

              {job.eligibilityCriteria.nationality && (
                <div className="pt-2 border-t border-[#E2E8F0]">
                  <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                    Nationality / Citizenship:
                  </h3>
                  <p className="text-sm text-[#475569]">{job.eligibilityCriteria.nationality}</p>
                </div>
              )}
            </div>
          </section>

          {/* 3. Vacancy Details Breakdown */}
          {job.vacancyBreakdown && job.vacancyBreakdown.length > 0 && (
            <section className="p-6 bg-white border border-[#E2E8F0] rounded-2xl shadow-xs space-y-3">
              <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                <Users className="size-5 text-[#2563EB]" />
                Vacancy Distribution
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-[#E2E8F0] rounded-xl overflow-hidden">
                  <thead className="bg-slate-50 text-[#0F172A] font-semibold border-b border-[#E2E8F0]">
                    <tr>
                      <th className="p-3">Post / Cadre Name</th>
                      <th className="p-3 text-right">Vacancies</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {job.vacancyBreakdown.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-3 font-medium text-[#0F172A]">{item.postName}</td>
                        <td className="p-3 text-right font-bold text-[#2563EB]">{item.vacancies}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* 4. Selection Process */}
          {job.selectionProcess && job.selectionProcess.length > 0 && (
            <section className="p-6 bg-white border border-[#E2E8F0] rounded-2xl shadow-xs space-y-3">
              <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                <Award className="size-5 text-[#2563EB]" />
                Selection Process
              </h2>
              <div className="space-y-2">
                {job.selectionProcess.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-[#E2E8F0] text-xs">
                    <span className="size-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-[#0F172A] font-medium leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 5. Salary Information */}
          <section className="p-6 bg-white border border-[#E2E8F0] rounded-2xl shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
              <Landmark className="size-5 text-[#2563EB]" />
              Salary & Pay Structure
            </h2>
            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2 text-xs">
              {job.salary.payScale && (
                <p className="text-[#0F172A]">
                  <strong>Pay Scale / Matrix:</strong> {job.salary.payScale}
                </p>
              )}
              {job.salary.inHandEstimate && (
                <p className="text-emerald-800 font-semibold">
                  <strong>Estimated Gross In-Hand:</strong> {job.salary.inHandEstimate}
                </p>
              )}
              <p className="text-[#475569] leading-relaxed pt-1 border-t border-emerald-100/60">
                {job.salary.officialDetails}
              </p>
            </div>
          </section>
        </div>

        {/* Right Sidebar: Important Dates, Fee, & Commission Source */}
        <div className="space-y-6">
          {/* Important Dates Box */}
          <div className="p-5 bg-white border border-[#E2E8F0] rounded-2xl shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 pb-2 border-b border-[#E2E8F0]">
              <Calendar className="size-4 text-[#2563EB]" />
              Important Schedule
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Notification Released:</span>
                <span className="font-semibold text-[#0F172A]">{formatGovtDate(job.importantDates.notificationDate || job.startDate)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Application Starts:</span>
                <span className="font-semibold text-[#0F172A]">{formatGovtDate(job.importantDates.startDate)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Last Date to Apply:</span>
                <span className="font-bold text-red-600">{formatGovtDate(job.importantDates.lastDate)}</span>
              </div>
              {job.importantDates.examDate && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-[#64748B]">Exam Date:</span>
                  <span className="font-semibold text-[#0F172A]">{job.importantDates.examDate}</span>
                </div>
              )}
              {job.importantDates.admitCardDate && (
                <div className="flex justify-between py-1">
                  <span className="text-[#64748B]">Admit Card Release:</span>
                  <span className="font-semibold text-[#0F172A]">{job.importantDates.admitCardDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Application Fee Box */}
          {job.applicationFee && (
            <div className="p-5 bg-white border border-[#E2E8F0] rounded-2xl shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 pb-2 border-b border-[#E2E8F0]">
                <CreditCard className="size-4 text-[#2563EB]" />
                Application Fee
              </h3>
              <div className="space-y-2 text-xs">
                {job.applicationFee.generalOBC && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-[#64748B]">General / OBC / EWS:</span>
                    <span className="font-bold text-[#0F172A]">{job.applicationFee.generalOBC}</span>
                  </div>
                )}
                {job.applicationFee.scStFemale && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-[#64748B]">SC / ST / PwBD / Female:</span>
                    <span className="font-bold text-emerald-600">{job.applicationFee.scStFemale}</span>
                  </div>
                )}
                {job.applicationFee.paymentMode && (
                  <p className="text-[11px] text-[#64748B] pt-1">
                    <strong>Payment Mode:</strong> {job.applicationFee.paymentMode}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Source Authority Box */}
          <div className="p-5 bg-slate-50 border border-[#E2E8F0] rounded-2xl space-y-3 text-xs">
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-[#16A34A]" />
              Official Portal Citation
            </h3>
            <p className="text-[#475569] leading-relaxed">
              This notice is derived from the official gazette of <strong>{job.organization}</strong>.
            </p>
            <div className="pt-2 border-t border-[#E2E8F0] space-y-1 text-[11px]">
              <div>
                <span className="text-[#64748B]">Authoritative Domain:</span>{' '}
                <a
                  href={job.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[#2563EB] hover:underline"
                >
                  {job.sourceUrl}
                </a>
              </div>
              <div>
                <span className="text-[#64748B]">Last Verified:</span>{' '}
                <span className="font-semibold text-[#0F172A]">{job.lastVerifiedDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

