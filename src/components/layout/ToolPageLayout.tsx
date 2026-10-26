import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ToolCard, PrivacyNotice } from '../ui/Cards';
import { getRelatedTools } from '../../data/tools';
import type { Tool } from '../../types';
import { CATEGORIES } from '../../data/tools';
import * as Icons from 'lucide-react';

// ─── Tool Page Layout ──────────────────────────────────────────────────────────

interface ToolPageLayoutProps {
  tool: Tool;
  children: React.ReactNode;
  privacyMessage?: string;
  showPrivacyNote?: boolean;
}

export function ToolPageLayout({ tool, children, privacyMessage, showPrivacyNote = true }: ToolPageLayoutProps) {
  const related = getRelatedTools(tool.id);
  const category = CATEGORIES.find((c) => c.id === tool.category);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (Icons as any)[tool.icon] || Icons.Wrench;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#64748B]">
          <Link to="/" className="hover:text-[#2563EB] transition-colors">Home</Link>
          <ChevronRight className="size-3" aria-hidden="true" />
          <Link to="/tools" className="hover:text-[#2563EB] transition-colors">Tools</Link>
          <ChevronRight className="size-3" aria-hidden="true" />
          {category && (
            <>
              <Link to={`/category/${category.id}`} className="hover:text-[#2563EB] transition-colors">{category.name}</Link>
              <ChevronRight className="size-3" aria-hidden="true" />
            </>
          )}
          <span className="text-[#0F172A] font-semibold truncate">{tool.name}</span>
        </nav>
      </div>

      {/* Tool Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-start gap-4">
          <div className={`flex shrink-0 size-12 items-center justify-center rounded-xl ${category?.bgColor || 'bg-blue-50'} border border-[#E2E8F0]`}>
            <IconComponent className={`size-6 ${category?.textColor || 'text-[#2563EB]'}`} aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-[#0F172A]">{tool.name}</h1>
              {tool.status === 'beta' && <span className="badge-beta">Beta</span>}
              {tool.isNew && <span className="badge-new">New</span>}
            </div>
            <p className="mt-1 text-sm text-[#475569]">{tool.description}</p>
          </div>
        </div>

        {/* Privacy Notice */}
        {showPrivacyNote && (
          <div className="mt-4">
            <PrivacyNotice message={privacyMessage} />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-6 sm:p-8">
          {children}
        </div>

        {/* Related Tools */}
        {related.length > 0 && (
          <div className="mt-8">
            <h2 className="text-base font-bold text-[#0F172A] mb-4">Related Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {related.map((t) => (
                <ToolCard key={t.id} tool={t} compact />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
