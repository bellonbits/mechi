import { useState } from 'react';
import { Search, Mic, Plus, Loader2, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useConversations } from '../hooks/useConversations';
import { useAuthStore } from '../store/useAuthStore';
import { useMatches } from '../hooks/useProfiles';
import { supabase } from '../utils/supabase';

const timeAgo = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
};

export const ChatPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { convs, loading: convsLoading } = useConversations();
  const { matches, loading: matchesLoading } = useMatches();
  const [search, setSearch] = useState('');

  const loading = convsLoading || matchesLoading;

  const filtered = convs.filter((c) =>
    c.contact.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const startChat = async (profile: any) => {
    try {
      const { data: convId, error } = await supabase.rpc('get_or_create_conversation', {
        target_user_id: profile.id
      });
      if (!error && convId) {
        navigate(`/chat/${convId}`, { 
          state: { 
            name: profile.full_name, 
            image: profile.avatar_url,
            verified: profile.is_verified 
          } 
        });
      }
    } catch (err) {
      console.error('Failed to start chat:', err);
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto pb-nav-scroll" style={{ background: '#060010' }}>
      {/* Header */}
      <div className="pt-safe px-5 pb-4 flex items-center justify-between">
        <h1 className="text-white text-xl font-bold">Messages</h1>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border" style={{ borderColor: '#e91e8c' }}>
            <img src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || 'U')}&background=1a0828&color=fff`}
              className="w-full h-full object-cover" alt="" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-5 mb-5">
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: '#1a0828' }}>
          <Search size={15} className="text-slate-500 shrink-0" />
          <input placeholder="Search messages..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-white flex-1 outline-none text-sm placeholder-slate-500" />
          <Mic size={15} className="text-slate-500 shrink-0" />
        </div>
      </div>

      {/* Matches row (from matches table) */}
      {matches.length > 0 && (
        <div className="pl-5 mb-5 overflow-x-auto no-scrollbar">
          <div className="flex gap-4 pb-1 pr-5">
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="w-[60px] h-[60px] rounded-full flex items-center justify-center"
                style={{ border: '2px dashed #3d1f5a', background: '#1a0828' }}>
                <Plus size={20} className="text-brand-purple-light" />
              </div>
              <span className="text-slate-400 text-[11px]">Invite</span>
            </div>
            {matches.map((match) => (
              <motion.div key={match.id} whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer"
                onClick={() => startChat(match)}>
                <div className="w-[60px] h-[60px] rounded-full overflow-hidden p-[2px]"
                  style={{ background: 'linear-gradient(135deg,#e91e8c,#9c27b0)' }}>
                  <img src={match.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.full_name || 'U')}&background=1a0828&color=fff`}
                    className="w-full h-full object-cover rounded-full" alt={match.full_name}
                    style={{ border: '2px solid #060010' }} />
                </div>
                <span className="text-slate-400 text-[11px] truncate max-w-[60px] text-center">{match.full_name?.split(' ')[0]}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Chat list */}
      <div className="px-5">
        <h2 className="text-white text-lg font-bold mb-2">
          {loading ? 'Loading...' : filtered.length > 0 ? 'Chats' : search ? 'No results' : 'No conversations yet'}
        </h2>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={32} className="text-brand-pink animate-spin" />
          </div>
        ) : filtered.length === 0 && !search ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: '#1a0828' }}>
              <MessageCircle size={32} className="text-slate-500" />
            </div>
            {matches.length > 0 ? (
              <>
                <p className="text-white font-bold text-base mb-1">Start a conversation</p>
                <p className="text-slate-500 text-sm max-w-[220px]">You have matches waiting to hear from you. Tap one above to say hi!</p>
              </>
            ) : (
              <>
                <p className="text-white font-bold text-base mb-1">No matches yet</p>
                <p className="text-slate-500 text-sm max-w-[220px]">Start swiping to get your first match and chat!</p>
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => navigate('/swipe')}
                  className="mt-5 px-6 py-2.5 rounded-xl font-bold text-white text-sm"
                  style={{ background: 'linear-gradient(135deg,#e91e8c,#9c27b0)' }}>
                  Discover People
                </motion.button>
              </>
            )}
          </div>
        ) : (
          <div>
            {filtered.map((conv, i) => (
              <motion.div key={conv.id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3.5 py-3 px-2 -mx-2 rounded-2xl cursor-pointer active:bg-white/5 transition-colors"
                onClick={() => navigate(`/chat/${conv.id}`, { state: { name: conv.contact.full_name, image: conv.contact.avatar_url, verified: conv.contact.is_verified } })}>
                <div className="relative shrink-0">
                  <div className="w-[54px] h-[54px] rounded-full overflow-hidden">
                    <img src={conv.contact.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.contact.full_name || 'U')}&background=1a0828&color=fff`}
                      className="w-full h-full object-cover" alt={conv.contact.full_name} />
                  </div>
                  {conv.contact.online && (
                    <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full" style={{ border: '2px solid #060010' }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white font-semibold text-[15px] truncate">{conv.contact.full_name}</span>
                      {conv.contact.is_verified && (
                        <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: '#3b82f6' }}>
                          <span className="text-white text-[8px] font-black">✓</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 shrink-0 ml-2">{timeAgo(conv.last_message_at)}</span>
                  </div>
                  <span className="text-slate-500 text-[13px] truncate block">{conv.last_message || 'Say hi! 👋'}</span>
                </div>
                {conv.unread > 0 && (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: '#e91e8c' }}>
                    <span className="text-white text-[10px] font-bold">{conv.unread}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
