import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Scale, FileText, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Language } from '../types';

export type LegalDocType = 'privacy' | 'terms' | 'disclaimer';

interface LegalModalProps {
  type: LegalDocType;
  onClose: () => void;
  lang: Language;
}

const content = {
  en: {
    privacy: {
      title: 'Privacy Policy',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
      text: (
        <div className="space-y-4">
          <p><strong>Last Updated:</strong> August 2026</p>
          <p>At GitFast, your privacy is our absolute priority. We have designed this tool to operate <strong>100% Client-Side</strong>, meaning we do not have a backend database and we do not track you.</p>
          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mt-4">1. Data Collection</h4>
          <p>We do not collect, transmit, or store any personal information, GitHub URLs, or GitHub API tokens on our servers. All parsing and conversion happens directly in your browser.</p>
          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mt-4">2. Local Storage</h4>
          <p>We use your browser's local storage (localStorage) exclusively to save your "Favorite" CDN links, your conversion history, and your language preference. This data never leaves your device.</p>
          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mt-4">3. Third-Party Services</h4>
          <p>By using the generated CDN links, you are subject to the privacy policies of the respective CDN providers (e.g., jsDelivr, Statically, Cloudflare). We do not control their data collection practices.</p>
        </div>
      )
    },
    terms: {
      title: 'Terms and Conditions',
      icon: <FileText className="w-6 h-6 text-blue-500" />,
      text: (
        <div className="space-y-4">
          <p><strong>Last Updated:</strong> August 2026</p>
          <p>By accessing and using GitFast, you agree to be bound by these Terms and Conditions.</p>
          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mt-4">1. Use of Service</h4>
          <p>GitFast is a utility tool that formats and transforms GitHub URLs into valid CDN URLs. You agree to use this tool only for lawful purposes and in accordance with GitHub's Terms of Service.</p>
          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mt-4">2. CDN Provider Compliance</h4>
          <p>You must adhere to the usage policies of the CDNs provided (jsDelivr, Statically, GitHack). Do not use this tool to serve malicious content, malware, or copyright-infringing materials.</p>
          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mt-4">3. Intellectual Property</h4>
          <p>GitFast is an independent open-source utility and is <strong>not</strong> affiliated with, endorsed by, or sponsored by GitHub, jsDelivr, or Statically.</p>
        </div>
      )
    },
    disclaimer: {
      title: 'Disclaimer',
      icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
      text: (
        <div className="space-y-4">
          <p><strong>Last Updated:</strong> August 2026</p>
          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mt-4">1. "As-Is" Software</h4>
          <p>GitFast is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, either express or implied, including, but not limited to, warranties of merchantability or fitness for a particular purpose.</p>
          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mt-4">2. No Liability</h4>
          <p>In no event shall the creators or contributors of GitFast be liable for any direct, indirect, incidental, special, or consequential damages arising out of the use or inability to use the generated URLs or the service.</p>
          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mt-4">3. Content Responsibility</h4>
          <p>We do not host, cache, or serve any files. We merely generate URLs that point to third-party CDN providers. You are solely responsible for the content you link to using this tool.</p>
        </div>
      )
    }
  },
  hi: {
    privacy: {
      title: 'प्राइवेसी पॉलिसी (Privacy Policy)',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
      text: (
        <div className="space-y-4">
          <p><strong>अंतिम अपडेट:</strong> अगस्त 2026</p>
          <p>GitFast पर, आपकी प्राइवेसी हमारी सर्वोच्च प्राथमिकता है। हमने इस टूल को <strong>100% क्लाइंट-साइड</strong> काम करने के लिए डिज़ाइन किया है, जिसका अर्थ है कि हमारे पास कोई बैकएंड डेटाबेस नहीं है और हम आपको ट्रैक नहीं करते हैं।</p>
          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mt-4">1. डेटा कलेक्शन</h4>
          <p>हम आपके सर्वर पर कोई व्यक्तिगत जानकारी, GitHub URL, या GitHub API टोकन एकत्र, ट्रांसमिट या स्टोर नहीं करते हैं। सभी कनवर्ज़न सीधे आपके ब्राउज़र में होते हैं।</p>
          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mt-4">2. लोकल स्टोरेज</h4>
          <p>हम आपके पसंदीदा (Favorite) CDN लिंक, हिस्ट्री और भाषा (Language) को सेव करने के लिए केवल आपके ब्राउज़र के लोकल स्टोरेज (localStorage) का उपयोग करते हैं। यह डेटा कभी भी आपके डिवाइस से बाहर नहीं जाता है।</p>
          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mt-4">3. थर्ड-पार्टी सेवाएं</h4>
          <p>उत्पन्न CDN लिंक्स का उपयोग करके, आप संबंधित CDN प्रदाताओं (जैसे, jsDelivr, Statically) की गोपनीयता नीतियों के अधीन हैं। हम उनके डेटा कलेक्शन प्रथाओं को नियंत्रित नहीं करते हैं।</p>
        </div>
      )
    },
    terms: {
      title: 'नियम और शर्तें (Terms & Conditions)',
      icon: <FileText className="w-6 h-6 text-blue-500" />,
      text: (
        <div className="space-y-4">
          <p><strong>अंतिम अपडेट:</strong> अगस्त 2026</p>
          <p>GitFast का उपयोग करके, आप इन नियमों और शर्तों से बंधे होने के लिए सहमत हैं।</p>
          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mt-4">1. सेवा का उपयोग</h4>
          <p>GitFast एक टूल है जो GitHub URL को CDN URL में बदलता है। आप इस टूल का उपयोग केवल वैध उद्देश्यों (Lawful purposes) के लिए और GitHub की सेवा की शर्तों (Terms of Service) के अनुसार करने के लिए सहमत हैं।</p>
          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mt-4">2. CDN प्रदाता अनुपालन</h4>
          <p>आपको प्रदान किए गए CDN (jsDelivr, Statically, GitHack) की उपयोग नीतियों का पालन करना चाहिए। इस टूल का उपयोग दुर्भावनापूर्ण सॉफ़्टवेयर (Malware) या कॉपीराइट उल्लंघन करने वाली सामग्री को सर्व करने के लिए न करें।</p>
          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mt-4">3. बौद्धिक संपदा (Intellectual Property)</h4>
          <p>GitFast एक स्वतंत्र ओपन-सोर्स टूल है और यह GitHub, jsDelivr, या Statically से <strong>संबद्ध या प्रायोजित नहीं</strong> है।</p>
        </div>
      )
    },
    disclaimer: {
      title: 'अस्वीकरण (Disclaimer)',
      icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
      text: (
        <div className="space-y-4">
          <p><strong>अंतिम अपडेट:</strong> अगस्त 2026</p>
          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mt-4">1. "As-Is" सॉफ़्टवेयर</h4>
          <p>GitFast को "AS IS" (जैसा है) के आधार पर प्रदान किया जाता है, जिसमें किसी भी प्रकार की कोई वारंटी नहीं है, चाहे वह व्यक्त हो या निहित।</p>
          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mt-4">2. कोई दायित्व नहीं</h4>
          <p>किसी भी स्थिति में GitFast के निर्माता इस टूल या उत्पन्न URL के उपयोग से होने वाले किसी भी प्रत्यक्ष या अप्रत्यक्ष नुकसान (Damages) के लिए उत्तरदायी नहीं होंगे।</p>
          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mt-4">3. सामग्री की ज़िम्मेदारी</h4>
          <p>हम कोई फ़ाइल होस्ट या कैश नहीं करते हैं। हम केवल ऐसे URL बनाते हैं जो थर्ड-पार्टी CDN प्रदाताओं की ओर इशारा करते हैं। आप इस टूल का उपयोग करके जिस भी सामग्री (Content) को लिंक करते हैं, उसके लिए आप स्वयं ज़िम्मेदार हैं।</p>
        </div>
      )
    }
  }
};

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose, lang }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const doc = content[lang][type];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800">
              {doc.icon}
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {doc.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
          <div className="text-[15px] text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-4">
            {doc.text}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-bold transition-colors"
          >
            {lang === 'hi' ? 'समझ गया' : 'I Understand'}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
