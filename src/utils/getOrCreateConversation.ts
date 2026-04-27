import { supabase } from './supabase';

/**
 * Finds an existing conversation between the current user and targetUserId,
 * or creates one if it doesn't exist. Works without any RPC function.
 */
export const getOrCreateConversation = async (
  currentUserId: string,
  targetUserId: string
): Promise<string | null> => {
  // Always store in deterministic order (LEAST / GREATEST) to match the UNIQUE constraint
  const ids = [currentUserId, targetUserId].sort();
  const u1 = ids[0];
  const u2 = ids[1];

  // 1. Try to find an existing conversation
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('user1_id', u1)
    .eq('user2_id', u2)
    .maybeSingle();

  if (existing?.id) return existing.id;

  // 2. Create one (ON CONFLICT DO NOTHING handles races)
  const { data: created } = await supabase
    .from('conversations')
    .insert({ user1_id: u1, user2_id: u2 })
    .select('id')
    .single();

  if (created?.id) return created.id;

  // 3. Race condition: someone else just created it — fetch again
  const { data: retry } = await supabase
    .from('conversations')
    .select('id')
    .eq('user1_id', u1)
    .eq('user2_id', u2)
    .maybeSingle();

  return retry?.id ?? null;
};
