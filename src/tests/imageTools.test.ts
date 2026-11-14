import { describe, it, expect } from 'vitest';
import { TOOLS } from '../data/tools';
import { searchGlobal, searchTools } from '../utils/search';
import { getImageAIStatus, checkImageRateLimit } from '../server/imageHandler';

describe('AI Image Tools & Registry', () => {
  it('registers all 4 new AI image tools in ImageKit', () => {
    const requiredSlugs = [
      'background-remover',
      'image-enhancer',
      'image-cutout',
      'image-upscaler',
    ];

    for (const slug of requiredSlugs) {
      const tool = TOOLS.find((t) => t.slug === slug);
      expect(tool).toBeDefined();
      expect(tool?.category).toBe('imagekit');
      expect(tool?.status).toBe('live');
      expect(tool?.isNew).toBe(true);
    }
  });

  it('keeps existing core image tools intact without duplicates', () => {
    const existingSlugs = [
      'image-compressor',
      'image-cropper',
      'image-resizer',
      'image-format-converter',
    ];

    for (const slug of existingSlugs) {
      const toolMatches = TOOLS.filter((t) => t.slug === slug);
      expect(toolMatches.length).toBe(1);
    }
  });

  it('provides image AI provider abstraction and checks status', () => {
    const status = getImageAIStatus();
    expect(status).toHaveProperty('configured');
    expect(Array.isArray(status.providers)).toBe(true);
    expect(status.providers.some((p) => p.name === 'Remove.bg')).toBe(true);
    expect(status.providers.some((p) => p.name.includes('ClipDrop'))).toBe(true);
  });

  it('enforces rate limits on image processing requests', () => {
    const testIp = '192.168.1.99';
    // First 15 requests should be allowed
    for (let i = 0; i < 15; i++) {
      expect(checkImageRateLimit(testIp)).toBe(true);
    }
    // 16th request in the same window should be rejected
    expect(checkImageRateLimit(testIp)).toBe(false);
  });
});

describe('Global Search Integration', () => {
  it('searches across both tools and government jobs', () => {
    // Search for tools
    const toolResults = searchGlobal('compress');
    expect(toolResults.length).toBeGreaterThan(0);
    expect(toolResults.some((r) => r.type === 'tool')).toBe(true);

    // Search for government jobs
    const jobResults = searchGlobal('upsc');
    expect(jobResults.length).toBeGreaterThan(0);
    expect(jobResults.some((r) => r.type === 'govt-job' || r.type === 'job-category')).toBe(true);

    // Search for tool categories
    const catResults = searchGlobal('image tools');
    expect(catResults.length).toBeGreaterThan(0);
  });

  it('preserves backwards compatibility of existing searchTools function', () => {
    const results = searchTools('qr');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].tool.slug).toBeDefined();
  });
});

