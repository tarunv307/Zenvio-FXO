import React, { useState } from 'react';
import { Monitor, Smartphone, Lock, Unlock } from 'lucide-react';
import { Input, Button } from '../../components/ui/FormElements';

const PRESET_RATIOS = [
  { label: '16:9 (HD / YouTube)', w: 16, h: 9 },
  { label: '4:3 (Standard Video)', w: 4, h: 3 },
  { label: '1:1 (Square / Instagram)', w: 1, h: 1 },
  { label: '9:16 (Story / TikTok)', w: 9, h: 16 },
  { label: '21:9 (Ultrawide Cinema)', w: 21, h: 9 },
  { label: '3:2 (Classic 35mm Photo)', w: 3, h: 2 },
];

export function AspectRatioCalculator() {
  const [ratioW, setRatioW] = useState<number>(16);
  const [ratioH, setRatioH] = useState<number>(9);
  const [width, setWidth] = useState<number>(1920);
  const [height, setHeight] = useState<number>(1080);
  const [locked, setLocked] = useState<boolean>(true);

  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

  const handleWidthChange = (newW: number) => {
    setWidth(newW);
    if (locked && ratioW > 0) {
      setHeight(Math.round((newW * ratioH) / ratioW));
    } else {
      updateDerivedRatio(newW, height);
    }
  };

  const handleHeightChange = (newH: number) => {
    setHeight(newH);
    if (locked && ratioH > 0) {
      setWidth(Math.round((newH * ratioW) / ratioH));
    } else {
      updateDerivedRatio(width, newH);
    }
  };

  const updateDerivedRatio = (w: number, h: number) => {
    if (w > 0 && h > 0) {
      const d = gcd(w, h);
      setRatioW(w / d);
      setRatioH(h / d);
    }
  };

  const applyPreset = (rw: number, rh: number) => {
    setRatioW(rw);
    setRatioH(rh);
    setHeight(Math.round((width * rh) / rw));
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex flex-wrap gap-2 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        {PRESET_RATIOS.map((p) => (
          <button
            key={p.label}
            onClick={() => applyPreset(p.w, p.h)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              ratioW === p.w && ratioH === p.h
                ? 'bg-pink-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Width (Pixels)"
              type="number"
              value={width}
              onChange={(e) => handleWidthChange(Number(e.target.value))}
            />
          </div>
          <div>
            <Input
              label="Height (Pixels)"
              type="number"
              value={height}
              onChange={(e) => handleHeightChange(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Ratio badge */}
        <div className="flex items-center justify-between p-4 bg-pink-50 dark:bg-pink-950/40 rounded-xl border border-pink-200 dark:border-pink-800">
          <div>
            <span className="text-xs uppercase font-semibold text-pink-600 dark:text-pink-400 block">
              Aspect Ratio
            </span>
            <span className="text-2xl font-black text-pink-800 dark:text-pink-200">
              {ratioW}:{ratioH}
            </span>
          </div>

          <button
            onClick={() => setLocked(!locked)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
              locked
                ? 'bg-white dark:bg-slate-800 text-pink-600 border-pink-300 dark:border-pink-700'
                : 'text-slate-500 border-slate-300'
            }`}
          >
            {locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            {locked ? 'Ratio Locked' : 'Unlocked'}
          </button>
        </div>

        {/* Visual Box Preview */}
        <div className="w-full h-56 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center p-4">
          <div
            className="bg-pink-500/20 border-2 border-pink-500 rounded-xl flex items-center justify-center text-xs font-mono font-bold text-pink-700 dark:text-pink-300 shadow transition-all duration-200"
            style={{
              aspectRatio: `${ratioW} / ${ratioH}`,
              maxHeight: '180px',
              maxWidth: '100%',
              height: '100%',
            }}
          >
            {width} × {height}
          </div>
        </div>
      </div>
    </div>
  );
}
