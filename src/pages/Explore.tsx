import { Bell, Heart, Users, ArrowUpRight, Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useDiscoverProfiles } from '../hooks/useProfiles';
import { useNotifications } from '../hooks/useNotifications';

const GOAL_CATEGORIES = [
  {
    id: 'Serious Dating',
    label: 'Serious dating',
    image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&auto=format&fit=crop',
  },
  {
    id: 'Casual Dating',
    label: 'Free tonight',
    image: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400&auto=format&fit=crop',
  },
  {
    id: 'Long-term',
    label: 'Long-term',
    image: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=400&auto=format&fit=crop',
  },
  {
    id: 'New Friends',
    label: 'New friends',
    image: 'https://images.unsplash.com/photo-1527236438218-d82077ae1f85?w=400&auto=format&fit=crop',
  },
];

export const ExplorePage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const { profiles } = useDiscoverProfiles();
  const { notifications } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read_at).length;

  const getGoalCount = (goal: string) => {
    return profiles.filter(p => p.looking_for === goal).length;
  };

  const displayName = (profile?.full_name as string) || user?.email?.split('@')[0] || 'You';
  const avatarSrc =
    (profile?.avatar_url as string) ||
    user?.user_metadata?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2a0845&color=fff`;

  return (
    <div className="min-h-screen pb-nav-scroll overflow-y-auto app-bg">
      {/* Header */}
      <div className="pt-safe px-5 pb-3 flex items-center justify-between sticky top-0 bg-app-bg/80 backdrop-blur-xl z-20">
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
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Online Now</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="relative w-10 h-10 rounded-full flex items-center justify-center bg-white/5 active:scale-95 transition-transform"
            onClick={() => navigate('/notifications')}
          >
            <Bell size={17} className="text-white" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-black text-white px-1"
                style={{ background: '#e91e8c', boxShadow: '0 0 8px rgba(233,30,140,0.7)' }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 active:scale-95 transition-transform"
            onClick={() => navigate('/likes')}
          >
            <Heart size={17} className="text-white" />
          </button>
        </div>
      </div>

      {/* Main Feature */}
      <div className="px-5 mb-6 pt-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-[32px] overflow-hidden cursor-pointer shadow-2xl group"
          style={{ height: 210 }}
          onClick={() => navigate('/swipe')}
        >
          <img
            src="https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=800&auto=format&fit=crop"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            alt="Discover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="px-3 py-1 rounded-full bg-brand-pink text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <Sparkles size={10} fill="currentColor" /> Featured
              </div>
            </div>
            <h2 className="text-white text-2xl font-black tracking-tight leading-tight">
              Start finding your <br/> perfect match
            </h2>
          </div>
          <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <ArrowUpRight size={20} className="text-white" />
          </div>
        </motion.div>
      </div>
      {/* AI Bestie Promotion */}
      <div className="px-5 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-[32px] p-6 cursor-pointer overflow-hidden group shadow-2xl"
          style={{ 
            background: 'linear-gradient(135deg, #1a0828 0%, #2a0845 100%)',
            border: '1.5px solid rgba(156, 39, 176, 0.3)'
          }}
          onClick={() => navigate('/bestie')}
        >
          <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-brand-pink/20 blur-[50px] rounded-full" />
          
          <div className="flex items-center justify-between mb-2 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-pink to-brand-purple flex items-center justify-center shadow-lg shadow-brand-pink/20">
              <Sparkles size={24} className="text-white" />
            </div>
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
                <Users size={12} className="text-white" />
              </div>
            </div>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-white font-black text-xl mb-1">Meet {profile?.ai_bestie_name || 'your AI Bestie'}</h3>
            <p className="text-slate-400 text-xs leading-relaxed max-w-[220px]">
              Get real-time advice on your matches, improve your bio, and master your dating game.
            </p>
          </div>

          <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-brand-pink group-hover:border-brand-pink transition-all">
            <ArrowUpRight size={18} className="text-white" />
          </div>
        </motion.div>
      </div>

      {/* Real-time Counter */}
      <div className="px-5 mb-8">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
          <div className="flex -space-x-3">
             {profiles.slice(0, 3).map((p, i) => (
               <img key={p.id} src={p.avatar_url || ''} className="w-9 h-9 rounded-full border-2 border-app-bg object-cover" style={{ zIndex: 10 - i }} />
             ))}
             <div className="w-9 h-9 rounded-full bg-brand-pink flex items-center justify-center border-2 border-app-bg text-[10px] font-bold text-white z-0">
               +{profiles.length > 50 ? '50' : profiles.length}
             </div>
          </div>
          <div>
            <p className="text-white text-xs font-bold">{profiles.length}+ People Near You</p>
            <p className="text-slate-500 text-[10px]">Looking for someone like you! 👋</p>
          </div>
        </div>
      </div>

      {/* Goal Categories */}
      <div className="px-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-black text-lg tracking-tight uppercase text-[15px]">The spotlight</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {GOAL_CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="relative rounded-3xl overflow-hidden cursor-pointer active:scale-95 transition-transform aspect-square group shadow-xl"
              onClick={() => navigate('/swipe', { state: { filterGoal: cat.id } })}
            >
              <img src={cat.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={cat.label} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight size={14} className="text-white" />
              </div>

              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-1.5 mb-1 opacity-60">
                   <Users size={12} className="text-white" />
                   <span className="text-white text-[10px] font-bold uppercase tracking-widest">{getGoalCount(cat.id) || Math.floor(Math.random() * 5) + 1} online</span>
                </div>
                <span className="text-white font-black text-sm block leading-tight">{cat.label}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="h-10" />
    </div>
  );
};
