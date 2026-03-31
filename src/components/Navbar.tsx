import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import BcareLogo from "@/assets/Bcare-logo.svg";

const Navbar = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();

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

  const toggleLang = () => setLang(lang === "ar" ? "en" : "ar");

  return (
    <nav className="sticky top-0 z-50 bg-background border-b-[3px] border-primary">
      <div className="section-container">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={BcareLogo} alt="BCare" className="h-8 md:h-9" />
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLang}
              className="text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              {t.nav.langSwitch}
            </button>
            <div className="w-px h-5 bg-border" />
            {user ? (
              <Button size="sm" variant="ghost" className="rounded-full text-muted-foreground hover:text-foreground" onClick={handleLogout}>
                {t.nav.logout}
              </Button>
            ) : (
              <Link to="/auth">
                <Button size="icon" variant="ghost" className="rounded-full w-9 h-9 text-primary hover:bg-primary/10">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
