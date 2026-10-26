import React, { useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Download, Copy, Check, FileText } from 'lucide-react';
import { Button, Input, Select } from '../../components/ui/FormElements';
import { copyToClipboard, downloadBlob } from '../../utils/file';

export function CoverLetterBuilder() {
  const [candidateName, setCandidateName] = useState<string>('Alex Morgan');
  const [candidateEmail, setCandidateEmail] = useState<string>('alex.morgan@zenvio.io');
  const [candidatePhone, setCandidatePhone] = useState<string>('+1 (555) 234-5678');

  const [hiringManager, setHiringManager] = useState<string>('Hiring Team');
  const [companyName, setCompanyName] = useState<string>('Stripe');
  const [targetRole, setTargetRole] = useState<string>('Senior Full-Stack Engineer');

  const [opening, setOpening] = useState<string>(
    'I am writing to express my enthusiastic interest in the Senior Full-Stack Engineer role at Stripe. With over 8 years building resilient software platforms and developer tools, I am eager to contribute to your engineering excellence.'
  );

  const [body, setBody] = useState<string>(
    'In my previous role at TechCorp, I led the architecture of core infrastructure handling 15M daily requests while cutting latency by 35%. I pride myself on clean architecture, comprehensive test suites, and fostering a collaborative engineering culture.'
  );

  const [closing, setClosing] = useState<string>(
    'I would welcome the opportunity to discuss how my skill set and passion for high-impact developer experiences align with your team objectives. Thank you for your time and consideration.'
  );

  const [copied, setCopied] = useState<boolean>(false);

  const fullLetter = `${candidateName}
${candidateEmail} | ${candidatePhone}

${new Date().toLocaleDateString()}

Dear ${hiringManager},

${opening}

${body}

${closing}

Sincerely,
${candidateName}`;

  const handleCopy = async () => {
    await copyToClipboard(fullLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([595.28, 841.89]);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await doc.embedFont(StandardFonts.Helvetica);

    page.drawText(candidateName, { x: 50, y: 780, size: 20, font: fontBold });
    page.drawText(`${candidateEmail} • ${candidatePhone}`, { x: 50, y: 760, size: 9, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });

    page.drawText(`Date: ${new Date().toLocaleDateString()}`, { x: 50, y: 710, size: 9, font: fontRegular });
    page.drawText(`To: ${hiringManager} — ${companyName}`, { x: 50, y: 695, size: 10, font: fontBold });
    page.drawText(`Re: ${targetRole}`, { x: 50, y: 680, size: 10, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });

    let y = 640;
    const drawParagraph = (text: string) => {
      const words = text.split(' ');
      let line = '';
      for (const w of words) {
        if ((line + w).length > 75) {
          page.drawText(line, { x: 50, y, size: 10, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
          y -= 16;
          line = w + ' ';
        } else {
          line += w + ' ';
        }
      }
      if (line) {
        page.drawText(line, { x: 50, y, size: 10, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
        y -= 26;
      }
    };

    drawParagraph(opening);
    drawParagraph(body);
    drawParagraph(closing);

    y -= 10;
    page.drawText('Sincerely,', { x: 50, y, size: 10, font: fontRegular });
    y -= 20;
    page.drawText(candidateName, { x: 50, y, size: 11, font: fontBold });

    const pdfBytes = await doc.save();
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `${candidateName.replace(/\s+/g, '_')}_Cover_Letter.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-500" /> Tailored Cover Letter Builder
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}
            Copy Text
          </Button>
          <Button variant="primary" size="sm" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 mr-1" /> Download PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Job & Target Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Your Name" value={candidateName} onChange={(e) => setCandidateName(e.target.value)} />
            <Input label="Your Email" value={candidateEmail} onChange={(e) => setCandidateEmail(e.target.value)} />
            <Input label="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            <Input label="Hiring Manager" value={hiringManager} onChange={(e) => setHiringManager(e.target.value)} />
            <div className="sm:col-span-2">
              <Input label="Target Role" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Opening Statement
              </label>
              <textarea
                value={opening}
                onChange={(e) => setOpening(e.target.value)}
                rows={3}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Body Paragraph (Experience & Fit)
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Closing Statement
              </label>
              <textarea
                value={closing}
                onChange={(e) => setClosing(e.target.value)}
                rows={2}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg text-slate-800 dark:text-slate-100 text-sm leading-relaxed space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
            <h3 className="font-bold text-lg">{candidateName}</h3>
            <p className="text-xs text-slate-400">{candidateEmail} • {candidatePhone}</p>
          </div>
          <p className="text-xs text-slate-500">{new Date().toLocaleDateString()}</p>
          <p className="font-semibold text-slate-700 dark:text-slate-200">
            Dear {hiringManager},
          </p>
          <p className="text-slate-600 dark:text-slate-300">{opening}</p>
          <p className="text-slate-600 dark:text-slate-300">{body}</p>
          <p className="text-slate-600 dark:text-slate-300">{closing}</p>
          <div className="pt-2">
            <p className="text-slate-500 text-xs">Sincerely,</p>
            <p className="font-bold text-slate-800 dark:text-slate-100 mt-1">{candidateName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
