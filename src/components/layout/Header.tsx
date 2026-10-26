import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Search, X, Menu, ChevronDown, User, LogOut,
  Image, FileText, FileEdit, GraduationCap, Briefcase,
  Code2, Play, ShieldCheck, QrCode, Grid3X3, Sparkles
} from 'lucide-react';
import { TOOLS } from '../../data/tools';
import { searchTools } from '../../utils/search';
import { debounce } from '../../utils/file';
import { useAuth } from '../../context/AuthContext';

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
          <circle cx="16" cy="16" r="15" fill="#2563EB" />
          <path d="M9 10h14l-10 12h10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span className={`font-black tracking-tight text-[#0F172A] ${sizes[size]}`}>
          Zenvio <span className="text-[#2563EB]">FXO</span>
        </span>
        {size !== 'sm' && (
          <span className="text-[10px] font-medium text-[#64748B] tracking-wider uppercase">
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#94A3B8] pointer-events-none" aria-hidden="true" />
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
          className="w-full pl-9 pr-9 py-2 text-sm border border-[#E2E8F0] rounded-xl bg-white text-[#0F172A]
            focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]
            placeholder-[#94A3B8] transition-all shadow-sm"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569]"
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
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E2E8F0] rounded-xl shadow-modal z-50 overflow-hidden"
        >
          {results.map(({ tool }) => (
            <button
              key={tool.id}
              role="option"
              aria-selected={false}
              onClick={() => handleSelect(tool.slug)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#EFF6FF] transition-colors text-left"
            >
              <Search className="size-3.5 text-[#94A3B8] shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0F172A] truncate">{tool.name}</p>
                <p className="text-xs text-[#64748B] truncate">{tool.description}</p>
              </div>
              <span className="text-xs text-[#94A3B8] shrink-0 capitalize">{tool.category.replace('kit', ' Kit')}</span>
            </button>
          ))}
          <Link
            to={`/tools?q=${encodeURIComponent(query)}`}
            className="flex items-center justify-center gap-2 py-2.5 border-t border-[#E2E8F0]
              text-xs font-semibold text-[#2563EB] hover:bg-[#EFF6FF] transition-colors"
            onClick={() => setIsOpen(false)}
          >
            View all results for "{query}"
          </Link>
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E2E8F0] rounded-xl shadow-modal z-50 p-4 text-center">
          <p className="text-sm text-[#64748B]">No tools found for "<strong className="text-[#0F172A]">{query}</strong>"</p>
        </div>
      )}
    </div>
  );
}

// ─── Nav Category Items ────────────────────────────────────────────────────────

const NAV_CATEGORIES = [
  { id: 'aikit',      label: 'AI Tools',   icon: Sparkles,       path: '/category/aikit' },
  { id: 'qrkit',      label: 'QRKit',      icon: QrCode,         path: '/category/qrkit' },
  { id: 'imagekit',   label: 'ImageKit',   icon: Image,          path: '/category/imagekit' },
  { id: 'pdfkit',     label: 'PDFKit',     icon: FileText,       path: '/category/pdfkit' },
  { id: 'dockit',     label: 'DocKit',     icon: FileEdit,       path: '/category/dockit' },
  { id: 'studentkit', label: 'StudentKit', icon: GraduationCap,  path: '/category/studentkit' },
  { id: 'careerkit',  label: 'CareerKit',  icon: Briefcase,      path: '/category/careerkit' },
  { id: 'devkit',     label: 'DevKit',     icon: Code2,          path: '/category/devkit' },
  { id: 'mediakit',   label: 'MediaKit',   icon: Play,           path: '/category/mediakit' },
  { id: 'privacykit', label: 'PrivacyKit', icon: ShieldCheck,    path: '/category/privacykit' },
];

// ─── Main Header ──────────────────────────────────────────────────────────────

export function Header() {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [categoriesOpen, setCategoriesOpen] = React.useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4 h-14">
            {/* Logo */}
            <Logo size="sm" />

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1.5 ml-4" aria-label="Main navigation">
              <NavLink
                to="/tools"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-semibold transition-all
                  ${isActive
                    ? 'bg-[#EFF6FF] text-[#2563EB] border border-blue-200/60 shadow-xs'
                    : 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-100'}`
                }
              >
                All Tools
              </NavLink>

              <NavLink
                to="/category/aikit"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5
                  ${isActive
                    ? 'bg-[#EFF6FF] text-[#2563EB] border border-blue-200/60 shadow-xs'
                    : 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-100'}`
                }
              >
                <Sparkles className="size-3.5 text-[#2563EB]" />
                AI Tools
              </NavLink>

              <NavLink
                to="/tools/qr-studio"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5
                  ${isActive
                    ? 'bg-[#EFF6FF] text-[#2563EB] border border-blue-200/60 shadow-xs'
                    : 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-100'}`
                }
              >
                <QrCode className="size-3.5 text-[#2563EB]" />
                QR Studio
              </NavLink>

              {/* Categories Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                  onBlur={() => setTimeout(() => setCategoriesOpen(false), 200)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
                  aria-expanded={categoriesOpen}
                  aria-haspopup="menu"
                >
                  Categories <ChevronDown className={`size-3.5 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
                </button>

                {categoriesOpen && (
                  <div
                    role="menu"
                    className="absolute top-full left-0 mt-1 w-56 bg-white border border-[#E2E8F0] rounded-xl shadow-modal py-1.5 z-50"
                  >
                    {NAV_CATEGORIES.map(({ id, label, icon: Icon, path }) => (
                      <NavLink
                        key={id}
                        to={path}
                        role="menuitem"
                        onClick={() => setCategoriesOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3.5 py-2 text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold'
                              : 'text-[#475569] hover:bg-[#EFF6FF] hover:text-[#2563EB]'
                          }`
                        }
                      >
                        <Icon className="size-4 shrink-0" aria-hidden="true" />
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
              className="md:hidden ml-auto p-2 rounded-lg text-[#64748B] hover:bg-slate-100 transition-colors"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              aria-label="Toggle search"
            >
              <Search className="size-5" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-[#64748B] hover:bg-slate-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>

            {/* Auth (Desktop) */}
            <div className="hidden md:flex items-center gap-2">
              <AuthHeaderItem user={user} onSignOut={signOut} />
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
          <div className="md:hidden border-t border-[#E2E8F0] bg-white">
            <nav className="max-w-7xl mx-auto px-4 py-4" aria-label="Mobile navigation">
              <Link
                to="/tools"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold text-[#0F172A] hover:bg-[#EFF6FF] hover:text-[#2563EB]"
              >
                <Grid3X3 className="size-5" />
                All Tools
              </Link>
              <div className="mt-2 space-y-1">
                <p className="px-3 py-1 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Categories</p>
                {NAV_CATEGORIES.map(({ id, label, icon: Icon, path }) => (
                  <Link
                    key={id}
                    to={path}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[#475569] hover:bg-[#EFF6FF] hover:text-[#2563EB]"
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {label}
                  </Link>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-[#E2E8F0] flex flex-col gap-2">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                      <User className="size-4 text-[#2563EB]" />
                      <span className="text-sm font-semibold text-[#0F172A] truncate">
                        {user.displayName || user.email}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        signOut();
                        setMobileOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-[#DC2626] border border-red-200 rounded-lg hover:bg-red-50"
                    >
                      <LogOut className="size-4" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <>
                    <Link
                      to="/auth/sign-in"
                      onClick={() => setMobileOpen(false)}
                      className="w-full px-4 py-2 text-sm font-semibold text-center text-[#475569] border border-[#E2E8F0] rounded-lg hover:bg-slate-50"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/auth/sign-up"
                      onClick={() => setMobileOpen(false)}
                      className="w-full px-4 py-2 text-sm font-semibold text-center text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8]"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
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
  user: { email: string | null; displayName?: string | null; photoURL?: string | null } | null;
  onSignOut: () => void;
}

export function AuthHeaderItem({ user, onSignOut }: AuthHeaderItemProps) {
  const [open, setOpen] = React.useState(false);

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link to="/auth/sign-in" className="px-3.5 py-1.5 text-sm font-semibold text-[#475569] hover:text-[#0F172A] transition-colors">
          Sign In
        </Link>
        <Link to="/auth/sign-up" className="px-4 py-1.5 text-sm font-semibold bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] transition-colors shadow-sm">
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
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.displayName || 'User'} className="size-6 rounded-full border border-blue-200 object-cover" />
        ) : (
          <div className="size-6 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center text-xs font-bold">
            {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-sm font-semibold text-[#0F172A] max-w-[120px] truncate">
          {user.displayName || user.email}
        </span>
        <ChevronDown className={`size-3.5 text-[#64748B] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#E2E8F0] rounded-xl shadow-modal py-1 z-50">
          <button
            role="menuitem"
            onClick={onSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#DC2626] hover:bg-red-50 transition-colors"
          >
            <LogOut className="size-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
