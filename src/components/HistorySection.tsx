import React from 'react';
import { History, Trash2, ArrowUpRight, Clock, Search, X } from 'lucide-react';
import { ConversionHistoryItem, Language } from '../types';
import { i18n } from '../utils/translations';

interface HistorySectionProps {
  history: ConversionHistoryItem[];
  onSelectHistory: (item: ConversionHistoryItem) => void;
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
  lang: Language;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function safeDecode(str: string): string {
  if (!str) return '';
  try { return decodeURIComponent(str); } catch { return str; }
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  history,
  onSelectHistory,
  onClearHistory,
  onDeleteHistoryItem,
  lang,
}) => {
  const t = i18n[lang];
  const [filter, setFilter] = React.useState('');

  if (history.length === 0) return null;

  const filtered = history.filter(
    (item) =>
      item.repo.toLowerCase().includes(filter.toLowerCase()) ||
      item.user.toLowerCase().includes(filter.toLowerCase()) ||
      item.path.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="animate-fade-up rounded-2xl border border-zinc-200 dark:border-zinc-800/80 overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-950/50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <History className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{t.historyTitle}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-200/50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
            {history.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter..."
              aria-label="Filter history"
              className="h-8 pl-8 pr-2 w-full sm:w-40 rounded-lg text-xs
                bg-white dark:bg-zinc-900
                border border-zinc-200 dark:border-zinc-700/80
                text-zinc-800 dark:text-zinc-200
                placeholder-zinc-400
                focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20
                transition-all"
            />
            {filter && (
              <button
                onClick={() => setFilter('')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-400"
                aria-label="Clear filter"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            )}
          </div>

          {/* Clear */}
          <button
            onClick={onClearHistory}
            aria-label="Clear all history"
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-semibold
              text-red-600 dark:text-red-400
              hover:bg-red-50 dark:hover:bg-red-500/10
              border border-transparent hover:border-red-200 dark:hover:border-red-500/20
              transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.clearHistory}</span>
          </button>
        </div>
      </div>

      {/* List */}
      <div className="p-2 flex flex-col gap-1">
        {filtered.slice(0, 10).map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectHistory(item)}
            className="w-full flex items-center justify-between gap-3 px-3 py-3
              rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50
              border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700/50
              text-left transition-all group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Avatar */}
              <img
                src={`https://github.com/${item.user}.png?size=64`}
                alt={item.user}
                className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex-shrink-0 group-hover:ring-2 group-hover:ring-indigo-500/20 transition-all"
                loading="lazy"
              />

              <div className="min-w-0">
                <p className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight truncate">
                  <span className="font-medium text-zinc-500">{safeDecode(item.user)} / </span>
                  {safeDecode(item.repo)}
                </p>
                {item.path && (
                  <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-500 truncate mt-1">
                    {safeDecode(item.path)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-shrink-0 text-right">
              <span className="text-[10px] font-medium text-zinc-400 flex items-center justify-end gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo(item.timestamp)}
              </span>
              <div className="flex items-center gap-1.5 transition-opacity">
                {/* Delete Single Item */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteHistoryItem(item.id);
                  }}
                  className="w-8 h-8 rounded-lg bg-zinc-100 hover:bg-red-50 dark:bg-zinc-800 dark:hover:bg-red-500/10 flex items-center justify-center transition-colors"
                  title="Delete from history"
                  aria-label="Delete history item"
                >
                  <X className="w-4 h-4 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors" />
                </button>
                {/* Arrow */}
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="py-6 text-center text-sm text-zinc-400">
            No history matches "{filter}"
          </div>
        )}
      </div>
    </div>
  );
};
