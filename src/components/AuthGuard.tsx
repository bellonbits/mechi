import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'framer-motion';

const PUBLIC_PATHS = ['/splash', '/onboarding', '/auth', '/terms', '/privacy', '/data-collection', '/how-it-works'];

const Spinner = () => (
  <div className="screen-full flex flex-col items-center justify-center" style={{ background: 'linear-gradient(160deg,#2a0845 0%,#1a0828 45%,#0d0614 100%)' }}>
    <motion.img
      src="/logo.png"
      alt="Mechi"
      animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width: 72, height: 72, objectFit: 'contain', filter: 'drop-shadow(0 0 24px rgba(233,30,140,0.5))' }}
    />
    <div className="flex gap-1.5 mt-6">
      {[0, 1, 2].map((i) => (
        <motion.div key={i} animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
          style={{ width: 7, height: 7, borderRadius: '50%', background: '#e91e8c' }} />
      ))}
    </div>
  </div>
);

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useAuthStore();
  const location = useLocation();

  if (loading) return <Spinner />;

  const isPublic = PUBLIC_PATHS.some((p) => location.pathname.startsWith(p));
  if (isPublic) return <>{children}</>;

  if (!user) return <Navigate to="/auth" replace />;

  // If profile not complete and not already on setup, redirect there
  if (!profile?.profile_complete && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />;
  }

  return <>{children}</>;
};
