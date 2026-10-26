import React from 'react';
import { Upload, X, FileType } from 'lucide-react';
import { formatBytes } from '../../utils/file';

// ─── File Upload Drop Zone ───────────────────────────────────────────────────

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  hint?: string;
  disabled?: boolean;
  className?: string;
}

export function DropZone({
  onFiles,
  accept,
  multiple = false,
  maxSizeMB = 50,
  hint,
  disabled = false,
  className = '',
}: DropZoneProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [error, setError] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const maxBytes = maxSizeMB * 1024 * 1024;

  const processFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    const oversized = fileArray.filter((f) => f.size > maxBytes);
    if (oversized.length > 0) {
      setError(`File too large. Maximum size is ${maxSizeMB} MB.`);
      return;
    }
    setError('');
    onFiles(fileArray);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    processFiles(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="File upload drop zone"
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`drop-zone flex flex-col items-center justify-center gap-3 p-8 cursor-pointer select-none
          ${isDragging ? 'drag-over' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-blue-50/20'}
        `}
      >
        <div className="flex size-12 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB] border border-blue-100">
          <Upload className="size-6" aria-hidden="true" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-[#0F172A]">
            Drop files here or <span className="text-[#2563EB]">browse</span>
          </p>
          <p className="mt-1 text-xs text-[#64748B]">
            {hint || `Maximum file size: ${maxSizeMB} MB`}
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={handleChange}
          disabled={disabled}
          aria-hidden="true"
        />
      </div>
      {error && (
        <p className="mt-2 text-xs text-[#DC2626] flex items-center gap-1" role="alert">
          <X className="size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── File List Item ────────────────────────────────────────────────────────────

interface FileListItemProps {
  file: File;
  onRemove?: () => void;
  status?: 'pending' | 'processing' | 'success' | 'error';
  statusMessage?: string;
}

export function FileListItem({ file, onRemove, status = 'pending', statusMessage }: FileListItemProps) {
  const statusColors = {
    pending: 'text-[#64748B]',
    processing: 'text-[#2563EB]',
    success: 'text-[#16A34A]',
    error: 'text-[#DC2626]',
  };

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-lg">
      <FileType className="size-5 shrink-0 text-[#64748B]" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#0F172A] truncate">{file.name}</p>
        <p className={`text-xs ${statusColors[status]}`}>
          {statusMessage || formatBytes(file.size)}
        </p>
      </div>
      {status === 'processing' && (
        <svg className="animate-spin size-4 text-[#2563EB]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {onRemove && status !== 'processing' && (
        <button
          onClick={onRemove}
          className="p-1 rounded hover:bg-slate-200 text-[#64748B] hover:text-[#0F172A] transition-colors"
          aria-label={`Remove ${file.name}`}
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

// ─── Progress Bar ────────────────────────────────────────────────────────────

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  className?: string;
}

export function ProgressBar({ value, label, className = '' }: ProgressBarProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <div className="flex justify-between text-xs text-[#64748B]">
          <span>{label}</span>
          <span>{Math.round(value)}%</span>
        </div>
      )}
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="h-full bg-[#2563EB] rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

// ─── File Upload Zone (Generic Wrapper) ───────────────────────────────────────

export interface FileUploadZoneProps {
  onFilesSelect: (files: File[]) => void;
  accept?: Record<string, string[]> | string;
  multiple?: boolean;
  maxSizeMB?: number;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function FileUploadZone({
  onFilesSelect,
  accept,
  multiple = false,
  maxSizeMB = 100,
  label = 'Drop files here or click to browse',
  description,
  disabled = false,
  className = '',
}: FileUploadZoneProps) {
  let acceptStr: string | undefined;
  if (typeof accept === 'string') {
    acceptStr = accept;
  } else if (accept && typeof accept === 'object') {
    acceptStr = Object.values(accept).flat().join(',');
  }

  return (
    <DropZone
      onFiles={onFilesSelect}
      accept={acceptStr}
      multiple={multiple}
      maxSizeMB={maxSizeMB}
      hint={description}
      disabled={disabled}
      className={className}
    />
  );
}
