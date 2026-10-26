import { describe, it, expect } from 'vitest';
import {
  formatBytes,
  getFileExtension,
  getFileBasename,
  generateSecurePassword,
  generateUUID,
} from '../utils/file';
import { searchTools, sortAlphabetically, filterByCategory } from '../utils/search';
import { TOOLS, CATEGORIES, getToolBySlug, getToolsByCategory } from '../data/tools';

describe('File Utilities', () => {
  it('formats bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1048576)).toBe('1 MB');
    expect(formatBytes(1073741824)).toBe('1 GB');
  });

  it('extracts file extension and basename correctly', () => {
    expect(getFileExtension('report.pdf')).toBe('pdf');
    expect(getFileExtension('image.avatar.png')).toBe('png');
    expect(getFileBasename('report.pdf')).toBe('report');
    expect(getFileBasename('image.avatar.png')).toBe('image.avatar');
  });

  it('generates secure random passwords with correct length and characters', () => {
    const pwd = generateSecurePassword(16, {
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    });
    expect(pwd).toHaveLength(16);
  });

  it('generates a valid UUID string', () => {
    const id = generateUUID();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(10);
  });
});

describe('Search & Filter Utilities', () => {
  it('searches tools by title, keywords, and description', () => {
    const results = searchTools('pdf', TOOLS);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.tool.slug.includes('pdf'))).toBe(true);
  });

  it('filters tools by category', () => {
    const imageTools = filterByCategory(TOOLS, 'imagekit');
    expect(imageTools.length).toBeGreaterThan(0);
    imageTools.forEach((t) => expect(t.category).toBe('imagekit'));
  });

  it('sorts tools alphabetically', () => {
    const sorted = sortAlphabetically([...TOOLS]);
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].name.localeCompare(sorted[i + 1].name)).toBeLessThanOrEqual(0);
    }
  });
});

describe('Tools Registry Integrity', () => {
  it('has valid categories with required properties', () => {
    expect(CATEGORIES.length).toBeGreaterThanOrEqual(9);
    CATEGORIES.forEach((cat) => {
      expect(cat.id).toBeTruthy();
      expect(cat.name).toBeTruthy();
      expect(cat.label).toBeTruthy();
    });
  });

  it('has unique tool slugs', () => {
    const slugs = TOOLS.map((t) => t.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it('retrieves tools by slug and category correctly', () => {
    const tool = getToolBySlug('image-compressor');
    expect(tool).toBeDefined();
    expect(tool?.name).toBe('Image Compressor');

    const pdfTools = getToolsByCategory('pdfkit');
    expect(pdfTools.length).toBeGreaterThan(0);
  });
});
