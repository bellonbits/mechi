import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, ShieldCheck, Heart, MessageCircle, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: UserPlus, color: '#e91e8c', num: '01',
    title: 'Create Your Profile',
    body: 'Sign up with your email and complete your profile with real photos and honest information. Profiles with authentic details get up to 3× more matches. Use your real first name and a genuine bio that reflects who you are.',
  },
  {
    icon: ShieldCheck, color: '#22c55e', num: '02',
    title: 'Get Verified',
    body: 'Upload two real photos to earn your Verified badge. The badge signals to other members that you are genuine, building trust before a single message is sent. Verified users receive 2× more likes and appear higher in search results.',
  },
  {
    icon: Heart, color: '#e91e8c', num: '03',
    title: 'Discover Matches',
    body: 'Browse by goal: long-term partner, free tonight, serious daters, or new friends. Swipe profiles in Discover mode or explore curated categories. Our algorithm learns your preferences over time to show you more compatible people.',
  },
  {
    icon: MessageCircle, color: '#9c27b0', num: '04',
    title: 'Chat in Real Time',
    body: 'Once you match, start a conversation instantly. Mechi uses real-time messaging so you see responses the moment they arrive — no page refresh needed. Add voice and video calls directly from the chat window.',
  },
  {
    icon: Star, color: '#f59e0b', num: '05',
    title: 'Unlock Premium',
    body: 'With Mechi Premium you can see who liked you, get unlimited swipes, boost your profile visibility, and access advanced filters. Premium members find matches significantly faster on average.',
  },
  {
    icon: Zap, color: '#3b82f6', num: '06',
    title: 'Meet & Connect',
    body: 'When the conversation flows naturally, suggest meeting up. Mechi provides in-app safety tips for first dates and lets you share your live location with a trusted contact for peace of mind.',
  },
];

const tips = [
  'Complete every section of your profile — incomplete profiles are shown less.',
  'Upload your best, most recent photo as your main image.',
  'Write at least 3 sentences in your bio. Specifics attract better matches.',
  'Respond to messages within 24 hours — active users rank higher.',
  'Report any account that feels suspicious. Our safety team acts within 2 hours.',
];

export const HowItWorksPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen pb-nav-scroll app-bg overflow-y-auto">
      <div className="pt-safe px-5 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: '#220f38' }}>
          <ArrowLeft size={18} className="text-white" />
        </button>
        <div>
          <h1 className="text-white text-xl font-black">How Mechi Works</h1>
          <p className="text-slate-400 text-xs">Your guide to finding real connections</p>
        </div>
      </div>

      {/* Hero */}
      <div className="px-5 mb-6">
        <div className="rounded-[24px] p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#e91e8c22,#9c27b022)', border: '1px solid rgba(233,30,140,0.2)' }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle,rgba(233,30,140,0.2) 0%,transparent 70%)' }} />
          <img src="/logo.png" alt="" style={{ width: 48, height: 48, objectFit: 'contain', filter: 'drop-shadow(0 0 12px rgba(233,30,140,0.5))' }} className="mb-3" />
          <h2 className="text-white font-black text-lg mb-1">Find love the real way</h2>
          <p className="text-slate-300 text-sm leading-relaxed">Mechi is built on authenticity. Every feature is designed to help you build genuine connections — not just swipe counts.</p>
        </div>
      </div>

      {/* Steps */}
      <div className="px-5 mb-6">
        <h2 className="text-white font-black text-base mb-4">The 6 Steps</h2>
        <div className="space-y-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.num} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="flex gap-4 p-4 rounded-[20px]" style={{ background: '#1a0828', border: '1px solid rgba(156,39,176,0.15)' }}>
                <div className="shrink-0 flex flex-col items-center">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: `${s.color}18` }}>
                    <Icon size={20} style={{ color: s.color }} />
                  </div>
                  <span className="text-[10px] font-black mt-1.5" style={{ color: s.color }}>{s.num}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-[15px] mb-1">{s.title}</h3>
                  <p className="text-slate-400 text-[13px] leading-relaxed">{s.body}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Pro tips */}
      <div className="px-5 mb-6">
        <h2 className="text-white font-black text-base mb-4">Pro Tips for More Matches</h2>
        <div className="space-y-2.5">
          {tips.map((tip, i) => (
            <div key={i} className="flex gap-3 p-3.5 rounded-[16px]" style={{ background: '#1a0828' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(233,30,140,0.15)', minWidth: 24 }}>
                <span className="text-brand-pink text-[11px] font-black">{i + 1}</span>
              </div>
              <p className="text-slate-300 text-[13px] leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ-style trust section */}
      <div className="px-5 mb-6">
        <div className="p-4 rounded-[20px] space-y-3" style={{ background: '#1a0828', border: '1px solid rgba(156,39,176,0.15)' }}>
          <h3 className="text-white font-bold text-sm">Safety & Trust</h3>
          {[
            ['Is Mechi free?', 'The core experience is free. Premium unlocks advanced features like seeing who liked you.'],
            ['How does verification work?', 'Upload two photos of yourself. Our system checks they match your profile and awards the blue shield badge.'],
            ['Can I block someone?', 'Yes — tap the three-dot menu in any chat or profile to block and report instantly.'],
            ['Is my data safe?', 'All data is encrypted in transit and at rest. We never sell personal data to third parties.'],
          ].map(([q, a]) => (
            <div key={q} className="pt-3 border-t" style={{ borderColor: 'rgba(156,39,176,0.15)' }}>
              <p className="text-white text-[13px] font-semibold mb-1">{q}</p>
              <p className="text-slate-400 text-[12px] leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
