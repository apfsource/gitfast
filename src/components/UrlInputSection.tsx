import React, { useState, useRef } from 'react';
import { Clipboard, X, Check, AlertCircle, ChevronRight, Link } from 'lucide-react';
import { Language, ParsedGithubUrl } from '../types';
import { i18n } from '../utils/translations';
import { SAMPLE_GITHUB_URLS, SampleUrl } from '../data/samples';

interface UrlInputSectionProps {
  inputUrl: string;
  setInputUrl: (url: string) => void;
  parsedUrl: ParsedGithubUrl;
  lang: Language;
  minify: boolean;
  setMinify: (val: boolean) => void;
}

export const UrlInputSection: React.FC<UrlInputSectionProps> = ({
  inputUrl,
  setInputUrl,
  parsedUrl,
  lang,
  minify,
  setMinify,
}) => {
  const t = i18n[lang];
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        // Grab only the first line if multiple are pasted
        const firstLine = text.split('\n')[0].trim();
        setInputUrl(firstLine);
        setPasteSuccess(true);
        setTimeout(() => setPasteSuccess(false), 2000);
      }
    } catch {
      inputRef.current?.focus();
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const text = e.dataTransfer.getData('text');
    if (text) setInputUrl(text.trim());
  };

  const isValid = parsedUrl.isValid;
  const hasInput = inputUrl.trim().length > 0;
  const isMinifiable = isValid && (parsedUrl.fileExtension === 'js' || parsedUrl.fileExtension === 'css');

  return (
    <div className="animate-fade-up space-y-4">
      {/* Input Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md dark:shadow-none
          ${isDragging
            ? 'border-indigo-500 ring-4 ring-indigo-500/10 bg-indigo-500/5'
            : hasInput && !isValid
              ? 'border-red-400/60 dark:border-red-500/40 bg-white dark:bg-zinc-900'
              : hasInput && isValid
                ? 'border-emerald-400/60 dark:border-emerald-500/40 bg-white dark:bg-zinc-900'
                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus-within:border-indigo-400 dark:focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10'
          }
        `}
      >
        {/* Input Field */}
        <div className="relative flex items-center">
          <Link className="absolute left-4 sm:left-5 w-5 h-5 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
          <input
            ref={inputRef}
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder={t.pastePlaceholder}
            spellCheck={false}
            aria-label="GitHub URL input"
            className="w-full bg-transparent pl-11 pr-4 sm:pl-14 sm:pr-5 py-4 text-[14px] sm:text-[15px] font-mono
              text-zinc-900 dark:text-zinc-100
              placeholder-zinc-400 dark:placeholder-zinc-500
              focus:outline-none"
          />
        </div>

        {/* Bottom toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-800/40">

          {/* Left Side: Toggle + Status */}
          <div className="flex items-center gap-4">
            
            {/* Auto-Minify Toggle (Disabled for non-JS/CSS) */}
            <label className={`flex items-center gap-1.5 flex-shrink-0 ${isMinifiable ? 'cursor-pointer group' : 'cursor-not-allowed opacity-40'}`} title={isMinifiable ? "Auto-Minify jsDelivr" : "Only available for JS and CSS files"}>
              <div className={`relative w-7 h-4 rounded-full transition-colors duration-300 ${isMinifiable && minify ? 'bg-indigo-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
                <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-300 shadow-sm ${isMinifiable && minify ? 'translate-x-3' : 'translate-x-0'}`} />
              </div>
              <span className={`text-[11px] font-bold text-zinc-600 dark:text-zinc-400 ${isMinifiable ? 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors' : ''}`}>
                .min
              </span>
              <input type="checkbox" className="sr-only" checked={isMinifiable && minify} disabled={!isMinifiable} onChange={(e) => setMinify(e.target.checked)} />
            </label>

            {/* Divider */}
            <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700"></div>

            {/* Status indicator */}
            <div className="flex items-center gap-1.5 text-xs truncate">
              {!hasInput && (
                <span className="text-zinc-400 dark:text-zinc-600 text-[11px] truncate">
                  Drop a GitHub URL here, or paste below
                </span>
              )}
              {hasInput && isValid && (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium text-[11px] truncate">
                  <Check className="w-3 h-3 flex-shrink-0" />
                  Valid GitHub URL
                </span>
              )}
              {hasInput && !isValid && (
                <span className="flex items-center gap-1 text-red-500 dark:text-red-400 font-medium text-[11px] truncate">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  {parsedUrl.error || 'Invalid URL'}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            {inputUrl && (
              <button
                onClick={() => setInputUrl('')}
                aria-label="Clear input"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium
                  text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100
                  hover:bg-zinc-200 dark:hover:bg-zinc-700
                  transition-colors"
              >
                <X className="w-3 h-3" />
                {t.clearBtn}
              </button>
            )}
            <button
              onClick={handlePaste}
              aria-label="Paste from clipboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
                bg-indigo-600 hover:bg-indigo-700 text-white
                dark:bg-indigo-500 dark:hover:bg-indigo-600
                transition-colors shadow-sm shadow-indigo-500/20"
            >
              {pasteSuccess ? (
                <><Check className="w-3 h-3" /> Pasted!</>
              ) : (
                <><Clipboard className="w-3 h-3" /> {t.pasteBtn}</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sample URLs */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 px-1">
        <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mr-1">
          {t.trySample}
        </span>
        {SAMPLE_GITHUB_URLS.map((sample: SampleUrl, idx: number) => (
          <button
            key={idx}
            onClick={() => setInputUrl(sample.url)}
            title={sample.description}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium
              bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700
              text-zinc-700 dark:text-zinc-300
              border border-zinc-200 dark:border-zinc-700/80
              transition-all duration-150 group"
          >
            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500">{sample.category}</span>
            <span>{sample.title}</span>
            <ChevronRight className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 -ml-0.5 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
};
