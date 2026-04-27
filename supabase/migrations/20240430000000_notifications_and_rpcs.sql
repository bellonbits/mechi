-- ============================================================
-- Patch: Notifications table, get_or_create_conversation RPC,
--        and update triggers
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── Notifications table ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id          uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  actor_id    uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  type        text CHECK (type IN ('match', 'like', 'message', 'system')) NOT NULL,
  content     text NOT NULL,
  read_at     timestamp with time zone,
  created_at  timestamp with time zone DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifs_select" ON public.notifications;
CREATE POLICY "notifs_select" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "notifs_update" ON public.notifications;
CREATE POLICY "notifs_update" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "notifs_delete" ON public.notifications;
CREATE POLICY "notifs_delete" ON public.notifications FOR DELETE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "notifs_insert" ON public.notifications;
CREATE POLICY "notifs_insert" ON public.notifications FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_notifs_user ON public.notifications(user_id, created_at DESC);

-- Add notifications to realtime publications (idempotent check)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;

-- ── Auto-notify on match ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.notify_on_match()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, actor_id, type, content)
  VALUES (NEW.user1_id, NEW.user2_id, 'match', 'You have a new match! 🎉')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.notifications (user_id, actor_id, type, content)
  VALUES (NEW.user2_id, NEW.user1_id, 'match', 'You have a new match! 🎉')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_match_notify ON public.matches;
CREATE TRIGGER on_match_notify
  AFTER INSERT ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_match();

-- ── Auto-notify on like ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.notify_on_like()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, actor_id, type, content)
  VALUES (NEW.liked_id, NEW.liker_id, 'like', 'Someone liked your profile ❤️')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_like_notify ON public.likes;
CREATE TRIGGER on_like_notify
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_like();

-- ── get_or_create_conversation RPC ───────────────────────────
-- Used by MatchModal and Notifications page to navigate to a chat
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(target_user_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  uid uuid := auth.uid();
  u1  uuid;
  u2  uuid;
  conv_id uuid;
BEGIN
  -- Always store with LEAST/GREATEST to respect the UNIQUE constraint
  u1 := LEAST(uid, target_user_id);
  u2 := GREATEST(uid, target_user_id);

  -- Try to find existing conversation
  SELECT id INTO conv_id
  FROM public.conversations
  WHERE user1_id = u1 AND user2_id = u2
  LIMIT 1;

  IF conv_id IS NULL THEN
    INSERT INTO public.conversations (user1_id, user2_id)
    VALUES (u1, u2)
    ON CONFLICT (user1_id, user2_id) DO NOTHING
    RETURNING id INTO conv_id;

    -- Re-query if ON CONFLICT path was taken (RETURNING gives NULL on conflict)
    IF conv_id IS NULL THEN
      SELECT id INTO conv_id
      FROM public.conversations
      WHERE user1_id = u1 AND user2_id = u2
      LIMIT 1;
    END IF;
  END IF;

  RETURN conv_id;
END;
$$;

-- ── Allow profile updates (needed for location sync) ─────────
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ── Ensure profiles insert policy exists ─────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'profiles_insert'
  ) THEN
    CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;
