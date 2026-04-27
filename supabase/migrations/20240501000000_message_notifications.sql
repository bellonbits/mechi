-- ============================================================
-- Message notification trigger
-- One row per sender→recipient pair (upsert keeps latest msg)
-- Run this in Supabase SQL Editor
-- ============================================================

-- Partial unique index so ON CONFLICT (user_id, actor_id) WHERE type='message' works
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifs_unique_message
  ON public.notifications (user_id, actor_id)
  WHERE type = 'message';

-- Trigger function
CREATE OR REPLACE FUNCTION public.notify_on_message()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  recipient_id uuid;
BEGIN
  -- Find the other participant in the conversation
  SELECT CASE
    WHEN user1_id = NEW.sender_id THEN user2_id
    ELSE user1_id
  END INTO recipient_id
  FROM public.conversations
  WHERE id = NEW.conversation_id;

  IF recipient_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, actor_id, type, content)
    VALUES (recipient_id, NEW.sender_id, 'message', NEW.content)
    ON CONFLICT (user_id, actor_id) WHERE type = 'message'
    DO UPDATE SET
      content    = EXCLUDED.content,
      created_at = now(),
      read_at    = null;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_message_notify ON public.messages;
CREATE TRIGGER on_message_notify
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_message();
