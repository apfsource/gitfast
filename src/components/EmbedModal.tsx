import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Code, Check, Copy, FileText, Layout, Image as ImageIcon } from 'lucide-react';
import { Language, ParsedGithubUrl } from '../types';
import { i18n } from '../utils/translations';
import { generateEmbedSnippets } from '../utils/githubParser';
import { fetchFileMetadata } from '../utils/fileMetadata';

interface EmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
  url: string;
  parsedUrl: ParsedGithubUrl;
  lang: Language;
}

export const EmbedModal: React.FC<EmbedModalProps> = ({
  isOpen, onClose, serviceName, url, parsedUrl, lang,
}) => {
  const t = i18n[lang];
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [useSri, setUseSri] = useState(false);
  const [sriHash, setSriHash] = useState<string | undefined>(undefined);
  const [isLoadingSri, setIsLoadingSri] = useState(false);

  // Escape key + scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => { window.removeEventListener('keydown', handler); document.body.style.overflow = prev; };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  useEffect(() => {
    if (!useSri) {
      setSriHash(undefined);
      return;
    }
    if (sriHash || isLoadingSri) return;
    
    setIsLoadingSri(true);
    const rawUrl = `https://raw.githubusercontent.com/${parsedUrl.user}/${parsedUrl.repo}/${encodeURIComponent(parsedUrl.branch)}/${parsedUrl.path.split('/').map(encodeURIComponent).join('/')}`;
    
    fetchFileMetadata(rawUrl).then(meta => {
      if (meta) setSriHash(meta.sha384);
      setIsLoadingSri(false);
    });
  }, [useSri, parsedUrl, sriHash, isLoadingSri]);

  const snippets = generateEmbedSnippets(url, parsedUrl.fileName || 'file', parsedUrl.fileCategory, sriHash);

  const copySnippet = async (key: string, text: string) => {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const el = document.createElement('textarea');
      el.value = text; document.body.appendChild(el); el.select();
      document.execCommand('copy'); document.body.removeChild(el);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const snippetItems = [
    { key: 'script',       title: '<script> Tag',         icon: <Code className="w-3.5 h-3.5 text-amber-500" />,    code: snippets.script,       for: ['javascript'] },
    { key: 'css',          title: '<link> CSS Tag',        icon: <Layout className="w-3.5 h-3.5 text-blue-500" />,   code: snippets.css,          for: ['stylesheet', 'font'] },
    { key: 'markdownImg',  title: 'Markdown Image',        icon: <ImageIcon className="w-3.5 h-3.5 text-purple-500" />, code: snippets.markdownImg, for: ['image'] },
    { key: 'htmlImg',      title: '<img> Tag',             icon: <ImageIcon className="w-3.5 h-3.5 text-pink-500" />,  code: snippets.htmlImg,     for: ['image'] },
    { key: 'markdownLink', title: 'Markdown Link',         icon: <FileText className="w-3.5 h-3.5 text-emerald-500" />, code: snippets.markdownLink, for: ['markdown', 'json', 'other'] },
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="animate-slide-in bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
              <Code className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {lang === 'hi' ? 'एम्बेड स्निपेट्स' : 'Embed Snippets'}
              </h3>
              <p className="text-xs text-zinc-500">{serviceName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* SRI Toggle */}
            <label className="flex items-center gap-2 cursor-pointer group">
              <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Enable SRI
              </span>
              <div className={`relative w-8 h-5 rounded-full transition-colors duration-300 ${useSri ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
                <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform duration-300 shadow-sm ${useSri ? 'translate-x-3' : 'translate-x-0'}`} />
              </div>
              <input
                type="checkbox"
                className="sr-only"
                checked={useSri}
                onChange={(e) => setUseSri(e.target.checked)}
              />
            </label>

            <button
              onClick={onClose}
              className="p-2 -mr-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Snippets */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-2.5">
          {snippetItems.map((item) => {
            const isRec = item.for.includes(parsedUrl.fileCategory);
            return (
              <div
                key={item.key}
                className={`rounded-xl border overflow-hidden transition-all ${
                  isRec
                    ? 'border-indigo-200 dark:border-indigo-800/50 ring-1 ring-indigo-500/10'
                    : 'border-zinc-200 dark:border-zinc-800'
                }`}
              >
                {/* Snippet header */}
                <div className={`flex items-center justify-between px-3 py-2 ${isRec ? 'bg-indigo-50/60 dark:bg-indigo-950/30' : 'bg-zinc-50 dark:bg-zinc-800/50'}`}>
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{item.title}</span>
                    {isRec && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500 text-white">
                        Recommended
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => copySnippet(item.key, item.code)}
                    aria-label={`Copy ${item.title}`}
                    className="inline-flex items-center gap-1 h-6 px-2 rounded-md text-[10px] font-semibold
                      bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700
                      text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100
                      transition-colors"
                  >
                    {copiedKey === item.key
                      ? <><Check className="w-3 h-3 text-emerald-500" />Copied</>
                      : <><Copy className="w-3 h-3" />Copy</>
                    }
                  </button>
                </div>
                {/* Code block */}
                <div className="px-3 py-2.5 bg-zinc-950 font-mono text-[11px] text-zinc-300 overflow-x-auto leading-relaxed select-all">
                  {item.code}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 flex-shrink-0 flex justify-end">
          <button onClick={onClose} className="h-8 px-4 rounded-lg text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity">
            {t.close}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
