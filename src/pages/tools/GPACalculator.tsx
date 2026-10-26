import React, { useState } from 'react';
import { Plus, Trash2, GraduationCap, Award } from 'lucide-react';
import { Button, Input, Select } from '../../components/ui/FormElements';

interface Course {
  id: string;
  name: string;
  credits: number;
  grade: string;
}

const GRADE_POINTS: Record<string, number> = {
  'A+': 4.0,
  A: 4.0,
  'A-': 3.7,
  'B+': 3.3,
  B: 3.0,
  'B-': 2.7,
  'C+': 2.3,
  C: 2.0,
  'C-': 1.7,
  'D+': 1.3,
  D: 1.0,
  F: 0.0,
};

export function GPACalculator() {
  const [courses, setCourses] = useState<Course[]>([
    { id: '1', name: 'Computer Science 101', credits: 4, grade: 'A' },
    { id: '2', name: 'Calculus II', credits: 4, grade: 'A-' },
    { id: '3', name: 'Linear Algebra', credits: 3, grade: 'B+' },
    { id: '4', name: 'Physics Mechanics', credits: 4, grade: 'A' },
  ]);

  const addCourse = () => {
    setCourses([
      ...courses,
      {
        id: Math.random().toString(36).substring(7),
        name: `Course ${courses.length + 1}`,
        credits: 3,
        grade: 'A',
      },
    ]);
  };

  const removeCourse = (id: string) => {
    if (courses.length <= 1) return;
    setCourses(courses.filter((c) => c.id !== id));
  };

  const updateCourse = (id: string, field: keyof Course, value: any) => {
    setCourses(courses.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const totalCredits = courses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0);
  const totalPoints = courses.reduce((sum, c) => sum + (GRADE_POINTS[c.grade] ?? 0) * (Number(c.credits) || 0), 0);
  const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-500" /> College & High School GPA Calculator
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Standard 4.0 weighted scale based on credit hours and letter grades
          </p>
        </div>

        <div className="flex items-center gap-6 bg-emerald-50 dark:bg-emerald-950/40 px-6 py-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800">
          <div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block uppercase">
              Total Credits
            </span>
            <span className="text-xl font-bold text-emerald-900 dark:text-emerald-100">{totalCredits}</span>
          </div>
          <div className="h-10 w-px bg-emerald-200 dark:bg-emerald-800" />
          <div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block uppercase">
              Cumulative GPA
            </span>
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{gpa}</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Course List ({courses.length})
          </span>
          <Button variant="outline" size="sm" onClick={addCourse}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Course
          </Button>
        </div>

        <div className="space-y-2">
          {courses.map((course) => (
            <div
              key={course.id}
              className="grid grid-cols-12 gap-3 items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700"
            >
              <div className="col-span-6 sm:col-span-6">
                <input
                  type="text"
                  value={course.name}
                  onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                  placeholder="Course Name"
                  className="w-full bg-transparent text-sm font-medium focus:outline-none text-slate-800 dark:text-slate-100"
                />
              </div>
              <div className="col-span-3 sm:col-span-3">
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={course.credits}
                  onChange={(e) => updateCourse(course.id, 'credits', Number(e.target.value))}
                  placeholder="Credits"
                  className="w-full bg-white dark:bg-slate-800 px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-center"
                />
              </div>
              <div className="col-span-2 sm:col-span-2">
                <Select
                  value={course.grade}
                  onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                  options={Object.keys(GRADE_POINTS).map((g) => ({
                    value: g,
                    label: `${g} (${GRADE_POINTS[g].toFixed(1)})`,
                  }))}
                />
              </div>
              <div className="col-span-1 text-right">
                <button
                  onClick={() => removeCourse(course.id)}
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
