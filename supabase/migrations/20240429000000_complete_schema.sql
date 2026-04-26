-- ============================================================
-- Mechi — Complete Schema (run this in Supabase SQL Editor)
-- Creates everything from scratch, safe to run on a blank DB
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── PROFILES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name     text,
  avatar_url    text,
  bio           text,
  age           integer,
  gender        text,
  looking_for   text,
  photos        text[]  DEFAULT '{}',
  interests     text[]  DEFAULT '{}',
  location      text,
  is_verified   boolean DEFAULT false,
  is_premium    boolean DEFAULT false,
  profile_complete boolean DEFAULT false,
  created_at    timestamp with time zone DEFAULT now(),
  updated_at    timestamp with time zone DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile"       ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile"     ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile"     ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;

CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ── SUBSCRIPTIONS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                  uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id             uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  status              text CHECK (status IN ('pending','active','expired','failed')) NOT NULL DEFAULT 'pending',
  start_date          timestamp with time zone,
  end_date            timestamp with time zone,
  amount              decimal NOT NULL DEFAULT 0,
  phone_number        text NOT NULL DEFAULT '',
  mpesa_receipt       text,
  checkout_request_id text UNIQUE,
  created_at          timestamp with time zone DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "subs_select" ON public.subscriptions;
DROP POLICY IF EXISTS "subs_insert" ON public.subscriptions;
CREATE POLICY "subs_select" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "subs_insert" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id            ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status             ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_checkout_request_id ON public.subscriptions(checkout_request_id);

-- ── SWIPES ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.swipes (
  id          uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  swiper_id   uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  swiped_id   uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  direction   text CHECK (direction IN ('left','right')) NOT NULL,
  created_at  timestamp with time zone DEFAULT now(),
  UNIQUE (swiper_id, swiped_id)
);

ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "swipes_select" ON public.swipes;
DROP POLICY IF EXISTS "swipes_insert" ON public.swipes;
CREATE POLICY "swipes_select" ON public.swipes FOR SELECT USING (auth.uid() = swiper_id);
CREATE POLICY "swipes_insert" ON public.swipes FOR INSERT WITH CHECK (auth.uid() = swiper_id);
CREATE INDEX IF NOT EXISTS idx_swipes_swiper ON public.swipes(swiper_id);
CREATE INDEX IF NOT EXISTS idx_swipes_swiped ON public.swipes(swiped_id);

-- ── MATCHES ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.matches (
  id          uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user1_id    uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  user2_id    uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  created_at  timestamp with time zone DEFAULT now(),
  UNIQUE (user1_id, user2_id)
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "matches_select" ON public.matches;
DROP POLICY IF EXISTS "matches_insert" ON public.matches;
CREATE POLICY "matches_select" ON public.matches FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "matches_insert" ON public.matches FOR INSERT WITH CHECK (true);

-- ── CONVERSATIONS ─────────────────────────────────────────────
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
DROP POLICY IF EXISTS "conv_select" ON public.conversations;
DROP POLICY IF EXISTS "conv_insert" ON public.conversations;
DROP POLICY IF EXISTS "conv_update" ON public.conversations;
CREATE POLICY "conv_select" ON public.conversations FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "conv_insert" ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "conv_update" ON public.conversations FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE INDEX IF NOT EXISTS idx_conv_user1    ON public.conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conv_user2    ON public.conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_conv_last_msg ON public.conversations(last_message_at DESC);

-- ── MESSAGES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id               uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id  uuid REFERENCES public.conversations ON DELETE CASCADE NOT NULL,
  sender_id        uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  content          text NOT NULL,
  read_at          timestamp with time zone,
  created_at       timestamp with time zone DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "msg_select" ON public.messages;
DROP POLICY IF EXISTS "msg_insert" ON public.messages;
DROP POLICY IF EXISTS "msg_update" ON public.messages;
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

-- ── LIKES ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.likes (
  id          uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  liker_id    uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  liked_id    uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  created_at  timestamp with time zone DEFAULT now(),
  UNIQUE (liker_id, liked_id)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "likes_select_received" ON public.likes;
DROP POLICY IF EXISTS "likes_select_sent"     ON public.likes;
DROP POLICY IF EXISTS "likes_insert"          ON public.likes;
DROP POLICY IF EXISTS "likes_delete"          ON public.likes;
CREATE POLICY "likes_select_received" ON public.likes FOR SELECT USING (auth.uid() = liked_id);
CREATE POLICY "likes_select_sent"     ON public.likes FOR SELECT USING (auth.uid() = liker_id);
CREATE POLICY "likes_insert"          ON public.likes FOR INSERT WITH CHECK (auth.uid() = liker_id);
CREATE POLICY "likes_delete"          ON public.likes FOR DELETE USING (auth.uid() = liker_id);
CREATE INDEX IF NOT EXISTS idx_likes_liked ON public.likes(liked_id, created_at DESC);

-- ── STORAGE BUCKET ────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/heic'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public avatar access"  ON storage.objects;
DROP POLICY IF EXISTS "User avatar upload"    ON storage.objects;
DROP POLICY IF EXISTS "User avatar update"    ON storage.objects;
DROP POLICY IF EXISTS "User avatar delete"    ON storage.objects;
CREATE POLICY "Public avatar access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "User avatar upload"   ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "User avatar update"   ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "User avatar delete"   ON storage.objects FOR DELETE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ── REALTIME ──────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.likes;

-- ── NEW USER TRIGGER ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── NOTIFICATIONS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id          uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  actor_id    uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  type        text CHECK (type IN ('match','like','message','system')) NOT NULL,
  content     text,
  read_at     timestamp with time zone,
  created_at  timestamp with time zone DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notif_select" ON public.notifications;
CREATE POLICY "notif_select" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_notif_user ON public.notifications(user_id, created_at DESC);
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ── AUTO-MATCH ON SWIPE ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_swipe_match()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  u1 uuid; u2 uuid;
BEGIN
  IF NEW.direction = 'right' THEN
    -- Record the like
    INSERT INTO public.likes (liker_id, liked_id)
    VALUES (NEW.swiper_id, NEW.swiped_id) ON CONFLICT DO NOTHING;

    -- Create "Someone liked you" notification
    INSERT INTO public.notifications (user_id, actor_id, type, content)
    VALUES (NEW.swiped_id, NEW.swiper_id, 'like', 'Sent you a like!') ON CONFLICT DO NOTHING;

    -- Check for mutual right swipe → create match + conversation
    IF EXISTS (
      SELECT 1 FROM public.swipes
      WHERE swiper_id = NEW.swiped_id
        AND swiped_id = NEW.swiper_id
        AND direction = 'right'
    ) THEN
      u1 := LEAST(NEW.swiper_id, NEW.swiped_id);
      u2 := GREATEST(NEW.swiper_id, NEW.swiped_id);
      INSERT INTO public.matches (user1_id, user2_id) VALUES (u1, u2) ON CONFLICT DO NOTHING;
      INSERT INTO public.conversations (user1_id, user2_id) VALUES (u1, u2) ON CONFLICT DO NOTHING;

      -- Create Match notifications for both users
      INSERT INTO public.notifications (user_id, actor_id, type, content)
      VALUES (NEW.swiper_id, NEW.swiped_id, 'match', 'You have a new match!'),
             (NEW.swiped_id, NEW.swiper_id, 'match', 'You have a new match!');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_swipe_created ON public.swipes;
CREATE TRIGGER on_swipe_created
  AFTER INSERT ON public.swipes
  FOR EACH ROW EXECUTE FUNCTION public.handle_swipe_match();

-- ── DELETE ACCOUNT RPC ────────────────────────────────────────
-- This function deletes all user data. 
-- Note: It deletes the public profile. To delete the AUTH user, 
-- you usually need a separate management API call or a service_role trigger.
CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  -- 1. Wipe all interaction data
  DELETE FROM public.swipes        WHERE swiper_id = uid OR swiped_id = uid;
  DELETE FROM public.likes         WHERE liker_id  = uid OR liked_id  = uid;
  DELETE FROM public.messages      WHERE sender_id = uid;
  DELETE FROM public.conversations WHERE user1_id  = uid OR user2_id = uid;
  DELETE FROM public.matches       WHERE user1_id  = uid OR user2_id = uid;
  DELETE FROM public.subscriptions WHERE user_id   = uid;
  
  -- 2. Hard delete the profile (this triggers cascade if other tables depend on it)
  DELETE FROM public.profiles WHERE id = uid;
  
  -- Note: The auth user session will be invalidated on the client side.
END;
$$;
