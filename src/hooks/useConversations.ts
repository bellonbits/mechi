import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useAuthStore } from '../store/useAuthStore';

export interface ConversationItem {
  id: string;
  last_message: string | null;
  last_message_at: string;
  unread: number;
  contact: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    is_verified: boolean;
    online?: boolean;
  };
}

export const useConversations = () => {
  const { user } = useAuthStore();
  const [convs, setConvs] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id, last_message, last_message_at,
        user1:profiles!user1_id(id, full_name, avatar_url, is_verified),
        user2:profiles!user2_id(id, full_name, avatar_url, is_verified)
      `)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false });

    if (!error && data) {
      const mapped: ConversationItem[] = (data as Record<string, unknown>[]).map((c) => {
        const u1 = c.user1 as { id: string; full_name: string; avatar_url: string | null; is_verified: boolean };
        const u2 = c.user2 as { id: string; full_name: string; avatar_url: string | null; is_verified: boolean };
        const contact = u1.id === user.id ? u2 : u1;
        return {
          id: c.id as string,
          last_message: c.last_message as string | null,
          last_message_at: c.last_message_at as string,
          unread: 0,
          contact: { ...contact, online: false },
        };
      });
      setConvs(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    fetch();

    const channel = supabase
      .channel('convs_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, fetch)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return { convs, loading, refetch: fetch };
};
