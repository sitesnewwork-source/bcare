import { supabase } from "@/integrations/supabase/client";

/**
 * Links visitor session data (phone, national_id, name, linked_request_id) to the site_visitors record.
 * Uses RPC function for secure server-side update.
 */
export async function linkVisitorToSession(data: {
  phone?: string;
  national_id?: string;
  visitor_name?: string;
  linked_request_id?: string;
}) {
  const sid = sessionStorage.getItem("visitor_sid");
  if (!sid) {
    console.warn("[visitorLink] No visitor_sid in sessionStorage");
    return;
  }

  // Only send non-empty values
  const params: Record<string, any> = {
    p_session_id: sid,
    p_phone: data.phone || null,
    p_national_id: data.national_id || null,
    p_visitor_name: data.visitor_name || null,
  };

  // Use the overload with linked_request_id if provided
  if (data.linked_request_id) {
    params.p_linked_request_id = data.linked_request_id;
  }

  const { error } = await supabase.rpc("link_visitor_data", params as any);
  if (error) {
    console.error("[visitorLink] Failed to link visitor data:", error.message);
  }
}
