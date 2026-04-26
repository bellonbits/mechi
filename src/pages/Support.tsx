import { motion } from 'framer-motion';
import { 
  ChevronLeft, MessageCircle, Mail, FileText, 
  HelpCircle, ChevronRight, Zap, ExternalLink 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SupportPage = () => {
  const navigate = useNavigate();

  const faqs = [
    { q: 'How do I cancel my premium subscription?', a: 'You can cancel anytime under Payment Methods in your profile.' },
    { q: 'How does matching work?', a: 'A match is created when both you and another user swipe right on each other.' },
    { q: 'Is my data safe?', a: 'Absolutely. We encrypt all messages and offer a hard-delete option for your account.' },
  ];

  return (
    <div className="min-h-screen pb-nav-scroll app-bg overflow-y-auto">
      {/* Header */}
      <div className="pt-safe px-5 pb-4 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
        <h1 className="text-white text-xl font-black tracking-tight">Help & Support</h1>
      </div>

      <div className="px-5 space-y-6">
        {/* Contact cards */}
        <div className="grid grid-cols-2 gap-4">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center justify-center p-6 rounded-[24px]"
            style={{ background: '#1a0828', border: '1px solid rgba(156,39,176,0.15)' }}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-brand-pink/10 mb-3">
              <MessageCircle size={24} className="text-brand-pink" />
            </div>
            <span className="text-white font-bold text-sm">Live Chat</span>
            <span className="text-slate-500 text-[10px] mt-1">Available 24/7</span>
          </motion.button>

          <motion.button 
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center justify-center p-6 rounded-[24px]"
            style={{ background: '#1a0828', border: '1px solid rgba(156,39,176,0.15)' }}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-500/10 mb-3">
              <Mail size={24} className="text-blue-400" />
            </div>
            <span className="text-white font-bold text-sm">Email Us</span>
            <span className="text-slate-500 text-[10px] mt-1">support@mechi.app</span>
          </motion.button>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest ml-4 mb-3">Resources</h3>
          <div className="rounded-[24px] overflow-hidden" style={{ background: '#1a0828', border: '1px solid rgba(156,39,176,0.15)' }}>
            {[
              { icon: Zap, label: 'Safety Guidelines', path: '/privacy' },
              { icon: FileText, label: 'Community Standards', path: '/terms' },
              { icon: ExternalLink, label: 'Visit Website', path: '/' },
            ].map((item, i, arr) => (
              <div key={item.label}>
                <button
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center justify-between p-4 px-5 active:bg-white/5"
                >
                  <div className="flex items-center gap-4">
                    <item.icon size={18} className="text-slate-400" />
                    <span className="text-white font-semibold text-[15px]">{item.label}</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-600" />
                </button>
                {i < arr.length - 1 && <div className="h-[1px] mx-5 bg-white/5" />}
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest ml-4 mb-3">Frequently Asked</h3>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div 
                key={i}
                className="p-5 rounded-[22px]"
                style={{ background: '#1a0828', border: '1px solid rgba(156,39,176,0.1)' }}
              >
                <div className="flex gap-3 mb-2">
                  <HelpCircle size={16} className="text-brand-pink shrink-0 mt-0.5" />
                  <p className="text-white font-bold text-sm leading-snug">{faq.q}</p>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed pl-7">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-slate-600 text-[11px] pb-6">
          Locked out of your account? Recover it <span className="text-brand-pink underline">here</span>.
        </p>
      </div>
    </div>
  );
};
