import { motion } from 'framer-motion';
import { Heart, SlidersHorizontal, MapPin, Loader2, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDiscoverProfiles } from '../hooks/useProfiles';
import { useSubscription } from '../hooks/useSubscription';

const FREE_VISIBLE = 6;

export const MatchesPage = () => {
  const navigate = useNavigate();
  const { profiles, loading } = useDiscoverProfiles();
  const { isPremium } = useSubscription();

  const visible = isPremium ? profiles : profiles.slice(0, FREE_VISIBLE);
  const locked = !isPremium && profiles.length > FREE_VISIBLE;

  return (
    <div className="min-h-screen pb-nav-scroll overflow-y-auto app-bg">
      {/* Header */}
      <div className="pt-safe px-5 pb-3 flex justify-between items-center">
        <h1 className="text-white text-2xl font-black tracking-tight">Nearby</h1>
        <div className="flex items-center gap-2">
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: '#220f38' }}
          >
            <SlidersHorizontal size={17} className="text-white" />
          </button>
        </div>
      </div>

      <div className="px-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={32} className="text-brand-pink animate-spin" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: '#1a0828' }}>
              <Heart size={32} className="text-slate-500" />
            </div>
            <p className="text-white font-bold text-base mb-1">No one nearby yet</p>
            <p className="text-slate-500 text-sm max-w-[220px]">
              Be among the first! Invite friends or check back soon.
            </p>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/swipe')}
              className="mt-5 px-6 py-2.5 rounded-xl font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg,#e91e8c,#9c27b0)' }}
            >
              Start Swiping
            </motion.button>
          </div>
        ) : (
          <>
            <p className="text-slate-400 text-xs mb-4 px-1">
              {profiles.length} {profiles.length === 1 ? 'person' : 'people'} available
            </p>

            <div className="grid grid-cols-3 gap-3">
              {visible.map((profile, i) => {
                const imgSrc =
                  profile.photos?.[0] ||
                  profile.avatar_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'U')}&background=1a0828&color=fff`;

                return (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex flex-col gap-1.5 cursor-pointer"
                    onClick={() => navigate('/swipe')}
                  >
                    <div
                      className="aspect-square rounded-[20px] overflow-hidden relative"
                      style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <img
                        src={imgSrc}
                        className="w-full h-full object-cover"
                        alt={profile.full_name}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      {profile.is_verified && (
                        <div
                          className="absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: '#3b82f6' }}
                        >
                          <Shield size={10} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="px-0.5">
                      <p className="text-white font-semibold text-xs truncate">
                        {profile.full_name?.split(' ')[0]}{profile.age ? `, ${profile.age}` : ''}
                      </p>
                      {profile.location && (
                        <p className="text-slate-500 text-[10px] truncate flex items-center gap-0.5">
                          <MapPin size={8} /> {profile.location}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Upgrade CTA if profiles are hidden */}
            {locked && (
              <motion.div
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/subscription')}
                className="mt-5 rounded-[22px] p-5 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, rgba(233,30,140,0.15), rgba(156,39,176,0.15))',
                  border: '1px solid rgba(233,30,140,0.3)',
                }}
              >
                <p className="text-white font-bold text-sm text-center mb-1">
                  +{profiles.length - FREE_VISIBLE} more people nearby
                </p>
                <p className="text-slate-400 text-xs text-center mb-4">Upgrade to see all profiles</p>
                <div
                  className="py-3 rounded-xl text-white text-sm font-bold text-center"
                  style={{ background: 'linear-gradient(135deg,#e91e8c,#9c27b0)' }}
                >
                  Go Premium
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
