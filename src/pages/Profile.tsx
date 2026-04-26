import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Settings, Shield, CreditCard, HelpCircle, Bell,
  LogOut, Sparkles, ChevronRight, MapPin, FileText, Database, Zap,
  Trash2, AlertTriangle, Loader2,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { icon: Sparkles, label: 'Get Premium', sub: 'Unlock all features', color: '#e91e8c', path: '/subscription' },
  { icon: Zap, label: 'How Mechi Works', sub: 'Tips for more matches', path: '/how-it-works' },
  { icon: CreditCard, label: 'Payment Methods', sub: 'Manage billing', path: '/subscription' },
  { icon: Shield, label: 'Privacy & Safety', sub: 'Control your data', path: '/privacy' },
  { icon: Database, label: 'Data Collection', sub: 'What we collect & why', path: '/data-collection' },
  { icon: FileText, label: 'Terms of Service', sub: 'Your rights & our rules', path: '/terms' },
  { icon: Settings, label: 'Settings', sub: 'Account preferences', path: '/settings' },
  { icon: HelpCircle, label: 'Help & Support', sub: 'Get assistance', path: '/help-support' },
];

export const ProfilePage = () => {
  const { user, profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ matches: 0, likes: 0, visitors: 0 });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [{ count: matches }, { count: likes }] = await Promise.all([
        supabase
          .from('matches')
          .select('*', { count: 'exact', head: true })
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`),
        supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('liked_id', user.id),
      ]);
      setStats({ matches: matches ?? 0, likes: likes ?? 0, visitors: 0 });
    };
    fetchStats();
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    signOut();
    navigate('/auth');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm.toLowerCase() !== 'delete') return;
    setDeleting(true);
    try {
      await supabase.rpc('delete_my_account');
      await supabase.auth.signOut();
      signOut();
      navigate('/auth');
    } catch {
      setDeleting(false);
    }
  };

  const avatarSrc =
    (profile?.avatar_url as string) ||
    user?.user_metadata?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      (profile?.full_name as string) || user?.email || 'U'
    )}&background=1a0828&color=fff`;

  const statsList = [
    { label: 'Matches', value: stats.matches },
    { label: 'Likes', value: stats.likes },
    { label: 'Visitors', value: stats.visitors },
  ];

  return (
    <>
      <div className="min-h-screen pb-nav-scroll app-bg overflow-y-auto">
        {/* Header */}
        <div className="pt-safe px-5 pb-2 flex justify-between items-center">
          <h1 className="text-white text-2xl font-black tracking-tight">Profile</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/notifications')}
              className="w-10 h-10 rounded-full flex items-center justify-center relative"
              style={{ background: '#220f38' }}
            >
              <Bell size={18} className="text-white" />
              <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-brand-pink border-2 border-app-surface" />
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: '#220f38' }}
            >
              <Settings size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* Profile card */}
        <div className="px-5 mb-4">
          <div
            className="rounded-[28px] overflow-hidden"
            style={{ background: '#1a0828', border: '1px solid rgba(156,39,176,0.2)' }}
          >
            <div
              className="h-24"
              style={{ background: 'linear-gradient(135deg, rgba(233,30,140,0.35), rgba(156,39,176,0.35))' }}
            />
            <div className="px-5 pb-5">
              {/* Avatar */}
              <div className="relative -mt-12 mb-3 inline-block">
                <div
                  className="w-[88px] h-[88px] rounded-full overflow-hidden"
                  style={{ border: '3px solid #e91e8c' }}
                >
                  <img src={avatarSrc} className="w-full h-full object-cover" alt="Profile" />
                </div>
                <button
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: '#e91e8c' }}
                >
                  <Camera size={13} className="text-white" />
                </button>
              </div>

              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-white text-xl font-black tracking-tight">
                    {(profile?.full_name as string) || user?.email?.split('@')[0] || 'Your Name'}
                    {profile?.age ? `, ${profile.age}` : ''}
                  </h2>
                  {profile?.location ? (
                    <div className="flex items-center gap-1 text-slate-400 text-sm mt-0.5">
                      <MapPin size={12} className="text-brand-pink" />
                      <span>{profile.location as string}</span>
                    </div>
                  ) : null}
                </div>
                {!!profile?.is_verified && (
                  <div
                    className="flex items-center gap-1 px-3 py-1 rounded-full"
                    style={{
                      background: 'rgba(59,130,246,0.14)',
                      border: '1px solid rgba(59,130,246,0.3)',
                    }}
                  >
                    <span className="text-blue-400 text-[10px] font-black">✓</span>
                    <span className="text-blue-400 text-xs font-bold">Verified</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex rounded-2xl overflow-hidden" style={{ background: '#220f38' }}>
                {statsList.map((stat, i) => (
                  <div
                    key={stat.label}
                    className="flex-1 py-3 flex flex-col items-center"
                    style={{
                      borderRight: i < statsList.length - 1 ? '1px solid rgba(156,39,176,0.2)' : 'none',
                    }}
                  >
                    <span className="text-white font-black text-lg leading-tight">{stat.value}</span>
                    <span className="text-slate-400 text-[11px]">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Premium banner */}
        {!profile?.is_premium && (
          <div className="px-5 mb-4">
            <motion.div
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/subscription')}
              className="rounded-[22px] p-5 cursor-pointer relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #e91e8c, #9c27b0)' }}
            >
              <div
                className="absolute -top-8 -right-8 w-28 h-28 rounded-full"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              />
              <div className="relative flex justify-between items-center">
                <div>
                  <h3 className="text-white font-black text-lg flex items-center gap-2">
                    Unlock Premium
                    <Sparkles size={15} className="text-yellow-300 fill-current" />
                  </h3>
                  <p className="text-white/75 text-sm mt-0.5">See who likes you · Unlimited swipes</p>
                </div>
                <ChevronRight size={22} className="text-white/80" />
              </div>
            </motion.div>
          </div>
        )}

        {/* Menu */}
        <div className="px-5 space-y-2">
          {menuItems.map((item, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-4 p-4 rounded-[18px]"
              style={{ background: '#1a0828', border: '1px solid rgba(156,39,176,0.15)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: item.color ? `${item.color}1a` : '#220f38' }}
              >
                <item.icon size={18} style={{ color: item.color || '#9b59b6' }} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-semibold text-[15px]">{item.label}</p>
                {item.sub && <p className="text-slate-500 text-xs mt-0.5">{item.sub}</p>}
              </div>
              <ChevronRight size={16} className="text-slate-600" />
            </motion.button>
          ))}

          {/* Sign Out */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSignOut}
            className="w-full flex items-center gap-4 p-4 rounded-[18px]"
            style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/15">
              <LogOut size={18} className="text-red-400" />
            </div>
            <span className="text-red-400 font-semibold text-[15px]">Sign Out</span>
          </motion.button>

          {/* Delete Account */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowDeleteModal(true)}
            className="w-full flex items-center gap-4 p-4 rounded-[18px]"
            style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(153,27,27,0.2)' }}>
              <Trash2 size={18} className="text-red-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-red-600 font-semibold text-[15px]">Delete Account</p>
              <p className="text-slate-600 text-xs mt-0.5">Permanently remove all your data</p>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) { setShowDeleteModal(false); setDeleteConfirm(''); } }}
          >
            <motion.div
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 120, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-full max-w-lg rounded-t-[32px] p-6 pb-nav"
              style={{ background: '#1a0828', border: '1px solid rgba(239,68,68,0.2)', borderBottom: 'none' }}
            >
              <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'rgba(255,255,255,0.2)' }} />

              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(239,68,68,0.15)' }}
                >
                  <AlertTriangle size={22} className="text-red-400" />
                </div>
                <div>
                  <h3 className="text-white font-black text-lg">Delete Account</h3>
                  <p className="text-slate-400 text-xs">This cannot be undone</p>
                </div>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed mb-5">
                All your matches, messages, photos, and profile data will be permanently deleted.
                You will be signed out immediately.
              </p>

              <p className="text-slate-400 text-sm mb-2">
                Type <span className="text-red-400 font-bold">delete</span> to confirm:
              </p>
              <input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="delete"
                autoCapitalize="none"
                className="w-full px-4 py-3 rounded-xl outline-none text-white text-sm mb-4"
                style={{ background: '#220f38', border: '1px solid rgba(239,68,68,0.3)' }}
              />

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}
                  className="flex-1 py-3.5 rounded-xl font-bold text-slate-300 text-sm"
                  style={{ background: '#220f38', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirm.toLowerCase() !== 'delete' || deleting}
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                  style={{
                    background:
                      deleteConfirm.toLowerCase() === 'delete' && !deleting
                        ? '#dc2626'
                        : 'rgba(220,38,38,0.2)',
                    color: deleteConfirm.toLowerCase() === 'delete' ? 'white' : 'rgba(255,255,255,0.35)',
                  }}
                >
                  {deleting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  {deleting ? 'Deleting...' : 'Delete Forever'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
