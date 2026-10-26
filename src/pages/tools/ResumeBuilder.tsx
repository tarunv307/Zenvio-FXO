import React, { useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Download, Plus, Trash2, Briefcase } from 'lucide-react';
import { Button, Input } from '../../components/ui/FormElements';
import { downloadBlob } from '../../utils/file';

interface Experience {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
}

interface Education {
  id: string;
  degree: string;
  school: string;
  year: string;
}

export function ResumeBuilder() {
  const [fullName, setFullName] = useState<string>('Alex Morgan');
  const [title, setTitle] = useState<string>('Senior Software Engineer & Cloud Architect');
  const [email, setEmail] = useState<string>('alex.morgan@zenvio.io');
  const [phone, setPhone] = useState<string>('+1 (555) 234-5678');
  const [location, setLocation] = useState<string>('San Francisco, CA');
  const [summary, setSummary] = useState<string>(
    'Passionate engineer with 8+ years designing scalable cloud services, developer utilities, and modern web applications with React, TypeScript, and distributed systems.'
  );

  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: '1',
      role: 'Staff Infrastructure Engineer',
      company: 'TechCorp International',
      duration: '2021 — Present',
      description: 'Led architecture of high-throughput API gateway serving 15M daily requests.',
    },
    {
      id: '2',
      role: 'Full Stack Engineer',
      company: 'AppVanguard',
      duration: '2018 — 2021',
      description: 'Built customer-facing web apps using React, TailwindCSS, and Node.js.',
    },
  ]);

  const [educations, setEducations] = useState<Education[]>([
    {
      id: '1',
      degree: 'B.S. in Computer Science',
      school: 'University of California, Berkeley',
      year: '2014 — 2018',
    },
  ]);

  const [skills, setSkills] = useState<string>('TypeScript, React, Node.js, Python, Docker, Kubernetes, AWS, PostgreSQL, Redis');

  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        id: Math.random().toString(36).substring(7),
        role: 'Job Title',
        company: 'Company Name',
        duration: 'Year — Year',
        description: 'Key accomplishments and responsibilities...',
      },
    ]);
  };

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter((e) => e.id !== id));
  };

  const updateExp = (id: string, field: keyof Experience, val: string) => {
    setExperiences(experiences.map((e) => (e.id === id ? { ...e, [field]: val } : e)));
  };

  const generatePDF = async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([595.28, 841.89]);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await doc.embedFont(StandardFonts.Helvetica);

    // Name & Title
    page.drawText(fullName, { x: 50, y: 790, size: 24, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
    page.drawText(title, { x: 50, y: 770, size: 12, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });

    // Contact info
    page.drawText(`${email} • ${phone} • ${location}`, {
      x: 50,
      y: 752,
      size: 9,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4),
    });

    let y = 720;
    // Summary
    page.drawText('PROFESSIONAL SUMMARY', { x: 50, y, size: 11, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
    y -= 16;
    page.drawText(summary.substring(0, 105), { x: 50, y, size: 9, font: fontRegular });
    if (summary.length > 105) {
      y -= 14;
      page.drawText(summary.substring(105, 210), { x: 50, y, size: 9, font: fontRegular });
    }

    // Experience
    y -= 28;
    page.drawText('WORK EXPERIENCE', { x: 50, y, size: 11, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
    experiences.forEach((exp) => {
      y -= 18;
      page.drawText(`${exp.role} — ${exp.company}`, { x: 50, y, size: 10, font: fontBold });
      page.drawText(exp.duration, { x: 420, y, size: 9, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
      y -= 14;
      page.drawText(exp.description.substring(0, 95), { x: 50, y, size: 9, font: fontRegular });
    });

    // Education
    y -= 28;
    page.drawText('EDUCATION', { x: 50, y, size: 11, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
    educations.forEach((edu) => {
      y -= 18;
      page.drawText(`${edu.degree} — ${edu.school}`, { x: 50, y, size: 10, font: fontBold });
      page.drawText(edu.year, { x: 420, y, size: 9, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
    });

    // Skills
    y -= 28;
    page.drawText('SKILLS & TECHNOLOGIES', { x: 50, y, size: 11, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
    y -= 16;
    page.drawText(skills.substring(0, 95), { x: 50, y, size: 9, font: fontRegular });

    const pdfBytes = await doc.save();
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `${fullName.replace(/\s+/g, '_')}_Resume.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-amber-500" /> Professional Resume Builder
        </span>
        <Button variant="primary" size="sm" onClick={generatePDF}>
          <Download className="w-4 h-4 mr-1.5" /> Export PDF Resume
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Contact & Info</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <Input label="Target Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <div className="sm:col-span-2">
              <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Professional Summary
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Work History</h4>
              <Button variant="outline" size="sm" onClick={addExperience}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add
              </Button>
            </div>
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 relative"
              >
                <button
                  onClick={() => removeExperience(exp.id)}
                  className="absolute top-2 right-2 text-slate-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="grid grid-cols-2 gap-2 pr-6">
                  <Input placeholder="Role" value={exp.role} onChange={(e) => updateExp(exp.id, 'role', e.target.value)} />
                  <Input placeholder="Company" value={exp.company} onChange={(e) => updateExp(exp.id, 'company', e.target.value)} />
                </div>
                <Input placeholder="Duration (e.g. 2021 — Present)" value={exp.duration} onChange={(e) => updateExp(exp.id, 'duration', e.target.value)} />
                <textarea
                  placeholder="Key Responsibilities"
                  value={exp.description}
                  onChange={(e) => updateExp(exp.id, 'description', e.target.value)}
                  rows={2}
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-700">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Skills (Comma-separated)</h4>
            <Input value={skills} onChange={(e) => setSkills(e.target.value)} />
          </div>
        </div>

        {/* Live Preview */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg text-slate-800 dark:text-slate-100 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
              <h2 className="text-2xl font-black">{fullName || 'Your Name'}</h2>
              <p className="text-amber-600 dark:text-amber-400 font-medium text-sm mt-0.5">{title}</p>
              <p className="text-xs text-slate-400 mt-1">
                {email} • {phone} • {location}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Summary</h3>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{summary}</p>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Experience</h3>
              <div className="space-y-3">
                {experiences.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {exp.role} <span className="font-normal text-slate-400">@ {exp.company}</span>
                      </span>
                      <span className="text-[10px] text-slate-400">{exp.duration}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {skills.split(',').map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-medium"
                  >
                    {s.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
