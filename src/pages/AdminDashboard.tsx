import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AdminSidebar from "@/components/admin/AdminSidebar";






import AdminSettings from "@/components/admin/AdminSettings";

import AdminVisitors from "@/components/admin/AdminVisitors";
import AdminLiveFeed from "@/components/admin/AdminLiveFeed";
import PullToRefresh from "@/components/PullToRefresh";
import { Search, RefreshCw, Activity, VolumeX, Sun, Moon } from "lucide-react";
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
      <div className="min-h-[100dvh] bg-[#0f172a] flex items-center justify-center">
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
        <header className="h-12 bg-card border-b border-border flex items-center justify-between px-2 md:px-4 shrink-0">
          {/* Spacer for mobile hamburger */}
          <div className="w-10 md:hidden" />
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground hidden md:block" />
            <input
              type="text"
              placeholder="بحث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none flex-1 min-w-0"
            />
          </div>

          <div className="flex items-center gap-0.5 md:gap-1">
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
