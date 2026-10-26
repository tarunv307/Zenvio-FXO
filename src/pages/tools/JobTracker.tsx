import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Briefcase, Building, Calendar, DollarSign } from 'lucide-react';
import { Button, Input, Select } from '../../components/ui/FormElements';

type JobStatus = 'Wishlist' | 'Applied' | 'Interview' | 'Offer' | 'Rejected';

interface JobApplication {
  id: string;
  company: string;
  position: string;
  status: JobStatus;
  salary: string;
  date: string;
  notes: string;
}

const DEFAULT_JOBS: JobApplication[] = [
  { id: '1', company: 'Google', position: 'Senior Infrastructure Engineer', status: 'Interview', salary: '$210k', date: '2026-10-18', notes: 'Round 3 system design scheduled' },
  { id: '2', company: 'Stripe', position: 'Staff Full Stack Developer', status: 'Applied', salary: '$225k', date: '2026-10-22', notes: 'Referred by team lead' },
  { id: '3', company: 'Vercel', position: 'DX Engineer', status: 'Offer', salary: '$195k', date: '2026-10-05', notes: 'Offer letter received' },
];

export function JobTracker() {
  const [jobs, setJobs] = useState<JobApplication[]>(() => {
    try {
      const saved = localStorage.getItem('zenvio_jobs');
      return saved ? JSON.parse(saved) : DEFAULT_JOBS;
    } catch {
      return DEFAULT_JOBS;
    }
  });

  const [company, setCompany] = useState<string>('');
  const [position, setPosition] = useState<string>('');
  const [status, setStatus] = useState<JobStatus>('Applied');
  const [salary, setSalary] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    try {
      localStorage.setItem('zenvio_jobs', JSON.stringify(jobs));
    } catch {
      // ignore
    }
  }, [jobs]);

  const addJob = () => {
    if (!company.trim() || !position.trim()) return;
    setJobs([
      {
        id: Math.random().toString(36).substring(7),
        company: company.trim(),
        position: position.trim(),
        status,
        salary: salary.trim() || '—',
        date: new Date().toISOString().split('T')[0],
        notes: notes.trim(),
      },
      ...jobs,
    ]);
    setCompany('');
    setPosition('');
    setSalary('');
    setNotes('');
  };

  const removeJob = (id: string) => {
    setJobs(jobs.filter((j) => j.id !== id));
  };

  const updateStatus = (id: string, newStatus: JobStatus) => {
    setJobs(jobs.map((j) => (j.id === id ? { ...j, status: newStatus } : j)));
  };

  const STATUS_COLORS: Record<JobStatus, string> = {
    Wishlist: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700',
    Applied: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    Interview: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    Offer: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    Rejected: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-amber-500" /> Add Job Application
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <Input placeholder="Company Name" value={company} onChange={(e) => setCompany(e.target.value)} />
          <Input placeholder="Role / Position" value={position} onChange={(e) => setPosition(e.target.value)} />
          <Input placeholder="Salary Expectation" value={salary} onChange={(e) => setSalary(e.target.value)} />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as JobStatus)}
            options={[
              { value: 'Wishlist', label: 'Wishlist' },
              { value: 'Applied', label: 'Applied' },
              { value: 'Interview', label: 'Interview' },
              { value: 'Offer', label: 'Offer' },
              { value: 'Rejected', label: 'Rejected' },
            ]}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input placeholder="Notes or interview date..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <Button variant="primary" onClick={addJob}>
            <Plus className="w-4 h-4 mr-1.5" /> Save Application
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Tracked Applications ({jobs.length})
          </span>
        </div>

        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{job.position}</span>
                  <span className="text-slate-400">@</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{job.company}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {job.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" /> {job.salary}
                  </span>
                  {job.notes && <span className="text-slate-600 dark:text-slate-400 italic">“{job.notes}”</span>}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <select
                  value={job.status}
                  onChange={(e) => updateStatus(job.id, e.target.value as JobStatus)}
                  className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none ${STATUS_COLORS[job.status]}`}
                >
                  <option value="Wishlist">Wishlist</option>
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <button
                  onClick={() => removeJob(job.id)}
                  className="text-slate-400 hover:text-red-500 p-1.5 transition-colors"
                  title="Remove"
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
