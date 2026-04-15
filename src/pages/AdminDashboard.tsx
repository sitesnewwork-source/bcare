import { useEffect, useState, useCallback } from "react";
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
    fetchCounts();
    const channel = supabase
      .channel("header-visitor-count")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_visitors" }, () => fetchCounts())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
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

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/admin/login"); return; }

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!data) {
        toast.error("ليس لديك صلاحية الوصول");
        navigate("/");
        return;
      }
      setIsAdmin(true);
    };
    checkAdmin();
  }, [navigate]);

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
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold text-foreground">لوحة التحكم</h1>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded-full">
            <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-600">متصل</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded-full">
            <Users className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold text-primary">{onlineCount} نشط</span>
            <span className="text-[10px] text-muted-foreground">/ {totalVisitorCount} زائر</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 md:gap-1">
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
        </div>
      </header>

      <PullToRefresh onRefresh={handlePullRefresh}>
        <main className="flex-1 p-2 md:p-4 lg:p-6">
          {activeTab === "settings" && <AdminSettings />}
          {activeTab === "visitors" && <AdminVisitors key={refreshKey} />}
        </main>
      </PullToRefresh>
    </div>
  );
};

export default AdminDashboard;
