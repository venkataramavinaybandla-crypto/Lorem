import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchCurriculum } from '../utils/search';
import type { SearchResult } from '../utils/search';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }
    const found = searchCurriculum(query);
    setResults(found);
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation inside search list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  const handleSelect = (item: SearchResult) => {
    onClose();
    navigate(`/co/${item.coId}#${item.concept.id}`);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search Curriculum"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#fdfcff] rounded-3xl border border-white/80 shadow-[0_20px_60px_rgba(159,65,34,0.12)] overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#89726b]/10 bg-white/60">
          <span className="material-symbols-outlined text-[#9f4122] text-[22px]">
            search
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search concepts, tokens, formulas, code, or ELI5 text..."
            className="flex-1 bg-transparent border-none text-[#1d1c15] placeholder-[#89726b]/60 text-sm focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-[#f3effb] text-[#89726b] hover:text-[#1d1c15] border border-[#ddc0b8]"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-3 space-y-1">
          {query.trim() === '' ? (
            <div className="py-12 text-center space-y-2">
              <span className="material-symbols-outlined text-[32px] text-[#89726b]/40">
                manage_search
              </span>
              <p className="text-xs text-[#89726b]">
                Type keywords like <span className="font-mono text-[#9f4122]">softmax</span>, <span className="font-mono text-[#9f4122]">PEFT</span>, <span className="font-mono text-[#9f4122]">attention</span>, or <span className="font-mono text-[#9f4122]">RAG</span>.
              </p>
              <div className="text-[10px] text-[#89726b]/60 font-mono">
                Press ↑ / ↓ to navigate, Enter to jump, Esc to close
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <span className="material-symbols-outlined text-[32px] text-[#89726b]/40">
                search_off
              </span>
              <p className="text-xs font-semibold text-[#1d1c15]">No matching content found</p>
              <p className="text-[11px] text-[#89726b]">
                No syllabus topics or code snippets matched "{query}".
              </p>
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={`${item.coId}-${item.concept.id}-${idx}`}
                  type="button"
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer flex flex-col gap-1 border ${
                    isSelected
                      ? 'bg-[#ff8a65]/15 border-[#ff8a65]/40 text-[#1d1c15] shadow-sm'
                      : 'border-transparent hover:bg-white/60 text-[#56423c]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#9f4122]/10 text-[#9f4122]">
                        {item.coId}
                      </span>
                      <span className="text-xs font-bold text-[#1d1c15] truncate">
                        {item.concept.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#89726b] shrink-0">
                      Part {item.partOrder}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#56423c] leading-relaxed line-clamp-2 pl-1">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#9f4122] mr-1.5 font-bold">
                      [{item.matchType}]
                    </span>
                    {item.snippet}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        {results.length > 0 && (
          <div className="px-5 py-2.5 border-t border-[#89726b]/10 bg-[#f3effb]/50 flex items-center justify-between text-[11px] text-[#89726b] font-mono">
            <span>{results.length} {results.length === 1 ? 'match' : 'matches'} found</span>
            <span>Use ↑↓ to navigate · ↵ to select</span>
          </div>
        )}
      </div>
    </div>
  );
}
