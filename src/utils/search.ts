import type { Tool, SearchResult } from '../types';
import { TOOLS, CATEGORIES } from '../data/tools';
import { GOVT_JOBS, JOB_CATEGORIES } from '../data/jobs';

/**
 * Simple client-side full-text search for tools.
 * Searches name, description, and tags with weighted scoring.
 * Preserved for backwards compatibility with existing tool listings.
 */
export function searchTools(query: string, tools: Tool[] = TOOLS): SearchResult[] {
  if (!query.trim()) return [];

  const q = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  for (const tool of tools) {
    let score = 0;

    // Exact name match → highest score
    if (tool.name.toLowerCase() === q) {
      score += 100;
    } else if (tool.name.toLowerCase().startsWith(q)) {
      score += 80;
    } else if (tool.name.toLowerCase().includes(q)) {
      score += 60;
    }

    // Description match
    if (tool.description.toLowerCase().includes(q)) {
      score += 30;
    }

    // Tag match
    for (const tag of tool.tags) {
      if (tag.toLowerCase() === q) {
        score += 50;
      } else if (tag.toLowerCase().includes(q)) {
        score += 25;
      }
    }

    // Category match (search by category name)
    if (tool.category.toLowerCase().includes(q)) {
      score += 20;
    }

    if (score > 0) {
      results.push({ tool, score });
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
}

/** Filter tools by category */
export function filterByCategory(tools: Tool[], categoryId: string): Tool[] {
  if (!categoryId) return tools;
  return tools.filter((t) => t.category === categoryId);
}

/** Filter tools by status */
export function filterByStatus(tools: Tool[], status: string): Tool[] {
  if (!status) return tools;
  return tools.filter((t) => t.status === status);
}

/** Sort tools alphabetically */
export function sortAlphabetically(tools: Tool[]): Tool[] {
  return [...tools].sort((a, b) => a.name.localeCompare(b.name));
}

// ─────────────────────────────────────────────────────────────────────────────
// Unified Global Search across Tools, Tool Categories, Govt Jobs & Job Categories
// ─────────────────────────────────────────────────────────────────────────────

export type GlobalItemType = 'tool' | 'tool-category' | 'govt-job' | 'job-category';

export interface GlobalSearchResultItem {
  id: string;
  type: GlobalItemType;
  title: string;
  description: string;
  badge: string;
  path: string;
  score: number;
}

export function searchGlobal(query: string): GlobalSearchResultItem[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  const results: GlobalSearchResultItem[] = [];

  // 1. Search Existing Tools
  for (const tool of TOOLS) {
    let score = 0;
    const nameLower = tool.name.toLowerCase();
    const descLower = tool.description.toLowerCase();

    if (nameLower === q) score += 120;
    else if (nameLower.startsWith(q)) score += 85;
    else if (nameLower.includes(q)) score += 65;

    if (descLower.includes(q)) score += 25;

    for (const tag of tool.tags) {
      const tagLower = tag.toLowerCase();
      if (tagLower === q) score += 60;
      else if (tagLower.includes(q)) score += 30;
    }

    if (tool.category.toLowerCase().includes(q)) score += 20;

    if (score > 0) {
      results.push({
        id: `tool-${tool.id}`,
        type: 'tool',
        title: tool.name,
        description: tool.description,
        badge: tool.category.replace('kit', ' Kit'),
        path: `/tools/${tool.slug}`,
        score,
      });
    }
  }

  // 2. Search Tool Categories
  for (const cat of CATEGORIES) {
    let score = 0;
    const nameLower = cat.name.toLowerCase();
    const labelLower = cat.label.toLowerCase();
    const descLower = cat.description.toLowerCase();

    if (nameLower === q || labelLower === q) score += 110;
    else if (nameLower.startsWith(q) || labelLower.startsWith(q)) score += 75;
    else if (nameLower.includes(q) || labelLower.includes(q)) score += 55;

    if (descLower.includes(q)) score += 20;

    if (score > 0) {
      results.push({
        id: `cat-${cat.id}`,
        type: 'tool-category',
        title: `${cat.name} (${cat.label})`,
        description: cat.description,
        badge: 'Tool Category',
        path: `/category/${cat.id}`,
        score,
      });
    }
  }

  // 3. Search Government Jobs
  for (const job of GOVT_JOBS) {
    let score = 0;
    const titleLower = job.title.toLowerCase();
    const orgLower = job.organization.toLowerCase();
    const shortOrgLower = job.shortOrg.toLowerCase();
    const deptLower = job.department.toLowerCase();
    const qualLower = job.qualification.toLowerCase();

    if (titleLower === q) score += 125;
    else if (titleLower.startsWith(q)) score += 85;
    else if (titleLower.includes(q)) score += 65;

    if (shortOrgLower === q) score += 100;
    else if (shortOrgLower.includes(q) || orgLower.includes(q)) score += 60;

    if (deptLower.includes(q)) score += 30;
    if (qualLower.includes(q)) score += 30;
    if (job.category.toLowerCase().includes(q)) score += 25;

    if (score > 0) {
      results.push({
        id: `job-${job.id}`,
        type: 'govt-job',
        title: job.title,
        description: `${job.organization} • ${job.qualification} • ${job.vacancies} Vacancies`,
        badge: job.isAdmitCard ? 'Admit Card' : job.isResult ? 'Result' : job.shortOrg,
        path: `/jobs/${job.slug}`,
        score,
      });
    }
  }

  // 4. Search Job Categories
  for (const jobCat of JOB_CATEGORIES) {
    let score = 0;
    const titleLower = jobCat.title.toLowerCase();
    const shortLower = jobCat.shortTitle.toLowerCase();
    const descLower = jobCat.description.toLowerCase();

    if (titleLower === q || shortLower === q) score += 110;
    else if (titleLower.startsWith(q) || shortLower.startsWith(q)) score += 75;
    else if (titleLower.includes(q) || shortLower.includes(q)) score += 55;

    if (descLower.includes(q)) score += 20;

    if (score > 0) {
      results.push({
        id: `job-cat-${jobCat.id}`,
        type: 'job-category',
        title: jobCat.title,
        description: jobCat.description,
        badge: 'Job Category',
        path: jobCat.path,
        score,
      });
    }
  }

  // Sort by score descending and return top matches
  return results.sort((a, b) => b.score - a.score);
}
