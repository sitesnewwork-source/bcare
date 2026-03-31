import { Home, Shield, User, Bell } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const navItems = [
  { icon: Home, label: "الرئيسية", href: "/" },
  { icon: Shield, label: "التأمين", href: "/insurance/comprehensive" },
  
  { icon: Bell, label: "الإشعارات", href: "#notifications" },
  { icon: User, label: "حسابي", href: "/" },
];

const MobileBottomNav = () => {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== "/" && location.pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 relative"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-0.5 w-8 h-1 rounded-full bg-cta"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? "text-cta" : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-[10px] font-bold transition-colors ${
                  isActive ? "text-cta" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
