import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, FileText, Code2, Check, Copy } from 'lucide-react';
import { CdnService, Language, ParsedGithubUrl } from '../types';
import { i18n } from '../utils/translations';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: CdnService[];
  parsedUrl: ParsedGithubUrl;
  lang: Language;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen, onClose, services, parsedUrl, lang,
}) => {
  const t = i18n[lang];
  const [copiedFormat, setCopiedFormat] = React.useState<string | null>(null);

  // Escape + scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => { window.removeEventListener('keydown', handler); document.body.style.overflow = prev; };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const txtContent = services.map((s) => `${s.name}: ${s.url}`).join('\n');

  const mdContent = [
    `# CDN Links — ${parsedUrl.repo}/${parsedUrl.fileName}`,
    ``,
    `| Service | URL | Tag |`,
    `| :--- | :--- | :--- |`,
    ...services.map((s) => `| **${s.name}** | \`${s.url}\` | ${s.tag} |`),
  ].join('\n');

  const jsonContent = JSON.stringify({
    tool: 'GitFast',
    repository: `${parsedUrl.user}/${parsedUrl.repo}`,
    branch: parsedUrl.branch,
    file: parsedUrl.path,
    generatedAt: new Date().toISOString(),
    services: services.map((s) => ({ id: s.id, name: s.name, url: s.url, tag: s.tag })),
  }, null, 2);

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const copy = async (format: string, text: string) => {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const el = document.createElement('textarea');
      el.value = text; document.body.appendChild(el); el.select();
      document.execCommand('copy'); document.body.removeChild(el);
    }
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const formats = [
    {
      key: 'txt',
      label: 'Plain Text',
      ext: '.txt',
      icon: <FileText className="w-4 h-4 text-zinc-500" />,
      desc: 'Simple name: url list',
      content: txtContent,
      mime: 'text/plain',
      filename: `${parsedUrl.repo}-cdn-links.txt`,
      accent: 'indigo',
    },
    {
      key: 'md',
      label: 'Markdown Table',
      ext: '.md',
      icon: <Code2 className="w-4 h-4 text-teal-500" />,
      desc: 'Formatted table for README / docs',
      content: mdContent,
      mime: 'text/markdown',
      filename: `${parsedUrl.repo}-cdn-table.md`,
      accent: 'teal',
    },
    {
      key: 'json',
      label: 'Structured JSON',
      ext: '.json',
      icon: <Code2 className="w-4 h-4 text-amber-500" />,
      desc: 'Data object for scripts & APIs',
      content: jsonContent,
      mime: 'application/json',
      filename: `${parsedUrl.repo}-cdn-links.json`,
      accent: 'amber',
    },
  ];

  const accentClasses: Record<string, string> = {
    indigo: 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600',
    teal:   'bg-teal-600 hover:bg-teal-700',
    amber:  'bg-amber-600 hover:bg-amber-700',
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="animate-slide-in bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Export Links</h3>
              <p className="text-[11px] text-zinc-500">{services.length} CDN links · {parsedUrl.fileName}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formats */}
        <div className="px-5 py-4 space-y-2.5">
          {formats.map((fmt) => (
            <div
              key={fmt.key}
              className="flex items-center justify-between gap-3 p-3.5 rounded-xl
                border border-zinc-200 dark:border-zinc-800
                bg-zinc-50/50 dark:bg-zinc-800/30"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  {fmt.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{fmt.label}</span>
                    <span className="text-[10px] font-mono text-zinc-400 border border-zinc-200 dark:border-zinc-700 px-1 rounded">{fmt.ext}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{fmt.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Copy */}
                <button
                  onClick={() => copy(fmt.key, fmt.content)}
                  aria-label={`Copy ${fmt.label}`}
                  className="w-7 h-7 rounded-lg flex items-center justify-center
                    bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700
                    text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100
                    transition-colors"
                >
                  {copiedFormat === fmt.key
                    ? <Check className="w-3.5 h-3.5 text-emerald-500" />
                    : <Copy className="w-3.5 h-3.5" />
                  }
                </button>
                {/* Download */}
                <button
                  onClick={() => downloadFile(fmt.content, fmt.filename, fmt.mime)}
                  aria-label={`Download ${fmt.label}`}
                  className={`inline-flex items-center gap-1 h-7 px-2.5 rounded-lg text-[11px] font-semibold text-white transition-colors ${accentClasses[fmt.accent]}`}
                >
                  <Download className="w-3 h-3" />
                  {fmt.ext}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button onClick={onClose} className="h-8 px-4 rounded-lg text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity">
            {t.close}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
