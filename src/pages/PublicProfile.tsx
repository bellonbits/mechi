import { motion } from 'framer-motion';
import { 
  ChevronLeft, MapPin, Shield, Star, Zap, Heart 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Profile } from '../hooks/useProfiles';
import { supabase } from '../utils/supabase';
import { useAuthStore } from '../store/useAuthStore';

export const PublicProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = location.state?.profile as Profile;
  const { user } = useAuthStore();

  const handleSwipe = async (dir: 'left' | 'right') => {
    if (!user || !profile) return;
    await supabase.from('swipes').upsert({
      swiper_id: user.id,
      swiped_id: profile.id,
      direction: dir
    }, { onConflict: 'swiper_id,swiped_id' });
    navigate(-1);
  };

  if (!profile) {
    return (
      <div className="min-h-screen app-bg flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-white text-xl font-bold mb-4">Profile not found</h2>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-brand-pink text-white rounded-full">Go Back</button>
      </div>
    );
  }

  const images = profile.photos?.length > 0 ? profile.photos : [profile.avatar_url];

  return (
    <div className="min-h-screen pb-nav-scroll app-bg overflow-y-auto">
      {/* Hero Image Slider (Simplified) */}
      <div className="relative h-[65vh] w-full">
        <img 
          src={images[0] || ''} 
          className="w-full h-full object-cover" 
          alt={profile.full_name || ''} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-app-bg via-transparent to-black/30" />
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-safe left-5 w-10 h-10 rounded-full flex items-center justify-center bg-black/30 backdrop-blur-md border border-white/10"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>

        {/* Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-white text-3xl font-black">
              {profile.full_name}{profile.age ? `, ${profile.age}` : ''}
            </h1>
            {profile.is_verified && (
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                <Shield size={12} className="text-white" />
              </div>
            )}
          </div>
          {profile.location && (
            <div className="flex items-center gap-1.5 text-slate-300 text-sm">
              <MapPin size={14} className="text-brand-pink" />
              <span>{profile.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Details Section */}
      <div className="px-6 pt-4 space-y-8">
        {/* Bio */}
        {profile.bio && (
          <div>
            <h3 className="text-white font-bold text-lg mb-2">About</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Interests */}
        {profile.interests?.length > 0 && (
          <div>
            <h3 className="text-white font-bold text-lg mb-3">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <div 
                  key={interest}
                  className="px-4 py-2 rounded-full text-white text-xs font-bold"
                  style={{ background: 'rgba(233,30,140,0.12)', border: '1px solid rgba(233,30,140,0.2)' }}
                >
                  {interest}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status bits */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2 text-brand-pink mb-1">
              <Zap size={14} />
              <span className="text-[10px] font-black uppercase tracking-wider">Goal</span>
            </div>
            <p className="text-white text-sm font-bold">{profile.looking_for || 'Open to chat'}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2 text-yellow-500 mb-1">
              <Star size={14} />
              <span className="text-[10px] font-black uppercase tracking-wider">Verified</span>
            </div>
            <p className="text-white text-sm font-bold">{profile.is_verified ? 'Identity Verified' : 'Standard Profile'}</p>
          </div>
        </div>

        {/* Safety Tip */}
        <div className="p-5 rounded-3xl bg-red-500/5 border border-red-500/10 mt-4">
          <p className="text-slate-500 text-[10px] uppercase font-black mb-1">Safety</p>
          <p className="text-slate-400 text-xs text-balance">
            Always meet in public places and never share your financial details with strangers.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 py-8">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('left')}
            className="flex-1 py-4.5 rounded-[22px] font-black text-slate-400 text-sm uppercase tracking-widest"
            style={{ background: '#1a0828', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            Not for me
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('right')}
            className="flex-[1.5] py-4.5 rounded-[22px] font-black text-white text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(233,30,140,0.3)]"
            style={{ background: 'linear-gradient(135deg,#e91e8c,#9c27b0)' }}
          >
            <Heart size={18} fill="currentColor" />
            Like
          </motion.button>
        </div>
      </div>
    </div>
  );
};
