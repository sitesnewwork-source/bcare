import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import heroInsuranceBg from "@/assets/hero-insurance-bg.jpg";
import FloatingParticles from "@/components/FloatingParticles";
import { useLanguage } from "@/i18n/LanguageContext";

const inputClasses =
  "w-full px-4 py-3.5 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { t } = useLanguage();
  const f = t.forgotPw;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error(f.enterEmail); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success(f.sentSuccess);
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
          <h1 className="text-2xl font-bold text-foreground mb-6 text-center">{f.title}</h1>
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">{f.sent}</p>
              <Link to="/auth" className="text-cta hover:underline block">{f.backToLogin}</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">{t.auth.email}</label>
                <input className={inputClasses} type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-cta text-cta-foreground hover:bg-cta-hover text-base py-6 rounded-2xl font-bold">
                {loading ? f.sending : f.sendLink}
              </Button>
            </form>
          )}
        </div>
        <p className="text-center text-primary-foreground/60 text-sm mt-6">
          <Link to="/auth" className="text-cta hover:underline">{f.backToLogin}</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
