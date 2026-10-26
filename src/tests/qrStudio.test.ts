import { describe, it, expect, beforeEach } from 'vitest';
import {
  isValidDestinationUrl,
  normalizeDestinationUrl,
  generateShortCode,
  createDynamicLink,
  getDynamicLink,
  updateDynamicLink,
  deleteDynamicLink,
} from '../lib/dynamicQr';

describe('QR Studio — URL Validation & Sanitization', () => {
  it('accepts valid HTTP and HTTPS URLs', () => {
    expect(isValidDestinationUrl('https://zenvio.io')).toBe(true);
    expect(isValidDestinationUrl('http://example.com/path?query=1#hash')).toBe(true);
    expect(isValidDestinationUrl('subdomain.service.org/docs')).toBe(true);
  });

  it('rejects unsafe schemes and malicious strings', () => {
    expect(isValidDestinationUrl('javascript:alert(1)')).toBe(false);
    expect(isValidDestinationUrl('JAVASCRIPT:void(0)')).toBe(false);
    expect(isValidDestinationUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(isValidDestinationUrl('vbscript:msgbox(1)')).toBe(false);
    expect(isValidDestinationUrl('file:///etc/passwd')).toBe(false);
    expect(isValidDestinationUrl('')).toBe(false);
  });

  it('normalizes URLs by ensuring https:// prefix', () => {
    expect(normalizeDestinationUrl('example.com')).toBe('https://example.com');
    expect(normalizeDestinationUrl('https://example.com')).toBe('https://example.com');
    expect(normalizeDestinationUrl('http://insecure.site')).toBe('http://insecure.site');
  });

  it('generates well-formed short codes', () => {
    const code = generateShortCode();
    expect(code).toMatch(/^z-[a-z0-9]{6}$/);
  });
});

describe('QR Studio — Dynamic QR Lifecycle & Redirection', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates and retrieves a dynamic QR link in local testbed', async () => {
    const link = await createDynamicLink({
      destinationUrl: 'https://zenvio.io/welcome',
      title: 'Welcome Campaign',
    });

    expect(link.id).toBeDefined();
    expect(link.shortCode).toMatch(/^z-/);
    expect(link.destinationUrl).toBe('https://zenvio.io/welcome');
    expect(link.title).toBe('Welcome Campaign');
    expect(link.isActive).toBe(true);
    expect(link.scansCount).toBe(0);

    const retrieved = await getDynamicLink(link.shortCode);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.destinationUrl).toBe('https://zenvio.io/welcome');
  });

  it('updates target destination URL without changing short code', async () => {
    const link = await createDynamicLink({
      destinationUrl: 'https://v1.example.com',
      title: 'Initial Version',
    });

    const updated = await updateDynamicLink(link.shortCode, {
      destinationUrl: 'https://v2.example.com/updated',
      title: 'Updated Target',
    });

    expect(updated.shortCode).toBe(link.shortCode);
    expect(updated.destinationUrl).toBe('https://v2.example.com/updated');
    expect(updated.title).toBe('Updated Target');

    const retrieved = await getDynamicLink(link.shortCode);
    expect(retrieved?.destinationUrl).toBe('https://v2.example.com/updated');
  });

  it('allows pausing and resuming dynamic links', async () => {
    const link = await createDynamicLink({
      destinationUrl: 'https://example.com',
      title: 'Test Link',
    });

    await updateDynamicLink(link.shortCode, { isActive: false });
    const paused = await getDynamicLink(link.shortCode);
    expect(paused?.isActive).toBe(false);

    await updateDynamicLink(link.shortCode, { isActive: true });
    const resumed = await getDynamicLink(link.shortCode);
    expect(resumed?.isActive).toBe(true);
  });

  it('deletes dynamic QR links cleanly', async () => {
    const link = await createDynamicLink({
      destinationUrl: 'https://example.com/temp',
      title: 'Temporary',
    });

    await deleteDynamicLink(link.shortCode);
    const retrieved = await getDynamicLink(link.shortCode);
    expect(retrieved).toBeNull();
  });
});
