import React from 'react';

// ─── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] active:bg-[#1D4ED8] shadow-sm',
    secondary: 'bg-slate-100 text-[#0F172A] hover:bg-slate-200 active:bg-slate-300',
    ghost: 'text-[#475569] hover:bg-slate-100 hover:text-[#0F172A]',
    danger: 'bg-[#DC2626] text-white hover:bg-red-700',
    outline: 'border border-[#E2E8F0] text-[#475569] hover:border-slate-300 hover:text-[#0F172A] hover:bg-slate-50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#0F172A]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-[#0F172A] placeholder-[#64748B] transition-colors
          focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent
          ${error ? 'border-[#DC2626] focus:ring-[#DC2626]' : 'border-[#E2E8F0]'}
          ${className}`}
        {...props}
      />
      {hint && !error && <p className="text-xs text-[#64748B]">{hint}</p>}
      {error && <p className="text-xs text-[#DC2626]" role="alert">{error}</p>}
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className = '', id, ...props }: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-[#0F172A]">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-[#0F172A] placeholder-[#64748B]
          transition-colors resize-y min-h-[120px]
          focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent
          ${error ? 'border-[#DC2626] focus:ring-[#DC2626]' : 'border-[#E2E8F0]'}
          ${className}`}
        {...props}
      />
      {hint && !error && <p className="text-xs text-[#64748B]">{hint}</p>}
      {error && <p className="text-xs text-[#DC2626]" role="alert">{error}</p>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = '', id, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-[#0F172A]">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-[#0F172A]
          focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent
          ${error ? 'border-[#DC2626]' : 'border-[#E2E8F0]'}
          ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-[#DC2626]" role="alert">{error}</p>}
    </div>
  );
}

// ─── Checkbox ────────────────────────────────────────────────────────────────

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export function Checkbox({ label, id, className = '', ...props }: CheckboxProps) {
  const checkId = id || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <label htmlFor={checkId} className={`flex items-center gap-2 cursor-pointer text-sm text-[#475569] ${className}`}>
      <input
        type="checkbox"
        id={checkId}
        className="w-4 h-4 text-[#2563EB] border-[#E2E8F0] rounded focus:ring-[#2563EB]"
        {...props}
      />
      {label}
    </label>
  );
}

// ─── Range Slider ────────────────────────────────────────────────────────────

interface RangeProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  valueLabel?: string;
}

export function RangeSlider({ label, valueLabel, className = '', id, ...props }: RangeProps) {
  const rangeId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {(label || valueLabel) && (
        <div className="flex justify-between items-center">
          {label && <label htmlFor={rangeId} className="text-sm font-medium text-[#0F172A]">{label}</label>}
          {valueLabel && <span className="text-sm font-semibold text-[#2563EB]">{valueLabel}</span>}
        </div>
      )}
      <input
        type="range"
        id={rangeId}
        className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2563EB] ${className}`}
        {...props}
      />
    </div>
  );
}
