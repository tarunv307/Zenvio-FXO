import React, { useState } from 'react';
import { Calculator, Delete, RotateCcw } from 'lucide-react';
import { Button } from '../../components/ui/FormElements';

export function ScientificCalculator() {
  const [display, setDisplay] = useState<string>('0');
  const [memory, setMemory] = useState<number>(0);
  const [history, setHistory] = useState<string>('');

  const append = (val: string) => {
    setDisplay((prev) => (prev === '0' || prev === 'Error' ? val : prev + val));
  };

  const clear = () => {
    setDisplay('0');
    setHistory('');
  };

  const backspace = () => {
    setDisplay((prev) => (prev.length <= 1 ? '0' : prev.slice(0, -1)));
  };

  const calculate = () => {
    try {
      setHistory(display + ' =');
      // Sanitize input
      let expr = display
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(');

      // Safe evaluation of mathematical expression
      // eslint-disable-next-line no-eval
      const result = Function(`"use strict"; return (${expr})`)();
      setDisplay(String(result));
    } catch {
      setDisplay('Error');
    }
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl space-y-4">
        {/* Display */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 text-right">
          <div className="text-xs font-mono text-slate-400 h-5 truncate">{history}</div>
          <div className="text-3xl sm:text-4xl font-mono font-bold text-slate-800 dark:text-slate-100 truncate">
            {display}
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-5 gap-2">
          {/* Row 1 Scientific */}
          {['sin(', 'cos(', 'tan(', 'sqrt(', 'log('].map((btn) => (
            <button
              key={btn}
              onClick={() => append(btn)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/60 font-mono text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            >
              {btn}
            </button>
          ))}

          {/* Row 2 Scientific */}
          {['(', ')', 'π', 'e', '^'].map((btn) => (
            <button
              key={btn}
              onClick={() => (btn === '^' ? append('**') : append(btn))}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/60 font-mono text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            >
              {btn}
            </button>
          ))}

          {/* Keypad standard */}
          {['7', '8', '9', '÷', 'C'].map((btn) => (
            <button
              key={btn}
              onClick={() => (btn === 'C' ? clear() : append(btn))}
              className={`p-3 rounded-xl font-mono font-bold text-base transition-colors ${
                btn === 'C'
                  ? 'bg-red-500/10 text-red-600 hover:bg-red-500/20'
                  : btn === '÷'
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-100'
              }`}
            >
              {btn}
            </button>
          ))}

          {['4', '5', '6', '×', '⌫'].map((btn) => (
            <button
              key={btn}
              onClick={() => (btn === '⌫' ? backspace() : append(btn))}
              className={`p-3 rounded-xl font-mono font-bold text-base transition-colors ${
                btn === '⌫'
                  ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
                  : btn === '×'
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-100'
              }`}
            >
              {btn}
            </button>
          ))}

          {['1', '2', '3', '-', '+'].map((btn) => (
            <button
              key={btn}
              onClick={() => append(btn)}
              className={`p-3 rounded-xl font-mono font-bold text-base transition-colors ${
                btn === '-' || btn === '+'
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-100'
              }`}
            >
              {btn}
            </button>
          ))}

          {['0', '00', '.', '%', '='].map((btn) => (
            <button
              key={btn}
              onClick={() => (btn === '=' ? calculate() : append(btn))}
              className={`p-3 rounded-xl font-mono font-bold text-base transition-colors ${
                btn === '='
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow col-span-1'
                  : 'bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-100'
              }`}
            >
              {btn}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
