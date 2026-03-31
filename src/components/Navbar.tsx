import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import NotificationBell from "@/components/NotificationBell";

const productItems = [
  { label: "التأمين الشامل", href: "/insurance/comprehensive" },
  { label: "ضد الغير", href: "/insurance/third-party" },
];

const helpItems = [
  { label: "الأسئلة الشائعة", href: "/#faq" },
  { label: "تواصل معنا", href: "/#contact" },
];

const Navbar = () => {
  const [productsOpen, setProductsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="section-container">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">tree</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {/* Products dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setProductsOpen(true)}
                onMouseLeave={() => setProductsOpen(false)}
                className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                المنتجات
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <AnimatePresence>
                {productsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    onMouseEnter={() => setProductsOpen(true)}
                    onMouseLeave={() => setProductsOpen(false)}
                    className="absolute top-full right-0 mt-1 bg-card border border-border rounded-xl shadow-lg py-2 min-w-[180px] z-50"
                  >
                    {productItems.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className="block px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              عنّا
            </Link>

            {/* Help dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setHelpOpen(true)}
                onMouseLeave={() => setHelpOpen(false)}
                className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                تحتاج مساعدة؟
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <AnimatePresence>
                {helpOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    onMouseEnter={() => setHelpOpen(true)}
                    onMouseLeave={() => setHelpOpen(false)}
                    className="absolute top-full right-0 mt-1 bg-card border border-border rounded-xl shadow-lg py-2 min-w-[180px] z-50"
                  >
                    {helpItems.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className="block px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 border border-border rounded-full px-1 py-1">
              <button className="text-xs font-medium px-3 py-1 rounded-full bg-primary text-primary-foreground">
                ع
              </button>
              <button className="text-xs font-medium px-3 py-1 rounded-full text-muted-foreground hover:text-foreground transition-colors">
                En
              </button>
            </div>
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Button size="sm" variant="outline" className="rounded-full border-border text-foreground hover:bg-muted" onClick={handleLogout}>
                  تسجيل الخروج
                </Button>
              </div>
            ) : (
              <Link to="/auth" className="hidden md:block">
                <Button size="sm" variant="outline" className="rounded-full border-border text-foreground hover:bg-muted">
                  تسجيل الدخول
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu removed - using bottom navigation instead */}
    </nav>
  );
};

export default Navbar;
