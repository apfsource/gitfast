import React, { useState, useCallback, useEffect } from 'react';
import {
  Copy, ExternalLink, QrCode, Code, Star, Check,
  Search, Download, Activity, Layers, Info, Filter, X,
} from 'lucide-react';
import { CdnService, Language, ParsedGithubUrl } from '../types';
import { i18n } from '../utils/translations';
import { QrCodeModal } from './QrCodeModal';
import { EmbedModal } from './EmbedModal';
import { ExportModal } from './ExportModal';
import { ShareModal } from './ShareModal';
import { RefreshCw, Share2, AlertTriangle } from 'lucide-react';

interface CdnListProps {
  services: CdnService[];
  parsedUrl: ParsedGithubUrl;
  favoriteIds: string[];
  onToggleFavorite: (serviceId: string) => void;
  lang: Language;
}

export const CdnList: React.FC<CdnListProps> = ({
  services,
  parsedUrl,
  favoriteIds,
  onToggleFavorite,
  lang,
}) => {
  const t = i18n[lang];

  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [selectedQrService, setSelectedQrService] = useState<{ name: string; url: string } | null>(null);
  const [selectedEmbedService, setSelectedEmbedService] = useState<{ name: string; url: string } | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [shareData, setShareData] = useState<{ name: string; url: string } | null>(null);
  const [healthStatus, setHealthStatus] = useState<Record<string, 'idle' | 'checking' | 'ok' | 'fail' | 'cors'>>({});

  // Reset health status when the main URL changes
  useEffect(() => {
    setHealthStatus({});
  }, [parsedUrl.originalUrl]);

  const handleShare = async (name: string, url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `GitFast — ${name} CDN`,
          text: `Here is the optimized CDN link for ${parsedUrl.fileName || 'my file'}:`,
          url: url,
        });
      } catch (error) {
        // User dismissed the share sheet or it failed, ignore silently
      }
    } else {
      // Fallback: Open custom desktop share modal
      setShareData({ name, url });
    }
  };

  if (!parsedUrl.isValid) return null;

  const filteredServices = services.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.tag.toLowerCase().includes(q);
    const matchesFav = showFavoritesOnly ? favoriteIds.includes(s.id) : true;
    return matchesSearch && matchesFav;
  });

  const handleCopySingle = useCallback(async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleCopyAll = useCallback(async () => {
    const text = services.map((s) => `${s.name}: ${s.url}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }, [services]);

  const testHealth = useCallback(async (id: string, url: string) => {
    setHealthStatus((prev) => ({ ...prev, [id]: 'checking' }));
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 8000);
      // Use GET instead of HEAD because many CDNs block HEAD requests or fail CORS for them.
      const res = await fetch(url, { method: 'GET', signal: controller.signal });
      clearTimeout(tid);
      
      // Abort immediately after receiving headers to prevent downloading the actual file body.
      // This acts like a HEAD request but bypasses server restrictions.
      controller.abort();
      
      setHealthStatus((prev) => ({ ...prev, [id]: res.ok ? 'ok' : 'fail' }));
    } catch (err: any) {
      // Network error or CORS failure means we can't verify the resource
      if (err.name === 'TypeError') {
        setHealthStatus((prev) => ({ ...prev, [id]: 'cors' }));
      } else {
        setHealthStatus((prev) => ({ ...prev, [id]: 'fail' }));
      }
    }
  }, []);

  return (
    <div className="animate-fade-up space-y-3">

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5
        p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">

        {/* Search + filter */}
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchServices}
              aria-label="Search CDN services"
              className="w-full h-8 pl-8 pr-3 rounded-lg text-xs
                bg-zinc-50 dark:bg-zinc-800
                border border-zinc-200 dark:border-zinc-700
                text-zinc-900 dark:text-zinc-100
                placeholder-zinc-400
                focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500
                transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                aria-label="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            aria-label="Show starred only"
            className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium border transition-all
              ${showFavoritesOnly
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-400/30'
                : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.favoriteOnly}</span>
          </button>
        </div>

        {/* Batch actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyAll}
            aria-label="Copy all CDN links"
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium
              border border-zinc-200 dark:border-zinc-700
              bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700
              text-zinc-700 dark:text-zinc-300
              transition-colors"
          >
            {copiedAll
              ? <><Check className="w-3.5 h-3.5 text-emerald-500" /><span className="text-emerald-600 dark:text-emerald-400">{(t as any).copiedShort}</span></>
              : <><Copy className="w-3.5 h-3.5 text-zinc-400" /><span>{t.copyAll}</span></>
            }
          </button>

          <button
            onClick={() => setIsExportOpen(true)}
            aria-label="Export CDN links"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold
              bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600
              text-white transition-colors shadow-sm shadow-indigo-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{(t as any).exportBtn}</span>
          </button>
        </div>
      </div>

      {/* ── CDN Services List ── */}
      <div className="flex flex-col gap-3 stagger-children">
        {filteredServices.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <Layers className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">{lang === 'hi' ? `"${searchQuery}" के लिए कोई परिणाम नहीं` : `No results for "${searchQuery}"`}</p>
          </div>
        ) : (
          filteredServices.map((service, index) => {
            const isFav = favoriteIds.includes(service.id);
            const status = healthStatus[service.id] || 'idle';
            const isCopied = copiedId === service.id;

            return (
              <div
                key={service.id}
                className={`
                  group relative flex flex-col p-4
                  rounded-2xl border transition-all duration-300
                  ${isFav 
                    ? 'border-amber-200/50 dark:border-amber-500/30 bg-amber-50/30 dark:bg-amber-500/[0.03] shadow-sm ring-1 ring-amber-500/10' 
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700'
                  }
                `}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Service info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Star */}
                    <button
                      onClick={() => onToggleFavorite(service.id)}
                      title={isFav ? t.pinned : t.unpinned}
                      aria-label={isFav ? 'Remove from starred' : 'Add to starred'}
                      className="p-1 mt-0.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 transition-colors flex-shrink-0"
                    >
                      <Star className={`w-4 h-4 transition-all ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>

                    <div className="min-w-0 flex-1">
                      {/* Name + tag */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100 leading-none">
                          {service.name}
                        </span>
                        <span className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border leading-none ${service.badgeColor}`}>
                          {service.tag}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* URL + actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto lg:flex-shrink-0">
                    {/* URL display */}
                    <div className="flex-1 lg:w-80 xl:w-96 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-xl px-3 py-2 font-mono text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 truncate select-all cursor-text shadow-inner">
                      {service.url}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      {/* Copy */}
                      <button
                        onClick={() => handleCopySingle(service.id, service.url)}
                        title="Copy URL"
                        aria-label={`Copy ${service.name} URL`}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-semibold transition-all
                          ${isCopied
                            ? 'bg-emerald-500 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                          }`}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      {/* Share Button (Native Web Share) */}
                      <button
                        onClick={() => handleShare(service.name, service.url)}
                        title="Share URL"
                        aria-label="Share URL"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg
                          bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700
                          border border-zinc-200 dark:border-zinc-700
                          text-blue-600 dark:text-blue-400
                          transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Purge Cache (jsDelivr only) */}
                      {service.id === 'jsdelivr' && (
                        <a
                          href={`https://purge.jsdelivr.net/gh/${parsedUrl.user}/${parsedUrl.repo}@${encodeURIComponent(parsedUrl.branch)}/${parsedUrl.path.split('/').map(encodeURIComponent).join('/')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Purge Cache"
                          aria-label="Purge Cache"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg
                            bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700
                            border border-zinc-200 dark:border-zinc-700
                            text-amber-600 dark:text-amber-400
                            transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {/* Open */}
                      <a
                        href={service.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open in new tab"
                        aria-label={`Open ${service.name} URL`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg
                          bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700
                          border border-zinc-200 dark:border-zinc-700
                          text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100
                          transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      {/* QR */}
                      <button
                        onClick={() => setSelectedQrService({ name: service.name, url: service.url })}
                        title="Generate QR Code"
                        aria-label={`QR code for ${service.name}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg
                          bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700
                          border border-zinc-200 dark:border-zinc-700
                          text-zinc-500 hover:text-purple-600 dark:hover:text-purple-400
                          transition-colors"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>

                      {/* Embed */}
                      <button
                        onClick={() => setSelectedEmbedService({ name: service.name, url: service.url })}
                        title="Embed code snippets"
                        aria-label={`Embed snippets for ${service.name}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg
                          bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700
                          border border-zinc-200 dark:border-zinc-700
                          text-zinc-500 hover:text-amber-600 dark:hover:text-amber-400
                          transition-colors"
                      >
                        <Code className="w-3.5 h-3.5" />
                      </button>

                      {/* Health */}
                      {status === 'idle' && (
                        <button
                          onClick={() => testHealth(service.id, service.url)}
                          title="Test link availability"
                          aria-label={`Test health for ${service.name}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg
                            bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700
                            border border-zinc-200 dark:border-zinc-700
                            text-zinc-400 hover:text-indigo-500
                            transition-colors"
                        >
                          <Activity className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {status === 'checking' && (
                        <div className="w-8 h-8 flex items-center justify-center">
                          <Activity className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                        </div>
                      )}
                      {status === 'ok' && (
                        <div className="w-8 h-8 flex items-center justify-center" title="Reachable">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                      )}
                      {status === 'cors' && (
                        <div className="w-8 h-8 flex items-center justify-center cursor-help" title="CORS Blocked (Cannot verify via JS, but may work in <img> or <script>)">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        </div>
                      )}
                      {status === 'fail' && (
                        <div className="w-8 h-8 flex items-center justify-center cursor-help" title="Not reachable (404/500)">
                          <Info className="w-3.5 h-3.5 text-red-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Highlight Note */}
                <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[11.5px] font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {service.description}
                    {service.note && <span className="opacity-80 ml-1.5">{service.note}</span>}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Count */}
      <p className="text-right text-[11px] text-zinc-400">
        {filteredServices.length} of {services.length} services
      </p>

      {/* Modals */}
      {selectedQrService && (
        <QrCodeModal
          isOpen
          onClose={() => setSelectedQrService(null)}
          serviceName={selectedQrService.name}
          url={selectedQrService.url}
          lang={lang}
        />
      )}
      {selectedEmbedService && (
        <EmbedModal
          isOpen
          onClose={() => setSelectedEmbedService(null)}
          serviceName={selectedEmbedService.name}
          url={selectedEmbedService.url}
          parsedUrl={parsedUrl}
          lang={lang}
        />
      )}
      {isExportOpen && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          services={services}
          parsedUrl={parsedUrl}
          lang={lang}
        />
      )}
      <ShareModal
        isOpen={!!shareData}
        onClose={() => setShareData(null)}
        url={shareData?.url || ''}
        fileName={parsedUrl.fileName || 'file'}
        lang={lang}
      />
    </div>
  );
};
