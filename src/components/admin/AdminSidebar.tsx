import { LogOut, ChevronRight, Settings, Eye, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Globe } from "lucide-react";

const menuItems = [
  { id: "visitors", label: "قائمة الزوار", icon: Eye },
  { id: "settings", label: "الإعدادات", icon: Settings },
];

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingCounts?: Record<string, never>;
}

const AdminSidebar = ({ activeTab, setActiveTab, pendingCounts = {} }: Props) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on tab change
  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  // Close mobile sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Mobile hamburger button - shown in mobile top bar */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-2 right-2 z-[60] p-2 bg-card border border-border rounded-lg shadow-lg"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-[70]"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        bg-card border-l border-border text-foreground flex flex-col transition-all duration-300 z-[80]
        ${/* Mobile */""} 
        fixed md:relative inset-y-0 right-0
        ${mobileOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
        ${collapsed ? "md:w-16 w-64" : "w-64 md:w-60"}
      `}>
        {/* Header */}
        <div className="p-3 flex items-center justify-between border-b border-border">
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cta flex items-center justify-center">
                <span className="text-xs font-bold text-white">T</span>
              </div>
              <span className="text-sm font-bold">tree</span>
            </Link>
          )}
          <div className="flex items-center gap-1">
            <button onClick={() => setMobileOpen(false)} className="md:hidden text-white/50 hover:text-white p-1.5 rounded-lg hover:bg-white/5">
              <X className="w-4 h-4" />
            </button>
            <button onClick={() => setCollapsed(!collapsed)} className="hidden md:block text-white/50 hover:text-white p-1.5 rounded-lg hover:bg-white/5">
              <ChevronRight className={`w-4 h-4 transition-transform ${collapsed ? "" : "rotate-180"}`} />
            </button>
          </div>
        </div>

        {/* Status bar */}
        {!collapsed && (
          <div className="px-3 py-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-white/60">الموقع يعمل</span>
              <Globe className="w-3 h-3 text-white/40 mr-auto" />
            </div>
          </div>
        )}

        {/* Menu */}
        <nav className="flex-1 py-2 space-y-0.5 px-2 overflow-y-auto">
        {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 md:py-2 rounded-lg text-sm md:text-xs font-medium transition-all ${
                  activeTab === item.id
                    ? "bg-cta text-white shadow-sm shadow-cta/20"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5 md:w-4 md:h-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            ))}
        </nav>

        {/* Bottom */}
        <div className="p-2 border-t border-white/10 space-y-0.5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-2.5 py-2.5 md:py-2 rounded-lg text-sm md:text-xs font-medium text-white/60 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5 md:w-4 md:h-4 shrink-0" />
            {!collapsed && <span>تسجيل الخروج</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
