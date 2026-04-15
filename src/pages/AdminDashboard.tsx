import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminVisitors from "@/components/admin/AdminVisitors";
import PullToRefresh from "@/components/PullToRefresh";
import { RefreshCw, VolumeX, Sun, Moon, Circle, Users, LogOut, Settings } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("visitors");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const navigate = useNavigate();

  const [refreshKey, setRefreshKey] = useState(0);
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem("admin_feed_mute") === "true");
  const { theme, toggleTheme } = useTheme();

  const [onlineCount, setOnlineCount] = useState(0);
  const [totalVisitorCount, setTotalVisitorCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      const { data } = await supabase.from("site_visitors").select("is_online, last_seen_at");
      if (data) {
        const now = Date.now();
        const online = data.filter((v: any) => now - new Date(v.last_seen_at).getTime() < 30000).length;
        setOnlineCount(online);
        setTotalVisitorCount(data.length);
      }
    };

    void fetchCounts();
    const interval = setInterval(() => {
      void fetchCounts();
    }, 15000);

    const channel = supabase
      .channel("header-visitor-count")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "site_visitors" }, () => {
        void fetchCounts();
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "site_visitors" }, () => {
        void fetchCounts();
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const checkMute = () => setIsMuted(localStorage.getItem("admin_feed_mute") === "true");
    window.addEventListener("storage", checkMute);
    return () => { window.removeEventListener("storage", checkMute); };
  }, []);

  const handlePullRefresh = useCallback(async () => {
    setRefreshKey(k => k + 1);
    await new Promise(r => setTimeout(r, 600));
    toast.success("تم تحديث البيانات");
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const navigateRef = useRef(navigate);
  const hasValidatedAccessRef = useRef(false);
  const authCheckSequenceRef = useRef(0);
  navigateRef.current = navigate;

  useEffect(() => {
    let mounted = true;

    const checkAdmin = async (shouldRedirectOnMissingSession = true) => {
      const sequence = ++authCheckSequenceRef.current;

      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (!mounted || sequence !== authCheckSequenceRef.current) return;

        if (sessionError) {
          console.error("Admin session check failed", sessionError);
          if (hasValidatedAccessRef.current) {
            setIsAdmin(true);
          }
          return;
        }

        const user = session?.user;

        if (!user) {
          if (hasValidatedAccessRef.current && !shouldRedirectOnMissingSession) {
            setIsAdmin(true);
            return;
          }

          setIsAdmin(false);
          if (shouldRedirectOnMissingSession) {
            navigateRef.current("/admin/login");
          }
          return;
        }

        const { data: hasRole, error: roleError } = await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "admin",
        });

        if (!mounted || sequence !== authCheckSequenceRef.current) return;

        if (roleError) {
          console.error("Admin role check failed", roleError);
          if (hasValidatedAccessRef.current) {
            setIsAdmin(true);
          }
          return;
        }

        if (!hasRole) {
          hasValidatedAccessRef.current = false;
          setIsAdmin(false);
          toast.error("ليس لديك صلاحية الوصول");
          navigateRef.current("/");
          return;
        }

        hasValidatedAccessRef.current = true;
        setIsAdmin(true);
      } catch (error) {
        console.error("Unexpected admin auth check error", error);
        if (hasValidatedAccessRef.current) {
          setIsAdmin(true);
        }
      }
    };

    void checkAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        hasValidatedAccessRef.current = false;
        setIsAdmin(false);
        navigateRef.current("/admin/login");
        return;
      }

      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        void checkAdmin(false);
        return;
      }

      if (event === "TOKEN_REFRESHED" && session?.user && !hasValidatedAccessRef.current) {
        void checkAdmin(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isAdmin === null) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-white/50 animate-spin" />
          <span className="text-white/60 text-sm">جاري التحقق من الصلاحيات...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-secondary/30 flex flex-col">
      <header className="h-12 bg-card border-b border-border flex items-center justify-between px-2 md:px-4 shrink-0" dir="rtl">
        <div className="flex items-center gap-1.5 md:gap-3 min-w-0">
          <h1 className="text-xs md:text-sm font-bold text-foreground shrink-0">لوحة التحكم</h1>
          <div className="hidden md:flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded-full">
            <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-600">متصل</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded-full">
            <Circle className="w-1.5 h-1.5 fill-emerald-500 text-emerald-500 md:hidden" />
            <Users className="w-3 h-3 text-primary hidden md:block" />
            <span className="text-[10px] font-bold text-primary">{onlineCount} نشط</span>
            <span className="text-[10px] text-muted-foreground hidden sm:inline">/ {totalVisitorCount} زائر</span>
          </div>
        </div>

        <div className="flex items-center gap-0.5 md:gap-1 shrink-0">
            <button
              onClick={() => setActiveTab(activeTab === "settings" ? "visitors" : "settings")}
              className={`p-1.5 rounded-lg hover:bg-secondary/70 transition-colors ${activeTab === "settings" ? "bg-secondary" : ""}`}
              title="الإعدادات"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-secondary/70 transition-colors"
              title={theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-cta" />
              ) : (
                <Moon className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            {isMuted && (
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive" title="الصوت مكتوم">
                <VolumeX className="w-3 h-3" />
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4 text-destructive" />
            </button>
        </div>
      </header>

      <PullToRefresh onRefresh={handlePullRefresh}>
        <main className="flex-1 p-1.5 md:p-4 lg:p-6">
          {activeTab === "settings" && <AdminSettings />}
          {activeTab === "visitors" && <AdminVisitors key={refreshKey} />}
        </main>
      </PullToRefresh>
    </div>
  );
};

export default AdminDashboard;
