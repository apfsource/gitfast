import React from 'react';
import { Sun, Moon, Languages, Github, Zap } from 'lucide-react';
import { Language } from '../types';
import { i18n } from '../utils/translations';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  lang: Language;
  setLang: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({ darkMode, setDarkMode, lang, setLang }) => {
  const t = i18n[lang];

  return (
    <header
      style={{ borderBottom: '1px solid var(--border)', background: 'rgba(var(--surface-rgb, 9,9,11), 0.85)' }}
      className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-[#09090b]/85 border-b border-zinc-200 dark:border-white/[0.07]"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* ── Brand ── */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-sm">
                <Zap className="w-5 h-5 text-white fill-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                GitFast
              </h1>
            </div>
          </div>

        {/* ── Nav Actions ── */}
        <div className="flex items-center gap-1.5">

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            title="Change language / भाषा बदलें"
            aria-label="Toggle language"
            className="inline-flex items-center justify-center sm:gap-1.5 h-8 w-8 sm:w-auto sm:px-3 rounded-lg text-xs font-medium
              text-zinc-600 dark:text-zinc-400
              hover:text-zinc-900 dark:hover:text-zinc-100
              hover:bg-zinc-100 dark:hover:bg-zinc-800
              border border-zinc-200 dark:border-zinc-800
              transition-all duration-150"
          >
            <Languages className="w-3.5 h-3.5 sm:text-indigo-500" />
            <span className="hidden sm:inline">{t.languageName}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg
              text-zinc-600 dark:text-zinc-400
              hover:text-zinc-900 dark:hover:text-zinc-100
              hover:bg-zinc-100 dark:hover:bg-zinc-800
              border border-zinc-200 dark:border-zinc-800
              transition-all duration-150"
          >
            {darkMode
              ? <Sun className="w-3.5 h-3.5 text-amber-400" />
              : <Moon className="w-3.5 h-3.5" />
            }
          </button>

          {/* GitHub */}
            <a
              href="https://github.com/gitfast/gitfast"
              target="_blank"
              rel="noopener noreferrer"
            aria-label="View on GitHub"
            className="inline-flex items-center justify-center sm:gap-1.5 h-8 w-8 sm:w-auto sm:px-3 rounded-lg text-xs font-semibold
              bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900
              hover:bg-zinc-700 dark:hover:bg-zinc-300
              transition-all duration-150"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
};
