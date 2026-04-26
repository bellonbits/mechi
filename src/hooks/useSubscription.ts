import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { useAuthStore } from '../store/useAuthStore';

export const useSubscription = () => {
  const { user } = useAuthStore();

  const { data: subscription, isLoading, refetch } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const isPremium = subscription?.status === 'active' && new Date(subscription.end_date) > new Date();

  return {
    subscription,
    isPremium,
    isLoading,
    refetch,
  };
};
