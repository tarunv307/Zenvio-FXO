import { describe, it, expect } from 'vitest';
import {
  GOVT_JOBS,
  JOB_CATEGORIES,
  getJobBySlug,
  getJobsByCategory,
  getLatestJobs,
  searchGovtJobs,
  computeJobStatus,
  formatGovtDate,
} from '../data/jobs';

describe('Government Jobs Data System', () => {
  it('contains valid curated government jobs with required authoritative fields', () => {
    expect(GOVT_JOBS.length).toBeGreaterThan(0);

    for (const job of GOVT_JOBS) {
      expect(job.id).toBeTruthy();
      expect(job.slug).toBeTruthy();
      expect(job.title).toBeTruthy();
      expect(job.organization).toBeTruthy();
      expect(job.shortOrg).toBeTruthy();
      expect(job.department).toBeTruthy();
      expect(job.category).toBeTruthy();
      expect(job.qualification).toBeTruthy();
      expect(job.vacancies).toBeDefined();
      expect(job.location).toBeTruthy();
      expect(job.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(job.lastDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(job.officialNotificationUrl).toMatch(/^https?:\/\//);
      expect(job.sourceUrl).toMatch(/^https?:\/\//);
      expect(job.lastVerifiedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(job.overview).toBeTruthy();
      expect(job.officialSummary).toBeTruthy();
      expect(job.eligibilityCriteria.education.length).toBeGreaterThan(0);
      expect(job.eligibilityCriteria.ageLimit.description).toBeTruthy();
    }
  });

  it('contains all required job categories', () => {
    const requiredCategories = [
      'central-government',
      'tamil-nadu',
      'railway',
      'ssc',
      'upsc',
      'banking',
      'defence',
      'admit-cards',
      'results',
    ];

    for (const cat of requiredCategories) {
      const found = JOB_CATEGORIES.find((c) => c.id === cat);
      expect(found).toBeDefined();
      expect(found?.path).toBe(`/jobs/${cat}`);
    }
  });

  it('correctly retrieves job by slug', () => {
    const job = getJobBySlug('upsc-civil-services-examination-2026');
    expect(job).toBeDefined();
    expect(job?.shortOrg).toBe('UPSC');
    expect(job?.title).toContain('Civil Services');
  });

  it('filters jobs by category', () => {
    const tnJobs = getJobsByCategory('tamil-nadu');
    expect(tnJobs.length).toBeGreaterThan(0);
    expect(tnJobs.every((j) => j.category === 'tamil-nadu')).toBe(true);

    const railwayJobs = getJobsByCategory('railway');
    expect(railwayJobs.length).toBeGreaterThan(0);
    expect(railwayJobs.every((j) => j.category === 'railway')).toBe(true);
  });

  it('computes status based on application deadlines', () => {
    // Expired job -> CLOSED
    const closedStatus = computeJobStatus('2020-01-01', '2020-02-01');
    expect(closedStatus).toBe('CLOSED');

    // Future job with deadline > 7 days away
    const openStatus = computeJobStatus('2026-01-01', '2030-12-31');
    expect(openStatus).toBe('APPLY NOW');
  });

  it('formats dates into human-readable strings', () => {
    expect(formatGovtDate('2026-11-30')).toContain('Nov');
    expect(formatGovtDate('2026-11-30')).toContain('2026');
    expect(formatGovtDate(undefined)).toBe('TBA');
  });

  it('searches jobs by acronym and keyword accurately', () => {
    const upscResults = searchGovtJobs('UPSC');
    expect(upscResults.length).toBeGreaterThan(0);
    expect(upscResults[0].job.shortOrg).toBe('UPSC');

    const tnpscResults = searchGovtJobs('Tamil Nadu');
    expect(tnpscResults.length).toBeGreaterThan(0);
  });
});

