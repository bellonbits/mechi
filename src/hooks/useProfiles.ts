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
  looking_for: string | null;
  is_verified: boolean;
  is_premium: boolean;
  profile_complete: boolean;
  ai_bestie_name?: string;
  online?: boolean;
}

export const useDiscoverProfiles = (filters?: { minAge: number; maxAge: number; lookingFor?: string }) => {
  const { user, profile: myProfile } = useAuthStore();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async (isRecycling = false) => {
    if (!user) return;
    setLoading(true);

    // Get current user's profile to extract preference
    const myPrefTag = myProfile?.interests?.find((i: string) => i.startsWith('PREF:'));
    let myPreference = myPrefTag ? myPrefTag.replace('PREF:', '') : 'Everyone';
    
    // Fallback if not in store yet
    if (!myPrefTag) {
      const { data: myData } = await supabase.from('profiles').select('interests').eq('id', user.id).single();
      const freshTag = myData?.interests?.find((i: string) => i.startsWith('PREF:'));
      if (freshTag) myPreference = freshTag.replace('PREF:', '');
    }

    const { data: swiped } = await supabase
      .from('swipes')
      .select('swiped_id, direction')
      .eq('swiper_id', user.id);

    const swipedIds = (swiped ?? [])
      .filter(s => isRecycling ? s.direction === 'right' : true)
      .map((s: { swiped_id: string }) => s.swiped_id);
    
    swipedIds.push(user.id);

    let query = supabase
      .from('profiles')
      .select('*')
      .not('id', 'in', `(${swipedIds.join(',') || 'null'})`)
      .not('full_name', 'is', null)
      .neq('full_name', '[Deleted]');

    // Gender Filter
    if (myPreference === 'Men') query = query.eq('gender', 'Man');
    else if (myPreference === 'Women') query = query.eq('gender', 'Woman');

    if (filters) {
      if (filters.minAge) query = query.gte('age', filters.minAge);
      if (filters.maxAge) query = query.lte('age', filters.maxAge);
      
      // Goal Filter (looking_for is the dating goal now)
      if (filters.lookingFor && filters.lookingFor !== 'Any' && !['Men','Women','Everyone'].includes(filters.lookingFor)) {
        query = query.eq('looking_for', filters.lookingFor);
      }
    }

    const { data, error } = await query.limit(30);
    
    if (!error && data) {
      if (data.length === 0 && !isRecycling) {
        // No new profiles left but haven't tried recycling yet
        await fetchProfiles(true);
      } else {
        setProfiles(data as Profile[]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();

    // REAL-TIME: Listen for new complete profiles
    const channel = supabase
      .channel('new_profiles')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'profiles'
      }, (payload) => {
        const newProfile = payload.new as Profile;
        if (newProfile.profile_complete && newProfile.id !== user?.id) {
          setProfiles(prev => {
            // Only add if not already in list
            if (prev.some(p => p.id === newProfile.id)) return prev;
            return [newProfile, ...prev];
          });
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles'
      }, (payload) => {
        const updated = payload.new as Profile;
        if (updated.profile_complete && updated.id !== user?.id) {
          setProfiles(prev => {
            if (prev.some(p => p.id === updated.id)) return prev;
            return [updated, ...prev];
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

      // likes.liker_id FK → auth.users (not profiles), so we do a 2-step fetch
      const { data: likeData, error } = await supabase
        .from('likes')
        .select('id, created_at, liker_id')
        .eq('liked_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && likeData && likeData.length > 0) {
        const ids = [...new Set(likeData.map((l) => l.liker_id))];
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', ids);
        const profileMap = new Map((profileData ?? []).map((p) => [p.id, p]));

        setLikes(
          likeData.map((l) => ({
            id: l.id as string,
            created_at: l.created_at as string,
            profile: (profileMap.get(l.liker_id) ?? { id: l.liker_id, full_name: 'Mechi User', avatar_url: null, is_verified: false }) as Profile,
          }))
        );
      } else {
        setLikes([]);
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
export const useMatches = () => {
  const { user } = useAuthStore();
  const [matches, setMatches] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetch = async () => {
      setLoading(true);

      // matches.user1_id/user2_id FK → auth.users, so use 2-step fetch
      const { data: matchData, error } = await supabase
        .from('matches')
        .select('id, user1_id, user2_id, created_at')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (!error && matchData && matchData.length > 0) {
        const contactIds = matchData.map((m) =>
          m.user1_id === user.id ? m.user2_id : m.user1_id
        );
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', [...new Set(contactIds)]);
        const profileMap = new Map((profileData ?? []).map((p) => [p.id, p]));

        const mapped = matchData.map((m) => {
          const contactId = m.user1_id === user.id ? m.user2_id : m.user1_id;
          return (profileMap.get(contactId) ?? { id: contactId, full_name: 'Mechi User', avatar_url: null, is_verified: false }) as Profile;
        });
        setMatches(mapped);
      } else {
        setMatches([]);
      }
      setLoading(false);
    };

    fetch();
    const channel = supabase
      .channel('matches_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'matches' }, () => fetch())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return { matches, loading };
};
