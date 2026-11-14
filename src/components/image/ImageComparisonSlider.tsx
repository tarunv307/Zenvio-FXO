import React, { useState, useRef, useCallback } from 'react';
import { Columns, Eye, Download, RefreshCw, ZoomIn, Check } from 'lucide-react';

interface ImageComparisonSliderProps {
  originalSrc: string;
  processedSrc: string;
  originalLabel?: string;
  processedLabel?: string;
  isTransparent?: boolean;
  onDownload?: () => void;
  downloadFilename?: string;
}

export function ImageComparisonSlider({
  originalSrc,
  processedSrc,
  originalLabel = 'Original',
  processedLabel = 'Processed',
  isTransparent = false,
  onDownload,
  downloadFilename = 'processed-image.png',
}: ImageComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side' | 'processed-only'>('slider');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const defaultDownload = () => {
    const a = document.createElement('a');
    a.href = processedSrc;
    a.download = downloadFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* View Mode Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-[#0F172A] px-2">View:</span>
          <button
            type="button"
            onClick={() => setViewMode('slider')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
              viewMode === 'slider'
                ? 'bg-white text-[#2563EB] shadow-xs border border-[#E2E8F0]'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Split Slider
          </button>
          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
              viewMode === 'side-by-side'
                ? 'bg-white text-[#2563EB] shadow-xs border border-[#E2E8F0]'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Side by Side
          </button>
          <button
            type="button"
            onClick={() => setViewMode('processed-only')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
              viewMode === 'processed-only'
                ? 'bg-white text-[#2563EB] shadow-xs border border-[#E2E8F0]'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Result Only
          </button>
        </div>

        <button
          type="button"
          onClick={onDownload || defaultDownload}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] text-white font-semibold rounded-lg hover:bg-[#1D4ED8] transition-colors shadow-xs ml-auto"
        >
          <Download className="size-3.5" />
          Download Result
        </button>
      </div>

      {/* Comparison Area */}
      {viewMode === 'slider' && (
        <div
          ref={containerRef}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={handleMouseMove}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          onTouchMove={handleTouchMove}
          className="relative w-full aspect-video max-h-[520px] rounded-2xl overflow-hidden border border-[#E2E8F0] select-none cursor-ew-resize bg-slate-900 shadow-card"
        >
          {/* Background pattern if transparent */}
          {isTransparent && (
            <div
              className="absolute inset-0 z-0 opacity-40"
              style={{
                backgroundImage:
                  'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)',
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
              }}
            />
          )}

          {/* Processed (Right / Behind) Image */}
          <img
            src={processedSrc}
            alt={processedLabel}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-md backdrop-blur-xs font-medium z-10">
            {processedLabel}
          </div>

          {/* Original (Left / Foreground) Image clipped to sliderPosition */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ width: `${sliderPosition}%` }}
          >
            <img
              src={originalSrc}
              alt={originalLabel}
              className="absolute inset-0 w-full h-full object-contain max-w-none"
              style={{
                width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
                height: '100%',
              }}
            />
            <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-md backdrop-blur-xs font-medium z-10">
              {originalLabel}
            </div>
          </div>

          {/* Divider Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 size-8 bg-white rounded-full shadow-lg border border-slate-300 flex items-center justify-center text-slate-700">
              <Columns className="size-4 rotate-90" />
            </div>
          </div>
        </div>
      )}

      {viewMode === 'side-by-side' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">{originalLabel}</span>
            <div className="relative aspect-video max-h-[400px] rounded-xl overflow-hidden border border-[#E2E8F0] bg-slate-900 flex items-center justify-center">
              <img src={originalSrc} alt={originalLabel} className="max-h-full max-w-full object-contain" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">{processedLabel}</span>
            <div className="relative aspect-video max-h-[400px] rounded-xl overflow-hidden border border-[#E2E8F0] bg-slate-900 flex items-center justify-center">
              {isTransparent && (
                <div
                  className="absolute inset-0 z-0 opacity-40"
                  style={{
                    backgroundImage:
                      'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)',
                    backgroundSize: '16px 16px',
                    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                  }}
                />
              )}
              <img src={processedSrc} alt={processedLabel} className="relative z-10 max-h-full max-w-full object-contain" />
            </div>
          </div>
        </div>
      )}

      {viewMode === 'processed-only' && (
        <div className="relative w-full aspect-video max-h-[520px] rounded-2xl overflow-hidden border border-[#E2E8F0] bg-slate-900 flex items-center justify-center shadow-card">
          {isTransparent && (
            <div
              className="absolute inset-0 z-0 opacity-40"
              style={{
                backgroundImage:
                  'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)',
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
              }}
            />
          )}
          <img src={processedSrc} alt={processedLabel} className="relative z-10 max-h-full max-w-full object-contain" />
        </div>
      )}
    </div>
  );
}

