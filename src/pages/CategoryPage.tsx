import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CATEGORIES, getToolsByCategory } from '../data/tools';
import { ToolCard, EmptyState } from '../components/ui/Cards';
import type { Tool, ToolCategory_ } from '../types';
import * as Icons from 'lucide-react';

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

  return (
    <div className="min-h-screen">
      {/* Category Header */}
      <div className={`${category.bgColor.replace('/10', '/5')} border-b border-gray-200`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <Link
            to="/tools"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
          >
            <ArrowLeft className="size-4" />
            All Tools
          </Link>

          <div className="flex items-center gap-4">
            <div className={`flex size-14 items-center justify-center rounded-2xl ${category.bgColor}`}>
              <IconComponent className={`size-7 ${category.textColor}`} aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-gray-900">{category.name}</h1>
                <span className="text-sm font-medium text-gray-400">{liveTools.length} tools</span>
              </div>
              <p className="mt-1 text-sm text-gray-500 max-w-xl">{category.description}</p>
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
            action={<Link to="/tools" className="px-4 py-2 text-sm font-semibold bg-brand-500 text-white rounded-lg hover:bg-brand-600">Browse All Tools</Link>}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}

        {/* Helpful context */}
        <div className="mt-10 p-5 bg-gray-50 rounded-2xl border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-2">About {category.name}</h2>
          <p className="text-sm text-gray-500 leading-relaxed">{category.description}</p>
          <p className="mt-3 text-sm text-gray-500">
            All {category.name} tools process your data locally in your browser.
            Files are never uploaded to a server unless explicitly stated on the tool page.
          </p>
        </div>
      </div>
    </div>
  );
}
