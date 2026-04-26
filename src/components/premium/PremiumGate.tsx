import React from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { Lock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface PremiumGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PremiumGate: React.FC<PremiumGateProps> = ({ children, fallback }) => {
  const { isPremium, isLoading } = useSubscription();
  const navigate = useNavigate();

  if (isLoading) return <div className="animate-pulse h-64 w-full bg-slate-900/50 rounded-[2.5rem]" />;

  if (isPremium) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex flex-col items-center justify-center p-12 text-center glass rounded-[2.5rem] overflow-hidden min-h-[350px] border border-white/5"
    >
      <div className="absolute inset-0 bg-brand-pink/5 blur-3xl -z-10" />
      
      <div className="bg-slate-900 p-6 rounded-full mb-6 shadow-xl relative">
        <Lock className="w-10 h-10 text-brand-pink" />
        <div className="absolute inset-0 rounded-full border-2 border-brand-pink/30 animate-pulse" />
      </div>
      
      <h3 className="text-3xl font-black mb-3 text-white flex items-center gap-2">
        Premium <Sparkles className="w-6 h-6 text-yellow-400 fill-current" />
      </h3>
      <p className="text-slate-400 mb-8 max-w-[250px] text-lg leading-relaxed">
        Join the elite and unlock all features to find your match today.
      </p>
      
      <button 
        onClick={() => navigate('/subscription')}
        className="premium-gradient px-12 py-4 rounded-2xl font-black text-xl shadow-2xl shadow-brand-pink/20 active:scale-95 transition-transform w-full"
      >
        Go Premium
      </button>
    </motion.div>
  );
};
