import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Shield } from "lucide-react";
import heroInsuranceBg from "@/assets/hero-insurance-bg.jpg";
import BcareLogo from "@/assets/Bcare-logo.svg";
import FloatingParticles from "@/components/FloatingParticles";

const inputClasses =
  "w-full px-4 py-3.5 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", full_name: "", phone: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        if (!form.full_name || !form.email || !form.password) {
          toast.error("يرجى ملء جميع الحقول المطلوبة");
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: { full_name: form.full_name, phone: form.phone },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("تم إنشاء الحساب! تحقق من بريدك الإلكتروني لتأكيد الحساب");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        toast.success("تم تسجيل الدخول بنجاح!");
        navigate("/");
      }
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ، يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4">
      {/* Premium background */}
      <img src={heroInsuranceBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-primary/50" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-72 h-72 bg-cta/8 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-cta/5 rounded-full blur-3xl" />
      </div>
      <FloatingParticles count={12} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link to="/" className="block text-center mb-8">
          <img src={BcareLogo} alt="BCare" className="h-10 mx-auto brightness-0 invert" />
        </Link>

        {/* Card */}
        <div className="bg-card/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-border/50">
          {/* Tabs */}
          <div className="flex rounded-xl border border-border overflow-hidden mb-8">
            <button onClick={() => setMode("login")}
              className={`flex-1 py-3 text-sm font-bold transition-all ${mode === "login" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:text-foreground"}`}>
              تسجيل الدخول
            </button>
            <button onClick={() => setMode("signup")}
              className={`flex-1 py-3 text-sm font-bold transition-all ${mode === "signup" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:text-foreground"}`}>
              إنشاء حساب
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">الاسم الكامل *</label>
                  <input className={inputClasses} placeholder="الاسم الكامل" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">رقم الجوال</label>
                  <input className={inputClasses} placeholder="05xxxxxxxx" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">البريد الإلكتروني *</label>
              <input className={inputClasses} type="email" placeholder="example@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">كلمة المرور *</label>
              <div className="relative">
                <input className={inputClasses} type={showPassword ? "text" : "password"} placeholder="كلمة المرور" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {mode === "login" && (
              <Link to="/forgot-password" className="block text-sm text-cta hover:underline">نسيت كلمة المرور؟</Link>
            )}
            <Button type="submit" disabled={loading} className="w-full bg-cta text-cta-foreground hover:bg-cta-hover text-base py-6 rounded-2xl font-bold">
              {loading ? "جاري التحميل..." : mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"}
            </Button>
          </form>
        </div>

        <p className="text-center text-primary-foreground/60 text-sm mt-6">
          <Link to="/" className="text-cta hover:underline">العودة للرئيسية</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
