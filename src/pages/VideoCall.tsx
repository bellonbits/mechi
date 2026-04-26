import { useState, useEffect } from 'react';
import { Mic, RotateCcw, VideoOff, Phone, MicOff } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';

type HeartItem = { id: number; x: number; size: number };

const FloatingHearts = () => {
  const [hearts, setHearts] = useState<HeartItem[]>([]);

  useEffect(() => {
    const spawn = () =>
      setHearts((prev) => [
        ...prev.slice(-8),
        { id: Date.now(), x: 5 + Math.random() * 85, size: 16 + Math.random() * 20 },
      ]);
    spawn();
    const id = setInterval(spawn, 1300);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      <AnimatePresence>
        {hearts.map((h) => (
          <motion.div
            key={h.id}
            initial={{ opacity: 0, y: '90vh', scale: 0.5 }}
            animate={{ opacity: [0, 1, 0.85, 0], y: '5vh', scale: [0.5, 1.2, 1, 0.6] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: 'easeOut' }}
            className="absolute"
            style={{ left: `${h.x}%`, fontSize: h.size }}
          >
            ❤️
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const ControlBtn = ({
  icon: Icon, active, onClick, pink,
}: {
  icon: React.ElementType; active?: boolean; onClick?: () => void; pink?: boolean;
}) => (
  <motion.button
    whileTap={{ scale: 0.84 }}
    onClick={onClick}
    className={`rounded-full flex items-center justify-center ${pink ? 'w-16 h-16' : 'w-14 h-14'}`}
    style={{
      background: pink ? '#e91e8c' : active ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.45)',
      backdropFilter: 'blur(12px)',
      border: pink ? 'none' : '1px solid rgba(255,255,255,0.18)',
      boxShadow: pink ? '0 0 32px rgba(233,30,140,0.55)' : '0 4px 16px rgba(0,0,0,0.3)',
    }}
  >
    <Icon size={pink ? 26 : 21} className="text-white" />
  </motion.button>
);

export const VideoCallPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuthStore();
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);

  // Contact info passed from ChatRoom
  const state = (location.state as { name?: string; image?: string } | null) || {};
  const contactName = state.name || 'Match';
  const contactImage =
    state.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(contactName)}&background=1a0828&color=fff`;

  // Self avatar
  const myName = (profile?.full_name as string) || user?.email?.split('@')[0] || 'You';
  const myAvatar =
    (profile?.avatar_url as string) ||
    user?.user_metadata?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(myName)}&background=2a0845&color=fff`;

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="screen-full relative overflow-hidden bg-black">
      {/* Remote video (contact's image as background) */}
      <img
        src={contactImage}
        className="absolute inset-0 w-full h-full object-cover"
        alt={contactName}
        style={{ filter: 'brightness(0.75)' }}
      />
      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

      <FloatingHearts />

      {/* Self-view (real user avatar) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute w-28 rounded-2xl overflow-hidden z-20 shadow-2xl"
        style={{
          top: 'max(56px, env(safe-area-inset-top))',
          right: 16,
          height: 140,
          border: '2px solid rgba(255,255,255,0.28)',
        }}
      >
        {videoOff ? (
          <div className="w-full h-full flex items-center justify-center" style={{ background: '#220f38' }}>
            <VideoOff size={28} className="text-slate-400" />
          </div>
        ) : (
          <img src={myAvatar} className="w-full h-full object-cover" alt="You" />
        )}
      </motion.div>

      {/* Callee info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute left-0 right-0 flex flex-col items-center gap-2.5 z-20"
        style={{ bottom: 'calc(120px + max(20px, env(safe-area-inset-bottom)))' }}
      >
        <h2 className="text-white text-2xl font-bold tracking-wide drop-shadow-xl">
          {contactName}
        </h2>
        <div
          className="flex items-center gap-2 px-5 py-1.5 rounded-full"
          style={{
            background: 'rgba(0,0,0,0.48)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.14)',
          }}
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white text-sm font-mono tracking-wide">{fmt(seconds)}</span>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="absolute left-0 right-0 flex justify-center items-center gap-5 z-20"
        style={{ bottom: 'max(24px, env(safe-area-inset-bottom))' }}
      >
        <ControlBtn icon={muted ? MicOff : Mic} active={muted} onClick={() => setMuted(!muted)} />
        <ControlBtn icon={RotateCcw} />
        <ControlBtn icon={VideoOff} active={videoOff} onClick={() => setVideoOff(!videoOff)} />
        <ControlBtn icon={Phone} pink onClick={() => navigate(-1)} />
      </motion.div>
    </div>
  );
};
