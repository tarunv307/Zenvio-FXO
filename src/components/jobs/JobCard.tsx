import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, MapPin, GraduationCap, Users, ExternalLink,
  ChevronRight, Building2, Clock, ShieldCheck
} from 'lucide-react';
import { GovtJob } from '../../types/jobs';
import { computeJobStatus, formatGovtDate, getStatusBadgeStyle } from '../../data/jobs/helpers';

interface JobCardProps {
  job: GovtJob;
  compact?: boolean;
}

export function JobCard({ job, compact = false }: JobCardProps) {
  const status = computeJobStatus(job.startDate, job.lastDate);
  const badgeStyle = getStatusBadgeStyle(status);

  return (
    <article
      className="group relative flex flex-col justify-between p-5 bg-white rounded-2xl border border-[#E2E8F0] hover:border-blue-300 hover:shadow-card-hover transition-all duration-200"
      aria-labelledby={`job-title-${job.id}`}
    >
      <div>
        {/* Top Header: Organization & Status Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] font-bold text-xs shrink-0">
              {job.shortOrg.slice(0, 3).toUpperCase()}
            </div>
            <div>
              <span className="text-xs font-semibold text-[#0F172A] line-clamp-1">
                {job.organization}
              </span>
              <span className="text-[11px] text-[#64748B] flex items-center gap-1 line-clamp-1">
                {job.department}
              </span>
            </div>
          </div>

          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wide uppercase shrink-0 ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
            aria-label={`Status: ${status}`}
          >
            {status}
          </span>
        </div>

        {/* Job Title */}
        <h3
          id={`job-title-${job.id}`}
          className="text-base font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors leading-snug mb-3"
        >
          <Link to={`/jobs/${job.slug}`} className="hover:underline focus:outline-none">
            {job.title}
          </Link>
        </h3>

        {/* Quick Specs Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs text-[#475569] mb-4">
          <div className="flex items-center gap-1.5 truncate">
            <Users className="size-3.5 text-[#64748B] shrink-0" />
            <span className="truncate">
              <strong>{job.vacancies}</strong> Vacancies
            </span>
          </div>

          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="size-3.5 text-[#64748B] shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>

          <div className="flex items-center gap-1.5 col-span-2 truncate">
            <GraduationCap className="size-3.5 text-[#64748B] shrink-0" />
            <span className="truncate" title={job.qualification}>
              {job.qualification}
            </span>
          </div>

          <div className="flex items-center gap-1.5 col-span-2 text-[11px] text-[#64748B]">
            <Clock className="size-3.5 text-amber-600 shrink-0" />
            <span>
              Apply by: <strong className="text-[#0F172A]">{formatGovtDate(job.lastDate)}</strong>
              {job.startDate && (
                <span className="text-slate-400"> (Started {formatGovtDate(job.startDate)})</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-2 mt-auto">
        <Link
          to={`/jobs/${job.slug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
        >
          View Full Details <ChevronRight className="size-3.5" />
        </Link>

        <div className="flex items-center gap-2">
          {job.officialNotificationUrl && (
            <a
              href={job.officialNotificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#475569] bg-slate-50 hover:bg-slate-100 border border-[#E2E8F0] rounded-lg transition-colors"
              title="Official Notification Link"
            >
              Notice <ExternalLink className="size-3" />
            </a>
          )}

          {status !== 'CLOSED' && job.officialApplyUrl && (
            <a
              href={job.officialApplyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg transition-colors shadow-xs"
            >
              Apply Online <ExternalLink className="size-3" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

