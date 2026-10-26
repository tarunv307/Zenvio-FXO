import React from 'react';
import { DropZone, FileListItem } from '../../components/ui/FileUpload';
import { Button } from '../../components/ui/FormElements';
import { CopyButton } from '../../components/ui/Cards';
import { readFileAsDataUrl } from '../../utils/file';

export function ImageToBase64() {
  const [file, setFile] = React.useState<File | null>(null);
  const [dataUrl, setDataUrl] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const handleFiles = async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setStatus('processing');
    try {
      const url = await readFileAsDataUrl(f);
      setDataUrl(url);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const reset = () => { setFile(null); setDataUrl(''); setStatus('idle'); };

  return (
    <div className="space-y-6">
      {!file ? (
        <DropZone onFiles={handleFiles} accept="image/*" maxSizeMB={10} hint="Supports JPG, PNG, WebP, GIF — up to 10 MB" />
      ) : (
        <div className="space-y-5">
          <FileListItem file={file} onRemove={reset} status={status === 'processing' ? 'processing' : 'success'} />
          {status === 'success' && dataUrl && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">Base64 Data URL</p>
                <CopyButton text={dataUrl} />
              </div>
              <textarea
                readOnly
                value={dataUrl}
                className="code-area"
                rows={6}
                aria-label="Base64 encoded image data"
              />
              <p className="text-xs text-gray-500">
                Length: {dataUrl.length.toLocaleString()} characters
              </p>
            </div>
          )}
          <Button variant="ghost" onClick={reset}>Start over</Button>
        </div>
      )}
    </div>
  );
}
