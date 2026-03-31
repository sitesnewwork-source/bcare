import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import heroInsuranceBg from "@/assets/hero-insurance-bg.jpg";
import FloatingParticles from "@/components/FloatingParticles";

const inputClasses =
  "w-full px-4 py-3.5 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("يرجى إدخال البريد الإلكتروني"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("تم إرسال رابط إعادة تعيين كلمة المرور");
    } catch {
      toast.error("حدث خطأ، يرجى المحاولة مرة أخرى");
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
          <h1 className="text-2xl font-bold text-foreground mb-6 text-center">نسيت كلمة المرور</h1>
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.</p>
              <Link to="/auth" className="text-cta hover:underline block">العودة لتسجيل الدخول</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">البريد الإلكتروني</label>
                <input className={inputClasses} type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-cta text-cta-foreground hover:bg-cta-hover text-base py-6 rounded-2xl font-bold">
                {loading ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
              </Button>
            </form>
          )}
        </div>
        <p className="text-center text-primary-foreground/60 text-sm mt-6">
          <Link to="/auth" className="text-cta hover:underline">العودة لتسجيل الدخول</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
