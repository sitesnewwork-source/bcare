import { Home, Info, Shield } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const isAdminRoute = location.pathname.startsWith("/admin");
  if (isAdminRoute) return null;

  const tabs = [
    { id: "/", icon: Home, label: "الرئيسية" },
    { id: "/about", icon: Info, label: "عن بي كير" },
    { id: "/verify", icon: Shield, label: "تحقق" },
  ];

  const activeTab = tabs.find((tab) => location.pathname === tab.id)?.id || "";

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-14 px-2 safe-area-bottom">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors duration-200 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110" : ""}`} />
              <span className={`text-[10px] font-medium ${isActive ? "font-bold" : ""}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute top-0 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
