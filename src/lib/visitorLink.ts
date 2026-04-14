import { supabase } from "@/integrations/supabase/client";

/**
 * Links visitor session data to site_visitors record.
 * Tries RPC first, falls back to direct UPDATE.
 */
export async function linkVisitorToSession(data: {
  phone?: string;
  national_id?: string;
  visitor_name?: string;
  linked_request_id?: string;
}) {
  const sid = sessionStorage.getItem("visitor_sid");
  if (!sid) {
    console.warn("linkVisitorToSession: no session ID found");
    return;
  }

  // محاولة 1: RPC
  const { error: rpcError } = await supabase.rpc("link_visitor_data", {
    p_session_id: sid,
    p_phone: data.phone || null,
    p_national_id: data.national_id || null,
    p_visitor_name: data.visitor_name || null,
    p_linked_request_id: data.linked_request_id || null,
  } as any);

  if (rpcError) {
    console.warn("RPC failed, trying direct update:", rpcError.message);

    // محاولة 2: UPDATE مباشر
    const { error: updateError } = await supabase
      .from("site_visitors")
      .update({
        phone: data.phone || null,
        national_id: data.national_id || null,
        visitor_name: data.visitor_name || null,
        linked_request_id: data.linked_request_id || null,
      } as any)
      .eq("session_id", sid);

    if (updateError) {
      console.error("Direct update also failed:", updateError.message);
    } else {
      console.log("✅ Visitor data saved via direct update");
    }
  } else {
    console.log("✅ Visitor data saved via RPC");
  }
}
