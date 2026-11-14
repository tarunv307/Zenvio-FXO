import { GovtJob, JobStatus } from '../../types/jobs';

/**
 * Automatically mark job status based on application start and end dates.
 * - If current date > lastDate -> CLOSED
 * - If days remaining <= 3 -> CLOSING SOON
 * - If days since startDate <= 7 -> NEW
 * - Else -> APPLY NOW
 */
export function computeJobStatus(startDateStr: string, lastDateStr: string): JobStatus {
  const now = new Date();
  // Normalize to start of day for comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const [lastY, lastM, lastD] = lastDateStr.split('-').map(Number);
  const lastDate = new Date(lastY, lastM - 1, lastD, 23, 59, 59).getTime();

  if (today > lastDate) {
    return 'CLOSED';
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysRemaining = Math.ceil((lastDate - today) / msPerDay);

  if (daysRemaining <= 3) {
    return 'CLOSING SOON';
  }

  const [startY, startM, startD] = startDateStr.split('-').map(Number);
  const startDate = new Date(startY, startM - 1, startD).getTime();
  const daysSinceStart = Math.floor((today - startDate) / msPerDay);

  if (daysSinceStart >= 0 && daysSinceStart <= 7) {
    return 'NEW';
  }

  return 'APPLY NOW';
}

/**
 * Format date string (YYYY-MM-DD) into readable format (e.g., "15 Nov 2026")
 */
export function formatGovtDate(dateStr?: string): string {
  if (!dateStr) return 'TBA';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Return appropriate CSS styling for status badges
 */
export function getStatusBadgeStyle(status: JobStatus): { bg: string; text: string; border: string } {
  switch (status) {
    case 'NEW':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
      };
    case 'APPLY NOW':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
      };
    case 'CLOSING SOON':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-300',
      };
    case 'CLOSED':
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-500',
        border: 'border-slate-200',
      };
  }
}

