import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

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
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="section-container">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center">
              <span className="text-2xl font-extrabold text-primary">B</span>
              <span className="text-2xl font-extrabold text-cta">Care</span>
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <Button size="sm" variant="outline" className="rounded-full border-border text-foreground hover:bg-muted" onClick={handleLogout}>
                تسجيل الخروج
              </Button>
            ) : (
              <Link to="/auth">
                <Button size="sm" variant="ghost" className="rounded-full w-10 h-10 p-0 bg-muted hover:bg-primary hover:text-primary-foreground transition-colors">
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