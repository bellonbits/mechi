import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Video, MoreVertical, Shield, Smile } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useAuthStore } from '../store/useAuthStore';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at?: string | null;
}

const fmt = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const ChatRoomPage = () => {
  const navigate = useNavigate();
  const { id: convId } = useParams<{ id: string }>();
  const location = useLocation();
  const { user, profile } = useAuthStore();
  const myId = user?.id || 'me';

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [typingTimer, setTypingTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Contact info from navigation state or defaults
  const contact = (location.state as { name?: string; image?: string; verified?: boolean; userId?: string } | null) || {};
  const contactName = contact.name || 'Match';
  const contactImage = contact.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(contactName)}&background=1a0828&color=fff`;
  const contactVerified = contact.verified ?? false;

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Supabase Realtime subscription
  useEffect(() => {
    if (!convId || !user) return;

    // Load existing messages
    const load = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });
      if (data && data.length > 0) setMessages(data);
    };
    load();

    // Real-time channel
    const channel = supabase
      .channel(`chat:${convId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${convId}`,
      }, (payload) => {
        const msg = payload.new as Message;
        setMessages((prev) => {
          if (prev.find((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        scrollToBottom();
      })
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload?.user_id !== user.id) {
          setOtherTyping(true);
          if (typingTimer) clearTimeout(typingTimer);
          setTypingTimer(setTimeout(() => setOtherTyping(false), 2500));
        }
      })
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convId, user]);

  const broadcastTyping = () => {
    channelRef.current?.send({ type: 'broadcast', event: 'typing', payload: { user_id: user?.id } });
  };

  const sendMessage = async (overrideText?: string) => {
    const text = (overrideText || input).trim();
    if (!text || sending) return;
    if (!overrideText) setInput('');
    setSending(true);

    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      sender_id: myId,
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    scrollToBottom();

    try {
      if (convId && user) {
        const { data, error } = await supabase
          .from('messages')
          .insert({ conversation_id: convId, sender_id: user.id, content: text })
          .select()
          .single();
        if (!error && data) {
          setMessages((prev) => prev.map((m) => m.id === optimistic.id ? data : m));
        }
        // Update conversation last message
        await supabase.from('conversations').update({ last_message: text, last_message_at: new Date().toISOString() }).eq('id', convId);
      }
    } catch { /* optimistic already shown */ }
    finally { setSending(false); }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const startVideoCall = async () => {
    if (!user) return;
    const targetId = contact.userId;

    if (targetId) {
      // Notify the callee via their personal incoming-call channel, then navigate
      const notifChannel = supabase.channel(`incoming-call-${targetId}`);
      await Promise.race([
        new Promise<void>((resolve) => {
          notifChannel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              notifChannel.send({
                type: 'broadcast',
                event: 'call-request',
                payload: {
                  callerName: (profile?.full_name as string) || user.email?.split('@')[0] || 'Someone',
                  callerImage: (profile?.avatar_url as string) || `https://ui-avatars.com/api/?name=You&background=1a0828&color=fff`,
                  callerId: user.id,
                  conversationId: convId,
                },
              }).finally(resolve);
            }
          });
        }),
        new Promise<void>(resolve => setTimeout(resolve, 2000)),
      ]);
    }

    navigate('/video-call', {
      state: {
        name: contactName,
        image: contactImage,
        targetUserId: targetId,
        conversationId: convId,
        isCaller: true,
      },
    });
  };

  const grouped = messages.reduce<{ date: string; msgs: Message[] }[]>((acc, msg) => {
    const date = new Date(msg.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    const last = acc[acc.length - 1];
    if (last?.date === date) last.msgs.push(msg);
    else acc.push({ date, msgs: [msg] });
    return acc;
  }, []);

  return (
    <div className="screen-full flex flex-col overflow-hidden" style={{ background: '#060010' }}>
      {/* ── Header ── */}
      <div
        className="shrink-0 flex items-center gap-3 px-4 pb-3 z-10"
        style={{ paddingTop: 'max(52px,env(safe-area-inset-top))', background: '#0f0520', borderBottom: '1px solid rgba(156,39,176,0.15)' }}
      >
        <button onClick={() => navigate('/chat')} className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: '#1a0828' }}>
          <ArrowLeft size={18} className="text-white" />
        </button>

        <div className="relative">
          <img src={contactImage} className="w-11 h-11 rounded-full object-cover" alt={contactName} />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full" style={{ border: '2px solid #0f0520' }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-white font-bold text-base truncate">{contactName}</span>
            {contactVerified && (
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: '#3b82f6' }}>
                <Shield size={10} className="text-white" />
              </div>
            )}
          </div>
          <p className="text-green-400 text-[11px] font-semibold">● Active now</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={startVideoCall} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#1a0828' }}>
            <Video size={16} className="text-white" />
          </button>
          <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#1a0828' }}>
            <MoreVertical size={16} className="text-white" />
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1" style={{ scrollBehavior: 'smooth' }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center pb-8">
            <div className="w-20 h-20 rounded-full overflow-hidden mb-4 mx-auto" style={{ border: '3px solid #e91e8c' }}>
              <img src={contactImage} className="w-full h-full object-cover" alt={contactName} />
            </div>
            <p className="text-white font-bold text-base mb-1">You matched with {contactName}!</p>
            <p className="text-slate-500 text-sm">Say hi and break the ice 👋</p>
          </div>
        )}
        {grouped.map((group) => (
          <div key={group.date}>
            {/* Date divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px" style={{ background: 'rgba(156,39,176,0.15)' }} />
              <span className="text-slate-500 text-[11px] font-medium">{group.date}</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(156,39,176,0.15)' }} />
            </div>

            {group.msgs.map((msg, i) => {
              const isMe = msg.sender_id === myId;
              const prev = group.msgs[i - 1];
              const showAvatar = !isMe && (!prev || prev.sender_id === myId);
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-end gap-2 mb-1 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <img src={contactImage} className="w-7 h-7 rounded-full object-cover shrink-0 mb-0.5" alt="" style={{ opacity: showAvatar ? 1 : 0 }} />
                  )}
                  <div className={`max-w-[72%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div
                      className="px-4 py-2.5 text-[15px] leading-relaxed"
                      style={{
                        borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                        background: isMe ? 'linear-gradient(135deg,#e91e8c,#9c27b0)' : '#1a0828',
                        color: '#fff',
                        boxShadow: isMe ? '0 2px 16px rgba(233,30,140,0.25)' : 'none',
                        border: isMe ? 'none' : '1px solid rgba(156,39,176,0.15)',
                      }}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-slate-600 mt-0.5 px-1">{fmt(msg.created_at)}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {otherTyping && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
              className="flex items-end gap-2">
              <img src={contactImage} className="w-7 h-7 rounded-full object-cover shrink-0" alt="" />
              <div className="flex items-center gap-1 px-4 py-3 rounded-[20px]" style={{ background: '#1a0828', border: '1px solid rgba(156,39,176,0.15)' }}>
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    className="w-2 h-2 rounded-full" style={{ background: '#9c27b0' }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div
        className="shrink-0 px-4 pt-3 space-y-3"
        style={{ paddingBottom: 'max(20px,env(safe-area-inset-bottom))', background: '#0f0520', borderTop: '1px solid rgba(156,39,176,0.12)' }}
      >
        {/* Icebreakers / Suggestions */}
        {messages.length === 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
            {[
              `Hey ${contactName}! 👋`,
              `Hey! I love your bio! ✨`,
              `Looking great, ${contactName}! 😊`,
              `Happy to match with you! 🥂`
            ].map((text) => (
              <motion.button
                key={text}
                whileTap={{ scale: 0.95 }}
                onClick={() => sendMessage(text)}
                className="whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold text-slate-300"
                style={{ background: '#1a0828', border: '1px solid rgba(156,39,176,0.3)' }}
              >
                {text}
              </motion.button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: '#1a0828' }}>
            <Smile size={18} className="text-slate-400" />
          </button>

          <div className="flex-1 flex items-center px-4 py-2.5 rounded-full" style={{ background: '#1a0828', border: '1.5px solid rgba(156,39,176,0.2)' }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => { setInput(e.target.value); broadcastTyping(); }}
              onKeyDown={handleKey}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder-slate-500"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => sendMessage()}
            disabled={!input.trim()}
            className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all"
            style={{ background: input.trim() ? 'linear-gradient(135deg,#e91e8c,#9c27b0)' : '#220f38', boxShadow: input.trim() ? '0 0 20px rgba(233,30,140,0.4)' : 'none' }}
          >
            <Send size={16} className="text-white" style={{ transform: 'translate(1px,-1px)' }} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};
