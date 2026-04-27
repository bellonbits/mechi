import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, X } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useAuthStore } from '../store/useAuthStore';

interface Toast {
  id: string;
  type: 'like' | 'message';
  title: string;
  body: string;
  avatar?: string;
  onPress: () => void;
}

const DISMISS_MS = 4500;

export const ToastListener = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  // Keep a live ref to pathname so message handler always sees the current route
  const pathnameRef = useRef(location.pathname);
  useEffect(() => { pathnameRef.current = location.pathname; }, [location.pathname]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const t = timersRef.current.get(id);
    if (t) { clearTimeout(t); timersRef.current.delete(id); }
  }, []);

  const push = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts(prev => [...prev.slice(-2), { ...toast, id }]);
    const timer = setTimeout(() => dismiss(id), DISMISS_MS);
    timersRef.current.set(id, timer);
  }, [dismiss]);

  // ── Like toasts ─────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`toast-likes-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'likes',
        filter: `liked_id=eq.${user.id}`,
      }, async (payload) => {
        const { liker_id } = payload.new;
        const { data: p } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', liker_id)
          .single();

        push({
          type: 'like',
          title: p?.full_name || 'Someone liked you',
          body: 'liked your profile ❤️',
          avatar: p?.avatar_url ?? undefined,
          onPress: () => navigate('/likes'),
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, push, navigate]);

  // ── Message toasts ───────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`toast-messages-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, async (payload) => {
        const msg = payload.new;
        // Skip own messages and messages the user is actively reading
        if (msg.sender_id === user.id) return;
        if (pathnameRef.current === `/chat/${msg.conversation_id}`) return;

        const { data: p } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', msg.sender_id)
          .single();

        push({
          type: 'message',
          title: p?.full_name || 'New message',
          body: msg.content,
          avatar: p?.avatar_url ?? undefined,
          onPress: () =>
            navigate(`/chat/${msg.conversation_id}`, {
              state: { name: p?.full_name, image: p?.avatar_url, userId: msg.sender_id },
            }),
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, push, navigate]);

  return (
    <div
      className="fixed left-0 right-0 z-40 px-4 flex flex-col gap-2 pointer-events-none"
      style={{ top: 'max(64px, calc(env(safe-area-inset-top) + 8px))' }}
    >
      <AnimatePresence initial={false}>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: -28, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -16 }}
            transition={{ type: 'spring', stiffness: 440, damping: 32 }}
            className="pointer-events-auto cursor-pointer flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl"
            style={{
              background: 'rgba(13, 6, 20, 0.97)',
              backdropFilter: 'blur(28px)',
              border: toast.type === 'like'
                ? '1px solid rgba(233,30,140,0.4)'
                : '1px solid rgba(33,150,243,0.35)',
              boxShadow: toast.type === 'like'
                ? '0 8px 32px rgba(233,30,140,0.2), 0 2px 8px rgba(0,0,0,0.4)'
                : '0 8px 32px rgba(33,150,243,0.15), 0 2px 8px rgba(0,0,0,0.4)',
            }}
            onClick={() => { toast.onPress(); dismiss(toast.id); }}
          >
            {toast.avatar ? (
              <div className="relative shrink-0">
                <img
                  src={toast.avatar}
                  className="w-11 h-11 rounded-full object-cover"
                  alt={toast.title}
                />
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2"
                  style={{
                    background: toast.type === 'like' ? '#e91e8c' : '#2196f3',
                    borderColor: 'rgba(13,6,20,0.97)',
                  }}
                >
                  {toast.type === 'like'
                    ? <Heart size={9} className="text-white fill-white" />
                    : <MessageCircle size={9} className="text-white" />}
                </div>
              </div>
            ) : (
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: toast.type === 'like'
                    ? 'rgba(233,30,140,0.18)'
                    : 'rgba(33,150,243,0.18)',
                }}
              >
                {toast.type === 'like'
                  ? <Heart size={20} className="text-pink-400" />
                  : <MessageCircle size={20} className="text-blue-400" />}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-tight truncate">{toast.title}</p>
              <p className="text-slate-400 text-xs leading-tight truncate mt-0.5">{toast.body}</p>
            </div>

            <button
              onClick={e => { e.stopPropagation(); dismiss(toast.id); }}
              className="w-6 h-6 flex items-center justify-center rounded-full shrink-0 ml-1"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            >
              <X size={12} className="text-slate-500" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
