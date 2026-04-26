import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Heart, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Profile } from '../hooks/useProfiles';

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 250 }}
            className="relative w-full max-w-sm flex flex-col items-center text-center"
          >
            {/* Sparkle effects */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
              className="absolute w-80 h-80 rounded-full bg-brand-pink/20 blur-3xl" 
            />

            <h1 className="text-white text-4xl font-black italic tracking-tighter mb-2 italic">It's a Match!</h1>
            <p className="text-slate-400 text-sm mb-12">You and {matchProfile.full_name} liked each other</p>

            {/* Overlapping avatars */}
            <div className="flex items-center justify-center mb-16 relative">
              <motion.div 
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: -10, opacity: 1 }}
                className="w-28 h-28 rounded-full border-[4px] border-black overflow-hidden z-20"
              >
                <img src={myProfile?.avatar_url || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" alt="" />
              </motion.div>
              <motion.div 
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 10, opacity: 1 }}
                className="w-28 h-28 rounded-full border-[4px] border-black overflow-hidden z-10"
              >
                <img src={matchProfile.photos?.[0] || matchProfile.avatar_url} className="w-full h-full object-cover" alt="" />
              </motion.div>
              <div className="absolute -bottom-4 z-30 w-12 h-12 rounded-full bg-brand-pink flex items-center justify-center shadow-lg animate-bounce">
                <Heart size={24} className="text-white fill-current" />
              </div>
            </div>

            <div className="w-full space-y-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  onClose();
                  // We'll navigate to chat list, user can find the match there
                  navigate('/chat');
                }}
                className="w-full py-4 rounded-2xl bg-brand-pink text-white font-black uppercase text-sm flex items-center justify-center gap-3"
                style={{ boxShadow: '0 8px 32px rgba(233,30,140,0.4)' }}
              >
                <MessageCircle size={20} />
                Send Message
              </motion.button>
              
              <button 
                onClick={onClose}
                className="w-full py-4 rounded-2xl text-slate-400 font-bold text-sm uppercase tracking-widest"
              >
                Keep Swiping
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
