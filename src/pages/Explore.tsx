import { Bell, Heart, Users, ArrowUpRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';

const GOAL_CATEGORIES = [
  {
    id: 'serious',
    label: 'Serious Dating',
    image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&auto=format&fit=crop',
  },
  {
    id: 'casual',
    label: 'Free Tonight',
    image: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400&auto=format&fit=crop',
  },
  {
    id: 'longterm',
    label: 'Long-term',
    image: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=400&auto=format&fit=crop',
  },
  {
    id: 'friends',
    label: 'New Friends',
    image: 'https://images.unsplash.com/photo-1527236438218-d82077ae1f85?w=400&auto=format&fit=crop',
  },
];

export const ExplorePage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();

  const displayName = (profile?.full_name as string) || user?.email?.split('@')[0] || 'You';
  const avatarSrc =
    (profile?.avatar_url as string) ||
    user?.user_metadata?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2a0845&color=fff`;

  return (
    <div className="min-h-screen pb-nav-scroll overflow-y-auto app-bg">
      {/* Header */}
      <div className="pt-safe px-5 pb-3 flex items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate('/profile')}
        >
          <div
            className="w-11 h-11 rounded-full overflow-hidden shrink-0"
            style={{ border: '2.5px solid #e91e8c' }}
          >
            {!user ? (
              <div className="w-full h-full flex items-center justify-center" style={{ background: '#220f38' }}>
                <Loader2 size={16} className="text-white animate-spin" />
              </div>
            ) : (
              <img src={avatarSrc} className="w-full h-full object-cover" alt={displayName} />
            )}
          </div>
          <div>
            <span className="text-white font-bold text-base leading-tight block">{displayName}</span>
            {!!(profile?.age as number) && (
          <span className="text-slate-400 text-xs">Age {profile?.age as number}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: '#220f38' }}
            onClick={() => navigate('/likes')}
          >
            <Bell size={17} className="text-white" />
          </button>
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: '#220f38' }}
            onClick={() => navigate('/likes')}
          >
            <Heart size={17} className="text-white" />
          </button>
        </div>
      </div>

      {/* Welcome */}
      <div className="px-5 mb-4">
        <p className="text-slate-400 text-sm">Welcome to Mechi</p>
      </div>

      {/* Hero card — taps go to swipe */}
      <div className="px-5 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative rounded-[28px] overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
          style={{ height: 200 }}
          onClick={() => navigate('/swipe')}
        >
          <img
            src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&auto=format&fit=crop"
            className="w-full h-full object-cover"
            alt="Find your match"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className="absolute bottom-5 left-5">
            <h2 className="text-white text-[22px] font-black tracking-tight">
              {(profile?.looking_for as string) || 'Find your match'}
            </h2>
          </div>
        </motion.div>
      </div>

      {/* Categories */}
      <div className="px-5">
        <div className="flex justify-between items-center mb-3.5">
          <span className="text-white font-semibold text-sm">goal-driven dating</span>
          <button className="text-brand-pink text-sm font-medium" onClick={() => navigate('/swipe')}>
            View all
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {GOAL_CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="relative rounded-[22px] overflow-hidden cursor-pointer active:scale-[0.96] transition-transform"
              style={{ aspectRatio: '1' }}
              onClick={() => navigate('/swipe')}
            >
              <img src={cat.image} className="w-full h-full object-cover" alt={cat.label} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/30" />

              <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }}
                >
                  <Users size={10} className="text-white" />
                  <span className="text-white text-[10px] font-bold">Join</span>
                </div>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)' }}
                >
                  <ArrowUpRight size={13} className="text-white" />
                </div>
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                <span className="text-white font-black text-[13px]">{cat.label}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
