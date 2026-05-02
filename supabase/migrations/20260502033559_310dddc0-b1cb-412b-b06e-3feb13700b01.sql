-- Ensure realtime publication includes all tables the admin dashboard needs to react to live
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='insurance_requests') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.insurance_requests';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='chat_messages') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='chat_conversations') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='claims') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.claims';
  END IF;
END $$;

-- REPLICA IDENTITY FULL so UPDATE/DELETE events deliver the complete previous row
ALTER TABLE public.insurance_orders REPLICA IDENTITY FULL;
ALTER TABLE public.insurance_order_stage_events REPLICA IDENTITY FULL;
ALTER TABLE public.site_visitors REPLICA IDENTITY FULL;
ALTER TABLE public.insurance_requests REPLICA IDENTITY FULL;
ALTER TABLE public.claims REPLICA IDENTITY FULL;