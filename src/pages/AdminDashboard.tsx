import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminVisitors from "@/components/admin/AdminVisitors";
import AdminLiveFeed from "@/components/admin/AdminLiveFeed";
import PullToRefresh from "@/components/PullToRefresh";
import { Search, RefreshCw, Activity, VolumeX, Sun, Moon, Circle, Users } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("visitors");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  
  const [refreshKey, setRefreshKey] = useState(0);
  const [liveFeedOpen, setLiveFeedOpen] = useState(false);
  const [liveFeedCount, setLiveFeedCount] = useState(0);
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem("admin_feed_mute") === "true");
  const { theme, toggleTheme } = useTheme();

  // Visitor counts for header
  const [onlineCount, setOnlineCount] = useState(0);
  const [totalVisitorCount, setTotalVisitorCount] = useState(0);

  // Fetch visitor counts for header
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
    const interval = setInterval(fetchCounts, 10000);
    const channel = supabase
      .channel("header-visitor-count")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_visitors" }, () => fetchCounts())
      .subscribe();
    return () => { clearInterval(interval); supabase.removeChannel(channel); };
  }, []);

  // Listen for mute changes from LiveFeed settings
  useEffect(() => {
    const checkMute = () => setIsMuted(localStorage.getItem("admin_feed_mute") === "true");
    window.addEventListener("storage", checkMute);
    const interval = setInterval(checkMute, 1000);
    return () => { window.removeEventListener("storage", checkMute); clearInterval(interval); };
  }, []);

  const handlePullRefresh = useCallback(async () => {
    setRefreshKey(k => k + 1);
    await new Promise(r => setTimeout(r, 600));
    toast.success("تم تحديث البيانات");
  }, []);

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
    <div className="min-h-[100dvh] bg-secondary/30 flex">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Bar */}
        <header className="h-12 bg-card border-b border-border flex items-center justify-between px-2 md:px-4 shrink-0" dir="rtl">
          {/* Right side: Title + Status */}
          <div className="flex items-center gap-3">
            {/* Spacer for mobile hamburger */}
            <div className="w-10 md:hidden" />
            <h1 className="text-sm font-bold text-foreground hidden md:block">لوحة التحكم</h1>
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

          {/* Left side: Search + Actions */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 max-w-[200px]">
              <Search className="w-3.5 h-3.5 text-muted-foreground hidden md:block" />
              <input
                type="text"
                placeholder="بحث..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none flex-1 min-w-0"
              />
            </div>

            <div className="flex items-center gap-0.5 md:gap-1">
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
                onClick={() => setLiveFeedOpen(true)}
                className="md:hidden relative p-1.5 rounded-lg hover:bg-secondary/70 transition-colors"
                title="التنبيهات المباشرة"
              >
                <Activity className="w-4 h-4 text-primary" />
                {liveFeedCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                    {liveFeedCount > 9 ? "9+" : liveFeedCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <PullToRefresh onRefresh={handlePullRefresh}>
          <main className="flex-1 p-2 md:p-4 lg:p-6">
            
            
            
            
            
            
            {activeTab === "settings" && <AdminSettings />}
            
            {activeTab === "visitors" && <AdminVisitors key={refreshKey} />}
          </main>
        </PullToRefresh>
      </div>

      {/* Live Feed Panel - Hidden on mobile by default (collapsed) */}
      <AdminLiveFeed isOpen={liveFeedOpen} onOpenChange={setLiveFeedOpen} onCountChange={setLiveFeedCount} />
    </div>
  );
};

export default AdminDashboard;
