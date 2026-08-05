import React, { useState, useEffect } from 'react';
import { GitBranch, File, User, GitFork, Code, Image, FileText, Type, Layout, Package, Copy, Check } from 'lucide-react';
import { ParsedGithubUrl, Language } from '../types';
import { i18n } from '../utils/translations';
import { fetchFileMetadata, formatBytes } from '../utils/fileMetadata';

interface ParsedInfoCardProps {
  parsedUrl: ParsedGithubUrl;
  onUpdateBranch: (branch: string) => void;
  onUpdatePath: (path: string) => void;
  lang: Language;
}

const categoryConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  javascript: {
    icon: <Code className="w-3 h-3" />,
    label: 'Code',
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  stylesheet: {
    icon: <Layout className="w-3 h-3" />,
    label: 'CSS',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  image: {
    icon: <Image className="w-3 h-3" />,
    label: 'Image',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },
  json: {
    icon: <FileText className="w-3 h-3" />,
    label: 'JSON',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  markdown: {
    icon: <FileText className="w-3 h-3" />,
    label: 'Markdown',
    color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
  },
  font: {
    icon: <Type className="w-3 h-3" />,
    label: 'Font',
    color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  },
  html: {
    icon: <Code className="w-3 h-3" />,
    label: 'HTML',
    color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  },
};

export const ParsedInfoCard: React.FC<ParsedInfoCardProps> = ({
  parsedUrl,
  onUpdateBranch,
  onUpdatePath,
  lang,
}) => {
  const t = i18n[lang];
  const [copied, setCopied] = useState(false);
  const [fileSize, setFileSize] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (parsedUrl.isValid) {
      setFileSize('...');
      // Fetch size from raw.githubusercontent.com
      const rawUrl = `https://raw.githubusercontent.com/${parsedUrl.user}/${parsedUrl.repo}/${encodeURIComponent(parsedUrl.branch)}/${parsedUrl.path.split('/').map(encodeURIComponent).join('/')}`;
      fetchFileMetadata(rawUrl).then(meta => {
        if (active) {
          if (meta) {
            setFileSize(formatBytes(meta.size));
          } else {
            setFileSize(null);
          }
        }
      });
    }
    return () => { active = false; };
  }, [parsedUrl]);

  if (!parsedUrl.isValid) return null;

  const cat = categoryConfig[parsedUrl.fileCategory];
  const catLabel = cat?.label || parsedUrl.fileExtension?.toUpperCase() || 'File';
  const catColor = cat?.color || 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20';
  const catIcon = cat?.icon || <Package className="w-3 h-3" />;

  const handleCopyOriginal = async () => {
    try {
      await navigator.clipboard.writeText(parsedUrl.originalUrl);
    } catch {
      const el = document.createElement('textarea');
      el.value = parsedUrl.originalUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-up rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
      
      {/* Header row */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-zinc-50/80 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3 min-w-0">
          {/* GitHub Avatar */}
          <img
            src={`https://github.com/${parsedUrl.user}.png?size=64`}
            alt={parsedUrl.user}
            className="w-9 h-9 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white flex-shrink-0 shadow-sm"
          />
          
          <div className="min-w-0">
            {/* User / Repo */}
            <div className="flex items-center gap-1.5 text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 truncate tracking-tight">
              <span>{parsedUrl.user}</span>
              <span className="text-zinc-400 font-normal">/</span>
              <span className="text-indigo-600 dark:text-indigo-400">{parsedUrl.repo}</span>
            </div>
            
            {/* Badges / File Name */}
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold border ${catColor}`}>
                {catIcon}
                {catLabel}
              </span>
              {fileSize && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-zinc-200/50 dark:bg-zinc-700/50 text-zinc-600 dark:text-zinc-300">
                  {fileSize}
                </span>
              )}
              {parsedUrl.fileName && (
                <span className="text-[11px] text-zinc-500 font-mono truncate" title={parsedUrl.fileName}>
                  {parsedUrl.fileName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Copy original button */}
        <button
          onClick={handleCopyOriginal}
          title={t.copyUrlBtn}
          className="flex-shrink-0 inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium
            bg-white dark:bg-zinc-800
            border border-zinc-200 dark:border-zinc-700
            text-zinc-600 dark:text-zinc-400
            hover:text-zinc-900 dark:hover:text-zinc-100
            hover:bg-zinc-50 dark:hover:bg-zinc-700
            transition-colors shadow-sm"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copied ? (t as any).copiedShort : (t as any).copyUrlBtn}</span>
        </button>
      </div>

      {/* Editable fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-zinc-100 dark:divide-zinc-800">
        
        {/* Branch (editable) */}
        <div className="px-4 py-3 sm:col-span-1">
          <label className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-1.5">
            <GitBranch className="w-3 h-3" />
            {t.branchLabel}
          </label>
          <input
            type="text"
            value={parsedUrl.branch}
            onChange={(e) => onUpdateBranch(e.target.value)}
            aria-label="Branch name"
            className="w-full bg-transparent text-[13px] font-mono text-zinc-900 dark:text-zinc-100
              focus:outline-none placeholder-zinc-400
              border-b border-transparent focus:border-indigo-400 transition-colors"
            placeholder="main"
          />
        </div>

        {/* File path (editable) */}
        <div className="px-4 py-3 sm:col-span-2 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
          <label className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-1.5">
            <File className="w-3 h-3" />
            {t.pathLabel}
          </label>
          <input
            type="text"
            value={parsedUrl.path}
            onChange={(e) => onUpdatePath(e.target.value)}
            aria-label="File path"
            className="w-full bg-transparent text-[13px] font-mono text-zinc-900 dark:text-zinc-100
              focus:outline-none placeholder-zinc-400
              border-b border-transparent focus:border-emerald-400 transition-colors"
            placeholder="path/to/file.js"
          />
        </div>
      </div>
    </div>
  );
};
