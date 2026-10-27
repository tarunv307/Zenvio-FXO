import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CATEGORIES, getToolsByCategory } from '../data/tools';
import { ToolCard, EmptyState } from '../components/ui/Cards';
import type { Tool, ToolCategory_ } from '../types';
import * as Icons from 'lucide-react';
import { SEO } from '../components/common/SEO';

export function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = CATEGORIES.find((c) => c.id === categoryId);

  if (!category) {
    return <Navigate to="/tools" replace />;
  }

  const tools = getToolsByCategory(category.id).filter((t) => t.status !== 'coming-soon');
  const liveTools = tools.filter((t) => t.status === 'live');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (Icons as any)[category.icon] || Icons.Grid;

  const categorySchema = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${category.name} – Free ${category.label} | Zenvio FXO`,
      description: `${category.description} Free, browser-based, no sign-up required on Zenvio FXO.`,
      url: `https://zenvio-fxo.vercel.app/category/${category.id}`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://zenvio-fxo.vercel.app/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Tools',
          item: 'https://zenvio-fxo.vercel.app/tools',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: category.name,
          item: `https://zenvio-fxo.vercel.app/category/${category.id}`,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SEO
        title={`${category.name} – Free ${category.label} | Zenvio FXO`}
        description={`${category.description} Free, browser-based, no sign-up required on Zenvio FXO.`}
        canonicalPath={`/category/${category.id}`}
        jsonLd={categorySchema}
      />
      {/* Category Header */}
      <div className="bg-[#EFF6FF] border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <Link
            to="/tools"
            className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#0F172A] mb-6 transition-colors"
          >
            <ArrowLeft className="size-4" />
            All Tools
          </Link>

          <div className="flex items-center gap-4">
            <div className={`flex size-14 items-center justify-center rounded-2xl ${category.bgColor} border border-[#E2E8F0]`}>
              <IconComponent className={`size-7 ${category.textColor}`} aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-[#0F172A]">{category.name}</h1>
                <span className="text-sm font-medium text-[#64748B]">{liveTools.length} tools</span>
              </div>
              <p className="mt-1 text-sm text-[#475569] max-w-xl">{category.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tools */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {liveTools.length === 0 ? (
          <EmptyState
            title="No tools yet"
            description="Tools are being added to this category. Check back soon."
            action={<Link to="/tools" className="px-4 py-2 text-sm font-semibold bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] transition-colors shadow-sm">Browse All Tools</Link>}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}

        {/* Helpful context */}
        <div className="mt-10 p-6 bg-white rounded-2xl border border-[#E2E8F0] shadow-card">
          <h2 className="font-bold text-[#0F172A] mb-2">About {category.name}</h2>
          <p className="text-sm text-[#475569] leading-relaxed">{category.description}</p>
          <p className="mt-3 text-sm text-[#475569]">
            All {category.name} tools process your data locally in your browser.
            Files are never uploaded to a server unless explicitly stated on the tool page.
          </p>
        </div>
      </div>
    </div>
  );
}
