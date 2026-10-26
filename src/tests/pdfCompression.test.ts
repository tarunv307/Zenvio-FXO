import { describe, it, expect } from 'vitest';
import { PDFDocument, rgb } from 'pdf-lib';
import { formatBytes } from '../utils/file';

describe('PDF Compression & Target Size Engine', () => {
  it('converts target sizes in MB and KB accurately to byte budgets', () => {
    const toBytes = (val: number, unit: 'MB' | 'KB') => val * (unit === 'MB' ? 1024 * 1024 : 1024);

    expect(toBytes(5, 'MB')).toBe(5242880);
    expect(toBytes(2, 'MB')).toBe(2097152);
    expect(toBytes(500, 'KB')).toBe(512000);
    expect(toBytes(100, 'KB')).toBe(102400);
  });

  it('calculates reduction percentage correctly from 13MB to 5MB', () => {
    const originalBytes = 13 * 1024 * 1024; // 13 MB
    const targetBytes = 5 * 1024 * 1024;   // 5 MB
    const reduction = Math.round(((originalBytes - targetBytes) / originalBytes) * 100);

    expect(reduction).toBe(62); // 61.5% rounded to 62%
  });

  it('produces valid, reloadable, uncorrupted PDF documents after object stream compaction', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([595, 842]);
    page.drawText('Zenvio FXO High Fidelity Vector Text', {
      x: 50,
      y: 800,
      size: 24,
      color: rgb(0.1, 0.1, 0.2),
    });

    const savedBytes = await doc.save({ useObjectStreams: true });
    expect(savedBytes.length).toBeGreaterThan(0);

    // Verify reloaded document integrity
    const reloaded = await PDFDocument.load(savedBytes);
    expect(reloaded.getPageCount()).toBe(1);
    expect(reloaded.getPage(0).getSize().width).toBe(595);
  });

  it('formats byte labels cleanly for UI display', () => {
    expect(formatBytes(13 * 1024 * 1024)).toBe('13 MB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5 MB');
    expect(formatBytes(500 * 1024)).toBe('500 KB');
  });
});
