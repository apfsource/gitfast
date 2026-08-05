import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UrlInputSection } from './components/UrlInputSection';
import { ParsedInfoCard } from './components/ParsedInfoCard';
import { CdnList } from './components/CdnList';
import { HistorySection } from './components/HistorySection';
import { parseGithubUrl, generateCdnUrls } from './utils/githubParser';
import { ConversionHistoryItem, Language } from './types';
import { i18n } from './utils/translations';
import { LegalModal, LegalDocType } from './components/LegalModal';
import { Zap, ShieldCheck, Globe2, Sparkles, Layers, ChevronDown } from 'lucide-react';

export default function App() {

  // ── State ────────────────────────────────────────────
  const [lang, setLang] = useState<Language>(() => {
    const s = localStorage.getItem('gh_cdn_lang');
    return (s === 'hi' || s === 'en') ? s : 'en';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const s = localStorage.getItem('gh_cdn_darkmode');
    if (s !== null) return s === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [legalDoc, setLegalDoc] = useState<LegalDocType | null>(null);

  const [inputUrl, setInputUrl] = useState<string>(
    'https://github.com/facebook/react/blob/main/README.md'
  );
  const [minify, setMinify] = useState<boolean>(false);

  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const s = localStorage.getItem('gh_cdn_favorites');
      return s ? JSON.parse(s) : ['jsdelivr', 'statically'];
    } catch { return ['jsdelivr', 'statically']; }
  });

  const [history, setHistory] = useState<ConversionHistoryItem[]>(() => {
    try {
      const s = localStorage.getItem('gh_cdn_history');
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });

  // ── Effects ──────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('gh_cdn_darkmode', String(darkMode));
  }, [darkMode]);

  useEffect(() => { localStorage.setItem('gh_cdn_lang', lang); }, [lang]);
  useEffect(() => { localStorage.setItem('gh_cdn_favorites', JSON.stringify(favoriteIds)); }, [favoriteIds]);
  useEffect(() => { localStorage.setItem('gh_cdn_history', JSON.stringify(history)); }, [history]);

  // ── Derived ──────────────────────────────────────────
  const parsedUrl = parseGithubUrl(inputUrl);
  const cdnServices = generateCdnUrls(parsedUrl, favoriteIds, lang, minify);
  const t = i18n[lang];

  // Auto-enable minify for JS/CSS files when URL changes
  useEffect(() => {
    if (parsedUrl.isValid) {
      const ext = parsedUrl.fileExtension;
      if (ext === 'js' || ext === 'css') {
        setMinify(true);
      } else {
        setMinify(false);
      }
    }
  }, [parsedUrl.originalUrl, parsedUrl.isValid, parsedUrl.fileExtension]);

  // ── History tracking ─────────────────────────────────
  useEffect(() => {
    if (!parsedUrl.isValid || !parsedUrl.user || !parsedUrl.repo) return;
    const newItem: ConversionHistoryItem = {
      id: `${parsedUrl.user}-${parsedUrl.repo}-${parsedUrl.path}-${Date.now()}`,
      timestamp: Date.now(),
      originalUrl: parsedUrl.originalUrl,
      user: parsedUrl.user,
      repo: parsedUrl.repo,
      branch: parsedUrl.branch,
      path: parsedUrl.path,
      fileCategory: parsedUrl.fileCategory,
    };
    setHistory((prev) => {
      if (prev.length > 0 && prev[0].originalUrl === newItem.originalUrl) return prev;
      return [newItem, ...prev.filter((i) => i.originalUrl !== newItem.originalUrl)].slice(0, 30);
    });
  }, [parsedUrl.isValid, parsedUrl.user, parsedUrl.repo, parsedUrl.branch, parsedUrl.path]);

  // ── Handlers ─────────────────────────────────────────
  const toggleFavorite = (id: string) =>
    setFavoriteIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleUpdateBranch = (branch: string) => {
    if (!parsedUrl.isValid) return;
    setInputUrl(`https://github.com/${parsedUrl.user}/${parsedUrl.repo}/blob/${branch}/${parsedUrl.path}`);
  };

  const handleUpdatePath = (path: string) => {
    if (!parsedUrl.isValid) return;
    setInputUrl(`https://github.com/${parsedUrl.user}/${parsedUrl.repo}/blob/${parsedUrl.branch}/${path}`);
  };

  // ─────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors duration-200">
      
      {/* Global Background Grid & Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-60 dark:opacity-[0.2]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(99,102,241,0.12),transparent)]" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">

      {/* Navigation */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        lang={lang}
        setLang={setLang}
      />

      {/* ── Hero Section ── */}
      <section className="relative w-full pt-16 pb-8 sm:pt-20 sm:pb-12">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full
            border border-indigo-200/60 dark:border-indigo-800/60
            bg-indigo-50/50 dark:bg-indigo-900/20 backdrop-blur-md
            text-indigo-600 dark:text-indigo-400
            text-xs font-semibold mb-6 animate-fade-up shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            {t.bannerTagline}
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.1] mb-5 animate-fade-up max-w-4xl" style={{ animationDelay: '60ms' }}>
            {t.heroHeadline1}
            <span className="text-gradient">{t.heroHeadlineGradient}</span>
            {t.heroHeadline2}
          </h1>

          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mb-8 animate-fade-up leading-relaxed" style={{ animationDelay: '100ms' }}>
            {t.appSubtitle}
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 animate-fade-up" style={{ animationDelay: '140ms' }}>
            {[
              { icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />, label: t.badge100ClientSide },
              { icon: <Globe2 className="w-4 h-4 text-blue-500" />,         label: t.badgeZeroBackend },
              { icon: <Layers className="w-4 h-4 text-indigo-500" />,       label: '8 Premium CDNs' },
            ].map((pill) => (
              <span
                key={pill.label}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[13px] font-semibold bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 text-zinc-700 dark:text-zinc-300 shadow-sm hover:scale-105 transition-transform cursor-default"
              >
                {pill.icon}
                {pill.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* URL Input */}
        <UrlInputSection
          inputUrl={inputUrl}
          setInputUrl={setInputUrl}
          parsedUrl={parsedUrl}
          lang={lang}
          minify={minify}
          setMinify={setMinify}
        />

        {/* Parsed Metadata */}
        {parsedUrl.isValid && (
          <ParsedInfoCard
            parsedUrl={parsedUrl}
            onUpdateBranch={handleUpdateBranch}
            onUpdatePath={handleUpdatePath}
            lang={lang}
          />
        )}

        {/* CDN List or Empty State */}
        {parsedUrl.isValid ? (
          <CdnList
            services={cdnServices}
            parsedUrl={parsedUrl}
            favoriteIds={favoriteIds}
            onToggleFavorite={toggleFavorite}
            lang={lang}
          />
        ) : (
          inputUrl.trim() === '' && (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-up">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {t.emptyStateTitle}
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm">
                {t.emptyStateDesc}
              </p>
            </div>
          )
        )}

        {/* Conversion History */}
        <HistorySection
          history={history}
          onSelectHistory={(item) => setInputUrl(item.originalUrl)}
          onClearHistory={() => setHistory([])}
          lang={lang}
        />

        {/* Feature Documentation Grid */}
        <div className="pt-12 pb-6 border-t border-zinc-100 dark:border-zinc-800/60 mt-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{lang === 'hi' ? 'GitFast कैसे काम करता है?' : 'Why use GitFast?'}</h3>
            <p className="text-sm text-zinc-500">{lang === 'hi' ? 'डेवलपर्स के लिए सबसे तेज़ और सुरक्षित टूल' : 'The fastest and most secure tool for developers'}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: <Zap className="w-5 h-5 text-amber-500" />,
                bg: 'bg-amber-500/10',
                title: t.featureMultiCdn,
                desc: t.featureMultiCdnDesc,
              },
              {
                icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
                bg: 'bg-emerald-500/10',
                title: t.featurePrivacy,
                desc: t.featurePrivacyDesc,
              },
              {
                icon: <Globe2 className="w-5 h-5 text-indigo-500" />,
                bg: 'bg-indigo-500/10',
                title: t.featureQrEmbed,
                desc: t.featureQrEmbedDesc,
              },
              {
                icon: <Layers className="w-5 h-5 text-blue-500" />,
                bg: 'bg-blue-500/10',
                title: t.featureExport,
                desc: t.featureExportDesc,
              },
            ].map((card) => (
              <div key={card.title} className="group flex items-start gap-4 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-default relative overflow-hidden">
                <div className={`w-10 h-10 rounded-xl flex-shrink-0 ${card.bg} flex items-center justify-center`}>
                  {card.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">{card.title}</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── How to Use Section ── */}
        <div className="pt-12 pb-6 border-t border-zinc-100 dark:border-zinc-800/60 mt-4">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{t.howToTitle}</h3>
            <p className="text-sm text-zinc-500">{t.howToSub}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden sm:block absolute top-6 left-[16.66%] right-[16.66%] h-[2px] bg-zinc-100 dark:bg-zinc-800/80 -z-10" />

            {[
              { num: '1', title: (t as any).howToStep1Title, desc: (t as any).howToStep1Desc },
              { num: '2', title: (t as any).howToStep2Title, desc: (t as any).howToStep2Desc },
              { num: '3', title: (t as any).howToStep3Title, desc: (t as any).howToStep3Desc },
            ].map((step, index) => (
              <div key={step.num} className="relative flex flex-col items-center text-center group">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-indigo-100 dark:border-indigo-900 shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-indigo-400 dark:group-hover:border-indigo-500 transition-all duration-300">
                  <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">{step.num}</span>
                </div>
                <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2">{step.title}</h4>
                <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ Section (SEO Optimized) ── */}
        <div className="pt-12 pb-6 border-t border-zinc-100 dark:border-zinc-800/60 mt-4">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{(t as any).faqTitle}</h3>
            <p className="text-sm text-zinc-500">{(t as any).faqSub}</p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-3">
            {((t as any).faqs || []).map((faq: any, i: number) => (
              <details key={i} className="group rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer select-none">
                  <h4 className="text-[15px] font-bold text-zinc-800 dark:text-zinc-200">{faq.q}</h4>
                  <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 group-open:rotate-180 transition-transform duration-300">
                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                  </div>
                </summary>
                <div className="px-5 pb-5 pt-0">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 pt-4 mt-1">
                    {faq.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </main>
      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-zinc-100 dark:border-zinc-900 py-8 mt-12 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center gap-4 text-center">
          
          {/* Legal Links */}
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <button onClick={() => setLegalDoc('privacy')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {lang === 'hi' ? 'प्राइवेसी पॉलिसी' : 'Privacy Policy'}
            </button>
            <button onClick={() => setLegalDoc('terms')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {lang === 'hi' ? 'नियम और शर्तें' : 'Terms & Conditions'}
            </button>
            <button onClick={() => setLegalDoc('disclaimer')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {lang === 'hi' ? 'अस्वीकरण' : 'Disclaimer'}
            </button>
          </div>

          <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-lg mt-2">
            {t.footerNote}
          </p>
        </div>
      </footer>
      
      {/* ── Modals ── */}
      {legalDoc && (
        <LegalModal 
          type={legalDoc} 
          lang={lang} 
          onClose={() => setLegalDoc(null)} 
        />
      )}

      </div> {/* End of relative z-10 wrapper */}
    </div>
  );
}
