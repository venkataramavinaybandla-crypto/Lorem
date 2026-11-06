import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { allCOs } from '../content';
import { coTitles } from '../coTitles';
import { useState, useEffect } from 'react';
import SearchModal from './SearchModal';
import LogoMark from './LogoMark';
import { useProgress } from '../utils/useProgress';

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { getCOProgress } = useProgress();

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#f3effb] text-[#1d1c15] font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Global Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Floating Pill Top Navigation */}
      <nav className="fixed top-5 left-1/2 -translate-x-1/2 w-[94%] max-w-7xl rounded-full border border-white/80 bg-[#fdfcff]/75 backdrop-blur-2xl shadow-[0_8px_32px_rgba(159,65,34,0.05)] z-40 flex justify-between items-center py-2.5 px-6">
        <Link
          to="/"
          className="flex items-center gap-2.5 no-underline focus-visible:outline-2 focus-visible:outline-[#9f4122] rounded-full"
        >
          <LogoMark size={38} />
          <span className="font-extrabold text-xl tracking-tight text-[#1d1c15]">Lorem</span>
        </Link>

        {/* Center Search Pill + Desktop Links */}
        <div className="flex items-center gap-2">
          {/* Quick Search Button */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 bg-white/70 hover:bg-white text-[#56423c] border border-white/80 px-3.5 py-1.5 rounded-full text-xs font-medium shadow-sm transition-all hover:scale-[1.02] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#9f4122]"
            aria-label="Search syllabus (Ctrl+K)"
          >
            <span className="material-symbols-outlined text-[16px] text-[#9f4122]">
              search
            </span>
            <span className="hidden md:inline">Search curriculum...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[#f3effb] text-[#89726b] rounded border border-[#ddc0b8]">
              ⌘K
            </kbd>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 bg-[#fff9ee]/70 border border-white/60 rounded-full px-2 py-1 shadow-inner">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all focus-visible:outline-2 focus-visible:outline-[#9f4122] ${
                  isActive
                    ? 'bg-white text-[#9f4122] shadow-sm'
                    : 'text-[#56423c] hover:text-[#9f4122]'
                }`
              }
            >
              Overview
            </NavLink>
            {allCOs.map((co) => (
              <NavLink
                key={co.id}
                to={`/co/${co.id}`}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-full text-xs font-semibold transition-all focus-visible:outline-2 focus-visible:outline-[#9f4122] ${
                    isActive
                      ? 'bg-white text-[#9f4122] shadow-sm'
                      : 'text-[#56423c] hover:text-[#9f4122]'
                  }`
                }
              >
                {co.id}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/co/CO1"
            className="hidden sm:inline-flex items-center gap-1.5 bg-[#9f4122] text-white font-semibold text-xs px-5 py-2 rounded-full shadow-[0_4px_16px_rgba(159,65,34,0.25)] hover:bg-[#85341a] transition-all hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-[#9f4122]"
          >
            <span>Start Learning</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            className="lg:hidden p-2 rounded-full hover:bg-white/80 text-[#1d1c15] transition-colors focus-visible:outline-2 focus-visible:outline-[#9f4122]"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-[22px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-label="Mobile Navigation"
          className="fixed inset-x-4 top-20 z-50 bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-2xl p-5 lg:hidden space-y-2"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#89726b]/10">
            <span className="text-xs font-bold text-[#1d1c15]">Navigation</span>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setSearchOpen(true);
              }}
              className="flex items-center gap-1.5 text-xs text-[#9f4122] font-semibold"
            >
              <span className="material-symbols-outlined text-[16px]">search</span>
              <span>Search</span>
            </button>
          </div>

          <NavLink
            to="/"
            end
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-2xl text-sm font-semibold text-[#1d1c15] hover:bg-[#fff9ee]"
          >
            Overview Home
          </NavLink>

          <div className="pt-2 pb-1 px-4 text-[11px] font-bold text-[#89726b] uppercase tracking-wider">
            Course Outcomes
          </div>

          {allCOs.map((co) => {
            const conceptIds = co.parts.flatMap((p) => p.concepts.map((c) => c.id));
            const prog = getCOProgress(conceptIds);

            return (
              <NavLink
                key={co.id}
                to={`/co/${co.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-medium text-[#56423c] hover:bg-[#fff9ee] hover:text-[#9f4122]"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#9f4122]">{co.id}</span>
                  <span className="text-xs text-[#89726b] truncate max-w-[160px]">
                    {coTitles[co.id] ?? co.title}
                  </span>
                </div>
                {prog.total > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f3effb] text-[#9f4122] font-bold">
                    {prog.percentage}%
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      )}

      {/* Page Content Body */}
      {isHomePage ? (
        <div className="pt-24 pb-16">
          <Outlet />
        </div>
      ) : (
        <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar for CO navigation with progress display */}
            <aside className="lg:w-64 shrink-0">
              <div className="sticky top-28 bg-[#fdfcff]/70 backdrop-blur-xl border border-white/80 rounded-3xl p-4 shadow-[0_8px_32px_rgba(159,65,34,0.03)] space-y-1">
                <div className="px-3 py-2 text-[11px] font-bold text-[#89726b] uppercase tracking-widest flex items-center justify-between">
                  <span>Course Modules</span>
                  <span className="material-symbols-outlined text-[15px] text-[#9f4122]">
                    school
                  </span>
                </div>

                {allCOs.map((co) => {
                  const partCount = co.parts.length;
                  const partText = `${partCount} ${partCount === 1 ? 'part' : 'parts'}`;
                  const conceptIds = co.parts.flatMap((p) => p.concepts.map((c) => c.id));
                  const prog = getCOProgress(conceptIds);

                  return (
                    <NavLink
                      key={co.id}
                      to={`/co/${co.id}`}
                      className={({ isActive }) =>
                        `group flex flex-col gap-1 px-3.5 py-2.5 rounded-2xl text-xs transition-all focus-visible:outline-2 focus-visible:outline-[#9f4122] ${
                          isActive
                            ? 'bg-[#9f4122] text-white shadow-md'
                            : 'text-[#56423c] hover:bg-white/80 hover:text-[#9f4122]'
                        }`
                      }
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold tracking-tight">{co.id}</span>
                        <span className="text-[10px] opacity-75 font-mono">{partText}</span>
                      </div>
                      <span className="text-[11px] truncate font-medium">
                        {coTitles[co.id] ?? co.title}
                      </span>

                      {/* Mini Progress Bar inside Sidebar */}
                      {prog.total > 0 && (
                        <div className="mt-1 space-y-0.5">
                          <div className="flex items-center justify-between text-[9px] font-mono opacity-80">
                            <span>{prog.completed}/{prog.total} completed</span>
                            <span>{prog.percentage}%</span>
                          </div>
                          <div className="h-1 w-full bg-black/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-white transition-all duration-300"
                              style={{ width: `${prog.percentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </aside>

            {/* Main content container */}
            <main className="flex-1 min-w-0">
              <Outlet />
            </main>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full py-10 border-t border-[#89726b]/15 text-[#89726b] text-xs mt-16 bg-[#f3effb]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <LogoMark size={20} />
            <span className="font-extrabold text-[#1d1c15]">Lorem</span>
            <span>· Generative AI and AI Platform Engineering (25CS2207E)</span>
          </div>
          <div>Luminous Airy Design System · CO1 through CO6</div>
        </div>
      </footer>
    </div>
  );
}
