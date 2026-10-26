import React, { useState } from 'react';
import { Palette, Copy, Check } from 'lucide-react';
import { Input } from '../../components/ui/FormElements';
import { copyToClipboard } from '../../utils/file';

export function ColorConverter() {
  const [hex, setHex] = useState<string>('#3B82F6');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Conversions
  const hexToRgb = (h: string) => {
    let clean = h.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map((c) => c + c).join('');
    }
    const num = parseInt(clean, 16);
    if (isNaN(num) || clean.length !== 6) return { r: 59, g: 130, b: 246 };
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  const { r, g, b } = hexToRgb(hex);

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const rgbToCmyk = (r: number, g: number, b: number) => {
    const c = 1 - r / 255;
    const m = 1 - g / 255;
    const y = 1 - b / 255;
    const k = Math.min(c, m, y);
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
    return {
      c: Math.round(((c - k) / (1 - k)) * 100),
      m: Math.round(((m - k) / (1 - k)) * 100),
      y: Math.round(((y - k) / (1 - k)) * 100),
      k: Math.round(k * 100),
    };
  };

  const hsl = rgbToHsl(r, g, b);
  const cmyk = rgbToCmyk(r, g, b);

  const values = [
    { label: 'HEX', val: hex.toUpperCase() },
    { label: 'RGB', val: `rgb(${r}, ${g}, ${b})` },
    { label: 'RGBA', val: `rgba(${r}, ${g}, ${b}, 1)` },
    { label: 'HSL', val: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: 'CMYK', val: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` },
  ];

  const copyVal = async (k: string, v: string) => {
    await copyToClipboard(v);
    setCopiedKey(k);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div
            className="w-28 h-28 rounded-2xl shadow-inner border border-slate-200 dark:border-slate-700 shrink-0"
            style={{ backgroundColor: hex }}
          />

          <div className="flex-1 w-full space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
              Choose or Type Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={hex}
                onChange={(e) => setHex(e.target.value)}
                className="w-12 h-12 rounded-xl cursor-pointer border border-slate-300 dark:border-slate-600 p-0.5"
              />
              <div className="flex-1">
                <Input value={hex} onChange={(e) => setHex(e.target.value)} placeholder="#3B82F6" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
          {values.map((item) => (
            <div
              key={item.label}
              className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs"
            >
              <span className="w-16 font-bold text-slate-500">{item.label}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">{item.val}</span>
              <button
                onClick={() => copyVal(item.label, item.val)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-500 transition-colors"
              >
                {copiedKey === item.label ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
