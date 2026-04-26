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

export const useDiscoverProfiles = (filters?: { minAge: number; maxAge: number; lookingFor?: string }) => {
  const { user } = useAuthStore();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    if (!user) return;
    setLoading(true);

    const { data: swiped } = await supabase
      .from('swipes')
      .select('swiped_id')
      .eq('swiper_id', user.id);

    const swipedIds = (swiped ?? []).map((s: { swiped_id: string }) => s.swiped_id);
    swipedIds.push(user.id);

    let query = supabase
      .from('profiles')
      .select('*')
      .eq('profile_complete', true)
      .not('id', 'in', `(${swipedIds.join(',') || 'null'})`);

    if (filters) {
      if (filters.minAge) query = query.gte('age', filters.minAge);
      if (filters.maxAge) query = query.lte('age', filters.maxAge);
      if (filters.lookingFor && filters.lookingFor !== 'Any') {
        query = query.eq('looking_for', filters.lookingFor);
      }
    }

    const { data, error } = await query.limit(30);
    if (!error && data) setProfiles(data as Profile[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filters?.minAge, filters?.maxAge, filters?.lookingFor]);

  const recordSwipe = async (swipedId: string, direction: 'left' | 'right'): Promise<boolean> => {
    if (!user) return false;
    
    // Record the swipe
    await supabase.from('swipes').insert({ swiper_id: user.id, swiped_id: swipedId, direction });
    
    // Remove from local list
    setProfiles((prev) => prev.filter((p) => p.id !== swipedId));

    if (direction === 'right') {
      // Check if it was a match (is there a row in public.matches?)
      // LEAST/GREATEST logic is used in database, we should check both ways or LEAST/GREATEST here
      const u1 = [user.id, swipedId].sort()[0];
      const u2 = [user.id, swipedId].sort()[1];

      const { data: match } = await supabase
        .from('matches')
        .select('id')
        .eq('user1_id', u1)
        .eq('user2_id', u2)
        .maybeSingle();

      return !!match;
    }

    return false;
  };

  return { profiles, loading, recordSwipe, refresh: fetchProfiles };
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
