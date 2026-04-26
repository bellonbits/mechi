import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MapPin, Shield } from 'lucide-react';

const slides = [
  {
    id: 0,
    image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=700&auto=format&fit=crop',
    icon: Heart,
    iconColor: '#e91e8c',
    tag: 'Real connections',
    title: 'Find someone\nwho truly\ngets you',
    sub: 'Match with people who share your goals, values, and energy.',
  },
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=700&auto=format&fit=crop',
    icon: MapPin,
    iconColor: '#ba68c8',
    tag: 'Near you',
    title: 'Discover people\naround you\nright now',
    sub: "See who's nearby, online and ready to connect with you today.",
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=700&auto=format&fit=crop',
    icon: Shield,
    iconColor: '#e91e8c',
    tag: 'Safe & verified',
    title: 'Your safety\nis our top\npriority',
    sub: 'Every profile is verified. Chat freely with full privacy controls.',
  },
];

const imgVariants = {
  enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
};

const textVariants = {
  enter: { opacity: 0, y: 18 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

export const OnboardingPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState(1);

  const go = (next: number) => {
    setDir(next > page ? 1 : -1);
    setPage(next);
  };

  const advance = () => {
    if (page < slides.length - 1) go(page + 1);
    else navigate('/auth', { replace: true });
  };

  const slide = slides[page];
  const Icon = slide.icon;

  return (
    <div
      className="screen-full flex flex-col overflow-hidden"
      style={{ background: '#0d0614' }}
    >
      {/* ── Image area — takes remaining space above content ── */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        {/* Sliding photo */}
        <AnimatePresence custom={dir} mode="popLayout">
          <motion.div
            key={slide.id}
            custom={dir}
            variants={imgVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            className="absolute inset-0"
          >
            <img
              src={slide.image}
              className="w-full h-full object-cover object-top"
              alt=""
            />
            {/* Bottom fade into dark content area */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(13,6,20,0.08) 0%, rgba(13,6,20,0.15) 55%, rgba(13,6,20,0.88) 82%, rgba(13,6,20,1) 100%)',
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Top bar — logo + skip */}
        <div
          className="absolute inset-x-0 z-20 flex items-center justify-between px-5"
          style={{ top: 'max(48px, env(safe-area-inset-top))' }}
        >
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Mechi"
              style={{
                width: 28,
                height: 28,
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 8px rgba(233,30,140,0.7))',
              }}
            />
            <span className="text-white font-black text-base tracking-[0.16em] uppercase">
              Mechi
            </span>
          </div>
          <button
            onClick={() => navigate('/auth', { replace: true })}
            className="text-white/60 text-sm font-semibold px-3 py-1"
          >
            Skip
          </button>
        </div>

        {/* Tag pill — bottom of image */}
        <div className="absolute bottom-5 left-5 z-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={`tag-${slide.id}`}
              initial={{ opacity: 0, y: 8, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.95 }}
              transition={{ duration: 0.28 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: 'rgba(10,4,20,0.65)',
                backdropFilter: 'blur(14px)',
                border: '1px solid rgba(255,255,255,0.13)',
              }}
            >
              <Icon size={13} style={{ color: slide.iconColor }} />
              <span className="text-white text-[12px] font-bold tracking-wide">{slide.tag}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Content area — fixed, never overflows ── */}
      <div
        className="shrink-0 flex flex-col"
        style={{
          background: '#0d0614',
          paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
        }}
      >
        {/* Heading + subtitle */}
        <div className="px-6 pt-5 pb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${slide.id}`}
              variants={textVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.32 }}
            >
              <h2
                className="text-white font-black leading-[1.12] mb-2.5"
                style={{ fontSize: 'clamp(24px, 7vw, 32px)', whiteSpace: 'pre-line' }}
              >
                {slide.title}
              </h2>
              <p className="text-slate-400 text-[14px] leading-relaxed">{slide.sub}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center items-center gap-2 pb-4">
          {slides.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => go(i)}
              animate={{
                width: i === page ? 22 : 7,
                background: i === page ? '#e91e8c' : 'rgba(255,255,255,0.2)',
              }}
              transition={{ duration: 0.28 }}
              style={{ height: 7, borderRadius: 4 }}
            />
          ))}
        </div>

        {/* CTA button */}
        <div className="px-6">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={advance}
            className="w-full rounded-2xl text-white font-black tracking-wide relative overflow-hidden"
            style={{
              height: 52,
              fontSize: 15,
              background: 'linear-gradient(135deg, #e91e8c, #9c27b0)',
              boxShadow: '0 0 36px rgba(233,30,140,0.42)',
            }}
          >
            {/* Shine sweep */}
            <motion.div
              animate={{ x: ['-120%', '220%'] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.8, ease: 'easeInOut' }}
              className="absolute inset-y-0 w-1/3 pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                transform: 'skewX(-20deg)',
              }}
            />
            <span className="relative z-10">
              {page < slides.length - 1 ? 'Continue' : 'Get Started'}
            </span>
          </motion.button>

          {/* Sign in */}
          <p className="text-center text-slate-500 text-[13px] mt-3 pb-1">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/auth', { replace: true })}
              className="font-semibold"
              style={{ color: '#e91e8c' }}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
