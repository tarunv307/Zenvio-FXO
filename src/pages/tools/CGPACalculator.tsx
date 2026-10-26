import React, { useState } from 'react';
import { Plus, Trash2, Award } from 'lucide-react';
import { Button } from '../../components/ui/FormElements';

interface Semester {
  id: string;
  name: string;
  gpa: number;
  credits: number;
}

export function CGPACalculator() {
  const [scale, setScale] = useState<10 | 4>(10);
  const [semesters, setSemesters] = useState<Semester[]>([
    { id: '1', name: 'Semester 1', gpa: 8.8, credits: 24 },
    { id: '2', name: 'Semester 2', gpa: 9.1, credits: 24 },
    { id: '3', name: 'Semester 3', gpa: 8.9, credits: 26 },
    { id: '4', name: 'Semester 4', gpa: 9.3, credits: 26 },
  ]);

  const addSemester = () => {
    setSemesters([
      ...semesters,
      {
        id: Math.random().toString(36).substring(7),
        name: `Semester ${semesters.length + 1}`,
        gpa: scale === 10 ? 8.5 : 3.5,
        credits: 24,
      },
    ]);
  };

  const removeSemester = (id: string) => {
    if (semesters.length <= 1) return;
    setSemesters(semesters.filter((s) => s.id !== id));
  };

  const updateSemester = (id: string, field: keyof Semester, value: any) => {
    setSemesters(semesters.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const totalCredits = semesters.reduce((sum, s) => sum + (Number(s.credits) || 0), 0);
  const totalScore = semesters.reduce((sum, s) => sum + (Number(s.gpa) || 0) * (Number(s.credits) || 0), 0);
  const cgpa = totalCredits > 0 ? (totalScore / totalCredits).toFixed(2) : '0.00';
  const percentage = scale === 10 ? (Number(cgpa) * 9.5).toFixed(1) : ((Number(cgpa) / 4) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-500" /> Cumulative Grade Point Average (CGPA)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Calculate your multi-semester CGPA and equivalent percentage
          </p>
          <div className="flex gap-2 mt-3">
            <Button
              variant={scale === 10 ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setScale(10)}
            >
              10.0 Scale
            </Button>
            <Button
              variant={scale === 4 ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setScale(4)}
            >
              4.0 Scale
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-emerald-50 dark:bg-emerald-950/40 px-6 py-4 rounded-2xl border border-emerald-200 dark:border-emerald-800">
          <div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block uppercase">
              CGPA ({scale}.0)
            </span>
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{cgpa}</span>
          </div>
          <div className="h-10 w-px bg-emerald-200 dark:bg-emerald-800" />
          <div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block uppercase">
              Percentage
            </span>
            <span className="text-xl font-bold text-emerald-900 dark:text-emerald-100">{percentage}%</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Semester List ({semesters.length})
          </span>
          <Button variant="outline" size="sm" onClick={addSemester}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Semester
          </Button>
        </div>

        <div className="space-y-2">
          {semesters.map((s) => (
            <div
              key={s.id}
              className="grid grid-cols-12 gap-3 items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700"
            >
              <div className="col-span-6">
                <input
                  type="text"
                  value={s.name}
                  onChange={(e) => updateSemester(s.id, 'name', e.target.value)}
                  className="w-full bg-transparent text-sm font-medium focus:outline-none text-slate-800 dark:text-slate-100"
                />
              </div>
              <div className="col-span-3">
                <label className="text-[10px] text-slate-400 block uppercase">GPA / SGPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={scale}
                  value={s.gpa}
                  onChange={(e) => updateSemester(s.id, 'gpa', Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-800 px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-center"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-slate-400 block uppercase">Credits</label>
                <input
                  type="number"
                  min="1"
                  value={s.credits}
                  onChange={(e) => updateSemester(s.id, 'credits', Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-800 px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-center"
                />
              </div>
              <div className="col-span-1 text-right pt-3">
                <button
                  onClick={() => removeSemester(s.id)}
                  className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
