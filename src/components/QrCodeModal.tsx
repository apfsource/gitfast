import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Copy, Check, QrCode } from 'lucide-react';
import { Language } from '../types';
import { i18n } from '../utils/translations';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
  url: string;
  lang: Language;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen, onClose, serviceName, url, lang,
}) => {
  const t = i18n[lang];
  const [copied, setCopied] = React.useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

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

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(url); }
    catch {
      const el = document.createElement('textarea');
      el.value = url; document.body.appendChild(el); el.select();
      document.execCommand('copy'); document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512; canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 512, 512);
        ctx.drawImage(img, 32, 32, 448, 448);
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `${serviceName.toLowerCase().replace(/\s+/g, '-')}-qr.png`;
        link.click();
      }
    };
    img.src = blobUrl;
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="animate-slide-in bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t.qrCodeTitle}</h3>
              <p className="text-[11px] text-zinc-500">{serviceName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR */}
        <div className="flex flex-col items-center py-6 px-5">
          <div ref={qrRef} className="bg-white p-3 rounded-xl shadow-md border border-zinc-100">
            <QRCodeSVG value={url} size={180} level="H" includeMargin bgColor="#FFFFFF" fgColor="#09090b" />
          </div>
          <p className="mt-3 text-[10px] font-mono text-zinc-400 max-w-[230px] text-center truncate">{url}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={handleCopy}
            className="flex-1 h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5
              bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700
              border border-zinc-200 dark:border-zinc-700
              text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" />Copied!</> : <><Copy className="w-3.5 h-3.5" />Copy URL</>}
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5
              bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600
              text-white transition-colors shadow-sm shadow-indigo-500/20"
          >
            <Download className="w-3.5 h-3.5" />{t.downloadQr}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
