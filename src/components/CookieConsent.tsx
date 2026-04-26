import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cookie, ChevronDown, ChevronUp, Shield, BarChart2, Settings2, Megaphone, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CookiePrefs {
  essential: true;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
  decided: boolean;
}

const STORAGE_KEY = 'mechi_cookie_prefs';

const CATEGORIES = [
  {
    key: 'essential',
    icon: Shield,
    color: '#22c55e',
    label: 'Essential',
    desc: 'Required for authentication, security, and core app functionality. Cannot be disabled.',
    always: true,
  },
  {
    key: 'analytics',
    icon: BarChart2,
    color: '#3b82f6',
    label: 'Performance & Analytics',
    desc: 'Help us understand how the app is used via crash reports and usage metrics. Data is anonymised and never sold.',
    always: false,
  },
  {
    key: 'functional',
    icon: Settings2,
    color: '#8b5cf6',
    label: 'Functional',
    desc: 'Remember your preferences such as language, display settings, and notification choices.',
    always: false,
  },
  {
    key: 'marketing',
    icon: Megaphone,
    color: '#e91e8c',
    label: 'Marketing & Personalisation',
    desc: 'Used to show you relevant match suggestions and partner promotions tailored to your activity on Mechi.',
    always: false,
  },
] as const;

const load = (): CookiePrefs | null => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); }
  catch { return null; }
};

const save = (prefs: CookiePrefs) => localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));

export const CookieConsent = () => {
  const [show, setShow] = useState(false);
  const [manage, setManage] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<CookiePrefs>({ essential: true, analytics: true, functional: true, marketing: false, decided: false });

  useEffect(() => {
    const stored = load();
    if (!stored?.decided) setTimeout(() => setShow(true), 1800);
    else setPrefs(stored);
  }, []);

  const decide = (p: CookiePrefs) => { save(p); setPrefs(p); setShow(false); };

  const acceptAll = () => decide({ essential: true, analytics: true, functional: true, marketing: true, decided: true });
  const rejectNonEssential = () => decide({ essential: true, analytics: false, functional: false, marketing: false, decided: true });
  const saveChoices = () => decide({ ...prefs, decided: true });

  const toggleCat = (key: string) => {
    if (key === 'essential') return;
    setPrefs((p) => ({ ...p, [key]: !p[key as keyof CookiePrefs] }));
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-end pointer-events-none">
        {/* Backdrop */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 pointer-events-auto" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)' }}
          onClick={() => !manage && rejectNonEssential()} />

        {/* Sheet */}
        <motion.div
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="relative w-full pointer-events-auto overflow-hidden"
          style={{ maxHeight: '90vh', borderRadius: '28px 28px 0 0', background: '#120820', border: '1px solid rgba(156,39,176,0.25)', borderBottom: 'none' }}
        >
          {/* Drag handle */}
          <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-1" style={{ background: 'rgba(255,255,255,0.15)' }} />

          <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 24px)' }}>
            <div className="px-5 py-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(233,30,140,0.15)' }}>
                    <Cookie size={20} className="text-brand-pink" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-base">Cookie Preferences</h3>
                    <p className="text-slate-400 text-[11px]">Control how we use your data</p>
                  </div>
                </div>
                <button onClick={rejectNonEssential} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <X size={14} className="text-slate-400" />
                </button>
              </div>

              {!manage ? (
                <>
                  {/* Summary */}
                  <div className="p-4 rounded-2xl mb-4" style={{ background: 'rgba(233,30,140,0.06)', border: '1px solid rgba(233,30,140,0.15)' }}>
                    <p className="text-slate-300 text-[13px] leading-relaxed">
                      We and our partners use cookies and similar technologies to enhance your experience, analyse usage, and show you personalised content. You can choose which categories to allow below.{' '}
                      <Link to="/privacy" onClick={() => setShow(false)} className="text-brand-pink underline inline-flex items-center gap-0.5">
                        Learn more <ExternalLink size={10} />
                      </Link>
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-2.5">
                    <motion.button whileTap={{ scale: 0.97 }} onClick={acceptAll}
                      className="w-full h-12 rounded-2xl font-black text-white text-sm"
                      style={{ background: 'linear-gradient(135deg,#e91e8c,#9c27b0)', boxShadow: '0 0 28px rgba(233,30,140,0.35)' }}>
                      Accept All Cookies
                    </motion.button>
                    <div className="grid grid-cols-2 gap-2.5">
                      <motion.button whileTap={{ scale: 0.97 }} onClick={() => setManage(true)}
                        className="h-11 rounded-xl font-semibold text-sm text-white"
                        style={{ background: '#220f38', border: '1px solid rgba(156,39,176,0.25)' }}>
                        Manage Preferences
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.97 }} onClick={rejectNonEssential}
                        className="h-11 rounded-xl font-semibold text-sm text-slate-400"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        Reject Non-Essential
                      </motion.button>
                    </div>
                  </div>

                  {/* CCPA + legal links */}
                  <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 justify-center">
                    {[['Privacy Policy', '/privacy'], ['Cookie Policy', '/privacy'], ['Do Not Sell My Data', '/data-collection'], ['Terms', '/terms']].map(([label, path]) => (
                      <Link key={label} to={path} onClick={() => setShow(false)} className="text-slate-500 text-[11px] underline">{label}</Link>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* Manage view */}
                  <p className="text-slate-400 text-[13px] mb-4">Toggle each category. Essential cookies cannot be disabled as they are required for the app to work.</p>

                  <div className="space-y-2 mb-4">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const on = cat.always || (prefs[cat.key as keyof CookiePrefs] as boolean);
                      const isOpen = expanded === cat.key;

                      return (
                        <div key={cat.key} className="rounded-2xl overflow-hidden" style={{ background: '#1a0828', border: '1px solid rgba(156,39,176,0.15)' }}>
                          <div className="flex items-center gap-3 px-4 py-3.5 cursor-pointer" onClick={() => setExpanded(isOpen ? null : cat.key)}>
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${cat.color}18` }}>
                              <Icon size={15} style={{ color: cat.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-white text-sm font-semibold">{cat.label}</span>
                                {cat.always && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>Always on</span>}
                              </div>
                            </div>
                            {/* Toggle */}
                            <div className="flex items-center gap-2">
                              <button onClick={(e) => { e.stopPropagation(); toggleCat(cat.key); }}
                                className="w-11 h-6 rounded-full relative transition-all"
                                style={{ background: on ? '#e91e8c' : 'rgba(255,255,255,0.1)', cursor: cat.always ? 'not-allowed' : 'pointer' }}>
                                <motion.div animate={{ x: on ? 20 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                  className="absolute top-1 w-4 h-4 rounded-full bg-white" />
                              </button>
                              {isOpen ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                            </div>
                          </div>

                          <AnimatePresence>
                            {isOpen && (
                              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                <p className="px-4 pb-4 text-slate-400 text-[12px] leading-relaxed">{cat.desc}</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 mb-2">
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => setManage(false)}
                      className="h-11 rounded-xl font-semibold text-sm text-slate-400"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      Back
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={saveChoices}
                      className="h-11 rounded-xl font-black text-white text-sm"
                      style={{ background: 'linear-gradient(135deg,#e91e8c,#9c27b0)' }}>
                      Save Choices
                    </motion.button>
                  </div>
                </>
              )}
            </div>
            {/* Bottom safe area spacer */}
            <div style={{ height: 'max(12px,env(safe-area-inset-bottom))' }} />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const useCookiePrefs = () => {
  const stored = load();
  return stored?.decided ? stored : null;
};
