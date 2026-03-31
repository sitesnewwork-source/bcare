import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import heroInsuranceBg from "@/assets/hero-insurance-bg.jpg";
import FloatingParticles from "@/components/FloatingParticles";
import { useLanguage } from "@/i18n/LanguageContext";

const inputClasses =
  "w-full px-4 py-3.5 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all";

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { t } = useLanguage();
  const r = t.resetPw;

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      toast.error(r.invalidLink);
      navigate("/auth");
    }
  }, [navigate, r.invalidLink]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error(r.mismatch); return; }
    if (password.length < 6) { toast.error(r.tooShort); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success(r.success);
      navigate("/auth");
    } catch {
      toast.error(t.auth.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4">
      <img src={heroInsuranceBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-primary/50" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-72 h-72 bg-cta/8 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-cta/5 rounded-full blur-3xl" />
      </div>
      <FloatingParticles count={12} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <Link to="/" className="block text-center mb-8">
          <span className="text-3xl font-bold text-primary-foreground"><span>B</span><span className="text-cta">Care</span></span>
        </Link>
        <div className="bg-card/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-border/50">
          <h1 className="text-2xl font-bold text-foreground mb-6 text-center">{r.title}</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">{r.newPassword}</label>
              <input className={inputClasses} type="password" placeholder={r.newPassword} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">{r.confirmPassword}</label>
              <input className={inputClasses} type="password" placeholder={r.confirmPassword} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-cta text-cta-foreground hover:bg-cta-hover text-base py-6 rounded-2xl font-bold">
              {loading ? r.changing : r.changePassword}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
