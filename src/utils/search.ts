import type { Tool, SearchResult } from '../types';
import { TOOLS } from '../data/tools';

/**
 * Simple client-side full-text search for tools.
 * Searches name, description, and tags with weighted scoring.
 * No external API required.
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
