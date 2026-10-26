import React from 'react';
import { Link } from 'react-router-dom';
import type { Tool } from '../../types';
import { CATEGORIES } from '../../data/tools';
import * as Icons from 'lucide-react';

// ─── Tool Card ────────────────────────────────────────────────────────────────

interface ToolCardProps {
  tool: Tool;
  compact?: boolean;
}

export function ToolCard({ tool, compact = false }: ToolCardProps) {
  const category = CATEGORIES.find((c) => c.id === tool.category);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (Icons as any)[tool.icon] || Icons.Wrench;

  return (
    <Link
      to={`/tools/${tool.slug}`}
      className="tool-card group block"
      aria-label={`${tool.name} — ${tool.description}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex shrink-0 items-center justify-center rounded-lg
            ${compact ? 'size-8' : 'size-10'}
            ${category?.bgColor || 'bg-gray-100'}`}
        >
          <IconComponent
            className={`${compact ? 'size-4' : 'size-5'} ${category?.textColor || 'text-gray-600'}`}
            aria-hidden="true"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-semibold text-gray-900 group-hover:text-brand-700 transition-colors ${compact ? 'text-sm' : 'text-sm'}`}>
              {tool.name}
            </h3>
            {tool.isNew && (
              <span className="badge-new" aria-label="New tool">New</span>
            )}
            {tool.status === 'beta' && (
              <span className="badge-beta" aria-label="Beta tool">Beta</span>
            )}
          </div>
          {!compact && (
            <p className="mt-1 text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {tool.description}
            </p>
          )}
        </div>
      </div>

      {!compact && category && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className={`text-xs font-medium ${category.textColor}`}>{category.name}</span>
        </div>
      )}
    </Link>
  );
}

// ─── Category Card ────────────────────────────────────────────────────────────

interface CategoryCardProps {
  categoryId: string;
  toolCount: number;
}

export function CategoryCard({ categoryId, toolCount }: CategoryCardProps) {
  const category = CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (Icons as any)[category.icon] || Icons.Grid;

  return (
    <Link
      to={`/category/${categoryId}`}
      className="group block p-5 bg-white border border-gray-200 rounded-xl shadow-card
        hover:shadow-card-hover hover:border-gray-300 transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`flex size-10 items-center justify-center rounded-lg ${category.bgColor}`}>
          <IconComponent className={`size-5 ${category.textColor}`} aria-hidden="true" />
        </div>
        <span className="text-xs font-medium text-gray-400">{toolCount} tools</span>
      </div>
      <h3 className="font-bold text-gray-900 group-hover:text-brand-700 transition-colors">
        {category.name}
      </h3>
      <p className="mt-1 text-xs text-gray-500 line-clamp-2">{category.description}</p>
      <div className="mt-3 flex items-center gap-1 text-xs font-medium text-brand-600">
        Explore <Icons.ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

// ─── Privacy Notice ────────────────────────────────────────────────────────────

interface PrivacyNoticeProps {
  message?: string;
}

export function PrivacyNotice({ message }: PrivacyNoticeProps) {
  return (
    <div className="privacy-note" role="note">
      <Icons.ShieldCheck className="size-4 shrink-0 text-emerald-600 mt-0.5" aria-hidden="true" />
      <span>
        {message || 'Your files are processed entirely in your browser. Nothing is uploaded to any server.'}
      </span>
    </div>
  );
}

// ─── Section Header ────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, description, action }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon = Icons.SearchX, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-gray-100 mb-4">
        <Icon className="size-8 text-gray-400" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-gray-700">{title}</h3>
      {description && <p className="mt-2 text-sm text-gray-500 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ─── Skeleton Card ─────────────────────────────────────────────────────────────

export function SkeletonCard() {
  return (
    <div className="p-5 bg-white border border-gray-200 rounded-xl" aria-hidden="true">
      <div className="flex items-center gap-3">
        <div className="skeleton size-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-2/3 rounded" />
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-4/5 rounded" />
        </div>
      </div>
    </div>
  );
}

// ─── Copy Button ──────────────────────────────────────────────────────────────

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently fail
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
        transition-colors border
        ${copied
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}
        ${className}`}
      aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? (
        <><Icons.Check className="size-3.5" />Copied!</>
      ) : (
        <><Icons.Copy className="size-3.5" />Copy</>
      )}
    </button>
  );
}
