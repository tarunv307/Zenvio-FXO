import React, { useState } from 'react';
import { Percent, ArrowRight } from 'lucide-react';
import { Input } from '../../components/ui/FormElements';

export function PercentageCalculator() {
  // Mode 1: What is X% of Y?
  const [m1X, setM1X] = useState<number>(15);
  const [m1Y, setM1Y] = useState<number>(200);

  // Mode 2: X is what percent of Y?
  const [m2X, setM2X] = useState<number>(45);
  const [m2Y, setM2Y] = useState<number>(180);

  // Mode 3: % change from X to Y
  const [m3X, setM3X] = useState<number>(80);
  const [m3Y, setM3Y] = useState<number>(100);

  const res1 = ((m1X * m1Y) / 100).toFixed(2);
  const res2 = m2Y !== 0 ? ((m2X / m2Y) * 100).toFixed(2) : '0';
  const res3 = m3X !== 0 ? (((m3Y - m3X) / m3X) * 100).toFixed(2) : '0';

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2">
          <Percent className="w-5 h-5 text-emerald-500" /> Multi-Purpose Percentage Calculator
        </h3>
        <p className="text-xs text-slate-500">
          Compute percentages, ratios, discounts, and percentage increases / decreases instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-4">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            What is <span className="text-emerald-600">X%</span> of <span className="text-emerald-600">Y</span>?
          </h4>
          <div className="space-y-3">
            <Input
              label="Percentage (X%)"
              type="number"
              value={m1X}
              onChange={(e) => setM1X(Number(e.target.value))}
            />
            <Input
              label="Value (Y)"
              type="number"
              value={m1Y}
              onChange={(e) => setM1Y(Number(e.target.value))}
            />
          </div>
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
            <span className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400 block">
              Result
            </span>
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{res1}</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-4">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            <span className="text-emerald-600">X</span> is what % of <span className="text-emerald-600">Y</span>?
          </h4>
          <div className="space-y-3">
            <Input
              label="Numerator (X)"
              type="number"
              value={m2X}
              onChange={(e) => setM2X(Number(e.target.value))}
            />
            <Input
              label="Denominator (Y)"
              type="number"
              value={m2Y}
              onChange={(e) => setM2Y(Number(e.target.value))}
            />
          </div>
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
            <span className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400 block">
              Result
            </span>
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{res2}%</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-4">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Percentage Change from <span className="text-emerald-600">X</span> to <span className="text-emerald-600">Y</span>
          </h4>
          <div className="space-y-3">
            <Input
              label="Initial Value (X)"
              type="number"
              value={m3X}
              onChange={(e) => setM3X(Number(e.target.value))}
            />
            <Input
              label="Final Value (Y)"
              type="number"
              value={m3Y}
              onChange={(e) => setM3Y(Number(e.target.value))}
            />
          </div>
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
            <span className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400 block">
              {Number(res3) >= 0 ? 'Increase' : 'Decrease'}
            </span>
            <span className={`text-2xl font-black ${Number(res3) >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-600'}`}>
              {Number(res3) >= 0 ? `+${res3}%` : `${res3}%`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
