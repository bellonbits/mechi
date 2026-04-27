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

    // conversations.user1_id/user2_id FK → auth.users (not profiles), so we
    // can't join profiles in one shot. Fetch conversations then profiles separately.
    const { data: convData, error } = await supabase
      .from('conversations')
      .select('id, last_message, last_message_at, user1_id, user2_id')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false });

    if (error || !convData || convData.length === 0) {
      setConvs([]);
      setLoading(false);
      return;
    }

    const contactIds = [
      ...new Set(
        convData.map((c) => (c.user1_id === user.id ? c.user2_id : c.user1_id))
      ),
    ];

    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, is_verified')
      .in('id', contactIds);

    const profileMap = new Map((profileData ?? []).map((p) => [p.id, p]));

    const mapped: ConversationItem[] = convData.map((c) => {
      const contactId = c.user1_id === user.id ? c.user2_id : c.user1_id;
      const contact = profileMap.get(contactId) ?? {
        id: contactId,
        full_name: 'Mechi User',
        avatar_url: null,
        is_verified: false,
      };
      return {
        id: c.id,
        last_message: c.last_message,
        last_message_at: c.last_message_at,
        unread: 0,
        contact: { ...contact, online: false },
      };
    });

    setConvs(mapped);
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
