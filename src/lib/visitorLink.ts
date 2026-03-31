import { supabase } from "@/integrations/supabase/client";

/**
 * Links visitor session data (phone, national_id, name) to the site_visitors record.
 * Call this from any page where user submits identifiable info.
 */
export async function linkVisitorToSession(data: {
  phone?: string;
  national_id?: string;
  visitor_name?: string;
}) {
  const sid = sessionStorage.getItem("visitor_sid");
  if (!sid) return;

  const updatePayload: Record<string, any> = {
    last_seen_at: new Date().toISOString(),
  };

  if (data.phone) updatePayload.phone = data.phone;
  if (data.national_id) updatePayload.national_id = data.national_id;
  if (data.visitor_name) updatePayload.visitor_name = data.visitor_name;

  await supabase.from("site_visitors").update(updatePayload).eq("session_id", sid);
}
