import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Heart, X, SlidersHorizontal, MapPin, Info, Zap, Loader2, Shield } from 'lucide-react';
import { useDiscoverProfiles, type Profile } from '../hooks/useProfiles';

const SwipeCard = ({
  profile, isTop, onRemove,
}: {
  profile: Profile; isTop: boolean; onRemove: (dir: 'left' | 'right') => void;
}) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-20, 20]);
  const cardOpacity = useTransform(x, [-220, -160, 0, 160, 220], [0, 1, 1, 1, 0]);
  const likeOpacity = useTransform(x, [30, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-30, -120], [0, 1]);
  const image = profile.photos?.[0] || profile.avatar_url;

  return (
    <motion.div
      style={{ x, rotate, opacity: cardOpacity, cursor: isTop ? 'grab' : 'default', zIndex: isTop ? 10 : 5 }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.85}
      onDragEnd={(_e, info) => {
        if (info.offset.x > 100) onRemove('right');
        else if (info.offset.x < -100) onRemove('left');
      }}
      animate={isTop ? { scale: 1, y: 0 } : { scale: 0.96, y: 14 }}
      exit={{ x: x.get() > 0 ? 500 : -500, opacity: 0, scale: 0.75, transition: { duration: 0.28 } }}
      className="absolute inset-0"
    >
      <div className="w-full h-full rounded-[32px] overflow-hidden relative shadow-2xl">
        {image ? (
          <img src={image} className="w-full h-full object-cover pointer-events-none select-none" alt="" draggable={false} />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: '#220f38' }}>
            <span className="text-6xl font-black text-white opacity-30">{profile.full_name?.[0]}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

        {/* Verified badge */}
        {profile.is_verified && (
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full flex items-center gap-1.5" style={{ background: '#3b82f6', boxShadow: '0 0 16px rgba(59,130,246,0.5)' }}>
            <Shield size={11} className="text-white" />
            <span className="text-white text-[11px] font-black uppercase tracking-wide">Verified</span>
          </div>
        )}
        <button className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <Info size={16} className="text-white" />
        </button>

        {/* Stamps */}
        <motion.div style={{ opacity: likeOpacity }} className="absolute top-10 left-5 -rotate-12">
          <div style={{ border: '3.5px solid #4ade80', borderRadius: 14, padding: '4px 14px', background: 'rgba(74,222,128,0.12)' }}>
            <span className="text-green-400 text-3xl font-black tracking-tighter">LIKE</span>
          </div>
        </motion.div>
        <motion.div style={{ opacity: nopeOpacity }} className="absolute top-10 right-5 rotate-12">
          <div style={{ border: '3.5px solid #f87171', borderRadius: 14, padding: '4px 14px', background: 'rgba(248,113,113,0.12)' }}>
            <span className="text-red-400 text-3xl font-black tracking-tighter">NOPE</span>
          </div>
        </motion.div>

        {/* Profile info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-2.5 mb-1.5">
            <h2 className="text-white text-[28px] font-black tracking-tight">
              {profile.full_name}{profile.age ? `, ${profile.age}` : ''}
            </h2>
          </div>
          {profile.location && (
            <div className="flex items-center gap-1.5 text-slate-300 text-sm mb-2">
              <MapPin size={13} className="text-brand-pink" /><span>{profile.location}</span>
            </div>
          )}
          {profile.bio && <p className="text-slate-300 text-sm leading-relaxed line-clamp-2">{profile.bio}</p>}
          {profile.interests?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {profile.interests.slice(0, 3).map((t) => (
                <span key={t} className="text-[11px] px-2.5 py-1 rounded-full text-white font-semibold" style={{ background: 'rgba(233,30,140,0.35)' }}>{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const SwipePage = () => {
  const { profiles, loading, recordSwipe } = useDiscoverProfiles();

  const removeTop = (dir: 'left' | 'right') => {
    if (profiles.length === 0) return;
    recordSwipe(profiles[0].id, dir);
  };

  return (
    <div className="screen-full flex flex-col overflow-hidden" style={{ background: 'linear-gradient(180deg,#1a0828 0%,#0d0614 100%)' }}>
      {/* Header */}
      <div className="pt-safe px-5 pb-3 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="" style={{ width: 28, height: 28, objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(233,30,140,0.5))' }} />
          <h1 className="text-white text-xl font-black tracking-tight">Discover</h1>
        </div>
        <button className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#220f38' }}>
          <SlidersHorizontal size={18} className="text-white" />
        </button>
      </div>

      {/* Card stack */}
      <div className="flex-1 relative px-4 min-h-0 pb-1">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 size={40} className="text-brand-pink animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {profiles.length > 0 ? (
              profiles.slice(0, 2).reverse().map((profile, i, arr) => (
                <SwipeCard key={profile.id} profile={profile} isTop={i === arr.length - 1} onRemove={removeTop} />
              ))
            ) : (
              <motion.div key="empty" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
                <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: '#220f38' }}>
                  <Zap size={40} className="text-brand-pink" />
                </div>
                <h3 className="text-white text-2xl font-black mb-2">You're all caught up!</h3>
                <p className="text-slate-400 text-base max-w-[240px] leading-relaxed">New people join daily. Check back soon!</p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Action buttons */}
      {!loading && profiles.length > 0 && (
        <div className="shrink-0 flex justify-center items-center gap-8 pt-4"
          style={{ paddingBottom: 'calc(72px + max(16px, env(safe-area-inset-bottom)))' }}>
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => removeTop('left')}
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: '#220f38', border: '1.5px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
            <X size={28} className="text-slate-300 stroke-[2.5]" />
          </motion.button>
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => removeTop('right')}
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#e91e8c,#9c27b0)', boxShadow: '0 0 40px rgba(233,30,140,0.55)' }}>
            <Heart size={34} className="text-white fill-current" />
          </motion.button>
        </div>
      )}
    </div>
  );
};
