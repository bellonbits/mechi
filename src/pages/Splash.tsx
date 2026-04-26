import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabase';

export const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSessionAndNavigate = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Delay for the animation splash effect
      setTimeout(() => {
        if (session) {
          navigate('/explore', { replace: true });
        } else {
          navigate('/onboarding', { replace: true });
        }
      }, 2800);
    };

    checkSessionAndNavigate();
  }, [navigate]);

  return (
    <div
      className="screen-full flex flex-col items-center justify-center overflow-hidden relative"
      style={{ background: 'linear-gradient(160deg, #2a0845 0%, #1a0828 45%, #0d0614 100%)' }}
    >
      {/* Glow blobs */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 380,
          height: 380,
          top: '-10%',
          left: '-20%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(233,30,140,0.18) 0%, transparent 70%)',
          filter: 'blur(48px)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 440,
          height: 440,
          bottom: '-15%',
          right: '-25%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(156,39,176,0.22) 0%, transparent 70%)',
          filter: 'blur(56px)',
        }}
      />

      {/* Rotating rings */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
        className="absolute pointer-events-none"
        style={{
          width: 260,
          height: 260,
          borderRadius: '50%',
          border: '1.5px solid rgba(233,30,140,0.13)',
        }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute pointer-events-none"
        style={{
          width: 360,
          height: 360,
          borderRadius: '50%',
          border: '1px solid rgba(156,39,176,0.1)',
        }}
      />

      {/* Logo + wordmark */}
      <motion.div
        initial={{ scale: 0.35, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.75, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative z-10 flex flex-col items-center"
      >
        <motion.img
          src="/logo.png"
          alt="Mechi"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
          style={{
            width: 100,
            height: 100,
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 36px rgba(233,30,140,0.6))',
          }}
        />

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.45 }}
          className="text-white font-black tracking-[0.22em] uppercase mt-4"
          style={{ fontSize: 30 }}
        >
          Mechi
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.78, duration: 0.45 }}
          className="text-slate-400 text-xs tracking-[0.3em] uppercase mt-1.5"
        >
          Find your match
        </motion.p>
      </motion.div>

      {/* Loading dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="absolute flex items-center gap-2"
        style={{ bottom: 'max(40px, env(safe-area-inset-bottom, 0px) + 24px)' }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.6, 1], opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 0.95, repeat: Infinity, delay: i * 0.2 }}
            style={{ width: 8, height: 8, borderRadius: '50%', background: '#e91e8c' }}
          />
        ))}
      </motion.div>
    </div>
  );
};
