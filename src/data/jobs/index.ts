import { GovtJob, JobCategory } from '../../types/jobs';
import { CURATED_GOVT_JOBS } from './curatedJobs';
import { JOB_CATEGORIES } from './categories';
import { computeJobStatus } from './helpers';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export { JOB_CATEGORIES } from './categories';
export { computeJobStatus, formatGovtDate, getStatusBadgeStyle } from './helpers';

export const GOVT_JOBS: GovtJob[] = CURATED_GOVT_JOBS;

/**
 * Retrieve a specific job by its unique URL slug
 */
export function getJobBySlug(slug: string): GovtJob | undefined {
  return GOVT_JOBS.find((j) => j.slug === slug);
}

/**
 * Filter jobs by category
 */
export function getJobsByCategory(category: JobCategory): GovtJob[] {
  if (category === 'admit-cards') {
    return GOVT_JOBS.filter((j) => j.category === 'admit-cards' || j.isAdmitCard);
  }
  if (category === 'results') {
    return GOVT_JOBS.filter((j) => j.category === 'results' || j.isResult);
  }
  return GOVT_JOBS.filter((j) => j.category === category);
}

/**
 * Get latest active government job notifications sorted by start date
 */
export function getLatestJobs(limit = 10): GovtJob[] {
  return [...GOVT_JOBS]
    .filter((j) => !j.isAdmitCard && !j.isResult)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .slice(0, limit);
}

/**
 * Get featured jobs for homepage display
 */
export function getFeaturedJobs(limit = 6): GovtJob[] {
  const featured = GOVT_JOBS.filter((j) => j.featured && !j.isAdmitCard && !j.isResult);
  if (featured.length >= limit) return featured.slice(0, limit);
  return getLatestJobs(limit);
}

/**
 * Get admit card notifications
 */
export function getAdmitCards(limit = 5): GovtJob[] {
  return GOVT_JOBS.filter((j) => j.category === 'admit-cards' || j.isAdmitCard).slice(0, limit);
}

/**
 * Get exam results notifications
 */
export function getExamResults(limit = 5): GovtJob[] {
  return GOVT_JOBS.filter((j) => j.category === 'results' || j.isResult).slice(0, limit);
}

/**
 * Full-text search for government jobs across title, organization, qualification, category, and department
 */
export function searchGovtJobs(query: string, jobs: GovtJob[] = GOVT_JOBS): { job: GovtJob; score: number }[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  const results: { job: GovtJob; score: number }[] = [];

  for (const job of jobs) {
    let score = 0;

    if (job.title.toLowerCase() === q) {
      score += 100;
    } else if (job.title.toLowerCase().includes(q)) {
      score += 70;
    }

    if (job.organization.toLowerCase().includes(q) || job.shortOrg.toLowerCase().includes(q)) {
      score += 60;
    }

    if (job.qualification.toLowerCase().includes(q)) {
      score += 40;
    }

    if (job.department.toLowerCase().includes(q)) {
      score += 35;
    }

    if (job.category.toLowerCase().includes(q) || job.location.toLowerCase().includes(q)) {
      score += 25;
    }

    if (score > 0) {
      results.push({ job, score });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

/**
 * Optional Supabase fetcher for live dynamic job updates
 */
export async function fetchLiveGovtJobs(): Promise<GovtJob[]> {
  if (!isSupabaseConfigured || !supabase) {
    return GOVT_JOBS;
  }

  try {
    const { data, error } = await supabase
      .from('govt_jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return GOVT_JOBS;
    }

    return data as GovtJob[];
  } catch {
    return GOVT_JOBS;
  }
}

