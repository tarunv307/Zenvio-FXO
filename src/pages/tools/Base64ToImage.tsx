import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '../../components/ui/FormElements';
import { downloadDataUrl } from '../../utils/file';

export function Base64ToImage() {
  const [input, setInput] = React.useState('');
  const [imgSrc, setImgSrc] = React.useState('');
  const [error, setError] = React.useState('');

  const decode = () => {
    setError('');
    const trimmed = input.trim();
    if (!trimmed) { setError('Please enter a Base64 data URL.'); return; }
    // Accept raw base64 or data URL
    const src = trimmed.startsWith('data:') ? trimmed : `data:image/png;base64,${trimmed}`;
    const img = new Image();
    img.onload = () => setImgSrc(src);
    img.onerror = () => setError('Invalid Base64 string. Please check the input.');
    img.src = src;
  };

  const download = () => {
    if (!imgSrc) return;
    const ext = imgSrc.includes('image/png') ? 'png' : imgSrc.includes('image/webp') ? 'webp' : 'jpg';
    downloadDataUrl(imgSrc, `decoded-image.${ext}`);
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5" htmlFor="base64-input">
          Paste Base64 string or Data URL
        </label>
        <textarea
          id="base64-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="data:image/png;base64,iVBORw0KGgoAAAA... or raw base64 string"
          className="code-area"
          rows={6}
        />
      </div>

      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

      <Button onClick={decode} disabled={!input.trim()}>Decode Image</Button>

      {imgSrc && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-emerald-800">Image decoded successfully</p>
            <Button size="sm" onClick={download}><Download className="size-4" /> Download</Button>
          </div>
          <img src={imgSrc} alt="Decoded from Base64" className="max-h-64 rounded-lg object-contain mx-auto" />
        </div>
      )}
    </div>
  );
}
