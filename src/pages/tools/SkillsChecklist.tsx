import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, Award, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/FormElements';

interface SkillGroup {
  category: string;
  skills: { id: string; name: string }[];
}

const SKILL_GROUPS: SkillGroup[] = [
  {
    category: 'Frontend Engineering',
    skills: [
      { id: 'fe-1', name: 'React / Next.js architecture & hooks lifecycle' },
      { id: 'fe-2', name: 'TypeScript generics, utility types, and strict mode' },
      { id: 'fe-3', name: 'CSS layout engines (Flexbox, Grid, Tailwind, animations)' },
      { id: 'fe-4', name: 'Web Performance (Core Web Vitals, code splitting, lazy loading)' },
      { id: 'fe-5', name: 'Accessibility (ARIA, keyboard navigation, contrast compliance)' },
    ],
  },
  {
    category: 'Backend & Systems',
    skills: [
      { id: 'be-1', name: 'REST & GraphQL API design with idempotent endpoints' },
      { id: 'be-2', name: 'SQL database indexing, queries optimization, and migrations' },
      { id: 'be-3', name: 'In-memory caching patterns (Redis key design, TTLs, evictions)' },
      { id: 'be-4', name: 'Authentication & Session management (OAuth 2.0, JWT, RBAC)' },
      { id: 'be-5', name: 'Message queues and async event processing' },
    ],
  },
  {
    category: 'DevOps & Reliability',
    skills: [
      { id: 'do-1', name: 'Docker containerization & multi-stage builds' },
      { id: 'do-2', name: 'CI/CD pipeline automation (GitHub Actions, test runners)' },
      { id: 'do-3', name: 'Infrastructure as Code and cloud provider basics (AWS/GCP)' },
      { id: 'do-4', name: 'Logging, metrics monitoring, and distributed tracing' },
    ],
  },
  {
    category: 'System Design & CS Fundamentals',
    skills: [
      { id: 'sd-1', name: 'Data structures & algorithmic complexity analysis' },
      { id: 'sd-2', name: 'Load balancing, rate limiting, and CAP theorem trade-offs' },
      { id: 'sd-3', name: 'Horizontal scalability and stateless service patterns' },
    ],
  },
];

export function SkillsChecklist() {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('zenvio_skills');
      return saved ? new Set(JSON.parse(saved)) : new Set(['fe-1', 'fe-2', 'fe-3', 'be-1']);
    } catch {
      return new Set(['fe-1', 'fe-2', 'fe-3', 'be-1']);
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('zenvio_skills', JSON.stringify(Array.from(checkedIds)));
    } catch {
      // ignore
    }
  }, [checkedIds]);

  const toggleSkill = (id: string) => {
    const next = new Set(checkedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCheckedIds(next);
  };

  const totalSkills = SKILL_GROUPS.reduce((acc, g) => acc + g.skills.length, 0);
  const checkedCount = checkedIds.size;
  const scorePercentage = Math.round((checkedCount / totalSkills) * 100);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" /> Software Engineer Career Skills Checklist
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Track industry readiness across Frontend, Backend, DevOps, and System Design.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-amber-50 dark:bg-amber-950/40 px-6 py-4 rounded-2xl border border-amber-200 dark:border-amber-800">
          <div>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 block uppercase">
              Readiness Score
            </span>
            <span className="text-3xl font-black text-amber-600 dark:text-amber-400">
              {scorePercentage}%
            </span>
          </div>
          <div className="h-10 w-px bg-amber-200 dark:bg-amber-800" />
          <span className="text-xs text-slate-500 font-medium">
            {checkedCount} / {totalSkills} skills checked
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SKILL_GROUPS.map((group) => {
          const groupTotal = group.skills.length;
          const groupChecked = group.skills.filter((s) => checkedIds.has(s.id)).length;
          const groupPct = Math.round((groupChecked / groupTotal) * 100);

          return (
            <div
              key={group.category}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4"
            >
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{group.category}</h4>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  {groupChecked}/{groupTotal} ({groupPct}%)
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${groupPct}%` }}
                />
              </div>

              <div className="space-y-2 pt-2">
                {group.skills.map((skill) => {
                  const isChecked = checkedIds.has(skill.id);
                  return (
                    <button
                      key={skill.id}
                      onClick={() => toggleSkill(skill.id)}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-start gap-3 transition-colors ${
                        isChecked
                          ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/40 dark:bg-amber-950/20 text-slate-800 dark:text-slate-100'
                          : 'border-slate-100 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700/30 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="pt-0.5 shrink-0">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-amber-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                        )}
                      </div>
                      <span className={`text-xs ${isChecked ? 'font-medium' : ''}`}>{skill.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
