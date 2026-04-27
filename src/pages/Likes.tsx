import { motion } from 'framer-motion';
import { Heart, Sparkles, Loader2, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLikedProfiles } from '../hooks/useProfiles';

const FREE_VISIBLE = 2;

export const LikesPage = () => {
  const navigate = useNavigate();
  const { likes, loading } = useLikedProfiles();

  return (
    <div className="min-h-screen pb-nav-scroll app-bg overflow-y-auto">
      {/* Header */}
      <div className="pt-safe px-5 pb-4 flex justify-between items-center">
        <h1 className="text-white text-2xl font-black tracking-tight">Likes</h1>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => navigate('/subscription')}
          className="px-4 py-1.5 rounded-full flex items-center gap-1.5"
          style={{ background: 'linear-gradient(135deg, #e91e8c, #9c27b0)' }}
        >
          <Sparkles size={13} className="text-white" />
          <span className="text-white text-xs font-bold">Unlock All</span>
        </motion.button>
      </div>

      <div className="px-5">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={32} className="text-brand-pink animate-spin" />
          </div>
        ) : likes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: '#1a0828' }}>
              <Heart size={32} className="text-slate-500" />
            </div>
            <p className="text-white font-bold text-base mb-1">No likes yet</p>
            <p className="text-slate-500 text-sm max-w-[220px]">When someone likes your profile, they'll appear here.</p>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/swipe')}
              className="mt-5 px-6 py-2.5 rounded-xl font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg,#e91e8c,#9c27b0)' }}
            >
              Discover People
            </motion.button>
          </div>
        ) : (
          <>
            <p className="text-slate-400 text-sm mb-5">
              {likes.length} {likes.length === 1 ? 'person' : 'people'} liked your profile
            </p>

            <div className="grid grid-cols-2 gap-3">
              {likes.map(({ id, profile }, i) => {
                const blurred = i >= FREE_VISIBLE;
                const imgSrc = profile.avatar_url
                  || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'U')}&background=1a0828&color=fff`;

                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06 }}
                    className="relative cursor-pointer active:scale-[0.96] transition-transform"
                    style={{ borderRadius: 22, overflow: 'hidden', aspectRatio: '3/4' }}
                    onClick={() => blurred ? navigate('/subscription') : navigate('/public-profile', { state: { profile } })}
                  >
                    <img
                      src={imgSrc}
                      className="w-full h-full object-cover"
                      alt={blurred ? 'Locked' : profile.full_name}
                      style={{ filter: blurred ? 'blur(7px) brightness(0.7)' : 'none' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    {profile.online && !blurred && (
                      <div
                        className="absolute top-3 right-3 w-3 h-3 bg-green-400 rounded-full"
                        style={{ border: '2px solid #0d0614' }}
                      />
                    )}

                    <div
                      className="absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: '#e91e8c', boxShadow: '0 0 16px rgba(233,30,140,0.5)' }}
                    >
                      <Heart size={14} className="text-white fill-current" />
                    </div>

                    {blurred ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <div
                          className="w-11 h-11 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(233,30,140,0.9)', boxShadow: '0 0 24px rgba(233,30,140,0.5)' }}
                        >
                          <Sparkles size={20} className="text-white" />
                        </div>
                        <span className="text-white text-xs font-bold">Unlock</span>
                      </div>
                    ) : (
                      <div className="absolute bottom-3 left-3">
                        <span className="text-white font-bold text-sm">
                          {profile.full_name}{profile.age ? `, ${profile.age}` : ''}
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {likes.length > FREE_VISIBLE && (
              <motion.div
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/subscription')}
                className="mt-5 rounded-[22px] p-5 cursor-pointer flex items-center justify-between"
                style={{
                  background: 'linear-gradient(135deg, rgba(233,30,140,0.15), rgba(156,39,176,0.15))',
                  border: '1px solid rgba(233,30,140,0.3)',
                }}
              >
                <div className="flex items-center gap-3">
                  <MessageCircle size={20} className="text-brand-pink" />
                  <div>
                    <p className="text-white font-bold text-sm">
                      {likes.length - FREE_VISIBLE} more {likes.length - FREE_VISIBLE === 1 ? 'person' : 'people'} liked you
                    </p>
                    <p className="text-slate-400 text-xs">Upgrade to see who</p>
                  </div>
                </div>
                <div
                  className="px-3 py-1.5 rounded-full text-white text-xs font-bold shrink-0"
                  style={{ background: 'linear-gradient(135deg, #e91e8c, #9c27b0)' }}
                >
                  Upgrade
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
