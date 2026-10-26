import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Info, FileText, CheckCircle2, Shield } from 'lucide-react';
import { FileUploadZone } from '../../components/ui/FileUpload';
import { Button } from '../../components/ui/FormElements';
import { formatBytes } from '../../utils/file';

interface PdfMetadata {
  name: string;
  size: string;
  pageCount: number;
  title: string;
  author: string;
  subject: string;
  creator: string;
  producer: string;
  creationDate: string;
  modDate: string;
  pageSize: string;
}

export function PDFInfo() {
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<PdfMetadata | null>(null);

  const handleFileSelect = async (files: File[]) => {
    if (files.length > 0) {
      const f = files[0];
      setFile(f);

      try {
        const buffer = await f.arrayBuffer();
        const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const pages = doc.getPages();
        const firstPage = pages[0];
        const { width, height } = firstPage ? firstPage.getSize() : { width: 0, height: 0 };

        const widthMm = Math.round(width * 0.352778);
        const heightMm = Math.round(height * 0.352778);

        setMeta({
          name: f.name,
          size: formatBytes(f.size),
          pageCount: doc.getPageCount(),
          title: doc.getTitle() || 'None',
          author: doc.getAuthor() || 'None',
          subject: doc.getSubject() || 'None',
          creator: doc.getCreator() || 'None',
          producer: doc.getProducer() || 'None',
          creationDate: doc.getCreationDate() ? doc.getCreationDate()!.toLocaleString() : 'Not specified',
          modDate: doc.getModificationDate() ? doc.getModificationDate()!.toLocaleString() : 'Not specified',
          pageSize: `${Math.round(width)} × ${Math.round(height)} pt (${widthMm} × ${heightMm} mm)`,
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {!meta ? (
        <FileUploadZone
          accept={{ 'application/pdf': ['.pdf'] }}
          onFilesSelect={handleFileSelect}
          label="Drop a PDF to inspect metadata, page specs & document properties"
          description="Instant analysis of title, author, producer, page dimensions, and timestamps"
        />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-500" /> {meta.name}
              </h3>
              <p className="text-xs text-slate-500">File Size: {meta.size}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFile(null);
                setMeta(null);
              }}
            >
              Analyze Another PDF
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Page Count', value: `${meta.pageCount} pages` },
              { label: 'Page Dimensions', value: meta.pageSize },
              { label: 'Document Title', value: meta.title },
              { label: 'Author', value: meta.author },
              { label: 'Subject', value: meta.subject },
              { label: 'Creator Application', value: meta.creator },
              { label: 'PDF Producer', value: meta.producer },
              { label: 'Creation Date', value: meta.creationDate },
              { label: 'Last Modified', value: meta.modDate },
            ].map((item) => (
              <div
                key={item.label}
                className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <span className="text-xs font-semibold text-slate-500 uppercase">{item.label}</span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-1 truncate">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
