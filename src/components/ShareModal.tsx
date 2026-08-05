import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Share2, Copy, Check, Twitter, MessageCircle, Linkedin, Mail } from 'lucide-react';
import { Language } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  fileName: string;
  lang: Language;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen, onClose, url, fileName, lang
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => { window.removeEventListener('keydown', handler); document.body.style.overflow = prev; };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shareText = `Here is the optimized CDN link for ${fileName}:`;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText);

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(url); } catch {
      const el = document.createElement('textarea');
      el.value = url; document.body.appendChild(el); el.select();
      document.execCommand('copy'); document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="w-5 h-5" />,
      color: 'bg-[#25D366] text-white hover:bg-[#20bd5a]',
      href: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`
    },
    {
      name: 'X (Twitter)',
      icon: <Twitter className="w-5 h-5" />,
      color: 'bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="w-5 h-5" />,
      color: 'bg-[#0A66C2] text-white hover:bg-[#0958a8]',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    },
    {
      name: 'Email',
      icon: <Mail className="w-5 h-5" />,
      color: 'bg-rose-500 text-white hover:bg-rose-600',
      href: `mailto:?subject=GitFast%20CDN%20Link&body=${encodedText}%20${encodedUrl}`
    }
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-sm flex flex-col rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10">
              <Share2 className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {lang === 'hi' ? 'लिंक शेयर करें' : 'Share Link'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-[13px] transition-all shadow-sm ${link.color}`}
              >
                {link.icon}
                {link.name}
              </a>
            ))}
          </div>

          {/* Copy Link Section */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              {lang === 'hi' ? 'या लिंक कॉपी करें:' : 'Or copy link:'}
            </span>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 font-mono text-xs text-zinc-600 dark:text-zinc-400 truncate select-all">
                {url}
              </div>
              <button
                onClick={handleCopy}
                className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl text-white transition-all ${
                  copied ? 'bg-emerald-500' : 'bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 shadow-sm'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};
