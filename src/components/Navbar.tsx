import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import BcareLogo from "@/assets/Bcare-logo.svg";

const Navbar = () => {
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
    <nav className="sticky top-0 z-50 bg-background border-b-[3px] border-primary">
      <div className="section-container">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo - Right side (RTL) */}
          <Link to="/" className="flex items-center">
            <img src={BcareLogo} alt="BCare" className="h-8 md:h-9" />
          </Link>

          {/* Actions - Left side (RTL) */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors">EN</span>
            <div className="w-px h-5 bg-border" />
            {user ? (
              <Button size="sm" variant="ghost" className="rounded-full text-muted-foreground hover:text-foreground" onClick={handleLogout}>
                تسجيل الخروج
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
