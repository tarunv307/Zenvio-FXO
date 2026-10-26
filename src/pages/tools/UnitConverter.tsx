import React, { useState } from 'react';
import { ArrowRightLeft, Scale } from 'lucide-react';
import { Button, Input, Select } from '../../components/ui/FormElements';

type CategoryType = 'length' | 'weight' | 'temp' | 'digital' | 'speed';

const CATEGORIES: Record<CategoryType, { label: string; units: Record<string, number | ((v: number, toBase: boolean) => number)> }> = {
  length: {
    label: 'Length & Distance',
    units: {
      Meters: 1,
      Kilometers: 1000,
      Centimeters: 0.01,
      Millimeters: 0.001,
      Miles: 1609.344,
      Yards: 0.9144,
      Feet: 0.3048,
      Inches: 0.0254,
    },
  },
  weight: {
    label: 'Mass & Weight',
    units: {
      Kilograms: 1,
      Grams: 0.001,
      Milligrams: 0.000001,
      Pounds: 0.45359237,
      Ounces: 0.0283495,
      MetricTons: 1000,
    },
  },
  digital: {
    label: 'Digital Data',
    units: {
      Bytes: 1,
      Kilobytes: 1024,
      Megabytes: 1024 * 1024,
      Gigabytes: 1024 * 1024 * 1024,
      Terabytes: 1024 * 1024 * 1024 * 1024,
    },
  },
  speed: {
    label: 'Speed & Velocity',
    units: {
      'm/s (Meters per sec)': 1,
      'km/h (Kilometers per hr)': 0.277778,
      'mph (Miles per hr)': 0.44704,
      'Knots': 0.514444,
    },
  },
  temp: {
    label: 'Temperature',
    units: {
      Celsius: 1,
      Fahrenheit: 1,
      Kelvin: 1,
    },
  },
};

export function UnitConverter() {
  const [category, setCategory] = useState<CategoryType>('length');
  const [fromUnit, setFromUnit] = useState<string>('Kilometers');
  const [toUnit, setToUnit] = useState<string>('Miles');
  const [inputValue, setInputValue] = useState<number>(10);

  const units = Object.keys(CATEGORIES[category].units);

  const handleCategoryChange = (cat: CategoryType) => {
    setCategory(cat);
    const u = Object.keys(CATEGORIES[cat].units);
    setFromUnit(u[0]);
    setToUnit(u[1] || u[0]);
  };

  const calculateResult = (): string => {
    if (isNaN(inputValue)) return '0';

    if (category === 'temp') {
      let c = inputValue;
      if (fromUnit === 'Fahrenheit') c = ((inputValue - 32) * 5) / 9;
      if (fromUnit === 'Kelvin') c = inputValue - 273.15;

      let res = c;
      if (toUnit === 'Fahrenheit') res = (c * 9) / 5 + 32;
      if (toUnit === 'Kelvin') res = c + 273.15;
      return res.toFixed(3);
    }

    const fromFactor = CATEGORIES[category].units[fromUnit] as number;
    const toFactor = CATEGORIES[category].units[toUnit] as number;

    const baseVal = inputValue * fromFactor;
    const result = baseVal / toFactor;
    return result < 0.0001 ? result.toExponential(4) : result.toFixed(4);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex flex-wrap gap-2 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        {(Object.keys(CATEGORIES) as CategoryType[]).map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              category === cat
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {CATEGORIES[cat].label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
              From Unit
            </label>
            <Select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              options={units.map((u) => ({ value: u, label: u }))}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
              To Unit
            </label>
            <Select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              options={units.map((u) => ({ value: u, label: u }))}
            />
          </div>
        </div>

        <div>
          <Input
            label="Value to Convert"
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(Number(e.target.value))}
          />
        </div>

        <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400 block">
              Converted Result
            </span>
            <span className="text-3xl font-black text-emerald-800 dark:text-emerald-200">
              {calculateResult()} {toUnit}
            </span>
          </div>

          <button
            onClick={() => {
              const temp = fromUnit;
              setFromUnit(toUnit);
              setToUnit(temp);
            }}
            className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 hover:scale-105 transition-all shadow-sm"
            title="Swap Units"
          >
            <ArrowRightLeft className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
