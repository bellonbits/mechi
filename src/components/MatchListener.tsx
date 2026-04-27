import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { MatchModal } from './MatchModal';
import type { Profile } from '../hooks/useProfiles';

export const MatchListener = () => {
  const { user, profile: myProfile } = useAuthStore();
  const [matchData, setMatchData] = useState<Profile | null>(null);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('global_matches')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'matches' 
      }, async (payload) => {
        const newMatch = payload.new;
        if (newMatch.user1_id === user.id || newMatch.user2_id === user.id) {
          // Identify the other user
          const otherId = newMatch.user1_id === user.id ? newMatch.user2_id : newMatch.user1_id;
          
          // Fetch their profile
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', otherId)
            .single();

          if (data) {
            setMatchData(data as Profile);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (!matchData) return null;

  return (
    <MatchModal 
      isOpen={!!matchData}
      onClose={() => setMatchData(null)}
      myProfile={myProfile}
      matchProfile={matchData}
    />
  );
};
