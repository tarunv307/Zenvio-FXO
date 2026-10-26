import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Search, X, Menu, ChevronDown, User, LogOut,
  Image, FileText, FileEdit, GraduationCap, Briefcase,
  Code2, Play, ShieldCheck, QrCode, Grid3X3
} from 'lucide-react';
import { TOOLS } from '../../data/tools';
import { searchTools } from '../../utils/search';
import { debounce } from '../../utils/file';

// ─── Logo ─────────────────────────────────────────────────────────────────────

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'text-base', md: 'text-lg', lg: 'text-xl' };
  return (
    <Link to="/" className="flex items-center gap-2 group" aria-label="Zenvio FXO — Home">
      {/* Geometric Z symbol */}
      <div className="relative">
        <svg
          width={size === 'sm' ? 28 : size === 'md' ? 32 : 36}
          height={size === 'sm' ? 28 : size === 'md' ? 32 : 36}
          viewBox="0 0 32 32"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="16" cy="16" r="15" fill="#10b981" />
          <path d="M9 10h14l-10 12h10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span className={`font-black tracking-tight text-gray-900 ${sizes[size]}`}>
          Zenvio <span className="text-brand-500">FXO</span>
        </span>
        {size !== 'sm' && (
          <span className="text-[10px] font-medium text-gray-400 tracking-wider uppercase">
            Every Tool. One Platform.
          </span>
        )}
      </div>
    </Link>
  );
}

// ─── Search Bar ───────────────────────────────────────────────────────────────

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  onClose?: () => void;
}

export function SearchBar({ className = '', placeholder = 'Search tools…', onClose }: SearchBarProps) {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<ReturnType<typeof searchTools>>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = React.useCallback(
    debounce((q: string) => {
      if (q.trim().length < 2) { setResults([]); return; }
      setResults(searchTools(q, TOOLS).slice(0, 8));
    }, 150),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    setIsOpen(true);
    debouncedSearch(q);
  };

  const handleSelect = (slug: string) => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    onClose?.();
    navigate(`/tools/${slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={isOpen && results.length > 0}
          aria-label="Search tools"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white
            placeholder-gray-400 transition-all"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-modal z-50 overflow-hidden"
        >
          {results.map(({ tool }) => (
            <button
              key={tool.id}
              role="option"
              aria-selected={false}
              onClick={() => handleSelect(tool.slug)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-brand-50 transition-colors text-left"
            >
              <Search className="size-3.5 text-gray-400 shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{tool.name}</p>
                <p className="text-xs text-gray-500 truncate">{tool.description}</p>
              </div>
              <span className="text-xs text-gray-400 shrink-0 capitalize">{tool.category.replace('kit', ' Kit')}</span>
            </button>
          ))}
          <Link
            to={`/tools?q=${encodeURIComponent(query)}`}
            className="flex items-center justify-center gap-2 py-2.5 border-t border-gray-100
              text-xs font-medium text-brand-600 hover:bg-brand-50 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            View all results for "{query}"
          </Link>
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-modal z-50 p-4 text-center">
          <p className="text-sm text-gray-500">No tools found for "<strong>{query}</strong>"</p>
        </div>
      )}
    </div>
  );
}

// ─── Nav Category Items ────────────────────────────────────────────────────────

const NAV_CATEGORIES = [
  { id: 'imagekit',   label: 'ImageKit',   icon: Image,          path: '/category/imagekit' },
  { id: 'pdfkit',     label: 'PDFKit',     icon: FileText,       path: '/category/pdfkit' },
  { id: 'dockit',     label: 'DocKit',     icon: FileEdit,       path: '/category/dockit' },
  { id: 'studentkit', label: 'StudentKit', icon: GraduationCap,  path: '/category/studentkit' },
  { id: 'careerkit',  label: 'CareerKit',  icon: Briefcase,      path: '/category/careerkit' },
  { id: 'devkit',     label: 'DevKit',     icon: Code2,          path: '/category/devkit' },
  { id: 'mediakit',   label: 'MediaKit',   icon: Play,           path: '/category/mediakit' },
  { id: 'privacykit', label: 'PrivacyKit', icon: ShieldCheck,    path: '/category/privacykit' },
  { id: 'qrkit',      label: 'QRKit',      icon: QrCode,         path: '/category/qrkit' },
];

// ─── Main Header ──────────────────────────────────────────────────────────────

export function Header() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [categoriesOpen, setCategoriesOpen] = React.useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4 h-14">
            {/* Logo */}
            <Logo size="sm" />

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 ml-4" aria-label="Main navigation">
              <NavLink
                to="/tools"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors
                  ${isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
                }
              >
                All Tools
              </NavLink>

              {/* Categories Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                  onBlur={() => setTimeout(() => setCategoriesOpen(false), 200)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  aria-expanded={categoriesOpen}
                  aria-haspopup="menu"
                >
                  Categories <ChevronDown className={`size-3.5 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
                </button>

                {categoriesOpen && (
                  <div
                    role="menu"
                    className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-modal py-1 z-50"
                  >
                    {NAV_CATEGORIES.map(({ id, label, icon: Icon, path }) => (
                      <NavLink
                        key={id}
                        to={path}
                        role="menuitem"
                        onClick={() => setCategoriesOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                      >
                        <Icon className="size-4" aria-hidden="true" />
                        {label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Search — Desktop */}
            <div className="hidden md:block flex-1 max-w-sm ml-auto">
              <SearchBar />
            </div>

            {/* Mobile Search Toggle */}
            <button
              className="md:hidden ml-auto p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              aria-label="Toggle search"
            >
              <Search className="size-5" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>

            {/* Auth (Desktop) */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/auth/sign-in"
                className="px-4 py-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/auth/sign-up"
                className="px-4 py-1.5 text-sm font-semibold bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Mobile Search */}
          {mobileSearchOpen && (
            <div className="md:hidden pb-3">
              <SearchBar onClose={() => setMobileSearchOpen(false)} />
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <nav className="max-w-7xl mx-auto px-4 py-4" aria-label="Mobile navigation">
              <Link
                to="/tools"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <Grid3X3 className="size-5" />
                All Tools
              </Link>
              <div className="mt-2 space-y-1">
                <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Categories</p>
                {NAV_CATEGORIES.map(({ id, label, icon: Icon, path }) => (
                  <Link
                    key={id}
                    to={path}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700"
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {label}
                  </Link>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
                <Link
                  to="/auth/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className="w-full px-4 py-2 text-sm font-semibold text-center text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/sign-up"
                  onClick={() => setMobileOpen(false)}
                  className="w-full px-4 py-2 text-sm font-semibold text-center text-white bg-brand-500 rounded-lg hover:bg-brand-600"
                >
                  Sign Up
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

// ─── Header Auth State ──────────────────────────────────────────────────────────

interface AuthHeaderItemProps {
  user: { email: string; displayName?: string } | null;
  onSignOut: () => void;
}

export function AuthHeaderItem({ user, onSignOut }: AuthHeaderItemProps) {
  const [open, setOpen] = React.useState(false);

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link to="/auth/sign-in" className="px-4 py-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900">
          Sign In
        </Link>
        <Link to="/auth/sign-up" className="px-4 py-1.5 text-sm font-semibold bg-brand-500 text-white rounded-lg hover:bg-brand-600">
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <User className="size-4 text-gray-600" />
        <span className="text-sm font-semibold text-gray-700 max-w-[120px] truncate">
          {user.displayName || user.email}
        </span>
        <ChevronDown className={`size-3.5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-modal py-1 z-50">
          <button
            role="menuitem"
            onClick={onSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="size-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
