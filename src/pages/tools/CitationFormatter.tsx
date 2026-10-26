import React, { useState } from 'react';
import { BookOpen, Copy, Check } from 'lucide-react';
import { Button, Input, Select } from '../../components/ui/FormElements';
import { copyToClipboard } from '../../utils/file';

type Style = 'apa' | 'mla' | 'chicago' | 'harvard' | 'ieee';

export function CitationFormatter() {
  const [style, setStyle] = useState<Style>('apa');
  const [sourceType, setSourceType] = useState<'book' | 'website' | 'journal'>('book');

  const [authorLast, setAuthorLast] = useState<string>('Knuth');
  const [authorFirst, setAuthorFirst] = useState<string>('Donald');
  const [title, setTitle] = useState<string>('The Art of Computer Programming');
  const [year, setYear] = useState<string>('1997');
  const [publisher, setPublisher] = useState<string>('Addison-Wesley Professional');
  const [url, setUrl] = useState<string>('https://cs.stanford.edu/~knuth/taocp.html');
  const [journalName, setJournalName] = useState<string>('Communications of the ACM');
  const [volume, setVolume] = useState<string>('17');
  const [copied, setCopied] = useState<boolean>(false);

  const formatCitation = (): string => {
    const initial = authorFirst ? authorFirst.charAt(0) + '.' : '';

    if (sourceType === 'book') {
      switch (style) {
        case 'apa':
          return `${authorLast}, ${initial} (${year}). ${title}. ${publisher}.`;
        case 'mla':
          return `${authorLast}, ${authorFirst}. ${title}. ${publisher}, ${year}.`;
        case 'chicago':
          return `${authorLast}, ${authorFirst}. ${title}. ${publisher}, ${year}.`;
        case 'harvard':
          return `${authorLast}, ${initial} ${year}, ${title}, ${publisher}.`;
        case 'ieee':
          return `[1] ${initial} ${authorLast}, ${title}. ${publisher}, ${year}.`;
      }
    } else if (sourceType === 'journal') {
      switch (style) {
        case 'apa':
          return `${authorLast}, ${initial} (${year}). ${title}. ${journalName}, ${volume}.`;
        case 'mla':
          return `${authorLast}, ${authorFirst}. "${title}." ${journalName}, vol. ${volume}, ${year}.`;
        case 'chicago':
          return `${authorLast}, ${authorFirst}. "${title}." ${journalName} ${volume} (${year}).`;
        case 'harvard':
          return `${authorLast}, ${initial} ${year}, '${title}', ${journalName}, vol. ${volume}.`;
        case 'ieee':
          return `[1] ${initial} ${authorLast}, "${title}," ${journalName}, vol. ${volume}, ${year}.`;
      }
    } else {
      // Website
      switch (style) {
        case 'apa':
          return `${authorLast}, ${initial} (${year}). ${title}. Retrieved from ${url}`;
        case 'mla':
          return `${authorLast}, ${authorFirst}. "${title}." Web. ${year}, <${url}>.`;
        case 'chicago':
          return `${authorLast}, ${authorFirst}. "${title}." Accessed ${year}. ${url}.`;
        case 'harvard':
          return `${authorLast}, ${initial} ${year}, ${title}, viewed ${new Date().toLocaleDateString()}, <${url}>.`;
        case 'ieee':
          return `[1] ${initial} ${authorLast}, "${title}," [Online]. Available: ${url}.`;
      }
    }
  };

  const citation = formatCitation();

  const handleCopy = async () => {
    await copyToClipboard(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-500" /> Academic Citation Generator
          </span>
          <div className="flex gap-2">
            <div className="w-32">
              <Select
                value={style}
                onChange={(e) => setStyle(e.target.value as Style)}
                options={[
                  { value: 'apa', label: 'APA 7th' },
                  { value: 'mla', label: 'MLA 9th' },
                  { value: 'chicago', label: 'Chicago' },
                  { value: 'harvard', label: 'Harvard' },
                  { value: 'ieee', label: 'IEEE' },
                ]}
              />
            </div>
            <div className="w-32">
              <Select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as any)}
                options={[
                  { value: 'book', label: 'Book' },
                  { value: 'journal', label: 'Journal Article' },
                  { value: 'website', label: 'Website' },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Author Last Name" value={authorLast} onChange={(e) => setAuthorLast(e.target.value)} />
          <Input label="Author First Name" value={authorFirst} onChange={(e) => setAuthorFirst(e.target.value)} />
          <div className="sm:col-span-2">
            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <Input label="Publication Year" value={year} onChange={(e) => setYear(e.target.value)} />

          {sourceType === 'book' && (
            <Input label="Publisher" value={publisher} onChange={(e) => setPublisher(e.target.value)} />
          )}

          {sourceType === 'journal' && (
            <>
              <Input label="Journal Name" value={journalName} onChange={(e) => setJournalName(e.target.value)} />
              <Input label="Volume / Issue" value={volume} onChange={(e) => setVolume(e.target.value)} />
            </>
          )}

          {sourceType === 'website' && (
            <div className="sm:col-span-2">
              <Input label="URL" value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>
          )}
        </div>

        <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Formatted Citation ({style.toUpperCase()})
            </span>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}
              Copy
            </Button>
          </div>
          <p className="text-sm font-serif italic text-slate-800 dark:text-slate-100 leading-relaxed bg-white dark:bg-slate-800 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            {citation}
          </p>
        </div>
      </div>
    </div>
  );
}
