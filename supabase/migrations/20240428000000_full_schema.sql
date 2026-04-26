-- ============================================================
-- Mechi Full Schema Migration
-- Run this in Supabase SQL Editor after the initial schema
-- ============================================================

-- Extend profiles table with all needed fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age integer,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS looking_for text,
  ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS profile_complete boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Storage bucket for avatars (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/heic'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;
CREATE POLICY "Public avatar access" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "User avatar upload" ON storage.objects;
CREATE POLICY "User avatar upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "User avatar update" ON storage.objects;
CREATE POLICY "User avatar update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "User avatar delete" ON storage.objects;
CREATE POLICY "User avatar delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ── Swipes ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.swipes (
  id          uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  swiper_id   uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  swiped_id   uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  direction   text CHECK (direction IN ('left','right')) NOT NULL,
  created_at  timestamp with time zone DEFAULT now(),
  UNIQUE (swiper_id, swiped_id)
);

ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "swipes_select" ON public.swipes FOR SELECT USING (auth.uid() = swiper_id);
CREATE POLICY "swipes_insert" ON public.swipes FOR INSERT WITH CHECK (auth.uid() = swiper_id);

CREATE INDEX IF NOT EXISTS idx_swipes_swiper ON public.swipes(swiper_id);
CREATE INDEX IF NOT EXISTS idx_swipes_swiped ON public.swipes(swiped_id);

-- ── Matches ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.matches (
  id          uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user1_id    uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  user2_id    uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  created_at  timestamp with time zone DEFAULT now(),
  UNIQUE (user1_id, user2_id)
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "matches_select" ON public.matches FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "matches_insert" ON public.matches FOR INSERT WITH CHECK (true);

-- ── Conversations ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.conversations (
  id               uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user1_id         uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  user2_id         uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  last_message     text,
  last_message_at  timestamp with time zone DEFAULT now(),
  created_at       timestamp with time zone DEFAULT now(),
  UNIQUE (user1_id, user2_id)
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conv_select" ON public.conversations FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "conv_insert" ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "conv_update" ON public.conversations FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE INDEX IF NOT EXISTS idx_conv_user1 ON public.conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conv_user2 ON public.conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_conv_last_msg ON public.conversations(last_message_at DESC);

-- ── Messages ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id               uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id  uuid REFERENCES public.conversations ON DELETE CASCADE NOT NULL,
  sender_id        uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  content          text NOT NULL,
  read_at          timestamp with time zone,
  created_at       timestamp with time zone DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msg_select" ON public.messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
  ));
CREATE POLICY "msg_insert" ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "msg_update" ON public.messages FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
  ));

CREATE INDEX IF NOT EXISTS idx_msgs_conv ON public.messages(conversation_id, created_at);

-- ── Likes ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.likes (
  id          uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  liker_id    uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  liked_id    uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  created_at  timestamp with time zone DEFAULT now(),
  UNIQUE (liker_id, liked_id)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "likes_select_received" ON public.likes FOR SELECT USING (auth.uid() = liked_id);
CREATE POLICY "likes_select_sent"     ON public.likes FOR SELECT USING (auth.uid() = liker_id);
CREATE POLICY "likes_insert"          ON public.likes FOR INSERT WITH CHECK (auth.uid() = liker_id);
CREATE POLICY "likes_delete"          ON public.likes FOR DELETE USING (auth.uid() = liker_id);

CREATE INDEX IF NOT EXISTS idx_likes_liked ON public.likes(liked_id, created_at DESC);

-- ── Fix profile policies ──────────────────────────────────────
-- Allow authenticated users to see all complete profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles"   ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ── Realtime ──────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.likes;

-- ── Auto-match trigger ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_swipe_match()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  u1 uuid; u2 uuid;
BEGIN
  IF NEW.direction = 'right' THEN
    -- Record like
    INSERT INTO public.likes (liker_id, liked_id)
    VALUES (NEW.swiper_id, NEW.swiped_id) ON CONFLICT DO NOTHING;

    -- Check mutual right swipe
    IF EXISTS (
      SELECT 1 FROM public.swipes
      WHERE swiper_id = NEW.swiped_id AND swiped_id = NEW.swiper_id AND direction = 'right'
    ) THEN
      u1 := LEAST(NEW.swiper_id, NEW.swiped_id);
      u2 := GREATEST(NEW.swiper_id, NEW.swiped_id);
      INSERT INTO public.matches (user1_id, user2_id) VALUES (u1, u2) ON CONFLICT DO NOTHING;
      INSERT INTO public.conversations (user1_id, user2_id) VALUES (u1, u2) ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_swipe_created ON public.swipes;
CREATE TRIGGER on_swipe_created
  AFTER INSERT ON public.swipes
  FOR EACH ROW EXECUTE FUNCTION public.handle_swipe_match();

-- ── Delete account RPC ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  DELETE FROM public.swipes      WHERE swiper_id = uid OR swiped_id = uid;
  DELETE FROM public.likes       WHERE liker_id  = uid OR liked_id  = uid;
  DELETE FROM public.messages    WHERE sender_id  = uid;
  DELETE FROM public.conversations WHERE user1_id = uid OR user2_id = uid;
  DELETE FROM public.matches     WHERE user1_id   = uid OR user2_id = uid;
  DELETE FROM public.subscriptions WHERE user_id  = uid;
  UPDATE public.profiles
    SET full_name = '[Deleted]', avatar_url = null, bio = null,
        photos = '{}', interests = '{}', is_verified = false,
        profile_complete = false, updated_at = now()
  WHERE id = uid;
  -- Sign out is handled by the client after calling this
END;
$$;

-- ── Updated profile trigger (also sets updated_at) ────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
