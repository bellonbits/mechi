import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Profile } from '../hooks/useProfiles';
import { supabase } from '../utils/supabase';

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  myProfile: any;
  matchProfile: Profile;
}

export const MatchModal = ({ isOpen, onClose, myProfile, matchProfile }: MatchModalProps) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
          />
          
          {/* Bubblish Love Effect (Floating Hearts) */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: '110vh', x: Math.random() * 100 + '%', scale: 0.5, opacity: 0 }}
              animate={{ 
                y: '-10vh', 
                opacity: [0, 1, 1, 0],
                scale: [0.5, 1.2, 0.8],
                rotate: [0, 20, -20, 0]
              }}
              transition={{ 
                duration: 4 + Math.random() * 4, 
                repeat: Infinity,
                delay: Math.random() * 5 
              }}
              className="absolute pointer-events-none text-brand-pink/40"
            >
              <Heart size={24 + Math.random() * 30} fill="currentColor" />
            </motion.div>
          ))}

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative w-full max-w-sm flex flex-col items-center text-center z-10"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
              className="absolute w-80 h-80 rounded-full bg-brand-pink/15 blur-[100px]" 
            />

            <h1 className="text-white text-5xl font-black tracking-tighter mb-2 italic">You Matched!</h1>
            <div className="bg-brand-pink/20 px-4 py-1 rounded-full mb-8">
              <p className="text-brand-pink text-xs font-black uppercase tracking-widest">Someone liked you back!</p>
            </div>

            {/* Overlapping avatars */}
            <div className="flex items-center justify-center mb-14 relative">
              <motion.div 
                initial={{ x: -60, rotate: -10, opacity: 0 }}
                animate={{ x: -15, rotate: -5, opacity: 1 }}
                className="w-32 h-32 rounded-[40px] border-[4px] border-white/10 overflow-hidden z-20 shadow-2xl"
              >
                <img src={myProfile?.avatar_url || ''} className="w-full h-full object-cover" alt="" />
              </motion.div>
              <motion.div 
                initial={{ x: 60, rotate: 10, opacity: 0 }}
                animate={{ x: 15, rotate: 5, opacity: 1 }}
                className="w-32 h-32 rounded-[40px] border-[4px] border-white/10 overflow-hidden z-10 shadow-2xl"
              >
                <img src={matchProfile.photos?.[0] || matchProfile.avatar_url || ''} className="w-full h-full object-cover" alt="" />
              </motion.div>
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute -bottom-5 z-30 w-14 h-14 rounded-full bg-brand-pink flex items-center justify-center shadow-[0_0_40px_rgba(233,30,140,0.6)]"
              >
                <Heart size={28} className="text-white fill-current" />
              </motion.div>
            </div>

            <div className="w-full space-y-4 px-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  try {
                    const { data: convId, error } = await supabase.rpc('get_or_create_conversation', {
                      target_user_id: matchProfile.id
                    });
                    if (!error && convId) {
                      navigate(`/chat/${convId}`, { 
                        state: { 
                          name: matchProfile.full_name, 
                          image: matchProfile.avatar_url || matchProfile.photos?.[0],
                          verified: matchProfile.is_verified 
                        } 
                      });
                    } else {
                      navigate('/chat');
                    }
                  } catch (err) {
                    navigate('/chat');
                  }
                }}
                className="w-full py-4.5 rounded-2xl bg-white text-black font-black uppercase text-sm flex items-center justify-center gap-3"
              >
                <MessageCircle size={20} className="fill-current" />
                Chat Now & Say Hey
              </motion.button>
              
              <button 
                onClick={onClose}
                className="w-full py-4 rounded-2xl text-slate-400 font-bold text-sm uppercase tracking-widest active:text-white transition-colors"
              >
                Not Now
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
