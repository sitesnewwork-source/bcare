/**
 * Injects the visitor session ID as a custom header into the Supabase client.
 * This header is read by RLS policies via get_visitor_session() to scope
 * anonymous access to only the caller's own data.
 */
import { supabase } from "@/integrations/supabase/client";

let _headerSet = false;

export function ensureVisitorSessionHeader() {
  const sid = sessionStorage.getItem("visitor_sid");
  if (!sid) return;
  if (_headerSet) return;

  // Supabase JS v2 exposes rest.headers on the PostgrestClient
  // We inject our custom header so PostgREST can read it via current_setting()
  try {
    const rest = (supabase as any).rest;
    if (rest && rest.headers) {
      rest.headers["x-visitor-session"] = sid;
      _headerSet = true;
    }
  } catch {
    // Fallback: no-op if internal API changes
  }
}

/**
 * Call after creating/reading the session ID to update the header.
 * Useful when session ID is created for the first time.
 */
export function setVisitorSessionHeader(sessionId: string) {
  try {
    const rest = (supabase as any).rest;
    if (rest && rest.headers) {
      rest.headers["x-visitor-session"] = sessionId;
      _headerSet = true;
    }
  } catch {
    // no-op
  }
}
