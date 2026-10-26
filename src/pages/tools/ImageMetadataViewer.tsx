import React from 'react';
import { DropZone, FileListItem } from '../../components/ui/FileUpload';
import { Button } from '../../components/ui/FormElements';
import { formatBytes } from '../../utils/file';

interface ImageMeta {
  width: number;
  height: number;
  aspectRatio: string;
  fileSize: string;
  fileType: string;
  fileName: string;
  lastModified: string;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function getAspectRatio(w: number, h: number): string {
  const d = gcd(w, h);
  return `${w / d}:${h / d}`;
}

export function ImageMetadataViewer() {
  const [file, setFile] = React.useState<File | null>(null);
  const [meta, setMeta] = React.useState<ImageMeta | null>(null);
  const [status, setStatus] = React.useState<'idle' | 'processing' | 'success'>('idle');

  const handleFiles = (files: File[]) => {
    const f = files[0];
    setFile(f);
    setStatus('processing');
    const img = new Image();
    const url = URL.createObjectURL(f);
    img.onload = () => {
      URL.revokeObjectURL(url);
      setMeta({
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: getAspectRatio(img.naturalWidth, img.naturalHeight),
        fileSize: formatBytes(f.size),
        fileType: f.type || 'Unknown',
        fileName: f.name,
        lastModified: new Date(f.lastModified).toLocaleString(),
      });
      setStatus('success');
    };
    img.src = url;
  };

  const rows = meta ? [
    { label: 'File Name', value: meta.fileName },
    { label: 'File Type', value: meta.fileType },
    { label: 'File Size', value: meta.fileSize },
    { label: 'Width', value: `${meta.width} px` },
    { label: 'Height', value: `${meta.height} px` },
    { label: 'Aspect Ratio', value: meta.aspectRatio },
    { label: 'Last Modified', value: meta.lastModified },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="px-3 py-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg">
        Note: This tool reads file metadata available to the browser (dimensions, file info). It does not currently read embedded EXIF data (camera settings, GPS coordinates) which requires a dedicated EXIF library.
      </div>
      {!file ? (
        <DropZone onFiles={handleFiles} accept="image/*" maxSizeMB={50} hint="Supports JPG, PNG, WebP, GIF — up to 50 MB" />
      ) : (
        <div className="space-y-5">
          <FileListItem file={file} onRemove={() => { setFile(null); setMeta(null); setStatus('idle'); }}
            status={status === 'processing' ? 'processing' : 'success'} />
          {meta && (
            <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
              {rows.map(({ label, value }) => (
                <div key={label} className="flex gap-4 px-4 py-3 even:bg-gray-50/50">
                  <span className="w-36 shrink-0 text-sm text-gray-500">{label}</span>
                  <span className="text-sm font-medium text-gray-900 break-all">{value}</span>
                </div>
              ))}
            </div>
          )}
          <Button variant="ghost" onClick={() => { setFile(null); setMeta(null); setStatus('idle'); }}>Start over</Button>
        </div>
      )}
    </div>
  );
}
