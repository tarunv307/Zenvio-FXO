import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Filter, SortAsc } from 'lucide-react';
import { TOOLS, CATEGORIES } from '../data/tools';
import { searchTools, filterByCategory, sortAlphabetically } from '../utils/search';
import { ToolCard, EmptyState } from '../components/ui/Cards';
import type { Tool } from '../types';

const TOOLS_PER_PAGE = 24;

export function AllToolsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = React.useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = React.useState(searchParams.get('category') || '');
  const [sortOrder, setSortOrder] = React.useState<'default' | 'alpha'>('default');
  const [page, setPage] = React.useState(1);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Compute filtered results
  const filtered = React.useMemo((): Tool[] => {
    let results: Tool[] = TOOLS.filter((t) => t.status !== 'coming-soon');

    if (query.trim().length >= 2) {
      results = searchTools(query, results).map((r) => r.tool);
    }

    if (selectedCategory) {
      results = filterByCategory(results, selectedCategory);
    }

    if (sortOrder === 'alpha') {
      results = sortAlphabetically(results);
    }

    return results;
  }, [query, selectedCategory, sortOrder]);

  const totalPages = Math.ceil(filtered.length / TOOLS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * TOOLS_PER_PAGE, page * TOOLS_PER_PAGE);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setPage(1);
    const params = new URLSearchParams(searchParams);
    if (e.target.value) params.set('q', e.target.value);
    else params.delete('q');
    setSearchParams(params, { replace: true });
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setPage(1);
    const params = new URLSearchParams(searchParams);
    if (cat) params.set('category', cat);
    else params.delete('category');
    setSearchParams(params, { replace: true });
  };

  const handleClearAll = () => {
    setQuery('');
    setSelectedCategory('');
    setSortOrder('default');
    setPage(1);
    setSearchParams({}, { replace: true });
    inputRef.current?.focus();
  };

  const hasFilters = query || selectedCategory || sortOrder !== 'default';

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl font-bold text-gray-900">All Tools</h1>
          <p className="mt-1 text-sm text-gray-500">
            {TOOLS.filter((t) => t.status === 'live').length} free browser-based tools — search, filter, and get things done.
          </p>

          {/* Search & Filters */}
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" aria-hidden="true" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={handleQueryChange}
                placeholder="Search tools…"
                aria-label="Search tools"
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-xl bg-white
                  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-gray-400 shrink-0" aria-hidden="true" />
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                aria-label="Filter by category"
                className="pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-xl bg-white
                  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <SortAsc className="size-4 text-gray-400 shrink-0" aria-hidden="true" />
              <select
                value={sortOrder}
                onChange={(e) => { setSortOrder(e.target.value as 'default' | 'alpha'); setPage(1); }}
                aria-label="Sort tools"
                className="pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-xl bg-white
                  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="default">Default order</option>
                <option value="alpha">Alphabetical</option>
              </select>
            </div>

            {/* Clear Filters */}
            {hasFilters && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
              >
                <X className="size-4" />
                Clear filters
              </button>
            )}
          </div>

          {/* Results count */}
          <p className="mt-3 text-xs text-gray-500">
            Showing {filtered.length === 0 ? 0 : `${(page - 1) * TOOLS_PER_PAGE + 1}–${Math.min(page * TOOLS_PER_PAGE, filtered.length)}`} of{' '}
            <strong>{filtered.length}</strong> {filtered.length === 1 ? 'tool' : 'tools'}
            {hasFilters ? ' (filtered)' : ''}
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Category filters">
            <button
              onClick={() => handleCategoryChange('')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border
                ${!selectedCategory
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600'
                }`}
              aria-pressed={!selectedCategory}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(selectedCategory === cat.id ? '' : cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border
                  ${selectedCategory === cat.id
                    ? 'bg-brand-500 text-white border-brand-500'
                    : 'border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600'
                  }`}
                aria-pressed={selectedCategory === cat.id}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {paginated.length === 0 ? (
          <EmptyState
            title="No tools found"
            description={`No tools match "${query}". Try a different search term or clear filters.`}
            action={
              <button onClick={handleClearAll} className="px-4 py-2 text-sm font-semibold bg-brand-500 text-white rounded-lg hover:bg-brand-600">
                Clear filters
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2" role="navigation" aria-label="Pagination">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
              aria-label="Previous page"
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors
                  ${p === page ? 'bg-brand-500 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
                aria-label={`Page ${p}`}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
              aria-label="Next page"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
