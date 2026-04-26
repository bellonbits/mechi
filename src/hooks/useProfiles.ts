import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useAuthStore } from '../store/useAuthStore';

export interface Profile {
  id: string;
  full_name: string;
  age: number;
  gender: string;
  bio: string;
  avatar_url: string | null;
  photos: string[];
  interests: string[];
  location: string | null;
  is_verified: boolean;
  is_premium: boolean;
  online?: boolean;
}

export const useDiscoverProfiles = () => {
  const { user } = useAuthStore();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetch = async () => {
      setLoading(true);

      // Get IDs we have already swiped
      const { data: swiped } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id);

      const swipedIds = (swiped ?? []).map((s: { swiped_id: string }) => s.swiped_id);
      swipedIds.push(user.id); // exclude self

      let query = supabase
        .from('profiles')
        .select('*')
        .eq('profile_complete', true)
        .not('id', 'in', `(${swipedIds.join(',') || 'null'})`)
        .limit(30);

      const { data, error } = await query;
      if (!error && data) setProfiles(data as Profile[]);
      setLoading(false);
    };

    fetch();
  }, [user]);

  const recordSwipe = async (swipedId: string, direction: 'left' | 'right') => {
    if (!user) return;
    await supabase.from('swipes').insert({ swiper_id: user.id, swiped_id: swipedId, direction });
    setProfiles((prev) => prev.filter((p) => p.id !== swipedId));
  };

  return { profiles, loading, recordSwipe };
};

export const useLikedProfiles = () => {
  const { user } = useAuthStore();
  const [likes, setLikes] = useState<{ id: string; profile: Profile; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('likes')
        .select('id, created_at, liker:profiles!likes_liker_id_fkey(*)')
        .eq('liked_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setLikes(data.map((d: Record<string, unknown>) => ({
          id: d.id as string,
          created_at: d.created_at as string,
          profile: d.liker as Profile,
        })));
      }
      setLoading(false);
    };

    fetch();

    // Real-time new likes
    const channel = supabase
      .channel('likes_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'likes', filter: `liked_id=eq.${user.id}` }, () => fetch())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return { likes, loading };
};
